/* ──────────────────────────────────────────────────────
   health/glycemic-load/glData.ts
   당부하지수(Glycemic Load) 계산 + 식품별 혈당지수(GI) 조회표
   ──────────────────────────────────────────────────────
   근거·주의
   - GL = 1회 섭취 탄수화물량(g) × GI ÷ 100.  판정: 저 ≤10 / 중 11~19 / 고 ≥20.
   - GI(혈당지수)는 포도당=100 기준. 아래 값은 1차 출처의 대표값이며 주석에 출처를 표기한다.
     · 국제 2008 = Atkinson FS 등, Diabetes Care 2008;31(12):2281-2283 (Table 1·부록 Table A1)
     · 국제 2021 = Atkinson FS 등, Am J Clin Nutr 2021;114(5):1625-1632 (ISO 26642 준수 Supplemental Table 1)
     · 한국(학회지) = 김도연 등, 한국식품영양과학회지 44(1):14-23 (2015), 건강 남성 60명 인체시험
     · 한국(농진청) = 「탄수화물 다소비 식품의 당지수 관련 분석 및 평가」(농촌진흥청 발주, 2015), 건강 성인 151명
     한국에서 먹는 형태가 있는 식품은 국내 인체시험 값을 우선했다(국제표에는 한국 시험 항목이 없음).
     출처 미확인 항목은 '통용 참고치'로 표시했다 — page.tsx의 GI 조회표에는 넣지 않는다.
   - GI는 품종·숙성·조리·측정법에 따라 ±10 이상 달라진다(같은 백미도 국제표 개별값 38~93 분포).
   - 1회 섭취량·탄수화물량은 통용 근사값 — 실제 제품·조리법에 따라 다르다.
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
  { id: 'white-rice',  name: '흰쌀밥',        cat: 'grain', gi: 70, serving: '1공기 (210g)', carb: 66 },  // 한국(농진청) 쌀밥 69.9±5.7
  { id: 'brown-rice',  name: '현미밥',        cat: 'grain', gi: 88, serving: '1공기 (210g)', carb: 62 },  // 한국(농진청) 87.6±12.0 — 국제표는 65~68로 상충(page.tsx 각주 ※1)
  { id: 'barley-rice', name: '보리밥',        cat: 'grain', gi: 35, serving: '1공기 (210g)', carb: 60 },  // 한국(농진청) 35.4±9.2
  { id: 'white-bread', name: '식빵(흰빵)',    cat: 'grain', gi: 75, serving: '1장 (35g)',    carb: 15 },  // 국제 2008 Table 1 흰 식빵 75±2
  { id: 'wheat-bread', name: '통밀빵',        cat: 'grain', gi: 74, serving: '1장 (35g)',    carb: 14 },  // 국제 2008 Table 1 통밀빵 74±2
  { id: 'ramen',       name: '라면',          cat: 'grain', gi: 50, serving: '1개 (면 120g)', carb: 70 },  // 국제 2008 Table A1 인스턴트 라면 50±2
  { id: 'noodle',      name: '소면·국수',     cat: 'grain', gi: 49, serving: '1인분',         carb: 55 },  // 한국(농진청) 소면 49.0±7.0
  { id: 'ricecake',    name: '가래떡·떡국떡', cat: 'grain', gi: 51, serving: '1인분 (130g)',  carb: 55 },  // 한국(농진청) 가래떡 50.6±7.2
  { id: 'potato',      name: '감자(찐)',      cat: 'grain', gi: 94, serving: '중 1개 (130g)', carb: 24 },  // 한국(학회지) 찐감자 93.6±11.6
  { id: 'sweetpotato', name: '고구마(찐)',    cat: 'grain', gi: 71, serving: '중 1개 (130g)', carb: 31 },  // 한국(학회지) 찐고구마 70.8±6.1
  { id: 'corn',        name: '옥수수(찐)',    cat: 'grain', gi: 73, serving: '중 1개 (100g)', carb: 25 },  // 한국(학회지) 찐옥수수 73.4±9.9
  { id: 'cornflakes',  name: '콘플레이크',    cat: 'grain', gi: 81, serving: '1회 (30g)',    carb: 26 },  // 국제 2008 Table 1 콘플레이크 81±6
  { id: 'oatmeal',     name: '오트밀',        cat: 'grain', gi: 55, serving: '1회 (40g)',    carb: 27 },  // 국제 2008 Table 1 오트밀죽 55±2

  // 과일
  { id: 'watermelon',  name: '수박',          cat: 'fruit', gi: 50, serving: '1쪽 (150g)',   carb: 11 },  // 국제 2021 4종 평균 50 — 2008판은 76±4로 상충(page.tsx 각주 ※3)
  { id: 'banana',      name: '바나나',        cat: 'fruit', gi: 51, serving: '중 1개 (100g)', carb: 22 },  // 국제 2008 Table 1 생바나나 51±3 (숙성도에 따라 39~57)
  { id: 'apple',       name: '사과',          cat: 'fruit', gi: 36, serving: '중 1개 (200g)', carb: 25 },  // 국제 2008 Table 1 생사과 36±2
  { id: 'grape',       name: '포도',          cat: 'fruit', gi: 46, serving: '1송이분 (100g)', carb: 17 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'pear',        name: '배',            cat: 'fruit', gi: 38, serving: '1/2개 (150g)',  carb: 19 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'orange',      name: '오렌지',        cat: 'fruit', gi: 43, serving: '중 1개 (130g)', carb: 15 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'strawberry',  name: '딸기',          cat: 'fruit', gi: 40, serving: '10개 (150g)',  carb: 12 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'pineapple',   name: '파인애플',      cat: 'fruit', gi: 59, serving: '100g',          carb: 13 },  // 통용 참고치 — 1차 출처 미확인

  // 당·음료·간식
  { id: 'sugar',       name: '설탕',          cat: 'snack', gi: 65, serving: '1큰술 (12g)',   carb: 12 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'honey',       name: '꿀',            cat: 'snack', gi: 55, serving: '1큰술 (21g)',   carb: 17 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'cola',        name: '콜라',          cat: 'snack', gi: 53, serving: '1캔 (355ml)',   carb: 39 },  // 국제 2008 Table A1 코카콜라 53±7(호주)
  { id: 'orangejuice', name: '오렌지주스',    cat: 'snack', gi: 50, serving: '1컵 (200ml)',   carb: 21 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'chocolate',   name: '초콜릿',        cat: 'snack', gi: 43, serving: '1줄 (30g)',     carb: 17 },  // 국제 2008 Table A1 밀크초콜릿 43±3
  { id: 'icecream',    name: '아이스크림',    cat: 'snack', gi: 51, serving: '1스쿱 (50g)',   carb: 12 },  // 국제 2008 Table 1 아이스크림 51±3
  { id: 'donut',       name: '도넛',          cat: 'snack', gi: 76, serving: '1개 (60g)',     carb: 30 },  // 통용 참고치 — 1차 출처 미확인
  { id: 'chips',       name: '감자칩',        cat: 'snack', gi: 56, serving: '1봉 (60g)',     carb: 33 },  // 통용 참고치 — 1차 출처 미확인

  // 유제품·콩
  { id: 'milk',        name: '우유',          cat: 'dairy', gi: 39, serving: '1컵 (200ml)',   carb: 10 },  // 국제 2021 전지우유 39±3 (2008 Table A1은 31±4)
  { id: 'yogurt',      name: '플레인 요거트', cat: 'dairy', gi: 19, serving: '100g',          carb: 8 },   // 국제 2021 플레인(무가당) 요거트 19±6
  { id: 'soymilk',     name: '두유',          cat: 'dairy', gi: 34, serving: '1컵 (200ml)',   carb: 7 },   // 국제 2008 Table 1 두유 34±4
  { id: 'redbean',     name: '찐 팥',         cat: 'dairy', gi: 22, serving: '100g',          carb: 11 },  // 한국(학회지) 찐팥 22.1±3.2
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
