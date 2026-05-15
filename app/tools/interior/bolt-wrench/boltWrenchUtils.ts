/* 볼트 스패너 계산기 — 데이터·계산 유틸 */

export type BoltSize =
  | 'M3' | 'M4' | 'M5' | 'M6' | 'M8' | 'M10'
  | 'M12' | 'M14' | 'M16' | 'M18' | 'M20' | 'M22' | 'M24'

export type BoltType = 'hex' | 'socket' | 'button' | 'flat' | 'set'
export type Standard = 'iso' | 'jis'

export const BOLT_SIZES: BoltSize[] = [
  'M3', 'M4', 'M5', 'M6', 'M8', 'M10',
  'M12', 'M14', 'M16', 'M18', 'M20', 'M22', 'M24',
]

export interface BoltTypeInfo {
  id: BoltType
  emoji: string
  label: string
  desc: string
  toolType: 'spanner' | 'allen'
}

export const BOLT_TYPES: BoltTypeInfo[] = [
  { id: 'hex',    emoji: '🔩', label: '육각볼트',     desc: '외부 6각 머리. 스패너·소켓으로 조임.',       toolType: 'spanner' },
  { id: 'socket', emoji: '⚙️', label: '소켓캡(알렌)', desc: '내부 6각 홈. 알렌렌치(L자) 사용.',           toolType: 'allen'   },
  { id: 'button', emoji: '🔘', label: '버튼헤드',     desc: '둥글고 낮은 머리 + 내부 6각. 작은 알렌.',    toolType: 'allen'   },
  { id: 'flat',   emoji: '🔻', label: '플랫헤드',     desc: '접시머리 + 내부 6각. 면 일치 마감.',         toolType: 'allen'   },
  { id: 'set',    emoji: '➖', label: '무두볼트',     desc: '머리 없음(세트스크류). 매우 작은 알렌.',     toolType: 'allen'   },
]

/* ─────────────────────────────────────────────
   사이즈 데이터
   ───────────────────────────────────────────── */

export interface BoltData {
  /* 외부 6각 머리 대변 거리 (스패너 = 소켓 mm) */
  spannerISO: number      // ISO 4014/4017, DIN 933(신), KS B 1002 — 현행
  spannerJIS: number      // 옛 JIS B 1180 — 1990s 이전 일본·한국
  /* 내부 6각 (알렌렌치) — 머리 종류별로 다름 */
  allenSocket: number     // 소켓캡 (DIN 912 / ISO 4762)
  allenButton: number     // 버튼헤드 (ISO 7380)
  allenFlat: number       // 플랫헤드 (ISO 10642 / DIN 7991)
  allenSet: number        // 세트스크류 (DIN 913·914·915·916)
  /* 너트 높이 (mm) */
  nutStd: number          // 표준 6각 너트 (ISO 4032 / KS B 1012)
  nutThin: number         // 박형 너트 (ISO 4035)
  /* 평와셔 (KS B 1326 / ISO 7089) */
  washerInner: number     // d (내경)
  washerOuter: number     // D (외경)
  washerThick: number     // t (두께)
  /* 스프링와셔 (KS B 1324 / DIN 127) */
  springInner: number
  springOuter: number
  springThick: number
  /* 권장 관통홀 (mid clearance, KS B 1007) */
  clearanceHole: number
  /* 피치 (표준 거친나사) */
  pitchCoarse: number
  /* 참고 체결 토크 (Nm) — 표준 강도등급, 마찰계수 0.14 ISO 16047 일반치 */
  torque4_8: number
  torque8_8: number
  torque10_9: number
  torque12_9: number
}

