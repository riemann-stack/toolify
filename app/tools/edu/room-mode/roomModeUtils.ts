/* 룸 모드 계산기 — 데이터·계산 유틸 */

export type ModeType = 'axial' | 'tangential' | 'oblique'

export interface RoomMode {
  p: number          // L 축 차수 (세로 = length)
  q: number          // W 축 차수 (가로 = width)
  r: number          // H 축 차수 (높이)
  freq: number       // Hz
  type: ModeType
  strength: number   // 1.0 / 0.7 / 0.4 (axial > tangential > oblique)
}

/* ─────────────────────────────────────────────
   음속 (T = 섭씨)
   c = 331.3 + 0.606 × T (m/s)
   ───────────────────────────────────────────── */
export function soundSpeed(tempC: number): number {
  return 331.3 + 0.606 * tempC
}

/* ─────────────────────────────────────────────
   Rayleigh 룸 모드 공식
   f(p,q,r) = (c/2) × √[(p/L)² + (q/W)² + (r/H)²]
   ───────────────────────────────────────────── */
export function modeFreq(p: number, q: number, r: number, L: number, W: number, H: number, c: number): number {
  return (c / 2) * Math.sqrt((p / L) ** 2 + (q / W) ** 2 + (r / H) ** 2)
}

export function classifyMode(p: number, q: number, r: number): ModeType {
  const nonZero = [p, q, r].filter((n) => n > 0).length
  if (nonZero === 1) return 'axial'
  if (nonZero === 2) return 'tangential'
  return 'oblique'
}

export function modeStrength(type: ModeType): number {
  if (type === 'axial') return 1.0
  if (type === 'tangential') return 0.7
  return 0.4
}

/* 모든 모드 추출 (각 축 maxN 차까지, 20~freqMax Hz 범위) */
export function buildAllModes(L: number, W: number, H: number, c: number, maxN = 5, freqMax = 300): RoomMode[] {
  const modes: RoomMode[] = []
  for (let p = 0; p <= maxN; p++) {
    for (let q = 0; q <= maxN; q++) {
      for (let r = 0; r <= maxN; r++) {
        if (p === 0 && q === 0 && r === 0) continue
        const freq = modeFreq(p, q, r, L, W, H, c)
        if (freq < 20 || freq > freqMax) continue
        const type = classifyMode(p, q, r)
        modes.push({ p, q, r, freq, type, strength: modeStrength(type) })
      }
    }
  }
  return modes.sort((a, b) => a.freq - b.freq)
}

/* ─────────────────────────────────────────────
   슈로더 주파수
   fs = 2000 × √(RT60 / V)
   V = L × W × H (m³)
   ───────────────────────────────────────────── */
export function schroederFreq(L: number, W: number, H: number, rt60 = 0.4): number {
  const V = L * W * H
  return V > 0 ? 2000 * Math.sqrt(rt60 / V) : 0
}

/* ─────────────────────────────────────────────
   가장 큰 갭 (모드 분포 균일도) — 200Hz 미만에서
   ───────────────────────────────────────────── */
export function largestGap(modes: RoomMode[]): { gap: number; from: number; to: number } {
  const sub = modes.filter((m) => m.freq <= 200).map((m) => m.freq)
  if (sub.length < 2) return { gap: 0, from: 0, to: 0 }
  let maxGap = 0
  let from = 0
  let to = 0
  for (let i = 1; i < sub.length; i++) {
    const g = sub[i] - sub[i - 1]
    if (g > maxGap) {
      maxGap = g
      from = sub[i - 1]
      to = sub[i]
    }
  }
  return { gap: maxGap, from, to }
}

/* 부밍 위험 구간 (인접 모드 < 5Hz로 몰린 곳) */
export function boomingRanges(modes: RoomMode[]): { freq: number; count: number }[] {
  const sub = modes.filter((m) => m.freq <= 200)
  const ranges: { freq: number; count: number }[] = []
  for (let i = 0; i < sub.length; i++) {
    let count = 1
    let j = i + 1
    while (j < sub.length && sub[j].freq - sub[i].freq < 5) {
      count++
      j++
    }
    if (count >= 3) {
      ranges.push({ freq: sub[i].freq, count })
      i = j - 1
    }
  }
  return ranges
}

/* ─────────────────────────────────────────────
   방 비율 진단
   ───────────────────────────────────────────── */

export interface RatioCheck {
  ratio: { w: number; l: number; h: number }   // 정규화 (작은 = 1)
  diagnosis: 'S' | 'A' | 'B' | 'C' | 'D'
  label: string
  color: string
  desc: string
}

