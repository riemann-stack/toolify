'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './microwave.module.css'
import {
  POWER_OPTIONS, FOODS, TEMPS, VESSELS, GOLDEN_TIPS,
  type PowerW, type StartTemp,
  convertTime, portionFactor, getTemp, getFood,
  fmtSec, fmtTimer,
} from './microwaveUtils'

type Tab = 'convert' | 'food' | 'timer' | 'guide'

const STORAGE_KEY = 'youtil_microwave_v1'

export default function MicrowaveClient() {
  const [tab, setTab] = useState<Tab>('convert')

  /* 탭 1: 환산 */
  /* refW·myW: PowerW 외 직접 입력도 허용하므로 number로 확장 */
  const [refW, setRefW] = useState<number>(700)
  const [myW, setMyW] = useState<number>(900)
  /* 출력 직접 입력 모드 (드롭다운 '직접 입력' 선택 시에만 입력칸 노출) */
  const [refCustom, setRefCustom] = useState(false)
  const [myCustom, setMyCustom] = useState(false)
  const [refMin, setRefMin] = useState('2')
  const [refSec, setRefSecState] = useState('30')

  /* 탭 2: 식품 */
  const [foodId, setFoodId] = useState('rice')
  const [portions, setPortions] = useState('1')
  const [startTemp, setStartTemp] = useState<StartTemp>('frozen')
  const [foodMyW, setFoodMyW] = useState<PowerW>(700)

  /* 탭 3: 타이머 */
  const [timerMin, setTimerMin] = useState('2')
  const [timerSec, setTimerSec] = useState('0')
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  /* 다단계(가열→휴지→추가 가열) 타이머 */
  const [phases, setPhases] = useState<{ label: string; sec: number }[]>([])
  const [phaseIdx, setPhaseIdx] = useState(0)
  const phasesRef = useRef<{ label: string; sec: number }[]>([])
  const phaseIdxRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const lastTickRef = useRef<number>(0)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.refW) { setRefW(j.refW); setRefCustom(!(POWER_OPTIONS as readonly number[]).includes(j.refW)) }
      if (j.myW) { setMyW(j.myW); setMyCustom(!(POWER_OPTIONS as readonly number[]).includes(j.myW)) }
      if (j.refMin) setRefMin(j.refMin)
      if (j.refSec) setRefSecState(j.refSec)
      if (j.foodId) setFoodId(j.foodId)
      if (j.portions) setPortions(j.portions)
      if (j.startTemp) setStartTemp(j.startTemp)
      if (j.foodMyW) setFoodMyW(j.foodMyW)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ refW, myW, refMin, refSec, foodId, portions, startTemp, foodMyW }))
    } catch {}
  }, [refW, myW, refMin, refSec, foodId, portions, startTemp, foodMyW])

  /* AudioContext 초기화 */
  const getAudio = () => {
    if (!audioCtxRef.current) {
      const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
      const Ctx = W.AudioContext || W.webkitAudioContext
      if (Ctx) audioCtxRef.current = new Ctx()
    }
    return audioCtxRef.current
  }

  /** 비프음 (3회 또는 1회) */
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
      const now = Date.now()
      const delta = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      setRemaining((prev) => {
        const next = prev - delta
        if (next <= 0) {
          const idx = phaseIdxRef.current
          const ph = phasesRef.current
          if (idx < ph.length - 1) {
            // 다음 단계로 전환 (전환 비프 2회)
            phaseIdxRef.current = idx + 1
            setPhaseIdx(idx + 1)
            beep(2, 880, 0.15)
            lastTickRef.current = Date.now()
            return ph[idx + 1].sec
          }
          // 마지막 단계 종료
          setRunning(false)
          beep(3, 880, 0.2)
          return 0
        }
        // 마지막 3초 비프
        const prevSec = Math.ceil(prev)
        const nextSec = Math.ceil(next)
        if (prevSec !== nextSec && nextSec <= 3 && nextSec > 0) {
          beep(1, 660, 0.1)
        }
        return next
      })
    }, 100)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  /* 계산 */
  const refSecTotal = (parseInt(refMin) || 0) * 60 + (parseInt(refSec) || 0)
  const convertedSec = convertTime(refW, refSecTotal, myW)
  const diff = convertedSec - refSecTotal

  /* W별 비교 (탭 1) */
  const wComparison = POWER_OPTIONS.map((w) => ({
    w, sec: convertTime(refW, refSecTotal, w),
  }))

  /* 식품 계산 (탭 2) */
  const food = getFood(foodId)
  const portionN = parseInt(portions) || 1
  const tempMeta = getTemp(startTemp)
  const foodConverted = useMemo(() => {
    if (food.forbidden) return 0
    // 해동 모드는 고정 ~200W라 출력 W 환산을 적용하지 않음
    const base = food.defrostMode ? food.baseSec : convertTime(food.baseW, food.baseSec, foodMyW)
    return base * portionFactor(portionN) * tempMeta.factor
  }, [food, foodMyW, portionN, tempMeta])
  const foodRest = useMemo(() => {
    if (food.forbidden || food.restSec === 0) return 0
    const base = food.defrostMode ? food.restAdditionalSec : convertTime(food.baseW, food.restAdditionalSec, foodMyW)
    return base * portionFactor(portionN) * tempMeta.factor
  }, [food, foodMyW, portionN, tempMeta])

  /* 타이머 시작 — 다단계 시퀀스 (가열→휴지→추가) */
  const startSequence = (seq: { label: string; sec: number }[]) => {
    const valid = seq.filter((p) => p.sec > 0)
    if (valid.length === 0) return
    phasesRef.current = valid
    phaseIdxRef.current = 0
    setPhases(valid)
    setPhaseIdx(0)
    setRemaining(valid[0].sec)
    setRunning(true)
    // 사용자 인터랙션 후 AudioContext 깨우기
    const ctx = getAudio()
    if (ctx && ctx.state === 'suspended') ctx.resume()
  }
  const startTimer = (sec: number) => startSequence([{ label: '가열', sec }])
  const resetTimer = () => {
    setRemaining(0)
    setRunning(false)
    phasesRef.current = []
    phaseIdxRef.current = 0
    setPhases([])
    setPhaseIdx(0)
  }

  const timerInputSec = (parseInt(timerMin) || 0) * 60 + (parseInt(timerSec) || 0)

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/cooking/thawing',   label: '해동 시간 계산기' },
          { href: '/tools/cooking/egg-timer', label: '계란 삶는 시간' },
          { href: '/tools/cooking/ramen',     label: '라면 물양 계산기' },
        ]}
      >
        전자레인지 모델·연식·실제 출력에 따라 결과가 다를 수 있습니다. 처음엔 환산 시간의 <strong>80%로 시작 → 부족하면 추가 가열</strong>해 과조리를 방지하세요. <strong>계란 통째·닫힌 용기·알루미늄 호일·금속 테두리 그릇은 절대 금지</strong> (폭발·화재 위험). 가열 후 그릇이 매우 뜨거우니 화상 주의.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'convert', label: '⚡ 출력 환산' },
          { id: 'food',    label: '🍱 식품 프리셋' },
          { id: 'timer',   label: '⏱️ 타이머' },
          { id: 'guide',   label: '📚 가이드' },
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

      {/* ════════ 탭 1: 출력 환산 (컴팩트) ════════ */}
      {tab === 'convert' && (
        <>
          <div className={s.card}>
            <div className={s.compactRow}>
              <div className={s.compactField}>
                <label className={s.compactLabel}>기준 출력 (W)</label>
                <div className={s.compactWInput}>
                  <select
                    className={s.compactSelect}
                    value={refCustom ? 'custom' : String(refW)}
                    onChange={(e) => {
                      if (e.target.value === 'custom') setRefCustom(true)
                      else { setRefCustom(false); setRefW(Number(e.target.value)) }
                    }}
                  >
                    {POWER_OPTIONS.map((w) => <option key={w} value={w}>{w}W</option>)}
                    <option value="custom">직접 입력</option>
                  </select>
                  {refCustom && (
                    <input
                      type="number"
                      className={s.compactNum}
                      value={refW}
                      onChange={(e) => setRefW(Number(e.target.value) || 0)}
                      min={300} max={2000} step={50}
                      placeholder="W 입력"
                      aria-label="기준 W 직접 입력"
                    />
                  )}
                </div>
              </div>
              <div className={s.compactField}>
                <label className={s.compactLabel}>기준 시간</label>
                <div className={s.compactTimeRow}>
                  <input type="number" className={s.compactNum} value={refMin}
                    onChange={(e) => setRefMin(e.target.value)} min={0} max={60} step={1}
                    aria-label="분" placeholder="분" />
                  <span className={s.compactColon}>:</span>
                  <input type="number" className={s.compactNum} value={refSec}
                    onChange={(e) => setRefSecState(e.target.value)} min={0} max={59} step={5}
                    aria-label="초" placeholder="초" />
                </div>
              </div>
              <div className={s.compactField}>
                <label className={s.compactLabel}>변환할 출력 (W)</label>
                <div className={s.compactWInput}>
                  <select
                    className={s.compactSelect}
                    value={myCustom ? 'custom' : String(myW)}
                    onChange={(e) => {
                      if (e.target.value === 'custom') setMyCustom(true)
                      else { setMyCustom(false); setMyW(Number(e.target.value)) }
                    }}
                  >
                    {POWER_OPTIONS.map((w) => <option key={w} value={w}>{w}W</option>)}
                    <option value="custom">직접 입력</option>
                  </select>
                  {myCustom && (
                    <input
                      type="number"
                      className={s.compactNum}
                      value={myW}
                      onChange={(e) => setMyW(Number(e.target.value) || 0)}
                      min={300} max={2000} step={50}
                      placeholder="W 입력"
                      aria-label="변환 W 직접 입력"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>{refW}W {fmtSec(refSecTotal)} → {myW}W</p>
            <p className={s.heroValue}>
              <strong>{fmtSec(convertedSec)}</strong>
            </p>
            <p className={s.heroSub}>
              차이 <strong style={{ color: diff > 0 ? '#EA580C' : 'var(--accent)' }}>
                {diff > 0 ? '+' : ''}{Math.round(diff)}초
              </strong>
              {' · '}{myW > refW ? '⬇️ 더 짧게' : myW < refW ? '⬆️ 더 길게' : '동일'}
            </p>
            <button
              className={s.playBtn}
              onClick={() => {
                setTab('timer')
                setTimerMin(String(Math.floor(convertedSec / 60)))
                setTimerSec(String(Math.round(convertedSec % 60)))
                startTimer(convertedSec)
              }}
              type="button"
            >
              ⏱️ 이 시간으로 타이머 시작
            </button>
          </div>

          {/* W별 비교 막대 */}
          <div className={s.card}>
            <span className={s.cardLabel}>W별 시간 비교</span>
            <div className={s.barChart}>
              {wComparison.map((c) => {
                const maxSec = Math.max(...wComparison.map((x) => x.sec))
                const w = (c.sec / maxSec) * 100
                const isMine = c.w === myW
                const isRef = c.w === refW
                return (
                  <div key={c.w} className={s.barRow}>
                    <span className={s.barLabel}>
                      {c.w}W{isMine && ' 👤'}{isRef && !isMine && ' 📋'}
                    </span>
                    <div className={s.barTrack}>
                      <div
                        className={s.barFill}
                        style={{
                          width: `${Math.max(w, 4)}%`,
                          background: isMine ? 'var(--accent)' : isRef ? '#0891B2' : 'rgba(234,88,12,0.5)',
                        }}
                      >
                        <span className={s.barValue}>{fmtSec(c.sec)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>💡 빠른 팁</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
              <li><strong>처음엔 환산 시간의 80%로 시작</strong> → 부족하면 10~15초씩 추가 (과조리 방지)</li>
              <li>600W 이하·1000W 이상은 효율 보정이 자동 적용됩니다 (저출력 +7%, 고출력 -5%)</li>
              <li>가운데까지 균일하게 가열하려면 중간에 한 번 섞기 권장</li>
              <li>정확한 출력은 내 전자레인지 라벨 (제품 뒷면)에서 확인</li>
            </ul>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 식품 프리셋 ════════ */}
      {tab === 'food' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>식품 종류 (12가지)</span>
            <div className={s.foodGrid}>
              {FOODS.map((f) => (
                <button
                  key={f.id}
                  className={`${s.foodBtn} ${foodId === f.id ? s.foodBtnActive : ''} ${f.forbidden ? s.foodBtnDanger : ''}`}
                  onClick={() => setFoodId(f.id)}
                  type="button"
                >
                  <span className={s.foodEmoji}>{f.emoji}</span>
                  <span className={s.foodLabel}>{f.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {food.forbidden ? (
            <div className={s.warnCardStrong}>
              <strong>🚨 {food.label}</strong>
              <p>{food.warning}</p>
              <p style={{ marginTop: 8 }}>{food.tip}</p>
            </div>
          ) : (
            <>
              <div className={s.card}>
                <span className={s.cardLabel}>전자레인지·양·온도</span>
                {food.defrostMode ? (
                  <div className={s.warnNote} style={{ marginBottom: 12 }}>
                    🧊 해동은 <strong>해동 모드(약 200W)</strong> 기준입니다. 일반 출력(W) 환산과 무관하니 전자레인지의 해동 버튼을 사용하세요.
                  </div>
                ) : (
                  <div className={s.field}>
                    <label className={s.fieldLabel}>내 전자레인지 W</label>
                    <div className={s.pillRow}>
                      {POWER_OPTIONS.map((w) => (
                        <button
                          key={w}
                          className={`${s.pill} ${foodMyW === w ? s.pillActive : ''}`}
                          onClick={() => setFoodMyW(w)}
                          type="button"
                        >
                          {w}W
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className={s.row2}>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>인분 ({portionN}인분 → 시간 ×{portionFactor(portionN).toFixed(2)})</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={portions}
                      onChange={(e) => setPortions(e.target.value)}
                      className={s.slider}
                    />
                    <div className={s.pillRow} style={{ marginTop: 8 }}>
                      {[1, 2, 3, 4, 5].map((p) => (
                        <button key={p} className={`${s.pill} ${portionN === p ? s.pillActive : ''}`} onClick={() => setPortions(String(p))} type="button">
                          {p}인분
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>시작 온도</label>
                    <div className={s.pillRow}>
                      {TEMPS.map((t) => (
                        <button
                          key={t.id}
                          className={`${s.pill} ${startTemp === t.id ? s.pillActive : ''}`}
                          onClick={() => setStartTemp(t.id)}
                          type="button"
                        >
                          {t.emoji} {t.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                    <p className={s.helpText}>{tempMeta.desc}</p>
                  </div>
                </div>
              </div>

              <div className={s.hero}>
                <p className={s.heroLabel}>{food.emoji} {food.label} · {portionN}인분</p>
                <p className={s.heroValue}>
                  <strong>{fmtSec(foodConverted)}</strong>
                </p>
                <p className={s.heroSub}>
                  {food.defrostMode
                    ? <>해동 모드(약 200W) · {portionN}인분 · {tempMeta.label}</>
                    : <>표준 {food.baseW}W {fmtSec(food.baseSec)} → 내 {foodMyW}W ({tempMeta.label})</>}
                  {food.restSec > 0 && (
                    <><br />⏸️ 휴지 {fmtSec(food.restSec)} → 추가 가열 <strong>{fmtSec(foodRest)}</strong></>
                  )}
                </p>
                <button
                  className={s.playBtn}
                  onClick={() => {
                    setTab('timer')
                    setTimerMin(String(Math.floor(foodConverted / 60)))
                    setTimerSec(String(Math.round(foodConverted % 60)))
                    const seq = [{ label: '가열', sec: foodConverted }]
                    if (food.restSec > 0) seq.push({ label: '휴지', sec: food.restSec })
                    if (foodRest > 0) seq.push({ label: '추가 가열', sec: foodRest })
                    startSequence(seq)
                  }}
                  type="button"
                >
                  {food.restSec > 0 ? '⏱️ 전체 과정 타이머' : '⏱️ 타이머 시작'}
                </button>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>{food.label} 가이드</span>
                <div className={s.tipBox}>
                  <strong>💡 팁</strong> {food.tip}
                </div>
                {food.warning && (
                  <div className={s.warnNote}>
                    ⚠️ {food.warning}
                  </div>
                )}
                <div className={s.tableScroll} style={{ marginTop: 12 }}>
                  <table className={s.detailTable}>
                    <tbody>
                      <tr><td>표준 시간</td><td className={s.cellMono}>{food.defrostMode ? '해동 모드(약 200W)' : `${food.baseW}W`} {fmtSec(food.baseSec)}</td></tr>
                      <tr><td>내 가열 시간{food.defrostMode ? '' : ` (${foodMyW}W)`}</td><td className={s.cellMono} style={{ color: 'var(--accent)' }}>{fmtSec(foodConverted)}</td></tr>
                      {food.restSec > 0 && (
                        <>
                          <tr><td>휴지 시간</td><td className={s.cellMono}>{fmtSec(food.restSec)}</td></tr>
                          <tr><td>내 추가 가열</td><td className={s.cellMono} style={{ color: 'var(--accent)' }}>{fmtSec(foodRest)}</td></tr>
                        </>
                      )}
                      <tr><td>권장 용기</td><td>{food.vessel}</td></tr>
                      <tr><td>용기 메모</td><td>{food.container}</td></tr>
                      <tr><td>1인분 → {portionN}인분 보정</td><td className={s.cellMono}>×{portionFactor(portionN).toFixed(2)}</td></tr>
                      <tr><td>{tempMeta.emoji} 온도 보정</td><td className={s.cellMono}>×{tempMeta.factor.toFixed(2)}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ════════ 탭 3: 타이머 ════════ */}
      {tab === 'timer' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>시간 입력</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>분</label>
                <input
                  type="number"
                  className={s.input}
                  value={timerMin}
                  onChange={(e) => setTimerMin(e.target.value)}
                  min={0} max={60} step={1}
                  disabled={running}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>초</label>
                <input
                  type="number"
                  className={s.input}
                  value={timerSec}
                  onChange={(e) => setTimerSec(e.target.value)}
                  min={0} max={59} step={5}
                  disabled={running}
                />
              </div>
            </div>
            <div className={s.pillRow}>
              {[30, 60, 90, 120, 180, 300].map((sec) => (
                <button
                  key={sec}
                  className={s.pill}
                  onClick={() => {
                    setTimerMin(String(Math.floor(sec / 60)))
                    setTimerSec(String(sec % 60))
                  }}
                  type="button"
                  disabled={running}
                >
                  {fmtSec(sec)}
                </button>
              ))}
            </div>
          </div>

          {/* 큰 타이머 + 도넛 */}
          <div className={s.timerHero}>
            {(() => {
              const isActive = running || remaining > 0
              const curPhaseSec = phases.length > 0 ? (phases[phaseIdx]?.sec ?? timerInputSec) : timerInputSec
              const total = isActive ? remaining : timerInputSec
              const initial = isActive ? curPhaseSec : timerInputSec
              const pct = initial > 0 ? (isActive ? Math.min(1, remaining / initial) : 1) : 0
              const isLast10 = remaining > 0 && remaining <= 10
              const r = 80
              const circumference = 2 * Math.PI * r
              const dashOffset = circumference * (1 - pct)
              return (
                <div className={s.timerWrap}>
                  <svg viewBox="0 0 200 200" width="220" height="220">
                    <circle cx={100} cy={100} r={r} stroke="var(--bg3)" strokeWidth="14" fill="none" />
                    <circle
                      cx={100} cy={100} r={r}
                      stroke={isLast10 ? '#DB2777' : 'var(--accent)'}
                      strokeWidth="14"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 100 100)"
                      style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                    />
                    <text
                      x={100} y={106}
                      fill={isLast10 ? '#DB2777' : 'var(--text)'}
                      fontSize="36"
                      fontWeight="800"
                      textAnchor="middle"
                      fontFamily="Inter, system-ui, sans-serif"
                    >
                      {fmtTimer(total)}
                    </text>
                    <text x={100} y={130} fill="var(--muted)" fontSize="11" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif">
                      {running
                        ? (phases.length > 1 ? `${phases[phaseIdx]?.label ?? ''} (${phaseIdx + 1}/${phases.length})` : '실행 중')
                        : remaining > 0 ? '일시정지' : '대기'}
                    </text>
                  </svg>
                </div>
              )
            })()}
            <div className={s.timerControls}>
              {!running && remaining === 0 && (
                <button
                  className={s.playBtn}
                  onClick={() => startTimer(timerInputSec)}
                  type="button"
                  disabled={timerInputSec <= 0}
                >
                  ▶ 시작
                </button>
              )}
              {!running && remaining > 0 && (
                <>
                  <button className={s.playBtn} onClick={() => setRunning(true)} type="button">
                    ▶ 계속
                  </button>
                  <button className={s.resetBtn} onClick={resetTimer} type="button">
                    ⏹ 리셋
                  </button>
                </>
              )}
              {running && (
                <>
                  <button className={s.pauseBtn} onClick={() => setRunning(false)} type="button">
                    ⏸ 일시정지
                  </button>
                  <button className={s.resetBtn} onClick={resetTimer} type="button">
                    ⏹ 리셋
                  </button>
                </>
              )}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>🔔 알림음</strong>
            <p>
              종료 시 <strong>3회 비프음</strong>이 울립니다 (마지막 3초 카운트도 비프).<br />
              브라우저 음소거·시스템 볼륨을 확인하세요. 모바일은 최초 ▶ 시작 버튼 클릭 후 작동.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 가이드 ════════ */}
      {tab === 'guide' && (
        <>
          {VESSELS.map((v) => {
            const titles = {
              safe: { emoji: '✅', label: '사용 가능 용기', color: '#0D9488' },
              caution: { emoji: '⚠️', label: '주의 용기', color: '#D97706' },
              forbidden: { emoji: '❌', label: '절대 금지', color: '#DB2777' },
            }[v.category]
            return (
              <div key={v.category} className={s.card}>
                <span className={s.cardLabel} style={{ color: titles.color }}>{titles.emoji} {titles.label}</span>
                <div className={s.vesselGrid}>
                  {v.items.map((it, i) => (
                    <div key={i} className={s.vesselCard} style={{ borderLeftColor: titles.color }}>
                      <p className={s.vesselHead}><span className={s.vesselEmoji}>{it.emoji}</span> <strong>{it.label}</strong></p>
                      <p className={s.vesselDesc}>{it.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          <div className={s.card}>
            <span className={s.cardLabel}>💡 골든 팁 10가지</span>
            <div className={s.tipsGrid}>
              {GOLDEN_TIPS.map((t, i) => (
                <div key={i} className={s.tipCard}>
                  <p className={s.tipHead}>{t.emoji} <strong>{t.title}</strong></p>
                  <p className={s.tipDesc}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={s.warnCardStrong}>
            <strong>🚨 절대 금지 5가지</strong>
            <p>
              1. <strong>계란 통째 가열</strong> — 폭발 (노른자 칼집 + 흰자 풀기)<br />
              2. <strong>알루미늄 호일·캔</strong> — 스파크 → 화재<br />
              3. <strong>닫힌 용기·캔</strong> — 압력 폭발<br />
              4. <strong>빈 가열</strong> — 마그네트론 손상<br />
              5. <strong>금색·은색 테두리 그릇</strong> — 가장 흔한 사고 (중고·빈티지 주의)
            </p>
          </div>
        </>
      )}

    </div>
  )
}
