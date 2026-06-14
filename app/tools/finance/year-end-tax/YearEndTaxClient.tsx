'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  calcYearEnd,
  CARD_THRESHOLD_RATE,
  PENSION_SAVINGS_LIMIT,
  PENSION_TOTAL_LIMIT,
  STANDARD_TAX_CREDIT,
  RENT_GROSS_CAP,
  PENSION_CREDIT_GROSS_CUT,
  type YearEndInput,
} from '@/lib/krYearEndTax'
import s from './yearEndTax.module.css'

const STORAGE_KEY = 'youtil:year-end-tax:inputs-v1'

/* 금액 입력 상한 — 20억 클램프 */
const AMOUNT_MAX = 2_000_000_000
const COUNT_MAX = 20

type PrepaidMode = 'income' | 'withLocal' // 소득세만 / 지방세 포함

const won = (n: number) => Math.round(n).toLocaleString('ko-KR')
const manwon = (n: number) => Math.round(n / 10_000).toLocaleString('ko-KR') // 만원 단위 표기

/* 실시간 콤마 (금액 텍스트 입력) */
function commafy(v: string): string {
  const digits = v.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('ko-KR')
}
function parseAmount(v: string): number {
  const n = Number(v.replace(/[^0-9]/g, ''))
  return Number.isFinite(n) ? Math.min(AMOUNT_MAX, Math.max(0, n)) : 0
}
function parseCount(v: string): number {
  const n = parseInt(v.replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) ? Math.min(COUNT_MAX, Math.max(0, n)) : 0
}

/* 비운 금액 → 0, 비운 nationalPension/otherInsurance/prepaid → null */
function amountOrNull(v: string): number | null {
  if (v.trim() === '') return null
  return parseAmount(v)
}

interface Stored {
  gross?: unknown
  prepaid?: unknown
  prepaidMode?: unknown
  dependents?: unknown
  children?: unknown
  creditCard?: unknown
  checkCash?: unknown
  marketTransit?: unknown
  pensionSavings?: unknown
  irp?: unknown
  insurance?: unknown
  medical?: unknown
  education?: unknown
  donation?: unknown
  monthlyRent?: unknown
  isHomeless?: unknown
  elderly?: unknown
  disabled?: unknown
  nationalPension?: unknown
  otherInsurance?: unknown
}

const isStr = (v: unknown): v is string => typeof v === 'string'
const isPrepaidMode = (v: unknown): v is PrepaidMode => v === 'income' || v === 'withLocal'

