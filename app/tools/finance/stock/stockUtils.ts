/* ──────────────────────────────────────────────────────
   finance/stock/stockUtils.ts
   주식 물타기 — 평단 계산·역산·분할매수·회복 시나리오·손절 비교
   ※ 본 도구는 수학적 시뮬레이션이며 투자 자문·매수 권유 도구가 아닙니다.
   ────────────────────────────────────────────────────── */

/* ─── 한국 증권사 수수료 (2026년 표준, 단위: %) ─── */
export interface BrokerFee {
  id: string
  name: string
  rate: number     // 매수 수수료율 (%)
  desc?: string
}

export const KOREA_BROKER_FEES: BrokerFee[] = [
  { id: 'kiwoom',    name: '키움증권',     rate: 0.015 },
  { id: 'samsung',   name: '삼성증권',     rate: 0.014 },
  { id: 'mirae',     name: '미래에셋',     rate: 0.014 },
  { id: 'kb',        name: 'KB증권',       rate: 0.015 },
  { id: 'shinhan',   name: '신한투자',     rate: 0.015 },
  { id: 'naver-pay', name: '네이버페이',   rate: 0.0066 },
  { id: 'toss',      name: '토스증권',     rate: 0.015 },
  { id: 'free',      name: '평생 무료',    rate: 0,     desc: '이벤트 가입자' },
  { id: 'custom',    name: '직접 입력',    rate: 0 },
]

/* ─── 한국 증권거래세 (2026년 매도 시) ─── */
// 2026.1.1~ 금투세 폐지로 2023년 수준 환원: 코스피 0.05%+농특세 0.15%=0.20%, 코스닥 0.20% → 둘 다 0.20%
export const KR_TRANSACTION_TAX_RATE = 0.0020  // 코스피·코스닥 0.20%

/* ─── 미국 주식 세금 ─── */
export const US_STOCK = {
  capitalGainsRate: 0.22,
  annualDeduction: 2_500_000,
  desc: '해외주식 양도소득세 — 연 250만원 공제 후 22%',
}

/* ─── 회복 시나리오 (현재가 기준 등락률) ─── */
export const RECOVERY_DELTAS = [-30, -20, -10, -5, 0, 5, 10, 20, 30, 50, 100]

/* ─── 분할 매수 추천 ─── */
export interface DCAReco {
  lossMin: number
  lossMax: number
  tranches: number
  desc: string
}

export const DCA_RECOMMENDATIONS: DCAReco[] = [
  { lossMin: -100, lossMax: -50, tranches: 5, desc: '큰 손실 — 5차 분할 또는 손절 검토' },
  { lossMin: -50,  lossMax: -30, tranches: 5, desc: '큰 손실 — 5차 분할 권장' },
  { lossMin: -30,  lossMax: -15, tranches: 3, desc: '중간 손실 — 3차 분할 권장' },
  { lossMin: -15,  lossMax: -5,  tranches: 2, desc: '소폭 손실 — 2차 분할' },
  { lossMin: -5,   lossMax: 100, tranches: 1, desc: '손실 적음 — 단일 매수 충분' },
]

export function recommendDCA(lossPct: number): DCAReco {
  return DCA_RECOMMENDATIONS.find(r => lossPct >= r.lossMin && lossPct < r.lossMax)
    ?? DCA_RECOMMENDATIONS[DCA_RECOMMENDATIONS.length - 1]
}

/* ─── 종목 비중 단계 ─── */
export interface ConcentrationLevel {
  min: number      // % (포함)
  max: number      // % (미포함)
  level: 'safe' | 'warn' | 'risk' | 'danger'
  label: string
  color: string
  note: string
}

export const CONCENTRATION_LEVELS: ConcentrationLevel[] = [
  { min: 0,  max: 10, level: 'safe',   label: '🟢 안전',       color: '#059669', note: '한 종목 10% 이내 — 분산 투자 적정' },
  { min: 10, max: 20, level: 'warn',   label: '🟡 주의',       color: '#CA8A04', note: '한 종목 10~20% — 약간 집중' },
  { min: 20, max: 30, level: 'risk',   label: '🟠 집중 위험',  color: '#EA580C', note: '20% 이상 — 추가 매수는 신중히' },
  { min: 30, max: Infinity, level: 'danger', label: '🔴 매우 위험', color: '#DC2626', note: '30% 이상 — 분산 권장 / 추가 매수 비권장' },
]

export function getConcentrationLevel(pct: number): ConcentrationLevel {
  return CONCENTRATION_LEVELS.find(l => pct >= l.min && pct < l.max) ?? CONCENTRATION_LEVELS[0]
}

