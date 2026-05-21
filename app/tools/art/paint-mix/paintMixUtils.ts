/* 물감 혼합 계산기 — 데이터·계산 유틸 */

export type MixModel = 'subtractive' | 'additive' | 'ryb'
export type PaletteId = 'school12' | 'pro24' | 'ink' | 'food'
export type VolumeUnit = 'ml' | 'g' | 'tbsp' | 'tsp' | 'drop'

export interface PaintColor {
  name: string
  hex: string
  note?: string
}

/* ─────────────────────────────────────────────
   학교 미술 12색 (대한민국 교육과정 표준 색상)
   ───────────────────────────────────────────── */
export const SCHOOL_12: PaintColor[] = [
  { name: '흰색',   hex: '#FFFFFF' },
  { name: '검정',   hex: '#000000' },
  { name: '빨강',   hex: '#E63946' },
  { name: '주황',   hex: '#F4A261' },
  { name: '노랑',   hex: '#F9DC5C' },
  { name: '연두',   hex: '#90BE6D' },
  { name: '초록',   hex: '#2A9D8F' },
  { name: '하늘',   hex: '#7CC6E8' },
  { name: '파랑',   hex: '#264E86' },
  { name: '보라',   hex: '#8E44AD' },
  { name: '분홍',   hex: '#F49AC2' },
  { name: '갈색',   hex: '#8B5A2B' },
]

/* ─────────────────────────────────────────────
   전문가 24색 (신한 SWC·홀베인 풍 표준 라인업)
   ───────────────────────────────────────────── */
export const PRO_24: PaintColor[] = [
  { name: '티타늄 화이트',     hex: '#F8F8F4', note: '베이스 화이트' },
  { name: '아이보리 블랙',      hex: '#1F1F1D', note: '따뜻한 블랙' },
  { name: '카드뮴 옐로우 라이트', hex: '#FFE43A', note: '레몬 옐로우' },
  { name: '카드뮴 옐로우',      hex: '#FFC83A' },
  { name: '옐로우 오커',        hex: '#D8A24A' },
  { name: '로 시에나',          hex: '#A86B3D' },
  { name: '번트 시에나',        hex: '#8E4127' },
  { name: '번트 엄버',          hex: '#5B3220' },
  { name: '카드뮴 오렌지',      hex: '#F26B1F' },
  { name: '카드뮴 레드 라이트', hex: '#E63946' },
  { name: '카드뮴 레드 딥',     hex: '#B0241B' },
  { name: '알리자린 크림슨',    hex: '#7B1B2C' },
  { name: '퍼머넌트 로즈',      hex: '#C7325A' },
  { name: '퀴나크리돈 마젠타',  hex: '#A02060' },
  { name: '디옥사진 바이올렛',  hex: '#4F2C6C' },
  { name: '울트라마린 블루',    hex: '#264E86' },
  { name: '코발트 블루',        hex: '#1F4E9C' },
  { name: '세룰리안 블루',      hex: '#3A8FCD' },
  { name: '프탈로 블루',        hex: '#0E3A6E' },
  { name: '비리디안',           hex: '#1A6F5C' },
  { name: '프탈로 그린',        hex: '#0E5C4D' },
  { name: '샙 그린',            hex: '#3F6E2A' },
  { name: '페인스 그레이',      hex: '#36474F' },
  { name: '인디고',             hex: '#1B2A50' },
]

/* ─────────────────────────────────────────────
   만년필·캘리그래피 잉크 10종
   ───────────────────────────────────────────── */
