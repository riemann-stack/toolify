/* ──────────────────────────────────────────────────────
   life/height-rank/heightRankData.ts
   키 백분위(상위 %) 계산 — 사이즈코리아 8차 인체치수조사 실측 통계 + 정규분포 모델
   ──────────────────────────────────────────────────────
   근거 (2026-07 웹검증 — 리서치+적대검증 워크플로, API 직접 재현 확인)
   - 데이터: 사이즈코리아(국가기술표준원) 8차 한국인 인체치수조사 (직접측정 2020.5~2021.12,
     20~69세 6,839명). 인체데이터 검색 API에서 성별×연령대별 키 평균·표준편차·표본수·
     실측 백분위(p1~p99)를 수집, 검증 에이전트가 API 재호출로 전건 재현 확인 (mm→cm 환산).
   - 정규분포 근사 타당성 실증: 전 16개 성별×연령 구간에서 평균+z×SD 예측 vs 실측 백분위
     오차가 p5~p95 구간 최대 0.97cm, 중앙값 최대 0.34cm. 단 극단 꼬리(p1 미만·p99 초과)는
     오차가 커질 수 있어 '약' 처리 + 0.1% 클램프.
   - 참고: 8차 전체 평균 남 172.5 / 여 159.6cm (20~69세, 국표원 보도자료).
     병무청 2024 병역판정검사(2005년생 약 21.1만 명) 평균 174.54cm.
   - 70세 이상은 API 미제공(후속 고령자 조사 별도) — 60~69세가 마지막 밴드.
   ────────────────────────────────────────────────────── */

export type Gender = 'M' | 'F'

export interface Band {
  id: string
  label: string
  /** 평균 (cm) */
  mean: number
  /** 표준편차 (cm) */
  sd: number
  /** 표본수 */
  n: number
  /** 실측 백분위 [p5, p25, p50, p75, p95] (cm) — 화면 참고표·검산 앵커 */
  pct: [number, number, number, number, number]
}

/** 사이즈코리아 8차 (2020~2023) — API 원값 mm를 cm로 환산 */
export const BANDS: Record<Gender, Band[]> = {
  M: [
    { id: '20-24', label: '20~24세', mean: 174.99, sd: 5.61, n: 789, pct: [165.9, 171.0, 175.2, 178.7, 184.3] },
    { id: '25-29', label: '25~29세', mean: 174.74, sd: 5.64, n: 648, pct: [165.9, 170.8, 174.5, 178.5, 184.7] },
    { id: '30-34', label: '30~34세', mean: 175.18, sd: 5.66, n: 478, pct: [165.4, 171.5, 175.1, 178.5, 184.4] },
    { id: '35-39', label: '35~39세', mean: 175.42, sd: 5.44, n: 494, pct: [166.2, 171.7, 175.6, 179.3, 183.7] },
    { id: '40-44', label: '40~44세', mean: 174.08, sd: 5.39, n: 385, pct: [164.2, 171.1, 174.2, 177.4, 182.5] },
    { id: '45-49', label: '45~49세', mean: 172.66, sd: 5.09, n: 372, pct: [164.1, 169.2, 172.6, 176.0, 181.1] },
    { id: '50-59', label: '50~59세', mean: 170.49, sd: 5.55, n: 440, pct: [161.6, 167.0, 170.5, 174.3, 179.8] },
    { id: '60-69', label: '60~69세', mean: 168.22, sd: 5.58, n: 689, pct: [159.6, 164.2, 168.1, 172.1, 177.5] },
  ],
  F: [
    { id: '20-24', label: '20~24세', mean: 161.78, sd: 5.16, n: 714, pct: [153.4, 158.2, 161.8, 165.2, 170.0] },
    { id: '25-29', label: '25~29세', mean: 162.07, sd: 5.30, n: 725, pct: [154.0, 158.4, 162.0, 165.4, 171.4] },
    { id: '30-34', label: '30~34세', mean: 162.32, sd: 5.17, n: 586, pct: [153.4, 159.0, 162.5, 165.6, 170.5] },
    { id: '35-39', label: '35~39세', mean: 162.37, sd: 5.03, n: 752, pct: [154.9, 158.8, 162.2, 165.5, 171.1] },
    { id: '40-44', label: '40~44세', mean: 161.34, sd: 5.13, n: 699, pct: [153.2, 158.0, 161.0, 164.9, 170.7] },
    { id: '45-49', label: '45~49세', mean: 159.92, sd: 5.16, n: 347, pct: [151.6, 156.8, 160.0, 163.5, 168.5] },
    { id: '50-59', label: '50~59세', mean: 157.75, sd: 4.91, n: 764, pct: [150.2, 154.5, 157.5, 160.7, 166.8] },
    { id: '60-69', label: '60~69세', mean: 155.46, sd: 4.62, n: 698, pct: [147.5, 152.5, 155.4, 158.5, 162.5] },
  ],
}

