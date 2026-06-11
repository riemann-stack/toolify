/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './race-predictor.module.css'
import {
  DISTS, TARGETS, QUICK_TIMES,
  fmtHMS, fmtMS, fmtPace, hmsToSec,
  vdotFromRace, timeFromVdot, paceFromVdot, predictTime,
  envCorrection, AGE_BAND_LABEL, AGE_GENDER_FACTORS,
  KOREA_SEASONS, vdotLevel,
  loadRecords, saveRecords, recordsToCSV,
  type DistKey, type TargetKey, type Gender, type AgeBand, type RaceRecord,
} from './racePredictorUtils'

type TabKey = 'predict' | 'reverse' | 'strategy' | 'records'

const SUB_GOALS = [
  { label: '서브5',    sec: 5 * 3600 },
  { label: '서브4:30', sec: 4.5 * 3600 },
  { label: '서브4',    sec: 4 * 3600 },
  { label: '서브3:30', sec: 3.5 * 3600 },
  { label: '서브3',    sec: 3 * 3600 },
]

const PACE_ZONES = [
  { key: 'E', name: 'Easy',       desc: '회복·지구력 (회복일·LSD)',           intensity: 0.59, color: '#0891B2' },
  { key: 'M', name: 'Marathon',   desc: '대회 페이스 (장거리 페이스 런)',      intensity: 0.70, color: '#0EA5E9' },
  { key: 'T', name: 'Threshold',  desc: '젖산역치 (템포 런·크루즈 인터벌)',    intensity: 0.78, color: '#CA8A04' },
  { key: 'I', name: 'Interval',   desc: 'V̇O₂max (3~5분 인터벌·심화는 인터벌 도구)', intensity: 0.85, color: '#EA580C' },
  { key: 'R', name: 'Repetition', desc: '스피드·러닝 이코노미 (200~600m)',     intensity: 0.93, color: '#DC2626' },
]

