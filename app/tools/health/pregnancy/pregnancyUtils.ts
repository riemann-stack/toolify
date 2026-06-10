/* ──────────────────────────────────────────────────────
   health/pregnancy/pregnancyUtils.ts
   임신 주수, 산전 검사 일정, 태아 크기, 체크리스트, localStorage
   ※ 본 도구의 모든 정보는 참고용이며 의학적 진단·치료 도구가 아닙니다.
   ────────────────────────────────────────────────────── */

export type InputMode = 'lmp' | 'conception' | 'duedate'

export const PREGNANCY_TOTAL_DAYS = 280

/* ─── 삼분기 ─── */
export interface Trimester {
  id: 1 | 2 | 3
  name: string
  startWeek: number
  endWeek: number
  color: string
  description: string
}

export const TRIMESTERS: Trimester[] = [
  { id: 1, name: '1삼분기', startWeek: 1,  endWeek: 13, color: '#CA8A04', description: '배아·장기 형성기' },
  { id: 2, name: '2삼분기', startWeek: 14, endWeek: 27, color: '#059669', description: '안정기, 태동 시작' },
  { id: 3, name: '3삼분기', startWeek: 28, endWeek: 40, color: '#EA580C', description: '태아 급성장, 출산 준비' },
]

/* ─── 산전 검사 (보건복지부·대한산부인과학회 기준 일반 가이드) ─── */
export interface PrenatalTest {
  id: string
  name: string
  startWeek: number
  endWeek: number
  desc: string
  importance: 'essential' | 'recommended'
}

export const PRENATAL_TESTS: PrenatalTest[] = [
  { id: 'first',        name: '첫 산전 검사 (혈액·소변)',        startWeek: 6,  endWeek: 8,
    desc: '임신 확정·기본 혈액 검사·산모 건강 점검', importance: 'essential' },
  { id: 'nipt-1',       name: '기형아 1차 검사 (NT·통합검사)',   startWeek: 11, endWeek: 13,
    desc: '목 투명대(NT) 측정·다운증후군 통합검사 (혈청)', importance: 'recommended' },
  { id: 'nipt-2',       name: '기형아 2차 검사 (쿼드)',          startWeek: 16, endWeek: 18,
    desc: '쿼드 검사·신경관결손 위험 평가', importance: 'recommended' },
  { id: 'precise-us',   name: '정밀 초음파 (level 2)',           startWeek: 20, endWeek: 24,
    desc: '태아 장기·구조 정밀 검사·성별 확인 가능', importance: 'essential' },
  { id: 'gdm',          name: '임신성 당뇨 검사 (GTT)',         startWeek: 24, endWeek: 28,
    desc: '50g/100g 당부하 검사', importance: 'essential' },
  { id: 'late-anomaly', name: '후기 정밀 초음파',                startWeek: 28, endWeek: 32,
    desc: '태아 성장·양수량·태반 위치 점검', importance: 'recommended' },
  { id: 'gbs',          name: 'GBS (B군 연쇄상구균) 검사',       startWeek: 36, endWeek: 37,
    desc: '신생아 감염 예방 검사 (ACOG/CDC 36~37주 권고)', importance: 'essential' },
  { id: 'final',        name: '막달 검사·NST',                   startWeek: 35, endWeek: 39,
    desc: '태아심박동·자궁수축 모니터링', importance: 'essential' },
]

/* ─── 태아 크기 비유 (일반 정보, 개체차 큼) ─── */
export interface FetalSize {
  size: string; length: string; emoji: string; development: string
}

