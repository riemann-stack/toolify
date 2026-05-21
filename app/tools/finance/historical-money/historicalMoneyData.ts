/* ──────────────────────────────────────────────────────
   historical-money/historicalMoneyData.ts
   한국 화폐사 + CPI 시계열 + 시대별 가격 큐레이션
   ──────────────────────────────────────────────────────
   화폐 단위 흐름:
     1945~1952: 圓 (옛 원, 조선은행권)
     1953-02-15  1차 화폐개혁  100 圓 → 1 환
     1953~1961:  환 (Hwan)
     1962-06-10  2차 화폐개혁  10 환 → 1 원
     1962~현재:  원 (Won)
   환산 누적:  1 원(현재) = 10 환(1953) = 1,000 圓(전쟁기)
   ──────────────────────────────────────────────────────
   CPI 데이터: 통계청(KOSIS) 소비자물가지수를 2020=100 기준으로 정규화.
   1965년 이후는 공식 통계, 1945~1964는 한국은행·역사 자료 기반 추정치.
   ────────────────────────────────────────────────────── */

export type CurrencyEra = 'won_old' | 'hwan' | 'won'  // 圓 / 환 / 원

export interface EraInfo {
  id: CurrencyEra
  label: string         // 단위명
  symbol: string        // 단위 기호
  startYear: number
  endYear: number       // inclusive
  toCurrentWon: number  // 이 단위 1을 현재 원 기준으로 환산할 때 곱하는 값
  description: string
}

export const ERAS: EraInfo[] = [
  { id: 'won_old', label: '圓 (옛 원)', symbol: '圓', startYear: 1945, endYear: 1952, toCurrentWon: 1 / 1000, description: '해방 후~한국전쟁기. 1953년 화폐개혁 전 통화.' },
  { id: 'hwan',    label: '환',        symbol: '환',  startYear: 1953, endYear: 1961, toCurrentWon: 1 / 10,   description: '1953년 1차 화폐개혁 (100圓=1환). 1962년까지 사용.' },
  { id: 'won',     label: '원',        symbol: '원',  startYear: 1962, endYear: 2100, toCurrentWon: 1,        description: '1962년 2차 화폐개혁 (10환=1원). 현재까지 사용.' },
]

export function eraFromYear(year: number): EraInfo {
  for (const e of ERAS) if (year >= e.startYear && year <= e.endYear) return e
  return ERAS[ERAS.length - 1]
}

// ─── CPI 시계열 (2020=100 기준) ─────────────────────────────
/** 한국 소비자물가지수 (Consumer Price Index)
 *  1965~ 통계청 KOSIS 공식 / 1945~1964는 역사 자료 기반 추정치
 *  중간 연도는 선형 보간 */
const CPI_KEY: [number, number][] = [
  [1945, 0.0008],  // 해방 직후
  [1948, 0.005],
  [1950, 0.015],   // 한국전쟁 발발
  [1952, 0.05],    // 1차 화폐개혁 직전
  [1955, 0.30],    // 환 시기 초기
  [1958, 0.65],
  [1961, 1.30],
  [1962, 1.50],    // 2차 화폐개혁
  [1965, 2.40],    // ← 통계청 공식 시작
  [1970, 4.40],
  [1975, 10.60],   // 1차 오일쇼크
  [1980, 22.50],   // 2차 오일쇼크
  [1985, 31.50],
  [1990, 46.80],
  [1995, 65.50],
  [2000, 75.80],
  [2005, 85.90],
  [2010, 95.60],
  [2015, 99.00],
  [2020, 100.00],
  [2022, 107.70],
  [2024, 113.50],
  [2026, 117.50],  // 추정 (연 1.8%)
]

const CPI_MAP: Map<number, number> = (() => {
  const m = new Map<number, number>()
  // 키 포인트 입력
  for (const [y, c] of CPI_KEY) m.set(y, c)
  // 연도별 선형 보간으로 채움
  for (let i = 0; i < CPI_KEY.length - 1; i++) {
    const [y1, c1] = CPI_KEY[i]
    const [y2, c2] = CPI_KEY[i + 1]
    for (let y = y1 + 1; y < y2; y++) {
      const t = (y - y1) / (y2 - y1)
      m.set(y, c1 + (c2 - c1) * t)
    }
  }
  return m
})()

export const YEAR_MIN = 1945
export const YEAR_MAX = 2026

export function cpi(year: number): number {
  const y = Math.max(YEAR_MIN, Math.min(YEAR_MAX, Math.round(year)))
  return CPI_MAP.get(y) ?? CPI_KEY[CPI_KEY.length - 1][1]
}

// ─── 환산 ────────────────────────────────────────────────
export interface ConvertResult {
  /** 입력 금액을 입력 연도의 화폐 단위 그대로 표시 */
  inputDisplay: string
  /** 입력 금액을 현재 원(post-1962) 명목으로 단위 환산한 값 */
  inputAsCurrentNominal: number
  /** 대상 연도의 가치로 환산된 금액 (대상 연도의 화폐 단위 기준) */
  outputAmount: number
  /** 대상 연도의 화폐 단위 */
  outputEra: EraInfo
  /** 누적 인플레이션 배수 (대상 CPI / 입력 CPI) */
  inflationFactor: number
}

