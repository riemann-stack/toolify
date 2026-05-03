// ─────────────────────────────────────────────────────────────
// 공모주 청약 증거금 계산기 — 5사6입 · 청약단위 · 메모 storage
// ─────────────────────────────────────────────────────────────

// ── 청약단위 자동 매핑 (구간별) ────────────
// 한국 증권사 일반 패턴 — 종목·증권사별 다를 수 있음
export interface SubscriptionUnitRange {
  min: number   // 청약 주수 하한 (포함)
  max: number   // 청약 주수 상한 (미포함)
  unit: number  // 단위
}

export const SUBSCRIPTION_UNITS: SubscriptionUnitRange[] = [
  { min: 10,    max: 100,    unit: 10 },
  { min: 100,   max: 500,    unit: 50 },
  { min: 500,   max: 1000,   unit: 100 },
  { min: 1000,  max: 5000,   unit: 500 },
  { min: 5000,  max: 999999, unit: 1000 },
]

/** 청약 주수에 대해 자동 추천 단위 */
export function recommendedUnit(shares: number): number {
  if (shares < 10) return 10
  for (const r of SUBSCRIPTION_UNITS) {
    if (shares >= r.min && shares < r.max) return r.unit
  }
  return 1000
}

/** 청약 주수를 단위에 맞춰 올림 */
export function ceilToUnit(shares: number, unit: number): number {
  if (unit <= 0) return Math.ceil(shares)
  return Math.ceil(shares / unit) * unit
}
/** 청약 주수를 단위에 맞춰 내림 (증거금 → 주수 모드) */
export function floorToUnit(shares: number, unit: number): number {
  if (unit <= 0) return Math.floor(shares)
  return Math.floor(shares / unit) * unit
}

// ── 5사6입 처리 ──────────────────────────
export type FiveSixRule = 'standard' | 'guaranteed1'

/**
 * 5사6입 (proportional allocation rounding).
 * - standard: 0.5 미만 → 0, 0.5 이상 → 반올림(>=0.5 → 1주, >=1.5 → 2주)
 * - guaranteed1: 0.5 미만이라도 신청자 중 추첨으로 1주 보장 가능 (단순화: 동일 결과 + 안내)
 */
export function applyFiveSixRule(rawShares: number, rule: FiveSixRule = 'standard'): number {
  if (rawShares <= 0) return 0
  // 5사6입 = 한국 회계 표준 반올림 (0.5 → 올림)
  const rounded = Math.floor(rawShares + 0.5)
  if (rule === 'guaranteed1' && rounded === 0 && rawShares > 0) {
    // 단순화: 0주여도 1주 보장 추첨 가정 — 1주로 표시
    return 1
  }
  return rounded
}

// ── 메인 계산 ────────────────────────────
export interface IpoCalcInput {
  publicPrice: number       // 공모가 (원)
  competition: number        // 비례경쟁률 (예: 500 → 500:1)
  depositRatio: number       // 증거금률 (0.5 = 50%)
  unit: number               // 청약단위
  limit?: number             // 청약 한도 (주)
  rule: FiveSixRule
  evenExpected: number       // 균등 기대 (사용자 입력)
}

export interface ProportionalToDepositResult {
  targetShares: number
  theoreticalSubscribe: number    // 이론 청약 주수 (반올림 X)
  actualSubscribe: number         // 단위 + 한도 적용 후 실제
  hitLimit: boolean
  belowMinUnit: boolean
  subscribeAmount: number         // 청약금액
  depositRequired: number         // 필요 증거금
  proportionalAlloc: number       // 5사6입 후 비례 배정
  totalAlloc: number              // 균등 + 비례
  finalPayment: number            // 최종 납입
  refundEstimate: number          // 환불 예상
}

/** 비례 → 증거금 (메인) */
export function calcDepositFromTarget(targetShares: number, input: IpoCalcInput): ProportionalToDepositResult {
  const theoreticalSubscribe = targetShares * input.competition
  let actualSubscribe = ceilToUnit(theoreticalSubscribe, input.unit)
  let hitLimit = false
  if (input.limit && actualSubscribe > input.limit) {
    actualSubscribe = floorToUnit(input.limit, input.unit)
    hitLimit = true
  }
  const belowMinUnit = actualSubscribe < input.unit && theoreticalSubscribe > 0

  const subscribeAmount = actualSubscribe * input.publicPrice
  const depositRequired = subscribeAmount * input.depositRatio

  const rawAlloc = input.competition > 0 ? actualSubscribe / input.competition : 0
  const proportionalAlloc = applyFiveSixRule(rawAlloc, input.rule)
  const totalAlloc = proportionalAlloc + Math.max(0, input.evenExpected)
  const finalPayment = totalAlloc * input.publicPrice
  const refundEstimate = Math.max(0, depositRequired - (proportionalAlloc * input.publicPrice))

  return {
    targetShares,
    theoreticalSubscribe,
    actualSubscribe,
    hitLimit,
    belowMinUnit,
    subscribeAmount,
    depositRequired,
    proportionalAlloc,
    totalAlloc,
    finalPayment,
    refundEstimate,
  }
}

