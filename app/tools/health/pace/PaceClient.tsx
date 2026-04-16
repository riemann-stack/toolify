'use client'

import { useState, useMemo } from 'react'
import styles from './pace.module.css'

type Mode = 'pace-to-time' | 'time-to-pace'

// 페이스 문자열(mm:ss) → 초
function paceToSec(mm: string, ss: string) {
  return parseInt(mm || '0') * 60 + parseInt(ss || '0')
}

// 초 → mm:ss
function secToPace(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// 시간(hh:mm:ss) → 초
function timeToSec(hh: string, mm: string, ss: string) {
  return parseInt(hh || '0') * 3600 + parseInt(mm || '0') * 60 + parseInt(ss || '0')
}

// 초 → hh:mm:ss
function secToTime(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  return h > 0
    ? `${h}시간 ${m}분 ${String(s).padStart(2, '0')}초`
    : `${m}분 ${String(s).padStart(2, '0')}초`
}

// 페이스(초/km) → km/h
function paceSecToKph(paceSec: number) {
  return 3600 / paceSec
}

// km/h → 페이스(초/km)
function kphToPaceSec(kph: number) {
  return 3600 / kph
}

const DISTANCES = [
  { label: '5km',       km: 5 },
  { label: '10km',      km: 10 },
  { label: '하프마라톤', km: 21.0975 },
  { label: '마라톤',    km: 42.195 },
]

const SPLIT_DISTANCES = [1, 5, 10, 21.0975, 42.195]
const SPLIT_LABELS     = ['1km', '5km', '10km', '하프', '풀']

export default function PaceClient() {
  const [mode, setMode] = useState<Mode>('pace-to-time')

  // 페이스 → 완주 시간
  const [paceMin, setPaceMin] = useState('')
  const [paceSec, setPaceSec] = useState('')
  const [dist,    setDist]    = useState(42.195)

  // 완주 시간 → 페이스
  const [tHour, setTHour] = useState('')
  const [tMin,  setTMin]  = useState('')
  const [tSec,  setTSec]  = useState('')
  const [dist2, setDist2] = useState(42.195)

  // 런닝머신 시속 변환
  const [kphInput,  setKphInput]  = useState('')
  const [paceInput, setPaceInput] = useState('') // mm:ss 형식

  const result1 = useMemo(() => {
    const ps = paceToSec(paceMin, paceSec)
    if (!ps || ps <= 0) return null
    const totalSec = ps * dist
    const kph = paceSecToKph(ps)
    const track400 = ps * 0.4  // 400m = 0.4km
    return { time: secToTime(totalSec), paceStr: secToPace(ps), kph: kph.toFixed(1), track400: secToPace(track400) }
  }, [paceMin, paceSec, dist])

  const result2 = useMemo(() => {
    const ts = timeToSec(tHour, tMin, tSec)
    if (!ts || ts <= 0 || !dist2) return null
    const ps = ts / dist2
    const kph = paceSecToKph(ps)
    const track400 = ps * 0.4
    return { pace: secToPace(ps), kph: kph.toFixed(1), track400: secToPace(track400) }
  }, [tHour, tMin, tSec, dist2])

  // 런닝머신: km/h → 페이스
  const treadmillFromKph = useMemo(() => {
    const k = parseFloat(kphInput)
    if (!k || k <= 0) return null
    const ps = kphToPaceSec(k)
    return { pace: secToPace(ps), track400: secToPace(ps * 0.4) }
  }, [kphInput])

  // 런닝머신: 페이스 → km/h
  const treadmillFromPace = useMemo(() => {
    const parts = paceInput.split(':')
    if (parts.length !== 2) return null
    const ps = paceToSec(parts[0], parts[1])
    if (!ps || ps <= 0) return null
    return { kph: paceSecToKph(ps).toFixed(1) }
  }, [paceInput])

  // 구간별 스플릿 (result1 기준)
  const splits = useMemo(() => {
    const ps = paceToSec(paceMin, paceSec)
    if (!ps || ps <= 0) return null
    return SPLIT_DISTANCES.map((d, i) => ({
      label: SPLIT_LABELS[i],
      time: secToTime(ps * d),
      applicable: d <= dist,
    }))
  }, [paceMin, paceSec, dist])

  return (
    <div className={styles.wrap}>

      {/* 모드 탭 */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${mode === 'pace-to-time' ? styles.tabActive : ''}`}
          onClick={() => setMode('pace-to-time')}>페이스 → 완주 시간</button>
        <button className={`${styles.tab} ${mode === 'time-to-pace' ? styles.tabActive : ''}`}
          onClick={() => setMode('time-to-pace')}>완주 시간 → 페이스</button>
      </div>

      {/* ── 모드 1: 페이스 → 완주 시간 ── */}
      {mode === 'pace-to-time' && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>목표 페이스 (분:초 / km)</label>
            <div className={styles.paceRow}>
              <input className={styles.paceInput} type="number" inputMode="numeric"
                placeholder="5" value={paceMin} onChange={e => setPaceMin(e.target.value)} min={1} max={30} />
              <span className={styles.paceSep}>:</span>
              <input className={styles.paceInput} type="number" inputMode="numeric"
                placeholder="30" value={paceSec} onChange={e => setPaceSec(e.target.value)} min={0} max={59} />
              <span className={styles.paceUnit}>/km</span>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>거리 선택</label>
            <div className={styles.distRow}>
              {DISTANCES.map(d => (
                <button key={d.km}
                  className={`${styles.distBtn} ${dist === d.km ? styles.distBtnActive : ''}`}
                  onClick={() => setDist(d.km)}>{d.label}</button>
              ))}
            </div>
          </div>

          {result1 && (
            <>
              <div className={styles.heroCard}>
                <div className={styles.heroLabel}>예상 완주 시간</div>
                <div className={styles.heroNum}>{result1.time}</div>
              </div>

              {/* 페이스 정보 3종 */}
              <div className={styles.grid3}>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>페이스</div>
                  <div className={styles.infoVal}>{result1.paceStr}<span className={styles.infoUnit}>/km</span></div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>트레드밀 시속</div>
                  <div className={styles.infoVal}>{result1.kph}<span className={styles.infoUnit}>km/h</span></div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoLabel}>400m 트랙 1바퀴</div>
                  <div className={styles.infoVal}>{result1.track400}<span className={styles.infoUnit}></span></div>
                </div>
              </div>

              {/* 구간별 스플릿 */}
              {splits && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>구간별 스플릿 예상 시간</label>
                  <div className={styles.splitGrid}>
                    {splits.map(s => (
                      <div key={s.label}
                        className={`${styles.splitItem} ${!s.applicable ? styles.splitNA : ''}`}>
                        <div className={styles.splitLabel}>{s.label}</div>
                        <div className={styles.splitTime}>{s.applicable ? s.time : '−'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <label className={styles.cardLabel}>목표 완주 시간</label>
            <div className={styles.timeRow}>
              <div className={styles.timeField}>
                <input className={styles.timeInput} type="number" inputMode="numeric"
                  placeholder="0" value={tHour} onChange={e => setTHour(e.target.value)} min={0} max={9} />
                <span className={styles.timeLabel}>시간</span>
              </div>
              <div className={styles.timeField}>
                <input className={styles.timeInput} type="number" inputMode="numeric"
                  placeholder="3" value={tMin} onChange={e => setTMin(e.target.value)} min={0} max={59} />
                <span className={styles.timeLabel}>분</span>
              </div>
              <div className={styles.timeField}>
                <input className={styles.timeInput} type="number" inputMode="numeric"
                  placeholder="30" value={tSec} onChange={e => setTSec(e.target.value)} min={0} max={59} />
                <span className={styles.timeLabel}>초</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>거리 선택</label>
            <div className={styles.distRow}>
              {DISTANCES.map(d => (
                <button key={d.km}
                  className={`${styles.distBtn} ${dist2 === d.km ? styles.distBtnActive : ''}`}
                  onClick={() => setDist2(d.km)}>{d.label}</button>
              ))}
            </div>
          </div>

          {result2 ? (
            <div className={styles.grid3}>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>필요 페이스</div>
                <div className={styles.infoVal}>{result2.pace}<span className={styles.infoUnit}>/km</span></div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>트레드밀 시속</div>
                <div className={styles.infoVal}>{result2.kph}<span className={styles.infoUnit}>km/h</span></div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>400m 트랙 1바퀴</div>
                <div className={styles.infoVal}>{result2.track400}</div>
              </div>
            </div>
          ) : (
            <div className={styles.empty}>완주 시간과 거리를 선택하면 필요 페이스가 계산됩니다</div>
          )}
        </>
      )}

      {/* ── 런닝머신 변환기 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>🏃 런닝머신(트레드밀) 페이스 변환기</label>
        <div className={styles.treadmillGrid}>
          {/* km/h → 페이스 */}
          <div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>시속 입력 → 페이스</p>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder="9.0" value={kphInput} onChange={e => setKphInput(e.target.value)}
                step={0.1} />
              <span className={styles.unit}>km/h</span>
            </div>
            {treadmillFromKph && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>페이스:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>{treadmillFromKph.pace}/km</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: '8px' }}>400m:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>{treadmillFromKph.track400}</span>
              </div>
            )}
          </div>
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
          {/* 페이스 → km/h */}
          <div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>페이스 입력 → 시속</p>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="text" inputMode="numeric"
                placeholder="6:40" value={paceInput} onChange={e => setPaceInput(e.target.value)} />
              <span className={styles.unit}>/km</span>
            </div>
            {treadmillFromPace && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>시속:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>{treadmillFromPace.kph} km/h</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}