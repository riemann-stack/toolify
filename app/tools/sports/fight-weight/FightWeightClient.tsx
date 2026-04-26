'use client'

import { useMemo, useState } from 'react'
import styles from './fight-weight.module.css'

/* ─────────────────────────────────────────────────────────
 * 체급 데이터
 * ───────────────────────────────────────────────────────── */
type Gender = 'male' | 'female' | 'both'
interface WeightClass {
  name: string
  nameEn?: string
  limit: number      // kg (이하). 무제한은 Infinity
  forGender?: Gender
}

interface Sport {
  id: string
  flag: string
  label: string
  cls: string
  classes: WeightClass[]
  policy: string
  weighInHours: number  // 계체 후 시합까지 시간 (재수화 시간)
}

const BOXING_M: WeightClass[] = [
  { name: '미니멈웨이트',   nameEn: 'Minimumweight',       limit: 47.6 },
  { name: '라이트플라이급', nameEn: 'Light Flyweight',     limit: 48.99 },
  { name: '플라이급',       nameEn: 'Flyweight',           limit: 50.8 },
  { name: '슈퍼플라이급',   nameEn: 'Super Flyweight',     limit: 52.16 },
  { name: '밴텀급',         nameEn: 'Bantamweight',        limit: 53.52 },
  { name: '슈퍼밴텀급',     nameEn: 'Super Bantamweight',  limit: 55.34 },
  { name: '페더급',         nameEn: 'Featherweight',       limit: 57.15 },
  { name: '슈퍼페더급',     nameEn: 'Super Featherweight', limit: 58.97 },
  { name: '라이트급',       nameEn: 'Lightweight',         limit: 61.23 },
  { name: '슈퍼라이트급',   nameEn: 'Super Lightweight',   limit: 63.5 },
  { name: '웰터급',         nameEn: 'Welterweight',        limit: 66.68 },
  { name: '슈퍼웰터급',     nameEn: 'Super Welterweight',  limit: 69.85 },
  { name: '미들급',         nameEn: 'Middleweight',        limit: 72.57 },
  { name: '슈퍼미들급',     nameEn: 'Super Middleweight',  limit: 76.2 },
  { name: '라이트헤비급',   nameEn: 'Light Heavyweight',   limit: 79.38 },
  { name: '크루저급',       nameEn: 'Cruiserweight',       limit: 90.72 },
  { name: '헤비급',         nameEn: 'Heavyweight',         limit: Infinity },
]

const UFC: WeightClass[] = [
  { name: '스트로급(여)',   nameEn: 'Strawweight',         limit: 52.2,  forGender: 'female' },
  { name: '플라이급',       nameEn: 'Flyweight',           limit: 56.7,  forGender: 'both' },
  { name: '밴텀급',         nameEn: 'Bantamweight',        limit: 61.2,  forGender: 'both' },
  { name: '페더급',         nameEn: 'Featherweight',       limit: 65.8,  forGender: 'both' },
  { name: '라이트급',       nameEn: 'Lightweight',         limit: 70.3,  forGender: 'male' },
  { name: '웰터급',         nameEn: 'Welterweight',        limit: 77.1,  forGender: 'male' },
  { name: '미들급',         nameEn: 'Middleweight',        limit: 83.9,  forGender: 'male' },
  { name: '라이트헤비급',   nameEn: 'Light Heavyweight',   limit: 93.0,  forGender: 'male' },
  { name: '헤비급',         nameEn: 'Heavyweight',         limit: 120.2, forGender: 'male' },
]

const ONE_FC: WeightClass[] = [
  { name: '아톰급(여)', limit: 52.2, forGender: 'female' },
  { name: '스트로급',   limit: 56.7, forGender: 'both' },
  { name: '플라이급',   limit: 61.2, forGender: 'both' },
  { name: '밴텀급',     limit: 65.8, forGender: 'both' },
  { name: '페더급',     limit: 70.3, forGender: 'male' },
  { name: '라이트급',   limit: 77.1, forGender: 'male' },
  { name: '웰터급',     limit: 83.9, forGender: 'male' },
  { name: '미들급',     limit: 93.0, forGender: 'male' },
  { name: '라이트헤비급', limit: 102.1, forGender: 'male' },
  { name: '헤비급',     limit: Infinity, forGender: 'male' },
]

