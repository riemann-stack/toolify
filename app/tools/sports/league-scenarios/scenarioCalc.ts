/* 축구 순위 경우의 수 엔진 — 잔여 경기 W/D/L 조합 전수 + 대회별 타이브레이커로 순위 판정.
   ⚠️ 베팅·도박 목적 아님. 확률은 '모든 결과(승/무/패) 동일 가정'의 단순 경우의 수 수치이며 전력 미반영.
   ⚠️ Option A(간단·정직): 스코어는 입력받지 않으므로 골득실로 갈리는 경계는 '확정' 대신 'GD에 따라 갈림'으로 분류.
      승점·다승·승자승 승점은 W/D/L만으로 확정 가능 → 그 선에서 갈리면 확정/탈락으로 단정. */

import { type CriterionKey, type Competition } from './tiebreakers'

export interface Team {
  id: string
  name: string
  win: number
  draw: number
  loss: number
  gf: number // 현재 누적 득점
  ga: number // 현재 누적 실점
}
export interface Match {
  home: string // team id
  away: string
}
export type Outcome = 'home' | 'draw' | 'away'
/** 이미 치른 경기 결과(선택) — 승자승(맞대결) 정확 계산용. 없으면 잔여 라운드 맞대결만으로 추정. */
export interface PlayedMatch {
  home: string
  away: string
  result: Outcome
}

export const teamPoints = (t: Pick<Team, 'win' | 'draw'>) => t.win * 3 + t.draw
export const teamPlayed = (t: Team) => t.win + t.draw + t.loss
export const teamGD = (t: Team) => t.gf - t.ga

/** 두 팀의 순서무관 키 (맞대결 중복·완전성 판정용) */
const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/** 한 조합 적용 후 각 팀의 확정 집계 (승점·다승). 스코어 미입력이라 gf/ga는 현재값 유지. */
interface FinalTeam {
  id: string
  points: number
  wins: number
  gf: number
  ga: number
  gd: number
  hasRemaining: boolean // 잔여 경기 보유 → 골득실 불확정
}

/** outcome → (homeΔ, awayΔ) 승점·승수 */
function applyOutcome(o: Outcome): { hPts: number; aPts: number; hWin: number; aWin: number } {
  if (o === 'home') return { hPts: 3, aPts: 0, hWin: 1, aWin: 0 }
  if (o === 'away') return { hPts: 0, aPts: 3, hWin: 0, aWin: 1 }
  return { hPts: 1, aPts: 1, hWin: 0, aWin: 0 }
}

function buildFinals(teams: Team[], remaining: Match[], combo: Outcome[]): Map<string, FinalTeam> {
  const m = new Map<string, FinalTeam>()
  const hasRem = new Set<string>()
  for (const mt of remaining) { hasRem.add(mt.home); hasRem.add(mt.away) }
  for (const t of teams) {
    m.set(t.id, {
      id: t.id, points: teamPoints(t), wins: t.win, gf: t.gf, ga: t.ga,
      gd: teamGD(t), hasRemaining: hasRem.has(t.id),
    })
  }
  remaining.forEach((mt, i) => {
    const o = combo[i]
    const d = applyOutcome(o)
    const h = m.get(mt.home); const a = m.get(mt.away)
    if (h) { h.points += d.hPts; h.wins += d.hWin }
    if (a) { a.points += d.aPts; a.wins += d.aWin }
  })
  return m
}

/** 그룹 내 맞대결(승자승) 승점 — 이미 치른 맞대결(played) + 이번 조합의 잔여 맞대결로 계산.
 *  ⚠️ played(이미 치른 맞대결 결과)가 없으면 승자승을 알 수 없어 null(불확정) 반환 →
 *     순위표만 입력했고 맞대결 기록이 없으면 '승자승(맞대결 결과 필요)'로 정직하게 표시. */
