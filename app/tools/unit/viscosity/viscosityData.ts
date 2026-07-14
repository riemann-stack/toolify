/* ──────────────────────────────────────────────────────
   unit/viscosity/viscosityData.ts
   점도 환산 — cP·mPa·s·cSt·SUS·Pa·s + SAE J300 + ISO 3448
   ──────────────────────────────────────────────────────
   - 절대점도(μ, dynamic): cP = mPa·s, Pa·s
   - 동점도(ν, kinematic): cSt = mm²/s
   - 관계식: ν (cSt) = μ (cP) / ρ (g/cm³)
   - SUS(Saybolt Universal Seconds): ASTM D2161 공식 계산식(100°F) + 수치 역산.
     유효역 ν ≥ 1.81 cSt (= 32.0 SUS, Saybolt 측정 하한) — 미만은 NaN('—' 표시)
   ────────────────────────────────────────────────────── */

export type Scale = 'cp' | 'cst' | 'sus' | 'pas'

export interface ScaleInfo {
  id: Scale
  name: string
  fullName: string
  type: 'dynamic' | 'kinematic' | 'time'
  unit: string
  desc: string
}

export const SCALES: ScaleInfo[] = [
  { id: 'cp',  name: 'cP / mPa·s', fullName: '센티포아즈 (절대점도)',  type: 'dynamic',   unit: 'cP',     desc: '1 cP = 1 mPa·s. 절대점도 — 가장 보편적' },
  { id: 'cst', name: 'cSt / mm²/s', fullName: '센티스토크 (동점도)',  type: 'kinematic', unit: 'cSt',    desc: '동점도 = 절대점도 / 밀도. 오일·연료 카탈로그 표준' },
  { id: 'sus', name: 'SUS',        fullName: 'Saybolt Universal Seconds', type: 'time', unit: 's',   desc: '미국 전통 단위. 컵에서 60mL 흘러나오는 시간(초)' },
  { id: 'pas', name: 'Pa·s',       fullName: '파스칼·초 (SI)',         type: 'dynamic',   unit: 'Pa·s', desc: 'SI 단위. 1 Pa·s = 1000 cP. 학술·연구용' },
]

// ─── 밀도 프리셋 (g/cm³) ────────────────────────────────────
export interface DensityPreset { id: string; label: string; rho: number; temp?: string }

export const DENSITY_PRESETS: DensityPreset[] = [
  { id: 'water',    label: '물',           rho: 1.00, temp: '@20°C' },
  { id: 'gasoline', label: '가솔린',       rho: 0.74 },
  { id: 'diesel',   label: '디젤',         rho: 0.84 },
  { id: 'engineoil',label: '엔진오일',     rho: 0.87, temp: '실온' },
  { id: 'cookoil',  label: '식용유',       rho: 0.92 },
  { id: 'milk',     label: '우유',         rho: 1.03 },
  { id: 'seawater', label: '바닷물',       rho: 1.03 },
  { id: 'glycerin', label: '글리세린',     rho: 1.26 },
  { id: 'honey',    label: '꿀',           rho: 1.42 },
]

// ─── SUS ↔ cSt 환산 (ASTM D2161) ──────────────────────
/** cSt → SUS @100°F — ASTM D2161 공식 계산식(표 자체가 이 식으로 생성됨).
 *  전 구간 단일 식: 고점도에서 4.6324×cSt로 수렴하며, ±1% 이내 선형 근사는
 *  약 180 SUS(≈38 cSt)부터 성립. D2161 표 앵커 재현: 2→32.6, 5→42.4,
 *  10→58.8, 20→97.8, 100→463.5 (±0.1 SUS).
 *  유효역 cSt ≥ 1.81 (= 32.0 SUS 하한) — 미만은 NaN('—' 표시). */
export function cstToSus(cSt: number): number {
  if (!isFinite(cSt) || cSt < 1.81) return NaN
  return 4.6324 * cSt + (1 + 0.03264 * cSt) / ((3930.2 + 262.7 * cSt + 23.97 * cSt * cSt + 1.646 * cSt * cSt * cSt) * 1e-5)
}

/** SUS → cSt — 위 공식 계산식의 수치 역산(이분법, 단조증가라 안정 수렴).
 *  왕복 변환(cSt→SUS→cSt)이 정확히 일치한다. SUS < 32.0(측정 하한)은 NaN. */
