// ─────────────────────────────────────────────────────────────
// 나사 규격·탭드릴 — 데이터 + 계산 + 인치/mm 변환
// 한국 KS·ISO·DIN·JIS 표준 일반값 (참고용)
// ─────────────────────────────────────────────────────────────

export type ScrewSystem = 'metric' | 'unc' | 'unf' | 'pt' | 'npt' | 'wood' | 'drywall'

export interface SystemMeta {
  key: ScrewSystem
  label: string
  emoji: string
  desc: string
}

export const SYSTEMS: SystemMeta[] = [
  { key: 'metric',  label: '미터 나사 (M)',     emoji: '🔩', desc: '한국 표준 — M3, M6, M10 등' },
  { key: 'unc',     label: 'UNC',               emoji: '🔧', desc: '미국 표준 보통 피치' },
  { key: 'unf',     label: 'UNF',               emoji: '🔨', desc: '미국 표준 정밀 피치' },
  { key: 'pt',      label: 'PT 파이프 나사',    emoji: '🚿', desc: '일본·한국 배관 표준' },
  { key: 'npt',     label: 'NPT 파이프 나사',   emoji: '💧', desc: '미국 배관 표준' },
  { key: 'wood',    label: '목재피스',           emoji: '🪵', desc: '목공·셀프 가구' },
  { key: 'drywall', label: '석고피스',           emoji: '🧱', desc: '석고보드 시공' },
]

// ── 소재별 보정 ──────────────────────
export type Material = 'steel' | 'aluminum' | 'stainless' | 'brass' | 'plastic'

export interface MaterialMeta {
  key: Material
  label: string
  emoji: string
  drillAdjust: number  // mm 더하기 (+ = 더 큰 드릴)
  note: string
}

export const MATERIALS: MaterialMeta[] = [
  { key: 'steel',     label: '철 (Steel)',        emoji: '🔩', drillAdjust: 0,    note: '표준 — 절삭유 사용 권장' },
  { key: 'aluminum',  label: '알루미늄',          emoji: '🟦', drillAdjust: 0.05, note: '연성 ↑ — 살짝 큰 드릴 + 절삭유' },
  { key: 'stainless', label: '스테인리스',        emoji: '⚪', drillAdjust: 0.05, note: '마찰 ↑·가공 경화 — 저속·절삭유 필수' },
  { key: 'brass',     label: '황동',              emoji: '🟫', drillAdjust: 0,    note: '절삭성 좋음 — 표준 드릴' },
  { key: 'plastic',   label: '플라스틱',          emoji: '🟩', drillAdjust: 0,    note: '셀프태핑 가능 — 보통 파일럿홀만' },
]

// ── 결합률 ──────────────────────────
export type Engagement = 50 | 75 | 85

export const ENGAGEMENT_LABEL: Record<Engagement, string> = {
  50: '50% (얕은 탭·분리 쉬움)',
  75: '75% (표준)',
  85: '85% (깊은 탭·강한 결합)',
}

/** ISO 표준 — engagementPct → 피치 곱계수 */
function engagementFactor(pct: Engagement): number {
  // 75% 표준 = ~1.0 (대략 D - P)
  // 50% = 더 큰 드릴 (작은 곱계수)
  // 85% = 더 작은 드릴 (큰 곱계수)
  const map: Record<Engagement, number> = {
    50: 0.65,
    75: 1.00,
    85: 1.10,
  }
  return map[pct]
}

// ── 미터 나사 표준 데이터 ────────────
export interface MetricScrewSpec {
  diameter: number       // 외경 (mm)
  pitchCoarse: number    // 표준 피치
  pitchFine?: number     // 정밀 피치 (있는 것만)
  tapDrill75: number     // 75% 결합률 표준 탭드릴 (mm)
  clearanceTight: number // 정밀 끼워맞춤 관통홀
  clearanceNormal: number
  clearanceLoose: number
  hexWrench: number      // 육각렌치 (mm)
  spanner: number        // 스패너 이면대각 (mm)
}

