/* ──────────────────────────────────────────────────────
   lib/krAcquisitionTax.ts
   부동산 유상취득(매매·경매)·무상취득(증여)·상속·원시취득(신축) 취득세 + 지방교육세 + 농어촌특별세
   + 생애최초 주택 감면 — 단일 소스 (2026년 시행 법령 기준)
   사용처: finance/real-estate · finance/auction (유상) · finance/inheritance (무상취득) · finance/acquisition-tax (전체)
   기준일: 2026-09 · 출처: 국가법령정보센터 지방세법·같은 법 시행령, 행정안전부·정책브리핑 보도자료
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
               (조정 2주택 중 '일시적 2주택' — 종전 주택을 기한 내 처분 — 은 표준세율, §13의2①2호 괄호·시행령 §28의5)
          ①3호 조정대상지역 1세대 3주택 이상 / 비조정 4주택 이상 ....... 12%
          · 시행령 §28의2 1호: 시가표준액(공시가격) 1억원 이하 주택은 중과 제외 → 표준세율
            (단, 도시정비법상 정비구역·소규모주택정비 사업구역 주택은 제외 대상 아님 — 이 lib는 판단하지 않음)
            2025.1.2 이후 취득분부터 비수도권(서울·경기·인천 외) 주택은 기준이 시가표준액 2억원 이하로 완화
            (정책브리핑 2025 「지방 저가주택 취득세 중과 기준 완화…1억 원 → 2억 원으로」 newsId=148942191,
             https://www.korea.kr/news/policyNewsView.do?newsId=148942191 · 행정안전부 보도자료
             「지방 저가주택 취득세 중과 기준 완화」 https://www.mois.go.kr/frt/bbs/type010/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000008&nttId=117228).
            '지방' = 수도권정비계획법상 수도권(서울·경기·인천) 외 (2026-09 재확인: 정책브리핑·행안부 보도자료 검색 결과).
            lib는 소재지·공시가격을 받지 않으므로 해당 여부는 lowValueHouse 플래그로 호출부·사용자가 판단.
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
     시가표준액 1억 이하 주택·비수도권 2억 이하 주택(2025.1.2 이후 취득) 등의 주택 수 제외 규정은 반영하지 않음.
   · 일시적 2주택 해당 여부(처분기한 3년 등)는 사용자가 선택. 사후 미처분 시 중과세 추징은 반영하지 않음.
     2026.8.26 개편안의 처분기한 단축(ACQ_REFORM_PROPOSAL_2026)은 안내 문구에만 쓰고 계산에는 넣지 않음 — 2026-10-01 재확인.
   · 신혼·출산(지특법 §36의5) 등 생애최초 외 감면은 미반영.
     주택 무상취득(증여 3.5%·조정 12%)은 '무상취득' 섹션, 상속·원시취득·주택 외 증여·농지와
     생애최초 감면(지특법 §36의3)은 파일 끝 '취득 원인별 확장' 섹션 (2026-09 추가, 기존 export 동작 불변).
   · 국민주택규모(85㎡)는 수도권·도시지역 기준. 수도권 외 읍·면 지역은 100㎡ 기준이 적용될 수 있음.
   · 법인의 사치성재산(고급주택 등 §13⑤)·과밀억제권역(§13①②) 중과는 미반영(농지 3%는 확장 섹션). 조정대상지역 여부는 취득일(계약일 특례 포함) 기준으로 사용자가 판단.
   ────────────────────────────────────────────────────── */

/** 비율 단위: ppm (100만분율). 1% = 10,000ppm — 부동소수 오차 없이 정수 곱셈으로 세액 산출 */
const PPM_PER_PCT = 10_000

