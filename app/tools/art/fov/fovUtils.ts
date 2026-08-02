/* 카메라 화각 계산기 — 데이터·계산 유틸 */

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

/* ⚠️ cropFactor는 **제조사 표기 관행값**이고, 대각선에서 기하학적으로 계산한 값과 다르다.
      (소니·니콘 공식 ×1.5 / 후지 렌즈 표기 ×1.52 / 캐논 공식 ×1.6 — 실제 계산은 1.53·1.61)
      그래서 화각(치수 기반)과 35mm 환산(크롭 기반)이 최대 2%가량 어긋난다.
      geoCrop에 계산값을 따로 두고 화면에서 둘을 구분해 보여준다.
   ⚠️ APS-C 치수는 기종마다 갈린다 — 소니 a6700 23.3×15.5 / 니콘 Z fc·후지 X-T5 23.5×15.7 /
      후지 X-H2 23.5×15.6. 옛 값 23.6×15.6은 니콘 DSLR 세대 표기라 예시 기종 어느 것과도 안 맞았다. */
export const SENSORS: SensorMeta[] = [
  { id: 'ff',       label: '풀프레임 (Full Frame)',  width: 36.0, height: 24.0, diagonal: 43.27, cropFactor: 1.0,  example: '소니 A7 시리즈·캐논 R5/R6·니콘 Z6III/Z8·라이카 SL' },
  { id: 'apsc15',   label: 'APS-C (Sony·Nikon·Fuji)', width: 23.5, height: 15.6, diagonal: 28.20, cropFactor: 1.5,  example: '소니 a6700(23.3×15.5)·니콘 Z fc·후지 X-T5(23.5×15.7)·X-H2 — 기종별 ±0.2mm' },
  { id: 'apsc16',   label: 'APS-C (Canon)',           width: 22.3, height: 14.9, diagonal: 26.82, cropFactor: 1.6,  example: '캐논 R10·R50·R100·M50 (R7만 22.3×14.8)' },
  { id: 'm43',      label: 'M4/3 (OM SYSTEM·Panasonic)', width: 17.3, height: 13.0, diagonal: 21.64, cropFactor: 2.0,  example: 'OM SYSTEM OM-1·OM-5·파나 GH6/GH7·DJI 매빅 3 (4/3 CMOS)' },
  { id: 'inch1',    label: '1형 (1인치)',             width: 13.2, height: 8.8,  diagonal: 15.86, cropFactor: 2.73, example: '소니 RX100 시리즈·캐논 G7 X·DJI 에어 3S (실 대각선 15.86mm)' },
  { id: 'inch_2_3', label: '2/3형 (하이엔드 컴팩트)', width: 8.8,  height: 6.6,  diagonal: 11.00, cropFactor: 3.93, example: '후지필름 X30·X20·X10·소니 DSC-F828' },
  { id: 'phone',    label: '스마트폰 메인 (1/1.3형)', width: 9.84, height: 7.38, diagonal: 12.30, cropFactor: 3.52, example: '아이폰 15 Pro(1/1.28형)·갤럭시 S24 Ultra(ISOCELL HP2, 1/1.3형) — 기종별 차이 큼' },
]

/** 대각선에서 계산한 기하학적 크롭 팩터 (35mm 대각 43.2666mm 기준) */
export const FF_DIAGONAL = Math.sqrt(36 * 36 + 24 * 24)
export const geoCrop = (sensor: SensorMeta) => FF_DIAGONAL / sensor.diagonal

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

