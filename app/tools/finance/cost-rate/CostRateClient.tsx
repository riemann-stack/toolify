'use client'

import { useMemo, useState } from 'react'
import styles from './cost-rate.module.css'

/* ─────────────────────────────────────────────────────────
 * 배달앱 프리셋
 * ───────────────────────────────────────────────────────── */
const DELIVERY_APPS = [
  { id: 'baemin',   label: '배달의민족 (오픈서비스)', commission: 6.8,  cls: 'appBaemin'  },
  { id: 'coupang',  label: '쿠팡이츠 (스마트배달)',   commission: 9.8,  cls: 'appCoupang' },
  { id: 'yogiyo',   label: '요기요 (요기요 배달)',     commission: 12.5, cls: 'appYogiyo'  },
  { id: 'own',      label: '자체 주문 페이지',          commission: 0,    cls: 'appOwn'     },
] as const
type AppId = typeof DELIVERY_APPS[number]['id'] | 'custom'

type Channel = 'store' | 'delivery' | 'pickup' | 'all'

interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  unitPrice: number
}

/* breakdown 색상 팔레트 */
const C = {
  ingredient: '#FF8C3E',
  packaging:  '#FFD700',
  commission: '#FF6B6B',
  delivery:   '#9B59B6',
  ad:         '#3EC8FF',
  margin:     '#C8FF3E',
}

/* ─────────────────────────────────────────────────────────
 * 유틸
 * ───────────────────────────────────────────────────────── */
