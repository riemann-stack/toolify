/* ──────────────────────────────────────────────────────
   interior/lighting/lightingUtils.ts
   조명 계산 — 입력 파싱·전기요금 기준 (순수 함수, node 검산용)
   ────────────────────────────────────────────────────── */

import { KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH, ELEC_SIMPLE_KRW_PER_KWH } from '@/lib/krElectricityRates'

/** 입력 문자열 → 숫자. 빈 값·비숫자는 fallback, 범위 밖은 [min, max]로 클램프.
 *  onChange에서 바로 클램프하면 첫 타자가 최솟값으로 치환돼(예: '1' → 50) 입력이 오염되므로 계산 단계에서만 쓴다. */
export function parseClamp(s: string, min: number, max: number, fallback = min): number {
  const x = parseFloat(s)
  if (!Number.isFinite(x)) return fallback
  return Math.min(max, Math.max(min, x))
}

/* 입력 범위 */
export const LUMEN_PER_LIGHT_LIMIT = { min: 50, max: 100000 }
export const INPUT_W_LIMIT = { min: 1, max: 2000 }
export const INPUT_LM_LIMIT = { min: 1, max: 100000 }
export const KWH_PRICE_LIMIT = { min: 10, max: 1000 }

/* 한전 주택용(저압) 누진 구간별 전력량요금 (원/kWh) — lib/krElectricityRates.ts 단일 소스
 * (출처·기준일·별도 부과 항목은 lib 주석 참고) */
export const KEPCO_RESIDENTIAL_TIER_KRW = [
  KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH.tier1,
  KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH.tier2,
  KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH.tier3,
] as const

/* 기본 전기 단가 — 1단계 전력량요금에 부가 요금 일부를 얹은 단순 가정 (사용자 조정 가능) */
export const DEFAULT_KRW_PER_KWH = ELEC_SIMPLE_KRW_PER_KWH
