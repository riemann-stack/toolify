/* ──────────────────────────────────────────────────────
   health/pet/petUtils.ts
   강아지·고양이 — DER 명시적 매핑(버그 수정), BCS, 수명 진행률
   ────────────────────────────────────────────────────── */

export type Species = 'dog' | 'cat'
export type DogSize = 'tiny' | 'small' | 'medium' | 'large'
export type Activity = 'low' | 'normal' | 'high'

/* ─── RER (기초 에너지 요구량) ─── */
export function rer(weightKg: number): number {
  if (weightKg <= 0) return 0
  return 70 * Math.pow(weightKg, 0.75)
}

/* ─── 사람 나이 환산 ─── */
export function dogHumanAge(yrs: number, mos: number, size: DogSize): number {
  const a = yrs + mos / 12
  if (a <= 0) return 0
  const inc = size === 'large' ? 6 : size === 'medium' ? 5 : 4.5
  if (a <= 1) return Math.round(15 * a)
  if (a <= 2) return Math.round(15 + 9 * (a - 1))
  return Math.round(24 + inc * (a - 2))
}

export function catHumanAge(yrs: number, mos: number): number {
  const a = yrs + mos / 12
  if (a <= 0) return 0
  if (a <= 1) return Math.round(15 * a)
  if (a <= 2) return Math.round(15 + 9 * (a - 1))
  return Math.round(24 + 4 * (a - 2))
}

/* ─── 생애 단계 ─── */
export type DogStage = '퍼피' | '청년견' | '중년견' | '노령견'
export type CatStage = '키튼' | '성묘' | '시니어' | '슈퍼시니어'

export function getDogStage(yrs: number, mos: number, size: DogSize): DogStage {
  const a = yrs + mos / 12
  // 시니어 임계 (대형은 7세, 중형 8세, 소형/초소형 9세)
  const seniorThreshold = size === 'large' ? 7 : size === 'medium' ? 8 : 9
  if (a < 1) return '퍼피'
  if (a < 3) return '청년견'
  if (a < seniorThreshold) return '중년견'
  return '노령견'
}

export function getCatStage(yrs: number, mos: number): CatStage {
  const a = yrs + mos / 12
  if (a < 1) return '키튼'
  if (a < 7) return '성묘'
  if (a < 11) return '시니어'
  return '슈퍼시니어'
}

/* ─── DER 명시적 매핑 (★★★★ 버그 수정 핵심) ─── */
type AdultKey = `${'neutered' | 'intact'}_${Activity}`

interface DerEntry { factor: number; label: string }

const DOG_ADULT_FACTORS: Record<AdultKey, DerEntry> = {
  neutered_low:    { factor: 1.2, label: '중성화 · 활동 낮음' },
  neutered_normal: { factor: 1.4, label: '중성화 · 활동 보통' },
  neutered_high:   { factor: 1.6, label: '중성화 · 활동 높음' },
  intact_low:      { factor: 1.4, label: '미중성화 · 활동 낮음' },
  intact_normal:   { factor: 1.6, label: '미중성화 · 활동 보통' },
  intact_high:     { factor: 1.8, label: '미중성화 · 활동 높음' },
}

const CAT_ADULT_FACTORS: Record<AdultKey, DerEntry> = {
  neutered_low:    { factor: 1.2, label: '중성화 · 활동 낮음 (실내)' },
  neutered_normal: { factor: 1.4, label: '중성화 · 활동 보통' },
  neutered_high:   { factor: 1.6, label: '중성화 · 활동 높음' },
  intact_low:      { factor: 1.4, label: '미중성화 · 활동 낮음' },
  intact_normal:   { factor: 1.6, label: '미중성화 · 활동 보통' },
  intact_high:     { factor: 1.8, label: '미중성화 · 활동 높음 (실외 포함)' },
}

export interface DerResult {
  factor: number
  label: string
  stage: 'puppy' | 'adult' | 'senior'
}

export function getDerFactor(
  species: Species,
  yrs: number,
  mos: number,
  size: DogSize,
  isNeutered: boolean,
  activity: Activity,
): DerResult {
  const ageYears = yrs + mos / 12

  // 1. 퍼피·키튼 (1세 미만)
  if (ageYears < 1) {
    return { factor: 2.5, label: species === 'dog' ? '퍼피·성장기' : '키튼·성장기', stage: 'puppy' }
  }

  // 2. 시니어
  let isSenior = false
  if (species === 'dog') {
    const seniorThreshold = size === 'large' ? 7 : size === 'medium' ? 8 : 9
    isSenior = ageYears >= seniorThreshold
  } else {
    isSenior = ageYears >= 11
  }
  if (isSenior) {
    return {
      factor: 1.1,
      label: species === 'dog' ? '노령견' : '슈퍼시니어 고양이',
      stage: 'senior',
    }
  }

  // 3. 성견·성묘 — 명시적 키 조회 (조건문 X)
  const key: AdultKey = `${isNeutered ? 'neutered' : 'intact'}_${activity}`
  const table = species === 'dog' ? DOG_ADULT_FACTORS : CAT_ADULT_FACTORS
  const entry = table[key]
  if (!entry) {
    // 안전 장치 — 이론상 도달 불가
    return { factor: 1.4, label: '기본', stage: 'adult' }
  }
  return { ...entry, stage: 'adult' }
}

