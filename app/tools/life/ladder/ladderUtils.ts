/* ──────────────────────────────────────────────────────
   life/ladder/ladderUtils.ts
   사다리 생성, 경로 추적, 자동 결과 채우기,
   localStorage 관리
   ────────────────────────────────────────────────────── */

export const MAX_PARTICIPANTS = 16
export const MIN_PARTICIPANTS = 2

/* ─── 캐릭터 이모지 (참가자별 자동 배정) ─── */
export const CHARACTER_EMOJIS = [
  '🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁',
  '🐸', '🐵', '🐔', '🐧', '🦄', '🐲', '🦖', '🐢',
]

/* ─── 참가자별 색상 (HSL 균등) ─── */
export function getParticipantColor(index: number, total: number): string {
  const hue = (index * 360) / Math.max(1, total)
  return `hsl(${hue}, 70%, 60%)`
}

/* ─── 애니메이션 속도 (느림·빠름) ─── */
export type AnimSpeed = 'slow' | 'fast'
export const ANIMATION_SPEEDS: { id: AnimSpeed; name: string; drawMs: number; staggerMs: number }[] = [
  { id: 'slow', name: '느림', drawMs: 2000, staggerMs: 1500 },
  { id: 'fast', name: '빠름', drawMs: 700,  staggerMs: 500  },
]

/* ─── 가로줄 난이도 (보통·많이) ─── */
export type Difficulty = 'normal' | 'hard'
export const DIFFICULTIES: { id: Difficulty; name: string; rowsMul: number; rungProb: number }[] = [
  { id: 'normal', name: '보통 (권장)', rowsMul: 2.0, rungProb: 0.45 },
  { id: 'hard',   name: '많이 (복잡)', rowsMul: 3.0, rungProb: 0.55 },
]

/* ─── 사다리 생성 ─── */
/** 가로줄 데이터 — boolean[][] 행렬, row[c] = true 면 c 와 c+1 사이 가로줄 */
export function generateLadder(participantCount: number, rows: number, rungProb = 0.45): boolean[][] {
  const cols = participantCount
  return Array.from({ length: rows }, () => {
    const row = Array(cols - 1).fill(false)
    let c = 0
    while (c < cols - 1) {
      // 인접 가로줄 방지 (c, c+1 위치에 동시 X)
      if (Math.random() < rungProb) {
        row[c] = true
        c += 2
      } else {
        c += 1
      }
    }
    return row
  })
}

/** 도착점 추적 — 출발 컬럼 → 도착 컬럼 */
export function traceDest(ladder: boolean[][], start: number): number {
  let pos = start
  for (const row of ladder) {
    if (pos < row.length && row[pos]) pos++
    else if (pos > 0 && row[pos - 1]) pos--
  }
  return pos
}

/** 단계별 경로 — 각 행마다 (col) 위치, 중간 가로 이동 포함 */
export type PathStep = { col: number; row: number; horizontalTo?: number }

export function tracePath(ladder: boolean[][], start: number): PathStep[] {
  const steps: PathStep[] = []
  let pos = start
  // 시작점 (row 0)
  steps.push({ col: pos, row: 0 })
  for (let r = 0; r < ladder.length; r++) {
    const row = ladder[r]
    let nextCol = pos
    if (pos < row.length && row[pos]) nextCol = pos + 1
    else if (pos > 0 && row[pos - 1]) nextCol = pos - 1
    if (nextCol !== pos) {
      steps.push({ col: pos, row: r, horizontalTo: nextCol })
    }
    pos = nextCol
    steps.push({ col: pos, row: r + 1 })
  }
  return steps
}

/* ─── Fisher-Yates 셔플 ─── */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ─── SVG 경로 — 단일 path 문자열·전체 길이 ─── */
export type PathSeg = { x1: number; y1: number; x2: number; y2: number }

export function segsToPathD(segs: PathSeg[]): string {
  if (segs.length === 0) return ''
  let d = `M ${segs[0].x1} ${segs[0].y1}`
  for (const sg of segs) d += ` L ${sg.x2} ${sg.y2}`
  return d
}

export function pathTotalLength(segs: PathSeg[]): number {
  return segs.reduce((sum, sg) => sum + Math.hypot(sg.x2 - sg.x1, sg.y2 - sg.y1), 0)
}

/* ─── localStorage ─── */
const STORAGE_KEY = 'youtil-ladder-saved-v1'

export type SavedGame = {
  id: string
  name: string
  participants: string[]
  results: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export function loadGames(): SavedGame[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
export function saveGames(items: SavedGame[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30))) } catch { /* */ }
}
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ─── 텍스트 → 명단 파싱 ─── */
export function parseNamesText(text: string): string[] {
  return text
    .split(/[\n,，、;]/u)
    .map(s => s.trim())
    .map(s => s.replace(/^\d+[.)]?\s*/, ''))
    .map(s => s.replace(/^[-•]\s*/, ''))
    .filter(s => s.length > 0)
}
