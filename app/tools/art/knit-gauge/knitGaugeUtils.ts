/* 뜨개질 게이지(코·단 수) 계산기 — 데이터·계산 유틸 */

export type GaugeUnit = '10cm' | '4inch' | '1cm'
export type YarnId = 'lace' | 'fingering' | 'sport' | 'dk' | 'worsted' | 'aran' | 'bulky' | 'super_bulky'
export type SizeId = string  /* 'female_xs' | 'male_m' | 'kids_110' 등 */
export type BodyPartId = 'sweater_body' | 'sweater_sleeve' | 'hat' | 'sock' | 'scarf' | 'blanket'
export type ProjectId = 'sweater' | 'cardigan' | 'hat' | 'sock' | 'scarf' | 'blanket' | 'baby'

/* ─────────────────────────────────────────────
   실 굵기 — CYC 표준 0~7
   ───────────────────────────────────────────── */
export interface YarnWeight {
  id: YarnId
  cyc: number          // 0~7
  label: string
  shortLabel: string
  sts10cm: [number, number]  // 권장 코 게이지 (min, max) / 10cm
  rows10cm: [number, number]
  needleMm: [number, number] // 권장 바늘 호수 mm
  examples: string
}

export const YARN_WEIGHTS: YarnWeight[] = [
  { id: 'lace',        cyc: 0, label: 'Lace (0)',         shortLabel: 'Lace',     sts10cm: [32, 36], rows10cm: [40, 50], needleMm: [1.5, 2.25], examples: '레이스·숄·도일리 (예: Habu·Lang Jawoll Lace)' },
  { id: 'fingering',   cyc: 1, label: 'Fingering (1)',    shortLabel: 'Sock',     sts10cm: [28, 32], rows10cm: [35, 42], needleMm: [2.25, 3.25], examples: '양말·스카프·얇은 스웨터 (예: 다루마 4ply·Cascade Heritage)' },
  { id: 'sport',       cyc: 2, label: 'Sport (2)',        shortLabel: 'Sport',    sts10cm: [24, 28], rows10cm: [32, 38], needleMm: [3.25, 3.75], examples: '아동복·얇은 스웨터 (예: Knit Picks Stroll Sport)' },
  { id: 'dk',          cyc: 3, label: 'DK (3)',           shortLabel: 'DK',       sts10cm: [21, 24], rows10cm: [28, 34], needleMm: [3.75, 4.5], examples: '봄·가을 스웨터·가디건 (예: 카람 메리노·DROPS Lima)' },
  { id: 'worsted',     cyc: 4, label: 'Worsted (4)',      shortLabel: 'Worsted',  sts10cm: [16, 20], rows10cm: [22, 28], needleMm: [4.5, 5.5], examples: '겨울 스웨터·모자·장갑 (예: Cascade 220·Patons Classic)' },
  { id: 'aran',        cyc: 5, label: 'Aran (5)',         shortLabel: 'Aran',     sts10cm: [16, 18], rows10cm: [20, 24], needleMm: [5.0, 6.0], examples: '겨울 스웨터·케이블 (예: Aran Tweed)' },
  { id: 'bulky',       cyc: 6, label: 'Bulky (6)',        shortLabel: 'Bulky',    sts10cm: [12, 15], rows10cm: [16, 20], needleMm: [5.5, 8.0], examples: '두꺼운 모자·블랭킷 (예: Lion Brand Wool-Ease)' },
  { id: 'super_bulky', cyc: 7, label: 'Super Bulky (7+)', shortLabel: 'S.Bulky',  sts10cm: [7, 12],  rows10cm: [10, 15], needleMm: [8.0, 12.0], examples: '대형 담요·러그 (예: Bernat Blanket·Wool & The Gang)' },
]

export const getYarn = (id: YarnId) => YARN_WEIGHTS.find((y) => y.id === id) ?? YARN_WEIGHTS[3]

/* ─────────────────────────────────────────────
   한국 표준 사이즈
   ───────────────────────────────────────────── */
export interface SizeMeta {
  id: string
  label: string
  bust: number      // cm (가슴둘레)
  length: number    // cm (몸판 길이)
  sleeve: number    // cm (소매 길이)
  shoulder: number  // cm (어깨 너비)
}

