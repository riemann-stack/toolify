/* ──────────────────────────────────────────────────────
   lib/krElectricityRates.ts
   한전 주택용(저압) 전기요금 + 도구별 전기료 추정 단가 — 단일 소스
   사용처: life/laundry-dry · interior/dehumidifier · interior/lighting · interior/ac-capacity
   ──────────────────────────────────────────────────────

   [근거]
   · 한국전력 전기요금표 — 주택용(저압) 전력량요금, 2023-05-16 조정분. 2026년 9월 현재 적용 중(기준일 KEPCO_RATES_ASOF).
     1단계 120.0 · 2단계 214.6 · 3단계 307.3 원/kWh
     누진 구간: 기타계절 200 / 400kWh, 하계(7~8월) 300 / 450kWh
   · 기본요금·기후환경요금·연료비조정요금·부가가치세·전력산업기반기금은 별도 — 실제 kWh당 부담은 이보다 높다.
   · 출처: 한국전력 주택용 전기요금표 https://home.kepco.co.kr/kepco/front/html/CY/E/E/CYEEHP00101.html

   [갱신] 한전 요금 개편 시 KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH·구간·KEPCO_RATES_EFFECTIVE·KEPCO_RATES_ASOF를 함께 고친다.
   ────────────────────────────────────────────────────── */

/** 이 파일 수치를 마지막으로 확인한 시점 (화면 표기용) */
export const KEPCO_RATES_ASOF = '2026년 9월'
/** 현행 주택용 전력량요금 시행일 */
export const KEPCO_RATES_EFFECTIVE = '2023-05-16'
/** 한전 주택용 전기요금표 */
export const KEPCO_RATES_SOURCE_URL = 'https://home.kepco.co.kr/kepco/front/html/CY/E/E/CYEEHP00101.html'

/** 주택용(저압) 누진 단계별 전력량요금 (원/kWh) */
export const KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH = { tier1: 120.0, tier2: 214.6, tier3: 307.3 } as const

/** 누진 구간 상한 (kWh/월) — [1단계 상한, 2단계 상한], 그 초과는 3단계 */
export const KEPCO_RESIDENTIAL_LOW_TIER_LIMITS_KWH = {
  normal: [200, 400],
  summer: [300, 450],   // 7~8월
} as const

/** 주택용(저압) 누진 단계표 — 가이드 표 렌더용 */
export const KEPCO_RESIDENTIAL_LOW_TIERS: { label: string; range: string; summerRange: string; krwPerKwh: number }[] = [
  { label: '1단계', range: '200kWh 이하',   summerRange: '300kWh 이하',   krwPerKwh: KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH.tier1 },
  { label: '2단계', range: '201~400kWh',    summerRange: '301~450kWh',    krwPerKwh: KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH.tier2 },
  { label: '3단계', range: '400kWh 초과',   summerRange: '450kWh 초과',   krwPerKwh: KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH.tier3 },
]

/* ─── 전기료 단순 추정 단가 (원/kWh) ───
   법정 요율이 아니라 도구가 기본값으로 쓰는 어림값이다. 도구마다 가정이 달라 값이 셋으로 갈린다.
   하나로 맞추려면 각 도구 안내 문구와 예시 금액을 함께 바꿔야 하므로 별도로 결정한다. */

/** 1단계 전력량요금(120원)에 부가 요금 일부를 얹은 단순 가정 — interior/lighting·interior/ac-capacity 기본값 */
export const ELEC_SIMPLE_KRW_PER_KWH = 130

/** interior/dehumidifier 입력칸 기본값 — 도입 커밋(87e6fc5)에 근거 기재 없음. 1단계(120원)와 가구 평균(200원) 사이 값 */
export const ELEC_DEHUMIDIFIER_DEFAULT_KRW_PER_KWH = 160

/** 기본요금·기후환경요금·연료비조정요금·부가세·전력기반기금까지 합쳐 월 300kWh 안팎 쓰는 가구의
 *  평균 kWh당 금액(약 190~200원)을 어림한 값. 누진 단계별 전력량요금과는 다르다 — life/laundry-dry */
export const ELEC_HOUSEHOLD_AVG_KRW_PER_KWH = 200
