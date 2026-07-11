/* ──────────────────────────────────────────────────────
   sports/carb-loading/carbLoadingData.ts
   카보로딩(글리코겐 로딩) — 대회 전 탄수화물 섭취 플래너
   ──────────────────────────────────────────────────────
   근거
   - IOC/ACSM 스포츠영양 합의: 90분 초과 지속 경기는 대회 전 36~48시간 동안
     탄수화물 10~12 g/kg/일. 90분 이내 경기는 하루 전 7~10 g/kg 수준의 일반 충전.
   - 대회 당일 아침: 시작 1~4시간 전 1~4 g/kg (ACSM).
   - 음식 탄수화물량은 식품 영양DB 통용 근사값(개별 제품·조리법 따라 ±).
   ────────────────────────────────────────────────────── */

export interface RaceType {
  id: string
  name: string
  perKg: [number, number]   // g/kg/일
  days: number              // 로딩 일수
  desc: string
}

export const RACE_TYPES: RaceType[] = [
  {
    id: 'long', name: '풀코스·울트라 (90분 초과)',
    perKg: [10, 12], days: 2,
    desc: '마라톤 풀코스·울트라·장거리 사이클 — 대회 전 36~48시간 집중 로딩',
  },
  {
    id: 'mid', name: '하프·장시간 훈련 (60~90분)',
    perKg: [8, 10], days: 1,
    desc: '하프 마라톤·긴 지속주 — 하루 전 충전',
  },
  {
    id: 'short', name: '10km 이하 (60분 이내)',
    perKg: [7, 8], days: 1,
    desc: '10km·5km — 풀 로딩 불필요, 전날 일반 충전이면 충분',
  },
]

/** 한국 상용식품 탄수화물 근사값 (g) — 통용 근사, 제품별 상이 */
export interface FoodItem {
  name: string
  carb: number
  note?: string
}
export const FOODS: FoodItem[] = [
  { name: '밥 1공기 (210g)', carb: 65 },
  { name: '찐 고구마 (100g)', carb: 31 },
  { name: '바나나 1개 (중)', carb: 27 },
  { name: '식빵 1장 (35g)', carb: 18 },
  { name: '스포츠음료 500mL', carb: 32 },
  { name: '에너지젤 1개', carb: 25 },
]

export interface CarbPlan {
  dailyLo: number      // g/일
  dailyHi: number
  days: number
  perMealLo: number    // 3끼+간식 = 4회 분할
  perMealHi: number
  morningLo: number    // 대회 아침 1~4 g/kg
  morningHi: number
}

export function calcCarbLoading(weightKg: number, race: RaceType): CarbPlan {
  const w = Math.max(0, weightKg)
  const dailyLo = w * race.perKg[0]
  const dailyHi = w * race.perKg[1]
  return {
    dailyLo, dailyHi,
    days: race.days,
    perMealLo: dailyLo / 4,
    perMealHi: dailyHi / 4,
    morningLo: w * 1,
    morningHi: w * 4,
  }
}

/** 하루 목표(중간값)를 특정 음식만으로 채울 때 몇 개분인지 */
export function foodEquivalent(dailyMid: number, food: FoodItem): number {
  if (food.carb <= 0) return 0
  return dailyMid / food.carb
}
