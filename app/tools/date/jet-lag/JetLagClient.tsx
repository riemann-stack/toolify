'use client'

import { useMemo, useState } from 'react'
import s from './jet-lag.module.css'

type City = { name: string; tz: string; offset: number }

const CITIES: City[] = [
  { name: '서울', tz: 'Asia/Seoul', offset: 9 },
  { name: '도쿄', tz: 'Asia/Tokyo', offset: 9 },
  { name: '베이징', tz: 'Asia/Shanghai', offset: 8 },
  { name: '홍콩', tz: 'Asia/Hong_Kong', offset: 8 },
  { name: '타이베이', tz: 'Asia/Taipei', offset: 8 },
  { name: '싱가포르', tz: 'Asia/Singapore', offset: 8 },
  { name: '쿠알라룸푸르', tz: 'Asia/Kuala_Lumpur', offset: 8 },
  { name: '마닐라', tz: 'Asia/Manila', offset: 8 },
  { name: '방콕', tz: 'Asia/Bangkok', offset: 7 },
  { name: '자카르타', tz: 'Asia/Jakarta', offset: 7 },
  { name: '호치민', tz: 'Asia/Ho_Chi_Minh', offset: 7 },
  { name: '하노이', tz: 'Asia/Ho_Chi_Minh', offset: 7 },
  { name: '델리', tz: 'Asia/Kolkata', offset: 5.5 },
  { name: '뭄바이', tz: 'Asia/Kolkata', offset: 5.5 },
  { name: '두바이', tz: 'Asia/Dubai', offset: 4 },
  { name: '도하', tz: 'Asia/Qatar', offset: 3 },
  { name: '이스탄불', tz: 'Europe/Istanbul', offset: 3 },
  { name: '모스크바', tz: 'Europe/Moscow', offset: 3 },
  { name: '아테네', tz: 'Europe/Athens', offset: 2 },
  { name: '카이로', tz: 'Africa/Cairo', offset: 2 },
  { name: '요하네스버그', tz: 'Africa/Johannesburg', offset: 2 },
  { name: '로마', tz: 'Europe/Rome', offset: 1 },
  { name: '파리', tz: 'Europe/Paris', offset: 1 },
  { name: '베를린', tz: 'Europe/Berlin', offset: 1 },
  { name: '암스테르담', tz: 'Europe/Amsterdam', offset: 1 },
  { name: '마드리드', tz: 'Europe/Madrid', offset: 1 },
  { name: '취리히', tz: 'Europe/Zurich', offset: 1 },
  { name: '빈', tz: 'Europe/Vienna', offset: 1 },
  { name: '프라하', tz: 'Europe/Prague', offset: 1 },
  { name: '런던', tz: 'Europe/London', offset: 0 },
  { name: '더블린', tz: 'Europe/Dublin', offset: 0 },
  { name: '리스본', tz: 'Europe/Lisbon', offset: 0 },
  { name: '레이캬비크', tz: 'Atlantic/Reykjavik', offset: 0 },
  { name: '상파울루', tz: 'America/Sao_Paulo', offset: -3 },
  { name: '부에노스아이레스', tz: 'America/Argentina/Buenos_Aires', offset: -3 },
  { name: '산티아고', tz: 'America/Santiago', offset: -4 },
  { name: '뉴욕', tz: 'America/New_York', offset: -5 },
  { name: '토론토', tz: 'America/Toronto', offset: -5 },
  { name: '워싱턴', tz: 'America/New_York', offset: -5 },
  { name: '마이애미', tz: 'America/New_York', offset: -5 },
  { name: '시카고', tz: 'America/Chicago', offset: -6 },
  { name: '멕시코시티', tz: 'America/Mexico_City', offset: -6 },
  { name: '덴버', tz: 'America/Denver', offset: -7 },
  { name: '밴쿠버', tz: 'America/Vancouver', offset: -8 },
  { name: 'LA', tz: 'America/Los_Angeles', offset: -8 },
  { name: '샌프란시스코', tz: 'America/Los_Angeles', offset: -8 },
  { name: '시애틀', tz: 'America/Los_Angeles', offset: -8 },
  { name: '호놀룰루', tz: 'Pacific/Honolulu', offset: -10 },
  { name: '오클랜드', tz: 'Pacific/Auckland', offset: 12 },
  { name: '시드니', tz: 'Australia/Sydney', offset: 10 },
  { name: '멜버른', tz: 'Australia/Melbourne', offset: 10 },
]

/** 현재 실시간 UTC 오프셋(시간, DST 반영)을 해당 tz 로부터 계산 */
function getLiveOffset(tz: string): number {
  try {
    const now = new Date()
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
    const parts = fmt.formatToParts(now)
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0')
    const asUTC = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
    return Math.round(((asUTC - now.getTime()) / 3600000) * 2) / 2
  } catch {
    return 0
  }
}

const HHMM = (h: number, m = 0) => `${String(((h % 24) + 24) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`

