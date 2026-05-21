/* 월 저축 계산기 — 데이터·계산 유틸 */

export type Household = '1' | '2' | '3' | '4'
export type AgeGroup = '20s' | '30s_single' | '30s_married' | '40s' | '50s'

/* 한국 가구 평균 월 지출 (만원, 통계청 2024 가계동향조사 일반 참고치) */
export const HOUSEHOLD_AVG_EXPENSE: Record<Household, { label: string; expense: number }> = {
  '1': { label: '1인 가구',     expense: 159 },
  '2': { label: '2인 가구',     expense: 229 },
  '3': { label: '3인 가구',     expense: 290 },
  '4': { label: '4인+ 가구',    expense: 340 },
}

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

export const getAgeGroup = (id: AgeGroup) => AGE_GROUPS.find((a) => a.id === id)!

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
   저축 진단 등급
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
  { grade: 'S', rateMin: 50, label: '절약왕',     emoji: '🏆', color: '#0D9488', desc: '상위 1% 저축률. 자산 형성 가속 단계' },
  { grade: 'A', rateMin: 35, label: '우수',       emoji: '⭐', color: '#059669', desc: '한국 상위 10% 수준. 목표 달성 빠름' },
  { grade: 'B', rateMin: 20, label: '양호',       emoji: '👍', color: '#0891B2', desc: '평균 이상. 일반 가계 권장 수준' },
  { grade: 'C', rateMin: 10, label: '보통',       emoji: '😐', color: '#D97706', desc: '한국 평균. 변동비 점검 필요' },
  { grade: 'D', rateMin: 0,  label: '점검 필요',  emoji: '⚠️', color: '#DB2777', desc: '저축액 부족. 고정비·변동비 재구성 필요' },
]

export function getGrade(savingsRate: number): SavingsGrade {
  return GRADES.find((g) => savingsRate >= g.rateMin) ?? GRADES[GRADES.length - 1]
}

/* ─────────────────────────────────────────────
   6 항아리 모델 (Sharon Lechter)
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
  { id: 'nec',  emoji: '🍽️', label: '생활비 (NEC)',         shortLabel: '생활비',  pct: 55, desc: 'Necessities — 의식주·교통·통신 등 기본 생활', color: '#0891B2', examples: '월세·식비·교통·통신·공과금' },
  { id: 'edu',  emoji: '📚', label: '교육·자기개발 (EDU)',  shortLabel: '교육',    pct: 10, desc: 'Education — 책·강의·세미나·자격증',           color: '#D97706', examples: '책·인강·세미나·자격증·코칭' },
  { id: 'play', emoji: '🎮', label: '놀이·취미 (PLAY)',      shortLabel: '놀이',    pct: 10, desc: 'Play — 즐거움·여행·취미·외식',                color: '#EA580C', examples: '여행·외식·취미·문화·여가' },
  { id: 'ffa',  emoji: '💰', label: '저축·재정자유 (FFA)',   shortLabel: '저축',    pct: 10, desc: 'Financial Freedom — 비상금·단기 저축',         color: '#0D9488', examples: '예적금·CMA·비상자금' },
  { id: 'ltss', emoji: '📈', label: '장기 투자 (LTSS)',      shortLabel: '투자',    pct: 10, desc: 'Long-Term Savings — 주식·연금·부동산',        color: '#DB2777', examples: 'ETF·연금저축·IRP·주택청약' },
  { id: 'give', emoji: '🎁', label: '기부·나눔 (GIVE)',      shortLabel: '기부',    pct: 5,  desc: 'Give — 기부·후원·선물',                       color: '#9B59B6', examples: '정기 후원·선물·경조사' },
]

/* ─────────────────────────────────────────────
   계산 함수
   ───────────────────────────────────────────── */

/** 저축액 (만원) = 수입 - 지출 */
export function calcSavings(income: number, expense: number): number {
  return Math.max(0, income - expense)
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
  const n = years * 12
  const r = annualRatePct / 100 / 12
  if (r === 0) return goalMan / n
  const denom = (Math.pow(1 + r, n) - 1) / r
  return denom > 0 ? goalMan / denom : goalMan / n
}

