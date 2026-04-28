'use client'

import { useMemo, useState, type ReactNode } from 'react'
import styles from './paint.module.css'

/* ─────────────────────────────────────────────────────────
 * 페인트 종류 (한국 표준)
 * ───────────────────────────────────────────────────────── */
interface PaintType {
  id: string
  name: string
  coveragePerL: number
  badge: string
  badgeCls: string
  cls: string
  defaultPrice: number
}
const PAINT_TYPES: PaintType[] = [
  { id: 'water',    name: '수성 페인트',  coveragePerL: 10, badge: '실내 표준',  badgeCls: 'bgWater',    cls: 'pntWater',    defaultPrice: 18000 },
  { id: 'oil',      name: '유성 페인트',  coveragePerL: 12, badge: '나무·금속',  badgeCls: 'bgOil',      cls: 'pntOil',      defaultPrice: 22000 },
  { id: 'enamel',   name: '에나멜',       coveragePerL: 14, badge: '광택',       badgeCls: 'bgEnamel',   cls: 'pntEnamel',   defaultPrice: 25000 },
  { id: 'exterior', name: '외부용',       coveragePerL: 8,  badge: '방수',       badgeCls: 'bgExterior', cls: 'pntExterior', defaultPrice: 28000 },
  { id: 'primer',   name: '프라이머',     coveragePerL: 9,  badge: '밑칠',       badgeCls: 'bgPrimer',   cls: 'pntPrimer',   defaultPrice: 14000 },
  { id: 'eco',      name: '친환경 (저VOC)', coveragePerL: 10, badge: '아이방',  badgeCls: 'bgEco',      cls: 'pntEco',      defaultPrice: 35000 },
  { id: 'custom',   name: '직접 입력',   coveragePerL: 10, badge: '',           badgeCls: 'bgWater',    cls: 'pntCustom',   defaultPrice: 18000 },
]

/* 한국 브랜드 프리셋 */
const BRANDS = [
  { id: 'samhwa',   label: '삼화 (홈앤톤즈)', coverage: 9.5,  cls: 'brandSamhwa' },
  { id: 'kcc',      label: 'KCC (숲으로)',     coverage: 10,   cls: 'brandKcc' },
  { id: 'noroo',    label: '노루 (순앤수)',    coverage: 9.5,  cls: 'brandNoroo' },
  { id: 'dunn',     label: '던에드워드',        coverage: 10,   cls: 'brandDunn' },
  { id: 'benjamin', label: '벤자민무어',        coverage: 10,   cls: 'brandBenjamin' },
]

/* 가격 프리셋 (1L) */
const PRICE_TIERS = [
  { id: 'cheap',   label: '저렴',     price: 9000  },
  { id: 'normal',  label: '일반',     price: 18000 },
  { id: 'premium', label: '고급',     price: 35000 },
  { id: 'luxury',  label: '프리미엄', price: 60000 },
]

/* 창문 프리셋 */
const WIN_PRESETS = [
  { id: 'none',  label: '창문 없음',     w: 0,   h: 0,   count: 0 },
  { id: 'small', label: '작은 창 1개',  w: 1.0, h: 1.2, count: 1 },
  { id: 'std',   label: '표준 창 1개',  w: 1.5, h: 1.5, count: 1 },
  { id: 'big1',  label: '큰 창 1개',    w: 2.0, h: 1.8, count: 1 },
  { id: 'big2',  label: '큰 창 2개',    w: 2.0, h: 1.8, count: 2 },
  { id: 'custom', label: '직접 입력',   w: 0,   h: 0,   count: 0 },
]

/* 한국 시판 페인트 용량 */
const CAN_SIZES = [18, 4, 2, 1]
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
 * 추천 구매 조합 알고리즘
 *  - requiredL 이상이면서 surplus 최소, 동률이면 통 수 최소
 *  - 추가 후보 2~3개도 함께 반환
 * ───────────────────────────────────────────────────────── */
