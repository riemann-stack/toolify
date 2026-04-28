'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import styles from './room-area.module.css'

const PYUNG_TO_M2 = 3.3058

const WIN_PRESETS = [
  { id: 'none',  label: '창문 없음',     w: 0,   h: 0,   count: 0 },
  { id: 'small', label: '작은 창 1개',  w: 1.0, h: 1.2, count: 1 },
  { id: 'std',   label: '표준 창 1개',  w: 1.5, h: 1.5, count: 1 },
  { id: 'big1',  label: '큰 창 1개',    w: 2.0, h: 1.8, count: 1 },
  { id: 'big2',  label: '큰 창 2개',    w: 2.0, h: 1.8, count: 2 },
  { id: 'custom', label: '직접 입력',   w: 0,   h: 0,   count: 0 },
]

/* 유틸 */
function n(v: string | number, min = 0): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < min) return min
  return x
}
function fmt(v: number, dec = 1): string {
  return (Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)).toLocaleString('ko-KR')
}

/* 핵심 계산 */
interface RoomCalc {
  w: number; l: number; h: number
  winCount: number; winW: number; winH: number
  doorCount: number; doorW: number; doorH: number
}
function calcRoom(i: RoomCalc) {
  const perimeter = (i.w + i.l) * 2
  const floorArea = i.w * i.l
  const ceilingArea = floorArea
  const totalWallArea = perimeter * i.h
  const windowArea = i.winCount * i.winW * i.winH
  const doorArea = i.doorCount * i.doorW * i.doorH
  const netWallArea = Math.max(0, totalWallArea - windowArea - doorArea)
  const volume = floorArea * i.h
  const floorPyeong = floorArea / PYUNG_TO_M2
  const wallPyeong = netWallArea / PYUNG_TO_M2
  const totalSurface = netWallArea + floorArea + ceilingArea
  return { perimeter, floorArea, ceilingArea, totalWallArea, netWallArea, windowArea, doorArea, volume, floorPyeong, wallPyeong, totalSurface }
}

