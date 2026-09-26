/* 경매 비용 계산기 — 데이터·계산 유틸 */

import {
  calcHouseAcquisitionTax, calcNonHouseAcquisitionTax, type AcqTaxBreakdown,
} from '@/lib/krAcquisitionTax'
import * as loanRules from '@/lib/krLoanRules'

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

/** 주택 여부 — 잘못된 id(손상된 localStorage 등)에도 크래시 없이 false */
export const isHouseType = (id: PropertyType): boolean => PROPERTIES.find((p) => p.id === id)?.isHouse ?? false

/* enum 가드 — localStorage 복원 검증용 (CLAUDE.md: 무검증 as T 금지) */
export const isPropertyType = (v: unknown): v is PropertyType => PROPERTIES.some((p) => p.id === v)

/* 명의 유형 */
export interface OwnerMeta {
  id: OwnerType
  label: string
  shortLabel: string
  desc: string
}

/* 라벨은 모두 '이번 낙찰로 몇 번째 주택이 되는가(취득 후 주택 수)' 기준 — 보유 수로 읽혀 한 단계 낮게 고르는 오류 방지 */
export const OWNERS: OwnerMeta[] = [
  { id: 'live1',   label: '무주택 → 1주택',             shortLabel: '1주택',     desc: '지금 집이 없고 이번 낙찰로 첫 주택 취득' },
  { id: 'own1',    label: '1주택 보유 → 2주택째',       shortLabel: '2주택째',   desc: '지금 1채 보유, 이번 낙찰로 2주택' },
  { id: 'multi2',  label: '2주택 보유 → 3주택째',       shortLabel: '3주택째',   desc: '지금 2채 보유, 이번 낙찰로 3주택' },
  { id: 'multi3',  label: '3주택 이상 보유 → 4주택째+', shortLabel: '4주택째+',  desc: '지금 3채 이상 보유, 이번 낙찰로 4주택 이상' },
  { id: 'corp',    label: '법인 명의',                  shortLabel: '법인',      desc: '법인 취득 — 주택 수와 무관하게 중과' },
]

export const getOwner = (id: OwnerType) => OWNERS.find((o) => o.id === id)!
export const isOwnerType = (v: unknown): v is OwnerType => OWNERS.some((o) => o.id === v)

/* 지역 */
export interface RegionMeta {
  id: Region
  label: string
}

/* 취득세 중과 판단에는 '조정대상지역' 여부만 쓰인다 (지방세법 §13의2). 투기과열지구는 조정대상지역으로 함께 지정됨 */
export const REGIONS: RegionMeta[] = [
  { id: 'normal',     label: '비규제지역' },
  { id: 'adjusted',   label: '조정대상지역' },
  { id: 'speculative', label: '투기과열지구' },
]
export const isRegion = (v: unknown): v is Region => REGIONS.some((r) => r.id === v)

/* ─────────────────────────────────────────────
   취득세 — 단일 소스 lib/krAcquisitionTax.ts (지방세법 §11·§13의2, 지방교육세 §151, 농특세)
   이 도구는 전용면적을 묻지 않으므로 **전용 85㎡ 이하**(농어촌특별세 비과세)로 계산한다.
   · 1주택: 1~3% + 지방교육세(취득세율의 10%) → 1.1~3.3% (6~9억은 0.01%p 단위 반올림 세율)
   · 1주택 보유 → 2주택: 비조정 표준세율 / 조정·투기과열 8% + 0.4% (일시적 2주택 특례는 미반영 — 해당 시 '실거주 1주택'과 같음)
   · 2주택 → 3주택: 비조정 8.4% / 조정 12.4%   · 4주택+·법인: 12.4%
   · 오피스텔·상가·토지(비주택): 4% + 교육세 0.4% + 농특세 0.2% = 4.6%
   · 저가주택 중과 제외(지방세법 시행령 §28의2 1호): 시가표준액(공시가격) 1억 이하(2025.1.2 이후 비수도권은 2억 이하,
     정비구역 등 제외) 주택은 다주택·법인이어도 표준세율 — 사용자가 체크(lowValue)하면 lib lowValueHouse로 전달
   ───────────────────────────────────────────── */

const OWNER_HOME_COUNT: Record<Exclude<OwnerType, 'corp'>, number> = {
  live1: 1, own1: 2, multi2: 3, multi3: 4,
}

/** 취득세 세목별 내역 (만원 입력 → 원 단위 내역)
 *  lowValue: 시가표준액(공시가격) 1억 이하·비수도권 2억 이하 주택 → 중과 제외(표준세율) */