interface Combo { c18: number; c4: number; c2: number; c1: number; total: number; cans: number; surplus: number }
function recommendCans(requiredL: number): { best: Combo | null; alts: Combo[] } {
  if (requiredL <= 0) return { best: null, alts: [] }

  const candidates: Combo[] = []
  const max18 = Math.floor(requiredL / 18) + 1
  for (let c18 = 0; c18 <= max18; c18++) {
    for (let c4 = 0; c4 <= 6; c4++) {
      for (let c2 = 0; c2 <= 4; c2++) {
        for (let c1 = 0; c1 <= 5; c1++) {
          const total = c18 * 18 + c4 * 4 + c2 * 2 + c1 * 1
          if (total < requiredL) continue
          // 의미 없는 조합 (다른 사이즈로 대체 가능) 1차 필터
          if (c1 >= 2 && c2 === 0) continue   // 1L 2통은 2L 1통과 동치
          if (c2 >= 2 && c4 === 0 && c18 === 0) continue  // 2L 2통은 4L 1통과 동치
          if (c4 >= 5 && c18 === 0) continue  // 4L 5통은 18L에 가까움
          const cans = c18 + c4 + c2 + c1
          if (cans === 0) continue
          candidates.push({ c18, c4, c2, c1, total, cans, surplus: total - requiredL })
        }
      }
    }
  }
  if (candidates.length === 0) return { best: null, alts: [] }

  // 정렬: 1) surplus 최소, 2) 통 수 최소, 3) 큰 통 우선
  candidates.sort((a, b) => {
    if (a.surplus !== b.surplus) return a.surplus - b.surplus
    if (a.cans !== b.cans) return a.cans - b.cans
    return (b.c18 - a.c18) || (b.c4 - a.c4)
  })

  const best = candidates[0]
  // 대안 — best와 다른 조합으로 surplus 큰 순 1~2개 (안전 마진)
  const alts: Combo[] = []
  for (const c of candidates) {
    if (alts.length >= 2) break
    if (c === best) continue
    if (c.surplus <= best.surplus) continue
    if (c.surplus >= best.surplus + 6) break
    if (alts.find(a => a.total === c.total && a.cans === c.cans)) continue
    alts.push(c)
  }

  return { best, alts }
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
type TabId = 'simple' | 'detail' | 'quote'
type SizeMode = 'pyung' | 'meter'

export default function PaintClient() {
  const [tab, setTab] = useState<TabId>('simple')

  /* 공간 입력 */
  const [sizeMode, setSizeMode] = useState<SizeMode>('pyung')
  const [pyung, setPyung] = useState(15)
  const [pyungCustom, setPyungCustom] = useState<number | null>(null)
  const [widthM, setWidthM]   = useState('5.0')
  const [lengthM, setLengthM] = useState('4.0')
  const [heightM, setHeightM] = useState(2.4)

  /* 칠할 부위 */
  const [paintWalls, setPaintWalls] = useState(true)
  const [paintCeiling, setPaintCeiling] = useState(false)
  const [paintDoors, setPaintDoors] = useState(false)
  const [paintFrame, setPaintFrame] = useState(false)
  const [extraAreaStr, setExtraAreaStr] = useState('0')

  /* 창문·문 */
  const [winPreset, setWinPreset] = useState<typeof WIN_PRESETS[number]['id']>('std')
  const [winCount, setWinCount] = useState(1)
  const [winW, setWinW] = useState(1.5)
  const [winH, setWinH] = useState(1.5)
  const [doorCount, setDoorCount] = useState(1)
  const [doorW, setDoorW] = useState(0.9)
  const [doorH, setDoorH] = useState(2.1)

  /* 페인트 종류 */
  const [paintId, setPaintId] = useState('water')
  const [brandId, setBrandId] = useState<string | null>(null)
  const [customCoverage, setCustomCoverage] = useState(10)
  const [customName, setCustomName] = useState('직접 입력')

  /* 칠할 횟수 */
  const [coats, setCoats] = useState(2)

  /* 로스율 */
  const [lossPct, setLossPct] = useState(10)

  /* 탭 2: 방·벽별 */
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
    paintWalls: boolean
    paintCeiling: boolean
    ceilingW: number
    ceilingL: number
    paintDoors: boolean
    doorCount: number
    extraArea: number
    coats: number
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
      paintWalls: true,
      paintCeiling: false,
      ceilingW: 5,
      ceilingL: 4,
      paintDoors: false,
      doorCount: 1,
      extraArea: 0,
      coats: 2,
    }
  }
  const [rooms, setRooms] = useState<RoomInput[]>([{ ...makeRoom('거실') }])

  /* 탭 3: 견적 */
  const [pricePerLStr, setPricePerLStr] = useState('18000')
  const [priceTierId, setPriceTierId] = useState<string | null>('normal')
  const [rollerCost, setRollerCost] = useState(15000)
  const [brushTapeCost, setBrushTapeCost] = useState(20000)
  const [ladderCost, setLadderCost] = useState(30000)
  const [proLaborPerL, setProLaborPerL] = useState(20000)

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* ─── 평수 ↔ 가로·세로 ─── */
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

  /* 페인트 사양 */
  const pt = PAINT_TYPES.find(p => p.id === paintId)!
  const coverage = paintId === 'custom'
    ? n(customCoverage, 0.1)
    : (brandId ? (BRANDS.find(b => b.id === brandId)?.coverage ?? pt.coveragePerL) : pt.coveragePerL)
  const paintName = paintId === 'custom' ? customName : pt.name

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

  /* ─── 탭 1 핵심 계산 ─── */
  const t1 = useMemo(() => {
    const perimeter = (tab1Dims.width + tab1Dims.length) * 2
    const wallAreaGross = paintWalls ? perimeter * heightM : 0
    const windowArea = winCount * winW * winH
    const doorAreaSubtract = doorCount * doorW * doorH
    const netWallArea = paintWalls ? Math.max(0, wallAreaGross - windowArea - doorAreaSubtract) : 0
    const ceilingArea = paintCeiling ? tab1Dims.width * tab1Dims.length : 0
    // 문 양면 도장
    const doorPaintArea = paintDoors ? doorCount * doorW * doorH * 2 : 0
    // 창틀 도장 — 창문 1개당 약 0.5㎡ 가정
    const windowFrameArea = paintFrame ? winCount * 0.5 : 0
    const extraArea = parseComma(extraAreaStr)

    const totalArea = netWallArea + ceilingArea + doorPaintArea + windowFrameArea + extraArea
    const totalAreaWithCoats = totalArea * coats
    const requiredPaintBefore = coverage > 0 ? totalAreaWithCoats / coverage : 0
    const requiredPaint = requiredPaintBefore * (1 + lossPct / 100)

    return {
      perimeter,
      wallAreaGross, windowArea, doorAreaSubtract, netWallArea,
      ceilingArea, doorPaintArea, windowFrameArea, extraArea,
      totalArea, totalAreaWithCoats,
      requiredPaintBefore, requiredPaint,
    }
  }, [tab1Dims, heightM, paintWalls, paintCeiling, paintDoors, paintFrame, winCount, winW, winH, doorCount, doorW, doorH, extraAreaStr, coverage, coats, lossPct])

  const t1Cans = useMemo(() => recommendCans(t1.requiredPaint), [t1.requiredPaint])

  /* ─── 탭 2 방·벽별 계산 ─── */
  const t2Rows = useMemo(() => {
    const rows: Array<{ roomId: string; roomName: string; part: string; area: number; coats: number; paintL: number }> = []

    rooms.forEach(r => {
      // 벽 (모든 벽 합산)
      if (r.paintWalls) {
        const wallGross = r.walls.reduce((s, w) => s + w.wallW * w.wallH, 0)
        const openingsArea = r.walls.reduce((s, w) => s + w.openings.reduce((so, o) => so + o.w * o.h, 0), 0)
        const wallNet = Math.max(0, wallGross - openingsArea)
        const paintL = (wallNet * r.coats / coverage) * (1 + lossPct / 100)
        rows.push({ roomId: r.id, roomName: r.name, part: '벽', area: wallNet, coats: r.coats, paintL })
      }
      // 천장
      if (r.paintCeiling) {
        const area = r.ceilingW * r.ceilingL
        const paintL = (area * r.coats / coverage) * (1 + lossPct / 100)
        rows.push({ roomId: r.id, roomName: r.name, part: '천장', area, coats: r.coats, paintL })
      }
      // 문 (양면)
      if (r.paintDoors && r.doorCount > 0) {
        const area = r.doorCount * 0.9 * 2.1 * 2
        const paintL = (area * r.coats / coverage) * (1 + lossPct / 100)
        rows.push({ roomId: r.id, roomName: r.name, part: `문 양면 (${r.doorCount}개)`, area, coats: r.coats, paintL })
      }
      // 기타
      if (r.extraArea > 0) {
        const paintL = (r.extraArea * r.coats / coverage) * (1 + lossPct / 100)
        rows.push({ roomId: r.id, roomName: r.name, part: '기타', area: r.extraArea, coats: r.coats, paintL })
      }
    })
    return rows
  }, [rooms, coverage, lossPct])

  const t2Total = useMemo(() => {
    return t2Rows.reduce(
      (acc, r) => ({ area: acc.area + r.area, paint: acc.paint + r.paintL }),
      { area: 0, paint: 0 }
    )
  }, [t2Rows])
  const t2Cans = useMemo(() => recommendCans(t2Total.paint), [t2Total.paint])

  /* ─── 탭 3 견적 (탭 1 기준 자동 사용) ─── */
  const usedPaintL = tab === 'detail' ? t2Total.paint : t1.requiredPaint
  const usedArea = tab === 'detail' ? t2Total.area : t1.totalArea
  const usedCans = tab === 'detail' ? t2Cans : t1Cans
  const totalCans = usedCans.best?.total ?? Math.ceil(usedPaintL)
  const pricePerL = parseComma(pricePerLStr)
  const paintTotalCost = totalCans * pricePerL  // 구매 용량 기준
  const selfTotal = paintTotalCost + rollerCost + brushTapeCost + (paintCeiling ? ladderCost : 0)
  const proLaborTotal = proLaborPerL * usedPaintL
  const proTotal = paintTotalCost + proLaborTotal
  const usedPyung = usedArea / PYUNG_TO_M2
  const selfPerPyung = usedPyung > 0 ? selfTotal / usedPyung : 0
  const proPerPyung = usedPyung > 0 ? proTotal / usedPyung : 0

  function selectPriceTier(id: string) {
    setPriceTierId(id)
    const t = PRICE_TIERS.find(x => x.id === id)
    if (t) setPricePerLStr(String(t.price))
  }
  function selectPaint(id: string) {
    setPaintId(id)
    setBrandId(null)
    if (id !== 'custom') {
      const p = PAINT_TYPES.find(x => x.id === id)!
      setCustomCoverage(p.coveragePerL)
      setPricePerLStr(String(p.defaultPrice))
      setPriceTierId(null)
    }
  }
  function selectBrand(id: string) {
    setBrandId(id === brandId ? null : id)
  }

  /* 방 추가/삭제·벽 수정 (탭 2) */
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
        '🎨 페인트 소요량 계산 결과',
        `공간: ${effectivePyung}평 (${tab1Dims.width.toFixed(2)}m × ${tab1Dims.length.toFixed(2)}m × ${heightM}m)`,
        `페인트: ${paintName} (1L당 ${coverage}㎡)`,
        `시공 면적: ${fmt(t1.totalArea)}㎡ × ${coats}회 도장 + 로스율 ${lossPct}% = ${fmt(t1.requiredPaint, 2)}L 필요`,
      )
      if (t1Cans.best) {
        const c = t1Cans.best
        const partsStr = [
          c.c18 > 0 ? `18L × ${c.c18}` : null,
          c.c4 > 0 ? `4L × ${c.c4}` : null,
          c.c2 > 0 ? `2L × ${c.c2}` : null,
          c.c1 > 0 ? `1L × ${c.c1}` : null,
        ].filter(Boolean).join(' + ')
        lines.push(`추천 구매: ${partsStr} = ${c.total}L (여유 ${c.surplus.toFixed(1)}L)`)
      }
    } else if (tab === 'detail') {
      lines.push('🎨 페인트 소요량 (상세)')
      t2Rows.forEach(r => {
        lines.push(`  ${r.roomName} ${r.part}: ${fmt(r.area)}㎡ × ${r.coats}회 = ${fmt(r.paintL, 2)}L`)
      })
      lines.push(`합계: ${fmt(t2Total.area)}㎡ → ${fmt(t2Total.paint, 2)}L 필요`)
      if (t2Cans.best) {
        const c = t2Cans.best
        lines.push(`추천 구매: 18L×${c.c18} + 4L×${c.c4} + 2L×${c.c2} + 1L×${c.c1} = ${c.total}L`)
      }
    } else {
      lines.push(
        '🎨 페인트 견적',
        `${paintName} ${totalCans}L × ${fmtKRW(pricePerL)} = ${fmtKRW(paintTotalCost)}`,
        `셀프 시공 합계: ${fmtKRW(selfTotal)}`,
        `전문 시공 합계: ${fmtKRW(proTotal)}`,
      )
    }
    lines.push('youtil.kr/tools/interior/paint')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  const pyungOptions = [5, 7, 10, 12, 15, 18, 20, 22, 25, 28, 30, 33, 35, 40]

  /* ────────────────────────────── 렌더 ────────────────────────────── */
  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 계산기는 한국 표준(수성 1L당 약 10㎡, 2회 도장) 기준 참고용</strong>입니다.
        실제 도장 면적은 제품·표면 흡수율·시공 방식에 따라 달라질 수 있으며 정확한 견적은 제조사 권장사항을 확인하세요.
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
              <span>칠할 부위</span>
              <span className={styles.cardLabelHint}>복수 선택 가능</span>
            </div>
            <div className={styles.partsGrid}>
              <label className={`${styles.partCard} ${styles.partWalls} ${paintWalls ? styles.partActive : ''}`}>
                <input type="checkbox" checked={paintWalls} onChange={e => setPaintWalls(e.target.checked)} />
                <div>
                  <div className={styles.partLabel}>🟩 벽</div>
                  <span className={styles.partSub}>4면 둘레 × 천장 높이</span>
                </div>
              </label>
              <label className={`${styles.partCard} ${styles.partCeiling} ${paintCeiling ? styles.partActive : ''}`}>
                <input type="checkbox" checked={paintCeiling} onChange={e => setPaintCeiling(e.target.checked)} />
                <div>
                  <div className={styles.partLabel}>⬜ 천장</div>
                  <span className={styles.partSub}>방 면적</span>
                </div>
              </label>
              <label className={`${styles.partCard} ${styles.partDoors} ${paintDoors ? styles.partActive : ''}`}>
                <input type="checkbox" checked={paintDoors} onChange={e => setPaintDoors(e.target.checked)} />
                <div>
                  <div className={styles.partLabel}>🚪 문 (양면)</div>
                  <span className={styles.partSub}>1개당 약 3.78㎡ × 양면</span>
                </div>
              </label>
              <label className={`${styles.partCard} ${styles.partFrame} ${paintFrame ? styles.partActive : ''}`}>
                <input type="checkbox" checked={paintFrame} onChange={e => setPaintFrame(e.target.checked)} />
                <div>
                  <div className={styles.partLabel}>🪟 창틀·몰딩</div>
                  <span className={styles.partSub}>창문 1개당 약 0.5㎡</span>
                </div>
              </label>
            </div>

            <div style={{ height: 12 }} />
            <span className={styles.subLabel}>기타 도장 면적 (㎡)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="decimal" value={extraAreaStr} onChange={e => setExtraAreaStr(e.target.value)} />
              <span className={styles.unit}>㎡</span>
            </div>
          </div>

          {paintWalls && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>창문 · 문</span>
                <span className={styles.cardLabelHint}>벽 면적에서 차감</span>
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

              <div style={{ height: 12 }} />
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
          )}
        </>
      )}

      {/* ────────────── 공통: 페인트·횟수·로스 ────────────── */}
      {tab !== 'quote' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>페인트 종류</span>
              <span className={styles.cardLabelHint}>1L당 도장 면적</span>
            </div>
            <div className={styles.paintGrid}>
              {PAINT_TYPES.filter(p => p.id !== 'custom').map(p => (
                <button key={p.id} type="button" className={`${styles.paintCard} ${styles[p.cls]} ${paintId === p.id ? styles.pntActive : ''}`} onClick={() => selectPaint(p.id)}>
                  <p className={styles.paintName}>{p.name}</p>
                  <p className={styles.paintCoverage}>1L당 약 {p.coveragePerL}㎡</p>
                  {p.badge && <span className={`${styles.paintBadge} ${styles[p.badgeCls]}`}>{p.badge}</span>}
                </button>
              ))}
              <button type="button" className={`${styles.paintCard} ${styles.pntCustom} ${paintId === 'custom' ? styles.pntActive : ''}`} onClick={() => selectPaint('custom')}>
                <p className={styles.paintName}>⚙️ 직접 입력</p>
                <p className={styles.paintCoverage}>제품별 다름</p>
              </button>
            </div>

            {paintId !== 'custom' && (
              <>
                <span className={styles.subLabel} style={{ marginTop: 14 }}>한국 브랜드 프리셋 (선택, coverage 보정)</span>
                <div className={styles.brandRow}>
                  {BRANDS.map(b => (
                    <button key={b.id} type="button" className={`${styles.brandBtn} ${styles[b.cls]} ${brandId === b.id ? styles.brandActive : ''}`} onClick={() => selectBrand(b.id)}>
                      {b.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
                  현재 적용 — <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>1L당 {coverage}㎡</strong>
                  {brandId && ` (${BRANDS.find(b => b.id === brandId)?.label} 보정)`}
                </p>
              </>
            )}

            {paintId === 'custom' && (
              <div className={styles.coverageInputRow}>
                <div>
                  <span className={styles.subLabel}>제품명</span>
                  <input className={styles.textInput} type="text" value={customName} onChange={e => setCustomName(e.target.value)} />
                </div>
                <div>
                  <span className={styles.subLabel}>1L당 도장 면적 (㎡)</span>
                  <input className={styles.smallInput} type="number" step={0.5} min={1} value={customCoverage} onChange={e => setCustomCoverage(n(e.target.value, 0.5))} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>칠할 횟수</span>
              <span className={styles.cardLabelHint}>2회 표준 권장</span>
            </div>
            <div className={styles.coatGrid}>
              <button type="button" className={`${styles.coatBtn} ${styles.coatOnce} ${coats === 1 ? styles.coatActive : ''}`}  onClick={() => setCoats(1)}>
                <small>1회</small>덧칠·간단
              </button>
              <button type="button" className={`${styles.coatBtn} ${styles.coatTwice} ${coats === 2 ? styles.coatActive : ''}`} onClick={() => setCoats(2)}>
                <small>2회</small>한국 표준
              </button>
              <button type="button" className={`${styles.coatBtn} ${styles.coatThree} ${coats === 3 ? styles.coatActive : ''}`} onClick={() => setCoats(3)}>
                <small>3회</small>색상 변경
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>로스율 (여유분)</span>
              <span className={styles.cardLabelHint}>10% 표준 권장</span>
            </div>
            <div className={styles.lossGrid}>
              <button type="button" className={`${styles.lossBtn} ${styles.lossSafe} ${lossPct === 5 ? styles.lossActive : ''}`}  onClick={() => setLossPct(5)}>
                <small>5%</small>단순 평면
              </button>
              <button type="button" className={`${styles.lossBtn} ${styles.lossStd} ${lossPct === 10 ? styles.lossActive : ''}`}  onClick={() => setLossPct(10)}>
                <small>10%</small>한국 표준
              </button>
              <button type="button" className={`${styles.lossBtn} ${styles.lossWarn} ${lossPct === 15 ? styles.lossActive : ''}`} onClick={() => setLossPct(15)}>
                <small>15%</small>모서리 많음
              </button>
            </div>
          </div>
        </>
      )}

      {/* ────────────── 탭 1 결과 ────────────── */}
      {tab === 'simple' && (
        <>
          <div className={styles.hero}>
            <p className={styles.heroLead}>필요한 페인트</p>
            <p className={styles.heroNum}>{fmt(t1.requiredPaint, 1)}<span className={styles.heroUnit}>L</span></p>
            <p className={styles.heroSub}>{paintName} · {coats}회 도장 · 로스율 {lossPct}% 포함</p>
          </div>

          {t1Cans.best && (
            <div className={styles.canRecCard}>
              <p className={styles.canRecLabel}>📦 추천 구매 조합</p>
              <div className={styles.canRecCombo}>
                {(() => {
                  const c = t1Cans.best
                  const items: Array<{ size: number; count: number }> = []
                  if (c.c18 > 0) items.push({ size: 18, count: c.c18 })
                  if (c.c4 > 0)  items.push({ size: 4,  count: c.c4 })
                  if (c.c2 > 0)  items.push({ size: 2,  count: c.c2 })
                  if (c.c1 > 0)  items.push({ size: 1,  count: c.c1 })
                  return items.flatMap((it, i) => {
                    const elements: ReactNode[] = []
                    if (i > 0) elements.push(<span key={`p-${i}`} className={styles.canPlus}>+</span>)
                    elements.push(
                      <div key={`c-${i}`} className={styles.canIcon}>
                        <CanSvg size={it.size} />
                        <span className={styles.canCount}>× {it.count}</span>
                        <span className={styles.canSize}>{it.size}L</span>
                      </div>
                    )
                    return elements
                  })
                })()}
              </div>
              <p className={styles.canTotalLine}>
                총 <strong>{t1Cans.best.total}L</strong> ({t1Cans.best.cans}통)
              </p>
              <p className={styles.canSurplus}>
                필요량 {fmt(t1.requiredPaint, 1)}L 대비 여유 {fmt(t1Cans.best.surplus, 1)}L
              </p>
              {t1Cans.alts.length > 0 && (
                <div className={styles.altCombosBox}>
                  <strong>대안 (안전 마진 더 큼):</strong><br />
                  {t1Cans.alts.map((c, i) => {
                    const parts = [
                      c.c18 > 0 ? `18L×${c.c18}` : null,
                      c.c4 > 0  ? `4L×${c.c4}` : null,
                      c.c2 > 0  ? `2L×${c.c2}` : null,
                      c.c1 > 0  ? `1L×${c.c1}` : null,
                    ].filter(Boolean).join(' + ')
                    return <div key={i}>• {parts} = {c.total}L (여유 {fmt(c.surplus, 1)}L)</div>
                  })}
                </div>
              )}
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>면적 Breakdown</span></div>
            <table className={styles.breakdownTable}>
              <tbody>
                {t1.wallAreaGross > 0 && <tr><td>벽 면적 (둘레 × 높이)</td><td>{fmt(t1.wallAreaGross)}㎡</td></tr>}
                {t1.windowArea > 0 && <tr className={styles.subRow}><td>창문 차감 ({winCount}개)</td><td>−{fmt(t1.windowArea)}㎡</td></tr>}
                {t1.doorAreaSubtract > 0 && paintWalls && <tr className={styles.subRow}><td>문 면적 차감 ({doorCount}개)</td><td>−{fmt(t1.doorAreaSubtract)}㎡</td></tr>}
                {t1.ceilingArea > 0 && <tr className={styles.addRow}><td>천장 추가</td><td>+{fmt(t1.ceilingArea)}㎡</td></tr>}
                {t1.doorPaintArea > 0 && <tr className={styles.addRow}><td>문 도장 (양면)</td><td>+{fmt(t1.doorPaintArea)}㎡</td></tr>}
                {t1.windowFrameArea > 0 && <tr className={styles.addRow}><td>창틀 도장</td><td>+{fmt(t1.windowFrameArea)}㎡</td></tr>}
                {t1.extraArea > 0 && <tr className={styles.addRow}><td>기타 면적</td><td>+{fmt(t1.extraArea)}㎡</td></tr>}
                <tr><td>1회 도장 면적</td><td>{fmt(t1.totalArea)}㎡</td></tr>
                {coats > 1 && <tr className={styles.coatRow}><td>{coats}회 도장 시</td><td>× {coats} = {fmt(t1.totalAreaWithCoats)}㎡</td></tr>}
                <tr className={styles.addRow}><td>로스율 {lossPct}% 추가</td><td>+{fmt(t1.totalAreaWithCoats * (lossPct / 100))}㎡</td></tr>
                <tr className={styles.totalRow}><td>최종 시공 면적</td><td>{fmt(t1.totalAreaWithCoats * (1 + lossPct / 100))}㎡</td></tr>
              </tbody>
            </table>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
              💡 1L당 도장 면적 <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{coverage}㎡</strong> 기준 → 정확 필요량 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmt(t1.requiredPaint, 2)}L</strong>
            </p>
          </div>

          {/* 평면도 SVG */}
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>평면도 (단순화)</span></div>
            <div className={styles.floorPlanWrap}>
              {(() => {
                const VBW = 360, VBH = 240, padding = 40
                const w = tab1Dims.width, l = tab1Dims.length
                const ratio = w / l
                let drawW = VBW - padding * 2
                let drawH = VBH - padding * 2
                if (ratio > drawW / drawH) drawH = drawW / ratio
                else drawW = drawH * ratio
                const x0 = (VBW - drawW) / 2
                const y0 = (VBH - drawH) / 2
                return (
                  <svg className={styles.floorPlanSvg} viewBox={`0 0 ${VBW} ${VBH}`} aria-hidden="true">
                    {/* 천장 도장 시 dim 표시 */}
                    <rect x={x0} y={y0} width={drawW} height={drawH}
                      fill={paintCeiling ? 'rgba(62,200,255,0.10)' : 'rgba(232,151,87,0.05)'}
                      stroke="#fff" strokeWidth={2} />
                    {paintWalls && (
                      <rect x={x0 + 4} y={y0 + 4} width={drawW - 8} height={drawH - 8} fill="none" stroke="var(--accent)" strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />
                    )}
                    <text x={x0 + drawW / 2} y={y0 - 10} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="monospace">{w.toFixed(2)}m</text>
                    <text x={x0 - 8} y={y0 + drawH / 2} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="monospace" transform={`rotate(-90 ${x0 - 8} ${y0 + drawH / 2})`}>{l.toFixed(2)}m</text>
                    {paintCeiling && (
                      <text x={x0 + drawW / 2} y={y0 + drawH / 2} textAnchor="middle" fill="#3EC8FF" fontSize="13" fontFamily="monospace" fontWeight={700}>천장 도장</text>
                    )}
                    {/* 창문 (위) */}
                    {winCount > 0 && winW > 0 && (
                      <line x1={x0 + drawW * 0.3} y1={y0} x2={x0 + drawW * 0.7} y2={y0} stroke="#3EC8FF" strokeWidth={5} />
                    )}
                    {/* 문 (아래) */}
                    {doorCount > 0 && doorW > 0 && (
                      <line x1={x0 + drawW * 0.7} y1={y0 + drawH} x2={x0 + drawW * 0.85} y2={y0 + drawH} stroke="#FF8C3E" strokeWidth={5} />
                    )}
                    <text x={x0 + drawW / 2} y={y0 + drawH + 22} textAnchor="middle" fill="var(--accent)" fontSize="11" fontFamily="monospace" fontWeight={700}>둘레 {fmt(t1.perimeter, 2)}m</text>
                  </svg>
                )
              })()}
            </div>
          </div>
        </>
      )}

      {/* ────────────── 탭 2: 상세 ────────────── */}
      {tab === 'detail' && (
        <>
          {rooms.map(r => (
            <div key={r.id} className={styles.roomBlock}>
              <div className={styles.roomHeader}>
                <input className={styles.roomHeaderInput} type="text" value={r.name} onChange={e => updateRoom(r.id, { name: e.target.value || '방' })} />
                {rooms.length > 1 && (
                  <button type="button" className={styles.removeRoomBtn} onClick={() => removeRoom(r.id)}>방 삭제</button>
                )}
              </div>

              <div className={styles.partsGrid}>
                <label className={`${styles.partCard} ${styles.partWalls} ${r.paintWalls ? styles.partActive : ''}`}>
                  <input type="checkbox" checked={r.paintWalls} onChange={e => updateRoom(r.id, { paintWalls: e.target.checked })} />
                  <div><div className={styles.partLabel}>벽</div></div>
                </label>
                <label className={`${styles.partCard} ${styles.partCeiling} ${r.paintCeiling ? styles.partActive : ''}`}>
                  <input type="checkbox" checked={r.paintCeiling} onChange={e => updateRoom(r.id, { paintCeiling: e.target.checked })} />
                  <div><div className={styles.partLabel}>천장</div></div>
                </label>
              </div>

              {r.paintWalls && r.walls.map(w => (
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

              {r.paintCeiling && (
                <div className={styles.wallDimRow} style={{ marginTop: 10 }}>
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

              <label className={styles.toggleRow} style={{ marginTop: 10 }}>
                <input type="checkbox" checked={r.paintDoors} onChange={e => updateRoom(r.id, { paintDoors: e.target.checked })} />
                <span>문 도장 (양면)</span>
              </label>
              {r.paintDoors && (
                <div className={styles.openingRow} style={{ marginTop: 6, gridTemplateColumns: '1fr' }}>
                  <div>
                    <span className={styles.subLabel}>문 개수</span>
                    <input className={styles.smallInput} type="number" min={0} value={r.doorCount} onChange={e => updateRoom(r.id, { doorCount: Math.max(0, Number(e.target.value) || 0) })} />
                  </div>
                </div>
              )}

              <div style={{ height: 10 }} />
              <span className={styles.subLabel}>기타 면적 (몰딩·걸레받이·가구) (㎡)</span>
              <div className={styles.inputRow}>
                <input className={styles.smallInput} type="number" step={0.5} min={0} value={r.extraArea} onChange={e => updateRoom(r.id, { extraArea: n(e.target.value) })} />
                <span className={styles.unit}>㎡</span>
              </div>

              <div style={{ height: 10 }} />
              <span className={styles.subLabel}>이 방의 도장 횟수</span>
              <div className={styles.coatGrid}>
                <button type="button" className={`${styles.coatBtn} ${styles.coatOnce} ${r.coats === 1 ? styles.coatActive : ''}`}  onClick={() => updateRoom(r.id, { coats: 1 })}><small>1회</small></button>
                <button type="button" className={`${styles.coatBtn} ${styles.coatTwice} ${r.coats === 2 ? styles.coatActive : ''}`} onClick={() => updateRoom(r.id, { coats: 2 })}><small>2회</small></button>
                <button type="button" className={`${styles.coatBtn} ${styles.coatThree} ${r.coats === 3 ? styles.coatActive : ''}`} onClick={() => updateRoom(r.id, { coats: 3 })}><small>3회</small></button>
              </div>
            </div>
          ))}

          {rooms.length < 10 && (
            <button type="button" className={styles.addBtn} onClick={addRoom}>+ 방 추가 ({rooms.length}/10)</button>
          )}

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>방·면별 합계</span>
              <span className={styles.cardLabelHint}>{paintName} · 1L당 {coverage}㎡ · 로스율 {lossPct}%</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.summaryTable}>
                <thead>
                  <tr><th>공간</th><th>부위</th><th>면적</th><th>회수</th><th>페인트</th></tr>
                </thead>
                <tbody>
                  {t2Rows.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 18 }}>방의 칠할 부위를 선택하세요</td></tr>
                  )}
                  {t2Rows.map((r, i) => (
                    <tr key={i}>
                      <td>{r.roomName}</td>
                      <td>{r.part}</td>
                      <td>{fmt(r.area)}㎡</td>
                      <td>{r.coats}회</td>
                      <td>{fmt(r.paintL, 2)}L</td>
                    </tr>
                  ))}
                  {t2Rows.length > 0 && (
                    <tr className={styles.summaryTotal}>
                      <td>합계</td>
                      <td>—</td>
                      <td>{fmt(t2Total.area)}㎡</td>
                      <td>—</td>
                      <td>{fmt(t2Total.paint, 2)}L</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {t2Cans.best && (
              <div className={styles.canRecCard} style={{ marginTop: 16 }}>
                <p className={styles.canRecLabel}>📦 추천 구매 조합</p>
                <div className={styles.canRecCombo}>
                  {(() => {
                    const c = t2Cans.best
                    const items: Array<{ size: number; count: number }> = []
                    if (c.c18 > 0) items.push({ size: 18, count: c.c18 })
                    if (c.c4 > 0)  items.push({ size: 4,  count: c.c4 })
                    if (c.c2 > 0)  items.push({ size: 2,  count: c.c2 })
                    if (c.c1 > 0)  items.push({ size: 1,  count: c.c1 })
                    return items.flatMap((it, i) => {
                      const elements: React.ReactNode[] = []
                      if (i > 0) elements.push(<span key={`p-${i}`} className={styles.canPlus}>+</span>)
                      elements.push(
                        <div key={`c-${i}`} className={styles.canIcon}>
                          <CanSvg size={it.size} />
                          <span className={styles.canCount}>× {it.count}</span>
                          <span className={styles.canSize}>{it.size}L</span>
                        </div>
                      )
                      return elements
                    })
                  })()}
                </div>
                <p className={styles.canTotalLine}>총 <strong>{t2Cans.best.total}L</strong> ({t2Cans.best.cans}통)</p>
                <p className={styles.canSurplus}>필요량 {fmt(t2Total.paint, 1)}L 대비 여유 {fmt(t2Cans.best.surplus, 1)}L</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ────────────── 탭 3: 견적 ────────────── */}
      {tab === 'quote' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>견적 기준</span>
              <span className={styles.cardLabelHint}>{tab === 'quote' ? `필요 ${fmt(usedPaintL, 1)}L · 구매 ${totalCans}L` : ''}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
              간편 계산 기준 — 시공 면적 <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{fmt(usedArea)}㎡</strong> ({fmt(usedPyung, 1)}평) · 필요 페인트 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmt(usedPaintL, 1)}L</strong> · 추천 구매 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{totalCans}L</strong>
            </p>

            <span className={styles.subLabel}>페인트 1L 가격</span>
            <div className={styles.priceTierGrid}>
              {PRICE_TIERS.map(t => (
                <button key={t.id} type="button" className={`${styles.priceTierBtn} ${priceTierId === t.id ? styles.priceTierActive : ''}`} onClick={() => selectPriceTier(t.id)}>
                  {t.label}
                  <small>{(t.price / 1000).toLocaleString()}k</small>
                </button>
              ))}
            </div>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric"
                value={fmt(pricePerL, 0)}
                onChange={e => { setPricePerLStr(parseComma(e.target.value).toString()); setPriceTierId(null) }} />
              <span className={styles.unit}>원/L</span>
            </div>

            <div style={{ height: 12 }} />
            <span className={styles.subLabel}>롤러·트레이 세트 (셀프, 1회)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={1000} min={0} value={rollerCost} onChange={e => setRollerCost(n(e.target.value))} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>붓·테이프·커버 (셀프, 1세트)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={1000} min={0} value={brushTapeCost} onChange={e => setBrushTapeCost(n(e.target.value))} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>사다리 (천장 도장 시)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={5000} min={0} value={ladderCost} onChange={e => setLadderCost(n(e.target.value))} />
              <span className={styles.unit}>원</span>
            </div>

            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>전문 시공 인건비 (1L당)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" step={1000} min={0} value={proLaborPerL} onChange={e => setProLaborPerL(n(e.target.value))} />
              <span className={styles.unit}>원/L</span>
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
                    <td>페인트 ({paintName})</td>
                    <td>{fmt(pricePerL, 0)}원/L</td>
                    <td>{totalCans}L</td>
                    <td>{fmtKRW(paintTotalCost)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>롤러·트레이</td>
                    <td>—</td>
                    <td>1세트</td>
                    <td>{fmtKRW(rollerCost)}</td>
                  </tr>
                  <tr className={styles.selfRow}>
                    <td>붓·테이프·커버</td>
                    <td>—</td>
                    <td>1세트</td>
                    <td>{fmtKRW(brushTapeCost)}</td>
                  </tr>
                  {paintCeiling && (
                    <tr className={styles.selfRow}>
                      <td>사다리</td>
                      <td>—</td>
                      <td>1</td>
                      <td>{fmtKRW(ladderCost)}</td>
                    </tr>
                  )}
                  <tr className={styles.totalRowSelf}>
                    <td>🔧 셀프 시공 합계</td>
                    <td colSpan={2}></td>
                    <td>{fmtKRW(selfTotal)}</td>
                  </tr>
                  <tr className={styles.proRow}>
                    <td>전문 시공 인건비</td>
                    <td>{fmt(proLaborPerL, 0)}원/L</td>
                    <td>{fmt(usedPaintL, 1)}L</td>
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
            <br />한국 평균: 셀프 5,000~10,000원/평 · 전문 15,000~25,000원/평
          </div>
        </>
      )}

      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
 * 페인트 통 SVG 아이콘
 * ───────────────────────────────────────────────────────── */
function CanSvg({ size }: { size: number }) {
  // 사이즈별 크기 비례 (18L > 4L > 2L > 1L)
  const dim = size === 18 ? 56 : size === 4 ? 38 : size === 2 ? 30 : 24
  const color = size === 18 ? '#C8FF3E' : size === 4 ? '#3EFF9B' : size === 2 ? '#3EC8FF' : '#FFD700'
  return (
    <svg width={dim} height={dim * 1.1} viewBox="0 0 50 56" aria-hidden="true">
      {/* 손잡이 */}
      <path d="M 12 8 Q 25 -2 38 8" stroke={color} strokeWidth={2} fill="none" opacity={0.7} />
      {/* 통 본체 */}
      <rect x={6} y={10} width={38} height={42} rx={2} fill="rgba(255,255,255,0.04)" stroke={color} strokeWidth={2} />
      {/* 라벨 */}
      <rect x={10} y={20} width={30} height={20} rx={1.5} fill={color} opacity={0.18} />
      <text x={25} y={34} textAnchor="middle" fill={color} fontSize="11" fontFamily="'Syne', sans-serif" fontWeight={800}>{size}L</text>
    </svg>
  )
}
