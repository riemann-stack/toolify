'use client'

import { useEffect, useMemo, useState } from 'react'
import { marginalRate } from '@/lib/krIncomeTax'
import {
  calcCapitalGains,
  CG_HIGH_PRICE_THRESHOLD,
  CG_BASIC_DEDUCTION,
  CG_LOCAL_TAX_RATE,
  CG_SHORT_UNDER1_RATE,
  CG_SHORT_UNDER2_RATE,
  type PropertyType,
} from './capitalGainsUtils'
import { todayStr } from '@/lib/date'
import s from './capitalGains.module.css'

const STORAGE_KEY = 'youtil:capital-gains-tax:last-input-v1'

/* 입력 상한 — 1,000억 클램프 (그 이상은 비현실적·오타) */
const AMOUNT_MAX = 100_000_000_000
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

const PROPERTY_TYPES: { id: PropertyType; label: string }[] = [
  { id: 'house', label: '주택·조합원입주권' },
  { id: 'presale', label: '분양권' },
]

/* ── 표시·파싱 유틸 (법정 수치 없음) ── */
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
  return digits ? Math.min(AMOUNT_MAX, parseInt(digits, 10)) : 0
}
/** ISO(YYYY-MM-DD) → 로컬 자정 Date. 'T00:00:00' 접미로 UTC 해석 회피 (CLAUDE.md) */
function parseIso(iso: string): Date {
  return new Date(iso + 'T00:00:00')
}
function isValidIso(iso: string): boolean {
  if (!ISO_RE.test(iso)) return false
  const d = parseIso(iso)
  return !Number.isNaN(d.getTime())
}
/** 보유기간(년) = (양도일 − 취득일) 일수 / 365.25. 음수면 0 */
function holdYearsOf(acquireIso: string, saleIso: string): number {
  if (!isValidIso(acquireIso) || !isValidIso(saleIso)) return 0
  const ms = parseIso(saleIso).getTime() - parseIso(acquireIso).getTime()
  if (ms <= 0) return 0
  const days = Math.floor(ms / 86_400_000)
  return days / 365.25
}
function fmtPct(rate: number): string {
  return `${(Math.round(rate * 1000) / 10).toLocaleString('ko-KR')}%`
}

interface Stored {
  salePrice?: unknown
  acquirePrice?: unknown
  expenses?: unknown
  acquireDate?: unknown
  saleDate?: unknown
  oneHouse?: unknown
  liveReqMet?: unknown
  liveYears?: unknown
  propertyType?: unknown
}
function isPropertyType(v: unknown): v is PropertyType {
  return v === 'house' || v === 'presale'
}

