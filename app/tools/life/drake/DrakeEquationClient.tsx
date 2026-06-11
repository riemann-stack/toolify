'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import styles from './drake.module.css'

/* ──────────────────────── 타입 & 프리셋 ──────────────────────── */
type DrakeParams = {
  rStar: number
  fp:    number
  ne:    number
  fl:    number
  fi:    number
  fc:    number
  L:     number
}

type PresetId = 'optimistic' | 'realistic' | 'pessimistic' | null

const PRESETS: Record<Exclude<PresetId, null>, DrakeParams> = {
  optimistic:  { rStar: 10, fp: 0.9, ne: 2,   fl: 0.9,   fi: 0.9,  fc: 0.9,  L: 1_000_000 },
  realistic:   { rStar: 3,  fp: 0.5, ne: 1,   fl: 0.5,   fi: 0.5,  fc: 0.1,  L: 10_000    },
  pessimistic: { rStar: 1,  fp: 0.2, ne: 0.5, fl: 0.001, fi: 0.01, fc: 0.01, L: 100       },
}

const MILKY_WAY_STARS = 300_000_000_000 // 3000억

/* 거리 계산 — 우리 은하를 디스크로 가정 */
const GALAXY_RADIUS_LY = 50_000          // 광년 (반경)
const GALAXY_THICKNESS_LY = 1_000        // 광년 (디스크 두께)
const GALAXY_VOLUME_LY3 = Math.PI * GALAXY_RADIUS_LY * GALAXY_RADIUS_LY * GALAXY_THICKNESS_LY
const STARS_IN_RADIO_RANGE = 28_000      // 126광년(인류 전파권) 내 별 약 28,000개 ≈ 100ly 내 ~14,000 × (126/100)³

type DistanceEstimate = {
  averageDistance: number
  nearestDistance: number
  roundTripCommYears: number
  potentialContactsInRange: number
  rangeLabel: 'low' | 'medium' | 'high'
}

function calcDistance(N: number): DistanceEstimate | null {
  if (!isFinite(N) || N <= 0) return null
  const averageDistance = Math.pow(GALAXY_VOLUME_LY3 / N, 1 / 3)
  const nearestDistance = averageDistance * 0.55  // Poisson 통계 근사
  const roundTripCommYears = nearestDistance * 2
  const potentialContactsInRange = N * (STARS_IN_RADIO_RANGE / MILKY_WAY_STARS)
  const rangeLabel: DistanceEstimate['rangeLabel'] =
    potentialContactsInRange > 1 ? 'high'
      : potentialContactsInRange > 0.1 ? 'medium' : 'low'
  return { averageDistance, nearestDistance, roundTripCommYears, potentialContactsInRange, rangeLabel }
}

function fmtLy(ly: number): string {
  if (!isFinite(ly)) return '—'
  if (ly < 1) return ly.toFixed(2) + ' 광년'
  if (ly < 10_000) return Math.round(ly).toLocaleString('ko-KR') + ' 광년'
  if (ly < 1_000_000) return (ly / 1000).toFixed(1) + '천 광년'
  return ly.toExponential(2) + ' 광년'
}

function fmtYears(y: number): string {
  if (!isFinite(y)) return '—'
  if (y < 10_000) return Math.round(y).toLocaleString('ko-KR') + '년'
  if (y < 1_000_000) return (y / 1000).toFixed(1) + '천년'
  return (y / 1_000_000).toFixed(2) + '백만년'
}

/* 페르미 역설 가설 추천 */
type FermiHypothesis = {
  id: string
  emoji: string
  title: string
  desc: string
  weight: (n: number) => number  // 0~1, 높을수록 가능성
}

