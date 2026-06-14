/* ──────────────────────────────────────────────────────
   holiday-bridge/holidayBridgeUtils.ts — 징검다리 연휴 플래너 순수 알고리즘
   - 기간 내 모든 날짜를 OFF/WORKDAY로 분류
   - 연속 OFF 구간(run) 추출 → 연차로 run 사이의 평일을 메워 연속휴일 생성
   - 집중(최대 한 방) / 분산(골고루) 플랜 산출
   - 공짜 연휴(연차 0) 기준선 추출
   ※ 날짜는 항상 new Date(y, m-1, d) 분해 파싱 — new Date('YYYY-MM-DD') 금지(UTC 버그)
   ────────────────────────────────────────────────────── */

import { isHolidayStr } from '@/lib/krHolidays'

const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const

/* ── 날짜 헬퍼 (로컬, UTC 변환 없음) ── */

/** 'YYYY-MM-DD' → Date (분해 파싱) */
export function parseYmd(s: string): Date {
  const y = Number(s.slice(0, 4))
  const m = Number(s.slice(5, 7))
  const d = Number(s.slice(8, 10))
  return new Date(y, m - 1, d)
}

/** Date → 'YYYY-MM-DD' (로컬 연·월·일) */
export function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 'YYYY-MM-DD' → 'M/D(요일)' 짧은 한국어 라벨 */
export function shortKo(s: string): string {
  const d = parseYmd(s)
  return `${d.getMonth() + 1}/${d.getDate()}${DOW[d.getDay()]}`
}