export const INK_BRANDS: PaintColor[] = [
  { name: 'Diamine Sherwood Green',   hex: '#1F5C3A', note: '다이아민 셔우드 그린' },
  { name: 'Diamine Oxblood',          hex: '#5C1A1B', note: '다이아민 옥스블러드 (자주빛 와인)' },
  { name: 'Diamine Tropical Glow',    hex: '#FF6F3C', note: '다이아민 트로피컬 글로우' },
  { name: 'Sailor Yama-dori',         hex: '#1A5572', note: '세일러 야마도리 (청록)' },
  { name: 'Sailor Sei-boku',          hex: '#0E2A4A', note: '세일러 세이보쿠 (피그먼트 블루블랙)' },
  { name: 'Pilot Iroshizuku Tsuyu-kusa', hex: '#1F66B0', note: '파일럿 츠유쿠사 (이슬풀 블루)' },
  { name: 'Pilot Iroshizuku Yama-budo',  hex: '#7E2C50', note: '파일럿 야마부도 (산포도)' },
  { name: 'Lamy Crystal Topaz',       hex: '#2F8FBF', note: '라미 토파즈' },
  { name: 'Pelikan 4001 Brilliant Black', hex: '#15161B', note: '펠리칸 4001 블랙' },
  { name: 'Noodler\'s Apache Sunset', hex: '#E8852E', note: '누들러스 아파치 선셋' },
]

/* ─────────────────────────────────────────────
   베이킹·디저트 푸드컬러 8종 (식약처 허가 식용 색소 기준)
   ───────────────────────────────────────────── */
export const FOOD_COLORS: PaintColor[] = [
  { name: '레드 (적색 102호)',  hex: '#E22D2D', note: '딸기·체리·산타 토핑' },
  { name: '핑크',               hex: '#F58CA0', note: '러블리 디저트' },
  { name: '오렌지',             hex: '#F08D2A', note: '핼러윈·당근' },
  { name: '옐로우 (황색 5호)',  hex: '#F7D029', note: '레몬·바나나' },
  { name: '그린',               hex: '#3FA34D', note: '잎사귀·말차' },
  { name: '블루 (청색 1호)',    hex: '#2A6EBF', note: '바다·아이스' },
  { name: '바이올렛',           hex: '#7E3FBF', note: '라벤더·포도' },
  { name: '블랙 (식용 카본)',   hex: '#1A1A1A', note: '핼러윈·블랙 베이스' },
]

/* 팔레트 가져오기 */
export const PALETTES: { id: PaletteId; name: string; emoji: string; colors: PaintColor[] }[] = [
  { id: 'school12', name: '학교 미술 12색', emoji: '🎒', colors: SCHOOL_12 },
  { id: 'pro24',    name: '전문가 24색',    emoji: '🎨', colors: PRO_24 },
  { id: 'ink',      name: '만년필 잉크 10종', emoji: '✒️', colors: INK_BRANDS },
  { id: 'food',     name: '베이킹 푸드컬러',  emoji: '🧁', colors: FOOD_COLORS },
]

export const getPalette = (id: PaletteId) =>
  PALETTES.find((p) => p.id === id) ?? PALETTES[0]

/* ─────────────────────────────────────────────
   30+ 자주 쓰는 색 레시피 (학교 12색 기준)
   각 mix는 [색이름, parts] 배열
   ───────────────────────────────────────────── */
export interface Recipe {
  name: string
  emoji: string
  category: '피부톤' | '땅·자연' | '하늘·바다' | '식물' | '꽃·과일' | '회색·중성'
  mix: [string, number][]      // [학교 12색 이름, parts]
  desc: string
}

