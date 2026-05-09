'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import s from './car-cost.module.css'
import {
  CAR_CATEGORIES,
  KOREA_INSURANCE_AVG,
  AUTO_TAX_BRACKETS,
  EV_AUTO_TAX,
  FUEL_DATA_2026,
  CARSHARING_RATES,
  DEFAULT_CONSUMABLES,
  formatKoreanCurrency,
  formatKRW,
  formatNum,
  parseAmount,
  calcMaintenance,
  calcMonthlyConsumable,
  comparePurchaseModes,
  compareCarSpecs,
  compareFuelTypes,
  compareOwnVsShare,
  type Consumable,
} from './carCostUtils'

type Mode = 'simple' | 'detail'
type FuelTypeBasic = 'gas' | 'ev' | 'hybrid'
type DeprMethod = 'direct' | 'rate'
type TabId = 'main' | 'purchase' | 'car' | 'fuel' | 'share'

const TABS: { id: TabId; label: string; cls: string }[] = [
  { id: 'main',     label: '유지비 계산',      cls: s.tabActive },
  { id: 'purchase', label: '구매 방식 비교',   cls: s.tabActivePurchase },
  { id: 'car',      label: '차종 비교',        cls: s.tabActiveCar },
  { id: 'fuel',     label: '연료 타입 비교',   cls: s.tabActiveFuel },
  { id: 'share',    label: '보유 vs 카쉐어링', cls: s.tabActiveShare },
]

/* ─── 모바일 친화 도움말 팝오버 ─── */
function HelpTip({ children }: { children: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className={s.helpTipWrap}>
      <button
        type="button"
        className={s.helpTip}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-label="도움말"
        aria-expanded={open}
      >
        ?
      </button>
      {open && (
        <span className={s.helpTipPopover} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={s.helpTipClose}
            onClick={() => setOpen(false)}
            aria-label="닫기"
          >×</button>
          {children}
        </span>
      )}
    </span>
  )
}

function makeInitialConsumables(): Consumable[] {
  return DEFAULT_CONSUMABLES.map(c => ({ ...c, enabled: true }))
}

