/* ───────────────────────────────────────────────────────────
   그립 사이즈 데이터
   - 기본 입력 단위: cm
   - 테니스 손 측정법(palm-to-ring-tip)을 primary로 사용
   ─────────────────────────────────────────────────────────── */

/* ─── 🎾 테니스 ─── */
export interface TennisGrip {
  size: string       // 4 1/8" 표기
  inches: number
  cm: number         // 인치 → cm
  eu: string         // L0~L6
  us: string         // 미국 사이즈
  desc: string
}

export const TENNIS_GRIPS: TennisGrip[] = [
  { size: '4"',     inches: 4.0,    cm: 10.16, eu: 'L0', us: '0 (jr)', desc: '주니어·아주 작은 손' },
  { size: '4 1/8"', inches: 4.125,  cm: 10.48, eu: 'L1', us: '0',      desc: '여성·청소년 평균' },
  { size: '4 1/4"', inches: 4.25,   cm: 10.80, eu: 'L2', us: '1',      desc: '여성·체형 작은 남성' },
  { size: '4 3/8"', inches: 4.375,  cm: 11.11, eu: 'L3', us: '2',      desc: '한국 남성 표준' },
  { size: '4 1/2"', inches: 4.5,    cm: 11.43, eu: 'L4', us: '3',      desc: '큰 손 남성' },
  { size: '4 5/8"', inches: 4.625,  cm: 11.75, eu: 'L5', us: '4',      desc: '매우 큰 손 (드뭄)' },
  { size: '4 3/4"', inches: 4.75,   cm: 12.07, eu: 'L6', us: '5',      desc: '거의 안 쓰임 (특주)' },
]

/** 손바닥+약지 길이 cm → 가장 가까운 테니스 그립 + 오버그립 보정
 *  오버그립 1겹 ≈ 그립 0.5단계 굵어짐 (≈ 0.16cm 가산 효과) */
export function recommendTennis(palmCm: number, overgrip: 0 | 1 | 2 = 0): { grip: TennisGrip; diffCm: number } {
  const adjusted = palmCm - overgrip * 0.16
  const grip = TENNIS_GRIPS.reduce((best, g) =>
    Math.abs(g.cm - adjusted) < Math.abs(best.cm - adjusted) ? g : best
  )
  return { grip, diffCm: adjusted - grip.cm }
}

/* ─── ⛳ 골프 ─── */
export interface GolfGrip {
  id: 'undersize' | 'standard' | 'midsize' | 'jumbo'
  name: string
  diameter: string  // 0.580"
  delta: string     // +1/16" 등
  diameterMm: number
  recommendedGlove: string
  desc: string
}

export const GOLF_GRIPS: GolfGrip[] = [
  { id: 'undersize', name: '언더사이즈',  diameter: '0.560"', delta: '−1/64"', diameterMm: 14.22, recommendedGlove: '글러브 20~22호 (S)',   desc: '여성·청소년·작은 손' },
  { id: 'standard',  name: '표준',        diameter: '0.580"', delta: '기본',   diameterMm: 14.73, recommendedGlove: '글러브 23~25호 (M·L)', desc: '한국 남성 약 60%가 사용' },
  { id: 'midsize',   name: '미드사이즈',  diameter: '0.640"', delta: '+1/16"', diameterMm: 16.26, recommendedGlove: '글러브 26~27호 (XL)',  desc: '큰 손·관절염·그립 압력 ↓ 원할 때' },
  { id: 'jumbo',     name: '점보',        diameter: '0.680"', delta: '+1/8"',  diameterMm: 17.27, recommendedGlove: '글러브 28호+ (XXL)',   desc: '아주 큰 손·드라이브 슬라이스 교정' },
]

/** 손 전체 길이(손목 주름 ~ 중지 끝) cm → 한국 글러브 호수
 *  근사: 호수 ≈ round(handLengthCm + 4) (17~24cm → 21~28호) */
export function gloveByHandLength(handCm: number): number {
  return Math.max(20, Math.min(30, Math.round(handCm + 4)))
}

/** 글러브 호수 → 골프 그립 */
export function golfGripByGlove(gloveSize: number): GolfGrip {
  if (gloveSize <= 22) return GOLF_GRIPS[0]
  if (gloveSize <= 25) return GOLF_GRIPS[1]
  if (gloveSize <= 27) return GOLF_GRIPS[2]
  return GOLF_GRIPS[3]
}

/* ─── 🏸 배드민턴 ─── */
export interface BadmintonGrip {
  id: string  // G2~G6
  circumferenceMm: number  // 그립 둘레
  desc: string
}

