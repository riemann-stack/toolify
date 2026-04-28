'use client'

import { useMemo, useState } from 'react'
import styles from './ac-capacity.module.css'

/* ─────────────────────────────────────────────────────────
 * 상수
 * ───────────────────────────────────────────────────────── */
const PYUNG_TO_M2 = 3.3058
const W_PER_PYEONG = 580            // 1평형 = 약 580W
const BTU_PER_PYEONG = 1980         // 1평형 = 약 1,980 BTU/h
const STANDARD_PYEONG = [6, 9, 11, 13, 15, 18, 22, 25, 30, 36]

/* 공간 용도 */
const SPACE_TYPES = [
  { id: 'living',    icon: '🛋️', name: '거실',         hint: '×1.05', factor: 1.05, cls: 'spLiving' },
  { id: 'bedroom',   icon: '🛏️', name: '안방·침실',    hint: '×1.0',  factor: 1.0,  cls: 'spBedroom' },
  { id: 'smallRoom', icon: '🚪',  name: '작은방·서재',  hint: '×1.0',  factor: 1.0,  cls: 'spSmallRoom' },
  { id: 'kitchen',   icon: '🍳',  name: '주방·다이닝',  hint: '×1.2',  factor: 1.2,  cls: 'spKitchen' },
  { id: 'office',    icon: '💻',  name: '홈오피스',     hint: '×1.15', factor: 1.15, cls: 'spOffice' },
  { id: 'workplace', icon: '🏢',  name: '사무실',       hint: '×1.1',  factor: 1.1,  cls: 'spWorkplace' },
  { id: 'shop',      icon: '🛍️', name: '매장·상가',    hint: '×1.15', factor: 1.15, cls: 'spShop' },
  { id: 'studio',    icon: '🏠',  name: '원룸',         hint: '×1.05', factor: 1.05, cls: 'spStudio' },
] as const

/* 향 */
const DIRECTIONS = [
  { id: 'south',    icon: '☀️', name: '남향',     hint: '×1.15', factor: 1.15, cls: 'dirSouth' },
  { id: 'eastWest', icon: '🌅', name: '동·서향',  hint: '×1.10', factor: 1.10, cls: 'dirEastWest' },
  { id: 'north',    icon: '❄️', name: '북향',     hint: '×0.95', factor: 0.95, cls: 'dirNorth' },
  { id: 'unknown',  icon: '🌥️', name: '모름',     hint: '×1.0',  factor: 1.0,  cls: 'dirUnknown' },
] as const

/* 층수 */
const FLOORS = [
  { id: 'low',      icon: '🏠',  name: '저층',     hint: '×1.0',  factor: 1.0,  cls: 'flLow',      desc: '1~3층' },
  { id: 'mid',      icon: '🏢',  name: '중층',     hint: '×1.05', factor: 1.05, cls: 'flMid',      desc: '4~10층' },
  { id: 'high',     icon: '🏗️', name: '고층',     hint: '×1.10', factor: 1.10, cls: 'flHigh',     desc: '11층+' },
  { id: 'top',      icon: '🌇',  name: '최상층',   hint: '×1.20', factor: 1.20, cls: 'flTop',      desc: '옥상 직접' },
  { id: 'basement', icon: '🏚️', name: '반지하',   hint: '×0.90', factor: 0.90, cls: 'flBasement', desc: '지면 시원' },
] as const

/* 단열 */
const INSULATIONS = [
  { id: 'new',      icon: '🧱', name: '신축',         hint: '×0.95', factor: 0.95, cls: 'insNew',      desc: '5년 이내' },
  { id: 'normal',   icon: '🏠', name: '일반',         hint: '×1.0',  factor: 1.0,  cls: 'insNormal',   desc: '10년+' },
  { id: 'old',      icon: '🏚️', name: '노후',         hint: '×1.15', factor: 1.15, cls: 'insOld',      desc: '20년+' },
  { id: 'expanded', icon: '🪟', name: '베란다 확장',  hint: '×1.10', factor: 1.10, cls: 'insExpanded', desc: '확장 거실' },
  { id: 'glass',    icon: '🪟', name: '통유리',       hint: '×1.20', factor: 1.20, cls: 'insGlass',    desc: '전면 유리' },
] as const

const APPLIANCES = [
  { id: 'none',    name: '없음',         hint: '+0W',   load: 0 },
  { id: 'tvPc',    name: 'TV·PC',        hint: '+200W', load: 200 },
  { id: 'kitchen', name: '주방 가전',    hint: '+500W', load: 500 },
  { id: 'both',    name: '둘 다',        hint: '+700W', load: 700 },
] as const

