/* 차 우리기 계산기 — 데이터·계산 유틸 */

export type TeaId =
  | 'green' | 'gyokuro' | 'matcha' | 'white' | 'oolong'
  | 'black' | 'puer' | 'herbal' | 'rooibos'

export type Vessel = 'gaiwan' | 'teapot' | 'mug' | 'teabag'
export type Strength = 'light' | 'normal' | 'strong'
export type ColdMode = 'room' | 'fridge'

export interface TeaMeta {
  id: TeaId
  emoji: string
  label: string
  shortName: string
  tempMin: number
  tempMax: number
  ratioWaterPerLeaf: number   // 1g 찻잎당 물 ml
  caffeineMgPerG: number      // 카페인 mg/g
  rinse: boolean              // 세차 필요
  rinseSec: number            // 세차 시간 (초)
  steeps: number[]            // 1탕·2탕·3탕·4탕 시간 (초)
  maxSteeps: number
  flavor: { acidity: number; sweet: number; body: number; bitter: number } // 0~5
  origin: string
  vessel: Vessel              // 추천 다구
  vessels?: Vessel[]          // 허용 다구 (생략 시 전체) — 말차·옥로처럼 비현실 조합 차단용
  desc: string
  tip: string
}

export const TEAS: TeaMeta[] = [
  {
    id: 'green',
    emoji: '🍵',
    label: '녹차 (센차·세작)',
    shortName: '녹차',
    tempMin: 70, tempMax: 80,
    ratioWaterPerLeaf: 60,
    caffeineMgPerG: 25,
    rinse: false, rinseSec: 0,
    steeps: [75, 45, 60],
    maxSteeps: 3,
    flavor: { acidity: 3, sweet: 3, body: 2, bitter: 2 },
    origin: '한국 보성·하동, 일본 우지·시즈오카',
    vessel: 'mug',
    desc: '맑은 풀향·부드러운 단맛·산뜻함. 한국 표준은 세작·우전·소작.',
    tip: '70°C 이하로 우리면 떫음·쓴맛 적고 단맛이 살아남.',
  },
  {
    id: 'gyokuro',
    emoji: '🍃',
    label: '녹차 옥로 (교쿠로)',
    shortName: '옥로',
    tempMin: 50, tempMax: 60,
    ratioWaterPerLeaf: 30,
    caffeineMgPerG: 35,
    rinse: false, rinseSec: 0,
    steeps: [105, 30, 60],
    maxSteeps: 3,
    flavor: { acidity: 2, sweet: 5, body: 4, bitter: 1 },
    origin: '일본 우지·후쿠오카·시즈오카',
    vessel: 'teapot',
    vessels: ['teapot', 'gaiwan'],   // 저온 단시간 — 머그·티백 부적합
    desc: '차광 재배 고급 녹차. 우마미(감칠맛) 강하고 단맛이 풍부.',
    tip: '저온 단시간 우림. 60°C 이상에선 떫음 폭증.',
  },
  {
    id: 'matcha',
    emoji: '💚',
    label: '말차',
    shortName: '말차',
    tempMin: 70, tempMax: 80,
    ratioWaterPerLeaf: 35,   // 2g/70ml
    caffeineMgPerG: 65,
    rinse: false, rinseSec: 0,
    steeps: [10],            // 격불 = 즉시
    maxSteeps: 1,
    flavor: { acidity: 2, sweet: 4, body: 5, bitter: 3 },
    origin: '일본 우지·니시오',
    vessel: 'mug',           // 차완 + 차센
    vessels: ['mug'],        // 격불(차완) 전용 — 우림 다구·티백 불가
    desc: '찻잎 가루 자체를 마심. 격불(차센으로 거품)이 핵심.',
    tip: '체에 한 번 거른 후 격불, 가루 통째 섭취로 카페인·항산화 최대.',
  },
  {
    id: 'white',
    emoji: '🤍',
    label: '백차 (백호은침·백모단)',
    shortName: '백차',
    tempMin: 75, tempMax: 85,
    ratioWaterPerLeaf: 50,
    caffeineMgPerG: 10,
    rinse: false, rinseSec: 0,
    steeps: [150, 210, 270, 360],
    maxSteeps: 4,
    flavor: { acidity: 1, sweet: 4, body: 2, bitter: 1 },
    origin: '중국 복건성 정화·복정',
    vessel: 'gaiwan',
    desc: '가장 가공이 적은 차. 부드럽고 은은한 단맛.',
    tip: '저카페인이라 저녁에 좋고, 임산부도 한 잔 정도는 가능.',
  },
  {
    id: 'oolong',
    emoji: '🌸',
    label: '우롱차 (철관음·동방미인·대홍포)',
    shortName: '우롱차',
    tempMin: 90, tempMax: 95,
    ratioWaterPerLeaf: 25,
    caffeineMgPerG: 20,
    rinse: true, rinseSec: 10,
    steeps: [38, 52, 75, 110, 150],
    maxSteeps: 5,
    flavor: { acidity: 3, sweet: 4, body: 4, bitter: 2 },
    origin: '중국 복건·광동, 대만 (고산차·동방미인)',
    vessel: 'gaiwan',
    desc: '반산화차. 산화도(20~80%)에 따라 풍미가 매우 다양.',
    tip: '게이완으로 짧게 여러 번 우림이 정석. 6~8탕까지 가능.',
  },
  {
    id: 'black',
    emoji: '☕',
    label: '홍차 (다즐링·아쌈·실론·기문)',
    shortName: '홍차',
    tempMin: 95, tempMax: 100,
    ratioWaterPerLeaf: 50,
    caffeineMgPerG: 35,
    rinse: false, rinseSec: 0,
    steeps: [240, 180, 240],
    maxSteeps: 3,
    flavor: { acidity: 3, sweet: 3, body: 4, bitter: 3 },
    origin: '인도(다즐링·아쌈), 스리랑카(실론), 중국(기문·정산소종)',
    vessel: 'mug',
    desc: '완전산화차. 진한 색·풍부한 바디·단맛이 강함.',
    tip: '95°C 이하면 향이 약해짐. 끓는 물 권장 (다즐링은 90°C도 가능).',
  },
  {
    id: 'puer',
    emoji: '🪵',
    label: '보이차 (생·숙)',
    shortName: '보이차',
    tempMin: 95, tempMax: 100,
    ratioWaterPerLeaf: 25,
    caffeineMgPerG: 25,
    rinse: true, rinseSec: 10,
    steeps: [30, 45, 60, 80, 110, 150],
    maxSteeps: 6,
    flavor: { acidity: 2, sweet: 3, body: 5, bitter: 3 },
    origin: '중국 운남성',
    vessel: 'gaiwan',
    desc: '발효차. 생차(생보이)는 그린, 숙차(숙보이)는 갈색.',
    tip: '세차(헹굼) 10초 후 버리고 본 추출 시작. 8~10탕까지 가능.',
  },
  {
    id: 'herbal',
    emoji: '🌼',
    label: '허브티 (카모마일·페퍼민트·라벤더)',
    shortName: '허브티',
    tempMin: 95, tempMax: 100,
    ratioWaterPerLeaf: 60,
    caffeineMgPerG: 0,
    rinse: false, rinseSec: 0,
    steeps: [360, 300],
    maxSteeps: 2,
    flavor: { acidity: 1, sweet: 2, body: 2, bitter: 1 },
    origin: '유럽·이집트 (카모마일), 미국·이집트 (페퍼민트)',
    vessel: 'mug',
    desc: '차나무가 아닌 식물. 카페인 0이라 늦은 밤에도 OK.',
    tip: '향이 약한 자재라 5~7분 길게 우림. 끓는 물에 뚜껑 덮고 추출.',
  },
  {
    id: 'rooibos',
    emoji: '🍂',
    label: '루이보스',
    shortName: '루이보스',
    tempMin: 95, tempMax: 100,
    ratioWaterPerLeaf: 80,
    caffeineMgPerG: 0,
    rinse: false, rinseSec: 0,
    steeps: [360, 480],
    maxSteeps: 2,
    flavor: { acidity: 1, sweet: 4, body: 3, bitter: 1 },
    origin: '남아프리카 공화국',
    vessel: 'mug',
    desc: '아프리카 식물. 카페인 0, 항산화·미네랄 풍부.',
    tip: '오래 우려도 떫음 적음. 5~10분 추출, 임산부·아이도 OK.',
  },
]