const FERMI_HYPOTHESES: FermiHypothesis[] = [
  {
    id: 'rare-earth', emoji: '🌍', title: '레어 어스 (희귀 지구)',
    desc: '지구 같은 안정된 항성·달·자기장·판 구조 조합이 극히 드물다는 가설. N이 작을수록 유력.',
    weight: n => n < 1 ? 1 : n < 10 ? 0.9 : n < 100 ? 0.4 : 0.05,
  },
  {
    id: 'great-filter', emoji: '🚧', title: '대필터',
    desc: '문명이 특정 단계에서 거의 모두 멸종한다는 가설. 인류 앞에 필터가 있다면 미래는 어둡다.',
    weight: n => n < 10 ? 0.5 : n < 10_000 ? 0.95 : 0.7,
  },
  {
    id: 'too-loud', emoji: '📡', title: '우리가 너무 시끄러움',
    desc: '인류 전파는 약 126광년만 도달. 다른 문명은 더 멀리 있어 신호가 아직 미도달.',
    weight: n => n < 100 ? 0.3 : n < 100_000 ? 0.85 : 0.6,
  },
  {
    id: 'zoo', emoji: '🦒', title: '동물원 가설',
    desc: '외계 문명이 인류를 의도적으로 관찰만 하고 접촉하지 않는다는 가설.',
    weight: n => n < 1000 ? 0.2 : n < 1_000_000 ? 0.7 : 0.85,
  },
  {
    id: 'post-bio', emoji: '🤖', title: '이미 지나쳐 감 (디지털 문명)',
    desc: '초문명은 생물학을 벗어나 디지털·기계 존재로 진화해 전파 통신을 하지 않음.',
    weight: n => n < 10_000 ? 0.1 : n < 1_000_000 ? 0.4 : 0.85,
  },
]

