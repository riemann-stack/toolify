/* ──────────────────────────────────────────────────────
   app/tools/finance/acquisition-tax/acquisitionTaxUtils.ts — 부동산 취득세 계산기 순수 로직
   법정 수치(세율·한도·기준 가액)는 전부 lib/krAcquisitionTax.ts 단일 소스. 여기서는 입력 정규화·조합·표 생성만 한다.
   ────────────────────────────────────────────────────── */
import {
  calcAcquisitionTaxByCause, calcHouseAcquisitionTax, applyFirstHomeRelief, firstHomeIneligibility,
  isFirstHomeCapKind, FIRST_HOME_RELIEF,
  type AcqCause, type AcqProperty, type AcqTaxBreakdown, type AcquisitionInput,
  type FirstHomeCapKind, type FirstHomeRelief,
} from '@/lib/krAcquisitionTax'

export type { AcqCause, AcqProperty, AcqTaxBreakdown, FirstHomeCapKind, FirstHomeRelief }

/** 입력 상한 1조원 — 정수 연산 안전 범위 안에서 상업용 부동산까지 */
export const MAX_VALUE = 1_000_000_000_000

export const CAUSES: { id: AcqCause; label: string; short: string }[] = [
  { id: 'purchase', label: '매매·유상', short: '매매' },
  { id: 'gift', label: '증여', short: '증여' },
  { id: 'inherit', label: '상속', short: '상속' },
  { id: 'original', label: '신축(원시취득)', short: '신축' },
]
export const PROPERTIES: { id: AcqProperty; label: string }[] = [
  { id: 'house', label: '주택' },
  { id: 'nonHouse', label: '주택 외' },
  { id: 'farmland', label: '농지' },
]
export const CAP_KINDS: { id: FirstHomeCapKind; label: string }[] = [
  { id: 'general', label: `일반 — 한도 ${FIRST_HOME_RELIEF.caps.general / 10_000}만원` },
  { id: 'smallCapital', label: `소형주택·수도권 — ${FIRST_HOME_RELIEF.caps.smallCapital / 10_000}만원 (${FIRST_HOME_RELIEF.smallMaxPrice.capital / 100_000_000}억 이하)` },
  { id: 'smallNonCapital', label: `소형주택·비수도권 — ${FIRST_HOME_RELIEF.caps.smallNonCapital / 10_000}만원 (${FIRST_HOME_RELIEF.smallMaxPrice.nonCapital / 100_000_000}억 이하)` },
  { id: 'depopulation', label: `인구감소지역 — ${FIRST_HOME_RELIEF.caps.depopulation / 10_000}만원 (수도권 포함 여부 확인)` },
]

export const isCause = (v: unknown): v is AcqCause => CAUSES.some(c => c.id === v)
export const isProperty = (v: unknown): v is AcqProperty => PROPERTIES.some(p => p.id === v)
export { isFirstHomeCapKind }

/** 원인별 과세표준 입력 라벨 */
export const VALUE_LABEL: Record<AcqCause, { label: string; hint: string }> = {
  purchase: { label: '취득가액', hint: '매매가·낙찰가 (계약서 금액)' },
  gift: { label: '시가인정액', hint: '매매사례가액·감정가액 등 (없으면 시가표준액)' },
  inherit: { label: '시가표준액', hint: '공동주택·개별주택 공시가격 등' },
  original: { label: '신축 취득가격', hint: '공사비·설계비 등 사실상 취득가격' },
}

/** 계산기 입력 상태 — localStorage·공유 링크와 같은 모양 */
export interface AcqState {
  cause: AcqCause
  property: AcqProperty
  value: string          // 콤마 포함 원 단위 문자열
  over85: boolean
  homeCount: 1 | 2 | 3 | 4
  adjusted: boolean
  temporary: boolean
  lowValue: boolean
  corporate: boolean
  firstHome: boolean
  capKind: FirstHomeCapKind
  giftOver3eok: boolean
  giftFamily: boolean
  inheritHomeless: boolean
}

export const DEFAULT_STATE: AcqState = {
  cause: 'purchase', property: 'house', value: '700,000,000', over85: false,
  homeCount: 1, adjusted: false, temporary: false, lowValue: false, corporate: false,
  firstHome: false, capKind: 'general', giftOver3eok: false, giftFamily: false, inheritHomeless: false,
}

const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
const isHomeCount = (v: unknown): v is AcqState['homeCount'] => v === 1 || v === 2 || v === 3 || v === 4

