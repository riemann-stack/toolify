/* 월 저축 계산기 — 데이터·계산 유틸 */

export type Household = '1' | '2' | '3' | '4'
export type AgeGroup = '20s' | '30s_single' | '30s_married' | '40s' | '50s'

/* 가구 월평균 소비지출 (만원) — 국가데이터처 2024년 연간 가계동향조사
   · 1인 가구 168.9만원 (「2025 통계로 보는 1인가구」) · 전체 가구 289만원
   2~4인 가구별 값은 KOSIS 「가구원수별 가구당 월평균 가계수지」 확인 전까지 비교하지 않는다(null) —
   전체 평균을 다인 가구에 대면 지출이 많은 4인 가구가 '과다'로 잘못 판정되기 때문. */
export const ALL_HOUSEHOLD_AVG_EXPENSE_2024 = 289
export const HOUSEHOLD_AVG_EXPENSE: Record<Household, { label: string; expense: number | null }> = {
  '1': { label: '1인 가구',     expense: 169 },
  '2': { label: '2인 가구',     expense: null },
  '3': { label: '3인 가구',     expense: null },
  '4': { label: '4인+ 가구',    expense: null },
}
export const isHousehold = (v: unknown): v is Household => v === '1' || v === '2' || v === '3' || v === '4'

/* 연령대별 권장 저축률 (%) */
export interface AgeGroupMeta {
  id: AgeGroup
  label: string
  rateMin: number
  rateMax: number
  desc: string
}

export const AGE_GROUPS: AgeGroupMeta[] = [
  { id: '20s',          label: '20대 (사회초년생)',     rateMin: 30, rateMax: 40, desc: '복리 효과 시작 + 결혼·내 집 자금 준비 시기' },
  { id: '30s_single',   label: '30대 미혼',              rateMin: 40, rateMax: 50, desc: '소득 증가 + 부양 부담 적음 — 황금 저축기' },
  { id: '30s_married',  label: '30대 기혼·자녀 X',        rateMin: 30, rateMax: 40, desc: '가족 형성·내 집 마련 + 양가 부양' },
  { id: '40s',          label: '40대 가족 (자녀 양육)',   rateMin: 20, rateMax: 30, desc: '교육비·주거비 정점 — 저축률 일시 하락 OK' },
  { id: '50s',          label: '50대 (은퇴 준비)',        rateMin: 30, rateMax: 40, desc: '자녀 독립 + 은퇴 대비 마지막 저축 시기' },
]

export const getAgeGroup = (id: AgeGroup) => AGE_GROUPS.find((a) => a.id === id) ?? AGE_GROUPS[1]
export const isAgeGroup = (v: unknown): v is AgeGroup => AGE_GROUPS.some((a) => a.id === v)

/* ─────────────────────────────────────────────
   고정비·변동비 카테고리
   ───────────────────────────────────────────── */

export interface ExpenseItem {
  id: string
  emoji: string
  label: string
  type: 'fixed' | 'variable'
  desc: string
  defaultMan: number   // 만원 (1인 기준 기본값)
}

export const EXPENSE_ITEMS: ExpenseItem[] = [
  /* 고정비 7종 */
  { id: 'rent',     emoji: '🏠', label: '월세/관리비',         type: 'fixed', desc: '월세·관리비·전기·수도·가스',                  defaultMan: 60 },
  { id: 'loan',     emoji: '🏦', label: '대출 원리금',          type: 'fixed', desc: '전세대출·신용·자동차·학자금',                defaultMan: 40 },
  { id: 'comm',     emoji: '📱', label: '통신·구독',            type: 'fixed', desc: '인터넷·모바일·OTT·음악·뉴스',                defaultMan: 10 },
  { id: 'transport',emoji: '🚗', label: '교통비',               type: 'fixed', desc: '대중교통·정기권·자동차 할부·주유비',          defaultMan: 15 },
  { id: 'insure',   emoji: '🛡️', label: '보험',                type: 'fixed', desc: '실손·자동차·생명·암·치아',                   defaultMan: 15 },
  { id: 'edu',      emoji: '📚', label: '교육·학원',            type: 'fixed', desc: '자녀 학원·본인 자기계발·학원비',              defaultMan: 0 },
  { id: 'fixed_etc',emoji: '💼', label: '기타 고정',            type: 'fixed', desc: '청약·연금·정기 후원',                        defaultMan: 5 },
  /* 변동비 6종 */
  { id: 'food',     emoji: '🍽️', label: '식비 (장보기·배달)',  type: 'variable', desc: '식자재·배달·반찬가게',                       defaultMan: 30 },
  { id: 'eatout',   emoji: '🍻', label: '외식·카페',           type: 'variable', desc: '점심·저녁·카페·술자리',                      defaultMan: 25 },
  { id: 'shop',     emoji: '👕', label: '쇼핑·생활용품',       type: 'variable', desc: '의류·뷰티·생활용품·가전',                    defaultMan: 20 },
  { id: 'leisure',  emoji: '🎮', label: '문화·여가',           type: 'variable', desc: '영화·게임·취미·도서',                        defaultMan: 10 },
  { id: 'travel',   emoji: '✈️', label: '여행·기타',            type: 'variable', desc: '여행·경조사·기타',                           defaultMan: 10 },
  { id: 'health',   emoji: '💊', label: '의료·건강',           type: 'variable', desc: '병원·약·건강식품·운동',                      defaultMan: 5 },
]

