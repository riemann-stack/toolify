'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './auction.module.css'
import {
  PROPERTIES, OWNERS, REGIONS, COST_ITEMS, AUTO_ITEMS, MANUAL_ITEMS,
  type PropertyType, type OwnerType, type Region,
  calcAcquisitionTax, acquisitionTaxBreakdown, getAcquisitionRate, getOwner,
  isPropertyType, isOwnerType, isRegion,
  calcLegalFee, calcStampTax, calcHousingBond,
  calcLoan, recommendLtv, recommendStressRate, mortgageCapMan, fmt, fmtMan,
} from './auctionUtils'

type Tab = 'cost' | 'loan' | 'scenario' | 'analyze'

const STORAGE_KEY = 'youtil_auction_v1'

export default function AuctionClient() {
  const [tab, setTab] = useState<Tab>('cost')

  /* 공통 입력 */
  const [priceMan, setPriceMan] = useState('30000')   // 3억
  const [property, setProperty] = useState<PropertyType>('apt')
  const [owner, setOwner] = useState<OwnerType>('live1')
  const [region, setRegion] = useState<Region>('normal')
  /* 저가주택 중과 제외 — 공시가격 1억 이하(비수도권 2억 이하) */
  const [lowValue, setLowValue] = useState(false)

  /* 자동/수동 토글 */
  const [autoOn, setAutoOn] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    AUTO_ITEMS.forEach((c) => init[c.id] = true)
    return init
  })

  /* 수동 입력값 (만원) — 자동 항목은 토글 OFF시 사용, 수동 항목은 항상 사용 */
  const [costs, setCosts] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    COST_ITEMS.forEach((c) => init[c.id] = String(c.defaultMan))
    return init
  })

  /* 탭 2: 대출 */
  /* LTV·스트레스 금리 기본값은 지역·명의에 연동 (10·15 대책) — 지역/명의를 바꾸면 다시 추천값으로 */
  const [ltvPct, setLtvPct] = useState(() => recommendLtv('normal', 'live1'))
  const [stressPct, setStressPct] = useState(() => String(recommendStressRate('normal')))
  const [ratePct, setRatePct] = useState('4.5')
  const [years, setYears] = useState('30')
  const [income, setIncome] = useState('5000')
  const [existingMonth, setExistingMonth] = useState('0')
  const [cashOwn, setCashOwn] = useState('5000')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return
      const j = parsed as Record<string, unknown>
      if (typeof j.priceMan === 'string' && /^\d{0,7}(\.\d*)?$/.test(j.priceMan)) setPriceMan(j.priceMan)
      if (isPropertyType(j.property)) setProperty(j.property)
      const o: OwnerType = isOwnerType(j.owner) ? j.owner : 'live1'
      const r: Region = isRegion(j.region) ? j.region : 'normal'
      setOwner(o)
      setRegion(r)
      setLtvPct(recommendLtv(r, o))
      setStressPct(String(recommendStressRate(r)))
      if (typeof j.lowValue === 'boolean') setLowValue(j.lowValue)
      /* 비용·토글 — 알려진 항목 id + 타입이 맞는 값만 병합 */
      if (j.costs && typeof j.costs === 'object') {
        const src = j.costs as Record<string, unknown>
        const next: Record<string, string> = {}
        COST_ITEMS.forEach((c) => {
          const v = src[c.id]
          if (typeof v === 'string' && /^-?\d{0,7}(\.\d*)?$/.test(v)) next[c.id] = v
        })
        setCosts((prev) => ({ ...prev, ...next }))
      }
      if (j.autoOn && typeof j.autoOn === 'object') {
        const src = j.autoOn as Record<string, unknown>
        const next: Record<string, boolean> = {}
        AUTO_ITEMS.forEach((c) => {
          if (typeof src[c.id] === 'boolean') next[c.id] = src[c.id] as boolean
        })
        setAutoOn((prev) => ({ ...prev, ...next }))
      }
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ priceMan, property, owner, region, lowValue, costs, autoOn }))
    } catch {}
  }, [priceMan, property, owner, region, lowValue, costs, autoOn])

  /* 지역·명의 변경 시 LTV·스트레스 금리를 규제 기준 추천값으로 재설정 (사용자가 이후 수동 조정 가능) */
  const selectOwner = (o: OwnerType) => {
    setOwner(o)
    setLtvPct(recommendLtv(region, o))
  }
  const selectRegion = (r: Region) => {
    setRegion(r)
    setLtvPct(recommendLtv(r, owner))
    setStressPct(String(recommendStressRate(r)))
  }

  /* 계산 (음수·NaN 입력 방어: 0 이상으로 보정) */
  const price = Math.max(0, parseFloat(priceMan) || 0)
  const isHouseProp = PROPERTIES.find((p) => p.id === property)?.isHouse ?? false

  /* 자동 항목 값 (토글 ON이면 자동, OFF면 수동 입력값) */
  const autoValue = (id: string): number => {
    if (!autoOn[id]) return Math.max(0, parseFloat(costs[id]) || 0)
    switch (id) {
      case 'tax_acq': return calcAcquisitionTax(price, property, owner, region, isHouseProp && lowValue)
      case 'legal':   return calcLegalFee(price)
      case 'stamp':   return calcStampTax(price)
      case 'bond':    return calcHousingBond(price, property)
      default: return 0
    }
  }

  /* 항목별 비용 */
  const itemCosts = useMemo(() => {
    return COST_ITEMS.map((c) => ({
      ...c,
      value: c.isAuto ? autoValue(c.id) : Math.max(0, parseFloat(costs[c.id]) || 0),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, property, owner, region, lowValue, costs, autoOn])

  const totalAuto = itemCosts.filter((c) => c.isAuto).reduce((s, c) => s + c.value, 0)
  const totalManual = itemCosts.filter((c) => !c.isAuto).reduce((s, c) => s + c.value, 0)
  const totalExtra = totalAuto + totalManual
  const totalInvest = price + totalExtra
  const extraRatio = price > 0 ? (totalExtra / price) * 100 : 0
  const lowValueOn = isHouseProp && lowValue
  const acqRate = getAcquisitionRate(price, property, owner, region, lowValueOn)
  const acqBreakdown = acquisitionTaxBreakdown(price, property, owner, region, lowValueOn)
  /* 비중(%) — 총투자금 0일 때 NaN 방지 */
  const pctOf = (v: number) => (totalInvest > 0 ? (v / totalInvest) * 100 : 0).toFixed(1)

  /* 대출 계산 */
  const loanCap = isHouseProp ? mortgageCapMan(price, region) : Infinity
  const loanResult = useMemo(
    () => calcLoan(
      price, totalInvest, ltvPct, parseFloat(ratePct) || 0, parseFloat(years) || 1, parseFloat(income) || 0, parseFloat(existingMonth) || 0,
      loanCap, Math.min(10, Math.max(0, parseFloat(stressPct) || 0)),
    ),
    [price, totalInvest, ltvPct, ratePct, years, income, existingMonth, loanCap, stressPct],
  )
  const cashOwnN = parseFloat(cashOwn) || 0
  const cashShortage = Math.max(0, loanResult.ownEquity - cashOwnN)

  /* 시나리오 비교 */
  const scenarios = (['live1', 'own1', 'multi2', 'multi3', 'corp'] as OwnerType[]).map((o) => {
    const tax = calcAcquisitionTax(price, property, o, region, lowValueOn)
    const auto = AUTO_ITEMS.reduce((sum, c) => {
      if (c.id === 'tax_acq') return sum + tax
      return sum + autoValue(c.id)
    }, 0)
    const total = price + auto + totalManual
    return { owner: o, tax, autoSum: auto, total, diff: 0 }
  })
  const baseTotal = scenarios[0].total
  scenarios.forEach((sc) => { sc.diff = sc.total - baseTotal })
  const maxScenarioDiff = Math.max(...scenarios.map((sc) => sc.diff))
  const maxScenarioTotal = Math.max(...scenarios.map((sc) => sc.total))

  /* 도넛 차트 데이터 (탭 4) */
  const donutData = [
    { id: 'price', label: '낙찰가', value: price, color: '#0D9488' },
    { id: 'tax', label: '세금·법무', value: itemCosts.filter((c) => c.category === 'tax' || c.category === 'legal').reduce((s, c) => s + c.value, 0), color: '#0891B2' },
    { id: 'auction', label: '명도·체납·수리', value: itemCosts.filter((c) => c.category === 'auction').reduce((s, c) => s + c.value, 0), color: '#EA580C' },
    { id: 'extra', label: '기타', value: itemCosts.filter((c) => c.category === 'extra').reduce((s, c) => s + c.value, 0), color: '#9B59B6' },
  ]

  const updateCost = (id: string, v: string) => setCosts((prev) => ({ ...prev, [id]: v }))
  const toggleAuto = (id: string) => setAutoOn((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className={s.wrap}>
      {/* 안내 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
        sources={[
          { label: '대법원 법원경매정보', href: 'https://www.courtauction.go.kr' },
          { label: '국토교통부 실거래가', href: 'https://rt.molit.go.kr' },
          { label: '위택스 (취득세·지방세)', href: 'https://www.wetax.go.kr' },
          { label: '전자수입인지 (인지세)', href: 'https://www.e-revenuestamp.or.kr' },
          { label: '금융위원회 (LTV·DSR)', href: 'https://www.fsc.go.kr' },
        ]}
      >
        사용 안내 세율·LTV·DSR은 매년 변동됩니다 — <strong>국세청·국토부·금감원 최신 공시</strong> 우선. 경매 부대비용은 <strong>물건별로 매우 다릅니다</strong> (특히 명도·수리·체납). <strong>유치권·법정지상권</strong> 같은 법적 분쟁은 변호사·법무사 상담 필수.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="경매 계산 모드">
        {([
          { id: 'cost',     label: '총비용 계산' },
          { id: 'loan',     label: '대출·자기자본' },
          { id: 'scenario', label: '시나리오 비교' },
          { id: 'analyze',  label: '비용 분석' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 공통 입력 (탭 1·2·3·4 공유) ════════ */}
      <div className={s.card}>
        <span className={s.cardLabel}>물건·명의·지역</span>
        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor="auction-f1">낙찰가 (만원)</label>
          <input id="auction-f1"
            type="number" inputMode="decimal"
            className={s.input}
            value={priceMan}
            onChange={(e) => setPriceMan(e.target.value)}
            min={1000} max={1000000} step={100}
          />
          <p className={s.helpText}>= <strong className={s.cellAccent}>{fmtMan(price)}</strong></p>
          <div className={s.pillRow} style={{ marginTop: 8 }}>
            {[10000, 20000, 30000, 50000, 100000].map((p) => (
              <button key={p} className={s.pill} onClick={() => setPriceMan(String(p))} type="button">
                {fmtMan(p)}
              </button>
            ))}
          </div>
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>부동산 종류</label>
          <div className={s.pillRow} role="group" aria-label="부동산 종류">
            {PROPERTIES.map((p) => (
              <button
                key={p.id}
                aria-pressed={property === p.id}
                className={`${s.pill} ${property === p.id ? s.pillActive : ''}`}
                onClick={() => setProperty(p.id)}
                type="button"
              >
                {p.emoji} {p.shortLabel}
              </button>
            ))}
          </div>
        </div>

        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel}>명의 유형</label>
            <div className={s.pillRow} role="group" aria-label="명의 유형">
              {OWNERS.map((o) => (
                <button
                  key={o.id}
                  aria-pressed={owner === o.id}
                  className={`${s.pill} ${owner === o.id ? s.pillActive : ''}`}
                  onClick={() => selectOwner(o.id)}
                  type="button"
                  title={o.desc}
                >
                  {o.shortLabel}
                </button>
              ))}
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>지역</label>
            <div className={s.pillRow} role="group" aria-label="지역">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  aria-pressed={region === r.id}
                  className={`${s.pill} ${region === r.id ? s.pillActive : ''}`}
                  onClick={() => selectRegion(r.id)}
                  type="button"
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className={s.helpText}>
              {getOwner(owner).label} — {getOwner(owner).desc}
            </p>
          </div>
        </div>
        {isHouseProp && (
          <label className={s.helpText} htmlFor="auction-lowvalue" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input
              id="auction-lowvalue"
              type="checkbox"
              checked={lowValue}
              onChange={(e) => setLowValue(e.target.checked)}
              style={{ width: 16, height: 16, marginTop: 2 }}
            />
            <span>
              공시가격(시가표준액) <strong>1억 이하</strong> 주택 — 비수도권은 <strong>2억 이하</strong>(2025.1.2 이후 취득). 정비구역 안 주택이 아니면 다주택·법인이어도 취득세 중과에서 빠집니다. 낙찰가가 아니라 공시가격 기준이에요.
            </span>
          </label>
        )}
        <p className={s.helpText}>
          💡 적용 취득세율: <strong className={s.cellAccent}>{acqRate.toFixed(2)}%</strong>{' '}
          ({fmtMan(acqBreakdown.total / 10_000)}) · {acqBreakdown.label}
          {isHouseProp ? ' · 지방교육세 포함, 전용 85㎡ 이하 기준(초과 시 농어촌특별세 0.2~1.0% 추가)' : ' · 지방교육세·농어촌특별세 포함'}
        </p>
      </div>

      {/* ════════ 탭 1: 총비용 계산 ════════ */}
      {tab === 'cost' && (
        <>
          {/* 자동 추정 항목 */}
          <div className={s.card}>
            <span className={s.cardLabel}>자동 추정 항목 (세금·법무)</span>
            <div className={s.costGrid}>
              {AUTO_ITEMS.map((c) => {
                const isAutoMode = autoOn[c.id]
                const value = isAutoMode ? autoValue(c.id) : Math.max(0, parseFloat(costs[c.id]) || 0)
                return (
                  <div key={c.id} className={s.costItem}>
                    <label className={s.costLabel} htmlFor={isAutoMode ? `auction-auto-${c.id}` : `auction-cost-${c.id}`}>
                      <span className={s.costEmoji}>{c.emoji}</span>
                      <strong>{c.label}</strong>
                      <span className={s.costDesc}>{c.desc}</span>
                    </label>
                    <div className={s.autoToggle}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
                        <input
                          id={`auction-auto-${c.id}`}
                          type="checkbox"
                          checked={isAutoMode}
                          onChange={() => toggleAuto(c.id)}
                          style={{ width: 14, height: 14 }}
                          aria-label={`${c.label} 자동 계산`}
                        />
                        자동
                      </label>
                      {isAutoMode ? (
                        <div className={s.autoValue}>{fmt(value, 0)} 만원</div>
                      ) : (
                        <input
                          id={`auction-cost-${c.id}`}
                          type="number" inputMode="decimal"
                          className={s.input}
                          value={costs[c.id]}
                          onChange={(e) => updateCost(c.id, e.target.value)}
                          min={0} max={100000} step={1}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className={s.helpText}>
              자동 추정 합계: <strong className={s.cellAccent}>{fmt(totalAuto, 0)} 만원</strong>
            </p>
          </div>

          {/* 수동 입력 항목 */}
          <div className={s.card}>
            <span className={s.cardLabel}>경매 특화 비용 (수동 입력)</span>
            <div className={s.costGrid}>
              {MANUAL_ITEMS.map((c) => (
                <div key={c.id} className={s.costItem}>
                  <label className={s.costLabel} htmlFor={`auction-cost-${c.id}`}>
                    <span className={s.costEmoji}>{c.emoji}</span>
                    <strong>{c.label}</strong>
                    <span className={s.costDesc}>{c.desc}</span>
                  </label>
                  <input
                    id={`auction-cost-${c.id}`}
                    type="number" inputMode="decimal"
                    className={s.input}
                    value={costs[c.id]}
                    onChange={(e) => updateCost(c.id, e.target.value)}
                    min={0} max={100000} step={10}
                  />
                  {c.saveTip && (
                    <p className={s.saveTip}>💡 {c.saveTip}</p>
                  )}
                </div>
              ))}
            </div>
            <p className={s.helpText}>
              수동 입력 합계: <strong className={s.cellAccent}>{fmt(totalManual, 0)} 만원</strong>
            </p>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero} role="status">
            <p className={s.heroLabel}>총 투자금</p>
            <p className={s.heroValue}>
              <strong>{fmtMan(totalInvest)}</strong>
            </p>
            <p className={s.heroSub}>
              낙찰가 {fmtMan(price)} + 부대비용{' '}
              <strong style={{ color: 'var(--accent)' }}>{fmtMan(totalExtra)}</strong>
              {' · '}부대비용 비율 <strong style={{ color: 'var(--accent)' }}>{extraRatio.toFixed(1)}%</strong>
            </p>
          </div>

          {/* 항목별 비용표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>항목별 비용 상세</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">항목</th>
                    <th scope="col">금액</th>
                    <th scope="col">비중</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🏠 낙찰가</td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(price)}</td>
                    <td className={s.cellMono}>{pctOf(price)}%</td>
                  </tr>
                  <tr className={s.cellSubtitle}><td colSpan={3}>자동 추정 (세금·법무)</td></tr>
                  {itemCosts.filter((c) => c.isAuto).map((c) => (
                    <tr key={c.id}>
                      <td>{c.emoji} {c.label.split(' ')[0]}</td>
                      <td className={s.cellMono}>{fmt(c.value, 0)} 만원</td>
                      <td className={s.cellMono}>{pctOf(c.value)}%</td>
                    </tr>
                  ))}
                  <tr className={s.cellSubtitle}><td colSpan={3}>수동 입력 (경매 특화)</td></tr>
                  {itemCosts.filter((c) => !c.isAuto && c.value > 0).map((c) => (
                    <tr key={c.id}>
                      <td>{c.emoji} {c.label.split(' ')[0]}</td>
                      <td className={s.cellMono}>{fmt(c.value, 0)} 만원</td>
                      <td className={s.cellMono}>{pctOf(c.value)}%</td>
                    </tr>
                  ))}
                  <tr className={s.cellTotal}>
                    <td><strong>총 투자금</strong></td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtMan(totalInvest)}</strong></td>
                    <td className={s.cellMono}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 대출·자기자본 ════════ */}
      {tab === 'loan' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>대출 조건</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>LTV 한도 (%)</label>
                <div className={s.pillRow} role="group" aria-label="LTV 한도">
                  {[70, 60, 50, 40, 30, 0].map((v) => (
                    <button
                      key={v}
                      aria-pressed={ltvPct === v}
                      className={`${s.pill} ${ltvPct === v ? s.pillActive : ''}`}
                      onClick={() => setLtvPct(v)}
                      type="button"
                    >
                      {v}%
                    </button>
                  ))}
                </div>
                <p className={s.helpText}>
                  {region === 'normal'
                    ? '비규제지역 70% (다주택·법인 60%). 수도권은 6·27 대책 이후 다주택자의 추가 구입 주담대가 금지됐고, 1주택자는 기존 주택 처분 조건부로만 허용'
                    : owner === 'live1'
                      ? '규제지역 무주택자 40%, 생애최초 구입자는 70% (10·15 대책)'
                      : '규제지역 유주택자·법인의 추가 주택 구입 주담대는 원칙적으로 0% (처분조건부 1주택은 40%)'}
                </p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="auction-rate">대출 금리 (연 %)</label>
                <input id="auction-rate"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={ratePct}
                  onChange={(e) => setRatePct(e.target.value)}
                  min={1} max={15} step={0.1}
                />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="auction-period">대출 기간 (년)</label>
                <input id="auction-period"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  min={1} max={50} step={1}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[10, 20, 30, 40].map((y) => (
                    <button key={y} className={s.pill} onClick={() => setYears(String(y))} type="button">{y}년</button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="auction-income">본인 연소득 (만원)</label>
                <input id="auction-income"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  min={1000} max={100000} step={100}
                />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="auction-f5">기존 월 상환액 (만원)</label>
                <input id="auction-f5"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={existingMonth}
                  onChange={(e) => setExistingMonth(e.target.value)}
                  min={0} max={500} step={1}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="auction-f6">보유 현금 (만원)</label>
                <input id="auction-f6"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={cashOwn}
                  onChange={(e) => setCashOwn(e.target.value)}
                  min={0} max={500000} step={100}
                />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="auction-stress">스트레스 금리 가산 (%p, DSR 심사용)</label>
                <input id="auction-stress"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={stressPct}
                  onChange={(e) => setStressPct(e.target.value)}
                  min={0} max={10} step={0.1}
                />
                <p className={s.helpText}>DSR 한도를 계산할 때만 금리에 더합니다. 규제지역 주담대는 3%p, 그 밖의 수도권은 1.5%p가 기본이고 지방은 더 낮을 수 있어요.</p>
              </div>
            </div>
          </div>

          <div className={s.hero} role="status">
            <p className={s.heroLabel}>대출 가능액 / 자기자본</p>
            <p className={s.heroValue}>
              <strong>{fmtMan(loanResult.loanAmount)}</strong> 대출
            </p>
            <p className={s.heroSub}>
              자기자본 필요 <strong style={{ color: 'var(--accent)' }}>{fmtMan(loanResult.ownEquity)}</strong>
              {' · '}월 상환 <strong style={{ color: 'var(--accent)' }}>{fmt(loanResult.monthlyPayment, 1)} 만원</strong>
            </p>
          </div>

          {cashShortage > 0 && (
            <div className={s.warnCardStrong}>
              <strong>🚨 현금 부족 경고</strong>
              <p>
                자기자본 <strong>{fmtMan(loanResult.ownEquity)}</strong>이 필요한데 보유 현금은{' '}
                <strong>{fmtMan(cashOwnN)}</strong> — <strong style={{ color: '#DB2777' }}>{fmtMan(cashShortage)} 부족</strong>합니다.
                <br />→ 추가 자금 마련 / 대출 한도 상향 / 낙찰가 조정 필요
              </p>
            </div>
          )}

          <div className={s.card}>
            <span className={s.cardLabel}>대출 한도 분석</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>총 투자금</td><td className={s.cellMono}>{fmtMan(totalInvest)}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>대출 한도 비교</td></tr>
                  <tr><td>LTV {ltvPct}% 한도</td><td className={s.cellMono}>{fmtMan(loanResult.ltvLimit)}</td></tr>
                  <tr><td>DSR 40% 한도 (스트레스 금리 반영)</td><td className={s.cellMono}>{fmtMan(loanResult.dsrLimit)}</td></tr>
                  {Number.isFinite(loanResult.capLimit) && (
                    <tr><td>규제지역 주담대 금액 상한</td><td className={s.cellMono}>{fmtMan(loanResult.capLimit)}</td></tr>
                  )}
                  <tr><td>실제 가능 대출 (가장 작은 값)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(loanResult.loanAmount)}</td></tr>
                  <tr><td>한도 결정 요인</td><td>{loanResult.capacityType === 'ltv' ? 'LTV' : loanResult.capacityType === 'cap' ? '금액 상한' : 'DSR'}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>월 상환 시뮬</td></tr>
                  <tr><td>월 원리금</td><td className={s.cellMono}>{fmt(loanResult.monthlyPayment, 1)} 만원</td></tr>
                  <tr><td>총 이자 부담 ({years}년)</td><td className={s.cellMono}>{fmtMan(loanResult.monthlyPayment * 12 * (parseFloat(years) || 1) - loanResult.loanAmount)}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>자기자본</td></tr>
                  <tr><td>자기자본 필요</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtMan(loanResult.ownEquity)}</td></tr>
                  <tr><td>보유 현금</td><td className={s.cellMono}>{fmtMan(cashOwnN)}</td></tr>
                  <tr><td>{cashShortage > 0 ? '❌ 부족' : '✅ 잉여'}</td><td className={s.cellMono} style={{ color: cashShortage > 0 ? '#DB2777' : 'var(--accent)' }}>{cashShortage > 0 ? `-${fmtMan(cashShortage)}` : `+${fmtMan(cashOwnN - loanResult.ownEquity)}`}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>LTV·DSR 안내</strong>
            <p>
              • <strong>LTV (담보인정비율)</strong>: 부동산 가치 대비 대출 한도 — 비규제지역 70%(다주택·법인 60%), 규제지역 무주택자 40%(생애최초 70%), 규제지역 유주택자의 추가 구입은 0% (2025.10.16 시행 10·15 대책, 경락잔금대출도 동일)<br />
              • <strong>금액 상한</strong>: 수도권·규제지역 주담대는 담보가 15억 이하 6억, 15~25억 4억, 25억 초과 2억까지<br />
              • <strong>DSR (총부채원리금상환비율)</strong>: 연소득 대비 연 원리금 40% 한도 — 심사 때는 실제 금리에 스트레스 금리를 더해 계산<br />
              • 이 중 <strong>가장 작은 값</strong>이 실제 대출 가능액<br />
              • 대출 규제는 자주 바뀌니 입찰 전 <strong>은행·금융위원회</strong>에서 최신 기준을 확인하세요
            </p>
          </div>

          <Link href="/tools/finance/loan" className={s.crossLink}>
            대출이자 계산기 → 원리금균등·원금균등·중도상환·갈아타기 시뮬
          </Link>
        </>
      )}

      {/* ════════ 탭 3: 시나리오 비교 ════════ */}
      {tab === 'scenario' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>같은 낙찰가 {fmtMan(price)} · 명의별 비교</p>
            <p className={s.heroValue}>
              최대 차액 <strong>{fmtMan(maxScenarioDiff)}</strong>
            </p>
            <p className={s.heroSub}>
              {isHouseProp
                ? '실거주 1주택 vs 다주택·법인 — 취득세 차이가 가장 큼'
                : '비주택(오피스텔·상가·토지)은 명의 무관 동일 세율 4.6% — 명의별 차이 없음'}
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>5 시나리오 비교</span>
            <div className={s.scenarioGrid}>
              {scenarios.map((sc) => {
                const oMeta = OWNERS.find((o) => o.id === sc.owner)!
                const isCurrent = owner === sc.owner
                return (
                  <div
                    key={sc.owner}
                    className={`${s.scenarioCard} ${isCurrent ? s.scenarioActive : ''}`}
                  >
                    <p className={s.scenarioTitle}>{oMeta.label}</p>
                    <p className={s.scenarioDesc}>{oMeta.desc}</p>
                    <div className={s.scenarioRow}>
                      <span className={s.scenarioLabel}>취득세</span>
                      <strong>{fmtMan(sc.tax)}</strong>
                    </div>
                    <div className={s.scenarioRow}>
                      <span className={s.scenarioLabel}>총 투자금</span>
                      <strong className={s.cellAccent}>{fmtMan(sc.total)}</strong>
                    </div>
                    {sc.diff !== 0 && (
                      <p className={s.scenarioDiff} style={{ color: sc.diff > 0 ? '#DB2777' : '#059669' }}>
                        {sc.diff > 0 ? '▲' : '▼'} {fmtMan(Math.abs(sc.diff))} ({sc.diff > 0 ? '+' : ''}{((sc.diff / baseTotal) * 100).toFixed(1)}%)
                      </p>
                    )}
                    {sc.diff === 0 && <p className={s.scenarioDiff} style={{ color: 'var(--muted)' }}>기준</p>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 막대 그래프 */}
          <div className={s.card}>
            <span className={s.cardLabel}>총 투자금 비교 (시각화)</span>
            <div className={s.barChart}>
              {scenarios.map((sc) => {
                const maxVal = maxScenarioTotal
                const w = maxVal > 0 ? (sc.total / maxVal) * 100 : 0
                const oMeta = OWNERS.find((o) => o.id === sc.owner)!
                return (
                  <div key={sc.owner} className={s.barRow}>
                    <span className={s.barLabel}>{oMeta.shortLabel}</span>
                    <div className={s.barTrack}>
                      <div className={s.barFill} style={{ width: `${w}%` }}>
                        <span className={s.barValue}>{fmtMan(sc.total)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>시나리오 활용 팁</strong>
            <p>
              • <strong>무주택 → 1주택</strong>: 취득세 1.1~3.3% — 가장 유리 (양도세 비과세 요건은 보유·거주 2년으로 별개)<br />
              • <strong>2주택째</strong>: 비규제지역 1주택 세율, 조정대상지역 8.4% 적용<br />
              • <strong>3주택째</strong>: 비규제지역 8.4%, 조정대상지역 12.4%<br />
              • <strong>4주택째 이상 / 법인</strong>: 12.4% — 공시가격 1억(비수도권 2억) 이하 주택은 중과 제외<br />
              • <strong>법인 명의</strong>: 종합소득세·종합부동산세 모두 부과, 1주택 특례 X
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 비용 분석 ════════ */}
      {tab === 'analyze' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>비용 비중 분석</p>
            <p className={s.heroValue}>
              부대비용 <strong>{extraRatio.toFixed(1)}%</strong>
            </p>
            <p className={s.heroSub}>
              일반 경매 평균 <strong style={{ color: 'var(--text)' }}>10~15%</strong> 수준
              {extraRatio < 10 && ' · ✅ 평균 이하 (경제적)'}
              {extraRatio >= 10 && extraRatio < 15 && ' · 평균 수준'}
              {extraRatio >= 15 && ' · ⚠️ 평균 초과 (재점검 권장)'}
            </p>
          </div>

          {/* SVG 도넛 차트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>비용 구조 (도넛)</span>
            <div className={s.donutWrap}>
              <DonutChart data={donutData.filter((d) => d.value > 0)} total={totalInvest} />
              <div className={s.donutLegend}>
                {donutData.filter((d) => d.value > 0).map((d) => (
                  <div key={d.id} className={s.legendRow}>
                    <span className={s.legendDot} style={{ background: d.color }} />
                    <span className={s.legendLabel}>{d.label}</span>
                    <span className={s.legendValue}>
                      {fmtMan(d.value)} ({pctOf(d.value)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 막대 그래프 - 항목별 */}
          <div className={s.card}>
            <span className={s.cardLabel}>부대비용 항목별 비중</span>
            <div className={s.barChart}>
              {itemCosts.filter((c) => c.value > 0).map((c) => {
                const w = totalExtra > 0 ? (c.value / totalExtra) * 100 : 0
                return (
                  <div key={c.id} className={s.barRow}>
                    <span className={s.barLabel}>{c.emoji} {c.label.split(' ')[0]}</span>
                    <div className={s.barTrack}>
                      <div className={s.barFill} style={{ width: `${Math.max(w, 3)}%` }}>
                        <span className={s.barValue}>{w.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 절감 팁 */}
          <div className={s.card}>
            <span className={s.cardLabel}>비용 절감 가이드</span>
            <div className={s.saveTipGrid}>
              {COST_ITEMS.filter((c) => c.saveTip).map((c) => (
                <div key={c.id} className={s.saveTipCard}>
                  <p className={s.saveTipHead}>
                    <span className={s.costEmoji}>{c.emoji}</span>
                    <strong>{c.label.split(' ')[0]}</strong>
                  </p>
                  <p className={s.saveTipDesc}>💡 {c.saveTip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/finance/real-estate" className={s.crossLink}>
        부동산 수익률 계산기 → 매매·임대·레버리지 자기자본 수익률
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SVG 도넛 차트
   ───────────────────────────────────────────── */
interface DonutDatum { id: string; label: string; value: number; color: string }

function DonutChart({ data, total }: { data: DonutDatum[]; total: number }) {
  if (data.length === 0 || total <= 0) {
    return <p style={{ fontSize: 12, color: 'var(--muted)' }}>입력값 없음</p>
  }

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

  const slices = data.reduce<{ d: DonutDatum; cum: number }[]>((acc, d) => {
    const last = acc.length > 0 ? acc[acc.length - 1] : null
    const cum = last ? last.cum + last.d.value : 0
    acc.push({ d, cum })
    return acc
  }, [])

  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 220 }} role="img" aria-label="총 투자 비용 구성 도넛 차트">
      {slices.map(({ d, cum }) => {
        const startAngle = (cum / total) * Math.PI * 2 - Math.PI / 2
        const endAngle = ((cum + d.value) / total) * Math.PI * 2 - Math.PI / 2
        return (
          <path key={d.id} d={describeArc(startAngle, endAngle)} fill={d.color} opacity={0.85} />
        )
      })}
      <circle cx={cx} cy={cy} r={rInner - 2} fill="var(--bg2)" />
      <text x={cx} y={cy - 4} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>총 투자</text>
      <text x={cx} y={cy + 14} fill="var(--accent)" fontSize="13" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="800">
        {total >= 10000 ? `${(total / 10000).toFixed(1)}억` : `${total.toFixed(0)}만`}
      </text>
    </svg>
  )
}
