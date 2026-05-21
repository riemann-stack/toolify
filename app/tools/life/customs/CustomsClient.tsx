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
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'calc',      label: '📦 관부가세 계산' },
          { id: 'items',     label: '📊 품목별 관세' },
          { id: 'countries', label: '🌍 국가별 한도' },
          { id: 'scenarios', label: '🎯 시나리오' },
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

      {/* ════════ 탭 1: 관부가세 계산 ════════ */}
      {tab === 'calc' && (
        <>
          {/* 국가 */}
          <div className={s.card}>
            <span className={s.cardLabel}>출발 국가</span>
            <div className={s.countryRow}>
              {COUNTRIES.map((c) => (
                <button
                  key={c.id}
                  className={`${s.countryBtn} ${countryId === c.id ? s.countryBtnActive : ''}`}
                  onClick={() => setCountryId(c.id)}
                  type="button"
                >
                  <span className={s.countryFlag}>{c.flag}</span>
                  <span className={s.countryName}>{c.shortName}</span>
                  <span className={s.countryLimit}>${c.dutyFreeUsd} 면세</span>
                </button>
              ))}
            </div>
          </div>

          {/* 품목 */}
          <div className={s.card}>
            <span className={s.cardLabel}>품목 ({ITEMS.length}개)</span>
            <div className={s.itemGrid}>
              {ITEMS.map((it) => (
                <button
                  key={it.id}
                  className={`${s.itemBtn} ${itemId === it.id ? s.itemBtnActive : ''}`}
                  onClick={() => setItemId(it.id)}
                  type="button"
                >
                  <span className={s.itemEmoji}>{it.emoji}</span>
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
                <input type="number" className={s.input} value={productPrice} onChange={(e) => setProductPrice(e.target.value)} min={0} step={1} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>배송비 ({country.currencyUnit} {country.currency})</label>
                <input type="number" className={s.input} value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} min={0} step={1} />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>환율 (1{country.currencyUnit}{rateBase > 1 ? `(${rateBase})` : ''} = ? 원)</label>
                <input
                  type="number"
                  className={s.input}
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder={String(country.defaultRate)}
                />
                <p className={s.helpText}>기본값 {country.defaultRate}원 · 관세청 주간 고시 환율 권장</p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>사용 목적</label>
                <div className={s.pillRow}>
                  <button className={`${s.pill} ${usage === 'personal' ? s.pillActive : ''}`} onClick={() => setUsage('personal')} type="button">
                    👤 자가사용
                  </button>
                  <button className={`${s.pill} ${usage === 'business' ? s.pillActive : ''}`} onClick={() => setUsage('business')} type="button">
                    🏢 사업자
                  </button>
                </div>
                <p className={s.helpText}>{usage === 'personal' ? '면세 한도 적용 가능' : '⚠️ 사업자 면세 X'}</p>
              </div>
            </div>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero} style={{ borderColor: result.isDutyFree ? 'rgba(13, 148, 136, 0.4)' : 'rgba(219, 39, 119, 0.4)' }}>
            <p className={s.heroLabel}>
              {country.flag} {country.shortName} · {item.emoji} {item.label}
            </p>
            <p className={s.heroValue} style={{ color: result.isDutyFree ? '#0D9488' : '#DB2777' }}>
              {result.isDutyFree ? '✅ 면세' : '❌ 과세'}
            </p>
            <p className={s.heroSub}>
              상품+배송 <strong>{fmtCurrency(result.totalLocal, country.currencyUnit, 2)}</strong>
              {' = '}<strong>{fmtKrw(result.totalKrw)}</strong>
              {' (≈ $'}{result.totalUsd.toFixed(2)}{')'}
              <br />
              {result.isDutyFree
                ? <>면세 한도 <strong>${result.dutyFreeLimit}</strong>까지 여유 <strong style={{ color: 'var(--accent)' }}>${(result.dutyFreeLimit - result.totalUsd).toFixed(2)}</strong></>
                : <>면세 한도 <strong>${result.dutyFreeLimit}</strong> 초과 <strong style={{ color: '#DB2777' }}>${(result.totalUsd - result.dutyFreeLimit).toFixed(2)}</strong></>
              }
            </p>
          </div>

          {/* 판단 이유 */}
          <div className={result.isDutyFree ? s.warnCardGood : s.warnCardStrong}>
            <strong>{result.isDutyFree ? '✅ 면세 판단' : '❌ 과세 판단'}</strong>
            <p>{result.reason}</p>
          </div>

          {/* 최종 가격 */}
          <div className={s.heroFinal}>
            <p className={s.heroLabel}>💰 최종 구매가 (원화)</p>
            <p className={s.heroValueLarge}>
              <strong>{fmtKrw(result.finalKrw)}</strong>
            </p>
            <p className={s.heroSub}>
              세금 합계 <strong style={{ color: result.totalTax > 0 ? '#DB2777' : 'var(--accent)' }}>
                {result.totalTax > 0 ? `+${fmtKrw(result.totalTax)}` : '0원'}
              </strong>
              {' · '}한국 백화점 추정가 <strong>{fmtKrw(result.domesticEstimate)}</strong>
              {result.saving > 0 && (
                <><br />🇰🇷 백화점 대비 <strong style={{ color: 'var(--accent)' }}>{fmtKrw(result.saving)} 절감</strong> ({((result.saving / result.domesticEstimate) * 100).toFixed(0)}%)</>
              )}
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
                  <tr><td>총 (현지통화)</td><td className={s.cellMono}>{fmtCurrency(result.totalLocal, country.currencyUnit, 2)}</td></tr>
                  <tr><td>환율 적용 → 과세가격</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtKrw(result.totalKrw)}</td></tr>
                  <tr><td>USD 환산 (면세 비교)</td><td className={s.cellMono}>${result.totalUsd.toFixed(2)}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>세금 (면세 시 0)</td></tr>
                  <tr><td>관세 ({item.dutyRate}%)</td><td className={s.cellMono}>{result.duty > 0 ? fmtKrw(result.duty) : '0원'}</td></tr>
                  <tr><td>부가세 (10%)</td><td className={s.cellMono}>{result.vat > 0 ? fmtKrw(result.vat) : '0원'}</td></tr>
                  {item.excise && (
                    <tr><td>개별소비세 (200만원 초과 20%)</td><td className={s.cellMono}>{result.excise > 0 ? fmtKrw(result.excise) : '0원'}</td></tr>
                  )}
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

          {/* 합산 과세 경고 */}
          <div className={s.warnCard}>
            <strong>⚠️ 합산 과세 주의</strong>
            <p>
              <strong>같은 사람·같은 발송지·2일 이내</strong> 도착하는 직구는 합산되어 면세 한도가 한 번만 적용됩니다.<br />
              예: 100달러짜리 2건 = 200달러로 계산 → 미국은 면세, 기타 국가는 과세<br />
              ✅ <strong>분할 발송</strong>: 다른 날짜에 도착하도록 시간차 주문<br />
              ✅ <strong>다른 발송지·다른 사이트</strong>로 분산
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 품목별 관세 매트릭스 ════════ */}
      {tab === 'items' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>📊 품목별 관세율 매트릭스</p>
            <p className={s.heroValue}>{ITEMS.length}+ 품목</p>
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
                    <tr key={it.id} onClick={() => { setItemId(it.id); setTab('calc') }} style={{ cursor: 'pointer' }}>
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

          {/* 목록통관 21개 품목 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📋 목록통관 21개 품목 (관세청 고시)</span>
            <div className={s.listedGrid}>
              {LISTED_CATEGORIES.map((c, i) => (
                <span key={i} className={s.listedChip}>{c}</span>
              ))}
            </div>
            <p className={s.helpText} style={{ marginTop: 10 }}>
              위 21개 품목 + 자가사용 + 면세 한도 이하 → <strong>목록통관 (관세·부가세 면제)</strong><br />
              그 외 품목 또는 한도 초과 → 일반통관 (세금 부과)
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

      {/* 크로스링크 */}
      <Link href="/tools/unit/size" className={s.crossLink}>
        🛍️ 사이즈 변환기 → US·EU·UK 한국 사이즈 환산
      </Link>
    </div>
  )
}

void fmt
