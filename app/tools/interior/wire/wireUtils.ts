/* 전선 굵기 계산기 — KEC 2021 기반 데이터·계산 유틸 */

export type Voltage = 220 | 380
export type Phase = 'single' | 'three'
export type LoadType = 'heater' | 'mixed' | 'motor'   // 전열·혼합·모터
export type Environment = 'expose' | 'ceil' | 'buried' | 'bundle'
export type WireKind = 'hiv' | 'iv' | 'vct' | 'fcv' | 'kiv' | 'frcv'
export type Application = 'home' | 'indoor' | 'outdoor'

/* 전선 표준 사이즈 (sq mm) */
export const WIRE_SIZES = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240,
] as const
export type WireSize = (typeof WIRE_SIZES)[number]

/* KEC 2021 — HIV/IV 동선·30°C·일반 부설 허용전류 (A) */
export const AMPACITY_HIV: Record<WireSize, number> = {
  1.5: 19,
  2.5: 26,
  4:   35,
  6:   46,
  10:  63,
  16:  84,
  25:  110,
  35:  138,
  50:  167,
  70:  215,
  95:  261,
  120: 304,
  150: 349,
  185: 399,
  240: 470,
}

/* 차단기 표준 사이즈 (A) */
export const BREAKER_SIZES = [
  10, 15, 20, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 250, 300, 400,
]

/* 전선 종류 메타 */
export interface WireKindMeta {
  id: WireKind
  label: string
  std: string
  tempC: number
  factor: number   // HIV 대비 허용전류 보정 계수
  use: string
  emoji: string
}

export const WIRE_KINDS: WireKindMeta[] = [
  { id: 'hiv',  label: 'HIV (내열비닐절연전선)',     std: 'KS C IEC 60227-3', tempC: 70, factor: 1.00, use: '옥내 일반·콘센트·조명 (한국 표준)',  emoji: '🟦' },
  { id: 'iv',   label: 'IV (절연전선, 구형)',        std: 'KS C 3303',         tempC: 60, factor: 0.85, use: '옛 옥내 배선 (HIV로 교체 권장)',     emoji: '⬜' },
  { id: 'vct',  label: 'VCT (캡타이어 케이블)',      std: 'KS C IEC 60245-4', tempC: 60, factor: 0.90, use: '이동·노출·가전·작업등',             emoji: '🟧' },
  { id: 'fcv',  label: 'F-CV (가교폴리에틸렌)',      std: 'KS C IEC 60502',    tempC: 90, factor: 1.20, use: '옥외·매설·고압 케이블',             emoji: '🟩' },
  { id: 'kiv',  label: 'KIV (제어용)',               std: 'KS C 3340',         tempC: 70, factor: 0.95, use: '분전반 내부·제어 회로',             emoji: '🟫' },
  { id: 'frcv', label: 'FR-CV (난연)',              std: 'KS C IEC 60332',    tempC: 90, factor: 1.20, use: '소방·통신·공동주택·아파트 간선',     emoji: '🟥' },
]

export const getWireKind = (id: WireKind) => WIRE_KINDS.find((w) => w.id === id)!

/* 부설 환경별 보정계수 */
export const ENV_FACTOR: Record<Environment, { factor: number; label: string }> = {
  expose: { factor: 1.00, label: '노출 (공기 중)' },
  ceil:   { factor: 0.90, label: '천장 매입 (보온)' },
  buried: { factor: 0.85, label: '콘크리트·지중 매설' },
  bundle: { factor: 0.70, label: '다회로 묶음 (3회로 이상)' },
}

/* 주위 온도 보정계수 (KEC 부속서) */
export const TEMP_FACTOR: Record<number, number> = {
  30: 1.00,
  40: 0.87,
  50: 0.71,
}

