/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useId, useMemo, useState } from 'react'
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

const INPUT_MODES: InputMode[] = ['coffee', 'water', 'cups']

/* 양수만 받고 상한으로 자름 — 빈칸·음수·문자는 0 */
const posNum = (v: string, max: number) => {
  const n = parseFloat(v)
  return isFinite(n) && n > 0 ? Math.min(n, max) : 0
}

/* 비율 슬라이더 범위 (에스프레소는 인풋:아웃풋이라 별도) */
const sliderRange = (method: BrewMethod): [number, number] => method === 'espresso' ? [1, 4] : [5, 25]

/* 숫자 입력 문자열 복원 — 형식이 맞는 값만 */
const numStr = (v: unknown): string | undefined =>
  typeof v === 'string' && v.length <= 10 && /^\d*\.?\d*$/.test(v) ? v : undefined

export default function BrewClient() {
  const [tab, setTab] = useState<Tab>('ratio')

  /* 공통 */
  const [method, setMethod] = useState<BrewMethod>('drip')
  const [ratio, setRatio] = useState<number>(16)

  /* 탭 2: 푸어 스케줄 전용 비율 (핸드드립 전용 — 공통 ratio와 분리해 에스프레소 비율 누출 방지)
     입력은 문자열로 두고 계산할 때만 파싱 — 칸을 비워도 16으로 튀지 않게 */
  const [pourRatioStr, setPourRatioStr] = useState('16')

  /* 탭 1: 비율 계산 */
  const [inputMode, setInputMode] = useState<InputMode>('coffee')
  const [coffeeG, setCoffeeG] = useState('20')
  const [waterMl, setWaterMl] = useState('320')
  const [cups, setCups] = useState('2')
  const [mlPerCup, setMlPerCup] = useState('250')

  /* 탭 3: 로스팅 */
  const [roast, setRoast] = useState<RoastLevel>('medium')

  /* 탭 4: 비용 */
  const [pricePer100g, setPricePer100g] = useState('8000')
  const [cafePrice, setCafePrice] = useState(4500)
  const [dailyCups, setDailyCups] = useState('1')

  /* localStorage — 저장값은 목록·형식 검증 후에만 반영 */
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
      const j: unknown = raw ? JSON.parse(raw) : null
      if (j && typeof j === 'object' && !Array.isArray(j)) {
        const o = j as Record<string, unknown>
        const savedMethod = BREW_METHODS.find((bm) => bm.id === o.method)?.id
        if (savedMethod) setMethod(savedMethod)
        const mForRatio = savedMethod ?? 'drip'
        const [rMin, rMax] = sliderRange(mForRatio)
        if (typeof o.ratio === 'number' && isFinite(o.ratio)) {
          setRatio(o.ratio >= rMin && o.ratio <= rMax ? o.ratio : getMethod(mForRatio).ratioDefault)
        }
        if (INPUT_MODES.includes(o.inputMode as InputMode)) setInputMode(o.inputMode as InputMode)
        const cg = numStr(o.coffeeG); if (cg) setCoffeeG(cg)
        const wm = numStr(o.waterMl); if (wm) setWaterMl(wm)
        const cu = numStr(o.cups); if (cu) setCups(cu)
        const mp = numStr(o.mlPerCup); if (mp) setMlPerCup(mp)
        const savedRoast = ROASTS.find((r) => r.id === o.roast)?.id
        if (savedRoast) setRoast(savedRoast)
      }
    } catch {}
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        method, ratio, inputMode, coffeeG, waterMl, cups, mlPerCup, roast,
      }))
    } catch {}
  }, [hydrated, method, ratio, inputMode, coffeeG, waterMl, cups, mlPerCup, roast])

  /* 추출법을 직접 바꿀 때만 비율 보정 — 같은 추출법 안에서는 1:12 등 자유 조정 가능하고,
     새로고침으로 복원한 비율도 그대로 유지. 새 추출법 권장 범위를 벗어난 비율만 기본값으로
     (콜드브루 1:9 → 에스프레소 전환 시 1:9 잔류 방지) */
  const selectMethod = (id: BrewMethod) => {
    const meta = getMethod(id)
    setMethod(id)
    setRatio((prev) => (prev < meta.ratioMin || prev > meta.ratioMax) ? meta.ratioDefault : prev)
  }

  /* 계산 */
  const m = getMethod(method)
  // 에스프레소는 '물'이 아니라 추출 샷(아웃풋, g) 기준 → 입력 모드를 원두→샷으로 고정
  const isEspresso = method === 'espresso'
  const effMode: InputMode = isEspresso ? 'coffee' : inputMode
  // 입력값은 양수·상한으로 클램프 (원두 500g · 물 10L · 잔수 50 · 1잔 2L) — 음수 입력이 결과에 새지 않게
  const coffeeNum = posNum(coffeeG, 500)
  const waterNum = posNum(waterMl, 10000)
  const cupsNum = Math.floor(posNum(cups, 50))
  const mlPerCupNum = Math.floor(posNum(mlPerCup, 2000))
  const calcCoffee = useMemo(() => {
    if (effMode === 'coffee') return coffeeNum
    if (effMode === 'water') return waterToCoffee(waterNum, ratio)
    // cups
    return waterToCoffee(cupsNum * mlPerCupNum, ratio)
  }, [effMode, coffeeNum, waterNum, ratio, cupsNum, mlPerCupNum])

  const calcWater = useMemo(() => {
    if (effMode === 'coffee') return coffeeToWater(coffeeNum, ratio)
    if (effMode === 'water') return waterNum
    return cupsNum * mlPerCupNum
  }, [effMode, coffeeNum, waterNum, ratio, cupsNum, mlPerCupNum])

  const cupsCount = effMode === 'cups'
    ? cupsNum
    : Math.max(1, Math.round(calcWater / (mlPerCupNum || 250)))
  // 비용용 잔수는 반올림하지 않음 — 320ml(1.28잔)를 1잔으로 반올림하면 1잔 원가가 과대평가됨
  const costCups = effMode === 'cups'
    ? Math.max(1, cupsNum || 1)
    : Math.max(1, calcWater / (mlPerCupNum || 250))
  const intensity = getIntensity(ratio)
  // 방식별 해석 — 현재 추출법 권장 범위 대비 위치
  const methodFit = ratio < m.ratioMin ? `${m.shortName} 권장보다 진함`
    : ratio > m.ratioMax ? `${m.shortName} 권장보다 연함`
    : `${m.shortName} 권장 범위`
  // 에스프레소는 비율 범위가 1:1.5~3이라 프리셋·슬라이더를 별도로
  const ratioPresets: number[] = isEspresso ? [1.5, 2, 2.5, 3] : [...RATIO_PRESETS]
  const ratioStar = isEspresso ? 2 : 15
  const sliderMin = isEspresso ? 1 : 5
  const sliderMax = isEspresso ? 4 : 25
  const sliderStep = isEspresso ? 0.1 : 0.5

  /* 푸어 스케줄 — 핸드드립 전용 pourRatio 사용 (공통 ratio의 에스프레소 값 누출 방지) */
  const pourCoffee = coffeeNum || 20
  const pourRatioNum = posNum(pourRatioStr, 30)
  const pourRatio = pourRatioNum >= 1 ? pourRatioNum : 16
  const pourWater = pourCoffee * pourRatio
  const schedule = useMemo(() => buildPourSchedule(pourCoffee, pourWater), [pourCoffee, pourWater])

  /* 비용 */
  const price100g = posNum(pricePer100g, 1000000)
  const dailyN = parseInt(dailyCups) || 1
  const homeCostPerCup = (calcCoffee / costCups) * (price100g / 100)
  const cafeSaving = (cafePrice - homeCostPerCup) * dailyN
  const monthlySaving = cafeSaving * 30
  const yearlySaving = cafeSaving * 365
  const savingLabel = cafeSaving >= 0 ? '절감액' : '추가 비용'

  /* 강도 게이지 — 비율 5~25를 0~420px로. 마커·눈금이 같은 좌표계를 쓰도록 한 함수로 */
  const gaugeX = (r: number) => Math.min(Math.max(((r - 5) / 20) * 420, 0), 420)
  const gradId = `intensityGrad-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <div className={s.wrap}>
      {/* 면책 */}
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

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="브루잉 계산기 메뉴">
        {([
          { id: 'ratio',     label: '비율 계산' },
          { id: 'pour',      label: '푸어 스케줄' },
          { id: 'intensity', label: '강도·로스팅' },
          { id: 'cost',      label: '비용 비교' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
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
                  aria-pressed={method === bm.id}
                  className={`${s.methodBtn} ${method === bm.id ? s.methodBtnActive : ''}`}
                  onClick={() => selectMethod(bm.id)}
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
            <span className={s.cardLabel}>{isEspresso ? '원두 : 샷 비율 (인풋:아웃풋)' : '원두 : 물 비율'}</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>비율 프리셋</label>
              <div className={s.pillRow}>
                {ratioPresets.map((r) => (
                  <button
                    key={r}
                    aria-pressed={ratio === r}
                    className={`${s.pill} ${ratio === r ? s.pillActive : ''}`}
                    onClick={() => setRatio(r)}
                    type="button"
                  >
                    1:{r}{r === ratioStar && ' ⭐'}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="brew-f1">또는 직접 (1:{ratio.toFixed(1)})</label>
              <input id="brew-f1"
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={sliderStep}
                value={ratio}
                onChange={(e) => setRatio(parseFloat(e.target.value))}
                className={s.slider}
              />
              <div className={s.helpText}>
                {intensity.emoji} <strong style={{ color: intensity.color }}>{intensity.label}</strong> — {intensity.desc}
                <br /><strong style={{ color: 'var(--accent)' }}>{methodFit}</strong>
              </div>
            </div>
          </div>

          {/* 입력 모드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{isEspresso ? '원두 인풋 → 샷 아웃풋' : '입력 방식'}</span>
            {!isEspresso && (
              <div className={s.pillRow}>
                <button
                  aria-pressed={inputMode === 'coffee'}
                  className={`${s.pill} ${inputMode === 'coffee' ? s.pillActive : ''}`}
                  onClick={() => setInputMode('coffee')}
                  type="button"
                >
                  ☕ 원두 → 물
                </button>
                <button
                  aria-pressed={inputMode === 'water'}
                  className={`${s.pill} ${inputMode === 'water' ? s.pillActive : ''}`}
                  onClick={() => setInputMode('water')}
                  type="button"
                >
                  💧 물 → 원두
                </button>
                <button
                  aria-pressed={inputMode === 'cups'}
                  className={`${s.pill} ${inputMode === 'cups' ? s.pillActive : ''}`}
                  onClick={() => setInputMode('cups')}
                  type="button"
                >
                  🥤 잔수 기준
                </button>
              </div>
            )}

            {effMode === 'coffee' && (
              <div className={s.field} style={{ marginTop: 12 }}>
                <label className={s.fieldLabel} htmlFor="brew-coffee">{isEspresso ? '원두 인풋 (g)' : '원두 (g)'}</label>
                <input id="brew-coffee"
                  type="number" inputMode="decimal"
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

            {effMode === 'water' && (
              <div className={s.field} style={{ marginTop: 12 }}>
                <label className={s.fieldLabel} htmlFor="brew-ml">물 (ml)</label>
                <input id="brew-ml"
                  type="number" inputMode="decimal"
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

            {effMode === 'cups' && (
              <>
                <div className={s.row2} style={{ marginTop: 12 }}>
                  <div className={s.field}>
                    <label className={s.fieldLabel} htmlFor="brew-f3">잔수</label>
                    <input id="brew-f3"
                      type="number" inputMode="decimal"
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
                    <label className={s.fieldLabel} htmlFor="brew-ml-2">1잔 ml</label>
                    <input id="brew-ml-2"
                      type="number" inputMode="decimal"
                      className={s.input}
                      value={mlPerCup}
                      onChange={(e) => setMlPerCup(e.target.value)}
                      min={50} max={1000} step={10}
                    />
                    <div className={s.pillRow} style={{ marginTop: 8 }}>
                      {CUP_SIZES.map((c) => (
                        <button
                          key={c.id}
                          aria-pressed={parseInt(mlPerCup) === c.ml}
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
          <div className={s.hero} role="status">
            <p className={s.heroLabel}>{m.emoji} {m.shortName} · 1:{ratio.toFixed(1)}</p>
            <div className={s.heroResult} style={isEspresso ? { gridTemplateColumns: 'repeat(2, 1fr)' } : undefined}>
              <div className={s.heroBlock}>
                <span className={s.heroBlockLabel}>{isEspresso ? '원두 (인풋)' : '원두'}</span>
                <strong className={s.heroBlockValue}>{fmt(calcCoffee, 1)} g</strong>
              </div>
              <div className={s.heroBlock}>
                <span className={s.heroBlockLabel}>{isEspresso ? '샷 (아웃풋)' : '물'}</span>
                <strong className={s.heroBlockValue}>{fmt(calcWater, 0)} {isEspresso ? 'g' : 'ml'}</strong>
              </div>
              {!isEspresso && (
                <div className={s.heroBlock}>
                  <span className={s.heroBlockLabel}>잔수</span>
                  <strong className={s.heroBlockValue}>{cupsCount}잔</strong>
                </div>
              )}
            </div>
          </div>

          {isEspresso && (
            <div className={s.tipBox}>
              💡 <strong>에스프레소</strong>는 비율이 <strong>원두(인풋) : 샷(아웃풋)</strong>을 무게(g)로 잰 값입니다.
              위 <strong>샷</strong>은 추출되는 액체 무게이며 <strong>부어넣는 물 양이 아닙니다</strong>. (예: 원두 18g · 1:2 → 샷 36g)
            </div>
          )}

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
              <strong>추출 팁</strong> — {m.tip}
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
                <label className={s.fieldLabel} htmlFor="brew-f5">원두 (g)</label>
                <input id="brew-f5"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={coffeeG}
                  onChange={(e) => setCoffeeG(e.target.value)}
                  min={5} max={100} step={1}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="brew-ratio">비율 (1:N)</label>
                <input id="brew-ratio"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={pourRatioStr}
                  onChange={(e) => setPourRatioStr(e.target.value)}
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
            <p className={s.heroSub}>1:{pourRatio} · 총 시간 약 2:30~3:30</p>
          </div>

          {/* SVG 타임라인 */}
          <div className={s.card}>
            <span className={s.cardLabel}>타임라인 (0~210초)</span>
            <svg viewBox="0 0 420 80" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="추출 단계 타임라인 그래프">
              {schedule.map((step, i) => {
                const x1 = (step.startSec / 210) * 420
                const w = ((step.endSec - step.startSec) / 210) * 420
                return (
                  <g key={i}>
                    <rect x={x1} y={20} width={w - 1} height={28} fill={step.color} rx={3} />
                    <text x={x1 + w / 2} y={38} fill="#0D0D0D" fontSize="11" textAnchor="middle" fontWeight="700" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>
                      {step.emoji}
                    </text>
                    <text x={x1 + w / 2} y={62} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>
                      {step.startSec}~{step.endSec}s
                    </text>
                  </g>
                )
              })}
              {/* 시간 눈금 */}
              {[0, 30, 60, 90, 120, 150, 180, 210].map((t) => (
                <g key={t}>
                  <line x1={(t / 210) * 420} y1={15} x2={(t / 210) * 420} y2={20} stroke="var(--muted)" strokeWidth="1" />
                  <text x={(t / 210) * 420} y={12} fill="var(--muted)" fontSize="8" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>{t}</text>
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
            <strong>푸어 팁</strong>
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
              <label className={s.fieldLabel} htmlFor="brew-ratio-2">비율 (1:{ratio.toFixed(1)})</label>
              <input id="brew-ratio-2"
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
            <svg viewBox="0 0 420 70" width="100%" style={{ marginTop: 12, maxWidth: 600 }} role="img" aria-label="추출 비율 농도 게이지">
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#DB2777" />
                  <stop offset="30%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#0D9488" />
                  <stop offset="70%" stopColor="#0891B2" />
                  <stop offset="100%" stopColor="#9B9B9B" />
                </linearGradient>
              </defs>
              <rect x={0} y={20} width={420} height={26} rx={6} fill={`url(#${gradId})`} />
              {/* 슬라이더 위치 표시 (5~25 범위) */}
              <line
                x1={gaugeX(ratio)}
                y1={10}
                x2={gaugeX(ratio)}
                y2={56}
                stroke="var(--text)"
                strokeWidth="3"
              />
              <text
                x={Math.min(Math.max(gaugeX(ratio), 28), 392)}
                y={9}
                fill="var(--text)"
                fontSize="10"
                textAnchor="middle"
                fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
                fontWeight="800"
              >
                ▼ 1:{ratio.toFixed(1)}
              </text>
              {/* 구간 레이블 */}
              {[
                { r: 12, label: '1:12' },
                { r: 15, label: '1:15 ⭐' },
                { r: 18, label: '1:18' },
                { r: 20, label: '1:20' },
              ].map((t, i) => (
                <text key={i} x={gaugeX(t.r)} y={66} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>
                  {t.label}
                </text>
              ))}
            </svg>

            <div className={s.hero} style={{ marginTop: 12 }}>
              <p className={s.heroLabel}>현재 추출 강도</p>
              <p className={s.heroValue} style={{ color: intensity.color }}>
                {intensity.emoji} <strong>{intensity.label}</strong>
              </p>
              <p className={s.heroSub}>{intensity.desc} · <strong style={{ color: 'var(--accent)' }}>{m.shortName} 1:{ratio.toFixed(1)} — {methodFit.replace(m.shortName + ' ', '')}</strong></p>
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
                      <span style={{ color: 'var(--muted)', fontWeight: 500, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>
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
                  aria-pressed={roast === r.id}
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
            <strong>추출 변수 우선순위</strong>
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
                <label className={s.fieldLabel} htmlFor="brew-price">원두 100g 가격 (원)</label>
                <input id="brew-price"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={pricePer100g}
                  onChange={(e) => setPricePer100g(e.target.value)}
                  min={500} max={200000} step={500}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[3000, 5000, 8000, 12000, 20000].map((p) => (
                    <button key={p} className={s.pill} onClick={() => setPricePer100g(String(p))} type="button">
                      {(p / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
                <p className={s.helpText} style={{ marginTop: 6 }}>대용량 일반 원두는 100g 2~3천원대, 스페셜티는 7천~1만4천원 정도예요.</p>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>카페 1잔 가격 (원)</label>
                <div className={s.pillRow}>
                  {[3500, 4500, 5500, 6500].map((p) => (
                    <button
                      key={p}
                      aria-pressed={cafePrice === p}
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
                    aria-pressed={dailyN === d}
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
              <strong style={{ color: cafePrice >= homeCostPerCup ? 'var(--accent)' : 'var(--danger)' }}>
                {cafePrice >= homeCostPerCup
                  ? `1잔당 ${fmt(cafePrice - homeCostPerCup, 0)}원 절감`
                  : `카페보다 1잔당 ${fmt(homeCostPerCup - cafePrice, 0)}원 비쌈`}
              </strong>
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>절감액 시뮬레이션</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>원두 g당 단가</td><td className={s.cellMono}>{fmt(price100g / 100, 0)} 원/g</td></tr>
                  <tr><td>1잔 사용 원두</td><td className={s.cellMono}>{fmt(calcCoffee / costCups, 1)} g</td></tr>
                  <tr><td>홈브루 1잔 원가</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(homeCostPerCup, 0)} 원</td></tr>
                  <tr><td>카페 1잔 가격</td><td className={s.cellMono}>{cafePrice.toLocaleString()} 원</td></tr>
                  <tr><td>{savingLabel} (1잔)</td><td className={s.cellMono}>{fmt(Math.abs(cafePrice - homeCostPerCup), 0)} 원</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>{dailyN}잔/일 기준</td></tr>
                  <tr><td>일 {savingLabel}</td><td className={s.cellMono}>{fmt(Math.abs(cafeSaving), 0)} 원</td></tr>
                  <tr><td>월 {savingLabel} (30일)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(Math.abs(monthlySaving), 0)} 원</td></tr>
                  <tr><td>연 {savingLabel} (365일)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(Math.abs(yearlySaving), 0)} 원</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>홈브루 입문 비용 (참고)</strong>
            <p>
              • <strong>핸드드립</strong>: 드리퍼 + 필터 + 저울 + 케틀 = 약 5~15만원<br />
              • <strong>프렌치프레스</strong>: 본체만 2~5만원 (가장 가벼운 시작)<br />
              • <strong>에어로프레스</strong>: 5~7만원 + 필터 1~2만원<br />
              • 일반적으로 <strong>2~6개월</strong>이면 카페 비용 대비 손익분기 도달
            </p>
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/cooking/recipe" className={s.crossLink}>
        📐 레시피 비율 계산기 → 다른 음료·음식 비율 환산은 여기로
      </Link>
    </div>
  )
}