/** 'YYYY-MM-DD' → 'M월 D일(요일)' */
export function longKo(s: string): string {
  const d = parseYmd(s)
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${DOW[d.getDay()]})`
}

/* ── 설정·기간 ── */

export type PeriodMode = 'year' | 'q1' | 'q2' | 'q3' | 'q4'

export interface BridgeSettings {
  k: number                 // 보유 연차 0~20
  year: number              // 탐색 연도
  period: PeriodMode        // 전체 / 분기
  saturdayWork: boolean     // 토요일 근무(=토요일 WORKDAY) 여부
  laborDay: boolean         // 근로자의 날(5/1) 휴무 포함
  companyHolidays: string[] // 회사 지정 휴일 'YYYY-MM-DD'
  strategy: 'focus' | 'spread' // 집중 / 분산
}

export const DEFAULT_SETTINGS: BridgeSettings = {
  k: 3,
  year: 2026,
  period: 'year',
  saturdayWork: false,
  laborDay: true,
  companyHolidays: [],
  strategy: 'focus',
}

/** 기간의 [시작, 종료] 'YYYY-MM-DD' (종료 포함) */
export function periodRange(year: number, period: PeriodMode): [string, string] {
  switch (period) {
    case 'q1': return [`${year}-01-01`, `${year}-03-31`]
    case 'q2': return [`${year}-04-01`, `${year}-06-30`]
    case 'q3': return [`${year}-07-01`, `${year}-09-30`]
    case 'q4': return [`${year}-10-01`, `${year}-12-31`]
    case 'year':
    default:   return [`${year}-01-01`, `${year}-12-31`]
  }
}

/* ── 날짜 분류 ── */

export interface DayInfo {
  date: string        // 'YYYY-MM-DD'
  dow: number         // 0(일)~6(토)
  off: boolean        // 자연 OFF 여부
  label: string | null // OFF 사유 라벨(공휴일명·주말·근로자의날·회사휴일)
  holidayName: string | null // 공휴일명(있으면)
}

const LABOR_DAY_MMDD = '05-01'

/**
 * 기간 내 모든 날짜를 분류.
 * OFF 우선순위: 공휴일 > 회사휴일 > 근로자의날 > 일요일 > 토요일(근무토글에 따라)
 */
export function buildDays(settings: BridgeSettings): DayInfo[] {
  const [startStr, endStr] = periodRange(settings.year, settings.period)
  const start = parseYmd(startStr)
  const end = parseYmd(endStr)
  const company = new Set(settings.companyHolidays)
  const out: DayInfo[] = []

  const cur = new Date(start)
  while (cur <= end) {
    const date = toYmd(cur)
    const dow = cur.getDay()
    const holiday = isHolidayStr(date)
    const mmdd = date.slice(5)

    let off = false
    let label: string | null = null

    if (holiday) {
      off = true
      label = holiday.name
    } else if (company.has(date)) {
      off = true
      label = '회사 지정 휴일'
    } else if (settings.laborDay && mmdd === LABOR_DAY_MMDD) {
      off = true
      label = '근로자의 날'
    } else if (dow === 0) {
      off = true
      label = '일요일'
    } else if (dow === 6 && !settings.saturdayWork) {
      off = true
      label = '토요일'
    }

    out.push({ date, dow, off, label, holidayName: holiday ? holiday.name : null })
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

/* ── OFF-run 추출 ── */

export interface OffRun {
  startIdx: number   // days[] 인덱스
  endIdx: number
  startDate: string
  endDate: string
  days: number       // endIdx - startIdx + 1
}

/** 연속 OFF 날짜를 묶어 run 목록 생성 */
export function extractRuns(days: DayInfo[]): OffRun[] {
  const runs: OffRun[] = []
  let i = 0
  while (i < days.length) {
    if (!days[i].off) { i++; continue }
    let j = i
    while (j + 1 < days.length && days[j + 1].off) j++
    runs.push({
      startIdx: i,
      endIdx: j,
      startDate: days[i].date,
      endDate: days[j].date,
      days: j - i + 1,
    })
    i = j + 1
  }
  return runs
}

/** run a..b를 잇는 데 필요한 연차(=run 사이 WORKDAY 총합). 인접 run 사이는 모두 평일이므로 인덱스 차로 계산 */
function gapBetween(runs: OffRun[], a: number, b: number): number {
  // run a 끝 ~ run b 시작 사이의 WORKDAY 수
  // 각 인접 gap = runs[i+1].startIdx - runs[i].endIdx - 1
  let cost = 0
  for (let i = a; i < b; i++) {
    cost += runs[i + 1].startIdx - runs[i].endIdx - 1
  }
  return cost
}

/* ── 플랜(연속휴일 구간) ── */

export interface Plan {
  aRun: number          // 시작 run 인덱스
  bRun: number          // 끝 run 인덱스
  startDate: string     // 연속휴일 시작(=run a 시작, OFF)
  endDate: string       // 연속휴일 끝(=run b 끝, OFF)
  totalDays: number     // 연속 일수 (달력일)
  cost: number          // 사용 연차(평일 수)
  leaveDates: string[]  // 실제 연차 사용 날짜 'YYYY-MM-DD'
  efficiency: number    // totalDays / cost (cost 0이면 Infinity 대신 totalDays로 표기)
  gained: number        // 연차 0 대비 추가 확보한 연속휴일 = totalDays − (구간 내 최장 자연 연휴)
}

/** 두 인덱스 사이의 WORKDAY(연차 후보) 날짜 추출 */
function leaveDatesBetween(days: DayInfo[], fromIdx: number, toIdx: number): string[] {
  const out: string[] = []
  for (let i = fromIdx; i <= toIdx; i++) {
    if (!days[i].off) out.push(days[i].date)
  }
  return out
}

/** run a..b를 묶은 플랜 생성 */
function makePlan(days: DayInfo[], runs: OffRun[], a: number, b: number): Plan {
  const aRunObj = runs[a]
  const bRunObj = runs[b]
  const cost = gapBetween(runs, a, b)
  const totalDays = bRunObj.endIdx - aRunObj.startIdx + 1
  const leaveDates = leaveDatesBetween(days, aRunObj.startIdx, bRunObj.endIdx)
  // 구간 내 가장 긴 자연 연휴 = 연차 0일 때 이미 누렸을 최장 연속휴일.
  // 추가 획득일 = 다리를 놓아 늘어난 연속휴일(이 값만큼 '더' 길게 쉰다).
  let maxNatural = 0
  for (let i = a; i <= b; i++) if (runs[i].days > maxNatural) maxNatural = runs[i].days
  return {
    aRun: a,
    bRun: b,
    startDate: aRunObj.startDate,
    endDate: bRunObj.endDate,
    totalDays,
    cost,
    leaveDates,
    efficiency: cost > 0 ? totalDays / cost : totalDays,
    gained: totalDays - maxNatural,
  }
}

/**
 * 예산 K 이내의 모든 유효 플랜을 생성 (two-pointer로 효율적).
 * 각 시작 run a에서 b를 오른쪽으로 확장하며 cost ≤ K 동안 기록.
 */
export function buildPlans(days: DayInfo[], runs: OffRun[], k: number): Plan[] {
  const plans: Plan[] = []
  for (let a = 0; a < runs.length; a++) {
    let b = a
    while (b < runs.length) {
      const cost = gapBetween(runs, a, b)
      if (cost > k) break
      // a..b 플랜 기록 (a===b는 cost 0 자연 run — 별도 처리하지만 포함해도 무방)
      plans.push(makePlan(days, runs, a, b))
      b++
    }
  }
  return plans
}

/* ── 정렬·추천 ── */

/** 추천 정렬: ① 총 연속일수 내림차순 ② 효율 내림차순 ③ 사용연차 오름차순(같으면 적게 쓰는 것 우선) */
export function sortPlans(plans: Plan[]): Plan[] {
  return plans.slice().sort((p, q) => {
    if (q.totalDays !== p.totalDays) return q.totalDays - p.totalDays
    if (q.efficiency !== p.efficiency) return q.efficiency - p.efficiency
    return p.cost - q.cost
  })
}

/** 날짜 구간(startDate~endDate) 기준 dedup */
function dedupByRange(plans: Plan[]): Plan[] {
  const seen = new Set<string>()
  const out: Plan[] = []
  for (const p of plans) {
    const key = `${p.startDate}~${p.endDate}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(p)
  }
  return out
}