export const FIXED_ITEMS = EXPENSE_ITEMS.filter((e) => e.type === 'fixed')
export const VAR_ITEMS = EXPENSE_ITEMS.filter((e) => e.type === 'variable')

/* ─────────────────────────────────────────────
   저축 진단 등급 — 가이드용 구간 (통계 백분위 아님)
   ───────────────────────────────────────────── */

export interface SavingsGrade {
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  rateMin: number
  label: string
  emoji: string
  color: string
  desc: string
}

export const GRADES: SavingsGrade[] = [
  { grade: 'S', rateMin: 50, label: '절약왕',     emoji: '🏆', color: 'var(--teal-600)', desc: '수입의 절반 이상을 모으는 단계. 자산 형성이 빠르게 진행됩니다' },
  { grade: 'A', rateMin: 35, label: '우수',       emoji: '⭐', color: 'var(--emerald-600)', desc: '권장 구간의 상단. 목표 달성이 빠릅니다' },
  { grade: 'B', rateMin: 20, label: '양호',       emoji: '👍', color: 'var(--cyan-600)', desc: '일반적으로 권하는 저축 수준입니다' },
  { grade: 'C', rateMin: 10, label: '보통',       emoji: '😐', color: 'var(--amber-600)', desc: '저축은 되고 있지만 권장 수준보다 낮아요. 변동비를 점검해 보세요' },
  { grade: 'D', rateMin: 0,  label: '점검 필요',  emoji: '⚠️', color: 'var(--pink-600)', desc: '저축액 부족. 고정비·변동비 재구성 필요' },
]

export function getGrade(savingsRate: number): SavingsGrade {
  return GRADES.find((g) => savingsRate >= g.rateMin) ?? GRADES[GRADES.length - 1]
}

/* ─────────────────────────────────────────────
   6 항아리(JARS) 모델 (T. Harv Eker)
   ───────────────────────────────────────────── */

export interface JarMeta {
  id: string
  emoji: string
  label: string
  shortLabel: string
  pct: number
  desc: string
  color: string
  examples: string
}

