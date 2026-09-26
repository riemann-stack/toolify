/* ──────────────────────────────────────────────────────
   app/tools/finance/brokerage-fee/brokerageFeeUtils.ts — 중개보수(복비) 계산기 순수 로직
   법정 수치(상한요율·한도액·월세 환산 배수·부가세율)는 전부 lib/krBrokerageFee.ts 단일 소스.
   여기서는 입력 정규화·공유 링크·표 생성·요약 문구만 한다.
   ────────────────────────────────────────────────────── */
import {
  calcBrokerageFee, houseScheduleFor, bracketLabel, ppmToPct, PPM_PER_PCT, BROKERAGE_MAX_AMOUNT, BROKERAGE_VAT_PCT,
  HOUSE_FEE_SCHEDULES, CURRENT_HOUSE_FEE_SCHEDULE,
  type BrokerageDeal, type BrokerageProperty, type BrokerageKind, type BrokerageFeeResult, type FeeBracket,
} from '@/lib/krBrokerageFee'

export type { BrokerageDeal, BrokerageProperty, BrokerageKind, BrokerageFeeResult, FeeBracket }

export const DEALS: { id: BrokerageDeal; label: string }[] = [
  { id: 'sale', label: '매매·교환' },
  { id: 'jeonse', label: '전세' },
  { id: 'monthly', label: '월세' },
]
export const PROPERTIES: { id: BrokerageProperty; label: string; short: string }[] = [
  { id: 'house', label: '주택', short: '주택' },
  { id: 'officetel', label: '주거용 오피스텔', short: '주거용 오피스텔' },
  { id: 'other', label: '토지·상가 등', short: '주택 외' },
]
export const isDeal = (v: unknown): v is BrokerageDeal => DEALS.some(d => d.id === v)
export const isProperty = (v: unknown): v is BrokerageProperty => PROPERTIES.some(p => p.id === v)

/** 계산기 입력 상태 — localStorage·공유 링크와 같은 모양 */
export interface FeeState {
  deal: BrokerageDeal
  property: BrokerageProperty
  /** 매매·교환 거래금액 (콤마 문자열) */
  price: string
  /** 전세 보증금 */
  jeonse: string
  /** 월세 보증금 */
  deposit: string
  /** 월세 월액 */
  rent: string
  /** 협의 요율 % ('' = 상한요율 그대로) */
  rate: string
  /** 부가세 10% 포함 (세금계산서 발급 중개사무소 — 일반과세자·연 4,800만원 이상 간이과세자) */
  vat: boolean
}

export const DEFAULT_STATE: FeeState = {
  deal: 'sale', property: 'house',
  price: '500,000,000', jeonse: '300,000,000', deposit: '10,000,000', rent: '600,000',
  rate: '', vat: true,
}

/** 금액 파싱 — parseFloat 기반, 0~1조 클램프, 원 미만 버림 */
export function parseWon(v: string): number {
  const x = parseFloat(v.replace(/,/g, ''))
  if (!Number.isFinite(x)) return 0
  return Math.floor(Math.min(BROKERAGE_MAX_AMOUNT, Math.max(0, x)))
}

/** 실시간 콤마 — 숫자만 남기고 상한 클램프 */
export function commaInput(v: string): string {
  const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '')
  if (!d) return ''
  const n = Math.min(BROKERAGE_MAX_AMOUNT, parseInt(d.slice(0, 16), 10))
  return n.toLocaleString('ko-KR')
}

/** 요율 입력 정리 — 숫자·소수점 1개, 정수부 2자리·소수부 4자리까지 */
export function rateInput(v: string): string {
  const cleaned = v.replace(/[^\d.]/g, '')
  const dot = cleaned.indexOf('.')
  if (dot < 0) return cleaned.slice(0, 2)
  const int = cleaned.slice(0, dot).slice(0, 2)
  const frac = cleaned.slice(dot + 1).replace(/\./g, '').slice(0, 4)
  return `${int || '0'}.${frac}`
}

/** 협의 요율 파싱 — 빈칸이면 undefined(상한요율), parseFloat 기반 0~10% 클램프 */
export function parseRate(v: string): number | undefined {
  if (v.trim() === '') return undefined
  const x = parseFloat(v)
  if (!Number.isFinite(x)) return undefined
  return Math.min(10, Math.max(0, x))
}

const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
const isMoneyStr = (v: unknown): v is string => typeof v === 'string' && /^[\d,]{0,20}$/.test(v)