export type AcqTaxCategory =
  | 'standard'      // 주택 표준세율 (1~3%)
  | 'surcharge8'    // 중과 8%
  | 'surcharge12'   // 중과 12%
  | 'nonHouse'      // 주택 외 4%
  | 'gift'          // 주택 무상취득(증여) 3.5%
  | 'giftHeavy'     // 주택 무상취득 조정대상지역 중과 12%
  | 'farmland'      // 농지 유상취득 3%
  | 'giftNonHouse'  // 주택 외(농지 포함) 무상취득 3.5%
  | 'inherit'       // 상속 (농지 외) 2.8%
  | 'inheritFarmland' // 농지 상속 2.3%
  | 'inheritOneHouse' // 무주택 1가구 1주택 상속 특례 0.8%
  | 'original'      // 원시취득(신축) 2.8%

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
  /** 중과 제외 저가주택 — 시가표준액(공시가격) 1억원 이하(비수도권은 2025.1.2 이후 취득분 2억원 이하, 정비구역 외).
   *  소재지·공시가격 판단은 호출부(사용자 체크) 몫 */
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

/** 주택 수 정규화 — NaN·음수·소수 입력은 1주택으로 (잘못된 localStorage 값이 조용히 표준세율이 되지 않도록) */
function normHomeCount(v: number): number {
  return Number.isFinite(v) ? Math.max(1, Math.floor(v)) : 1
}

/** 주택 유상거래 표준세율 구간 — 지방세법 §11①8호 (가액은 원, 세율은 %) */
export const HOUSE_STANDARD_BRACKETS = {
  /** 이하 1% */
  low: 600_000_000,
  /** 초과 3% (사이 구간은 (가액 × 2/3억 − 3)%) */
  high: 900_000_000,
  lowPct: 1,
  highPct: 3,
} as const

