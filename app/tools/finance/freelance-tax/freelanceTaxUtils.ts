/* ──────────────────────────────────────────────────────
   freelance-tax/freelanceTaxUtils.ts
   2026년 프리랜서 종합소득세 계산
   ────────────────────────────────────────────────────── */

import { BRACKETS_2026 } from '@/lib/krIncomeTax'
import {
  EXPENSE_RATES, SIMPLE_EXCESS_THRESHOLD, HUMAN_SERVICE_SIMPLE_LIMIT, HUMAN_SERVICE_BOOK_THRESHOLD,
  simpleExcessRate, type ExpenseRate,
} from '@/lib/krExpenseRates'

/* ─── 종합소득세 누진세율 (2026년 기준) — lib/krIncomeTax에서 파생 ─── */
export interface TaxBracket {
  min: number      // 과세표준 하한 (원, 미만)
  max: number      // 과세표준 상한 (원, 이하)
  rate: number     // 세율 (소수)
  deduction: number // 누진공제액 (원)
  label: string
}

const BRACKET_LABELS = [
  '~ 1,400만', '~ 5,000만', '~ 8,800만', '~ 1.5억',
  '~ 3억', '~ 5억', '~ 10억', '10억 초과',
]

export const PROGRESSIVE_BRACKETS: TaxBracket[] = BRACKETS_2026.map((b, i) => ({
  min: i === 0 ? 0 : BRACKETS_2026[i - 1].upTo,
  max: b.upTo,
  rate: b.rate,
  deduction: b.deduction,
  label: BRACKET_LABELS[i],
}))

/* ─── 업종별 경비율 (국세청 「귀속 경비율 고시」) — 단일 소스 lib/krExpenseRates.ts ───
   귀속연도별 단순·기준경비율 표, 초과율 산식(4,000만원 초과분), 인적용역 기준금액(3,600만·7,500만)은 lib에서 관리.
   매년 3월 새 귀속연도 고시가 나오므로 신고 전 홈택스 조회값을 우선한다. 같은 코드에는 반드시 같은 율이 붙도록
   업종 프리셋(INDUSTRIES)은 코드만 들고 율은 lib 표(EXPENSE_RATES)에서 조회한다. */
export { EXPENSE_RATES, SIMPLE_EXCESS_THRESHOLD, simpleExcessRate }
export type { ExpenseRate }

/* ─── 업종 프리셋 (표시용 직군 → 국세청 업종코드) ─── */
export interface IndustryPreset {
  id: string
  code: string         // 업종코드 — 경비율은 EXPENSE_RATES[code]
  name: string         // 표시명
  category: '글·번역·강의' | '디자인·콘텐츠' | 'IT·기술' | '운송·영업' | '기타'
  simpleRate: number   // 단순경비율 % (EXPENSE_RATES에서 파생)
  baseRate: number     // 기준경비율 % (EXPENSE_RATES에서 파생)
  /** 단순경비율 적용 한도 — 계속사업자 기준(직전년도 수입, 원). 인적용역 3,600만. */
  simpleLimit: number
  /** 복식부기 의무 기준 (원) — 소득세법 시행령 §208⑤. 인적용역·서비스업 7,500만 */
  bookThreshold: number
  /** 연말정산 대상 사업소득(보험설계사 등, 간편장부대상자) — 기부금 세액공제 가능 (소득세법 §59의4④·§73①4호) */
  yearEndSettlement?: boolean
  desc: string
}

function preset(
  id: string, code: string, name: string, category: IndustryPreset['category'], desc: string,
  extra: Partial<Pick<IndustryPreset, 'yearEndSettlement'>> = {},
): IndustryPreset {
  const r = EXPENSE_RATES[code]
  return {
    id, code, name, category, desc,
    simpleRate: r.simpleRate, baseRate: r.baseRate,
    simpleLimit: HUMAN_SERVICE_SIMPLE_LIMIT,
    bookThreshold: HUMAN_SERVICE_BOOK_THRESHOLD,
    ...extra,
  }
}