export const RECIPES: Recipe[] = [
  /* 피부톤 3종 */
  { name: '살색 (밝은 톤)',   emoji: '👶', category: '피부톤', mix: [['흰색', 8], ['빨강', 1], ['노랑', 1]], desc: '아기·어린이 피부톤' },
  { name: '살색 (중간 톤)',   emoji: '🧒', category: '피부톤', mix: [['흰색', 5], ['주황', 2], ['빨강', 1]], desc: '일반 동양인 피부톤' },
  { name: '살색 (어두운 톤)', emoji: '🧓', category: '피부톤', mix: [['갈색', 3], ['주황', 2], ['흰색', 4]], desc: '구릿빛·테라코타 톤' },
  /* 땅·흙 */
  { name: '황토색',           emoji: '🟫', category: '땅·자연', mix: [['노랑', 4], ['빨강', 2], ['검정', 1]], desc: '한국 황토·도자기' },
  { name: '카멜 베이지',      emoji: '🐪', category: '땅·자연', mix: [['주황', 3], ['갈색', 1], ['흰색', 4]], desc: '카멜 가죽·베이지 톤' },
  { name: '테라코타',         emoji: '🏺', category: '땅·자연', mix: [['주황', 4], ['갈색', 2], ['빨강', 1]], desc: '테라코타 화분·로마' },
  { name: '모카 브라운',      emoji: '☕', category: '땅·자연', mix: [['갈색', 5], ['검정', 1], ['빨강', 1]], desc: '에스프레소·다크초콜릿' },
  { name: '흙색 (옐로우 오커)', emoji: '🟤', category: '땅·자연', mix: [['노랑', 3], ['갈색', 2]], desc: '대지·뿌리' },
  /* 하늘·바다 */
  { name: '하늘색 (밝음)',    emoji: '☁️', category: '하늘·바다', mix: [['흰색', 6], ['하늘', 3], ['파랑', 1]], desc: '맑은 봄 하늘' },
  { name: '청회색',           emoji: '🌫️', category: '하늘·바다', mix: [['파랑', 3], ['검정', 1], ['흰색', 4]], desc: '흐린 하늘·바다' },
  { name: '군청',             emoji: '🌊', category: '하늘·바다', mix: [['파랑', 5], ['보라', 1], ['검정', 1]], desc: '깊은 바다·울트라마린' },
  { name: '인디고',           emoji: '🫐', category: '하늘·바다', mix: [['파랑', 4], ['검정', 2], ['보라', 1]], desc: '청바지·블루베리' },
  { name: '네이비',           emoji: '⚓', category: '하늘·바다', mix: [['파랑', 5], ['검정', 3]], desc: '해군·정장' },
  { name: '터쿼이즈',         emoji: '🟢', category: '하늘·바다', mix: [['하늘', 4], ['초록', 2], ['흰색', 2]], desc: '카리브해·터키석' },
  /* 식물·녹색 */
  { name: '민트',             emoji: '🌱', category: '식물', mix: [['초록', 1], ['흰색', 6], ['하늘', 1]], desc: '민트초코·여름' },
  { name: '세이지 그린',      emoji: '🌿', category: '식물', mix: [['연두', 3], ['흰색', 3], ['검정', 1]], desc: '세이지·올리브 잎' },
  { name: '올리브',           emoji: '🫒', category: '식물', mix: [['노랑', 3], ['초록', 2], ['검정', 1]], desc: '올리브·카키' },
  { name: '포레스트 그린',     emoji: '🌲', category: '식물', mix: [['초록', 5], ['검정', 2], ['파랑', 1]], desc: '깊은 숲·소나무' },
  { name: '에메랄드',         emoji: '💚', category: '식물', mix: [['초록', 4], ['하늘', 1], ['연두', 1]], desc: '에메랄드 보석' },
  /* 꽃·과일 */
  { name: '라벤더',           emoji: '💜', category: '꽃·과일', mix: [['파랑', 2], ['빨강', 1], ['흰색', 5]], desc: '라벤더 꽃·은은한 보라' },
  { name: '코럴 핑크',        emoji: '🪸', category: '꽃·과일', mix: [['빨강', 2], ['주황', 2], ['흰색', 3]], desc: '코럴·산호빛' },
  { name: '더스티 핑크',      emoji: '🌸', category: '꽃·과일', mix: [['분홍', 4], ['갈색', 1], ['흰색', 2]], desc: '빈티지·웨딩' },
  { name: '버건디',           emoji: '🍷', category: '꽃·과일', mix: [['빨강', 4], ['검정', 2], ['보라', 1]], desc: '와인·메를로' },
  { name: '머스타드',         emoji: '🌻', category: '꽃·과일', mix: [['노랑', 5], ['주황', 1], ['갈색', 1]], desc: '머스타드 옐로우·해바라기' },
  { name: '피치',             emoji: '🍑', category: '꽃·과일', mix: [['주황', 2], ['흰색', 4], ['분홍', 1]], desc: '복숭아·살구' },
  { name: '체리 레드',        emoji: '🍒', category: '꽃·과일', mix: [['빨강', 5], ['보라', 1]], desc: '체리·앵두' },
  { name: '플럼',             emoji: '🍇', category: '꽃·과일', mix: [['보라', 4], ['빨강', 2], ['검정', 1]], desc: '자두·진한 보라' },
  /* 회색·중성 */
  { name: '차콜 그레이',      emoji: '🪨', category: '회색·중성', mix: [['검정', 5], ['흰색', 1], ['파랑', 1]], desc: '차콜·짙은 회색' },
  { name: '실버 그레이',      emoji: '🥈', category: '회색·중성', mix: [['검정', 1], ['흰색', 6]], desc: '실버·중간 회색' },
  { name: '웜 그레이',        emoji: '🐘', category: '회색·중성', mix: [['검정', 2], ['흰색', 5], ['갈색', 1]], desc: '따뜻한 회색·코끼리' },
  { name: '쿨 그레이',        emoji: '🌑', category: '회색·중성', mix: [['검정', 2], ['흰색', 5], ['파랑', 1]], desc: '차가운 회색·돌' },
  { name: '아이보리',         emoji: '🦴', category: '회색·중성', mix: [['흰색', 8], ['노랑', 1], ['갈색', 1]], desc: '아이보리·상아' },
  { name: '크림 베이지',      emoji: '🍼', category: '회색·중성', mix: [['흰색', 7], ['주황', 1], ['갈색', 1]], desc: '크림·연한 베이지' },
]

