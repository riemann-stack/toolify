/* ──────────────────────────────────────────────────────
   gpa-converter/gpaData.ts
   학점(GPA) 환산 — 한국 4.5/4.3/5.0 ↔ 미국 4.0 ↔ 영국 등급
   ──────────────────────────────────────────────────────
   ⚠️ 공식 환산표가 단일하지 않습니다. WES·ECE·각 학교 자체 환산이 다르며,
      본 도구는 가장 널리 쓰이는 3가지 방식을 비교 표시합니다.
      유학 지원 시에는 지원 기관·학교의 공식 환산 기준을 우선하세요.
   ────────────────────────────────────────────────────── */

export type ScaleId = '4.5' | '4.3' | '5.0' | '100'
export interface Scale { id: ScaleId; max: number; label: string; short: string }

export const SCALES: Scale[] = [
  { id: '4.5', max: 4.5, label: '4.5 만점', short: '4.5' },
  { id: '4.3', max: 4.3, label: '4.3 만점', short: '4.3' },
  { id: '5.0', max: 5.0, label: '5.0 만점', short: '5.0' },
  { id: '100', max: 100, label: '백분율 (100점)', short: '100' },
]

export type MethodId = 'linear' | 'wes' | 'korean'
export interface Method {
  id: MethodId
  name: string
  shortName: string
  desc: string
}

export const METHODS: Method[] = [
  { id: 'linear', name: '비례 환산',    shortName: '비례',   desc: '단순 비율(현재/만점 × 4.0). 구간 구분 없는 직선 환산' },
  { id: 'wes',    name: 'WES 기준',     shortName: 'WES',    desc: 'WES(World Education Services) 표준 — 미국 대학원 다수 채택, 백분율 구간(브래킷) 매핑' },
  { id: 'korean', name: '한국 평어 기준', shortName: '평어',   desc: '백분율 → 평어(A+/A/B+ …) → 4.0 매핑. 한국 대학 성적표 직역에 가까움' },
]