/**
 * 집중(최대 한 방): 예산 K 내 최장 연속일수 플랜 1개.
 * 동률이면 효율 높은(=연차 적게 쓰는) 것.
 */
export function focusPlan(plans: Plan[], k: number): Plan | null {
  const valid = plans.filter(p => p.cost <= k && p.cost > 0)
  if (valid.length === 0) return null
  return sortPlans(valid)[0]
}

/**
 * 추천 리스트 상위 N (연차를 1개 이상 쓰는 플랜 중, 구간 dedup).
 * 같은 길이라도 다른 시기의 플랜을 보여주기 위해 dedup 후 상위 N.
 */
export function topPlans(plans: Plan[], k: number, n = 5): Plan[] {
  const valid = plans.filter(p => p.cost <= k && p.cost > 0)
  return dedupByRange(sortPlans(valid)).slice(0, n)
}

/**
 * 분산(골고루): 서로 겹치지 않는 플랜들을 그리디로 골라 총 추가 획득일 최대화.
 * - 단위 예산당 획득(gained/cost)이 높은 플랜 우선, 동률이면 gained 큰 것.
 * - 선택 시 사용 run 범위(aRun..bRun)가 겹치면 제외, 남은 예산 차감.
 */
export function spreadPlans(plans: Plan[], k: number): { plans: Plan[]; usedK: number; totalGained: number } {
  const byRatio = (p: Plan, q: Plan) => {
    const pr = p.gained / p.cost
    const qr = q.gained / q.cost
    if (qr !== pr) return qr - pr
    if (q.gained !== p.gained) return q.gained - p.gained
    return p.cost - q.cost // 동률이면 적게 쓰는 것 우선
  }
  const pool = plans.filter(p => p.cost > 0 && p.cost <= k && p.gained > 0)

  const chosen: Plan[] = []
  const usedRuns = new Set<number>()
  let budget = k

  const conflicts = (p: Plan) => {
    for (let i = p.aRun; i <= p.bRun; i++) if (usedRuns.has(i)) return true
    return false
  }
  const take = (p: Plan) => {
    chosen.push(p)
    for (let i = p.aRun; i <= p.bRun; i++) usedRuns.add(i)
    budget -= p.cost
  }

  // 1차: 한 창이 예산을 통째로 삼키지 않도록 per-window cap 적용 → 여러 구간으로 분산 유도.
  //      효율(gained/cost) 높은 짧은 징검다리부터 채워 분산성을 높인다.
  const cap = Math.max(1, Math.floor(k / 3))
  for (const p of pool.slice().sort(byRatio)) {
    if (budget <= 0) break
    if (p.cost > cap || p.cost > budget) continue
    if (conflicts(p)) continue
    take(p)
  }
  // 2차: 남은 예산으로 cap 무시하고 추가 획득(긴 한 방) 채움
  for (const p of pool.slice().sort(byRatio)) {
    if (budget <= 0) break
    if (p.cost > budget) continue
    if (conflicts(p)) continue
    take(p)
  }

  // 시작일 순 정렬해 보기 좋게
  chosen.sort((p, q) => (p.startDate < q.startDate ? -1 : 1))
  const usedK = k - budget
  const totalGained = chosen.reduce((s, p) => s + p.gained, 0)
  return { plans: chosen, usedK, totalGained }
}