export function convert(amount: number, fromYear: number, toYear: number): ConvertResult {
  const fromEra = eraFromYear(fromYear)
  const toEra = eraFromYear(toYear)
  const fromCpi = cpi(fromYear)
  const toCpi = cpi(toYear)

  // 1) 입력 금액을 현재 원(post-1962) 명목 단위로 환산
  const inputCurrentBasis = amount * fromEra.toCurrentWon
  // 2) CPI 비율 적용 → 대상 연도의 현재 원 명목 단위
  const factor = toCpi / fromCpi
  const targetCurrentBasis = inputCurrentBasis * factor
  // 3) 대상 연도의 실제 화폐 단위로 역환산
  const outputAmount = targetCurrentBasis / toEra.toCurrentWon

  return {
    inputDisplay: `${fmt(amount)} ${fromEra.symbol} (${fromYear}년)`,
    inputAsCurrentNominal: inputCurrentBasis,
    outputAmount,
    outputEra: toEra,
    inflationFactor: factor,
  }
}

export function fmt(n: number, maxFrac = 0): string {
  if (!isFinite(n)) return '0'
  if (n >= 1_000_000_000_000) return (n / 1_000_000_000_000).toFixed(2) + '조'
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(2) + '억'
  if (n >= 10_000) return (n / 10_000).toFixed(2) + '만'
  return n.toLocaleString('ko-KR', { maximumFractionDigits: maxFrac })
}

export function fmtRaw(n: number, maxFrac = 0): string {
  if (!isFinite(n)) return '0'
  return Math.round(n).toLocaleString('ko-KR', { maximumFractionDigits: maxFrac })
}

// ─── 시대별 가격 큐레이션 (재미 비교) ────────────────────────
export interface PriceItem {
  emoji: string
  name: string
  /** 연도 → 가격 (해당 연도의 통용 화폐 단위) */
  prices: Record<number, number>
  unit?: string  // '한 그릇', '한 봉' 등
  note?: string
}

export const PRICE_ITEMS: PriceItem[] = [
  { emoji: '🍜', name: '짜장면 한 그릇',
    prices: { 1960: 25, 1970: 80, 1980: 350, 1990: 1500, 2000: 3500, 2010: 4500, 2020: 5500, 2024: 7000 },
    note: '한국인의 대표 외식 메뉴' },
  { emoji: '🍶', name: '소주 한 병',
    prices: { 1965: 70, 1970: 50, 1980: 250, 1990: 700, 2000: 1000, 2010: 1200, 2020: 1500, 2024: 1800 } },
  { emoji: '🍙', name: '신라면 한 봉',
    prices: { 1986: 200, 1990: 300, 2000: 500, 2010: 700, 2020: 830, 2024: 1000 },
    note: '1986년 출시' },
  { emoji: '☕', name: '믹스커피 한 잔',
    prices: { 1980: 300, 1990: 500, 2000: 1500, 2010: 3500, 2020: 4500, 2024: 5000 } },
  { emoji: '🎬', name: '영화 티켓 1매',
    prices: { 1960: 100, 1970: 250, 1980: 1500, 1990: 4500, 2000: 7000, 2010: 8000, 2020: 13000, 2024: 15000 } },
  { emoji: '🚌', name: '시내버스 기본요금',
    prices: { 1965: 5, 1970: 15, 1980: 100, 1990: 250, 2000: 500, 2010: 900, 2020: 1250, 2024: 1500 } },
  { emoji: '⛽', name: '휘발유 1리터',
    prices: { 1980: 600, 1990: 600, 2000: 1300, 2010: 1700, 2020: 1450, 2024: 1700 } },
  { emoji: '💵', name: '근로자 월평균 임금',
    prices: { 1965: 7000, 1970: 22000, 1980: 230000, 1990: 800000, 2000: 1700000, 2010: 2800000, 2020: 3500000, 2024: 3900000 },
    note: '5인 이상 사업체 상용근로자 평균' },
  { emoji: '🏠', name: '서울 아파트 평균',
    prices: { 1980: 11_000_000, 1990: 70_000_000, 2000: 200_000_000, 2010: 500_000_000, 2020: 900_000_000, 2024: 1_100_000_000 },
    note: '평균 매매가, KB부동산 등 참조' },
  { emoji: '🎓', name: '대학 등록금 (연)',
    prices: { 1965: 8000, 1980: 540000, 1990: 1_400_000, 2000: 4_200_000, 2010: 7_500_000, 2020: 7_800_000, 2024: 8_000_000 },
    note: '4년제 사립 평균' },
]

// ─── 화폐개혁 연표 ───────────────────────────────────────
export interface ReformEvent {
  date: string
  title: string
  from: string
  to: string
  desc: string
}

export const REFORMS: ReformEvent[] = [
  { date: '1953-02-15', title: '1차 화폐개혁',
    from: '100 圓 (옛 원)', to: '1 환',
    desc: '한국전쟁 중 인플레이션 억제와 위조지폐 정리를 위해 단행. 단위 절하만이 아니라 일정 한도까지만 환전 허용으로 강제 저축 효과도 노림.' },
  { date: '1962-06-10', title: '2차 화폐개혁',
    from: '10 환', to: '1 원',
    desc: '5·16 직후 박정희 정부가 단행. 음성 자금 흡수와 재정 안정이 목적이었으나 산업자금 동원 효과는 제한적. 단위 절하만 정착됨.' },
]
