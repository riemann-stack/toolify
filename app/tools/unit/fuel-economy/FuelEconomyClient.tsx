'use client'

import { useMemo, useState } from 'react'
import styles from './fuel-economy.module.css'

// ──────────────────────────────────────
// 핵심 변환 로직 (가솔린/디젤)
// ──────────────────────────────────────
// 1 mile = 1.60934 km, 1 US gallon = 3.78541 L, 1 UK gallon = 4.54609 L
const MPG_US_FACTOR = 2.35215  // km/L × 2.35215 = mpg (US)
const MPG_UK_FACTOR = 2.82481  // km/L × 2.82481 = mpg (UK)

const kmlToL100km   = (kml: number) => kml > 0 ? 100 / kml : 0
const l100kmToKml   = (l100: number) => l100 > 0 ? 100 / l100 : 0
const kmlToMpgUS    = (kml: number) => kml * MPG_US_FACTOR
const mpgUSToKml    = (mpg: number) => mpg / MPG_US_FACTOR
const kmlToMpgUK    = (kml: number) => kml * MPG_UK_FACTOR
const mpgUKToKml    = (mpg: number) => mpg / MPG_UK_FACTOR

// 전기차 전비
const KWH_PER_GAL = 33.7  // 미국 EPA 기준: 1 gal 가솔린 = 33.7 kWh
const KM_PER_MILE = 1.60934

const kmkwhToWhkm    = (kmkwh: number) => kmkwh > 0 ? 1000 / kmkwh : 0
const whkmToKmkwh    = (whkm: number)  => whkm > 0  ? 1000 / whkm  : 0
const kmkwhToMilesKwh= (kmkwh: number) => kmkwh / KM_PER_MILE
const milesKwhToKmkwh= (mk: number)    => mk * KM_PER_MILE
const kmkwhToMpge    = (kmkwh: number) => (kmkwh / KM_PER_MILE) * KWH_PER_GAL
const mpgeToKmkwh    = (mpge: number)  => (mpge / KWH_PER_GAL) * KM_PER_MILE

function formatNumber(n: number): string {
  if (!isFinite(n)) return '0'
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (abs >= 100)  return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (abs >= 10)   return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (abs >= 1)    return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return n.toLocaleString('en-US', { maximumFractionDigits: 4 })
}

