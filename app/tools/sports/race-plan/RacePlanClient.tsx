'use client'

import { useState } from 'react'
import s from './race-plan.module.css'
import {
  DIST_PRESETS, STRATEGY_LABEL, STRATEGY_DESC,
  buildSegments, fillStrategy, applyGrade, calcPlan, timeAtDistance, planWarnings,
  parsePace, parseClock, fmtPace, fmtHMS, fmtClock,
  type DistKey, type Strategy, type Segment,
} from './racePlanUtils'

const MAX_KM = 100   // 100K 울트라까지 지원 (긴 거리는 구간 리스트 접기로 처리)

function resize<T>(arr: T[], n: number, fill: T): T[] {
  const out = arr.slice(0, n)
  while (out.length < n) out.push(fill)
  return out
}
/** 고도 입력 문자열 → 숫자(m). 빈 값·"-"는 0 */
function parseAlt(v: string): number {
  const c = (v || '').replace(/[^0-9-]/g, '')
  if (c === '' || c === '-') return 0
  const num = parseInt(c, 10)
  return isFinite(num) ? num : 0
}
function gradesFrom(segments: Segment[], alts: number[], startElev: number): number[] {
  return segments.map((seg, i) => {
    const prev = i === 0 ? startElev : (alts[i - 1] ?? 0)
    const d = (alts[i] ?? 0) - prev
    return seg.dist > 0 ? (d / (seg.dist * 1000)) * 100 : 0
  })
}

