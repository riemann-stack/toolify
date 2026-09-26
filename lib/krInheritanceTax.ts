/* ──────────────────────────────────────────────────────
   lib/krInheritanceTax.ts
   상속세·증여세 — 세율·공제 단일 소스 (상속세 및 증여세법, 2026-09 기준 현행)
   사용처: finance/inheritance
   출처: 국가법령정보센터 「상속세 및 증여세법」·같은 법 시행령 (https://www.law.go.kr/법령/상속세및증여세법)
   ──────────────────────────────────────────────────────

   [법적 근거]
   1) 세율 — 상증법 §26 (증여세는 §56에서 §26 준용). 과세표준 1억/5억/10억/30억 경계, 10~50% 누진
   2) 증여재산공제 — §53 (수증자 기준 10년 합산 한도)
        배우자 6억 / 직계존속→직계비속(성인) 5천만 · 미성년 2천만 / 직계비속→직계존속 5천만 / 기타친족 1천만
   3) 세대생략 할증 — §27·§57: 산출세액의 30% 가산 (미성년·20억 초과 40%는 미반영)
   4) 신고세액공제 — §69: 산출세액의 3%
   5) 상속공제
        · 기초공제 2억 — §18
        · 자녀공제 1인당 5천만 — §20①1호 (미성년자·연로자·장애인 공제는 미반영)
        · 일괄공제 5억 — §21① (기초+인적공제 합계와 비교해 큰 쪽). 배우자 단독상속은 일괄공제 불가 — §21②
        · 배우자 상속공제 — §19: 실제 상속분(법정상속분·30억 한도), 최소 5억
        · 금융재산공제 — §22: 순금융재산 2천만 이하 전액 / 2천만~1억 2천만 / 1억 초과 20%(최대 2억)
        · 동거주택 상속공제 — §23의2: 주택가액 100%, 최대 6억
        · 장례비 — 시행령 §9②: 장례비용 최소 500만~최대 1,000만 + 봉안시설·자연장지 500만 한도
          → 이 lib는 입력 합계를 최소 500만 ~ 최대 1,500만으로 본다
   ────────────────────────────────────────────────────── */

/* ─── 누진세율 (§26) ─── */
export interface InheritanceGiftBracket {
  /** 과세표준 하한 (원, 초과) */
  min: number
  /** 과세표준 상한 (원, 이하) — 마지막 구간은 Infinity */
  max: number
  /** 세율 (소수) */
  rate: number
  /** 누진공제액 (원) */
  deduction: number
}

export const INHERITANCE_GIFT_TAX_BRACKETS: InheritanceGiftBracket[] = [
  { min: 0,             max: 100_000_000,   rate: 0.10, deduction: 0           },
  { min: 100_000_000,   max: 500_000_000,   rate: 0.20, deduction: 10_000_000  },
  { min: 500_000_000,   max: 1_000_000_000, rate: 0.30, deduction: 60_000_000  },
  { min: 1_000_000_000, max: 3_000_000_000, rate: 0.40, deduction: 160_000_000 },
  { min: 3_000_000_000, max: Infinity,      rate: 0.50, deduction: 460_000_000 },
]

/** 과세표준(원) → 산출세액(원). 누진공제 방식 (반올림 없음) */
export function inheritanceGiftTax(taxBase: number): number {
  if (taxBase <= 0) return 0
  let bracket: InheritanceGiftBracket = INHERITANCE_GIFT_TAX_BRACKETS[0]
  for (const b of INHERITANCE_GIFT_TAX_BRACKETS) {
    if (taxBase > b.min) bracket = b
  }
  return Math.max(0, taxBase * bracket.rate - bracket.deduction)
}

/** 과세표준(원)이 속한 구간의 세율·누진공제 (0 이하는 0/0) */
export function inheritanceGiftBracket(taxBase: number): { rate: number; deduction: number } {
  let rate = 0
  let deduction = 0
  for (const b of INHERITANCE_GIFT_TAX_BRACKETS) {
    if (taxBase > b.min) {
      rate = b.rate
      deduction = b.deduction
    }
  }
  return { rate, deduction }
}

