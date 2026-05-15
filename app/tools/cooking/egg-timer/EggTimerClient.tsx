'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './egg-timer.module.css'
import {
  type CalcInputs, type DonenessStage,
  DONENESS, SIZES, START_TEMPS, METHODS, RECIPES, TROUBLESHOOTS,
  calculate, fmtMS, fmtSec,
} from './eggUtils'

const STORAGE_KEY = 'youtil:egg-timer:v1'

const DEFAULT_INPUTS: CalcInputs = {
  donenessId: 'soft',
  sizeId: 'teuk',
  tempId: 'fridge',
  methodId: 'boil',
  count: 2,
  altitudeM: 0,
}

type TimerPhase = 'idle' | 'cooking' | 'cooling'

export default function EggTimerClient() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [activeRecipe, setActiveRecipe] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(0)  // 현재 시각 ms (hydration safe)

  // 타이머 상태
  const [phase, setPhase] = useState<TimerPhase>('idle')
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const lastTickRef = useRef<number>(0)

  /* localStorage 복원 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setInputs((prev) => ({ ...prev, ...parsed }))
      }
    } catch { /* ignore */ }
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)) } catch { /* ignore */ }
  }, [inputs, mounted])

  /* 현재 시각 (hydration 안전) — 1초마다 업데이트 */
  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const update = <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) => {
    setInputs((prev) => ({ ...prev, [k]: v }))
    setActiveRecipe(null)
  }

  const result = useMemo(() => calculate(inputs), [inputs])

  /* AudioContext */
  const getAudio = () => {
    if (!audioCtxRef.current) {
      const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
      const Ctx = W.AudioContext || W.webkitAudioContext
      if (Ctx) audioCtxRef.current = new Ctx()
    }
    return audioCtxRef.current
  }

  const beep = (count = 1, freq = 880, duration = 0.15) => {
    const ctx = getAudio()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    for (let i = 0; i < count; i++) {
      const start = ctx.currentTime + i * (duration + 0.1)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain).connect(ctx.destination)
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.2, start + 0.01)
      gain.gain.linearRampToValueAtTime(0.2, start + duration - 0.02)
      gain.gain.linearRampToValueAtTime(0, start + duration)
      osc.start(start)
      osc.stop(start + duration + 0.05)
    }
  }

  const notify = (title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'granted') {
      try { new Notification(title, { body, icon: '/favicon.ico' }) } catch { /* ignore */ }
    }
  }

  /* 타이머 동작 */
  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    lastTickRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const t = Date.now()
      const delta = (t - lastTickRef.current) / 1000
      lastTickRef.current = t
      setRemaining((prev) => {
        const next = prev - delta
        if (next <= 0) {
          setRunning(false)
          if (phase === 'cooking') {
            beep(3, 880, 0.25)
            notify('🥚 계란 완성!', '얼음물에 식히기를 시작하세요')
            // 5분 식히기 자동 시작
            setTimeout(() => {
              setPhase('cooling')
              setRemaining(5 * 60)
              setRunning(true)
            }, 800)
          } else {
            beep(3, 660, 0.25)
            notify('❄️ 식히기 완료', '이제 껍질을 벗기세요')
            setPhase('idle')
          }
          return 0
        }
        // 60·30·10초 비프
        const prevSec = Math.ceil(prev)
        const nextSec = Math.ceil(next)
        if (prevSec !== nextSec) {
          if (nextSec === 60) beep(1, 440, 0.15)
          if (nextSec === 30) beep(1, 550, 0.15)
          if (nextSec === 10) beep(1, 660, 0.1)
          if (nextSec <= 3 && nextSec > 0) beep(1, 660, 0.1)
        }
        return next
      })
    }, 100)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase])

  /* 타이머 컨트롤 */
  const startTimer = () => {
    setPhase('cooking')
    setRemaining(result.totalSec)
    setRunning(true)
    const ctx = getAudio()
    if (ctx && ctx.state === 'suspended') ctx.resume()
    // 알림 권한 요청
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => { /* ignore */ })
      }
    }
  }
  const pauseTimer = () => setRunning(false)
  const resumeTimer = () => {
    setRunning(true)
    const ctx = getAudio()
    if (ctx && ctx.state === 'suspended') ctx.resume()
  }
  const cancelTimer = () => {
    setRunning(false)
    setRemaining(0)
    setPhase('idle')
  }

  /* 종료 시각 */
  const endTime = useMemo(() => {
    if (now === 0) return null
    const ms = now + result.totalSec * 1000
    const d = new Date(ms)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }, [now, result.totalSec])

  const startTime = useMemo(() => {
    if (now === 0) return null
    const d = new Date(now)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }, [now])

  /* 레시피 적용 */
  const applyRecipe = (recipeId: string) => {
    const r = RECIPES.find((x) => x.id === recipeId)
    if (!r) return
    setInputs((prev) => ({
      ...prev,
      donenessId: r.donenessId,
      sizeId: r.sizeId,
      tempId: r.tempId,
      methodId: r.methodId,
    }))
    setActiveRecipe(recipeId)
  }

  const activeRecipeData = activeRecipe ? RECIPES.find((r) => r.id === activeRecipe) : null

  return (
    <div className={styles.wrap}>

      {/* ═══ 한국 요리 프리셋 ═══ */}
      <section>
        <label className={styles.label}>🍳 한국 요리 프리셋 빠른 적용</label>
        <div className={styles.recipeGrid}>
          {RECIPES.map((r) => (
            <button key={r.id}
              className={`${styles.recipeChip} ${activeRecipe === r.id ? styles.recipeChipActive : ''}`}
              onClick={() => applyRecipe(r.id)}>
              <span className={styles.recipeEmoji}>{r.emoji}</span>
              <span className={styles.recipeLabel}>{r.label.replace(/^[^\s]+\s/, '')}</span>
            </button>
          ))}
        </div>
        {activeRecipeData && (
          <div className={styles.recipeTip}>
            <strong>💡 {activeRecipeData.label.replace(/^[^\s]+\s/, '')} 팁:</strong>
            <p>{activeRecipeData.tip}</p>
          </div>
        )}
      </section>

      {/* ═══ 입력 영역 ═══ */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🥚 익힘 단계</p>
        {/* 컴팩트 — 이미지 없이 라벨 + 시간만, 4×2 그리드 */}
        <div className={styles.donenessCompactGrid}>
          {DONENESS.map((d) => (
            <button key={d.id}
              className={`${styles.donenessCompact} ${inputs.donenessId === d.id ? styles.donenessCompactActive : ''}`}
              onClick={() => update('donenessId', d.id)}>
              <span className={styles.donenessCompactLabel}>{d.label}</span>
              <span className={styles.donenessCompactTime}>{fmtMS(d.seconds)}</span>
            </button>
          ))}
        </div>
        <p className={styles.donenessDesc}>{result.doneness.description}</p>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>📏 한국 계란 크기</p>
        <div className={styles.pillRow}>
          {SIZES.map((s) => (
            <button key={s.id}
              className={`${styles.pill} ${inputs.sizeId === s.id ? styles.pillActive : ''}`}
              onClick={() => update('sizeId', s.id)}>
              {s.label}
              <span className={styles.pillSub}>{s.rangeG}</span>
            </button>
          ))}
        </div>
        <p className={styles.note}>특란 (마트 표준) 기준. 크기에 따라 ±15~45초 보정.</p>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🌡️ 시작 온도</p>
        <div className={styles.pillRow}>
          {START_TEMPS.map((t) => (
            <button key={t.id}
              className={`${styles.pill} ${inputs.tempId === t.id ? styles.pillActive : ''}`}
              onClick={() => update('tempId', t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <p className={styles.note}>{START_TEMPS.find((t) => t.id === inputs.tempId)?.desc}</p>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🍳 조리 방법</p>
        <div className={styles.methodGrid}>
          {METHODS.map((m) => (
            <button key={m.id}
              className={`${styles.methodCard} ${inputs.methodId === m.id ? styles.methodCardActive : ''}`}
              onClick={() => update('methodId', m.id)}>
              <span className={styles.methodEmoji}>{m.emoji}</span>
              <div>
                <p className={styles.methodLabel}>{m.label}</p>
                <p className={styles.methodNote}>{m.note}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>⚙️ 추가 옵션</p>
        {/* 컴팩트 — 라벨·값·슬라이더 한 줄 */}
        <div className={styles.optionCompact}>
          <div className={styles.optionRowInline}>
            <span className={styles.optionLabel}>개수</span>
            <input type="range" min={1} max={24} step={1} value={inputs.count}
              onChange={(e) => update('count', +e.target.value)} className={styles.sliderInline} />
            <strong className={styles.optionValue}>{inputs.count}개</strong>
          </div>
          <div className={styles.optionRowInline}>
            <span className={styles.optionLabel}>고도</span>
            <input type="range" min={0} max={3000} step={100} value={inputs.altitudeM}
              onChange={(e) => update('altitudeM', +e.target.value)} className={styles.sliderInline} />
            <strong className={styles.optionValue}>{inputs.altitudeM}m</strong>
          </div>
          <p className={styles.note}>
            ※ 12개 이상 +1~2분 자동 · 고도 100m당 +1% (대부분 도시 0~300m)
          </p>
        </div>
      </section>

      {/* ═══ 결과 + 타이머 ═══ */}
      <section>
        <div className={styles.resultMain}>
          <div className={styles.resultLeft}>
            <p className={styles.resultLabel}>추천 시간</p>
            <p className={styles.resultBig}>{fmtMS(result.totalSec)}</p>
            <p className={styles.resultSub}>
              {inputs.methodId === 'instapot'
                ? '인스턴트팟 5-5-5 룰 (압력 5분 + 자연감압 5분 + 얼음물 5분)'
                : startTime && endTime
                  ? <>지금 시작 → {endTime} 완성 (식히기 +5분)</>
                  : '준비 중…'}
            </p>
          </div>

          <div className={styles.resultYolk}>
            <YolkSvg stage={result.doneness} size={120} />
            <p className={styles.resultYolkLabel}>{result.doneness.label}</p>
          </div>
        </div>

        {/* 보정 사유 */}
        {result.adjustments.length > 0 && (
          <div className={styles.adjustmentsBox}>
            <p className={styles.adjustmentsTitle}>📐 보정 내역</p>
            <div className={styles.adjustmentsList}>
              <div className={styles.adjItem}>
                <span>기본 ({result.doneness.label})</span>
                <strong>{fmtMS(result.baseSec)}</strong>
              </div>
              {result.adjustments.map((a, i) => (
                <div key={i} className={styles.adjItem}>
                  <span>{a.label}</span>
                  <strong>{fmtSec(a.sec)}</strong>
                </div>
              ))}
              <div className={`${styles.adjItem} ${styles.adjItemTotal}`}>
                <span>최종</span>
                <strong>{fmtMS(result.totalSec)}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 타이머 */}
        <div className={styles.timerBox}>
          {phase === 'idle' && (
            <button className={styles.timerStartBtn} onClick={startTimer} disabled={result.totalSec === 0}>
              ⏱️ 타이머 시작 ({fmtMS(result.totalSec)})
            </button>
          )}
          {phase !== 'idle' && (
            <>
              <p className={styles.timerPhase}>
                {phase === 'cooking' ? '🔥 조리 중' : '❄️ 얼음물 식히기'}
              </p>
              <p className={styles.timerCountdown}>{fmtMS(remaining)}</p>
              <div className={styles.timerControls}>
                {running ? (
                  <button className={styles.timerBtn} onClick={pauseTimer}>⏸️ 일시정지</button>
                ) : (
                  <button className={styles.timerBtn} onClick={resumeTimer}>▶️ 재개</button>
                )}
                <button className={`${styles.timerBtn} ${styles.timerBtnCancel}`} onClick={cancelTimer}>✕ 취소</button>
              </div>
            </>
          )}
        </div>

        {/* 식히기 안내 */}
        <div className={styles.coolingHint}>
          <p>❄️ <strong>완성 직후 즉시 얼음물에 5분</strong> — 노른자 회녹색 변색 방지 + 껍질 벗기기 쉬워짐</p>
        </div>
      </section>

      {/* ═══ 익힘 8단계 시각화 ═══ */}
      <section>
        <label className={styles.label}>🥚 익힘 8단계 스펙트럼</label>
        <div className={styles.spectrumGrid}>
          {DONENESS.map((d) => (
            <div key={d.id} className={`${styles.spectrumItem} ${inputs.donenessId === d.id ? styles.spectrumItemActive : ''}`}>
              <YolkSvg stage={d} size={64} />
              <p className={styles.spectrumLabel}>{d.label}</p>
              <p className={styles.spectrumTime}>{fmtMS(d.seconds)}</p>
              <p className={styles.spectrumDesc}>{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 응고 온도 과학 ═══ */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🔬 단백질 응고 온도 (왜 이 시간들인가)</p>
        <div className={styles.scienceGrid}>
          <ScienceBar label="흰자 응고 시작"  temp={62} color="#FFFFFF" />
          <ScienceBar label="노른자 응고 시작" temp={65} color="#FFD460" />
          <ScienceBar label="잼 노른자"       temp={70} color="#FFCC55" />
          <ScienceBar label="흰자 완전 응고"   temp={80} color="#FFFFFF" />
          <ScienceBar label="노른자 완전 응고" temp={78} color="#F5DC8A" />
        </div>
        <p className={styles.note}>
          끓는 물(100°C)에서 계란 내부 온도가 흰자 80°C·노른자 65~78°C에 도달하는 시점을 노린 것이 위 8단계 시간입니다. 시간 ±30초 차이로 노른자 농도가 크게 달라집니다.
        </p>
      </section>

      {/* ═══ 트러블슈팅 ═══ */}
      <section>
        <label className={styles.label}>🛠️ 트러블슈팅 가이드</label>
        <div className={styles.troubleGrid}>
          {TROUBLESHOOTS.map((t) => (
            <div key={t.id} className={styles.troubleCard}>
              <div className={styles.troubleHead}>
                <span className={styles.troubleEmoji}>{t.emoji}</span>
                <span className={styles.troubleTitle}>{t.title}</span>
              </div>
              <p className={styles.troubleProblem}>{t.problem}</p>
              <ul className={styles.troubleSolutions}>
                {t.solution.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ 통합 면책 — 사이트 전체 동일 디자인 ═══ */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/cooking/microwave', label: '전자레인지 환산' },
          { href: '/tools/cooking/ramen',     label: '라면 물양 계산기' },
          { href: '/tools/cooking/frying',    label: '튀김 시간 계산기' },
        ]}
      >
        화구 화력·냄비 두께·물 양에 따라 <strong>±30초 차이</strong> 가능 — 첫 시도는 30초 일찍 꺼내 확인하세요. 노른자가 흐르는 단계는 살모넬라 위험이 있으니 어린이·임산부·면역저하자는 완전 익힘을 권장합니다.
      </Disclaimer>
    </div>
  )
}

/* ─── 노른자 단면 SVG ─── */
function YolkSvg({ stage, size = 64 }: { stage: DonenessStage; size?: number }) {
  const r = size / 2
  // 흰자 둥글게, 노른자 중앙
  // 텍스처에 따라 다름
  const yolkR = r * 0.42
  const wavy = stage.yolkTexture === 'jammy' || stage.yolkTexture === 'custard' || stage.yolkTexture === 'soft'
  // 흐름 = 그라디언트 가운데 어둡게
  const isLiquid = stage.yolkTexture === 'liquid' || stage.yolkTexture === 'flowing'
  const yolkOpacity = isLiquid ? 0.7 : 1
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      {/* 외부 흰자 */}
      <ellipse cx={r} cy={r} rx={r - 1} ry={r - 1} fill="#F5F1E8" stroke="#D8D2C0" strokeWidth="1" />
      {/* 흰자 내부 (응고 표시) */}
      {stage.whiteSet < 100 && (
        <ellipse cx={r} cy={r} rx={(r - 4)} ry={(r - 4)} fill="rgba(255, 255, 255, 0.4)" />
      )}
      {/* 노른자 */}
      <defs>
        <radialGradient id={`yg-${stage.id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={stage.yolkColor} stopOpacity={isLiquid ? 0.6 : 1} />
          <stop offset="100%" stopColor={stage.yolkColor} stopOpacity={yolkOpacity} />
        </radialGradient>
      </defs>
      {wavy ? (
        <circle cx={r} cy={r} r={yolkR} fill={`url(#yg-${stage.id})`} stroke={stage.yolkColor} strokeOpacity={0.4} strokeWidth="1" />
      ) : (
        <circle cx={r} cy={r} r={yolkR} fill={`url(#yg-${stage.id})`} />
      )}
      {/* 흐름 노른자: 작은 흐름 표시 */}
      {isLiquid && (
        <ellipse cx={r} cy={r + yolkR * 0.5} rx={yolkR * 0.6} ry={yolkR * 0.2} fill={stage.yolkColor} opacity={0.4} />
      )}
      {/* 단단한 완숙: 살짝 그림자 */}
      {stage.yolkTexture === 'hard' && (
        <circle cx={r * 0.85} cy={r * 0.85} r={yolkR * 0.3} fill="rgba(255,255,255,0.25)" />
      )}
    </svg>
  )
}

/* ─── 응고 온도 바 ─── */
function ScienceBar({ label, temp, color }: { label: string; temp: number; color: string }) {
  const pct = (temp / 100) * 100
  return (
    <div className={styles.scienceItem}>
      <div className={styles.scienceLabel}>
        <span>{label}</span>
        <strong>{temp}°C</strong>
      </div>
      <div className={styles.scienceTrack}>
        <div className={styles.scienceFill} style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