export const BOLT_DATA: Record<BoltSize, BoltData> = {
  M3:  { spannerISO: 5.5, spannerJIS: 5.5, allenSocket: 2.5, allenButton: 2,   allenFlat: 2,   allenSet: 1.5, nutStd: 2.4,  nutThin: 1.8,  washerInner: 3.2,  washerOuter: 7,    washerThick: 0.5, springInner: 3.1,  springOuter: 5.6,  springThick: 0.8, clearanceHole: 3.4,  pitchCoarse: 0.5,  torque4_8: 0.6,   torque8_8: 1.2,    torque10_9: 1.7,   torque12_9: 2.0   },
  M4:  { spannerISO: 7,   spannerJIS: 7,   allenSocket: 3,   allenButton: 2.5, allenFlat: 2.5, allenSet: 2,   nutStd: 3.2,  nutThin: 2.2,  washerInner: 4.3,  washerOuter: 9,    washerThick: 0.8, springInner: 4.1,  springOuter: 7.6,  springThick: 0.9, clearanceHole: 4.5,  pitchCoarse: 0.7,  torque4_8: 1.4,   torque8_8: 2.9,    torque10_9: 4.0,   torque12_9: 4.8   },
  M5:  { spannerISO: 8,   spannerJIS: 8,   allenSocket: 4,   allenButton: 3,   allenFlat: 3,   allenSet: 2.5, nutStd: 4.0,  nutThin: 2.7,  washerInner: 5.3,  washerOuter: 10,   washerThick: 1.0, springInner: 5.1,  springOuter: 9.2,  springThick: 1.2, clearanceHole: 5.5,  pitchCoarse: 0.8,  torque4_8: 2.7,   torque8_8: 5.7,    torque10_9: 8.1,   torque12_9: 9.7   },
  M6:  { spannerISO: 10,  spannerJIS: 10,  allenSocket: 5,   allenButton: 4,   allenFlat: 4,   allenSet: 3,   nutStd: 5.0,  nutThin: 3.2,  washerInner: 6.4,  washerOuter: 12,   washerThick: 1.6, springInner: 6.1,  springOuter: 11.8, springThick: 1.6, clearanceHole: 6.6,  pitchCoarse: 1.0,  torque4_8: 4.6,   torque8_8: 9.8,    torque10_9: 14,    torque12_9: 17    },
  M8:  { spannerISO: 13,  spannerJIS: 12,  allenSocket: 6,   allenButton: 5,   allenFlat: 5,   allenSet: 4,   nutStd: 6.5,  nutThin: 4.0,  washerInner: 8.4,  washerOuter: 16,   washerThick: 1.6, springInner: 8.2,  springOuter: 14.8, springThick: 2.0, clearanceHole: 9,    pitchCoarse: 1.25, torque4_8: 11,    torque8_8: 24,     torque10_9: 33,    torque12_9: 40    },
  M10: { spannerISO: 17,  spannerJIS: 14,  allenSocket: 8,   allenButton: 6,   allenFlat: 6,   allenSet: 5,   nutStd: 8.0,  nutThin: 5.0,  washerInner: 10.5, washerOuter: 20,   washerThick: 2.0, springInner: 10.2, springOuter: 18.1, springThick: 2.2, clearanceHole: 11,   pitchCoarse: 1.5,  torque4_8: 23,    torque8_8: 47,     torque10_9: 65,    torque12_9: 79    },
  M12: { spannerISO: 19,  spannerJIS: 17,  allenSocket: 10,  allenButton: 8,   allenFlat: 8,   allenSet: 6,   nutStd: 10.0, nutThin: 6.0,  washerInner: 13,   washerOuter: 24,   washerThick: 2.5, springInner: 12.2, springOuter: 21.1, springThick: 2.5, clearanceHole: 13.5, pitchCoarse: 1.75, torque4_8: 39,    torque8_8: 81,     torque10_9: 114,   torque12_9: 136   },
  M14: { spannerISO: 22,  spannerJIS: 19,  allenSocket: 12,  allenButton: 10,  allenFlat: 10,  allenSet: 6,   nutStd: 11.0, nutThin: 7.0,  washerInner: 15,   washerOuter: 28,   washerThick: 2.5, springInner: 14.2, springOuter: 24.1, springThick: 3.0, clearanceHole: 15.5, pitchCoarse: 2.0,  torque4_8: 62,    torque8_8: 128,    torque10_9: 181,   torque12_9: 217   },
  M16: { spannerISO: 24,  spannerJIS: 24,  allenSocket: 14,  allenButton: 10,  allenFlat: 10,  allenSet: 8,   nutStd: 13.0, nutThin: 8.0,  washerInner: 17,   washerOuter: 30,   washerThick: 3.0, springInner: 16.2, springOuter: 27.4, springThick: 3.5, clearanceHole: 17.5, pitchCoarse: 2.0,  torque4_8: 96,    torque8_8: 197,    torque10_9: 277,   torque12_9: 333   },
  M18: { spannerISO: 27,  spannerJIS: 27,  allenSocket: 14,  allenButton: 12,  allenFlat: 12,  allenSet: 10,  nutStd: 15.0, nutThin: 9.0,  washerInner: 19,   washerOuter: 34,   washerThick: 3.0, springInner: 18.2, springOuter: 31.4, springThick: 4.0, clearanceHole: 20,   pitchCoarse: 2.5,  torque4_8: 132,   torque8_8: 273,    torque10_9: 384,   torque12_9: 461   },
  M20: { spannerISO: 30,  spannerJIS: 30,  allenSocket: 17,  allenButton: 14,  allenFlat: 12,  allenSet: 10,  nutStd: 16.0, nutThin: 10.0, washerInner: 21,   washerOuter: 37,   washerThick: 3.0, springInner: 20.2, springOuter: 33.6, springThick: 4.0, clearanceHole: 22,   pitchCoarse: 2.5,  torque4_8: 187,   torque8_8: 385,    torque10_9: 541,   torque12_9: 649   },
  M22: { spannerISO: 32,  spannerJIS: 32,  allenSocket: 17,  allenButton: 14,  allenFlat: 14,  allenSet: 12,  nutStd: 18.0, nutThin: 11.0, washerInner: 23,   washerOuter: 39,   washerThick: 3.0, springInner: 22.5, springOuter: 36.6, springThick: 4.5, clearanceHole: 24,   pitchCoarse: 2.5,  torque4_8: 256,   torque8_8: 528,    torque10_9: 743,   torque12_9: 891   },
  M24: { spannerISO: 36,  spannerJIS: 36,  allenSocket: 19,  allenButton: 14,  allenFlat: 14,  allenSet: 12,  nutStd: 19.0, nutThin: 12.0, washerInner: 25,   washerOuter: 44,   washerThick: 4.0, springInner: 24.5, springOuter: 40,   springThick: 5.0, clearanceHole: 26,   pitchCoarse: 3.0,  torque4_8: 325,   torque8_8: 666,    torque10_9: 940,   torque12_9: 1130  },
}

