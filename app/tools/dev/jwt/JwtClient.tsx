'use client'

import { useEffect, useMemo, useState } from 'react'
import s from '../dev.module.css'

// ─────────────────────────────────────────────
// Base64URL 디코드
// JWT는 Base64URL 인코딩(RFC 7515): '+' → '-', '/' → '_', 패딩('=') 제거
// 디코드 시 역변환 + 패딩 복원 후 atob, 그리고 UTF-8 복원
// ─────────────────────────────────────────────
function base64UrlDecode(input: string): string {
  let str = input.replace(/-/g, '+').replace(/_/g, '/')
  // 패딩 복원 (4의 배수가 되도록 '=' 채움)
  const pad = str.length % 4
  if (pad === 2) str += '=='
  else if (pad === 3) str += '='
  else if (pad === 1) throw new Error('잘못된 Base64URL 길이입니다.')
  // atob → 바이트열 → UTF-8 디코드 (한글 등 멀티바이트 복원)
  const binary = atob(str)
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

// JSON 파싱 후 보기 좋게(2칸 들여쓰기) 정렬
function prettyJson(raw: string): { ok: true; obj: Record<string, unknown>; text: string } | { ok: false; raw: string } {
  try {
    const obj = JSON.parse(raw)
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, raw }
    }
    return { ok: true, obj: obj as Record<string, unknown>, text: JSON.stringify(obj, null, 2) }
  } catch {
    return { ok: false, raw }
  }
}

// ─────────────────────────────────────────────
// 시간 클레임 (epoch seconds) → KST 사람이 읽는 시각
// ─────────────────────────────────────────────
const KST_FMT = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
})

function formatKst(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000)
  // Date 표현 범위(±8.64e15ms)를 넘으면 Intl.format이 RangeError를 던짐 → 도구 전체 오류 화면 방지
  if (!Number.isFinite(d.getTime())) return '표시 범위 밖 시각'
  return KST_FMT.format(d) + ' (KST)'
}

/* 13자리 이상(≥1e12)은 밀리초로 추정 — toString 자릿수는 1e21부터 지수 표기라 크기로 판정 */
const isMsEpoch = (v: number) => Math.abs(v) >= 1e12

// 남은 시간/경과 시간 사람 표기
function humanizeDuration(totalSeconds: number): string {
  const sec = Math.abs(Math.floor(totalSeconds))
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const sParts: string[] = []
  if (d > 0) sParts.push(`${d}일`)
  if (h > 0) sParts.push(`${h}시간`)
  if (m > 0) sParts.push(`${m}분`)
  if (sParts.length === 0) sParts.push(`${sec % 60}초`)
  return sParts.slice(0, 2).join(' ')
}

// 표준 클레임 한국어 라벨 + 설명
const STANDARD_CLAIMS: Record<string, { ko: string; desc: string }> = {
  iss: { ko: '발급자 (Issuer)', desc: '토큰을 발급한 주체' },
  sub: { ko: '주체 (Subject)', desc: '토큰이 가리키는 대상 — 보통 사용자 ID' },
  aud: { ko: '대상자 (Audience)', desc: '토큰을 받기로 한 수신자' },
  exp: { ko: '만료 시각 (Expiration)', desc: '이 시각 이후 토큰은 무효' },
  nbf: { ko: '활성 시각 (Not Before)', desc: '이 시각 이전에는 토큰 사용 불가' },
  iat: { ko: '발급 시각 (Issued At)', desc: '토큰이 생성된 시각' },
  jti: { ko: '토큰 ID (JWT ID)', desc: '재사용 방지를 위한 고유 식별자' },
}

const HEADER_CLAIMS: Record<string, { ko: string; desc: string }> = {
  alg: { ko: '서명 알고리즘 (Algorithm)', desc: 'HS256·RS256 등 서명에 쓰인 방식' },
  typ: { ko: '타입 (Type)', desc: '보통 JWT' },
  kid: { ko: '키 ID (Key ID)', desc: '검증에 쓸 공개키를 가리키는 식별자' },
  cty: { ko: '콘텐츠 타입 (Content Type)', desc: '페이로드의 미디어 타입' },
}

const TIME_CLAIMS = new Set(['exp', 'iat', 'nbf'])

// ─────────────────────────────────────────────
// 디코드 결과 타입
// ─────────────────────────────────────────────
type ClaimRow = {
  key: string
  rawValue: unknown
  display: string
  label: string | null
  desc: string | null
  isTime: boolean
  kst?: string
  msHint?: boolean // 13자리 → 밀리초 추정
}

type ExpStatus =
  | { kind: 'valid'; remain: string; kst: string }
  | { kind: 'soon'; remain: string; kst: string }
  | { kind: 'expired'; ago: string; kst: string }
  | { kind: 'notyet'; wait: string; kst: string; expKst?: string }
  | { kind: 'none' }

