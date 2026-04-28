'use client'

import { useMemo, useState } from 'react'
import s from './installment.module.css'

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const parseComma = (v: string): number => {
  const x = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(x) ? x : 0
}
const fmt = (v: number, dp = 0): string =>
  v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp })
const fmtKRW = (v: number): string => `${Math.round(v).toLocaleString('ko-KR')}원`
const fmtComma = (v: string): string => {
  const num = v.replace(/[^\d]/g, '')
  if (!num) return ''
  return parseInt(num, 10).toLocaleString('ko-KR')
}

// ─────────────────────────────────────────────
// 카드사 프리셋
// ─────────────────────────────────────────────
type CardBrandKey = 'shinhan' | 'samsung' | 'kbk' | 'hyundai' | 'lotte' | 'woori' | 'nh' | 'hana' | 'custom'
const CARD_BRANDS: { key: CardBrandKey; name: string; rate: number; range: string; cls: string }[] = [
  { key: 'shinhan', name: '신한카드',   rate: 19.9, range: '15.0~19.9%', cls: s.cbShinhan },
  { key: 'samsung', name: '삼성카드',   rate: 19.9, range: '15.0~19.9%', cls: s.cbSamsung },
  { key: 'kbk',     name: 'KB국민카드', rate: 19.9, range: '15.0~19.9%', cls: s.cbKbk },
  { key: 'hyundai', name: '현대카드',   rate: 18.9, range: '14.0~18.9%', cls: s.cbHyundai },
  { key: 'lotte',   name: '롯데카드',   rate: 19.9, range: '15.0~19.9%', cls: s.cbLotte },
  { key: 'woori',   name: '우리카드',   rate: 19.5, range: '14.5~19.5%', cls: s.cbWoori },
  { key: 'nh',      name: 'NH농협카드', rate: 19.5, range: '15.0~19.5%', cls: s.cbNh },
  { key: 'hana',    name: '하나카드',   rate: 19.5, range: '14.5~19.5%', cls: s.cbHana },
  { key: 'custom',  name: '직접 입력',  rate: 18.0, range: '',           cls: s.cbCustom },
]

const MONTH_OPTIONS = [2, 3, 4, 5, 6, 9, 10, 12, 18, 24, 36]

// ─────────────────────────────────────────────
// 계산 함수
// ─────────────────────────────────────────────
type InstallType = 'free' | 'partial' | 'paid'

function calcFree(amount: number, months: number) {
  return {
    monthlyPayment: months > 0 ? amount / months : 0,
    totalPayment: amount,
    totalInterest: 0,
  }
}

function calcPaid(amount: number, months: number, annualRate: number) {
  if (months <= 0 || amount <= 0) return { monthlyPayment: 0, totalPayment: 0, totalInterest: 0 }
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) {
    return { monthlyPayment: amount / months, totalPayment: amount, totalInterest: 0 }
  }
  const monthlyPayment =
    (amount * (monthlyRate * Math.pow(1 + monthlyRate, months))) /
    (Math.pow(1 + monthlyRate, months) - 1)
  const totalPayment = monthlyPayment * months
  const totalInterest = totalPayment - amount
  return { monthlyPayment, totalPayment, totalInterest }
}

function calcPartial(amount: number, months: number, freeMonths: number, annualRate: number) {
  if (freeMonths >= months) return calcFree(amount, months)
  if (freeMonths <= 0) return calcPaid(amount, months, annualRate)
  const freeAmount = (amount / months) * freeMonths
  const paidAmount = amount - freeAmount
  const paidMonths = months - freeMonths
  const paid = calcPaid(paidAmount, paidMonths, annualRate)
  const totalPayment = freeAmount + paid.totalPayment
  return {
    monthlyPayment: totalPayment / months,
    totalPayment,
    totalInterest: paid.totalInterest,
  }
}

