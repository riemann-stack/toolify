'use client'

import { useMemo, useState } from 'react'
import styles from './time-unit.module.css'

// ──────────────────────────────────────
// 단위 정의
// ──────────────────────────────────────
type Unit = 'sec' | 'min' | 'hour' | 'day' | 'week' | 'month' | 'year' | 'decade' | 'century'

const TIME_TO_SEC: Record<Unit, number> = {
  sec:     1,
  min:     60,
  hour:    3600,
  day:     86400,
  week:    604800,
  month:   2592000,    // 30일 기준
  year:    31536000,   // 365일 기준
  decade:  315360000,
  century: 3153600000,
}

const UNIT_META: { id: Unit; label: string; short: string }[] = [
  { id: 'sec',     label: '초',    short: 's' },
  { id: 'min',     label: '분',    short: 'min' },
  { id: 'hour',    label: '시간',  short: 'h' },
  { id: 'day',     label: '일',    short: 'd' },
  { id: 'week',    label: '주',    short: 'w' },
  { id: 'month',   label: '월',    short: 'mo' },
  { id: 'year',    label: '년',    short: 'y' },
  { id: 'decade',  label: '10년',  short: '10y' },
  { id: 'century', label: '100년', short: '100y' },
]

const UNIT_NOTE: Partial<Record<Unit, string>> = {
  month: '30일 기준',
  year:  '365일 기준',
}

// ──────────────────────────────────────
// 프리셋
// ──────────────────────────────────────
const PRESETS: { label: string; value: number; unit: Unit }[] = [
  { label: '1시간',     value: 1,    unit: 'hour' },
  { label: '8시간',     value: 8,    unit: 'hour' },
  { label: '24시간',    value: 24,   unit: 'hour' },
  { label: '72시간',    value: 72,   unit: 'hour' },
  { label: '1주일',     value: 1,    unit: 'week' },
  { label: '한 달',     value: 1,    unit: 'month' },
  { label: '1년',       value: 1,    unit: 'year' },
  { label: '10000시간', value: 10000, unit: 'hour' },
]

// ──────────────────────────────────────
// 변환·포맷
// ──────────────────────────────────────
function convert(value: number, from: Unit, to: Unit): number {
  const seconds = value * TIME_TO_SEC[from]
  return seconds / TIME_TO_SEC[to]
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return '0'
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 1e9)    return n.toExponential(3)
  if (abs >= 1000)   return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (abs >= 100)    return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (abs >= 1)      return n.toLocaleString('en-US', { maximumFractionDigits: 3 })
  if (abs >= 0.001)  return n.toLocaleString('en-US', { maximumFractionDigits: 5 })
  return n.toExponential(3)
}