export const METRIC_SCREWS: MetricScrewSpec[] = [
  { diameter: 2,  pitchCoarse: 0.4,  pitchFine: undefined, tapDrill75: 1.6,  clearanceTight: 2.2, clearanceNormal: 2.4, clearanceLoose: 2.6, hexWrench: 1.5, spanner: 4 },
  { diameter: 2.5,pitchCoarse: 0.45, pitchFine: undefined, tapDrill75: 2.05, clearanceTight: 2.7, clearanceNormal: 2.9, clearanceLoose: 3.1, hexWrench: 2,   spanner: 5 },
  { diameter: 3,  pitchCoarse: 0.5,  pitchFine: 0.35,      tapDrill75: 2.5,  clearanceTight: 3.2, clearanceNormal: 3.4, clearanceLoose: 3.6, hexWrench: 2.5, spanner: 5.5 },
  { diameter: 4,  pitchCoarse: 0.7,  pitchFine: 0.5,       tapDrill75: 3.3,  clearanceTight: 4.3, clearanceNormal: 4.5, clearanceLoose: 4.8, hexWrench: 3,   spanner: 7 },
  { diameter: 5,  pitchCoarse: 0.8,  pitchFine: 0.5,       tapDrill75: 4.2,  clearanceTight: 5.3, clearanceNormal: 5.5, clearanceLoose: 5.8, hexWrench: 4,   spanner: 8 },
  { diameter: 6,  pitchCoarse: 1.0,  pitchFine: 0.75,      tapDrill75: 5.0,  clearanceTight: 6.4, clearanceNormal: 6.6, clearanceLoose: 7.0, hexWrench: 5,   spanner: 10 },
  { diameter: 8,  pitchCoarse: 1.25, pitchFine: 1.0,       tapDrill75: 6.8,  clearanceTight: 8.4, clearanceNormal: 9.0, clearanceLoose: 10.0,hexWrench: 6,   spanner: 13 },
  { diameter: 10, pitchCoarse: 1.5,  pitchFine: 1.25,      tapDrill75: 8.5,  clearanceTight: 10.5,clearanceNormal: 11.0,clearanceLoose: 12.0,hexWrench: 8,   spanner: 17 },
  { diameter: 12, pitchCoarse: 1.75, pitchFine: 1.5,       tapDrill75: 10.2, clearanceTight: 13.0,clearanceNormal: 13.5,clearanceLoose: 14.5,hexWrench: 10,  spanner: 19 },
  { diameter: 14, pitchCoarse: 2.0,  pitchFine: 1.5,       tapDrill75: 12.0, clearanceTight: 15.0,clearanceNormal: 15.5,clearanceLoose: 16.5,hexWrench: 12,  spanner: 22 },
  { diameter: 16, pitchCoarse: 2.0,  pitchFine: 1.5,       tapDrill75: 14.0, clearanceTight: 17.0,clearanceNormal: 17.5,clearanceLoose: 18.5,hexWrench: 14,  spanner: 24 },
  { diameter: 18, pitchCoarse: 2.5,  pitchFine: 1.5,       tapDrill75: 15.5, clearanceTight: 19.0,clearanceNormal: 20.0,clearanceLoose: 21.0,hexWrench: 14,  spanner: 27 },
  { diameter: 20, pitchCoarse: 2.5,  pitchFine: 1.5,       tapDrill75: 17.5, clearanceTight: 21.0,clearanceNormal: 22.0,clearanceLoose: 24.0,hexWrench: 17,  spanner: 30 },
  { diameter: 24, pitchCoarse: 3.0,  pitchFine: 2.0,       tapDrill75: 21.0, clearanceTight: 25.0,clearanceNormal: 26.0,clearanceLoose: 28.0,hexWrench: 19,  spanner: 36 },
]

export const METRIC_QUICK = [3, 4, 5, 6, 8, 10, 12, 16, 20]

// ── UNC/UNF 데이터 ────────────────────
export interface UnifiedScrewSpec {
  label: string         // "1/4-20 (UNC)"
  diameterInch: number  // 0.25
  diameterMm: number    // 6.35
  tpi: number           // threads per inch
  tapDrillMm: number    // 75% 결합률 (mm)
  clearanceMm: number   // 일반 관통홀 (mm)
  system: 'unc' | 'unf'
}

