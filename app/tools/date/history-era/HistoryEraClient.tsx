'use client'
import { useState, useMemo } from 'react'
import styles from './history-era.module.css'

// ─── 상수 ───────────────────────────────────────────────────────────────────

const STEMS_KR    = ['갑','을','병','정','무','기','경','신','임','계']
const BRANCHES_KR = ['자','축','인','묘','진','사','오','미','신','유','술','해']
const STEMS_HJ    = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
const BRANCHES_HJ = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const ANIMALS     = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지']

// 천문학적 연도 기준 (year 0 = 기원전 1년)
function ganjjiOf(y: number) {
  const s = ((y - 4) % 10 + 10) % 10
  const b = ((y - 4) % 12 + 12) % 12
  return { s, b }
}

function ganjjiLabel(y: number): string {
  const { s, b } = ganjjiOf(y)
  return `${STEMS_KR[s]}${BRANCHES_KR[b]}년 (${STEMS_HJ[s]}${BRANCHES_HJ[b]}) · ${ANIMALS[b]}의 해`
}

// 천문학적 연도 → 표시용 문자열
function adDisplay(y: number): string {
  if (y > 0) return `서기 ${y}년`
  if (y === 0) return '기원전 1년'
  return `기원전 ${1 - y}년`
}

// ─── 연호 데이터 ─────────────────────────────────────────────────────────────

interface Era {
  id: string; name: string; hanja: string; group: string
  baseYear: number; startAD: number; endAD?: number
}

// baseYear: 서기(천문학) = 연호년 + baseYear
const ERAS: Era[] = [
  { id:'dangi',    name:'단기',    hanja:'檀紀', group:'korean',   baseYear:-2333, startAD:-2332 },
  { id:'bulgi',    name:'불기',    hanja:'佛紀', group:'korean',   baseYear:-544,  startAD:-543  },
  { id:'hwanggi',  name:'황기',    hanja:'皇紀', group:'korean',   baseYear:-660,  startAD:-659  },
  { id:'meiji',    name:'메이지',  hanja:'明治', group:'japanese', baseYear:1867,  startAD:1868, endAD:1912 },
  { id:'taisho',   name:'다이쇼',  hanja:'大正', group:'japanese', baseYear:1911,  startAD:1912, endAD:1926 },
  { id:'showa',    name:'쇼와',    hanja:'昭和', group:'japanese', baseYear:1925,  startAD:1926, endAD:1989 },
  { id:'heisei',   name:'헤이세이',hanja:'平成', group:'japanese', baseYear:1988,  startAD:1989, endAD:2019 },
  { id:'reiwa',    name:'레이와',  hanja:'令和', group:'japanese', baseYear:2018,  startAD:2019  },
  { id:'hongwu',   name:'홍무',    hanja:'洪武', group:'chinese',  baseYear:1367,  startAD:1368, endAD:1398 },
  { id:'yongle',   name:'영락',    hanja:'永樂', group:'chinese',  baseYear:1402,  startAD:1403, endAD:1424 },
  { id:'kangxi',   name:'강희',    hanja:'康熙', group:'chinese',  baseYear:1661,  startAD:1662, endAD:1722 },
  { id:'qianlong', name:'건륭',    hanja:'乾隆', group:'chinese',  baseYear:1735,  startAD:1736, endAD:1795 },
  { id:'guangxu',  name:'광서',    hanja:'光緖', group:'chinese',  baseYear:1874,  startAD:1875, endAD:1908 },
  { id:'xuantong', name:'선통',    hanja:'宣統', group:'chinese',  baseYear:1908,  startAD:1909, endAD:1912 },
  { id:'minguo',   name:'민국',    hanja:'民國', group:'chinese',  baseYear:1911,  startAD:1912, endAD:1949 },
]

const ERAS_BY: Record<string, Era[]> = {
  korean:   ERAS.filter(e => e.group === 'korean'),
  japanese: ERAS.filter(e => e.group === 'japanese'),
  chinese:  ERAS.filter(e => e.group === 'chinese'),
}

interface King { num: number; name: string; startAD: number; endAD: number }

