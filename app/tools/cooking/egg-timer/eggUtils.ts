/* ──────────────────────────────────────────────────────
   egg-timer/eggUtils.ts
   계란 삶기 시간 — 8단계 익힘·5크기·3시작온도·4조리법·고도·개수
   ────────────────────────────────────────────────────── */

/* ─── 익힘 8단계 ─── */
export interface DonenessStage {
  id: string
  label: string
  seconds: number      // 특란 + 끓는 물 투입 + 실온 기준
  description: string
  yolkColor: string    // SVG 색상
  yolkTexture: 'liquid' | 'flowing' | 'jammy' | 'custard' | 'soft' | 'firm' | 'hard'
  whiteSet: number     // 0~100
  yolkSet: number      // 0~100
}

export const DONENESS: DonenessStage[] = [
  { id: 'runny',     label: '흐름 노른자',      seconds:  5 * 60,      description: '흰자 거의 다 익음·노른자 완전 흐름. 토스트 디핑',
    yolkColor: '#FFB938', yolkTexture: 'liquid',  whiteSet: 70, yolkSet: 5  },
  { id: 'soft',      label: '반숙',             seconds:  6 * 60,      description: '흰자 다 익음·노른자 60% 흐름. 라면·우동',
    yolkColor: '#FFC940', yolkTexture: 'flowing', whiteSet: 90, yolkSet: 25 },
  { id: 'flowing',   label: '흐름반숙',         seconds:  6 * 60 + 30, description: '노른자 가장자리 살짝 굳음·중심 흐름',
    yolkColor: '#FFCC50', yolkTexture: 'flowing', whiteSet: 95, yolkSet: 40 },
  { id: 'jammy',     label: '잼 노른자',        seconds:  7 * 60,      description: '걸쭉한 잼 농도. 라멘 아지타마·양념장계란',
    yolkColor: '#FFCC55', yolkTexture: 'jammy',   whiteSet: 100, yolkSet: 60 },
  { id: 'custard',   label: '커스터드',         seconds:  8 * 60 + 30, description: '커스터드 푸딩 농도. 살짝 부드러움',
    yolkColor: '#FFD460', yolkTexture: 'custard', whiteSet: 100, yolkSet: 75 },
  { id: 'medium',    label: '부드러운 완숙',    seconds: 10 * 60,      description: '완숙이지만 중심이 살짝 촉촉',
    yolkColor: '#FFE070', yolkTexture: 'soft',    whiteSet: 100, yolkSet: 90 },
  { id: 'hard',      label: '표준 완숙',        seconds: 11 * 60 + 30, description: '균일하게 단단함. 마요계란·샐러드',
    yolkColor: '#FFE885', yolkTexture: 'firm',    whiteSet: 100, yolkSet: 100 },
  { id: 'extra',     label: '단단한 완숙',      seconds: 14 * 60,      description: '아주 단단. 장조림·김밥 (자르기 좋음)',
    yolkColor: '#F5DC8A', yolkTexture: 'hard',    whiteSet: 100, yolkSet: 100 },
]

/* ─── 한국 계란 크기 (축산물품질평가원 표준) ─── */
export interface SizeDef {
  id: string
  label: string
  rangeG: string
  avgG: number
  adjustmentSec: number  // 특란 기준 보정
}

export const SIZES: SizeDef[] = [
  { id: 'wang',  label: '왕란', rangeG: '78g+',   avgG: 80, adjustmentSec:  +30 },
  { id: 'teuk',  label: '특란', rangeG: '68~78g', avgG: 73, adjustmentSec:    0 },
  { id: 'dae',   label: '대란', rangeG: '60~68g', avgG: 64, adjustmentSec:  -15 },
  { id: 'jung',  label: '중란', rangeG: '52~60g', avgG: 56, adjustmentSec:  -30 },
  { id: 'so',    label: '소란', rangeG: '44~52g', avgG: 48, adjustmentSec:  -45 },
]

