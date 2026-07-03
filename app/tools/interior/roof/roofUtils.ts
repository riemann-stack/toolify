// ─────────────────────────────────────────────────────────────
// 지붕 면적 계산 — 5가지 형태 + 물매·경사각 + 처마·로스율
// ─────────────────────────────────────────────────────────────

export type RoofType = 'gable' | 'hip' | 'shed' | 'flat' | 'maetbae'

export interface RoofMeta {
  key: RoofType
  label: string
  emoji: string
  desc: string
}

export const ROOF_TYPES: RoofMeta[] = [
  { key: 'gable',   label: '박공지붕', emoji: '🔺', desc: '두 사면 — 가장 흔함 (단독주택)' },
  { key: 'hip',     label: '모임지붕', emoji: '🏔️', desc: '4사면 — 전원주택·풍압 강함' },
  { key: 'shed',    label: '외쪽지붕', emoji: '📐', desc: '한 사면 — 창고·증축' },
  { key: 'flat',    label: '평지붕',   emoji: '🟦', desc: '거의 평면 — 옥상·방수' },
  { key: 'maetbae', label: '맞배지붕', emoji: '🏯', desc: '한옥 표준 — 처마 길어 그늘 ↑' },
]

// ── 단위 변환 ──────────────────────────
export const SQM_PER_PYEONG = 3.3058  // 1평 = 3.3058㎡

export function sqmToPyeong(sqm: number): number { return sqm / SQM_PER_PYEONG }
export function pyeongToSqm(p: number): number { return p * SQM_PER_PYEONG }

// ── 물매 ↔ 경사각 변환 ─────────────────
/**
 * 물매 = 수평 10에 대한 수직 비율.
 * 예: 4물매 = 4/10 = tan(θ) → θ ≈ 21.8°
 */
export function moemaeToDeg(m: number): number {
  if (m <= 0) return 0
  return Math.atan(m / 10) * 180 / Math.PI
}
export function degToMoemae(deg: number): number {
  if (deg <= 0) return 0
  return Math.tan(deg * Math.PI / 180) * 10
}

export function fmtMoemae(m: number): string {
  if (m <= 0) return '0물매 (평지붕)'
  // 한국식 표기 — 정수 권장, 소수점은 1자리
  const rounded = Math.round(m * 10) / 10
  return `${rounded}물매`
}

// ── 처마 ────────────────────────────────
export interface Eaves {
  front: number    // m
  back: number
  left: number
  right: number
}
export function uniformEaves(value: number): Eaves {
  return { front: value, back: value, left: value, right: value }
}

// ── 메인 계산 ────────────────────────
export interface RoofInput {
  type: RoofType
  L: number          // 가로 (m, 정면 너비)
  W: number          // 세로 (m, 측면 깊이)
  pitchDeg: number   // 경사각 (°)
  eaves: Eaves
  lossRate: number   // 0~1 (예: 0.10 = 10%)
}

export interface RoofResult {
  type: RoofType
  pitchDeg: number
  moemae: number
  // 처마 포함 평면 치수
  L_total: number
  W_total: number
  // 면적
  planArea: number      // 처마 포함 평면 면적 (㎡)
  surfaceArea: number   // 실제 지붕 표면 면적 (㎡)
  materialArea: number  // 로스 포함 자재 구매 면적 (㎡)
  // 평수
  planPyeong: number
  surfacePyeong: number
  materialPyeong: number
  // 메타
  pitchFactor: number   // 1/cos(pitch) — 경사 배율
  eavesImpact: number   // 처마로 인한 평면 면적 증가율 (%)
}

export function calcRoof(input: RoofInput): RoofResult {
  const { type, L, W, pitchDeg, eaves, lossRate } = input
  const pitchRad = pitchDeg * Math.PI / 180
  const pitchFactor = type === 'flat' ? 1 : (Math.cos(pitchRad) > 0.01 ? 1 / Math.cos(pitchRad) : 1)

  const L_total = L + eaves.left + eaves.right
  const W_total = W + eaves.front + eaves.back

  const planArea = L_total * W_total
  // 모든 형태가 동일 공식: 평면 × 경사 배율 (모임/박공/맞배 4사면 근사)
  // 평지붕은 pitchFactor=1
  const surfaceArea = planArea * pitchFactor
  const materialArea = surfaceArea * (1 + lossRate)

  const baseArea = L * W
  const eavesImpact = baseArea > 0 ? ((planArea - baseArea) / baseArea) * 100 : 0

  return {
    type,
    pitchDeg,
    moemae: degToMoemae(pitchDeg),
    L_total, W_total,
    planArea, surfaceArea, materialArea,
    planPyeong: sqmToPyeong(planArea),
    surfacePyeong: sqmToPyeong(surfaceArea),
    materialPyeong: sqmToPyeong(materialArea),
    pitchFactor,
    eavesImpact,
  }
}

