// ─────────────────────────────────────────────
// 회로 시뮬레이터 데이터 · 계산 (순수 함수 — 노드 검산 가능)
//  ⚠️ 클라이언트에서 분리: 옴의 법칙·직렬/병렬 합성·전력 계산과 시험 문제 정답을
//     검산할 수 있어야 한다. LED 전압강하 반영도 여기서 한 곳으로 처리한다.
// ─────────────────────────────────────────────

/* 단위 티어 선택은 "하위 티어로 표기했을 때 반올림이 1000(경계)에 닿는가"까지 본다.
   ⚠️ 원값으로만 판정하면 999.9996 A가 "1000.000 A"처럼 상위 숫자 + 하위 단위로 표기된다. */
const hits = (x: number, dp: number, boundary: number) => Number(x.toFixed(dp)) >= boundary

export function fmtV(v: number): string {
  if (!Number.isFinite(v)) return '-'
  const x = Math.abs(v)
  if (x >= 1000 || hits(x, 2, 1000)) return `${(v / 1000).toFixed(2)} kV`
  if (x >= 0.01 || x === 0 || hits(x, 2, 0.01)) return `${v.toFixed(2)} V`
  return `${(v * 1000).toFixed(2)} mV`
}
export function fmtA(a: number): string {
  if (!Number.isFinite(a)) return '-'
  const x = Math.abs(a)
  if (x >= 1000 || hits(x, 3, 1000)) return `${(a / 1000).toFixed(2)} kA`
  if (x >= 1 || hits(x * 1000, 1, 1000)) return `${a.toFixed(3)} A`
  if (x >= 0.001 || hits(x * 1e6, 1, 1000)) return `${(a * 1000).toFixed(1)} mA`
  return `${(a * 1e6).toFixed(1)} µA`
}
export function fmtR(r: number): string {
  if (!Number.isFinite(r)) return '-'
  /* ⚠️ 예전엔 toFixed(0)이라 0.1Ω이 "0 Ω", 병렬 66.67Ω이 "67 Ω"으로 뭉개졌고,
     소수 2자리 고정으로는 0.005Ω 미만이 다시 "0 Ω"이 됐다 — mΩ·µΩ 티어를 둔다. */
  if (r >= 1_000_000 || hits(r / 1000, 2, 1000)) return `${(r / 1_000_000).toFixed(2)} MΩ`
  if (r >= 1000 || Math.round(r * 100) / 100 >= 1000) return `${(r / 1000).toFixed(2)} kΩ`
  if (r >= 0.1 || r === 0) return `${Math.round(r * 100) / 100} Ω`
  if (r >= 1e-5) return `${(r * 1000).toFixed(2)} mΩ`
  return `${(r * 1e6).toFixed(2)} µΩ`
}
export function fmtW(w: number): string {
  if (!Number.isFinite(w)) return '-'
  const x = Math.abs(w)
  if (x >= 1e9 || hits(x / 1e6, 2, 1000)) return `${(w / 1e9).toFixed(2)} GW`
  if (x >= 1e6 || hits(x / 1000, 2, 1000)) return `${(w / 1e6).toFixed(2)} MW`
  if (x >= 1000 || hits(x, 3, 1000)) return `${(w / 1000).toFixed(2)} kW`
  if (x >= 1 || hits(x * 1000, 1, 1000)) return `${w.toFixed(3)} W`
  if (x >= 0.001 || hits(x * 1e6, 1, 1000)) return `${(w * 1000).toFixed(1)} mW`
  return `${(w * 1e6).toFixed(1)} µW`
}
export const round = (v: number, dp = 3) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp)

export type Resistor = { id: string; value: number; label: string; powerRating: number }
export type CircuitType = 'series' | 'parallel'

export type Preset = {
  id: string
  name: string
  icon: string
  desc: string
  voltage: number
  type: CircuitType
  resistors: { value: number; label: string }[]
  grade: string
  note?: string
  /** LED 전압강하(V). 있으면 저항망에 걸리는 실효 전압에서 뺀다.
      ⚠️ 예전에는 note로 "전압강하 약 2V 가정"이라고만 적고 계산은 5V를 그대로 저항에 걸어,
         LED 회로인데 22.7mA(실제 13.6mA)로 나왔다 — 문서와 계산이 어긋났다. */
  ledDropV?: number
}

