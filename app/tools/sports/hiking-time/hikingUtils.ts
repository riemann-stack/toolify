/* ──────────────────────────────────────────────────────
   hiking-time/hikingUtils.ts
   등산 소요시간 — Naismith·Tobler·한국 표준 + 100대 명산 35+ 프리셋
   ────────────────────────────────────────────────────── */

/* ─── 보정 정의 ─── */
export type FitnessLevel = 'beginner' | 'normal' | 'advanced' | 'expert'
export type TerrainType  = 'paved' | 'normal' | 'stairs' | 'rocky' | 'rough'
export type PackWeight   = 'day' | 'overnight' | 'long'
export type GroupType    = 'solo' | 'small' | 'medium' | 'kids' | 'elderly'
export type WeatherType  = 'normal' | 'summer' | 'winter' | 'rain' | 'night'

export interface FitnessDef { id: FitnessLevel; label: string; factor: number; desc: string }
export const FITNESS: FitnessDef[] = [
  { id: 'beginner', label: '초보',     factor: 1.25, desc: '월 1회 이하 산행' },
  { id: 'normal',   label: '일반',     factor: 1.00, desc: '월 2~4회 산행' },
  { id: 'advanced', label: '상급',     factor: 0.85, desc: '월 5회+ 정기 등산' },
  { id: 'expert',   label: '전문',     factor: 0.70, desc: '트레일러닝·산악인 수준' },
]

export interface TerrainDef { id: TerrainType; label: string; factor: number; desc: string }
export const TERRAIN: TerrainDef[] = [
  { id: 'paved',  label: '포장 임도', factor: 0.85, desc: '시멘트·아스팔트' },
  { id: 'normal', label: '일반 등산로', factor: 1.00, desc: '흙길·풀길 (기준)' },
  { id: 'stairs', label: '계단 구간', factor: 1.10, desc: '나무·돌계단 다수' },
  { id: 'rocky',  label: '암릉·바위', factor: 1.25, desc: '바위 타기·로프 구간' },
  { id: 'rough',  label: '너덜·덤불', factor: 1.40, desc: '돌무더기·길 좁음' },
]

export interface PackDef { id: PackWeight; label: string; weightKg: number; factor: number; desc: string }
export const PACK: PackDef[] = [
  { id: 'day',       label: '당일',  weightKg:  5, factor: 1.00, desc: '간식·물 1L' },
  { id: 'overnight', label: '1박',   weightKg: 15, factor: 1.10, desc: '침낭·식사 포함' },
  { id: 'long',      label: '장기',  weightKg: 30, factor: 1.30, desc: '3일+ 종주·동계' },
]

export interface GroupDef { id: GroupType; label: string; factor: number; desc: string }
export const GROUP: GroupDef[] = [
  { id: 'solo',    label: '1인',         factor: 1.00, desc: '본인 페이스' },
  { id: 'small',   label: '2~3인',       factor: 1.05, desc: '소규모 동행' },
  { id: 'medium',  label: '4~6인',       factor: 1.10, desc: '중규모' },
  { id: 'kids',    label: '어린이 동반', factor: 1.30, desc: '초등 이하 포함' },
  { id: 'elderly', label: '노약자 동반', factor: 1.20, desc: '60세+ 또는 회복기' },
]

export interface WeatherDef { id: WeatherType; label: string; factor: number; desc: string }
export const WEATHER: WeatherDef[] = [
  { id: 'normal', label: '봄·가을',  factor: 1.00, desc: '쾌청 (10~25°C)' },
  { id: 'summer', label: '여름',     factor: 1.10, desc: '폭염·고온다습' },
  { id: 'winter', label: '겨울',     factor: 1.20, desc: '아이젠·한파' },
  { id: 'rain',   label: '우천',     factor: 1.20, desc: '비·미끄럼' },
  { id: 'night',  label: '야간',     factor: 1.30, desc: '헤드랜턴·시야 제한' },
]

