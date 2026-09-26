'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './freelance-tax.module.css'
import {
  type CalcInputs, type CalcResult, type Scenario,
  INDUSTRIES, PROGRESSIVE_BRACKETS, getIndustry, effectiveRates, simpleExcessRate,
  calculate, buildScenarios, simulateDeduction, recommendSavings,
  yellowUmbrellaLimit, fmtKRW, fmtKRWPrecise,
} from './freelanceTaxUtils'

type TabKey = 'quick' | 'compare' | 'optimize' | 'guide'

const STORAGE_KEY = 'youtil:freelance-tax:v1'

const DEFAULT_INPUTS: CalcInputs = {
  revenue: 60_000_000,
  industryId: 'developer',
  expenseMode: 'simple',
  bookExpenses: 0,
  isNewBusiness: false,
  customRates: false,
  customSimpleRate: 0,
  customBaseRate: 0,
  spouseExempt: false,
  dependents: 0,
  pensionPaid: 0,
  yellowUmbrella: 0,
  pensionSavings: 0,
  donations: 0,
  useStandard: true,
  prevYearWithholding: 0,
  withholdingMode: 'auto',
}

/** localStorage 복원 — 알려진 필드만 타입·범위·enum 검증 후 반영 (무검증 spread 금지) */
function sanitizeStored(raw: unknown): Partial<CalcInputs> {
  if (!raw || typeof raw !== 'object') return {}
  const o = raw as Record<string, unknown>
  const out: Partial<CalcInputs> = {}
  const num = (k: keyof CalcInputs, max: number, int = true): number | undefined => {
    const v = o[k]
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return undefined
    return Math.min(max, int ? Math.floor(v) : v)
  }
  const MAX_WON = 10_000_000_000
  const set = <K extends keyof CalcInputs>(k: K, v: CalcInputs[K] | undefined) => { if (v !== undefined) out[k] = v }
  set('revenue', num('revenue', MAX_WON))
  set('bookExpenses', num('bookExpenses', MAX_WON))
  set('dependents', num('dependents', 10))
  set('pensionPaid', num('pensionPaid', MAX_WON))
  set('yellowUmbrella', num('yellowUmbrella', MAX_WON))
  set('pensionSavings', num('pensionSavings', MAX_WON))
  set('donations', num('donations', MAX_WON))
  set('prevYearWithholding', num('prevYearWithholding', MAX_WON))
  set('customSimpleRate', num('customSimpleRate', 99.9, false))
  set('customBaseRate', num('customBaseRate', 99.9, false))
  for (const k of ['isNewBusiness', 'customRates', 'spouseExempt', 'useStandard'] as const) {
    if (typeof o[k] === 'boolean') out[k] = o[k] as boolean
  }
  if (o.expenseMode === 'simple' || o.expenseMode === 'book') out.expenseMode = o.expenseMode
  if (o.withholdingMode === 'auto' || o.withholdingMode === 'manual') out.withholdingMode = o.withholdingMode
  if (typeof o.industryId === 'string') {
    // 목록에서 빠진 옛 직군(음악가·미용 등)은 '기타 인적용역'으로 — 필요하면 경비율 직접 입력
    out.industryId = INDUSTRIES.some((i) => i.id === o.industryId) ? o.industryId : 'other'
  }
  return out
}

/** 저장값의 업종 id가 현재 목록에서 빠진 옛 직군인지 — 복원 시 'other'로 바뀐 사실을 안내하기 위함 */
function isRemovedIndustry(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false
  const id = (raw as Record<string, unknown>).industryId
  return typeof id === 'string' && !INDUSTRIES.some((i) => i.id === id)
}

/** 경비율(%) 입력 — 문자열 버퍼로 '64.' 같은 중간 입력 유지 (소수점 흡수 버그 방지) */
function RateInput({ id, value, onChange, label }: { id: string; value: number; onChange: (v: number) => void; label: string }) {
  const show = (v: number) => (v > 0 ? String(v) : '')
  const [buf, setBuf] = useState(show(value))
  const [prev, setPrev] = useState(value)
  if (value !== prev) {
    setPrev(value)
    if (parseFloat(buf) !== value) setBuf(show(value))
  }
  return (
    <div className={styles.numberRow}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        className={styles.smallNumber}
        value={buf}
        placeholder="예: 64.1"
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.]/g, '')
          if (!/^\d{0,2}(\.\d?)?$/.test(v)) return
          setBuf(v)
          const n = parseFloat(v)
          onChange(Number.isFinite(n) ? Math.min(99.9, n) : 0)
        }}
      />
      <span>%</span>
    </div>
  )
}

