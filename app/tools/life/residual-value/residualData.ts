/* ──────────────────────────────────────────────────────
   life/residual-value/residualData.ts
   소비자분쟁해결기준 잔존가치·보상액 — 공산품 정액감가(월할) + 세탁물 배상비율표(일할)
   ──────────────────────────────────────────────────────
   근거 (2026-07 웹검증 — 공정거래위원회고시 제2025-14호(2025.12.18.) law.go.kr 원문,
         리서치+적대검증 워크플로가 별표Ⅱ·Ⅲ·Ⅳ 전문 대조)
   - 감가상각(별표Ⅱ 비고 원문): "정액법, 내용연수는 별표Ⅳ(월할계산) 적용,
     감가상각비=(사용연수/내용연수)×구입가, 잔여금=구입가−감가상각비" → 월할 구현.
   - 별표Ⅳ 현행: 품목별 고정 연수표가 아니라 "사업자가 품질보증서에 표시한 부품보유기간,
     짧거나 미기재 시 별표Ⅲ의 부품보유기간" (2016-15호 개정에서 부품보유기간과 통일).
     웹에 떠도는 옛 고정 연수표(TV 7년 등) 인용 금지 — 본 데이터는 별표Ⅲ 원문 수치.
   - 유형별 해결기준(별표Ⅱ 원문): 보증기간 내 수리불가 → 교환 또는 구입가 환급(감가 없음).
     보증기간 경과 후 부품보유기간 내 수리불가·수리의뢰품 분실 → 정액감가 잔여금 +
     구입가의 10% 가산 환급(한도: 구입가). 독립적인 "최소 10% 보장" 조항은 없음.
   - 세탁업(별표Ⅱ ⑯ 원문): 배상액 = 구입가 × 배상비율. 배상비율 11단계(95→10%),
     사용일수 = 구입일~세탁의뢰일(사용 여부 무관). 의복류·신발·가죽제품의 보증기간 경과
     환급 감가도 이 배상비율표를 준용. 구입가 입증 불가 시 세탁요금의 20배.
     세트: 상·하의 65/35%, 상·중·하 55/35/10%(중의 10%), 한복 치마저고리 50/50.
   - 법적 성격: 소비자기본법 제16조③ — 별도 의사표시 없는 경우의 합의·권고 기준(강제력 없음).
     다른 법령상 유리한 기준 우선·복수 기준 시 소비자 선택 (시행령 제9조).
   ────────────────────────────────────────────────────── */

/* ── Track A: 공산품 (별표Ⅲ 부품보유기간 = 실질 내용연수) ── */

export interface ProductItem {
  id: string
  label: string
  years: number
}

export const PRODUCT_ITEMS: ProductItem[] = [
  { id: 'tv', label: 'TV', years: 9 },
  { id: 'fridge', label: '냉장고', years: 9 },
  { id: 'aircon', label: '에어컨', years: 8 },
  { id: 'boiler', label: '보일러', years: 8 },
  { id: 'washer', label: '세탁기', years: 7 },
  { id: 'dryer', label: '의류건조기', years: 7 },
  { id: 'styler', label: '의류관리기', years: 7 },
  { id: 'microwave', label: '전자레인지', years: 7 },
  { id: 'purifier', label: '정수기', years: 7 },
  { id: 'dehumid', label: '제습기·가습기', years: 7 },
  { id: 'vacuum', label: '전기청소기', years: 7 },
  { id: 'ricecooker', label: '전기압력밥솥', years: 6 },
  { id: 'bidet', label: '비데', years: 6 },
  { id: 'oven', label: '전기(가스)오븐', years: 6 },
  { id: 'massage', label: '안마의자', years: 6 },
  { id: 'fan', label: '선풍기·난로', years: 5 },
  { id: 'heatmat', label: '전기장판', years: 5 },
  { id: 'camera', label: '카메라', years: 5 },
  { id: 'health', label: '헬스기구·골프채', years: 5 },
  { id: 'desktop', label: '데스크탑 PC', years: 4 },
  { id: 'laptop', label: '노트북·태블릿', years: 4 },
  { id: 'phone', label: '스마트폰', years: 4 },
  { id: 'shaver', label: '전기면도기·드라이어', years: 3 },
  { id: 'etc', label: '기타 (기본 5년)', years: 5 },
]

export type CaseType = 'residual' | 'inWarranty' | 'noParts'

export interface ProductResult {
  usedMonths: number
  lifeMonths: number
  depreciation: number
  residual: number
  bonus: number
  payout: number
  /** 내용연수 경과 여부 */
  expired: boolean
}

/** 공산품 정액감가 (월할) — 원문: 감가상각비=(사용연수/내용연수)×구입가 */
export function calcProduct(price: number, years: number, usedMonths: number, caseType: CaseType): ProductResult | null {
  if (!isFinite(price) || price <= 0 || years <= 0 || !isFinite(usedMonths) || usedMonths < 0) return null
  const lifeMonths = years * 12
  const m = Math.min(usedMonths, lifeMonths)
  const depreciation = Math.round((m / lifeMonths) * price)
  const residual = Math.max(0, price - depreciation)

  if (caseType === 'inWarranty') {
    return { usedMonths, lifeMonths, depreciation: 0, residual: price, bonus: 0, payout: price, expired: usedMonths >= lifeMonths }
  }
  const bonus = caseType === 'noParts' ? Math.round(price * 0.1) : 0
  const payout = Math.min(price, residual + bonus)
  return { usedMonths, lifeMonths, depreciation, residual, bonus, payout, expired: usedMonths >= lifeMonths }
}

