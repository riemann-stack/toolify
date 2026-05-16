/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useMemo } from 'react'
import styles from './pace.module.css'

type Mode = 'pace-to-time' | 'time-to-pace' | 'treadmill'

// ── 헬퍼 ──
function paceToSec(mm: string, ss: string) {
  return parseInt(mm || '0') * 60 + parseInt(ss || '0')
}
function secToPace(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
function timeToSec(hh: string, mm: string, ss: string) {
  return parseInt(hh || '0') * 3600 + parseInt(mm || '0') * 60 + parseInt(ss || '0')
}
function secToTime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  return h > 0
    ? `${h}시간 ${m}분 ${String(s).padStart(2, '0')}초`
    : `${m}분 ${String(s).padStart(2, '0')}초`
}
function secToHms(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}
function paceSecToKph(paceSec: number) { return 3600 / paceSec }
function kphToPaceSec(kph: number) { return 3600 / kph }

const DISTANCES = [
  { label: '5km',       km: 5 },
  { label: '10km',      km: 10 },
  { label: '하프',      km: 21.0975 },
  { label: '풀',        km: 42.195 },
] as const

// 거리별 동적 스플릿 (랜드마크 표시 포함)
type SplitRow = { distanceKm: number; label: string; landmark?: string }

function getSplits(distanceKm: number): SplitRow[] {
  if (distanceKm <= 5) {
    return [1, 2, 3, 4, 5].map(d => ({
      distanceKm: d, label: `${d}km`,
      landmark: d === 5 ? '🏁 5km 완주' : undefined,
    }))
  }
  if (distanceKm <= 10) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(d => ({
      distanceKm: d, label: `${d}km`,
      landmark: d === 5 ? '⏱️ 절반' : d === 10 ? '🏁 10km 완주' : undefined,
    }))
  }
  if (distanceKm <= 22) {
    return [
      { distanceKm: 5,        label: '5km' },
      { distanceKm: 10,       label: '10km',                 landmark: '⏱️ 절반 부근' },
      { distanceKm: 15,       label: '15km' },
      { distanceKm: 20,       label: '20km' },
      { distanceKm: 21.0975,  label: '21.0975km',            landmark: '🏁 하프 완주' },
    ]
  }
  // 풀
  return [
    { distanceKm: 5,       label: '5km' },
    { distanceKm: 10,      label: '10km' },
    { distanceKm: 15,      label: '15km' },
    { distanceKm: 20,      label: '20km' },
    { distanceKm: 21.0975, label: '21.0975km',  landmark: '🏁 하프 통과' },
    { distanceKm: 25,      label: '25km' },
    { distanceKm: 30,      label: '30km',       landmark: '🔴 마의 30km' },
    { distanceKm: 35,      label: '35km' },
    { distanceKm: 40,      label: '40km' },
    { distanceKm: 42.195,  label: '42.195km',   landmark: '🏆 풀 완주' },
  ]
}

// 빠른 페이스 칩
const QUICK_PACES = [
  { mm: 4, ss: 0,  label: '엘리트',    color: '#FF6B6B' },
  { mm: 4, ss: 30, label: '서브3',     color: '#FF8C3E' },
  { mm: 5, ss: 0,  label: '준중급',    color: '#FFD93E' },
  { mm: 5, ss: 30, label: '중급',      color: '#C8FF3E' },
  { mm: 6, ss: 0,  label: '가벼운 조깅', color: '#3EFF9B' },
  { mm: 6, ss: 30, label: '조깅',      color: '#3EC8FF' },
  { mm: 7, ss: 0,  label: '초보',      color: '#9B59B6' },
]

const STORAGE_KEY = 'youtil-pace-record-v1'