function headToHeadPoints(
  groupIds: string[],
  played: PlayedMatch[],
  remaining: Match[],
  combo: Outcome[],
  hasFullPlayed: boolean,
): Map<string, number> | null {
  if (!hasFullPlayed) return null // 이미 치른 맞대결 미입력 → 승자승 확정 불가
  const set = new Set(groupIds)
  const pts = new Map<string, number>(groupIds.map((id) => [id, 0]))
  const known: { home: string; away: string; result: Outcome }[] = []
  for (const p of played) if (set.has(p.home) && set.has(p.away)) known.push(p)
  remaining.forEach((mt, i) => { if (set.has(mt.home) && set.has(mt.away)) known.push({ ...mt, result: combo[i] }) })
  // ⚠️ 그룹 내 모든 팀쌍의 맞대결을 알아야 승자승 확정 가능 — 빠진 쌍이 있으면(이 그룹과 무관한
  //    played만 입력됐거나 일부 맞대결 미입력) 0점으로 가정하지 않고 null(불확정)로 정직 처리.
  const pairs = new Set<string>()
  for (const k of known) pairs.add(pairKey(k.home, k.away))
  const needed = (groupIds.length * (groupIds.length - 1)) / 2
  if (pairs.size < needed) return null
  for (const k of known) {
    const d = applyOutcome(k.result)
    pts.set(k.home, (pts.get(k.home) ?? 0) + d.hPts)
    pts.set(k.away, (pts.get(k.away) ?? 0) + d.aPts)
  }
  return pts
}

interface RankContext {
  played: PlayedMatch[]
  remaining: Match[]
  combo: Outcome[]
  hasFullPlayed: boolean // played 입력으로 맞대결 완전 계산 가능?
}

/** 한 criterion으로 그룹을 세분. 반환: 정렬된 하위그룹 배열. decidable=false면 score-dependent로 갈림(불확정). */
function partitionByCriterion(
  group: FinalTeam[],
  key: CriterionKey,
  ctx: RankContext,
): { subgroups: FinalTeam[][]; decidable: boolean } {
  // score-dependent(골득실·다득점 등): 그룹 내 모든 팀이 잔여 경기 없으면 현재값으로 확정, 아니면 불확정
  const allDone = group.every((t) => !t.hasRemaining)
  const valueOf = (t: FinalTeam): number | null => {
    switch (key) {
      case 'points': return t.points
      case 'wins': return t.wins
      case 'goalDifference': return allDone ? t.gd : null
      case 'goalsScored': return allDone ? t.gf : null
      case 'headToHeadPoints': {
        const h = headToHeadPoints(group.map((g) => g.id), ctx.played, ctx.remaining, ctx.combo, ctx.hasFullPlayed)
        return h ? (h.get(t.id) ?? 0) : null
      }
      // 승자승 골득실/다득점·원정·페어플레이·추첨 → 스코어/추가데이터 필요 → 불확정
      default: return null
    }
  }
  const vals = group.map(valueOf)
  if (vals.some((v) => v === null)) return { subgroups: [group], decidable: false }
  // 내림차순 정렬 후 동일값끼리 묶기
  const idx = group.map((_, i) => i).sort((a, b) => (vals[b] as number) - (vals[a] as number))
  const subgroups: FinalTeam[][] = []
  let cur: FinalTeam[] = []
  let prev: number | null = null
  for (const i of idx) {
    const v = vals[i] as number
    if (prev !== null && v !== prev) { subgroups.push(cur); cur = [] }
    cur.push(group[i]); prev = v
  }
  if (cur.length) subgroups.push(cur)
  return { subgroups, decidable: true }
}

export interface RankGroup {
  teams: FinalTeam[]
  /** 이 그룹이 둘 이상이면 score-dependent로 순위가 갈림(불확정). 단일 팀이면 순위 확정. */
  undeterminedBy: CriterionKey | null
}