/* ─── 한국 100대 명산 프리셋 (35) ─── */
export interface MountainPreset {
  id: string
  name: string
  region: '수도권' | '강원' | '경상' | '충청' | '전라' | '제주' | '종주'
  difficulty: '초급' | '중급' | '상급' | '최상급'
  distanceKm: number
  elevGainM: number
  elevLossM: number
  baseHours: number   // 표준 페이스 추정
  description: string
}

export const MOUNTAINS: MountainPreset[] = [
  // 수도권 (10)
  { id: 'bukhansan-baekun',  name: '북한산 백운대', region: '수도권', difficulty: '중급',  distanceKm:  7.0, elevGainM:  720, elevLossM:  720, baseHours: 4.5, description: '도선사 → 백운대 (서울 시내 조망)' },
  { id: 'dobongsan',         name: '도봉산 자운봉', region: '수도권', difficulty: '중급',  distanceKm:  7.5, elevGainM:  710, elevLossM:  710, baseHours: 4.5, description: '도봉탐방 → 자운봉 (암릉 구간)' },
  { id: 'gwanaksan',         name: '관악산 연주대', region: '수도권', difficulty: '초급',  distanceKm:  6.0, elevGainM:  500, elevLossM:  500, baseHours: 3.5, description: '서울대 → 연주대 (서울 남부 명산)' },
  { id: 'cheonggyesan',      name: '청계산 망경대', region: '수도권', difficulty: '초급',  distanceKm:  7.0, elevGainM:  500, elevLossM:  500, baseHours: 3.5, description: '원터골 → 망경대 (가족 산행)' },
  { id: 'suraksan',          name: '수락산',         region: '수도권', difficulty: '중급',  distanceKm:  6.5, elevGainM:  600, elevLossM:  600, baseHours: 4.0, description: '장암 → 수락산 정상' },
  { id: 'buramsan',          name: '불암산',         region: '수도권', difficulty: '초급',  distanceKm:  4.5, elevGainM:  400, elevLossM:  400, baseHours: 2.5, description: '상계 → 불암산 (당일 짧은 코스)' },
  { id: 'inwangsan',         name: '인왕산',         region: '수도권', difficulty: '초급',  distanceKm:  3.5, elevGainM:  280, elevLossM:  280, baseHours: 2.0, description: '독립문 → 인왕산 (도심 산책)' },
  { id: 'geomdansan',        name: '검단산',         region: '수도권', difficulty: '중급',  distanceKm:  7.0, elevGainM:  600, elevLossM:  600, baseHours: 4.0, description: '하남 검단산 (한강 조망)' },
  { id: 'gwanggyosan',       name: '광교산',         region: '수도권', difficulty: '초급',  distanceKm:  8.5, elevGainM:  500, elevLossM:  500, baseHours: 4.0, description: '경기 수원·용인 (능선)' },
  { id: 'hwaaksan',          name: '화악산',         region: '수도권', difficulty: '중급',  distanceKm: 11.0, elevGainM:  900, elevLossM:  900, baseHours: 6.5, description: '경기 가평 (1,468m)' },

  // 강원 (7)
  { id: 'seorak-ohsaek',     name: '설악산 대청봉(오색)', region: '강원', difficulty: '상급', distanceKm:  9.0, elevGainM: 1300, elevLossM: 1300, baseHours: 8.0, description: '오색 → 대청봉 (가장 짧지만 가파름)' },
  { id: 'seorak-hangye',     name: '설악산 대청봉(한계령)', region: '강원', difficulty: '상급', distanceKm: 12.0, elevGainM: 1380, elevLossM: 1380, baseHours: 10.0, description: '한계령 → 대청봉 (능선)' },
  { id: 'odaesan',           name: '오대산 비로봉',   region: '강원', difficulty: '중급',   distanceKm:  9.0, elevGainM:  870, elevLossM:  870, baseHours: 5.5, description: '상원사 → 비로봉 (1,565m)' },
  { id: 'chiaksan',          name: '치악산 비로봉',   region: '강원', difficulty: '상급',   distanceKm: 10.0, elevGainM: 1100, elevLossM: 1100, baseHours: 7.0, description: '구룡사 → 비로봉 (까칠 1,288m)' },
  { id: 'dutasan',           name: '두타산',         region: '강원', difficulty: '상급',   distanceKm: 12.0, elevGainM: 1200, elevLossM: 1200, baseHours: 8.0, description: '무릉계곡 → 두타산 (1,353m)' },
  { id: 'jeombongsan',       name: '점봉산',         region: '강원', difficulty: '상급',   distanceKm: 14.0, elevGainM: 1100, elevLossM: 1100, baseHours: 8.5, description: '곰배령 → 점봉산 (1,424m)' },
  { id: 'hambaeksan',        name: '함백산',         region: '강원', difficulty: '중급',   distanceKm:  6.0, elevGainM:  500, elevLossM:  500, baseHours: 3.5, description: '만항재 → 함백산 (1,573m)' },

  // 경상 (8)
  { id: 'jirisan-jungsanri', name: '지리산 천왕봉(중산리)', region: '경상', difficulty: '상급', distanceKm: 10.0, elevGainM: 1400, elevLossM: 1400, baseHours: 9.0, description: '중산리 → 천왕봉 (가장 짧음)' },
  { id: 'jirisan-baekmu',    name: '지리산 천왕봉(백무동)', region: '경상', difficulty: '상급', distanceKm: 11.0, elevGainM: 1400, elevLossM: 1400, baseHours: 9.5, description: '백무동 → 천왕봉' },
  { id: 'gayasan',           name: '가야산 칠불봉',   region: '경상', difficulty: '중급',   distanceKm:  8.0, elevGainM:  900, elevLossM:  900, baseHours: 5.5, description: '백운동 → 칠불봉 (1,433m)' },
  { id: 'palgongsan',        name: '팔공산 비로봉',   region: '경상', difficulty: '중급',   distanceKm:  8.0, elevGainM:  900, elevLossM:  900, baseHours: 5.5, description: '동화사 → 비로봉 (1,193m)' },
  { id: 'biseulsan',         name: '비슬산',         region: '경상', difficulty: '중급',   distanceKm:  9.0, elevGainM:  870, elevLossM:  870, baseHours: 5.5, description: '대구 비슬산 (1,084m, 봄 진달래)' },
  { id: 'gajisan',           name: '가지산',         region: '경상', difficulty: '중급',   distanceKm:  8.5, elevGainM:  900, elevLossM:  900, baseHours: 5.5, description: '울산 가지산 (1,241m)' },
  { id: 'hwangmaesan',       name: '황매산',         region: '경상', difficulty: '초급',   distanceKm:  4.5, elevGainM:  300, elevLossM:  300, baseHours: 2.5, description: '합천 황매산 (5월 철쭉)' },
  { id: 'sinbulsan',         name: '신불산·영축산',  region: '경상', difficulty: '중급',   distanceKm: 11.0, elevGainM:  900, elevLossM:  900, baseHours: 6.5, description: '울산 영남알프스 능선' },

  // 충청 (5)
  { id: 'sobaeksan',         name: '소백산 비로봉',   region: '충청', difficulty: '중급',   distanceKm:  8.0, elevGainM:  900, elevLossM:  900, baseHours: 5.5, description: '천동 → 비로봉 (1,439m)' },
  { id: 'songnisan',         name: '속리산 문장대',   region: '충청', difficulty: '중급',   distanceKm:  9.0, elevGainM:  830, elevLossM:  830, baseHours: 5.5, description: '법주사 → 문장대 (1,054m)' },
  { id: 'woraksan',          name: '월악산 영봉',     region: '충청', difficulty: '상급',   distanceKm:  8.0, elevGainM: 1000, elevLossM: 1000, baseHours: 6.5, description: '동창교 → 영봉 (계단 다수)' },
  { id: 'gyeryongsan',       name: '계룡산 천황봉',   region: '충청', difficulty: '중급',   distanceKm:  9.0, elevGainM:  750, elevLossM:  750, baseHours: 5.0, description: '동학사 → 천황봉 (845m)' },
  { id: 'doraksan',          name: '도락산',         region: '충청', difficulty: '중급',   distanceKm:  7.0, elevGainM:  650, elevLossM:  650, baseHours: 4.5, description: '단양 도락산 (964m)' },

  // 전라 (5)
  { id: 'mudeungsan',        name: '무등산 천왕봉',   region: '전라', difficulty: '중급',   distanceKm: 10.0, elevGainM:  900, elevLossM:  900, baseHours: 5.5, description: '광주 무등산 (1,187m)' },
  { id: 'naejangsan',        name: '내장산',         region: '전라', difficulty: '초급',   distanceKm:  6.0, elevGainM:  500, elevLossM:  500, baseHours: 3.5, description: '내장사 → 신선봉 (가을 단풍 명산)' },
  { id: 'wolchulsan',        name: '월출산',         region: '전라', difficulty: '상급',   distanceKm:  6.5, elevGainM:  650, elevLossM:  650, baseHours: 4.5, description: '천황사 → 천황봉 (암릉 까다로움)' },
  { id: 'maisan',            name: '마이산',         region: '전라', difficulty: '초급',   distanceKm:  4.0, elevGainM:  300, elevLossM:  300, baseHours: 2.0, description: '진안 마이산 (말귀봉)' },
  { id: 'unjangsan',         name: '운장산',         region: '전라', difficulty: '중급',   distanceKm:  9.0, elevGainM:  900, elevLossM:  900, baseHours: 5.5, description: '진안 운장산 (1,126m)' },

  // 제주 (3)
  { id: 'hallasan-seongpan', name: '한라산 성판악',   region: '제주', difficulty: '상급',   distanceKm: 19.2, elevGainM: 1300, elevLossM: 1300, baseHours: 9.0, description: '성판악 → 백록담 (가장 긴 코스)' },
  { id: 'hallasan-gwaneum',  name: '한라산 관음사',   region: '제주', difficulty: '상급',   distanceKm: 17.6, elevGainM: 1300, elevLossM: 1300, baseHours: 9.5, description: '관음사 → 백록담 (가파름)' },
  { id: 'hallasan-yeongsil', name: '한라산 영실',     region: '제주', difficulty: '중급',   distanceKm: 11.7, elevGainM:  650, elevLossM:  650, baseHours: 5.0, description: '영실 → 윗세오름 (백록담 X)' },

  // 종주 (1)
  { id: 'jirisan-jongju',    name: '지리산 종주(노고단~천왕봉)', region: '종주', difficulty: '최상급', distanceKm: 25.0, elevGainM: 2000, elevLossM: 2000, baseHours: 14.0, description: '1박 2일 권장. 당일 무박은 전문가만' },
]

