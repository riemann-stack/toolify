/* ──────────────────────────────────────────────────────
   unit/radiation/radiationData.ts
   방사선 단위 환산 + 일상 노출 비교 + 비이온화 EMF 참고
   ──────────────────────────────────────────────────────
   ⚠️ 의학·산업 현장의 정확한 측정·평가는 본 도구로 대체할 수 없습니다.
      한국 원자력안전위원회(NSSC) 기준 + ICRP 권고 + WHO·ICNIRP 자료 기반.
   ────────────────────────────────────────────────────── */

// ─── 선량당량 (인체 영향, Sv·rem) ─────────────────────────
export type DoseUnit = 'usv' | 'msv' | 'sv' | 'rem'
export interface DoseUnitInfo { id: DoseUnit; name: string; unit: string; toSv: number }

export const DOSE_UNITS: DoseUnitInfo[] = [
  { id: 'usv', name: 'μSv',  unit: 'μSv',  toSv: 1e-6 },
  { id: 'msv', name: 'mSv',  unit: 'mSv',  toSv: 1e-3 },
  { id: 'sv',  name: 'Sv',   unit: 'Sv',   toSv: 1 },
  { id: 'rem', name: 'rem',  unit: 'rem',  toSv: 1e-2 },
]

export function convertDose(value: number, fromId: DoseUnit): Record<DoseUnit, number> {
  const from = DOSE_UNITS.find((u) => u.id === fromId)!
  const sv = value * from.toSv
  return {
    usv: sv / 1e-6,
    msv: sv / 1e-3,
    sv,
    rem: sv / 1e-2,
  }
}

// ─── 흡수선량 (물질 흡수, Gy·rad) ─────────────────────────
export type AbsorbedUnit = 'mgy' | 'gy' | 'rad' | 'krad'
export interface AbsorbedUnitInfo { id: AbsorbedUnit; name: string; unit: string; toGy: number }

export const ABSORBED_UNITS: AbsorbedUnitInfo[] = [
  { id: 'mgy',  name: 'mGy',  unit: 'mGy',  toGy: 1e-3 },
  { id: 'gy',   name: 'Gy',   unit: 'Gy',   toGy: 1 },
  { id: 'rad',  name: 'rad',  unit: 'rad',  toGy: 1e-2 },
  { id: 'krad', name: 'krad', unit: 'krad', toGy: 1e1 },
]

export function convertAbsorbed(value: number, fromId: AbsorbedUnit): Record<AbsorbedUnit, number> {
  const from = ABSORBED_UNITS.find((u) => u.id === fromId)!
  const gy = value * from.toGy
  return {
    mgy:  gy / 1e-3,
    gy,
    rad:  gy / 1e-2,
    krad: gy / 1e1,
  }
}

// ─── 방사능 (활성도, Bq·Ci) ───────────────────────────────
export type ActivityUnit = 'bq' | 'kbq' | 'mbq' | 'gbq' | 'tbq' | 'ci' | 'mci' | 'uci'
export interface ActivityUnitInfo { id: ActivityUnit; name: string; unit: string; toBq: number }

export const ACTIVITY_UNITS: ActivityUnitInfo[] = [
  { id: 'bq',   name: 'Bq',    unit: 'Bq',  toBq: 1 },
  { id: 'kbq',  name: 'kBq',   unit: 'kBq', toBq: 1e3 },
  { id: 'mbq',  name: 'MBq',   unit: 'MBq', toBq: 1e6 },
  { id: 'gbq',  name: 'GBq',   unit: 'GBq', toBq: 1e9 },
  { id: 'tbq',  name: 'TBq',   unit: 'TBq', toBq: 1e12 },
  { id: 'ci',   name: 'Ci',    unit: 'Ci',  toBq: 3.7e10 },
  { id: 'mci',  name: 'mCi',   unit: 'mCi', toBq: 3.7e7 },
  { id: 'uci',  name: 'μCi',   unit: 'μCi', toBq: 3.7e4 },
]

export function convertActivity(value: number, fromId: ActivityUnit): Record<ActivityUnit, number> {
  const from = ACTIVITY_UNITS.find((u) => u.id === fromId)!
  const bq = value * from.toBq
  const out = {} as Record<ActivityUnit, number>
  for (const u of ACTIVITY_UNITS) out[u.id] = bq / u.toBq
  return out
}