// ──────────────────────────────────────
// Component
// ──────────────────────────────────────
export default function TimeUnitClient() {
  const [tab, setTab] = useState<'general' | 'work'>('general')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'general' ? styles.tabActive : ''}`} onClick={() => setTab('general')}>⏱️ 일반 변환</button>
        <button className={`${styles.tab} ${tab === 'work' ? styles.tabActive : ''}`} onClick={() => setTab('work')}>💼 근무 기준 변환</button>
      </div>

      {tab === 'general' ? <GeneralTab /> : <WorkTab />}
    </div>
  )
}

// ──────────────────────────────────────
// 일반 변환 탭
// ──────────────────────────────────────
function GeneralTab() {
  const [value, setValue] = useState<string>('1')
  const [unit, setUnit] = useState<Unit>('day')
  const [copied, setCopied] = useState<Unit | null>(null)

  const numValue = parseFloat(value) || 0

  const results = useMemo(() => {
    return UNIT_META.map(m => ({
      unit: m.id,
      label: m.label,
      note: UNIT_NOTE[m.id],
      value: convert(numValue, unit, m.id),
    }))
  }, [numValue, unit])

  function handleCopy(u: Unit, val: number) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatNumber(val).replace(/,/g, ''))
      setCopied(u)
      setTimeout(() => setCopied(null), 1200)
    }
  }

  function applyPreset(p: typeof PRESETS[number]) {
    setValue(p.value.toString())
    setUnit(p.unit)
  }

  const currentLabel = UNIT_META.find(m => m.id === unit)?.label ?? ''

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>입력</span>

        <div className={styles.inputRow}>
          <input
            type="number"
            className={`${styles.input} ${value && numValue > 0 ? styles.inputFilled : ''}`}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="1"
            step="any"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
            {currentLabel}
          </div>
        </div>

        <div className={styles.unitGrid}>
          {UNIT_META.map(m => (
            <button
              key={m.id}
              className={`${styles.unitBtn} ${unit === m.id ? styles.unitBtnActive : ''}`}
              onClick={() => setUnit(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.presetRow}>
          {PRESETS.map((p, i) => (
            <button key={i} className={styles.presetBtn} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultHeaderLabel}>입력값</div>
          <div className={styles.resultHeaderValue}>
            {formatNumber(numValue)} {currentLabel}
          </div>
        </div>
        {results.map(r => {
          const isSelf = r.unit === unit
          return (
            <div key={r.unit} className={`${styles.resultRow} ${isSelf ? styles.resultRowHighlight : ''}`}>
              <div className={styles.resultLabel}>
                {r.label}
                {r.note && <div style={{ fontSize: 10, color: 'var(--muted)', opacity: 0.7 }}>{r.note}</div>}
              </div>
              <div className={`${styles.resultValue} ${isSelf ? styles.resultValueSelf : ''}`}>
                {formatNumber(r.value)}
              </div>
              <button
                className={`${styles.copyBtn} ${copied === r.unit ? styles.copyBtnDone : ''}`}
                onClick={() => handleCopy(r.unit, r.value)}
              >
                {copied === r.unit ? '✓' : '복사'}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 근무 기준 변환 탭
// ──────────────────────────────────────
function WorkTab() {
  const [hours, setHours] = useState<string>('10000')
  const [hoursPerDay, setHoursPerDay] = useState<string>('8')
  const [hoursPerWeek, setHoursPerWeek] = useState<string>('40')
  const [daysPerMonth, setDaysPerMonth] = useState<string>('22')

  const h = parseFloat(hours) || 0
  const hd = parseFloat(hoursPerDay) || 8
  const hw = parseFloat(hoursPerWeek) || 40
  const dm = parseFloat(daysPerMonth) || 22

  const workdays = h / hd
  const workweeks = h / hw
  const workmonths = workdays / dm
  const workyears = h / 2000  // 연 2,000시간 기준

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>근무 기준 설정</span>
        <div className={styles.workInputs}>
          <div className={styles.workInputCell}>
            <div className={styles.workInputLabel}>1일 근무 시간</div>
            <input
              type="number"
              className={styles.workInput}
              value={hoursPerDay}
              onChange={e => setHoursPerDay(e.target.value)}
              placeholder="8"
              step="0.5"
            />
          </div>
          <div className={styles.workInputCell}>
            <div className={styles.workInputLabel}>주 근무 시간</div>
            <input
              type="number"
              className={styles.workInput}
              value={hoursPerWeek}
              onChange={e => setHoursPerWeek(e.target.value)}
              placeholder="40"
              step="0.5"
            />
          </div>
          <div className={styles.workInputCell}>
            <div className={styles.workInputLabel}>월 근무일</div>
            <input
              type="number"
              className={styles.workInput}
              value={daysPerMonth}
              onChange={e => setDaysPerMonth(e.target.value)}
              placeholder="22"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* 입력 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>변환할 시간</span>
        <div className={styles.inputRow}>
          <input
            type="number"
            className={`${styles.input} ${hours && h > 0 ? styles.inputFilled : ''}`}
            value={hours}
            onChange={e => setHours(e.target.value)}
            placeholder="10000"
            step="any"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
            시간
          </div>
        </div>

        <div className={styles.workResultGrid}>
          <div className={styles.workResultCell}>
            <div className={styles.workResultLabel}>1일 근무 기준</div>
            <div className={styles.workResultValue}>{formatNumber(workdays)}</div>
            <div className={styles.workResultMeta}>근무일 ({hd}h/일)</div>
          </div>
          <div className={styles.workResultCell}>
            <div className={styles.workResultLabel}>주 근무 기준</div>
            <div className={styles.workResultValue}>{formatNumber(workweeks)}</div>
            <div className={styles.workResultMeta}>근무주 ({hw}h/주)</div>
          </div>
          <div className={styles.workResultCell}>
            <div className={styles.workResultLabel}>월 근무 기준</div>
            <div className={styles.workResultValue}>{formatNumber(workmonths)}</div>
            <div className={styles.workResultMeta}>근무월 ({dm}일/월)</div>
          </div>
          <div className={styles.workResultCell}>
            <div className={styles.workResultLabel}>연간 근무 기준</div>
            <div className={styles.workResultValue}>{formatNumber(workyears)}</div>
            <div className={styles.workResultMeta}>년 (2,000h/년 기준)</div>
          </div>
        </div>
      </div>

      {/* 10,000시간 법칙 카드 */}
      <div className={styles.tenKCard}>
        <p className={styles.tenKTitle}>🌟 10,000시간 법칙</p>
        <p className={styles.tenKDesc}>
          말콤 글래드웰의 책 『아웃라이어』에서 소개된 개념. 어떤 분야의 전문가가 되는 데 약 10,000시간의 의도적 연습이 필요하다는 이론입니다.
        </p>
        <div className={styles.tenKList}>
          <div className={styles.tenKItem}>
            <span className={styles.tenKItemLabel}>하루 8시간 근무 시 (주 5일)</span>
            <span className={styles.tenKItemValue}>약 4.8년</span>
          </div>
          <div className={styles.tenKItem}>
            <span className={styles.tenKItemLabel}>하루 4시간 연습 시 (주 5일)</span>
            <span className={styles.tenKItemValue}>약 9.6년</span>
          </div>
          <div className={styles.tenKItem}>
            <span className={styles.tenKItemLabel}>하루 2시간 취미로 (주 5일)</span>
            <span className={styles.tenKItemValue}>약 19.2년</span>
          </div>
          <div className={styles.tenKItem}>
            <span className={styles.tenKItemLabel}>24시간 연속 (이론값)</span>
            <span className={styles.tenKItemValue}>약 1.14년</span>
          </div>
        </div>
      </div>
    </>
  )
}
