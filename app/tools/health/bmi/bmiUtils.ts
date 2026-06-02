/* ──────────────────────────────────────────────────────
   health/bmi/bmiUtils.ts
   BMI 종합 도구 — 분류·체중구간·목표·허리둘레·체지방률
   ────────────────────────────────────────────────────── */

export type Standard = 'WHO' | 'KOREA'
export type Gender = 'male' | 'female'

export interface BmiCategory {
  id: string
  min: number
  max: number
  name: string
  color: string
  desc: string
}

export const BMI_CATEGORIES: Record<Standard, BmiCategory[]> = {
  WHO: [
    { id: 'underweight', min: 0,    max: 18.5, name: '저체중',   color: '#0891B2',
      desc: '영양 부족 위험. 적정 영양 섭취 권장.' },
    { id: 'normal',      min: 18.5, max: 25.0, name: '정상',     color: '#059669',
      desc: '건강 체중 범위. 균형 잡힌 식단 + 규칙적 운동 유지.' },
    { id: 'overweight',  min: 25.0, max: 30.0, name: '과체중',   color: '#CA8A04',
      desc: '대사질환 위험 약간 증가. 체중 관리 권장.' },
    { id: 'obese-1',     min: 30.0, max: 35.0, name: '비만 1단계', color: '#EA580C',
      desc: '대사질환·심혈관 위험 증가.' },
    { id: 'obese-2',     min: 35.0, max: 40.0, name: '비만 2단계', color: '#DC2626',
      desc: '건강 위험 매우 높음. 의료 상담 권장.' },
    { id: 'obese-3',     min: 40.0, max: 999,  name: '비만 3단계', color: '#CC4444',
      desc: '고도 비만. 의료 전문가 상담 필수.' },
  ],
  KOREA: [
    { id: 'underweight', min: 0,    max: 18.5, name: '저체중',   color: '#0891B2',
      desc: '영양 부족 위험.' },
    { id: 'normal',      min: 18.5, max: 23.0, name: '정상',     color: '#059669',
      desc: '건강 체중 범위 (한국 기준).' },
    { id: 'overweight',  min: 23.0, max: 25.0, name: '과체중',   color: '#CA8A04',
      desc: '한국인 기준 건강 위험 시작 구간.' },
    { id: 'obese-1',     min: 25.0, max: 30.0, name: '비만 1단계', color: '#EA580C',
      desc: '대사질환 위험 증가.' },
    { id: 'obese-2',     min: 30.0, max: 35.0, name: '비만 2단계', color: '#DC2626',
      desc: '건강 위험 매우 높음.' },
    { id: 'obese-3',     min: 35.0, max: 999,  name: '비만 3단계', color: '#CC4444',
      desc: '고도 비만.' },
  ],
}

/* ─── 허리둘레 ─── */
export const WAIST_STANDARDS: Record<Gender, { warning: number; obese: number }> = {
  male:   { warning: 90, obese: 100 },  // cm (대한비만학회)
  female: { warning: 85, obese: 95 },
}

/* ─── 체지방률 ─── */
export const BODY_FAT_RANGES: Record<Gender, {
  excellent: number; good: number; average: number; aboveAverage: number; poor: number
}> = {
  male:   { excellent: 10, good: 15, average: 20, aboveAverage: 25, poor: 30 },
  female: { excellent: 18, good: 23, average: 28, aboveAverage: 33, poor: 38 },
}

/* ─── 기본 BMI ─── */
export function calcBMI(height: number, weight: number): number {
  if (height <= 0) return 0
  const heightM = height / 100
  return weight / (heightM * heightM)
}

export function classifyBMI(bmi: number, standard: Standard): BmiCategory {
  const list = BMI_CATEGORIES[standard]
  return list.find(c => bmi >= c.min && bmi < c.max) ?? list[list.length - 1]
}

export interface WeightRange {
  id: string
  name: string
  color: string
  minWeight: number
  maxWeight: number | null  // null = 무한
}

