// ─────────────────────────────────────────────────────────────
// 레이스 페이스 플래너 — 구간별 페이스 + 코스 고저(고도) 반영 계산 엔진
// 완주 시간 예측 / 전략 분배 / 고도 경사 페이스 보정 / 통과 예상 시각
// 시간·페이스 포맷은 race-predictor 유틸 재사용 (사이트 일관성)
// ─────────────────────────────────────────────────────────────
import { fmtHMS, fmtPace } from '../race-predictor/racePredictorUtils'

export { fmtHMS, fmtPace }

// ── 거리 프리셋 ─────────────────────────
export type DistKey = '5K' | '10K' | 'half' | 'full' | 'custom'
export const DIST_PRESETS: { key: DistKey; label: string; km: number }[] = [
  { key: '5K',   label: '5K',   km: 5 },
  { key: '10K',  label: '10K',  km: 10 },
  { key: 'half', label: '하프', km: 21.0975 },
  { key: 'full', label: '풀',   km: 42.195 },
]

// ── 페이스 분배 전략 ────────────────────
export type Strategy = 'even' | 'negative' | 'positive' | 'custom'
export const STRATEGY_LABEL: Record<Strategy, string> = {
  even:     '균등',
  negative: '네거티브',
  positive: '포지티브',
  custom:   '직접',
}
export const STRATEGY_DESC: Record<Strategy, string> = {
  even:     '처음부터 끝까지 같은 페이스 — 가장 안정적',
  negative: '후반을 더 빠르게 — 기록 경신에 유리(권장)',
  positive: '초반을 더 빠르게 — 체력 분배 실패 위험',
  custom:   '구간을 직접 조정한 상태',
}
// 네거티브/포지티브 램프 폭(기준 페이스 대비 ±). 대칭이라 구간 평균 페이스는 기준과 동일.
const RAMP = 0.03

// ── 시간/페이스 입력 파서 ───────────────
/** "5:30"(분:초) 또는 "5.5"(소수 분 = 5분 30초) → 초/km. 빈/불량 입력은 0
 *  점(.)은 소수 구분자로만 해석 — "5.5"→5:30, "5.30"→5:18. 분:초는 콜론으로. */
export function parsePace(s: string): number {
  const t = (s || '').trim()
  const m = t.match(/^(\d{1,2})\s*:\s*(\d{1,2})$/)   // 콜론만 분:초 구분자
  if (m) return parseInt(m[1], 10) * 60 + Math.min(59, parseInt(m[2], 10))
  const n = parseFloat(t)                              // 점/정수는 소수 분 (5.5 → 330초)
  return isFinite(n) && n > 0 ? Math.round(n * 60) : 0
}
/** "HH:MM" → 자정 기준 분. 불량이면 null */
export function parseClock(s: string): number | null {
  const m = (s || '').trim().match(/^(\d{1,2})\s*:\s*(\d{1,2})$/)
  if (!m) return null
  const h = parseInt(m[1], 10), min = parseInt(m[2], 10)
  if (h > 23 || min > 59) return null
  return h * 60 + min
}
/** 자정 기준 분(소수 가능) → "HH:MM" (24시 넘기면 익일 표기) */
export function fmtClock(totalMin: number): string {
  if (!isFinite(totalMin)) return '--:--'
  const dayOver = Math.floor(totalMin / 1440)
  const t = ((totalMin % 1440) + 1440) % 1440
  const h = Math.floor(t / 60)
  const m = Math.floor(t % 60)
  const hh = String(h).padStart(2, '0')
  const mm = String(m).padStart(2, '0')
  return dayOver > 0 ? `${hh}:${mm} (+${dayOver}일)` : `${hh}:${mm}`
}

