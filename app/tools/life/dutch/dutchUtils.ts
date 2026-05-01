/* ──────────────────────────────────────────────────────
   life/dutch/dutchUtils.ts
   N빵 계산, 술값 분리, 개인별 정산, 선결제자 최소 송금,
   localStorage, 카카오톡 메시지 생성
   ────────────────────────────────────────────────────── */

/* ─── 절삭·올림 옵션 ─── */
export type RoundingId =
  | 'exact' | 'round-100' | 'ceil-100' | 'floor-100'
  | 'round-1000' | 'ceil-1000' | 'floor-1000'

export type RoundingOption = {
  id: RoundingId
  name: string
  divisor: number
  mode: 'none' | 'round' | 'ceil' | 'floor'
}

export const ROUNDING_OPTIONS: RoundingOption[] = [
  { id: 'exact',      name: '정확히 (1원 단위)',     divisor: 1,    mode: 'none' },
  { id: 'round-100',  name: '100원 반올림',          divisor: 100,  mode: 'round' },
  { id: 'ceil-100',   name: '100원 올림',            divisor: 100,  mode: 'ceil' },
  { id: 'floor-100',  name: '100원 내림',            divisor: 100,  mode: 'floor' },
  { id: 'round-1000', name: '1,000원 반올림',        divisor: 1000, mode: 'round' },
  { id: 'ceil-1000',  name: '1,000원 올림 (잔돈 공금)', divisor: 1000, mode: 'ceil' },
  { id: 'floor-1000', name: '1,000원 내림',          divisor: 1000, mode: 'floor' },
]

export function applyRounding(value: number, id: RoundingId): number {
  const opt = ROUNDING_OPTIONS.find(o => o.id === id) ?? ROUNDING_OPTIONS[0]
  const d = opt.divisor
  if (!Number.isFinite(value) || value === 0) return 0
  switch (opt.mode) {
    case 'round': return Math.round(value / d) * d
    case 'ceil':  return Math.ceil(value / d) * d
    case 'floor': return Math.floor(value / d) * d
    default:      return Math.round(value)
  }
}

/* ─── 잔여 금액 처리 ─── */
export type RemainderId = 'common-fund' | 'to-payer' | 'first-person' | 'random' | 'split-1won'

export const REMAINDER_OPTIONS: { id: RemainderId; name: string; desc: string }[] = [
  { id: 'common-fund',  name: '공금으로 (다음 모임)', desc: '잔돈을 모아서 다음 회식·모임에 사용' },
  { id: 'to-payer',     name: '결제자가 받기',         desc: '대표 결제자가 잔돈을 가짐' },
  { id: 'first-person', name: '첫 번째 사람이 부담',   desc: '리스트 첫 사람이 차액 부담' },
  { id: 'random',       name: '무작위 1명이 부담',     desc: '난수로 한 명 뽑아 차액 부담' },
  { id: 'split-1won',   name: '균등 분배 (1원 단위)',  desc: '잔돈도 정확히 1원 단위로 나눔' },
]

/* ─── 시나리오 프리셋 ─── */
export type ScenarioId = 'lunch' | 'dinner' | 'cafe' | 'pub' | 'team' | 'travel' | 'family' | 'birthday'

export const SCENARIO_PRESETS: {
  id: ScenarioId; name: string; icon: string; avgPerPerson: number
  rounding: RoundingId; remainder: RemainderId
}[] = [
  { id: 'lunch',    name: '점심 회식', icon: '🍱', avgPerPerson: 12000, rounding: 'round-100',  remainder: 'common-fund' },
  { id: 'dinner',   name: '저녁 회식', icon: '🍻', avgPerPerson: 30000, rounding: 'ceil-1000',  remainder: 'common-fund' },
  { id: 'cafe',     name: '카페 모임', icon: '☕', avgPerPerson: 6000,  rounding: 'ceil-100',   remainder: 'common-fund' },
  { id: 'pub',      name: '술자리',   icon: '🍺', avgPerPerson: 35000, rounding: 'ceil-1000',  remainder: 'common-fund' },
  { id: 'team',     name: '팀 회식',  icon: '🥂', avgPerPerson: 50000, rounding: 'ceil-1000',  remainder: 'to-payer' },
  { id: 'travel',   name: '여행 정산', icon: '✈️', avgPerPerson: 0,    rounding: 'exact',      remainder: 'split-1won' },
  { id: 'family',   name: '가족 외식', icon: '👨‍👩‍👧', avgPerPerson: 25000, rounding: 'round-1000', remainder: 'common-fund' },
  { id: 'birthday', name: '생일 모임', icon: '🎂', avgPerPerson: 30000, rounding: 'ceil-1000',  remainder: 'common-fund' },
]