const BEDTIME_CHOICES = ['21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00', '01:30', '02:00']
const WAKETIME_CHOICES = ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00']

function parseHHMM(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}
function formatHours(h: number): string {
  h = ((h % 24) + 24) % 24
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return HHMM(hh, mm)
}

type Tab = 'pre' | 'flight' | 'post'

export default function JetLagClient() {
  const [tab, setTab] = useState<Tab>('pre')
  const [fromIdx, setFromIdx] = useState(0) // 서울
  const [toIdx, setToIdx] = useState(36) // 뉴욕 index
  const [bedtime, setBedtime] = useState('23:00')
  const [waketime, setWaketime] = useState('07:00')
  const [stayDays, setStayDays] = useState(7)

  // 비행 정보 (공통 입력으로 통합)
  const [departTime, setDepartTime] = useState('10:00')   // 출발지 기준 이륙 시각
  const [flightHours, setFlightHours] = useState(14)

  const from = CITIES[fromIdx]
  const to = CITIES[toIdx]
  const timeDiff = useMemo(() => {
    const fo = getLiveOffset(from.tz)
    const tO = getLiveOffset(to.tz)
    return Math.round((tO - fo) * 2) / 2
  }, [fromIdx, toIdx, from.tz, to.tz])

  const absDiff = Math.abs(timeDiff)
  const direction: 'east' | 'west' | 'none' = timeDiff > 0 ? 'east' : timeDiff < 0 ? 'west' : 'none'

  const adaptDays = useMemo(() => {
    if (absDiff === 0) return 0
    return direction === 'east' ? Math.ceil(absDiff * 1.5) : Math.ceil(absDiff)
  }, [absDiff, direction])

  // 도착 시각 자동 계산 (현지 기준)
  // 도착 현지 시각 = 출발지 이륙 시각 + 비행 시간 + 시차
  const arrivalLocalH = useMemo(() => {
    const dep = parseHHMM(departTime)
    return ((dep + flightHours + timeDiff) % 24 + 24) % 24
  }, [departTime, flightHours, timeDiff])

  return (
    <div className={s.wrap}>
      {/* ─── 공통 입력 (컴팩트) ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>여행 기본 정보</span>

        {/* 출발지·도착지 */}
        <div className={s.row2}>
          <div>
            <label className={s.fieldLabel}>출발 도시</label>
            <div className={s.selectWrap}>
              <select className={s.select} value={fromIdx} onChange={(e) => setFromIdx(Number(e.target.value))}>
                {CITIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
              </select>
              <span className={s.selectArrow}>▼</span>
            </div>
          </div>
          <div>
            <label className={s.fieldLabel}>도착 도시</label>
            <div className={s.selectWrap}>
              <select className={s.select} value={toIdx} onChange={(e) => setToIdx(Number(e.target.value))}>
                {CITIES.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
              </select>
              <span className={s.selectArrow}>▼</span>
            </div>
          </div>
        </div>

        {/* 이륙 시각 + 비행 시간 + 체류 일수 */}
        <div className={s.row3} style={{ marginTop: 10 }}>
          <div>
            <label className={s.fieldLabel}>이륙 시각 (출발지)</label>
            <input className={s.input} type="time" value={departTime} onChange={(e) => setDepartTime(e.target.value)} />
          </div>
          <div>
            <label className={s.fieldLabel}>비행 시간 (h)</label>
            <input
              className={s.input}
              type="number"
              min={1} max={20} step={0.5}
              value={flightHours}
              onChange={(e) => setFlightHours(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            />
          </div>
          <div>
            <label className={s.fieldLabel}>체류 일수</label>
            <input
              className={s.input}
              type="number"
              min={1} max={90}
              value={stayDays}
              onChange={(e) => setStayDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
            />
          </div>
        </div>

        {/* 평소 취침·기상 */}
        <div className={s.row2} style={{ marginTop: 10 }}>
          <div>
            <label className={s.fieldLabel}>평소 취침</label>
            <div className={s.selectWrap}>
              <select className={s.select} value={bedtime} onChange={(e) => setBedtime(e.target.value)}>
                {BEDTIME_CHOICES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className={s.selectArrow}>▼</span>
            </div>
          </div>
          <div>
            <label className={s.fieldLabel}>평소 기상</label>
            <div className={s.selectWrap}>
              <select className={s.select} value={waketime} onChange={(e) => setWaketime(e.target.value)}>
                {WAKETIME_CHOICES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <span className={s.selectArrow}>▼</span>
            </div>
          </div>
        </div>

        <p className={s.hintText}>
          🛬 도착 현지 시각 자동 계산 — <strong>{formatHours(arrivalLocalH)}</strong>
        </p>
      </div>

      {/* ─── 시차 히어로 ─── */}
      <div className={`${s.hero} ${direction === 'east' ? s.heroEast : direction === 'west' ? s.heroWest : s.heroNone}`}>
        <p className={s.heroLead}>
          {from.name} → {to.name}
        </p>
        <div className={s.heroValue}>
          {absDiff}<span className={s.heroUnit}>시간</span>
        </div>
        <div className={`${s.heroDir} ${direction === 'east' ? s.dirEast : direction === 'west' ? s.dirWest : s.dirNone}`}>
          {direction === 'east' ? '→ 시간대 동쪽 (시계 앞당김 · 어려움)' : direction === 'west' ? '← 시간대 서쪽 (시계 늦춤 · 쉬움)' : '시차 없음'}
        </div>
        <p className={s.heroDesc}>
          {absDiff === 0
            ? <>시차가 없어 <strong>별도 적응 기간이 필요하지 않습니다.</strong></>
            : stayDays <= 3
              ? <>체류 {stayDays}일 — 완전 적응보다 <strong>한국 시간 유지 전략</strong>을 추천합니다.</>
              : <>완전 적응까지 <strong>약 {adaptDays}일</strong> 예상</>
          }
        </p>

        {/* 방향 설명 (펼쳐보기) */}
        {direction !== 'none' && (
          <details className={s.dirDetails}>
            <summary>「시간대 {direction === 'east' ? '동쪽' : '서쪽'}」이 무엇인가요?</summary>
            <div className={s.dirDetailsBody}>
              시차 적응에서 말하는 「동쪽/서쪽」은 <strong>비행 경로</strong>가 아니라 <strong>도착지의 시간대(UTC 오프셋)</strong> 기준입니다.<br/>
              · 도착지 UTC 오프셋이 <strong>커지면(시간이 앞으로 가면) 동쪽</strong> — 생체시계를 「앞당겨야」 해 어려움<br/>
              · 도착지 UTC 오프셋이 <strong>작아지면(시간이 뒤로 가면) 서쪽</strong> — 생체시계를 「늦춰도」 되어 상대적으로 쉬움<br/>
              <br/>
              예) 서울(UTC+9) → 뉴욕(UTC-5)은 비행기는 동쪽으로 날아가지만, 도착지 시간이 14시간 뒤로 가므로 <strong>「시간대 서쪽」</strong>으로 분류됩니다. 인간 생체시계는 24.2h로 자연스럽게 늘어지므로 시계를 늦추는 쪽이 적응이 더 쉽습니다.
            </div>
          </details>
        )}
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'pre' ? s.tabActive : ''}`} onClick={() => setTab('pre')}>여행 전</button>
        <button className={`${s.tabBtn} ${tab === 'flight' ? s.tabActive : ''}`} onClick={() => setTab('flight')}>비행 중</button>
        <button className={`${s.tabBtn} ${tab === 'post' ? s.tabActive : ''}`} onClick={() => setTab('post')}>도착 후</button>
      </div>

      {tab === 'pre' && (
        <PreTab timeDiff={timeDiff} direction={direction} bedtime={bedtime} waketime={waketime} absDiff={absDiff} fromName={from.name} toName={to.name} />
      )}
      {tab === 'flight' && (
        <FlightTab
          flightHours={flightHours}
          timeDiff={timeDiff}
          departTime={departTime}
          bedtime={bedtime}
          fromName={from.name}
          toName={to.name}
        />
      )}
      {tab === 'post' && (
        <PostTab
          arrivalLocalH={arrivalLocalH}
          flightHours={flightHours}
          direction={direction}
          adaptDays={adaptDays}
          stayDays={stayDays}
          absDiff={absDiff}
          bedtime={bedtime}
          waketime={waketime}
        />
      )}

      <p className={s.disclaimer}>
        본 계산기는 일반적인 가이드라인이며 개인차가 있습니다. 장기간 수면 장애나 시차 부적응 시 전문의 상담을 권장합니다.
      </p>
    </div>
  )
}

/* ──────────────────────── 탭 1: 여행 전 ──────────────────────── */
function PreTab({ timeDiff, direction, bedtime, waketime, absDiff, fromName, toName }: {
  timeDiff: number
  direction: 'east' | 'west' | 'none'
  bedtime: string
  waketime: string
  absDiff: number
  fromName: string
  toName: string
}) {
  const adjustPerDay = absDiff === 0 ? 0 : Math.min(2, Math.ceil(absDiff / 5))
  const adjustDays = adjustPerDay === 0 ? 0 : Math.min(5, Math.ceil(absDiff / adjustPerDay))
  // 동쪽 → 앞당기기(마이너스), 서쪽 → 늦추기(플러스)
  const sign = direction === 'east' ? -1 : direction === 'west' ? 1 : 0

  const bedH = parseHHMM(bedtime)
  const wakeH = parseHHMM(waketime)

  const schedule = Array.from({ length: adjustDays + 1 }, (_, i) => {
    const daysOut = adjustDays - i
    const shiftH = Math.min(i * adjustPerDay, absDiff) * sign
    const label = daysOut === 0 ? '출발일' : `D-${daysOut}`
    return {
      label,
      bed: formatHours(bedH + shiftH),
      wake: formatHours(wakeH + shiftH),
      shift: shiftH,
      isTarget: daysOut === 0,
    }
  })

  return (
    <>
      {absDiff === 0 ? (
        <div className={s.empty}>시차가 없어 수면 조정이 필요하지 않습니다.</div>
      ) : (
        <div className={s.card}>
          <div className={s.cardTitle}>🛌 출국 전 수면 조정 스케줄</div>
          <p className={s.sub} style={{ marginTop: 0, marginBottom: 12 }}>
            {direction === 'east' ? '매일 ' + adjustPerDay + '시간씩 앞당기기' : '매일 ' + adjustPerDay + '시간씩 늦추기'} ({adjustDays}일 전부터 시작)
          </p>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>권장 취침</th>
                  <th>권장 기상</th>
                  <th>조정량</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={i} className={row.isTarget ? s.tableRowTarget : ''}>
                    <td>{row.label}</td>
                    <td>{row.bed}</td>
                    <td>{row.wake}</td>
                    <td>
                      <span className={row.shift < 0 ? s.adjEarlier : row.shift > 0 ? s.adjLater : s.adjZero}>
                        {row.shift === 0 ? '기준' : `${row.shift > 0 ? '+' : ''}${row.shift}시간`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={s.infoCard}>
        <div className={s.infoHead}>💊 멜라토닌 복용 타이밍</div>
        <ul>
          {direction === 'east' && <li>동쪽 이동: 도착지 기준 저녁 21~22시에 복용 권장</li>}
          {direction === 'west' && <li>서쪽 이동: 출발 며칠 전부터 도착지 취침 시간에 맞춰 복용</li>}
          {direction === 'none' && <li>시차가 없어 별도 복용이 필요하지 않습니다.</li>}
          <li>0.5~1mg 소량이 효과적 (고용량보다 저용량 권장)</li>
          <li>잠들기 30~60분 전 복용</li>
        </ul>
        <div className={s.warnCard} style={{ marginTop: 10 }}>
          ⚠️ 멜라토닌은 의약품·건강기능식품으로 분류가 다르며 임산부·청소년 등은 주의가 필요합니다. 복용 전 의사 또는 약사와 상담을 권장합니다.
        </div>
      </div>

      {absDiff > 0 && (
        <DrowsyWindow fromName={fromName} toName={toName} timeDiff={timeDiff} bedH={bedH} wakeH={wakeH} />
      )}
    </>
  )
}

/** 첫 2~3일 도착 후 졸음/각성 구간 시각화 */
function DrowsyWindow({ fromName, toName, timeDiff, bedH, wakeH }: { fromName: string; toName: string; timeDiff: number; bedH: number; wakeH: number }) {
  const drowsyStart = ((bedH + timeDiff) % 24 + 24) % 24
  const drowsyEnd = ((wakeH + timeDiff) % 24 + 24) % 24
  const insomniaStart = drowsyEnd
  const insomniaEnd = drowsyStart

  const segs = buildSegments([
    { start: drowsyStart, end: drowsyEnd, cls: s.segWarn, label: '졸음 강함' },
    { start: insomniaStart, end: insomniaEnd, cls: s.segLight, label: '잠 안 옴' },
  ])

  return (
    <div className={s.card}>
      <div className={s.cardTitle}>⏰ 첫 2~3일 주의 시간대 ({toName} 현지 기준)</div>
      <p className={s.sub} style={{ marginTop: 0, marginBottom: 12 }}>
        {fromName} 기준 취침·기상 시각을 현지 시각으로 옮긴 구간입니다.
      </p>
      <Timeline segments={segs} />
      <div className={s.legendRow}>
        <div className={s.legendItem}><span className={s.legendSwatch} style={{ background: 'rgba(255,140,62,0.55)' }} />졸음 강함 (현지 {formatHours(drowsyStart)}~{formatHours(drowsyEnd)})</div>
        <div className={s.legendItem}><span className={s.legendSwatch} style={{ background: 'rgba(255,213,62,0.45)' }} />잠 안 옴 (현지 {formatHours(insomniaStart)}~{formatHours(insomniaEnd)})</div>
      </div>
    </div>
  )
}

/* ──────────────────────── 탭 2: 비행 중 ──────────────────────── */
function FlightTab({ flightHours, timeDiff, departTime, bedtime, fromName, toName }: {
  flightHours: number
  timeDiff: number
  departTime: string
  bedtime: string
  fromName: string
  toName: string
}) {
  const departH = parseHHMM(departTime)

  // 이륙 시점의 도착지 현지 시각
  const takeoffLocalH = ((departH + timeDiff) % 24 + 24) % 24

  // 기내 수면 권장 — 도착지 현지 22:00 ~ 06:00 구간
  // 비행 축에서 어디 걸치는지 계산
  const NIGHT_START = 22
  const NIGHT_END = 6  // (다음날 새벽)

  // 비행 중 도착지 시각 t시간 후 = (takeoffLocalH + t) mod 24
  // 수면 권장 구간(들) 찾기
  const sleepWindows: { start: number; end: number }[] = []
  for (let t = 0; t <= flightHours; t += 0.25) {
    const localH = (takeoffLocalH + t) % 24
    const inNight = localH >= NIGHT_START || localH < NIGHT_END
    if (inNight) {
      const last = sleepWindows[sleepWindows.length - 1]
      if (last && Math.abs(last.end - t) < 0.3) {
        last.end = t + 0.25
      } else {
        sleepWindows.push({ start: t, end: t + 0.25 })
      }
    }
  }

  // 비행 중 가장 큰 수면 구간 (사용자에게 권장)
  const biggestSleep = sleepWindows.reduce<{ start: number; end: number } | null>((max, cur) => {
    if (!max || (cur.end - cur.start) > (max.end - max.start)) return cur
    return max
  }, null)

  // 카페인 컷오프 — 평소 취침 시각 - 8시간 (보통 반감기)
  const bedH = parseHHMM(bedtime)
  const cutoffH = ((bedH - 8) + 24) % 24

  // 도착 현지 시각
  const arrivalLocalH = ((takeoffLocalH + flightHours) % 24 + 24) % 24

  return (
    <>
      <div className={s.card}>
        <div className={s.cardTitle}>🛫 기내 수면 권장 구간</div>
        <p className={s.sub} style={{ marginTop: 0, marginBottom: 12 }}>
          {fromName} 이륙 ({departTime}) → {toName} 도착({formatHours(arrivalLocalH)}). 시차 {timeDiff >= 0 ? '+' : ''}{timeDiff}시간 자동 반영.
        </p>

        <FlightTimelineV2
          flightHours={flightHours}
          takeoffLocalH={takeoffLocalH}
          sleepWindows={sleepWindows}
        />

        {biggestSleep ? (
          <div className={s.flightResult} style={{ marginTop: 14 }}>
            <div className={s.flightBox}>
              <div className={s.flightBoxLabel}>권장 수면 시작</div>
              <div className={s.flightBoxValue}>이륙 +{biggestSleep.start.toFixed(1)}h</div>
              <div className={s.flightBoxSub}>현지 {formatHours((takeoffLocalH + biggestSleep.start) % 24)}</div>
            </div>
            <div className={s.flightBox}>
              <div className={s.flightBoxLabel}>권장 수면 종료</div>
              <div className={s.flightBoxValue}>이륙 +{biggestSleep.end.toFixed(1)}h</div>
              <div className={s.flightBoxSub}>현지 {formatHours((takeoffLocalH + biggestSleep.end) % 24)}</div>
            </div>
            <div className={s.flightBox}>
              <div className={s.flightBoxLabel}>총 수면 가능</div>
              <div className={s.flightBoxValue} style={{ color: '#3EC8FF' }}>{(biggestSleep.end - biggestSleep.start).toFixed(1)}시간</div>
            </div>
          </div>
        ) : (
          <div className={s.warnCard} style={{ marginTop: 12 }}>
            비행 시간 내 도착지 밤 시간대가 없습니다. 가벼운 휴식·다리 스트레칭·수분 보충 위주로 보내세요.
          </div>
        )}
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>☕ 카페인 마지막 허용 시각 (자동)</div>
        <p className={s.sub} style={{ marginTop: 0, marginBottom: 10 }}>
          평소 취침 시각({bedtime}) − 카페인 반감기 8시간으로 자동 계산.
        </p>
        <div className={s.flightResult}>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>마지막 허용 시각</div>
            <div className={s.flightBoxValue} style={{ color: 'var(--accent)' }}>{formatHours(cutoffH)}</div>
            <div className={s.flightBoxSub}>이후 카페인 섭취 X</div>
          </div>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>목표 취침</div>
            <div className={s.flightBoxValue}>{bedtime}</div>
            <div className={s.flightBoxSub}>도착지 기준</div>
          </div>
        </div>
        <p className={s.sub} style={{ marginTop: 10 }}>
          💡 민감하다면 −1시간(보수적), 둔감하다면 +1시간으로 조정. 임신·고혈압 등 상황별 의사 안내를 우선하세요.
        </p>
      </div>
    </>
  )
}

/** 비행 타임라인 v2 — 시간 라벨이 겹치지 않도록 개선 */
function FlightTimelineV2({ flightHours, takeoffLocalH, sleepWindows }: {
  flightHours: number
  takeoffLocalH: number
  sleepWindows: { start: number; end: number }[]
}) {
  return (
    <div>
      <div className={s.timeline}>
        {/* 비행 중 깨어있기(기본 색) */}
        <div className={s.timelineSeg} style={{ left: '0%', width: '100%', background: 'rgba(200,255,62,0.18)' }} />
        {/* 수면 권장 구간 */}
        {sleepWindows.map((w, i) => {
          const left = (w.start / flightHours) * 100
          const width = ((w.end - w.start) / flightHours) * 100
          return (
            <div key={i} className={`${s.timelineSeg} ${s.segSleep}`} style={{ left: `${left}%`, width: `${width}%` }} />
          )
        })}
      </div>
      <div className={s.timelineLabels}>
        <span>이륙<br/><small>{formatHours(takeoffLocalH)}</small></span>
        <span>{Math.round(flightHours / 2)}h</span>
        <span>도착<br/><small>{formatHours((takeoffLocalH + flightHours) % 24)}</small></span>
      </div>
      <div className={s.legendRow}>
        <div className={s.legendItem}><span className={s.legendSwatch} style={{ background: 'rgba(62,200,255,0.6)' }} />수면 권장 (현지 22~06시)</div>
        <div className={s.legendItem}><span className={s.legendSwatch} style={{ background: 'rgba(200,255,62,0.45)' }} />깨어있기</div>
      </div>
    </div>
  )
}

type Seg = { start: number; end: number; cls: string; label: string }

/** 24시간 축 타임라인 */
function Timeline({ segments, nowHour }: { segments: Seg[]; nowHour?: number }) {
  return (
    <>
      <div className={s.timeline}>
        {segments.map((seg, i) => {
          const pieces: { l: number; w: number }[] = []
          if (seg.end >= seg.start) {
            pieces.push({ l: (seg.start / 24) * 100, w: ((seg.end - seg.start) / 24) * 100 })
          } else {
            pieces.push({ l: (seg.start / 24) * 100, w: ((24 - seg.start) / 24) * 100 })
            pieces.push({ l: 0, w: (seg.end / 24) * 100 })
          }
          return pieces.map((p, j) => (
            <div key={`${i}-${j}`} className={`${s.timelineSeg} ${seg.cls}`} style={{ left: `${p.l}%`, width: `${p.w}%` }}>
              {j === 0 ? seg.label : ''}
            </div>
          ))
        })}
        {nowHour !== undefined && (
          <div className={s.nowCursor} style={{ left: `${(nowHour / 24) * 100}%` }} />
        )}
      </div>
      <div className={s.timelineLabels}>
        <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
      </div>
    </>
  )
}

function buildSegments(segs: Seg[]): Seg[] {
  return segs
}

/* ──────────────────────── 탭 3: 도착 후 ──────────────────────── */
function PostTab({ arrivalLocalH, flightHours, direction, adaptDays, stayDays, absDiff, bedtime, waketime }: {
  arrivalLocalH: number
  flightHours: number
  direction: 'east' | 'west' | 'none'
  adaptDays: number
  stayDays: number
  absDiff: number
  bedtime: string
  waketime: string
}) {
  const targetBed = parseHHMM(bedtime)
  const hoursToEndure = ((targetBed - arrivalLocalH) + 24) % 24

  // 비행 길이 기반 추정 수면 (대략 비행시간의 1/3, 최대 6시간)
  const estimatedFlightSleep = Math.min(6, Math.round(flightHours * 0.33 * 2) / 2)

  const fatigue: 'low' | 'mid' | 'high' | 'veryHigh' =
    hoursToEndure <= 3 && estimatedFlightSleep >= 4 ? 'low' :
    hoursToEndure <= 5 && estimatedFlightSleep >= 3 ? 'mid' :
    hoursToEndure <= 8 && estimatedFlightSleep >= 2 ? 'high' : 'veryHigh'

  // 낮잠 판정 — 도착 직후 가정
  const napH = arrivalLocalH
  const napDecision: { status: 'ok' | 'warn' | 'no'; max: number; note: string } =
    napH < 15 ? { status: 'ok', max: 30, note: '짧은 낮잠은 회복에 도움이 됩니다. 알람 설정 필수!' }
    : napH < 17 ? { status: 'warn', max: 15, note: '15분 이내로만 짧게. 더 길게 자면 밤잠이 방해받아요.' }
    : { status: 'no', max: 0, note: '지금 낮잠은 밤잠을 망칩니다. 조금만 더 버티세요.' }

  // 햇빛 노출
  const sun = direction === 'east'
    ? { recommend: '현지 06~10시', avoid: '오후 4시 이후 강한 빛', segs: [
        { start: 6, end: 10, cls: s.segLight, label: '햇빛 권장' },
        { start: 16, end: 20, cls: s.segSleep, label: '빛 회피' },
      ] }
    : direction === 'west'
    ? { recommend: '현지 15~19시', avoid: '이른 아침 강한 빛', segs: [
        { start: 15, end: 19, cls: s.segLight, label: '햇빛 권장' },
        { start: 5, end: 8, cls: s.segSleep, label: '빛 회피' },
      ] }
    : { recommend: '평소와 동일', avoid: '없음', segs: [] }

  // 적응 진행도
  const pct50 = Math.ceil(adaptDays * 0.5)
  const pct80 = Math.ceil(adaptDays * 0.8)
  const stayPosition = adaptDays > 0 ? Math.min(100, (stayDays / adaptDays) * 100) : 100

  // 7일 스케줄 — 시차 크기에 따른 동적 생성
  const weekSchedule = buildWeekSchedule(direction, absDiff, bedtime, waketime)
  const scheduleHeader = absDiff === 0
    ? '시차 없음 — 평소 패턴 유지'
    : absDiff <= 3 ? `시차 ${absDiff}시간 (가벼움) — 1~3일 적응 예상`
    : absDiff <= 6 ? `시차 ${absDiff}시간 (보통) — 4~6일 적응 예상`
    : absDiff <= 9 ? `시차 ${absDiff}시간 (큼) — 7~9일 적응 예상`
    : `시차 ${absDiff}시간 (매우 큼) — 10~14일 적응 예상`

  return (
    <>
      {/* 첫날 전략 — 입력 없이 자동 계산 */}
      <div className={s.card}>
        <div className={s.cardTitle}>🛬 도착 첫날 전략</div>
        <p className={s.sub} style={{ marginTop: 0, marginBottom: 12 }}>
          위 입력값으로 자동 계산. 도착 현지 <strong>{formatHours(arrivalLocalH)}</strong> 기준.
        </p>
        <div className={s.flightResult}>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>목표 취침</div>
            <div className={s.flightBoxValue} style={{ color: 'var(--accent)' }}>{bedtime}</div>
            <div className={s.flightBoxSub}>현지 시각</div>
          </div>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>남은 버팀 시간</div>
            <div className={s.flightBoxValue}>{Math.floor(hoursToEndure)}시간 {Math.round((hoursToEndure % 1) * 60)}분</div>
          </div>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>피로도 추정</div>
            <div className={s.flightBoxValue} style={{
              color: fatigue === 'low' ? '#3EFF9B' : fatigue === 'mid' ? '#FFD93E' : fatigue === 'high' ? '#FF8C3E' : '#FF6B6B',
            }}>
              {fatigue === 'low' ? '낮음' : fatigue === 'mid' ? '보통' : fatigue === 'high' ? '높음' : '매우 높음'}
            </div>
            <div className={s.flightBoxSub}>기내 수면 ≈{estimatedFlightSleep}h 가정</div>
          </div>
        </div>
        <p className={s.sub} style={{ marginTop: 10 }}>오늘은 <strong style={{ color: 'var(--accent)' }}>현지 {bedtime}</strong>까지 버텨서 취침하는 것을 목표로 하세요.</p>
      </div>

      {/* 낮잠 판정 — 입력 없이 도착 시각 기준 */}
      <div className={`${s.napCard} ${napDecision.status === 'ok' ? s.napOk : napDecision.status === 'warn' ? s.napWarn : s.napNo}`}>
        <div className={s.cardTitle}>😴 낮잠 판정 (도착 직후 기준)</div>
        <p className={s.sub} style={{ marginTop: 0, marginBottom: 10 }}>
          현지 {formatHours(arrivalLocalH)} 도착 직후 낮잠 권장 여부.
        </p>
        <div className={s.napStatus}>
          {napDecision.status === 'ok' ? '✅ 낮잠 OK' : napDecision.status === 'warn' ? '⚠️ 주의 — 15분 이내' : '❌ 낮잠 금지'}
        </div>
        <div className={s.napBig}>{napDecision.max > 0 ? `${napDecision.max}분 이내` : '0분'}</div>
        <div className={s.napNote}>{napDecision.note}</div>
      </div>

      {/* 햇빛 */}
      <div className={s.card}>
        <div className={s.cardTitle}>☀️ 햇빛 노출 타이밍</div>
        <p className={s.sub} style={{ marginTop: 0, marginBottom: 12 }}>
          {direction === 'east'
            ? '아침 햇빛이 생체시계를 앞당겨 동쪽 적응을 돕습니다.'
            : direction === 'west'
            ? '저녁 햇빛이 생체시계를 늦춰 서쪽 적응을 돕습니다.'
            : '시차가 없어 평소 생활 패턴을 유지하세요.'}
        </p>
        {sun.segs.length > 0 ? <Timeline segments={sun.segs} /> : <div className={s.empty}>조정 불필요</div>}
        <div className={s.flightResult}>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>권장 시간</div>
            <div className={s.flightBoxValue} style={{ fontSize: 14 }}>{sun.recommend}</div>
          </div>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>피해야 할 시간</div>
            <div className={s.flightBoxValue} style={{ fontSize: 14, color: '#FF8C3E' }}>{sun.avoid}</div>
          </div>
        </div>
      </div>

      {/* 적응 타임라인 — 글자 겹침 방지 */}
      <div className={s.adaptCard}>
        <div className={s.cardTitle}>📈 시차 적응 타임라인</div>
        {adaptDays === 0 ? (
          <div className={s.empty}>시차가 없어 적응이 필요하지 않습니다.</div>
        ) : (
          <>
            {/* 진행바 자체 — 마커는 점만, 라벨은 별도 행으로 분리 */}
            <div className={s.progressBarBox}>
              <div className={s.progressBarTrack}>
                <div className={s.progressBarFill} />
                <div className={s.progressMarkDot} style={{ left: '50%' }} />
                <div className={s.progressMarkDot} style={{ left: '80%' }} />
                {stayDays < adaptDays && stayPosition < 100 && (
                  <div className={s.progressMarkReturn} style={{ left: `${stayPosition}%` }} />
                )}
              </div>
            </div>
            {/* 라벨 행 — 진행바 아래 */}
            <div className={s.progressLabels}>
              <span className={s.progressLabelLeft}>도착 1일차</span>
              <span className={s.progressLabelRight}>완전 적응 {adaptDays}일</span>
            </div>

            {/* 핵심 수치 카드 3개 + 귀국 정보 별도 */}
            <div className={s.adaptStats}>
              <div className={s.adaptStat}><div className={s.adaptStatLabel}>50% 적응</div><div className={s.adaptStatValue}>{pct50}일 후</div></div>
              <div className={s.adaptStat}><div className={s.adaptStatLabel}>80% 적응</div><div className={s.adaptStatValue}>{pct80}일 후</div></div>
              <div className={s.adaptStat}><div className={s.adaptStatLabel}>완전 적응</div><div className={s.adaptStatValue}>{adaptDays}일 후</div></div>
            </div>
            {stayDays < adaptDays && (
              <div className={s.warnCard} style={{ marginTop: 12 }}>
                체류 기간({stayDays}일)이 완전 적응 기간({adaptDays}일)보다 짧습니다. 완전 적응보다 <strong>현지 리듬 유지 전략</strong>을 추천합니다.
              </div>
            )}
          </>
        )}
      </div>

      {/* 7일 스케줄 — 헤더 명확화 */}
      {adaptDays > 0 && (
        <div className={s.card}>
          <div className={s.cardTitle}>📅 7일 적응 스케줄</div>
          <p className={s.sub} style={{ marginTop: 0, marginBottom: 12 }}>
            <strong style={{ color: 'var(--accent)' }}>{scheduleHeader}</strong> · {direction === 'east' ? '동쪽 (어려움)' : direction === 'west' ? '서쪽 (상대적 쉬움)' : '시차 없음'} · 평소 취침 {bedtime} 기준
          </p>
          <div className={s.tableWrap}>
            <table className={s.scheduleTable}>
              <thead>
                <tr>
                  <th>일차</th>
                  <th>예상 상태</th>
                  <th>권장 취침</th>
                  <th>권장 기상</th>
                  <th>핵심 팁</th>
                </tr>
              </thead>
              <tbody>
                {weekSchedule.map((row, i) => (
                  <tr key={i}>
                    <td><span className={s.scheduleDay}>{row.day}</span></td>
                    <td>{row.state}</td>
                    <td>{row.bed}</td>
                    <td>{row.wake}</td>
                    <td>{row.tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

function buildWeekSchedule(direction: 'east' | 'west' | 'none', absDiff: number, bedtime: string, waketime: string) {
  if (direction === 'none' || absDiff === 0) return []

  const bedH = parseHHMM(bedtime)
  const wakeH = parseHHMM(waketime)
  const sign = direction === 'east' ? -1 : 1

  // 시차에 따른 일차별 진행 (절반에서 80% → 7일이면 거의 완전 적응)
  const progress = absDiff <= 3
    ? [0.5, 0.8, 1.0, 1.0, 1.0, 1.0, 1.0]
    : absDiff <= 6
      ? [0.2, 0.4, 0.6, 0.7, 0.85, 0.95, 1.0]
      : absDiff <= 9
        ? [0.15, 0.3, 0.45, 0.6, 0.7, 0.8, 0.9]
        : [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7]

  const states = absDiff <= 3
    ? ['적응 중', '거의 적응', '완전 적응', '완전 적응', '완전 적응', '완전 적응', '완전 적응']
    : absDiff <= 6
      ? ['피로 강함', '야간 각성', '개선 시작', '50% 적응', '안정화', '거의 완전', '완전 적응']
      : absDiff <= 9
        ? ['피로 최대', '야간 각성', '개선 시작', '50% 적응', '안정화 진입', '대부분 적응', '거의 완전']
        : ['피로 최대', '야간 각성 강함', '회복 시작', '40% 적응', '50% 적응', '60% 적응', '70% 적응']

  const tips = [
    '낮잠 30분 이내 허용 · 알람 필수',
    '햇빛 최대 노출 (아침/저녁)',
    '멜라토닌 0.5~1mg 고려',
    '오후 카페인 컷오프 엄수',
    '가벼운 운동 재개 (오후)',
    '정상 식사 리듬 회복',
    '수분·수면 유지 · 안정',
  ]

  return Array.from({ length: 7 }, (_, i) => {
    const remaining = absDiff * (1 - progress[i])  // 아직 보정해야 할 시차
    const shift = (absDiff - remaining) * sign     // 누적 보정량 (음수=앞당김, 양수=늦춤)
    return {
      day: `${i + 1}일차`,
      state: states[i],
      bed: progress[i] >= 1.0 ? '정상' : formatHours(bedH + shift),
      wake: progress[i] >= 1.0 ? '정상' : formatHours(wakeH + shift),
      tip: tips[i],
    }
  })
}
