/* ──────────────────────────────────────────────────────
   lotto/lottoUtils.ts
   8가지 번호 생성 모드, 통계 분석, 가상 추첨 시뮬레이터,
   1등 체감, 당첨금 세후 계산, localStorage 관리

   ⚠️ 모든 함수의 결과는 1등 확률을 변화시키지 않음.
      수학적으로 모든 6개 조합 확률은 1/8,145,060로 동일.
   ────────────────────────────────────────────────────── */

export const LOTTO_TOTAL = 45
export const PICK_COUNT = 6
export const ODDS_FIRST_PRIZE = 8_145_060
export const PRICE_PER_GAME = 1_000

/* ─── 정적 데이터 ─── */
export const PRIMES_1_45 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]
export const NUMBER_RANGES = [
  { id: '1-10',  start: 1,  end: 10, name: '1구간 (1~10)',  color: '#FBC400' },
  { id: '11-20', start: 11, end: 20, name: '2구간 (11~20)', color: '#69C8F2' },
  { id: '21-30', start: 21, end: 30, name: '3구간 (21~30)', color: '#FF7272' },
  { id: '31-40', start: 31, end: 40, name: '4구간 (31~40)', color: '#AAAAAA' },
  { id: '41-45', start: 41, end: 45, name: '5구간 (41~45)', color: '#B0D840' },
]

export type ModeId =
  | 'random' | 'balanced' | 'no-birthday' | 'consecutive'
  | 'no-consecutive' | 'spread-tail' | 'even-spread' | 'quick-pick'

export const GENERATION_MODES: { id: ModeId; name: string; icon: string; desc: string }[] = [
  { id: 'random',         name: '완전 랜덤',     icon: '🎲', desc: '아무 제약 없이 1~45 무작위 6개' },
  { id: 'balanced',       name: '균형형',         icon: '⚖️', desc: '5구간에 골고루 분포되도록 생성' },
  { id: 'no-birthday',    name: '생일 제외형',    icon: '🚫', desc: '1~31 비중 줄이고 32~45 강조' },
  { id: 'consecutive',    name: '연속 포함형',    icon: '🔗', desc: '12·13 같은 연속 쌍 1개 포함' },
  { id: 'no-consecutive', name: '연속 제외형',    icon: '✂️', desc: '인접한 번호가 없도록 생성' },
  { id: 'spread-tail',    name: '끝수 분산형',    icon: '🎯', desc: '같은 끝자리 숫자 겹침 최소화' },
  { id: 'even-spread',    name: '고른 분포',      icon: '📊', desc: '번호 간 간격을 균등하게' },
  { id: 'quick-pick',     name: '빠른픽 (5게임)', icon: '⚡', desc: '설정 없이 5게임 즉시 무작위' },
]

/* ─── 생성 옵션 ─── */
export type GenerationOptions = {
  mode: ModeId
  fixed?: number[]
  excluded?: number[]
  gameCount: number
  avoidGameOverlap?: boolean
}

export type LottoGame = {
  numbers: number[]
  analysis: GameAnalysis
}

/* ─── 통계 분석 ─── */
export type GameAnalysis = {
  oddCount: number
  evenCount: number
  lowCount: number   // 1~22
  highCount: number  // 23~45
  sum: number
  avg: number
  primeCount: number
  multipleOf3Count: number
  consecutivePairs: number
  sameTailMax: number              // 가장 많이 겹치는 끝자리 개수
  rangeDistribution: Record<string, number>
  intervals: number[]
  intervalAvg: number
}

/* ─── 모드별 생성기 ─── */
function pickRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function fillRandom(set: Set<number>, excluded: number[] = []): Set<number> {
  while (set.size < PICK_COUNT) {
    const n = pickRandom(1, LOTTO_TOTAL)
    if (excluded.includes(n)) continue
    set.add(n)
  }
  return set
}

