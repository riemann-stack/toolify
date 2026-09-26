/* ──────────────────────────────────────────────────────
   lib/krVehicleTax.ts
   자동차 취득세 감면 한도·자동차세(배기량별 cc당 세액·차령 경감·연납 공제)·지방교육세·
   공채 매입 비율·경유차 환경개선부담금 대상 연식 — 단일 소스 (2026년 과세연도 기준)
   사용처: finance/car-tax (carTaxData.ts가 재수출) · finance/car-cost (자동차세 칩·가이드 표)
   기준일: 2026-09
   ──────────────────────────────────────────────────────

   [법적 근거]
   1) 취득세 — 지방세법 §12①2호: 비영업용 승용 7% · 경형 4% · 영업용 4%
      · 전기·수소 140만원 한도 면제, 하이브리드 감면은 2024년 종료 (지방세특례제한법 §66)
      · 경차(비영업용 승용 경형) 75만원 한도 면제 — 지특법 §67①, 2027-12-31까지
      · 다자녀(18세 미만 자녀 양육, 1대, 6인승 이하 승용) — 지특법 §22의2, 2027-12-31까지
        3자녀 이상 면제(140만 한도) / 2자녀 50% 경감(70만 한도, 2025.1 신설)
   2) 자동차세 — 지방세법 §127①: 비영업용 승용 cc당 1,000cc 이하 80원 · 1,600cc 이하 140원 · 1,600cc 초과 200원
                                  영업용 승용 1,600cc 이하 18원 · 2,500cc 이하 19원 · 2,500cc 초과 24원
      · 전기·수소 등 그 밖의 승용(배기량 없음) 비영업용 10만원 정액 (§127①1호)
      · 차령 경감 — §127③·시행령 §125: 차령 = 과세연도 − 최초등록연도 + 1, 차령 3부터 (차령 − 2) × 5%, 최대 50%
      · 연납 공제 — §128③(연세액 일시납부 공제): 1월 일시납 공제율 5% × 잔여 11개월/12 ≈ 4.58% (2026년)
   3) 지방교육세 — 지방세법 §151①: 자동차세액(비영업용 승용)의 30%
   4) 공채 — 서울시 도시철도공채 조례(비영업용 승용: 1,600cc 미만 9% · 2,000cc 미만 12% · 2,000cc 이상 20%),
      경차(1,000cc 미만) 매입 면제. 그 밖의 지역·전기차·영업용은 지역 대표값(약식).
   5) 환경개선부담금 — 유로4 이하 경유차만 부과. 환경부: 2012년 3월 이후 새로 부과 대상이 되는 차량 없음
      → 등록연도 2011년 이하를 대상으로 추정.

   [갱신] 과세연도가 바뀌면 VEHICLE_TAX_YEAR·ANNUAL_PREPAY_DISCOUNT(잔여 개월 반영 공제율)를 확인한다.
   출처: 위택스 https://www.wetax.go.kr · 국가법령정보센터 지방세법·지방세특례제한법
   ────────────────────────────────────────────────────── */

/** 계산 기준 과세연도 — '경과 년수'로 등록연도(= 기준연도 − 경과 년수)와 차령을 산출.
 *  렌더 경로에서 new Date()를 쓰지 않도록 상수로 둔다(SSG hydration 안전). 매년 1월 갱신. */
export const VEHICLE_TAX_YEAR = 2026

export type CarType = 'normal' | 'light' | 'business' | 'ev' | 'hybrid'
export type FuelType = 'gasoline' | 'diesel' | 'lpg' | 'electric' | 'hybrid'
export type RegionId = 'seoul' | 'busan' | 'daegu' | 'incheon' | 'gwangju' | 'daejeon' | 'ulsan' | 'sejong' | 'gyeonggi' | 'other'

export interface RegionInfo {
  id: RegionId
  name: string
  /** 차량가 대비 공채 매입 비율 (지방·도시철도채권) */
  bondRate: number
}

/** 지역별 공채 매입 비율 (2025~2026 기준 — 도시철도채권/지역개발채권).
 *  서울은 배기량별로 다르다 → bondRateFor()를 거칠 것. 그 밖의 지역도 조례상 배기량별 차등이 있으나 약식(대표값). */
export const REGIONS: RegionInfo[] = [
  { id: 'seoul',    name: '서울',           bondRate: 0.12 },
  { id: 'busan',    name: '부산',           bondRate: 0.04 },
  { id: 'daegu',    name: '대구',           bondRate: 0.04 },
  { id: 'incheon',  name: '인천',           bondRate: 0.04 },
  { id: 'gwangju',  name: '광주',           bondRate: 0.04 },
  { id: 'daejeon',  name: '대전',           bondRate: 0.04 },
  { id: 'ulsan',    name: '울산',           bondRate: 0.04 },
  { id: 'sejong',   name: '세종',           bondRate: 0.04 },
  { id: 'gyeonggi', name: '경기·기타 광역', bondRate: 0.06 },
  { id: 'other',    name: '도 (군·시)',     bondRate: 0.04 },
]

/* ─── 취득세 ─── */
export const ACQUISITION_TAX_RATES: Record<CarType, number> = {
  normal:   0.07,   // 일반 승용 7%
  light:    0.04,   // 경차 4%
  business: 0.04,   // 영업용 4%
  ev:       0.07,   // 전기·수소 7% 적용 후 140만원 한도 면제
  hybrid:   0.07,   // 하이브리드 (감면 종료, 일반과 동일)
}

