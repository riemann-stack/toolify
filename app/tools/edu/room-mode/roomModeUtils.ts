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

/** 상대 진폭(축방향=1): 접선 −3dB ≈ 0.71, 사선 −6dB = 0.5
    (Morse & Bolt 1944 유도·Everest Master Handbook 채택 — 에너지 기준으론 1/2·1/4).
    ⚠️ 예전 사선 0.4는 진폭(0.5)에도 에너지(0.25)에도 해당 없는 무근거 값. */
export function modeStrength(type: ModeType): number {
  if (type === 'axial') return 1.0
  if (type === 'tangential') return 0.7
  return 0.5
}

/* 모든 모드 추출 (20~freqMax Hz 범위).
   ⚠️ 예전 고정 maxN=5는 6차 이상 축모드를 통째로 잘라 기본 프리셋(5m)조차 206Hz부터
      누락됐고, 큰 방에선 Bonello 판정이 거짓 위반으로 뒤집혔다 — 축별로
      freqMax에 필요한 차수를 계산한다(n = 2·치수·freqMax/c, 클램프 상한에서 최대 ~35). */
export function buildAllModes(L: number, W: number, H: number, c: number, freqMax = 300, maxNOverride?: number): RoomMode[] {
  /* 치수가 0·음수·비유한이면 빈 결과 — p=0·L=0 조합의 0/0=NaN이 범위 필터를 통과하는 것 방지 */
  if (!(L > 0) || !(W > 0) || !(H > 0) || !(c > 0)) return []
  const nFor = (d: number) => Math.min(60, Math.ceil((2 * d * freqMax) / c))
  const nL = maxNOverride ?? nFor(L)
  const nW = maxNOverride ?? nFor(W)
  const nH = maxNOverride ?? nFor(H)
  const modes: RoomMode[] = []
  for (let p = 0; p <= nL; p++) {
    for (let q = 0; q <= nW; q++) {
      for (let r = 0; r <= nH; r++) {
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

/** 방의 진짜 기본(최저) 모드 = c / (2 × 최장변).
    ⚠️ 표시 목록은 20Hz 하한 필터를 거치므로 "목록 첫 항목"을 1차 모드라 부르면
       큰 방(최장변 > 8.6m)에서 기본 모드(<20Hz)를 놓친다. */
export function fundamentalFreq(L: number, W: number, H: number, c: number): number {
  const d = Math.max(L, W, H)
  return d > 0 ? c / (2 * d) : 0
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

/** 권장 비율 목록 (H:W:L, 정렬 오름차순 기준).
    ⚠️ 예전엔 Sepmeyer 1:1.14:1.39 하나와의 거리로만 등급을 매겨, Louden 1:1.4:1.9 같은
       유명 권장 비율이 C(주의) 등급을 받았다 — 최소 거리로 판정한다. */
export const RECOMMENDED_RATIOS: { name: string; r: [number, number, number] }[] = [
  { name: 'Sepmeyer A', r: [1, 1.14, 1.39] },
  { name: 'Sepmeyer B', r: [1, 1.28, 1.54] },
  { name: 'Sepmeyer C', r: [1, 1.60, 2.33] },
  { name: 'Louden',     r: [1, 1.4, 1.9] },
]

/** 하위 호환 표기용 (대표 비율) */
export const GOLDEN_RATIO = { w: 1.14, l: 1.39, h: 1.0 }

/** Walker 조건식(BBC RD 1993/8) — Bolt(1946) 곡선 영역의 공인 대수 근사로
    EBU Tech 3276 Appendix 2·ITU-R BS.1116-3 §8.2.2.3이 채택:
      1.1·(w/h) ≤ l/h ≤ 4.5·(w/h) − 4,  l/h < 3,  w/h < 3
    ⚠️ 예전엔 근거 없는 자작 박스 2종을 판정·차트가 따로 써서(판정 "안전"인데 점은 초록 밖),
       W/H=2.0·L/H=1.2 같은 모순이 화면에 그대로 노출됐다. 판정과 차트가 같은 식을 쓴다. */
export const WALKER = { lowSlope: 1.1, upSlope: 4.5, upIntercept: -4, cap: 3 }

export function inBoltArea(a: number, b: number): boolean {
  if (!(a > 0) || !(b > 0)) return false
  /* Walker 식은 l ≥ w 전제 — 가로/세로를 바꿔 입력해도 같은 방이므로 긴 변을 L로 정규화.
     경계는 십진 입력(1.1×1.5=1.65 등)에서 부동소수로 갈리므로 상대 epsilon 비교. */
  const wl = Math.min(a, b)
  const ll = Math.max(a, b)
  if (wl >= WALKER.cap || ll >= WALKER.cap) return false
  const eps = 1e-9 * Math.max(1, ll)
  return ll - WALKER.lowSlope * wl >= -eps && (WALKER.upSlope * wl + WALKER.upIntercept) - ll >= -eps
}

export function diagnoseRatio(W: number, L: number, H: number): RatioCheck {
  const min = Math.min(W, L, H)
  const ratio = { w: W / min, l: L / min, h: H / min }

  /* 정육면체 검사 */
  const isCube = Math.abs(ratio.w - ratio.l) < 0.05 && Math.abs(ratio.l - ratio.h) < 0.05
  if (isCube) {
    return { ratio, diagnosis: 'D', label: '정육면체 위험', color: '#BE185D', desc: '모드가 한 점에 중첩 — 부밍·먹먹함 매우 심함. 가구 배치·트랩으로 보완 필수.' }
  }

  /* 두 축이 같은 위험 */
  const twoSame = Math.abs(ratio.w - ratio.l) < 0.05 || Math.abs(ratio.l - ratio.h) < 0.05 || Math.abs(ratio.w - ratio.h) < 0.05
  if (twoSame) {
    return { ratio, diagnosis: 'C', label: '두 축 동일', color: '#B45309', desc: '두 축이 같은 길이 — 모드 중첩 위험. 일부 주파수 부밍 가능.' }
  }

  /* 권장 비율 목록과의 최소 거리 (정렬 오름차순 비교) */
  const sortedR = [ratio.w, ratio.l, ratio.h].sort((a, b) => a - b)
  let dist = Infinity
  let nearest = RECOMMENDED_RATIOS[0].name
  for (const rec of RECOMMENDED_RATIOS) {
    const d = Math.sqrt(
      (sortedR[0] - rec.r[0]) ** 2 + (sortedR[1] - rec.r[1]) ** 2 + (sortedR[2] - rec.r[2]) ** 2,
    )
    if (d < dist) { dist = d; nearest = rec.name }
  }

  if (dist < 0.10) return { ratio, diagnosis: 'S', label: `권장 비율 (${nearest})`, color: '#0F766E', desc: '권장 음향 비율과 거의 일치 — 모드 분포 균일.' }
  if (dist < 0.25) return { ratio, diagnosis: 'A', label: `우수 (${nearest} 근접)`, color: '#047857', desc: '권장 비율에 매우 가까움. 일반 부밍 적음.' }
  if (dist < 0.50) return { ratio, diagnosis: 'B', label: '양호',                  color: '#0E7490', desc: '평균적인 음향. 트랩으로 부밍 보완.' }
  if (dist < 1.00) return { ratio, diagnosis: 'C', label: '주의',                  color: '#B45309', desc: '비율이 좋지 않음. 베이스 트랩 권장.' }
  return { ratio, diagnosis: 'D', label: '불리한 비율',                            color: '#BE185D', desc: '음향적으로 매우 불리. 트랩·EQ 보정 필수.' }
}

/* ─────────────────────────────────────────────
   Bonello criterion (1/3 옥타브 대역별 모드 개수)
   ───────────────────────────────────────────── */

/* Bonello(1981, JAES 29(9)) 원 기준 적용 대역은 10~200Hz —
   이 도구는 모드 하한 20Hz라 20~200Hz 11개 대역만 표시(250·315는 기준 범위 밖이라 제외). */
export const THIRD_OCTAVE_BANDS = [
  20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160, 200,
]

/** Bonello 두 조건: ① 대역별 모드 수가 위 대역으로 갈수록 줄지 않아야(비감소),
    ② 동일 주파수 중복(coincident) 모드는 그 대역 모드 수가 5개 이상일 때만 허용.
    ⚠️ 예전엔 ②가 아예 없었고 ①도 "균등 증가"로 잘못 서술했다. */
export function bonelloAnalysis(modes: RoomMode[]): { freq: number; count: number; coincidentViolation: boolean }[] {
  const result = THIRD_OCTAVE_BANDS.map((f) => ({ freq: f, count: 0, coincidentViolation: false, _freqs: [] as number[] }))
  modes.forEach((m) => {
    /* 20Hz 대역 기준 1/3 옥타브 인덱스. 예전 오프셋 5.66은 정확값과 어긋나
       대역 경계(20↔25는 22.45Hz) 부근 모드가 옆 대역으로 집계됐다. */
    const fIdx = Math.round(3 * Math.log2(m.freq / 20))
    if (fIdx >= 0 && fIdx < result.length) {
      result[fIdx].count++
      result[fIdx]._freqs.push(m.freq)
    }
  })
  for (const band of result) {
    const sorted = band._freqs.sort((a, b) => a - b)
    const hasCoincident = sorted.some((f, i) => i > 0 && Math.abs(f - sorted[i - 1]) < 0.5)
    band.coincidentViolation = hasCoincident && band.count < 5
  }
  return result.map(({ freq, count, coincidentViolation }) => ({ freq, count, coincidentViolation }))
}

/* ─────────────────────────────────────────────
   1차 모드 음압 분포 (탭 2 컬러맵)
   p(x) = cos(n × π × x / L)
   x=0 (벽) → ±1 (최대)
   x=L/2 (중앙) → 0 (노드)
   ───────────────────────────────────────────── */

/** 위치 (xRel=가로 W축, yRel=세로 L축) ∈ [0,1] 의 1차 모드 음압 절대값 (0~1).
    |cos| 합성이라 두 인자에 대칭 — 축 순서가 값에 영향 없음. */
export function pressureAt(xRel: number, yRel: number): number {
  const px = Math.abs(Math.cos(Math.PI * xRel))   // W 1차 모드
  const py = Math.abs(Math.cos(Math.PI * yRel))   // L 1차 모드
  // 두 모드의 합성 (RMS)
  return Math.sqrt((px ** 2 + py ** 2) / 2)
}

/* 위치 점수 (0~100) — 38% 룰 기준 거리 + 노드 회피.
   ⚠️ "음압 낮을수록 좋음" 전제는 1차 모드만 그리는 이 모델에서 정중앙(1차 노드)을
      만점으로 만들었다(노드에 앉으면 해당 저음이 소실 — 좋은 위치가 아니다).
      게다가 예전 정규화는 (0.5,0.38)이 전역 최대라는 잘못된 전제로 RAW_MAX를 잡아
      정중앙 포함 면적 2.4%가 일괄 100점 플래토였다.
   새 점수: 38% 라인이 유일 최대(100), 정중앙(1차 노드)·25%(2차 노드)에 명시적 감점. */
export function listenerScore(xRel: number, yRel: number): number {
  const base = Math.max(0, 1 - 1.6 * Math.abs(yRel - 0.38)) * (1 - 0.6 * Math.abs(xRel - 0.5))
  const centerDip = 25 * Math.exp(-(((yRel - 0.5) / 0.06) ** 2))   // 1차 모드 노드
  const quarterDip = 15 * Math.exp(-(((yRel - 0.25) / 0.05) ** 2)) // 2차 모드 노드
  return Math.round(Math.max(0, Math.min(100, base * 100 - centerDip - quarterDip)))
}

/* ─────────────────────────────────────────────
   스피커 배치 피드백 — 점수는 청취자 위치 기준이므로,
   스피커 마커에는 대칭·청취각(정삼각형 60°) 가이드를 준다.
   ⚠️ 예전엔 스피커를 드래그해도 화면 어디에도 반영이 없어
      "드래그하며 위치 찾기" 안내와 실제 기능이 어긋났다.
   ───────────────────────────────────────────── */
export interface SpeakerFeedback {
  symmetric: boolean
  angleDeg: number      // 청취자에서 본 두 스피커 사이 각 (정삼각형 = 60°)
  equilateral: boolean  // 세 변 길이가 ±15% 이내
}

export function speakerFeedback(
  sL: { x: number; y: number }, sR: { x: number; y: number },
  listener: { x: number; y: number }, W: number, L: number,
): SpeakerFeedback {
  const m = (p: { x: number; y: number }) => ({ x: p.x * W, y: p.y * L })
  const a = m(sL), b = m(sR), c0 = m(listener)
  const d = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.hypot(p.x - q.x, p.y - q.y)
  const ab = d(a, b), ac = d(a, c0), bc = d(b, c0)
  const symmetric = Math.abs(sL.x - (1 - sR.x)) < 0.04 && Math.abs(sL.y - sR.y) < 0.04
  let angleDeg = 0
  if (ac > 1e-6 && bc > 1e-6) {
    const cosT = (ac * ac + bc * bc - ab * ab) / (2 * ac * bc)
    angleDeg = Math.acos(Math.min(1, Math.max(-1, cosT))) * 180 / Math.PI
  }
  const equilateral = ab > 1e-6 && Math.abs(ac - ab) / ab < 0.15 && Math.abs(bc - ab) / ab < 0.15
  return { symmetric, angleDeg, equilateral }
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
    effectiveFrom: 80,
    thicknessMm: '300~600mm',
    position: '3 코너 우선 (앞 양쪽 + 뒤 1개)',
    diyPrice: 'DIY 5~10만원/개',
    proPrice: '보급 10~30·브랜드 50만원+/개',
    desc: '가장 강력. 모든 축 모드의 압력 최대 지점이 코너에 모임. 깊을수록 더 낮은 주파수까지.',
    color: '#DB2777',
  },
  {
    id: 'wall',
    emoji: '🟧',
    label: '벽 트랩 (Acoustic Panel)',
    effectiveFrom: 125,
    thicknessMm: '100~200mm',
    position: '1차 반사 지점 (스피커-청취자 사이 측벽)',
    diyPrice: 'DIY 3~7만원/개',
    proPrice: '완제품 5~15만원/개',
    desc: '중·고음 흡수 + 일부 저음(100mm급 기준 — 200mm급·에어갭이면 ~100Hz). 1차 반사음 제거에 효과.',
    color: '#D97706',
  },
  {
    id: 'membrane',
    emoji: '🟨',
    label: '멤브레인 트랩 (Panel Absorber)',
    effectiveFrom: 40,
    thicknessMm: '100~250mm',
    position: '벽면 수직 부착',
    diyPrice: 'DIY 8~15만원/개',
    proPrice: '완제품 15~40만원/개',
    desc: '저주파 전용. 특정 대역 흡수 — 40Hz급은 250mm급 깊이 필요, 설계 정확도 중요.',
    color: '#0891B2',
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
    desc: '특정 주파수만 정확히 흡수(무댐핑 시 ±5~10Hz 협대역). 병 모양 원리로 튜닝.',
    color: '#0D9488',
  },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

/* 그래픽(차트 막대·보더)용 600레벨 — 텍스트에는 MODE_INKS를 쓴다 */
export const MODE_COLORS = {
  axial: '#DB2777',
  tangential: '#D97706',
  oblique: '#0D9488',
}

/* 텍스트용 700레벨 잉크 (흰/연회색 배경 4.5:1 이상 — amber-600 3.19·teal-600 3.74는 미달) */
export const MODE_INKS = {
  axial: '#BE185D',
  tangential: '#B45309',
  oblique: '#0F766E',
}

export const MODE_LABELS = {
  axial: '축방향 (Axial)',
  tangential: '접선 (Tangential)',
  oblique: '사선 (Oblique)',
}
