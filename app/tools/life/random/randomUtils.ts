/* ──────────────────────────────────────────────────────
   life/random/randomUtils.ts
   Fisher-Yates 셔플, 가중치 추첨, 팀 나누기,
   공정성 시뮬레이션, 룰렛 각도 계산, localStorage
   ────────────────────────────────────────────────────── */

/* ─── 셔플·기본 추첨 ─── */

/** Fisher-Yates 무작위 셔플 (Knuth, 1969) — O(n), 균등 분포 */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 단순 추첨 — count개를 무작위로 뽑음 (allowDuplicate=false 면 중복 X) */
export function pickItems<T>(items: T[], count: number, allowDuplicate = false): T[] {
  if (items.length === 0) return []
  if (allowDuplicate) {
    return Array.from({ length: count }, () =>
      items[Math.floor(Math.random() * items.length)]
    )
  }
  return shuffleArray(items).slice(0, Math.min(count, items.length))
}

/* ─── 가중치 추첨 ─── */
export type WeightedItem = { name: string; weight: number }

export function pickWithWeights(items: WeightedItem[], count: number, allowDuplicate = false): string[] {
  const result: string[] = []
  const pool = items.map(it => ({ ...it }))   // 얕은 복사

  for (let i = 0; i < count && pool.length > 0; i++) {
    const total = pool.reduce((s, x) => s + Math.max(0, x.weight), 0)
    if (total <= 0) break
    let r = Math.random() * total
    let idx = 0
    for (let j = 0; j < pool.length; j++) {
      r -= Math.max(0, pool[j].weight)
      if (r <= 0) { idx = j; break }
    }
    result.push(pool[idx].name)
    if (!allowDuplicate) pool.splice(idx, 1)
  }
  return result
}

/** 단일 가중치 추첨 — 인덱스 반환 (룰렛 각도 계산용) */
export function pickWeightedIndex(items: WeightedItem[]): number {
  const total = items.reduce((s, x) => s + Math.max(0, x.weight), 0)
  if (total <= 0) return 0
  let r = Math.random() * total
  for (let j = 0; j < items.length; j++) {
    r -= Math.max(0, items[j].weight)
    if (r <= 0) return j
  }
  return items.length - 1
}

/* ─── 팀 나누기 ─── */
export type TeamDivideOptions = {
  /** 팀 수 지정 (teamSize와 둘 중 하나) */
  teamCount?: number
  /** 팀당 인원 지정 */
  teamSize?: number
  /** 같은 팀 그룹 (각 그룹은 같은 팀에 묶임) */
  keepTogether?: string[][]
  /** 다른 팀 그룹 (각 그룹은 서로 다른 팀에 분산) */
  keepApart?: string[][]
  /** 각 팀 리더 (각 팀에 1명씩 배정) */
  leaders?: string[]
}

export function divideIntoTeams(members: string[], opts: TeamDivideOptions): string[][] {
  // 팀 수 결정
  let teamCount = opts.teamCount
  if (!teamCount && opts.teamSize) {
    teamCount = Math.max(1, Math.ceil(members.length / opts.teamSize))
  }
  teamCount = Math.max(1, Math.min(teamCount ?? 2, members.length))

  // 인덱스 기반 — 같은 이름이 여러 명이어도 누락되지 않음 (Set 사용 시 중복 이름이 1명으로 합쳐졌음)
  const teamsIdx: number[][] = Array.from({ length: teamCount }, () => [])
  const placed = new Array(members.length).fill(false)
  const takeByName = (name: string): number => {
    for (let i = 0; i < members.length; i++) if (!placed[i] && members[i] === name) return i
    return -1
  }

  // 1) 리더 우선 배치
  if (opts.leaders) {
    for (let i = 0; i < Math.min(opts.leaders.length, teamCount); i++) {
      const li = takeByName(opts.leaders[i])
      if (li >= 0) { teamsIdx[i].push(li); placed[li] = true }
    }
  }

  // 2) 함께 묶을 그룹 — 가장 작은 팀에 통째로 추가
  if (opts.keepTogether) {
    for (const group of opts.keepTogether) {
      const idxs: number[] = []
      for (const name of group) { const gi = takeByName(name); if (gi >= 0) { idxs.push(gi); placed[gi] = true } }
      if (idxs.length === 0) continue
      let minIdx = 0
      for (let k = 1; k < teamsIdx.length; k++) {
        if (teamsIdx[k].length < teamsIdx[minIdx].length) minIdx = k
      }
      teamsIdx[minIdx].push(...idxs)
    }
  }

  // 3) 나머지 셔플 후 균등 배치 (떨어뜨릴 그룹 고려)
  const remainingIdx: number[] = []
  for (let i = 0; i < members.length; i++) if (!placed[i]) remainingIdx.push(i)
  const pool = shuffleArray(remainingIdx)
  const findApartGroup = (m: string) => opts.keepApart?.find(g => g.includes(m)) ?? null

  for (const mi of pool) {
    const member = members[mi]
    let bestIdx = 0
    let bestSize = Infinity
    const apartGroup = findApartGroup(member)

    for (let k = 0; k < teamsIdx.length; k++) {
      // 떨어뜨릴 그룹 동료가 있는 팀은 회피
      if (apartGroup && teamsIdx[k].some(j => apartGroup.includes(members[j]) && j !== mi)) continue
      // teamSize 제한
      if (opts.teamSize && teamsIdx[k].length >= opts.teamSize) continue
      if (teamsIdx[k].length < bestSize) {
        bestSize = teamsIdx[k].length
        bestIdx = k
      }
    }
    // 모두 회피 불가 시 가장 작은 팀에 강제 배치
    if (bestSize === Infinity) {
      bestIdx = 0
      for (let k = 1; k < teamsIdx.length; k++) {
        if (teamsIdx[k].length < teamsIdx[bestIdx].length) bestIdx = k
      }
    }
    teamsIdx[bestIdx].push(mi)
  }

  return teamsIdx.map(t => t.map(i => members[i]))
}

