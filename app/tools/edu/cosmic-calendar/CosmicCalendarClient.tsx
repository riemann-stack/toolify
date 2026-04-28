'use client'

import { useMemo, useState } from 'react'
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
  solar:        { name: '태양계',     color: '#FFD700', cls: s.catSolar,        borderCls: s.borderSolar },
  earth:        { name: '지구',       color: '#3EC8FF', cls: s.catEarth,        borderCls: s.borderEarth },
  life:         { name: '생명·진화',  color: '#3EFF9B', cls: s.catLife,         borderCls: s.borderLife },
  human:        { name: '인류 진화',  color: '#FF8C3E', cls: s.catHuman,        borderCls: s.borderHuman },
  civilization: { name: '문명',       color: '#FF6B6B', cls: s.catCivilization, borderCls: s.borderCivilization },
  now:          { name: '현재',       color: '#3EFFD0', cls: s.catNow,          borderCls: s.borderNow },
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
      { label: '공룡 시대',      cosmicSec: (165_000_000 / COSMIC_SECOND_REAL_YEARS), color: '#FF8C3E', desc: '약 4.4일' },
      { label: '인류 등장',      cosmicSec: (300_000   / COSMIC_SECOND_REAL_YEARS),   color: '#FFD700', desc: '약 11.4분' },
      { label: '인류 문명',      cosmicSec: (12_000    / COSMIC_SECOND_REAL_YEARS),   color: '#3EFF9B', desc: '약 27.5초' },
      { label: '내 나이',        cosmicSec: myLife.cosmicSeconds,             color: '#3EFFD0', desc: `약 ${round(myLife.cosmicSeconds, 3)}초` },
    ]
    const max = items[0].cosmicSec
    return items.map(it => ({
      ...it,
      // 로그 스케일 (작은 값도 보이게)
      pct: Math.max(0.5, (Math.log10(Math.max(0.01, it.cosmicSec)) / Math.log10(max)) * 100),
    }))
  }, [myLife])

  // ─────────────────────────────────────────────
  // 가로 타임라인 SVG
  // ─────────────────────────────────────────────
  const yearTimelineSvg = useMemo(() => {
    const W = 760
    const H = 180
    const padL = 40
    const padR = 40
    const innerW = W - padL - padR
    const lineY = 100
    const monthsToShow = MONTHS.map((m, i) => ({
      label: m,
      pct: i / 11,
      x: padL + (i / 11) * innerW,
    }))
    // 주요 사건 (humanAncestor는 우측 끝의 "현재"와 시각적으로 같은 위치이므로 제외)
    const keyEvents = [
      { id: 'bigbang',       label: '빅뱅' },
      { id: 'firstStars',    label: '첫 별' },
      { id: 'milkyWay',      label: '은하수' },
      { id: 'solarSystem',   label: '태양계' },
      { id: 'firstLife',     label: '생명' },
      { id: 'cambrian',      label: '캄브리아' },
      { id: 'dinosaurs',     label: '공룡' },
    ]
    const keyEventsWithPos = keyEvents.map(k => {
      const evt = EVENTS.find(e => e.id === k.id)!
      const monthIdx = (evt.month - 1)
      const dayOffset = (evt.day - 1) / 31
      const pct = (monthIdx + dayOffset) / 12
      return {
        ...k,
        evt,
        x: padL + pct * innerW,
        color: CATEGORIES[evt.category].color,
      }
    })

    /* 4단 라벨 배치 — 가까운 이웃과 겹치지 않게 위·아래로 멀리/가까이 분산.
       sorted index 기준으로 직전 라벨과 60px 미만이면 다음 단으로 밀어냄. */
    const sorted = [...keyEventsWithPos].sort((a, b) => a.x - b.x)
    type Tier = 0 | 1 | 2 | 3
    const tierMap = new Map<string, Tier>()
    // 마지막으로 각 tier 가 사용된 x
    const lastUsedX: Record<Tier, number> = { 0: -Infinity, 1: -Infinity, 2: -Infinity, 3: -Infinity }
    const TIER_ORDER: Tier[] = [0, 1, 2, 3] // above-near, below-near, above-far, below-far
    const MIN_GAP = 70
    sorted.forEach(ev => {
      // 같은 tier 가 충분히 떨어진 곳을 우선 선택
      const tier = TIER_ORDER.find(t => ev.x - lastUsedX[t] >= MIN_GAP) ?? 3
      tierMap.set(ev.id, tier)
      lastUsedX[tier] = ev.x
    })

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={s.yearTimelineSvg} aria-hidden="true">
        <defs>
          <linearGradient id="cosmicLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#9B59B6" />
            <stop offset="40%"  stopColor="#FFD700" />
            <stop offset="65%"  stopColor="#3EC8FF" />
            <stop offset="85%"  stopColor="#3EFF9B" />
            <stop offset="100%" stopColor="#3EFFD0" />
          </linearGradient>
        </defs>

        {/* 메인 가로선 */}
        <line x1={padL} y1={lineY} x2={W - padR} y2={lineY} stroke="url(#cosmicLineGrad)" strokeWidth="3" />

        {/* 월 라벨 */}
        {monthsToShow.map((m, i) => (
          <g key={i}>
            <line x1={m.x} y1={lineY - 6} x2={m.x} y2={lineY + 6} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <text x={m.x} y={lineY + 22} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="Syne, sans-serif" fontWeight={700}>
              {m.label}
            </text>
          </g>
        ))}

        {/* 사건 마커 — 4단 라벨 배치 */}
        {keyEventsWithPos.map(ev => {
          const tier = tierMap.get(ev.id) ?? 0
          // tier 0: above-near, 1: below-near, 2: above-far, 3: below-far
          const above = tier === 0 || tier === 2
          const far   = tier === 2 || tier === 3
          const tickEnd  = far ? 36 : 22
          const labelOff = far ? 46 : 32
          const lineYStart = above ? lineY - 8           : lineY + 8
          const lineYEnd   = above ? lineY - tickEnd     : lineY + (tickEnd + 6)
          const labelY     = above ? lineY - labelOff    : lineY + (labelOff + 8)
          return (
            <g key={ev.id}>
              <line x1={ev.x} y1={lineYStart} x2={ev.x} y2={lineYEnd} stroke={ev.color} strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
              <circle cx={ev.x} cy={lineY} r="5" fill={ev.color} stroke="#0a0a2e" strokeWidth="1.5" />
              <text x={ev.x} y={labelY} textAnchor="middle" fontSize="10" fill={ev.color} fontFamily="Noto Sans KR, sans-serif" fontWeight={700}>
                {ev.evt.icon} {ev.label}
              </text>
            </g>
          )
        })}

        {/* "현재 (= 인류)" 마커 — 우측 끝 */}
        <circle cx={W - padR} cy={lineY} r="7" fill="#3EFFD0" stroke="#0a0a2e" strokeWidth="2" />
        <text x={W - padR - 4} y={lineY - 16} textAnchor="end" fontSize="11" fill="#3EFFD0" fontFamily="Syne, sans-serif" fontWeight={800}>
          🧍 현재
        </text>
      </svg>
    )
  }, [])

  // ─────────────────────────────────────────────
  // 24시간 시계 SVG (탭 2)
  // ─────────────────────────────────────────────
  const dec31ClockSvg = useMemo(() => {
    const size = 400              // 320 → 400 (라벨이 원 밖으로 충분히 나갈 공간 확보)
    const cx = size / 2
    const cy = size / 2
    const r = 140
    const centerR = 4

    // 줌 레벨에 따른 angle 계산
    function timeToAngle(h: number, m: number, sec: number): number {
      // 24h: 0~24시간 → 0~360°
      // lastHour: 23:00~24:00 → 0~360°
      // last30s: 23:59:30~24:00:00 → 0~360°
      const totalSeconds = h * 3600 + m * 60 + sec
      let ratio = 0
      if (zoomLevel === '24h') {
        ratio = totalSeconds / (24 * 3600)
      } else if (zoomLevel === 'lastHour') {
        ratio = (totalSeconds - 23 * 3600) / 3600
      } else {
        ratio = (totalSeconds - (23 * 3600 + 59 * 60 + 30)) / 30
      }
      ratio = Math.max(0, Math.min(1, ratio))
      // 12시 방향(상단)에서 시작해 시계방향
      return ratio * 2 * Math.PI - Math.PI / 2
    }

    // 시간 라벨
    type Tick = { hourLabel: string; angle: number }
    let ticks: Tick[] = []
    if (zoomLevel === '24h') {
      ticks = [0, 3, 6, 9, 12, 15, 18, 21].map(h => ({ hourLabel: `${h}:00`, angle: (h / 24) * 2 * Math.PI - Math.PI / 2 }))
    } else if (zoomLevel === 'lastHour') {
      ticks = [0, 15, 30, 45].map(m => ({ hourLabel: `23:${m.toString().padStart(2, '0')}`, angle: (m / 60) * 2 * Math.PI - Math.PI / 2 }))
    } else {
      ticks = [0, 7.5, 15, 22.5].map(s => ({ hourLabel: `+${s}s`, angle: (s / 30) * 2 * Math.PI - Math.PI / 2 }))
    }

    /* ─── 줌별로 표시할 사건 큐레이션 (24h·lastHour 에서는 너무 많이 모이므로 주요 사건만) ─── */
    let displayed: typeof dec31Filtered
    if (zoomLevel === '24h') {
      const majors = new Set(['humanAncestor', 'fire', 'homoSapiens', 'agriculture', 'romanEmpire', 'industrial', 'internet'])
      displayed = dec31Filtered.filter(e => majors.has(e.id))
    } else if (zoomLevel === 'lastHour') {
      const majors = new Set([
        'fire', 'homoSapiens', 'language',
        'agriculture', 'writing', 'pyramids', 'jesus',
        'industrial', 'moonLanding', 'internet',
      ])
      displayed = dec31Filtered.filter(e => majors.has(e.id))
    } else {
      displayed = dec31Filtered // last30s — 11개 이미 잘 분포
    }

    /* ─── 각도 기반 클러스터 감지 + 단계별 외곽 배치 ─── */
    type Positioned = { evt: typeof displayed[number]; angle: number; tier: number }
    const ANGLE_THRESHOLD = 0.07 // ~4° — 이 안에 모이면 같은 클러스터
    const sorted: Positioned[] = displayed
      .map(e => ({ evt: e, angle: timeToAngle(e.hour ?? 0, e.minute ?? 0, e.second ?? 0), tier: 0 }))
      .sort((a, b) => a.angle - b.angle)
    let prevAngle = -Infinity
    let curTier = 0
    sorted.forEach(p => {
      if (p.angle - prevAngle < ANGLE_THRESHOLD) curTier += 1
      else curTier = 0
      p.tier = curTier
      prevAngle = p.angle
    })

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className={s.clockSvg} width={size} height={size} aria-hidden="true">
        <defs>
          <radialGradient id="clockBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(62,255,208,0.15)" />
            <stop offset="100%" stopColor="rgba(155,89,182,0.05)" />
          </radialGradient>
        </defs>

        {/* 배경 원 */}
        <circle cx={cx} cy={cy} r={r + 8} fill="url(#clockBg)" />
        <circle cx={cx} cy={cy} r={r}     fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" />

        {/* 줌 레벨에 따른 강조 호 (last hour 또는 last 30s) */}
        {zoomLevel === '24h' && (
          <path
            d={describeArc(cx, cy, r - 4, ((23 * 3600) / (24 * 3600)) * 360 - 90, 270)}
            fill="none" stroke="#3EFFD0" strokeWidth="3" opacity="0.75"
          />
        )}

        {/* 시간 눈금 */}
        {ticks.map((t, i) => {
          const x1 = cx + (r - 6) * Math.cos(t.angle)
          const y1 = cy + (r - 6) * Math.sin(t.angle)
          const x2 = cx + r * Math.cos(t.angle)
          const y2 = cy + r * Math.sin(t.angle)
          const lx = cx + (r + 16) * Math.cos(t.angle)
          const ly = cy + (r + 16) * Math.sin(t.angle)
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text x={lx} y={ly + 4} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)" fontFamily="Syne, sans-serif" fontWeight={700}>
                {t.hourLabel}
              </text>
            </g>
          )
        })}

        {/* 사건 마커 — 클러스터 단별 외곽 배치 */}
        {sorted.map(({ evt: e, angle, tier }) => {
          const mr = r - 6
          const x = cx + mr * Math.cos(angle)
          const y = cy + mr * Math.sin(angle)
          // tier 별 라벨 거리 (cap 3단). 4번째부터는 점만 표시
          const showEmoji = tier <= 2
          const lr = r + 28 + tier * 22
          const lx = cx + lr * Math.cos(angle)
          const ly = cy + lr * Math.sin(angle)
          const color = CATEGORIES[e.category].color
          return (
            <g key={e.id}>
              <circle cx={x} cy={y} r="4" fill={color} stroke="#0a0a2e" strokeWidth="1.5" />
              {showEmoji && (
                <>
                  <line x1={x} y1={y} x2={lx} y2={ly} stroke={color} strokeWidth="0.5" opacity="0.5" strokeDasharray="2 2" />
                  <text x={lx} y={ly + 4} textAnchor="middle" fontSize="14" fill={color} fontFamily="Noto Sans KR, sans-serif" fontWeight={700}>
                    {e.icon}
                  </text>
                </>
              )}
            </g>
          )
        })}

        {/* 중앙 */}
        <circle cx={cx} cy={cy} r={centerR} fill="#3EFFD0" />
        <text x={cx} y={cy - r * 0.55} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.55)" fontFamily="Syne, sans-serif" fontWeight={700} letterSpacing="0.06em">
          12월 31일
        </text>
        <text x={cx} y={cy + r * 0.55} textAnchor="middle" fontSize="13" fill="#3EFFD0" fontFamily="Syne, sans-serif" fontWeight={800}>
          {zoomLevel === '24h' ? '24h' : zoomLevel === 'lastHour' ? '23~24시' : '마지막 30초'}
        </text>
      </svg>
    )
  }, [zoomLevel, dec31Filtered])

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
        `🌌 우주 1년에서 ${userName ? userName + '님의' : '나의'} 시간`,
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
      <div className={s.disclaimer}>
        <strong>칼 세이건의 코스믹 캘린더 시각화</strong>입니다. 사건 시점은 현재 과학계의 추정치이며, 새로운 발견에 따라 조정될 수 있습니다.
        주요 데이터 출처: NASA, ESA, 국제 천문학 연합(IAU), 한국천문연구원(KASI).
      </div>

      {/* 현재 우주 시간 헤더 */}
      <div className={s.cosmicNow}>
        <p className={s.cosmicNowLabel}>오늘의 코스믹 시간</p>
        <p className={s.cosmicNowDate}>12월 31일 23:59:59.999...초</p>
        <p className={s.cosmicNowSub}>매 순간이 우주 138억 년 중 단 한 번뿐입니다 ✨</p>
      </div>

      {/* 우주 단위 환산 */}
      <div className={s.unitCard}>
        <div><strong>1년</strong> = 138억 년</div>
        <div><strong>1일</strong> ≈ 3,778만 년 · <strong>1시간</strong> ≈ 157만 년</div>
        <div><strong>1분</strong> ≈ 26,200년 · <strong>1초</strong> ≈ 437년</div>
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'year'    ? s.tabActive : ''}`} onClick={() => setTab('year')}>연간 타임라인</button>
        <button className={`${s.tabBtn} ${tab === 'dec31'   ? s.tabActive : ''}`} onClick={() => setTab('dec31')}>12월 31일</button>
        <button className={`${s.tabBtn} ${tab === 'search'  ? s.tabActive : ''}`} onClick={() => setTab('search')}>사건 검색·내 생일</button>
        <button className={`${s.tabBtn} ${tab === 'compare' ? s.tabActive : ''}`} onClick={() => setTab('compare')}>비교 모드</button>
      </div>

      {/* ──────────── TAB 1: 연간 타임라인 ──────────── */}
      {tab === 'year' && (
        <>
          <div className={s.spaceBg}>
            <p style={{ textAlign: 'center', color: '#3EFFD0', fontSize: 14, fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 700, marginBottom: 12 }}>
              🌌 우주 138억 년 = 1년
            </p>
            <div className={s.yearTimelineWrap}>
              {yearTimelineSvg}
            </div>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 12, lineHeight: 1.7 }}>
              왼쪽 끝: 빅뱅(1월 1일) · 오른쪽 끝: <strong style={{ color: '#3EFFD0' }}>현재(12월 31일 24:00)</strong>
            </p>
          </div>

          {/* 12월 31일 강조 카드 */}
          <div className={s.dec31Banner}>
            <p className={s.dec31BannerTitle}>🚨 12월 31일 — 인류의 시간</p>
            <p className={s.dec31BannerText}>
              인류 조상은 <strong>22:24</strong>에 등장, 현생 인류는 <strong>23:48</strong>, 농업·문명·과학·인터넷 모두 마지막 <strong>30초</strong> 안에 일어났습니다.
            </p>
            <button className={s.dec31BannerBtn} onClick={() => setTab('dec31')} type="button">
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
                            <span>{e.icon}</span>
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
              <button className={`${s.zoomBtn} ${zoomLevel === '24h'     ? s.zoomActive : ''}`} onClick={() => setZoomLevel('24h')}     type="button">24시간 전체</button>
              <button className={`${s.zoomBtn} ${zoomLevel === 'lastHour'? s.zoomActive : ''}`} onClick={() => setZoomLevel('lastHour')} type="button">마지막 1시간 (23~24시)</button>
              <button className={`${s.zoomBtn} ${zoomLevel === 'last30s' ? s.zoomActive : ''}`} onClick={() => setZoomLevel('last30s')}  type="button">마지막 30초</button>
            </div>
          </div>

          <div className={s.spaceBg}>
            <div className={s.clockWrap}>
              {dec31ClockSvg}
            </div>
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
                      <span className={s.eventIcon}>{e.icon}</span>
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
            <p className={s.shockTitle}>🤯 충격적 사실</p>
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
              <span>🔍 사건 검색</span>
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
                    <span className={s.eventIcon}>{e.icon}</span>
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
              <span>🎂 내 인생 → 코스믹 시간</span>
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
                {userName ? userName + '님의' : '당신의'} 인생은 우주 1년에서 약 <strong style={{ color: '#3EFFD0', fontStyle: 'normal' }}>{round(myLife.cosmicSeconds, 3)}초</strong>입니다.
                하지만 그 짧은 시간 동안 {userName ? userName + '님은' : '당신은'} 별을 보고, 사랑하고, 생각할 수 있습니다. 우주 138억 년 중 단 한 번뿐인 시간입니다.
                <span className={s.saganAttribution}>— 칼 세이건의 코스믹 관점</span>
              </div>

              {/* 공유 카드 */}
              <div className={s.shareCard}>
                <p className={s.shareTitle}>🌌 우주 1년에서 {userName ? userName + '님의' : '나의'} 시간</p>
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
                🗓️ 우주 1년<small>칼 세이건 방식</small>
              </button>
              <button className={`${s.compressionBtn} ${compressionMode === '24hours' ? s.compressionActive : ''}`} onClick={() => setCompressionMode('24hours')} type="button">
                🕐 우주 24시간<small>하루로 압축</small>
              </button>
              <button className={`${s.compressionBtn} ${compressionMode === '1km'     ? s.compressionActive : ''}`} onClick={() => setCompressionMode('1km')}     type="button">
                📐 우주 1km<small>거리로 압축</small>
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
                    <th>사건</th>
                    <th>실제 연도</th>
                    <th>{compressionMode === '1year' ? '코스믹 날짜' : compressionMode === '24hours' ? '24시간 시각' : '거리'}</th>
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
            <p className={s.shockTitle}>💥 충격 포인트</p>
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
                💡 우주 1km 산책 중 <strong style={{ color: '#FF8C8C' }}>마지막 1mm</strong> 안에 인류 모든 문명이 들어갑니다.
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

// ─────────────────────────────────────────────
// SVG 호 그리기 헬퍼
// ─────────────────────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180.0
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, endDeg)
  const end = polarToCartesian(cx, cy, r, startDeg)
  const largeArc = endDeg - startDeg <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}
