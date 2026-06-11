'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react'
import styles from './dutch.module.css'
import {
  ROUNDING_OPTIONS,
  RoundingId,
  REMAINDER_OPTIONS, RemainderId,
  calcSimpleSplit, calcDrinkSplit, calcPerPersonSplit,
  calcPrepaidSplit, generateShareMessage,
  PerPersonParticipant, PrepaidParticipant, PersonItem,
  parseAmount, fmtAmount, newId,
  loadHistory, saveHistory, SavedSplit,
} from './dutchUtils'

/* 인원 조절 — +/− 버튼 + 직접 입력 */
function Stepper({ value, onChange, min = 1, max = 50, color, ariaLabel = '값' }: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  color?: string
  ariaLabel?: string
}) {
  return (
    <div className={styles.stepper}>
      <button type="button" className={styles.stepperBtn} aria-label={`${ariaLabel} 1 줄이기`}
        onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>−</button>
      <input className={styles.stepperInput} type="text" inputMode="numeric"
        aria-label={ariaLabel}
        style={color ? { color } : undefined}
        value={value}
        onChange={e => {
          const v = parseInt(e.target.value.replace(/[^\d]/g, ''), 10)
          onChange(Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : min)
        }} />
      <button type="button" className={styles.stepperBtn} aria-label={`${ariaLabel} 1 늘리기`}
        onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
    </div>
  )
}

