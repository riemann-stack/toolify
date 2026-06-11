/* ──────────────────────────────────────────────────────
   interior/ventilation/ventilationUtils.ts
   환기량·CADR·CO₂·창문 환기 — 한국 표준 기반
   ※ 본 도구는 참고용 가이드이며 의료·산업안전 진단 도구가 아닙니다.
   ────────────────────────────────────────────────────── */

/* ─── 공간 용도별 권장 ACH (한국·국제 표준) ─── */
export interface SpaceStandard {
  id: string
  name: string
  icon: string
  achMin: number
  achMax: number
  achRecommended: number
  desc: string
  standard: string
}

export const SPACE_STANDARDS: SpaceStandard[] = [
  { id: 'bedroom',   name: '침실',         icon: '🛏️', achMin: 0.5, achMax: 1,  achRecommended: 0.7,
    desc: '취침 중심 · 낮은 환기율로 충분', standard: '국토교통부 (신축 0.5 ACH 의무)' },
  { id: 'living',    name: '거실',         icon: '🛋️', achMin: 0.5, achMax: 1,  achRecommended: 0.8,
    desc: '주거 일반', standard: '국토교통부' },
  { id: 'study',     name: '공부방·서재',  icon: '📚', achMin: 2,   achMax: 4,  achRecommended: 3,
    desc: '집중·CO₂ 누적 방지', standard: 'ASHRAE 62.1' },
  { id: 'office',    name: '사무실',       icon: '💼', achMin: 2,   achMax: 6,  achRecommended: 4,
    desc: '업무 공간', standard: 'ASHRAE 62.1' },
  { id: 'meeting',   name: '회의실',       icon: '👥', achMin: 6,   achMax: 10, achRecommended: 8,
    desc: '인원 밀집·짧은 체류', standard: 'ASHRAE 62.1' },
  { id: 'classroom', name: '교실',         icon: '🎒', achMin: 4,   achMax: 6,  achRecommended: 5,
    desc: '학생 1인당 21.6㎥/h', standard: '교육부 학교보건법 시행규칙' },
  { id: 'cafe',      name: '카페·식당',    icon: '☕', achMin: 8,   achMax: 12, achRecommended: 10,
    desc: '냄새·습기·인원 밀집', standard: 'KOSHA' },
  { id: 'gym',       name: '헬스장',       icon: '🏋️', achMin: 6,   achMax: 10, achRecommended: 8,
    desc: '운동·CO₂ 빠른 누적', standard: 'KOSHA' },
  { id: 'kitchen',   name: '주방',         icon: '🍳', achMin: 10,  achMax: 15, achRecommended: 12,
    desc: '조리 시 · 후드 사용', standard: '국토교통부' },
  { id: 'bathroom',  name: '화장실',       icon: '🚽', achMin: 5,   achMax: 8,  achRecommended: 6,
    desc: '습기·냄새 배출', standard: '국토교통부 (5 ACH 의무)' },
  { id: 'medical',   name: '의료시설',     icon: '🏥', achMin: 6,   achMax: 12, achRecommended: 8,
    desc: '감염 예방 (병실 기준)', standard: '의료법 시행규칙' },
]

/* ─── 활동별 CO₂ 배출량 (L/h, 1인당) ─── */
export interface ActivityLevel {
  id: string
  name: string
  co2LperHour: number
  metsApprox: number
}

export const CO2_BY_ACTIVITY: ActivityLevel[] = [
  { id: 'rest',     name: '휴식·취침',  co2LperHour: 12, metsApprox: 1.0 },
  { id: 'light',    name: '대화·식사',  co2LperHour: 18, metsApprox: 1.5 },
  { id: 'study',    name: '공부·업무',  co2LperHour: 22, metsApprox: 1.8 },
  { id: 'walk',     name: '걷기·이동',  co2LperHour: 35, metsApprox: 3.0 },
  { id: 'exercise', name: '운동',       co2LperHour: 80, metsApprox: 6.0 },
]