/** Sepmeyer 황금 비율 = 1 : 1.14 : 1.39 */
export const GOLDEN_RATIO = { w: 1.14, l: 1.39, h: 1.0 }

/** Bolt area 안전 영역 (대략) */
export function inBoltArea(wl: number, hl: number): boolean {
  // wl = W/H, ll = L/H
  // 안전한 영역: 1.1 < wl < 2.5 && 1.4 < ll < 4.0 && (wl + ll) > 3
  // 단순화한 안전 박스
  if (wl < 1.05 || wl > 2.5) return false
  if (hl < 1.05 || hl > 2.5) return false
  if (wl + hl < 2.5) return false
  return true
}

export function diagnoseRatio(W: number, L: number, H: number): RatioCheck {
  const min = Math.min(W, L, H)
  const ratio = { w: W / min, l: L / min, h: H / min }

  /* 정육면체 검사 */
  const isCube = Math.abs(ratio.w - ratio.l) < 0.05 && Math.abs(ratio.l - ratio.h) < 0.05
  if (isCube) {
    return { ratio, diagnosis: 'D', label: '정육면체 위험', color: '#FF3E8C', desc: '모드가 한 점에 중첩 — 부밍·먹먹함 매우 심함. 가구 배치·트랩으로 보완 필수.' }
  }

  /* 두 축이 같은 위험 */
  const twoSame = Math.abs(ratio.w - ratio.l) < 0.05 || Math.abs(ratio.l - ratio.h) < 0.05 || Math.abs(ratio.w - ratio.h) < 0.05
  if (twoSame) {
    return { ratio, diagnosis: 'C', label: '두 축 동일', color: '#FFB83E', desc: '두 축이 같은 길이 — 모드 중첩 위험. 일부 주파수 부밍 가능.' }
  }

  /* 황금비 거리 (Sepmeyer 1:1.14:1.39 기준) */
  const sortedR = [ratio.w, ratio.l, ratio.h].sort((a, b) => a - b)
  const target = [1, 1.14, 1.39]
  const dist = Math.sqrt(
    (sortedR[0] - target[0]) ** 2 + (sortedR[1] - target[1]) ** 2 + (sortedR[2] - target[2]) ** 2,
  )

  if (dist < 0.10) return { ratio, diagnosis: 'S', label: '황금비 (Sepmeyer)', color: '#3EFFD0', desc: '이상적인 음향 비율 — 모드 분포 균일.' }
  if (dist < 0.25) return { ratio, diagnosis: 'A', label: '우수',                  color: '#3EFF9B', desc: '권장 비율에 매우 가까움. 일반 부밍 적음.' }
  if (dist < 0.50) return { ratio, diagnosis: 'B', label: '양호',                  color: '#3EC8FF', desc: '평균적인 음향. 트랩으로 부밍 보완.' }
  if (dist < 1.00) return { ratio, diagnosis: 'C', label: '주의',                  color: '#FFB83E', desc: '비율이 좋지 않음. 베이스 트랩 권장.' }
  return { ratio, diagnosis: 'D', label: '불리한 비율',                            color: '#FF3E8C', desc: '음향적으로 매우 불리. 트랩·EQ 보정 필수.' }
}

/* ─────────────────────────────────────────────
   Bonello criterion (1/3 옥타브 대역별 모드 개수)
   ───────────────────────────────────────────── */

export const THIRD_OCTAVE_BANDS = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315,
]

export function bonelloAnalysis(modes: RoomMode[]): { freq: number; count: number }[] {
  const result = THIRD_OCTAVE_BANDS.map((f) => ({ freq: f, count: 0 }))
  modes.forEach((m) => {
    const fLog = Math.log2(m.freq / 1000)
    const fIdx = Math.round((fLog + 5.66) / (1 / 3))
    if (fIdx >= 0 && fIdx < result.length) {
      result[fIdx].count++
    }
  })
  return result
}

/* ─────────────────────────────────────────────
   1차 모드 음압 분포 (탭 2 컬러맵)
   p(x) = cos(n × π × x / L)
   x=0 (벽) → ±1 (최대)
   x=L/2 (중앙) → 0 (노드)
   ───────────────────────────────────────────── */

