'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './dsr.module.css'
import {
  calcDsr, fmtManwon, fmtPct,
  STRESS_PHASES, RATE_TYPE_LABEL,
  type RepayMethod, type RateType,
} from './dsrUtils'

const STORAGE_KEY = 'youtil_dsr_v1'

const num = (v: string): number => {
  const x = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(x) ? x : 0
}
const comma = (v: string): string => {
  const n = v.replace(/[^\d]/g, '')
  return n ? parseInt(n, 10).toLocaleString('ko-KR') : ''
}

export default function DsrClient() {
  // 공통 입력 (만원)
  const [income, setIncome] = useState('6,000')
  const [existing, setExisting] = useState('300')
  const [homePrice, setHomePrice] = useState('50,000')
  const [loan, setLoan] = useState('35,000')
  const [rate, setRate] = useState('4.5')
  const [years, setYears] = useState('30')
  const [method, setMethod] = useState<RepayMethod>('equal')
  const [rateType, setRateType] = useState<RateType>('variable')

  // 규제 파라미터 (수정 가능)
  const [dsrLimit, setDsrLimit] = useState('40')
  const [ltvLimit, setLtvLimit] = useState('70')
  const [baseStress, setBaseStress] = useState('1.5')
  const [phase, setPhase] = useState<1 | 2 | 3>(3)

  // 복원/저장
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j = JSON.parse(raw)
        if (j.income) setIncome(j.income)
        if (j.existing) setExisting(j.existing)
        if (j.homePrice) setHomePrice(j.homePrice)
        if (j.loan) setLoan(j.loan)
        if (j.rate) setRate(j.rate)
        if (j.years) setYears(j.years)
        if (j.method) setMethod(j.method)
        if (j.rateType) setRateType(j.rateType)
        if (j.dsrLimit) setDsrLimit(j.dsrLimit)
        if (j.ltvLimit) setLtvLimit(j.ltvLimit)
        if (j.baseStress) setBaseStress(j.baseStress)
        if (j.phase) setPhase(j.phase)
      }
    } catch {}
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        income, existing, homePrice, loan, rate, years, method, rateType, dsrLimit, ltvLimit, baseStress, phase,
      }))
    } catch {}
  }, [hydrated, income, existing, homePrice, loan, rate, years, method, rateType, dsrLimit, ltvLimit, baseStress, phase])

  const r = useMemo(() => calcDsr({
    annualIncome: num(income),
    existingAnnual: num(existing),
    homePrice: num(homePrice),
    loanAmount: num(loan),
    ratePct: num(rate),
    years: num(years),
    method,
    rateType,
    dsrLimitPct: num(dsrLimit),
    ltvLimitPct: num(ltvLimit),
    baseStressPct: num(baseStress),
    phaseRatio: STRESS_PHASES.find(p => p.id === phase)?.ratio ?? 1,
  }), [income, existing, homePrice, loan, rate, years, method, rateType, dsrLimit, ltvLimit, baseStress, phase])

  const dsrLimitN = num(dsrLimit)
  const ltvLimitN = num(ltvLimit)
  const stressAddPct = num(baseStress) * (STRESS_PHASES.find(p => p.id === phase)?.ratio ?? 1) * ({ variable: 1, mixed: 0.6, periodic: 0.3, fixed: 0 }[rateType])

  const dsrStatus = (v: number) => v <= dsrLimitN ? s.statusOk : v <= dsrLimitN + 5 ? s.statusWarn : s.statusOver
  const ltvStatus = r.ltv <= ltvLimitN ? s.statusOk : s.statusOver

  const gaugeColor = (v: number) => v <= dsrLimitN ? '#059669' : v <= dsrLimitN + 5 ? '#D97706' : '#DC2626'

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/housing-score', label: '청약 가점 계산기' },
          { href: '/tools/finance/real-estate', label: '부동산 수익률' },
        ]}
      >
        DSR 한도(40%)·LTV 한도·스트레스 가산금리는 정부 정책·규제지역·주택수·은행에 따라 수시로 바뀝니다. 본 계산은 입력값 기준 <strong>추정치</strong>이며, 실제 한도·금리는 반드시 해당 은행·금융위 발표를 확인하세요.
      </Disclaimer>

      {/* 공통 입력 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>기본 정보</span>
          <span className={s.cardHint}>단위: 만원</span>
        </div>
        <div className={s.inputGrid}>
          <div className={s.field}>
            <label className={s.fieldLabel}>연소득 <span className={s.fieldHint}>세전</span></label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="numeric" value={income} onChange={e => setIncome(comma(e.target.value))} />
              <span className={s.unit}>만원</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>기존 대출 연 상환액 <span className={s.fieldHint}>원리금/년</span></label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="numeric" value={existing} onChange={e => setExisting(comma(e.target.value))} />
              <span className={s.unit}>만원</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>주택 가격</label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="numeric" value={homePrice} onChange={e => setHomePrice(comma(e.target.value))} />
              <span className={s.unit}>만원</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>희망 대출 금액</label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="numeric" value={loan} onChange={e => setLoan(comma(e.target.value))} />
              <span className={s.unit}>만원</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>대출 금리</label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)} />
              <span className={s.unit}>% / 년</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>대출 만기</label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="numeric" value={years} onChange={e => setYears(e.target.value)} />
              <span className={s.unit}>년</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className={s.field}>
            <label className={s.fieldLabel}>상환 방식</label>
            <div className={s.segRow}>
              {([['equal', '원리금균등'], ['principal', '원금균등']] as [RepayMethod, string][]).map(([k, lbl]) => (
                <button key={k} type="button" className={`${s.segBtn} ${method === k ? s.segBtnActive : ''}`} onClick={() => setMethod(k)}>{lbl}</button>
              ))}
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>금리 유형 <span className={s.fieldHint}>스트레스 적용</span></label>
            <div className={s.segRow}>
              {(['variable', 'mixed', 'periodic', 'fixed'] as RateType[]).map(k => (
                <button key={k} type="button" className={`${s.segBtn} ${rateType === k ? s.segBtnActive : ''}`} onClick={() => setRateType(k)}>
                  {RATE_TYPE_LABEL[k].split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최종 한도 히어로 */}
      <div className={s.hero}>
        <div className={s.heroLabel}>예상 최대 대출 한도</div>
        <div className={s.heroNum}>{fmtManwon(r.finalMaxLoan)}</div>
        <p className={s.heroSub}>
          LTV {fmtManwon(r.ltvMaxLoan)} · 스트레스DSR {fmtManwon(r.stressMaxLoan)} 중 <strong>작은 값</strong>
        </p>
        {r.binding !== '-' && (
          <span className={s.bindBadge}>
            {r.binding === 'LTV' ? 'LTV(담보)에 묶임' : 'DSR(소득)에 묶임'}
          </span>
        )}
      </div>

      {/* DSR 결과 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>DSR (총부채원리금상환비율)</span>
          <span className={s.cardHint}>한도 {fmtPct(dsrLimitN)}%</span>
        </div>

        <div className={s.gauge}>
          <div className={s.gaugeFill} style={{ width: `${Math.min(100, r.dsr)}%`, background: gaugeColor(r.dsr) }} />
          <div className={s.gaugeLimit} style={{ left: `${Math.min(100, dsrLimitN)}%` }} />
        </div>
        <div className={s.gaugeLabel}><span>기본 DSR</span><span className={dsrStatus(r.dsr)}>{fmtPct(r.dsr)}%</span></div>

        <div className={s.gauge} style={{ marginTop: 10 }}>
          <div className={s.gaugeFill} style={{ width: `${Math.min(100, r.stressDsr)}%`, background: gaugeColor(r.stressDsr) }} />
          <div className={s.gaugeLimit} style={{ left: `${Math.min(100, dsrLimitN)}%` }} />
        </div>
        <div className={s.gaugeLabel}>
          <span>스트레스 DSR (가산 +{fmtPct(stressAddPct)}%p)</span>
          <span className={dsrStatus(r.stressDsr)}>{fmtPct(r.stressDsr)}%</span>
        </div>

        <div className={s.resultGrid} style={{ marginTop: 10 }}>
          <div className={s.resRow}>
            <span className={s.resName}>신규 대출 연 원리금</span>
            <span className={s.resVal}>{fmtManwon(r.newAnnual)}</span>
          </div>
          <div className={s.resRow}>
            <span className={s.resName}>스트레스 적용 연 원리금<small>금리 {fmtPct(num(rate))}% → {fmtPct(num(rate) + stressAddPct)}% 가정</small></span>
            <span className={s.resVal}>{fmtManwon(r.stressNewAnnual)}</span>
          </div>
          <div className={s.resRow}>
            <span className={s.resName}>DSR 한도 내 신규 상환여력<small>연 {fmtPct(dsrLimitN)}% − 기존 대출</small></span>
            <span className={s.resVal}>{fmtManwon(r.dsrCapacityAnnual)}/년</span>
          </div>
        </div>
        <p className={s.note}>
          {r.stressDsr <= dsrLimitN
            ? <>✅ 스트레스 DSR <strong>{fmtPct(r.stressDsr)}%</strong>로 한도({fmtPct(dsrLimitN)}%) 이내입니다.</>
            : <>⚠️ 스트레스 DSR <strong className={s.statusOver}>{fmtPct(r.stressDsr)}%</strong>가 한도({fmtPct(dsrLimitN)}%)를 초과합니다. 대출 금액을 줄이거나 만기를 늘려야 합니다.</>}
        </p>
      </div>

      {/* LTV 결과 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>LTV (담보인정비율)</span>
          <span className={s.cardHint}>한도 {fmtPct(ltvLimitN)}%</span>
        </div>
        <div className={s.gauge}>
          <div className={s.gaugeFill} style={{ width: `${Math.min(100, r.ltv)}%`, background: r.ltv <= ltvLimitN ? '#059669' : '#DC2626' }} />
          <div className={s.gaugeLimit} style={{ left: `${Math.min(100, ltvLimitN)}%` }} />
        </div>
        <div className={s.gaugeLabel}><span>현재 희망대출 LTV</span><span className={ltvStatus}>{fmtPct(r.ltv)}%</span></div>
        <div className={s.resultGrid} style={{ marginTop: 10 }}>
          <div className={s.resRow}>
            <span className={s.resName}>LTV 한도 내 최대 대출</span>
            <span className={s.resVal}>{fmtManwon(r.ltvMaxLoan)}</span>
          </div>
        </div>
        <p className={s.note}>
          {r.ltv <= ltvLimitN
            ? <>✅ LTV <strong>{fmtPct(r.ltv)}%</strong>로 한도({fmtPct(ltvLimitN)}%) 이내입니다.</>
            : <>⚠️ LTV <strong className={s.statusOver}>{fmtPct(r.ltv)}%</strong>가 한도를 초과합니다. 담보 대비 대출이 과합니다.</>}
        </p>
      </div>

      {/* 규제 파라미터 (수정) */}
      <details className={s.advanced}>
        <summary>규제 기준값 직접 수정 (DSR 한도·LTV 한도·스트레스 금리)</summary>
        <div className={s.inputGrid} style={{ marginTop: 4 }}>
          <div className={s.field}>
            <label className={s.fieldLabel}>DSR 한도 <span className={s.fieldHint}>은행 40 / 2금융 50</span></label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="decimal" value={dsrLimit} onChange={e => setDsrLimit(e.target.value)} />
              <span className={s.unit}>%</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>LTV 한도 <span className={s.fieldHint}>비규제 70 / 생애최초 80</span></label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="decimal" value={ltvLimit} onChange={e => setLtvLimit(e.target.value)} />
              <span className={s.unit}>%</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>기준 스트레스 금리 <span className={s.fieldHint}>하한 1.5 ~ 상한 3.0</span></label>
            <div className={s.inputRow}>
              <input className={s.numInput} inputMode="decimal" value={baseStress} onChange={e => setBaseStress(e.target.value)} />
              <span className={s.unit}>%p</span>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>스트레스 단계</label>
            <div className={s.segRow}>
              {STRESS_PHASES.map(p => (
                <button key={p.id} type="button" className={`${s.segBtn} ${phase === p.id ? s.segBtnActive : ''}`} onClick={() => setPhase(p.id)}>
                  {p.id}단계
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className={s.note}>
          ⓘ 적용 스트레스 금리 = 기준({fmtPct(num(baseStress))}%p) × 단계율({STRESS_PHASES.find(p => p.id === phase)?.ratio}) × 유형율({RATE_TYPE_LABEL[rateType]}) = <strong>+{fmtPct(stressAddPct)}%p</strong>.
          기본값은 2025~2026년 일반 기준 추정이며 정책 변경 시 달라집니다.
        </p>
      </details>
    </div>
  )
}
