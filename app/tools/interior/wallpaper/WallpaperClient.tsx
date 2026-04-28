'use client'

import { useMemo, useState } from 'react'
import styles from './wallpaper.module.css'

/* ─────────────────────────────────────────────────────────
 * 벽지 종류 (한국 표준)
 * ───────────────────────────────────────────────────────── */
interface WallpaperType {
  id: string
  name: string
  width: number       // m
  rollLength: number  // m
  spec: string
  usage: string
  cls: string
  badgeCls?: string
  defaultPrice: number  // 1롤 가격 (원)
}
const WALLPAPER_TYPES: WallpaperType[] = [
  { id: 'silk',   name: '실크벽지', width: 1.06, rollLength: 15.6, spec: '폭 106cm × 길이 15.6m', usage: '주거용 일반', cls: 'wpSilk',   badgeCls: 'wpSilkBadge',   defaultPrice: 25000 },
  { id: 'sturdy', name: '합지벽지', width: 0.93, rollLength: 17.5, spec: '폭 93cm × 길이 17.5m',  usage: '저렴·셀프 입문', cls: 'wpSturdy', badgeCls: 'wpSturdyBadge', defaultPrice: 12000 },
  { id: 'pvc',    name: 'PVC벽지', width: 1.06, rollLength: 15.6, spec: '폭 106cm × 길이 15.6m', usage: '욕실·주방 방수', cls: 'wpPvc',    badgeCls: 'wpPvcBadge',    defaultPrice: 40000 },
  { id: 'custom', name: '직접 입력', width: 1.0,  rollLength: 15.0, spec: '폭·길이 직접',           usage: '',                cls: 'wpCustom',                          defaultPrice: 25000 },
]

/* 가격대 프리셋 */
const PRICE_TIERS = [
  { id: 'cheap',   label: '저렴',     price: 10000 },
  { id: 'normal',  label: '일반',     price: 25000 },
  { id: 'premium', label: '고급',     price: 45000 },
  { id: 'luxury',  label: '프리미엄', price: 80000 },
]

/* 창문·문 프리셋 */
const OPENING_PRESETS = [
  { id: 'none',  label: '창문 없음',     w: 0,   h: 0,   count: 0 },
  { id: 'small', label: '작은 창 1개',  w: 1.0, h: 1.2, count: 1 },
  { id: 'std',   label: '표준 창 1개',  w: 1.5, h: 1.5, count: 1 },
  { id: 'big1',  label: '큰 창 1개',    w: 2.0, h: 1.8, count: 1 },
  { id: 'big2',  label: '큰 창 2개',    w: 2.0, h: 1.8, count: 2 },
  { id: 'custom', label: '직접 입력',   w: 0,   h: 0,   count: 0 },
]

const PYUNG_TO_M2 = 3.3058

