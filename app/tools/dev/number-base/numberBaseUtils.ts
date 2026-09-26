// 진법 변환기 순수 로직 — 정수는 BigInt로 다뤄 2^53을 넘어도 정확하게 계산
// (tsconfig target ES2017이라 1n 같은 BigInt 리터럴 대신 BigInt(1)을 쓴다)

export type Base = 2 | 8 | 10 | 16
export type BitWidth = 8 | 16 | 32 | 64

const B0 = BigInt(0)
const B1 = BigInt(1)

export const BASE_PATTERNS: Record<Base, RegExp> = {
  2:  /^[01]*$/,
  8:  /^[0-7]*$/,
  10: /^-?[0-9]*$/,
  16: /^[0-9A-Fa-f]*$/,
}

const PREFIX: Partial<Record<Base, RegExp>> = { 2: /^0b/i, 8: /^0o/i, 16: /^0x/i }

/** 입력 정리: 앞뒤 공백·밑줄(_)·중간 공백 제거, 진법 접두사(0x·0b·0o)와 16진수의 # 제거.
 *  '0xFF', '1111 0000', '1010_1010', '#FF8800' 같은 흔한 표기를 받아들인다. */
export function normalizeInput(value: string, base: Base): string {
  let t = value.trim().replace(/[_\s]/g, '')
  const neg = base === 10 && t.startsWith('-')
  if (neg) t = t.slice(1)
  const p = PREFIX[base]
  if (p) t = t.replace(p, '')
  if (base === 16) t = t.replace(/^#/, '')
  return (neg ? '-' : '') + t
}

export function isValidInput(value: string, base: Base): boolean {
  return BASE_PATTERNS[base].test(normalizeInput(value, base))
}

/** 문자열 → BigInt (빈 값·잘못된 문자는 null). 음수는 10진수만 허용 */
export function parseBig(value: string, base: Base): bigint | null {
  const t = normalizeInput(value, base)
  if (t === '' || t === '-') return null
  if (!BASE_PATTERNS[base].test(t)) return null
  const neg = t.startsWith('-')
  const digits = neg ? t.slice(1) : t
  const prefix = base === 16 ? '0x' : base === 8 ? '0o' : base === 2 ? '0b' : ''
  const abs = BigInt(prefix + digits)
  return neg ? -abs : abs
}

/** 10진 정수 입력(비트 연산·2의 보수 칸). 소수부는 버리고(12.5 → 12),
 *  지수 표기(1e3)는 안전 정수 범위에서만 받는다. 그 밖의 잘못된 값은 null */
export function parseDecBig(value: string): bigint | null {
  const t = value.trim().replace(/_/g, '')
  const m = /^(-?\d+)(?:\.\d*)?$/.exec(t)
  if (m) return BigInt(m[1])
  if (!/^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(t)) return null
  const n = Math.trunc(Number(t))
  return Number.isSafeInteger(n) ? BigInt(n) : null
}

/** 부호 붙은 진법 문자열 (16진수는 대문자) */
export function toBase(n: bigint, base: Base): string {
  const neg = n < B0
  const abs = neg ? -n : n
  const s = abs.toString(base)
  return (neg ? '-' : '') + (base === 16 ? s.toUpperCase() : s)
}

export function unsignedMax(bits: BitWidth): bigint {
  return (B1 << BigInt(bits)) - B1
}
export function signedRange(bits: BitWidth): { min: bigint; max: bigint } {
  const half = B1 << BigInt(bits - 1)
  return { min: -half, max: half - B1 }
}

/** 비트 폭으로 자른 부호 없는 값 (음수는 2의 보수) */
export function toUnsigned(n: bigint, bits: BitWidth): bigint {
  return BigInt.asUintN(bits, n)
}

/** 비트 폭에 맞춘 2진 문자열 (음수는 2의 보수, 넘치는 상위 비트는 버림) */
export function padBits(n: bigint, bits: BitWidth): string {
  return toUnsigned(n, bits).toString(2).padStart(bits, '0')
}

export type BitOp = 'AND' | 'OR' | 'XOR' | 'NOT' | 'LSHIFT' | 'RSHIFT'

/** 비트 폭 안에서의 부호 없는 비트 연산. 시프트는 논리 시프트, 폭 이상 이동하면 0 */
export function applyOp(a: bigint, b: bigint, op: BitOp, bits: BitWidth): bigint {
  const ua = toUnsigned(a, bits)
  const ub = toUnsigned(b, bits)
  switch (op) {
    case 'AND': return ua & ub
    case 'OR':  return ua | ub
    case 'XOR': return ua ^ ub
    case 'NOT': return toUnsigned(~ua, bits)
    case 'LSHIFT': {
      if (b < B0 || b >= BigInt(bits)) return b < B0 ? ua : B0
      return toUnsigned(ua << b, bits)
    }
    case 'RSHIFT': {
      if (b < B0 || b >= BigInt(bits)) return b < B0 ? ua : B0
      return ua >> b
    }
  }
}

/** 비트 하나 토글 */
export function toggleBit(value: bigint, pos: number, bits: BitWidth): bigint {
  return toUnsigned(value ^ (B1 << BigInt(pos)), bits)
}

/** 2의 거듭제곱이면 지수, 아니면 null */
export function powerOfTwo(n: bigint): number | null {
  if (n <= B0 || (n & (n - B1)) !== B0) return null
  return n.toString(2).length - 1
}

// 자리값 분해 (N진수 → 10진수 학습용)
export type ConvStep = { digit: string; value: bigint; place: bigint; product: bigint }
export function decompose(value: string, base: Base): ConvStep[] {
  const t = normalizeInput(value, base).replace(/^-/, '')
  const digits = t.split('').reverse()
  const B = BigInt(base)
  let place = B1
  const steps = digits.map((d) => {
    const v = BigInt(parseInt(d, base))
    const step = { digit: d, value: v, place, product: v * place }
    place *= B
    return step
  })
  return steps.reverse()
}

// 10진수 → 2진수 나눗셈 단계
export function decToBaseSteps(dec: bigint, base: Base): { quotient: bigint; remainder: bigint }[] {
  const B = BigInt(base)
  let n = dec < B0 ? -dec : dec
  if (n === B0) return [{ quotient: B0, remainder: B0 }]
  const steps: { quotient: bigint; remainder: bigint }[] = []
  while (n > B0) {
    steps.push({ quotient: n / B, remainder: n % B })
    n = n / B
  }
  return steps
}