/** 1주택 표준세율(ppm) — 지방세법 §11①8호. 6~9억은 소수점 이하 다섯째자리 반올림(=0.01%p 단위) */
export function standardHouseRatePpm(price: number): number {
  const B = HOUSE_STANDARD_BRACKETS
  if (price <= B.low) return B.lowPct * PPM_PER_PCT          // 1%
  if (price > B.high) return B.highPct * PPM_PER_PCT         // 3%
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
    ? '시가표준액 1억(비수도권 2억) 이하 — 중과 제외, 표준세율'
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

/* ─── 주택 무상취득(증여) ───
   1) 취득세 — 지방세법 §12①2호 무상취득 3.5% (비영리사업자 2.8%는 미반영)
      §13의2② · 시행령 §28의6: 조정대상지역 안 시가표준액 3억원 이상 주택 무상취득 → 12% 중과
        단, 1세대 1주택자가 배우자·직계존비속에게 증여하면 중과 제외.
        수증자의 주택 수는 요건이 아니며, 비조정지역 무상취득에는 8% 구간이 없다.
   2) 지방교육세 §151①1호: (3.5% − 2%) × 20% = 0.3% / 중과 (표준세율 4% − 2%) × 20% = 0.4%
   3) 농어촌특별세 (전용 85㎡ 초과만): 2% × 10% = 0.2% / 중과 (12% − 2%) × 10% = 1.0%
      → 합계: 3.5% 기준 4.0%(85㎡ 이하 3.8%), 12% 중과 13.4%(85㎡ 이하 12.4%)
   ※ 과세표준은 2023년부터 시가인정액(매매사례가액 등) — 평가는 호출부 입력값을 그대로 쓴다. */
const GIFT_PPM = {
  acq: 35_000, acqHeavy: 120_000,     // 3.5% / 12%
  edu: 3_000, eduHeavy: 4_000,        // 0.3% / 0.4%
  rural: 2_000, ruralHeavy: 10_000,   // 0.2% / 1.0% (85㎡ 초과만)
} as const

/** 주택 무상취득 취득세율 (소수) — 3.5% */
export const GIFT_HOUSE_ACQ_RATE = GIFT_PPM.acq / 1_000_000
/** 조정대상지역 시가표준액 3억원 이상 주택 무상취득 중과세율 (소수) — 12% */
export const GIFT_HOUSE_ACQ_RATE_HEAVY = GIFT_PPM.acqHeavy / 1_000_000
/** 무상취득 중과 대상 시가표준액 하한 (원, 이상) */
export const GIFT_HOUSE_HEAVY_MIN_STD_VALUE = 300_000_000

export interface GiftHouseAcqInput {
  /** 조정대상지역 소재 */
  adjusted: boolean
  /** 시가표준액(공시가격) 3억원 이상 */
  stdValueOver3eok: boolean
  /** 1세대 1주택자가 배우자·직계존비속에게 증여 → 중과 제외 */
  familyExempt: boolean
}

/** 무상취득 12% 중과 여부 */
export function isGiftHouseHeavy(input: GiftHouseAcqInput): boolean {
  return input.adjusted && input.stdValueOver3eok && !input.familyExempt
}

/** 주택 무상취득 취득세율 (소수, 본세만) — 0.035 또는 0.12 */
export function giftHouseAcquisitionRate(input: GiftHouseAcqInput): number {
  return isGiftHouseHeavy(input) ? GIFT_HOUSE_ACQ_RATE_HEAVY : GIFT_HOUSE_ACQ_RATE
}

/** 주택 무상취득(증여) 취득세·지방교육세·농어촌특별세 (세목별 10원 미만 절사) */
export function calcGiftHouseAcquisitionTax(input: GiftHouseAcqInput & {
  /** 과세표준(원) — 시가인정액 */
  value: number
  /** 전용면적 85㎡ 초과 (농어촌특별세 과세) */
  over85: boolean
}): AcqTaxBreakdown {
  const value = Number.isFinite(input.value) ? Math.max(0, input.value) : 0
  if (isGiftHouseHeavy(input)) {
    return build(value, 'giftHeavy', '조정대상지역 시가표준액 3억 이상 무상취득 중과 12%',
      GIFT_PPM.acqHeavy, GIFT_PPM.eduHeavy, input.over85 ? GIFT_PPM.ruralHeavy : 0)
  }
  return build(value, 'gift', '주택 무상취득(증여) 3.5%',
    GIFT_PPM.acq, GIFT_PPM.edu, input.over85 ? GIFT_PPM.rural : 0)
}

/* ═══════════════════════════════════════════════════════
   취득 원인별 확장 — 상속 · 원시취득(신축) · 주택 외 증여 · 농지 유상 + 생애최초 감면 (2026-09 추가)
   위 export(유상 주택·주택 외·주택 증여)의 동작은 바꾸지 않는다.
   ═══════════════════════════════════════════════════════
   1) 취득세 표준세율 — 지방세법 §11①
      1호 상속: 가. 농지 2.3% · 나. 농지 외 2.8%
      2호 상속 외 무상취득(증여): 3.5% (비영리사업자 2.8%는 미반영)
      3호 원시취득(신축 등): 2.8%
      7호 그 밖의 유상취득: 가. 농지 3% · 나. 농지 외 4% (나목 = calcNonHouseAcquisitionTax)
      §15①2호 가목 세율의 특례: 무주택 1가구가 상속으로 취득하는 1가구 1주택 → 표준세율 − 중과기준세율(2%) = 0.8%
      · 상속·원시취득에는 §13의2 주택 중과(유상거래·조정대상지역 무상취득만 대상)가 없다.
        법인의 과밀억제권역 안 신·증축(§13) 등 다른 중과는 미반영.
   2) 과세표준 — 유상: 사실상 취득가격(§10의3) · 원시: 사실상 취득가격(§10의4)
      증여: 시가인정액(§10의2①) · 상속: 시가표준액(§10의2②1호). 이 lib는 입력값을 그대로 과세표준으로 쓴다.
   3) 지방교육세 — §151①1호: (표준세율 − 2%) × 20% → 2.8%: 0.16% · 2.3%: 0.06% · 3%: 0.2% · 3.5%: 0.3%
      §15① 세율 특례 적용분: 특례로 계산한 취득세액 × 20% → 0.8% × 20% = 0.16%
   4) 농어촌특별세 — 농특세법 §5①6호: 표준세율을 2%로 적용해 산출한 취득세액 × 10% = 과세표준 × 0.2%
      · 국민주택규모(전용 85㎡) 이하 주택은 비과세(§4 11호) — 상속·원시취득 주택도 같다
      · 무주택 상속 1주택 특례: 특례 산식(표준세율 − 2%)에 2%를 넣으면 0 → 농특세 없음 (합계 0.96% 안내와 일치)
   [합계] 상속 주택 2.96%(85㎡ 초과 3.16%) · 상속 주택 외 3.16% · 농지 상속 2.56% · 무주택 상속 1주택 0.96%
          원시 주택 2.96%(초과 3.16%) · 원시 주택 외 3.16% · 주택 외 증여 4.0% · 농지 매매 3.4%
   ─────────────────────────────────────────────────────── */

/** 중과기준세율 2% (지방세법 §6 19호) — 지방교육세·농특세·세율 특례 산식의 기준 */
const MID_STANDARD_PPM = 20_000
/** 지방교육세 = (표준세율 − 2%) × 20% (지방세법 §151①1호) */
const EDU_SHARE_PCT = 20
/** 농특세 = 과세표준 × 2% × 10% (농특세법 §5①6호) */
const RURAL_BASE_PPM = 2_000

/** 지방세법 §11① 표준세율 (ppm) — 확장 원인별 */
const EXT_RATE_PPM = {
  inherit: 28_000,          // 1호 나목
  inheritFarmland: 23_000,  // 1호 가목
  gift: GIFT_PPM.acq,       // 2호 3.5%
  original: 28_000,         // 3호
  farmlandPurchase: 30_000, // 7호 가목
} as const

const eduPpmOf = (standardPpm: number) => ((standardPpm - MID_STANDARD_PPM) * EDU_SHARE_PCT) / 100
const safeValue = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0)