function generateRandom(opts: GenerationOptions): number[] {
  const set = new Set<number>(opts.fixed ?? [])
  fillRandom(set, opts.excluded)
  return [...set]
}

function generateBalanced(opts: GenerationOptions): number[] {
  const set = new Set<number>(opts.fixed ?? [])
  // 5구간 골고루 시도
  for (const range of NUMBER_RANGES) {
    if (set.size >= PICK_COUNT) break
    let attempts = 0
    while (attempts < 30) {
      const n = pickRandom(range.start, range.end)
      if (!set.has(n) && !opts.excluded?.includes(n)) {
        set.add(n)
        break
      }
      attempts++
    }
  }
  fillRandom(set, opts.excluded)
  return [...set]
}

function generateNoBirthday(opts: GenerationOptions): number[] {
  const set = new Set<number>(opts.fixed ?? [])
  while (set.size < PICK_COUNT) {
    // 60% 확률로 32~45, 40% 확률로 1~31
    const useHigh = Math.random() < 0.6
    const n = useHigh ? pickRandom(32, 45) : pickRandom(1, 31)
    if (opts.excluded?.includes(n)) continue
    set.add(n)
  }
  return [...set]
}

function generateWithConsecutive(opts: GenerationOptions): number[] {
  const set = new Set<number>(opts.fixed ?? [])
  // 연속 쌍 하나 추가 (이미 있으면 스킵)
  let hasPair = false
  const sortedFixed = [...set].sort((a, b) => a - b)
  for (let i = 1; i < sortedFixed.length; i++) {
    if (sortedFixed[i] === sortedFixed[i - 1] + 1) { hasPair = true; break }
  }
  if (!hasPair && set.size < 5) {
    let attempts = 0
    while (attempts < 50) {
      const start = pickRandom(1, LOTTO_TOTAL - 1)
      if (!opts.excluded?.includes(start) && !opts.excluded?.includes(start + 1) &&
          !set.has(start) && !set.has(start + 1)) {
        set.add(start); set.add(start + 1)
        break
      }
      attempts++
    }
  }
  // 나머지 채우기 (3연속 방지)
  let safety = 0
  while (set.size < PICK_COUNT && safety < 200) {
    safety++
    const n = pickRandom(1, LOTTO_TOTAL)
    if (set.has(n) || opts.excluded?.includes(n)) continue
    const candidate = [...set, n].sort((a, b) => a - b)
    let maxRun = 1, run = 1
    for (let i = 1; i < candidate.length; i++) {
      if (candidate[i] === candidate[i - 1] + 1) { run++; maxRun = Math.max(maxRun, run) }
      else run = 1
    }
    if (maxRun >= 3) continue
    set.add(n)
  }
  fillRandom(set, opts.excluded)
  return [...set]
}

function generateWithoutConsecutive(opts: GenerationOptions): number[] {
  const set = new Set<number>(opts.fixed ?? [])
  let safety = 0
  while (set.size < PICK_COUNT && safety < 300) {
    safety++
    const n = pickRandom(1, LOTTO_TOTAL)
    if (set.has(n) || opts.excluded?.includes(n)) continue
    if (set.has(n - 1) || set.has(n + 1)) continue
    set.add(n)
  }
  fillRandom(set, opts.excluded) // 안전 fallback
  return [...set]
}

function generateSpreadTail(opts: GenerationOptions): number[] {
  const set = new Set<number>(opts.fixed ?? [])
  let safety = 0
  while (set.size < PICK_COUNT && safety < 300) {
    safety++
    const n = pickRandom(1, LOTTO_TOTAL)
    if (set.has(n) || opts.excluded?.includes(n)) continue
    const tail = n % 10
    const tailCount = [...set].filter(x => x % 10 === tail).length
    if (tailCount >= 2) continue
    set.add(n)
  }
  fillRandom(set, opts.excluded)
  return [...set]
}

