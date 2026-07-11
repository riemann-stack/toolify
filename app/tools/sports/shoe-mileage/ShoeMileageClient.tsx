'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import { MIDSOLES, LANDINGS, calcShoeLife, replaceDate } from './shoeMileageData'
import s from './shoe-mileage.module.css'

export default function ShoeMileageClient() {
  const [weekly, setWeekly] = useState('30')
  const [current, setCurrent] = useState('0')
  const [weight, setWeight] = useState('70')
  const [midsoleId, setMidsoleId] = useState('eva')
  const [landingId, setLandingId] = useState('mid')
  const [rotate, setRotate] = useState(false)

  const weeklyNum = parseFloat(weekly) || 0
  const midsole = MIDSOLES.find((m) => m.id === midsoleId) ?? MIDSOLES[0]
  const landing = LANDINGS.find((l) => l.id === landingId) ?? LANDINGS[1]

  const result = useMemo(
    () => calcShoeLife(midsole, parseFloat(weight) || 0, landing, rotate, parseFloat(current) || 0, weeklyNum),
    [midsole, weight, landing, rotate, current, weeklyNum],
  )

  const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR')
  const wornOut = result.remainKm <= 0

  return (
    <div className={s.wrap}>
      {/* 미드솔 소재 */}
      <div className={s.card}>
        <p className={s.groupLabel}>미드솔 소재</p>
        <div className={s.btnCol}>
          {MIDSOLES.map((m) => (
            <button key={m.id} type="button"
              aria-pressed={midsoleId === m.id}
              className={`${s.optBtn} ${midsoleId === m.id ? s.optBtnActive : ''}`}
              onClick={() => setMidsoleId(m.id)}>
              <span className={s.optName}>{m.name} <small className={s.optKm}>{m.range[0]}~{m.range[1]}km</small></span>
              <span className={s.optNote}>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 주간 거리 · 현재 누적 */}
      <div className={s.card}>
        <div className={s.dualRow}>
          <div className={s.dualField}>
            <label className={s.fieldLabel} htmlFor="sm-weekly">주간 러닝 거리</label>
            <div className={s.inputWrap}>
              <input id="sm-weekly" type="number" inputMode="decimal" min={0} step={5}
                className={s.input} value={weekly}
                onChange={(e) => setWeekly(e.target.value)} aria-label="주간 러닝 거리(km)" />
              <span className={s.unit}>km</span>
            </div>
          </div>
          <div className={s.dualField}>
            <label className={s.fieldLabel} htmlFor="sm-current">현재 신발 누적</label>
            <div className={s.inputWrap}>
              <input id="sm-current" type="number" inputMode="decimal" min={0} step={10}
                className={s.input} value={current}
                onChange={(e) => setCurrent(e.target.value)} aria-label="현재 신발 누적 거리(km)" />
              <span className={s.unit}>km</span>
            </div>
          </div>
        </div>
      </div>

      {/* 체중 · 착지 */}
      <div className={s.card}>
        <label className={s.fieldLabel} htmlFor="sm-weight">체중</label>
        <div className={s.inputWrap} style={{ marginBottom: 14 }}>
          <input id="sm-weight" type="number" inputMode="decimal" min={0} step={1}
            className={s.input} value={weight}
            onChange={(e) => setWeight(e.target.value)} aria-label="체중(kg)" />
          <span className={s.unit}>kg</span>
        </div>
        <p className={s.groupLabel}>착지 유형 <span className={s.subtle}>(영향 작음)</span></p>
        <div className={s.segRow} role="group" aria-label="착지 유형">
          {LANDINGS.map((l) => (
            <button key={l.id} type="button"
              aria-pressed={landingId === l.id}
              className={`${s.segBtn} ${landingId === l.id ? s.segBtnActive : ''}`}
              onClick={() => setLandingId(l.id)}>
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* 로테이션 */}
      <div className={s.card}>
        <label className={s.checkRow}>
          <input type="checkbox" checked={rotate}
            onChange={(e) => setRotate(e.target.checked)} className={s.check} />
          <span className={s.checkText}>
            <strong>2족 이상 번갈아 신어요</strong> — 미드솔이 회복할 시간이 생겨 수명이 늘어납니다(약 +15%)
          </span>
        </label>
      </div>

      {/* 결과 */}
      {weeklyNum > 0 || (parseFloat(current) || 0) > 0 ? (
        <div className={s.resultCard} role="status">
          <p className={s.resultLabel}>예상 수명</p>
          <p className={s.hero}>{fmt(result.lifespanKm)}<span className={s.heroUnit}>km</span></p>
          <p className={s.resultSub}>범위 {fmt(result.lifeLo)}~{fmt(result.lifeHi)}km · {midsole.name}</p>

          {wornOut ? (
            <div className={s.replaceBox} data-worn="true">
              <span className={s.replaceLabel}>교체 시기</span>
              <strong className={s.replaceVal}>지금 교체 권장</strong>
              <span className={s.replaceNote}>누적 {fmt(parseFloat(current) || 0)}km가 예상 수명을 넘었습니다</span>
            </div>
          ) : result.daysLeft !== null ? (
            <div className={s.replaceBox}>
              <span className={s.replaceLabel}>교체 예상일</span>
              <strong className={s.replaceVal}>{replaceDate(new Date(), result.daysLeft)}</strong>
              <span className={s.replaceNote}>
                남은 {fmt(result.remainKm)}km · 주 {fmt(weeklyNum)}km 기준 약 {Math.round(result.weeksLeft ?? 0)}주 후
              </span>
            </div>
          ) : (
            <div className={s.replaceBox}>
              <span className={s.replaceLabel}>남은 거리</span>
              <strong className={s.replaceVal}>{fmt(result.remainKm)}km</strong>
              <span className={s.replaceNote}>주간 거리를 입력하면 교체 예상일을 계산합니다</span>
            </div>
          )}

          <p className={s.signNote}>
            ⚠️ km는 참고일 뿐 — <strong>쿠션이 꺼진 느낌·아웃솔 마모·달린 뒤 관절 통증</strong>이 나타나면 수치와 상관없이 교체하세요.
          </p>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.emptyNote}>주간 거리나 현재 누적 거리를 입력하면 예상 수명과 교체 예상일을 계산합니다.</p>
        </div>
      )}

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/sports/pace', label: '러닝 페이스 계산기' },
          { href: '/tools/sports/carb-loading', label: '카보로딩 계산기' },
          { href: '/tools/sports/race-predictor', label: '마라톤 기록 계산기' },
        ]}
      >
        미드솔 소재별 기본 수명은 브랜드 가이드·러닝 문헌의 통용 범위(EVA 400~600·TPU/PEBA 500~700km)이며, 체중·착지·로테이션 보정은 관행 배수입니다. 실제 수명은 노면·주법·보관 상태에 따라 크게 달라지니 착화감으로 최종 판단하세요.
      </Disclaimer>
    </div>
  )
}