/* ─── CO₂ 농도 기준 (ppm) ─── */
export interface Co2Threshold {
  max: number
  level: 'excellent' | 'good' | 'moderate' | 'poor' | 'bad' | 'severe'
  label: string
  color: string
  desc: string
}

export const CO2_THRESHOLDS: Co2Threshold[] = [
  { max: 600,  level: 'excellent', label: '쾌적',     color: '#059669', desc: '실외 신선 공기 수준 (400~600 ppm)' },
  { max: 800,  level: 'good',      label: '양호',     color: '#0891B2', desc: '일반 거주 환경 (600~800 ppm)' },
  { max: 1000, level: 'moderate',  label: '보통',     color: '#A16207', desc: '환기 권장 (800~1,000 ppm)' },
  { max: 1500, level: 'poor',      label: '미흡',     color: '#EA580C', desc: '집중력 저하 가능 (1,000~1,500 ppm)' },
  { max: 2500, level: 'bad',       label: '나쁨',     color: '#DC2626', desc: '두통·졸음 가능 (1,500~2,500 ppm)' },
  { max: 99999, level: 'severe',   label: '매우 나쁨', color: '#CC4444', desc: '즉시 환기 필요 (2,500 ppm 이상)' },
]

/* ─── 창문 환기 모드 ─── */
export interface WindowMode {
  id: string
  name: string
  achMin: number
  achMax: number
  desc: string
}

export const WINDOW_MODES: WindowMode[] = [
  { id: 'small-one',    name: '한쪽 창 조금', achMin: 0.5, achMax: 1.5, desc: '한쪽 창 10cm 정도' },
  { id: 'large-one',    name: '한쪽 창 크게', achMin: 1,   achMax: 4,   desc: '한쪽 창 완전 개방' },
  { id: 'cross',        name: '맞통풍 (양쪽)', achMin: 3,   achMax: 15,  desc: '대각선 양쪽 창문 동시 개방 — 가장 효율적' },
  { id: 'fan-assisted', name: '환풍기 + 창문', achMin: 2,   achMax: 6,   desc: '환풍기 보조' },
]

export interface WindSpeed { id: string; name: string; factor: number }

export const WIND_SPEEDS: WindSpeed[] = [
  { id: 'calm',     name: '거의 무풍', factor: 0.5 },
  { id: 'light',    name: '약함',      factor: 0.8 },
  { id: 'moderate', name: '보통',      factor: 1.0 },
  { id: 'strong',   name: '강함',      factor: 1.5 },
]

/* ─── 미세먼지 등급 ─── */
export interface DustLevel {
  id: string
  name: string
  color: string
  recommendation: string
}

export const DUST_LEVELS: DustLevel[] = [
  { id: 'good',      name: '좋음',     color: '#059669',
    recommendation: '자유롭게 환기 가능 (10~15분)' },
  { id: 'moderate',  name: '보통',     color: '#A16207',
    recommendation: '일반 환기 가능 (10분 이내)' },
  { id: 'bad',       name: '나쁨',     color: '#EA580C',
    recommendation: '5~10분 짧은 환기 + 공기청정기 가동' },
  { id: 'very-bad',  name: '매우 나쁨', color: '#DC2626',
    recommendation: '5분 이내 짧은 환기 + 즉시 공기청정기' },
]

/* ─── 1. 필요 환기량 계산 ─── */
export interface VentilationInput {
  area: number
  ceilingHeight: number
  spaceTypeId: string
  occupants: number
  targetAch: number
}

export interface VentilationResult {
  volume: number
  requiredAirflow: number      // ㎥/h
  perPersonAirflow: number     // 1인당 ㎥/h
  oneCycleMinutes: number
  achInfo: { min: number; max: number; recommended: string; standard: string } | null
}

