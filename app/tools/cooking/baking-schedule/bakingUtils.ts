/* ──────────────────────────────────────────────────────
   baking-schedule/bakingUtils.ts
   일정 생성 (forward·backward), 온도 보정, localStorage
   ────────────────────────────────────────────────────── */

import {
  BREAD_PRESETS, TEMP_MULTIPLIERS, MIXING_METHODS, emojiForStep,
  type BreadPreset, type StepDef, type TempInfo, type FermentationMode,
  type MixingMethod,
} from './breadPresets'

export type ScheduleStep = {
  id: string
  name: string
  emoji: string
  startTime: Date
  endTime: Date
  duration: number   // 분
  guide?: string
  warning?: string
  tempSensitive: boolean
  observationKey?: 'bulk' | 'final-proof' | 'cold-proof'
  flexible?: boolean
  isOptional?: boolean
}

export type ScheduleResult = {
  steps: ScheduleStep[]
  startTime: Date
  endTime: Date
  totalMinutes: number
  preset: BreadPreset
  fermentationMode: FermentationMode
  roomTempC: number
  tempInfo: TempInfo
}

/** 가장 가까운 온도의 보정 정보 반환 */
export function getTempInfo(roomTempC: number): TempInfo {
  return TEMP_MULTIPLIERS.reduce((prev, curr) =>
    Math.abs(curr.temp - roomTempC) < Math.abs(prev.temp - roomTempC) ? curr : prev
  )
}

/** 발효 방식에 따라 단계 조정 */
function applyFermentationMode(steps: StepDef[], mode: FermentationMode): StepDef[] {
  // 'sameday' 기준은 그대로 두고, cold 모드는 냉장 단계 활성화·실온 단축
  if (mode === 'sameday') {
    // 냉장 발효 단계 제거
    return steps.filter(s => s.id !== 'cold-proof')
  }

  if (mode === 'cold-bulk') {
    // 1차 발효를 냉장 발효로 대체 (10시간), 냉장 최종 발효 제거
    return steps.flatMap<StepDef>(s => {
      if (s.id === 'cold-proof') return []
      if (s.id === 'bulk') {
        return [{
          id: 'bulk',
          name: '1차 발효 (냉장)',
          minutes: 600,
          observationKey: 'cold-proof',
          flexible: true,
          minRange: 480,
          maxRange: 720,
          guide: '⭐ 8~12시간 냉장 — 표준의 4~5배 시간',
        }]
      }
      return [s]
    })
  }

  if (mode === 'cold-final') {
    // 사워도우 등 기본 냉장 최종 발효 — 그대로
    return steps
  }

  if (mode === 'cold-bulk-final') {
    // 1차 + 최종 모두 냉장 (전체 24시간+)
    return steps.flatMap<StepDef>(s => {
      if (s.id === 'bulk') {
        return [{
          id: 'bulk',
          name: '1차 발효 (냉장 8시간)',
          minutes: 480,
          observationKey: 'cold-proof',
          flexible: true,
          minRange: 360,
          maxRange: 600,
          guide: '⭐ 냉장 8시간 — 다음날 성형',
        }]
      }
      return [s]
    })
  }

  return steps
}

/** 일정 생성 — 시작 시간 기준 (forward) */
export function generateForwardSchedule(
  presetId: string,
  startTime: Date,
  fermentationMode: FermentationMode,
  roomTempC: number,
  includeOptional = true,
): ScheduleResult | null {
  const preset = BREAD_PRESETS.find(p => p.id === presetId)
  if (!preset) return null

  let stepDefs = applyFermentationMode(preset.steps, fermentationMode)
  if (!includeOptional) stepDefs = stepDefs.filter(s => !s.optional)

  const tempInfo = getTempInfo(roomTempC)

  const steps: ScheduleStep[] = []
  const cur = new Date(startTime)

  for (const sd of stepDefs) {
    const minutes = sd.tempSensitive ? Math.round(sd.minutes * tempInfo.multiplier) : sd.minutes
    const start = new Date(cur)
    cur.setMinutes(cur.getMinutes() + minutes)
    steps.push({
      id: sd.id,
      name: sd.name,
      emoji: emojiForStep(sd.id),
      startTime: start,
      endTime: new Date(cur),
      duration: minutes,
      guide: sd.guide,
      warning: sd.tempSensitive ? tempInfo.warning : undefined,
      tempSensitive: !!sd.tempSensitive,
      observationKey: sd.observationKey,
      flexible: sd.flexible,
      isOptional: sd.optional,
    })
  }

  const endTime = steps.length > 0 ? steps[steps.length - 1].endTime : startTime
  const totalMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60_000)

  return {
    steps,
    startTime: new Date(startTime),
    endTime,
    totalMinutes,
    preset,
    fermentationMode,
    roomTempC,
    tempInfo,
  }
}

