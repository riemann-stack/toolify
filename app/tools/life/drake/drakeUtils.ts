// ─────────────────────────────────────────────────────────────
// 드레이크 방정식 — 거리·전파권 모델 (page·Client 공용, 'use client' 없음)
// ─────────────────────────────────────────────────────────────

/** 인류 전파권 시작 — 1900년경 첫 라디오 송신. 반경(광년) = 기준 연도 − 1900 */
export const RADIO_START_YEAR = 1900
export function radioRangeLy(asOfYear: number): number {
  return asOfYear - RADIO_START_YEAR
}

/* 거리 계산 — 우리 은하를 디스크로 가정, N개 문명 균등 분포 */
export const GALAXY_RADIUS_LY = 50_000          // 광년 (반경)
export const GALAXY_THICKNESS_LY = 1_000        // 광년 (디스크 두께)
export const GALAXY_VOLUME_LY3 = Math.PI * GALAXY_RADIUS_LY * GALAXY_RADIUS_LY * GALAXY_THICKNESS_LY

export type DistanceEstimate = {
  averageDistance: number
  nearestDistance: number
  roundTripCommYears: number
  potentialContactsInRange: number
  rangeLabel: 'low' | 'medium' | 'high'
}

/**
 * 최근접 거리와 전파권 내 문명 수를 **같은 균등 밀도(N / 은하 부피)**로 계산한다.
 * (예전엔 전파권 내 문명 수만 태양 주변 국소 별밀도로 따로 계산해, N=100만에서
 *  '가장 가까운 문명 109광년'과 '전파권 내 0.09개·아직 도달 못함'이 동시에 표시되는 모순이 있었다.)
 * rangeLabel도 최근접 거리에서 파생 — 두 지표가 서로 다른 결론을 내지 않게.
 */
export function calcDistance(N: number, radioLy: number): DistanceEstimate | null {
  if (!isFinite(N) || N <= 0) return null
  const averageDistance = Math.pow(GALAXY_VOLUME_LY3 / N, 1 / 3)
  const nearestDistance = averageDistance * 0.55  // Poisson 통계 근사
  const roundTripCommYears = nearestDistance * 2
  const potentialContactsInRange = N * ((4 / 3) * Math.PI * radioLy ** 3) / GALAXY_VOLUME_LY3
  const rangeLabel: DistanceEstimate['rangeLabel'] =
    nearestDistance <= radioLy ? 'high'
      : nearestDistance <= radioLy * 1.5 ? 'medium' : 'low'
  return { averageDistance, nearestDistance, roundTripCommYears, potentialContactsInRange, rangeLabel }
}