export const FETAL_SIZE_COMPARISON: Record<number, FetalSize> = {
  4:  { size: '양귀비씨',  length: '~2mm',  emoji: '🌱', development: '신경관 형성, 심장 박동 시작 직전' },
  5:  { size: '참깨',      length: '~2mm',  emoji: '🌾', development: '심장 박동 시작 (초음파로 보일 수 있음)' },
  6:  { size: '렌즈콩',    length: '~5mm',  emoji: '🌰', development: '얼굴 윤곽 형성 시작' },
  7:  { size: '블루베리',  length: '~10mm', emoji: '🫐', development: '팔·다리 싹 형성, 뇌 빠르게 발달' },
  8:  { size: '강낭콩',    length: '~16mm', emoji: '🥜', development: '손가락·발가락 형성 시작' },
  9:  { size: '체리',      length: '~23mm', emoji: '🍒', development: '주요 장기 거의 모두 형성' },
  10: { size: '딸기',      length: '~3cm',  emoji: '🍓', development: '관절 움직임 시작 (느낌 X)' },
  11: { size: '라임',      length: '~4cm',  emoji: '🟢', development: '얼굴 표정·삼키기 시작' },
  12: { size: '자두',      length: '~5cm',  emoji: '🟣', development: '반사 운동 시작, 손가락 빨기 가능' },
  13: { size: '복숭아',    length: '~7cm',  emoji: '🍑', development: '성대 형성, 1삼분기 마지막 주' },
  14: { size: '레몬',      length: '~9cm',  emoji: '🍋', development: '안정기 진입, 입덧 감소 시작' },
  15: { size: '사과',      length: '~10cm', emoji: '🍎', development: '뼈 단단해지기 시작' },
  16: { size: '아보카도',  length: '~11cm', emoji: '🥑', development: '머리카락 형성 시작' },
  17: { size: '배',        length: '~13cm', emoji: '🍐', development: '청각 발달 (소리 인식 시작)' },
  18: { size: '피망',      length: '~14cm', emoji: '🫑', development: '태동 느낌 시작 가능 (초산모는 20~22주)' },
  19: { size: '망고',      length: '~15cm', emoji: '🥭', development: '피부 보호막(태지) 형성' },
  20: { size: '바나나',    length: '~17cm', emoji: '🍌', development: '임신 중반, 정밀 초음파 시기' },
  21: { size: '당근',      length: '~26cm', emoji: '🥕', development: '눈썹·속눈썹 형성' },
  22: { size: '큰 양배추', length: '~28cm', emoji: '🥬', development: '체지방 축적 시작' },
  23: { size: '큰 망고',   length: '~29cm', emoji: '🥭', development: '청각 매우 발달, 심장 소리 들음' },
  24: { size: '옥수수',    length: '~30cm', emoji: '🌽', development: '폐 발달 (외부 생존 가능 시기 시작)' },
  25: { size: '콜리플라워', length: '~34cm', emoji: '🥦', development: '균형감각 발달' },
  26: { size: '콜라드',    length: '~35cm', emoji: '🥬', development: '눈 뜨기 시작' },
  27: { size: '꽃양배추',  length: '~36cm', emoji: '🥦', development: '2삼분기 마지막 주' },
  28: { size: '큰 가지',   length: '~37cm', emoji: '🍆', development: '3삼분기 진입, 급성장 시기' },
  29: { size: '큰 호박',   length: '~38cm', emoji: '🎃', development: '근육·신경 빠르게 발달' },
  30: { size: '큰 양배추', length: '~40cm', emoji: '🥬', development: '눈 색깔 결정 시작' },
  31: { size: '코코넛',    length: '~41cm', emoji: '🥥', development: '폐 surfactant 생산 (호흡 준비)' },
  32: { size: '큰 도자기', length: '~42cm', emoji: '🍯', development: '태아 위치 (머리 아래) 자리잡기' },
  33: { size: '파인애플',  length: '~43cm', emoji: '🍍', development: '뼈 단단해짐 (두개골 제외)' },
  34: { size: '큰 멜론',   length: '~45cm', emoji: '🍈', development: '면역 체계 발달' },
  35: { size: '큰 멜론',   length: '~46cm', emoji: '🍈', development: '막달 검진 준비기 (GBS 검사 36~37주)' },
  36: { size: '파파야',    length: '~47cm', emoji: '🍈', development: '태아 성숙 거의 완료' },
  37: { size: '루꼴라',    length: '~48cm', emoji: '🥬', development: '만삭 진입 (정상 분만 가능)' },
  38: { size: '리크',      length: '~49cm', emoji: '🌿', development: '태아 거의 모든 발달 완료' },
  39: { size: '미니 수박', length: '~50cm', emoji: '🍉', development: '출산 임박' },
  40: { size: '큰 수박',   length: '~51cm', emoji: '🍉', development: '출산 예정일! (±2주는 정상)' },
}

export function getFetalSize(week: number): FetalSize {
  if (week < 4)  return { size: '점', length: '~1mm', emoji: '✨', development: '착상기' }
  if (week > 40) return FETAL_SIZE_COMPARISON[40]
  return FETAL_SIZE_COMPARISON[week] ?? FETAL_SIZE_COMPARISON[Math.min(40, Math.max(4, Math.round(week)))]
}

