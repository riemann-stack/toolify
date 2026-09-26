/* ──────────────────────────────────────────────────────
   lib/krFinancialIncomeTax.ts
   이자·배당소득(금융소득) 원천징수·비과세 특례 — 단일 소스
   기준 점검: 2026년 9월 (2025년 12월 개정 조세특례제한법 반영)
   사용처: finance/deposit-interest · finance/dividend

   ─ 일반과세: 소득세 14%(소득세법 §129①1호·2호) + 개인지방소득세 = 소득세의 10%(지방세법 §103의13) → 15.4%
   ─ 끝수: 국고금 관리법 §47① — 10원 미만 끝수는 계산하지 않음(절사). 지방세도 같은 조 ③에 따라 준용
   ─ 소액부징수(소득세법 §86)는 이자소득에 적용되지 않음 → 이자 세액이 1,000원 미만이어도 원천징수
   ─ 분리과세 기준: 이자·배당 합계 연 2,000만원 이하(소득세법 §14③6호), 초과 시 금융소득종합과세
   ─ 조합등예탁금(조특법 §89의3): 2025.12.23 개정(법률 제21223호, 2026.1.1 시행)으로 과세 단계가 '가입일' 기준.
     개정 전 조문은 '이자가 발생한 연도' 기준(2026년 발생분 5%, 2027년 이후 발생분 9%)이었다.
     조문 원문 대조: 2026-09 law.go.kr 현행 조문 사본(조특법 2026.9.15 공포본)과 개정 이력으로 확인.
   ─ 농어촌특별세: 예탁금의 비과세·특례세율 모두 '감면'(농특세법 §2①2호) → 감면세액 = 이자×14% − 납부 소득세(§5④),
     세율 10%(§5①2호). 단 농어민·임업인·저소득 근로자의 예탁금 감면은 농특세 비과세(농특세법 시행령 §4⑦3호).
   ※ '세금우대저축 9.5%'는 신규 가입이 끝난 제도라 다루지 않는다.
   ────────────────────────────────────────────────────── */

/** 기준 점검 시점(화면 표기용) */
export const FIN_TAX_REVIEWED = '2026년 9월'

/** 소득세법 §129①1호 — 이자소득 원천징수세율(일반 이자소득, 비영업대금 등 예외 제외) */
export const INTEREST_WITHHOLDING_RATE = 0.14
/** 소득세법 §129①2호 — 배당소득 원천징수세율(일반 배당소득) */
export const DIVIDEND_WITHHOLDING_RATE = 0.14
/** 지방세법 §103의13 — 원천징수하는 소득세의 100분의 10을 개인지방소득세로 특별징수 */
export const LOCAL_INCOME_TAX_RATIO = 0.1
/** 농어촌특별세법 §5① — 조세특례제한법에 따라 감면받은 이자·배당소득세 감면세액의 100분의 10 */
export const RURAL_SPECIAL_TAX_RATIO = 0.1

/** 소수 세율 → 퍼센트 숫자 (0.154 → 15.4, 0.014 → 1.4). 부동소수 꼬리 제거(소수 3자리) */
export const ratePct = (rate: number): number => Math.round(rate * 100_000) / 1_000
/** 세율 합성 시 부동소수 오차 제거 (0.14 × 1.1 = 0.15400000000000003 → 0.154) */
const r5 = (x: number): number => Math.round(x * 100_000) / 100_000

/** 이자소득 일반과세 합계세율(소수) — 14% + 1.4% = 0.154 */
export const GENERAL_INTEREST_TAX_RATE = r5(INTEREST_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))
/** 배당소득 일반과세 합계세율(소수) — 14% + 1.4% = 0.154 */
export const GENERAL_DIVIDEND_TAX_RATE = r5(DIVIDEND_WITHHOLDING_RATE * (1 + LOCAL_INCOME_TAX_RATIO))
/** 이자·배당 공통 일반과세 합계세율(두 세율이 같을 때의 대표값) */
export const GENERAL_FIN_TAX_RATE = GENERAL_INTEREST_TAX_RATE
/** 퍼센트 표기용 (15.4) */
export const GENERAL_FIN_TAX_PCT = ratePct(GENERAL_FIN_TAX_RATE)
/** 원천징수 소득세율 퍼센트 (14) */
export const WITHHOLDING_PCT = ratePct(INTEREST_WITHHOLDING_RATE)
/** 지방소득세 실효세율 퍼센트 (1.4 = 14% × 10%) */
export const LOCAL_TAX_PCT = ratePct(r5(INTEREST_WITHHOLDING_RATE * LOCAL_INCOME_TAX_RATIO))

