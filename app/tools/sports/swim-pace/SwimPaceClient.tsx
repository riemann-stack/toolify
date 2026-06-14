'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import styles from './swim-pace.module.css'

// ── 헬퍼 (페이스 단위 = 100m당 초) ──
function toInt(v: string) {
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : 0
}
function paceToSec100(mm: string, ss: string) {
  return Math.max(0, toInt(mm)) * 60 + Math.max(0, toInt(ss))
}
function timeToSec(hh: string, mm: string, ss: string) {
  return Math.max(0, toInt(hh)) * 3600 + Math.max(0, toInt(mm)) * 60 + Math.max(0, toInt(ss))
}
function secToMmss(sec: number) {
  const s = Math.round(sec)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
function secToHms(sec: number) {
  const s = Math.round(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
    : `${m}:${String(r).padStart(2, '0')}`
}
function secToTimeKo(sec: number) {
  const s = Math.round(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return h > 0
    ? `${h}시간 ${m}분 ${String(r).padStart(2, '0')}초`
    : `${m}분 ${String(r).padStart(2, '0')}초`
}
function fmtComma(n: number) {
  return n.toLocaleString('ko-KR')
}
function parseAmount(v: string) {
  const n = parseInt(v.replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

// 거리별 예상기록 표
const TABLE_DISTANCES = [50, 100, 200, 400, 800, 1500] as const

// 영법별 참고 계수 (자유형 속도 = 1 기준 · verified=false · 개인차 큼)
const STROKES = [
  { key: 'free', name: '자유형', coef: 1.0 },
  { key: 'back', name: '배영', coef: 0.9 },
  { key: 'breast', name: '평영', coef: 0.78 },
  { key: 'fly', name: '접영', coef: 0.92 },
] as const

// 빠른 페이스 칩 (100m 기준)
const QUICK_PACES = [
  { mm: 1, ss: 30 },
  { mm: 1, ss: 45 },
  { mm: 2, ss: 0 },
  { mm: 2, ss: 15 },
  { mm: 2, ss: 30 },
]

type HeroMode = 'pace' | 'time'

export default function SwimPaceClient() {
  // 풀 길이 (단수 25 / 장수 50)
  const [poolLen, setPoolLen] = useState<25 | 50>(25)
  // 총거리(m)
  const [distStr, setDistStr] = useState('1500')
  // 100m 페이스 (분·초)
  const [paceMin, setPaceMin] = useState('1')
  const [paceSec, setPaceSec] = useState('45')
  // 총기록 (시·분·초) — 페이스와 양방향 동기 (마지막 편집된 쪽이 소스)
  const [tHour, setTHour] = useState('')
  const [tMin, setTMin] = useState('')
  const [tSec, setTSec] = useState('')
  // 히어로 모드
  const [heroMode, setHeroMode] = useState<HeroMode>('pace')
  // 영법 토글 (예상기록 표)
  const [stroke, setStroke] = useState<typeof STROKES[number]['key']>('free')

  // SWOLF
  const [lapTimeStr, setLapTimeStr] = useState('20')
  const [strokeCount, setStrokeCount] = useState('18')

  // send-off
  const [soMin, setSoMin] = useState('1')
  const [soSec, setSoSec] = useState('40')
  const [restStr, setRestStr] = useState('20')

  const [copied, setCopied] = useState(false)

  const distM = parseAmount(distStr)
  const laps = poolLen > 0 ? Math.round(distM / poolLen) : 0
  const pace100 = paceToSec100(paceMin, paceSec)

  // 거리 ↔ 왕복수 동기
  const setLaps = (n: number) => {
    if (!Number.isFinite(n) || n < 0) return
    setDistStr(String(poolLen * Math.round(n)))
  }

  // 페이스 → 총기록 (입력 페이스 기준)
  const totalFromPace = useMemo(() => {
    if (pace100 <= 0 || distM <= 0) return null
    return pace100 * (distM / 100)
  }, [pace100, distM])

  // 총기록 → 페이스 (총기록 칸을 직접 채웠을 때 역산)
  const paceFromTime = useMemo(() => {
    const ts = timeToSec(tHour, tMin, tSec)
    if (ts <= 0 || distM <= 0) return null
    return ts / (distM / 100)
  }, [tHour, tMin, tSec, distM])

  // 평균 속도 (입력 페이스 기준)
  const speed = useMemo(() => {
    if (pace100 <= 0) return null
    const mPerS = 100 / pace100
    return { mPerS, kmh: mPerS * 3.6 }
  }, [pace100])

  // 거리별 예상기록 (현재 페이스 유지 + 영법 계수)
  const strokeCoef = STROKES.find(s => s.key === stroke)!.coef
  const tableRows = useMemo(() => {
    if (pace100 <= 0) return []
    return TABLE_DISTANCES.map(d => {
      const free = pace100 * (d / 100)
      const adj = free / strokeCoef
      return { d, time: secToMmss(adj), pace100m: secToMmss((adj / d) * 100) }
    })
  }, [pace100, strokeCoef])

  // SWOLF
  const swolf = useMemo(() => {
    const t = parseAmount(lapTimeStr)
    const s = parseAmount(strokeCount)
    if (t <= 0 || s <= 0) return null
    return { score: t + s, t, s }
  }, [lapTimeStr, strokeCount])

  // send-off
  const sendoff = useMemo(() => {
    const target = paceToSec100(soMin, soSec)
    const rest = parseAmount(restStr)
    if (target <= 0) return null
    return { total: target + rest, target, rest }
  }, [soMin, soSec, restStr])

  // 페이스 칩
  const setQuick = (mm: number, ss: number) => {
    setPaceMin(String(mm))
    setPaceSec(String(ss))
  }
  const applyPaceFromTime = () => {
    if (paceFromTime == null) return
    const s = Math.round(paceFromTime)
    setPaceMin(String(Math.floor(s / 60)))
    setPaceSec(String(s % 60))
  }

  const handleCopy = async () => {
    if (pace100 <= 0) return
    const lines = [
      '🏊 수영 페이스·SWOLF 결과',
      `100m 페이스: ${secToMmss(pace100)} /100m`,
      distM > 0 && totalFromPace != null
        ? `${fmtComma(distM)}m (${poolLen}m풀 ${laps}바퀴) 총기록: ${secToTimeKo(totalFromPace)}`
        : '',
      speed ? `평균 속도: ${speed.kmh.toFixed(2)} km/h · ${speed.mPerS.toFixed(2)} m/s` : '',
      swolf ? `SWOLF(25m): ${swolf.score} (${swolf.t}초 + ${swolf.s}스트로크)` : '',
      sendoff ? `send-off: ${secToMmss(sendoff.total)} (구간 ${secToMmss(sendoff.target)} + 휴식 ${sendoff.rest}초)` : '',
      '',
      'youtil.kr/tools/sports/swim-pace',
    ].filter(Boolean)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const heroPaceStr = pace100 > 0 ? secToMmss(pace100) : '--'
  const heroTimeStr = totalFromPace != null ? secToHms(totalFromPace) : '--'

  return (
    <div className={styles.wrap}>
      <Disclaimer variant="default"
        related={[
          { href: '/tools/sports/pace', label: '러닝 페이스' },
          { href: '/tools/sports/interval-training', label: '인터벌 훈련' },
        ]}
      >
        통용 수영 지표를 단순 산술로 환산한 참고용입니다. 단수↔장수 시간차·SWOLF 등급·영법별 속도차는 개인차가 크며 실력 판정이 아닙니다.
      </Disclaimer>

      {/* ── 풀 길이 토글 ── */}
      <div className={styles.poolToggle}>
        <span className={styles.poolLabel}>풀 길이</span>
        <div className={styles.poolBtns}>
          <button type="button"
            className={`${styles.poolBtn} ${poolLen === 25 ? styles.poolBtnActive : ''}`}
            aria-pressed={poolLen === 25}
            onClick={() => setPoolLen(25)}>25m 단수(SC)</button>
          <button type="button"
            className={`${styles.poolBtn} ${poolLen === 50 ? styles.poolBtnActive : ''}`}
            aria-pressed={poolLen === 50}
            onClick={() => setPoolLen(50)}>50m 장수(LC)</button>
        </div>
      </div>

      {/* ── 거리 × 왕복수 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel} htmlFor="swim-dist">총 거리 · 왕복수</label>
        <div className={styles.distGrid}>
          <div className={styles.field}>
            <div className={styles.inputBox}>
              <input id="swim-dist" className={styles.amountInput}
                type="text" inputMode="numeric"
                value={distM > 0 ? fmtComma(distM) : ''}
                placeholder="1,500"
                onChange={e => setDistStr(e.target.value)} />
              <span className={styles.inputUnit}>m</span>
            </div>
            <span className={styles.fieldHint}>총 거리</span>
          </div>
          <span className={styles.eqSign}>=</span>
          <div className={styles.field}>
            <div className={styles.inputBox}>
              <input className={styles.amountInput}
                type="text" inputMode="numeric"
                value={laps > 0 ? String(laps) : ''}
                placeholder="60"
                onChange={e => setLaps(parseAmount(e.target.value))} />
              <span className={styles.inputUnit}>바퀴</span>
            </div>
            <span className={styles.fieldHint}>{poolLen}m × 왕복수</span>
          </div>
        </div>
        <div className={styles.quickDist}>
          {[
            { m: 50, label: '50m' },
            { m: 100, label: '100m' },
            { m: 400, label: '400m' },
            { m: 800, label: '800m' },
            { m: 1500, label: '1500m' },
          ].map(q => (
            <button key={q.m} type="button"
              className={`${styles.chip} ${distM === q.m ? styles.chipActive : ''}`}
              onClick={() => setDistStr(String(q.m))}>{q.label}</button>
          ))}
        </div>
      </div>

      {/* ── 100m 페이스 입력 + 칩 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>100m 페이스</label>
        <div className={styles.paceRow}>
          <input className={styles.paceInput} type="text" inputMode="numeric"
            aria-label="100m 페이스 분"
            value={paceMin} placeholder="1"
            onChange={e => setPaceMin(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} />
          <span className={styles.paceSep}>:</span>
          <input className={styles.paceInput} type="text" inputMode="numeric"
            aria-label="100m 페이스 초"
            value={paceSec} placeholder="45"
            onChange={e => setPaceSec(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} />
          <span className={styles.paceUnit}>/100m</span>
        </div>
        <div className={styles.quickRow}>
          <span className={styles.quickLabel}>빠른 입력</span>
          <div className={styles.chips}>
            {QUICK_PACES.map(q => {
              const active = toInt(paceMin) === q.mm && toInt(paceSec) === q.ss
              return (
                <button key={`${q.mm}-${q.ss}`} type="button"
                  className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                  onClick={() => setQuick(q.mm, q.ss)}>
                  {q.mm}:{String(q.ss).padStart(2, '0')}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── 히어로 ── */}
      <div className={styles.heroCard}>
        <div className={styles.heroSwitch} role="group" aria-label="히어로 표시 전환">
          <button type="button"
            className={`${styles.heroSwitchBtn} ${heroMode === 'pace' ? styles.heroSwitchActive : ''}`}
            aria-pressed={heroMode === 'pace'}
            onClick={() => setHeroMode('pace')}>100m 페이스</button>
          <button type="button"
            className={`${styles.heroSwitchBtn} ${heroMode === 'time' ? styles.heroSwitchActive : ''}`}
            aria-pressed={heroMode === 'time'}
            onClick={() => setHeroMode('time')}>총기록</button>
        </div>
        <div className={styles.hero} role="status" aria-live="polite">
          {heroMode === 'pace' ? (
            <span className={styles.heroNum}>
              {heroPaceStr}<span className={styles.heroUnit}>/100m</span>
            </span>
          ) : (
            <span className={styles.heroNum}>{heroTimeStr}</span>
          )}
        </div>
        <div className={styles.heroSub}>
          {heroMode === 'pace'
            ? distM > 0 && totalFromPace != null
              ? `${fmtComma(distM)}m 기준 총기록 ${secToTimeKo(totalFromPace)}`
              : '100m당 소요 시간'
            : `100m 페이스 ${heroPaceStr} 유지 가정`}
        </div>
      </div>

      {/* ── 총기록 → 페이스 역산 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>총기록으로 페이스 역산</label>
        <p className={styles.cardDesc}>실제 기록을 입력하면 {fmtComma(distM || 0)}m 기준 100m 페이스를 거꾸로 계산합니다.</p>
        <div className={styles.timeRow}>
          <div className={styles.timeField}>
            <input className={styles.timeInput} type="text" inputMode="numeric"
              aria-label="총기록 시"
              value={tHour} placeholder="0"
              onChange={e => setTHour(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} />
            <span className={styles.timeLabel}>시</span>
          </div>
          <div className={styles.timeField}>
            <input className={styles.timeInput} type="text" inputMode="numeric"
              aria-label="총기록 분"
              value={tMin} placeholder="22"
              onChange={e => setTMin(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} />
            <span className={styles.timeLabel}>분</span>
          </div>
          <div className={styles.timeField}>
            <input className={styles.timeInput} type="text" inputMode="numeric"
              aria-label="총기록 초"
              value={tSec} placeholder="30"
              onChange={e => setTSec(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} />
            <span className={styles.timeLabel}>초</span>
          </div>
        </div>
        {paceFromTime != null && (
          <div className={styles.revealRow}>
            <span className={styles.revealLabel}>역산 페이스</span>
            <span className={styles.revealVal}>{secToMmss(paceFromTime)}<span className={styles.revealUnit}>/100m</span></span>
            <button type="button" className={styles.applyBtn} onClick={applyPaceFromTime}>↑ 위 페이스로 적용</button>
          </div>
        )}
      </div>

      {/* ── 평균 속도 ── */}
      {speed && (
        <div className={styles.grid2}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>평균 속도</div>
            <div className={styles.infoVal}>{speed.kmh.toFixed(2)}<span className={styles.infoUnit}>km/h</span></div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>평균 속도</div>
            <div className={styles.infoVal}>{speed.mPerS.toFixed(2)}<span className={styles.infoUnit}>m/s</span></div>
          </div>
        </div>
      )}

      {/* ── 거리별 예상기록 표 ── */}
      {tableRows.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>거리별 예상기록 (현재 페이스 유지)</label>
          <div className={styles.strokeRow}>
            {STROKES.map(s => (
              <button key={s.key} type="button"
                className={`${styles.chip} ${stroke === s.key ? styles.chipActive : ''}`}
                onClick={() => setStroke(s.key)}>{s.name}</button>
            ))}
          </div>
          <div className={`${styles.tableScroll} tableScroll`}>
            <table className={styles.predTable}>
              <thead>
                <tr>
                  <th scope="col">거리</th>
                  <th scope="col" style={{ textAlign: 'right' }}>예상기록</th>
                  <th scope="col" style={{ textAlign: 'right' }}>100m 환산</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(r => (
                  <tr key={r.d}>
                    <td className={styles.tdLabel}>{r.d}m</td>
                    <td className={styles.tdVal}>{r.time}</td>
                    <td className={styles.tdSub}>{r.pace100m}/100m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.tableNote}>
            영법 계수(자유형=1 기준 배영 0.9·평영 0.78·접영 0.92)는 통용 추정 계수일 뿐 검증된 값이 아닙니다. 실제 차이는 영자 기량과 거리에 따라 크게 달라집니다.
          </p>
        </div>
      )}

      {/* ── SWOLF ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>SWOLF (25m 1바퀴)</label>
        <div className={styles.swolfRow}>
          <div className={styles.field}>
            <div className={styles.inputBox}>
              <input className={styles.amountInput} type="text" inputMode="numeric"
                aria-label="25m 소요 시간(초)"
                value={lapTimeStr} placeholder="20"
                onChange={e => setLapTimeStr(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} />
              <span className={styles.inputUnit}>초</span>
            </div>
            <span className={styles.fieldHint}>25m 소요</span>
          </div>
          <span className={styles.eqSign}>+</span>
          <div className={styles.field}>
            <div className={styles.inputBox}>
              <input className={styles.amountInput} type="text" inputMode="numeric"
                aria-label="스트로크 수"
                value={strokeCount} placeholder="18"
                onChange={e => setStrokeCount(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} />
              <span className={styles.inputUnit}>스트로크</span>
            </div>
            <span className={styles.fieldHint}>저은 횟수</span>
          </div>
        </div>
        {swolf && (
          <div className={styles.swolfResult}>
            <span className={styles.swolfScore}>{swolf.score}</span>
            <span className={styles.swolfDesc}>= {swolf.t}초 + {swolf.s}스트로크 · 낮을수록 효율적 (참고)</span>
          </div>
        )}
      </div>

      {/* ── 인터벌 send-off ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>인터벌 보내기시간 (send-off)</label>
        <p className={styles.cardDesc}>목표 구간기록 + 휴식 시간 = 다음 출발까지 간격.</p>
        <div className={styles.soRow}>
          <div className={styles.field}>
            <div className={styles.paceRowSm}>
              <input className={styles.paceInputSm} type="text" inputMode="numeric"
                aria-label="목표 구간기록 분"
                value={soMin} placeholder="1"
                onChange={e => setSoMin(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} />
              <span className={styles.paceSepSm}>:</span>
              <input className={styles.paceInputSm} type="text" inputMode="numeric"
                aria-label="목표 구간기록 초"
                value={soSec} placeholder="40"
                onChange={e => setSoSec(e.target.value.replace(/[^\d]/g, '').slice(0, 2))} />
            </div>
            <span className={styles.fieldHint}>목표 구간기록</span>
          </div>
          <span className={styles.eqSign}>+</span>
          <div className={styles.field}>
            <div className={styles.inputBox}>
              <input className={styles.amountInput} type="text" inputMode="numeric"
                aria-label="휴식 시간(초)"
                value={restStr} placeholder="20"
                onChange={e => setRestStr(e.target.value.replace(/[^\d]/g, '').slice(0, 3))} />
              <span className={styles.inputUnit}>초 휴식</span>
            </div>
            <span className={styles.fieldHint}>휴식</span>
          </div>
        </div>
        {sendoff && (
          <div className={styles.soResult}>
            <span className={styles.soLabel}>출발 간격</span>
            <span className={styles.soVal}>{secToMmss(sendoff.total)}</span>
            <span className={styles.soSub}>구간 {secToMmss(sendoff.target)} + 휴식 {sendoff.rest}초</span>
          </div>
        )}
      </div>

      {/* ── 복사 ── */}
      <button type="button"
        className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
        onClick={handleCopy}>
        {copied ? '✅ 복사됨!' : '📋 결과 복사'}
      </button>
    </div>
  )
}
