// ──────────────────────────────────────────────────────
// sigFigsUtils.ts — 유효숫자·반올림·오차 전파 계산 로직 (순수 함수)
// ──────────────────────────────────────────────────────

/* ───────── 유효숫자 ───────── */

export interface SigInfo {
  /** 유효숫자 개수. 판별 불가 시 null */
  count: number | null
  /** 후행 0 모호성(예: 1500) */
  ambiguous: boolean
}

/** 문자열 표현으로부터 유효숫자 개수 판별. */
export function countSigFigs(raw: string): SigInfo {
  const s = raw.trim()
  if (!s) return { count: null, ambiguous: false }

  // 과학적 표기(e표기): 가수가 유효숫자를 결정
  const sci = s.match(/^([+-]?\d*\.?\d+)[eE]([+-]?\d+)$/)
  const isSci = !!sci
  let mantissa = sci ? sci[1] : s
  mantissa = mantissa.replace(/^[+-]/, '')

  if (!/^\d*\.?\d*$/.test(mantissa) || mantissa === '.' || mantissa === '') {
    return { count: null, ambiguous: false }
  }

  const hasDot = mantissa.includes('.')
  const digits = mantissa.replace('.', '')

  // 값이 0이면 유효숫자 정의 모호
  if (/^0*$/.test(digits)) return { count: null, ambiguous: true }

  const noLead = digits.replace(/^0+/, '')

  // 소수점 또는 과학적 표기 → 후행 0도 모두 유효
  if (hasDot || isSci) return { count: noLead.length, ambiguous: false }

  // 소수점 없는 정수 → 후행 0은 모호
  const noTrail = noLead.replace(/0+$/, '')
  const ambiguous = noTrail.length !== noLead.length
  return { count: noTrail.length, ambiguous }
}

/* ───────── 반올림 ───────── */

/** 유효숫자 sig개로 반올림한 숫자값. */
export function roundSig(x: number, sig: number): number {
  if (x === 0 || !Number.isFinite(x) || sig < 1) return x
  const d = Math.floor(Math.log10(Math.abs(x)))
  const factor = Math.pow(10, sig - 1 - d)
  return Math.round(x * factor) / factor
}

/* ───────── 표시(포맷) ───────── */

const SUP: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³',
  '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
}
function sup(n: string): string {
  return n.split('').map((c) => SUP[c] ?? c).join('')
}

/** m × 10ⁿ 형태 과학적 표기 문자열. sig개 유효숫자. */
export function prettyExp(x: number, sig = 4): string {
  if (!Number.isFinite(x)) return '—'
  if (x === 0) return '0'
  const str = x.toExponential(Math.max(0, sig - 1))
  const [m, e] = str.split('e')
  const exp = parseInt(e, 10)
  return `${m} × 10${sup(String(exp))}`
}

/** 일반/과학적 표기를 값 크기에 따라 자동 선택. */
export function pretty(x: number, sig = 6): string {
  if (!Number.isFinite(x)) return '—'
  if (x === 0) return '0'
  const abs = Math.abs(x)
  if (abs >= 1e6 || abs < 1e-4) return prettyExp(x, sig)
  return String(Number(x.toPrecision(sig)))
}

/** 정확히 sig개 유효숫자를 (후행 0 포함) 보존하는 문자열. */
export function toSigString(x: number, sig: number): string {
  if (!Number.isFinite(x)) return '—'
  const abs = Math.abs(x)
  if (x !== 0 && (abs >= 1e6 || abs < 1e-4)) return prettyExp(x, sig)
  return x.toPrecision(sig)
}

/* ───────── 오차(불확도) 표현 ───────── */

export interface MeasurementFmt {
  valueStr: string
  errorStr: string
  /** 상대오차 백분율 문자열 (예: '2.5') */
  relPct: string
}

/**
 * 측정값 ± 불확도를 유효숫자 관례대로 정리.
 * 불확도를 errSig개 유효숫자로 반올림하고, 측정값을 같은 소수 자리로 맞춤.
 */
export function formatMeasurement(value: number, error: number, errSig = 2): MeasurementFmt {
  if (!Number.isFinite(value)) return { valueStr: '—', errorStr: '—', relPct: '—' }
  if (!Number.isFinite(error) || error <= 0) {
    return { valueStr: pretty(value), errorStr: '0', relPct: '—' }
  }
  const eExp = Math.floor(Math.log10(error))
  const decimals = Math.min(15, Math.max(0, errSig - 1 - eExp))
  const eR = Number(error.toFixed(decimals))
  const vR = Number(value.toFixed(decimals))
  const rel = error / Math.abs(value)
  return {
    valueStr: vR.toFixed(decimals),
    errorStr: eR.toFixed(decimals),
    relPct: Number((rel * 100).toPrecision(3)).toString(),
  }
}

/* ───────── 오차 전파 ───────── */

export type PropOp = 'add' | 'sub' | 'mul' | 'div' | 'pow'

export interface PropResult {
  value: number
  /** 독립 오차 제곱합(quadrature) — 표준 불확도 */
  errQuad: number
  /** 단순 합(최대 오차) — 보수적 상한 */
  errMax: number
  /** 상대오차(quadrature) 백분율 */
  relPctQuad: number
  /** 전파 공식 설명 */
  formula: string
}

/**
 * 두 측정값(또는 거듭제곱)의 오차 전파.
 * @param op 연산
 * @param A 값 A, dA 불확도
 * @param B 값 B, dB 불확도 (pow일 때 미사용)
 * @param n  지수 (pow일 때)
 */
export function propagate(
  op: PropOp,
  A: number, dA: number,
  B: number, dB: number,
  n: number,
): PropResult | null {
  const ok = (x: number) => Number.isFinite(x)
  if (!ok(A) || !ok(dA)) return null

  if (op === 'add' || op === 'sub') {
    if (!ok(B) || !ok(dB)) return null
    const value = op === 'add' ? A + B : A - B
    const errQuad = Math.sqrt(dA * dA + dB * dB)
    const errMax = Math.abs(dA) + Math.abs(dB)
    const rel = value !== 0 ? errQuad / Math.abs(value) : NaN
    return {
      value, errQuad, errMax,
      relPctQuad: rel * 100,
      formula: '덧셈·뺄셈: 절대오차끼리 결합 — δR = √(δA² + δB²)',
    }
  }

  if (op === 'mul' || op === 'div') {
    if (!ok(B) || !ok(dB)) return null
    if (A === 0 || B === 0) return null
    const value = op === 'mul' ? A * B : A / B
    const relA = dA / Math.abs(A)
    const relB = dB / Math.abs(B)
    const relQuad = Math.sqrt(relA * relA + relB * relB)
    const relMax = Math.abs(relA) + Math.abs(relB)
    return {
      value,
      errQuad: Math.abs(value) * relQuad,
      errMax: Math.abs(value) * relMax,
      relPctQuad: relQuad * 100,
      formula: '곱셈·나눗셈: 상대오차끼리 결합 — δR/R = √((δA/A)² + (δB/B)²)',
    }
  }

  // pow: R = A^n
  if (!ok(n)) return null
  if (A === 0) return null
  const value = Math.pow(A, n)
  if (!ok(value)) return null
  const rel = Math.abs(n) * (dA / Math.abs(A))
  return {
    value,
    errQuad: Math.abs(value) * rel,
    errMax: Math.abs(value) * rel,
    relPctQuad: rel * 100,
    formula: '거듭제곱: 상대오차에 지수 곱 — δR/R = |n|·(δA/A)',
  }
}
