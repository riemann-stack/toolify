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
   - 기본 수분(음료): 체중 × 30~33 mL — 국내 임상영양 관행 범위(총수분은 음식 수분 별도).
   - 활동 발한율: ACSM Position Stand(Exercise and Fluid Replacement, Sawka 2007) 0.5~2.0 L/h,
     체중 감소 2% 이내 목표. 흡수 상한(위 배출): 시간당 약 1.0~1.4 L.
   - 폭염 특보 3단계: 기상청 2026-06-01 개편(주의보 체감33℃·경보35℃·중대경보38℃).
   - 야외작업 휴식: 고용노동부 체감 33℃↑ 매 2시간 20분 휴식 등.
   ────────────────────────────────────────────────────── */

export const BASE_LOW_ML = 30   // mL/kg (음료 기준 하한)
export const BASE_HIGH_ML = 33  // mL/kg (음료 기준 상한)
export const HOURLY_ABSORB_CAP_L = 1.2   // 시간당 권장 상한(흡수·저나트륨혈증 방지)

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
  hourlyLo: number  // 활동 중 시간당 보충 하한 (L/h)
  hourlyHi: number  // 활동 중 시간당 보충 상한 (L/h, 흡수 상한 캡)
  hourlyCapped: boolean
  needElectrolyte: boolean  // 전해질 정성 안내 표시 여부 (1시간↑ 다량 발한)
}

export function calcHydration(
  weightKg: number,
  activity: Activity,
  hours: number,
  stage: HeatStage,
): HydrationResult {
  const w = Math.max(0, weightKg)
  const baseLo = (w * BASE_LOW_ML) / 1000
  const baseHi = (w * BASE_HIGH_ML) / 1000

  const h = activity.needHours ? Math.max(0, hours) : 0
  // 폭염 경보 이상이면 발한 하한을 중간값으로 올려 상단을 가정
  const [sLoBase, sHi] = activity.sweat
  const sLo = stage.upperBias && sHi > 0 ? (sLoBase + sHi) / 2 : sLoBase

  const addLo = h * sLo
  const addHi = h * sHi

  const hourlyLo = sLo
  const hourlyHiRaw = sHi
  const hourlyHi = Math.min(hourlyHiRaw, HOURLY_ABSORB_CAP_L)
  const hourlyCapped = hourlyHiRaw > HOURLY_ABSORB_CAP_L

  // 1시간 이상 + 발한 있는 활동이면 전해질 안내
  const needElectrolyte = h >= 1 && sHi > 0

  return {
    baseLo, baseHi, addLo, addHi,
    totalLo: baseLo + addLo,
    totalHi: baseHi + addHi,
    hourlyLo, hourlyHi, hourlyCapped,
    needElectrolyte,
  }
}
