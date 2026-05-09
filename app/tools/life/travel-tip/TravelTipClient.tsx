/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './travelTip.module.css'
import {
  COUNTRIES, SERVICES, SATISFACTIONS, CATEGORY_META, SCENARIOS,
  type Satisfaction, type ServiceId,
  getCountry, getService, calcTip, calcAllSatisfactions, calcScenarioTotal,
  fmt, fmtCurrency, fmtKrw,
} from './travelTipUtils'

type Tab = 'calc' | 'manner' | 'service' | 'scenario'

const STORAGE_KEY = 'youtil_traveltip_v1'

export default function TravelTipClient() {
  const [tab, setTab] = useState<Tab>('calc')

  /* 탭 1 입력 */
  const [countryId, setCountryId] = useState('us')
  const [serviceId, setServiceId] = useState<ServiceId>('restaurant')
  const [amount, setAmount] = useState('80')
  const [satisfaction, setSatisfaction] = useState<Satisfaction>('good')
  const [people, setPeople] = useState('2')
  const [taxIncluded, setTaxIncluded] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
  const [krwRate, setKrwRate] = useState('')

  /* 탭 2 / 3 검색 */
  const [search, setSearch] = useState('')
  const [activeService, setActiveService] = useState<ServiceId>('restaurant')

  /* 탭 4 */
  const [scenarioId, setScenarioId] = useState('us_honey')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.countryId) setCountryId(j.countryId)
      if (j.serviceId) setServiceId(j.serviceId)
      if (j.amount) setAmount(j.amount)
      if (j.satisfaction) setSatisfaction(j.satisfaction)
      if (j.people) setPeople(j.people)
      if (j.krwRate) setKrwRate(j.krwRate)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ countryId, serviceId, amount, satisfaction, people, krwRate }))
    } catch {}
  }, [countryId, serviceId, amount, satisfaction, people, krwRate])

  /* 계산 */
  const country = getCountry(countryId)
  const service = getService(serviceId)
  const amountN = parseFloat(amount) || 0
  const peopleN = parseInt(people) || 1
  const rateN = parseFloat(krwRate) || country.defaultRate
  const rateBase = country.defaultRateBase ?? 1
  const result = useMemo(
    () => calcTip(country, serviceId, amountN, satisfaction, peopleN, rateN, rateBase),
    [country, serviceId, amountN, satisfaction, peopleN, rateN, rateBase],
  )
  const allSat = useMemo(() => calcAllSatisfactions(country, serviceId, amountN, peopleN), [country, serviceId, amountN, peopleN])

  /* 국가 검색 필터 */
  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES
    const q = search.toLowerCase()
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q))
  }, [search])

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!
  const scenarioTotal = useMemo(() => calcScenarioTotal(scenario, satisfaction), [scenario, satisfaction])

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'calc',     label: '💵 팁 계산' },
          { id: 'manner',   label: '🌍 국가별 매너' },
          { id: 'service',  label: '🛎️ 서비스 가이드' },
          { id: 'scenario', label: '🧳 시나리오' },
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

      {/* ════════ 탭 1: 팁 계산 ════════ */}
      {tab === 'calc' && (
        <>
          {/* 국가 선택 */}
          <div className={s.card}>
            <span className={s.cardLabel}>국가 (18+)</span>
            <input
              type="text"
              className={s.input}
              placeholder="🔍 국가 검색 (예: 미국, 일본, 태국)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <div className={s.countryGrid}>
              {filteredCountries.map((c) => (
                <button
                  key={c.id}
                  className={`${s.countryBtn} ${countryId === c.id ? s.countryBtnActive : ''}`}
                  onClick={() => setCountryId(c.id)}
                  type="button"
                  style={{ borderTopColor: CATEGORY_META[c.category].color }}
                >
                  <span className={s.countryFlag}>{c.flag}</span>
                  <span className={s.countryName}>{c.shortName}</span>
                  <span className={s.countryCat} style={{ color: CATEGORY_META[c.category].color }}>
                    {CATEGORY_META[c.category].emoji} {CATEGORY_META[c.category].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 서비스 + 만족도 */}
          <div className={s.card}>
            <span className={s.cardLabel}>서비스 · 만족도</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>서비스</label>
              <div className={s.pillRow}>
                {SERVICES.map((sv) => (
                  <button
                    key={sv.id}
                    className={`${s.pill} ${serviceId === sv.id ? s.pillActive : ''}`}
                    onClick={() => setServiceId(sv.id)}
                    type="button"
                  >
                    {sv.emoji} {sv.shortLabel}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel}>만족도</label>
              <div className={s.pillRow}>
                {SATISFACTIONS.map((sat) => (
                  <button
                    key={sat.id}
                    className={`${s.pill} ${satisfaction === sat.id ? s.pillActive : ''}`}
                    onClick={() => setSatisfaction(sat.id)}
                    type="button"
                  >
                    {sat.emoji} {sat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 금액·인원·환율 */}
          <div className={s.card}>
            <span className={s.cardLabel}>금액 · 인원 · 환율</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>결제 금액 ({country.currencyUnit} {country.currency})</label>
                <input type="number" className={s.input} value={amount} onChange={(e) => setAmount(e.target.value)} min={0} step={1} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>인원 수</label>
                <input type="number" className={s.input} value={people} onChange={(e) => setPeople(e.target.value)} min={1} max={20} step={1} />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[1, 2, 4, 6, 8].map((p) => (
                    <button key={p} className={`${s.pill} ${peopleN === p ? s.pillActive : ''}`} onClick={() => setPeople(String(p))} type="button">
                      {p}명
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>환율 (1 {country.currency} = ? 원, 기본 {country.defaultRate})</label>
                <input
                  type="number"
                  className={s.input}
                  value={krwRate}
                  onChange={(e) => setKrwRate(e.target.value)}
                  placeholder={String(country.defaultRate)}
                  step={1}
                />
                {country.defaultRateBase && country.defaultRateBase > 1 && (
                  <p className={s.helpText}>※ {country.defaultRateBase}{country.currencyUnit} = {country.defaultRate}원 기준</p>
                )}
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>옵션</label>
                <div className={s.pillRow}>
                  <button className={`${s.pill} ${taxIncluded ? s.pillActive : ''}`} onClick={() => setTaxIncluded(!taxIncluded)} type="button">
                    {taxIncluded ? '✅' : '⬜'} 세금 포함
                  </button>
                  <button className={`${s.pill} ${paymentMethod === 'card' ? s.pillActive : ''}`} onClick={() => setPaymentMethod('card')} type="button">
                    💳 카드
                  </button>
                  <button className={`${s.pill} ${paymentMethod === 'cash' ? s.pillActive : ''}`} onClick={() => setPaymentMethod('cash')} type="button">
                    💵 현금
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 봉사료 자동 포함 안내 */}
          {country.serviceCharge && (
            <div className={s.warnCard}>
              <strong>📋 Service Charge 자동 포함 안내</strong>
              <p>
                {country.shortName}은 식당·호텔에 <strong>봉사료(Service Charge)가 자동 포함</strong>되는 경우가 많습니다.
                영수증의 <strong>&quot;Service Charge&quot;·&quot;Gratuity&quot;·&quot;봉사료&quot;</strong> 표시를 확인하세요.
                포함된 경우 추가 팁은 선택입니다.
              </p>
            </div>
          )}

          {/* 단체 자동 팁 안내 */}
          {result.groupAutoApplied && (
            <div className={s.warnCardStrong}>
              <strong>👥 단체 자동 팁 적용</strong>
              <p>
                {country.shortName}은 <strong>{country.groupAuto?.size}명 이상 단체 식당 이용 시 자동 {country.groupAuto?.pct}% 팁</strong>이 적용됩니다.
                영수증에 &quot;Auto Gratuity&quot; 항목을 확인하세요.
              </p>
            </div>
          )}

          {/* 메인 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>
              {country.flag} {country.shortName} · {service.emoji} {service.shortLabel}
            </p>
            <p className={s.heroValue}>
              팁 <strong>{fmtCurrency(result.tipAmount, country.currencyUnit, result.tipAmount > 100 ? 0 : 2)}</strong>
              {result.pct !== undefined && ` (${result.pct}%)`}
            </p>
            <p className={s.heroSub}>
              총 결제 <strong>{fmtCurrency(result.total, country.currencyUnit, result.total > 100 ? 0 : 2)}</strong>
              {' · '}1인당 <strong>{fmtCurrency(result.perPerson, country.currencyUnit, result.perPerson > 100 ? 0 : 2)}</strong>
              <br />원화 환산 팁 <strong style={{ color: 'var(--accent)' }}>{fmtKrw(result.tipKrw)}</strong>
              {' · '}총액 <strong style={{ color: 'var(--accent)' }}>{fmtKrw(result.totalKrw)}</strong>
            </p>
          </div>

          {/* 만족도별 비교 (% 모드만) */}
          {!result.isFlat && (
            <div className={s.card}>
              <span className={s.cardLabel}>만족도별 비교</span>
              <div className={s.satGrid}>
                {allSat.map((a) => (
                  <div
                    key={a.sat.id}
                    className={`${s.satCard} ${satisfaction === a.sat.id ? s.satCardActive : ''}`}
                    onClick={() => setSatisfaction(a.sat.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <p className={s.satLabel}>{a.sat.emoji} {a.sat.label}</p>
                    <p className={s.satPct}>{a.result.pct ?? 0}%</p>
                    <p className={s.satTip}>{fmtCurrency(a.result.tipAmount, country.currencyUnit, a.result.tipAmount > 100 ? 0 : 2)}</p>
                    <p className={s.satTotal}>총 {fmtCurrency(a.result.total, country.currencyUnit, a.result.total > 100 ? 0 : 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 상세 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>계산 상세</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>결제 금액</td><td className={s.cellMono}>{fmtCurrency(amountN, country.currencyUnit, amountN > 100 ? 0 : 2)}</td></tr>
                  <tr><td>{result.isFlat ? '정액 팁' : `팁 ${result.pct ?? 0}%`}</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtCurrency(result.tipAmount, country.currencyUnit, result.tipAmount > 100 ? 0 : 2)}</td></tr>
                  <tr><td>총 결제액</td><td className={s.cellMono}>{fmtCurrency(result.total, country.currencyUnit, result.total > 100 ? 0 : 2)}</td></tr>
                  <tr><td>{peopleN}명 1인당</td><td className={s.cellMono}>{fmtCurrency(result.perPerson, country.currencyUnit, result.perPerson > 100 ? 0 : 2)}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>원화 환산 (1{country.currency}{country.defaultRateBase && country.defaultRateBase > 1 ? `(${country.defaultRateBase}단위)` : ''} = {fmt(rateN, 2)}원)</td></tr>
                  <tr><td>팁 (원화)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtKrw(result.tipKrw)}</td></tr>
                  <tr><td>총액 (원화)</td><td className={s.cellMono}>{fmtKrw(result.totalKrw)}</td></tr>
                  <tr><td>1인당 (원화)</td><td className={s.cellMono}>{fmtKrw(result.perPersonKrw)}</td></tr>
                </tbody>
              </table>
            </div>
            <div className={s.tipBox}>
              💡 <strong>{country.shortName} 매너</strong> — {country.manner}
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 국가별 매너 매트릭스 ════════ */}
      {tab === 'manner' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>국가별 팁 문화 ({COUNTRIES.length}개국)</span>
            <input
              type="text"
              className={s.input}
              placeholder="🔍 국가 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <div className={s.legend}>
              {(Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]).map((k) => (
                <span key={k}>
                  <span className={s.legendDot} style={{ background: CATEGORY_META[k].color }}/>
                  {CATEGORY_META[k].emoji} {CATEGORY_META[k].label}
                </span>
              ))}
            </div>
          </div>

          <div className={s.mannerGrid}>
            {filteredCountries.map((c) => {
              const meta = CATEGORY_META[c.category]
              const restRate = c.rates.restaurant
              return (
                <div key={c.id} className={s.mannerCard} style={{ borderLeftColor: meta.color }}>
                  <p className={s.mannerHead}>
                    <span className={s.mannerFlag}>{c.flag}</span>
                    <strong>{c.shortName}</strong>
                    <span className={s.mannerBadge} style={{ background: meta.color, color: '#0D0D0D' }}>
                      {meta.emoji} {meta.label}
                    </span>
                  </p>
                  <p className={s.mannerRate}>
                    🍽️ 식당 <strong>{restRate?.pct ? `${restRate.pct.min}~${restRate.pct.max}%` : '—'}</strong>
                    {c.serviceCharge && ' · Service Charge 자동'}
                  </p>
                  <p className={s.mannerNote}>{c.manner}</p>
                  {c.groupAuto && (
                    <p className={s.mannerGroup}>👥 단체 {c.groupAuto.size}명+ 자동 {c.groupAuto.pct}%</p>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ════════ 탭 3: 서비스별 가이드 ════════ */}
      {tab === 'service' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>서비스 종류 (9가지)</span>
            <div className={s.pillRow}>
              {SERVICES.map((sv) => (
                <button
                  key={sv.id}
                  className={`${s.pill} ${activeService === sv.id ? s.pillActive : ''}`}
                  onClick={() => setActiveService(sv.id)}
                  type="button"
                >
                  {sv.emoji} {sv.shortLabel}
                </button>
              ))}
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              {SERVICES.find((s) => s.id === activeService)!.emoji}{' '}
              <strong>{SERVICES.find((s) => s.id === activeService)!.label}</strong> —{' '}
              {SERVICES.find((s) => s.id === activeService)!.desc}
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>국가별 권장 팁</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>국가</th>
                    <th>분류</th>
                    <th>권장 팁</th>
                    <th>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {COUNTRIES.map((c) => {
                    const r = c.rates[activeService]
                    const meta = CATEGORY_META[c.category]
                    let value = '—'
                    if (r?.pct) value = `${r.pct.min}~${r.pct.max}%`
                    if (r?.flat) value = `${c.currencyUnit}${r.flat.min}~${r.flat.max} ${r.flat.unit.split('/').slice(1).join('/')}`
                    return (
                      <tr key={c.id}>
                        <td>{c.flag} {c.shortName}</td>
                        <td><span style={{ color: meta.color, fontSize: 11, fontWeight: 700 }}>{meta.emoji} {meta.label}</span></td>
                        <td className={`${s.cellMono} ${s.cellAccent}`}>{value}</td>
                        <td style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 200 }}>{r?.note ?? ''}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>💡 서비스별 매너</strong>
            <p>
              • <strong>식당</strong>: 미국·캐나다는 의무, 유럽은 선택, 일본·중국은 X<br />
              • <strong>택시</strong>: 영어권은 잔돈 반올림 + 5~10%, 동남아는 잔돈만<br />
              • <strong>호텔</strong>: 벨보이 짐 1개당 $1~2, 룸 메이드는 베개 위 $2~5<br />
              • <strong>골프 캐디</strong>: 동남아는 라운드당 정액 (200~500페소 / 800바트)<br />
              • <strong>마사지·스파</strong>: 태국 50~100바트, 발리 Rp 30K가 표준
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 시나리오 ════════ */}
      {tab === 'scenario' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>한국인 자주 가는 6 시나리오</span>
            <div className={s.scenarioGrid}>
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  className={`${s.scenarioBtn} ${scenarioId === sc.id ? s.scenarioBtnActive : ''}`}
                  onClick={() => setScenarioId(sc.id)}
                  type="button"
                >
                  <span className={s.scenarioEmoji}>{sc.emoji}</span>
                  <span className={s.scenarioTitle}>{sc.title}</span>
                  <span className={s.scenarioDesc}>{sc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>{scenario.emoji} {scenario.title}</p>
            <p className={s.heroValue}>
              팁 합계 <strong>{fmtKrw(scenarioTotal.tipKrw)}</strong>
            </p>
            <p className={s.heroSub}>
              {scenario.days}일 · 기본 {scenario.defaultPeople}명 · {SATISFACTIONS.find((s) => s.id === satisfaction)!.label} 만족도 기준
              <br />
              {scenarioTotal.tipNative.length > 0 && (
                <>현지 통화 ≈ {scenarioTotal.tipNative.map((t) => `${t.currency}${fmt(t.amount, t.amount > 100 ? 0 : 2)}`).join(' / ')}</>
              )}
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>만족도</span>
            <div className={s.pillRow}>
              {SATISFACTIONS.map((sat) => (
                <button
                  key={sat.id}
                  className={`${s.pill} ${satisfaction === sat.id ? s.pillActive : ''}`}
                  onClick={() => setSatisfaction(sat.id)}
                  type="button"
                >
                  {sat.emoji} {sat.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>일정·항목별 분배 (참고)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>국가</th>
                    <th>일별 횟수</th>
                    <th>1회 금액</th>
                  </tr>
                </thead>
                <tbody>
                  {scenario.items.map((it, i) => {
                    const c = getCountry(it.countryId)
                    const sv = getService(it.service)
                    return (
                      <tr key={i}>
                        <td>{sv.emoji} {sv.shortLabel}</td>
                        <td>{c.flag} {c.shortName}</td>
                        <td className={s.cellMono}>{(it.perDay ?? 1).toFixed(1)}회/일</td>
                        <td className={s.cellMono}>
                          {it.amount > 0 ? fmtCurrency(it.amount, c.currencyUnit, it.amount > 100 ? 0 : 2) : '정액 팁'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              ※ 시뮬은 참고치로, 실제 여행 일정·인원·금액에 따라 조정하세요. 정확한 계산은 탭 1에서 항목별로 입력 가능.
            </p>
          </div>

          {scenario.id === 'jp_family' && (
            <div className={s.warnCardStrong}>
              <strong>🇯🇵 일본 — 팁 X 대신 답례 문화</strong>
              <p>
                일본은 팁 문화가 없습니다. 료칸이나 좋은 서비스에 감사를 표하고 싶다면:<br />
                • 작은 봉투(ぽち袋)에 ¥1,000~3,000<br />
                • 한국식 선물 (떡·과자) 답례<br />
                • 기프트 카드·소품<br />
                현금을 그대로 건네면 무례하게 받아들여질 수 있어요.
              </p>
            </div>
          )}

          {scenario.id === 'cruise' && (
            <div className={s.warnCard}>
              <strong>🚢 크루즈 자동 팁</strong>
              <p>
                대부분의 크루즈는 1인당 <strong>$15~20/일</strong>의 팁이 자동 청구됩니다 (Gratuity).<br />
                7박 = 1인 약 $100~140, 2인 $200~280.<br />
                객실 스튜어드·다이닝 웨이터·바 직원에게 추가 팁은 선택. 크루즈 종료일 한 번에 정산 가능.
              </p>
            </div>
          )}
        </>
      )}

      {/* 안내 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/travel-budget', label: '여행 예산' },
          { href: '/tools/life/lotto', label: '로또 번호 생성기' },
          { href: '/tools/life/dutch', label: '더치페이 계산기' }
        ]}
      >
        사용 안내 팁 문화는 국가·지역·서비스 수준·시기에 따라 다릅니다. 본 도구는 일반적인 가이드이며, 최종 결정은 본인 판단에 맡깁니다. 환율은 사용자 입력값이며 실시간이 아닙니다 — 환율 별도 확인 권장.
      </Disclaimer>

      {/* 크로스링크 */}
      <Link href="/tools/date/jet-lag" className={s.crossLink}>
        ✈️ 시차 적응 계산기 → 여행 전·중·후 수면 타이밍
      </Link>
    </div>
  )
}
