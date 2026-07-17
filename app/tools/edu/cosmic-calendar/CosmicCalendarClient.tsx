'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './cosmic-calendar.module.css'

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const COSMIC_YEAR_REAL_YEARS = 13_800_000_000
const COSMIC_DAY_REAL_YEARS = COSMIC_YEAR_REAL_YEARS / 365.25
const COSMIC_HOUR_REAL_YEARS = COSMIC_DAY_REAL_YEARS / 24
const COSMIC_MINUTE_REAL_YEARS = COSMIC_HOUR_REAL_YEARS / 60
const COSMIC_SECOND_REAL_YEARS = COSMIC_MINUTE_REAL_YEARS / 60 // 약 437.5년

// ─────────────────────────────────────────────
// 카테고리
// ─────────────────────────────────────────────
type CatKey = 'cosmic' | 'solar' | 'earth' | 'life' | 'human' | 'civilization' | 'now'
const CATEGORIES: Record<CatKey, { name: string; color: string; cls: string; borderCls: string }> = {
  cosmic:       { name: '우주 진화',  color: '#9B59B6', cls: s.catCosmic,       borderCls: s.borderCosmic },
  solar:        { name: '태양계',     color: '#A16207', cls: s.catSolar,        borderCls: s.borderSolar },
  earth:        { name: '지구',       color: '#0891B2', cls: s.catEarth,        borderCls: s.borderEarth },
  life:         { name: '생명·진화',  color: '#059669', cls: s.catLife,         borderCls: s.borderLife },
  human:        { name: '인류 진화',  color: '#EA580C', cls: s.catHuman,        borderCls: s.borderHuman },
  civilization: { name: '문명',       color: '#DC2626', cls: s.catCivilization, borderCls: s.borderCivilization },
  now:          { name: '현재',       color: '#0D9488', cls: s.catNow,          borderCls: s.borderNow },
}

// ─────────────────────────────────────────────
// 사건 데이터 (138억 년 = 1년)
// ─────────────────────────────────────────────
type Event = {
  id: string
  name: string
  realYearsAgo: number
  cosmicDate: string
  month: number
  day: number
  hour?: number
  minute?: number
  second?: number
  category: CatKey
  icon: string
  description: string
}

