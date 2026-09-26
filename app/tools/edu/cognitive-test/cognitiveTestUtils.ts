/* 인지 능력 테스트 — 시행 수·등급·점수 환산 (page.tsx 가이드 표와 CognitiveTestClient.tsx가 함께 쓰는 단일 소스) */

/** 시행 수 — reaction은 6회 중 첫 1회(연습)를 빼고 5회 평균 */
export const ROUNDS = { reaction: 6, stroop: 20, dualSingle: 5, dualDouble: 10 } as const

/** 반응 속도 자극 대기 시간(ms) — 누른 뒤 이 범위의 무작위 시점에 화면이 바뀐다 */
export const REACTION_DELAY_MS = { min: 1500, max: 5000 } as const

export type Grade = { key: string; label: string; emoji: string; range: [number, number]; color: string }
export const REACTION_GRADES: Grade[] = [
  { key: 'excellent', label: '매우 빠름',   emoji: '🚀', range: [0, 200],     color: 'var(--teal-600)' },
  { key: 'fast',      label: '빠름',         emoji: '✨', range: [201, 250],   color: 'var(--emerald-600)' },
  { key: 'avg',       label: '평균',         emoji: '⭐', range: [251, 300],   color: 'var(--accent)' },
  { key: 'below',     label: '평균 이하',    emoji: '👍', range: [301, 350],   color: 'var(--yellow-700)' },
  { key: 'slow',      label: '느림',         emoji: '🐢', range: [351, 9999],  color: 'var(--orange-600)' },
]
export function getReactionGrade(ms: number): Grade {
  return REACTION_GRADES.find(g => ms >= g.range[0] && ms <= g.range[1]) ?? REACTION_GRADES[4]
}
/** 등급 범위 표기 — '~ 200ms' · '201~250ms' · '351ms~' */
export function gradeRangeText(g: Grade): string {
  if (g.range[1] >= 9999) return `${g.range[0]}ms~`
  if (g.range[0] === 0) return `~ ${g.range[1]}ms`
  return `${g.range[0]}~${g.range[1]}ms`
}

/* ── 간섭 판정 구간 (이 도구가 정한 참고 기준 — 연령별 규준 아님) ── */
export type Bands = { low: number; high: number }
export const STROOP_BANDS: Bands = { low: 200, high: 400 }   // ms
export const DUAL_BANDS: Bands = { low: 25, high: 40 }       // %
export type Band = 'noise' | 'low' | 'avg' | 'high'
/** 0 이하 = 표본이 적어 생긴 오차 범위 */
export function interferenceBand(v: number, b: Bands): Band {
  return v <= 0 ? 'noise' : v < b.low ? 'low' : v < b.high ? 'avg' : 'high'
}
export const BAND_LABEL: Record<Band, string> = { noise: '오차 범위 (다시 측정 권장)', low: '낮음 (좋음)', avg: '평균', high: '높음' }
/** '200 미만 낮음 · 200~399 평균 · 400 이상 높음' */
export function bandsText(b: Bands, unit: string): string {
  return `${b.low}${unit} 미만 낮음 · ${b.low}~${b.high - 1}${unit} 평균 · ${b.high}${unit} 이상 높음`
}

/* ── 0~100점 환산 ── */
const clamp100 = (v: number) => Math.max(0, Math.min(100, v))
/** 반응 속도: 200ms 이하 100점 → 350ms 이상 0점 (선형) */
export const REACTION_SCALE = { full: 200, zero: 350 } as const
/** 스트룹 간섭: 0ms 이하 100점 → 500ms 이상 0점 */
export const STROOP_SCALE = { full: 0, zero: 500 } as const
/** 이중 과제 간섭률: 0% 이하 100점 → 50% 이상 0점 */
export const DUAL_SCALE = { full: 0, zero: 50 } as const
const linear = (v: number, s: { full: number; zero: number }) => clamp100(((s.zero - v) / (s.zero - s.full)) * 100)
export const reactionScore = (ms: number) => linear(ms, REACTION_SCALE)
export const stroopScore = (ms: number) => linear(ms, STROOP_SCALE)
export const dualScore = (pct: number) => linear(pct, DUAL_SCALE)

/** 마친 테스트만 단순 평균 — 하나도 없으면 null */
export function calcTotalScore(r: { reaction?: number; stroop?: number; dual?: number }): { value: number; count: number } | null {
  const parts: number[] = []
  if (r.reaction !== undefined) parts.push(reactionScore(r.reaction))
  if (r.stroop !== undefined) parts.push(stroopScore(r.stroop))
  if (r.dual !== undefined) parts.push(dualScore(r.dual))
  if (parts.length === 0) return null
  return { value: Math.round(parts.reduce((a, b) => a + b, 0) / parts.length), count: parts.length }
}
