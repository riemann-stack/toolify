'use client'

import { useMemo, useState } from 'react'
import s from './circuit-simulator.module.css'

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function fmtV(v: number): string {
  if (!Number.isFinite(v)) return '-'
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(2)} kV`
  if (Math.abs(v) < 0.001) return `${(v * 1000).toFixed(2)} mV`
  return `${v.toFixed(2)} V`
}
function fmtA(a: number): string {
  if (!Number.isFinite(a)) return '-'
  if (Math.abs(a) >= 1) return `${a.toFixed(3)} A`
  if (Math.abs(a) >= 0.001) return `${(a * 1000).toFixed(1)} mA`
  return `${(a * 1e6).toFixed(1)} µA`
}
function fmtR(r: number): string {
  if (!Number.isFinite(r)) return '-'
  if (r >= 1_000_000) return `${(r / 1_000_000).toFixed(2)} MΩ`
  if (r >= 1000) return `${(r / 1000).toFixed(2)} kΩ`
  return `${r.toFixed(0)} Ω`
}
function fmtW(w: number): string {
  if (!Number.isFinite(w)) return '-'
  if (Math.abs(w) >= 1) return `${w.toFixed(3)} W`
  if (Math.abs(w) >= 0.001) return `${(w * 1000).toFixed(1)} mW`
  return `${(w * 1e6).toFixed(1)} µW`
}
const round = (v: number, dp = 3) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp)

// ─────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────
type Resistor = { id: string; value: number; label: string; powerRating: number }
type CircuitType = 'series' | 'parallel'

let idCounter = 0
const newId = () => `r-${++idCounter}`

type Preset = {
  id: string
  name: string
  icon: string
  desc: string
  voltage: number
  type: CircuitType
  resistors: { value: number; label: string }[]
  grade: string
  note?: string
}

const PRESETS: Preset[] = [
  { id: 'simple',    name: '단일 저항',   icon: '⚡',  desc: '옴의 법칙 V=IR 기본',         voltage: 12, type: 'series',   resistors: [{ value: 100, label: 'R1' }], grade: '중3 기초' },
  { id: 'series-2',  name: '직렬 2개',    icon: '━',   desc: '전류 일정·전압 분배',          voltage: 12, type: 'series',   resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }], grade: '중3·고1' },
  { id: 'parallel-2',name: '병렬 2개',    icon: '▥',   desc: '전압 일정·전류 분배',          voltage: 12, type: 'parallel', resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }], grade: '중3·고1' },
  { id: 'series-3',  name: '직렬 3개',    icon: '═',   desc: '분압 회로',                  voltage: 9,  type: 'series',   resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }, { value: 300, label: 'R3' }], grade: '고1 빈출' },
  { id: 'parallel-3',name: '병렬 3개',    icon: '⫴',   desc: '저항 3개 병렬',               voltage: 12, type: 'parallel', resistors: [{ value: 100, label: 'R1' }, { value: 200, label: 'R2' }, { value: 300, label: 'R3' }], grade: '고1' },
  { id: 'led',       name: 'LED 회로',    icon: '💡',  desc: '5V + 220Ω + LED 전류 제한',    voltage: 5,  type: 'series',   resistors: [{ value: 220, label: 'R(전류제한)' }], grade: 'DIY 실용', note: 'LED 전압강하 약 2V 가정' },
  { id: 'usb-led',   name: 'USB 전원 LED', icon: '🔌', desc: 'USB 5V로 LED 안전 점등',      voltage: 5,  type: 'series',   resistors: [{ value: 330, label: 'R(전류제한)' }], grade: 'DIY 실용', note: 'LED 보호용 큰 저항' },
]

// 전력 정격 옵션
const POWER_RATINGS = [
  { value: 0.25, label: '1/4W' },
  { value: 0.5,  label: '1/2W' },
  { value: 1.0,  label: '1W' },
  { value: 2.0,  label: '2W' },
  { value: 5.0,  label: '5W' },
]

const VOLTAGE_QUICK = [
  { v: 1.5, l: '🔋 1.5V', n: '건전지 AA' },
  { v: 3.0, l: '🔋 3V',   n: 'CR2032' },
  { v: 5.0, l: '🔌 5V',   n: 'USB' },
  { v: 9.0, l: '🔋 9V',   n: '각형 건전지' },
  { v: 12,  l: '🚗 12V',  n: '자동차' },
  { v: 24,  l: '⚙️ 24V',  n: '산업용' },
]

// ─────────────────────────────────────────────
// 회로 계산
// ─────────────────────────────────────────────
type CalcResult = {
  totalResistance: number
  totalCurrent: number
  totalVoltage: number
  totalPower: number
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
function calcCircuit(voltage: number, type: CircuitType, resistors: Resistor[]): CalcResult {
  if (resistors.length === 0) {
    return { totalResistance: 0, totalCurrent: 0, totalVoltage: voltage, totalPower: 0, perResistor: [] }
  }
  let totalR = 0
  if (type === 'series') totalR = resistors.reduce((a, r) => a + r.value, 0)
  else totalR = 1 / resistors.reduce((a, r) => a + 1 / r.value, 0)

  const totalI = totalR > 0 ? voltage / totalR : 0
  const totalP = voltage * totalI

  const perResistor = resistors.map(r => {
    let v = 0, i = 0, p = 0
    if (type === 'series') {
      i = totalI
      v = totalI * r.value
      p = totalI * totalI * r.value
    } else {
      v = voltage
      i = voltage / r.value
      p = (voltage * voltage) / r.value
    }
    return {
      id: r.id, label: r.label,
      resistance: r.value, voltage: v, current: i, power: p,
      powerRating: r.powerRating,
      powerExceeded: p > r.powerRating,
    }
  })

  return { totalResistance: totalR, totalCurrent: totalI, totalVoltage: voltage, totalPower: totalP, perResistor }
}

// ─────────────────────────────────────────────
// 회로 SVG
// ─────────────────────────────────────────────
function CircuitDiagram({ voltage, type, perResistor }: { voltage: number; type: CircuitType; perResistor: CalcResult['perResistor'] }) {
  const n = perResistor.length
  if (n === 0) return null

  const W = 720
  const padX = 60
  const innerW = W - padX * 2

  // 전류 흐름 속도 — 전류가 클수록 빠름
  const totalI = type === 'series' ? perResistor[0]?.current ?? 0 : perResistor.reduce((a, r) => a + r.current, 0)
  const flowSpeed = totalI > 0 ? Math.max(0.6, Math.min(3, 0.05 / Math.max(0.001, totalI))) : 2

  if (type === 'series') {
    const H = 180
    const rectW = 50
    const rectH = 22
    const wireY = 70
    const bottomY = 130
    const spacing = innerW / n

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={s.circuitSvg} style={{ ['--flow-speed' as never]: `${flowSpeed}s` }}>
        {/* 전압원 (배터리) */}
        <g transform={`translate(${padX - 30}, ${wireY})`}>
          <line x1="0" y1={-30} x2="0" y2={bottomY - wireY + 30} stroke="var(--text)" strokeWidth="2" />
          {/* 배터리 셀 */}
          <g transform={`translate(0, ${(bottomY - wireY) / 2})`}>
            <line x1="-12" y1="-12" x2="-12" y2="12" stroke="var(--text)" strokeWidth="3" />
            <line x1="-6"  y1="-6"  x2="-6"  y2="6"  stroke="var(--text)" strokeWidth="2" />
            <text x="-25" y="0" fontSize="13" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>+</text>
            <text x="-25" y={bottomY - wireY - 30} fontSize="13" fill="var(--muted)" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>−</text>
            <text x="-50" y="5" fontSize="13" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>{fmtV(voltage)}</text>
          </g>
        </g>

        {/* 상단 전선 */}
        <line x1={padX - 30} y1={wireY - 30} x2={padX - 30 + 30} y2={wireY - 30} stroke="var(--text)" strokeWidth="2" />
        <line className={s.currentLine} x1={padX - 30} y1={wireY - 30} x2={W - padX + 30} y2={wireY - 30} stroke="#3EFFD0" strokeWidth="2.5" />
        <line x1={padX - 30} y1={wireY - 30} x2={padX - 30} y2={wireY - 30} stroke="var(--text)" strokeWidth="2" />
        {/* 메인 가로선 */}
        <line x1={padX} y1={wireY - 30} x2={W - padX} y2={wireY - 30} stroke="var(--text)" strokeWidth="2" />

        {/* 저항들 (지그재그) */}
        {perResistor.map((r, i) => {
          const cx = padX + spacing * (i + 0.5)
          const x = cx - rectW / 2
          const y = wireY - 30 - rectH / 2
          return (
            <g key={r.id}>
              <rect x={x} y={y} width={rectW} height={rectH} fill="var(--bg2)" stroke="#FFD700" strokeWidth="2" rx="2" />
              {/* 지그재그 inside */}
              <polyline
                points={`${x + 4},${y + rectH / 2} ${x + 8},${y + 4} ${x + 14},${y + rectH - 4} ${x + 20},${y + 4} ${x + 26},${y + rectH - 4} ${x + 32},${y + 4} ${x + 38},${y + rectH - 4} ${x + 42},${y + rectH / 2} ${x + rectW - 4},${y + rectH / 2}`}
                fill="none" stroke="#FFD700" strokeWidth="1.5"
              />
              {/* 라벨 */}
              <text x={cx} y={y - 18} fontSize="12" fill="#FFD700" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>{r.label}</text>
              <text x={cx} y={y - 4}  fontSize="11" fill="var(--muted)" textAnchor="middle" fontFamily="Syne, sans-serif">{fmtR(r.resistance)}</text>
              <text x={cx} y={y + rectH + 14} fontSize="11" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={700}>{fmtV(r.voltage)}</text>
              <text x={cx} y={y + rectH + 28} fontSize="10" fill={r.powerExceeded ? '#FF6B6B' : 'var(--muted)'} textAnchor="middle" fontFamily="Syne, sans-serif">
                {fmtW(r.power)}{r.powerExceeded ? ' ⚠️' : ''}
              </text>
            </g>
          )
        })}

        {/* 하단 전선 */}
        <line x1={padX - 30} y1={bottomY} x2={W - padX + 30} y2={bottomY} stroke="var(--text)" strokeWidth="2" />
        <line x1={W - padX + 30} y1={wireY - 30} x2={W - padX + 30} y2={bottomY} stroke="var(--text)" strokeWidth="2" />
        {/* 전류 화살표 (상단) */}
        <text x={padX + innerW / 2} y={wireY - 50} fontSize="13" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={700}>
          → I = {fmtA(totalI)}
        </text>
      </svg>
    )
  }

  // 병렬
  const H = Math.max(180, 80 + n * 60)
  const wireYTop = 50
  const wireYBottom = H - 30
  const branchSpacing = (wireYBottom - wireYTop - 20) / Math.max(1, n - 1) || 0
  const branchX1 = padX + 60
  const branchX2 = W - padX - 60

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.circuitSvg} style={{ ['--flow-speed' as never]: `${flowSpeed}s` }}>
      {/* 전압원 */}
      <g transform={`translate(${padX - 30}, ${(wireYTop + wireYBottom) / 2})`}>
        <line x1="0" y1={-(wireYBottom - wireYTop) / 2} x2="0" y2={(wireYBottom - wireYTop) / 2} stroke="var(--text)" strokeWidth="2" />
        <line x1="-12" y1="-12" x2="-12" y2="12" stroke="var(--text)" strokeWidth="3" />
        <line x1="-6"  y1="-6"  x2="-6"  y2="6"  stroke="var(--text)" strokeWidth="2" />
        <text x="-25" y="-20" fontSize="13" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>+</text>
        <text x="-25" y="28"  fontSize="13" fill="var(--muted)" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>−</text>
        <text x="-50" y="5"   fontSize="13" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>{fmtV(voltage)}</text>
      </g>

      {/* 위 메인 라인 */}
      <line x1={padX - 30} y1={wireYTop} x2={W - padX + 30} y2={wireYTop} stroke="var(--text)" strokeWidth="2" />
      <line x1={W - padX + 30} y1={wireYTop} x2={W - padX + 30} y2={wireYBottom} stroke="var(--text)" strokeWidth="2" />
      <line x1={padX - 30} y1={wireYBottom} x2={W - padX + 30} y2={wireYBottom} stroke="var(--text)" strokeWidth="2" />

      {/* 분기 ─ 각 저항 */}
      {perResistor.map((r, i) => {
        const branchY = n === 1 ? (wireYTop + wireYBottom) / 2 : wireYTop + 10 + branchSpacing * i
        const cx = (branchX1 + branchX2) / 2
        const rectW = 50
        const rectH = 22
        const x = cx - rectW / 2
        const y = branchY - rectH / 2
        return (
          <g key={r.id}>
            {/* 분기 위 ↓ */}
            <line x1={branchX1} y1={wireYTop} x2={branchX1} y2={branchY} stroke="var(--text)" strokeWidth="2" />
            <line x1={branchX2} y1={wireYTop} x2={branchX2} y2={branchY} stroke="var(--text)" strokeWidth="2" />
            {/* 가로 — 분기점에서 저항까지 */}
            <line x1={branchX1} y1={branchY} x2={x} y2={branchY} stroke="var(--text)" strokeWidth="2" />
            <line x1={x + rectW} y1={branchY} x2={branchX2} y2={branchY} stroke="var(--text)" strokeWidth="2" />
            {/* 분기 아래 ↓ */}
            <line x1={branchX1} y1={branchY} x2={branchX1} y2={wireYBottom} stroke="var(--text)" strokeWidth="2" />
            <line x1={branchX2} y1={branchY} x2={branchX2} y2={wireYBottom} stroke="var(--text)" strokeWidth="2" />
            {/* 노드 점 */}
            <circle cx={branchX1} cy={branchY} r="3" fill="var(--text)" />
            <circle cx={branchX2} cy={branchY} r="3" fill="var(--text)" />
            {/* 저항 */}
            <rect x={x} y={y} width={rectW} height={rectH} fill="var(--bg2)" stroke="#FFD700" strokeWidth="2" rx="2" />
            <polyline
              points={`${x + 4},${y + rectH / 2} ${x + 8},${y + 4} ${x + 14},${y + rectH - 4} ${x + 20},${y + 4} ${x + 26},${y + rectH - 4} ${x + 32},${y + 4} ${x + 38},${y + rectH - 4} ${x + 42},${y + rectH / 2} ${x + rectW - 4},${y + rectH / 2}`}
              fill="none" stroke="#FFD700" strokeWidth="1.5"
            />
            <text x={cx} y={y - 6} fontSize="12" fill="#FFD700" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>{r.label} = {fmtR(r.resistance)}</text>
            <text x={x + rectW + 12} y={branchY + 4} fontSize="11" fill="#FFD700" fontFamily="Syne, sans-serif" fontWeight={700}>I = {fmtA(r.current)}</text>
          </g>
        )
      })}
      <text x={padX + 30} y={wireYTop - 10} fontSize="13" fill="#3EFFD0" fontFamily="Syne, sans-serif" fontWeight={700}>
        → I_total = {fmtA(totalI)}
      </text>
    </svg>
  )
}

// ─────────────────────────────────────────────
// 시험 빈출 문제
// ─────────────────────────────────────────────
const EXAM_PROBLEMS = [
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

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CircuitSimulatorClient() {
  const [tab, setTab] = useState<'sim' | 'ohm' | 'learn' | 'exam'>('sim')

  // ─ 시뮬레이터 ─
  const [voltage, setVoltage] = useState<number>(12)
  const [type, setType] = useState<CircuitType>('series')
  const [resistors, setResistors] = useState<Resistor[]>([
    { id: newId(), value: 100, label: 'R1', powerRating: 0.25 },
    { id: newId(), value: 200, label: 'R2', powerRating: 0.25 },
  ])
  const [activePreset, setActivePreset] = useState<string>('series-2')

  // ─ 옴의 법칙 ─
  const [ohmKnown, setOhmKnown] = useState<'V_R' | 'V_I' | 'I_R' | 'V_P'>('V_R')
  const [ohmV, setOhmV] = useState<string>('12')
  const [ohmI, setOhmI] = useState<string>('0.04')
  const [ohmR, setOhmR] = useState<string>('100')
  const [ohmP, setOhmP] = useState<string>('1')

  // ─ 시험 ─
  const [examReveal, setExamReveal] = useState<Record<number, number>>({})

  // ─ 복사 ─
  const [copied, setCopied] = useState<boolean>(false)

  // 프리셋 적용
  function applyPreset(p: Preset) {
    setActivePreset(p.id)
    setVoltage(p.voltage)
    setType(p.type === 'parallel' ? 'parallel' : 'series')
    setResistors(p.resistors.map(r => ({ id: newId(), value: r.value, label: r.label, powerRating: 0.25 })))
  }

  function addResistor() {
    if (resistors.length >= 6) return
    const next = resistors.length + 1
    setResistors([...resistors, { id: newId(), value: 100, label: `R${next}`, powerRating: 0.25 }])
    setActivePreset('')
  }
  function removeResistor(id: string) {
    if (resistors.length <= 1) return
    const filtered = resistors.filter(r => r.id !== id)
    // 라벨 재정렬
    const relabeled = filtered.map((r, i) => ({ ...r, label: `R${i + 1}` }))
    setResistors(relabeled)
    setActivePreset('')
  }
  function updateResistor(id: string, patch: Partial<Resistor>) {
    setResistors(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r))
    setActivePreset('')
  }

  // 시뮬레이터 결과
  const result = useMemo(() => calcCircuit(voltage, type, resistors), [voltage, type, resistors])

  // 검증 — KVL/KCL
  const verifyText = useMemo(() => {
    if (resistors.length === 0) return null
    if (type === 'series') {
      const sumV = result.perResistor.reduce((a, r) => a + r.voltage, 0)
      return {
        title: '✅ 키르히호프 전압 법칙 (KVL)',
        line: `V_${result.perResistor.map(r => r.label).join(' + V_')} = ${result.perResistor.map(r => r.voltage.toFixed(2)).join(' + ')} = ${sumV.toFixed(2)}V = V_전체`,
      }
    }
    const sumI = result.perResistor.reduce((a, r) => a + r.current, 0)
    return {
      title: '✅ 키르히호프 전류 법칙 (KCL)',
      line: `I_${result.perResistor.map(r => r.label).join(' + I_')} = ${result.perResistor.map(r => (r.current * 1000).toFixed(1) + 'mA').join(' + ')} = ${(sumI * 1000).toFixed(1)}mA = I_전체`,
    }
  }, [type, result, resistors])

  // 정격 초과 여부
  const hasPowerWarning = result.perResistor.some(r => r.powerExceeded)

  // ─────────────────────────────────────────────
  // 옴의 법칙 빠른 계산
  // ─────────────────────────────────────────────
  const ohmCalc = useMemo(() => {
    const V = parseFloat(ohmV) || 0
    const I = parseFloat(ohmI) || 0
    const R = parseFloat(ohmR) || 0
    const P = parseFloat(ohmP) || 0
    let Vr = V, Ir = I, Rr = R, Pr = P
    if (ohmKnown === 'V_R') {
      Ir = R > 0 ? V / R : 0
      Pr = V * Ir
    } else if (ohmKnown === 'V_I') {
      Rr = I > 0 ? V / I : 0
      Pr = V * I
    } else if (ohmKnown === 'I_R') {
      Vr = I * R
      Pr = Vr * I
    } else if (ohmKnown === 'V_P') {
      Ir = V > 0 ? P / V : 0
      Rr = Ir > 0 ? V / Ir : 0
    }
    return { V: Vr, I: Ir, R: Rr, P: Pr }
  }, [ohmKnown, ohmV, ohmI, ohmR, ohmP])

  // ─────────────────────────────────────────────
  // 학습 모드 (현재 시뮬레이션 회로 기준 풀이 단계)
  // ─────────────────────────────────────────────
  const learnSteps = useMemo(() => {
    if (resistors.length === 0) return null
    const steps: { num: string; title: string; formula: string; calc: string }[] = []

    steps.push({
      num: 'STEP 1',
      title: '회로 분석',
      formula: '회로 타입과 저항 개수 파악',
      calc: `회로 타입: ${type === 'series' ? '직렬 (Series)' : '병렬 (Parallel)'}\n저항 개수: ${resistors.length}개\n전원 전압: ${fmtV(voltage)}`,
    })

    if (type === 'series') {
      steps.push({
        num: 'STEP 2',
        title: '전체 저항 (직렬 합성)',
        formula: 'R_total = R₁ + R₂ + ... + Rₙ',
        calc: `R_total = ${resistors.map(r => r.value).join(' + ')} = ${result.totalResistance.toFixed(2)} Ω`,
      })
    } else {
      steps.push({
        num: 'STEP 2',
        title: '전체 저항 (병렬 합성)',
        formula: '1/R_total = 1/R₁ + 1/R₂ + ... + 1/Rₙ',
        calc: `1/R = ${resistors.map(r => `1/${r.value}`).join(' + ')} ≈ ${(1 / result.totalResistance).toFixed(5)}\nR_total ≈ ${result.totalResistance.toFixed(2)} Ω`,
      })
    }

    steps.push({
      num: 'STEP 3',
      title: '전체 전류 (옴의 법칙)',
      formula: 'I = V / R',
      calc: `I = ${voltage} / ${result.totalResistance.toFixed(2)} = ${result.totalCurrent.toFixed(4)} A = ${(result.totalCurrent * 1000).toFixed(2)} mA`,
    })

    if (type === 'series') {
      steps.push({
        num: 'STEP 4',
        title: '각 저항 전압 (V = IR)',
        formula: '직렬: 전류 동일, 전압 분배',
        calc: result.perResistor.map(r => `V_${r.label} = ${result.totalCurrent.toFixed(4)} × ${r.resistance} = ${r.voltage.toFixed(3)} V`).join('\n')
          + `\n검증 (KVL): ${result.perResistor.map(r => r.voltage.toFixed(2)).join(' + ')} = ${result.perResistor.reduce((a, r) => a + r.voltage, 0).toFixed(2)} V ✓`,
      })
    } else {
      steps.push({
        num: 'STEP 4',
        title: '각 저항 전류 (I = V/R)',
        formula: '병렬: 전압 동일, 전류 분배',
        calc: result.perResistor.map(r => `I_${r.label} = ${voltage} / ${r.resistance} = ${(r.current * 1000).toFixed(2)} mA`).join('\n')
          + `\n검증 (KCL): ${result.perResistor.map(r => (r.current * 1000).toFixed(1) + 'mA').join(' + ')} = ${(result.perResistor.reduce((a, r) => a + r.current, 0) * 1000).toFixed(2)} mA ✓`,
      })
    }

    steps.push({
      num: 'STEP 5',
      title: '각 저항 전력 (P = VI = I²R = V²/R)',
      formula: 'P_n = V_n × I_n',
      calc: result.perResistor.map(r => `P_${r.label} = ${r.voltage.toFixed(2)} × ${(r.current * 1000).toFixed(2)}mA = ${(r.power * 1000).toFixed(2)} mW`).join('\n')
        + `\nP_total = ${(result.totalPower * 1000).toFixed(2)} mW`,
    })

    return steps
  }, [type, voltage, resistors, result])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    const text = [
      `[옴의 법칙 시뮬레이터]`,
      `회로: ${type === 'series' ? '직렬' : '병렬'} · 저항 ${resistors.length}개 · 전원 ${fmtV(voltage)}`,
      ``,
      `전체 저항: ${fmtR(result.totalResistance)}`,
      `전체 전류: ${fmtA(result.totalCurrent)}`,
      `전체 전력: ${fmtW(result.totalPower)}`,
      ``,
      ...result.perResistor.map(r => `· ${r.label} (${fmtR(r.resistance)}): V=${fmtV(r.voltage)} I=${fmtA(r.current)} P=${fmtW(r.power)}`),
      ``,
      `https://youtil.kr/tools/edu/circuit-simulator`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <div className={s.disclaimer}>
        <strong>교육·학습 목적 시뮬레이터</strong>입니다. 실제 회로 설계 시 전선 저항·온도·내전압 등 추가 요소를 고려해야 하며,
        DIY 작업 시 안전 기준을 준수하세요. <strong>220V 가정 전기는 매우 위험</strong>하므로 본 도구로 직접 설계하지 마세요.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'sim'   ? s.tabActive : ''}`} onClick={() => setTab('sim')}>회로 시뮬레이터</button>
        <button className={`${s.tabBtn} ${tab === 'ohm'   ? s.tabActive : ''}`} onClick={() => setTab('ohm')}>옴의 법칙 빠른 계산</button>
        <button className={`${s.tabBtn} ${tab === 'learn' ? s.tabActive : ''}`} onClick={() => setTab('learn')}>학습 모드 (단계별 풀이)</button>
        <button className={`${s.tabBtn} ${tab === 'exam'  ? s.tabActive : ''}`} onClick={() => setTab('exam')}>시험 빈출 패턴</button>
      </div>

      {/* ─── TAB 1: 시뮬레이터 ─── */}
      {tab === 'sim' && (
        <>
          {/* 프리셋 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>빠른 시작 — 빈출 회로 7가지</span>
              <span className={s.cardLabelHint}>클릭 시 자동 입력</span>
            </div>
            <div className={s.presetGrid}>
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className={`${s.presetCard} ${activePreset === p.id ? s.presetActive : ''}`}
                  onClick={() => applyPreset(p)}
                  type="button"
                >
                  <span className={s.presetIcon}>{p.icon}</span>
                  <span className={s.presetName}>{p.name}</span>
                  <span className={s.presetGrade}>{p.grade}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 전압 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>전원 전압 (V)</span>
              <span className={s.cardLabelHint}>0~30V</span>
            </div>
            <div className={s.sliderRow}>
              <input type="range" min={0.1} max={30} step={0.1} value={voltage} onChange={e => { setVoltage(parseFloat(e.target.value)); setActivePreset('') }} />
              <span className={s.sliderValue}>{voltage.toFixed(1)}V</span>
            </div>
            <div className={s.voltQuickRow} style={{ marginTop: 10 }}>
              {VOLTAGE_QUICK.map(q => (
                <button
                  key={q.v}
                  className={`${s.voltQuickBtn} ${Math.abs(voltage - q.v) < 0.01 ? s.voltQuickActive : ''}`}
                  onClick={() => { setVoltage(q.v); setActivePreset('') }}
                  type="button"
                >
                  {q.l}<br /><small style={{ fontSize: 9 }}>{q.n}</small>
                </button>
              ))}
            </div>
          </div>

          {/* 회로 타입 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>회로 타입</span>
            </div>
            <div className={s.typeRow}>
              <button className={`${s.typeBtn} ${s.typeSeries}   ${type === 'series'   ? s.typeActive : ''}`} onClick={() => { setType('series'); setActivePreset('') }}>━ 직렬 (Series)</button>
              <button className={`${s.typeBtn} ${s.typeParallel} ${type === 'parallel' ? s.typeActive : ''}`} onClick={() => { setType('parallel'); setActivePreset('') }}>▥ 병렬 (Parallel)</button>
            </div>
          </div>

          {/* 저항 입력 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>저항 ({resistors.length}/6)</span>
              <span className={s.cardLabelHint}>1~10kΩ · 정격 선택</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {resistors.map(r => (
                <div key={r.id} className={s.resistorRow}>
                  <span className={s.resistorLabel}>{r.label}</span>
                  <div className={s.resistorValueRow}>
                    <input type="range" min={1} max={10000} step={1} value={r.value} onChange={e => updateResistor(r.id, { value: parseFloat(e.target.value) })} />
                    <span className={s.resistorValueDisplay}>{fmtR(r.value)}</span>
                  </div>
                  <select
                    className={s.resistorPowerSelect}
                    value={r.powerRating}
                    onChange={e => updateResistor(r.id, { powerRating: parseFloat(e.target.value) })}
                  >
                    {POWER_RATINGS.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
                  </select>
                  <button className={s.removeBtn} onClick={() => removeResistor(r.id)} disabled={resistors.length <= 1} type="button">×</button>
                </div>
              ))}
            </div>
            <button className={s.addResistorBtn} onClick={addResistor} disabled={resistors.length >= 6} type="button">
              + 저항 추가 (현재 {resistors.length}/6)
            </button>
          </div>

          {/* 회로 SVG */}
          <div className={s.circuitWrap}>
            <CircuitDiagram voltage={voltage} type={type} perResistor={result.perResistor} />
          </div>

          {/* 결과 4분할 */}
          <div className={s.resultGrid}>
            <div className={`${s.resultCard} ${s.resVoltage}`}>
              <p className={s.resultLabel}>전체 전압</p>
              <p className={s.resultValue}>{voltage.toFixed(1)}<span className={s.resultUnit}>V</span></p>
            </div>
            <div className={`${s.resultCard} ${s.resResistance}`}>
              <p className={s.resultLabel}>전체 저항</p>
              <p className={s.resultValue}>{fmtR(result.totalResistance)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resCurrent}`}>
              <p className={s.resultLabel}>전체 전류</p>
              <p className={s.resultValue}>{fmtA(result.totalCurrent)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resPower}`}>
              <p className={s.resultLabel}>전체 전력</p>
              <p className={s.resultValue}>{fmtW(result.totalPower)}</p>
            </div>
          </div>

          {/* 분석 표 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>각 저항 분석</span>
            </div>
            <div className={s.tableScroll}>
              <table className={s.analysisTable}>
                <thead>
                  <tr>
                    <th>저항</th>
                    <th>값</th>
                    <th>전압</th>
                    <th>전류</th>
                    <th>전력</th>
                    <th>정격</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perResistor.map(r => (
                    <tr key={r.id}>
                      <td>{r.label}</td>
                      <td>{fmtR(r.resistance)}</td>
                      <td className={s.colVoltage}>{fmtV(r.voltage)}</td>
                      <td className={s.colCurrent}>{fmtA(r.current)}</td>
                      <td className={`${s.colPower} ${r.powerExceeded ? s.powerWarn : ''}`}>{fmtW(r.power)}{r.powerExceeded ? ' ⚠️' : ''}</td>
                      <td>{POWER_RATINGS.find(p => p.value === r.powerRating)?.label ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 정격 초과 경고 */}
          {hasPowerWarning && (
            <div className={s.warnCard}>
              <strong>⚠️ 정격 초과:</strong> 일부 저항의 전력 소비가 정격을 초과합니다.
              실제 회로에서는 발열·손상으로 이어질 수 있어 더 큰 정격(예: 1/2W, 1W)의 저항으로 교체하거나 안전 마진(2배 이상)을 두세요.
            </div>
          )}

          {/* 검증 */}
          {verifyText && (
            <div className={s.verifyCard}>
              <p className={s.verifyTitle}>{verifyText.title}</p>
              <div className={s.verifyLine}>{verifyText.line}</div>
              <div className={s.verifyLine}>
                ⚡ 전력 합산: P = V × I = {voltage.toFixed(1)} × {fmtA(result.totalCurrent)} = <strong>{fmtW(result.totalPower)}</strong>
              </div>
            </div>
          )}

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ─── TAB 2: 옴의 법칙 빠른 계산 ─── */}
      {tab === 'ohm' && (
        <>
          <div className={s.formulaCard}>
            <p className={s.formulaTitle}>핵심 공식</p>
            <div><strong>V</strong> = I × R   (옴의 법칙)</div>
            <div><strong>P</strong> = V × I = I² × R = V² / R</div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>알고 있는 값 선택</span>
              <span className={s.cardLabelHint}>2가지 입력 → 나머지 자동</span>
            </div>
            <div className={s.knownToggle}>
              <button className={`${s.knownBtn} ${ohmKnown === 'V_R' ? s.knownActive : ''}`} onClick={() => setOhmKnown('V_R')}>V + R</button>
              <button className={`${s.knownBtn} ${ohmKnown === 'V_I' ? s.knownActive : ''}`} onClick={() => setOhmKnown('V_I')}>V + I</button>
              <button className={`${s.knownBtn} ${ohmKnown === 'I_R' ? s.knownActive : ''}`} onClick={() => setOhmKnown('I_R')}>I + R</button>
              <button className={`${s.knownBtn} ${ohmKnown === 'V_P' ? s.knownActive : ''}`} onClick={() => setOhmKnown('V_P')}>V + P</button>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.gridFour}>
              <div>
                <span className={s.subLabel}>전압 V (V)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" step="0.1" value={ohmV}
                  onChange={e => setOhmV(e.target.value)}
                  disabled={ohmKnown === 'I_R'}
                />
              </div>
              <div>
                <span className={s.subLabel}>전류 I (A)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" step="0.001" value={ohmI}
                  onChange={e => setOhmI(e.target.value)}
                  disabled={ohmKnown !== 'V_I' && ohmKnown !== 'I_R'}
                />
              </div>
              <div>
                <span className={s.subLabel}>저항 R (Ω)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" step="1" value={ohmR}
                  onChange={e => setOhmR(e.target.value)}
                  disabled={ohmKnown === 'V_I' || ohmKnown === 'V_P'}
                />
              </div>
              <div>
                <span className={s.subLabel}>전력 P (W)</span>
                <input className={s.bigInput} type="number" inputMode="decimal" step="0.01" value={ohmP}
                  onChange={e => setOhmP(e.target.value)}
                  disabled={ohmKnown !== 'V_P'}
                />
              </div>
            </div>
          </div>

          {/* 결과 */}
          <div className={s.resultGrid}>
            <div className={`${s.resultCard} ${s.resVoltage}`}>
              <p className={s.resultLabel}>전압 V</p>
              <p className={s.resultValue}>{ohmCalc.V.toFixed(2)}<span className={s.resultUnit}>V</span></p>
            </div>
            <div className={`${s.resultCard} ${s.resCurrent}`}>
              <p className={s.resultLabel}>전류 I</p>
              <p className={s.resultValue}>{fmtA(ohmCalc.I)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resResistance}`}>
              <p className={s.resultLabel}>저항 R</p>
              <p className={s.resultValue}>{fmtR(ohmCalc.R)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resPower}`}>
              <p className={s.resultLabel}>전력 P</p>
              <p className={s.resultValue}>{fmtW(ohmCalc.P)}</p>
            </div>
          </div>

          {/* 가이드 */}
          <div className={s.formulaCard}>
            <p className={s.formulaTitle}>💡 직관 가이드</p>
            <div>전압이 2배 → 전류도 2배 (저항 일정)</div>
            <div>저항이 2배 → 전류는 절반 (전압 일정)</div>
            <div>전류 또는 전압 2배 → 전력 2배 (다른 변수 일정)</div>
            <div>전압 2배 → 전력 4배 (저항 일정, P = V²/R)</div>
          </div>

          {/* LED 저항 빠른 계산 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>💡 LED 전류 제한 저항 빠른 계산</span>
            </div>
            <div className={s.formulaCard} style={{ marginTop: 0 }}>
              <p className={s.formulaTitle}>R = (V_source − V_LED) / I_LED</p>
              <div>5V + 빨간 LED(Vf=2V) + 20mA → R = (5−2)/0.02 = <strong>150Ω</strong> (안전 220Ω 권장)</div>
              <div>5V + 흰색 LED(Vf=3.2V) + 20mA → R = (5−3.2)/0.02 = <strong>90Ω</strong> (안전 100Ω 권장)</div>
              <div>9V + 파란 LED(Vf=3.4V) + 20mA → R = (9−3.4)/0.02 = <strong>280Ω</strong> (안전 330Ω 권장)</div>
            </div>
          </div>
        </>
      )}

      {/* ─── TAB 3: 학습 모드 ─── */}
      {tab === 'learn' && (
        <>
          <div className={s.formulaCard}>
            <p className={s.formulaTitle}>📚 핵심 공식 모음</p>
            <div><strong>옴의 법칙:</strong> V = I × R</div>
            <div><strong>전력:</strong> P = V × I = I² × R = V² / R</div>
            <div><strong>직렬 합성:</strong> R_total = R₁ + R₂ + ... + Rₙ</div>
            <div><strong>병렬 합성:</strong> 1/R_total = 1/R₁ + 1/R₂ + ... + 1/Rₙ</div>
            <div><strong>KVL (전압):</strong> 폐회로 전압 합 = 0</div>
            <div><strong>KCL (전류):</strong> 노드 들어가는 전류 = 나오는 전류</div>
          </div>

          {/* 현재 시뮬레이션 회로의 단계별 풀이 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>현재 시뮬레이터 회로의 단계별 풀이</span>
              <span className={s.cardLabelHint}>회로 시뮬레이터 탭에서 회로 변경 가능</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
              회로: <strong style={{ color: '#3EFFD0' }}>{type === 'series' ? '직렬' : '병렬'}</strong> ·
              {' '}저항 <strong style={{ color: '#FFD700' }}>{resistors.length}개</strong> ·
              {' '}전원 <strong style={{ color: '#3EFFD0' }}>{fmtV(voltage)}</strong>
            </p>
          </div>

          {learnSteps && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {learnSteps.map((step, i) => (
                <div key={i} className={s.stepCard}>
                  <span className={s.stepNumber}>{step.num}</span>
                  <p className={s.stepTitle}>{step.title}</p>
                  <div className={s.stepFormula}>{step.formula}</div>
                  <pre className={s.stepCalc} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{step.calc}</pre>
                </div>
              ))}
            </div>
          )}

          {/* 회로 SVG (학습용 보조) */}
          <div className={s.circuitWrap}>
            <CircuitDiagram voltage={voltage} type={type} perResistor={result.perResistor} />
          </div>
        </>
      )}

      {/* ─── TAB 4: 시험 빈출 패턴 ─── */}
      {tab === 'exam' && (
        <>
          <div className={s.formulaCard}>
            <p className={s.formulaTitle}>📝 한국 중3·고1 물리 빈출 회로 7문제</p>
            <div>각 문제의 정답을 클릭한 뒤 [정답·풀이 보기]로 단계별 풀이 확인</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {EXAM_PROBLEMS.map((prob, idx) => {
              const selected = examReveal[idx]
              const revealed = selected !== undefined
              return (
                <div key={idx} className={s.examCard}>
                  <div className={s.examHeader}>
                    <span className={s.examNumber}>문제 {idx + 1}</span>
                    <span className={s.examGrade}>{prob.grade}</span>
                  </div>
                  <p className={s.examQuestion}>{prob.q}</p>
                  <div className={s.examChoices}>
                    {prob.choices.map((c, ci) => {
                      const isCorrect = ci === prob.correct
                      const isSelected = selected === ci
                      let cls = s.examChoice
                      if (revealed) {
                        if (isCorrect) cls = `${s.examChoice} ${s.examChoiceCorrect}`
                        else if (isSelected && !isCorrect) cls = `${s.examChoice} ${s.examChoiceWrong}`
                      }
                      return (
                        <button
                          key={ci}
                          className={cls}
                          onClick={() => setExamReveal(prev => ({ ...prev, [idx]: ci }))}
                          type="button"
                          disabled={revealed}
                        >
                          {String.fromCharCode(0x2460 + ci)} {c}
                        </button>
                      )
                    })}
                  </div>
                  {!revealed && (
                    <button className={s.examShowBtn} onClick={() => setExamReveal(prev => ({ ...prev, [idx]: prob.correct }))} type="button">
                      정답·풀이 보기
                    </button>
                  )}
                  {revealed && (
                    <div className={s.examSolution}>
                      <p style={{ marginBottom: 6 }}>
                        <strong>정답:</strong> {String.fromCharCode(0x2460 + prob.correct)} {prob.choices[prob.correct]}
                      </p>
                      <p dangerouslySetInnerHTML={{ __html: '풀이: ' + prob.solution }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