/* ─── 메인 평단 계산 ─── */
export interface AverageDownInput {
  currentAvg: number       // 기존 평단가
  currentShares: number    // 기존 보유 수량
  currentPrice: number     // 현재 주가
  addPrice: number         // 추가 매수가
  addShares: number        // 추가 매수 수량
  feeRate: number          // 매수 수수료율 (%, 0.015 = 0.015%)
  isUsStock?: boolean
  buyExchangeRate?: number // 매수 시 환율
  curExchangeRate?: number // 현재 환율
}

export interface AverageDownResult {
  newAvg: number
  newShares: number
  totalInvestment: number
  currentValue: number
  unrealizedPL: number
  unrealizedROI: number
  beforeROI: number
  breakEvenPrice: number   // 본전 (수수료·세금 포함)
  breakEvenRise: number    // % (현재가 → 본전)
  totalBuyFees: number
  totalSellFeesAtBE: number
  /* 환율 / 미국주식 */
  krwTotalInvestment?: number
  krwCurrentValue?: number
  krwUnrealizedPL?: number
}

export function calcAverageDown(input: AverageDownInput): AverageDownResult {
  const buyFeeRate = input.feeRate / 100
  const sellTax = input.isUsStock ? 0 : KR_TRANSACTION_TAX_RATE
  const sellFeeRate = buyFeeRate + sellTax

  const oldGross = input.currentAvg * input.currentShares
  const oldFees = oldGross * buyFeeRate
  const newGross = input.addPrice * input.addShares
  const newFees = newGross * buyFeeRate

  const totalInvestment = oldGross + oldFees + newGross + newFees
  const newShares = input.currentShares + input.addShares
  const newAvg = newShares > 0 ? totalInvestment / newShares : 0

  const currentValue = input.currentPrice * newShares
  const unrealizedPL = currentValue - totalInvestment
  const unrealizedROI = totalInvestment > 0 ? (unrealizedPL / totalInvestment) * 100 : 0

  const oldOnlyInvestment = oldGross + oldFees
  const oldCurrentValue = input.currentPrice * input.currentShares
  const beforeROI = oldOnlyInvestment > 0 ? ((oldCurrentValue - oldOnlyInvestment) / oldOnlyInvestment) * 100 : 0

  // 본전: 매도 시 수수료+거래세 차감 후 totalInvestment 회수
  // (sellPrice × shares) × (1 − sellFeeRate) = totalInvestment
  // → sellPrice = newAvg / (1 − sellFeeRate)
  const breakEvenPrice = newAvg / (1 - sellFeeRate)
  const breakEvenRise = input.currentPrice > 0 ? (breakEvenPrice / input.currentPrice - 1) * 100 : 0

  const result: AverageDownResult = {
    newAvg: Math.round(newAvg * 100) / 100,
    newShares,
    totalInvestment: Math.round(totalInvestment),
    currentValue: Math.round(currentValue),
    unrealizedPL: Math.round(unrealizedPL),
    unrealizedROI: Math.round(unrealizedROI * 100) / 100,
    beforeROI: Math.round(beforeROI * 100) / 100,
    breakEvenPrice: Math.round(breakEvenPrice * 100) / 100,
    breakEvenRise: Math.round(breakEvenRise * 100) / 100,
    totalBuyFees: Math.round(oldFees + newFees),
    totalSellFeesAtBE: Math.round(breakEvenPrice * newShares * sellFeeRate),
  }

  if (input.isUsStock && input.buyExchangeRate && input.curExchangeRate) {
    // 단순화: 기존 평단의 환율은 buyExchangeRate, 추가 매수도 currentExchangeRate
    // 더 정확하게는 양쪽 모두 buyExchangeRate 가정 (사용자가 평단 자체를 USD로 입력했다면 환율은 별도 처리)
    const krwTotal = oldGross * input.buyExchangeRate + oldFees * input.buyExchangeRate
                   + newGross * input.curExchangeRate + newFees * input.curExchangeRate
    const krwCur = input.currentPrice * newShares * input.curExchangeRate
    result.krwTotalInvestment = Math.round(krwTotal)
    result.krwCurrentValue = Math.round(krwCur)
    result.krwUnrealizedPL = Math.round(krwCur - krwTotal)
  }

  return result
}

/* ─── 목표 평단 역산 ─── */
export interface ReverseInput {
  currentAvg: number
  currentShares: number
  currentPrice: number
  targetAvg: number
}

export interface ReverseResult {
  requiredShares: number | null
  requiredAmount: number | null
  reasonable: boolean
  warning?: string
  totalSharesAfter?: number
  totalInvestmentAfter?: number
  breakEvenRiseAfter?: number
}