function formatKRW(n: number): string {
  if (!isFinite(n)) return '0원'
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

// ──────────────────────────────────────
// Component
// ──────────────────────────────────────
export default function FuelEconomyClient() {
  const [tab, setTab] = useState<'fuel' | 'ev'>('fuel')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'fuel' ? styles.tabActive : ''}`}
          onClick={() => setTab('fuel')}
        >
          ⛽ 연비 변환
        </button>
        <button
          className={`${styles.tab} ${tab === 'ev' ? styles.tabActive : ''}`}
          onClick={() => setTab('ev')}
        >
          🔌 전기차 전비
        </button>
      </div>

      {tab === 'fuel' ? <FuelTab /> : <EvTab />}
    </div>
  )
}

// ──────────────────────────────────────
// 탭 1 — 연비 변환
// ──────────────────────────────────────
type FuelUnit = 'kml' | 'l100' | 'mpgUS' | 'mpgUK'

const FUEL_UNIT_META: { id: FuelUnit; label: string; sub: string }[] = [
  { id: 'kml',   label: 'km/L',     sub: '한국·일본' },
  { id: 'l100',  label: 'L/100km',  sub: '유럽' },
  { id: 'mpgUS', label: 'mpg (US)', sub: '미국' },
  { id: 'mpgUK', label: 'mpg (UK)', sub: '영국' },
]

const FUEL_PRESETS: { label: string; value: number; unit: FuelUnit }[] = [
  { label: '10 km/L',  value: 10, unit: 'kml' },
  { label: '15 km/L',  value: 15, unit: 'kml' },
  { label: '20 km/L',  value: 20, unit: 'kml' },
  { label: '25 km/L',  value: 25, unit: 'kml' },
  { label: '30 mpg (US)', value: 30, unit: 'mpgUS' },
  { label: '40 mpg (US)', value: 40, unit: 'mpgUS' },
]

function fuelGrade(kml: number): { className: string; title: string; desc: string } {
  if (kml >= 20) return { className: 'gradeStar', title: '🌟 매우 우수', desc: '하이브리드·소형 디젤 수준. 환경부 1등급 이상 가능.' }
  if (kml >= 15) return { className: 'gradeGood', title: '✅ 우수',      desc: '가솔린 소형차의 일반적인 수준. 환경부 2~3등급.' }
  if (kml >= 10) return { className: 'gradeMid',  title: '보통',         desc: '중형 가솔린차의 평균적인 연비. 4등급 안팎.' }
  if (kml >= 8)  return { className: 'gradeLow',  title: '🔶 평균 이하',  desc: '대형·SUV 수준. 시내 주행 비중이 높은 차량.' }
  return            { className: 'gradeBad',  title: '❌ 낮음',        desc: '대형 SUV·스포츠카 수준. 5등급 이하 가능성.' }
}

function FuelTab() {
  const [value, setValue] = useState<string>('15')
  const [unit, setUnit] = useState<FuelUnit>('kml')
  const [copied, setCopied] = useState<FuelUnit | null>(null)

  const numValue = parseFloat(value) || 0

  // 모든 입력 → km/L 베이스로 변환
  const baseKml = useMemo(() => {
    if (numValue <= 0) return 0
    if (unit === 'kml')   return numValue
    if (unit === 'l100')  return l100kmToKml(numValue)
    if (unit === 'mpgUS') return mpgUSToKml(numValue)
    if (unit === 'mpgUK') return mpgUKToKml(numValue)
    return 0
  }, [numValue, unit])

  const results = useMemo(() => {
    if (baseKml <= 0) {
      return FUEL_UNIT_META.map(m => ({ ...m, value: 0 }))
    }
    return [
      { id: 'kml'   as FuelUnit, label: 'km/L',     sub: '한국·일본 (1L로 주행 거리)',   value: baseKml },
      { id: 'l100'  as FuelUnit, label: 'L/100km',  sub: '유럽 (100km당 소비량, 낮을수록 효율↑)', value: kmlToL100km(baseKml) },
      { id: 'mpgUS' as FuelUnit, label: 'mpg (US)', sub: '미국 (1 US 갤런 = 3.78541 L)', value: kmlToMpgUS(baseKml) },
      { id: 'mpgUK' as FuelUnit, label: 'mpg (UK)', sub: '영국 (1 UK 갤런 = 4.54609 L)', value: kmlToMpgUK(baseKml) },
    ]
  }, [baseKml])

  const grade = fuelGrade(baseKml)

  function handleCopy(u: FuelUnit, val: number) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatNumber(val).replace(/,/g, ''))
      setCopied(u)
      setTimeout(() => setCopied(null), 1200)
    }
  }

  function applyPreset(p: typeof FUEL_PRESETS[number]) {
    setValue(p.value.toString())
    setUnit(p.unit)
  }

  const currentLabel = FUEL_UNIT_META.find(m => m.id === unit)?.label ?? ''

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>연비 입력</span>

        <div className={styles.inputRow}>
          <input
            type="number"
            className={`${styles.input} ${value && numValue > 0 ? styles.inputFilled : ''}`}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="15"
            step="any"
          />
          <select
            className={styles.unitSelect}
            value={unit}
            onChange={e => setUnit(e.target.value as FuelUnit)}
          >
            {FUEL_UNIT_META.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.presetRow}>
          {FUEL_PRESETS.map((p, i) => (
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
          const isSelf = r.id === unit
          return (
            <div key={r.id} className={`${styles.resultRow} ${isSelf ? styles.resultRowHighlight : ''}`}>
              <div>
                <div className={styles.resultLabel}>{r.label}</div>
                <div className={styles.resultLabelSub}>{r.sub}</div>
              </div>
              <div className={`${styles.resultValue} ${isSelf ? styles.resultValueSelf : ''}`}>
                {formatNumber(r.value)}
              </div>
              <button
                className={`${styles.copyBtn} ${copied === r.id ? styles.copyBtnDone : ''}`}
                onClick={() => handleCopy(r.id, r.value)}
              >
                {copied === r.id ? '✓' : '복사'}
              </button>
            </div>
          )
        })}
      </div>

      {/* 등급 */}
      <div className={`${styles.gradeCard} ${styles[grade.className]}`}>
        <div className={styles.gradeTitle}>{grade.title} ({formatNumber(baseKml)} km/L)</div>
        <div className={styles.gradeDesc}>{grade.desc}</div>
        <div className={styles.gradeDesc} style={{ opacity: 0.75, marginTop: 4 }}>
          🇰🇷 한국 환경부 평균연비 등급 기준 참고치 (정확한 등급은 차량 종류·배기량별 다름)
        </div>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 탭 2 — 전기차 전비
// ──────────────────────────────────────
type EvUnit = 'kmkwh' | 'whkm' | 'mileskwh' | 'mpge'

const EV_UNIT_META: { id: EvUnit; label: string; sub: string }[] = [
  { id: 'kmkwh',    label: 'km/kWh',    sub: '한국·일본' },
  { id: 'whkm',     label: 'Wh/km',     sub: '유럽' },
  { id: 'mileskwh', label: 'miles/kWh', sub: '미국' },
  { id: 'mpge',     label: 'MPGe',      sub: 'EPA 환산' },
]

const EV_PRESETS: { label: string; value: number; unit: EvUnit }[] = [
  { label: '4 km/kWh',  value: 4,   unit: 'kmkwh' },
  { label: '5 km/kWh',  value: 5,   unit: 'kmkwh' },
  { label: '6 km/kWh',  value: 6,   unit: 'kmkwh' },
  { label: '150 Wh/km', value: 150, unit: 'whkm' },
  { label: '120 MPGe',  value: 120, unit: 'mpge' },
]

function evGrade(kmkwh: number): { className: string; title: string; desc: string } {
  if (kmkwh >= 6) return { className: 'gradeStar', title: '🌟 매우 우수', desc: '아이오닉·테슬라 모델3 등 효율 최상위권.' }
  if (kmkwh >= 5) return { className: 'gradeGood', title: '✅ 우수',      desc: '대부분의 소·중형 전기차의 우수한 효율.' }
  if (kmkwh >= 4) return { className: 'gradeMid',  title: '보통',         desc: '중형 SUV 전기차의 일반적인 효율.' }
  if (kmkwh >= 3) return { className: 'gradeLow',  title: '🔶 평균 이하',  desc: '대형 SUV·고출력 전기차 수준.' }
  return            { className: 'gradeBad',  title: '❌ 낮음',        desc: '대형 픽업·고성능 EV. 또는 겨울철 일시적 효율 저하.' }
}

function EvTab() {
  const [value, setValue] = useState<string>('5')
  const [unit, setUnit] = useState<EvUnit>('kmkwh')
  const [slowRate, setSlowRate] = useState<string>('200')
  const [fastRate, setFastRate] = useState<string>('400')
  const [copied, setCopied] = useState<EvUnit | null>(null)

  const numValue = parseFloat(value) || 0
  const slow = parseFloat(slowRate) || 0
  const fast = parseFloat(fastRate) || 0

  // 모든 입력 → km/kWh 베이스
  const baseKmkwh = useMemo(() => {
    if (numValue <= 0) return 0
    if (unit === 'kmkwh')    return numValue
    if (unit === 'whkm')     return whkmToKmkwh(numValue)
    if (unit === 'mileskwh') return milesKwhToKmkwh(numValue)
    if (unit === 'mpge')     return mpgeToKmkwh(numValue)
    return 0
  }, [numValue, unit])

  const results = useMemo(() => {
    if (baseKmkwh <= 0) {
      return EV_UNIT_META.map(m => ({ ...m, value: 0 }))
    }
    return [
      { id: 'kmkwh'    as EvUnit, label: 'km/kWh',    sub: '한국·일본 (1kWh로 주행 거리)',     value: baseKmkwh },
      { id: 'whkm'     as EvUnit, label: 'Wh/km',     sub: '유럽 (1km당 소비 전력, 낮을수록↑)', value: kmkwhToWhkm(baseKmkwh) },
      { id: 'mileskwh' as EvUnit, label: 'miles/kWh', sub: '미국 (1kWh로 주행 마일)',          value: kmkwhToMilesKwh(baseKmkwh) },
      { id: 'mpge'     as EvUnit, label: 'MPGe',      sub: 'EPA 환산 (1갤런 ≈ 33.7kWh)',       value: kmkwhToMpge(baseKmkwh) },
    ]
  }, [baseKmkwh])

  // 100km 주행 비용
  const kwhPer100km = baseKmkwh > 0 ? 100 / baseKmkwh : 0
  const slowCost = kwhPer100km * slow
  const fastCost = kwhPer100km * fast

  const grade = evGrade(baseKmkwh)

  function handleCopy(u: EvUnit, val: number) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatNumber(val).replace(/,/g, ''))
      setCopied(u)
      setTimeout(() => setCopied(null), 1200)
    }
  }

  function applyPreset(p: typeof EV_PRESETS[number]) {
    setValue(p.value.toString())
    setUnit(p.unit)
  }

  const currentLabel = EV_UNIT_META.find(m => m.id === unit)?.label ?? ''

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>전비 입력</span>

        <div className={styles.inputRow}>
          <input
            type="number"
            className={`${styles.input} ${value && numValue > 0 ? styles.inputFilled : ''}`}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="5"
            step="any"
          />
          <select
            className={styles.unitSelect}
            value={unit}
            onChange={e => setUnit(e.target.value as EvUnit)}
          >
            {EV_UNIT_META.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.presetRow}>
          {EV_PRESETS.map((p, i) => (
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
          const isSelf = r.id === unit
          return (
            <div key={r.id} className={`${styles.resultRow} ${isSelf ? styles.resultRowHighlight : ''}`}>
              <div>
                <div className={styles.resultLabel}>{r.label}</div>
                <div className={styles.resultLabelSub}>{r.sub}</div>
              </div>
              <div className={`${styles.resultValue} ${isSelf ? styles.resultValueSelf : ''}`}>
                {formatNumber(r.value)}
              </div>
              <button
                className={`${styles.copyBtn} ${copied === r.id ? styles.copyBtnDone : ''}`}
                onClick={() => handleCopy(r.id, r.value)}
              >
                {copied === r.id ? '✓' : '복사'}
              </button>
            </div>
          )
        })}
      </div>

      {/* 등급 */}
      <div className={`${styles.gradeCard} ${styles[grade.className]}`}>
        <div className={styles.gradeTitle}>{grade.title} ({formatNumber(baseKmkwh)} km/kWh)</div>
        <div className={styles.gradeDesc}>{grade.desc}</div>
      </div>

      {/* 100km 주행 비용 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>100km 주행 비용</span>

        <div className={styles.costInputs}>
          <div className={styles.costInputCell}>
            <div className={styles.costInputLabel}>완속 충전 단가 (원/kWh)</div>
            <input
              type="number"
              className={styles.costInput}
              value={slowRate}
              onChange={e => setSlowRate(e.target.value)}
              placeholder="200"
              step="10"
            />
          </div>
          <div className={styles.costInputCell}>
            <div className={styles.costInputLabel}>급속 충전 단가 (원/kWh)</div>
            <input
              type="number"
              className={styles.costInput}
              value={fastRate}
              onChange={e => setFastRate(e.target.value)}
              placeholder="400"
              step="10"
            />
          </div>
        </div>

        <div className={styles.costGrid}>
          <div className={styles.costCell}>
            <div className={styles.costLabel}>완속 충전 (200원/kWh 기준)</div>
            <div className={styles.costValue}>{formatKRW(slowCost)}</div>
            <div className={styles.costMeta}>
              {formatNumber(kwhPer100km)} kWh × {formatNumber(slow)}원
            </div>
          </div>
          <div className={styles.costCell}>
            <div className={styles.costLabel}>급속 충전 (400원/kWh 기준)</div>
            <div className={styles.costValue}>{formatKRW(fastCost)}</div>
            <div className={styles.costMeta}>
              {formatNumber(kwhPer100km)} kWh × {formatNumber(fast)}원
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