export function acquisitionTaxBreakdown(
  priceMan: number,
  property: PropertyType,
  owner: OwnerType,
  region: Region,
  lowValue = false,
): AcqTaxBreakdown {
  const priceWon = Math.max(0, priceMan) * 10_000
  if (!isHouseType(property)) return calcNonHouseAcquisitionTax(priceWon)
  // lowValue 라벨('시가표준액 1억(비수도권 2억) 이하 — …')은 lib가 제공
  return calcHouseAcquisitionTax({
    price: priceWon,
    homeCount: owner === 'corp' ? 1 : (OWNER_HOME_COUNT[owner] ?? 1),
    corporate: owner === 'corp',
    adjusted: region !== 'normal',   // 투기과열지구는 조정대상지역과 함께 지정됨
    over85: false,
    lowValueHouse: lowValue,
  })
}

/** 취득세 + 지방교육세 (+ 비주택 농특세) 합계 — 만원 */
export function calcAcquisitionTax(
  priceMan: number,
  property: PropertyType,
  owner: OwnerType,
  region: Region,
  lowValue = false,
): number {
  return acquisitionTaxBreakdown(priceMan, property, owner, region, lowValue).total / 10_000
}

/** 취득세율 % 조회 (UI 표시용) */
export function getAcquisitionRate(priceMan: number, property: PropertyType, owner: OwnerType, region: Region, lowValue = false): number {
  const tax = calcAcquisitionTax(priceMan, property, owner, region, lowValue)
  return priceMan > 0 ? (tax / priceMan) * 100 : 0
}

/* ─────────────────────────────────────────────
   기타 자동 추정 비용 (만원 단위)
   ───────────────────────────────────────────── */

/** 법무비: 낙찰가 × 0.2%, 최소 30만원, 최대 200만원 */
export function calcLegalFee(priceMan: number): number {
  return Math.max(30, Math.min(priceMan * 0.002, 200))
}

/** 인지세: 부동산 거래금액 구간별 정액 (인지세법) */
export function calcStampTax(priceMan: number): number {
  if (priceMan <= 1000) return 0     // 1천만원 이하 비과세
  if (priceMan <= 3000) return 2     // 1천만~3천만
  if (priceMan <= 5000) return 4     // 3천만~5천만
  if (priceMan <= 10000) return 7    // 5천만~1억
  if (priceMan <= 100000) return 15  // 1억~10억
  return 35                          // 10억 초과
}

/** 국민주택채권: 낙찰가 × 약 2% (시가표준 기반), 즉시 매도 시 약 0.5% 손실 */
export function calcHousingBond(priceMan: number, property: PropertyType): number {
  /* 주택은 1.3~3.1% 누진, 평균 2% */
  /* 비주택은 2~5% 더 높음 */
  const rate = isHouseType(property) ? 0.005 : 0.012  // 즉시 매도 시 실제 손실액 기준
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
  { id: 'tax_acq',  emoji: '🏛️', label: '취득세 (지방교육세 포함)',  desc: '주택 1.1~12.4%, 비주택 4.6%', defaultMan: 0, isAuto: true, category: 'tax',
    saveTip: '생애최초·신혼부부 등 취득세 감면 요건 확인 (양도세 비과세와는 별개)' },
  { id: 'legal',    emoji: '⚖️', label: '법무비 (등기 위임)',             desc: '낙찰가 × 0.2%, 30~200만원',  defaultMan: 0, isAuto: true, category: 'legal',
    saveTip: '셀프 등기 시 0원 (난이도 ★★★, 시간 5~10시간)' },
  { id: 'stamp',    emoji: '📋', label: '인지세',                        desc: '구간별 2~35만원 (정액)',     defaultMan: 0, isAuto: true, category: 'tax' },
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
  dsrLimit: number       // DSR 한도 만원 (스트레스 금리 가산 역산)
  capLimit: number       // 주담대 금액 상한 만원 (없으면 Infinity)
  loanAmount: number     // 실제 가능 대출 (셋 중 가장 작은 값)
  monthlyPayment: number // 월 원리금 만원 (실제 금리 기준)
  ownEquity: number      // 자기자본 필요 만원
  shortage: number       // 현금 부족액 (음수면 충분)
  capacityType: 'ltv' | 'dsr' | 'cap'
}

/* ─────────────────────────────────────────────
   주택담보대출 규제 — 단일 소스 lib/krLoanRules.ts (2025.10.16 시행 10·15 대책 기준, 경락잔금대출 동일 적용)
   LTV·스트레스 금리·주담대 금액 상한·DSR 한도 수치와 근거·출처는 lib에서 관리하고,
   여기서는 이 도구의 지역(Region)·명의(OwnerType) 선택지를 lib 규칙 입력으로 바꾸기만 한다.
   · 규제지역 생애최초 구입자(LTV 70%)는 명의 선택지로 구분하지 않아 사용자가 조정한다.
   · 수도권 비규제지역 다주택자 추가 구입 금지(6·27 대책)는 도구가 수도권 여부를 받지 않아 안내문으로만 알리고 사용자가 조정한다.
   ───────────────────────────────────────────── */