/* ─────────────────────────────────────────────
   12색환 (color wheel) — 보색 / 유사색 / triadic 인덱스
   index 0~11 (0=빨강, 1=주황빨강, ..., 시계방향)
   ───────────────────────────────────────────── */
export interface WheelColor {
  name: string
  hex: string
  index: number
}

export const COLOR_WHEEL_12: WheelColor[] = [
  { name: '빨강',     hex: '#E63946', index: 0 },
  { name: '주황빨강', hex: '#E85D2A', index: 1 },
  { name: '주황',     hex: '#F4A261', index: 2 },
  { name: '노랑주황', hex: '#F4C145', index: 3 },
  { name: '노랑',     hex: '#F9DC5C', index: 4 },
  { name: '연두',     hex: '#90BE6D', index: 5 },
  { name: '초록',     hex: '#2A9D8F', index: 6 },
  { name: '청록',     hex: '#3A8FCD', index: 7 },
  { name: '하늘',     hex: '#7CC6E8', index: 8 },
  { name: '파랑',     hex: '#264E86', index: 9 },
  { name: '보라',     hex: '#8E44AD', index: 10 },
  { name: '자홍',     hex: '#C7325A', index: 11 },
]

/** 보색 (180° 반대) */
export const complementaryIdx = (i: number): number => (i + 6) % 12
/** 유사색 (양옆) */
export const analogousIdx = (i: number): number[] => [(i + 11) % 12, (i + 1) % 12]
/** 삼각배색 (120°) */
export const triadicIdx = (i: number): number[] => [(i + 4) % 12, (i + 8) % 12]

/* ─────────────────────────────────────────────
   분야별 추천 색 세트
   ───────────────────────────────────────────── */
export interface FieldGuide {
  id: string
  emoji: string
  name: string
  recommended: string
  tip: string
}