// ─── 노출률 ↔ 누적 ───────────────────────────────────────
export type RateUnit = 'usv_h' | 'usv_day' | 'msv_year' | 'msv_day' | 'rem_year'
export interface RateUnitInfo { id: RateUnit; name: string; toUsvPerHour: number }

export const RATE_UNITS: RateUnitInfo[] = [
  { id: 'usv_h',    name: 'μSv/h',  toUsvPerHour: 1 },
  { id: 'usv_day',  name: 'μSv/일', toUsvPerHour: 1 / 24 },
  { id: 'msv_day',  name: 'mSv/일', toUsvPerHour: 1000 / 24 },
  { id: 'msv_year', name: 'mSv/년', toUsvPerHour: 1000 / (24 * 365) },
  { id: 'rem_year', name: 'rem/년', toUsvPerHour: 1e4 / (24 * 365) },
]

export function convertRate(value: number, fromId: RateUnit): Record<RateUnit, number> {
  const from = RATE_UNITS.find((u) => u.id === fromId)!
  const usvPerHour = value * from.toUsvPerHour
  const out = {} as Record<RateUnit, number>
  for (const u of RATE_UNITS) out[u.id] = usvPerHour / u.toUsvPerHour
  return out
}

// ─── 일상 노출 비교 (mSv 기준) ────────────────────────────
export type ExposureCat = 'natural' | 'medical' | 'travel' | 'food' | 'occupation' | 'accident'

export interface Exposure {
  emoji: string
  label: string
  mSv: number
  cat: ExposureCat
  note?: string
}

export const EXPOSURES: Exposure[] = [
  { emoji: '🍌', label: '바나나 1개 (K-40)',            mSv: 0.0001, cat: 'food', note: '바나나 등가량 BED' },
  { emoji: '🦷', label: '치과 X-ray 1장 (Bitewing)',    mSv: 0.005,  cat: 'medical' },
  { emoji: '🛫', label: '비행 1시간 (10km 고도)',       mSv: 0.005,  cat: 'travel' },
  { emoji: '🌍', label: '하루 자연 노출 (한국)',         mSv: 0.008,  cat: 'natural', note: '연 3 mSv ÷ 365' },
  { emoji: '🦷', label: '치과 파노라마 X-ray',           mSv: 0.014,  cat: 'medical' },
  { emoji: '✈️', label: '인천→뉴욕 왕복 (편당 12h)',     mSv: 0.06,   cat: 'travel' },
  { emoji: '🫁', label: '가슴 X-ray (PA + Lat)',         mSv: 0.1,    cat: 'medical' },
  { emoji: '🩻', label: '복부 X-ray',                    mSv: 0.7,    cat: 'medical' },
  { emoji: '🏥', label: '유방촬영술 (Mammography)',      mSv: 0.4,    cat: 'medical' },
  { emoji: '☢️', label: '연간 인공 노출 한도 (일반인)',  mSv: 1,      cat: 'natural', note: 'ICRP·원안위 기준' },
  { emoji: '🌋', label: '브라질 과라파리 해변 1년',      mSv: 1.5,    cat: 'natural', note: '모나자이트 모래' },
  { emoji: '🌍', label: '연간 자연 노출 (한국 평균)',    mSv: 3.0,    cat: 'natural', note: '라돈·우주선·식이 포함' },
  { emoji: '🇺🇸', label: '연간 자연+의료 (미국 평균)',   mSv: 6.2,    cat: 'natural' },
  { emoji: '🏥', label: 'CT 흉부',                       mSv: 7,      cat: 'medical' },
  { emoji: '🏥', label: 'CT 복부·골반',                  mSv: 10,     cat: 'medical' },
  { emoji: '🏥', label: 'CT 관상동맥 조영',              mSv: 12,     cat: 'medical' },
  { emoji: '☢️', label: '방사선 작업자 평균 한도',       mSv: 20,     cat: 'occupation', note: 'ICRP 5년 평균' },
  { emoji: '🏥', label: 'PET-CT (전신)',                 mSv: 25,     cat: 'medical' },
  { emoji: '☢️', label: '방사선 작업자 단년 한도',       mSv: 50,     cat: 'occupation' },
  { emoji: '🚨', label: '응급 구조 한도 (1회)',          mSv: 100,    cat: 'accident', note: 'ICRP 권고' },
  { emoji: '☠️', label: '급성 방사선 증후군 시작',        mSv: 1000,   cat: 'accident', note: '1 Sv — 일시적 증상' },
  { emoji: '💀', label: '50% 치사량 LD50/30 (의료 X)',   mSv: 4500,   cat: 'accident', note: '치료 없을 시 30일 내 50% 사망' },
]