/** 표시용 표준세율 (%) — 페이지 본문 보간용 */
export const ACQ_RATE_PCT = {
  midStandard: MID_STANDARD_PPM / PPM_PER_PCT,                 // 2
  nonHouse: 4,                                                 // §11①7호 나목 (calcNonHouseAcquisitionTax)
  farmlandPurchase: EXT_RATE_PPM.farmlandPurchase / PPM_PER_PCT, // 3
  gift: EXT_RATE_PPM.gift / PPM_PER_PCT,                       // 3.5
  giftHeavy: GIFT_PPM.acqHeavy / PPM_PER_PCT,                  // 12
  inherit: EXT_RATE_PPM.inherit / PPM_PER_PCT,                 // 2.8
  inheritFarmland: EXT_RATE_PPM.inheritFarmland / PPM_PER_PCT, // 2.3
  inheritOneHouse: (EXT_RATE_PPM.inherit - MID_STANDARD_PPM) / PPM_PER_PCT, // 0.8
  original: EXT_RATE_PPM.original / PPM_PER_PCT,               // 2.8
  eduSharePct: EDU_SHARE_PCT,                                  // 20
  ruralBase: RURAL_BASE_PPM / PPM_PER_PCT,                     // 0.2
} as const

/** 국민주택규모(㎡) — 농특세 비과세 기준 (수도권·도시지역. 수도권 외 읍·면은 100㎡) */
export const NATIONAL_HOUSING_AREA_M2 = 85

/** 중과 제외 저가주택 — 시가표준액(공시가격) 이하 (지방세법 시행령 §28의2 1호). 비수도권 2억은 2025.1.2 이후 취득분 */
export const LOW_VALUE_HOUSE_MAX_STD_VALUE = { capital: 100_000_000, nonCapital: 200_000_000 } as const

/** 일시적 2주택 종전 주택 처분기한 (년) — 지방세법 시행령 §28의5 (2026-09 현행) */
export const TEMP_TWO_HOMES_DISPOSAL_YEARS = 3

