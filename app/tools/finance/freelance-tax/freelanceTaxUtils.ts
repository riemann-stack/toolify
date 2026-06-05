/* ──────────────────────────────────────────────────────
   freelance-tax/freelanceTaxUtils.ts
   2026년 프리랜서 종합소득세 계산
   ────────────────────────────────────────────────────── */

/* ─── 종합소득세 누진세율 (2026년 기준) ─── */
export interface TaxBracket {
  min: number      // 과세표준 하한 (원, 미만)
  max: number      // 과세표준 상한 (원, 이하)
  rate: number     // 세율 (소수)
  deduction: number // 누진공제액 (원)
  label: string
}

export const PROGRESSIVE_BRACKETS: TaxBracket[] = [
  { min:           0, max:  14_000_000, rate: 0.06, deduction:          0, label: '~ 1,400만' },
  { min:  14_000_000, max:  50_000_000, rate: 0.15, deduction:  1_260_000, label: '~ 5,000만' },
  { min:  50_000_000, max:  88_000_000, rate: 0.24, deduction:  5_760_000, label: '~ 8,800만' },
  { min:  88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000, label: '~ 1.5억' },
  { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000, label: '~ 3억' },
  { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000, label: '~ 5억' },
  { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000, label: '~ 10억' },
  { min: 1_000_000_000, max: Infinity,  rate: 0.45, deduction: 65_940_000, label: '10억 초과' },
]

/* ─── 단순경비율 업종 (2026년 국세청 발표 기준) ─── */
export interface IndustryPreset {
  id: string
  code: string         // 업종코드
  name: string         // 표시명
  category: '글·번역·강의' | '디자인·콘텐츠' | 'IT·기술' | '미용·서비스' | '판매·중개' | '기타'
  simpleRate: number   // 단순경비율 %
  baseRate: number     // 기준경비율 %
  /** 단순경비율 적용 한도 — 계속사업자 기준(직전년도 수입, 원).
   *  인적용역·음식 3,600만 / 도소매 6,000만 / 기타 서비스 2,400만.
   *  신규사업자(개업 첫해)는 복식부기 의무 기준까지 단순경비율 적용 가능. */
  simpleLimit: number
  desc: string
}

