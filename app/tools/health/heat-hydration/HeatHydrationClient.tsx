'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  ACTIVITIES, HEAT_STAGES, RESTRICT_CONDITIONS,
  WEIGHT_MIN_KG, WEIGHT_MAX_KG, HOURS_MAX, HOURLY_ABSORB_CAP_L, DAILY_MAX_L,
  MEASURE_HOURS_MIN, MEASURE_HOURS_MAX,
  calcHydration, calcSweatRate,
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
  const [measureHours, setMeasureHours] = useState('1')

  const weightNum = parseFloat(weight) || 0
  const weightOutOfRange = weightNum > 0 && (weightNum < WEIGHT_MIN_KG || weightNum > WEIGHT_MAX_KG)
  const valid = weightNum > 0 && !weightOutOfRange
  const hoursNum = parseFloat(hours) || 0
  const hoursOver = hoursNum > HOURS_MAX

  const activity = ACTIVITIES.find((a) => a.id === activityId) ?? ACTIVITIES[0]
  const stage = HEAT_STAGES.find((h) => h.id === stageId) ?? HEAT_STAGES[0]

  const result = useMemo(() => {
    if (!valid) return null
    return calcHydration(weightNum, activity, hoursNum, stage)
  }, [valid, weightNum, activity, hoursNum, stage])

  // 실측 발한율 = (전 - 후 + 마신량) / 측정 운동 시간 — 하루 활동 시간과 별개로 입력
  const measureHoursNum = parseFloat(measureHours)
  const measureHoursBad = measureHours.trim() !== '' &&
    (!isFinite(measureHoursNum) || measureHoursNum < MEASURE_HOURS_MIN || measureHoursNum > MEASURE_HOURS_MAX)
  const sweatRate = useMemo(
    () => calcSweatRate(parseFloat(before), parseFloat(after), parseFloat(drank) || 0, measureHoursNum),
    [before, after, drank, measureHoursNum],
  )

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
                onChange={(e) => setHours(e.target.value)} aria-label="야외·활동 시간(시간)"
                aria-invalid={hoursOver || undefined} aria-describedby={hoursOver ? 'hy-hours-err' : undefined} />
              <span className={s.hoursUnit}>시간</span>
            </div>
          </div>
        )}
        {activity.needHours && hoursOver && (
          <p id="hy-hours-err" className={s.stageCriteria}>하루 활동 시간은 최대 {HOURS_MAX}시간까지만 반영합니다.</p>
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
          <p className={s.resultLabel}>오늘 마실 수분 목표</p>
          <p className={s.hero}>
            {fmt(result.totalLo, 1) === fmt(result.totalHi, 1) ? fmt(result.totalHi, 1) : `${fmt(result.totalLo, 1)}~${fmt(result.totalHi, 1)}`}<span className={s.heroUnit}>L</span>
          </p>
          <p className={s.resultSub}>
            기본 {ml(result.baseLo)}~{ml(result.baseHi)}mL
            {result.addHi > 0 && <> + 활동 보충 {ml(result.addLo)}~{ml(result.addHi)}mL</>}
            {result.dailyCapped && <> (하루 상한 {fmt(DAILY_MAX_L, 1)}L 적용)</>}
          </p>

          {result.addHi > 0 && (
            <div className={s.infoBox}>
              <p className={s.infoTitle}>💧 활동 중 음용 패턴</p>
              <p className={s.infoBody}>
                운동·작업 중에는 <strong>시간당 {ml(result.hourlyLo) === ml(result.hourlyHi) ? ml(result.hourlyHi) : `${ml(result.hourlyLo)}~${ml(result.hourlyHi)}`}mL</strong>를
                <strong> 15~20분마다 한 컵(약 150~250mL)씩</strong> 나눠 마시세요.
                {result.hourlyCapped && ` 이 활동은 땀이 시간당 ${fmt(HOURLY_ABSORB_CAP_L, 1)}L보다 많이 날 수 있지만, 그 이상 마셔도 흡수되지 않고 배탈·저나트륨혈증 위험만 커집니다. 모자라는 양은 활동이 끝난 뒤 줄어든 체중의 약 1.5배(1kg 줄었다면 물 약 1.5L)를 몇 시간에 걸쳐 나눠 채우세요.`}
              </p>
            </div>
          )}

          {result.totalHi >= 10 && (
            <div className={s.infoBox}>
              <p className={s.infoTitle}>⏱️ 장시간 작업이라면</p>
              <p className={s.infoBody}>
                {result.dailyCapped ? (
                  <>
                    하루에 <strong>약 {fmt(DAILY_MAX_L, 1)}L 넘게 마시는 것은 권하지 않기 때문에</strong>(미 육군 열손상 예방 지침 TB MED 507) 목표를 이 상한에서 멈췄습니다.
                    시간당 양을 하루 종일 이어 가면 상한을 넘게 되니, 모자라는 수분은 더 마셔서 채우기보다 <strong>작업 시간을 줄이고 그늘 휴식을 늘려</strong> 땀 손실 자체를 줄이세요.
                    작업이 끝난 뒤 남은 부족분은 식사와 음료로 천천히 채우세요.
                  </>
                ) : (
                  <>목표량이 10L를 넘는 것은 긴 시간 땀을 많이 흘리는 상황을 가정했기 때문입니다. 이런 날은 마시는 양을 더 늘리기보다 <strong>작업 시간을 줄이고 그늘 휴식을 자주</strong> 갖는 것이 먼저이며, 물과 스포츠음료를 나눠 마시세요.</>
                )}
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
            ⚠️ <strong>물만 과다 섭취는 위험</strong>합니다. 흡수 한계(시간당 약 {fmt(HOURLY_ABSORB_CAP_L, 1)}L)를 넘겨 마시면 혈중 나트륨이 묽어지는 <strong>저나트륨혈증</strong>(두통·구역·경련)이 생길 수 있어요. 갈증에 맞춰 <strong>조금씩 자주</strong>가 원칙입니다.
          </div>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.emptyNote}>
            {weightOutOfRange
              ? `체중은 ${WEIGHT_MIN_KG}~${WEIGHT_MAX_KG}kg 사이로 입력하세요.`
              : '체중을 입력하면 오늘 활동·폭염 단계에 맞는 권장 수분량을 계산합니다.'}
          </p>
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
            <div className={s.measureField}>
              <label className={s.measureLabel} htmlFor="hy-mhours">운동 시간</label>
              <div className={s.measureInputWrap}>
                <input id="hy-mhours" type="number" inputMode="decimal" min={MEASURE_HOURS_MIN} max={MEASURE_HOURS_MAX} step={0.25}
                  className={s.measureInput}
                  value={measureHours} onChange={(e) => setMeasureHours(e.target.value)} aria-label="측정한 운동 시간(시간)" placeholder="1"
                  aria-invalid={measureHoursBad || undefined} aria-describedby={measureHoursBad ? 'hy-mhours-err' : undefined} />
                <span className={s.measureUnit}>시간</span>
              </div>
            </div>
          </div>
          {measureHoursBad && (
            <p id="hy-mhours-err" className={s.measureWarn}>운동 시간은 {MEASURE_HOURS_MIN}~{MEASURE_HOURS_MAX}시간 사이로 입력하세요.</p>
          )}
          {sweatRate && (
            <div className={s.measureResult} role="status">
              시간당 발한율 <strong>{fmt(sweatRate.rate, 2)} L/h</strong>
              <span className={s.measureResultSub}>총 {fmt(sweatRate.total, 2)}L 손실 · 운동 {measureHoursNum}시간 기준</span>
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
        수분 목표는 체중 비례 어림식(30~33mL/kg)에 활동 발한(ACSM 범위, 시간당 흡수 한계 {fmt(HOURLY_ABSORB_CAP_L, 1)}L까지)을 더한 추정치입니다. 폭염기 여유를 두어 한국인 영양소 섭취기준의 액체 충분섭취량보다 넉넉하게 잡았으며, 개인 체질·약물·질환에 따라 달라집니다. 어지럼·근육경련·의식저하 등 온열질환 의심 시 즉시 시원한 곳으로 옮기고 119에 신고하세요.
      </Disclaimer>
    </div>
  )
}