type DecodedPart = {
  ok: true
  obj: Record<string, unknown>
  prettyText: string
  rows: ClaimRow[]
} | {
  ok: false
  raw: string
}

type DecodeResult =
  | { state: 'empty' }
  | { state: 'error'; message: string }
  | {
      state: 'ok'
      partCount: number
      header: DecodedPart
      payload: DecodedPart
      signature: string
      expStatus: ExpStatus
    }

function valueToDisplay(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (v === null) return 'null'
  return JSON.stringify(v)
}

function buildRows(obj: Record<string, unknown>, labels: Record<string, { ko: string; desc: string }>): ClaimRow[] {
  return Object.keys(obj).map(key => {
    const rawValue = obj[key]
    const meta = labels[key] ?? null
    const isTime = TIME_CLAIMS.has(key) && typeof rawValue === 'number'
    let kst: string | undefined
    let msHint: boolean | undefined
    if (isTime && typeof rawValue === 'number') {
      // 13자리(밀리초 추정): 1e12 이상이면 ms로 보고 초로 환산해 표기
      if (isMsEpoch(rawValue)) {
        msHint = true
        kst = formatKst(rawValue / 1000)
      } else {
        kst = formatKst(rawValue)
      }
    }
    return {
      key,
      rawValue,
      display: valueToDisplay(rawValue),
      label: meta ? meta.ko : null,
      desc: meta ? meta.desc : null,
      isTime,
      kst,
      msHint,
    }
  })
}

function decodeJwt(token: string, nowSec: number): DecodeResult {
  // 터미널·로그에서 복사하며 섞인 줄바꿈·공백 제거 (JWT에는 공백 문자가 없음)
  const trimmed = token.trim().replace(/^Bearer\s+/i, '').replace(/\s+/g, '')
  if (trimmed === '') return { state: 'empty' }

  const parts = trimmed.split('.')
  if (parts.length === 1) {
    return { state: 'error', message: '점(.)으로 구분된 부분이 없습니다. JWT는 header.payload.signature 형태입니다.' }
  }
  if (parts.length === 2) {
    return { state: 'error', message: '2개 부분만 있습니다. JWT는 점(.) 2개로 나뉜 3개 부분이어야 합니다 (서명 부분 누락).' }
  }
  if (parts.length > 3) {
    return { state: 'error', message: `점(.)이 너무 많습니다 (부분 ${parts.length}개). 표준 JWT는 3개 부분입니다.` }
  }

  const [headerB64, payloadB64, signatureB64] = parts

  function decodePart(b64: string, labels: Record<string, { ko: string; desc: string }>): DecodedPart {
    let raw: string
    try {
      raw = base64UrlDecode(b64)
    } catch {
      return { ok: false, raw: '(Base64URL 디코드 실패)' }
    }
    const parsed = prettyJson(raw)
    if (!parsed.ok) return { ok: false, raw }
    return {
      ok: true,
      obj: parsed.obj,
      prettyText: parsed.text,
      rows: buildRows(parsed.obj, labels),
    }
  }

  const header = decodePart(headerB64, HEADER_CLAIMS)
  const payload = decodePart(payloadB64, STANDARD_CLAIMS)

  // exp·nbf 상태 판정 (만료 > 활성 전 > 임박 > 유효 순)
  const toSec = (v: unknown): number | null => {
    if (typeof v !== 'number' || !Number.isFinite(v)) return null
    return isMsEpoch(v) ? v / 1000 : v // ms 추정 시 초로 환산
  }
  let expStatus: ExpStatus = { kind: 'none' }
  const expSec = payload.ok ? toSec(payload.obj.exp) : null
  const nbfSec = payload.ok ? toSec(payload.obj.nbf) : null
  if (expSec !== null) {
    const diff = expSec - nowSec
    const kst = formatKst(expSec)
    if (diff <= 0) {
      expStatus = { kind: 'expired', ago: humanizeDuration(diff), kst }
    } else if (diff <= 300) {
      // 5분 이내 임박
      expStatus = { kind: 'soon', remain: humanizeDuration(diff), kst }
    } else {
      expStatus = { kind: 'valid', remain: humanizeDuration(diff), kst }
    }
  }
  if (nbfSec !== null && nbfSec > nowSec && expStatus.kind !== 'expired') {
    expStatus = {
      kind: 'notyet',
      wait: humanizeDuration(nbfSec - nowSec),
      kst: formatKst(nbfSec),
      expKst: expStatus.kind === 'none' ? undefined : expStatus.kst,
    }
  }

  return {
    state: 'ok',
    partCount: 3,
    header,
    payload,
    signature: signatureB64,
    expStatus,
  }
}

