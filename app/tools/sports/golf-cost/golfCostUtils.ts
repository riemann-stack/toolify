// ─────────────────────────────────────────────────────────────
// 골프 비용 계산기 — 회원권 손익 + 골프장 저장 헬퍼
// ─────────────────────────────────────────────────────────────

// ── 오늘 정산 프리셋·기본값 ──
// GolfCostClient 초기 state와 page.tsx(빌드 시 계산하는 표·예시)가 함께 쓰는 단일 소스.
export type CourseType = 'publicWeekday' | 'publicWeekend' | 'privateWeekday' | 'privateWeekend' | 'custom'
export type PresetCourseType = Exclude<CourseType, 'custom'>
export type CartMode = 'team' | 'perPerson'

export interface CoursePreset {
  green: number
  cart: number
  cartMode: CartMode
  caddie: number
}

/* 그린피: 한국레저산업연구소 그린피 조사, 18홀 이상 평균(1,000원 단위 반올림)
     대중형(퍼블릭) 주중 170,400·주말 214,000원(2025.5) / 170,900·213,700원(2025.10)
       — 2026.5 대중형 평균은 확인되지 않아 2025년 값 유지
     회원제 비회원 주중 217,100·주말 268,700원(2026.5, 『레저백서 2026』 2026.5.27 발간)
   카트비: 대중형 팀당 평균 97,500원(2025, 2020년 84,400원) → 10만원 / 캐디피: 대중형 팀당 15만원대가 다수 → 15만원 */