/* 부하 종류 → 역률 */
export const LOAD_PF: Record<LoadType, { pf: number; label: string; emoji: string }> = {
  heater: { pf: 1.00, label: '전열·조명·EV',  emoji: '🔥' },
  mixed:  { pf: 0.85, label: '혼합·콘센트·일반', emoji: '🔌' },
  motor:  { pf: 0.80, label: '모터·인버터·인덕션', emoji: '⚙️' },
}

/* 권장 전압강하율 (%) */
export const DROP_LIMIT: Record<Application, { pct: number; label: string }> = {
  home:    { pct: 2, label: '가정용 분기 (엄격)' },
  indoor:  { pct: 3, label: '옥내 일반' },
  outdoor: { pct: 5, label: '옥외·간선·장거리' },
}

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

/**
 * 전류 계산
 * 단상: I = P / (V × cosφ)
 * 삼상: I = P / (√3 × V × cosφ)
 */
export function calcCurrent(powerW: number, voltage: Voltage, phase: Phase, pf: number): number {
  if (powerW <= 0 || voltage <= 0 || pf <= 0) return 0
  const denom = phase === 'three' ? Math.sqrt(3) * voltage * pf : voltage * pf
  return powerW / denom
}

/** 역으로 전력 계산 */
export function calcPower(currentA: number, voltage: Voltage, phase: Phase, pf: number): number {
  const factor = phase === 'three' ? Math.sqrt(3) * voltage * pf : voltage * pf
  return currentA * factor
}

/**
 * 전압강하 (V)
 * 단상: e = (35.6 × L × I) / (1000 × A)
 * 삼상: e = (30.8 × L × I) / (1000 × A)
 */
export function calcVoltageDrop(currentA: number, lengthM: number, sqMm: number, phase: Phase): number {
  if (sqMm <= 0) return Infinity
  const k = phase === 'three' ? 30.8 : 35.6
  return (k * lengthM * currentA) / (1000 * sqMm)
}

/** 전압강하율 (%) */
export function calcDropPercent(dropV: number, voltage: Voltage): number {
  return (dropV / voltage) * 100
}

/**
 * 보정 후 허용전류
 * = 기본 허용전류 × 재질계수 × 환경계수 × 온도계수
 */
export function correctedAmpacity(
  sqMm: WireSize,
  kind: WireKind,
  env: Environment,
  tempC: number,
): number {
  const base = AMPACITY_HIV[sqMm]
  const k = getWireKind(kind).factor
  const e = ENV_FACTOR[env].factor
  const t = TEMP_FACTOR[tempC] ?? 1.0
  return base * k * e * t
}

/**
 * 권장 전선 굵기 자동 선정
 * - 부하전류 × 1.25 (KEC 232.4) 이상 견디는 가장 작은 sq
 */
export function recommendWireSize(
  currentA: number,
  kind: WireKind,
  env: Environment,
  tempC: number,
): WireSize | null {
  const target = currentA * 1.25
  for (const sq of WIRE_SIZES) {
    if (correctedAmpacity(sq, kind, env, tempC) >= target) return sq
  }
  return null
}

/**
 * 전압강하 한도까지 만족하는 전선 굵기 추천
 * (recommendWireSize 결과보다 한 단계 큰 굵기로 강하율을 만족시킴)
 */
export function recommendWireSizeWithDrop(
  currentA: number,
  voltage: Voltage,
  phase: Phase,
  lengthM: number,
  kind: WireKind,
  env: Environment,
  tempC: number,
  app: Application,
): { ampacitySize: WireSize | null; dropSize: WireSize | null; finalSize: WireSize | null } {
  const ampacitySize = recommendWireSize(currentA, kind, env, tempC)
  const limit = (DROP_LIMIT[app].pct / 100) * voltage
  let dropSize: WireSize | null = null
  for (const sq of WIRE_SIZES) {
    const drop = calcVoltageDrop(currentA, lengthM, sq, phase)
    if (drop <= limit) { dropSize = sq; break }
  }
  let finalSize: WireSize | null = null
  if (ampacitySize && dropSize) {
    finalSize = (ampacitySize >= dropSize ? ampacitySize : dropSize) as WireSize
  } else {
    finalSize = ampacitySize ?? dropSize
  }
  return { ampacitySize, dropSize, finalSize }
}

