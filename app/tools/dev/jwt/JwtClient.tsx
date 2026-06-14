'use client'

import { useMemo, useState } from 'react'
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
  return KST_FMT.format(new Date(epochSeconds * 1000)) + ' (KST)'
}

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
      const digits = Math.trunc(Math.abs(rawValue)).toString().length
      if (digits >= 13) {
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
  const trimmed = token.trim().replace(/^Bearer\s+/i, '')
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

  // exp 상태 판정
  let expStatus: ExpStatus = { kind: 'none' }
  if (payload.ok && typeof payload.obj.exp === 'number') {
    let expSec = payload.obj.exp
    const digits = Math.trunc(Math.abs(expSec)).toString().length
    if (digits >= 13) expSec = expSec / 1000 // ms 추정 시 초로 환산
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

  // 마운트 시각 기준 — exp 비교용 (재렌더마다 흔들리지 않게 token 의존)
  const result = useMemo(() => {
    const nowSec = Math.floor(Date.now() / 1000)
    return decodeJwt(token, nowSec)
  }, [token])

  function copyValue(val: string, key: string) {
    if (!val) return
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(val)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(''), 1500)
    }
  }

  return (
    <div className={s.wrap}>
      {/* 보안 고지 */}
      <div style={{
        background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.30)', borderRadius: 12,
        padding: '12px 16px', fontSize: 13, color: 'var(--text)', lineHeight: 1.75,
      }}>
        <strong style={{ color: '#0891B2' }}>🔒 서명을 검증하지 않습니다.</strong> 토큰의 진위는 서버에서 비밀키로 검증해야 합니다.
        입력값은 브라우저에서만 처리되어 서버로 전송되지 않습니다.
      </div>

      {/* 입력 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel} htmlFor="jwt-input">JWT 붙여넣기</label>
          {token && <button className={s.clearBtn} onClick={() => setToken('')} type="button">지우기</button>}
        </div>
        <textarea
          id="jwt-input"
          className={s.textarea}
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1Ni... 형태의 JWT를 붙여넣으세요 (Bearer 접두사는 자동 제거)"
          spellCheck={false}
          style={{ minHeight: 120, fontSize: 16 }}
        />
        <div className={s.subActionRow} style={{ marginTop: 10 }}>
          <button className={s.subActionBtn} onClick={() => setToken(SAMPLE_JWT)} type="button">샘플 JWT 넣기</button>
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
            <div className={`${s.card}`} style={{ borderLeft: '3px solid #DC2626' }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel} style={{ color: '#DC2626' }}>① Header — 알고리즘·타입</label>
                {result.header.ok && (
                  <button className={s.copyBtn} onClick={() => copyValue(result.header.ok ? result.header.prettyText : '', 'header')} type="button">
                    {copiedKey === 'header' ? '✓ 복사됨' : '복사'}
                  </button>
                )}
              </div>
              {result.header.ok ? (
                <ClaimTable rows={result.header.rows} accent="#DC2626" />
              ) : (
                <p style={{ fontSize: 13, color: '#DC2626', fontFamily: 'var(--font-mono)' }}>JSON 파싱 실패 — 원문: {result.header.raw}</p>
              )}
            </div>

            {/* PAYLOAD */}
            <div className={`${s.card}`} style={{ borderLeft: '3px solid var(--accent)' }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel} style={{ color: 'var(--accent)' }}>② Payload — 클레임</label>
                {result.payload.ok && (
                  <button className={s.copyBtn} onClick={() => copyValue(result.payload.ok ? result.payload.prettyText : '', 'payload')} type="button">
                    {copiedKey === 'payload' ? '✓ 복사됨' : '복사'}
                  </button>
                )}
              </div>
              {result.payload.ok ? (
                <ClaimTable rows={result.payload.rows} accent="var(--accent)" />
              ) : (
                <p style={{ fontSize: 13, color: '#DC2626', fontFamily: 'var(--font-mono)' }}>JSON 파싱 실패 — 원문: {result.payload.raw}</p>
              )}
            </div>

            {/* SIGNATURE */}
            <div className={`${s.card}`} style={{ borderLeft: '3px solid #0891B2' }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel} style={{ color: '#0891B2' }}>③ Signature — 서명 (검증 안 함)</label>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)',
                wordBreak: 'break-all', lineHeight: 1.7, background: 'var(--bg3)',
                padding: '10px 12px', borderRadius: 8,
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
    valid:   { bg: 'rgba(5,150,105,0.10)',  bd: 'rgba(5,150,105,0.35)',  fg: '#059669', icon: '✓', title: '유효 (만료 전)' },
    soon:    { bg: 'rgba(217,119,6,0.10)',  bd: 'rgba(217,119,6,0.40)',  fg: '#D97706', icon: '⏳', title: '만료 임박 (5분 이내)' },
    expired: { bg: 'rgba(220,38,38,0.10)',  bd: 'rgba(220,38,38,0.40)',  fg: '#DC2626', icon: '⚠️', title: '만료됨' },
  } as const
  const c = styleMap[status.kind]
  let detail = ''
  if (status.kind === 'valid') detail = `만료까지 ${status.remain} 남음 · ${status.kst}`
  else if (status.kind === 'soon') detail = `만료까지 ${status.remain} 남음 · ${status.kst}`
  else if (status.kind === 'expired') detail = `${status.ago} 전에 만료됨 · ${status.kst}`
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.bd}`, borderRadius: 12,
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
                  <span style={{ display: 'block', marginTop: 4, color: '#0891B2', fontSize: 12 }}>
                    🕒 {r.kst}
                    {r.msHint && <span style={{ color: '#D97706', marginLeft: 6 }}>· 13자리(밀리초 추정)</span>}
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