/* M27, M30 표 전용 */
export const BOLT_DATA_EXTRA = {
  M27: { spannerISO: 41, spannerJIS: 41, allenSocket: 19, nutStd: 22, washerInner: 28, washerOuter: 50, torque8_8: 981 },
  M30: { spannerISO: 46, spannerJIS: 46, allenSocket: 22, nutStd: 24, washerInner: 31, washerOuter: 56, torque8_8: 1330 },
}

/* ─────────────────────────────────────────────
   너트 종류별 정보
   ───────────────────────────────────────────── */

export interface NutTypeInfo {
  id: string
  emoji: string
  label: string
  std: string
  desc: string
  reuse: '재사용 가능' | '재사용 비권장' | '1회용 권장'
}

export const NUT_TYPES: NutTypeInfo[] = [
  { id: 'std',    emoji: '⬡', label: '일반 6각 너트',     std: 'KS B 1012 / ISO 4032', desc: '가장 표준적인 너트. 표준 높이.',                       reuse: '재사용 가능' },
  { id: 'thin',   emoji: '◇', label: '박형(薄形) 너트',    std: 'ISO 4035',             desc: '두께 절반. 공간 좁을 때, 록너트로 더블 너트 구성.',     reuse: '재사용 가능' },
  { id: 'flange', emoji: '🔘', label: '플랜지 너트',       std: 'KS B 1063 / DIN 6923', desc: '와셔 일체형. 진동 풀림 방지·접촉면 넓음.',              reuse: '재사용 가능' },
  { id: 'eye',    emoji: '👁️', label: '아이너트',          std: 'KS B 1336 / DIN 582',  desc: '리프팅 후크용. 인양·고정용.',                          reuse: '재사용 가능' },
  { id: 'cap',    emoji: '🎩', label: '캡(돔) 너트',       std: 'KS B 1015 / DIN 1587', desc: '나사산 노출 없는 마감용. 안전·미관.',                  reuse: '재사용 가능' },
  { id: 'nyloc',  emoji: '🟦', label: '나일론락 너트',     std: 'ISO 7040 / DIN 985',   desc: '나일론 인서트로 풀림 방지. 진동 환경에 강함.',         reuse: '재사용 비권장' },
  { id: 'wing',   emoji: '🦋', label: '윙(나비) 너트',     std: 'KS B 1014 / DIN 315',  desc: '손으로 조이는 너트. 자주 풀고 잠그는 곳.',             reuse: '재사용 가능' },
]