function generateEvenSpread(opts: GenerationOptions): number[] {
  const set = new Set<number>(opts.fixed ?? [])
  // 대략 7~9 간격으로 6개
  let safety = 0
  while (set.size < PICK_COUNT && safety < 30) {
    safety++
    set.clear()
    if (opts.fixed) opts.fixed.forEach(n => set.add(n))
    let cur = pickRandom(1, 7)
    for (let i = 0; i < PICK_COUNT && cur <= LOTTO_TOTAL; i++) {
      if (!opts.excluded?.includes(cur) && !set.has(cur)) set.add(cur)
      cur += pickRandom(6, 9)
    }
  }
  fillRandom(set, opts.excluded) // 6개 안 차면 보충
  return [...set].sort((a, b) => a - b).slice(0, PICK_COUNT)
}

export function generateOne(opts: GenerationOptions): number[] {
  let nums: number[]
  switch (opts.mode) {
    case 'balanced':       nums = generateBalanced(opts); break
    case 'no-birthday':    nums = generateNoBirthday(opts); break
    case 'consecutive':    nums = generateWithConsecutive(opts); break
    case 'no-consecutive': nums = generateWithoutConsecutive(opts); break
    case 'spread-tail':    nums = generateSpreadTail(opts); break
    case 'even-spread':    nums = generateEvenSpread(opts); break
    case 'quick-pick':
    case 'random':
    default:               nums = generateRandom(opts); break
  }
  // 안전 보장: 6개·1~45 범위·중복 X
  const valid = [...new Set(nums.filter(n => n >= 1 && n <= 45))].slice(0, 6)
  while (valid.length < 6) {
    const n = pickRandom(1, 45)
    if (!valid.includes(n) && !opts.excluded?.includes(n)) valid.push(n)
  }
  return valid.sort((a, b) => a - b)
}

export function generateGames(opts: GenerationOptions): LottoGame[] {
  const games: LottoGame[] = []
  const usedAcross = new Set<number>()
  for (let i = 0; i < opts.gameCount; i++) {
    let nums: number[] = []
    let attempts = 0
    while (attempts < 30) {
      attempts++
      nums = generateOne(opts)
      if (opts.avoidGameOverlap && i > 0) {
        const overlap = nums.filter(n => usedAcross.has(n)).length
        if (overlap > 3) continue
      }
      break
    }
    nums.forEach(n => usedAcross.add(n))
    games.push({ numbers: nums, analysis: analyzeNumbers(nums) })
  }
  return games
}

export function analyzeNumbers(numbers: number[]): GameAnalysis {
  const sorted = [...numbers].sort((a, b) => a - b)
  const odd = numbers.filter(n => n % 2 === 1).length
  const low = numbers.filter(n => n <= 22).length
  const sum = numbers.reduce((a, b) => a + b, 0)
  const prime = numbers.filter(n => PRIMES_1_45.includes(n)).length
  const m3 = numbers.filter(n => n % 3 === 0).length
  let pairs = 0
  for (let i = 1; i < sorted.length; i++) if (sorted[i] === sorted[i - 1] + 1) pairs++
  const tailCounts: Record<string, number> = {}
  for (const n of numbers) {
    const t = String(n % 10)
    tailCounts[t] = (tailCounts[t] || 0) + 1
  }
  const sameTailMax = Math.max(...Object.values(tailCounts))
  const rangeDistribution: Record<string, number> = {}
  for (const r of NUMBER_RANGES) {
    rangeDistribution[r.id] = numbers.filter(n => n >= r.start && n <= r.end).length
  }
  const intervals: number[] = []
  for (let i = 1; i < sorted.length; i++) intervals.push(sorted[i] - sorted[i - 1])
  const intervalAvg = intervals.reduce((a, b) => a + b, 0) / Math.max(1, intervals.length)
  return {
    oddCount: odd, evenCount: 6 - odd,
    lowCount: low, highCount: 6 - low,
    sum, avg: sum / 6,
    primeCount: prime, multipleOf3Count: m3,
    consecutivePairs: pairs,
    sameTailMax,
    rangeDistribution,
    intervals,
    intervalAvg,
  }
}