const EVENTS: Event[] = [
  { id: 'bigbang',       name: '빅뱅 (우주 탄생)',          realYearsAgo: 13_800_000_000,         cosmicDate: '1월 1일 00:00',       month: 1,  day: 1,  hour: 0,  minute: 0,  category: 'cosmic',       icon: '💥', description: '시공간이 시작된 순간. 모든 물질·에너지가 한 점에서 폭발적으로 팽창 시작.' },
  { id: 'firstAtoms',    name: '최초의 원자 형성',           realYearsAgo: 13_799_620_000,         cosmicDate: '1월 1일 00:14',       month: 1,  day: 1,  hour: 0,  minute: 14, category: 'cosmic',       icon: '⚛️', description: '38만 년 후 우주가 식으면서 수소·헬륨 원자가 만들어짐.' },
  { id: 'firstStars',    name: '최초의 별 형성',             realYearsAgo: 13_600_000_000,         cosmicDate: '1월 10일경',         month: 1,  day: 10,                                category: 'cosmic',       icon: '⭐', description: '약 2억 년 후 첫 별들이 핵융합으로 빛나기 시작.' },
  { id: 'firstGalaxies', name: '최초의 은하 형성',           realYearsAgo: 13_400_000_000,         cosmicDate: '1월 22일경',         month: 1,  day: 22,                                category: 'cosmic',       icon: '🌌', description: '별들이 모여 최초의 은하가 형성됨.' },
  { id: 'milkyWay',      name: '우리 은하수 형성',           realYearsAgo: 13_500_000_000,         cosmicDate: '3월 16일경',         month: 3,  day: 16,                                category: 'cosmic',       icon: '🌠', description: '우리 태양계가 속한 우리 은하수가 형성됨.' },
  { id: 'solarSystem',   name: '태양계 형성',                realYearsAgo: 4_600_000_000,          cosmicDate: '8월 31일경',         month: 8,  day: 31,                                category: 'solar',        icon: '☀️', description: '46억 년 전 가스·먼지 구름에서 태양과 행성들이 형성됨.' },
  { id: 'earth',         name: '지구 형성',                  realYearsAgo: 4_540_000_000,          cosmicDate: '9월 2일경',          month: 9,  day: 2,                                 category: 'earth',        icon: '🌍', description: '약 45억 4천만 년 전 지구가 형성됨.' },
  { id: 'moon',          name: '달 형성',                    realYearsAgo: 4_500_000_000,          cosmicDate: '9월 4일경',          month: 9,  day: 4,                                 category: 'earth',        icon: '🌙', description: '거대 충돌설: 화성 크기 천체가 지구와 충돌 → 달 형성.' },
  { id: 'firstLife',     name: '최초의 생명체 (단세포)',      realYearsAgo: 3_800_000_000,          cosmicDate: '9월 21일경',         month: 9,  day: 21,                                category: 'life',         icon: '🦠', description: '약 38억 년 전 최초의 단세포 생명(원시 박테리아) 등장.' },
  { id: 'photosynthesis',name: '광합성 시작',                realYearsAgo: 3_500_000_000,          cosmicDate: '10월 12일경',        month: 10, day: 12,                                category: 'life',         icon: '🌱', description: '최초의 광합성 생물이 산소를 만들기 시작.' },
  { id: 'oxygen',        name: '대기에 산소 축적',           realYearsAgo: 2_400_000_000,          cosmicDate: '11월 9일경',         month: 11, day: 9,                                 category: 'life',         icon: '💨', description: '산소 대폭발 — 산소가 대량으로 축적되어 생물 다양성 폭발의 기반 마련.' },
  { id: 'multicellular', name: '다세포 생물 등장',           realYearsAgo: 2_000_000_000,          cosmicDate: '11월 15일경',        month: 11, day: 15,                                category: 'life',         icon: '🧬', description: '단세포에서 다세포 생물로 진화.' },
  { id: 'cambrian',      name: '캄브리아기 대폭발',          realYearsAgo: 540_000_000,            cosmicDate: '12월 17일경',        month: 12, day: 17,                                category: 'life',         icon: '🦑', description: '약 5억 4천만 년 전 다양한 생물 형태가 폭발적으로 등장.' },
  { id: 'plants',        name: '육상 식물 등장',             realYearsAgo: 470_000_000,            cosmicDate: '12월 20일경',        month: 12, day: 20,                                category: 'life',         icon: '🌿', description: '식물이 바다에서 육지로 진출.' },
  { id: 'firstAnimals',  name: '육상 동물 등장',             realYearsAgo: 400_000_000,            cosmicDate: '12월 21일경',        month: 12, day: 21,                                category: 'life',         icon: '🦎', description: '척추동물이 육지에 진출.' },
  { id: 'dinosaurs',     name: '공룡 등장',                  realYearsAgo: 230_000_000,            cosmicDate: '12월 25일경',        month: 12, day: 25,                                category: 'life',         icon: '🦕', description: '약 2억 3천만 년 전 공룡 등장.' },
  { id: 'mammals',       name: '포유류 등장',                realYearsAgo: 200_000_000,            cosmicDate: '12월 26일경',        month: 12, day: 26,                                category: 'life',         icon: '🐀', description: '약 2억 년 전 작은 포유류 등장 (공룡과 공존).' },
  { id: 'flowers',       name: '꽃 식물 등장',               realYearsAgo: 130_000_000,            cosmicDate: '12월 28일경',        month: 12, day: 28,                                category: 'life',         icon: '🌸', description: '꽃을 피우는 식물(피자식물) 진화.' },
  { id: 'dinoExtinction',name: '공룡 멸종 (K-Pg 대멸종)',    realYearsAgo: 66_000_000,             cosmicDate: '12월 30일경',        month: 12, day: 30,                                category: 'life',         icon: '☄️', description: '약 6,600만 년 전 운석 충돌로 공룡 멸종 → 포유류 시대 시작.' },
  { id: 'primates',      name: '영장류 등장',                realYearsAgo: 55_000_000,             cosmicDate: '12월 30일경',        month: 12, day: 30,                                category: 'life',         icon: '🐒', description: '최초의 영장류 등장.' },
  // 12월 31일
  { id: 'humanAncestor', name: '인류 조상 (오스트랄로피테쿠스)', realYearsAgo: 4_000_000,           cosmicDate: '12월 31일 22:24',     month: 12, day: 31, hour: 22, minute: 24,        category: 'human',        icon: '🧍', description: '루시(Lucy) 같은 직립보행 영장류 등장.' },
  { id: 'genusHomo',     name: '호모(Homo) 속 등장',         realYearsAgo: 2_500_000,              cosmicDate: '12월 31일 22:54',     month: 12, day: 31, hour: 22, minute: 54,        category: 'human',        icon: '🪨', description: '도구를 만들기 시작한 호모 하빌리스 등장.' },
  { id: 'fire',          name: '불 사용 시작',                realYearsAgo: 1_500_000,              cosmicDate: '12월 31일 23:23',     month: 12, day: 31, hour: 23, minute: 23,        category: 'human',        icon: '🔥', description: '호모 에렉투스가 불을 통제하기 시작.' },
  { id: 'homoSapiens',   name: '현생 인류 (호모 사피엔스) 등장', realYearsAgo: 300_000,              cosmicDate: '12월 31일 23:48',     month: 12, day: 31, hour: 23, minute: 48,        category: 'human',        icon: '👤', description: '약 30만 년 전 현생 인류 등장.' },
  { id: 'language',      name: '언어·예술의 발달',           realYearsAgo: 50_000,                 cosmicDate: '12월 31일 23:58',     month: 12, day: 31, hour: 23, minute: 58,        category: 'civilization', icon: '🎨', description: '동굴벽화, 복잡한 언어, 상징적 사고 발달.' },
  { id: 'agriculture',   name: '농업 혁명',                  realYearsAgo: 12_000,                 cosmicDate: '12월 31일 23:59:32',  month: 12, day: 31, hour: 23, minute: 59, second: 32,    category: 'civilization', icon: '🌾', description: '약 1만 2천 년 전 농업 시작 → 정착 생활.' },
  { id: 'writing',       name: '문자 발명',                  realYearsAgo: 5_500,                  cosmicDate: '12월 31일 23:59:46',  month: 12, day: 31, hour: 23, minute: 59, second: 46,    category: 'civilization', icon: '📜', description: '메소포타미아 쐐기문자 등 최초의 문자.' },
  { id: 'pyramids',      name: '이집트 피라미드 건설',        realYearsAgo: 4_500,                  cosmicDate: '12월 31일 23:59:49',  month: 12, day: 31, hour: 23, minute: 59, second: 49,    category: 'civilization', icon: '🔺', description: '기자 대피라미드 건설.' },
  { id: 'romanEmpire',   name: '로마 제국 건국',             realYearsAgo: 2_750,                  cosmicDate: '12월 31일 23:59:54',  month: 12, day: 31, hour: 23, minute: 59, second: 54,    category: 'civilization', icon: '🏛️', description: '로마 건국 (BC 753년).' },
  { id: 'jesus',         name: '예수 탄생 (서기 1년)',       realYearsAgo: 2_026,                  cosmicDate: '12월 31일 23:59:55',  month: 12, day: 31, hour: 23, minute: 59, second: 55,    category: 'civilization', icon: '✝️', description: '서기 1년 (현재 달력 기준점).' },
  { id: 'goryeo',        name: '고려 건국 (한국 역사)',      realYearsAgo: 1_108,                  cosmicDate: '12월 31일 23:59:58',  month: 12, day: 31, hour: 23, minute: 59, second: 58,    category: 'civilization', icon: '🇰🇷', description: '왕건이 고려 건국 (918년).' },
  { id: 'industrial',    name: '산업혁명',                   realYearsAgo: 250,                    cosmicDate: '12월 31일 23:59:59.4',month: 12, day: 31, hour: 23, minute: 59, second: 59.4,  category: 'civilization', icon: '⚙️', description: '18세기 후반 영국에서 시작된 산업혁명.' },
  { id: 'electricity',   name: '전기·전구 발명',             realYearsAgo: 145,                    cosmicDate: '12월 31일 23:59:59.7',month: 12, day: 31, hour: 23, minute: 59, second: 59.7,  category: 'civilization', icon: '💡', description: '에디슨의 전구 발명 (1879년).' },
  { id: 'moonLanding',   name: '달 착륙',                    realYearsAgo: 57,                     cosmicDate: '12월 31일 23:59:59.87',month: 12, day: 31, hour: 23, minute: 59, second: 59.87, category: 'civilization', icon: '🚀', description: '아폴로 11호 달 착륙 (1969년).' },
  { id: 'internet',      name: '인터넷 대중화',              realYearsAgo: 30,                     cosmicDate: '12월 31일 23:59:59.93',month: 12, day: 31, hour: 23, minute: 59, second: 59.93, category: 'civilization', icon: '🌐', description: '월드와이드웹 대중화 (1990년대).' },
  { id: 'now',           name: '현재 (2026년)',              realYearsAgo: 0,                      cosmicDate: '12월 31일 24:00:00',  month: 12, day: 31, hour: 24, minute: 0,  second: 0,    category: 'now',          icon: '⏰', description: '지금 이 순간. 우주 138억 년의 마지막 1초도 지나기 전.' },
]

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const fmt = (v: number, dp = 0): string => {
  if (!Number.isFinite(v)) return '-'
  return v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
const round = (v: number, dp = 1) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp)