const KICKBOXING: WeightClass[] = [
  { name: '플라이급',       limit: 53.0 },
  { name: '밴텀급',         limit: 56.0 },
  { name: '페더급',         limit: 60.0 },
  { name: '라이트급',       limit: 65.0 },
  { name: '슈퍼라이트급',   limit: 70.0 },
  { name: '웰터급',         limit: 75.0 },
  { name: '미들급',         limit: 80.0 },
  { name: '크루저급',       limit: 90.0 },
  { name: '헤비급',         limit: Infinity },
]

const TAEKWONDO_M: WeightClass[] = [
  { name: '핀급',  limit: 54.0 },
  { name: '플라이급', limit: 58.0 },
  { name: '밴텀급', limit: 63.0 },
  { name: '페더급', limit: 68.0 },
  { name: '라이트급', limit: 74.0 },
  { name: '웰터급', limit: 80.0 },
  { name: '미들급', limit: 87.0 },
  { name: '헤비급', limit: Infinity },
]

const JUDO_M: WeightClass[] = [
  { name: '-60kg급',  limit: 60.0 },
  { name: '-66kg급',  limit: 66.0 },
  { name: '-73kg급',  limit: 73.0 },
  { name: '-81kg급',  limit: 81.0 },
  { name: '-90kg급',  limit: 90.0 },
  { name: '-100kg급', limit: 100.0 },
  { name: '+100kg급', limit: Infinity },
]

const MUAY_THAI: WeightClass[] = [
  { name: '핀급',         limit: 47.62 },
  { name: '미니플라이급', limit: 49.0 },
  { name: '라이트플라이급', limit: 50.8 },
  { name: '플라이급',     limit: 52.16 },
  { name: '슈퍼플라이급', limit: 53.52 },
  { name: '밴텀급',       limit: 55.34 },
  { name: '슈퍼밴텀급',   limit: 57.15 },
  { name: '페더급',       limit: 58.97 },
  { name: '슈퍼페더급',   limit: 61.23 },
  { name: '라이트급',     limit: 63.5 },
  { name: '슈퍼라이트급', limit: 65.77 },
  { name: '웰터급',       limit: 66.68 },
  { name: '슈퍼웰터급',   limit: 69.85 },
  { name: '미들급',       limit: 72.57 },
  { name: '슈퍼미들급',   limit: 76.2 },
  { name: '라이트헤비급', limit: 79.38 },
  { name: '슈퍼크루저급', limit: 86.18 },
  { name: '헤비급',       limit: 95.25 },
  { name: '슈퍼헤비급',   limit: Infinity },
]

const WRESTLING_FREE_M: WeightClass[] = [
  // UWW 자유형 남자 시니어 10체급
  { name: '57kg',  limit: 57 },
  { name: '61kg',  limit: 61 },
  { name: '65kg',  limit: 65 },
  { name: '70kg',  limit: 70 },
  { name: '74kg',  limit: 74 },
  { name: '79kg',  limit: 79 },
  { name: '86kg',  limit: 86 },
  { name: '92kg',  limit: 92 },
  { name: '97kg',  limit: 97 },
  { name: '125kg', limit: 125 },
]