/* ─── 가상 추첨 시뮬레이터 ─── */
export type SimResult = {
  totalGames: number
  totalCost: number
  prizeCounts: Record<number, number>   // 1·2·3·4·5등 횟수
  totalPrize: number
  netResult: number
  returnRate: number  // 회수율 %
}

const AVG_PRIZES: Record<number, number> = {
  1: 2_500_000_000,
  2:    60_000_000,
  3:     1_700_000,
  4:        50_000,
  5:         5_000,
}

/** 내 번호로 N회 추첨 시뮬 */
export function simulateDraws(myNumbers: number[], drawCount: number): SimResult {
  const result: SimResult = {
    totalGames: drawCount,
    totalCost: drawCount * PRICE_PER_GAME,
    prizeCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalPrize: 0,
    netResult: 0,
    returnRate: 0,
  }
  for (let i = 0; i < drawCount; i++) {
    // 매 회차: 1~45에서 6개 + 보너스 1개 추첨
    const drawn = generateRandom({ mode: 'random', gameCount: 1 })
    // 보너스 — 6개와 겹치지 않게
    let bonus = pickRandom(1, LOTTO_TOTAL)
    while (drawn.includes(bonus)) bonus = pickRandom(1, LOTTO_TOTAL)
    const matched = myNumbers.filter(n => drawn.includes(n)).length
    const hasBonus = myNumbers.includes(bonus)
    let grade = 0
    if (matched === 6) grade = 1
    else if (matched === 5 && hasBonus) grade = 2
    else if (matched === 5) grade = 3
    else if (matched === 4) grade = 4
    else if (matched === 3) grade = 5
    if (grade) {
      result.prizeCounts[grade]++
      result.totalPrize += AVG_PRIZES[grade]
    }
  }
  result.netResult = result.totalPrize - result.totalCost
  result.returnRate = result.totalCost > 0 ? (result.totalPrize / result.totalCost) * 100 : 0
  return result
}

/* ─── 1등 체감 시뮬레이터 ─── */
export type FirstPrizeSimResult = {
  reached: boolean
  weeks: number
  years: number
  totalGames: number
  totalCost: number
  ageImpact: number  // 시작 나이 + years
}

export function simulateUntilFirstPrize(weeklyGames: number, maxYears = 1000, startAge = 30): FirstPrizeSimResult {
  const maxWeeks = maxYears * 52
  const probPerGame = 1 / ODDS_FIRST_PRIZE
  let weeks = 0
  let totalGames = 0
  while (weeks < maxWeeks) {
    weeks++
    for (let g = 0; g < weeklyGames; g++) {
      totalGames++
      if (Math.random() < probPerGame) {
        const years = weeks / 52
        return {
          reached: true,
          weeks, years,
          totalGames,
          totalCost: totalGames * PRICE_PER_GAME,
          ageImpact: startAge + years,
        }
      }
    }
  }
  return {
    reached: false,
    weeks: maxWeeks,
    years: maxYears,
    totalGames,
    totalCost: totalGames * PRICE_PER_GAME,
    ageImpact: startAge + maxYears,
  }
}

/* ─── 당첨금 세후 계산 ─── */
export type TaxResult = {
  gross: number
  exempt: number      // 비과세 부분
  taxed22: number     // 22% 부분
  taxed33: number     // 33% 부분 (3억 초과)
  totalTax: number
  net: number
  effectiveRate: number  // 실효세율 %
}

/**
 * 한국 로또 당첨금 세금 (기타소득세 + 지방소득세)
 * - 5만원 이하: 비과세 (실제: 5,000원, 50,000원도 비과세 처리)
 *   ※ 본 도구는 실용 기준 "200만원 이하 비과세"를 안내. 5등 5천원·4등 5만원은 비과세 분류.
 * - 200만원 초과 ~ 3억 이하: 22% (소득세 20% + 지방세 2%)
 * - 3억 초과 부분: 33% (소득세 30% + 지방세 3%)
 */
