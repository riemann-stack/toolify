'use client'

import { useMemo, useState, useEffect } from 'react'
import styles from './sourdough.module.css'

// ── 타입 ──────────────────────────────────
type Tab = 'diagnose' | 'predict'
type FlourType = 'bread' | 'mixed-whole' | 'mixed-rye' | 'mixed-both'
type WholePct = 0 | 15 | 40
type FeedFreq = 1 | 2
type Ratio = 1 | 2 | 3 | 5
type PFlour = 'bread' | 'whole' | 'rye'
type Cond = 'peak' | 'afterPeak' | 'deflated' | 'fridge'

// ── 체크박스 ─────────────────────────────
const BUBBLES: { id: string; label: string; danger?: boolean }[] = [
  { id: 'noBubbles',     label: '표면에 기포가 거의 없음' },
  { id: 'smallBubbles',  label: '표면에 작은 기포들이 있음' },
  { id: 'bigBubbles',    label: '내부에 큰 기포가 보임' },
  { id: 'rising',        label: '급이 후 부풀어오름' },
  { id: 'doubling',      label: '급이 12시간 내 2배 이상 성장' },
  { id: 'peakDrop',      label: '피크 후 다시 꺼짐 (주저앉음)' },
]
const SMELLS: { id: string; label: string; danger?: boolean }[] = [
  { id: 'flourOnly',   label: '밀가루 냄새만 남 (반응 없음)' },
  { id: 'slightSour',  label: '약간 시큼한 냄새' },
  { id: 'strongSour',  label: '강하게 시큼한 냄새' },
  { id: 'acetone',     label: '아세톤/매니큐어 냄새 (과발효 신호)', danger: true },
  { id: 'alcohol',     label: '알코올 냄새' },
]
const TEXTURES: { id: string; label: string }[] = [
  { id: 'thin',     label: '묽고 물처럼 흐름' },
  { id: 'pancake',  label: '팬케이크 반죽처럼 보통' },
  { id: 'thick',    label: '되직하고 점성 있음' },
]
const PATTERNS: { id: string; label: string }[] = [
  { id: 'samePeakTime',  label: '2회 연속 같은 시간에 피크 도달' },
  { id: 'repeatable',    label: '3회 이상 예측 가능한 피크' },
]

// ── 계산 로직 ─────────────────────────────
function getPeakHours(
  temp: number,
  ratio: number,
  flour: PFlour,
  cond: Cond
): { min: number; max: number; base: number } {
  const BASE = 4
  const tempFactor = Math.pow(2, (24 - temp) / 10)
  const ratioFactor = Math.log2(ratio + 1) * 0.8
  const flourFactor = { bread: 1.0, whole: 0.85, rye: 0.7 }[flour]
  const condFactor = { peak: 1.0, afterPeak: 1.2, deflated: 1.5, fridge: 2.5 }[cond]
  const hours = BASE * tempFactor * ratioFactor * flourFactor * condFactor
  return { min: Math.max(1, Math.round(hours * 0.8)), max: Math.round(hours * 1.2), base: hours }
}

function getDiagnosticScore(checks: Set<string>, day: number, temp: number) {
  let score = 0
  if (checks.has('doubling'))     score += 30
  if (checks.has('peakDrop'))     score += 15
  if (checks.has('repeatable'))   score += 25
  if (checks.has('samePeakTime')) score += 15
  if (checks.has('slightSour'))   score += 10
  if (checks.has('strongSour'))   score += 8
  if (checks.has('smallBubbles')) score += 5
  if (checks.has('bigBubbles'))   score += 10
  if (checks.has('rising'))       score += 10
  if (checks.has('pancake'))      score += 5
  if (checks.has('acetone'))      score -= 20
  if (checks.has('noBubbles'))    score -= 10
  if (checks.has('flourOnly'))    score -= 15
  const dayBonus = Math.min(day * 3, 30)
  score += dayBonus
  if (temp >= 22 && temp <= 26) score += 10

  const stage: 'initial' | 'unstable' | 'stabilizing' | 'stable' =
    score < 30 ? 'initial' : score < 55 ? 'unstable' : score < 75 ? 'stabilizing' : 'stable'
  const daysLeft = stage === 'stable' ? 0 : stage === 'stabilizing' ? 2 : stage === 'unstable' ? 5 : 10
  return { score, stage, daysLeft }
}

