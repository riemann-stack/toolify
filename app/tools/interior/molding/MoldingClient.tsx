'use client'

import { useMemo, useState } from 'react'
import s from './molding.module.css'

const PYUNG_TO_M2 = 3.3058

const n = (v: string | number, d = 0): number => {
  const x = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v
  return Number.isFinite(x) ? x : d
}
const fmt = (v: number, dp = 0): string =>
  v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp })
const fmtKRW = (v: number): string => `${Math.round(v).toLocaleString('ko-KR')}원`

type MoldingTypeKey = 'ceiling' | 'baseboard' | 'belt' | 'door'
const MOLDING_TYPES: {
  key: MoldingTypeKey
  name: string
  desc: string
  cls: string
  color: string
}[] = [
  { key: 'ceiling',   name: '천장 몰딩',     desc: '천장-벽 경계',     cls: s.tCeiling,    color: 'var(--accent)' },
  { key: 'baseboard', name: '걸레받이',      desc: '벽-바닥 경계',     cls: s.tBaseboard,  color: '#FF8C3E' },
  { key: 'belt',      name: '띠몰딩',        desc: '벽 중간 장식',     cls: s.tBelt,       color: '#9B59B6' },
  { key: 'door',      name: '출입문 프레임', desc: '문틀 둘레 마감',   cls: s.tDoor,       color: '#3EC8FF' },
]

type MaterialKey = 'pvc' | 'mdf' | 'wood' | 'gypsum' | 'styrene' | 'custom'
const MATERIALS: {
  key: MaterialKey
  name: string
  pricePerM: number
  label: string
  cls: string
}[] = [
  { key: 'pvc',     name: 'PVC',     pricePerM: 1500, label: '저렴·셀프',   cls: s.matPvc },
  { key: 'mdf',     name: 'MDF',     pricePerM: 2500, label: '도장 후 사용', cls: s.matMdf },
  { key: 'wood',    name: '우드',    pricePerM: 5000, label: '천연 우드',   cls: s.matWood },
  { key: 'gypsum',  name: '석고',    pricePerM: 4000, label: '고급·욕실',   cls: s.matGypsum },
  { key: 'styrene', name: '스티렌',  pricePerM: 1000, label: '저렴·가벼움', cls: s.matStyrene },
  { key: 'custom',  name: '직접 입력', pricePerM: 2000, label: '사용자 가격', cls: s.matCustom },
]

const PYUNG_OPTIONS = [
  5, 7, 10, 12, 15, 17, 20, 24, 25, 27, 30, 32, 34, 35, 40, 45, 50,
]

const UNIT_LENGTHS = [
  { v: 2.4, label: '일반' },
  { v: 3.0, label: '중간' },
  { v: 3.6, label: '큰사이즈' },
  { v: 0,   label: '직접' },
]

const LOSS_OPTIONS = [
  { v: 5,  label: '여유 적음', cls: s.lossSafe, hint: '직사각형·모서리 적음' },
  { v: 10, label: '한국 표준', cls: s.lossStd,  hint: '기본 (4모서리·여유)' },
  { v: 15, label: '여유 많음', cls: s.lossWarn, hint: '모서리 많음·셀프' },
]

