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

/** 유효숫자 sig개로 반올림한 숫자값.
    ⚠️ 예전 Math.round(x·10ᵏ)/10ᵏ는 .5를 +∞ 방향으로 올려 음수가 비대칭이었다
       (12.5→13인데 −12.5→−12). toPrecision은 부호를 떼고 크기 기준으로 반올림한다. */
export function roundSig(x: number, sig: number): number {
  if (x === 0 || !Number.isFinite(x) || sig < 1) return x
  return Number(x.toPrecision(Math.min(100, Math.round(sig))))
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
  const str = x.toPrecision(sig)
  // 정수부 자릿수가 sig보다 많으면 toPrecision이 '1.2e+5'를 돌려준다 → '1.2 × 10⁵'로 통일
  return str.includes('e') ? prettyExp(x, sig) : str
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
  const rel = value !== 0 ? error / Math.abs(value) : NaN
  const relPct = Number.isFinite(rel) ? Number((rel * 100).toPrecision(3)).toString() : '—'
  // 불확도의 마지막 유효 자리 = 10^place (errSig=2, 불확도 0.3 → place −2 → 0.30)
  let eExp = Math.floor(Math.log10(error))
  // 반올림으로 자릿수가 올라가면(0.0995 → 0.100) 한 자리 위에서 다시 맞춘다
  if (roundAt(error, eExp - (errSig - 1)) >= Math.pow(10, eExp + 1)) eExp += 1
  const place = eExp - (errSig - 1)
  if (place > 0) {
    // ⚠️ 예전엔 소수 자리(decimals)를 0에서 멈춰 불확도 ≥100이면 반올림이 안 됐다('42000 ± 2970').
    //    정수 자리까지 올려 반올림한다 → '42000 ± 3000'
    return {
      valueStr: String(roundAt(value, place)),
      errorStr: String(roundAt(error, place)),
      relPct,
    }
  }
  const decimals = Math.min(15, -place)
  const eR = Number(error.toFixed(decimals))
  const vR = Number(value.toFixed(decimals))
  return {
    valueStr: vR.toFixed(decimals),
    errorStr: eR.toFixed(decimals),
    relPct,
  }
}

/** 10^place 자리에서 크기 기준 반올림(부호 대칭). place > 0이면 정수 자리. */
function roundAt(x: number, place: number): number {
  if (place <= 0) return Number(x.toFixed(Math.min(15, -place)))
  const unit = Math.pow(10, place)
  return Math.sign(x) * Math.round(Math.abs(x) / unit) * unit
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