export function calcAfterTax(gross: number): TaxResult {
  if (gross <= 0) {
    return { gross: 0, exempt: 0, taxed22: 0, taxed33: 0, totalTax: 0, net: 0, effectiveRate: 0 }
  }
  const TAX_FREE_LIMIT = 2_000_000     // 200만원 이하 기타소득세 비과세 (분리과세 면제)
  const HIGH_BRACKET = 300_000_000     // 3억 초과 33%

  let exempt = 0, taxed22 = 0, taxed33 = 0
  let totalTax = 0

  if (gross <= TAX_FREE_LIMIT) {
    exempt = gross
  } else if (gross <= HIGH_BRACKET) {
    exempt = TAX_FREE_LIMIT
    taxed22 = gross - TAX_FREE_LIMIT
    totalTax = taxed22 * 0.22
  } else {
    exempt = TAX_FREE_LIMIT
    taxed22 = HIGH_BRACKET - TAX_FREE_LIMIT
    taxed33 = gross - HIGH_BRACKET
    totalTax = taxed22 * 0.22 + taxed33 * 0.33
  }
  const net = gross - totalTax
  return {
    gross,
    exempt,
    taxed22,
    taxed33,
    totalTax: Math.round(totalTax),
    net: Math.round(net),
    effectiveRate: gross > 0 ? (totalTax / gross) * 100 : 0,
  }
}

/* ─── 번호 색상 (동행복권 표준) ─── */
export function getBallColor(n: number): string {
  if (n <= 10) return '#FBC400'
  if (n <= 20) return '#69C8F2'
  if (n <= 30) return '#FF7272'
  if (n <= 40) return '#AAAAAA'
  return '#B0D840'
}
export function getBallTextColor(n: number): string {
  return n <= 10 ? '#000' : '#fff'
}

/* ─── 패턴 해석 (분석 탭 텍스트) ─── */
export function interpretAnalysis(a: GameAnalysis): string {
  const tags: string[] = []
  if (a.oddCount === 3) tags.push('홀짝 균형 (3:3)')
  else if (Math.abs(a.oddCount - 3) === 1) tags.push(`홀짝 ${a.oddCount}:${a.evenCount}`)
  else tags.push(`홀짝 편향 (${a.oddCount}:${a.evenCount})`)

  if (a.lowCount === 3) tags.push('저고 균형 (3:3)')
  else tags.push(`저고 ${a.lowCount}:${a.highCount}`)

  if (a.sum < 100) tags.push(`합계 낮음 (${a.sum})`)
  else if (a.sum >= 100 && a.sum <= 170) tags.push(`합계 평균권 (${a.sum})`)
  else tags.push(`합계 높음 (${a.sum})`)

  if (a.consecutivePairs === 0) tags.push('연속 없음')
  else if (a.consecutivePairs === 1) tags.push('연속 1쌍')
  else tags.push(`연속 ${a.consecutivePairs}쌍`)

  if (a.sameTailMax >= 3) tags.push(`끝자리 ${a.sameTailMax}개 겹침`)
  return tags.join(' · ')
}

/* ─── localStorage ─── */
const STORAGE_KEY = 'youtil-lotto-saved-v1'

export type SavedNumber = {
  id: string
  numbers: number[]
  mode: ModeId
  memo?: string
  savedAt: string
}

export function loadSaved(): SavedNumber[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
export function saveSaved(items: SavedNumber[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100))) } catch { /* quota */ }
}
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ─── 사행성 안내 dismiss localStorage ─── */
const NOTICE_KEY = 'youtil-lotto-notice-dismissed-v1'
export function isNoticeDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(NOTICE_KEY) === '1'
}
export function dismissNotice() {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(NOTICE_KEY, '1') } catch { /* */ }
}
export function reopenNotice() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(NOTICE_KEY) } catch { /* */ }
}