export const PRESETS: Preset[] = [
  { id: 'simple',    name: '단일 저항',   icon: '⚡',  desc: '옴의 법칙 V=IR 기본',         voltage: 12, type: 'series',   resistors: [{ value: 100, label: 'R1' }], grade: '중학 과학 기초' },
  { id: 'series-2',  name: '직렬 2개',    icon: '━',   desc: '전류 일정·전압 분배',          voltage: 12, type: 'series',   resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }], grade: '중학 과학' },
  { id: 'parallel-2',name: '병렬 2개',    icon: '▥',   desc: '전압 일정·전류 분배',          voltage: 12, type: 'parallel', resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }], grade: '중학 과학' },
  { id: 'series-3',  name: '직렬 3개',    icon: '═',   desc: '분압 회로',                  voltage: 9,  type: 'series',   resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }, { value: 300, label: 'R3' }], grade: '고교 물리학 빈출' },
  { id: 'parallel-3',name: '병렬 3개',    icon: '⫴',   desc: '저항 3개 병렬',               voltage: 12, type: 'parallel', resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }, { value: 300, label: 'R3' }], grade: '고교 물리학' },
  { id: 'led',       name: 'LED 회로',    icon: '💡',  desc: '5V + 빨간 LED(2V) + 220Ω',    voltage: 5,  type: 'series',   resistors: [{ value: 220, label: 'R(전류제한)' }], grade: 'DIY 실용', note: '빨간 LED 전압강하 2V 반영 — 저항엔 3V가 걸립니다', ledDropV: 2 },
  { id: 'usb-led',   name: 'USB 전원 LED', icon: '🔌', desc: 'USB 5V + 빨간 LED + 330Ω',    voltage: 5,  type: 'series',   resistors: [{ value: 330, label: 'R(전류제한)' }], grade: 'DIY 실용', note: '전류를 낮춰 더 안전 — 저항엔 3V가 걸립니다', ledDropV: 2 },
]

// 전력 정격 옵션
export const POWER_RATINGS = [
  { value: 0.25, label: '1/4W' },
  { value: 0.5,  label: '1/2W' },
  { value: 1.0,  label: '1W' },
  { value: 2.0,  label: '2W' },
  { value: 5.0,  label: '5W' },
]

export const VOLTAGE_QUICK = [
  { v: 1.5, l: '🔋 1.5V', n: '건전지 AA' },
  { v: 3.0, l: '🔋 3V',   n: 'CR2032' },
  { v: 5.0, l: '🔌 5V',   n: 'USB' },
  { v: 9.0, l: '🔋 9V',   n: '각형 건전지' },
  { v: 12,  l: '🚗 12V',  n: '자동차' },
  { v: 24,  l: '⚙️ 24V',  n: '산업용' },
]

export type CalcResult = {
  totalResistance: number
  totalCurrent: number
  totalVoltage: number
  totalPower: number
  /** 반영된 LED 전압강하(V, 없으면 0) — 입력값 그대로 보고한다 */
  ledDropV: number
  /** Vf ≥ 전원이라 LED가 도통하지 않는 상태(전류 0). 클램프해 "LED 1.5V"처럼
      슬라이더(2.0V)와 다른 숫자를 보여주는 대신, 미점등을 명시한다. */
  ledNotLit: boolean
  /** 저항망에 실제로 걸리는 전압(= 전원 − LED강하, 미점등이면 0) */
  resistorVoltage: number
  perResistor: {
    id: string
    label: string
    resistance: number
    voltage: number
    current: number
    power: number
    powerRating: number
    powerExceeded: boolean
    /** 정격의 절반 초과(2배 안전 마진 미달) — 초과는 아니지만 권장 기준엔 못 미침.
        ⚠️ 예전엔 본문이 "2배 이상 정격 권장"이라면서 경고는 정격을 완전히 넘어야만 떠서,
           0.20W를 1/4W에 걸어도 아무 표시가 없었다 — 안내와 경고 조건이 어긋났다. */
    powerMarginal: boolean
  }[]
}
export type CalcOptions = { ledDropV?: number }

