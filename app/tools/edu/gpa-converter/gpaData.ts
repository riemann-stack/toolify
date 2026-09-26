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
  { id: 'wes',    name: 'WES 기준',     shortName: 'WES',    desc: 'WES(World Education Services) 방식 — 과목 평어를 미국 평어로 옮겨 평균(A+·A0 → 4.0). 100점 입력은 점수 구간 매핑' },
  { id: 'korean', name: '한국 평어 기준', shortName: '평어',   desc: '평점을 한국 평어(A0·B+ …)로 읽어 4.0에 매핑. 한국 대학 성적표 직역에 가까움' },
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

const UK_FIRST: UkClass = { abbr: '1st',  name: 'First Class Honours',         color: '#059669' }
const UK_21: UkClass    = { abbr: '2:1',  name: 'Upper Second (Two-One)',      color: '#0891B2' }
const UK_22: UkClass    = { abbr: '2:2',  name: 'Lower Second (Two-Two)',      color: '#D97706' }
const UK_3RD: UkClass   = { abbr: '3rd',  name: 'Third Class Honours',         color: '#EA580C' }
const UK_FAIL: UkClass  = { abbr: 'Fail', name: 'Fail',                        color: '#DC2626' }

/**
 * 한국 학점 → 영국 학위 등급 대략 동등 컷 (1st / 2:1 / 2:2 / 3rd 하한).
 * 영국 70%·60% 컷은 '영국 원점수' 기준이라 한국 평점÷만점 비율에 그대로 대면 안 된다
 * (예전엔 4.5제 3.15가 First로 나왔음). 영국 대학 국가별 동등표는 학교마다 다르므로
 * FAQ에 안내한 대략값(4.5제 First≈3.5·2:1≈3.0 / 4.3제 First≈3.3·2:1≈2.8)을 단일 소스로 쓴다.
 * 5.0 만점은 4.5 만점 컷을 비례 환산, 100점은 4.5 만점 컷과 같은 평어(B+·B0·C+·C0)의
 * LETTER_TABLE 백분율 하한 80/75/65/60 — 같은 평어면 입력 만점과 무관하게 같은 등급이 나오게.
 */
export const UK_CUTS: Record<ScaleId, [number, number, number, number]> = {
  '4.5': [3.5, 3.0, 2.5, 2.0],
  '4.3': [3.3, 2.8, 2.3, 1.8],
  '5.0': [3.5 / 4.5 * 5, 3.0 / 4.5 * 5, 2.5 / 4.5 * 5, 2.0 / 4.5 * 5],
  '100': [80, 75, 65, 60],
}

export function ukClassFor(gpa: number, scaleId: ScaleId): UkClass {
  const [first, upper, lower, third] = UK_CUTS[scaleId]
  const g = gpa + 1e-9
  if (g >= first) return UK_FIRST
  if (g >= upper) return UK_21
  if (g >= lower) return UK_22
  if (g >= third) return UK_3RD
  return UK_FAIL
}

/**
 * 한국 만점별 평어 앵커 — [한국 평점, 한국 평어, 미국 평점, 미국 평어]
 * 4.5제: +/0 두 단계(A-·B- 없음), 4.3제: +/0/- 세 단계(서울대 등).
 * 평균 평점이 두 앵커 사이면 두 평어가 섞인 것으로 보고 선형 보간한다
 * (예: A0·B+ 반반 = 4.5제 3.75 → (4.0 + 3.3) / 2 = 3.65).
 */
type Anchor = [number, string, number, string]
const ANCHORS_45: Anchor[] = [
  [4.5, 'A+', 4.0, 'A'], [4.0, 'A0', 4.0, 'A'], [3.5, 'B+', 3.3, 'B+'], [3.0, 'B0', 3.0, 'B'],
  [2.5, 'C+', 2.3, 'C+'], [2.0, 'C0', 2.0, 'C'], [1.5, 'D+', 1.3, 'D+'], [1.0, 'D0', 1.0, 'D'],
  [0, 'F', 0, 'F'],
]
const ANCHORS_43: Anchor[] = [
  [4.3, 'A+', 4.0, 'A'], [4.0, 'A0', 4.0, 'A'], [3.7, 'A-', 3.7, 'A-'], [3.3, 'B+', 3.3, 'B+'],
  [3.0, 'B0', 3.0, 'B'], [2.7, 'B-', 2.7, 'B-'], [2.3, 'C+', 2.3, 'C+'], [2.0, 'C0', 2.0, 'C'],
  [1.7, 'C-', 1.7, 'C-'], [1.3, 'D+', 1.3, 'D+'], [1.0, 'D0', 1.0, 'D'], [0.7, 'D-', 0.7, 'D-'],
  [0, 'F', 0, 'F'],
]

