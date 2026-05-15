/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './brew.module.css'
import {
  BREW_METHODS, RATIO_PRESETS, CUP_SIZES, ROASTS, INTENSITY_ZONES,
  type BrewMethod, type RoastLevel, type InputMode,
  getMethod, coffeeToWater, waterToCoffee,
  buildPourSchedule, getIntensity, fmtTime, fmt,
} from './brewUtils'

type Tab = 'ratio' | 'pour' | 'intensity' | 'cost'

const STORAGE_KEY = 'youtil_brew_v1'

export default function BrewClient() {
  const [tab, setTab] = useState<Tab>('ratio')

  /* 공통 */
  const [method, setMethod] = useState<BrewMethod>('drip')
  const [ratio, setRatio] = useState<number>(16)

  /* 탭 1: 비율 계산 */
  const [inputMode, setInputMode] = useState<InputMode>('coffee')
  const [coffeeG, setCoffeeG] = useState('20')
  const [waterMl, setWaterMl] = useState('320')
  const [cups, setCups] = useState('2')
  const [mlPerCup, setMlPerCup] = useState('250')

  /* 탭 3: 로스팅 */
  const [roast, setRoast] = useState<RoastLevel>('medium')

  /* 탭 4: 비용 */
  const [pricePer100g, setPricePer100g] = useState('25000')
  const [cafePrice, setCafePrice] = useState(4500)
  const [dailyCups, setDailyCups] = useState('1')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.method) setMethod(j.method)
      if (typeof j.ratio === 'number') setRatio(j.ratio)
      if (j.inputMode) setInputMode(j.inputMode)
      if (j.coffeeG) setCoffeeG(j.coffeeG)
      if (j.waterMl) setWaterMl(j.waterMl)
      if (j.cups) setCups(j.cups)
      if (j.mlPerCup) setMlPerCup(j.mlPerCup)
      if (j.roast) setRoast(j.roast)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        method, ratio, inputMode, coffeeG, waterMl, cups, mlPerCup, roast,
      }))
    } catch {}
  }, [method, ratio, inputMode, coffeeG, waterMl, cups, mlPerCup, roast])

  /* 추출법 변경 시 비율을 추출법 default로 */
  useEffect(() => {
    const m = getMethod(method)
    if (ratio < m.ratioMin || ratio > m.ratioMax + 8) {
      setRatio(m.ratioDefault)
    }
  }, [method, ratio])

  /* 계산 */
  const m = getMethod(method)
  const calcCoffee = useMemo(() => {
    if (inputMode === 'coffee') return parseFloat(coffeeG) || 0
    if (inputMode === 'water') return waterToCoffee(parseFloat(waterMl) || 0, ratio)
    // cups
    const w = (parseInt(cups) || 0) * (parseInt(mlPerCup) || 0)
    return waterToCoffee(w, ratio)
  }, [inputMode, coffeeG, waterMl, ratio, cups, mlPerCup])

  const calcWater = useMemo(() => {
    if (inputMode === 'coffee') return coffeeToWater(parseFloat(coffeeG) || 0, ratio)
    if (inputMode === 'water') return parseFloat(waterMl) || 0
    return (parseInt(cups) || 0) * (parseInt(mlPerCup) || 0)
  }, [inputMode, coffeeG, waterMl, ratio, cups, mlPerCup])

  const cupsCount = inputMode === 'cups'
    ? (parseInt(cups) || 0)
    : Math.max(1, Math.round(calcWater / (parseInt(mlPerCup) || 250)))
  const intensity = getIntensity(ratio)

  /* 푸어 스케줄 */
  const pourCoffee = parseFloat(coffeeG) || 20
  const pourWater = pourCoffee * ratio
  const schedule = useMemo(() => buildPourSchedule(pourCoffee, pourWater), [pourCoffee, pourWater])

  /* 비용 */
  const price100g = parseFloat(pricePer100g) || 0
  const dailyN = parseInt(dailyCups) || 1
  const homeCostPerCup = (calcCoffee / cupsCount) * (price100g / 100)
  const cafeSaving = (cafePrice - homeCostPerCup) * dailyN
  const monthlySaving = cafeSaving * 30
  const yearlySaving = cafeSaving * 365

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'ratio',     label: '⚖️ 비율 계산' },
          { id: 'pour',      label: '⏱️ 푸어 스케줄' },
          { id: 'intensity', label: '🎚️ 강도·로스팅' },
          { id: 'cost',      label: '💰 비용 비교' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 탭 1: 비율 계산 ════════ */}
      {tab === 'ratio' && (
        <>
          {/* 추출법 선택 */}
          <div className={s.card}>
            <span className={s.cardLabel}>추출법 선택</span>
            <div className={s.methodGrid}>
              {BREW_METHODS.map((bm) => (
                <button
                  key={bm.id}
                  className={`${s.methodBtn} ${method === bm.id ? s.methodBtnActive : ''}`}
                  onClick={() => setMethod(bm.id)}
                  type="button"
                >
                  <span className={s.methodEmoji}>{bm.emoji}</span>
                  <span className={s.methodLabel}>{bm.shortName}</span>
                  <span className={s.methodDesc}>1:{bm.ratioMin}~{bm.ratioMax} · {bm.tempMin}~{bm.tempMax}°C</span>
                </button>
              ))}
            </div>
          </div>

          {/* 비율 */}
          <div className={s.card}>
            <span className={s.cardLabel}>원두 : 물 비율</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>비율 프리셋</label>
              <div className={s.pillRow}>
                {RATIO_PRESETS.map((r) => (
                  <button
                    key={r}
                    className={`${s.pill} ${ratio === r ? s.pillActive : ''}`}
                    onClick={() => setRatio(r)}
                    type="button"
                  >
                    1:{r}{r === 15 && ' ⭐'}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel}>또는 직접 (1:{ratio.toFixed(1)})</label>
              <input
                type="range"
                min={5}
                max={25}
                step={0.5}
                value={ratio}
                onChange={(e) => setRatio(parseFloat(e.target.value))}
                className={s.slider}
              />
              <div className={s.helpText}>
                {intensity.emoji} <strong style={{ color: intensity.color }}>{intensity.label}</strong> — {intensity.desc}
              </div>
            </div>
          </div>

          {/* 입력 모드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>입력 방식</span>
            <div className={s.pillRow}>
              <button
                className={`${s.pill} ${inputMode === 'coffee' ? s.pillActive : ''}`}
                onClick={() => setInputMode('coffee')}
                type="button"
              >
                ☕ 원두 → 물
              </button>
              <button
                className={`${s.pill} ${inputMode === 'water' ? s.pillActive : ''}`}
                onClick={() => setInputMode('water')}
                type="button"
              >
                💧 물 → 원두
              </button>
              <button
                className={`${s.pill} ${inputMode === 'cups' ? s.pillActive : ''}`}
                onClick={() => setInputMode('cups')}
                type="button"
              >
                🥤 잔수 기준
              </button>
            </div>

            {inputMode === 'coffee' && (
              <div className={s.field} style={{ marginTop: 12 }}>
                <label className={s.fieldLabel}>원두 (g)</label>
                <input
                  type="number"
                  className={s.input}
                  value={coffeeG}
                  onChange={(e) => setCoffeeG(e.target.value)}
                  min={1} max={500} step={1}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[10, 15, 20, 30, 40].map((g) => (
                    <button key={g} className={s.pill} onClick={() => setCoffeeG(String(g))} type="button">
                      {g}g
                    </button>
                  ))}
                </div>
              </div>
            )}

            {inputMode === 'water' && (
              <div className={s.field} style={{ marginTop: 12 }}>
                <label className={s.fieldLabel}>물 (ml)</label>
                <input
                  type="number"
                  className={s.input}
                  value={waterMl}
                  onChange={(e) => setWaterMl(e.target.value)}
                  min={50} max={5000} step={10}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[200, 300, 500, 750, 1000].map((w) => (
                    <button key={w} className={s.pill} onClick={() => setWaterMl(String(w))} type="button">
                      {w}ml
                    </button>
                  ))}
                </div>
              </div>
            )}

            {inputMode === 'cups' && (
              <>
                <div className={s.row2} style={{ marginTop: 12 }}>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>잔수</label>
                    <input
                      type="number"
                      className={s.input}
                      value={cups}
                      onChange={(e) => setCups(e.target.value)}
                      min={1} max={20} step={1}
                    />
                    <div className={s.pillRow} style={{ marginTop: 8 }}>
                      {[1, 2, 3, 4, 6].map((c) => (
                        <button key={c} className={s.pill} onClick={() => setCups(String(c))} type="button">
                          {c}잔
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>1잔 ml</label>
                    <input
                      type="number"
                      className={s.input}
                      value={mlPerCup}
                      onChange={(e) => setMlPerCup(e.target.value)}
                      min={50} max={1000} step={10}
                    />
                    <div className={s.pillRow} style={{ marginTop: 8 }}>
                      {CUP_SIZES.map((c) => (
                        <button
                          key={c.id}
                          className={`${s.pill} ${parseInt(mlPerCup) === c.ml ? s.pillActive : ''}`}
                          onClick={() => setMlPerCup(String(c.ml))}
                          type="button"
                        >
                          {c.emoji} {c.ml}ml
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 메인 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>{m.emoji} {m.shortName} · 1:{ratio.toFixed(1)}</p>
            <div className={s.heroResult}>
              <div className={s.heroBlock}>
                <span className={s.heroBlockLabel}>원두</span>
                <strong className={s.heroBlockValue}>{fmt(calcCoffee, 1)} g</strong>
              </div>
              <div className={s.heroBlock}>
                <span className={s.heroBlockLabel}>물</span>
                <strong className={s.heroBlockValue}>{fmt(calcWater, 0)} ml</strong>
              </div>
              <div className={s.heroBlock}>
                <span className={s.heroBlockLabel}>잔수</span>
                <strong className={s.heroBlockValue}>{cupsCount}잔</strong>
              </div>
            </div>
          </div>

          {/* 추출법 상세 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{m.label} 추출 가이드</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>권장 비율</td><td className={s.cellMono}>1:{m.ratioMin}~1:{m.ratioMax} (default 1:{m.ratioDefault})</td></tr>
                  <tr><td>물 온도</td><td className={s.cellMono}>{m.tempMin}~{m.tempMax}°C</td></tr>
                  <tr><td>추출 시간</td><td className={s.cellMono}>{fmtTime(m.timeMin)} ~ {fmtTime(m.timeMax)}</td></tr>
                  <tr><td>분쇄도</td><td className={s.cellMono}>{m.grindEmoji} {m.grind}</td></tr>
                  <tr><td>TDS 권장</td><td className={s.cellMono}>{m.tdsMin}~{m.tdsMax}%</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>강도 진단</td></tr>
                  <tr><td>현재 비율 분석</td><td className={s.cellMono} style={{ color: intensity.color }}>{intensity.emoji} {intensity.label}</td></tr>
                </tbody>
              </table>
            </div>
            <div className={s.tipBox}>
              💡 <strong>추출 팁</strong> — {m.tip}
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 푸어 스케줄 ════════ */}
      {tab === 'pour' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>핸드드립·푸어오버 푸어 스케줄</span>
            <p className={s.helpText} style={{ marginBottom: 14 }}>
              표준 3푸어 방식 (Bloom → 1차 → 2차) 기준. V60·하리오·칼리타·케맥스에 공통 적용.
            </p>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>원두 (g)</label>
                <input
                  type="number"
                  className={s.input}
                  value={coffeeG}
                  onChange={(e) => setCoffeeG(e.target.value)}
                  min={5} max={100} step={1}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>비율 (1:N)</label>
                <input
                  type="number"
                  className={s.input}
                  value={ratio}
                  onChange={(e) => setRatio(parseFloat(e.target.value) || 16)}
                  min={10} max={20} step={0.5}
                />
              </div>
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>총 추출 정보</p>
            <p className={s.heroValue}>
              원두 <strong>{fmt(pourCoffee, 0)}g</strong> · 물 <strong>{fmt(pourWater, 0)}ml</strong>
            </p>
            <p className={s.heroSub}>총 시간 약 2:30~3:30</p>
          </div>

          {/* SVG 타임라인 */}
          <div className={s.card}>
            <span className={s.cardLabel}>타임라인 (0~210초)</span>
            <svg viewBox="0 0 420 80" width="100%" style={{ maxWidth: 600 }}>
              {schedule.map((step, i) => {
                const x1 = (step.startSec / 210) * 420
                const w = ((step.endSec - step.startSec) / 210) * 420
                return (
                  <g key={i}>
                    <rect x={x1} y={20} width={w - 1} height={28} fill={step.color} rx={3} />
                    <text x={x1 + w / 2} y={38} fill="#0D0D0D" fontSize="11" textAnchor="middle" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
                      {step.emoji}
                    </text>
                    <text x={x1 + w / 2} y={62} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">
                      {step.startSec}~{step.endSec}s
                    </text>
                  </g>
                )
              })}
              {/* 시간 눈금 */}
              {[0, 30, 60, 90, 120, 150, 180, 210].map((t) => (
                <g key={t}>
                  <line x1={(t / 210) * 420} y1={15} x2={(t / 210) * 420} y2={20} stroke="var(--muted)" strokeWidth="1" />
                  <text x={(t / 210) * 420} y={12} fill="var(--muted)" fontSize="8" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">{t}</text>
                </g>
              ))}
            </svg>
          </div>

          {/* 단계별 카드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>단계별 가이드</span>
            <div className={s.stepGrid}>
              {schedule.map((step, i) => (
                <div key={i} className={s.stepCard} style={{ borderLeftColor: step.color }}>
                  <p className={s.stepHead}>
                    <span className={s.stepEmoji}>{step.emoji}</span>
                    <strong>{step.label}</strong>
                    <span className={s.stepTime}>{step.startSec}~{step.endSec}s</span>
                  </p>
                  {step.waterMl > 0 ? (
                    <p className={s.stepWater}>
                      이 단계 물 <strong>{step.waterMl} ml</strong> · 누적{' '}
                      <strong className={s.cellAccent}>{step.cumulativeMl} ml</strong>
                    </p>
                  ) : (
                    <p className={s.stepWater}>물 추가 없이 자연 배수</p>
                  )}
                  <p className={s.stepDesc}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>⏱️ 푸어 팁</strong>
            <p>
              • <strong>블루밍</strong>: 신선한 원두는 부풀어 오름. 거품 안 나면 로스팅 일자 1주 이상 경과<br />
              • <strong>1차·2차 푸어</strong>: 가운데서 시계 방향 원형, 가장자리는 닿지 않게<br />
              • <strong>총 시간</strong>: 2:30 미만이면 분쇄가 너무 굵음, 3:30 초과면 너무 가늘음<br />
              • 케맥스는 1차 종료 시점 + 30초, V60은 표준대로 권장
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 강도·로스팅 ════════ */}
      {tab === 'intensity' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>비율 강도 진단</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>비율 (1:{ratio.toFixed(1)})</label>
              <input
                type="range"
                min={5}
                max={25}
                step={0.5}
                value={ratio}
                onChange={(e) => setRatio(parseFloat(e.target.value))}
                className={s.slider}
              />
            </div>

            {/* SVG 게이지 */}
            <svg viewBox="0 0 420 70" width="100%" style={{ marginTop: 12, maxWidth: 600 }}>
              <defs>
                <linearGradient id="intensityGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FF3E8C" />
                  <stop offset="30%" stopColor="#FFB83E" />
                  <stop offset="50%" stopColor="#3EFFD0" />
                  <stop offset="70%" stopColor="#3EC8FF" />
                  <stop offset="100%" stopColor="#9B9B9B" />
                </linearGradient>
              </defs>
              <rect x={0} y={20} width={420} height={26} rx={6} fill="url(#intensityGrad)" />
              {/* 슬라이더 위치 표시 (5~25 범위) */}
              <line
                x1={Math.min(((ratio - 5) / 20) * 420, 420)}
                y1={10}
                x2={Math.min(((ratio - 5) / 20) * 420, 420)}
                y2={56}
                stroke="var(--text)"
                strokeWidth="3"
              />
              <text
                x={Math.min(((ratio - 5) / 20) * 420, 420)}
                y={9}
                fill="var(--text)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="800"
              >
                ▼ 1:{ratio.toFixed(1)}
              </text>
              {/* 구간 레이블 */}
              {[
                { x: 50, label: '1:12' },
                { x: 145, label: '1:15 ⭐' },
                { x: 240, label: '1:17' },
                { x: 335, label: '1:20' },
              ].map((t, i) => (
                <text key={i} x={t.x} y={66} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">
                  {t.label}
                </text>
              ))}
            </svg>

            <div className={s.hero} style={{ marginTop: 12 }}>
              <p className={s.heroLabel}>현재 추출 강도</p>
              <p className={s.heroValue} style={{ color: intensity.color }}>
                {intensity.emoji} <strong>{intensity.label}</strong>
              </p>
              <p className={s.heroSub}>{intensity.desc}</p>
            </div>
          </div>

          {/* 5 zone 설명 */}
          <div className={s.card}>
            <span className={s.cardLabel}>강도 영역 5단계</span>
            <div className={s.zoneList}>
              {INTENSITY_ZONES.map((z) => (
                <div
                  key={z.id}
                  className={s.zoneRow}
                  style={{
                    borderLeftColor: z.color,
                    background: ratio >= z.ratioMin && ratio < z.ratioMax ? 'var(--bg2)' : 'transparent',
                  }}
                >
                  <span className={s.zoneEmoji}>{z.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p className={s.zoneLabel} style={{ color: z.color }}>
                      {z.label}{' '}
                      <span style={{ color: 'var(--muted)', fontWeight: 500, fontFamily: 'Inter, system-ui, sans-serif' }}>
                        1:{z.ratioMin}~{z.ratioMax >= 99 ? '∞' : z.ratioMax}
                      </span>
                    </p>
                    <p className={s.zoneDesc}>{z.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 로스팅 보정 */}
          <div className={s.card}>
            <span className={s.cardLabel}>로스팅 정도별 권장 비율</span>
            <div className={s.pillRow}>
              {ROASTS.map((r) => (
                <button
                  key={r.id}
                  className={`${s.pill} ${roast === r.id ? s.pillActive : ''}`}
                  onClick={() => setRoast(r.id)}
                  type="button"
                  style={{
                    borderColor: roast === r.id ? r.color : undefined,
                  }}
                >
                  {r.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className={s.hero} style={{ marginTop: 12 }}>
              <p className={s.heroLabel}>{ROASTS.find((r) => r.id === roast)!.label}</p>
              <p className={s.heroValue} style={{ color: ROASTS.find((r) => r.id === roast)!.color }}>
                <strong>{ROASTS.find((r) => r.id === roast)!.ratioAdjust}</strong>
              </p>
              <p className={s.heroSub}>{ROASTS.find((r) => r.id === roast)!.desc}</p>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>🌡️ 추출 변수 우선순위</strong>
            <p>
              비율보다 더 큰 영향을 주는 변수: ① <strong>원두 신선도(로스팅 일자 7~21일)</strong> ②{' '}
              <strong>분쇄도</strong> ③ <strong>물 온도</strong> ④ <strong>추출 시간</strong> ⑤ <strong>비율</strong>.
              <br />같은 비율이라도 신선한 원두 + 적절한 분쇄도가 훨씬 큰 차이를 만듭니다.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 비용 비교 ════════ */}
      {tab === 'cost' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>원두·카페 가격 입력</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>원두 100g 가격 (원)</label>
                <input
                  type="number"
                  className={s.input}
                  value={pricePer100g}
                  onChange={(e) => setPricePer100g(e.target.value)}
                  min={1000} max={200000} step={500}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[15000, 20000, 25000, 35000, 50000].map((p) => (
                    <button key={p} className={s.pill} onClick={() => setPricePer100g(String(p))} type="button">
                      {(p / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>카페 1잔 가격 (원)</label>
                <div className={s.pillRow}>
                  {[3500, 4500, 5500, 6500].map((p) => (
                    <button
                      key={p}
                      className={`${s.pill} ${cafePrice === p ? s.pillActive : ''}`}
                      onClick={() => setCafePrice(p)}
                      type="button"
                    >
                      {p.toLocaleString()}원
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={s.field} style={{ marginTop: 12 }}>
              <label className={s.fieldLabel}>1일 마시는 잔수</label>
              <div className={s.pillRow}>
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    className={`${s.pill} ${dailyN === d ? s.pillActive : ''}`}
                    onClick={() => setDailyCups(String(d))}
                    type="button"
                  >
                    {d}잔/일
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>홈브루 1잔 원가</p>
            <p className={s.heroValue}>
              <strong>{fmt(homeCostPerCup, 0)} 원</strong>
            </p>
            <p className={s.heroSub}>
              vs 카페 {cafePrice.toLocaleString()}원 ={' '}
              <strong style={{ color: 'var(--accent)' }}>
                1잔당 {fmt(cafePrice - homeCostPerCup, 0)}원 절감
              </strong>
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>절감액 시뮬레이션</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>원두 g당 단가</td><td className={s.cellMono}>{fmt(price100g / 100, 0)} 원/g</td></tr>
                  <tr><td>1잔 사용 원두</td><td className={s.cellMono}>{fmt(calcCoffee / cupsCount, 1)} g</td></tr>
                  <tr><td>홈브루 1잔 원가</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(homeCostPerCup, 0)} 원</td></tr>
                  <tr><td>카페 1잔 가격</td><td className={s.cellMono}>{cafePrice.toLocaleString()} 원</td></tr>
                  <tr><td>1잔 절감액</td><td className={s.cellMono}>{fmt(cafePrice - homeCostPerCup, 0)} 원</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>{dailyN}잔/일 기준</td></tr>
                  <tr><td>일 절감액</td><td className={s.cellMono}>{fmt(cafeSaving, 0)} 원</td></tr>
                  <tr><td>월 절감액 (30일)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(monthlySaving, 0)} 원</td></tr>
                  <tr><td>연 절감액 (365일)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(yearlySaving, 0)} 원</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>💰 홈브루 입문 비용 (참고)</strong>
            <p>
              • <strong>핸드드립</strong>: 드리퍼 + 필터 + 저울 + 케틀 = 약 5~15만원<br />
              • <strong>프렌치프레스</strong>: 본체만 2~5만원 (가장 가벼운 시작)<br />
              • <strong>에어로프레스</strong>: 5~7만원 + 필터 1~2만원<br />
              • 일반적으로 <strong>2~6개월</strong>이면 카페 비용 대비 손익분기 도달
            </p>
          </div>
        </>
      )}

      {/* 안내 (모든 탭 공통) */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/cooking/recipe', label: '레시피 비율 계산기' },
          { href: '/tools/cooking/microwave', label: '전자레인지 환산' },
          { href: '/tools/cooking/egg-timer', label: '계란 삶는 시간' }
        ]}
      >
        사용 안내 권장값은 SCA·일반 가이드, 취향에 따라 자유롭게 조정하세요. 원두 신선도(로스팅 일자)가 비율보다 큰 변수입니다 — 로스팅 후 7~21일이 최적. 정확한 추출에는 <strong>핸디 저울·온도계·타이머</strong>를 권장합니다.
      </Disclaimer>

      {/* 크로스링크 */}
      <Link href="/tools/cooking/recipe" className={s.crossLink}>
        📐 레시피 비율 계산기 → 다른 음료·음식 비율 환산은 여기로
      </Link>
    </div>
  )
}