export function reverseCalcShares(input: ReverseInput): ReverseResult {
  if (input.targetAvg <= input.currentPrice) {
    return {
      requiredShares: null, requiredAmount: null, reasonable: false,
      warning: '목표 평단가가 현재가보다 낮거나 같습니다 — 현재가에 추가 매수해도 평단은 현재가보다 낮아질 수 없어 도달 불가능합니다.',
    }
  }
  if (input.targetAvg >= input.currentAvg) {
    return {
      requiredShares: null, requiredAmount: null, reasonable: false,
      warning: '목표 평단가가 기존 평단가보다 높거나 같습니다 — 물타기의 의미가 없습니다.',
    }
  }
  // (avg₀·N₀ + cur·X) / (N₀ + X) = target
  // → X = N₀ · (avg₀ − target) / (target − cur)
  const x = input.currentShares * (input.currentAvg - input.targetAvg) / (input.targetAvg - input.currentPrice)
  const requiredShares = Math.ceil(x)
  const requiredAmount = requiredShares * input.currentPrice

  const totalShares = input.currentShares + requiredShares
  const totalInvestment = input.currentAvg * input.currentShares + requiredShares * input.currentPrice
  const breakEvenRise = input.currentPrice > 0 ? (input.targetAvg / input.currentPrice - 1) * 100 : 0

  return {
    requiredShares,
    requiredAmount: Math.round(requiredAmount),
    reasonable: true,
    totalSharesAfter: totalShares,
    totalInvestmentAfter: Math.round(totalInvestment),
    breakEvenRiseAfter: Math.round(breakEvenRise * 100) / 100,
  }
}

/* ─── 분할 매수 시뮬 ─── */
export interface Tranche {
  price: number
  amount: number    // 원, 매수 금액
}

export interface DCAStep {
  tranche: number
  price: number
  amount: number
  shares: number
  cumulativeShares: number
  cumulativeInvestment: number
  cumulativeAvg: number
  unrealizedROI: number   // 그 차수 매수가 기준
}

export function simulateDCA(
  initial: { avg: number; shares: number },
  tranches: Tranche[],
  feeRate: number,
): DCAStep[] {
  const buyFeeRate = feeRate / 100
  const result: DCAStep[] = []
  let cumShares = initial.shares
  let cumInvestment = initial.avg * initial.shares * (1 + buyFeeRate)

  result.push({
    tranche: 0,
    price: initial.avg,
    amount: Math.round(cumInvestment),
    shares: initial.shares,
    cumulativeShares: cumShares,
    cumulativeInvestment: Math.round(cumInvestment),
    cumulativeAvg: Math.round(initial.avg * 100) / 100,
    unrealizedROI: 0,
  })

  for (let i = 0; i < tranches.length; i++) {
    const t = tranches[i]
    if (t.price <= 0 || t.amount <= 0) continue
    const shares = Math.floor(t.amount / t.price)
    const investment = shares * t.price * (1 + buyFeeRate)
    cumShares += shares
    cumInvestment += investment
    const cumAvg = cumShares > 0 ? cumInvestment / cumShares : 0
    const roi = cumAvg > 0 ? ((t.price - cumAvg) / cumAvg) * 100 : 0
    result.push({
      tranche: i + 1,
      price: t.price,
      amount: Math.round(investment),
      shares,
      cumulativeShares: cumShares,
      cumulativeInvestment: Math.round(cumInvestment),
      cumulativeAvg: Math.round(cumAvg * 100) / 100,
      unrealizedROI: Math.round(roi * 100) / 100,
    })
  }
  return result
}

/* ─── 손절 vs 물타기 비교 ─── */
export interface CompareInput {
  currentAvg: number
  currentShares: number
  currentPrice: number
  additionalCash: number
  alternativeReturn: number   // %, 1년
  recoveryAssumption: number  // 본 종목 회복 가정 가격
  feeRate: number             // %
  isUsStock?: boolean         // 미국 주식이면 한국 거래세 미적용 (양도세·환율은 미반영)
}

export interface CompareResult {
  avgDown: {
    finalValue: number
    totalInvested: number
    profit: number
    profitPct: number
    newAvg: number
    newShares: number
  }
  cutLoss: {
    realizedLoss: number
    finalValue: number
    totalInvested: number
    netProfit: number
    netProfitPct: number
  }
  avgDownIsBetter: boolean
  differenceAbs: number
}