// 샘플 JWT — exp가 먼 미래(2033년)인 HS256 토큰 (서명은 디코드 시연용·검증 안 함)
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Iu2Zjeq4uOuPmSIsImlzcyI6Imh0dHBzOi8veW91dGlsLmtyIiwiaWF0IjoxNzE4MjQ4NDAwLCJleHAiOjIwMDAwMDAwMDAsImp0aSI6ImFiYzEyMyJ9' +
  '.dummysignature_not_verified_by_this_tool'

export default function JwtClient() {
  const [token, setToken] = useState<string>('')
  const [copiedKey, setCopiedKey] = useState<string>('')

  // 현재 시각 — 30초마다 갱신해 만료 배지(남은 시간·임박·만료)가 붙여넣은 시점에 멈추지 않게
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000))
  useEffect(() => {
    if (!token) return
    const id = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 30_000)
    return () => clearInterval(id)
  }, [token])
  // 토큰을 바꾸는 모든 경로에서 기준 시각도 함께 갱신 — 페이지를 오래 열어 둔 뒤 붙여넣어도 즉시 정확한 만료 판정
  function updateToken(v: string) {
    setToken(v)
    setNowSec(Math.floor(Date.now() / 1000))
  }

  const result = useMemo((): DecodeResult => {
    try {
      return decodeJwt(token, nowSec)
    } catch (e) {
      // 예상 못 한 값으로 예외가 나도 입력한 토큰이 사라지지 않게 오류 상태로 표시
      return { state: 'error', message: `디코드 중 오류: ${e instanceof Error ? e.message : String(e)}` }
    }
  }, [token, nowSec])

  function copyValue(val: string, key: string) {
    if (!val) return
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(val).then(() => {
        setCopiedKey(key)
        setTimeout(() => setCopiedKey(''), 1500)
      }).catch(() => {
        setCopiedKey(`${key}:fail`)
        setTimeout(() => setCopiedKey(''), 1500)
      })
    }
  }

  return (
    <div className={s.wrap}>
      {/* 보안 고지 */}
      <div style={{
        background: 'color-mix(in srgb, var(--cyan-600) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--cyan-600) 30%, transparent)', borderRadius: 'var(--radius-m)',
        padding: '12px 16px', fontSize: 13, color: 'var(--text)', lineHeight: 1.75,
      }}>
        <strong style={{ color: 'var(--cyan-600)' }}>🔒 서명을 검증하지 않습니다.</strong> 토큰의 진위는 서버에서 비밀키로 검증해야 합니다.
        입력값은 브라우저에서만 처리되어 서버로 전송되지 않습니다.
      </div>

      {/* 입력 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel} htmlFor="jwt-input">JWT 붙여넣기</label>
          {token && <button className={s.clearBtn} onClick={() => updateToken('')} type="button">지우기</button>}
        </div>
        <textarea
          id="jwt-input"
          className={s.textarea}
          value={token}
          onChange={e => updateToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1Ni... 형태의 JWT를 붙여넣으세요 (Bearer 접두사는 자동 제거)"
          spellCheck={false}
          style={{ minHeight: 120, fontSize: 16 }}
        />
        <div className={s.subActionRow} style={{ marginTop: 10 }}>
          <button className={s.subActionBtn} onClick={() => updateToken(SAMPLE_JWT)} type="button">샘플 JWT 넣기</button>
        </div>
      </div>

      {/* 결과 */}
      <div role="status" aria-live="polite">
        {result.state === 'error' && (
          <div className={s.errorBox}>
            <strong>디코드할 수 없습니다</strong>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>{result.message}</p>
          </div>
        )}

        {result.state === 'ok' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* exp 상태 배지 */}
            {result.expStatus.kind !== 'none' && (
              <ExpBadge status={result.expStatus} />
            )}

            {/* HEADER */}
            <div className={`${s.card}`} style={{ borderLeft: '3px solid var(--red-600)' }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel} style={{ color: 'var(--red-600)' }}>① Header — 알고리즘·타입</label>
                {result.header.ok && (
                  <button className={s.copyBtn} onClick={() => copyValue(result.header.ok ? result.header.prettyText : '', 'header')} type="button">
                    {copiedKey === 'header' ? '✓ 복사됨' : copiedKey === 'header:fail' ? '복사 실패' : '복사'}
                  </button>
                )}
              </div>
              {result.header.ok ? (
                <ClaimTable rows={result.header.rows} accent="var(--red-600)" />
              ) : (
                <p style={{ fontSize: 13, color: 'var(--red-600)', fontFamily: 'var(--font-mono)' }}>JSON 파싱 실패 — 원문: {result.header.raw}</p>
              )}
            </div>

            {/* PAYLOAD */}
            <div className={`${s.card}`} style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel} style={{ color: 'var(--accent)' }}>② Payload — 클레임</label>
                {result.payload.ok && (
                  <button className={s.copyBtn} onClick={() => copyValue(result.payload.ok ? result.payload.prettyText : '', 'payload')} type="button">
                    {copiedKey === 'payload' ? '✓ 복사됨' : copiedKey === 'payload:fail' ? '복사 실패' : '복사'}
                  </button>
                )}
              </div>
              {result.payload.ok ? (
                <ClaimTable rows={result.payload.rows} accent="var(--accent)" />
              ) : (
                <p style={{ fontSize: 13, color: 'var(--red-600)', fontFamily: 'var(--font-mono)' }}>JSON 파싱 실패 — 원문: {result.payload.raw}</p>
              )}
            </div>

            {/* SIGNATURE */}
            <div className={`${s.card}`} style={{ borderLeft: '3px solid var(--cyan-600)' }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel} style={{ color: 'var(--cyan-600)' }}>③ Signature — 서명 (검증 안 함)</label>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)',
                wordBreak: 'break-all', lineHeight: 1.7, background: 'var(--bg3)',
                padding: '10px 12px', borderRadius: 'var(--radius-s)',
              }}>
                {result.signature || '(빈 서명)'}
              </p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                서명은 header·payload와 비밀키(또는 개인키)로 만들어집니다. 이 값이 올바른지 확인하려면
                같은 비밀키가 있는 서버가 필요합니다 — 브라우저만으로는 진위를 알 수 없습니다.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 만료 상태 배지
