/* ──────────────────────────────────────────────────────
   lib/krAcquisitionTax.ts
   부동산 유상취득(매매·경매) 취득세 + 지방교육세 + 농어촌특별세 — 단일 소스 (2026년 시행 법령 기준)
   사용처: finance/real-estate · finance/auction
   ──────────────────────────────────────────────────────

   [법적 근거]
   1) 취득세 — 지방세법
      · §11①8호 주택 유상거래 표준세율 (2020.8.12 개정 이후 동일)
          가. 취득당시가액 6억원 이하 ............ 1%
          나. 6억원 초과 9억원 이하 .............. (취득당시가액 × 2/3억원 − 3) × 1/100
              "소수점 이하 다섯째자리에서 반올림하여 소수점 넷째자리까지 계산" (예: 7억 → 0.0167 = 1.67%)
          다. 9억원 초과 ........................ 3%
      · §13의2 주택 취득 중과
          ①1호 법인 ................................................ 12%
          ①2호 조정대상지역 1세대 2주택 / 비조정 1세대 3주택 ........... 8%
               (조정 2주택 중 '일시적 2주택' — 종전 주택을 기한 내 처분 — 은 표준세율, §13의3·시행령 §28의5)
          ①3호 조정대상지역 1세대 3주택 이상 / 비조정 4주택 이상 ....... 12%
          · 시행령 §28의2 1호: 시가표준액(공시가격) 1억원 이하 주택은 중과 제외 → 표준세율
            (단, 도시정비법상 정비구역·소규모주택정비 사업구역 주택은 제외 대상 아님 — 이 lib는 판단하지 않음)
            ※ [확인 필요] 2025년 이후 비수도권은 공시가격 2억원 이하로 확대됐다는 안내가 있음(auction FAQ).
              법령 원문을 이번에 재확인하지 못해 lib는 가격 기준을 박제하지 않고 lowValueHouse 플래그로 호출부·사용자가 판단.
      · 주택 외 유상취득(상가·오피스텔·토지 등) §11①7호 나목 ...... 4%
   2) 지방교육세 — 지방세법 §151①1호
      · 주택 유상거래(§11①8호): 취득세율 × 1/2 × 20% (= 취득세율의 10%: 1% → 0.1%, 1.67% → 0.167%, 3% → 0.3%)
      · 중과(§13의2)·주택 외 4%: (표준세율 4% − 2%) × 20% = 0.4%
   3) 농어촌특별세 — 농어촌특별세법 §5①6호(취득세 2% 기준 산출세액의 10%), §4 11호(국민주택규모 이하 주택 비과세)
      · 전용 85㎡ 이하 주택: 비과세
      · 85㎡ 초과 주택 표준세율: 0.2% / 8% 중과: 0.6% / 12% 중과: 1.0%  (= (취득세율 − 2%) × 10%, 표준은 2% × 10%)
      · 주택 외 4%: 0.2%
   4) 세액 끝수: 각 세목 10원 미만 절사 (지방회계법·국고금 관리법의 끝수 계산 준용)

   [위택스 대조 예시 — 1주택, 전용 85㎡ 이하]
      6억   → 취득세 6,000,000 + 교육세 600,000 = 6,600,000 (1.1%)
      7억   → 1.67% 11,690,000 + 0.167% 1,169,000 = 12,859,000
      7.5억 → 2%   15,000,000 + 0.2%   1,500,000 = 16,500,000
      9억   → 3%   27,000,000 + 0.3%   2,700,000 = 29,700,000
   [중과 예시 — 12억, 85㎡ 초과]  8%: 96,000,000 + 4,800,000 + 7,200,000 = 108,000,000 (9.0%)
                                 12%: 144,000,000 + 4,800,000 + 12,000,000 = 160,800,000 (13.4%)

   [가정·한계 — 계산하지 않는 것]
   · 주택 수는 '이번 취득 후 1세대 보유 주택 수'를 사용자가 입력(분양권·입주권·주거용 오피스텔 포함 여부 판단은 사용자 몫).
     시가표준액 1억 이하 주택·일부 공시가격 기준 제외 주택의 주택 수 제외 규정은 반영하지 않음.
   · 일시적 2주택 해당 여부(처분기한 3년 등)는 사용자가 선택. 사후 미처분 시 중과세 추징은 반영하지 않음.
   · 생애최초(지특법 §36의3, 200만원 한도)·신혼·출산 등 감면, 무상취득(증여 3.5%·조정 12%)·원시취득·상속은 미반영.
   · 국민주택규모(85㎡)는 수도권·도시지역 기준. 수도권 외 읍·면 지역은 100㎡ 기준이 적용될 수 있음.
   · 농지(3%)·법인의 사치성재산·과밀억제권역 중과는 미반영. 조정대상지역 여부는 취득일(계약일 특례 포함) 기준으로 사용자가 판단.
   ────────────────────────────────────────────────────── */