/** 저장값·공유 값 검증 병합 — 모르는 키·잘못된 타입은 기본값 유지 (무검증 as T 금지) */
export function mergeState(raw: unknown, base: FeeState = DEFAULT_STATE): FeeState {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return base
  const j = raw as Record<string, unknown>
  const out: FeeState = { ...base }
  if (isDeal(j.deal)) out.deal = j.deal
  if (isProperty(j.property)) out.property = j.property
  for (const k of ['price', 'jeonse', 'deposit', 'rent'] as const) {
    const v = j[k]
    if (isMoneyStr(v)) out[k] = commaInput(v)
  }
  if (typeof j.rate === 'string' && /^[\d.]{0,8}$/.test(j.rate)) out.rate = rateInput(j.rate)
  if (isBool(j.vat)) out.vat = j.vat
  return out
}

/** 공유 링크 쿼리 ↔ 상태 (짧은 키, 해당 거래 종류의 금액만) */
export function stateToQuery(s: FeeState): string {
  const p = new URLSearchParams()
  p.set('d', s.deal); p.set('p', s.property)
  if (s.deal === 'sale') p.set('a', String(parseWon(s.price)))
  if (s.deal === 'jeonse') p.set('j', String(parseWon(s.jeonse)))
  if (s.deal === 'monthly') { p.set('dep', String(parseWon(s.deposit))); p.set('r', String(parseWon(s.rent))) }
  if (s.rate) p.set('rate', s.rate)
  if (!s.vat) p.set('vat', '0')
  return p.toString()
}
export function queryToState(search: string): FeeState | null {
  const p = new URLSearchParams(search)
  if (!p.has('d')) return null
  return mergeState({
    deal: p.get('d'), property: p.get('p'),
    price: p.get('a') ?? undefined, jeonse: p.get('j') ?? undefined,
    deposit: p.get('dep') ?? undefined, rent: p.get('r') ?? undefined,
    rate: p.get('rate') ?? '', vat: p.get('vat') !== '0',
  })
}

export interface FeeView {
  r: BrokerageFeeResult
  /** 입력된 주 금액 (매매가·전세 보증금·월세 보증금) */
  amount: number
  rent: number
  /** 협의 요율 입력값 (%) */
  rate: number | undefined
  /** 결과 카드에 보여 줄 금액 (부가세 선택 반영) */
  shown: number
  /** 양측 합계 (부가세 선택 반영) */
  shownBoth: number
}

export function computeFee(s: FeeState): FeeView {
  const amount = parseWon(s.deal === 'sale' ? s.price : s.deal === 'jeonse' ? s.jeonse : s.deposit)
  const rent = s.deal === 'monthly' ? parseWon(s.rent) : 0
  const rate = parseRate(s.rate)
  const r = calcBrokerageFee({ deal: s.deal, property: s.property, amount, monthlyRent: rent, negotiatedRatePct: rate })
  const shown = s.vat ? r.feeWithVat : r.fee
  return { r, amount, rent, rate, shown, shownBoth: shown * 2 }
}

/* ─── 표기 ─── */
export const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
export const num = (n: number) => Math.round(n).toLocaleString('ko-KR')

/** ppm → '0.4%' */
export function pctPpm(ppm: number): string {
  return `${ppmToPct(ppm).toLocaleString('ko-KR', { maximumFractionDigits: 4 })}%`
}

/** 1억 2,345만 6,789원 형태 (0원이면 '0원') */
export function koreanWon(n: number): string {
  const v = Math.floor(Math.max(0, n))
  if (v === 0) return '0원'
  const eok = Math.floor(v / 100_000_000)
  const man = Math.floor((v % 100_000_000) / 10_000)
  const rest = v % 10_000
  const parts: string[] = []
  if (eok) parts.push(`${eok.toLocaleString('ko-KR')}억`)
  if (man) parts.push(`${man.toLocaleString('ko-KR')}만`)
  if (rest) parts.push(rest.toLocaleString('ko-KR'))
  return parts.join(' ') + '원'
}

/** 짧은 금액 — 25만원 · 1억 5,000만원 · 3,500만원 (만원 단위로 나누어떨어지지 않으면 원 단위 그대로) */
export function manWon(n: number): string {
  if (n % 10_000 !== 0) return won(n)
  const eok = Math.floor(n / 100_000_000)
  const man = (n % 100_000_000) / 10_000
  if (eok && man) return `${eok.toLocaleString('ko-KR')}억 ${man.toLocaleString('ko-KR')}만원`
  if (eok) return `${eok.toLocaleString('ko-KR')}억원`
  return `${man.toLocaleString('ko-KR')}만원`
}