/* ─── 증여재산공제 (§53, 수증자 기준 10년 합산) ─── */
export const GIFT_DEDUCTION_PERIOD_YEARS = 10
export const GIFT_DEDUCTION = {
  /** 배우자 6억 */
  spouse: 600_000_000,
  /** 직계존속 → 성인 직계비속 5천만 */
  adultDescendant: 50_000_000,
  /** 직계존속 → 미성년 직계비속 2천만 */
  minorDescendant: 20_000_000,
  /** 직계비속 → 직계존속 5천만 (조부모 포함, 직계존속 합산 한도) */
  ascendant: 50_000_000,
  /** 기타친족(6촌 이내 혈족·4촌 이내 인척 — 며느리·사위 포함) 1천만 */
  otherRelative: 10_000_000,
  /** 타인 0 */
  none: 0,
} as const

/** 세대생략 할증률 (§27·§57) — 산출세액의 30% */
export const GENERATION_SKIP_SURCHARGE_RATE = 0.30
/** 신고세액공제율 (§69) — 산출세액의 3% */
export const FILING_CREDIT_RATE = 0.03

/* ─── 상속공제 ─── */
/** 기초공제 (§18) */
export const INHERITANCE_BASIC_DEDUCTION = 200_000_000
/** 자녀공제 1인당 (§20①1호) */
export const INHERITANCE_CHILD_DEDUCTION = 50_000_000
/** 일괄공제 (§21①) */
export const INHERITANCE_LUMP_SUM_DEDUCTION = 500_000_000
/** 배우자 상속공제 최소·최대 (§19) */
export const SPOUSE_INHERITANCE_DEDUCTION_MIN = 500_000_000
export const SPOUSE_INHERITANCE_DEDUCTION_MAX = 3_000_000_000
/** 장례비 공제 최소·최대 (시행령 §9② — 장례비 1,000만 + 봉안·자연장지 500만) */
export const FUNERAL_DEDUCTION_MIN = 5_000_000
export const FUNERAL_DEDUCTION_MAX = 15_000_000
/** 금융재산공제 (§22) 구간 */
export const FINANCIAL_ASSET_DEDUCTION = {
  /** 순금융재산 이 금액 이하 → 전액 공제 */
  fullUpTo: 20_000_000,
  /** 이 금액 이하 → flat 공제 */
  flatUpTo: 100_000_000,
  flat: 20_000_000,
  /** 초과 시 비율·한도 */
  rate: 0.20,
  max: 200_000_000,
} as const
/** 동거주택 상속공제 한도 (§23의2) — 주택가액 100% */
export const COHABIT_HOME_DEDUCTION_MAX = 600_000_000

/** 장례비 공제액 — 입력(합계)을 최소 500만 ~ 최대 1,500만으로 */
export function funeralDeductionOf(funeral: number): number {
  return Math.max(FUNERAL_DEDUCTION_MIN, Math.min(Math.max(0, funeral), FUNERAL_DEDUCTION_MAX))
}

/** 기초공제 + 자녀공제 vs 일괄공제 (§21). 배우자 단독상속이면 일괄공제 불가 → 기초+인적공제 */
export function basicOrLumpSumDeduction(childCount: number, spouseSole: boolean): number {
  const personal = INHERITANCE_BASIC_DEDUCTION + childCount * INHERITANCE_CHILD_DEDUCTION
  return spouseSole ? personal : Math.max(personal, INHERITANCE_LUMP_SUM_DEDUCTION)
}

/** 배우자 상속공제 (§19): max(5억, min(실제 상속분, 법정상속분 한도, 30억)).
 *  actualShare 미입력(undefined)이면 법정한도까지 취득한다고 가정. 0(상속포기)이어도 최소 5억 */
export function spouseInheritanceDeduction(legalLimit: number, actualShare?: number): number {
  const cap = Math.min(legalLimit, SPOUSE_INHERITANCE_DEDUCTION_MAX)
  return actualShare !== undefined
    ? Math.max(SPOUSE_INHERITANCE_DEDUCTION_MIN, Math.min(actualShare, cap))
    : Math.max(SPOUSE_INHERITANCE_DEDUCTION_MIN, cap)
}

/** 금융재산공제 (§22) — 순금융재산(원) */
export function financialAssetDeduction(netFinancialAsset: number): number {
  const fa = netFinancialAsset > 0 ? netFinancialAsset : 0
  const F = FINANCIAL_ASSET_DEDUCTION
  return fa <= 0 ? 0
    : fa <= F.fullUpTo ? fa
      : fa <= F.flatUpTo ? F.flat
        : Math.min(F.max, fa * F.rate)
}

/** 동거주택 상속공제 (§23의2) — 요건 충족 가정 */
export function cohabitHomeDeduction(homeValue: number): number {
  return homeValue > 0 ? Math.min(COHABIT_HOME_DEDUCTION_MAX, homeValue) : 0
}