/* ───────── 1. 간단 N빵 ───────── */
export type SimpleSplitInput = {
  totalAmount: number
  peopleCount: number
  rounding: RoundingId
  remainder: RemainderId
}

export type SimpleSplitResult = {
  exactPerPerson: number
  perPerson: number
  totalCollected: number
  remainder: number   // + 면 더 걷힘 (잉여), - 면 부족
  /** 잔여 처리 후 각자 부담 금액 (대부분 모두 같음. split-1won 일 때만 첫 N명에 +1원) */
  individualAmounts: number[]
  payerLabel?: string  // first-person·random 일 때 "그 사람이 차액"
}

export function calcSimpleSplit(input: SimpleSplitInput): SimpleSplitResult {
  const { totalAmount, peopleCount, rounding, remainder } = input
  if (peopleCount <= 0 || totalAmount < 0) {
    return {
      exactPerPerson: 0, perPerson: 0,
      totalCollected: 0, remainder: 0, individualAmounts: [],
    }
  }
  const exact = totalAmount / peopleCount
  const per = applyRounding(exact, rounding)
  const collected = per * peopleCount
  const diff = collected - totalAmount   // + 잉여, - 부족

  const amounts: number[] = Array(peopleCount).fill(per)

  if (remainder === 'split-1won') {
    // 균등 분배 — exact를 floor로 깔고 나머지 원 단위로 분배
    const floor1 = Math.floor(exact)
    const totalFloor = floor1 * peopleCount
    let leftover = totalAmount - totalFloor   // 0~peopleCount-1 원
    for (let i = 0; i < peopleCount; i++) {
      amounts[i] = floor1 + (leftover > 0 ? 1 : 0)
      if (leftover > 0) leftover--
    }
  } else if (remainder === 'first-person' && diff !== 0) {
    // 첫 사람이 차액 부담
    amounts[0] = per - diff
  } else if (remainder === 'random' && diff !== 0) {
    // 무작위 한 명에게 차액
    const idx = Math.floor(Math.random() * peopleCount)
    amounts[idx] = per - diff
  }
  // common-fund / to-payer: amounts 그대로 (모두 같은 금액)

  return {
    exactPerPerson: exact,
    perPerson: per,
    totalCollected: amounts.reduce((s, x) => s + x, 0),
    remainder: diff,
    individualAmounts: amounts,
  }
}

/* ───────── 2. 술값 분리 ───────── */
export type DrinkSplitInput = {
  totalAmount: number
  drinkAmount: number
  totalPeople: number
  drinkers: number
  rounding: RoundingId
}

export type DrinkSplitResult = {
  foodAmount: number
  foodPerPerson: number
  drinkPerDrinker: number
  nonDrinkerAmount: number
  drinkerAmount: number
  totalCollected: number
  remainder: number
  nonDrinkers: number
}

export function calcDrinkSplit(input: DrinkSplitInput): DrinkSplitResult {
  const food = Math.max(0, input.totalAmount - input.drinkAmount)
  const nonD = Math.max(0, input.totalPeople - input.drinkers)

  const foodPP = input.totalPeople > 0 ? food / input.totalPeople : 0
  const drinkPD = input.drinkers > 0 ? input.drinkAmount / input.drinkers : 0

  const nonDrinkerAmount = applyRounding(foodPP, input.rounding)
  const drinkerAmount   = applyRounding(foodPP + drinkPD, input.rounding)

  const totalCollected = nonDrinkerAmount * nonD + drinkerAmount * input.drinkers

  return {
    foodAmount: food,
    foodPerPerson: foodPP,
    drinkPerDrinker: drinkPD,
    nonDrinkerAmount,
    drinkerAmount,
    totalCollected,
    remainder: totalCollected - input.totalAmount,
    nonDrinkers: nonD,
  }
}

