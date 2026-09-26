/* ──────────────────────────────────────────────────────
   finance/deposit-interest/depositInterestUtils.ts
   예·적금 이자 — 순수 계산 (세율·끝수는 lib/krFinancialIncomeTax 단일 소스)

   월 단위 관행(개월/12) 공식:
     정기예금 단리   I = P · r · n / 12
     정기예금 월복리 I = P · ((1 + r/12)^n − 1)
     정기적금 단리   I = M · (r/12) · n(n+1)/2          ← k회차 납입금은 (n − k + 1)개월 예치
     정기적금 월복리 I = M · (1 + r/12) · ((1 + r/12)^n − 1) / (r/12) − M · n
   세전 이자는 원 미만 절사, 세금은 10원 미만 절사(국고금 관리법 §47①).
   ────────────────────────────────────────────────────── */

import { withholdInterestTax, finTaxTypePct, type FinTaxType, type FinTaxLine } from '@/lib/krFinancialIncomeTax'

export type Product = 'deposit' | 'savings'
export type Method = 'simple' | 'monthly'

export const PRODUCTS: Product[] = ['deposit', 'savings']
export const METHODS: Method[] = ['simple', 'monthly']
export const isProduct = (v: unknown): v is Product => PRODUCTS.includes(v as Product)
export const isMethod = (v: unknown): v is Method => METHODS.includes(v as Method)

/* 입력 상한 — 정수 연산 안전 범위(원금×세율 백만분율 < 2^53) 안쪽 */
export const MAX_DEPOSIT = 10_000_000_000   // 예금 원금 100억
export const MAX_MONTHLY = 100_000_000      // 적금 월 납입 1억
export const MAX_MONTHS = 120
export const MAX_RATE_PCT = 20

export interface DepositInput {
  product: Product
  /** 예금: 원금 · 적금: 월 납입액 (원) */
  amount: number
  /** 기간 (개월, 1~120 정수) */
  months: number
  /** 연이율 (%) */
  ratePct: number
  method: Method
  taxType: FinTaxType
  /** taxType === 'custom'일 때 합계세율(%) */
  customTaxPct?: number
}

export interface MonthRow {
  month: number
  /** 누적 납입(원금) */
  paid: number
  /** 그 달 말까지 붙은 누적 세전 이자 (원 미만 절사) */
  interest: number
  /** 누적 납입 + 누적 세전 이자 */
  balance: number
}

export interface DepositResult {
  input: DepositInput
  /** 총 납입 원금 */
  principal: number
  /** 세전 이자 (원 미만 절사) */
  grossInterest: number
  taxLines: FinTaxLine[]
  taxTotal: number
  /** 세후 이자 */
  netInterest: number
  /** 만기 수령액 = 원금 + 세후 이자 */
  maturity: number
  /** 적용 합계세율(%) — 표기용 */
  taxPct: number
  /** 원금 대비 세전 수익률 (%) — 기간 전체 */
  grossYieldPct: number
  /** 원금 대비 세후 연환산 수익률 (%) — 단리 환산: 세후 이자 / 원금 × 12/n */
  netAnnualPct: number
  /** 이 상품의 실제 세전 이자(단리·월복리 그대로)를 '같은 총액을 첫 달에 단리 예금'으로 내려면 필요한 연이율 (%) */
  depositEquivPct: number
  /** 이 상품의 실제 세전 이자(단리·월복리 그대로)를 '같은 총액을 n개월로 나눠 단리 적금'으로 내려면 필요한 연이율 (%) */
  savingsEquivPct: number
  rows: MonthRow[]
}

/** 부동소수 꼬리(…999.9999999)가 원 단위 절사를 한 칸 내리지 않게 아주 작은 여유를 두고 내림 */
const floorWon = (x: number): number => (x > 0 ? Math.floor(x + 1e-6) : 0)

/** 입력 정규화 — 음수·NaN·범위 밖은 클램프, 기간은 정수 */
export function normalizeInput(input: DepositInput): DepositInput {
  const cap = input.product === 'deposit' ? MAX_DEPOSIT : MAX_MONTHLY
  const amount = Math.min(cap, Math.max(0, Math.floor(Number.isFinite(input.amount) ? input.amount : 0)))
  const months = Math.min(MAX_MONTHS, Math.max(1, Math.round(Number.isFinite(input.months) ? input.months : 1)))
  // 금리는 0.01%p 단위 (은행 고시 관행) — 단리 정수 연산(bp)과 월복리가 같은 값을 쓰도록 여기서 반올림
  const ratePct = Math.round(Math.min(MAX_RATE_PCT, Math.max(0, Number.isFinite(input.ratePct) ? input.ratePct : 0)) * 100) / 100
  const customTaxPct = Math.min(100, Math.max(0, Number.isFinite(input.customTaxPct ?? 0) ? (input.customTaxPct ?? 0) : 0))
  return { ...input, amount, months, ratePct, customTaxPct }
}

/**
 * k개월 시점의 누적 세전 이자(원 미만 절사 전, 실수).
 *  - 단리는 정수 분자/분모로 계산해 부동소수 오차 없이 떨어지게 한다(세율은 0.01%p 단위로 반올림).
 */
