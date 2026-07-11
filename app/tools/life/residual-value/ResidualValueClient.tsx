'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import { todayStr } from '@/lib/date'
import {
  PRODUCT_ITEMS, LAUNDRY_ITEMS, LAUNDRY_RATES, LAUNDRY_BOUNDS,
  calcProduct, calcLaundry, daysBetween,
  type CaseType,
} from './residualData'
import s from './residual-value.module.css'

const fmtWon = (n: number) => n.toLocaleString('ko-KR')
const parseWon = (v: string) => parseInt(v.replace(/[^0-9]/g, ''), 10)

const CASES: { id: CaseType; label: string; desc: string }[] = [
  { id: 'noParts', label: '수리불가·분실 배상', desc: '보증기간 경과 + 부품보유기간 내 수리불가, 수리 의뢰품 분실 → 잔여금 + 구입가 10% 가산' },
  { id: 'residual', label: '잔존가치만 조회', desc: '정액 감가상각 후 남은 금액만 확인' },
  { id: 'inWarranty', label: '보증기간 내 수리불가', desc: '감가 없이 제품교환 또는 구입가 전액 환급' },
]

export default function ResidualValueClient() {
  const [tab, setTab] = useState<'product' | 'laundry'>('product')

  // Track A: 공산품
  const [itemId, setItemId] = useState('phone')
  const [price, setPrice] = useState('1,000,000')
  const [years, setYears] = useState('2')
  const [months, setMonths] = useState('0')
  const [caseType, setCaseType] = useState<CaseType>('noParts')

  // Track B: 세탁물
  const [lItemId, setLItemId] = useState('suit-winter')
  const [lPrice, setLPrice] = useState('300,000')
  const [buyDate, setBuyDate] = useState('')
  const [reqDate, setReqDate] = useState(() => todayStr())
  const [laundryFee, setLaundryFee] = useState('')

  const item = PRODUCT_ITEMS.find((i) => i.id === itemId)!
  const usedMonths = (parseInt(years, 10) || 0) * 12 + (parseInt(months, 10) || 0)
  const productResult = useMemo(
    () => calcProduct(parseWon(price), item.years, usedMonths, caseType),
    [price, item, usedMonths, caseType],
  )

  const lItem = LAUNDRY_ITEMS.find((i) => i.id === lItemId)!
  const days = useMemo(() => (buyDate ? daysBetween(buyDate, reqDate) : null), [buyDate, reqDate])
  const laundryResult = useMemo(
    () => (days !== null && days >= 0 ? calcLaundry(parseWon(lPrice), lItem.years, days) : null),
    [lPrice, lItem, days],
  )
  const fee = parseWon(laundryFee)

  const onWon = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)
    setter(raw ? parseInt(raw, 10).toLocaleString('ko-KR') : '')
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={s.tabRow} role="tablist" aria-label="계산 유형">
        <button type="button" role="tab" aria-selected={tab === 'product'}
          className={`${s.tabBtn} ${tab === 'product' ? s.on : ''}`}
          onClick={() => setTab('product')}>
          🔌 가전·공산품
        </button>
        <button type="button" role="tab" aria-selected={tab === 'laundry'}
          className={`${s.tabBtn} ${tab === 'laundry' ? s.on : ''}`}
          onClick={() => setTab('laundry')}>
          👔 세탁물·의류
        </button>
      </div>

      {tab === 'product' ? (
        <>
          <div className={s.card}>
            <div className={s.fieldGrid}>
              <label className={s.field}>
                <span className={s.miniLabel}>품목 (내용연수 = 별표Ⅲ 부품보유기간)</span>
                <select className={s.select} value={itemId} onChange={(e) => setItemId(e.target.value)}>
                  {PRODUCT_ITEMS.map((i) => (
                    <option key={i.id} value={i.id}>{i.label} — {i.years}년</option>
                  ))}
                </select>
              </label>
              <label className={s.field}>
                <span className={s.miniLabel}>구입가격</span>
                <span className={s.wonBox}>
                  <input className={s.wonInput} type="text" inputMode="numeric" value={price}
                    onChange={onWon(setPrice)} aria-label="구입가격 (원)" />
                  <span className={s.unit}>원</span>
                </span>
              </label>
            </div>
            <div className={s.fieldGrid}>
              <div className={s.field}>
                <span className={s.miniLabel}>사용 기간</span>
                <span className={s.periodRow}>
                  <input className={s.numInput} type="text" inputMode="numeric" value={years}
                    onChange={(e) => setYears(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} aria-label="사용 기간 (년)" />
                  <span className={s.unit}>년</span>
                  <input className={s.numInput} type="text" inputMode="numeric" value={months}
                    onChange={(e) => setMonths(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} aria-label="사용 기간 (개월)" />
                  <span className={s.unit}>개월</span>
                </span>
              </div>
            </div>
            <div className={s.caseGroup} role="group" aria-label="배상 유형 선택">
              {CASES.map((c) => (
                <button key={c.id} type="button"
                  className={`${s.caseBtn} ${caseType === c.id ? s.on : ''}`}
                  aria-pressed={caseType === c.id}
                  onClick={() => setCaseType(c.id)}>
                  <span className={s.caseName}>{c.label}</span>
                  <span className={s.caseDesc}>{c.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.resultCard} role="status">
            <p className={s.resultLabel}>
              {item.label} · 내용연수 {item.years}년 · {usedMonths}개월 사용
            </p>
            {productResult ? (
              <>
                <p className={s.hero}>
                  {fmtWon(productResult.payout)}<span className={s.heroUnit}>원</span>
                </p>
                <p className={s.resultSub}>
                  {caseType === 'inWarranty'
                    ? '품질보증기간 내 수리불가 — 감가 없이 구입가 환급 (또는 제품교환)'
                    : <>정액감가 잔여금 {fmtWon(productResult.residual)}원
                      {productResult.bonus > 0 && <> + 구입가 10% 가산 {fmtWon(productResult.bonus)}원 (한도: 구입가)</>}</>}
                </p>
                {caseType !== 'inWarranty' && (
                  <div className={s.barBox} aria-hidden>
                    <div className={s.bar}>
                      <div className={s.barFill} style={{ width: `${Math.max(2, (productResult.residual / Math.max(1, parseWon(price))) * 100)}%` }} />
                    </div>
                    <p className={s.barNote}>
                      감가상각비 {fmtWon(productResult.depreciation)}원 ({usedMonths}/{productResult.lifeMonths}개월 경과)
                    </p>
                  </div>
                )}
                {productResult.expired && caseType === 'noParts' && (
                  <p className={s.warnNote}>내용연수가 다 지나 잔여금은 0원이지만, 부품보유기간 내 수리불가·분실이라면 10% 가산분은 환급 대상이에요.</p>
                )}
                {productResult.expired && caseType === 'residual' && (
                  <p className={s.warnNote}>내용연수 경과 — 기준상 잔존가치는 0원입니다.</p>
                )}
              </>
            ) : (
              <p className={s.emptyNote}>구입가격과 사용 기간을 입력하면 기준상 배상액을 계산해요.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={s.card}>
            <div className={s.fieldGrid}>
              <label className={s.field}>
                <span className={s.miniLabel}>품목 (세탁업 평균 내용연수)</span>
                <select className={s.select} value={lItemId} onChange={(e) => setLItemId(e.target.value)}>
                  {LAUNDRY_ITEMS.map((i) => (
                    <option key={i.id} value={i.id}>{i.label} — {i.years}년</option>
                  ))}
                </select>
              </label>
              <label className={s.field}>
                <span className={s.miniLabel}>구입가격</span>
                <span className={s.wonBox}>
                  <input className={s.wonInput} type="text" inputMode="numeric" value={lPrice}
                    onChange={onWon(setLPrice)} aria-label="세탁물 구입가격 (원)" />
                  <span className={s.unit}>원</span>
                </span>
              </label>
            </div>
            <div className={s.fieldGrid}>
              <label className={s.field}>
                <span className={s.miniLabel}>구입일</span>
                <input className={s.dateInput} type="date" value={buyDate} max={reqDate}
                  onChange={(e) => setBuyDate(e.target.value)} aria-label="구입일" />
              </label>
              <label className={s.field}>
                <span className={s.miniLabel}>세탁 의뢰일</span>
                <input className={s.dateInput} type="date" value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)} aria-label="세탁 의뢰일" />
              </label>
            </div>
            <p className={s.groupNote}>사용일수는 실제 착용 여부와 상관없이 구입일부터 세탁 의뢰일까지로 계산해요 (고시 원문 기준).</p>
          </div>

          <div className={s.resultCard} role="status">
            <p className={s.resultLabel}>{lItem.label} · 내용연수 {lItem.years}년{days !== null && days >= 0 && <> · 사용 {fmtWon(days)}일</>}</p>
            {laundryResult ? (
              <>
                <p className={s.hero}>
                  {fmtWon(laundryResult.payout)}<span className={s.heroUnit}>원</span>
                </p>
                <p className={s.resultSub}>
                  배상액 = 구입가 {lPrice}원 × 배상비율 <strong>{laundryResult.rate}%</strong>
                </p>
              </>
            ) : days !== null && days < 0 ? (
              <p className={s.emptyNote}>세탁 의뢰일이 구입일보다 빠를 수 없어요 — 날짜를 확인해 주세요.</p>
            ) : (
              <p className={s.emptyNote}>구입가격과 구입일을 입력하면 배상비율표 기준 배상액을 계산해요.</p>
            )}
          </div>

          <div className={s.card}>
            <p className={s.groupLabel}>영수증이 없다면? — 세탁요금 20배 규칙</p>
            <div className={s.feeRow}>
              <span className={s.wonBox}>
                <input className={s.wonInput} type="text" inputMode="numeric" placeholder="세탁요금" value={laundryFee}
                  onChange={onWon(setLaundryFee)} aria-label="세탁요금 (원)" />
                <span className={s.unit}>원</span>
              </span>
              <span className={s.feeOut}>
                → 배상액 <strong>{isFinite(fee) && fee > 0 ? `${fmtWon(fee * 20)}원` : '—'}</strong>
              </span>
            </div>
            <p className={s.groupNote}>
              구입가격·구입일을 입증할 수 없으면 배상액은 세탁요금의 20배로 합니다 (고시 원문). 세트 의류는 전체 기준으로 산정하되
              상·하의는 65%/35%, 상·중·하는 55%/35%/10%(중의 10%)로 배분해요.
            </p>
          </div>

          {/* 배상비율표 */}
          <div className={s.card}>
            <p className={s.groupLabel}>배상비율표 — 내용연수 {lItem.years}년 기준</p>
            <div className={s.tableScroll}>
              <table className={s.refTable}>
                <thead>
                  <tr>
                    <th scope="col">사용일수</th>
                    <th scope="col">배상비율</th>
                  </tr>
                </thead>
                <tbody>
                  {LAUNDRY_BOUNDS[lItem.years].map((upper, i) => {
                    const lower = i === 0 ? 0 : LAUNDRY_BOUNDS[lItem.years][i - 1] + 1
                    const active = days !== null && days >= lower && days <= upper
                    return (
                      <tr key={i} className={active ? s.rowOn : undefined}>
                        <td>{fmtWon(lower)} ~ {fmtWon(upper)}일</td>
                        <td><strong>{LAUNDRY_RATES[i]}%</strong></td>
                      </tr>
                    )
                  })}
                  <tr className={days !== null && days > LAUNDRY_BOUNDS[lItem.years][9] ? s.rowOn : undefined}>
                    <td>{fmtWon(LAUNDRY_BOUNDS[lItem.years][9] + 1)}일 ~</td>
                    <td><strong>10%</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Disclaimer
        variant="legal"
        related={[
          { href: '/tools/life/customs', label: '관부가세 계산기' },
          { href: '/tools/life/unit-price', label: '단가 비교 계산기' },
          { href: '/tools/life/laundry-dry', label: '빨래 건조 시간 계산기' },
        ]}
        sources={[
          { label: '소비자분쟁해결기준 (공정거래위원회고시 제2025-14호)', href: 'https://www.law.go.kr/행정규칙/소비자분쟁해결기준' },
          { label: '한국소비자원 (피해구제 1372)', href: 'https://www.kca.go.kr' },
        ]}
      >
        소비자분쟁해결기준은 법적 강제력이 있는 규범이 아니라 당사자 간 별도 의사표시가 없을 때의 합의·권고 기준입니다(소비자기본법 제16조③). 특약이 있으면 특약이, 다른 법령에 유리한 기준이 있으면 그 기준이 우선하며, 실제 분쟁은 1372 소비자상담센터·한국소비자원 피해구제 절차를 이용하세요.
      </Disclaimer>
    </div>
  )
}