/* ── Track B: 세탁물 (배상비율표 — 일할) ── */

export interface LaundryItem {
  id: string
  label: string
  years: 1 | 2 | 3 | 4 | 5 | 6
}

/** 세탁업 품목별 평균 내용연수 (고시 원문) */
export const LAUNDRY_ITEMS: LaundryItem[] = [
  { id: 'suit-winter', label: '정장 (동복·춘추복)', years: 4 },
  { id: 'suit-summer', label: '정장 (하복)', years: 3 },
  { id: 'coat', label: '코트 (오버·레인)', years: 4 },
  { id: 'jacket', label: '자켓·점퍼·바지 (동복·춘추)', years: 4 },
  { id: 'jacket-summer', label: '자켓·점퍼·바지 (하복)', years: 3 },
  { id: 'shirt', label: '셔츠·티셔츠·와이셔츠', years: 2 },
  { id: 'blouse-silk', label: '블라우스 (견)', years: 3 },
  { id: 'blouse', label: '블라우스 (기타)', years: 2 },
  { id: 'sweater', label: '스웨터·카디건', years: 3 },
  { id: 'jeans', label: '청바지 (일반)', years: 4 },
  { id: 'jeans-washed', label: '청바지 (특수워싱)', years: 3 },
  { id: 'sports', label: '스포츠웨어·수영복', years: 3 },
  { id: 'uniform-s', label: '학생복', years: 3 },
  { id: 'workwear', label: '작업복·사무복', years: 2 },
  { id: 'hanbok', label: '한복', years: 4 },
  { id: 'necktie', label: '넥타이·스카프(기타)', years: 2 },
  { id: 'underwear', label: '속옷·내복', years: 2 },
  { id: 'leather', label: '가죽 의류 (일반)', years: 5 },
  { id: 'leather-pig', label: '가죽 의류 (돈피·파충류)·인조피혁', years: 3 },
  { id: 'fur', label: '모피 (기타)', years: 3 },
  { id: 'bedding', label: '이불·요·침대커버', years: 3 },
  { id: 'curtain-w', label: '커튼 (추동)', years: 3 },
  { id: 'curtain-s', label: '커튼 (춘하)', years: 2 },
  { id: 'shoes-leather', label: '가죽구두·등산화', years: 3 },
  { id: 'sneakers', label: '운동화·고무신', years: 1 },
  { id: 'hat', label: '모자', years: 1 },
  { id: 'bag-leather', label: '가죽 가방', years: 3 },
  { id: 'bag', label: '천 가방', years: 2 },
]

/** 배상비율 11단계 (%) — 고시 원문 */
export const LAUNDRY_RATES = [95, 80, 70, 60, 50, 45, 40, 35, 30, 20, 10] as const

/**
 * 내용연수별 사용일수 구간 상한 (고시 배상비율표 원문 — 검증 에이전트 66셀 전수 대조).
 * BOUNDS[y]의 i번째 값 이하이면 LAUNDRY_RATES[i], 모두 초과하면 10%.
 */
export const LAUNDRY_BOUNDS: Record<number, number[]> = {
  1: [14, 44, 89, 134, 179, 224, 269, 314, 365, 547],
  2: [28, 88, 178, 268, 358, 448, 538, 628, 730, 1095],
  3: [43, 133, 268, 403, 538, 673, 808, 943, 1095, 1642],
  4: [57, 177, 357, 537, 717, 897, 1077, 1257, 1460, 2190],
  5: [72, 222, 447, 672, 897, 1122, 1347, 1572, 1825, 2737],
  6: [86, 266, 536, 806, 1076, 1346, 1616, 1886, 2190, 3285],
}

export function laundryRate(years: number, days: number): number {
  const bounds = LAUNDRY_BOUNDS[years]
  if (!bounds || days < 0) return 10
  for (let i = 0; i < bounds.length; i++) {
    if (days <= bounds[i]) return LAUNDRY_RATES[i]
  }
  return 10
}

export interface LaundryResult {
  days: number
  rate: number
  payout: number
}

export function calcLaundry(price: number, years: number, days: number): LaundryResult | null {
  if (!isFinite(price) || price <= 0 || !isFinite(days) || days < 0) return null
  const rate = laundryRate(years, days)
  return { days, rate, payout: Math.round(price * (rate / 100)) }
}

/** 'YYYY-MM-DD' 로컬 분해 파싱 (UTC 해석 금지) */
export function parseYmd(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return isNaN(d.getTime()) ? null : d
}

export function daysBetween(fromYmd: string, toYmd: string): number | null {
  const a = parseYmd(fromYmd)
  const b = parseYmd(toYmd)
  if (!a || !b) return null
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function monthsBetween(fromYmd: string, toYmd: string): number | null {
  const a = parseYmd(fromYmd)
  const b = parseYmd(toYmd)
  if (!a || !b) return null
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  if (b.getDate() < a.getDate()) m -= 1
  return m
}