export default function PaceClient() {
  const [mode, setMode] = useState<Mode>('pace-to-time')

  // 페이스 → 완주 시간
  const [paceMin, setPaceMin] = useState('5')
  const [paceSec, setPaceSec] = useState('30')
  const [dist, setDist] = useState(42.195)

  // 완주 시간 → 페이스
  const [tHour, setTHour] = useState('')
  const [tMin, setTMin] = useState('')
  const [tSec, setTSec] = useState('')
  const [dist2, setDist2] = useState(42.195)

  // 트레드밀
  const [kphInput, setKphInput] = useState('')
  const [paceInput, setPaceInput] = useState('')

  // localStorage hydration
  const [hydrated, setHydrated] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        if (data.paceMin) setPaceMin(data.paceMin)
        if (data.paceSec) setPaceSec(data.paceSec)
        if (typeof data.dist === 'number') setDist(data.dist)
        if (data.lastSaved) setLastSaved(data.lastSaved)
      }
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const data = {
        paceMin, paceSec, dist,
        lastSaved: new Date().toISOString().slice(0, 10),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [hydrated, paceMin, paceSec, dist])

  // 결과 1
  const result1 = useMemo(() => {
    const ps = paceToSec(paceMin, paceSec)
    if (!ps || ps <= 0) return null
    const totalSec = ps * dist
    const kph = paceSecToKph(ps)
    const track400 = ps * 0.4
    const milePace = ps * 1.609344
    return {
      totalSec,
      time: secToTime(totalSec),
      paceStr: secToPace(ps),
      kph: kph.toFixed(1),
      track400: secToPace(track400),
      milePace: secToPace(milePace),
      paceSec: ps,
    }
  }, [paceMin, paceSec, dist])

  // 결과 2
  const result2 = useMemo(() => {
    const ts = timeToSec(tHour, tMin, tSec)
    if (!ts || ts <= 0 || !dist2) return null
    const ps = ts / dist2
    const kph = paceSecToKph(ps)
    const track400 = ps * 0.4
    return { pace: secToPace(ps), kph: kph.toFixed(1), track400: secToPace(track400), paceSec: ps }
  }, [tHour, tMin, tSec, dist2])

  // 트레드밀
  const treadmillFromKph = useMemo(() => {
    const k = parseFloat(kphInput)
    if (!k || k <= 0) return null
    const ps = kphToPaceSec(k)
    return { pace: secToPace(ps), track400: secToPace(ps * 0.4) }
  }, [kphInput])

  const treadmillFromPace = useMemo(() => {
    const parts = paceInput.split(':')
    if (parts.length !== 2) return null
    const ps = paceToSec(parts[0], parts[1])
    if (!ps || ps <= 0) return null
    return { kph: paceSecToKph(ps).toFixed(1) }
  }, [paceInput])

  // 동적 스플릿
  const splits = useMemo(() => {
    const ps = paceToSec(paceMin, paceSec)
    if (!ps || ps <= 0) return []
    const rows = getSplits(dist)
    return rows.map(r => ({ ...r, time: secToHms(ps * r.distanceKm) }))
  }, [paceMin, paceSec, dist])

  // 네거티브 스플릿 (전반 +1.5초, 후반 -1.5초/km · 마라톤·하프 한정)
  const negativeSplit = useMemo(() => {
    const ps = paceToSec(paceMin, paceSec)
    if (!ps || ps <= 0 || dist < 21) return null
    const halfKm = dist / 2
    return {
      front: secToPace(ps + 1.5),
      back: secToPace(ps - 1.5),
      halfKm,
    }
  }, [paceMin, paceSec, dist])

  const setQuickPace = (mm: number, ss: number) => {
    setPaceMin(String(mm)); setPaceSec(String(ss))
  }

  const handleCopy = async () => {
    if (!result1) return
    const lines = [
      `🏃 러닝 페이스 결과`,
      `페이스 ${result1.paceStr}/km × ${dist === 5 ? '5km' : dist === 10 ? '10km' : dist === 21.0975 ? '하프' : '풀 마라톤'}`,
      `예상 완주: ${result1.time}`,
      `트레드밀 시속: ${result1.kph} km/h`,
      `400m 트랙 1바퀴: ${result1.track400}`,
      `1마일 페이스: ${result1.milePace}`,
      ``,
      `── 구간 스플릿 ──`,
      ...splits.map(s => `${s.label.padEnd(11)} ${s.time}${s.landmark ? '  ' + s.landmark : ''}`),
      ``,
      `youtil.kr/tools/sports/pace`,
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const distLabel = (km: number) => DISTANCES.find(d => d.km === km)?.label ?? `${km}km`

  return (
    <div className={styles.wrap}>
      {/* 모드 탭 */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${mode === 'pace-to-time' ? styles.tabActive : ''}`}
          onClick={() => setMode('pace-to-time')}>📏 페이스 → 완주 시간</button>
        <button className={`${styles.tab} ${mode === 'time-to-pace' ? styles.tabActive : ''}`}
          onClick={() => setMode('time-to-pace')}>⏱️ 완주 시간 → 페이스</button>
        <button className={`${styles.tab} ${mode === 'treadmill' ? styles.tabActive : ''}`}
          onClick={() => setMode('treadmill')}>🏃 트레드밀 변환</button>
      </div>

      {/* ── 모드 1: 페이스 → 완주 시간 ── */}
      {mode === 'pace-to-time' && (
        <>
          {/* 1줄 통합 입력 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>
              페이스 × 거리 입력
              {lastSaved && (
                <span className={styles.savedHint}>💾 마지막 저장: {lastSaved}</span>
              )}
            </label>
            <div className={styles.inputRow1}>
              <div className={styles.paceRow}>
                <input className={styles.paceInput} type="number" inputMode="numeric"
                  placeholder="5" value={paceMin}
                  onChange={e => setPaceMin(e.target.value)} min={1} max={30} />
                <span className={styles.paceSep}>:</span>
                <input className={styles.paceInput} type="number" inputMode="numeric"
                  placeholder="30" value={paceSec}
                  onChange={e => setPaceSec(e.target.value)} min={0} max={59} />
                <span className={styles.paceUnit}>/km</span>
              </div>
              <span className={styles.timesSign}>×</span>
              <div className={styles.distRow}>
                {DISTANCES.map(d => (
                  <button key={d.km}
                    className={`${styles.distBtn} ${dist === d.km ? styles.distBtnActive : ''}`}
                    onClick={() => setDist(d.km)}>{d.label}</button>
                ))}
                <div className={`${styles.distCustom} ${!DISTANCES.some(d => d.km === dist) ? styles.distCustomActive : ''}`}>
                  <input
                    type="number"
                    inputMode="decimal"
                    className={styles.distCustomInput}
                    placeholder="직접"
                    min={0.1} max={500} step={0.1}
                    value={DISTANCES.some(d => d.km === dist) ? '' : dist}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      if (Number.isFinite(v) && v > 0) setDist(v)
                    }}
                  />
                  <span className={styles.distCustomUnit}>km</span>
                </div>
              </div>
            </div>

            {/* 빠른 페이스 칩 */}
            <div className={styles.quickRow}>
              <span className={styles.quickLabel}>빠른 입력</span>
              <div className={styles.quickChips}>
                {QUICK_PACES.map(q => {
                  const active = parseInt(paceMin) === q.mm && parseInt(paceSec) === q.ss
                  return (
                    <button key={`${q.mm}-${q.ss}`}
                      className={`${styles.quickChip} ${active ? styles.quickChipActive : ''}`}
                      onClick={() => setQuickPace(q.mm, q.ss)}
                      style={active ? { borderColor: q.color, color: q.color } : { color: q.color + 'cc' }}>
                      {q.mm}:{String(q.ss).padStart(2, '0')}
                      <span className={styles.quickChipSub}>{q.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {result1 && (
            <>
              {/* 히어로 */}
              <div className={styles.heroCard}>
                <div className={styles.heroLabel}>🏃 {result1.paceStr}/km × {distLabel(dist)}</div>
                <div className={styles.heroNum}>{result1.time}</div>
                <div className={styles.heroSub}>예상 완주 시간</div>
              </div>

              {/* 직관 정보 4종 */}
              <div className={styles.grid4}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>시속</div>
                  <div className={styles.infoVal}>{result1.kph}<span className={styles.infoUnit}>km/h</span></div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>400m 트랙</div>
                  <div className={styles.infoVal}>{result1.track400}<span className={styles.infoUnit}>1바퀴</span></div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>1마일</div>
                  <div className={styles.infoVal}>{result1.milePace}<span className={styles.infoUnit}>/mi</span></div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>거리</div>
                  <div className={styles.infoVal}>{dist}<span className={styles.infoUnit}>km</span></div>
                </div>
              </div>

              {/* 구간 스플릿 (동적) */}
              {splits.length > 0 && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>📐 구간 스플릿 (일정 페이스 가정)</label>
                  <div style={{ overflowX: 'auto' }}>
                    <table className={styles.splitTable}>
                      <thead>
                        <tr>
                          <th>거리</th>
                          <th style={{ textAlign: 'right' }}>누적 시간</th>
                          <th>비고</th>
                        </tr>
                      </thead>
                      <tbody>
                        {splits.map((s, i) => (
                          <tr key={i} className={s.landmark ? styles.landmarkRow : ''}>
                            <td className={styles.splitLabel}>{s.label}</td>
                            <td className={styles.splitTime}>{s.time}</td>
                            <td className={styles.splitMark}>{s.landmark ?? ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 네거티브 스플릿 가이드 (하프·풀만) */}
              {negativeSplit && (
                <div className={styles.negCard}>
                  <p className={styles.negTitle}>💡 네거티브 스플릿 권장 (하프·풀)</p>
                  <p className={styles.negDesc}>
                    후반을 전반보다 약간 빠르게 — 초반 오버페이스 ↓, 후반 무너짐 ↓
                  </p>
                  <div className={styles.negGrid}>
                    <div className={styles.negBox}>
                      <span className={styles.negBoxLabel}>전반 (0~{negativeSplit.halfKm.toFixed(1)}km)</span>
                      <span className={styles.negBoxVal} style={{ color: '#3EC8FF' }}>{negativeSplit.front}/km</span>
                      <span className={styles.negBoxSub}>1.5초 느슨하게</span>
                    </div>
                    <div className={styles.negBox}>
                      <span className={styles.negBoxLabel}>후반 ({negativeSplit.halfKm.toFixed(1)}~{dist}km)</span>
                      <span className={styles.negBoxVal} style={{ color: '#FF8C3E' }}>{negativeSplit.back}/km</span>
                      <span className={styles.negBoxSub}>1.5초 빠르게</span>
                    </div>
                  </div>
                  <p className={styles.negNote}>
                    ⚠️ 충분히 훈련된 러너에게 권장. 초보는 일정 페이스 익히기 우선.
                  </p>
                </div>
              )}

              {/* 결과 복사 */}
              <button type="button"
                className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
                onClick={handleCopy}>
                {copied ? '✅ 복사됨!' : '📋 결과 + 스플릿 복사'}
              </button>
            </>
          )}

          {!result1 && (
            <div className={styles.empty}>페이스와 거리를 선택하면 완주 예상 시간이 계산됩니다</div>
          )}
        </>
      )}

      {/* ── 모드 2: 완주 시간 → 페이스 ── */}
      {mode === 'time-to-pace' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>완주 시간 × 거리 입력</label>
            <div className={styles.inputRow1}>
              <div className={styles.timeRow}>
                <div className={styles.timeField}>
                  <input className={styles.timeInput} type="number" inputMode="numeric"
                    placeholder="0" value={tHour} onChange={e => setTHour(e.target.value)} min={0} max={9} />
                  <span className={styles.timeLabel}>시간</span>
                </div>
                <div className={styles.timeField}>
                  <input className={styles.timeInput} type="number" inputMode="numeric"
                    placeholder="25" value={tMin} onChange={e => setTMin(e.target.value)} min={0} max={59} />
                  <span className={styles.timeLabel}>분</span>
                </div>
                <div className={styles.timeField}>
                  <input className={styles.timeInput} type="number" inputMode="numeric"
                    placeholder="00" value={tSec} onChange={e => setTSec(e.target.value)} min={0} max={59} />
                  <span className={styles.timeLabel}>초</span>
                </div>
              </div>
              <span className={styles.timesSign}>×</span>
              <div className={styles.distRow}>
                {DISTANCES.map(d => (
                  <button key={d.km}
                    className={`${styles.distBtn} ${dist2 === d.km ? styles.distBtnActive : ''}`}
                    onClick={() => setDist2(d.km)}>{d.label}</button>
                ))}
                <div className={`${styles.distCustom} ${!DISTANCES.some(d => d.km === dist2) ? styles.distCustomActive : ''}`}>
                  <input
                    type="number"
                    inputMode="decimal"
                    className={styles.distCustomInput}
                    placeholder="직접"
                    min={0.1} max={500} step={0.1}
                    value={DISTANCES.some(d => d.km === dist2) ? '' : dist2}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      if (Number.isFinite(v) && v > 0) setDist2(v)
                    }}
                  />
                  <span className={styles.distCustomUnit}>km</span>
                </div>
              </div>
            </div>
          </div>

          {result2 ? (
            <>
              <div className={styles.heroCard}>
                <div className={styles.heroLabel}>{distLabel(dist2)} 완주 필요 페이스</div>
                <div className={styles.heroNum}>{result2.pace}<span className={styles.heroNumUnit}>/km</span></div>
              </div>
              <div className={styles.grid3}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>트레드밀 시속</div>
                  <div className={styles.infoVal}>{result2.kph}<span className={styles.infoUnit}>km/h</span></div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>400m 트랙</div>
                  <div className={styles.infoVal}>{result2.track400}<span className={styles.infoUnit}>1바퀴</span></div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>1마일 페이스</div>
                  <div className={styles.infoVal}>{secToPace(result2.paceSec * 1.609344)}<span className={styles.infoUnit}>/mi</span></div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.empty}>완주 시간과 거리를 선택하면 필요 페이스가 계산됩니다</div>
          )}
        </>
      )}

      {/* ── 모드 3: 트레드밀 변환 (서브탭) ── */}
      {mode === 'treadmill' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>🏃 트레드밀 페이스 ↔ 시속 변환</label>
            <div className={styles.treadmillGrid}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>시속 입력 → 페이스</p>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="number" inputMode="decimal"
                    placeholder="9.0" value={kphInput}
                    onChange={e => setKphInput(e.target.value)} step={0.1} />
                  <span className={styles.unit}>km/h</span>
                </div>
                {treadmillFromKph && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>페이스:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{treadmillFromKph.pace}/km</span>
                    <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 8 }}>400m:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{treadmillFromKph.track400}</span>
                  </div>
                )}
              </div>
              <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>페이스 입력 → 시속</p>
                <div className={styles.inputRow}>
                  <input className={styles.numInput} type="text" inputMode="numeric"
                    placeholder="6:40" value={paceInput}
                    onChange={e => setPaceInput(e.target.value)} />
                  <span className={styles.unit}>/km</span>
                </div>
                {treadmillFromPace && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>시속:</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{treadmillFromPace.kph} km/h</span>
                  </div>
                )}
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, lineHeight: 1.75 }}>
              💡 트레드밀은 시속(km/h)으로 표시됩니다. 야외 페이스와 동일하게 설정하려면 위에서 변환 후 트레드밀에 입력하세요.
            </p>
          </div>
        </>
      )}

      {/* 다른 러닝 도구 안내 (영역 침범 X) */}
      <div className={styles.crossToolCard}>
        <p className={styles.crossToolTitle}>🏃 다음 단계로</p>
        <div className={styles.crossToolGrid}>
          <a href="/tools/sports/interval-training" className={styles.crossToolBtn}>
            <span className={styles.crossToolIcon}>🏃‍♂️</span>
            <span>
              <strong>인터벌 훈련 계산기</strong>
              <span className={styles.crossToolSub}>VDOT·인터벌 페이스·훈련 스케줄</span>
            </span>
          </a>
          <a href="/tools/sports/race-predictor" className={styles.crossToolBtn}>
            <span className={styles.crossToolIcon}>🎯</span>
            <span>
              <strong>마라톤 기록 계산기</strong>
              <span className={styles.crossToolSub}>VDOT·Riegel 공식 기록 예측</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