function fmtRealYears(yearsAgo: number): string {
  if (yearsAgo === 0) return '현재'
  if (yearsAgo < 1_000) return `약 ${yearsAgo}년 전`
  if (yearsAgo < 1_000_000) return `약 ${fmt(round(yearsAgo / 1_000))}천 년 전`
  if (yearsAgo < 100_000_000) return `약 ${fmt(round(yearsAgo / 1_000_000))}백만 년 전`
  if (yearsAgo < 1_000_000_000) return `약 ${round(yearsAgo / 100_000_000, 1)}억 년 전`
  return `약 ${round(yearsAgo / 1_000_000_000, 2)}억 년 전`
}

// 사용자 나이 → 코스믹 시간
function ageToCosmic(ageYears: number) {
  const cosmicSeconds = ageYears / COSMIC_SECOND_REAL_YEARS
  const cosmicMinutes = cosmicSeconds / 60
  return { cosmicSeconds, cosmicMinutes }
}

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

// ─────────────────────────────────────────────
// 인터랙티브 타임라인 (반응형 · 점 + 호버/탭 팝업)
// ─────────────────────────────────────────────
type TLPoint = { key: string; pct: number; color: string; events: Event[] }

// 가까운 점들을 하나로 통합 (촘촘한 구역 → 점 하나)
function clusterPoints(raw: { pct: number; event: Event }[], threshold: number): TLPoint[] {
  const sorted = [...raw].sort((a, b) => a.pct - b.pct)
  const groups: { events: Event[]; pcts: number[] }[] = []
  let lastPct = -Infinity
  for (const it of sorted) {
    const last = groups[groups.length - 1]
    if (last && it.pct - lastPct <= threshold) {
      last.events.push(it.event); last.pcts.push(it.pct)
    } else {
      groups.push({ events: [it.event], pcts: [it.pct] })
    }
    lastPct = it.pct
  }
  return groups.map((g, i) => {
    const pct = g.pcts.reduce((a, b) => a + b, 0) / g.pcts.length
    const rep = g.events.find(e => e.category === 'now') ?? g.events[g.events.length - 1]
    return { key: `${g.events[0].id}__${i}`, pct, color: CATEGORIES[rep.category].color, events: g.events }
  })
}

