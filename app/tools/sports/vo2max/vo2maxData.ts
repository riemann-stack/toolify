/* ───────────────────────────────────────────────────────────
   VO2 Max 계산기 데이터
   ─────────────────────────────────────────────────────────── */

export type MethodId = 'cooper' | 'mile1_5' | 'rockport' | 'queens' | 'norway' | 'hrr'
export type Sex = 'male' | 'female'

export interface Method {
  id: MethodId
  name: string
  emoji: string
  desc: string
  duration: string
  difficulty: 'easy' | 'medium' | 'hard'
  needsRun: boolean
  accuracy: '낮음' | '보통' | '높음'
  source: string
}

export const METHODS: Method[] = [
  { id: 'cooper',   name: '쿠퍼 12분 달리기',     emoji: '🏃',    desc: '평지 트랙·러닝머신에서 12분 동안 최대한 멀리 달리기',
    duration: '12분', difficulty: 'hard', needsRun: true,  accuracy: '높음', source: 'Kenneth H. Cooper, 1968' },
  { id: 'mile1_5',  name: '1.5마일(2.4km) 달리기', emoji: '🏃‍♂️', desc: '1.5마일(2.4km)을 최대한 빠르게 — 미군·소방관 체력 표준',
    duration: '약 10~16분', difficulty: 'hard', needsRun: true,  accuracy: '높음', source: 'George ⋅ Vehrs, 1993' },
  { id: 'rockport', name: '락포트 1마일 걷기',     emoji: '🚶',    desc: '1마일(1.6km)을 최대 속도로 걷고 도착 직후 심박수 측정 — 초보·고령자 적합',
    duration: '약 12~20분', difficulty: 'easy', needsRun: false, accuracy: '보통', source: 'Kline et al., 1987' },
  { id: 'queens',   name: '퀸즈칼리지 스텝테스트', emoji: '🪜',    desc: '41cm 스텝을 3분 (남 24/분·여 22/분) + 5초 후 심박수',
    duration: '3분', difficulty: 'medium', needsRun: false, accuracy: '보통', source: 'McArdle et al., 1972' },
  { id: 'norway',   name: '노르웨이 비운동 추정',  emoji: '📋',    desc: '운동 X — 나이·성별·허리둘레·안정시 심박·운동 습관으로 추정',
    duration: '1분', difficulty: 'easy', needsRun: false, accuracy: '보통', source: 'NTNU · Nes et al., 2011' },
  { id: 'hrr',      name: '안정시 심박수 비율법',  emoji: '❤️',    desc: '깨어난 직후 안정시 심박과 추정 최대 심박만으로 — 가장 간단',
    duration: '30초', difficulty: 'easy', needsRun: false, accuracy: '낮음', source: 'Uth · Sørensen · Overgaard, 2004' },
]

/* ─── 계산 함수 ─── */

/** 1) 쿠퍼 12분 달리기 — 거리(m) → VO2max */
export function calcCooper(distanceM: number): number {
  if (distanceM <= 0) return 0
  return Math.max(0, (distanceM - 504.9) / 44.73)
}

/** 2) 1.5마일 달리기 — 시간(분) + 체중(kg) + 성별 → VO2max
 *  공식 (George 1993): VO2max = 88.02 + 3.716(남=1·여=0) − 0.0769·체중(lb) − 2.767·시간(min) */
export function calcMile15(timeMin: number, weightKg: number, sex: Sex): number {
  if (timeMin <= 0 || weightKg <= 0) return 0
  const sexN = sex === 'male' ? 1 : 0
  const weightLb = weightKg * 2.20462
  const v = 88.02 + 3.716 * sexN - 0.0769 * weightLb - 2.767 * timeMin
  return Math.max(0, v)
}

/** 3) 락포트 1마일 걷기 — 시간(분) + HR(직후) + 체중 + 나이 + 성별 → VO2max
 *  Kline 1987: VO2 = 132.853 − 0.0769·체중(lb) − 0.3877·나이 + 6.315(남=1) − 3.2649·시간 − 0.1565·HR */
export function calcRockport(timeMin: number, hr: number, weightKg: number, age: number, sex: Sex): number {
  if (timeMin <= 0 || hr <= 0 || weightKg <= 0 || age <= 0) return 0
  const sexN = sex === 'male' ? 1 : 0
  const weightLb = weightKg * 2.20462
  const v = 132.853 - 0.0769 * weightLb - 0.3877 * age + 6.315 * sexN - 3.2649 * timeMin - 0.1565 * hr
  return Math.max(0, v)
}

/** 4) 퀸즈칼리지 스텝테스트 — HR + 성별
 *  McArdle: Men = 111.33 − 0.42·HR, Women = 65.81 − 0.1847·HR */