const SPORTS: Sport[] = [
  { id: 'boxing', flag: '🥊', label: '복싱',         cls: 'sportBoxing', classes: BOXING_M,        policy: '시합 전날 또는 당일 계체 (단체별 차이) · 재수화 시간 충분 → 큰 차이 가능', weighInHours: 24 },
  { id: 'ufc',    flag: '🥋', label: 'UFC (MMA)',   cls: 'sportUFC',    classes: UFC,              policy: '시합 전날 오전 계체 · 약 30~36시간 재수화 자유 → 8~12kg 차이 흔함', weighInHours: 30 },
  { id: 'one',    flag: '🌿', label: 'ONE',          cls: 'sportONE',    classes: ONE_FC,           policy: '수분 감량 금지(2015~) · 시합 3주 전 매주 체중 보고 · 매일 소변 비중 측정', weighInHours: 0 },
  { id: 'kick',   flag: '🦵', label: '킥복싱(K-1)', cls: 'sportKick',   classes: KICKBOXING,       policy: '대회별 다양 · 일반적으로 시합 전날 계체', weighInHours: 18 },
  { id: 'judo',   flag: '🥋', label: '유도',         cls: 'sportJudo',   classes: JUDO_M,           policy: '국제 대회는 시합 당일 새벽 계체 · 재수화 시간 짧음 (수 시간)', weighInHours: 4 },
  { id: 'tkd',    flag: '🦿', label: '태권도',       cls: 'sportTKD',    classes: TAEKWONDO_M,      policy: '시합 당일 또는 전날 계체 · 대회별 차이 큼', weighInHours: 12 },
  { id: 'muay',   flag: '🥊', label: '무에타이',     cls: 'sportMuay',   classes: MUAY_THAI,        policy: '시합 전날 계체 · 재수화 일반적', weighInHours: 18 },
  { id: 'wrest',  flag: '🤼', label: '레슬링(자유)', cls: 'sportWrest',  classes: WRESTLING_FREE_M, policy: '국제 대회 시합 당일 새벽 계체 · 재수화 시간 매우 짧음', weighInHours: 3 },
]

/* 안전한 숫자 파싱 */
function n(v: string | number): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < 0) return 0
  return x
}

/* 적정 체급 추천 (BMI 22 ± 3kg 기반) */
function recommendClasses(height: number, weight: number, classes: WeightClass[], gender: Gender): WeightClass[] {
  if (height <= 0) {
    // 키 미입력 시 현재 체중 기준 ±2kg 범위에서 추천
    return classes
      .filter(c => (c.forGender ?? 'male') === gender || c.forGender === 'both')
      .filter(c => c.limit !== Infinity && Math.abs(c.limit - weight) <= 4)
      .slice(0, 3)
  }
  const ideal = 22 * Math.pow(height / 100, 2)
  const lower = ideal - 3
  const upper = ideal + 6
  return classes
    .filter(c => (c.forGender ?? 'male') === gender || c.forGender === 'both')
    .filter(c => c.limit >= lower && c.limit <= upper && c.limit !== Infinity)
    .slice(0, 4)
}

/* 위험도 평가 */
function evalRisk(weeklyLossKg: number, currentWeight: number): { level: 'safe' | 'caution' | 'danger' | 'severe'; cls: string; label: string } {
  if (currentWeight <= 0) return { level: 'safe', cls: styles.riskSafe, label: '✅ 입력 대기' }
  const pct = (weeklyLossKg / currentWeight) * 100
  if (pct <= 1.0) return { level: 'safe',    cls: styles.riskSafe,    label: '✅ 안전' }
  if (pct <= 1.5) return { level: 'caution', cls: styles.riskCaution, label: '🔶 주의' }
  if (pct <= 2.0) return { level: 'danger',  cls: styles.riskDanger,  label: '🚨 위험' }
  return { level: 'severe', cls: styles.riskSevere, label: '❌ 매우 위험' }
}