export const JARS: JarMeta[] = [
  { id: 'nec',  emoji: '🍽️', label: '생활비 (NEC)',         shortLabel: '생활비',  pct: 55, desc: 'Necessities — 의식주·교통·통신 등 기본 생활', color: 'var(--cyan-600)', examples: '월세·식비·교통·통신·공과금' },
  { id: 'edu',  emoji: '📚', label: '교육·자기개발 (EDU)',  shortLabel: '교육',    pct: 10, desc: 'Education — 책·강의·세미나·자격증',           color: 'var(--amber-600)', examples: '책·인강·세미나·자격증·코칭' },
  { id: 'play', emoji: '🎮', label: '놀이·취미 (PLAY)',      shortLabel: '놀이',    pct: 10, desc: 'Play — 즐거움·여행·취미·외식',                color: 'var(--orange-600)', examples: '여행·외식·취미·문화·여가' },
  { id: 'ffa',  emoji: '📈', label: '재정자유·투자 (FFA)',   shortLabel: '투자',    pct: 10, desc: 'Financial Freedom — 투자·불로소득용, 원금은 쓰지 않음', color: 'var(--teal-600)', examples: 'ETF·주식·배당·연금저축·IRP' },
  { id: 'ltss', emoji: '💰', label: '장기 목적 저축 (LTSS)', shortLabel: '목적저축', pct: 10, desc: 'Long-Term Savings for Spending — 여행·차·주택 계약금 등 큰 지출 대비 저축', color: 'var(--pink-600)', examples: '여행·자동차·주택 계약금·가전 교체 자금' },
  { id: 'give', emoji: '🎁', label: '기부·나눔 (GIVE)',      shortLabel: '기부',    pct: 5,  desc: 'Give — 기부·후원·선물',                       color: 'var(--amethyst)', examples: '정기 후원·선물·경조사' },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

/** 월 수지 (만원) = 수입 - 지출. 지출이 수입을 초과하면 음수(적자)로 반환 */
export function calcSavings(income: number, expense: number): number {
  return income - expense
}

/** 저축률 (%) */
export function calcSavingsRate(income: number, savings: number): number {
  return income > 0 ? (savings / income) * 100 : 0
}

/* ─────────────────────────────────────────────
   목표 역산 — 복리 적용
   ───────────────────────────────────────────── */

/**
 * 월 적립 + 복리: 월 적립액 P, 월 이율 r, 기간 n개월
 * FV = P × ((1+r)^n - 1) / r
 * 월 적립액 P = FV × r / ((1+r)^n - 1)
 */
export function monthlyForGoal(goalMan: number, years: number, annualRatePct: number): number {
  if (!(goalMan > 0) || !(years > 0)) return 0   // 음수·0 입력 방어
  const n = Math.max(1, Math.round(years * 12))  // 소수 연수(1.3년)도 정수 개월로
  const r = Math.max(0, annualRatePct) / 100 / 12
  if (r === 0) return goalMan / n
  const denom = (Math.pow(1 + r, n) - 1) / r
  return denom > 0 ? goalMan / denom : goalMan / n
}

/** 적립식 미래가치 시뮬레이션 (월별 누적) */
export function simulateGrowth(monthlyMan: number, years: number, annualRatePct: number): { month: number; balance: number }[] {
  const result: { month: number; balance: number }[] = []
  const r = annualRatePct / 100 / 12
  const n = Math.max(1, Math.round(years * 12))  // 소수 연수면 마지막(목표) 행이 빠지지 않도록 정수 개월
  let balance = 0
  for (let m = 1; m <= n; m++) {
    balance = balance * (1 + r) + monthlyMan
    if (m % 12 === 0 || m === n) {
      result.push({ month: m, balance })
    }
  }
  return result
}

/* ─────────────────────────────────────────────
   절세 정책 상품 5종
   ───────────────────────────────────────────── */

export interface TaxProduct {
  id: string
  emoji: string
  label: string
  shortLabel: string
  qualify: string         // 자격
  monthlyMaxMan: number   // 월 한도
  yearlyMaxMan: number    // 연 한도
  durationYears: number   // 기간
  taxBenefitDesc: string  // 절세 효과 설명
  pros: string[]
  cons: string[]
  recommendFor: string
  color: string
}

export const TAX_PRODUCTS: TaxProduct[] = [
  {
    // 2026년 6월 출시 (정책브리핑). 소득 요건·우대형 대상 등 세부는 금융위원회 공고로 확인 — 확인 안 된 수치는 싣지 않음
    id: 'youth_future',
    emoji: '🌱',
    label: '청년미래적금',
    shortLabel: '청년미래',
    qualify: '만 19~34세 · 소득 요건 있음 (2026년 6월 출시, 매년 6월·12월 모집 — 금융위원회 공고 확인)',
    monthlyMaxMan: 50,
    yearlyMaxMan: 600,
    durationYears: 3,
    taxBenefitDesc: '납입액에 정부기여금 매칭 — 일반형 6%, 우대형 12% (우대형 요건은 공고 확인)',
    pros: ['정부기여금 매칭 (일반형 6%·우대형 12%)', '3년 만기 — 청년도약계좌(5년)보다 짧음', '청년 전용 상품'],
    cons: ['나이·소득 요건', '모집 기간(6월·12월)에만 가입', '중도해지 시 정부기여금을 받지 못할 수 있음'],
    recommendFor: '20~30대 초반 사회초년생',
    color: 'var(--teal-600)',
  },
  {
    id: 'isa',
    emoji: '💼',
    label: 'ISA 계좌',
    shortLabel: 'ISA',
    qualify: '만 19세 이상 (근로소득 있는 만 15세 이상 포함) · 직전 3년 내 금융소득종합과세 대상자 제외',
    monthlyMaxMan: 167,    // 연 2,000만원 / 12
    yearlyMaxMan: 2000,
    durationYears: 3,
    taxBenefitDesc: '연 200만원까지 비과세 (서민형 400만원), 초과분은 9.9% 분리과세',
    pros: ['주식·ETF·예금·펀드 통합 운용', '비과세 한도 큼', '납입원금 범위 내 중도 인출 가능'],
    cons: ['의무기간(3년) 전 해지 시 비과세 혜택 소멸', '연간 한도 제한'],
    recommendFor: '주식·ETF 투자 + 절세 동시',
    color: 'var(--amber-600)',
  },
  {
    id: 'pension_save',
    emoji: '🏦',
    label: '연금저축',
    shortLabel: '연금저축',
    qualify: '나이·소득 제한 없음 (누구나 가입)',
    monthlyMaxMan: 50,
    yearlyMaxMan: 600,
    durationYears: 10,
    taxBenefitDesc: '연 600만원 한도 세액공제 16.5% (총급여 5,500만원·종합소득 4,500만원 이하), 13.2%(초과) — 연 최대 99만원',
    pros: ['연말정산 세액공제 (연 최대 99만원)', '운용 자유도 높음', '평생 가입'],
    cons: ['만 55세 이후 연금 수령', '중도해지 시 세액공제받은 납입액·운용수익에 기타소득세 16.5%'],
    recommendFor: '직장인·세액공제 받고 싶은 모든 소득자',
    color: 'var(--cyan-600)',
  },
  {
    id: 'irp',
    emoji: '📊',
    label: 'IRP (개인형 퇴직연금)',
    shortLabel: 'IRP',
    qualify: '소득 있는 모든 근로자·자영업자',
    monthlyMaxMan: 75,
    yearlyMaxMan: 900,
    durationYears: 10,
    taxBenefitDesc: '연 900만원 한도 (연금저축 합산) 세액공제 — 연 최대 148.5만원',
    pros: ['연금저축과 합산 한도 확장', '퇴직금 통합 운용 가능', '안전·위험 자산 분산'],
    cons: ['만 55세 이후 연금 수령', '중도해지 어려움', '위험자산 70% 한도'],
    recommendFor: '연금저축 600 채운 후 추가 절세',
    color: 'var(--orange-600)',
  },
  {
    id: 'house',
    emoji: '🏠',
    label: '주택청약 종합저축',
    shortLabel: '주택청약',
    qualify: '누구나 가입 (1인 1계좌) · 소득공제는 무주택 세대주만',
    monthlyMaxMan: 25,
    yearlyMaxMan: 300,    // 2024년 소득공제 인정 한도 240만→300만 상향 (월 25만 인정)
    durationYears: 10,
    taxBenefitDesc: '무주택 세대주 + 총급여 7천만원 이하 시 연 300만원 한도 40% 소득공제 (최대 120만원, 2024년 상향)',
    pros: ['청약가점 누적', '소득공제 (자격 요건)', '저금리 시대 대안'],
    cons: ['금리 낮음', '청약 사용 시 해지', '소득공제 자격 까다로움'],
    recommendFor: '무주택 청년·세대주',
    color: 'var(--pink-600)',
  },
  {
    id: 'youth_jump',
    emoji: '🌿',
    label: '청년도약계좌 (기존 가입자)',
    shortLabel: '청년도약',
    qualify: '신규 가입은 2025년 12월 종료 — 이미 가입한 사람의 유지·만기 참고용',
    monthlyMaxMan: 70,
    yearlyMaxMan: 840,
    durationYears: 5,
    taxBenefitDesc: '정부 기여금 (소득별 월 최대 약 3.3만원) + 만기 비과세 + 우대금리',
    pros: ['정부 기여금 (월 최대 약 3.3만원)', '5년 만기 비과세', '청년 전용 우대금리'],
    cons: ['신규 가입 불가 (2025년 12월 종료)', '5년 유지해야 혜택', '중도해지 시 정부지원금 환수'],
    recommendFor: '이미 가입한 청년 — 가능하면 만기까지 유지',
    color: 'var(--emerald-600)',
  },
]

/* ─────────────────────────────────────────────
   목표 프리셋
   ───────────────────────────────────────────── */

export interface GoalPreset {
  id: string
  emoji: string
  label: string
  amountMan: number   // 만원
  yearsDefault: number
}

export const GOAL_PRESETS: GoalPreset[] = [
  { id: 'm1',    emoji: '💰', label: '1억 모으기',         amountMan: 10000,  yearsDefault: 7  },
  { id: 'wed',   emoji: '💍', label: '결혼 자금 5천',      amountMan: 5000,   yearsDefault: 3  },
  { id: 'jeonse',emoji: '🏘️', label: '전세 자금 3억',       amountMan: 30000,  yearsDefault: 8  },
  { id: 'home',  emoji: '🏠', label: '내 집 마련 5억',     amountMan: 50000,  yearsDefault: 12 },
  { id: 'edu',   emoji: '🎓', label: '자녀 교육비 1억',    amountMan: 10000,  yearsDefault: 15 },
  { id: 'ret',   emoji: '🏖️', label: '은퇴 자산 10억',     amountMan: 100000, yearsDefault: 20 },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function fmtMan(man: number): string {
  if (Math.abs(man) >= 10000) {
    const eok = man / 10000
    return `${fmt(eok, eok < 10 ? 2 : 1)}억`
  }
  return `${fmt(man, 0)}만원`
}
