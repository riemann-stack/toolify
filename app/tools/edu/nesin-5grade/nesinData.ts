/* ──────────────────────────────────────────────────────
   edu/nesin-5grade/nesinData.ts
   고교 내신 5등급제 계산 (2025학년도 고1 도입) + 구 9등급 환산 병기
   ──────────────────────────────────────────────────────
   근거
   - 5등급 상대평가 누적 비율(「학교생활기록 작성 및 관리지침」 교육부훈령 제555호 [별표 9]):
     1등급 ~10% / 2등급 ~34% / 3등급 ~66% /
     4등급 ~90% / 5등급 ~100%. (구간 비율 10·24·32·24·10%)
   - 구 9등급 누적: 1:4 / 2:11 / 3:23 / 4:40 / 5:60 / 6:77 / 7:89 / 8:96 / 9:100 (%)
   - 성취도 A~E(절대평가, 성취율): A≥90 / B≥80 / C≥70 / D≥60 / E<60.
   ⚠️ 등급은 석차·재적수(수강자수) 기준 상대평가. 동점자 처리·반올림은 학교별로 다를 수 있어
      참고 추정치이며, 공식 등급은 학교 학생부·나이스(NEIS) 산출을 따른다.
   ────────────────────────────────────────────────────── */

/** 5등급 누적 상한(%) */
export const GRADE5_CUM = [10, 34, 66, 90, 100]
/** 9등급 누적 상한(%) */
export const GRADE9_CUM = [4, 11, 23, 40, 60, 77, 89, 96, 100]

/** 석차 백분율(%) → 등급 (누적 비율 표 기준) */
export function pctToGrade(pct: number, cum: number[]): number {
  for (let i = 0; i < cum.length; i++) {
    if (pct <= cum[i] + 1e-9) return i + 1
  }
  return cum.length
}

/** 석차 → 등급 (교육부훈령 제555호 [별표 9] 규칙).
    별표 9는 백분율이 아니라 '수강자수 × 누적 등급비율을 반올림한 누적 인원'으로 등급을 가른다.
    예: 재적 178명이면 1등급 누적인원 = round(178 × 0.10) = 18명 → 18등까지 1등급
    (백분율로만 계산하면 18/178 = 10.11%라 2등급으로 갈려 학교 산출과 어긋난다). */
export function rankToGrade(rank: number, total: number, cum: number[]): number | null {
  if (!Number.isFinite(rank) || !Number.isFinite(total) || rank <= 0 || total <= 0 || rank > total) return null
  for (let i = 0; i < cum.length; i++) {
    const cumCount = Math.round((total * cum[i]) / 100)
    if (rank <= cumCount) return i + 1
  }
  return cum.length
}

/** 석차·재적수 → 석차 백분율(%) */
export function rankPercent(rank: number, total: number): number | null {
  if (rank <= 0 || total <= 0 || rank > total) return null
  return (rank / total) * 100
}

/** 성취도 (성취율 %) */
export function achievement(scorePct: number): string {
  if (scorePct >= 90) return 'A'
  if (scorePct >= 80) return 'B'
  if (scorePct >= 70) return 'C'
  if (scorePct >= 60) return 'D'
  return 'E'
}

export interface SubjectInput {
  id: number
  name: string
  rank: string     // 석차
  total: string    // 재적수(수강자)
  units: string    // 이수단위
}

export interface SubjectResult {
  id: number
  name: string
  pct: number | null
  grade5: number | null
  grade9: number | null
  units: number
}

export function computeSubject(sub: SubjectInput): SubjectResult {
  const rank = parseInt(sub.rank, 10)
  const total = parseInt(sub.total, 10)
  const units = Math.max(0, parseFloat(sub.units) || 0)
  const pct = rankPercent(rank, total)
  return {
    id: sub.id,
    name: sub.name,
    pct,
    grade5: rankToGrade(rank, total, GRADE5_CUM),
    grade9: rankToGrade(rank, total, GRADE9_CUM),
    units,
  }
}

export interface Averages {
  avg5: number | null
  avg9: number | null
  totalUnits: number
}

/** 이수단위 가중평균 (등급은 낮을수록 좋음) */
export function weightedAverages(results: SubjectResult[]): Averages {
  let sum5 = 0, sum9 = 0, u = 0
  for (const r of results) {
    if (r.grade5 === null || r.units <= 0) continue
    sum5 += r.grade5 * r.units
    sum9 += (r.grade9 ?? r.grade5) * r.units
    u += r.units
  }
  return {
    avg5: u > 0 ? Math.round((sum5 / u) * 100) / 100 : null,
    avg9: u > 0 ? Math.round((sum9 / u) * 100) / 100 : null,
    totalUnits: u,
  }
}