export const INDUSTRIES: IndustryPreset[] = [
  // 글·번역·강의 (인적용역, 한도 7,500만)
  { id: 'writer',      code: '940100', name: '작가·저술가', category: '글·번역·강의',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '소설·시·에세이·시나리오 등' },
  { id: 'translator',  code: '940912', name: '번역·통역',   category: '글·번역·강의',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '문서 번역, 동시통역 등' },
  { id: 'lecturer',    code: '940903', name: '학원 강사',   category: '글·번역·강의',
    simpleRate: 60.0, baseRate: 17.6, simpleLimit: 36_000_000, desc: '학원·과외 강의' },
  { id: 'tutor',       code: '940903', name: '과외 교습',   category: '글·번역·강의',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '개인 과외 (방문·온라인)' },
  { id: 'speaker',     code: '940906', name: '특강·강연',   category: '글·번역·강의',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '기업·기관 강연료' },

  // 디자인·콘텐츠
  { id: 'designer',    code: '940909', name: '디자이너',     category: '디자인·콘텐츠',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '그래픽·UI·웹 디자인' },
  { id: 'illustrator', code: '940909', name: '일러스트레이터', category: '디자인·콘텐츠',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '삽화·캐릭터·만화' },
  { id: 'photographer',code: '940915', name: '사진작가',     category: '디자인·콘텐츠',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '스튜디오·웨딩·상업 촬영' },
  { id: 'youtuber',    code: '940306', name: '유튜버·BJ',    category: '디자인·콘텐츠',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '1인 미디어 콘텐츠 창작자' },
  { id: 'videographer',code: '940915', name: '영상 편집·제작', category: '디자인·콘텐츠',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '영상 편집·모션그래픽' },
  { id: 'musician',    code: '940904', name: '음악가·작곡가', category: '디자인·콘텐츠',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '작곡·연주·세션' },
  { id: 'voiceactor',  code: '940904', name: '성우·내레이터', category: '디자인·콘텐츠',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '더빙·내레이션' },

  // IT·기술
  { id: 'developer',   code: '940909', name: 'IT 개발자',    category: 'IT·기술',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '웹·앱·서버 개발 (인적용역)' },
  { id: 'datascientist',code: '940909', name: '데이터 분석가', category: 'IT·기술',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '데이터 분석·머신러닝' },
  { id: 'planner',     code: '940909', name: '기획·컨설팅',  category: 'IT·기술',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: 'PM·PO·전략 컨설팅' },
  { id: 'translator-tech', code: '940912', name: '기술번역', category: 'IT·기술',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '특허·매뉴얼·논문' },

  // 미용·서비스
  { id: 'beauty',      code: '940905', name: '미용·메이크업', category: '미용·서비스',
    simpleRate: 62.0, baseRate: 17.0, simpleLimit: 36_000_000, desc: '헤어·메이크업·네일' },
  { id: 'massage',     code: '940905', name: '마사지·테라피', category: '미용·서비스',
    simpleRate: 62.0, baseRate: 17.0, simpleLimit: 36_000_000, desc: '스파·테라피' },
  { id: 'fitness',     code: '940305', name: '피트니스 트레이너', category: '미용·서비스',
    simpleRate: 60.0, baseRate: 17.6, simpleLimit: 36_000_000, desc: 'PT·요가·필라테스 강사' },
  { id: 'dance',       code: '940904', name: '댄서·안무가',  category: '미용·서비스',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '댄스·안무 강사' },
  { id: 'event',       code: '940906', name: '행사 진행·MC', category: '미용·서비스',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: 'MC·이벤트 호스트' },
  { id: 'model',       code: '940300', name: '모델·연기자',  category: '미용·서비스',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '광고·런웨이·연기' },

  // 판매·중개
  { id: 'realestate',  code: '702002', name: '부동산 중개',  category: '판매·중개',
    simpleRate: 50.5, baseRate: 18.4, simpleLimit: 24_000_000, desc: '공인중개사 (사업소득)' },
  { id: 'salesagent',  code: '940908', name: '보험·금융 모집인', category: '판매·중개',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '보험·신용카드 모집' },
  { id: 'shopowner',   code: '521000', name: '소매 사업자',  category: '판매·중개',
    simpleRate: 86.0, baseRate: 5.5,  simpleLimit: 60_000_000, desc: '온·오프라인 소매' },
  { id: 'restaurant',  code: '552201', name: '음식점업',     category: '판매·중개',
    simpleRate: 89.0, baseRate: 6.7,  simpleLimit: 36_000_000, desc: '식당·카페' },

  // 기타
  { id: 'researcher',  code: '940906', name: '연구원·자문',  category: '기타',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '연구용역·자문료' },
  { id: 'cleaning',    code: '940911', name: '청소·가사',    category: '기타',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '청소 서비스·가사도우미' },
  { id: 'caregiver',   code: '940911', name: '요양·간병',    category: '기타',
    simpleRate: 75.0, baseRate: 24.6, simpleLimit: 36_000_000, desc: '돌봄·요양 서비스' },
  { id: 'rider',       code: '940918', name: '배달 라이더',  category: '기타',
    simpleRate: 79.4, baseRate: 27.4, simpleLimit: 36_000_000, desc: '배달 플랫폼 (쿠팡·배민·요기요)' },
  { id: 'driver',      code: '940917', name: '대리·택시',    category: '기타',
    simpleRate: 79.4, baseRate: 27.4, simpleLimit: 36_000_000, desc: '대리운전·법인택시 등' },
  { id: 'other',       code: '940909', name: '기타 인적용역', category: '기타',
    simpleRate: 64.1, baseRate: 19.5, simpleLimit: 36_000_000, desc: '위에 없는 프리랜서' },
]

/** 복식부기 의무 매출 한도 (2026년 기준) */
export const COMPLEX_BOOK_THRESHOLD = {
  '글·번역·강의':    75_000_000,
  '디자인·콘텐츠':    75_000_000,
  'IT·기술':          75_000_000,
  '미용·서비스':      75_000_000,
  '판매·중개':        150_000_000,
  '기타':             75_000_000,
} as const

