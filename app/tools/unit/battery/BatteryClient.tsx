'use client'

import { useMemo, useState } from 'react'
import styles from './battery.module.css'

// ──────────────────────────────────────
// 핵심 계산
// ──────────────────────────────────────
function calcWh(mAh: number, voltage: number): number {
  return (mAh * voltage) / 1000
}

function calcMah(wh: number, voltage: number): number {
  if (voltage <= 0) return 0
  return (wh / voltage) * 1000
}

type FlightStatus = 'safe' | 'warning' | 'banned'

function flightStatus(wh: number): { status: FlightStatus; label: string; desc: string } {
  if (wh <= 100) {
    return {
      status: 'safe',
      label: '✅ 휴대 반입 가능',
      desc: '대부분 항공사에서 기내 휴대 반입 OK. 위탁 수하물(체크인)은 절대 금지입니다.',
    }
  }
  if (wh <= 160) {
    return {
      status: 'warning',
      label: '🔶 사전 승인 필요',
      desc: '항공사 사전 승인 필요. 보통 1인당 2개까지 허용됩니다. 출발 전 항공사에 직접 문의하세요.',
    }
  }
  return {
    status: 'banned',
    label: '❌ 반입 불가',
    desc: '일반 항공기 반입 불가. 위탁·휴대 모두 금지이며, 산업·의료용은 별도 신청이 필요합니다.',
  }
}

function formatNumber(n: number): string {
  if (!isFinite(n)) return '0'
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (abs >= 1000)  return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (abs >= 100)   return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (abs >= 10)    return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (abs >= 1)     return n.toLocaleString('en-US', { maximumFractionDigits: 3 })
  return n.toLocaleString('en-US', { maximumFractionDigits: 5 })
}

// ──────────────────────────────────────
// 상수
// ──────────────────────────────────────
type CapUnit = 'mAh' | 'Ah' | 'Wh'

const VOLTAGE_PRESETS: { v: number; label: string }[] = [
  { v: 3.7,  label: '3.7V' },
  { v: 5,    label: '5V' },
  { v: 7.4,  label: '7.4V' },
  { v: 11.1, label: '11.1V' },
  { v: 12,   label: '12V' },
]

const MAH_PRESETS = [5000, 10000, 20000, 27000, 30000]

