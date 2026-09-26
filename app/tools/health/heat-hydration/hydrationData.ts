/* ──────────────────────────────────────────────────────
   health/heat-hydration/hydrationData.ts
   폭염 수분·전해질 섭취 가이드 — 체중 기반 기본 수분 + 활동 발한 보충
   ──────────────────────────────────────────────────────
   ⚠️ YMYL 원칙
   - 전해질(나트륨 등)은 정성 안내만 — mg 수치를 출력하지 않는다(국내 공식지침은
     '1시간 이상 지속 발한 시 이온음료' 수준의 정성 권고이며, 정량 수치는 공신 소스 없음).
   - 수분 제한이 필요한 환자(만성콩팥병·심부전·투석·이뇨제)는 계산 대신 상담 안내.
   - 폭염 특보 '단계'는 ml 계수가 아니라 발한 가정 상·하한과 행동요령·휴식주기를 바꾼다.
   근거
   - 기본 수분: 체중 × 30~33 mL — 임상에서 하루 수분 필요량을 어림할 때 쓰는 체중 비례식
     (보통 음식 수분까지 포함한 총량 기준). 이 도구는 폭염기 여유분을 두기 위해 이 값을 '마실 양
     목표'로 쓰므로 평상시 권장보다 넉넉하다. 참고: 2020 한국인 영양소 섭취기준 수분 충분섭취량
     (19~29세) 총수분 남 2.6L·여 2.1L, 그중 액체(물·음료) 남 1.2L·여 1.0L.
   - 활동 발한율: ACSM Position Stand(Exercise and Fluid Replacement, Sawka 2007) 0.5~2.0 L/h,
     체중 감소 2% 이내 목표. 흡수 상한(위 배출): 시간당 약 1.0~1.4 L → 이 도구는 1.2 L/h로 캡.
     캡을 넘는 땀 손실은 활동 중이 아니라 활동 후 줄어든 체중의 약 1.5배(1kg 감소당 물 약 1.5L,
     ACSM 2007)를 나눠 보충.
   - 하루 음용 상한: 미 육군 TB MED 507(Heat Stress Control and Heat Casualty Management) —
     하루 12qt(≈11.4L) 초과 음용 금지. 시간당 캡 × 장시간 활동이 이 값을 넘으면 목표를 상한에서 멈춘다.
   - 폭염 특보 3단계: 기상청 2026-06-01 개편(주의보 체감33℃·경보35℃·중대경보38℃).
   - 야외작업 휴식: 고용노동부 체감 33℃↑ 매 2시간 20분 휴식 등.
   ────────────────────────────────────────────────────── */

export const BASE_LOW_ML = 30   // mL/kg (마실 양 목표 하한 — 위 근거 주석 참고)
export const BASE_HIGH_ML = 33  // mL/kg (마실 양 목표 상한)
export const HOURLY_ABSORB_CAP_L = 1.2   // 시간당 권장 상한(흡수·저나트륨혈증 방지)
export const DAILY_MAX_L = 11.4  // 미 육군 TB MED 507: 하루 12qt(≈11.4L) 초과 음용 금지

/** 입력 허용 범위 — 오타(650kg·200시간 등)로 수십 리터가 표시되지 않도록 */
export const WEIGHT_MIN_KG = 20
export const WEIGHT_MAX_KG = 200
export const HOURS_MAX = 16

/** 활동 상황 — 시간당 발한율 범위(L/h) */
export interface Activity {
  id: string
  name: string
  sweat: [number, number]   // L/h
  needHours: boolean        // 활동 시간 입력 필요 여부
  desc: string
}
export const ACTIVITIES: Activity[] = [
  { id: 'indoor',   name: '실내 일상',       sweat: [0, 0],       needHours: false, desc: '냉방·그늘 위주, 땀 적음' },
  { id: 'outdoor',  name: '야외 활동·가벼운 운동', sweat: [0.4, 0.8], needHours: true, desc: '산책·가벼운 운동·외출' },
  { id: 'hard',     name: '폭염 작업·격한 운동', sweat: [1.0, 1.8], needHours: true, desc: '건설·농사·러닝·등산·구기' },
]

/** 폭염 특보 단계 (2026 개편 3단계) */
export interface HeatStage {
  id: string
  name: string
  criteria: string
  /** 활동 발한 가정 시 상한 쪽으로 밀지 여부 (경보 이상 = 상단 가정) */
  upperBias: boolean
  action: string[]
  rest?: string
}
export const HEAT_STAGES: HeatStage[] = [
  { id: 'none',   name: '평상시',        criteria: '특보 없음',
    upperBias: false, action: ['갈증 전에 규칙적으로 조금씩 음용'] },
  { id: 'warn',   name: '폭염주의보',    criteria: '체감온도 33℃ 이상 2일 지속 예상',
    upperBias: false,
    action: ['한낮(12~17시) 야외활동·작업 자제', '규칙적으로 물 섭취', '헐렁하고 밝은 옷'],
    rest: '야외작업 시 체감 33℃↑이면 매 2시간마다 20분 이상 휴식(고용노동부)' },
  { id: 'alert',  name: '폭염경보',      criteria: '체감온도 35℃ 이상 2일 지속 예상',
    upperBias: true,
    action: ['가급적 야외활동 중단', '충분한 수분·휴식', '어지럼·메스꺼움 시 즉시 시원한 곳으로'],
    rest: '야외작업 시 매시간 15분 이상 그늘 휴식 권장' },
  { id: 'severe', name: '폭염중대경보',  criteria: '체감온도 38℃ 이상(또는 기온 39℃) — 2026 신설 최고 단계',
    upperBias: true,
    action: ['외출·야외작업 최대한 중단', '냉방 공간에 머물기', '독거·고령자 안부 확인', '온열질환 의심 시 119'],
    rest: '불가피한 야외작업은 무더위 시간대 피하고 작업 단축·중단 검토' },
]