export default function CapitalGainsClient() {
  const [salePrice, setSalePrice] = useState('1,500,000,000')
  const [acquirePrice, setAcquirePrice] = useState('1,000,000,000')
  const [expenses, setExpenses] = useState('')
  const [acquireDate, setAcquireDate] = useState('2016-06-01')
  const [saleDate, setSaleDate] = useState(todayStr())
  const [oneHouse, setOneHouse] = useState(true)
  const [liveReqMet, setLiveReqMet] = useState(true)
  const [liveYears, setLiveYears] = useState('10')
  const [propertyType, setPropertyType] = useState<PropertyType>('house')
  const [copied, setCopied] = useState(false)

  /* localStorage 복원 — 무검증 as 금지: 타입·형식·enum 검증 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j: Stored = JSON.parse(raw)
      if (typeof j.salePrice === 'string') setSalePrice(commafy(j.salePrice))
      if (typeof j.acquirePrice === 'string') setAcquirePrice(commafy(j.acquirePrice))
      if (typeof j.expenses === 'string') setExpenses(commafy(j.expenses))
      if (typeof j.acquireDate === 'string' && isValidIso(j.acquireDate)) setAcquireDate(j.acquireDate)
      if (typeof j.saleDate === 'string' && isValidIso(j.saleDate)) setSaleDate(j.saleDate)
      if (typeof j.oneHouse === 'boolean') setOneHouse(j.oneHouse)
      if (typeof j.liveReqMet === 'boolean') setLiveReqMet(j.liveReqMet)
      if (typeof j.liveYears === 'string' && /^\d{1,2}$/.test(j.liveYears)) setLiveYears(j.liveYears)
      if (isPropertyType(j.propertyType)) setPropertyType(j.propertyType)
    } catch {}
  }, [])

  /* 저장 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ salePrice, acquirePrice, expenses, acquireDate, saleDate, oneHouse, liveReqMet, liveYears, propertyType }),
      )
    } catch {}
  }, [salePrice, acquirePrice, expenses, acquireDate, saleDate, oneHouse, liveReqMet, liveYears, propertyType])

  /* 파싱 + 클램프 */
  const saleN = parseAmount(salePrice)
  const acquireN = parseAmount(acquirePrice)
  const expensesN = parseAmount(expenses)
  const liveYearsN = Math.min(50, Math.max(0, parseInt(liveYears, 10) || 0))
  const isPresale = propertyType === 'presale'

  const datesValid = isValidIso(acquireDate) && isValidIso(saleDate) && parseIso(saleDate).getTime() > parseIso(acquireDate).getTime()
  const holdYears = useMemo(() => holdYearsOf(acquireDate, saleDate), [acquireDate, saleDate])

  /* 1세대1주택·거주는 주택일 때만 의미 — 분양권이면 강제 false 전달 */
  const effOneHouse = !isPresale && oneHouse
  const effLiveReqMet = !isPresale && liveReqMet
  const effLiveYears = effOneHouse ? liveYearsN : 0

  const result = useMemo(
    () =>
      calcCapitalGains({
        salePrice: saleN,
        acquirePrice: acquireN,
        expenses: expensesN,
        holdYears,
        liveYears: effLiveYears,
        oneHouse: effOneHouse,
        liveReqMet: effLiveReqMet,
        propertyType,
      }),
    [saleN, acquireN, expensesN, holdYears, effLiveYears, effOneHouse, effLiveReqMet, propertyType],
  )

  /* 입력 유효성 — 양도가액·취득가액·날짜가 들어와야 결과 노출 */
  const hasInputs = saleN > 0 && acquireN > 0 && datesValid
  const noGain = hasInputs && result.totalGain <= 0

  /* 적용세율 표기: 단기면 70/60%, 2년 이상이면 한계세율(과표 구간) */
  const displayRate = result.shortTerm
    ? result.appliedRate
    : marginalRate(result.taxBase)
  const rateLabel = result.shortTerm === 'under1'
    ? `${fmtPct(CG_SHORT_UNDER1_RATE)} (1년 미만 단기 중과)`
    : result.shortTerm === 'under2'
      ? `${fmtPct(CG_SHORT_UNDER2_RATE)} (2년 미만 단기 중과)`
      : `${fmtPct(displayRate)} (한계세율)`

  const holdYearsLabel = holdYears > 0 ? `${holdYears.toFixed(2)}년` : '—'

  /* 복사 요약 */
  const summary = useMemo(() => {
    if (!hasInputs) return ''
    if (result.taxFree) {
      return (
        `[1주택 양도소득세]\n` +
        `비과세 (요건 충족 가정, 확정 아님)\n` +
        `· 양도가액 ${fmtWon(saleN)}원 · 양도차익 ${fmtWon(result.totalGain)}원\n` +
        `· 보유 ${holdYearsLabel} · 거주 ${effLiveYears}년\n` +
        `※ 2026 국세청 기준 추정 · youtil.kr`
      )
    }
    return (
      `[1주택 양도소득세]\n` +
      `총 납부세액 ${fmtWon(result.totalTax)}원 (양도세 ${fmtWon(result.computedTax)} + 지방세 ${fmtWon(result.localTax)})\n` +
      `· 과세표준 ${fmtWon(result.taxBase)}원 · 적용세율 ${rateLabel}\n` +
      `· 세후 실수령 차익 ${fmtWon(result.netGain)}원 · 유효세율 ${fmtPct(result.effectiveRate)}\n` +
      `· 보유 ${holdYearsLabel} · 거주 ${effLiveYears}년${result.ltsdTable > 0 ? ` · 장특공 표${result.ltsdTable} ${fmtPct(result.ltsdRate)}` : ''}\n` +
      `※ 2026 국세청 기준 추정 · youtil.kr`
    )
  }, [hasInputs, result, saleN, holdYearsLabel, effLiveYears, rateLabel])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className={s.wrap}>
      {/* ── 가액 입력 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>양도·취득 가액</span>
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="cg-sale">양도가액 (판 금액)</label>
            <input
              id="cg-sale"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={salePrice}
              onChange={(e) => setSalePrice(commafy(e.target.value))}
              placeholder="1,500,000,000"
            />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="cg-acquire">취득가액 (산 금액)</label>
            <input
              id="cg-acquire"
              type="text"
              inputMode="numeric"
              className={s.input}
              value={acquirePrice}
              onChange={(e) => setAcquirePrice(commafy(e.target.value))}
              placeholder="1,000,000,000"
            />
          </div>
        </div>
        <div className={s.field} style={{ marginBottom: 0 }}>
          <label className={s.fieldLabel} htmlFor="cg-expenses">필요경비 (취득세·중개수수료·자본적지출 등)</label>
          <input
            id="cg-expenses"
            type="text"
            inputMode="numeric"
            className={s.input}
            value={expenses}
            onChange={(e) => setExpenses(commafy(e.target.value))}
            placeholder="0"
          />
          <p className={s.helpText}>
            취득세·법무비·중개수수료·발코니 확장 등 자본적지출이 경비로 인정됩니다. 도배·장판 등 수익적지출은 제외.
          </p>
        </div>
      </div>

      {/* ── 보유·거주 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>취득·양도일 · 보유 / 거주</span>
        <div className={s.row2}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="cg-acquire-date">취득일</label>
            <input
              id="cg-acquire-date"
              type="date"
              className={s.input}
              value={acquireDate}
              onChange={(e) => setAcquireDate(e.target.value)}
            />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="cg-sale-date">양도일 (잔금일)</label>
            <input
              id="cg-sale-date"
              type="date"
              className={s.input}
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </div>
        </div>
        <p className={s.holdInfo}>
          {datesValid ? (
            <>보유기간 <strong>{holdYearsLabel}</strong> (취득일·양도일로 자동 산출 · 일수÷365.25)
              {holdYears < 2 && <> · <span style={{ color: 'var(--danger)' }}>2년 미만 → 단기 중과세율 적용</span></>}
            </>
          ) : (
            <span style={{ color: 'var(--warning)' }}>양도일이 취득일보다 늦어야 합니다.</span>
          )}
        </p>

        {effOneHouse && (
          <div className={s.field} style={{ marginTop: 14, marginBottom: 0 }}>
            <label className={s.fieldLabel} htmlFor="cg-live-years">거주기간 (1세대1주택 장기보유공제 표2 적용용)</label>
            <div className={s.inputUnit}>
              <input
                id="cg-live-years"
                type="text"
                inputMode="numeric"
                className={s.input}
                value={liveYears}
                onChange={(e) => setLiveYears(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
              />
              <span className={s.unitSuffix}>년</span>
            </div>
            <p className={s.helpText}>
              실제 거주한 기간. 보유·거주 각각 공제율이 더해져 <strong>최대 80%</strong>(보유10년+거주10년)까지 공제됩니다.
            </p>
          </div>
        )}
      </div>

      {/* ── 주택 종류 · 1세대1주택 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>주택 종류 · 비과세 요건</span>
        <div className={s.segment} role="radiogroup" aria-label="주택 종류 선택">
          {PROPERTY_TYPES.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={propertyType === p.id}
              className={`${s.seg} ${propertyType === p.id ? s.segActive : ''}`}
              onClick={() => setPropertyType(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className={s.helpText}>
          분양권은 1세대1주택 비과세·장기보유특별공제가 적용되지 않고 단기 중과세율 위주로 과세됩니다.
        </p>

        {!isPresale && (
          <>
            <div className={s.toggleRow} style={{ marginTop: 14 }}>
              <label className={s.toggleLabel} htmlFor="cg-onehouse">
                1세대 1주택
                <span>해당 세대가 국내에 주택 1채만 보유</span>
              </label>
              <input
                id="cg-onehouse"
                type="checkbox"
                checked={oneHouse}
                onChange={(e) => setOneHouse(e.target.checked)}
                style={{ width: 22, height: 22, accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {oneHouse && (
              <div className={s.checkRow} style={{ marginTop: 8 }}>
                <input
                  id="cg-livereq"
                  type="checkbox"
                  checked={liveReqMet}
                  onChange={(e) => setLiveReqMet(e.target.checked)}
                />
                <label htmlFor="cg-livereq">
                  거주요건 충족
                  <span>취득 당시 조정대상지역이었다면 2년 이상 거주해야 비과세·표2 공제 가능. 비조정지역이면 거주요건 없음(보유 2년).</span>
                </label>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── 결과 ── */}
      {!hasInputs ? (
        <div className={s.hero}>
          <p className={s.heroLabel}>양도가액 · 취득가액 · 날짜를 입력하세요</p>
          <p className={s.heroValue} role="status" aria-live="polite">
            —
          </p>
        </div>
      ) : noGain ? (
        <div className={s.heroFree}>
          <p className={s.heroFreeIcon} aria-hidden>➖</p>
          <p className={s.heroFreeValue} role="status">양도차익 없음</p>
          <p className={s.heroFreeSub}>
            양도가액이 취득가액+필요경비 이하라 과세할 양도차익이 없습니다(양도차손).
          </p>
        </div>
      ) : result.taxFree ? (
        <div className={s.heroFree}>
          <p className={s.heroFreeIcon} aria-hidden>✅</p>
          <p className={s.heroFreeValue} role="status">비과세</p>
          <div className={s.badges}>
            <span className={`${s.badge} ${s.badgeFree}`}>요건 충족 가정 · 확정 아님</span>
          </div>
          <p className={s.heroFreeSub}>
            1세대 1주택·보유 2년 이상·거주요건 충족 가정 시 양도가액 <strong>{fmtWon(CG_HIGH_PRICE_THRESHOLD)}원(12억) 이하</strong>는 비과세입니다. 실제 비과세 판정은 세대·거주·조정대상지역 등 개별 요건 확인이 필요합니다.
          </p>
        </div>
      ) : (
        <div className={s.hero}>
          <p className={s.heroLabel}>총 납부세액 (양도세 + 지방소득세)</p>
          <p className={s.heroValue} role="status">
            {fmtWon(result.totalTax)}
            <span className={s.heroUnit}>원</span>
          </p>
          <div className={s.badges}>
            {result.highPriceApportioned && (
              <span className={`${s.badge} ${s.badgeApportion}`}>12억 초과분만 과세 (안분)</span>
            )}
            {result.shortTerm && (
              <span className={`${s.badge} ${s.badgeShort}`}>
                {result.shortTerm === 'under1' ? '1년 미만 단기 70%' : '2년 미만 단기 60%'}
              </span>
            )}
          </div>
          <div className={s.subline}>
            <span>세후 실수령 차익 <strong>{fmtWon(result.netGain)}원</strong></span>
            <span>유효세율 <strong>{fmtPct(result.effectiveRate)}</strong></span>
          </div>
          <button type="button" className={s.copyBtn} onClick={onCopy}>
            {copied ? '✅ 복사됨' : '📋 결과 요약 복사'}
          </button>
        </div>
      )}

      {/* ── 상세 분해 ── */}
      {hasInputs && !noGain && !result.taxFree && (
        <div className={s.card}>
          <span className={s.cardLabel}>세액 분해</span>
          <div className={s.tableScroll}>
            <table className={s.detailTable}>
              <tbody>
                <tr>
                  <td>전체 양도차익 (양도가액 − 취득가액 − 필요경비)</td>
                  <td className={s.cellMono}>{fmtWon(result.totalGain)}원</td>
                </tr>
                {result.highPriceApportioned && (
                  <tr className={s.rowSub}>
                    <td>┗ 과세대상 양도차익 (12억 초과분 안분)</td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}>{fmtWon(result.taxableGain)}원</td>
                  </tr>
                )}
                <tr>
                  <td>
                    장기보유특별공제
                    {result.ltsdTable > 0 ? ` (표${result.ltsdTable} · ${fmtPct(result.ltsdRate)})` : ' (보유 3년 미만 미적용)'}
                  </td>
                  <td className={`${s.cellMono} ${result.ltsd > 0 ? s.cellMinus : ''}`}>
                    {result.ltsd > 0 ? '−' : ''}{fmtWon(result.ltsd)}원
                  </td>
                </tr>
                <tr>
                  <td>양도소득금액</td>
                  <td className={s.cellMono}>{fmtWon(result.gainIncome)}원</td>
                </tr>
                <tr>
                  <td>기본공제 (연 {fmtWon(CG_BASIC_DEDUCTION)}원)</td>
                  <td className={`${s.cellMono} ${s.cellMinus}`}>−{fmtWon(Math.min(result.gainIncome, CG_BASIC_DEDUCTION))}원</td>
                </tr>
                <tr className={s.cellTotal}>
                  <td><strong>과세표준</strong></td>
                  <td className={s.cellMono}><strong>{fmtWon(result.taxBase)}원</strong></td>
                </tr>
                <tr className={s.rowNote}>
                  <td>적용세율</td>
                  <td className={s.cellMono}>{rateLabel}</td>
                </tr>
                <tr>
                  <td>산출세액 (양도소득세)</td>
                  <td className={s.cellMono}>{fmtWon(result.computedTax)}원</td>
                </tr>
                <tr>
                  <td>지방소득세 ({fmtPct(CG_LOCAL_TAX_RATE)})</td>
                  <td className={s.cellMono}>{fmtWon(result.localTax)}원</td>
                </tr>
                <tr className={s.cellTotal}>
                  <td><strong>총 납부세액</strong></td>
                  <td className={s.cellMono}><strong>{fmtWon(result.totalTax)}원</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 적용근거 칩 */}
          <div className={s.basisRow}>
            <span className={s.basisChip}>보유 <strong>{holdYearsLabel}</strong></span>
            {effOneHouse && <span className={s.basisChip}>거주 <strong>{effLiveYears}년</strong></span>}
            <span className={s.basisChip}>
              {result.ltsdTable === 2 ? '장특공 표2(1세대1주택)' : result.ltsdTable === 1 ? '장특공 표1(일반)' : '장특공 미적용'}
              {result.ltsdTable > 0 && <> <strong>{fmtPct(result.ltsdRate)}</strong></>}
            </span>
            <span className={s.basisChip}>
              {result.shortTerm ? '단기 중과' : '기본 누진세율'}
            </span>
            {result.highPriceApportioned && <span className={s.basisChip}>12억 초과 안분</span>}
          </div>

          {/* 한계세율 안내 (2년 이상) */}
          <details className={s.formulaDetails} style={{ marginTop: 14 }}>
            <summary>장기보유특별공제 공제율표 보기</summary>
            <div className={s.tableScroll} style={{ marginTop: 10 }}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">보유 / 거주 기간</th>
                    <th scope="col">표1 (일반)</th>
                    <th scope="col">표2 (1세대1주택, 보유+거주)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { y: '3년', t1: '6%', t2: '보유 12% + 거주 12%' },
                    { y: '5년', t1: '10%', t2: '보유 20% + 거주 20%' },
                    { y: '10년 이상', t1: '20%', t2: '보유 40% + 거주 40% = 80%' },
                    { y: '15년 이상', t1: '30% (한도)', t2: '80% (한도)' },
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r.y}</td>
                      <td className={s.cellMono}>{r.t1}</td>
                      <td className={s.cellMono}>{r.t2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={s.helpText}>
              표2는 보유분(연 4%, 최대 40%)과 거주분(연 4%, 최대 40%)을 합산하며 합계 한도 80%입니다. 거주 2~3년은 8% 특례.
            </p>
          </details>
        </div>
      )}

      <a href="/tools/finance/real-estate" className={s.crossLink}>
        🏠 부동산 수익률 계산기 → 매도 후 실투자수익률도 함께 확인
      </a>
    </div>
  )
}