/** 소득세법 §14③6호 — 이자·배당소득 합계 연 2,000만원 이하 + 원천징수 → 분리과세(종결) */
export const COMPREHENSIVE_TAX_THRESHOLD = 20_000_000

/** 국고금 관리법 §47① — 세액의 이 금액 미만 끝수는 계산하지 않는다(절사) */
export const TAX_ROUNDING_UNIT = 10
/** 소득세법 §86 1호 — 원천징수세액이 이 금액 미만이면 징수하지 않는다. 단 이자소득은 제외(이자 세액은 소액이어도 원천징수) */
export const SMALL_TAX_EXEMPT_LIMIT = 1_000
export const SMALL_TAX_EXEMPT_APPLIES_TO_INTEREST = false

/* ── 조합 등 예탁금 (농협·수협·신협·산림조합·새마을금고) — 조세특례제한법 §89의3 ── */

export interface CoopDepositPhase {
  /** 이 단계가 적용되는 가입 연도(이상) — 조문이 '○년 1월 1일부터 ○년 12월 31일까지 가입함으로써 발생하는 이자소득'으로 가입일 기준 */
  joinYearFrom: number
  /** 가입 연도 상한(이하). 없으면 이후 계속 */
  joinYearTo?: number
  /** 원천징수 소득세율 — 0이면 비과세(농어촌특별세만) */
  rate: number
}

export interface CoopDepositGroup {
  id: 'standard' | 'highIncome'
  label: string
  phases: CoopDepositPhase[]
}

/** 원 → '7,000만원' (라벨용, lib 내부) */
const manLabel = (won: number): string => `${(won / 10_000).toLocaleString('ko-KR')}만원`

/** 조특법 §88의5②1호나목 — 직전 과세기간 소득 기준 (§89의3②가 준용) */
const COOP_INCOME_TEST = {
  /** 1) 근로소득만(+분리과세 소득) 있는 사람: 총급여액 이하 */
  totalSalary: 70_000_000,
  /** 2) 그 밖의 사람: 종합소득과세표준에 합산되는 종합소득금액 이하 (총급여 7천만원 초과 근로소득이 있으면 제외) */
  comprehensiveIncome: 60_000_000,
} as const

/** 조특법 §88의5②1호가목·시행령 §82의5② — 소득과 무관하게 standard 그룹인 조합(의 조합원) */
const COOP_MEMBER_UNIONS = '농협·수협·산림조합'

export const COOP_DEPOSIT = {
  article: '조세특례제한법 §89의3',
  /** 1인당 예탁금 합계 한도 (원) — §89의3①, 시행령 §83의3① */
  limitPerPerson: 30_000_000,
  /** 가입 당시 나이 요건 (이상) — §89의3① */
  minAge: 19,
  /** 소득 기준 — §88의5②1호나목 (직전 과세기간) */
  incomeTest: COOP_INCOME_TEST,
  /** 소득과 무관하게 standard 그룹인 조합원 — §88의5②1호가목, 시행령 §82의5② */
  memberUnions: COOP_MEMBER_UNIONS,
  /** 비과세 기간에도 감면세액(14%)의 10%는 농어촌특별세로 원천징수 → 1.4% (농특세법 §5①2호·④) */
  exemptRuralTaxRate: r5(INTEREST_WITHHOLDING_RATE * RURAL_SPECIAL_TAX_RATIO),
  /** 저율 분리과세분(5%·9%)은 종합소득과세표준에 합산하지 않고 개인지방소득세를 부과하지 않는다 — §89의3①·② 본문 */
  reducedHasLocalTax: false,
  /** 농어촌특별세 비과세 대상 — 농특세법 시행령 §4⑦3호 (예탁금 감면 전체: 비과세·특례세율) */
  ruralTaxExemptPersons: [
    '농어민(농어가목돈마련저축법 시행령 §2①)',
    '임업인(산림조합법 시행령 §2, 산림 5ha 이상 소유자 제외)',
    '본인·배우자 연간 총소득 합계 2,500만원 이하 근로자 등(한국주택금융공사법 시행령 §2①1·2호)',
  ],
  /** 2025.12.23 개정: 가입 연도 × 소득 기준으로 비과세 종료 시점이 갈린다 (2025년까지 가입분은 소득과 무관하게 비과세, §89의3①) */
  groups: [
    {
      id: 'standard',
      label: `${COOP_MEMBER_UNIONS} 조합원 또는 직전 과세기간 총급여 ${manLabel(COOP_INCOME_TEST.totalSalary)}(종합소득금액 ${manLabel(COOP_INCOME_TEST.comprehensiveIncome)}) 이하`,
      phases: [
        { joinYearFrom: 0, joinYearTo: 2028, rate: 0 },
        { joinYearFrom: 2029, joinYearTo: 2029, rate: 0.05 },
        { joinYearFrom: 2030, rate: 0.09 },
      ],
    },
    {
      id: 'highIncome',
      label: '그 밖의 가입자(위 조합원이 아니면서 소득 기준 초과)',
      phases: [
        { joinYearFrom: 0, joinYearTo: 2025, rate: 0 },
        { joinYearFrom: 2026, joinYearTo: 2026, rate: 0.05 },
        { joinYearFrom: 2027, rate: 0.09 },
      ],
    },
  ] as CoopDepositGroup[],
} as const

