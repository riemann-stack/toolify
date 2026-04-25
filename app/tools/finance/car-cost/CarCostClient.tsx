'use client'

import { useMemo, useState } from 'react'
import s from './car-cost.module.css'

// ───────────────────────── 타입·데이터 ─────────────────────────

type Mode = 'simple' | 'detail'
type FuelType = 'gas' | 'ev' | 'hybrid'
type DeprMethod = 'direct' | 'rate'

interface Consumable {
  key: string
  name: string
  icon: string
  cost: number
  cycleKm: number | null
  cycleMon: number | null
  note: string | null
  enabled: boolean
  defaultCost: number
  defaultCycleKm: number | null
  defaultCycleMon: number | null
}

const DEFAULT_CONSUMABLES: Omit<Consumable, 'enabled' | 'defaultCost' | 'defaultCycleKm' | 'defaultCycleMon'>[] = [
  { key: 'oil',     name: '엔진오일',      icon: '🛢️', cost: 80_000,  cycleKm: 10_000, cycleMon: 12, note: '차량 매뉴얼 기준 상이' },
  { key: 'air',     name: '에어컨 필터',   icon: '🌬️', cost: 20_000,  cycleKm: null,    cycleMon: 6,  note: null },
  { key: 'wiper',   name: '와이퍼',        icon: '🧹', cost: 30_000,  cycleKm: null,    cycleMon: 12, note: null },
  { key: 'tire',    name: '타이어 (4개)',  icon: '⚫', cost: 600_000, cycleKm: 40_000, cycleMon: null, note: '타이어 종류·주행 습관에 따라 상이' },
  { key: 'battery', name: '배터리',        icon: '🔋', cost: 150_000, cycleKm: null,    cycleMon: 36, note: null },
  { key: 'brake',   name: '브레이크 패드', icon: '⚙️', cost: 150_000, cycleKm: 40_000, cycleMon: null, note: '앞바퀴 기준' },
  { key: 'inspect', name: '정기검사',      icon: '📋', cost: 50_000,  cycleKm: null,    cycleMon: 24, note: null },
  { key: 'wash',    name: '세차비',        icon: '🚿', cost: 20_000,  cycleKm: null,    cycleMon: 1,  note: '월 1회 기준' },
]

function makeInitialConsumables(): Consumable[] {
  return DEFAULT_CONSUMABLES.map(c => ({
    ...c,
    enabled: true,
    defaultCost: c.cost,
    defaultCycleKm: c.cycleKm,
    defaultCycleMon: c.cycleMon,
  }))
}

// ───────────────────────── 포맷터 ─────────────────────────

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0원'
  return Math.round(n).toLocaleString('ko-KR') + '원'
}
function fmtNum(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0'
  return Math.round(n).toLocaleString('ko-KR')
}

function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '')
  if (!cleaned) return 0
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

// ───────────────────────── 메인 ─────────────────────────