export const FIELD_GUIDES: FieldGuide[] = [
  { id: 'watercolor', emoji: '💧', name: '수채화',     recommended: '울트라마린·번트 시에나·옐로우 오커·알리자린 크림슨 (4색 한정 팔레트로 거의 모든 색 가능)', tip: '물 비율 ↑ → 투명·맑음. 두 번 이상 덧칠 시 진해짐.' },
  { id: 'acrylic',    emoji: '🖌️', name: '아크릴',     recommended: '티타늄 화이트·카본 블랙·카드뮴 옐로우/레드/블루·프탈로 그린 (6색이 기본)', tip: '건조 후 살짝 어두워짐. 미디엄으로 점도 조절.' },
  { id: 'oil',        emoji: '🎨', name: '유화',       recommended: '울트라마린·알리자린·카드뮴 옐로우·번트 엄버·티타늄 화이트 (Zorn 팔레트)', tip: '건조에 수일 소요. 두꺼운 임파스토는 갈라짐 주의.' },
  { id: 'ink',        emoji: '✒️', name: '만년필 잉크', recommended: '같은 브랜드·같은 베이스(dye/pigment) 위주 혼합. 파일럿 이로시즈쿠 시리즈 안전.', tip: '⚠️ 다른 브랜드/베이스 혼합 시 침전·만년필 막힘 위험. 별도 시린지 테스트 필수.' },
  { id: 'food',       emoji: '🧁', name: '푸드컬러',   recommended: '식약처 허가 식용 색소만 사용. 젤 타입(젤 푸드컬러)이 색이 더 진하고 반죽 묽어짐 적음.', tip: '액상은 1방울씩 추가. 발색은 30분 후 확인 (시간이 지나며 진해짐).' },
  { id: 'resin',      emoji: '💎', name: '레진·에폭시', recommended: '전용 마이카 파우더·알코올 잉크·레진 안료. 일반 물감은 경화 방해.', tip: '⚠️ 환기·장갑·고글 필수. 안료는 레진 전체 무게의 3% 이하 권장 (초과 시 경화 불량).' },
]

/* ═════════════════════════════════════════════
   색상 변환 함수
   ═════════════════════════════════════════════ */

/** HEX → RGB (0~255) */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '').trim()
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(v.padEnd(6, '0').slice(0, 6), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** RGB → HEX */
export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase()
}

/** RGB → HSL (0~360, 0~100, 0~100) */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const R = r / 255, G = g / 255, B = b / 255
  const max = Math.max(R, G, B), min = Math.min(R, G, B)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break
      case G: h = (B - R) / d + 2; break
      case B: h = (R - G) / d + 4; break
    }
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/** RGB → CMYK (0~100) */
export function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const R = r / 255, G = g / 255, B = b / 255
  const k = 1 - Math.max(R, G, B)
  if (k >= 0.999) return { c: 0, m: 0, y: 0, k: 100 }
  const c = (1 - R - k) / (1 - k)
  const m = (1 - G - k) / (1 - k)
  const y = (1 - B - k) / (1 - k)
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) }
}

/** sRGB → linear */
function srgbToLinear(c: number): number {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

/** RGB → XYZ (D65) */
function rgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b)
  return {
    x: (R * 0.4124564 + G * 0.3575761 + B * 0.1804375) * 100,
    y: (R * 0.2126729 + G * 0.7151522 + B * 0.0721750) * 100,
    z: (R * 0.0193339 + G * 0.1191920 + B * 0.9503041) * 100,
  }
}

/** RGB → LAB (CIELAB, D65) */
export function rgbToLab(r: number, g: number, b: number): { L: number; a: number; b: number } {
  const { x, y, z } = rgbToXyz(r, g, b)
  /* D65 white reference */
  const Xn = 95.047, Yn = 100.0, Zn = 108.883
  const f = (t: number) => t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116
  const fx = f(x / Xn), fy = f(y / Yn), fz = f(z / Zn)
  return {
    L: Math.round((116 * fy - 16) * 10) / 10,
    a: Math.round((500 * (fx - fy)) * 10) / 10,
    b: Math.round((200 * (fy - fz)) * 10) / 10,
  }
}

/** ΔE*ab — CIELAB 유클리드 거리 */
export function deltaE(lab1: { L: number; a: number; b: number }, lab2: { L: number; a: number; b: number }): number {
  const dL = lab1.L - lab2.L
  const da = lab1.a - lab2.a
  const db = lab1.b - lab2.b
  return Math.sqrt(dL * dL + da * da + db * db)
}