export const SIZES_FEMALE: SizeMeta[] = [
  { id: 'female_xs', label: '여성 XS (85)', bust: 84,  length: 56, sleeve: 53, shoulder: 36 },
  { id: 'female_s',  label: '여성 S (90)',  bust: 88,  length: 58, sleeve: 55, shoulder: 38 },
  { id: 'female_m',  label: '여성 M (95)',  bust: 92,  length: 60, sleeve: 57, shoulder: 39 },
  { id: 'female_l',  label: '여성 L (100)', bust: 96,  length: 62, sleeve: 58, shoulder: 40 },
  { id: 'female_xl', label: '여성 XL (105)', bust: 100, length: 64, sleeve: 59, shoulder: 41 },
]

export const SIZES_MALE: SizeMeta[] = [
  { id: 'male_s', label: '남성 S (95)',  bust: 96,  length: 66, sleeve: 60, shoulder: 42 },
  { id: 'male_m', label: '남성 M (100)', bust: 100, length: 68, sleeve: 61, shoulder: 44 },
  { id: 'male_l', label: '남성 L (105)', bust: 104, length: 70, sleeve: 62, shoulder: 46 },
]

export const SIZES_KIDS: SizeMeta[] = [
  { id: 'kids_100', label: '키즈 100cm', bust: 54, length: 41, sleeve: 35, shoulder: 28 },
  { id: 'kids_110', label: '키즈 110cm', bust: 58, length: 45, sleeve: 38, shoulder: 30 },
  { id: 'kids_120', label: '키즈 120cm', bust: 62, length: 49, sleeve: 41, shoulder: 32 },
]

export const ALL_SIZES = [...SIZES_FEMALE, ...SIZES_MALE, ...SIZES_KIDS]
export const getSize = (id: string) => ALL_SIZES.find((s) => s.id === id)

/* ─────────────────────────────────────────────
   부위별 프리셋
   ───────────────────────────────────────────── */
export interface BodyPart {
  id: BodyPartId
  emoji: string
  name: string
  defaultW: number      // 가로 cm
  defaultH: number      // 세로 cm
  ease?: number         // 신축 보정 (모자·양말, 음수 = 더 작게)
  note: string          // 작업 안내
  isCircular?: boolean  // 원형 작업 여부
}

export const BODY_PARTS: BodyPart[] = [
  { id: 'sweater_body',   emoji: '👕', name: '스웨터 몸통',   defaultW: 50, defaultH: 60, note: '앞·뒤판 동일하게 떠서 옆선 봉합 또는 원형 한 번에 작업.', isCircular: false },
  { id: 'sweater_sleeve', emoji: '💪', name: '스웨터 소매',   defaultW: 25, defaultH: 55, note: '소매 시작은 좁게(손목), 위로 갈수록 넓어짐. 늘림 분배 활용.', isCircular: false },
  { id: 'hat',            emoji: '🎩', name: '모자 (비니)',   defaultW: 56, defaultH: 22, ease: -0.10, note: '머리 둘레보다 10% 작게 떠야 늘어났을 때 잘 맞음. 원형 작업 권장.', isCircular: true },
  { id: 'sock',           emoji: '🧦', name: '양말 발등',     defaultW: 22, defaultH: 25, ease: -0.10, note: '발 둘레보다 10% 작게. 원형 4-DPN 또는 매직 루프 작업.', isCircular: true },
  { id: 'scarf',          emoji: '🧣', name: '스카프',        defaultW: 20, defaultH: 150, note: '평직 작업. 양 끝 무늬 통일이 중요.', isCircular: false },
  { id: 'blanket',        emoji: '🛌', name: '담요',          defaultW: 100, defaultH: 130, note: '대형 작품. 색상 블록·모티브 결합 인기. 실 양 충분히 준비.', isCircular: false },
]

export const getBodyPart = (id: BodyPartId) => BODY_PARTS.find((b) => b.id === id) ?? BODY_PARTS[0]

/* ─────────────────────────────────────────────
   실 양 매트릭스 (g 단위)
   실 굵기 × 작품 종류 × 사이즈
   ───────────────────────────────────────────── */
