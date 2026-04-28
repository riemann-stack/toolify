'use client'

import { useMemo, useState } from 'react'
import styles from './lighting.module.css'

/* ─────────────────────────────────────────────────────────
 * 공간 종류 12개
 * ───────────────────────────────────────────────────────── */
interface SpaceType {
  id: string
  name: string
  lux: number
  range: string
  icon: string
  cls: string
  /* 색온도 추천 */
  colorTemp: { min: number; max: number; label: string; vibe: string }
}
const SPACE_TYPES: SpaceType[] = [
  { id: 'livingRoom', name: '거실',         lux: 300, range: '200~400 lux', icon: '🛋️', cls: 'spLiving',   colorTemp: { min: 3000, max: 4000, label: '주백색',        vibe: '아늑한 따뜻함' } },
  { id: 'bedroom',    name: '침실',         lux: 150, range: '100~200 lux', icon: '🛏️', cls: 'spBedroom',  colorTemp: { min: 2700, max: 3000, label: '전구색',        vibe: '편안한 황색' } },
  { id: 'studyRoom',  name: '서재',         lux: 500, range: '400~600 lux', icon: '📚',  cls: 'spStudy',    colorTemp: { min: 5000, max: 6500, label: '주광색',        vibe: '집중력 있는 백색' } },
  { id: 'kidsRoom',   name: '아이 공부방',  lux: 600, range: '500~700 lux', icon: '✏️',  cls: 'spKids',     colorTemp: { min: 5000, max: 6500, label: '주광색',        vibe: '시력 보호 백색' } },
  { id: 'kitchen',    name: '주방',         lux: 500, range: '400~600 lux', icon: '🍳',  cls: 'spKitchen',  colorTemp: { min: 4000, max: 5000, label: '주백색~주광색', vibe: '음식 색감 보기 좋음' } },
  { id: 'diningRoom', name: '다이닝',       lux: 250, range: '150~300 lux', icon: '🍽️', cls: 'spDining',   colorTemp: { min: 2700, max: 3000, label: '전구색',        vibe: '음식이 맛있어 보임' } },
  { id: 'bathroom',   name: '욕실',         lux: 300, range: '200~400 lux', icon: '🛁',  cls: 'spBath',     colorTemp: { min: 4000, max: 5000, label: '주백색~주광색', vibe: '깔끔하고 시원' } },
  { id: 'hallway',    name: '복도·현관',    lux: 100, range: '75~150 lux',  icon: '🚪',  cls: 'spHallway',  colorTemp: { min: 3000, max: 4000, label: '주백색',        vibe: '안전·시인성' } },
  { id: 'office',     name: '홈오피스',     lux: 500, range: '400~750 lux', icon: '💻',  cls: 'spOffice',   colorTemp: { min: 5000, max: 6500, label: '주광색',        vibe: '눈 피로 적은 백색' } },
  { id: 'workshop',   name: '작업실',       lux: 750, range: '500~1000 lux',icon: '🔧',  cls: 'spWorkshop', colorTemp: { min: 5000, max: 6500, label: '주광색',        vibe: '정밀 작업' } },
  { id: 'walkInCloset', name: '드레스룸',   lux: 400, range: '300~500 lux', icon: '👔',  cls: 'spCloset',   colorTemp: { min: 4000, max: 5000, label: '주백색',        vibe: '색감 정확' } },
  { id: 'baby',       name: '아기방',       lux: 100, range: '50~150 lux',  icon: '👶',  cls: 'spBaby',     colorTemp: { min: 2700, max: 3000, label: '전구색',        vibe: '편안한 수면' } },
]

/* LED 프리셋 */
const LED_PRESETS = [
  { w: 6,  lm: 600,  name: '소형 LED 6W',     room: '복도·작은방' },
  { w: 9,  lm: 900,  name: 'LED 전구 9W',     room: '욕실·작은방' },
  { w: 12, lm: 1200, name: 'LED 전구 12W',    room: '침실·서재' },
  { w: 15, lm: 1500, name: 'LED 전구 15W',    room: '침실·중간방' },
  { w: 20, lm: 2000, name: 'LED 천장등 20W',  room: '큰방·거실' },
  { w: 30, lm: 3000, name: 'LED 천장등 30W',  room: '거실' },
  { w: 50, lm: 5000, name: 'LED 거실등 50W',  room: '큰 거실' },
  { w: 75, lm: 7500, name: 'LED 거실등 75W',  room: '대형 거실' },
]

