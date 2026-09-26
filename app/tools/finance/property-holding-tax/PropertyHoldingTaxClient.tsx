'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  calcHoldingTax,
  compElderRate,
  compLongHoldRate,
  COMP_DEDUCT_ONEHOUSE,
  COMP_DEDUCT_GENERAL,
  COMP_FMV_RATIO,
  URBAN_AREA_RATE,
  LOCAL_EDU_RATE,
  COMP_RURAL_RATE,
  type HouseCount,
} from '@/lib/krPropertyTax'
import s from './propertyHoldingTax.module.css'

const STORAGE_KEY = 'youtil:property-holding-tax:inputs-v1'

/* 입력 상한 — 공시가격 1,000억 */
const PRICE_MAX = 100_000_000_000
const MAX_YEARS = 99
const MAX_AGE = 120
const MAX_HOUSE_INPUTS = 10 // 다주택 주택별 입력칸 상한

const HOUSE_SEGS: { id: HouseCount; label: string }[] = [
  { id: 1, label: '1주택' },
  { id: 2, label: '2주택' },
  { id: 3, label: '3주택 이상' },
]

/* ── 표시 헬퍼 (법정 수치 아님 — 포맷·콤마만) ── */
function fmtWon(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}
function commafy(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('ko-KR')
}
function parseAmount(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? parseInt(digits, 10) : 0
}
/** 억 단위 사람말 (예: 800000000 → "8억") */
function eokLabel(won: number): string {
  if (won <= 0) return '0원'
  const eok = won / 100_000_000
  if (Number.isInteger(eok)) return `${eok}억원`
  return `${(Math.round(eok * 100) / 100).toLocaleString('ko-KR')}억원`
}
function pct(n: number): string {
  return `${Math.round(n * 1000) / 10}%`
}

function isHouseCount(v: unknown): v is HouseCount {
  return v === 1 || v === 2 || v === 3
}

interface Stored {
  price?: unknown
  houses?: unknown
  oneHouse?: unknown
  urbanArea?: unknown
  holdYears?: unknown
  age?: unknown
  prevPropTax?: unknown
  prices?: unknown
}

