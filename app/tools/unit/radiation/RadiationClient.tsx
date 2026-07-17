'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './radiation.module.css'
import {
  DOSE_UNITS, ABSORBED_UNITS, ACTIVITY_UNITS, RATE_UNITS,
  EXPOSURES, LIMITS, EMF_REFS,
  convertDose, convertAbsorbed, convertActivity, convertRate,
  type DoseUnit, type AbsorbedUnit, type ActivityUnit, type RateUnit,
} from './radiationData'

const STORAGE_KEY = 'youtil_radiation_v1'

const DOSE_PRESETS: { label: string; unit: DoseUnit; value: number }[] = [
  { label: '가슴 X-ray',      unit: 'msv', value: 0.1 },
  { label: 'CT 흉부',         unit: 'msv', value: 7 },
  { label: 'PET-CT 전신',     unit: 'msv', value: 25 },
  { label: '연간 자연 노출',  unit: 'msv', value: 3 },
  { label: '인천→뉴욕 편도',  unit: 'usv', value: 80 },
]

const RATE_PRESETS: { label: string; unit: RateUnit; value: number }[] = [
  { label: '자연 배경 (0.12 μSv/h)', unit: 'usv_h',    value: 0.12 },
  { label: '항공 (5 μSv/h)',         unit: 'usv_h',    value: 5 },
  { label: '한국 평균 (3 mSv/년)',    unit: 'msv_year', value: 3 },
  { label: '작업자 한도 (20 mSv/년)', unit: 'msv_year', value: 20 },
]

