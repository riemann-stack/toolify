/* ──────────────────────────────────────────────────────
   lib/krLoanRules.ts
   주택담보대출 규제 — LTV·DSR 한도·스트레스 가산금리·주담대 금액 상한 — 단일 소스
   사용처: finance/auction (auctionUtils.ts가 지역·명의 선택지를 이 규칙으로 변환)
           — finance/dsr(priceCapLoan)·loan·real-estate는 아직 자체 값 사용(후속: 이 모듈로 이전)
   기준일: 2026-09 (2025.10.16 시행 10·15 주택시장 안정화 대책 기준, 경락잔금대출에도 동일 적용)
   출처: 금융위원회 10·15 대책 FAQ(fsc.go.kr), 금융위원회 보도자료 「다주택자 규제지역 내 주택담보대출 허용」
         (2023.3.2 시행 은행업감독규정 개정), 6·27 가계부채 관리 강화 방안(2025.6.28 시행)
   ── 금액 단위: 만원 (auction·dsr 도구와 같은 단위) ──
   ──────────────────────────────────────────────────────

   [규칙]
   · 규제지역(조정대상지역·투기과열지구 — 서울 전역·경기 12곳) LTV:
       무주택자·처분조건부 1주택자 40%, 유주택자 추가 구입 0%, 생애최초 구입자 70% 유지(10·15 대책)
   · 비규제지역 LTV: 무주택·1주택 70%, 다주택자(2주택 이상 보유)·주택임대·매매사업자(법인 포함) 60%
   · 수도권·규제지역 주담대 금액 상한: 시가 15억 이하 6억 / 15억 초과~25억 이하 4억 / 25억 초과 2억
   · 스트레스 DSR: 수도권·규제지역 주담대 스트레스 금리 하한 3%p (그 외 수도권 1.5%p, 지방은 더 낮을 수 있음)
   · DSR 한도(은행권): 연소득 대비 연 원리금 40%
   · 수도권은 비규제지역이라도 6·27 대책 이후 다주택자 추가 구입 주담대 금지(0%),
     1주택자는 기존 주택 처분 조건부로만 허용 — 현재 도구가 수도권 여부를 받지 않아 규칙에 넣지 않았다(후속).
   ────────────────────────────────────────────────────── */

/** 비규제지역 LTV (%) — 무주택·1주택 */
export const LTV_NON_REGULATED = 70
/** 비규제지역 LTV (%) — 다주택자(2주택 이상 보유)·주택임대·매매사업자(법인 포함) */
export const LTV_NON_REGULATED_MULTI = 60
/** 규제지역 LTV (%) — 무주택자·처분조건부 1주택자 */
export const LTV_REGULATED_NO_HOME = 40
/** 규제지역 LTV (%) — 유주택자 추가 구입 */
export const LTV_REGULATED_HAS_HOME = 0
/** 규제지역 LTV (%) — 생애최초 구입자 (10·15 대책). 현재 recommendLtv는 이 구분을 받지 않는다 */
export const LTV_REGULATED_FIRST_TIME = 70

/** 스트레스 금리 가산 (%p) — 수도권·규제지역 주담대 하한 */
export const STRESS_RATE_REGULATED = 3.0
/** 스트레스 금리 가산 (%p) — 그 외 기본값 */
export const STRESS_RATE_DEFAULT = 1.5

/** 은행권 DSR 한도 (비율) — 연 원리금 / 연소득 ≤ 0.40 */
export const DSR_LIMIT_RATIO = 0.40

/** 수도권·규제지역 주담대 금액 상한 구간 (만원) — 담보가 upTo 이하 → cap. 마지막 구간 upTo = Infinity */
export const MORTGAGE_CAP_TIERS_MAN: readonly { readonly upTo: number; readonly cap: number }[] = [
  { upTo: 150_000,  cap: 60_000 },   // 15억 이하 → 6억
  { upTo: 250_000,  cap: 40_000 },   // 15억 초과~25억 이하 → 4억
  { upTo: Infinity, cap: 20_000 },   // 25억 초과 → 2억
]

export interface LtvBorrower {
  /** 규제지역(조정대상지역·투기과열지구) 여부 */
  regulated: boolean
  /** 취득 전 보유 주택 수 (0 = 무주택) */
  homesOwned: number
  /** 법인·주택임대·매매사업자 */
  business: boolean
}

/** 지역·보유 주택 기준 LTV 기본값(%) — 규제지역: 무주택 40 / 유주택·법인 0, 비규제: 70 (다주택·법인 60) */
export function recommendLtv(b: LtvBorrower): number {
  if (!b.regulated) {
    return b.business || b.homesOwned >= 2 ? LTV_NON_REGULATED_MULTI : LTV_NON_REGULATED
  }
  return !b.business && b.homesOwned === 0 ? LTV_REGULATED_NO_HOME : LTV_REGULATED_HAS_HOME
}

/** 지역 기준 스트레스 금리 가산(%p) 기본값 */
export function recommendStressRate(regulated: boolean): number {
  return regulated ? STRESS_RATE_REGULATED : STRESS_RATE_DEFAULT
}

/** 담보가(만원) → 주담대 금액 상한(만원), 지역 구분 없이 구간만 적용 — 15억 이하 6억 / 15~25억 4억 / 25억 초과 2억 */
export function mortgagePriceCapMan(priceMan: number): number {
  for (const t of MORTGAGE_CAP_TIERS_MAN) if (priceMan <= t.upTo) return t.cap
  return MORTGAGE_CAP_TIERS_MAN[MORTGAGE_CAP_TIERS_MAN.length - 1].cap   // NaN 등 비교 불가 입력 → 최저 상한
}

/** 규제지역 주담대 금액 상한 (만원). 비규제는 상한 없음(Infinity) */
export function mortgageCapMan(priceMan: number, regulated: boolean): number {
  return regulated ? mortgagePriceCapMan(priceMan) : Infinity
}