/* ─── 결과 타입 ─── */
export interface CalcInputs {
  revenue: number          // 연 총 매출 (원)
  industryId: string       // 업종 ID
  expenseMode: 'simple' | 'book'
  bookExpenses: number     // 장부 모드 시 실경비 (원)
  isNewBusiness: boolean   // 개업 첫해(신규사업자) — 단순경비율 한도 = 복식부기 의무 기준

  // 종합소득공제
  spouseExempt: boolean    // 배우자 공제 (연 100만 이하 소득)
  dependents: number       // 부양가족 수 (배우자 외)
  pensionPaid: number      // 국민연금 납부액 (원)
  healthPaid: number       // 건강보험 납부액 (원)
  yellowUmbrella: number   // 노란우산 납입 (원)
  pensionSavings: number   // 연금저축 납입 (원)
  donations: number        // 기부금 (원)
  useStandard: boolean     // 표준세액공제 7만원 적용

  // 옵션
  prevYearWithholding: number // 원천징수 (직접 입력 시)
  withholdingMode: 'auto' | 'manual'
}

export interface CalcResult {
  revenue: number
  industryName: string

  // 경비
  expenseAmount: number
  expenseRate: number          // 적용된 경비율 %
  canUseSimple: boolean
  appliedSimpleLimit: number   // 실제 적용된 단순경비율 한도 (계속/신규 반영, 원)
  isComplexBookRequired: boolean

  // 소득 흐름
  businessIncome: number       // 사업소득금액 = 매출 - 경비
  totalDeduction: number       // 종합소득공제 합계
  taxableBase: number          // 과세표준
  computedTax: number          // 산출세액

  // 세액공제
  taxCredit: number            // 세액공제 합계 (연금저축·기부금·표준)
  finalTax: number             // 결정세액

  // 원천징수·환급
  withholding: number          // 원천징수액 (3.3% 또는 직접 입력)
  localTax: number             // 지방소득세 (결정세액 × 10%)
  totalTax: number             // 결정세액 + 지방소득세
  refund: number               // 환급액 (양수) 또는 추가납부 (음수)

  // 메트릭
  effectiveRate: number        // 실효세율 % = totalTax / revenue
  marginalRate: number         // 한계세율 %
  appliedBracket: TaxBracket
}

/* ─── 누진세율 적용 ─── */
export function applyProgressiveTax(taxableBase: number): { tax: number; bracket: TaxBracket } {
  if (taxableBase <= 0) return { tax: 0, bracket: PROGRESSIVE_BRACKETS[0] }
  const bracket = PROGRESSIVE_BRACKETS.find((b) => taxableBase > b.min && taxableBase <= b.max) ?? PROGRESSIVE_BRACKETS[0]
  const tax = Math.max(0, taxableBase * bracket.rate - bracket.deduction)
  return { tax, bracket }
}

/* ─── 공제 합계 ─── */
export function computeDeductions(inputs: CalcInputs, businessIncome: number): { total: number; details: { label: string; amount: number }[] } {
  const details: { label: string; amount: number }[] = []
  // 인적공제 (본인 150 + 배우자 150 + 부양가족 150씩)
  const personal = 1_500_000
  details.push({ label: '본인 인적공제', amount: personal })
  if (inputs.spouseExempt) details.push({ label: '배우자 공제', amount: 1_500_000 })
  if (inputs.dependents > 0) details.push({ label: `부양가족 ${inputs.dependents}명`, amount: 1_500_000 * inputs.dependents })

  // 사회보험료 (전액 공제)
  if (inputs.pensionPaid > 0) details.push({ label: '국민연금', amount: inputs.pensionPaid })
  if (inputs.healthPaid > 0)  details.push({ label: '건강보험·장기요양', amount: inputs.healthPaid })

  // 노란우산공제 — 사업소득금액 따라 한도 차등 (4천↓ 500만 / 4천~1억 300만 / 1억↑ 200만)
  if (inputs.yellowUmbrella > 0) {
    const cappedYellow = Math.min(inputs.yellowUmbrella, yellowUmbrellaLimit(businessIncome))
    details.push({ label: '노란우산공제', amount: cappedYellow })
  }

  return { total: details.reduce((s, x) => s + x.amount, 0), details }
}