/** 8차 전체 평균 (20~69세, 국표원 보도자료) */
export const OVERALL_MEAN: Record<Gender, number> = { M: 172.5, F: 159.6 }
/** 병무청 2024 병역판정검사 평균 (2005년생 남성 약 21.1만 명) */
export const MMA_2024_MEAN = 174.54

/**
 * 표준정규 CDF — Zelen & Severo (A&S 26.2.17) 근사, |오차| < 7.5e-8.
 * 성인 신장은 성별·연령 내 정규 근사가 표준 전제 (8차 실측 백분위 대비 p5~p95 오차 ≤0.97cm).
 */
export function stdNormalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2)
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z >= 0 ? 1 - p : p
}

export interface RankResult {
  /** 상위 % (0.1~99.9 클램프 전 원값) */
  topPctRaw: number
  /** 표시용 상위 % (0.1 미만/99.9 초과 클램프) */
  topPct: number
  /** 꼬리 클램프 여부 (상위 0.1% 이내 / 하위 0.1% 이내) */
  clamped: 'top' | 'bottom' | null
  /** 100명 중 앞에서 몇 번째 (1~100) */
  rankIn100: number
  z: number
  diff: number
  band: Band
  /** 입력 범위 경고 */
  warning: string | null
}

export function calcHeightRank(gender: Gender, bandId: string, heightRaw: string): RankResult | null {
  const h = parseFloat(heightRaw)
  if (!isFinite(h) || h <= 0) return null
  const band = BANDS[gender].find((b) => b.id === bandId)
  if (!band) return null

  let warning: string | null = null
  if (h < 120 || h > 220) warning = '성인 통계 범위를 크게 벗어난 값이에요. 입력을 확인해 주세요 (cm 단위).'

  const z = (h - band.mean) / band.sd
  const below = stdNormalCdf(z) * 100
  const topPctRaw = 100 - below

  let clamped: RankResult['clamped'] = null
  let topPct = topPctRaw
  if (topPctRaw < 0.1) { topPct = 0.1; clamped = 'top' }
  else if (topPctRaw > 99.9) { topPct = 99.9; clamped = 'bottom' }

  const rankIn100 = Math.min(100, Math.max(1, Math.round(topPctRaw)))

  return {
    topPctRaw,
    topPct: Math.round(topPct * 10) / 10,
    clamped,
    rankIn100,
    z: Math.round(z * 100) / 100,
    diff: Math.round((h - band.mean) * 10) / 10,
    band,
    warning,
  }
}

/** 같은 키가 다른 연령대에서 상위 몇 %인지 (비교 표) */
export function rankAcrossBands(gender: Gender, heightRaw: string): { band: Band; topPct: number }[] {
  const h = parseFloat(heightRaw)
  if (!isFinite(h) || h <= 0) return []
  return BANDS[gender].map((band) => {
    const top = 100 - stdNormalCdf((h - band.mean) / band.sd) * 100
    return { band, topPct: Math.round(Math.min(99.9, Math.max(0.1, top)) * 10) / 10 }
  })
}