/** ΔE → 등급 라벨 */
export function deltaEGrade(d: number): { label: string; pct: number; color: string } {
  if (d < 1)  return { label: '완벽',     pct: 100, color: '#0D9488' }
  if (d < 2)  return { label: '매우 비슷', pct: 90,  color: '#0D9488' }
  if (d < 5)  return { label: '비슷',     pct: 75,  color: '#D97706' }
  if (d < 10) return { label: '가능',     pct: 55,  color: '#EA580C' }
  if (d < 20) return { label: '차이 큼',   pct: 30,  color: '#DB2777' }
  return       { label: '매우 다름',      pct: 10,  color: '#DB2777' }
}

/* ═════════════════════════════════════════════
   색 혼합 모델 3종
   ═════════════════════════════════════════════ */

const GAMMA = 2.2

/** Subtractive (물감 기본) — CMY 가중 평균 + 감마 보정 */
export function mixSubtractive(colors: { hex: string; weight: number }[]): string {
  const total = colors.reduce((s, c) => s + c.weight, 0)
  if (total <= 0 || colors.length === 0) return '#000000'
  let cAcc = 0, mAcc = 0, yAcc = 0
  for (const c of colors) {
    const { r, g, b } = hexToRgb(c.hex)
    /* 1 - color (CMY 변환) + 감마 적용 */
    const cn = Math.pow(1 - r / 255, GAMMA)
    const mn = Math.pow(1 - g / 255, GAMMA)
    const yn = Math.pow(1 - b / 255, GAMMA)
    cAcc += cn * c.weight
    mAcc += mn * c.weight
    yAcc += yn * c.weight
  }
  cAcc /= total; mAcc /= total; yAcc /= total
  /* 역감마 + RGB 복원 */
  const r = (1 - Math.pow(cAcc, 1 / GAMMA)) * 255
  const g = (1 - Math.pow(mAcc, 1 / GAMMA)) * 255
  const b = (1 - Math.pow(yAcc, 1 / GAMMA)) * 255
  return rgbToHex(r, g, b)
}

/** Additive (빛) — RGB 가중 평균 (감마 보정 포함) */
export function mixAdditive(colors: { hex: string; weight: number }[]): string {
  const total = colors.reduce((s, c) => s + c.weight, 0)
  if (total <= 0 || colors.length === 0) return '#000000'
  let rAcc = 0, gAcc = 0, bAcc = 0
  for (const c of colors) {
    const { r, g, b } = hexToRgb(c.hex)
    /* 감마 공간(linear)에서 평균 */
    rAcc += Math.pow(r / 255, GAMMA) * c.weight
    gAcc += Math.pow(g / 255, GAMMA) * c.weight
    bAcc += Math.pow(b / 255, GAMMA) * c.weight
  }
  rAcc /= total; gAcc /= total; bAcc /= total
  return rgbToHex(
    Math.pow(rAcc, 1 / GAMMA) * 255,
    Math.pow(gAcc, 1 / GAMMA) * 255,
    Math.pow(bAcc, 1 / GAMMA) * 255,
  )
}

/* ─── RYB ↔ RGB 변환 (Gosset & Chen 단순화) ─── */

function clamp01(x: number): number { return Math.max(0, Math.min(1, x)) }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t }

/** RYB(0~1) → RGB(0~1) trilinear cube */
function rybToRgb01(r: number, y: number, b: number): { R: number; G: number; B: number } {
  /* RYB cube vertices in RGB space */
  /* [r=0..1, y=0..1, b=0..1]
     000 = white(1,1,1) 100 = red(1,0,0) 010 = yellow(1,1,0) 001 = blue(0.163,0.373,0.6)
     110 = orange(1,0.5,0) 101 = purple(0.5,0,0.5) 011 = green(0,0.66,0.2) 111 = black(0,0,0) */
  const c000 = [1, 1, 1]
  const c100 = [1, 0, 0]
  const c010 = [1, 1, 0]
  const c001 = [0.163, 0.373, 0.6]
  const c110 = [1, 0.5, 0]
  const c101 = [0.5, 0, 0.5]
  const c011 = [0, 0.66, 0.2]
  const c111 = [0, 0, 0]
  const out = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const x00 = lerp(c000[i], c100[i], r)
    const x01 = lerp(c001[i], c101[i], r)
    const x10 = lerp(c010[i], c110[i], r)
    const x11 = lerp(c011[i], c111[i], r)
    const y0 = lerp(x00, x10, y)
    const y1 = lerp(x01, x11, y)
    out[i] = lerp(y0, y1, b)
  }
  return { R: clamp01(out[0]), G: clamp01(out[1]), B: clamp01(out[2]) }
}

