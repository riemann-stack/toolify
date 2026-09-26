/* ──────────────────────────────────────────────────────
   lib/krExpenseRates.ts
   종합소득세 추계신고 — 업종별 단순·기준경비율 + 단순경비율 적용·장부 기준금액 — 단일 소스
   사용처: finance/freelance-tax (freelanceTaxUtils.ts가 import·재수출)
   기준일: 2026-09 · 출처: 국세청 「귀속 경비율 고시」·홈택스 「기준(단순)경비율 조회」,
           국가법령정보센터 소득세법 시행령 §143④(단순경비율 적용 대상)·§208⑤(간편장부대상자)
   ──────────────────────────────────────────────────────

   [귀속연도 키]
   · 경비율은 매년 3월 국세청이 직전 귀속연도분을 새로 고시한다 → EXPENSE_RATES_BY_YEAR[귀속연도].
   · 현재 표(EXPENSE_RATE_YEAR = 2024)는 2024년 귀속 고시 기준. 단 940100(저술가)은 2023년 귀속 확인값이다.
   · 940913(73.7/25.3)·940926(64.1/20.9)은 검색 스니펫 1건씩에 근거 — 새 고시(2025년 귀속, 2026.3) 확인 시 재검증.
   · 새 귀속연도를 추가할 때는 ExpenseRateYear에 연도를 더하고 두 표(율·기준금액)에 같은 키를 채운 뒤
     EXPENSE_RATE_YEAR를 올린다. 신고 전에는 홈택스 조회값이 우선이다.

   [기준금액 — 인적용역(940xxx)]
   · 단순경비율 초과율: 수입금액 4,000만원 초과분 → 초과율 = 100 − (100 − 일반율) × 1.4 (경비율 고시)
   · 단순경비율 적용 한도(계속사업자, 직전연도 수입): 3,600만원 (소득세법 시행령 §143④)
   · 복식부기 의무 기준: 7,500만원 (간편장부대상자 기준 — 소득세법 시행령 §208⑤)
   ────────────────────────────────────────────────────── */

export type ExpenseRateYear = 2024

/** 현재 도구가 쓰는 경비율 귀속연도 */
export const EXPENSE_RATE_YEAR: ExpenseRateYear = 2024

export interface ExpenseRate {
  code: string
  name: string        // 국세청 업종명
  simpleRate: number  // 단순경비율 일반율 %
  baseRate: number    // 기준경비율 %
}

/* 같은 코드에는 반드시 같은 율이 붙도록 도구의 업종 프리셋은 코드만 들고 율은 이 표에서 조회한다. */
export const EXPENSE_RATES_BY_YEAR: Record<ExpenseRateYear, Record<string, ExpenseRate>> = {
  2024: {
    '940100': { code: '940100', name: '저술가(작가·번역가 등)',     simpleRate: 58.7, baseRate: 11.2 },  // 2023년 귀속 확인값
    '940903': { code: '940903', name: '학원강사·강사·과외교습자',   simpleRate: 61.7, baseRate: 14.9 },
    '940306': { code: '940306', name: '1인미디어콘텐츠창작자',      simpleRate: 64.1, baseRate: 12.1 },
    '940906': { code: '940906', name: '보험설계사',                 simpleRate: 77.6, baseRate: 26.5 },
    '940909': { code: '940909', name: '기타자영업(기타 인적용역)',  simpleRate: 64.1, baseRate: 17.0 },
    '940913': { code: '940913', name: '대리운전기사',               simpleRate: 73.7, baseRate: 25.3 },
    '940918': { code: '940918', name: '퀵서비스배달원',             simpleRate: 79.4, baseRate: 15.3 },
    '940926': { code: '940926', name: '소프트웨어 프리랜서',        simpleRate: 64.1, baseRate: 20.9 },
  },
}

/** 현재 귀속연도 경비율 표 (업종코드 → 율) */
export const EXPENSE_RATES: Record<string, ExpenseRate> = EXPENSE_RATES_BY_YEAR[EXPENSE_RATE_YEAR]

export interface ExpenseThresholds {
  /** 단순경비율 일반율 적용 상한 — 이 금액 초과분은 초과율 (원) */
  simpleExcess: number
  /** 초과율 산식 배율 — 초과율 = 100 − (100 − 일반율) × 배율 */
  simpleExcessMultiplier: number
  /** 인적용역 단순경비율 적용 한도 — 계속사업자 직전연도 수입 (원) */
  personalServiceSimpleLimit: number
  /** 인적용역·서비스업 복식부기 의무 기준 (원) */
  personalServiceBookThreshold: number
}

export const EXPENSE_THRESHOLDS_BY_YEAR: Record<ExpenseRateYear, ExpenseThresholds> = {
  2024: {
    simpleExcess: 40_000_000,
    simpleExcessMultiplier: 1.4,
    personalServiceSimpleLimit: 36_000_000,
    personalServiceBookThreshold: 75_000_000,
  },
}

const CURRENT_THRESHOLDS = EXPENSE_THRESHOLDS_BY_YEAR[EXPENSE_RATE_YEAR]

/** 인적용역(940xxx) 단순경비율 초과율이 적용되기 시작하는 수입금액 — 4,000만원 초과분 */
export const SIMPLE_EXCESS_THRESHOLD = CURRENT_THRESHOLDS.simpleExcess
/** 인적용역 단순경비율 적용 한도 (계속사업자, 직전연도 수입) — 3,600만원 */
export const HUMAN_SERVICE_SIMPLE_LIMIT = CURRENT_THRESHOLDS.personalServiceSimpleLimit
/** 인적용역·서비스업 복식부기 의무 기준 — 7,500만원 */
export const HUMAN_SERVICE_BOOK_THRESHOLD = CURRENT_THRESHOLDS.personalServiceBookThreshold

/** 인적용역(940xxx) 단순경비율 초과율 — 수입금액 4,000만원 초과분에 적용.
 *  초과율 = 100 − (100 − 일반율) × 1.4 (예: 58.7 → 42.2, 64.1 → 49.7), 0.1%p 단위 반올림 */
export function simpleExcessRate(simpleRate: number, year: ExpenseRateYear = EXPENSE_RATE_YEAR): number {
  const k = EXPENSE_THRESHOLDS_BY_YEAR[year].simpleExcessMultiplier
  return Math.max(0, Math.round((100 - (100 - simpleRate) * k) * 10) / 10)
}