export default function MoldingClient() {
  const [tab, setTab] = useState<'calc' | 'guide'>('calc')

  // 입력 모드
  const [mode, setMode] = useState<'pyung' | 'meter' | 'perimeter'>('pyung')
  const [pyungValue, setPyungValue] = useState<string>('24')
  const [width, setWidth] = useState<string>('5.0')
  const [depth, setDepth] = useState<string>('4.0')
  const [perimeterDirect, setPerimeterDirect] = useState<string>('18')

  // 몰딩 종류
  const [selectedTypes, setSelectedTypes] = useState<Set<MoldingTypeKey>>(new Set(['ceiling']))

  // 문 제외
  const [excludeDoors, setExcludeDoors] = useState<boolean>(true)
  const [doorCount, setDoorCount] = useState<string>('1')
  const [doorWidth, setDoorWidth] = useState<string>('0.9')

  // 재질
  const [material, setMaterial] = useState<MaterialKey>('mdf')
  const [customPrice, setCustomPrice] = useState<string>('2000')

  // 단위 길이
  const [unitLen, setUnitLen] = useState<number>(2.4)
  const [customLen, setCustomLen] = useState<string>('2.4')

  // 로스율
  const [lossRate, setLossRate] = useState<number>(10)

  // 모서리
  const [cornerCount] = useState<number>(4)
  const [cornerExtraCm] = useState<number>(5) // cm per corner

  // copy
  const [copied, setCopied] = useState<boolean>(false)

  // ── 둘레 계산 ──
  const dims = useMemo(() => {
    if (mode === 'pyung') {
      const py = n(pyungValue, 0)
      const area = py * PYUNG_TO_M2
      // 정사각형 가정한 둘레 = 4 × √면적
      const side = Math.sqrt(area)
      const perimeter = side * 4
      return { area, perimeter, side, asEstimate: true }
    }
    if (mode === 'meter') {
      const w = n(width, 0)
      const d = n(depth, 0)
      const area = w * d
      const perimeter = 2 * (w + d)
      return { area, perimeter, side: 0, asEstimate: false }
    }
    // perimeter
    const p = n(perimeterDirect, 0)
    return { area: 0, perimeter: p, side: 0, asEstimate: false }
  }, [mode, pyungValue, width, depth, perimeterDirect])

  const selectedMaterial = MATERIALS.find(m => m.key === material) ?? MATERIALS[1]
  const effectivePrice = material === 'custom' ? n(customPrice, 0) : selectedMaterial.pricePerM
  const effectiveUnitLen = unitLen === 0 ? n(customLen, 2.4) : unitLen

  // ── 몰딩 계산 ──
  const calc = useMemo(() => {
    const cornerLossM = (cornerCount * cornerExtraCm) / 100 // m

    type Row = {
      key: MoldingTypeKey
      name: string
      base: number
      lossM: number
      total: number
      count: number
      cost: number
    }
    const rows: Row[] = []
    let grandBase = 0
    let grandLoss = 0
    let grandTotal = 0
    let grandCount = 0
    let grandCost = 0

    for (const t of MOLDING_TYPES) {
      if (!selectedTypes.has(t.key)) continue
      let base = dims.perimeter
      // 걸레받이만 문 폭 제외
      if (t.key === 'baseboard' && excludeDoors) {
        base -= n(doorCount, 0) * n(doorWidth, 0)
      }
      // 출입문 프레임은 둘레가 아니라 문틀 둘레 (문 1개당 약 5.4m = 0.9*2 + 2.1*2)
      if (t.key === 'door') {
        const dw = n(doorWidth, 0)
        const dh = 2.1
        const perDoor = 2 * (dw + dh)
        base = perDoor * n(doorCount, 1)
      }
      base = Math.max(0, base)
      const lossM = base * (lossRate / 100) + cornerLossM
      const total = base + lossM
      const count = effectiveUnitLen > 0 ? Math.ceil(total / effectiveUnitLen) : 0
      const cost = count * effectiveUnitLen * effectivePrice

      rows.push({ key: t.key, name: t.name, base, lossM, total, count, cost })
      grandBase += base
      grandLoss += lossM
      grandTotal += total
      grandCount += count
      grandCost += cost
    }

    // 시공비: m당 5,000원 (전문)
    const proLaborPerM = 5000
    const proLaborCost = grandTotal * proLaborPerM

    return {
      rows,
      grandBase,
      grandLoss,
      grandTotal,
      grandCount,
      grandCost,
      proLaborCost,
      proTotal: grandCost + proLaborCost,
    }
  }, [dims.perimeter, selectedTypes, excludeDoors, doorCount, doorWidth, lossRate, effectiveUnitLen, effectivePrice, cornerCount, cornerExtraCm])

  function toggleType(k: MoldingTypeKey) {
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  async function copyResult() {
    const lines = [
      `[몰딩 길이 계산]`,
      mode === 'pyung'
        ? `평수: ${pyungValue}평 (둘레 ≈ ${fmt(dims.perimeter, 1)}m)`
        : mode === 'meter'
        ? `방 ${width}m × ${depth}m (둘레 ${fmt(dims.perimeter, 1)}m)`
        : `둘레: ${perimeterDirect}m`,
      `재질: ${selectedMaterial.name} (${fmtKRW(effectivePrice)}/m)`,
      `몰딩 1개 길이: ${effectiveUnitLen}m`,
      `로스율: ${lossRate}% + 모서리 ${cornerCount}× ${cornerExtraCm}cm`,
      ``,
      ...calc.rows.map(r =>
        `· ${r.name}: 기본 ${fmt(r.base, 2)}m + 여유 ${fmt(r.lossM, 2)}m = 총 ${fmt(r.total, 2)}m → ${r.count}개`
      ),
      ``,
      `합계: ${fmt(calc.grandTotal, 1)}m, ${calc.grandCount}개`,
      `자재비(셀프): ${fmtKRW(calc.grandCost)}`,
      `전문 시공: ${fmtKRW(calc.proTotal)}`,
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // 평면도 SVG (방 직사각형 + 몰딩 라인)
  const planSvg = useMemo(() => {
    const W = 320, H = 220
    const pad = 30
    let rectW = W - pad * 2
    let rectH = H - pad * 2
    if (mode === 'meter') {
      const w = n(width, 0)
      const d = n(depth, 0)
      if (w > 0 && d > 0) {
        const ratio = w / d
        if (ratio > 1) {
          rectW = W - pad * 2
          rectH = rectW / ratio
        } else {
          rectH = H - pad * 2
          rectW = rectH * ratio
        }
      }
    } else if (mode === 'pyung') {
      // 정사각형 가정
      const min = Math.min(W - pad * 2, H - pad * 2)
      rectW = min
      rectH = min
    }
    const x = (W - rectW) / 2
    const y = (H - rectH) / 2
    const showCeiling   = selectedTypes.has('ceiling')
    const showBaseboard = selectedTypes.has('baseboard')
    const showBelt      = selectedTypes.has('belt')
    const doorPos = excludeDoors && showBaseboard
    const doorBreak = doorPos ? Math.max(20, rectW * 0.18) : 0
    const doorStartX = x + rectW / 2 - doorBreak / 2

    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className={s.floorPlanSvg} aria-hidden="true">
        {/* 방 윤곽 */}
        <rect x={x} y={y} width={rectW} height={rectH} fill="var(--bg2)" stroke="var(--border)" strokeWidth={1} />
        {/* 천장 몰딩 (위쪽 강조) */}
        {showCeiling && (
          <line x1={x - 2} y1={y} x2={x + rectW + 2} y2={y} stroke="var(--accent)" strokeWidth={4} strokeLinecap="round" />
        )}
        {/* 걸레받이 (아래쪽) - 문 위치 끊김 */}
        {showBaseboard && !doorPos && (
          <line x1={x - 2} y1={y + rectH} x2={x + rectW + 2} y2={y + rectH} stroke="#FF8C3E" strokeWidth={4} strokeLinecap="round" />
        )}
        {showBaseboard && doorPos && (
          <>
            <line x1={x - 2} y1={y + rectH} x2={doorStartX} y2={y + rectH} stroke="#FF8C3E" strokeWidth={4} strokeLinecap="round" />
            <line x1={doorStartX + doorBreak} y1={y + rectH} x2={x + rectW + 2} y2={y + rectH} stroke="#FF8C3E" strokeWidth={4} strokeLinecap="round" />
            {/* 문 표시 */}
            <rect x={doorStartX} y={y + rectH - 1} width={doorBreak} height={2} fill="#3EC8FF" opacity={0.8} />
            <text x={doorStartX + doorBreak / 2} y={y + rectH + 16} fontSize="9" fill="#3EC8FF" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={700}>
              문
            </text>
          </>
        )}
        {/* 좌·우 천장/걸레받이 */}
        {showCeiling && (
          <>
            <line x1={x} y1={y} x2={x} y2={y + rectH * 0.5} stroke="var(--accent)" strokeWidth={2} opacity={0.6} />
            <line x1={x + rectW} y1={y} x2={x + rectW} y2={y + rectH * 0.5} stroke="var(--accent)" strokeWidth={2} opacity={0.6} />
          </>
        )}
        {showBaseboard && (
          <>
            <line x1={x} y1={y + rectH * 0.5} x2={x} y2={y + rectH} stroke="#FF8C3E" strokeWidth={2} opacity={0.6} />
            <line x1={x + rectW} y1={y + rectH * 0.5} x2={x + rectW} y2={y + rectH} stroke="#FF8C3E" strokeWidth={2} opacity={0.6} />
          </>
        )}
        {/* 띠몰딩 (중앙) */}
        {showBelt && (
          <line x1={x} y1={y + rectH * 0.45} x2={x + rectW} y2={y + rectH * 0.45} stroke="#9B59B6" strokeWidth={2} strokeDasharray="4 3" opacity={0.85} />
        )}
        {/* 모서리 빨간 점 (45도 절단 위치) */}
        {[
          [x, y], [x + rectW, y], [x, y + rectH], [x + rectW, y + rectH],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={3.5} fill="#FF6B6B" />
        ))}
        {/* 라벨 */}
        <text x={W / 2} y={y - 10} fontSize="10" fill="var(--muted)" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif">
          {mode === 'meter' ? `${width}m × ${depth}m` : `둘레 ${fmt(dims.perimeter, 1)}m`}
        </text>
      </svg>
    )
  }, [mode, width, depth, dims.perimeter, selectedTypes, excludeDoors])

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <div className={s.disclaimer}>
        <strong>참고용 추정값입니다.</strong> 실제 시공 시 모서리·창문·문 위치, 자재 절단 단위, 절단 손실에 따라 ±10% 차이가 발생합니다.
        구매 전 실측을 권장하며, 셀프 시공 시 1박스 여유를 더 권장합니다.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'calc' ? s.tabActive : ''}`} onClick={() => setTab('calc')}>
          몰딩 길이 계산
        </button>
        <button className={`${s.tabBtn} ${tab === 'guide' ? s.tabActive : ''}`} onClick={() => setTab('guide')}>
          종류별 가이드
        </button>
      </div>

      {tab === 'calc' && (
        <>
          {/* ── 1. 방 정보 ── */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>방 정보</span>
              <span className={s.cardLabelHint}>평수 · 가로×세로 · 둘레 직접 입력</span>
            </div>
            <div className={s.modeToggle3}>
              <button className={`${s.modeBtn} ${s.modePyung}     ${mode === 'pyung'     ? s.modeActive : ''}`} onClick={() => setMode('pyung')}>평수</button>
              <button className={`${s.modeBtn} ${s.modeMeter}     ${mode === 'meter'     ? s.modeActive : ''}`} onClick={() => setMode('meter')}>가로×세로</button>
              <button className={`${s.modeBtn} ${s.modePerimeter} ${mode === 'perimeter' ? s.modeActive : ''}`} onClick={() => setMode('perimeter')}>둘레 직접</button>
            </div>

            {mode === 'pyung' && (
              <>
                <select className={s.pyungSelect} value={pyungValue} onChange={e => setPyungValue(e.target.value)}>
                  {PYUNG_OPTIONS.map(p => (<option key={p} value={p}>{p}평</option>))}
                </select>
                <p className={s.areaShow}>≈ {fmt(dims.area, 1)} ㎡ · 정사각형 가정 둘레 ≈ {fmt(dims.perimeter, 1)} m</p>
              </>
            )}

            {mode === 'meter' && (
              <>
                <div className={s.dimRow}>
                  <input className={s.bigInput} type="number" inputMode="decimal" step="0.1" min="0" value={width}
                    onChange={e => setWidth(e.target.value)} placeholder="가로" />
                  <span className={s.dimSep}>×</span>
                  <input className={s.bigInput} type="number" inputMode="decimal" step="0.1" min="0" value={depth}
                    onChange={e => setDepth(e.target.value)} placeholder="세로" />
                </div>
                <p className={s.areaShow}>면적 {fmt(dims.area, 2)} ㎡ · 둘레 {fmt(dims.perimeter, 1)} m</p>
              </>
            )}

            {mode === 'perimeter' && (
              <>
                <div className={s.inputRow}>
                  <input className={s.bigInput} type="number" inputMode="decimal" step="0.1" min="0" value={perimeterDirect}
                    onChange={e => setPerimeterDirect(e.target.value)} placeholder="둘레 (m)" />
                  <span className={s.unit}>m</span>
                </div>
                <p className={s.areaShow}>둘레 {fmt(dims.perimeter, 1)} m</p>
              </>
            )}
          </div>

          {/* ── 2. 몰딩 종류 ── */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>몰딩 종류 (복수 선택)</span>
              <span className={s.cardLabelHint}>선택된 항목만 계산</span>
            </div>
            <div className={s.moldingTypeGrid}>
              {MOLDING_TYPES.map(t => {
                const active = selectedTypes.has(t.key)
                return (
                  <button
                    key={t.key}
                    className={`${s.typeCard} ${t.cls} ${active ? s.tActive : ''}`}
                    onClick={() => toggleType(t.key)}
                    type="button"
                  >
                    <span className={s.typeCheckbox}>{active ? '✓' : ''}</span>
                    <span className={s.typeBody}>
                      <span className={s.typeName}>{t.name}</span>
                      <span className={s.typeDesc}>{t.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>

            {/* 문 제외 옵션 (걸레받이 선택 시) */}
            {(selectedTypes.has('baseboard') || selectedTypes.has('door')) && (
              <div className={s.doorOption}>
                <label className={s.doorOptionHeader}>
                  <input type="checkbox" checked={excludeDoors} onChange={e => setExcludeDoors(e.target.checked)} />
                  걸레받이 시공 시 문 폭 제외 / 문틀 둘레 산정
                </label>
                {excludeDoors && (
                  <div className={s.doorOptionInputs}>
                    <div>
                      <span className={s.subLabel}>문 개수</span>
                      <input className={s.smallInput} type="number" inputMode="numeric" min="0" step="1" value={doorCount}
                        onChange={e => setDoorCount(e.target.value)} />
                    </div>
                    <div>
                      <span className={s.subLabel}>문 폭 (m)</span>
                      <input className={s.smallInput} type="number" inputMode="decimal" min="0" step="0.1" value={doorWidth}
                        onChange={e => setDoorWidth(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 3. 재질 ── */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>몰딩 재질</span>
              <span className={s.cardLabelHint}>한국 시판 평균가</span>
            </div>
            <div className={s.materialGrid}>
              {MATERIALS.map(m => (
                <button
                  key={m.key}
                  className={`${s.matCard} ${m.cls} ${material === m.key ? s.matActive : ''}`}
                  onClick={() => setMaterial(m.key)}
                  type="button"
                >
                  <div className={s.matName}>{m.name}</div>
                  <div className={s.matPrice}>{fmt(m.pricePerM)}원/m</div>
                  <div className={s.matLabel}>{m.label}</div>
                </button>
              ))}
            </div>
            {material === 'custom' && (
              <div className={s.customPriceRow}>
                <span className={s.subLabel}>m당 가격 (원)</span>
                <input className={s.smallInput} type="number" inputMode="numeric" min="0" step="100" value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)} />
              </div>
            )}
          </div>

          {/* ── 4. 단위 길이 ── */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>몰딩 1개 길이</span>
              <span className={s.cardLabelHint}>한국 표준 2.4m</span>
            </div>
            <div className={s.unitLenGrid}>
              {UNIT_LENGTHS.map(u => (
                <button
                  key={u.v}
                  className={`${s.unitLenBtn} ${unitLen === u.v ? s.unitLenActive : ''}`}
                  onClick={() => setUnitLen(u.v)}
                  type="button"
                >
                  <small>{u.v === 0 ? '✏️' : `${u.v}m`}</small>
                  {u.label}
                </button>
              ))}
            </div>
            {unitLen === 0 && (
              <div className={s.customLenRow}>
                <span className={s.subLabel}>몰딩 1개 길이 (m)</span>
                <input className={s.smallInput} type="number" inputMode="decimal" min="0.1" step="0.1" value={customLen}
                  onChange={e => setCustomLen(e.target.value)} />
              </div>
            )}
          </div>

          {/* ── 5. 로스율 ── */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>로스율 (절단 여유)</span>
              <span className={s.cardLabelHint}>+ 모서리 {cornerCount}×{cornerExtraCm}cm</span>
            </div>
            <div className={s.lossGrid}>
              {LOSS_OPTIONS.map(l => (
                <button
                  key={l.v}
                  className={`${s.lossBtn} ${l.cls} ${lossRate === l.v ? s.lossActive : ''}`}
                  onClick={() => setLossRate(l.v)}
                  type="button"
                >
                  <small>+{l.v}%</small>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── HERO ── */}
          {selectedTypes.size > 0 && dims.perimeter > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>필요한 몰딩</p>
              <div>
                <span className={s.heroNum}>{calc.grandCount}</span>
                <span className={s.heroUnit}>개</span>
              </div>
              <p className={s.heroSub}>
                총 길이 <span className={s.heroSubAccent}>{fmt(calc.grandTotal, 1)}m</span> ·
                {' '}{selectedMaterial.name} 몰딩 <span className={s.heroSubAccent}>{effectiveUnitLen}m × {calc.grandCount}개</span>
              </p>
            </div>
          )}

          {/* ── 종류별 분석 표 ── */}
          {selectedTypes.size > 0 && dims.perimeter > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>몰딩 종류별 분석</span>
                <span className={s.cardLabelHint}>기본 + 모서리·로스 = 총 길이</span>
              </div>
              <table className={s.analysisTable}>
                <thead>
                  <tr>
                    <th>종류</th>
                    <th>기본</th>
                    <th>+여유</th>
                    <th>총 길이</th>
                    <th>개수</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.rows.map(r => (
                    <tr key={r.key}>
                      <td>{r.name}</td>
                      <td>{fmt(r.base, 2)}m</td>
                      <td className={s.lossCell}>+{fmt(r.lossM, 2)}m</td>
                      <td>{fmt(r.total, 2)}m</td>
                      <td>{r.count}개</td>
                    </tr>
                  ))}
                  <tr className={s.totalRow}>
                    <td>합계</td>
                    <td>{fmt(calc.grandBase, 2)}m</td>
                    <td>+{fmt(calc.grandLoss, 2)}m</td>
                    <td>{fmt(calc.grandTotal, 2)}m</td>
                    <td>{calc.grandCount}개</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ── 비용 견적 ── */}
          {selectedTypes.size > 0 && dims.perimeter > 0 && (
            <div className={s.costCard}>
              <div className={s.costRow}>
                <span>{selectedMaterial.name} 몰딩 단가</span>
                <strong>{fmtKRW(effectivePrice)}/m</strong>
              </div>
              <div className={s.costRow}>
                <span>총 길이</span>
                <strong>{fmt(calc.grandTotal, 1)}m</strong>
              </div>
              <div className={s.costRow}>
                <span>자재비 ({calc.grandCount}개 × {effectiveUnitLen}m)</span>
                <strong>{fmtKRW(calc.grandCost)}</strong>
              </div>
              <div className={s.costRow}>
                <span>전문 시공비 (m당 5,000원)</span>
                <strong>{fmtKRW(calc.proLaborCost)}</strong>
              </div>
              <div className={s.costSplit}>
                <div className={s.costSplitSelf}>
                  <p>셀프 시공</p>
                  <p>{fmtKRW(calc.grandCost)}</p>
                </div>
                <div className={s.costSplitPro}>
                  <p>전문 시공</p>
                  <p>{fmtKRW(calc.proTotal)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── 평면도 SVG ── */}
          {selectedTypes.size > 0 && dims.perimeter > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>방 평면도 · 몰딩 위치</span>
                <span className={s.cardLabelHint}>모서리 ● 절단 위치</span>
              </div>
              <div className={s.floorPlanWrap}>{planSvg}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11.5, color: 'var(--muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
                {selectedTypes.has('ceiling')   && <span><span style={{ color: 'var(--accent)', fontWeight: 700 }}>━━</span> 천장 몰딩</span>}
                {selectedTypes.has('baseboard') && <span><span style={{ color: '#FF8C3E', fontWeight: 700 }}>━━</span> 걸레받이</span>}
                {selectedTypes.has('belt')      && <span><span style={{ color: '#9B59B6', fontWeight: 700 }}>┄┄</span> 띠몰딩</span>}
                <span><span style={{ color: '#FF6B6B', fontWeight: 700 }}>●</span> 45° 절단 위치</span>
              </div>
            </div>
          )}

          {/* 모서리 안내 */}
          {selectedTypes.size > 0 && dims.perimeter > 0 && (
            <div className={s.cornerNote}>
              📐 모서리 <strong>{cornerCount}개 × {cornerExtraCm}cm = {cornerCount * cornerExtraCm}cm</strong> 자동 추가
              · 45도 마이터 절단 마감 시 모서리 1개당 약 5~10cm 여유분 권장
              · 마이터 박스 또는 마이터 톱 필수
            </div>
          )}

          {/* 빠른 참조 (현재 재질 기준) */}
          {dims.perimeter > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>평수별 빠른 참조 ({selectedMaterial.name} · {effectiveUnitLen}m, +{lossRate}% 로스)</span>
              </div>
              <table className={s.refTable}>
                <thead>
                  <tr>
                    <th>평수</th>
                    <th>둘레</th>
                    <th>천장 몰딩</th>
                    <th>걸레받이*</th>
                    <th>예상 자재비</th>
                  </tr>
                </thead>
                <tbody>
                  {[5, 10, 15, 20, 24, 30, 35].map(p => {
                    const a = p * PYUNG_TO_M2
                    const side = Math.sqrt(a)
                    const peri = side * 4
                    const cornerLossM = (cornerCount * cornerExtraCm) / 100
                    // 천장
                    const ceilTotal = peri * (1 + lossRate / 100) + cornerLossM
                    const ceilCount = effectiveUnitLen > 0 ? Math.ceil(ceilTotal / effectiveUnitLen) : 0
                    // 걸레받이 (문 1개 -0.9m)
                    const baseLen = Math.max(0, peri - 0.9)
                    const baseTotal = baseLen * (1 + lossRate / 100) + cornerLossM
                    const baseCount = effectiveUnitLen > 0 ? Math.ceil(baseTotal / effectiveUnitLen) : 0
                    const totalCount = ceilCount + baseCount
                    const cost = totalCount * effectiveUnitLen * effectivePrice
                    return (
                      <tr key={p}>
                        <td>{p}평</td>
                        <td>{fmt(peri, 1)}m</td>
                        <td>{ceilCount}개</td>
                        <td>{baseCount}개</td>
                        <td>{fmtKRW(cost)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                * 걸레받이는 문 1개(폭 0.9m) 제외 가정. 천장 몰딩 + 걸레받이 모두 시공 기준.
              </p>
            </div>
          )}

          {/* 결과 복사 */}
          {selectedTypes.size > 0 && dims.perimeter > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {tab === 'guide' && (
        <>
          {/* 종류별 가이드 */}
          <div className={s.guideCard}>
            <h3 className={s.guideCardTitle}>몰딩 종류별 가이드 <small>· 위치·표준 폭·가격</small></h3>
            <div className={s.guideRowGrid}>
              {[
                { n: '천장 몰딩 (Crown Molding)', d: '천장과 벽 경계 마감. 한국에서 가장 흔한 PVC·MDF.', s: '폭 5~10cm · 1,500~5,000원/m' },
                { n: '걸레받이 (Baseboard)',       d: '벽과 바닥 경계 마감. 청소 흔적·의자 상처 가림.',  s: '높이 6~10cm · 1,000~3,000원/m' },
                { n: '띠몰딩 (Chair Rail)',         d: '벽 중간 장식 (보통 바닥에서 90cm). 데코 목적.',  s: '폭 3~6cm · 2,000~5,000원/m' },
                { n: '출입문 프레임 몰딩',          d: '문틀 둘레 마감. 폭 4~7cm 표준.',                  s: '문 1개 ≈ 5.4m · 2,000~6,000원/m' },
              ].map((g, i) => (
                <div key={i} className={s.guideRow}>
                  <p className={s.guideRowTitle}>{g.n}</p>
                  <p className={s.guideRowDesc}>{g.d}</p>
                  <p className={s.guideRowSpec}>{g.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 재질별 비교 */}
          <div className={s.guideCard}>
            <h3 className={s.guideCardTitle}>재질별 가격·특징</h3>
            <div className={s.guideRowGrid}>
              {[
                { n: 'PVC 몰딩',     d: '가장 저렴. 셀프 시공 쉬움. 방수·변색 적음.',          s: '1,500원/m · 셀프 OK' },
                { n: 'MDF 몰딩',     d: '도장 후 사용 (한국 인기). 깔끔한 마감. 표준 선택.',  s: '2,500원/m · 표준' },
                { n: '우드 몰딩',    d: '천연 우드. 자연 무늬. 고급 인테리어용.',              s: '5,000~10,000원/m · 프리미엄' },
                { n: '석고 몰딩',    d: '욕실·고급 인테리어. 곡선 디자인 가능.',               s: '4,000원/m · 고급' },
                { n: '스티렌 몰딩',  d: '가장 저렴·가벼움. 임시·저예산용.',                    s: '1,000원/m · 저예산' },
              ].map((g, i) => (
                <div key={i} className={s.guideRow}>
                  <p className={s.guideRowTitle}>{g.n}</p>
                  <p className={s.guideRowDesc}>{g.d}</p>
                  <p className={s.guideRowSpec}>{g.s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 시공 주의사항 */}
          <div className={s.guideCard}>
            <h3 className={s.guideCardTitle}>시공 시 주의사항</h3>
            <div className={s.guideRowGrid}>
              {[
                { n: '🔪 모서리 절단', d: '45도 절단(마이터 톱 또는 마이터 박스 필수). 자투리 1개당 5~10cm 여유.' },
                { n: '🔧 본드 + 못', d: '본드 + 못 병행이 안정적. PVC는 본드만으로 가능, MDF는 못으로 보강.' },
                { n: '🎨 도장 순서', d: 'MDF는 시공 후 도장보다 시공 전 도장이 깔끔. 끝부분만 보수 도장.' },
                { n: '📏 실측 우선', d: '평수 기반은 정사각형 가정값. 실제 둘레는 실측 권장.' },
                { n: '🔁 추가 여유', d: '시공 미숙·셀프 시공은 +5% 추가 권장. 보수용 1~2개 남겨두기.' },
                { n: '🌡️ 자재 적응', d: 'PVC·MDF는 시공 24시간 전부터 시공할 방에 두기 (변형 방지).' },
              ].map((g, i) => (
                <div key={i} className={s.guideRow}>
                  <p className={s.guideRowTitle}>{g.n}</p>
                  <p className={s.guideRowDesc}>{g.d}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