/* 1원 단위 처리 드롭다운 */
function RoundingSelect({ value, onChange }: { value: RoundingId; onChange: (v: RoundingId) => void }) {
  return (
    <select className={styles.select} value={value} aria-label="1원 단위 처리 방식"
      onChange={e => onChange(e.target.value as RoundingId)}>
      {ROUNDING_OPTIONS.map(o => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
  )
}

/* 잔여 금액(잔돈·부족분) 처리 드롭다운 */
function RemainderSelect({ value, onChange }: { value: RemainderId; onChange: (v: RemainderId) => void }) {
  return (
    <select className={styles.select} value={value} aria-label="잔여 금액(잔돈·부족분) 처리 방식"
      onChange={e => onChange(e.target.value as RemainderId)}>
      {REMAINDER_OPTIONS.map(o => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
  )
}

type Tab = 'simple' | 'drink' | 'person' | 'prepaid' | 'share'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'simple',  name: '간단 N빵',     icon: '🍻' },
  { id: 'drink',   name: '술값 분리',    icon: '🍺' },
  { id: 'person',  name: '개인별 정산',  icon: '🍱' },
  { id: 'prepaid', name: '선결제자 정산', icon: '💸' },
  { id: 'share',   name: '카톡 공유',    icon: '💬' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  simple:  styles.tabActive,
  drink:   styles.tabActiveDrink,
  person:  styles.tabActivePerson,
  prepaid: styles.tabActivePrepaid,
  share:   styles.tabActiveShare,
}

const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR')

export default function DutchClient() {
  const [tab, setTab] = useState<Tab>('simple')

  /* ─────── 1. 간단 N빵 ─────── */
  const [sTotal,     setSTotal]     = useState('')
  const [sPeople,    setSPeople]    = useState(4)
  const [sRounding,  setSRounding]  = useState<RoundingId>('exact')
  const [sRemainder, setSRemainder] = useState<RemainderId>('common-fund')

  const simpleResult = useMemo(() => {
    const total = parseAmount(sTotal)
    if (total <= 0 || sPeople <= 0) return null
    return calcSimpleSplit({ totalAmount: total, peopleCount: sPeople, rounding: sRounding, remainder: sRemainder })
  }, [sTotal, sPeople, sRounding, sRemainder])

  // 선택한 잔여 처리 방식에 따른 안내 문구 (히어로·상세에 표시)
  const simpleRemainderNote = useMemo(() => {
    if (!simpleResult) return ''
    const { remainder: diff, perPerson: per, individualAmounts: amts } = simpleResult
    const mn = amts.length ? Math.min(...amts) : 0
    const mx = amts.length ? Math.max(...amts) : 0
    switch (sRemainder) {
      case 'common-fund':
        return diff > 0 ? `잔돈 +${fmt(diff)}원 → 공금으로` : diff < 0 ? `${fmt(-diff)}원 부족 → 결제자 부담` : '딱 맞게 떨어짐'
      case 'to-payer':
        return diff > 0 ? `잔돈 +${fmt(diff)}원 → 결제자가 받음` : diff < 0 ? `결제자가 ${fmt(-diff)}원 더 부담` : '딱 맞게 떨어짐'
      case 'first-person':
        return diff !== 0 ? `첫 번째 사람만 ${fmt(amts[0])}원, 나머지 ${fmt(per)}원` : '딱 맞게 떨어짐'
      case 'random': {
        const di = amts.findIndex(a => a !== per)
        return di >= 0 ? `무작위 1명만 ${fmt(amts[di])}원, 나머지 ${fmt(per)}원` : '딱 맞게 떨어짐'
      }
      case 'split-1won': {
        const plus = amts.filter(a => a === mx).length
        return mn === mx ? '1원 단위로 딱 맞음' : `${fmt(mx)}원 ${plus}명 · ${fmt(mn)}원 ${amts.length - plus}명`
      }
      default: return ''
    }
  }, [simpleResult, sRemainder])

  /* ─────── 2. 술값 분리 ─────── */
  const [dTotal,    setDTotal]    = useState('')
  const [dDrink,    setDDrink]    = useState('')
  const [dPeople,   setDPeople]   = useState(4)
  const [dDrinkers, setDDrinkers] = useState(2)
  const [dRounding, setDRounding] = useState<RoundingId>('exact')

  const drinkResult = useMemo(() => {
    const total = parseAmount(dTotal)
    const drink = parseAmount(dDrink)
    if (total <= 0 || dPeople <= 0) return null
    return calcDrinkSplit({
      totalAmount: total, drinkAmount: drink,
      totalPeople: dPeople, drinkers: Math.min(dDrinkers, dPeople),
      rounding: dRounding,
    })
  }, [dTotal, dDrink, dPeople, dDrinkers, dRounding])

  /* ─────── 3. 개인별 정산 ─────── */
  const [participants, setParticipants] = useState<PerPersonParticipant[]>([
    { id: newId(), name: '나',  items: [{ id: newId(), name: '본인 메뉴', price: 0 }], sharedShare: 1, drinker: true },
    { id: newId(), name: '친구1', items: [{ id: newId(), name: '본인 메뉴', price: 0 }], sharedShare: 1, drinker: true },
  ])
  const [sharedItems, setSharedItems] = useState<PersonItem[]>([])
  const [sharedDrinks, setSharedDrinks] = useState('')
  const [pRounding, setPRounding] = useState<RoundingId>('exact')

  const personResult = useMemo(
    () => calcPerPersonSplit({
      participants, sharedItems,
      sharedDrinks: parseAmount(sharedDrinks),
      rounding: pRounding,
    }),
    [participants, sharedItems, sharedDrinks, pRounding],
  )

  const addParticipant = () => {
    if (participants.length >= 20) return
    setParticipants([...participants, {
      id: newId(),
      name: `참가자${participants.length + 1}`,
      items: [{ id: newId(), name: '본인 메뉴', price: 0 }],
      sharedShare: 1, drinker: false,
    }])
  }
  const removeParticipant = (id: string) => {
    if (participants.length <= 1) return
    setParticipants(participants.filter(p => p.id !== id))
  }
  const updateParticipant = (id: string, patch: Partial<PerPersonParticipant>) => {
    setParticipants(participants.map(p => p.id === id ? { ...p, ...patch } : p))
  }
  const addItem = (pid: string) => {
    updateParticipant(pid, {
      items: [
        ...(participants.find(p => p.id === pid)?.items ?? []),
        { id: newId(), name: '메뉴', price: 0 },
      ],
    })
  }
  const removeItem = (pid: string, iid: string) => {
    const p = participants.find(p => p.id === pid)
    if (!p) return
    updateParticipant(pid, { items: p.items.filter(i => i.id !== iid) })
  }
  const updateItem = (pid: string, iid: string, patch: Partial<PersonItem>) => {
    const p = participants.find(p => p.id === pid)
    if (!p) return
    updateParticipant(pid, {
      items: p.items.map(i => i.id === iid ? { ...i, ...patch } : i),
    })
  }

  const addSharedItem = () => setSharedItems([...sharedItems, { id: newId(), name: `공동 메뉴`, price: 0 }])
  const removeSharedItem = (id: string) => setSharedItems(sharedItems.filter(i => i.id !== id))
  const updateSharedItem = (id: string, patch: Partial<PersonItem>) =>
    setSharedItems(sharedItems.map(i => i.id === id ? { ...i, ...patch } : i))

  /* ─────── 4. 선결제자 정산 ─────── */
  const [prepaidPpl, setPrepaidPpl] = useState<PrepaidParticipant[]>([
    { id: newId(), name: '나',    paid: 0, share: 0 },
    { id: newId(), name: '친구1', paid: 0, share: 0 },
    { id: newId(), name: '친구2', paid: 0, share: 0 },
  ])
  const [autoEqualShare, setAutoEqualShare] = useState(true)

  // 자동 균등 분배 처리
  const adjPrepaidPpl = useMemo(() => {
    const settled = prepaidPpl.filter(p => !p.isContributor)
    if (!autoEqualShare || settled.length === 0) return prepaidPpl
    const totalPaid = prepaidPpl.reduce((s, p) => s + p.paid, 0)
    const contribPaid = prepaidPpl.filter(p => p.isContributor).reduce((s, p) => s + p.paid, 0)
    // 찬조자는 결제액을 "선물"로 처리 — 자기 부담 = 자기 결제액(잔액 0, 환급받지 않음).
    // 찬조 금액만큼 나머지 사람이 나눠 낼 풀(toSplit)이 줄어든다.
    const toSplit = Math.max(0, totalPaid - contribPaid)
    const each = toSplit / settled.length
    return prepaidPpl.map(p =>
      p.isContributor ? { ...p, share: p.paid } : { ...p, share: each },
    )
  }, [prepaidPpl, autoEqualShare])

  const prepaidResult = useMemo(
    () => calcPrepaidSplit(adjPrepaidPpl),
    [adjPrepaidPpl],
  )

  const addPrepaid = () => {
    if (prepaidPpl.length >= 20) return
    setPrepaidPpl([...prepaidPpl, {
      id: newId(), name: `참가자${prepaidPpl.length + 1}`, paid: 0, share: 0,
    }])
  }
  const removePrepaid = (id: string) => {
    if (prepaidPpl.length <= 2) return
    setPrepaidPpl(prepaidPpl.filter(p => p.id !== id))
  }
  const updatePrepaid = (id: string, patch: Partial<PrepaidParticipant>) => {
    setPrepaidPpl(prepaidPpl.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  /* ─────── 5. 카톡 공유 ─────── */
  const [shareSrc, setShareSrc] = useState<Tab>('simple')
  const [shareTitle, setShareTitle] = useState('회식 정산')
  const [payerName, setPayerName] = useState('')
  const [payerAccount, setPayerAccount] = useState('')

  const shareMessage = useMemo(() => {
    if (shareSrc === 'simple' && simpleResult) {
      return generateShareMessage({
        kind: 'simple',
        title: shareTitle,
        total: parseAmount(sTotal),
        people: sPeople,
        perPerson: simpleResult.perPerson,
        remainder: simpleResult.remainder,
        payerName, payerAccount,
      })
    }
    if (shareSrc === 'drink' && drinkResult) {
      return generateShareMessage({
        kind: 'drink',
        title: shareTitle,
        total: parseAmount(dTotal),
        nonDrinkers: drinkResult.nonDrinkers,
        drinkers: dDrinkers,
        nonDrinkerAmount: drinkResult.nonDrinkerAmount,
        drinkerAmount: drinkResult.drinkerAmount,
        payerName, payerAccount,
      })
    }
    if (shareSrc === 'person' && personResult.rows.length > 0) {
      return generateShareMessage({
        kind: 'per-person',
        title: shareTitle,
        rows: personResult.rows.map(r => ({ name: r.name, total: r.total })),
        payerName, payerAccount,
      })
    }
    if (shareSrc === 'prepaid' && prepaidResult.transfers.length > 0 && prepaidResult.isBalanced) {
      return generateShareMessage({
        kind: 'prepaid',
        title: shareTitle,
        transfers: prepaidResult.transfers,
        payerName, payerAccount,
      })
    }
    return ''
  }, [shareSrc, shareTitle, payerName, payerAccount,
      simpleResult, drinkResult, personResult, prepaidResult,
      sTotal, sPeople, dTotal, dDrinkers])

  /* ─────── 복사 / 카톡 / 저장 ─────── */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* */ }
  }

  /* ─────── 히스토리 ─────── */
  const [history, setHistory] = useState<SavedSplit[]>([])
  useEffect(() => { setHistory(loadHistory()) }, [])

  const saveCurrent = () => {
    // 공유 탭에서는 "공유 대상(shareSrc)"을 저장 — tab 으로 분기하면 항상 마지막 else(선결제자)로 잘못 기록됨
    const src: Tab = tab === 'share' ? shareSrc : tab
    const item: SavedSplit = (() => {
      if (src === 'simple' && simpleResult) {
        return {
          id: newId(),
          title: '간단 N빵',
          total: parseAmount(sTotal),
          people: sPeople,
          perPerson: simpleResult.perPerson,
          type: 'simple',
          createdAt: new Date().toISOString(),
        }
      }
      if (src === 'drink' && drinkResult) {
        return {
          id: newId(), title: '술값 분리',
          total: parseAmount(dTotal), people: dPeople,
          perPerson: drinkResult.drinkerAmount,
          type: 'drink', createdAt: new Date().toISOString(),
        }
      }
      if (src === 'person') {
        return {
          id: newId(), title: '개인별 정산',
          total: personResult.grandTotal, people: participants.length,
          perPerson: personResult.grandTotal / Math.max(1, participants.length),
          type: 'per-person', createdAt: new Date().toISOString(),
        }
      }
      return {
        id: newId(), title: '선결제자 정산',
        total: prepaidResult.totalPaid, people: prepaidPpl.length,
        perPerson: prepaidResult.totalShare / Math.max(1, prepaidPpl.length),
        type: 'prepaid', createdAt: new Date().toISOString(),
      }
    })()
    const next = [item, ...history].slice(0, 30)
    setHistory(next); saveHistory(next)
  }
  const removeHistory = (id: string) => {
    const next = history.filter(h => h.id !== id)
    setHistory(next); saveHistory(next)
  }
  const clearHistory = () => { setHistory([]); saveHistory([]) }

  /* ─────────────────── 렌더 ─────────────────── */
  return (
    <div className={styles.wrap}>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist" aria-label="정산 방식 선택">
        {TABS.map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }} aria-hidden="true">{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* ───────── 1. 간단 N빵 ───────── */}
      {tab === 'simple' && (
        <>
          <div className={styles.card}>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.subLabel}>총 금액</label>
                <div className={styles.inputRow}>
                  <input className={styles.amountInput} type="text" inputMode="numeric"
                    aria-label="총 금액 (원)"
                    placeholder="150,000"
                    value={sTotal}
                    onChange={e => setSTotal(fmtAmount(parseAmount(e.target.value)))} />
                  <span className={styles.unit}>원</span>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.subLabel}>인원 수</label>
                <Stepper value={sPeople} onChange={setSPeople} min={1} max={50} ariaLabel="인원 수" />
              </div>
            </div>
            <div className={styles.roundRow}>
              <label className={styles.subLabel} style={{ marginBottom: 0 }}>1원 단위 처리</label>
              <RoundingSelect value={sRounding} onChange={setSRounding} />
            </div>
            <div className={styles.roundRow} style={{ marginTop: 8 }}>
              <label className={styles.subLabel} style={{ marginBottom: 0 }}>잔돈·부족분 처리</label>
              <RemainderSelect value={sRemainder} onChange={setSRemainder} />
            </div>
          </div>

          {simpleResult ? (
            <>
              <div className={styles.hero} aria-live="polite">
                <div className={styles.heroLabel}>1인당</div>
                <div className={styles.heroNum}>
                  {sRemainder === 'split-1won'
                    && Math.min(...simpleResult.individualAmounts) !== Math.max(...simpleResult.individualAmounts)
                    ? `${fmt(Math.min(...simpleResult.individualAmounts))}~${fmt(Math.max(...simpleResult.individualAmounts))}`
                    : fmt(simpleResult.perPerson)}<span className={styles.heroNumUnit}>원</span>
                </div>
                <div className={styles.heroSub}>
                  총 {fmt(simpleResult.totalCollected)}원 걷힘 · {simpleRemainderNote}
                </div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>상세</label>
                <div className={styles.detailTable}>
                  <div className={styles.detailRow}><span>총 금액</span><span>{fmt(parseAmount(sTotal))}원</span></div>
                  <div className={styles.detailRow}><span>인원</span><span>{sPeople}명</span></div>
                  <div className={styles.detailRow}><span>정확한 1인당</span><span>{simpleResult.exactPerPerson.toFixed(2)}원</span></div>
                  <div className={`${styles.detailRow} ${styles.detailRowAccent}`}><span>1인당 (절삭 후)</span><span>{fmt(simpleResult.perPerson)}원</span></div>
                  <div className={styles.detailRow}><span>잔여 처리</span><span style={{ fontFamily: "'Noto Sans KR', sans-serif", color: 'var(--text)' }}>{REMAINDER_OPTIONS.find(o => o.id === sRemainder)?.name}</span></div>
                </div>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`총 ${fmt(parseAmount(sTotal))}원 / ${sPeople}명 → 1인당 ${fmt(simpleResult.perPerson)}원`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => { setShareSrc('simple'); setTab('share') }}>
                  💬 카톡 공유
                </button>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>총 금액과 인원을 입력하세요</div>
              1인당 금액이 바로 계산됩니다
            </div>
          )}
        </>
      )}

      {/* ───────── 2. 술값 분리 ───────── */}
      {tab === 'drink' && (
        <>
          {/* 4 입력 2×2 그리드 (모바일도 동일) */}
          <div className={styles.drinkGrid}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>총 금액 <span className={styles.cardLabelHint}>음식+술</span></label>
              <div className={styles.inputRow}>
                <input className={styles.amountInput} type="text" inputMode="numeric"
                  aria-label="총 금액 (음식+술, 원)"
                  placeholder="200,000"
                  value={dTotal}
                  onChange={e => setDTotal(fmtAmount(parseAmount(e.target.value)))} />
                <span className={styles.unit}>원</span>
              </div>
            </div>

            <div className={styles.card}>
              <label className={styles.cardLabel}>술값만 <span className={styles.cardLabelHint}>주류 비용</span></label>
              <div className={styles.inputRow}>
                <input className={styles.amountInput} type="text" inputMode="numeric"
                  aria-label="술값 (주류 비용, 원)"
                  placeholder="80,000"
                  value={dDrink}
                  onChange={e => setDDrink(fmtAmount(parseAmount(e.target.value)))} />
                <span className={styles.unit}>원</span>
              </div>
            </div>

            <div className={styles.card}>
              <label className={styles.cardLabel}>전체 인원</label>
              <Stepper value={dPeople} onChange={v => { setDPeople(v); if (dDrinkers > v) setDDrinkers(v) }} min={1} max={50} ariaLabel="전체 인원" />
            </div>

            <div className={styles.card}>
              <label className={styles.cardLabel}>음주자</label>
              <Stepper value={dDrinkers} onChange={setDDrinkers} min={0} max={dPeople} color="#EA580C" ariaLabel="음주자 수" />
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.roundRow}>
              <label className={styles.subLabel} style={{ marginBottom: 0 }}>1원 단위 처리</label>
              <RoundingSelect value={dRounding} onChange={setDRounding} />
            </div>
          </div>

          {drinkResult ? (
            <>
              <div className={styles.hero} aria-live="polite">
                <div className={styles.heroLabel}>1인당 (음주 여부별)</div>
                <div className={styles.heroDual}>
                  <div className={styles.heroDualBox}>
                    <div className={styles.heroDualLabel}>🚫 비음주 ({drinkResult.nonDrinkers}명)</div>
                    <div className={`${styles.heroDualValue} ${styles.heroDualValueNon}`}>
                      {fmt(drinkResult.nonDrinkerAmount)}원
                    </div>
                  </div>
                  <div className={styles.heroDualBox}>
                    <div className={styles.heroDualLabel}>🍺 음주 ({dDrinkers}명)</div>
                    <div className={`${styles.heroDualValue} ${styles.heroDualValueDrink}`}>
                      {fmt(drinkResult.drinkerAmount)}원
                    </div>
                  </div>
                </div>
                <div className={styles.heroSub}>
                  음주자가 1인당 <strong style={{ color: '#EA580C' }}>{fmt(drinkResult.drinkerAmount - drinkResult.nonDrinkerAmount)}원</strong> 더 부담
                </div>
              </div>

              {parseAmount(dDrink) > parseAmount(dTotal) && (
                <div className={styles.warnBox}>
                  ⚠️ <strong>술값이 총액보다 큽니다</strong> — 총액 {fmt(parseAmount(dTotal))}원보다 술값 {fmt(parseAmount(dDrink))}원이 많습니다.
                  음식값이 0원으로 계산되니 입력을 확인하세요.
                </div>
              )}
              {dDrinkers === 0 && parseAmount(dDrink) > 0 && (
                <div className={styles.warnBox}>
                  ⚠️ <strong>음주자가 0명</strong>이라 술값 {fmt(parseAmount(dDrink))}원이 정산에 포함되지 않았습니다.
                  음주자 수를 입력하거나, 술값까지 전원이 나누려면 술값을 0원으로 두고 [간단 N빵]을 사용하세요.
                </div>
              )}

              <div className={styles.card}>
                <label className={styles.cardLabel}>상세</label>
                <div className={styles.detailTable}>
                  <div className={styles.detailRow}><span>음식값</span><span>{fmt(drinkResult.foodAmount)}원</span></div>
                  <div className={styles.detailRow}><span>음식값 1인 ({dPeople}명 분담)</span><span>{drinkResult.foodPerPerson.toFixed(0)}원</span></div>
                  <div className={styles.detailRow}><span>술값</span><span>{fmt(parseAmount(dDrink))}원</span></div>
                  <div className={styles.detailRow}><span>술값 1인 ({dDrinkers}명 분담)</span><span>{drinkResult.drinkPerDrinker.toFixed(0)}원</span></div>
                  <div className={`${styles.detailRow} ${styles.detailRowAccent}`}><span>총 걷힘</span><span>{fmt(drinkResult.totalCollected)}원</span></div>
                  {Math.round(drinkResult.remainder) !== 0 && (
                    <div className={styles.detailRow}>
                      <span>입력 총액 대비</span>
                      <span style={{ color: drinkResult.remainder > 0 ? '#EA580C' : '#DC2626' }}>
                        {drinkResult.remainder > 0 ? '+' : '−'}{fmt(Math.abs(drinkResult.remainder))}원
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`비음주 ${fmt(drinkResult.nonDrinkerAmount)}원 / 음주 ${fmt(drinkResult.drinkerAmount)}원`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => { setShareSrc('drink'); setTab('share') }}>
                  💬 카톡 공유
                </button>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>총 금액과 인원을 입력하세요</div>
              술값 0원이면 단순 N빵으로 계산됩니다
            </div>
          )}
        </>
      )}

      {/* ───────── 3. 개인별 정산 ───────── */}
      {tab === 'person' && (
        <>
          <div className={styles.disclaimer}>
            <strong>개인별 정산</strong> — 각자 본인 메뉴를 직접 부담, 공동 메뉴는 전원이 균등 분담.
            공동 술값은 음주자만 균등 분배합니다.
          </div>

          {/* 공동 메뉴 — 위로 올림 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>공동 메뉴 (전원 분담)</label>
            {sharedItems.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>없음. 필요시 추가하세요.</div>
            )}
            {sharedItems.map(it => (
              <div key={it.id} className={styles.itemRow}>
                <input className={styles.textInput} value={it.name} aria-label="공동 메뉴 이름"
                  onChange={e => updateSharedItem(it.id, { name: e.target.value })} />
                <input className={styles.itemPrice} type="text" inputMode="numeric"
                  aria-label="공동 메뉴 가격 (원)"
                  placeholder="0"
                  value={it.price ? fmtAmount(it.price) : ''}
                  onChange={e => updateSharedItem(it.id, { price: parseAmount(e.target.value) })} />
                <button type="button" className={styles.itemDelete} aria-label="공동 메뉴 삭제" onClick={() => removeSharedItem(it.id)}>×</button>
              </div>
            ))}
            <button className={styles.addItemBtn} onClick={addSharedItem}>+ 공동 메뉴 추가</button>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>공동 술값 <span className={styles.cardLabelHint}>음주자만 균등 분배</span></label>
            <div className={styles.inputRow}>
              <input className={styles.amountInput} type="text" inputMode="numeric"
                aria-label="공동 술값 (원)"
                placeholder="0"
                value={sharedDrinks}
                onChange={e => setSharedDrinks(fmtAmount(parseAmount(e.target.value)))} />
              <span className={styles.unit}>원</span>
            </div>
          </div>

          {/* 참가자 — 본인 메뉴만, 분담 chip 제거 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>참가자 ({participants.length}/20)</label>
            {participants.map(p => (
              <div key={p.id} className={styles.personCard}>
                <div className={styles.personHeader}>
                  <input className={styles.personName} value={p.name} aria-label="참가자 이름"
                    onChange={e => updateParticipant(p.id, { name: e.target.value })} />
                  <label className={styles.toggleLabel}>
                    <input type="checkbox" checked={p.drinker} aria-label={`${p.name || '참가자'} 음주자 여부`}
                      onChange={e => updateParticipant(p.id, { drinker: e.target.checked })} />
                    <span aria-hidden="true">🍺</span>
                  </label>
                  <button type="button" className={`${styles.miniBtn} ${styles.miniDanger}`} aria-label="참가자 삭제"
                    onClick={() => removeParticipant(p.id)} disabled={participants.length <= 1}>×</button>
                </div>

                {p.items.map(it => (
                  <div key={it.id} className={styles.itemRow}>
                    <input className={styles.textInput} value={it.name} aria-label="메뉴 이름"
                      onChange={e => updateItem(p.id, it.id, { name: e.target.value })} placeholder="메뉴" />
                    <input className={styles.itemPrice} type="text" inputMode="numeric"
                      aria-label="메뉴 가격 (원)"
                      placeholder="0"
                      value={it.price ? fmtAmount(it.price) : ''}
                      onChange={e => updateItem(p.id, it.id, { price: parseAmount(e.target.value) })} />
                    <button type="button" className={styles.itemDelete} aria-label="메뉴 삭제"
                      onClick={() => removeItem(p.id, it.id)}>×</button>
                  </div>
                ))}
                <button className={styles.addItemBtn} onClick={() => addItem(p.id)}>+ 메뉴 추가</button>
              </div>
            ))}
            <button className={styles.actionBtn} onClick={addParticipant} disabled={participants.length >= 20}>
              + 참가자 추가
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.roundRow}>
              <label className={styles.subLabel} style={{ marginBottom: 0 }}>1원 단위 처리</label>
              <RoundingSelect value={pRounding} onChange={setPRounding} />
            </div>
          </div>

          {personResult.rows.some(r => r.total > 0) ? (
            <>
              <div className={styles.hero} aria-live="polite">
                <div className={styles.heroLabel}>전체 정산 금액</div>
                <div className={styles.heroNum}>
                  {fmt(personResult.grandTotal)}<span className={styles.heroNumUnit}>원</span>
                </div>
                <div className={styles.heroSub}>
                  {participants.length}명 · 개인별 차등
                  {Math.round(personResult.grandTotal - personResult.grandTotalRaw) !== 0 && (
                    <> · 반올림 {personResult.grandTotal - personResult.grandTotalRaw > 0 ? '+' : '−'}{fmt(Math.abs(personResult.grandTotal - personResult.grandTotalRaw))}원</>
                  )}
                </div>
              </div>

              {parseAmount(sharedDrinks) > 0 && participants.every(p => !p.drinker) && (
                <div className={styles.warnBox}>
                  ⚠️ <strong>음주자가 없습니다</strong> — 공동 술값 {fmt(parseAmount(sharedDrinks))}원은 음주자(🍺)에게만 분배되는데
                  마신 사람으로 표시된 참가자가 없어 정산에서 빠졌습니다. 마신 사람을 🍺로 체크하세요.
                </div>
              )}

              <div className={styles.card}>
                <label className={styles.cardLabel}>개인별 결과</label>
                <div className={styles.resultTableScroll}>
                <div className={styles.resultTable}>
                  <div className={`${styles.resultTableRow} ${styles.headerRow}`}>
                    <span>이름</span>
                    <span style={{ textAlign: 'right' }}>본인</span>
                    <span style={{ textAlign: 'right' }}>공동</span>
                    <span style={{ textAlign: 'right' }}>술</span>
                    <span style={{ textAlign: 'right' }}>합계</span>
                  </div>
                  {personResult.rows.map((r, i) => (
                    <div key={i} className={styles.resultTableRow}>
                      <span className={styles.rtName}>
                        {r.name}{r.drinker && <small aria-hidden="true">🍺</small>}
                      </span>
                      <span className={styles.rtVal}>{fmt(r.ownAmount)}</span>
                      <span className={styles.rtVal}>{fmt(r.sharedShare)}</span>
                      <span className={styles.rtVal}>{fmt(r.drinkShare)}</span>
                      <span className={styles.rtTotal}>{fmt(r.total)}</span>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(personResult.rows.map(r => `${r.name}: ${fmt(r.total)}원`).join('\n'))}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => { setShareSrc('person'); setTab('share') }}>
                  💬 카톡 공유
                </button>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>각자 메뉴 가격을 입력하세요</div>
              본인 메뉴 + 공동 메뉴 + 공동 술값을 입력하면 자동 계산됩니다
            </div>
          )}
        </>
      )}

      {/* ───────── 4. 선결제자 정산 ───────── */}
      {tab === 'prepaid' && (
        <>
          <div className={styles.disclaimer}>
            <strong>선결제자 정산</strong> — 각자 결제한 금액과 부담할 금액을 입력하면
            <strong> 최소 송금 횟수</strong>로 정산할 방법을 알려드립니다.
            찬조자(부담 0원)도 추가할 수 있습니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              참가자 ({prepaidPpl.length}/20)
              <span className={styles.cardLabelHint}>이름 / 결제액 / 부담액</span>
            </label>

            <label className={styles.toggleLabel} style={{ marginBottom: 10 }}>
              <input type="checkbox" checked={autoEqualShare}
                onChange={e => setAutoEqualShare(e.target.checked)} />
              부담액 자동 균등 분배 (찬조자 제외)
            </label>

            {prepaidPpl.map(p => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <div className={styles.prepaidRow}>
                  <input className={styles.personName} value={p.name} aria-label="참가자 이름"
                    onChange={e => updatePrepaid(p.id, { name: e.target.value })} placeholder="이름" />
                  <input className={styles.itemPrice} type="text" inputMode="numeric"
                    aria-label="결제한 금액 (원)"
                    placeholder="결제액"
                    value={p.paid ? fmtAmount(p.paid) : ''}
                    onChange={e => updatePrepaid(p.id, { paid: parseAmount(e.target.value) })} />
                  <input className={styles.itemPrice} type="text" inputMode="numeric"
                    aria-label="부담할 금액 (원)"
                    placeholder="부담액"
                    disabled={autoEqualShare && !p.isContributor}
                    value={
                      autoEqualShare && !p.isContributor
                        ? fmtAmount(adjPrepaidPpl.find(x => x.id === p.id)?.share ?? 0)
                        : (p.share ? fmtAmount(p.share) : '')
                    }
                    onChange={e => updatePrepaid(p.id, { share: parseAmount(e.target.value) })} />
                  <button type="button" className={styles.itemDelete} aria-label="참가자 삭제"
                    onClick={() => removePrepaid(p.id)}
                    disabled={prepaidPpl.length <= 2}>×</button>
                </div>
                <label className={styles.toggleLabel} style={{ fontSize: 11.5, marginTop: 3, marginLeft: 4 }}>
                  <input type="checkbox" checked={!!p.isContributor}
                    onChange={e => updatePrepaid(p.id, { isContributor: e.target.checked })} />
                  💝 찬조자 (부담 0원)
                </label>
              </div>
            ))}
            <button className={styles.actionBtn} onClick={addPrepaid} disabled={prepaidPpl.length >= 20}>
              + 참가자 추가
            </button>
          </div>

          {prepaidResult.totalPaid > 0 ? (
            <>
              <div className={styles.hero} aria-live="polite">
                <div className={styles.heroLabel}>{prepaidResult.minimal ? '최소 송금 횟수' : '필요 송금 횟수 (근사)'}</div>
                <div className={styles.heroNum} style={{ color: '#A16207' }}>
                  {prepaidResult.transferCount}<span className={styles.heroNumUnit}>건</span>
                </div>
                <div className={styles.heroSub}>
                  총 결제 {fmt(prepaidResult.totalPaid)}원 · 총 부담 {fmt(prepaidResult.totalShare)}원
                  {!prepaidResult.minimal && prepaidResult.isBalanced && <> · 참가자가 많아 최소에 가까운 근사값</>}
                </div>
              </div>

              {!prepaidResult.isBalanced && (
                <div className={styles.warnBox}>
                  ⚠️ <strong>결제 합계 ≠ 부담 합계</strong> — 차액 {fmt(Math.abs(prepaidResult.diff))}원.
                  부담액을 다시 확인하거나 자동 균등 분배를 켜보세요.
                </div>
              )}

              <div className={styles.card}>
                <label className={styles.cardLabel}>잔액 (받을 / 낼 금액)</label>
                <div className={styles.balanceTable}>
                  {prepaidResult.balances.map((b, i) => {
                    const credit = b.balance > 0.5
                    const debit = b.balance < -0.5
                    return (
                      <div key={i} className={`${styles.balanceCard} ${credit ? styles.balanceCardCredit : debit ? styles.balanceCardDebit : ''}`}>
                        <div className={styles.balanceName}>{b.name}</div>
                        <div className={`${styles.balanceVal} ${credit ? styles.balanceCredit : debit ? styles.balanceDebit : styles.balanceZero}`}>
                          {credit ? '+' : ''}{fmt(b.balance)}원
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {prepaidResult.transfers.length > 0 && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>송금 안내 (Greedy 최소화)</label>
                  <div className={styles.transferList}>
                    {prepaidResult.transfers.map((t, i) => (
                      <div key={i} className={styles.transferRow}>
                        <span className={styles.transferFrom}>{t.from}</span>
                        <span className={styles.transferArrow}>→</span>
                        <span className={styles.transferTo}>{t.to}</span>
                        <span className={styles.transferAmount}>{fmt(t.amount)}원</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  disabled={!prepaidResult.isBalanced}
                  onClick={() => copy(prepaidResult.transfers.map(t => `${t.from} → ${t.to}: ${fmt(t.amount)}원`).join('\n'))}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} disabled={!prepaidResult.isBalanced}
                  onClick={() => { setShareSrc('prepaid'); setTab('share') }}>
                  💬 카톡 공유
                </button>
                <button className={styles.copyBtn} disabled={!prepaidResult.isBalanced} onClick={saveCurrent}>💾 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>참가자별 결제액·부담액을 입력하세요</div>
              결제 합계와 부담 합계가 일치해야 정산이 완료됩니다
            </div>
          )}
        </>
      )}

      {/* ───────── 5. 카카오톡 공유 ───────── */}
      {tab === 'share' && (
        <>
          <div className={styles.disclaimer}>
            <strong>💬 카카오톡 공유</strong> — 어느 탭의 결과를 공유할지 선택하면
            카카오톡 형식의 메시지가 자동 생성됩니다. 복사해서 채팅방에 붙여넣으세요.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>공유할 정산 결과</label>
            <div className={styles.shareSourceTabs} role="group" aria-label="공유할 정산 결과 선택">
              {(['simple', 'drink', 'person', 'prepaid'] as Tab[]).map(s => {
                const t = TABS.find(x => x.id === s)!
                return (
                  <button key={s} type="button" aria-pressed={shareSrc === s}
                    className={`${styles.optionBtn} ${shareSrc === s ? styles.optionActive : ''}`}
                    onClick={() => setShareSrc(s)}>
                    <span aria-hidden="true">{t.icon}</span> {t.name}
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>모임 제목</label>
            <input className={styles.textInput} value={shareTitle} aria-label="모임 제목"
              onChange={e => setShareTitle(e.target.value)} placeholder="예: 1월 팀 회식" />
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>입금 안내 <span className={styles.cardLabelHint}>선택</span></label>
            <div className={styles.shareInputRow}>
              <input className={styles.textInput} value={payerName} aria-label="받을 사람"
                onChange={e => setPayerName(e.target.value)} placeholder="받을 사람 (예: 김OO)" />
              <input className={styles.textInput} value={payerAccount} aria-label="계좌번호"
                onChange={e => setPayerAccount(e.target.value)} placeholder="계좌번호 (예: 카뱅 3333-XX-XXXXXX)" />
            </div>
          </div>

          {shareMessage ? (
            <>
              <div className={styles.card}>
                <label className={styles.cardLabel}>미리보기</label>
                <div className={styles.shareTextBox}>{shareMessage}</div>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(shareMessage)}>
                  {copied ? '✓ 복사됨' : '📋 메시지 복사'}
                </button>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>먼저 다른 탭에서 정산을 완료하세요</div>
              간단 N빵 / 술값 분리 / 개인별 정산 / 선결제자 정산 결과가 있어야 메시지가 생성됩니다
            </div>
          )}
        </>
      )}

      {/* 히스토리 */}
      {history.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            저장된 정산 ({history.length}/30)
            <button className={`${styles.miniBtn} ${styles.miniDanger}`} onClick={clearHistory}>전체 삭제</button>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.slice(0, 8).map(h => (
              <div key={h.id} className={styles.historyRow}>
                <span className={styles.historyName}>
                  {h.title}
                  <small>· {h.people}명 · {new Date(h.createdAt).toLocaleDateString('ko-KR')}</small>
                </span>
                <span className={styles.historyAmount}>
                  {fmt(h.perPerson)}원/인
                  <button
                    className={styles.miniBtn}
                    style={{ marginLeft: 8 }}
                    onClick={() => removeHistory(h.id)}>×</button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
