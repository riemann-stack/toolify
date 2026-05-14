/* ──────────────────────────────────────────────────────
   gold-converter/goldUtils.ts
   2026년 한국 금 단위 변환·순도 환산·시세 가격 계산
   ────────────────────────────────────────────────────── */

/* ─── 무게 단위 (g 기준 환산값) ─── */
export type WeightUnit = 'don' | 'g' | 'kg' | 'troyOz' | 'pun' | 'nyang' | 'dwt' | 'grain' | 'oz'

export interface UnitDef {
  key: WeightUnit
  label:    string
  short:    string
  inGram:   number  // 1단위 = X그램
  region:   '한국' | '국제'
  desc:     string
}

export const UNITS: UnitDef[] = [
  { key: 'don',     label: '돈',          short: '돈',  inGram: 3.75,         region: '한국',  desc: '한국 금 거래 표준 (1돈 = 3.75g)' },
  { key: 'g',       label: '그램',         short: 'g',   inGram: 1,            region: '국제',  desc: 'SI 단위 — 국제 표준' },
  { key: 'kg',      label: '킬로그램',     short: 'kg',  inGram: 1000,         region: '국제',  desc: '대용량 골드바' },
  { key: 'troyOz',  label: '트로이온스',   short: 'oz t',inGram: 31.1034768,   region: '국제',  desc: '국제 금 거래 표준 단위' },
  { key: 'pun',     label: '푼',          short: '푼',  inGram: 0.375,        region: '한국',  desc: '1푼 = 1/10돈 = 0.375g' },
  { key: 'nyang',   label: '냥',          short: '냥',  inGram: 37.5,         region: '한국',  desc: '1냥 = 10돈 = 37.5g' },
  { key: 'dwt',     label: '펜니웨이트',   short: 'dwt', inGram: 1.55517384,   region: '국제',  desc: '귀금속 미국 표기' },
  { key: 'grain',   label: '그레인',       short: 'gn',  inGram: 0.06479891,   region: '국제',  desc: '미세 무게' },
  { key: 'oz',      label: '온스 (avoir.)',short: 'oz',  inGram: 28.349523125, region: '국제',  desc: '일반 온스 (금에는 사용 X — 트로이온스와 구분)' },
]

/* ─── 순도 (Karat) ─── */
export interface KaratDef {
  key:     string
  label:   string
  ratio:   number  // 0~1 순금 비율
  desc:    string
  color:   string
}

export const KARATS: KaratDef[] = [
  { key: '24k',  label: '24K',  ratio: 0.999, desc: '999.9 / 99.9% — 골드바·돌반지·투자',      color: '#FFD700' },
  { key: '22k',  label: '22K',  ratio: 0.917, desc: '91.7% — 동남아 결혼반지',                color: '#FFC940' },
  { key: '21k',  label: '21K',  ratio: 0.875, desc: '87.5% — 중동 보석',                      color: '#FFB938' },
  { key: '18k',  label: '18K',  ratio: 0.750, desc: '75.0% — 한국 결혼반지·보석 표준',         color: '#E8A838' },
  { key: '14k',  label: '14K',  ratio: 0.583, desc: '58.3% — 일반 보석류·미국 표준',           color: '#C9913F' },
  { key: '10k',  label: '10K',  ratio: 0.417, desc: '41.7% — 저가 보석',                      color: '#A87B45' },
]

/* ─── 한국 인기 시나리오 프리셋 ─── */
export interface ScenarioPreset {
  id: string
  label: string
  weightG: number
  karat: string
  emoji: string
  desc: string
}

