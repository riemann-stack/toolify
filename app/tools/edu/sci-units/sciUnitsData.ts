/* ──────────────────────────────────────────────────────
   과학 단위 변환기 — SI 접두어·과학적 표기·과학 스케일 단위·물리 상수
   ────────────────────────────────────────────────────── */

// ─── SI 접두어 (지수 기준) ───
export interface SIPrefix {
  symbol: string
  name: string
  exp: number   // 10^exp
}

export const SI_PREFIXES: SIPrefix[] = [
  { symbol: 'Q',  name: '퀘타 (quetta)', exp: 30 },
  { symbol: 'R',  name: '론나 (ronna)',  exp: 27 },
  { symbol: 'Y',  name: '요타 (yotta)',  exp: 24 },
  { symbol: 'Z',  name: '제타 (zetta)',  exp: 21 },
  { symbol: 'E',  name: '엑사 (exa)',    exp: 18 },
  { symbol: 'P',  name: '페타 (peta)',   exp: 15 },
  { symbol: 'T',  name: '테라 (tera)',   exp: 12 },
  { symbol: 'G',  name: '기가 (giga)',   exp: 9 },
  { symbol: 'M',  name: '메가 (mega)',   exp: 6 },
  { symbol: 'k',  name: '킬로 (kilo)',   exp: 3 },
  { symbol: 'h',  name: '헥토 (hecto)',  exp: 2 },
  { symbol: 'da', name: '데카 (deca)',   exp: 1 },
  { symbol: '',   name: '(기본)',        exp: 0 },
  { symbol: 'd',  name: '데시 (deci)',   exp: -1 },
  { symbol: 'c',  name: '센티 (centi)',  exp: -2 },
  { symbol: 'm',  name: '밀리 (milli)',  exp: -3 },
  { symbol: 'µ',  name: '마이크로 (micro)', exp: -6 },
  { symbol: 'n',  name: '나노 (nano)',   exp: -9 },
  { symbol: 'p',  name: '피코 (pico)',   exp: -12 },
  { symbol: 'f',  name: '펨토 (femto)',  exp: -15 },
  { symbol: 'a',  name: '아토 (atto)',   exp: -18 },
  { symbol: 'z',  name: '젭토 (zepto)',  exp: -21 },
  { symbol: 'y',  name: '욕토 (yocto)',  exp: -24 },
  { symbol: 'r',  name: '론토 (ronto)',  exp: -27 },
  { symbol: 'q',  name: '퀙토 (quecto)', exp: -30 },
]

// ─── 과학 스케일 단위 (도메인별, 기준 단위 대비 배수) ───
export interface SciUnit {
  id: string
  symbol: string
  name: string
  toBase: number   // base 단위로의 환산값
  note?: string
}

export interface SciUnitGroup {
  id: string
  name: string
  baseSymbol: string
  units: SciUnit[]
}