export const getTea = (id: TeaId) => TEAS.find((t) => t.id === id)!

/* 다구 메타 */
export interface VesselMeta {
  id: Vessel
  emoji: string
  label: string
  desc: string
  recommend: string
}

export const VESSELS: VesselMeta[] = [
  { id: 'gaiwan',  emoji: '🍶', label: '게이완 (개완)',          desc: '광동·복건식 작은 사발. 우롱·보이·백차 표준.',   recommend: '우롱·보이·백차' },
  { id: 'teapot',  emoji: '🫖', label: '다관 (차호)',            desc: '전통 중국식 작은 주전자. 작게 여러 번 우림.',     recommend: '옥로·우롱·보이' },
  { id: 'mug',     emoji: '☕', label: '머그 + 티볼 (스트레이너)', desc: '서양식. 1회 우림 후 티볼 제거.',                 recommend: '녹차·홍차·허브' },
  { id: 'teabag',  emoji: '🏷️', label: '티백',                   desc: '편의·휴대용. 시간을 30~50% 단축.',                recommend: '홍차·허브 (간편)' },
]

export const getVessel = (id: Vessel) => VESSELS.find((v) => v.id === id)!

/* 진하기 보정 */
export interface StrengthMeta {
  id: Strength
  label: string
  emoji: string
  ratioMul: number   // 비율 보정 (water/leaf)
  tempDelta: number  // °C 보정
  timeMul: number    // 시간 보정 (1.0 권장)
}

