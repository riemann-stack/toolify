'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState, useEffect } from 'react'
import styles from './weightloss.module.css'
import {
  Gender, Severity, PlateauMode,
  SAFE_SPEEDS, EXERCISES, PROTEIN_TARGETS,
  calcWeightLossPlan, calcDeficitForTargetDate, calcAlternatives,
  splitDietExercise, exerciseTimeFor, calcMacros, calcMealSplit,
  bmiCategoryName, todayISO, formatDateKo, addDays,
} from './weightLossUtils'

type Tab = 'plan' | 'split' | 'date'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'plan',    name: '식단 조절',   icon: '🥗' },
  { id: 'split',   name: '식단+운동',   icon: '🍽️' },
  { id: 'date',    name: '목표일 기준', icon: '📅' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  plan:    styles.tabActive,
  split:   styles.tabActiveSplit,
  date:    styles.tabActiveDate,
}

const SEVERITY_CLASS: Record<Severity, string> = {
  safe:    styles.severitySafe,
  caution: styles.severityCaution,
  warning: styles.severityWarning,
  danger:  styles.severityDanger,
}

const SEVERITY_LABEL: Record<Severity, string> = {
  safe: '🟢 안전',
  caution: '🟡 주의',
  warning: '🟠 경고',
  danger: '🔴 위험',
}

const SEVERITY_BORDER: Record<Severity, string> = {
  safe:    'rgba(62,255,155,0.40)',
  caution: 'rgba(255,215,0,0.40)',
  warning: 'rgba(255,140,62,0.40)',
  danger:  '#FF6B6B',
}
const SEVERITY_BG: Record<Severity, string> = {
  safe:    'rgba(62,255,155,0.06)',
  caution: 'rgba(255,215,0,0.06)',
  warning: 'rgba(255,140,62,0.06)',
  danger:  'rgba(255,107,107,0.10)',
}