// ─────────────────────────────────────────────
function ExpBadge({ status }: { status: ExpStatus }) {
  if (status.kind === 'none') return null
  const styleMap = {
    valid:   { bg: 'rgba(5,150,105,0.10)',  bd: 'rgba(5,150,105,0.35)',  fg: 'var(--emerald-600)', icon: '✓', title: '유효 (만료 전)' },
    soon:    { bg: 'rgba(217,119,6,0.10)',  bd: 'rgba(217,119,6,0.40)',  fg: 'var(--amber-600)', icon: '⏳', title: '만료 임박 (5분 이내)' },
    expired: { bg: 'rgba(220,38,38,0.10)',  bd: 'rgba(220,38,38,0.40)',  fg: 'var(--red-600)', icon: '⚠️', title: '만료됨' },
    notyet:  { bg: 'color-mix(in srgb, var(--warning) 10%, transparent)', bd: 'color-mix(in srgb, var(--warning) 40%, transparent)', fg: 'var(--warning)', icon: '…', title: '아직 사용 전 (nbf 이전)' },
  } as const
  const c = styleMap[status.kind]
  let detail = ''
  if (status.kind === 'valid') detail = `만료까지 ${status.remain} 남음 · ${status.kst}`
  else if (status.kind === 'soon') detail = `만료까지 ${status.remain} 남음 · ${status.kst}`
  else if (status.kind === 'expired') detail = `${status.ago} 전에 만료됨 · ${status.kst}`
  else if (status.kind === 'notyet') detail = `${status.wait} 뒤부터 사용 가능 · ${status.kst}${status.expKst ? ` · 만료 ${status.expKst}` : ''}`
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.bd}`, borderRadius: 'var(--radius-m)',
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 20 }}>{c.icon}</span>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: c.fg, marginBottom: 2 }}>{c.title}</p>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{detail}</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 클레임 표
// ─────────────────────────────────────────────
function ClaimTable({ rows, accent }: { rows: ClaimRow[]; accent: string }) {
  if (rows.length === 0) {
    return <p style={{ fontSize: 13, color: 'var(--muted)' }}>클레임이 없습니다.</p>
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['키', '값', '의미'].map((h, i) => (
              <th scope="col" key={i} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 11 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', verticalAlign: 'top' }}>
              <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: accent, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.key}</td>
              <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--text)', wordBreak: 'break-all' }}>
                {r.display}
                {r.isTime && r.kst && (
                  <span style={{ display: 'block', marginTop: 4, color: 'var(--cyan-600)', fontSize: 12 }}>
                    🕒 {r.kst}
                    {r.msHint && <span style={{ color: 'var(--amber-600)', marginLeft: 6 }}>· 13자리(밀리초 추정)</span>}
                  </span>
                )}
              </td>
              <td style={{ padding: '8px 10px', color: 'var(--muted)', fontSize: 12, lineHeight: 1.6 }}>
                {r.label ? <><strong style={{ color: 'var(--text)', fontWeight: 600 }}>{r.label}</strong><br />{r.desc}</> : <span style={{ color: 'var(--muted)' }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
