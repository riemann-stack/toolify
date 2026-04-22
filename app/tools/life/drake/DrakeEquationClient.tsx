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
  if (n < 1_000_000_000)   return (n / 1_000_000).toFixed(2) + '백만'
  if (n < 1_000_000_000_000) return (n / 1_000_000_000).toFixed(2) + '억'
  return n.toExponential(2)
}

function formatL(L: number): string {
  if (L < 1000) return `${Math.round(L).toLocaleString()}년`
  if (L < 1_000_000) return `${(L / 1000).toFixed(1)}천년`
  if (L < 1_000_000_000) return `${(L / 1_000_000).toFixed(2)}백만년`
  return `${(L / 1_000_000_000).toFixed(2)}억년`
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
    const text =
      `나의 드레이크 방정식 결과: 은하에 약 ${formatN(N)}개의 지적 문명이 있습니다!\n` +
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
          className={`${styles.presetBtn} ${styles.presetOpt} ${activePreset === 'optimistic' ? styles.presetActive : ''}`}
          onClick={() => applyPreset('optimistic')}
        >
          <span className={styles.presetEmoji}>🌌</span>
          <span className={styles.presetName}>낙관론</span>
          <span className={styles.presetSub}>칼 세이건 추정</span>
        </button>
        <button
          className={`${styles.presetBtn} ${styles.presetReal} ${activePreset === 'realistic' ? styles.presetActive : ''}`}
          onClick={() => applyPreset('realistic')}
        >
          <span className={styles.presetEmoji}>🔭</span>
          <span className={styles.presetName}>현실론</span>
          <span className={styles.presetSub}>과학계 중앙값</span>
        </button>
        <button
          className={`${styles.presetBtn} ${styles.presetPes} ${activePreset === 'pessimistic' ? styles.presetActive : ''}`}
          onClick={() => applyPreset('pessimistic')}
        >
          <span className={styles.presetEmoji}>🤔</span>
          <span className={styles.presetName}>비관론</span>
          <span className={styles.presetSub}>페르미 역설</span>
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
      </div>

      {/* 스케일 */}
      <div className={styles.scaleCard}>
        <p className={styles.scaleText}>
          우리 은하의 별 <strong>3,000억 개</strong> 중
          약 <strong className={styles.scaleN}>{formatN(N)}개</strong>의 별에
          교신 가능한 문명이 있을 수 있습니다
        </p>
        <p className={styles.scaleRatio}>
          (전체 대비 <strong>{ratioPct < 0.00001 ? ratioPct.toExponential(2) : ratioPct.toFixed(8)}%</strong>)
        </p>
      </div>

      {/* 은하 SVG */}
      <div className={styles.galaxyCard}>
        <div className={styles.galaxyLabel}>우리 은하 시뮬레이션</div>
        <Galaxy highlightCount={highlightCount} />
        <p className={styles.galaxyHint}>
          🌟 초록색 별 <strong>{highlightCount}개</strong> = 교신 가능 문명 위치
        </p>
      </div>

      {/* 기여도 차트 */}
      <div className={styles.contribCard}>
        <div className={styles.contribLabel}>변수별 기여도 (누적 곱)</div>
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
          막대가 크게 줄어드는 구간이 결과의 <strong>병목</strong>입니다
        </p>
      </div>

      {/* 공유 */}
      <div className={styles.shareRow}>
        <button className={`${styles.shareBtn} ${shareCopied ? styles.shareBtnDone : ''}`} onClick={handleShare}>
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
    let seed = 42
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
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
          fill="#C8FF3E"
          className={styles.highlightStar}
          style={{ animationDelay: `${(i % 10) * 0.15}s` }}
        />
      ))}
    </svg>
  )
}
