/* 카메라 화각 (35mm 환산) — 데이터·계산 유틸 */

export type SensorId = 'ff' | 'apsc15' | 'apsc16' | 'm43' | 'inch1' | 'inch_2_3' | 'phone'

/* ─────────────────────────────────────────────
   센서 사양 (실제 mm)
   diagonal = sqrt(width² + height²)
   cropFactor = 43.27 / diagonal (35mm 풀프레임 대각선 기준)
   ───────────────────────────────────────────── */
export interface SensorMeta {
  id: SensorId
  label: string
  width: number     // mm
  height: number    // mm
  diagonal: number  // mm (계산 보존)
  cropFactor: number
  example: string
}

export const SENSORS: SensorMeta[] = [
  { id: 'ff',       label: '풀프레임 (Full Frame)',  width: 36.0, height: 24.0, diagonal: 43.27, cropFactor: 1.0,  example: '소니 A7 시리즈·캐논 R5/R6·니콘 Z6/Z7·라이카 SL' },
  { id: 'apsc15',   label: 'APS-C (Sony·Nikon·Fuji)', width: 23.6, height: 15.6, diagonal: 28.30, cropFactor: 1.5,  example: '소니 a6700·니콘 Z fc·후지 X-T5·X-H2' },
  { id: 'apsc16',   label: 'APS-C (Canon)',           width: 22.3, height: 14.9, diagonal: 26.82, cropFactor: 1.6,  example: '캐논 R7·R10·R50·R100·M50' },
  { id: 'm43',      label: 'M4/3 (Olympus·Panasonic)', width: 17.3, height: 13.0, diagonal: 21.64, cropFactor: 2.0,  example: 'OM-1·OM-5·파나 GH6·GH7' },
  { id: 'inch1',    label: '1인치 (1")',              width: 13.2, height: 8.8,  diagonal: 15.86, cropFactor: 2.73, example: '소니 RX100·캐논 G7X·DJI 매빅 3' },
  { id: 'inch_2_3', label: '2/3" (하이엔드 컴팩트)',  width: 8.8,  height: 6.6,  diagonal: 11.00, cropFactor: 3.93, example: '소니 RX0·DSC-V 시리즈' },
  { id: 'phone',    label: '스마트폰 메인 (1/1.7")',  width: 7.53, height: 5.64, diagonal: 9.41,  cropFactor: 4.60, example: '아이폰 15 Pro·갤럭시 S24 Ultra (메인 센서, 모델별 차이)' },
]

export const getSensor = (id: SensorId) => SENSORS.find((s) => s.id === id) ?? SENSORS[0]

/* ─────────────────────────────────────────────
   인기 35mm 환산 초점거리 (비교·시각화용)
   ───────────────────────────────────────────── */
export interface FocalPreset {
  fl: number        // 35mm equivalent
  label: string
  category: string
  color: string
}

export const POPULAR_FOCALS: FocalPreset[] = [
  { fl: 14,  label: '14mm', category: '초광각',  color: '#FF3E8C' },
  { fl: 24,  label: '24mm', category: '광각',    color: '#FF8C3E' },
  { fl: 35,  label: '35mm', category: '광각',    color: '#FFB83E' },
  { fl: 50,  label: '50mm', category: '표준',    color: '#3EFFD0' },
  { fl: 85,  label: '85mm', category: '단망원',  color: '#3EC8FF' },
  { fl: 135, label: '135mm', category: '망원',   color: '#9B59B6' },
  { fl: 200, label: '200mm', category: '망원',   color: '#C485E0' },
  { fl: 400, label: '400mm', category: '초망원', color: '#FF3E8C' },
]

/* ─────────────────────────────────────────────
   렌즈 카테고리 (35mm 환산 기준)
   ───────────────────────────────────────────── */
export interface LensCategory {
  range: [number, number]   // 35mm 환산 범위
  name: string
  emoji: string
  use: string
  examples: string
}

export const LENS_CATEGORIES: LensCategory[] = [
  { range: [0, 16],     name: '초광각/어안',  emoji: '🌌', use: '실내·인테리어·드라마틱 풍경·VR',          examples: '시그마 14mm f/1.8 · 캐논 RF 11-24mm' },
  { range: [16, 35],    name: '광각',         emoji: '🏞️', use: '풍경·여행·건축·환경 인물',                examples: '24-70mm f/2.8 · 시그마 24mm f/1.4' },
  { range: [35, 60],    name: '준광각·표준',  emoji: '🚶', use: '스트리트·다큐·일상·환경 인물',           examples: '35mm f/1.4 · 50mm f/1.8 (인생 렌즈)' },
  { range: [60, 105],   name: '단망원·인물',  emoji: '👤', use: '인물·웨딩·제품',                        examples: '85mm f/1.4 · 시그마 85mm Art' },
  { range: [105, 200],  name: '중망원',       emoji: '🎤', use: '인물 압축·실내 스포츠·이벤트',           examples: '70-200mm f/2.8 · 135mm f/1.8' },
  { range: [200, 400],  name: '망원',         emoji: '⚽', use: '야외 스포츠·항공·새 사진',               examples: '300mm f/4 · 100-400mm 줌' },
  { range: [400, 1200], name: '초망원',       emoji: '🦒', use: '야생·달·천체 사진·스포츠 사이드라인',    examples: '600mm f/4 · 시그마 150-600mm' },
]

export function getLensCategory(fl35: number): LensCategory {
  return LENS_CATEGORIES.find((c) => fl35 >= c.range[0] && fl35 < c.range[1]) ?? LENS_CATEGORIES[LENS_CATEGORIES.length - 1]
}