/** RGB(0~1) → RYB(0~1) — 단순 역변환 (근사) */
function rgbToRyb01(r: number, g: number, b: number): { ryR: number; ryY: number; ryB: number } {
  /* 흰색 제거 */
  const w = Math.min(r, g, b)
  const R = r - w
  const G = g - w
  const B = b - w
  const maxRGB = Math.max(R, G, B)
  /* 노랑 추출 */
  let Y = Math.min(R, G)
  let R2 = R - Y
  let G2 = G - Y
  /* G·B 동시 → Cyan 보정 (RYB 모델엔 없음 → B로 합침) */
  if (G2 > 0 && B > 0) {
    G2 /= 2
    Y += G2
  }
  /* 검정 강도 보존 */
  const maxRYB = Math.max(R2, Y, B)
  if (maxRYB > 0 && maxRGB > 0) {
    const norm = maxRGB / maxRYB
    R2 *= norm
    Y *= norm
  }
  const k = 1 - Math.max(r, g, b) /* black 강도 */
  return {
    ryR: clamp01(R2 + k * 0),
    ryY: clamp01(Y + k * 0),
    ryB: clamp01(B + k * 0),
  }
  /* (참고) 단순화 버전이라 미세한 색차 있음. 학교 RYB 직관에는 충분 */
}

/** RYB 모델 — RYB 공간에서 가중 평균 후 RGB 변환 */
export function mixRYB(colors: { hex: string; weight: number }[]): string {
  const total = colors.reduce((s, c) => s + c.weight, 0)
  if (total <= 0 || colors.length === 0) return '#000000'
  let R = 0, Y = 0, B = 0
  for (const c of colors) {
    const { r, g, b } = hexToRgb(c.hex)
    const { ryR, ryY, ryB } = rgbToRyb01(r / 255, g / 255, b / 255)
    R += ryR * c.weight
    Y += ryY * c.weight
    B += ryB * c.weight
  }
  R /= total; Y /= total; B /= total
  const { R: rR, G: rG, B: rB } = rybToRgb01(R, Y, B)
  return rgbToHex(rR * 255, rG * 255, rB * 255)
}

/** 모델 디스패치 */
export function mixColors(colors: { hex: string; weight: number }[], model: MixModel): string {
  switch (model) {
    case 'subtractive': return mixSubtractive(colors)
    case 'additive':    return mixAdditive(colors)
    case 'ryb':         return mixRYB(colors)
  }
}

/* ═════════════════════════════════════════════
   가장 가까운 프리셋 색 찾기
   ═════════════════════════════════════════════ */
export function findClosestPreset(hex: string, palette: PaintColor[]): { color: PaintColor; deltaE: number } {
  const { r, g, b } = hexToRgb(hex)
  const target = rgbToLab(r, g, b)
  let best = palette[0]
  let bestDe = Infinity
  for (const c of palette) {
    const { r: r2, g: g2, b: b2 } = hexToRgb(c.hex)
    const lab = rgbToLab(r2, g2, b2)
    const d = deltaE(target, lab)
    if (d < bestDe) { bestDe = d; best = c }
  }
  return { color: best, deltaE: bestDe }
}

/* ═════════════════════════════════════════════
   역방향 매칭 — 팔레트에서 2~3색 조합으로 목표 색 근사
   브루트 포스: 1~5 parts 조합 (5³ = 125 × C(n,3) 조합)
   ═════════════════════════════════════════════ */
export interface RecipeMatch {
  colors: { color: PaintColor; weight: number }[]
  resultHex: string
  deltaE: number
}