export interface DepositToSharesResult {
  myDeposit: number
  possibleSubscribe: number       // 청약 가능 주수 (계산값)
  actualSubscribe: number         // 단위 내림 + 한도 적용
  hitLimit: boolean
  belowMinUnit: boolean
  usedDeposit: number             // 실제 사용된 증거금
  unusedDeposit: number           // 단위 내림으로 남은 금액
  proportionalAlloc: number       // 5사6입 후 예상 비례
  totalAlloc: number              // 균등 + 비례
  finalPayment: number
  refundEstimate: number
}

/** 증거금 → 예상 주수 (역산) */
export function calcSharesFromDeposit(myDeposit: number, input: IpoCalcInput): DepositToSharesResult {
  const possibleSubscribe = input.depositRatio > 0 && input.publicPrice > 0
    ? myDeposit / input.depositRatio / input.publicPrice
    : 0
  let actualSubscribe = floorToUnit(possibleSubscribe, input.unit)
  let hitLimit = false
  if (input.limit && actualSubscribe > input.limit) {
    actualSubscribe = floorToUnit(input.limit, input.unit)
    hitLimit = true
  }
  const belowMinUnit = actualSubscribe < input.unit && possibleSubscribe > 0
  const usedDeposit = actualSubscribe * input.publicPrice * input.depositRatio
  const unusedDeposit = Math.max(0, myDeposit - usedDeposit)

  const rawAlloc = input.competition > 0 ? actualSubscribe / input.competition : 0
  const proportionalAlloc = applyFiveSixRule(rawAlloc, input.rule)
  const totalAlloc = proportionalAlloc + Math.max(0, input.evenExpected)
  const finalPayment = totalAlloc * input.publicPrice
  const refundEstimate = Math.max(0, usedDeposit - (proportionalAlloc * input.publicPrice))

  return {
    myDeposit, possibleSubscribe, actualSubscribe, hitLimit, belowMinUnit,
    usedDeposit, unusedDeposit,
    proportionalAlloc, totalAlloc, finalPayment, refundEstimate,
  }
}

// ── 시나리오 ─────────────────────────────
export const DEFAULT_SCENARIOS = [50, 100, 200, 300, 500, 800, 1000, 1500, 2000]

export interface ScenarioRow {
  competition: number
  actualSubscribe: number
  depositRequired: number
  proportionalAlloc: number
  hitLimit: boolean
}

export function calcScenarios(
  targetShares: number,
  competitions: number[],
  base: Omit<IpoCalcInput, 'competition'>,
): ScenarioRow[] {
  return competitions.map((c) => {
    const r = calcDepositFromTarget(targetShares, { ...base, competition: c })
    return {
      competition: c,
      actualSubscribe: r.actualSubscribe,
      depositRequired: r.depositRequired,
      proportionalAlloc: r.proportionalAlloc,
      hitLimit: r.hitLimit,
    }
  })
}

// ── localStorage 메모 ────────────────────
export interface IpoMemo {
  id: string
  ticker: string                  // 종목명 (사용자 입력)
  publicPrice: number
  competition?: number             // 마감 후 입력
  myDeposit: number
  expectedAllocation?: number      // 비례 + 균등
  subscriptionDate?: string        // YYYY-MM-DD
  paymentDate?: string
  refundDate?: string
  listingDate?: string             // 상장일
  notes?: string
  createdAt: string
}

export const STORAGE_KEY = 'youtil:ipo-memo:v1'

export function loadMemos(): IpoMemo[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as IpoMemo[]
  } catch { return [] }
}
export function saveMemos(memos: IpoMemo[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos))
  } catch { /* quota */ }
}

export function memosToCSV(memos: IpoMemo[]): string {
  const head = 'ticker,publicPrice,competition,myDeposit,expectedAllocation,subscriptionDate,paymentDate,refundDate,listingDate,notes,createdAt'
  const lines = memos.map((m) => {
    const esc = (s?: string) => `"${(s ?? '').replace(/"/g, '""')}"`
    return [
      esc(m.ticker),
      m.publicPrice,
      m.competition ?? '',
      m.myDeposit,
      m.expectedAllocation ?? '',
      m.subscriptionDate ?? '',
      m.paymentDate ?? '',
      m.refundDate ?? '',
      m.listingDate ?? '',
      esc(m.notes),
      m.createdAt,
    ].join(',')
  })
  return [head, ...lines].join('\n')
}

// D-day 계산
export function dDay(target?: string): { label: string; diff: number } | null {
  if (!target) return null
  const t = new Date(target).getTime()
  if (isNaN(t)) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const diff = Math.round((t - today) / (1000 * 60 * 60 * 24))
  if (diff === 0) return { label: 'D-DAY', diff }
  if (diff > 0) return { label: `D-${diff}`, diff }
  return { label: `D+${-diff}`, diff }
}

// ── 표시 헬퍼 ───────────────────────────
export function fmtKrw(n: number): string {
  if (!isFinite(n)) return '—'
  return Math.round(n).toLocaleString('ko-KR')
}
export function fmtKrwShort(n: number): string {
  if (!isFinite(n) || n === 0) return '0원'
  const abs = Math.abs(n)
  if (abs >= 100_000_000) {
    // 1.20억 → 1.2억, 1.00억 → 1억 (소수점 뒤 0만 제거)
    const v = (n / 100_000_000).toFixed(2).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
    return `${v}억`
  }
  if (abs >= 10_000) {
    // 5,000만 원·1,234만 원처럼 정수 표시 (천 단위 콤마)
    return `${Math.round(n / 10_000).toLocaleString()}만 원`
  }
  return `${Math.round(n).toLocaleString()}원`
}