/** 비율 단위: ppm (100만분율). 1% = 10,000ppm — 부동소수 오차 없이 정수 곱셈으로 세액 산출 */
const PPM_PER_PCT = 10_000

export type AcqTaxCategory =
  | 'standard'      // 주택 표준세율 (1~3%)
  | 'surcharge8'    // 중과 8%
  | 'surcharge12'   // 중과 12%
  | 'nonHouse'      // 주택 외 4%

export interface HouseAcqInput {
  /** 취득가액(원) — 매매가·낙찰가 */
  price: number
  /** 이번 취득 후 1세대 보유 주택 수 (1, 2, 3, 4 이상은 4로 취급). 법인이면 무시 */
  homeCount: number
  /** 취득 주택이 조정대상지역에 있는가 (투기과열지구는 조정대상지역으로 함께 지정되므로 true) */
  adjusted: boolean
  /** 전용면적 85㎡ 초과 (농어촌특별세 과세) */
  over85: boolean
  /** 조정대상지역 2주택 중 일시적 2주택 (종전 주택 처분기한 내 처분 예정) → 표준세율 */
  temporaryTwoHomes?: boolean
  /** 법인 취득 → 12% */
  corporate?: boolean
  /** 중과 제외 저가주택 — 시가표준액(공시가격) 1억원 이하(정비구역 외). 비수도권 2억 확대 여부는 호출부 판단 */
  lowValueHouse?: boolean
}

export interface AcqTaxBreakdown {
  price: number
  category: AcqTaxCategory
  /** 사람이 읽는 적용 근거 (예: '조정대상지역 2주택 중과 8%') */
  label: string
  /** 세율 (%) — 표시용. 계산은 내부 ppm 정수로 수행 */
  acquisitionRate: number
  educationRate: number
  ruralRate: number
  totalRate: number
  /** 세액 (원, 10원 미만 절사) */
  acquisitionTax: number
  educationTax: number
  ruralTax: number
  total: number
}

/** price × ppm / 1,000,000 을 정수 연산으로 (원 미만 버림) — price는 원 단위로 내림 후 계산 */
function mulPpm(price: number, ppm: number): number {
  const p = Math.floor(Math.max(0, price))
  const q = Math.floor(p / 1_000_000)
  const r = p - q * 1_000_000
  return q * ppm + Math.floor((r * ppm) / 1_000_000)
}

/** 10원 미만 절사 */
const floor10 = (won: number) => Math.floor(won / 10) * 10

/** 1주택 표준세율(ppm) — 지방세법 §11①8호. 6~9억은 소수점 이하 다섯째자리 반올림(=0.01%p 단위) */
/** 주택 수 정규화 — NaN·음수·소수 입력은 1주택으로 (잘못된 localStorage 값이 조용히 표준세율이 되지 않도록) */
function normHomeCount(v: number): number {
  return Number.isFinite(v) ? Math.max(1, Math.floor(v)) : 1
}

