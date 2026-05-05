/* 경매 총비용 계산기 — 데이터·계산 유틸 */

export type PropertyType = 'apt' | 'villa' | 'house' | 'office' | 'shop' | 'land'
export type OwnerType = 'live1' | 'own1' | 'multi2' | 'multi3' | 'corp'
export type Region = 'normal' | 'adjusted' | 'speculative'

/* 부동산 종류 메타 */
export interface PropertyMeta {
  id: PropertyType
  emoji: string
  label: string
  shortLabel: string
  isHouse: boolean   // 주택 여부 (취득세 차등 적용)
}

export const PROPERTIES: PropertyMeta[] = [
  { id: 'apt',    emoji: '🏢', label: '아파트',          shortLabel: '아파트',  isHouse: true  },
  { id: 'villa',  emoji: '🏘️', label: '빌라·다세대',      shortLabel: '빌라',    isHouse: true  },
  { id: 'house',  emoji: '🏠', label: '단독주택',         shortLabel: '단독',    isHouse: true  },
  { id: 'office', emoji: '🏬', label: '오피스텔',         shortLabel: '오피',    isHouse: false },
  { id: 'shop',   emoji: '🏪', label: '상가·근린생활',    shortLabel: '상가',    isHouse: false },
  { id: 'land',   emoji: '🌳', label: '토지',             shortLabel: '토지',    isHouse: false },
]

export const getProperty = (id: PropertyType) => PROPERTIES.find((p) => p.id === id)!

/* 명의 유형 */
export interface OwnerMeta {
  id: OwnerType
  label: string
  shortLabel: string
  desc: string
}

export const OWNERS: OwnerMeta[] = [
  { id: 'live1',   label: '실거주 1주택',          shortLabel: '실거주 1주택', desc: '본인 실거주, 무주택 → 1주택' },
  { id: 'own1',    label: '1주택 보유 → 2주택',     shortLabel: '2주택',        desc: '기존 1주택 보유 + 추가 매수' },
  { id: 'multi2',  label: '다주택 (2~3주택)',       shortLabel: '다주택',       desc: '기존 2주택 → 3주택+' },
  { id: 'multi3',  label: '다주택 (4주택+)',        shortLabel: '4주택+',       desc: '4주택 이상 보유' },
  { id: 'corp',    label: '법인 명의',              shortLabel: '법인',         desc: '법인 단일 세율' },
]

export const getOwner = (id: OwnerType) => OWNERS.find((o) => o.id === id)!

/* 지역 */
export interface RegionMeta {
  id: Region
  label: string
  surcharge: number   // 다주택 가산세 (조정대상 +4%, 투기과열 +4%)
}

export const REGIONS: RegionMeta[] = [
  { id: 'normal',     label: '비규제지역',     surcharge: 0  },
  { id: 'adjusted',   label: '조정대상지역',    surcharge: 4  },
  { id: 'speculative', label: '투기과열지구',   surcharge: 4  },
]

/* ─────────────────────────────────────────────
   취득세 계산 (2025~2026 일반 가이드)
   세율 = 취득세 + 지방교육세 + 농어촌특별세 통합
   ───────────────────────────────────────────── */

/**
 * 취득세 자동 계산 (만원 단위 입력 → 세액 만원 반환)
 * 1주택 (실거주):
 *  - 6억 이하: 1.1%
 *  - 6~9억:   2.2%
 *  - 9억 초과: 3.3%
 * 2주택: 8% (조정 +4 = 12%)
 * 3주택+: 12% (조정 동일)
 * 법인: 12% (전 지역)
 * 오피스텔·상가·토지: 4.6%
 */
