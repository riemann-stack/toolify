/* 전자레인지 출력 환산기 계산기 — 데이터·계산 유틸 */

export type StartTemp = 'frozen' | 'fridge' | 'room'

/* 한국 일반 전자레인지 출력 (W) */
export const POWER_OPTIONS = [600, 700, 800, 900, 1000, 1200] as const
export type PowerW = (typeof POWER_OPTIONS)[number]

/* ─────────────────────────────────────────────
   출력 환산 (저출력·고출력 효율 보정)
   기본: 새 시간 = 기준 시간 × (기준 W / 새 W)
   600W 이하: ×1.07 보정 (저출력 효율 ↓)
   1000W 이상: ×0.95 보정 (고출력 살짝 빠름)
   ───────────────────────────────────────────── */

export function efficiencyFactor(w: number): number {
  if (w <= 600) return 1.07
  if (w >= 1000) return 0.95
  return 1.0
}

/** 기준 W·시간 → 새 W의 시간 (초) */
export function convertTime(refW: number, refSec: number, targetW: number): number {
  if (targetW <= 0) return refSec
  const baseRatio = refW / targetW
  const eff = efficiencyFactor(targetW) / efficiencyFactor(refW)
  return refSec * baseRatio * eff
}

/* ─────────────────────────────────────────────
   양 보정 (비선형 N^0.75)
   1인분 = ×1.0
   2인분 = ×1.68
   3인분 = ×2.28
   4인분 = ×2.83
   5인분 = ×3.34
   ───────────────────────────────────────────── */
export function portionFactor(portions: number): number {
  if (portions <= 1) return 1.0
  return Math.pow(portions, 0.75)
}

/* ─────────────────────────────────────────────
   시작 온도 보정
   ───────────────────────────────────────────── */
export interface TempMeta {
  id: StartTemp
  label: string
  emoji: string
  factor: number
  desc: string
}

export const TEMPS: TempMeta[] = [
  { id: 'frozen', emoji: '❄️', label: '냉동 (-18°C)', factor: 1.00, desc: '표준 (라벨 시간 기준)' },
  { id: 'fridge', emoji: '🧊', label: '냉장 (4°C)',    factor: 0.80, desc: '냉동 대비 시간 -20%' },
  { id: 'room',   emoji: '🌡️', label: '상온 (20°C)',  factor: 0.60, desc: '냉동 대비 시간 -40%' },
]

export const getTemp = (id: StartTemp) => TEMPS.find((t) => t.id === id)!

/* ─────────────────────────────────────────────
   식품 프리셋 12종 (한국 시장)
   ───────────────────────────────────────────── */

export interface FoodPreset {
  id: string
  emoji: string
  label: string
  shortLabel: string
  baseW: number          // 표준 W
  baseSec: number        // 표준 시간 (초)
  restSec: number        // 휴지 시간 (초)
  restAdditionalSec: number  // 휴지 후 추가 가열
  container: string
  warning?: string       // 강한 경고 (계란 등)
  tip: string
  vessel: string
  forbidden?: boolean    // 절대 X
  defrostMode?: boolean  // 해동 모드 (고정 ~200W, 출력 W 환산 미적용)
}