/* 조명 효율 (lm/W) */
const BULB_EFFICIENCY = [
  { id: 'incandescent', name: '백열전구',         lmPerW: 12,  lifespan: '1,000시간',  cls: 'bulbInc',     rowCls: 'rowInc' },
  { id: 'halogen',      name: '할로겐',           lmPerW: 18,  lifespan: '2,000시간',  cls: 'bulbHalogen', rowCls: 'rowHalogen' },
  { id: 'fluorescent',  name: '형광등',           lmPerW: 65,  lifespan: '10,000시간', cls: 'bulbFluo',    rowCls: 'rowFluo' },
  { id: 'cfl',          name: '컴팩트 형광등',    lmPerW: 60,  lifespan: '8,000시간',  cls: 'bulbCfl',     rowCls: 'rowCfl' },
  { id: 'led',          name: 'LED',              lmPerW: 100, lifespan: '25,000시간', cls: 'bulbLed',     rowCls: 'rowLed' },
  { id: 'ledHigh',      name: 'LED 고효율',       lmPerW: 130, lifespan: '40,000시간', cls: 'bulbLedHigh', rowCls: 'rowLedHigh' },
]

const PYUNG_TO_M2 = 3.3058
const KRW_PER_KWH = 130   // 한국 평균 가정용 전기료 1kWh당 (단순화)

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