export function suggestRecipe(
  targetHex: string,
  palette: PaintColor[],
  maxColors: number = 3,
  model: MixModel = 'subtractive',
): RecipeMatch {
  const { r, g, b } = hexToRgb(targetHex)
  const targetLab = rgbToLab(r, g, b)

  let best: RecipeMatch = {
    colors: [{ color: palette[0], weight: 1 }],
    resultHex: palette[0].hex,
    deltaE: Infinity,
  }

  const weightSteps = [1, 2, 3, 4, 5]   /* 5단계 */
  const n = palette.length

  /* 1색 시도 */
  for (let i = 0; i < n; i++) {
    const mix = mixColors([{ hex: palette[i].hex, weight: 1 }], model)
    const { r: r2, g: g2, b: b2 } = hexToRgb(mix)
    const d = deltaE(targetLab, rgbToLab(r2, g2, b2))
    if (d < best.deltaE) best = { colors: [{ color: palette[i], weight: 1 }], resultHex: mix, deltaE: d }
  }

  /* 2색 조합 */
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (const wi of weightSteps) {
        for (const wj of weightSteps) {
          const mix = mixColors(
            [{ hex: palette[i].hex, weight: wi }, { hex: palette[j].hex, weight: wj }],
            model,
          )
          const { r: r2, g: g2, b: b2 } = hexToRgb(mix)
          const d = deltaE(targetLab, rgbToLab(r2, g2, b2))
          if (d < best.deltaE) {
            best = {
              colors: [
                { color: palette[i], weight: wi },
                { color: palette[j], weight: wj },
              ],
              resultHex: mix,
              deltaE: d,
            }
          }
        }
      }
    }
  }

  /* 3색 조합 (maxColors >= 3 일 때만) */
  if (maxColors >= 3) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          for (const wi of weightSteps) {
            for (const wj of weightSteps) {
              for (const wk of weightSteps) {
                const mix = mixColors(
                  [
                    { hex: palette[i].hex, weight: wi },
                    { hex: palette[j].hex, weight: wj },
                    { hex: palette[k].hex, weight: wk },
                  ],
                  model,
                )
                const { r: r2, g: g2, b: b2 } = hexToRgb(mix)
                const d = deltaE(targetLab, rgbToLab(r2, g2, b2))
                if (d < best.deltaE) {
                  best = {
                    colors: [
                      { color: palette[i], weight: wi },
                      { color: palette[j], weight: wj },
                      { color: palette[k], weight: wk },
                    ],
                    resultHex: mix,
                    deltaE: d,
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return best
}

/* ═════════════════════════════════════════════
   분량 환산 (단위 → ml 비율)
   ═════════════════════════════════════════════ */
export const UNIT_TO_ML: Record<VolumeUnit, number> = {
  ml: 1,
  g: 1,        /* 물 기준 1 g = 1 ml. 안료는 다르지만 일반 가정용 근사 */
  tbsp: 15,    /* 한국 표준 큰술 15ml */
  tsp: 5,      /* 작은술 5ml */
  drop: 0.05,  /* 1방울 ≈ 0.05ml */
}

export const UNIT_LABELS: Record<VolumeUnit, string> = {
  ml: 'ml',
  g: 'g',
  tbsp: '큰술',
  tsp: '작은술',
  drop: '방울',
}

/** 분량 계산 — 비율 + 총량 + 단위 → 색별 분량 */
export function computeAmounts(
  weights: number[],
  totalAmount: number,
  pigmentScale: number = 1,
): number[] {
  const total = weights.reduce((s, w) => s + w, 0)
  if (total <= 0) return weights.map(() => 0)
  return weights.map((w) => (w / total) * totalAmount * pigmentScale)
}

/* ═════════════════════════════════════════════
   포맷
   ═════════════════════════════════════════════ */
export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmtInt = (n: number) =>
  Math.round(n).toLocaleString('ko-KR')

/** HEX 입력 정규화 (#·소문자·잘못된 입력 방어) */
export function normalizeHex(input: string): string | null {
  let h = input.trim().replace(/^#/, '').toUpperCase()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (!/^[0-9A-F]{6}$/.test(h)) return null
  return `#${h}`
}