/** 권장 차단기 사이즈 (부하전류 × 1.25 이상의 가장 작은 표준값) */
export function recommendBreaker(currentA: number): number | null {
  const target = currentA * 1.25
  for (const b of BREAKER_SIZES) {
    if (b >= target) return b
  }
  return null
}

/** 차단기 사이즈 → 가능한 전선 굵기 후보 */
export function breakerToSizes(breakerA: number, kind: WireKind, env: Environment, tempC: number): WireSize | null {
  for (const sq of WIRE_SIZES) {
    if (correctedAmpacity(sq, kind, env, tempC) >= breakerA) return sq
  }
  return null
}

/* ─────────────────────────────────────────────
   가전 프리셋
   ───────────────────────────────────────────── */

export interface AppliancePreset {
  id: string
  emoji: string
  label: string
  powerW: number
  voltage: Voltage
  phase: Phase
  load: LoadType
  sq: WireSize
  breaker: number
  note?: string
}

export const APPLIANCES: AppliancePreset[] = [
  { id: 'ac15',   emoji: '🌬️', label: '에어컨 1.5RT (1.8kW)',     powerW: 1800, voltage: 220, phase: 'single', load: 'motor',  sq: 2.5, breaker: 15 },
  { id: 'ac30',   emoji: '🌬️', label: '에어컨 3RT (3.5kW)',        powerW: 3500, voltage: 220, phase: 'single', load: 'motor',  sq: 4,   breaker: 20 },
  { id: 'ac70',   emoji: '🌬️', label: '시스템 에어컨 7kW',         powerW: 7000, voltage: 220, phase: 'single', load: 'motor',  sq: 6,   breaker: 40 },
  { id: 'ind1',   emoji: '🍳',  label: '인덕션 1구 (1.8kW)',         powerW: 1800, voltage: 220, phase: 'single', load: 'motor',  sq: 2.5, breaker: 15 },
  { id: 'ind3',   emoji: '🍳',  label: '인덕션 3구 (7kW)',           powerW: 7000, voltage: 220, phase: 'single', load: 'motor',  sq: 6,   breaker: 40, note: '단독 분기 + 누전차단기 필수' },
  { id: 'water',  emoji: '🔥',  label: '전기온수기 5kW',             powerW: 5000, voltage: 220, phase: 'single', load: 'heater', sq: 4,   breaker: 30 },
  { id: 'ev7',    emoji: '🚗',  label: 'EV 완속 충전기 7kW ⭐',      powerW: 7000, voltage: 220, phase: 'single', load: 'heater', sq: 6,   breaker: 40, note: '한전 신청·완속 충전기 표준' },
  { id: 'ev11',   emoji: '🚗',  label: 'EV 완속 11kW (삼상)',        powerW: 11000, voltage: 380, phase: 'three',  load: 'heater', sq: 4,   breaker: 20 },
  { id: 'ev22',   emoji: '🚗',  label: 'EV 22kW (삼상)',             powerW: 22000, voltage: 380, phase: 'three',  load: 'heater', sq: 6,   breaker: 40 },
  { id: 'cmp',    emoji: '🏕️', label: '캠핑 인버터 1500W (DC)',     powerW: 1500, voltage: 220, phase: 'single', load: 'mixed',  sq: 1.5, breaker: 10, note: '배터리 측은 12V·130A 별도 계산' },
  { id: 'pc',     emoji: '💻',  label: '데스크탑 PC 500W',           powerW: 500,  voltage: 220, phase: 'single', load: 'mixed',  sq: 1.5, breaker: 15 },
  { id: 'office', emoji: '🖥️', label: '사무실 콘센트 2kW',          powerW: 2000, voltage: 220, phase: 'single', load: 'mixed',  sq: 2.5, breaker: 15 },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