const STAGE_META = {
  initial:     { emoji: '🔴', label: '초기 활성화 단계',  desc: '1~4일, 반응 시작',           className: 'stageInitial' },
  unstable:    { emoji: '🟡', label: '불안정 발효 단계',  desc: '4~8일, 들쑥날쑥',             className: 'stageUnstable' },
  stabilizing: { emoji: '🟢', label: '안정화 진행 중',    desc: '8~14일, 패턴 형성',           className: 'stageStabilizing' },
  stable:      { emoji: '✅', label: '안정화 완료',       desc: '예측 가능한 피크 2~3회 이상', className: 'stageStable' },
} as const

function interpretChecks(checks: Set<string>, day: number): string[] {
  const msgs: string[] = []
  if (checks.has('acetone') && (checks.has('noBubbles') || !checks.has('doubling'))) {
    msgs.push('⚠️ 과산성화 신호입니다. 급이 비율을 1:5:5로 늘리거나 냉장 보관 후 리셋을 권장합니다.')
  }
  if (checks.has('repeatable')) {
    msgs.push('🎉 베이킹에 사용 준비가 됐습니다! 플로트 테스트로 최종 확인하세요.')
  } else if (checks.has('doubling') && checks.has('peakDrop')) {
    msgs.push('좋은 신호입니다! 피크 타이밍을 기록해 두면 다음 베이킹 일정 잡기가 쉬워집니다.')
  }
  if (checks.has('flourOnly') && day <= 2) {
    msgs.push('아직 초기 단계입니다. 24~48시간 더 기다려 보세요.')
  }
  if (checks.has('flourOnly') && day >= 5) {
    msgs.push('반응이 늦습니다. 통밀/호밀 10~20%를 섞거나 더 따뜻한 곳(24~26°C)으로 옮겨보세요.')
  }
  if (checks.has('alcohol') && !checks.has('doubling')) {
    msgs.push('알코올 냄새는 급이 주기가 부족한 신호입니다. 급이 간격을 줄여보세요.')
  }
  if (checks.has('thin') && day >= 3) {
    msgs.push('과발효로 묽어진 상태입니다. 밀가루 비율을 늘리거나(1:2:2 이상) 급이 횟수를 하루 2회로 조정하세요.')
  }
  if (day <= 3 && (checks.has('doubling') || checks.has('bigBubbles'))) {
    msgs.push('2~3일차의 활발한 반응은 유해균에 의한 일시적 현상일 수 있습니다. 곧 조용해져도 걱정하지 마세요.')
  }
  return msgs
}

// 발효 곡선 — 시각화용
function fermentCurve(t: number, peak: number): number {
  if (t <= 0) return 0
  const x = t / peak
  if (x <= 1) {
    const s = 1 / (1 + Math.exp(-10 * (x - 0.5)))
    const s0 = 1 / (1 + Math.exp(5))
    const s1 = 1 / (1 + Math.exp(-5))
    return 200 * (s - s0) / (s1 - s0)
  }
  const decay = Math.exp(-0.7 * (x - 1))
  return 200 * decay + 40 * (1 - decay)
}

const pad = (n: number) => String(n).padStart(2, '0')
function addHours(date: Date, hours: number) {
  const d = new Date(date); d.setTime(d.getTime() + hours * 3600 * 1000); return d
}
function fmtClock(d: Date) {
  const h = d.getHours()
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = ((h + 11) % 12) + 1
  return `${ampm} ${h12}시 ${pad(d.getMinutes())}분`
}
function fmtDayClock(d: Date, now: Date) {
  const sameDay = d.toDateString() === now.toDateString()
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = d.toDateString() === tomorrow.toDateString()
  const prefix = sameDay ? '오늘' : isTomorrow ? '내일' : `${d.getMonth() + 1}/${d.getDate()}`
  return `${prefix} ${fmtClock(d)}`
}