export default function LightingClient() {
  const [tab, setTab] = useState<TabId>('calc')

  /* 공간 정보 */
  const [sizeMode, setSizeMode] = useState<SizeMode>('pyung')
  const [pyung, setPyung] = useState(15)
  const [pyungCustom, setPyungCustom] = useState<number | null>(null)
  const [widthM, setWidthM]   = useState('5.0')
  const [lengthM, setLengthM] = useState('4.0')
  const [heightM, setHeightM] = useState(2.4)

  const [spaceId, setSpaceId] = useState('livingRoom')
  const [intensity, setIntensity] = useState<'dim' | 'standard' | 'bright'>('standard')
  const [lightingType, setLightingType] = useState<'direct' | 'indirect' | 'mixed'>('direct')

  /* 조명당 루멘 입력 */
  const [lumenPerLight, setLumenPerLight] = useState(1500)
  const [ledPresetId, setLedPresetId] = useState<number | null>(15)  // W로 식별

  /* 탭 2: 환산 */
  const [convertMode, setConvertMode] = useState<'w-to-lm' | 'lm-to-w'>('w-to-lm')
  const [inputW, setInputW] = useState(60)
  const [inputLm, setInputLm] = useState(800)
  const [referenceBulb, setReferenceBulb] = useState('incandescent')

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* ─── 공간 면적 ─── */
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

  /* ─── 핵심 계산 ─── */
  const calc = useMemo(() => {
    const area = dims.area
    let actualLux = space.lux
    if (intensity === 'dim')    actualLux *= 0.7
    if (intensity === 'bright') actualLux *= 1.3

    const ceilingFactor = 1 + Math.max(0, (heightM - 2.4)) * 0.25
    let typeFactor = 1.0
    if (lightingType === 'indirect') typeFactor = 1.5
    if (lightingType === 'mixed')    typeFactor = 1.2

    const totalLumens = area * actualLux * ceilingFactor * typeFactor
    const lpl = Math.max(1, lumenPerLight)
    const lightCount = Math.max(1, Math.ceil(totalLumens / lpl))
    const installedLumens = lightCount * lpl
    const installedLux = area > 0 ? installedLumens / (area * ceilingFactor * typeFactor) : 0

    return {
      area,
      targetLux: actualLux,
      ceilingFactor,
      typeFactor,
      totalLumens,
      lightCount,
      installedLumens,
      installedLux,
    }
  }, [dims.area, space, intensity, heightM, lightingType, lumenPerLight])

  /* 추천 옵션 (3가지) */
  const recommendations = useMemo(() => {
    const need = calc.totalLumens
    const opts: Array<{ title: string; desc: string; total: number }> = []

    // 옵션 1: 가장 큰 LED 1개로 가장 가깝게
    const oneCandidate = LED_PRESETS.reduce((best, p) =>
      Math.abs(p.lm - need) < Math.abs(best.lm - need) ? p : best
    , LED_PRESETS[0])
    if (oneCandidate.lm >= need * 0.85) {
      opts.push({ title: `${oneCandidate.name} × 1개`,
        desc: `메인 1개로 충당 (${oneCandidate.w}W)`, total: oneCandidate.lm })
    }

    // 옵션 2: 30W × n
    {
      const led = LED_PRESETS.find(p => p.w === 30)!
      const cnt = Math.ceil(need / led.lm)
      opts.push({ title: `${led.name} × ${cnt}개`,
        desc: `중형 분산 (${led.w * cnt}W)`, total: led.lm * cnt })
    }

    // 옵션 3: 20W × n (분산)
    {
      const led = LED_PRESETS.find(p => p.w === 20)!
      const cnt = Math.ceil(need / led.lm)
      opts.push({ title: `${led.name} × ${cnt}개`,
        desc: `소형 분산, 균일 (${led.w * cnt}W)`, total: led.lm * cnt })
    }

    // 중복 제거
    const seen = new Set<string>()
    return opts.filter(o => {
      if (seen.has(o.title)) return false
      seen.add(o.title)
      return true
    }).slice(0, 3)
  }, [calc.totalLumens])

  /* LED 프리셋 적용 */
  function selectLed(w: number) {
    const led = LED_PRESETS.find(p => p.w === w)
    if (led) {
      setLumenPerLight(led.lm)
      setLedPresetId(w)
    }
  }
  function onLumenChange(v: number) {
    setLumenPerLight(v)
    setLedPresetId(null)
  }

  /* ─── 탭 2 환산 계산 ─── */
  const convertResult = useMemo(() => {
    const refBulb = BULB_EFFICIENCY.find(b => b.id === referenceBulb)!
    let baseLumens = 0
    if (convertMode === 'w-to-lm') {
      baseLumens = inputW * refBulb.lmPerW
    } else {
      baseLumens = inputLm
    }
    // 모든 조명 종류별 같은 밝기 W
    const rows = BULB_EFFICIENCY.map(b => ({
      ...b,
      w: b.lmPerW > 0 ? baseLumens / b.lmPerW : 0,
      lm: baseLumens,
    }))
    return { baseLumens, rows }
  }, [convertMode, inputW, inputLm, referenceBulb])

  /* 연간 전기료 비교 (백열전구 vs LED 1일 5시간 사용) */
  const annualCost = useMemo(() => {
    const incRow = convertResult.rows.find(r => r.id === 'incandescent')!
    const ledRow = convertResult.rows.find(r => r.id === 'led')!
    const dailyHours = 5
    const incKwh = (incRow.w * dailyHours * 365) / 1000
    const ledKwh = (ledRow.w * dailyHours * 365) / 1000
    const incCost = incKwh * KRW_PER_KWH
    const ledCost = ledKwh * KRW_PER_KWH
    return { incCost, ledCost, saving: incCost - ledCost, max: Math.max(incCost, ledCost) }
  }, [convertResult.rows])

  /* 색온도 마커 위치 (2700~6500 → 0~100%) */
  const colorTempCenter = (space.colorTemp.min + space.colorTemp.max) / 2
  const colorTempMarkerPct = ((colorTempCenter - 2700) / (6500 - 2700)) * 100

  /* 결과 복사 */
  function handleCopy() {
    const lines: string[] = []
    if (tab === 'calc') {
      lines.push(
        '💡 조명 밝기 계산 결과',
        `공간: ${space.name} ${fmt(dims.area)}㎡ (${fmt(dims.area / PYUNG_TO_M2, 1)}평) × ${heightM}m`,
        `목표: ${fmt(calc.targetLux)} lux × 보정 ${calc.ceilingFactor.toFixed(2)} × ${calc.typeFactor}`,
        `필요 총 루멘: ${fmt(calc.totalLumens)} lm`,
        `조명 1개당 ${lumenPerLight}lm → ${calc.lightCount}개 필요`,
        `실제 설치 시 약 ${fmt(calc.installedLux)} lux`,
      )
    } else if (tab === 'convert') {
      lines.push(
        '💡 W ↔ 루멘 환산',
        convertMode === 'w-to-lm'
          ? `${inputW}W ${BULB_EFFICIENCY.find(b => b.id === referenceBulb)?.name} = ${fmt(convertResult.baseLumens)}lm`
          : `${inputLm}lm 기준 같은 밝기 — ${convertResult.rows.map(r => `${r.name} ${r.w.toFixed(1)}W`).join(', ')}`,
      )
    } else {
      lines.push('💡 공간별 조명 가이드 — youtil.kr 에서 확인하세요')
    }
    lines.push('youtil.kr/tools/interior/lighting')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  const pyungOptions = [5, 7, 10, 12, 15, 18, 20, 22, 25, 28, 30, 33, 35, 40]

  /* 조명 배치 SVG (2×2 격자 또는 메인+보조) */
  function LayoutSvg() {
    const VBW = 360, VBH = 220, padding = 32
    const w = dims.width, l = dims.length
    if (w <= 0 || l <= 0) return null
    const ratio = w / l
    let drawW = VBW - padding * 2
    let drawH = VBH - padding * 2
    if (ratio > drawW / drawH) drawH = drawW / ratio
    else drawW = drawH * ratio
    const x0 = (VBW - drawW) / 2
    const y0 = (VBH - drawH) / 2

    /* 조명 위치 — 격자 분배 */
    const cnt = calc.lightCount
    const cols = cnt === 1 ? 1 : cnt === 2 ? 2 : cnt <= 4 ? 2 : cnt <= 6 ? 3 : cnt <= 9 ? 3 : 4
    const rows = Math.ceil(cnt / cols)
    const positions: Array<{ x: number; y: number }> = []
    let placed = 0
    for (let r = 0; r < rows && placed < cnt; r++) {
      const rowCount = Math.min(cols, cnt - placed)
      for (let c = 0; c < rowCount; c++) {
        const x = x0 + drawW * ((c + 1) / (rowCount + 1))
        const y = y0 + drawH * ((r + 1) / (rows + 1))
        positions.push({ x, y })
        placed++
      }
    }

    return (
      <svg className={styles.layoutSvg} viewBox={`0 0 ${VBW} ${VBH}`} aria-hidden="true">
        {/* 방 */}
        <rect x={x0} y={y0} width={drawW} height={drawH} fill="rgba(232,151,87,0.05)" stroke="#fff" strokeWidth={1.5} />
        <text x={x0 + drawW / 2} y={y0 - 8} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="monospace">{w.toFixed(1)}m</text>
        <text x={x0 - 8} y={y0 + drawH / 2 + 4} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="monospace">{l.toFixed(1)}m</text>
        {/* 조명 빛 영역 */}
        {positions.map((p, i) => (
          <circle key={`g-${i}`} cx={p.x} cy={p.y} r={Math.min(drawW, drawH) * 0.18} fill="rgba(232,151,87,0.18)" />
        ))}
        {/* 조명 점 */}
        {positions.map((p, i) => (
          <g key={`l-${i}`}>
            <circle cx={p.x} cy={p.y} r={5} fill="#FFD700" stroke="#fff" strokeWidth={1} />
            <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#FFD700" strokeWidth={0.6} opacity={0.5} />
          </g>
        ))}
        {/* 조명 개수 라벨 */}
        <text x={x0 + drawW / 2} y={y0 + drawH + 22} textAnchor="middle" fill="var(--accent)" fontSize="11" fontFamily="monospace" fontWeight={700}>
          {cnt}개 조명 — {cols}×{rows} 분산
        </text>
      </svg>
    )
  }

  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 계산기는 일반 가정용 LED 조명 평균 효율(1W ≈ 100lm) 기준 참고용</strong>입니다.
        실제 밝기는 조명 디자인, 천장 색상, 가구 배치, 자연광에 따라 달라질 수 있습니다. 정확한 시공은 조명 전문가와 상담하세요.
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'calc' ? styles.tabActive : ''}`}    onClick={() => setTab('calc')}>밝기 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'convert' ? styles.tabActive : ''}`} onClick={() => setTab('convert')}>W ↔ 루멘 환산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'guide' ? styles.tabActive : ''}`}   onClick={() => setTab('guide')}>공간별 가이드</button>
      </div>

      {/* ────────────── 탭 1: 밝기 계산 ────────────── */}
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
              <span className={styles.cardLabelHint}>한국 KS 기준 권장 lux</span>
            </div>
            <div className={styles.spaceGrid}>
              {SPACE_TYPES.map(s => (
                <button key={s.id} type="button" className={`${styles.spaceBtn} ${styles[s.cls]} ${spaceId === s.id ? styles.spActive : ''}`} onClick={() => setSpaceId(s.id)}>
                  <span className="icon">{s.icon}</span>
                  {s.name}
                  <small>{s.lux}lx</small>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              현재 선택 — <strong style={{ color: 'var(--text)' }}>{space.name}</strong> 권장 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{space.range}</strong>
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>밝기 강도</span>
              <span className={styles.cardLabelHint}>권장 범위 내 조정</span>
            </div>
            <div className={styles.intensityGrid}>
              <button type="button" className={`${styles.intensityBtn} ${styles.intDim} ${intensity === 'dim' ? styles.intActive : ''}`}           onClick={() => setIntensity('dim')}>어둡게<small>×0.7 무드</small></button>
              <button type="button" className={`${styles.intensityBtn} ${styles.intStandard} ${intensity === 'standard' ? styles.intActive : ''}`} onClick={() => setIntensity('standard')}>표준<small>×1.0 권장</small></button>
              <button type="button" className={`${styles.intensityBtn} ${styles.intBright} ${intensity === 'bright' ? styles.intActive : ''}`}     onClick={() => setIntensity('bright')}>밝게<small>×1.3 활동</small></button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>조명 방식</span>
              <span className={styles.cardLabelHint}>방식별 보정 계수</span>
            </div>
            <div className={styles.lightTypeGrid}>
              <button type="button" className={`${styles.lightTypeBtn} ${styles.ltDirect} ${lightingType === 'direct' ? styles.ltActive : ''}`}     onClick={() => setLightingType('direct')}>
                직접 조명<small>천장등·펜던트 (×1.0)</small>
              </button>
              <button type="button" className={`${styles.lightTypeBtn} ${styles.ltIndirect} ${lightingType === 'indirect' ? styles.ltActive : ''}`} onClick={() => setLightingType('indirect')}>
                간접 조명<small>벽 반사·코브 (×1.5)</small>
              </button>
              <button type="button" className={`${styles.lightTypeBtn} ${styles.ltMixed} ${lightingType === 'mixed' ? styles.ltActive : ''}`}       onClick={() => setLightingType('mixed')}>
                직접+간접<small>혼합 (×1.2)</small>
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>조명 1개당 루멘</span>
              <span className={styles.cardLabelHint}>한국 LED 표준 (1W ≈ 100lm)</span>
            </div>
            <div className={styles.ledGrid}>
              {LED_PRESETS.map(p => (
                <button key={p.w} type="button" className={`${styles.ledBtn} ${ledPresetId === p.w ? styles.ledActive : ''}`} onClick={() => selectLed(p.w)}>
                  <span>
                    {p.name}
                    <span className={styles.ledRoom}>{p.room}</span>
                  </span>
                  <small>{p.lm}lm</small>
                </button>
              ))}
            </div>
            <span className={styles.subLabel}>또는 직접 입력 (lm)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" min={50} step={50} value={lumenPerLight} onChange={e => onLumenChange(n(e.target.value, 50))} />
              <span className={styles.unit}>lm</span>
            </div>
          </div>

          {/* 결과 — HERO */}
          <div className={styles.hero}>
            <p className={styles.heroLead}>필요 조명 개수</p>
            <p className={styles.heroNum}>{calc.lightCount}<span className={styles.heroUnit}>개</span></p>
            <p className={styles.heroSub}>
              총 <strong className={styles.heroSubAccent}>{fmt(calc.totalLumens)} lm</strong> 필요 — {space.name} {fmt(dims.area)}㎡ × {intensity === 'dim' ? '어둡게' : intensity === 'bright' ? '밝게' : '표준'} × {lightingType === 'direct' ? '직접' : lightingType === 'indirect' ? '간접' : '혼합'} 조명
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>밝기 분석</span></div>
            <table className={styles.analysisTable}>
              <tbody>
                <tr><td>공간 면적</td><td>{fmt(dims.area)}㎡ ({fmt(dims.area / PYUNG_TO_M2, 1)}평)</td></tr>
                <tr><td>권장 lux ({space.name} {intensity === 'dim' ? '어둡게' : intensity === 'bright' ? '밝게' : '표준'})</td><td>{fmt(calc.targetLux)} lux</td></tr>
                <tr><td>천장 높이 보정 ({heightM}m)</td><td>× {calc.ceilingFactor.toFixed(2)}</td></tr>
                <tr><td>조명 방식 보정 ({lightingType === 'direct' ? '직접' : lightingType === 'indirect' ? '간접' : '혼합'})</td><td>× {calc.typeFactor.toFixed(1)}</td></tr>
                <tr className={styles.totalRow}><td>필요 총 루멘</td><td>{fmt(calc.totalLumens)} lm</td></tr>
                <tr><td>조명 1개당</td><td>{fmt(lumenPerLight)} lm</td></tr>
                <tr className={styles.totalRow}><td>필요 조명 개수</td><td>{calc.lightCount}개</td></tr>
                <tr><td>실제 설치 시 밝기</td><td>{fmt(calc.installedLux)} lux {calc.installedLux >= calc.targetLux ? '✅' : '⚠️'}</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>📦 조명 추천 옵션</span>
              <span className={styles.cardLabelHint}>약 {fmt(calc.totalLumens)}lm 충당 조합</span>
            </div>
            <div className={styles.recOptionGrid}>
              {recommendations.map((opt, i) => (
                <div key={i} className={styles.recOption}>
                  <div>
                    <p className={styles.recOptionTitle}>{opt.title}</p>
                    <p className={styles.recOptionDesc}>{opt.desc}</p>
                  </div>
                  <p className={styles.recOptionLm}>{fmt(opt.total)}lm</p>
                </div>
              ))}
            </div>
          </div>

          {/* 색온도 가이드 */}
          <div className={styles.colorTempCard}>
            <div className={styles.cardLabel} style={{ marginBottom: 0 }}>
              <span>🎨 {space.name} 색온도 추천</span>
              <span className={styles.cardLabelHint}>{space.colorTemp.min}~{space.colorTemp.max}K</span>
            </div>
            <div className={styles.colorTempBar}>
              <div className={styles.colorTempMarker} style={{ left: `${colorTempMarkerPct}%` }} />
            </div>
            <div className={styles.colorTempLabels}>
              <span>2700K 전구색</span>
              <span>4000K 주백색</span>
              <span>6500K 주광색</span>
            </div>
            <p className={styles.colorTempInfo}>
              <strong>{space.colorTemp.label}</strong> ({space.colorTemp.min}~{space.colorTemp.max}K) — {space.colorTemp.vibe}
            </p>
          </div>

          {/* 조명 배치 시각화 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>조명 배치 시각화</span>
              <span className={styles.cardLabelHint}>{calc.lightCount}개 균등 분산</span>
            </div>
            <div className={styles.layoutWrap}>
              <LayoutSvg />
            </div>
          </div>
        </>
      )}

      {/* ────────────── 탭 2: W ↔ lm 환산 ────────────── */}
      {tab === 'convert' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>변환 방향</span>
            </div>
            <div className={styles.convertModeRow}>
              <button type="button" className={`${styles.convertModeBtn} ${convertMode === 'w-to-lm' ? styles.convertModeActive : ''}`} onClick={() => setConvertMode('w-to-lm')}>W → lm</button>
              <button type="button" className={`${styles.convertModeBtn} ${convertMode === 'lm-to-w' ? styles.convertModeActive : ''}`} onClick={() => setConvertMode('lm-to-w')}>lm → W</button>
            </div>

            <span className={styles.subLabel}>기준 조명 종류</span>
            <div className={styles.bulbGrid}>
              {BULB_EFFICIENCY.map(b => (
                <button key={b.id} type="button" className={`${styles.bulbBtn} ${styles[b.cls]} ${referenceBulb === b.id ? styles.bulbActive : ''}`} onClick={() => setReferenceBulb(b.id)}>
                  {b.name}
                  <small>{b.lmPerW}lm/W</small>
                </button>
              ))}
            </div>

            <div style={{ height: 14 }} />
            {convertMode === 'w-to-lm' ? (
              <>
                <span className={styles.subLabel}>입력 — 와트 (W)</span>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" min={1} step={1} value={inputW} onChange={e => setInputW(n(e.target.value, 1))} />
                  <span className={styles.unit}>W</span>
                </div>
              </>
            ) : (
              <>
                <span className={styles.subLabel}>입력 — 루멘 (lm)</span>
                <div className={styles.inputRow}>
                  <input className={styles.bigInput} type="number" min={1} step={50} value={inputLm} onChange={e => setInputLm(n(e.target.value, 1))} />
                  <span className={styles.unit}>lm</span>
                </div>
              </>
            )}
          </div>

          <div className={styles.hero}>
            <p className={styles.heroLead}>{convertMode === 'w-to-lm' ? '환산 결과' : '같은 밝기'}</p>
            <p className={styles.heroNum}>{fmt(convertResult.baseLumens)}<span className={styles.heroUnit}>lm</span></p>
            <p className={styles.heroSub}>
              {convertMode === 'w-to-lm'
                ? <>{inputW}W <strong className={styles.heroSubAccent}>{BULB_EFFICIENCY.find(b => b.id === referenceBulb)?.name}</strong> 기준</>
                : <>입력값 {fmt(inputLm)}lm</>
              }
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>같은 밝기 ({fmt(convertResult.baseLumens)}lm)를 내는 조명 종류별 와트</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.convertTable}>
                <thead>
                  <tr><th>종류</th><th>1L당 효율</th><th>같은 밝기 W</th><th>수명</th></tr>
                </thead>
                <tbody>
                  {convertResult.rows.map(r => (
                    <tr key={r.id} className={`${styles[r.rowCls]}`}>
                      <td>{r.name}</td>
                      <td>{r.lmPerW}lm/W</td>
                      <td>{r.w.toFixed(1)}W</td>
                      <td style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 400, color: 'var(--muted)', fontSize: 11 }}>{r.lifespan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 연간 전기료 비교 */}
          <div className={styles.savingCard}>
            <div className={styles.cardLabel} style={{ marginBottom: 0, color: '#3EFF9B' }}>
              <span>💚 연간 전기료 비교</span>
              <span className={styles.cardLabelHint}>1일 5시간 사용 · {KRW_PER_KWH}원/kWh</span>
            </div>
            <p className={styles.savingLead}>같은 밝기를 내는 백열전구 vs LED 1년 전기료</p>
            <div className={styles.savingBars}>
              <div className={styles.savingBar}>
                <span className={styles.savingBarName}>백열전구</span>
                <div className={styles.savingBarTrack}>
                  <div className={`${styles.savingBarFill} ${styles.savingBarFillInc}`} style={{ width: `${(annualCost.incCost / annualCost.max) * 100}%` }} />
                </div>
                <span className={styles.savingBarVal}>{fmt(annualCost.incCost)}원</span>
              </div>
              <div className={styles.savingBar}>
                <span className={styles.savingBarName}>LED</span>
                <div className={styles.savingBarTrack}>
                  <div className={`${styles.savingBarFill} ${styles.savingBarFillLed}`} style={{ width: `${(annualCost.ledCost / annualCost.max) * 100}%` }} />
                </div>
                <span className={styles.savingBarVal}>{fmt(annualCost.ledCost)}원</span>
              </div>
            </div>
            <p className={styles.savingDelta}>
              LED 절감액 — <strong>{fmt(annualCost.saving)}원/년</strong>
              {annualCost.incCost > 0 && <> (약 <strong>{fmt((annualCost.saving / annualCost.incCost) * 100, 0)}%</strong> 절감)</>}
            </p>
          </div>
        </>
      )}

      {/* ────────────── 탭 3: 가이드 ────────────── */}
      {tab === 'guide' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>📋 공간별 종합 가이드</span>
              <span className={styles.cardLabelHint}>한국 KS A 3011 기준</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.guideTable}>
                <thead>
                  <tr><th>공간</th><th>권장 lux</th><th>색온도</th></tr>
                </thead>
                <tbody>
                  {SPACE_TYPES.map(s => (
                    <tr key={s.id}>
                      <td>{s.icon} {s.name}</td>
                      <td>{s.range}</td>
                      <td>{s.colorTemp.min}~{s.colorTemp.max}K {s.colorTemp.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>💡 조명 종류별 활용</span></div>
            <div className={styles.lightingKindGrid}>
              <div className={`${styles.lightingKindCard} ${styles.lkMain}`}>
                <p className={styles.lkTitle}>메인 조명 (시일링·천장등)</p>
                <p className={styles.lkBody}>
                  <strong>공간 전체 균일 밝기.</strong> 면적 대비 큰 루멘 필요. 천장 중앙·격자 배치. 권장 루멘의 <strong>70~80%</strong> 차지.
                </p>
              </div>
              <div className={`${styles.lightingKindCard} ${styles.lkSub}`}>
                <p className={styles.lkTitle}>보조 조명 (펜던트·다운라이트)</p>
                <p className={styles.lkBody}>
                  <strong>특정 공간 강조.</strong> 식탁·소파·아일랜드. 메인의 <strong>1/3~1/2</strong> 루멘. 색온도 차별화 가능.
                </p>
              </div>
              <div className={`${styles.lightingKindCard} ${styles.lkMood}`}>
                <p className={styles.lkTitle}>무드 조명 (스탠드·간접·LED 스트립)</p>
                <p className={styles.lkBody}>
                  <strong>분위기 연출.</strong> 메인의 <strong>1/4~1/3</strong> 루멘. 색온도 낮은 전구색(2700~3000K) 추천.
                </p>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              💡 <strong style={{ color: 'var(--accent)' }}>권장 비율</strong>: 메인 70% + 보조 20% + 무드 10%
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>⚡ 루멘 vs 와트 빠른 참조</span>
              <span className={styles.cardLabelHint}>같은 밝기 비교</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.convertTable}>
                <thead>
                  <tr><th>루멘</th><th>백열전구</th><th>할로겐</th><th>형광등</th><th>LED</th></tr>
                </thead>
                <tbody>
                  {[
                    { lm: 250,  inc: 25,  hal: 14, fluo: 4,  led: 2.5 },
                    { lm: 450,  inc: 40,  hal: 25, fluo: 7,  led: 4.5 },
                    { lm: 800,  inc: 60,  hal: 45, fluo: 13, led: 8 },
                    { lm: 1100, inc: 75,  hal: 60, fluo: 17, led: 11 },
                    { lm: 1600, inc: 100, hal: 90, fluo: 25, led: 16 },
                    { lm: 2600, inc: 150, hal: 145, fluo: 40, led: 26 },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r.lm.toLocaleString()} lm</td>
                      <td className={styles.rowInc}>{r.inc}W</td>
                      <td className={styles.rowHalogen}>{r.hal}W</td>
                      <td className={styles.rowFluo}>{r.fluo}W</td>
                      <td className={styles.rowLed}>{r.led}W</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