// 진하기는 찻잎:물 비율(ratioMul)·온도(tempDelta)로만 조절 — 시간은 건드리지 않음(과추출·떫음 방지 원칙)
export const STRENGTHS: Record<Strength, StrengthMeta> = {
  light:  { id: 'light',  label: '연하게',  emoji: '🪶', ratioMul: 1.2,  tempDelta: -3, timeMul: 1.0 },
  normal: { id: 'normal', label: '기본',    emoji: '⚖️', ratioMul: 1.0,  tempDelta:  0, timeMul: 1.0 },
  strong: { id: 'strong', label: '진하게',  emoji: '💪', ratioMul: 0.8,  tempDelta: +3, timeMul: 1.0 },
}

/* ─────────────────────────────────────────────
   계산
   ───────────────────────────────────────────── */

/** 권장 물 양: leafG × ratio × strength */
export function recommendWaterMl(tea: TeaMeta, leafG: number, strength: Strength): number {
  return Math.round(leafG * tea.ratioWaterPerLeaf * STRENGTHS[strength].ratioMul)
}

/** 권장 찻잎: waterMl ÷ ratio ÷ strength */
export function recommendLeafG(tea: TeaMeta, waterMl: number, strength: Strength): number {
  return +(waterMl / tea.ratioWaterPerLeaf / STRENGTHS[strength].ratioMul).toFixed(1)
}

/** 권장 온도 (진하기 보정 적용) */
export function recommendTemp(tea: TeaMeta, strength: Strength): { min: number; max: number; mid: number } {
  const delta = STRENGTHS[strength].tempDelta
  const min = Math.max(40, tea.tempMin + delta)
  const max = Math.min(100, tea.tempMax + delta)
  return { min, max, mid: Math.round((min + max) / 2) }
}

/** 권장 1탕 시간 (진하기·다구 보정) */
export function recommendTime(tea: TeaMeta, strength: Strength, vessel: Vessel): number {
  const base = tea.steeps[0]
  const sMul = STRENGTHS[strength].timeMul
  const vMul = vessel === 'teabag' ? 0.7 : vessel === 'mug' ? 1.0 : 1.0
  return Math.round(base * sMul * vMul)
}

