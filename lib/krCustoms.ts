/* ──────────────────────────────────────────────────────
   lib/krCustoms.ts
   해외직구 관부가세 — 소액면세 한도·품목 관세율·내국세율 단일 소스 (2026-09 기준)
   사용처: life/customs
   출처: 국가법령정보센터 관세법 제94조·같은 법 시행규칙 제45조, 관세법 별표 관세율표,
         관세청 「특송물품 수입통관 사무처리에 관한 고시」(목록통관), 관세법령정보포털(unipass) 세율표,
         부가가치세법·개별소비세법·주세법·교육세법
   ──────────────────────────────────────────────────────

   [소액면세 한도 — 물품가격(운임·보험료 제외) 기준, 자가사용]
   · 일반: 미화 $150 이하 — 관세법 시행규칙 제45조
   · 미국발 특송 목록통관 물품: $200 이하 — 특송물품 수입통관 사무처리에 관한 고시
   · 목록통관 배제 물품(건강기능식품·식품 등 수입신고 대상)은 미국발도 $150
   · 주류는 소액면세(관세·부가세 면제) 배제. 다만 자가사용 1병(1L 이하)·물품가격 $150 이하면 관세만 면제하고
     주세·교육세·부가세는 과세 — 수입통관 사무처리에 관한 고시 별표(자가사용 인정기준). 품목 플래그는 호출부 데이터

   [품목 관세율 — 관세율표 기본세율(관세법 별표) 간이값, 2026-09 검토]
   · ITA(정보기술협정) 품목(8471 컴퓨터·입출력장치, 8517 휴대폰, 8528.52 컴퓨터 모니터, 8525.89 디지털카메라)은 0%
   · 비디오게임 콘솔(9504.50)은 기본세율 8%이나 WTO 협정세율 0%가 우선 적용돼 0%
   · 신발류(64류)는 소재와 관계없이 13%. FTA 협정세율·원산지는 반영하지 않음
   ────────────────────────────────────────────────────── */

/* ─── 소액면세 한도 (USD) ─── */
/** 일반 소액면세 한도 — 관세법 시행규칙 제45조 */
export const DUTY_FREE_LIMIT_USD = 150
/** 미국발 특송 목록통관 물품 한도 */
export const US_LIST_CLEARANCE_LIMIT_USD = 200
/** 목록통관 배제(수입신고) 물품 한도 — 미국발도 동일 */
export const NON_LISTED_DUTY_FREE_LIMIT_USD = 150

/** 적용 면세 한도(USD) — 출발국 한도(countryLimitUsd)에서 목록통관 배제 물품은 $150으로 제한 */
export function dutyFreeLimitUsd(countryLimitUsd: number, isListed: boolean): number {
  return isListed ? countryLimitUsd : Math.min(countryLimitUsd, NON_LISTED_DUTY_FREE_LIMIT_USD)
}

/* ─── 품목별 기본 관세율 (%) — 키는 life/customs 품목 id ─── */
export const CUSTOMS_ITEM_DUTY_RATE_PCT = {
  /* 의류·신발·가방 */
  cloth_knit: 13,    // 6109~6111 편직 의류
  cloth_woven: 13,   // 6203·6204 직물 의류
  shoe_sport: 13,    // 6402
  shoe_leather: 13,  // 6403 — 신발류(64류) 13%
  bag: 8,            // 4202
  wallet: 8,         // 4202
  jewelry: 8,        // 7113·7117
  watch: 8,          // 9101·9102
  sunglasses: 8,     // 9004
  backpack: 8,       // 4202
  /* 뷰티 */
  cosmetic: 6.5,     // 3304
  haircare: 6.5,     // 3305·3307
  perfume: 8,        // 3303
  /* 영양제·건강 */
  supplement: 8,     // 2106·3004
  /* 전자 */
  laptop: 0,         // 8471 ITA
  phone: 0,          // 8517 ITA
  monitor: 0,        // 8528.52 ITA (TV 수신 기능이 있으면 TV 8%)
  earphone: 8,       // 8518
  keyboard: 0,       // 8471.60 ITA
  camera: 0,         // 8525.89 ITA (교환렌즈 9002는 8%)
  console: 0,        // 9504.50 — 기본 8%, WTO 협정세율 0% 우선
  /* 기타 */
  toy: 8,            // 9503
  book: 0,           // 4901
  sports: 8,         // 9506
  baby: 13,          // 6111
  art: 8,            // 9608
  /* 식품·주류 */
  snack: 8,          // 1806 (가공식품은 품목에 따라 8~30%)
  cheese: 36,        // 0406
  wine: 15,          // 2204
} as const satisfies Record<string, number>

export type CustomsItemId = keyof typeof CUSTOMS_ITEM_DUTY_RATE_PCT

/* ─── 수입 내국세 ─── */
/** 수입 부가가치세율 — 과세표준 = 과세가격 + 관세 + 개소세/주세 + 교육세 (도서 등 면세 제외) */
export const IMPORT_VAT_RATE = 0.10
/** 개별소비세 — 고급 가방·고급 시계: 기준가격 1개당 200만원 초과분 20% (과세표준 = 과세가격 + 관세) */
export const LUXURY_EXCISE = { threshold: 2_000_000, rate: 20 } as const
/** 개별소비세 — 보석·귀금속 제품: 기준가격 1개당 500만원 초과분 20% (개별소비세법 제1조 제2항 제2호, 2026-09 확인) */
export const JEWELRY_EXCISE = { threshold: 5_000_000, rate: 20 } as const
/** 교육세 — 개별소비세액의 30% */
export const EXCISE_EDU_TAX_RATIO = 0.30
/** 주세율 (%) — 과실주(와인) 30%, 과세표준 = 과세가격 + 관세 */
export const WINE_LIQUOR_TAX_PCT = 30
/** 교육세 — 주세액의 10% (주세율 70% 이하 주류) */
export const LIQUOR_EDU_TAX_RATIO = 0.10
/** 주류 자가사용 관세 면제 — 1병(1L 이하)·물품가격 $150 이하면 관세만 면제, 주세·교육세·부가세는 과세
 *  (수입통관 사무처리에 관한 고시 별표 자가사용 인정기준) */
export const LIQUOR_DUTY_EXEMPT = { bottles: 1, maxLiters: 1, maxUsd: 150 } as const