export default function PropertyHoldingTaxClient() {
  const [price, setPrice] = useState('800,000,000')
  const [houses, setHouses] = useState<HouseCount>(1)
  const [oneHouse, setOneHouse] = useState(true)
  const [urbanArea, setUrbanArea] = useState(true)
  const [holdYears, setHoldYears] = useState('0')
  const [age, setAge] = useState('0')
  const [prevPropTax, setPrevPropTax] = useState('')
  // 다주택: 주택별 공시가격 (재산세는 물건별 과세라 합산 입력하면 누진이 과대 적용됨)
  const [prices, setPrices] = useState<string[]>(['', ''])
  const [copied, setCopied] = useState(false)

  /* localStorage 복원 — 무검증 as 금지: 타입·범위·enum 검증 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j: Stored = JSON.parse(raw)
      /* eslint-disable react-hooks/set-state-in-effect -- 마운트 후 1회 복원(하이드레이션 안전 패턴) */
      if (typeof j.price === 'string') setPrice(commafy(j.price))
      if (isHouseCount(j.houses)) setHouses(j.houses)
      if (typeof j.oneHouse === 'boolean') setOneHouse(j.oneHouse)
      if (typeof j.urbanArea === 'boolean') setUrbanArea(j.urbanArea)
      if (typeof j.holdYears === 'string' && /^\d{1,2}$/.test(j.holdYears)) setHoldYears(j.holdYears)
      if (typeof j.age === 'string' && /^\d{1,3}$/.test(j.age)) setAge(j.age)
      if (typeof j.prevPropTax === 'string') setPrevPropTax(commafy(j.prevPropTax))
      if (Array.isArray(j.prices) && j.prices.length <= MAX_HOUSE_INPUTS && j.prices.every((v) => typeof v === 'string')) {
        setPrices((j.prices as string[]).map(commafy))
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {}
  }, [])

  /* 저장 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ price, houses, oneHouse, urbanArea, holdYears, age, prevPropTax, prices }),
      )
    } catch {}
  }, [price, houses, oneHouse, urbanArea, holdYears, age, prevPropTax, prices])

  /* 2주택 이상이면 1세대1주택은 자동 해제 (논리적 모순 방지) */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 주택 수와 1세대1주택 플래그의 규칙적 제약 동기화
    if (houses !== 1 && oneHouse) setOneHouse(false)
  }, [houses, oneHouse])

  /* 파싱 + 입력단 클램프 */
  const priceN = useMemo(() => Math.min(PRICE_MAX, Math.max(0, parseAmount(price))), [price])
  const multi = houses !== 1
  const houseInputCount = houses === 2 ? 2 : Math.min(MAX_HOUSE_INPUTS, Math.max(3, prices.length))
  const housePricesN = useMemo(
    () => (multi ? Array.from({ length: houseInputCount }, (_, i) => Math.min(PRICE_MAX, Math.max(0, parseAmount(prices[i] ?? '')))) : []),
    [multi, houseInputCount, prices],
  )
  /* lib가 0원 칸을 걸러내므로 perHouse 인덱스 ≠ 입력칸 번호 → 입력칸 번호(1-based)를 따로 보존 */
  const houseNos = useMemo(
    () => housePricesN.flatMap((v, i) => (Number.isFinite(v) && v > 0 ? [i + 1] : [])),
    [housePricesN],
  )
  const totalPriceN = multi ? housePricesN.reduce((a, b) => a + b, 0) : priceN
  const holdYearsN = Math.min(MAX_YEARS, Math.max(0, parseInt(holdYears, 10) || 0))
  const ageN = Math.min(MAX_AGE, Math.max(0, parseInt(age, 10) || 0))
  const prevPropTaxN = Math.min(PRICE_MAX, Math.max(0, parseAmount(prevPropTax)))

  /* 1세대1주택은 단독 1주택일 때만 의미 → 종부세 세액공제 입력도 1주택일 때만 */
  const isOneHouseEffective = houses === 1 && oneHouse

  /* 주 계산 — 전부 lib */
  const r = useMemo(
    () =>
      calcHoldingTax({
        publicPrice: totalPriceN,
        publicPrices: multi ? housePricesN : undefined,
        houses,
        oneHouse: isOneHouseEffective,
        urbanArea,
        holdYears: isOneHouseEffective ? holdYearsN : 0,
        age: isOneHouseEffective ? ageN : 0,
      }),
    [totalPriceN, multi, housePricesN, houses, isOneHouseEffective, urbanArea, holdYearsN, ageN],
  )

  const { property: p, comp: c } = r

  /* 표시용 적용 요율 (lib 헬퍼 — 재구현 아님) */
  const elderRate = compElderRate(isOneHouseEffective ? ageN : 0)
  const longHoldRate = compLongHoldRate(isOneHouseEffective ? holdYearsN : 0)

  const hasPrice = totalPriceN > 0

  /* 주택 수 변경 — 다주택으로 처음 바꿀 때 1주택 입력값을 첫 칸으로 옮겨 준다 */
  const changeHouses = (h: HouseCount) => {
    setHouses(h)
    if (h !== 1 && prices.every((v) => !v) && price) setPrices([price, ...prices.slice(1)])
  }
  const setHousePrice = (i: number, v: string) =>
    setPrices((prev) => {
      const next = [...prev]
      while (next.length <= i) next.push('')
      next[i] = commafy(v)
      return next
    })

  /* 복사 */
  const summary = useMemo(() => {
    const houseLabel = HOUSE_SEGS.find((h) => h.id === houses)!.label
    return (
      `[주택 보유세 추정]\n` +
      `공시가격${multi ? ' 합계' : ''} ${fmtWon(totalPriceN)}원 · ${houseLabel}${isOneHouseEffective ? ' · 1세대1주택' : ''}\n` +
      `연간 총 보유세 약 ${fmtWon(r.total)}원 (월 ${fmtWon(r.monthly)}원)\n` +
      `· 재산세 ${fmtWon(p.total)}원 (본세 ${fmtWon(p.baseTax)} + 도시지역분 ${fmtWon(p.urbanTax)} + 지방교육세 ${fmtWon(p.eduTax)})\n` +
      `· 종합부동산세 ${c.taxable ? `${fmtWon(c.total)}원 (결정세액 ${fmtWon(c.decidedTax)} + 농특세 ${fmtWon(c.ruralTax)})` : '비과세'}\n` +
      `· 공시가 대비 실효세율 ${pct(r.effectiveRate)}\n` +
      `※ 2026 기준 단순 추정 · 위택스/홈택스 확인 · youtil.kr`
    )
  }, [totalPriceN, multi, houses, isOneHouseEffective, r, p, c])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className={s.wrap}>
      {/* ── 공시가격 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>주택 공시가격</span>
        {!multi ? (
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="pht-price">공시가격 (원)</label>
            <input
              id="pht-price"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={price}
              onChange={(e) => setPrice(commafy(e.target.value))}
              placeholder="800,000,000"
            />
            <p className={s.helpText}>
              {hasPrice ? (
                <>
                  <strong className={s.cellAccent}>{eokLabel(priceN)}</strong> 입력됨 · 부동산 공시가격 알리미(공동주택공시가격) 기준
                </>
              ) : (
                '국토부 부동산 공시가격 알리미의 공시가격을 입력하세요'
              )}
            </p>
          </div>
        ) : (
          <>
            {Array.from({ length: houseInputCount }, (_, i) => (
              <div className={s.field} key={i}>
                <label className={s.fieldLabel} htmlFor={`pht-price-${i + 1}`}>{i + 1}번 주택 공시가격 (원)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    id={`pht-price-${i + 1}`}
                    type="text"
                    inputMode="numeric"
                    className={s.input}
                    value={prices[i] ?? ''}
                    onChange={(e) => setHousePrice(i, e.target.value)}
                    placeholder="0"
                  />
                  {houses === 3 && i >= 3 && i === houseInputCount - 1 && (
                    <button
                      type="button"
                      className={s.houseBtn}
                      onClick={() => setPrices((prev) => prev.slice(0, i))}
                      aria-label={`${i + 1}번 주택 입력칸 삭제`}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))}
            {houses === 3 && houseInputCount < MAX_HOUSE_INPUTS && (
              <button
                type="button"
                className={s.houseBtn}
                style={{ alignSelf: 'flex-start', marginBottom: 12 }}
                onClick={() => setHousePrice(houseInputCount, '')}
              >
                + 주택 추가
              </button>
            )}
            <p className={s.helpText}>
              {hasPrice && <><strong className={s.cellAccent}>합계 {eokLabel(totalPriceN)}</strong> · </>}
              재산세는 주택마다 따로 계산해 더하고, 종합부동산세는 공시가격 합계로 계산합니다.
            </p>
          </>
        )}
      </div>

      {/* ── 보유 주택 수 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>보유 주택 수</span>
        <div className={s.segment} role="group" aria-label="보유 주택 수 선택">
          {HOUSE_SEGS.map((h) => (
            <button
              key={h.id}
              type="button"
              className={`${s.seg} ${houses === h.id ? s.segActive : ''}`}
              onClick={() => changeHouses(h.id)}
              aria-pressed={houses === h.id}
            >
              {h.label}
            </button>
          ))}
        </div>
        <p className={s.helpText}>
          {houses >= 3
            ? '3주택 이상은 종부세 과세표준 12억 초과분에 중과세율(최대 5.0%)이 적용됩니다.'
            : '2주택 이하는 종부세 일반세율(0.5~2.7%)이 적용됩니다.'}
        </p>
      </div>

      {/* ── 옵션 토글 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>적용 조건</span>

        <div className={s.toggleRow}>
          <div className={s.toggleInfo}>
            <span className={s.toggleName}>1세대 1주택자</span>
            <span className={s.toggleDesc}>
              재산세 특례세율·공정시장가액비율 43~45%, 종부세 12억 공제·세액공제 대상
            </span>
          </div>
          <div className={s.miniSeg} role="group" aria-label="1세대 1주택 여부">
            <button
              type="button"
              className={`${s.miniBtn} ${oneHouse && houses === 1 ? s.miniBtnActive : ''}`}
              onClick={() => { setHouses(1); setOneHouse(true) }}
              aria-pressed={oneHouse && houses === 1}
            >
              예
            </button>
            <button
              type="button"
              className={`${s.miniBtn} ${!(oneHouse && houses === 1) ? s.miniBtnActive : ''}`}
              onClick={() => setOneHouse(false)}
              aria-pressed={!(oneHouse && houses === 1)}
            >
              아니오
            </button>
          </div>
        </div>

        <div className={s.toggleRow}>
          <div className={s.toggleInfo}>
            <span className={s.toggleName}>도시지역분 포함</span>
            <span className={s.toggleDesc}>
              도시지역 소재 시 과세표준 × 0.14% 추가 과세 (대부분 도시 지역 해당)
            </span>
          </div>
          <div className={s.miniSeg} role="group" aria-label="도시지역분 포함 여부">
            <button
              type="button"
              className={`${s.miniBtn} ${urbanArea ? s.miniBtnActive : ''}`}
              onClick={() => setUrbanArea(true)}
              aria-pressed={urbanArea}
            >
              ON
            </button>
            <button
              type="button"
              className={`${s.miniBtn} ${!urbanArea ? s.miniBtnActive : ''}`}
              onClick={() => setUrbanArea(false)}
              aria-pressed={!urbanArea}
            >
              OFF
            </button>
          </div>
        </div>

        {houses === 1 && oneHouse && (
          <div className={s.row2} style={{ marginTop: 14 }}>
            <div className={s.field} style={{ marginBottom: 0 }}>
              <label className={s.fieldLabel} htmlFor="pht-hold">보유기간 (장기보유 세액공제)</label>
              <div className={s.inputUnit}>
                <input
                  id="pht-hold"
                  type="text"
                  inputMode="numeric"
                  className={s.input}
                  value={holdYears}
                  onChange={(e) => setHoldYears(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
                />
                <span className={s.unitSuffix}>년</span>
              </div>
            </div>
            <div className={s.field} style={{ marginBottom: 0 }}>
              <label className={s.fieldLabel} htmlFor="pht-age">만 나이 (고령자 세액공제)</label>
              <div className={s.inputUnit}>
                <input
                  id="pht-age"
                  type="text"
                  inputMode="numeric"
                  className={s.input}
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                />
                <span className={s.unitSuffix}>세</span>
              </div>
            </div>
          </div>
        )}
        {houses === 1 && oneHouse && (
          <p className={s.helpText}>
            장기보유: 5년 20% · 10년 40% · 15년 50% / 고령자: 60세 20% · 65세 30% · 70세 40% (합산 한도 80%) — 종부세 과세 시에만 적용
          </p>
        )}
      </div>

      {/* ── 보조: 전년 재산세 본세 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>전년 재산세 본세 (선택 — 세부담 상한 안내용)</span>
        <div className={s.field} style={{ marginBottom: 0 }}>
          <label className={s.fieldLabel} htmlFor="pht-prev">작년 재산세 본세 (원)</label>
          <input
            id="pht-prev"
            type="text"
            inputMode="numeric"
            className={s.input}
            value={prevPropTax}
            onChange={(e) => setPrevPropTax(commafy(e.target.value))}
            placeholder="미입력 시 미적용"
          />
          <p className={s.helpText}>
            입력하면 세부담 상한(전년 대비 인상 한도) 안내를 약식으로 보여줍니다. 계산에는 반영하지 않습니다.
          </p>
        </div>
      </div>

      {/* ── 결과: 히어로 ── */}
      {!hasPrice ? (
        <div className={s.card} style={{ textAlign: 'center', padding: '26px 22px' }}>
          <p style={{ fontSize: 30, margin: '0 0 8px' }} aria-hidden>🏠</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>공시가격을 입력하세요</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            공시가격을 넣으면 재산세·종합부동산세·도시지역분·농특세를 추정합니다.
          </p>
        </div>
      ) : (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>연간 총 보유세 (재산세 + 종합부동산세, 추정)</p>
            <p className={s.heroValue} role="status">
              {fmtWon(r.total)}
              <span className={s.heroUnit}>원</span>
            </p>
            <div className={s.badges}>
              <span className={s.badge}>공정시장가액비율 <strong>{pct(p.fmvRatio)}</strong></span>
              <span className={s.badge}>종부세 FMV <strong>{pct(COMP_FMV_RATIO)}</strong></span>
              <span className={`${s.badge} ${p.specialRate ? s.badgeSpecial : ''}`}>
                {p.specialRate ? '재산세 특례세율' : '재산세 표준세율'}
              </span>
              {houses >= 3 && c.taxable && <span className={`${s.badge} ${s.badgeSpecial}`}>종부세 중과세율</span>}
            </div>
            <div className={s.subline}>
              <span>월 환산 <strong>{fmtWon(r.monthly)}원</strong></span>
              <span>공시가 대비 실효세율 <strong>{pct(r.effectiveRate)}</strong></span>
            </div>
            <button type="button" className={s.copyBtn} onClick={onCopy}>
              {copied ? '복사됨' : '결과 요약 복사'}
            </button>
          </div>

          {/* ── 두 세금 합계 요약 ── */}
          <div className={s.card}>
            <span className={s.cardLabel}>세목별 합계</span>
            <div className={s.summaryGrid}>
              <div className={s.summaryItem}>
                <div className={s.sumLabel}>재산세 합계</div>
                <div className={s.sumValue}>{fmtWon(p.total)}<span className="won">원</span></div>
              </div>
              <div className={s.summaryItem}>
                <div className={s.sumLabel}>
                  종합부동산세
                  {!c.taxable && <span className={s.exemptTag}>비과세</span>}
                </div>
                <div className={s.sumValue}>{fmtWon(c.total)}<span className="won">원</span></div>
              </div>
            </div>
            {!c.taxable && (
              <p className={s.helpText}>
                공시가격이 기본공제({isOneHouseEffective ? '1세대1주택 12억' : '일반 9억'}) 이하라 <strong>종합부동산세는 부과되지 않습니다</strong>. 재산세만 납부합니다.
              </p>
            )}
          </div>

          {/* ── 재산세 분해 ── */}
          <div className={s.card}>
            <span className={s.cardLabel}>재산세 분해</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <caption>재산세 (주택분)</caption>
                <tbody>
                  <tr>
                    <td>{multi ? `과세표준 (주택별 공시 × ${pct(p.fmvRatio)} 합계)` : `과세표준 (공시 ${fmtWon(priceN)} × ${pct(p.fmvRatio)})`}</td>
                    <td className={s.cellMono}>{fmtWon(p.taxBase)}원</td>
                  </tr>
                  <tr>
                    <td>
                      재산세 본세
                      {p.specialRate && <span className={s.badge} style={{ marginLeft: 8, padding: '2px 8px', fontSize: 11 }}>1주택 특례세율</span>}
                    </td>
                    <td className={s.cellMono}>{fmtWon(p.baseTax)}원</td>
                  </tr>
                  <tr>
                    <td>도시지역분 ({urbanArea ? `과표 × ${pct(URBAN_AREA_RATE)}` : '미적용'})</td>
                    <td className={s.cellMono}>{p.urbanTax > 0 ? `${fmtWon(p.urbanTax)}원` : '—'}</td>
                  </tr>
                  <tr>
                    <td>지방교육세 (본세 × {pct(LOCAL_EDU_RATE)})</td>
                    <td className={s.cellMono}>{fmtWon(p.eduTax)}원</td>
                  </tr>
                  <tr className={s.cellTotal}>
                    <td><strong>재산세 합계</strong></td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtWon(p.total)}원</strong></td>
                  </tr>
                  {r.perHouse.length > 1 && r.perHouse.map((h, i) => (
                    <tr className={s.subRow} key={i}>
                      <td>┗ 주택 {houseNos[i] ?? i + 1} (공시 {eokLabel(Math.round(h.taxBase / h.fmvRatio))})</td>
                      <td className={s.cellMono}>{fmtWon(h.total)}원</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 종부세 분해 ── */}
          <div className={s.card}>
            <span className={s.cardLabel}>종합부동산세 분해</span>
            {!c.taxable ? (
              <div className={s.tipBox}>
                💡 과세표준이 기본공제(<strong>{isOneHouseEffective ? '1세대1주택 12억원' : '일반 9억원'}</strong>) 이하 — 종합부동산세 비과세입니다.
                공시가격이 {eokLabel(c.deduction)}을 넘는 시점부터 종부세가 발생합니다.
              </div>
            ) : (
              <div className={s.tableScroll}>
                <table className={s.detailTable}>
                  <caption>종합부동산세 (주택분)</caption>
                  <tbody>
                    <tr>
                      <td>기본공제 ({isOneHouseEffective ? '1세대1주택' : '일반'})</td>
                      <td className={s.cellMono}>−{fmtWon(c.deduction)}원</td>
                    </tr>
                    <tr>
                      <td>과세표준 ((공시 − 공제) × {pct(COMP_FMV_RATIO)})</td>
                      <td className={s.cellMono}>{fmtWon(c.taxBase)}원</td>
                    </tr>
                    <tr>
                      <td>산출세액 ({houses >= 3 ? '중과세율' : '일반세율'})</td>
                      <td className={s.cellMono}>{fmtWon(c.computedTax)}원</td>
                    </tr>
                    <tr className={s.subRow}>
                      <td>┗ 재산세 중복분 공제</td>
                      <td className={s.cellMono}>−{fmtWon(c.propOverlap)}원</td>
                    </tr>
                    {isOneHouseEffective && (
                      <tr className={s.subRow}>
                        <td>
                          ┗ 세액공제 (고령 {pct(elderRate)} + 장기 {pct(longHoldRate)})
                        </td>
                        <td className={s.cellMono}>{c.creditRate > 0 ? `−${pct(c.creditRate)}` : '—'}</td>
                      </tr>
                    )}
                    <tr>
                      <td>결정세액</td>
                      <td className={s.cellMono}>{fmtWon(c.decidedTax)}원</td>
                    </tr>
                    <tr>
                      <td>농어촌특별세 (결정세액 × {pct(COMP_RURAL_RATE)})</td>
                      <td className={s.cellMono}>{fmtWon(c.ruralTax)}원</td>
                    </tr>
                    <tr className={s.cellTotal}>
                      <td><strong>종합부동산세 합계</strong></td>
                      <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{fmtWon(c.total)}원</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {c.taxable && (
              <p className={s.helpText}>
                ※ 재산세 중복분 공제는 종부세 과세표준에 해당하는 재산세 상당액(과세표준 × 재산세 공정시장가액비율 × 0.4%)을 부과된 재산세 비율로 환산한 값입니다(세부담상한 미반영). 세액공제(고령·장기)는 1세대 1주택자만 적용되며 합산 한도 80%입니다.
              </p>
            )}
          </div>

          {/* ── 세부담 상한 안내 (전년 입력 시) ── */}
          {prevPropTaxN > 0 && (
            <div className={s.warnCard}>
              <strong>세부담 상한 안내 (약식 · 미반영)</strong>
              <p>
                재산세는 전년 대비 일정 비율(공시 3억 이하 105% · 3~6억 110% · 6억 초과 130%)을 넘지 못하는 세부담 상한이 있습니다.
                입력한 전년 재산세 본세 <strong style={{ color: 'var(--text)' }}>{fmtWon(prevPropTaxN)}원</strong> 기준,
                올해 본세 {fmtWon(p.baseTax)}원이 상한을 넘으면 실제 고지액은 더 낮아질 수 있습니다.
                본 계산기는 상한을 <strong style={{ color: 'var(--text)' }}>반영하지 않으므로</strong> 정확한 고지액은 위택스에서 확인하세요.
              </p>
            </div>
          )}
        </>
      )}

      <a href="/tools/finance/real-estate" className={s.crossLink}>
        부동산 수익률 계산기 → 보유세·대출까지 반영한 실제 수익률 확인
      </a>
    </div>
  )
}