// ─── 안전 한도 ────────────────────────────────────────────
export interface Limit { who: string; limit: string; mSv: number; source: string }

export const LIMITS: Limit[] = [
  { who: '일반인 (인공 노출 한도)',         limit: '1 mSv/년',         mSv: 1,    source: 'ICRP·한국 원안위' },
  { who: '임산부 (전체 임신 기간)',         limit: '1 mSv',            mSv: 1,    source: 'ICRP 88' },
  { who: '방사선 작업자 (5년 평균)',        limit: '20 mSv/년',        mSv: 20,   source: 'ICRP 60' },
  { who: '방사선 작업자 (어느 단년)',       limit: '50 mSv/년',        mSv: 50,   source: '원안위 고시' },
  { who: '응급 구조원 (1회 임무 권고)',     limit: '100 mSv',          mSv: 100,  source: 'ICRP 96' },
  { who: '응급 생명구조 (1회 예외)',        limit: '500 mSv 미만',     mSv: 500,  source: 'ICRP 96' },
  { who: '급성 증상 발현 (메스꺼움)',       limit: '~1,000 mSv (1 Sv)', mSv: 1000, source: '의학 자료' },
  { who: '50% 치사 (의료 처치 없이 30일)',  limit: '~4,500 mSv',       mSv: 4500, source: 'LD50/30' },
]

// ─── 비이온화 EMF (별도 영역, 직접 환산 불가) ──────────────
export interface EmfRef {
  emoji: string
  label: string
  value: string
  source: string
  cat: 'sar' | 'rf' | 'mag' | 'elec'
}

export const EMF_REFS: EmfRef[] = [
  // SAR (Specific Absorption Rate) - 휴대폰
  { emoji: '📱', label: '휴대폰 SAR 한도 (한국·미국)',    value: '1.6 W/kg (10g 평균)',   source: 'ICNIRP·과기정통부',     cat: 'sar' },
  { emoji: '📱', label: '휴대폰 SAR 한도 (EU·국제)',      value: '2.0 W/kg (10g 평균)',   source: 'ICNIRP·EU',             cat: 'sar' },
  // RF 전계 (V/m)
  { emoji: '📡', label: 'LTE/5G 기지국 (1m)',             value: '0.5~5 V/m',             source: '방통위·실측',           cat: 'rf' },
  { emoji: '📶', label: 'WiFi 라우터 (50cm)',             value: '0.1~0.5 V/m',           source: '실측 평균',             cat: 'rf' },
  { emoji: '📞', label: '휴대폰 통화 중 (귀 옆)',         value: '4~6 V/m',               source: '실측 평균',             cat: 'rf' },
  { emoji: '🛡️', label: 'RF 안전 한도 (일반인, 6 GHz)',  value: '61 V/m',                source: 'ICNIRP 2020',           cat: 'rf' },
  // 자기장 (μT)
  { emoji: '🔌', label: '송전선 154 kV 하부',             value: '~3 μT',                 source: '환경부 실측',           cat: 'mag' },
  { emoji: '🔌', label: '송전선 765 kV 하부',             value: '~5~10 μT',              source: '환경부 실측',           cat: 'mag' },
  { emoji: '🚿', label: '헤어드라이어 근접 (5cm)',         value: '~10~70 μT',             source: 'WHO',                   cat: 'mag' },
  { emoji: '🔪', label: '전자레인지 (30cm 거리)',          value: '~1~5 μT',               source: 'WHO',                   cat: 'mag' },
  { emoji: '🛡️', label: '자기장 한도 (일반인, 60Hz)',    value: '200 μT',                source: 'ICNIRP 2010',           cat: 'mag' },
  // 전계 (V/m, 저주파)
  { emoji: '⚡', label: '가전제품 평균 (0.5m)',           value: '~1~10 V/m',             source: 'WHO',                   cat: 'elec' },
  { emoji: '🛡️', label: '전계 한도 (일반인, 60Hz)',      value: '5,000 V/m',             source: 'ICNIRP 2010',           cat: 'elec' },
]