/** 2026.8.26 행정안전부 「2026년 지방세제 개편안」 중 이 계산기와 관련된 '안' — 시행 전이라 계산에는 쓰지 않고 안내 문구에만 쓴다.
 *  · 일시적 2주택 처분기한 단축: 시행령(§28의5) 사항이라 국회 의결 없이 시행될 수 있다. 2026-10-01 이후 공포·시행 여부를 재확인하고,
 *    시행되면 TEMP_TWO_HOMES_DISPOSAL_YEARS를 취득일·종전 주택 소재지를 받는 헬퍼로 바꾼다.
 *  · 생애최초 청년 한도·주거용 오피스텔 포함: 지특법(법률) 사항 — 국회 심의 후 반영.
 *  출처: 2026-08-26 개편안 발표 보도(khan.co.kr·seoul.co.kr·hankyung.com·taxtimes.co.kr 기사 276546). 시행 여부 미확인(2026-09 기준). */
export const ACQ_REFORM_PROPOSAL_2026 = {
  announced: '2026-08-26',
  /** 종전 주택이 조정대상지역이면 처분기한을 이 연수로 단축 (안) */
  tempTwoHomesYears: 2,
  /** 단축 적용 예정 — 이날 이후 신규 취득분 (안) */
  tempTwoHomesFrom: '2026-10-01',
  /** 생애최초 감면 청년 한도 (원, 안) · 연령 기준 (만 나이 미만) */
  firstHomeYouthCap: 3_000_000,
  firstHomeYouthUnderAge: 40,
} as const

/** 신고·납부 기한 — 지방세법 §20① */
export const ACQ_FILING_DEADLINE = {
  purchaseDays: 60,         // 유상·원시: 취득일부터 60일
  giftMonths: 3,            // 무상(상속 외): 취득일이 속하는 달의 말일부터 3개월
  inheritMonths: 6,         // 상속: 상속개시일이 속하는 달의 말일부터 6개월
  inheritAbroadMonths: 9,   // 외국에 주소를 둔 상속인이 있으면 9개월
} as const

export type AcqCause = 'purchase' | 'gift' | 'inherit' | 'original'
export type AcqProperty = 'house' | 'nonHouse' | 'farmland'

/** 상속 취득세 — 주택·주택 외 2.8%, 농지 2.3%, 무주택 1가구 1주택 특례 0.8% (과세표준 = 시가표준액) */
export function calcInheritAcquisitionTax(input: {
  value: number
  property: AcqProperty
  /** 전용 85㎡ 초과 주택 (농특세 과세) */
  over85?: boolean
  /** 무주택 1가구가 상속받는 1가구 1주택 — 지방세법 §15①2호 가목 */
  homelessOneHouse?: boolean
}): AcqTaxBreakdown {
  const v = safeValue(input.value)
  if (input.property === 'house' && input.homelessOneHouse) {
    const acq = EXT_RATE_PPM.inherit - MID_STANDARD_PPM
    return build(v, 'inheritOneHouse', '무주택 1가구 1주택 상속 특례 0.8%', acq, (acq * EDU_SHARE_PCT) / 100, 0)
  }
  if (input.property === 'farmland') {
    const acq = EXT_RATE_PPM.inheritFarmland
    return build(v, 'inheritFarmland', '농지 상속 2.3%', acq, eduPpmOf(acq), RURAL_BASE_PPM)
  }
  const acq = EXT_RATE_PPM.inherit
  const rural = input.property === 'house' && !input.over85 ? 0 : RURAL_BASE_PPM
  return build(v, 'inherit', input.property === 'house' ? '주택 상속 2.8%' : '주택 외 상속 2.8%', acq, eduPpmOf(acq), rural)
}

/** 원시취득(신축) 취득세 2.8% — 주택 85㎡ 이하는 농특세 비과세. 농지는 원시취득 대상이 아니므로 주택 외로 계산 */
export function calcOriginalAcquisitionTax(input: { value: number; property: AcqProperty; over85?: boolean }): AcqTaxBreakdown {
  const v = safeValue(input.value)
  const acq = EXT_RATE_PPM.original
  const isHouse = input.property === 'house'
  const rural = isHouse && !input.over85 ? 0 : RURAL_BASE_PPM
  return build(v, 'original', isHouse ? '주택 원시취득(신축) 2.8%' : '원시취득(신축) 2.8%', acq, eduPpmOf(acq), rural)
}