/* ─── 입력 ─── */
export interface CalcInputs {
  distanceKm: number
  elevGainM: number
  elevLossM: number

  fitness:  FitnessLevel
  terrain:  TerrainType
  pack:     PackWeight
  group:    GroupType
  weather:  WeatherType

  startTime: string  // 'HH:MM'
  sunsetTime: string // 'HH:MM'

  restMode: 'auto' | 'manual'
  manualRestMin: number  // 수동 휴식 (분)
}

/* ─── 결과 ─── */
export interface FormulaResult {
  formula: 'naismith' | 'tobler' | 'korean'
  label: string
  ascendMin: number
  descendMin: number
  flatMin:    number
  totalMin:   number
}

export interface CalcResult {
  formulas: FormulaResult[]
  selected: FormulaResult  // korean 기본
  appliedFactor: number
  factorBreakdown: { label: string; factor: number }[]
  movingMin: number
  restMin: number
  totalMin: number
  arrivalMinutes: number  // start + total (분 단위, 0~24*60)
  turnaroundMinutes: number  // sunset - 1h
  isSafe: boolean
  isRisky: boolean
  isDanger: boolean
}

/* ─── 공식 ─── */
export function naismithMin(distanceKm: number, elevGainM: number): FormulaResult {
  // 평지 5km/h + 600m당 1시간
  const flatMin = (distanceKm / 5) * 60
  const ascendMin = (elevGainM / 600) * 60
  // 내리막은 보정 없음 (전통 Naismith)
  return {
    formula: 'naismith', label: 'Naismith (1892)',
    ascendMin, descendMin: 0, flatMin,
    totalMin: flatMin + ascendMin,
  }
}