const JOSEON_KINGS: King[] = [
  {num:1, name:'태조',   startAD:1392, endAD:1398},
  {num:2, name:'정종',   startAD:1399, endAD:1400},
  {num:3, name:'태종',   startAD:1401, endAD:1418},
  {num:4, name:'세종',   startAD:1419, endAD:1450},
  {num:5, name:'문종',   startAD:1451, endAD:1452},
  {num:6, name:'단종',   startAD:1453, endAD:1455},
  {num:7, name:'세조',   startAD:1455, endAD:1468},
  {num:8, name:'예종',   startAD:1469, endAD:1469},
  {num:9, name:'성종',   startAD:1469, endAD:1494},
  {num:10,name:'연산군', startAD:1494, endAD:1506},
  {num:11,name:'중종',   startAD:1506, endAD:1544},
  {num:12,name:'인종',   startAD:1544, endAD:1545},
  {num:13,name:'명종',   startAD:1545, endAD:1567},
  {num:14,name:'선조',   startAD:1567, endAD:1608},
  {num:15,name:'광해군', startAD:1608, endAD:1623},
  {num:16,name:'인조',   startAD:1623, endAD:1649},
  {num:17,name:'효종',   startAD:1649, endAD:1659},
  {num:18,name:'현종',   startAD:1659, endAD:1674},
  {num:19,name:'숙종',   startAD:1674, endAD:1720},
  {num:20,name:'경종',   startAD:1720, endAD:1724},
  {num:21,name:'영조',   startAD:1724, endAD:1776},
  {num:22,name:'정조',   startAD:1776, endAD:1800},
  {num:23,name:'순조',   startAD:1800, endAD:1834},
  {num:24,name:'헌종',   startAD:1834, endAD:1849},
  {num:25,name:'철종',   startAD:1849, endAD:1863},
  {num:26,name:'고종',   startAD:1863, endAD:1907},
  {num:27,name:'순종',   startAD:1907, endAD:1910},
]

// 역사 이벤트: 천문학적 연도 사용 (기원전 N년 = -(N-1))
const EVENTS: [number, string][] = [
  [-2332,'고조선 건국 (단군왕검)'],
  [-107, '고조선 멸망·한사군 설치'],
  [-56,  '신라 건국 (박혁거세)'],
  [-36,  '고구려 건국 (주몽)'],
  [-17,  '백제 건국 (온조)'],
  [372,  '고구려 불교 전래·태학 설립'],
  [392,  '광개토대왕 즉위'],
  [427,  '고구려 평양 천도'],
  [527,  '신라 불교 공인'],
  [612,  '살수대첩 (을지문덕)'],
  [660,  '백제 멸망'],
  [668,  '고구려 멸망'],
  [676,  '신라 삼국통일'],
  [698,  '발해 건국 (대조영)'],
  [918,  '고려 건국 (왕건)'],
  [936,  '후삼국 통일'],
  [1019, '귀주대첩 (강감찬)'],
  [1170, '무신정변'],
  [1231, '몽골 1차 침략'],
  [1392, '조선 건국 (태조)'],
  [1446, '훈민정음 반포'],
  [1592, '임진왜란 발발'],
  [1636, '병자호란'],
  [1776, '정조 즉위·규장각 설립'],
  [1876, '강화도 조약'],
  [1894, '갑오개혁·동학농민운동'],
  [1897, '대한제국 선포'],
  [1910, '국권 피탈 (경술국치)'],
  [1919, '3·1 운동·임시정부 수립'],
  [1945, '광복 (8·15)'],
  [1948, '대한민국 정부 수립'],
  [1950, '6·25 전쟁 발발'],
  [1953, '6·25 전쟁 휴전'],
  [1960, '4·19 혁명'],
  [1987, '6·10 민주항쟁'],
  [1988, '서울 올림픽'],
  [2002, '한일 FIFA 월드컵'],
]