/** 일정 생성 — 완성 시간 역산 (backward) */
export function generateBackwardSchedule(
  presetId: string,
  endTime: Date,
  fermentationMode: FermentationMode,
  roomTempC: number,
  includeOptional = true,
): ScheduleResult | null {
  const preset = BREAD_PRESETS.find(p => p.id === presetId)
  if (!preset) return null

  let stepDefs = applyFermentationMode(preset.steps, fermentationMode)
  if (!includeOptional) stepDefs = stepDefs.filter(s => !s.optional)

  const tempInfo = getTempInfo(roomTempC)

  const adjusted = stepDefs.map(sd => ({
    sd,
    minutes: sd.tempSensitive ? Math.round(sd.minutes * tempInfo.multiplier) : sd.minutes,
  }))
  const totalMinutes = adjusted.reduce((sum, x) => sum + x.minutes, 0)

  const startTime = new Date(endTime)
  startTime.setMinutes(startTime.getMinutes() - totalMinutes)

  const steps: ScheduleStep[] = []
  const cur = new Date(startTime)
  for (const { sd, minutes } of adjusted) {
    const start = new Date(cur)
    cur.setMinutes(cur.getMinutes() + minutes)
    steps.push({
      id: sd.id,
      name: sd.name,
      emoji: emojiForStep(sd.id),
      startTime: start,
      endTime: new Date(cur),
      duration: minutes,
      guide: sd.guide,
      warning: sd.tempSensitive ? tempInfo.warning : undefined,
      tempSensitive: !!sd.tempSensitive,
      observationKey: sd.observationKey,
      flexible: sd.flexible,
      isOptional: sd.optional,
    })
  }

  return {
    steps,
    startTime,
    endTime: new Date(endTime),
    totalMinutes,
    preset,
    fermentationMode,
    roomTempC,
    tempInfo,
  }
}

/* ─── 시간 포맷터 ─── */
export function fmtTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function fmtDateTime(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da} ${fmtTime(d)}`
}

export function fmtDateTimeKo(d: Date): string {
  const dow = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dow}) ${fmtTime(d)}`
}