export const FOODS: FoodPreset[] = [
  {
    id: 'rice',
    emoji: '🍚',
    label: '냉동밥 (햇반·즉석밥)',
    shortLabel: '냉동밥',
    baseW: 700, baseSec: 120, restSec: 0, restAdditionalSec: 0,
    container: '용기 그대로 OK',
    tip: '뚜껑 살짝 열거나 비닐 일부 제거. 데운 후 한 번 섞으면 균일.',
    vessel: '햇반 전용 용기 (PP 5번)',
  },
  {
    id: 'dumpling',
    emoji: '🥟',
    label: '냉동만두',
    shortLabel: '냉동만두',
    baseW: 700, baseSec: 90, restSec: 30, restAdditionalSec: 60,
    container: '내열 접시 + 키친타올',
    tip: '1.5분 가열 → 30초 휴지(균일 가열) → 1분 추가. 휴지가 핵심.',
    vessel: '도자기·내열유리',
  },
  {
    id: 'pizza',
    emoji: '🍕',
    label: '냉동피자',
    shortLabel: '냉동피자',
    baseW: 700, baseSec: 180, restSec: 0, restAdditionalSec: 0,
    container: '내열 접시',
    tip: '가장자리 타기 쉬움. 70% 시간으로 시작 → 추가 가열 권장. 오븐 토스터가 더 좋음.',
    vessel: '도자기·내열유리 (금색 X)',
  },
  {
    id: 'lunch',
    emoji: '🍱',
    label: '냉동도시락',
    shortLabel: '도시락',
    baseW: 700, baseSec: 240, restSec: 60, restAdditionalSec: 60,
    container: '용기 그대로 OK',
    tip: '4분 가열 → 1분 휴지 → 1분 추가. 위치별 가열 차이 큼. 중간 회전 권장.',
    vessel: 'PP 전용 용기',
  },
  {
    id: 'soup',
    emoji: '🥣',
    label: 'CJ·오뚜기 즉석국·찌개',
    shortLabel: '즉석국',
    baseW: 700, baseSec: 150, restSec: 0, restAdditionalSec: 0,
    container: '비닐 끝 살짝 자르기',
    tip: '비닐 끝을 1~2cm 잘라야 폭발 방지. 끓어 넘침 주의.',
    vessel: '내열 그릇에 옮기면 더 안전',
  },
  {
    id: 'cvslunch',
    emoji: '🍙',
    label: '편의점 도시락',
    shortLabel: '편의점',
    baseW: 700, baseSec: 150, restSec: 0, restAdditionalSec: 0,
    container: '비닐 일부 제거',
    tip: '뚜껑 비닐 끝부터 제거. CU·GS·세븐 모두 700W 2~3분 표준.',
    vessel: '도시락 용기 그대로',
  },
  {
    id: 'milk',
    emoji: '🥛',
    label: '우유·음료 (200ml)',
    shortLabel: '우유',
    baseW: 700, baseSec: 60, restSec: 0, restAdditionalSec: 0,
    container: '내열 머그',
    warning: '끓어 넘침 주의 — 처음엔 30초씩 분할 가열',
    tip: '30초 → 저어주기 → 추가 30초 패턴이 안전. 컵 80%만 채우기.',
    vessel: '도자기·유리 머그',
  },
  {
    id: 'bread',
    emoji: '🍞',
    label: '빵·베이커리',
    shortLabel: '빵',
    baseW: 700, baseSec: 15, restSec: 0, restAdditionalSec: 0,
    container: '키친타올로 감싸기',
    tip: '10초 단위 가열. 너무 데우면 딱딱해지므로 살짝만. 물 한 방울 뿌리면 부드러움 유지.',
    vessel: '내열 접시 + 키친타올',
  },
  {
    id: 'egg',
    emoji: '🍳',
    label: '⚠️ 계란 (통째)',
    shortLabel: '계란',
    baseW: 0, baseSec: 0, restSec: 0, restAdditionalSec: 0,
    container: '절대 사용 금지',
    warning: '🚨 통째 가열 시 폭발 위험 — 절대 금지. 부상 사례 다수.',
    tip: '계란을 데우려면 ① 노른자에 칼집 ② 흰자 풀기 ③ 그릇에 풀어 사용. 통째 X.',
    vessel: '풀어서 내열 그릇만',
    forbidden: true,
  },
  {
    id: 'rice_cake',
    emoji: '🍡',
    label: '떡 (가래·인절미)',
    shortLabel: '떡',
    baseW: 700, baseSec: 30, restSec: 0, restAdditionalSec: 0,
    container: '내열 접시 + 물',
    tip: '물 1~2 스푼 뿌려서 가열. 비닐 X (눌어붙음). 30초 단위로 확인.',
    vessel: '도자기·내열유리',
  },
  {
    id: 'meat',
    emoji: '🥩',
    label: '냉동 고기 (해동)',
    shortLabel: '냉동고기',
    baseW: 200, baseSec: 60, restSec: 0, restAdditionalSec: 0,
    container: '내열 접시',
    warning: '해동은 출력 W와 무관 — 반드시 해동 모드(약 200W)로. 일반 출력은 가장자리만 익습니다.',
    tip: '해동 모드(약 200W) 200g당 1분 → 중간에 뒤집기. 가장자리 익기 시작하면 정지하고 휴지. 정밀 해동은 해동 시간 계산기 권장.',
    vessel: '도자기·내열유리',
    defrostMode: true,
  },
  {
    id: 'veggie',
    emoji: '🥦',
    label: '냉동 채소',
    shortLabel: '냉동채소',
    baseW: 700, baseSec: 90, restSec: 0, restAdditionalSec: 0,
    container: '뚜껑 있는 내열 그릇 + 물 약간',
    tip: '물 1~2 스푼 + 뚜껑 (찜 효과). 200g 1~2분, 중간 한 번 섞기.',
    vessel: '내열 뚜껑 그릇',
  },
]

export const getFood = (id: string) => FOODS.find((f) => f.id === id) ?? FOODS[0]

