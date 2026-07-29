/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useMemo, useState, useEffect } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './ipo-deposit.module.css'
import {
  calcDepositFromTarget, calcSharesFromDeposit, calcScenarios,
  recommendedUnit,
  loadMemos, saveMemos, memosToCSV, dDay, todayKST,
  fmtKrw, fmtKrwShort,
  DEFAULT_SCENARIOS,
  type FiveSixRule, type IpoMemo,
} from './ipoUtils'

type TabKey = 'deposit' | 'shares' | 'scenario' | 'memo'

const PRICE_QUICK = [10000, 15000, 20000, 30000, 50000, 100000]
const COMP_QUICK = [100, 300, 500, 800, 1000, 2000]
const TARGET_QUICK = [1, 3, 5, 10, 20]
const DEPOSIT_QUICK_KRW = [1_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000]

function uid(): string { return Math.random().toString(36).slice(2, 10) }

export default function IpoDepositClient() {
  const [tab, setTab] = useState<TabKey>('deposit')

  // ── 공유 입력 ───────────────────────────
  const [publicPrice, setPublicPrice] = useState<string>('20000')
  const [competition, setCompetition] = useState<string>('500')
  const [depositRatioPct, setDepositRatioPct] = useState<string>('50')
  const [unit, setUnit] = useState<string>('10')
  const [unitAuto, setUnitAuto] = useState<boolean>(true)
  const [limit, setLimit] = useState<string>('5000')
  const [useLimit, setUseLimit] = useState<boolean>(true)
  const [evenExpected, setEvenExpected] = useState<string>('1')
  const [rule, setRule] = useState<FiveSixRule>('standard')

  // ── 비례 → 증거금 ──────────────────────
  const [targetShares, setTargetShares] = useState<string>('1')

  // ── 증거금 → 주수 ──────────────────────
  const [myDeposit, setMyDeposit] = useState<string>('10000000')

  // 파싱
  const numPrice = Math.max(0, parseFloat(publicPrice) || 0)
  const numComp = Math.max(0, parseFloat(competition) || 0)
  const numRatio = Math.max(0, Math.min(100, parseFloat(depositRatioPct) || 0)) / 100
  const numLimit = useLimit ? Math.max(0, parseFloat(limit) || 0) : undefined
  const numEven = Math.max(0, parseFloat(evenExpected) || 0)
  const numTarget = Math.max(0, parseFloat(targetShares) || 0)
  const numDeposit = Math.max(0, parseFloat(myDeposit) || 0)

  // 자동 단위 — 비례 모드는 이론 청약 주수 기준, 역산은 가능 주수 기준
  // 한도가 이론 청약보다 작으면 한도 기준으로 단위 선택 (단위가 한도보다 커져 0주로 잘리는 것 방지)
  const autoUnitForDeposit = useMemo(() => {
    if (!unitAuto) return parseFloat(unit) || 10
    const theoretical = numTarget * numComp
    const eff = (numLimit !== undefined && numLimit > 0 && numLimit < theoretical) ? numLimit : theoretical
    return recommendedUnit(eff)
  }, [unitAuto, unit, numTarget, numComp, numLimit])
  const autoUnitForShares = useMemo(() => {
    if (!unitAuto) return parseFloat(unit) || 10
    const possible = numRatio > 0 && numPrice > 0 ? numDeposit / numRatio / numPrice : 0
    const eff = (numLimit !== undefined && numLimit > 0 && numLimit < possible) ? numLimit : possible
    return recommendedUnit(eff)
  }, [unitAuto, unit, numDeposit, numRatio, numPrice, numLimit])

  const valid = numPrice > 0 && numComp > 0 && numRatio > 0
  // 시나리오 탭은 DEFAULT_SCENARIOS(고정 경쟁률 목록)를 쓰므로 입력 경쟁률 불필요
  const scenarioValid = numPrice > 0 && numRatio > 0

  const depositResult = useMemo(() => {
    if (!valid || numTarget <= 0) return null
    return calcDepositFromTarget(numTarget, {
      publicPrice: numPrice, competition: numComp, depositRatio: numRatio,
      unit: autoUnitForDeposit, limit: numLimit, rule, evenExpected: numEven,
    })
  }, [valid, numTarget, numPrice, numComp, numRatio, autoUnitForDeposit, numLimit, rule, numEven])

  const sharesResult = useMemo(() => {
    if (!valid || numDeposit <= 0) return null
    return calcSharesFromDeposit(numDeposit, {
      publicPrice: numPrice, competition: numComp, depositRatio: numRatio,
      unit: autoUnitForShares, limit: numLimit, rule, evenExpected: numEven,
    })
  }, [valid, numDeposit, numPrice, numComp, numRatio, autoUnitForShares, numLimit, rule, numEven])

  const scenarios = useMemo(() => {
    if (!scenarioValid || numTarget <= 0) return []
    return calcScenarios(numTarget, DEFAULT_SCENARIOS, {
      publicPrice: numPrice, depositRatio: numRatio,
      unit: autoUnitForDeposit, limit: numLimit, rule, evenExpected: numEven,
    })
  }, [scenarioValid, numTarget, numPrice, numRatio, autoUnitForDeposit, numLimit, rule, numEven])

  // ── 메모 (localStorage) ─────────────────
  const [memos, setMemos] = useState<IpoMemo[]>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMemos(loadMemos())
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    saveMemos(memos)
  }, [memos, mounted])

  const [memoForm, setMemoForm] = useState<Partial<IpoMemo>>({})
  const addMemo = () => {
    if (!memoForm.ticker?.trim()) return
    const rec: IpoMemo = {
      id: uid(),
      ticker: memoForm.ticker.trim(),
      publicPrice: memoForm.publicPrice ?? numPrice,
      competition: memoForm.competition,
      myDeposit: memoForm.myDeposit ?? numDeposit,
      expectedAllocation: memoForm.expectedAllocation,
      subscriptionDate: memoForm.subscriptionDate,
      paymentDate: memoForm.paymentDate,
      refundDate: memoForm.refundDate,
      listingDate: memoForm.listingDate,
      notes: memoForm.notes,
      createdAt: todayKST(),
    }
    setMemos((p) => [rec, ...p])
    setMemoForm({})
  }

  const downloadCSV = () => {
    const csv = memosToCSV(memos)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtil-ipo-memo-${todayKST()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── 마크다운 카드 (현재 비례 모드 결과) ─
  const [copied, setCopied] = useState(false)
  const buildMarkdown = (): string => {
    if (!depositResult) return ''
    const r = depositResult
    return [
      `# 💰 공모주 청약 시뮬레이션`,
      `공모가: ${fmtKrw(numPrice)}원`,
      `비례경쟁률: ${numComp}:1`,
      `증거금률: ${(numRatio * 100).toFixed(0)}%`,
      `🎯 목표 비례 배정: ${numTarget}주`,
      ``,
      `## 📊 필요 사항`,
      `- 청약 주수: ${r.actualSubscribe.toLocaleString()}주 (단위 ${autoUnitForDeposit})`,
      `- 청약금액: ${fmtKrw(r.subscribeAmount)}원`,
      `- 필요 증거금: ${fmtKrw(r.depositRequired)}원 (${fmtKrwShort(r.depositRequired)})`,
      r.hitLimit ? `- ⚠️ 청약 한도(${numLimit?.toLocaleString()}주) 초과 → ${r.actualSubscribe.toLocaleString()}주로 잘림` : '',
      ``,
      `## 💸 예상 결과`,
      `- 비례 배정 (5사6입): ${r.proportionalAlloc}주`,
      `- 균등 기대: +${numEven}주 (추첨 보장 X)`,
      `- 총 배정 (예상): ${r.totalAlloc}주`,
      `- 최종 납입 (배정금액): ${fmtKrw(r.finalPayment)}원`,
      r.additionalPayment > 0
        ? `- 추가 납입 (잔금): +${fmtKrw(r.additionalPayment)}원`
        : `- 환불 예상: 약 ${fmtKrw(r.refundEstimate)}원`,
      ``,
      `⚠️ 본 도구는 일반 가이드. 종목 추천 X · 실제 결과 다를 수 있음.`,
      `youtil.kr/tools/finance/ipo-deposit`,
    ].filter(Boolean).join('\n')
  }
  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdown())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
        sources={[
          { label: '한국거래소 KRX', href: 'https://www.krx.co.kr' },
          { label: '금융감독원 전자공시 DART', href: 'https://dart.fss.or.kr' },
        ]}
      >
        본 도구는 일반 가이드입니다. 비례경쟁률은 청약 마감 직전까지 급변 — 마감 전 보수적 여유분 권장 균등배정은 추첨 — 0주 가능, 본 도구의 &ldquo;균등 기대&rdquo;는 사용자 가정값 5사6입 결과는 증권사·종목별 다를 수 있음
      </Disclaimer>

      {/* ── 탭 ── */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="계산 모드">
        <button type="button" role="tab" aria-selected={tab === 'deposit'} className={`${s.tab} ${tab === 'deposit' ? s.tabActive : ''}`} onClick={() => setTab('deposit')}>비례 → 증거금</button>
        <button type="button" role="tab" aria-selected={tab === 'shares'} className={`${s.tab} ${tab === 'shares' ? s.tabActive : ''}`} onClick={() => setTab('shares')}>증거금 → 주수</button>
        <button type="button" role="tab" aria-selected={tab === 'scenario'} className={`${s.tab} ${tab === 'scenario' ? s.tabActive : ''}`} onClick={() => setTab('scenario')}>시나리오</button>
        <button type="button" role="tab" aria-selected={tab === 'memo'} className={`${s.tab} ${tab === 'memo' ? s.tabActive : ''}`} onClick={() => setTab('memo')}>내 청약 메모</button>
      </div>

      {/* ── 공통 입력 (모든 계산 탭에서 사용) ── */}
      {tab !== 'memo' && (
        <div className={s.card}>
          <span className={s.cardLabel}>공통 입력</span>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="ipo-deposit-f1">공모가 (원)</label>
            <input id="ipo-deposit-f1" type="number" inputMode="numeric" min={0} className={s.input}
              value={publicPrice} onChange={(e) => setPublicPrice(e.target.value)} />
            <div className={s.quickRow}>
              {PRICE_QUICK.map((v) => (
                <button key={v} className={s.quickChip} onClick={() => setPublicPrice(String(v))}>
                  {fmtKrw(v)}원
                </button>
              ))}
            </div>
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="ipo-deposit-f2">비례경쟁률 (예: 500 → 500:1)</label>
            <input id="ipo-deposit-f2" type="number" inputMode="numeric" min={0} className={s.input}
              value={competition} onChange={(e) => setCompetition(e.target.value)} />
            <div className={s.quickRow}>
              {COMP_QUICK.map((v) => (
                <button key={v} className={s.quickChip} onClick={() => setCompetition(String(v))}>
                  {v}:1
                </button>
              ))}
            </div>
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel}>증거금률 (%)</label>
            <div className={s.pillRow} role="group" aria-label="증거금률">
              <button type="button" aria-pressed={depositRatioPct === '50'} className={`${s.pill} ${depositRatioPct === '50' ? s.pillActive : ''}`} onClick={() => setDepositRatioPct('50')}>50%</button>
              <button type="button" aria-pressed={depositRatioPct === '100'} className={`${s.pill} ${depositRatioPct === '100' ? s.pillActive : ''}`} onClick={() => setDepositRatioPct('100')}>100%</button>
              <input type="number" inputMode="numeric" min={0} max={100}
                className={s.miniInput}
                value={depositRatioPct}
                onChange={(e) => setDepositRatioPct(e.target.value)} /> <span className={s.unitText}>%</span>
            </div>
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel}>청약단위 (주)</label>
            <label className={s.checkRow}>
              <input type="checkbox" checked={unitAuto} onChange={(e) => setUnitAuto(e.target.checked)} />
              자동 추천 ({tab === 'shares' ? autoUnitForShares : autoUnitForDeposit}주 단위)
            </label>
            {!unitAuto && (
              <div className={s.pillRow} style={{ marginTop: 6 }} role="group" aria-label="청약단위">
                {[10, 20, 50, 100, 500, 1000].map((v) => (
                  <button key={v} type="button" aria-pressed={unit === String(v)} className={`${s.pill} ${unit === String(v) ? s.pillActive : ''}`}
                    onClick={() => setUnit(String(v))}>{v}주</button>
                ))}
                <input type="number" inputMode="numeric" min={1}
                  className={s.miniInput} value={unit}
                  onChange={(e) => setUnit(e.target.value)} />
              </div>
            )}
          </div>

          <div className={s.field}>
            <label className={s.checkRow}>
              <input type="checkbox" checked={useLimit} onChange={(e) => setUseLimit(e.target.checked)} />
              청약 한도 (증권사·종목별 보통 5,000~50,000주)
            </label>
            {useLimit && (
              <input type="number" inputMode="numeric" min={0}
                className={s.input} style={{ marginTop: 6 }}
                value={limit} onChange={(e) => setLimit(e.target.value)} />
            )}
          </div>

          <div className={s.field}>
            <label className={s.fieldLabel}>균등 기대 (주) — 추첨 보장 X</label>
            <div className={s.pillRow} role="group" aria-label="균등 기대 주수">
              {['0', '0.5', '1', '2'].map((v) => (
                <button key={v} type="button" aria-pressed={evenExpected === v} className={`${s.pill} ${evenExpected === v ? s.pillActive : ''}`}
                  onClick={() => setEvenExpected(v)}>{v}주</button>
              ))}
              <input type="number" inputMode="numeric" min={0} step={0.5}
                className={s.miniInput} value={evenExpected}
                onChange={(e) => setEvenExpected(e.target.value)} />
            </div>
            <div className={s.fieldHint}>
              ⚠️ 균등배정은 청약 인원이 많으면 추첨 → 0주 가능. 보수 0주 / 낙관 1주 권장.
            </div>
          </div>

          <div className={s.field} style={{ marginBottom: 0 }}>
            <label className={s.fieldLabel}>5사6입 처리 (소수점 비례 배정)</label>
            <div className={s.pillRow} role="group" aria-label="5사6입 처리">
              <button type="button" aria-pressed={rule === 'standard'} className={`${s.pill} ${rule === 'standard' ? s.pillActive : ''}`}
                onClick={() => setRule('standard')}>표준 (0.6↑ 올림)</button>
              <button type="button" aria-pressed={rule === 'guaranteed1'} className={`${s.pill} ${rule === 'guaranteed1' ? s.pillActive : ''}`}
                onClick={() => setRule('guaranteed1')}>1주 보장 추첨 가정</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB 1: 비례 → 증거금 ══════════ */}
      {tab === 'deposit' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>목표 비례 배정 주수</span>
            <input type="number" inputMode="numeric" min={0} className={s.input}
              value={targetShares} onChange={(e) => setTargetShares(e.target.value)} />
            <div className={s.quickRow}>
              {TARGET_QUICK.map((v) => (
                <button key={v} className={s.quickChip} onClick={() => setTargetShares(String(v))}>{v}주</button>
              ))}
            </div>
          </div>

          {!valid && (
            <div className={s.empty}>공모가·경쟁률·증거금률을 입력하세요.</div>
          )}

          {depositResult && (
            <>
              <div className={s.hero}>
                <p className={s.heroLabel}>비례 {numTarget}주를 받으려면</p>
                <p className={s.heroValue}>약 <strong>{fmtKrwShort(depositResult.depositRequired)}</strong></p>
                <p className={s.heroSub}>
                  증거금 필요 (정확: {fmtKrw(depositResult.depositRequired)}원)
                  {depositResult.hitLimit && (
                    <span className={s.heroLimit}> · ⚠️ 청약 한도 도달 — {numLimit?.toLocaleString()}주에서 잘림</span>
                  )}
                </p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>상세 결과</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr><td>목표 비례 배정</td><td className={s.cellAccent}>{numTarget}주</td></tr>
                    <tr><td>비례경쟁률</td><td>{numComp}:1</td></tr>
                    <tr><td>이론 청약 주수</td><td>{Math.round(depositResult.theoreticalSubscribe).toLocaleString()}주</td></tr>
                    <tr><td>실제 청약 주수 (단위 {autoUnitForDeposit} 적용)</td><td className={s.cellAccent}>{depositResult.actualSubscribe.toLocaleString()}주</td></tr>
                    <tr><td>필요 청약금액</td><td>{fmtKrw(depositResult.subscribeAmount)}원</td></tr>
                    <tr className={s.rowBig}><td>필요 증거금 ({(numRatio * 100).toFixed(0)}%)</td><td className={s.cellAccent}>{fmtKrw(depositResult.depositRequired)}원</td></tr>
                    <tr><td>예상 비례 배정 (5사6입)</td><td>{depositResult.proportionalAlloc}주</td></tr>
                    <tr><td>+ 균등 기대 (추첨)</td><td>+{numEven}주</td></tr>
                    <tr><td>총 배정 (예상)</td><td className={s.cellAccent}>{depositResult.totalAlloc}주</td></tr>
                    <tr><td>최종 납입 (배정금액)</td><td>{fmtKrw(depositResult.finalPayment)}원</td></tr>
                    {depositResult.additionalPayment > 0 ? (
                      <tr><td>추가 납입 (잔금)</td><td className={s.cellAccent}>+{fmtKrw(depositResult.additionalPayment)}원</td></tr>
                    ) : (
                      <tr><td>환불 예상</td><td className={s.cellGood}>약 {fmtKrw(depositResult.refundEstimate)}원</td></tr>
                    )}
                  </tbody>
                </table>

                <div className={s.feeNote}>
                  ⚠️ 청약 수수료(보통 1,500~2,000원, 일부 증권사 무료) · 환불 시점·이자 제외. 정확한 수수료는 본인 거래 증권사 안내 확인.
                </div>
              </div>

              {depositResult.hitLimit && (
                <div className={s.dangerCard}>
                  <strong>🔴 청약 한도 초과</strong>
                  <p>이론 청약 주수 {Math.round(depositResult.theoreticalSubscribe).toLocaleString()}주가 한도 {numLimit?.toLocaleString()}주를 초과 → {depositResult.actualSubscribe.toLocaleString()}주로 잘림. 증권사·종목별 한도 확인 필수.</p>
                </div>
              )}
              {depositResult.belowMinUnit && (
                <div className={s.cautionCard}>
                  <strong>⚠️ 1단위 미달</strong>
                  <p>최소 청약단위 {autoUnitForDeposit}주에 미달. 단위 적용 결과로 표시.</p>
                </div>
              )}

              <div className={s.card}>
                <button className={`${s.copyBtn} ${copied ? s.copyBtnDone : ''}`} onClick={copyMarkdown}>
                  {copied ? '복사됨' : '마크다운 카드 복사 (메모장·노션)'}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════ TAB 2: 증거금 → 주수 ══════════ */}
      {tab === 'shares' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>내 증거금 (원)</span>
            <input type="number" inputMode="numeric" min={0} className={s.input}
              value={myDeposit} onChange={(e) => setMyDeposit(e.target.value)} />
            <div className={s.quickRow}>
              {DEPOSIT_QUICK_KRW.map((v) => (
                <button key={v} className={s.quickChip} onClick={() => setMyDeposit(String(v))}>
                  {fmtKrwShort(v)}
                </button>
              ))}
            </div>
          </div>

          {!valid && (
            <div className={s.empty}>공모가·경쟁률·증거금률을 입력하세요.</div>
          )}

          {sharesResult && (
            <>
              <div className={s.hero}>
                <p className={s.heroLabel}>{fmtKrwShort(numDeposit)} 증거금</p>
                <p className={s.heroValue}>비례 약 <strong>{sharesResult.proportionalAlloc}주</strong></p>
                <p className={s.heroSub}>+ 균등 기대 {numEven}주 = 총 {sharesResult.totalAlloc}주 (예상)</p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>상세 결과</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr><td>내 증거금</td><td className={s.cellAccent}>{fmtKrw(numDeposit)}원</td></tr>
                    <tr><td>이론 청약 가능 주수</td><td>{Math.round(sharesResult.possibleSubscribe).toLocaleString()}주</td></tr>
                    <tr><td>실제 청약 주수 (단위 {autoUnitForShares} 내림)</td><td className={s.cellAccent}>{sharesResult.actualSubscribe.toLocaleString()}주</td></tr>
                    <tr><td>사용 증거금</td><td>{fmtKrw(sharesResult.usedDeposit)}원</td></tr>
                    <tr><td>미사용 증거금 (단위 내림 잔액)</td><td>{fmtKrw(sharesResult.unusedDeposit)}원</td></tr>
                    <tr className={s.rowBig}><td>예상 비례 배정 (5사6입)</td><td className={s.cellAccent}>{sharesResult.proportionalAlloc}주</td></tr>
                    <tr><td>+ 균등 기대 (추첨)</td><td>+{numEven}주</td></tr>
                    <tr><td>총 배정 (예상)</td><td className={s.cellAccent}>{sharesResult.totalAlloc}주</td></tr>
                    <tr><td>최종 납입 (배정금액)</td><td>{fmtKrw(sharesResult.finalPayment)}원</td></tr>
                    {sharesResult.additionalPayment > 0 ? (
                      <tr><td>추가 납입 (잔금)</td><td className={s.cellAccent}>+{fmtKrw(sharesResult.additionalPayment)}원</td></tr>
                    ) : (
                      <tr><td>환불 예상</td><td className={s.cellGood}>약 {fmtKrw(sharesResult.refundEstimate)}원</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {sharesResult.hitLimit && (
                <div className={s.dangerCard}>
                  <strong>🔴 청약 한도 도달</strong>
                  <p>증거금이 한도 {numLimit?.toLocaleString()}주 청약을 초과. 실제 청약 가능 주수는 {sharesResult.actualSubscribe.toLocaleString()}주로 제한.</p>
                </div>
              )}
              {sharesResult.belowMinUnit && (
                <div className={s.cautionCard}>
                  <strong>⚠️ 1단위 미달</strong>
                  <p>증거금이 최소 청약단위({autoUnitForShares}주)에 미달. 실제 청약은 0주 또는 단위 적용.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════ TAB 3: 시나리오 ══════════ */}
      {tab === 'scenario' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>목표 비례 배정 주수 (시나리오 기준)</span>
            <input type="number" inputMode="numeric" min={0} className={s.input}
              value={targetShares} onChange={(e) => setTargetShares(e.target.value)} />
            <div className={s.quickRow}>
              {TARGET_QUICK.map((v) => (
                <button key={v} className={s.quickChip} onClick={() => setTargetShares(String(v))}>{v}주</button>
              ))}
            </div>
          </div>

          {!scenarioValid && (
            <div className={s.empty}>공모가·증거금률을 입력하세요.</div>
          )}

          {scenarios.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>경쟁률 변동 시나리오 (목표 {numTarget}주, 공모가 {fmtKrw(numPrice)}원, {(numRatio * 100).toFixed(0)}%)</span>
              <table className={s.scenarioTable}>
                <thead>
                  <tr>
                    <th scope="col">경쟁률</th>
                    <th scope="col">청약 주수</th>
                    <th scope="col">필요 증거금</th>
                    <th scope="col">예상 비례</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((row) => (
                    <tr key={row.competition} className={row.hitLimit ? s.rowDanger : ''}>
                      <td className={s.cellAccent}>{row.competition}:1</td>
                      <td>{row.actualSubscribe.toLocaleString()}주{row.hitLimit && ' ⚠️'}</td>
                      <td>{fmtKrwShort(row.depositRequired)}</td>
                      <td>{row.proportionalAlloc}주</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={s.scenarioNote}>
                ⚠️ 비례경쟁률은 청약 마감 1~2시간 전에 급변. 청약 한도 내에서 보수적으로 +30% 여유분 권장. ⚠️ 표시는 한도 초과로 잘린 행.
              </p>
            </div>
          )}
        </>
      )}

      {/* ══════════ TAB 4: 메모 ══════════ */}
      {tab === 'memo' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>청약 종목 메모 (브라우저 로컬)</span>
            <p className={s.cardSub}>본 메모는 본인 브라우저에만 저장 · 종목 추천 X · 일정 자동 알림 X · 정확 일정은 증권신고서 확인.</p>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="ipo-deposit-f3">종목명 / 티커</label>
              <input id="ipo-deposit-f3" type="text" maxLength={30} className={s.input}
                placeholder="예: 가상의IPO"
                value={memoForm.ticker ?? ''}
                onChange={(e) => setMemoForm((p) => ({ ...p, ticker: e.target.value }))} />
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f4">공모가 (원)</label>
                <input id="ipo-deposit-f4" type="number" inputMode="numeric" className={s.input}
                  value={memoForm.publicPrice ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, publicPrice: +e.target.value || 0 }))} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f5">경쟁률 (마감 후)</label>
                <input id="ipo-deposit-f5" type="number" inputMode="numeric" className={s.input}
                  value={memoForm.competition ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, competition: +e.target.value || undefined }))} />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f6">내 증거금 (원)</label>
                <input id="ipo-deposit-f6" type="number" inputMode="numeric" className={s.input}
                  value={memoForm.myDeposit ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, myDeposit: +e.target.value || 0 }))} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f7">예상 배정 (주)</label>
                <input id="ipo-deposit-f7" type="number" inputMode="numeric" className={s.input}
                  value={memoForm.expectedAllocation ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, expectedAllocation: +e.target.value || undefined }))} />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f8">청약일</label>
                <input id="ipo-deposit-f8" type="date" className={s.input}
                  value={memoForm.subscriptionDate ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, subscriptionDate: e.target.value }))} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f9">환불일</label>
                <input id="ipo-deposit-f9" type="date" className={s.input}
                  value={memoForm.refundDate ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, refundDate: e.target.value }))} />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f10">납입일</label>
                <input id="ipo-deposit-f10" type="date" className={s.input}
                  value={memoForm.paymentDate ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, paymentDate: e.target.value }))} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="ipo-deposit-f11">상장일</label>
                <input id="ipo-deposit-f11" type="date" className={s.input}
                  value={memoForm.listingDate ?? ''}
                  onChange={(e) => setMemoForm((p) => ({ ...p, listingDate: e.target.value }))} />
              </div>
            </div>
            <div className={s.field} style={{ marginBottom: 0 }}>
              <label className={s.fieldLabel} htmlFor="ipo-deposit-memo">메모</label>
              <input id="ipo-deposit-memo" type="text" maxLength={100} className={s.input}
                placeholder="증권사·우대조건·기타"
                value={memoForm.notes ?? ''}
                onChange={(e) => setMemoForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>

            <button className={s.saveBtn} onClick={addMemo} disabled={!memoForm.ticker?.trim()}>
              + 메모 저장
            </button>
          </div>

          {mounted && memos.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>저장된 메모 ({memos.length})</span>
              <div className={s.memoList}>
                {memos.map((m) => {
                  const sub = dDay(m.subscriptionDate)
                  const refund = dDay(m.refundDate)
                  const listing = dDay(m.listingDate)
                  const expectedRefund = m.publicPrice && m.expectedAllocation != null
                    ? Math.max(0, m.myDeposit - m.expectedAllocation * m.publicPrice)
                    : null
                  return (
                    <div key={m.id} className={s.memoItem}>
                      <div className={s.memoHead}>
                        <span className={s.memoTicker}>{m.ticker}</span>
                        <button className={s.memoRemove} onClick={() => setMemos((p) => p.filter((x) => x.id !== m.id))} aria-label="삭제">✕</button>
                      </div>
                      <div className={s.memoMeta}>
                        공모가 {fmtKrw(m.publicPrice)}원 · 증거금 {fmtKrwShort(m.myDeposit)}
                        {m.competition != null && ` · 경쟁률 ${m.competition}:1`}
                        {m.expectedAllocation != null && ` · 예상 ${m.expectedAllocation}주`}
                      </div>
                      <div className={s.memoDates}>
                        {sub && <span className={s.memoDateChip}>청약 {sub.label}</span>}
                        {refund && <span className={s.memoDateChip}>환불 {refund.label}</span>}
                        {listing && <span className={`${s.memoDateChip} ${s.memoDateChipAccent}`}>상장 {listing.label}</span>}
                      </div>
                      {expectedRefund !== null && (
                        <div className={s.memoRefund}>예상 환불: 약 {fmtKrwShort(expectedRefund)}</div>
                      )}
                      {m.notes && <div className={s.memoNotes}>{m.notes}</div>}
                    </div>
                  )
                })}
              </div>
              <div className={s.memoActions}>
                <button className={s.saveBtn} onClick={downloadCSV}>CSV 다운로드</button>
                <button className={s.clearBtn}
                  onClick={() => { if (confirm('모든 메모를 삭제하시겠습니까?')) setMemos([]) }}>
                  전체 삭제
                </button>
              </div>
            </div>
          )}
          {mounted && memos.length === 0 && (
            <div className={s.empty}>아직 저장된 메모가 없습니다.</div>
          )}
        </>
      )}

    </div>
  )
}
