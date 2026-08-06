'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import s from './planet-comparison.module.css'
import { PLANETS, type Planet, fmtDistance, fmtLightTime, fmt, round, earthDistance } from './planetData'

/* 행성별 카드 테두리 클래스 — CSS 모듈 참조라 데이터 파일과 분리해 둔다 */
const BORDER_CLS: Record<string, string> = {
  mercury: s.borderMercury, venus: s.borderVenus, earth: s.borderEarth, mars: s.borderMars,
  jupiter: s.borderJupiter, saturn: s.borderSaturn, uranus: s.borderUranus, neptune: s.borderNeptune,
}

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// 행성 SVG 일러스트
// ─────────────────────────────────────────────
function PlanetIllustration({ planet, size = 80 }: { planet: Planet; size?: number }) {
  const r = size / 2 - 4
  const cx = size / 2
  const cy = size / 2
  const id = `grad-${planet.id}-${size}`

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
        <ellipse cx={cx} cy={cy} rx={r * 1.55} ry={r * 0.30} fill="none" stroke="#A16207" strokeWidth="2" opacity="0.55" />
      )}

      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} stroke={planet.color} strokeWidth="0.5" opacity="0.95" />

      {/* 토성 고리 (앞쪽 절반 — 행성 위에 덮임) */}
      {planet.id === 'saturn' && (
        <path
          d={`M ${cx - r * 1.55} ${cy} A ${r * 1.55} ${r * 0.30} 0 0 0 ${cx + r * 1.55} ${cy}`}
          fill="none" stroke="#A16207" strokeWidth="2.5" opacity="0.9"
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
          <ellipse cx={cx - r * 0.30} cy={cy - r * 0.10} rx={r * 0.30} ry={r * 0.20} fill="#059669" />
          <ellipse cx={cx + r * 0.20} cy={cy + r * 0.20} rx={r * 0.25} ry={r * 0.30} fill="#059669" />
          <ellipse cx={cx - r * 0.50} cy={cy + r * 0.40} rx={r * 0.18} ry={r * 0.10} fill="#059669" />
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
        <ellipse cx={cx} cy={cy} rx={r * 1.15} ry={r * 0.12} fill="none" stroke="#0D9488" strokeWidth="1.5" opacity="0.5" transform={`rotate(80 ${cx} ${cy})`} />
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
      /* '하루'는 해가 다시 남중할 때까지인 **태양일**로 통일한다.
         ⚠️ 예전에는 한 필드에 수성=태양일(4222.6h)·금성=항성일(5832.5h)이 섞여 있어
            두 행성을 나란히 비교할 수 없었다. */
      const dayLengthHours = p.solarDayHours
      const dist = earthDistance(p)
      return {
        planet: p,
        weightOnPlanet,
        jumpHeight,
        ageOnPlanet,
        birthdaysPerEarthYear,
        dayLengthHours,
        rotationHours: p.rotationHours,
        dist,
        isRetrograde: p.isRetrograde,
      }
    })
  }, [weight, age])

  const filteredCalcs = planetCalcs.filter(c => selected.has(c.planet.id))

  // 추천 행성 (가벼운 몸 + 비슷한 하루)
  /* ⚠️ 예전에는 선택과 무관하게 화성을 반환했다. 화성을 체크 해제해도 "가장 추천: 화성"이
     그대로 남았다. 실제로 **선택된 행성 중에서** 사람이 지내기 나은 쪽을 고른다.
     기준: 지구와 비슷한 중력(0.3~1.5g) · 지구와 비슷한 하루(20~30h) · 덜 극단적인 온도. */
  const recommended = useMemo(() => {
    /* 지구는 빼고 고른다 — '어느 행성으로 가면 좋을까'라는 질문이므로 */
    const base = filteredCalcs.length ? filteredCalcs : planetCalcs
    const pool = base.filter(c => c.planet.id !== 'earth')
    if (!pool.length) return base[0]
    const score = (c: typeof planetCalcs[number]) => {
      const g = c.planet.gravityRatio
      const gravityPenalty = Math.abs(Math.log(g))                    // 1g에서 멀수록 벌점
      const dayPenalty = Math.abs(Math.log(c.dayLengthHours / 24))     // 24h에서 멀수록 벌점
      const tempPenalty = Math.abs(c.planet.surfaceTempC.avg - 15) / 100
      const noSurface = c.planet.radiusRatio > 3 ? 2 : 0               // 기체·얼음 행성은 설 곳이 없다
      return gravityPenalty + dayPenalty + tempPenalty + noSurface
    }
    return [...pool].sort((a, b) => score(a) - score(b))[0]
  }, [filteredCalcs, planetCalcs])

  // 공유 텍스트
  async function copyShare() {
    /* ⚠️ 예전에는 수성·금성·화성·목성으로 고정돼 있어, 화성을 체크 해제해도 공유 카드에 남았다. */
    const shown = (filteredCalcs.length ? filteredCalcs : planetCalcs).slice(0, 4)
    const lines = [
      `🪐 우주 속의 ${userName ? userName + '님' : '나'}`,
      ``,
      `지구의 ${age}세 ${weight}kg인 ${userName ? userName + '님은' : '나는'}...`,
      ``,
      ...shown.map(c => `🌟 ${c.planet.name}: ${round(c.ageOnPlanet, 1)}세, 체중계 ${round(c.weightOnPlanet, 1)}kg`),
      ``,
      `가장 추천: ${recommended.planet.name} 🚀`,
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
    const earthPx = 8
    const W = 760
    const H = 220
    const gap = 12

    /* ⚠️ 예전에는 Math.max(3, …)로 바닥을 뒀는데, 수성(0.383×)만 걸려서 2.3px 대신 3px로
       그려졌다. 라벨이 '실제 비율'이라 0.383×로 적히는데 눈에는 0.5×로 보였다.
       기준 크기를 키워 바닥값 없이도 모두 보이게 한다. */
    const planets = PLANETS
    const radii = planets.map(p => p.radiusRatio * earthPx)
    // 토성 고리는 본체보다 1.55배 가로로 더 넓으므로 가로 점유폭에 반영
    const hExtents = planets.map((p, i) => (p.id === 'saturn' ? radii[i] * 1.55 : radii[i]))

    // 충돌 없는 가로 위치를 동적으로 산출 (가운데 정렬)
    const totalWidth = hExtents.reduce((sum, r) => sum + r * 2, 0) + gap * (planets.length - 1)
    const startX = Math.max(20, (W - totalWidth) / 2)
    const xs = planets.reduce<number[]>((acc, _, i) => {
      const prevCursor = i === 0 ? startX : acc[i - 1] + hExtents[i - 1] + gap + hExtents[i]
      acc.push(prevCursor)
      return acc
    }, [])

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
                <ellipse cx={cx} cy={cy} rx={r * 1.55} ry={r * 0.30} fill="none" stroke="#A16207" strokeWidth="1.5" opacity="0.7" />
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
        <text x={W / 2} y={20} textAnchor="middle" fill="#0D9488" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={700} fontSize={12} letterSpacing="0.06em">
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
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/edu/cosmic-calendar', label: '코스믹 캘린더' },
          { href: '/tools/edu/sci-units', label: '과학 단위 변환' },
          { href: '/tools/edu/cognitive-test', label: '인지 테스트' }
        ]}
      >
        교육·흥미 목적의 시각화입니다.
      </Disclaimer>

      {/* 입력 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>내 정보 입력</span>
          <span className={s.cardLabelHint}>몸무게·나이</span>
        </div>
        <div className={s.gridThree}>
          <div>
            <label className={s.subLabel} htmlFor="pc-weight">몸무게 (kg)</label>
            <div className={s.sliderRow}>
              <input id="pc-weight" type="range" min={20} max={150} step={1} value={weight} onChange={e => setWeight(Number(e.target.value))} />
              <span className={s.sliderValue}>{weight}kg</span>
            </div>
          </div>
          <div>
            <label className={s.subLabel} htmlFor="pc-age">나이 (만)</label>
            <div className={s.sliderRow}>
              <input id="pc-age" type="range" min={0} max={100} step={1} value={age} onChange={e => setAge(Number(e.target.value))} />
              <span className={s.sliderValue}>{age}세</span>
            </div>
          </div>
          <div>
            <label className={s.subLabel} htmlFor="pc-name">이름 (선택, 공유 카드용)</label>
            <input id="pc-name" className={s.textInput} type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="예: 홍길동" maxLength={20} />
          </div>
        </div>

        <div className={s.presetRow} style={{ marginTop: 12 }}>
          <button className={`${s.presetBtn} ${weight === 75 && age === 35 ? s.presetActive : ''}`} onClick={() => applyPreset('maleAvg')}   type="button">평균 한국 성인 남성 (75kg, 35세)</button>
          <button className={`${s.presetBtn} ${weight === 60 && age === 35 ? s.presetActive : ''}`} onClick={() => applyPreset('femaleAvg')} type="button">평균 한국 성인 여성 (60kg, 35세)</button>
          {/* ⚠️ 예전에는 onClick이 빈 함수라 눌러도 아무 일이 없었다. 실제로 입력 칸으로 보낸다. */}
          <button className={s.presetBtn} type="button"
            onClick={() => { document.getElementById('pc-weight')?.focus() }}>내 정보 직접 입력 ↓</button>
        </div>
      </div>

      {/* 슬라이더를 움직이면 카드 8장이 한꺼번에 바뀐다 — 전체를 읽지 않도록 요약만 알린다 */}
      <p className={s.srOnly} role="status" aria-live="polite">
        몸무게 {weight}kg · 나이 {age}세 기준으로 {selected.size}개 행성 값을 갱신했습니다.
      </p>

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
                aria-pressed={active}
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
        <p className={s.sizeCompareTitle}>8개 행성 크기 비교</p>
        <div className={s.sizeCompareWrap}>
          {sizeSvg}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 8, lineHeight: 1.7 }}>
          지구를 1.0× 기준으로 한 실제 비율 · 목성은 지구를 1,300개 넣을 수 있는 크기
        </p>
      </div>

      {/* 행성 카드 그리드 */}
      <div className={s.planetGrid}>
        {filteredCalcs.map(c => {
          const p = c.planet
          return (
            <div key={p.id} className={`${s.planetCard} ${BORDER_CLS[p.id] ?? ''}`}>
              <div className={s.planetCardHeader}>
                <span className={s.planetCardEmoji}>{p.emoji}</span>
                <span className={s.planetCardName}>{p.name}<span className={s.planetCardNameEn}>{p.nameEn}</span></span>
              </div>
              <div className={s.planetIllustration}>
                <PlanetIllustration planet={p} size={88} />
              </div>
              <div className={s.planetStats}>
                <div className={s.planetStatItem}>
                  체중계 눈금
                  <strong>{round(c.weightOnPlanet, 1)} kg</strong>
                  {/* 질량은 어디서든 그대로다. 바뀌는 것은 저울이 읽는 값(=무게). */}
                  <span className={s.planetStatHint}>
                    질량 {weight}kg 그대로 · 무게 {fmt(round(weight * p.gravityRatio * 9.80665))} N
                  </span>
                </div>
                <div className={s.planetStatItem}>
                  점프 높이
                  <strong>{round(c.jumpHeight, 2)} m</strong>
                  <span className={s.planetStatHint}>지구 50cm 기준</span>
                </div>
                <div className={s.planetStatItem}>
                  내 나이
                  <strong>{round(c.ageOnPlanet, 1)} 년</strong>
                  <span className={s.planetStatHint}>{p.name}년 단위</span>
                </div>
                <div className={s.planetStatItem}>
                  하루 (태양일)
                  <strong>
                    {c.dayLengthHours >= 48 ? `${fmt(round(c.dayLengthHours / 24, 1))}일` : `${round(c.dayLengthHours, 1)}h`}
                    {c.isRetrograde && <span className={s.retroFlag}>역행</span>}
                  </strong>
                  <span className={s.planetStatHint}>
                    자전 {c.rotationHours >= 48 ? `${fmt(round(c.rotationHours / 24, 1))}일` : `${round(c.rotationHours, 1)}h`}
                  </span>
                </div>
                <div className={s.planetStatItem}>
                  평균 온도
                  <strong>{p.surfaceTempC.avg}°C</strong>
                  <span className={s.planetStatHint}>지구 15°C</span>
                </div>
                <div className={s.planetStatItem}>
                  거리 (가장 가까울 때)
                  <strong>{p.id === 'earth' ? '—' : fmtDistance(c.dist.minKm)}</strong>
                  <span className={s.planetStatHint}>
                    {p.id === 'earth' ? '여기가 기준' : `빛 ${fmtLightTime(c.dist.minLightMin)} · 가장 멀 땐 ${fmtLightTime(c.dist.maxLightMin)}`}
                  </span>
                </div>
              </div>
              <div className={s.funFact}>
                <strong>재미있는 사실:</strong> {p.funFact}
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
        <div className="tableScroll">
          <table className={s.compareTable} style={{ minWidth: 540 }}>
            <thead>
              <tr>
                <th scope="col">행성</th>
                <th scope="col">반지름</th>
                <th scope="col">지구 대비</th>
                <th scope="col">중력</th>
                <th scope="col">내 몸무게</th>
                <th scope="col">점프</th>
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
          <span>중력 낙하 시뮬레이션</span>
          <span className={s.cardLabelHint}>같은 높이에서 동시 낙하 · 지구가 3초 걸리는 높이 기준</span>
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
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 18, lineHeight: 1.7, textAlign: 'center' }}>
          중력이 클수록 빨리 떨어집니다. 목성에서는 약 <strong style={{ color: '#EA580C' }}>1.5배 빠르게</strong>, 화성에서는 <strong style={{ color: '#DC2626' }}>1.6배 천천히</strong> 떨어집니다.
        </p>
      </div>

      {/* 시간 비교 표 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>시간 비교</span>
          <span className={s.cardLabelHint}>1년·1일·생일</span>
        </div>
        <div className="tableScroll">
          <table className={s.compareTable} style={{ minWidth: 540 }}>
            <thead>
              <tr>
                <th scope="col">행성</th>
                <th scope="col">1년</th>
                <th scope="col">1일</th>
                <th scope="col">내 나이</th>
                <th scope="col">1년 동안 생일</th>
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
          <span className={s.cardLabelHint}>지구에서 가장 가까울 때 ~ 가장 멀 때</span>
        </div>
        <div className="tableScroll">
          <table className={s.compareTable} style={{ minWidth: 460 }}>
            <thead>
              <tr>
                <th scope="col">행성</th>
                <th scope="col">거리 (가장 가까울 때)</th>
                <th scope="col">빛 도달 시간 (최소~최대)</th>
              </tr>
            </thead>
            <tbody>
              {filteredCalcs.filter(c => c.planet.id !== 'earth').map(c => (
                <tr key={c.planet.id}>
                  <td>
                    <span className={s.planetDot} style={{ background: c.planet.color }} />
                    {c.planet.name}
                  </td>
                  <td>{c.planet.id === 'earth' ? '—' : fmtDistance(c.dist.minKm)}</td>
                  <td>{c.planet.id === 'earth' ? '—' : `${fmtLightTime(c.dist.minLightMin)} ~ ${fmtLightTime(c.dist.maxLightMin)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
          💡 지금 화성에 메시지를 보내면 빛의 속도로 약 <strong style={{ color: '#DC2626' }}>13분</strong>이 걸립니다. 해왕성까지는 약 <strong style={{ color: '#3E5BFF' }}>4시간</strong>.
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
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            중력 {round(recommended.planet.gravityRatio, 2)}g (체중계 {round(recommended.weightOnPlanet, 1)}kg) · 하루 {recommended.dayLengthHours >= 48 ? `${round(recommended.dayLengthHours / 24, 1)}일` : `${round(recommended.dayLengthHours, 1)}h`} · 평균 {recommended.planet.surfaceTempC.avg}°C
          </span>
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
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
          이 도구는 표면 중력만 고려한 가상 시나리오입니다.
        </p>
      </div>

      <div className={s.sourceCard}>
        <strong>데이터 출처:</strong> 행성 데이터는 NASA Solar System Exploration 기준입니다.
        거리는 <strong>궤도 반지름의 차·합</strong>으로 구한 값입니다(원 궤도로 단순화한 근사). 두 행성이 태양을 도는 위치에 따라 최소~최대 사이에서 계속 변합니다 — 화성은 가장 가까울 때와 멀 때가 7배 넘게 차이 납니다.
        정확한 천문 데이터는 NASA, KASI(한국천문연구원) 등 공식 기관 자료를 참조하세요.
      </div>
    </div>
  )
}