export default function CarCostClient() {
  const [tab, setTab] = useState<TabId>('main')

  // ── 메인 탭 상태 ──
  const [mode, setMode] = useState<Mode>('simple')
  const [fuelType, setFuelType] = useState<FuelTypeBasic>('gas')
  const [monthlyKm, setMonthlyKm] = useState(1500)
  const [efficiency, setEfficiency] = useState(12)
  const [fuelPrice, setFuelPrice] = useState(1650)
  const [evEff, setEvEff] = useState(5.5)
  const [chargePrice, setChargePrice] = useState(200)

  // 감가
  const [deprOn, setDeprOn] = useState(false)
  const [deprMethod, setDeprMethod] = useState<DeprMethod>('rate')
  const [buyPrice, setBuyPrice] = useState(30_000_000)
  const [currentPriceA, setCurrentPriceA] = useState(15_000_000)
  const [holdMonths, setHoldMonths] = useState(60)
  const [currentPrice, setCurrentPrice] = useState(25_000_000)
  const [annualRate, setAnnualRate] = useState(10)

  // 고정비
  const [insurance, setInsurance] = useState(800_000)
  const [carTax, setCarTax] = useState(200_000)
  const [parking, setParking] = useState(0)

  // ★ 할부 (NEW: 월 + 남은 개월)
  const [loanMonthly, setLoanMonthly] = useState(0)
  const [loanRemainingMonths, setLoanRemainingMonths] = useState(0)

  // 변동비 (간단)
  const [washSimple, setWashSimple] = useState(20_000)
  const [variableCost, setVariableCost] = useState(50_000)   // ★ 라벨 명확화

  // 변동비 (상세)
  const [consumables, setConsumables] = useState<Consumable[]>(makeInitialConsumables)
  const [transitCost, setTransitCost] = useState(100_000)
  const [copied, setCopied] = useState(false)

  // 변동비 합계
  const consumablesMonthly = useMemo(() => {
    if (mode === 'simple') return washSimple + variableCost
    return consumables
      .filter(c => c.enabled)
      .reduce((sum, c) => sum + calcMonthlyConsumable(c, monthlyKm), 0)
  }, [mode, washSimple, variableCost, consumables, monthlyKm])

  // 감가 월
  const deprMonthly = useMemo(() => {
    if (!deprOn) return 0
    if (deprMethod === 'direct') {
      if (holdMonths <= 0) return 0
      return Math.max(0, (buyPrice - currentPriceA) / holdMonths)
    }
    return Math.max(0, (currentPrice * (annualRate / 100)) / 12)
  }, [deprOn, deprMethod, buyPrice, currentPriceA, holdMonths, currentPrice, annualRate])

  // 메인 결과
  const result = useMemo(() => calcMaintenance({
    fuelType, monthlyKm,
    efficiency, fuelPrice,
    evEfficiency: evEff, chargePrice,
    insuranceYearly: insurance,
    carTaxYearly: carTax,
    parkingMonthly: parking,
    loanMonthly,
    loanRemainingMonths,
    variableCostMonthly: mode === 'simple' ? variableCost : consumablesMonthly - washSimple,
    washMonthly: mode === 'simple' ? washSimple : 0,
    depreciationOn: deprOn,
    depreciationMonthly: deprMonthly,
  }), [fuelType, monthlyKm, efficiency, fuelPrice, evEff, chargePrice, insurance, carTax, parking, loanMonthly, loanRemainingMonths, mode, variableCost, consumablesMonthly, washSimple, deprOn, deprMonthly])

  // ── 구매 방식 탭 상태 ──
  const [pCarPrice, setPCarPrice] = useState(30_000_000)
  const [pCarCategory, setPCarCategory] = useState('midsize-kr')
  const [pYears, setPYears] = useState(5)
  const [pLoanRate, setPLoanRate] = useState(5)
  const [pLoanMonths, setPLoanMonths] = useState(60)
  const [pLoanDown, setPLoanDown] = useState(5_000_000)

  const purchaseCompare = useMemo(() => comparePurchaseModes({
    carPrice: pCarPrice,
    carCategory: pCarCategory,
    yearsOfHold: pYears,
    variableCostMonthly: 50_000,
    insuranceYearly: insurance,
    carTaxYearly: carTax,
    parkingMonthly: parking,
    fuelMonthly: result.fuelMonthly,
    loanRate: pLoanRate,
    loanMonths: pLoanMonths,
    loanDownPayment: pLoanDown,
  }), [pCarPrice, pCarCategory, pYears, insurance, carTax, parking, result.fuelMonthly, pLoanRate, pLoanMonths, pLoanDown])

  // ── 차종 비교 탭 ──
  type CarRow = { id: string; name: string; carPrice: number; fuelTypeId: string; efficiency: number; insuranceYearly: number; carTaxYearly: number; variableCostMonthly: number; parkingMonthly: number; depreciationRate: number }
  const [carRows, setCarRows] = useState<CarRow[]>([
    { id: '1', name: '쏘나타 (현재 차)', carPrice: 32_000_000, fuelTypeId: 'gasoline', efficiency: 12, insuranceYearly: 1_000_000, carTaxYearly: 520_000, variableCostMonthly: 50_000, parkingMonthly: 0, depreciationRate: 10 },
    { id: '2', name: '아반떼 (후보 A)', carPrice: 23_000_000, fuelTypeId: 'gasoline', efficiency: 14, insuranceYearly: 800_000, carTaxYearly: 300_000, variableCostMonthly: 50_000, parkingMonthly: 0, depreciationRate: 10 },
    { id: '3', name: '아이오닉5 (후보 B)', carPrice: 48_000_000, fuelTypeId: 'electric', efficiency: 5, insuranceYearly: 1_100_000, carTaxYearly: 130_000, variableCostMonthly: 30_000, parkingMonthly: 0, depreciationRate: 18 },
  ])

  const carCompareResults = useMemo(() => compareCarSpecs(carRows, monthlyKm), [carRows, monthlyKm])
  const carBestIdx = useMemo(() => {
    let best = 0
    for (let i = 1; i < carCompareResults.length; i++) {
      if (carCompareResults[i].fiveYearTotal < carCompareResults[best].fiveYearTotal) best = i
    }
    return best
  }, [carCompareResults])

  // ── 연료 타입 비교 탭 ──
  const [fCarPrice, setFCarPrice] = useState(30_000_000)
  const [fEvCarPrice, setFEvCarPrice] = useState(45_000_000)
  const [fYears, setFYears] = useState(5)
  const fuelCompare = useMemo(() => compareFuelTypes([
    { fuelId: 'gasoline',     carPrice: fCarPrice,    depRate: 10 },
    { fuelId: 'diesel',       carPrice: fCarPrice + 2_000_000, depRate: 10 },
    { fuelId: 'lpg',          carPrice: fCarPrice - 2_000_000, depRate: 10 },
    { fuelId: 'hybrid',       carPrice: fCarPrice + 5_000_000, depRate: 11 },
    { fuelId: 'electric',     carPrice: fEvCarPrice,  depRate: 18 },
    { fuelId: 'electricFast', carPrice: fEvCarPrice,  depRate: 18 },
  ], monthlyKm, fYears), [fCarPrice, fEvCarPrice, monthlyKm, fYears])
  const fuelBestIdx = useMemo(() => {
    let best = 0
    for (let i = 1; i < fuelCompare.length; i++) {
      if (fuelCompare[i].totalCost < fuelCompare[best].totalCost) best = i
    }
    return best
  }, [fuelCompare])

  // ── 카쉐어링 탭 ──
  const shareCompare = useMemo(() => compareOwnVsShare(result.monthlyExclDepr), [result.monthlyExclDepr])

  // 복사
  const onCopy = async () => {
    const text = `── 내 차 유지비 ──
월 (감가 ${deprOn ? '포함' : '제외'}): ${formatKRW(deprOn ? result.monthlyInclDepr : result.monthlyExclDepr)}
3년 총비용: ${formatKoreanCurrency(deprOn ? result.threeYearIncl : result.threeYearExcl)}
5년 총비용: ${formatKoreanCurrency(deprOn ? result.fiveYearIncl : result.fiveYearExcl)} ⭐
10년 총비용: ${formatKoreanCurrency(deprOn ? result.tenYearIncl : result.tenYearExcl)}
1km당: ${formatKRW(result.perKm)}
── youtil.kr/tools/finance/car-cost`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {/* noop */}
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
      >
        본 계산기는 일반 정보 제공 도구
      </Disclaimer>

      <div className={s.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${s.tabBtn} ${tab === t.id ? t.cls : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ──────────── TAB 1: 유지비 계산 ──────────── */}
      {tab === 'main' && (
        <>
          {/* 모드 토글 */}
          <div className={s.modeToggle}>
            <button className={`${s.modeBtn} ${mode === 'simple' ? s.modeActive : ''}`} onClick={() => setMode('simple')}>간단 모드</button>
            <button className={`${s.modeBtn} ${mode === 'detail' ? s.modeActive : ''}`} onClick={() => setMode('detail')}>상세 모드</button>
          </div>

          {/* ── 차량 기본 ── */}
          <div className={s.card}>
            <span className={s.cardLabel}>① 차량 기본 정보</span>

            <div className={`${s.subLabel} ${s.firstSub}`}>연료 타입</div>
            <div className={s.fuelGrid}>
              <button className={`${s.fuelBtn} ${s.fuelGas} ${fuelType === 'gas' ? s.fuelActive : ''}`} onClick={() => setFuelType('gas')}>⛽ 가솔린/LPG</button>
              <button className={`${s.fuelBtn} ${s.fuelEv} ${fuelType === 'ev' ? s.fuelActive : ''}`} onClick={() => setFuelType('ev')}>🔋 전기차</button>
              <button className={`${s.fuelBtn} ${s.fuelHybrid} ${fuelType === 'hybrid' ? s.fuelActive : ''}`} onClick={() => setFuelType('hybrid')}>⚡ 하이브리드</button>
            </div>

            <div className={s.subLabel}>월 주행거리</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" min={0}
                value={monthlyKm || ''}
                onChange={e => setMonthlyKm(Math.max(0, parseInt(e.target.value || '0', 10)))} />
              <span className={s.unit}>km</span>
            </div>
            <div className={s.pills}>
              {[500, 1000, 1500, 2000, 3000].map(v => (
                <button key={v} className={`${s.pill} ${monthlyKm === v ? s.pillActive : ''}`} onClick={() => setMonthlyKm(v)}>{v.toLocaleString()}km</button>
              ))}
            </div>

            {fuelType !== 'ev' ? (
              <div className={s.twoCol} style={{ marginTop: 14 }}>
                <div>
                  <div className={`${s.subLabel} ${s.firstSub}`}>연비</div>
                  <div className={s.inputRow}>
                    <input className={s.numInput} type="number" step="0.1"
                      value={efficiency || ''}
                      onChange={e => setEfficiency(parseAmount(e.target.value))} />
                    <span className={s.unit}>km/L</span>
                  </div>
                </div>
                <div>
                  <div className={`${s.subLabel} ${s.firstSub}`}>유가</div>
                  <div className={s.inputRow}>
                    <input className={s.numInput} type="number"
                      value={fuelPrice || ''}
                      onChange={e => setFuelPrice(parseAmount(e.target.value))} />
                    <span className={s.unit}>원/L</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={s.twoCol} style={{ marginTop: 14 }}>
                <div>
                  <div className={`${s.subLabel} ${s.firstSub}`}>전비</div>
                  <div className={s.inputRow}>
                    <input className={s.numInput} type="number" step="0.1"
                      value={evEff || ''}
                      onChange={e => setEvEff(parseAmount(e.target.value))} />
                    <span className={s.unit}>km/kWh</span>
                  </div>
                </div>
                <div>
                  <div className={`${s.subLabel} ${s.firstSub}`}>충전 단가</div>
                  <div className={s.inputRow}>
                    <input className={s.numInput} type="number"
                      value={chargePrice || ''}
                      onChange={e => setChargePrice(parseAmount(e.target.value))} />
                    <span className={s.unit}>원/kWh</span>
                  </div>
                  <div className={s.helperText}>완속 약 200원, 급속 약 350원</div>
                </div>
              </div>
            )}

            <div className={s.helperText}>월 연료비 환산: <strong style={{ color: 'var(--accent)' }}>{formatKRW(result.fuelMonthly)}</strong></div>
          </div>

          {/* ── 감가상각 ── */}
          <div className={`${s.card} ${!deprOn ? s.cardDimmed : ''}`}>
            <div className={s.toggleHeader}>
              <span className={s.cardLabel} style={{ marginBottom: 0 }}>② 감가상각 (선택)</span>
              <div className={`${s.toggleSwitch} ${deprOn ? s.toggleSwitchOn : ''}`}
                onClick={() => setDeprOn(!deprOn)} role="button" tabIndex={0}>
                <div className={s.toggleKnob} />
              </div>
            </div>

            {deprOn && (
              <>
                <div className={s.methodTabs}>
                  <button className={`${s.methodBtn} ${deprMethod === 'direct' ? s.methodActive : ''}`} onClick={() => setDeprMethod('direct')}>A. 직접 입력</button>
                  <button className={`${s.methodBtn} ${deprMethod === 'rate' ? s.methodActive : ''}`} onClick={() => setDeprMethod('rate')}>B. 감가율 추정</button>
                </div>

                {deprMethod === 'direct' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <div className={`${s.subLabel} ${s.firstSub}`}>구매가</div>
                      <div className={s.inputRow}>
                        <input className={s.numInput} type="number" value={buyPrice || ''} onChange={e => setBuyPrice(parseAmount(e.target.value))} />
                        <span className={s.unit}>원</span>
                      </div>
                    </div>
                    <div>
                      <div className={`${s.subLabel} ${s.firstSub}`}>현재 예상 중고가</div>
                      <div className={s.inputRow}>
                        <input className={s.numInput} type="number" value={currentPriceA || ''} onChange={e => setCurrentPriceA(parseAmount(e.target.value))} />
                        <span className={s.unit}>원</span>
                      </div>
                    </div>
                    <div>
                      <div className={`${s.subLabel} ${s.firstSub}`}>보유 기간</div>
                      <div className={s.inputRow}>
                        <input className={s.numInput} type="number" value={holdMonths || ''} onChange={e => setHoldMonths(Math.max(1, parseInt(e.target.value || '1', 10)))} />
                        <span className={s.unit}>개월</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div>
                      <div className={`${s.subLabel} ${s.firstSub}`}>차량 현재가</div>
                      <div className={s.inputRow}>
                        <input className={s.numInput} type="number" value={currentPrice || ''} onChange={e => setCurrentPrice(parseAmount(e.target.value))} />
                        <span className={s.unit}>원</span>
                      </div>
                    </div>
                    <div>
                      <div className={`${s.subLabel} ${s.firstSub}`}>연 감가율</div>
                      <div className={s.pills}>
                        {[5, 8, 10, 12, 15, 20].map(v => (
                          <button key={v} className={`${s.pill} ${annualRate === v ? s.pillActive : ''}`} onClick={() => setAnnualRate(v)}>{v}%</button>
                        ))}
                      </div>
                      <div className={s.inputRow} style={{ marginTop: 8 }}>
                        <input className={s.numInput} type="number" step="0.1" value={annualRate || ''} onChange={e => setAnnualRate(parseAmount(e.target.value))} />
                        <span className={s.unit}>%/년</span>
                      </div>
                      <div className={s.helperText}>국산 소형 ~10~12% · 국산 중형 ~8~10% · 수입차 ~12~15% · 전기차 ~15~20%</div>
                    </div>
                  </div>
                )}
                <div className={s.monthlyHint}>월 감가 환산: {formatKRW(deprMonthly)}</div>
              </>
            )}
          </div>

          {/* ── 고정비 (★ 자동차세 자동 + 한국 평균 안내) ── */}
          <div className={s.card}>
            <span className={s.cardLabel}>③ 고정비</span>
            <div className={s.twoCol}>
              <div>
                <div className={`${s.subLabel} ${s.firstSub}`}>
                  자동차 보험료 (연)
                  <HelpTip>2026년 한국 평균: 20대 신규 ~150만 / 30대 안정 ~90만 / 40~50대 무사고 ~70만 / 60대+ ~80만</HelpTip>
                </div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" value={insurance || ''} onChange={e => setInsurance(parseAmount(e.target.value))} />
                  <span className={s.unit}>원/년</span>
                </div>
                <div className={s.optionRow4} style={{ marginTop: 6 }}>
                  {KOREA_INSURANCE_AVG.map(a => (
                    <button key={a.ageRange}
                      className={`${s.optionBtn} ${insurance === a.yearly ? s.optionActive : ''}`}
                      onClick={() => setInsurance(a.yearly)}
                      title={a.note}>
                      {a.ageRange.split(' ')[0]}<br/>
                      <span style={{ fontSize: 10 }}>{(a.yearly/10_000)}만</span>
                    </button>
                  ))}
                </div>
                <div className={s.monthlyHint}>월 환산 {formatKRW(insurance / 12)}</div>
              </div>
              <div>
                <div className={`${s.subLabel} ${s.firstSub}`}>
                  자동차세 (연)
                  <HelpTip>배기량별 자동: 1000cc↓ 8만 / 1500↓ 20만 / 2000↓ 40만 / 2500↓ 50만 / 3000↓ 60만 / 전기차 13만</HelpTip>
                </div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" value={carTax || ''} onChange={e => setCarTax(parseAmount(e.target.value))} />
                  <span className={s.unit}>원/년</span>
                </div>
                <div className={s.optionRow6} style={{ marginTop: 6 }}>
                  {fuelType === 'ev' ? (
                    <button className={`${s.optionBtn} ${carTax === EV_AUTO_TAX ? s.optionActive : ''}`}
                      onClick={() => setCarTax(EV_AUTO_TAX)}>전기차<br/><span style={{ fontSize: 10 }}>13만</span></button>
                  ) : (
                    AUTO_TAX_BRACKETS.slice(0, 6).map(b => (
                      <button key={b.ccMax}
                        className={`${s.optionBtn} ${carTax === b.yearly ? s.optionActive : ''}`}
                        onClick={() => setCarTax(b.yearly)}
                        title={b.desc}>
                        {b.ccMax === Infinity ? '3000+' : b.ccMax + 'cc'}<br/>
                        <span style={{ fontSize: 10 }}>{(b.yearly/10_000)}만</span>
                      </button>
                    ))
                  )}
                </div>
                <div className={s.monthlyHint}>월 환산 {formatKRW(carTax / 12)}</div>
              </div>
            </div>
            <div className={s.twoCol} style={{ marginTop: 12 }}>
              <div>
                <div className={`${s.subLabel} ${s.firstSub}`}>월 주차비</div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" value={parking || ''} onChange={e => setParking(parseAmount(e.target.value))} />
                  <span className={s.unit}>원/월</span>
                </div>
              </div>
              <div></div>
            </div>

            {/* ★ 할부 NEW: 월 + 남은 개월 */}
            <div className={s.twoCol} style={{ marginTop: 12 }}>
              <div>
                <div className={`${s.subLabel} ${s.firstSub}`}>
                  할부금 (월)
                  <HelpTip>현재 월 납입 중인 할부금. 할부 종료 후 0이 됨.</HelpTip>
                </div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" value={loanMonthly || ''} onChange={e => setLoanMonthly(parseAmount(e.target.value))} />
                  <span className={s.unit}>원/월</span>
                </div>
              </div>
              <div>
                <div className={`${s.subLabel} ${s.firstSub}`}>
                  남은 할부 기간
                  <HelpTip>현재부터 남은 할부 개월 수. 5년·10년 총비용 계산 시 이 기간만 가산됩니다.</HelpTip>
                </div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" value={loanRemainingMonths || ''} onChange={e => setLoanRemainingMonths(parseAmount(e.target.value))} />
                  <span className={s.unit}>개월</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 변동비 (★ 라벨·도움말 명확화) ── */}
          <div className={s.card}>
            <span className={s.cardLabel}>④ 변동비 · 소모품</span>

            {mode === 'simple' ? (
              <div className={s.twoCol}>
                <div>
                  <div className={`${s.subLabel} ${s.firstSub}`}>세차비 (월)</div>
                  <div className={s.inputRow}>
                    <input className={s.numInput} type="number" value={washSimple || ''} onChange={e => setWashSimple(parseAmount(e.target.value))} />
                    <span className={s.unit}>원/월</span>
                  </div>
                </div>
                <div>
                  <div className={`${s.subLabel} ${s.firstSub}`}>
                    엔진오일·타이어·정비비 평균 (월)
                    <HelpTip>한국 평균: 엔진오일(5,000km/6개월) 월 1.5만 + 타이어(4만km/3년) 월 1.5~2만 + 정비·점검 월 1~2만 = 합계 월 약 4~6만</HelpTip>
                  </div>
                  <div className={s.inputRow}>
                    <input className={s.numInput} type="number" value={variableCost || ''} onChange={e => setVariableCost(parseAmount(e.target.value))} />
                    <span className={s.unit}>원/월</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className={s.consumableHeader}>
                  <div>항목</div><div>비용(원)</div><div>주기(km)</div><div>주기(월)</div><div>월비용</div>
                </div>
                <div className={s.consumablesList} style={{ marginTop: 6 }}>
                  {consumables.map((c, i) => {
                    const monthly = calcMonthlyConsumable(c, monthlyKm)
                    const upd = (patch: Partial<Consumable>) => {
                      const next = [...consumables]; next[i] = { ...next[i], ...patch }; setConsumables(next)
                    }
                    return (
                      <div key={c.key} className={`${s.consumableRow} ${!c.enabled ? s.disabled : ''}`}>
                        <div className={s.consumableName}>{c.icon} {c.name}</div>
                        <input className={s.smallNum} type="number" value={c.cost || ''} onChange={e => upd({ cost: parseAmount(e.target.value) })} disabled={!c.enabled} />
                        <input className={s.smallNum} type="number" value={c.cycleKm ?? ''} placeholder="-" onChange={e => upd({ cycleKm: e.target.value ? parseAmount(e.target.value) : null })} disabled={!c.enabled} />
                        <input className={s.smallNum} type="number" value={c.cycleMon ?? ''} placeholder="-" onChange={e => upd({ cycleMon: e.target.value ? parseAmount(e.target.value) : null })} disabled={!c.enabled} />
                        <div className={s.consumableMonthly}>{c.enabled ? formatKRW(monthly) : '제외'}</div>
                        <button className={`${s.miniToggle} ${!c.enabled ? s.miniToggleOff : ''}`} onClick={() => upd({ enabled: !c.enabled })}>{c.enabled ? '제외' : '포함'}</button>
                      </div>
                    )
                  })}
                </div>
                <div className={s.helperText}>💡 km/월 둘 다 입력 시 먼저 도달하는 기준이 적용됩니다.</div>
              </>
            )}

            <div className={s.monthlyHint}>월 변동비 합계: {formatKRW(consumablesMonthly)}</div>
          </div>

          {/* ── 결과 히어로 ── */}
          <div className={s.hero}>
            <div className={s.heroLead}>내 차는 하루에 약</div>
            <div className={s.heroNum}>{formatKRW((deprOn ? result.monthlyInclDepr : result.monthlyExclDepr) / 30.5)}</div>
            <div className={s.heroLead} style={{ marginTop: 6, marginBottom: 0 }}>씩 쓰고 있어요</div>

            <div className={s.heroDual}>
              <div className={s.heroDualBox}>
                <div className={s.heroDualLabel}>감가 제외</div>
                <div className={s.heroDualVal}>월 {formatKRW(result.monthlyExclDepr)}</div>
                <div className={s.heroDualSub}>일 {formatKRW(result.monthlyExclDepr / 30.5)}</div>
              </div>
              <div className={s.heroDualBox}>
                <div className={s.heroDualLabel}>감가 포함</div>
                <div className={s.heroDualVal}>월 {formatKRW(result.monthlyInclDepr)}</div>
                <div className={s.heroDualSub}>일 {formatKRW(result.monthlyInclDepr / 30.5)}</div>
              </div>
            </div>
          </div>

          {/* ★ 3·5·10년 비교 카드 (NEW) */}
          <div className={s.card}>
            <span className={s.cardLabel}>📅 보유 기간별 총 유지비 비교</span>
            <div className={s.periodGrid}>
              <div className={s.periodCard}>
                <div className={s.periodCardLabel}>3년</div>
                <div className={s.periodCardExcl}>{formatKoreanCurrency(result.threeYearExcl)}</div>
                <div className={s.periodCardSubLabel}>감가 제외</div>
                {deprOn && <div className={s.periodCardIncl}>{formatKoreanCurrency(result.threeYearIncl)} (감가 포함)</div>}
              </div>
              <div className={`${s.periodCard} ${s.periodCardHighlight}`}>
                <div className={s.periodStarBadge}>⭐ 한국 평균</div>
                <div className={s.periodCardLabel}>5년</div>
                <div className={s.periodCardExcl}>{formatKoreanCurrency(result.fiveYearExcl)}</div>
                <div className={s.periodCardSubLabel}>감가 제외</div>
                {deprOn && <div className={s.periodCardIncl}>{formatKoreanCurrency(result.fiveYearIncl)} (감가 포함)</div>}
              </div>
              <div className={s.periodCard}>
                <div className={s.periodCardLabel}>10년</div>
                <div className={s.periodCardExcl}>{formatKoreanCurrency(result.tenYearExcl)}</div>
                <div className={s.periodCardSubLabel}>감가 제외</div>
                {deprOn && <div className={s.periodCardIncl}>{formatKoreanCurrency(result.tenYearIncl)} (감가 포함)</div>}
              </div>
            </div>
            {loanMonthly > 0 && loanRemainingMonths > 0 && (
              <div className={s.helperText} style={{ marginTop: 10 }}>
                ※ 할부금 월 {formatKRW(loanMonthly)} × 남은 {loanRemainingMonths}개월만 가산됩니다 (이후 월수에는 미가산).
              </div>
            )}
          </div>

          {/* breakdown */}
          <div className={s.card}>
            <span className={s.cardLabel}>비용 항목 분석 (월 기준)</span>
            <div className={s.breakdownLayout}>
              <table className={s.breakdownTable}>
                <thead>
                  <tr>
                    <th>항목</th>
                    <th style={{ textAlign: 'right' }}>월 환산</th>
                    <th style={{ textAlign: 'right' }}>비율</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.filter(it => it.value > 0).map(it => {
                    const total = result.breakdown.reduce((s, b) => s + b.value, 0)
                    const pct = total > 0 ? (it.value / total) * 100 : 0
                    return (
                      <tr key={it.key}>
                        <td>{it.icon} {it.label}</td>
                        <td className={s.numCell}>{formatKRW(it.value)}</td>
                        <td className={s.pctCell}>{pct.toFixed(0)}%</td>
                      </tr>
                    )
                  })}
                  <tr className={s.totalRow}>
                    <td>합계</td>
                    <td className={s.numCell}>{formatKRW(result.breakdown.reduce((s, b) => s + b.value, 0))}</td>
                    <td className={s.pctCell}>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 환산 카드 */}
          <div className={s.convertGrid}>
            <div className={s.convertCard}>
              <div className={s.convertLabel}>월 유지비</div>
              <div className={s.convertVal}>{formatKRW(deprOn ? result.monthlyInclDepr : result.monthlyExclDepr)}</div>
              <div className={s.convertSub}>{deprOn ? '감가 포함' : '감가 제외'}</div>
            </div>
            <div className={s.convertCard}>
              <div className={s.convertLabel}>1km당 비용</div>
              <div className={s.convertVal}>{formatKRW(result.perKm)}</div>
              <div className={s.convertSub}>월 / {formatNum(monthlyKm)}km</div>
            </div>
            <div className={s.convertCard}>
              <div className={s.convertLabel}>5년 총비용</div>
              <div className={s.convertVal}>{formatKoreanCurrency(deprOn ? result.fiveYearIncl : result.fiveYearExcl)}</div>
              <div className={s.convertSub}>한국 평균 보유</div>
            </div>
          </div>

          {/* 대중교통 비교 */}
          <div className={s.card}>
            <span className={s.cardLabel}>대중교통과 비교</span>
            <div className={`${s.subLabel} ${s.firstSub}`}>월 대중교통비</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={transitCost || ''} onChange={e => setTransitCost(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
              <span className={s.unit}>원/월</span>
            </div>
            <div className={s.transitGrid}>
              <div className={s.transitBox}>
                <div className={s.transitLabel}>차량 유지비</div>
                <div className={s.transitVal}>{formatKRW(deprOn ? result.monthlyInclDepr : result.monthlyExclDepr)}</div>
              </div>
              <div className={s.transitBox}>
                <div className={s.transitLabel}>대중교통</div>
                <div className={s.transitVal}>{formatKRW(transitCost)}</div>
              </div>
            </div>
            <div className={s.transitDiff}>
              {(deprOn ? result.monthlyInclDepr : result.monthlyExclDepr) > transitCost ? (
                <>차이: 월 <strong style={{ color: 'var(--accent)', fontFamily: 'Inter' }}>{formatKRW((deprOn ? result.monthlyInclDepr : result.monthlyExclDepr) - transitCost)}</strong>, 연간 <strong style={{ color: 'var(--accent)', fontFamily: 'Inter' }}>{formatKoreanCurrency(((deprOn ? result.monthlyInclDepr : result.monthlyExclDepr) - transitCost) * 12)}</strong></>
              ) : (
                <>차량이 대중교통보다 월 <strong style={{ color: '#3EFF9B', fontFamily: 'Inter' }}>{formatKRW(transitCost - (deprOn ? result.monthlyInclDepr : result.monthlyExclDepr))}</strong> 저렴 (편의성 가치 별도)</>
              )}
            </div>
          </div>

          {/* 액션 */}
          <div className={s.actionRow}>
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={onCopy}>
              {copied ? '✓ 복사됨' : '📋 결과 복사하기'}
            </button>
          </div>
        </>
      )}

      {/* ──────────── TAB 2: 구매 방식 비교 ──────────── */}
      {tab === 'purchase' && (
        <>
          <div className={s.infoBox}>
            💡 <strong>현금 vs 할부 vs 리스 vs 장기렌트</strong> 4가지 비교. 동일 차량·기간 가정.
          </div>

          <div className={s.threeCol}>
            <div className={s.card}>
              <span className={s.cardLabel}>차량 가격</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={pCarPrice || ''} onChange={e => setPCarPrice(parseAmount(e.target.value))} />
                <span className={s.unit}>원</span>
              </div>
              <div className={s.helperText}>{formatKoreanCurrency(pCarPrice)}</div>
            </div>
            <div className={s.card}>
              <span className={s.cardLabel}>차량 카테고리</span>
              <select className={s.selectInput} value={pCarCategory} onChange={e => setPCarCategory(e.target.value)} style={{
                background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px',
                fontSize: 14, fontFamily: 'Noto Sans KR, sans-serif', color: 'var(--text)', outline: 'none', width: '100%', cursor: 'pointer'
              }}>
                {CAR_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name} (감가 {(c.depreciationRate*100).toFixed(0)}%/년)</option>
                ))}
              </select>
            </div>
            <div className={s.card}>
              <span className={s.cardLabel}>보유 기간</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={pYears || ''} onChange={e => setPYears(Math.max(1, parseInt(e.target.value || '1', 10)))} />
                <span className={s.unit}>년</span>
              </div>
              <div className={s.pills}>
                {[3, 5, 7, 10].map(y => (
                  <button key={y} className={`${s.pill} ${pYears === y ? s.pillActive : ''}`} onClick={() => setPYears(y)}>{y}년</button>
                ))}
              </div>
            </div>
          </div>

          <div className={s.threeCol}>
            <div className={s.card}>
              <span className={s.cardLabel}>할부 금리 (연)</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" step="0.1" value={pLoanRate || ''} onChange={e => setPLoanRate(parseAmount(e.target.value))} />
                <span className={s.unit}>%</span>
              </div>
              <div className={s.helperText}>2026 한국 평균 5~7%</div>
            </div>
            <div className={s.card}>
              <span className={s.cardLabel}>할부 기간</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={pLoanMonths || ''} onChange={e => setPLoanMonths(parseAmount(e.target.value))} />
                <span className={s.unit}>개월</span>
              </div>
            </div>
            <div className={s.card}>
              <span className={s.cardLabel}>선수금</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={pLoanDown || ''} onChange={e => setPLoanDown(parseAmount(e.target.value))} />
                <span className={s.unit}>원</span>
              </div>
              <div className={s.helperText}>{formatKoreanCurrency(pLoanDown)}</div>
            </div>
          </div>

          {/* 비교 결과 카드 */}
          <div className={s.purchaseGrid}>
            {purchaseCompare.results.map(r => {
              const isWinner = r.mode === purchaseCompare.best.mode
              return (
                <div key={r.mode} className={`${s.purchaseCard} ${isWinner ? s.purchaseCardWinner : ''}`}>
                  {isWinner && <div className={s.purchaseWinnerBadge}>★ 가장 저렴</div>}
                  <div className={s.purchaseTitle}>{r.mode}</div>
                  <div className={s.purchaseMain}>{formatKoreanCurrency(r.totalCost)}</div>
                  <div className={s.purchaseMonthly}>월 평균 {formatKRW(r.monthly)}</div>
                  <div className={s.purchaseDetail}>{r.detail}</div>
                  <div className={s.purchaseProsCons}>
                    <div>📌 <strong>소유:</strong> {r.ownership}</div>
                    <div style={{ color: '#3EFF9B' }}>✅ {r.pros}</div>
                    <div style={{ color: '#FF6B6B' }}>⚠️ {r.cons}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={s.warnBox}>
            <strong>⚠️ 리스·장기렌트는 회사·계약 조건에 따라 차이 큼.</strong> 광고 표시 가격 ≠ 실제 비용.
            잔존가치·중도 해지·보험·정비 별도 옵션 등 숨은 비용 많으니 계약서 꼼꼼히. 실제 견적은 캐피탈 회사 직접 문의.
          </div>

          <div className={s.infoBox}>
            <strong>💡 본인 상황별 추천:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li>자금 충분 + 5년+ 보유: <strong style={{ color: 'var(--accent)' }}>현금 구매</strong></li>
              <li>자금 부족 + 5년+ 보유: <strong style={{ color: '#FFD700' }}>할부</strong></li>
              <li>사업자 (비용 처리·절세): <strong style={{ color: '#FF8C3E' }}>리스</strong></li>
              <li>관리 편함 + 신차 자주: <strong style={{ color: '#C485E0' }}>장기렌트</strong></li>
            </ul>
          </div>
        </>
      )}

      {/* ──────────── TAB 3: 차종 비교 ──────────── */}
      {tab === 'car' && (
        <>
          <div className={s.infoBox}>
            💡 <strong>현재 차 vs 후보 A vs 후보 B</strong> — 5년 보유 가정 총비용 비교. 월 주행거리는 「유지비 계산」 탭 값 사용 ({formatNum(monthlyKm)}km/월).
          </div>

          {carRows.map((row) => (
            <div key={row.id} className={s.carInputRow}>
              <div className={s.carInputHeader}>
                <input className={s.carInputName} type="text"
                  value={row.name}
                  onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, name: e.target.value } : r))}
                  placeholder="차량 이름" />
                {carRows.length > 1 && (
                  <button className={s.carInputDel} onClick={() => setCarRows(carRows.filter(r => r.id !== row.id))} title="삭제">×</button>
                )}
              </div>
              <div className={s.carInputGrid}>
                <div>
                  <div className={s.subLabel} style={{ fontSize: 11, marginBottom: 4 }}>차량 가격</div>
                  <input className={s.numInput} type="number" value={row.carPrice || ''}
                    onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, carPrice: parseAmount(e.target.value) } : r))}
                    style={{ fontSize: 14 }} />
                </div>
                <div>
                  <div className={s.subLabel} style={{ fontSize: 11, marginBottom: 4 }}>연료 / 연비</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <select value={row.fuelTypeId} onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, fuelTypeId: e.target.value } : r))}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px', fontSize: 12, color: 'var(--text)', flex: 1 }}>
                      {FUEL_DATA_2026.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <input className={s.smallNum} type="number" step="0.1" value={row.efficiency || ''}
                      onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, efficiency: parseAmount(e.target.value) } : r))}
                      placeholder="km/L" style={{ fontSize: 14 }} />
                  </div>
                </div>
                <div>
                  <div className={s.subLabel} style={{ fontSize: 11, marginBottom: 4 }}>보험료 (연)</div>
                  <input className={s.numInput} type="number" value={row.insuranceYearly || ''}
                    onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, insuranceYearly: parseAmount(e.target.value) } : r))}
                    style={{ fontSize: 14 }} />
                </div>
                <div>
                  <div className={s.subLabel} style={{ fontSize: 11, marginBottom: 4 }}>자동차세 (연)</div>
                  <input className={s.numInput} type="number" value={row.carTaxYearly || ''}
                    onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, carTaxYearly: parseAmount(e.target.value) } : r))}
                    style={{ fontSize: 14 }} />
                </div>
                <div>
                  <div className={s.subLabel} style={{ fontSize: 11, marginBottom: 4 }}>월 소모품·정비</div>
                  <input className={s.numInput} type="number" value={row.variableCostMonthly || ''}
                    onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, variableCostMonthly: parseAmount(e.target.value) } : r))}
                    style={{ fontSize: 14 }} />
                </div>
                <div>
                  <div className={s.subLabel} style={{ fontSize: 11, marginBottom: 4 }}>연 감가율 (%)</div>
                  <input className={s.numInput} type="number" step="0.5" value={row.depreciationRate || ''}
                    onChange={e => setCarRows(carRows.map(r => r.id === row.id ? { ...r, depreciationRate: parseAmount(e.target.value) } : r))}
                    style={{ fontSize: 14 }} />
                </div>
              </div>
            </div>
          ))}

          {carRows.length < 4 && (
            <button className={s.addCarBtn} onClick={() => setCarRows([...carRows, {
              id: String(Date.now()), name: `후보 ${String.fromCharCode(65 + carRows.length - 1)}`,
              carPrice: 30_000_000, fuelTypeId: 'gasoline', efficiency: 12,
              insuranceYearly: 900_000, carTaxYearly: 400_000, variableCostMonthly: 50_000,
              parkingMonthly: 0, depreciationRate: 10,
            }])}>+ 차량 추가</button>
          )}

          {/* 비교 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📊 차종별 5년 총비용 비교</span>
            <div className={s.carCompareWrap}>
              <table className={s.carCompareTable}>
                <thead>
                  <tr>
                    <th>항목</th>
                    {carCompareResults.map(c => <th key={c.name}>{c.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr><td>차량 가격</td>{carRows.map(c => <td key={c.id}>{formatKoreanCurrency(c.carPrice)}</td>)}</tr>
                  <tr><td>연 유류비</td>{carCompareResults.map((c, i) => <td key={i}>{formatKoreanCurrency(c.yearlyFuel)}</td>)}</tr>
                  <tr><td>연 보험</td>{carCompareResults.map((c, i) => <td key={i}>{formatKoreanCurrency(c.yearlyInsurance)}</td>)}</tr>
                  <tr><td>연 자동차세</td>{carCompareResults.map((c, i) => <td key={i}>{formatKoreanCurrency(c.yearlyTax)}</td>)}</tr>
                  <tr><td>연 소모품·정비</td>{carCompareResults.map((c, i) => <td key={i}>{formatKoreanCurrency(c.yearlyVariable)}</td>)}</tr>
                  <tr><td>연 감가</td>{carCompareResults.map((c, i) => <td key={i} style={{ color: '#FF8C3E' }}>{formatKoreanCurrency(c.yearlyDep)}</td>)}</tr>
                  <tr className={s.totalRow}>
                    <td>연 총비용</td>
                    {carCompareResults.map((c, i) => (
                      <td key={i} style={{ color: i === carBestIdx ? '#3EFF9B' : 'var(--accent)' }}>
                        {formatKoreanCurrency(c.yearlyTotal)}{i === carBestIdx && ' ★'}
                      </td>
                    ))}
                  </tr>
                  <tr><td>5년 총비용</td>{carCompareResults.map((c, i) => <td key={i} style={{ fontSize: 14, color: i === carBestIdx ? '#3EFF9B' : 'var(--text)' }}>{formatKoreanCurrency(c.fiveYearTotal)}</td>)}</tr>
                  <tr><td>1km당 비용</td>{carCompareResults.map((c, i) => <td key={i}>{formatKRW(c.perKm)}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <div className={s.helperText} style={{ marginTop: 10 }}>
              ★ 가장 저렴: <strong style={{ color: '#3EFF9B' }}>{carCompareResults[carBestIdx]?.name}</strong> ({formatKoreanCurrency(carCompareResults[carBestIdx]?.fiveYearTotal ?? 0)})
            </div>
          </div>

          <div className={s.warnBox}>
            <strong>⚠️ 본 비교는 평균 가정값</strong>입니다. 실제 보험료는 운전 경력·할인 특약, 정비비는 차량 상태에 따라 큰 차이.
            중고차 시세는 KB차차차·엔카 등 전문 사이트 참고. 「이 차 사세요」 같은 추천 X — 본인 상황·취향에 맞게 결정.
          </div>
        </>
      )}

      {/* ──────────── TAB 4: 연료 타입 비교 ──────────── */}
      {tab === 'fuel' && (
        <>
          <div className={s.infoBox}>
            💡 <strong>가솔린 vs 디젤 vs LPG vs 하이브리드 vs 전기 (가정/급속)</strong> 6가지 비교. 연 주행 {formatNum(monthlyKm * 12)}km / {fYears}년 보유 가정.
          </div>

          <div className={s.threeCol}>
            <div className={s.card}>
              <span className={s.cardLabel}>일반 차량 가격</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={fCarPrice || ''} onChange={e => setFCarPrice(parseAmount(e.target.value))} />
                <span className={s.unit}>원</span>
              </div>
              <div className={s.helperText}>{formatKoreanCurrency(fCarPrice)}</div>
            </div>
            <div className={s.card}>
              <span className={s.cardLabel}>전기차 가격</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={fEvCarPrice || ''} onChange={e => setFEvCarPrice(parseAmount(e.target.value))} />
                <span className={s.unit}>원</span>
              </div>
              <div className={s.helperText}>{formatKoreanCurrency(fEvCarPrice)} (보조금 후)</div>
            </div>
            <div className={s.card}>
              <span className={s.cardLabel}>보유 기간</span>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={fYears || ''} onChange={e => setFYears(Math.max(1, parseInt(e.target.value || '1', 10)))} />
                <span className={s.unit}>년</span>
              </div>
              <div className={s.pills}>
                {[3, 5, 7, 10].map(y => (
                  <button key={y} className={`${s.pill} ${fYears === y ? s.pillActive : ''}`} onClick={() => setFYears(y)}>{y}년</button>
                ))}
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>📊 연료 타입별 {fYears}년 총비용 (연료 + 감가)</span>
            <div className={s.carCompareWrap}>
              <table className={s.carCompareTable}>
                <thead>
                  <tr>
                    <th>연료</th>
                    <th>차량가</th>
                    <th>연 연료비</th>
                    <th>{fYears}년 연료비</th>
                    <th>{fYears}년 감가</th>
                    <th>{fYears}년 총비용</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelCompare.map((r, i) => (
                    <tr key={r.fuel.id} className={i === fuelBestIdx ? s.bestRow : ''}>
                      <td>{r.fuel.name}{i === fuelBestIdx && ' ★'}</td>
                      <td>{formatKoreanCurrency(r.carPrice)}</td>
                      <td>{formatKoreanCurrency(r.yearlyFuelCost)}</td>
                      <td>{formatKoreanCurrency(r.totalFuelCost)}</td>
                      <td style={{ color: '#FF8C3E' }}>{formatKoreanCurrency(r.totalDep)}</td>
                      <td style={{ color: i === fuelBestIdx ? '#3EFF9B' : 'var(--accent)' }}>
                        {formatKoreanCurrency(r.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={s.helperText} style={{ marginTop: 10 }}>
              ★ 가장 저렴: <strong style={{ color: '#3EFF9B' }}>{fuelCompare[fuelBestIdx]?.fuel.name}</strong>
            </div>
          </div>

          <div className={s.infoBox}>
            <strong>💡 5년 보유 시 일반적 결론:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li>연료비 최저: 전기 (가정 충전, 가솔린의 1/3)</li>
              <li>총비용 최저: LPG 또는 하이브리드 (감가 적음)</li>
              <li>전기차는 10년+ 장기 보유 + 가정 충전 시 유리</li>
              <li>고속(공용) 충전 의존도 ↑ → 단가 차이 줄어듬</li>
            </ul>
          </div>

          <div className={s.warnBox}>
            <strong>⚠️ 전기차 추가 고려:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--muted)' }}>
              <li>배터리 교체 (10년+ 후 약 1,000~1,500만)</li>
              <li>충전기 설치 (아파트 50~200만, 공용 인프라 필요)</li>
              <li>감가율 ↑ (연 15~20%, 가솔린 10%의 1.5~2배)</li>
              <li>정부 보조금 (전기차 약 700만+, 본 도구 미반영)</li>
              <li>배터리 안정성·잔존가치 시장 검증 진행 중</li>
            </ul>
          </div>
        </>
      )}

      {/* ──────────── TAB 5: 보유 vs 카쉐어링 ──────────── */}
      {tab === 'share' && (
        <>
          <div className={s.infoBox}>
            💡 <strong>월 주행거리별 손익분기</strong> — 「유지비 계산」 탭의 월 비용 (감가 제외 {formatKRW(result.monthlyExclDepr)}) 기준.
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🚗 쏘카 평균 (2026 기준)</span>
            <div className={s.threeCol}>
              <div>
                <div className={s.subLabel}>시간당 요금</div>
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 800, color: '#C485E0' }}>{formatKRW(CARSHARING_RATES.hourlyRate)}</div>
                <div className={s.helperText}>소형 기준</div>
              </div>
              <div>
                <div className={s.subLabel}>km당 요금</div>
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 800, color: '#C485E0' }}>{formatKRW(CARSHARING_RATES.perKmRate)}</div>
                <div className={s.helperText}>보험·연료 포함</div>
              </div>
              <div>
                <div className={s.subLabel}>100km당 평균 시간</div>
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 800, color: '#C485E0' }}>{CARSHARING_RATES.avgHoursPer100km}시간</div>
                <div className={s.helperText}>도심 운전 가정</div>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>📊 월 주행거리별 비교</span>
            <div className={s.shareTable}>
              <div className={`${s.shareRow} ${s.headerRow}`}>
                <span>월 주행</span><span>보유 (월)</span><span>쏘카 (월)</span><span>유리한 쪽</span>
              </div>
              {shareCompare.map(row => (
                <div key={row.monthlyKm} className={s.shareRow}>
                  <span style={{ fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif' }}>{row.monthlyKm.toLocaleString()}km</span>
                  <span className={s.shareRowOwn}>{formatKRW(row.ownCost)}</span>
                  <span className={s.shareRowShare}>{formatKRW(row.shareCost)}</span>
                  <span className={`${s.winnerCell} ${row.winner === '쏘카' ? s.shareRowShare : row.winner === '보유' ? s.shareRowOwn : s.shareRowEqual}`}>
                    {row.winner} {row.winner !== '비슷' && `(${formatKRW(Math.abs(row.diff))} 절약)`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.infoBox}>
            <strong>💡 손익분기 가이드:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li>월 500km 미만: <strong style={{ color: '#C485E0' }}>쏘카·그린카 압도적 유리</strong></li>
              <li>월 500~800km: 카쉐어링 약간 유리</li>
              <li>월 800~1,200km: 비슷 (편의성 가치 따라)</li>
              <li>월 1,200km+: <strong style={{ color: '#3EC8FF' }}>보유 유리</strong></li>
            </ul>
          </div>

          <div className={s.infoBox}>
            <strong>📍 추가 고려:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              <li>편의성 (즉시 사용·예약 X)</li>
              <li>짐 운반·아이 카시트</li>
              <li>출장·여행 빈도</li>
              <li>도심 주차난 (서울 강남·홍대 카쉐어링 인프라 좋음)</li>
              <li>본인 라이프스타일 (직주근접·외곽 거주)</li>
            </ul>
          </div>
        </>
      )}

      {/* 면책 (모든 탭 공통) */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
      >
        ⚖️ 입력값 기준 예상 유지비입니다. 실제 비용은 차량 상태·운전 습관·정비 주기·보험 조건에 따라 달라질 수 있습니다. 리스·장기렌트 견적은 캐피탈 회사 직접 문의, 보험·정비는 전문가 상담 권장.
      </Disclaimer>
    </div>
  )
}