/** 평점 → 앵커 보간 (US 평점) + 가장 가까운 앵커의 평어 */
function fromAnchors(gpa: number, anchors: Anchor[]): { usGpa: number; krLetter: string; usLetter: string } {
  const g = clamp(gpa, 0, anchors[0][0])
  let usGpa = 0
  for (let i = 0; i < anchors.length - 1; i++) {
    const [hiKr, , hiUs] = anchors[i]
    const [loKr, , loUs] = anchors[i + 1]
    if (g <= hiKr && g >= loKr) {
      usGpa = loUs + (hiUs - loUs) * ((g - loKr) / (hiKr - loKr))
      break
    }
  }
  // 가장 가까운 앵커 (동률이면 위 등급)
  let best = anchors[0]
  for (const a of anchors) {
    if (Math.abs(a[0] - g) < Math.abs(best[0] - g) - 1e-9) best = a
  }
  return { usGpa: round(usGpa, 2), krLetter: best[1], usLetter: best[3] }
}

/** 4.5·4.3·5.0 만점 → 평어 앵커 결과 (5.0 만점은 4.5 만점으로 비례 환산 후 적용 — 근사) */
function letterBased(gpa: number, scaleId: ScaleId) {
  if (scaleId === '4.3') return fromAnchors(gpa, ANCHORS_43)
  if (scaleId === '5.0') return fromAnchors(gpa / 5 * 4.5, ANCHORS_45)
  return fromAnchors(gpa, ANCHORS_45)
}

/** 비례 환산 — US GPA = pct / 25 */
function convertLinear(pct: number, ukClass: UkClass): ConvertResult {
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
  return { usGpa: round(usGpa, 2), letter, ukClass, percent: pct }
}

/** WES 기준 — 100점(원점수) 입력 전용 점수 구간 매핑. 4.5·4.3·5.0 만점은 평어 앵커(letterBased) 사용 */
function convertWES(pct: number, ukClass: UkClass): ConvertResult {
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
  return { usGpa, letter, ukClass, percent: pct }
}

/** 한국 평어 기준 — 100점(원점수) 입력 전용. 4.5·4.3·5.0 만점은 평어 앵커(letterBased) 사용 */
function convertKorean(pct: number, ukClass: UkClass): ConvertResult {
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
  return { usGpa: Math.min(4.0, usGpa), letter, ukClass, percent: pct }
}

export function convertGpa(gpa: number, scaleId: ScaleId, method: MethodId): ConvertResult {
  const pct = toPercent(gpa, scaleId)
  const ukClass = ukClassFor(gpa, scaleId)
  if (method === 'linear') return convertLinear(pct, ukClass)
  // 100점 원점수는 점수 구간 매핑, 평점(4.5·4.3·5.0)은 평어 앵커 — 평점÷만점 비율을
  // 원점수 구간에 넣으면 4.5제 A0(4.0)이 88.9% → A-(3.70)로 한 단계 낮게 나온다.
  if (scaleId === '100') return method === 'wes' ? convertWES(pct, ukClass) : convertKorean(pct, ukClass)
  const lb = letterBased(gpa, scaleId)
  return { usGpa: lb.usGpa, letter: method === 'wes' ? lb.usLetter : lb.krLetter, ukClass, percent: pct }
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
// 4.5제는 +/0 두 단계(A-·B-·C- 없음 → null), 4.3제는 +/0/- 세 단계.
// percent는 이 도구의 '100점' 입력 구간(학교마다 다름)
export const LETTER_TABLE: { letter: string; kr45: number | null; kr43: number; us40: number; percent: string }[] = [
  { letter: 'A+', kr45: 4.5,  kr43: 4.3, us40: 4.0, percent: '95~100' },
  { letter: 'A0', kr45: 4.0,  kr43: 4.0, us40: 4.0, percent: '90~94'  },
  { letter: 'A-', kr45: null, kr43: 3.7, us40: 3.7, percent: '85~89'  },
  { letter: 'B+', kr45: 3.5,  kr43: 3.3, us40: 3.3, percent: '80~84'  },
  { letter: 'B0', kr45: 3.0,  kr43: 3.0, us40: 3.0, percent: '75~79'  },
  { letter: 'B-', kr45: null, kr43: 2.7, us40: 2.7, percent: '70~74'  },
  { letter: 'C+', kr45: 2.5,  kr43: 2.3, us40: 2.3, percent: '65~69'  },
  { letter: 'C0', kr45: 2.0,  kr43: 2.0, us40: 2.0, percent: '60~64'  },
  { letter: 'C-', kr45: null, kr43: 1.7, us40: 1.7, percent: '55~59'  },
  { letter: 'D+', kr45: 1.5,  kr43: 1.3, us40: 1.3, percent: '—'      },
  { letter: 'D0', kr45: 1.0,  kr43: 1.0, us40: 1.0, percent: '50~54'  },
  { letter: 'F',  kr45: 0.0,  kr43: 0.0, us40: 0.0, percent: '0~49'   },
]