/* kg → lbs */
function toLbs(kg: number): number { return kg * 2.20462 }

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function FightWeightClient() {
  const [tab, setTab] = useState<'search' | 'plan' | 'tables'>('search')
  const [sportId, setSportId] = useState('boxing')

  const [weightStr, setWeightStr] = useState('78')
  const [heightStr, setHeightStr] = useState('175')
  const [gender, setGender] = useState<Gender>('male')

  // 계체 예정일 (default: 30일 후)
  const [weighInDate, setWeighInDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })

  const [targetClassName, setTargetClassName] = useState('')
  const [copied, setCopied] = useState(false)

  const weight = n(weightStr)
  const height = n(heightStr)
  const sport = SPORTS.find(s => s.id === sportId)!

  // 종목 변경 시 목표 체급 초기화
  function selectSport(id: string) {
    setSportId(id)
    setTargetClassName('')
  }

  // 성별로 필터된 체급
  const availableClasses = useMemo(
    () => sport.classes.filter(c => (c.forGender ?? 'male') === gender || c.forGender === 'both'),
    [sport, gender]
  )

  // 추천 체급
  const recommended = useMemo(
    () => recommendClasses(height, weight, sport.classes, gender),
    [height, weight, sport.classes, gender]
  )

  // 목표 체급 (직접 선택 or 추천 첫 번째)
  const targetClass = useMemo(() => {
    if (targetClassName) return availableClasses.find(c => c.name === targetClassName)
    // 디폴트: 현재 체중 이상 가장 가까운 체급
    const above = availableClasses.find(c => c.limit >= weight && c.limit !== Infinity)
    return above ?? availableClasses[availableClasses.length - 1]
  }, [targetClassName, availableClasses, weight])

  // 감량 필요량
  const needToLose = targetClass && targetClass.limit !== Infinity ? Math.max(0, weight - targetClass.limit) : 0

  // D-day
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const weighIn = useMemo(() => new Date(weighInDate), [weighInDate])
  const daysToWeighIn = Math.max(1, Math.ceil((weighIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  // 일평균/주간 감량
  const dailyLossKg  = needToLose / daysToWeighIn
  const weeklyLossKg = dailyLossKg * 7

  // 위험도
  const risk = evalRisk(weeklyLossKg, weight)

  // 단계 분리 (체지방 70% / 수분 30%)
  const fatPhaseLoss   = needToLose * 0.7
  const waterPhaseLoss = needToLose * 0.3

  // 체지방 단계는 D-day부터 7일 전까지 (즉 daysToWeighIn - 7일간), 단 daysToWeighIn ≤ 7이면 모두 체지방으로 간주
  const fatDays   = Math.max(1, daysToWeighIn - 7)
  const waterDays = Math.min(7, daysToWeighIn - 1)

  // 일정표 생성
  const schedule = useMemo(() => {
    if (needToLose <= 0 || daysToWeighIn < 2) return []
    type Row = { dLabel: string; weightTarget: number; phase: 'fat' | 'water' | 'rehy' | 'dday'; advice: string }
    const rows: Row[] = []
    // 마일스톤 시점들
    const checkpoints: number[] = []
    if (daysToWeighIn >= 30) checkpoints.push(daysToWeighIn, 25, 20, 14, 10, 7, 5, 3, 1, 0, -1)
    else if (daysToWeighIn >= 14) checkpoints.push(daysToWeighIn, Math.floor(daysToWeighIn * 0.7), 7, 5, 3, 1, 0, -1)
    else if (daysToWeighIn >= 7) checkpoints.push(daysToWeighIn, 5, 3, 1, 0, -1)
    else checkpoints.push(daysToWeighIn, Math.floor(daysToWeighIn / 2), 1, 0, -1)

    const advicesFat: Record<string, string> = {
      start: '식단·계체 식단 시작',
      mid:   '유산소 5일/주 + 칼로리 -500/일',
      late:  '근력 운동 유지 + 단백질 섭취',
    }
    const advicesWater: Record<string, string> = {
      D7: '나트륨 제한 시작',
      D5: '나트륨·탄수화물 점진 감소',
      D3: '수분 점진 감소',
      D1: '사우나·뜨거운 욕조 발한',
    }

    const seen = new Set<number>()
    for (const d of checkpoints) {
      if (seen.has(d)) continue
      if (d > daysToWeighIn) continue
      seen.add(d)
      let target = weight
      let phase: Row['phase'] = 'fat'
      let advice = ''

      if (d > 7) {
        // 체지방 단계 (D-day부터 d일 전 → fat phase)
        const elapsed = (daysToWeighIn - d) / fatDays
        target = weight - fatPhaseLoss * elapsed
        phase = 'fat'
        advice = elapsed < 0.3 ? advicesFat.start : elapsed < 0.7 ? advicesFat.mid : advicesFat.late
      } else if (d > 0) {
        // 수분 단계 — 7일째에 fat 끝, 그 이후 수분
        const fatEnd = weight - fatPhaseLoss
        const waterElapsed = (waterDays - d + 1) / waterDays
        target = fatEnd - waterPhaseLoss * waterElapsed
        phase = 'water'
        if (d >= 7) advice = advicesWater.D7
        else if (d >= 5) advice = advicesWater.D5
        else if (d >= 3) advice = advicesWater.D3
        else advice = advicesWater.D1
      } else if (d === 0) {
        target = targetClass ? targetClass.limit : weight - needToLose
        phase = 'dday'
        advice = '계체 통과 🎯'
      } else {
        // d === -1: 재수화
        const rehydrate = sport.weighInHours > 12 ? 5 : sport.weighInHours > 4 ? 2.5 : 1
        target = (targetClass ? targetClass.limit : weight - needToLose) + rehydrate
        phase = 'rehy'
        advice = sport.id === 'one'
          ? '재수화 제한 — 자연 회복'
          : `IV 또는 음용 재수화 (${rehydrate.toFixed(1)}kg 회복 예시)`
      }

      const dLabel = d === 0 ? 'D-Day' : d > 0 ? `D-${d}` : `D+${Math.abs(d)}`
      rows.push({ dLabel, weightTarget: Math.max(0, target), phase, advice })
    }
    return rows
  }, [needToLose, daysToWeighIn, weight, fatPhaseLoss, waterPhaseLoss, fatDays, waterDays, targetClass, sport.weighInHours, sport.id])

  // 체급 변경 권장 여부
  const recommendNextClass = useMemo(() => {
    if (!targetClass || targetClass.limit === Infinity) return null
    if (risk.level === 'severe' || (needToLose / weight) > 0.07) {
      // 한 단계 위 체급
      const idx = sport.classes.indexOf(targetClass)
      const next = sport.classes
        .slice(idx + 1)
        .find(c => (c.forGender ?? 'male') === gender || c.forGender === 'both')
      return next ?? null
    }
    return null
  }, [targetClass, risk.level, needToLose, weight, sport.classes, gender])

  /* 결과 복사 */
  function handleCopy() {
    const txt = [
      `── 격투기 감량 계획 (${sport.label}) ──`,
      `체중 ${weight}kg → 목표 ${targetClass?.name ?? ''} (${targetClass?.limit === Infinity ? '무제한' : `${targetClass?.limit}kg`})`,
      `감량 필요: ${needToLose.toFixed(2)}kg / 계체까지 D-${daysToWeighIn}`,
      `일평균 감량: ${dailyLossKg.toFixed(2)}kg/일 / 주간 ${weeklyLossKg.toFixed(2)}kg/주`,
      `위험도: ${risk.label}`,
      'youtil.kr/tools/sports/fight-weight',
    ].join('\n')
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  /* 체급 표 전체 — 탭 3 */
  function renderClassTable(s: Sport) {
    return (
      <div className={styles.card} key={s.id}>
        <div className={styles.cardLabel}>
          <span>{s.flag} {s.label} 체급표</span>
          <span className={styles.cardLabelHint}>{s.classes.length}체급 · 행 클릭 시 검색 탭으로 이동</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>{s.policy}</p>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.classTable}>
            <thead>
              <tr><th>체급</th><th>영문</th><th>kg</th><th>lbs</th></tr>
            </thead>
            <tbody>
              {s.classes.map((c, i) => (
                <tr
                  key={i}
                  className={styles.clickableRow}
                  onClick={() => {
                    setSportId(s.id)
                    setTargetClassName(c.name)
                    setTab('search')
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <td>{c.name}{c.forGender === 'female' && ' (여)'}</td>
                  <td>{c.nameEn ?? '—'}</td>
                  <td>{c.limit === Infinity ? '무제한' : c.limit.toFixed(2)}</td>
                  <td>{c.limit === Infinity ? '—' : toLbs(c.limit).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 계산기는 참고용 정보입니다.</strong> 실제 격투기 감량은 전문 트레이너·영양사·의사 감독 하에 진행되어야 합니다. 무리한 수분 감량은 생명을 위협할 수 있으며, 실제 사망 사례가 다수 보고되어 있습니다.
      </div>

      {/* 종목 선택 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>종목 선택</span>
          <span className={styles.cardLabelHint}>좌우로 스크롤</span>
        </div>
        <div className={styles.sportScroller}>
          {SPORTS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.sportBtn} ${styles[s.cls]} ${sportId === s.id ? styles.sportActive : ''}`}
              onClick={() => selectSport(s.id)}
            >
              {s.flag} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'search' ? styles.tabActive : ''}`} onClick={() => setTab('search')}>체급 검색</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'plan' ? styles.tabActive : ''}`}   onClick={() => setTab('plan')}>감량 계획</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'tables' ? styles.tabActive : ''}`} onClick={() => setTab('tables')}>종목별 체급표</button>
      </div>

      {/* ─────────────────── 탭 1: 체급 검색 ─────────────────── */}
      {tab === 'search' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>기본 정보</span>
              <span className={styles.cardLabelHint}>{sport.flag} {sport.label}</span>
            </div>

            <div className={styles.inputGrid}>
              <div className={styles.inputCell}>
                <p className={styles.inputLabel}>현재 체중</p>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" inputMode="decimal" min={0} step="0.1" value={weightStr} onChange={e => setWeightStr(e.target.value)} />
                  <span className={styles.unit}>kg</span>
                </div>
              </div>
              <div className={styles.inputCell}>
                <p className={styles.inputLabel}>키 (선택)</p>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" inputMode="decimal" min={0} step="1" value={heightStr} onChange={e => setHeightStr(e.target.value)} />
                  <span className={styles.unit}>cm</span>
                </div>
              </div>
            </div>

            <div style={{ height: 10 }} />
            <div className={styles.inputGrid}>
              <div className={styles.inputCell}>
                <p className={styles.inputLabel}>성별</p>
                <div className={styles.genderRow}>
                  <button type="button" className={`${styles.genderBtn} ${gender === 'male' ? styles.genderActive : ''}`}   onClick={() => setGender('male')}>남성</button>
                  <button type="button" className={`${styles.genderBtn} ${gender === 'female' ? styles.genderActive : ''}`} onClick={() => setGender('female')}>여성</button>
                </div>
              </div>
              <div className={styles.inputCell}>
                <p className={styles.inputLabel}>계체 예정일 (D-{daysToWeighIn})</p>
                <input className={styles.dateInput} type="date" value={weighInDate} onChange={e => setWeighInDate(e.target.value)} />
              </div>
            </div>

            <div style={{ height: 14 }} />
            <p className={styles.inputLabel} style={{ marginBottom: 6 }}>목표 체급 선택</p>
            <select className={styles.classSelect} value={targetClassName} onChange={e => setTargetClassName(e.target.value)}>
              <option value="">— 자동 추천 —</option>
              {availableClasses.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name} ({c.limit === Infinity ? '무제한' : `${c.limit}kg 이하`})
                </option>
              ))}
            </select>
          </div>

          {/* 추천 카드 */}
          {recommended.length > 0 && (
            <div className={styles.recommendCard}>
              <p className={styles.recommendLead}>💡 적정 체급 추천</p>
              <p className={styles.recommendBody}>
                {height > 0 && <>키 <strong>{height}cm</strong> · </>}체중 <strong>{weight}kg</strong> {gender === 'male' ? '남성' : '여성'} → {sport.label}{' '}
                <strong>{recommended.map(c => `${c.name} (${c.limit}kg 이하)`).join(', ')}</strong> 후보 적정.
              </p>
            </div>
          )}

          {/* 히어로 — 감량 필요량 */}
          {targetClass && (
            <div className={styles.hero}>
              <p className={styles.heroLead}>{targetClass.name} 진입까지 감량</p>
              {needToLose > 0 ? (
                <p className={`${styles.heroNum} ${styles.heroNumLoss}`}>
                  {needToLose.toFixed(2)}<span className={styles.heroUnit}>kg</span>
                </p>
              ) : (
                <p className={styles.heroNum}>
                  ✓<span className={styles.heroUnit}>이미 통과</span>
                </p>
              )}
              <p className={styles.heroSub}>
                현재 {weight}kg → 목표 {targetClass.limit === Infinity ? '무제한' : `${targetClass.limit}kg 이하`} · 계체까지 D-{daysToWeighIn}
              </p>
            </div>
          )}

          {/* KPI */}
          {needToLose > 0 && (
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>일평균 감량</div>
                <div className={styles.kpiValue}>{dailyLossKg.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg/일</span></div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>주간 감량</div>
                <div className={`${styles.kpiValue} ${risk.level === 'safe' ? styles.kpiValuePos : risk.level === 'caution' ? styles.kpiValueWarn : styles.kpiValueDanger}`}>
                  {weeklyLossKg.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg/주</span>
                </div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiLabel}>체중 비율 / 주</div>
                <div className={styles.kpiValue}>{weight > 0 ? ((weeklyLossKg / weight) * 100).toFixed(1) : '0.0'}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>%</span></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─────────────────── 탭 2: 감량 계획 ─────────────────── */}
      {tab === 'plan' && (
        <>
          {/* 위험도 카드 */}
          <div className={styles.card} style={{ textAlign: 'center' }}>
            <span className={`${styles.riskBadge} ${risk.cls}`}>{risk.label}</span>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 6 }}>
              {needToLose <= 0
                ? `이미 ${targetClass?.name} 한도 이하입니다. 계체일까지 컨디션 유지에 집중하세요.`
                : <>주당 <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{weeklyLossKg.toFixed(2)}kg</strong> 감량은 체중의 <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{((weeklyLossKg / weight) * 100).toFixed(1)}%</strong> 입니다. 의학 가이드라인은 체중의 1%/주 이내를 권장합니다.</>}
            </p>
          </div>

          {/* 단계 요약 */}
          {needToLose > 0 && (
            <div className={styles.kpiGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className={styles.kpiCard}>
                <span className={`${styles.phaseChip} ${styles.chipFat}`}>체지방</span>
                <div className={styles.kpiValue} style={{ marginTop: 6 }}>{fatPhaseLoss.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg</span></div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>D-{daysToWeighIn} ~ D-7</div>
              </div>
              <div className={styles.kpiCard}>
                <span className={`${styles.phaseChip} ${styles.chipWater}`}>수분</span>
                <div className={styles.kpiValue} style={{ marginTop: 6 }}>{waterPhaseLoss.toFixed(2)}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>kg</span></div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>D-7 ~ D-1</div>
              </div>
              <div className={styles.kpiCard}>
                <span className={`${styles.phaseChip} ${styles.chipRehy}`}>재수화</span>
                <div className={styles.kpiValue} style={{ marginTop: 6 }}>
                  {sport.id === 'one' ? '제한' : sport.weighInHours > 12 ? '4-12kg' : sport.weighInHours > 4 ? '2-5kg' : '1-2kg'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>계체 후 ~ 시합</div>
              </div>
            </div>
          )}

          {/* 일정표 */}
          {schedule.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>감량 일정표 (자동 생성)</span>
                <span className={styles.cardLabelHint}>D-{daysToWeighIn} → 시합</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.scheduleTable}>
                  <thead>
                    <tr><th>D-day</th><th>목표 체중</th><th>단계</th><th>권장 활동</th></tr>
                  </thead>
                  <tbody>
                    {schedule.map((r, i) => (
                      <tr key={i} className={
                        r.phase === 'dday'  ? styles.dDay  :
                        r.phase === 'fat'   ? styles.phaseFat :
                        r.phase === 'water' ? styles.phaseWater :
                        styles.phaseRehy
                      }>
                        <td>{r.dLabel}</td>
                        <td>{r.weightTarget.toFixed(1)} kg</td>
                        <td>
                          <span className={`${styles.phaseChip} ${
                            r.phase === 'fat'   ? styles.chipFat :
                            r.phase === 'water' ? styles.chipWater :
                            r.phase === 'dday'  ? styles.chipDday :
                            styles.chipRehy
                          }`}>
                            {r.phase === 'fat' ? '체지방' : r.phase === 'water' ? '수분' : r.phase === 'dday' ? '계체' : '재수화'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{r.advice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 건강 경고 */}
          {(risk.level === 'danger' || risk.level === 'severe') && (
            <div className={styles.healthWarn}>
              <span className={styles.warnIcon}>⚠️</span>
              <div>
                <p><strong>주당 {weeklyLossKg.toFixed(2)}kg 감량은 의학적 권장(1%/주)을 초과합니다.</strong></p>
                <ul>
                  <li>근손실, 면역 저하, 신장 손상 위험</li>
                  <li>시합 당일 퍼포먼스 급락 가능</li>
                  <li>무리한 수분 감량은 사망 사례 보고 (Yang Jian Bing, Mike Bell, Leandro Souza 등)</li>
                </ul>
                <p style={{ marginTop: 8 }}>전문 트레이너·영양사 감독 하에 진행하세요.</p>
              </div>
            </div>
          )}

          {/* 체급 변경 권장 */}
          {recommendNextClass && (
            <div className={styles.healthWarn} style={{ background: 'rgba(255,140,62,0.06)', borderColor: 'rgba(255,140,62,0.4)', color: '#FFE0C8' }}>
              <span className={styles.warnIcon}>🔶</span>
              <div>
                <p><strong style={{ color: '#FF8C3E' }}>{daysToWeighIn}일 이내 {needToLose.toFixed(2)}kg 감량은 권장되지 않습니다.</strong></p>
                <p style={{ marginTop: 6 }}>
                  한 단계 위 체급 — <strong style={{ color: 'var(--text)' }}>{recommendNextClass.name} ({recommendNextClass.limit === Infinity ? '무제한' : `${recommendNextClass.limit}kg 이하`})</strong> 또는 계체일을 늦추는 것을 고려해보세요.
                </p>
              </div>
            </div>
          )}

          {/* 종목별 감량 정책 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>종목별 감량·계체 정책</span>
              <span className={styles.cardLabelHint}>현재 선택: {sport.label}</span>
            </div>
            <div className={styles.policyGrid}>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>🥋 UFC (MMA)</p>
                <p className={styles.policyBody}>계체 후 <strong>약 30~36시간</strong> 재수화 자유 → 8~12kg 차이 흔함</p>
              </div>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>🌿 ONE Championship</p>
                <p className={styles.policyBody}>2015년부터 <strong>수분 감량 금지</strong> · 매일 소변 비중 측정 · 차이 적음</p>
              </div>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>🥊 복싱</p>
                <p className={styles.policyBody}>시합 24~36시간 전 계체 · 재수화 자유 · 단체별 차이</p>
              </div>
              <div className={styles.policyCard}>
                <p className={styles.policyTitle}>🥋 유도·레슬링</p>
                <p className={styles.policyBody}>시합 당일 새벽 계체 · 재수화 시간 짧음 (수 시간 이내)</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────── 탭 3: 종목별 체급표 ─────────────────── */}
      {tab === 'tables' && (
        <>
          {SPORTS.map(s => renderClassTable(s))}
        </>
      )}

      {/* 결과 복사 */}
      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}