/* ─── 체중 평가 (BCS, Body Condition Score 추정) ─── */
export type BodyStatus = 'underweight' | 'ideal' | 'overweight' | 'obese'

export interface BodyEvaluation {
  status: BodyStatus
  label: string
  message: string
  range?: { min: number; max: number; sizeName: string }
  color: string
}

const DOG_IDEAL_WEIGHT: Record<DogSize, { min: number; max: number; name: string }> = {
  tiny:   { min: 1.5, max: 5,   name: '초소형' },
  small:  { min: 5,   max: 10,  name: '소형' },
  medium: { min: 10,  max: 25,  name: '중형' },
  large:  { min: 25,  max: 45,  name: '대형' },
}

export function evaluateBody(species: Species, weight: number, size: DogSize): BodyEvaluation {
  if (species === 'cat') {
    if (weight < 3.0)  return { status: 'underweight', label: '저체중', color: '#0891B2',
      message: '평균보다 가벼운 편입니다. 식욕·활동·치아 점검을 권장합니다.' }
    if (weight <= 5.5) return { status: 'ideal',       label: '적정 체중', color: '#059669',
      message: '일반적인 고양이 정상 체중 범위입니다 (3.0~5.5kg).',
      range: { min: 3.0, max: 5.5, sizeName: '고양이' } }
    if (weight <= 7.0) return { status: 'overweight',  label: '과체중', color: '#CA8A04',
      message: '관절·심장 부담이 늘어납니다. 사료량 10~15% 감량 + 놀이 시간 ↑ 권장.' }
    return                     { status: 'obese',       label: '비만', color: '#DC2626',
      message: '비만은 당뇨·관절염 위험이 큽니다. 수의사 상담 후 감량 계획을 권장합니다.' }
  }

  // 강아지 — 품종 크기별 정상 범위 기준 ±15%
  const range = DOG_IDEAL_WEIGHT[size]
  const idealMid = (range.min + range.max) / 2
  const ratio = weight / idealMid

  if (ratio < 0.85)
    return { status: 'underweight', label: '저체중', color: '#0891B2',
      message: '평균보다 가벼운 편입니다. 영양·기생충·치아 점검을 권장합니다.',
      range: { ...range, sizeName: range.name } }
  if (ratio < 1.15)
    return { status: 'ideal', label: '적정 체중', color: '#059669',
      message: `${range.name}견 정상 체중 범위 (${range.min}~${range.max}kg).`,
      range: { ...range, sizeName: range.name } }
  if (ratio < 1.30)
    return { status: 'overweight', label: '과체중', color: '#CA8A04',
      message: '관절 부담이 늘어납니다. 사료량 10~15% 감량을 권장합니다.',
      range: { ...range, sizeName: range.name } }
  return     { status: 'obese', label: '비만', color: '#DC2626',
      message: '비만견은 수명 1.5~2년 단축 보고가 있습니다. 수의사 감량 계획을 권장합니다.',
      range: { ...range, sizeName: range.name } }
}

/* ─── 평균 수명 ─── */
const DOG_LIFESPAN: Record<DogSize, { avg: number; max: number; note: string }> = {
  tiny:   { avg: 14, max: 18, note: '초소형견은 가장 오래 삽니다.' },
  small:  { avg: 13, max: 16, note: '' },
  medium: { avg: 12, max: 15, note: '' },
  large:  { avg: 10, max: 13, note: '대형견은 노화 속도가 빠릅니다.' },
}

const CAT_LIFESPAN = {
  indoor:  { avg: 15, max: 20, note: '실내 고양이 평균.' },
  outdoor: { avg: 7,  max: 10, note: '실외 고양이는 사고·질병 위험이 큽니다.' },
}

export type LifeStage = 'early' | 'mid' | 'late' | 'beyond'

export interface LifeProgress {
  avg: number
  max: number
  progressPercent: number
  remainingYears: number
  stage: LifeStage
  stageLabel: string
  stageMessage: string
  note: string
}