/* 유틸 */
function n(v: string | number, min = 0): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < min) return min
  return x
}
function fmt(v: number, dec = 0): string {
  return (Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)).toLocaleString('ko-KR')
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
type TabId = 'calc' | 'convert' | 'guide'
type SizeMode = 'pyung' | 'meter'

export default function AcCapacityClient() {
  const [tab, setTab] = useState<TabId>('calc')

  /* 공간 정보 */
  const [sizeMode, setSizeMode] = useState<SizeMode>('pyung')
  const [pyung, setPyung] = useState(15)
  const [pyungCustom, setPyungCustom] = useState<number | null>(null)
  const [widthM, setWidthM]   = useState('5.0')
  const [lengthM, setLengthM] = useState('4.0')
  const [heightM, setHeightM] = useState(2.4)

  const [spaceId, setSpaceId] = useState('living')
  const [directionId, setDirectionId] = useState('south')
  const [floorId, setFloorId] = useState('mid')
  const [insulationId, setInsulationId] = useState('normal')
  const [occupants, setOccupants] = useState(4)
  const [applianceId, setApplianceId] = useState('tvPc')

  /* 탭 2 환산기 */
  const [convertMode, setConvertMode] = useState<'pyeong' | 'btu' | 'w' | 'kw'>('pyeong')
  const [pyeongInput, setPyeongInput] = useState(13)
  const [btuInput, setBtuInput] = useState(25740)
  const [wInput, setWInput] = useState(7540)
  const [kwInput, setKwInput] = useState(7.54)

  /* 복사 */
  const [copied, setCopied] = useState(false)

  /* 면적 계산 */
  const effectivePyung = pyungCustom ?? pyung
  const dims = useMemo(() => {
    if (sizeMode === 'pyung') {
      const m2 = effectivePyung * PYUNG_TO_M2
      const side = Math.sqrt(m2)
      return { width: side, length: side, area: m2 }
    }
    const w = n(widthM), l = n(lengthM)
    return { width: w, length: l, area: w * l }
  }, [sizeMode, effectivePyung, widthM, lengthM])

  const space = SPACE_TYPES.find(s => s.id === spaceId)!
  const direction = DIRECTIONS.find(d => d.id === directionId)!
  const floor = FLOORS.find(f => f.id === floorId)!
  const insulation = INSULATIONS.find(i => i.id === insulationId)!
  const appliance = APPLIANCES.find(a => a.id === applianceId)!

  /* ─── 핵심 계산 ─── */
  const calc = useMemo(() => {
    const baseLoadPerSqm = 140
    const baseLoad = dims.area * baseLoadPerSqm
    const ceilingFactor = 1 + Math.max(0, (heightM - 2.4)) * 0.25

    const adjustedLoad = baseLoad
      * space.factor
      * direction.factor
      * floor.factor
      * insulation.factor
      * ceilingFactor

    const occupantLoad = occupants * 100
    const applianceLoad = appliance.load
    const totalLoadW = adjustedLoad + occupantLoad + applianceLoad

    const exactPyeong = totalLoadW / W_PER_PYEONG
    const matched = STANDARD_PYEONG.find(p => p >= exactPyeong) ?? STANDARD_PYEONG[STANDARD_PYEONG.length - 1]
    const matchedIdx = STANDARD_PYEONG.indexOf(matched)
    const conservative = matchedIdx > 0 ? STANDARD_PYEONG[matchedIdx - 1] : matched
    const bigger = matchedIdx < STANDARD_PYEONG.length - 1 ? STANDARD_PYEONG[matchedIdx + 1] : matched

    return {
      baseLoad: Math.round(baseLoad),
      adjustedLoad: Math.round(adjustedLoad),
      occupantLoad,
      applianceLoad,
      totalLoadW: Math.round(totalLoadW),
      ceilingFactor,
      exactPyeong,
      matched,
      conservative,
      bigger,
      btuPerHour: Math.round(matched * BTU_PER_PYEONG),
      kw: matched * 0.58,
    }
  }, [dims.area, heightM, space, direction, floor, insulation, occupants, appliance])

  /* 단계별 부하 누적 (분석 표용) */
  const breakdown = useMemo(() => {
    const a0 = calc.baseLoad
    const a1 = a0 * calc.ceilingFactor
    const a2 = a1 * space.factor
    const a3 = a2 * direction.factor
    const a4 = a3 * floor.factor
    const a5 = a4 * insulation.factor
    return {
      base: a0,
      afterCeiling: Math.round(a1),
      afterSpace: Math.round(a2),
      afterDirection: Math.round(a3),
      afterFloor: Math.round(a4),
      afterInsulation: Math.round(a5),
    }
  }, [calc.baseLoad, calc.ceilingFactor, space.factor, direction.factor, floor.factor, insulation.factor])

  /* 환산기 계산 (탭 2) */
  const convertResult = useMemo(() => {
    let basePyeong = 0
    if (convertMode === 'pyeong') basePyeong = pyeongInput
    else if (convertMode === 'btu') basePyeong = btuInput / BTU_PER_PYEONG
    else if (convertMode === 'w') basePyeong = wInput / W_PER_PYEONG
    else basePyeong = (kwInput * 1000) / W_PER_PYEONG

    return {
      pyeong: basePyeong,
      btu: basePyeong * BTU_PER_PYEONG,
      w: basePyeong * W_PER_PYEONG,
      kw: (basePyeong * W_PER_PYEONG) / 1000,
    }
  }, [convertMode, pyeongInput, btuInput, wInput, kwInput])

  /* 전기료 비교 (탭 1 결과 기준, 1일 8시간 30일 사용) */
  const electricCost = useMemo(() => {
    const dailyHours = 8
    const days = 30
    // 인버터: 평균 60% 출력 / 정속형: 평균 100% on-off cycling
    const wattInverter = calc.matched * W_PER_PYEONG * 0.4
    const wattFixed    = calc.matched * W_PER_PYEONG * 0.6
    const kwhInverter = (wattInverter * dailyHours * days) / 1000
    const kwhFixed    = (wattFixed * dailyHours * days) / 1000
    // 누진 1단계 단순 가정 130원/kWh
    const KRW_PER_KWH = 130
    return {
      inverterCost: kwhInverter * KRW_PER_KWH,
      fixedCost: kwhFixed * KRW_PER_KWH,
      max: Math.max(kwhInverter, kwhFixed) * KRW_PER_KWH,
    }
  }, [calc.matched])

  /* 결과 복사 */
  function handleCopy() {
    const lines: string[] = []
    if (tab === 'calc') {
      lines.push(
        '❄️ 에어컨 평형 계산 결과',
        `공간: ${space.name} ${fmt(dims.area)}㎡ (${fmt(dims.area / PYUNG_TO_M2, 1)}평) × ${heightM}m`,
        `조건: ${direction.name} · ${floor.name} · ${insulation.name} · ${occupants}명 · ${appliance.name}`,
        `총 냉방 부하: ${fmt(calc.totalLoadW)}W (${fmt(calc.exactPyeong, 1)}평형 필요)`,
        `추천 평형: ${calc.matched}평형 (${fmt(calc.btuPerHour)} BTU/h, ${calc.kw.toFixed(2)}kW)`,
      )
    } else {
      lines.push(
        '❄️ 에어컨 환산',
        `${fmt(convertResult.pyeong, 1)}평형 = ${fmt(convertResult.btu)} BTU/h = ${fmt(convertResult.w)}W = ${convertResult.kw.toFixed(2)}kW`,
      )
    }
    lines.push('youtil.kr/tools/interior/ac-capacity')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  const pyungOptions = [5, 7, 10, 12, 15, 18, 20, 22, 25, 28, 30, 33, 35, 40]

  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 계산기는 한국 표준(㎡당 130~150W 냉방 부하) 기준 참고용</strong>입니다.
        실제 필요 평형은 단열 상태·외부 기온·가전 발열·사용 패턴에 따라 달라질 수 있으며 정확한 선택은 에어컨 매장이나 시공 전문가와 상담하세요.
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'calc' ? styles.tabActive : ''}`}    onClick={() => setTab('calc')}>평형 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'convert' ? styles.tabActive : ''}`} onClick={() => setTab('convert')}>BTU·W 환산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'guide' ? styles.tabActive : ''}`}   onClick={() => setTab('guide')}>공간별 가이드</button>
      </div>

      {/* ────────────── 탭 1: 평형 계산 ────────────── */}
      {tab === 'calc' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>공간 정보</span></div>
            <div className={styles.modeToggle}>
              <button type="button" className={`${styles.modeBtn} ${styles.modePyung} ${sizeMode === 'pyung' ? styles.modeActive : ''}`} onClick={() => setSizeMode('pyung')}>📐 평수로 입력</button>
              <button type="button" className={`${styles.modeBtn} ${styles.modeMeter} ${sizeMode === 'meter' ? styles.modeActive : ''}`} onClick={() => setSizeMode('meter')}>📏 가로×세로(m)</button>
            </div>

            {sizeMode === 'pyung' ? (
              <>
                <select className={styles.pyungSelect} value={pyungCustom !== null ? 'custom' : pyung} onChange={e => {
                  if (e.target.value === 'custom') { setPyungCustom(15) }
                  else { setPyungCustom(null); setPyung(Number(e.target.value)) }
                }}>
                  {pyungOptions.map(p => <option key={p} value={p}>{p}평</option>)}
                  <option value="custom">직접 입력…</option>
                </select>
                {pyungCustom !== null && (
                  <div style={{ marginTop: 8 }}>
                    <input className={styles.smallInput} type="number" min={1} max={300}
                      value={pyungCustom}
                      onChange={e => setPyungCustom(Math.max(1, Math.min(300, Number(e.target.value) || 1)))} />
                  </div>
                )}
                <p className={styles.areaShow}>약 {fmt(dims.area)}㎡ (정사각형 가정)</p>
              </>
            ) : (
              <>
                <div className={styles.dimRow}>
                  <input className={styles.bigInput} type="number" min={0.1} step={0.1} value={widthM} onChange={e => setWidthM(e.target.value)} />
                  <span className={styles.dimSep}>×</span>
                  <input className={styles.bigInput} type="number" min={0.1} step={0.1} value={lengthM} onChange={e => setLengthM(e.target.value)} />
                </div>
                <p className={styles.areaShow}>약 {fmt(dims.area)}㎡ (≈ {fmt(dims.area / PYUNG_TO_M2, 1)}평)</p>
              </>
            )}

            <div style={{ height: 14 }} />
            <span className={styles.subLabel}>천장 높이</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={0.1} min={1.5} max={5} value={heightM} onChange={e => setHeightM(Math.max(1.5, Math.min(5, Number(e.target.value) || 2.4)))} />
              <span className={styles.unit}>m</span>
            </div>
            <div className={styles.pills}>
              {[2.3, 2.4, 2.5, 2.7, 3.0].map(h => (
                <button key={h} type="button" className={`${styles.pill} ${heightM === h ? styles.pillActive : ''}`} onClick={() => setHeightM(h)}>{h}m</button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>공간 용도</span>
              <span className={styles.cardLabelHint}>발열량 보정</span>
            </div>
            <div className={styles.spaceGrid}>
              {SPACE_TYPES.map(s => (
                <button key={s.id} type="button" className={`${styles.spaceBtn} ${styles[s.cls]} ${spaceId === s.id ? styles.spActive : ''}`} onClick={() => setSpaceId(s.id)}>
                  <span className="icon">{s.icon}</span>
                  {s.name}
                  <small>{s.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>향</span>
              <span className={styles.cardLabelHint}>햇빛 영향</span>
            </div>
            <div className={styles.directionGrid}>
              {DIRECTIONS.map(d => (
                <button key={d.id} type="button" className={`${styles.dirBtn} ${styles[d.cls]} ${directionId === d.id ? styles.dirActive : ''}`} onClick={() => setDirectionId(d.id)}>
                  <span style={{ fontSize: 18 }}>{d.icon}</span>
                  {d.name}
                  <small>{d.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>층수</span>
              <span className={styles.cardLabelHint}>높을수록 더움</span>
            </div>
            <div className={styles.floorGrid}>
              {FLOORS.map(f => (
                <button key={f.id} type="button" className={`${styles.floorBtn} ${styles[f.cls]} ${floorId === f.id ? styles.flActive : ''}`} onClick={() => setFloorId(f.id)}>
                  <span style={{ fontSize: 16 }}>{f.icon}</span>
                  {f.name}
                  <small>{f.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>단열 상태</span>
              <span className={styles.cardLabelHint}>외기 차단 정도</span>
            </div>
            <div className={styles.insulationGrid}>
              {INSULATIONS.map(i => (
                <button key={i.id} type="button" className={`${styles.insBtn} ${styles[i.cls]} ${insulationId === i.id ? styles.insActive : ''}`} onClick={() => setInsulationId(i.id)}>
                  <span style={{ fontSize: 16 }}>{i.icon}</span>
                  {i.name}
                  <small>{i.hint}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>인원 · 발열 가전</span>
              <span className={styles.cardLabelHint}>1명당 +100W</span>
            </div>
            <span className={styles.subLabel}>거주 인원</span>
            <div className={styles.occupantRow}>
              <input className={styles.slider} type="range" min={1} max={6} step={1} value={occupants} onChange={e => setOccupants(Number(e.target.value))} />
              <span className={styles.sliderValue}>{occupants}명</span>
            </div>

            <div style={{ height: 12 }} />
            <span className={styles.subLabel}>발열 가전</span>
            <div className={styles.applianceGrid}>
              {APPLIANCES.map(a => (
                <button key={a.id} type="button" className={`${styles.applianceBtn} ${applianceId === a.id ? styles.applianceActive : ''}`} onClick={() => setApplianceId(a.id)}>
                  {a.name}
                  <small>{a.hint}</small>
                </button>
              ))}
            </div>
          </div>

          {/* HERO */}
          <div className={styles.hero}>
            <p className={styles.heroLead}>추천 에어컨 평형</p>
            <p className={styles.heroNum}>{calc.matched}<span className={styles.heroUnit}>평형</span></p>
            <p className={styles.heroSub}>
              약 <strong className={styles.heroSubAccent}>{fmt(calc.totalLoadW)}W</strong> 냉방 부하 ({fmt(calc.btuPerHour)} BTU/h, {calc.kw.toFixed(2)}kW)
            </p>
          </div>

          {/* 3옵션 비교 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>📦 3가지 평형 옵션 비교</span>
              <span className={styles.cardLabelHint}>크기별 장단점</span>
            </div>
            <div className={styles.optionGrid}>
              <div className={`${styles.optionCard} ${styles.optConservative}`}>
                <p className={styles.optionLabel}>🔻 보수적</p>
                <p className={styles.optionPyeong}>{calc.conservative}<span className={styles.optionPyeongUnit}>평형</span></p>
                <p className={styles.optionDesc}>한 단계 작게. 매우 더운 날 부족할 수 있음. 풀가동으로 전기료 ↑</p>
                <span className={`${styles.optionBadge} ${styles.badgeAlt}`}>비추천</span>
              </div>
              <div className={`${styles.optionCard} ${styles.optRecommended}`}>
                <p className={styles.optionLabel}>✅ 권장</p>
                <p className={styles.optionPyeong}>{calc.matched}<span className={styles.optionPyeongUnit}>평형</span></p>
                <p className={styles.optionDesc}>적정 평형. 효율적 운전. 전기료 균형. 가장 추천하는 선택.</p>
                <span className={`${styles.optionBadge} ${styles.badgeRec}`}>가장 추천</span>
              </div>
              <div className={`${styles.optionCard} ${styles.optBigger}`}>
                <p className={styles.optionLabel}>🔺 여유</p>
                <p className={styles.optionPyeong}>{calc.bigger}<span className={styles.optionPyeongUnit}>평형</span></p>
                <p className={styles.optionDesc}>한 단계 크게. 가격 +10~15%. 너무 크면 자주 꺼져 습도 조절 ❌</p>
                <span className={`${styles.optionBadge} ${styles.badgeAlt}`}>여유 시</span>
              </div>
            </div>
          </div>

          {/* 부하 분석 표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>냉방 부하 분석</span></div>
            <table className={styles.loadTable}>
              <tbody>
                <tr><td>면적 ({fmt(dims.area)}㎡ × 140W/㎡)</td><td>{fmt(calc.baseLoad)}W</td></tr>
                {calc.ceilingFactor !== 1 && (
                  <tr className={calc.ceilingFactor > 1 ? styles.factorUp : styles.factorDown}>
                    <td>천장 높이 보정 ({heightM}m, ×{calc.ceilingFactor.toFixed(2)})</td>
                    <td>{fmt(breakdown.afterCeiling)}W</td>
                  </tr>
                )}
                <tr className={space.factor > 1 ? styles.factorUp : space.factor < 1 ? styles.factorDown : ''}>
                  <td>{space.icon} {space.name} (×{space.factor})</td>
                  <td>{fmt(breakdown.afterSpace)}W</td>
                </tr>
                <tr className={direction.factor > 1 ? styles.factorUp : direction.factor < 1 ? styles.factorDown : ''}>
                  <td>{direction.icon} {direction.name} (×{direction.factor})</td>
                  <td>{fmt(breakdown.afterDirection)}W</td>
                </tr>
                <tr className={floor.factor > 1 ? styles.factorUp : floor.factor < 1 ? styles.factorDown : ''}>
                  <td>{floor.icon} {floor.name} (×{floor.factor})</td>
                  <td>{fmt(breakdown.afterFloor)}W</td>
                </tr>
                <tr className={insulation.factor > 1 ? styles.factorUp : insulation.factor < 1 ? styles.factorDown : ''}>
                  <td>{insulation.icon} {insulation.name} (×{insulation.factor})</td>
                  <td>{fmt(breakdown.afterInsulation)}W</td>
                </tr>
                {calc.occupantLoad > 0 && (
                  <tr className={styles.addRow}>
                    <td>👥 인원 {occupants}명 (1명 +100W)</td>
                    <td>+{fmt(calc.occupantLoad)}W</td>
                  </tr>
                )}
                {calc.applianceLoad > 0 && (
                  <tr className={styles.addRow}>
                    <td>🔌 발열 가전 ({appliance.name})</td>
                    <td>+{fmt(calc.applianceLoad)}W</td>
                  </tr>
                )}
                <tr className={styles.totalRow}><td>총 냉방 부하</td><td>{fmt(calc.totalLoadW)}W</td></tr>
                <tr className={styles.totalRow}><td>평형 환산 ({fmt(calc.totalLoadW)} ÷ 580)</td><td>약 {calc.exactPyeong.toFixed(1)}평형</td></tr>
                <tr className={styles.totalRow}><td>한국 시판 매칭</td><td>{calc.matched}평형 ✅</td></tr>
              </tbody>
            </table>
          </div>

          {/* BTU·kW 환산 */}
          <div className={styles.btuCard}>
            <div className={styles.cardLabel} style={{ color: 'var(--accent)', marginBottom: 0 }}>
              <span>🌡️ {calc.matched}평형 환산</span>
            </div>
            <div className={styles.btuGrid}>
              <div className={styles.btuCell}>
                <p className={styles.btuLabel}>평형</p>
                <p className={styles.btuValue}>{calc.matched}<span className={styles.btuUnit}>평형</span></p>
              </div>
              <div className={styles.btuCell}>
                <p className={styles.btuLabel}>BTU/h</p>
                <p className={styles.btuValue}>{fmt(calc.btuPerHour)}<span className={styles.btuUnit}>BTU/h</span></p>
              </div>
              <div className={styles.btuCell}>
                <p className={styles.btuLabel}>kW</p>
                <p className={styles.btuValue}>{calc.kw.toFixed(2)}<span className={styles.btuUnit}>kW</span></p>
              </div>
            </div>
          </div>

          {/* 한국 시판 안내 */}
          <div className={styles.infoCard}>
            ℹ️ <strong>{calc.matched}평형</strong> 에어컨은 한국 주요 브랜드(삼성·LG·캐리어·위니아)에서 일반적으로 판매됩니다. <strong style={{ color: 'var(--accent)' }}>인버터 모델 권장</strong> (전기료 약 30~40% 절감, 한 시즌만에 가격 차이 회수 가능).
          </div>

          {/* 전기료 비교 */}
          <div className={styles.savingCard}>
            <div className={styles.cardLabel} style={{ marginBottom: 0, color: '#E89757' }}>
              <span>💰 월 전기료 예상 (1일 8시간 × 30일)</span>
              <span className={styles.cardLabelHint}>{calc.matched}평형 기준</span>
            </div>
            <p className={styles.savingLead}>인버터 vs 정속형 전기료 차이</p>
            <div className={styles.savingBars}>
              <div className={styles.savingBar}>
                <span className={styles.savingBarName}>인버터</span>
                <div className={styles.savingBarTrack}>
                  <div className={`${styles.savingBarFill} ${styles.savingBarFillInverter}`} style={{ width: `${(electricCost.inverterCost / electricCost.max) * 100}%` }} />
                </div>
                <span className={styles.savingBarVal}>약 {fmt(electricCost.inverterCost)}원</span>
              </div>
              <div className={styles.savingBar}>
                <span className={styles.savingBarName}>정속형</span>
                <div className={styles.savingBarTrack}>
                  <div className={`${styles.savingBarFill} ${styles.savingBarFillFixed}`} style={{ width: `${(electricCost.fixedCost / electricCost.max) * 100}%` }} />
                </div>
                <span className={styles.savingBarVal}>약 {fmt(electricCost.fixedCost)}원</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7, textAlign: 'center' }}>
              ※ 한국 누진세 1단계(130원/kWh) 단순 가정. 다른 가전 사용량·누진 단계에 따라 차이 있음.
            </p>
          </div>
        </>
      )}

      {/* ────────────── 탭 2: 환산기 ────────────── */}
      {tab === 'convert' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>입력 단위 선택</span>
              <span className={styles.cardLabelHint}>하나만 입력 → 자동 환산</span>
            </div>
            <div className={styles.convertModeRow}>
              <button type="button" className={`${styles.convertModeBtn} ${convertMode === 'pyeong' ? styles.convertModeActive : ''}`} onClick={() => setConvertMode('pyeong')}>평형</button>
              <button type="button" className={`${styles.convertModeBtn} ${convertMode === 'btu' ? styles.convertModeActive : ''}`}    onClick={() => setConvertMode('btu')}>BTU/h</button>
              <button type="button" className={`${styles.convertModeBtn} ${convertMode === 'w' ? styles.convertModeActive : ''}`}      onClick={() => setConvertMode('w')}>W</button>
              <button type="button" className={`${styles.convertModeBtn} ${convertMode === 'kw' ? styles.convertModeActive : ''}`}     onClick={() => setConvertMode('kw')}>kW</button>
            </div>

            {convertMode === 'pyeong' && (
              <>
                <span className={styles.subLabel}>평형 입력</span>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" min={1} step={1} value={pyeongInput} onChange={e => setPyeongInput(n(e.target.value, 1))} />
                  <span className={styles.unit}>평형</span>
                </div>
              </>
            )}
            {convertMode === 'btu' && (
              <>
                <span className={styles.subLabel}>BTU/h 입력</span>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" min={1000} step={500} value={btuInput} onChange={e => setBtuInput(n(e.target.value, 1000))} />
                  <span className={styles.unit}>BTU/h</span>
                </div>
              </>
            )}
            {convertMode === 'w' && (
              <>
                <span className={styles.subLabel}>W 입력</span>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" min={100} step={100} value={wInput} onChange={e => setWInput(n(e.target.value, 100))} />
                  <span className={styles.unit}>W</span>
                </div>
              </>
            )}
            {convertMode === 'kw' && (
              <>
                <span className={styles.subLabel}>kW 입력</span>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" min={0.1} step={0.1} value={kwInput} onChange={e => setKwInput(n(e.target.value, 0.1))} />
                  <span className={styles.unit}>kW</span>
                </div>
              </>
            )}
          </div>

          {/* 결과 4개 */}
          <div className={styles.convertResultGrid}>
            <div className={`${styles.convertResultCell} ${convertMode === 'pyeong' ? styles.highlight : ''}`}>
              <p className={styles.convertResultLabel}>평형</p>
              <p className={styles.convertResultValue}>{fmt(convertResult.pyeong, 1)}<span className={styles.convertResultUnit}>평형</span></p>
            </div>
            <div className={`${styles.convertResultCell} ${convertMode === 'btu' ? styles.highlight : ''}`}>
              <p className={styles.convertResultLabel}>BTU/h</p>
              <p className={styles.convertResultValue}>{fmt(convertResult.btu)}<span className={styles.convertResultUnit}>BTU/h</span></p>
            </div>
            <div className={`${styles.convertResultCell} ${convertMode === 'w' ? styles.highlight : ''}`}>
              <p className={styles.convertResultLabel}>W</p>
              <p className={styles.convertResultValue}>{fmt(convertResult.w)}<span className={styles.convertResultUnit}>W</span></p>
            </div>
            <div className={`${styles.convertResultCell} ${convertMode === 'kw' ? styles.highlight : ''}`}>
              <p className={styles.convertResultLabel}>kW</p>
              <p className={styles.convertResultValue}>{convertResult.kw.toFixed(2)}<span className={styles.convertResultUnit}>kW</span></p>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>한국 시판 평형 표준</span>
              <span className={styles.cardLabelHint}>1평형 ≈ 580W ≈ 1,980 BTU/h</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.refTable}>
                <thead>
                  <tr><th>평형</th><th>BTU/h</th><th>kW</th><th>사용 공간</th></tr>
                </thead>
                <tbody>
                  {[
                    { p: 6,  rooms: '작은방 (3~4평)' },
                    { p: 9,  rooms: '일반 침실 (5~7평)' },
                    { p: 11, rooms: '중간 방·작은 거실' },
                    { p: 13, rooms: '일반 거실' },
                    { p: 15, rooms: '큰 거실' },
                    { p: 18, rooms: '큰 거실·매장' },
                    { p: 22, rooms: '대형 거실·매장' },
                    { p: 25, rooms: '매장·사무실' },
                    { p: 30, rooms: '큰 매장·창고' },
                    { p: 36, rooms: '대형 사업장' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r.p}평형</td>
                      <td>{fmt(r.p * BTU_PER_PYEONG)}</td>
                      <td>{(r.p * 0.58).toFixed(1)}</td>
                      <td>{r.rooms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.infoCard}>
            🌐 <strong>해외 직구 시 BTU 변환</strong> — 미국·동남아 에어컨은 BTU/h로 표기됩니다.<br />
            • 12,000 BTU/h ≈ 6평형<br />
            • 18,000 BTU/h ≈ 9평형<br />
            • 24,000 BTU/h ≈ 12평형<br />
            • 36,000 BTU/h ≈ 18평형<br />
            ※ <strong>1 BTU/h ≈ 0.293W</strong>, <strong>1 kW ≈ 1.72평형</strong>
          </div>
        </>
      )}

      {/* ────────────── 탭 3: 가이드 ────────────── */}
      {tab === 'guide' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>📋 거실 추천 평형</span>
              <span className={styles.cardLabelHint}>천장 2.4m, 4인 가구 기준</span>
            </div>
            <table className={styles.guideTable}>
              <thead><tr><th>거실 평수</th><th>추천 평형</th></tr></thead>
              <tbody>
                <tr><td>5평</td><td>9~11평형</td></tr>
                <tr><td>7평</td><td>11~13평형</td></tr>
                <tr><td>10평</td><td>13~15평형</td></tr>
                <tr><td>15평</td><td>18~22평형</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>🛏️ 침실 추천 평형</span></div>
            <table className={styles.guideTable}>
              <thead><tr><th>침실 평수</th><th>추천 평형</th></tr></thead>
              <tbody>
                <tr><td>3평 작은방</td><td>6평형</td></tr>
                <tr><td>5평 일반 침실</td><td>6~9평형</td></tr>
                <tr><td>7평 큰 침실</td><td>9~11평형</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>🍳 주방·다이닝 (조리 발열 고려)</span></div>
            <table className={styles.guideTable}>
              <thead><tr><th>주방 평수</th><th>추천 평형</th></tr></thead>
              <tbody>
                <tr><td>5평 주방</td><td>11~13평형</td></tr>
                <tr><td>7평 주방</td><td>13~15평형</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>🏠 원룸 (전체 공간)</span></div>
            <table className={styles.guideTable}>
              <thead><tr><th>원룸 평수</th><th>추천 평형</th></tr></thead>
              <tbody>
                <tr><td>5~7평 원룸</td><td>6~9평형</td></tr>
                <tr><td>8~12평 원룸</td><td>9~13평형</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.infoCard}>
            ☀️ <strong>남향·통유리·고층</strong> 시 일반 추천보다 <strong style={{ color: '#FF8C3E' }}>+1단계 큰 평형</strong> 권장.
            예: 일반 15평형 → 남향·고층 18평형
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>⚡ 인버터 vs 정속형</span></div>
            <div className={styles.invComparGrid}>
              <div className={`${styles.invCard} ${styles.invInverter}`}>
                <p className={styles.invTitle}>✅ 인버터 에어컨</p>
                <div className={styles.invBody}>
                  <ul>
                    <li>설정 온도 도달 후 <strong>약하게 운전</strong></li>
                    <li><strong>전기료 30~40% 절감</strong></li>
                    <li>초기 가격 5~10만원 비쌈</li>
                    <li>거실·장시간 사용 추천</li>
                  </ul>
                </div>
              </div>
              <div className={`${styles.invCard} ${styles.invFixed}`}>
                <p className={styles.invTitle}>정속형 에어컨</p>
                <div className={styles.invBody}>
                  <ul>
                    <li>설정 온도 도달 시 <strong>꺼졌다 켜졌다</strong></li>
                    <li>가격 저렴</li>
                    <li>전기료 더 나옴</li>
                    <li>잠깐 사용·임시 거주 추천</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>🔧 설치 시 주의사항</span></div>
            <div className={styles.infoCard} style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 2 }}>
                <li><strong>실외기 위치</strong> — 통풍 잘 되는 곳, 그늘</li>
                <li><strong>실내기 높이</strong> — 천장 가까이 (찬 공기 하강)</li>
                <li><strong>직사광선 피하기</strong> — 효율 ↓</li>
                <li><strong>정기 청소</strong> — 필터 2주마다, 내부 1년 1회</li>
              </ul>
            </div>
          </div>
        </>
      )}

      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}