function suggestFermi(N: number): FermiHypothesis[] {
  if (!isFinite(N) || N <= 0) {
    return [FERMI_HYPOTHESES[0]]  // 레어 어스
  }
  return [...FERMI_HYPOTHESES]
    .map(h => ({ ...h, w: h.weight(N) }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 2)
}

/* 배지 (N에 따라) */
function getBadge(N: number): { emoji: string; label: string } {
  if (N < 1) return { emoji: '🌑', label: '비관론자' }
  if (N < 100) return { emoji: '🔭', label: '현실론자' }
  if (N < 10_000) return { emoji: '🌟', label: '균형론자' }
  if (N < 1_000_000) return { emoji: '☀️', label: '낙관론자' }
  return { emoji: '🌌', label: '초낙관론자' }
}

/* ──────────────────────── 공식 ──────────────────────── */
function calculateDrake(p: DrakeParams): number {
  return p.rStar * p.fp * p.ne * p.fl * p.fi * p.fc * p.L
}

/* 로그 스케일 변환: 0~100 slider → [min, max] 로그 분포 */
function logSliderToValue(sliderVal: number, min: number, max: number): number {
  const minLog = Math.log10(min)
  const maxLog = Math.log10(max)
  return Math.pow(10, minLog + (maxLog - minLog) * (sliderVal / 100))
}
function valueToLogSlider(value: number, min: number, max: number): number {
  const minLog = Math.log10(min)
  const maxLog = Math.log10(max)
  return ((Math.log10(value) - minLog) / (maxLog - minLog)) * 100
}

/* 숫자 포맷 */
function formatN(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '—'
  if (n < 0.001) return n.toExponential(2)
  if (n < 1)     return n.toFixed(3)
  if (n < 100)   return n.toFixed(1)
  if (n < 1_000_000)       return Math.round(n).toLocaleString('ko-KR')
  if (n < 100_000_000)     return (n / 1_000_000).toFixed(2) + '백만'      // 1e6 ~ 1e8
  if (n < 1_000_000_000_000) return (n / 100_000_000).toFixed(2) + '억'    // 1억(1e8) ~ 1조
  return n.toExponential(2)
}

function formatL(L: number): string {
  if (L < 1000) return `${Math.round(L).toLocaleString()}년`
  if (L < 1_000_000) return `${(L / 1000).toFixed(1)}천년`
  if (L < 100_000_000) return `${(L / 1_000_000).toFixed(2)}백만년`
  return `${(L / 100_000_000).toFixed(2)}억년`
}

/* 결과 메시지 */
function getMessage(N: number): { msg: string; tone: 'low' | 'mid' | 'high' | 'ultra' } {
  if (N < 1)       return { msg: '우리가 은하에서 유일한 문명일 수 있습니다... 🌌', tone: 'low'  }
  if (N <= 10)     return { msg: '손에 꼽을 정도의 문명이 존재할 수 있습니다 🔭',    tone: 'mid'  }
  if (N <= 100)    return { msg: '수십 개의 문명이 은하 어딘가에 있을지도 모릅니다 👽', tone: 'mid'  }
  if (N <= 10_000) return { msg: '수백~수천 개의 문명이 교신을 기다리고 있을지도요! 📡', tone: 'high' }
  return                  { msg: '은하는 문명으로 가득 차 있습니다! 왜 아직 못 만났을까요? 🤯', tone: 'ultra' }
}

/* 변수 정의 */
const VARIABLES = [
  { id: 'rStar', symbol: 'R*',  name: '은하 내 별 생성률',    unit: '개/년',
    desc: '우리 은하에서 매년 새로 태어나는 별의 수', note: '현재 추정 약 1~3개/년',
    min: 1,     max: 10,        step: 0.5,   log: false },
  { id: 'fp',    symbol: 'fp',  name: '행성 보유 별 비율',    unit: '',
    desc: '별 중 행성계를 가진 비율',                   note: '케플러 관측 기준 약 50% 이상',
    min: 0.1,   max: 1.0,       step: 0.05,  log: false },
  { id: 'ne',    symbol: 'ne',  name: '거주 가능 행성 수',     unit: '개',
    desc: '행성계 내 골디락스 존 행성 수',              note: '태양계 기준 0.5~2개 추정',
    min: 0.1,   max: 5,         step: 0.1,   log: false },
  { id: 'fl',    symbol: 'fl',  name: '생명체 발생 확률',      unit: '',
    desc: '거주 가능 행성에서 실제 생명이 발생할 확률', note: '지구 외 생명 발견 시 급상승',
    min: 0.001, max: 1.0,       step: 0,     log: true  },
  { id: 'fi',    symbol: 'fi',  name: '지적 생명체 진화 확률', unit: '',
    desc: '생명체가 지능 형태로 진화할 확률',           note: '지구 기준 1회, 수렴 진화 근거로 높게 보기도',
    min: 0.001, max: 1.0,       step: 0,     log: true  },
  { id: 'fc',    symbol: 'fc',  name: '교신 기술 개발 확률',    unit: '',
    desc: '지적 생명체가 우주 신호를 보낼 기술을 개발할 확률', note: '기술 문명의 지속이 관건',
    min: 0.001, max: 1.0,       step: 0,     log: true  },
  { id: 'L',     symbol: 'L',   name: '문명 존속 기간',        unit: '년',
    desc: '교신 가능한 문명이 존재하는 평균 기간',       note: '인류 수천 년 / 핵·기후 위험',
    min: 1,     max: 100_000_000, step: 0,   log: true  },
] as const

type VarId = typeof VARIABLES[number]['id']

/* ──────────────────────── 메인 ──────────────────────── */
export default function DrakeEquationClient({ initial }: { initial?: Partial<DrakeParams> } = {}) {
  const [params, setParams] = useState<DrakeParams>(() => ({
    ...PRESETS.realistic,
    ...initial,
  }))
  const [activePreset, setActivePreset] = useState<PresetId>(
    initial && Object.keys(initial).length > 0 ? null : 'realistic'
  )
  const [shareCopied, setShareCopied] = useState(false)

  /* 프리셋 적용 (부드러운 전환) */
  const animRef = useRef<number | null>(null)
  const applyPreset = (id: Exclude<PresetId, null>) => {
    if (animRef.current != null) cancelAnimationFrame(animRef.current)
    const from = { ...params }
    const to = PRESETS[id]
    const start = performance.now()
    const DURATION = 450
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      const ease = 1 - Math.pow(1 - t, 3)
      setParams({
        rStar: from.rStar + (to.rStar - from.rStar) * ease,
        fp:    from.fp    + (to.fp    - from.fp   ) * ease,
        ne:    from.ne    + (to.ne    - from.ne   ) * ease,
        fl:    Math.pow(10, Math.log10(from.fl) + (Math.log10(to.fl) - Math.log10(from.fl)) * ease),
        fi:    Math.pow(10, Math.log10(from.fi) + (Math.log10(to.fi) - Math.log10(from.fi)) * ease),
        fc:    Math.pow(10, Math.log10(from.fc) + (Math.log10(to.fc) - Math.log10(from.fc)) * ease),
        L:     Math.pow(10, Math.log10(from.L)  + (Math.log10(to.L)  - Math.log10(from.L))  * ease),
      })
      if (t < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    setActivePreset(id)
  }

  useEffect(() => () => {
    if (animRef.current != null) cancelAnimationFrame(animRef.current)
  }, [])

  const handleSlider = (id: VarId, raw: number, log: boolean, min: number, max: number) => {
    const value = log ? logSliderToValue(raw, min, max) : raw
    setParams(p => ({ ...p, [id]: value }))
    setActivePreset(null)
  }

  const N = useMemo(() => calculateDrake(params), [params])
  const { msg, tone } = getMessage(N)
  const ratioPct = (N / MILKY_WAY_STARS) * 100
  const highlightCount = Math.min(50, Math.max(0, Math.floor(Math.log10(N + 1) * 15)))
  const distance = useMemo(() => calcDistance(N), [N])
  const fermiTop = useMemo(() => suggestFermi(N), [N])
  const badge = getBadge(N)

  /* 기여도 (누적 곱) */
  const contribution = useMemo(() => {
    const seq = [
      { label: 'R*',  value: params.rStar },
      { label: '× fp', value: params.fp    },
      { label: '× ne', value: params.ne    },
      { label: '× fl', value: params.fl    },
      { label: '× fi', value: params.fi    },
      { label: '× fc', value: params.fc    },
      { label: '× L',  value: params.L     },
    ]
    let cum = 1
    return seq.map(s => {
      cum *= s.value
      return { label: s.label, cum }
    })
  }, [params])

  const contribMax = Math.max(...contribution.map(c => Math.log10(Math.max(c.cum, 1e-12))))
  const contribMin = Math.min(...contribution.map(c => Math.log10(Math.max(c.cum, 1e-12))))

  /* URL */
  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const qs = new URLSearchParams({
      r:  params.rStar.toFixed(2),
      fp: params.fp.toFixed(4),
      ne: params.ne.toFixed(3),
      fl: params.fl.toExponential(3),
      fi: params.fi.toExponential(3),
      fc: params.fc.toExponential(3),
      l:  Math.round(params.L).toString(),
    })
    return `${window.location.origin}/tools/life/drake?${qs.toString()}`
  }, [params])

  const handleShare = async () => {
    const distText = distance
      ? `\n📏 가장 가까운 문명: ${fmtLy(distance.nearestDistance)} · 왕복 통신 ${fmtYears(distance.roundTripCommYears)}`
      : ''
    const text =
      `나의 드레이크 방정식 결과: 은하에 약 ${formatN(N)}개의 지적 문명 (${badge.emoji} ${badge.label})!${distText}\n` +
      `R*=${params.rStar.toFixed(1)} / fp=${params.fp.toFixed(2)} / ne=${params.ne.toFixed(1)} / ` +
      `fl=${params.fl.toExponential(1)} / fi=${params.fi.toExponential(1)} / fc=${params.fc.toExponential(1)} / ` +
      `L=${formatL(params.L)}\n` +
      `${shareUrl}`
    try {
      await navigator.clipboard.writeText(text)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={styles.wrap}>
      {/* 프리셋 */}
      <div className={styles.presetRow}>
        <button
          type="button"
          aria-pressed={activePreset === 'optimistic'}
          className={`${styles.presetBtn} ${styles.presetOpt} ${activePreset === 'optimistic' ? styles.presetActive : ''}`}
          onClick={() => applyPreset('optimistic')}
        >
          <span className={styles.presetEmoji}>🌌</span>
          <span className={styles.presetName}>낙관론</span>
          <span className={styles.presetSub}>칼 세이건 추정</span>
        </button>
        <button
          type="button"
          aria-pressed={activePreset === 'realistic'}
          className={`${styles.presetBtn} ${styles.presetReal} ${activePreset === 'realistic' ? styles.presetActive : ''}`}
          onClick={() => applyPreset('realistic')}
        >
          <span className={styles.presetEmoji}>🔭</span>
          <span className={styles.presetName}>현실론</span>
          <span className={styles.presetSub}>중간 가정 (예시)</span>
        </button>
        <button
          type="button"
          aria-pressed={activePreset === 'pessimistic'}
          className={`${styles.presetBtn} ${styles.presetPes} ${activePreset === 'pessimistic' ? styles.presetActive : ''}`}
          onClick={() => applyPreset('pessimistic')}
        >
          <span className={styles.presetEmoji}>🤔</span>
          <span className={styles.presetName}>비관론</span>
          <span className={styles.presetSub}>레어 어스 가정</span>
        </button>
      </div>

      {/* 슬라이더 */}
      <div className={styles.slidersCard}>
        {VARIABLES.map(v => {
          const val = params[v.id as VarId]
          const sliderVal = v.log
            ? valueToLogSlider(val, v.min, v.max)
            : val
          const pct = v.log
            ? sliderVal
            : ((val - v.min) / (v.max - v.min)) * 100
          const display = v.log
            ? (val < 0.01 ? val.toExponential(2) : val < 1 ? val.toFixed(3) : formatN(val))
            : (val < 1 ? val.toFixed(2) : val.toFixed(1))
          return (
            <div key={v.id} className={styles.varRow}>
              <div className={styles.varHead}>
                <span className={styles.varSym}>{v.symbol}</span>
                <span className={styles.varName}>{v.name}</span>
                <span className={styles.varVal}>
                  {display}{v.unit && <span className={styles.varUnit}>{v.unit}</span>}
                </span>
              </div>
              <p className={styles.varDesc}>{v.desc}</p>
              <input
                className={styles.slider}
                type="range"
                aria-label={`${v.name} (${v.symbol})`}
                aria-valuetext={`${display}${v.unit ? ' ' + v.unit : ''}`}
                min={v.log ? 0 : v.min}
                max={v.log ? 100 : v.max}
                step={v.log ? 0.1 : v.step}
                value={sliderVal}
                onChange={e => handleSlider(
                  v.id as VarId,
                  parseFloat(e.target.value),
                  v.log, v.min, v.max
                )}
                style={{
                  background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--bg3) ${pct}%, var(--bg3) 100%)`,
                }}
              />
              {v.log && (
                <div className={styles.logMarks}>
                  {v.id === 'L'
                    ? ['1', '100', '1만', '100만', '1억'].map(m => <span key={m}>{m}</span>)
                    : ['0.001', '0.01', '0.1', '1'].map(m => <span key={m}>{m}</span>)}
                </div>
              )}
              <p className={styles.varNote}>💡 {v.note}</p>
            </div>
          )
        })}
      </div>

      {/* 결과 히어로 */}
      <div className={`${styles.hero} ${styles['heroTone_' + tone]}`}>
        <div className={styles.heroLabel}>교신 가능한 문명 수 (N)</div>
        <CountUp value={N} />
        <div className={styles.heroUnit}>개의 문명</div>
        <p className={styles.heroMsg}>{msg}</p>
        <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          은하 내 교신 가능 문명 약 {formatN(N)}개 · {badge.label}
        </span>
      </div>

      {/* 스케일 + 배지 */}
      <div className={styles.scaleCard}>
        <p className={styles.scaleText}>
          우리 은하의 별 <strong>3,000억 개</strong> 중
          약 <strong className={styles.scaleN}>{formatN(N)}개</strong>의 별에
          교신 가능한 문명이 있을 수 있습니다
        </p>
        <p className={styles.scaleRatio}>
          (전체 대비 <strong>{ratioPct < 0.00001 ? ratioPct.toExponential(2) : ratioPct.toFixed(8)}%</strong>)
        </p>
        <p className={styles.badge}>
          당신은 <strong>{badge.emoji} {badge.label}</strong>입니다
        </p>
      </div>

      {/* 거리·통신 카드 */}
      {distance && (
        <div className={styles.distCard}>
          <div className={styles.distLabel}>📏 거리·통신 추정 (N = {formatN(N)})</div>
          {N < 1 ? (
            <p className={styles.distHint} style={{ margin: 0 }}>
              🌑 기대 문명 수가 <strong>1개 미만</strong>입니다. 은하 안에 우리뿐일 가능성이 높아,
              균등 분포(은하 반경 5만 광년) 모델로는 &lsquo;가장 가까운 문명까지의 거리&rsquo;를 의미 있게 추정할 수 없습니다.
              (N ≥ 1에서만 거리·통신 추정을 표시합니다.)
            </p>
          ) : (
            <>
              <div className={styles.distGrid}>
                <div className={styles.distItem}>
                  <div className={styles.distItemLabel}>평균 문명 간 거리</div>
                  <div className={styles.distItemValue}>{fmtLy(distance.averageDistance)}</div>
                </div>
                <div className={styles.distItem}>
                  <div className={styles.distItemLabel}>가장 가까운 문명</div>
                  <div className={styles.distItemValue} style={{ color: '#DC2626' }}>{fmtLy(distance.nearestDistance)}</div>
                </div>
                <div className={styles.distItem}>
                  <div className={styles.distItemLabel}>왕복 통신 시간</div>
                  <div className={styles.distItemValue}>{fmtYears(distance.roundTripCommYears)}</div>
                </div>
                <div className={styles.distItem}>
                  <div className={styles.distItemLabel}>인류 전파권 (126광년) 내</div>
                  <div className={styles.distItemValue} style={{
                    color: distance.rangeLabel === 'high' ? '#059669'
                      : distance.rangeLabel === 'medium' ? '#FFD93E' : '#EA580C',
                  }}>
                    {distance.potentialContactsInRange < 0.001
                      ? distance.potentialContactsInRange.toExponential(2)
                      : distance.potentialContactsInRange.toFixed(3)}개
                  </div>
                </div>
              </div>
              <p className={styles.distHint}>
                {distance.rangeLabel === 'high'
                  ? '🟢 인류 전파(1900~) 도달권 안에 외계 문명이 존재할 가능성 — 신호를 기다리거나 보내볼 만한 시기.'
                  : distance.rangeLabel === 'medium'
                  ? '🟡 인류 전파권 안에 문명이 있을 확률은 낮지만 가능. 가장 가까운 문명도 광년 단위로 멀음.'
                  : '🔴 인류 전파(현재 126광년)는 가장 가까운 문명에 아직 도달하지 못함. 균등 분포 가정의 한계 — 실제는 나선팔 집중 가능성.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* 페르미 역설 가설 추천 */}
      {fermiTop.length > 0 && (
        <div className={styles.fermiCard}>
          <div className={styles.distLabel}>🤔 N = {formatN(N)}에 어울리는 페르미 역설 가설 (참고용)</div>
          <div className={styles.fermiList}>
            {fermiTop.map((h, i) => (
              <div key={h.id} className={styles.fermiItem}>
                <span className={styles.fermiRank}>{i === 0 ? '1순위' : '2순위'}</span>
                <div style={{ flex: 1 }}>
                  <div className={styles.fermiTitle}>{h.emoji} {h.title}</div>
                  <div className={styles.fermiDesc}>{h.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.distHint}>
            ※ 순위는 과학적 계산이 아니라 N 구간별 <strong>임의 가중치</strong>에 따른 참고용 사고 실험입니다. 5가지 가설 전체는 아래 [페르미 역설] 섹션 참고.
          </p>
        </div>
      )}

      {/* 은하 SVG (태양·전파권·가장 가까운 문명 강조) */}
      <div className={styles.galaxyCard}>
        <div className={styles.galaxyLabel}>우리 은하 시뮬레이션 (상징적 시각화)</div>
        <Galaxy highlightCount={highlightCount} />
        <p className={styles.galaxyHint}>
          🌟 초록 별 = 교신 가능 문명 · ☀ 태양 · 🔵 인류 전파권 · 🔴 최근접 문명 — <strong>상징적 표현</strong>으로, 별 개수·거리·전파권 크기는 실제 N·거리 결과와 다릅니다.
        </p>
      </div>

      {/* 기여도 차트 */}
      <div className={styles.contribCard}>
        <div className={styles.contribLabel}>계산 진행 과정 (변수를 순서대로 곱한 누적값)</div>
        <div className={styles.contribList}>
          {contribution.map((c, i) => {
            const lg = Math.log10(Math.max(c.cum, 1e-12))
            const pct = contribMax === contribMin
              ? 100
              : ((lg - contribMin) / (contribMax - contribMin)) * 100
            const prev = i > 0 ? Math.log10(Math.max(contribution[i - 1].cum, 1e-12)) : lg
            const drop = lg < prev
            return (
              <div key={c.label} className={styles.contribRow}>
                <span className={styles.contribName}>{c.label}</span>
                <div className={styles.contribBarWrap}>
                  <div
                    className={`${styles.contribBar} ${drop ? styles.contribBarDrop : styles.contribBarKeep}`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
                <span className={styles.contribVal}>{formatN(c.cum)}</span>
              </div>
            )
          })}
        </div>
        <p className={styles.contribHint}>
          막대가 크게 줄어드는 구간이 값을 가장 낮추는 변수 — 단, <strong>곱하는 순서에 따라 달라지므로</strong> 엄밀한 민감도 분석은 아닙니다.
        </p>
      </div>

      {/* 공유 */}
      <div className={styles.shareRow}>
        <button type="button" className={`${styles.shareBtn} ${shareCopied ? styles.shareBtnDone : ''}`} onClick={handleShare}>
          {shareCopied ? '✓ 링크와 결과가 복사되었습니다' : '🔗 결과 공유하기'}
        </button>
      </div>
    </div>
  )
}

/* ──────────────────────── 카운트업 ──────────────────────── */
function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    const start = performance.now()
    const DURATION = 320
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      const ease = 1 - Math.pow(1 - t, 3)
      // 로그 보간 (값 범위가 너무 넓어서)
      const fromSafe = Math.max(from, 1e-9)
      const toSafe = Math.max(to, 1e-9)
      const cur = Math.pow(10, Math.log10(fromSafe) + (Math.log10(toSafe) - Math.log10(fromSafe)) * ease)
      setDisplay(cur)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
        setDisplay(to)
      }
    }
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return <div className={styles.heroNum}>{formatN(display)}</div>
}

/* ──────────────────────── 은하 SVG ──────────────────────── */
function Galaxy({ highlightCount }: { highlightCount: number }) {
  // 씨드 고정 — 별 위치가 재렌더마다 변하지 않도록
  const stars = useMemo(() => {
    const s: { x: number; y: number; r: number; o: number }[] = []
    const seedRef = { v: 42 }
    const rand = () => {
      seedRef.v = (seedRef.v * 9301 + 49297) % 233280
      return seedRef.v / 233280
    }
    const STAR_COUNT = 260
    for (let i = 0; i < STAR_COUNT; i++) {
      // 나선팔 분포: 각 별을 두 나선팔 중 하나에 대부분 배치
      const isArm = rand() < 0.75
      let x = 150, y = 150
      if (isArm) {
        const arm = rand() < 0.5 ? 0 : Math.PI
        const t = rand() * 3.6 // 0 ~ 3.6 radians
        const radius = 12 + t * 32
        const jitter = (rand() - 0.5) * 18
        const theta = arm + t * 1.1
        x = 150 + Math.cos(theta) * radius + jitter
        y = 150 + Math.sin(theta) * radius + jitter
      } else {
        const r = rand() * 130
        const th = rand() * Math.PI * 2
        x = 150 + Math.cos(th) * r
        y = 150 + Math.sin(th) * r
      }
      s.push({
        x, y,
        r: 0.4 + rand() * 1.0,
        o: 0.3 + rand() * 0.5,
      })
    }
    return s
  }, [])

  // 강조 별 위치 (별 중 일부)
  const highlights = useMemo(() => {
    const picks: { x: number; y: number }[] = []
    const step = Math.max(1, Math.floor(stars.length / Math.max(1, highlightCount)))
    for (let i = 0; i < stars.length && picks.length < highlightCount; i += step) {
      picks.push({ x: stars[i].x, y: stars[i].y })
    }
    return picks
  }, [stars, highlightCount])

  // 태양 위치 (은하 중심에서 약 26,000광년 / 50,000 = 0.52)
  // viewBox 300 기준, 중심(150,150)에서 0.52 × 130 ≈ 67.6 떨어진 위치
  const SUN_X = 150 + Math.cos(Math.PI * 0.7) * 67.6  // ≈ 109.3
  const SUN_Y = 150 + Math.sin(Math.PI * 0.7) * 67.6  // ≈ 204.7
  const RADIO_RANGE_R = 8  // 시각적 강조 (실제 100ly는 너무 작음)

  // 가장 가까운 강조 별 (태양 기준)
  const nearest = useMemo(() => {
    if (highlights.length === 0) return null
    let best = highlights[0]
    let bestD = Infinity
    for (const h of highlights) {
      const d = (h.x - SUN_X) ** 2 + (h.y - SUN_Y) ** 2
      if (d < bestD) { bestD = d; best = h }
    }
    return best
  }, [highlights, SUN_X, SUN_Y])

  // 나선팔 경로
  const spiralPath = (armPhase: number) => {
    const pts: string[] = []
    for (let t = 0; t <= 3.6; t += 0.1) {
      const r = 10 + t * 32
      const th = armPhase + t * 1.1
      const x = 150 + Math.cos(th) * r
      const y = 150 + Math.sin(th) * r
      pts.push(`${t === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return pts.join(' ')
  }

  return (
    <svg className={styles.galaxySvg} viewBox="0 0 300 300" width="300" height="300" aria-hidden>
      <defs>
        <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="300" fill="#000000" />
      <circle cx="150" cy="150" r="140" fill="url(#galaxyCore)" />
      <path d={spiralPath(0)}         stroke="#ffffff" strokeOpacity="0.08" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d={spiralPath(Math.PI)}   stroke="#ffffff" strokeOpacity="0.08" strokeWidth="14" fill="none" strokeLinecap="round" />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
      ))}
      {highlights.map((h, i) => (
        <circle
          key={`h-${i}`}
          cx={h.x} cy={h.y} r={2.2}
          fill="#0EA5E9"
          className={styles.highlightStar}
          style={{ animationDelay: `${(i % 10) * 0.15}s` }}
        />
      ))}

      {/* 인류 전파권 (태양 중심 원) */}
      <circle cx={SUN_X} cy={SUN_Y} r={RADIO_RANGE_R}
        fill="rgba(8,145,178,0.08)" stroke="#0891B2" strokeWidth={0.8}
        strokeDasharray="2,2" />

      {/* 가장 가까운 문명 라인 + 강조 */}
      {nearest && nearest !== undefined && (
        <>
          <line x1={SUN_X} y1={SUN_Y} x2={nearest.x} y2={nearest.y}
            stroke="#DC2626" strokeWidth={0.6} strokeDasharray="2,2" opacity={0.55} />
          <circle cx={nearest.x} cy={nearest.y} r={3}
            fill="#DC2626" stroke="#fff" strokeWidth={0.5} />
        </>
      )}

      {/* 태양 (지구 위치) */}
      <circle cx={SUN_X} cy={SUN_Y} r={2.4} fill="#A16207" />
      <circle cx={SUN_X} cy={SUN_Y} r={4} fill="none" stroke="#A16207" strokeWidth={0.6} opacity={0.6} />
    </svg>
  )
}