/** 적립식 미래가치 시뮬레이션 (월별 누적) */
export function simulateGrowth(monthlyMan: number, years: number, annualRatePct: number): { month: number; balance: number }[] {
  const result: { month: number; balance: number }[] = []
  const r = annualRatePct / 100 / 12
  let balance = 0
  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + r) + monthlyMan
    if (m % 12 === 0 || m === years * 12) {
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
    id: 'youth_jump',
    emoji: '🌱',
    label: '청년도약계좌',
    shortLabel: '청년도약',
    qualify: '만 19~34세 + 개인소득 7,500만원 이하 + 가구소득 중위 250%',
    monthlyMaxMan: 70,
    yearlyMaxMan: 840,
    durationYears: 5,
    taxBenefitDesc: '정부 매칭 (소득별 월 최대 7만원) + 만기 비과세 + 우대금리',
    pros: ['정부 매칭 (월 최대 7만원)', '5년 만기 비과세', '청년 전용 우대금리'],
    cons: ['소득 제한 있음', '5년 의무 가입', '중도해지 시 정부지원금 환수'],
    recommendFor: '20~30대 초반 사회초년생',
    color: '#0D9488',
  },
  {
    id: 'isa',
    emoji: '💼',
    label: 'ISA 계좌',
    shortLabel: 'ISA',
    qualify: '만 19세 이상 (소득 무관, 단 일반·서민·농어민형 분류)',
    monthlyMaxMan: 167,    // 연 2,000만원 / 12
    yearlyMaxMan: 2000,
    durationYears: 3,
    taxBenefitDesc: '연 200만원까지 비과세 (서민형 400만원), 초과분은 9.9% 분리과세',
    pros: ['주식·ETF·예금·펀드 통합 운용', '비과세 한도 큼', '3년 후 자유 인출'],
    cons: ['중도 인출 시 비과세 혜택 일부 소멸', '연간 한도 제한'],
    recommendFor: '주식·ETF 투자 + 절세 동시',
    color: '#D97706',
  },
  {
    id: 'pension_save',
    emoji: '🏦',
    label: '연금저축',
    shortLabel: '연금저축',
    qualify: '만 18세 이상 (소득 무관)',
    monthlyMaxMan: 50,
    yearlyMaxMan: 600,
    durationYears: 10,
    taxBenefitDesc: '연 600만원 한도 세액공제 16.5% (총소득 5,500만원 이하), 13.2%(초과) — 연 99만원 환급',
    pros: ['세액공제 즉시 환급 (연 최대 99만원)', '운용 자유도 높음', '평생 가입'],
    cons: ['만 55세 이후 연금 수령', '중도해지 시 기타소득세 16.5%'],
    recommendFor: '직장인·세액공제 받고 싶은 모든 소득자',
    color: '#0891B2',
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
    taxBenefitDesc: '연 900만원 한도 (연금저축 합산) 세액공제 — 연 최대 148만원 환급',
    pros: ['연금저축과 합산 한도 확장', '퇴직금 통합 운용 가능', '안전·위험 자산 분산'],
    cons: ['만 55세 이후 연금 수령', '중도해지 어려움', '위험자산 70% 한도'],
    recommendFor: '연금저축 600 채운 후 추가 절세',
    color: '#EA580C',
  },
  {
    id: 'house',
    emoji: '🏠',
    label: '주택청약 종합저축',
    shortLabel: '주택청약',
    qualify: '무주택자 (1세대 1청약통장)',
    monthlyMaxMan: 50,
    yearlyMaxMan: 240,    // 일반 월 2~50만원, 소득공제 한도 별도
    durationYears: 10,
    taxBenefitDesc: '무주택 세대주 + 총급여 7천만원 이하 시 연 240만원 한도 40% 소득공제 (최대 96만원)',
    pros: ['청약가점 누적', '소득공제 (자격 요건)', '저금리 시대 대안'],
    cons: ['금리 낮음', '청약 사용 시 해지', '소득공제 자격 까다로움'],
    recommendFor: '무주택 청년·세대주',
    color: '#DB2777',
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
