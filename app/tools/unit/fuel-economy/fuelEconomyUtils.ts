// 연료 단가 기본값 — 오피넷(한국석유공사) 2026년 9월 넷째 주(9/20~24) 전국 주유소 평균 판매가, 2026-09-26 발표.
// 휘발유 1,858.0원 · 경유 1,843.4원/L. LPG(부탄)는 충전소 평균 1,100원대라 어림값으로만 안내.
// TODO(lib): finance/car-cost(현재 1,650원 하드코딩)와 공유하도록 lib/krFuelPrices.ts로 이전하고 월 1회 갱신.
// page.tsx의 100km 비용표·FAQ 금액·전기차 대비 배율·절약액·기준일 문구는 모두 아래 상수에서 계산하므로 여기만 갱신하면 됨.
export const FUEL_PRICE_MONTH = '2026년 9월'
export const FUEL_PRICE_AS_OF = `${FUEL_PRICE_MONTH} 넷째 주`
export const GASOLINE_PRICE = 1858
export const DIESEL_PRICE = 1843

// 전기차 공공 충전요금 — 기후에너지환경부 5단계 개편 확정안(2026-07-01 발표, 2026-08-01 시행), 원/kWh.
// 완속(30kW 미만) 295.0 · 급속(100~200kW) 348.4 · 초급속(200kW 이상) 393.1.
// 2026-07-31까지는 기존 2단계 요금(100kW 미만 324.4 · 100kW 이상 347.2).
export const EV_SLOW_RATE = 295.0
export const EV_FAST_RATE = 348.4
export const EV_ULTRA_RATE = 393.1
