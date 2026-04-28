'use client'

import { useMemo, useState } from 'react'
import styles from './race-predictor.module.css'

// ── 기준 거리(km) ──────────────────────────
type DistKey = '5k' | '10k' | 'half' | 'full' | 'custom'
type TargetKey = '3k' | '5k' | '10k' | '15k' | 'half' | '30k' | 'full'

const DISTS: { key: DistKey; label: string; km: number }[] = [
  { key: '5k',   label: '5km',     km: 5 },
  { key: '10k',  label: '10km',    km: 10 },
  { key: 'half', label: '하프',    km: 21.0975 },
  { key: 'full', label: '풀',      km: 42.195 },
]

const TARGETS: { key: TargetKey; label: string; km: number }[] = [
  { key: '3k',   label: '3km',    km: 3 },
  { key: '5k',   label: '5km',    km: 5 },
  { key: '10k',  label: '10km',   km: 10 },
  { key: '15k',  label: '15km',   km: 15 },
  { key: 'half', label: '하프',   km: 21.0975 },
  { key: '30k',  label: '30km',   km: 30 },
  { key: 'full', label: '풀',     km: 42.195 },
]

// ── 시간 유틸 ─────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')
function fmtHMS(totalSec: number): string {
  if (!isFinite(totalSec) || totalSec <= 0) return '--:--:--'
  const s = Math.round(totalSec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}
function fmtMS(totalSec: number): string {
  if (!isFinite(totalSec) || totalSec <= 0) return '--:--'
  const s = Math.round(totalSec)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${pad(m)}:${pad(sec)}`
}
function fmtPace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '--:--'
  const s = Math.round(secPerKm)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${pad(sec)}`
}

// ── 거리·기록 기반 VDOT 계산 ───────────────
// Jack Daniels: vo2 = -4.60 + 0.182258*v + 0.000104*v²  (v: m/min)
// %VO2max(t) = 0.8 + 0.1894393*e^(-0.012778 t) + 0.2989558*e^(-0.1932605 t)   (t: minutes)
// VDOT = vo2 / %VO2max
function vo2FromV(v: number) {
  return -4.60 + 0.182258 * v + 0.000104 * v * v
}
function vFromVo2(vo2: number) {
  // quadratic a v² + b v + c = vo2  -> 0.000104 v² + 0.182258 v - (4.60 + vo2) = 0
  const a = 0.000104, b = 0.182258, c = -(4.60 + vo2)
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
}
function pctVO2max(tMin: number) {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin)
}
function vdotFromRace(distKm: number, timeSec: number) {
  const tMin = timeSec / 60
  const v = (distKm * 1000) / tMin
  const vo2 = vo2FromV(v)
  return vo2 / pctVO2max(tMin)
}
// 주어진 VDOT·거리에 대해 예상 시간(초) — bisection
function timeFromVdot(distKm: number, vdot: number) {
  let lo = 1, hi = 60 * 60 * 10 // 10시간 이내
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    const tMin = mid / 60
    const v = (distKm * 1000) / tMin
    const estVdot = vo2FromV(v) / pctVO2max(tMin)
    if (estVdot > vdot) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
// VDOT × 강도 → 페이스(sec/km)
function paceFromVdot(vdot: number, intensity: number): number {
  const vo2 = vdot * intensity
  const v = vFromVo2(vo2)  // m/min
  return 60000 / v         // sec/km
}

// ── Riegel / Cameron ──────────────────────
function riegelTime(d1: number, t1: number, d2: number) {
  return t1 * Math.pow(d2 / d1, 1.06)
}
function cameronA(dMi: number) {
  return 13.49681 - 0.048865 * dMi + 2.438936 / Math.pow(dMi, 0.7905)
}
function cameronTime(d1km: number, t1: number, d2km: number) {
  // Cameron은 페이스 비(比)에 대한 공식: (t2/d2) = (t1/d1) × a(d1)/a(d2)
  const d1mi = d1km / 1.609344
  const d2mi = d2km / 1.609344
  return t1 * (d2km / d1km) * (cameronA(d1mi) / cameronA(d2mi))
}

// ── 훈련 페이스 강도 ───────────────────────
const PACE_ZONES = [
  { key: 'E', name: 'Easy',       desc: '회복·지구력 빌드업 (60~79% HRmax)',  intensity: 0.59, color: '#3EC8FF' },
  { key: 'M', name: 'Marathon',   desc: '마라톤 레이스 페이스 (80~85% HRmax)', intensity: 0.70, color: '#C8FF3E' },
  { key: 'T', name: 'Threshold',  desc: '젖산역치·템포 (86~90% HRmax)',        intensity: 0.78, color: '#FFD700' },
  { key: 'I', name: 'Interval',   desc: 'VO2max 인터벌 (95~100% HRmax)',       intensity: 0.85, color: '#FF8C3E' },
  { key: 'R', name: 'Repetition', desc: '속도·효율 리피티션 (단거리)',          intensity: 0.93, color: '#FF6B6B' },
]

// ── 서브 목표 ─────────────────────────────
const SUB_GOALS = [
  { label: '서브5',    sec: 5 * 3600 },
  { label: '서브4:30', sec: 4.5 * 3600 },
  { label: '서브4',    sec: 4 * 3600 },
  { label: '서브3:30', sec: 3.5 * 3600 },
  { label: '서브3',    sec: 3 * 3600 },
]

// ── 시간 드롭다운 ─────────────────────────
function TimeInput({
  hours, min, sec, onChange, maxH = 8,
}: {
  hours: number; min: number; sec: number
  onChange: (h: number, m: number, s: number) => void
  maxH?: number
}) {
  return (
    <div className={styles.timeRow}>
      <select className={styles.timeSelect} value={hours} onChange={e => onChange(+e.target.value, min, sec)}>
        {Array.from({ length: maxH + 1 }, (_, i) => <option key={i} value={i}>{pad(i)}</option>)}
      </select>
      <span className={styles.timeColon}>:</span>
      <select className={styles.timeSelect} value={min} onChange={e => onChange(hours, +e.target.value, sec)}>
        {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{pad(i)}</option>)}
      </select>
      <span className={styles.timeColon}>:</span>
      <select className={styles.timeSelect} value={sec} onChange={e => onChange(hours, min, +e.target.value)}>
        {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{pad(i)}</option>)}
      </select>
    </div>
  )
}

