'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  ACTIVITIES, HEAT_STAGES, RESTRICT_CONDITIONS,
  calcHydration,
} from './hydrationData'
import s from './heat-hydration.module.css'

export default function HeatHydrationClient() {
  const [weight, setWeight] = useState('65')
  const [activityId, setActivityId] = useState('outdoor')
  const [hours, setHours] = useState('2')
  const [stageId, setStageId] = useState('warn')
  const [restricted, setRestricted] = useState(false)

  // 실측 발한량 (선택)
  const [before, setBefore] = useState('')
  const [after, setAfter] = useState('')
  const [drank, setDrank] = useState('')

  const weightNum = parseFloat(weight) || 0
  const valid = weightNum > 0

  const activity = ACTIVITIES.find((a) => a.id === activityId) ?? ACTIVITIES[0]
  const stage = HEAT_STAGES.find((h) => h.id === stageId) ?? HEAT_STAGES[0]

  const result = useMemo(() => {
    if (!valid) return null
    return calcHydration(weightNum, activity, parseFloat(hours) || 0, stage)
  }, [valid, weightNum, activity, hours, stage])

  // 실측 발한율 = (전 - 후 + 마신량) / 시간
  const sweatRate = useMemo(() => {
    const b = parseFloat(before), af = parseFloat(after), d = parseFloat(drank) || 0, h = parseFloat(hours) || 0
    if (!isFinite(b) || !isFinite(af) || h <= 0) return null
    const lossKg = b - af + d          // kg ≈ L (땀 손실 + 마신 물)
    if (lossKg <= 0) return null
    return { rate: lossKg / h, total: lossKg }
  }, [before, after, drank, hours])

  const fmt = (n: number, d = 2) => n.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d })
  const ml = (l: number) => Math.round(l * 1000).toLocaleString('ko-KR')

  return (
    <div className={s.wrap}>
      {/* 체중 */}
      <div className={s.card}>
        <label className={s.fieldLabel} htmlFor="hy-weight">체중</label>
        <div className={s.inputRow}>
          <input id="hy-weight" type="number" inputMode="decimal" min={0} step={1}
            className={s.input} value={weight}
            onChange={(e) => setWeight(e.target.value)} aria-label="체중(kg)" />
          <span className={s.unit}>kg</span>
        </div>
      </div>

      {/* 활동 상황 */}
      <div className={s.card}>
        <p className={s.groupLabel}>오늘의 활동</p>
        <div className={s.btnCol}>
          {ACTIVITIES.map((a) => (
            <button key={a.id} type="button"
              aria-pressed={activityId === a.id}
              className={`${s.optBtn} ${activityId === a.id ? s.optBtnActive : ''}`}
              onClick={() => setActivityId(a.id)}>
              <span className={s.optName}>{a.name}</span>
              <span className={s.optNote}>{a.desc}</span>
            </button>
          ))}
        </div>
        {activity.needHours && (
          <div className={s.hoursRow}>
            <label className={s.hoursLabel} htmlFor="hy-hours">야외·활동 시간</label>
            <div className={s.hoursInputWrap}>
              <input id="hy-hours" type="number" inputMode="decimal" min={0} max={16} step={0.5}
                className={s.hoursInput} value={hours}
                onChange={(e) => setHours(e.target.value)} aria-label="야외·활동 시간(시간)" />
              <span className={s.hoursUnit}>시간</span>
            </div>
          </div>
        )}
      </div>

      {/* 폭염 단계 */}
      <div className={s.card}>
        <p className={s.groupLabel}>폭염 특보 단계 <span className={s.groupSub}>(기상청 2026 개편)</span></p>
        <div className={s.stageGrid}>
          {HEAT_STAGES.map((h) => (
            <button key={h.id} type="button"
              aria-pressed={stageId === h.id}
              className={`${s.stageBtn} ${stageId === h.id ? s.stageBtnActive : ''} ${s['stage_' + h.id]}`}
              onClick={() => setStageId(h.id)}>
              {h.name}
            </button>
          ))}
        </div>
        <p className={s.stageCriteria}>{stage.criteria}</p>
      </div>

      {/* 취약군 */}
      <div className={s.card}>
        <label className={s.checkRow}>
          <input type="checkbox" checked={restricted}
            onChange={(e) => setRestricted(e.target.checked)} className={s.check} />
          <span className={s.checkText}>
            <strong>수분 제한이 필요할 수 있어요</strong> — {RESTRICT_CONDITIONS.join(' · ')} 중 하나에 해당
          </span>
        </label>
      </div>

      {/* 결과 */}
      {restricted ? (
        <div className={s.warnCard} role="status">
          <p className={s.warnTitle}>⚠️ 계산 대신 주치의 상담이 필요합니다</p>
          <p className={s.warnBody}>
            만성콩팥병·심부전·투석·이뇨제 복용 중이면 오히려 <strong>수분을 제한</strong>해야 할 수 있어, 일반적인 수분 섭취 권장이 위험할 수 있습니다.
            폭염 시 수분량은 반드시 <strong>주치의·의료진과 상의</strong>해 정하세요. 어지럼·부종·호흡곤란이 있으면 즉시 진료받으세요.
          </p>
        </div>
      ) : result ? (
        <div className={s.resultCard} role="status">
          <p className={s.resultLabel}>오늘 권장 수분 (음료 기준)</p>
          <p className={s.hero}>
            {fmt(result.totalLo, 1)}~{fmt(result.totalHi, 1)}<span className={s.heroUnit}>L</span>
          </p>
          <p className={s.resultSub}>
            기본 {ml(result.baseLo)}~{ml(result.baseHi)}mL
            {result.addHi > 0 && <> + 활동 보충 {ml(result.addLo)}~{ml(result.addHi)}mL</>}
          </p>

          {result.addHi > 0 && (
            <div className={s.infoBox}>
              <p className={s.infoTitle}>💧 활동 중 음용 패턴</p>
              <p className={s.infoBody}>
                운동·작업 중에는 <strong>시간당 {ml(result.hourlyLo)}~{ml(result.hourlyHi)}mL</strong>를
                <strong> 15~20분마다 한 컵(약 150~250mL)씩</strong> 나눠 마시세요.
                {result.hourlyCapped && ' 한 번에 많이 마셔도 흡수되지 않고 배탈·저나트륨혈증 위험만 커집니다.'}
              </p>
            </div>
          )}

          {result.needElectrolyte && (
            <div className={s.infoBox}>
              <p className={s.infoTitle}>🧂 전해질(나트륨)은 이럴 때만</p>
              <p className={s.infoBody}>
                <strong>1시간 이상 땀을 많이 흘리는 활동</strong>이라면 물 대신 <strong>스포츠음료(전해질 음료)</strong>를 일부 섞어 마시는 것을 고려하세요.
                짧은 활동이나 일상에서는 <strong>물이면 충분</strong>하며, 소금을 따로 먹을 필요는 없습니다(한국인은 나트륨 섭취가 이미 많음).
                <br /><span className={s.srcInline}>근거: ACSM Exercise and Fluid Replacement</span>
              </p>
            </div>
          )}

          <div className={s.cautionBox}>
            ⚠️ <strong>물만 과다 섭취는 위험</strong>합니다. 짧은 시간에 너무 많이(시간당 1L 이상) 마시면 혈중 나트륨이 묽어지는 <strong>저나트륨혈증</strong>(두통·구역·경련)이 생길 수 있어요. 갈증에 맞춰 <strong>조금씩 자주</strong>가 원칙입니다.
          </div>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.emptyNote}>체중을 입력하면 오늘 활동·폭염 단계에 맞는 권장 수분량을 계산합니다.</p>
        </div>
      )}

      {/* 폭염 단계 행동요령 */}
      {stage.id !== 'none' && (
        <div className={`${s.actionCard} ${s['action_' + stage.id]}`}>
          <p className={s.actionTitle}>{stage.name} 행동요령</p>
          <ul className={s.actionList}>
            {stage.action.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
          {stage.rest && <p className={s.actionRest}>🏭 {stage.rest}</p>}
        </div>
      )}

      {/* 실측 발한율 (선택) */}
      <details className={s.measureCard}>
        <summary className={s.measureSummary}>💦 내 발한율 직접 재보기 (운동 전후 체중)</summary>
        <div className={s.measureBody}>
          <p className={s.measureIntro}>
            운동 전후 체중과 마신 물을 넣으면 시간당 땀 손실을 계산합니다. 러너·등산객이 대회 준비 시 수분 전략을 세울 때 유용해요.
          </p>
          <div className={s.measureRow}>
            <div className={s.measureField}>
              <label className={s.measureLabel} htmlFor="hy-before">운동 전</label>
              <div className={s.measureInputWrap}>
                <input id="hy-before" type="number" inputMode="decimal" className={s.measureInput}
                  value={before} onChange={(e) => setBefore(e.target.value)} aria-label="운동 전 체중(kg)" placeholder="65.0" />
                <span className={s.measureUnit}>kg</span>
              </div>
            </div>
            <div className={s.measureField}>
              <label className={s.measureLabel} htmlFor="hy-after">운동 후</label>
              <div className={s.measureInputWrap}>
                <input id="hy-after" type="number" inputMode="decimal" className={s.measureInput}
                  value={after} onChange={(e) => setAfter(e.target.value)} aria-label="운동 후 체중(kg)" placeholder="64.2" />
                <span className={s.measureUnit}>kg</span>
              </div>
            </div>
            <div className={s.measureField}>
              <label className={s.measureLabel} htmlFor="hy-drank">마신 물</label>
              <div className={s.measureInputWrap}>
                <input id="hy-drank" type="number" inputMode="decimal" className={s.measureInput}
                  value={drank} onChange={(e) => setDrank(e.target.value)} aria-label="운동 중 마신 물(L)" placeholder="0.5" />
                <span className={s.measureUnit}>L</span>
              </div>
            </div>
          </div>
          {sweatRate && (
            <div className={s.measureResult} role="status">
              시간당 발한율 <strong>{fmt(sweatRate.rate, 2)} L/h</strong>
              <span className={s.measureResultSub}>총 {fmt(sweatRate.total, 2)}L 손실 · {parseFloat(hours) || 0}시간 기준</span>
              {sweatRate.rate > 2 && <span className={s.measureWarn}>발한율이 매우 높습니다 — 무리한 활동은 피하고 자주 보충하세요.</span>}
            </div>
          )}
        </div>
      </details>

      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/bmr', label: '기초대사량 계산기' },
          { href: '/tools/sports/carb-loading', label: '카보로딩 계산기' },
          { href: '/tools/health/caffeine', label: '카페인 잔존량 트래커' },
        ]}
        sources={[
          { label: '질병관리청 온열질환 예방', href: 'https://www.kdca.go.kr' },
          { label: '기상청 폭염 특보 기준', href: 'https://www.weather.go.kr' },
        ]}
      >
        수분 권장량은 체중 비례 관행 기준(음료 30~33mL/kg)에 활동 발한(ACSM 범위)을 더한 추정치입니다. 총수분은 음식 속 수분이 별도로 포함되며, 개인 체질·약물·질환에 따라 달라집니다. 어지럼·근육경련·의식저하 등 온열질환 의심 시 즉시 시원한 곳으로 옮기고 119에 신고하세요.
      </Disclaimer>
    </div>
  )
}