export function getWeightRanges(height: number, standard: Standard): WeightRange[] {
  const heightM = height / 100
  const heightSq = heightM * heightM
  return BMI_CATEGORIES[standard].map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    minWeight: cat.min === 0 ? 0 : Math.round(cat.min * heightSq * 10) / 10,
    maxWeight: cat.max >= 999 ? null : Math.round(cat.max * heightSq * 10) / 10,
  }))
}

/* ─── 풍부한 결과 ─── */
export interface RichResult {
  bmi: number
  category: BmiCategory
  weightRanges: WeightRange[]
  normalMin: number
  normalMax: number
  nextStage: { name: string; weight: number; bmi: number } | null
  toNormal: { direction: 'gain' | 'lose' | 'in'; kg: number }
  bmiPerKg: number
  toBmi22: { direction: 'gain' | 'lose' | 'eq'; kg: number }
}

export function calcRichResult(
  height: number, weight: number, standard: Standard
): RichResult | null {
  if (height <= 0 || weight <= 0) return null
  const heightM = height / 100
  const heightSq = heightM * heightM
  const bmi = calcBMI(height, weight)
  const category = classifyBMI(bmi, standard)
  const ranges = BMI_CATEGORIES[standard]

  const normal = ranges.find(c => c.id === 'normal')!
  const normalMin = Math.round(normal.min * heightSq * 10) / 10
  const normalMax = Math.round(normal.max * heightSq * 10) / 10

  let nextStage: RichResult['nextStage'] = null
  for (const cat of ranges) {
    if (cat.min > bmi) {
      nextStage = {
        name: cat.name,
        weight: Math.round(cat.min * heightSq * 10) / 10,
        bmi: cat.min,
      }
      break
    }
  }

  let toNormal: RichResult['toNormal'] = { direction: 'in', kg: 0 }
  if (weight < normalMin) toNormal = { direction: 'gain', kg: Math.round((normalMin - weight) * 10) / 10 }
  else if (weight > normalMax) toNormal = { direction: 'lose', kg: Math.round((weight - normalMax) * 10) / 10 }

  // BMI 22 까지
  const w22 = 22 * heightSq
  let toBmi22: RichResult['toBmi22'] = { direction: 'eq', kg: 0 }
  const diff22 = Math.round((weight - w22) * 10) / 10
  if (diff22 > 0.05)      toBmi22 = { direction: 'lose', kg: Math.abs(diff22) }
  else if (diff22 < -0.05) toBmi22 = { direction: 'gain', kg: Math.abs(diff22) }

  const bmiPerKg = Math.round(heightSq * 10) / 10

  return {
    bmi: Math.round(bmi * 10) / 10,
    category,
    weightRanges: getWeightRanges(height, standard),
    normalMin, normalMax,
    nextStage,
    toNormal,
    bmiPerKg,
    toBmi22,
  }
}

/* ─── 목표 BMI → 체중 ─── */
export function calcTargetWeight(height: number, targetBMI: number): number {
  const heightM = height / 100
  return Math.round(targetBMI * heightM * heightM * 10) / 10
}

export interface TargetTableRow {
  bmi: number
  weight: number
  isCurrent: boolean
}

export function buildTargetTable(
  height: number, currentWeight: number,
): TargetTableRow[] {
  const targets = [18.5, 20, 21, 22, 23, 24.9]
  const currentBMI = calcBMI(height, currentWeight)
  return targets.map(bmi => ({
    bmi,
    weight: calcTargetWeight(height, bmi),
    isCurrent: Math.abs(bmi - currentBMI) < 0.3,
  }))
}

/* ─── 허리-신장비 ─── */
export interface WHtRResult {
  ratio: number
  category: 'underweight' | 'ideal' | 'normal' | 'warning' | 'obese'
  name: string
  color: string
  desc: string
}