// ─────────────────────────────────────────
export default function RacePredictorClient() {
  const [tab, setTab] = useState<'predict' | 'vdot' | 'strategy'>('predict')

  // 공유 상태 (예측·VDOT 탭)
  const [baseDist, setBaseDist] = useState<DistKey>('10k')
  const [customKm, setCustomKm] = useState<number>(8)
  const [bh, setBh] = useState(0)
  const [bm, setBm] = useState(50)
  const [bs, setBs] = useState(0)

  const [selected, setSelected] = useState<Set<TargetKey>>(new Set(['5k', 'half', 'full']))

  const baseKm = baseDist === 'custom' ? Math.max(0.5, customKm) : DISTS.find(d => d.key === baseDist)!.km
  const baseSec = bh * 3600 + bm * 60 + bs

  const vdot = useMemo(() => {
    if (baseSec < 60) return 0
    return vdotFromRace(baseKm, baseSec)
  }, [baseKm, baseSec])

  const vdotLevel = useMemo(() => {
    if (vdot < 30) return { tag: '초급', color: '#3EC8FF' }
    if (vdot < 40) return { tag: '중급',  color: '#C8FF3E' }
    if (vdot < 50) return { tag: '상급',  color: '#FFD700' }
    if (vdot < 60) return { tag: '엘리트 준비', color: '#FF8C3E' }
    return { tag: '엘리트', color: '#FF6B6B' }
  }, [vdot])

  // Tab 1 예측 결과
  const predictions = useMemo(() => {
    if (baseSec < 60) return []
    return TARGETS.filter(t => selected.has(t.key)).map(t => {
      const tR = riegelTime(baseKm, baseSec, t.km)
      const tV = timeFromVdot(t.km, vdot)
      const tC = cameronTime(baseKm, baseSec, t.km)
      const avg = (tR + tV + tC) / 3
      return { ...t, riegel: tR, vdot: tV, cameron: tC, avg, pace: avg / t.km }
    })
  }, [baseKm, baseSec, vdot, selected])

  const fullPrediction = useMemo(() => {
    if (baseSec < 60) return null
    const tR = riegelTime(baseKm, baseSec, 42.195)
    const tV = timeFromVdot(42.195, vdot)
    const tC = cameronTime(baseKm, baseSec, 42.195)
    return { avg: (tR + tV + tC) / 3 }
  }, [baseKm, baseSec, vdot])

  const toggleTarget = (k: TargetKey) => {
    const next = new Set(selected)
    if (next.has(k)) next.delete(k); else next.add(k)
    setSelected(next)
  }

  // ── Tab 3 Strategy 상태 ─────────────────
  const [stratDist, setStratDist] = useState<DistKey>('full')
  const [stratCustomKm, setStratCustomKm] = useState<number>(15)
  const [gh, setGh] = useState(3)
  const [gm, setGm] = useState(30)
  const [gs, setGs] = useState(0)
  const [strategy, setStrategy] = useState<'even' | 'negative' | 'positive'>('even')
  const [tempZone, setTempZone] = useState<'cool' | 'mild' | 'warm' | 'hot'>('mild')
  const [humZone, setHumZone] = useState<'dry' | 'mid' | 'humid'>('dry')
  const [altitude, setAltitude] = useState<'sea' | 'mid' | 'high'>('sea')

  const stratKm = stratDist === 'custom' ? Math.max(1, stratCustomKm) : DISTS.find(d => d.key === stratDist)!.km
  const goalSec = gh * 3600 + gm * 60 + gs

  // 날씨 보정: 목표 페이스 × (1 + pctSum) — Jack Daniels 근사
  const weatherAdj = useMemo(() => {
    const temp = tempZone === 'cool' ? 0 : tempZone === 'mild' ? 0.015 : tempZone === 'warm' ? 0.035 : 0.06
    const hum  = humZone === 'dry' ? 0 : humZone === 'mid' ? 0.01 : 0.025
    const alt  = altitude === 'sea' ? 0 : altitude === 'mid' ? 0.015 : 0.03
    return temp + hum + alt
  }, [tempZone, humZone, altitude])

  // 5km 단위 스플릿 + 마지막 잔여 거리
  const splits = useMemo(() => {
    if (goalSec < 60 || stratKm <= 0) return []
    const avgPace = goalSec / stratKm
    const segs: { from: number; to: number; seg: number; pace: number; segTime: number; cum: number }[] = []
    let from = 0
    const totalSegs = Math.ceil(stratKm / 5)
    for (let i = 0; i < totalSegs; i++) {
      const to = Math.min((i + 1) * 5, stratKm)
      const seg = to - from
      let pace = avgPace
      if (strategy === 'negative') {
        // 후반 빠르게: 초반 +1.5% ~ 후반 -1.5% 선형
        const mid = (from + to) / 2
        const t = mid / stratKm
        pace = avgPace * (1.015 - 0.03 * t)
      } else if (strategy === 'positive') {
        const mid = (from + to) / 2
        const t = mid / stratKm
        pace = avgPace * (0.985 + 0.03 * t)
      }
      segs.push({ from, to, seg, pace, segTime: pace * seg, cum: 0 })
      from = to
    }
    // 스플릿 정규화 — 총 합이 goalSec이 되도록 스케일
    const sumTime = segs.reduce((s, x) => s + x.segTime, 0)
    const scale = goalSec / sumTime
    let cum = 0
    for (const s of segs) {
      s.pace *= scale
      s.segTime *= scale
      cum += s.segTime
      s.cum = cum
    }
    return segs
  }, [goalSec, stratKm, strategy])

  const adjPace = goalSec > 0 && stratKm > 0 ? (goalSec / stratKm) * (1 + weatherAdj) : 0
  const adjTotal = adjPace * stratKm

  return (
    <div className={styles.wrap}>

      {/* ── 탭 헤더 ── */}
      <div className={styles.tabs}>
        {([
          { k: 'predict',  l: '🏁 기록 예측' },
          { k: 'vdot',     l: '🎯 훈련 페이스' },
          { k: 'strategy', l: '📊 페이스 전략' },
        ] as const).map(t => (
          <button key={t.k} className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`} onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1: 기록 예측 ══════════ */}
      {tab === 'predict' && (
        <div className={styles.panel}>
          {/* 기준 거리 */}
          <section>
            <label className={styles.label}>기준 거리</label>
            <div className={styles.distGrid}>
              {DISTS.map(d => (
                <button key={d.key}
                  className={`${styles.distBtn} ${baseDist === d.key ? styles.distBtnActive : ''}`}
                  onClick={() => setBaseDist(d.key)}>
                  {d.label}
                </button>
              ))}
              <button className={`${styles.distBtn} ${baseDist === 'custom' ? styles.distBtnActive : ''}`}
                onClick={() => setBaseDist('custom')}>
                커스텀
              </button>
            </div>
            {baseDist === 'custom' && (
              <div className={styles.customRow}>
                <input type="number" min={0.5} step={0.1} value={customKm}
                  onChange={e => setCustomKm(+e.target.value || 0)}
                  className={styles.customInput} />
                <span className={styles.unit}>km</span>
              </div>
            )}
          </section>

          {/* 기록 입력 */}
          <section>
            <label className={styles.label}>기록 (시:분:초)</label>
            <TimeInput hours={bh} min={bm} sec={bs} onChange={(h, m, s) => { setBh(h); setBm(m); setBs(s) }} />
          </section>

          {/* 예측 거리 */}
          <section>
            <label className={styles.label}>예측할 거리 <span className={styles.labelSub}>(다중 선택)</span></label>
            <div className={styles.targetGrid}>
              {TARGETS.map(t => (
                <button key={t.key}
                  className={`${styles.targetBtn} ${selected.has(t.key) ? styles.targetBtnActive : ''}`}
                  onClick={() => toggleTarget(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* 메인 히어로 — 풀 마라톤 예측 */}
          {fullPrediction && (
            <section className={styles.hero}>
              <p className={styles.heroLabel}>풀 마라톤 예상 기록</p>
              <p className={styles.heroTime}>{fmtHMS(fullPrediction.avg)}</p>
              <p className={styles.heroPace}>
                평균 페이스 <strong>{fmtPace(fullPrediction.avg / 42.195)}</strong>/km · 시속 <strong>{(42.195 / (fullPrediction.avg / 3600)).toFixed(2)}</strong> km/h
              </p>
            </section>
          )}

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
                    {predictions.map(p => (
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
          {fullPrediction && (
            <section>
              <label className={styles.label}>서브 목표 달성 여부 <span className={styles.labelSub}>(풀 기준)</span></label>
              <div className={styles.subGoals}>
                {SUB_GOALS.map(g => {
                  const achieved = fullPrediction.avg <= g.sec
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
        </div>
      )}

      {/* ══════════ TAB 2: 훈련 페이스 ══════════ */}
      {tab === 'vdot' && (
        <div className={styles.panel}>
          <section>
            <label className={styles.label}>기준 거리</label>
            <div className={styles.distGrid}>
              {DISTS.map(d => (
                <button key={d.key}
                  className={`${styles.distBtn} ${baseDist === d.key ? styles.distBtnActive : ''}`}
                  onClick={() => setBaseDist(d.key)}>
                  {d.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className={styles.label}>기록 (시:분:초)</label>
            <TimeInput hours={bh} min={bm} sec={bs} onChange={(h, m, s) => { setBh(h); setBm(m); setBs(s) }} />
          </section>

          {/* VDOT 히어로 */}
          <section className={styles.vdotHero}>
            <p className={styles.heroLabel}>VDOT</p>
            <p className={styles.vdotNum} style={{ color: vdotLevel.color }}>
              {vdot > 0 ? vdot.toFixed(1) : '--'}
            </p>
            <p className={styles.vdotTag} style={{ background: `${vdotLevel.color}22`, color: vdotLevel.color }}>
              {vdotLevel.tag}
            </p>
          </section>

          {/* 훈련 페이스 */}
          {vdot > 0 && (
            <section>
              <label className={styles.label}>훈련 페이스 (Jack Daniels)</label>
              <div className={styles.zoneList}>
                {PACE_ZONES.map(z => {
                  const pace = paceFromVdot(vdot, z.intensity)
                  const pace400 = pace * 0.4  // 400m = 0.4km
                  return (
                    <div key={z.key} className={styles.zoneCard} style={{ borderColor: `${z.color}55` }}>
                      <div className={styles.zoneHead}>
                        <span className={styles.zoneKey} style={{ background: z.color, color: '#0B0B0B' }}>{z.key}</span>
                        <span className={styles.zoneName}>{z.name}</span>
                      </div>
                      <div className={styles.zonePaces}>
                        <div>
                          <span className={styles.zonePaceLabel}>/km</span>
                          <span className={styles.zonePaceVal} style={{ color: z.color }}>{fmtPace(pace)}</span>
                        </div>
                        <div>
                          <span className={styles.zonePaceLabel}>/400m</span>
                          <span className={styles.zonePaceVal} style={{ color: z.color }}>{fmtMS(pace400)}</span>
                        </div>
                      </div>
                      <p className={styles.zoneDesc}>{z.desc}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ══════════ TAB 3: 페이스 전략 ══════════ */}
      {tab === 'strategy' && (
        <div className={styles.panel}>
          <section>
            <label className={styles.label}>목표 거리</label>
            <div className={styles.distGrid}>
              {DISTS.map(d => (
                <button key={d.key}
                  className={`${styles.distBtn} ${stratDist === d.key ? styles.distBtnActive : ''}`}
                  onClick={() => setStratDist(d.key)}>
                  {d.label}
                </button>
              ))}
              <button className={`${styles.distBtn} ${stratDist === 'custom' ? styles.distBtnActive : ''}`}
                onClick={() => setStratDist('custom')}>
                커스텀
              </button>
            </div>
            {stratDist === 'custom' && (
              <div className={styles.customRow}>
                <input type="number" min={1} step={0.1} value={stratCustomKm}
                  onChange={e => setStratCustomKm(+e.target.value || 0)}
                  className={styles.customInput} />
                <span className={styles.unit}>km</span>
              </div>
            )}
          </section>

          <section>
            <label className={styles.label}>목표 시간 (시:분:초)</label>
            <TimeInput hours={gh} min={gm} sec={gs} onChange={(h, m, s) => { setGh(h); setGm(m); setGs(s) }} maxH={8} />
          </section>

          <section>
            <label className={styles.label}>레이스 전략</label>
            <div className={styles.stratRow}>
              {([
                { k: 'even',     l: '균등 스플릿',      desc: '전구간 균일 페이스' },
                { k: 'negative', l: '네거티브 스플릿',  desc: '후반에 더 빠르게' },
                { k: 'positive', l: '포지티브 스플릿',  desc: '전반에 더 빠르게' },
              ] as const).map(s => (
                <button key={s.k}
                  className={`${styles.stratBtn} ${strategy === s.k ? styles.stratBtnActive : ''}`}
                  onClick={() => setStrategy(s.k)}>
                  <span className={styles.stratLabel}>{s.l}</span>
                  <span className={styles.stratDesc}>{s.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 스플릿 */}
          {splits.length > 0 && (
            <section>
              <label className={styles.label}>구간별 스플릿</label>
              <div className={styles.tableWrap}>
                <table className={styles.splitsTable}>
                  <thead>
                    <tr>
                      <th>구간</th>
                      <th>페이스/km</th>
                      <th>구간 시간</th>
                      <th>누적</th>
                    </tr>
                  </thead>
                  <tbody>
                    {splits.map((s, i) => (
                      <tr key={i}>
                        <td className={styles.segCell}>{s.from.toFixed(0)}~{s.to.toFixed(s.to % 1 ? 2 : 0)}km</td>
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

          {/* 날씨 보정 */}
          <section>
            <label className={styles.label}>날씨·고도 보정</label>
            <div className={styles.wGroup}>
              <p className={styles.wTitle}>기온</p>
              <div className={styles.wRow}>
                {([
                  { k: 'cool', l: '≤15°C', p: '+0%' },
                  { k: 'mild', l: '15~20°C', p: '+1.5%' },
                  { k: 'warm', l: '20~25°C', p: '+3.5%' },
                  { k: 'hot',  l: '≥25°C',  p: '+6%' },
                ] as const).map(o => (
                  <button key={o.k}
                    className={`${styles.wBtn} ${tempZone === o.k ? styles.wBtnActive : ''}`}
                    onClick={() => setTempZone(o.k)}>
                    <span>{o.l}</span><span className={styles.wPct}>{o.p}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.wGroup}>
              <p className={styles.wTitle}>습도</p>
              <div className={styles.wRow}>
                {([
                  { k: 'dry',   l: '≤60%',   p: '+0%' },
                  { k: 'mid',   l: '61~80%', p: '+1%' },
                  { k: 'humid', l: '>80%',   p: '+2.5%' },
                ] as const).map(o => (
                  <button key={o.k}
                    className={`${styles.wBtn} ${humZone === o.k ? styles.wBtnActive : ''}`}
                    onClick={() => setHumZone(o.k)}>
                    <span>{o.l}</span><span className={styles.wPct}>{o.p}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.wGroup}>
              <p className={styles.wTitle}>고도</p>
              <div className={styles.wRow}>
                {([
                  { k: 'sea', l: '해수면',      p: '+0%' },
                  { k: 'mid', l: '500m',        p: '+1.5%' },
                  { k: 'high', l: '≥1000m',     p: '+3%' },
                ] as const).map(o => (
                  <button key={o.k}
                    className={`${styles.wBtn} ${altitude === o.k ? styles.wBtnActive : ''}`}
                    onClick={() => setAltitude(o.k)}>
                    <span>{o.l}</span><span className={styles.wPct}>{o.p}</span>
                  </button>
                ))}
              </div>
            </div>

            {goalSec > 0 && (
              <div className={styles.adjHero}>
                <p className={styles.adjLabel}>보정된 예상 기록 <span className={styles.adjSub}>(+{(weatherAdj * 100).toFixed(1)}%)</span></p>
                <p className={styles.adjTime}>{fmtHMS(adjTotal)}</p>
                <p className={styles.adjPace}>보정 페이스 <strong>{fmtPace(adjPace)}</strong>/km</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