/* 경계 판정용 상대 오차 — 직렬 p=I²R의 이진 표현 오차(0.5W가 0.5000000000000001로 나옴)가
   "정확히 정격"을 "초과"로 플립시키지 않게 한다. */
const REL_EPS = 1e-9

export function calcCircuit(voltage: number, type: CircuitType, resistors: Resistor[], opts: CalcOptions = {}): CalcResult {
  if (resistors.length === 0) {
    return { totalResistance: 0, totalCurrent: 0, totalVoltage: voltage, totalPower: 0, perResistor: [], ledDropV: 0, ledNotLit: false, resistorVoltage: voltage }
  }
  let totalR = 0
  if (type === 'series') totalR = resistors.reduce((a, r) => a + r.value, 0)
  else totalR = 1 / resistors.reduce((a, r) => a + 1 / r.value, 0)

  /* LED 전압강하가 있으면 저항망에는 (전원 − LED강하)만 걸린다. 직렬 회로에서만 의미가 있다.
     Vf ≥ 전원이면 LED가 도통하지 않아 전류 0 — 강하를 전원으로 클램프하는 대신 미점등으로 보고한다. */
  const ledDropV = type === 'series' && opts.ledDropV && opts.ledDropV > 0 ? opts.ledDropV : 0
  const ledNotLit = ledDropV > 0 && ledDropV >= voltage
  const vAcrossResistors = ledNotLit ? 0 : voltage - ledDropV

  const totalI = totalR > 0 ? vAcrossResistors / totalR : 0
  const totalP = voltage * totalI   // 전체 전력은 전원 기준(LED가 소비하는 전력 포함)

  const perResistor = resistors.map(r => {
    let v = 0, i = 0, p = 0
    if (type === 'series') {
      i = totalI
      v = totalI * r.value
      p = totalI * totalI * r.value
    } else {
      v = vAcrossResistors
      i = vAcrossResistors / r.value
      p = (vAcrossResistors * vAcrossResistors) / r.value
    }
    return {
      id: r.id, label: r.label,
      resistance: r.value, voltage: v, current: i, power: p,
      powerRating: r.powerRating,
      powerExceeded: p > r.powerRating * (1 + REL_EPS),
      powerMarginal: p <= r.powerRating * (1 + REL_EPS) && p > (r.powerRating / 2) * (1 + REL_EPS),
    }
  })

  return { totalResistance: totalR, totalCurrent: totalI, totalVoltage: voltage, totalPower: totalP, perResistor, ledDropV, ledNotLit, resistorVoltage: vAcrossResistors }
}

// ─────────────────────────────────────────────
// LED 전류 제한 저항 계산 (빠른 계산 탭)
//  ⚠️ FAQ가 "빠른 계산 탭에서 자동 계산해줍니다"라고 안내하는데 실제론 고정 예시 3줄뿐이었다
//     — 문서에 맞게 엔진을 만든다.
// ─────────────────────────────────────────────
/** E12 표준 저항 유효숫자 */
export const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]

/** r 이상인 가장 작은 E12 표준 저항값(전류가 목표를 넘지 않도록 올림).
    ⚠️ 후보를 "소수 2자리"로 반올림하면 0.1Ω 미만 데케이드에서 E12 수열 자체가 붕괴한다
       (0.082→0.08, 0.001→0.01 10배 오차) — 반올림 없이 유효숫자 그대로 비교하고,
       비교도 절대 epsilon이 아니라 상대 오차로 한다. */
export function nextE12Up(r: number): number | null {
  if (!Number.isFinite(r) || r <= 0) return null
  const exp = Math.floor(Math.log10(r))
  for (let e = exp; e <= exp + 2; e++) {
    for (const m of E12) {
      const v = m * Math.pow(10, e)
      if (!Number.isFinite(v)) return null
      if (v >= r * (1 - 1e-9)) return v
    }
  }
  return null
}