export function calcRequiredAirflow(input: VentilationInput): VentilationResult {
  const volume = input.area * input.ceilingHeight
  const requiredAirflow = volume * input.targetAch
  const perPersonAirflow = input.occupants > 0 ? requiredAirflow / input.occupants : 0
  const oneCycleMinutes = input.targetAch > 0 ? 60 / input.targetAch : 0

  const std = SPACE_STANDARDS.find(s => s.id === input.spaceTypeId)
  const achInfo = std
    ? { min: std.achMin, max: std.achMax, recommended: std.desc, standard: std.standard }
    : null

  return {
    volume: Math.round(volume * 10) / 10,
    requiredAirflow: Math.round(requiredAirflow),
    perPersonAirflow: Math.round(perPersonAirflow),
    oneCycleMinutes: Math.round(oneCycleMinutes),
    achInfo,
  }
}

/* ─── 2. CADR 추천 ─── */
export interface CadrResult {
  minCadr: number          // 4 ACH 기준
  idealCadr: number        // 5 ACH 기준
  smartCadr: number        // 사용자 목표 ACH 기준
  displayAreaApprox: number  // 한국 공기청정기 표시면적 환산
}

export function recommendCADR(area: number, ceilingHeight: number, targetAch: number): CadrResult {
  const volume = area * ceilingHeight
  const minCadr = volume * 4
  const idealCadr = volume * 5
  // 한국 공기청정기 표시면적 환산: CADR ≈ 표시면적 × 7.5 (보수적)
  const displayAreaApprox = idealCadr / 7.5
  return {
    minCadr: Math.ceil(minCadr),
    idealCadr: Math.ceil(idealCadr),
    smartCadr: Math.ceil(volume * targetAch),
    displayAreaApprox: Math.round(displayAreaApprox),
  }
}

/* ─── 3. 현재 성능 평가 ─── */
export interface PerformanceResult {
  currentAch: number
  oneCycleMinutes: number
  isAdequate: boolean
  shortageAirflow: number
  efficiency: 'low' | 'adequate' | 'high'
  efficiencyLabel: string
  efficiencyColor: string
}

export function evaluateCurrentPerformance(
  volume: number, currentAirflow: number, targetAch: number,
): PerformanceResult {
  const currentAch = volume > 0 ? currentAirflow / volume : 0
  const oneCycleMinutes = currentAch > 0 ? 60 / currentAch : 999
  const requiredAirflow = volume * targetAch
  const shortageAirflow = Math.max(0, requiredAirflow - currentAirflow)

  let efficiency: PerformanceResult['efficiency'] = 'adequate'
  let efficiencyLabel = '🟢 적정'
  let efficiencyColor = '#059669'
  if (currentAch < targetAch * 0.7) {
    efficiency = 'low'
    efficiencyLabel = '🟠 부족'
    efficiencyColor = '#EA580C'
  } else if (currentAch > targetAch * 1.5) {
    efficiency = 'high'
    efficiencyLabel = '🔵 충분'
    efficiencyColor = '#0891B2'
  }

  return {
    currentAch: Math.round(currentAch * 100) / 100,
    oneCycleMinutes: Math.round(oneCycleMinutes),
    isAdequate: currentAch >= targetAch,
    shortageAirflow: Math.round(shortageAirflow),
    efficiency, efficiencyLabel, efficiencyColor,
  }
}

/* ─── 4. 창문 환기 시간 ─── */
export interface WindowVentilationResult {
  modeName: string
  windName: string
  minMinutes: number
  maxMinutes: number
  cycles: number
  recommendation: string
  perCycle: { min: number; max: number }
}