export function calcAcquisitionTax(
  priceMan: number,
  property: PropertyType,
  owner: OwnerType,
  region: Region,
): number {
  const meta = getProperty(property)
  const priceEok = priceMan / 10000 // 억원 단위

  /* 비주택은 단일 세율 4.6% */
  if (!meta.isHouse) {
    return priceMan * 0.046
  }

  /* 법인은 12% */
  if (owner === 'corp') {
    return priceMan * 0.12
  }

  /* 다주택 가산 */
  const regionMeta = REGIONS.find((r) => r.id === region)!
  if (owner === 'multi3') {
    return priceMan * 0.12  // 4주택+ 조정 무관 12%
  }
  if (owner === 'multi2') {
    const baseRate = 8 + regionMeta.surcharge  // 조정 +4 = 12
    return priceMan * (baseRate / 100)
  }
  if (owner === 'own1') {
    /* 1주택 → 2주택: 조정대상이면 8%, 비규제면 일반 1주택 세율 */
    if (region === 'normal') {
      // 비규제: 일반 1주택과 동일
      if (priceEok <= 6) return priceMan * 0.011
      if (priceEok <= 9) return priceMan * 0.022
      return priceMan * 0.033
    }
    return priceMan * 0.08
  }

  /* 실거주 1주택 (live1) */
  if (priceEok <= 6) return priceMan * 0.011
  if (priceEok <= 9) return priceMan * 0.022
  return priceMan * 0.033
}

/** 취득세율 % 조회 (UI 표시용) */
export function getAcquisitionRate(priceMan: number, property: PropertyType, owner: OwnerType, region: Region): number {
  const tax = calcAcquisitionTax(priceMan, property, owner, region)
  return priceMan > 0 ? (tax / priceMan) * 100 : 0
}

/* ─────────────────────────────────────────────
   기타 자동 추정 비용 (만원 단위)
   ───────────────────────────────────────────── */

/** 법무비: 낙찰가 × 0.2%, 최소 30만원, 최대 200만원 */
export function calcLegalFee(priceMan: number): number {
  return Math.max(30, Math.min(priceMan * 0.002, 200))
}

/** 인지세: 1억당 7만원, 최대 15만원 */
export function calcStampTax(priceMan: number): number {
  const eok = priceMan / 10000
  if (eok < 1) return 1
  if (eok < 10) return Math.min(eok * 7, 15)
  return 35  // 10억+ 35만원
}

/** 국민주택채권: 낙찰가 × 약 2% (시가표준 기반), 즉시 매도 시 약 0.5% 손실 */
export function calcHousingBond(priceMan: number, property: PropertyType): number {
  const meta = getProperty(property)
  /* 주택은 1.3~3.1% 누진, 평균 2% */
  /* 비주택은 2~5% 더 높음 */
  const rate = meta.isHouse ? 0.005 : 0.012  // 즉시 매도 시 실제 손실액 기준
  return priceMan * rate
}

/* ─────────────────────────────────────────────
   비용 항목
   ───────────────────────────────────────────── */

export interface CostItem {
  id: string
  emoji: string
  label: string
  desc: string
  defaultMan: number
  isAuto: boolean         // 자동 추정 가능 여부
  category: 'tax' | 'legal' | 'auction' | 'extra'
  saveTip?: string        // 절감 팁
}

export const COST_ITEMS: CostItem[] = [
  /* 자동 추정 — 세금·법무 */
  { id: 'tax_acq',  emoji: '🏛️', label: '취득세 (지방교육·농특 포함)',  desc: '주택 1.1~12%, 비주택 4.6%', defaultMan: 0, isAuto: true, category: 'tax',
    saveTip: '실거주 1주택 비과세·신혼부부·청년 특례로 50% 감면 가능' },
  { id: 'legal',    emoji: '⚖️', label: '법무비 (등기 위임)',             desc: '낙찰가 × 0.2%, 30~200만원',  defaultMan: 0, isAuto: true, category: 'legal',
    saveTip: '셀프 등기 시 0원 (난이도 ★★★, 시간 5~10시간)' },
  { id: 'stamp',    emoji: '📋', label: '인지세',                        desc: '1억당 7만원, 최대 35만원',   defaultMan: 0, isAuto: true, category: 'tax' },
  { id: 'bond',     emoji: '🎟️', label: '국민주택채권 (즉시 매도 손실)',   desc: '주택 0.5% / 비주택 1.2%',   defaultMan: 0, isAuto: true, category: 'tax',
    saveTip: '5년 보유 시 손실 회피 가능 (이자 수익 있음)' },

  /* 경매 특화 — 수동 입력 */
  { id: 'eviction', emoji: '🚪', label: '명도비 (이사비·강제집행)',       desc: '50~500만원, 평균 200만원',  defaultMan: 200, isAuto: false, category: 'auction',
    saveTip: '이사비 협상 시 50~70% 절감, 강제집행은 최후 수단' },
  { id: 'mngfee',   emoji: '💸', label: '체납 관리비',                   desc: '평균 100~500만원',           defaultMan: 100, isAuto: false, category: 'auction',
    saveTip: '입찰 전 관리사무소 방문해 정확한 금액 확인 필수' },
  { id: 'utility',  emoji: '⚡', label: '체납 공과금 (전기·수도·가스)',    desc: '대부분 100만원 이내',         defaultMan: 30, isAuto: false, category: 'auction' },
  { id: 'repair',   emoji: '🔨', label: '수리비 (도배·바닥·주방·욕실)',     desc: '평당 30~100만원, 노후 시 ↑', defaultMan: 500, isAuto: false, category: 'auction',
    saveTip: 'DIY·셀프 인테리어 시 30~50% 절감 가능' },
  { id: 'broker',   emoji: '🤝', label: '중개수수료',                     desc: '경매는 보통 0, 매매 0.4~0.9%', defaultMan: 0, isAuto: false, category: 'extra' },
  { id: 'extra',    emoji: '📦', label: '기타 (감정·자문·세무)',          desc: '전문가 자문 필요 시',         defaultMan: 50, isAuto: false, category: 'extra' },
]