export function calcQueens(hr: number, sex: Sex): number {
  if (hr <= 0) return 0
  const v = sex === 'male' ? 111.33 - 0.42 * hr : 65.81 - 0.1847 * hr
  return Math.max(0, v)
}

/** 5) 노르웨이 NTNU 비운동 추정 — Nes 2011 단순화 모델
 *  PA index: 운동 빈도·강도·시간 종합 0~9 (낮을수록 비활동) */
export interface NorwayInputs {
  age: number
  sex: Sex
  waistCm: number      // 허리 둘레
  hrRest: number       // 안정시 심박
  paIndex: number      // 0~9 (운동 활동 지수)
}
export function calcNorway({ age, sex, waistCm, hrRest, paIndex }: NorwayInputs): number {
  if (age <= 0 || waistCm <= 0 || hrRest <= 0) return 0
  // 근사 회귀식 (NTNU 공개 계산기 단순화)
  if (sex === 'male') {
    return Math.max(0, 100.27 - 0.296 * age - 0.369 * waistCm - 0.155 * hrRest + 0.226 * paIndex)
  }
  return Math.max(0, 74.74 - 0.247 * age - 0.259 * waistCm - 0.114 * hrRest + 0.198 * paIndex)
}

/** 6) 안정시 심박수 비율법 — Uth 2004
 *  VO2max ≈ 15.3 × (HRmax / HRrest), HRmax ≈ 220 − age */
export function calcHRR(hrRest: number, age: number): number {
  if (hrRest <= 0 || age <= 0) return 0
  const hrMax = 220 - age
  return Math.max(0, 15.3 * (hrMax / hrRest))
}

/* ─── 5단계 등급 (ACSM·Cooper Institute 기준) ─── */
export type FitnessLevel = 'excellent' | 'good' | 'average' | 'below' | 'poor'

export interface NormBand {
  excellent: number  // 이상
  good: number
  average: number
  below: number
  // 미만 = poor
}

/** 연령대 + 성별 → 5단계 컷오프 */
export function getNormBand(age: number, sex: Sex): NormBand {
  // 남성
  if (sex === 'male') {
    if (age < 30) return { excellent: 57, good: 52, average: 44, below: 38 }
    if (age < 40) return { excellent: 52, good: 48, average: 40, below: 34 }
    if (age < 50) return { excellent: 48, good: 44, average: 36, below: 30 }
    if (age < 60) return { excellent: 44, good: 40, average: 32, below: 25 }
    return            { excellent: 40, good: 36, average: 27, below: 21 }
  }
  // 여성
  if (age < 30) return { excellent: 47, good: 42, average: 34, below: 28 }
  if (age < 40) return { excellent: 46, good: 41, average: 33, below: 27 }
  if (age < 50) return { excellent: 43, good: 39, average: 31, below: 25 }
  if (age < 60) return { excellent: 41, good: 37, average: 29, below: 22 }
  return            { excellent: 37, good: 33, average: 26, below: 20 }
}

export function classifyLevel(vo2: number, age: number, sex: Sex): FitnessLevel {
  const b = getNormBand(age, sex)
  if (vo2 >= b.excellent) return 'excellent'
  if (vo2 >= b.good)      return 'good'
  if (vo2 >= b.average)   return 'average'
  if (vo2 >= b.below)     return 'below'
  return 'poor'
}

export const LEVEL_META: Record<FitnessLevel, { label: string; color: string; desc: string }> = {
  excellent: { label: '매우 우수',   color: '#059669', desc: '동년배 상위 10% — 엘리트 러너 수준' },
  good:      { label: '우수',        color: '#0891B2', desc: '동년배 상위 30% — 규칙적 유산소 운동 중' },
  average:   { label: '평균',        color: '#CA8A04', desc: '동년배 중간 — 일반 활동 수준' },
  below:     { label: '미흡',        color: '#EA580C', desc: '동년배 하위 30% — 운동량 ↑ 권장' },
  poor:      { label: '매우 미흡',   color: '#DC2626', desc: '심혈관 위험 ↑ — 의사 상담 후 점진 운동 시작' },
}

/* ─── 마라톤·구간 페이스 예측 (VDOT ≈ VO2max 매핑) ─── */
/** Riegel 공식 + Daniels VDOT 단순화 */
export interface RacePrediction {
  fiveK: number      // 초
  tenK: number
  halfM: number
  fullM: number
}

