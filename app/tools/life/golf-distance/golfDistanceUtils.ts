// ─────────────────────────────────────────────────────────────
// 골프 클럽 비거리 계산기 — 환경 보정·기록·단위 변환 헬퍼
// ─────────────────────────────────────────────────────────────

// 거리 단위
export type DistanceUnit = 'm' | 'yard'
export const M_TO_YARD = 1.0936
export const YARD_TO_M = 0.9144

export function convertDistance(value: number, from: DistanceUnit, to: DistanceUnit): number {
  if (from === to) return value
  if (from === 'm' && to === 'yard') return value * M_TO_YARD
  return value * YARD_TO_M
}

// ─────────────────────────────────────────────────────────────
// 시니어·여성 시니어 평균 비거리 (한국 기준 추정)
// ─────────────────────────────────────────────────────────────
export type GenderAge = 'male' | 'female' | 'maleSenior' | 'femaleSenior'

export const GENDER_AGE_LABEL: Record<GenderAge, string> = {
  male:         '남성 (20~50대)',
  female:       '여성 (20~50대)',
  maleSenior:   '남성 시니어 (60대+)',
  femaleSenior: '여성 시니어 (60대+)',
}

// 시니어는 일반 대비 약 -15% (60대), 70대+ 시는 -20~25%
// 여기선 60대 기준
export const SENIOR_FACTOR = 0.85

// ─────────────────────────────────────────────────────────────
// 환경 보정
// ─────────────────────────────────────────────────────────────
export type WindDirection = 'head' | 'tail' | 'cross' | 'none'
export type LieType = 'fairway' | 'rough' | 'thick-rough' | 'divot' | 'bunker' | 'tee'

export const LIE_LABEL: Record<LieType, string> = {
  fairway:       '🌱 페어웨이 (기본)',
  tee:           '⛳ 티잉 그라운드',
  rough:         '🌾 러프',
  'thick-rough': '🌿 깊은 러프',
  divot:         '🕳️ 디봇',
  bunker:        '🏖️ 벙커',
}

export const LIE_FACTOR: Record<LieType, number> = {
  tee:           1.0,
  fairway:       1.0,
  rough:         0.95,
  'thick-rough': 0.85,
  divot:         0.92,
  bunker:        0.7,
}

export type EnvInput = {
  baseDistance: number
  unit: DistanceUnit       // 입력·출력 단위
  temperature: number      // °C
  elevation: number        // m
  windDirection: WindDirection
  windSpeed: number        // m/s
  slopeAngle: number       // 도, 양수 = 오르막
  lieType: LieType
}

export type EnvChange = { factor: string; impact: number; desc: string; tone: 'pos' | 'neg' | 'neu' }

export type EnvResult = {
  correctedDistance: number
  changePercent: number
  totalImpact: number
  changes: EnvChange[]
}

// 환경 보정 계산 (입력 단위 그대로 반환)
export function calcEnvCorrected(input: EnvInput): EnvResult {
  let dist = input.baseDistance
  const baseDist = input.baseDistance
  const changes: EnvChange[] = []

  // 기온: 20°C 기준, 1°C 차이당 0.27%
  const tempDiff = input.temperature - 20
  const tempImpact = baseDist * (tempDiff * 0.0027)
  if (tempDiff !== 0) {
    changes.push({
      factor: '🌡️ 기온',
      impact: tempImpact,
      desc: `${input.temperature}°C (기준 20°C 대비 ${tempDiff > 0 ? '+' : ''}${tempDiff}°C)`,
      tone: tempImpact > 0 ? 'pos' : 'neg',
    })
    dist += tempImpact
  }

  // 고도: 해발 +1,000m → +4.5%
  const elevImpact = baseDist * (input.elevation * 0.000045)
  if (input.elevation > 0) {
    changes.push({
      factor: '🏔️ 고도',
      impact: elevImpact,
      desc: `해발 ${input.elevation}m`,
      tone: elevImpact > 0 ? 'pos' : 'neu',
    })
    dist += elevImpact
  }

  // 바람: 정면 -2m/s, 등 +1.5m/s, 옆 0
  let windImpact = 0
  let windDescPart = ''
  if (input.windDirection === 'head' && input.windSpeed > 0) {
    windImpact = -input.windSpeed * 2
    windDescPart = `정면 ${input.windSpeed}m/s (강한 역풍)`
  } else if (input.windDirection === 'tail' && input.windSpeed > 0) {
    windImpact = input.windSpeed * 1.5
    windDescPart = `등 ${input.windSpeed}m/s (순풍)`
  } else if (input.windDirection === 'cross' && input.windSpeed > 0) {
    windImpact = 0
    windDescPart = `옆 ${input.windSpeed}m/s (방향성 ↑)`
  }
  if (input.windDirection !== 'none' && input.windSpeed > 0) {
    changes.push({
      factor: '💨 바람',
      impact: windImpact,
      desc: windDescPart,
      tone: windImpact > 0 ? 'pos' : windImpact < 0 ? 'neg' : 'neu',
    })
    dist += windImpact
  }

  // 경사: 1° 오르막 → -0.5m, 1° 내리막 → +0.7m
  let slopeImpact = 0
  if (input.slopeAngle > 0) slopeImpact = -input.slopeAngle * 0.5
  else if (input.slopeAngle < 0) slopeImpact = -input.slopeAngle * 0.7
  if (input.slopeAngle !== 0) {
    changes.push({
      factor: '⛰️ 경사',
      impact: slopeImpact,
      desc: `${input.slopeAngle > 0 ? '오르막' : '내리막'} ${Math.abs(input.slopeAngle)}°`,
      tone: slopeImpact > 0 ? 'pos' : 'neg',
    })
    dist += slopeImpact
  }

  // 라이 (잔디 상태)
  const lieFactor = LIE_FACTOR[input.lieType]
  const lieImpact = baseDist * (lieFactor - 1)
  if (lieFactor !== 1.0) {
    changes.push({
      factor: '🌿 라이',
      impact: lieImpact,
      desc: LIE_LABEL[input.lieType],
      tone: lieImpact > 0 ? 'pos' : 'neg',
    })
    dist += lieImpact
  }

  const totalImpact = dist - baseDist
  const changePercent = baseDist > 0 ? (totalImpact / baseDist) * 100 : 0

  return {
    correctedDistance: Math.round(dist),
    changePercent: Math.round(changePercent * 10) / 10,
    totalImpact: Math.round(totalImpact * 10) / 10,
    changes,
  }
}

