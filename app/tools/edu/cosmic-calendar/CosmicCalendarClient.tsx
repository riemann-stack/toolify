'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import s from './cosmic-calendar.module.css'
import {
  EVENTS as EVENTS_RAW, type CosmicEvent, type CatKey,
  COSMIC_SECOND_REAL_YEARS,
  cosmicPosition, yearsAgoOf, fmtRealYears, ageToCosmic, MONTHS,
  compress24h, compress1km, cosmicClockStart,
} from './cosmicData'

// ─────────────────────────────────────────────
// 카테고리 (색·클래스는 CSS 모듈 참조라 여기 둔다)
// ─────────────────────────────────────────────
const CATEGORIES: Record<CatKey, { name: string; color: string; cls: string; borderCls: string }> = {
  cosmic:       { name: '우주 진화',  color: '#9B59B6', cls: s.catCosmic,       borderCls: s.borderCosmic },
  solar:        { name: '태양계',     color: '#A16207', cls: s.catSolar,        borderCls: s.borderSolar },
  earth:        { name: '지구',       color: '#0891B2', cls: s.catEarth,        borderCls: s.borderEarth },
  life:         { name: '생명·진화',  color: '#059669', cls: s.catLife,         borderCls: s.borderLife },
  human:        { name: '인류 진화',  color: '#EA580C', cls: s.catHuman,        borderCls: s.borderHuman },
  civilization: { name: '문명',       color: '#DC2626', cls: s.catCivilization, borderCls: s.borderCivilization },
  now:          { name: '현재',       color: '#0D9488', cls: s.catNow,          borderCls: s.borderNow },
}

/** 화면에서 쓰는 사건 — 달력 위치는 실제 연대에서 파생된다 */
type Event = CosmicEvent & {
  realYearsAgo: number
  cosmicDate: string
  month: number
  day: number
  hour: number
  minute: number
  second: number
  pct: number
}

function buildEvents(currentYear: number): Event[] {
  return EVENTS_RAW.map((e) => {
    const realYearsAgo = yearsAgoOf(e, currentYear)
    const p = cosmicPosition(realYearsAgo)
    return { ...e, realYearsAgo, cosmicDate: p.label, month: p.month, day: p.day, hour: p.hour, minute: p.minute, second: p.second, pct: p.pct }
  })
}

/** SSR·정적 생성 시점에 쓰는 기준 연도.
    ⚠️ 이 값이 화면에 박제되면 해가 바뀌었을 때 '몇 년 전'이 전부 틀어진다.
       마운트 후 실제 올해로 교체한다(첫 렌더는 SSR과 같아야 하이드레이션이 깨지지 않는다). */
const FALLBACK_YEAR = 2026

/** 마운트 여부만 필요하므로 구독은 아무 일도 하지 않는다 */
const subscribeNoop = () => () => {}

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const round = (v: number, dp = 1) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp)

// ─────────────────────────────────────────────
// 인터랙티브 타임라인 (반응형 · 점 + 호버/탭 팝업)
// ─────────────────────────────────────────────
type TLPoint = { key: string; pct: number; color: string; events: Event[] }

// 가까운 점들을 하나로 통합 (촘촘한 구역 → 점 하나)
/* ⚠️ 임계값이 비율(pct) 고정이라 좁은 화면에서 점이 겹쳤다 — 320px에서 최소 간격 0px로 실측됐고,
      겹친 점은 뒤엣것을 누를 수 없다. 트랙 폭을 받아 '픽셀 간격'으로도 환산해 묶는다. */