const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR')
const fmt1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export default function WeightLossClient() {
  const [tab, setTab] = useState<Tab>('plan')

  /* 공통 입력 */
  const [currentWeight, setCurrentWeight] = useState('70')
  const [targetWeight, setTargetWeight]   = useState('63')
  const [height, setHeight]               = useState('170')
  const [gender, setGender]               = useState<Gender>('male')
  const [age, setAge]                     = useState('30')
  const [tdee, setTdee]                   = useState('2200')
  // SSR/Client 일치를 위해 빈 문자열로 초기화 → useEffect에서 클라이언트 시각으로 설정 (hydration 안전)
  const [startDate, setStartDate]         = useState('')
  useEffect(() => {
    setStartDate(todayISO())
  }, [])

  const cw = parseFloat(currentWeight) || 0
  const tw = parseFloat(targetWeight) || 0
  const h  = parseFloat(height) || 0
  const a  = parseInt(age, 10) || 0
  const td = parseFloat(tdee) || 0

  const inputValid = cw > 0 && tw > 0 && cw > tw && h >= 100 && h <= 250 && a >= 10 && a <= 100 && td > 0

  /* 탭 1: 감량 계획 */
  const [speedId, setSpeedId] = useState('slow')
  const plateauMode: PlateauMode = 'realistic'

  const plan = useMemo(() => {
    if (!inputValid || !startDate) return null
    return calcWeightLossPlan({
      currentWeight: cw, targetWeight: tw, height: h,
      gender, age: a, tdee: td, speedId, startDate,
    }, plateauMode)
  }, [inputValid, cw, tw, h, gender, a, td, speedId, startDate, plateauMode])

  const currentBMICat = bmiCategoryName(plan?.currentBMI ?? 0)
  const targetBMICat  = bmiCategoryName(plan?.targetBMI ?? 0)

  /* 탭 2: 목표일 역산 */
  const [targetDate, setTargetDate] = useState('')
  useEffect(() => {
    setTargetDate(addDays(todayISO(), 56))
  }, [])
  const targetDateResult = useMemo(() => {
    if (!inputValid) return null
    return calcDeficitForTargetDate({
      currentWeight: cw, targetWeight: tw, height: h,
      gender, age: a, tdee: td, startDate,
    }, targetDate)
  }, [inputValid, cw, tw, h, gender, a, td, startDate, targetDate])

  const alternatives = useMemo(() => {
    if (!targetDateResult) return []
    return calcAlternatives(cw - tw, cw, td, Math.ceil(targetDateResult.totalWeeks))
  }, [targetDateResult, cw, tw, td])

  /* 탭 3: 식단/운동 */
  const [dietPortionPct, setDietPortionPct] = useState(60)
  const [exerciseFreq, setExerciseFreq] = useState(4)
  const [selectedExerciseId, setSelectedExerciseId] = useState('jogging')

  const split = useMemo(() => {
    if (!plan) return null
    return splitDietExercise(plan.dailyDeficit, dietPortionPct / 100, exerciseFreq)
  }, [plan, dietPortionPct, exerciseFreq])


  /* 탭 5: 매크로 */
  const [proteinId, setProteinId] = useState('active')
  const proteinTarget = PROTEIN_TARGETS.find(p => p.id === proteinId) ?? PROTEIN_TARGETS[1]
  const [fatRatio, setFatRatio] = useState(25)

  const macros = useMemo(() => {
    if (!plan) return null
    return calcMacros(plan.targetDailyCalories, cw, proteinTarget.gPerKg, fatRatio / 100)
  }, [plan, cw, proteinTarget, fatRatio])

  const mealSplit = useMemo(() => {
    if (!macros || !plan) return []
    return calcMealSplit(macros, plan.targetDailyCalories)
  }, [macros, plan])

  /* 복사 */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* */ }
  }

  /* 청소년 경고 */
  const teenWarn = a > 0 && a < 18

  /* SVG 그래프 좌표 계산 */
  const chartData = useMemo(() => {
    const progression = plan?.weeklyProgression
    if (!progression || progression.length < 2) return null
    const W = 600, H = 240, pad = { l: 50, r: 16, t: 18, b: 36 }
    const xs = progression.map(p => p.week)
    const ys = progression.map(p => p.weight)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys, tw)
    const maxY = Math.max(...ys, cw)
    const xScale = (x: number) => pad.l + ((W - pad.l - pad.r) * x) / (maxX || 1)
    const yScale = (y: number) => pad.t + ((H - pad.t - pad.b) * (maxY - y)) / ((maxY - minY) || 1)
    const points = progression.map(p => `${xScale(p.week).toFixed(1)},${yScale(p.weight).toFixed(1)}`).join(' ')

    // BMI 정상 범위 → 체중 범위
    const hM = h / 100
    const normalMinW = 18.5 * hM * hM
    const normalMaxW = 22.9 * hM * hM
    const normalTop = yScale(Math.min(normalMaxW, maxY))
    const normalBottom = yScale(Math.max(normalMinW, minY))
    const underTop = yScale(Math.min(18.5 * hM * hM, maxY))
    const underBottom = H - pad.b

    return {
      W, H, pad, points, xScale, yScale, maxX, minY, maxY,
      progression,
      normalTop, normalBottom,
      underTop, underBottom,
      cw, tw, hM,
      maintenancePoints: progression.filter(p => p.isMaintenance),
    }
  }, [plan, h, cw, tw])

  /* ──────────────────── 렌더 ──────────────────── */
  return (
    <div className={styles.wrap}>

      {/* 면책 (강한 톤) */}
      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량' },
          { href: '/tools/health/weightloss', label: '체중감량 계산기' }
        ]}
      >
        의학적 진단·치료 도구가 아닙니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* 공통 입력 */}
      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>현재 체중</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="70" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>목표 체중</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="63" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
      </div>

      <div className={styles.fieldRow3}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>키</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="170" value={height} onChange={e => setHeight(e.target.value)} />
            <span className={styles.unit}>cm</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>나이</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30" value={age} onChange={e => setAge(e.target.value)} />
            <span className={styles.unit}>세</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>성별</label>
          <div className={styles.toggleRow}>
            <button className={`${styles.toggleBtn} ${gender === 'male' ? styles.toggleActive : ''}`}
              onClick={() => setGender('male')}>♂</button>
            <button className={`${styles.toggleBtn} ${gender === 'female' ? styles.toggleActive : ''}`}
              onClick={() => setGender('female')}>♀</button>
          </div>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            TDEE
            <a href="/tools/health/bmr" style={{ fontSize: 10.5, color: 'var(--accent)', textDecoration: 'underline', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
              BMR 계산기에서 가져오기 →
            </a>
          </label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="2200" value={tdee} onChange={e => setTdee(e.target.value)} />
            <span className={styles.unit}>kcal</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>시작일</label>
          <input className={styles.dateInput} type="date"
            value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
      </div>

      {teenWarn && (
        <div className={styles.criticalBox}>
          🔴 <strong>18세 미만</strong> 청소년에게 본 도구는 부적합합니다 — 성장기에는 체중 감량보다 균형 잡힌 영양 섭취가 우선입니다.
          소아청소년과 전문의 상담을 권장합니다.
        </div>
      )}

      {!inputValid && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>현재 체중·목표 체중·키·나이·TDEE를 입력하세요</div>
          현재 체중은 목표 체중보다 높아야 합니다 · 키 100~250cm · 나이 10~100세
        </div>
      )}

      {/* ──────── 탭 1: 감량 계획 ──────── */}
      {tab === 'plan' && plan && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>감량 속도 선택</label>
            <div className={styles.speedList}>
              {SAFE_SPEEDS.map(s => (
                <button key={s.id}
                  className={`${styles.speedCard} ${speedId === s.id ? styles.speedCardActive : ''}`}
                  style={{ borderLeftColor: s.color }}
                  onClick={() => setSpeedId(s.id)}>
                  <div>
                    <h3>{s.name} {'★'.repeat(s.stars)}</h3>
                    <p>{s.desc}</p>
                  </div>
                  <div className={styles.speedPercent} style={{ color: s.color }}>
                    {s.percentPerWeek}<small>%/주</small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 히어로 */}
          <div className={styles.hero}
            style={{ borderColor: SEVERITY_BORDER[plan.safety.severity], background: SEVERITY_BG[plan.safety.severity] }}>
            <div className={styles.heroLabel}>감량 계획</div>
            <div className={styles.heroNum} style={{ color: 'var(--accent)' }}>
              {fmt1(plan.totalLossKg)}<span className={styles.heroNumUnit}>kg</span>
              <span style={{ fontSize: '0.5em', color: 'var(--muted)', margin: '0 8px' }}>·</span>
              {plan.weeksRequired}<span className={styles.heroNumUnit}>주</span>
            </div>
            <div className={styles.heroSub}>
              주당 {fmt1(plan.weeklyLossKg)}kg · 하루 적자 {fmt(plan.dailyDeficit)}kcal · 목표 섭취 {fmt(plan.targetDailyCalories)}kcal/일
            </div>
            <div className={styles.heroDate}>📅 종료일: {formatDateKo(plan.endDate)}</div>
            <div style={{ marginTop: 12 }}>
              <span className={`${styles.severityBadge} ${SEVERITY_CLASS[plan.safety.severity]}`}>
                {SEVERITY_LABEL[plan.safety.severity]}
              </span>
            </div>
          </div>

          {/* BMI 체크 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>목표 BMI 자동 체크</label>
            <div className={styles.bmiCheck}>
              <div className={styles.bmiBox}>
                <small>현재</small>
                <div style={{ color: currentBMICat.color }}>{plan.currentBMI.toFixed(1)}</div>
                <p style={{ color: currentBMICat.color }}>{currentBMICat.name}</p>
              </div>
              <span className={styles.bmiArrow}>▶</span>
              <div className={styles.bmiBox}>
                <small>목표</small>
                <div style={{ color: targetBMICat.color }}>{plan.targetBMI.toFixed(1)}</div>
                <p style={{ color: targetBMICat.color }}>{targetBMICat.name}</p>
              </div>
            </div>
            {targetBMICat.isUnder && (
              <div className={styles.warnBox} style={{ marginTop: 10 }}>
                ⚠️ <strong>목표 BMI {plan.targetBMI.toFixed(1)}은 저체중 범위</strong>입니다. 건강상 권장하지 않습니다 — 정상 범위(18.5~22.9) 목표를 권장합니다.
              </div>
            )}
          </div>

          {/* 안전 경고 */}
          {plan.safety.warnings.length > 0 && (
            <div className={plan.safety.severity === 'danger' ? styles.criticalBox : styles.warnBox}>
              <strong>{plan.safety.severity === 'danger' ? '🔴 위험' : '⚠️ 안전 경고'}</strong>
              <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 0 }}>
                {plan.safety.warnings.map((w, i) => <li key={i} style={{ marginBottom: 4 }}>{w}</li>)}
              </ul>
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                💛 체중 강박·식이 장애 우려 시 — 정신건강 위기상담 <strong style={{ color: '#FF6B6B' }}>1577-0199</strong> · 자살예방 <strong style={{ color: '#FF6B6B' }}>1393</strong> (24시간)
              </p>
              {(plan.safety.severity === 'danger' || plan.safety.severity === 'warning') && (
                <button className={styles.copyBtn} style={{ marginTop: 8 }}
                  onClick={() => setSpeedId('slow')}>
                  ✨ 안정 감량(0.5%/주)으로 변경
                </button>
              )}
            </div>
          )}

          {/* 상세 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>감량 상세</label>
            <div className={styles.detailTable}>
              <div className={styles.detailRow}><span>총 감량</span><span>{fmt1(plan.totalLossKg)} kg</span></div>
              <div className={styles.detailRow}><span>감량 속도</span><span>주당 {fmt1(plan.weeklyLossKg)} kg ({plan.weeklyLossPercent}%)</span></div>
              <div className={styles.detailRow}><span>하루 칼로리 적자</span><span>{fmt(plan.dailyDeficit)} kcal</span></div>
              <div className={styles.detailRow}><span>TDEE</span><span>{fmt(td)} kcal</span></div>
              <div className={`${styles.detailRow} ${styles.detailRowAccent}`}><span>목표 섭취 칼로리</span><span>{fmt(plan.targetDailyCalories)} kcal/일</span></div>
              <div className={styles.detailRow}><span>소요 기간</span><span>{plan.weeksRequired}주 (약 {(plan.weeksRequired / 4.33).toFixed(1)}개월)</span></div>
              <div className={styles.detailRow}><span>종료일</span><span>{plan.endDate}</span></div>
            </div>
          </div>

          {/* 그래프 */}
          {chartData && (() => {
            // y축 보조선: 체중 범위를 4등분 + 시작/끝 + 정상 BMI 경계
            const yStep = (chartData.maxY - chartData.minY) / 4
            const yTicks = [0, 1, 2, 3, 4].map((i) => chartData.minY + yStep * i)
            // x축 보조선: 4등분
            const xTicks = [0, 1, 2, 3, 4].map((i) => Math.round((chartData.maxX * i) / 4))
            const innerW = chartData.W - chartData.pad.l - chartData.pad.r
            const innerH = chartData.H - chartData.pad.t - chartData.pad.b
            // 정상 BMI 경계 체중 (라벨용)
            const normalMaxKg = 22.9 * chartData.hM * chartData.hM
            const normalMinKg = 18.5 * chartData.hM * chartData.hM
            return (
              <div className={styles.card}>
                <label className={styles.cardLabel}>체중 변화 그래프</label>
                <div className={styles.chartWrap}>
                  <svg viewBox={`0 0 ${chartData.W} ${chartData.H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
                    {/* 정상 BMI 영역 */}
                    <rect
                      x={chartData.pad.l} y={chartData.normalTop}
                      width={innerW}
                      height={Math.max(0, chartData.normalBottom - chartData.normalTop)}
                      fill="rgba(62,255,155,0.10)" />
                    {/* 저체중 영역 */}
                    <rect
                      x={chartData.pad.l} y={chartData.underTop}
                      width={innerW}
                      height={Math.max(0, chartData.underBottom - chartData.underTop)}
                      fill="rgba(255,107,107,0.08)" />

                    {/* y축 보조선 */}
                    {yTicks.map((y, i) => (
                      <g key={`yt-${i}`}>
                        <line x1={chartData.pad.l} y1={chartData.yScale(y)}
                          x2={chartData.W - chartData.pad.r} y2={chartData.yScale(y)}
                          stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" opacity={0.5} />
                        <text x={chartData.pad.l - 6} y={chartData.yScale(y) + 4}
                          fontSize="11" fill="var(--muted)" fontFamily="Inter, system-ui, sans-serif" textAnchor="end" fontWeight="600">
                          {y.toFixed(0)}kg
                        </text>
                      </g>
                    ))}

                    {/* x축 보조선 */}
                    {xTicks.map((x, i) => (
                      <g key={`xt-${i}`}>
                        <line x1={chartData.xScale(x)} y1={chartData.pad.t}
                          x2={chartData.xScale(x)} y2={chartData.H - chartData.pad.b}
                          stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" opacity={0.4} />
                        <text x={chartData.xScale(x)} y={chartData.H - chartData.pad.b + 16}
                          fontSize="11" fill="var(--muted)" fontFamily="Inter, system-ui, sans-serif" textAnchor="middle" fontWeight="600">
                          {x}주
                        </text>
                      </g>
                    ))}

                    {/* 정상 BMI 경계 라벨 */}
                    {normalMaxKg < chartData.maxY && normalMaxKg > chartData.minY && (
                      <text x={chartData.W - chartData.pad.r - 4} y={chartData.yScale(normalMaxKg) - 4}
                        fontSize="10" fill="#3EFF9B" fontFamily="Inter, system-ui, sans-serif" textAnchor="end" fontWeight="700">
                        BMI 23 ({normalMaxKg.toFixed(0)}kg)
                      </text>
                    )}
                    {normalMinKg < chartData.maxY && normalMinKg > chartData.minY && (
                      <text x={chartData.W - chartData.pad.r - 4} y={chartData.yScale(normalMinKg) - 4}
                        fontSize="10" fill="#FF8C8C" fontFamily="Inter, system-ui, sans-serif" textAnchor="end" fontWeight="700">
                        BMI 18.5 ({normalMinKg.toFixed(0)}kg)
                      </text>
                    )}

                    {/* 축 */}
                    <line x1={chartData.pad.l} y1={chartData.H - chartData.pad.b}
                      x2={chartData.W - chartData.pad.r} y2={chartData.H - chartData.pad.b}
                      stroke="var(--border)" strokeWidth="1.5" />
                    <line x1={chartData.pad.l} y1={chartData.pad.t}
                      x2={chartData.pad.l} y2={chartData.H - chartData.pad.b}
                      stroke="var(--border)" strokeWidth="1.5" />

                    {/* 라인 */}
                    <polyline points={chartData.points} fill="none"
                      stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />

                    {/* 시작·종료 점 + 라벨 */}
                    {chartData.progression.length > 0 && (
                      <>
                        <circle cx={chartData.xScale(chartData.progression[0].week)} cy={chartData.yScale(chartData.progression[0].weight)} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
                        <circle cx={chartData.xScale(chartData.progression[chartData.progression.length-1].week)} cy={chartData.yScale(chartData.progression[chartData.progression.length-1].weight)} r="5" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2" />
                      </>
                    )}

                    {/* 중간 마커 */}
                    {chartData.progression.filter((_, i) => i > 0 && i < chartData.progression.length - 1 && i % Math.max(1, Math.floor(chartData.progression.length / 6)) === 0).map((p, i) => (
                      <circle key={i}
                        cx={chartData.xScale(p.week)} cy={chartData.yScale(p.weight)}
                        r="3" fill="var(--accent)" />
                    ))}
                  </svg>
                </div>
                <div className={styles.chartLegend}>
                  <span><i style={{ background: 'var(--accent)' }} /> 체중 변화</span>
                  <span><i style={{ background: 'rgba(62,255,155,0.30)' }} /> 정상 BMI 범위</span>
                  <span><i style={{ background: 'rgba(255,107,107,0.30)' }} /> 저체중</span>
                </div>
              </div>
            )
          })()}

          {/* 탄단지 (매크로) — 결과로 자동 표시 */}
          {macros && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>🥗 탄단지(매크로) 분배 — {fmt(plan.targetDailyCalories)}kcal/일 기준</label>
              <div className={styles.macroBar} style={{ marginBottom: 10 }}>
                <div className={styles.macroSeg} style={{ width: `${macros.protein.percent}%`, background: 'var(--accent)' }}>
                  단 {macros.protein.percent}%
                </div>
                <div className={styles.macroSeg} style={{ width: `${macros.fat.percent}%`, background: '#FFD700' }}>
                  지 {macros.fat.percent}%
                </div>
                <div className={styles.macroSeg} style={{ width: `${macros.carb.percent}%`, background: '#FF8C3E' }}>
                  탄 {macros.carb.percent}%
                </div>
              </div>
              <div className={styles.macroTable}>
                <div className={`${styles.macroRow} ${styles.headerRow}`}>
                  <span>매크로</span><span>g</span><span>kcal</span><span>%</span>
                </div>
                <div className={styles.macroRow} style={{ borderLeftColor: 'var(--accent)' }}>
                  <span>🥩 단백질 ({proteinTarget.gPerKg}g/kg)</span>
                  <span>{macros.protein.g}g</span>
                  <span>{fmt(macros.protein.kcal)}</span>
                  <span>{macros.protein.percent}%</span>
                </div>
                <div className={styles.macroRow} style={{ borderLeftColor: '#FFD700' }}>
                  <span>🥑 지방 ({fatRatio}%)</span>
                  <span>{macros.fat.g}g</span>
                  <span>{fmt(macros.fat.kcal)}</span>
                  <span>{macros.fat.percent}%</span>
                </div>
                <div className={styles.macroRow} style={{ borderLeftColor: '#FF8C3E' }}>
                  <span>🍚 탄수화물</span>
                  <span>{macros.carb.g}g</span>
                  <span>{fmt(macros.carb.kcal)}</span>
                  <span>{macros.carb.percent}%</span>
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
                💡 단백질 {macros.protein.g}g ≈ 닭가슴살 {Math.round(macros.protein.g / 23)}× 100g · 계란 {Math.round(macros.protein.g / 6)}개 / 탄수 {macros.carb.g}g ≈ 밥 {(macros.carb.g / 75).toFixed(1)}공기. 감량 시 단백질 1.6g/kg 권장 (근손실 방지·포만감).
              </p>
            </div>
          )}

          <div className={styles.resultActions}>
            <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={() => copy(`${cw}kg → ${tw}kg (${fmt1(plan.totalLossKg)}kg) / ${plan.weeksRequired}주 / 하루 적자 ${fmt(plan.dailyDeficit)}kcal / 목표 섭취 ${fmt(plan.targetDailyCalories)}kcal·일 / 종료일 ${plan.endDate}`)}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
            <button className={styles.copyBtn} onClick={() => setTab('split')}>🍽️ 식단+운동 분리 보기</button>
          </div>
        </>
      )}

      {/* ──────── 탭 2: 목표일 역산 ──────── */}
      {tab === 'date' && inputValid && (
        <>
          <div className={styles.disclaimer}>
            <strong>목표일 역산</strong> — &lsquo;8주 안에 4kg 빼려면 하루 얼마나 적자가 필요할까?&rsquo; — 목표 날짜를 입력하면 필요 적자와 안전도를 자동 검증합니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>목표 날짜</label>
            <input className={styles.dateInput} type="date"
              value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            <div className={styles.optionRow4} style={{ marginTop: 8 }}>
              {[28, 56, 84, 112].map(days => (
                <button key={days}
                  className={styles.optionBtn}
                  onClick={() => setTargetDate(addDays(startDate, days))}>
                  +{days / 7}주
                </button>
              ))}
            </div>
          </div>

          {targetDateResult && (
            <>
              <div className={styles.hero}
                style={{
                  borderColor: targetDateResult.feasibility === 'safe' ? '#3EFF9B' :
                               targetDateResult.feasibility === 'caution' ? '#FFD700' :
                               targetDateResult.feasibility === 'aggressive' ? '#FF8C3E' : '#FF6B6B',
                  background: targetDateResult.feasibility === 'safe' ? 'rgba(62,255,155,0.06)' :
                              targetDateResult.feasibility === 'caution' ? 'rgba(255,215,0,0.06)' :
                              targetDateResult.feasibility === 'aggressive' ? 'rgba(255,140,62,0.06)' : 'rgba(255,107,107,0.10)',
                }}>
                <div className={styles.heroLabel}>{targetDateResult.totalWeeks.toFixed(1)}주 안에 {fmt1(cw - tw)}kg 감량</div>
                <div className={styles.heroNum} style={{ color: '#FFD700' }}>
                  {fmt(targetDateResult.dailyDeficit)}<span className={styles.heroNumUnit}>kcal/일</span>
                </div>
                <div className={styles.heroSub}>
                  주당 {fmt1(targetDateResult.weeklyLossKg)}kg ({targetDateResult.weeklyLossPercent}%) · 목표 섭취 {fmt(targetDateResult.targetDailyCalories)}kcal/일
                </div>
                <div className={styles.heroDate}>📅 {formatDateKo(targetDate)}</div>
                <div style={{ marginTop: 12 }}>
                  <span className={`${styles.severityBadge} ${
                    targetDateResult.feasibility === 'safe' ? styles.severitySafe :
                    targetDateResult.feasibility === 'caution' ? styles.severityCaution :
                    targetDateResult.feasibility === 'aggressive' ? styles.severityWarning : styles.severityDanger
                  }`}>
                    {targetDateResult.feasibility === 'safe' && '🟢 안전'}
                    {targetDateResult.feasibility === 'caution' && '🟡 주의'}
                    {targetDateResult.feasibility === 'aggressive' && '🟠 적극'}
                    {targetDateResult.feasibility === 'dangerous' && '🔴 위험'}
                  </span>
                </div>
              </div>

              {targetDateResult.feasibility === 'dangerous' && (
                <div className={styles.criticalBox}>
                  <strong>🔴 위험 — 이 목표는 권장 한도를 초과합니다</strong>
                  <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--muted)' }}>
                    주당 {targetDateResult.weeklyLossPercent}% 감량은 권장 한도(1%)를 초과합니다.
                    근손실·요요·영양 부족·호르몬 이상 위험이 매우 높습니다. 아래 안전 대안을 권장합니다.
                  </p>
                </div>
              )}

              {/* 대안 표 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>대안 기간 비교 (안전 대안 자동 추천)</label>
                <div className={styles.altTable}>
                  {alternatives.map((alt, i) => {
                    const color = alt.feasibility === 'safe' ? '#3EFF9B' :
                                  alt.feasibility === 'caution' ? '#FFD700' :
                                  alt.feasibility === 'aggressive' ? '#FF8C3E' : '#FF6B6B'
                    return (
                      <div key={i}
                        className={styles.altRow}
                        style={{ borderLeftColor: color }}
                        onClick={() => setTargetDate(addDays(startDate, alt.weeks * 7))}>
                        <div className={styles.altWeeks}>
                          {alt.weeks}주
                          <small>약 {(alt.weeks / 4.33).toFixed(1)}개월</small>
                        </div>
                        <span className={styles.altPercent} style={{ color }}>
                          {alt.feasibility === 'safe' && '🟢 안전'}
                          {alt.feasibility === 'caution' && '🟡 주의'}
                          {alt.feasibility === 'aggressive' && '🟠 적극'}
                          {alt.feasibility === 'dangerous' && '🔴 위험'}
                          {alt.isRecommended && ' ★'}
                        </span>
                        <span className={styles.altPercent}>주 {alt.weeklyLossPercent}%</span>
                        <span className={styles.altDeficit}>{fmt(alt.dailyDeficit)}kcal/일</span>
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                  💡 대안을 클릭하면 해당 기간으로 자동 변경됩니다. ★는 가장 안전한 옵션.
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ──────── 탭 3: 식단·운동 분리 ──────── */}
      {tab === 'split' && plan && split && (
        <>
          <div className={styles.disclaimer}>
            <strong>식단 vs 운동</strong> — 칼로리 적자를 어디서 만들지 분배합니다. 추천 분배는 식단 60% + 운동 40% (근손실 방지·지속 가능).
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>식단 비율 — 식단 {dietPortionPct}% / 운동 {100 - dietPortionPct}%</label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="0" max="100" step="10"
                value={dietPortionPct} onChange={e => setDietPortionPct(parseInt(e.target.value, 10))} />
              <span className={styles.sliderVal}>{dietPortionPct}%</span>
            </div>
            <div className={styles.optionRow4} style={{ marginTop: 8 }}>
              {[
                { v: 100, label: '식단 100%' },
                { v: 60,  label: '식단 60%' },
                { v: 50,  label: '균등 50%' },
                { v: 0,   label: '운동 100%' },
              ].map(o => (
                <button key={o.v}
                  className={`${styles.optionBtn} ${dietPortionPct === o.v ? styles.optionActive : ''}`}
                  onClick={() => setDietPortionPct(o.v)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>주간 운동 횟수 — {exerciseFreq}회</label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="0" max="7" step="1"
                value={exerciseFreq} onChange={e => setExerciseFreq(parseInt(e.target.value, 10))} />
              <span className={styles.sliderVal}>{exerciseFreq}회</span>
            </div>
          </div>

          <div className={styles.hero}
            style={{ borderColor: 'rgba(255,140,62,0.30)', background: 'rgba(255,140,62,0.06)' }}>
            <div className={styles.heroLabel}>분배 결과</div>
            <div className={styles.heroNum} style={{ color: '#FF8C3E' }}>
              {fmt(split.dietDailyDeficit)}<span style={{ fontSize: '0.4em', color: 'var(--muted)' }}>+</span>{fmt(split.exerciseDailyDeficit)}
              <span className={styles.heroNumUnit}>kcal/일</span>
            </div>
            <div className={styles.heroSub}>
              하루 식단 적자 <strong style={{ color: '#FF8C3E' }}>{fmt(split.dietDailyDeficit)}kcal</strong> + 운동 소모 <strong style={{ color: '#FF8C3E' }}>{fmt(split.exerciseDailyDeficit)}kcal</strong>
              {exerciseFreq > 0 && <><br />주 {exerciseFreq}회 · 1회당 {fmt(split.perSessionKcal)}kcal 소모</>}
            </div>
          </div>

          {exerciseFreq > 0 && split.perSessionKcal > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                {fmt(split.perSessionKcal)}kcal 소모 시간 — 체중 {cw}kg 기준
              </label>
              <div className={styles.exerciseTable}>
                <div className={`${styles.exerciseRow} ${styles.headerRow}`}>
                  <span></span><span>운동 종류</span><span style={{ textAlign: 'right' }}>METs</span><span style={{ textAlign: 'right' }}>시간</span>
                </div>
                {EXERCISES
                  .map(e => ({ ...e, time: exerciseTimeFor(split.perSessionKcal, e, cw) }))
                  .sort((a, b) => a.time.minutes - b.time.minutes)
                  .map(e => (
                    <div key={e.id}
                      className={styles.exerciseRow}
                      style={selectedExerciseId === e.id ? { borderColor: 'var(--accent)', background: 'var(--accent-dim)' } : {}}
                      onClick={() => setSelectedExerciseId(e.id)}>
                      <span className={styles.exerciseIcon}>{e.icon}</span>
                      <span className={styles.exerciseName}>{e.name}</span>
                      <span className={styles.exerciseMet}>{e.met}</span>
                      <span className={styles.exerciseTime}>약 {e.time.minutes}분</span>
                    </div>
                  ))}
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                💡 METs(Metabolic Equivalent of Task) 표준값 기반 — kcal/h = METs × 체중(kg) × 1.05.
                실제 소모는 강도·심박·개인차에 따라 ±20% 차이 가능. 스마트워치 데이터 활용 권장.
              </p>
            </div>
          )}

          <div className={styles.infoBox}>
            💡 <strong>식단 + 운동 병행이 가장 안정적</strong> — 식단만(100%): 빠르지만 근손실↑·정체기 빠름 / 운동만(100%): 너무 많은 운동 시간 필요·부상 위험↑ / <strong style={{ color: 'var(--text)' }}>균형(60/40)</strong>: 근육 유지·심혈관 건강·지속 가능.
          </div>
        </>
      )}

      {/* 면책 강화 */}
      <div className={styles.warnBox}>
        💛 <strong>건강한 다이어트의 핵심은 &lsquo;빠르게&rsquo;가 아닌 &lsquo;꾸준히&rsquo;.</strong>
        체중 강박·다이어트 강박·식이 장애 우려 시 — 정신건강 위기상담 <strong>1577-0199</strong> · 자살예방 <strong>1393</strong> (24시간) · 한국섭식장애협회.
        18세 미만·임산부·만성질환자는 본 도구를 사용하지 마세요.
      </div>
    </div>
  )
}
