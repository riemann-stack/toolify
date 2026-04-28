'use client'

import { useMemo, useState } from 'react'
import s from './planet-comparison.module.css'

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const n = (v: string | number, d = 0): number => {
  const x = typeof v === 'string' ? parseFloat(v.replace(/,/g, '')) : v
  return Number.isFinite(x) ? x : d
}
const fmt = (v: number, dp = 0): string => {
  if (!Number.isFinite(v)) return '-'
  return v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
const round = (v: number, dp = 1) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp)

// ─────────────────────────────────────────────
// 행성 데이터 (NASA 기준)
// ─────────────────────────────────────────────
type Planet = {
  id: string
  name: string
  emoji: string
  nameEn: string
  radiusKm: number
  radiusRatio: number
  gravityRatio: number
  yearDays: number
  dayHours: number  // 음수 = 역행
  surfaceTempC: { min: number; max: number; avg: number }
  distanceFromSunKm: number
  distanceFromEarthAvgKm: number
  lightTimeMinutes: number
  color: string
  borderCls: string
  funFact: string
}

const PLANETS: Planet[] = [
  { id: 'mercury', name: '수성',   emoji: '☿️', nameEn: 'Mercury',
    radiusKm: 2_439.7,  radiusRatio: 0.383, gravityRatio: 0.378,
    yearDays: 87.97,   dayHours: 4222.6,
    surfaceTempC: { min: -173, max: 427, avg: 167 },
    distanceFromSunKm: 57_910_000, distanceFromEarthAvgKm: 77_000_000,
    lightTimeMinutes: 4.3, color: '#A8A29E', borderCls: s.borderMercury,
    funFact: '태양에 가장 가깝지만 가장 뜨거운 행성은 아닙니다(금성이 더 뜨거움).' },
  { id: 'venus', name: '금성',   emoji: '♀️', nameEn: 'Venus',
    radiusKm: 6_051.8,  radiusRatio: 0.949, gravityRatio: 0.907,
    yearDays: 224.7,   dayHours: -5832.5,
    surfaceTempC: { min: 462, max: 462, avg: 462 },
    distanceFromSunKm: 108_200_000, distanceFromEarthAvgKm: 41_400_000,
    lightTimeMinutes: 2.3, color: '#FFC857', borderCls: s.borderVenus,
    funFact: '하루(자전 243일)가 1년(공전 225일)보다 깁니다. 자전 방향도 거꾸로입니다.' },
  { id: 'earth', name: '지구',   emoji: '🌍', nameEn: 'Earth',
    radiusKm: 6_371,    radiusRatio: 1.0,   gravityRatio: 1.0,
    yearDays: 365.25,   dayHours: 24,
    surfaceTempC: { min: -88, max: 58, avg: 15 },
    distanceFromSunKm: 149_600_000, distanceFromEarthAvgKm: 0,
    lightTimeMinutes: 0, color: '#3EC8FF', borderCls: s.borderEarth,
    funFact: '우리 집입니다. 표면의 71%가 물로 덮여 있습니다.' },
  { id: 'mars', name: '화성',   emoji: '♂️', nameEn: 'Mars',
    radiusKm: 3_389.5,  radiusRatio: 0.532, gravityRatio: 0.377,
    yearDays: 686.97,  dayHours: 24.6,
    surfaceTempC: { min: -143, max: 35, avg: -65 },
    distanceFromSunKm: 227_900_000, distanceFromEarthAvgKm: 78_300_000,
    lightTimeMinutes: 12.7, color: '#FF6B6B', borderCls: s.borderMars,
    funFact: '하루 길이가 지구와 비슷합니다(24시간 37분). 최고 산은 올림푸스 산(높이 22km).' },
  { id: 'jupiter', name: '목성', emoji: '♃', nameEn: 'Jupiter',
    radiusKm: 69_911,   radiusRatio: 10.97, gravityRatio: 2.36,
    yearDays: 4_332.59, dayHours: 9.93,
    surfaceTempC: { min: -145, max: -145, avg: -145 },
    distanceFromSunKm: 778_500_000, distanceFromEarthAvgKm: 628_700_000,
    lightTimeMinutes: 35, color: '#FF8C3E', borderCls: s.borderJupiter,
    funFact: '태양계 행성 모두를 합친 것보다 2배 무겁습니다. 대적반(거대 폭풍)은 350년 이상 지속.' },
  { id: 'saturn', name: '토성',  emoji: '♄', nameEn: 'Saturn',
    radiusKm: 58_232,   radiusRatio: 9.14,  gravityRatio: 0.916,
    yearDays: 10_759.22, dayHours: 10.7,
    surfaceTempC: { min: -178, max: -178, avg: -178 },
    distanceFromSunKm: 1_434_000_000, distanceFromEarthAvgKm: 1_280_000_000,
    lightTimeMinutes: 71, color: '#FFD700', borderCls: s.borderSaturn,
    funFact: '아름다운 고리는 얼음과 암석. 밀도가 매우 낮아 큰 욕조에 넣으면 둥둥 뜹니다.' },
  { id: 'uranus', name: '천왕성', emoji: '♅', nameEn: 'Uranus',
    radiusKm: 25_362,   radiusRatio: 3.98,  gravityRatio: 0.889,
    yearDays: 30_688.5, dayHours: -17.24,
    surfaceTempC: { min: -224, max: -224, avg: -224 },
    distanceFromSunKm: 2_871_000_000, distanceFromEarthAvgKm: 2_721_000_000,
    lightTimeMinutes: 151, color: '#3EFFD0', borderCls: s.borderUranus,
    funFact: '자전축이 98° 기울어져 옆으로 굴러갑니다. 태양계에서 가장 추운 행성.' },
  { id: 'neptune', name: '해왕성', emoji: '♆', nameEn: 'Neptune',
    radiusKm: 24_622,   radiusRatio: 3.86,  gravityRatio: 1.12,
    yearDays: 60_182,   dayHours: 16.11,
    surfaceTempC: { min: -218, max: -218, avg: -218 },
    distanceFromSunKm: 4_495_000_000, distanceFromEarthAvgKm: 4_345_000_000,
    lightTimeMinutes: 242, color: '#3E5BFF', borderCls: s.borderNeptune,
    funFact: '태양계에서 바람이 가장 강한 행성. 시속 2,100km의 폭풍이 분다.' },
]

