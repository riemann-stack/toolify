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
  // 난이도는 가로줄 개수(보이는 복잡도)만 바꾼다. 도착 확률은 generateFairLadder가 난이도와 관계없이 균등(1/n)으로 맞춘다.
  { id: 'normal', name: '보통 (권장)', rowsMul: 3.0, rungProb: 0.5 },
  { id: 'hard',   name: '많이 (복잡)', rowsMul: 5.0, rungProb: 0.6 },
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

/** 공정한 사다리 — 도착 순열이 정확히 균등(누가 어느 결과에 닿을 확률이든 1/n).
 *  무작위 가로줄만 쓰면 가까운 칸으로 내려갈 확률이 커서(8명·보통: 같은 칸 19.6% vs 반대 끝 5.8%)
 *  입력 순서가 결과를 좌우한다. 그래서 ① 균등 난수 순열 π를 먼저 뽑고 ② 위·아래는 평소처럼 무작위
 *  가로줄로 채운 뒤 ③ 가운데 n행에 홀짝 교환 정렬(odd-even transposition sort)로 가로줄을 놓아
 *  전체 도착이 π가 되게 만든다. π가 위·아래 가로줄과 독립이므로 결과 분포는 정확히 균등하다.
 *  행 수는 rows 그대로 (rows < n이면 n행). */
export function generateFairLadder(participantCount: number, rows: number, rungProb = 0.45): boolean[][] {
  const n = participantCount
  if (n < 2) return Array.from({ length: Math.max(0, rows) }, () => [])
  const fixRows = n                       // 홀짝 교환 정렬은 n라운드 안에 끝난다
  const free = Math.max(0, rows - fixRows)
  const topRows = Math.floor(free / 2)
  const top = generateLadder(n, topRows, rungProb)
  const bottom = generateLadder(n, free - topRows, rungProb)
  const target = shuffleArray(Array.from({ length: n }, (_, i) => i))   // target[start] = 도착 칸
  // 아래 구간을 지나면 칸 x → bottomDest[x]. 도착이 target[s]가 되려면 가운데 구간 끝에서 bottomInv[target[s]]에 있어야 함
  const bottomInv = Array(n).fill(0)
  for (let x = 0; x < n; x++) bottomInv[traceDest(bottom, x)] = x
  // arr[col] = 지금 col에 있는 참가자가 가운데 구간 끝에서 가야 할 칸
  const arr = Array(n).fill(0)
  for (let st = 0; st < n; st++) arr[traceDest(top, st)] = bottomInv[target[st]]
  const mid: boolean[][] = []
  for (let round = 0; round < fixRows; round++) {
    const row = Array(n - 1).fill(false)
    for (let c = round % 2; c < n - 1; c += 2) {
      if (arr[c] > arr[c + 1]) {
        ;[arr[c], arr[c + 1]] = [arr[c + 1], arr[c]]
        row[c] = true
      }
    }
    mid.push(row)
  }
  return [...top, ...mid, ...bottom]
}

/** 저장·가져오기한 가로줄이 현재 인원·행 수와 맞는지 (행 길이 n−1, 인접 가로줄 없음) */
export function isValidLadder(ladder: unknown, participantCount: number, rows?: number): ladder is boolean[][] {
  if (!Array.isArray(ladder) || ladder.length === 0) return false
  if (rows !== undefined && ladder.length !== rows) return false
  return ladder.every((row) =>
    Array.isArray(row) && row.length === participantCount - 1
    && row.every((v, c) => typeof v === 'boolean' && !(v && row[c + 1] === true)))
}

/** 자기 배정 회피 사다리 — 참가자 이름이 자신의 도착 결과와 같지 않도록 재생성(시크릿 산타 등).
 *  names/results를 넘길 때만(= '자기 배정 피하기'를 켰을 때만) 적용한다.
 *  데인지먼트가 불가능하면(중복 이름 등) maxTries 후 마지막 사다리를 반환. */
export function generateLadderNoSelf(
  participantCount: number, rows: number, rungProb: number,
  names?: string[], results?: string[], maxTries = 200,
): boolean[][] {
  let ladder = generateFairLadder(participantCount, rows, rungProb)
  if (!names || !results) return ladder
  for (let t = 0; t < maxTries; t++) {
    let selfMatch = false
    for (let i = 0; i < participantCount; i++) {
      const n = names[i]
      if (n && n.trim() !== '' && n === results[traceDest(ladder, i)]) { selfMatch = true; break }
    }
    if (!selfMatch) return ladder
    ladder = generateFairLadder(participantCount, rows, rungProb)
  }
  return ladder
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
  /** 저장 시점의 가로줄·난이도 — 불러오면 동일한 사다리·결과 복원 (없으면 새로 생성) */
  ladder?: boolean[][]
  difficulty?: Difficulty
  notes?: string
  createdAt: string
  updatedAt: string
}

/** 저장·가져오기 게임 검증 — 가로줄은 치수가 맞지 않으면 버리고(불러올 때 새로 생성) 게임은 살린다 */
export function sanitizeGame(v: unknown): SavedGame | null {
  if (!v || typeof v !== 'object') return null
  const x = v as Record<string, unknown>
  const strArr = (a: unknown) => Array.isArray(a) && a.every((s) => typeof s === 'string')
  if (typeof x.id !== 'string' || typeof x.name !== 'string') return null
  if (!strArr(x.participants) || !strArr(x.results)) return null
  const participants = x.participants as string[]
  if (participants.length < MIN_PARTICIPANTS || participants.length > MAX_PARTICIPANTS) return null
  const results = (x.results as string[]).slice(0, participants.length)
  while (results.length < participants.length) results.push('')
  const difficulty = DIFFICULTIES.some((d) => d.id === x.difficulty) ? (x.difficulty as Difficulty) : undefined
  const ladder = isValidLadder(x.ladder, participants.length) ? x.ladder : undefined
  const now = new Date().toISOString()
  return {
    id: x.id, name: x.name, participants, results, ladder, difficulty,
    notes: typeof x.notes === 'string' ? x.notes : undefined,
    createdAt: typeof x.createdAt === 'string' ? x.createdAt : now,
    updatedAt: typeof x.updatedAt === 'string' ? x.updatedAt : now,
  }
}

export function loadGames(): SavedGame[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr: unknown = JSON.parse(raw)
    return Array.isArray(arr) ? arr.map(sanitizeGame).filter((g): g is SavedGame => g !== null) : []
  } catch { return [] }
}
export function saveGames(items: SavedGame[]) {
  if (typeof window === 'undefined') return
  // 30개 초과 시 가장 오래된 것을 버리고 최신 30개 유지 (새 항목이 버려지지 않도록)
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(-30))) } catch { /* */ }
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