/* ───────── 3. 개인별 정산 ───────── */
export type PersonItem = { id: string; name: string; price: number }

export type PerPersonParticipant = {
  id: string
  name: string
  items: PersonItem[]            // 본인 주문
  sharedShare: number            // 공동 메뉴 분담 비율 (1=먹음, 0=안 먹음)
  drinker: boolean
}

export type PerPersonInput = {
  participants: PerPersonParticipant[]
  sharedItems: PersonItem[]      // 공동 메뉴
  sharedDrinks: number           // 공동 술값
  rounding: RoundingId
}

export type PerPersonResult = {
  rows: {
    name: string
    ownAmount: number
    sharedShare: number
    drinkShare: number
    totalRaw: number
    total: number
    drinker: boolean
  }[]
  totalShared: number
  totalSharedDrinks: number
  grandTotalRaw: number
  grandTotal: number
}

export function calcPerPersonSplit(input: PerPersonInput): PerPersonResult {
  const totalShared = input.sharedItems.reduce((s, x) => s + x.price, 0)
  const totalSharedDrinks = input.sharedDrinks

  const sharedShareTotal = input.participants.reduce((s, p) => s + Math.max(0, p.sharedShare), 0)
  const drinkerCount = input.participants.filter(p => p.drinker).length

  const rows = input.participants.map(p => {
    const ownAmount = p.items.reduce((s, x) => s + x.price, 0)
    const sharedShare = sharedShareTotal > 0
      ? (totalShared * Math.max(0, p.sharedShare)) / sharedShareTotal
      : 0
    const drinkShare = (p.drinker && drinkerCount > 0)
      ? totalSharedDrinks / drinkerCount
      : 0
    const totalRaw = ownAmount + sharedShare + drinkShare
    return {
      name: p.name,
      ownAmount,
      sharedShare,
      drinkShare,
      totalRaw,
      total: applyRounding(totalRaw, input.rounding),
      drinker: p.drinker,
    }
  })

  const grandTotalRaw = rows.reduce((s, r) => s + r.totalRaw, 0)
  const grandTotal = rows.reduce((s, r) => s + r.total, 0)

  return { rows, totalShared, totalSharedDrinks, grandTotalRaw, grandTotal }
}

/* ───────── 4. 선결제자 최소 송금 ───────── */
export type PrepaidParticipant = {
  id: string
  name: string
  paid: number      // 실제 결제액
  share: number     // 부담해야 할 금액
  /** 찬조자 여부 — 찬조자는 정산 제외 (paid는 그대로 두고 share=0) */
  isContributor?: boolean
}

export type Transfer = { from: string; to: string; amount: number }

export type PrepaidResult = {
  totalPaid: number
  totalShare: number
  isBalanced: boolean
  diff: number  // totalPaid - totalShare
  balances: { name: string; balance: number }[]   // + 받을 / - 낼
  transfers: Transfer[]
  transferCount: number
}

/** Greedy 최소 송금 — 가장 큰 채권자/채무자 매칭 반복 */
export function calcMinimumTransfers(balances: { name: string; balance: number }[]): Transfer[] {
  const work = balances.map(b => ({ ...b }))
  const transfers: Transfer[] = []
  const EPS = 0.5  // 1원 미만은 무시

  let safety = 0
  while (safety++ < 1000) {
    // 가장 많이 낼 사람 (음수 최저)
    let debtor = work[0]; let credit = work[0]
    for (const p of work) {
      if (p.balance < debtor.balance) debtor = p
      if (p.balance > credit.balance) credit = p
    }
    if (Math.abs(debtor.balance) < EPS || credit.balance < EPS) break

    const amount = Math.min(Math.abs(debtor.balance), credit.balance)
    transfers.push({ from: debtor.name, to: credit.name, amount: Math.round(amount) })
    debtor.balance += amount
    credit.balance -= amount
  }
  return transfers
}

export function calcPrepaidSplit(participants: PrepaidParticipant[]): PrepaidResult {
  const totalPaid  = participants.reduce((s, p) => s + p.paid, 0)
  const totalShare = participants.reduce((s, p) => s + p.share, 0)
  const balances = participants.map(p => ({
    name: p.name,
    balance: p.paid - p.share,
  }))
  const transfers = calcMinimumTransfers(balances)
  return {
    totalPaid,
    totalShare,
    isBalanced: Math.abs(totalPaid - totalShare) < 1,
    diff: totalPaid - totalShare,
    balances,
    transfers,
    transferCount: transfers.length,
  }
}