export type LedCalc =
  | { ok: false; reason: string }
  | { ok: true; r: number; std: number | null; iStd: number | null; pStd: number | null }

/** R = (Vs − Vf) / I. std = 올림 E12, iStd·pStd = 그 표준값을 썼을 때 실제 전류·저항 소비 전력 */
export function ledResistor(vs: number, vf: number, iMa: number): LedCalc {
  if (!Number.isFinite(vs) || !Number.isFinite(vf) || !Number.isFinite(iMa)) return { ok: false, reason: '값을 입력하세요' }
  if (vs <= 0 || vf <= 0 || iMa <= 0) return { ok: false, reason: '전압·전류는 0보다 커야 합니다' }
  if (vs > 10000 || iMa > 100000) return { ok: false, reason: '입력이 너무 큽니다 — 전원 ≤ 10,000V · 전류 ≤ 100,000mA 범위에서 계산합니다' }
  if (vf >= vs) return { ok: false, reason: 'LED 전압강하(Vf)가 전원 이상이라 이 전원으로는 켤 수 없습니다' }
  const i = iMa / 1000
  const r = (vs - vf) / i
  const stdRaw = nextE12Up(r)
  const std = stdRaw !== null && Number.isFinite(stdRaw) && stdRaw > 0 ? stdRaw : null
  const iStd = std !== null ? (vs - vf) / std : null
  const pStd = std !== null && iStd !== null ? iStd * iStd * std : null
  return { ok: true, r, std, iStd, pStd }
}

// ─────────────────────────────────────────────
// 옴의 법칙 빠른 계산 (모드별 2입력 → 4값)
//  ⚠️ 예전엔 0으로 나누기·모순 입력을 전부 0으로 대체해 12V+0Ω→"0A", 0V+1W→"0A·0Ω·1W"처럼
//     공식이 성립하지 않는 결과가 정상처럼 표시됐다. 계산 불가는 null(—)로 돌려주고 이유를 적는다.
// ─────────────────────────────────────────────
export type OhmKnown = 'V_R' | 'V_I' | 'I_R' | 'V_P'
export type OhmOut = { V: number | null; I: number | null; R: number | null; P: number | null; warn: string | null }

export const OHM_INPUT_MAX = 1_000_000

export function calcOhm(known: OhmKnown, vIn: number, iIn: number, rIn: number, pIn: number): OhmOut {
  const out: OhmOut = { V: null, I: null, R: null, P: null, warn: null }
  let clamped = false
  const take = (x: number, name: string): number | null => {
    if (!Number.isFinite(x)) { out.warn = `${name} 값을 입력하세요`; return null }
    if (x < 0) { out.warn = `${name}에 음수는 쓸 수 없습니다`; return null }
    if (x > OHM_INPUT_MAX) { clamped = true; return OHM_INPUT_MAX }
    return x
  }

  if (known === 'V_R') {
    const V = take(vIn, '전압'); const R = take(rIn, '저항')
    out.V = V; out.R = R
    if (V !== null && R !== null) {
      if (R === 0) out.warn = '0Ω은 단락(합선) — 전류가 무한대로 발산해 계산할 수 없습니다. 실제 회로에선 위험합니다'
      else { out.I = V / R; out.P = V * out.I }
    }
  } else if (known === 'V_I') {
    const V = take(vIn, '전압'); const I = take(iIn, '전류')
    out.V = V; out.I = I
    if (V !== null && I !== null) {
      if (I === 0) { out.warn = '전류 0A는 개방 회로 — 저항을 정의할 수 없습니다'; out.P = 0 }
      else { out.R = V / I; out.P = V * I }
    }
  } else if (known === 'I_R') {
    const I = take(iIn, '전류'); const R = take(rIn, '저항')
    out.I = I; out.R = R
    if (I !== null && R !== null) { out.V = I * R; out.P = out.V * I }
  } else {
    const V = take(vIn, '전압'); const P = take(pIn, '전력')
    out.V = V; out.P = P
    if (V !== null && P !== null) {
      if (V === 0 && P > 0) { out.warn = '전압 0V로는 전력을 만들 수 없습니다 — 모순된 입력입니다'; out.P = P }
      else if (V === 0 && P === 0) out.warn = '전압·전력이 모두 0이면 전류·저항을 정할 수 없습니다'
      else if (P === 0) { out.I = 0; out.warn = '전력 0 → 전류 0(개방) — 저항은 정의할 수 없습니다' }
      else { out.I = P / V; out.R = V / out.I }
    }
  }
  if (clamped && !out.warn) out.warn = `입력이 커서 상한 ${OHM_INPUT_MAX.toLocaleString()}으로 잘라 계산했습니다`
  return out
}