export const SCENARIOS: ScenarioPreset[] = [
  { id: 'baby-half',  label: '돌반지 반돈',     weightG: 1.875, karat: '24k', emoji: '👶', desc: '0.5돈 24K 돌반지' },
  { id: 'baby-one',   label: '돌반지 한돈',     weightG: 3.75,  karat: '24k', emoji: '🍼', desc: '1돈 24K 돌반지 (가장 일반)' },
  { id: 'wedding',    label: '결혼반지 18K',    weightG: 5.0,   karat: '18k', emoji: '💍', desc: '18K 5g 결혼반지 (1개)' },
  { id: 'wedding-pair', label: '결혼 커플반지', weightG: 10.0,  karat: '18k', emoji: '💞', desc: '18K 5g x 2 한쌍' },
  { id: 'sebae',      label: '세배돈',          weightG: 0.375, karat: '24k', emoji: '🎁', desc: '0.1돈 (1푼) 세배돈' },
  { id: 'birthday-70',label: '칠순 한냥',       weightG: 37.5,  karat: '24k', emoji: '🎉', desc: '10돈 한냥 골드바' },
  { id: 'bar-1don',   label: '골드바 1돈',      weightG: 3.75,  karat: '24k', emoji: '🪙', desc: '1돈 골드바 (한국조폐공사 등)' },
  { id: 'bar-1nyang', label: '골드바 1냥',      weightG: 37.5,  karat: '24k', emoji: '🥇', desc: '10돈 한냥 골드바' },
  { id: 'bar-100g',   label: '골드바 100g',     weightG: 100,   karat: '24k', emoji: '💎', desc: '100g 골드바' },
  { id: 'bar-1kg',    label: '골드바 1kg',      weightG: 1000,  karat: '24k', emoji: '🏆', desc: '1kg 골드바 (대량 투자)' },
  { id: 'necklace',   label: '18K 목걸이 평균', weightG: 8.0,   karat: '18k', emoji: '📿', desc: '18K 일반 목걸이 평균' },
  { id: 'bracelet',   label: '14K 팔찌 평균',   weightG: 6.0,   karat: '14k', emoji: '⛓️', desc: '14K 일반 팔찌 평균' },
]

/* ─── 변환 함수 ─── */
export function toGram(value: number, unit: WeightUnit): number {
  const u = UNITS.find((x) => x.key === unit)
  return u ? value * u.inGram : 0
}

export function fromGram(grams: number, unit: WeightUnit): number {
  const u = UNITS.find((x) => x.key === unit)
  return u && u.inGram > 0 ? grams / u.inGram : 0
}

export function pureGoldGram(grams: number, karatKey: string): number {
  const k = KARATS.find((x) => x.key === karatKey)
  return k ? grams * k.ratio : 0
}

/** 입력 순도·무게에서 다른 순도로 환산 (순금 기준 등가) */
export function convertKarat(grams: number, fromKarat: string, toKarat: string): number {
  const f = KARATS.find((x) => x.key === fromKarat)
  const t = KARATS.find((x) => x.key === toKarat)
  if (!f || !t || t.ratio <= 0) return 0
  return (grams * f.ratio) / t.ratio
}

/* ─── 가격 계산 ─── */
export interface PriceInputs {
  pricePerGram24k: number   // 24K 1g 시세 (KRW)
  vatIncluded: boolean      // 시세에 부가세 포함 여부
  spreadPercent: number     // 매수-매도 스프레드 % (기본 7%)
  feePercent: number        // 거래 수수료 % (기본 1%)
  craftFee: number          // 세공비 (원, 보석류)
  usdKrw: number            // USD 환율
  internationalOzUsd: number // 국제 1 oz USD 시세
}

export interface PriceResult {
  /** 입력 무게의 순금 환산 g */
  pureGrams: number
  /** 시세 기준 (부가세 미포함) */
  baseValue: number
  /** 매수 실비용 (시세 + VAT + 수수료 + 세공비) */
  buyCost: number
  /** 매도 실수령액 (시세 - 수수료, 부가세 환급 X) */
  sellRevenue: number
  /** 매수-매도 스프레드 손실 */
  spreadLoss: number
  vatAmount: number
  feeAmount: number
}