/** 주택 외(농지 포함) 무상취득(증여) 3.5% + 교육세 0.3% + 농특세 0.2% = 4.0% */
export function calcGiftNonHouseAcquisitionTax(value: number): AcqTaxBreakdown {
  const acq = EXT_RATE_PPM.gift
  return build(safeValue(value), 'giftNonHouse', '주택 외 무상취득(증여) 3.5%', acq, eduPpmOf(acq), RURAL_BASE_PPM)
}

/** 농지 유상취득 3% + 교육세 0.2% + 농특세 0.2% = 3.4% (자경농민 감면 등 미반영) */
export function calcFarmlandPurchaseAcquisitionTax(value: number): AcqTaxBreakdown {
  const acq = EXT_RATE_PPM.farmlandPurchase
  return build(safeValue(value), 'farmland', '농지 유상취득 3%', acq, eduPpmOf(acq), RURAL_BASE_PPM)
}

export interface AcquisitionInput {
  cause: AcqCause
  property: AcqProperty
  /** 과세표준(원) — 매매: 취득가액 · 증여: 시가인정액 · 상속: 시가표준액 · 신축: 사실상 취득가격 */
  value: number
  /** 전용 85㎡ 초과 주택 (농특세 과세) */
  over85: boolean
  /* 매매 주택 */
  homeCount?: number
  adjusted?: boolean
  temporaryTwoHomes?: boolean
  corporate?: boolean
  lowValueHouse?: boolean
  /* 증여 주택 */
  giftStdValueOver3eok?: boolean
  giftFamilyExempt?: boolean
  /* 상속 주택 */
  inheritHomelessOneHouse?: boolean
}

/** 취득 원인·물건별 취득세·지방교육세·농특세 (감면 전) — 매매·증여 주택은 기존 함수에 위임 */
export function calcAcquisitionTaxByCause(input: AcquisitionInput): AcqTaxBreakdown {
  const { cause, property, value, over85 } = input
  if (cause === 'purchase') {
    if (property === 'house') {
      return calcHouseAcquisitionTax({
        price: value, homeCount: input.homeCount ?? 1, adjusted: !!input.adjusted, over85,
        temporaryTwoHomes: !!input.temporaryTwoHomes, corporate: !!input.corporate, lowValueHouse: !!input.lowValueHouse,
      })
    }
    return property === 'farmland' ? calcFarmlandPurchaseAcquisitionTax(value) : calcNonHouseAcquisitionTax(value)
  }
  if (cause === 'gift') {
    if (property === 'house') {
      return calcGiftHouseAcquisitionTax({
        value, over85, adjusted: !!input.adjusted,
        stdValueOver3eok: !!input.giftStdValueOver3eok, familyExempt: !!input.giftFamilyExempt,
      })
    }
    return calcGiftNonHouseAcquisitionTax(value)
  }
  if (cause === 'inherit') {
    return calcInheritAcquisitionTax({ value, property, over85, homelessOneHouse: !!input.inheritHomelessOneHouse })
  }
  return calcOriginalAcquisitionTax({ value, property, over85 })
}

