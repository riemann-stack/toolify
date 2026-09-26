// ─────────────────────────────────────────────────────────────
// 러닝 페이스 계산기 — 순수 계산·표기 헬퍼
// PaceClient(계산기)와 page.tsx(가이드 표·예시)가 같은 함수를 써서, 본문 숫자가 계산기 결과와 항상 일치하게 한다.
// 단위: 페이스 = 초/km, 거리 = km. 표기는 먼저 정수 초로 반올림한다("5:60" 방지).
// 기준일: 2026-09 (거리·단위 정의는 연도와 무관)
// ─────────────────────────────────────────────────────────────

/** 도로 경기 거리 — 마라톤 42.195km(World Athletics 기술규칙), 하프는 그 절반 */
export const FULL_KM = 42.195
export const HALF_KM = 21.0975
/** 국제 마일 = 1,609.344m 정확값 (1959 국제 야드·파운드 협정 · NIST SP 811 부록 B) */
export const MILE_KM = 1.609344
/** 표준 400m 트랙 1바퀴 (1레인 주행선 기준) */
export const TRACK_LAP_KM = 0.4

/** 초/km → "m:ss" */
export function secToPace(sec: number): string {
  const t = Math.round(sec)
  const m = Math.floor(t / 60)
  const s = t % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
/** 초/km → "m:ss" 또는 0.1초 단위가 남으면 "m:ss.s" (네거티브 스플릿 ±1.5초처럼 반 초가 의미 있는 표기용) */
export function secToPaceTenth(sec: number): string {
  const t = Math.round(sec * 10) / 10
  if (Number.isInteger(t)) return secToPace(t)
  const m = Math.floor(t / 60)
  const s = t - m * 60
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`
}
/** 초 → "h시간 m분 ss초" (1시간 미만은 "m분 ss초") */
export function secToTime(sec: number): string {
  const t = Math.round(sec)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return h > 0
    ? `${h}시간 ${m}분 ${String(s).padStart(2, '0')}초`
    : `${m}분 ${String(s).padStart(2, '0')}초`
}
/** 초 → "h:mm:ss" (1시간 미만은 "m:ss") */
export function secToHms(sec: number): string {
  const t = Math.round(sec)
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}
/** 페이스(초/km) → 시속(km/h) */
export function paceSecToKph(paceSec: number): number { return 3600 / paceSec }
/** 시속(km/h) → 페이스(초/km) */
export function kphToPaceSec(kph: number): number { return 3600 / kph }

/** '서브'(미만) 목표 페이스(정수 초/km) — 끝까지 유지하면 목표 시간 '안에' 들어오는 가장 느린 정수 초 페이스.
 *  반올림하면 풀 3:00:00 → 4:16(= 3:00:02)처럼 목표를 넘으므로 올림 − 1(나누어떨어지지 않으면 내림과 같다). */
export function subGoalPaceSec(goalSec: number, km: number): number {
  return Math.ceil(goalSec / km - 1e-9) - 1
}

/** 풀코스 인기 목표 — 계산기 「빠른 입력」 칩과 가이드 표가 같은 목록을 쓴다 */
export const MARATHON_GOALS: readonly { label: string; goalSec: number }[] = [
  { label: '서브3',    goalSec: 3 * 3600 },
  { label: '서브3:30', goalSec: 3.5 * 3600 },
  { label: '서브4',    goalSec: 4 * 3600 },
  { label: '서브4:30', goalSec: 4.5 * 3600 },
  { label: '서브5',    goalSec: 5 * 3600 },
]

/** 네거티브 스플릿 안내(하프·풀 = 21km 이상) — 전반 +1.5초/km, 후반 −1.5초/km. 거리를 반씩 나누므로 완주 시간은 균등 페이스와 같다 */
export const NEG_SPLIT_DELTA_SEC = 1.5
export function negativeSplit(paceSec: number, km: number): { frontSec: number; backSec: number; halfKm: number } | null {
  if (!(paceSec > 0) || km < 21) return null
  return { frontSec: paceSec + NEG_SPLIT_DELTA_SEC, backSec: paceSec - NEG_SPLIT_DELTA_SEC, halfKm: km / 2 }
}

/** 표준 400m 트랙 n레인 1바퀴 주행 거리(m).
 *  World Athletics 기술규칙: 레인 폭 1.22m(오른쪽 라인 포함), 1레인은 연석에서 0.30m, 2레인 이상은 안쪽 라인 바깥
 *  가장자리에서 0.20m 떨어진 주행선으로 잰다. 직선은 모든 레인이 같고 곡선(반원 2개 = 원 1개)만 길어지므로
 *  n레인 = 400 + 2π × (1.22 × (n − 1) − 0.10)  → 2레인 +7.04m … 8레인 +53.03m (400m 경기 스태거와 같은 값) */
export function laneLapMeters(lane: number): number {
  if (lane <= 1) return 400
  return 400 + 2 * Math.PI * (1.22 * (lane - 1) - 0.10)
}
