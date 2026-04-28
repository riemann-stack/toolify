'use client'

import { useMemo, useState } from 'react'
import styles from './flooring.module.css'

/* ─────────────────────────────────────────────────────────
 * 바닥재 종류 (한국 표준)
 * unitType:
 *   - box: 박스 단위 (강화·강마루·원목·데코타일)
 *   - tile: 타일 단위 (도기·자기 60×60)
 *   - roll: 롤 단위 (장판) — 폭 1.8m, 길이 m 단위
 * ───────────────────────────────────────────────────────── */
interface FlooringType {
  id: string
  name: string
  icon: string
  unitType: 'box' | 'tile' | 'roll'
  unitArea: number          // ㎡/단위
  unitLabel: string         // '박스' | '장' | '미터'
  rollWidth?: number        // m (롤 전용)
  tileSize?: string         // '60 × 60cm' (타일 전용)
  avgPrice: number          // 1㎡당 원
  badge: string
  badgeCls: string
  cls: string
  note: string
}
const FLOORING_TYPES: FlooringType[] = [
  { id: 'vinyl',      name: '장판 (PVC)',     icon: '📜', unitType: 'roll', unitArea: 1.8, unitLabel: '미터',
    rollWidth: 1.8, avgPrice: 12000, badge: '저렴',     badgeCls: 'bgVinyl',     cls: 'flVinyl',      note: '공동주택 가장 일반적' },
  { id: 'laminate',   name: '강화마루',        icon: '🪵', unitType: 'box',  unitArea: 2.0, unitLabel: '박스',
    avgPrice: 28000, badge: '표준', badgeCls: 'bgLaminate', cls: 'flLaminate', note: 'HDF + 데코필름, 콜리지·층간소음↓' },
  { id: 'engineered', name: '강마루',          icon: '🪵', unitType: 'box',  unitArea: 2.0, unitLabel: '박스',
    avgPrice: 45000, badge: '고급', badgeCls: 'bgEngineered', cls: 'flEngineered', note: '천연무늬목 + 합판, 천연감 우수' },
  { id: 'hardwood',   name: '원목마루',        icon: '🌳', unitType: 'box',  unitArea: 1.5, unitLabel: '박스',
    avgPrice: 80000, badge: '프리미엄', badgeCls: 'bgHardwood', cls: 'flHardwood', note: '천연원목, 보수 가능' },
  { id: 'decoTile',   name: '데코타일 (LVT)',  icon: '⬜',  unitType: 'box',  unitArea: 2.5, unitLabel: '박스',
    avgPrice: 25000, badge: '방수', badgeCls: 'bgDecoTile',   cls: 'flDecoTile',   note: '비닐 타일, 디자인 다양' },
  { id: 'porcelain',  name: '도기·자기 타일', icon: '🟫', unitType: 'tile', unitArea: 0.36, unitLabel: '장',
    tileSize: '60 × 60cm', avgPrice: 35000, badge: '내구', badgeCls: 'bgPorcelain', cls: 'flPorcelain', note: '욕실·주방, 내수성·내구성' },
  { id: 'custom',     name: '직접 입력',       icon: '⚙️', unitType: 'box',  unitArea: 2.0, unitLabel: '단위',
    avgPrice: 30000, badge: '',     badgeCls: 'bgVinyl',      cls: 'flCustom',     note: '' },
]

/* 한국 브랜드 프리셋 */
const BRANDS = [
  { id: 'kcc',      label: 'KCC (스위첸·홈씨씨)',  boxArea: 2.0, cls: 'brandKcc' },
  { id: 'lg',       label: 'LG하우시스 (지인)',    boxArea: 2.0, cls: 'brandLg' },
  { id: 'hansol',   label: '한솔홈데코',            boxArea: 2.0, cls: 'brandHansol' },
  { id: 'donghwa',  label: '동화자연마루',          boxArea: 2.2, cls: 'brandDonghwa' },
  { id: 'pungsan',  label: '풍산우드',              boxArea: 1.7, cls: 'brandPungsan' },
]

/* 시공 방식 4종 */
const INSTALL_METHODS = [
  { id: 'parallel',    name: '평행 시공',     loss: 0,  hint: '+0%',  cls: 'mParallel' },
  { id: 'diagonal',    name: '대각선',         loss: 5,  hint: '+5%',  cls: 'mDiagonal' },
  { id: 'herringbone', name: '헤링본',         loss: 10, hint: '+10%', cls: 'mHerringbone' },
  { id: 'chevron',     name: '쉐브론',         loss: 15, hint: '+15%', cls: 'mChevron' },
] as const

const PYUNG_TO_M2 = 3.3058