/* ─── 생애최초 주택 구입 감면 — 지방세특례제한법 §36의3 (2026.1.1 시행분, 일몰 2028.12.31) ───
   · 요건: 본인·배우자 모두 주택 소유 사실 없음 + 거주 목적 + 취득당시가액 12억원 이하 주택을 유상거래로 취득
   · 감면: 취득세 100% — 산출세액 200만원 이하면 면제, 초과하면 200만원 공제
     한도 300만원: ① 소형주택 — 전용 60㎡ 이하 + 취득당시가액 수도권 6억·비수도권 3억 이하, 아파트 제외
                     (연립·다세대·다가구·도시형생활주택) ② 인구감소지역 소재 주택(2026.1.1 시행 개정으로 200→300만원)
   · 지방교육세: 산출 교육세를 취득세 감면율로 감면 (지방세법 §151①1호 후단)
       → 교육세(감면 후) = 산출 교육세 × 감면 후 취득세 ÷ 산출 취득세. 1~3% 구간은 교육세 = 취득세의 10%라
         감면 효과는 최대 220만원(300만원 한도면 330만원)
   · 농어촌특별세: 감면세액 × 20% (농특세법 §5①1호). 전용 85㎡ 이하 주택은 비과세(§4 11호·시행령 §4) → 85㎡ 초과만 추가
     [가정 — 미확인] 본세분 농특세(§5①6호, '지방세법·지특법·조특법에 따라 산출한 취득세액'을 2% 세율로 계산한 금액의 10%)는
     감면과 무관하게 과세표준 × 0.2% 그대로 둔다. 감면 후 세액 기준으로 줄이는 해석도 가능해 위택스 모의계산 대조 전까지
     페이지·결과에 '추정'으로 표시한다 (7억·85㎡ 초과: 이 가정 12,459,000 / 비례 감액 해석 약 12,219,470).
   · 중과세율(§13의2) 산출세액에 대한 감면 적용 여부는 확인하지 못했다 → 중과 취득은 감면을 계산하지 않는다(보수적 차단).
     요건은 '본인·배우자'의 주택 소유 이력뿐이라 부모 등 다른 세대원의 주택은 무관 — 세대 주택 수(homeCount)로 막지 않는다.
   · 인구감소지역 300만원 한도: 수도권 인구감소지역(강화·옹진·연천·가평) 포함 여부와 가액 요건은 확인하지 못함 → 화면에 확인 안내.
   · 추징(§36의3④): 3개월 안에 상시 거주 미개시 · 3개월 안에 추가 주택 취득(상속 제외) · 3년 상시 거주 전 매각·증여·다른 용도 사용
   · 출처: 정책브리핑·행정안전부 「2026년부터 달라지는 지방세제」(2026-01), 국가법령정보센터 지방세특례제한법 §36의3.
     2026.8.26 발표 「2026년 지방세제 개편안」(주거용 오피스텔 포함, 40세 미만 청년 한도 300만원 등 — ACQ_REFORM_PROPOSAL_2026)은
     입법 전이므로 반영하지 않음 (2026-09 기준). */
export const FIRST_HOME_RELIEF = {
  /** 취득당시가액 상한 (원, 이하) */
  maxPrice: 1_200_000_000,
  /** depopulation: 수도권 인구감소지역 포함 여부·가액 요건 미확인 — 화면에 확인 안내 */
  caps: { general: 2_000_000, smallCapital: 3_000_000, smallNonCapital: 3_000_000, depopulation: 3_000_000 },
  /** 소형주택 취득당시가액 상한 (원, 이하) */
  smallMaxPrice: { capital: 600_000_000, nonCapital: 300_000_000 },
  smallMaxAreaM2: 60,
  /** 감면분 농특세율 (%) */
  ruralOnReliefPct: 20,
  /** 일몰 (이 날까지 취득분) */
  sunset: '2028-12-31',
  residenceStartMonths: 3,
  residenceYears: 3,
} as const

export type FirstHomeCapKind = keyof typeof FIRST_HOME_RELIEF.caps
export const isFirstHomeCapKind = (v: unknown): v is FirstHomeCapKind =>
  typeof v === 'string' && Object.prototype.hasOwnProperty.call(FIRST_HOME_RELIEF.caps, v)

/** 생애최초 감면 불가 사유 — 가능하면 null. base는 같은 입력의 감면 전 결과 */
export function firstHomeIneligibility(input: AcquisitionInput, base: AcqTaxBreakdown): string | null {
  if (input.cause !== 'purchase') return '생애최초 감면은 유상거래(매매)로 취득하는 주택만 해당합니다'
  if (input.property !== 'house') return '생애최초 감면은 주택만 해당합니다 (오피스텔은 2026-09 현행법상 제외)'
  if (input.corporate) return '법인은 생애최초 감면 대상이 아닙니다'
  if (safeValue(input.value) > FIRST_HOME_RELIEF.maxPrice) return `취득당시가액 ${FIRST_HOME_RELIEF.maxPrice / 100_000_000}억원 초과 주택은 감면 대상이 아닙니다`
  // 요건은 본인·배우자의 주택 소유 이력뿐 — 세대 주택 수(부모 주택 등)로는 막지 않는다. 중과 산출세액 감면은 미확인이라 보수적으로 차단
  if (base.category !== 'standard') return '중과세율이 적용되는 취득은 이 계산기에서 생애최초 감면을 계산하지 않습니다'
  return null
}