export const UNIFIED_SCREWS: UnifiedScrewSpec[] = [
  // UNC
  { label: '1/4-20',  diameterInch: 0.25,  diameterMm: 6.35,  tpi: 20, tapDrillMm: 5.1,  clearanceMm: 6.7,  system: 'unc' },
  { label: '5/16-18', diameterInch: 0.3125,diameterMm: 7.94,  tpi: 18, tapDrillMm: 6.5,  clearanceMm: 8.4,  system: 'unc' },
  { label: '3/8-16',  diameterInch: 0.375, diameterMm: 9.53,  tpi: 16, tapDrillMm: 8.0,  clearanceMm: 10.0, system: 'unc' },
  { label: '7/16-14', diameterInch: 0.4375,diameterMm: 11.11, tpi: 14, tapDrillMm: 9.4,  clearanceMm: 11.5, system: 'unc' },
  { label: '1/2-13',  diameterInch: 0.5,   diameterMm: 12.70, tpi: 13, tapDrillMm: 10.8, clearanceMm: 13.5, system: 'unc' },
  { label: '9/16-12', diameterInch: 0.5625,diameterMm: 14.29, tpi: 12, tapDrillMm: 12.2, clearanceMm: 15.0, system: 'unc' },
  { label: '5/8-11',  diameterInch: 0.625, diameterMm: 15.88, tpi: 11, tapDrillMm: 13.5, clearanceMm: 16.5, system: 'unc' },
  { label: '3/4-10',  diameterInch: 0.75,  diameterMm: 19.05, tpi: 10, tapDrillMm: 16.5, clearanceMm: 20.0, system: 'unc' },
  // UNF
  { label: '1/4-28',  diameterInch: 0.25,  diameterMm: 6.35,  tpi: 28, tapDrillMm: 5.5,  clearanceMm: 6.7,  system: 'unf' },
  { label: '5/16-24', diameterInch: 0.3125,diameterMm: 7.94,  tpi: 24, tapDrillMm: 6.9,  clearanceMm: 8.4,  system: 'unf' },
  { label: '3/8-24',  diameterInch: 0.375, diameterMm: 9.53,  tpi: 24, tapDrillMm: 8.5,  clearanceMm: 10.0, system: 'unf' },
  { label: '7/16-20', diameterInch: 0.4375,diameterMm: 11.11, tpi: 20, tapDrillMm: 9.9,  clearanceMm: 11.5, system: 'unf' },
  { label: '1/2-20',  diameterInch: 0.5,   diameterMm: 12.70, tpi: 20, tapDrillMm: 11.5, clearanceMm: 13.5, system: 'unf' },
  { label: '9/16-18', diameterInch: 0.5625,diameterMm: 14.29, tpi: 18, tapDrillMm: 12.9, clearanceMm: 15.0, system: 'unf' },
  { label: '5/8-18',  diameterInch: 0.625, diameterMm: 15.88, tpi: 18, tapDrillMm: 14.5, clearanceMm: 16.5, system: 'unf' },
  { label: '3/4-16',  diameterInch: 0.75,  diameterMm: 19.05, tpi: 16, tapDrillMm: 17.5, clearanceMm: 20.0, system: 'unf' },
]

// ── PT 파이프 나사 ───────────────────
export interface PipeScrewSpec {
  label: string
  threadsPerInch: number  // 산둘레
  outerDiameterMm: number
  tapDrillMm: number
  system: 'pt' | 'npt'
}

export const PT_SCREWS: PipeScrewSpec[] = [
  { label: 'PT 1/8',  threadsPerInch: 28, outerDiameterMm: 9.7,  tapDrillMm: 8.5,  system: 'pt' },
  { label: 'PT 1/4',  threadsPerInch: 19, outerDiameterMm: 13.2, tapDrillMm: 11.5, system: 'pt' },
  { label: 'PT 3/8',  threadsPerInch: 19, outerDiameterMm: 16.7, tapDrillMm: 14.8, system: 'pt' },
  { label: 'PT 1/2',  threadsPerInch: 14, outerDiameterMm: 20.9, tapDrillMm: 18.5, system: 'pt' },
  { label: 'PT 3/4',  threadsPerInch: 14, outerDiameterMm: 26.4, tapDrillMm: 24.0, system: 'pt' },
  { label: 'PT 1',    threadsPerInch: 11, outerDiameterMm: 33.2, tapDrillMm: 30.5, system: 'pt' },
  { label: 'NPT 1/8', threadsPerInch: 27, outerDiameterMm: 10.3, tapDrillMm: 8.6,  system: 'npt' },
  { label: 'NPT 1/4', threadsPerInch: 18, outerDiameterMm: 13.7, tapDrillMm: 11.2, system: 'npt' },
  { label: 'NPT 3/8', threadsPerInch: 18, outerDiameterMm: 17.1, tapDrillMm: 14.5, system: 'npt' },
  { label: 'NPT 1/2', threadsPerInch: 14, outerDiameterMm: 21.3, tapDrillMm: 17.9, system: 'npt' },
  { label: 'NPT 3/4', threadsPerInch: 14, outerDiameterMm: 26.7, tapDrillMm: 23.0, system: 'npt' },
  { label: 'NPT 1',   threadsPerInch: 11.5, outerDiameterMm: 33.4, tapDrillMm: 28.8, system: 'npt' },
]

// ── 목재·석고 피스 파일럿홀 ──────────
export interface WoodScrewPilot {
  diameter: number  // mm
  hardwood: number  // 경질목 파일럿
  softwood: number  // 연질목 파일럿
}

export const WOOD_PILOTS: WoodScrewPilot[] = [
  { diameter: 2.5, hardwood: 1.6, softwood: 1.5 },
  { diameter: 3.0, hardwood: 2.0, softwood: 1.8 },
  { diameter: 3.5, hardwood: 2.5, softwood: 2.0 },
  { diameter: 4.0, hardwood: 2.8, softwood: 2.5 },
  { diameter: 4.5, hardwood: 3.2, softwood: 2.8 },
  { diameter: 5.0, hardwood: 3.5, softwood: 3.0 },
  { diameter: 5.5, hardwood: 4.0, softwood: 3.5 },
  { diameter: 6.0, hardwood: 4.5, softwood: 4.0 },
]

