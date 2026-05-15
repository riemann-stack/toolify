/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './buildup.module.css'
import {
  PROFILE_LABEL, PROFILE_DESC, INTENSITY_LABEL,
  SPLIT_LABEL, PACE_QUICK, DIST_PRESETS_KM, PRESETS,
  parsePace, fmtPace, fmtHMS,
  segmentsFromMode, calcBuildup, safetyCheck,
  vdotFromRace, paceFromVdot,
  loadRoutines, saveRoutines, routinesToCSV,
  type Profile, type SplitMode, type Intensity,
  type BuildupRoutine, type Preset,
} from './buildupUtils'

type TabKey = 'design' | 'race' | 'preset' | 'routines'

function uid(): string { return Math.random().toString(36).slice(2, 10) }

export default function BuildupClient() {
  const [tab, setTab] = useState<TabKey>('design')

  // ── 빌드업 설계 입력 ───────────────────
  const [totalKm, setTotalKm] = useState<string>('10')
  const [startPace, setStartPace] = useState<string>('6:00')
  const [endPace, setEndPace] = useState<string>('5:00')
  const [splitMode, setSplitMode] = useState<SplitMode>('equal-5')
  const [profile, setProfile] = useState<Profile>('linear')

  // VDOT (선택) — 5K/10K/하프 기록으로 추정
  const [refDist, setRefDist] = useState<'5k' | '10k' | 'half'>('10k')
  const [refTime, setRefTime] = useState<string>('')   // hh:mm:ss or mm:ss

  // 자가체크
  const [hardYesterday, setHardYesterday] = useState(false)
  const [painFatigue, setPainFatigue] = useState(false)

  // ── 파싱 ───────────────────────────────
  const numKm = Math.max(0, parseFloat(totalKm) || 0)
  const startSec = parsePace(startPace)
  const endSec = parsePace(endPace)
  const valid = numKm > 0 && startSec > 0 && endSec > 0

  // ── VDOT 추정 ──────────────────────────
  const refTimeSec = useMemo(() => {
    const m = refTime.match(/^\s*(\d+)\s*[:.]\s*(\d{1,2})(?:\s*[:.]\s*(\d{1,2}))?\s*$/)
    if (!m) return 0
    if (m[3]) return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3])
    return parseInt(m[1]) * 60 + parseInt(m[2])
  }, [refTime])

  const refKm = refDist === '5k' ? 5 : refDist === '10k' ? 10 : 21.0975
  const vdot = useMemo(() => {
    if (refTimeSec < 60) return null
    return vdotFromRace(refKm, refTimeSec)
  }, [refKm, refTimeSec])

  const user5kPaceSec = useMemo(() => {
    if (!vdot) return null
    // 5K race pace ≈ T + a bit (보통 T~I 사이)
    // 단순화: VDOT 기반 5K 페이스 = T 페이스에서 약 -8초 (대략)
    return paceFromVdot(vdot, INTENSITY_LABEL.T.pct + 0.04)
  }, [vdot])

  // ── 구간 + 결과 ────────────────────────
  const segments = useMemo(
    () => valid ? segmentsFromMode(numKm, splitMode) : [],
    [valid, numKm, splitMode],
  )
  const result = useMemo(
    () => valid ? calcBuildup(segments, startSec, endSec, profile, vdot) : null,
    [valid, segments, startSec, endSec, profile, vdot],
  )
  const warnings = useMemo(
    () => result ? safetyCheck(result, startSec, endSec, user5kPaceSec, vdot) : [],
    [result, startSec, endSec, user5kPaceSec, vdot],
  )

  // ── 복사 ──────────────────────────────
  const [copied, setCopied] = useState<'md' | 'watch' | null>(null)
  const buildMarkdown = (): string => {
    if (!result) return ''
    const today = new Date().toISOString().slice(0, 10)
    const lines: string[] = []
    lines.push(`# 📈 ${result.totalKm.toFixed(1)}km 빌드업 (${today})`)
    lines.push(`프로파일: ${PROFILE_LABEL[profile]}`)
    lines.push('')
    lines.push('| 구간 | 거리 | 페이스 | 누적 | 강도 |')
    lines.push('|---|---|---|---|---|')
    for (const seg of result.segments) {
      const tag = seg.intensity ? `${INTENSITY_LABEL[seg.intensity].label}` : '—'
      lines.push(`| ${seg.index} | ${seg.km.toFixed(1)}km | ${fmtPace(seg.paceSec)}/km | ${fmtHMS(seg.cumTime)} | ${tag} |`)
    }
    lines.push('')
    lines.push(`총 ${fmtHMS(result.totalSec)} / 평균 ${fmtPace(result.avgPaceSec)}/km`)
    lines.push(`youtil.kr/tools/sports/buildup`)
    return lines.join('\n')
  }
  const buildWatchFormat = (): string => {
    if (!result) return ''
    return result.segments
      .map((seg) => `${seg.km.toFixed(1)}km @ ${fmtPace(seg.paceSec)}/km`)
      .join('\n')
  }
  const copy = async (kind: 'md' | 'watch') => {
    try {
      const text = kind === 'md' ? buildMarkdown() : buildWatchFormat()
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(null), 1500)
    } catch { /* ignore */ }
  }

  // ── 프리셋 적용 ──────────────────────
  const applyPreset = (p: Preset) => {
    setTotalKm(String(p.totalKm))
    setProfile(p.profile)
    setSplitMode(p.splitMode)
    if (vdot && p.startFromE !== undefined && p.endFromIntensity) {
      const ePace = paceFromVdot(vdot, INTENSITY_LABEL.E.pct)
      const startS = ePace + p.startFromE
      const endIntensity = p.endFromIntensity
      const endS = paceFromVdot(vdot, INTENSITY_LABEL[endIntensity].pct)
      setStartPace(fmtPace(startS))
      setEndPace(fmtPace(endS))
    } else {
      setStartPace(p.fixedStartPace ?? '6:00')
      setEndPace(p.fixedEndPace ?? '5:00')
    }
    setTab('design')
  }

  // ── 루틴 (localStorage) ──────────────
  const [routines, setRoutines] = useState<BuildupRoutine[]>([])
  const [mounted, setMounted] = useState(false)
  const [routineNameDraft, setRoutineNameDraft] = useState('')
  useEffect(() => { setRoutines(loadRoutines()); setMounted(true) }, [])
  useEffect(() => { if (mounted) saveRoutines(routines) }, [routines, mounted])

  const saveCurrentAsRoutine = () => {
    if (!routineNameDraft.trim()) return
    const r: BuildupRoutine = {
      id: uid(),
      name: routineNameDraft.trim(),
      totalKm: numKm,
      startPace, endPace, profile, splitMode,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setRoutines((p) => [r, ...p])
    setRoutineNameDraft('')
  }
  const applyRoutine = (r: BuildupRoutine) => {
    setTotalKm(String(r.totalKm))
    setStartPace(r.startPace)
    setEndPace(r.endPace)
    setProfile(r.profile)
    setSplitMode(r.splitMode)
    setRoutines((p) => p.map((x) => x.id === r.id
      ? { ...x, lastUsed: new Date().toISOString().slice(0, 10) }
      : x,
    ))
    setTab('design')
  }
  const downloadCSV = () => {
    const csv = routinesToCSV(routines)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtil-buildup-routines-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={s.wrap}>
      {/* ── 탭 ── */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'design' ? s.tabActive : ''}`} onClick={() => setTab('design')}>📈 빌드업 설계</button>
        <button className={`${s.tab} ${tab === 'race' ? s.tabActive : ''}`} onClick={() => setTab('race')}>🏅 레이스 기반</button>
        <button className={`${s.tab} ${tab === 'preset' ? s.tabActive : ''}`} onClick={() => setTab('preset')}>📋 프리셋</button>
        <button className={`${s.tab} ${tab === 'routines' ? s.tabActive : ''}`} onClick={() => setTab('routines')}>💾 내 루틴</button>
      </div>

      {/* ══════════ TAB 1: 설계 ══════════ */}
      {tab === 'design' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>총 거리 (km)</span>
            <input type="number" inputMode="decimal" min={0.5} step={0.5} className={s.input}
              value={totalKm} onChange={(e) => setTotalKm(e.target.value)} />
            <div className={s.quickRow}>
              {DIST_PRESETS_KM.map((d) => (
                <button key={d} className={s.quickChip} onClick={() => setTotalKm(String(d))}>{d}km</button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>시작 페이스 (mm:ss/km)</span>
            <input type="text" inputMode="text" className={s.input}
              placeholder="6:00"
              value={startPace} onChange={(e) => setStartPace(e.target.value)} />
            <div className={s.quickRow}>
              {PACE_QUICK.map((p) => (
                <button key={p} className={s.quickChip} onClick={() => setStartPace(p)}>{p}</button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>끝 페이스 (mm:ss/km)</span>
            <input type="text" inputMode="text" className={s.input}
              placeholder="5:00"
              value={endPace} onChange={(e) => setEndPace(e.target.value)} />
            <div className={s.quickRow}>
              {PACE_QUICK.map((p) => (
                <button key={p} className={s.quickChip} onClick={() => setEndPace(p)}>{p}</button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>구간 분할</span>
            <div className={s.pillRow}>
              {(Object.keys(SPLIT_LABEL) as SplitMode[]).map((m) => (
                <button key={m}
                  className={`${s.pill} ${splitMode === m ? s.pillActive : ''}`}
                  onClick={() => setSplitMode(m)}>{SPLIT_LABEL[m]}</button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>빌드업 프로파일</span>
            <div className={s.profileGrid}>
              {(Object.keys(PROFILE_LABEL) as Profile[]).map((p) => (
                <button key={p}
                  className={`${s.profileBtn} ${profile === p ? s.profileBtnActive : ''}`}
                  onClick={() => setProfile(p)}>
                  <span className={s.profileName}>{PROFILE_LABEL[p]}</span>
                  <span className={s.profileDesc}>{PROFILE_DESC[p]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* VDOT 입력 (선택) */}
          <div className={s.optionCard}>
            <p className={s.optionTitle}>🏅 VDOT 추정 (선택 — 강도 라벨·정확한 안전성 체크)</p>
            <div className={s.refRow}>
              <div className={s.pillRow} style={{ flex: 1 }}>
                {(['5k', '10k', 'half'] as const).map((d) => (
                  <button key={d} className={`${s.pill} ${refDist === d ? s.pillActive : ''}`}
                    onClick={() => setRefDist(d)}>
                    {d === 'half' ? '하프' : d.toUpperCase()}
                  </button>
                ))}
              </div>
              <input type="text" inputMode="text" className={s.input}
                placeholder={refDist === 'half' ? '1:45:00' : '50:00'}
                value={refTime} onChange={(e) => setRefTime(e.target.value)} />
            </div>
            {vdot && (
              <p className={s.optionHint}>
                VDOT 약 <strong>{vdot.toFixed(1)}</strong> · E {fmtPace(paceFromVdot(vdot, 0.59))} ·
                M {fmtPace(paceFromVdot(vdot, 0.70))} · T {fmtPace(paceFromVdot(vdot, 0.78))} ·
                I {fmtPace(paceFromVdot(vdot, 0.85))}
              </p>
            )}
            {!vdot && (
              <p className={s.optionHint}>
                ⚠️ VDOT 미입력 시 강도 라벨·끝 페이스 안전성 체크 일부 비활성화
              </p>
            )}
          </div>

          {/* 자가체크 */}
          <div className={s.optionCard}>
            <p className={s.optionTitle}>☑️ 자가체크 (선택)</p>
            <label className={s.checkRow}>
              <input type="checkbox" checked={hardYesterday} onChange={(e) => setHardYesterday(e.target.checked)} />
              <span>전날 강도 높은 훈련을 했다</span>
            </label>
            <label className={s.checkRow}>
              <input type="checkbox" checked={painFatigue} onChange={(e) => setPainFatigue(e.target.checked)} />
              <span>통증·심한 피로가 있다</span>
            </label>
            {hardYesterday && (
              <div className={s.cautionCard}>
                <strong>⚠️ 회복 빌드업 권장</strong>
                <p>전날 강도가 높았다면 회복 프리셋(🌱)으로 전환 권장. 누적 부하 ↑.</p>
              </div>
            )}
            {painFatigue && (
              <div className={s.dangerCard}>
                <strong>🔴 즉시 휴식</strong>
                <p>통증·심한 피로 시 본 도구 사용 X. 휴식 우선, 의심 시 정형외과·재활의학과.</p>
              </div>
            )}
          </div>

          {!valid && (
            <div className={s.empty}>총 거리·시작·끝 페이스를 입력하세요.</div>
          )}

          {result && (
            <>
              {/* 히어로 */}
              <div className={s.hero}>
                <p className={s.heroLabel}>{result.totalKm.toFixed(1)}km {PROFILE_LABEL[profile]}</p>
                <p className={s.heroValue}>약 {fmtHMS(result.totalSec)}</p>
                <p className={s.heroSub}>평균 페이스 {fmtPace(result.avgPaceSec)}/km · {result.segments.length}구간</p>
              </div>

              {/* 시각화 (SVG 막대) */}
              <BuildupChart result={result} />

              {/* 페이스표 */}
              <div className={s.card}>
                <span className={s.cardLabel}>구간별 페이스표</span>
                <table className={s.paceTable}>
                  <thead>
                    <tr>
                      <th>구간</th>
                      <th>거리</th>
                      <th>페이스</th>
                      <th>누적</th>
                      <th>강도</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.segments.map((seg) => {
                      const meta = seg.intensity ? INTENSITY_LABEL[seg.intensity] : null
                      return (
                        <tr key={seg.index}>
                          <td className={s.cellNum}>{seg.index}</td>
                          <td>{seg.km.toFixed(1)}km</td>
                          <td className={s.cellPace}>{fmtPace(seg.paceSec)}/km</td>
                          <td className={s.cellCum}>{fmtHMS(seg.cumTime)}</td>
                          <td>
                            {meta ? (
                              <span className={s.intensityChip} style={{ background: `${meta.color}22`, color: meta.color, borderColor: `${meta.color}66` }}>
                                {seg.intensity} · {meta.label}
                              </span>
                            ) : (
                              <span className={s.intensityChip} style={{ color: 'var(--muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 안전성 체크 */}
              <div className={s.card}>
                <span className={s.cardLabel}>🛡️ 안전성 체크</span>
                <div className={s.warnList}>
                  {warnings.map((w, i) => (
                    <div key={i} className={`${s.warnItem} ${s[`warnLevel_${w.level}`]}`}>
                      <strong className={s.warnTitle}>{w.title}</strong>
                      <p className={s.warnMsg}>{w.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 복사 */}
              <div className={s.card}>
                <span className={s.cardLabel}>📋 복사·저장</span>
                <div className={s.copyRow}>
                  <button className={`${s.copyBtn} ${copied === 'md' ? s.copyBtnDone : ''}`}
                    onClick={() => copy('md')}>
                    {copied === 'md' ? '✅ 복사됨' : '📋 마크다운 (메모·노션)'}
                  </button>
                  <button className={`${s.copyBtn} ${copied === 'watch' ? s.copyBtnDone : ''}`}
                    onClick={() => copy('watch')}>
                    {copied === 'watch' ? '✅ 복사됨' : '⌚ 워치 워크아웃'}
                  </button>
                </div>
                <div className={s.routineSaveRow}>
                  <input type="text" maxLength={30} className={s.input}
                    placeholder="루틴 이름 (예: 주말 LSD 빌드업)"
                    value={routineNameDraft}
                    onChange={(e) => setRoutineNameDraft(e.target.value)} />
                  <button className={s.saveBtn} onClick={saveCurrentAsRoutine} disabled={!routineNameDraft.trim()}>
                    💾 내 루틴 저장
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════ TAB 2: 레이스 기반 ══════════ */}
      {tab === 'race' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🏅 최근 레이스 기록 입력</span>
            <p className={s.cardSub}>VDOT 기반으로 E·M·T·I·R 페이스 자동 산출 + 빌드업 추천</p>
            <div className={s.refRow}>
              <div className={s.pillRow} style={{ flex: 1 }}>
                {(['5k', '10k', 'half'] as const).map((d) => (
                  <button key={d} className={`${s.pill} ${refDist === d ? s.pillActive : ''}`}
                    onClick={() => setRefDist(d)}>
                    {d === 'half' ? '하프' : d.toUpperCase()}
                  </button>
                ))}
              </div>
              <input type="text" inputMode="text" className={s.input}
                placeholder={refDist === 'half' ? '1:45:00' : '50:00'}
                value={refTime} onChange={(e) => setRefTime(e.target.value)} />
            </div>
          </div>

          {!vdot && (
            <div className={s.empty}>레이스 기록을 입력하세요 (예: 50:00 또는 1:45:00).</div>
          )}

          {vdot && (
            <>
              <div className={s.hero}>
                <p className={s.heroLabel}>VDOT 추정</p>
                <p className={s.heroValue}>{vdot.toFixed(1)}</p>
                <p className={s.heroSub}>{refDist.toUpperCase()} {refTime} 기준</p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>📊 강도별 페이스</span>
                <table className={s.paceTable}>
                  <thead>
                    <tr><th>강도</th><th>페이스</th><th>사용</th></tr>
                  </thead>
                  <tbody>
                    {(['E', 'M', 'T', 'I', 'R'] as Intensity[]).map((k) => {
                      const meta = INTENSITY_LABEL[k]
                      const p = paceFromVdot(vdot, meta.pct)
                      const usage = {
                        E: '회복일·LSD 시작',
                        M: '마라톤 페이스',
                        T: '빌드업 끝 (역치)',
                        I: 'V̇O₂max — 빌드업 권장 X',
                        R: '스피드 — 빌드업 X',
                      }[k]
                      return (
                        <tr key={k}>
                          <td>
                            <span className={s.intensityChip} style={{ background: `${meta.color}22`, color: meta.color, borderColor: `${meta.color}66` }}>
                              {k} · {meta.label}
                            </span>
                          </td>
                          <td className={s.cellPace}>{fmtPace(p)}/km</td>
                          <td className={s.cellSub}>{usage}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>🏃 능력 기준 추천 빌드업</span>
                <div className={s.recoList}>
                  {[
                    { name: '🌱 회복 빌드업', km: 6, profile: 'sprint-finish' as Profile, sM: 'equal-3' as SplitMode, end: 'M' as Intensity, eOff: 30 },
                    { name: '🎯 10K 대비', km: 8, profile: 'linear' as Profile, sM: 'equal-4' as SplitMode, end: 'T' as Intensity, eOff: 0 },
                    { name: '🏃 하프 대비', km: 14, profile: 'race-pace-ladder' as Profile, sM: 'equal-4' as SplitMode, end: 'T' as Intensity, eOff: 0 },
                    { name: '💪 풀 대비', km: 20, profile: 'back-loaded' as Profile, sM: 'equal-4' as SplitMode, end: 'M' as Intensity, eOff: 30 },
                  ].map((r, i) => {
                    const startS = paceFromVdot(vdot, INTENSITY_LABEL.E.pct) + r.eOff
                    const endS = paceFromVdot(vdot, INTENSITY_LABEL[r.end].pct)
                    const apply = () => {
                      setTotalKm(String(r.km))
                      setProfile(r.profile)
                      setSplitMode(r.sM)
                      setStartPace(fmtPace(startS))
                      setEndPace(fmtPace(endS))
                      setTab('design')
                    }
                    return (
                      <button key={i} className={s.recoBtn} onClick={apply}>
                        <span className={s.recoName}>{r.name}</span>
                        <span className={s.recoMeta}>
                          {r.km}km · {fmtPace(startS)} → {fmtPace(endS)}/km · {PROFILE_LABEL[r.profile]}
                        </span>
                        <span className={s.recoApply}>설계 탭으로 적용 →</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={s.warnCard}>
                <p>📊 더 정확한 분석 → <Link href="/tools/sports/race-predictor" className={s.link}>마라톤 기록 계산기</Link></p>
                <p>🏃 인터벌·역치 풀 가이드 → <Link href="/tools/sports/interval-training" className={s.link}>인터벌 훈련 계산기</Link></p>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════ TAB 3: 프리셋 ══════════ */}
      {tab === 'preset' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📋 검증된 빌드업 프리셋 ({PRESETS.length}개)</span>
            <p className={s.cardSub}>한 번 클릭으로 설계 탭에 적용. VDOT 입력 시 본인 능력 기반 자동 계산.</p>
          </div>

          {(['회복', '평일', '10K', '하프', '풀', '스피드'] as const).map((cat) => {
            const items = PRESETS.filter((p) => p.category === cat)
            if (items.length === 0) return null
            return (
              <div key={cat} className={s.card}>
                <span className={s.cardLabel}>{cat}</span>
                <div className={s.presetList}>
                  {items.map((p) => (
                    <button key={p.id} className={s.presetBtn} onClick={() => applyPreset(p)}>
                      <span className={s.presetName}>{p.name}</span>
                      <span className={s.presetMeta}>
                        {p.totalKm}km · {PROFILE_LABEL[p.profile]} · {SPLIT_LABEL[p.splitMode]}
                      </span>
                      <span className={s.presetNote}>{p.note}</span>
                      <span className={s.presetScenario}>📅 {p.scenario}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </>
      )}

      {/* ══════════ TAB 4: 내 루틴 ══════════ */}
      {tab === 'routines' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>💾 저장된 빌드업 루틴</span>
            <p className={s.cardSub}>
              본 루틴은 본인 브라우저(localStorage)에만 저장. 서버 전송 X · 다른 기기 동기화 X.
              백업은 CSV 다운로드 활용.
            </p>
          </div>

          {!mounted ? (
            <div className={s.empty}>로딩 중…</div>
          ) : routines.length === 0 ? (
            <div className={s.empty}>
              저장된 루틴이 없습니다.<br />
              <strong>📈 빌드업 설계</strong> 탭에서 결과 하단의 &ldquo;💾 내 루틴 저장&rdquo; 버튼으로 추가하세요.
            </div>
          ) : (
            <>
              <div className={s.card}>
                <span className={s.cardLabel}>전체 ({routines.length})</span>
                <div className={s.routineList}>
                  {routines.map((r) => (
                    <div key={r.id} className={s.routineItem}>
                      <div className={s.routineHead}>
                        <span className={s.routineName}>{r.name}</span>
                        <button className={s.routineRemove}
                          onClick={() => setRoutines((p) => p.filter((x) => x.id !== r.id))}
                          aria-label="삭제">✕</button>
                      </div>
                      <div className={s.routineMeta}>
                        {r.totalKm}km · {r.startPace} → {r.endPace}/km · {PROFILE_LABEL[r.profile]} · {SPLIT_LABEL[r.splitMode]}
                      </div>
                      <div className={s.routineDates}>
                        <span>생성: {r.createdAt}</span>
                        {r.lastUsed && <span> · 마지막 사용: {r.lastUsed}</span>}
                      </div>
                      <button className={s.routineApply} onClick={() => applyRoutine(r)}>
                        설계 탭으로 적용 →
                      </button>
                    </div>
                  ))}
                </div>
                <div className={s.routineActions}>
                  <button className={s.copyBtn} onClick={downloadCSV}>📊 CSV 다운로드</button>
                  <button className={s.clearBtn}
                    onClick={() => { if (confirm('모든 루틴을 삭제하시겠습니까?')) setRoutines([]) }}>
                    전체 삭제
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── 면책 ── */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/race-predictor', label: '마라톤 예측' },
          { href: '/tools/sports/pace', label: '러닝 페이스' },
          { href: '/tools/sports/one-rm', label: '1RM 계산기' }
        ]}
      >
        본 도구는 일반 가이드입니다 페이스·거리 추천은 평균값 — 컨디션·날씨·지형에 따라 조정 안전성 체크는 일반 가이드 — 본인 한계 보장 X 통증·피로 시 즉시 휴식. 부상 의심 시 정형외과·재활의학과
      </Disclaimer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 빌드업 막대 그래프 (SVG)
// ─────────────────────────────────────────────────────────────
function BuildupChart({ result }: { result: ReturnType<typeof calcBuildup> }) {
  const W = 400, H = 220, padL = 36, padR = 12, padT = 16, padB = 36
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  // 페이스(sec/km) → bar 높이. 빠를수록 막대가 짧게(더 좁게)? 아니다 — 사용자는 "빠를수록 막대 짧게"라 했지만 직관적으로는 빠를수록 위쪽으로 (속도)
  // 결정: y축 = 페이스(sec/km), 빠를수록 위쪽 (반전). 막대 높이 = 페이스 - minPace + offset
  const paces = result.segments.map((s) => s.paceSec)
  const minP = Math.min(...paces)
  const maxP = Math.max(...paces)
  // 약간의 패딩
  const yMin = Math.floor(minP - 10)
  const yMax = Math.ceil(maxP + 10)

  // 거리 가중 x 위치
  const totalKm = result.totalKm
  let cumKm = 0
  const xStarts: number[] = []
  for (const seg of result.segments) {
    xStarts.push(padL + (cumKm / totalKm) * innerW)
    cumKm += seg.km
  }
  const xEnd = padL + innerW
  const widths = result.segments.map((seg, i) => {
    const next = i < result.segments.length - 1 ? xStarts[i + 1] : xEnd
    return Math.max(2, next - xStarts[i] - 2)
  })

  // y 좌표: 빠를수록(작은 sec) 위쪽
  const yOf = (sec: number) => padT + ((sec - yMin) / (yMax - yMin)) * innerH

  return (
    <div className={s.chartWrap}>
      <p className={s.chartTitle}>📊 페이스 그래프</p>
      <svg viewBox={`0 0 ${W} ${H}`} className={s.chartSvg} preserveAspectRatio="xMidYMid meet">
        {/* y축 라벨 (빠른 페이스 ↑·느린 페이스 ↓) */}
        <text x={padL - 6} y={padT + 8} fontSize="11" fill="var(--muted)" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">
          {fmtPace(yMin)}
        </text>
        <text x={padL - 6} y={padT + innerH - 2} fontSize="11" fill="var(--muted)" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">
          {fmtPace(yMax)}
        </text>
        <text x={padL - 6} y={padT + innerH + 14} fontSize="9" fill="var(--muted)" textAnchor="end" fontFamily="Noto Sans KR" opacity="0.6">
          (빠름↑)
        </text>

        {/* 가이드 라인 */}
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH}
          stroke="var(--muted)" strokeWidth="1" opacity="0.3" />

        {/* 막대 — 빠를수록 위로, 모든 막대는 바닥에서 페이스 위치까지 채움 */}
        {result.segments.map((seg, i) => {
          const meta = seg.intensity ? INTENSITY_LABEL[seg.intensity] : null
          const color = meta?.color ?? '#888'
          const y = yOf(seg.paceSec)
          const barH = padT + innerH - y
          return (
            <g key={i}>
              <rect x={xStarts[i] + 1} y={y}
                width={widths[i]} height={Math.max(2, barH)}
                fill={color} fillOpacity="0.7" stroke={color} strokeWidth="1" rx="2" />
              <text x={xStarts[i] + widths[i] / 2} y={y - 6}
                fontSize="11" fill="var(--text)" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight={700}>
                {fmtPace(seg.paceSec)}
              </text>
              {/* x축 거리 */}
              <text x={xStarts[i] + widths[i] / 2} y={padT + innerH + 16}
                fontSize="10" fill="var(--muted)" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">
                {seg.km.toFixed(1)}km
              </text>
            </g>
          )
        })}
      </svg>
      <div className={s.chartLegend}>
        {(['E', 'M', 'T', 'I', 'R'] as Intensity[]).map((k) => {
          const meta = INTENSITY_LABEL[k]
          return (
            <span key={k} className={s.chartLegendItem}>
              <span className={s.chartLegendDot} style={{ background: meta.color }} />
              {k}·{meta.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
