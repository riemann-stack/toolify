// ─────────────────────────────────────────────────────────────
// 골프 비용 계산기 — 회원권 손익 + 골프장 저장 헬퍼
// ─────────────────────────────────────────────────────────────

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
  if (!isFinite(breakevenYears) || breakevenYears > input.holdingYears * 1.2) {
    recommendation = 'nonmember'
    recoLabel = '🔴 비회원 권장'
    recoColor = '#DC2626'
  } else if (breakevenYears < input.holdingYears * 0.5) {
    recommendation = 'member'
    recoLabel = '🟢 회원 권장'
    recoColor = '#059669'
  } else {
    recommendation = 'neutral'
    recoLabel = '🟡 중립 (조건 따라)'
    recoColor = '#FFD93E'
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
  notes?: string
  lastUsed: string         // YYYY-MM-DD
}

const COURSES_STORAGE = 'youtil-golf-courses-v1'

export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function loadCourses(): SavedGolfCourse[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COURSES_STORAGE)
    if (!raw) return []
    const arr = JSON.parse(raw) as SavedGolfCourse[]
    if (!Array.isArray(arr)) return []
    return arr.sort((a, b) => b.lastUsed.localeCompare(a.lastUsed))
  } catch { return [] }
}

export function saveCourses(arr: SavedGolfCourse[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(COURSES_STORAGE, JSON.stringify(arr)) } catch {}
}

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function fmtKrw(n: number): string {
  if (!isFinite(n)) return '—'
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}억원`
  if (Math.abs(n) >= 10_000_000)  return `${(n / 10_000_000).toFixed(1)}천만원`
  if (Math.abs(n) >= 10_000)      return `${(n / 10_000).toFixed(0)}만원`
  return `${Math.round(n).toLocaleString('ko-KR')}원`
}

export const COURSE_TYPE_LABEL: Record<string, string> = {
  publicWeekday: '퍼블릭 주중',
  publicWeekend: '퍼블릭 주말',
  semiPrivate:   '세미퍼블릭',
  private:       '회원제',
  custom:        '직접 입력',
}
