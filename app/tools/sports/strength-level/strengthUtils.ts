// ─────────────────────────────────────────────────────────────
// 파워리프팅 보정 점수 — Wilks(원판)·DOTS·IPF GL
// 클라이언트(StrengthLevelClient)와 서버 page.tsx(가이드 표)가 공유하는 단일 소스.
// 'use client' 없음 — 빌드 시 page.tsx에서 표 값을 계산하는 데 쓴다.
// ─────────────────────────────────────────────────────────────

export type Sex = 'male' | 'female'

/* Wilks(원판) 점수 — 체중·합계 기반, 성별 5차 다항식 */
export function wilks(total: number, bw: number, sex: Sex): number {
  if (bw < 30 || total <= 0) return 0
  const c = sex === 'male'
    ? [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8]
    : [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8]
  const d = c[0] + c[1] * bw + c[2] * bw ** 2 + c[3] * bw ** 3 + c[4] * bw ** 4 + c[5] * bw ** 5
  return d !== 0 ? (total * 500) / d : 0
}

/* DOTS 점수 — 성별 4차 다항식 */
export function dots(total: number, bw: number, sex: Sex): number {
  if (bw < 30 || total <= 0) return 0
  const c = sex === 'male'
    ? [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093]
    : [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706]
  const d = c[0] + c[1] * bw + c[2] * bw ** 2 + c[3] * bw ** 3 + c[4] * bw ** 4
  return d !== 0 ? (total * 500) / d : 0
}

/* IPF GL Points — 클래식(논장비) 풀파워 기준, 2020 공식 */
export function ipfGL(total: number, bw: number, sex: Sex): number {
  if (bw < 40 || total <= 0) return 0
  const [A, B, C] = sex === 'male'
    ? [1199.72839, 1025.18162, 0.00921]
    : [610.32796, 1045.59282, 0.03048]
  const denom = A - B * Math.exp(-C * bw)
  return denom > 0 ? (100 * total) / denom : 0
}