export const BADMINTON_GRIPS: BadmintonGrip[] = [
  { id: 'G2', circumferenceMm: 98, desc: '큰 손 (드뭄, 한국 출고 거의 없음)' },
  { id: 'G3', circumferenceMm: 95, desc: '큰 손 남성 (드뭄)' },
  { id: 'G4', circumferenceMm: 92, desc: '한국 남성 표준 — 라켓 기본 출고' },
  { id: 'G5', circumferenceMm: 89, desc: '여성·작은 손 남성 표준' },
  { id: 'G6', circumferenceMm: 86, desc: '여성·청소년·아주 작은 손' },
]

/** 손바닥+약지 cm → 배드민턴 그립 (오버그립 권장 사용 — 거의 모두 1~2겹) */
export function recommendBadminton(palmCm: number, overgrip: 0 | 1 | 2 = 1): BadmintonGrip {
  // 한국 배드민턴 동호인 80%가 오버그립 1~2겹 사용 → 한 단계 작게 추천
  const target = palmCm - overgrip * 0.20
  if (target < 10.0) return BADMINTON_GRIPS[4]   // G6
  if (target < 10.7) return BADMINTON_GRIPS[3]   // G5
  if (target < 11.4) return BADMINTON_GRIPS[2]   // G4
  if (target < 12.1) return BADMINTON_GRIPS[1]   // G3
  return BADMINTON_GRIPS[0]                       // G2
}

/* ─── 🎾 스쿼시 ─── */
export interface SquashGrip {
  size: string
  inches: number
  desc: string
}

export const SQUASH_GRIPS: SquashGrip[] = [
  { size: 'Small (3 7/8")',  inches: 3.875, desc: '작은 손·여성' },
  { size: 'Medium (4 1/8")', inches: 4.125, desc: '한국 표준' },
  { size: 'Large (4 3/8")',  inches: 4.375, desc: '큰 손 남성' },
]

export function recommendSquash(palmCm: number): SquashGrip {
  if (palmCm < 10.5) return SQUASH_GRIPS[0]
  if (palmCm < 11.5) return SQUASH_GRIPS[1]
  return SQUASH_GRIPS[2]
}

/* ─── 측정 변환 ─── */

/** 손바닥+약지 cm → 손 전체 길이 cm (인체 측정학 평균 비율 0.58 역산) */
export function palmToFullHand(palmCm: number): number {
  return Math.round((palmCm / 0.58) * 10) / 10
}

/** 손 전체 길이 cm → 손바닥+약지 cm */
export function fullHandToPalm(fullCm: number): number {
  return Math.round(fullCm * 0.58 * 10) / 10
}

/** cm → 가장 가까운 인치 분수 표기 (1/8" 단위) */
export function cmToInchFraction(cm: number): string {
  const inches = cm / 2.54
  const eighths = Math.round(inches * 8)
  const whole = Math.floor(eighths / 8)
  const frac = eighths % 8
  if (frac === 0) return `${whole}"`
  // 약분
  if (frac === 4) return `${whole} 1/2"`
  if (frac === 2) return `${whole} 1/4"`
  if (frac === 6) return `${whole} 3/4"`
  return `${whole} ${frac}/8"`
}

/* ─── 그립 사이즈 잘못 맞췄을 때 부상 ─── */
export const INJURIES = [
  {
    cause: '그립이 너무 작음',
    sports: '🎾 테니스·🏸 배드민턴',
    risks: [
      '테니스 엘보(외측 상과염) — 가장 흔한 라켓 부상',
      '회내근 과부하로 인한 전완 통증',
      '회전을 막으려 손목·전완 근육 과긴장',
    ],
    color: '#FF6B6B',
  },
  {
    cause: '그립이 너무 큼',
    sports: '🎾 테니스·🏸 배드민턴',
    risks: [
      '손목 굴곡근 만성 통증',
      '컨트롤·스핀 감소 (스윙 일관성 ↓)',
      '엄지 관절 부담 (TFCC 자극)',
    ],
    color: '#FF8C3E',
  },
  {
    cause: '골프 그립이 너무 가늘음',
    sports: '⛳ 골프',
    risks: [
      '그립 압력 과다 → 손목·어깨 긴장',
      '훅(좌측 빠짐) 경향 ↑',
      '장기적으로 골프 엘보(내측 상과염)',
    ],
    color: '#FF6B6B',
  },
  {
    cause: '골프 그립이 너무 굵음',
    sports: '⛳ 골프',
    risks: [
      '손목 회전 부족 → 슬라이스(우측 빠짐) 경향 ↑',
      '클럽 페이스 컨트롤 저하',
      '비거리 손실 (스피드 ↓)',
    ],
    color: '#FF8C3E',
  },
]