export function estimateWindowVentilationTime(
  volume: number, modeId: string, windId: string, targetCycles: number,
): WindowVentilationResult | null {
  const mode = WINDOW_MODES.find(m => m.id === modeId)
  const wind = WIND_SPEEDS.find(w => w.id === windId)
  if (!mode || !wind) return null

  const adjustedAchMin = mode.achMin * wind.factor
  const adjustedAchMax = mode.achMax * wind.factor

  // 1회 교체 시간 = 60분 ÷ ACH
  const perCycleMin = 60 / adjustedAchMax
  const perCycleMax = 60 / adjustedAchMin

  const minMinutes = Math.round(perCycleMin * targetCycles)
  const maxMinutes = Math.round(perCycleMax * targetCycles)

  let recommendation = ''
  if (modeId === 'cross') {
    recommendation = '맞통풍은 가장 효율적인 자연환기입니다. 5~10분 짧은 환기로도 충분합니다.'
  } else if (modeId === 'small-one') {
    recommendation = '한쪽 창을 조금만 열면 환기 효율이 낮습니다. 가능하면 맞통풍을 권장합니다.'
  } else if (modeId === 'fan-assisted') {
    recommendation = '환풍기 + 창문 보조는 안정적이지만 맞통풍보다 느립니다. 욕실·주방에 적합.'
  } else {
    recommendation = '한쪽 창을 크게 여는 것은 차선책입니다. 가능하면 맞통풍을 권장합니다.'
  }

  return {
    modeName: mode.name,
    windName: wind.name,
    minMinutes, maxMinutes, cycles: targetCycles,
    recommendation,
    perCycle: { min: Math.round(perCycleMin), max: Math.round(perCycleMax) },
  }
}

/* ─── 5. CO₂ 위험도 (정성적 추정) ─── */
export interface Co2Input {
  volume: number
  occupants: number
  durationMinutes: number
  airflowM3PerHour: number
  activityId: string
}

export interface Co2Result {
  estimatedPpm: number
  riskLevel: Co2Threshold
  recommendVentilateMinutes: number
  ppmIncrease: number
  warning: string
}

export function estimateCO2Risk(input: Co2Input): Co2Result | null {
  const activity = CO2_BY_ACTIVITY.find(a => a.id === input.activityId)
  if (!activity || input.volume <= 0 || input.occupants <= 0) return null

  const co2LperHour = activity.co2LperHour * input.occupants
  const co2LperMinute = co2LperHour / 60
  const outdoorPpm = 420  // 도시 평균

  let estimatedPpm: number
  let ppmIncrease: number

  if (input.airflowM3PerHour <= 0) {
    // 무환기 — 시간 비례 누적
    const co2GeneratedM3 = (co2LperMinute / 1000) * input.durationMinutes
    ppmIncrease = (co2GeneratedM3 / input.volume) * 1_000_000
    estimatedPpm = outdoorPpm + ppmIncrease
  } else {
    // 환기 있음 — 정상상태 농도 근사
    const co2M3PerHour = co2LperHour / 1000
    ppmIncrease = (co2M3PerHour / input.airflowM3PerHour) * 1_000_000
    estimatedPpm = outdoorPpm + ppmIncrease
  }

  const riskLevel = CO2_THRESHOLDS.find(t => estimatedPpm <= t.max) ?? CO2_THRESHOLDS[CO2_THRESHOLDS.length - 1]

  // 권장 환기 주기 (1,000 ppm 도달 시점)
  const targetPpm = 1000
  const ppmRoom = Math.max(0, targetPpm - outdoorPpm)
  const co2VolumeBeforeAlert = (ppmRoom / 1_000_000) * input.volume * 1000  // L
  const recommendVentilateMinutes = co2LperMinute > 0
    ? Math.min(Math.round(co2VolumeBeforeAlert / co2LperMinute), 240)
    : 240

  return {
    estimatedPpm: Math.round(estimatedPpm),
    riskLevel,
    recommendVentilateMinutes,
    ppmIncrease: Math.round(ppmIncrease),
    warning: '본 추정은 단순화 모델 (±50% 오차 가능). 정확한 측정은 CO₂ 센서 사용을 권장합니다.',
  }
}

/* ─── 포맷 ─── */
export function fmt(n: number, decimals: number = 0): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