export function compareCutVsAvgDown(input: CompareInput): CompareResult {
  const buyFeeRate = input.feeRate / 100
  const sellTax = input.isUsStock ? 0 : KR_TRANSACTION_TAX_RATE
  const sellNet = 1 - buyFeeRate - sellTax

  // A. 물타기
  const avgDownNewShares = Math.floor(input.additionalCash / input.currentPrice)
  const avgDownInvest = input.currentAvg * input.currentShares * (1 + buyFeeRate)
                      + avgDownNewShares * input.currentPrice * (1 + buyFeeRate)
  const avgDownTotalShares = input.currentShares + avgDownNewShares
  const avgDownNewAvg = avgDownTotalShares > 0 ? avgDownInvest / avgDownTotalShares : 0
  const avgDownFinal = avgDownTotalShares * input.recoveryAssumption * sellNet  // 매도 시점
  const avgDownProfit = avgDownFinal - avgDownInvest
  const avgDownProfitPct = avgDownInvest > 0 ? (avgDownProfit / avgDownInvest) * 100 : 0

  // B. 손절 + 대안
  const cutSellNet = input.currentShares * input.currentPrice * sellNet
  const oldInvested = input.currentAvg * input.currentShares * (1 + buyFeeRate)
  const realizedLoss = cutSellNet - oldInvested  // 음수
  const totalInAlt = cutSellNet + input.additionalCash
  const altFinal = totalInAlt * (1 + input.alternativeReturn / 100)
  const totalInvestedB = oldInvested + input.additionalCash
  const netProfit = altFinal - totalInvestedB
  const netProfitPct = totalInvestedB > 0 ? (netProfit / totalInvestedB) * 100 : 0

  return {
    avgDown: {
      finalValue: Math.round(avgDownFinal),
      totalInvested: Math.round(avgDownInvest),
      profit: Math.round(avgDownProfit),
      profitPct: Math.round(avgDownProfitPct * 100) / 100,
      newAvg: Math.round(avgDownNewAvg * 100) / 100,
      newShares: avgDownTotalShares,
    },
    cutLoss: {
      realizedLoss: Math.round(realizedLoss),
      finalValue: Math.round(altFinal),
      totalInvested: Math.round(totalInvestedB),
      netProfit: Math.round(netProfit),
      netProfitPct: Math.round(netProfitPct * 100) / 100,
    },
    avgDownIsBetter: avgDownProfit > netProfit,
    differenceAbs: Math.round(Math.abs(avgDownProfit - netProfit)),
  }
}

/* ─── 회복 시나리오 ─── */
export interface RecoveryRow {
  delta: number          // %
  price: number
  value: number
  pl: number
  roi: number
}

export function calcRecoveryScenarios(
  newAvg: number, totalShares: number, currentPrice: number, totalInvestment: number,
  deltas: number[] = RECOVERY_DELTAS,
): RecoveryRow[] {
  return deltas.map(delta => {
    const price = currentPrice * (1 + delta / 100)
    const value = price * totalShares
    const pl = value - totalInvestment
    const roi = totalInvestment > 0 ? (pl / totalInvestment) * 100 : 0
    return {
      delta,
      price: Math.round(price * 100) / 100,
      value: Math.round(value),
      pl: Math.round(pl),
      roi: Math.round(roi * 100) / 100,
    }
  })
}

/* ─── 매수 금액 슬라이더용 — 0~max 사이 N개 점에서의 새 평단·본전 ─── */
export interface SliderPoint {
  amount: number
  shares: number
  newAvg: number
  breakEvenRise: number
  unrealizedROI: number
}

export function buildSliderCurve(
  base: { currentAvg: number; currentShares: number; currentPrice: number; feeRate: number },
  maxAmount: number, points = 50,
): SliderPoint[] {
  const result: SliderPoint[] = []
  for (let i = 0; i <= points; i++) {
    const amount = (maxAmount * i) / points
    const shares = Math.floor(amount / base.currentPrice)
    const r = calcAverageDown({
      currentAvg: base.currentAvg, currentShares: base.currentShares,
      currentPrice: base.currentPrice, addPrice: base.currentPrice,
      addShares: shares, feeRate: base.feeRate,
    })
    result.push({
      amount: Math.round(amount),
      shares,
      newAvg: r.newAvg,
      breakEvenRise: r.breakEvenRise,
      unrealizedROI: r.unrealizedROI,
    })
  }
  return result
}

/* ─── 포맷 ─── */
export function won(n: number): string {
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

export function formatEok(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000)
    const man = Math.floor((abs % 100_000_000) / 10_000)
    return man > 0 ? `${sign}${eok}억 ${man.toLocaleString()}만원` : `${sign}${eok}억원`
  }
  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만원`
  }
  return won(n)
}

export function formatKRW(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}

export function formatPct(n: number, withSign = true): string {
  const sign = n > 0 && withSign ? '+' : ''
  return sign + n.toFixed(2) + '%'
}

export function parseAmount(s: string): number {
  if (!s) return 0
  const cleaned = s.replace(/[^\d.\-]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : 0
}
