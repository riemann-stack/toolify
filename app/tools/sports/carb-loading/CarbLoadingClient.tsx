'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import { RACE_TYPES, FOODS, calcCarbLoading, foodEquivalent } from './carbLoadingData'
import s from './carb-loading.module.css'

export default function CarbLoadingClient() {
  const [weight, setWeight] = useState('65')
  const [raceId, setRaceId] = useState('long')

  const weightNum = parseFloat(weight) || 0
  const valid = weightNum > 0
  const race = RACE_TYPES.find((r) => r.id === raceId) ?? RACE_TYPES[0]

  const plan = useMemo(() => (valid ? calcCarbLoading(weightNum, race) : null), [valid, weightNum, race])
  const dailyMid = plan ? (plan.dailyLo + plan.dailyHi) / 2 : 0

  const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR')

  return (
    <div className={s.wrap}>
      {/* 체중 */}
      <div className={s.card}>
        <label className={s.fieldLabel} htmlFor="cl-weight">체중</label>
        <div className={s.inputRow}>
          <input id="cl-weight" type="number" inputMode="decimal" min={0} step={1}
            className={s.input} value={weight}
            onChange={(e) => setWeight(e.target.value)} aria-label="체중(kg)" />
          <span className={s.unit}>kg</span>
        </div>
      </div>

      {/* 대회 유형 */}
      <div className={s.card}>
        <p className={s.groupLabel}>대회·활동 유형</p>
        <div className={s.btnCol}>
          {RACE_TYPES.map((r) => (
            <button key={r.id} type="button"
              aria-pressed={raceId === r.id}
              className={`${s.optBtn} ${raceId === r.id ? s.optBtnActive : ''}`}
              onClick={() => setRaceId(r.id)}>
              <span className={s.optName}>{r.name}</span>
              <span className={s.optNote}>{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {plan ? (
        <div className={s.resultCard} role="status">
          <p className={s.resultLabel}>하루 탄수화물 목표 ({race.days === 2 ? '대회 전 2일간' : '대회 전날'})</p>
          <p className={s.hero}>
            {fmt(plan.dailyLo)}~{fmt(plan.dailyHi)}<span className={s.heroUnit}>g / 일</span>
          </p>
          <p className={s.resultSub}>
            체중 {weightNum}kg × {race.perKg[0]}~{race.perKg[1]} g/kg (IOC·ACSM 권고 범위)
          </p>

          <div className={s.splitBox}>
            <div className={s.splitRow}>
              <span className={s.splitKey}>끼니당 (3끼 + 간식 1회 분할)</span>
              <span className={s.splitVal}>{fmt(plan.perMealLo)}~{fmt(plan.perMealHi)}g</span>
            </div>
            <div className={s.splitRow}>
              <span className={s.splitKey}>대회 아침 (시작 1~4시간 전)</span>
              <span className={s.splitVal}>{fmt(plan.morningLo)}~{fmt(plan.morningHi)}g</span>
            </div>
          </div>

          {/* 음식 환산 */}
          <div className={s.foodBox}>
            <p className={s.foodTitle}>🍚 하루 목표 {fmt(dailyMid)}g, 음식으로 환산하면</p>
            <p className={s.foodIntro}>한 가지 음식만으로 다 채운다면 이만큼 — 실제로는 섞어서 채웁니다.</p>
            <div className={s.foodList}>
              {FOODS.map((f) => (
                <div key={f.name} className={s.foodRow}>
                  <span className={s.foodName}>{f.name}</span>
                  <span className={s.foodCarb}>{f.carb}g</span>
                  <span className={s.foodCount}>× {foodEquivalent(dailyMid, f).toFixed(1)}</span>
                </div>
              ))}
            </div>
            <p className={s.foodNote}>탄수화물량은 통용 근사값 — 제품·조리법에 따라 달라집니다.</p>
          </div>

          <div className={s.cautionBox}>
            ⚠️ 로딩 중 <strong>체중이 다소 늘어나는 것은 흔한 반응</strong>입니다(글리코겐이 저장될 때 수분을 함께 끌어들이기 때문). 당뇨 등 혈당 관리가 필요한 질환이 있으면 로딩 전 반드시 주치의와 상의하세요.
          </div>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.emptyNote}>체중을 입력하면 대회 유형별 하루 탄수화물 목표와 음식 환산량을 계산합니다.</p>
        </div>
      )}

      {/* 날짜별 플랜 */}
      <div className={s.card}>
        <p className={s.groupLabel}>📅 대회까지 날짜별 플랜 {race.days === 2 ? '(풀코스 기준)' : ''}</p>
        <div className={s.timeline}>
          {race.days === 2 && (
            <div className={s.dayRow}>
              <span className={s.dayTag}>D-2</span>
              <div className={s.dayBody}>
                <strong className={s.dayTitle}>로딩 시작</strong>
                <span className={s.dayDesc}>목표량 섭취 시작 · 훈련은 가볍게(20~30분 조깅 이하) · 지방·식이섬유 줄이기</span>
              </div>
            </div>
          )}
          <div className={s.dayRow}>
            <span className={s.dayTag}>D-1</span>
            <div className={s.dayBody}>
              <strong className={s.dayTitle}>{race.days === 2 ? '로딩 지속' : '충전'}</strong>
              <span className={s.dayDesc}>목표량 유지 · 익숙한 음식만 · 늦은 저녁 과식 금지 · 수분 충분히</span>
            </div>
          </div>
          <div className={s.dayRow}>
            <span className={s.dayTag}>당일</span>
            <div className={s.dayBody}>
              <strong className={s.dayTitle}>대회 아침</strong>
              <span className={s.dayDesc}>시작 1~4시간 전 체중×1~4g (가까울수록 적게) · 새로운 음식 절대 금지</span>
            </div>
          </div>
        </div>
      </div>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/sports/race-plan', label: '레이스 페이스 플래너' },
          { href: '/tools/health/heat-hydration', label: '폭염 수분·전해질 계산기' },
          { href: '/tools/sports/race-predictor', label: '마라톤 기록 계산기' },
        ]}
        sources={[
          { label: 'ACSM — Nutrition and Athletic Performance', href: 'https://www.acsm.org' },
        ]}
      >
        탄수화물 권고량(g/kg)은 IOC·ACSM 스포츠영양 합의 범위이며, 소화 능력·훈련량·질환에 따라 개인차가 큽니다. 당뇨·신장질환 등 식이 관리가 필요한 경우 주치의와 상의하세요.
      </Disclaimer>
    </div>
  )
}