// ──────────────────────────────────────
export default function SourdoughClient() {
  const [tab, setTab] = useState<Tab>('diagnose')

  /* ════ 탭1 상태 ════ */
  const [day, setDay] = useState(5)
  const [temp, setTemp] = useState(23)
  const [flour, setFlour] = useState<FlourType>('bread')
  const [wholePct, setWholePct] = useState<WholePct>(0)
  const [freq, setFreq] = useState<FeedFreq>(1)
  const [ratio, setRatio] = useState<Ratio>(1)
  const [customRatio, setCustomRatio] = useState('')
  const [checks, setChecks] = useState<Set<string>>(new Set())
  const [feedHour, setFeedHour] = useState(8)
  const [feedMin, setFeedMin] = useState(0)

  const toggleCheck = (id: string) => {
    const next = new Set(checks)
    if (next.has(id)) next.delete(id); else next.add(id)
    setChecks(next)
  }

  const diag = useMemo(() => getDiagnosticScore(checks, day, temp), [checks, day, temp])
  const interpretations = useMemo(() => interpretChecks(checks, day), [checks, day])

  // 진단 탭의 급이 비율·밀가루 → 피크 시간 추정
  const diagFlour: PFlour = flour === 'bread' ? 'bread' : flour === 'mixed-rye' || flour === 'mixed-both' ? 'rye' : 'whole'
  const effRatio: number = useMemo(() => {
    if (customRatio && +customRatio > 0) return +customRatio
    return ratio
  }, [customRatio, ratio])
  const diagCond: Cond = diag.stage === 'stable' ? 'peak' : diag.stage === 'stabilizing' ? 'afterPeak' : 'deflated'
  const diagPeak = useMemo(() => getPeakHours(temp, effRatio, diagFlour, diagCond), [temp, effRatio, diagFlour, diagCond])

  // 추천 급이 간격
  const recInterval = useMemo(() => {
    if (temp >= 24 && diag.score >= 50) return 12
    if (temp >= 20) return diag.score >= 40 ? 18 : 24
    return 24
  }, [temp, diag.score])

  // 베이킹 사용 가능성
  const bakeable = diag.stage === 'stable' ? 'ok'
    : diag.stage === 'stabilizing' && checks.has('doubling') ? 'maybe'
    : 'no'

  // 다음 급이 & 피크 시각
  const feedDate = useMemo(() => {
    const d = new Date(); d.setHours(feedHour, feedMin, 0, 0); return d
  }, [feedHour, feedMin])
  const nextFeed = addHours(feedDate, freq === 2 ? 12 : recInterval)
  const peakStart = addHours(feedDate, diagPeak.min)
  const peakEnd = addHours(feedDate, diagPeak.max)

  /* ════ 탭2 상태 ════ */
  const [pRatio, setPRatio] = useState<Ratio>(2)
  const [pCustomRatio, setPCustomRatio] = useState('')
  const [inoculation, setInoculation] = useState(20)
  const [pFlour, setPFlour] = useState<PFlour>('bread')
  const [pTemp, setPTemp] = useState(24)
  const [pCond, setPCond] = useState<Cond>('peak')
  const [bakeHour, setBakeHour] = useState(7)

  const pEffRatio = pCustomRatio && +pCustomRatio > 0 ? +pCustomRatio : pRatio
  const predict = useMemo(() => getPeakHours(pTemp, pEffRatio, pFlour, pCond), [pTemp, pEffRatio, pFlour, pCond])

  // 그래프용 샘플링
  const graph = useMemo(() => {
    const peakH = predict.base
    const maxH = Math.max(24, Math.ceil(peakH * 2.5))
    const points: { t: number; v: number }[] = []
    const steps = 80
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxH
      points.push({ t, v: fermentCurve(t, peakH) })
    }
    return { points, peakH, maxH }
  }, [predict.base])

  // 현재 시각 기준 최적 사용 타이밍
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const useStart = addHours(now, predict.min - 0.5)
  const useEnd = addHours(now, predict.max + 1)

  // 역산: 내일 bakeHour에 반죽하려면 언제 급이?
  const reverseFeedTime = useMemo(() => {
    const target = new Date(now); target.setDate(target.getDate() + 1)
    target.setHours(bakeHour, 0, 0, 0)
    const minFeed = addHours(target, -predict.max)
    const maxFeed = addHours(target, -predict.min)
    return { minFeed, maxFeed, target }
  }, [bakeHour, now, predict.min, predict.max])

  return (
    <div className={styles.wrap}>
      {/* ── 탭 ── */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'diagnose' ? styles.tabActive : ''}`} onClick={() => setTab('diagnose')}>
          🔬 안정화 진단
        </button>
        <button className={`${styles.tab} ${tab === 'predict' ? styles.tabActive : ''}`} onClick={() => setTab('predict')}>
          📈 피크 시간 예측
        </button>
      </div>

      {/* ═══════════════ 탭1 ═══════════════ */}
      {tab === 'diagnose' && (
        <div className={styles.panel}>
          {/* 기본 정보 */}
          <section>
            <h3 className={styles.secTitle}>1. 기본 정보</h3>

            <div className={styles.field}>
              <label className={styles.label}>시작한 지 며칠째</label>
              <select className={styles.select} value={day} onChange={e => setDay(+e.target.value)}>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}일차</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                현재 온도 <span className={styles.tempVal} data-zone={tempZone(temp)}>{temp}°C</span>
              </label>
              <input type="range" min={15} max={35} value={temp}
                onChange={e => setTemp(+e.target.value)}
                className={styles.tempSlider} />
              <div className={styles.tempLabels}>
                <span>15</span><span>20</span><span>25</span><span>30</span><span>35</span>
              </div>
              <p className={styles.tempHint}>{tempHint(temp)}</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>밀가루 종류</label>
              <div className={styles.segRow}>
                {([
                  { k: 'bread',        l: '강력분(백밀)' },
                  { k: 'mixed-whole',  l: '통밀 혼합' },
                  { k: 'mixed-rye',    l: '호밀 혼합' },
                  { k: 'mixed-both',   l: '통밀+호밀' },
                ] as const).map(f => (
                  <button key={f.k}
                    className={`${styles.segBtn} ${flour === f.k ? styles.segBtnActive : ''}`}
                    onClick={() => setFlour(f.k)}>{f.l}</button>
                ))}
              </div>
            </div>

            {flour !== 'bread' && (
              <div className={styles.field}>
                <label className={styles.label}>통밀/호밀 비율</label>
                <div className={styles.segRow}>
                  {([
                    { v: 0 as WholePct,  l: '0%' },
                    { v: 15 as WholePct, l: '10~20%' },
                    { v: 40 as WholePct, l: '30~50%' },
                  ] as const).map(w => (
                    <button key={w.v}
                      className={`${styles.segBtn} ${wholePct === w.v ? styles.segBtnActive : ''}`}
                      onClick={() => setWholePct(w.v)}>{w.l}</button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label}>하루 급이 횟수</label>
              <div className={styles.segRow}>
                {([1, 2] as FeedFreq[]).map(f => (
                  <button key={f}
                    className={`${styles.segBtn} ${freq === f ? styles.segBtnActive : ''}`}
                    onClick={() => setFreq(f)}>{f}회</button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>급이 비율 <span className={styles.labelSub}>(스타터:물:밀가루)</span></label>
              <div className={styles.segRow}>
                {([1, 2, 3, 5] as Ratio[]).map(r => (
                  <button key={r}
                    className={`${styles.segBtn} ${!customRatio && ratio === r ? styles.segBtnActive : ''}`}
                    onClick={() => { setRatio(r); setCustomRatio('') }}>{`1:${r}:${r}`}</button>
                ))}
              </div>
              <div className={styles.customRow}>
                <span className={styles.customLabel}>직접 입력 1:</span>
                <input type="number" min={1} step={0.5} value={customRatio}
                  onChange={e => setCustomRatio(e.target.value)}
                  className={styles.customInput} placeholder="예: 4" />
                <span className={styles.customLabel}>:{customRatio || '?'}</span>
              </div>
            </div>
          </section>

          {/* 체크박스 */}
          <section>
            <h3 className={styles.secTitle}>2. 오늘의 르방 상태</h3>
            <p className={styles.secDesc}>해당하는 것을 모두 체크해주세요</p>

            <ChkGroup title="기포·팽창" items={BUBBLES} checks={checks} onToggle={toggleCheck} />
            <ChkGroup title="냄새"       items={SMELLS}  checks={checks} onToggle={toggleCheck} />
            <ChkGroup title="질감"       items={TEXTURES} checks={checks} onToggle={toggleCheck} />
            <ChkGroup title="패턴"       items={PATTERNS} checks={checks} onToggle={toggleCheck} />
          </section>

          {/* 결과 */}
          <section>
            <h3 className={styles.secTitle}>3. 진단 결과</h3>

            {/* 상태 카드 */}
            <div className={`${styles.statusCard} ${styles[STAGE_META[diag.stage].className]}`}>
              <div className={styles.statusHead}>
                <span className={styles.statusEmoji}>{STAGE_META[diag.stage].emoji}</span>
                <div>
                  <p className={styles.statusLabel}>{STAGE_META[diag.stage].label}</p>
                  <p className={styles.statusDesc}>{STAGE_META[diag.stage].desc}</p>
                </div>
                <span className={styles.statusScore}>{diag.score}점</span>
              </div>
              <div className={styles.statusBar}>
                <div className={styles.statusBarFill} style={{ width: `${Math.min(100, Math.max(0, diag.score))}%` }} />
              </div>
              <p className={styles.statusDays}>
                {diag.stage === 'stable'
                  ? '✨ 이미 안정화 완료 가능성 높습니다'
                  : `약 ${diag.daysLeft - 2 > 0 ? diag.daysLeft - 2 : 1}~${diag.daysLeft}일 더 필요합니다`}
              </p>
            </div>

            {/* 맞춤 해석 */}
            {interpretations.length > 0 && (
              <div className={styles.interpList}>
                {interpretations.map((m, i) => (
                  <div key={i} className={styles.interpItem}>{m}</div>
                ))}
              </div>
            )}

            {/* 급이 간격 */}
            <div className={styles.infoCard}>
              <span className={styles.infoIcon}>🕑</span>
              <div>
                <p className={styles.infoLabel}>추천 급이 간격</p>
                <p className={styles.infoVal}>매 {recInterval}시간마다 급이 권장</p>
              </div>
            </div>

            {/* 베이킹 가능성 */}
            <div className={`${styles.bakeCard} ${styles[`bake_${bakeable}`]}`}>
              <p className={styles.bakeLabel}>베이킹 사용 가능성</p>
              <p className={styles.bakeStatus}>
                {bakeable === 'ok'    ? '✅ 사용 권장'
                 : bakeable === 'maybe' ? '🟡 조건부 테스트 가능'
                 : '🔴 아직 사용 불가'}
              </p>
              <p className={styles.bakeHint}>
                {bakeable === 'ok'    ? '피크 직전~직후 1시간 이내에 사용하고, 플로트 테스트로 최종 확인하세요.'
                 : bakeable === 'maybe' ? '소량(100g)으로 베이킹 테스트를 시도해볼 수 있습니다. 실패해도 괜찮습니다.'
                 : '안정화 단계까지 꾸준한 급이를 계속해주세요.'}
              </p>
            </div>

            {/* 급이 스케줄러 */}
            <div className={styles.schedCard}>
              <p className={styles.schedTitle}>📅 다음 급이 스케줄러</p>
              <div className={styles.schedRow}>
                <span className={styles.schedLabel}>마지막 급이 시각</span>
                <div className={styles.schedInputs}>
                  <select value={feedHour} onChange={e => setFeedHour(+e.target.value)} className={styles.schedSel}>
                    {Array.from({ length: 24 }, (_, i) => i).map(h => (
                      <option key={h} value={h}>{pad(h)}시</option>
                    ))}
                  </select>
                  <span className={styles.schedColon}>:</span>
                  <select value={feedMin} onChange={e => setFeedMin(+e.target.value)} className={styles.schedSel}>
                    {[0, 15, 30, 45].map(m => (
                      <option key={m} value={m}>{pad(m)}분</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.schedResult}>
                <div>
                  <p className={styles.schedResLabel}>다음 급이</p>
                  <p className={styles.schedResVal}>{fmtDayClock(nextFeed, now)}</p>
                </div>
                <div>
                  <p className={styles.schedResLabel}>피크 예상 시간대</p>
                  <p className={styles.schedResVal}>
                    {fmtClock(peakStart)} ~ {fmtClock(peakEnd)}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════ 탭2 ═══════════════ */}
      {tab === 'predict' && (
        <div className={styles.panel}>
          {/* 급이 정보 */}
          <section>
            <h3 className={styles.secTitle}>1. 급이 정보</h3>

            <div className={styles.field}>
              <label className={styles.label}>급이 비율</label>
              <div className={styles.segRow}>
                {([1, 2, 3, 5] as Ratio[]).map(r => (
                  <button key={r}
                    className={`${styles.segBtn} ${!pCustomRatio && pRatio === r ? styles.segBtnActive : ''}`}
                    onClick={() => { setPRatio(r); setPCustomRatio('') }}>{`1:${r}:${r}`}</button>
                ))}
              </div>
              <div className={styles.customRow}>
                <span className={styles.customLabel}>직접 입력 1:</span>
                <input type="number" min={1} step={0.5} value={pCustomRatio}
                  onChange={e => setPCustomRatio(e.target.value)}
                  className={styles.customInput} placeholder="예: 4" />
                <span className={styles.customLabel}>:{pCustomRatio || '?'}</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                스타터 접종량 <span className={styles.tempVal}>{inoculation}g</span>
              </label>
              <input type="range" min={10} max={50} value={inoculation}
                onChange={e => setInoculation(+e.target.value)}
                className={styles.plainSlider} />
              <div className={styles.tempLabels}>
                <span>10g</span><span>20g</span><span>30g</span><span>40g</span><span>50g</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>밀가루 종류</label>
              <div className={styles.segRow}>
                {([
                  { k: 'bread' as PFlour, l: '강력분' },
                  { k: 'whole' as PFlour, l: '통밀 혼합' },
                  { k: 'rye'   as PFlour, l: '호밀 혼합' },
                ] as const).map(f => (
                  <button key={f.k}
                    className={`${styles.segBtn} ${pFlour === f.k ? styles.segBtnActive : ''}`}
                    onClick={() => setPFlour(f.k)}>{f.l}</button>
                ))}
              </div>
            </div>
          </section>

          {/* 환경 */}
          <section>
            <h3 className={styles.secTitle}>2. 환경</h3>

            <div className={styles.field}>
              <label className={styles.label}>
                현재 온도 <span className={styles.tempVal} data-zone={tempZone(pTemp)}>{pTemp}°C</span>
              </label>
              <input type="range" min={15} max={35} value={pTemp}
                onChange={e => setPTemp(+e.target.value)}
                className={styles.tempSlider} />
              <div className={styles.tempLabels}>
                <span>15</span><span>20</span><span>25</span><span>30</span><span>35</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>스타터 상태</label>
              <div className={styles.condGrid}>
                {([
                  { k: 'peak' as Cond,      e: '🔝', l: '피크에서 급이',      d: '가장 활발' },
                  { k: 'afterPeak' as Cond, e: '📉', l: '피크 직후 급이',      d: '보통' },
                  { k: 'deflated' as Cond,  e: '💤', l: '꺼진 후 급이',        d: '느림' },
                  { k: 'fridge' as Cond,    e: '🧊', l: '냉장 보관 후 급이',   d: '가장 느림' },
                ] as const).map(c => (
                  <button key={c.k}
                    className={`${styles.condBtn} ${pCond === c.k ? styles.condBtnActive : ''}`}
                    onClick={() => setPCond(c.k)}>
                    <span className={styles.condEmoji}>{c.e}</span>
                    <span className={styles.condLabel}>{c.l}</span>
                    <span className={styles.condDesc}>{c.d}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 결과 */}
          <section>
            <h3 className={styles.secTitle}>3. 예측 결과</h3>

            {/* 히어로 */}
            <div className={styles.peakHero}>
              <p className={styles.peakLabel}>예상 피크 도달 시간</p>
              <p className={styles.peakTime}>급이 후 약 <span>{predict.min}~{predict.max}</span>시간</p>
              <p className={styles.peakSub}>기준 피크: {predict.base.toFixed(1)}시간</p>
            </div>

            {/* SVG 그래프 */}
            <FermentationGraph graph={graph} predict={predict} />

            {/* 사용 적정 타이밍 */}
            <div className={styles.useCard}>
              <p className={styles.useLabel}>⏰ 사용 적정 타이밍</p>
              <p className={styles.useDesc}>피크 전 30분 ~ 피크 직후 1시간이 최적 윈도우입니다</p>
              <div className={styles.useBadge}>
                지금 급이 시 → <strong>{fmtDayClock(useStart, now)} ~ {fmtDayClock(useEnd, now)}</strong>
              </div>
            </div>

            {/* 온도별 비교표 */}
            <div className={styles.tableWrap}>
              <h4 className={styles.tableTitle}>온도별 피크 시간 비교</h4>
              <table className={styles.compTable}>
                <thead>
                  <tr>
                    <th>온도</th>
                    <th>1:1:1</th>
                    <th>1:2:2</th>
                    <th>1:3:3</th>
                  </tr>
                </thead>
                <tbody>
                  {[20, 22, 24, 26, 28].map(t => (
                    <tr key={t} className={t === pTemp ? styles.compActive : ''}>
                      <td className={styles.compTemp}>{t}°C</td>
                      {[1, 2, 3].map(r => {
                        const p = getPeakHours(t, r, pFlour, pCond)
                        return <td key={r}>{p.min}~{p.max}h</td>
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 역산 타이머 */}
            <div className={styles.reverseCard}>
              <p className={styles.reverseTitle}>🔁 빵 굽는 날 역산 타이머</p>
              <div className={styles.reverseRow}>
                <span className={styles.reverseLabel}>내일 반죽 예정 시각</span>
                <select value={bakeHour} onChange={e => setBakeHour(+e.target.value)} className={styles.schedSel}>
                  {Array.from({ length: 24 }, (_, i) => i).map(h => (
                    <option key={h} value={h}>{pad(h)}시</option>
                  ))}
                </select>
              </div>
              <div className={styles.reverseResult}>
                <p className={styles.reverseResLabel}>최적 급이 시각</p>
                <p className={styles.reverseResVal}>
                  {fmtDayClock(reverseFeedTime.minFeed, now)} ~ {fmtClock(reverseFeedTime.maxFeed)}
                </p>
                <p className={styles.reverseHint}>
                  위 시각에 급이하면 내일 {pad(bakeHour)}시에 피크 상태로 반죽을 시작할 수 있습니다
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

// ── 온도 구간 헬퍼 ─────────────────────────
function tempZone(t: number): string {
  if (t <= 18) return 'cold'
  if (t <= 24) return 'optimal'
  if (t <= 28) return 'warm'
  return 'hot'
}
function tempHint(t: number): string {
  if (t <= 18) return '❄️ 느린 발효 — 복잡한 산미 발달에 유리하지만 시간이 오래 걸립니다'
  if (t <= 24) return '✅ 최적 구간 — 안정적인 발효 속도'
  if (t <= 28) return '⚡ 빠른 발효 — 급이 비율을 늘리면 과발효를 막을 수 있습니다'
  return '🔥 주의 — 아세톤 생성 위험, 냉장 보관을 고려하세요'
}

// ── 체크박스 그룹 ─────────────────────────
function ChkGroup({
  title, items, checks, onToggle,
}: {
  title: string
  items: { id: string; label: string; danger?: boolean }[]
  checks: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <div className={styles.chkGroup}>
      <p className={styles.chkTitle}>{title}</p>
      <div className={styles.chkList}>
        {items.map(it => {
          const checked = checks.has(it.id)
          return (
            <button key={it.id}
              onClick={() => onToggle(it.id)}
              className={`${styles.chkItem} ${checked ? styles.chkChecked : ''} ${it.danger && checked ? styles.chkDanger : ''}`}>
              <span className={styles.chkBox}>{checked ? '✓' : ''}</span>
              <span className={styles.chkLabel}>{it.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── 발효 그래프 ───────────────────────────
function FermentationGraph({
  graph, predict,
}: {
  graph: { points: { t: number; v: number }[]; peakH: number; maxH: number }
  predict: { min: number; max: number; base: number }
}) {
  const W = 560, H = 240
  const padL = 36, padR = 12, padT = 16, padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const toX = (t: number) => padL + (t / graph.maxH) * plotW
  const toY = (v: number) => padT + plotH - (v / 300) * plotH

  const poly = graph.points.map(p => `${toX(p.t).toFixed(1)},${toY(p.v).toFixed(1)}`).join(' ')

  // Y grid: 0, 100, 200, 300
  const yTicks = [0, 100, 200, 300]
  // X grid step 4h
  const xTicks: number[] = []
  for (let t = 0; t <= graph.maxH; t += 4) xTicks.push(t)

  const peakX = toX(graph.peakH)
  const peakY = toY(200)

  // 주요 지점
  const markers = [
    { t: graph.peakH * 0.25, emoji: '🌱', label: '첫 기포' },
    { t: graph.peakH * 0.6,  emoji: '📈', label: '빠른 성장' },
    { t: graph.peakH,         emoji: '🔝', label: '피크',     highlight: true },
    { t: graph.peakH * 1.5,   emoji: '⏬', label: '하강' },
  ]

  // 사용 적정 구간 (피크 ±: min~max)
  const usableStart = toX(predict.min)
  const usableEnd = toX(predict.max + 1)

  return (
    <div className={styles.graphWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.graph} preserveAspectRatio="xMidYMid meet">
        {/* 그리드 */}
        {yTicks.map(v => (
          <g key={`y${v}`}>
            <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke="rgba(255,255,255,0.05)" />
            <text x={padL - 6} y={toY(v) + 4} textAnchor="end" className={styles.graphAxis}>{v}%</text>
          </g>
        ))}
        {xTicks.map(t => (
          <g key={`x${t}`}>
            <line x1={toX(t)} x2={toX(t)} y1={padT} y2={padT + plotH} stroke="rgba(255,255,255,0.04)" />
            <text x={toX(t)} y={H - 8} textAnchor="middle" className={styles.graphAxis}>{t}h</text>
          </g>
        ))}

        {/* 사용 적정 구간 */}
        <rect x={usableStart} y={padT}
          width={Math.max(0, usableEnd - usableStart)} height={plotH}
          fill="rgba(62,255,155,0.12)" />

        {/* 피크 기준선 */}
        <line x1={padL} x2={W - padR} y1={toY(200)} y2={toY(200)}
          stroke="rgba(200,255,62,0.2)" strokeDasharray="3 4" />

        {/* 발효 곡선 */}
        <polyline points={poly} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" />

        {/* 피크 마커 */}
        <circle cx={peakX} cy={peakY} r={6} fill="#3EFF9B" stroke="var(--bg2)" strokeWidth={2} />

        {/* 주요 지점 */}
        {markers.map((m, i) => {
          const v = fermentCurve(m.t, graph.peakH)
          return (
            <g key={i}>
              <circle cx={toX(m.t)} cy={toY(v)} r={3}
                fill={m.highlight ? '#3EFF9B' : 'var(--accent)'} />
            </g>
          )
        })}
      </svg>

      {/* 범례 */}
      <div className={styles.legend}>
        {markers.map((m, i) => (
          <div key={i} className={styles.legendItem}>
            <span className={styles.legendEmoji}>{m.emoji}</span>
            <span className={styles.legendLabel}>{m.label}</span>
            <span className={styles.legendTime}>{m.t.toFixed(1)}h</span>
          </div>
        ))}
      </div>
    </div>
  )
}