export function toblerMin(distanceKm: number, elevGainM: number, elevLossM: number): FormulaResult {
  // W(slope) = 6 * exp(-3.5 * |slope + 0.05|) km/h
  // 거리를 절반씩 오르막·내리막으로 가정 (단순화)
  const upSlope   = elevGainM / Math.max(1, distanceKm * 1000 / 2)  // m/m
  const downSlope = -elevLossM / Math.max(1, distanceKm * 1000 / 2)
  const upSpeed   = 6 * Math.exp(-3.5 * Math.abs(upSlope + 0.05))
  const downSpeed = 6 * Math.exp(-3.5 * Math.abs(downSlope + 0.05))
  const halfDist = distanceKm / 2
  const ascendMin  = (halfDist / Math.max(0.5, upSpeed)) * 60
  const descendMin = (halfDist / Math.max(0.5, downSpeed)) * 60
  return {
    formula: 'tobler', label: 'Tobler (1993)',
    ascendMin, descendMin, flatMin: 0,
    totalMin: ascendMin + descendMin,
  }
}

export function koreanMin(distanceKm: number, elevGainM: number, elevLossM: number): FormulaResult {
  // 한국 100대 명산 표준 코스타임에 맞춰 보정한 계수 (이동시간 기준, 휴식 별도)
  // 거리 1km당 약 10분 + 오르막 표고 100m당 16분 + 내리막 100m당 7분
  // → 휴식(50분당 10분) 합산 시 35개 프리셋 표준 소요시간과 평균 오차 ~5%
  const flatMin = (distanceKm / 6) * 60   // 거리 보정 (1km ≈ 10분)
  const ascendMin = (elevGainM / 100) * 16
  const descendMin = (elevLossM / 100) * 7
  return {
    formula: 'korean', label: '한국 코스타임',
    ascendMin, descendMin, flatMin,
    totalMin: flatMin + ascendMin + descendMin,
  }
}