/** 카페인 추정량 (mg) */
export function caffeineMg(tea: TeaMeta, leafG: number): number {
  return tea.caffeineMgPerG * leafG
}

/** 떫음 위험도 (0~100%): 시간이 권장 대비 얼마나 초과인지 */
export function tanninRisk(tea: TeaMeta, actualSec: number, strength: Strength, vessel: Vessel): number {
  const recommended = recommendTime(tea, strength, vessel)
  if (actualSec <= recommended) return Math.round((actualSec / recommended) * 30)  // 안전 영역 0~30
  const overRatio = actualSec / recommended
  if (overRatio <= 1.5) return Math.round(30 + (overRatio - 1) * 80)   // 1.0~1.5x → 30~70
  if (overRatio <= 2.0) return Math.round(70 + (overRatio - 1.5) * 60) // 1.5~2.0x → 70~100
  return 100
}

export function tanninZoneColor(risk: number): string {
  if (risk < 40) return '#0D9488'
  if (risk < 70) return '#D97706'
  return '#DB2777'
}

export function tanninLabel(risk: number): string {
  if (risk < 40) return '✅ 안전 영역'
  if (risk < 70) return '⚠️ 떫음 시작'
  return '🚨 과추출 (떫음·쓴맛 폭증)'
}

/* ─────────────────────────────────────────────
   다탕 스케줄
   ───────────────────────────────────────────── */

export interface SteepStep {
  id: string
  label: string
  emoji: string
  sec: number
  isRinse: boolean
  desc: string
  color: string
}

const STEP_COLORS = ['#0D9488', '#0891B2', '#D97706', '#EA580C', '#DB2777', '#9B59B6', '#9333EA', '#059669']

export function buildSteepSchedule(tea: TeaMeta, timeMul = 1): SteepStep[] {
  const steps: SteepStep[] = []
  if (tea.rinse) {
    steps.push({
      id: 'rinse',
      label: '세차 (헹굼)',
      emoji: '💦',
      sec: tea.rinseSec,   // 세차는 진하기·다구 보정 영향 없음
      isRinse: true,
      desc: '뜨거운 물로 짧게 헹구고 첫 물은 버립니다. 먼지·잡내 제거 + 찻잎 깨우기.',
      color: '#9B9B9B',
    })
  }
  tea.steeps.forEach((sec, i) => {
    const flavors = ['풀향·산뜻함 강조', '단맛·바디 균형', '깊은 풍미·후미', '은은한 단맛 마무리']
    steps.push({
      id: `s${i + 1}`,
      label: `${i + 1}탕`,
      emoji: ['🍃', '🌿', '🪴', '🌱'][i] || '🌿',
      sec: Math.round(sec * timeMul),
      isRinse: false,
      desc: flavors[i] || '깊고 부드러운 마무리 풍미.',
      color: STEP_COLORS[i] || '#9B9B9B',
    })
  })
  return steps
}

/* ─────────────────────────────────────────────
   냉침
   ───────────────────────────────────────────── */

export interface ColdGuide {
  mode: ColdMode
  label: string
  tempC: number
  hourMin: number
  hourMax: number
  recommend: TeaId[]
}

export const COLD_GUIDES: ColdGuide[] = [
  { mode: 'room',   label: '상온 (20°C)', tempC: 20, hourMin: 4,  hourMax: 6,  recommend: ['green', 'gyokuro', 'white', 'oolong'] },
  { mode: 'fridge', label: '냉장 (4°C)',   tempC: 4,  hourMin: 6,  hourMax: 12, recommend: ['green', 'black', 'herbal', 'rooibos'] },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtTime(s: number): string {
  if (s < 60) return `${s}초`
  const m = Math.floor(s / 60)
  const sec = s % 60
  return sec > 0 ? `${m}분 ${sec}초` : `${m}분`
}
