'use client'

import { useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
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
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/finance/car-cost', label: '자동차 유지비 계산기' },
          { href: '/tools/unit/converter',   label: '단위 변환기' },
          { href: '/tools/unit/tire-pressure', label: '타이어 공기압 변환기' },
        ]}
        sources={[
          { label: '오피넷(한국석유공사)', href: 'https://www.opinet.co.kr' },
          { label: '무공해차 통합누리집(환경부)', href: 'https://ev.or.kr' },
        ]}
      >
        연료비·충전비 비교는 평균 단가 기준 추정치이며, 실주행 연비·전비는 제조사 공인 복합연비와 ±20% 이상 차이날 수 있습니다.
      </Disclaimer>

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
  { id: 'kml',   label: 'km/L',     sub: '한국' },
  { id: 'l100',  label: 'L/100km',  sub: '유럽' },
  { id: 'mpgUS', label: 'mpg (US)', sub: '미국' },
  { id: 'mpgUK', label: 'mpg (UK)', sub: '영국' },
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
      { id: 'kml'   as FuelUnit, label: 'km/L',     sub: '한국', value: baseKml },
      { id: 'l100'  as FuelUnit, label: 'L/100km',  sub: '유럽', value: kmlToL100km(baseKml) },
      { id: 'mpgUS' as FuelUnit, label: 'mpg (US)', sub: '미국', value: kmlToMpgUS(baseKml) },
      { id: 'mpgUK' as FuelUnit, label: 'mpg (UK)', sub: '영국', value: kmlToMpgUK(baseKml) },
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
          <div className={styles.unitDisplay}>{currentLabel}</div>
        </div>

        {/* 단위 선택 — 프리셋 버튼 4개 */}
        <div className={styles.unitGrid}>
          {FUEL_UNIT_META.map(m => (
            <button
              key={m.id}
              className={`${styles.unitBtn} ${unit === m.id ? styles.unitBtnActive : ''}`}
              onClick={() => setUnit(m.id)}
              type="button"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 — 2열 그리드 (모바일·PC 공통) */}
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultHeaderLabel}>입력값</div>
          <div className={styles.resultHeaderValue}>
            {formatNumber(numValue)} {currentLabel}
          </div>
        </div>
        <div className={styles.resultGrid}>
          {results.map(r => {
            const isSelf = r.id === unit
            return (
              <button
                key={r.id}
                type="button"
                className={`${styles.resultCell} ${isSelf ? styles.resultCellHighlight : ''}`}
                onClick={() => handleCopy(r.id, r.value)}
                title="클릭하여 복사"
              >
                <div className={styles.resultCellTop}>
                  <span className={styles.resultLabel}>{r.label}</span>
                  <span className={styles.resultLabelSub}>{r.sub}</span>
                </div>
                <div className={`${styles.resultValue} ${isSelf ? styles.resultValueSelf : ''}`}>
                  {formatNumber(r.value)}
                </div>
                <span className={`${styles.copyHint} ${copied === r.id ? styles.copyHintDone : ''}`}>
                  {copied === r.id ? '✓ 복사됨' : '📋 복사'}
                </span>
              </button>
            )
          })}
        </div>
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
  { id: 'kmkwh',    label: 'km/kWh',    sub: '한국' },
  { id: 'whkm',     label: 'Wh/km',     sub: '유럽' },
  { id: 'mileskwh', label: 'miles/kWh', sub: '미국' },
  { id: 'mpge',     label: 'MPGe',      sub: '미국 EPA' },
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
  // 기본 단가: 환경부 공공 충전요금 5단계 개편(2026-04-30 시행) — 완속(30kW 미만) 294.3원, 급속(100~200kW) 347.2원/kWh
  const [slowRate, setSlowRate] = useState<string>('294.3')
  const [fastRate, setFastRate] = useState<string>('347.2')
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
      { id: 'kmkwh'    as EvUnit, label: 'km/kWh',    sub: '한국',     value: baseKmkwh },
      { id: 'whkm'     as EvUnit, label: 'Wh/km',     sub: '유럽',     value: kmkwhToWhkm(baseKmkwh) },
      { id: 'mileskwh' as EvUnit, label: 'miles/kWh', sub: '미국',     value: kmkwhToMilesKwh(baseKmkwh) },
      { id: 'mpge'     as EvUnit, label: 'MPGe',      sub: '미국 EPA', value: kmkwhToMpge(baseKmkwh) },
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
          <div className={styles.unitDisplay}>{currentLabel}</div>
        </div>

        {/* 단위 선택 — 프리셋 버튼 4개 */}
        <div className={styles.unitGrid}>
          {EV_UNIT_META.map(m => (
            <button
              key={m.id}
              className={`${styles.unitBtn} ${unit === m.id ? styles.unitBtnActive : ''}`}
              onClick={() => setUnit(m.id)}
              type="button"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 — 2열 그리드 (모바일·PC 공통) */}
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultHeaderLabel}>입력값</div>
          <div className={styles.resultHeaderValue}>
            {formatNumber(numValue)} {currentLabel}
          </div>
        </div>
        <div className={styles.resultGrid}>
          {results.map(r => {
            const isSelf = r.id === unit
            return (
              <button
                key={r.id}
                type="button"
                className={`${styles.resultCell} ${isSelf ? styles.resultCellHighlight : ''}`}
                onClick={() => handleCopy(r.id, r.value)}
                title="클릭하여 복사"
              >
                <div className={styles.resultCellTop}>
                  <span className={styles.resultLabel}>{r.label}</span>
                  <span className={styles.resultLabelSub}>{r.sub}</span>
                </div>
                <div className={`${styles.resultValue} ${isSelf ? styles.resultValueSelf : ''}`}>
                  {formatNumber(r.value)}
                </div>
                <span className={`${styles.copyHint} ${copied === r.id ? styles.copyHintDone : ''}`}>
                  {copied === r.id ? '✓ 복사됨' : '📋 복사'}
                </span>
              </button>
            )
          })}
        </div>
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
              placeholder="294.3"
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
              placeholder="347.2"
              step="10"
            />
          </div>
        </div>

        <div className={styles.costGrid}>
          <div className={styles.costCell}>
            <div className={styles.costLabel}>완속 충전 ({formatNumber(slow)}원/kWh 기준)</div>
            <div className={styles.costValue}>{formatKRW(slowCost)}</div>
            <div className={styles.costMeta}>
              {formatNumber(kwhPer100km)} kWh × {formatNumber(slow)}원
            </div>
          </div>
          <div className={styles.costCell}>
            <div className={styles.costLabel}>급속 충전 ({formatNumber(fast)}원/kWh 기준)</div>
            <div className={styles.costValue}>{formatKRW(fastCost)}</div>
            <div className={styles.costMeta}>
              {formatNumber(kwhPer100km)} kWh × {formatNumber(fast)}원
            </div>
          </div>
        </div>

        <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.6, marginTop: 10, marginBottom: 0 }}>
          기본 단가: 환경부 공공 충전요금 5단계 개편(2026-04-30 시행) — 완속(30kW 미만) 294.3원 · 급속(100~200kW) 347.2원/kWh. 사업자·시간대에 따라 다를 수 있습니다.
        </p>
      </div>
    </>
  )
}
