'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import s from './circuit-simulator.module.css'
import {
  fmtV, fmtA, fmtR, fmtW, round,
  type Resistor, type CircuitType, type Preset, type CalcResult, type OhmKnown,
  PRESETS, POWER_RATINGS, VOLTAGE_QUICK, calcCircuit, calcOhm, ledResistor, EXAM_PROBLEMS,
} from './circuitData'

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────

let idCounter = 0
const newId = () => `r-${++idCounter}`

type TabId = 'sim' | 'ohm' | 'learn' | 'exam'
const TAB_DEFS: { id: TabId; label: string }[] = [
  { id: 'sim',   label: '회로 시뮬레이터' },
  { id: 'ohm',   label: '옴의 법칙 빠른 계산' },
  { id: 'learn', label: '학습 모드 (단계별 풀이)' },
  { id: 'exam',  label: '시험 빈출 패턴' },
]


// ─────────────────────────────────────────────
// 회로 계산
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 회로 SVG
// ─────────────────────────────────────────────
function CircuitDiagram({ voltage, type, perResistor, ledDropV = 0 }: { voltage: number; type: CircuitType; perResistor: CalcResult['perResistor']; ledDropV?: number }) {
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
    /* ⚠️ LED 전압강하를 계산에 넣고도 도면엔 저항만 그리면 전지 5V ↔ 저항 3V가 안 맞아 보인다
       — LED가 있으면 첫 칸에 다이오드 기호를 그리고 저항들은 그 뒤에 배치한다. */
    const hasLed = ledDropV > 0
    const ledW = hasLed ? 84 : 0
    const spacing = (innerW - ledW) / n
    const ledCx = padX + ledW / 2
    const wY = wireY - 30

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={s.circuitSvg} style={{ ['--flow-speed' as never]: `${flowSpeed}s` }}>
        {/* 전압원 (배터리) */}
        <g transform={`translate(${padX - 30}, ${wireY})`}>
          <line x1="0" y1={-30} x2="0" y2={bottomY - wireY + 30} stroke="var(--text)" strokeWidth="2" />
          {/* 배터리 셀 */}
          <g transform={`translate(0, ${(bottomY - wireY) / 2})`}>
            <line x1="-12" y1="-12" x2="-12" y2="12" stroke="var(--text)" strokeWidth="3" />
            <line x1="-6"  y1="-6"  x2="-6"  y2="6"  stroke="var(--text)" strokeWidth="2" />
            <text x="-25" y="0" fontSize="13" fill="#0F766E" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>+</text>
            <text x="-25" y={bottomY - wireY - 30} fontSize="13" fill="var(--muted)" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>−</text>
          </g>
        </g>
        {/* 전압 라벨 — 그룹 안 x=−50은 viewBox 왼쪽 밖(절대 −20)이라 보이지 않았다 */}
        <text x={padX - 30} y={wireY - 45} fontSize="13" fill="#0F766E" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>{fmtV(voltage)}</text>

        {/* 상단 전선 */}
        <line x1={padX - 30} y1={wireY - 30} x2={padX - 30 + 30} y2={wireY - 30} stroke="var(--text)" strokeWidth="2" />
        <line className={s.currentLine} x1={padX - 30} y1={wireY - 30} x2={W - padX + 30} y2={wireY - 30} stroke="#0D9488" strokeWidth="2.5" />
        <line x1={padX - 30} y1={wireY - 30} x2={padX - 30} y2={wireY - 30} stroke="var(--text)" strokeWidth="2" />
        {/* 메인 가로선 */}
        <line x1={padX} y1={wireY - 30} x2={W - padX} y2={wireY - 30} stroke="var(--text)" strokeWidth="2" />

        {/* LED (직렬, 전압강하 반영 시) — 삼각형 + 막대 + 발광 화살표 */}
        {hasLed && (
          <g>
            <rect x={ledCx - 18} y={wY - 12} width={36} height={24} fill="var(--bg3)" />
            <polygon points={`${ledCx - 9},${wY - 9} ${ledCx - 9},${wY + 9} ${ledCx + 7},${wY}`} fill="none" stroke="#B91C1C" strokeWidth="2" />
            <line x1={ledCx + 7} y1={wY - 9} x2={ledCx + 7} y2={wY + 9} stroke="#B91C1C" strokeWidth="2" />
            <line x1={ledCx + 2} y1={wY - 12} x2={ledCx + 9} y2={wY - 19} stroke="#B91C1C" strokeWidth="1.5" />
            <line x1={ledCx + 7} y1={wY - 10} x2={ledCx + 14} y2={wY - 17} stroke="#B91C1C" strokeWidth="1.5" />
            <text x={ledCx} y={wY - 26} fontSize="12" fill="#B91C1C" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>LED</text>
            <text x={ledCx} y={wY + 25} fontSize="11" fill="#B91C1C" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={700}>−{fmtV(ledDropV)}</text>
          </g>
        )}

        {/* 저항들 (지그재그) */}
        {perResistor.map((r, i) => {
          const cx = padX + ledW + spacing * (i + 0.5)
          const x = cx - rectW / 2
          const y = wireY - 30 - rectH / 2
          return (
            <g key={r.id}>
              <rect x={x} y={y} width={rectW} height={rectH} fill="var(--bg2)" stroke="#A16207" strokeWidth="2" rx="2" />
              {/* 지그재그 inside */}
              <polyline
                points={`${x + 4},${y + rectH / 2} ${x + 8},${y + 4} ${x + 14},${y + rectH - 4} ${x + 20},${y + 4} ${x + 26},${y + rectH - 4} ${x + 32},${y + 4} ${x + 38},${y + rectH - 4} ${x + 42},${y + rectH / 2} ${x + rectW - 4},${y + rectH / 2}`}
                fill="none" stroke="#A16207" strokeWidth="1.5"
              />
              {/* 라벨 */}
              <text x={cx} y={y - 18} fontSize="12" fill="#A16207" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>{r.label}</text>
              <text x={cx} y={y - 4}  fontSize="11" fill="var(--muted)" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>{fmtR(r.resistance)}</text>
              <text x={cx} y={y + rectH + 14} fontSize="11" fill="#0F766E" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={700}>{fmtV(r.voltage)}</text>
              <text x={cx} y={y + rectH + 28} fontSize="10" fill={r.powerExceeded ? '#DC2626' : 'var(--muted)'} textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>
                {fmtW(r.power)}{r.powerExceeded ? ' ⚠️' : ''}
              </text>
            </g>
          )
        })}

        {/* 하단 전선 */}
        <line x1={padX - 30} y1={bottomY} x2={W - padX + 30} y2={bottomY} stroke="var(--text)" strokeWidth="2" />
        <line x1={W - padX + 30} y1={wireY - 30} x2={W - padX + 30} y2={bottomY} stroke="var(--text)" strokeWidth="2" />
        {/* 전류 라벨 — 상단(wireY−50)에 두면 홀수 개 저항의 이름·값 라벨과 겹친다.
            하단 전선 아래는 비어 있고, 귀환 경로라 방향은 ←가 물리적으로 맞다. */}
        <text x={padX + innerW / 2} y={bottomY + 22} fontSize="13" fill="#0F766E" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={700}>
          ← I = {fmtA(totalI)}
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
        <text x="-25" y="-20" fontSize="13" fill="#0F766E" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>+</text>
        <text x="-25" y="28"  fontSize="13" fill="var(--muted)" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>−</text>
      </g>
      {/* 전압 라벨 — 그룹 안 x=−50은 viewBox 밖이라 보이지 않았다 */}
      <text x={padX - 30} y={wireYTop - 25} fontSize="13" fill="#0F766E" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>{fmtV(voltage)}</text>

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
            <rect x={x} y={y} width={rectW} height={rectH} fill="var(--bg2)" stroke="#A16207" strokeWidth="2" rx="2" />
            <polyline
              points={`${x + 4},${y + rectH / 2} ${x + 8},${y + 4} ${x + 14},${y + rectH - 4} ${x + 20},${y + 4} ${x + 26},${y + rectH - 4} ${x + 32},${y + 4} ${x + 38},${y + rectH - 4} ${x + 42},${y + rectH / 2} ${x + rectW - 4},${y + rectH / 2}`}
              fill="none" stroke="#A16207" strokeWidth="1.5"
            />
            <text x={cx} y={y - 6} fontSize="12" fill="#A16207" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={800}>{r.label} = {fmtR(r.resistance)}</text>
            <text x={x + rectW + 12} y={branchY + 4} fontSize="11" fill="#A16207" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={700}>I = {fmtA(r.current)}</text>
          </g>
        )
      })}
      <text x={padX + 30} y={wireYTop - 10} fontSize="13" fill="#0F766E" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={700}>
        → I_total = {fmtA(totalI)}
      </text>
    </svg>
  )
}

