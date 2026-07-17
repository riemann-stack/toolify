/* ──────────────────────────────────────────────────────
   holiday-bridge/holidayBridgeUtils.ts — 징검다리 연휴 플래너 순수 알고리즘
   - 기간 내 모든 날짜를 OFF/WORKDAY로 분류
   - 연속 OFF 구간(run) 추출 → 연차로 run 사이의 평일을 메워 연속휴일 생성
   - 집중(최대 한 방) / 분산(골고루) 플랜 산출
   - 공짜 연휴(연차 0) 기준선 추출
   ※ 날짜는 항상 new Date(y, m-1, d) 분해 파싱 — new Date('YYYY-MM-DD') 금지(UTC 버그)
   ────────────────────────────────────────────────────── */

import { isHolidayStr, HOLIDAY_YEARS, HOLIDAY_YEAR_MIN, HOLIDAY_YEAR_MAX } from '@/lib/krHolidays'

/** 탐색 가능한 연도 = 공휴일 데이터를 보유한 연도 (하드코딩하지 말 것 — 데이터가 늘면 자동 반영) */
export const SELECTABLE_YEARS = HOLIDAY_YEARS

/** 연도를 데이터 보유 범위로 클램프 */
export function clampYear(y: number): number {
  if (!Number.isFinite(y)) return HOLIDAY_YEAR_MIN
  if (y < HOLIDAY_YEAR_MIN) return HOLIDAY_YEAR_MIN
  if (y > HOLIDAY_YEAR_MAX) return HOLIDAY_YEAR_MAX
  return y
}

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
  /** 'YYYY-MM-DD'. 지정하면 이 날짜 이후 시작하는 구간만 추천·요약 대상으로 삼는다.
     연차는 지난 날에 쓸 수 없으므로 현재 연도를 볼 때 오늘 날짜를 넣는다.
     (SSG 프리렌더에 빌드 날짜가 박히지 않도록 클라이언트 마운트 후에만 설정할 것 — 미설정이면 기간 전체) */
  fromDate?: string
}

/* SSG 프리렌더용 기본값 — year는 빌드 시점에 고정되므로 데이터 범위의 첫 해를 쓴다.
   실제 기본 연도는 클라이언트 마운트 후 '올해'로 바뀐다(HolidayBridgeClient 참고). */