/* ───────── localStorage ───────── */
export type SavedSplit = {
  id: string
  title: string
  total: number
  people: number
  perPerson: number
  scenario?: ScenarioId
  type: 'simple' | 'drink' | 'per-person' | 'prepaid'
  createdAt: string
}

const STORAGE_KEY = 'youtil-dutch-history-v1'

export function loadHistory(): SavedSplit[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
export function saveHistory(items: SavedSplit[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30))) } catch { /* */ }
}
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ─── 카카오톡 공유 텍스트 ─── */
export type ShareInput =
  | { kind: 'simple'; title: string; total: number; people: number; perPerson: number; remainder: number; payerName?: string; payerAccount?: string }
  | { kind: 'drink'; title: string; total: number; nonDrinkers: number; drinkers: number; nonDrinkerAmount: number; drinkerAmount: number; payerName?: string; payerAccount?: string }
  | { kind: 'per-person'; title: string; rows: { name: string; total: number }[]; payerName?: string; payerAccount?: string }
  | { kind: 'prepaid'; title: string; transfers: Transfer[]; payerName?: string; payerAccount?: string }

const fmt = (n: number) => n.toLocaleString('ko-KR') + '원'

export function generateShareMessage(input: ShareInput): string {
  const sep = '━━━━━━━━━━━━━━'
  const tail = `\n${sep}\nyoutil.kr 더치페이 계산기`

  if (input.kind === 'simple') {
    const lines = [
      `🍻 ${input.title}`,
      sep,
      `총 금액: ${fmt(input.total)}`,
      `인원: ${input.people}명`,
      `💰 1인당: ${fmt(input.perPerson)}`,
    ]
    if (input.remainder > 0) lines.push(`* 잔돈 ${fmt(input.remainder)} 공금으로`)
    else if (input.remainder < 0) lines.push(`* 부족 ${fmt(Math.abs(input.remainder))} (결제자 추가 부담)`)
    if (input.payerName) {
      lines.push('', '💸 입금 안내', `받을 사람: ${input.payerName}`)
      if (input.payerAccount) lines.push(input.payerAccount)
    }
    return lines.join('\n') + tail
  }

  if (input.kind === 'drink') {
    const lines = [
      `🍻 ${input.title}`,
      sep,
      `총 금액: ${fmt(input.total)}`,
      `인원: 비음주 ${input.nonDrinkers}명 / 음주 ${input.drinkers}명`,
      '💰 1인당',
      `· 비음주: ${fmt(input.nonDrinkerAmount)}`,
      `· 음주:   ${fmt(input.drinkerAmount)}`,
    ]
    if (input.payerName) {
      lines.push('', '💸 입금 안내', `받을 사람: ${input.payerName}`)
      if (input.payerAccount) lines.push(input.payerAccount)
    }
    return lines.join('\n') + tail
  }

  if (input.kind === 'per-person') {
    const lines = [
      `🍱 ${input.title}`,
      sep,
      ...input.rows.map(r => `· ${r.name}: ${fmt(r.total)}`),
    ]
    if (input.payerName) {
      lines.push('', '💸 입금 안내', `받을 사람: ${input.payerName}`)
      if (input.payerAccount) lines.push(input.payerAccount)
    }
    return lines.join('\n') + tail
  }

  // prepaid
  const lines = [
    `💸 ${input.title} — 송금 안내`,
    sep,
    `총 ${input.transfers.length}건의 송금`,
    ...input.transfers.map(t => `· ${t.from} → ${t.to}: ${fmt(t.amount)}`),
  ]
  return lines.join('\n') + tail
}

/* ─── 콤마 입력 헬퍼 ─── */
export function parseAmount(s: string): number {
  if (!s) return 0
  const cleaned = s.replace(/[^\d-]/g, '')
  const n = parseInt(cleaned, 10)
  return Number.isFinite(n) ? n : 0
}
export function fmtAmount(n: number): string {
  return n.toLocaleString('ko-KR')
}