export function standardHouseRatePpm(price: number): number {
  if (price <= 600_000_000) return 10_000          // 1%
  if (price > 900_000_000) return 30_000           // 3%
  // (가액 × 2/3억 − 3) / 100 을 소수 넷째자리까지 → 1e4배 한 값 = (2·가액 − 9억) / 300만, 반올림(half-up)
  const tenThousandths = Math.floor((2 * price - 900_000_000) / 3_000_000 + 0.5)
  return tenThousandths * 100                      // 1/10000 → ppm
}

function build(
  price: number, category: AcqTaxCategory, label: string,
  acqPpm: number, eduPpm: number, ruralPpm: number,
): AcqTaxBreakdown {
  const acquisitionTax = floor10(mulPpm(price, acqPpm))
  const educationTax = floor10(mulPpm(price, eduPpm))
  const ruralTax = floor10(mulPpm(price, ruralPpm))
  const pct = (ppm: number) => ppm / PPM_PER_PCT
  return {
    price: Math.max(0, price),
    category, label,
    acquisitionRate: pct(acqPpm),
    educationRate: pct(eduPpm),
    ruralRate: pct(ruralPpm),
    totalRate: pct(acqPpm + eduPpm + ruralPpm),
    acquisitionTax, educationTax, ruralTax,
    total: acquisitionTax + educationTax + ruralTax,
  }
}

/** 중과 여부·세율 판정 (표준이면 null) */
function surchargeRatePct(input: HouseAcqInput): { pct: 8 | 12; label: string } | null {
  if (input.lowValueHouse) return null
  if (input.corporate) return { pct: 12, label: '법인 취득 중과 12%' }
  const n = normHomeCount(input.homeCount)
  if (input.adjusted) {
    if (n >= 3) return { pct: 12, label: `조정대상지역 ${n >= 4 ? '4주택 이상' : '3주택'} 중과 12%` }
    if (n === 2 && !input.temporaryTwoHomes) return { pct: 8, label: '조정대상지역 2주택 중과 8%' }
    return null
  }
  if (n >= 4) return { pct: 12, label: '비조정지역 4주택 이상 중과 12%' }
  if (n === 3) return { pct: 8, label: '비조정지역 3주택 중과 8%' }
  return null
}

/** 주택 유상취득 취득세·지방교육세·농어촌특별세 */
export function calcHouseAcquisitionTax(input: HouseAcqInput): AcqTaxBreakdown {
  const price = Number.isFinite(input.price) ? Math.max(0, input.price) : 0
  const sur = surchargeRatePct(input)

  if (sur) {
    const acqPpm = sur.pct * PPM_PER_PCT
    const eduPpm = 4_000                                            // 0.4%
    const ruralPpm = input.over85 ? (sur.pct - 2) * 1_000 : 0       // 8% → 0.6%, 12% → 1.0%
    return build(price, sur.pct === 8 ? 'surcharge8' : 'surcharge12', sur.label, acqPpm, eduPpm, ruralPpm)
  }

  const acqPpm = standardHouseRatePpm(price)
  const eduPpm = acqPpm / 10                                        // 취득세율 × 1/2 × 20%
  const ruralPpm = input.over85 ? 2_000 : 0                         // 0.2%
  const n = normHomeCount(input.homeCount)
  const why = input.lowValueHouse
    ? '시가표준액 1억 이하 — 중과 제외, 표준세율'
    : input.corporate
      ? '표준세율'
      : n === 2 && input.adjusted && input.temporaryTwoHomes
        ? '일시적 2주택 — 표준세율'
        : n === 1 ? '1주택 표준세율' : `${input.adjusted ? '조정' : '비조정'} ${n}주택 — 표준세율`
  return build(price, 'standard', why, acqPpm, eduPpm, ruralPpm)
}

/** 주택 외(상가·오피스텔·토지 등, 농지 제외) 유상취득 — 4% + 교육세 0.4% + 농특세 0.2% = 4.6% */
export function calcNonHouseAcquisitionTax(price: number): AcqTaxBreakdown {
  const p = Number.isFinite(price) ? Math.max(0, price) : 0
  return build(p, 'nonHouse', '주택 외 유상취득 4%', 40_000, 4_000, 2_000)
}