/* ─── 시작 온도 ─── */
export interface StartTempDef {
  id: string
  label: string
  tempC: number
  adjustmentSec: number
  desc: string
}

export const START_TEMPS: StartTempDef[] = [
  { id: 'fridge', label: '냉장 (4°C)',   tempC: 4,  adjustmentSec: +60, desc: '냉장고에서 바로 — 갈라짐 위험, +1분' },
  { id: 'room',   label: '실온 (20°C)',  tempC: 20, adjustmentSec:   0, desc: '30분~1시간 꺼낸 상태 (권장)' },
  { id: 'warm',   label: '미지근 (30°C)',tempC: 30, adjustmentSec: -30, desc: '미지근 물에 5분 담갔다 빼기' },
]

/* ─── 조리 방법 ─── */
export interface MethodDef {
  id: string
  label: string
  emoji: string
  desc: string
  factor: number          // 시간 배수 (1.0 = 표준)
  flatAdjustSec: number   // 절대 보정
  note: string
}

export const METHODS: MethodDef[] = [
  { id: 'boil',     label: '끓는 물 투입',    emoji: '🍳', factor: 1.0,  flatAdjustSec:   0, desc: '물 끓이기 → 계란 투입 → 타이머 시작',
    note: '가장 정확. 본 도구 기본 기준.' },
  { id: 'cold',     label: '냉수 시작',       emoji: '❄️', factor: 1.0,  flatAdjustSec: 120, desc: '계란 + 찬물 → 같이 끓이기',
    note: '껍질이 잘 벗겨짐. 끓기 시작점부터 -1~2분이지만 끓이는 시간 포함하면 비슷. +2분 가산' },
  { id: 'steam',    label: '찜기',           emoji: '♨️', factor: 1.1,  flatAdjustSec:   0, desc: '찜기에 계란 + 뚜껑',
    note: '균일한 익힘. 끓이기 대비 +10% 가산' },
  { id: 'instapot', label: '인스턴트팟',      emoji: '🍶', factor: 0,    flatAdjustSec: 600, desc: '5-5-5 룰 (압력 5분·자연감압 5분·얼음물 5분)',
    note: '특수 — 익힘 단계와 무관. 통상 표준 완숙' },
]

/* ─── 한국 요리 프리셋 (10종) ─── */
export interface RecipePreset {
  id: string
  label: string
  emoji: string
  donenessId: string
  sizeId: string
  tempId: string
  methodId: string
  tip: string
}

