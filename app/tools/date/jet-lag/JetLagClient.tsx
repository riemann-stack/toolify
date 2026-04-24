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

  // 비행 탭
  const [flightHours, setFlightHours] = useState(14)
  const [caffeineNow, setCaffeineNow] = useState('14:00')
  const [sleepStart, setSleepStart] = useState('22:00')
  const [sensitivity, setSensitivity] = useState<'low' | 'normal' | 'high'>('normal')

  // 도착 탭
  const [arrivalTime, setArrivalTime] = useState('15:00')
  const [inFlightSleep, setInFlightSleep] = useState(4)
  const [napTime, setNapTime] = useState('14:00')

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

  return (
    <div className={s.wrap}>
      {/* 공통 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>여행 기본 정보</span>
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
        <div className={s.row3} style={{ marginTop: 10 }}>
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
          <div>
            <label className={s.fieldLabel}>체류 기간 (일)</label>
            <input
              className={s.input}
              type="number"
              min={1}
              max={90}
              value={stayDays}
              onChange={(e) => setStayDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
            />
          </div>
        </div>
      </div>

      {/* 시차 히어로 */}
      <div className={`${s.hero} ${direction === 'east' ? s.heroEast : direction === 'west' ? s.heroWest : s.heroNone}`}>
        <p className={s.heroLead}>
          {from.name} → {to.name}
        </p>
        <div className={s.heroValue}>
          {absDiff}<span className={s.heroUnit}>시간</span>
        </div>
        <div className={`${s.heroDir} ${direction === 'east' ? s.dirEast : direction === 'west' ? s.dirWest : s.dirNone}`}>
          {direction === 'east' ? '→ 동쪽 이동 (더 어려움)' : direction === 'west' ? '← 서쪽 이동 (상대적으로 쉬움)' : '시차 없음'}
        </div>
        <p className={s.heroDesc}>
          {absDiff === 0
            ? <>시차가 없어 <strong>별도 적응 기간이 필요하지 않습니다.</strong></>
            : stayDays <= 3
              ? <>체류 {stayDays}일 — 완전 적응보다 <strong>한국 시간 유지 전략</strong>을 추천합니다.</>
              : <>완전 적응까지 <strong>약 {adaptDays}일</strong> 예상 ({direction === 'east' ? '동쪽 ×1.5' : '서쪽 ×1.0'})</>
          }
        </p>
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
        <FlightTab flightHours={flightHours} setFlightHours={setFlightHours} timeDiff={timeDiff} caffeineNow={caffeineNow} setCaffeineNow={setCaffeineNow} sleepStart={sleepStart} setSleepStart={setSleepStart} sensitivity={sensitivity} setSensitivity={setSensitivity} />
      )}
      {tab === 'post' && (
        <PostTab arrivalTime={arrivalTime} setArrivalTime={setArrivalTime} inFlightSleep={inFlightSleep} setInFlightSleep={setInFlightSleep} napTime={napTime} setNapTime={setNapTime} direction={direction} adaptDays={adaptDays} stayDays={stayDays} absDiff={absDiff} />
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
    const daysOut = adjustDays - i // D-4, D-3, ..., D-0 (출발일)
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
  // 현지 시각 축. 한국(출발지) 심야(취침~기상)가 현지 어떤 시간대에 해당하는지.
  const drowsyStart = ((bedH + timeDiff) % 24 + 24) % 24
  const drowsyEnd = ((wakeH + timeDiff) % 24 + 24) % 24
  // 반대로 한국 낮(기상~취침)은 현지 어떤 밤 시간대?
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
function FlightTab({ flightHours, setFlightHours, timeDiff, caffeineNow, setCaffeineNow, sleepStart, setSleepStart, sensitivity, setSensitivity }: {
  flightHours: number
  setFlightHours: (n: number) => void
  timeDiff: number
  caffeineNow: string
  setCaffeineNow: (s: string) => void
  sleepStart: string
  setSleepStart: (s: string) => void
  sensitivity: 'low' | 'normal' | 'high'
  setSensitivity: (s: 'low' | 'normal' | 'high') => void
}) {
  // 도착지 밤(22:00~06:00)에 해당하는 출발지 시각 계산
  // 비행 시작 시점을 "도착지 시각 X" 로 보고 비행 길이에 맞춰 수면 구간 산출
  // 단순화: 현지 밤 구간이 비행 창문과 얼마나 겹치는지를 비행 시간 축(0~flightHours)에서 계산
  const recommend = useMemo(() => {
    // 기내 축: 0 시점을 "이륙" 이라고 하고 현지시각 기준으로 표현.
    // 여기서는 비행 시작 = 도착지 0시로 가정할 수 없으므로, 입력된 이륙 현지시각을 받아 계산.
    return {
      flightHours,
    }
  }, [flightHours])

  // 카페인 계산 (현지 시각 축)
  const HL = { low: 6, normal: 8, high: 10 }
  const nowH = parseHHMM(caffeineNow)
  const sleepH = parseHHMM(sleepStart)
  const hoursUntilSleep = ((sleepH - nowH) + 24) % 24 // 현재부터 취침까지(최대 24h)
  const cutoffHours = HL[sensitivity]
  // 수면 시각 - 반감기 = 마지막 허용 시각
  const lastAllowed = ((sleepH - cutoffHours) + 24) % 24
  const allowedMargin = hoursUntilSleep - cutoffHours // 양수면 여유, 음수면 초과
  const status: 'ok' | 'warn' | 'no' =
    allowedMargin > 1 ? 'ok' : allowedMargin > 0 ? 'warn' : 'no'

  return (
    <>
      <div className={s.card}>
        <div className={s.cardTitle}>🛫 기내 수면 타이밍</div>
        <div className={s.row2}>
          <div>
            <label className={s.fieldLabel}>비행 시간 (시간)</label>
            <input
              className={s.input}
              type="number"
              min={1}
              max={20}
              step={0.5}
              value={flightHours}
              onChange={(e) => setFlightHours(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            />
          </div>
          <div>
            <label className={s.fieldLabel}>시차</label>
            <input className={s.input} value={`${timeDiff >= 0 ? '+' : ''}${timeDiff}시간`} readOnly />
          </div>
        </div>

        <FlightTimeline flightHours={recommend.flightHours} timeDiff={timeDiff} />
      </div>

      <div className={s.card}>
        <div className={s.cardTitle}>☕ 카페인 컷오프 계산기</div>
        <div className={s.row3}>
          <div>
            <label className={s.fieldLabel}>지금 시각 (현지)</label>
            <input className={s.input} type="time" value={caffeineNow} onChange={(e) => setCaffeineNow(e.target.value)} />
          </div>
          <div>
            <label className={s.fieldLabel}>목표 취침 시각</label>
            <input className={s.input} type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
          </div>
          <div>
            <label className={s.fieldLabel}>카페인 민감도</label>
            <div className={s.selectWrap}>
              <select className={s.select} value={sensitivity} onChange={(e) => setSensitivity(e.target.value as 'low' | 'normal' | 'high')}>
                <option value="low">낮음 (6시간)</option>
                <option value="normal">보통 (8시간)</option>
                <option value="high">높음 (10시간)</option>
              </select>
              <span className={s.selectArrow}>▼</span>
            </div>
          </div>
        </div>

        <div className={`${s.caffeineCard} ${status === 'ok' ? s.caffeineOk : status === 'warn' ? s.caffeineWarn : s.caffeineNo}`} style={{ marginTop: 14 }}>
          <div className={s.caffeineIcon}>{status === 'ok' ? '✅' : status === 'warn' ? '⚠️' : '❌'}</div>
          <div className={`${s.caffeineVerdict} ${status === 'ok' ? s.caffeineVerdictOk : status === 'warn' ? s.caffeineVerdictWarn : s.caffeineVerdictNo}`}>
            {status === 'ok' ? '지금 마셔도 OK' : status === 'warn' ? '애매한 구간 — 반 잔만' : '지금은 피하세요'}
          </div>
          <div className={s.caffeineDetail}>
            마지막 카페인 허용 시각 <strong>{formatHours(lastAllowed)}</strong><br />
            {allowedMargin > 0
              ? <>앞으로 <strong>{allowedMargin.toFixed(1)}시간</strong> 내 섭취 가능</>
              : <>취침까지 <strong>{Math.abs(allowedMargin).toFixed(1)}시간</strong> 부족 — 수면 방해 가능성</>
            }
          </div>
        </div>
      </div>
    </>
  )
}

/** 비행 타임라인: 이륙(현지 now)~도착 축에서 도착지 밤에 해당하는 구간을 표시 */
function FlightTimeline({ flightHours, timeDiff }: { flightHours: number; timeDiff: number }) {
  // 이륙 현지 시각을 가정치로 '아침 10시' 사용 (단순화; 사용자가 실제 값을 입력하지 않음)
  // 대신 timeDiff를 활용해 비행 축(시간) 안에서 "도착지 밤 22~6" 구간이 어디 걸치는지 표시하기 위해
  // 이륙 시 현지시각을 모를 땐 힌트 텍스트만 주는 편이 정확함.
  // 여기서는 추정: 인천 기준 오전/저녁 이륙 패턴이 많아 '이륙 = 현지 아침 9시' 로 가정 (안내 문구로 처리)
  const takeoffLocal = 9 // 도착지 현지시각 기준 이륙 시점 가정 (안내)
  // 비행 중 각 시점의 도착지 현지 시각 = takeoffLocal + t
  // 수면 권장: 도착지 현지 22~06
  const segs: Seg[] = []
  for (let t = 0; t < flightHours; t += 0.25) {
    const localHour = (takeoffLocal + t) % 24
    const inNight = localHour >= 22 || localHour < 6
    if (inNight) {
      segs.push({ start: t, end: t + 0.25, cls: s.segSleep, label: '' })
    } else {
      segs.push({ start: t, end: t + 0.25, cls: s.segWake, label: '' })
    }
  }
  // 연속 구간 합치기는 시각적으로만 필요; 단순히 레이블 없이 칠하기
  return (
    <div style={{ marginTop: 14 }}>
      <FlightBar segs={segs} totalHours={flightHours} />
      <div className={s.timelineLabels}>
        <span>이륙</span>
        <span>{Math.round(flightHours / 2)}h</span>
        <span>{flightHours}h 도착</span>
      </div>
      <div className={s.legendRow}>
        <div className={s.legendItem}><span className={s.legendSwatch} style={{ background: 'rgba(62,200,255,0.6)' }} />수면 권장 (현지 22~06시)</div>
        <div className={s.legendItem}><span className={s.legendSwatch} style={{ background: 'rgba(200,255,62,0.45)' }} />깨어있기</div>
      </div>
      <p className={s.sub}>
        ※ 이륙 현지시각을 도착지 기준 오전 9시로 가정한 참고용 시각화입니다. 시차 {timeDiff >= 0 ? '+' : ''}{timeDiff}시간 반영.
      </p>
    </div>
  )
}

type Seg = { start: number; end: number; cls: string; label: string }

function FlightBar({ segs, totalHours }: { segs: Seg[]; totalHours: number }) {
  return (
    <div className={s.timeline}>
      {segs.map((seg, i) => {
        const left = (seg.start / totalHours) * 100
        const width = ((seg.end - seg.start) / totalHours) * 100
        return (
          <div key={i} className={`${s.timelineSeg} ${seg.cls}`} style={{ left: `${left}%`, width: `${width}%` }} />
        )
      })}
    </div>
  )
}

/** 24시간 축 타임라인 */
function Timeline({ segments, nowHour }: { segments: Seg[]; nowHour?: number }) {
  return (
    <>
      <div className={s.timeline}>
        {segments.map((seg, i) => {
          // start/end는 0~24 범위; end < start 이면 두 조각으로 분할
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
function PostTab({ arrivalTime, setArrivalTime, inFlightSleep, setInFlightSleep, napTime, setNapTime, direction, adaptDays, stayDays, absDiff }: {
  arrivalTime: string
  setArrivalTime: (s: string) => void
  inFlightSleep: number
  setInFlightSleep: (n: number) => void
  napTime: string
  setNapTime: (s: string) => void
  direction: 'east' | 'west' | 'none'
  adaptDays: number
  stayDays: number
  absDiff: number
}) {
  const arrivalH = parseHHMM(arrivalTime)
  const targetBed = 22
  const hoursToEndure = (targetBed - arrivalH + 24) % 24
  const fatigue: 'low' | 'mid' | 'high' | 'veryHigh' =
    hoursToEndure <= 3 && inFlightSleep >= 4 ? 'low' :
    hoursToEndure <= 5 && inFlightSleep >= 3 ? 'mid' :
    hoursToEndure <= 8 && inFlightSleep >= 2 ? 'high' : 'veryHigh'

  // 낮잠 판정 (현지 시각 기준)
  const napH = parseHHMM(napTime)
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

  // 7일 스케줄
  const weekSchedule = buildWeekSchedule(direction, absDiff)

  return (
    <>
      {/* 첫날 전략 */}
      <div className={s.card}>
        <div className={s.cardTitle}>🛬 도착 첫날 전략</div>
        <div className={s.row3}>
          <div>
            <label className={s.fieldLabel}>현지 도착 시각</label>
            <input className={s.input} type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
          </div>
          <div>
            <label className={s.fieldLabel}>비행 중 수면 (시간)</label>
            <input className={s.input} type="number" min={0} max={14} step={0.5} value={inFlightSleep} onChange={(e) => setInFlightSleep(Math.max(0, Math.min(14, Number(e.target.value) || 0)))} />
          </div>
          <div>
            <label className={s.fieldLabel}>피로도</label>
            <input className={s.input} value={fatigue === 'low' ? '낮음' : fatigue === 'mid' ? '보통' : fatigue === 'high' ? '높음' : '매우 높음'} readOnly />
          </div>
        </div>
        <div className={s.flightResult}>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>목표 취침</div>
            <div className={s.flightBoxValue}>22:00 ~ 23:00</div>
          </div>
          <div className={s.flightBox}>
            <div className={s.flightBoxLabel}>남은 버팀 시간</div>
            <div className={s.flightBoxValue}>{Math.floor(hoursToEndure)}시간 {Math.round((hoursToEndure % 1) * 60)}분</div>
          </div>
        </div>
        <p className={s.sub}>오늘은 <strong style={{ color: 'var(--accent)' }}>현지 22~23시</strong>까지 버텨서 취침하는 것을 목표로 하세요.</p>
      </div>

      {/* 낮잠 판정 */}
      <div className={`${s.napCard} ${napDecision.status === 'ok' ? s.napOk : napDecision.status === 'warn' ? s.napWarn : s.napNo}`}>
        <div className={s.cardTitle}>😴 낮잠 판정</div>
        <div className={s.row2}>
          <div>
            <label className={s.fieldLabel}>현재 현지 시각</label>
            <input className={s.input} type="time" value={napTime} onChange={(e) => setNapTime(e.target.value)} />
          </div>
          <div>
            <label className={s.fieldLabel}>판정</label>
            <input className={s.input} value={napDecision.status === 'ok' ? '✅ 낮잠 가능' : napDecision.status === 'warn' ? '⚠️ 짧게만' : '❌ 금지'} readOnly />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className={s.napStatus}>
            {napDecision.status === 'ok' ? '✅ 낮잠 OK' : napDecision.status === 'warn' ? '⚠️ 주의 — 15분 이내' : '❌ 낮잠 금지'}
          </div>
          <div className={s.napBig}>{napDecision.max > 0 ? `${napDecision.max}분 이내` : '0분'}</div>
          <div className={s.napNote}>{napDecision.note}</div>
        </div>
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

      {/* 적응 타임라인 */}
      <div className={s.adaptCard}>
        <div className={s.cardTitle}>📈 시차 적응 타임라인</div>
        {adaptDays === 0 ? (
          <div className={s.empty}>시차가 없어 적응이 필요하지 않습니다.</div>
        ) : (
          <>
            <div className={s.progressWrap}>
              <div className={s.progressFill} style={{ width: '100%' }} />
              <div className={s.progressMark} style={{ left: '50%' }}>
                <span className={s.progressLabel}>50% ({pct50}일)</span>
              </div>
              <div className={s.progressMark} style={{ left: '80%' }}>
                <span className={s.progressLabel}>80% ({pct80}일)</span>
              </div>
              {stayDays < adaptDays && (
                <div className={s.progressMark} style={{ left: `${stayPosition}%`, borderLeft: '2px dashed #FF6B6B', background: 'transparent' }}>
                  <span className={s.progressLabel} style={{ color: '#FF6B6B' }}>귀국 ({stayDays}일)</span>
                </div>
              )}
            </div>
            <div className={s.progressMilestones}>
              <span>도착 1일차</span>
              <span>완전 적응 {adaptDays}일</span>
            </div>
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

      {/* 7일 스케줄 */}
      {adaptDays > 0 && (
        <div className={s.card}>
          <div className={s.cardTitle}>📅 7일 적응 스케줄</div>
          <div className={s.tableWrap}>
            <table className={s.scheduleTable}>
              <thead>
                <tr>
                  <th>일차</th>
                  <th>예상 상태</th>
                  <th>취침</th>
                  <th>기상</th>
                  <th>팁</th>
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

function buildWeekSchedule(direction: 'east' | 'west' | 'none', absDiff: number) {
  if (direction === 'none' || absDiff === 0) return []
  return [
    { day: '1일차', state: '피로 최대', bed: '22:00', wake: '07:00', tip: '낮잠 30분 이내 허용' },
    { day: '2일차', state: '야간 각성', bed: '22:30', wake: '07:00', tip: '햇빛 최대 노출' },
    { day: '3일차', state: '개선 시작', bed: '23:00', wake: '07:00', tip: '멜라토닌 소량 고려' },
    { day: '4일차', state: '50% 적응', bed: '23:00', wake: '07:00', tip: '오후 카페인 주의' },
    { day: '5일차', state: '안정화 진입', bed: '정상', wake: '정상', tip: '가벼운 운동 재개' },
    { day: '6일차', state: '대부분 적응', bed: '정상', wake: '정상', tip: '정상 식사 리듬' },
    { day: '7일차', state: '거의 완전', bed: '정상', wake: '정상', tip: '수분·수면 유지' },
  ]
}