/** VO2max → 5K 시간(초) 근사. Daniels VDOT 테이블 단순 회귀 */
export function predictRaces(vo2: number): RacePrediction {
  if (vo2 <= 0) return { fiveK: 0, tenK: 0, halfM: 0, fullM: 0 }
  // 5K 시간(초) — VDOT 30~80 범위에서 회귀
  // VDOT 30 → 5K 약 38분, VDOT 60 → 5K 약 18분, VDOT 80 → 5K 약 13.5분
  // 근사: T_5k(sec) = 3600 / (vo2 × 0.0556 + 1.94)
  // Better: Daniels의 race time vs VDOT 표 회귀 — 단순화
  const fiveK = Math.max(60, 9000 / (vo2 * 0.85))  // 약 VDOT 50 → 18:30
  // Riegel 공식: T2 = T1 × (D2/D1)^1.06
  const tenK = fiveK * Math.pow(10 / 5, 1.06)
  const halfM = fiveK * Math.pow(21.0975 / 5, 1.06)
  const fullM = fiveK * Math.pow(42.195 / 5, 1.06)
  return { fiveK, tenK, halfM, fullM }
}

/** 초 → "HH:MM:SS" 또는 "MM:SS" */
export function fmtTime(sec: number): string {
  if (sec <= 0) return '—'
  const s = Math.round(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(ss)}`
  return `${m}:${pad(ss)}`
}

/** 초/km 페이스 포맷 */
export function fmtPace(sec: number): string {
  if (sec <= 0) return '—'
  const s = Math.round(sec)
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}

/** VO2max에서 강도별 페이스 (초/km) — Daniels 공식 단순화 */
export interface TrainingPaces {
  E: number   // 회복 (Easy)
  M: number   // 마라톤
  T: number   // 역치
  I: number   // 인터벌
  R: number   // 반복 (Repetition)
}
export function trainingPaces(vo2: number): TrainingPaces {
  if (vo2 <= 0) return { E: 0, M: 0, T: 0, I: 0, R: 0 }
  // 5K 페이스 (sec/km) 기준 비율
  const fiveKPace = (9000 / (vo2 * 0.85)) / 5  // ~ I 페이스에 가까움
  return {
    E: fiveKPace * 1.45,   // ~75% HRmax
    M: fiveKPace * 1.20,   // 마라톤 페이스
    T: fiveKPace * 1.07,   // 역치 (1시간 race pace)
    I: fiveKPace * 0.98,   // V̇O2max (5K~3K race pace)
    R: fiveKPace * 0.92,   // 단거리 반복
  }
}

/* ─── 개선 가이드 ─── */
export const IMPROVE_TIPS = [
  {
    title: '🏃 LSD (Long Slow Distance)',
    desc: '주 1회 60~120분, 대화 가능한 페이스 (E 강도). 모세혈관·미토콘드리아 발달 → VO2max 기반 다지기.',
    weeks: '8~12주에 +2~3 mL/kg/min',
  },
  {
    title: '⚡ HIIT (고강도 인터벌)',
    desc: '4×4분 인터벌 (90~95% HRmax) + 3분 회복 × 2~3회/주. VO2max 직접 자극.',
    weeks: '6~8주에 +3~5 mL/kg/min',
  },
  {
    title: '🎯 역치 훈련 (Tempo)',
    desc: '20~40분 T 페이스 (1시간 race pace). 젖산 역치 향상 → 더 오래 빠르게.',
    weeks: '6~8주에 +1~2 mL/kg/min',
  },
  {
    title: '💪 근력 + 폐활량',
    desc: '주 2회 하체 근력(스쿼트·런지) + 호흡근 훈련(파워 브리드). 산소 운반력 ↑.',
    weeks: '12주에 +1~2 mL/kg/min',
  },
  {
    title: '🛌 회복·수면',
    desc: '주 1~2일 완전 휴식 + 7~9시간 수면. 회복 부족은 VO2max 정체의 가장 흔한 원인.',
    weeks: '즉시 효과',
  },
  {
    title: '🍎 체중 관리',
    desc: 'VO2max는 mL/kg/min — 체중 1kg 감량 시 자동 +0.5~1 향상. 단 급격한 감량은 X.',
    weeks: '4~8주 점진 감량',
  },
]

/* ─── PA Index 계산 도우미 (노르웨이용) ─── */
export interface PAOptions {
  frequency: 0 | 1 | 2 | 3   // 0: <1/주, 1: 1×/주, 2: 2~3×/주, 3: 4+×/주
  intensity: 0 | 1 | 2 | 3   // 0: 안 함, 1: 가벼움, 2: 보통(땀남), 3: 격렬(헐떡)
  duration:  0 | 1 | 2 | 3   // 0: <15분, 1: 15~30, 2: 30~60, 3: 60+
}
export function calcPAIndex(o: PAOptions): number {
  return Math.min(9, o.frequency + o.intensity + o.duration)
}

export const PA_FREQ_LABELS = ['주 1회 미만', '주 1회', '주 2~3회', '주 4회 이상']
export const PA_INTENSITY_LABELS = ['거의 안 함', '가벼움 (산책)', '보통 (땀남)', '격렬 (헐떡임)']
export const PA_DURATION_LABELS = ['15분 미만', '15~30분', '30~60분', '60분 이상']