export const RECIPES: RecipePreset[] = [
  { id: 'ramen',     label: '🍜 라면 계란',          emoji: '🍜',
    donenessId: 'jammy', sizeId: 'teuk', tempId: 'fridge', methodId: 'boil',
    tip: '잼 노른자 7분이 라면 토핑 황금 비율. 라면과 별도로 삶아 완성 직전 올리기 (라면 조리 3~5분이라 동시 조리는 어려움)' },
  { id: 'gimbap',    label: '🍙 김밥 계란',          emoji: '🍙',
    donenessId: 'extra', sizeId: 'teuk', tempId: 'fridge', methodId: 'cold',
    tip: '단단한 완숙으로 자르기 좋게. 식초 1Ts 첨가하면 갈라짐 방지' },
  { id: 'jangjorim', label: '🥩 장조림 계란',        emoji: '🥩',
    donenessId: 'hard', sizeId: 'teuk', tempId: 'room', methodId: 'boil',
    tip: '메추리알도 같은 시간. 양념장에 1~2일 절이면 풍미 ↑' },
  { id: 'mayak',     label: '🍱 마야크(양념장) 에그', emoji: '🍱',
    donenessId: 'jammy', sizeId: 'teuk', tempId: 'fridge', methodId: 'boil',
    tip: '잼 노른자가 핵심. 7분 정확히. 양념장(간장+물엿+참기름+파+마늘+홍고추)에 6시간+ 절임' },
  { id: 'ajitama',   label: '🍜 라멘 아지타마',      emoji: '🍜',
    donenessId: 'jammy', sizeId: 'teuk', tempId: 'fridge', methodId: 'cold',
    tip: '라멘 표준 7분 (잼 노른자). 미림+간장+물 1:1:1 절임 12시간+' },
  { id: 'mayo',      label: '🥚 마요계란 (에그샐러드)', emoji: '🥚',
    donenessId: 'hard', sizeId: 'teuk', tempId: 'fridge', methodId: 'boil',
    tip: '완숙 후 으깨고 마요네즈+소금+후추. 머스타드 1Ts 추가 시 풍미 ↑' },
  { id: 'deviled',   label: '🍳 데빌드 에그',        emoji: '🍳',
    donenessId: 'hard', sizeId: 'teuk', tempId: 'fridge', methodId: 'cold',
    tip: '단단한 완숙 후 반으로 잘라 노른자만 빼서 마요+머스타드+파프리카' },
  { id: 'salad',     label: '🥗 반숙 샐러드 토핑',   emoji: '🥗',
    donenessId: 'flowing', sizeId: 'teuk', tempId: 'fridge', methodId: 'boil',
    tip: '6분 30초가 가장 예쁨. 자르면 반쯤 흐르는 노른자' },
  { id: 'baeksuk',   label: '🐔 백숙용 한 알',       emoji: '🐔',
    donenessId: 'extra', sizeId: 'teuk', tempId: 'room', methodId: 'boil',
    tip: '백숙 위에 올리는 단단한 완숙. 14분 권장' },
  { id: 'daily',     label: '🥚 데일리 한 알',       emoji: '🥚',
    donenessId: 'soft', sizeId: 'teuk', tempId: 'fridge', methodId: 'boil',
    tip: '아침 한 알 — 흰자 다 익고 노른자 약간 흐름. 6분이 가장 무난' },
]

/* ─── 계산 ─── */
export interface CalcInputs {
  donenessId: string
  sizeId: string
  tempId: string
  methodId: string
  count: number
  altitudeM: number
}

export interface CalcResult {
  totalSec: number
  baseSec: number
  adjustments: { label: string; sec: number }[]
  doneness: DonenessStage
  size: SizeDef
  temp: StartTempDef
  method: MethodDef
}

export function calculate(inputs: CalcInputs): CalcResult {
  const doneness = DONENESS.find((d) => d.id === inputs.donenessId) ?? DONENESS[1]
  const size     = SIZES.find((s) => s.id === inputs.sizeId) ?? SIZES[1]
  const temp     = START_TEMPS.find((t) => t.id === inputs.tempId) ?? START_TEMPS[1]
  const method   = METHODS.find((m) => m.id === inputs.methodId) ?? METHODS[0]

  const baseSec = doneness.seconds
  const adjustments: { label: string; sec: number }[] = []

  if (method.id === 'instapot') {
    // 5-5-5 룰: 압력 5분 + 자연감압 5분 + 얼음물 5분 = 15분 (단순화)
    return {
      totalSec: 5 * 60,
      baseSec: 5 * 60,
      adjustments: [{ label: '인스턴트팟 5-5-5 (압력 5분만 표시)', sec: 0 }],
      doneness, size, temp, method,
    }
  }

  let total = baseSec * method.factor
  if (method.factor !== 1.0) {
    adjustments.push({ label: `${method.label} ×${method.factor.toFixed(2)}`, sec: total - baseSec })
  }

  // 크기 보정
  if (size.adjustmentSec !== 0) {
    total += size.adjustmentSec
    adjustments.push({ label: `${size.label} ${size.adjustmentSec > 0 ? '+' : ''}${size.adjustmentSec}초`, sec: size.adjustmentSec })
  }

  // 시작 온도 보정
  if (temp.adjustmentSec !== 0) {
    total += temp.adjustmentSec
    adjustments.push({ label: `${temp.label} ${temp.adjustmentSec > 0 ? '+' : ''}${temp.adjustmentSec}초`, sec: temp.adjustmentSec })
  }

  // 조리법 절대 보정
  if (method.flatAdjustSec !== 0) {
    total += method.flatAdjustSec
    adjustments.push({ label: `${method.label} +${method.flatAdjustSec}초`, sec: method.flatAdjustSec })
  }

  // 고도 보정 (100m당 1%)
  if (inputs.altitudeM > 0) {
    const altPercent = (inputs.altitudeM / 100) * 1 / 100
    const altAdjust = total * altPercent
    total += altAdjust
    adjustments.push({ label: `고도 ${inputs.altitudeM}m +${(altPercent * 100).toFixed(1)}%`, sec: altAdjust })
  }

  // 개수 보정 (12개+ 시 +60~120초)
  if (inputs.count >= 12) {
    const countAdj = inputs.count >= 18 ? 120 : 60
    total += countAdj
    adjustments.push({ label: `${inputs.count}개 동시 +${countAdj}초`, sec: countAdj })
  }

  return {
    totalSec: Math.round(total),
    baseSec,
    adjustments,
    doneness, size, temp, method,
  }
}