/** 위치 (xRel, yRel) ∈ [0,1] 의 1차 모드 음압 절대값 (0~1) */
export function pressureAt(xRel: number, yRel: number): number {
  const px = Math.abs(Math.cos(Math.PI * xRel))   // L 1차 모드
  const py = Math.abs(Math.cos(Math.PI * yRel))   // W 1차 모드
  // 두 모드의 합성 (RMS)
  return Math.sqrt((px ** 2 + py ** 2) / 2)
}

/* 위치 점수 (0~100) — 모드 노드 영역에 가까울수록 좋음 */
export function listenerScore(xRel: number, yRel: number): number {
  const p = pressureAt(xRel, yRel)
  // 음압이 낮을수록 좋음 (모드 골)
  // 단, 38% 룰 위치 (L 길이 0.38)에 보너스
  const ruleDist = Math.abs(yRel - 0.38)
  const ruleBonus = Math.max(0, 1 - ruleDist * 3) * 20
  return Math.round(Math.max(0, Math.min(100, (1 - p) * 80 + ruleBonus)))
}

/* ─────────────────────────────────────────────
   한국 거실 프리셋
   ───────────────────────────────────────────── */

export interface RoomPreset {
  id: string
  emoji: string
  label: string
  L: number
  W: number
  H: number
}

export const ROOM_PRESETS: RoomPreset[] = [
  { id: 'apt17', emoji: '🏠', label: '17평 거실',     L: 4.0, W: 3.5, H: 2.4 },
  { id: 'apt24', emoji: '🏠', label: '24평 거실',     L: 5.0, W: 3.8, H: 2.4 },
  { id: 'apt32', emoji: '🏘️', label: '32평 거실',     L: 5.5, W: 4.2, H: 2.4 },
  { id: 'studio', emoji: '🛏️', label: '원룸',          L: 4.0, W: 3.0, H: 2.3 },
  { id: 'small',  emoji: '🎙️', label: '작은 스튜디오', L: 3.5, W: 2.5, H: 2.4 },
]

/* ─────────────────────────────────────────────
   베이스 트랩
   ───────────────────────────────────────────── */

export interface TrapInfo {
  id: string
  emoji: string
  label: string
  effectiveFrom: number  // Hz
  thicknessMm: string
  position: string
  diyPrice: string
  proPrice: string
  desc: string
  color: string
}

export const TRAPS: TrapInfo[] = [
  {
    id: 'corner',
    emoji: '🔺',
    label: '코너 트랩 (Super Chunk)',
    effectiveFrom: 60,
    thicknessMm: '300~600mm',
    position: '3 코너 우선 (앞 양쪽 + 뒤 1개)',
    diyPrice: 'DIY 5~10만원/개',
    proPrice: '완제품 10~30만원/개',
    desc: '가장 강력. 모든 축 모드의 압력 최대 지점이 코너에 모여 있음.',
    color: '#FF3E8C',
  },
  {
    id: 'wall',
    emoji: '🟧',
    label: '벽 트랩 (Acoustic Panel)',
    effectiveFrom: 100,
    thicknessMm: '100~200mm',
    position: '1차 반사 지점 (스피커-청취자 사이 측벽)',
    diyPrice: 'DIY 3~7만원/개',
    proPrice: '완제품 5~15만원/개',
    desc: '중·고음 흡수 + 일부 저음. 1차 반사음 제거에 효과.',
    color: '#FFB83E',
  },
  {
    id: 'membrane',
    emoji: '🟨',
    label: '멤브레인 트랩 (Panel Absorber)',
    effectiveFrom: 40,
    thicknessMm: '50~100mm',
    position: '벽면 수직 부착',
    diyPrice: 'DIY 8~15만원/개',
    proPrice: '완제품 15~40만원/개',
    desc: '저주파 전용. 특정 주파수 대역 흡수 — 설계 정확도 중요.',
    color: '#3EC8FF',
  },
  {
    id: 'helmholtz',
    emoji: '🔊',
    label: '헬름홀츠 흡음기',
    effectiveFrom: 30,
    thicknessMm: '내부 공동 깊이 가변',
    position: '특정 주파수 위치',
    diyPrice: 'DIY 10~20만원/개',
    proPrice: '완제품 20~50만원/개',
    desc: '특정 주파수만 정확히 흡수. 주파수 튜닝 가능 (병 모양 원리).',
    color: '#3EFFD0',
  },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const MODE_COLORS = {
  axial: '#FF3E8C',
  tangential: '#FFB83E',
  oblique: '#3EFFD0',
}

export const MODE_LABELS = {
  axial: '축방향 (Axial)',
  tangential: '접선 (Tangential)',
  oblique: '사선 (Oblique)',
}