/* 유틸 */
function n(v: string | number, min = 0): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < min) return min
  return x
}
function fmt(v: number, dec = 1): string {
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
 * 핵심 계산
 * ───────────────────────────────────────────────────────── */
interface CalcInput {
  width: number
  length: number
  height: number
  windowCount: number
  windowW: number
  windowH: number
  doorCount: number
  doorW: number
  doorH: number
  wpWidth: number
  rollLength: number
  lossPct: number
  includeCeiling: boolean
}
function calcWallpaper(i: CalcInput) {
  const perimeter = (i.width + i.length) * 2
  const totalWallArea = perimeter * i.height
  const windowArea = i.windowCount * i.windowW * i.windowH
  const doorArea = i.doorCount * i.doorW * i.doorH
  const netWallArea = Math.max(0, totalWallArea - windowArea - doorArea)
  const ceilingArea = i.includeCeiling ? i.width * i.length : 0
  const totalArea = netWallArea + ceilingArea
  const requiredArea = totalArea * (1 + i.lossPct / 100)
  const areaPerRoll = i.wpWidth * i.rollLength
  const exactRolls = areaPerRoll > 0 ? requiredArea / areaPerRoll : 0
  const recommendedRolls = Math.ceil(exactRolls)
  // 장 수 기준
  const stripsPerRoll = Math.max(1, Math.floor(i.rollLength / Math.max(0.1, i.height)))
  const totalStripsNeeded = Math.ceil(perimeter / Math.max(0.1, i.wpWidth))
  const stripsRollsNeeded = Math.ceil(totalStripsNeeded / stripsPerRoll)
  return {
    perimeter, totalWallArea, windowArea, doorArea, netWallArea,
    ceilingArea, totalArea, requiredArea, areaPerRoll,
    exactRolls, recommendedRolls,
    stripsPerRoll, totalStripsNeeded, stripsRollsNeeded,
    finalRolls: Math.max(recommendedRolls, stripsRollsNeeded),
  }
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
type TabId = 'simple' | 'detail' | 'quote'
type SizeMode = 'pyung' | 'meter'
type WindowPresetId = typeof OPENING_PRESETS[number]['id']

export default function WallpaperClient() {
  const [tab, setTab] = useState<TabId>('simple')

  /* 공통 입력 (탭 1·2 결과와 탭 3 견적 모두 공유) */
  const [sizeMode, setSizeMode] = useState<SizeMode>('pyung')
  const [pyung, setPyung] = useState(15)
  const [pyungCustom, setPyungCustom] = useState<number | null>(null)
  const [widthM, setWidthM]   = useState('5.0')
  const [lengthM, setLengthM] = useState('4.0')
  const [heightM, setHeightM] = useState(2.4)

  const [winPreset, setWinPreset] = useState<WindowPresetId>('std')
  const [winCount, setWinCount] = useState(1)
  const [winW, setWinW] = useState(1.5)
  const [winH, setWinH] = useState(1.5)
  const [doorCount, setDoorCount] = useState(1)
  const [doorW, setDoorW] = useState(0.9)
  const [doorH, setDoorH] = useState(2.1)

  const [wpId, setWpId] = useState('silk')
  const [wpCustomW, setWpCustomW] = useState(1.0)
  const [wpCustomLen, setWpCustomLen] = useState(15.0)

  const [lossPct, setLossPct] = useState(10)
  const [includeCeiling, setIncludeCeiling] = useState(false)

  /* 탭 2: 방별 입력 */
  interface WallInput {
    id: string
    label: string
    wallW: number
    wallH: number
    openings: Array<{ id: string; type: 'window' | 'door'; w: number; h: number }>
  }
  interface RoomInput {
    id: string
    name: string
    walls: WallInput[]
    pointOnly: boolean
    pointWallId: string | null  // 포인트 도배 시 어느 벽인지
    includeCeiling: boolean
    ceilingW: number  // 천장 도배 시 가로
    ceilingL: number  // 천장 도배 시 세로
  }
  function makeWall(label: string, w = 4, h = 2.4): WallInput {
    return { id: String(Date.now() + Math.random()), label, wallW: w, wallH: h, openings: [] }
  }
  function makeRoom(name: string): RoomInput {
    return {
      id: String(Date.now() + Math.random()),
      name,
      walls: [
        makeWall('A — 정면', 5, 2.4),
        makeWall('B — 우측', 4, 2.4),
        makeWall('C — 후면', 5, 2.4),
        makeWall('D — 좌측', 4, 2.4),
      ],
      pointOnly: false,
      pointWallId: null,
      includeCeiling: false,
      ceilingW: 5,
      ceilingL: 4,
    }
  }
  const [rooms, setRooms] = useState<RoomInput[]>([
    { ...makeRoom('거실') },
  ])

  /* 탭 3: 견적 */
  const [pricePerRollStr, setPricePerRollStr] = useState('25000')
  const [priceTierId, setPriceTierId] = useState<string | null>('normal')
  const [pasteUnit, setPasteUnit] = useState(5000)   // 풀 1kg 가격
  const [toolCost, setToolCost]   = useState(30000)
  const [ladderCost, setLadderCost] = useState(20000)
  const [proLaborPerRoll, setProLaborPerRoll] = useState(30000)

  /* 복사 */
  const [copied, setCopied] = useState(false)

  /* ─── 평수 ↔ 가로·세로 ─── */
  const effectivePyung = pyungCustom ?? pyung

  const tab1Dims = useMemo(() => {
    if (sizeMode === 'pyung') {
      // 정사각형 가정으로 가로 = 세로 = √(평×3.3058)
      const m2 = effectivePyung * PYUNG_TO_M2
      const side = Math.sqrt(m2)
      return { width: side, length: side, area: m2 }
    }
    const w = n(widthM), l = n(lengthM)
    return { width: w, length: l, area: w * l }
  }, [sizeMode, effectivePyung, widthM, lengthM])

  /* 창문·문 프리셋 적용 */
  function applyWinPreset(id: WindowPresetId) {
    setWinPreset(id)
    const p = OPENING_PRESETS.find(x => x.id === id)!
    if (p.id !== 'custom') {
      setWinCount(p.count)
      setWinW(p.w)
      setWinH(p.h)
    }
  }

  /* 벽지 사양 */
  const wp = WALLPAPER_TYPES.find(t => t.id === wpId)!
  const wpWidth = wpId === 'custom' ? n(wpCustomW, 0.1) : wp.width
  const rollLength = wpId === 'custom' ? n(wpCustomLen, 1) : wp.rollLength

  /* ─── 탭 1 핵심 계산 ─── */
  const t1 = useMemo(() => calcWallpaper({
    width: tab1Dims.width,
    length: tab1Dims.length,
    height: heightM,
    windowCount: winCount,
    windowW: winW,
    windowH: winH,
    doorCount: doorCount,
    doorW: doorW,
    doorH: doorH,
    wpWidth, rollLength,
    lossPct,
    includeCeiling,
  }), [tab1Dims, heightM, winCount, winW, winH, doorCount, doorW, doorH, wpWidth, rollLength, lossPct, includeCeiling])

  /* ─── 탭 2 방별 계산 ─── */
  const t2Rooms = useMemo(() => {
    return rooms.map(r => {
      // 사용할 벽들 (포인트 도배 시 1면만)
      const wallsToUse = r.pointOnly && r.pointWallId
        ? r.walls.filter(w => w.id === r.pointWallId)
        : r.walls
      const totalWallArea = wallsToUse.reduce((sum, w) => sum + w.wallW * w.wallH, 0)
      const openingsArea = wallsToUse.reduce((sum, w) => {
        return sum + w.openings.reduce((s, o) => s + o.w * o.h, 0)
      }, 0)
      const netWallArea = Math.max(0, totalWallArea - openingsArea)
      const ceilingArea = r.includeCeiling ? r.ceilingW * r.ceilingL : 0
      const totalArea = netWallArea + ceilingArea
      const requiredArea = totalArea * (1 + lossPct / 100)
      const areaPerRoll = wpWidth * rollLength
      const rollsNeeded = areaPerRoll > 0 ? Math.ceil(requiredArea / areaPerRoll) : 0
      return { id: r.id, name: r.name, totalArea, requiredArea, rollsNeeded }
    })
  }, [rooms, wpWidth, rollLength, lossPct])

  const t2Total = useMemo(() => {
    return t2Rooms.reduce(
      (acc, r) => ({
        area: acc.area + r.totalArea,
        rolls: acc.rolls + r.rollsNeeded,
      }),
      { area: 0, rolls: 0 }
    )
  }, [t2Rooms])

  /* ─── 탭 3 견적 ─── */
  const usedRolls = tab === 'detail' ? t2Total.rolls : t1.finalRolls
  const usedArea = tab === 'detail' ? t2Total.area : t1.totalArea
  const pricePerRoll = parseComma(pricePerRollStr)
  const wpTotalCost = pricePerRoll * usedRolls
  const pasteKg = usedRolls * 3
  const pasteTotalCost = pasteKg * pasteUnit
  const selfTotal = wpTotalCost + pasteTotalCost + toolCost + ladderCost
  const proLaborTotal = proLaborPerRoll * usedRolls
  const proTotal = wpTotalCost + pasteTotalCost + proLaborTotal
  const usedPyung = usedArea / PYUNG_TO_M2
  const selfPerPyung = usedPyung > 0 ? selfTotal / usedPyung : 0
  const proPerPyung = usedPyung > 0 ? proTotal / usedPyung : 0

  function selectPriceTier(id: string) {
    setPriceTierId(id)
    const t = PRICE_TIERS.find(x => x.id === id)
    if (t) setPricePerRollStr(String(t.price))
  }

  /* ─── 방 추가/삭제·벽 수정 ─── */
  function addRoom() {
    if (rooms.length >= 10) return
    setRooms([...rooms, makeRoom(`방 ${rooms.length + 1}`)])
  }
  function removeRoom(id: string) {
    setRooms(rooms.filter(r => r.id !== id))
  }
  function updateRoom(id: string, patch: Partial<RoomInput>) {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...patch } : r))
  }
  function updateWall(roomId: string, wallId: string, patch: Partial<WallInput>) {
    setRooms(rooms.map(r => r.id === roomId
      ? { ...r, walls: r.walls.map(w => w.id === wallId ? { ...w, ...patch } : w) }
      : r))
  }
  function addOpening(roomId: string, wallId: string, type: 'window' | 'door') {
    setRooms(rooms.map(r => r.id === roomId
      ? {
        ...r,
        walls: r.walls.map(w => w.id === wallId
          ? {
            ...w,
            openings: [...w.openings, {
              id: String(Date.now() + Math.random()),
              type,
              w: type === 'window' ? 1.5 : 0.9,
              h: type === 'window' ? 1.5 : 2.1,
            }],
          }
          : w),
      }
      : r))
  }
  function removeOpening(roomId: string, wallId: string, openingId: string) {
    setRooms(rooms.map(r => r.id === roomId
      ? {
        ...r,
        walls: r.walls.map(w => w.id === wallId
          ? { ...w, openings: w.openings.filter(o => o.id !== openingId) }
          : w),
      }
      : r))
  }
  function updateOpening(roomId: string, wallId: string, openingId: string, patch: Partial<{ w: number; h: number; type: 'window' | 'door' }>) {
    setRooms(rooms.map(r => r.id === roomId
      ? {
        ...r,
        walls: r.walls.map(w => w.id === wallId
          ? { ...w, openings: w.openings.map(o => o.id === openingId ? { ...o, ...patch } : o) }
          : w),
      }
      : r))
  }

  /* 결과 복사 */
  function handleCopy() {
    const lines: string[] = []
    if (tab === 'simple') {
      lines.push(
        '🧱 도배 소요량 계산 결과',
        `방: ${effectivePyung}평 (가로 ${tab1Dims.width.toFixed(2)}m × 세로 ${tab1Dims.length.toFixed(2)}m × 높이 ${heightM}m)`,
        `벽지: ${wp.name} (폭 ${wpWidth}m × ${rollLength}m)`,
        `시공 면적: ${fmt(t1.netWallArea + t1.ceilingArea)}㎡ (로스율 ${lossPct}% 포함 ${fmt(t1.requiredArea)}㎡)`,
        `필요 롤: ${t1.finalRolls}롤`,
      )
    } else if (tab === 'detail') {
      lines.push('🧱 도배 소요량 (상세)')
      t2Rooms.forEach(r => {
        lines.push(`  ${r.name}: ${fmt(r.totalArea)}㎡ → ${r.rollsNeeded}롤`)
      })
      lines.push(`합계: ${fmt(t2Total.area)}㎡ → ${t2Total.rolls}롤`)
    } else {
      lines.push(
        '🧱 도배 견적',
        `벽지(${wp.name}) ${usedRolls}롤 × ${fmtKRW(pricePerRoll)} = ${fmtKRW(wpTotalCost)}`,
        `셀프 시공 합계: ${fmtKRW(selfTotal)}`,
        `전문 시공 합계: ${fmtKRW(proTotal)}`,
      )
    }
    lines.push('youtil.kr/tools/interior/wallpaper')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  /* 평수 옵션 */
  const pyungOptions = [5, 7, 10, 12, 15, 18, 20, 22, 25, 28, 30, 33, 35, 40]

  /* ────────────────────────────── 렌더 ────────────────────────────── */
  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 계산기는 한국 표준(실크 폭 106cm·합지 93cm) 기준 참고용</strong>입니다.
        실제 시공량은 벽지 패턴 리피트, 시공 방식, 시공자 숙련도에 따라 달라질 수 있으며 정확한 견적은 도배 전문가와 상담하세요.
      </div>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'simple' ? styles.tabActive : ''}`} onClick={() => setTab('simple')}>간편 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'detail' ? styles.tabActive : ''}`} onClick={() => setTab('detail')}>상세 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'quote' ? styles.tabActive : ''}`}  onClick={() => setTab('quote')}>비용 견적</button>
      </div>

      {/* ────────────── 탭 1: 간편 계산 ────────────── */}
      {tab === 'simple' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>방 크기</span></div>

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
                    <input
                      className={styles.smallInput}
                      type="number"
                      min={1}
                      max={300}
                      value={pyungCustom}
                      onChange={e => setPyungCustom(Math.max(1, Math.min(300, Number(e.target.value) || 1)))}
                    />
                  </div>
                )}
                <p className={styles.areaShow}>약 {fmt(tab1Dims.area)}㎡ (가로·세로 정사각형 가정)</p>
              </>
            ) : (
              <>
                <div className={styles.dimRow}>
                  <input className={styles.bigInput} type="number" min={0.1} step={0.1} value={widthM} onChange={e => setWidthM(e.target.value)} />
                  <span className={styles.dimSep}>×</span>
                  <input className={styles.bigInput} type="number" min={0.1} step={0.1} value={lengthM} onChange={e => setLengthM(e.target.value)} />
                </div>
                <p className={styles.areaShow}>약 {fmt(tab1Dims.area)}㎡ (≈ {fmt(tab1Dims.area / PYUNG_TO_M2, 1)}평)</p>
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
              <span>창문 · 문</span>
              <span className={styles.cardLabelHint}>차감 면적</span>
            </div>

            <span className={styles.subLabel}>창문 — 빠른 선택</span>
            <div className={styles.presetGrid}>
              {OPENING_PRESETS.map(p => (
                <button key={p.id} type="button" className={`${styles.presetBtn} ${winPreset === p.id ? styles.presetActive : ''}`} onClick={() => applyWinPreset(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            {winPreset === 'custom' && (
              <div className={styles.openingRow}>
                <div>
                  <span className={styles.subLabel}>창문 개수</span>
                  <input className={styles.smallInput} type="number" min={0} value={winCount} onChange={e => setWinCount(Math.max(0, Number(e.target.value) || 0))} />
                </div>
                <div>
                  <span className={styles.subLabel}>가로 (m)</span>
                  <input className={styles.smallInput} type="number" step={0.1} min={0} value={winW} onChange={e => setWinW(n(e.target.value))} />
                </div>
                <div>
                  <span className={styles.subLabel}>세로 (m)</span>
                  <input className={styles.smallInput} type="number" step={0.1} min={0} value={winH} onChange={e => setWinH(n(e.target.value))} />
                </div>
              </div>
            )}

            <div style={{ height: 14 }} />
            <span className={styles.subLabel}>문 (기본 0.9m × 2.1m)</span>
            <div className={styles.openingRow}>
              <div>
                <span className={styles.subLabel}>개수</span>
                <input className={styles.smallInput} type="number" min={0} value={doorCount} onChange={e => setDoorCount(Math.max(0, Number(e.target.value) || 0))} />
              </div>
              <div>
                <span className={styles.subLabel}>가로 (m)</span>
                <input className={styles.smallInput} type="number" step={0.1} min={0} value={doorW} onChange={e => setDoorW(n(e.target.value))} />
              </div>
              <div>
                <span className={styles.subLabel}>세로 (m)</span>
                <input className={styles.smallInput} type="number" step={0.1} min={0} value={doorH} onChange={e => setDoorH(n(e.target.value))} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ────────────── 공통: 벽지 종류 + 로스율 (탭 1·2 모두) ────────────── */}
      {tab !== 'quote' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>벽지 종류</span>
              <span className={styles.cardLabelHint}>한국 표준</span>
            </div>
            <div className={styles.wallpaperGrid}>
              {WALLPAPER_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.wallpaperCard} ${styles[t.cls]} ${wpId === t.id ? styles.wpActive : ''}`}
                  onClick={() => setWpId(t.id)}
                >
                  <p className={styles.wpName}>{t.name}</p>
                  <p className={styles.wpSpec}>{t.spec}</p>
                  {t.usage && t.badgeCls && (
                    <span className={`${styles.wpUsage} ${styles[t.badgeCls]}`}>{t.usage}</span>
                  )}
                </button>
              ))}
            </div>
            {wpId === 'custom' && (
              <div className={styles.customWpRow}>
                <div>
                  <span className={styles.subLabel}>폭 (m)</span>
                  <input className={styles.smallInput} type="number" step={0.01} min={0.1} value={wpCustomW} onChange={e => setWpCustomW(n(e.target.value, 0.1))} />
                </div>
                <div>
                  <span className={styles.subLabel}>1롤 길이 (m)</span>
                  <input className={styles.smallInput} type="number" step={0.1} min={1} value={wpCustomLen} onChange={e => setWpCustomLen(n(e.target.value, 1))} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>로스율 (여유분)</span>
              <span className={styles.cardLabelHint}>10% 표준 권장</span>
            </div>
            <div className={styles.lossGrid}>
              {[
                { v: 5,  label: '단색·작은 패턴',  cls: 'lossSafe',   activeCls: 'lossActive' },
                { v: 10, label: '한국 표준',        cls: 'lossStd',    activeCls: 'lossActive' },
                { v: 15, label: '큰 패턴',          cls: 'lossWarn',   activeCls: 'lossActive' },
                { v: 20, label: '셀프 + 큰 패턴',  cls: 'lossDanger', activeCls: 'lossActive' },
              ].map(o => (
                <button
                  key={o.v}
                  type="button"
                  className={`${styles.lossBtn} ${styles[o.cls]} ${lossPct === o.v ? styles[o.activeCls] : ''}`}
                  onClick={() => setLossPct(o.v)}
                >
                  <small>{o.v}%</small>
                  {o.label}
                </button>
              ))}
            </div>
            <label className={styles.toggleRow}>
              <input type="checkbox" checked={includeCeiling} onChange={e => setIncludeCeiling(e.target.checked)} />
              <span>천장도 도배 (천장 면적 추가)</span>
            </label>
          </div>
        </>
      )}

      {/* ────────────── 탭 1 결과 ────────────── */}
      {tab === 'simple' && (
        <>
          <div className={styles.hero}>
            <p className={styles.heroLead}>필요한 벽지</p>
            <p className={styles.heroNum}>{t1.finalRolls}<span className={styles.heroUnit}>롤</span></p>
            <p className={styles.heroSub}>{wp.name} 기준 (로스율 {lossPct}% 포함)</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>면적 Breakdown</span></div>
            <table className={styles.breakdownTable}>
              <tbody>
                <tr><td>둘레 × 천장 높이</td><td>{fmt(t1.totalWallArea)}㎡</td></tr>
                {t1.windowArea > 0 && <tr className={styles.subRow}><td>창문 차감 ({winCount}개)</td><td>−{fmt(t1.windowArea)}㎡</td></tr>}
                {t1.doorArea > 0 && <tr className={styles.subRow}><td>문 차감 ({doorCount}개)</td><td>−{fmt(t1.doorArea)}㎡</td></tr>}
                {t1.ceilingArea > 0 && <tr className={styles.addRow}><td>천장 추가</td><td>+{fmt(t1.ceilingArea)}㎡</td></tr>}
                <tr><td>시공 면적</td><td>{fmt(t1.netWallArea + t1.ceilingArea)}㎡</td></tr>
                <tr className={styles.addRow}><td>로스율 {lossPct}% 추가</td><td>+{fmt(t1.requiredArea - (t1.netWallArea + t1.ceilingArea))}㎡</td></tr>
                <tr className={styles.totalRow}><td>필요 벽지 면적</td><td>{fmt(t1.requiredArea)}㎡</td></tr>
              </tbody>
            </table>
          </div>

          <div className={styles.rollCard}>
            <div className={styles.cardLabel} style={{ color: 'var(--accent)' }}><span>롤 수 계산</span></div>
            <div className={styles.rollGrid}>
              <div className={styles.rollCell}>
                <p className={styles.rollLabel}>1롤 면적</p>
                <p className={styles.rollValue}>{fmt(t1.areaPerRoll, 2)}㎡</p>
              </div>
              <div className={styles.rollCell}>
                <p className={styles.rollLabel}>정확한 필요 롤</p>
                <p className={styles.rollValue}>{fmt(t1.exactRolls, 2)}롤</p>
              </div>
              <div className={styles.rollCell}>
                <p className={styles.rollLabel}>추천 구매 롤</p>
                <p className={`${styles.rollValue} ${styles.rollValueAccent}`}>{t1.finalRolls}롤</p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>장 수 환산 (참고)</span>
              <span className={styles.cardLabelHint}>면적 vs 장수 중 큰 값 채택</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              천장 높이 <strong style={{ color: 'var(--text)' }}>{heightM}m</strong> 기준 1롤에서 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{t1.stripsPerRoll}장</strong> 절단 가능 →
              둘레 {fmt(t1.perimeter)}m ÷ 폭 {wpWidth}m = <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{t1.totalStripsNeeded}장</strong> 필요 →
              장 수 기준 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{t1.stripsRollsNeeded}롤</strong>
            </p>
          </div>

          {/* 평면도 SVG */}
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>평면도 (단순화)</span></div>
            <div className={styles.floorPlanWrap}>
              {(() => {
                const VBW = 360, VBH = 240
                const padding = 40
                const w = tab1Dims.width
                const l = tab1Dims.length
                const ratio = w / l
                let drawW = VBW - padding * 2
                let drawH = VBH - padding * 2
                if (ratio > drawW / drawH) drawH = drawW / ratio
                else drawW = drawH * ratio
                const x0 = (VBW - drawW) / 2
                const y0 = (VBH - drawH) / 2
                return (
                  <svg className={styles.floorPlanSvg} viewBox={`0 0 ${VBW} ${VBH}`} aria-hidden="true">
                    {/* 방 둘레 */}
                    <rect x={x0} y={y0} width={drawW} height={drawH} fill="rgba(232,151,87,0.05)" stroke="#fff" strokeWidth={2} />
                    {/* 시공 라인 (둘레 점선) */}
                    <rect x={x0 + 4} y={y0 + 4} width={drawW - 8} height={drawH - 8} fill="none" stroke="var(--accent)" strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />
                    {/* 가로 치수 */}
                    <text x={x0 + drawW / 2} y={y0 - 10} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="monospace">{w.toFixed(2)}m</text>
                    {/* 세로 치수 */}
                    <text x={x0 - 8} y={y0 + drawH / 2} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="monospace" transform={`rotate(-90 ${x0 - 8} ${y0 + drawH / 2})`}>{l.toFixed(2)}m</text>
                    {/* 둘레 표기 */}
                    <text x={x0 + drawW / 2} y={y0 + drawH + 22} textAnchor="middle" fill="var(--accent)" fontSize="11" fontFamily="monospace" fontWeight={700}>둘레 {fmt(t1.perimeter, 2)}m</text>
                    {/* 창문 (위) */}
                    {winCount > 0 && winW > 0 && (
                      <line
                        x1={x0 + drawW * 0.3}
                        y1={y0}
                        x2={x0 + drawW * 0.7}
                        y2={y0}
                        stroke="#3EC8FF"
                        strokeWidth={5}
                      />
                    )}
                    {winCount > 0 && (
                      <text x={x0 + drawW * 0.5} y={y0 + 18} textAnchor="middle" fill="#3EC8FF" fontSize="10" fontFamily="monospace">창</text>
                    )}
                    {/* 문 (아래) */}
                    {doorCount > 0 && doorW > 0 && (
                      <line
                        x1={x0 + drawW * 0.7}
                        y1={y0 + drawH}
                        x2={x0 + drawW * 0.85}
                        y2={y0 + drawH}
                        stroke="#FF8C3E"
                        strokeWidth={5}
                      />
                    )}
                    {doorCount > 0 && (
                      <text x={x0 + drawW * 0.78} y={y0 + drawH - 8} textAnchor="middle" fill="#FF8C3E" fontSize="10" fontFamily="monospace">문</text>
                    )}
                  </svg>
                )
              })()}
            </div>
          </div>
        </>
      )}

      {/* ────────────── 탭 2: 상세 계산 (방·벽별) ────────────── */}
      {tab === 'detail' && (
        <>
          {rooms.map(r => (
            <div key={r.id} className={styles.card}>
              <div className={styles.roomHeader}>
                <input
                  className={styles.roomHeaderInput}
                  type="text"
                  value={r.name}
                  onChange={e => updateRoom(r.id, { name: e.target.value || '방' })}
                  placeholder="방 이름"
                />
                {rooms.length > 1 && (
                  <button type="button" className={styles.removeRoomBtn} onClick={() => removeRoom(r.id)}>방 삭제</button>
                )}
              </div>

              <label className={styles.toggleRow} style={{ marginTop: 0, marginBottom: 8 }}>
                <input type="checkbox" checked={r.pointOnly} onChange={e => updateRoom(r.id, { pointOnly: e.target.checked, pointWallId: e.target.checked ? r.walls[0]?.id ?? null : null })} />
                <span>포인트 도배 (1면만)</span>
              </label>

              {r.pointOnly && (
                <div style={{ marginBottom: 10 }}>
                  <span className={styles.subLabel}>포인트 벽 선택</span>
                  <div className={styles.presetGrid}>
                    {r.walls.map(w => (
                      <button
                        key={w.id}
                        type="button"
                        className={`${styles.presetBtn} ${r.pointWallId === w.id ? styles.presetActive : ''}`}
                        onClick={() => updateRoom(r.id, { pointWallId: w.id })}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {r.walls.map(w => {
                const isHidden = r.pointOnly && r.pointWallId !== w.id
                if (isHidden) return null
                return (
                  <div key={w.id} className={styles.wallSubBlock}>
                    <div className={styles.wallLabel}>{w.label}</div>
                    <div className={styles.wallDimRow}>
                      <div>
                        <span className={styles.subLabel}>가로 (m)</span>
                        <input className={styles.smallInput} type="number" step={0.1} min={0} value={w.wallW} onChange={e => updateWall(r.id, w.id, { wallW: n(e.target.value) })} />
                      </div>
                      <div>
                        <span className={styles.subLabel}>높이 (m)</span>
                        <input className={styles.smallInput} type="number" step={0.1} min={0} value={w.wallH} onChange={e => updateWall(r.id, w.id, { wallH: n(e.target.value) })} />
                      </div>
                    </div>

                    <p className={styles.openingsHeader}>창문·문 ({w.openings.length}/5)</p>
                    {w.openings.map(o => (
                      <div key={o.id} className={styles.openingMiniRow}>
                        <button
                          type="button"
                          className={`${styles.openingTypeBtn} ${o.type === 'window' ? styles.openingWindow : styles.openingDoor}`}
                          onClick={() => updateOpening(r.id, w.id, o.id, { type: o.type === 'window' ? 'door' : 'window' })}
                        >
                          {o.type === 'window' ? '창문' : '문'}
                        </button>
                        <input className={styles.smallInput} type="number" step={0.1} min={0} value={o.w} onChange={e => updateOpening(r.id, w.id, o.id, { w: n(e.target.value) })} placeholder="가로" />
                        <input className={styles.smallInput} type="number" step={0.1} min={0} value={o.h} onChange={e => updateOpening(r.id, w.id, o.id, { h: n(e.target.value) })} placeholder="세로" />
                        <button type="button" className={`${styles.iconBtn} ${styles.removeBtn}`} onClick={() => removeOpening(r.id, w.id, o.id)}>✕</button>
                      </div>
                    ))}
                    {w.openings.length < 5 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        <button type="button" className={`${styles.openingTypeBtn} ${styles.openingWindow}`} onClick={() => addOpening(r.id, w.id, 'window')}>+ 창문</button>
                        <button type="button" className={`${styles.openingTypeBtn} ${styles.openingDoor}`}   onClick={() => addOpening(r.id, w.id, 'door')}>+ 문</button>
                      </div>
                    )}
                  </div>
                )
              })}

              <label className={styles.toggleRow}>
                <input type="checkbox" checked={r.includeCeiling} onChange={e => updateRoom(r.id, { includeCeiling: e.target.checked })} />
                <span>천장도 도배</span>
              </label>
              {r.includeCeiling && (
                <div className={styles.wallDimRow} style={{ marginTop: 8 }}>
                  <div>
                    <span className={styles.subLabel}>천장 가로 (m)</span>
                    <input className={styles.smallInput} type="number" step={0.1} min={0} value={r.ceilingW} onChange={e => updateRoom(r.id, { ceilingW: n(e.target.value) })} />
                  </div>
                  <div>
                    <span className={styles.subLabel}>천장 세로 (m)</span>
                    <input className={styles.smallInput} type="number" step={0.1} min={0} value={r.ceilingL} onChange={e => updateRoom(r.id, { ceilingL: n(e.target.value) })} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {rooms.length < 10 && (
            <button type="button" className={styles.addBtn} onClick={addRoom}>+ 방 추가 ({rooms.length}/10)</button>
          )}

          {/* 합계 표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>방별 합계</span>
              <span className={styles.cardLabelHint}>{wp.name} · 로스율 {lossPct}%</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.summaryTable}>
                <thead>
                  <tr><th>방</th><th>시공 면적</th><th>필요 롤</th></tr>
                </thead>
                <tbody>
                  {t2Rooms.map(r => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{fmt(r.totalArea)}㎡</td>
                      <td>{r.rollsNeeded}롤</td>
                    </tr>
                  ))}
                  <tr className={styles.summaryTotal}>
                    <td>합계</td>
                    <td>{fmt(t2Total.area)}㎡</td>
                    <td>{t2Total.rolls}롤</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              💡 전체 공사 시 안전 여유로 <strong style={{ color: 'var(--text)' }}>1~2롤 추가 구매</strong>를 권장합니다.
            </p>
          </div>
        </>
      )}

      {/* ────────────── 탭 3: 비용 견적 ────────────── */}
      {tab === 'quote' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>견적 기준</span>
              <span className={styles.cardLabelHint}>{tab === 'quote' ? `현재 ${usedRolls}롤 적용 (간편 계산 결과)` : ''}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
              간편 계산 결과 기준 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{usedRolls}롤</strong> · 시공 면적 <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{fmt(usedArea)}㎡</strong> ({fmt(usedPyung, 1)}평)
            </p>

            <span className={styles.subLabel}>벽지 1롤 가격</span>
            <div className={styles.priceTierGrid}>
              {PRICE_TIERS.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.priceTierBtn} ${priceTierId === t.id ? styles.priceTierActive : ''}`}
                  onClick={() => selectPriceTier(t.id)}
                >
                  {t.label}
                  <small>{(t.price / 1000).toLocaleString()}k</small>
                </button>
              ))}
            </div>
            <div className={styles.inputRow}>
              <input
                className={styles.smallInput}
                type="text"
                inputMode="numeric"
                value={fmt(pricePerRoll, 0)}
                onChange={e => { setPricePerRollStr(parseComma(e.target.value).toString()); setPriceTierId(null) }}
              />
              <span className={styles.unit}>원/롤</span>
            </div>

            <div style={{ height: 12 }} />
            <span className={styles.subLabel}>도배풀 단가 (1kg, 보통 5,000원)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={500} min={0} value={pasteUnit} onChange={e => setPasteUnit(n(e.target.value))} />
              <span className={styles.unit}>원/kg</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>도구비 (벽지칼·롤러·솔, 셀프 시 1회)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={1000} min={0} value={toolCost} onChange={e => setToolCost(n(e.target.value))} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>사다리 (천장 도배 시)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={5000} min={0} value={ladderCost} onChange={e => setLadderCost(n(e.target.value))} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>전문 시공 인건비 (1롤당)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={1000} min={0} value={proLaborPerRoll} onChange={e => setProLaborPerRoll(n(e.target.value))} />
              <span className={styles.unit}>원/롤</span>
            </div>
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
                    <td>벽지 ({wp.name})</td>
                    <td>{fmt(pricePerRoll, 0)}원/롤</td>
                    <td>{usedRolls}롤</td>
                    <td>{fmtKRW(wpTotalCost)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>도배풀</td>
                    <td>{fmt(pasteUnit, 0)}원/kg</td>
                    <td>{pasteKg}kg</td>
                    <td>{fmtKRW(pasteTotalCost)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>도구비 (셀프)</td>
                    <td>—</td>
                    <td>1세트</td>
                    <td>{fmtKRW(toolCost)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>사다리</td>
                    <td>—</td>
                    <td>—</td>
                    <td>{fmtKRW(ladderCost)}</td>
                  </tr>
                  <tr className={styles.totalRowSelf}>
                    <td>🔧 셀프 시공 합계</td>
                    <td colSpan={2}></td>
                    <td>{fmtKRW(selfTotal)}</td>
                  </tr>
                  <tr className={styles.proRow}>
                    <td>전문 시공 인건비</td>
                    <td>{fmt(proLaborPerRoll, 0)}원/롤</td>
                    <td>{usedRolls}롤</td>
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
            <br />한국 평균: 셀프 5,000~10,000원/평 · 전문(실크) 12,000~18,000원/평
          </div>
        </>
      )}

      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}