function n(v: string | number, min = 0): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < min) return min
  return x
}
function fmt(v: number): string {
  return Math.round(v).toLocaleString('ko-KR')
}
function fmtSign(v: number): string {
  const r = Math.round(v)
  return (r >= 0 ? '+' : '') + r.toLocaleString('ko-KR')
}
function parseComma(s: string): number {
  const cleaned = s.replace(/[^0-9.-]/g, '')
  const v = Number(cleaned)
  return Number.isFinite(v) ? v : 0
}
function fmtKRW(amount: number): string {
  const v = Math.round(amount)
  if (v === 0) return '0원'
  const sign = v < 0 ? '-' : ''
  const abs = Math.abs(v)
  const eok = Math.floor(abs / 100_000_000)
  const man = Math.floor((abs % 100_000_000) / 10_000)
  const won = abs % 10_000
  const parts: string[] = []
  if (eok > 0) parts.push(`${eok.toLocaleString('ko-KR')}억`)
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`)
  if (won > 0 && eok === 0 && man === 0) parts.push(`${won.toLocaleString('ko-KR')}`)
  if (parts.length === 0) return '0원'
  return `${sign}${parts.join(' ')}원`
}

/* 원가율 등급 */
function gradeOf(rate: number) {
  if (rate <= 28) return { label: '🌟 매우 우수', cls: styles.gradeExcellent }
  if (rate <= 35) return { label: '✅ 양호',       cls: styles.gradeGood }
  if (rate <= 40) return { label: '보통',          cls: styles.gradeAverage }
  if (rate <= 50) return { label: '🔶 주의',       cls: styles.gradeWarning }
  return { label: '🚨 위험', cls: styles.gradeDanger }
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function CostRateClient() {
  const [tab, setTab] = useState<'main' | 'reverse' | 'increase' | 'monthly'>('main')

  /* ─── 공통: 메뉴 / 채널 / 입력 ─── */
  const [menuName,   setMenuName]   = useState('메뉴 1')
  const [channel,    setChannel]    = useState<Channel>('delivery')
  const [priceStr,   setPriceStr]   = useState('15000')
  const [ingredientStr, setIngredientStr] = useState('5100')
  const [packagingStr,  setPackagingStr]  = useState('700')
  const [accessoryStr,  setAccessoryStr]  = useState('300')

  /* 재료 상세 입력 토글 + 데이터 */
  const [showIngredients, setShowIngredients] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: '닭다리살',   amount: 200, unit: 'g',    unitPrice: 30 },
    { id: '2', name: '양파',       amount: 50,  unit: 'g',    unitPrice: 5  },
    { id: '3', name: '양념·소스',  amount: 1,   unit: '인분', unitPrice: 800 },
  ])

  /* 배달 정보 */
  const [appPreset, setAppPreset] = useState<AppId>('baemin')
  const [appCommissionStr, setAppCommissionStr] = useState('6.8')
  const [paymentRateStr,   setPaymentRateStr]   = useState('3.0')
  const [deliveryBurdenStr, setDeliveryBurdenStr] = useState('1000')
  const [adCostStr, setAdCostStr] = useState('100')

  /* 탭 2: 역산 */
  const [targetCostRate, setTargetCostRate] = useState(35)

  /* 탭 3: 인상 시뮬레이션 */
  const [increaseStr, setIncreaseStr] = useState('1000')
  const [monthlyVolumeStr, setMonthlyVolumeStr] = useState('300')
  const [elasticityStr, setElasticityStr] = useState('-0.7')

  /* 탭 4: 월 수익 */
  interface MonthlyMenu { id: string; name: string; margin: number; daily: number }
  const [monthlyMenus, setMonthlyMenus] = useState<MonthlyMenu[]>([
    { id: '1', name: '치킨',  margin: 7000, daily: 30 },
    { id: '2', name: '피자',  margin: 6000, daily: 15 },
    { id: '3', name: '음료',  margin: 1500, daily: 40 },
  ])
  const [businessDaysStr, setBusinessDaysStr] = useState('26')
  const [rentStr,      setRentStr]      = useState('2000000')
  const [laborStr,     setLaborStr]     = useState('3000000')
  const [utilityStr,   setUtilityStr]   = useState('500000')
  const [targetProfitStr, setTargetProfitStr] = useState('5000000')

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* 파생값 */
  const price = parseComma(priceStr)

  /* 재료 상세 합계 (사용 시) */
  const ingredientFromTable = useMemo(
    () => ingredients.reduce((sum, it) => sum + n(it.amount) * n(it.unitPrice), 0),
    [ingredients]
  )
  const ingredient = showIngredients ? ingredientFromTable : parseComma(ingredientStr)
  const packaging = (channel === 'delivery' || channel === 'pickup' || channel === 'all') ? parseComma(packagingStr) : 0
  const accessory = parseComma(accessoryStr)
  const variableCost = ingredient + packaging + accessory

  /* 배달 수수료 */
  const useDelivery = channel === 'delivery' || channel === 'all'
  const appRate = useDelivery ? n(appCommissionStr) : 0
  const payRate = useDelivery ? n(paymentRateStr) : 0
  const commissionTotalRate = (appRate + payRate) / 100
  const commission = useDelivery ? price * commissionTotalRate : 0
  const deliveryBurden = useDelivery ? parseComma(deliveryBurdenStr) : 0
  const adCost = useDelivery ? parseComma(adCostStr) : 0

  /* 합계 */
  const totalDeductions = variableCost + commission + deliveryBurden + adCost
  const netRevenue = price - totalDeductions
  const basicCostRate = price > 0 ? (ingredient / price) * 100 : 0
  const realCostRate  = price > 0 ? (totalDeductions / price) * 100 : 0
  const marginRate    = price > 0 ? (netRevenue / price) * 100 : 0

  /* breakdown 데이터 */
  const breakdown = useMemo(() => {
    const items = [
      { label: '재료비',          value: ingredient,     color: C.ingredient },
      ...(packaging > 0 ? [{ label: '포장재',      value: packaging,      color: C.packaging }] : []),
      ...(accessory > 0 ? [{ label: '부재료/소모품', value: accessory,      color: C.packaging }] : []),
      ...(useDelivery && commission > 0
        ? [{ label: `배달앱+결제 수수료 (${(appRate + payRate).toFixed(1)}%)`, value: commission, color: C.commission }]
        : []),
      ...(useDelivery && deliveryBurden > 0
        ? [{ label: '배달비 부담', value: deliveryBurden, color: C.delivery }]
        : []),
      ...(useDelivery && adCost > 0
        ? [{ label: '광고비 환산', value: adCost,         color: C.ad }]
        : []),
      { label: '남는 금액', value: Math.max(0, netRevenue), color: C.margin, isMargin: true },
    ]
    return items
  }, [ingredient, packaging, accessory, commission, appRate, payRate, deliveryBurden, adCost, netRevenue, useDelivery])

  /* 도넛 차트 segment */
  const donut = useMemo(() => {
    const total = breakdown.reduce((s, it) => s + it.value, 0)
    if (total <= 0) return [] as Array<{ d: string; color: string }>
    let acc = 0
    const cx = 100, cy = 100, r = 80, r2 = 50
    return breakdown.filter(b => b.value > 0).map(b => {
      const start = (acc / total) * Math.PI * 2
      acc += b.value
      const end = (acc / total) * Math.PI * 2
      const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
      const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
      const x3 = cx + r2 * Math.cos(end),  y3 = cy + r2 * Math.sin(end)
      const x4 = cx + r2 * Math.cos(start),y4 = cy + r2 * Math.sin(start)
      const large = end - start > Math.PI ? 1 : 0
      const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)} A ${r2} ${r2} 0 ${large} 0 ${x4.toFixed(2)} ${y4.toFixed(2)} Z`
      return { d, color: b.color }
    })
  }, [breakdown])

  /* 채널별 비교 (모두 비교 모드) */
  const channelCompare = useMemo(() => {
    if (channel !== 'all') return []
    const buildRow = (label: string, appRate_: number, cls: string) => {
      const comm = price * ((appRate_ + payRate) / 100)
      const variable = ingredient + (appRate_ > 0 ? packaging : 0) + accessory
      const burden = appRate_ > 0 ? deliveryBurden : 0
      const ad = appRate_ > 0 ? adCost : 0
      const ded = variable + comm + burden + ad
      const net = price - ded
      return { label, net, real: price > 0 ? (ded / price) * 100 : 0, margin: price > 0 ? (net / price) * 100 : 0, cls }
    }
    const rows = [
      buildRow('🏪 매장',                       0,    'compareStore'),
      buildRow('🟢 배민 (6.8%)',                6.8,  'compareBaemin'),
      buildRow('🔴 쿠팡이츠 (9.8%)',           9.8,  'compareCoupang'),
      buildRow('🟡 요기요 (12.5%)',            12.5, 'compareYogiyo'),
      buildRow('🌐 자체 (수수료 0%)',          0.0,  'compareOwn'),
    ]
    const bestIdx = rows.reduce((maxI, r, i, arr) => r.net > arr[maxI].net ? i : maxI, 0)
    return rows.map((r, i) => ({ ...r, isBest: i === bestIdx }))
  }, [channel, price, ingredient, packaging, accessory, deliveryBurden, adCost, payRate])

  /* ─────────────────────────────── 탭 2 — 역산 ─────────────────────────────── */
  const reverseResult = useMemo(() => {
    if (ingredient <= 0 || targetCostRate <= 0) return null
    const margin = targetCostRate / 100
    if (!useDelivery) {
      const need = ingredient / margin
      return { exact: need, possible: true }
    }
    const totalVariable = ingredient + packaging + deliveryBurden
    if (margin <= commissionTotalRate) return { exact: 0, possible: false }
    const need = totalVariable / (margin - commissionTotalRate)
    return { exact: need, possible: true }
  }, [ingredient, packaging, deliveryBurden, commissionTotalRate, targetCostRate, useDelivery])

  /* ─────────────────────────────── 탭 3 — 인상 시뮬레이션 ─────────────────────────────── */
  const increase = parseComma(increaseStr)
  const monthlyVolume = parseComma(monthlyVolumeStr)
  const elasticity = n(elasticityStr, -10) // can be negative
  const elasticityVal = Number(elasticityStr) || 0

  const newPrice = price + increase
  const newCommission = useDelivery ? newPrice * commissionTotalRate : 0
  const newDeductions = variableCost + newCommission + deliveryBurden + adCost
  const newNet = newPrice - newDeductions
  const newReal = newPrice > 0 ? (newDeductions / newPrice) * 100 : 0

  const monthlyMarginNow = netRevenue * monthlyVolume
  const monthlyMarginNew = newNet * monthlyVolume
  const monthlyDelta = monthlyMarginNew - monthlyMarginNow
  const annualDelta = monthlyDelta * 12

  /* 탄력성 적용 */
  const priceChangePct = price > 0 ? (increase / price) * 100 : 0
  const volumeChangePct = priceChangePct * elasticityVal // elasticity는 음수
  const adjustedVolume = monthlyVolume * (1 + volumeChangePct / 100)
  const adjustedMarginNew = newNet * Math.max(0, adjustedVolume)
  const adjustedDelta = adjustedMarginNew - monthlyMarginNow

  /* ─────────────────────────────── 탭 4 — 월 수익 ─────────────────────────────── */
  const businessDays = n(businessDaysStr, 1)
  const fixedCosts = parseComma(rentStr) + parseComma(laborStr) + parseComma(utilityStr)

  const monthlyMenuStats = useMemo(() => {
    const totals = monthlyMenus.reduce(
      (acc, m) => {
        const dailyMargin = n(m.margin) * n(m.daily)
        const monthlyMargin = dailyMargin * businessDays
        return {
          dailyOrders: acc.dailyOrders + n(m.daily),
          monthlyMargin: acc.monthlyMargin + monthlyMargin,
        }
      },
      { dailyOrders: 0, monthlyMargin: 0 }
    )
    const avgMarginPerItem = totals.dailyOrders > 0
      ? monthlyMenus.reduce((s, m) => s + n(m.margin) * n(m.daily), 0) / totals.dailyOrders
      : 0
    const grossProfit = totals.monthlyMargin
    const operatingProfit = grossProfit - fixedCosts
    const breakEvenItems = avgMarginPerItem > 0 ? Math.ceil(fixedCosts / avgMarginPerItem) : 0
    const breakEvenDaily = businessDays > 0 ? Math.ceil(breakEvenItems / businessDays) : 0
    const targetProfit = parseComma(targetProfitStr)
    const targetExtraItems = avgMarginPerItem > 0 ? Math.ceil(Math.max(0, targetProfit - operatingProfit) / avgMarginPerItem) : 0
    const targetExtraDaily = businessDays > 0 ? Math.ceil(targetExtraItems / businessDays) : 0
    return { ...totals, avgMarginPerItem, grossProfit, operatingProfit, breakEvenItems, breakEvenDaily, targetExtraItems, targetExtraDaily }
  }, [monthlyMenus, businessDays, fixedCosts, targetProfitStr])

  /* ─── 헬퍼: 채널 변경 ─── */
  function selectChannel(c: Channel) {
    setChannel(c)
  }
  /* ─── 헬퍼: 배달앱 변경 ─── */
  function selectApp(id: AppId) {
    setAppPreset(id)
    const preset = DELIVERY_APPS.find(a => a.id === id)
    if (preset) setAppCommissionStr(String(preset.commission))
    if (id === 'own') setAppCommissionStr('0')
  }

  /* ─── 재료 추가/삭제 ─── */
  function addIngredient() {
    if (ingredients.length >= 15) return
    setIngredients([...ingredients, { id: String(Date.now()), name: '', amount: 0, unit: 'g', unitPrice: 0 }])
  }
  function removeIngredient(id: string) {
    setIngredients(ingredients.filter(it => it.id !== id))
  }
  function updateIngredient(id: string, patch: Partial<Ingredient>) {
    setIngredients(ingredients.map(it => it.id === id ? { ...it, ...patch } : it))
  }

  /* ─── 메뉴 추가/삭제 ─── */
  function addMonthlyMenu() {
    if (monthlyMenus.length >= 5) return
    setMonthlyMenus([...monthlyMenus, { id: String(Date.now()), name: `메뉴 ${monthlyMenus.length + 1}`, margin: 5000, daily: 10 }])
  }
  function removeMonthlyMenu(id: string) {
    setMonthlyMenus(monthlyMenus.filter(m => m.id !== id))
  }
  function updateMonthlyMenu(id: string, patch: Partial<MonthlyMenu>) {
    setMonthlyMenus(monthlyMenus.map(m => m.id === id ? { ...m, ...patch } : m))
  }

  /* 결과 복사 */
  function handleCopy() {
    let text = ''
    if (tab === 'main') {
      text = [
        `── ${menuName} 원가율 분석 ──`,
        `판매가 ${fmt(price)}원`,
        `기본 원가율 ${basicCostRate.toFixed(1)}% / 실질 원가율 ${realCostRate.toFixed(1)}%`,
        `1개 판매 시 남는 금액: ${fmt(netRevenue)}원 (마진율 ${marginRate.toFixed(1)}%)`,
        'youtil.kr/tools/finance/cost-rate',
      ].join('\n')
    } else if (tab === 'reverse' && reverseResult?.possible) {
      text = [
        `── 판매가 역산 ──`,
        `재료비 ${fmt(ingredient)}원, 목표 원가율 ${targetCostRate}%`,
        `필요 판매가: ${fmt(reverseResult.exact)}원`,
        'youtil.kr/tools/finance/cost-rate',
      ].join('\n')
    } else if (tab === 'increase') {
      text = [
        `── 가격 인상 시뮬레이션 ──`,
        `${fmt(price)}원 → ${fmt(newPrice)}원 (${fmtSign(increase)})`,
        `월 ${monthlyVolume}개 기준 추가 이익: ${fmtSign(monthlyDelta)}원/월`,
        'youtil.kr/tools/finance/cost-rate',
      ].join('\n')
    } else {
      text = [
        `── 월 수익 분석 ──`,
        `월 매출총이익 ${fmtKRW(monthlyMenuStats.grossProfit)} / 영업이익 ${fmtKRW(monthlyMenuStats.operatingProfit)}`,
        `손익분기 월 ${monthlyMenuStats.breakEvenItems}개 (일 ${monthlyMenuStats.breakEvenDaily}개)`,
        'youtil.kr/tools/finance/cost-rate',
      ].join('\n')
    }
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <div className={styles.wrap}>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'main' ? styles.tabActive : ''}`}     onClick={() => setTab('main')}>원가율 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'reverse' ? styles.tabActive : ''}`}  onClick={() => setTab('reverse')}>판매가 역산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'increase' ? styles.tabActive : ''}`} onClick={() => setTab('increase')}>가격 인상 시뮬</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'monthly' ? styles.tabActive : ''}`}  onClick={() => setTab('monthly')}>월 수익 계산</button>
      </div>

      {/* ──────────────────────── 공통 입력 (탭 1·2·3) ──────────────────────── */}
      {tab !== 'monthly' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>판매 채널</span>
              <span className={styles.cardLabelHint}>채널별로 비용 구성 다름</span>
            </div>
            <div className={styles.channelGrid}>
              <button type="button" className={`${styles.channelBtn} ${channel === 'store' ? styles.channelActive : ''}`}    onClick={() => selectChannel('store')}>🏪 매장</button>
              <button type="button" className={`${styles.channelBtn} ${channel === 'delivery' ? styles.channelActive : ''}`} onClick={() => selectChannel('delivery')}>🛵 배달</button>
              <button type="button" className={`${styles.channelBtn} ${channel === 'pickup' ? styles.channelActive : ''}`}   onClick={() => selectChannel('pickup')}>📦 포장</button>
              <button type="button" className={`${styles.channelBtn} ${channel === 'all' ? styles.channelActive : ''}`}      onClick={() => selectChannel('all')}>🌐 모두 비교</button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>메뉴 정보</span>
            </div>

            <span className={styles.subLabel}>메뉴명</span>
            <input className={styles.textInput} type="text" value={menuName} onChange={e => setMenuName(e.target.value || '메뉴 1')} />

            <div style={{ height: 14 }} />
            <span className={styles.subLabel}>판매가</span>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="text" inputMode="numeric" value={fmt(price)} onChange={e => setPriceStr(parseComma(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>
            {price > 0 && <p className={styles.koreanLabel}>약 {fmtKRW(price)}</p>}

            <div style={{ height: 14 }} />
            <span className={styles.subLabel}>재료비</span>
            <div className={styles.miniToggle}>
              <button type="button" className={`${styles.miniBtn} ${!showIngredients ? styles.miniActive : ''}`} onClick={() => setShowIngredients(false)}>단순 입력</button>
              <button type="button" className={`${styles.miniBtn} ${showIngredients ? styles.miniActive : ''}`}  onClick={() => setShowIngredients(true)}>재료별 상세</button>
            </div>

            {!showIngredients ? (
              <div className={styles.inputRow}>
                <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(ingredientStr))} onChange={e => setIngredientStr(parseComma(e.target.value).toString())} />
                <span className={styles.unit}>원</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.ingredientTable}>
                  <thead>
                    <tr>
                      <th>재료명</th>
                      <th style={{ width: 70 }}>양</th>
                      <th style={{ width: 60 }}>단위</th>
                      <th style={{ width: 80 }}>단가</th>
                      <th style={{ width: 80, textAlign: 'right' }}>비용</th>
                      <th style={{ width: 32 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map(it => (
                      <tr key={it.id} className={styles.ingRow}>
                        <td><input type="text" value={it.name} placeholder="재료" onChange={e => updateIngredient(it.id, { name: e.target.value })} /></td>
                        <td><input type="number" min={0} value={it.amount} onChange={e => updateIngredient(it.id, { amount: n(e.target.value) })} /></td>
                        <td>
                          <select value={it.unit} onChange={e => updateIngredient(it.id, { unit: e.target.value })}>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="L">L</option>
                            <option value="개">개</option>
                            <option value="인분">인분</option>
                          </select>
                        </td>
                        <td><input type="number" min={0} value={it.unitPrice} onChange={e => updateIngredient(it.id, { unitPrice: n(e.target.value) })} /></td>
                        <td className={styles.costCell}>{fmt(n(it.amount) * n(it.unitPrice))}</td>
                        <td><button type="button" className={styles.ingRemove} onClick={() => removeIngredient(it.id)} aria-label="삭제">✕</button></td>
                      </tr>
                    ))}
                    <tr className={styles.ingTotalRow}>
                      <td colSpan={4} style={{ color: 'var(--accent)' }}>재료비 합계</td>
                      <td className={styles.costCell}>{fmt(ingredientFromTable)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
                {ingredients.length < 15 && (
                  <button type="button" className={styles.addBtn} onClick={addIngredient}>+ 재료 추가</button>
                )}
              </div>
            )}

            {(channel === 'delivery' || channel === 'pickup' || channel === 'all') && (
              <>
                <div style={{ height: 14 }} />
                <span className={styles.subLabel}>포장재 비용</span>
                <div className={styles.inputRow}>
                  <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(packagingStr))} onChange={e => setPackagingStr(parseComma(e.target.value).toString())} />
                  <span className={styles.unit}>원</span>
                </div>

                <div style={{ height: 10 }} />
                <span className={styles.subLabel}>부재료·소모품 (냅킨·1회용품)</span>
                <div className={styles.inputRow}>
                  <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(accessoryStr))} onChange={e => setAccessoryStr(parseComma(e.target.value).toString())} />
                  <span className={styles.unit}>원</span>
                </div>
              </>
            )}
          </div>

          {(channel === 'delivery' || channel === 'all') && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>배달앱 수수료</span>
                <span className={styles.cardLabelHint}>2024 정책 기준</span>
              </div>
              <div className={styles.appGrid}>
                {DELIVERY_APPS.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    className={`${styles.appBtn} ${styles[a.cls]} ${appPreset === a.id ? styles.appActive : ''}`}
                    onClick={() => selectApp(a.id)}
                  >
                    {a.label}
                    <small>{a.commission > 0 ? `${a.commission}%` : '0%'}</small>
                  </button>
                ))}
              </div>

              <span className={styles.subLabel}>배달앱 수수료율 (%)</span>
              <div className={styles.inputRow}>
                <input className={styles.smallInput} type="number" inputMode="decimal" min={0} step="0.1" value={appCommissionStr} onChange={e => { setAppCommissionStr(e.target.value); setAppPreset('custom') }} />
                <span className={styles.unit}>%</span>
              </div>

              <div style={{ height: 10 }} />
              <span className={styles.subLabel}>결제 수수료율 (%)</span>
              <div className={styles.inputRow}>
                <input className={styles.smallInput} type="number" inputMode="decimal" min={0} step="0.1" value={paymentRateStr} onChange={e => setPaymentRateStr(e.target.value)} />
                <span className={styles.unit}>%</span>
              </div>

              <div style={{ height: 10 }} />
              <span className={styles.subLabel}>배달비 가게 부담 (1주문당)</span>
              <div className={styles.inputRow}>
                <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(deliveryBurdenStr))} onChange={e => setDeliveryBurdenStr(parseComma(e.target.value).toString())} />
                <span className={styles.unit}>원</span>
              </div>

              <div style={{ height: 10 }} />
              <span className={styles.subLabel}>광고비 (주문당 환산, 월 광고비 ÷ 월 주문수)</span>
              <div className={styles.inputRow}>
                <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(adCostStr))} onChange={e => setAdCostStr(parseComma(e.target.value).toString())} />
                <span className={styles.unit}>원</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* ──────────────────────── 탭 1: 원가율 계산 결과 ──────────────────────── */}
      {tab === 'main' && price > 0 && (
        <>
          <div className={styles.hero}>
            <p className={styles.heroLead}>
              <strong style={{ color: 'var(--text)' }}>{menuName}</strong>의 기본 원가율은 <strong style={{ color: '#3EC8FF' }}>{basicCostRate.toFixed(1)}%</strong>입니다.{useDelivery && <> 배달 수수료·포장비를 반영하면 <strong style={{ color: 'var(--accent)' }}>{realCostRate.toFixed(1)}%</strong>까지 올라갑니다.</>}
            </p>
            <div className={styles.heroDual}>
              <div>
                <p className={styles.heroDualLabel}>기본 원가율 (재료비만)</p>
                <p className={`${styles.heroDualNum} ${styles.basic}`}>{basicCostRate.toFixed(1)}%</p>
              </div>
              <span className={styles.heroDualSep}>→</span>
              <div>
                <p className={styles.heroDualLabel}>실질 원가율 (전체)</p>
                <p className={`${styles.heroDualNum} ${realCostRate >= 50 ? styles.danger : realCostRate >= 40 ? styles.warn : styles.real}`}>{realCostRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className={styles.gradeLine}>
            <span>외식업 권장 원가율 28~35% 기준 — <strong style={{ color: 'var(--text)' }}>{realCostRate.toFixed(1)}%</strong></span>
            <span className={`${styles.gradeBadge} ${gradeOf(realCostRate).cls}`}>{gradeOf(realCostRate).label}</span>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>비용 구성 Breakdown</span>
              <span className={styles.cardLabelHint}>판매가 {fmt(price)}원 기준</span>
            </div>
            <div className={styles.breakdownWrap}>
              <div className={styles.donutWrap}>
                <svg className={styles.donutSvg} viewBox="0 0 200 200" aria-hidden="true">
                  {donut.map((p, i) => (<path key={i} d={p.d} fill={p.color} />))}
                </svg>
                <div className={styles.donutCenter}>
                  <p className={styles.donutCenterLabel}>판매가</p>
                  <p className={styles.donutCenterValue}>{fmt(price)}</p>
                </div>
              </div>
              <table className={styles.breakdownTable}>
                <tbody>
                  {breakdown.filter(b => b.value > 0 && !b.isMargin).map((b, i) => (
                    <tr key={i}>
                      <td><span className={styles.breakdownDot} style={{ background: b.color }} />{b.label}</td>
                      <td>{fmt(b.value)}원</td>
                      <td>{((b.value / price) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className={styles.breakdownTotalRow}>
                    <td><span className={styles.breakdownDot} style={{ background: C.margin }} />남는 금액</td>
                    <td>{fmt(Math.max(0, netRevenue))}원</td>
                    <td>{Math.max(0, marginRate).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.netCard}>
            <p className={styles.netCardLabel}>1개 판매 시 남는 금액</p>
            <p className={`${styles.netCardValue} ${netRevenue < 0 ? styles.loss : ''}`}>
              {netRevenue < 0 ? '-' : ''}{fmt(Math.abs(netRevenue))}<span style={{ fontSize: 20, color: 'var(--muted)', marginLeft: 4 }}>원</span>
            </p>
            <p className={styles.netCardSub}>마진율 {marginRate.toFixed(1)}%</p>
          </div>

          {channel === 'all' && channelCompare.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>채널별 비교</span>
                <span className={styles.cardLabelHint}>가장 유리한 채널 강조</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.compareTable}>
                  <thead>
                    <tr><th>채널</th><th>실수령액</th><th>실질 원가율</th><th>마진율</th></tr>
                  </thead>
                  <tbody>
                    {channelCompare.map((r, i) => (
                      <tr key={i} className={`${styles[r.cls]} ${r.isBest ? styles.bestRow : ''}`}>
                        <td>{r.label}</td>
                        <td>{fmt(r.net)}원</td>
                        <td>{r.real.toFixed(1)}%</td>
                        <td>{r.margin.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ──────────────────────── 탭 2: 판매가 역산 ──────────────────────── */}
      {tab === 'reverse' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>목표 원가율</span>
              <span className={styles.cardLabelHint}>슬라이더 또는 직접 입력</span>
            </div>
            <div className={styles.sliderRow}>
              <input
                className={`${styles.slider} ${styles.sliderUp}`}
                type="range"
                min={20}
                max={50}
                step={1}
                value={targetCostRate}
                onChange={e => setTargetCostRate(Number(e.target.value))}
              />
              <span className={styles.sliderValue}>{targetCostRate}%</span>
            </div>
          </div>

          {reverseResult && reverseResult.possible ? (
            <>
              <div className={styles.netCard}>
                <p className={styles.netCardLabel}>목표 원가율 {targetCostRate}% 를 위한 필요 판매가</p>
                <p className={styles.netCardValue}>
                  {fmt(reverseResult.exact)}<span style={{ fontSize: 20, color: 'var(--muted)', marginLeft: 4 }}>원</span>
                </p>
                <p className={styles.netCardSub}>약 {fmtKRW(reverseResult.exact)}</p>
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>
                  <span>가격 추천 (3가지)</span>
                  <span className={styles.cardLabelHint}>심리·라운드·정확</span>
                </div>
                {(() => {
                  const exact = reverseResult.exact
                  const round100 = Math.round(exact / 100) * 100
                  const round1k = Math.ceil(exact / 1000) * 1000
                  const psychological = round1k - 100  // ex: 12,000 → 11,900
                  const items = [
                    { label: '🎯 정확',   price: round100,        desc: '100원 단위 반올림' },
                    { label: '✨ 심리가격', price: psychological,   desc: '1,000원대 심리 효과', highlight: true },
                    { label: '⚪ 라운드', price: round1k,         desc: '1,000원 단위 정돈' },
                  ]
                  return (
                    <div className={styles.priceRecGrid}>
                      {items.map((it, i) => {
                        const actualRate = useDelivery
                          ? ((ingredient + packaging + deliveryBurden + adCost + it.price * commissionTotalRate + accessory) / it.price) * 100
                          : ((ingredient + accessory) / it.price) * 100
                        return (
                          <div key={i} className={`${styles.priceRecCard} ${it.highlight ? styles.priceRecRound : ''}`}>
                            <p className={styles.priceRecLabel}>{it.label}</p>
                            <p className={styles.priceRecValue}>{fmt(it.price)}원</p>
                            <p className={styles.priceRecActual}>실질 원가율 {actualRate.toFixed(1)}%</p>
                            <p className={styles.priceRecActual}>{it.desc}</p>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            </>
          ) : (
            <div className={styles.warnBox}>
              <strong>⚠️ 목표 원가율로는 도달 불가</strong> — 입력한 목표 원가율 {targetCostRate}% 가 배달앱·결제 수수료 합계 ({((appRate + payRate)).toFixed(1)}%) 보다 낮거나 같아 어떤 가격을 책정해도 도달할 수 없습니다. 목표 원가율을 더 높게 설정하거나 배달 수수료가 더 낮은 채널을 검토해보세요.
            </div>
          )}

          <div className={styles.warnBox}>
            <strong>💡 업종별 권장 원가율</strong> · 한식·중식 28~35% · 양식 30~35% · 카페·디저트 25~30% · 분식 30~33% · 파인다이닝 35~40%.
          </div>
        </>
      )}

      {/* ──────────────────────── 탭 3: 가격 인상 시뮬레이션 ──────────────────────── */}
      {tab === 'increase' && price > 0 && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>가격 인상 금액</span>
              <span className={styles.cardLabelHint}>음수=인하 / 양수=인상</span>
            </div>
            <div className={styles.sliderRow}>
              <input
                className={`${styles.slider} ${increase > 0 ? styles.sliderUp : increase < 0 ? styles.sliderDown : styles.sliderZero}`}
                type="range"
                min={-2000}
                max={3000}
                step={100}
                value={increase}
                onChange={e => setIncreaseStr(e.target.value)}
              />
              <span className={styles.sliderValue} style={{ color: increase > 0 ? 'var(--accent)' : increase < 0 ? '#FF6B6B' : 'var(--muted)' }}>
                {fmtSign(increase)}원
              </span>
            </div>
            <div className={styles.pills}>
              {[-500, -200, 500, 1000, 1500, 2000].map(v => (
                <button
                  key={v}
                  type="button"
                  className={`${styles.pill} ${v > 0 ? styles.pillUp : styles.pillDown}`}
                  onClick={() => setIncreaseStr(String(v))}
                >
                  {fmtSign(v)}원
                </button>
              ))}
            </div>

            <div style={{ height: 14 }} />
            <span className={styles.subLabel}>월 판매량 (선택)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(monthlyVolume)} onChange={e => setMonthlyVolumeStr(parseComma(e.target.value).toString())} />
              <span className={styles.unit}>개/월</span>
            </div>
          </div>

          <div className={styles.compareGrid}>
            <div className={`${styles.compareCard} ${styles.compareCardCurrent}`}>
              <p className={styles.compareCardLabel}>현재</p>
              <div className={styles.compareCardRow}><span>판매가</span><span>{fmt(price)}원</span></div>
              <div className={styles.compareCardRow}><span>실질 원가율</span><span>{realCostRate.toFixed(1)}%</span></div>
              <div className={`${styles.compareCardRow} ${styles.bigRow}`}><span>마진 (1개당)</span><span>{fmt(netRevenue)}원</span></div>
            </div>
            <div className={`${styles.compareCard} ${styles.compareCardNew}`}>
              <p className={styles.compareCardLabel}>인상 후 ({fmtSign(increase)}원)</p>
              <div className={styles.compareCardRow}><span>판매가</span><span>{fmt(newPrice)}원</span></div>
              <div className={styles.compareCardRow}><span>실질 원가율</span><span>{newReal.toFixed(1)}%</span></div>
              <div className={`${styles.compareCardRow} ${styles.bigRow}`}><span>마진 (1개당)</span><span>{fmt(newNet)}원</span></div>
            </div>
          </div>

          <div className={styles.profitCard}>
            <p className={styles.profitLead}>월 {fmt(monthlyVolume)}개 판매 가정 시</p>
            <div className={styles.profitGrid}>
              <div className={styles.profitCell}>
                <p className={styles.profitCellLabel}>현재 월 마진</p>
                <p className={styles.profitCellValue}>{fmt(monthlyMarginNow)}원</p>
              </div>
              <div className={styles.profitCell}>
                <p className={styles.profitCellLabel}>인상 후 월 마진</p>
                <p className={styles.profitCellValue}>{fmt(monthlyMarginNew)}원</p>
              </div>
              <div className={styles.profitCell}>
                <p className={styles.profitCellLabel}>월 추가 이익</p>
                <p className={`${styles.profitCellValue} ${monthlyDelta >= 0 ? styles.gain : styles.loss}`}>{fmtSign(monthlyDelta)}원</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, textAlign: 'center' }}>
              연간 환산 <strong style={{ color: monthlyDelta >= 0 ? '#3EFF9B' : '#FF6B6B', fontFamily: 'Syne, sans-serif' }}>{fmtSign(annualDelta)}원</strong>
            </p>
          </div>

          {/* 탄력성 시나리오 */}
          {increase !== 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>가격 탄력성 시나리오</span>
                <span className={styles.cardLabelHint}>현실 추정치</span>
              </div>
              <span className={styles.subLabel}>가격 탄력성 (보통 -0.5 ~ -1.5)</span>
              <div className={styles.sliderRow}>
                <input
                  className={`${styles.slider} ${styles.sliderZero}`}
                  type="range"
                  min={-2.0}
                  max={0}
                  step={0.1}
                  value={elasticity}
                  onChange={e => setElasticityStr(e.target.value)}
                />
                <span className={styles.sliderValue}>{elasticityVal.toFixed(1)}</span>
              </div>
              <div className={styles.warnBox} style={{ marginTop: 12 }}>
                가격 변화 <strong>{priceChangePct >= 0 ? '+' : ''}{priceChangePct.toFixed(1)}%</strong> →
                예상 판매량 변화 <strong style={{ color: volumeChangePct < 0 ? '#FF6B6B' : '#3EFF9B' }}>{volumeChangePct >= 0 ? '+' : ''}{volumeChangePct.toFixed(1)}%</strong> ({fmt(adjustedVolume)}개) →
                <br />보정된 월 추가 이익: <strong style={{ color: adjustedDelta >= 0 ? '#3EFF9B' : '#FF6B6B', fontFamily: 'Syne, sans-serif' }}>{fmtSign(adjustedDelta)}원</strong>
              </div>
            </div>
          )}

          <div className={styles.warnBox}>
            <strong>⚠️ 가격 인상 위험 안내</strong> — 일반적으로 10~15% 인상 시 매출 약 5~10% 감소를 가정합니다. 직접 경쟁 매장이 가까이 있다면 탄력성이 더 높을 수 있어 단계적(5~10%씩) 인상이 안전합니다.
          </div>
        </>
      )}

      {/* ──────────────────────── 탭 4: 월 수익 계산 ──────────────────────── */}
      {tab === 'monthly' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>메뉴 등록 (최대 5개)</span>
              <span className={styles.cardLabelHint}>{monthlyMenus.length}/5</span>
            </div>
            <div className={styles.menuRowHeader}>
              <span>메뉴명</span>
              <span>마진/개</span>
              <span>일 판매량</span>
              <span></span>
            </div>
            {monthlyMenus.map(m => (
              <div key={m.id} className={styles.menuRow}>
                <input className={styles.textInput} type="text" value={m.name} placeholder="메뉴명" onChange={e => updateMonthlyMenu(m.id, { name: e.target.value })} />
                <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(m.margin)} onChange={e => updateMonthlyMenu(m.id, { margin: parseComma(e.target.value) })} />
                <input className={styles.smallInput} type="number" min={0} value={m.daily} onChange={e => updateMonthlyMenu(m.id, { daily: n(e.target.value) })} />
                <button type="button" className={styles.ingRemove} onClick={() => removeMonthlyMenu(m.id)} aria-label="삭제">✕</button>
              </div>
            ))}
            {monthlyMenus.length < 5 && (
              <button type="button" className={styles.addBtn} onClick={addMonthlyMenu}>+ 메뉴 추가</button>
            )}

            <div style={{ height: 14 }} />
            <span className={styles.subLabel}>영업일 수 / 월</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="number" min={1} max={31} value={businessDays} onChange={e => setBusinessDaysStr(e.target.value)} />
              <span className={styles.unit}>일</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>월 고정비</span>
              <span className={styles.cardLabelHint}>임대료·인건비·공과금</span>
            </div>
            <span className={styles.subLabel}>임대료 (월)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(rentStr))} onChange={e => setRentStr(parseComma(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>
            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>인건비 (월, 사장 인건비 포함 시)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(laborStr))} onChange={e => setLaborStr(parseComma(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>
            <div style={{ height: 8 }} />
            <span className={styles.subLabel}>공과금·기타 (월)</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(utilityStr))} onChange={e => setUtilityStr(parseComma(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>
            <div style={{ height: 8 }} />
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>월 고정비 합계 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmtKRW(fixedCosts)}</strong></p>
          </div>

          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>월 매출총이익</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueAccent}`} style={{ fontSize: 18 }}>{fmtKRW(monthlyMenuStats.grossProfit)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>월 영업이익</div>
              <div className={`${styles.kpiValue} ${monthlyMenuStats.operatingProfit >= 0 ? styles.kpiValuePos : styles.kpiValueNeg}`} style={{ fontSize: 18 }}>{fmtKRW(monthlyMenuStats.operatingProfit)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>일 평균 주문</div>
              <div className={styles.kpiValue}>{monthlyMenuStats.dailyOrders}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>개</span></div>
            </div>
          </div>

          <div className={styles.breakEvenCard}>
            <p className={styles.breakEvenLead}>📊 손익분기 판매량</p>
            {monthlyMenuStats.avgMarginPerItem > 0 ? (
              <>
                <p className={styles.breakEvenValue}>월 {monthlyMenuStats.breakEvenItems.toLocaleString('ko-KR')}개</p>
                <p className={styles.breakEvenSub}>
                  영업일 <strong>{businessDays}일</strong> 기준 → 일 평균 <strong>{monthlyMenuStats.breakEvenDaily}개</strong> 이상 판매 필요.<br />
                  현재 일 평균 주문 <strong>{monthlyMenuStats.dailyOrders}개</strong> →{' '}
                  {monthlyMenuStats.dailyOrders >= monthlyMenuStats.breakEvenDaily
                    ? <span style={{ color: '#3EFF9B' }}>✅ 손익분기 통과</span>
                    : <span style={{ color: '#FF6B6B' }}>❌ 손익분기까지 일 {monthlyMenuStats.breakEvenDaily - monthlyMenuStats.dailyOrders}개 부족</span>}
                </p>
              </>
            ) : (
              <p className={styles.breakEvenSub}>메뉴 마진과 일 판매량을 입력해주세요.</p>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>목표 영업이익 시나리오</span>
            </div>
            <span className={styles.subLabel}>월 목표 영업이익</span>
            <div className={styles.inputRow}>
              <input className={styles.smallInput} type="text" inputMode="numeric" value={fmt(parseComma(targetProfitStr))} onChange={e => setTargetProfitStr(parseComma(e.target.value).toString())} />
              <span className={styles.unit}>원</span>
            </div>
            <div style={{ height: 12 }} />
            {monthlyMenuStats.avgMarginPerItem > 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                {monthlyMenuStats.targetExtraItems === 0
                  ? <>✅ 이미 목표 영업이익 <strong style={{ color: 'var(--accent)' }}>{fmtKRW(parseComma(targetProfitStr))}</strong>를 달성하고 있습니다.</>
                  : <>월 목표 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmtKRW(parseComma(targetProfitStr))}</strong> 달성을 위해 추가로 월 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{monthlyMenuStats.targetExtraItems}개</strong> (일 <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{monthlyMenuStats.targetExtraDaily}개</strong>) 더 판매가 필요합니다.</>}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>메뉴 데이터를 먼저 입력해주세요.</p>
            )}
          </div>
        </>
      )}

      {/* 결과 복사 */}
      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}
