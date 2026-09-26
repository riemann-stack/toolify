/* lib/krWindowTint.ts — 자동차 창유리 가시광선 투과율(VLT) 하한 단일 소스
   근거: 도로교통법 시행령 제28조 — 앞면 창유리 70% 미만, 운전석 좌우 옆면(1열 운전석·조수석) 40% 미만이면 운행 금지.
   뒷면·2열 이후 옆면은 제한 없음. 어린이운송용 승합자동차는 별도(자동차규칙 제94조제3항: 모든 창유리 70% 이상).
   쓰는 곳: unit/window-tint 도구, 상황별 가이드(자동차 구입·유지) */
export const WINDOW_TINT_MIN_VLT = { front: 70, driverSide: 40 } as const