export const SCI_UNIT_GROUPS: SciUnitGroup[] = [
  {
    id: 'length',
    name: '길이 (미시 ~ 천문)',
    baseSymbol: 'm',
    units: [
      { id: 'pm',  symbol: 'pm', name: '피코미터',   toBase: 1e-12, note: '원자 반지름 단위' },
      { id: 'A',   symbol: 'Å',  name: '옹스트롬',   toBase: 1e-10, note: '원자·결합 길이 (1Å = 0.1nm)' },
      { id: 'nm',  symbol: 'nm', name: '나노미터',   toBase: 1e-9,  note: '빛 파장·반도체' },
      { id: 'um',  symbol: 'µm', name: '마이크로미터', toBase: 1e-6, note: '세포·세균' },
      { id: 'mm',  symbol: 'mm', name: '밀리미터',   toBase: 1e-3 },
      { id: 'cm',  symbol: 'cm', name: '센티미터',   toBase: 1e-2 },
      { id: 'm',   symbol: 'm',  name: '미터',       toBase: 1 },
      { id: 'km',  symbol: 'km', name: '킬로미터',   toBase: 1e3 },
      { id: 'Re',  symbol: 'R⊕', name: '지구 반지름', toBase: 6.371e6, note: '평균 6,371km' },
      { id: 'AU',  symbol: 'AU', name: '천문단위',   toBase: 1.495978707e11, note: '지구-태양 평균 거리' },
      { id: 'ly',  symbol: 'ly', name: '광년',       toBase: 9.4607304725808e15, note: '빛이 1년 가는 거리' },
      { id: 'pc',  symbol: 'pc', name: '파섹',       toBase: 3.0856775814913673e16, note: '약 3.26광년' },
    ],
  },
  {
    id: 'energy',
    name: '에너지 (입자 ~ 거시)',
    baseSymbol: 'J',
    units: [
      { id: 'eV',   symbol: 'eV',   name: '전자볼트',   toBase: 1.602176634e-19, note: '원자·광자 에너지' },
      { id: 'keV',  symbol: 'keV',  name: '킬로전자볼트', toBase: 1.602176634e-16, note: 'X선' },
      { id: 'MeV',  symbol: 'MeV',  name: '메가전자볼트', toBase: 1.602176634e-13, note: '핵·감마선' },
      { id: 'GeV',  symbol: 'GeV',  name: '기가전자볼트', toBase: 1.602176634e-10, note: '입자가속기' },
      { id: 'TeV',  symbol: 'TeV',  name: '테라전자볼트', toBase: 1.602176634e-7,  note: 'LHC 충돌' },
      { id: 'J',    symbol: 'J',    name: '줄',         toBase: 1 },
      { id: 'cal',  symbol: 'cal',  name: '칼로리',     toBase: 4.184 },
      { id: 'kcal', symbol: 'kcal', name: '킬로칼로리',  toBase: 4184, note: '식품 Cal' },
      { id: 'kWh',  symbol: 'kWh',  name: '킬로와트시',  toBase: 3.6e6 },
    ],
  },
  {
    id: 'mass',
    name: '질량 (입자 ~ 거시)',
    baseSymbol: 'kg',
    units: [
      { id: 'Da',  symbol: 'Da', name: '달톤 (원자질량)', toBase: 1.66053906892e-27, note: '원자질량단위(u) · CODATA 2022' },
      { id: 'ng',  symbol: 'ng', name: '나노그램',  toBase: 1e-12 },
      { id: 'ug',  symbol: 'µg', name: '마이크로그램', toBase: 1e-9 },
      { id: 'mg',  symbol: 'mg', name: '밀리그램',  toBase: 1e-6 },
      { id: 'g',   symbol: 'g',  name: '그램',      toBase: 1e-3 },
      { id: 'kg',  symbol: 'kg', name: '킬로그램',  toBase: 1 },
      { id: 't',   symbol: 't',  name: '톤',        toBase: 1e3 },
      { id: 'Me',  symbol: 'M⊕', name: '지구 질량',  toBase: 5.972e24 },
      { id: 'Msun',symbol: 'M☉', name: '태양 질량',  toBase: 1.98892e30 },
    ],
  },
  {
    id: 'time',
    name: '시간 (찰나 ~ 거시)',
    baseSymbol: 's',
    units: [
      { id: 'ns',  symbol: 'ns',  name: '나노초',  toBase: 1e-9 },
      { id: 'us',  symbol: 'µs',  name: '마이크로초', toBase: 1e-6 },
      { id: 'ms',  symbol: 'ms',  name: '밀리초',  toBase: 1e-3 },
      { id: 's',   symbol: 's',   name: '초',      toBase: 1 },
      { id: 'min', symbol: 'min', name: '분',      toBase: 60 },
      { id: 'h',   symbol: 'h',   name: '시간',    toBase: 3600 },
      { id: 'day', symbol: 'd',   name: '일',      toBase: 86400 },
      { id: 'yr',  symbol: 'yr',  name: '년 (율리우스)', toBase: 31557600, note: '365.25일' },
    ],
  },
]

// ─── 물리 상수 (CODATA 2022 권장값 · NIST physics.nist.gov, 2026-06 확인) ───
export interface PhysicalConstant {
  symbol: string
  name: string
  value: string   // 표시용 (지수 표기)
  unit: string
}