export const COURSE_PRESETS: Record<PresetCourseType, CoursePreset> = {
  publicWeekday:  { green: 170_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
  publicWeekend:  { green: 214_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
  privateWeekday: { green: 217_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
  privateWeekend: { green: 269_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
}

export const DEFAULT_COURSE: PresetCourseType = 'publicWeekend'

/** [오늘 정산] 탭 기본값 — 4인·캐디 동반·팁 0·식사 1인당·그늘집 팀당·자차 카풀(팀당) */
export const TODAY_DEFAULTS = {
  players: 4,
  tipAmount: 0,          // 팀당
  mealAmount: 20_000,    // 1인당 (식사 모드 'each')
  shadeAmount: 30_000,   // 팀당
  carpoolTotal: 80_000,  // 팀당 (교통 모드 'carpool')
} as const

/** [회원권 손익] 탭 기본값 */
export const MEMBERSHIP_DEFAULTS = {
  membershipPrice: 500_000_000,
  annualFee: 2_000_000,
  holdingYears: 10,
  memberRoundCost: 80_000,
  annualRounds: 24,
  resaleValue: 300_000_000,
  nonMemberFallback: 220_000, // 오늘 정산 결과가 없을 때
} as const

// ── 회원권 손익 시뮬 ──
export type MembershipInput = {
  membershipPrice: number    // 회원권 가격 (원)
  annualFee: number          // 연회비 (원/년)
  holdingYears: number       // 보유 예상 기간 (년)
  nonMemberCost: number      // 비회원 1인당 라운딩 비용 (원)
  memberRoundCost: number    // 회원 1인당 라운딩 비용 (원, 그린피 + 카트·캐디·식사 포함)
  annualRounds: number       // 연 라운딩 횟수
  resaleValue: number        // 매각 시 잔존가치 (원)
}

export type MembershipResult = {
  totalMemberCost: number       // 회원 총 비용 (회원권 + 연회비 + 라운딩 - 매각가치)
  totalNonMemberCost: number    // 비회원 총 비용
  netSaving: number             // 회원 - 비회원 (음수면 회원 이득)
  annualSaving: number          // 연 절약액 (원/년)
  breakevenYears: number        // 손익분기 년 수 (회원권 가격 회수)
  breakevenRounds: number       // 손익분기 라운딩 횟수
  recommendation: 'member' | 'neutral' | 'nonmember'
  recoLabel: string
  recoColor: string
}

export function calcMembership(input: MembershipInput): MembershipResult {
  const totalMemberRoundCost = input.memberRoundCost * input.annualRounds * input.holdingYears
  const totalMemberCost =
    input.membershipPrice
    + input.annualFee * input.holdingYears
    + totalMemberRoundCost
    - input.resaleValue

  const totalNonMemberCost = input.nonMemberCost * input.annualRounds * input.holdingYears
  const netSaving = totalMemberCost - totalNonMemberCost

  // 연 절약 = (비회원 라운딩 비용 - 회원 라운딩 비용) × 연 횟수 - 연회비
  const annualSaving = (input.nonMemberCost - input.memberRoundCost) * input.annualRounds - input.annualFee
  const breakevenYears = annualSaving > 0
    ? (input.membershipPrice - input.resaleValue) / annualSaving
    : Infinity
  const breakevenRounds = breakevenYears * input.annualRounds

  let recommendation: MembershipResult['recommendation']
  let recoLabel: string
  let recoColor: string
  // 색은 시맨틱 토큰(600레벨, 흰 배경 텍스트 AA) — 노란 hex(#FFD93E)는 흰 카드에서 1.4:1로 읽히지 않았음
  if (!isFinite(breakevenYears) || breakevenYears > input.holdingYears * 1.2) {
    recommendation = 'nonmember'
    recoLabel = '🔴 비회원 권장'
    recoColor = 'var(--danger)'
  } else if (breakevenYears < input.holdingYears * 0.5) {
    recommendation = 'member'
    recoLabel = '🟢 회원 권장'
    recoColor = 'var(--success)'
  } else {
    recommendation = 'neutral'
    recoLabel = '🟡 중립 (조건 따라)'
    recoColor = 'var(--warning)'
  }

  return {
    totalMemberCost,
    totalNonMemberCost,
    netSaving,
    annualSaving,
    breakevenYears,
    breakevenRounds,
    recommendation,
    recoLabel,
    recoColor,
  }
}

// 회원권 가격 빠른 칩 (한국 골프 회원권 일반 가격대)
export const MEMBERSHIP_PRICE_PRESETS = [
  { label: '5천만원', value: 50_000_000 },
  { label: '1억원',   value: 100_000_000 },
  { label: '3억원',   value: 300_000_000 },
  { label: '5억원',   value: 500_000_000 },
  { label: '10억원',  value: 1_000_000_000 },
]

export const ANNUAL_ROUNDS_PRESETS = [
  { label: '월 1회 (12회)',  value: 12 },
  { label: '월 2회 (24회)',  value: 24 },
  { label: '월 3회 (36회)',  value: 36 },
  { label: '주 1회 (48회)',  value: 48 },
]

// ── 자주 가는 골프장 (localStorage) ──
export type SavedGolfCourse = {
  id: string
  name: string
  type: string             // 'publicWeekday' | 'publicWeekend' | 'semiPrivate' | 'private' | 'custom'
  greenFee: number
  cartFee: number
  caddieFee: number
  defaultMeal?: number
  defaultTransport?: number
  // 계산 모드 (불러올 때 동일 조건으로 재계산되도록 저장)
  cartMode?: 'team' | 'perPerson'
  mealMode?: 'each' | 'team'
  caddieEnabled?: boolean
  transportMode?: string   // 'self' | 'carpool' | 'bus' | 'transit'
  tipAmount?: number
  notes?: string
  lastUsed: string         // YYYY-MM-DD
}

const COURSES_STORAGE = 'youtil-golf-courses-v1'

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const isNonNegNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0
const optNum = (v: unknown) => (isNonNegNum(v) ? v : undefined)

/** 저장 항목 검증 — 필수 금액이 깨진 항목만 버리고 선택 필드는 타입이 맞을 때만 살린다 */
function toValidCourse(c: unknown): SavedGolfCourse | null {
  if (typeof c !== 'object' || c === null) return null
  const o = c as Record<string, unknown>
  if (typeof o.id !== 'string' || typeof o.name !== 'string' || typeof o.type !== 'string') return null
  if (!isNonNegNum(o.greenFee) || !isNonNegNum(o.cartFee) || !isNonNegNum(o.caddieFee)) return null
  return {
    id: o.id, name: o.name, type: o.type,
    greenFee: o.greenFee, cartFee: o.cartFee, caddieFee: o.caddieFee,
    defaultMeal: optNum(o.defaultMeal),
    defaultTransport: optNum(o.defaultTransport),
    cartMode: o.cartMode === 'team' || o.cartMode === 'perPerson' ? o.cartMode : undefined,
    mealMode: o.mealMode === 'each' || o.mealMode === 'team' ? o.mealMode : undefined,
    caddieEnabled: typeof o.caddieEnabled === 'boolean' ? o.caddieEnabled : undefined,
    transportMode: typeof o.transportMode === 'string' ? o.transportMode : undefined,
    tipAmount: optNum(o.tipAmount),
    notes: typeof o.notes === 'string' ? o.notes : undefined,
    lastUsed: typeof o.lastUsed === 'string' ? o.lastUsed : '',
  }
}

export function loadCourses(): SavedGolfCourse[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COURSES_STORAGE)
    if (!raw) return []
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map(toValidCourse)
      .filter((c): c is SavedGolfCourse => c !== null)
      .sort((a, b) => b.lastUsed.localeCompare(a.lastUsed))
  } catch { return [] }
}

export function saveCourses(arr: SavedGolfCourse[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(COURSES_STORAGE, JSON.stringify(arr)) } catch {}
}

/** 요약용 금액 표기 — 1만 미만은 원 단위, 1만~1억 미만은 '13.5만원'(소수 1자리),
    1억 이상은 '1억 5,500만원'처럼 억·만으로 분해. (예전 '1.6천만원'·'14만원' 식 반올림 표기 폐지) */
export function fmtKrw(n: number): string {
  if (!isFinite(n)) return '—'
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  const totalMan = Math.round(abs / 10_000)
  if (totalMan >= 10_000) {
    const eok = Math.floor(totalMan / 10_000)
    const man = totalMan % 10_000
    return `${sign}${eok}억${man > 0 ? ` ${man.toLocaleString('ko-KR')}만` : ''}원`
  }
  if (abs >= 10_000) {
    const man = Math.round(abs / 1_000) / 10
    // 반올림으로 1억에 닿으면 억 표기로
    if (man >= 10_000) return `${sign}1억원`
    return `${sign}${man.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만원`
  }
  return `${sign}${Math.round(abs).toLocaleString('ko-KR')}원`
}

export const COURSE_TYPE_LABEL: Record<string, string> = {
  publicWeekday:  '퍼블릭 주중',
  publicWeekend:  '퍼블릭 주말',
  privateWeekday: '회원제 주중',
  privateWeekend: '회원제 주말',
  // 예전 버전에서 저장된 항목 표시용 (프리셋에서는 제외)
  semiPrivate:    '세미퍼블릭',
  private:        '회원제',
  custom:         '직접 입력',
}