// ─────────────────────────────────────────────
// 시험 빈출 문제
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CircuitSimulatorClient() {
  const [tab, setTab] = useState<TabId>('sim')

  // ─ 시뮬레이터 ─
  const [voltage, setVoltage] = useState<number>(12)
  const [type, setType] = useState<CircuitType>('series')
  const [resistors, setResistors] = useState<Resistor[]>([
    { id: newId(), value: 100, label: 'R1', powerRating: 0.25 },
    { id: newId(), value: 200, label: 'R2', powerRating: 0.25 },
  ])
  const [activePreset, setActivePreset] = useState<string>('series-2')
  /* LED 전압강하(직렬). 0이면 순수 저항 회로. 프리셋이 설정하고, 사용자가 조절할 수 있다. */
  const [ledDropV, setLedDropV] = useState<number>(0)

  // ─ 옴의 법칙 ─
  const [ohmKnown, setOhmKnown] = useState<OhmKnown>('V_R')
  const [ohmV, setOhmV] = useState<string>('12')
  const [ohmI, setOhmI] = useState<string>('0.04')
  const [ohmR, setOhmR] = useState<string>('100')
  const [ohmP, setOhmP] = useState<string>('1')

  // ─ LED 저항 계산 (빠른 계산 탭) ─
  const [ledVs, setLedVs] = useState<string>('5')
  const [ledVf, setLedVf] = useState<string>('2')
  const [ledIf, setLedIf] = useState<string>('20')

  // ─ 저항 직접 입력 임시값 (타이핑 중 문자열 보존) ─
  const [resistorDrafts, setResistorDrafts] = useState<Record<string, string>>({})

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
    setLedDropV(p.ledDropV ?? 0)
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
  const result = useMemo(() => calcCircuit(voltage, type, resistors, { ledDropV }), [voltage, type, resistors, ledDropV])

  // 검증 — KVL/KCL
  const verifyText = useMemo(() => {
    if (resistors.length === 0) return null
    if (type === 'series') {
      if (result.ledNotLit) {
        return {
          title: '키르히호프 전압 법칙 (KVL)',
          line: `LED 미도통 (Vf ${result.ledDropV.toFixed(1)}V ≥ 전원 ${voltage.toFixed(1)}V) — 전류 0 A, 회로에 전류가 흐르지 않습니다`,
        }
      }
      const sumV = result.perResistor.reduce((a, r) => a + r.voltage, 0)
      const terms = result.perResistor.map(r => `V_${r.label}`)
      const vals = result.perResistor.map(r => r.voltage.toFixed(2))
      if (result.ledDropV > 0) { terms.push('V_LED'); vals.push(result.ledDropV.toFixed(2)) }
      return {
        title: '키르히호프 전압 법칙 (KVL)',
        line: `${terms.join(' + ')} = ${vals.join(' + ')} = ${(sumV + result.ledDropV).toFixed(2)}V = V_전원`,
      }
    }
    const sumI = result.perResistor.reduce((a, r) => a + r.current, 0)
    return {
      title: '키르히호프 전류 법칙 (KCL)',
      line: `I_${result.perResistor.map(r => r.label).join(' + I_')} = ${result.perResistor.map(r => (r.current * 1000).toFixed(1) + 'mA').join(' + ')} = ${(sumI * 1000).toFixed(1)}mA = I_전체`,
    }
  }, [type, result, resistors, voltage])

  // 정격 초과·마진 부족 여부
  const hasPowerWarning = result.perResistor.some(r => r.powerExceeded)
  const hasMarginWarning = !hasPowerWarning && result.perResistor.some(r => r.powerMarginal)

  // ─────────────────────────────────────────────
  // 옴의 법칙 빠른 계산
  // ─────────────────────────────────────────────
  /* 0Ω 단락·전류 0 개방·0V+P>0 모순은 0이 아니라 '계산 불가(—)'로 — circuitData.calcOhm */
  const ohmCalc = useMemo(
    () => calcOhm(ohmKnown, parseFloat(ohmV), parseFloat(ohmI), parseFloat(ohmR), parseFloat(ohmP)),
    [ohmKnown, ohmV, ohmI, ohmR, ohmP],
  )

  const ledCalc = useMemo(
    () => ledResistor(parseFloat(ledVs), parseFloat(ledVf), parseFloat(ledIf)),
    [ledVs, ledVf, ledIf],
  )

  /* 비활성(자동 계산) 입력칸엔 이전에 타이핑한 잔존값 대신 계산값을 보여준다
     — 기본 화면부터 I 입력 0.04 vs 결과 120mA처럼 모순돼 보이던 것 */
  const ohmShown = {
    V: ohmKnown === 'I_R' ? (ohmCalc.V === null ? '' : String(round(ohmCalc.V, 6))) : ohmV,
    I: (ohmKnown === 'V_I' || ohmKnown === 'I_R') ? ohmI : (ohmCalc.I === null ? '' : String(round(ohmCalc.I, 6))),
    R: (ohmKnown === 'V_R' || ohmKnown === 'I_R') ? ohmR : (ohmCalc.R === null ? '' : String(round(ohmCalc.R, 6))),
    P: ohmKnown === 'V_P' ? ohmP : (ohmCalc.P === null ? '' : String(round(ohmCalc.P, 6))),
  }

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
      calc: result.ledNotLit
        ? `LED 미도통 (Vf ${result.ledDropV.toFixed(1)}V ≥ 전원 ${voltage}V) — 전류 = 0 A`
        : result.ledDropV > 0
          ? `저항망 전압 = ${voltage} − ${result.ledDropV}(LED) = ${result.resistorVoltage.toFixed(2)} V\nI = ${result.resistorVoltage.toFixed(2)} / ${result.totalResistance.toFixed(2)} = ${result.totalCurrent.toFixed(4)} A = ${(result.totalCurrent * 1000).toFixed(2)} mA`
          : `I = ${voltage} / ${result.totalResistance.toFixed(2)} = ${result.totalCurrent.toFixed(4)} A = ${(result.totalCurrent * 1000).toFixed(2)} mA`,
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
        + (result.ledDropV > 0 ? `\nP_LED = ${result.ledDropV.toFixed(2)} × ${(result.totalCurrent * 1000).toFixed(2)}mA = ${(result.ledDropV * result.totalCurrent * 1000).toFixed(2)} mW` : '')
        + `\nP_total = ${(result.totalPower * 1000).toFixed(2)} mW`,
    })

    return steps
  }, [type, voltage, resistors, result])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    const text = [
      `[옴의 법칙 계산기]`,
      `회로: ${type === 'series' ? '직렬' : '병렬'} · 저항 ${resistors.length}개 · 전원 ${fmtV(voltage)}`,
      ...(result.ledDropV > 0 ? [`LED 전압강하: ${fmtV(result.ledDropV)} (저항망 ${fmtV(result.resistorVoltage)})`] : []),
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
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/edu/cosmic-calendar', label: '코스믹 캘린더' },
          { href: '/tools/edu/planet-comparison', label: '행성 비교' },
          { href: '/tools/edu/cognitive-test', label: '인지 테스트' }
        ]}
      >
        교육·학습 목적 시뮬레이터
      </Disclaimer>

      {/* 탭 — tablist 패턴 (화살표 키 이동 포함) */}
      <div className={s.tabs} role="tablist" aria-label="계산기 모드">
        {TAB_DEFS.map(t => (
          <button
            key={t.id}
            id={`cs-tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`cs-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className={`${s.tabBtn} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            onKeyDown={e => {
              const i = TAB_DEFS.findIndex(x => x.id === t.id)
              let next = -1
              if (e.key === 'ArrowRight') next = (i + 1) % TAB_DEFS.length
              else if (e.key === 'ArrowLeft') next = (i + TAB_DEFS.length - 1) % TAB_DEFS.length
              else if (e.key === 'Home') next = 0
              else if (e.key === 'End') next = TAB_DEFS.length - 1
              if (next >= 0) {
                e.preventDefault()
                setTab(TAB_DEFS[next].id)
                document.getElementById(`cs-tab-${TAB_DEFS[next].id}`)?.focus()
              }
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: 시뮬레이터 ─── */}
      {tab === 'sim' && (
        <div role="tabpanel" id="cs-panel-sim" aria-labelledby="cs-tab-sim" className={s.tabPanel}>
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
                  aria-pressed={activePreset === p.id}
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
              <label htmlFor="cs-voltage">전원 전압 (V)</label>
              <span className={s.cardLabelHint}>0~30V</span>
            </div>
            <div className={s.sliderRow}>
              <input id="cs-voltage" aria-label="전원 전압" type="range" min={0.1} max={30} step={0.1} value={voltage} onChange={e => { setVoltage(parseFloat(e.target.value)); setActivePreset('') }} />
              <span className={s.sliderValue}>{voltage.toFixed(1)}V</span>
            </div>
            <div className={s.voltQuickRow} style={{ marginTop: 10 }}>
              {VOLTAGE_QUICK.map(q => (
                <button
                  key={q.v}
                  className={`${s.voltQuickBtn} ${Math.abs(voltage - q.v) < 0.01 ? s.voltQuickActive : ''}`}
                  onClick={() => { setVoltage(q.v); setActivePreset('') }}
                  type="button"
                  aria-pressed={Math.abs(voltage - q.v) < 0.01}
                >
                  {q.l}<br /><small style={{ fontSize: 9 }}>{q.n}</small>
                </button>
              ))}
            </div>
            <p className={s.voltNote}>
              ※ 배터리 이름은 <strong>명목 전압 예시</strong>이며 계산은 이상적인 전압원 기준입니다.
              실제 전지는 내부저항·허용 전류 한계가 있어 큰 전류를 내지 못합니다(예: 코인전지 CR2032의 공칭 방전 전류는 0.2mA 수준).
            </p>

            {/* LED 전압강하 — 직렬 회로에서 저항 앞에 LED가 있으면 그만큼 저항에 걸리는 전압이 준다 */}
            {type === 'series' && (
              <div className={s.ledDropRow}>
                <label className={s.ledDropLabel} htmlFor="cs-leddrop">
                  💡 LED 전압강하 <span className={s.ledDropHint}>직렬 LED가 있으면 입력</span>
                </label>
                <div className={s.sliderRow}>
                  <input id="cs-leddrop" type="range" min={0} max={4} step={0.1} value={ledDropV}
                    onChange={e => { setLedDropV(parseFloat(e.target.value)); setActivePreset('') }} />
                  <span className={s.sliderValue}>{ledDropV === 0 ? '없음' : `${ledDropV.toFixed(1)}V`}</span>
                </div>
                {ledDropV > 0 && ledDropV < voltage && (
                  <p className={s.ledDropNote}>
                    저항망에는 {fmtV(voltage)} − {ledDropV.toFixed(1)}V = <strong>{fmtV(result.resistorVoltage)}</strong>가 걸립니다.
                  </p>
                )}
                {ledDropV > 0 && ledDropV >= voltage && (
                  <p className={s.ledDropWarn}>
                    ⚠️ LED 전압강하({ledDropV.toFixed(1)}V)가 전원({fmtV(voltage)}) 이상이라 LED가 켜지지 않습니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 회로 타입 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>회로 타입</span>
            </div>
            <div className={s.typeRow}>
              <button className={`${s.typeBtn} ${s.typeSeries}   ${type === 'series'   ? s.typeActive : ''}`} aria-pressed={type === 'series'} onClick={() => { setType('series'); setActivePreset('') }}>━ 직렬 (Series)</button>
              <button className={`${s.typeBtn} ${s.typeParallel} ${type === 'parallel' ? s.typeActive : ''}`} aria-pressed={type === 'parallel'} onClick={() => { setType('parallel'); setActivePreset(''); setLedDropV(0) }}>▥ 병렬 (Parallel)</button>
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
                    <input aria-label={`${r.label} 저항값 슬라이더`} type="range" min={1} max={10000} step={1} value={r.value}
                      onChange={e => {
                        updateResistor(r.id, { value: parseFloat(e.target.value) })
                        setResistorDrafts(prev => { const next = { ...prev }; delete next[r.id]; return next })
                      }} />
                    {/* 슬라이더만으론 1~10,000Ω을 1Ω 단위로 못 고른다 — 직접 입력 병행.
                        타이핑 중엔 빈 문자열까지 draft로 보존(''를 폴백시키면 마지막 자리를 지울 수 없다),
                        범위 밖 값은 즉시 클램프 커밋하고 blur에 표시도 커밋값으로 정리. */}
                    <input
                      className={s.resistorValueInput}
                      type="text" inputMode="numeric"
                      aria-label={`${r.label} 저항값 직접 입력 (옴)`}
                      value={resistorDrafts[r.id] ?? String(r.value)}
                      onChange={e => {
                        const raw = e.target.value.replace(/[^\d]/g, '')
                        setResistorDrafts(prev => ({ ...prev, [r.id]: raw }))
                        const n = parseInt(raw, 10)
                        if (Number.isFinite(n) && n >= 1) updateResistor(r.id, { value: Math.min(n, 10000) })
                      }}
                      onBlur={() => setResistorDrafts(prev => { const next = { ...prev }; delete next[r.id]; return next })}
                    />
                    <span className={s.resistorUnit}>Ω</span>
                  </div>
                  <select
                    className={s.resistorPowerSelect}
                    aria-label={`${r.label} 전력 정격`}
                    value={r.powerRating}
                    onChange={e => updateResistor(r.id, { powerRating: parseFloat(e.target.value) })}
                  >
                    {POWER_RATINGS.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}
                  </select>
                  <button className={s.removeBtn} onClick={() => removeResistor(r.id)} disabled={resistors.length <= 1} type="button" aria-label={`저항 ${r.label} 삭제`}>×</button>
                </div>
              ))}
            </div>
            <button className={s.addResistorBtn} onClick={addResistor} disabled={resistors.length >= 6} type="button">
              + 저항 추가 (현재 {resistors.length}/6)
            </button>
          </div>

          {/* 회로 SVG */}
          <div className={s.circuitWrap}>
            <CircuitDiagram voltage={voltage} type={type} perResistor={result.perResistor} ledDropV={result.ledDropV} />
          </div>

          {/* 결과 4분할 */}
          <div className={s.resultGrid}>
            <div className={`${s.resultCard} ${s.resVoltage}`}>
              <p className={s.resultLabel}>{result.ledDropV > 0 ? '저항망 전압' : '전체 전압'}</p>
              <p className={s.resultValue}>{result.resistorVoltage.toFixed(1)}<span className={s.resultUnit}>V</span></p>
              {result.ledDropV > 0 && (
                <p className={s.resultSub}>
                  {result.ledNotLit ? '⚠️ LED 미점등 — Vf ≥ 전원' : `전원 ${voltage.toFixed(1)}V − LED ${result.ledDropV.toFixed(1)}V`}
                </p>
              )}
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
              {result.ledDropV > 0 && !result.ledNotLit && (
                <p className={s.resultSub}>저항 {fmtW(result.totalPower - result.ledDropV * result.totalCurrent)} + LED {fmtW(result.ledDropV * result.totalCurrent)}</p>
              )}
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
                    <th scope="col">저항</th>
                    <th scope="col">값</th>
                    <th scope="col">전압</th>
                    <th scope="col">전류</th>
                    <th scope="col">전력</th>
                    <th scope="col">정격</th>
                  </tr>
                </thead>
                <tbody>
                  {result.perResistor.map(r => (
                    <tr key={r.id}>
                      <td>{r.label}</td>
                      <td>{fmtR(r.resistance)}</td>
                      <td className={s.colVoltage}>{fmtV(r.voltage)}</td>
                      <td className={s.colCurrent}>{fmtA(r.current)}</td>
                      <td className={`${s.colPower} ${r.powerExceeded ? s.powerWarn : r.powerMarginal ? s.powerCaution : ''}`}>{fmtW(r.power)}{r.powerExceeded ? ' ⚠️' : r.powerMarginal ? ' △' : ''}</td>
                      <td>{POWER_RATINGS.find(p => p.value === r.powerRating)?.label ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 정격 초과·마진 부족 경고 — 본문의 "2배 이상 정격 권장"과 같은 기준 */}
          {hasPowerWarning && (
            <div className={s.warnCard}>
              <strong>⚠️ 정격 초과:</strong> 일부 저항의 전력 소비가 정격을 초과합니다.
              실제 회로에서는 발열·손상으로 이어질 수 있어 더 큰 정격(예: 1/2W, 1W)의 저항으로 교체하거나 안전 마진(2배 이상)을 두세요.
            </div>
          )}
          {hasMarginWarning && (
            <div className={s.cautionCard}>
              <strong>△ 안전 마진 부족:</strong> 소비 전력이 정격의 절반을 넘습니다.
              정격 초과는 아니지만 권장 기준(계산 전력의 2배 이상 정격)에는 못 미쳐, 한 단계 큰 정격을 고려하세요.
            </div>
          )}

          {/* 검증 */}
          {verifyText && (
            <div className={s.verifyCard}>
              <p className={s.verifyTitle}>{verifyText.title}</p>
              <div className={s.verifyLine}>{verifyText.line}</div>
              <div className={s.verifyLine}>
                전력 합산: P = V × I = {voltage.toFixed(1)} × {fmtA(result.totalCurrent)} = <strong>{fmtW(result.totalPower)}</strong>
              </div>
            </div>
          )}

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </div>
      )}

      {/* ─── TAB 2: 옴의 법칙 빠른 계산 ─── */}
      {tab === 'ohm' && (
        <div role="tabpanel" id="cs-panel-ohm" aria-labelledby="cs-tab-ohm" className={s.tabPanel}>
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
              {(['V_R', 'V_I', 'I_R', 'V_P'] as const).map(k => (
                <button key={k} type="button" aria-pressed={ohmKnown === k}
                  className={`${s.knownBtn} ${ohmKnown === k ? s.knownActive : ''}`}
                  onClick={() => setOhmKnown(k)}>
                  {k.replace('_', ' + ')}
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <div className={s.gridFour}>
              <div>
                <label className={s.subLabel} htmlFor="cs-ohm-v">전압 V (V)</label>
                <input id="cs-ohm-v" className={s.bigInput} type="number" inputMode="decimal" step="0.1" value={ohmShown.V}
                  onChange={e => setOhmV(e.target.value)}
                  disabled={ohmKnown === 'I_R'}
                />
              </div>
              <div>
                <label className={s.subLabel} htmlFor="cs-ohm-i">전류 I (A)</label>
                <input id="cs-ohm-i" className={s.bigInput} type="number" inputMode="decimal" step="0.001" value={ohmShown.I}
                  onChange={e => setOhmI(e.target.value)}
                  disabled={ohmKnown !== 'V_I' && ohmKnown !== 'I_R'}
                />
              </div>
              <div>
                <label className={s.subLabel} htmlFor="cs-ohm-r">저항 R (Ω)</label>
                <input id="cs-ohm-r" className={s.bigInput} type="number" inputMode="decimal" step="1" value={ohmShown.R}
                  onChange={e => setOhmR(e.target.value)}
                  disabled={ohmKnown === 'V_I' || ohmKnown === 'V_P'}
                />
              </div>
              <div>
                <label className={s.subLabel} htmlFor="cs-ohm-p">전력 P (W)</label>
                <input id="cs-ohm-p" className={s.bigInput} type="number" inputMode="decimal" step="0.01" value={ohmShown.P}
                  onChange={e => setOhmP(e.target.value)}
                  disabled={ohmKnown !== 'V_P'}
                />
              </div>
            </div>
          </div>

          {/* 결과 — 단락·개방·모순 입력은 0이 아니라 '—'로 표시하고 이유를 적는다 */}
          <div className={s.resultGrid}>
            <div className={`${s.resultCard} ${s.resVoltage}`}>
              <p className={s.resultLabel}>전압 V</p>
              <p className={s.resultValue}>{ohmCalc.V === null ? '—' : fmtV(ohmCalc.V)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resCurrent}`}>
              <p className={s.resultLabel}>전류 I</p>
              <p className={s.resultValue}>{ohmCalc.I === null ? '—' : fmtA(ohmCalc.I)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resResistance}`}>
              <p className={s.resultLabel}>저항 R</p>
              <p className={s.resultValue}>{ohmCalc.R === null ? '—' : fmtR(ohmCalc.R)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resPower}`}>
              <p className={s.resultLabel}>전력 P</p>
              <p className={s.resultValue}>{ohmCalc.P === null ? '—' : fmtW(ohmCalc.P)}</p>
            </div>
          </div>
          {ohmCalc.warn && (
            <div className={s.cautionCard}>
              <strong>ℹ️ 안내:</strong> {ohmCalc.warn}
            </div>
          )}

          {/* 가이드 */}
          <div className={s.formulaCard}>
            <p className={s.formulaTitle}>직관 가이드</p>
            <div>전압이 2배 → 전류도 2배 (저항 일정)</div>
            <div>저항이 2배 → 전류는 절반 (전압 일정)</div>
            <div>전류 또는 전압 2배 → 전력 2배 (다른 변수 일정)</div>
            <div>전압 2배 → 전력 4배 (저항 일정, P = V²/R)</div>
          </div>

          {/* LED 저항 빠른 계산 — FAQ가 안내하는 "자동 계산" 실제 구현 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>LED 전류 제한 저항 빠른 계산</span>
              <span className={s.cardLabelHint}>R = (V_source − V_f) / I</span>
            </div>
            <div className={s.gridFour} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <label className={s.subLabel} htmlFor="cs-led-vs">전원 (V)</label>
                <input id="cs-led-vs" className={s.bigInput} type="number" inputMode="decimal" step="0.1" value={ledVs} onChange={e => setLedVs(e.target.value)} />
              </div>
              <div>
                <label className={s.subLabel} htmlFor="cs-led-vf">LED Vf (V)</label>
                <input id="cs-led-vf" className={s.bigInput} type="number" inputMode="decimal" step="0.1" value={ledVf} onChange={e => setLedVf(e.target.value)} />
              </div>
              <div>
                <label className={s.subLabel} htmlFor="cs-led-if">목표 전류 (mA)</label>
                <input id="cs-led-if" className={s.bigInput} type="number" inputMode="decimal" step="1" value={ledIf} onChange={e => setLedIf(e.target.value)} />
              </div>
            </div>
            <div className={s.voltQuickRow} style={{ marginTop: 8, gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {[
                { c: '🔴 빨강', vf: 2.0 }, { c: '🟡 노랑', vf: 2.1 }, { c: '🟢 녹색', vf: 2.2 },
                { c: '⚪ 흰색', vf: 3.2 }, { c: '🔵 파랑', vf: 3.4 },
              ].map(x => (
                <button key={x.c} type="button" className={`${s.voltQuickBtn} ${Math.abs(parseFloat(ledVf) - x.vf) < 0.001 ? s.voltQuickActive : ''}`}
                  aria-pressed={Math.abs(parseFloat(ledVf) - x.vf) < 0.001}
                  onClick={() => setLedVf(String(x.vf))}>
                  {x.c}<br /><small style={{ fontSize: 9 }}>{x.vf}V</small>
                </button>
              ))}
            </div>
            {ledCalc.ok ? (
              <div className={s.verifyCard} style={{ marginTop: 10 }}>
                <div className={s.verifyLine}>
                  R = ({parseFloat(ledVs)} − {parseFloat(ledVf)}) / {(parseFloat(ledIf) / 1000).toString()} = <strong>{fmtR(ledCalc.r)}</strong>
                </div>
                {ledCalc.std !== null && ledCalc.iStd !== null && ledCalc.pStd !== null && (
                  <div className={s.verifyLine}>
                    표준 저항(E12, 올림): <strong>{fmtR(ledCalc.std)}</strong> → 실제 전류 {fmtA(ledCalc.iStd)} · 저항 소비 {fmtW(ledCalc.pStd)}
                  </div>
                )}
                <p className={s.voltNote} style={{ marginTop: 6 }}>
                  ※ 계산값 이상으로 올림한 표준값이라 목표 전류를 넘지 않습니다. 여유를 더 두려면 한 단계 위 값을 쓰세요.
                  정확한 Vf·최대 전류는 LED 데이터시트를 확인하세요.
                </p>
              </div>
            ) : (
              <div className={s.cautionCard} style={{ marginTop: 10 }}>
                <strong>ℹ️ 안내:</strong> {ledCalc.reason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: 학습 모드 ─── */}
      {tab === 'learn' && (
        <div role="tabpanel" id="cs-panel-learn" aria-labelledby="cs-tab-learn" className={s.tabPanel}>
          <div className={s.formulaCard}>
            <p className={s.formulaTitle}>핵심 공식 모음</p>
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
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 12 }}>
              회로: <strong style={{ color: '#0F766E' }}>{type === 'series' ? '직렬' : '병렬'}</strong> ·
              {' '}저항 <strong style={{ color: '#A16207' }}>{resistors.length}개</strong> ·
              {' '}전원 <strong style={{ color: '#0F766E' }}>{fmtV(voltage)}</strong>
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
            <CircuitDiagram voltage={voltage} type={type} perResistor={result.perResistor} ledDropV={result.ledDropV} />
          </div>
        </div>
      )}

      {/* ─── TAB 4: 시험 빈출 패턴 ─── */}
      {tab === 'exam' && (
        <div role="tabpanel" id="cs-panel-exam" aria-labelledby="cs-tab-exam" className={s.tabPanel}>
          <div className={s.formulaCard}>
            <p className={s.formulaTitle}>중학 과학·고교 물리학 빈출 회로 7문제</p>
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
        </div>
      )}
    </div>
  )
}