// ── 자재 데이터 (일반 단가, 2026 한국 기준 참고만) ──
export interface RoofMaterial {
  key: string
  name: string
  emoji: string
  category: '지붕재' | '방수재' | '특수'
  priceMin: number    // 원/㎡
  priceMax: number    // 원/㎡
  note: string
}

export const ROOF_MATERIALS: RoofMaterial[] = [
  // 지붕재
  { key: 'shingle',    name: '아스팔트 슁글',  emoji: '🟫', category: '지붕재',
    priceMin: 30000, priceMax: 50000, note: '가장 흔함 · 시공 단순 · 제품군별 장기 보증 상품' },
  { key: 'cementTile', name: '시멘트 기와',    emoji: '🟧', category: '지붕재',
    priceMin: 25000, priceMax: 45000, note: '내구성 ↑ · 무거움 · 점토보다 저렴' },
  { key: 'metalPanel', name: '금속 패널 (칼라강판·리얼징크)', emoji: '⬜', category: '지붕재',
    priceMin: 40000, priceMax: 120000, note: '칼라강판(저가)~리얼징크(고가) · 경량·내구성 ↑ · 단열 약함' },
  { key: 'clayTile',   name: '점토 기와',      emoji: '🟦', category: '지붕재',
    priceMin: 60000, priceMax: 130000, note: '한옥 전통 · 자연 단열 · 무거움 · 구조 보강 필요' },
  { key: 'polycarb',   name: '폴리카보네이트', emoji: '⚫', category: '특수',
    priceMin: 30000, priceMax: 70000, note: '투명 · 베란다·테라스용' },
  // 방수재 (평지붕)
  { key: 'urethane',   name: '우레탄 도막 방수', emoji: '🌫️', category: '방수재',
    priceMin: 25000, priceMax: 50000, note: '평지붕 표준 · 5~10년 주기' },
  { key: 'sheet',      name: '시트 방수',      emoji: '🟧', category: '방수재',
    priceMin: 30000, priceMax: 60000, note: '내구성 ↑ · 시공 까다로움' },
  { key: 'asphalt',    name: '아스팔트 방수',  emoji: '⚫', category: '방수재',
    priceMin: 20000, priceMax: 40000, note: '저렴 · 냄새 · 환기 필수' },
]

// ── 검증 ─────────────────────────────
export function validateRoofInput(input: Partial<RoofInput>): string | null {
  if (!input.L || input.L <= 0 || input.L > 100) return '가로는 1~100m 범위.'
  if (!input.W || input.W <= 0 || input.W > 100) return '세로는 1~100m 범위.'
  if (input.pitchDeg !== undefined && (input.pitchDeg < 0 || input.pitchDeg > 60)) {
    return '경사각은 0~60° 범위.'
  }
  return null
}

// ── 표시 헬퍼 ────────────────────────
export function fmtSqm(n: number): string {
  if (!isFinite(n)) return '—'
  return `${n.toFixed(1)}㎡`
}
export function fmtPyeong(n: number): string {
  if (!isFinite(n)) return '—'
  return `${n.toFixed(1)}평`
}
export function fmtKrw(n: number): string {
  if (!isFinite(n) || n === 0) return '0원'
  return `${Math.round(n).toLocaleString('ko-KR')}원`
}
export function fmtKrwShort(n: number): string {
  if (!isFinite(n) || n === 0) return '0원'
  if (n >= 100_000_000) {
    const v = (n / 100_000_000).toFixed(2).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
    return `${v}억`
  }
  if (n >= 10_000) return `${Math.round(n / 10_000).toLocaleString()}만 원`
  return `${Math.round(n).toLocaleString()}원`
}
