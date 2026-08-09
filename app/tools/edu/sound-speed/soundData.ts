// ─────────────────────────────────────────────
// 음속 계산기 데이터 · 계산 (순수 함수 — 노드 검산 가능)
//  ⚠️ 클라이언트에서 분리: 표시 포맷터가 클라이언트에 남으면 검산 사각지대가 된다
//     (fmtDist가 1,000km 단위를 "백만 km"라 적어 지구 둘레가 1000배 과장 — 만/억 클래스 재발).
// ─────────────────────────────────────────────

export const LIGHT_SPEED = 299_792_458 // m/s (정의값)

/** 공기 중 음속 근사(건조 공기 1기압): 331.3 + 0.606·T */
export function calcSoundSpeed(tempC: number): number {
  return 331.3 + 0.606 * tempC
}

// ─────────────────────────────────────────────
// 포맷터
// ─────────────────────────────────────────────
/** 거리 표기.
    ⚠️ 예전엔 1,000,000m(=1,000km) 이상을 m/10⁶ 값에 "백만 km"를 붙여
       지구 둘레 40,075km가 "40.08 백만 km"로 1000배 과장됐다 — km 콤마 표기로 통일. */
export function fmtDist(m: number): string {
  if (!Number.isFinite(m)) return '-'
  if (Math.abs(m) >= 1_000_000) return `${Math.round(m / 1000).toLocaleString()} km`
  if (Math.abs(m) >= 1000) return `${(m / 1000).toFixed(2)} km`
  return `${m.toFixed(1)} m`
}