export const INDUSTRIES: IndustryPreset[] = [
  // 글·번역·강의
  preset('writer',      '940100', '작가·저술가',     '글·번역·강의', '소설·웹소설·방송작가·에세이 등'),
  preset('translator',  '940100', '번역가',          '글·번역·강의', '학술·문예 번역 (저술가 코드)'),
  preset('lecturer',    '940903', '학원 강사',       '글·번역·강의', '학원·교육기관 강의'),
  preset('tutor',       '940903', '과외 교습',       '글·번역·강의', '개인 과외 (방문·온라인)'),
  preset('speaker',     '940903', '강사·특강',       '글·번역·강의', '기업·기관 강의료 (강사 코드)'),

  // 디자인·콘텐츠
  preset('youtuber',    '940306', '유튜버·BJ·스트리머', '디자인·콘텐츠', '1인 미디어 콘텐츠 창작자'),
  preset('designer',    '940909', '디자이너',        '디자인·콘텐츠', '그래픽·UI·웹 디자인 (전용 코드 없으면 기타자영업)'),
  preset('illustrator', '940909', '일러스트레이터',  '디자인·콘텐츠', '삽화·캐릭터 (전용 코드 없으면 기타자영업)'),
  preset('videographer','940909', '영상 편집·제작',  '디자인·콘텐츠', '영상 편집·모션그래픽 (전용 코드 없으면 기타자영업)'),

  // IT·기술
  preset('developer',   '940926', 'IT 개발자',       'IT·기술', '웹·앱·서버 개발 (소프트웨어 프리랜서)'),
  preset('datascientist','940909','데이터 분석가',   'IT·기술', '데이터 분석·머신러닝 (전용 코드 없으면 기타자영업)'),
  preset('planner',     '940909', '기획·컨설팅',     'IT·기술', 'PM·PO·전략 컨설팅 (전용 코드 없으면 기타자영업)'),

  // 운송·영업
  preset('rider',       '940918', '배달 라이더',     '운송·영업', '배달 플랫폼 (퀵서비스배달원 코드)'),
  preset('driver',      '940913', '대리운전 기사',   '운송·영업', '대리운전 플랫폼·업체'),
  preset('salesagent',  '940906', '보험설계사',      '운송·영업', '보험 모집 (연말정산 사업소득)', { yearEndSettlement: true }),

  // 기타
  preset('other',       '940909', '기타 인적용역',   '기타', '위에 없는 프리랜서 (기타자영업)'),
]

export const DEFAULT_INDUSTRY_ID = 'other'
export const getIndustry = (id: string): IndustryPreset =>
  INDUSTRIES.find((i) => i.id === id) ?? INDUSTRIES.find((i) => i.id === DEFAULT_INDUSTRY_ID)!

/** 실제 적용할 경비율 — 사용자가 홈택스 조회값을 두 칸 모두(0 초과) 입력했을 때만 그 값을 우선.
 *  한 칸이라도 비어 있으면(0) 업종 프리셋 사용 — 빈 기준경비율이 0%로 계산돼 경비 0원이 되는 것 방지 */
export function effectiveRates(inputs: Pick<CalcInputs, 'industryId' | 'customRates' | 'customSimpleRate' | 'customBaseRate'>): {
  simpleRate: number; baseRate: number; excessRate: number; custom: boolean
} {
  const ind = getIndustry(inputs.industryId)
  const custom = inputs.customRates
    && Number.isFinite(inputs.customSimpleRate) && inputs.customSimpleRate > 0 && inputs.customSimpleRate < 100
    && Number.isFinite(inputs.customBaseRate) && inputs.customBaseRate > 0 && inputs.customBaseRate < 100
  const simpleRate = custom ? inputs.customSimpleRate : ind.simpleRate
  const baseRate = custom ? inputs.customBaseRate : ind.baseRate
  return { simpleRate, baseRate, excessRate: simpleExcessRate(simpleRate), custom: !!custom }
}

/** 율(%) × 금액 — 0.1%p 단위 정수 연산으로 부동소수 1원 오차 방지 */
function mulRate(amount: number, ratePct: number): number {
  return Math.floor((amount * Math.round(ratePct * 10)) / 1000)
}

/** 단순경비율 필요경비 — 4,000만원까지 일반율, 초과분 초과율 */
export function simpleExpense(revenue: number, simpleRate: number): number {
  const r = Math.max(0, revenue)
  const head = Math.min(r, SIMPLE_EXCESS_THRESHOLD)
  const tail = r - head
  return mulRate(head, simpleRate) + mulRate(tail, simpleExcessRate(simpleRate))
}