/** 분 → "X시간 Y분" 한글 */
export function fmtDuration(mins: number): string {
  if (mins < 60) return `${mins}분`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

/** 두 시간 차이 — "다음날 오전 9시 30분" 처럼 */
export function dayDiffLabel(start: Date, end: Date): string | null {
  const sDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const eDay = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  const diff = Math.round((eDay.getTime() - sDay.getTime()) / (24 * 60 * 60 * 1000))
  if (diff === 0) return null
  if (diff === 1) return '다음날'
  if (diff === 2) return '이틀 후'
  return `${diff}일 후`
}

/* ─── localStorage — 내 레시피 ─── */
export type SavedRecipe = {
  id: string
  name: string                  // 사용자가 정한 이름
  presetId: string              // 빵 종류
  fermentationMode: FermentationMode
  roomTempC: number
  includeOptional: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'youtil-baking-recipes-v1'

export function loadRecipes(): SavedRecipe[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveRecipes(recipes: SavedRecipe[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)) } catch { /* quota */ }
}

export function newRecipeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/** datetime-local 입력값을 Date로 변환 */
export function parseDateTimeLocal(s: string): Date | null {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

/** Date → datetime-local 입력값 */
export function toDateTimeLocal(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${da}T${h}:${m}`
}

/* ──────────────────────────────────────────────────────
   DDT (반죽 최종 온도) — 권장 물 온도 계산
   ────────────────────────────────────────────────────── */
export type DDTInput = {
  targetDoughC: number
  flourTempC: number
  roomTempC: number
  levainTempC?: number       // hasLevain 경우만
  hasLevain: boolean
  mixingMethod: MixingMethod
}

export type DDTResult = {
  /** 권장 물 온도 (℃) — 정수 반올림 */
  waterTempC: number
  /** 물 온도 안내 (안내 문구 + 등급) */
  band: 'frozen' | 'cold' | 'normal' | 'warm' | 'hot'
  advice: string
  /** 권장 반죽 후 예상 반죽 온도 (DDT) — 입력대로 작업 시 = targetDoughC */
  expectedDoughC: number
  /** 경고 (효모 사멸 등) */
  warning?: string
  /** 사용한 마찰열 값 (계산 추적용) */
  friction: number
}

export function calcWaterTemp(input: DDTInput): DDTResult {
  const m = MIXING_METHODS.find(x => x.id === input.mixingMethod) ?? MIXING_METHODS[0]
  const friction = m.friction

  let waterTempC: number
  if (input.hasLevain) {
    // DDT × 4 = 밀가루 + 실내 + 르방 + 물 + 마찰열
    const lev = input.levainTempC ?? input.roomTempC
    waterTempC = input.targetDoughC * 4 - input.flourTempC - input.roomTempC - lev - friction
  } else {
    // DDT × 3 = 밀가루 + 실내 + 물 + 마찰열
    waterTempC = input.targetDoughC * 3 - input.flourTempC - input.roomTempC - friction
  }
  waterTempC = Math.round(waterTempC * 10) / 10

  let band: DDTResult['band']
  let advice: string
  let warning: string | undefined

  if (waterTempC < 5) {
    band = 'frozen'
    advice = '얼음물 사용 — 냉장 보관 물 + 얼음을 함께 무게로 측정해 정확히 맞추세요'
  } else if (waterTempC < 18) {
    band = 'cold'
    advice = '냉장 또는 차가운 수돗물 — 여름철에는 얼음 1~2개를 추가해 미세 조정'
  } else if (waterTempC <= 30) {
    band = 'normal'
    advice = '실온 수돗물로 충분 — 온도계로 한 번 측정 후 진행'
  } else if (waterTempC <= 45) {
    band = 'warm'
    advice = '미지근한 물 — 손목 안쪽에 닿았을 때 따뜻한 정도'
  } else {
    band = 'hot'
    advice = '뜨거운 물 — 효모 사멸 위험. 르방·생이스트는 별도로 미지근한 물에 풀어 합치세요'
  }

  if (waterTempC >= 50) {
    warning = '⚠️ 50℃ 이상 — 효모 사멸 가능성 큼. 입력값(목표 반죽 온도·실내 온도·마찰열)을 다시 확인하세요'
  }
  if (waterTempC < -5) {
    warning = '⚠️ 영하 — 현실적으로 불가능. 목표 반죽 온도를 더 높게 설정하거나 실내·밀가루 온도를 낮춘 뒤 다시 계산하세요'
  }

  return {
    waterTempC,
    band,
    advice,
    expectedDoughC: input.targetDoughC,
    warning,
    friction,
  }
}

/** 계절별 물 온도 가이드 — 실내 온도 기반 */
export function seasonalWaterGuide(roomTempC: number): { season: string; advice: string } {
  if (roomTempC <= 18)      return { season: '겨울 (실내 18℃ 이하)', advice: '물 35~40℃ + 따뜻한 곳에서 발효. 목표 반죽 온도를 낮게 잡아 자연 보온' }
  if (roomTempC <= 24)      return { season: '봄·가을 (19~24℃)',     advice: '물 20~25℃ — 수돗물로 충분. 표준 발효 환경' }
  if (roomTempC <= 28)      return { season: '여름 (25~28℃)',         advice: '물 10~18℃ + 얼음 1~2개. 발효 빠름, 부피 자주 확인' }
  return                          { season: '폭염 (29℃ 이상)',         advice: '⚠️ 물 5~10℃ + 얼음 + 차가운 밀가루(냉장 보관). 냉장 발효 적극 활용' }
}

/** 권장 반죽 온도 → 1차 발효 시간 보정 배율 (실내 온도 기반과 별개로 반죽 온도 기준) */
export function doughTempMultiplier(doughTempC: number): number {
  // 25℃ 기준 — 1℃ 차이당 약 ±10% 발효 시간 변화
  const diff = doughTempC - 25
  return Math.max(0.4, Math.min(2.0, 1 - diff * 0.1))
}