/* ─── 발표 순서·자리 배치 ─── */
export type OrderOptions = {
  /** "이름:번호" 형태 고정 (1번부터, 'last' 가능) */
  fixed?: { name: string; position: number | 'last' }[]
  /** 제외할 이름 */
  excluded?: string[]
}

export function arrangeOrder(names: string[], opts: OrderOptions = {}): string[] {
  const filtered = names.filter(n => !opts.excluded?.includes(n))
  const fixed = opts.fixed ?? []
  // 고정된 이름은 일단 제외하고 셔플
  const fixedNames = new Set(fixed.map(f => f.name))
  const free = shuffleArray(filtered.filter(n => !fixedNames.has(n)))

  const total = filtered.length
  const result: (string | null)[] = Array(total).fill(null)

  // 고정 위치 먼저 채움 — 같은 사람을 두 위치(1번·마지막)에 동시에 고정하면 한 번만 적용(중복 배치 방지)
  const placedFixed = new Set<string>()
  for (const f of fixed) {
    if (!filtered.includes(f.name)) continue
    if (placedFixed.has(f.name)) continue
    const idx = f.position === 'last' ? total - 1 : Math.max(0, Math.min(total - 1, f.position - 1))
    if (result[idx] === null) { result[idx] = f.name; placedFixed.add(f.name) }
  }

  // 빈 자리에 free를 순서대로
  let fi = 0
  for (let i = 0; i < total; i++) {
    if (result[i] === null && fi < free.length) {
      result[i] = free[fi++]
    }
  }
  return result.map(r => r ?? '')
}

/** 자리 배치 (행×열) — 같은 셔플로 그리드 채우기 */
export type SeatOptions = {
  rows: number
  cols: number
  /** "이름:행,열" 고정 자리 (행/열 1부터) */
  fixed?: { name: string; row: number; col: number }[]
  keepApart?: string[][]
  excluded?: string[]
}
export function arrangeSeats(names: string[], opts: SeatOptions): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: opts.rows }, () =>
    Array(opts.cols).fill(null)
  )
  const filtered = names.filter(n => !opts.excluded?.includes(n))
  const fixedNames = new Set<string>()

  // 고정 자리
  for (const f of opts.fixed ?? []) {
    if (!filtered.includes(f.name)) continue
    const r = f.row - 1, c = f.col - 1
    if (r < 0 || r >= opts.rows || c < 0 || c >= opts.cols) continue
    if (grid[r][c] === null) {
      grid[r][c] = f.name
      fixedNames.add(f.name)
    }
  }

  // 나머지 셔플
  const free = shuffleArray(filtered.filter(n => !fixedNames.has(n)))
  const apart = opts.keepApart ?? []
  const findApartGroup = (m: string) => apart.find(g => g.includes(m)) ?? null

  // 자리별 위치 후보 (인접한 같은 그룹은 회피 시도)
  const isAdjacent = (r1: number, c1: number, r2: number, c2: number) =>
    Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1

  let idx = 0
  outer: for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      if (grid[r][c] !== null) continue
      if (idx >= free.length) break outer
      const member = free[idx]
      const apartGroup = findApartGroup(member)
      // 인접 셀에 같은 apart 그룹 멤버 있으면 다음 free 멤버로 시도
      if (apartGroup) {
        let conflict = false
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (Math.abs(dr) + Math.abs(dc) !== 1) continue
            const nr = r + dr, nc = c + dc
            if (nr < 0 || nr >= opts.rows || nc < 0 || nc >= opts.cols) continue
            const cell = grid[nr][nc]
            if (cell && apartGroup.includes(cell)) { conflict = true; break }
          }
          if (conflict) break
        }
        if (conflict) {
          // 뒤쪽 free와 swap 시도
          let swapped = false
          for (let k = idx + 1; k < free.length; k++) {
            const cand = free[k]
            const candApart = findApartGroup(cand)
            const candConflict = candApart?.some(name => {
              for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                if (Math.abs(dr) + Math.abs(dc) !== 1) continue
                const nr = r + dr, nc = c + dc
                if (nr < 0 || nr >= opts.rows || nc < 0 || nc >= opts.cols) continue
                if (grid[nr][nc] === name) return true
              }
              return false
            }) ?? false
            if (!candConflict) {
              ;[free[idx], free[k]] = [free[k], free[idx]]
              swapped = true
              break
            }
          }
          // 결국 회피 불가 시 그대로 배치
          void isAdjacent // (placeholder for future use)
          if (!swapped) { /* 강제 배치 */ }
        }
      }
      grid[r][c] = free[idx]
      idx++
    }
  }
  return grid
}

