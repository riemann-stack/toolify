/* ──────────────────────────────────────────────────────
   interior/wallpaper/wallpaperUtils.ts
   도배 롤 수 계산 — 면적 기준 vs 장(스트립) 수 기준 중 큰 값 (순수 함수, node 검산용)
   ────────────────────────────────────────────────────── */

/** 장당 상하 재단 여유(m) — 천장 몰딩·걸레받이 쪽을 위아래 약 5cm씩 잘라 맞추므로 한 장은 천장고 + 10cm가 필요 */
export const TRIM_M = 0.1

/** 1롤에서 뽑을 수 있는 장 수 — 천장고 + 재단 여유 기준.
 *  (여유 없이 나누면 15.6m ÷ 2.6m = 정확히 6장처럼 계산돼 실제로는 롤이 모자란다) */
export function stripsPerRollOf(rollLength: number, height: number): number {
  const cut = Math.max(0.1, height) + TRIM_M
  return Math.max(1, Math.floor(rollLength / cut + 1e-9))
}

/** 입력 문자열 → 숫자. 빈 값·비숫자는 fallback, 범위 밖은 [min, max]로 클램프 (계산 단계 전용) */
export function parseClamp(s: string, min: number, max: number, fallback = min): number {
  const x = parseFloat(s)
  if (!Number.isFinite(x)) return fallback
  return Math.min(max, Math.max(min, x))
}

export interface CalcInput {
  width: number
  length: number
  height: number
  windowCount: number
  windowW: number
  windowH: number
  doorCount: number
  doorW: number
  doorH: number
  wpWidth: number
  rollLength: number
  lossPct: number
  includeCeiling: boolean
}

export function calcWallpaper(i: CalcInput) {
  const perimeter = (i.width + i.length) * 2
  const totalWallArea = perimeter * i.height
  const windowArea = i.windowCount * i.windowW * i.windowH
  const doorArea = i.doorCount * i.doorW * i.doorH
  const netWallArea = Math.max(0, totalWallArea - windowArea - doorArea)
  const ceilingArea = i.includeCeiling ? i.width * i.length : 0
  const totalArea = netWallArea + ceilingArea
  const requiredArea = totalArea * (1 + i.lossPct / 100)
  const areaPerRoll = i.wpWidth * i.rollLength
  const exactRolls = areaPerRoll > 0 ? requiredArea / areaPerRoll : 0
  const recommendedRolls = Math.ceil(exactRolls)
  // 장 수 기준 (천장고 + 재단 여유)
  const stripsPerRoll = stripsPerRollOf(i.rollLength, i.height)
  const totalStripsNeeded = Math.ceil(perimeter / Math.max(0.1, i.wpWidth))
  const stripsRollsNeeded = Math.ceil(totalStripsNeeded / stripsPerRoll)
  return {
    perimeter, totalWallArea, windowArea, doorArea, netWallArea,
    ceilingArea, totalArea, requiredArea, areaPerRoll,
    exactRolls, recommendedRolls,
    stripsPerRoll, totalStripsNeeded, stripsRollsNeeded,
    finalRolls: Math.max(recommendedRolls, stripsRollsNeeded),
  }
}