export function calcLifeProgress(
  species: Species, yrs: number, mos: number, size: DogSize, catActivity: Activity = 'normal',
): LifeProgress {
  const ageYears = yrs + mos / 12
  const data = species === 'dog'
    ? DOG_LIFESPAN[size]
    : (catActivity === 'high' ? CAT_LIFESPAN.outdoor : CAT_LIFESPAN.indoor)

  const progressPercent = Math.max(0, Math.min(150, (ageYears / data.avg) * 100))
  const remainingYears = Math.max(0, data.avg - ageYears)

  let stage: LifeStage
  if (progressPercent < 33)      stage = 'early'
  else if (progressPercent < 66) stage = 'mid'
  else if (progressPercent < 100) stage = 'late'
  else                            stage = 'beyond'

  const stageDescriptions: Record<LifeStage, { label: string; message: string }> = {
    early:  { label: '초기',     message: '젊은 시기. 활발한 활동·중성화 시기·기본 백신 관리 시기입니다.' },
    mid:    { label: '성숙기',   message: '연 1회 건강검진 · 치석 관리 · 체중 모니터링을 권장합니다.' },
    late:   { label: '노령기',   message: '반기 1회 검진 · 관절·신장 기능 모니터링을 권장합니다.' },
    beyond: { label: '평균 초과', message: '평균 수명을 넘겼습니다. 검진 빈도를 더 늘리고 컨디션 변화를 면밀히 관찰하세요.' },
  }

  return {
    avg: data.avg,
    max: data.max,
    progressPercent: Math.round(progressPercent * 10) / 10,
    remainingYears: Math.round(remainingYears * 10) / 10,
    stage,
    stageLabel: stageDescriptions[stage].label,
    stageMessage: stageDescriptions[stage].message,
    note: data.note,
  }
}

/* ─── 통합 결과 (React useMemo 단일 호출용) ─── */
export interface PetCalcInput {
  species: Species
  yrs: number
  mos: number
  weight: number
  size: DogSize       // 고양이는 size='small' 같은 값 무시
  isNeutered: boolean
  activity: Activity
  foodKcalPer100g?: number
}

export interface PetCalcResult {
  humanAge: number
  stage: string
  rerVal: number
  derFactor: number
  derFactorLabel: string
  der: number
  treatKcal: number
  waterMl: number
  body: BodyEvaluation
  life: LifeProgress
}

export function calculateAll(input: PetCalcInput): PetCalcResult {
  const humanAge = input.species === 'dog'
    ? dogHumanAge(input.yrs, input.mos, input.size)
    : catHumanAge(input.yrs, input.mos)
  const stageStr = input.species === 'dog'
    ? getDogStage(input.yrs, input.mos, input.size)
    : getCatStage(input.yrs, input.mos)

  const rerVal = Math.round(rer(input.weight))
  const derInfo = getDerFactor(input.species, input.yrs, input.mos, input.size, input.isNeutered, input.activity)
  const der = Math.round(rerVal * derInfo.factor)
  const treatKcal = Math.round(der * 0.1)
  const waterMl = Math.round(input.weight * 55)
  const body = evaluateBody(input.species, input.weight, input.size)
  const life = calcLifeProgress(input.species, input.yrs, input.mos, input.size, input.activity)

  return {
    humanAge,
    stage: stageStr,
    rerVal,
    derFactor: derInfo.factor,
    derFactorLabel: derInfo.label,
    der,
    treatKcal,
    waterMl,
    body,
    life,
  }
}

/* ─── 자체 단위 테스트 (개발 시 console에서 검증) ──────────────────────────────
   사용: import { runPetUtilsSelfTest } from './petUtils'; runPetUtilsSelfTest()
   ────────────────────────────────────────────────────────────────────────── */
export function runPetUtilsSelfTest(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = []
  let passed = 0
  const expect = (label: string, actual: unknown, expected: unknown) => {
    if (actual === expected) { passed++ } else { errors.push(`❌ ${label}: ${actual} ≠ ${expected}`) }
  }

  // 강아지 성견 6조합
  expect('dog adult neutered low → 1.2',    getDerFactor('dog', 5, 0, 'small', true,  'low').factor, 1.2)
  expect('dog adult neutered normal → 1.4', getDerFactor('dog', 5, 0, 'small', true,  'normal').factor, 1.4)
  expect('dog adult neutered high → 1.6',   getDerFactor('dog', 5, 0, 'small', true,  'high').factor, 1.6)
  expect('dog adult intact low → 1.4',      getDerFactor('dog', 5, 0, 'small', false, 'low').factor, 1.4)
  expect('dog adult intact normal → 1.6',   getDerFactor('dog', 5, 0, 'small', false, 'normal').factor, 1.6)
  expect('dog adult intact high → 1.8',     getDerFactor('dog', 5, 0, 'small', false, 'high').factor, 1.8)
  // 고양이 (현재 버그 케이스 검증)
  expect('cat adult neutered normal → 1.4 (BUG)', getDerFactor('cat', 5, 0, 'small', true, 'normal').factor, 1.4)
  expect('cat adult neutered low → 1.2',          getDerFactor('cat', 5, 0, 'small', true, 'low').factor, 1.2)
  // 경계
  expect('puppy 0.5y → 2.5',           getDerFactor('dog', 0, 6, 'small', false, 'high').factor, 2.5)
  expect('large dog 7y → senior',      getDerFactor('dog', 7, 0, 'large', true, 'normal').stage, 'senior')
  expect('small dog 7y → adult',       getDerFactor('dog', 7, 0, 'small', true, 'normal').stage, 'adult')
  expect('cat 11y → senior',           getDerFactor('cat', 11, 0, 'small', true, 'normal').stage, 'senior')

  return { passed, failed: errors.length, errors }
}