/** 노란우산 소득공제 한도 (사업소득금액 기준, 2025 상향) */
export function yellowUmbrellaLimit(businessIncome: number): number {
  if (businessIncome <= 40_000_000) return 6_000_000   // 4천만 이하 (500→600)
  if (businessIncome <= 100_000_000) return 4_000_000  // 4천만~1억 (300→400)
  return 2_000_000                                      // 1억 초과 (유지)
}

/* ─── 세액공제 ─── */
/** 연금저축 세액공제 — 국세(소득세)분만 반환 (한도 600만, 종합소득금액 4,500만 이하 15%, 초과 12%).
 *  지방소득세 10%는 결정세액에서 자동 차감되어 총 16.5% / 13.2% 효과. */
export function pensionSavingsCredit(amount: number, businessIncome: number): number {
  const eligible = Math.min(6_000_000, Math.max(0, amount))
  const rate = businessIncome <= 45_000_000 ? 0.15 : 0.12
  return Math.floor(eligible * rate)
}

/** 기부금 세액공제 (1천만 이하 15%, 초과 30% — 단순화) */
export function donationCredit(donations: number): number {
  if (donations <= 0) return 0
  if (donations <= 10_000_000) return Math.floor(donations * 0.15)
  return Math.floor(10_000_000 * 0.15 + (donations - 10_000_000) * 0.30)
}

/* ─── 메인 계산 ─── */
export function calculate(inputs: CalcInputs): CalcResult {
  const industry = INDUSTRIES.find((i) => i.id === inputs.industryId) ?? INDUSTRIES[INDUSTRIES.length - 1]

  // 단순경비율 적용 가능 여부
  //  - 계속사업자: 직전연도 수입 기준 (본 도구는 입력 매출을 직전연도로 간주)
  //  - 신규사업자(개업 첫해): 당해 수입이 복식부기 의무 기준 미만이면 단순경비율 가능
  const complexLimit = COMPLEX_BOOK_THRESHOLD[industry.category] ?? 75_000_000
  const appliedSimpleLimit = inputs.isNewBusiness ? complexLimit : industry.simpleLimit
  const canUseSimple = inputs.revenue <= appliedSimpleLimit
  const isComplexBookRequired = inputs.revenue > complexLimit

  // 경비
  let expenseAmount: number
  let expenseRate: number
  if (inputs.expenseMode === 'simple') {
    if (canUseSimple) {
      expenseRate = industry.simpleRate
      expenseAmount = Math.floor(inputs.revenue * (expenseRate / 100))
    } else {
      /* 단순경비율 한도 초과 → 기준경비율 추계 (무증빙 보수적 기준)
         추계 소득금액 = min( 매출 − 매출×기준경비율,  단순경비율 소득금액 × 배율 )
         배율: 복식부기 의무자 3.4 / 간편장부 대상자 2.8
         ※ 주요경비(매입·임차·인건비) 증빙은 본 도구 미반영 */
      const baseMethodIncome = inputs.revenue * (1 - industry.baseRate / 100)
      const simpleMethodIncome = inputs.revenue * (1 - industry.simpleRate / 100)
      const multiplier = isComplexBookRequired ? 3.4 : 2.8
      const estimatedIncome = Math.min(baseMethodIncome, simpleMethodIncome * multiplier)
      expenseAmount = Math.floor(Math.max(0, inputs.revenue - estimatedIncome))
      expenseRate = inputs.revenue > 0 ? (expenseAmount / inputs.revenue) * 100 : 0
    }
  } else {
    expenseAmount = Math.min(inputs.revenue, Math.max(0, inputs.bookExpenses))
    expenseRate = inputs.revenue > 0 ? (expenseAmount / inputs.revenue) * 100 : 0
  }

  // 사업소득금액
  const businessIncome = Math.max(0, inputs.revenue - expenseAmount)

  // 종합소득공제
  const { total: totalDeduction } = computeDeductions(inputs, businessIncome)

  // 과세표준
  const taxableBase = Math.max(0, businessIncome - totalDeduction)

  // 산출세액
  const { tax: computedTax, bracket } = applyProgressiveTax(taxableBase)

  // 세액공제
  let taxCredit = 0
  // 연금저축
  if (inputs.pensionSavings > 0) {
    taxCredit += pensionSavingsCredit(inputs.pensionSavings, businessIncome)
  }
  // 기부금
  if (inputs.donations > 0) {
    taxCredit += donationCredit(inputs.donations)
  }
  // 표준세액공제 (다른 공제 없을 때 7만원 — 단순화: 항상 적용 옵션)
  if (inputs.useStandard) {
    taxCredit += 70_000
  }

  // 결정세액
  const finalTax = Math.max(0, computedTax - taxCredit)

  // 원천징수
  const withholding = inputs.withholdingMode === 'manual'
    ? Math.max(0, inputs.prevYearWithholding)
    : Math.floor(inputs.revenue * 0.03)  // 3% (소득세분 - 지방세는 별도 처리 흐름)

  // 지방소득세 (결정세액의 10%)
  const localTax = Math.floor(finalTax * 0.1)

  // 원천징수에는 보통 3.3% (소득세 3% + 지방세 0.3%) 모두 포함되어 있으므로
  // 종합 비교를 위해 [국세분 환급 + 지방세분 환급] 합산
  // 단순화: 매출 × 3.3% 전체를 미리 낸 세금으로 보고, 결정세액 + 지방세와 비교
  const fullWithholding = inputs.withholdingMode === 'manual'
    ? Math.max(0, inputs.prevYearWithholding)
    : Math.floor(inputs.revenue * 0.033)
  const totalTax = finalTax + localTax
  const refund = fullWithholding - totalTax  // 양수 = 환급, 음수 = 추가납부

  // 메트릭
  const effectiveRate = inputs.revenue > 0 ? (totalTax / inputs.revenue) * 100 : 0
  // 한계세율: 다음 100만원 추가 시 부담 세율
  const nextMargin = applyProgressiveTax(taxableBase + 1_000_000).tax - computedTax
  const marginalRate = nextMargin / 1_000_000 * 100 * 1.1  // 지방세 포함

  return {
    revenue: inputs.revenue,
    industryName: industry.name,
    expenseAmount,
    expenseRate: Math.round(expenseRate * 10) / 10,
    canUseSimple,
    appliedSimpleLimit,
    isComplexBookRequired,
    businessIncome,
    totalDeduction,
    taxableBase,
    computedTax: Math.floor(computedTax),
    taxCredit: Math.floor(taxCredit),
    finalTax: Math.floor(finalTax),
    withholding,
    localTax,
    totalTax: Math.floor(totalTax),
    refund: Math.floor(refund),
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    marginalRate: Math.round(marginalRate * 100) / 100,
    appliedBracket: bracket,
  }
}