// ─────────────────────────────────────────────────────────────
// 시간 입력 — numeric 직접 입력 (모바일 친화)
// ─────────────────────────────────────────────────────────────
function TimeInput({
  hours, min, sec, onChange, showHours = true,
}: {
  hours: number; min: number; sec: number
  onChange: (h: number, m: number, s: number) => void
  showHours?: boolean
}) {
  const sanitize = (v: string, max: number): number => {
    const n = parseInt(v.replace(/\D/g, '').slice(0, 2)) || 0
    return Math.min(max, Math.max(0, n))
  }
  // padStart 적용하면 "5" 입력 시 "05"로 변환되며 maxLength=2 도달 → 두 번째 자리 입력 불가.
  // raw 숫자만 표시하고 placeholder "00"로 시각적 자리 안내.
  return (
    <div className={styles.timeRow}>
      {showHours && (
        <>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="00"
            maxLength={2}
            className={styles.timeInputBox}
            value={hours === 0 ? '' : String(hours)}
            onChange={(e) => onChange(sanitize(e.target.value, 23), min, sec)}
            onFocus={(e) => e.target.select()}
            aria-label="시"
          />
          <span className={styles.timeColon}>:</span>
        </>
      )}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="00"
        maxLength={2}
        className={styles.timeInputBox}
        value={min === 0 && hours === 0 ? '' : String(min)}
        onChange={(e) => onChange(hours, sanitize(e.target.value, 59), sec)}
        onFocus={(e) => e.target.select()}
        aria-label="분"
      />
      <span className={styles.timeColon}>:</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="00"
        maxLength={2}
        className={styles.timeInputBox}
        value={sec === 0 && min === 0 && hours === 0 ? '' : String(sec)}
        onChange={(e) => onChange(hours, min, sanitize(e.target.value, 59))}
        onFocus={(e) => e.target.select()}
        aria-label="초"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────
export default function RacePredictorClient() {
  const [tab, setTab] = useState<TabKey>('predict')

  // 기록 예측 상태
  const [baseDist, setBaseDist] = useState<DistKey>('10k')
  const [customKm, setCustomKm] = useState<number>(8)
  const [bh, setBh] = useState(0)
  const [bm, setBm] = useState(50)
  const [bs, setBs] = useState(0)
  const [selected, setSelected] = useState<Set<TargetKey>>(new Set(['5k', 'half', 'full']))

  // 환경 보정
  const [envOn, setEnvOn] = useState(false)
  const [temp, setTemp] = useState(15)
  const [humidity, setHumidity] = useState(60)
  const [elevation, setElevation] = useState(0)

  // 연령·성별
  const [demoOn, setDemoOn] = useState(false)
  const [gender, setGender] = useState<Gender>('male')
  const [ageBand, setAgeBand] = useState<AgeBand>('30-40')

  const baseKm = baseDist === 'custom' ? Math.max(0.5, customKm) : DISTS.find((d) => d.key === baseDist)!.km
  const baseSec = hmsToSec(bh, bm, bs)
  const validBase = baseSec >= 60

  const vdot = useMemo(() => validBase ? vdotFromRace(baseKm, baseSec) : 0, [baseKm, baseSec, validBase])
  const level = useMemo(() => vdotLevel(vdot), [vdot])

  const predictions = useMemo(() => {
    if (!validBase) return []
    return TARGETS.filter((t) => selected.has(t.key)).map((t) => {
      const p = predictTime(baseKm, baseSec, t.km)
      return { ...t, ...p, pace: p.avg / t.km }
    })
  }, [baseKm, baseSec, selected, validBase])

  const fullPred = useMemo(() => {
    if (!validBase) return null
    return predictTime(baseKm, baseSec, 42.195)
  }, [baseKm, baseSec, validBase])

  const env = useMemo(() => {
    if (!fullPred || !envOn) return null
    return envCorrection({ baseTime: fullPred.avg, temp, humidity, elevation })
  }, [fullPred, envOn, temp, humidity, elevation])

  // 데모 보정 — 기준선 비교용 (본인 시간이 동급 능력 20대 남성 기준 얼마인지)
  const demoBaseline = useMemo(() => {
    if (!fullPred || !demoOn) return null
    const factor = AGE_GENDER_FACTORS[gender][ageBand]
    return {
      youngMaleEquivalent: fullPred.avg * factor,
      factor,
    }
  }, [fullPred, demoOn, gender, ageBand])

  const toggleTarget = (k: TargetKey) => {
    const next = new Set(selected)
    if (next.has(k)) next.delete(k); else next.add(k)
    setSelected(next)
  }

  const applyQuick = (h: number, m: number, s: number) => { setBh(h); setBm(m); setBs(s) }

  // ── 목표 역산 탭 ────────────────────
  const [revDist, setRevDist] = useState<DistKey>('full')
  const [rh, setRh] = useState(3)
  const [rm, setRm] = useState(30)
  const [rs, setRs] = useState(0)
  const [curDist, setCurDist] = useState<DistKey>('10k')
  const [ch, setCh] = useState(0)
  const [cm, setCm] = useState(50)
  const [cs, setCs] = useState(0)

  const revKm = DISTS.find((d) => d.key === revDist)?.km ?? 42.195
  const revSec = hmsToSec(rh, rm, rs)
  const validRev = revSec >= 60
  const requiredVdot = useMemo(() => validRev ? vdotFromRace(revKm, revSec) : 0, [revKm, revSec, validRev])

  const requiredAbilities = useMemo(() => {
    if (!validRev) return null
    return {
      '5k':   timeFromVdot(5, requiredVdot),
      '10k':  timeFromVdot(10, requiredVdot),
      'half': timeFromVdot(21.0975, requiredVdot),
      'full': timeFromVdot(42.195, requiredVdot),
    }
  }, [requiredVdot, validRev])

  const curKm = DISTS.find((d) => d.key === curDist)?.km ?? 10
  const curSec = hmsToSec(ch, cm, cs)
  const validCur = curSec >= 60
  const currentVdot = useMemo(() => validCur ? vdotFromRace(curKm, curSec) : 0, [curKm, curSec, validCur])
  const vdotGap = validCur && validRev ? requiredVdot - currentVdot : 0
  const monthsEstimate = vdotGap > 0 ? Math.round(vdotGap * 8) : 0  // VDOT 1↑ ≈ 6~12주 → 8주 평균

  // ── 페이스 전략 탭 ──────────────────
  const [stratDist, setStratDist] = useState<DistKey>('full')
  const [gh, setGh] = useState(3)
  const [gm, setGm] = useState(30)
  const [gs, setGs] = useState(0)
  const [strategy, setStrategy] = useState<'even' | 'negative' | 'positive'>('even')
  const stratKm = DISTS.find((d) => d.key === stratDist)?.km ?? 42.195
  const goalSec = hmsToSec(gh, gm, gs)

  const splits = useMemo(() => {
    if (goalSec < 60 || stratKm <= 0) return []
    const avgPace = goalSec / stratKm
    const segs: { from: number; to: number; pace: number; segTime: number; cum: number; mark?: string }[] = []
    let from = 0
    const totalSegs = Math.ceil(stratKm / 5)
    for (let i = 0; i < totalSegs; i++) {
      const to = Math.min((i + 1) * 5, stratKm)
      let pace = avgPace
      if (strategy === 'negative') {
        const mid = (from + to) / 2
        const t = mid / stratKm
        pace = avgPace * (1.015 - 0.03 * t)
      } else if (strategy === 'positive') {
        const mid = (from + to) / 2
        const t = mid / stratKm
        pace = avgPace * (0.985 + 0.03 * t)
      }
      segs.push({ from, to, pace, segTime: pace * (to - from), cum: 0 })
      from = to
    }
    const sumTime = segs.reduce((s, x) => s + x.segTime, 0)
    const scale = goalSec / sumTime
    let cum = 0
    for (const s of segs) {
      s.pace *= scale
      s.segTime *= scale
      cum += s.segTime
      s.cum = cum
      if (Math.abs(s.to - 21.0975) < 0.5) s.mark = '🏁 하프'
      else if (Math.abs(s.to - 30) < 0.5) s.mark = '🔴 마의 30km'
      else if (Math.abs(s.to - 42.195) < 0.5) s.mark = '🏆 결승'
    }
    return segs
  }, [goalSec, stratKm, strategy])

  // ── 내 기록 탭 ─────────────────────
  const [records, setRecords] = useState<RaceRecord[]>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setRecords(loadRecords())
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    saveRecords(records)
  }, [records, mounted])

  const addRecordFromCurrent = () => {
    if (!validBase || !vdot) return
    const today = new Date().toISOString().slice(0, 10)
    const rec: RaceRecord = {
      id: Math.random().toString(36).slice(2, 10),
      date: today,
      distance: baseDist === 'custom' ? 'custom' : baseDist,
      customKm: baseDist === 'custom' ? customKm : undefined,
      timeSec: baseSec,
      vdot,
      conditions: envOn ? { temp, humidity, elevation } : undefined,
    }
    setRecords((p) => [...p, rec])
  }

  const downloadCSV = () => {
    const csv = recordsToCSV(records)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtil-race-records-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/race-predictor', label: '마라톤 예측' },
          { href: '/tools/sports/pace', label: '러닝 페이스' },
          { href: '/tools/sports/one-rm', label: '1RM 계산기' }
        ]}
      >
        본 도구는 일반 가이드입니다 3공식 평균으로 오차 완화 — 5km → 풀 예측은 거리차 大, 10km 이상 기준 권장 환경 보정·연령 보정도 평균 통계 (실제 ±20% 차이 가능) 25°C 이상 시 열사병 위험 — 어지러움 즉시 중단·119
      </Disclaimer>

      {/* ── 탭 헤더 ── */}
      <div className={`${styles.tabs} ${styles.tabs4}`}>
        {([
          { k: 'predict',  l: '🏁 기록 예측' },
          { k: 'reverse',  l: '🎯 목표 역산' },
          { k: 'strategy', l: '📊 페이스 전략' },
          { k: 'records',  l: '📈 내 기록' },
        ] as const).map((t) => (
          <button key={t.k} className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`} onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1: 기록 예측 ══════════ */}
      {tab === 'predict' && (
        <div className={styles.panel}>
          <section>
            <label className={styles.label}>기준 거리</label>
            <div className={styles.distGrid}>
              {DISTS.map((d) => (
                <button key={d.key}
                  className={`${styles.distBtn} ${baseDist === d.key ? styles.distBtnActive : ''}`}
                  onClick={() => setBaseDist(d.key)}>
                  {d.label}
                </button>
              ))}
              <button className={`${styles.distBtn} ${baseDist === 'custom' ? styles.distBtnActive : ''}`}
                onClick={() => setBaseDist('custom')}>커스텀</button>
            </div>
            {baseDist === 'custom' && (
              <div className={styles.customRow}>
                <input type="number" inputMode="decimal" min={0.5} step={0.1} value={customKm}
                  onChange={(e) => setCustomKm(+e.target.value || 0)}
                  className={styles.customInput} />
                <span className={styles.unit}>km</span>
              </div>
            )}
          </section>

          <section>
            <label className={styles.label}>기록 (시:분:초)</label>
            <TimeInput hours={bh} min={bm} sec={bs} onChange={(h, m, s) => { setBh(h); setBm(m); setBs(s) }} />
            {baseDist !== 'custom' && QUICK_TIMES[baseDist].length > 0 && (
              <div className={styles.quickRow}>
                <span className={styles.quickLabel}>빠른 입력</span>
                <div className={styles.quickChips}>
                  {QUICK_TIMES[baseDist].map((q) => (
                    <button key={q.label} className={styles.quickChip}
                      onClick={() => applyQuick(q.h, q.m, q.s)}>{q.label}</button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <label className={styles.label}>예측할 거리 <span className={styles.labelSub}>(다중 선택)</span></label>
            <div className={styles.targetGrid}>
              {TARGETS.map((t) => (
                <button key={t.key}
                  className={`${styles.targetBtn} ${selected.has(t.key) ? styles.targetBtnActive : ''}`}
                  onClick={() => toggleTarget(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* 예상 기록 카드 그리드 — 선택한 모든 거리 */}
          {validBase && predictions.length > 0 && (() => {
            // Primary 카드: 풀 마라톤 우선, 없으면 가장 긴 선택 거리
            const sorted = [...predictions].sort((a, b) => b.km - a.km)
            const primaryKey = predictions.find((p) => p.key === 'full')?.key ?? sorted[0].key
            return (
              <section>
                <div className={styles.predHead}>
                  <p className={styles.predHeadLabel}>예상 기록 <span className={styles.labelSub}>(3공식 평균 · 평시)</span></p>
                  <span className={styles.vdotStrip}>
                    VDOT <strong style={{ color: level.color }}>{vdot.toFixed(1)}</strong>
                    <span className={styles.vdotStripTag} style={{ background: `${level.color}22`, color: level.color }}>{level.tag}</span>
                  </span>
                </div>
                <div className={styles.predCardGrid}>
                  {predictions.map((p) => {
                    const isPrimary = p.key === primaryKey
                    const speedKmh = p.km / (p.avg / 3600)
                    return (
                      <div key={p.key} className={`${styles.predCard} ${isPrimary ? styles.predCardPrimary : ''}`}>
                        <p className={styles.predCardLabel}>{p.label}</p>
                        <p className={styles.predCardTime}>{fmtHMS(p.avg)}</p>
                        <p className={styles.predCardPace}>
                          페이스 <strong>{fmtPace(p.pace)}</strong>/km
                          {isPrimary && <> · {speedKmh.toFixed(2)} km/h</>}
                        </p>
                        <div className={styles.predCardFormulas}>
                          <span><span className={styles.predCardFormulaKey}>R</span>{fmtHMS(p.riegel)}</span>
                          <span><span className={styles.predCardFormulaKey}>V</span>{fmtHMS(p.vdot)}</span>
                          <span><span className={styles.predCardFormulaKey}>C</span>{fmtHMS(p.cameron)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })()}

          {/* ── 환경 보정 ── */}
          <section className={styles.optionCard}>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={envOn} onChange={(e) => setEnvOn(e.target.checked)} />
              <span>🌡️ 대회 환경 보정</span>
            </label>
            {envOn && (
              <div className={styles.optionBody}>
                <div className={styles.sliderRow}>
                  <label>기온 <strong>{temp}°C</strong></label>
                  <input type="range" min={-10} max={35} step={1} value={temp}
                    onChange={(e) => setTemp(+e.target.value)} className={styles.slider} />
                </div>
                <div className={styles.sliderRow}>
                  <label>습도 <strong>{humidity}%</strong></label>
                  <input type="range" min={30} max={95} step={5} value={humidity}
                    onChange={(e) => setHumidity(+e.target.value)} className={styles.slider} />
                </div>
                <div className={styles.sliderRow}>
                  <label>고도 <strong>{elevation}m</strong></label>
                  <input type="range" min={0} max={3000} step={50} value={elevation}
                    onChange={(e) => setElevation(+e.target.value)} className={styles.slider} />
                </div>

                {env && (
                  <>
                    <table className={styles.envTable}>
                      <thead>
                        <tr><th>요인</th><th>조건</th><th>영향</th><th>추가 시간</th></tr>
                      </thead>
                      <tbody>
                        {env.factors.map((f, i) => (
                          <tr key={i}>
                            <td>{f.name}</td>
                            <td className={styles.envDetail}>{f.detail}</td>
                            <td className={styles.envPct}>{f.percent === 0 ? '—' : `+${f.percent.toFixed(1)}%`}</td>
                            <td className={styles.envSec}>{f.addedSec === 0 ? '—' : `+${fmtMS(f.addedSec)}`}</td>
                          </tr>
                        ))}
                        <tr className={styles.envTotal}>
                          <td colSpan={2}>합계</td>
                          <td>+{env.totalPercent.toFixed(1)}%</td>
                          <td>+{fmtMS(env.correctedTime - (fullPred?.avg ?? 0))}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className={styles.envResult}>
                      <div>
                        <span className={styles.envResultLabel}>평시</span>
                        <span className={styles.envResultVal}>{fmtHMS(fullPred?.avg ?? 0)}</span>
                      </div>
                      <span className={styles.envResultArrow}>→</span>
                      <div>
                        <span className={styles.envResultLabel}>대회 당일</span>
                        <span className={`${styles.envResultVal} ${styles.envResultValAccent}`}>{fmtHMS(env.correctedTime)}</span>
                      </div>
                    </div>

                    {env.warning === 'danger' && (
                      <div className={styles.dangerCard}>
                        <strong>🔴 위험 — 30°C 이상</strong>
                        <p>열사병 위험이 매우 높습니다. 평시 페이스 -15%로 시작, 5km마다 수분·전해질, 어지러움·구토 시 즉시 중단·119. 가능하면 다른 시즌 대회 고려.</p>
                      </div>
                    )}
                    {env.warning === 'caution' && (
                      <div className={styles.cautionCard}>
                        <strong>⚠️ 주의 — 25~29°C</strong>
                        <p>평시 페이스 -10%로 시작, 충분한 수분(15~20분마다 물·전해질), 어지러움 시 즉시 중단·119.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          {/* ── 연령·성별 ── */}
          <section className={styles.optionCard}>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={demoOn} onChange={(e) => setDemoOn(e.target.checked)} />
              <span>👥 연령·성별 보정 (참고)</span>
            </label>
            {demoOn && (
              <div className={styles.optionBody}>
                <div className={styles.demoRow}>
                  <div className={styles.pillRow}>
                    <button className={`${styles.pill} ${gender === 'male' ? styles.pillActive : ''}`} onClick={() => setGender('male')}>남성</button>
                    <button className={`${styles.pill} ${gender === 'female' ? styles.pillActive : ''}`} onClick={() => setGender('female')}>여성</button>
                  </div>
                  <select className={styles.select} value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value as AgeBand)}>
                    {(Object.keys(AGE_BAND_LABEL) as AgeBand[]).map((k) => (
                      <option key={k} value={k}>{AGE_BAND_LABEL[k]}</option>
                    ))}
                  </select>
                </div>

                {demoBaseline && fullPred && (
                  <div className={styles.demoResult}>
                    <p>
                      현재 풀 예상 <strong>{fmtHMS(fullPred.avg)}</strong> ({AGE_BAND_LABEL[ageBand]} {gender === 'female' ? '여성' : '남성'})
                    </p>
                    <p className={styles.demoSub}>
                      ↔ 같은 능력의 20대 남성 환산: <strong>{fmtHMS(demoBaseline.youngMaleEquivalent)}</strong>
                      <span className={styles.demoFactor}>(보정 계수 {demoBaseline.factor.toFixed(2)})</span>
                    </p>
                    <p className={styles.demoNote}>
                      💡 WMA(World Masters Athletics) 통계 평균 — 개인차 큼. 꾸준한 훈련 = 연령 극복 가능.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* 공식별 비교표 */}
          {predictions.length > 0 && (
            <section>
              <label className={styles.label}>공식별 예상 기록</label>
              <div className={styles.tableWrap}>
                <table className={styles.predTable}>
                  <thead>
                    <tr>
                      <th>거리</th>
                      <th>Riegel</th>
                      <th>VDOT</th>
                      <th>Cameron</th>
                      <th className={styles.avgCol}>평균</th>
                      <th>페이스</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p) => (
                      <tr key={p.key}>
                        <td className={styles.distCell}>{p.label}</td>
                        <td>{fmtHMS(p.riegel)}</td>
                        <td>{fmtHMS(p.vdot)}</td>
                        <td>{fmtHMS(p.cameron)}</td>
                        <td className={styles.avgCell}>{fmtHMS(p.avg)}</td>
                        <td className={styles.paceCell}>{fmtPace(p.pace)}/km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 서브 목표 */}
          {fullPred && (
            <section>
              <label className={styles.label}>서브 목표 달성 여부 <span className={styles.labelSub}>(풀 기준)</span></label>
              <div className={styles.subGoals}>
                {SUB_GOALS.map((g) => {
                  const achieved = fullPred.avg <= g.sec
                  return (
                    <div key={g.label} className={`${styles.subCard} ${achieved ? styles.subCardYes : styles.subCardNo}`}>
                      <span className={styles.subLabel}>{g.label}</span>
                      <span className={styles.subStatus}>{achieved ? '✓ 달성' : '✗ 미달'}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* 기록 저장 안내 */}
          {validBase && (
            <section className={styles.optionCard}>
              <button className={styles.saveBtn} onClick={addRecordFromCurrent}>
                📈 이 기록 저장 (📈 내 기록 탭에서 추이 확인)
              </button>
            </section>
          )}
        </div>
      )}

      {/* ══════════ TAB 2: 목표 역산 (NEW) ══════════ */}
      {tab === 'reverse' && (
        <div className={styles.panel}>
          <section>
            <label className={styles.label}>🎯 목표 거리</label>
            <div className={styles.distGrid}>
              {DISTS.filter((d) => d.key !== 'custom').map((d) => (
                <button key={d.key}
                  className={`${styles.distBtn} ${revDist === d.key ? styles.distBtnActive : ''}`}
                  onClick={() => setRevDist(d.key)}>
                  {d.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className={styles.label}>목표 시간</label>
            <TimeInput hours={rh} min={rm} sec={rs} onChange={(h, m, s) => { setRh(h); setRm(m); setRs(s) }} />
            {QUICK_TIMES[revDist].length > 0 && (
              <div className={styles.quickRow}>
                <span className={styles.quickLabel}>빠른 입력</span>
                <div className={styles.quickChips}>
                  {QUICK_TIMES[revDist].map((q) => (
                    <button key={q.label} className={styles.quickChip}
                      onClick={() => { setRh(q.h); setRm(q.m); setRs(q.s) }}>{q.label}</button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {validRev && requiredAbilities && (
            <>
              <section className={styles.hero}>
                <p className={styles.heroLabel}>목표 달성에 필요한 능력</p>
                <p className={styles.heroTime}>VDOT {requiredVdot.toFixed(1)}</p>
                <p className={styles.heroPace}>
                  {DISTS.find((d) => d.key === revDist)?.label} {fmtHMS(revSec)} 달성 기준
                </p>
              </section>

              <section>
                <label className={styles.label}>거리별 필요 기록</label>
                <table className={styles.predTable}>
                  <thead><tr><th>거리</th><th>필요 기록</th><th>페이스</th></tr></thead>
                  <tbody>
                    {([
                      { key: '5k',   km: 5,        label: '5km',  sec: requiredAbilities['5k'] },
                      { key: '10k',  km: 10,       label: '10km', sec: requiredAbilities['10k'] },
                      { key: 'half', km: 21.0975,  label: '하프', sec: requiredAbilities['half'] },
                      { key: 'full', km: 42.195,   label: '풀',   sec: requiredAbilities['full'] },
                    ] as const).map((r) => (
                      <tr key={r.key} className={r.key === revDist ? styles.targetRow : ''}>
                        <td className={styles.distCell}>{r.label}{r.key === revDist && ' ⭐'}</td>
                        <td className={styles.avgCell}>{fmtHMS(r.sec)}</td>
                        <td className={styles.paceCell}>{fmtPace(r.sec / r.km)}/km</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className={styles.optionCard}>
                <p className={styles.gapTitle}>📊 본인 현재 기록 입력 (격차 분석 — 선택)</p>
                <div className={styles.distGrid}>
                  {DISTS.filter((d) => d.key !== 'custom').map((d) => (
                    <button key={d.key}
                      className={`${styles.distBtn} ${curDist === d.key ? styles.distBtnActive : ''}`}
                      onClick={() => setCurDist(d.key)}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <TimeInput hours={ch} min={cm} sec={cs} onChange={(h, m, s) => { setCh(h); setCm(m); setCs(s) }} />
                </div>

                {validCur && (
                  <div className={styles.gapResult}>
                    <p>
                      현재 VDOT <strong>{currentVdot.toFixed(1)}</strong> → 목표 VDOT <strong>{requiredVdot.toFixed(1)}</strong>
                    </p>
                    <p>
                      격차: <strong className={vdotGap > 0 ? styles.gapNeg : styles.gapPos}>
                        {vdotGap > 0 ? `+${vdotGap.toFixed(1)} VDOT 향상 필요` : `${(-vdotGap).toFixed(1)} VDOT 여유 ✓`}
                      </strong>
                    </p>
                    {vdotGap > 0 && (
                      <p className={styles.gapEstimate}>
                        💡 일반적으로 VDOT 1↑ ≈ 6~12주 꾸준한 훈련. 약 <strong>{monthsEstimate}주</strong> ({Math.round(monthsEstimate / 4)}개월) 예상.
                      </p>
                    )}
                  </div>
                )}

                <p className={styles.gapHint}>
                  📚 더 빨라지려면: 인터벌·역치 훈련 + 충분한 회복 + 30km+ 장거리 주.
                  심화 훈련 스케줄은 <Link href="/tools/sports/interval-training" className={styles.crossLink}>인터벌 훈련 계산기</Link>에서.
                </p>
              </section>
            </>
          )}
        </div>
      )}

      {/* ══════════ TAB 3: 페이스 전략 ══════════ */}
      {tab === 'strategy' && (
        <div className={styles.panel}>
          <section>
            <label className={styles.label}>목표 거리</label>
            <div className={styles.distGrid}>
              {DISTS.filter((d) => d.key !== 'custom').map((d) => (
                <button key={d.key}
                  className={`${styles.distBtn} ${stratDist === d.key ? styles.distBtnActive : ''}`}
                  onClick={() => setStratDist(d.key)}>
                  {d.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className={styles.label}>목표 시간</label>
            <TimeInput hours={gh} min={gm} sec={gs} onChange={(h, m, s) => { setGh(h); setGm(m); setGs(s) }} />
          </section>

          <section>
            <label className={styles.label}>레이스 전략</label>
            <div className={styles.stratRow}>
              {([
                { k: 'even',     l: '균등 스플릿',     desc: '전구간 균일 페이스' },
                { k: 'negative', l: '네거티브 스플릿', desc: '후반에 더 빠르게 (-3%)' },
                { k: 'positive', l: '포지티브 스플릿', desc: '전반에 더 빠르게 (+3%)' },
              ] as const).map((s) => (
                <button key={s.k}
                  className={`${styles.stratBtn} ${strategy === s.k ? styles.stratBtnActive : ''}`}
                  onClick={() => setStrategy(s.k)}>
                  <span className={styles.stratLabel}>{s.l}</span>
                  <span className={styles.stratDesc}>{s.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {splits.length > 0 && (
            <section>
              <label className={styles.label}>구간별 스플릿</label>
              <div className={styles.tableWrap}>
                <table className={styles.splitsTable}>
                  <thead>
                    <tr><th>구간</th><th>페이스/km</th><th>구간 시간</th><th>누적</th></tr>
                  </thead>
                  <tbody>
                    {splits.map((s, i) => (
                      <tr key={i}>
                        <td className={styles.segCell}>
                          {s.from.toFixed(0)}~{s.to.toFixed(s.to % 1 ? 2 : 0)}km
                          {s.mark && <span className={styles.segMark}> {s.mark}</span>}
                        </td>
                        <td className={styles.paceCell}>{fmtPace(s.pace)}</td>
                        <td>{fmtMS(s.segTime)}</td>
                        <td className={styles.avgCell}>{fmtHMS(s.cum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 훈련 페이스 — 간단 표시 */}
          {validBase && vdot > 0 && (
            <section className={styles.optionCard}>
              <p className={styles.gapTitle}>⚡ 훈련 페이스 (E·M·T·I·R) — 간단</p>
              <p className={styles.zoneIntro}>
                기록 예측 탭의 입력 기준 (VDOT {vdot.toFixed(1)}) — 훈련 페이스는 <strong>결과 부산물</strong>입니다.
              </p>
              <div className={styles.zoneSimple}>
                {PACE_ZONES.map((z) => {
                  const pace = paceFromVdot(vdot, z.intensity)
                  return (
                    <div key={z.key} className={styles.zoneSimpleItem} style={{ borderColor: `${z.color}55` }}>
                      <span className={styles.zoneKey} style={{ background: z.color, color: '#0B0B0B' }}>{z.key}</span>
                      <span className={styles.zoneName}>{z.name}</span>
                      <span className={styles.zoneSimplePace} style={{ color: z.color }}>{fmtPace(pace)}/km</span>
                      <span className={styles.zoneSimpleDesc}>{z.desc}</span>
                    </div>
                  )
                })}
              </div>
              <p className={styles.zoneXLink}>
                📚 심화 (인터벌 페이스 정확·400m 랩·4~16주 훈련 스케줄): <Link href="/tools/sports/interval-training" className={styles.crossLink}>인터벌 훈련 계산기</Link>
                {' · '}
                단순 페이스↔시간 변환: <Link href="/tools/sports/pace" className={styles.crossLink}>러닝 페이스 계산기</Link>
              </p>
            </section>
          )}

          <section className={styles.koreaCard}>
            <p className={styles.gapTitle}>📅 한국 마라톤 시즌 가이드</p>
            <table className={styles.envTable}>
              <thead><tr><th>시즌</th><th>평균 기온</th><th>평가</th><th>주요 대회</th></tr></thead>
              <tbody>
                {KOREA_SEASONS.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td className={styles.envDetail}>{s.temp}</td>
                    <td>{s.rating}</td>
                    <td className={styles.envDetail}>{s.races}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.gapHint}>
              ⚠️ 특정 대회 추천 X · 일반 정보만. 참가 신청은 공식 홈페이지에서.
            </p>
          </section>
        </div>
      )}

      {/* ══════════ TAB 4: 내 기록 (NEW) ══════════ */}
      {tab === 'records' && (
        <div className={styles.panel}>
          {!mounted ? (
            <p className={styles.emptyMsg}>로딩 중…</p>
          ) : records.length === 0 ? (
            <div className={styles.optionCard}>
              <p className={styles.emptyMsg}>
                저장된 기록이 없습니다.<br />
                <strong>🏁 기록 예측</strong> 탭에서 기록 입력 후 <strong>📈 이 기록 저장</strong> 버튼을 눌러주세요.<br />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>※ 모든 기록은 본 브라우저(localStorage)에만 저장됩니다.</span>
              </p>
            </div>
          ) : (
            <>
              <RecordsChart records={records} />

              <section>
                <label className={styles.label}>전체 기록 ({records.length})</label>
                <div className={styles.recordList}>
                  {records.slice().sort((a, b) => b.date.localeCompare(a.date)).map((r) => {
                    const distLabel = r.distance === 'custom' ? `${r.customKm}km` : (DISTS.find((d) => d.key === r.distance)?.label ?? r.distance)
                    return (
                      <div key={r.id} className={styles.recordItem}>
                        <span className={styles.recordDate}>{r.date}</span>
                        <span className={styles.recordDist}>{distLabel}</span>
                        <span className={styles.recordTime}>{fmtHMS(r.timeSec)}</span>
                        <span className={styles.recordVdot}>VDOT {r.vdot.toFixed(1)}</span>
                        <button className={styles.recordRemove}
                          onClick={() => setRecords((p) => p.filter((x) => x.id !== r.id))}
                          aria-label="삭제">✕</button>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className={styles.optionCard}>
                <button className={styles.saveBtn} onClick={downloadCSV}>📊 CSV 다운로드</button>
                <button className={styles.clearBtn}
                  onClick={() => { if (confirm('모든 기록을 삭제하시겠습니까?')) setRecords([]) }}>
                  전체 기록 삭제
                </button>
              </section>
            </>
          )}

          <p className={styles.disclaimerTone}>
            💡 통계는 본인 발전 참고용. 0인 달도 OK·쉬어가는 달도 OK. 부상 시 즉시 휴식·의료 상담.
          </p>
        </div>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// VDOT 추이 그래프
// ─────────────────────────────────────────────────────────────
function RecordsChart({ records }: { records: RaceRecord[] }) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date))
  if (sorted.length === 0) return null

  const W = 600, H = 180, padL = 36, padR = 16, padT = 16, padB = 30
  const minV = Math.min(...sorted.map((r) => r.vdot))
  const maxV = Math.max(...sorted.map((r) => r.vdot))
  const yMin = Math.floor(minV - 1)
  const yMax = Math.ceil(maxV + 1)

  if (sorted.length === 1) {
    return (
      <div className={styles.chartWrap}>
        <p className={styles.chartTitle}>VDOT 추이</p>
        <p className={styles.chartEmpty}>기록이 2개 이상 쌓이면 그래프가 표시됩니다 (현재 VDOT {sorted[0].vdot.toFixed(1)}).</p>
      </div>
    )
  }

  const xOf = (i: number) => padL + (i / (sorted.length - 1)) * (W - padL - padR)
  const yOf = (v: number) => padT + (H - padT - padB) - ((v - yMin) / (yMax - yMin)) * (H - padT - padB)

  const pts = sorted.map((r, i) => `${xOf(i)},${yOf(r.vdot)}`).join(' ')
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const diff = last.vdot - first.vdot
  const days = Math.round((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className={styles.chartWrap}>
      <p className={styles.chartTitle}>📈 VDOT 추이</p>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
        <line x1={padL} y1={yOf(maxV)} x2={W - padR} y2={yOf(maxV)} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1={padL} y1={yOf(minV)} x2={W - padR} y2={yOf(minV)} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <polyline points={pts} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {sorted.map((r, i) => (
          <circle key={r.id} cx={xOf(i)} cy={yOf(r.vdot)} r={3.5} fill="var(--accent)" />
        ))}
        <text x={padL - 4} y={yOf(maxV) + 3} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">{maxV.toFixed(1)}</text>
        <text x={padL - 4} y={yOf(minV) + 3} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">{minV.toFixed(1)}</text>
        <text x={padL} y={H - 12} fill="var(--muted)" fontSize="10" textAnchor="start" fontFamily="Inter, system-ui, sans-serif">{first.date.slice(2)}</text>
        <text x={W - padR} y={H - 12} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">{last.date.slice(2)}</text>
      </svg>
      <p className={styles.chartCaption}>
        {days}일간 VDOT <strong style={{ color: diff >= 0 ? '#059669' : '#DC2626' }}>
          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
        </strong> {diff >= 0 ? '향상' : '변화'}
        {' · '}
        풀 마라톤 환산: {fmtHMS(timeFromVdot(42.195, first.vdot))} → <strong>{fmtHMS(timeFromVdot(42.195, last.vdot))}</strong>
      </p>
    </div>
  )
}
