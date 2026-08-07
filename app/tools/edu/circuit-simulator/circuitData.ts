// ─────────────────────────────────────────────
// 회로 시뮬레이터 데이터 · 계산 (순수 함수 — 노드 검산 가능)
//  ⚠️ 클라이언트에서 분리: 옴의 법칙·직렬/병렬 합성·전력 계산과 시험 문제 정답을
//     검산할 수 있어야 한다. LED 전압강하 반영도 여기서 한 곳으로 처리한다.
// ─────────────────────────────────────────────

export function fmtV(v: number): string {
  if (!Number.isFinite(v)) return '-'
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(2)} kV`
  if (Math.abs(v) < 0.001) return `${(v * 1000).toFixed(2)} mV`
  return `${v.toFixed(2)} V`
}
export function fmtA(a: number): string {
  if (!Number.isFinite(a)) return '-'
  if (Math.abs(a) >= 1) return `${a.toFixed(3)} A`
  if (Math.abs(a) >= 0.001) return `${(a * 1000).toFixed(1)} mA`
  return `${(a * 1e6).toFixed(1)} µA`
}
export function fmtR(r: number): string {
  if (!Number.isFinite(r)) return '-'
  if (r >= 1_000_000) return `${(r / 1_000_000).toFixed(2)} MΩ`
  if (r >= 1000) return `${(r / 1000).toFixed(2)} kΩ`
  return `${r.toFixed(0)} Ω`
}
export function fmtW(w: number): string {
  if (!Number.isFinite(w)) return '-'
  if (Math.abs(w) >= 1) return `${w.toFixed(3)} W`
  if (Math.abs(w) >= 0.001) return `${(w * 1000).toFixed(1)} mW`
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
  { id: 'simple',    name: '단일 저항',   icon: '⚡',  desc: '옴의 법칙 V=IR 기본',         voltage: 12, type: 'series',   resistors: [{ value: 100, label: 'R1' }], grade: '중3 기초' },
  { id: 'series-2',  name: '직렬 2개',    icon: '━',   desc: '전류 일정·전압 분배',          voltage: 12, type: 'series',   resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }], grade: '중3·고1' },
  { id: 'parallel-2',name: '병렬 2개',    icon: '▥',   desc: '전압 일정·전류 분배',          voltage: 12, type: 'parallel', resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }], grade: '중3·고1' },
  { id: 'series-3',  name: '직렬 3개',    icon: '═',   desc: '분압 회로',                  voltage: 9,  type: 'series',   resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }, { value: 300, label: 'R3' }], grade: '고1 빈출' },
  { id: 'parallel-3',name: '병렬 3개',    icon: '⫴',   desc: '저항 3개 병렬',               voltage: 12, type: 'parallel', resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }, { value: 300, label: 'R3' }], grade: '고1' },
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
  /** 반영된 LED 전압강하(V, 없으면 0) */
  ledDropV: number
  /** 저항망에 실제로 걸리는 전압(= 전원 − LED강하) */
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
  }[]
}
export type CalcOptions = { ledDropV?: number }

export function calcCircuit(voltage: number, type: CircuitType, resistors: Resistor[], opts: CalcOptions = {}): CalcResult {
  if (resistors.length === 0) {
    return { totalResistance: 0, totalCurrent: 0, totalVoltage: voltage, totalPower: 0, perResistor: [], ledDropV: 0, resistorVoltage: voltage }
  }
  let totalR = 0
  if (type === 'series') totalR = resistors.reduce((a, r) => a + r.value, 0)
  else totalR = 1 / resistors.reduce((a, r) => a + 1 / r.value, 0)

  /* LED 전압강하가 있으면 저항망에는 (전원 − LED강하)만 걸린다. 직렬 회로에서만 의미가 있다. */
  const ledDropV = type === 'series' && opts.ledDropV && opts.ledDropV > 0 ? Math.min(opts.ledDropV, voltage) : 0
  const vAcrossResistors = voltage - ledDropV

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
      powerExceeded: p > r.powerRating,
    }
  })

  return { totalResistance: totalR, totalCurrent: totalI, totalVoltage: voltage, totalPower: totalP, perResistor, ledDropV, resistorVoltage: vAcrossResistors }
}

export const EXAM_PROBLEMS = [
  {
    q: '12V 전원에 R₁=100Ω, R₂=200Ω이 직렬로 연결되었다. R₂에 흐르는 전류는?',
    choices: ['20mA', '40mA', '60mA', '120mA'],
    correct: 1,
    grade: '중3·고1',
    solution: '직렬에서 전류는 모든 저항에 동일. R_total = 100+200 = 300Ω. I = V/R = 12/300 = 0.04A = <strong>40mA</strong>',
  },
  {
    q: '6V 전원에 100Ω 저항 2개가 병렬로 연결되었다. 전체 전류는?',
    choices: ['30mA', '60mA', '120mA', '240mA'],
    correct: 2,
    grade: '중3·고1',
    solution: '병렬에서 합성 저항 = 100×100/(100+100) = 50Ω. I_total = 6/50 = 0.12A = <strong>120mA</strong>',
  },
  {
    q: '12V를 100Ω·200Ω 직렬로 분압할 때 R₂(200Ω) 양단 전압은?',
    choices: ['4V', '6V', '8V', '12V'],
    correct: 2,
    grade: '고1 빈출',
    solution: 'I = 12/(100+200) = 40mA. V_R₂ = I × R₂ = 0.04 × 200 = <strong>8V</strong>. 분압 공식: V × R₂/(R₁+R₂) = 12 × 200/300 = 8V',
  },
  {
    q: '100Ω·200Ω이 병렬로 연결되었을 때 합성 저항은?',
    choices: ['50Ω', '66.7Ω', '150Ω', '300Ω'],
    correct: 1,
    grade: '고1',
    solution: '병렬: 1/R = 1/100 + 1/200 = 3/200, R = 200/3 ≈ <strong>66.7Ω</strong>. 또는 두 저항 공식: R₁R₂/(R₁+R₂) = 20000/300 = 66.7Ω',
  },
  {
    q: '5V 전원에 50Ω 저항. 이 저항이 소비하는 전력은?',
    choices: ['0.1W', '0.25W', '0.5W', '1W'],
    correct: 2,
    grade: '고1',
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
    grade: '고1·고2 심화',
    solution: 'R₂//R₃ = 100×100/200 = 50Ω. R_total = R₁ + 50 = 100Ω. I = 12/100 = 0.12A = <strong>120mA</strong>',
  },
]