/* ─── 시간 파서 ─── */
export function parseHHMM(s: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s)
  if (!m) return 0
  return Math.min(24 * 60 - 1, parseInt(m[1]) * 60 + parseInt(m[2]))
}

export function fmtHHMM(minutes: number): string {
  const all = Math.max(0, Math.floor(minutes))
  const dayOver = Math.floor(all / (24 * 60))   // 자정 넘김 → 익일 표기
  const total = all % (24 * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  const hhmm = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  return dayOver > 0 ? `${hhmm} (+${dayOver}일)` : hhmm
}

export function fmtDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes))
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h === 0) return `${r}분`
  if (r === 0) return `${h}시간`
  return `${h}시간 ${r}분`
}

/* ─── 메인 계산 ─── */
export function calculate(inputs: CalcInputs): CalcResult {
  const fit  = FITNESS.find((x) => x.id === inputs.fitness)  ?? FITNESS[1]
  const terr = TERRAIN.find((x) => x.id === inputs.terrain)  ?? TERRAIN[1]
  const pack = PACK.find((x) => x.id === inputs.pack)        ?? PACK[0]
  const grp  = GROUP.find((x) => x.id === inputs.group)      ?? GROUP[0]
  const wth  = WEATHER.find((x) => x.id === inputs.weather)  ?? WEATHER[0]

  const factorBreakdown = [
    { label: `체력: ${fit.label}`,  factor: fit.factor },
    { label: `지형: ${terr.label}`, factor: terr.factor },
    { label: `배낭: ${pack.label}`, factor: pack.factor },
    { label: `인원: ${grp.label}`,  factor: grp.factor },
    { label: `조건: ${wth.label}`,  factor: wth.factor },
  ]
  const appliedFactor = fit.factor * terr.factor * pack.factor * grp.factor * wth.factor

  const naismith = naismithMin(inputs.distanceKm, inputs.elevGainM)
  const tobler   = toblerMin(inputs.distanceKm, inputs.elevGainM, inputs.elevLossM)
  const korean   = koreanMin(inputs.distanceKm, inputs.elevGainM, inputs.elevLossM)

  // 보정 적용
  const apply = (r: FormulaResult): FormulaResult => ({
    ...r,
    ascendMin:  r.ascendMin  * appliedFactor,
    descendMin: r.descendMin * appliedFactor,
    flatMin:    r.flatMin    * appliedFactor,
    totalMin:   r.totalMin   * appliedFactor,
  })

  const formulas: FormulaResult[] = [apply(naismith), apply(tobler), apply(korean)]
  const selected = formulas[2]  // 한국 표준 기본

  const movingMin = selected.totalMin
  const restMin = inputs.restMode === 'auto'
    ? Math.floor(movingMin / 50) * 10  // 50분 보행 + 10분 휴식
    : Math.max(0, inputs.manualRestMin)
  const totalMin = movingMin + restMin

  const startMinutes = parseHHMM(inputs.startTime)
  const sunsetMinutes = parseHHMM(inputs.sunsetTime)
  const arrivalMinutes = startMinutes + totalMin
  const turnaroundMinutes = sunsetMinutes - 60

  // 안전도
  const isSafe   = arrivalMinutes <= turnaroundMinutes
  const isDanger = arrivalMinutes > sunsetMinutes
  const isRisky  = !isSafe && !isDanger

  return {
    formulas,
    selected,
    appliedFactor,
    factorBreakdown,
    movingMin,
    restMin,
    totalMin,
    arrivalMinutes,
    turnaroundMinutes,
    isSafe,
    isRisky,
    isDanger,
  }
}