/* ─────────────────────────────────────────────
   와셔 종류별 정보
   ───────────────────────────────────────────── */

export interface WasherTypeInfo {
  id: string
  emoji: string
  label: string
  std: string
  desc: string
  use: string
}

export const WASHER_TYPES: WasherTypeInfo[] = [
  { id: 'flat',    emoji: '⚪', label: '평와셔',         std: 'KS B 1326 / ISO 7089', desc: '하중 분산. 모재 손상 방지.',                  use: '대부분의 일반 체결' },
  { id: 'spring',  emoji: '🌀', label: '스프링와셔',     std: 'KS B 1324 / DIN 127',  desc: '풀림 방지(축력 보강). 진동 약간.',            use: '진동 있는 곳·일반 풀림 방지' },
  { id: 'tooth',   emoji: '🔆', label: '이붙이와셔',     std: 'KS B 1325 / DIN 6797', desc: '톱니로 모재 파고들어 풀림 방지·접지.',        use: '전기 접지·풀림 강력 방지' },
  { id: 'belle',   emoji: '🔺', label: '접시(벨빌) 와셔', std: 'DIN 6796',             desc: '원뿔형. 강한 스프링력. 큰 진동·열변동.',      use: '고진동·열변동 환경' },
  { id: 'lock',    emoji: '🛑', label: '스토퍼(혀붙이) 와셔', std: 'DIN 463 / 93',     desc: '혀를 굽혀 너트 회전 봉쇄. 1회용.',            use: '풀림 절대 금지 안전부품' },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

export function getSpanner(size: BoltSize, std: Standard): number {
  return std === 'iso' ? BOLT_DATA[size].spannerISO : BOLT_DATA[size].spannerJIS
}

export function isStandardDifferent(size: BoltSize): boolean {
  return BOLT_DATA[size].spannerISO !== BOLT_DATA[size].spannerJIS
}

export function getAllen(size: BoltSize, type: BoltType): number | null {
  const d = BOLT_DATA[size]
  switch (type) {
    case 'socket': return d.allenSocket
    case 'button': return d.allenButton
    case 'flat':   return d.allenFlat
    case 'set':    return d.allenSet
    default: return null
  }
}

/* 역검색: 스패너 사이즈 → 가능한 (볼트, 규격) 후보 */
export interface ReverseHit {
  size: BoltSize
  std: Standard
  stdLabel: string
}

export function reverseLookupSpanner(spannerMm: number): ReverseHit[] {
  const hits: ReverseHit[] = []
  BOLT_SIZES.forEach((size) => {
    const d = BOLT_DATA[size]
    if (d.spannerISO === spannerMm) hits.push({ size, std: 'iso', stdLabel: 'ISO·DIN·KS' })
    if (d.spannerJIS === spannerMm && d.spannerJIS !== d.spannerISO) {
      hits.push({ size, std: 'jis', stdLabel: '옛 JIS' })
    }
  })
  return hits
}

/* 역검색: 알렌 사이즈 → 가능한 볼트 후보 (소켓캡 기준) */
export interface AllenHit {
  size: BoltSize
  boltType: BoltType
  typeLabel: string
}

export function reverseLookupAllen(allenMm: number): AllenHit[] {
  const hits: AllenHit[] = []
  BOLT_SIZES.forEach((size) => {
    const d = BOLT_DATA[size]
    if (d.allenSocket === allenMm) hits.push({ size, boltType: 'socket', typeLabel: '소켓캡' })
    if (d.allenButton === allenMm) hits.push({ size, boltType: 'button', typeLabel: '버튼헤드' })
    if (d.allenFlat === allenMm)   hits.push({ size, boltType: 'flat',   typeLabel: '플랫헤드' })
    if (d.allenSet === allenMm)    hits.push({ size, boltType: 'set',    typeLabel: '무두볼트' })
  })
  return hits
}

/* 인치 ↔ mm */
export const inchToMm = (inch: number) => inch * 25.4
export const mmToInch = (mm: number) => mm / 25.4

/* 자주 쓰는 인치 스패너 사이즈 */
export interface InchSpanner {
  fraction: string
  inch: number
  mm: number
}

export const INCH_SPANNERS: InchSpanner[] = [
  { fraction: '1/4″',  inch: 0.25,   mm: 6.35 },
  { fraction: '5/16″', inch: 0.3125, mm: 7.94 },
  { fraction: '3/8″',  inch: 0.375,  mm: 9.53 },
  { fraction: '7/16″', inch: 0.4375, mm: 11.11 },
  { fraction: '1/2″',  inch: 0.5,    mm: 12.7 },
  { fraction: '9/16″', inch: 0.5625, mm: 14.29 },
  { fraction: '5/8″',  inch: 0.625,  mm: 15.88 },
  { fraction: '11/16″',inch: 0.6875, mm: 17.46 },
  { fraction: '3/4″',  inch: 0.75,   mm: 19.05 },
  { fraction: '13/16″',inch: 0.8125, mm: 20.64 },
  { fraction: '7/8″',  inch: 0.875,  mm: 22.23 },
  { fraction: '15/16″',inch: 0.9375, mm: 23.81 },
  { fraction: '1″',    inch: 1.0,    mm: 25.4 },
]

/* 인치 스패너에 가장 가까운 mm 매칭 */
export function findClosestMetric(inchMm: number, tolMm = 0.6): { iso: BoltSize | null; jis: BoltSize | null } {
  let iso: BoltSize | null = null
  let jis: BoltSize | null = null
  let isoMin = Infinity
  let jisMin = Infinity
  BOLT_SIZES.forEach((s) => {
    const dIso = Math.abs(BOLT_DATA[s].spannerISO - inchMm)
    const dJis = Math.abs(BOLT_DATA[s].spannerJIS - inchMm)
    if (dIso < isoMin && dIso <= tolMm) { isoMin = dIso; iso = s }
    if (dJis < jisMin && dJis <= tolMm) { jisMin = dJis; jis = s }
  })
  return { iso, jis }
}

/* ─────────────────────────────────────────────
   공구 세트 프리셋
   ───────────────────────────────────────────── */

export interface ToolKit {
  id: string
  emoji: string
  label: string
  desc: string
  items: { type: string; sizes: string }[]
  budget: string
}

export const TOOL_KITS: ToolKit[] = [
  {
    id: 'bike',
    emoji: '🚲',
    label: '자전거 정비',
    desc: '로드·MTB·하이브리드 가정 정비. 알렌이 핵심.',
    items: [
      { type: '알렌렌치 (L자)', sizes: '2 / 2.5 / 3 / 4 / 5 / 6 / 8 mm' },
      { type: '스패너 (콤비)',   sizes: '8 / 10 / 13 / 15 mm (페달용 15)' },
      { type: '특수 공구',       sizes: '체인커터·BB공구·카세트 락링' },
      { type: '토크렌치',         sizes: '2~25 Nm (카본 시트포스트·스템)' },
    ],
    budget: '5~15만원',
  },
  {
    id: 'diy',
    emoji: '🪑',
    label: '가구·DIY',
    desc: '이케아·한샘 조립, 선반·문 경첩, 일반 집수리.',
    items: [
      { type: '알렌렌치',   sizes: '3 / 4 / 5 / 6 mm (이케아 표준)' },
      { type: '스패너',     sizes: '10 / 13 / 14 / 17 mm' },
      { type: '드라이버',   sizes: '+1 / +2 / +3, -3 / -6' },
      { type: '몽키스패너', sizes: '0~30mm 1개 (예비용)' },
    ],
    budget: '2~5만원',
  },
  {
    id: 'car',
    emoji: '🚗',
    label: '자동차 가정 정비',
    desc: '오일·필터·등화·휠 교환, 일반 점검.',
    items: [
      { type: '소켓 (3/8″)',     sizes: '8 / 10 / 12 / 13 / 14 / 17 / 19 / 21 / 22 mm 풀세트' },
      { type: '콤비 스패너',      sizes: '8 / 10 / 12 / 13 / 14 / 17 / 19 mm' },
      { type: '토크렌치',         sizes: '20~110 Nm (1/2″, 휠너트는 차종 매뉴얼)' },
      { type: '알렌·트로크',      sizes: '4 / 5 / 6 / 8 mm + T20 / T25 / T30' },
      { type: '잭·잭스탠드',      sizes: '2톤 이상 (안전 필수)' },
    ],
    budget: '15~40만원',
  },
  {
    id: 'industrial',
    emoji: '🏭',
    label: '산업·기계 정비',
    desc: '공장·플랜트·중장비 작업. 임팩트·고토크 필수.',
    items: [
      { type: '소켓 (1/2″)',     sizes: '6~32 mm 풀세트 (8·10·13·17·19·22·24·27·30·32)' },
      { type: '임팩트 소켓',      sizes: '검정색 임팩트용 (얇은 크롬 소켓 깨짐)' },
      { type: '대형 토크렌치',    sizes: '100~500 Nm + 1″ 핸들' },
      { type: '슬러그 스패너',    sizes: '24~50 mm (해머로 두드리는 형식)' },
      { type: '에어 임팩트',      sizes: '1/2″ ~ 1″ (현장 표준)' },
    ],
    budget: '50~200만원',
  },
]

/* 강도 등급 설명 */
export interface GradeInfo {
  grade: string
  tensile: string
  yield: string
  use: string
  color: string
}

export const GRADE_INFO: GradeInfo[] = [
  { grade: '4.8',  tensile: '400 MPa', yield: '320 MPa', use: '일반 강·가구·전기',           color: '#9B9B9B' },
  { grade: '8.8',  tensile: '800 MPa', yield: '640 MPa', use: '범용 기계·자동차 일반부',     color: '#3EFFD0' },
  { grade: '10.9', tensile: '1000 MPa',yield: '900 MPa', use: '엔진·서스펜션·구조물',         color: '#FFB83E' },
  { grade: '12.9', tensile: '1200 MPa',yield: '1080 MPa',use: '고강도 구조·항공·공구',        color: '#FF3E8C' },
]

/* 숫자 포맷 */
export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
