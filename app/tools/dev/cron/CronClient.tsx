'use client'

import { useEffect, useMemo, useState } from 'react'
import s from '../dev.module.css'

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type Field = { values: Set<number>; all: boolean }
type Parsed = {
  minute: Field
  hour: Field
  dom: Field
  month: Field
  dow: Field
  domRestricted: boolean
  dowRestricted: boolean
}
type FieldKind = 'minute' | 'hour' | 'dom' | 'month' | 'dow'

const DOW_KR = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_KR = ['', '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

const RANGES: Record<FieldKind, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dom: [1, 31],
  month: [1, 12],
  dow: [0, 7],
}

const ALIASES: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

// ─────────────────────────────────────────────
// 파서
// ─────────────────────────────────────────────
function parseField(raw: string, kind: FieldKind): Field {
  const [lo, hi] = RANGES[kind]
  const values = new Set<number>()
  let all = false
  for (const part of raw.split(',')) {
    let token = part.trim()
    if (token === '') throw new Error('빈 필드가 있습니다')
    let step = 1
    const slash = token.indexOf('/')
    if (slash !== -1) {
      step = parseInt(token.slice(slash + 1), 10)
      if (!Number.isInteger(step) || step <= 0) throw new Error(`스텝 값이 잘못되었습니다: ${part}`)
      token = token.slice(0, slash)
    }
    let start = lo
    let end = hi
    if (token === '*') {
      if (slash === -1) all = true
    } else if (token.includes('-')) {
      const seg = token.split('-')
      start = parseInt(seg[0], 10)
      end = parseInt(seg[1], 10)
      if (!Number.isInteger(start) || !Number.isInteger(end)) throw new Error(`범위 숫자가 잘못되었습니다: ${part}`)
    } else {
      start = parseInt(token, 10)
      if (!Number.isInteger(start)) throw new Error(`숫자가 아닙니다: ${part}`)
      end = slash === -1 ? start : hi
    }
    if (start < lo || end > hi || start > end) throw new Error(`${kind} 범위(${lo}~${hi})를 벗어났습니다: ${part}`)
    for (let v = start; v <= end; v += step) values.add(v)
  }
  if (kind === 'dow' && values.has(7)) {
    values.delete(7)
    values.add(0)
  }
  return { values, all }
}

function normalize(input: string): { expr: string; parts: string[] } {
  let expr = input.trim().toLowerCase().replace(/\s+/g, ' ')
  if (expr === '@reboot') throw new Error('@reboot 은 부팅 시점 실행이라 다음 시각을 계산할 수 없습니다')
  if (expr.startsWith('@')) {
    const mapped = ALIASES[expr]
    if (!mapped) throw new Error(`알 수 없는 별칭입니다: ${expr}`)
    expr = mapped
  }
  const parts = expr.split(' ')
  if (parts.length !== 5) throw new Error(`5개 필드(분 시 일 월 요일)가 필요합니다 — 현재 ${parts.length}개`)
  return { expr, parts }
}

function parse(input: string): { parsed: Parsed; parts: string[] } {
  const { parts } = normalize(input)
  const [mi, ho, dm, mo, dw] = parts
  const parsed: Parsed = {
    minute: parseField(mi, 'minute'),
    hour: parseField(ho, 'hour'),
    dom: parseField(dm, 'dom'),
    month: parseField(mo, 'month'),
    dow: parseField(dw, 'dow'),
    domRestricted: dm !== '*',
    dowRestricted: dw !== '*',
  }
  return { parsed, parts }
}

function matches(p: Parsed, d: Date): boolean {
  if (!p.minute.values.has(d.getMinutes())) return false
  if (!p.hour.values.has(d.getHours())) return false
  if (!p.month.values.has(d.getMonth() + 1)) return false
  const domOk = p.dom.values.has(d.getDate())
  const dowOk = p.dow.values.has(d.getDay())
  // Vixie/표준 cron: 일·요일 둘 다 제한이면 OR
  if (p.domRestricted && p.dowRestricted) return domOk || dowOk
  if (p.domRestricted) return domOk
  if (p.dowRestricted) return dowOk
  return true
}

function nextRuns(p: Parsed, from: Date, count: number): Date[] {
  const out: Date[] = []
  const cur = new Date(from.getTime())
  cur.setSeconds(0, 0)
  cur.setMinutes(cur.getMinutes() + 1) // 현재 분 다음부터
  const LIMIT = 366 * 24 * 60 * 5 // 약 5년치 분 — 무한루프 방지 상한
  let i = 0
  while (out.length < count && i < LIMIT) {
    if (matches(p, cur)) out.push(new Date(cur.getTime()))
    cur.setMinutes(cur.getMinutes() + 1)
    i++
  }
  return out
}