/* ─────────────────────────────────────────────
   용기 가이드
   ───────────────────────────────────────────── */

export interface VesselInfo {
  category: 'safe' | 'caution' | 'forbidden'
  items: { emoji: string; label: string; desc: string }[]
}

export const VESSELS: VesselInfo[] = [
  {
    category: 'safe',
    items: [
      { emoji: '🍶', label: '도자기',          desc: '대부분 안전. 금색·은색 테두리는 X.' },
      { emoji: '🔍', label: '내열유리 (파이렉스)', desc: '전자레인지·오븐 모두 안전.' },
      { emoji: '🥡', label: 'PP 플라스틱 (5번)',   desc: '전자레인지 전용 표시 확인. 햇반 용기.' },
      { emoji: '🧻', label: '키친타올',         desc: '바닥에 깔거나 위에 덮어 사용 OK.' },
    ],
  },
  {
    category: 'caution',
    items: [
      { emoji: '🛍️', label: '비닐봉투',         desc: '전용만 가능. 일반 비닐은 녹을 수 있음. 한쪽 끝 자르기.' },
      { emoji: '🍽️', label: '멜라민 식기',       desc: '저출력·짧은 시간만. 일부 변형·갈변 가능.' },
      { emoji: '🍯', label: '도자기 빈티지',     desc: '오래된 그릇·금색 테두리는 스파크 위험.' },
    ],
  },
  {
    category: 'forbidden',
    items: [
      { emoji: '🥫', label: '알루미늄 캔·호일',   desc: '🚨 스파크 → 화재 위험. 절대 X.' },
      { emoji: '🔩', label: '금속 그릇·포크',     desc: '🚨 스파크 발생.' },
      { emoji: '✨', label: '금색·은색 테두리',   desc: '🚨 가장 흔한 사고 원인. 중고 그릇 주의.' },
      { emoji: '🥤', label: '일반 플라스틱',      desc: '🚨 녹거나 환경호르몬 용출.' },
      { emoji: '🥚', label: '계란 (통째)',        desc: '🚨 폭발 위험. 풀어서만 가열.' },
      { emoji: '📦', label: '닫힌 용기·캔',       desc: '🚨 압력 폭발 위험. 뚜껑 살짝 열기.' },
    ],
  },
]

/* ─────────────────────────────────────────────
   골든 팁 10가지
   ───────────────────────────────────────────── */

export interface GoldenTip {
  emoji: string
  title: string
  desc: string
}

export const GOLDEN_TIPS: GoldenTip[] = [
  { emoji: '🔄', title: '중간에 한 번 섞기',    desc: '가운데까지 균일하게 가열되도록 1/2 지점에서 섞어주기.' },
  { emoji: '⭕', title: '가장자리에 음식 두기', desc: '가운데보다 바깥쪽이 먼저 가열됨 → 가장자리에 두면 빠름.' },
  { emoji: '💧', title: '냉동밥은 물 1스푼',   desc: '수분 보충으로 갓 지은 밥처럼 부드럽게.' },
  { emoji: '⏱️', title: '빵은 10초 단위',     desc: '오래 데우면 딱딱해짐. 짧게·자주가 정답.' },
  { emoji: '✂️', title: '비닐은 한쪽 끝 자르기', desc: '폭발 방지. 1~2cm만 살짝 자르면 안전.' },
  { emoji: '🥄', title: '저어주며 데우기',     desc: '국·찌개·우유는 30초마다 저어주면 끓어 넘침 방지.' },
  { emoji: '⏸️', title: '휴지(레스팅) 활용',   desc: '만두·냉동식품은 가열 → 휴지 → 추가 가열이 균일.' },
  { emoji: '🔍', title: '80%로 시작 → 추가',   desc: '환산 시간의 80%로 먼저 가열 → 부족하면 추가. 과조리 방지.' },
  { emoji: '🧻', title: '키친타올 활용',       desc: '빵·튀김 보온 + 기름·수분 흡수.' },
  { emoji: '⚠️', title: '꺼낼 때 화상 주의',   desc: '그릇이 매우 뜨거움. 두꺼운 장갑·집게 필수.' },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

/** 초 → "M분 S초" 또는 "S초" */
export function fmtSec(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}초`
  const m = Math.floor(sec / 60)
  const s = Math.round(sec - m * 60)
  return s > 0 ? `${m}분 ${s}초` : `${m}분`
}

/** 초 → "MM:SS" (타이머용) */
export function fmtTimer(sec: number): string {
  const total = Math.max(0, Math.ceil(sec))
  const m = Math.floor(total / 60)
  const s = total - m * 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