// ─────────────────────────────────────────────────────────────
// 비거리 기록 (localStorage)
// ─────────────────────────────────────────────────────────────
export type RecordLocation = 'driving-range' | 'practice-course' | 'real-course' | 'screen'

export const LOCATION_LABEL: Record<RecordLocation, string> = {
  'driving-range':   '🎯 연습장',
  'practice-course': '🏌️ 연습 라운딩',
  'real-course':     '⛳ 실전 라운딩',
  'screen':          '🖥️ 스크린',
}

export type DistanceRecord = {
  id: string
  date: string  // YYYY-MM-DD
  ts: number    // ms
  location: RecordLocation
  temperature?: number  // °C
  windSpeed?: number    // m/s
  driver?: number       // m (기본 단위)
  iron7?: number
  notes?: string
}

const STORAGE_KEY = 'youtil-golf-records-v1'
const KEEP_DAYS = 365

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function loadRecords(): DistanceRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as DistanceRecord[]
    if (!Array.isArray(arr)) return []
    const cutoff = Date.now() - KEEP_DAYS * 86400_000
    return arr
      .filter(r => r.ts >= cutoff)
      .sort((a, b) => b.ts - a.ts)
  } catch { return [] }
}

export function saveRecords(arr: DistanceRecord[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)) } catch {}
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 추세 분석
export type TrendStat = {
  total: number
  driverAvg: number | null
  iron7Avg: number | null
  driverChange: number | null  // 최근 30일 vs 그 이전 평균 차이
  iron7Change: number | null
  bestDriver: number | null
  bestIron7: number | null
}

export function analyzeRecords(records: DistanceRecord[]): TrendStat {
  if (records.length === 0) {
    return {
      total: 0, driverAvg: null, iron7Avg: null,
      driverChange: null, iron7Change: null,
      bestDriver: null, bestIron7: null,
    }
  }

  const driverVals = records.filter(r => r.driver && r.driver > 0).map(r => r.driver as number)
  const iron7Vals  = records.filter(r => r.iron7 && r.iron7 > 0).map(r => r.iron7 as number)

  const driverAvg = driverVals.length > 0 ? driverVals.reduce((s, v) => s + v, 0) / driverVals.length : null
  const iron7Avg  = iron7Vals.length > 0  ? iron7Vals.reduce((s, v) => s + v, 0) / iron7Vals.length   : null
  const bestDriver = driverVals.length > 0 ? Math.max(...driverVals) : null
  const bestIron7  = iron7Vals.length > 0  ? Math.max(...iron7Vals)  : null

  // 최근 30일 vs 그 이전
  const cut30 = Date.now() - 30 * 86400_000
  const recent = records.filter(r => r.ts >= cut30)
  const past   = records.filter(r => r.ts < cut30)

  const recentDriver = recent.filter(r => r.driver).map(r => r.driver as number)
  const pastDriver   = past.filter(r => r.driver).map(r => r.driver as number)
  const recentIron7  = recent.filter(r => r.iron7).map(r => r.iron7 as number)
  const pastIron7    = past.filter(r => r.iron7).map(r => r.iron7 as number)

  const avg = (arr: number[]): number | null => arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : null

  const recDrAvg = avg(recentDriver), pastDrAvg = avg(pastDriver)
  const recIrAvg = avg(recentIron7),  pastIrAvg = avg(pastIron7)

  return {
    total: records.length,
    driverAvg: driverAvg !== null ? Math.round(driverAvg) : null,
    iron7Avg:  iron7Avg  !== null ? Math.round(iron7Avg)  : null,
    driverChange: (recDrAvg !== null && pastDrAvg !== null) ? Math.round(recDrAvg - pastDrAvg) : null,
    iron7Change:  (recIrAvg !== null && pastIrAvg !== null) ? Math.round(recIrAvg - pastIrAvg) : null,
    bestDriver, bestIron7,
  }
}
