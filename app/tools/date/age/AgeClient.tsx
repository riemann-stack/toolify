'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './age.module.css'
import {
  calcAge, calcKoreanAge, calcYearAge, calcDaysAlive,
  nextBirthday, dateAfterDays, dateAtAge, ddayUntil, calcLifeStats,
  getZodiacAnimal, getWesternZodiac, getBirthGift, getGeneration,
  formatBigKor, fmtDate, fmtDateKo,
} from './ageUtils'
import {
  DAY_MILESTONES, AGE_MILESTONES, KOREAN_AGE_NAMES,
} from './zodiacData'

type Tab = 'age' | 'dday' | 'stats' | 'milestone' | 'culture'
type RefPreset = 'today' | 'eoy' | 'eoyNext' | 'custom'
type TimelineSpan = 'short' | 'long'  // 70년 / 100년

const currentYear = new Date().getFullYear()
const yearsRange = Array.from({ length: 110 }, (_, i) => currentYear - i)
const monthsRange = Array.from({ length: 12 }, (_, i) => i + 1)
const daysRange = Array.from({ length: 31 }, (_, i) => i + 1)

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function AgeClient() {
  const [tab, setTab] = useState<Tab>('age')

  /* 생년월일 */
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')

  /* 기준일 */
  const [refPreset, setRefPreset] = useState<RefPreset>('today')
  const [customRef, setCustomRef] = useState('')

  /* 실시간 시계 — D-day 카운트다운용 */
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const birth = useMemo(() => {
    if (!year || !month || !day) return null
    const d = new Date(Number(year), Number(month) - 1, Number(day))
    if (isNaN(d.getTime())) return null
    if (d.getFullYear() !== Number(year) || d.getMonth() !== Number(month) - 1 || d.getDate() !== Number(day)) return null
    return d
  }, [year, month, day])

  const refDate = useMemo<Date>(() => {
    if (refPreset === 'today') return now
    if (refPreset === 'eoy')      return new Date(currentYear, 11, 31)
    if (refPreset === 'eoyNext')  return new Date(currentYear + 1, 11, 31)
    if (refPreset === 'custom' && customRef) {
      const d = new Date(customRef)
      if (!isNaN(d.getTime())) return d
    }
    return now
  }, [refPreset, customRef, now])

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        💡 <strong>참고용 인생 통계·문화 정보 도구</strong> — 법령상 나이 기준은 제도별로 다를 수 있으니 실제 신청·계약 시 관련 법령과 기관에 확인하세요. 병역법·학교 입학 등 일부 제도는 만 나이가 아닌 연 나이 또는 별도 기준을 사용합니다. 띠·별자리·탄생석은 문화·전통 정보이며 점술·운세 목적이 아닙니다.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        {([
          ['age',       '만 나이·기준일'],
          ['dday',      '생일 D-day'],
          ['stats',     '인생 통계'],
          ['milestone', '마일스톤'],
          ['culture',   '문화 정보'],
        ] as [Tab, string][]).map(([key, label]) => {
          const active =
            tab !== key ? '' :
            key === 'dday'      ? s.tabActiveDday :
            key === 'stats'     ? s.tabActiveStats :
            key === 'milestone' ? s.tabActiveMilestone :
            key === 'culture'   ? s.tabActiveCulture :
            s.tabActive
          return (
            <button key={key}
              className={`${s.tabBtn} ${active}`}
              onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {/* 생년월일 (모든 탭 공통) */}
      <div className={s.card}>
        <label className={s.cardLabel}>생년월일</label>
        <div className={s.dateRow}>
          <select className={s.dateSelect} value={year} onChange={e => setYear(e.target.value)}>
            <option value="">년도</option>
            {yearsRange.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select className={s.dateSelect} value={month} onChange={e => setMonth(e.target.value)}>
            <option value="">월</option>
            {monthsRange.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
          <select className={s.dateSelect} value={day} onChange={e => setDay(e.target.value)}>
            <option value="">일</option>
            {daysRange.map(d => <option key={d} value={d}>{d}일</option>)}
          </select>
        </div>
      </div>

      {!birth && (
        <div className={s.empty}>생년월일을 선택하면 만 나이부터 D-day, 인생 통계까지 한 번에 계산됩니다</div>
      )}

      {birth && tab === 'age'       && <AgeTab       birth={birth} refDate={refDate} now={now} refPreset={refPreset} setRefPreset={setRefPreset} customRef={customRef} setCustomRef={setCustomRef} />}
      {birth && tab === 'dday'      && <DdayTab      birth={birth} now={now} />}
      {birth && tab === 'stats'     && <StatsTab     birth={birth} now={now} />}
      {birth && tab === 'milestone' && <MilestoneTab birth={birth} now={now} />}
      {birth && tab === 'culture'   && <CultureTab   birth={birth} now={now} />}
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 1 — 만 나이 ═════════════════════════════════════════ */
type AgeTabProps = {
  birth: Date
  refDate: Date
  now: Date
  refPreset: RefPreset
  setRefPreset: (p: RefPreset) => void
  customRef: string
  setCustomRef: (s: string) => void
}
function AgeTab({ birth, refDate, now, refPreset, setRefPreset, customRef, setCustomRef }: AgeTabProps) {
  const age   = calcAge(birth, refDate)
  const koAge = calcKoreanAge(birth, refDate)
  const yrAge = calcYearAge(birth, refDate)
  const next  = nextBirthday(birth, refDate)
  const isBirthdayToday =
    refPreset === 'today' &&
    birth.getMonth() === now.getMonth() &&
    birth.getDate() === now.getDate()

  const refKor = refPreset === 'today' ? '오늘' : fmtDateKo(refDate, false)

  return (
    <>
      {isBirthdayToday && (
        <div className={s.birthdayBanner}>🎉 오늘은 생일입니다! 축하드립니다!</div>
      )}

      {/* 만 나이 히어로 */}
      <div className={s.ageHero}>
        <div className={s.ageHeroLabel}>만 나이 (기준일: {refKor})</div>
        <div className={s.ageHeroNum}>
          {age}<span className={s.ageHeroUnit}>세</span>
        </div>
        <div className={s.ageHeroSub}>
          {fmtDateKo(birth)}생 · 다음 생일까지 <strong style={{ color: 'var(--accent)' }}>D-{next.daysUntil}</strong>
        </div>
      </div>

      {/* 3종 나이 비교 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          3종 나이 비교
          <span className={s.cardLabelHint}>한국에서 통용되는 계산법</span>
        </label>
        <div className={s.compareGrid}>
          <div className={`${s.compareCard} ${s.compareCardActive}`}>
            <div className={s.compareLabel}>만 나이</div>
            <div className={s.compareNum}>{age}세</div>
            <div className={s.compareSub}>법령·계약 표준</div>
          </div>
          <div className={s.compareCard}>
            <div className={s.compareLabel}>세는 나이</div>
            <div className={s.compareNum}>{koAge}세</div>
            <div className={s.compareSub}>한국 전통 방식</div>
          </div>
          <div className={s.compareCard}>
            <div className={s.compareLabel}>연 나이</div>
            <div className={s.compareNum}>{yrAge}세</div>
            <div className={s.compareSub}>병역법·학년 등</div>
          </div>
        </div>
      </div>

      {/* 기준일 변경 */}
      <div className={s.card}>
        <label className={s.cardLabel}>기준일 변경</label>
        <div className={s.refRow}>
          <button className={`${s.refBtn} ${refPreset === 'today'    ? s.refActive : ''}`} onClick={() => setRefPreset('today')}>📅 오늘</button>
          <button className={`${s.refBtn} ${refPreset === 'eoy'      ? s.refActive : ''}`} onClick={() => setRefPreset('eoy')}>📅 {currentYear}-12-31</button>
          <button className={`${s.refBtn} ${refPreset === 'eoyNext'  ? s.refActive : ''}`} onClick={() => setRefPreset('eoyNext')}>📅 {currentYear + 1}-12-31</button>
          <button className={`${s.refBtn} ${refPreset === 'custom'   ? s.refActive : ''}`} onClick={() => setRefPreset('custom')}>📅 직접 선택</button>
        </div>
        {refPreset === 'custom' && (
          <div style={{ marginTop: 10 }}>
            <input className={s.dateInput} type="date" value={customRef}
              onChange={e => setCustomRef(e.target.value)} />
          </div>
        )}
      </div>

      {/* 생일 정보 */}
      <div className={s.infoGrid3}>
        <div className={s.infoCard}>
          <div className={s.infoNum}>{calcDaysAlive(birth, refDate).toLocaleString()}</div>
          <div className={s.infoLabel}>태어난 지</div>
          <div className={s.infoSub}>일째</div>
        </div>
        <div className={s.infoCard}>
          <div className={s.infoNum}>{next.daysUntil}</div>
          <div className={s.infoLabel}>다음 생일까지</div>
          <div className={s.infoSub}>일 ({next.dayOfWeek}요일{next.isWeekend ? ' · 주말' : ''})</div>
        </div>
        <div className={s.infoCard}>
          <div className={s.infoNum}>{['일', '월', '화', '수', '목', '금', '토'][birth.getDay()]}</div>
          <div className={s.infoLabel}>태어난 요일</div>
          <div className={s.infoSub}>{fmtDate(birth)}</div>
        </div>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 2 — D-day ═════════════════════════════════════════ */
function DdayTab({ birth, now }: { birth: Date; now: Date }) {
  const next = nextBirthday(birth, now)
  // 실시간 카운트다운 — milliseconds 단위
  const targetMs = next.date.getTime()
  const diffMs = Math.max(0, targetMs - now.getTime())
  const dDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const dHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const dMins  = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const dSecs  = Math.floor((diffMs % (1000 * 60)) / 1000)

  // 다가오는 마일스톤 — 가까운 순 8개
  const daysAlive = calcDaysAlive(birth, now)
  const upcomingDays = DAY_MILESTONES
    .filter(m => m.days > daysAlive)
    .map(m => ({ ...m, date: dateAfterDays(birth, m.days), daysUntil: m.days - daysAlive }))
  const upcomingAges = AGE_MILESTONES
    .filter(m => m.age > calcAge(birth, now))
    .map(m => ({
      ...m,
      icon: m.emoji,
      label: m.name,
      date: dateAtAge(birth, m.age),
      daysUntil: ddayUntil(dateAtAge(birth, m.age), now),
    }))

  type Upcoming = { name: string; date: Date; daysUntil: number; icon?: string }
  const allUpcoming: Upcoming[] = [
    { name: `다음 생일 (만 ${next.age}세)`, date: next.date, daysUntil: next.daysUntil, icon: '🎂' },
    ...upcomingDays.map(u => ({ name: u.name, date: u.date, daysUntil: u.daysUntil, icon: u.emoji })),
    ...upcomingAges.map(u => ({ name: u.label, date: u.date, daysUntil: u.daysUntil, icon: u.icon })),
  ].sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 10)

  const ddayClass = (d: number) => d <= 30 ? s.ddayClose : d <= 100 ? s.ddayMid : s.ddayFar

  return (
    <>
      {/* 메인 D-day 히어로 */}
      <div className={s.ddayHero}>
        <div className={s.ddayHeroLabel}>다음 생일까지</div>
        <div className={s.ddayHeroNum}>D-{next.daysUntil}</div>
        <div className={s.ddayHeroSub}>
          <strong>만 {next.age}세 생일</strong> — {fmtDateKo(next.date)}
          {next.isWeekend && <span style={{ color: '#FFD700' }}> · 주말</span>}
        </div>

        <div className={s.countdownLive}>
          <div className={s.countdownBox}>
            <div className={s.countdownNum}>{dDays}</div>
            <div className={s.countdownLabel}>일</div>
          </div>
          <div className={s.countdownBox}>
            <div className={s.countdownNum}>{String(dHours).padStart(2, '0')}</div>
            <div className={s.countdownLabel}>시간</div>
          </div>
          <div className={s.countdownBox}>
            <div className={s.countdownNum}>{String(dMins).padStart(2, '0')}</div>
            <div className={s.countdownLabel}>분</div>
          </div>
          <div className={s.countdownBox}>
            <div className={s.countdownNum}>{String(dSecs).padStart(2, '0')}</div>
            <div className={s.countdownLabel}>초</div>
          </div>
        </div>
      </div>

      {/* 가까운 마일스톤 표 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          다가오는 마일스톤 카운트다운
          <span className={s.cardLabelHint}>가까운 순 10개</span>
        </label>
        <div className={s.upcomingTable}>
          {allUpcoming.map((u, i) => (
            <div key={i} className={s.upcomingRow}>
              <span className={s.upcomingName}>
                {u.icon && <span style={{ marginRight: 6 }}>{u.icon}</span>}
                {u.name}
              </span>
              <span className={s.upcomingDate}>{fmtDate(u.date)}</span>
              <span className={`${s.upcomingDday} ${ddayClass(u.daysUntil)}`}>D-{u.daysUntil}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3 — 인생 통계 ═════════════════════════════════════════ */
function StatsTab({ birth, now }: { birth: Date; now: Date }) {
  const stats = calcLifeStats(birth, now)

  // 코스믹 비교 — 로그 스케일 (모두 가시화)
  // 우주 1년 = 437.5억 = 1.0 (비교 max)
  // 인류 문명 12000년 / 인류 등장 30만 년 / 사용자 인생
  const cosmicItems = [
    { name: '우주 138억 년',    sec: 365.25 * 24 * 3600,                    color: '#9B59B6' },
    { name: '공룡 시대',         sec: (165_000_000 / 437.5),                color: '#FF8C3E' },
    { name: '인류 등장 (30만 년)', sec: (300_000   / 437.5),                color: '#FFD700' },
    { name: '인류 문명 (12천 년)', sec: (12_000    / 437.5),                color: '#3EFF9B' },
    { name: '내 인생',           sec: stats.cosmicSeconds,                  color: '#3EFFD0' },
  ]
  const max = cosmicItems[0].sec
  const itemsWithPct = cosmicItems.map(it => ({
    ...it,
    pct: Math.max(0.6, (Math.log10(Math.max(0.000001, it.sec)) / Math.log10(max)) * 100),
    desc: it.name === '내 인생' ? `${it.sec.toFixed(3)}초` : (
      it.name.includes('우주') ? '365일' :
      it.name.includes('공룡') ? '약 4.4일' :
      it.name.includes('인류 등장') ? '약 11.4분' : '약 27.5초'
    ),
  }))

  return (
    <>
      {/* 주요 시간 통계 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          태어난 지 — 시간 단위 변환
        </label>
        <div className={s.statsGrid}>
          <div className={s.statBigCard}>
            <div className={s.statBigNum}>{stats.daysAlive.toLocaleString()}</div>
            <div className={s.statBigLabel}>일</div>
            <div className={s.statBigSub}>{stats.weeksAlive.toLocaleString()}주 · {stats.monthsAlive.toLocaleString()}개월</div>
          </div>
          <div className={s.statBigCard}>
            <div className={s.statBigNum}>{formatBigKor(stats.hoursAlive)}</div>
            <div className={s.statBigLabel}>시간</div>
            <div className={s.statBigSub}>{stats.hoursAlive.toLocaleString()} h</div>
          </div>
          <div className={s.statBigCard}>
            <div className={s.statBigNum}>{formatBigKor(stats.minutesAlive)}</div>
            <div className={s.statBigLabel}>분</div>
            <div className={s.statBigSub}>{stats.minutesAlive.toLocaleString()} min</div>
          </div>
          <div className={s.statBigCard}>
            <div className={s.statBigNum}>{formatBigKor(stats.secondsAlive)}</div>
            <div className={s.statBigLabel}>초</div>
            <div className={s.statBigSub}>{stats.secondsAlive.toLocaleString()} sec</div>
          </div>
        </div>
      </div>

      {/* 재미있는 환산 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          재미있는 환산
          <span className={s.cardLabelHint}>평균값 기반 추정치</span>
        </label>
        <div className={s.funStatsList}>
          {[
            { icon: '😴', label: '잠잔 시간',   sub: '인생의 약 33%',           value: `${formatBigKor(stats.sleepHours)} 시간` },
            { icon: '🍽️', label: '식사 횟수',   sub: '하루 3끼 기준',           value: `${formatBigKor(stats.mealsCount)} 끼` },
            { icon: '❤️', label: '심장 박동',   sub: '평균 70 BPM 기준',        value: `${formatBigKor(stats.heartbeats)} 회` },
            { icon: '🫁', label: '호흡',         sub: '분당 16회 기준',          value: `${formatBigKor(stats.breaths)} 회` },
            { icon: '👁️', label: '눈 깜빡임',   sub: '깨어있는 시간 분당 17회', value: `${formatBigKor(stats.blinks)} 회` },
            { icon: '👟', label: '예상 걸음 수', sub: '하루 7,000보 기준',       value: `${formatBigKor(stats.stepsAvg)} 보` },
          ].map((row, i) => (
            <div key={i} className={s.funStatRow}>
              <span className={s.funStatIcon}>{row.icon}</span>
              <span className={s.funStatLabel}>
                {row.label}
                <small>{row.sub}</small>
              </span>
              <span className={s.funStatValue}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 코스믹 캘린더 비교 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          코스믹 캘린더 비교
          <span className={s.cardLabelHint}>우주 138억 년 = 1년 환산</span>
        </label>
        <div className={s.cosmicCompare}>
          {itemsWithPct.map((it, i) => (
            <div key={i} className={s.cosmicRow}>
              <span className={s.cosmicName}>{it.name}</span>
              <span className={s.cosmicBarBox}>
                <span className={s.cosmicBar} style={{ width: `${it.pct}%`, background: it.color }} />
              </span>
              <span className={s.cosmicValue}>{it.desc}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
          우주 1년 환산 시, 당신의 인생은 <strong style={{ color: '#3EFFD0' }}>마지막 {stats.cosmicSeconds.toFixed(3)}초</strong> 동안에 해당합니다. 인류 문명 전체(12,000년)도 우주 시간으로 약 27.5초입니다.
        </p>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 4 — 마일스톤 ═════════════════════════════════════════ */
function MilestoneTab({ birth, now }: { birth: Date; now: Date }) {
  const daysAlive = calcDaysAlive(birth, now)
  const currentAge = calcAge(birth, now)

  const dayItems = DAY_MILESTONES.map(m => {
    const date = dateAfterDays(birth, m.days)
    const daysUntil = m.days - daysAlive
    return { ...m, date, daysUntil, passed: daysUntil < 0 }
  })
  // 다음 1개 강조
  const nextDayMs = dayItems.find(it => !it.passed)

  const ageItems = AGE_MILESTONES.map(m => {
    const date = dateAtAge(birth, m.age)
    const daysUntil = ddayUntil(date, now)
    return { ...m, date, daysUntil, passed: m.age <= currentAge }
  })
  const nextAgeMs = ageItems.find(it => !it.passed)

  const ddayClass = (d: number) => d <= 30 ? s.ddayClose : d <= 365 ? s.ddayMid : s.ddayFar
  const fmtDday = (d: number) => d < 0 ? `D+${Math.abs(d).toLocaleString()}` : `D-${d.toLocaleString()}`

  return (
    <>
      {/* 일수 마일스톤 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          일수 마일스톤
          <span className={s.cardLabelHint}>지금까지 {daysAlive.toLocaleString()}일</span>
        </label>
        <div className={s.milestoneGroup}>
          {dayItems.map((m, i) => (
            <div key={i} className={`${s.milestoneRow} ${m.passed ? s.milestonePassed : ''} ${m === nextDayMs ? s.milestoneNext : ''}`}>
              <span className={s.milestoneIcon}>{m.passed ? '✅' : (m === nextDayMs ? '🎯' : m.emoji)}</span>
              <span className={s.milestoneName}>{m.name}</span>
              <span className={s.milestoneDate}>{fmtDate(m.date)}</span>
              <span className={`${s.milestoneDday} ${m.passed ? s.ddayFar : ddayClass(m.daysUntil)}`}>
                {m.passed ? '지남' : fmtDday(m.daysUntil)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 만 나이 마일스톤 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          만 나이 마일스톤
          <span className={s.cardLabelHint}>법적·사회적·전통 호칭</span>
        </label>
        <div className={s.milestoneGroup}>
          {ageItems.map((m, i) => (
            <div key={i} className={`${s.milestoneRow} ${m.passed ? s.milestonePassed : ''} ${m === nextAgeMs ? s.milestoneNext : ''}`}>
              <span className={s.milestoneIcon}>{m.passed ? '✅' : (m === nextAgeMs ? '🎯' : m.emoji)}</span>
              <span className={s.milestoneName}>{m.name}</span>
              <span className={s.milestoneDate}>{fmtDate(m.date)}</span>
              <span className={`${s.milestoneDday} ${m.passed ? s.ddayFar : ddayClass(m.daysUntil)}`}>
                {m.passed ? '지남' : fmtDday(m.daysUntil)}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
          ⚠️ 법적 기준은 변경될 수 있으니 실제 신청·계약 시 관련 법령을 확인하세요. 일부 제도(병역법·학교 입학 등)는 만 나이가 아닌 별도 기준을 사용합니다.
        </p>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 5 — 문화 정보 ═════════════════════════════════════════ */
function CultureTab({ birth, now }: { birth: Date; now: Date }) {
  const animal    = getZodiacAnimal(birth.getFullYear())
  const western   = getWesternZodiac(birth)
  const gift      = getBirthGift(birth)
  const generation = getGeneration(birth.getFullYear())
  const currentAge = calcAge(birth, now)

  // 60대 이상 시 강조: 현재·향후 5종 호칭 표시
  const traditionalToShow = KOREAN_AGE_NAMES.filter(n => Math.abs(n.age - currentAge) <= 20).slice(0, 6)

  const [span, setSpan] = useState<TimelineSpan>('short')

  return (
    <>
      {/* 띠·별자리·탄생석·세대 */}
      <div className={s.cultureGrid}>
        <div className={s.cultureCard}>
          <div className={s.cultureEmoji}>{animal.emoji}</div>
          <div className={s.cultureName}>{animal.name}띠</div>
          <div className={s.cultureMeta}>{birth.getFullYear()}년생 (양력 기준)</div>
          <div className={s.cultureTraits}>
            {animal.traits.map(t => <span key={t} className={s.cultureTrait}>{t}</span>)}
          </div>
        </div>
        <div className={s.cultureCard}>
          <div className={s.cultureEmoji}>{western.emoji}</div>
          <div className={s.cultureName}>{western.name}</div>
          <div className={s.cultureMeta}>
            {western.startMonth}/{western.startDay}~{western.endMonth}/{western.endDay} · {western.element}
          </div>
        </div>
        <div className={s.cultureCard}>
          <div className={s.cultureEmoji}>💎</div>
          <div className={s.cultureName}>{gift.stone}</div>
          <div className={s.cultureMeta}>{birth.getMonth() + 1}월 탄생석 · {gift.stoneEn}</div>
          <div className={s.cultureTraits}>
            <span className={s.cultureTrait}>{gift.meaning}</span>
          </div>
        </div>
        <div className={s.cultureCard}>
          <div className={s.cultureEmoji}>🌹</div>
          <div className={s.cultureName}>{gift.flower}</div>
          <div className={s.cultureMeta}>{birth.getMonth() + 1}월 탄생화</div>
        </div>
      </div>

      {/* 세대 */}
      {generation && (
        <div className={s.card}>
          <label className={s.cardLabel}>한국 세대 분류</label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--accent)' }}>
              {generation.name}
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'Noto Sans KR, sans-serif' }}>
              {generation.range[0]}~{generation.range[1]}년생 · {generation.desc}
            </span>
          </div>
        </div>
      )}

      {/* 한국 전통 호칭 (현재/주변 나이) */}
      {traditionalToShow.length > 0 && (
        <div className={s.card}>
          <label className={s.cardLabel}>
            한국 전통 나이 호칭
            <span className={s.cardLabelHint}>현재 만 {currentAge}세 주변</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {traditionalToShow.map(n => (
              <div key={n.age} className={s.traditionalCard}
                style={n.age === currentAge ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 3px rgba(200,255,62,0.10)' } : undefined}>
                <div className={s.traditionalHanja}>{n.korean.split('·')[0]}</div>
                <div className={s.traditionalName}>만 {n.age}세 {n.age === currentAge ? '· 현재' : ''}</div>
                <div className={s.traditionalMeaning}>{n.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 인생 타임라인 SVG */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          인생 타임라인
          <span className={s.cardLabelHint}>현재 위치 ◉</span>
        </label>
        <div className={s.timelineOpt}>
          <button className={`${s.timelineBtn} ${span === 'short' ? s.timelineActive : ''}`} onClick={() => setSpan('short')}>0~70세 (짧게)</button>
          <button className={`${s.timelineBtn} ${span === 'long'  ? s.timelineActive : ''}`} onClick={() => setSpan('long')}>0~100세 (길게)</button>
        </div>
        <div className={s.timelineWrap}>
          <LifeTimelineSvg birth={birth} now={now} span={span} />
        </div>
      </div>
    </>
  )
}

/* ─── 인생 타임라인 SVG ─── */
function LifeTimelineSvg({ birth, now, span }: { birth: Date; now: Date; span: TimelineSpan }) {
  const W = 760
  const H = 160
  const padL = 40
  const padR = 40
  const innerW = W - padL - padR
  const lineY = 90
  const maxAge = span === 'short' ? 70 : 100
  const currentAge = calcAge(birth, now)

  // 표시할 마일스톤: 70년 모드 → 핵심 / 100년 모드 → 더 많이
  const milestones = (span === 'short'
    ? AGE_MILESTONES.filter(m => m.age <= 70 && [0, 1, 7, 18, 30, 40, 50, 60, 70].includes(m.age))
    : AGE_MILESTONES.filter(m => [0, 1, 18, 30, 50, 60, 70, 80, 90, 100].includes(m.age))
  )
  // 0세 시작점 추가 (출생)
  const startEvent = { age: 0, name: '출생', emoji: '👶', date: birth }
  const points = [
    startEvent,
    ...milestones.map(m => ({ age: m.age, name: m.name.split(' (')[0], emoji: m.emoji, date: dateAtAge(birth, m.age) })),
  ]

  // 4-tier 라벨 배치 (캄브리아·인류 충돌 회피와 동일 패턴)
  const tierMap = new Map<number, number>()
  const lastUsedX: number[] = [-Infinity, -Infinity, -Infinity, -Infinity]
  const MIN_GAP = 80
  points.forEach(p => {
    const x = padL + (p.age / maxAge) * innerW
    const tier = [0, 1, 2, 3].find(t => x - lastUsedX[t] >= MIN_GAP) ?? 3
    tierMap.set(p.age, tier)
    lastUsedX[tier] = x
  })

  const currentX = padL + (Math.min(currentAge, maxAge) / maxAge) * innerW

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.timelineSvg} aria-hidden="true">
      <defs>
        <linearGradient id="lifeLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3EC8FF" />
          <stop offset="40%"  stopColor="#C8FF3E" />
          <stop offset="70%"  stopColor="#FFD700" />
          <stop offset="100%" stopColor="#9B59B6" />
        </linearGradient>
      </defs>
      {/* 메인 선 */}
      <line x1={padL} y1={lineY} x2={W - padR} y2={lineY} stroke="url(#lifeLineGrad)" strokeWidth="3" />

      {/* 10년 단위 눈금 */}
      {Array.from({ length: maxAge / 10 + 1 }, (_, i) => i * 10).map(age => {
        const x = padL + (age / maxAge) * innerW
        return (
          <g key={age}>
            <line x1={x} y1={lineY - 5} x2={x} y2={lineY + 5} stroke="rgba(255,255,255,0.30)" strokeWidth="1" />
            <text x={x} y={lineY + 22} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="Syne, sans-serif" fontWeight={700}>
              {age}
            </text>
          </g>
        )
      })}

      {/* 현재 위치 강조 */}
      {currentAge <= maxAge && (
        <>
          <circle cx={currentX} cy={lineY} r="9" fill="#3EFFD0" stroke="#0a0a2e" strokeWidth="2" />
          <circle cx={currentX} cy={lineY} r="14" fill="none" stroke="#3EFFD0" strokeWidth="1.5" opacity="0.5">
            <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={currentX} y={lineY - 28} textAnchor="middle" fontSize="11" fill="#3EFFD0" fontFamily="Syne, sans-serif" fontWeight={800}>
            현재 만 {currentAge}세
          </text>
        </>
      )}

      {/* 마일스톤 노드 */}
      {points.map(p => {
        const x = padL + (p.age / maxAge) * innerW
        const passed = p.age <= currentAge
        const tier = tierMap.get(p.age) ?? 0
        const above = tier === 0 || tier === 2
        const far   = tier === 2 || tier === 3
        const labelOff = far ? 50 : 36
        const labelY = above ? lineY - labelOff : lineY + (labelOff + 12)
        const color = passed ? '#C8FF3E' : 'rgba(255,255,255,0.6)'
        return (
          <g key={p.age}>
            <circle cx={x} cy={lineY} r="5" fill={passed ? '#C8FF3E' : 'rgba(255,255,255,0.20)'} stroke="#0a0a2e" strokeWidth="1.2" />
            <text x={x} y={labelY} textAnchor="middle" fontSize="11" fill={color}
              fontFamily="Noto Sans KR, sans-serif" fontWeight={700} className={s.timelineLabel}>
              {p.emoji} {p.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