/* ─── 출산 준비 체크리스트 ─── */
export interface ChecklistItem { id: string; name: string }

export const PREPARATION_CHECKLIST: Record<1 | 2 | 3, ChecklistItem[]> = {
  1: [
    { id: 'register',        name: '산부인과 등록·정기 검진 시작' },
    { id: 'first-test',      name: '초기 산전 검사 (혈액·소변)' },
    { id: 'folate',          name: '엽산 섭취 시작 (산부인과 상담)' },
    { id: 'lifestyle',       name: '음주·흡연·카페인 제한 시작' },
    { id: 'employer',        name: '직장 (임신 보고·휴가 계획 검토)' },
    { id: 'insurance',       name: '의료 보험·태아 보험 검토' },
    { id: 'morning-sick',    name: '입덧 기록·식이 조절' },
    { id: 'app',             name: '임신 앱·일지 활용 시작' },
  ],
  2: [
    { id: 'precise-us',      name: '정밀 초음파 예약·검사 (20~24주)' },
    { id: 'gdm-test',        name: '임신성 당뇨 검사 (24~28주)' },
    { id: 'movement',        name: '태동 기록 시작 (18~22주)' },
    { id: 'exercise',        name: '임산부 요가·필라테스·산책 시작' },
    { id: 'maternal-class',  name: '산모교실·분만 교육 등록' },
    { id: 'baby-name',       name: '태명 정하기' },
    { id: 'pregnancy-photo', name: '임신 기념 사진 촬영 (선택)' },
    { id: 'birth-hospital',  name: '출산 병원 결정·예약' },
    { id: 'birth-class',     name: '출산 호흡법·분만 강의 듣기' },
  ],
  3: [
    { id: 'gbs-test',        name: 'GBS 검사 (36~37주)' },
    { id: 'birth-bag',       name: '출산 가방 준비 (산모·신생아 용품)' },
    { id: 'baby-items',      name: '신생아 용품 준비 (옷·기저귀·젖병 등)' },
    { id: 'crib',            name: '아기침대·카시트 준비' },
    { id: 'postpartum',      name: '산후조리원·도우미 예약' },
    { id: 'vaccine',         name: '신생아 예방접종 일정 확인' },
    { id: 'birth-signs',     name: '분만 신호 (양수·진통 간격) 학습' },
    { id: 'emergency',       name: '응급 연락처·병원 가는 길 준비' },
    { id: 'birth-plan',      name: '분만 계획서 작성 (선택)' },
    { id: 'leave',           name: '출산 휴가·육아 휴직 신청' },
    { id: 'gift-prep',       name: '신생아 답례품·맘카페 준비 (선택)' },
  ],
}

/* ─── 생리주기 보정 ─── */
export interface CycleLength { value: number; name: string; adjustment: number }

export const CYCLE_LENGTHS: CycleLength[] = [
  { value: 24, name: '24일 (짧은 주기)', adjustment: -4 },
  { value: 26, name: '26일',              adjustment: -2 },
  { value: 28, name: '28일 (표준)',       adjustment: 0 },
  { value: 30, name: '30일',              adjustment: +2 },
  { value: 32, name: '32일',              adjustment: +4 },
  { value: 35, name: '35일 (긴 주기)',    adjustment: +7 },
]

/* ─── 메인 계산 ─── */
export interface PregnancyInput {
  inputMode: InputMode
  date: string  // YYYY-MM-DD
  cycleLength?: number
  isMultiple?: boolean
}

export interface PregnancyResult {
  lmp: Date          // 표시용 — LMP 모드는 입력한 실제 생리일 그대로
  datingLmp: Date    // 주기 보정이 반영된 데이팅 기준일(예정일·주수·검사일정 계산용)
  conceptionDate: Date
  dueDate: Date
  currentWeek: number
  currentDay: number
  totalDays: number
  daysToDue: number
  trimester: 1 | 2 | 3
  monthsApprox: number
  progressPercent: number
  isPast: boolean
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000)
}