// ─────────────────────────────────────────────
// 한국어 자연어 해석
// ─────────────────────────────────────────────
function isFixed(token: string): boolean {
  return !token.includes('*') && !token.includes(',') && !token.includes('-') && !token.includes('/')
}

function timePhrase(mi: string, ho: string): string {
  const minFixed = isFixed(mi)
  const hourFixed = isFixed(ho)
  if (hourFixed && minFixed) {
    const h = parseInt(ho, 10)
    const m = parseInt(mi, 10)
    if (h === 0 && m === 0) return '자정(00:00)에'
    if (h === 12 && m === 0) return '정오(12:00)에'
    const ampm = h < 12 ? '오전' : '오후'
    const h12 = h % 12 === 0 ? 12 : h % 12
    const pad = String(m).padStart(2, '0')
    return m === 0 ? `${ampm} ${h12}시(${String(h).padStart(2, '0')}:00)에` : `${ampm} ${h12}시 ${m}분(${String(h).padStart(2, '0')}:${pad})에`
  }
  if (mi.startsWith('*/') && ho === '*') return `${mi.slice(2)}분마다`
  if (ho.startsWith('*/') && (mi === '0' || mi === '*')) return mi === '0' ? `${ho.slice(2)}시간마다(정각)` : `${ho.slice(2)}시간마다`
  if (ho === '*' && mi === '*') return '매분'
  if (ho === '*' && minFixed) return `매시 ${parseInt(mi, 10)}분에`
  if (hourFixed && mi === '*') {
    const h = parseInt(ho, 10)
    const ampm = h < 12 ? '오전' : '오후'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${ampm} ${h12}시대 매분`
  }
  // 그 외(범위·리스트 조합)는 원본 토큰 노출
  return `${ho}시 ${mi}분 조합에`
}

function dowLabel(token: string): string {
  return token.split(',').map(t => {
    if (t.includes('-')) {
      const seg = t.split('-').map(n => parseInt(n, 10))
      const a = seg[0] === 7 ? 0 : seg[0]
      const b = seg[1] === 7 ? 0 : seg[1]
      return `${DOW_KR[a]}~${DOW_KR[b]}요일`
    }
    let n = parseInt(t, 10)
    if (n === 7) n = 0
    return `${DOW_KR[n]}요일`
  }).join('·')
}

function describe(parts: string[]): string {
  const [mi, ho, dm, mo, dw] = parts
  const domAll = dm === '*'
  const dowAll = dw === '*'

  let dayPhrase: string
  if (domAll && dowAll) {
    dayPhrase = '매일'
  } else if (!dowAll && domAll) {
    if (dw === '1-5') dayPhrase = '평일(월~금)에'
    else if (dw === '0,6' || dw === '6,0' || dw === '0,7' || dw === '7,0' || dw === '6,7' || dw === '7,6') dayPhrase = '주말(토·일)에'
    else dayPhrase = `매주 ${dowLabel(dw)}에`
  } else if (dowAll && !domAll) {
    dayPhrase = `매월 ${dm}일에`
  } else {
    // 일·요일 둘 다 제한 → OR
    dayPhrase = `매월 ${dm}일 또는 매주 ${dowLabel(dw)}에(둘 중 하나라도 맞으면 실행)`
  }

  const monthPhrase = mo === '*'
    ? ''
    : (isFixed(mo) ? `${MONTH_KR[parseInt(mo, 10)]}에 한해 ` : `${mo}월에 한해 `)

  const time = timePhrase(mi, ho)
  // 매일 + 'N분마다' 같은 빈도 표현은 "매일"을 빼는 게 자연스럽다
  const freqStyle = /마다$/.test(time) || time === '매분'
  if (domAll && dowAll && freqStyle) {
    return `${monthPhrase}${time} 실행`.replace(/\s+/g, ' ').trim()
  }
  return `${monthPhrase}${dayPhrase} ${time} 실행`.replace(/\s+/g, ' ').trim()
}

// ─────────────────────────────────────────────
// 빌더 → 표현식
// ─────────────────────────────────────────────
type BuilderState = {
  minute: string
  hour: string
  dom: string
  month: string
  dow: string
}

const PRESETS: { label: string; expr: string }[] = [
  { label: '매분', expr: '* * * * *' },
  { label: '5분마다', expr: '*/5 * * * *' },
  { label: '매시 정각', expr: '0 * * * *' },
  { label: '매일 자정', expr: '0 0 * * *' },
  { label: '매일 오전 9시', expr: '0 9 * * *' },
  { label: '평일 오전 9시', expr: '0 9 * * 1-5' },
  { label: '매주 월요일 0시', expr: '0 0 * * 1' },
  { label: '매월 1일 자정', expr: '0 0 1 * *' },
  { label: '매주 일요일 0시', expr: '0 0 * * 0' },
  { label: '매년 1/1 0시', expr: '0 0 1 1 *' },
]

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CronClient() {
  const [input, setInput] = useState('0 9 * * 1-5')
  const [count, setCount] = useState(5)
  const [now, setNow] = useState<Date | null>(null)
  const [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<'parse' | 'build'>('parse')

  // 빌더 상태
  const [b, setB] = useState<BuilderState>({ minute: '0', hour: '9', dom: '*', month: '*', dow: '1-5' })

  // 클라이언트 현재 시각 (1분마다 갱신 → 다음 실행 목록 신선하게)
  useEffect(() => {
    setNow(new Date())
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  // 빌더 → 표현식 동기 (빌더 탭에서 input 갱신)
  useEffect(() => {
    if (mode !== 'build') return
    const expr = `${b.minute || '*'} ${b.hour || '*'} ${b.dom || '*'} ${b.month || '*'} ${b.dow || '*'}`
    setInput(expr)
  }, [b, mode])

  const result = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return { ok: false as const, error: '' }
    try {
      const { parsed, parts } = parse(input)
      const desc = describe(parts)
      const runs = now ? nextRuns(parsed, now, count) : []
      return { ok: true as const, desc, runs, parts }
    } catch (e) {
      return { ok: false as const, error: (e as Error).message }
    }
  }, [input, count, now])

  function applyPreset(expr: string) {
    setMode('parse')
    setInput(expr)
    // 빌더에도 반영
    const p = expr.split(' ')
    if (p.length === 5) setB({ minute: p[0], hour: p[1], dom: p[2], month: p[3], dow: p[4] })
  }

  function copyExpr() {
    if (!input.trim()) return
    navigator.clipboard.writeText(input.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const fmtRun = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      dow: DOW_KR[d.getDay()],
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    }
  }

  return (
    <div className={s.wrap}>
      {/* 모드 탭 */}
      <div className={`${s.tabs}`} style={{ gridTemplateColumns: '1fr 1fr' }}>
        <button className={`${s.tabBtn} ${mode === 'parse' ? s.tabActive : ''}`} onClick={() => setMode('parse')} type="button">
          표현식 해석
        </button>
        <button className={`${s.tabBtn} ${mode === 'build' ? s.tabActive : ''}`} onClick={() => setMode('build')} type="button">
          빌더로 만들기
        </button>
      </div>

      {/* ─── 빌더 ─── */}
      {mode === 'build' && (
        <div className={s.card}>
          <div className={s.cardTop}>
            <label className={s.cardLabel}>필드별 선택 (변경 시 표현식 자동 생성)</label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            <BuilderSelect
              label="분"
              value={b.minute}
              onChange={v => setB(s => ({ ...s, minute: v }))}
              options={[
                { v: '*', t: '매분' },
                { v: '0', t: '0분(정각)' },
                { v: '15', t: '15분' },
                { v: '30', t: '30분' },
                { v: '45', t: '45분' },
                { v: '*/5', t: '5분마다' },
                { v: '*/10', t: '10분마다' },
                { v: '*/15', t: '15분마다' },
                { v: '*/30', t: '30분마다' },
              ]}
            />
            <BuilderSelect
              label="시"
              value={b.hour}
              onChange={v => setB(s => ({ ...s, hour: v }))}
              options={[
                { v: '*', t: '매시' },
                ...Array.from({ length: 24 }, (_, h) => ({ v: String(h), t: `${h}시` })),
                { v: '*/2', t: '2시간마다' },
                { v: '*/6', t: '6시간마다' },
                { v: '9-18', t: '9~18시' },
              ]}
            />
            <BuilderSelect
              label="일"
              value={b.dom}
              onChange={v => setB(s => ({ ...s, dom: v }))}
              options={[
                { v: '*', t: '매일' },
                { v: '1', t: '1일' },
                { v: '15', t: '15일' },
                { v: 'L', t: '말일(L)*' },
                { v: '1,15', t: '1·15일' },
                { v: '*/2', t: '2일마다' },
              ].filter(o => o.v !== 'L')}
            />
            <BuilderSelect
              label="월"
              value={b.month}
              onChange={v => setB(s => ({ ...s, month: v }))}
              options={[
                { v: '*', t: '매월' },
                ...Array.from({ length: 12 }, (_, i) => ({ v: String(i + 1), t: `${i + 1}월` })),
                { v: '*/3', t: '분기(3개월)마다' },
              ]}
            />
            <BuilderSelect
              label="요일"
              value={b.dow}
              onChange={v => setB(s => ({ ...s, dow: v }))}
              options={[
                { v: '*', t: '매일' },
                { v: '1-5', t: '평일(월~금)' },
                { v: '0,6', t: '주말(토·일)' },
                { v: '1', t: '월요일' },
                { v: '2', t: '화요일' },
                { v: '3', t: '수요일' },
                { v: '4', t: '목요일' },
                { v: '5', t: '금요일' },
                { v: '6', t: '토요일' },
                { v: '0', t: '일요일' },
              ]}
            />
          </div>
        </div>
      )}

      {/* ─── 표현식 입력 ─── */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel} htmlFor="cron-input">cron 표현식 (분 시 일 월 요일)</label>
          <button className={s.copyBtn} onClick={copyExpr} type="button">
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>
        <input
          id="cron-input"
          type="text"
          className={`${s.textarea} ${!result.ok && input.trim() ? s.inputInvalid : ''}`}
          style={{ resize: 'none', minHeight: 'unset', height: 'auto', padding: '14px 16px', fontSize: 18, letterSpacing: '0.04em' }}
          value={input}
          onChange={e => { setMode('parse'); setInput(e.target.value) }}
          placeholder="0 9 * * 1-5"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        <div className={s.subActionRow} style={{ marginTop: 10 }}>
          {PRESETS.map(p => (
            <button key={p.expr} className={s.subActionBtn} onClick={() => applyPreset(p.expr)} type="button" title={p.expr}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 결과 (role=status) ─── */}
      <div role="status" aria-live="polite">
        {!input.trim() && (
          <div className={s.card} style={{ color: 'var(--muted)', fontSize: 14 }}>
            표현식을 입력하거나 위 프리셋·빌더를 사용하세요.
          </div>
        )}

        {input.trim() && !result.ok && (
          <div className={s.errorBox}>
            <strong>해석할 수 없습니다</strong>
            <p>{result.error || '표현식을 확인하세요.'}</p>
          </div>
        )}

        {result.ok && (
          <>
            {/* 자연어 해석 */}
            <div className={s.meaningCard} style={{ fontSize: 15, padding: '14px 18px' }}>
              📝 <strong style={{ fontSize: 16 }}>{result.desc}</strong>
            </div>

            {/* 필드 분해 */}
            <div className={s.card} style={{ marginTop: 10 }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>필드 분해</label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {([
                  ['분', result.parts[0]],
                  ['시', result.parts[1]],
                  ['일', result.parts[2]],
                  ['월', result.parts[3]],
                  ['요일', result.parts[4]],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{k}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--accent)', marginTop: 3, wordBreak: 'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 다음 실행 시각 */}
            <div className={s.card} style={{ marginTop: 10 }}>
              <div className={s.cardTop}>
                <label className={s.cardLabel}>다음 실행 시각 (KST · 내 기기 시간 기준)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[5, 10].map(n => (
                    <button
                      key={n}
                      className={`${s.subActionBtn} ${count === n ? s.subActionBtnActive : ''}`}
                      onClick={() => setCount(n)}
                      type="button"
                    >
                      {n}회
                    </button>
                  ))}
                </div>
              </div>
              {!now ? (
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>현재 시각을 불러오는 중…</p>
              ) : result.runs.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  향후 5년 내 실행 시각이 없습니다. 표현식을 다시 확인하세요.
                </p>
              ) : (
                <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.runs.map((d, i) => {
                    const f = fmtRun(d)
                    return (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 10,
                          padding: '8px 12px',
                          background: 'var(--bg3)',
                          borderRadius: 8,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 22 }}>{i + 1}.</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{f.date}</span>
                        <span style={{ fontSize: 12, color: 'var(--accent)' }}>({f.dow})</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#0891B2', marginLeft: 'auto' }}>{f.time}</span>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          </>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 2 }}>
        표준 5필드 cron 기준입니다. 다음 실행 시각은 브라우저(이 기기)의 현재 시간으로 계산하며, 한국에서 접속하면 KST(UTC+9)입니다.
        서버는 자체 타임존을 쓰므로 실제 환경의 TZ 설정과 다를 수 있습니다.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// 빌더 셀렉트
// ─────────────────────────────────────────────
function BuilderSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { v: string; t: string }[]
}) {
  const has = options.some(o => o.v === value)
  return (
    <div>
      <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{label}</span>
      <select
        value={has ? value : '__custom'}
        onChange={e => { if (e.target.value !== '__custom') onChange(e.target.value) }}
        className={s.textarea}
        style={{ resize: 'none', minHeight: 'unset', height: 'auto', padding: '10px 10px', fontSize: 16, fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
      >
        {options.map(o => (
          <option key={o.v} value={o.v}>{o.t} ({o.v})</option>
        ))}
        {!has && <option value="__custom">직접 입력: {value}</option>}
      </select>
    </div>
  )
}