export const AUTO_ITEMS = COST_ITEMS.filter((c) => c.isAuto)
export const MANUAL_ITEMS = COST_ITEMS.filter((c) => !c.isAuto)

/* ─────────────────────────────────────────────
   대출 (LTV·DSR)
   ───────────────────────────────────────────── */

export interface LoanResult {
  ltvLimit: number       // LTV 한도 만원
  dsrLimit: number       // DSR 한도 만원
  loanAmount: number     // 실제 가능 대출 (둘 중 작은 값)
  monthlyPayment: number // 월 원리금 만원
  ownEquity: number      // 자기자본 필요 만원
  shortage: number       // 현금 부족액 (음수면 충분)
  capacityType: 'ltv' | 'dsr'
}

/**
 * 원리금 균등 상환 월 납입액 (만원)
 * P × r / (1 - (1+r)^-n)
 */
export function monthlyPayment(principalMan: number, annualRatePct: number, years: number): number {
  const n = years * 12
  const r = annualRatePct / 100 / 12
  if (r === 0) return principalMan / n
  return (principalMan * r) / (1 - Math.pow(1 + r, -n))
}

/**
 * 가능 대출 = min(LTV 한도, DSR 한도)
 * DSR = (월 신규 + 기존) × 12 / 연소득 ≤ 0.40
 *  → 가능 월 상환액 = 연소득 × 0.40 / 12 - 기존 월 상환
 *  → DSR 가능 원금 = monthlyPayment 역산
 */
export function calcLoan(
  totalCostMan: number,
  ltvPct: number,
  ratePct: number,
  years: number,
  annualIncomeMan: number,
  existingMonthlyMan: number,
): LoanResult {
  const ltvLimit = totalCostMan * (ltvPct / 100)

  /* DSR 가능 월 상환 */
  const maxMonthlyDsr = Math.max(0, (annualIncomeMan * 0.40 / 12) - existingMonthlyMan)
  /* DSR 한도 원금 (역산: monthlyPayment의 역공식) */
  const r = ratePct / 100 / 12
  const n = years * 12
  let dsrLimit: number
  if (r === 0) {
    dsrLimit = maxMonthlyDsr * n
  } else {
    dsrLimit = (maxMonthlyDsr * (1 - Math.pow(1 + r, -n))) / r
  }

  const loanAmount = Math.min(ltvLimit, dsrLimit)
  const capacityType: 'ltv' | 'dsr' = ltvLimit <= dsrLimit ? 'ltv' : 'dsr'
  const monthly = monthlyPayment(loanAmount, ratePct, years)
  const ownEquity = Math.max(0, totalCostMan - loanAmount)
  const shortage = ownEquity  // 사용자 보유 현금은 별도 입력으로 처리

  return {
    ltvLimit,
    dsrLimit: Math.max(0, dsrLimit),
    loanAmount: Math.max(0, loanAmount),
    monthlyPayment: monthly,
    ownEquity,
    shortage,
    capacityType,
  }
}

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtMan(man: number): string {
  if (Math.abs(man) >= 10000) {
    const eok = man / 10000
    return `${fmt(eok, eok < 10 ? 2 : 1)}억`
  }
  return `${fmt(man, 0)}만원`
}