/** 조합 예탁금 저율 분리과세 세율 목록(소수, 오름차순) — 일정표에서 (0.05, 0.09) */
export const COOP_REDUCED_RATES: number[] = [...new Set(COOP_DEPOSIT.groups.flatMap(g => g.phases.map(p => p.rate)))]
  .filter(x => x > 0)
  .sort((a, b) => a - b)

/**
 * 조합 예탁금 원천징수 합계세율(소수) = 소득세 특례세율 + 농어촌특별세.
 *  농특세 = (이자 × 14% − 납부 소득세) × 10% (농특세법 §5①2호·④) → rate + (0.14 − rate) × 0.1
 *  예: 비과세 0 → 0.014 · 5% → 0.059 · 9% → 0.095. 개인지방소득세는 없음(§89의3).
 *  ruralExempt: 농어민·임업인·저소득 근로자(농특세법 시행령 §4⑦3호) → 농특세 0
 */
export function coopDepositTotalRate(rate: number, ruralExempt = false): number {
  const r = Math.max(0, Math.min(INTEREST_WITHHOLDING_RATE, rate))
  return r5(r + (ruralExempt ? 0 : (INTEREST_WITHHOLDING_RATE - r) * RURAL_SPECIAL_TAX_RATIO))
}

/** 가입 연도·소득 그룹 → 적용 원천징수 소득세율 (0 = 비과세) */
export function coopDepositRate(groupId: CoopDepositGroup['id'], joinYear: number): number {
  const g = COOP_DEPOSIT.groups.find(x => x.id === groupId) ?? COOP_DEPOSIT.groups[0]
  const p = g.phases.find(ph => joinYear >= ph.joinYearFrom && (ph.joinYearTo === undefined || joinYear <= ph.joinYearTo))
  return p ? p.rate : g.phases[g.phases.length - 1].rate
}

/** 비과세가 끝나는 가입 연도(이 해까지 가입분이 비과세) */
export function coopExemptLastJoinYear(groupId: CoopDepositGroup['id']): number {
  const g = COOP_DEPOSIT.groups.find(x => x.id === groupId) ?? COOP_DEPOSIT.groups[0]
  return g.phases.find(ph => ph.rate === 0)?.joinYearTo ?? 0
}

/* ── 비과세종합저축 — 조세특례제한법 §88의2 ── */

export const TAX_FREE_SAVINGS = {
  article: '조세특례제한법 §88의2',
  /** 1인당 저축원금 한도 (원) */
  limitPerPerson: 50_000_000,
  /** 가입 기한 (이 날까지 가입분) — 2025.12 개정으로 3년 연장 */
  joinUntil: { y: 2028, m: 12, d: 31 },
  /** 65세 이상 요건이 '기초연금 수급자'로 좁혀진 가입분의 시작일 */
  seniorRuleChangedFrom: { y: 2026, m: 1, d: 1 },
  /** 가입 대상 (2026.1.1 이후 가입분 기준) */
  eligible: [
    '만 65세 이상 기초연금 수급자 (2025년까지 가입분은 만 65세 이상이면 가입 가능했음)',
    '장애인복지법상 등록 장애인',
    '독립유공자와 그 유족·가족',
    '국가유공자 중 상이자',
    '국민기초생활보장법상 수급자',
    '고엽제후유의증환자',
    '5·18민주화운동부상자',
  ],
  /** 제외 요건 */
  excluded: '가입일 직전 3개 과세기간 중 1회 이상 금융소득종합과세 대상이었던 사람',
} as const

/* ── 원천징수 계산 ── */

export type FinTaxType = 'general' | 'taxFree' | 'coopExempt' | 'custom'

export const FIN_TAX_TYPES: FinTaxType[] = ['general', 'taxFree', 'coopExempt', 'custom']
export const isFinTaxType = (v: unknown): v is FinTaxType => FIN_TAX_TYPES.includes(v as FinTaxType)

export interface FinTaxLine {
  key: 'income' | 'local' | 'rural' | 'custom'
  label: string
  /** 표기용 세율(%) — 지방소득세는 이자 대비 실효세율 */
  ratePct: number
  amount: number
}

