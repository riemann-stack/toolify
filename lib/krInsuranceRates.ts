/* ──────────────────────────────────────────────────────
   lib/krInsuranceRates.ts
   4대보험 요율 (2025 · 2026) — 단일 소스
   사용처: 4-insurance(이 형태 그대로) · salary(근로자 부담분을 소수로 파생)
   요율 개정 시 이 파일만 갱신하면 두 도구에 함께 반영됨
   ────────────────────────────────────────────────────── */

export type RateSet = {
  pension:    { total: number; employee: number; employer: number; minBase: number; maxBase: number }  // % · 원
  health:     { total: number; employee: number; employer: number }                                    // %
  ltc:        { rateOfSalary: number; employee: number; employer: number }                             // 보수월액 대비 %
  unemp:      { employee: number; employer: number; extra: { under150: number; under1000: number; over1000: number } } // %
  workersCompAvg: number  // 산재 전 업종 평균 %
}

/* 법정 최저시급 (시간급, 원) — 고용노동부 확정·고시.
   2026: 10,320원 (2.9% 인상, 월 209시간 기준 2,156,880원 — moel.go.kr 보도자료 news_seq=18144) */
export const MIN_HOURLY_WAGE: Record<2025 | 2026, number> = {
  2025: 10_030,
  2026: 10_320,
}

export const INSURANCE_RATES: Record<2025 | 2026, RateSet> = {
  2025: {
    pension: { total: 9.0,  employee: 4.5,    employer: 4.5,    minBase: 390_000,  maxBase: 6_170_000 },
    health:  { total: 7.09, employee: 3.545,  employer: 3.545 },
    ltc:     { rateOfSalary: 0.9182, employee: 0.4591,  employer: 0.4591 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.43,
  },
  2026: {
    pension: { total: 9.5,  employee: 4.75,   employer: 4.75,   minBase: 400_000,  maxBase: 6_370_000 },
    health:  { total: 7.19, employee: 3.595,  employer: 3.595 },
    ltc:     { rateOfSalary: 0.9448, employee: 0.4724,  employer: 0.4724 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.43,
  },
}