export const DEFAULT_SETTINGS: BridgeSettings = {
  k: 3,
  year: HOLIDAY_YEAR_MIN,
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

/** 기간 끝을 넘어가는 연휴를 온전히 잡기 위한 여유 (달력일).
   예: 2026-12-25 성탄 연휴 → 12/28~12/31 연차 → 2027-01-01 신정 연휴로 이어지는 구간은
   [2026-01-01, 2026-12-31]만 훑으면 12/31에서 잘려 아예 만들어지지 않는다.
   앞쪽은 패딩하지 않는다 — 기간 시작 전에 시작하는 연휴는 그 이전 기간의 것이다. */
const SCAN_TAIL_DAYS = 24

/** 실제로 훑을 [시작, 종료] — 기간 끝에 여유를 더한 창 */
function scanRange(year: number, period: PeriodMode): [string, string] {
  const [s, e] = periodRange(year, period)
  const end = parseYmd(e)
  end.setDate(end.getDate() + SCAN_TAIL_DAYS)
  return [s, toYmd(end)]
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
 *
 * 근로자의 날 예외: 5/1은 2026-05-01부터 관공서 공휴일이라 krHolidays에 들어 있지만,
 * 실제 근무 여부는 사업장마다 다르다. laborDay 토글을 끄면 공휴일 판정보다 토글을 우선해
 * 평일(연차 후보)로 본다 — 토글이 공휴일 데이터에 가려 무효가 되는 것을 막는다.
 * 이때도 그날이 토·일이면 아래 주말 규칙이 그대로 적용된다.
 */
export function buildDays(settings: BridgeSettings): DayInfo[] {
  // 기간 끝 너머까지 훑는다 — 경계를 걸친 연휴를 온전히 만들기 위해서다(scanRange 참고).
  // 캘린더에 쓸 날짜는 computeBridge가 기간만 잘라서 넘긴다.
  const [startStr, endStr] = scanRange(settings.year, settings.period)
  const start = parseYmd(startStr)
  const end = parseYmd(endStr)
  const company = new Set(settings.companyHolidays)
  const out: DayInfo[] = []

  const cur = new Date(start)
  while (cur <= end) {
    const date = toYmd(cur)
    const dow = cur.getDay()
    const holiday = isHolidayStr(date)
    const isLaborDay = date.slice(5) === LABOR_DAY_MMDD
    const laborDayWorked = isLaborDay && !settings.laborDay

    let off = false
    let label: string | null = null

    if (holiday && !laborDayWorked) {
      off = true
      label = holiday.name
    } else if (company.has(date)) {
      off = true
      label = '회사 지정 휴일'
    } else if (isLaborDay && settings.laborDay) {
      // krHolidays에 5/1이 없는 연도용 폴백 (2026 이전 데이터나 향후 범위 확장 대비)
      off = true
      label = '근로자의 날'
    } else if (dow === 0) {
      off = true
      label = '일요일'
    } else if (dow === 6 && !settings.saturdayWork) {
      off = true
      label = '토요일'
    }

    // holidayName은 토글과 무관하게 유지 — 캘린더에서 '공휴일이지만 우리 회사는 근무'를
    // 표현할 수 있어야 한다(calHoliday만 붙고 calNatural은 안 붙는 상태).
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
 * 추천 리스트 상위 N — UI가 "여러 시기를 비교해 고르세요"라고 안내하므로 **서로 다른 시기**만 남긴다.
 *
 * 좋은 순으로 훑으면서 이미 쓴 run과 겹치는 플랜은 건너뛴다. 이렇게 하지 않으면 같은 연휴의
 * 길이 변형(a·b를 한 칸씩 옮긴 것)이 상위를 독식해 5장이 전부 한 덩어리가 된다.
 * (예전 dedupByRange는 startDate~endDate 기준이라 (a,b)마다 키가 달라 아무것도 못 걸렀다.)
 */
export function topPlans(plans: Plan[], k: number, n = 5): Plan[] {
  const valid = plans.filter(p => p.cost <= k && p.cost > 0)
  const out: Plan[] = []
  const usedRuns = new Set<number>()
  for (const p of sortPlans(valid)) {
    let overlaps = false
    for (let i = p.aRun; i <= p.bRun; i++) if (usedRuns.has(i)) { overlaps = true; break }
    if (overlaps) continue
    out.push(p)
    for (let i = p.aRun; i <= p.bRun; i++) usedRuns.add(i)
    if (out.length >= n) break
  }
  return out
}

/**
 * 분산(골고루): 서로 겹치지 않는 플랜들을 골라 **총 추가 획득일을 최대화**한다 (예산 K 이내).
 *
 * run 인덱스 구간에 대한 DP — plans는 [aRun..bRun] 구간을 차지하고 서로 겹칠 수 없으므로
 * 예산 축을 더한 가중 구간 스케줄링이다. dp[i][b] = run i 이상만 사용하고 예산 b일 때 최대 gained.
 *
 * 예전 그리디(효율순 + per-window cap)는 예산을 남기거나 열등한 조합을 골랐다
 * (예: 2027 k=11에서 +16, 최적은 +22). 규모가 작아(runs ~120, k ≤ 20) DP로 정확해를 구한다.
 *
 * 동점이면 구간 수가 많은 쪽 — '골고루'라는 모드 의미에 맞춘 타이브레이크.
 * 연차가 적으면 한 구간에 몰리는 것이 최적일 수 있고, 그때는 그대로 한 구간을 반환한다(정직).
 */
export function spreadPlans(plans: Plan[], k: number): { plans: Plan[]; usedK: number; totalGained: number } {
  const empty = { plans: [] as Plan[], usedK: 0, totalGained: 0 }
  const pool = plans.filter(p => p.cost > 0 && p.cost <= k && p.gained > 0)
  if (k <= 0 || pool.length === 0) return empty

  const maxRun = pool.reduce((m, p) => Math.max(m, p.bRun), 0)
  const n = maxRun + 1

  // byStart[i] = run i에서 시작하는 플랜들
  const byStart: Plan[][] = Array.from({ length: n }, () => [])
  for (const p of pool) byStart[p.aRun].push(p)

  // dp[i][b] — i는 0..n (n은 경계, 전부 0). 동점 시 windows가 큰 쪽을 택한다.
  const gain: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0))
  const wins: number[][] = Array.from({ length: n + 1 }, () => new Array(k + 1).fill(0))
  const pickAt: (Plan | null)[][] = Array.from({ length: n + 1 }, () => new Array<Plan | null>(k + 1).fill(null))

  for (let i = n - 1; i >= 0; i--) {
    for (let b = 0; b <= k; b++) {
      // run i를 쓰지 않는 경우
      let bestG = gain[i + 1][b]
      let bestW = wins[i + 1][b]
      let pick: Plan | null = null
      for (const p of byStart[i]) {
        if (p.cost > b) continue
        const nextI = p.bRun + 1        // ≤ n
        const g = p.gained + gain[nextI][b - p.cost]
        const w = 1 + wins[nextI][b - p.cost]
        if (g > bestG || (g === bestG && w > bestW)) { bestG = g; bestW = w; pick = p }
      }
      gain[i][b] = bestG
      wins[i][b] = bestW
      pickAt[i][b] = pick
    }
  }

  // 역추적
  const chosen: Plan[] = []
  let i = 0
  let b = k
  while (i < n) {
    const p = pickAt[i][b]
    if (p) { chosen.push(p); b -= p.cost; i = p.bRun + 1 }
    else i++
  }

  chosen.sort((p, q) => (p.startDate < q.startDate ? -1 : 1))
  return {
    plans: chosen,
    usedK: chosen.reduce((s, p) => s + p.cost, 0),
    totalGained: chosen.reduce((s, p) => s + p.gained, 0),
  }
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
  /** 캘린더용 — 선택한 기간만 (fromDate와 무관하게 기간 전체) */
  days: DayInfo[]
  /** 기간 안에서 시작하는 OFF-run.
     ⚠️ startIdx/endIdx는 내부 스캔 창(기간 + 뒤쪽 여유) 기준이라 위 `days` 인덱스와 다르다.
        날짜(startDate/endDate)로만 쓸 것. */
  runs: OffRun[]
  focus: Plan | null         // 집중 최적
  top: Plan[]                // 추천 상위
  spread: { plans: Plan[]; usedK: number; totalGained: number }
  free: FreeHoliday[]        // 공짜 연휴
  baselineMaxRun: number     // 연차 0 기준 최장 자연 연휴 길이
  fromDate: string | null    // 과거 제외 기준일 (없으면 기간 전체)
  droppedPast: boolean       // fromDate 때문에 실제로 빠진 구간이 있는가 (UI 고지용)
}

export function computeBridge(settings: BridgeSettings): BridgeResult {
  const [periodStart, periodEnd] = periodRange(settings.year, settings.period)
  // scanDays는 기간 끝 너머까지 포함한다 — 경계를 걸친 연휴를 온전히 만들기 위해서다.
  const scanDays = buildDays(settings)
  const runs = extractRuns(scanDays)
  const allPlans = buildPlans(scanDays, runs, settings.k)
  const from = settings.fromDate ?? null

  // 추천 대상 = 선택한 기간 안에서 **시작**하는 구간.
  //  - 기간 밖(여유분)에서 시작하는 구간은 다음 기간의 것이므로 제외한다.
  //  - 기간 안에서 시작해 밖으로 이어지는 구간은 남긴다(연말→신년 연휴가 여기서 살아난다).
  const startsInPeriod = (d: string) => d >= periodStart && d <= periodEnd
  const periodPlans = allPlans.filter(p => startsInPeriod(p.startDate))
  const periodRuns = runs.filter(r => startsInPeriod(r.startDate))

  // 연차는 지난 날에 쓸 수 없다 — fromDate가 있으면 그날 이후 시작하는 것만.
  const plans = from ? periodPlans.filter(p => p.startDate >= from) : periodPlans
  const liveRuns = from ? periodRuns.filter(r => r.startDate >= from) : periodRuns

  return {
    // 캘린더는 선택한 기간만 그린다 (여유분은 잘라낸다)
    days: scanDays.filter(d => startsInPeriod(d.date)),
    runs: periodRuns,
    focus: focusPlan(plans, settings.k),
    top: topPlans(plans, settings.k, 5),
    spread: spreadPlans(plans, settings.k),
    free: freeHolidays(scanDays, liveRuns, 3),
    baselineMaxRun: liveRuns.reduce((m, r) => Math.max(m, r.days), 0),
    fromDate: from,
    droppedPast: from !== null && (periodPlans.length > plans.length || periodRuns.length > liveRuns.length),
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
    // 데이터 보유 연도만 허용 — 범위가 늘어도 코드 수정 불필요
    if (typeof obj.year === 'number' && SELECTABLE_YEARS.includes(obj.year)) out.year = obj.year
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