export interface YarnAmountKey {
  yarn: YarnId
  project: ProjectId
}

/* 사이즈 등급 1~5 (XS=1, S=2, M=3, L=4, XL=5)
   아동·모자·양말·스카프 등은 단일값 또는 둘레로 처리 */

const YARN_AMOUNT_TABLE: Record<string, number[]> = {
  /* sweater [XS, S, M, L, XL] */
  'lace_sweater':        [250, 300, 350, 400, 450],
  'fingering_sweater':   [300, 350, 400, 450, 500],
  'sport_sweater':       [350, 400, 450, 550, 650],
  'dk_sweater':          [400, 450, 500, 600, 700],
  'worsted_sweater':     [500, 600, 700, 800, 900],
  'aran_sweater':        [550, 650, 750, 850, 950],
  'bulky_sweater':       [700, 800, 1000, 1200, 1400],
  'super_bulky_sweater': [800, 950, 1100, 1300, 1500],
  /* cardigan (10~15% 더) */
  'lace_cardigan':        [280, 340, 400, 450, 500],
  'fingering_cardigan':   [340, 400, 450, 500, 600],
  'sport_cardigan':       [400, 450, 500, 600, 700],
  'dk_cardigan':          [450, 500, 600, 700, 800],
  'worsted_cardigan':     [550, 650, 800, 900, 1000],
  'aran_cardigan':        [600, 700, 850, 950, 1100],
  'bulky_cardigan':       [800, 950, 1150, 1350, 1550],
  'super_bulky_cardigan': [950, 1100, 1300, 1500, 1700],
}

/* 사이즈 무관 작품 (모자·양말·스카프·담요·아기) */
const YARN_AMOUNT_FIXED: Record<string, number> = {
  'lace_hat': 50, 'fingering_hat': 60, 'sport_hat': 80, 'dk_hat': 100,
  'worsted_hat': 130, 'aran_hat': 140, 'bulky_hat': 180, 'super_bulky_hat': 220,

  'lace_sock': 70, 'fingering_sock': 100, 'sport_sock': 120, 'dk_sock': 140,
  'worsted_sock': 170, 'aran_sock': 180, 'bulky_sock': 220, 'super_bulky_sock': 260,

  'lace_scarf': 100, 'fingering_scarf': 150, 'sport_scarf': 200, 'dk_scarf': 250,
  'worsted_scarf': 300, 'aran_scarf': 350, 'bulky_scarf': 450, 'super_bulky_scarf': 550,

  'lace_blanket': 600, 'fingering_blanket': 800, 'sport_blanket': 1000, 'dk_blanket': 1300,
  'worsted_blanket': 1700, 'aran_blanket': 1900, 'bulky_blanket': 2400, 'super_bulky_blanket': 3000,

  'lace_baby': 150, 'fingering_baby': 200, 'sport_baby': 250, 'dk_baby': 300,
  'worsted_baby': 350, 'aran_baby': 400, 'bulky_baby': 500, 'super_bulky_baby': 600,
}

/* ─────────────────────────────────────────────
   늘림·줄임 약어집
   ───────────────────────────────────────────── */
export interface IncDecGlossary {
  abbr: string
  fullName: string
  korean: string
  type: '늘림' | '줄임' | '평직'
  desc: string
}