/* 유틸 */
function n(v: string | number, min = 0): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < min) return min
  return x
}
function fmt(v: number, dec = 0): string {
  return (Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)).toLocaleString('ko-KR')
}
function fmtKRW(amount: number): string {
  const v = Math.round(amount)
  if (v === 0) return '0원'
  const sign = v < 0 ? '-' : ''
  const abs = Math.abs(v)
  const eok = Math.floor(abs / 100_000_000)
  const man = Math.floor((abs % 100_000_000) / 10_000)
  const won = abs % 10_000
  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString('ko-KR')}억`)
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`)
  if (won > 0 && eok === 0 && man === 0) parts.push(`${won.toLocaleString('ko-KR')}`)
  if (parts.length === 0) return '0원'
  return `${sign}${parts.join(' ')}원`
}
function parseComma(s: string): number {
  const cleaned = s.replace(/[^0-9.-]/g, '')
  const v = Number(cleaned)
  return Number.isFinite(v) ? v : 0
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
type TabId = 'simple' | 'detail' | 'quote'
type SizeMode = 'pyung' | 'meter'

export default function FlooringClient() {
  const [tab, setTab] = useState<TabId>('simple')

  /* 공간 정보 */
  const [sizeMode, setSizeMode] = useState<SizeMode>('pyung')
  const [pyung, setPyung] = useState(15)
  const [pyungCustom, setPyungCustom] = useState<number | null>(null)
  const [widthM, setWidthM]   = useState('5.0')
  const [lengthM, setLengthM] = useState('4.0')

  /* 바닥재 */
  const [flId, setFlId] = useState('laminate')
  const [brandId, setBrandId] = useState<string | null>(null)
  const [customUnitArea, setCustomUnitArea] = useState(2.0)
  const [customPrice, setCustomPrice] = useState(30000)

  /* 시공 방식 + 로스율 */
  const [methodId, setMethodId] = useState<typeof INSTALL_METHODS[number]['id']>('parallel')
  const [lossPct, setLossPct] = useState(10)

  /* 탭 2: 방별 */
  interface RoomInput {
    id: string; name: string
    width: number; length: number
    flooringId: string
    methodId: typeof INSTALL_METHODS[number]['id']
    lossPct: number
  }
  function makeRoom(name: string, w = 5, l = 4): RoomInput {
    return {
      id: String(Date.now() + Math.random()),
      name, width: w, length: l,
      flooringId: 'laminate',
      methodId: 'parallel',
      lossPct: 10,
    }
  }
  const [rooms, setRooms] = useState<RoomInput[]>([
    makeRoom('거실', 6, 4),
    makeRoom('안방', 4, 4),
  ])

  /* 탭 3 견적 */
  const [pricePerSqmStr, setPricePerSqmStr] = useState('45000')
  const [adhesiveCostPerSqm, setAdhesiveCostPerSqm] = useState(5000)
  const [moldingMeter, setMoldingMeter] = useState(20)
  const [moldingPricePerM, setMoldingPricePerM] = useState(2000)
  const [protectCost, setProtectCost] = useState(30000)
  const [proLaborPerPyeong, setProLaborPerPyeong] = useState(60000)
  const [isHerringbone, setIsHerringbone] = useState(false)

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* ─── 면적 ─── */
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

  const fl = FLOORING_TYPES.find(f => f.id === flId)!
  const effectiveUnitArea = flId === 'custom' ? customUnitArea
    : (brandId ? (BRANDS.find(b => b.id === brandId)?.boxArea ?? fl.unitArea) : fl.unitArea)
  const effectivePrice = flId === 'custom' ? customPrice : fl.avgPrice

  const method = INSTALL_METHODS.find(m => m.id === methodId)!

  /* ─── 핵심 계산 ─── */
  const calc = useMemo(() => {
    const baseArea = dims.area
    const totalLossPct = lossPct + method.loss
    const requiredArea = baseArea * (1 + totalLossPct / 100)
    const requiredUnits = effectiveUnitArea > 0 ? Math.ceil(requiredArea / effectiveUnitArea) : 0
    const totalPurchasedArea = requiredUnits * effectiveUnitArea
    const surplusArea = totalPurchasedArea - baseArea

    const materialCost = baseArea * effectivePrice
    const lossCost = (totalPurchasedArea - baseArea) * effectivePrice
    const totalCost = totalPurchasedArea * effectivePrice

    /* 장판은 미터 단위로 표기 — 1롤 길이 = unitArea / rollWidth 가정 */
    let displayUnitDesc = ''
    if (fl.unitType === 'roll' && fl.rollWidth) {
      // 장판: 폭 1.8m × 필요 길이 m
      const requiredMeters = Math.ceil(requiredArea / fl.rollWidth * 10) / 10
      displayUnitDesc = `폭 ${fl.rollWidth}m × ${requiredMeters}m 길이 (${requiredArea.toFixed(1)}㎡)`
    } else if (fl.unitType === 'tile') {
      displayUnitDesc = `${fl.tileSize ?? ''} 타일 ${requiredUnits}장`
    } else {
      displayUnitDesc = `1박스 ${effectiveUnitArea}㎡`
    }

    return {
      baseArea, totalLossPct, requiredArea,
      requiredUnits, totalPurchasedArea, surplusArea,
      materialCost, lossCost, totalCost,
      displayUnitDesc,
    }
  }, [dims.area, effectiveUnitArea, lossPct, method.loss, effectivePrice, fl])

  /* 빠른 참조표 (선택 바닥재 기준 평수별) */
  const refTable = useMemo(() => {
    const pyOpts = [5, 7, 10, 15, 20, 24, 30]
    return pyOpts.map(p => {
      const area = p * PYUNG_TO_M2
      const reqArea = area * (1 + (lossPct + method.loss) / 100)
      const units = effectiveUnitArea > 0 ? Math.ceil(reqArea / effectiveUnitArea) : 0
      return { p, area, units }
    })
  }, [effectiveUnitArea, lossPct, method.loss])

  /* ─── 탭 2 방별 계산 ─── */
  const t2Rooms = useMemo(() => {
    return rooms.map(r => {
      const area = r.width * r.length
      const flT = FLOORING_TYPES.find(f => f.id === r.flooringId)!
      const m = INSTALL_METHODS.find(x => x.id === r.methodId)!
      const totalLoss = r.lossPct + m.loss
      const reqArea = area * (1 + totalLoss / 100)
      const units = flT.unitArea > 0 ? Math.ceil(reqArea / flT.unitArea) : 0
      const cost = units * flT.unitArea * flT.avgPrice
      return {
        id: r.id, name: r.name, area,
        flooringName: flT.name,
        unitLabel: flT.unitLabel,
        methodName: m.name,
        units, cost,
      }
    })
  }, [rooms])

  const t2Total = useMemo(() => {
    return t2Rooms.reduce(
      (acc, r) => ({ area: acc.area + r.area, units: acc.units + r.units, cost: acc.cost + r.cost }),
      { area: 0, units: 0, cost: 0 }
    )
  }, [t2Rooms])

  /* ─── 탭 3 견적 ─── */
  const usedArea = tab === 'detail' ? t2Total.area : calc.baseArea
  const usedReqArea = tab === 'detail'
    ? rooms.reduce((s, r) => {
        const a = r.width * r.length
        const m = INSTALL_METHODS.find(x => x.id === r.methodId)!
        return s + a * (1 + (r.lossPct + m.loss) / 100)
      }, 0)
    : calc.requiredArea
  const usedPyung = usedArea / PYUNG_TO_M2
  const pricePerSqm = parseComma(pricePerSqmStr)
  const materialCostQuote = usedReqArea * pricePerSqm
  const adhesiveTotal = usedArea * adhesiveCostPerSqm
  const moldingTotal = moldingMeter * moldingPricePerM
  const selfTotal = materialCostQuote + adhesiveTotal + moldingTotal + protectCost
  const proLaborMultiplier = isHerringbone ? 1.5 : 1.0
  const proLaborTotal = usedPyung * proLaborPerPyeong * proLaborMultiplier
  const proTotal = materialCostQuote + adhesiveTotal + moldingTotal + proLaborTotal
  const selfPerPyung = usedPyung > 0 ? selfTotal / usedPyung : 0
  const proPerPyung = usedPyung > 0 ? proTotal / usedPyung : 0

  /* 바닥재 변경 시 평균 가격 자동 */
  function selectFlooring(id: string) {
    setFlId(id)
    setBrandId(null)
    const f = FLOORING_TYPES.find(x => x.id === id)
    if (f) {
      setPricePerSqmStr(String(f.avgPrice))
      if (id === 'custom') setCustomPrice(f.avgPrice)
    }
  }
  function selectBrand(id: string) {
    setBrandId(id === brandId ? null : id)
  }

  /* 방 추가/삭제·수정 */
  function addRoom() {
    if (rooms.length >= 10) return
    setRooms([...rooms, makeRoom(`방 ${rooms.length + 1}`)])
  }
  function removeRoom(id: string) { setRooms(rooms.filter(r => r.id !== id)) }
  function updateRoom(id: string, patch: Partial<RoomInput>) {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...patch } : r))
  }

  /* 결과 복사 */
  function handleCopy() {
    const lines: string[] = []
    if (tab === 'simple') {
      lines.push(
        '🪵 바닥재 소요량 계산 결과',
        `방: ${dims.width.toFixed(2)} × ${dims.length.toFixed(2)}m (${fmt(dims.area)}㎡, ${fmt(dims.area / PYUNG_TO_M2, 1)}평)`,
        `바닥재: ${fl.name} (${calc.displayUnitDesc})`,
        `시공 방식: ${method.name} (로스 +${method.loss}%) + 추가 로스율 ${lossPct}% = 총 ${calc.totalLossPct}%`,
        `필요 ${fl.unitLabel}: ${calc.requiredUnits}${fl.unitLabel} (${fmt(calc.totalPurchasedArea)}㎡)`,
        `자재비: ${fmtKRW(calc.totalCost)}`,
      )
    } else if (tab === 'detail') {
      lines.push('🪵 바닥재 소요량 (방별)')
      t2Rooms.forEach(r => {
        lines.push(`  ${r.name}: ${fmt(r.area)}㎡ ${r.flooringName} → ${r.units}${r.unitLabel} (${fmtKRW(r.cost)})`)
      })
      lines.push(`합계: ${fmt(t2Total.area)}㎡ → ${t2Total.units}단위 (${fmtKRW(t2Total.cost)})`)
    } else {
      lines.push(
        '🪵 바닥재 견적',
        `${fl.name} ${fmt(usedReqArea)}㎡ × ${fmt(pricePerSqm)}원 = ${fmtKRW(materialCostQuote)}`,
        `셀프 자재 합계: ${fmtKRW(selfTotal)}`,
        `전문 시공 합계: ${fmtKRW(proTotal)}`,
      )
    }
    lines.push('youtil.kr/tools/interior/flooring')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  const pyungOptions = [5, 7, 10, 12, 15, 18, 20, 22, 25, 28, 30, 33, 35, 40]

  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 계산기는 한국 표준 박스 면적·평균 단가 기준 참고용</strong>입니다.
        실제 박스 면적은 브랜드·제품별 1.7~2.4㎡로 다양하며, 가격은 시기·매장에 따라 변동됩니다. 정확한 견적은 시공 전문가와 상담하세요.
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'simple' ? styles.tabActive : ''}`} onClick={() => setTab('simple')}>간편 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'detail' ? styles.tabActive : ''}`} onClick={() => setTab('detail')}>상세 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'quote' ? styles.tabActive : ''}`}  onClick={() => setTab('quote')}>비용 견적</button>
      </div>

      {/* ────────────── 탭 1: 간편 ────────────── */}
      {tab === 'simple' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>방 정보</span></div>
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
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>바닥재 종류</span>
              <span className={styles.cardLabelHint}>한국 표준</span>
            </div>
            <div className={styles.flooringGrid}>
              {FLOORING_TYPES.map(f => (
                <button key={f.id} type="button" className={`${styles.flooringCard} ${styles[f.cls]} ${flId === f.id ? styles.flActive : ''}`} onClick={() => selectFlooring(f.id)}>
                  <span className="icon">{f.icon}</span>
                  <p className={styles.flooringName}>{f.name}</p>
                  {f.unitType === 'box' && f.id !== 'custom' && <p className={styles.flooringSpec}>1박스 {f.unitArea}㎡</p>}
                  {f.unitType === 'tile' && <p className={styles.flooringSpec}>{f.tileSize}</p>}
                  {f.unitType === 'roll' && <p className={styles.flooringSpec}>폭 {f.rollWidth}m</p>}
                  {f.badge && <span className={`${styles.flooringBadge} ${styles[f.badgeCls]}`}>{f.badge}</span>}
                </button>
              ))}
            </div>

            {flId === 'custom' && (
              <div className={styles.customSpecRow}>
                <div>
                  <span className={styles.subLabel}>1박스/단위 면적 (㎡)</span>
                  <input className={styles.smallInput} type="number" step={0.1} min={0.1} value={customUnitArea} onChange={e => setCustomUnitArea(n(e.target.value, 0.1))} />
                </div>
                <div>
                  <span className={styles.subLabel}>1㎡당 가격</span>
                  <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(customPrice, 0)} onChange={e => setCustomPrice(parseComma(e.target.value))} />
                </div>
              </div>
            )}

            {(flId === 'laminate' || flId === 'engineered' || flId === 'hardwood') && (
              <>
                <span className={styles.subLabel} style={{ marginTop: 14 }}>한국 브랜드 (박스 면적 보정)</span>
                <div className={styles.brandRow}>
                  {BRANDS.map(b => (
                    <button key={b.id} type="button" className={`${styles.brandBtn} ${styles[b.cls]} ${brandId === b.id ? styles.brandActive : ''}`} onClick={() => selectBrand(b.id)}>
                      {b.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
                  현재 적용 — <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>1박스 {effectiveUnitArea}㎡</strong>
                  {brandId && ` (${BRANDS.find(b => b.id === brandId)?.label})`}
                </p>
              </>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>시공 방식</span>
              <span className={styles.cardLabelHint}>방식별 추가 로스</span>
            </div>
            <div className={styles.methodGrid}>
              {INSTALL_METHODS.map(m => {
                /* 미니 SVG 방식 표현 */
                const Icon = () => {
                  if (m.id === 'parallel') return (
                    <svg width="40" height="32" viewBox="0 0 40 32"><g stroke={methodId === m.id ? 'var(--accent)' : 'var(--muted)'} strokeWidth="1.5" fill="none">
                      <line x1="2" y1="6"  x2="38" y2="6"  /><line x1="2" y1="12" x2="38" y2="12" /><line x1="2" y1="18" x2="38" y2="18" /><line x1="2" y1="24" x2="38" y2="24" />
                    </g></svg>
                  )
                  if (m.id === 'diagonal') return (
                    <svg width="40" height="32" viewBox="0 0 40 32"><g stroke={methodId === m.id ? 'var(--accent)' : 'var(--muted)'} strokeWidth="1.5" fill="none">
                      <line x1="2" y1="2"  x2="32" y2="32" /><line x1="10" y1="2" x2="38" y2="28" /><line x1="2" y1="14" x2="20" y2="32" />
                    </g></svg>
                  )
                  if (m.id === 'herringbone') return (
                    <svg width="40" height="32" viewBox="0 0 40 32"><g stroke={methodId === m.id ? '#FF8C3E' : 'var(--muted)'} strokeWidth="1.5" fill="none">
                      <polyline points="6,4 14,12 6,20" /><polyline points="14,12 22,4 30,12 22,20 30,28" />
                      <polyline points="22,20 30,28 22,32" />
                    </g></svg>
                  )
                  return (
                    <svg width="40" height="32" viewBox="0 0 40 32"><g stroke={methodId === m.id ? '#FF6B6B' : 'var(--muted)'} strokeWidth="1.5" fill="none">
                      <polyline points="6,4 14,16 6,28" /><polyline points="22,4 30,16 22,28" />
                      <polyline points="14,16 22,16" />
                    </g></svg>
                  )
                }
                return (
                  <button key={m.id} type="button" className={`${styles.methodBtn} ${styles[m.cls]} ${methodId === m.id ? styles.mActive : ''}`} onClick={() => setMethodId(m.id)}>
                    <Icon />
                    {m.name}
                    <small className={styles.methodLossLabel}>{m.hint}</small>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>로스율 (여유분)</span>
              <span className={styles.cardLabelHint}>10% 한국 표준</span>
            </div>
            <div className={styles.lossGrid}>
              <button type="button" className={`${styles.lossBtn} ${styles.lossSafe} ${lossPct === 5 ? styles.lossActive : ''}`}  onClick={() => setLossPct(5)}><small>5%</small>표준 직사각형</button>
              <button type="button" className={`${styles.lossBtn} ${styles.lossStd} ${lossPct === 10 ? styles.lossActive : ''}`}  onClick={() => setLossPct(10)}><small>10%</small>한국 표준</button>
              <button type="button" className={`${styles.lossBtn} ${styles.lossWarn} ${lossPct === 15 ? styles.lossActive : ''}`} onClick={() => setLossPct(15)}><small>15%</small>큰 박스·헤링본</button>
            </div>
          </div>

          {/* HERO */}
          <div className={styles.hero}>
            <p className={styles.heroLead}>필요한 {fl.unitLabel}</p>
            <p className={styles.heroNum}>{calc.requiredUnits}<span className={styles.heroUnit}>{fl.unitLabel}</span></p>
            <p className={styles.heroSub}>
              {fl.name} <strong className={styles.heroSubAccent}>{calc.displayUnitDesc}</strong> · {method.name} + 로스 {calc.totalLossPct}%
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>면적·{fl.unitLabel} 분석</span></div>
            <table className={styles.analysisTable}>
              <tbody>
                <tr><td>시공 면적</td><td>{fmt(dims.area)}㎡ ({fmt(dims.area / PYUNG_TO_M2, 1)}평)</td></tr>
                <tr><td>시공 방식 ({method.name})</td><td>로스 +{method.loss}%</td></tr>
                <tr className={styles.addRow}><td>로스율 +{lossPct}% 추가</td><td>+{fmt(dims.area * (lossPct + method.loss) / 100)}㎡</td></tr>
                <tr className={styles.totalRow}><td>필요 시공 면적</td><td>{fmt(calc.requiredArea)}㎡</td></tr>
                <tr><td>1{fl.unitLabel} 면적</td><td>{effectiveUnitArea}㎡</td></tr>
                <tr className={styles.totalRow}><td>필요 {fl.unitLabel}</td><td>{calc.requiredUnits}{fl.unitLabel}</td></tr>
                <tr><td>실제 구매 면적</td><td>{fmt(calc.totalPurchasedArea)}㎡</td></tr>
                <tr><td>남는 면적</td><td>{fmt(calc.surplusArea)}㎡</td></tr>
              </tbody>
            </table>
          </div>

          {/* 비용 카드 */}
          <div className={styles.costCard}>
            <div className={styles.cardLabel} style={{ color: 'var(--accent)', marginBottom: 6 }}>
              <span>💰 자재비 견적</span>
              <span className={styles.cardLabelHint}>{fmt(effectivePrice)}원/㎡</span>
            </div>
            <div className={styles.costRow}><span>시공 면적 비용 ({fmt(dims.area)}㎡)</span><strong>{fmtKRW(calc.materialCost)}</strong></div>
            <div className={styles.costRow}><span>로스 추가 비용 (+{fmt(calc.surplusArea)}㎡)</span><strong>{fmtKRW(calc.lossCost)}</strong></div>
            <div className={`${styles.costRow} ${styles.totalCost}`}><span>총 자재비</span><strong>{fmtKRW(calc.totalCost)}</strong></div>
          </div>

          {/* 평면도 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>평면도 (방 + 시공 방식)</span>
              <span className={styles.cardLabelHint}>박스 배치 시뮬레이션</span>
            </div>
            <div className={styles.floorPlanWrap}>
              {(() => {
                const VBW = 360, VBH = 240, padding = 32
                const w = dims.width, l = dims.length
                if (w <= 0 || l <= 0) return null
                const ratio = w / l
                let drawW = VBW - padding * 2
                let drawH = VBH - padding * 2
                if (ratio > drawW / drawH) drawH = drawW / ratio
                else drawW = drawH * ratio
                const x0 = (VBW - drawW) / 2
                const y0 = (VBH - drawH) / 2

                // 박스 패턴 생성
                const patterns: React.ReactNode[] = []
                if (methodId === 'parallel') {
                  // 가로 줄 박스
                  const boxH = Math.max(8, drawH / Math.max(4, Math.ceil(l)))
                  for (let y = 0; y < drawH; y += boxH) {
                    const stagger = Math.floor(y / boxH) % 2 === 0 ? 0 : drawW * 0.15
                    let x = stagger
                    while (x < drawW) {
                      const bw = Math.min(drawW * 0.3, drawW - x)
                      patterns.push(<rect key={`p-${y}-${x}`} x={x0 + x} y={y0 + y} width={bw} height={Math.min(boxH, drawH - y)} fill="rgba(232,151,87,0.10)" stroke="#FF8C3E" strokeWidth={0.5} opacity={0.7} />)
                      x += bw
                    }
                  }
                } else if (methodId === 'diagonal') {
                  // 대각 줄
                  for (let i = -Math.floor(drawH); i < drawW + drawH; i += 16) {
                    patterns.push(<line key={`d-${i}`} x1={x0 + i} y1={y0} x2={x0 + i + drawH} y2={y0 + drawH} stroke="#FFB870" strokeWidth={1} opacity={0.6} />)
                  }
                } else if (methodId === 'herringbone') {
                  // V 패턴
                  const sz = 16
                  for (let r = 0; r < drawH / sz; r++) {
                    for (let c = 0; c < drawW / sz; c++) {
                      const px = x0 + c * sz
                      const py = y0 + r * sz
                      const dirL = (r + c) % 2 === 0
                      patterns.push(<line key={`h-${r}-${c}`} x1={px} y1={py + (dirL ? sz : 0)} x2={px + sz} y2={py + (dirL ? 0 : sz)} stroke="#FF8C3E" strokeWidth={1} opacity={0.6} />)
                    }
                  }
                } else {
                  // 쉐브론 — V자
                  const sz = 18
                  for (let r = 0; r < drawH / sz; r++) {
                    for (let c = 0; c < drawW / sz; c++) {
                      const px = x0 + c * sz
                      const py = y0 + r * sz
                      patterns.push(
                        <g key={`c-${r}-${c}`}>
                          <line x1={px} y1={py + sz} x2={px + sz / 2} y2={py} stroke="#FF6B6B" strokeWidth={1} opacity={0.6} />
                          <line x1={px + sz / 2} y1={py} x2={px + sz} y2={py + sz} stroke="#FF6B6B" strokeWidth={1} opacity={0.6} />
                        </g>
                      )
                    }
                  }
                }

                return (
                  <svg className={styles.floorPlanSvg} viewBox={`0 0 ${VBW} ${VBH}`} aria-hidden="true">
                    <defs>
                      <clipPath id="roomClip">
                        <rect x={x0} y={y0} width={drawW} height={drawH} />
                      </clipPath>
                    </defs>
                    {/* 방 배경 */}
                    <rect x={x0} y={y0} width={drawW} height={drawH} fill="rgba(232,151,87,0.05)" stroke="#fff" strokeWidth={2} />
                    {/* 박스 패턴 (방 안에서만) */}
                    <g clipPath="url(#roomClip)">{patterns}</g>
                    {/* 치수 */}
                    <text x={x0 + drawW / 2} y={y0 - 8} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="monospace">{w.toFixed(1)}m</text>
                    <text x={x0 - 8} y={y0 + drawH / 2 + 4} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="monospace">{l.toFixed(1)}m</text>
                    <text x={x0 + drawW / 2} y={y0 + drawH + 22} textAnchor="middle" fill="var(--accent)" fontSize="11" fontFamily="monospace" fontWeight={700}>
                      {method.name} ({calc.requiredUnits}{fl.unitLabel})
                    </text>
                  </svg>
                )
              })()}
            </div>
          </div>

          {/* 빠른 참조표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>📋 평수별 빠른 참조</span>
              <span className={styles.cardLabelHint}>{fl.name} ({effectiveUnitArea}㎡/{fl.unitLabel}) · 로스 {lossPct + method.loss}%</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.refTable}>
                <thead>
                  <tr><th>평수</th><th>면적</th><th>필요 {fl.unitLabel}</th></tr>
                </thead>
                <tbody>
                  {refTable.map((r, i) => (
                    <tr key={i}>
                      <td>{r.p}평</td>
                      <td>{fmt(r.area, 1)}㎡</td>
                      <td>{r.units}{fl.unitLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ────────────── 탭 2: 상세 (방별) ────────────── */}
      {tab === 'detail' && (
        <>
          {rooms.map(r => {
            const calc = t2Rooms.find(c => c.id === r.id)!
            return (
              <div key={r.id} className={styles.roomBlock}>
                <div className={styles.roomHeader}>
                  <input className={styles.roomHeaderInput} type="text" value={r.name} onChange={e => updateRoom(r.id, { name: e.target.value || '방' })} />
                  {rooms.length > 1 && (
                    <button type="button" className={styles.removeRoomBtn} onClick={() => removeRoom(r.id)}>방 삭제</button>
                  )}
                </div>

                <div className={styles.roomDimRow}>
                  <div>
                    <span className={styles.subLabel}>가로 (m)</span>
                    <input className={styles.smallInput} type="number" step={0.1} min={0} value={r.width} onChange={e => updateRoom(r.id, { width: n(e.target.value) })} />
                  </div>
                  <div>
                    <span className={styles.subLabel}>세로 (m)</span>
                    <input className={styles.smallInput} type="number" step={0.1} min={0} value={r.length} onChange={e => updateRoom(r.id, { length: n(e.target.value) })} />
                  </div>
                </div>

                <div className={styles.roomTypeRow}>
                  <div>
                    <span className={styles.subLabel}>바닥재</span>
                    <select className={styles.roomMiniSelect} value={r.flooringId} onChange={e => updateRoom(r.id, { flooringId: e.target.value })}>
                      {FLOORING_TYPES.filter(f => f.id !== 'custom').map(f => (
                        <option key={f.id} value={f.id}>{f.icon} {f.name} (1{f.unitLabel} {f.unitArea}㎡)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.roomDimRow}>
                  <div>
                    <span className={styles.subLabel}>시공 방식</span>
                    <select className={styles.roomMiniSelect} value={r.methodId} onChange={e => updateRoom(r.id, { methodId: e.target.value as RoomInput['methodId'] })}>
                      {INSTALL_METHODS.map(m => <option key={m.id} value={m.id}>{m.name} ({m.hint})</option>)}
                    </select>
                  </div>
                  <div>
                    <span className={styles.subLabel}>로스율</span>
                    <select className={styles.roomMiniSelect} value={r.lossPct} onChange={e => updateRoom(r.id, { lossPct: Number(e.target.value) })}>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={15}>15%</option>
                    </select>
                  </div>
                </div>

                <div className={styles.roomMiniResult}>
                  <div>
                    <p>면적</p>
                    <p>{fmt(calc.area, 1)}㎡</p>
                  </div>
                  <div>
                    <p>필요 {calc.unitLabel}</p>
                    <p>{calc.units}{calc.unitLabel}</p>
                  </div>
                  <div>
                    <p>비용</p>
                    <p>{fmtKRW(calc.cost)}</p>
                  </div>
                </div>
              </div>
            )
          })}

          {rooms.length < 10 && (
            <button type="button" className={styles.addBtn} onClick={addRoom}>+ 방 추가 ({rooms.length}/10)</button>
          )}

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>전체 합산</span>
              <span className={styles.cardLabelHint}>{rooms.length}개 방</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.summaryTable}>
                <thead>
                  <tr><th>방</th><th>면적</th><th>바닥재</th><th>단위</th><th>비용</th></tr>
                </thead>
                <tbody>
                  {t2Rooms.map(r => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{fmt(r.area, 1)}㎡</td>
                      <td>{r.flooringName}</td>
                      <td>{r.units}{r.unitLabel}</td>
                      <td>{fmtKRW(r.cost)}</td>
                    </tr>
                  ))}
                  <tr className={styles.summaryTotal}>
                    <td>합계</td>
                    <td>{fmt(t2Total.area, 1)}㎡</td>
                    <td>—</td>
                    <td>{t2Total.units}단위</td>
                    <td>{fmtKRW(t2Total.cost)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.totalPyungLine}>
              총 시공 — <strong>{fmt(t2Total.area / PYUNG_TO_M2, 1)}평</strong>
            </div>
          </div>
        </>
      )}

      {/* ────────────── 탭 3: 견적 ────────────── */}
      {tab === 'quote' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>📋 자재 가격 가이드</span>
              <span className={styles.cardLabelHint}>한국 평균 (1㎡당)</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.priceGuideTable}>
                <thead>
                  <tr><th>바닥재</th><th>1㎡당 가격</th><th>추천 공간</th></tr>
                </thead>
                <tbody>
                  <tr><td>장판 (PVC)</td><td>8,000~15,000원</td><td>임대·저예산</td></tr>
                  <tr><td>강화마루</td><td>25,000~35,000원</td><td>일반 가정 표준</td></tr>
                  <tr><td>강마루</td><td>40,000~55,000원</td><td>중상위</td></tr>
                  <tr><td>원목마루</td><td>70,000~120,000원</td><td>고급</td></tr>
                  <tr><td>데코타일</td><td>20,000~35,000원</td><td>매장·욕실</td></tr>
                  <tr><td>도기 타일</td><td>30,000~60,000원</td><td>욕실·주방</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>견적 입력</span>
              <span className={styles.cardLabelHint}>{tab === 'quote' ? `시공 ${fmt(usedArea)}㎡ (${fmt(usedPyung, 1)}평)` : ''}</span>
            </div>

            <span className={styles.subLabel}>1㎡당 가격</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric"
                value={fmt(pricePerSqm, 0)}
                onChange={e => setPricePerSqmStr(parseComma(e.target.value).toString())} />
              <span className={styles.unit}>원/㎡</span>
            </div>

            <div style={{ height: 12 }} />
            <span className={styles.subLabel}>본드·접착제 (1㎡당)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={500} min={0} value={adhesiveCostPerSqm} onChange={e => setAdhesiveCostPerSqm(n(e.target.value))} />
              <span className={styles.unit}>원/㎡</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>몰딩·걸레받이 (m)</span>
            <div className={styles.roomDimRow}>
              <div>
                <span className={styles.subLabel}>길이 (m)</span>
                <input className={styles.smallInput} type="number" min={0} step={0.5} value={moldingMeter} onChange={e => setMoldingMeter(n(e.target.value))} />
              </div>
              <div>
                <span className={styles.subLabel}>m당 가격</span>
                <input className={styles.smallInput} type="number" min={0} step={500} value={moldingPricePerM} onChange={e => setMoldingPricePerM(n(e.target.value))} />
              </div>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>보양 시트·커버 (1회)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={5000} min={0} value={protectCost} onChange={e => setProtectCost(n(e.target.value))} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>전문 시공비 (평당)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={5000} min={0} value={proLaborPerPyeong} onChange={e => setProLaborPerPyeong(n(e.target.value))} />
              <span className={styles.unit}>원/평</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: 'var(--text)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isHerringbone} onChange={e => setIsHerringbone(e.target.checked)} style={{ accentColor: 'var(--accent)' }} />
              <span>헤링본·쉐브론 시공 (인건비 +50%)</span>
            </label>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>견적표</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.quoteTable}>
                <thead>
                  <tr><th>항목</th><th>단가</th><th>수량</th><th>합계</th></tr>
                </thead>
                <tbody>
                  <tr className={styles.selfRow}>
                    <td>{fl.name}</td>
                    <td>{fmt(pricePerSqm, 0)}원/㎡</td>
                    <td>{fmt(usedReqArea, 1)}㎡</td>
                    <td>{fmtKRW(materialCostQuote)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>본드·접착제</td>
                    <td>{fmt(adhesiveCostPerSqm, 0)}원/㎡</td>
                    <td>{fmt(usedArea, 1)}㎡</td>
                    <td>{fmtKRW(adhesiveTotal)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>몰딩·걸레받이</td>
                    <td>{fmt(moldingPricePerM, 0)}원/m</td>
                    <td>{moldingMeter}m</td>
                    <td>{fmtKRW(moldingTotal)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>보양 시트·커버</td>
                    <td>—</td>
                    <td>1회</td>
                    <td>{fmtKRW(protectCost)}</td>
                  </tr>
                  <tr className={styles.totalRowSelf}>
                    <td>🔧 셀프 자재 합계</td>
                    <td colSpan={2}></td>
                    <td>{fmtKRW(selfTotal)}</td>
                  </tr>
                  <tr className={styles.proRow}>
                    <td>전문 시공비 {isHerringbone ? '(+50%)' : ''}</td>
                    <td>{fmt(proLaborPerPyeong * proLaborMultiplier, 0)}원/평</td>
                    <td>{fmt(usedPyung, 1)}평</td>
                    <td>{fmtKRW(proLaborTotal)}</td>
                  </tr>
                  <tr className={styles.totalRowPro}>
                    <td>🏗️ 전문 시공 합계</td>
                    <td colSpan={2}></td>
                    <td>{fmtKRW(proTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.compareLine}>
            평당 비용 — 셀프 약 <strong>{fmt(selfPerPyung, 0)}원/평</strong> · 전문 약 <strong>{fmt(proPerPyung, 0)}원/평</strong>
            <br />한국 평균: 강화마루 5만원/평 · 강마루 6만원/평 · 원목 8만원/평 (전문 시공 인건비)
          </div>
        </>
      )}

      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}