export default function RacePlanClient() {
  const [distKm, setDistKm] = useState(10)
  const [distKey, setDistKey] = useState<DistKey>('10K')
  const [customKm, setCustomKm] = useState('10')
  const [basePace, setBasePace] = useState('6:00')
  const [strategy, setStrategy] = useState<Strategy>('even')
  const [startClock, setStartClock] = useState('')
  const [elevOn, setElevOn] = useState(false)
  const [gradeAdjust, setGradeAdjust] = useState(false)
  const [startElevStr, setStartElevStr] = useState('')
  // 편집 필드는 원시 문자열로 보관 — 타이핑 중 재포맷/0 고정을 막고 계산할 때만 파싱
  const [paceStrs, setPaceStrs] = useState<string[]>(() => fillStrategy(parsePace('6:00'), 10, 'even').map(fmtPace))
  const [altStrs, setAltStrs] = useState<string[]>(() => Array(10).fill(''))
  const [copied, setCopied] = useState(false)
  const [expandSegs, setExpandSegs] = useState(false)  // 긴 거리 구간 리스트 접기/펼치기

  const segments = buildSegments(distKm)
  const n = segments.length
  const longList = n > 15   // 하프·풀·울트라 — 구간 리스트 접기 대상
  // 길이 안전 보정 (거리 변경 직후 렌더 안정성)
  const paceStrsView = paceStrs.length === n ? paceStrs : resize(paceStrs, n, '')
  const altStrsView = altStrs.length === n ? altStrs : resize(altStrs, n, '')
  // 계산용 숫자 (문자열 → 파싱)
  const paces = paceStrsView.map(parsePace)
  const alts = altStrsView.map(parseAlt)
  const startElev = parseAlt(startElevStr)
  const grades = gradesFrom(segments, alts, startElev)

  const startClockMin = parseClock(startClock)
  const result = calcPlan(segments, paces, alts, startElev, startClockMin)
  const warnings = planWarnings(result)
  const hasValid = paces.some(p => p > 0)

  // 통과 요약(5K·10K·하프 — 거리 내에서만)
  const splitPoints = [
    { km: 5, label: '5K' },
    { km: 10, label: '10K' },
    { km: 21.0975, label: '하프' },
  ].filter(sp => sp.km < distKm - 1e-6)
  const splits = splitPoints.map(sp => {
    const t = timeAtDistance(result.rows, sp.km)
    return { ...sp, t, clock: t != null && startClockMin != null ? startClockMin + t / 60 : null }
  })

  // ── 핸들러 ──
  // 전략(+선택적 고도보정)으로 구간 페이스 문자열을 다시 채움
  const reapply = (strat: Strategy, altArr: string[], seStr: string, grade: boolean) => {
    let flat = fillStrategy(parsePace(basePace), segments.length, strat)
    if (grade && elevOn) flat = applyGrade(flat, gradesFrom(segments, altArr.map(parseAlt), parseAlt(seStr)))
    setPaceStrs(flat.map(fmtPace))
  }

  const changeDistance = (km: number, key: DistKey) => {
    const clamped = Math.max(0.1, Math.min(MAX_KM, km))
    const segs = buildSegments(clamped)
    const m = segs.length
    setDistKm(clamped); setDistKey(key)
    const nextAlts = resize(altStrs, m, '')
    setAltStrs(nextAlts)
    if (strategy !== 'custom') {
      let flat = fillStrategy(parsePace(basePace), m, strategy)
      if (gradeAdjust && elevOn) flat = applyGrade(flat, gradesFrom(segs, nextAlts.map(parseAlt), startElev))
      setPaceStrs(flat.map(fmtPace))
    } else {
      // custom 상태에서 거리 연장 시 새 구간을 빈칸(0초→완주시간 과소계산) 대신 기준 페이스로 채움
      const bp = parsePace(basePace)
      const fillStr = bp > 0 ? fmtPace(bp) : ''
      setPaceStrs(prev => resize(prev, m, fillStr))
    }
  }

  const applyStrategy = (strat: Strategy) => {
    setStrategy(strat)
    reapply(strat, altStrsView, startElevStr, gradeAdjust)
  }

  const toggleGrade = (on: boolean) => {
    setGradeAdjust(on)
    if (strategy !== 'custom') reapply(strategy, altStrsView, startElevStr, on)
  }

  const editPace = (i: number, v: string) => {
    setPaceStrs(prev => { const c = [...prev]; c[i] = v; return c })
    setStrategy('custom')
  }
  const editAlt = (i: number, v: string) => {
    const cleaned = v.replace(/[^0-9-]/g, '')
    const next = [...altStrsView]; next[i] = cleaned
    setAltStrs(next)
    // 자동 보정 + 전략 적용 상태면 고도 변경을 페이스에 즉시 반영
    if (gradeAdjust && elevOn && strategy !== 'custom') reapply(strategy, next, startElevStr, true)
  }

  const reset = () => {
    setDistKm(10); setDistKey('10K'); setCustomKm('10')
    setBasePace('6:00'); setStrategy('even'); setStartClock('')
    setElevOn(false); setGradeAdjust(false); setStartElevStr('')
    setPaceStrs(fillStrategy(parsePace('6:00'), 10, 'even').map(fmtPace))
    setAltStrs(Array(10).fill(''))
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!hasValid) return
    const lines = [`🏁 레이스 페이스 플랜 — ${distKm.toLocaleString()}km`]
    lines.push(`예상 완주 ${fmtHMS(result.finishSec)} · 평균 ${fmtPace(result.avgPaceSec)}/km`)
    if (result.hasElev) lines.push(`상승 ${result.ascent.toFixed(0)}m · 하강 ${result.descent.toFixed(0)}m`)
    splits.forEach(sp => { if (sp.t != null) lines.push(`${sp.label} 통과 ${fmtHMS(sp.t)}${sp.clock != null ? ` (${fmtClock(sp.clock)})` : ''}`) })
    lines.push('youtil.kr/tools/sports/race-plan')
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    } catch { /* noop */ }
  }

  return (
    <div className={s.wrap}>
      {/* ── 히어로 결과 ── */}
      {hasValid ? (
        <div className={s.hero} role="status" aria-live="polite">
          <div className={s.heroMain}>
            <span className={s.heroLabel}>예상 완주 시간</span>
            <span className={s.heroTime}>{fmtHMS(result.finishSec)}</span>
          </div>
          <div className={s.heroSub}>
            <span>평균 <strong>{fmtPace(result.avgPaceSec)}</strong>/km</span>
            <span>{distKm.toLocaleString()}km</span>
            {result.hasElev && <span>↑{result.ascent.toFixed(0)}m ↓{result.descent.toFixed(0)}m</span>}
          </div>
        </div>
      ) : (
        <div className={s.empty}>구간 페이스를 입력하면 예상 완주 시간이 즉시 계산됩니다.</div>
      )}

      {/* ── 거리 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>거리</span>
        <div className={s.distRow} role="group" aria-label="거리 선택">
          {DIST_PRESETS.map(d => (
            <button key={d.key} type="button" aria-pressed={distKey === d.key}
              className={`${s.distBtn} ${distKey === d.key ? s.distActive : ''}`}
              onClick={() => { changeDistance(d.km, d.key); if (d.key === 'full') setCustomKm('42.195'); else setCustomKm(String(d.km)) }}>
              {d.label}
            </button>
          ))}
          <div className={s.customWrap}>
            <input className={s.customInput} type="text" inputMode="decimal"
              aria-label="직접 거리 (km)"
              value={customKm}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                const km = parseFloat(v)
                // 표시값과 계산 기준 일치 — 상한(50km) 초과 시 입력칸도 상한값으로 고정
                if (isFinite(km) && km > MAX_KM) {
                  setCustomKm(String(MAX_KM)); changeDistance(MAX_KM, 'custom')
                } else {
                  setCustomKm(v)
                  if (isFinite(km) && km > 0) changeDistance(km, 'custom')
                }
              }} />
            <span className={s.customUnit}>km</span>
          </div>
        </div>
      </div>

      {/* ── 기준 페이스 + 출발 시각 ── */}
      <div className={s.card}>
        <div className={s.twoCol}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="rp-base">기준 페이스 (분:초/km)</label>
            <input id="rp-base" className={s.input} type="text" inputMode="text"
              placeholder="6:00" value={basePace}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9:.]/g, '')
                setBasePace(v)
                if (strategy !== 'custom') {
                  let flat = fillStrategy(parsePace(v), segments.length, strategy)
                  if (gradeAdjust && elevOn) flat = applyGrade(flat, grades)
                  setPaceStrs(flat.map(fmtPace))
                }
              }} />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="rp-clock">출발 시각 (선택)</label>
            <input id="rp-clock" className={s.input} type="text" inputMode="numeric"
              placeholder="예: 08:00" value={startClock}
              aria-invalid={startClock.trim() !== '' && startClockMin == null}
              onChange={e => setStartClock(e.target.value.replace(/[^0-9:]/g, ''))} />
            {startClock.trim() !== '' && startClockMin == null && (
              <p className={s.fieldError} role="status">시:분 형식(0~23시)으로 입력하세요. 예: 08:00</p>
            )}
          </div>
        </div>
        <p className={s.hint}>기준 페이스를 정하고 아래 전략을 누르면 구간이 자동 채워집니다. 출발 시각을 넣으면 지점별 통과 예상 시각이 표시됩니다.</p>
      </div>

      {/* ── 전략 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>페이스 분배 전략</span>
        <div className={s.stratRow} role="group" aria-label="페이스 분배 전략">
          {(['even', 'negative', 'positive'] as Strategy[]).map(st => (
            <button key={st} type="button" aria-pressed={strategy === st}
              className={`${s.stratBtn} ${strategy === st ? s.stratActive : ''}`}
              onClick={() => applyStrategy(st)}>
              {STRATEGY_LABEL[st]}
            </button>
          ))}
        </div>
        <p className={s.hint}>{STRATEGY_DESC[strategy]}</p>
      </div>

      {/* ── 고도 ── */}
      <div className={s.card}>
        <label className={s.toggleRow}>
          <input type="checkbox" className={s.check} checked={elevOn}
            onChange={e => setElevOn(e.target.checked)} />
          <span className={s.toggleLabel}>코스 고도 입력 (언덕 반영)</span>
        </label>
        {elevOn && (
          <div className={s.elevBody}>
            <div className={s.twoCol}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="rp-startelev">출발 지점 고도 (m)</label>
                <input id="rp-startelev" className={s.input} type="text" inputMode="numeric"
                  placeholder="0" value={startElevStr}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/[^0-9-]/g, '')
                    setStartElevStr(cleaned)
                    if (gradeAdjust && elevOn && strategy !== 'custom') reapply(strategy, altStrsView, cleaned, true)
                  }} />
              </div>
              <label className={`${s.toggleRow} ${s.gradeToggle}`}>
                <input type="checkbox" className={s.check} checked={gradeAdjust}
                  onChange={e => toggleGrade(e.target.checked)} />
                <span className={s.toggleLabel}>고도로 페이스 자동 보정</span>
              </label>
            </div>
            <p className={s.hint}>
              각 구간 끝 지점의 고도(m)를 입력하세요. <strong>자동 보정</strong>을 켜고 전략 버튼을 누르면 오르막은 느리게·내리막은 빠르게 추정 페이스가 채워집니다(추정치, 직접 조정 가능).
            </p>
          </div>
        )}
      </div>

      {/* ── 구간 편집 ── */}
      <div className={s.card}>
        <div className={s.segHead}>
          <span className={s.cardLabel}>구간별 페이스 {elevOn && '· 고도'}</span>
          {strategy === 'custom' && <span className={s.customTag}>직접 조정됨</span>}
          {longList && (
            <button type="button" className={s.segToggle} aria-expanded={expandSegs}
              onClick={() => setExpandSegs(v => !v)}>
              {expandSegs ? '접기 ▴' : `전체 ${n}개 편집 ▾`}
            </button>
          )}
        </div>
        {longList && !expandSegs ? (
          <p className={s.segCollapsed}>
            {n}개 구간이 <strong>{STRATEGY_LABEL[strategy]}</strong> 전략으로 자동 채워졌습니다. 구간별 통과 시각은 아래 <strong>주요 지점 통과</strong>에서 확인하세요. 직접 조정하려면 <strong>전체 {n}개 편집</strong>을 누르세요.
          </p>
        ) : (
        <div className={s.segList}>
          {result.rows.map((r, i) => (
            <div key={i} className={`${s.segRow} ${elevOn ? s.segRowElev : ''}`}>
              <span className={s.segKm}>{r.seg.to}<span className={s.segKmUnit}>km</span></span>
              <div className={s.segInputWrap}>
                <input className={s.segInput} type="text" inputMode="text"
                  aria-label={`${r.seg.to}km 구간 페이스 (분:초/km)`}
                  value={paceStrsView[i] ?? ''}
                  placeholder="0:00"
                  onChange={e => editPace(i, e.target.value.replace(/[^0-9:.]/g, ''))} />
                <span className={s.segInputUnit}>/km</span>
              </div>
              {elevOn && (
                <div className={s.segInputWrap}>
                  <input className={s.segInput} type="text" inputMode="numeric"
                    aria-label={`${r.seg.to}km 지점 고도 (m)`}
                    value={altStrsView[i] ?? ''}
                    placeholder="0"
                    onChange={e => editAlt(i, e.target.value)} />
                  <span className={s.segInputUnit}>m</span>
                </div>
              )}
              <div className={s.segReadout}>
                <span className={s.segCum}>{fmtHMS(r.cumTimeSec)}</span>
                {elevOn && Math.abs(r.gradePct) >= 0.05 && (
                  <span className={`${s.segGrade} ${r.gradePct > 0 ? s.gradeUp : s.gradeDown}`}>
                    {r.gradePct > 0 ? '▲' : '▼'}{Math.abs(r.gradePct).toFixed(1)}%
                  </span>
                )}
                {r.passMin != null && <span className={s.segClock}>{fmtClock(r.passMin)}</span>}
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* ── 결과: 통과 요약 + 프로파일 ── */}
      {hasValid && (
        <>
          {splits.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>주요 지점 통과</span>
              <div className={s.splitGrid}>
                {splits.map(sp => (
                  <div key={sp.label} className={s.splitBox}>
                    <div className={s.splitLabel}>{sp.label}</div>
                    <div className={s.splitTime}>{sp.t != null ? fmtHMS(sp.t) : '--'}</div>
                    {sp.clock != null && <div className={s.splitClock}>{fmtClock(sp.clock)}</div>}
                  </div>
                ))}
                <div className={`${s.splitBox} ${s.splitFinish}`}>
                  <div className={s.splitLabel}>완주</div>
                  <div className={s.splitTime}>{fmtHMS(result.finishSec)}</div>
                  {startClockMin != null && <div className={s.splitClock}>{fmtClock(startClockMin + result.finishSec / 60)}</div>}
                </div>
              </div>
            </div>
          )}

          {result.hasElev && (
            <div className={s.card}>
              <div className={s.profHead}>
                <span className={s.cardLabel}>고도 프로파일</span>
                <span className={s.profStat}>↑ 상승 {result.ascent.toFixed(0)}m · ↓ 하강 {result.descent.toFixed(0)}m</span>
              </div>
              <ElevationProfile rows={result.rows} startElev={startElev} totalKm={result.totalKm}
                ascent={result.ascent} descent={result.descent} />
            </div>
          )}

          {warnings.length > 0 && (
            <div className={s.warnBox}>
              {warnings.map((w, i) => <p key={i} className={s.warnItem}><span aria-hidden="true">⚠️ </span>{w}</p>)}
            </div>
          )}

          <div className={s.actionRow}>
            <button type="button" className={`${s.shareBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
              {copied ? '복사됨!' : '플랜 복사'}
            </button>
            <button type="button" className={s.resetBtn} onClick={reset}>초기화</button>
          </div>
        </>
      )}
    </div>
  )
}

/* ── 고도 프로파일 SVG ── */
function ElevationProfile({
  rows, startElev, totalKm, ascent, descent,
}: {
  rows: { seg: Segment; alt: number }[]
  startElev: number
  totalKm: number
  ascent: number
  descent: number
}) {
  const W = 600, H = 130, padB = 4
  const pts: { x: number; y: number }[] = [{ x: 0, y: startElev }]
  for (const r of rows) pts.push({ x: r.seg.to, y: r.alt })
  const ys = pts.map(p => p.y)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const range = maxY - minY || 1
  const toX = (km: number) => (km / (totalKm || 1)) * W
  const toY = (alt: number) => (H - padB) - ((alt - minY) / range) * (H - padB - 8)
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.x).toFixed(1)},${toY(p.y).toFixed(1)}`).join(' ')
  const area = `${line} L${toX(pts[pts.length - 1].x).toFixed(1)},${H} L0,${H} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.profSvg} preserveAspectRatio="none"
      role="img" aria-label={`고도 프로파일 — 출발 ${startElev}m, 최저 ${minY.toFixed(0)}m, 최고 ${maxY.toFixed(0)}m, 총 상승 ${ascent.toFixed(0)}m, 총 하강 ${descent.toFixed(0)}m`}>
      <path d={area} fill="rgba(14,165,233,0.15)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