/* ─── 단계별 시간표 ─── */
export interface TimelineStep {
  km: number
  label: string
  minutesFromStart: number
  arrivalAtMinutes: number
  isSummit: boolean
  isRest: boolean
}

/** 거리 기반 단계별 (1km 또는 2km 간격) */
export function buildTimeline(inputs: CalcInputs, result: CalcResult): TimelineStep[] {
  const startMinutes = parseHHMM(inputs.startTime)
  const totalDist = inputs.distanceKm
  const movingMin = result.movingMin
  const minPerKm = movingMin / Math.max(1, totalDist)

  // 단계 간격: 짧은 코스 1km, 긴 코스 2km
  const stepKm = totalDist <= 8 ? 1 : 2
  const halfDist = totalDist / 2

  const steps: TimelineStep[] = []
  steps.push({
    km: 0, label: '들머리 (출발)',
    minutesFromStart: 0,
    arrivalAtMinutes: startMinutes,
    isSummit: false, isRest: false,
  })

  let cumDist = stepKm
  let cumMoving = stepKm * minPerKm
  let summitAdded = false

  while (cumDist < totalDist) {
    let isSummit = false
    let label = `${cumDist.toFixed(0)}km 지점`
    // 정상 위치 보정: 거리의 절반쯤
    if (!summitAdded && cumDist >= halfDist) {
      isSummit = true
      label = `🏔️ 정상 (약 ${cumDist.toFixed(0)}km)`
      summitAdded = true
    }
    // 휴식 누적 (auto)
    const restSoFar = inputs.restMode === 'auto' ? Math.floor(cumMoving / 50) * 10 : 0
    steps.push({
      km: cumDist,
      label,
      minutesFromStart: cumMoving + restSoFar,
      arrivalAtMinutes: startMinutes + cumMoving + restSoFar,
      isSummit,
      isRest: false,
    })
    cumDist += stepKm
    cumMoving += stepKm * minPerKm
  }

  if (!summitAdded) {
    // 정상이 아직 안 추가됐으면 (drop case)
    steps.push({
      km: halfDist, label: '🏔️ 정상',
      minutesFromStart: halfDist * minPerKm,
      arrivalAtMinutes: startMinutes + halfDist * minPerKm,
      isSummit: true, isRest: false,
    })
  }

  steps.push({
    km: totalDist,
    label: '날머리 (도착)',
    minutesFromStart: result.totalMin,
    arrivalAtMinutes: result.arrivalMinutes,
    isSummit: false, isRest: false,
  })

  return steps.sort((a, b) => a.km - b.km)
}

/* ─── 일출·일몰 평균표 (서울/부산/제주) ─── */
export interface SunData {
  month: number
  seoul:  { rise: string; set: string }
  busan:  { rise: string; set: string }
  jeju:   { rise: string; set: string }
}