export const INC_DEC_GLOSSARY: IncDecGlossary[] = [
  { abbr: 'M1L',   fullName: 'Make 1 Left',         korean: '왼쪽 늘림',     type: '늘림', desc: '두 코 사이 가로실을 왼쪽으로 들어 올려 1코 늘림. 거의 보이지 않음.' },
  { abbr: 'M1R',   fullName: 'Make 1 Right',        korean: '오른쪽 늘림',   type: '늘림', desc: '두 코 사이 가로실을 오른쪽으로 들어 올려 1코 늘림. M1L과 좌우 대칭.' },
  { abbr: 'kfb',   fullName: 'Knit Front and Back', korean: '한 코에 두 번', type: '늘림', desc: '한 코의 앞·뒤에 모두 떠 1코 늘림. 작은 매듭이 보임. 입문자 친화적.' },
  { abbr: 'yo',    fullName: 'Yarn Over',           korean: '바늘에 한 번',  type: '늘림', desc: '실을 바늘 위로 한 번 감아 1코 늘림. 구멍이 생김(레이스 패턴).' },
  { abbr: 'k2tog', fullName: 'Knit 2 Together',     korean: '두 코 함께',    type: '줄임', desc: '두 코를 한 번에 떠 1코 줄임. 오른쪽으로 기울어짐.' },
  { abbr: 'ssk',   fullName: 'Slip Slip Knit',      korean: '왼쪽으로 줄임', type: '줄임', desc: '두 코를 따로 옮긴 후 함께 떠 1코 줄임. 왼쪽으로 기울어짐(k2tog의 거울).' },
  { abbr: 'k3tog', fullName: 'Knit 3 Together',     korean: '세 코 함께',    type: '줄임', desc: '세 코를 한 번에 떠 2코 줄임. 가파른 줄임.' },
  { abbr: 'cdd',   fullName: 'Centered Double Dec', korean: '중앙 이중 줄임', type: '줄임', desc: '3코를 중앙 1코 위로 모아 2코 줄임. 좌우 대칭, 모자 정수리에 자주 쓰임.' },
  { abbr: 'p2tog', fullName: 'Purl 2 Together',     korean: '안뜨기 두 코',  type: '줄임', desc: '두 코를 안뜨기로 함께 떠 1코 줄임. 안면 줄임.' },
  { abbr: 'k',     fullName: 'Knit',                korean: '겉뜨기',       type: '평직', desc: '기본 겉뜨기. "k5"는 5코 겉뜨기.' },
]

/* ═════════════════════════════════════════════
   계산 함수
   ═════════════════════════════════════════════ */

/** 입력 단위(10cm/4inch/1cm) → 10cm 기준 게이지 정규화 */
export function normalizeGauge(value: number, unit: GaugeUnit): number {
  switch (unit) {
    case '10cm':  return value
    case '4inch': return value * (10 / (4 * 2.54))   /* 4inch = 10.16cm → 10cm로 환산 */
    case '1cm':   return value * 10
  }
}

/** 1cm·1코·1단 환산 */
export function gaugePerCm(stsPer10cm: number, rowsPer10cm: number) {
  const stsPerCm = stsPer10cm / 10
  const rowsPerCm = rowsPer10cm / 10
  return {
    stsPerCm,
    rowsPerCm,
    mmPerSt: stsPerCm > 0 ? 10 / stsPer10cm : 0,
    mmPerRow: rowsPerCm > 0 ? 10 / rowsPer10cm : 0,
  }
}

/** 입력 게이지 → CYC 실 굵기 추정 (가장 가까운) */
export function estimateYarnWeight(stsPer10cm: number): YarnWeight {
  let best = YARN_WEIGHTS[0]
  let bestDist = Infinity
  for (const y of YARN_WEIGHTS) {
    const center = (y.sts10cm[0] + y.sts10cm[1]) / 2
    const d = Math.abs(stsPer10cm - center)
    if (d < bestDist) { bestDist = d; best = y }
  }
  return best
}

/** 게이지 → 권장 바늘 호수 (mm) */
export function needleSizeForGauge(stsPer10cm: number): { min: number; max: number; recommended: number } {
  const y = estimateYarnWeight(stsPer10cm)
  return {
    min: y.needleMm[0],
    max: y.needleMm[1],
    recommended: (y.needleMm[0] + y.needleMm[1]) / 2,
  }
}

/* ─────────────────────────────────────────────
   탭 2 — 패턴 변환
   ───────────────────────────────────────────── */
export interface PatternConversionInput {
  patternStsGauge: number   // 패턴 코 게이지 / 10cm
  patternRowsGauge: number  // 패턴 단 게이지 / 10cm
  patternSts: number        // 패턴 시작 코
  patternRows: number       // 패턴 단 수
  myStsGauge: number        // 내 코 게이지
  myRowsGauge: number       // 내 단 게이지
}

export interface PatternConversionResult {
  newSts: number
  newRows: number
  stsDeltaPct: number       // 패턴 대비 차이 % (음수 = 적음, 양수 = 많음)
  rowsDeltaPct: number
  needleAdvice: string      // 바늘 호수 코칭 메시지
  ratioWarning: boolean     // 코·단 비율이 크게 다른 경우
}

