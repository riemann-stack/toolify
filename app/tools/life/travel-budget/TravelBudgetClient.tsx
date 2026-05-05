/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import s from './travelBudget.module.css'
import {
  CITIES, STYLES, SEASONS, AIRLINES, REGION_LABELS,
  type Style, type Season, type Airline,
  getCity, getFlight, calcBudget, diagnose, autoFill,
  fmtMan, fmtCurrency,
} from './travelBudgetUtils'

type Tab = 'calc' | 'cities' | 'diagnose' | 'compare'

const STORAGE_KEY = 'youtil_travelbudget_v1'

export default function TravelBudgetClient() {
  const [tab, setTab] = useState<Tab>('calc')

  /* 공통 입력 */
  const [cityId, setCityId] = useState('tokyo')
  const [style, setStyle] = useState<Style>('middle')
  const [days, setDays] = useState('5')
  const [people, setPeople] = useState('2')
  const [season, setSeason] = useState<Season>('low')
  const [airline, setAirline] = useState<Airline>('lcc')

  /* 9 항목 (만원) */
  const [flight, setFlight] = useState('40')
  const [hotel, setHotel] = useState('12')
  const [food, setFood] = useState('8')
  const [transport, setTransport] = useState('18')
  const [shopping, setShopping] = useState('50')
  const [ticket, setTicket] = useState('30')
  const [comm, setComm] = useState('5')
  const [insurance, setInsurance] = useState('3')
  const [etc, setEtc] = useState('10')

  const [reservePct, setReservePct] = useState(10)

  /* 환율 */
  const [krwRate, setKrwRate] = useState('')

  /* 검색 (탭 2) */
  const [search, setSearch] = useState('')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.cityId) setCityId(j.cityId)
      if (j.style) setStyle(j.style)
      if (j.days) setDays(j.days)
      if (j.people) setPeople(j.people)
      if (j.season) setSeason(j.season)
      if (j.airline) setAirline(j.airline)
      if (j.flight) setFlight(j.flight)
      if (j.hotel) setHotel(j.hotel)
      if (j.food) setFood(j.food)
      if (j.transport) setTransport(j.transport)
      if (j.shopping) setShopping(j.shopping)
      if (j.ticket) setTicket(j.ticket)
      if (j.comm) setComm(j.comm)
      if (j.insurance) setInsurance(j.insurance)
      if (j.etc) setEtc(j.etc)
      if (j.reservePct) setReservePct(j.reservePct)
      if (j.krwRate) setKrwRate(j.krwRate)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cityId, style, days, people, season, airline,
        flight, hotel, food, transport, shopping, ticket, comm, insurance, etc,
        reservePct, krwRate,
      }))
    } catch {}
  }, [cityId, style, days, people, season, airline, flight, hotel, food, transport, shopping, ticket, comm, insurance, etc, reservePct, krwRate])

  /* 자동 채움 */
  const fillAuto = () => {
    const a = autoFill({ cityId, style, days: parseInt(days) || 1, people: parseInt(people) || 1, season, airline })
    setFlight(String(a.flight))
    setHotel(String(a.hotel))
    setFood(String(a.food))
    setTransport(String(a.transport))
    setShopping(String(a.shopping))
    setTicket(String(a.ticket))
    setComm(String(a.comm))
    setInsurance(String(a.insurance))
    setEtc(String(a.etc))
  }

  /* 계산 */
  const inp = useMemo(() => ({
    cityId, style, days: parseInt(days) || 1, people: parseInt(people) || 1, season, airline,
    flight: parseFloat(flight) || 0,
    hotel: parseFloat(hotel) || 0,
    food: parseFloat(food) || 0,
    transport: parseFloat(transport) || 0,
    shopping: parseFloat(shopping) || 0,
    ticket: parseFloat(ticket) || 0,
    comm: parseFloat(comm) || 0,
    insurance: parseFloat(insurance) || 0,
    etc: parseFloat(etc) || 0,
    reservePct,
  }), [cityId, style, days, people, season, airline, flight, hotel, food, transport, shopping, ticket, comm, insurance, etc, reservePct])

  const result = useMemo(() => calcBudget(inp), [inp])
  const city = getCity(cityId)
  const rate = parseFloat(krwRate) || city.defaultRate
  const rateBase = city.defaultRateBase ?? 1
  const totalNative = (result.total * 10000) / rate * rateBase

  /* 도시 평균 (1인 기준 만원) */
  const avgPerPerson = useMemo(() => {
    const sty = city.styles[style]
    const dy = inp.days
    const flt = getFlight(city.region, airline, season)
    return flt + (sty.hotel + sty.food + sty.transport) * dy + 30 + 5  // 항공+일별+쇼핑·기타
  }, [city, style, inp.days, airline, season])
  const myPerPerson = result.perPerson
  const vsAvgPct = avgPerPerson > 0 ? ((myPerPerson - avgPerPerson) / avgPerPerson) * 100 : 0

  /* 진단 (탭 3) */
  const diagnosis = useMemo(() => diagnose(inp), [inp])

  /* 3 스타일 비교 (탭 4) */
  const styleComparison = useMemo(() => {
    return STYLES.map((st) => {
      const a = autoFill({ cityId, style: st.id, days: inp.days, people: inp.people, season, airline })
      const r = calcBudget({
        ...inp, style: st.id,
        flight: a.flight, hotel: a.hotel, food: a.food, transport: a.transport,
        shopping: a.shopping, ticket: a.ticket, comm: a.comm, insurance: a.insurance, etc: a.etc,
      })
      return { style: st, result: r }
    })
  }, [cityId, inp, season, airline])

  /* 도시 검색 (탭 2) */
  const filteredCities = useMemo(() => {
    if (!search) return CITIES
    const q = search.toLowerCase()
    return CITIES.filter((c) => c.name.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q))
  }, [search])

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'calc',     label: '✈️ 예산 계산' },
          { id: 'cities',   label: '🌆 도시별 평균' },
          { id: 'diagnose', label: '📊 항목 진단' },
          { id: 'compare',  label: '⚖️ 3 스타일' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 탭 1: 예산 계산 ════════ */}
      {tab === 'calc' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>여행 도시 (18개)</span>
            <div className={s.cityGrid}>
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  className={`${s.cityBtn} ${cityId === c.id ? s.cityBtnActive : ''}`}
                  onClick={() => setCityId(c.id)}
                  type="button"
                >
                  <span className={s.cityFlag}>{c.flag}</span>
                  <span className={s.cityName}>{c.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>스타일 · 시즌 · 항공사</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>여행 스타일</label>
              <div className={s.pillRow}>
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    className={`${s.pill} ${style === st.id ? s.pillActive : ''}`}
                    onClick={() => setStyle(st.id)}
                    type="button"
                    style={{ borderColor: style === st.id ? st.color : undefined }}
                  >
                    {st.emoji} {st.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>시즌</label>
                <div className={s.pillRow}>
                  {SEASONS.map((sn) => (
                    <button
                      key={sn.id}
                      className={`${s.pill} ${season === sn.id ? s.pillActive : ''}`}
                      onClick={() => setSeason(sn.id)}
                      type="button"
                    >
                      {sn.emoji} {sn.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>항공사</label>
                <div className={s.pillRow}>
                  {AIRLINES.map((a) => (
                    <button
                      key={a.id}
                      className={`${s.pill} ${airline === a.id ? s.pillActive : ''}`}
                      onClick={() => setAirline(a.id)}
                      type="button"
                      title={a.desc}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button className={s.autoBtn} onClick={fillAuto} type="button">
              ⚡ 도시·스타일·시즌으로 9 항목 자동 채우기
            </button>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>여행 기간 · 인원</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>여행 일수 ({days}일)</label>
                <input
                  type="range"
                  min={1} max={30} step={1}
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className={s.slider}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[3, 5, 7, 10, 14].map((d) => (
                    <button key={d} className={`${s.pill} ${parseInt(days) === d ? s.pillActive : ''}`} onClick={() => setDays(String(d))} type="button">
                      {d}일
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>인원 ({people}명)</label>
                <input
                  type="range"
                  min={1} max={10} step={1}
                  value={people}
                  onChange={(e) => setPeople(e.target.value)}
                  className={s.slider}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[1, 2, 4, 6].map((p) => (
                    <button key={p} className={`${s.pill} ${parseInt(people) === p ? s.pillActive : ''}`} onClick={() => setPeople(String(p))} type="button">
                      {p}명
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>9 항목 입력 (만원)</span>
            <div className={s.itemGrid}>
              {[
                { id: 'flight',    emoji: '✈️', label: '항공권 (왕복 1인)',  v: flight,    set: setFlight,    perPerson: true },
                { id: 'hotel',     emoji: '🏨', label: '숙박 (1박 1인)',      v: hotel,     set: setHotel,     perPerson: true },
                { id: 'food',      emoji: '🍽️', label: '식비 (1일 1인)',      v: food,      set: setFood,      perPerson: true },
                { id: 'transport', emoji: '🚕', label: '교통 (1일 1인)',      v: transport, set: setTransport, perPerson: true },
                { id: 'shopping',  emoji: '🛍️', label: '쇼핑 (총액)',         v: shopping,  set: setShopping,  perPerson: false },
                { id: 'ticket',    emoji: '🎟️', label: '입장권·투어 (총액)',  v: ticket,    set: setTicket,    perPerson: false },
                { id: 'comm',      emoji: '📱', label: '통신·로밍 (총액)',    v: comm,      set: setComm,      perPerson: false },
                { id: 'insurance', emoji: '🛡️', label: '여행자보험 (1인)',    v: insurance, set: setInsurance, perPerson: true },
                { id: 'etc',       emoji: '💵', label: '기타 (총액)',         v: etc,       set: setEtc,       perPerson: false },
              ].map((it) => (
                <div key={it.id} className={s.itemCard}>
                  <label className={s.itemLabel}>
                    {it.emoji} {it.label}
                  </label>
                  <input
                    type="number"
                    className={s.input}
                    value={it.v}
                    onChange={(e) => it.set(e.target.value)}
                    min={0}
                    step={1}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>예비비 · 환율</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>예비비 ({reservePct}%)</label>
                <div className={s.pillRow}>
                  {[5, 10, 15, 20].map((p) => (
                    <button
                      key={p}
                      className={`${s.pill} ${reservePct === p ? s.pillActive : ''}`}
                      onClick={() => setReservePct(p)}
                      type="button"
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <p className={s.helpText}>일반 10%, 새 국가·장기 15~20% 권장</p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>환율 (1{city.currencyUnit}{city.defaultRateBase && city.defaultRateBase > 1 ? `(${city.defaultRateBase})` : ''} = ? 원)</label>
                <input
                  type="number"
                  className={s.input}
                  value={krwRate}
                  onChange={(e) => setKrwRate(e.target.value)}
                  placeholder={String(city.defaultRate)}
                />
                <p className={s.helpText}>기본값 {city.defaultRate}원</p>
              </div>
            </div>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>{city.flag} {city.shortName} · {STYLES.find((s) => s.id === style)!.label} · {inp.days}일 · {inp.people}명</p>
            <p className={s.heroValue}>
              총 <strong>{fmtMan(result.total)}</strong>
            </p>
            <p className={s.heroSub}>
              1인 <strong style={{ color: 'var(--accent)' }}>{fmtMan(result.perPerson)}</strong>
              {' · '}하루 평균 <strong style={{ color: 'var(--accent)' }}>{fmtMan(result.perDay)}</strong>
              {' · '}현지 통화 ≈ <strong>{fmtCurrency(totalNative, city.currencyUnit, totalNative > 1000 ? 0 : 2)}</strong>
              <br />도시 평균 대비 <strong style={{ color: vsAvgPct > 30 ? '#FF3E8C' : vsAvgPct < -30 ? '#3EFFD0' : 'var(--text)' }}>
                {vsAvgPct > 0 ? '+' : ''}{vsAvgPct.toFixed(0)}%
              </strong>
            </p>
          </div>

          {/* 도넛 차트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>항목별 비중</span>
            <DonutChart items={result.items} total={result.subTotal} />
          </div>

          {/* 항목별 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>항목별 상세</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>1인</th>
                    <th>총액</th>
                    <th>비중</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.emoji} {it.label}</td>
                      <td className={s.cellMono}>{fmtMan(it.perPerson)}</td>
                      <td className={s.cellMono}>{fmtMan(it.total)}</td>
                      <td className={s.cellMono} style={{ color: it.color }}>{((it.total / result.subTotal) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className={s.cellSubtitle}><td colSpan={4}>예비비 별도</td></tr>
                  <tr><td>💰 예비비 ({reservePct}%)</td><td className={s.cellMono}>{fmtMan(result.reserve / inp.people)}</td><td className={s.cellMono}>{fmtMan(result.reserve)}</td><td className={s.cellMono}>{reservePct}%</td></tr>
                  <tr className={s.cellTotal}>
                    <td><strong>총 합계</strong></td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtMan(result.perPerson)}</strong></td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtMan(result.total)}</strong></td>
                    <td className={s.cellMono}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 도시별 평균 ════════ */}
      {tab === 'cities' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>도시 검색 ({CITIES.length}개)</span>
            <input
              type="text"
              className={s.input}
              placeholder="🔍 도시 검색 (예: 도쿄, 파리, 발리)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={s.cityCardGrid}>
            {filteredCities.map((c) => (
              <button
                key={c.id}
                className={`${s.cityCard} ${cityId === c.id ? s.cityCardActive : ''}`}
                onClick={() => {
                  setCityId(c.id)
                  setTab('calc')
                }}
                type="button"
              >
                <p className={s.cityCardHead}>
                  <span className={s.cityCardFlag}>{c.flag}</span>
                  <strong>{c.name}</strong>
                  <span className={s.cityCardRegion}>{REGION_LABELS[c.region]}</span>
                </p>
                <div className={s.cityCardStyles}>
                  {STYLES.map((st) => {
                    const sty = c.styles[st.id]
                    const total = sty.hotel + sty.food + sty.transport
                    return (
                      <div key={st.id} className={s.cityCardStyle}>
                        <span className={s.cityCardStyleLabel} style={{ color: st.color }}>{st.emoji} {st.label}</span>
                        <span className={s.cityCardStyleVal}>{total}만원/일</span>
                        <span className={s.cityCardStyleBreak}>
                          🏨{sty.hotel} 🍽️{sty.food} 🚕{sty.transport}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </button>
            ))}
          </div>

          <div className={s.warnCard}>
            <strong>💡 데이터 안내</strong>
            <p>
              표시 금액은 <strong>1박 1인 기준 만원 단위 평균치</strong>입니다 (숙박+식비+교통/투어).<br />
              항공권은 별도 — 일본 LCC 비수기 약 25만원, 동남아 35만원, 미국·유럽 90~100만원.<br />
              실제 비용은 시기·환율·취향에 따라 ±30% 변동 — 본인 조건으로 계산해 보세요.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 항목 진단 ════════ */}
      {tab === 'diagnose' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>📊 본인 입력 vs {city.shortName} {STYLES.find((s) => s.id === style)!.label} 평균</p>
            <p className={s.heroValue}>
              {vsAvgPct > 0 ? '+' : ''}<strong>{vsAvgPct.toFixed(0)}%</strong>
            </p>
            <p className={s.heroSub}>
              본인 1인 {fmtMan(myPerPerson)} · 평균 약 {fmtMan(avgPerPerson)}
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>항목별 비교</span>
            <div className={s.diagGrid}>
              {diagnosis.map((d) => {
                const max = Math.max(d.user, d.avg, 1)
                const userW = (d.user / max) * 100
                const avgW = (d.avg / max) * 100
                const colorMap = {
                  low:    '#3EC8FF',
                  normal: '#3EFFD0',
                  high:   '#FFB83E',
                  over:   '#FF3E8C',
                }
                return (
                  <div key={d.id} className={s.diagCard}>
                    <p className={s.diagHead}>
                      {d.emoji} <strong>{d.label}</strong>
                      <span className={s.diagDiff} style={{ color: colorMap[d.status] }}>
                        {d.diffPct > 0 ? '+' : ''}{d.diffPct.toFixed(0)}%
                      </span>
                    </p>
                    <div className={s.diagBars}>
                      <div className={s.diagBarRow}>
                        <span className={s.diagBarLabel}>본인</span>
                        <div className={s.diagBarTrack}>
                          <div className={s.diagBarFill} style={{ width: `${userW}%`, background: colorMap[d.status] }}>
                            <span>{fmtMan(d.user)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={s.diagBarRow}>
                        <span className={s.diagBarLabel}>평균</span>
                        <div className={s.diagBarTrack}>
                          <div className={s.diagBarFill} style={{ width: `${avgW}%`, background: 'rgba(232, 151, 87, 0.5)' }}>
                            <span>{fmtMan(d.avg)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 절감 팁 */}
          <div className={s.card}>
            <span className={s.cardLabel}>💡 절감 가능 항목 추천</span>
            <div className={s.tipGrid}>
              {[
                { emoji: '🏨', t: '숙박 절감', d: '호스텔(2~5만원)·에어비앤비·게스트하우스·유스호스텔 활용' },
                { emoji: '🍽️', t: '식비 절감', d: '로컬 식당(현지가)·편의점·시장·구글맵 평점 4.0+ 검색' },
                { emoji: '🚕', t: '교통 절감', d: '대중교통 패스(JR·도쿄 메트로·옥토퍼스)·도보·자전거 대여' },
                { emoji: '🛍️', t: '쇼핑 절감', d: '면세 환급(Tax Refund)·아울렛·세일 시즌·중고시장' },
                { emoji: '✈️', t: '항공권 절감', d: '비수기 + 화요일 새벽·LCC·경유편·3개월 전 예매' },
                { emoji: '📱', t: '통신 절감', d: 'eSim(코코·에어랄로 1주 1~3만원)·Wi-Fi 도시락' },
              ].map((t, i) => (
                <div key={i} className={s.tipCard}>
                  <p className={s.tipHead}>{t.emoji} <strong>{t.t}</strong></p>
                  <p className={s.tipDesc}>{t.d}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 3 스타일 비교 ════════ */}
      {tab === 'compare' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>{city.flag} {city.shortName} · {inp.days}일 · {inp.people}명</p>
            <p className={s.heroValue}>3 스타일 동시 비교</p>
            <p className={s.heroSub}>같은 일정에 배낭·중간·럭셔리 견적</p>
          </div>

          <div className={s.styleCompareGrid}>
            {styleComparison.map((sc) => (
              <div
                key={sc.style.id}
                className={`${s.styleCompareCard} ${style === sc.style.id ? s.styleCompareActive : ''}`}
                style={{ borderTopColor: sc.style.color }}
              >
                <p className={s.styleCompareHead}>
                  <span style={{ fontSize: 28 }}>{sc.style.emoji}</span>
                  <strong>{sc.style.label}</strong>
                </p>
                <p className={s.styleCompareDesc}>{sc.style.desc}</p>
                <p className={s.styleCompareTotal} style={{ color: sc.style.color }}>
                  {fmtMan(sc.result.total)}
                </p>
                <p className={s.styleComparePer}>
                  1인 <strong>{fmtMan(sc.result.perPerson)}</strong><br />
                  하루 <strong>{fmtMan(sc.result.perDay)}</strong>
                </p>
                <button
                  className={s.styleSelectBtn}
                  onClick={() => {
                    setStyle(sc.style.id)
                    fillAuto()
                    setTab('calc')
                  }}
                  type="button"
                >
                  이 스타일로 시작
                </button>
              </div>
            ))}
          </div>

          {/* 차액 비교 */}
          <div className={s.card}>
            <span className={s.cardLabel}>차액 비교</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>스타일</th>
                    <th>총액</th>
                    <th>1인</th>
                    <th>배낭 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {styleComparison.map((sc) => {
                    const diff = sc.result.total - styleComparison[0].result.total
                    return (
                      <tr key={sc.style.id}>
                        <td>{sc.style.emoji} {sc.style.label}</td>
                        <td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(sc.result.total)}</td>
                        <td className={s.cellMono}>{fmtMan(sc.result.perPerson)}</td>
                        <td className={s.cellMono} style={{ color: diff > 0 ? '#FF8C3E' : 'var(--muted)' }}>
                          {diff === 0 ? '기준' : `+${fmtMan(diff)}`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>💡 스타일 선택 팁</strong>
            <p>
              • <strong>🎒 배낭</strong>: 호스텔·로컬식·대중교통. 하루 5~12만원, 자유로움<br />
              • <strong>🧳 중간</strong>: 3~4성 호텔·일반 식당·기본 투어. 하루 10~25만원, 가성비 최고<br />
              • <strong>🥂 럭셔리</strong>: 5성·고급식·프라이빗. 하루 25~60만원, 휴식·기념일<br />
              <br />
              일반 한국 여행객은 <strong>중간 스타일</strong>이 가장 만족도 ↑. 신혼·기념일은 럭셔리, 학생·장기여행은 배낭.
            </p>
          </div>
        </>
      )}

      {/* 안내 */}
      <div className={s.disclaimer}>
        <strong>📌 사용 안내</strong>
        <ul>
          <li>평균 데이터는 일반 참고치 — 시기·환율·개인 취향에 따라 큰 차이.</li>
          <li>항공권은 시즌·항공사·예매 시점에 따라 변동 큼 (스카이스캐너·구글 항공권 비교 권장).</li>
          <li>환율은 사용자 입력 (실시간 X) — 환율 별도 확인 필요.</li>
          <li>예비비 <strong>10~20%</strong> 권장 (예상치 못한 지출 대비).</li>
          <li>본 도구는 자가 견적이며, 실제 예약·결제 전 다시 확인.</li>
          <li>모든 데이터는 브라우저에 저장, 서버 전송 X.</li>
        </ul>
      </div>

      {/* 크로스링크 */}
      <Link href="/tools/life/travel-tip" className={s.crossLink}>
        💵 해외여행 팁 계산기 → 18개국 × 9 서비스 + 만족도 + 원화 환산
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────
   도넛 차트
   ───────────────────────────────────────────── */
interface DonutItem { id: string; label: string; total: number; color: string; emoji: string }

function DonutChart({ items, total }: { items: DonutItem[]; total: number }) {
  const filtered = items.filter((it) => it.total > 0)
  if (filtered.length === 0 || total <= 0) return <p style={{ fontSize: 12, color: 'var(--muted)' }}>입력값 없음</p>

  const cx = 100, cy = 100, rOuter = 80, rInner = 50

  function describeArc(startAngle: number, endAngle: number) {
    const x1 = cx + rOuter * Math.cos(startAngle)
    const y1 = cy + rOuter * Math.sin(startAngle)
    const x2 = cx + rOuter * Math.cos(endAngle)
    const y2 = cy + rOuter * Math.sin(endAngle)
    const x3 = cx + rInner * Math.cos(endAngle)
    const y3 = cy + rInner * Math.sin(endAngle)
    const x4 = cx + rInner * Math.cos(startAngle)
    const y4 = cy + rInner * Math.sin(startAngle)
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`
  }

  const slices = filtered.reduce<{ d: DonutItem; cum: number }[]>((acc, d) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : null
    const cum = last ? last.cum + last.d.total : 0
    acc.push({ d, cum })
    return acc
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14, alignItems: 'center' }}
      className="donut-wrap"
    >
      <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 220 }}>
        {slices.map(({ d, cum }) => {
          const startAngle = (cum / total) * Math.PI * 2 - Math.PI / 2
          const endAngle = ((cum + d.total) / total) * Math.PI * 2 - Math.PI / 2
          return <path key={d.id} d={describeArc(startAngle, endAngle)} fill={d.color} opacity={0.85} />
        })}
        <circle cx={cx} cy={cy} r={rInner - 2} fill="var(--bg2)" />
        <text x={cx} y={cy - 4} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Syne">총 (예비비 X)</text>
        <text x={cx} y={cy + 14} fill="var(--accent)" fontSize="13" textAnchor="middle" fontFamily="Syne" fontWeight="800">
          {fmtMan(total)}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map((d) => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} />
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{d.emoji} {d.label}</span>
            <span style={{ fontFamily: 'Syne, sans-serif', color: 'var(--muted)', fontWeight: 700 }}>
              {fmtMan(d.total)} ({((d.total / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
