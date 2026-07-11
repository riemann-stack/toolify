/* ──────────────────────────────────────────────────────
   sports/park-golf/parkGolfData.ts
   파크골프 스코어카드 — 표준 코스·스코어 용어·OB 규정
   ──────────────────────────────────────────────────────
   근거 (2026-07 웹검증 — 리서치+적대검증 워크플로, 경기규칙 원문 확인)
   - 표준 코스: 9홀 = 파33 (파3×4 + 파4×4 + 파5×1), 18홀 = 파66 — 국내·국제(IPGA) 공통.
     홀 길이(국내 협회 계열): 파3 40~60m / 파4 60~100m / 파5 100~150m (9홀 500~790m).
     국제(IPGA·NPGA 채택)는 1홀 최대 100m·9홀 500m 이내 — 기준 주체 구분 표기.
   - OB: 대한파크골프협회 경기규칙 제8조 "모든 벌타는 2타" — OB는 2벌타.
     처치(제23조): 벗어난 지점에서 깃대를 보고 좌우 2클럽 이내(홀컵에 가깝지 않게)에 놓고
     플레이. 티샷 OB면 다음 샷이 4타째. 벌타는 타수에 가산해 합계를 기록.
   - 최대 타수 제한: 공식 규칙엔 없음(홀아웃 원칙). 더블파 컷은 대회·구장 로컬룰 관행
     → 옵션으로 구현.
   - 조 편성: 3~4명 (경기규칙 제4조). 2번 홀부터 직전 홀 최저타 순(아너).
   - 용구: 클럽 1자루(86cm·600g 이하, 제7조)·공 지름 6cm(80~95g, NPGA 공인).
   - 스코어 용어: 골프와 동일 (이글·버디·파·보기·더블보기·더블파(양파)).
   ────────────────────────────────────────────────────── */

/** 표준 9홀 파 배열 (파3×4 + 파4×4 + 파5×1 = 33) — 홀 순서는 구장마다 달라 편집 가능 */
export const DEFAULT_PARS_9 = [4, 3, 4, 5, 3, 4, 3, 4, 3]

export const MAX_PLAYERS = 4
export const MAX_STROKES = 15

export interface ScoreTerm {
  diff: number
  label: string
  /** 표시 색 토큰 */
  color: string
}

export function scoreTerm(strokes: number, par: number): ScoreTerm | null {
  if (strokes <= 0) return null
  if (strokes === 1) return { diff: strokes - par, label: '홀인원', color: 'var(--accent-ink)' }
  const d = strokes - par
  if (strokes >= par * 2) return { diff: d, label: '더블파', color: 'var(--danger)' }
  if (d <= -3) return { diff: d, label: '알바트로스', color: 'var(--accent-ink)' }
  if (d === -2) return { diff: d, label: '이글', color: 'var(--accent-ink)' }
  if (d === -1) return { diff: d, label: '버디', color: 'var(--success)' }
  if (d === 0) return { diff: d, label: '파', color: 'var(--text)' }
  if (d === 1) return { diff: d, label: '보기', color: 'var(--warning)' }
  if (d === 2) return { diff: d, label: '더블보기', color: 'var(--warning)' }
  return { diff: d, label: `+${d}`, color: 'var(--danger)' }
}

export interface PlayerTotal {
  total: number
  /** 입력된 홀만의 파 합 대비 */
  toPar: number
  holesPlayed: number
  front: number
  back: number
}

export function playerTotal(scores: number[], pars: number[]): PlayerTotal {
  let total = 0, parSum = 0, played = 0, front = 0, back = 0
  scores.forEach((sc, i) => {
    if (sc > 0 && pars[i] > 0) {
      total += sc
      parSum += pars[i]
      played += 1
      if (i < 9) front += sc
      else back += sc
    }
  })
  return { total, toPar: total - parSum, holesPlayed: played, front, back }
}

/** 순위 (총타수 오름차순, 미입력자는 뒤로) — 동타는 공동 순위 */
export function rankPlayers(totals: PlayerTotal[]): (number | null)[] {
  const entries = totals.map((t, i) => ({ i, t }))
  const played = entries.filter((e) => e.t.holesPlayed > 0)
  played.sort((a, b) => a.t.total - b.t.total)
  const ranks: (number | null)[] = totals.map(() => null)
  played.forEach((e, idx) => {
    ranks[e.i] = idx > 0 && played[idx - 1].t.total === e.t.total ? ranks[played[idx - 1].i] : idx + 1
  })
  return ranks
}

/* 저장 라운드 (localStorage) */
export interface SavedRound {
  id: string
  date: string
  course: string
  holeCount: 9 | 18
  pars: number[]
  players: { name: string; scores: number[] }[]
}

export const ROUNDS_KEY = 'youtil:park-golf:rounds-v1'
export const MAX_ROUNDS = 30

export function isValidRound(r: unknown): r is SavedRound {
  if (typeof r !== 'object' || r === null) return false
  const o = r as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.date === 'string' &&
    typeof o.course === 'string' &&
    (o.holeCount === 9 || o.holeCount === 18) &&
    Array.isArray(o.pars) && o.pars.every((p) => typeof p === 'number') &&
    Array.isArray(o.players) &&
    o.players.every((p) => {
      if (typeof p !== 'object' || p === null) return false
      const pp = p as Record<string, unknown>
      return typeof pp.name === 'string' && Array.isArray(pp.scores) && pp.scores.every((s) => typeof s === 'number')
    })
  )
}

export function loadRounds(): SavedRound[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ROUNDS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.filter(isValidRound) : []
  } catch { return [] }
}

export function saveRounds(rounds: SavedRound[]): void {
  try { localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds.slice(0, MAX_ROUNDS))) } catch { /* noop */ }
}