function clusterPoints(raw: { pct: number; event: Event }[], threshold: number, trackPx = 0): TLPoint[] {
  /* 점 지름 16px + 여백 → 중심 간 26px 이상 */
  const th = Math.max(threshold, trackPx > 0 ? 26 / trackPx : 0)
  const sorted = [...raw].sort((a, b) => a.pct - b.pct)
  const groups: { events: Event[]; pcts: number[] }[] = []
  let groupStart = -Infinity
  for (const it of sorted) {
    const last = groups[groups.length - 1]
    /* 그룹 '시작점'과 비교한다 — 직전 항목과만 비교하면 사슬처럼 이어져 폭이 무한정 넓어진다 */
    if (last && it.pct - groupStart <= th) {
      last.events.push(it.event); last.pcts.push(it.pct)
    } else {
      groups.push({ events: [it.event], pcts: [it.pct] })
      groupStart = it.pct
    }
  }
  /* 그룹의 표시 위치는 구성원의 평균이라 이웃 그룹끼리 다시 가까워질 수 있다.
     표시 위치 기준으로 한 번 더 병합해 겹침을 줄인다(겹친 점은 뒤엣것을 누를 수 없다). */
  const mean = (g: { pcts: number[] }) => g.pcts.reduce((a, b) => a + b, 0) / g.pcts.length
  /* 한 번 병합하면 평균이 옮겨져 다른 이웃과 다시 가까워질 수 있다 — 더 병합할 게 없을 때까지 돈다 */
  let changed = true
  let guard = 0
  while (changed && guard++ < 50) {
    changed = false
    for (let i = 1; i < groups.length; i++) {
      if (mean(groups[i]) - mean(groups[i - 1]) < th) {
        groups[i - 1].events.push(...groups[i].events)
        groups[i - 1].pcts.push(...groups[i].pcts)
        groups.splice(i, 1)
        changed = true
        break
      }
    }
  }
  return groups.map((g, i) => {
    const pct = g.pcts.reduce((a, b) => a + b, 0) / g.pcts.length
    const rep = g.events.find(e => e.category === 'now') ?? g.events[g.events.length - 1]
    return { key: `${g.events[0].id}__${i}`, pct, color: CATEGORIES[rep.category].color, events: g.events }
  })
}