/** 최종 집계 → 순위 그룹 목록(상위→하위). 그룹 크기>1 = 그 사이 순위는 불확정(undeterminedBy 사유). */
function rankFinals(finals: FinalTeam[], comp: Competition, ctx: RankContext): RankGroup[] {
  const result: RankGroup[] = []
  const recurse = (group: FinalTeam[], depth: number) => {
    if (group.length === 1) { result.push({ teams: group, undeterminedBy: null }); return }
    if (depth >= comp.order.length) { result.push({ teams: group, undeterminedBy: 'drawing' }); return }
    const key = comp.order[depth]
    const { subgroups, decidable } = partitionByCriterion(group, key, ctx)
    if (!decidable) {
      // 대회 규정은 기준을 순서대로 적용한다. 이 기준(예: 골득실)이 스코어 의존이라 확정 불가하면,
      // 그 뒤 기준은 이 기준이 갈린 뒤에야 의미가 있으므로 건너뛸 수 없음 → 이 지점에서 순위 불확정.
      result.push({ teams: group, undeterminedBy: key }); return
    }
    for (const sg of subgroups) recurse(sg, depth + 1)
  }
  recurse([...finals], 0)
  return result
}

export type FocusStatus = 'advance' | 'eliminated' | 'undetermined'
export interface ComboResult {
  combo: Outcome[]
  focusStatus: FocusStatus
  focusRankLo: number // 1-based 최선 순위
  focusRankHi: number // 최악 순위
  undeterminedBy: CriterionKey | null // undetermined일 때 사유
}

/** 한 조합에 대한 focus 팀 판정 */
function evalCombo(
  teams: Team[], remaining: Match[], combo: Outcome[],
  comp: Competition, advance: number, focusId: string,
  played: PlayedMatch[], hasFullPlayed: boolean,
): ComboResult {
  const finals = buildFinals(teams, remaining, combo)
  const groups = rankFinals([...finals.values()], comp, { played, remaining, combo, hasFullPlayed })
  // focus가 속한 그룹의 순위 범위 산정
  let rank = 1
  let focusGroup: RankGroup | null = null
  let lo = 1; let hi = 1
  for (const g of groups) {
    const inGroup = g.teams.some((t) => t.id === focusId)
    if (inGroup) { focusGroup = g; lo = rank; hi = rank + g.teams.length - 1; break }
    rank += g.teams.length
  }
  let status: FocusStatus
  if (!focusGroup) { status = 'eliminated' }
  else if (focusGroup.teams.length === 1) {
    status = lo <= advance ? 'advance' : 'eliminated'
  } else if (hi <= advance) status = 'advance' // 그룹 전체가 진출권 → 확정
  else if (lo > advance) status = 'eliminated' // 그룹 전체가 탈락권 → 확정
  else status = 'undetermined' // 진출 경계가 그룹을 가름
  return {
    combo: [...combo], focusStatus: status, focusRankLo: lo, focusRankHi: hi,
    undeterminedBy: status === 'undetermined' ? (focusGroup?.undeterminedBy ?? 'goalDifference') : null,
  }
}

/* ── 조합 전수 ── */
export const MAX_REMAINING_FULL = 11 // 3^11 = 177,147 — 이 이상은 전수 제한(성능·UI)

function* allCombos(n: number): Generator<Outcome[]> {
  const outs: Outcome[] = ['home', 'draw', 'away']
  const idx = new Array(n).fill(0)
  while (true) {
    yield idx.map((i) => outs[i])
    let k = n - 1
    while (k >= 0 && idx[k] === 2) { idx[k] = 0; k-- }
    if (k < 0) break
    idx[k]++
  }
}

export interface ScenarioInput {
  teams: Team[]
  remaining: Match[]
  played?: PlayedMatch[]
  competition: Competition
  advance: number
  focusId: string
}

export interface SelfPath {
  /** focus 자신의 잔여 경기 결과(순서=focusMatches) */
  ownOutcomes: Outcome[]
  ownMatches: Match[]
  /** 이 자기 결과 하에서: 항상 진출 / 항상 탈락 / 타 경기에 따라 갈림 */
  verdict: 'always_advance' | 'always_eliminated' | 'depends'
  advanceCount: number
  total: number
  undeterminedCount: number // GD/승자승 등으로 갈리는 조합 수
}