/* 색은 디자인 토큰만 사용한다(막대·점 등 비텍스트 용도). */
export const POPULAR_FOCALS: FocalPreset[] = [
  { fl: 14,  label: '14mm', category: '초광각',  color: 'var(--cat-date)' },
  { fl: 24,  label: '24mm', category: '초광각',  color: 'var(--cat-life)' },
  { fl: 35,  label: '35mm', category: '광각',    color: 'var(--cat-cooking)' },
  { fl: 50,  label: '50mm', category: '표준',    color: 'var(--cat-edu)' },
  { fl: 85,  label: '85mm', category: '단망원',  color: 'var(--cat-health)' },
  { fl: 135, label: '135mm', category: '중망원', color: 'var(--cat-unit)' },
  { fl: 200, label: '200mm', category: '망원',   color: 'var(--cat-art)' },
  { fl: 400, label: '400mm', category: '초망원', color: 'var(--cat-finance)' },
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

/* ⚠️ 이 분류에는 표준 제정기관 규정이 없다 — 제조사 관행을 따랐다.
      초광각 경계는 캐논·리코펜탁스가 모두 24mm를 쓰므로 24mm로 잡았다(옛 16mm는 자체 기준).
      망원 경계 135mm도 캐논·리코 공통이다.
   ⚠️ **어안은 초점거리가 아니라 사영 방식(projection)으로 구분된다.** 같은 15mm라도
      어안은 180°, 직선사영 초광각은 약 110°로 70도 가까이 벌어진다. 그래서 이 표에서
      어안을 빼고 별도 경고로 다룬다 — 이 도구의 화각 공식은 직선사영 전용이다. */
export const LENS_CATEGORIES: LensCategory[] = [
  { range: [0, 24],     name: '초광각',       emoji: '🌌', use: '실내·인테리어·드라마틱 풍경·별',         examples: '시그마 14mm f/1.8 · 캐논 RF 11-24mm (어안 제외)' },
  { range: [24, 35],    name: '광각',         emoji: '🏞️', use: '풍경·여행·건축·환경 인물',                examples: '24-70mm f/2.8 · 시그마 24mm f/1.4' },
  { range: [35, 60],    name: '준광각·표준',  emoji: '🚶', use: '스트리트·다큐·일상·환경 인물',           examples: '35mm f/1.4 · 50mm f/1.8 (인생 렌즈)' },
  { range: [60, 135],   name: '단망원·인물',  emoji: '👤', use: '인물·웨딩·제품',                        examples: '85mm f/1.4 · 시그마 85mm Art' },
  { range: [135, 200],  name: '중망원',       emoji: '🎤', use: '인물 압축·실내 스포츠·이벤트',           examples: '70-200mm f/2.8 · 135mm f/1.8' },
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
  { id: 'street',    emoji: '🚶', name: '스트리트',  recommended: [28, 35, 50],      primary: 35,  tip: '35mm와 50mm가 양대 선택지 — 35mm는 배경을 더 담고, 50mm는 피사체에 집중합니다(카르티에브레송은 50mm를 주로 썼습니다). 작고 가벼운 단렌즈 권장.' },
  { id: 'sports',    emoji: '⚽', name: '스포츠',    recommended: [70, 200, 300, 400], primary: 200, tip: '실내·근거리 70-200mm. 야외 축구·야구는 300mm 이상, 골프는 400mm 권장.' },
  { id: 'wildlife',  emoji: '🦁', name: '야생·새',   recommended: [400, 500, 600, 800], primary: 600, tip: '거리 확보가 어려워 600mm 이상 권장. 400mm + 1.4× 텔레컨버터는 560mm가 되고 조리개가 정확히 1스톱 어두워집니다(f/5.6 → f/8).' },
  { id: 'macro',     emoji: '🐝', name: '매크로',    recommended: [60, 100, 150, 180], primary: 100, tip: '100mm가 표준 매크로. 곤충은 150-180mm로 작업거리 확보. 1:1 배율 가능 렌즈 필수.' },
  { id: 'event',     emoji: '🎤', name: '이벤트·웨딩', recommended: [24, 35, 50, 70, 85], primary: 50,  tip: '24-70mm + 70-200mm 콤보가 표준. 좁은 공간엔 35mm, 신랑신부 클로즈업 85mm.' },
  { id: 'astro',     emoji: '⭐', name: '별·은하수',  recommended: [14, 20, 24],       primary: 20,  tip: '14-24mm + 조리개 f/2.8 이상. 500룰은 셔터 = 500 ÷ **35mm 환산** 초점거리입니다(크롭 바디는 환산값을 쓰지 않으면 별이 늘어납니다).' },
  { id: 'product',   emoji: '🛍️', name: '제품·음식', recommended: [50, 85, 100],      primary: 85,  tip: '85mm가 자연스러운 원근감. 매크로 90-105mm로 1:1 디테일 가능.' },
  { id: 'vlog',      emoji: '🎥', name: '브이로그·셀프', recommended: [16, 20, 24, 35], primary: 24, tip: '팔 길이(약 50cm)에서 24mm 환산이면 가로 75cm가 담겨 얼굴+어깨가 적당합니다. 거리가 1m로 멀어지면 같은 프레이밍에 35~50mm가 맞습니다. 풀프레임 24mm = APS-C 16mm.' },
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

/** 300룰 — 500룰의 보수적 변형. 고화소 센서에서 500룰이 너무 길게 나올 때 쓴다.
    ⚠️ 예전 주석은 이 함수를 'NPF룰'이라 적었지만 NPF는 별개 공식이다.
       NPF 간단식은 t = (35N + 30p) / f (N=조리개 f수, p=픽셀 피치 µm, f=초점거리 mm)이고
       픽셀 피치에 포맷이 반영돼 있어 크롭 팩터를 따로 곱하면 안 된다. */
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
/**
 * 대각 화각 기준 분류.
 * ⚠️ 예전 임계값은 수평 화각용이었는데 호출부가 대각 화각을 넘겨, 풀프레임 50mm(대각 46.8°)가
 *    '준광각'으로 분류됐다 — 같은 사이트 본문이 50mm를 '표준'이라 부르는 것과 모순이었다.
 *    캐논은 표준 렌즈 화각을 40~60°(일본 캐논 '46도 전후'), 니콘도 '대각 46도'라 규정하므로
 *    표준 밴드를 40~60°로 잡는다.
 * ⚠️ '사람 눈에 가까운 화각'이라는 서술은 근거가 없어 뺐다 — 사람 수평 시야는 단안 약 160°,
 *    양안 약 200°다. 50mm가 표준인 실제 이유는 초점거리가 화면 대각선(풀프레임 43.3mm)에
 *    가깝기 때문이다.
 */
export function aovDescription(aovDeg: number): string {
  if (aovDeg >= 100) return '초광각 — 왜곡 큼, 광활한 인상'
  if (aovDeg >= 75)  return '광각 — 풍경·실내·스트리트'
  if (aovDeg >= 60)  return '준광각 — 넓은 일상 화각'
  if (aovDeg >= 40)  return '표준 — 화면 대각선과 비슷한 초점거리'
  if (aovDeg >= 18)  return '단망원 — 인물·압축감'
  if (aovDeg >= 10)  return '망원 — 스포츠·이벤트·압축'
  if (aovDeg >= 5)   return '초망원 — 야생·항공·달'
  return '극초망원 — 천체·사이드라인 스포츠'
}

/** 저장값 복원용 — 유한한 양수이고 범위 안인지 */
export function safeNum(v: unknown, min: number, max: number): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null
}