export function convertPattern(input: PatternConversionInput): PatternConversionResult {
  const { patternStsGauge, patternRowsGauge, patternSts, patternRows, myStsGauge, myRowsGauge } = input

  /* 내 게이지 기준 환산 (cm 동일하게 유지) */
  const targetWidthCm = (patternSts / patternStsGauge) * 10
  const targetHeightCm = (patternRows / patternRowsGauge) * 10
  const newSts = Math.round((targetWidthCm / 10) * myStsGauge)
  const newRows = Math.round((targetHeightCm / 10) * myRowsGauge)

  const stsDeltaPct = patternStsGauge > 0 ? ((myStsGauge - patternStsGauge) / patternStsGauge) * 100 : 0
  const rowsDeltaPct = patternRowsGauge > 0 ? ((myRowsGauge - patternRowsGauge) / patternRowsGauge) * 100 : 0

  /* 바늘 코칭 — 내 게이지가 헐거우면(코 적음) 작은 바늘로 */
  let needleAdvice = '✓ 패턴 게이지와 거의 일치 — 바늘 호수 그대로 진행'
  if (stsDeltaPct < -8) {
    needleAdvice = '🔼 내 게이지가 헐거움 (코 수 ↓) — 한 호수 작은 바늘 권장'
  } else if (stsDeltaPct > 8) {
    needleAdvice = '🔽 내 게이지가 빽빽함 (코 수 ↑) — 한 호수 큰 바늘 권장'
  }

  /* 비율 경고 — 코와 단 게이지 차이 % 격차가 큰 경우 */
  const ratioWarning = Math.abs(stsDeltaPct - rowsDeltaPct) >= 15

  return { newSts, newRows, stsDeltaPct, rowsDeltaPct, needleAdvice, ratioWarning }
}

/* ─────────────────────────────────────────────
   탭 3 — 사이즈 → 코·단
   ───────────────────────────────────────────── */
export interface SizeToCountsResult {
  sts: number
  rows: number
  stsRaw: number   /* 반올림 전 */
  rowsRaw: number
  evenSts: number  /* 짝수 권장 */
  oddSts: number   /* 홀수 권장 */
}

export function sizeToCounts(
  widthCm: number,
  heightCm: number,
  stsPer10cm: number,
  rowsPer10cm: number,
  ease: number = 0,
): SizeToCountsResult {
  const adjustedW = widthCm * (1 + ease)
  const adjustedH = heightCm * (1 + ease)
  const stsRaw = (adjustedW / 10) * stsPer10cm
  const rowsRaw = (adjustedH / 10) * rowsPer10cm
  const sts = Math.round(stsRaw)
  const rows = Math.round(rowsRaw)
  const evenSts = sts % 2 === 0 ? sts : sts + 1
  const oddSts = sts % 2 === 1 ? sts : sts + 1
  return { sts, rows, stsRaw, rowsRaw, evenSts, oddSts }
}

/* ─────────────────────────────────────────────
   탭 4 — 늘림·줄임 균등 분배
   Jeny's Surprisingly Stretchy Algorithm 단순화
   ───────────────────────────────────────────── */
export interface IncDecResult {
  type: '늘림' | '줄임' | '변화 없음'
  delta: number              // |target - current|
  baseStep: number           // 기본 step (매 N코마다)
  bonusStep: number          // 보너스 step (N+1코마다)
  bonusCount: number         // 보너스 횟수
  baseCount: number          // 기본 횟수
  remainder: number          // 끝에 남는 코
  label: string              // "매 3코마다 1코 늘림 × 8회 + 매 4코마다 1코 늘림 × 12회"
  unit: '코' | '단'
}