/* ─── 결과 타입 ─── */
export interface CalcInputs {
  revenue: number          // 연 총 매출 (원)
  industryId: string       // 업종 ID
  expenseMode: 'simple' | 'book'
  bookExpenses: number     // 장부 모드 시 실경비 (원)
  isNewBusiness: boolean   // 개업 첫해(신규사업자) — 단순경비율 한도 = 복식부기 의무 기준
  customRates: boolean     // 홈택스에서 조회한 본인 업종 경비율 직접 입력
  customSimpleRate: number // 직접 입력 단순경비율 %
  customBaseRate: number   // 직접 입력 기준경비율 %

  // 종합소득공제
  spouseExempt: boolean    // 배우자 공제 (연 100만 이하 소득)
  dependents: number       // 부양가족 수 (배우자 외)
  pensionPaid: number      // 국민연금 납부액 (원) — 연금보험료공제 (소득세법 §51의3)
  // 지역 건강보험료는 사업소득자 소득공제 대상이 아님(§52 특별소득공제는 근로소득자 전용) — 장부 신고 시 필요경비로만 반영
  yellowUmbrella: number   // 노란우산 납입 (원)
  pensionSavings: number   // 연금저축 납입 (원)
  donations: number        // 기부금 (원) — 연말정산 사업소득자(보험설계사 등)만 세액공제
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
  bookThreshold: number        // 복식부기 의무 기준 (원)
  donationEligible: boolean    // 기부금 세액공제 가능 여부

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

  // 연금보험료공제 — 국민연금 본인 납부액 전액 (§51의3). 건강보험료는 사업소득자 소득공제 불가
  if (inputs.pensionPaid > 0) details.push({ label: '국민연금', amount: inputs.pensionPaid })

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
  const industry = getIndustry(inputs.industryId)
  const rates = effectiveRates(inputs)

  // 단순경비율 적용 가능 여부
  //  - 계속사업자: 직전연도 수입 기준 (본 도구는 입력 매출을 직전연도로 간주)
  //  - 신규사업자(개업 첫해): 당해 수입이 복식부기 의무 기준 미만이면 단순경비율 가능
  const complexLimit = industry.bookThreshold
  const appliedSimpleLimit = inputs.isNewBusiness ? complexLimit : industry.simpleLimit
  const canUseSimple = inputs.revenue <= appliedSimpleLimit
  const isComplexBookRequired = inputs.revenue > complexLimit

  // 경비
  let expenseAmount: number
  let expenseRate: number
  if (inputs.expenseMode === 'simple') {
    if (canUseSimple) {
      // 인적용역: 4,000만원까지 일반율, 초과분은 초과율 (신규사업자 4천~7,500만 구간)
      expenseAmount = simpleExpense(inputs.revenue, rates.simpleRate)
      expenseRate = inputs.revenue > 0 ? (expenseAmount / inputs.revenue) * 100 : rates.simpleRate
    } else {
      /* 단순경비율 한도 초과 → 기준경비율 추계 (무증빙 보수적 기준)
         추계 소득금액 = min( 매출 − 매출×기준경비율,  단순경비율 소득금액 × 배율 )
         배율: 복식부기 의무자 3.4 / 간편장부 대상자 2.8
         ※ 주요경비(매입·임차·인건비) 증빙은 본 도구 미반영 */
      const baseMethodIncome = inputs.revenue - mulRate(inputs.revenue, rates.baseRate)
      const simpleMethodIncome = inputs.revenue - mulRate(inputs.revenue, rates.simpleRate)
      const multiplier = isComplexBookRequired ? 3.4 : 2.8
      const estimatedIncome = Math.min(baseMethodIncome, Math.round(simpleMethodIncome * multiplier))
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
  // 기부금 — 사업소득만 있는 자는 세액공제 불가(§59의4④). 연말정산 대상 사업소득자(보험설계사 등 간편장부대상자)만 허용
  const donationEligible = !!industry.yearEndSettlement && !isComplexBookRequired
  if (donationEligible && inputs.donations > 0) {
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
    bookThreshold: complexLimit,
    donationEligible,
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
  // 노란우산 한도는 실제 사업소득금액 기준 (업종 경비율 반영 — 64.1% 고정 가정 X)
  const baseIncome = calculate(base).businessIncome
  const yellow   = { ...base, yellowUmbrella: Math.min(yellowUmbrellaLimit(baseIncome), Math.max(base.yellowUmbrella, annualYellow)) }
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
