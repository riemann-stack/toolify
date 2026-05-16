// ─────────────────────────────────────────────────────────────
// 단가 비교 계산기 — 데이터·헬퍼 (모바일 우선 UX)
// ─────────────────────────────────────────────────────────────

export type Unit = 'ml' | 'L' | 'g' | 'kg' | '개' | '매' | '장'
export type UnitKind = 'vol' | 'mass' | 'count'

export const UNITS: Unit[] = ['ml', 'L', 'g', 'kg', '개', '매', '장']

export const UNIT_KIND: Record<Unit, UnitKind> = {
  ml: 'vol', L: 'vol',
  g: 'mass', kg: 'mass',
  개: 'count', 매: 'count', 장: 'count',
}

export const UNIT_FACTOR: Record<Unit, number> = {
  ml: 1, L: 1000,
  g: 1, kg: 1000,
  개: 1, 매: 1, 장: 1,
}

export const BASE_UNIT_BY_KIND: Record<UnitKind, string> = {
  vol: 'ml', mass: 'g', count: '개',
}

// ─────────────────────────────────────────────────────────────
// 비교 기준 단위 (자동 추천)
// ─────────────────────────────────────────────────────────────
export type Base = {
  id: 'per10ml' | 'per100ml' | 'per1L' | 'per100g' | 'per1kg' | 'per1ea'
  label: string
  factor: number
  kind: UnitKind
}

export const BASES: Base[] = [
  { id: 'per10ml',  label: '10ml당',  factor: 10,    kind: 'vol' },
  { id: 'per100ml', label: '100ml당', factor: 100,   kind: 'vol' },
  { id: 'per1L',    label: '1L당',    factor: 1000,  kind: 'vol' },
  { id: 'per100g',  label: '100g당',  factor: 100,   kind: 'mass' },
  { id: 'per1kg',   label: '1kg당',   factor: 1000,  kind: 'mass' },
  { id: 'per1ea',   label: '1개당',   factor: 1,     kind: 'count' },
]

// 자동 추천: 총 용량(베이스 단위) 기준
export function recommendBase(unitKind: UnitKind, totalAmountBase: number): Base['id'] {
  if (unitKind === 'vol')   return totalAmountBase >= 1000 ? 'per1L'  : 'per100ml'
  if (unitKind === 'mass')  return totalAmountBase >= 1000 ? 'per1kg' : 'per100g'
  return 'per1ea'
}

// ─────────────────────────────────────────────────────────────
// 빠른 입력 칩
// ─────────────────────────────────────────────────────────────
export const QUICK_AMOUNT_BY_UNIT: Record<Unit, number[]> = {
  ml: [100, 200, 500, 750, 1000, 1500, 2000],
  L:  [0.5, 1, 1.5, 2, 3, 5],
  g:  [80, 100, 150, 300, 500, 1000, 2000],
  kg: [0.5, 1, 2, 5, 10],
  개: [1, 2, 3, 4, 6, 10, 12],
  매: [10, 30, 50, 100, 150, 200],
  장: [10, 30, 50, 100, 200],
}

export const QUICK_PRICES = [1000, 3000, 5000, 10000, 20000, 50000]

// ─────────────────────────────────────────────────────────────
// 소비 가능량
// ─────────────────────────────────────────────────────────────
export const CONSUMPTION_OPTIONS = [
  { value: 100, label: '100%', desc: '매일 사용 — 생수·우유·티슈' },
  { value: 75,  label: '75%',  desc: '자주 사용 — 샴푸·세제·화장품' },
  { value: 50,  label: '50%',  desc: '가끔 사용 — 소스·조미료' },
]

// ─────────────────────────────────────────────────────────────
// 포맷
// ─────────────────────────────────────────────────────────────
export const num = (v: string): number => {
  const n = Number((v || '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

export const fmt = (n: number): string => n.toLocaleString('ko-KR')
export const fmt1 = (n: number): string => n.toLocaleString('ko-KR', { maximumFractionDigits: 1 })

// 천 단위 콤마 자동 포맷 (입력 중)
export function formatPriceInput(value: string): string {
  const numeric = (value || '').replace(/[^0-9]/g, '')
  if (!numeric) return ''
  return Number(numeric).toLocaleString('ko-KR')
}

// 소수점 포함 숫자 입력 정리
export function sanitizeDecimal(value: string): string {
  return (value || '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
}