export function calcWaistHeightRatio(waist: number, height: number): WHtRResult {
  if (height <= 0 || waist <= 0) {
    return { ratio: 0, category: 'normal', name: '정상', color: '#059669', desc: '입력 필요' }
  }
  const ratio = waist / height
  if (ratio < 0.43)
    return { ratio: round2(ratio), category: 'underweight', name: '매우 마름', color: '#0891B2', desc: '매우 마른 편. 영양·근육 점검 권장.' }
  if (ratio < 0.49)
    return { ratio: round2(ratio), category: 'ideal',       name: '이상적',   color: '#059669', desc: '이상적인 비율. 건강 유지.' }
  if (ratio < 0.53)
    return { ratio: round2(ratio), category: 'normal',      name: '정상',     color: '#CA8A04', desc: '정상 범위. 0.5 미만 유지 권장.' }
  if (ratio < 0.58)
    return { ratio: round2(ratio), category: 'warning',     name: '복부비만 주의', color: '#EA580C', desc: '복부비만 주의 시작. 허리둘레 관리 필요.' }
  return     { ratio: round2(ratio), category: 'obese',       name: '복부비만', color: '#DC2626', desc: '복부비만. 의료 전문가 상담 권장.' }
}

function round2(n: number): number { return Math.round(n * 100) / 100 }

/* ─── 복부비만 판정 ─── */
export interface AbdominalResult {
  isObese: boolean
  category: 'normal' | 'mild' | 'severe'
  name: string
  color: string
  desc: string
}

export function classifyAbdominal(waist: number, gender: Gender): AbdominalResult {
  const std = WAIST_STANDARDS[gender]
  const limit = gender === 'male' ? '90cm' : '85cm'
  if (waist < std.warning)
    return { isObese: false, category: 'normal', name: '정상', color: '#059669',
             desc: `정상 범위 (${gender === 'male' ? '남성' : '여성'} ${limit} 미만).` }
  if (waist < std.obese)
    return { isObese: true, category: 'mild', name: '경도 복부비만', color: '#EA580C',
             desc: '경도 복부비만. 식단·운동 관리 권장.' }
  return     { isObese: true, category: 'severe', name: '중증 복부비만', color: '#DC2626',
             desc: '중증 복부비만. 의료 전문가 상담 권장.' }
}

/* ─── BMI × 허리둘레 종합 해석 ─── */
export type CombinedKind = 'healthy' | 'skinny-fat' | 'muscular' | 'combined-obese'

export interface CombinedJudgment {
  kind: CombinedKind
  emoji: string
  title: string
  desc: string
  color: string
}

export function combinedJudgment(
  bmi: number, isAbdominalObese: boolean, standard: Standard,
): CombinedJudgment {
  const obeseStart = standard === 'KOREA' ? 25 : 30
  const bmiNormal = bmi < obeseStart && bmi >= 18.5
  const bmiObese  = bmi >= obeseStart

  if (bmiNormal && !isAbdominalObese)
    return { kind: 'healthy', emoji: '✅', title: '건강한 체형',
             desc: 'BMI·허리둘레 모두 정상 범위. 현재 상태 유지를 권장합니다.',
             color: '#059669' }
  if (bmiNormal && isAbdominalObese)
    return { kind: 'skinny-fat', emoji: '⚠️', title: '마른 비만 가능성',
             desc: 'BMI는 정상이지만 허리둘레가 높습니다. 근육 부족 + 복부 지방 가능성이 있어 근력 운동 + 식단 점검을 권장합니다.',
             color: '#CA8A04' }
  if (bmiObese && !isAbdominalObese)
    return { kind: 'muscular', emoji: '⚠️', title: '근육 우세형 가능성',
             desc: 'BMI는 비만 범위지만 허리둘레가 정상입니다. 근육량이 많은 운동선수형일 수 있으니 체성분 검사로 정확한 판정을 권장합니다.',
             color: '#0891B2' }
  return     { kind: 'combined-obese', emoji: '🔴', title: '종합 비만',
             desc: '체중과 복부 지방 모두 관리가 필요합니다. 대사질환 위험이 높으니 의료 전문가 상담을 권장합니다.',
             color: '#DC2626' }
}

/* ─── 체지방률 (Navy 공식) ─── */
export interface BodyFatInput {
  gender: Gender
  height: number   // cm
  waist: number    // cm
  neck: number     // cm
  hip?: number     // cm (여성만)
}