export const SUN_AVERAGES: SunData[] = [
  { month:  1, seoul: { rise: '07:46', set: '17:35' }, busan: { rise: '07:32', set: '17:35' }, jeju: { rise: '07:40', set: '17:46' } },
  { month:  2, seoul: { rise: '07:21', set: '18:08' }, busan: { rise: '07:11', set: '18:05' }, jeju: { rise: '07:18', set: '18:14' } },
  { month:  3, seoul: { rise: '06:38', set: '18:36' }, busan: { rise: '06:33', set: '18:31' }, jeju: { rise: '06:39', set: '18:36' } },
  { month:  4, seoul: { rise: '05:48', set: '19:01' }, busan: { rise: '05:48', set: '18:54' }, jeju: { rise: '05:54', set: '18:55' } },
  { month:  5, seoul: { rise: '05:14', set: '19:27' }, busan: { rise: '05:18', set: '19:18' }, jeju: { rise: '05:24', set: '19:16' } },
  { month:  6, seoul: { rise: '05:07', set: '19:45' }, busan: { rise: '05:13', set: '19:35' }, jeju: { rise: '05:19', set: '19:31' } },
  { month:  7, seoul: { rise: '05:21', set: '19:45' }, busan: { rise: '05:25', set: '19:36' }, jeju: { rise: '05:31', set: '19:32' } },
  { month:  8, seoul: { rise: '05:46', set: '19:18' }, busan: { rise: '05:48', set: '19:11' }, jeju: { rise: '05:54', set: '19:10' } },
  { month:  9, seoul: { rise: '06:11', set: '18:36' }, busan: { rise: '06:11', set: '18:31' }, jeju: { rise: '06:17', set: '18:33' } },
  { month: 10, seoul: { rise: '06:36', set: '17:50' }, busan: { rise: '06:33', set: '17:48' }, jeju: { rise: '06:40', set: '17:54' } },
  { month: 11, seoul: { rise: '07:08', set: '17:18' }, busan: { rise: '07:00', set: '17:20' }, jeju: { rise: '07:08', set: '17:30' } },
  { month: 12, seoul: { rise: '07:38', set: '17:14' }, busan: { rise: '07:26', set: '17:18' }, jeju: { rise: '07:34', set: '17:30' } },
]

/* ─── 등산 체크리스트 ─── */
export const CHECKLIST = [
  '👕 등산복 (땀 흡수·속건성, 면 X)',
  '👟 등산화 (방수·발목 고정·바닥 그립)',
  '🎒 배낭 (적정 용량·허리 벨트)',
  '💧 식수 (1인 1L 이상, 여름 2L)',
  '🍫 행동식 (초콜릿·견과류·에너지바)',
  '🧥 방한·방수 자켓 (고도 100m당 -0.6°C)',
  '🔦 헤드랜턴 + 예비 배터리 (당일도 필수)',
  '🩹 응급키트 (반창고·진통제·알코올솜)',
  '📱 충전된 휴대폰 + 보조 배터리',
  '🗺️ 지도·GPS 앱 (산림청 산림안전, 트랭글, 램블러)',
]

/* ─── 비상 대응 ─── */
export const EMERGENCY = [
  { title: '저체온증 의심', steps: ['바람 막히는 곳으로', '젖은 옷 갈아입기', '단 음식·따뜻한 음료', '119 신고 (체온 35°C 이하)'] },
  { title: '길을 잃었을 때', steps: ['STOP — 멈추고 침착', '왔던 길 100m 되돌아가기', '능선·계곡 따라 이동 X', '119 신고 + 좌표 전달 (산림청 좌표앱)'] },
  { title: '발목·무릎 부상', steps: ['움직이지 말고 휴식', '얼음 또는 시원한 천', '압박 붕대 (있으면)', '심한 부상 시 119, 못 움직이면 SOS 호각'] },
  { title: '벌·뱀에 쏘임', steps: ['독침 카드로 긁어 빼기', '심장 아래 위치', '항히스타민 (있으면)', '아나필락시스 의심 시 119'] },
]