const TABS = [
  { k: 'quick',    l: '빠른 계산' },
  { k: 'compare',  l: '시나리오 비교' },
  { k: 'optimize', l: '절세 시뮬' },
  { k: 'guide',    l: '신고 가이드' },
] as const

export default function FreelanceTaxClient() {
  const [tab, setTab] = useState<TabKey>('quick')
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [mounted, setMounted] = useState(false)
  const [legacyIndustry, setLegacyIndustry] = useState(false)

  /* localStorage 복원·저장 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const obj: unknown = JSON.parse(raw)
        const parsed = sanitizeStored(obj)
        // 옛 직군은 'other'로 복원되므로 안내하고, 홈택스 경비율 직접 입력 칸을 열어 둔다
        const legacy = isRemovedIndustry(obj)
        if (legacy) parsed.customRates = true
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInputs((prev) => ({ ...prev, ...parsed }))
        setLegacyIndustry(legacy)
      }
    } catch { /* 무시 */ }
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)) } catch { /* 무시 */ }
  }, [inputs, mounted])

  const result = useMemo(() => calculate(inputs), [inputs])
  const scenarios = useMemo(() => buildScenarios(inputs), [inputs])

  const update = <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) => {
    if (k === 'industryId') setLegacyIndustry(false)
    setInputs((prev) => ({ ...prev, [k]: v }))
  }

  return (
    <div className={styles.wrap}>
      {/* 통합 면책 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/4-insurance', label: '4대보험 계산기' },
          { href: '/tools/finance/salary',      label: '연봉 실수령액' },
          { href: '/tools/finance/severance',   label: '퇴직금 계산기' },
        ]}
        sources={[
          { label: '국세청 홈택스', href: 'https://hometax.go.kr' },
          { label: '국세청', href: 'https://www.nts.go.kr' },
        ]}
      >
        2026년 종합소득세율·국세청 단순경비율 기준 — 매년 세법 개정 시 차이 가능. 실제 신고는 <a href="https://www.hometax.go.kr" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>홈택스</a> 모의계산 또는 세무사 확인. 부동산 양도·금융소득 등 복합 종합과세 케이스는 미반영. 부가가치세는 별도 세금(분기·반기 신고)이며 본 계산기 범위 외.
      </Disclaimer>

      {/* ── 탭 ── */}
      <div className={styles.tabs} role="tablist" aria-label="프리랜서 세금 계산 탭">
        {TABS.map((t) => (
          <button key={t.k}
            type="button"
            role="tab"
            aria-selected={tab === t.k}
            className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`}
            onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1: 빠른 계산 ══════════ */}
      {tab === 'quick' && <QuickCalcTab inputs={inputs} result={result} update={update} legacyIndustry={legacyIndustry} />}

      {/* ══════════ TAB 2: 시나리오 비교 ══════════ */}
      {tab === 'compare' && <CompareTab base={result} scenarios={scenarios} />}

      {/* ══════════ TAB 3: 절세 시뮬 ══════════ */}
      {tab === 'optimize' && <OptimizeTab inputs={inputs} result={result} />}

      {/* ══════════ TAB 4: 신고 가이드 ══════════ */}
      {tab === 'guide' && <GuideTab />}

    </div>
  )
}

/* ═════════════════════ TAB 1: 빠른 계산 ═════════════════════ */
function QuickCalcTab({ inputs, result, update, legacyIndustry }: {
  inputs: CalcInputs
  result: CalcResult
  update: <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) => void
  legacyIndustry: boolean
}) {
  const groupedIndustries = useMemo(() => {
    const map = new Map<string, typeof INDUSTRIES>()
    for (const i of INDUSTRIES) {
      const arr = map.get(i.category) ?? []
      arr.push(i)
      map.set(i.category, arr)
    }
    return Array.from(map.entries())
  }, [])

  const industry = getIndustry(inputs.industryId)
  const rates = effectiveRates(inputs)
  const refundColor = result.refund >= 0 ? styles.refundPos : styles.refundNeg

  return (
    <div className={styles.panel}>
      {/* 업종 + 매출 */}
      <section>
        <label className={styles.label} htmlFor="ft-industry">업종 선택 <span className={styles.labelSub}>({INDUSTRIES.length}개 직군)</span></label>
        <select
          id="ft-industry"
          className={styles.select}
          value={inputs.industryId}
          onChange={(e) => update('industryId', e.target.value)}
        >
          {groupedIndustries.map(([cat, list]) => (
            <optgroup key={cat} label={cat}>
              {list.map((i) => (
                <option key={i.id} value={i.id}>{i.name} — 단순경비율 {i.simpleRate}%</option>
              ))}
            </optgroup>
          ))}
        </select>
        {legacyIndustry && !rates.custom && (
          <p className={styles.note} role="note">
            이전에 고른 업종은 목록에서 빠져 ‘기타 인적용역’으로 바꿔 두었습니다. 홈택스에서 조회한 본인 업종 경비율을 아래에 직접 입력하세요.
          </p>
        )}
        <p className={styles.note}>
          {industry.desc} · 업종코드 <strong>{industry.code}</strong> · 단순경비율 <strong>{industry.simpleRate}%</strong>(4,000만원 초과분 {simpleExcessRate(industry.simpleRate)}%) · 기준경비율 <strong>{industry.baseRate}%</strong> · 단순경비율 한도 <strong>{fmtKRW(result.appliedSimpleLimit)}</strong>
          {inputs.isNewBusiness ? ' (신규·복식부기 기준)' : ' (계속·직전연도 기준)'}
        </p>
        <label className={styles.checkLabel} style={{ marginTop: 6 }}>
          <input type="checkbox" checked={inputs.isNewBusiness} onChange={(e) => update('isNewBusiness', e.target.checked)} />
          <span>개업 첫해(신규사업자) — 단순경비율 한도가 복식부기 의무 기준까지 확대</span>
        </label>
        <p className={styles.note} style={{ marginTop: 6 }}>
          ⚠️ 경비율은 국세청 2024년 귀속 경비율 고시 기준 <strong>참고값</strong>입니다(매년 3월 새로 고시). 본인 정확한 코드는 <a href="https://hometax.go.kr" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>홈택스</a> 신고 화면이나 지급명세서에서 확인하세요. 940909는 별도 세분 코드가 없을 때의 ‘기타 자영업’ 분류로, 직군별 전용 코드가 있으면 그쪽이 우선입니다.
        </p>
        <label className={styles.checkLabel} style={{ marginTop: 6 }}>
          <input type="checkbox" checked={inputs.customRates} onChange={(e) => update('customRates', e.target.checked)} />
          <span>목록에 없는 직군이거나 올해 고시값이 다르면 — 홈택스에서 조회한 경비율 직접 입력</span>
        </label>
        {inputs.customRates && (
          <div style={{ marginTop: 6 }}>
            <RateInput id="ft-custom-simple" label="단순경비율 (일반율)" value={inputs.customSimpleRate} onChange={(v) => update('customSimpleRate', v)} />
            <RateInput id="ft-custom-base" label="기준경비율" value={inputs.customBaseRate} onChange={(v) => update('customBaseRate', v)} />
            <p className={styles.note}>
              {rates.custom
                ? `직접 입력한 경비율로 계산 중 (4,000만원 초과분 초과율 ${rates.excessRate}%)`
                : '두 칸을 모두 입력하면 직접 입력값으로 계산합니다. 그 전까지는 위 업종의 경비율을 씁니다.'}
            </p>
          </div>
        )}
      </section>

      <section>
        <label className={styles.label} htmlFor="freelance-tax-revenue">연 총 매출 <span className={styles.labelSub}>(원천징수 전)</span></label>
        <div className={styles.amountRow}>
          <input id="freelance-tax-revenue"
            type="text"
            inputMode="numeric"
            className={styles.amountInput}
            value={inputs.revenue.toLocaleString()}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
              update('revenue', Math.min(10_000_000_000, n))
            }}
          />
          <span className={styles.amountUnit}>원</span>
        </div>
        <div className={styles.quickChips}>
          {[
            { v: 20_000_000,  l: '2,000만원' },
            { v: 30_000_000,  l: '3,000만원' },
            { v: 50_000_000,  l: '5,000만원' },
            { v: 70_000_000,  l: '7,000만원' },
            { v: 100_000_000, l: '1억원' },
            { v: 150_000_000, l: '1.5억원' },
          ].map(({ v, l }) => (
            <button key={v} className={styles.quickChip} onClick={() => update('revenue', v)}>
              {l}
            </button>
          ))}
        </div>
      </section>

      {/* 경비 */}
      <section>
        <label className={styles.label}>필요경비 적용 방식</label>
        <div className={styles.pillRow} role="group" aria-label="필요경비 적용 방식">
          <button
            type="button"
            aria-pressed={inputs.expenseMode === 'simple'}
            className={`${styles.pill} ${inputs.expenseMode === 'simple' ? styles.pillActive : ''}`}
            onClick={() => update('expenseMode', 'simple')}>
            단순경비율 ({rates.simpleRate}%)
          </button>
          <button
            type="button"
            aria-pressed={inputs.expenseMode === 'book'}
            className={`${styles.pill} ${inputs.expenseMode === 'book' ? styles.pillActive : ''}`}
            onClick={() => update('expenseMode', 'book')}>
            장부 (실경비)
          </button>
        </div>
        {inputs.expenseMode === 'book' && (
          <div className={styles.amountRow} style={{ marginTop: 10 }}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.amountInput}
              value={inputs.bookExpenses.toLocaleString()}
              onChange={(e) => {
                const n = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                update('bookExpenses', n)
              }}
              placeholder="실경비 금액"
            />
            <span className={styles.amountUnit}>원</span>
          </div>
        )}
        {inputs.expenseMode === 'book' && (
          <p className={styles.note}>지역 건강보험료는 소득공제가 아니라 장부의 필요경비로 넣습니다. 실경비 금액에 포함하세요.</p>
        )}
        {!result.canUseSimple && inputs.expenseMode === 'simple' && (
          <p className={styles.warn}>
            ⚠️ 단순경비율 한도({fmtKRW(result.appliedSimpleLimit)}, {inputs.isNewBusiness ? '신규 기준' : '계속사업자 직전연도 기준'}) 이상 — 기준경비율 추계 적용{result.isComplexBookRequired ? '(복식부기의무자는 기준경비율의 1/2)' : ''}. 본 도구는 주요경비(매입·임차·인건비) 증빙 미반영·배율 비교한도 기준이라, 증빙이 많으면 장부 작성이 유리할 수 있습니다.
          </p>
        )}
        {result.isComplexBookRequired && (
          <p className={styles.warn}>
            📒 매출 {fmtKRW(result.bookThreshold)} 이상 — <strong>복식부기 의무 대상</strong>. 미작성 시 무기장 가산세 20%.
          </p>
        )}
      </section>

      {/* 종합소득공제 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>종합소득공제</p>

        <div className={styles.checkRow}>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={inputs.spouseExempt} onChange={(e) => update('spouseExempt', e.target.checked)} />
            <span>배우자 공제 (연소득 100만원 이하)</span>
          </label>
        </div>

        <div className={styles.numberRow}>
          <label htmlFor="freelance-tax-f2">부양가족 (배우자 외)</label>
          <input id="freelance-tax-f2"
            type="number" inputMode="decimal" min={0} max={10}
            className={styles.smallNumber}
            value={inputs.dependents}
            onChange={(e) => update('dependents', Math.max(0, Math.min(10, +e.target.value || 0)))}
          />
          <span>명</span>
        </div>

        <div className={styles.numberRow}>
          <label htmlFor="freelance-tax-f3">국민연금 납부액</label>
          <input id="freelance-tax-f3"
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.pensionPaid.toLocaleString()}
            onChange={(e) => update('pensionPaid', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <p className={styles.note}>
          지역 건강보험료는 사업소득만 있으면 소득공제 대상이 아닙니다(근로소득자 전용 특별소득공제). 장부로 신고할 때 필요경비로 넣을 수 있어요.
        </p>

        <div className={styles.numberRow}>
          <label htmlFor="freelance-tax-f5">노란우산공제 <span className={styles.smallNote}>(한도 {fmtKRW(yellowUmbrellaLimit(result.businessIncome))})</span></label>
          <input id="freelance-tax-f5"
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.yellowUmbrella.toLocaleString()}
            onChange={(e) => update('yellowUmbrella', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <p className={styles.gapTitle} style={{ marginTop: 14 }}>세액공제</p>

        <div className={styles.numberRow}>
          <label htmlFor="freelance-tax-saving">연금저축 납입액 <span className={styles.smallNote}>(한도 600만)</span></label>
          <input id="freelance-tax-saving"
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.pensionSavings.toLocaleString()}
            onChange={(e) => update('pensionSavings', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>

        <div className={styles.numberRow}>
          <label htmlFor="freelance-tax-f7">기부금</label>
          <input id="freelance-tax-f7"
            type="text"
            inputMode="numeric"
            className={styles.midInput}
            value={inputs.donations.toLocaleString()}
            disabled={!result.donationEligible}
            aria-describedby="freelance-tax-f7-note"
            onChange={(e) => update('donations', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
          />
          <span>원/연</span>
        </div>
        <p className={styles.note} id="freelance-tax-f7-note">
          {result.donationEligible
            ? '연말정산 대상 사업소득자(보험설계사 등)는 기부금 세액공제를 받을 수 있습니다.'
            : '사업소득만 있으면 기부금 세액공제 대상이 아닙니다(연말정산 대상 사업소득자 제외). 장부로 신고할 때 필요경비에 넣는 방법을 검토하세요.'}
        </p>

        <label className={styles.checkLabel} style={{ marginTop: 8 }}>
          <input type="checkbox" checked={inputs.useStandard} onChange={(e) => update('useStandard', e.target.checked)} />
          <span>표준세액공제 7만원 적용</span>
        </label>
      </section>

      {/* 원천징수 옵션 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>원천징수 (이미 떼인 세금)</p>
        <div className={styles.pillRow} role="group" aria-label="원천징수 입력 방식">
          <button
            type="button"
            aria-pressed={inputs.withholdingMode === 'auto'}
            className={`${styles.pill} ${inputs.withholdingMode === 'auto' ? styles.pillActive : ''}`}
            onClick={() => update('withholdingMode', 'auto')}>
            자동 (매출 × 3.3%)
          </button>
          <button
            type="button"
            aria-pressed={inputs.withholdingMode === 'manual'}
            className={`${styles.pill} ${inputs.withholdingMode === 'manual' ? styles.pillActive : ''}`}
            onClick={() => update('withholdingMode', 'manual')}>
            직접 입력
          </button>
        </div>
        {inputs.withholdingMode === 'manual' && (
          <div className={styles.numberRow} style={{ marginTop: 10 }}>
            <label htmlFor="freelance-tax-f8">원천징수액</label>
            <input id="freelance-tax-f8"
              type="text"
              inputMode="numeric"
              className={styles.midInput}
              value={inputs.prevYearWithholding.toLocaleString()}
              onChange={(e) => update('prevYearWithholding', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)}
            />
            <span>원</span>
          </div>
        )}
      </section>

      {/* 결과 */}
      <section>
        <p className={styles.label}>계산 결과</p>
        <div className={styles.resultMain} role="status">
          <p className={styles.resultLabel}>예상 환급/납부</p>
          <p className={`${styles.resultBig} ${refundColor}`}>
            {result.refund >= 0 ? '+' : ''}{fmtKRWPrecise(result.refund)}
          </p>
          <p className={styles.resultSub}>
            {result.refund >= 0
              ? `5월 신고 시 6~7월에 ${fmtKRW(result.refund)} 환급 예상`
              : `5월 신고 시 ${fmtKRW(-result.refund)} 추가 납부 필요`}
          </p>
          <div className={styles.resultMetrics}>
            <div>
              <span>실효세율</span>
              <strong>{result.effectiveRate.toFixed(2)}%</strong>
            </div>
            <div>
              <span>한계세율</span>
              <strong>{result.marginalRate.toFixed(1)}%</strong>
            </div>
            <div>
              <span>적용 구간</span>
              <strong>{result.appliedBracket.label}</strong>
            </div>
          </div>
        </div>

        <div className={styles.flowList}>
          {[
            ['연 총 매출',           fmtKRWPrecise(result.revenue),                           ''],
            [`필요경비 (${result.expenseRate.toFixed(1)}%)`, `- ${fmtKRWPrecise(result.expenseAmount)}`, 'minus'],
            ['= 사업소득금액',       fmtKRWPrecise(result.businessIncome),                    'sum'],
            ['종합소득공제',         `- ${fmtKRWPrecise(result.totalDeduction)}`,             'minus'],
            ['= 과세표준',           fmtKRWPrecise(result.taxableBase),                       'sum'],
            ['산출세액',             fmtKRWPrecise(result.computedTax),                       ''],
            ['세액공제',             `- ${fmtKRWPrecise(result.taxCredit)}`,                  'minus'],
            ['= 결정세액 (소득세)',   fmtKRWPrecise(result.finalTax),                          'sum'],
            ['+ 지방소득세 (10%)',    fmtKRWPrecise(result.localTax),                          ''],
            ['총 부담세액',          fmtKRWPrecise(result.totalTax),                          'total'],
            ['원천징수 (이미 낸 세금)', `- ${fmtKRWPrecise(inputs.withholdingMode === 'manual' ? inputs.prevYearWithholding : Math.floor(inputs.revenue * 0.033))}`, 'minus'],
          ].map(([label, value, kind], i) => (
            <div key={i} className={`${styles.flowRow} ${kind === 'sum' ? styles.flowRowSum : ''} ${kind === 'total' ? styles.flowRowTotal : ''}`}>
              <span className={styles.flowLabel}>{label}</span>
              <span className={`${styles.flowValue} ${kind === 'minus' ? styles.flowValueMinus : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ═════════════════════ TAB 2: 시나리오 비교 ═════════════════════ */
function CompareTab({ base, scenarios }: { base: CalcResult; scenarios: Scenario[] }) {
  const baseRefund = scenarios[0].result.refund
  return (
    <div className={styles.panel}>
      <p className={styles.intro}>
        현재 입력값을 기준으로 5가지 절세 시나리오의 환급액을 비교합니다. 각 카드의 차액(<strong>+절세</strong>)이 클수록 효과가 큽니다.
      </p>

      <div className={styles.scenarioGrid}>
        {scenarios.map((s, idx) => {
          const diff = s.result.refund - baseRefund
          // BEST는 실제로 절세 효과가 있는(diff>0) 시나리오 중 최대일 때만 — 매출 0원 등 전부 동일하면 표시 안 함
          const isBest = idx > 0 && diff > 0 && scenarios.slice(1).every((other) => other.result.refund <= s.result.refund)
          return (
            <div key={s.key} className={`${styles.scenarioCard} ${isBest ? styles.scenarioCardBest : ''} ${idx === 0 ? styles.scenarioCardCurrent : ''}`}>
              {isBest && <span className={styles.bestBadge}>BEST</span>}
              {idx === 0 && <span className={styles.currentBadge}>현재</span>}
              <p className={styles.scenarioLabel}>{s.label}</p>
              <p className={styles.scenarioDesc}>{s.desc}</p>
              <p className={styles.scenarioRefund}>
                환급: <strong className={s.result.refund >= 0 ? styles.refundPos : styles.refundNeg}>
                  {s.result.refund >= 0 ? '+' : ''}{fmtKRW(s.result.refund)}
                </strong>
              </p>
              {idx > 0 && (
                <p className={`${styles.scenarioDiff} ${diff >= 0 ? styles.diffPos : styles.diffNeg}`}>
                  {diff > 0 ? `▲ ${fmtKRW(diff)} 절세` : diff < 0 ? `▼ ${fmtKRW(-diff)} 불리` : '변화 없음'}
                </p>
              )}
              <div className={styles.scenarioMini}>
                <span>과세표준 {fmtKRW(s.result.taxableBase)}</span>
                <span>실효 {s.result.effectiveRate.toFixed(1)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.compareSummary}>
        <p>
          💡 <strong>해석 가이드:</strong> 노란우산은 <em>소득공제</em> (한계세율만큼 절세), 연금저축은 <em>세액공제</em> (16.5% 또는 13.2% 정액).
          {base.appliedBracket.rate >= 0.24
            ? ' 한계세율이 24% 이상이면 노란우산이 연금저축보다 효율적인 경우가 많습니다.'
            : ' 한계세율이 15% 이하면 연금저축의 정률 세액공제가 유리할 수 있습니다.'}
        </p>
      </div>
    </div>
  )
}

/* ═════════════════════ TAB 3: 절세 시뮬 ═════════════════════ */
function OptimizeTab({ inputs, result }: { inputs: CalcInputs; result: CalcResult }) {
  const [yellowSim, setYellowSim] = useState(inputs.yellowUmbrella)
  const [pensionSim, setPensionSim] = useState(inputs.pensionSavings)
  const [depSim, setDepSim] = useState(inputs.dependents)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYellowSim(inputs.yellowUmbrella)
    setPensionSim(inputs.pensionSavings)
    setDepSim(inputs.dependents)
  }, [inputs.yellowUmbrella, inputs.pensionSavings, inputs.dependents])

  const yellowResult = useMemo(() => simulateDeduction(inputs, { yellowUmbrella: yellowSim }), [inputs, yellowSim])
  const pensionResult = useMemo(() => simulateDeduction(inputs, { pensionSavings: pensionSim }), [inputs, pensionSim])
  const depResult = useMemo(() => simulateDeduction(inputs, { dependents: depSim }), [inputs, depSim])

  const tips = useMemo(() => recommendSavings(result, inputs), [result, inputs])

  return (
    <div className={styles.panel}>
      {/* 누진세율 막대그래프 */}
      <section>
        <label className={styles.label}>종합소득세 누진세율 8단계 <span className={styles.labelSub}>(현재 위치 강조)</span></label>
        <div className={styles.bracketChart}>
          {PROGRESSIVE_BRACKETS.map((b) => {
            const isCurrent = b.min < result.taxableBase && result.taxableBase <= b.max
            return (
              <div key={b.label} className={`${styles.bracketBar} ${isCurrent ? styles.bracketBarActive : ''}`}>
                <span className={styles.bracketLabel}>{b.label}</span>
                <div className={styles.bracketTrack}>
                  <div className={styles.bracketFill} style={{ width: `${(b.rate / 0.45) * 100}%` }}>
                    <span className={styles.bracketRate}>{(b.rate * 100).toFixed(0)}%</span>
                  </div>
                </div>
                {isCurrent && <span className={styles.bracketArrow}>← 현재</span>}
              </div>
            )
          })}
        </div>
        <p className={styles.note}>
          현재 한계세율 <strong>{result.marginalRate.toFixed(1)}%</strong> (지방세 포함) — 과세표준이 100만원 늘면 세금 약 <strong>{fmtKRW(Math.floor(result.marginalRate * 10_000))}</strong> 추가 부담. 경비율을 적용하므로 매출 100만원이 늘 때 과세표준은 그보다 적게 늘어납니다.
        </p>
      </section>

      {/* 슬라이더 시뮬 */}
      <section>
        <label className={styles.label}>공제별 절세 효과 시뮬레이션</label>

        <div className={styles.simRow}>
          <div className={styles.simHead}>
            <span>노란우산공제</span>
            <strong>{fmtKRW(yellowSim)}</strong>
          </div>
          <input
            type="range" min={0} max={6_000_000} step={100_000}
            value={yellowSim}
            onChange={(e) => setYellowSim(+e.target.value)}
            className={styles.slider}
            aria-label="노란우산공제 납입액"
            aria-valuetext={fmtKRW(yellowSim)}
          />
          <p className={styles.simResult}>
            절세 효과: <strong className={styles.simSaving}>+{fmtKRW(yellowResult.refund - result.refund)}</strong>
            <span className={styles.simNote}>한도 {fmtKRW(yellowUmbrellaLimit(result.businessIncome))}</span>
          </p>
        </div>

        <div className={styles.simRow}>
          <div className={styles.simHead}>
            <span>연금저축</span>
            <strong>{fmtKRW(pensionSim)}</strong>
          </div>
          <input
            type="range" min={0} max={6_000_000} step={100_000}
            value={pensionSim}
            onChange={(e) => setPensionSim(+e.target.value)}
            className={styles.slider}
            aria-label="연금저축 납입액"
            aria-valuetext={fmtKRW(pensionSim)}
          />
          <p className={styles.simResult}>
            절세 효과: <strong className={styles.simSaving}>+{fmtKRW(pensionResult.refund - result.refund)}</strong>
            <span className={styles.simNote}>{result.businessIncome <= 45_000_000 ? '16.5%' : '13.2%'} 세액공제 · 한도 600만</span>
          </p>
        </div>

        <div className={styles.simRow}>
          <div className={styles.simHead}>
            <span>부양가족</span>
            <strong>{depSim}명</strong>
          </div>
          <input
            type="range" min={0} max={5} step={1}
            value={depSim}
            onChange={(e) => setDepSim(+e.target.value)}
            className={styles.slider}
            aria-label="부양가족 수"
            aria-valuetext={`${depSim}명`}
          />
          <p className={styles.simResult}>
            절세 효과: <strong className={styles.simSaving}>+{fmtKRW(depResult.refund - result.refund)}</strong>
            <span className={styles.simNote}>1명당 150만 소득공제</span>
          </p>
        </div>
      </section>

      {/* 추천 절세 조합 */}
      {tips.length > 0 && (
        <section className={styles.optionCard}>
          <p className={styles.gapTitle}>추천 절세 전략</p>
          <div className={styles.tipList}>
            {tips.map((t, i) => (
              <div key={i} className={styles.tipCard}>
                <span className={styles.tipEmoji}>{t.emoji}</span>
                <div className={styles.tipBody}>
                  <p className={styles.tipTitle}>{t.title}</p>
                  <p className={styles.tipDesc}>{t.desc}</p>
                </div>
                {t.estimatedSaving > 0 && (
                  <span className={styles.tipSaving}>+{fmtKRW(t.estimatedSaving)}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ═════════════════════ TAB 4: 신고 가이드 ═════════════════════ */
function GuideTab() {
  // D-day 계산 — useEffect로 hydration 안전
  const [today, setToday] = useState<{ now: Date; deadline: Date; daysLeft: number } | null>(null)
  useEffect(() => {
    const now = new Date()
    // 5월 31일, 주말이면 다음 월요일로 보정 — 올해 마감이 지난 뒤에만 다음 해로 (6/1·6/2 연장 마감일 당일 대응)
    const deadlineFor = (year: number) => {
      const d = new Date(year, 4, 31, 23, 59, 59)
      const dow = d.getDay()  // 0=일, 6=토
      if (dow === 0) d.setDate(d.getDate() + 1)       // 일 → 6/1(월)
      else if (dow === 6) d.setDate(d.getDate() + 2)  // 토 → 6/2(월)
      return d
    }
    let deadline = deadlineFor(now.getFullYear())
    if (now.getTime() > deadline.getTime()) deadline = deadlineFor(now.getFullYear() + 1)
    const ms = deadline.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday({ now, deadline, daysLeft })
  }, [])
  const DOW = ['일', '월', '화', '수', '목', '금', '토']

  const checklist = [
    '📄 지급명세서 (사업소득) — 거래처에서 1월 말까지 발급',
    '🧾 매출 증빙 (세금계산서·현금영수증·계약서)',
    '💳 경비 영수증 (사업용 신용카드 사용내역)',
    '📒 장부 (간편/복식) — 매출 기준에 따라',
    '☂️ 노란우산공제 납입증명서',
    '💰 연금저축·IRP 납입증명서',
    '🏥 국민연금 납부확인서 (지역 건강보험료는 장부 신고 시 경비 증빙)',
    '👨‍👩‍👦 부양가족 가족관계증명서·소득증빙 (필요 시)',
    '🎁 기부금 영수증 (종교·법정 단체)',
  ]

  const steps = [
    { step: 1, title: '홈택스 접속', desc: 'hometax.go.kr 로그인 (공동인증서·간편인증·금융인증)', url: 'https://www.hometax.go.kr' },
    { step: 2, title: '종합소득세 신고 메뉴', desc: '신고/납부 > 종합소득세 > 일반신고 또는 모두채움' },
    { step: 3, title: '소득자료 불러오기', desc: '국세청이 거래처에서 받은 지급명세서 자동 표시' },
    { step: 4, title: '경비 입력', desc: '단순경비율은 자동 / 장부는 수기 입력' },
    { step: 5, title: '소득공제·세액공제', desc: '인적공제·노란우산·연금저축 자료 입력 (대부분 자동)' },
    { step: 6, title: '신고서 검증·제출', desc: '오류 점검 후 전자 제출' },
    { step: 7, title: '환급/납부', desc: '환급: 6~7월 입력한 계좌 입금 / 납부: 납부서 출력 후 5월 31일까지' },
  ]

  return (
    <div className={styles.panel}>
      {/* D-day */}
      <section className={styles.ddayCard}>
        <p className={styles.ddayLabel}>다음 종합소득세 신고 마감</p>
        <p className={styles.ddayBig}>
          {today ? `D-${today.daysLeft}` : '계산 중…'}
        </p>
        <p className={styles.ddaySub}>
          {today
            ? `${today.deadline.getFullYear()}년 ${today.deadline.getMonth() + 1}월 ${today.deadline.getDate()}일 (${DOW[today.deadline.getDay()]}) 마감`
            : '신고기간 5월 1일 ~ 5월 31일'}
        </p>
        <p className={styles.note} style={{ marginTop: 6 }}>
          ※ 성실신고확인대상자는 <strong>6월 30일</strong>까지. 마감일이 주말·공휴일이면 다음 영업일로 연장.
        </p>
      </section>

      {/* 체크리스트 */}
      <section>
        <label className={styles.label}>신고 전 준비 서류</label>
        <ul className={styles.checklist}>
          {checklist.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      {/* 신고 절차 */}
      <section>
        <label className={styles.label}>홈택스 신고 단계</label>
        <div className={styles.stepList}>
          {steps.map((s) => (
            <div key={s.step} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.step}</span>
              <div>
                <p className={styles.stepTitle}>{s.title}</p>
                <p className={styles.stepDesc}>{s.desc}</p>
                {s.url && (
                  <a href={s.url} target="_blank" rel="noreferrer" className={styles.stepLink}>{s.url} ↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          ⚠️ 본 가이드는 정보 안내용 — 자동 신고·홈택스 연동 X. 실제 신고는 본인이 홈택스에서 직접 진행하거나 세무사에게 위임하세요.
        </p>
      </section>

      {/* 관련 도구 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>관련 도구</p>
        <ul className={styles.relatedList}>
          <li><Link href="/tools/finance/4-insurance">4대보험 계산기</Link> — 국민연금·건강보험 부담액</li>
          <li><Link href="/tools/finance/salary">연봉 실수령액 계산기</Link> — 직장인 + 부업 합산 시 본업 실수령</li>
          <li><Link href="/tools/finance/severance">퇴직금 실수령액 계산기</Link> — 퇴직 후 프리랜서 전환 시</li>
          <li><Link href="/tools/finance/vat">부가세 계산기</Link> — 별개 세금 (분기·반기 신고)</li>
        </ul>
      </section>
    </div>
  )
}