// 거리 표기 헬퍼
function fmtDistance(km: number): string {
  if (km === 0) return '—'
  if (km < 100_000_000) return `${fmt(round(km / 1_000_000))}만 km`
  if (km < 1_000_000_000) return `${fmt(round(km / 100_000_000))}억 km`
  return `${round(km / 1_000_000_000, 2)}억 km`
}
function fmtLightTime(min: number): string {
  if (min < 1) return '0분'
  if (min < 60) return `${round(min, 1)}분`
  const h = min / 60
  if (h < 1.5) return `${round(h, 2)}시간`
  return `${round(h, 1)}시간`
}

// ─────────────────────────────────────────────
// 행성 SVG 일러스트
// ─────────────────────────────────────────────
function PlanetIllustration({ planet, size = 80 }: { planet: Planet; size?: number }) {
  const r = size / 2 - 4
  const cx = size / 2
  const cy = size / 2
  const id = `grad-${planet.id}-${size}`

  const ringId = `ring-${planet.id}-${size}`

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="40%" stopColor={planet.color} stopOpacity="1" />
          <stop offset="100%" stopColor={planet.color} stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* 토성 고리 (뒤쪽 절반) */}
      {planet.id === 'saturn' && (
        <ellipse cx={cx} cy={cy} rx={r * 1.55} ry={r * 0.30} fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.55" />
      )}

      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} stroke={planet.color} strokeWidth="0.5" opacity="0.95" />

      {/* 토성 고리 (앞쪽 절반 — 행성 위에 덮임) */}
      {planet.id === 'saturn' && (
        <path
          d={`M ${cx - r * 1.55} ${cy} A ${r * 1.55} ${r * 0.30} 0 0 0 ${cx + r * 1.55} ${cy}`}
          fill="none" stroke="#FFD700" strokeWidth="2.5" opacity="0.9"
        />
      )}

      {/* 목성 줄무늬 */}
      {planet.id === 'jupiter' && (
        <g clipPath={`circle(${r}px at ${cx}px ${cy}px)`} opacity="0.55">
          <ellipse cx={cx} cy={cy - r * 0.55} rx={r} ry={r * 0.10} fill="#A85820" />
          <ellipse cx={cx} cy={cy - r * 0.20} rx={r} ry={r * 0.12} fill="#FFC080" />
          <ellipse cx={cx} cy={cy + r * 0.10} rx={r} ry={r * 0.10} fill="#A85820" />
          <ellipse cx={cx} cy={cy + r * 0.40} rx={r} ry={r * 0.12} fill="#FFC080" />
          <circle cx={cx + r * 0.25} cy={cy + r * 0.10} r={r * 0.15} fill="#C0392B" opacity="0.7" />
        </g>
      )}

      {/* 지구: 대륙 단순화 */}
      {planet.id === 'earth' && (
        <g clipPath={`circle(${r}px at ${cx}px ${cy}px)`} opacity="0.85">
          <ellipse cx={cx - r * 0.30} cy={cy - r * 0.10} rx={r * 0.30} ry={r * 0.20} fill="#3EFF9B" />
          <ellipse cx={cx + r * 0.20} cy={cy + r * 0.20} rx={r * 0.25} ry={r * 0.30} fill="#3EFF9B" />
          <ellipse cx={cx - r * 0.50} cy={cy + r * 0.40} rx={r * 0.18} ry={r * 0.10} fill="#3EFF9B" />
        </g>
      )}

      {/* 화성 점 */}
      {planet.id === 'mars' && (
        <g clipPath={`circle(${r}px at ${cx}px ${cy}px)`} opacity="0.45">
          <circle cx={cx - r * 0.30} cy={cy - r * 0.20} r={r * 0.10} fill="#8B2E2E" />
          <circle cx={cx + r * 0.30} cy={cy + r * 0.30} r={r * 0.13} fill="#8B2E2E" />
          <circle cx={cx + r * 0.10} cy={cy - r * 0.40} r={r * 0.08} fill="#8B2E2E" />
        </g>
      )}

      {/* 천왕성: 자전축 옆으로 굴러가는 느낌 */}
      {planet.id === 'uranus' && (
        <ellipse cx={cx} cy={cy} rx={r * 1.15} ry={r * 0.12} fill="none" stroke="#3EFFD0" strokeWidth="1.5" opacity="0.5" transform={`rotate(80 ${cx} ${cy})`} />
      )}

      {/* 광택 하이라이트 */}
      <ellipse cx={cx - r * 0.30} cy={cy - r * 0.35} rx={r * 0.30} ry={r * 0.15} fill="#fff" opacity="0.30" />
    </svg>
  )
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function PlanetComparisonClient() {
  const [weight, setWeight] = useState<number>(75)
  const [age, setAge] = useState<number>(35)
  const [userName, setUserName] = useState<string>('')
  const [selected, setSelected] = useState<Set<string>>(new Set(PLANETS.map(p => p.id)))
  const [gravityRunning, setGravityRunning] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  function applyPreset(kind: 'maleAvg' | 'femaleAvg') {
    if (kind === 'maleAvg')   { setWeight(75); setAge(35) }
    if (kind === 'femaleAvg') { setWeight(60); setAge(35) }
  }

  function togglePlanet(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function runGravitySim() {
    setGravityRunning(false)
    requestAnimationFrame(() => requestAnimationFrame(() => setGravityRunning(true)))
  }

  // 각 행성에서의 계산
  const planetCalcs = useMemo(() => {
    return PLANETS.map(p => {
      const weightOnPlanet = weight * p.gravityRatio
      const earthJumpCm = 50
      const jumpHeight = (earthJumpCm / 100) / p.gravityRatio // m
      const ageOnPlanet = (age * 365.25) / p.yearDays
      const birthdaysPerEarthYear = 365.25 / p.yearDays
      const dayLengthHours = Math.abs(p.dayHours)
      return {
        planet: p,
        weightOnPlanet,
        jumpHeight,
        ageOnPlanet,
        birthdaysPerEarthYear,
        dayLengthHours,
        isRetrograde: p.dayHours < 0,
      }
    })
  }, [weight, age])

  const filteredCalcs = planetCalcs.filter(c => selected.has(c.planet.id))

  // 추천 행성 (가벼운 몸 + 비슷한 하루)
  const recommended = useMemo(() => {
    // 화성을 기본 추천 (가벼운 몸 + 24.6h 하루 + 인간 탐사 가능성)
    const mars = planetCalcs.find(c => c.planet.id === 'mars')
    return mars ?? planetCalcs[3]
  }, [planetCalcs])

  // 공유 텍스트
  async function copyShare() {
    const top4 = ['mercury', 'venus', 'mars', 'jupiter']
      .map(id => planetCalcs.find(c => c.planet.id === id))
      .filter((c): c is NonNullable<typeof c> => !!c)
    const lines = [
      `🪐 우주 속의 ${userName ? userName + '님' : '나'}`,
      ``,
      `지구의 ${age}세 ${weight}kg인 ${userName ? userName + '님은' : '나는'}...`,
      ``,
      ...top4.map(c => `🌟 ${c.planet.name}: ${round(c.ageOnPlanet, 1)}세, ${round(c.weightOnPlanet, 1)}kg`),
      ``,
      `가장 추천: 화성 🚀 (가벼운 몸, 비슷한 하루)`,
      ``,
      `youtil.kr 🌌`,
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // 크기 비교 SVG
  const sizeSvg = useMemo(() => {
    // 지구 = 6px 기준 → 목성(×10.97)이 r=66px로 캔버스에 겹치지 않게 배치
    // 실제 비율: 목성 11배, 토성 9.1배, 천왕성 4배, 해왕성 3.9배
    const earthPx = 6
    const W = 760
    const H = 220
    const gap = 12

    // 각 행성의 실제 반지름 (최소 3px)
    const planets = PLANETS
    const radii = planets.map(p => Math.max(3, p.radiusRatio * earthPx))
    // 토성 고리는 본체보다 1.55배 가로로 더 넓으므로 가로 점유폭에 반영
    const hExtents = planets.map((p, i) => (p.id === 'saturn' ? radii[i] * 1.55 : radii[i]))

    // 충돌 없는 가로 위치를 동적으로 산출 (가운데 정렬)
    const totalWidth = hExtents.reduce((sum, r) => sum + r * 2, 0) + gap * (planets.length - 1)
    const startX = Math.max(20, (W - totalWidth) / 2)
    let cursor = startX
    const xs = planets.map((_, i) => {
      const cx = cursor + hExtents[i]
      cursor += hExtents[i] * 2 + gap
      return cx
    })

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className={s.sizeCompareSvg} aria-hidden="true">
        {planets.map((p, i) => {
          const r = radii[i]
          const cx = xs[i]
          const cy = H / 2 + 6
          const isEarth = p.id === 'earth'
          return (
            <g key={p.id}>
              {/* 행성 */}
              {p.id === 'saturn' && (
                <ellipse cx={cx} cy={cy} rx={r * 1.55} ry={r * 0.30} fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.7" />
              )}
              <circle cx={cx} cy={cy} r={r} fill={p.color} opacity="0.95" />
              <ellipse cx={cx - r * 0.3} cy={cy - r * 0.3} rx={r * 0.3} ry={r * 0.15} fill="#fff" opacity="0.30" />
              {/* 라벨 */}
              <text x={cx} y={cy + r + 14} textAnchor="middle" className={`${s.sizeCompareLabel} ${isEarth ? s.sizeCompareLabelEarth : ''}`}>
                {p.name}
              </text>
              <text x={cx} y={cy + r + 26} textAnchor="middle" className={s.sizeCompareLabel}>
                {p.radiusRatio < 1 ? `${round(p.radiusRatio, 2)}×` : `${round(p.radiusRatio, 1)}×`}
              </text>
            </g>
          )
        })}
        {/* 기준 라벨 */}
        <text x={W / 2} y={20} textAnchor="middle" fill="#3EFFD0" fontFamily="Syne, sans-serif" fontWeight={700} fontSize={12} letterSpacing="0.06em">
          크기 비교 (지구 = 1.0×)
        </text>
      </svg>
    )
  }, [])

  // 1일 길이 시각화 (지구 24시간 = 1.0 기준)
  const dayBars = useMemo(() => {
    // 지구 = 24h, 목성 = 9.93h (가장 짧음), 금성 = 5832h (가장 긺)
    // 로그 스케일 사용: log10(시간) 정규화
    const dataset = filteredCalcs.map(c => ({
      planet: c.planet,
      hours: c.dayLengthHours,
      isRetrograde: c.isRetrograde,
      logVal: Math.log10(Math.max(1, c.dayLengthHours)),
    }))
    const maxLog = Math.max(...dataset.map(d => d.logVal), 1)
    return dataset.map(d => ({
      ...d,
      pct: (d.logVal / maxLog) * 100,
    }))
  }, [filteredCalcs])

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <div className={s.disclaimer}>
        <strong>교육·흥미 목적의 시각화입니다.</strong> 행성 데이터는 NASA Solar System Exploration 기준이며,
        거리·빛 도달 시간은 평균값으로 행성 위치에 따라 변동됩니다. 표면 중력만 고려한 가상 시나리오임을 참고하세요.
      </div>

      {/* 입력 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>내 정보 입력</span>
          <span className={s.cardLabelHint}>몸무게·나이</span>
        </div>
        <div className={s.gridThree}>
          <div>
            <span className={s.subLabel}>몸무게 (kg)</span>
            <div className={s.sliderRow}>
              <input type="range" min={20} max={150} step={1} value={weight} onChange={e => setWeight(Number(e.target.value))} />
              <span className={s.sliderValue}>{weight}kg</span>
            </div>
          </div>
          <div>
            <span className={s.subLabel}>나이 (만)</span>
            <div className={s.sliderRow}>
              <input type="range" min={0} max={100} step={1} value={age} onChange={e => setAge(Number(e.target.value))} />
              <span className={s.sliderValue}>{age}세</span>
            </div>
          </div>
          <div>
            <span className={s.subLabel}>이름 (선택, 공유 카드용)</span>
            <input className={s.textInput} type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="예: 홍길동" maxLength={20} />
          </div>
        </div>

        <div className={s.presetRow} style={{ marginTop: 12 }}>
          <button className={`${s.presetBtn} ${weight === 75 && age === 35 ? s.presetActive : ''}`} onClick={() => applyPreset('maleAvg')}   type="button">평균 한국 성인 남성 (75kg, 35세)</button>
          <button className={`${s.presetBtn} ${weight === 60 && age === 35 ? s.presetActive : ''}`} onClick={() => applyPreset('femaleAvg')} type="button">평균 한국 성인 여성 (60kg, 35세)</button>
          <button className={s.presetBtn} type="button" onClick={() => { /* keep current */ }}>내 정보 (직접 입력)</button>
        </div>
      </div>

      {/* 행성 선택 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>비교할 행성 선택</span>
          <span className={s.cardLabelHint}>{selected.size}/8</span>
        </div>
        <div className={s.planetCheckGrid}>
          {PLANETS.map(p => {
            const active = selected.has(p.id)
            return (
              <button
                key={p.id}
                className={`${s.planetCheckBtn} ${active ? s.planetCheckActive : ''}`}
                onClick={() => togglePlanet(p.id)}
                type="button"
              >
                <span className={s.planetCheckDot} style={{ background: p.color }} />
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* 크기 비교 시각화 */}
      <div className={s.spaceBg}>
        <p className={s.sizeCompareTitle}>🌌 8개 행성 크기 비교</p>
        <div className={s.sizeCompareWrap}>
          {sizeSvg}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 8, lineHeight: 1.7 }}>
          지구를 1.0× 기준으로 한 실제 비율 · 목성은 지구를 1,300개 넣을 수 있는 크기
        </p>
      </div>

      {/* 행성 카드 그리드 */}
      <div className={s.planetGrid}>
        {filteredCalcs.map(c => {
          const p = c.planet
          return (
            <div key={p.id} className={`${s.planetCard} ${p.borderCls}`}>
              <div className={s.planetCardHeader}>
                <span className={s.planetCardEmoji}>{p.emoji}</span>
                <span className={s.planetCardName}>{p.name}<span className={s.planetCardNameEn}>{p.nameEn}</span></span>
              </div>
              <div className={s.planetIllustration}>
                <PlanetIllustration planet={p} size={88} />
              </div>
              <div className={s.planetStats}>
                <div className={s.planetStatItem}>
                  💪 내 몸무게
                  <strong>{round(c.weightOnPlanet, 1)} kg</strong>
                  <span className={s.planetStatHint}>중력 {round(p.gravityRatio, 2)}g</span>
                </div>
                <div className={s.planetStatItem}>
                  🦘 점프 높이
                  <strong>{round(c.jumpHeight, 2)} m</strong>
                  <span className={s.planetStatHint}>지구 50cm 기준</span>
                </div>
                <div className={s.planetStatItem}>
                  🎂 내 나이
                  <strong>{round(c.ageOnPlanet, 1)} 년</strong>
                  <span className={s.planetStatHint}>{p.name}년 단위</span>
                </div>
                <div className={s.planetStatItem}>
                  📅 1일 길이
                  <strong>
                    {p.id === 'mercury' || p.id === 'venus' ? `${fmt(round(c.dayLengthHours / 24, 1))}일` : `${round(c.dayLengthHours, 1)}h`}
                    {c.isRetrograde && <span className={s.retroFlag}>역행</span>}
                  </strong>
                  <span className={s.planetStatHint}>지구 시간 기준</span>
                </div>
                <div className={s.planetStatItem}>
                  🌡️ 평균 온도
                  <strong>{p.surfaceTempC.avg}°C</strong>
                  <span className={s.planetStatHint}>지구 15°C</span>
                </div>
                <div className={s.planetStatItem}>
                  📏 거리
                  <strong>{fmtDistance(p.distanceFromEarthAvgKm)}</strong>
                  <span className={s.planetStatHint}>빛 도달 {fmtLightTime(p.lightTimeMinutes)}</span>
                </div>
              </div>
              <div className={s.funFact}>
                <strong>💡 재미있는 사실:</strong> {p.funFact}
              </div>
            </div>
          )
        })}
      </div>

      {/* 크기·중력 비교 표 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>크기·중력 비교</span>
          <span className={s.cardLabelHint}>지구 = 1.0× 기준</span>
        </div>
        <div className={s.tableScroll}>
          <table className={s.compareTable} style={{ minWidth: 540 }}>
            <thead>
              <tr>
                <th>행성</th>
                <th>반지름</th>
                <th>지구 대비</th>
                <th>중력</th>
                <th>내 몸무게</th>
                <th>점프</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalcs.map(c => (
                <tr key={c.planet.id} className={c.planet.id === 'earth' ? s.earthRow : ''}>
                  <td>
                    <span className={s.planetDot} style={{ background: c.planet.color }} />
                    {c.planet.name}
                  </td>
                  <td>{fmt(c.planet.radiusKm)} km</td>
                  <td>{round(c.planet.radiusRatio, 2)}×</td>
                  <td>{round(c.planet.gravityRatio, 2)}g</td>
                  <td>{round(c.weightOnPlanet, 1)} kg</td>
                  <td>{round(c.jumpHeight, 2)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 중력 낙하 시뮬레이션 */}
      <div className={s.gravitySim}>
        <div className={s.cardLabel}>
          <span>🍎 중력 낙하 시뮬레이션</span>
          <span className={s.cardLabelHint}>같은 높이에서 동시 낙하 (3초)</span>
        </div>
        <button className={s.gravityRunBtn} onClick={runGravitySim} type="button">
          ▶ 낙하 시작
        </button>
        <div className={s.gravityLanes}>
          {filteredCalcs.map(c => {
            // 중력 비율 → 낙하 거리: g = 1 → 100%, g = 2.36 → 100% (목성도 바닥까지), 단 시간이 빠름
            // 단순화: 모두 바닥에 도달하지만 transition-duration을 g에 반비례
            const dur = 3 / Math.sqrt(c.planet.gravityRatio)
            return (
              <div key={c.planet.id} className={s.gravityLane}>
                <div
                  className={s.gravityBall}
                  style={{
                    background: c.planet.color,
                    color: c.planet.color,
                    top: gravityRunning ? 'calc(100% - 14px)' : '0',
                    transitionDuration: `${dur}s`,
                  }}
                />
                <span className={s.gravityLabel}>
                  {c.planet.name}
                  <br />
                  <span style={{ fontSize: 9, color: c.planet.color }}>{round(c.planet.gravityRatio, 2)}g</span>
                </span>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 18, lineHeight: 1.7, textAlign: 'center' }}>
          중력이 클수록 빨리 떨어집니다. 목성에서는 약 <strong style={{ color: '#FF8C3E' }}>1.5배 빠르게</strong>, 화성에서는 <strong style={{ color: '#FF6B6B' }}>1.6배 천천히</strong> 떨어집니다.
        </p>
      </div>

      {/* 시간 비교 표 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>시간 비교</span>
          <span className={s.cardLabelHint}>1년·1일·생일</span>
        </div>
        <div className={s.tableScroll}>
          <table className={s.compareTable} style={{ minWidth: 540 }}>
            <thead>
              <tr>
                <th>행성</th>
                <th>1년</th>
                <th>1일</th>
                <th>내 나이</th>
                <th>1년 동안 생일</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalcs.map(c => (
                <tr key={c.planet.id} className={c.planet.id === 'earth' ? s.earthRow : ''}>
                  <td>
                    <span className={s.planetDot} style={{ background: c.planet.color }} />
                    {c.planet.name}
                  </td>
                  <td>{c.planet.yearDays >= 365 ? `${fmt(round(c.planet.yearDays))}일` : `${round(c.planet.yearDays)}일`}</td>
                  <td>
                    {c.dayLengthHours < 100 ? `${round(c.dayLengthHours, 1)}h` : `${fmt(round(c.dayLengthHours / 24, 0))}일`}
                    {c.isRetrograde && <span className={s.retroFlag}>역행</span>}
                  </td>
                  <td>{round(c.ageOnPlanet, 1)}세</td>
                  <td>{round(c.birthdaysPerEarthYear, 3)}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1일 길이 막대 시각화 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>1일 길이 비교</span>
          <span className={s.cardLabelHint}>로그 스케일</span>
        </div>
        <div className={s.dayBars}>
          {dayBars.map(d => (
            <div key={d.planet.id} className={s.dayBarRow}>
              <span className={s.dayBarLabel}>{d.planet.name}</span>
              <div className={s.dayBarTrack}>
                <div
                  className={s.dayBarFill}
                  style={{
                    width: `${d.pct}%`,
                    color: d.planet.color,
                  }}
                />
              </div>
              <span className={s.dayBarValue}>
                {d.hours < 100 ? `${round(d.hours, 1)}h` : `${fmt(round(d.hours / 24))}일`}
                {d.isRetrograde && <span className={s.retroFlag}>역행</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 거리·빛 도달 표 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>거리·빛 도달 시간</span>
          <span className={s.cardLabelHint}>지구로부터 평균</span>
        </div>
        <div className={s.tableScroll}>
          <table className={s.compareTable} style={{ minWidth: 460 }}>
            <thead>
              <tr>
                <th>행성</th>
                <th>거리 (지구로부터)</th>
                <th>빛 도달 시간</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalcs.filter(c => c.planet.id !== 'earth').map(c => (
                <tr key={c.planet.id}>
                  <td>
                    <span className={s.planetDot} style={{ background: c.planet.color }} />
                    {c.planet.name}
                  </td>
                  <td>{fmtDistance(c.planet.distanceFromEarthAvgKm)}</td>
                  <td>{fmtLightTime(c.planet.lightTimeMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
          💡 지금 화성에 메시지를 보내면 빛의 속도로 약 <strong style={{ color: '#FF6B6B' }}>13분</strong>이 걸립니다. 해왕성까지는 약 <strong style={{ color: '#3E5BFF' }}>4시간</strong>.
        </p>
      </div>

      {/* 공유 카드 */}
      <div className={s.shareCard}>
        <p className={s.shareTitle}>🪐 우주 속의 {userName ? userName + '님' : '나'}</p>
        <p className={s.shareSubtitle}>
          지구의 <strong>{age}세 {weight}kg</strong>인 {userName ? userName + '님은' : '나는'}...
        </p>
        <div className={s.shareList}>
          {[
            planetCalcs.find(c => c.planet.id === 'mercury'),
            planetCalcs.find(c => c.planet.id === 'venus'),
            planetCalcs.find(c => c.planet.id === 'mars'),
            planetCalcs.find(c => c.planet.id === 'jupiter'),
          ].filter((c): c is NonNullable<typeof c> => !!c).map(c => (
            <div key={c.planet.id} className={s.shareListItem}>
              <span>🌟 {c.planet.name}에서</span>
              <strong>{round(c.ageOnPlanet, 1)}세, {round(c.weightOnPlanet, 1)}kg</strong>
            </div>
          ))}
        </div>
        <div className={s.shareRecommend}>
          가장 추천: <strong>{recommended.planet.name} 🚀</strong>
          <br />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>가벼운 몸 ({round(recommended.weightOnPlanet, 1)}kg) · 비슷한 하루 ({round(recommended.dayLengthHours, 1)}h)</span>
        </div>
        <div className={s.shareWatermark}>youtil.kr 🌌</div>
      </div>

      <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyShare} type="button">
        {copied ? '✓ 복사됨 — SNS에 붙여넣기 하세요' : '공유 카드 텍스트 복사하기'}
      </button>

      {/* 안내 카드 */}
      <div className={s.warningCard}>
        <strong>⚠️ 실제로 인간이 다른 행성에 가면...</strong>
        <ul>
          <li><strong style={{ color: 'var(--text)' }}>수성·금성:</strong> 표면 온도가 너무 극단적이라 즉시 사망 (수성 -173~427°C, 금성 462°C)</li>
          <li><strong style={{ color: 'var(--text)' }}>화성:</strong> 산소 X, 기압 0.01 → 우주복 필수</li>
          <li><strong style={{ color: 'var(--text)' }}>목성·토성·천왕성·해왕성:</strong> 가스 행성이라 표면이 없음</li>
        </ul>
        <p style={{ marginTop: 8, fontSize: 11.5, color: 'var(--muted)' }}>
          이 도구는 표면 중력만 고려한 가상 시나리오입니다.
        </p>
      </div>

      <div className={s.sourceCard}>
        <strong>📚 데이터 출처:</strong> 행성 데이터는 NASA Solar System Exploration 기준입니다.
        거리는 평균값이며 행성 위치에 따라 변동됩니다. 빛 도달 시간도 평균 거리 기준입니다.
        정확한 천문 데이터는 NASA, KASI(한국천문연구원) 등 공식 기관 자료를 참조하세요.
      </div>
    </div>
  )
}
