/* ──────────────────────────────────────────────────────
   lib/running.ts
   러닝 공식 단일 소스 — Daniels/Gilbert VDOT · 훈련 강도 계수(%VO2max) · Riegel 거리 환산
   사용처: sports/race-predictor (racePredictorUtils.ts가 재수출) · sports/buildup · sports/vo2max
           · sports/interval-training(이지·LSD 탭 = Riegel, 구 sports/lsd)
   기준일: 2026-09 (공식 자체는 연도와 무관)
   출처: Daniels J. & Gilbert J. 「Oxygen Power: Performance Tables for Distance Runners」(1979) — 산소 비용·지속 가능
         %VO2max 회귀식, Daniels J. 「Daniels' Running Formula」(3rd ed., 2014) — E/M/T/I/R 훈련 강도,
         Riegel P. S. 「Athletic Records and Human Endurance」(American Scientist, 1981) — 지수 1.06
   ──────────────────────────────────────────────────────

   [훈련 강도 계수 — VDOT 대비 %VO2max]
   paceFromVdot(vdot, 계수)로 환산하면 Daniels 훈련 페이스표를 재현한다
   (VDOT 50 → M 4:30 / T 4:15 / I 3:56 / R 3:39, 공식표 4:31 / 4:15 / 3:55 / 3:40).
   E는 59~74% 범위라 느린 끝(E 0.59)과 빠른 끝(E_FAST_PCT 0.74)을 따로 둔다.
   ────────────────────────────────────────────────────── */

export type DanielsZone = 'E' | 'M' | 'T' | 'I' | 'R'

/** Daniels 훈련 강도 계수 (%VO2max, 소수) — E는 범위의 느린 끝 */
export const DANIELS_PCT: Readonly<Record<DanielsZone, number>> = {
  E: 0.59,
  M: 0.82,
  T: 0.88,
  I: 0.97,
  R: 1.06,
}

/** Easy 범위의 빠른 끝 (%VO2max) */
export const E_FAST_PCT = 0.74

/** Riegel 피로 지수 — T2 = T1 × (D2/D1)^1.06 */
export const RIEGEL_EXPONENT = 1.06

// ── VDOT (Daniels/Gilbert) ──────────────────
/** 속도 v(m/min) → 산소 비용 VO2 (ml/kg/min) */
export function vo2FromV(v: number): number {
  return -4.60 + 0.182258 * v + 0.000104 * v * v
}
/** VO2 (ml/kg/min) → 속도 v(m/min) — vo2FromV의 역함수(2차식 근) */
export function vFromVo2(vo2: number): number {
  const a = 0.000104, b = 0.182258, c = -(4.60 + vo2)
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
}
/** 경기 시간 tMin(분) 동안 지속 가능한 %VO2max (소수) */
export function pctVO2max(tMin: number): number {
  return 0.8 + 0.1894393 * Math.exp(-0.012778 * tMin) + 0.2989558 * Math.exp(-0.1932605 * tMin)
}
/** 레이스 기록 → VDOT */
export function vdotFromRace(distKm: number, timeSec: number): number {
  const tMin = timeSec / 60
  const v = (distKm * 1000) / tMin
  return vo2FromV(v) / pctVO2max(tMin)
}
/** VDOT → 해당 거리 예상 기록(초). 이분 탐색, 상한 10시간 */
export function timeFromVdot(distKm: number, vdot: number): number {
  let lo = 1, hi = 60 * 60 * 10
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
/** VDOT × 강도 계수(%VO2max, 소수) → 페이스(초/km) */
export function paceFromVdot(vdot: number, intensity: number): number {
  const vo2 = vdot * intensity
  const v = vFromVo2(vo2)
  return 60000 / v
}

// ── Riegel ─────────────────────────────────
/** Riegel 거리 환산 — 거리 d1의 기록 t1 → 거리 d2 예상 기록 (단위는 t1을 따름) */
export function riegelTime(d1: number, t1: number, d2: number): number {
  return t1 * Math.pow(d2 / d1, RIEGEL_EXPONENT)
}