export const EXAM_PROBLEMS = [
  {
    q: '12V 전원에 R₁=100Ω, R₂=200Ω이 직렬로 연결되었다. R₂에 흐르는 전류는?',
    choices: ['20mA', '40mA', '60mA', '120mA'],
    correct: 1,
    grade: '중학 과학',
    solution: '직렬에서 전류는 모든 저항에 동일. R_total = 100+200 = 300Ω. I = V/R = 12/300 = 0.04A = <strong>40mA</strong>',
  },
  {
    q: '6V 전원에 100Ω 저항 2개가 병렬로 연결되었다. 전체 전류는?',
    choices: ['30mA', '60mA', '120mA', '240mA'],
    correct: 2,
    grade: '중학 과학',
    solution: '병렬에서 합성 저항 = 100×100/(100+100) = 50Ω. I_total = 6/50 = 0.12A = <strong>120mA</strong>',
  },
  {
    q: '12V를 100Ω·200Ω 직렬로 분압할 때 R₂(200Ω) 양단 전압은?',
    choices: ['4V', '6V', '8V', '12V'],
    correct: 2,
    grade: '고교 물리학 빈출',
    solution: 'I = 12/(100+200) = 40mA. V_R₂ = I × R₂ = 0.04 × 200 = <strong>8V</strong>. 분압 공식: V × R₂/(R₁+R₂) = 12 × 200/300 = 8V',
  },
  {
    q: '100Ω·200Ω이 병렬로 연결되었을 때 합성 저항은?',
    choices: ['50Ω', '66.7Ω', '150Ω', '300Ω'],
    correct: 1,
    grade: '고교 물리학',
    solution: '병렬: 1/R = 1/100 + 1/200 = 3/200, R = 200/3 ≈ <strong>66.7Ω</strong>. 또는 두 저항 공식: R₁R₂/(R₁+R₂) = 20000/300 = 66.7Ω',
  },
  {
    q: '5V 전원에 50Ω 저항. 이 저항이 소비하는 전력은?',
    choices: ['0.1W', '0.25W', '0.5W', '1W'],
    correct: 2,
    grade: '고교 물리학',
    solution: 'P = V²/R = 25/50 = <strong>0.5W</strong>. 또는 I = V/R = 0.1A, P = VI = 5×0.1 = 0.5W',
  },
  {
    q: '5V 전원에 LED(Vf=2V, IF=20mA)를 연결할 때 필요한 저항(전류 제한)은?',
    choices: ['100Ω', '150Ω', '220Ω', '470Ω'],
    correct: 1,
    grade: 'DIY 실용',
    solution: 'R = (V_source − V_LED)/I_LED = (5−2)/0.02 = <strong>150Ω</strong>. 안전 마진을 위해 220Ω 권장.',
  },
  {
    q: 'R₁(50Ω) 직렬 + (R₂=100Ω // R₃=100Ω) 병렬 회로에 12V 전원. 전체 전류는?',
    choices: ['60mA', '80mA', '100mA', '120mA'],
    correct: 3,
    grade: '고교 물리학 심화',
    solution: 'R₂//R₃ = 100×100/200 = 50Ω. R_total = R₁ + 50 = 100Ω. I = 12/100 = 0.12A = <strong>120mA</strong>',
  },
]