/** 매수·매도 실거래가 계산 */
export function calculatePrice(grams: number, karatKey: string, p: PriceInputs): PriceResult {
  const pureGrams = pureGoldGram(grams, karatKey)
  // 시세 (부가세 포함이면 미포함 가격으로 역산)
  const cleanPricePerGram = p.vatIncluded ? p.pricePerGram24k / 1.10 : p.pricePerGram24k
  const baseValue = pureGrams * cleanPricePerGram

  // 매수: VAT + 수수료 + 세공비
  const vatAmount = baseValue * 0.10
  const buyFee = baseValue * (p.feePercent / 100)
  const buyCost = baseValue + vatAmount + buyFee + p.craftFee

  // 매도: 매장 매수가 = 시세 - 스프레드 - 수수료
  const sellBase = baseValue * (1 - p.spreadPercent / 100)
  const sellFee = sellBase * (p.feePercent / 100)
  const sellRevenue = sellBase - sellFee  // 부가세는 환급 X (매수 시 낸 부가세는 못 돌려받음)

  const spreadLoss = buyCost - sellRevenue

  return {
    pureGrams,
    baseValue,
    buyCost,
    sellRevenue,
    spreadLoss,
    vatAmount,
    feeAmount: buyFee + sellFee,
  }
}

/** 코리아 프리미엄 계산 (한국 시세 vs 국제 시세) */
export function koreaPremium(p: PriceInputs): { koreaPerOz: number; intlPerOzKrw: number; premiumPercent: number } {
  // 한국 24K 1g 시세 (부가세 미포함 환산) → 트로이온스 환산
  const cleanPricePerGram = p.vatIncluded ? p.pricePerGram24k / 1.10 : p.pricePerGram24k
  const koreaPerOz = cleanPricePerGram * 31.1034768
  const intlPerOzKrw = p.internationalOzUsd * p.usdKrw
  const premiumPercent = intlPerOzKrw > 0 ? ((koreaPerOz - intlPerOzKrw) / intlPerOzKrw) * 100 : 0
  return { koreaPerOz, intlPerOzKrw, premiumPercent }
}

/* ─── 자산 합산 항목 ─── */
let _assetIdCounter = 0
export const nextAssetId = () => `gold-${++_assetIdCounter}`

export interface AssetItem {
  id: string
  nickname: string
  weightG: number
  karat: string
}

/* ─── 무게별 가격표 ─── */
export interface PriceTableRow {
  label: string
  weightG: number
  buyCost: number
  sellRevenue: number
}

export const PRICE_TABLE_WEIGHTS: Array<[string, number]> = [
  ['0.1돈',   0.375],
  ['반돈',    1.875],
  ['1돈',     3.75],
  ['3돈',     11.25],
  ['5돈',     18.75],
  ['한냥',    37.5],
  ['100g',    100],
  ['1kg',     1000],
]

export function buildPriceTable(p: PriceInputs, karatKey: string): PriceTableRow[] {
  return PRICE_TABLE_WEIGHTS.map(([label, weight]) => {
    const result = calculatePrice(weight, karatKey, p)
    return {
      label,
      weightG: weight,
      buyCost: result.buyCost,
      sellRevenue: result.sellRevenue,
    }
  })
}

/* ─── 포맷터 ─── */
export const fmtKRW = (n: number): string => {
  if (Math.abs(n) < 1) return '0원'
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(2)}억`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}만원`
  return `${sign}${Math.round(abs).toLocaleString()}원`
}
export const fmtKRWFull = (n: number): string => {
  const sign = n < 0 ? '-' : ''
  return `${sign}${Math.round(Math.abs(n)).toLocaleString()}원`
}

/** 무게 표시 (0.001 ~ 1000+ 범위 적응) */
export function fmtWeight(grams: number, unit: WeightUnit): string {
  const v = fromGram(grams, unit)
  if (v === 0) return '0'
  const abs = Math.abs(v)
  // 단위별 적정 소수점
  if (unit === 'kg' || unit === 'troyOz' || unit === 'oz' || unit === 'nyang') {
    return v.toFixed(abs >= 100 ? 2 : abs >= 1 ? 4 : 6)
  }
  if (unit === 'dwt' || unit === 'don' || unit === 'pun') {
    return v.toFixed(abs >= 100 ? 2 : abs >= 1 ? 3 : 5)
  }
  if (unit === 'grain') return v.toFixed(abs >= 1 ? 2 : 4)
  // g
  return v.toFixed(abs >= 1000 ? 1 : abs >= 1 ? 3 : 5)
}