export function susToCst(sus: number): number {
  if (!isFinite(sus) || sus < 32) return NaN
  let lo = 1.81
  let hi = 1e6
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (cstToSus(mid) < sus) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ─── 통합 환산 ───────────────────────────────────────────
export interface Converted {
  cp: number       // 절대점도 (centipoise = mPa·s)
  cst: number      // 동점도 (centistoke)
  sus: number      // Saybolt
  pas: number      // Pa·s
}

/** 입력 스케일·값·밀도 → 4개 스케일 동시 환산 */
export function convertAll(scale: Scale, value: number, density: number): Converted {
  // 모두 cSt 기준으로 통일 후 환산
  let cst = 0
  switch (scale) {
    case 'cst': cst = value; break
    case 'cp':  cst = density > 0 ? value / density : 0; break
    case 'pas': cst = density > 0 ? (value * 1000) / density : 0; break
    case 'sus': cst = susToCst(value); break
  }
  const cp = cst * density
  return {
    cst,
    cp,
    pas: cp / 1000,
    sus: cstToSus(cst),
  }
}

// ─── SAE J300 엔진오일 등급 (100°C 동점도 기준) ─────────────
export interface SaeGrade {
  grade: string
  minCst: number      // @100°C 최소
  maxCst: number      // @100°C 최대 (배타적)
  hint: string
}

/** SAE J300 (2015~) — 100°C 동점도 범위만 사용. W 등급은 -tt-low-temp 별도 */
export const SAE_GRADES: SaeGrade[] = [
  { grade: 'xW-8',  minCst: 4.0,  maxCst: 6.1,  hint: '신형 하이브리드·전기차 보조' },
  { grade: 'xW-12', minCst: 5.0,  maxCst: 7.1,  hint: '연비 우선 최신 엔진' },
  { grade: 'xW-16', minCst: 6.1,  maxCst: 8.2,  hint: '연비형 (도요타·혼다 최신)' },
  { grade: 'xW-20', minCst: 6.9,  maxCst: 9.3,  hint: '현대·기아·도요타 표준' },
  { grade: 'xW-30', minCst: 9.3,  maxCst: 12.5, hint: '범용 — 한국 다수 차량' },
  { grade: 'xW-40', minCst: 12.5, maxCst: 16.3, hint: '고성능·터보·고출력' },
  { grade: 'xW-50', minCst: 16.3, maxCst: 21.9, hint: '경주용·고온 환경' },
  { grade: 'xW-60', minCst: 21.9, maxCst: 26.1, hint: '레이싱 전용' },
]

/** cSt @100°C → 매칭되는 SAE 등급들 (범위가 겹치므로 여러 개).
 *  J300 규격 그대로 min 포함·max 배타(<) — ISO VG(양끝 포함)와 다른 것이 표준상 정상. */
export function matchSae(cst100: number): SaeGrade[] {
  return SAE_GRADES.filter((g) => cst100 >= g.minCst && cst100 < g.maxCst)
}

// ─── ISO VG (ISO 3448) — 산업용 윤활유 ─────────────────────
export interface IsoVg {
  vg: number       // 등급 번호 = 중심 cSt @40°C
  minCst: number   // @40°C 최소 (-10%)
  maxCst: number   // @40°C 최대 (+10%)
  use: string
}

/** ISO 3448 / DIN 51519 — 40°C 동점도 중심 ±10% */
export const ISO_VG: IsoVg[] = [
  { vg: 2,    minCst: 1.98,  maxCst: 2.42,  use: '냉동기·정밀계측기' },
  { vg: 3,    minCst: 2.88,  maxCst: 3.52,  use: '스핀들·고속 베어링' },
  { vg: 5,    minCst: 4.14,  maxCst: 5.06,  use: '스핀들오일' },
  { vg: 7,    minCst: 6.12,  maxCst: 7.48,  use: '경하중 베어링' },
  { vg: 10,   minCst: 9.00,  maxCst: 11.00, use: '재봉틀·정밀기계' },
  { vg: 15,   minCst: 13.5,  maxCst: 16.5,  use: '공기 압축기 일부' },
  { vg: 22,   minCst: 19.8,  maxCst: 24.2,  use: '경부하 유압' },
  { vg: 32,   minCst: 28.8,  maxCst: 35.2,  use: '유압유 표준 (실내)' },
  { vg: 46,   minCst: 41.4,  maxCst: 50.6,  use: '유압유 표준 (옥외)' },
  { vg: 68,   minCst: 61.2,  maxCst: 74.8,  use: '중부하 유압·기어' },
  { vg: 100,  minCst: 90.0,  maxCst: 110.0, use: '경기어·고온 베어링' },
  { vg: 150,  minCst: 135,   maxCst: 165,   use: '기어유 (소형)' },
  { vg: 220,  minCst: 198,   maxCst: 242,   use: '기어유 (중형)' },
  { vg: 320,  minCst: 288,   maxCst: 352,   use: '기어유 (대형·저속)' },
  { vg: 460,  minCst: 414,   maxCst: 506,   use: '고하중 기어·웜기어' },
  { vg: 680,  minCst: 612,   maxCst: 748,   use: '고하중 저속 기어' },
  { vg: 1000, minCst: 900,   maxCst: 1100,  use: '특수 고점도' },
  { vg: 1500, minCst: 1350,  maxCst: 1650,  use: '특수 고점도' },
]

/** cSt @40°C → 매칭되는 ISO VG. ISO 3448의 ±10% 허용역 그대로 양끝 포함(<=). */
export function matchIsoVg(cst40: number): IsoVg | null {
  return ISO_VG.find((v) => cst40 >= v.minCst && cst40 <= v.maxCst) ?? null
}

// ─── 일상 유체 점도 (참고) ──────────────────────────────────
export interface FluidRef {
  emoji: string
  name: string
  cp: string           // 절대점도 표기
  temp?: string
  note?: string
}

export const FLUID_REFS: FluidRef[] = [
  { emoji: '💨', name: '공기',              cp: '0.018 cP',   temp: '@20°C' },
  { emoji: '💧', name: '물',                cp: '1.0 cP',     temp: '@20°C', note: '점도 기준' },
  { emoji: '🥛', name: '우유',              cp: '2~3 cP',     temp: '@20°C' },
  { emoji: '🩸', name: '혈액',              cp: '3~4 cP',     temp: '@37°C' },
  { emoji: '🫒', name: '식용유 (올리브유)',  cp: '~80 cP',    temp: '@20°C' },
  { emoji: '🛢️', name: 'SAE 30 모터오일',  cp: '~250 cP',   temp: '@20°C', note: '~9.5 cSt @100°C' },
  { emoji: '🧴', name: '글리세린',          cp: '~1,400 cP', temp: '@20°C' },
  { emoji: '🍯', name: '꿀',                cp: '~10,000 cP', temp: '@20°C' },
  { emoji: '🥫', name: '케첩',              cp: '~50,000 cP', note: '비뉴턴 유체' },
  { emoji: '🥜', name: '땅콩버터',           cp: '~250,000 cP', note: '비뉴턴 유체' },
  { emoji: '🍡', name: 'Bitumen (역청)',     cp: '~10⁸ cP', temp: '실온', note: '도로 아스팔트 기준 — 피치 드롭 실험의 피치는 ~2.3×10¹¹ cP' },
]

// ─── 자동차 오일 가이드 ────────────────────────────────────
// grade는 배지에 그대로 표시 — 'SAE ' 접두를 코드에서 자동 부착하지 않는다
// (ATF·DOT은 SAE 점도 등급이 아니고, 기어유 75W-90 등은 J306 체계라 J300과 별개)
export interface OilGuide { type: string; sae: string; iso?: string; use: string }
export const OIL_GUIDES: OilGuide[] = [
  { type: '엔진오일',     sae: 'SAE xW-20 / xW-30',     use: '한국 일반 승용차 (현대·기아·도요타 매뉴얼 권장)' },
  { type: '엔진오일 (고성능)', sae: 'SAE xW-40 / xW-50', use: 'BMW M·메르세데스 AMG 등 고출력' },
  { type: '미션오일 (수동)', sae: 'SAE J306 75W-90 / 80W-90', iso: 'VG 100~150', use: 'GL-4 또는 GL-5 등급 확인' },
  { type: '미션오일 (자동, ATF)', sae: 'ATF (Dexron VI 등)', use: '제조사 지정 사용 — 호환 X 시 변속 손상 (SAE 점도 등급 아님)' },
  { type: '디퍼렌셜', sae: 'SAE J306 75W-90 / 85W-140',     iso: 'VG 150~220', use: 'LSD는 별도 첨가제' },
  { type: '브레이크액',   sae: 'DOT 3/4/5.1',       use: '비등점 기준. SAE 점도 등급 아님' },
  { type: '파워스티어링', sae: 'ATF 또는 전용액',     use: '제조사 매뉴얼 확인' },
  { type: '유압유 (산업)', sae: '—',                 iso: 'VG 32 / 46 / 68', use: '관행: 실내 32·옥외 46·중부하 68 — 장비 제조사 지정 우선' },
  { type: '기어유 (산업)', sae: '—',                 iso: 'VG 100~680', use: 'AGMA EP 등급 확인' },
]