/* ─── 시나리오 비교용 ─── */
export type ScenarioKey = 'current' | 'yellow' | 'pension' | 'both' | 'book70'

export interface Scenario {
  key: ScenarioKey
  label: string
  desc: string
  inputs: CalcInputs
  result: CalcResult
}

export function buildScenarios(base: CalcInputs): Scenario[] {
  const monthlyYellow = 200_000
  const monthlyPension = 500_000
  const annualYellow = monthlyYellow * 12   // 240만 (한도 내)
  const annualPension = Math.min(6_000_000, monthlyPension * 12)

  const current  = { ...base }
  const yellow   = { ...base, yellowUmbrella: Math.min(yellowUmbrellaLimit(base.revenue - (base.revenue * 0.641)), Math.max(base.yellowUmbrella, annualYellow)) }
  const pension  = { ...base, pensionSavings: Math.max(base.pensionSavings, annualPension) }
  const both     = { ...yellow, pensionSavings: Math.max(base.pensionSavings, annualPension) }
  const book70: CalcInputs = {
    ...base,
    expenseMode: 'book',
    bookExpenses: Math.floor(base.revenue * 0.7),
  }

  return [
    { key: 'current', label: '현재 입력 그대로',          desc: '입력값 기준',                 inputs: current, result: calculate(current) },
    { key: 'yellow',  label: '+ 노란우산 (월 20만)',       desc: '연 240만원 추가 공제',       inputs: yellow,  result: calculate(yellow) },
    { key: 'pension', label: '+ 연금저축 (월 50만)',       desc: '연 600만 한도 → 세액공제',  inputs: pension, result: calculate(pension) },
    { key: 'both',    label: '+ 노란우산 & 연금저축',       desc: '두 가지 동시 가입',          inputs: both,    result: calculate(both) },
    { key: 'book70',  label: '장부 작성 (실경비 70%)',      desc: '실경비 ≈ 매출의 70%',        inputs: book70,  result: calculate(book70) },
  ]
}