export function distributeIncDec(current: number, target: number, unit: '코' | '단' = '코'): IncDecResult {
  if (current === target) {
    return {
      type: '변화 없음', delta: 0, baseStep: 0, bonusStep: 0,
      bonusCount: 0, baseCount: 0, remainder: 0, unit,
      label: '변화 없음 (현재 = 목표)',
    }
  }
  const isInc = target > current
  const type: '늘림' | '줄임' = isInc ? '늘림' : '줄임'
  const delta = Math.abs(target - current)
  if (delta <= 0 || current <= 0) {
    return {
      type, delta, baseStep: 0, bonusStep: 0,
      bonusCount: 0, baseCount: 0, remainder: 0, unit,
      label: '계산 불가',
    }
  }

  /* 입력 코를 delta+1 구간으로 나눠 균등 분배
     (마지막 구간은 끝에 평직으로 남김) */
  const intervals = delta  /* 늘림/줄임이 일어날 위치 수 */
  const span = current     /* 분배할 총 코 */
  const baseStep = Math.floor(span / intervals)
  const remainder = span - baseStep * intervals
  const bonusStep = baseStep + 1
  const bonusCount = remainder
  const baseCount = intervals - bonusCount

  let label = ''
  if (bonusCount === 0) {
    label = `매 ${baseStep}${unit}마다 1${unit} ${type} × ${baseCount}회`
  } else if (baseCount === 0) {
    label = `매 ${bonusStep}${unit}마다 1${unit} ${type} × ${bonusCount}회`
  } else {
    label = `매 ${bonusStep}${unit}마다 1${unit} ${type} × ${bonusCount}회 + 매 ${baseStep}${unit}마다 1${unit} ${type} × ${baseCount}회`
  }

  return { type, delta, baseStep, bonusStep, bonusCount, baseCount, remainder: 0, unit, label }
}

/* ─────────────────────────────────────────────
   실 양 추정
   ───────────────────────────────────────────── */
export interface YarnEstimateResult {
  grams: number
  balls50g: number
  balls100g: number
  note: string
}

export function estimateYarn(
  yarnId: YarnId,
  projectId: ProjectId,
  sizeId?: string,
): YarnEstimateResult {
  /* 사이즈 의존 (sweater·cardigan) */
  const sizedTable = YARN_AMOUNT_TABLE[`${yarnId}_${projectId}`]
  if (sizedTable) {
    /* 사이즈 등급 추출 */
    const sizeIdx = sizeIdxFromId(sizeId)
    const grams = sizedTable[sizeIdx] ?? sizedTable[2]
    return {
      grams,
      balls50g: Math.ceil(grams / 50),
      balls100g: Math.ceil(grams / 100),
      note: `${getYarn(yarnId).label} · ${projectLabelById(projectId)} · 사이즈 ${sizeLabel(sizeIdx)}`,
    }
  }

  /* 사이즈 무관 (모자·양말·스카프·담요·아기) */
  const fixed = YARN_AMOUNT_FIXED[`${yarnId}_${projectId}`]
  if (fixed) {
    return {
      grams: fixed,
      balls50g: Math.ceil(fixed / 50),
      balls100g: Math.ceil(fixed / 100),
      note: `${getYarn(yarnId).label} · ${projectLabelById(projectId)}`,
    }
  }

  /* 데이터 없음 */
  return { grams: 0, balls50g: 0, balls100g: 0, note: '추정 데이터 없음' }
}

/** 사이즈 ID → 인덱스 (XS=0 ... XL=4) */
function sizeIdxFromId(sizeId?: string): number {
  if (!sizeId) return 2
  if (sizeId.endsWith('xs')) return 0
  if (sizeId.endsWith('_s'))  return 1
  if (sizeId.endsWith('_m'))  return 2
  if (sizeId.endsWith('_l'))  return 3
  if (sizeId.endsWith('xl')) return 4
  return 2
}

function sizeLabel(idx: number): string {
  return ['XS', 'S', 'M', 'L', 'XL'][idx] ?? 'M'
}

export function projectLabelById(id: ProjectId): string {
  switch (id) {
    case 'sweater':  return '스웨터'
    case 'cardigan': return '가디건'
    case 'hat':      return '모자'
    case 'sock':     return '양말'
    case 'scarf':    return '스카프'
    case 'blanket':  return '담요'
    case 'baby':     return '아기 옷'
  }
}