function InteractiveTimeline({
  points, ticks, bands = [], activeKey, onSelect, ariaLabel, onTrackWidth,
}: {
  points: TLPoint[]
  ticks: { label: string; pct: number }[]
  bands?: { fromPct: number; toPct: number; label: string; color: string }[]
  activeKey: string | null
  onSelect: (key: string | null) => void
  ariaLabel: string
  /** 점을 픽셀 기준으로 떼어 놓기 위해 부모에게 트랙 폭을 알려 준다 */
  onTrackWidth?: (px: number) => void
}) {
  const barRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = barRef.current
    if (!el || !onTrackWidth) return
    const report = () => onTrackWidth(el.getBoundingClientRect().width)
    report()
    window.addEventListener('resize', report)
    return () => window.removeEventListener('resize', report)
  }, [onTrackWidth])

  return (
    <div className={s.tl} role="group" aria-label={ariaLabel} onClick={() => onSelect(null)}>
      <div className={s.tlBar} ref={barRef}>
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
  /* 해가 바뀌면 '몇 년 전'이 전부 달라진다. 정적 생성 시점의 연도가 박제되지 않도록
     마운트 게이트를 둔다 — 첫 클라이언트 렌더는 SSR과 같은 FALLBACK_YEAR로 그리고,
     마운트된 뒤에 실제 올해로 다시 계산한다. */
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false)
  const currentYear = mounted ? new Date().getFullYear() : FALLBACK_YEAR
  const events = useMemo(() => buildEvents(currentYear), [currentYear])
  /* '문자 이후 모든 역사'는 문자 연대(3400 BCE)에서 파생 — 예전 "14초"는 6,000년 기준의 관용치라
     우리 데이터(약 5,400년)와 어긋났다. 해가 바뀌면 자동으로 맞춰진다. */
  const writingCosmicSec = useMemo(() => {
    const w = events.find(e => e.id === 'writing')
    return w ? Math.round(w.realYearsAgo / COSMIC_SECOND_REAL_YEARS) : 12
  }, [events])

  const [tab, setTab] = useState<'year' | 'dec31' | 'search' | 'compare'>('year')
  const [zoomLevel, setZoomLevel] = useState<'24h' | 'lastHour' | 'last30s'>('24h')
  const [compressionMode, setCompressionMode] = useState<'1year' | '24hours' | '1km'>('1year')

  /* 점을 픽셀 기준으로 떼어 놓으려면 실제 트랙 폭이 필요하다 */
  const [trackPx, setTrackPx] = useState(0)
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set())
  const toggleMonth = (m: number) => setExpandedMonths(prev => {
    const next = new Set(prev)
    if (next.has(m)) next.delete(m); else next.add(m)
    return next
  })
  const handleTrackWidth = useCallback((px: number) => { setTrackPx((prev) => (Math.abs(prev - px) > 1 ? px : prev)) }, [])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [age, setAge] = useState<number>(30)
  const [userName, setUserName] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)
  const [activePoint, setActivePoint] = useState<string | null>(null)

  // 월별 사건 그룹화
  const eventsByMonth = useMemo(() => {
    const groups: Record<number, Event[]> = {}
    for (let m = 1; m <= 12; m++) groups[m] = []
    events.forEach(e => { groups[e.month]?.push(e) })
    return groups
  }, [events])

  // 12월 31일 사건만
  const dec31Events = useMemo(() => {
    return events.filter(e => e.month === 12 && e.day === 31)
      .sort((a, b) => {
        const ah = (a.hour ?? 0) * 3600 + (a.minute ?? 0) * 60 + (a.second ?? 0)
        const bh = (b.hour ?? 0) * 3600 + (b.minute ?? 0) * 60 + (b.second ?? 0)
        return ah - bh
      })
  }, [events])

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
    return events.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.cosmicDate.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [searchQuery, events])

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
    const raw = events.map(e => ({
      /* ⚠️ 예전에는 ((월-1) + (일-1)/31) / 12 로 위치를 잡아, 달마다 길이가 다른데도
         전부 31일로 나눠 점이 실제 시점에서 밀렸다. 이제 경과 비율을 그대로 쓴다. */
      pct: e.pct,
      event: e,
    }))
    return clusterPoints(raw, 0.02, trackPx)
  }, [events, trackPx])
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
    return clusterPoints(raw, 0.05, trackPx)
  }, [dec31Filtered, dec31Range, trackPx])

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
    const keyEvts = keyIds.map(id => events.find(e => e.id === id)!).filter(Boolean)

    if (compressionMode === '1year') {
      return keyEvts.map(e => ({
        name: e.name,
        real: fmtRealYears(e.realYearsAgo),
        compressed: e.cosmicDate,
      }))
    }

    if (compressionMode === '24hours') {
      return keyEvts.map(e => ({ name: e.name, real: fmtRealYears(e.realYearsAgo), compressed: compress24h(e.realYearsAgo) }))
    }
    // 1km 모드
    return keyEvts.map(e => ({ name: e.name, real: fmtRealYears(e.realYearsAgo), compressed: compress1km(e.realYearsAgo) }))
  }, [compressionMode, events])

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
        `인류 문명(농업) 12,000년 = 약 27.5초`,
        `문자 이후 기록 역사 = 약 ${writingCosmicSec}초`,
        `현생 인류 30만 년 = 약 11.4분`,
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
              onTrackWidth={handleTrackWidth}
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
              <span className={s.cardLabelHint}>{events.length - 1}개 주요 사건</span>
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
                    {events.length > 0 && (() => {
                      const isOpen = expandedMonths.has(i + 1)
                      const shown = isOpen ? events : events.slice(0, 4)
                      return (
                        <div className={s.monthEvents}>
                          {shown.map(e => (
                            <div key={e.id} className={s.monthEventItem}>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: CATEGORIES[e.category].color, flexShrink: 0, display: 'inline-block' }} />
                              <span>{e.name.length > 12 ? e.name.slice(0, 12) + '…' : e.name}</span>
                            </div>
                          ))}
                          {events.length > 4 && (
                            <button type="button" className={s.monthMoreBtn}
                              aria-expanded={isOpen}
                              onClick={() => toggleMonth(i + 1)}>
                              {isOpen ? '접기 ▲' : `+${events.length - 4}개 더 ▾`}
                            </button>
                          )}
                        </div>
                      )
                    })()}
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
              onTrackWidth={handleTrackWidth}
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
              <div>· 문자 발명 이후 인류 모든 역사 = 약 <strong>{writingCosmicSec}초</strong></div>
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
                <input className={s.bigInput} type="number" inputMode="numeric" min="0" max="120" step="1" value={age} onChange={e => setAge(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))} />
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
                  우주 시계로는 <strong>12월 31일 {cosmicClockStart(myLife.cosmicSeconds)}</strong> ~ <strong>24:00:00</strong> 사이
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
                  <div>· 인류 등장(현생 인류): 12월 31일 23:48 — 마지막 <strong>12분</strong></div>
                  <div>· 인류 문명(농업 이후): 마지막 <strong>27.5초</strong></div>
                  <div>· 문자 이후 기록 역사: 마지막 <strong>{writingCosmicSec}초</strong></div>
                </>
              )}
              {compressionMode === '24hours' && (
                <>
                  <div>· 인류 등장(현생 인류): 23:59:58 — 마지막 <strong>2초</strong></div>
                  <div>· 인류 문명(농업 이후): 마지막 <strong>0.075초</strong></div>
                  <div>· 산업혁명: 마지막 <strong>0.0016초</strong></div>
                </>
              )}
              {compressionMode === '1km' && (
                <>
                  <div>· 1m = <strong>1,380만 년</strong></div>
                  <div>· 인류 등장(현생 인류): 999.978m — 마지막 <strong>22mm</strong></div>
                  <div>· 인류 문명(농업 이후): 마지막 <strong>0.9mm</strong></div>
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

