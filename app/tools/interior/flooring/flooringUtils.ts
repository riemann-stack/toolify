/* 바닥재 계산기 — 순수 계산 유틸 (node 검산용으로 분리) */

/** 장판 재단 여유 — 벽 올림·재단 오차용, 방향마다 약 10cm */
export const ROLL_TRIM_M = 0.1

/**
 * 장판(롤) 폭 배치 — 방을 롤 폭(예: 1.8m)으로 몇 줄(폭) 덮어야 하는지 계산해
 * 가로·세로 두 방향 중 더 짧게 끝나는 배치를 고른다.
 * - strips: 필요한 폭 수, stripLenM: 한 폭의 재단 길이(재단 여유 포함), lengthM: 총 필요 길이
 * - 면적÷폭 방식은 3.7m 방처럼 폭 배수를 살짝 넘는 경우 2m 이상 모자라게 나와 폭 단위로 계산
 */
export function rollLayout(
  widthM: number,
  lengthM: number,
  rollWidthM: number,
  trimM: number = ROLL_TRIM_M,
): { strips: number; stripLenM: number; lengthM: number } {
  if (!(widthM > 0) || !(lengthM > 0) || !(rollWidthM > 0)) return { strips: 0, stripLenM: 0, lengthM: 0 }
  const plan = (across: number, along: number) => {
    const strips = Math.ceil((across + trimM) / rollWidthM - 1e-9)
    const stripLenM = along + trimM
    return { strips, stripLenM, lengthM: strips * stripLenM }
  }
  const a = plan(widthM, lengthM)   // 세로 방향으로 폭을 까는 경우
  const b = plan(lengthM, widthM)   // 가로 방향으로 폭을 까는 경우
  return a.lengthM <= b.lengthM ? a : b
}

/**
 * 롤 구매 길이(m, 정수 올림) — 폭 배치 길이에 로스율(패턴 맞춤·실수 여유)을 더한 값
 */
export function rollMetersToBuy(
  widthM: number,
  lengthM: number,
  rollWidthM: number,
  lossPct: number,
): { layout: ReturnType<typeof rollLayout>; requiredM: number; buyM: number } {
  const layout = rollLayout(widthM, lengthM, rollWidthM)
  const requiredM = layout.lengthM * (1 + Math.max(0, lossPct) / 100)
  return { layout, requiredM, buyM: Math.max(0, Math.ceil(requiredM - 1e-9)) }   // max: 면적 0일 때 -0 표기 방지
}