/* ─── 구간표 (lib에서 생성) ─── */
export interface ScheduleRow {
  bracket: FeeBracket
  label: string
  rate: string
  cap: string
  /** 한도액이 걸리기 시작하는 거래금액 (한도 있는 구간만) */
  capFrom: number | null
}

/** 한도액이 처음 적용되는 금액 — 거래금액 × 요율 ≥ 한도액이 되는 최소 원 단위 금액 */
export const capStart = (b: FeeBracket): number | null =>
  b.cap === null ? null : Math.ceil((b.cap * 1_000_000) / b.ratePpm)

export function scheduleRows(kind: BrokerageKind, date?: string): ScheduleRow[] {
  return houseScheduleFor(date)[kind].map(b => {
    const from = capStart(b)
    return {
      bracket: b, label: bracketLabel(b), rate: pctPpm(b.ratePpm),
      cap: b.cap === null ? '없음' : manWon(b.cap),
      capFrom: from !== null && (b.max === null || from < b.max) ? from : null,
    }
  })
}

/** 매매가·보증금 예시표 한 줄 */
export interface AmountRow { amount: number; r: BrokerageFeeResult }
export const amountRows = (amounts: number[], deal: BrokerageDeal, property: BrokerageProperty = 'house', date?: string): AmountRow[] =>
  amounts.map(amount => ({ amount, r: calcBrokerageFee({ deal, property, amount, date }) }))

/** 월세 예시표 한 줄 */
export interface MonthlyRow { deposit: number; rent: number; r: BrokerageFeeResult }
export const monthlyRows = (pairs: [number, number][], property: BrokerageProperty = 'house'): MonthlyRow[] =>
  pairs.map(([deposit, rent]) => ({ deposit, rent, r: calcBrokerageFee({ deal: 'monthly', property, amount: deposit, monthlyRent: rent }) }))

/** 2021년 10월 개정 전후 비교 한 줄 */
export interface ReformRow { amount: number; before: BrokerageFeeResult; after: BrokerageFeeResult }
export function reformRows(amounts: number[], deal: 'sale' | 'jeonse'): ReformRow[] {
  const prev = HOUSE_FEE_SCHEDULES[HOUSE_FEE_SCHEDULES.length - 2]
  return amounts.map(amount => ({
    amount,
    before: calcBrokerageFee({ deal, property: 'house', amount, date: prev.to ?? prev.from }),
    after: calcBrokerageFee({ deal, property: 'house', amount, date: CURRENT_HOUSE_FEE_SCHEDULE.from }),
  }))
}

/** 결과 복사용 요약 */
export function summaryText(s: FeeState, v: FeeView): string {
  const { r } = v
  const deal = DEALS.find(d => d.id === s.deal)?.label ?? ''
  const prop = PROPERTIES.find(p => p.id === s.property)?.label ?? ''
  const lines = [`[중개보수 계산] ${prop} · ${deal}`]
  if (r.lease && r.lease.multiplier) {
    lines.push(`보증금 ${won(r.lease.deposit)} + 월세 ${won(r.lease.monthlyRent)} × ${r.lease.multiplier} = 거래금액 ${won(r.transactionAmount)}`)
  } else {
    lines.push(`거래금액 ${won(r.transactionAmount)}`)
  }
  lines.push(`상한요율 ${pctPpm(r.maxRatePpm)}${r.cap !== null ? ` · 한도액 ${won(r.cap)}` : ''} (${r.bracketText})`)
  if (r.negotiated && !r.rateClamped) lines.push(`협의 요율 ${pctPpm(r.appliedRatePpm)} 적용`)
  lines.push(`중개보수(한쪽) ${won(r.fee)}${s.vat ? ` + 부가세 ${won(r.vat)} = ${won(r.feeWithVat)}` : ' (부가세 별도)'}`)
  lines.push(`양측 합계 ${won(v.shownBoth)}`)
  lines.push('youtil.kr/tools/finance/brokerage-fee — 법정 상한 기준 참고치, 실제 금액은 협의')
  return lines.join('\n')
}

/** 부가세율 표기 (본문·UI 공용) */
export const VAT_PCT_TEXT = `${BROKERAGE_VAT_PCT}%`
/** ppm 정수 ↔ % 입력 변환 확인용 (테스트) */
export const pctToPpm = (pct: number) => Math.round(pct * PPM_PER_PCT)