// ── 미터 탭드릴 계산 (결합률·소재 보정) ──
export function calcMetricTapDrill(
  diameter: number,
  pitch: number,
  engagement: Engagement,
  material: Material,
): number {
  const factor = engagementFactor(engagement)
  const adjust = MATERIALS.find((m) => m.key === material)?.drillAdjust ?? 0
  return diameter - pitch * factor + adjust
}

// 관통홀(정밀/일반/헐거움)은 ISO 273 표값(METRIC_SCREWS.clearanceTight/Normal/Loose)을 직접 사용.
// 옛 D+0.4/+1.0/+2.0 근사식은 ISO 273과 어긋나 제거함.

// ── 인치 ↔ mm 변환 ──────────────────
export const INCH_TO_MM = 25.4

export function inchToMm(inch: number): number {
  return inch * INCH_TO_MM
}
export function mmToInch(mm: number): number {
  return mm / INCH_TO_MM
}

/** "5/8" or "5/8\"" or "0.625" → 인치 숫자 */
export function parseInchInput(s: string): number | null {
  // 내부 공백은 단일 공백으로만 정리 — "1 1/2"(대분수) 구분자를 보존
  const trimmed = s.trim().replace(/["'']/g, '').replace(/\s+/g, ' ')
  if (!trimmed) return null
  // 대분수: "1 1/2", "1-1/2", "1_1/2"
  const mixed = trimmed.match(/^(\d+)[\s_-](\d+)\/(\d+)$/)
  if (mixed) {
    const whole = parseInt(mixed[1])
    const num = parseInt(mixed[2])
    const den = parseInt(mixed[3])
    if (den > 0) return whole + num / den
  }
  // 단순 분수·소수는 공백 제거 후 파싱
  const cleaned = trimmed.replace(/\s+/g, '')
  const frac = cleaned.match(/^(\d+)\/(\d+)$/)
  if (frac) {
    const num = parseInt(frac[1])
    const den = parseInt(frac[2])
    if (den > 0) return num / den
  }
  const num = parseFloat(cleaned)
  if (isFinite(num)) return num
  return null
}

/** mm를 가까운 표준 분수 인치로 변환 (1/64, 1/32, 1/16, 1/8 단위) */
export function mmToNearestFraction(mm: number, denominator: number = 64): { whole: number; num: number; den: number; exact: boolean } {
  const inch = mm / INCH_TO_MM
  const total = Math.round(inch * denominator)
  const whole = Math.floor(total / denominator)
  const num = total - whole * denominator
  if (num === 0) return { whole, num: 0, den: 1, exact: Math.abs(inch * denominator - total) < 0.001 }
  // 약분
  const g = gcd(num, denominator)
  return {
    whole,
    num: num / g,
    den: denominator / g,
    exact: Math.abs(inch * denominator - total) < 0.001,
  }
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function fmtFraction(f: { whole: number; num: number; den: number }): string {
  if (f.num === 0) return `${f.whole}"`
  if (f.whole === 0) return `${f.num}/${f.den}"`
  return `${f.whole} ${f.num}/${f.den}"`
}

// ── 표준 인치 분수 ──────────────────
export const STD_INCH_FRACTIONS = [
  { label: '1/16', value: 1/16 },
  { label: '1/8',  value: 1/8 },
  { label: '3/16', value: 3/16 },
  { label: '1/4',  value: 1/4 },
  { label: '5/16', value: 5/16 },
  { label: '3/8',  value: 3/8 },
  { label: '7/16', value: 7/16 },
  { label: '1/2',  value: 1/2 },
  { label: '5/8',  value: 5/8 },
  { label: '3/4',  value: 3/4 },
  { label: '7/8',  value: 7/8 },
  { label: '1',    value: 1 },
]

export const STD_MM_SIZES = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 25, 32]

// ── 일반 토크 가이드 (참고만, 8.8 등급 기준) ──
export function generalTorque(diameter: number): { min: number; max: number } | null {
  // N·m 일반 범위 — 8.8 등급 기준 참고값
  const map: Record<number, [number, number]> = {
    3:  [0.6, 1.0],
    4:  [1.6, 2.5],
    5:  [3.5, 5.0],
    6:  [6.0, 10.0],
    8:  [15, 25],
    10: [30, 50],
    12: [55, 90],
    14: [85, 140],
    16: [130, 220],
    20: [260, 430],
  }
  const v = map[diameter]
  return v ? { min: v[0], max: v[1] } : null
}

// ── 표시 헬퍼 ────────────────────
export function fmtMm(n: number, decimals: number = 1): string {
  if (!isFinite(n)) return '—'
  return `${n.toFixed(decimals)}mm`
}