// ── 구간 분할 ───────────────────────────
export type Segment = { idx: number; from: number; to: number; dist: number }
/** 총 거리 → 1km 구간 + 마지막 부분 구간(예: 42.195 → 42개 + 0.195) */
export function buildSegments(totalKm: number): Segment[] {
  const D = Math.max(0, totalKm)
  const full = Math.floor(D + 1e-9)
  const segs: Segment[] = []
  for (let i = 0; i < full; i++) segs.push({ idx: i, from: i, to: i + 1, dist: 1 })
  const rem = +(D - full).toFixed(4)
  if (rem > 1e-4) segs.push({ idx: full, from: full, to: +D.toFixed(4), dist: rem })
  return segs
}

// ── 전략 기반 페이스 채움 ───────────────
/** 기준 페이스(초/km)·구간 수·전략 → 구간별 평지 페이스 배열. 대칭 램프라 단순 평균은 기준과 동일 */
export function fillStrategy(baseSec: number, n: number, strategy: Strategy): number[] {
  if (n <= 0 || baseSec <= 0) return Array(Math.max(0, n)).fill(baseSec)
  if (strategy === 'even' || strategy === 'custom' || n === 1) return Array(n).fill(baseSec)
  const slow = baseSec * (1 + RAMP)   // 느린 끝
  const fast = baseSec * (1 - RAMP)   // 빠른 끝
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)             // 0..1
    // negative: 느림→빠름 / positive: 빠름→느림
    const p = strategy === 'negative' ? slow + (fast - slow) * t : fast + (slow - fast) * t
    return Math.round(p)
  })
}

// ── 고도 경사 → 페이스 보정(추정) ───────
// 코칭 경험칙 + Strava GAP·Minetti 곡선을 단순화한 추정치.
// 오르막 1%당 +약 12초/km, 내리막 1%당 −약 6초/km. 과도한 값은 클램프.
export const GRADE_UP_SEC = 12
export const GRADE_DOWN_SEC = 6
const MIN_PACE = 150  // 2:30/km — 이보다 빠른 보정은 비현실적이라 하한
/** 경사(%) → 페이스 가감(초/km) */
export function gradeAdjustSec(gradePct: number): number {
  const raw = gradePct >= 0 ? gradePct * GRADE_UP_SEC : gradePct * GRADE_DOWN_SEC
  return Math.max(-45, Math.min(120, raw))
}
/** 평지 페이스 배열 + 구간 경사 → 고도 보정 페이스 배열 */
export function applyGrade(flatPaces: number[], grades: number[]): number[] {
  return flatPaces.map((p, i) => Math.max(MIN_PACE, Math.round(p + gradeAdjustSec(grades[i] ?? 0))))
}

// ── 계산 결과 ───────────────────────────
export type PlanRow = {
  seg: Segment
  paceSec: number      // 초/km
  segTimeSec: number   // 이 구간 소요(초)
  cumTimeSec: number   // 누적(초)
  alt: number          // 구간 끝 고도(m)
  dAlt: number         // 구간 고도 변화(m)
  gradePct: number     // 경사(%)
  passMin: number | null  // 통과 예상 시각(자정 기준 분)
}
export type PlanResult = {
  rows: PlanRow[]
  totalKm: number
  finishSec: number
  avgPaceSec: number
  ascent: number       // 총 상승(m)
  descent: number      // 총 하강(m)
  hasElev: boolean
}

/**
 * @param segments  buildSegments 결과
 * @param paces     구간별 페이스(초/km)
 * @param alts      구간 끝 고도(m) 배열 (segments와 같은 길이)
 * @param startElev 출발(0km) 고도(m)
 * @param startClockMin 출발 시각(자정 기준 분) 또는 null
 */