// ──────────────────────────────────────
// Component
// ──────────────────────────────────────
export default function BatteryClient() {
  const [tab, setTab] = useState<'convert' | 'flight'>('convert')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'convert' ? styles.tabActive : ''}`}
          onClick={() => setTab('convert')}
        >
          🔋 mAh ↔ Wh 변환
        </button>
        <button
          className={`${styles.tab} ${tab === 'flight' ? styles.tabActive : ''}`}
          onClick={() => setTab('flight')}
        >
          ✈️ 비행기 반입 체크
        </button>
      </div>

      {tab === 'convert' ? <ConvertTab /> : <FlightTab />}
    </div>
  )
}

// ──────────────────────────────────────
// 탭 1 — mAh ↔ Wh 변환
// ──────────────────────────────────────
function ConvertTab() {
  const [value, setValue] = useState<string>('10000')
  const [unit, setUnit] = useState<CapUnit>('mAh')
  const [voltage, setVoltage] = useState<number>(3.7)
  const [customV, setCustomV] = useState<string>('')
  const [copied, setCopied] = useState<string | null>(null)

  const numValue = parseFloat(value) || 0
  const numCustom = parseFloat(customV)
  const isCustom = customV !== '' && !isNaN(numCustom) && numCustom > 0
  const effectiveV = isCustom ? numCustom : voltage

  // 단위에 따라 mAh/Wh 베이스 환산
  const result = useMemo(() => {
    let mAh = 0
    let wh = 0
    if (unit === 'mAh') {
      mAh = numValue
      wh = calcWh(mAh, effectiveV)
    } else if (unit === 'Ah') {
      mAh = numValue * 1000
      wh = calcWh(mAh, effectiveV)
    } else {
      wh = numValue
      mAh = calcMah(wh, effectiveV)
    }
    return {
      mAh,
      ah: mAh / 1000,
      wh,
      whAt37: calcWh(mAh, 3.7),
      whAt5:  calcWh(mAh, 5),
      kwh:    wh / 1000,
    }
  }, [numValue, unit, effectiveV])

  const flight = flightStatus(result.wh)

  function handleCopy(key: string, val: number) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatNumber(val).replace(/,/g, ''))
      setCopied(key)
      setTimeout(() => setCopied(null), 1200)
    }
  }

  function applyPreset(mAh: number) {
    setValue(mAh.toString())
    setUnit('mAh')
  }

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>용량 입력</span>

        <div className={styles.inputRow}>
          <input
            type="number"
            className={`${styles.input} ${value && numValue > 0 ? styles.inputFilled : ''}`}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="10000"
            step="any"
          />
          <select
            className={styles.unitSelect}
            value={unit}
            onChange={e => setUnit(e.target.value as CapUnit)}
          >
            <option value="mAh">mAh</option>
            <option value="Ah">Ah</option>
            <option value="Wh">Wh</option>
          </select>
        </div>

        <div className={styles.presetRow}>
          {MAH_PRESETS.map(m => (
            <button key={m} className={styles.presetBtn} onClick={() => applyPreset(m)}>
              {m.toLocaleString()}mAh
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardLabel}>전압(V) 선택</span>
        <div className={styles.voltGrid}>
          {VOLTAGE_PRESETS.map(p => (
            <button
              key={p.v}
              className={`${styles.voltBtn} ${!isCustom && voltage === p.v ? styles.voltBtnActive : ''}`}
              onClick={() => { setVoltage(p.v); setCustomV('') }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className={styles.voltCustomRow}>
          <input
            type="number"
            className={styles.voltCustomInput}
            value={customV}
            onChange={e => setCustomV(e.target.value)}
            placeholder="직접 입력 (V)"
            step="0.1"
          />
          <span className={styles.voltCustomLabel}>볼트(V)</span>
        </div>
      </div>

      {/* 결과 */}
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultHeaderLabel}>결과 (전압 {formatNumber(effectiveV)}V 기준)</div>
          <div className={styles.resultHeaderValue}>
            {formatNumber(result.wh)} Wh · {formatNumber(result.mAh)} mAh
          </div>
        </div>

        {[
          { key: 'mAh',    label: 'mAh',    sub: '밀리암페어시',   val: result.mAh },
          { key: 'Ah',     label: 'Ah',     sub: '암페어시',       val: result.ah },
          { key: 'Wh',     label: 'Wh',     sub: `${formatNumber(effectiveV)}V 기준`, val: result.wh },
          { key: 'Wh37',   label: 'Wh',     sub: '3.7V 기준',      val: result.whAt37 },
          { key: 'Wh5',    label: 'Wh',     sub: '5V 기준',        val: result.whAt5 },
          { key: 'kWh',    label: 'kWh',    sub: '킬로와트시',      val: result.kwh },
        ].map(r => (
          <div key={r.key} className={styles.resultRow}>
            <div>
              <div className={styles.resultLabel}>{r.label}</div>
              <div className={styles.resultLabelSub}>{r.sub}</div>
            </div>
            <div className={styles.resultValue}>{formatNumber(r.val)}</div>
            <button
              className={`${styles.copyBtn} ${copied === r.key ? styles.copyBtnDone : ''}`}
              onClick={() => handleCopy(r.key, r.val)}
            >
              {copied === r.key ? '✓' : '복사'}
            </button>
          </div>
        ))}
      </div>

      {/* 비행기 반입 자동 표시 */}
      <div
        className={`${styles.flightCard} ${
          flight.status === 'safe' ? styles.flightSafe :
          flight.status === 'warning' ? styles.flightWarn : styles.flightBanned
        }`}
      >
        <div className={styles.flightWh}>{formatNumber(result.wh)} Wh</div>
        <div className={styles.flightTitle}>{flight.label}</div>
        <div className={styles.flightDesc}>{flight.desc}</div>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 탭 2 — 비행기 반입 체크
// ──────────────────────────────────────
function FlightTab() {
  const [mah, setMah] = useState<string>('20000')
  const [voltage, setVoltage] = useState<string>('3.7')

  const numMah = parseFloat(mah) || 0
  const numV = parseFloat(voltage) || 3.7
  const wh = calcWh(numMah, numV)
  const flight = flightStatus(wh)

  const refRows: { mAh: number; whAt37: number; status: FlightStatus; mark: string }[] =
    [5000, 10000, 20000, 27000, 30000, 40000, 50000].map(m => {
      const w = calcWh(m, 3.7)
      const f = flightStatus(w)
      let mark = '✅'
      if (f.status === 'warning') mark = '🔶'
      else if (f.status === 'banned') mark = '❌'
      if (m === 27000) mark = '✅ (한계)'
      return { mAh: m, whAt37: w, status: f.status, mark }
    })

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>보조배터리 정보 입력</span>

        <div className={styles.inputRow} style={{ marginBottom: 10 }}>
          <input
            type="number"
            className={`${styles.input} ${mah && numMah > 0 ? styles.inputFilled : ''}`}
            value={mah}
            onChange={e => setMah(e.target.value)}
            placeholder="20000"
            step="any"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
            mAh
          </div>
        </div>

        <div className={styles.inputRow}>
          <input
            type="number"
            className={`${styles.input} ${voltage && numV > 0 ? styles.inputFilled : ''}`}
            value={voltage}
            onChange={e => setVoltage(e.target.value)}
            placeholder="3.7"
            step="0.1"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--accent)', fontSize: 13, fontWeight: 700 }}>
            V (전압)
          </div>
        </div>
      </div>

      {/* 판정 결과 */}
      <div
        className={`${styles.flightCard} ${
          flight.status === 'safe' ? styles.flightSafe :
          flight.status === 'warning' ? styles.flightWarn : styles.flightBanned
        }`}
      >
        <div className={styles.flightWh}>{formatNumber(wh)} Wh</div>
        <div className={styles.flightTitle}>{flight.label}</div>
        <div className={styles.flightDesc}>{flight.desc}</div>
      </div>

      {/* 환산 공식 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>Wh 환산 공식</span>
        <div className={styles.formulaBox}>
          Wh = (<span>mAh</span> × <span>V</span>) / 1000
          <div className={styles.formulaSub}>
            예: 10,000mAh × 3.7V = 37Wh
          </div>
        </div>
      </div>

      {/* 항공 규정 안내 */}
      <div className={styles.ruleBox}>
        <p className={styles.ruleTitle}>📋 국제 항공 규정 (IATA 기준)</p>
        <ul className={styles.ruleList}>
          <li>• <strong>100Wh 이하</strong>: 휴대 반입 자유 (개수 제한 거의 없음)</li>
          <li>• <strong>100~160Wh</strong>: 항공사 사전 승인 필요, 보통 1인당 2개까지</li>
          <li>• <strong>160Wh 초과</strong>: 일반 항공기 반입 불가</li>
          <li>• <strong>위탁 수하물(체크인) 절대 금지</strong> — 화재 위험으로 인해 모든 보조배터리는 기내 휴대만 허용</li>
          <li>• 단자 보호를 위해 절연 테이프나 전용 파우치에 보관 권장</li>
        </ul>
      </div>

      {/* 자주 쓰는 보조배터리 Wh 참조표 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>자주 쓰는 보조배터리 Wh 참조 (3.7V 기준)</span>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.refTable}>
            <thead>
              <tr>
                <th>mAh</th>
                <th>Wh (3.7V)</th>
                <th>반입 가능?</th>
              </tr>
            </thead>
            <tbody>
              {refRows.map(r => (
                <tr key={r.mAh}>
                  <td className={styles.refMah}>{r.mAh.toLocaleString()}</td>
                  <td>{formatNumber(r.whAt37)}</td>
                  <td className={
                    r.status === 'safe' ? styles.refSafe :
                    r.status === 'warning' ? styles.refWarn : styles.refBanned
                  }>{r.mark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