/* ─── 절세 시뮬: 슬라이더 단일 변경 결과 ─── */
export function simulateDeduction(base: CalcInputs, override: Partial<CalcInputs>): CalcResult {
  return calculate({ ...base, ...override })
}

/* ─── 추천 절세 조합 ─── */
export interface SavingTip {
  emoji: string
  title: string
  desc: string
  estimatedSaving: number
}

export function recommendSavings(result: CalcResult, base: CalcInputs): SavingTip[] {
  const tips: SavingTip[] = []
  const rate = result.appliedBracket.rate

  // 노란우산
  if (base.yellowUmbrella < 1_000_000) {
    const limit = yellowUmbrellaLimit(result.businessIncome)
    const recommended = Math.min(2_400_000, limit)
    const saving = Math.floor(recommended * rate * 1.1)
    tips.push({
      emoji: '☂️',
      title: '노란우산공제 가입',
      desc: `소기업·소상공인 노후 대비 + 연 ${(recommended/10000).toFixed(0)}만원 소득공제 (한도 ${(limit/10000).toFixed(0)}만)`,
      estimatedSaving: saving,
    })
  }

  // 연금저축 (국세 세액공제 × 1.1 = 지방세 포함 총 절세)
  if (base.pensionSavings < 6_000_000) {
    const additional = 6_000_000 - base.pensionSavings
    const credit = pensionSavingsCredit(additional, result.businessIncome)
    const totalSaving = Math.floor(credit * 1.1)
    if (totalSaving > 100_000) {
      tips.push({
        emoji: '💰',
        title: '연금저축 추가 납입',
        desc: `한도 600만원까지 ${(result.businessIncome <= 45_000_000 ? '16.5%' : '13.2%')} 세액공제 (소득공제와 별개)`,
        estimatedSaving: totalSaving,
      })
    }
  }

  // 장부 작성 권유 (단순경비율인데 매출 큰 경우)
  if (base.expenseMode === 'simple' && result.canUseSimple === false) {
    tips.push({
      emoji: '📒',
      title: '장부 작성 검토',
      desc: '단순경비율 한도 초과 → 실제 경비가 더 큰 경우 장부 작성이 절세 유리. 복식부기 의무 대상 여부 확인.',
      estimatedSaving: 0,
    })
  }

  // 부양가족 누락
  if (base.dependents === 0 && !base.spouseExempt && result.taxableBase > 30_000_000) {
    tips.push({
      emoji: '👨‍👩‍👦',
      title: '인적공제 누락 점검',
      desc: '배우자(연 100만 이하 소득)·부모(만 60세+)·자녀 등록 시 1명당 150만 공제',
      estimatedSaving: Math.floor(1_500_000 * rate * 1.1),
    })
  }

  // 한계세율 높은 경우
  if (rate >= 0.35) {
    tips.push({
      emoji: '💼',
      title: '세무사 상담 권장',
      desc: `한계세율 ${(rate*100).toFixed(0)}% — 종합과세 + 사업자등록 + 가족 명의 분산 등 복합 절세 전략 필요`,
      estimatedSaving: 0,
    })
  }

  return tips.sort((a, b) => b.estimatedSaving - a.estimatedSaving)
}

/* ─── 포맷터 ─── */
export const fmtKRW = (n: number): string => {
  if (n === 0) return '0원'
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(2)}억원`
  if (abs >= 10_000) return `${sign}${(abs / 10_000).toFixed(0)}만원`
  return `${sign}${abs.toLocaleString()}원`
}

export const fmtKRWPrecise = (n: number): string => {
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(n)
  return `${sign}${abs.toLocaleString()}원`
}