/* ─── 공정성 시뮬레이션 ─── */
export type FairnessRow = {
  name: string
  weight: number
  expectedPct: number
  actual: number
  actualPct: number
  expected: number
  deviation: number  // % 편차 (실제 - 기대) / 기대 × 100
}

export function simulateFairness(items: WeightedItem[], trials: number): FairnessRow[] {
  const totalWeight = items.reduce((s, x) => s + Math.max(0, x.weight), 0)
  // 이름이 아니라 인덱스로 카운트 — 같은 이름이 둘 이상이어도 각각 따로 집계됨
  const counts: number[] = new Array(items.length).fill(0)

  for (let i = 0; i < trials; i++) {
    const idx = pickWeightedIndex(items)
    counts[idx]++
  }

  return items.map((it, i) => {
    const expected = (it.weight / totalWeight) * trials
    const actual = counts[i]
    const actualPct = (actual / trials) * 100
    const expectedPct = (it.weight / totalWeight) * 100
    const deviation = expected > 0 ? ((actual - expected) / expected) * 100 : 0
    return {
      name: it.name,
      weight: it.weight,
      expectedPct,
      actual,
      actualPct,
      expected: Math.round(expected),
      deviation: Math.round(deviation * 10) / 10,
    }
  })
}

/* ─── 룰렛 각도 ─── */
export function calcRouletteAngle(
  items: WeightedItem[],
  selectedIndex: number,
  currentRotation = 0,
  baseRotations = 5,
): number {
  const total = items.reduce((s, x) => s + Math.max(0, x.weight), 0)
  if (total <= 0) return currentRotation
  let cum = 0
  for (let i = 0; i < selectedIndex; i++) cum += (items[i].weight / total) * 360
  const itemMid = cum + ((items[selectedIndex].weight / total) * 360) / 2
  // 선택 항목이 12시 방향에 멈추도록 하는 목표 잔여각 (0~360)
  const targetOffset = ((360 - itemMid) % 360 + 360) % 360
  // 현재 회전각의 잔여각 → 목표까지 앞으로(시계방향) 돌려야 하는 추가각
  const currentOffset = ((currentRotation % 360) + 360) % 360
  const delta = (targetOffset - currentOffset + 360) % 360
  // 누적 절대 회전각 반환 — 이전 위치와 무관하게 항상 선택 항목이 12시에 멈춤
  return currentRotation + baseRotations * 360 + delta
}

/** SVG 부채꼴 path (룰렛 슬라이스) */
export function describePieSlice(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const sweep = endDeg - startDeg
  if (sweep >= 359.99) {
    return `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} Z`
  }
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  const large = sweep > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

/* ─── 텍스트 → 명단 ─── */
export function parseNamesText(text: string): string[] {
  return text
    .split(/[\n,，、;]/u)
    .map(s => s.trim())
    .map(s => s.replace(/^\d+[.)]?\s*/, ''))   // "1. 김민수" → "김민수"
    .map(s => s.replace(/^[-•]\s*/, ''))       // "- 김민수" → "김민수"
    .filter(s => s.length > 0)
}

export function detectDuplicates(names: string[]): string[] {
  const counts: Record<string, number> = {}
  for (const n of names) counts[n] = (counts[n] || 0) + 1
  return Object.entries(counts).filter(([, c]) => c > 1).map(([n]) => n)
}

/* ─── localStorage ─── */
const STORAGE_KEY = 'youtil-random-lists-v1'

export type SavedList = {
  id: string
  name: string
  items: string[]
  createdAt: string
  updatedAt: string
}

export function loadLists(): SavedList[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
export function saveLists(items: SavedList[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30))) } catch { /* */ }
}
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ─── HSL 균등 분포 색상 (룰렛/팀) ─── */
export function genColors(count: number, saturation = 70, lightness = 60): string[] {
  return Array.from({ length: count }, (_, i) =>
    `hsl(${(i * 360) / count}, ${saturation}%, ${lightness}%)`
  )
}