/** 친환경차 취득세 감면 한도 (2025~2026) */
export const EV_TAX_CAP = 1_400_000    // 전기·수소 140만원 한도 면제
export const HYBRID_TAX_CAP = 0        // 하이브리드 감면 2024 종료
/** 경차(비영업용 승용 경형) 취득세 면제 한도 — 지방세특례제한법 §67①, 2027-12-31까지 */
export const LIGHT_TAX_CAP = 750_000
/** 다자녀 취득세 감면 (지특법 §22의2, 18세 미만 자녀 양육 1대 · 2027-12-31까지) — 6인승 이하 승용 기준
 *  3자녀 이상: 면제(한도 140만) / 2자녀: 50% 경감(한도 70만, 2025.1 신설) */
export const MULTI_CHILD_TAX_CAP = 1_400_000
export const TWO_CHILD_TAX_RATE = 0.5
export const TWO_CHILD_TAX_CAP = 700_000

/* ─── 자동차세 (cc당 세액, 원) — 지방세법 §127① ─── */
export interface PerCcBracket {
  /** 이 구간의 배기량 상한 (이하, cc) */
  ccMax: number
  /** cc당 세액 (원) */
  perCc: number
}

/** 비영업용 승용: 1,000cc 이하 80원 · 1,600cc 이하 140원 · 1,600cc 초과 200원 */
export const CAR_TAX_PER_CC_NON_BUSINESS: readonly PerCcBracket[] = [
  { ccMax: 1000,     perCc: 80 },
  { ccMax: 1600,     perCc: 140 },
  { ccMax: Infinity, perCc: 200 },
]

/** 영업용 승용: 1,000cc 이하 18원 · 1,600cc 이하 18원 · 2,000cc 이하 19원 · 2,500cc 이하 19원 · 2,500cc 초과 24원 */
export const CAR_TAX_PER_CC_BUSINESS: readonly PerCcBracket[] = [
  { ccMax: 1000,     perCc: 18 },
  { ccMax: 1600,     perCc: 18 },
  { ccMax: 2000,     perCc: 19 },
  { ccMax: 2500,     perCc: 19 },
  { ccMax: Infinity, perCc: 24 },
]

/** 배기량 → cc당 세액. 어느 구간에도 들지 않는 값(NaN)은 마지막(최고) 구간으로 둔다. */
export function carTaxPerCc(cc: number, isBusiness: boolean): number {
  const table = isBusiness ? CAR_TAX_PER_CC_BUSINESS : CAR_TAX_PER_CC_NON_BUSINESS
  for (const b of table) if (cc <= b.ccMax) return b.perCc
  return table[table.length - 1].perCc
}

/** 자동차세 본세 (연, 원) = 배기량 × cc당 세액. 차령 경감·연납 공제·지방교육세 전. */
export function annualTaxByCC(cc: number, isBusiness: boolean): number {
  return cc * carTaxPerCc(cc, isBusiness)
}

/** 전기차 자동차세 본세 (정액, 2026 기준). 지방교육세 30% 별도 가산 → 합계 13만원 */
export const EV_ANNUAL_TAX = 100_000

/** 차령 경감률 — 지방세법 §127③·시행령 §125: 차령 = 과세연도 − 최초등록연도 + 1 (등록한 해 = 차령 1).
 *  차령 3부터 (차령 − 2) × 5%, 최대 50% (차령 12 이상). 인자는 '경과 년수'가 아니라 **차령**. */
export function annualTaxAgeDiscount(carAge: number): number {
  if (carAge < 3) return 0
  const discount = (carAge - 2) * 0.05
  return Math.min(0.5, discount)
}

/** 경과 년수(과세연도 − 등록연도, 신차 0) → 올해 차령 */
export function carAgeFromYears(yearsSinceReg: number): number {
  return Math.max(0, Math.floor(yearsSinceReg)) + 1
}

/** 자동차세 연납 할인 (2026년: 공제율 5% × 잔여 11개월/12 ≈ 4.58%) */
export const ANNUAL_PREPAY_DISCOUNT = 0.0458

/** 지방교육세 = 자동차세 × 30% */
export const EDU_TAX_RATE = 0.30

/* ─── 환경개선부담금 (경유차) ─── */
/** 부과 대상: 배출가스 유로4 이하 경유차. 유로5·6 기준 차량(대략 2012년 이후 출고)은 부과 대상이 아니다
 *  (환경부: 2012년 3월 이후 새로 부과 대상이 되는 차량 없음). 등록연도로 유로4 이하 여부를 추정한다. */
export const DIESEL_ENV_FEE_LAST_REG_YEAR = 2011
export function dieselEnvFeeApplies(fuelType: FuelType, regYear: number): boolean {
  return fuelType === 'diesel' && regYear <= DIESEL_ENV_FEE_LAST_REG_YEAR
}

/** 공채 매입 비율 — 경차(1,000cc 미만)는 매입 면제. 서울 도시철도채권은 비영업용 승용 배기량별
 *  (1,600cc 미만 9% · 2,000cc 미만 12% · 2,000cc 이상 20%, 서울시 도시철도공채 조례).
 *  ※ 서울 1,000~1,600cc 한시 면제(2023.3~2025.12)의 2026년 연장 여부는 확인되지 않아 조례 기본 비율로 둔다.
 *  전기차·영업용·그 밖의 지역은 지역 대표값(약식).
 *  ※ 친환경차(전기·수소·하이브리드) 조례상 채권 매입 감면(서울 등, 한도·기한 미확인)은 미반영 — car-tax page.tsx에 안내. */
export function bondRateFor(regionId: RegionId, cc: number, carType: CarType): number {
  if (carType === 'light') return 0
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[0]
  if (carType === 'ev' || carType === 'business') return region.bondRate
  if (cc < 1000) return 0
  if (regionId === 'seoul') {
    if (cc < 1600) return 0.09
    if (cc < 2000) return 0.12
    return 0.20
  }
  return region.bondRate
}