/* ── 공짜 연휴(연차 0) 기준선 ── */

export interface FreeHoliday {
  startDate: string
  endDate: string
  days: number
  names: string[]   // 구간 내 공휴일명(중복 제거)
}

/** 자연 OFF run 중 minDays 이상인 것 = 공짜 연휴 */
export function freeHolidays(days: DayInfo[], runs: OffRun[], minDays = 3): FreeHoliday[] {
  const out: FreeHoliday[] = []
  for (const r of runs) {
    if (r.days < minDays) continue
    const names: string[] = []
    for (let i = r.startIdx; i <= r.endIdx; i++) {
      const h = days[i].holidayName
      if (h && !names.includes(h)) names.push(h)
    }
    out.push({ startDate: r.startDate, endDate: r.endDate, days: r.days, names })
  }
  return out
}

/* ── 종합 결과 ── */

export interface BridgeResult {
  days: DayInfo[]
  runs: OffRun[]
  focus: Plan | null         // 집중 최적
  top: Plan[]                // 추천 상위
  spread: { plans: Plan[]; usedK: number; totalGained: number }
  free: FreeHoliday[]        // 공짜 연휴
  baselineMaxRun: number     // 연차 0 기준 최장 자연 연휴 길이
}

export function computeBridge(settings: BridgeSettings): BridgeResult {
  const days = buildDays(settings)
  const runs = extractRuns(days)
  const plans = buildPlans(days, runs, settings.k)
  const baselineMaxRun = runs.reduce((m, r) => Math.max(m, r.days), 0)
  return {
    days,
    runs,
    focus: focusPlan(plans, settings.k),
    top: topPlans(plans, settings.k, 5),
    spread: spreadPlans(plans, settings.k),
    free: freeHolidays(days, runs, 3),
    baselineMaxRun,
  }
}

/* ── 복사 텍스트 ── */

export function planSummaryText(plan: Plan): string {
  const leave = plan.leaveDates.map(shortKo).join('·')
  return [
    `[징검다리 연휴 플랜]`,
    `연속휴일: ${longKo(plan.startDate)} ~ ${longKo(plan.endDate)} (총 ${plan.totalDays}일)`,
    `사용 연차: ${plan.cost}개${leave ? ` (${leave})` : ''}`,
    `효율: 연차 1개당 ${(plan.totalDays / Math.max(1, plan.cost)).toFixed(1)}일`,
  ].join('\n')
}

/* ── localStorage ── */

const STORAGE_KEY = 'youtil:holiday-bridge:settings-v1'
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/

export function loadSettings(): Partial<BridgeSettings> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const obj = JSON.parse(raw) as Record<string, unknown>
    const out: Partial<BridgeSettings> = {}

    if (typeof obj.k === 'number' && obj.k >= 0 && obj.k <= 20) out.k = Math.floor(obj.k)
    if (typeof obj.year === 'number' && (obj.year === 2026 || obj.year === 2027)) out.year = obj.year
    if (obj.period === 'year' || obj.period === 'q1' || obj.period === 'q2' || obj.period === 'q3' || obj.period === 'q4') {
      out.period = obj.period
    }
    if (typeof obj.saturdayWork === 'boolean') out.saturdayWork = obj.saturdayWork
    if (typeof obj.laborDay === 'boolean') out.laborDay = obj.laborDay
    if (obj.strategy === 'focus' || obj.strategy === 'spread') out.strategy = obj.strategy
    if (Array.isArray(obj.companyHolidays)) {
      out.companyHolidays = obj.companyHolidays.filter(
        (d): d is string => typeof d === 'string' && YMD_RE.test(d),
      )
    }
    return out
  } catch {
    return {}
  }
}

export function saveSettings(settings: BridgeSettings): void {
  if (typeof window === 'undefined') return
  try {
    const payload = {
      k: settings.k,
      year: settings.year,
      period: settings.period,
      saturdayWork: settings.saturdayWork,
      laborDay: settings.laborDay,
      strategy: settings.strategy,
      companyHolidays: settings.companyHolidays,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota */
  }
}