export {
  LTV_NON_REGULATED, LTV_NON_REGULATED_MULTI, LTV_REGULATED_NO_HOME, LTV_REGULATED_HAS_HOME,
  STRESS_RATE_REGULATED, STRESS_RATE_DEFAULT,
} from '@/lib/krLoanRules'

/** 명의 → 취득 전 보유 주택 수 (live1 무주택 · own1 1채 · multi2 2채 · multi3 3채 이상). 법인은 사업자로 따로 판정 */
const OWNER_HOMES_OWNED: Record<Exclude<OwnerType, 'corp'>, number> = {
  live1: 0, own1: 1, multi2: 2, multi3: 3,
}

/** 투기과열지구는 조정대상지역과 함께 지정되므로 둘 다 규제지역 */
const isRegulated = (region: Region): boolean => region !== 'normal'

/** 지역·명의 기준 LTV 기본값(%) — 규제지역: 무주택 40 / 유주택·법인 0, 비규제: 70 (다주택·법인 60) */
export function recommendLtv(region: Region, owner: OwnerType): number {
  return loanRules.recommendLtv({
    regulated: isRegulated(region),
    homesOwned: owner === 'corp' ? 0 : (OWNER_HOMES_OWNED[owner] ?? 1),   // 알 수 없는 값은 유주택으로(보수적)
    business: owner === 'corp',
  })
}

/** 지역 기준 스트레스 금리 가산(%p) 기본값 */
export function recommendStressRate(region: Region): number {
  return loanRules.recommendStressRate(isRegulated(region))
}

/** 규제지역 주담대 금액 상한 (만원) — 담보가(낙찰가) 15억 이하 6억 / 15~25억 4억 / 25억 초과 2억. 비규제는 상한 없음 */
export function mortgageCapMan(priceMan: number, region: Region): number {
  return loanRules.mortgageCapMan(priceMan, isRegulated(region))
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
 * 가능 대출 = min(LTV 한도, DSR 한도, 주담대 금액 상한)
 * LTV 한도 = 낙찰가(담보가치) × LTV%  ← 부대비용이 아닌 담보가 기준
 * DSR = (월 신규 + 기존) × 12 / 연소득 ≤ 0.40
 *  → 가능 월 상환액 = 연소득 × 0.40 / 12 - 기존 월 상환
 *  → DSR 가능 원금 = monthlyPayment 역산 — 스트레스 DSR: 역산 금리에 stressPct 가산 (실제 월 상환은 원래 금리)
 */
export function calcLoan(
  priceMan: number,        // 낙찰가 = 담보가치 (LTV 기준)
  totalCostMan: number,    // 총투자금 (자기자본 산정 기준)
  ltvPct: number,
  ratePct: number,
  years: number,
  annualIncomeMan: number,
  existingMonthlyMan: number,
  capMan: number = Infinity, // 주담대 금액 상한 (mortgageCapMan)
  stressPct = 0,             // 스트레스 금리 가산 (%p)
): LoanResult {
  const ltvLimit = priceMan * (ltvPct / 100)

  /* DSR 가능 월 상환 */
  const maxMonthlyDsr = Math.max(0, (annualIncomeMan * loanRules.DSR_LIMIT_RATIO / 12) - existingMonthlyMan)
  /* DSR 한도 원금 (역산: monthlyPayment의 역공식, 스트레스 금리 적용) */
  const r = (ratePct + Math.max(0, stressPct)) / 100 / 12
  const n = years * 12
  let dsrLimit: number
  if (r === 0) {
    dsrLimit = maxMonthlyDsr * n
  } else {
    dsrLimit = (maxMonthlyDsr * (1 - Math.pow(1 + r, -n))) / r
  }

  const capLimit = capMan > 0 ? capMan : 0
  const loanAmount = Math.min(ltvLimit, dsrLimit, capLimit)
  const capacityType: 'ltv' | 'dsr' | 'cap' =
    loanAmount === ltvLimit ? 'ltv' : loanAmount === capLimit ? 'cap' : 'dsr'
  const monthly = monthlyPayment(loanAmount, ratePct, years)
  const ownEquity = Math.max(0, totalCostMan - loanAmount)
  const shortage = ownEquity  // 사용자 보유 현금은 별도 입력으로 처리

  return {
    ltvLimit,
    dsrLimit: Math.max(0, dsrLimit),
    capLimit,
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
