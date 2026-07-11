/* ──────────────────────────────────────────────────────
   health/glycemic-load/glData.ts
   당부하지수(Glycemic Load) 계산 + 식품별 혈당지수(GI) 조회표
   ──────────────────────────────────────────────────────
   근거·주의
   - GL = 1회 섭취 탄수화물량(g) × GI ÷ 100.  판정: 저 ≤10 / 중 11~19 / 고 ≥20.
   - GI(혈당지수)는 포도당=100 기준. 값은 시드니대 GI DB·Foster-Powell 국제표(2002)·
     농촌진흥청 자료의 대표값으로, 품종·숙성·조리·측정법에 따라 ±10 이상 달라진다(참고치).
   - 1회 섭취량·탄수화물량도 통용 근사값 — 실제 제품·조리법에 따라 다르다.
   ⚠️ 당뇨 진단·치료 대체 아님. 혈당 관리가 필요하면 의료진과 상의.
   ────────────────────────────────────────────────────── */

export type GlLevel = 'low' | 'mid' | 'high'

export interface Food {
  id: string
  name: string
  cat: string
  gi: number
  serving: string   // 1회 섭취량 표기
  carb: number      // 1회 섭취량의 탄수화물(g)
}

/** 카테고리 */
export const GL_CATS = [
  { id: 'grain', name: '밥·면·빵' },
  { id: 'fruit', name: '과일' },
  { id: 'snack', name: '당·음료·간식' },
  { id: 'dairy', name: '유제품·콩' },
] as const

export const FOODS: Food[] = [
  // 밥·면·빵
  { id: 'white-rice',  name: '흰쌀밥',        cat: 'grain', gi: 86, serving: '1공기 (210g)', carb: 66 },
  { id: 'brown-rice',  name: '현미밥',        cat: 'grain', gi: 55, serving: '1공기 (210g)', carb: 62 },
  { id: 'multi-rice',  name: '잡곡밥',        cat: 'grain', gi: 48, serving: '1공기 (210g)', carb: 60 },
  { id: 'white-bread', name: '식빵(흰빵)',    cat: 'grain', gi: 70, serving: '1장 (35g)',    carb: 15 },
  { id: 'wheat-bread', name: '통밀빵',        cat: 'grain', gi: 51, serving: '1장 (35g)',    carb: 14 },
  { id: 'ramen',       name: '라면',          cat: 'grain', gi: 49, serving: '1개 (면 120g)', carb: 70 },
  { id: 'noodle',      name: '소면·국수',     cat: 'grain', gi: 46, serving: '1인분',         carb: 55 },
  { id: 'ricecake',    name: '가래떡·떡국떡', cat: 'grain', gi: 85, serving: '1인분 (130g)',  carb: 55 },
  { id: 'potato',      name: '감자(찐)',      cat: 'grain', gi: 82, serving: '중 1개 (130g)', carb: 24 },
  { id: 'sweetpotato', name: '고구마(찐)',    cat: 'grain', gi: 55, serving: '중 1개 (130g)', carb: 31 },
  { id: 'corn',        name: '옥수수(찐)',    cat: 'grain', gi: 52, serving: '중 1개 (100g)', carb: 25 },
  { id: 'cornflakes',  name: '콘플레이크',    cat: 'grain', gi: 81, serving: '1회 (30g)',    carb: 26 },
  { id: 'oatmeal',     name: '오트밀',        cat: 'grain', gi: 55, serving: '1회 (40g)',    carb: 27 },

  // 과일
  { id: 'watermelon',  name: '수박',          cat: 'fruit', gi: 72, serving: '1쪽 (150g)',   carb: 11 },
  { id: 'banana',      name: '바나나',        cat: 'fruit', gi: 51, serving: '중 1개 (100g)', carb: 22 },
  { id: 'apple',       name: '사과',          cat: 'fruit', gi: 36, serving: '중 1개 (200g)', carb: 25 },
  { id: 'grape',       name: '포도',          cat: 'fruit', gi: 46, serving: '1송이분 (100g)', carb: 17 },
  { id: 'pear',        name: '배',            cat: 'fruit', gi: 38, serving: '1/2개 (150g)',  carb: 19 },
  { id: 'orange',      name: '오렌지',        cat: 'fruit', gi: 43, serving: '중 1개 (130g)', carb: 15 },
  { id: 'strawberry',  name: '딸기',          cat: 'fruit', gi: 40, serving: '10개 (150g)',  carb: 12 },
  { id: 'pineapple',   name: '파인애플',      cat: 'fruit', gi: 59, serving: '100g',          carb: 13 },

  // 당·음료·간식
  { id: 'sugar',       name: '설탕',          cat: 'snack', gi: 65, serving: '1큰술 (12g)',   carb: 12 },
  { id: 'honey',       name: '꿀',            cat: 'snack', gi: 55, serving: '1큰술 (21g)',   carb: 17 },
  { id: 'cola',        name: '콜라',          cat: 'snack', gi: 63, serving: '1캔 (355ml)',   carb: 39 },
  { id: 'orangejuice', name: '오렌지주스',    cat: 'snack', gi: 50, serving: '1컵 (200ml)',   carb: 21 },
  { id: 'chocolate',   name: '초콜릿',        cat: 'snack', gi: 40, serving: '1줄 (30g)',     carb: 17 },
  { id: 'icecream',    name: '아이스크림',    cat: 'snack', gi: 50, serving: '1스쿱 (50g)',   carb: 12 },
  { id: 'donut',       name: '도넛',          cat: 'snack', gi: 76, serving: '1개 (60g)',     carb: 30 },
  { id: 'chips',       name: '감자칩',        cat: 'snack', gi: 56, serving: '1봉 (60g)',     carb: 33 },

  // 유제품·콩
  { id: 'milk',        name: '우유',          cat: 'dairy', gi: 30, serving: '1컵 (200ml)',   carb: 10 },
  { id: 'yogurt',      name: '플레인 요거트', cat: 'dairy', gi: 35, serving: '100g',          carb: 8 },
  { id: 'soymilk',     name: '두유',          cat: 'dairy', gi: 34, serving: '1컵 (200ml)',   carb: 7 },
  { id: 'soybean',     name: '삶은 콩(대두)', cat: 'dairy', gi: 18, serving: '100g',          carb: 11 },
]

/** GL 계산 (1회 탄수 × 인분 × GI ÷ 100) */
export function calcGl(food: Food, servings: number): number {
  const s = Math.max(0, servings)
  return (food.carb * s * food.gi) / 100
}

export function glLevel(gl: number): GlLevel {
  if (gl <= 10) return 'low'
  if (gl < 20) return 'mid'
  return 'high'
}

export const GL_LEVEL_META: Record<GlLevel, { label: string; color: string; note: string }> = {
  low:  { label: '낮음',   color: 'var(--success)', note: '혈당을 완만하게 올리는 편' },
  mid:  { label: '보통',   color: 'var(--warning)', note: '적당량이면 무난' },
  high: { label: '높음',   color: 'var(--danger)',  note: '혈당을 빠르게 올림 — 양·조합 주의' },
}