export function accruedInterest(product: Product, method: Method, amount: number, ratePct: number, k: number): number {
  if (!(amount > 0) || !(ratePct > 0) || !(k > 0)) return 0
  if (method === 'simple') {
    const bp = Math.round(ratePct * 100)             // 3.35% → 335 (만분율 × 100)
    // 예금: P·(bp/10000)·k/12 = P·bp·k / 120000
    // 적금: M·(bp/10000)/12 · k(k+1)/2 = M·bp·k(k+1) / 240000
    return product === 'deposit'
      ? (amount * bp * k) / 120_000
      : (amount * bp * k * (k + 1)) / 240_000
  }
  const i = ratePct / 100 / 12
  const g = Math.pow(1 + i, k)
  return product === 'deposit'
    ? amount * (g - 1)
    : amount * (1 + i) * (g - 1) / i - amount * k
}

export function calcDeposit(raw: DepositInput): DepositResult {
  const input = normalizeInput(raw)
  const { product, amount, months: n, ratePct, method, taxType } = input
  const principal = product === 'deposit' ? amount : amount * n
  const grossInterest = floorWon(accruedInterest(product, method, amount, ratePct, n))
  const tax = withholdInterestTax(grossInterest, taxType, input.customTaxPct)
  const netInterest = grossInterest - tax.total
  const maturity = principal + netInterest

  const rows: MonthRow[] = []
  for (let k = 1; k <= n; k++) {
    const paid = product === 'deposit' ? amount : amount * k
    const interest = floorWon(accruedInterest(product, method, amount, ratePct, k))
    rows.push({ month: k, paid, interest, balance: paid + interest })
  }

  const grossYieldPct = principal > 0 ? (grossInterest / principal) * 100 : 0
  const netAnnualPct = principal > 0 ? (netInterest / principal) * (12 / n) * 100 : 0
  // 적금 ↔ 예금 환산은 '세전 이자가 같아지는 단리 연이율'로 정의 — 방향과 무관하게 실제 이자(월복리면 복리 이자)에서 역산.
  //   단리 예금 이자 = P·r·n/12        → r = I / P × 12/n
  //   단리 적금 이자 = (P/n)·(r/12)·n(n+1)/2 = P·r·(n+1)/24 → r = I × 24 / (P·(n+1))
  // 단리 상품이면 각각 ratePct·r×(n+1)/2n (적금→예금), r×2n/(n+1) (예금→적금)과 같다.
  const accrued = accruedInterest(product, method, amount, ratePct, n)
  const depositEquivPct = principal > 0 ? (accrued / principal) * (12 / n) * 100 : 0
  const savingsEquivPct = principal > 0 ? (accrued * 24) / (principal * (n + 1)) * 100 : 0

  return {
    input, principal, grossInterest,
    taxLines: tax.lines, taxTotal: tax.total, netInterest, maturity,
    taxPct: finTaxTypePct(taxType, input.customTaxPct),
    grossYieldPct, netAnnualPct, depositEquivPct, savingsEquivPct, rows,
  }
}

/** 단리 적금 연 r% ↔ 단리 예금 환산: 평균 예치 원금이 총 납입의 (n+1)/(2n) → r_예금 = r · (n+1)/(2n) */
export function depositEquivalentOfSavings(savingsRatePct: number, months: number): number {
  const n = Math.max(1, Math.round(months))
  return savingsRatePct * (n + 1) / (2 * n)
}

/** 단리 예금 연 r%와 같은 이자를 내려면 필요한 단리 적금 금리: r · 2n/(n+1) */
export function savingsRateForSameInterest(depositRatePct: number, months: number): number {
  const n = Math.max(1, Math.round(months))
  return depositRatePct * (2 * n) / (n + 1)
}

/* ── 포맷·입력 ── */

export const won = (n: number): string => Math.round(n).toLocaleString('ko-KR')

/** 만원 반올림 표기 (12,345,678 → '1,235만원', 123,456,789 → '1억 2,346만원').
 *  전체를 먼저 만원 단위로 반올림한 뒤 억/만을 나눈다 — 99,995,000이 '10,000만원'이 아니라 '1억원'이 되게 */
export function manwon(n: number): string {
  if (!(Math.abs(n) >= 10_000)) return `${won(n)}원`
  const totalMan = Math.round(n / 10_000)
  const eok = Math.floor(totalMan / 10_000)
  const man = totalMan % 10_000
  if (eok > 0) return man > 0 ? `${eok}억 ${man.toLocaleString('ko-KR')}만원` : `${eok}억원`
  return `${man.toLocaleString('ko-KR')}만원`
}

/** 퍼센트 표기 — 소수 둘째 자리까지, 끝의 0 제거 (2.7083 → '2.71', 5 → '5') */
export function pct2(x: number): string {
  if (!Number.isFinite(x)) return '0'
  return (Math.round(x * 100) / 100).toString()
}

/** 금액 입력 — 숫자만 남기고 실시간 콤마 */
export function commaInput(v: string): string {
  const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '')
  return d ? Number(d.slice(0, 15)).toLocaleString('ko-KR') : ''
}

/** 콤마 문자열 → 숫자 (parseFloat 기반) */
export function parseMoney(v: string): number {
  const x = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(x) ? x : 0
}

/** 소수 입력 — 숫자와 첫 번째 점만, 소수 둘째 자리까지 */
export function decimalInput(v: string, maxDecimals = 2): string {
  let s = v.replace(/[^\d.]/g, '')
  const dot = s.indexOf('.')
  if (dot >= 0) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, maxDecimals)
  return s
}

/** 예·적금 한 줄 설명 (복사·공유용) */
export function productLabel(p: Product): string {
  return p === 'deposit' ? '정기예금' : '정기적금'
}
export function methodLabel(m: Method): string {
  return m === 'simple' ? '단리' : '월복리'
}
