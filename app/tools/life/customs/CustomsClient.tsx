/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './customs.module.css'
import {
  COUNTRIES, ITEMS, LISTED_CATEGORIES, SCENARIOS,
  type CountryId, type UsageType,
  getCountry, getItem, calcCustoms,
  fmt, fmtKrw, fmtCurrency,
} from './customsUtils'

type Tab = 'calc' | 'items' | 'countries' | 'scenarios'

const STORAGE_KEY = 'youtil_customs_v1'

export default function CustomsClient() {
  const [tab, setTab] = useState<Tab>('calc')

  /* 입력 */
  const [countryId, setCountryId] = useState<CountryId>('us')
  const [itemId, setItemId] = useState('laptop')
  const [productPrice, setProductPrice] = useState('999')
  const [shippingFee, setShippingFee] = useState('25')
  const [exchangeRate, setExchangeRate] = useState('')
  const [usage, setUsage] = useState<UsageType>('personal')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.countryId) setCountryId(j.countryId)
      if (j.itemId) setItemId(j.itemId)
      if (j.productPrice) setProductPrice(j.productPrice)
      if (j.shippingFee) setShippingFee(j.shippingFee)
      if (j.exchangeRate) setExchangeRate(j.exchangeRate)
      if (j.usage) setUsage(j.usage)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ countryId, itemId, productPrice, shippingFee, exchangeRate, usage }))
    } catch {}
  }, [countryId, itemId, productPrice, shippingFee, exchangeRate, usage])

  /* 계산 */
  const country = getCountry(countryId)
  const item = getItem(itemId)
  const rateBase = country.defaultRateBase ?? 1
  const rateValue = parseFloat(exchangeRate) || country.defaultRate
  const result = useMemo(() => calcCustoms({
    countryId,
    itemId,
    productPrice: parseFloat(productPrice) || 0,
    shippingFee: parseFloat(shippingFee) || 0,
    exchangeRate: rateValue,
    rateBase,
    toUsdRate: country.toUsdRate,
    usage,
  }), [countryId, itemId, productPrice, shippingFee, rateValue, rateBase, country.toUsdRate, usage])

  /* 시나리오 적용 */
  const applyScenario = (id: string) => {
    const sc = SCENARIOS.find((s) => s.id === id)
    if (!sc) return
    setCountryId(sc.countryId)
    setItemId(sc.itemId)
    setProductPrice(String(sc.productPrice))
    setShippingFee(String(sc.shippingFee))
    setUsage('personal')
    setTab('calc')
  }

  return (
    <div className={s.wrap}>
      {/* 안내 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/travel-budget', label: '여행 예산' },
          { href: '/tools/life/lotto', label: '로또 번호 생성기' },
          { href: '/tools/life/dutch', label: '더치페이 계산기' }
        ]}
      >
        사용 안내 표시 관세율은 일반 가이드 — 정확한 HS Code는 <strong>관세청 우편물 추적</strong>에서 확인. 환율은 사용자 입력 또는 <strong>관세청 주간 고시 환율</strong> 기준. 자가사용 vs 사업자 직구 면세 기준 다름 — 사업자는 면세 X.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="관부가세 도구 모드">
        {([
          { id: 'calc',      label: '📦 관부가세 계산' },
          { id: 'items',     label: '📊 품목별 관세' },
          { id: 'countries', label: '🌍 국가별 한도' },
          { id: 'scenarios', label: '🎯 시나리오' },
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

      {/* ════════ 탭 1: 관부가세 계산 ════════ */}
      {tab === 'calc' && (
        <>
          {/* 국가 */}
          <div className={s.card}>
            <span className={s.cardLabel}>출발 국가</span>
            <div className={s.countryRow} role="group" aria-label="출발 국가">
              {COUNTRIES.map((c) => (
                <button
                  key={c.id}
                  aria-pressed={countryId === c.id}
                  aria-label={`${c.shortName} (면세 한도 $${c.dutyFreeUsd})`}
                  className={`${s.countryBtn} ${countryId === c.id ? s.countryBtnActive : ''}`}
                  onClick={() => setCountryId(c.id)}
                  type="button"
                >
                  <span className={s.countryFlag} aria-hidden="true">{c.flag}</span>
                  <span className={s.countryName}>{c.shortName}</span>
                  <span className={s.countryLimit}>${c.dutyFreeUsd} 면세</span>
                </button>
              ))}
            </div>
          </div>

          {/* 품목 */}
          <div className={s.card}>
            <span className={s.cardLabel}>품목 ({ITEMS.length}개)</span>
            <div className={s.itemGrid} role="group" aria-label="품목 선택">
              {ITEMS.map((it) => (
                <button
                  key={it.id}
                  aria-pressed={itemId === it.id}
                  aria-label={`${it.label} (관세율 ${it.dutyRate}%)`}
                  className={`${s.itemBtn} ${itemId === it.id ? s.itemBtnActive : ''}`}
                  onClick={() => setItemId(it.id)}
                  type="button"
                >
                  <span className={s.itemEmoji} aria-hidden="true">{it.emoji}</span>
                  <span className={s.itemLabel}>{it.shortLabel}</span>
                  <span className={s.itemRate} style={{ color: it.dutyRate === 0 ? '#0D9488' : 'var(--accent)' }}>
                    {it.dutyRate}%{it.dutyRate === 0 && ' ⭐'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 가격·환율·자가사용 */}
          <div className={s.card}>
            <span className={s.cardLabel}>가격 · 환율 · 자가사용</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>상품 가격 ({country.currencyUnit} {country.currency})</label>
                <input type="number" className={s.input} value={productPrice} onChange={(e) => setProductPrice(e.target.value)} min={0} step={1} aria-label={`상품 가격 (${country.currency}, 면세 한도 판정 기준)`} inputMode="decimal" />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>국제 배송비 ({country.currencyUnit} {country.currency})</label>
                <input type="number" className={s.input} value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} min={0} step={1} aria-label={`국제 배송비 (${country.currency}, 과세가격엔 포함·면세 한도엔 미포함)`} inputMode="decimal" />
              </div>
            </div>
            <p className={s.helpText}>※ 면세 한도는 <strong>상품 가격(물품가격)</strong>만으로 판정합니다. 국제 배송비는 과세 시 <strong>과세가격(CIF)</strong>에만 더해집니다. 별도 표기 안 된 운임·현지(국내) 배송비는 기준이 달라질 수 있어요.</p>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>환율 (1{country.currencyUnit}{rateBase > 1 ? `(${rateBase})` : ''} = ? 원)</label>
                <input
                  type="number"
                  className={s.input}
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder={String(country.defaultRate)}
                  min={0}
                  aria-label={`환율 (1${country.currencyUnit}${rateBase > 1 ? ` ${rateBase}단위` : ''} 당 원, 기본 ${country.defaultRate}원)`}
                  inputMode="decimal"
                />
                <p className={s.helpText}>기본값 {country.defaultRate}원 · 관세청 주간 고시 환율 권장</p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>사용 목적</label>
                <div className={s.pillRow} role="group" aria-label="사용 목적">
                  <button aria-pressed={usage === 'personal'} className={`${s.pill} ${usage === 'personal' ? s.pillActive : ''}`} onClick={() => setUsage('personal')} type="button">
                    👤 자가사용
                  </button>
                  <button aria-pressed={usage === 'business'} className={`${s.pill} ${usage === 'business' ? s.pillActive : ''}`} onClick={() => setUsage('business')} type="button">
                    🏢 사업자
                  </button>
                </div>
                <p className={s.helpText}>{usage === 'personal' ? '면세 한도 적용 가능' : '⚠️ 사업자 면세 X'}</p>
              </div>
            </div>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero} aria-live="polite" style={{ borderColor: result.isDutyFree ? 'rgba(13, 148, 136, 0.4)' : 'rgba(219, 39, 119, 0.4)' }}>
            <p className={s.heroLabel}>
              {country.flag} {country.shortName} · {item.emoji} {item.label}
            </p>
            <p className={s.heroValue} style={{ color: result.isDutyFree ? '#0D9488' : '#DB2777' }}>
              {result.isDutyFree ? '✅ 면세' : '❌ 과세'}
            </p>
            <p className={s.heroSub}>
              물품가격 <strong>${result.productUsd.toFixed(2)}</strong> <span style={{ fontSize: 11 }}>(면세 기준·배송 제외)</span>
              {' · '}과세가격 <strong>{fmtKrw(result.totalKrw)}</strong>
              <br />
              {result.isDutyFree
                ? <>면세 한도 <strong>${result.dutyFreeLimit}</strong>까지 여유 <strong style={{ color: 'var(--accent)' }}>${Math.max(0, result.dutyFreeLimit - result.productUsd).toFixed(2)}</strong></>
                : usage === 'business'
                  ? <>🏢 사업자 직구 — 면세 한도 적용 <strong style={{ color: '#DB2777' }}>X</strong></>
                  : item.dutyFreeExcluded
                    ? <>🍷 소액면세 배제 품목 — 한도와 <strong style={{ color: '#DB2777' }}>무관하게 과세</strong></>
                    : <>면세 한도 <strong>${result.dutyFreeLimit}</strong> 초과 <strong style={{ color: '#DB2777' }}>${(result.productUsd - result.dutyFreeLimit).toFixed(2)}</strong></>
              }
            </p>
          </div>

          {/* 판단 이유 */}
          <div className={result.isDutyFree ? s.warnCardGood : s.warnCardStrong}>
            <strong>{result.isDutyFree ? '✅ 면세 판단' : '❌ 과세 판단'}</strong>
            <p>{result.reason}</p>
          </div>

          {/* 최종 가격 */}
          <div className={s.heroFinal} aria-live="polite">
            <p className={s.heroLabel}>💰 예상 결제액 (상품+배송+세금, 간이 추정)</p>
            <p className={s.heroValueLarge}>
              <strong>{fmtKrw(result.finalKrw)}</strong>
            </p>
            <p className={s.heroSub}>
              간이 예상세액 <strong style={{ color: result.totalTax > 0 ? '#DB2777' : 'var(--accent)' }}>
                {result.totalTax > 0 ? `+${fmtKrw(result.totalTax)}` : '0원'}
              </strong>
              <br /><span style={{ fontSize: 11.5 }}>※ HS코드·원산지·FTA·개별 규정 미반영 <strong>간이 예상치</strong>입니다. 통관 수수료·국내 판매가 비교는 품목·브랜드 편차가 커 제공하지 않아요. 정확한 세액은 <strong>관세청 예상세액 조회</strong>로 확인하세요.</span>
            </p>
          </div>

          {/* 상세 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>계산 상세</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>상품 가격</td><td className={s.cellMono}>{fmtCurrency(parseFloat(productPrice) || 0, country.currencyUnit, 2)}</td></tr>
                  <tr><td>배송비</td><td className={s.cellMono}>{fmtCurrency(parseFloat(shippingFee) || 0, country.currencyUnit, 2)}</td></tr>
                  <tr><td>물품가격 USD (면세 기준·배송 제외)</td><td className={s.cellMono}>${result.productUsd.toFixed(2)}</td></tr>
                  <tr><td>상품+배송 → 과세가격 (CIF)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtKrw(result.totalKrw)}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>세금 (면세 시 0)</td></tr>
                  <tr><td>관세 ({item.dutyRate}%)</td><td className={s.cellMono}>{result.duty > 0 ? fmtKrw(result.duty) : '0원'}</td></tr>
                  {item.excise && (
                    <tr><td>개별소비세 (200만원 초과 20%)</td><td className={s.cellMono}>{result.excise > 0 ? fmtKrw(result.excise) : '0원'}</td></tr>
                  )}
                  {item.liquor && (
                    <tr><td>주세 ({item.liquor.rate}%)</td><td className={s.cellMono}>{result.liquorTax > 0 ? fmtKrw(result.liquorTax) : '0원'}</td></tr>
                  )}
                  {(item.excise || item.liquor) && (
                    <tr><td>교육세 ({item.liquor ? '주세의 10%' : '개소세의 30%'})</td><td className={s.cellMono}>{result.eduTax > 0 ? fmtKrw(result.eduTax) : '0원'}</td></tr>
                  )}
                  <tr><td>부가세 (10%)</td><td className={s.cellMono}>{result.vat > 0 ? fmtKrw(result.vat) : '0원'}</td></tr>
                  <tr><td>총 세금</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtKrw(result.totalTax)}</td></tr>
                  <tr className={s.cellTotal}>
                    <td><strong>최종 구매가</strong></td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtKrw(result.finalKrw)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {item.note && (
              <div className={s.tipBox}>💡 <strong>{item.label}</strong> — {item.note}</div>
            )}
          </div>

          {/* 주류 경고 */}
          {item.liquor && (
            <div className={s.warnCardStrong}>
              <strong>🍷 주류 직구 주의</strong>
              <p>
                주류는 <strong>소액면세 대상이 아니며</strong> 관세·주세·교육세·부가세가 모두 부과됩니다.
                또한 <strong>자가소비 수량 한도·식품 검역·통신판매 제한</strong> 등 별도 규정이 있어 통관이 거부될 수 있어요.
                위 수치는 간이 추정 — 정확한 세액·요건은 관세청에서 확인하세요.
              </p>
            </div>
          )}

          {/* 합산 과세 안내 */}
          <div className={s.warnCard}>
            <strong>⚠️ 합산 과세 기준 (현행)</strong>
            <p>
              <strong>같은 날, 같은 해외 판매자(쇼핑몰)</strong>에서 구매한 여러 건은 합산되어 면세 한도가 한 번만 적용됩니다.<br />
              <strong>서로 다른 날·다른 판매처</strong>에서 구매하면 같은 날 통관(입항)되어도 원칙적으로 합산하지 않습니다.<br />
              ※ 과거의 &ldquo;같은 발송지·2일 이내 입항&rdquo; 기준은 현행과 다릅니다. 면세 한도를 노린 가족 명의·발송지 분산 등 인위적 회피는 권장하지 않으며, 명의 도용은 불법입니다.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 품목별 관세 매트릭스 ════════ */}
      {tab === 'items' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>📊 품목별 관세율 매트릭스</p>
            <p className={s.heroValue}>{ITEMS.length}개 품목</p>
            <p className={s.heroSub}>한국 직구 인기 품목 + HS Code (참고)</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>전체 품목 (관세율 순)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>품목</th>
                    <th>관세율</th>
                    <th>목록통관</th>
                    <th>HS Code</th>
                  </tr>
                </thead>
                <tbody>
                  {ITEMS.slice().sort((a, b) => a.dutyRate - b.dutyRate).map((it) => (
                    <tr
                      key={it.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${it.label} 관세율 ${it.dutyRate}% — 계산 탭에서 열기`}
                      onClick={() => { setItemId(it.id); setTab('calc') }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setItemId(it.id); setTab('calc') } }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{it.emoji} {it.label}</td>
                      <td className={s.cellMono} style={{ color: it.dutyRate === 0 ? '#0D9488' : it.dutyRate >= 15 ? '#DB2777' : 'var(--accent)' }}>
                        {it.dutyRate}%{it.dutyRate === 0 && ' ⭐'}
                      </td>
                      <td className={s.cellMono}>{it.isListed ? '✅' : '❌'}</td>
                      <td className={s.cellMono} style={{ fontSize: 11, color: 'var(--muted)' }}>{it.hsCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              👆 품목 클릭 시 계산 탭으로 자동 이동.<br />
              ⭐ 무관세 품목 (노트북·핸드폰·도서) — 부가세만 10% 부담.
            </p>
          </div>

          {/* 목록통관 — 배제대상 관리 방식 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📋 목록통관 — 배제대상만 일반신고</span>
            <p className={s.helpText} style={{ marginTop: 0, marginBottom: 10 }}>
              목록통관은 <strong>허용 품목을 지정</strong>하는 방식이 아니라, <strong>배제대상</strong>만 따로 정해 그 외 대부분의 자가사용 소비재를 간이절차로 통관하는 방식입니다.
            </p>
            <p className={s.helpText} style={{ marginTop: 0, marginBottom: 6 }}><strong>✅ 목록통관 가능 (주요 예시)</strong></p>
            <div className={s.listedGrid}>
              {LISTED_CATEGORIES.map((c, i) => (
                <span key={i} className={s.listedChip}>{c}</span>
              ))}
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              <strong>🚫 목록통관 배제대상 (일반·간이 수입신고)</strong>: 의약품·건강기능식품·의료기기·검역대상 식품/동식물·주류·담배·통신판매 부적합 품목 등.<br />
              배제대상도 <strong>자가사용 + 물품가격 한도 이하</strong>면 관세·부가세는 면제될 수 있으나(주류·담배 등 제외), 정식 수입신고 절차를 거칩니다.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 국가별 한도 ════════ */}
      {tab === 'countries' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>🌍 국가별 면세 한도</p>
            <p className={s.heroValue}>미국 $200 vs 기타 $150</p>
            <p className={s.heroSub}>가장 큰 면세 한도 = 미국. 한미 FTA 효과.</p>
          </div>

          <div className={s.countryGuideGrid}>
            {COUNTRIES.map((c) => (
              <button
                key={c.id}
                className={`${s.countryGuideCard} ${countryId === c.id ? s.countryGuideActive : ''}`}
                onClick={() => { setCountryId(c.id); setTab('calc') }}
                type="button"
              >
                <p className={s.countryGuideHead}>
                  <span className={s.countryGuideFlag}>{c.flag}</span>
                  <strong>{c.name}</strong>
                </p>
                <p className={s.countryGuideLimit}>면세 한도 <strong style={{ color: 'var(--accent)' }}>${c.dutyFreeUsd}</strong></p>
                <p className={s.countryGuideRow}><strong>인기 사이트:</strong> {c.popular}</p>
                <p className={s.countryGuideRow}><strong>배송:</strong> {c.shipDays}</p>
                <p className={s.countryGuideRec}>💡 {c.recommend}</p>
              </button>
            ))}
          </div>

          <div className={s.warnCard}>
            <strong>📌 환율 환산 기준</strong>
            <p>
              관세청은 <strong>매주 화요일 환율 고시</strong>하여 다음 주 통관에 적용합니다.<br />
              본 도구는 <strong>USD 기준</strong>으로 면세 한도를 비교 (USD가 아니어도 USD로 환산).<br />
              실제 통관 시 ±5~10% 환율 변동 가능 — 안전하게 한도의 90%로 계산 권장.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 시나리오 프리셋 ════════ */}
      {tab === 'scenarios' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>🎯 한국인 자주 가는 6 시나리오</p>
            <p className={s.heroValue}>아마존·알리·매치스·라쿠텐</p>
            <p className={s.heroSub}>원클릭 자동 입력</p>
          </div>

          <div className={s.scenarioGrid}>
            {SCENARIOS.map((sc) => {
              const country = getCountry(sc.countryId)
              const item = getItem(sc.itemId)
              const r = calcCustoms({
                countryId: sc.countryId, itemId: sc.itemId,
                productPrice: sc.productPrice, shippingFee: sc.shippingFee,
                exchangeRate: country.defaultRate, rateBase: country.defaultRateBase ?? 1, toUsdRate: country.toUsdRate,
                usage: 'personal',
              })
              return (
                <div key={sc.id} className={s.scenarioCard}>
                  <p className={s.scenarioHead}>
                    <span className={s.scenarioEmoji}>{sc.emoji}</span>
                    <strong>{sc.title}</strong>
                  </p>
                  <p className={s.scenarioDesc}>{sc.desc}</p>
                  <div className={s.scenarioMeta}>
                    <span>{country.flag} {country.shortName}</span>
                    <span>{item.emoji} {item.shortLabel}</span>
                    <span>{fmtCurrency(sc.productPrice + sc.shippingFee, country.currencyUnit, 0)}</span>
                  </div>
                  <p className={s.scenarioResult} style={{ color: r.isDutyFree ? '#0D9488' : '#DB2777' }}>
                    {r.isDutyFree ? '✅ 면세' : `❌ 과세 +${fmtKrw(r.totalTax)}`} → {fmtKrw(r.finalKrw)}
                  </p>
                  <div className={s.scenarioNotes}>
                    {sc.notes.map((n, i) => (
                      <p key={i} className={s.scenarioNote}>{n}</p>
                    ))}
                  </div>
                  <button className={s.scenarioApply} onClick={() => applyScenario(sc.id)} type="button">
                    이 시나리오로 시작 →
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/unit/size" className={s.crossLink}>
        🛍️ 사이즈 변환기 → US·EU·UK 한국 사이즈 환산
      </Link>
    </div>
  )
}

void fmt