/* ─── 포맷터 ─── */
export const fmtMS = (sec: number): string => {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export const fmtSec = (sec: number): string => {
  if (sec === 0) return '0초'
  const sign = sec < 0 ? '-' : '+'
  const abs = Math.abs(sec)
  if (abs >= 60) return `${sign}${(abs / 60).toFixed(1)}분`
  return `${sign}${abs}초`
}

/* ─── 트러블슈팅 ─── */
export interface Troubleshoot {
  id: string
  emoji: string
  title: string
  problem: string
  solution: string[]
}

export const TROUBLESHOOTS: Troubleshoot[] = [
  {
    id: 'peel',
    emoji: '🥚',
    title: '껍질이 안 벗겨질 때',
    problem: '계란을 까는데 흰자 째로 뜯어집니다.',
    solution: [
      '5~7일 묵은 계란 사용 (너무 신선하면 막이 단단)',
      '삶을 때 식초 1Ts 또는 베이킹소다 1ts 첨가',
      '삶은 직후 얼음물에 5분 — 막이 수축',
      '계란을 살짝 굴려 균열 낸 뒤 둥근 쪽부터 까기',
    ],
  },
  {
    id: 'green',
    emoji: '💚',
    title: '노른자 회녹색 변색',
    problem: '노른자 표면이 회색-녹색으로 변했어요.',
    solution: [
      '너무 오래 끓이면 황(S)·철(Fe) 반응 → 황화철 형성',
      '12분 이내 끝내고 즉시 얼음물에 식히기',
      '냄새는 황 냄새 — 신선도 문제 아님 (먹어도 안전)',
      '자주 발생하면 조리 시간 1~2분 단축',
    ],
  },
  {
    id: 'crack',
    emoji: '⚠️',
    title: '갈라짐 방지',
    problem: '삶다가 계란이 갈라져 흰자가 새어 나옵니다.',
    solution: [
      '냉장에서 바로 끓는 물 X — 30분 실온 방치',
      '둥근 쪽 (공기집)에 압정으로 미세 구멍 (압력 배출)',
      '식초 1Ts 첨가 — 새어나와도 빨리 응고',
      '계란을 부드럽게 투입 (떨어뜨리지 말기)',
    ],
  },
  {
    id: 'center',
    emoji: '🎯',
    title: '노른자 한쪽으로 치우침',
    problem: '잘랐을 때 노른자가 가장자리에 붙어있어요.',
    solution: [
      '처음 1~2분 동안 숟가락으로 살살 굴려주기',
      '신선한 계란일수록 노른자가 중앙 (5~7일 묵으면 가장자리)',
      '수란기·계란 받침대 사용 시 더 균일',
      '잼 노른자·라멘 아지타마는 노른자 위치 중요 → 굴리기 필수',
    ],
  },
]