/** 저장값·공유 값 검증 병합 — 모르는 키·잘못된 타입은 기본값 유지 (무검증 as T 금지) */
export function mergeState(raw: unknown, base: AcqState = DEFAULT_STATE): AcqState {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return base
  const j = raw as Record<string, unknown>
  const out: AcqState = { ...base }
  if (isCause(j.cause)) out.cause = j.cause
  if (isProperty(j.property)) out.property = j.property
  if (typeof j.value === 'string' && /^[\d,]{0,20}$/.test(j.value)) out.value = commaInput(j.value)
  if (isHomeCount(j.homeCount)) out.homeCount = j.homeCount
  if (isFirstHomeCapKind(j.capKind)) out.capKind = j.capKind
  for (const k of ['over85', 'adjusted', 'temporary', 'lowValue', 'corporate', 'firstHome', 'giftOver3eok', 'giftFamily', 'inheritHomeless'] as const) {
    if (isBool(j[k])) out[k] = j[k]
  }
  if (out.cause === 'original' && out.property === 'farmland') out.property = 'nonHouse'
  return out
}

/** 공유 링크 쿼리 ↔ 상태 (짧은 키) */
const Q_BOOL: [keyof AcqState, string][] = [
  ['over85', 'o85'], ['adjusted', 'adj'], ['temporary', 'tmp'], ['lowValue', 'low'], ['corporate', 'corp'],
  ['firstHome', 'first'], ['giftOver3eok', 'g3'], ['giftFamily', 'gf'], ['inheritHomeless', 'ih'],
]
export function stateToQuery(s: AcqState): string {
  const p = new URLSearchParams()
  p.set('c', s.cause); p.set('p', s.property); p.set('v', String(parseWon(s.value))); p.set('n', String(s.homeCount))
  if (s.firstHome) p.set('cap', s.capKind)
  for (const [k, q] of Q_BOOL) if (s[k]) p.set(q, '1')
  return p.toString()
}
export function queryToState(search: string): AcqState | null {
  const p = new URLSearchParams(search)
  if (!p.has('c') || !p.has('v')) return null
  const raw: Record<string, unknown> = {
    cause: p.get('c'), property: p.get('p'), value: p.get('v') ?? '', homeCount: Number(p.get('n')), capKind: p.get('cap'),
  }
  for (const [k, q] of Q_BOOL) raw[k] = p.get(q) === '1'
  return mergeState(raw)
}

/** 금액 파싱 — parseFloat 기반, 0~MAX_VALUE 클램프, 원 미만 버림 */
export function parseWon(v: string): number {
  const x = parseFloat(v.replace(/,/g, ''))
  if (!Number.isFinite(x)) return 0
  return Math.floor(Math.min(MAX_VALUE, Math.max(0, x)))
}

/** 실시간 콤마 — 숫자만 남기고 상한 클램프 */
export function commaInput(v: string): string {
  const d = v.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '')
  if (!d) return ''
  const n = Math.min(MAX_VALUE, parseInt(d.slice(0, 16), 10))
  return n.toLocaleString('ko-KR')
}

export const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
export const num = (n: number) => Math.round(n).toLocaleString('ko-KR')

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

/** 세율 표기 — 부동소수 잔여 제거 후 불필요한 0 삭제 (1.67 → '1.67%', 0.16 → '0.16%') */
export function pct(rate: number): string {
  const r = Math.round(rate * 10_000) / 10_000
  return `${r.toLocaleString('ko-KR', { maximumFractionDigits: 4 })}%`
}

/** 상태 → lib 입력 */
export function toInput(s: AcqState): AcquisitionInput {
  const property: AcqProperty = s.cause === 'original' && s.property === 'farmland' ? 'nonHouse' : s.property
  return {
    cause: s.cause, property, value: parseWon(s.value), over85: property === 'house' && s.over85,
    homeCount: s.homeCount, adjusted: s.adjusted, temporaryTwoHomes: s.temporary && s.homeCount === 2 && s.adjusted,
    corporate: s.corporate, lowValueHouse: s.lowValue,
    giftStdValueOver3eok: s.giftOver3eok, giftFamilyExempt: s.giftFamily, inheritHomelessOneHouse: s.inheritHomeless,
  }
}

export interface AcqResult {
  input: AcquisitionInput
  base: AcqTaxBreakdown
  /** 생애최초 감면 (선택했고 자격이 되면) */
  relief: FirstHomeRelief | null
  /** 생애최초를 선택했지만 적용할 수 없는 사유 */
  reliefBlocked: string | null
  acquisitionTax: number
  educationTax: number
  ruralTax: number
  total: number
  /** 실효세율 (%) — 합계 ÷ 과세표준 */
  effectiveRate: number
}