export interface FirstHomeRelief {
  /** 실제 적용한 한도 종류 — 소형주택 면적(85㎡ 초과 입력)·가액 기준을 넘으면 general로 대체 */
  capKind: FirstHomeCapKind
  cap: number
  /** 취득세 감면액 */
  acquisitionRelief: number
  /** 지방교육세 감면액 */
  educationRelief: number
  /** 감면분 농어촌특별세 (추가 부담, 85㎡ 초과만) */
  ruralOnRelief: number
  /** 순 감면 효과 = 취득세 감면 + 교육세 감면 − 감면분 농특세 */
  netRelief: number
  /** 한도 대체 등 안내 */
  note?: string
  /** 감면 후 세목별 세액 */
  after: { acquisitionTax: number; educationTax: number; ruralTax: number; total: number }
}

/** 생애최초 감면 적용 — 자격 판단은 firstHomeIneligibility로 먼저 한다 */
export function applyFirstHomeRelief(
  base: AcqTaxBreakdown,
  opts: { capKind: FirstHomeCapKind; over85: boolean },
): FirstHomeRelief {
  const R = FIRST_HOME_RELIEF
  let capKind: FirstHomeCapKind = opts.capKind
  let note: string | undefined
  const small = capKind === 'smallCapital' || capKind === 'smallNonCapital'
  if (small && opts.over85) {
    // 소형주택은 전용 60㎡ 이하 — 85㎡ 초과 입력과 모순이므로 가액과 관계없이 일반 한도
    capKind = 'general'; note = `소형주택 ${R.caps.smallCapital / 10_000}만원 한도는 전용 ${R.smallMaxAreaM2}㎡ 이하만 — ${NATIONAL_HOUSING_AREA_M2}㎡ 초과이므로 일반 한도 ${R.caps.general / 10_000}만원 적용`
  } else if (capKind === 'smallCapital' && base.price > R.smallMaxPrice.capital) {
    capKind = 'general'; note = `수도권 소형주택 ${R.caps.smallCapital / 10_000}만원 한도는 취득당시가액 ${R.smallMaxPrice.capital / 100_000_000}억원 이하만 — 일반 한도 ${R.caps.general / 10_000}만원 적용`
  } else if (capKind === 'smallNonCapital' && base.price > R.smallMaxPrice.nonCapital) {
    capKind = 'general'; note = `비수도권 소형주택 ${R.caps.smallNonCapital / 10_000}만원 한도는 취득당시가액 ${R.smallMaxPrice.nonCapital / 100_000_000}억원 이하만 — 일반 한도 ${R.caps.general / 10_000}만원 적용`
  }
  const cap = R.caps[capKind]
  const acquisitionRelief = Math.min(base.acquisitionTax, cap)
  const acqAfter = base.acquisitionTax - acquisitionRelief
  const eduAfter = base.acquisitionTax > 0
    ? floor10(Math.floor((base.educationTax * acqAfter) / base.acquisitionTax))
    : base.educationTax
  const educationRelief = base.educationTax - eduAfter
  const ruralOnRelief = opts.over85 ? floor10(Math.floor((acquisitionRelief * R.ruralOnReliefPct) / 100)) : 0
  const ruralAfter = base.ruralTax + ruralOnRelief // 본세분 0.2%는 유지 — 위 [가정 — 미확인] 참고
  return {
    capKind, cap, acquisitionRelief, educationRelief, ruralOnRelief,
    netRelief: acquisitionRelief + educationRelief - ruralOnRelief,
    note,
    after: { acquisitionTax: acqAfter, educationTax: eduAfter, ruralTax: ruralAfter, total: acqAfter + eduAfter + ruralAfter },
  }
}