/* 도배 롤 수 추정 (실크벽지 기준 16.5㎡/롤, 10% 로스율) */
function estimateWallpaperRolls(netWallArea: number): number {
  return Math.ceil((netWallArea * 1.10) / 16.5)
}
/* 페인트 L 추정 (수성 1L=10㎡, 2회 도장, 10% 로스율) */
function estimatePaintL(netWallArea: number): number {
  return Math.round((netWallArea * 2 / 10) * 1.10 * 10) / 10
}
/* 에어컨 평형 권장 (바닥 평수 기준 +1평 마진) */
function estimateAirConPyung(floorPyeong: number): number {
  return Math.ceil(floorPyeong + 1)
}
/* 조명 루멘 권장 (거실 300 lux × 면적) */
function estimateLumenRange(floorArea: number): { low: number; high: number } {
  return { low: Math.round(floorArea * 300 / 100) * 100, high: Math.round(floorArea * 400 / 100) * 100 }
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
type TabId = 'simple' | 'detail'
type SizeMode = 'pyung' | 'meter'

export default function RoomAreaClient() {
  const [tab, setTab] = useState<TabId>('simple')

  /* 공간 정보 (탭 1) */
  const [sizeMode, setSizeMode] = useState<SizeMode>('pyung')
  const [pyung, setPyung] = useState(15)
  const [pyungCustom, setPyungCustom] = useState<number | null>(null)
  const [widthM, setWidthM]   = useState('5.0')
  const [lengthM, setLengthM] = useState('4.0')
  const [heightM, setHeightM] = useState(2.4)

  /* 창문·문 (탭 1) */
  const [winPreset, setWinPreset] = useState<typeof WIN_PRESETS[number]['id']>('std')
  const [winCount, setWinCount] = useState(1)
  const [winW, setWinW] = useState(1.5)
  const [winH, setWinH] = useState(1.5)
  const [doorCount, setDoorCount] = useState(1)
  const [doorW, setDoorW] = useState(0.9)
  const [doorH, setDoorH] = useState(2.1)

  /* 탭 2: 방·벽별 */
  interface WallInput {
    id: string; label: string; wallW: number; wallH: number
    openings: Array<{ id: string; type: 'window' | 'door'; w: number; h: number }>
  }
  interface RoomInput {
    id: string; name: string
    walls: WallInput[]
    h: number   // 천장 높이
    floorW: number; floorL: number  // 바닥 가로/세로 (천장도 동일)
  }
  function makeWall(label: string, w = 4, h = 2.4): WallInput {
    return { id: String(Date.now() + Math.random()), label, wallW: w, wallH: h, openings: [] }
  }
  function makeRoom(name: string, w = 5, l = 4, h = 2.4): RoomInput {
    return {
      id: String(Date.now() + Math.random()),
      name,
      walls: [
        makeWall('A — 정면', w, h),
        makeWall('B — 우측', l, h),
        makeWall('C — 후면', w, h),
        makeWall('D — 좌측', l, h),
      ],
      h, floorW: w, floorL: l,
    }
  }
  const [rooms, setRooms] = useState<RoomInput[]>([{ ...makeRoom('거실', 5, 4, 2.4) }])

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* 평수 ↔ 가로·세로 */
  const effectivePyung = pyungCustom ?? pyung
  const tab1Dims = useMemo(() => {
    if (sizeMode === 'pyung') {
      const m2 = effectivePyung * PYUNG_TO_M2
      const side = Math.sqrt(m2)
      return { width: side, length: side, area: m2 }
    }
    const w = n(widthM), l = n(lengthM)
    return { width: w, length: l, area: w * l }
  }, [sizeMode, effectivePyung, widthM, lengthM])

  /* 창문 프리셋 적용 */
  function applyWinPreset(id: typeof winPreset) {
    setWinPreset(id)
    const p = WIN_PRESETS.find(x => x.id === id)!
    if (p.id !== 'custom') {
      setWinCount(p.count)
      setWinW(p.w)
      setWinH(p.h)
    }
  }

  /* 탭 1 결과 */
  const t1 = useMemo(() => calcRoom({
    w: tab1Dims.width, l: tab1Dims.length, h: heightM,
    winCount, winW, winH,
    doorCount, doorW, doorH,
  }), [tab1Dims, heightM, winCount, winW, winH, doorCount, doorW, doorH])

  /* 탭 2 방별 계산 */
  const t2RoomCalcs = useMemo(() => {
    return rooms.map(r => {
      const wallGross = r.walls.reduce((s, w) => s + w.wallW * w.wallH, 0)
      const openings = r.walls.reduce((s, w) => s + w.openings.reduce((so, o) => so + o.w * o.h, 0), 0)
      const wallNet = Math.max(0, wallGross - openings)
      const floor = r.floorW * r.floorL
      const ceiling = floor
      const volume = floor * r.h
      return {
        id: r.id, name: r.name,
        wallGross, wallNet, floor, ceiling, volume,
        openings,
      }
    })
  }, [rooms])

  const t2Total = useMemo(() => {
    return t2RoomCalcs.reduce(
      (acc, r) => ({
        floor: acc.floor + r.floor,
        wallNet: acc.wallNet + r.wallNet,
        volume: acc.volume + r.volume,
      }),
      { floor: 0, wallNet: 0, volume: 0 }
    )
  }, [t2RoomCalcs])

  /* 방·벽 추가/삭제 */
  function addRoom() {
    if (rooms.length >= 10) return
    setRooms([...rooms, makeRoom(`방 ${rooms.length + 1}`)])
  }
  function removeRoom(id: string) { setRooms(rooms.filter(r => r.id !== id)) }
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
      ? { ...r, walls: r.walls.map(w => w.id === wallId
          ? { ...w, openings: [...w.openings, {
              id: String(Date.now() + Math.random()), type,
              w: type === 'window' ? 1.5 : 0.9,
              h: type === 'window' ? 1.5 : 2.1,
            }] }
          : w) }
      : r))
  }
  function removeOpening(roomId: string, wallId: string, openingId: string) {
    setRooms(rooms.map(r => r.id === roomId
      ? { ...r, walls: r.walls.map(w => w.id === wallId
          ? { ...w, openings: w.openings.filter(o => o.id !== openingId) }
          : w) }
      : r))
  }
  function updateOpening(roomId: string, wallId: string, openingId: string, patch: Partial<{ w: number; h: number; type: 'window' | 'door' }>) {
    setRooms(rooms.map(r => r.id === roomId
      ? { ...r, walls: r.walls.map(w => w.id === wallId
          ? { ...w, openings: w.openings.map(o => o.id === openingId ? { ...o, ...patch } : o) }
          : w) }
      : r))
  }

  /* 결과 복사 */
  function handleCopy() {
    const lines: string[] = []
    if (tab === 'simple') {
      lines.push(
        '📐 공간 면적 계산 결과',
        `방: ${tab1Dims.width.toFixed(2)}m × ${tab1Dims.length.toFixed(2)}m × ${heightM}m`,
        `바닥: ${fmt(t1.floorArea)}㎡ (${fmt(t1.floorPyeong, 1)}평)`,
        `벽 (전체): ${fmt(t1.totalWallArea)}㎡ / 실제 시공: ${fmt(t1.netWallArea)}㎡`,
        `천장: ${fmt(t1.ceilingArea)}㎡ / 부피: ${fmt(t1.volume, 1)}㎥`,
        `총 표면적: ${fmt(t1.totalSurface)}㎡`,
      )
    } else {
      lines.push('📐 공간 면적 (방별)')
      t2RoomCalcs.forEach(r => {
        lines.push(`  ${r.name}: 바닥 ${fmt(r.floor)}㎡ · 벽(실) ${fmt(r.wallNet)}㎡ · 부피 ${fmt(r.volume, 1)}㎥`)
      })
      lines.push(`합계: 바닥 ${fmt(t2Total.floor)}㎡ (${fmt(t2Total.floor / PYUNG_TO_M2, 1)}평) · 벽(실) ${fmt(t2Total.wallNet)}㎡ · 부피 ${fmt(t2Total.volume, 1)}㎥`)
    }
    lines.push('youtil.kr/tools/interior/room-area')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  const pyungOptions = [5, 7, 10, 12, 15, 18, 20, 22, 25, 28, 30, 33, 35, 40]

  /* 활용 추천: 탭 1 기준 자동 계산 */
  const wallpaperRolls = estimateWallpaperRolls(t1.netWallArea)
  const paintL = estimatePaintL(t1.netWallArea)
  const airConP = estimateAirConPyung(t1.floorPyeong)
  const lumen = estimateLumenRange(t1.floorArea)

  /* ────────────────────────────── 렌더 ────────────────────────────── */
  return (
    <div className={styles.wrap}>

      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'simple' ? styles.tabActive : ''}`} onClick={() => setTab('simple')}>간편 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'detail' ? styles.tabActive : ''}`} onClick={() => setTab('detail')}>상세 계산 (방·벽별)</button>
      </div>

      {/* ────────────── 탭 1: 간편 ────────────── */}
      {tab === 'simple' && (
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
                <p className={styles.areaShow}>약 {fmt(tab1Dims.area)}㎡ (정사각형 가정)</p>
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
              <span className={styles.cardLabelHint}>실제 벽 면적에서 차감</span>
            </div>
            <span className={styles.subLabel}>창문 — 빠른 선택</span>
            <div className={styles.presetGrid}>
              {WIN_PRESETS.map(p => (
                <button key={p.id} type="button" className={`${styles.presetBtn} ${winPreset === p.id ? styles.presetActive : ''}`} onClick={() => applyWinPreset(p.id)}>
                  {p.label}
                </button>
              ))}
            </div>
            {winPreset === 'custom' && (
              <div className={styles.openingRow}>
                <div>
                  <span className={styles.subLabel}>개수</span>
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
            <span className={styles.subLabel}>문 (기본 0.9 × 2.1m)</span>
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

          {/* 결과 — 히어로 */}
          <div className={styles.hero}>
            <p className={styles.heroLead}>이 공간의 핵심 면적</p>
            <div className={styles.heroDual}>
              <div>
                <p className={styles.heroDualLabel}>바닥 면적</p>
                <p className={`${styles.heroDualNum} ${styles.heroFloor}`}>{fmt(t1.floorArea)}<span className={styles.heroDualUnit}>㎡</span></p>
                <p className={styles.heroSub}>{fmt(t1.floorPyeong, 1)}평</p>
              </div>
              <span className={styles.heroDualSep}>｜</span>
              <div>
                <p className={styles.heroDualLabel}>벽 면적 (실제 시공)</p>
                <p className={`${styles.heroDualNum} ${styles.heroWall}`}>{fmt(t1.netWallArea)}<span className={styles.heroDualUnit}>㎡</span></p>
                <p className={styles.heroSub}>창문·문 차감 후</p>
              </div>
            </div>
          </div>

          {/* 6개 면적 카드 */}
          <div className={styles.areaGrid}>
            <div className={`${styles.areaCard} ${styles.areaWallTotal}`}>
              <span className={styles.areaIcon}>🪟</span>
              <p className={styles.areaTitle}>벽 면적 (전체)</p>
              <p className={styles.areaValue}>{fmt(t1.totalWallArea)}<span className={styles.areaUnit}>㎡</span></p>
              <p className={styles.areaSub}>둘레 × 천장 높이</p>
            </div>
            <div className={`${styles.areaCard} ${styles.areaWallNet}`}>
              <span className={styles.areaIcon}>🚪</span>
              <p className={styles.areaTitle}>벽 면적 (실제 시공)</p>
              <p className={styles.areaValue}>{fmt(t1.netWallArea)}<span className={styles.areaUnit}>㎡</span></p>
              <p className={styles.areaSub}>창·문 차감 (<span className={styles.areaSubAccent}>{fmt(t1.wallPyeong, 1)}평</span>)</p>
            </div>
            <div className={`${styles.areaCard} ${styles.areaFloor}`}>
              <span className={styles.areaIcon}>⬜</span>
              <p className={styles.areaTitle}>바닥 면적</p>
              <p className={styles.areaValue}>{fmt(t1.floorArea)}<span className={styles.areaUnit}>㎡</span></p>
              <p className={styles.areaSub}>가로 × 세로 (<span className={styles.areaSubAccent}>{fmt(t1.floorPyeong, 1)}평</span>)</p>
            </div>
            <div className={`${styles.areaCard} ${styles.areaCeiling}`}>
              <span className={styles.areaIcon}>⬛</span>
              <p className={styles.areaTitle}>천장 면적</p>
              <p className={styles.areaValue}>{fmt(t1.ceilingArea)}<span className={styles.areaUnit}>㎡</span></p>
              <p className={styles.areaSub}>바닥과 동일</p>
            </div>
            <div className={`${styles.areaCard} ${styles.areaVolume}`}>
              <span className={styles.areaIcon}>📦</span>
              <p className={styles.areaTitle}>공간 부피</p>
              <p className={styles.areaValue}>{fmt(t1.volume, 1)}<span className={styles.areaUnit}>㎥</span></p>
              <p className={styles.areaSub}>가로 × 세로 × 높이</p>
            </div>
            <div className={`${styles.areaCard} ${styles.areaSurface}`}>
              <span className={styles.areaIcon}>🏠</span>
              <p className={styles.areaTitle}>총 표면적</p>
              <p className={styles.areaValue}>{fmt(t1.totalSurface)}<span className={styles.areaUnit}>㎡</span></p>
              <p className={styles.areaSub}>벽 + 바닥 + 천장</p>
            </div>
          </div>

          {/* 차감 breakdown */}
          {(t1.windowArea > 0 || t1.doorArea > 0) && (
            <div className={styles.card}>
              <div className={styles.cardLabel}><span>벽 면적 차감 Breakdown</span></div>
              <table className={styles.breakdownTable}>
                <tbody>
                  <tr><td>전체 벽 면적</td><td>{fmt(t1.totalWallArea)}㎡</td></tr>
                  {t1.windowArea > 0 && <tr className={styles.subRow}><td>창문 {winCount}개 ({winW}×{winH}m)</td><td>−{fmt(t1.windowArea)}㎡</td></tr>}
                  {t1.doorArea > 0 && <tr className={styles.subRow}><td>문 {doorCount}개 ({doorW}×{doorH}m)</td><td>−{fmt(t1.doorArea)}㎡</td></tr>}
                  <tr className={styles.totalRow}><td>실제 시공 벽 면적</td><td>{fmt(t1.netWallArea)}㎡</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 3D 박스 SVG (isometric) */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>3D 박스 시각화</span>
              <span className={styles.cardLabelHint}>{tab1Dims.width.toFixed(1)} × {tab1Dims.length.toFixed(1)} × {heightM}m</span>
            </div>
            <div className={styles.boxWrap}>
              {(() => {
                const VBW = 360, VBH = 240
                // isometric projection — 30° angle
                const w = tab1Dims.width
                const l = tab1Dims.length
                const h = heightM
                // 비례 스케일 — 가장 큰 차원이 캔버스의 ~50%
                const maxDim = Math.max(w, l, h * 1.5)
                const scale = 60 / Math.max(2, maxDim)  // 60px/m 기본
                const dx = w * scale * 0.866  // cos 30°
                const dy = l * scale * 0.866
                const dxx = l * scale * 0.866
                const dyy = w * scale * 0.5    // sin 30°
                const dh = h * scale * 1.5     // 높이 (시각적으로 강조)

                // 박스 중심
                const cx = VBW / 2
                const cy = VBH / 2 + 20

                // 8 코너
                const A = { x: cx - dx, y: cy + dyy }      // 앞-좌-하
                const B = { x: cx + dxx, y: cy + dy + dyy } // 앞-우-하 (잘못됨, 단순화)
                // Re-compute simpler isometric
                const ix = (x: number, y: number) => x * 0.866
                const iy = (x: number, y: number) => x * 0.5 - y * 0.5

                // 바닥 사각형
                const bottomA = { x: cx + ix(0, 0), y: cy + iy(0, 0) }
                const bottomB = { x: cx + ix(w * scale, 0), y: cy + iy(w * scale, 0) }
                const bottomC = { x: cx + ix(w * scale, l * scale), y: cy + iy(w * scale, l * scale) }
                const bottomD = { x: cx + ix(0, l * scale), y: cy + iy(0, l * scale) }

                // 천장 사각형 (위쪽 dh만큼 이동)
                const topA = { x: bottomA.x, y: bottomA.y - dh }
                const topB = { x: bottomB.x, y: bottomB.y - dh }
                const topC = { x: bottomC.x, y: bottomC.y - dh }
                const topD = { x: bottomD.x, y: bottomD.y - dh }

                // 시각적 보정 — 박스 전체를 캔버스 중앙으로
                const allX = [bottomA.x, bottomB.x, bottomC.x, bottomD.x, topA.x, topB.x, topC.x, topD.x]
                const allY = [bottomA.y, bottomB.y, bottomC.y, bottomD.y, topA.y, topB.y, topC.y, topD.y]
                const minX = Math.min(...allX), maxX = Math.max(...allX)
                const minY = Math.min(...allY), maxY = Math.max(...allY)
                const offX = (VBW - (maxX - minX)) / 2 - minX
                const offY = (VBH - (maxY - minY)) / 2 - minY

                const shift = (p: { x: number; y: number }) => ({ x: p.x + offX, y: p.y + offY })
                const bA = shift(bottomA), bB = shift(bottomB), bC = shift(bottomC), bD = shift(bottomD)
                const tA = shift(topA),    tB = shift(topB),    tC = shift(topC),    tD = shift(topD)

                const path = (pts: Array<{ x: number; y: number }>) =>
                  'M ' + pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ') + ' Z'

                return (
                  <svg className={styles.boxSvg} viewBox={`0 0 ${VBW} ${VBH}`} aria-hidden="true">
                    {/* 바닥 (앞쪽 보임) */}
                    <path d={path([bA, bB, bC, bD])} fill="rgba(200,255,62,0.18)" stroke="#C8FF3E" strokeWidth={1.5} />
                    {/* 우측 벽 (B-C-tC-tB) */}
                    <path d={path([bB, bC, tC, tB])} fill="rgba(255,140,62,0.18)" stroke="#FF8C3E" strokeWidth={1.5} />
                    {/* 후면 벽 (C-D-tD-tC) */}
                    <path d={path([bC, bD, tD, tC])} fill="rgba(232,151,87,0.10)" stroke="#FF8C3E" strokeWidth={1.2} opacity={0.85} />
                    {/* 천장 (top) */}
                    <path d={path([tA, tB, tC, tD])} fill="rgba(155,89,182,0.18)" stroke="#9B59B6" strokeWidth={1.5} />

                    {/* 라벨 — 바닥 */}
                    <text x={(bA.x + bC.x) / 2} y={(bA.y + bC.y) / 2 + 5} textAnchor="middle" fill="#C8FF3E" fontSize="11" fontFamily="monospace" fontWeight={700}>
                      바닥 {fmt(t1.floorArea)}㎡
                    </text>
                    {/* 라벨 — 우측 벽 */}
                    <text x={(bB.x + tC.x) / 2 + 8} y={(bB.y + tC.y) / 2} textAnchor="start" fill="#FF8C3E" fontSize="10" fontFamily="monospace" fontWeight={700}>
                      벽
                    </text>
                    {/* 라벨 — 천장 */}
                    <text x={(tA.x + tC.x) / 2} y={(tA.y + tC.y) / 2} textAnchor="middle" fill="#9B59B6" fontSize="10" fontFamily="monospace" fontWeight={700}>
                      천장
                    </text>

                    {/* 치수 — 가로 (앞쪽 바닥 라인) */}
                    <text x={(bA.x + bB.x) / 2} y={bA.y + 18} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="monospace">
                      {tab1Dims.width.toFixed(1)}m
                    </text>
                    {/* 치수 — 세로 (오른쪽 바닥 라인) */}
                    <text x={bB.x + 14} y={(bB.y + bC.y) / 2 + 4} textAnchor="start" fill="var(--muted)" fontSize="10" fontFamily="monospace">
                      {tab1Dims.length.toFixed(1)}m
                    </text>
                    {/* 치수 — 높이 (왼쪽 수직) */}
                    <text x={tA.x - 8} y={(tA.y + bA.y) / 2 + 4} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="monospace">
                      {heightM}m
                    </text>
                  </svg>
                )
              })()}
            </div>
          </div>

          {/* 활용 추천 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>이 면적으로 무엇을 계산할 수 있나요?</span>
              <span className={styles.cardLabelHint}>다른 도구로 바로 이동</span>
            </div>
            <div className={styles.usageGrid}>
              <Link href="/tools/interior/wallpaper" className={`${styles.usageCard} ${styles.usageWallpaper}`}>
                <span className={styles.usageIcon}>🧱</span>
                <div className={styles.usageBody}>
                  <span className={styles.usageTitle}>도배 시공</span>
                  <span className={styles.usageDesc}>실제 벽 {fmt(t1.netWallArea)}㎡ → 실크벽지 약 <strong>{wallpaperRolls}롤</strong> 필요 (10% 로스율)</span>
                </div>
                <span className={styles.usageBtn}>자세히 →</span>
              </Link>

              <Link href="/tools/interior/paint" className={`${styles.usageCard} ${styles.usagePaint}`}>
                <span className={styles.usageIcon}>🎨</span>
                <div className={styles.usageBody}>
                  <span className={styles.usageTitle}>페인트 시공</span>
                  <span className={styles.usageDesc}>실제 벽 {fmt(t1.netWallArea)}㎡ × 2회 도장 → 수성 페인트 약 <strong>{paintL}L</strong></span>
                </div>
                <span className={styles.usageBtn}>자세히 →</span>
              </Link>

              <div className={`${styles.usageCard} ${styles.usageAirCon}`}>
                <span className={styles.usageIcon}>❄️</span>
                <div className={styles.usageBody}>
                  <span className={styles.usageTitle}>에어컨 평형</span>
                  <span className={styles.usageDesc}>바닥 {fmt(t1.floorArea)}㎡ ({fmt(t1.floorPyeong, 1)}평) → 약 <strong>{airConP}평형</strong> 권장</span>
                </div>
                <span className={styles.usageSoon}>🚧 출시 예정</span>
              </div>

              <div className={`${styles.usageCard} ${styles.usageLighting}`}>
                <span className={styles.usageIcon}>💡</span>
                <div className={styles.usageBody}>
                  <span className={styles.usageTitle}>조명 밝기</span>
                  <span className={styles.usageDesc}>거실 기준 약 <strong>{lumen.low.toLocaleString()}~{lumen.high.toLocaleString()} 루멘</strong> 권장</span>
                </div>
                <span className={styles.usageSoon}>🚧 출시 예정</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ────────────── 탭 2: 상세 (방·벽별) ────────────── */}
      {tab === 'detail' && (
        <>
          {rooms.map(r => {
            const calc = t2RoomCalcs.find(c => c.id === r.id)!
            return (
              <div key={r.id} className={styles.roomBlock}>
                <div className={styles.roomHeader}>
                  <input className={styles.roomHeaderInput} type="text" value={r.name} onChange={e => updateRoom(r.id, { name: e.target.value || '방' })} />
                  {rooms.length > 1 && (
                    <button type="button" className={styles.removeRoomBtn} onClick={() => removeRoom(r.id)}>방 삭제</button>
                  )}
                </div>

                <div className={styles.wallDimRow}>
                  <div>
                    <span className={styles.subLabel}>바닥 가로 (m)</span>
                    <input className={styles.smallInput} type="number" step={0.1} min={0} value={r.floorW} onChange={e => updateRoom(r.id, { floorW: n(e.target.value) })} />
                  </div>
                  <div>
                    <span className={styles.subLabel}>바닥 세로 (m)</span>
                    <input className={styles.smallInput} type="number" step={0.1} min={0} value={r.floorL} onChange={e => updateRoom(r.id, { floorL: n(e.target.value) })} />
                  </div>
                </div>
                <div style={{ height: 8 }} />
                <span className={styles.subLabel}>천장 높이 (m)</span>
                <div className={styles.inputRow}>
                  <input className={styles.smallInput} type="number" step={0.1} min={1.5} max={5} value={r.h} onChange={e => updateRoom(r.id, { h: Math.max(1.5, Math.min(5, Number(e.target.value) || 2.4)) })} />
                  <span className={styles.unit}>m</span>
                </div>

                {r.walls.map(w => (
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
                        <button type="button" className={`${styles.openingTypeBtn} ${o.type === 'window' ? styles.openingWindow : styles.openingDoor}`} onClick={() => updateOpening(r.id, w.id, o.id, { type: o.type === 'window' ? 'door' : 'window' })}>
                          {o.type === 'window' ? '창문' : '문'}
                        </button>
                        <input className={styles.smallInput} type="number" step={0.1} min={0} value={o.w} onChange={e => updateOpening(r.id, w.id, o.id, { w: n(e.target.value) })} />
                        <input className={styles.smallInput} type="number" step={0.1} min={0} value={o.h} onChange={e => updateOpening(r.id, w.id, o.id, { h: n(e.target.value) })} />
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
                ))}

                {/* 방별 결과 미니 카드 */}
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  background: 'rgba(232,151,87,0.05)',
                  border: '1px solid rgba(232,151,87,0.2)',
                  borderRadius: 10,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  textAlign: 'center',
                  fontSize: 12,
                }}>
                  <div>
                    <p style={{ color: 'var(--muted)', fontSize: 11 }}>바닥</p>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#C8FF3E', fontSize: 16 }}>{fmt(calc.floor)}㎡</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--muted)', fontSize: 11 }}>벽 (실)</p>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--accent)', fontSize: 16 }}>{fmt(calc.wallNet)}㎡</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--muted)', fontSize: 11 }}>부피</p>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#FFD700', fontSize: 16 }}>{fmt(calc.volume, 1)}㎥</p>
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
                  <tr><th>방</th><th>바닥</th><th>벽 (실)</th><th>부피</th></tr>
                </thead>
                <tbody>
                  {t2RoomCalcs.map(r => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{fmt(r.floor)}㎡</td>
                      <td>{fmt(r.wallNet)}㎡</td>
                      <td>{fmt(r.volume, 1)}㎥</td>
                    </tr>
                  ))}
                  <tr className={styles.summaryTotal}>
                    <td>합계</td>
                    <td>{fmt(t2Total.floor)}㎡</td>
                    <td>{fmt(t2Total.wallNet)}㎡</td>
                    <td>{fmt(t2Total.volume, 1)}㎥</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.totalPyungLine}>
              집 전체 실평수 (바닥 합) — <strong>{fmt(t2Total.floor / PYUNG_TO_M2, 1)}평</strong>
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