export function fmtTime(s: number): string {
  if (!Number.isFinite(s)) return '-'
  if (s < 0.000001) return `${(s * 1e9).toFixed(2)} ns`
  if (s < 0.001) return `${(s * 1_000_000).toFixed(2)} µs`
  if (s < 1)     return `${(s * 1000).toFixed(2)} ms`
  if (s < 60)    return `${s.toFixed(2)}초`
  if (s < 3600)  return `${Math.floor(s / 60)}분 ${Math.round(s % 60)}초`
  if (s < 86400) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}시간 ${m}분`
  }
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  return `${d}일 ${h}시간`
}

// ─────────────────────────────────────────────
// 천둥 거리 — "안전 등급"은 두지 않는다.
//  ⚠️ 예전엔 30초를 "🟢 안전(10km+)"으로 표시했는데, 같은 화면의 30-30 안내
//     ("30초 이내면 대피")와 모순이었고, NWS 원칙은 "천둥이 들리면 거리와 무관하게
//     낙뢰 위험권(When Thunder Roars, Go Indoors)"이다. 거리는 정보로만 제공한다.
// ─────────────────────────────────────────────
export const THUNDER_WARNING = '천둥이 들리면 거리와 무관하게 낙뢰 위험권입니다 — 즉시 실내로 대피하세요'

// ─────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────
export const COMMON_DISTANCES = [
  { name: '교실 길이',    m: 10,         emoji: '🏫', meta: '10m' },
  { name: '100m 달리기',  m: 100,        emoji: '🏃', meta: '100m' },
  { name: '축구장 가로',  m: 105,        emoji: '⚽', meta: '105m' },
  { name: '63빌딩 높이',  m: 250,        emoji: '🏢', meta: '250m' },
  { name: '에펠탑 높이',  m: 330,        emoji: '🗼', meta: '330m' },
  { name: '롯데월드타워', m: 555,        emoji: '🏗️', meta: '555m' },
  { name: '한강대교 길이', m: 1_005,     emoji: '🌉', meta: '1km' },
  { name: '한라산 높이',  m: 1_947,      emoji: '⛰️', meta: '1.95km' },
  { name: '5km 마라톤',   m: 5_000,      emoji: '🏃‍♂️', meta: '5km' },
  { name: '서울→부산',    m: 325_000,    emoji: '🚄', meta: '325km' },
  { name: '한반도 남북',  m: 1_100_000,  emoji: '🗺️', meta: '1,100km' },
  { name: '지구 둘레',    m: 40_075_000, emoji: '🌍', meta: '40,075km' },
]

/** 거리 슬라이더(로그 스케일) 상한 — 지구 둘레(4.0075×10⁷m)까지.
    ⚠️ 예전엔 max=1000(=10¹⁰m=1천만 km)이라 힌트 "1m~40,000km"의 250배까지 열려 있었다. */
export const DIST_SLIDER_MAX = Math.ceil(Math.log10(40_075_000) * 100) // 761
export const DIST_MAX_M = 40_075_000

/** 공인 마하는 항공기가 실제 비행하는 고고도(성층권, 음속 ≈295m/s) 기준 —
    해수면 343m/s로 나누면 공인 수치와 어긋나므로 별도 열로 병기한다.
    ⚠️ "음속(1마하)" 행은 여기 두지 않는다 — 1,235km/h로 박제하면 온도 슬라이더를 옮겼을 때
       그 행의 마하가 1.00이 아니게 돼(−20°C에서 1.08) 이름과 값이 모순된다. 클라이언트가
       현재 온도의 음속으로 동적 삽입한다. */
export const VEHICLE_SPEEDS = [
  { name: '🚶 걸음',          kmh: 5,    isSuperSonic: false, officialMach: null as number | null },
  { name: '🚗 자동차 (시내)', kmh: 60,   isSuperSonic: false, officialMach: null },
  { name: '🛣️ 자동차 (고속)', kmh: 100,  isSuperSonic: false, officialMach: null },
  { name: '🚄 KTX',           kmh: 305,  isSuperSonic: false, officialMach: null },
  { name: '✈️ 여객기 (순항)',  kmh: 900,  isSuperSonic: false, officialMach: 0.85 },
  { name: '🛩️ F-16 (최고)',    kmh: 2120, isSuperSonic: true, officialMach: 2.0 },
  { name: '🛩️ F-15 (최고)',    kmh: 3000, isSuperSonic: true, officialMach: 2.5 },
  { name: '🛸 SR-71 (최고)',   kmh: 3530, isSuperSonic: true, officialMach: 3.3 },
]
/** 마하 표에서 음속 행을 끼울 위치(여객기 다음) */
export const MACH_ROW_INDEX = 5

export const MEDIUM_SPEEDS = [
  { medium: '진공',      speed: 0,      cls: 'mediumVacuum',  note: '소리 전달 불가' },
  { medium: '공기',      speed: 343,    cls: 'mediumAir',     note: '20°C 기준, 일반적' },
  { medium: '물',        speed: 1_482,  cls: 'mediumWater',   note: '공기의 약 4.3배' },
  { medium: '바닷물',    speed: 1_521,  cls: 'mediumWater',   note: '담수보다 약간 빠름 (20°C·염분 3.5%)' },
  { medium: '나무',      speed: 3_300,  cls: 'mediumWood',    note: '결 방향 기준 — 수종 따라 3,300~5,000, 결 직각은 1/5~1/3' },
  { medium: '벽돌',      speed: 3_650,  cls: 'mediumWood',    note: '공기의 약 10.6배' },
  { medium: '구리',      speed: 4_600,  cls: 'mediumMetal',   note: '공기의 약 13배' },
  { medium: '강철',      speed: 5_960,  cls: 'mediumMetal',   note: '공기의 약 17배' },
  /* ⚠️ 널리 인용되는 12,000 m/s는 횡파 대역 값 — 표의 다른 행은 전부 종파라 기준이 어긋난다.
     종파는 [100] 방향 17,520 m/s (McSkimin & Andreatch 1972, 방향 따라 ~18,600). */
  { medium: '다이아몬드', speed: 17_500, cls: 'mediumCrystal', note: '공기의 약 51배 — 통상 물질 중 최고 (종파 기준)' },
]

// ─────────────────────────────────────────────
// 에코 · RT60
// ─────────────────────────────────────────────
export type EchoCat = 'low' | 'mid' | 'high' | 'vhigh'
export function calcEcho(wallM: number, soundSpeed: number): { delayS: number; delayMs: number; cat: EchoCat } {
  const delayS = (wallM * 2) / soundSpeed
  let cat: EchoCat
  if (delayS < 0.05)     cat = 'low'
  else if (delayS < 0.1) cat = 'mid'
  else if (delayS < 1)   cat = 'high'
  else                   cat = 'vhigh'
  return { delayS, delayMs: delayS * 1000, cat }
}

// 잔향 시간 — 재질별 흡음률(500Hz 부근 단순화 값)
export const ABSORPTION = {
  wall: {
    concrete: 0.02,
    brick:    0.03,
    wood:     0.10,
    gypsum:   0.15,
    panel:    0.30,
  },
  floor: {
    concrete: 0.02,
    tile:     0.03,
    wood:     0.07,
    carpet:   0.30,
  },
  ceiling: {
    concrete: 0.02,
    gypsum:   0.10,
    panel:    0.40,
  },
} as const
export type WallMat = keyof typeof ABSORPTION.wall
export type FloorMat = keyof typeof ABSORPTION.floor
export type CeilMat = keyof typeof ABSORPTION.ceiling

/** Sabine: RT60 = 0.161·V/A (미터법). 공기 흡음·가구·청중 미반영 간이 추정.
    음수·비유한 치수는 0으로 정리한다(클라이언트 draft가 막아도 순수 함수 자체가 안전해야). */
export function calcRT60(wIn: number, dIn: number, hIn: number, wallMat: WallMat, floorMat: FloorMat, ceilMat: CeilMat) {
  const w = Number.isFinite(wIn) && wIn > 0 ? wIn : 0
  const d = Number.isFinite(dIn) && dIn > 0 ? dIn : 0
  const h = Number.isFinite(hIn) && hIn > 0 ? hIn : 0
  const V = w * d * h
  const wallArea = 2 * (w * h + d * h)
  const floorArea = w * d
  const ceilArea = w * d
  const A = wallArea * ABSORPTION.wall[wallMat]
          + floorArea * ABSORPTION.floor[floorMat]
          + ceilArea * ABSORPTION.ceiling[ceilMat]
  const rt60 = A > 0 ? 0.161 * V / A : 0
  return { V, A, rt60 }
}

/** 프리셋 — rt(전형값)를 대략 재현하도록 재질 조합까지 지정한다.
    ⚠️ 예전엔 프리셋이 치수만 채워서, "교실" 클릭 시 계산 1.2초 ↔ 같은 화면 참조표 0.6초가
       모순돼 보였다. 재질은 전형 잔향을 재현하는 등가 조합(실제 마감재와 다를 수 있음). */
export const ROOM_PRESETS: {
  name: string; rt: number; w: number; d: number; h: number
  wall: WallMat; floor: FloorMat; ceil: CeilMat
}[] = [
  { name: '작은 방',  rt: 0.4, w: 4,   d: 4,   h: 2.5, wall: 'gypsum', floor: 'carpet', ceil: 'panel' },
  { name: '교실',     rt: 0.6, w: 8,   d: 8,   h: 3,   wall: 'gypsum', floor: 'carpet', ceil: 'panel' },
  { name: '강당',     rt: 1.2, w: 20,  d: 20,  h: 8,   wall: 'panel',  floor: 'carpet', ceil: 'panel' },
  { name: '콘서트홀', rt: 1.8, w: 30,  d: 30,  h: 15,  wall: 'panel',  floor: 'carpet', ceil: 'panel' },
  { name: '대성당',   rt: 4.0, w: 50,  d: 50,  h: 25,  wall: 'wood',   floor: 'carpet', ceil: 'panel' },
  { name: '동굴',     rt: 8.0, w: 100, d: 100, h: 30,  wall: 'gypsum', floor: 'wood',   ceil: 'panel' },
]