/** 수분 제한 주의가 필요한 취약 상태 (선택 시 계산 대신 상담 안내) */
export const RESTRICT_CONDITIONS = [
  '만성콩팥병(신장질환)', '심부전', '투석 중', '이뇨제 복용 중',
]

export interface HydrationResult {
  baseLo: number    // 기본 수분 하한 (L)
  baseHi: number    // 기본 수분 상한 (L)
  addLo: number     // 활동 추가 하한 (L)
  addHi: number     // 활동 추가 상한 (L)
  totalLo: number
  totalHi: number
  hourlyLo: number  // 활동 중 시간당 보충 하한 (L/h, 흡수 상한 캡)
  hourlyHi: number  // 활동 중 시간당 보충 상한 (L/h, 흡수 상한 캡)
  hourlyCapped: boolean  // 가정 발한율이 흡수 상한을 넘음 → 초과분은 활동 후 보충 안내
  dailyCapped: boolean   // 기본+활동 합계가 하루 상한(DAILY_MAX_L)을 넘어 목표를 상한에서 멈춤
  needElectrolyte: boolean  // 전해질 정성 안내 표시 여부 (1시간↑ 다량 발한)
}

export function calcHydration(
  weightKg: number,
  activity: Activity,
  hours: number,
  stage: HeatStage,
): HydrationResult {
  const w = Math.min(WEIGHT_MAX_KG, Math.max(0, weightKg))
  const baseLo = (w * BASE_LOW_ML) / 1000
  const baseHi = (w * BASE_HIGH_ML) / 1000

  const h = activity.needHours ? Math.min(HOURS_MAX, Math.max(0, hours)) : 0
  // 폭염 경보 이상이면 발한 하한을 중간값으로 올려 상단을 가정
  const [sLoBase, sHi] = activity.sweat
  const sLo = stage.upperBias && sHi > 0 ? (sLoBase + sHi) / 2 : sLoBase

  // 활동 중 음용 목표는 하한·상한 모두 흡수 상한으로 캡 (하한 > 상한 역전 방지).
  // 캡을 넘는 땀 손실은 활동 중에 다 마실 수 없으므로 일일 합계에 넣지 않고 '활동 후 보충'으로 분리 안내.
  const hourlyHi = Math.min(sHi, HOURLY_ABSORB_CAP_L)
  const hourlyLo = Math.min(sLo, hourlyHi)
  const hourlyCapped = sHi > HOURLY_ABSORB_CAP_L

  const addLo = h * hourlyLo
  const addHi = h * hourlyHi

  // 1시간 이상 + 발한 있는 활동이면 전해질 안내
  const needElectrolyte = h >= 1 && sHi > 0

  // 하루 총량 상한 — 장시간(최대 16h) × 시간당 1.2L가 과음(저나트륨혈증) 수준이 되지 않도록
  const rawHi = baseHi + addHi
  const totalHi = Math.min(rawHi, DAILY_MAX_L)
  const totalLo = Math.min(baseLo + addLo, totalHi)
  const dailyCapped = rawHi > DAILY_MAX_L

  return {
    baseLo, baseHi, addLo, addHi,
    totalLo, totalHi,
    hourlyLo, hourlyHi, hourlyCapped, dailyCapped,
    needElectrolyte,
  }
}

/* ── 실측 발한율 (운동 전후 체중) ── */
/** 측정 운동 시간 허용 범위(시간) */
export const MEASURE_HOURS_MIN = 0.25
export const MEASURE_HOURS_MAX = 6

/**
 * 발한율(L/h) = (운동 전 − 운동 후 체중(kg) + 마신 물(L)) ÷ 운동 시간(h).  체중 1kg ≈ 수분 1L.
 * 체중이 허용 범위 밖이거나, 시간이 측정 범위 밖이거나, 손실이 0 이하면 null.
 */
export function calcSweatRate(
  beforeKg: number, afterKg: number, drankL: number, hours: number,
): { rate: number; total: number } | null {
  if (!Number.isFinite(beforeKg) || !Number.isFinite(afterKg) || !Number.isFinite(hours)) return null
  const inW = (v: number) => v >= WEIGHT_MIN_KG && v <= WEIGHT_MAX_KG
  if (!inW(beforeKg) || !inW(afterKg)) return null
  if (hours < MEASURE_HOURS_MIN || hours > MEASURE_HOURS_MAX) return null
  const d = Number.isFinite(drankL) ? Math.max(0, drankL) : 0
  const total = beforeKg - afterKg + d
  if (total <= 0) return null
  return { rate: total / hours, total }
}