export interface ScenarioResult {
  total: number
  advanceCount: number // 진출 확정 조합 수
  eliminatedCount: number
  undeterminedCount: number // 골득실·승자승 등으로 갈리는 조합 수
  advanceProbability: number // = advanceCount / total (동일가정 단순 수치)
  selfAdvancePossible: boolean // 자력 진출 가능(어떤 자기결과로 타 경기 무관 진출)
  selfPaths: SelfPath[] // 자기 경기 결과별 분기
  combos: ComboResult[] // 전체(제한 내)
  tooMany: boolean // 잔여 경기 과다로 전수 제한
  focusName: string
}

export const MAX_COMBO_ROWS = 300 // 표시·반환용 보유 상한 — 전수 카운트는 그대로, 17만개 배열 보유만 방지

export function calcScenarios(input: ScenarioInput): ScenarioResult {
  const { teams, competition, advance, focusId } = input
  const played = input.played ?? []
  const hasFullPlayed = played.length > 0
  const focusName = teams.find((t) => t.id === focusId)?.name ?? focusId
  // 같은 팀쌍이 맞대결(played)과 잔여(remaining)에 동시 입력되면 모순 → played(실제 결과) 우선, 잔여에서 제거
  const playedPairs = new Set(played.map((p) => pairKey(p.home, p.away)))
  const remaining = input.remaining.filter((m) => !playedPairs.has(pairKey(m.home, m.away)))
  const n = remaining.length
  const tooMany = n > MAX_REMAINING_FULL

  if (tooMany) {
    return {
      total: 0, advanceCount: 0, eliminatedCount: 0, undeterminedCount: 0, advanceProbability: 0,
      selfAdvancePossible: false, selfPaths: [], combos: [], tooMany: true, focusName,
    }
  }

  // focus 자신의 잔여 경기 인덱스(자력/타력 분기용)
  const ownIdx = remaining.map((m, i) => (m.home === focusId || m.away === focusId ? i : -1)).filter((i) => i >= 0)
  const ownMatches = ownIdx.map((i) => remaining[i])

  const combos: ComboResult[] = [] // 표시용(상한 보유)
  const ownAgg = new Map<string, { adv: number; elim: number; und: number; total: number }>()
  let advanceCount = 0; let eliminatedCount = 0; let undeterminedCount = 0; let total = 0
  for (const combo of allCombos(n)) {
    const r = evalCombo(teams, remaining, combo, competition, advance, focusId, played, hasFullPlayed)
    total++
    if (combos.length < MAX_COMBO_ROWS) combos.push(r)
    if (r.focusStatus === 'advance') advanceCount++
    else if (r.focusStatus === 'eliminated') eliminatedCount++
    else undeterminedCount++
    // 자력/타력 집계(전체 조합 보유 없이 누적)
    const key = ownIdx.map((i) => combo[i]).join('|')
    let agg = ownAgg.get(key)
    if (!agg) { agg = { adv: 0, elim: 0, und: 0, total: 0 }; ownAgg.set(key, agg) }
    agg.total++
    if (r.focusStatus === 'advance') agg.adv++
    else if (r.focusStatus === 'eliminated') agg.elim++
    else agg.und++
  }

  const selfPaths: SelfPath[] = []
  for (const [key, agg] of ownAgg) {
    const ownOutcomes = key === '' ? [] : (key.split('|') as Outcome[])
    let verdict: SelfPath['verdict']
    if (agg.adv === agg.total) verdict = 'always_advance'
    else if (agg.elim === agg.total) verdict = 'always_eliminated'
    else verdict = 'depends'
    selfPaths.push({ ownOutcomes, ownMatches, verdict, advanceCount: agg.adv, total: agg.total, undeterminedCount: agg.und })
  }
  // 정렬: 항상진출 → 갈림 → 항상탈락
  const vrank = { always_advance: 0, depends: 1, always_eliminated: 2 }
  selfPaths.sort((a, b) => vrank[a.verdict] - vrank[b.verdict])
  const selfAdvancePossible = selfPaths.some((p) => p.verdict === 'always_advance')

  return {
    total, advanceCount, eliminatedCount, undeterminedCount,
    advanceProbability: total > 0 ? advanceCount / total : 0,
    selfAdvancePossible, selfPaths, combos, tooMany: false, focusName,
  }
}