export const PROJECTS: { id: ProjectId; emoji: string; label: string; sizeRequired: boolean }[] = [
  { id: 'sweater',  emoji: '👕', label: '스웨터',   sizeRequired: true },
  { id: 'cardigan', emoji: '🧥', label: '가디건',   sizeRequired: true },
  { id: 'hat',      emoji: '🎩', label: '모자',     sizeRequired: false },
  { id: 'sock',     emoji: '🧦', label: '양말',     sizeRequired: false },
  { id: 'scarf',    emoji: '🧣', label: '스카프',   sizeRequired: false },
  { id: 'blanket',  emoji: '🛌', label: '담요',     sizeRequired: false },
  { id: 'baby',     emoji: '👶', label: '아기 옷',  sizeRequired: false },
]

/* ─────────────────────────────────────────────
   바늘 호수 표 (1.5mm ~ 12mm)
   ───────────────────────────────────────────── */
export interface NeedleRow {
  mm: number
  usSize: string
  ukSize: string
  recommendedYarn: string
  approxStsGauge: string  /* 평균 코 게이지 / 10cm */
}

export const NEEDLE_TABLE: NeedleRow[] = [
  { mm: 1.5,  usSize: '000',  ukSize: '17', recommendedYarn: 'Lace',         approxStsGauge: '32-36' },
  { mm: 2.0,  usSize: '0',    ukSize: '14', recommendedYarn: 'Lace·Fingering', approxStsGauge: '30-34' },
  { mm: 2.25, usSize: '1',    ukSize: '13', recommendedYarn: 'Fingering',    approxStsGauge: '28-32' },
  { mm: 2.5,  usSize: '1.5',  ukSize: '12', recommendedYarn: 'Fingering',    approxStsGauge: '28-30' },
  { mm: 2.75, usSize: '2',    ukSize: '12', recommendedYarn: 'Fingering·Sport', approxStsGauge: '26-30' },
  { mm: 3.0,  usSize: '2.5',  ukSize: '11', recommendedYarn: 'Sport',        approxStsGauge: '24-28' },
  { mm: 3.25, usSize: '3',    ukSize: '10', recommendedYarn: 'Sport',        approxStsGauge: '24-28' },
  { mm: 3.5,  usSize: '4',    ukSize: '9',  recommendedYarn: 'Sport·DK',     approxStsGauge: '22-26' },
  { mm: 3.75, usSize: '5',    ukSize: '9',  recommendedYarn: 'DK',           approxStsGauge: '21-24' },
  { mm: 4.0,  usSize: '6',    ukSize: '8',  recommendedYarn: 'DK',           approxStsGauge: '21-24' },
  { mm: 4.5,  usSize: '7',    ukSize: '7',  recommendedYarn: 'DK·Worsted',   approxStsGauge: '18-22' },
  { mm: 5.0,  usSize: '8',    ukSize: '6',  recommendedYarn: 'Worsted',      approxStsGauge: '16-20' },
  { mm: 5.5,  usSize: '9',    ukSize: '5',  recommendedYarn: 'Worsted·Aran', approxStsGauge: '16-18' },
  { mm: 6.0,  usSize: '10',   ukSize: '4',  recommendedYarn: 'Aran',         approxStsGauge: '14-18' },
  { mm: 6.5,  usSize: '10.5', ukSize: '3',  recommendedYarn: 'Aran·Bulky',   approxStsGauge: '14-16' },
  { mm: 7.0,  usSize: '10.75', ukSize: '2', recommendedYarn: 'Bulky',        approxStsGauge: '12-15' },
  { mm: 8.0,  usSize: '11',   ukSize: '0',  recommendedYarn: 'Bulky',        approxStsGauge: '11-14' },
  { mm: 9.0,  usSize: '13',   ukSize: '00', recommendedYarn: 'Super Bulky',  approxStsGauge: '8-12' },
  { mm: 10.0, usSize: '15',   ukSize: '000', recommendedYarn: 'Super Bulky', approxStsGauge: '7-10' },
  { mm: 12.0, usSize: '17',   ukSize: '—',  recommendedYarn: 'Super Bulky+', approxStsGauge: '6-9' },
]

/* ═════════════════════════════════════════════
   포맷
   ═════════════════════════════════════════════ */
export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const fmtInt = (n: number) =>
  Math.round(n).toLocaleString('ko-KR')

export const fmtSign = (n: number, digits = 1) => {
  const s = n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  return n > 0 ? `+${s}` : s
}