const GROUP_LABELS: Record<string, string> = {
  korean: '한국 기년', japanese: '일본 연호', chinese: '중국·기타', joseon: '조선 왕실',
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

type TabId = 'era2ad' | 'ad2era' | 'ganjji' | 'timeline'
const TAB_LABELS: [TabId, string][] = [
  ['era2ad','연호→서기'], ['ad2era','서기→연호'], ['ganjji','간지 변환'], ['timeline','역사 연표'],
]

export default function HistoryEraClient() {
  const [tab, setTab] = useState<TabId>('era2ad')
  return (
    <div className={styles.wrap}>
      <nav className={styles.tabs}>
        {TAB_LABELS.map(([t, label]) => (
          <button key={t} className={`${styles.tab}${tab === t ? ' ' + styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {label}
          </button>
        ))}
      </nav>
      {tab === 'era2ad'   && <EraToADTab />}
      {tab === 'ad2era'   && <ADToEraTab />}
      {tab === 'ganjji'   && <GanjjiTab />}
      {tab === 'timeline' && <TimelineTab />}
    </div>
  )
}

// ─── Tab 1: 연호 → 서기 ─────────────────────────────────────────────────────

type EraType = 'korean' | 'joseon' | 'japanese' | 'chinese'
type E2AResult = { ad: number; ganjji: string } | { error: string } | null

const ERA_TYPE_LABELS: [EraType, string][] = [
  ['korean','한국 기년'], ['joseon','조선 왕'], ['japanese','일본 연호'], ['chinese','중국·기타'],
]

function EraToADTab() {
  const [eraType, setEraType] = useState<EraType>('korean')
  const [eraId,   setEraId]   = useState('dangi')
  const [kingIdx, setKingIdx] = useState(0)
  const [yearStr, setYearStr] = useState('')

  const currentEra  = ERAS.find(e => e.id === eraId)
  const currentKing = JOSEON_KINGS[kingIdx]

  const result = useMemo<E2AResult>(() => {
    const y = parseInt(yearStr)
    if (!yearStr || isNaN(y) || y < 1) return null

    if (eraType === 'joseon') {
      const reigning = currentKing.endAD - currentKing.startAD + 1
      if (y > reigning)
        return { error: `${currentKing.name}의 재위 기간은 ${reigning}년입니다 (${currentKing.startAD}~${currentKing.endAD})` }
      const ad = currentKing.startAD + y - 1
      return { ad, ganjji: ganjjiLabel(ad) }
    }

    const era = currentEra
    if (!era) return null
    const ad = y + era.baseYear
    if (era.endAD !== undefined && ad > era.endAD)
      return { error: `${era.name}의 마지막 연도는 ${era.endAD - era.baseYear}년입니다 (${adDisplay(era.endAD)})` }
    return { ad, ganjji: ganjjiLabel(ad) }
  }, [eraType, eraId, kingIdx, yearStr, currentEra, currentKing])

  function changeEraType(t: EraType) {
    setEraType(t)
    setYearStr('')
    if (t !== 'joseon') {
      const first = ERAS_BY[t]?.[0]
      if (first) setEraId(first.id)
    }
  }

  const placeholder = eraType === 'joseon'
    ? `1 ~ ${currentKing.endAD - currentKing.startAD + 1}`
    : currentEra ? `1 ~ ${currentEra.endAD ? currentEra.endAD - currentEra.baseYear : '현재'}` : ''

  const inputLabel = eraType === 'joseon'
    ? `${currentKing.name} 재위 년도`
    : currentEra ? `${currentEra.name} (${currentEra.hanja}) 년도` : '년도'

  return (
    <div className={styles.section}>
      <div className={styles.radioGroup}>
        {ERA_TYPE_LABELS.map(([t, label]) => (
          <label key={t} className={`${styles.radioLabel}${eraType === t ? ' ' + styles.radioActive : ''}`}>
            <input type="radio" name="eraType" value={t} checked={eraType === t} onChange={() => changeEraType(t)} />
            {label}
          </label>
        ))}
      </div>

      {eraType === 'joseon' ? (
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>왕</label>
          <select className={styles.select} value={kingIdx}
            onChange={e => { setKingIdx(Number(e.target.value)); setYearStr('') }}>
            {JOSEON_KINGS.map((k, i) => (
              <option key={i} value={i}>{k.num}대 {k.name} ({k.startAD}~{k.endAD})</option>
            ))}
          </select>
        </div>
      ) : (
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>연호</label>
          <select className={styles.select} value={eraId}
            onChange={e => { setEraId(e.target.value); setYearStr('') }}>
            {(ERAS_BY[eraType] ?? []).map(e => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.hanja}) {e.endAD ? `${e.startAD}~${e.endAD}` : `${e.startAD}~`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.fieldRow}>
        <label className={styles.fieldLabel}>{inputLabel}</label>
        <input
          type="number" min={1} className={styles.numInput}
          value={yearStr} onChange={e => setYearStr(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {result && (
        'error' in result ? (
          <p className={styles.errorMsg}>{result.error}</p>
        ) : (
          <div className={styles.resultBox}>
            <div className={styles.resultBig}>{adDisplay(result.ad)}</div>
            <div className={styles.resultSub}>{result.ganjji}</div>
            {eraType === 'joseon' && (
              <div className={styles.resultSub}>조선 {currentKing.num}대 {currentKing.name} {yearStr}년</div>
            )}
          </div>
        )
      )}
    </div>
  )
}

// ─── Tab 2: 서기 → 연호 ─────────────────────────────────────────────────────

function ADToEraTab() {
  const [yearStr, setYearStr] = useState('')
  const [bce,     setBce]     = useState(false)

  const adYear = useMemo<number | null>(() => {
    const y = parseInt(yearStr)
    if (!yearStr || isNaN(y) || y < 1) return null
    return bce ? 1 - y : y
  }, [yearStr, bce])

  const matches = useMemo<{ label: string; value: number; group: string }[]>(() => {
    if (adYear === null) return []
    const y = adYear
    const res: { label: string; value: number; group: string }[] = []
    for (const era of ERAS) {
      const ey = y - era.baseYear
      if (ey >= 1 && y >= era.startAD && (era.endAD === undefined || y <= era.endAD))
        res.push({ label: `${era.name} (${era.hanja})`, value: ey, group: era.group })
    }
    for (const king of JOSEON_KINGS) {
      if (y >= king.startAD && y <= king.endAD)
        res.push({ label: `조선 ${king.num}대 ${king.name}`, value: y - king.startAD + 1, group: 'joseon' })
    }
    return res
  }, [adYear])

  return (
    <div className={styles.section}>
      <div className={styles.bceRow}>
        <input
          type="number" min={1} className={styles.numInputWide}
          value={yearStr} onChange={e => setYearStr(e.target.value)}
          placeholder="연도 입력 (예: 1446)"
        />
        <label className={`${styles.bceToggle}${bce ? ' ' + styles.bceActive : ''}`}>
          <input type="checkbox" checked={bce} onChange={e => setBce(e.target.checked)} />
          기원전
        </label>
      </div>

      {adYear !== null && (
        <div className={styles.resultBox}>
          <div className={styles.resultBig}>{adDisplay(adYear)}</div>
          <div className={styles.resultSub}>{ganjjiLabel(adYear)}</div>
          {matches.length > 0 ? (
            <div style={{ overflowX: 'auto', marginTop: '14px' }}>
              <table className={styles.eraTable}>
                <thead>
                  <tr><th>연호</th><th>재위·기년</th><th>구분</th></tr>
                </thead>
                <tbody>
                  {matches.map((m, i) => (
                    <tr key={i}>
                      <td>{m.label}</td>
                      <td className={styles.eraYear}>{m.value}년</td>
                      <td className={styles.eraGroup}>{GROUP_LABELS[m.group] ?? m.group}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.mutedNote}>해당 연도에 매핑되는 연호가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tab 3: 간지 변환 ────────────────────────────────────────────────────────

function GanjjiTab() {
  const [stemIdx,   setStemIdx]   = useState(0)
  const [branchIdx, setBranchIdx] = useState(0)
  const curYear = new Date().getFullYear()

  const isValid = stemIdx % 2 === branchIdx % 2

  const recentYears = useMemo<number[]>(() => {
    if (!isValid) return []
    let cyclePos = -1
    for (let i = 0; i < 60; i++) {
      if (i % 10 === stemIdx && i % 12 === branchIdx) { cyclePos = i; break }
    }
    if (cyclePos < 0) return []
    const baseY = 4 + cyclePos
    const k = Math.floor((curYear - baseY) / 60)
    return Array.from({ length: 6 }, (_, j) => baseY + (k - 2 + j) * 60)
  }, [stemIdx, branchIdx, isValid, curYear])

  return (
    <div className={styles.section}>
      <div className={styles.ganjjiPicker}>
        <div className={styles.pickerCol}>
          <p className={styles.pickerTitle}>천간 (天干)</p>
          <div className={styles.stemGrid}>
            {STEMS_KR.map((s, i) => (
              <button key={i}
                className={`${styles.pickerBtn}${stemIdx === i ? ' ' + styles.pickerActive : ''}`}
                onClick={() => setStemIdx(i)}>
                <span className={styles.pickerKr}>{s}</span>
                <span className={styles.pickerHj}>{STEMS_HJ[i]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.pickerCol}>
          <p className={styles.pickerTitle}>지지 (地支)</p>
          <div className={styles.branchGrid}>
            {BRANCHES_KR.map((b, i) => (
              <button key={i}
                className={`${styles.pickerBtn}${branchIdx === i ? ' ' + styles.pickerActive : ''}`}
                onClick={() => setBranchIdx(i)}>
                <span className={styles.pickerKr}>{b}</span>
                <span className={styles.pickerHj}>{BRANCHES_HJ[i]}</span>
                <span className={styles.pickerAnimal}>{ANIMALS[i]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isValid && (
        <p className={styles.errorMsg}>
          {STEMS_KR[stemIdx]}{BRANCHES_KR[branchIdx]} ({STEMS_HJ[stemIdx]}{BRANCHES_HJ[branchIdx]})는
          유효하지 않은 간지 조합입니다. 천간과 지지는 양음이 일치해야 합니다.
        </p>
      )}

      {isValid && recentYears.length > 0 && (
        <div className={styles.resultBox}>
          <div className={styles.resultBig}>
            {STEMS_KR[stemIdx]}{BRANCHES_KR[branchIdx]}년 ({STEMS_HJ[stemIdx]}{BRANCHES_HJ[branchIdx]})
          </div>
          <div className={styles.resultSub}>{ANIMALS[branchIdx]}의 해 · 60년 주기</div>
          <div className={styles.yearList}>
            {recentYears.map(y => {
              const isCur    = y === curYear
              const isNext   = y > curYear && y <= curYear + 60
              return (
                <div key={y} className={`${styles.yearItem}${isCur ? ' ' + styles.yearCurrent : y > curYear ? ' ' + styles.yearFuture : ''}`}>
                  <span className={styles.yearNum}>{y > 0 ? y : `기원전 ${1 - y}`}</span>
                  {y > 0 && <span className={styles.yearSub}>{ganjjiLabel(y)}</span>}
                  {isCur  && <span className={styles.yearBadge}>올해</span>}
                  {isNext && !isCur && <span className={styles.yearBadgeNext}>다음</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab 4: 역사 연표 ────────────────────────────────────────────────────────

type Period = 'all' | 'ancient' | 'medieval' | 'joseon' | 'modern'
const PERIOD_LABELS: [Period, string][] = [
  ['all','전체'], ['ancient','고대 (~668)'], ['medieval','삼국·고려'], ['joseon','조선'], ['modern','근현대'],
]

function TimelineTab() {
  const [period,    setPeriod]    = useState<Period>('all')
  const [searchStr, setSearchStr] = useState('')

  const filtered = useMemo(() => {
    let list = EVENTS
    if (period === 'ancient')  list = list.filter(([y]) => y < 669)
    if (period === 'medieval') list = list.filter(([y]) => y >= 669 && y < 1392)
    if (period === 'joseon')   list = list.filter(([y]) => y >= 1392 && y < 1897)
    if (period === 'modern')   list = list.filter(([y]) => y >= 1897)
    if (searchStr.trim()) {
      const q = searchStr.trim()
      list = list.filter(([y, label]) => {
        const displayY = y > 0 ? String(y) : String(1 - y)
        return displayY.includes(q) || label.includes(q)
      })
    }
    return list
  }, [period, searchStr])

  return (
    <div className={styles.section}>
      <div className={styles.filterRow}>
        {PERIOD_LABELS.map(([p, label]) => (
          <button key={p}
            className={`${styles.filterBtn}${period === p ? ' ' + styles.filterActive : ''}`}
            onClick={() => setPeriod(p)}>
            {label}
          </button>
        ))}
      </div>
      <input
        type="text" className={styles.searchInput}
        placeholder="연도 또는 사건 검색..."
        value={searchStr} onChange={e => setSearchStr(e.target.value)}
      />
      <div className={styles.timeline}>
        {filtered.map(([y, label]) => {
          const { s, b } = ganjjiOf(y)
          return (
            <div key={y} className={styles.timelineRow}>
              <div className={styles.timelineLeft}>
                <span className={styles.tlYear}>
                  {y > 0 ? y : y === 0 ? '기원전 1' : `기원전 ${1 - y}`}
                </span>
                {y > 0 && <span className={styles.tlGanjji}>{STEMS_KR[s]}{BRANCHES_KR[b]}</span>}
              </div>
              <div className={styles.timelineLine}><div className={styles.timelineDot} /></div>
              <div className={styles.tlLabel}>{label}</div>
            </div>
          )
        })}
        {filtered.length === 0 && <p className={styles.mutedNote}>검색 결과가 없습니다.</p>}
      </div>
    </div>
  )
}