/** 10원 미만 절사 (국고금 관리법 §47①) — 음수·NaN은 0 */
export function floor10(won: number): number {
  if (!(won > 0)) return 0
  return Math.floor(won / TAX_ROUNDING_UNIT) * TAX_ROUNDING_UNIT
}

/**
 * 금액 × 세율을 10원 미만 절사 — 부동소수 곱셈 오차(예: 350 × 0.14 = 49.00000000000001) 없이 정수 연산.
 * 세율은 백만분율 정수(ppm, 14% → 140,000)로 바꾸고, 금액은 원 단위 정수.
 */
export function taxFloor10(amount: number, rate: number): number {
  const a = Math.floor(Math.max(0, amount))
  const ppm = Math.round(Math.max(0, rate) * 1_000_000)
  const div = 1_000_000 * TAX_ROUNDING_UNIT
  // a × ppm / 1e6 을 10원 단위 내림 = floor(a × ppm / 1e7) × 10. 곱이 2^53을 넘으면 BigInt
  if (a * ppm <= Number.MAX_SAFE_INTEGER) return Math.floor((a * ppm) / div) * TAX_ROUNDING_UNIT
  return Number((BigInt(a) * BigInt(ppm)) / BigInt(div)) * TAX_ROUNDING_UNIT
}

/**
 * 조합 예탁금 이자(세전, 원) → 원천징수 내역 (조특법 §89의3 · 농특세법 §5①2호·④).
 *  이자소득세 = 이자 × 특례세율(0·5%·9%) 10원 미만 절사 (0%면 줄 없음)
 *  농어촌특별세 = 이자 × (14% − 특례세율) × 10% 10원 미만 절사 (ruralExempt면 줄 없음)
 *  개인지방소득세 없음.
 */
export function withholdCoopDepositTax(interest: number, rate: number, ruralExempt = false): { lines: FinTaxLine[]; total: number } {
  const base = Math.floor(Math.max(0, interest))
  const r = Math.max(0, Math.min(INTEREST_WITHHOLDING_RATE, Number.isFinite(rate) ? rate : 0))
  const lines: FinTaxLine[] = []
  if (r > 0) lines.push({ key: 'income', label: '이자소득세', ratePct: ratePct(r), amount: taxFloor10(base, r) })
  if (!ruralExempt) {
    const ruralRate = r5((INTEREST_WITHHOLDING_RATE - r) * RURAL_SPECIAL_TAX_RATIO)
    lines.push({ key: 'rural', label: '농어촌특별세', ratePct: ratePct(ruralRate), amount: taxFloor10(base, ruralRate) })
  }
  return { lines, total: lines.reduce((s, l) => s + l.amount, 0) }
}

/**
 * 이자(세전, 원) → 원천징수 세액 내역.
 *  general    : 소득세 14% (10원 미만 절사) → 지방소득세 = 절사한 소득세 × 10% (10원 미만 절사)
 *  taxFree    : 비과세종합저축 — 0원
 *  coopExempt : 조합 예탁금 비과세 — 농어촌특별세 = 이자 × 14% × 10% (10원 미만 절사) = withholdCoopDepositTax(이자, 0)
 *  custom     : 사용자가 입력한 합계세율(%) 하나로 10원 미만 절사
 */
export function withholdInterestTax(interest: number, type: FinTaxType, customPct = 0): { lines: FinTaxLine[]; total: number } {
  const base = Math.floor(Math.max(0, interest))
  const lines: FinTaxLine[] = []
  if (type === 'general') {
    const income = taxFloor10(base, INTEREST_WITHHOLDING_RATE)
    const local = taxFloor10(income, LOCAL_INCOME_TAX_RATIO)
    lines.push({ key: 'income', label: '이자소득세', ratePct: WITHHOLDING_PCT, amount: income })
    lines.push({ key: 'local', label: '지방소득세', ratePct: LOCAL_TAX_PCT, amount: local })
  } else if (type === 'coopExempt') {
    return withholdCoopDepositTax(base, 0)
  } else if (type === 'custom') {
    const pct = Math.min(100, Math.max(0, Number.isFinite(customPct) ? customPct : 0))
    const t = taxFloor10(base, pct / 100)
    lines.push({ key: 'custom', label: '세금(직접 입력 세율)', ratePct: pct, amount: t })
  }
  return { lines, total: lines.reduce((s, l) => s + l.amount, 0) }
}

/** 과세 유형별 표기용 합계세율(%) — custom은 입력값 */
export function finTaxTypePct(type: FinTaxType, customPct = 0): number {
  if (type === 'general') return GENERAL_FIN_TAX_PCT
  if (type === 'coopExempt') return ratePct(COOP_DEPOSIT.exemptRuralTaxRate)
  if (type === 'custom') return customPct
  return 0
}