function InteractiveTimeline({
  points, ticks, bands = [], activeKey, onSelect, ariaLabel,
}: {
  points: TLPoint[]
  ticks: { label: string; pct: number }[]
  bands?: { fromPct: number; toPct: number; label: string; color: string }[]
  activeKey: string | null
  onSelect: (key: string | null) => void
  ariaLabel: string
}) {
  return (
    <div className={s.tl} role="group" aria-label={ariaLabel} onClick={() => onSelect(null)}>
      <div className={s.tlBar}>
        {bands.map((b, i) => (
          <div
            key={i}
            className={s.tlBand}
            style={{ left: `${b.fromPct * 100}%`, width: `${(b.toPct - b.fromPct) * 100}%`, background: `${b.color}26` }}
          >
            <span className={s.tlBandLabel} style={{ color: b.color }}>{b.label}</span>
          </div>
        ))}

        <div className={s.tlLine} />

        {ticks.map((t, i) => (
          <div key={i} className={s.tlTick} style={{ left: `${t.pct * 100}%` }}>
            <span className={s.tlTickMark} />
            <span className={s.tlTickLabel}>{t.label}</span>
          </div>
        ))}

        {points.map(p => {
          const isActive = activeKey === p.key
          const alignCls = p.pct < 0.16 ? s.tlPopStart : p.pct > 0.84 ? s.tlPopEnd : s.tlPopCenter
          const multi = p.events.length > 1
          const title = multi ? `${p.events.length}개 사건 — 눌러서 보기` : p.events[0].name
          return (
            <div
              key={p.key}
              className={`${s.tlPointWrap} ${isActive ? s.tlPointActive : ''}`}
              style={{ left: `${p.pct * 100}%` }}
            >
              <button
                type="button"
                className={s.tlDot}
                style={{ background: p.color, boxShadow: isActive ? `0 0 0 5px ${p.color}55` : undefined }}
                aria-label={title}
                aria-expanded={isActive}
                onClick={(ev) => { ev.stopPropagation(); onSelect(isActive ? null : p.key) }}
              >
                {multi && <span className={s.tlDotCount}>{p.events.length}</span>}
              </button>
              <div className={`${s.tlPop} ${alignCls}`} role="dialog" onClick={(ev) => ev.stopPropagation()}>
                {multi && <p className={s.tlPopHead}>이 구간 {p.events.length}개 사건</p>}
                <div className={multi ? s.tlPopScroll : undefined}>
                  {p.events.map(e => (
                    <div key={e.id} className={s.tlPopRow}>
                      <span className={s.tlPopIcon}>{e.icon}</span>
                      <div className={s.tlPopText}>
                        <p className={s.tlPopName}>{e.name}</p>
                        <p className={s.tlPopMeta}>{e.cosmicDate} · {fmtRealYears(e.realYearsAgo)}</p>
                        {!multi && <p className={s.tlPopDesc}>{e.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CosmicCalendarClient() {
  const [tab, setTab] = useState<'year' | 'dec31' | 'search' | 'compare'>('year')
  const [zoomLevel, setZoomLevel] = useState<'24h' | 'lastHour' | 'last30s'>('24h')
  const [compressionMode, setCompressionMode] = useState<'1year' | '24hours' | '1km'>('1year')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [age, setAge] = useState<number>(30)
  const [userName, setUserName] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)
  const [activePoint, setActivePoint] = useState<string | null>(null)

  // 월별 사건 그룹화
  const eventsByMonth = useMemo(() => {
    const groups: Record<number, Event[]> = {}
    for (let m = 1; m <= 12; m++) groups[m] = []
    EVENTS.forEach(e => { groups[e.month]?.push(e) })
    return groups
  }, [])

  // 12월 31일 사건만
  const dec31Events = useMemo(() => {
    return EVENTS.filter(e => e.month === 12 && e.day === 31)
      .sort((a, b) => {
        const ah = (a.hour ?? 0) * 3600 + (a.minute ?? 0) * 60 + (a.second ?? 0)
        const bh = (b.hour ?? 0) * 3600 + (b.minute ?? 0) * 60 + (b.second ?? 0)
        return ah - bh
      })
  }, [])

  // 줌 레벨에 따른 12월 31일 필터링
  const dec31Filtered = useMemo(() => {
    if (zoomLevel === '24h') return dec31Events
    if (zoomLevel === 'lastHour') return dec31Events.filter(e => (e.hour ?? 0) === 23)
    // last30s
    return dec31Events.filter(e => (e.hour ?? 0) === 23 && (e.minute ?? 0) === 59)
  }, [zoomLevel, dec31Events])

  // 검색
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 1) return []
    return EVENTS.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.cosmicDate.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [searchQuery])

  // 내 인생 시각화
  const myLife = useMemo(() => {
    const c = ageToCosmic(age)
    return {
      cosmicSeconds: c.cosmicSeconds,
      cosmicMinutes: c.cosmicMinutes,
      // 비교 시점 (코스믹 캘린더 24:00:00 기준 거꾸로)
      cosmicEndPosition: 24 * 3600 - c.cosmicSeconds, // 12월 31일 시작 후 (총 86400초 중 어디)
    }
  }, [age])

  // 비교 데이터 (탭 3 막대)
  const compareBars = useMemo(() => {
    // 우주 1년 = 100% 기준, 로그 스케일로 시각화
    const items = [
      { label: '우주 1년',       cosmicSec: 365.25 * 24 * 3600,                color: '#9B59B6', desc: '138억 년' },
      { label: '공룡 시대',      cosmicSec: (165_000_000 / COSMIC_SECOND_REAL_YEARS), color: '#EA580C', desc: '약 4.4일' },
      { label: '인류 등장',      cosmicSec: (300_000   / COSMIC_SECOND_REAL_YEARS),   color: '#A16207', desc: '약 11.4분' },
      { label: '인류 문명',      cosmicSec: (12_000    / COSMIC_SECOND_REAL_YEARS),   color: '#059669', desc: '약 27.5초' },
      { label: '내 나이',        cosmicSec: myLife.cosmicSeconds,             color: '#0D9488', desc: `약 ${round(myLife.cosmicSeconds, 3)}초` },
    ]
    const max = items[0].cosmicSec
    return items.map(it => ({
      ...it,
      // 로그 스케일 (작은 값도 보이게)
      pct: Math.max(0.5, (Math.log10(Math.max(0.01, it.cosmicSec)) / Math.log10(max)) * 100),
    }))
  }, [myLife])

  // ─────────────────────────────────────────────
  // 연간 타임라인 — 점 데이터 (반응형)
  // ─────────────────────────────────────────────
  const yearPoints = useMemo<TLPoint[]>(() => {
    const raw = EVENTS.map(e => ({
      pct: e.id === 'now' ? 1 : ((e.month - 1) + (e.day - 1) / 31) / 12,
      event: e,
    }))
    return clusterPoints(raw, 0.02)
  }, [])
  const yearTicks = useMemo(() => MONTHS.map((m, i) => ({ label: m, pct: i / 12 })), [])

  // ─────────────────────────────────────────────
  // 12월 31일 타임라인 — 점 데이터 (탭 2, 줌별)
  // ─────────────────────────────────────────────
  const dec31Range = useMemo(() => {
    if (zoomLevel === '24h') return { startSec: 0, endSec: 24 * 3600 }
    if (zoomLevel === 'lastHour') return { startSec: 23 * 3600, endSec: 24 * 3600 }
    return { startSec: 23 * 3600 + 59 * 60 + 30, endSec: 24 * 3600 }
  }, [zoomLevel])

  const dec31Points = useMemo<TLPoint[]>(() => {
    const { startSec, endSec } = dec31Range
    const secOf = (e: Event) => (e.hour ?? 0) * 3600 + (e.minute ?? 0) * 60 + (e.second ?? 0)
    const raw = dec31Filtered.map(e => ({ pct: (secOf(e) - startSec) / (endSec - startSec), event: e }))
    return clusterPoints(raw, 0.05)
  }, [dec31Filtered, dec31Range])

  const dec31Ticks = useMemo(() => {
    if (zoomLevel === '24h') return [0, 6, 12, 18, 24].map(h => ({ label: `${h}시`, pct: h / 24 }))
    if (zoomLevel === 'lastHour') {
      return [0, 15, 30, 45, 60].map(m => ({ label: m === 60 ? '24:00' : `23:${m.toString().padStart(2, '0')}`, pct: m / 60 }))
    }
    return [0, 10, 20, 30].map(d => ({ label: d === 30 ? '24:00' : `+${d}초`, pct: d / 30 }))
  }, [zoomLevel])

  const dec31Bands = useMemo(() => {
    if (zoomLevel !== '24h') return []
    return [{ fromPct: 22 / 24, toPct: 1, label: '인류는 여기부터', color: '#EA580C' }]
  }, [zoomLevel])

  // 줌 변경 시 열린 팝업 닫기
  const changeZoom = (z: typeof zoomLevel) => { setZoomLevel(z); setActivePoint(null) }

  // 메인 탭 전환 시 열려 있던 타임라인 팝업 닫기
  const changeTab = (t: typeof tab) => { setTab(t); setActivePoint(null) }

  // ESC 키로 열린 팝업 닫기
  useEffect(() => {
    if (!activePoint) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setActivePoint(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activePoint])

  // ─────────────────────────────────────────────
  // 압축 모드 데이터 (탭 4)
  // ─────────────────────────────────────────────
  const compressionData = useMemo(() => {
    // 주요 사건만
    const keyIds = ['bigbang', 'milkyWay', 'solarSystem', 'earth', 'firstLife', 'multicellular', 'cambrian', 'dinosaurs', 'dinoExtinction', 'homoSapiens', 'agriculture', 'industrial', 'now']
    const keyEvts = keyIds.map(id => EVENTS.find(e => e.id === id)!).filter(Boolean)

    if (compressionMode === '1year') {
      return keyEvts.map(e => ({
        name: e.name,
        real: fmtRealYears(e.realYearsAgo),
        compressed: e.cosmicDate,
      }))
    }

    if (compressionMode === '24hours') {
      // 138억 년 → 24시간 (86400초). 빅뱅 = 0초
      return keyEvts.map(e => {
        const fromStartYears = COSMIC_YEAR_REAL_YEARS - e.realYearsAgo
        const seconds = (fromStartYears / COSMIC_YEAR_REAL_YEARS) * 86400
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds - h * 3600) / 60)
        const sec = seconds - h * 3600 - m * 60
        let label = ''
        if (h === 24 || (h === 23 && m === 59 && sec >= 59.999)) {
          label = '24:00:00 (현재)'
        } else if (sec < 1) {
          label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${round(sec, 4).toFixed(4)}`
        } else if (sec < 10) {
          label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${round(sec, 2).toFixed(2)}`
        } else {
          label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${Math.round(sec).toString().padStart(2, '0')}`
        }
        return { name: e.name, real: fmtRealYears(e.realYearsAgo), compressed: label }
      })
    }

    // 1km 모드
    return keyEvts.map(e => {
      const fromStartYears = COSMIC_YEAR_REAL_YEARS - e.realYearsAgo
      const meters = (fromStartYears / COSMIC_YEAR_REAL_YEARS) * 1000
      let label = ''
      if (meters >= 999.99 && meters < 1000) {
        const remaining = 1000 - meters
        if (remaining < 0.001) label = `999.999m (마지막 ${round(remaining * 1000, 2)}μm)`
        else if (remaining < 0.01) label = `${round(meters, 5)}m (마지막 ${round(remaining * 1000, 2)}mm)`
        else label = `${round(meters, 4)}m (마지막 ${round(remaining * 1000, 1)}mm)`
      } else if (meters >= 1000) {
        label = '1,000m (현재)'
      } else if (meters > 950) {
        label = `${round(meters, 3)}m`
      } else {
        label = `${round(meters, 1)}m`
      }
      return { name: e.name, real: fmtRealYears(e.realYearsAgo), compressed: label }
    })
  }, [compressionMode])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    let text = ''
    if (tab === 'search' && age > 0) {
      const cosmicMin = round(myLife.cosmicMinutes, 3)
      text = [
        `우주 1년에서 ${userName ? userName + '님의' : '나의'} 시간`,
        ``,
        `${age}년 인생 = ${round(myLife.cosmicSeconds, 3)}초 (= ${cosmicMin}분)`,
        `인류 문명 12,000년 = 약 27.5초`,
        `인류 등장 30만 년 = 약 11.4분`,
        `공룡 시대 1.6억 년 = 약 4.2일`,
        `우주 1년 = 138억 년`,
        ``,
        `당신의 ${age}년은 우주 1년에서 단 ${round(myLife.cosmicSeconds, 3)}초입니다.`,
        `youtil.kr 🌌`,
      ].join('\n')
    } else {
      text = [
        `🌌 코스믹 캘린더 (138억 년 = 1년)`,
        ``,
        `1초 ≈ 437년 · 1분 ≈ 26,200년 · 1일 ≈ 3,778만 년`,
        ``,
        `· 빅뱅: 1월 1일 00:00`,
        `· 태양계: 8월 31일`,
        `· 지구: 9월 2일`,
        `· 공룡: 12월 25일`,
        `· 현생 인류: 12월 31일 23:48`,
        `· 농업 혁명: 12월 31일 23:59:32`,
        `· 산업혁명: 12월 31일 23:59:59.4`,
        ``,
        `youtil.kr 🌌`,
      ].join('\n')
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/edu/fermi-estimate', label: '페르미 추정' },
          { href: '/tools/edu/planet-comparison', label: '행성 비교' },
          { href: '/tools/edu/cognitive-test', label: '인지 테스트' }
        ]}
      >
        칼 세이건의 코스믹 캘린더 시각화
      </Disclaimer>

      {/* 현재 우주 시간 헤더 */}
      <div className={s.cosmicNow}>
        <p className={s.cosmicNowLabel}>오늘의 코스믹 시간</p>
        <p className={s.cosmicNowDate}>12월 31일 23:59:59.999...초</p>
        <p className={s.cosmicNowSub}>매 순간이 우주 138억 년 중 단 한 번뿐입니다</p>
      </div>

      {/* 우주 단위 환산 */}
      <div className={s.unitCard}>
        <div><strong>1년</strong> = 138억 년</div>
        <div><strong>1일</strong> ≈ 3,778만 년 · <strong>1시간</strong> ≈ 157만 년</div>
        <div><strong>1분</strong> ≈ 26,200년 · <strong>1초</strong> ≈ 437년</div>
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'year'    ? s.tabActive : ''}`} onClick={() => changeTab('year')}>연간 타임라인</button>
        <button className={`${s.tabBtn} ${tab === 'dec31'   ? s.tabActive : ''}`} onClick={() => changeTab('dec31')}>12월 31일</button>
        <button className={`${s.tabBtn} ${tab === 'search'  ? s.tabActive : ''}`} onClick={() => changeTab('search')}>사건 검색·내 생일</button>
        <button className={`${s.tabBtn} ${tab === 'compare' ? s.tabActive : ''}`} onClick={() => changeTab('compare')}>비교 모드</button>
      </div>

      {/* ──────────── TAB 1: 연간 타임라인 ──────────── */}
      {tab === 'year' && (
        <>
          <div className={s.tlStage}>
            <p style={{ textAlign: 'center', color: '#0D9488', fontSize: 14, fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 700, marginBottom: 6 }}>
              우주 138억 년 = 1년
            </p>
            <p className={s.tlHint}>점에 마우스를 올리거나 탭하면 사건 정보가 열립니다 · 숫자는 그 구간에 모인 사건 수</p>
            <InteractiveTimeline
              points={yearPoints}
              ticks={yearTicks}
              activeKey={activePoint}
              onSelect={setActivePoint}
              ariaLabel="연간 코스믹 타임라인"
            />
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8, lineHeight: 1.7 }}>
              왼쪽 끝: 빅뱅(1월 1일) · 오른쪽 끝: <strong style={{ color: '#0D9488' }}>현재(12월 31일 24:00)</strong>
            </p>
          </div>

          {/* 12월 31일 강조 카드 */}
          <div className={s.dec31Banner}>
            <p className={s.dec31BannerTitle}>12월 31일 - 인류 등장</p>
            <p className={s.dec31BannerText}>
              인류 조상은 <strong>22:24</strong>에 등장, 현생 인류는 <strong>23:48</strong>, 농업·문명·과학·인터넷 모두 마지막 <strong>30초</strong> 안에 일어났습니다.
            </p>
            <button className={s.dec31BannerBtn} onClick={() => changeTab('dec31')} type="button">
              12월 31일 확대 보기 →
            </button>
          </div>

          {/* 월별 카드 그리드 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>월별 사건 요약</span>
              <span className={s.cardLabelHint}>{EVENTS.length - 1}개 주요 사건</span>
            </div>
            <div className={s.monthGrid}>
              {MONTHS.map((m, i) => {
                const events = eventsByMonth[i + 1]
                const empty = events.length === 0
                return (
                  <div key={i} className={`${s.monthCard} ${empty ? s.monthCardEmpty : ''} ${i === 11 ? s.monthCardActive : ''}`}>
                    <p className={s.monthCardLabel}>{m}</p>
                    <p className={s.monthCardCount}>
                      {events.length}<small>{empty ? '사건 없음' : '개 사건'}</small>
                    </p>
                    {events.length > 0 && (
                      <div className={s.monthEvents}>
                        {events.slice(0, 4).map(e => (
                          <div key={e.id} className={s.monthEventItem}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: CATEGORIES[e.category].color, flexShrink: 0, display: 'inline-block' }} />
                            <span>{e.name.length > 12 ? e.name.slice(0, 12) + '…' : e.name}</span>
                          </div>
                        ))}
                        {events.length > 4 && (
                          <div className={s.monthEventItem} style={{ background: 'transparent', justifyContent: 'center', color: 'var(--muted)' }}>
                            +{events.length - 4}개 더
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 칼 세이건 인용 */}
          <div className={s.saganQuote}>
            우리는 별의 잔해다. 우주가 자신을 알아가기 위한 한 방법이다.
            <span className={s.saganAttribution}>— Carl Sagan, Cosmos</span>
          </div>
        </>
      )}

      {/* ──────────── TAB 2: 12월 31일 ──────────── */}
      {tab === 'dec31' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>줌 레벨 선택</span>
              <span className={s.cardLabelHint}>인류의 시간 확대</span>
            </div>
            <div className={s.zoomToggle}>
              <button className={`${s.zoomBtn} ${zoomLevel === '24h'     ? s.zoomActive : ''}`} onClick={() => changeZoom('24h')}     type="button">24시간 전체</button>
              <button className={`${s.zoomBtn} ${zoomLevel === 'lastHour'? s.zoomActive : ''}`} onClick={() => changeZoom('lastHour')} type="button">마지막 1시간 (23~24시)</button>
              <button className={`${s.zoomBtn} ${zoomLevel === 'last30s' ? s.zoomActive : ''}`} onClick={() => changeZoom('last30s')}  type="button">마지막 30초</button>
            </div>
          </div>

          <div className={s.tlStage}>
            <p className={s.tlHint}>점에 마우스를 올리거나 탭하면 사건 정보가 열립니다 · 숫자는 그 구간에 모인 사건 수</p>
            <InteractiveTimeline
              points={dec31Points}
              ticks={dec31Ticks}
              bands={dec31Bands}
              activeKey={activePoint}
              onSelect={setActivePoint}
              ariaLabel="12월 31일 코스믹 타임라인"
            />
          </div>

          {/* 사건 목록 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>{zoomLevel === '24h' ? '12월 31일 24시간' : zoomLevel === 'lastHour' ? '23~24시 1시간' : '마지막 30초'} 사건</span>
              <span className={s.cardLabelHint}>{dec31Filtered.length}개</span>
            </div>
            <div className={s.eventList}>
              {dec31Filtered.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, padding: 16 }}>해당 시간대 사건 없음</p>
              ) : (
                dec31Filtered.map(e => {
                  const cat = CATEGORIES[e.category]
                  return (
                    <div key={e.id} className={`${s.eventCard} ${cat.borderCls}`}>
                      <span className={s.eventDot} style={{ background: cat.color }} />
                      <div className={s.eventBody}>
                        <p className={s.eventName}>{e.name}</p>
                        <p className={s.eventDate}>{e.cosmicDate}</p>
                        <p className={s.eventReal}>{fmtRealYears(e.realYearsAgo)}</p>
                        <p className={s.eventDesc}>{e.description}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 충격 카드 */}
          <div className={s.shockCard}>
            <p className={s.shockTitle}>한눈에 보는 충격적 사실</p>
            <div className={s.shockList}>
              <div>· 문자 발명 이후 인류 모든 역사 = 약 <strong>14초</strong></div>
              <div>· 산업혁명 이후 = 약 <strong>0.6초</strong></div>
              <div>· 인터넷 시대 = 마지막 <strong>0.07초</strong></div>
              <div>· 현생 인류는 우주 1년 중 마지막 <strong>12분</strong></div>
            </div>
          </div>

          {/* 비교 시각화 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>우주 1년 vs 인류 시간 비교</span>
              <span className={s.cardLabelHint}>로그 스케일</span>
            </div>
            <div className={s.compareBar}>
              {compareBars.filter(b => b.label !== '내 나이').map(b => (
                <div key={b.label} className={s.compareBarRow}>
                  <span className={s.compareBarLabel}>{b.label}</span>
                  <div className={s.compareBarTrack}>
                    <div className={s.compareBarFill} style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                  <span className={s.compareBarValue}>{b.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 칼 세이건 인용 */}
          <div className={s.saganQuote}>
            우리는 별의 자녀입니다. 별의 잔해로 만들어진 존재입니다.
            <span className={s.saganAttribution}>— Carl Sagan</span>
          </div>
        </>
      )}

      {/* ──────────── TAB 3: 검색·내 생일 ──────────── */}
      {tab === 'search' && (
        <>
          {/* 사건 검색 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>사건 검색</span>
              <span className={s.cardLabelHint}>이름·키워드</span>
            </div>
            <input
              className={s.textInput}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='예: "공룡", "농업", "지구", "달"'
            />
            <div className={s.searchResults}>
              {searchQuery.length > 0 && searchResults.length === 0 && (
                <p className={s.searchEmpty}>일치하는 사건이 없습니다.</p>
              )}
              {searchResults.map(e => {
                const cat = CATEGORIES[e.category]
                return (
                  <div key={e.id} className={`${s.eventCard} ${cat.borderCls}`}>
                    <span className={s.eventDot} style={{ background: cat.color }} />
                    <div className={s.eventBody}>
                      <p className={s.eventName}>{e.name}</p>
                      <p className={s.eventDate}>코스믹: {e.cosmicDate}</p>
                      <p className={s.eventReal}>실제: {fmtRealYears(e.realYearsAgo)}</p>
                      <p className={s.eventDesc}>{e.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 내 나이 입력 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>내 인생 → 코스믹 시간</span>
              <span className={s.cardLabelHint}>나이·이름 입력</span>
            </div>
            <div className={s.gridTwo}>
              <div>
                <span className={s.subLabel}>만 나이 (년)</span>
                <input className={s.bigInput} type="number" inputMode="numeric" min="0" max="120" step="1" value={age} onChange={e => setAge(Math.max(0, parseInt(e.target.value) || 0))} />
              </div>
              <div>
                <span className={s.subLabel}>이름 (선택, 공유 카드용)</span>
                <input className={s.textInput} type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="예: 홍길동" maxLength={20} />
              </div>
            </div>
          </div>

          {/* 결과 */}
          {age > 0 && (
            <>
              <div className={s.myLifeHero}>
                <p className={s.myLifeLead}>당신의 {age}년 인생은 우주 1년 기준</p>
                <div>
                  <span className={s.myLifeNum}>{round(myLife.cosmicSeconds, 3)}</span>
                  <span className={s.myLifeUnit}>초</span>
                </div>
                <p className={s.myLifeSub}>
                  우주 시계로는 <strong>12월 31일 23:59:59.{(myLife.cosmicSeconds / 1).toFixed(2).split('.')[1] ?? '93'}</strong> ~ <strong>24:00:00</strong> 사이
                </p>
              </div>

              {/* 비교 시각화 */}
              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>비교 시각화</span>
                  <span className={s.cardLabelHint}>로그 스케일</span>
                </div>
                <div className={s.compareBar}>
                  {compareBars.map(b => (
                    <div key={b.label} className={s.compareBarRow}>
                      <span className={s.compareBarLabel}>{b.label}</span>
                      <div className={s.compareBarTrack}>
                        <div className={s.compareBarFill} style={{ width: `${b.pct}%`, background: b.color }} />
                      </div>
                      <span className={s.compareBarValue}>{b.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 해석 카드 */}
              <div className={s.saganQuote}>
                {userName ? userName + '님의' : '당신의'} 인생은 우주 1년에서 약 <strong style={{ color: '#0D9488', fontStyle: 'normal' }}>{round(myLife.cosmicSeconds, 3)}초</strong>입니다.
                하지만 그 짧은 시간 동안 {userName ? userName + '님은' : '당신은'} 별을 보고, 사랑하고, 생각할 수 있습니다. 우주 138억 년 중 단 한 번뿐인 시간입니다.
                <span className={s.saganAttribution}>— 칼 세이건의 코스믹 관점</span>
              </div>

              {/* 공유 카드 */}
              <div className={s.shareCard}>
                <p className={s.shareTitle}>우주 1년에서 {userName ? userName + '님의' : '나의'} 시간</p>
                <p className={s.shareSubtitle}>{age}년 인생 = ?</p>
                <div className={s.shareBig}>
                  <p className={s.shareBigNum}>{round(myLife.cosmicSeconds, 3)}</p>
                  <span className={s.shareBigUnit}>초</span>
                </div>
                <div className={s.shareList}>
                  <div className={s.shareListItem}><span>🦕 공룡 시대</span><strong>약 4.2일</strong></div>
                  <div className={s.shareListItem}><span>👤 인류 등장</span><strong>약 11.4분</strong></div>
                  <div className={s.shareListItem}><span>🏛️ 인류 문명</span><strong>약 27.5초</strong></div>
                  <div className={s.shareListItem}><span>⏰ 우주 1년</span><strong>= 138억 년</strong></div>
                </div>
                <div className={s.shareWatermark}>youtil.kr 🌌</div>
              </div>

              <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
                {copied ? '✓ 복사됨 — SNS에 붙여넣기 하세요' : '공유 카드 텍스트 복사하기'}
              </button>
            </>
          )}
        </>
      )}

      {/* ──────────── TAB 4: 비교 모드 ──────────── */}
      {tab === 'compare' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>압축 단위 선택</span>
              <span className={s.cardLabelHint}>138억 년을 어떻게 압축할까?</span>
            </div>
            <div className={s.compressionToggle}>
              <button className={`${s.compressionBtn} ${compressionMode === '1year'   ? s.compressionActive : ''}`} onClick={() => setCompressionMode('1year')}   type="button">
                우주 1년<small>칼 세이건 방식</small>
              </button>
              <button className={`${s.compressionBtn} ${compressionMode === '24hours' ? s.compressionActive : ''}`} onClick={() => setCompressionMode('24hours')} type="button">
                우주 24시간<small>하루로 압축</small>
              </button>
              <button className={`${s.compressionBtn} ${compressionMode === '1km'     ? s.compressionActive : ''}`} onClick={() => setCompressionMode('1km')}     type="button">
                우주 1km<small>거리로 압축</small>
              </button>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>주요 사건 — {compressionMode === '1year' ? '1년 압축' : compressionMode === '24hours' ? '24시간 압축' : '1km 거리 압축'}</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.compressionTable} style={{ minWidth: 460 }}>
                <thead>
                  <tr>
                    <th scope="col">사건</th>
                    <th scope="col">실제 연도</th>
                    <th scope="col">{compressionMode === '1year' ? '코스믹 날짜' : compressionMode === '24hours' ? '24시간 시각' : '거리'}</th>
                  </tr>
                </thead>
                <tbody>
                  {compressionData.map((d, i) => (
                    <tr key={i}>
                      <td>{d.name}</td>
                      <td>{d.real}</td>
                      <td>{d.compressed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 충격 카드 (모드별) */}
          <div className={s.shockCard}>
            <p className={s.shockTitle}>핵심 포인트</p>
            <div className={s.shockList}>
              {compressionMode === '1year' && (
                <>
                  <div>· 인류 등장: 12월 31일 23:48 — 마지막 <strong>12분</strong></div>
                  <div>· 인류 문명: 마지막 <strong>14초</strong></div>
                  <div>· 산업혁명 이후: 마지막 <strong>0.6초</strong></div>
                </>
              )}
              {compressionMode === '24hours' && (
                <>
                  <div>· 인류 등장: 23:59:58 — 마지막 <strong>2초</strong></div>
                  <div>· 인류 문명: 마지막 <strong>0.075초</strong></div>
                  <div>· 산업혁명: 마지막 <strong>0.0016초</strong></div>
                </>
              )}
              {compressionMode === '1km' && (
                <>
                  <div>· 1m = <strong>1,380만 년</strong></div>
                  <div>· 인류 등장: 999.978m — 마지막 <strong>22mm</strong></div>
                  <div>· 인류 문명: 마지막 <strong>0.9mm</strong></div>
                  <div>· 산업혁명 이후: 마지막 <strong>0.018mm</strong></div>
                </>
              )}
            </div>
            {compressionMode === '1km' && (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.85 }}>
                💡 우주 1km 산책 중 <strong style={{ color: '#DC2626' }}>마지막 1mm</strong> 안에 인류 모든 문명이 들어갑니다.
              </p>
            )}
          </div>

          {/* 칼 세이건 인용 */}
          <div className={s.saganQuote}>
            우주에는 1,000억 개의 은하가 있고, 각 은하에는 1,000억 개의 별이 있습니다.
            <span className={s.saganAttribution}>— Carl Sagan</span>
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '코스믹 캘린더 요약 복사하기'}
          </button>
        </>
      )}
    </div>
  )
}

