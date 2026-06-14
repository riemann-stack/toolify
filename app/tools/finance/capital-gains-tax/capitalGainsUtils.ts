/* 1세대1주택 양도소득세 계산 (2026 국세청 기준). 양도세 전용 — 누진세율은 lib/krIncomeTax 재사용.
   범위: 1주택 비과세(12억)·고가주택 안분·장기보유특별공제(표1/표2)·단기 중과(70/60%)·지방소득세 10%.
   범위 외(면책): 다주택 중과·일시적2주택·겸용주택·부수토지·비교과세 정밀·상생임대인 특례. */

import { progressiveTax } from '@/lib/krIncomeTax'

export const CG_HIGH_PRICE_THRESHOLD = 1_200_000_000 // 1세대1주택 비과세 한도(고가주택 경계) 12억
export const CG_BASIC_DEDUCTION = 2_500_000 // 양도소득기본공제 연 250만
export const CG_LOCAL_TAX_RATE = 0.1 // 지방소득세 = 산출세액 × 10%
export const CG_SHORT_UNDER1_RATE = 0.7 // 보유 1년 미만 단기 중과(주택·입주권·분양권)
export const CG_SHORT_UNDER2_RATE = 0.6 // 보유 1년~2년 미만 단기 중과(주택·입주권)

export type PropertyType = 'house' | 'presale' // 주택·조합원입주권 / 분양권

export interface CapitalGainsInput {
  salePrice: number       // 양도가액 A
  acquirePrice: number    // 취득가액 B
  expenses: number        // 필요경비 E
  holdYears: number       // 보유기간(년, 소수 가능)
  liveYears: number       // 거주기간(년)
  oneHouse: boolean       // 1세대1주택 여부
  liveReqMet: boolean     // 거주요건 충족(취득당시 조정대상지역이면 2년 거주 필요) — 자가입력
  propertyType: PropertyType
}

/** 장기보유특별공제 표1(일반): 보유 3년 6%, 매년 +2%, 15년 이상 30% */
export function ltsdTable1Rate(holdYears: number): number {
  if (holdYears < 3) return 0
  return Math.min(0.30, 0.02 * Math.floor(holdYears))
}

/** 표2(1세대1주택) 보유분: 3년 12%, 매년 +4%, 10년 이상 40% */
export function ltsdTable2HoldRate(holdYears: number): number {
  if (holdYears < 3) return 0
  return Math.min(0.40, 0.04 * Math.floor(holdYears))
}

/** 표2(1세대1주택) 거주분: 2~3년 8%(특례), 3년 12%, 매년 +4%, 10년 이상 40% */
export function ltsdTable2LiveRate(liveYears: number): number {
  if (liveYears < 2) return 0
  if (liveYears < 3) return 0.08
  return Math.min(0.40, 0.04 * Math.floor(liveYears))
}

export interface CapitalGainsResult {
  totalGain: number        // 전체 양도차익 Gtotal
  taxFree: boolean         // 전액 비과세(12억 이하·요건충족)
  taxableGain: number      // 과세대상 양도차익 G (고가주택 안분 후)
  highPriceApportioned: boolean // 12억 안분 적용 여부
  ltsdTable: 1 | 2 | 0     // 적용 장특공 표 (0 = 미적용/보유3년미만)
  ltsdRate: number         // 적용 공제율
  ltsd: number             // 장기보유특별공제액
  gainIncome: number       // 양도소득금액 Y
  taxBase: number          // 과세표준 TB
  shortTerm: 'under1' | 'under2' | null // 단기 중과 구분
  appliedRate: number      // 적용세율(단기율 또는 한계세율 표기용)
  computedTax: number      // 산출세액
  localTax: number         // 지방소득세
  totalTax: number         // 총 납부세액
  netGain: number          // 세후 실수령 차익
  effectiveRate: number    // 유효세율 (총세액/Gtotal)
}

export function calcCapitalGains(input: CapitalGainsInput): CapitalGainsResult {
  const A = Math.max(0, input.salePrice)
  const totalGain = Math.max(0, A - Math.max(0, input.acquirePrice) - Math.max(0, input.expenses))
  const isPresale = input.propertyType === 'presale'

  // 1) 비과세 게이트 + 과세대상 양도차익 (분양권은 비과세/안분 없음)
  let taxFree = false
  let taxableGain = totalGain
  let highPriceApportioned = false
  const eligibleNonTax = !isPresale && input.oneHouse && input.holdYears >= 2 && input.liveReqMet
  if (eligibleNonTax) {
    if (A <= CG_HIGH_PRICE_THRESHOLD) {
      taxFree = true
      taxableGain = 0
    } else if (A > 0) {
      taxableGain = totalGain * ((A - CG_HIGH_PRICE_THRESHOLD) / A) // 12억 안분
      highPriceApportioned = true
    }
  }

  // 2) 장기보유특별공제 (분양권 미적용)
  let ltsdTable: 1 | 2 | 0 = 0
  let ltsdRate = 0
  if (!isPresale && input.holdYears >= 3 && taxableGain > 0) {
    const useTable2 = input.oneHouse && input.liveReqMet && input.liveYears >= 2
    if (useTable2) {
      ltsdTable = 2
      ltsdRate = Math.min(0.80, ltsdTable2HoldRate(input.holdYears) + ltsdTable2LiveRate(input.liveYears))
    } else {
      ltsdTable = 1
      ltsdRate = ltsdTable1Rate(input.holdYears)
    }
  }
  const ltsd = Math.round(taxableGain * ltsdRate)
  const gainIncome = Math.max(0, taxableGain - ltsd)

  // 3) 기본공제 → 과세표준
  const taxBase = Math.max(0, gainIncome - CG_BASIC_DEDUCTION)

  // 4) 세율 (보유기간 구간 직접 적용 — 비교과세 단순화)
  let shortTerm: 'under1' | 'under2' | null = null
  let appliedRate = 0
  let computedTax = 0
  if (input.holdYears < 1) {
    shortTerm = 'under1'
    appliedRate = CG_SHORT_UNDER1_RATE
    computedTax = Math.round(taxBase * CG_SHORT_UNDER1_RATE)
  } else if (input.holdYears < 2) {
    shortTerm = 'under2'
    appliedRate = CG_SHORT_UNDER2_RATE
    computedTax = Math.round(taxBase * CG_SHORT_UNDER2_RATE)
  } else {
    // 보유 2년 이상 → 기본 누진세율 (분양권 2년 이상도 본 도구는 기본세율로 단순화)
    computedTax = Math.round(progressiveTax(taxBase))
    appliedRate = taxBase > 0 ? computedTax / taxBase : 0 // 표기용 평균세율(한계세율은 UI에서 marginalRate)
  }

  const localTax = Math.round(computedTax * CG_LOCAL_TAX_RATE)
  const totalTax = computedTax + localTax
  const netGain = totalGain - totalTax
  const effectiveRate = totalGain > 0 ? totalTax / totalGain : 0

  return {
    totalGain, taxFree, taxableGain, highPriceApportioned,
    ltsdTable, ltsdRate, ltsd, gainIncome, taxBase,
    shortTerm, appliedRate, computedTax, localTax, totalTax, netGain, effectiveRate,
  }
}