/** 입력을 0~100 percentage로 정규화 */
export function toPercent(gpa: number, scaleId: ScaleId): number {
  if (scaleId === '100') return clamp(gpa, 0, 100)
  const max = parseFloat(scaleId)
  return clamp((gpa / max) * 100, 0, 100)
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

export interface ConvertResult {
  usGpa: number       // 0~4.0
  letter: string      // A+/A/A-/B+/...
  ukClass: UkClass
  percent: number     // 0~100
}

export interface UkClass {
  abbr: string        // 1st / 2:1 / 2:2 / 3rd / Fail
  name: string
  color: string
}

function ukClassFromPercent(pct: number): UkClass {
  if (pct >= 70) return { abbr: '1st',  name: 'First Class Honours',         color: '#059669' }
  if (pct >= 60) return { abbr: '2:1',  name: 'Upper Second (Two-One)',      color: '#0891B2' }
  if (pct >= 50) return { abbr: '2:2',  name: 'Lower Second (Two-Two)',      color: '#D97706' }
  if (pct >= 40) return { abbr: '3rd',  name: 'Third Class Honours',         color: '#EA580C' }
  return            { abbr: 'Fail', name: 'Fail',                            color: '#DC2626' }
}

/** 비례 환산 — US GPA = pct / 25 */
function convertLinear(pct: number): ConvertResult {
  const usGpa = clamp(pct / 25, 0, 4.0)
  const letter =
    usGpa >= 3.85 ? 'A+'  :
    usGpa >= 3.5  ? 'A'   :
    usGpa >= 3.15 ? 'A-'  :
    usGpa >= 2.85 ? 'B+'  :
    usGpa >= 2.5  ? 'B'   :
    usGpa >= 2.15 ? 'B-'  :
    usGpa >= 1.85 ? 'C+'  :
    usGpa >= 1.5  ? 'C'   :
    usGpa >= 1.0  ? 'D'   : 'F'
  return { usGpa: round(usGpa, 2), letter, ukClass: ukClassFromPercent(pct), percent: pct }
}

/** WES 기준 — 백분율 브래킷 매핑 (구간별로 비례보다 낮게도 높게도 나옴) */
function convertWES(pct: number): ConvertResult {
  let usGpa = 0, letter = 'F'
  if      (pct >= 95) { usGpa = 4.00; letter = 'A+' }
  else if (pct >= 90) { usGpa = 4.00; letter = 'A'  }
  else if (pct >= 85) { usGpa = 3.70; letter = 'A-' }
  else if (pct >= 80) { usGpa = 3.30; letter = 'B+' }
  else if (pct >= 75) { usGpa = 3.00; letter = 'B'  }
  else if (pct >= 70) { usGpa = 2.70; letter = 'B-' }
  else if (pct >= 65) { usGpa = 2.30; letter = 'C+' }
  else if (pct >= 60) { usGpa = 2.00; letter = 'C'  }
  else if (pct >= 55) { usGpa = 1.70; letter = 'C-' }
  else if (pct >= 50) { usGpa = 1.00; letter = 'D'  }
  return { usGpa, letter, ukClass: ukClassFromPercent(pct), percent: pct }
}

/** 한국 평어 기준 — 한국 성적표의 평어(A+/A0/B+...)를 4.0 스케일로 직역 */
function convertKorean(pct: number): ConvertResult {
  let usGpa = 0, letter = 'F'
  if      (pct >= 95) { usGpa = 4.30; letter = 'A+' }
  else if (pct >= 90) { usGpa = 4.00; letter = 'A'  }
  else if (pct >= 85) { usGpa = 3.70; letter = 'A-' }
  else if (pct >= 80) { usGpa = 3.30; letter = 'B+' }
  else if (pct >= 75) { usGpa = 3.00; letter = 'B'  }
  else if (pct >= 70) { usGpa = 2.70; letter = 'B-' }
  else if (pct >= 65) { usGpa = 2.30; letter = 'C+' }
  else if (pct >= 60) { usGpa = 2.00; letter = 'C'  }
  else if (pct >= 55) { usGpa = 1.70; letter = 'C-' }
  else if (pct >= 50) { usGpa = 1.00; letter = 'D'  }
  // 4.0 스케일이라 4.30은 4.0으로 캡
  return { usGpa: Math.min(4.0, usGpa), letter, ukClass: ukClassFromPercent(pct), percent: pct }
}

export function convertGpa(gpa: number, scaleId: ScaleId, method: MethodId): ConvertResult {
  const pct = toPercent(gpa, scaleId)
  switch (method) {
    case 'linear': return convertLinear(pct)
    case 'wes':    return convertWES(pct)
    case 'korean': return convertKorean(pct)
  }
}

/** 역산 — 목표 US GPA → 한국 만점 환산 (단순 비례) */
export function reverseFromUs(usGpa: number, scaleId: ScaleId): number {
  if (scaleId === '100') return clamp(usGpa * 25, 0, 100)
  const max = parseFloat(scaleId)
  return clamp((usGpa / 4.0) * max, 0, max)
}

/** 한국 만점 상호 환산 — 4.3 ↔ 4.5 ↔ 5.0 (백분율 경유 단순 비례) */
export const KR_SCALES: ScaleId[] = ['4.5', '4.3', '5.0']

export function crossConvert(gpa: number, fromScale: ScaleId, toScale: ScaleId): number {
  const pct = toPercent(gpa, fromScale)
  if (toScale === '100') return round(clamp(pct, 0, 100), 1)
  const max = parseFloat(toScale)
  return round(clamp((pct / 100) * max, 0, max), 2)
}

function round(n: number, p: number): number {
  const f = Math.pow(10, p)
  return Math.round(n * f) / f
}

// ─── 한국 대학별 만점 참고 ─────────────────────────────────
export interface Univ { name: string; scale: ScaleId; note?: string }

export const KOREAN_UNIS: Univ[] = [
  { name: '서울대학교',     scale: '4.3', note: '2013년 이후 4.3 만점 (이전 4.0)' },
  { name: 'KAIST',          scale: '4.3' },
  { name: '포스텍 (POSTECH)', scale: '4.3' },
  { name: 'UNIST',          scale: '4.3' },
  { name: '연세대학교',     scale: '4.3', note: '대부분 학과 4.3, 일부 4.5' },
  { name: '서강대학교',     scale: '4.3' },
  { name: '고려대학교',     scale: '4.5' },
  { name: '성균관대학교',    scale: '4.5' },
  { name: '한양대학교',     scale: '4.5' },
  { name: '경희대학교',     scale: '4.5' },
  { name: '이화여자대학교',  scale: '4.3' },
  { name: '중앙대학교',     scale: '4.5' },
  { name: '한국외국어대학교', scale: '4.5' },
  { name: '서울시립대학교',  scale: '4.5' },
  { name: '건국대학교',     scale: '4.5' },
  { name: '동국대학교',     scale: '4.5' },
  { name: '인하대학교',     scale: '4.5' },
  { name: '아주대학교',     scale: '4.5' },
  { name: '부산대학교',     scale: '4.5' },
  { name: '경북대학교',     scale: '4.5' },
]

// ─── 평어 → 4.0 매핑 참고표 ─────────────────────────────────
export const LETTER_TABLE: { letter: string; kr45: number; kr43: number; us40: number; percent: string }[] = [
  { letter: 'A+', kr45: 4.5, kr43: 4.3, us40: 4.0, percent: '95~100' },
  { letter: 'A',  kr45: 4.0, kr43: 4.0, us40: 4.0, percent: '90~94'  },
  { letter: 'A-', kr45: 3.5, kr43: 3.7, us40: 3.7, percent: '85~89'  },
  { letter: 'B+', kr45: 3.0, kr43: 3.3, us40: 3.3, percent: '80~84'  },
  { letter: 'B',  kr45: 2.5, kr43: 3.0, us40: 3.0, percent: '75~79'  },
  { letter: 'B-', kr45: 2.0, kr43: 2.7, us40: 2.7, percent: '70~74'  },
  { letter: 'C+', kr45: 1.5, kr43: 2.3, us40: 2.3, percent: '65~69'  },
  { letter: 'C',  kr45: 1.0, kr43: 2.0, us40: 2.0, percent: '60~64'  },
  { letter: 'D',  kr45: 0.5, kr43: 1.0, us40: 1.0, percent: '50~59'  },
  { letter: 'F',  kr45: 0.0, kr43: 0.0, us40: 0.0, percent: '0~49'   },
]