export const CONSTANTS: PhysicalConstant[] = [
  { symbol: 'c',   name: '빛의 속도 (진공)',   value: '2.99792458 × 10⁸', unit: 'm/s' },
  { symbol: 'h',   name: '플랑크 상수',         value: '6.62607015 × 10⁻³⁴', unit: 'J·s' },
  { symbol: 'ħ',   name: '환산 플랑크 상수',    value: '1.054571817 × 10⁻³⁴', unit: 'J·s' },
  { symbol: 'e',   name: '기본 전하',           value: '1.602176634 × 10⁻¹⁹', unit: 'C' },
  { symbol: 'k_B', name: '볼츠만 상수',         value: '1.380649 × 10⁻²³', unit: 'J/K' },
  { symbol: 'N_A', name: '아보가드로 수',       value: '6.02214076 × 10²³', unit: '1/mol' },
  { symbol: 'R',   name: '기체 상수',           value: '8.314462618', unit: 'J/(mol·K)' },
  { symbol: 'G',   name: '만유인력 상수',       value: '6.67430 × 10⁻¹¹', unit: 'N·m²/kg²' },
  { symbol: 'm_e', name: '전자 질량',           value: '9.1093837139 × 10⁻³¹', unit: 'kg' },
  { symbol: 'm_p', name: '양성자 질량',         value: '1.67262192595 × 10⁻²⁷', unit: 'kg' },
  { symbol: 'σ',   name: '슈테판-볼츠만 상수',  value: '5.670374419 × 10⁻⁸', unit: 'W/(m²·K⁴)' },
  { symbol: 'ε₀',  name: '진공 유전율',         value: '8.8541878188 × 10⁻¹²', unit: 'F/m' },
]

// ─────────────────────────────────────────────
// 계산·포맷
// ─────────────────────────────────────────────

/** 일반 표기 → 과학적 표기 문자열 (가수 × 10^지수) */
export function toScientific(n: number, sig = 6): { mantissa: number; exp: number } {
  if (n === 0 || !Number.isFinite(n)) return { mantissa: 0, exp: 0 }
  const exp = Math.floor(Math.log10(Math.abs(n)))
  const mantissa = n / Math.pow(10, exp)
  return { mantissa: roundSig(mantissa, sig), exp }
}

/** 공학적 표기 (지수가 3의 배수) */
export function toEngineering(n: number, sig = 6): { mantissa: number; exp: number } {
  if (n === 0 || !Number.isFinite(n)) return { mantissa: 0, exp: 0 }
  let exp = Math.floor(Math.log10(Math.abs(n)))
  exp = Math.floor(exp / 3) * 3
  const mantissa = n / Math.pow(10, exp)
  return { mantissa: roundSig(mantissa, sig), exp }
}

/** 지수를 가장 가까운(이하) SI 접두어로 — 가수 1~1000 범위 유지 */
export function toPrefix(n: number, sig = 6): { mantissa: number; prefix: SIPrefix } {
  if (n === 0 || !Number.isFinite(n)) {
    return { mantissa: 0, prefix: SI_PREFIXES.find(p => p.exp === 0)! }
  }
  const exp = Math.floor(Math.log10(Math.abs(n)))
  // 3의 배수 이하 접두어 선택 (가수 1~999)
  const target = Math.floor(exp / 3) * 3
  const clamped = Math.max(-30, Math.min(30, target))
  const prefix = SI_PREFIXES.reduce((best, p) =>
    Math.abs(p.exp - clamped) < Math.abs(best.exp - clamped) && p.exp % 3 === 0 ? p : best,
    SI_PREFIXES.find(pp => pp.exp === 0)!)
  const mantissa = n / Math.pow(10, prefix.exp)
  return { mantissa: roundSig(mantissa, sig), prefix }
}

function roundSig(n: number, sig: number): number {
  if (n === 0) return 0
  const d = Math.ceil(Math.log10(Math.abs(n)))
  const power = sig - d
  const factor = Math.pow(10, power)
  return Math.round(n * factor) / factor
}

/** 숫자 → 읽기 좋은 일반 표기 문자열 */
export function fmtPlain(n: number): string {
  if (n === 0) return '0'
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  if (abs >= 1e15 || abs < 1e-9) {
    const { mantissa, exp } = toScientific(n)
    return `${mantissa} × 10${supExp(exp)}`
  }
  // 천단위 콤마 + 유효숫자
  const rounded = roundSig(n, 8)
  return rounded.toLocaleString('en-US', { maximumFractionDigits: 12 })
}

/** 지수 → 위첨자 문자열 */
export function supExp(exp: number): string {
  const map: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
  return String(exp).split('').map(c => map[c] ?? c).join('')
}

export function fmtSig(n: number, sig = 6): string {
  if (n === 0) return '0'
  if (!Number.isFinite(n)) return '—'
  return String(roundSig(n, sig)).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}
