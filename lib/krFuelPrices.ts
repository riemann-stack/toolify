/* ──────────────────────────────────────────────────────
   lib/krFuelPrices.ts
   연료 단가 기본값(휘발유·경유) + 전기차 공공 충전요금 — 단일 소스
   사용처: unit/fuel-economy (fuelEconomyUtils.ts가 재수출) · finance/car-cost (메인 탭 유가 기본값)
   ──────────────────────────────────────────────────────

   [근거]
   · 휘발유·경유 — 오피넷(한국석유공사) 2026년 9월 넷째 주(9/20~24) 전국 주유소 평균 판매가, 2026-09-26 발표.
     휘발유 1,858.0원 · 경유 1,843.4원/L (원 단위 절사해 1,858 · 1,843으로 사용).
     https://www.opinet.co.kr
   · LPG(부탄) — 충전소 평균 1,100원대로 안내만 하고 수치는 두지 않는다(오피넷 확정값 미확인).
   · 전기차 공공 충전요금 — 기후에너지환경부 5단계 개편 확정안(2026-07-01 발표, 2026-08-01 시행), 원/kWh.
     완속(30kW 미만) 295.0 · 급속(100~200kW) 348.4 · 초급속(200kW 이상) 393.1.
     2026-07-31까지는 기존 2단계 요금(100kW 미만 324.4 · 100kW 이상 347.2).

   [갱신] 유가는 월 1회 오피넷 주간 평균으로 FUEL_PRICE_MONTH·FUEL_PRICE_AS_OF와 함께 고친다.
          fuel-economy page.tsx의 100km 비용표·FAQ 금액·전기차 대비 배율·절약액·기준일 문구는 이 값에서 계산된다.
   ────────────────────────────────────────────────────── */

export const FUEL_PRICE_MONTH = '2026년 9월'
export const FUEL_PRICE_AS_OF = `${FUEL_PRICE_MONTH} 넷째 주`
export const FUEL_PRICE_SOURCE_URL = 'https://www.opinet.co.kr'

/** 휘발유 전국 평균 (원/L) */
export const GASOLINE_PRICE = 1858
/** 경유 전국 평균 (원/L) */
export const DIESEL_PRICE = 1843

/** 전기차 공공 충전요금 (원/kWh) — 완속 30kW 미만 */
export const EV_SLOW_RATE = 295.0
/** 전기차 공공 충전요금 (원/kWh) — 급속 100~200kW */
export const EV_FAST_RATE = 348.4
/** 전기차 공공 충전요금 (원/kWh) — 초급속 200kW 이상 */
export const EV_ULTRA_RATE = 393.1