export function estimateBodyFat(input: BodyFatInput): number | null {
  const { gender, height, waist, neck, hip } = input
  if (height <= 0 || waist <= 0 || neck <= 0) return null
  // US Navy 체지방 공식은 인치(inch) 기준 계수 → cm 입력을 인치로 변환 후 계산
  const h = height / 2.54
  const w = waist / 2.54
  const n = neck / 2.54
  if (gender === 'male') {
    if (waist <= neck) return null
    const v = 86.010 * Math.log10(w - n)
            - 70.041 * Math.log10(h) + 36.76
    return Math.round(v * 10) / 10
  }
  if (!hip || hip <= 0) return null
  if (waist + hip <= neck) return null
  const hp = hip / 2.54
  const v = 163.205 * Math.log10(w + hp - n)
          - 97.684 * Math.log10(h) - 78.387
  return Math.round(v * 10) / 10
}

export function classifyBodyFat(bf: number, gender: Gender): {
  name: string; color: string; rangeText: string
} {
  const r = BODY_FAT_RANGES[gender]
  if (bf < r.excellent)    return { name: '우수',     color: '#0891B2', rangeText: gender === 'male' ? '<10%' : '<18%' }
  if (bf < r.good)         return { name: '좋음',     color: '#059669', rangeText: gender === 'male' ? '10~15%' : '18~23%' }
  if (bf < r.average)      return { name: '평균',     color: '#CA8A04', rangeText: gender === 'male' ? '15~20%' : '23~28%' }
  if (bf < r.aboveAverage) return { name: '평균 이상', color: '#EA580C', rangeText: gender === 'male' ? '20~25%' : '28~33%' }
  if (bf < r.poor)         return { name: '높음',     color: '#DC2626', rangeText: gender === 'male' ? '25~30%' : '33~38%' }
  return                          { name: '위험',     color: '#CC4444', rangeText: gender === 'male' ? '>30%' : '>38%' }
}

/* ─── 체중 시뮬레이션 ─── */
export interface SimulationStep {
  weeks: number
  weight: number
  bmi: number
  category: string
  color: string
}

export function simulateWeightChange(
  currentWeight: number, height: number, standard: Standard,
  perWeek: number,  // + 증량, - 감량
  totalWeeks: number,
): SimulationStep[] {
  const steps: SimulationStep[] = []
  const milestones = [0, 4, 8, 12].filter(w => w <= totalWeeks)
  if (!milestones.includes(totalWeeks)) milestones.push(totalWeeks)
  for (const w of milestones) {
    const wt = Math.max(20, currentWeight + perWeek * w)
    const bmi = calcBMI(height, wt)
    const cat = classifyBMI(bmi, standard)
    steps.push({
      weeks: w,
      weight: Math.round(wt * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      category: cat.name,
      color: cat.color,
    })
  }
  return steps
}

/* ─── localStorage ─── */
export interface BmiRecord {
  id: string
  date: string
  height: number
  weight: number
  bmi: number
  waist?: number
  bodyFat?: number
}

const STORAGE_KEY = 'youtil_bmi_history_v1'

export function loadBmiHistory(): BmiRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function saveBmiHistory(items: BmiRecord[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 60))) } catch { /* */ }
}

export function newBmiId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/* ─── 단위 변환 ─── */
export const cmToInch = (cm: number) => cm / 2.54
export const inchToCm = (inch: number) => inch * 2.54
export const kgToLb   = (kg: number)   => kg * 2.20462
export const lbToKg   = (lb: number)   => lb / 2.20462

/* ─── 추천 목표 BMI ─── */
export function recommendTargetBMI(currentBMI: number, standard: Standard): number {
  if (currentBMI < 18.5) return 20    // 저체중 → 정상 진입
  if (currentBMI < (standard === 'KOREA' ? 23 : 25)) return 21   // 정상 → 이상 (살짝 가벼운)
  if (currentBMI < (standard === 'KOREA' ? 25 : 30)) return 22   // 과체중 → 정상 권장
  return 22.9   // 비만 → 정상 진입
}