export function calcPregnancy(input: PregnancyInput, today: Date = new Date()): PregnancyResult | null {
  if (!input.date) return null
  const inputDate = new Date(input.date)
  if (isNaN(inputDate.getTime())) return null

  // 표시용 LMP — LMP 모드는 입력값 그대로(사용자가 아는 날짜), 그 외는 역산
  let lmp: Date
  if (input.inputMode === 'lmp') {
    lmp = new Date(inputDate)
  } else if (input.inputMode === 'conception') {
    lmp = new Date(inputDate); lmp.setDate(lmp.getDate() - 14)
  } else {
    lmp = new Date(inputDate); lmp.setDate(lmp.getDate() - PREGNANCY_TOTAL_DAYS)
  }

  // 생리주기 보정 — LMP 입력 시에만 적용.
  // 긴 주기(>28)는 배란이 늦으므로 예정일이 늦어지고 현재 주수는 작아진다(+ 부호).
  // 수정일·예정일을 직접 입력한 모드는 이미 배란/예정일이 확정이므로 보정하지 않는다.
  const cycleAdj = (input.inputMode === 'lmp' && input.cycleLength && input.cycleLength !== 28)
    ? input.cycleLength - 28
    : 0
  const datingLmp = new Date(lmp); datingLmp.setDate(datingLmp.getDate() + cycleAdj)

  const dueDate = new Date(datingLmp); dueDate.setDate(dueDate.getDate() + PREGNANCY_TOTAL_DAYS)
  const conceptionDate = new Date(datingLmp); conceptionDate.setDate(conceptionDate.getDate() + 14)

  const totalDays = diffDays(datingLmp, today)
  if (totalDays < 0) return null
  const currentWeek = Math.floor(totalDays / 7)
  const currentDay = totalDays % 7
  const daysToDue = diffDays(today, dueDate)

  let trimester: 1 | 2 | 3 = 1
  if (currentWeek >= 28) trimester = 3
  else if (currentWeek >= 14) trimester = 2

  const progressPercent = Math.min(100, Math.round((totalDays / PREGNANCY_TOTAL_DAYS) * 1000) / 10)
  const monthsApprox = Math.floor(currentWeek / 4)

  return {
    lmp, datingLmp, conceptionDate, dueDate,
    currentWeek, currentDay, totalDays,
    daysToDue, trimester, monthsApprox,
    progressPercent,
    isPast: daysToDue < 0,
  }
}

/* ─── 산전 검사 일정 자동 생성 ─── */
export interface ScheduledTest {
  test: PrenatalTest
  startDate: Date
  endDate: Date
  status: 'past' | 'current' | 'upcoming'
  daysUntil: number
}

export function generateTestSchedule(lmp: Date, today: Date = new Date()): ScheduledTest[] {
  const todayMid = startOfDay(today)
  return PRENATAL_TESTS.map(test => {
    const startDate = new Date(lmp); startDate.setDate(startDate.getDate() + test.startWeek * 7)
    const endDate = new Date(lmp); endDate.setDate(endDate.getDate() + test.endWeek * 7)
    let status: ScheduledTest['status'] = 'upcoming'
    if (todayMid > endDate) status = 'past'
    else if (todayMid >= startOfDay(startDate)) status = 'current'
    const daysUntil = diffDays(todayMid, startDate)
    return { test, startDate, endDate, status, daysUntil }
  })
}

/* ─── 마일스톤 ─── */
export interface Milestone {
  name: string
  week: number
  date: Date
  daysUntil: number
}

export function calcMilestones(lmp: Date, today: Date = new Date()): Milestone[] {
  const todayMid = startOfDay(today)
  const list = [
    { name: '안정기 진입',     week: 14 },
    { name: '정밀 초음파',     week: 20 },
    { name: '3삼분기 진입',   week: 28 },
    { name: '만삭',            week: 37 },
    { name: '출산 예정일',     week: 40 },
  ]
  return list.map(m => {
    const date = new Date(lmp); date.setDate(date.getDate() + m.week * 7)
    return { ...m, date, daysUntil: diffDays(todayMid, date) }
  }).filter(m => m.daysUntil >= -7) // 지난 1주 이내까지 표시
}

/* ─── localStorage ─── */
export interface SavedPregnancy {
  babyName?: string
  inputMode: InputMode
  date: string
  cycleLength: number
  isMultiple: boolean
  checklistProgress: Record<string, boolean>
  savedAt: string
}

const STORAGE_KEY = 'youtil_pregnancy_v1'

export function saveProfile(data: SavedPregnancy) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch { /* */ }
}

export function loadProfile(): SavedPregnancy | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

export function clearProfile() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* */ }
}

/* ─── 포맷 ─── */
export function fmtDateKo(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return ''
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} (${days[date.getDay()]})`
}

export function fmtDateInput(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