export default function RadiationClient() {
  // ─── 선량 (Dose) ─────────────────────────────────────
  const [doseUnit, setDoseUnit] = useState<DoseUnit>('msv')
  const [doseInput, setDoseInput] = useState('7')

  // ─── 흡수선량 (Absorbed) ─────────────────────────────
  const [absUnit, setAbsUnit] = useState<AbsorbedUnit>('gy')
  const [absInput, setAbsInput] = useState('1')

  // ─── 방사능 (Activity) ───────────────────────────────
  const [actUnit, setActUnit] = useState<ActivityUnit>('mbq')
  const [actInput, setActInput] = useState('100')

  // ─── 노출률 (Rate) ───────────────────────────────────
  const [rateUnit, setRateUnit] = useState<RateUnit>('usv_h')
  const [rateInput, setRateInput] = useState('0.12')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      // 단위 id는 반드시 enum 검증 — 오염된 값이면 convert*()의 find()!가 크래시
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (DOSE_UNITS.some((u) => u.id === j.doseUnit)) setDoseUnit(j.doseUnit)
      if (typeof j.doseInput === 'string') setDoseInput(j.doseInput)
      if (ABSORBED_UNITS.some((u) => u.id === j.absUnit)) setAbsUnit(j.absUnit)
      if (typeof j.absInput === 'string') setAbsInput(j.absInput)
      if (ACTIVITY_UNITS.some((u) => u.id === j.actUnit)) setActUnit(j.actUnit)
      if (typeof j.actInput === 'string') setActInput(j.actInput)
      if (RATE_UNITS.some((u) => u.id === j.rateUnit)) setRateUnit(j.rateUnit)
      if (typeof j.rateInput === 'string') setRateInput(j.rateInput)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ doseUnit, doseInput, absUnit, absInput, actUnit, actInput, rateUnit, rateInput }))
    } catch {}
  }, [doseUnit, doseInput, absUnit, absInput, actUnit, actInput, rateUnit, rateInput])

  const doseVal = Math.max(0, parseFloat(doseInput) || 0)
  const absVal  = Math.max(0, parseFloat(absInput) || 0)
  const actVal  = Math.max(0, parseFloat(actInput) || 0)
  const rateVal = Math.max(0, parseFloat(rateInput) || 0)

  // 비어있지 않은데 숫자가 아니거나 음수면 경고 (계산은 0으로 클램프됨)
  const badInput = (raw: string) => raw.trim() !== '' && (!isFinite(parseFloat(raw)) || parseFloat(raw) < 0)

  const doseResult = useMemo(() => convertDose(doseVal, doseUnit), [doseVal, doseUnit])
  const absResult  = useMemo(() => convertAbsorbed(absVal, absUnit), [absVal, absUnit])
  const actResult  = useMemo(() => convertActivity(actVal, actUnit), [actVal, actUnit])
  const rateResult = useMemo(() => convertRate(rateVal, rateUnit), [rateVal, rateUnit])

  // 현재 입력 선량을 mSv 로 통일 (비교용)
  const currentMSv = doseResult.msv

  const fmtSci = (n: number, digits = 3): string => {
    if (!isFinite(n) || n === 0) return '0'
    const abs = Math.abs(n)
    if (abs >= 1e15 || abs < 1e-6) return n.toExponential(digits)
    if (abs >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
    if (abs >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: digits })
    // 1 미만은 유효숫자 기준 — toFixed(3)가 0.0001을 "0.000"으로 뭉개는 것 방지
    return Number(n.toPrecision(digits)).toString()
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/unit/converter',  label: '단위 변환기' },
          { href: '/tools/unit/hardness',   label: '경도 변환기' },
          { href: '/tools/unit/viscosity',  label: '점도 변환기' },
        ]}
      >
        본 도구는 일반 가이드용 환산이며 의학·산업 현장의 정확한 측정·평가를 대체하지 않습니다. 일상 노출 비교는 평균 추정치 — 개인·기기·노출 시간에 따라 실측값이 다를 수 있어요. 후쿠시마·체르노빌 등 사고 관련 노출은 한국 원자력안전위원회·IAEA 공식 자료를 참조하세요.
      </Disclaimer>

      {/* ─── 1. 선량당량 (인체 영향) ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 유효선량 (인체 영향)</span>
        <div className={s.scaleGrid}>
          {DOSE_UNITS.map((u) => (
            <button key={u.id} type="button"
              className={`${s.scaleBtn} ${doseUnit === u.id ? s.scaleBtnActive : ''}`}
              aria-pressed={doseUnit === u.id}
              onClick={() => setDoseUnit(u.id)}>
              {u.name}
            </button>
          ))}
        </div>
        <div className={s.inputRow}>
          <input type="number" inputMode="decimal" step="0.001" min={0}
            className={s.input} aria-label="선량당량 값 입력"
            value={doseInput}
            onChange={(e) => setDoseInput(e.target.value)} />
          <span className={s.unit}>{DOSE_UNITS.find((u) => u.id === doseUnit)?.unit}</span>
        </div>
        {badInput(doseInput) && <p className={s.inputWarn} role="alert">0 이상의 숫자를 입력하세요 — 음수·문자는 0으로 계산돼요.</p>}
        <div className={s.presetRow}>
          {DOSE_PRESETS.map((p, i) => (
            <button key={i} type="button" className={s.presetBtn}
              onClick={() => { setDoseUnit(p.unit); setDoseInput(String(p.value)) }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className={s.resultGrid}>
          {DOSE_UNITS.map((u) => (
            <div key={u.id} className={`${s.resCard} ${doseUnit === u.id ? s.resCardInput : ''}`}>
              <div className={s.resName}>{u.name}</div>
              <div className={s.resValue}>{fmtSci(doseResult[u.id])}</div>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⓘ <strong>유효선량 (Effective Dose)</strong> — 방사선 종류·조직 가중치를 반영해 전신 위험으로 환산한 단위. CT·X-ray 비교와 법정 한도(연 1 mSv 등)가 모두 이 단위 기준.
          <code className={s.code}>1 Sv = 100 rem = 1,000 mSv = 1,000,000 μSv</code>
        </p>
      </div>

      {/* ─── 2. 흡수선량 (물질 흡수) ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>2. 흡수선량 (물질 흡수)</span>
        <div className={s.scaleGrid}>
          {ABSORBED_UNITS.map((u) => (
            <button key={u.id} type="button"
              className={`${s.scaleBtn} ${absUnit === u.id ? s.scaleBtnActive : ''}`}
              aria-pressed={absUnit === u.id}
              onClick={() => setAbsUnit(u.id)}>
              {u.name}
            </button>
          ))}
        </div>
        <div className={s.inputRow}>
          <input type="number" inputMode="decimal" step="0.01" min={0}
            className={s.input} aria-label="흡수선량 값 입력"
            value={absInput}
            onChange={(e) => setAbsInput(e.target.value)} />
          <span className={s.unit}>{ABSORBED_UNITS.find((u) => u.id === absUnit)?.unit}</span>
        </div>
        {badInput(absInput) && <p className={s.inputWarn} role="alert">0 이상의 숫자를 입력하세요 — 음수·문자는 0으로 계산돼요.</p>}
        <div className={s.resultGrid}>
          {ABSORBED_UNITS.map((u) => (
            <div key={u.id} className={`${s.resCard} ${absUnit === u.id ? s.resCardInput : ''}`}>
              <div className={s.resName}>{u.name}</div>
              <div className={s.resValue}>{fmtSci(absResult[u.id])}</div>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⓘ <strong>흡수선량 (Absorbed Dose)</strong> — 물질이 흡수한 에너지(J/kg). 방사선 치료·물리 측정에 사용.
          <code className={s.code}>1 Gy = 100 rad = 1,000 mGy</code>
        </p>
      </div>

      {/* ─── 3. 방사능 (활성도) ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>3. 방사능 (활성도, Activity)</span>
        <div className={s.scaleGrid}>
          {ACTIVITY_UNITS.map((u) => (
            <button key={u.id} type="button"
              className={`${s.scaleBtn} ${actUnit === u.id ? s.scaleBtnActive : ''}`}
              aria-pressed={actUnit === u.id}
              onClick={() => setActUnit(u.id)}>
              {u.name}
            </button>
          ))}
        </div>
        <div className={s.inputRow}>
          <input type="number" inputMode="decimal" step="0.01" min={0}
            className={s.input} aria-label="방사능 값 입력"
            value={actInput}
            onChange={(e) => setActInput(e.target.value)} />
          <span className={s.unit}>{ACTIVITY_UNITS.find((u) => u.id === actUnit)?.unit}</span>
        </div>
        {badInput(actInput) && <p className={s.inputWarn} role="alert">0 이상의 숫자를 입력하세요 — 음수·문자는 0으로 계산돼요.</p>}
        <div className={s.resultGrid}>
          {ACTIVITY_UNITS.map((u) => (
            <div key={u.id} className={`${s.resCard} ${actUnit === u.id ? s.resCardInput : ''}`}>
              <div className={s.resName}>{u.name}</div>
              <div className={s.resValue}>{fmtSci(actResult[u.id])}</div>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⓘ <strong>방사능 (Activity)</strong> — 초당 방사성 붕괴 횟수.
          <code className={s.code}>1 Bq = 1 붕괴/초 · 1 Ci = 3.7×10¹⁰ Bq</code>
          {' '}— 큐리(Ci)는 라듐 1g의 활성도에서 유래.
        </p>
      </div>

      {/* ─── 4. 노출률 ↔ 누적 ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>4. 노출률 ↔ 누적 (시간당·일·년 환산)</span>
        <div className={s.scaleGrid}>
          {RATE_UNITS.map((u) => (
            <button key={u.id} type="button"
              className={`${s.scaleBtn} ${rateUnit === u.id ? s.scaleBtnActive : ''}`}
              aria-pressed={rateUnit === u.id}
              onClick={() => setRateUnit(u.id)}>
              {u.name}
            </button>
          ))}
        </div>
        <div className={s.inputRow}>
          <input type="number" inputMode="decimal" step="0.001" min={0}
            className={s.input} aria-label="노출률 값 입력"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)} />
          <span className={s.unit}>{RATE_UNITS.find((u) => u.id === rateUnit)?.name}</span>
        </div>
        {badInput(rateInput) && <p className={s.inputWarn} role="alert">0 이상의 숫자를 입력하세요 — 음수·문자는 0으로 계산돼요.</p>}
        <div className={s.presetRow}>
          {RATE_PRESETS.map((p, i) => (
            <button key={i} type="button" className={s.presetBtn}
              onClick={() => { setRateUnit(p.unit); setRateInput(String(p.value)) }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className={s.resultGrid}>
          {RATE_UNITS.map((u) => (
            <div key={u.id} className={`${s.resCard} ${rateUnit === u.id ? s.resCardInput : ''}`}>
              <div className={s.resName}>{u.name}</div>
              <div className={s.resValue}>{fmtSci(rateResult[u.id])}</div>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⓘ 24시간 × 365일 연속 노출 기준. 실제 노출은 노출 시간·차폐 환경에 따라 달라집니다.
        </p>
      </div>

      {/* ─── 5. 일상 노출 비교 ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>
          일상 노출 비교
          <span className={s.cardHint}>입력 선량 {fmtSci(currentMSv, 4)} mSv 위치 강조</span>
        </span>
        <div className={s.expList}>
          {EXPOSURES.map((e, i) => {
            // ±30% 이내만 유사값으로 — 0.3(2배 폭)은 CT 7 입력에 6.2~12가 전부 잡혀 과광범위
            const isClose = currentMSv > 0 && Math.abs(Math.log10(e.mSv) - Math.log10(currentMSv)) < 0.11
            return (
              <div key={i} className={`${s.expRow} ${isClose ? s.expRowMatch : ''}`}>
                <span className={s.expEmoji}>{e.emoji}</span>
                <span className={s.expLabel}>{e.label}</span>
                <span className={s.expValue}>{fmtSci(e.mSv, 4)}<small>mSv</small></span>
                <span className={s.expCat}>
                  {e.cat === 'medical' ? '의료' :
                   e.cat === 'natural' ? '자연' :
                   e.cat === 'travel' ? '여행' :
                   e.cat === 'food' ? '음식' :
                   e.cat === 'occupation' ? '직업' :
                   e.cat === 'limit' ? '한도' :
                   '사고'}
                </span>
                {isClose && currentMSv > 0 && <span className={s.expBadge}>입력값 ≈</span>}
                {e.note && <span className={s.expNote}>{e.note}</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 6. 안전 한도 ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>⚠️ 안전 한도 (ICRP · 한국 원안위)</span>
        <div className={s.limitList}>
          {LIMITS.map((l, i) => {
            const exceeded = currentMSv > 0 && currentMSv >= l.mSv
            return (
              <div key={i} className={`${s.limitRow} ${exceeded ? s.limitRowDanger : ''}`}>
                <span className={s.limitWho}>{l.who}</span>
                <span className={s.limitValue}>{l.limit}</span>
                <span className={s.limitSource}>{l.source}</span>
                {exceeded && <span className={s.limitBadge}>입력값 ≥ 기준</span>}
              </div>
            )
          })}
        </div>
        <p className={s.note}>
          ⓘ 입력값과 기준의 <strong>크기 비교</strong>일 뿐, 위반 여부가 아닙니다. 선량한도는 계획된 인공 피폭의 관리 기준이라
          <strong> CT·X-ray 등 의료 피폭과 자연 방사선에는 적용되지 않아요</strong>(ICRP) — CT 7 mSv가 &lsquo;일반인 1 mSv&rsquo;보다 크다고 해서 규정 위반이 아닙니다.
        </p>
      </div>

      {/* ─── 7. 비이온화 EMF 별도 섹션 ─── */}
      <div className={s.emfCard}>
        <div className={s.emfHead}>
          <strong>비이온화 전자파 (EMF) — 별도 영역</strong>
          <p>휴대폰·기지국·송전선·가전 등 일상 EMF는 위의 방사선 단위(Sv·Gy·Bq)와 <strong>물리적으로 다른 영역</strong>이라 직접 환산할 수 없어요. 참고용 측정값입니다.</p>
        </div>

        <div className={s.emfList}>
          {EMF_REFS.map((e, i) => (
            <div key={i} className={`${s.emfRow} ${s['emfCat_' + e.cat]}`}>
              <span className={s.emfEmoji}>{e.emoji}</span>
              <span className={s.emfLabel}>{e.label}</span>
              <span className={s.emfValue}>{e.value}</span>
              <span className={s.emfSource}>{e.source}</span>
            </div>
          ))}
        </div>

        <div className={s.emfFoot}>
          <strong>SAR · 자기장(μT) · 전계(V/m)</strong> — 세 단위는 측정 대상이 다릅니다. SAR은 인체 흡수율, μT는 자기장 강도, V/m는 전계 강도.
          한국 한도는 과기정통부 전자파인체보호기준(ICNIRP 1998 계열), 통신·송전 등 일상 노출 실측치는 대부분 한도 대비 수 % 이하입니다.
          다만 헤어드라이어처럼 몸에 밀착하는 기기는 순간 수치가 높게 측정될 수 있는데, 노출 시간이 매우 짧아 연속 노출 기준과는 성격이 다릅니다.
        </div>
      </div>
    </div>
  )
}