/* ─────────────────────────────────────────────
   용도별 추천 (35mm 환산 권장 초점거리)
   ───────────────────────────────────────────── */
export interface UseCase {
  id: string
  emoji: string
  name: string
  recommended: number[]    // 35mm 환산 mm
  primary: number          // 가장 일반적 추천
  tip: string
}

export const USE_CASES: UseCase[] = [
  { id: 'landscape', emoji: '🏞️', name: '풍경',      recommended: [14, 16, 24, 35],  primary: 24,  tip: '광활함은 14-24mm, 정돈된 풍경은 35mm. 조리개 f/8~11이 화질·심도 균형 최적.' },
  { id: 'portrait',  emoji: '👤', name: '인물',      recommended: [35, 50, 85, 135], primary: 85,  tip: '85mm가 인물 표준(자연스러운 압축감). 35mm는 환경 인물, 135mm는 더 강한 압축.' },
  { id: 'street',    emoji: '🚶', name: '스트리트',  recommended: [28, 35, 50],      primary: 35,  tip: '35mm가 스트리트 사진의 정석(Henri Cartier-Bresson 50mm 위주). 작고 가벼운 단렌즈 권장.' },
  { id: 'sports',    emoji: '⚽', name: '스포츠',    recommended: [70, 200, 300, 400], primary: 200, tip: '실내·근거리 70-200mm. 야외 축구·야구는 300mm 이상, 골프는 400mm 권장.' },
  { id: 'wildlife',  emoji: '🦁', name: '야생·새',   recommended: [400, 500, 600, 800], primary: 600, tip: '거리 확보 어려워 600mm 이상 권장. 새 사진은 400mm + 1.4× 텔레컨버터로 비용 절약.' },
  { id: 'macro',     emoji: '🐝', name: '매크로',    recommended: [60, 100, 150, 180], primary: 100, tip: '100mm가 표준 매크로. 곤충은 150-180mm로 작업거리 확보. 1:1 배율 가능 렌즈 필수.' },
  { id: 'event',     emoji: '🎤', name: '이벤트·웨딩', recommended: [24, 35, 70, 85], primary: 50,  tip: '24-70mm + 70-200mm 콤보가 표준. 좁은 공간엔 35mm, 신랑신부 클로즈업 85mm.' },
  { id: 'astro',     emoji: '⭐', name: '별·은하수',  recommended: [14, 20, 24],       primary: 20,  tip: '14-24mm + 조리개 f/2.8 이상. 500룰(셔터 = 500/초점거리)로 별 흐림 방지.' },
  { id: 'product',   emoji: '🛍️', name: '제품·음식', recommended: [50, 85, 100],      primary: 85,  tip: '85mm가 자연스러운 원근감. 매크로 90-105mm로 1:1 디테일 가능.' },
  { id: 'vlog',      emoji: '🎥', name: '브이로그·셀프', recommended: [16, 20, 24, 35], primary: 24, tip: '셀프촬영 거리(50cm~1m)에서 얼굴 + 배경이 들어와야 → 16-24mm 환산. 풀프레임 24mm = APS-C 16mm.' },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

/** 35mm 환산 초점거리 */
export function equiv35(focalLength: number, sensor: SensorMeta): number {
  return focalLength * sensor.cropFactor
}

/** 화각(°) — 한 변(width/height/diagonal) 기준 */
export function aov(sensorDim: number, focalLength: number): number {
  return 2 * Math.atan(sensorDim / (2 * focalLength)) * 180 / Math.PI
}

/** 거리 D에서 시야 너비/높이 (입력·출력 동일 단위) */
export function frameSize(distance: number, sensorDim: number, focalLength: number): number {
  return (distance * sensorDim) / focalLength
}

/** 등가 조리개 (심도 환산) — N_equiv = N × 크롭 팩터 */
export function equivAperture(aperture: number, cropFactor: number): number {
  return aperture * cropFactor
}

/** 500룰 — 별 점광원 유지 최대 셔터 (s) */
export function rule500(focalLength35: number): number {
  return 500 / focalLength35
}

/** NPF룰 (정밀) — k×35 + (P × N) / f, P=픽셀피치 µm, N=조리개. 기본 단순화 */
export function rule300(focalLength35: number): number {
  return 300 / focalLength35
}

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */
export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmtInt = (n: number) =>
  Math.round(n).toLocaleString('ko-KR')

/** 거리·길이 자동 단위 (m / cm) */
export function fmtDistance(meters: number): string {
  if (meters >= 1) return `${fmt(meters, meters >= 10 ? 1 : 2)} m`
  return `${fmt(meters * 100, 1)} cm`
}

/** 화각 → 텍스트 분류 */
export function aovDescription(aovDeg: number): string {
  if (aovDeg >= 100) return '초광각 — 왜곡 큼, 광활한 인상'
  if (aovDeg >= 75)  return '광각 — 풍경·실내·스트리트'
  if (aovDeg >= 45)  return '준광각 — 자연스러운 시야'
  if (aovDeg >= 35)  return '표준 — 사람 눈에 가까운 화각'
  if (aovDeg >= 18)  return '단망원 — 인물·압축감'
  if (aovDeg >= 10)  return '망원 — 스포츠·이벤트·압축'
  if (aovDeg >= 5)   return '초망원 — 야생·항공·달'
  return '극초망원 — 천체·사이드라인 스포츠'
}
