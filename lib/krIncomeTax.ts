/* ──────────────────────────────────────────────────────
   lib/krIncomeTax.ts
   종합소득세 누진세율표 — 단일 소스 (소득세법 §55, 2023 개정 구간 · 2026년 현재 동일)
   사용처: salary · severance · freelance-tax · dividend · rent-jeonse
   ※ 만원 단위 도구(severance)는 호출부에서 ×10,000 환산해 사용
   ────────────────────────────────────────────────────── */

export interface IncomeTaxBracket {
  upTo: number       // 과세표준 상한 (원, 이하) — 마지막 구간은 Infinity
  rate: number       // 세율 (소수)
  deduction: number  // 누진공제액 (원)
}

export const BRACKETS_2026: IncomeTaxBracket[] = [
  { upTo:    14_000_000, rate: 0.06, deduction:          0 },
  { upTo:    50_000_000, rate: 0.15, deduction:  1_260_000 },
  { upTo:    88_000_000, rate: 0.24, deduction:  5_760_000 },
  { upTo:   150_000_000, rate: 0.35, deduction: 15_440_000 },
  { upTo:   300_000_000, rate: 0.38, deduction: 19_940_000 },
  { upTo:   500_000_000, rate: 0.40, deduction: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { upTo:      Infinity, rate: 0.45, deduction: 65_940_000 },
]

function bracketOf(taxBase: number): IncomeTaxBracket {
  return BRACKETS_2026.find(b => taxBase <= b.upTo) ?? BRACKETS_2026[BRACKETS_2026.length - 1]
}

/** 과세표준(원) → 산출세액(원). 누진공제 방식 */
export function progressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0
  const b = bracketOf(taxBase)
  return Math.max(0, taxBase * b.rate - b.deduction)
}

/** 과세표준(원)이 속한 구간의 한계세율.
 *  localTax: true → 지방소득세 10% 포함 (예: 0.15 → 0.165 · 부동소수 오차 제거를 위해 소수 4자리 반올림) */
export function marginalRate(taxBase: number, opts?: { localTax?: boolean }): number {
  const b = bracketOf(Math.max(0, taxBase))
  return opts?.localTax ? Math.round(b.rate * 1.1 * 10_000) / 10_000 : b.rate
}