export default function YearEndTaxClient() {
  // [기본]
  const [gross, setGross] = useState('50,000,000')
  const [prepaid, setPrepaid] = useState('') // 비움 → 추정
  const [prepaidMode, setPrepaidMode] = useState<PrepaidMode>('withLocal')
  const [dependents, setDependents] = useState('0')
  const [children, setChildren] = useState('0')
  // [신용카드]
  const [creditCard, setCreditCard] = useState('')
  const [checkCash, setCheckCash] = useState('')
  const [marketTransit, setMarketTransit] = useState('')
  // [연금·보험]
  const [pensionSavings, setPensionSavings] = useState('')
  const [irp, setIrp] = useState('')
  const [insurance, setInsurance] = useState('')
  // [의료·교육·기부]
  const [medical, setMedical] = useState('')
  const [education, setEducation] = useState('')
  const [donation, setDonation] = useState('')
  // [월세]
  const [monthlyRent, setMonthlyRent] = useState('')
  const [isHomeless, setIsHomeless] = useState(false)
  // [고급]
  const [elderly, setElderly] = useState('0')
  const [disabled, setDisabled] = useState('0')
  const [nationalPension, setNationalPension] = useState('') // 비움 → 추정
  const [otherInsurance, setOtherInsurance] = useState('') // 비움 → 추정

  const [copied, setCopied] = useState(false)

  /* localStorage 복원 — 무검증 as 금지: 타입 검증 후 사용 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j: Stored = JSON.parse(raw)
      if (isStr(j.gross)) setGross(commafy(j.gross))
      if (isStr(j.prepaid)) setPrepaid(commafy(j.prepaid))
      if (isPrepaidMode(j.prepaidMode)) setPrepaidMode(j.prepaidMode)
      if (isStr(j.dependents)) setDependents(String(parseCount(j.dependents)))
      if (isStr(j.children)) setChildren(String(parseCount(j.children)))
      if (isStr(j.creditCard)) setCreditCard(commafy(j.creditCard))
      if (isStr(j.checkCash)) setCheckCash(commafy(j.checkCash))
      if (isStr(j.marketTransit)) setMarketTransit(commafy(j.marketTransit))
      if (isStr(j.pensionSavings)) setPensionSavings(commafy(j.pensionSavings))
      if (isStr(j.irp)) setIrp(commafy(j.irp))
      if (isStr(j.insurance)) setInsurance(commafy(j.insurance))
      if (isStr(j.medical)) setMedical(commafy(j.medical))
      if (isStr(j.education)) setEducation(commafy(j.education))
      if (isStr(j.donation)) setDonation(commafy(j.donation))
      if (isStr(j.monthlyRent)) setMonthlyRent(commafy(j.monthlyRent))
      if (typeof j.isHomeless === 'boolean') setIsHomeless(j.isHomeless)
      if (isStr(j.elderly)) setElderly(String(parseCount(j.elderly)))
      if (isStr(j.disabled)) setDisabled(String(parseCount(j.disabled)))
      if (isStr(j.nationalPension)) setNationalPension(commafy(j.nationalPension))
      if (isStr(j.otherInsurance)) setOtherInsurance(commafy(j.otherInsurance))
    } catch {}
  }, [])

  /* 저장 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          gross, prepaid, prepaidMode, dependents, children,
          creditCard, checkCash, marketTransit,
          pensionSavings, irp, insurance,
          medical, education, donation,
          monthlyRent, isHomeless, elderly, disabled,
          nationalPension, otherInsurance,
        }),
      )
    } catch {}
  }, [
    gross, prepaid, prepaidMode, dependents, children,
    creditCard, checkCash, marketTransit,
    pensionSavings, irp, insurance,
    medical, education, donation,
    monthlyRent, isHomeless, elderly, disabled,
    nationalPension, otherInsurance,
  ])

  const grossN = parseAmount(gross)

  /* 입력 → YearEndInput → calcYearEnd (전부 lib) */
  const input: YearEndInput = useMemo(() => ({
    gross: grossN,
    dependents: parseCount(dependents),
    children: parseCount(children),
    elderly: parseCount(elderly),
    disabled: parseCount(disabled),
    creditCard: parseAmount(creditCard),
    checkCash: parseAmount(checkCash),
    marketTransit: parseAmount(marketTransit),
    pensionSavings: parseAmount(pensionSavings),
    irp: parseAmount(irp),
    insurance: parseAmount(insurance),
    medical: parseAmount(medical),
    education: parseAmount(education),
    donation: parseAmount(donation),
    monthlyRent: parseAmount(monthlyRent),
    isHomeless,
    nationalPension: amountOrNull(nationalPension),
    otherInsurance: amountOrNull(otherInsurance),
    prepaidTax: amountOrNull(prepaid),
    prepaidIncludesLocal: prepaidMode === 'withLocal',
  }), [
    grossN, dependents, children, elderly, disabled,
    creditCard, checkCash, marketTransit,
    pensionSavings, irp, insurance, medical, education, donation,
    monthlyRent, isHomeless, nationalPension, otherInsurance, prepaid, prepaidMode,
  ])

  const r = useMemo(() => calcYearEnd(input), [input])

  /* 근로소득공제 (표시용 역산) */
  const earnedDeduction = Math.max(0, grossN - r.earnedIncome)

  /* 정산 부호 */
  const isRefund = r.settlement < 0
  const isPay = r.settlement > 0
  const settleAbs = Math.abs(r.settlement)
  const nearZero = settleAbs < 10_000 // 1만원 미만은 '정산 거의 없음'

  /* 신용카드 문턱 (총급여 25%) */
  const cardThreshold = grossN * CARD_THRESHOLD_RATE
  const cardUsed = parseAmount(creditCard) + parseAmount(checkCash) + parseAmount(marketTransit)
  const cardEntered = cardUsed > 0
  const cardOverThreshold = cardUsed > cardThreshold

  /* 절세 팁 — 연금계좌 잔여 한도 (PENSION_TOTAL_LIMIT − 현재대상) */
  const psEligible = Math.min(parseAmount(pensionSavings), PENSION_SAVINGS_LIMIT)
  const pensionCurrent = Math.min(psEligible + parseAmount(irp), PENSION_TOTAL_LIMIT)
  const pensionHeadroom = Math.max(0, PENSION_TOTAL_LIMIT - pensionCurrent)
  const pensionRate = grossN <= PENSION_CREDIT_GROSS_CUT ? 0.15 : 0.12
  const pensionExtraRefund = Math.round(pensionHeadroom * pensionRate)

  /* 복사 요약 */
  const summary = useMemo(() => {
    const head = nearZero
      ? '정산 거의 없음 (예상 환급·추가납부 ±1만원 이내)'
      : isRefund
        ? `예상 환급 ${won(settleAbs)}원`
        : `추가 납부 ${won(settleAbs)}원`
    return (
      `[연말정산 환급·추가납부 시뮬레이션]\n` +
      `${head}\n` +
      `· 총급여 ${won(grossN)}원\n` +
      `· 결정세액 ${won(r.decidedTotal)}원 (소득세 ${won(r.decidedIncomeTax)} + 지방세 ${won(r.localTax)})\n` +
      `· 기납부세액 ${won(r.prepaidTotal)}원${r.prepaidEstimated ? ' (추정)' : ''}\n` +
      `· 과세표준 ${won(r.taxBase)}원 · 적용 한계세율 ${r.marginalRatePct}%\n` +
      `※ 핵심 공제만 반영한 간이 추정 · youtil.kr`
    )
  }, [nearZero, isRefund, settleAbs, grossN, r])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  /* 금액 입력 헬퍼 — 콤마 적용 */
  const amountInput = (
    id: string,
    label: string,
    value: string,
    setter: (v: string) => void,
    placeholder = '0',
    help?: React.ReactNode,
  ) => (
    <div className={s.field}>
      <label className={s.fieldLabel} htmlFor={id}>{label}</label>
      <div className={s.inputUnit}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className={s.input}
          value={value}
          onChange={(e) => setter(commafy(e.target.value))}
          placeholder={placeholder}
        />
        <span className={s.unitSuffix}>원</span>
      </div>
      {help && <p className={s.helpText}>{help}</p>}
    </div>
  )

  /* 인원 수 입력 헬퍼 */
  const countInput = (id: string, label: string, value: string, setter: (v: string) => void) => (
    <div className={s.field}>
      <label className={s.fieldLabel} htmlFor={id}>{label}</label>
      <div className={s.inputUnit}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className={s.input}
          value={value}
          onChange={(e) => setter(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
          placeholder="0"
        />
        <span className={s.unitSuffix}>명</span>
      </div>
    </div>
  )

  return (
    <div className={s.wrap}>
      {/* ── [기본] 항상 노출 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>기본 정보</span>

        <div className={s.row2}>
          {amountInput(
            'yet-gross', '총급여 (연, 비과세 제외)', gross, setGross, '50,000,000',
            <>연간 세전 급여 — 식대 등 비과세 제외 금액</>,
          )}
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="yet-prepaid">기납부세액 (원천징수 합계)</label>
            <div className={s.inputUnit}>
              <input
                id="yet-prepaid"
                type="text"
                inputMode="numeric"
                className={s.input}
                value={prepaid}
                onChange={(e) => setPrepaid(commafy(e.target.value))}
                placeholder={`비우면 추정 (약 ${won(r.prepaidEstimated ? r.prepaidTotal : 0)}원)`}
              />
              <span className={s.unitSuffix}>원</span>
            </div>
            <p className={s.helpText}>
              원천징수영수증 ⑬ 결정세액 또는 매월 떼인 세금 합계. 비우면 자동 추정합니다.
            </p>
            <div className={s.segment} role="group" aria-label="기납부세액 포함 범위" style={{ marginTop: 8 }}>
              {([
                { id: 'income', label: '소득세만' },
                { id: 'withLocal', label: '지방세 포함' },
              ] as { id: PrepaidMode; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${s.seg} ${prepaidMode === m.id ? s.segActive : ''}`}
                  onClick={() => setPrepaidMode(m.id)}
                  aria-pressed={prepaidMode === m.id}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={s.row2}>
          {countInput('yet-dependents', '부양가족 수 (본인 외)', dependents, setDependents)}
          {countInput('yet-children', '8~20세 자녀 수', children, setChildren)}
        </div>
        <p className={s.helpText}>
          부양가족은 1인당 150만원 기본공제, 8~20세 자녀는 자녀세액공제(1명 25만·2명 55만)가 추가됩니다.
        </p>
      </div>

      {/* ── 결과: 히어로 (role=status 1개) ── */}
      <div
        className={`${s.hero} ${nearZero ? s.heroEven : isRefund ? s.heroRefund : s.heroPay}`}
      >
        <p className={s.heroLabel}>
          {nearZero ? '예상 정산 결과' : isRefund ? '예상 환급액' : '예상 추가 납부액'}
        </p>
        <p
          className={`${s.heroValue} ${nearZero ? s.heroValEven : isRefund ? s.heroValRefund : s.heroValPay}`}
          role="status"
        >
          {nearZero ? (
            <>정산 거의 없음</>
          ) : (
            <>
              <span className={s.heroSign}>{isRefund ? '환급 ' : '추가 납부 '}</span>
              {won(settleAbs)}
              <span className={s.heroUnit}>원</span>
            </>
          )}
        </p>
        <div className={s.subline}>
          <span>결정세액 <strong>{won(r.decidedTotal)}원</strong></span>
          <span>기납부세액 <strong>{won(r.prepaidTotal)}원</strong>{r.prepaidEstimated && <span className={s.estBadge}>추정</span>}</span>
        </div>
        <button type="button" className={s.copyBtn} onClick={onCopy}>
          {copied ? '✅ 복사됨' : '📋 결과 요약 복사'}
        </button>
      </div>

      {/* ── 핵심 수치 3분할 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>핵심 수치</span>
        <div className={s.statGrid}>
          <div className={s.statBox}>
            <p className={s.statLabel}>결정세액 (총)</p>
            <p className={s.statValue}>{won(r.decidedTotal)}원</p>
            <p className={s.statSub}>
              소득세 <strong>{won(r.decidedIncomeTax)}</strong> + 지방세 <strong>{won(r.localTax)}</strong>
            </p>
          </div>
          <div className={s.statBox}>
            <p className={s.statLabel}>
              기납부세액{r.prepaidEstimated && <span className={s.estBadge}>추정</span>}
            </p>
            <p className={s.statValue}>{won(r.prepaidTotal)}원</p>
            <p className={s.statSub}>
              {r.prepaidEstimated ? '의무공제만 반영한 원천징수 추정' : prepaidMode === 'income' ? '입력값 + 지방세 10% 환산' : '입력값(지방세 포함)'}
            </p>
          </div>
          <div className={s.statBox}>
            <p className={s.statLabel}>과세표준</p>
            <p className={s.statValue}>{won(r.taxBase)}원</p>
            <p className={s.statSub}>적용 한계세율 <strong>{r.marginalRatePct}%</strong></p>
          </div>
        </div>
      </div>

      {/* ── 공제 내역 분해 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>공제 내역 분해</span>
        <div className={s.tableScroll}>
          <table className={s.detailTable}>
            <tbody>
              <tr className={s.sectionRow}><td colSpan={2}>소득공제 (과세표준을 줄임)</td></tr>
              <tr>
                <td>근로소득공제</td>
                <td className={s.cellMono}>−{won(earnedDeduction)}원</td>
              </tr>
              <tr>
                <td>인적공제 (본인·부양·경로·장애)</td>
                <td className={s.cellMono}>−{won(r.personalDeduction)}원</td>
              </tr>
              <tr>
                <td>연금보험료공제 (국민연금)</td>
                <td className={s.cellMono}>−{won(r.pensionDeduction)}원</td>
              </tr>
              <tr>
                <td>보험료 특별소득공제 (건보·고용)</td>
                <td className={s.cellMono}>−{won(r.insuranceDeduction)}원</td>
              </tr>
              <tr>
                <td>신용카드 등 소득공제</td>
                <td className={s.cellMono}>−{won(r.cardDeduction)}원</td>
              </tr>
              <tr className={s.cellTotal}>
                <td><strong>= 과세표준</strong></td>
                <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{won(r.taxBase)}원</strong></td>
              </tr>
              <tr>
                <td className={s.cellMuted}>× 누진세율 → 산출세액</td>
                <td className={`${s.cellMono} ${s.cellMuted}`}>{won(r.computedTax)}원</td>
              </tr>

              <tr className={s.sectionRow}><td colSpan={2}>세액공제 (산출세액에서 직접 차감)</td></tr>
              <tr>
                <td>근로소득세액공제</td>
                <td className={s.cellMono}>−{won(r.earnedCredit)}원</td>
              </tr>
              <tr>
                <td>자녀세액공제</td>
                <td className={s.cellMono}>−{won(r.childCredit)}원</td>
              </tr>
              <tr>
                <td>연금계좌세액공제</td>
                <td className={s.cellMono}>−{won(r.pensionAccountCredit)}원</td>
              </tr>
              <tr>
                <td>
                  {r.usedStandard ? '표준세액공제' : '특별·월세 세액공제'}
                  {r.usedStandard && <span className={s.estBadge}>표준 13만 적용</span>}
                </td>
                <td className={s.cellMono}>−{won(r.appliedSpecialBlock)}원</td>
              </tr>
              {!r.usedStandard && r.rentCredit > 0 && (
                <tr>
                  <td className={s.cellMuted}>┗ 월세 세액공제 (포함)</td>
                  <td className={`${s.cellMono} ${s.cellMuted}`}>{won(r.rentCredit)}원</td>
                </tr>
              )}
              <tr className={s.cellTotal}>
                <td><strong>= 결정세액 (소득세)</strong></td>
                <td className={`${s.cellMono} ${s.cellAccent}`}><strong>{won(r.decidedIncomeTax)}원</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={s.helpText}>
          특별·월세 세액공제 합계가 <strong>표준세액공제 {won(STANDARD_TAX_CREDIT)}원</strong>보다 작으면 표준을 자동 적용합니다. 결정세액(소득세)에 지방소득세 10%를 더한 값이 총 결정세액입니다.
        </p>
      </div>

      {/* ── 신용카드 문턱 ── */}
      {cardEntered && (
        <div className={`${s.tipBox} ${cardOverThreshold ? s.thresholdHit : s.thresholdMiss}`}>
          {cardOverThreshold ? (
            <>
              <strong>✓ 신용카드 문턱 도달</strong> — 사용액 {manwon(cardUsed)}만원이 총급여 25%({manwon(cardThreshold)}만원)를 넘어 소득공제 <strong>{won(r.cardDeduction)}원</strong>이 적용됐습니다. 문턱 초과분은 결제수단별 공제율(신용 15%·체크/현금 30%·전통시장·대중교통 40%)이 적용됩니다.
            </>
          ) : (
            <>
              <strong>아직 문턱 미도달</strong> — 신용카드 등 소득공제는 사용액이 총급여 25%(<strong>{manwon(cardThreshold)}만원</strong>)를 넘는 분부터 적용됩니다. 현재 {manwon(cardUsed)}만원으로 약 {manwon(Math.max(0, cardThreshold - cardUsed))}만원 더 써야 공제가 시작됩니다.
            </>
          )}
        </div>
      )}

      {/* ── 절세 팁 (한계세율 기반) ── */}
      {(pensionHeadroom > 0 || r.usedStandard) && (
        <div className={s.card}>
          <span className={s.cardLabel}>막판 절세 팁</span>
          {pensionHeadroom > 0 && (
            <div className={s.tipBox}>
              💡 연금저축·IRP를 <strong>{manwon(pensionHeadroom)}만원</strong> 더 넣으면(합산 한도 {manwon(PENSION_TOTAL_LIMIT)}만원까지) 세액공제율 {Math.round(pensionRate * 100)}% 적용으로 결정세액이 약 <strong>{won(pensionExtraRefund)}원</strong> 줄어 환급이 그만큼 늘 수 있습니다.
            </div>
          )}
          {r.usedStandard && (
            <div className={s.tipBox}>
              💡 현재 특별·월세 세액공제 합계가 표준 {won(STANDARD_TAX_CREDIT)}원에 못 미쳐 <strong>표준세액공제 13만원</strong>이 적용 중입니다. 의료비·교육비·기부금·월세를 더 입력하면 항목별 공제가 표준을 넘는 시점부터 환급이 늘어납니다.
            </div>
          )}
        </div>
      )}

      {/* ── 추가 입력 그룹 (접기) ── */}
      <details className={s.group} open>
        <summary>
          <span className={s.groupIcon}>💳</span>
          신용카드·현금영수증
          <span className={s.groupHint}>총급여 25% 초과분 공제</span>
          <svg className={s.groupChevron} width="14" height="14" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={s.groupBody}>
          <p className={s.groupNote}>연간 사용액을 결제수단별로 입력하세요. 공제율은 <strong>신용카드 15% · 체크/현금영수증 30% · 전통시장·대중교통 40%</strong>입니다.</p>
          {amountInput('yet-credit', '신용카드 사용액', creditCard, setCreditCard)}
          {amountInput('yet-check', '체크카드·현금영수증', checkCash, setCheckCash)}
          {amountInput('yet-market', '전통시장·대중교통', marketTransit, setMarketTransit)}
        </div>
      </details>

      <details className={s.group}>
        <summary>
          <span className={s.groupIcon}>🏦</span>
          연금계좌·보험
          <span className={s.groupHint}>연금저축 600·합산 900만 한도</span>
          <svg className={s.groupChevron} width="14" height="14" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={s.groupBody}>
          <p className={s.groupNote}>연금저축 한도 <strong>{manwon(PENSION_SAVINGS_LIMIT)}만원</strong> · IRP 합산 한도 <strong>{manwon(PENSION_TOTAL_LIMIT)}만원</strong> · 세액공제율 총급여 5,500만 이하 15% / 초과 12%.</p>
          {amountInput('yet-pension', '연금저축 납입액', pensionSavings, setPensionSavings)}
          {amountInput('yet-irp', 'IRP·퇴직연금 추가납입', irp, setIrp)}
          {amountInput('yet-insurance', '보장성보험료', insurance, setInsurance, '0', <>한도 100만원 · 공제율 12%</>)}
        </div>
      </details>

      <details className={s.group}>
        <summary>
          <span className={s.groupIcon}>🩺</span>
          의료비·교육비·기부금
          <span className={s.groupHint}>의료비 총급여 3% 초과분</span>
          <svg className={s.groupChevron} width="14" height="14" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={s.groupBody}>
          <p className={s.groupNote}>의료비는 총급여 <strong>3% 초과분</strong>만 공제(공제율 15%) · 교육비·기부금 공제율 15%(기부금 1천만 초과분 30%).</p>
          {amountInput('yet-medical', '의료비', medical, setMedical, '0', <>총급여 3%(약 {manwon(grossN * 0.03)}만원) 넘는 분부터 공제</>)}
          {amountInput('yet-education', '교육비', education, setEducation)}
          {amountInput('yet-donation', '기부금', donation, setDonation)}
        </div>
      </details>

      <details className={s.group}>
        <summary>
          <span className={s.groupIcon}>🏠</span>
          월세 (무주택 세대주)
          <span className={s.groupHint}>총급여 8천만 이하</span>
          <svg className={s.groupChevron} width="14" height="14" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={s.groupBody}>
          <p className={s.groupNote}>무주택 세대주이고 총급여 <strong>{manwon(RENT_GROSS_CAP)}만원 이하</strong>일 때 연 월세 1,000만원 한도로 세액공제(총급여 5,500만 이하 17% / 초과 15%).</p>
          <div className={s.checkRow}>
            <input
              id="yet-homeless"
              type="checkbox"
              checked={isHomeless}
              onChange={(e) => setIsHomeless(e.target.checked)}
            />
            <label htmlFor="yet-homeless">무주택 세대주입니다 (월세공제 요건)</label>
          </div>
          {amountInput('yet-rent', '월세 연 납부액', monthlyRent, setMonthlyRent, '0',
            !isHomeless ? <>무주택 세대주 체크 시 공제가 적용됩니다.</> : grossN > RENT_GROSS_CAP ? <>총급여 8천만원 초과 — 월세 세액공제 대상이 아닙니다.</> : undefined,
          )}
        </div>
      </details>

      <details className={s.group}>
        <summary>
          <span className={s.groupIcon}>⚙️</span>
          고급 (경로·장애·4대보험 직접입력)
          <span className={s.groupHint}>비우면 자동 추정</span>
          <svg className={s.groupChevron} width="14" height="14" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 4.5 L6 7.5 L9 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </summary>
        <div className={s.groupBody}>
          <p className={s.groupNote}>경로우대(70세↑) 1인당 100만 추가공제 · 장애인 1인당 200만 추가공제. 국민연금·건강보험 본인부담을 비우면 총급여 기준으로 자동 추정합니다.</p>
          <div className={s.row2}>
            {countInput('yet-elderly', '경로우대 (70세↑) 수', elderly, setElderly)}
            {countInput('yet-disabled', '장애인 수', disabled, setDisabled)}
          </div>
          <div className={s.row2}>
            {amountInput('yet-np', '국민연금 본인부담 (연)', nationalPension, setNationalPension, `비우면 추정 (약 ${won(r.pensionDeduction)}원)`)}
            {amountInput('yet-other-ins', '건강·고용보험 본인부담 (연)', otherInsurance, setOtherInsurance, `비우면 추정 (약 ${won(r.insuranceDeduction)}원)`)}
          </div>
        </div>
      </details>

      <a href="/tools/finance/salary" className={s.crossLink}>
        💰 연봉 실수령액 계산기 → 매달 떼이는 세금·4대보험부터 확인
      </a>
    </div>
  )
}