export function calcPlan(
  segments: Segment[],
  paces: number[],
  alts: number[],
  startElev: number,
  startClockMin: number | null,
): PlanResult {
  let cum = 0, ascent = 0, descent = 0, hasElev = false
  const rows: PlanRow[] = segments.map((seg, i) => {
    const paceSec = Math.max(0, paces[i] ?? 0)
    const segTimeSec = paceSec * seg.dist
    cum += segTimeSec
    const prevAlt = i === 0 ? startElev : (alts[i - 1] ?? 0)
    const alt = alts[i] ?? 0
    const dAlt = alt - prevAlt
    if (Math.abs(dAlt) > 1e-9) hasElev = true
    if (dAlt > 0) ascent += dAlt; else descent += -dAlt
    const gradePct = seg.dist > 0 ? (dAlt / (seg.dist * 1000)) * 100 : 0
    const passMin = startClockMin != null ? startClockMin + cum / 60 : null
    return { seg, paceSec, segTimeSec, cumTimeSec: cum, alt, dAlt, gradePct, passMin }
  })
  if (Math.abs(startElev) > 1e-9) hasElev = true
  const totalKm = segments.reduce((a, s) => a + s.dist, 0)
  const finishSec = cum
  const avgPaceSec = totalKm > 0 ? finishSec / totalKm : 0
  return { rows, totalKm, finishSec, avgPaceSec, ascent, descent, hasElev }
}

/** 특정 거리(km)까지 누적 시간(초). 구간 내부는 선형 보간. 범위 밖이면 null */
export function timeAtDistance(rows: PlanRow[], targetKm: number): number | null {
  if (targetKm <= 0) return 0
  for (const r of rows) {
    if (targetKm <= r.seg.to + 1e-9) {
      const into = targetKm - r.seg.from        // 이 구간에서 얼마나 진행했나(km)
      if (into <= 0) return r.cumTimeSec - r.segTimeSec
      const before = r.cumTimeSec - r.segTimeSec
      return before + r.paceSec * Math.min(into, r.seg.dist)
    }
  }
  return null
}

// ── 경고(비현실/입력오류) ───────────────
export function planWarnings(res: PlanResult): string[] {
  const w: string[] = []
  if (res.rows.length === 0) return w
  // 빈 구간(페이스 0) — 완주 시간이 실제보다 짧게 계산됨
  if (res.rows.some(r => r.paceSec <= 0))
    w.push('페이스가 비어 있는 구간이 있어 완주 시간이 실제보다 짧게 계산됩니다 — 모든 구간을 채워주세요.')
  // 평균 페이스 비현실: 마라톤 세계기록 ≈ 2:55/km, 5K WR ≈ 2:35/km
  if (res.avgPaceSec > 0 && res.avgPaceSec < 170)
    w.push(`평균 ${fmtPace(res.avgPaceSec)}/km는 세계기록(약 2:55/km)보다 빠릅니다 — 페이스를 다시 확인하세요.`)
  const fastest = Math.min(...res.rows.map(r => r.paceSec).filter(p => p > 0))
  if (isFinite(fastest) && fastest < 150)
    w.push(`일부 구간이 ${fmtPace(fastest)}/km로 비현실적으로 빠릅니다.`)
  const steep = res.rows.find(r => Math.abs(r.gradePct) > 15)
  if (steep)
    w.push(`${steep.seg.to}km 부근 경사 ${steep.gradePct.toFixed(1)}% — 고도 입력값(코스 데이터)을 확인하세요.`)
  return w
}

// ── 완주 목표 시간별 필요 페이스 표(콘텐츠용 참고) ──
// pace = 초/km = 완주 목표 시간 ÷ 거리. 균등 페이스 기준.
export const PACE_TABLE: { full: string; fullPace: number; half: string; halfPace: number }[] = [
  { full: '3:00:00', fullPace: 3 * 3600 / 42.195,   half: '1:30:00', halfPace: 1.5 * 3600 / 21.0975 },
  { full: '3:30:00', fullPace: 3.5 * 3600 / 42.195, half: '1:45:00', halfPace: 1.75 * 3600 / 21.0975 },
  { full: '4:00:00', fullPace: 4 * 3600 / 42.195,   half: '2:00:00', halfPace: 2 * 3600 / 21.0975 },
  { full: '4:30:00', fullPace: 4.5 * 3600 / 42.195, half: '2:15:00', halfPace: 2.25 * 3600 / 21.0975 },
  { full: '5:00:00', fullPace: 5 * 3600 / 42.195,   half: '2:30:00', halfPace: 2.5 * 3600 / 21.0975 },
]