export function computeAcq(s: AcqState): AcqResult {
  const input = toInput(s)
  const base = calcAcquisitionTaxByCause(input)
  let relief: FirstHomeRelief | null = null
  let reliefBlocked: string | null = null
  if (s.firstHome) {
    reliefBlocked = firstHomeIneligibility(input, base)
    if (!reliefBlocked) relief = applyFirstHomeRelief(base, { capKind: s.capKind, over85: input.over85 })
  }
  const t = relief ? relief.after : base
  return {
    input, base, relief, reliefBlocked,
    acquisitionTax: t.acquisitionTax, educationTax: t.educationTax, ruralTax: t.ruralTax, total: t.total,
    effectiveRate: input.value > 0 ? (t.total / input.value) * 100 : 0,
  }
}

/* ─── 비교표 ─── */
export interface MatrixRow { homeCount: 1 | 2 | 3 | 4; label: string; normal: AcqTaxBreakdown; adjusted: AcqTaxBreakdown }

/** 같은 가격 매매 주택 — 취득 후 주택 수 × 조정/비조정 (개인, 일시적 2주택·저가주택 미적용) */
export function buildHouseMatrix(price: number, over85: boolean): MatrixRow[] {
  return ([1, 2, 3, 4] as const).map(n => ({
    homeCount: n,
    label: n === 4 ? '4주택 이상' : `${n}주택`,
    normal: calcHouseAcquisitionTax({ price, homeCount: n, adjusted: false, over85 }),
    adjusted: calcHouseAcquisitionTax({ price, homeCount: n, adjusted: true, over85 }),
  }))
}

export interface CauseRow { key: string; label: string; b: AcqTaxBreakdown }

/** 같은 금액·물건을 취득 원인만 바꿔 비교 (매매는 1주택·비조정, 증여는 중과 아님 기준) */
export function buildCauseCompare(value: number, property: AcqProperty, over85: boolean): CauseRow[] {
  const o85 = property === 'house' && over85
  const base = { value, over85: o85, homeCount: 1, adjusted: false }
  const rows: CauseRow[] = [
    { key: 'purchase', label: property === 'house' ? '매매 (1주택)' : '매매', b: calcAcquisitionTaxByCause({ ...base, cause: 'purchase', property }) },
    { key: 'gift', label: '증여', b: calcAcquisitionTaxByCause({ ...base, cause: 'gift', property }) },
  ]
  if (property === 'house') {
    rows.push({ key: 'giftHeavy', label: '증여 (조정·3억 이상 중과)', b: calcAcquisitionTaxByCause({ ...base, cause: 'gift', property, adjusted: true, giftStdValueOver3eok: true }) })
  }
  rows.push({ key: 'inherit', label: '상속', b: calcAcquisitionTaxByCause({ ...base, cause: 'inherit', property }) })
  if (property === 'house') {
    rows.push({ key: 'inheritOne', label: '상속 (무주택 1주택 특례)', b: calcAcquisitionTaxByCause({ ...base, cause: 'inherit', property, inheritHomelessOneHouse: true }) })
  }
  if (property !== 'farmland') {
    rows.push({ key: 'original', label: '신축 (원시취득)', b: calcAcquisitionTaxByCause({ ...base, cause: 'original', property }) })
  }
  return rows
}

/** 결과 복사용 요약 텍스트 */
export function summaryText(s: AcqState, r: AcqResult): string {
  const cause = CAUSES.find(c => c.id === s.cause)?.label ?? ''
  const prop = PROPERTIES.find(p => p.id === r.input.property)?.label ?? ''
  const lines = [
    `[부동산 취득세 계산] ${cause} · ${prop} · ${VALUE_LABEL[s.cause].label} ${won(r.input.value)}`,
    `적용: ${r.base.label}`,
    `취득세 ${won(r.acquisitionTax)} / 지방교육세 ${won(r.educationTax)} / 농어촌특별세 ${won(r.ruralTax)}`,
  ]
  if (r.relief) lines.push(`생애최초 감면 −${won(r.relief.acquisitionRelief + r.relief.educationRelief)}${r.relief.ruralOnRelief ? ` (감면분 농특세 +${won(r.relief.ruralOnRelief)})` : ''}`)
  lines.push(`합계 ${won(r.total)} (실효 ${pct(Math.round(r.effectiveRate * 1000) / 1000)})`)
  lines.push('youtil.kr/tools/finance/acquisition-tax — 참고용 추정치, 위택스 모의계산으로 확인')
  return lines.join('\n')
}
