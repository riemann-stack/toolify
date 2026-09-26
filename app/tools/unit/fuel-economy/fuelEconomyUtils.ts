// 연료 단가 기본값(휘발유·경유, 오피넷 주간 평균)과 전기차 공공 충전요금 — lib/krFuelPrices.ts 단일 소스.
// 출처·기준일·갱신 방법은 lib 주석 참고. finance/car-cost 메인 탭 유가 기본값도 같은 lib를 쓴다.
// page.tsx의 100km 비용표·FAQ 금액·전기차 대비 배율·절약액·기준일 문구는 모두 이 값에서 계산하므로 lib만 갱신하면 됨.
export {
  FUEL_PRICE_MONTH,
  FUEL_PRICE_AS_OF,
  GASOLINE_PRICE,
  DIESEL_PRICE,
  EV_SLOW_RATE,
  EV_FAST_RATE,
  EV_ULTRA_RATE,
} from '@/lib/krFuelPrices'
