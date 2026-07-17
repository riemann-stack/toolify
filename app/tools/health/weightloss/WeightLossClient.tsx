'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState, useEffect } from 'react'
import styles from './weightloss.module.css'
import {
  Gender, Severity, PlateauMode,
  SAFE_SPEEDS, EXERCISES, PROTEIN_TARGETS,
  calcWeightLossPlan, calcDeficitForTargetDate, calcAlternatives,
  splitDietExercise, exerciseTimeFor, calcMacros,
  bmiCategoryName, todayISO, formatDateKo, addDays,
} from './weightLossUtils'

type Tab = 'plan' | 'split' | 'date'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'plan',    name: '식단 조절',   icon: '' },
  { id: 'split',   name: '식단+운동',   icon: '' },
  { id: 'date',    name: '목표일 기준', icon: '' },
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
  safe:    'rgba(16,185,129,0.40)',
  caution: 'rgba(161,98,7,0.40)',
  warning: 'rgba(234,88,12,0.40)',
  danger:  '#DC2626',
}
const SEVERITY_BG: Record<Severity, string> = {
  safe:    'rgba(16,185,129,0.06)',
  caution: 'rgba(161,98,7,0.06)',
  warning: 'rgba(234,88,12,0.06)',
  danger:  'rgba(220,38,38,0.10)',
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  /* 목표일 역산 (탭 3) */
  const [targetDate, setTargetDate] = useState('')
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  /* 식단/운동 분리 (탭 2) */
  const [dietPortionPct, setDietPortionPct] = useState(60)
  const [exerciseFreq, setExerciseFreq] = useState(4)
  const [selectedExerciseId, setSelectedExerciseId] = useState('jogging')

  const split = useMemo(() => {
    if (!plan) return null
    return splitDietExercise(plan.dailyDeficit, dietPortionPct / 100, exerciseFreq)
  }, [plan, dietPortionPct, exerciseFreq])


  /* 매크로 (탄단지) — 탭 1 결과에 표시 */
  const [proteinId, setProteinId] = useState('active')
  const proteinTarget = PROTEIN_TARGETS.find(p => p.id === proteinId) ?? PROTEIN_TARGETS[1]
  const [fatRatio, setFatRatio] = useState(25)

  const macros = useMemo(() => {
    if (!plan) return null
    return calcMacros(plan.targetDailyCalories, cw, proteinTarget.gPerKg, fatRatio / 100)
  }, [plan, cw, proteinTarget, fatRatio])

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

  /* 계산 불가 — 적자가 TDEE를 초과해 목표 섭취 칼로리가 0 이하(매크로 음수 방지) */
  const impossible = !!plan && plan.targetDailyCalories <= 0

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
          { href: '/tools/health/glycemic-load', label: '당부하지수(GL)' }
        ]}
        sources={[
          { label: '대한비만학회', href: 'https://www.kosso.or.kr' },
          { label: '보건복지부', href: 'https://www.mohw.go.kr' },
        ]}
      >
        의학적 진단·치료 도구가 아닙니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist" aria-label="감량 계산 방식">
        {TABS.map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* 공통 입력 — Row 1: 4열 (현재·목표·키·나이) */}
      <div className={styles.fieldRow4}>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="weightloss-weight">현재 체중</label>
          <div className={styles.inputRow}>
            <input id="weightloss-weight" className={styles.numInput} type="number" inputMode="decimal"
              placeholder="70" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="weightloss-weight-2">목표 체중</label>
          <div className={styles.inputRow}>
            <input id="weightloss-weight-2" className={styles.numInput} type="number" inputMode="decimal"
              placeholder="63" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="weightloss-height">키</label>
          <div className={styles.inputRow}>
            <input id="weightloss-height" className={styles.numInput} type="number" inputMode="decimal"
              placeholder="170" value={height} onChange={e => setHeight(e.target.value)} />
            <span className={styles.unit}>cm</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="weightloss-age">나이</label>
          <div className={styles.inputRow}>
            <input id="weightloss-age" className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30" value={age} onChange={e => setAge(e.target.value)} />
            <span className={styles.unit}>세</span>
          </div>
        </div>
      </div>

      {/* Row 2: 3열 (성별·TDEE·시작일) */}
      <div className={styles.fieldRow3}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>성별</label>
          <div className={styles.toggleRow} role="group" aria-label="성별">
            <button type="button" aria-label="남성" aria-pressed={gender === 'male'}
              className={`${styles.toggleBtn} ${gender === 'male' ? styles.toggleActive : ''}`}
              onClick={() => setGender('male')}>♂</button>
            <button type="button" aria-label="여성" aria-pressed={gender === 'female'}
              className={`${styles.toggleBtn} ${gender === 'female' ? styles.toggleActive : ''}`}
              onClick={() => setGender('female')}>♀</button>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="weightloss-tdee-bmr">
            <span>TDEE</span>
            <a href="/tools/health/bmr" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'underline', textTransform: 'none', letterSpacing: 0, fontWeight: 400, display: 'block', marginTop: 2 }}>
              BMR 계산기로 계산하기 →
            </a>
          </label>
          <div className={styles.inputRow}>
            <input id="weightloss-tdee-bmr" className={styles.numInput} type="number" inputMode="numeric"
              placeholder="2200" value={tdee} onChange={e => setTdee(e.target.value)} />
            <span className={styles.unit}>kcal</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="weightloss-start">시작일</label>
          <input id="weightloss-start" className={styles.dateInput} type="date"
            value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
      </div>

      {teenWarn && (
        <div className={styles.criticalBox}>
          🔴 <strong>18세 미만</strong> 청소년에게 본 도구는 부적합합니다 — 성장기에는 체중 감량보다 균형 잡힌 영양 섭취가 우선입니다.
          <strong> 감량 계획·목표 칼로리·그래프는 표시하지 않습니다.</strong> 식단·체중 목표는 소아청소년과 전문의와 상담하세요.
        </div>
      )}

      {!inputValid && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>현재 체중·목표 체중·키·나이·TDEE를 입력하세요</div>
          현재 체중은 목표 체중보다 높아야 합니다 · 키 100~250cm · 나이 10~100세
        </div>
      )}

      {/* 계산 불가 안내 (목표 섭취 ≤ 0) — plan·split 탭 공통 */}
      {plan && !teenWarn && impossible && tab !== 'date' && (
        <div className={styles.criticalBox}>
          🔴 <strong>계산 불가</strong> — 선택한 감량 속도의 하루 적자({fmt(plan.dailyDeficit)}kcal)가 TDEE({fmt(td)}kcal)를 초과해 <strong>목표 섭취 칼로리가 0 이하</strong>가 됩니다. 물리적으로 불가능한 계획이므로, 더 느린 감량 속도를 선택하거나 TDEE를 확인하세요.
          <button type="button" className={styles.copyBtn} style={{ marginTop: 10 }}
            onClick={() => setSpeedId('slow')}>
            안정 감량(0.5%/주)으로 변경
          </button>
        </div>
      )}

      {/* ──────── 탭 1: 감량 계획 ──────── */}
      {tab === 'plan' && plan && !teenWarn && !impossible && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>감량 속도 선택</label>
            <div className={styles.speedList}>
              {SAFE_SPEEDS.map(s => (
                <button key={s.id} type="button" aria-pressed={speedId === s.id}
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
            <div className={styles.heroDate}>종료일: {formatDateKo(plan.endDate)}</div>
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
                💛 체중 강박·식이 장애 우려 시 — 정신건강 위기상담 <strong style={{ color: '#DC2626' }}>1577-0199</strong> · 자살예방 <strong style={{ color: '#DC2626' }}>1393</strong> (24시간)
              </p>
              {(plan.safety.severity === 'danger' || plan.safety.severity === 'warning') && (
                <button type="button" className={styles.copyBtn} style={{ marginTop: 8 }}
                  onClick={() => setSpeedId('slow')}>
                  안정 감량(0.5%/주)으로 변경
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
                      fill="rgba(16,185,129,0.10)" />
                    {/* 저체중 영역 */}
                    <rect
                      x={chartData.pad.l} y={chartData.underTop}
                      width={innerW}
                      height={Math.max(0, chartData.underBottom - chartData.underTop)}
                      fill="rgba(220,38,38,0.08)" />

                    {/* y축 보조선 */}
                    {yTicks.map((y, i) => (
                      <g key={`yt-${i}`}>
                        <line x1={chartData.pad.l} y1={chartData.yScale(y)}
                          x2={chartData.W - chartData.pad.r} y2={chartData.yScale(y)}
                          stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" opacity={0.5} />
                        <text x={chartData.pad.l - 6} y={chartData.yScale(y) + 4}
                          fontSize="11" fill="var(--muted)" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' textAnchor="end" fontWeight="600">
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
                          fontSize="11" fill="var(--muted)" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' textAnchor="middle" fontWeight="600">
                          {x}주
                        </text>
                      </g>
                    ))}

                    {/* 정상 BMI 경계 라벨 */}
                    {normalMaxKg < chartData.maxY && normalMaxKg > chartData.minY && (
                      <text x={chartData.W - chartData.pad.r - 4} y={chartData.yScale(normalMaxKg) - 4}
                        fontSize="10" fill="#059669" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' textAnchor="end" fontWeight="700">
                        BMI 23 ({normalMaxKg.toFixed(0)}kg)
                      </text>
                    )}
                    {normalMinKg < chartData.maxY && normalMinKg > chartData.minY && (
                      <text x={chartData.W - chartData.pad.r - 4} y={chartData.yScale(normalMinKg) - 4}
                        fontSize="10" fill="#DC2626" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' textAnchor="end" fontWeight="700">
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
                  <span><i style={{ background: 'rgba(16,185,129,0.30)' }} /> 정상 BMI 범위</span>
                  <span><i style={{ background: 'rgba(220,38,38,0.30)' }} /> 저체중</span>
                </div>
              </div>
            )
          })()}

          {/* 탄단지 (매크로) — 결과로 자동 표시 */}
          {macros && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>탄단지(매크로) 분배 — {fmt(plan.targetDailyCalories)}kcal/일 기준</label>

              {/* 단백질 목표 선택 */}
              <div className={styles.optionRow4} role="group" aria-label="단백질 목표">
                {PROTEIN_TARGETS.map(p => (
                  <button key={p.id} type="button" aria-pressed={proteinId === p.id}
                    className={`${styles.optionBtn} ${proteinId === p.id ? styles.optionActive : ''}`}
                    onClick={() => setProteinId(p.id)} title={p.desc}>
                    {p.name}
                    <br />
                    <small style={{ fontSize: 10, opacity: 0.7 }}>{p.gPerKg}g/kg{p.recommended ? ' ★' : ''}</small>
                  </button>
                ))}
              </div>
              {/* 지방 비율 슬라이더 */}
              <label className={styles.cardLabel} style={{ marginTop: 10 }}>지방 비율 — {fatRatio}%</label>
              <div className={styles.sliderRow}>
                <input className={styles.slider} type="range" min="15" max="40" step="5"
                  aria-label="지방 비율" aria-valuetext={`${fatRatio}%`}
                  value={fatRatio} onChange={e => setFatRatio(parseInt(e.target.value, 10))} />
                <span className={styles.sliderVal}>{fatRatio}%</span>
              </div>

              <div className={styles.macroBar} style={{ marginBottom: 10, marginTop: 10 }}>
                <div className={styles.macroSeg} style={{ width: `${macros.protein.percent}%`, background: 'var(--accent)' }}>
                  단 {macros.protein.percent}%
                </div>
                <div className={styles.macroSeg} style={{ width: `${macros.fat.percent}%`, background: '#A16207' }}>
                  지 {macros.fat.percent}%
                </div>
                <div className={styles.macroSeg} style={{ width: `${macros.carb.percent}%`, background: '#EA580C' }}>
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
                <div className={styles.macroRow} style={{ borderLeftColor: '#A16207' }}>
                  <span>🥑 지방 ({fatRatio}%)</span>
                  <span>{macros.fat.g}g</span>
                  <span>{fmt(macros.fat.kcal)}</span>
                  <span>{macros.fat.percent}%</span>
                </div>
                <div className={styles.macroRow} style={{ borderLeftColor: '#EA580C' }}>
                  <span>🍚 탄수화물</span>
                  <span>{macros.carb.g}g</span>
                  <span>{fmt(macros.carb.kcal)}</span>
                  <span>{macros.carb.percent}%</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
                💡 단백질 {macros.protein.g}g ≈ 닭가슴살 {Math.round(macros.protein.g / 23)}× 100g · 계란 {Math.round(macros.protein.g / 6)}개 / 탄수 {macros.carb.g}g ≈ 밥 {(macros.carb.g / 75).toFixed(1)}공기. 감량 시 단백질 1.6g/kg 권장 (근손실 방지·포만감).
              </p>
            </div>
          )}

          <div className={styles.resultActions}>
            <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={() => copy(`${cw}kg → ${tw}kg (${fmt1(plan.totalLossKg)}kg) / ${plan.weeksRequired}주 / 하루 적자 ${fmt(plan.dailyDeficit)}kcal / 목표 섭취 ${fmt(plan.targetDailyCalories)}kcal·일 / 종료일 ${plan.endDate}`)}>
              {copied ? '✓ 복사됨' : '복사'}
            </button>
            <button type="button" className={styles.copyBtn} onClick={() => setTab('split')}>식단+운동 분리 보기</button>
          </div>
        </>
      )}

      {/* ──────── 탭 3: 목표일 역산 ──────── */}
      {tab === 'date' && inputValid && !teenWarn && (
        <>
          <div className={styles.disclaimer}>
            <strong>목표일 역산</strong> — &lsquo;8주 안에 4kg 빼려면 하루 얼마나 적자가 필요할까?&rsquo; — 목표 날짜를 입력하면 필요 적자와 안전도를 자동 검증합니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel} htmlFor="weightloss-date">목표 날짜</label>
            <input id="weightloss-date" className={styles.dateInput} type="date"
              value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            <div className={styles.optionRow4} style={{ marginTop: 8 }}>
              {[28, 56, 84, 112].map(days => (
                <button key={days} type="button"
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
                  borderColor: targetDateResult.feasibility === 'safe' ? '#059669' :
                               targetDateResult.feasibility === 'caution' ? '#A16207' :
                               targetDateResult.feasibility === 'aggressive' ? '#EA580C' : '#DC2626',
                  background: targetDateResult.feasibility === 'safe' ? 'rgba(16,185,129,0.06)' :
                              targetDateResult.feasibility === 'caution' ? 'rgba(161,98,7,0.06)' :
                              targetDateResult.feasibility === 'aggressive' ? 'rgba(234,88,12,0.06)' : 'rgba(220,38,38,0.10)',
                }}>
                <div className={styles.heroLabel}>{targetDateResult.totalWeeks.toFixed(1)}주 안에 {fmt1(cw - tw)}kg 감량</div>
                <div className={styles.heroNum} style={{ color: '#A16207' }}>
                  {fmt(targetDateResult.dailyDeficit)}<span className={styles.heroNumUnit}>kcal/일</span>
                </div>
                <div className={styles.heroSub}>
                  주당 {fmt1(targetDateResult.weeklyLossKg)}kg ({targetDateResult.weeklyLossPercent}%) · 목표 섭취 {fmt(targetDateResult.targetDailyCalories)}kcal/일
                </div>
                <div className={styles.heroDate}>{formatDateKo(targetDate)}</div>
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

              {targetDateResult.warnings.length > 0 && (
                <div className={targetDateResult.feasibility === 'dangerous' ? styles.criticalBox : styles.warnBox}>
                  <strong>{targetDateResult.feasibility === 'dangerous' ? '🔴 위험 — 권장 한도 초과' : '⚠️ 안전 경고'}</strong>
                  <ul style={{ paddingLeft: 18, marginTop: 6, marginBottom: 0 }}>
                    {targetDateResult.warnings.map((w, i) => <li key={i} style={{ marginBottom: 4 }}>{w}</li>)}
                  </ul>
                  <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                    💛 체중 강박·식이 장애 우려 시 — 정신건강 위기상담 <strong style={{ color: '#DC2626' }}>1577-0199</strong> · 자살예방 <strong style={{ color: '#DC2626' }}>1393</strong> (24시간) · 아래 안전 대안을 권장합니다.
                  </p>
                </div>
              )}

              {/* 대안 표 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>대안 기간 비교 (안전 대안 자동 추천)</label>
                <div className={styles.altTable}>
                  {alternatives.map((alt, i) => {
                    const color = alt.feasibility === 'safe' ? '#059669' :
                                  alt.feasibility === 'caution' ? '#A16207' :
                                  alt.feasibility === 'aggressive' ? '#EA580C' : '#DC2626'
                    return (
                      <div key={i}
                        role="button" tabIndex={0}
                        aria-label={`${alt.weeks}주 계획으로 변경 — 주 ${alt.weeklyLossPercent}%`}
                        className={styles.altRow}
                        style={{ borderLeftColor: color }}
                        onClick={() => setTargetDate(addDays(startDate, alt.weeks * 7))}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTargetDate(addDays(startDate, alt.weeks * 7)) } }}>
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
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                  💡 대안을 클릭하면 해당 기간으로 자동 변경됩니다. ★는 가장 안전한 옵션.
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ──────── 탭 2: 식단·운동 분리 ──────── */}
      {tab === 'split' && plan && split && !teenWarn && !impossible && (
        <>
          <div className={styles.disclaimer}>
            <strong>식단 vs 운동</strong> — 칼로리 적자를 어디서 만들지 분배합니다. 추천 분배는 식단 60% + 운동 40% (근손실 방지·지속 가능).
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>식단 비율 — 식단 {dietPortionPct}% / 운동 {100 - dietPortionPct}%</label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="0" max="100" step="10"
                aria-label="식단 비율" aria-valuetext={`식단 ${dietPortionPct}% / 운동 ${100 - dietPortionPct}%`}
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
                <button key={o.v} type="button" aria-pressed={dietPortionPct === o.v}
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
                aria-label="주간 운동 횟수" aria-valuetext={`주 ${exerciseFreq}회`}
                value={exerciseFreq} onChange={e => setExerciseFreq(parseInt(e.target.value, 10))} />
              <span className={styles.sliderVal}>{exerciseFreq}회</span>
            </div>
          </div>

          <div className={styles.hero}
            style={{ borderColor: 'rgba(234,88,12,0.30)', background: 'rgba(234,88,12,0.06)' }}>
            <div className={styles.heroLabel}>분배 결과</div>
            <div className={styles.heroNum} style={{ color: '#EA580C' }}>
              {fmt(split.dietDailyDeficit)}<span style={{ fontSize: '0.4em', color: 'var(--muted)' }}>+</span>{fmt(split.exerciseDailyDeficit)}
              <span className={styles.heroNumUnit}>kcal/일</span>
            </div>
            <div className={styles.heroSub}>
              하루 식단 적자 <strong style={{ color: '#EA580C' }}>{fmt(split.dietDailyDeficit)}kcal</strong> + 운동 소모 <strong style={{ color: '#EA580C' }}>{fmt(split.exerciseDailyDeficit)}kcal</strong>
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
                      role="button" tabIndex={0}
                      aria-pressed={selectedExerciseId === e.id}
                      aria-label={`${e.name} — 약 ${e.time.minutes}분`}
                      className={styles.exerciseRow}
                      style={selectedExerciseId === e.id ? { borderColor: 'var(--accent)', background: 'var(--accent-dim)' } : {}}
                      onClick={() => setSelectedExerciseId(e.id)}
                      onKeyDown={ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setSelectedExerciseId(e.id) } }}>
                      <span className={styles.exerciseIcon}>{e.icon}</span>
                      <span className={styles.exerciseName}>{e.name}</span>
                      <span className={styles.exerciseMet}>{e.met}</span>
                      <span className={styles.exerciseTime}>약 {e.time.minutes}분</span>
                    </div>
                  ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
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