// 월별 상환 스케줄 (원리금균등 — 유이자만)
function buildSchedule(amount: number, months: number, annualRate: number) {
  if (amount <= 0 || months <= 0) return []
  const monthlyRate = annualRate / 100 / 12
  const r = calcPaid(amount, months, annualRate)
  let balance = amount
  const rows: { month: number; pay: number; principal: number; interest: number; balance: number }[] = []
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate
    const principal = r.monthlyPayment - interest
    balance = Math.max(0, balance - principal)
    rows.push({ month: i, pay: r.monthlyPayment, principal, interest, balance })
  }
  return rows
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function CardInstallmentClient() {
  const [tab, setTab] = useState<'calc' | 'compare' | 'months'>('calc')

  // ─ TAB 1 ─
  const [amount, setAmount] = useState<string>('1,000,000')
  const [months, setMonths] = useState<number>(12)
  const [customMonth, setCustomMonth] = useState<string>('')
  const [installType, setInstallType] = useState<InstallType>('paid')
  const [brand, setBrand] = useState<CardBrandKey>('shinhan')
  const [rate, setRate] = useState<string>('19.9')
  const [freeMonths, setFreeMonths] = useState<string>('4')
  const [cashDiscount, setCashDiscount] = useState<string>('0')
  const [rewardPoints, setRewardPoints] = useState<string>('0')
  const [shippingFee, setShippingFee] = useState<string>('0')

  // ─ TAB 2 ─
  const [cmpAmount, setCmpAmount] = useState<string>('1,000,000')
  const [cmpDiscount, setCmpDiscount] = useState<string>('5')
  const [cmpFreeMonths, setCmpFreeMonths] = useState<number>(6)
  const [cmpPaidMonths, setCmpPaidMonths] = useState<number>(12)
  const [cmpRate, setCmpRate] = useState<string>('19.9')
  const [parkingRate, setParkingRate] = useState<string>('3.0')

  // ─ TAB 3 ─
  const [tblAmount, setTblAmount] = useState<string>('1,000,000')
  const [tblRate, setTblRate] = useState<string>('19.9')
  const [tblIsFree, setTblIsFree] = useState<boolean>(false)

  // ─ COPY ─
  const [copied, setCopied] = useState<boolean>(false)

  const effMonths = months === 0 ? Math.max(1, parseComma(customMonth) || 1) : months

  // 카드사 변경 시 자동 rate
  function selectBrand(k: CardBrandKey) {
    setBrand(k)
    const b = CARD_BRANDS.find(x => x.key === k)
    if (b && k !== 'custom') setRate(b.rate.toString())
  }

  // ─────────────────────────────────────────────
  // TAB 1 계산
  // ─────────────────────────────────────────────
  const calc = useMemo(() => {
    const amt = parseComma(amount)
    const r = parseFloat(rate) || 0
    const fm = parseComma(freeMonths)
    if (installType === 'free')   return calcFree(amt, effMonths)
    if (installType === 'partial') return calcPartial(amt, effMonths, fm, r)
    return calcPaid(amt, effMonths, r)
  }, [amount, effMonths, installType, rate, freeMonths])

  const cashPrice = useMemo(() => {
    const amt = parseComma(amount)
    const disc = parseFloat(cashDiscount) || 0
    const points = parseComma(rewardPoints)
    return amt * (1 - disc / 100) - points
  }, [amount, cashDiscount, rewardPoints])

  const schedule = useMemo(() => {
    if (installType !== 'paid') return []
    const amt = parseComma(amount)
    const r = parseFloat(rate) || 0
    return buildSchedule(amt, effMonths, r)
  }, [amount, effMonths, rate, installType])

  // 해석 문구
  const interpretation = useMemo(() => {
    const amt = parseComma(amount)
    const totalExtra = calc.totalInterest + parseComma(shippingFee)
    if (totalExtra <= 0) return null
    const cafes = Math.floor(totalExtra / 4000)
    const meals = Math.floor(totalExtra / 10000)
    return { amt, totalExtra, cafes, meals }
  }, [amount, calc, shippingFee])

  // ─────────────────────────────────────────────
  // TAB 2 계산
  // ─────────────────────────────────────────────
  const cmpCalc = useMemo(() => {
    const amt = parseComma(cmpAmount)
    const disc = parseFloat(cmpDiscount) || 0
    const r = parseFloat(cmpRate) || 0
    const cash = amt * (1 - disc / 100)
    const free = calcFree(amt, cmpFreeMonths)
    const paid = calcPaid(amt, cmpPaidMonths, r)
    return { cash, free: { ...free, total: amt }, paid: { ...paid, total: paid.totalPayment }, amt, disc }
  }, [cmpAmount, cmpDiscount, cmpFreeMonths, cmpPaidMonths, cmpRate])

  // 기회비용
  const opportunity = useMemo(() => {
    const amt = parseComma(cmpAmount)
    const disc = parseFloat(cmpDiscount) || 0
    const pRate = parseFloat(parkingRate) || 0
    // 일시불 시 즉시 할인 이익
    const instantDiscount = (amt * disc) / 100
    // 무이자 시 매월 amt/cmpFreeMonths씩 빠지고, 평균 잔액으로 운용
    // 단순: 평균 잔액 = amt / 2, 보유 기간 = freeMonths개월
    const avgBalance = amt / 2
    const monthlyParkingRate = pRate / 100 / 12
    const parkingInterest = avgBalance * monthlyParkingRate * cmpFreeMonths
    return { instantDiscount, parkingInterest, diff: instantDiscount - parkingInterest }
  }, [cmpAmount, cmpDiscount, cmpFreeMonths, parkingRate])

  // 시나리오 해석
  const cmpInterpretation = useMemo(() => {
    const cashSaving = cmpCalc.amt - cmpCalc.cash // 일시불 할인 금액
    const paidExtra = cmpCalc.paid.totalInterest // 유이자 추가비용
    if (cashSaving > 0 && cashSaving > opportunity.parkingInterest) {
      return {
        type: 'cash' as const,
        text: `일시불 할인이 더 유리합니다 (약 ${fmtKRW(cashSaving - opportunity.parkingInterest)} 차이). 현금 여유가 있다면 일시불을 선택하세요.`,
      }
    }
    if (cashSaving <= opportunity.parkingInterest && cashSaving < 30000) {
      return {
        type: 'free' as const,
        text: `무이자 할부가 더 유리합니다. 현금 흐름 분산 효과까지 고려하면 무이자가 합리적입니다.`,
      }
    }
    if (paidExtra > 50000) {
      return {
        type: 'paid' as const,
        text: `유이자 할부는 약 ${fmtKRW(paidExtra)}의 이자 부담이 발생합니다. 가능하면 일시불 또는 무이자 할부를 선택하세요.`,
      }
    }
    return {
      type: 'free' as const,
      text: '무이자 할부와 일시불 할인의 차이가 크지 않습니다. 현금 흐름을 고려해 선택하세요.',
    }
  }, [cmpCalc, opportunity])

  // ─────────────────────────────────────────────
  // TAB 3 계산
  // ─────────────────────────────────────────────
  const tableRows = useMemo(() => {
    const amt = parseComma(tblAmount)
    const r = tblIsFree ? 0 : (parseFloat(tblRate) || 0)
    const months = [2, 3, 6, 9, 12, 18, 24, 36]
    return months.map(m => {
      const c = r === 0 ? calcFree(amt, m) : calcPaid(amt, m, r)
      const burdenRate = amt > 0 ? (c.monthlyPayment / amt) * 100 : 0
      const interestPctOfPrincipal = amt > 0 ? (c.totalInterest / amt) * 100 : 0
      let phase: 'safe' | 'mid' | 'danger' = 'safe'
      if (m >= 18 || interestPctOfPrincipal > 15) phase = 'danger'
      else if (m >= 9) phase = 'mid'
      return { months: m, ...c, burdenRate, interestPctOfPrincipal, phase }
    })
  }, [tblAmount, tblRate, tblIsFree])

  // 추천 카드 (탭 3)
  const recommendation = useMemo(() => {
    const amt = parseComma(tblAmount)
    if (amt <= 0) return null
    if (tblIsFree) return { text: '무이자 할부는 가능한 최장 개월을 선택해도 비용 부담이 없습니다. 다만 24개월 이상 무이자는 부분 무이자일 가능성이 높으니 약관을 꼭 확인하세요.' }
    if (amt < 500000) return { text: `구매금액이 50만원 미만이라면 일시불 또는 6개월 이내 짧은 할부를 권장합니다. 유이자 할부는 부담 대비 이자 비용이 크지 않지만, 카드 포인트·캐시백을 활용한 일시불이 가장 효율적입니다.` }
    if (amt < 2000000) return { text: `50만~200만원 구매는 무이자 6~12개월이 가장 합리적입니다. 무이자 불가 시 6개월 이내(이자 2% 이내) 할부를 선택하세요.` }
    return { text: `200만원을 초과하는 구매는 일시불 + 캐시백 카드 활용을 우선 검토하세요. 유이자 할부 시 24개월 이상은 총 이자가 원금의 20%를 넘어 부담이 큽니다. 가능하면 무이자 12~24개월을 활용하세요.` }
  }, [tblAmount, tblIsFree])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    let text = ''
    if (tab === 'calc') {
      text = [
        `[카드 할부 계산]`,
        `구매금액: ${fmtKRW(parseComma(amount))}`,
        `할부: ${effMonths}개월 (${installType === 'free' ? '무이자' : installType === 'partial' ? '부분 무이자' : '유이자'})`,
        installType !== 'free' ? `연 수수료율: ${rate}%` : '',
        ``,
        `월 납부액: ${fmtKRW(calc.monthlyPayment)}`,
        `총 납부액: ${fmtKRW(calc.totalPayment)}`,
        `총 이자: ${fmtKRW(calc.totalInterest)}`,
        ``,
        `https://youtil.kr/tools/finance/installment`,
      ].filter(Boolean).join('\n')
    } else if (tab === 'compare') {
      text = [
        `[일시불 vs 할부 비교]`,
        `구매금액: ${fmtKRW(cmpCalc.amt)}`,
        ``,
        `🟢 일시불 (${cmpDiscount}% 할인): ${fmtKRW(cmpCalc.cash)}`,
        `🟡 무이자 ${cmpFreeMonths}개월: ${fmtKRW(cmpCalc.free.total)} (월 ${fmtKRW(cmpCalc.free.monthlyPayment)})`,
        `🔴 유이자 ${cmpPaidMonths}개월 (${cmpRate}%): ${fmtKRW(cmpCalc.paid.total)} (월 ${fmtKRW(cmpCalc.paid.monthlyPayment)})`,
        ``,
        `해석: ${cmpInterpretation.text}`,
        ``,
        `https://youtil.kr/tools/finance/installment`,
      ].join('\n')
    } else {
      text = [
        `[개월수별 할부 비교]`,
        `구매금액: ${fmtKRW(parseComma(tblAmount))} · ${tblIsFree ? '무이자' : `연 ${tblRate}% 유이자`}`,
        ``,
        ...tableRows.map(r => `${r.months}개월: 월 ${fmtKRW(r.monthlyPayment)} / 총 ${fmtKRW(r.totalPayment)} / 이자 ${fmtKRW(r.totalInterest)}`),
        ``,
        `https://youtil.kr/tools/finance/installment`,
      ].join('\n')
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // 그래프 SVG (탭 3)
  const graph = useMemo(() => {
    if (tableRows.length === 0) return null
    const W = 320, H = 180
    const padL = 36, padR = 36, padT = 16, padB = 28
    const innerW = W - padL - padR
    const innerH = H - padT - padB
    const maxMonthly = Math.max(...tableRows.map(r => r.monthlyPayment))
    const maxInterest = Math.max(...tableRows.map(r => r.totalInterest), 1)
    const barW = innerW / tableRows.length * 0.55

    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className={s.graphSvg} aria-hidden="true">
        {/* 막대: 총 이자 */}
        {tableRows.map((r, i) => {
          const cx = padL + (innerW / tableRows.length) * (i + 0.5)
          const h = (r.totalInterest / maxInterest) * innerH
          return (
            <rect
              key={`b-${i}`}
              x={cx - barW / 2}
              y={padT + innerH - h}
              width={barW}
              height={h}
              fill="#FF6B6B"
              opacity={0.55}
            />
          )
        })}
        {/* 꺾은선: 월 납부액 */}
        <polyline
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          points={tableRows.map((r, i) => {
            const cx = padL + (innerW / tableRows.length) * (i + 0.5)
            const y = padT + innerH - (r.monthlyPayment / maxMonthly) * innerH
            return `${cx},${y}`
          }).join(' ')}
        />
        {tableRows.map((r, i) => {
          const cx = padL + (innerW / tableRows.length) * (i + 0.5)
          const y = padT + innerH - (r.monthlyPayment / maxMonthly) * innerH
          return <circle key={`p-${i}`} cx={cx} cy={y} r={3} fill="var(--accent)" />
        })}
        {/* X축 라벨 */}
        {tableRows.map((r, i) => {
          const cx = padL + (innerW / tableRows.length) * (i + 0.5)
          return (
            <text key={`l-${i}`} x={cx} y={H - 8} fontSize="9" fill="var(--muted)" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={700}>
              {r.months}
            </text>
          )
        })}
      </svg>
    )
  }, [tableRows])

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <div className={s.disclaimer}>
        <strong>참고용 추정값입니다.</strong> 단순 원리금균등상환 방식 기준이며,
        실제 카드 할부 수수료는 카드사·회원 등급·상품·결제일에 따라 달라질 수 있습니다.
        정확한 수수료는 카드사 공식 홈페이지나 고객센터에서 확인하세요.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'calc'    ? s.tabActive : ''}`} onClick={() => setTab('calc')}>할부 계산</button>
        <button className={`${s.tabBtn} ${tab === 'compare' ? s.tabActive : ''}`} onClick={() => setTab('compare')}>일시불 vs 할부</button>
        <button className={`${s.tabBtn} ${tab === 'months'  ? s.tabActive : ''}`} onClick={() => setTab('months')}>개월수별 비교</button>
      </div>

      {/* ──────────── TAB 1 ──────────── */}
      {tab === 'calc' && (
        <>
          {/* 구매금액 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>구매금액</span>
              <span className={s.cardLabelHint}>천단위 콤마 자동</span>
            </div>
            <div className={s.inputRow}>
              <input
                className={s.bigInput}
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={e => setAmount(fmtComma(e.target.value))}
                placeholder="1,000,000"
              />
              <span className={s.unit}>원</span>
            </div>
          </div>

          {/* 할부 개월 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>할부 개월</span>
              <span className={s.cardLabelHint}>한국 카드 표준</span>
            </div>
            <div className={s.monthsGrid}>
              {MONTH_OPTIONS.map(m => (
                <button
                  key={m}
                  className={`${s.monthBtn} ${months === m ? s.monthActive : ''}`}
                  onClick={() => setMonths(m)}
                  type="button"
                >
                  {m}개월
                </button>
              ))}
              <button
                className={`${s.monthBtn} ${months === 0 ? s.monthActive : ''}`}
                onClick={() => setMonths(0)}
                type="button"
              >
                직접
              </button>
            </div>
            {months === 0 && (
              <div className={s.monthCustomRow}>
                <span className={s.subLabel}>개월 수 직접 입력</span>
                <input
                  className={s.smallInput}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={customMonth}
                  onChange={e => setCustomMonth(e.target.value)}
                  placeholder="예: 15"
                />
              </div>
            )}
          </div>

          {/* 할부 종류 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>할부 종류</span>
              <span className={s.cardLabelHint}>이자 발생 여부</span>
            </div>
            <div className={s.typeGrid}>
              <button
                className={`${s.typeBtn} ${s.typeFree} ${installType === 'free' ? s.typeActive : ''}`}
                onClick={() => setInstallType('free')}
                type="button"
              >
                <span>🟢 무이자 할부</span>
                <span className={s.typeBadge}>0% 이자</span>
              </button>
              <button
                className={`${s.typeBtn} ${s.typePartial} ${installType === 'partial' ? s.typeActive : ''}`}
                onClick={() => setInstallType('partial')}
                type="button"
              >
                <span>🟡 부분 무이자</span>
                <span className={s.typeBadge}>일부 무이자</span>
              </button>
              <button
                className={`${s.typeBtn} ${s.typePaid} ${installType === 'paid' ? s.typeActive : ''}`}
                onClick={() => setInstallType('paid')}
                type="button"
              >
                <span>🔴 유이자 할부</span>
                <span className={s.typeBadge}>이자 발생</span>
              </button>
            </div>

            {installType !== 'free' && (
              <>
                <div className={s.cardBrandRow}>
                  {CARD_BRANDS.map(b => (
                    <button
                      key={b.key}
                      className={`${s.cardBrandBtn} ${b.cls} ${brand === b.key ? s.cbActive : ''}`}
                      onClick={() => selectBrand(b.key)}
                      type="button"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
                <div className={s.rateRow}>
                  <span className={s.subLabel}>연 수수료율 (%)</span>
                  <div className={s.inputRow}>
                    <input
                      className={s.smallInput}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="50"
                      step="0.1"
                      value={rate}
                      onChange={e => setRate(e.target.value)}
                    />
                    <span className={s.unit}>% / 년</span>
                  </div>
                </div>
              </>
            )}

            {installType === 'partial' && (
              <div className={s.rateRow}>
                <span className={s.subLabel}>무이자 회차 (앞쪽 N회까지)</span>
                <div className={s.inputRow}>
                  <input
                    className={s.smallInput}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={effMonths - 1}
                    step="1"
                    value={freeMonths}
                    onChange={e => setFreeMonths(e.target.value)}
                  />
                  <span className={s.unit}>회 / {effMonths}회 중</span>
                </div>
              </div>
            )}
          </div>

          {/* 추가 옵션 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>추가 옵션 (선택)</span>
              <span className={s.cardLabelHint}>일시불 비교용</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span className={s.subLabel}>일시불 할인율 (%)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="number" inputMode="decimal" min="0" max="30" step="0.5" value={cashDiscount} onChange={e => setCashDiscount(e.target.value)} />
                  <span className={s.unit}>%</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>카드 포인트·캐시백 (원)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="text" inputMode="numeric" value={rewardPoints} onChange={e => setRewardPoints(fmtComma(e.target.value))} placeholder="0" />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>배송비·추가 수수료 (원)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="text" inputMode="numeric" value={shippingFee} onChange={e => setShippingFee(fmtComma(e.target.value))} placeholder="0" />
                  <span className={s.unit}>원</span>
                </div>
              </div>
            </div>
          </div>

          {/* HERO */}
          {parseComma(amount) > 0 && (
            <div className={s.hero}>
              <p className={s.heroLead}>월 납부액</p>
              <div>
                <span className={s.heroNum}>{fmt(Math.round(calc.monthlyPayment))}</span>
                <span className={s.heroUnit}>원</span>
              </div>
              <p className={s.heroSub}>
                {fmtKRW(parseComma(amount))} / {effMonths}개월 /
                {' '}<span className={s.heroSubAccent}>
                  {installType === 'free' ? '무이자' : installType === 'partial' ? `부분 무이자 (${freeMonths}/${effMonths})` : `연 ${rate}%`}
                </span>
              </p>
              {calc.totalInterest > 0 && (
                <p className={s.heroInterest}>
                  +{fmtKRW(calc.totalInterest)}
                  <small>총 이자 (원금 대비 {((calc.totalInterest / parseComma(amount)) * 100).toFixed(1)}%)</small>
                </p>
              )}
            </div>
          )}

          {/* 분석 표 */}
          {parseComma(amount) > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>지불 분석</span>
              </div>
              <table className={s.analysisTable}>
                <tbody>
                  <tr><td>구매금액 (원금)</td><td>{fmtKRW(parseComma(amount))}</td></tr>
                  <tr><td>할부 개월</td><td>{effMonths}개월</td></tr>
                  {installType !== 'free' && <tr><td>연 이자율</td><td>{rate}%</td></tr>}
                  <tr><td>월 납부액</td><td>{fmtKRW(calc.monthlyPayment)}</td></tr>
                  <tr className={s.totalRow}><td>총 납부액</td><td>{fmtKRW(calc.totalPayment)}</td></tr>
                  {calc.totalInterest > 0 && (
                    <tr className={s.interestRow}><td>총 이자</td><td>+{fmtKRW(calc.totalInterest)}</td></tr>
                  )}
                  {parseFloat(cashDiscount) > 0 && (
                    <tr><td>일시불 시 실결제액</td><td>{fmtKRW(cashPrice)}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 비교 막대 그래프 */}
          {parseComma(amount) > 0 && calc.totalInterest > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>일시불 vs 할부 비교</span>
              </div>
              <div className={s.barCompare}>
                {(() => {
                  const amt = parseComma(amount)
                  const max = Math.max(amt, calc.totalPayment)
                  return (
                    <>
                      <div className={s.barRow}>
                        <span className={s.barLabel}>일시불</span>
                        <div className={s.barTrack}>
                          <div className={`${s.barFill} ${s.barFillCash}`} style={{ width: `${(amt / max) * 100}%` }} />
                        </div>
                        <span className={s.barValue}>{fmtKRW(amt)}</span>
                      </div>
                      <div className={s.barRow}>
                        <span className={s.barLabel}>{effMonths}개월 할부</span>
                        <div className={s.barTrack}>
                          <div className={`${s.barFill} ${s.barFillPaid}`} style={{
                            width: `${(calc.totalPayment / max) * 100}%`,
                            ['--principal-pct' as never]: ((amt / calc.totalPayment) * 100).toFixed(0),
                          } as React.CSSProperties} />
                        </div>
                        <span className={s.barValue}>{fmtKRW(calc.totalPayment)}</span>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}

          {/* 해석 */}
          {interpretation && interpretation.totalExtra > 0 && (
            <div className={s.interpretCard}>
              일시불보다 약 <strong>{fmtKRW(interpretation.totalExtra)}</strong>을 더 내는 구조입니다.
              이 금액으로 무엇을 할 수 있을까요?
              <ul>
                <li>카페 약 {interpretation.cafes}회 (4,000원 기준)</li>
                <li>OTT 1년 구독 (Netflix·Wavve 베이직 등)</li>
                <li>외식 약 {interpretation.meals}회 (10,000원 기준)</li>
              </ul>
            </div>
          )}

          {/* 월별 상환 스케줄 (접이식) */}
          {schedule.length > 0 && (
            <details className={s.scheduleDetails}>
              <summary className={s.scheduleSummary}>월별 상환 스케줄 ({schedule.length}회차)</summary>
              <div className={s.scheduleTableWrap}>
                <table className={s.scheduleTable}>
                  <thead>
                    <tr>
                      <th>회차</th>
                      <th>납부액</th>
                      <th>원금</th>
                      <th>이자</th>
                      <th>잔액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(row => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td className={s.colPay}>{fmt(Math.round(row.pay))}</td>
                        <td className={s.colPrincipal}>{fmt(Math.round(row.principal))}</td>
                        <td className={s.colInterest}>{fmt(Math.round(row.interest))}</td>
                        <td className={s.colBalance}>{fmt(Math.round(row.balance))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          {parseComma(amount) > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 2: 일시불 vs 할부 ──────────── */}
      {tab === 'compare' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}><span>비교 입력</span></div>
            <span className={s.subLabel}>구매금액 (원)</span>
            <div className={s.inputRow}>
              <input className={s.bigInput} type="text" inputMode="numeric" value={cmpAmount} onChange={e => setCmpAmount(fmtComma(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <div>
                <span className={s.subLabel}>일시불 할인율 (%)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="number" inputMode="decimal" min="0" max="30" step="0.5" value={cmpDiscount} onChange={e => setCmpDiscount(e.target.value)} />
                  <span className={s.unit}>%</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>유이자 할부 연 수수료율 (%)</span>
                <div className={s.inputRow}>
                  <input className={s.smallInput} type="number" inputMode="decimal" min="0" max="30" step="0.1" value={cmpRate} onChange={e => setCmpRate(e.target.value)} />
                  <span className={s.unit}>%</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>무이자 가능 개월</span>
                <select className={s.smallInput} value={cmpFreeMonths} onChange={e => setCmpFreeMonths(parseInt(e.target.value))}>
                  {[2, 3, 4, 5, 6, 9, 10, 12, 18, 24].map(m => (<option key={m} value={m}>{m}개월</option>))}
                </select>
              </div>
              <div>
                <span className={s.subLabel}>유이자 할부 개월</span>
                <select className={s.smallInput} value={cmpPaidMonths} onChange={e => setCmpPaidMonths(parseInt(e.target.value))}>
                  {[3, 6, 9, 12, 18, 24, 36].map(m => (<option key={m} value={m}>{m}개월</option>))}
                </select>
              </div>
            </div>
          </div>

          {/* 3카드 비교 */}
          {parseComma(cmpAmount) > 0 && (
            <div className={s.compare3Grid}>
              <div className={`${s.compareCard} ${s.cmpCash}`}>
                <p className={s.compareTitle}>🟢 시나리오 1</p>
                <p className={s.compareScenarioName}>일시불 + 할인</p>
                <p className={s.compareTotalLabel}>실결제액 ({cmpDiscount}% 할인)</p>
                <p className={s.compareTotalValue}>{fmtKRW(cmpCalc.cash)}</p>
                <div className={s.compareDetail}>
                  초기 부담: <strong>{fmtKRW(cmpCalc.cash)}</strong><br />
                  월 부담: 0원<br />
                  총 비용: <strong>{fmtKRW(cmpCalc.cash)}</strong>
                </div>
              </div>
              <div className={`${s.compareCard} ${s.cmpFree}`}>
                <p className={s.compareTitle}>🟡 시나리오 2</p>
                <p className={s.compareScenarioName}>무이자 {cmpFreeMonths}개월</p>
                <p className={s.compareTotalLabel}>실결제액</p>
                <p className={s.compareTotalValue}>{fmtKRW(cmpCalc.amt)}</p>
                <div className={s.compareDetail}>
                  초기 부담: 0원<br />
                  월 부담: <strong>{fmtKRW(cmpCalc.free.monthlyPayment)}</strong> × {cmpFreeMonths}개월<br />
                  총 비용: <strong>{fmtKRW(cmpCalc.amt)}</strong>
                </div>
              </div>
              <div className={`${s.compareCard} ${s.cmpPaid}`}>
                <p className={s.compareTitle}>🔴 시나리오 3</p>
                <p className={s.compareScenarioName}>유이자 {cmpPaidMonths}개월</p>
                <p className={s.compareTotalLabel}>실결제액 (이자 포함)</p>
                <p className={s.compareTotalValue}>{fmtKRW(cmpCalc.paid.total)}</p>
                <div className={s.compareDetail}>
                  초기 부담: 0원<br />
                  월 부담: <strong>{fmtKRW(cmpCalc.paid.monthlyPayment)}</strong> × {cmpPaidMonths}개월<br />
                  총 이자: <strong style={{ color: '#FF6B6B' }}>+{fmtKRW(cmpCalc.paid.totalInterest)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* 차이 분석 */}
          {parseComma(cmpAmount) > 0 && (
            <div className={s.diffCard}>
              <div className={s.diffRow}>
                <span>일시불 vs 무이자 {cmpFreeMonths}개월</span>
                <strong className={cmpCalc.cash < cmpCalc.amt ? s.diffPositive : s.diffNegative}>
                  {cmpCalc.cash < cmpCalc.amt ? '일시불 ' : '무이자 '}
                  {fmtKRW(Math.abs(cmpCalc.amt - cmpCalc.cash))} 유리
                </strong>
              </div>
              <div className={s.diffRow}>
                <span>일시불 vs 유이자 {cmpPaidMonths}개월</span>
                <strong className={s.diffPositive}>
                  일시불 {fmtKRW(cmpCalc.paid.total - cmpCalc.cash)} 유리
                </strong>
              </div>
              <div className={s.diffRow}>
                <span>무이자 {cmpFreeMonths}개월 vs 유이자 {cmpPaidMonths}개월</span>
                <strong className={s.diffPositive}>
                  무이자 {fmtKRW(cmpCalc.paid.totalInterest)} 유리
                </strong>
              </div>
            </div>
          )}

          {/* 기회비용 분석 */}
          {parseComma(cmpAmount) > 0 && (
            <div className={s.opportunityCard}>
              <p className={s.opportunityTitle}>💡 기회비용 분석</p>
              <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.7, marginBottom: 12 }}>
                무이자 할부의 진짜 가치는 <strong style={{ color: 'var(--text)' }}>현금 보유</strong>에서 나옵니다.
                일시불 할인과 무이자 + 파킹통장 운용을 비교해 봅니다.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6, marginBottom: 12 }}>
                <div>
                  <span className={s.subLabel}>파킹통장 연이율 (%)</span>
                  <div className={s.inputRow}>
                    <input className={s.smallInput} type="number" inputMode="decimal" min="0" max="10" step="0.1" value={parkingRate} onChange={e => setParkingRate(e.target.value)} />
                    <span className={s.unit}>%</span>
                  </div>
                </div>
              </div>
              <div className={s.opportunityRow}>
                <span>일시불 즉시 할인 ({cmpDiscount}%)</span>
                <strong>{fmtKRW(opportunity.instantDiscount)} 즉시 이익</strong>
              </div>
              <div className={s.opportunityRow}>
                <span>무이자 + 파킹통장 ({parkingRate}%) {cmpFreeMonths}개월</span>
                <strong>{fmtKRW(opportunity.parkingInterest)} 운용 이자</strong>
              </div>
              <div className={s.opportunityResult}>
                {opportunity.diff > 0 ? (
                  <>일시불이 <strong>{fmtKRW(opportunity.diff)}</strong> 유리합니다. 현금 여유 있다면 일시불을 권장합니다.</>
                ) : (
                  <>무이자 할부 + 파킹통장 운용이 <strong>{fmtKRW(Math.abs(opportunity.diff))}</strong> 유리합니다. 현금 흐름 분산 효과까지 고려하면 더욱 합리적입니다.</>
                )}
              </div>
            </div>
          )}

          {/* 시나리오 해석 */}
          <div className={s.interpretCard}>
            {cmpInterpretation.text}
          </div>

          {parseComma(cmpAmount) > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}

      {/* ──────────── TAB 3: 개월수별 비교 ──────────── */}
      {tab === 'months' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}><span>개월수별 비교 입력</span></div>
            <span className={s.subLabel}>구매금액 (원)</span>
            <div className={s.inputRow}>
              <input className={s.bigInput} type="text" inputMode="numeric" value={tblAmount} onChange={e => setTblAmount(fmtComma(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <div>
                <span className={s.subLabel}>유이자 vs 무이자</span>
                <div className={s.typeGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <button className={`${s.typeBtn} ${s.typeFree} ${tblIsFree ? s.typeActive : ''}`} onClick={() => setTblIsFree(true)} type="button">🟢 무이자</button>
                  <button className={`${s.typeBtn} ${s.typePaid} ${!tblIsFree ? s.typeActive : ''}`} onClick={() => setTblIsFree(false)} type="button">🔴 유이자</button>
                </div>
              </div>
              {!tblIsFree && (
                <div>
                  <span className={s.subLabel}>연 수수료율 (%)</span>
                  <div className={s.inputRow}>
                    <input className={s.smallInput} type="number" inputMode="decimal" min="0" max="30" step="0.1" value={tblRate} onChange={e => setTblRate(e.target.value)} />
                    <span className={s.unit}>%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 비교 표 */}
          {parseComma(tblAmount) > 0 && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>개월수별 비교</span>
                <span className={s.cardLabelHint}>월 부담률 = 월 납부액 / 원금</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={s.compareTable} style={{ minWidth: 460 }}>
                  <thead>
                    <tr>
                      <th>개월</th>
                      <th>월 납부액</th>
                      <th>총 납부액</th>
                      <th>총 이자</th>
                      <th>월 부담률</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>일시불</td>
                      <td>—</td>
                      <td>{fmt(parseComma(tblAmount))}</td>
                      <td>0</td>
                      <td>—</td>
                    </tr>
                    {tableRows.map(r => (
                      <tr
                        key={r.months}
                        className={
                          r.phase === 'safe'   ? s.rowSafe :
                          r.phase === 'mid'    ? s.rowMid  :
                          s.rowDanger
                        }
                      >
                        <td>{r.months}개월</td>
                        <td>{fmt(Math.round(r.monthlyPayment))}</td>
                        <td>{fmt(Math.round(r.totalPayment))}</td>
                        <td>{fmt(Math.round(r.totalInterest))}</td>
                        <td>{r.burdenRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 그래프 */}
          {parseComma(tblAmount) > 0 && !tblIsFree && (
            <div className={s.card}>
              <div className={s.cardLabel}>
                <span>월 납부액 vs 총 이자</span>
                <span className={s.cardLabelHint}>━━ 월 납부액(좌) · ▮ 총 이자(우)</span>
              </div>
              <div className={s.graphWrap}>{graph}</div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7, textAlign: 'center' }}>
                개월이 길수록 <strong style={{ color: 'var(--text)' }}>월 부담은 줄지만</strong>, <strong style={{ color: '#FF6B6B' }}>총 이자는 급증</strong>합니다.
              </p>
            </div>
          )}

          {/* 추천 카드 */}
          {recommendation && (
            <div className={s.recoCard}>
              <p className={s.recoTitle}>📌 이 구매에 적정한 할부 개월</p>
              <p className={s.recoText}>{recommendation.text}</p>
            </div>
          )}

          {/* 경고 */}
          {!tblIsFree && parseComma(tblAmount) > 0 && (
            <div className={s.warnCard}>
              <strong>⚠️ 주의:</strong> 24개월 이상 유이자 할부는 총 이자가 원금의 20%에 달합니다.
              가능하면 단축하거나 일시불을 고려하세요.
            </div>
          )}

          {parseComma(tblAmount) > 0 && (
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult}>
              {copied ? '✓ 복사됨' : '결과 복사하기'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