export default function CarCostClient() {
  const [mode, setMode] = useState<Mode>('simple')
  const [fuelType, setFuelType] = useState<FuelType>('gas')
  const [monthlyKm, setMonthlyKm] = useState(1500)

  // 가솔린/하이브리드
  const [efficiency, setEfficiency] = useState(12)
  const [fuelPrice, setFuelPrice] = useState(1650)

  // 전기차
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
  const [installment, setInstallment] = useState(0)

  // 변동비 (간단)
  const [washSimple, setWashSimple] = useState(20_000)
  const [otherSimple, setOtherSimple] = useState(30_000)

  // 변동비 (상세)
  const [consumables, setConsumables] = useState<Consumable[]>(makeInitialConsumables)

  // 대중교통
  const [transitCost, setTransitCost] = useState(100_000)

  // 복사 상태
  const [copied, setCopied] = useState(false)

  // ── 계산 ──
  const fuelMonthly = useMemo(() => {
    if (fuelType === 'ev') return (monthlyKm / Math.max(0.1, evEff)) * chargePrice
    return (monthlyKm / Math.max(0.1, efficiency)) * fuelPrice
  }, [fuelType, monthlyKm, efficiency, fuelPrice, evEff, chargePrice])

  const insuranceMonthly = insurance / 12
  const carTaxMonthly = carTax / 12

  const consumablesMonthly = useMemo(() => {
    if (mode === 'simple') return washSimple + otherSimple
    return consumables
      .filter(c => c.enabled)
      .reduce((sum, c) => sum + calcMonthlyConsumable(c, monthlyKm), 0)
  }, [mode, washSimple, otherSimple, consumables, monthlyKm])

  const fixedTotal = insuranceMonthly + carTaxMonthly + parking + installment

  const deprMonthly = useMemo(() => {
    if (!deprOn) return 0
    if (deprMethod === 'direct') {
      if (holdMonths <= 0) return 0
      return Math.max(0, (buyPrice - currentPriceA) / holdMonths)
    }
    return Math.max(0, (currentPrice * (annualRate / 100)) / 12)
  }, [deprOn, deprMethod, buyPrice, currentPriceA, holdMonths, currentPrice, annualRate])

  const monthlyExclDepr = fuelMonthly + fixedTotal + consumablesMonthly
  const monthlyInclDepr = monthlyExclDepr + deprMonthly
  const monthlyTotal = deprOn ? monthlyInclDepr : monthlyExclDepr

  const dailyTotal = monthlyTotal / 30.5
  const perKm = monthlyKm > 0 ? monthlyTotal / monthlyKm : 0
  const annualTotal = monthlyTotal * 12

  // ── breakdown 데이터 ──
  const breakdown = useMemo(() => {
    const items: { key: string; label: string; icon: string; value: number; color: string }[] = [
      { key: 'fuel',   label: fuelType === 'ev' ? '충전비' : '유류비', icon: fuelType === 'ev' ? '🔌' : '🛢️', value: fuelMonthly, color: '#FF8C3E' },
      { key: 'ins',    label: '보험료',     icon: '🛡️', value: insuranceMonthly, color: '#3EC8FF' },
      { key: 'tax',    label: '자동차세',   icon: '🏛️', value: carTaxMonthly,    color: '#FFD700' },
      { key: 'park',   label: '주차비',     icon: '🅿️', value: parking,           color: '#9B59B6' },
      { key: 'inst',   label: '할부금',     icon: '💳', value: installment,       color: '#C8FF3E' },
      { key: 'cons',   label: '소모품 합계', icon: '🔧', value: consumablesMonthly, color: '#3EFF9B' },
    ]
    if (deprOn) items.push({ key: 'depr', label: '감가상각', icon: '📉', value: deprMonthly, color: '#FF6B6B' })
    return items
  }, [fuelType, fuelMonthly, insuranceMonthly, carTaxMonthly, parking, installment, consumablesMonthly, deprOn, deprMonthly])

  const breakdownTotal = breakdown.reduce((s, it) => s + it.value, 0)
  const visibleBreakdown = breakdown.filter(it => it.value > 0)
  const maxItem = visibleBreakdown.reduce((m, it) => (it.value > m.value ? it : m), visibleBreakdown[0] || { key: '', value: 0 })

  // ── 절약 팁 ──
  const tips = useMemo(() => {
    const arr: string[] = []
    if (maxItem?.key === 'fuel') {
      const save10 = fuelMonthly * 0.1
      arr.push(`⛽ 연비 운전 습관으로 유류비를 10% 절약하면 월 ${fmt(save10)} 절감 효과`)
    }
    if (maxItem?.key === 'depr' && deprMonthly > 0) {
      const pct = (deprMonthly / breakdownTotal * 100).toFixed(0)
      arr.push(`📉 감가상각이 전체의 ${pct}%를 차지합니다. 차량 교체 주기·중고차 시점을 고려해보세요`)
    }
    if (parking > 200_000) {
      arr.push(`🅿️ 주차비가 월 ${fmt(parking)}. 거주자 우선 주차·공영주차 등 대안 검토 시 절감 가능`)
    }
    if (insurance > 1_200_000) {
      arr.push(`🛡️ 보험료가 연 ${fmt(insurance)}. 다이렉트 보험·운전자 한정 특약으로 절감 여지가 있습니다`)
    }
    if (perKm > 600) {
      arr.push(`🛣️ 1km당 ${fmt(perKm)} — 주행거리가 적을수록 km당 비용이 높아집니다. 차량 활용도가 낮다면 카셰어링도 검토해보세요`)
    }
    if (arr.length === 0) {
      arr.push('💡 입력값 기준 균형잡힌 비용 구조입니다. 정기 점검으로 큰 정비비를 예방하세요')
    }
    return arr
  }, [maxItem, fuelMonthly, deprMonthly, breakdownTotal, parking, insurance, perKm])

  // ── 복사 ──
  const copyText = `── 내 차 유지비 계산 결과 ──
월 유지비 (감가 ${deprOn ? '포함' : '제외'}): ${fmt(monthlyTotal)}
${deprOn ? `월 유지비 (감가 제외): ${fmt(monthlyExclDepr)}\n` : ''}하루 유지비: ${fmt(dailyTotal)}
1km당 비용: ${fmt(perKm)}
연간 유지비: ${fmt(annualTotal)}
── youtil.kr/tools/finance/car-cost`

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {/* noop */}
  }

  return (
    <div className={s.wrap}>
      {/* 모드 토글 */}
      <div className={s.modeToggle}>
        <button className={`${s.modeBtn} ${mode === 'simple' ? s.modeActive : ''}`} onClick={() => setMode('simple')}>간단 모드</button>
        <button className={`${s.modeBtn} ${mode === 'detail' ? s.modeActive : ''}`} onClick={() => setMode('detail')}>상세 모드</button>
      </div>

      {/* ── 섹션 1: 차량 기본 ── */}
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
          <input
            className={s.numInput}
            type="number"
            min={0}
            value={monthlyKm || ''}
            onChange={e => setMonthlyKm(Math.max(0, parseInt(e.target.value || '0', 10)))}
          />
          <span className={s.unit}>km</span>
        </div>
        <div className={s.pills}>
          {[500, 1000, 1500, 2000, 3000].map(v => (
            <button key={v} className={`${s.pill} ${monthlyKm === v ? s.pillActive : ''}`} onClick={() => setMonthlyKm(v)}>{v.toLocaleString()}km</button>
          ))}
        </div>

        {fuelType !== 'ev' ? (
          <>
            <div className={s.twoCol} style={{ marginTop: 14 }}>
              <div>
                <div className={`${s.subLabel} ${s.firstSub}`}>연비</div>
                <div className={s.inputRow}>
                  <input
                    className={s.numInput}
                    type="number"
                    step="0.1"
                    value={efficiency || ''}
                    onChange={e => setEfficiency(parseAmount(e.target.value))}
                  />
                  <span className={s.unit}>km/L</span>
                </div>
              </div>
              <div>
                <div className={`${s.subLabel} ${s.firstSub}`}>유가</div>
                <div className={s.inputRow}>
                  <input
                    className={s.numInput}
                    type="number"
                    value={fuelPrice || ''}
                    onChange={e => setFuelPrice(parseAmount(e.target.value))}
                  />
                  <span className={s.unit}>원/L</span>
                </div>
              </div>
            </div>
            <a className={s.extLink} href="https://www.opinet.co.kr/" target="_blank" rel="noopener noreferrer">
              오피넷 유가 확인 →
            </a>
          </>
        ) : (
          <div className={s.twoCol} style={{ marginTop: 14 }}>
            <div>
              <div className={`${s.subLabel} ${s.firstSub}`}>전비</div>
              <div className={s.inputRow}>
                <input
                  className={s.numInput}
                  type="number"
                  step="0.1"
                  value={evEff || ''}
                  onChange={e => setEvEff(parseAmount(e.target.value))}
                />
                <span className={s.unit}>km/kWh</span>
              </div>
            </div>
            <div>
              <div className={`${s.subLabel} ${s.firstSub}`}>충전 단가</div>
              <div className={s.inputRow}>
                <input
                  className={s.numInput}
                  type="number"
                  value={chargePrice || ''}
                  onChange={e => setChargePrice(parseAmount(e.target.value))}
                />
                <span className={s.unit}>원/kWh</span>
              </div>
              <div className={s.helperText}>완속 약 200원, 급속 약 350원</div>
            </div>
          </div>
        )}

        <div className={s.helperText}>월 연료비 환산: <strong style={{ color: 'var(--accent)' }}>{fmt(fuelMonthly)}</strong></div>
      </div>

      {/* ── 섹션 2: 감가상각 ── */}
      <div className={`${s.card} ${!deprOn ? s.cardDimmed : ''}`}>
        <div className={s.toggleHeader}>
          <span className={s.cardLabel} style={{ marginBottom: 0 }}>② 감가상각 (선택)</span>
          <div
            className={`${s.toggleSwitch} ${deprOn ? s.toggleSwitchOn : ''}`}
            onClick={() => setDeprOn(!deprOn)}
            role="button"
            tabIndex={0}
          >
            <div className={s.toggleKnob} />
          </div>
        </div>

        {deprOn && (
          <>
            <div className={s.methodTabs}>
              <button className={`${s.methodBtn} ${deprMethod === 'direct' ? s.methodActive : ''}`} onClick={() => setDeprMethod('direct')}>
                A. 직접 입력 (구매가·중고가)
              </button>
              <button className={`${s.methodBtn} ${deprMethod === 'rate' ? s.methodActive : ''}`} onClick={() => setDeprMethod('rate')}>
                B. 감가율로 추정
              </button>
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
                  <div className={s.helperText}>
                    국산 소형 ~10~12% · 국산 중형 ~8~10% · 수입차 ~12~15% · 전기차 ~15~20%
                  </div>
                </div>
              </div>
            )}

            <div className={s.monthlyHint}>월 감가 환산: {fmt(deprMonthly)}</div>
          </>
        )}
      </div>

      {/* ── 섹션 3: 고정비 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>③ 고정비</span>
        <div className={s.twoCol}>
          <div>
            <div className={`${s.subLabel} ${s.firstSub}`}>자동차 보험료 (연)</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={insurance || ''} onChange={e => setInsurance(parseAmount(e.target.value))} />
              <span className={s.unit}>원/년</span>
            </div>
            <div className={s.monthlyHint}>월 환산 {fmt(insuranceMonthly)}</div>
          </div>
          <div>
            <div className={`${s.subLabel} ${s.firstSub}`}>자동차세 (연)</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={carTax || ''} onChange={e => setCarTax(parseAmount(e.target.value))} />
              <span className={s.unit}>원/년</span>
            </div>
            <div className={s.monthlyHint}>월 환산 {fmt(carTaxMonthly)}</div>
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
          <div>
            <div className={`${s.subLabel} ${s.firstSub}`}>할부금</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={installment || ''} onChange={e => setInstallment(parseAmount(e.target.value))} />
              <span className={s.unit}>원/월</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 섹션 4: 변동비/소모품 ── */}
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
              <div className={`${s.subLabel} ${s.firstSub}`}>기타 소모품 (월)</div>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={otherSimple || ''} onChange={e => setOtherSimple(parseAmount(e.target.value))} />
                <span className={s.unit}>원/월</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={s.consumableHeader}>
              <div>항목</div>
              <div>비용(원)</div>
              <div>주기(km)</div>
              <div>주기(월)</div>
              <div>월비용</div>
            </div>
            <div className={s.consumablesList} style={{ marginTop: 6 }}>
              {consumables.map((c, i) => {
                const monthly = calcMonthlyConsumable(c, monthlyKm)
                const costMod = c.cost !== c.defaultCost
                const kmMod = c.cycleKm !== c.defaultCycleKm
                const monMod = c.cycleMon !== c.defaultCycleMon

                const upd = (patch: Partial<Consumable>) => {
                  const next = [...consumables]
                  next[i] = { ...next[i], ...patch }
                  setConsumables(next)
                }

                return (
                  <div key={c.key} className={`${s.consumableRow} ${!c.enabled ? s.disabled : ''}`}>
                    <div className={s.consumableName}>{c.icon} {c.name}</div>
                    <input
                      className={`${s.smallNum} ${costMod ? s.modifiedValue : ''}`}
                      type="number"
                      value={c.cost || ''}
                      onChange={e => upd({ cost: parseAmount(e.target.value) })}
                      disabled={!c.enabled}
                    />
                    <input
                      className={`${s.smallNum} ${kmMod ? s.modifiedValue : ''}`}
                      type="number"
                      value={c.cycleKm ?? ''}
                      placeholder="-"
                      onChange={e => upd({ cycleKm: e.target.value ? parseAmount(e.target.value) : null })}
                      disabled={!c.enabled}
                    />
                    <input
                      className={`${s.smallNum} ${monMod ? s.modifiedValue : ''}`}
                      type="number"
                      value={c.cycleMon ?? ''}
                      placeholder="-"
                      onChange={e => upd({ cycleMon: e.target.value ? parseAmount(e.target.value) : null })}
                      disabled={!c.enabled}
                    />
                    <div className={s.consumableMonthly}>
                      {c.enabled ? fmt(monthly) : '제외'}
                    </div>
                    <button
                      className={`${s.miniToggle} ${!c.enabled ? s.miniToggleOff : ''}`}
                      onClick={() => upd({ enabled: !c.enabled })}
                      style={{ gridColumn: 'span 1' }}
                    >
                      {c.enabled ? '제외' : '포함'}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className={s.helperText}>
              💡 km/월 둘 다 입력 시 먼저 도달하는 기준이 적용됩니다. 차량 매뉴얼 권장 주기를 우선하세요.
            </div>
          </>
        )}

        <div className={s.monthlyHint}>월 변동비 합계: {fmt(consumablesMonthly)}</div>
      </div>

      {/* ───── 결과 ───── */}

      {/* 히어로 */}
      <div className={s.hero}>
        <div className={s.heroLead}>내 차는 하루에 약</div>
        <div className={s.heroNum}>{fmt(dailyTotal)}</div>
        <div className={s.heroLead} style={{ marginTop: 6, marginBottom: 0 }}>씩 쓰고 있어요</div>

        <div className={s.heroDual}>
          <div className={s.heroDualBox}>
            <div className={s.heroDualLabel}>감가 제외</div>
            <div className={s.heroDualVal}>월 {fmt(monthlyExclDepr)}</div>
            <div className={s.heroDualSub}>일 {fmt(monthlyExclDepr / 30.5)}</div>
          </div>
          <div className={s.heroDualBox}>
            <div className={s.heroDualLabel}>감가 포함</div>
            <div className={s.heroDualVal}>월 {fmt(monthlyInclDepr)}</div>
            <div className={s.heroDualSub}>일 {fmt(monthlyInclDepr / 30.5)}</div>
          </div>
        </div>
      </div>

      {/* breakdown */}
      <div className={s.card}>
        <span className={s.cardLabel}>비용 항목 분석</span>
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
              {visibleBreakdown.map(it => {
                const pct = breakdownTotal > 0 ? (it.value / breakdownTotal) * 100 : 0
                const isMax = it.key === maxItem.key && breakdownTotal > 0
                const isDepr = it.key === 'depr'
                return (
                  <tr key={it.key} className={`${isDepr ? s.deprRow : ''} ${isMax ? s.maxRow : ''}`}>
                    <td>{it.icon} {it.label}</td>
                    <td className={s.numCell}>{fmt(it.value)}</td>
                    <td className={s.pctCell}>{pct.toFixed(0)}%</td>
                  </tr>
                )
              })}
              <tr className={s.totalRow}>
                <td>합계</td>
                <td className={s.numCell}>{fmt(breakdownTotal)}</td>
                <td className={s.pctCell}>100%</td>
              </tr>
            </tbody>
          </table>

          <div className={s.donutWrap}>
            <Donut items={visibleBreakdown} total={breakdownTotal} />
            <div className={s.legend}>
              {visibleBreakdown.map(it => {
                const pct = breakdownTotal > 0 ? (it.value / breakdownTotal) * 100 : 0
                return (
                  <div key={it.key} className={s.legendRow}>
                    <span className={s.legendDot} style={{ background: it.color }} />
                    <span className={s.legendLabel}>{it.label}</span>
                    <span className={s.legendVal}>{pct.toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 환산 카드 3개 */}
      <div className={s.convertGrid}>
        <div className={s.convertCard}>
          <div className={s.convertLabel}>월 유지비</div>
          <div className={s.convertVal}>{fmt(monthlyTotal)}</div>
          <div className={s.convertSub}>{deprOn ? '감가 포함' : '감가 제외'}</div>
        </div>
        <div className={s.convertCard}>
          <div className={s.convertLabel}>하루 유지비</div>
          <div className={s.convertVal}>{fmt(dailyTotal)}</div>
          <div className={s.convertSub}>월 / 30.5</div>
        </div>
        <div className={s.convertCard}>
          <div className={s.convertLabel}>1km당 비용</div>
          <div className={s.convertVal}>{fmt(perKm)}</div>
          <div className={s.convertSub}>월 / {fmtNum(monthlyKm)}km</div>
        </div>
      </div>

      {/* 연간 카드 */}
      <div className={s.annualCard}>
        <div className={s.annualLabel}>연간 총 유지비</div>
        <div className={s.annualVal}>{fmt(annualTotal)}</div>
        <div className={s.annualSub}>
          연 {fmtNum(annualTotal / 10_000)}만원, 10년이면 약 {fmtNum(annualTotal * 10 / 100_000_000)}억 {fmtNum((annualTotal * 10 % 100_000_000) / 10_000)}만원
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
            <div className={s.transitVal}>{fmt(monthlyTotal)}</div>
          </div>
          <div className={s.transitBox}>
            <div className={s.transitLabel}>대중교통</div>
            <div className={s.transitVal}>{fmt(transitCost)}</div>
          </div>
        </div>
        <div className={s.transitDiff}>
          {monthlyTotal > transitCost ? (
            <>차이: 월 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne' }}>{fmt(monthlyTotal - transitCost)}</strong>, 연간 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne' }}>{fmt((monthlyTotal - transitCost) * 12)}</strong></>
          ) : (
            <>차량이 대중교통보다 월 <strong style={{ color: '#3EFF9B', fontFamily: 'Syne' }}>{fmt(transitCost - monthlyTotal)}</strong> 저렴합니다 (편의성 가치 별도)</>
          )}
        </div>
      </div>

      {/* 절약 팁 */}
      <div className={s.tipsCard}>
        <ul>
          {tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>

      {/* 복사 */}
      <div className={s.actionRow}>
        <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={onCopy}>
          {copied ? '✓ 복사됨' : '📋 결과 복사하기'}
        </button>
      </div>

      {/* 면책 */}
      <div className={s.disclaimer}>
        ⚖️ 입력값 기준 예상 유지비입니다. 실제 비용은 차량 상태, 운전 습관, 정비 주기, 보험 조건에 따라 달라질 수 있습니다.
        소모품 기본값은 참고용이며, 차량 매뉴얼을 우선 확인하세요.
      </div>
    </div>
  )
}

// ───────────────────────── 도넛 차트 ─────────────────────────

function Donut({
  items,
  total,
}: {
  items: { key: string; label: string; value: number; color: string }[]
  total: number
}) {
  const size = 180
  const cx = size / 2
  const cy = size / 2
  const r = 70
  const strokeWidth = 24

  if (total <= 0) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg3)" strokeWidth={strokeWidth} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="var(--muted)">0원</text>
      </svg>
    )
  }

  let cumulative = 0
  const circumference = 2 * Math.PI * r
  const segments = items.map(it => {
    const fraction = it.value / total
    const dash = fraction * circumference
    const dashArray = `${dash} ${circumference - dash}`
    const dashOffset = -cumulative * circumference
    cumulative += fraction
    return { ...it, dashArray, dashOffset }
  })

  return (
    <svg width={size} height={size}>
      <g style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg3)" strokeWidth={strokeWidth} />
        {segments.map(seg => (
          <circle
            key={seg.key}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={seg.dashArray}
            strokeDashoffset={seg.dashOffset}
          />
        ))}
      </g>
      <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="central" fontSize="11" fill="var(--muted)">월 합계</text>
      <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="central" fontSize="14" fill="var(--accent)" fontWeight="700" fontFamily="Syne, sans-serif">
        {Math.round(total / 10_000).toLocaleString()}만원
      </text>
    </svg>
  )
}

// ───────────────────────── 헬퍼 ─────────────────────────

function calcMonthlyConsumable(c: Consumable, monthlyKm: number): number {
  if (!c.enabled) return 0
  const byKm = c.cycleKm && monthlyKm > 0
    ? c.cost / (c.cycleKm / monthlyKm)
    : Infinity
  const byMon = c.cycleMon
    ? c.cost / c.cycleMon
    : Infinity
  const result = Math.min(byKm, byMon)
  return isFinite(result) ? result : 0
}
