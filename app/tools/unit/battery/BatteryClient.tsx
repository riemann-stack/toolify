'use client'

import { useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
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
      desc: '기내 휴대 반입 OK — 위탁 수하물(체크인)은 절대 금지. 한국 출발·도착 편은 2026-04-20부터 보조배터리 1인당 최대 2개까지입니다.',
    }
  }
  if (wh <= 160) {
    return {
      status: 'warning',
      label: '🔶 사전 승인 필요',
      desc: '항공사 사전 승인 필요. 2026-04-20부터 보조배터리는 승인을 받아도 1인당 최대 2개까지입니다. 출발 전 항공사에 직접 문의하세요.',
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
// Component — 변환 + 비행기 반입 통합
// ──────────────────────────────────────
export default function BatteryClient() {
  const [value, setValue] = useState<string>('10000')
  const [unit, setUnit] = useState<CapUnit>('mAh')
  const [voltage, setVoltage] = useState<number>(3.7)
  const [customV, setCustomV] = useState<string>('')
  const [copied, setCopied] = useState<string | null>(null)

  const numValue = parseFloat(value) || 0
  const numCustom = parseFloat(customV)
  const isCustom = customV !== '' && !isNaN(numCustom) && numCustom > 0
  const effectiveV = isCustom ? numCustom : voltage

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
    return { mAh, ah: mAh / 1000, wh, kwh: wh / 1000 }
  }, [numValue, unit, effectiveV])

  const flight = flightStatus(result.wh)

  // 다른 전압 기준 Wh — 현재 전압과 중복되는 값은 제외 (3.7V·5V 기본 참조)
  const altVolts = useMemo(() => {
    return [3.7, 5]
      .filter(v => Math.abs(v - effectiveV) > 0.001)
      .map(v => ({ v, wh: calcWh(result.mAh, v) }))
  }, [result.mAh, effectiveV])

  function handleCopy(key: string, val: number) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatNumber(val).replace(/,/g, ''))
      setCopied(key)
      setTimeout(() => setCopied(null), 1200)
    }
  }

  const refRows = [5000, 10000, 20000, 27000, 30000, 40000, 50000].map(m => {
    const w = calcWh(m, 3.7)
    const f = flightStatus(w)
    let mark = '✅'
    if (f.status === 'warning') mark = '🔶'
    else if (f.status === 'banned') mark = '❌'
    if (m === 27000) mark = '✅ (한계)'
    return { mAh: m, whAt37: w, status: f.status, mark }
  })

  // 변환값 셀 (mAh·Ah·Wh·kWh) — 핵심 4종 컴팩트 그리드
  const cells = [
    { key: 'mAh', label: 'mAh', sub: '밀리암페어시', val: result.mAh },
    { key: 'Ah',  label: 'Ah',  sub: '암페어시',     val: result.ah },
    { key: 'Wh',  label: 'Wh',  sub: `${formatNumber(effectiveV)}V 기준`, val: result.wh },
    { key: 'kWh', label: 'kWh', sub: '킬로와트시',   val: result.kwh },
  ]

  return (
    <div className={styles.wrap}>
      <Disclaimer
        variant="safety"
        sources={[
          { label: '국토교통부 보도자료 (2026-04-08)', href: 'https://www.korea.kr/briefing/pressReleaseView.do?newsId=156753374' },
          { label: '아시아나항공 공지', href: 'https://m.flyasiana.com/C/KR/KO/customer/notice/detail?id=CM202604100002528761' },
          { label: '대한항공 뉴스룸', href: 'https://news.koreanair.com/%ed%95%9c%ec%a7%84%ea%b7%b8%eb%a3%b9-%ec%86%8c%ec%86%8d-5%ea%b0%9c-%ed%95%ad%ea%b3%b5%ec%82%ac-%ec%98%a4%eb%8a%94-26%ec%9d%bc%eb%b6%80%ed%84%b0-%eb%b3%b4%ec%a1%b0%eb%b0%b0%ed%84%b0%eb%a6%ac/' },
        ]}
        related={[
          { href: '/tools/unit/converter', label: '단위 변환기' },
          { href: '/tools/date/jet-lag',   label: '시차 적응 계산기' },
          { href: '/tools/life/packing',   label: '여행 짐 계산기' },
        ]}
      >
        환산값은 정격 전압 기준 계산치이며 제품에 표기된 Wh가 우선합니다. 기내 반입 판정은 ICAO·국토교통부 기준(2026-04-20 시행, 기준일 2026-06) 참고용으로, 국가·항공사별 적용 시점이 다를 수 있으니 출발 전 항공사 공식 규정을 꼭 확인하세요.
      </Disclaimer>

      {/* 용량 입력 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>용량 입력</span>
        <div className={styles.inputRow}>
          <input
            type="number" inputMode="decimal"
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
            <button key={m} className={styles.presetBtn} onClick={() => { setValue(m.toString()); setUnit('mAh') }}>
              {m.toLocaleString()}mAh
            </button>
          ))}
        </div>
      </div>

      {/* 전압 선택 */}
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
            type="number" inputMode="decimal"
            className={styles.voltCustomInput}
            value={customV}
            onChange={e => setCustomV(e.target.value)}
            placeholder="직접 입력 (V)"
            step="0.1"
          />
          <span className={styles.voltCustomLabel}>볼트(V)</span>
        </div>
      </div>

      {/* 비행기 반입 판정 — 핵심 결과 */}
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

      {/* 변환값 — 컴팩트 그리드 (탭하면 복사) */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>
          변환값
          <span className={styles.cardLabelHint}>셀을 탭하면 복사</span>
        </span>
        <div className={styles.convGrid}>
          {cells.map(c => (
            <button key={c.key} className={styles.convCell} onClick={() => handleCopy(c.key, c.val)}>
              <span className={styles.convCellLabel}>{c.label}<small>{c.sub}</small></span>
              <span className={styles.convCellValue}>
                {copied === c.key ? '✓ 복사됨' : formatNumber(c.val)}
              </span>
            </button>
          ))}
        </div>
        {altVolts.length > 0 && (
          <div className={styles.altVolts}>
            <span className={styles.altVoltsLabel}>다른 전압 Wh</span>
            {altVolts.map(a => (
              <button key={a.v} className={styles.altChip} onClick={() => handleCopy(`alt${a.v}`, a.wh)}>
                {formatNumber(a.v)}V&nbsp;·&nbsp;<strong>{copied === `alt${a.v}` ? '✓' : formatNumber(a.wh)}</strong>Wh
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Wh 환산 공식 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>Wh 환산 공식</span>
        <div className={styles.formulaBox}>
          Wh = (<span>mAh</span> × <span>V</span>) / 1000
          <div className={styles.formulaSub}>예: 10,000mAh × 3.7V = 37Wh</div>
        </div>
      </div>

      {/* 항공 규정 안내 */}
      <div className={styles.ruleBox}>
        <p className={styles.ruleTitle}>📋 국제 항공 규정 (ICAO·IATA 기준, 2026-06 기준)</p>
        <ul className={styles.ruleList}>
          <li>• <strong>보조배터리는 1인당 최대 2개</strong> (160Wh 이하) — 2026-04-20 시행 ICAO 국제기준</li>
          <li>• <strong>100Wh 이하</strong>: 항공사 승인 없이 휴대 반입 가능 (개수는 2개 제한에 포함)</li>
          <li>• <strong>100~160Wh</strong>: 항공사 사전 승인 필요</li>
          <li>• <strong>160Wh 초과</strong>: 일반 항공기 반입 불가</li>
          <li>• <strong>위탁 수하물(체크인) 절대 금지</strong> — 화재 위험으로 인해 모든 보조배터리는 기내 휴대만 허용</li>
          <li>• <strong>기내 선반 보관 금지</strong> — 몸에 소지하거나 좌석 (앞)주머니에 보관 (2025-03-01부터)</li>
          <li>• <strong>기내 충전·사용 전면 금지</strong> — 보조배터리 자체 충전은 물론 다른 기기 충전도 금지 (대한항공·아시아나 등 국내 5개사는 2026-01-26부터)</li>
          <li>• 단자가 금속에 닿지 않도록 절연 테이프·지퍼백·전용 파우치로 1개씩 보호</li>
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
    </div>
  )
}
