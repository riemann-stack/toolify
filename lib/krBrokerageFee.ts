/* ──────────────────────────────────────────────────────
   lib/krBrokerageFee.ts
   부동산 중개보수(복비) 상한 — 단일 소스 (2026-09 기준 현행)
   사용처: finance/brokerage-fee (전체) · finance/real-estate (매매 중개보수 자동 계산)
   기준일: 2026-09 · 출처: 국가법령정보센터 공인중개사법·같은 법 시행령·시행규칙, 서울특별시 주택 중개보수 등에 관한 조례,
           국토교통부 부동산거래 전자계약시스템 중개보수 요율표, 법제처 법령해석
   ──────────────────────────────────────────────────────

   [법적 구조]
   · 공인중개사법 §32④ — 주택 중개보수는 국토교통부령이 정하는 범위에서 시·도 조례로, 주택 외는 국토교통부령으로 정한다.
   · 시행규칙 §20① — 주택: 중개의뢰인 쌍방으로부터 '각각' 받되 일방 한도는 [별표 1], 그 금액은 시·도 조례가 정하는
     요율한도 이내에서 협의해 결정. 2021-10-19 시행 개정으로 별표 1이 상한요율·한도액을 직접 정한다
     (입법예고안의 '시·도 조례 ±0.1%p 가감' 조항은 최종안에서 삭제 — 서울·경기 등 시·도 조례 별표도 같은 표).
   · 시행규칙 §20③ — 중개대상물 소재지와 중개사무소 소재지가 다르면 '중개사무소 소재지' 시·도 조례 기준.
   · 시행규칙 §20④1호 — 주거용 오피스텔(건축법 시행령 별표 1 제14호나목2 오피스텔 중 ① 전용면적 85㎡ 이하,
     ② 상·하수도 시설이 갖추어진 전용입식 부엌, 전용수세식 화장실 및 목욕시설을 모두 갖춘 경우): [별표 2]
     매매·교환 0.5%, 임대차 등 0.4% (별표 2 요율은 2015-01-06 시행 그대로). 2026-08-28 시행 개정
     (국토교통부령 제1611호, 2026-08-11 공포)은 §20④1호 본문만 바꿔 '별표 2의 상한요율 이내에서 … 서로 협의하여'
     결정한다는 문구를 명시했다 (별표 2·요율 불변).
   · 시행규칙 §20④2호 — 그 밖의 중개대상물(비주거 오피스텔·상가·토지·공장 등): 거래금액의 1천분의 9 이내 협의.
   · 시행규칙 §20⑤ — 거래금액 계산
       1호 보증금 외에 차임이 있으면 보증금 + 월 차임 × 100. 그 합이 5천만원 미만이면 보증금 + 월 차임 × 70
       2호 교환: 교환대상 중 거래금액이 큰 쪽의 가액
       3호 동일 물건·동일 당사자·동일 기회에 매매를 포함한 둘 이상의 거래: 매매 거래금액만
   · 시행규칙 §20⑥ — 건축물 중 주택 면적이 1/2 이상이면 주택(①), 1/2 미만이면 주택 외(④) 기준.
   · 시행령 §27의2 — 지급시기: 약정에 따르되 약정이 없으면 거래대금 지급이 완료된 날.
   · 법 §33①3호 — 사례·증여 그 밖의 어떠한 명목으로도 보수·실비를 초과해 금품을 받는 행위 금지
     → §49①10호 1년 이하 징역 또는 1천만원 이하 벌금. 한도 초과 약정은 초과 범위에서 무효
     (대법원 2007. 12. 20. 선고 2005다32159 전원합의체 판결).

   [주택 상한요율 — 시행규칙 별표 1 (2021-10-19 시행, 2026-09 현행)]
      매매·교환                         임대차 등
      5천만원 미만      0.6% (한도 25만)   5천만원 미만      0.5% (한도 20만)
      5천만~2억원 미만  0.5% (한도 80만)   5천만~1억원 미만  0.4% (한도 30만)
      2억~9억원 미만    0.4%              1억~6억원 미만    0.3%
      9억~12억원 미만   0.5%              6억~12억원 미만   0.4%
      12억~15억원 미만  0.6%              12억~15억원 미만  0.5%
      15억원 이상       0.7%              15억원 이상       0.6%
   [직전 요율표 — 서울특별시 조례 2015-04-14 시행 ~ 2021-10-18 (시·도마다 시행일 다름, 비교용)]
      매매·교환: 5천 미만 0.6%(25만) · 5천~2억 0.5%(80만) · 2~6억 0.4% · 6~9억 0.5% · 9억 이상 0.9% 이내 협의
      임대차 등: 5천 미만 0.5%(20만) · 5천~1억 0.4%(30만) · 1~3억 0.3% · 3~6억 0.4% · 6억 이상 0.8% 이내 협의
      (2021 개정 = '6억 이상 매매·3억 이상 임대차 최고요율 인하' — 국토교통부 2021-10-19 시행 발표·언론 보도로 확인)

   [부가가치세]
   · 상한요율표 금액에는 부가가치세가 포함되지 않는다. 일반과세자 중개사무소는 10%(부가가치세법 §30)를 별도로 받을 수 있다.
   · 간이과세자: 법제처 법령해석 — 부가세를 제외한 금액이 법정 중개보수 이내면 §33①3호 위반이 아니다.
     직전 연도 공급대가 4,800만원 이상 간이과세자는 세금계산서 발급 의무가 있다(부가가치세법 §36①2호가 반대해석).
     헌재 2025. 4. 10. 2023헌마995 — 세금계산서 발급 의무 있는 간이과세자가 보수의 10%를 부가세로 받은 사건에서
     (국세청 국세상담센터가 이 경우에도 10% 세율로 발급하도록 안내한 점 등을 들어) 법정 보수 초과 수수의 고의를
     인정하기 어렵다며 기소유예처분 취소(전원 일치). 영수증만 발급하는 4,800만원 미만 간이과세자는 이 결정의 사안 밖.
     간이과세자 납부세액 = 공급대가 × 업종별 부가가치율(부동산 관련 서비스업 40%, 부가가치세법 시행령 §111②, 2021-07-01~) × 10%
     = 공급대가의 4%. 연 공급대가 4,800만원 미만이면 납부의무 면제(부가가치세법 §69①).

   [끝수] 법령에 원 미만 끝수 규정이 없다 — '이내(상한)'이므로 원 미만은 버린다(상한을 넘지 않는 방향).
          부가세도 원 미만 버림.

   [가정·한계 — 계산하지 않는 것]
   · 분양권 거래금액(기납입금 + 프리미엄), 권리금, 실비(§20②), 시·도별 조례 차이, 주택 면적 1/2 판정은 사용자 몫.
   · 교환은 큰 쪽 가액을, 매매+임대 동시 거래는 매매 금액만 입력한다는 전제.
   ────────────────────────────────────────────────────── */

/** 비율 단위: ppm (100만분율). 1% = 10,000ppm — 부동소수 오차 없이 정수 곱셈 */
export const PPM_PER_PCT = 10_000

/** 입력 상한 1조원 — 정수 연산 안전 범위 */
export const BROKERAGE_MAX_AMOUNT = 1_000_000_000_000

/** 계산기 거래 종류 — 법령상 '매매·교환'과 '임대차 등' 두 갈래이고, 임대차는 차임(월세) 유무로 거래금액 산식이 갈린다 */
export type BrokerageDeal = 'sale' | 'jeonse' | 'monthly'
/** 법령상 요율 갈래 */
export type BrokerageKind = 'sale' | 'lease'
/** 중개대상물 — 주택 / 주거용 오피스텔(§20④1호 요건 충족) / 그 밖(비주거 오피스텔·상가·토지 등) */
export type BrokerageProperty = 'house' | 'officetel' | 'other'

export const kindOfDeal = (d: BrokerageDeal): BrokerageKind => (d === 'sale' ? 'sale' : 'lease')

export interface FeeBracket {
  /** 이상 (원) */
  min: number
  /** 미만 (원) — null이면 끝 구간 */
  max: number | null
  /** 상한요율 ppm (1% = 10,000) */
  ratePpm: number
  /** 한도액 (원) — null이면 없음 */
  cap: number | null
}

export interface HouseFeeSchedule {
  /** 적용 시작일 (계약 체결일 기준, 'YYYY-MM-DD') */
  from: string
  /** 적용 종료일 (포함) — null이면 현행 */
  to: string | null
  label: string
  /** 근거 */
  basis: string
  sale: FeeBracket[]
  lease: FeeBracket[]
}

const MAN = 10_000
const EOK = 100_000_000

/** 주택 상한요율표 — 기간 키. 마지막 원소가 현행 */
export const HOUSE_FEE_SCHEDULES: readonly HouseFeeSchedule[] = [
  {
    from: '2015-04-14',
    to: '2021-10-18',
    label: '2021년 10월 개정 전 (서울 조례 2015.4.14 시행 기준)',
    basis: '서울특별시 주택 중개보수 등에 관한 조례 별표 (2015.4.14 시행) — 시·도마다 시행일 차이',
    sale: [
      { min: 0, max: 5_000 * MAN, ratePpm: 6_000, cap: 25 * MAN },
      { min: 5_000 * MAN, max: 2 * EOK, ratePpm: 5_000, cap: 80 * MAN },
      { min: 2 * EOK, max: 6 * EOK, ratePpm: 4_000, cap: null },
      { min: 6 * EOK, max: 9 * EOK, ratePpm: 5_000, cap: null },
      { min: 9 * EOK, max: null, ratePpm: 9_000, cap: null },
    ],
    lease: [
      { min: 0, max: 5_000 * MAN, ratePpm: 5_000, cap: 20 * MAN },
      { min: 5_000 * MAN, max: 1 * EOK, ratePpm: 4_000, cap: 30 * MAN },
      { min: 1 * EOK, max: 3 * EOK, ratePpm: 3_000, cap: null },
      { min: 3 * EOK, max: 6 * EOK, ratePpm: 4_000, cap: null },
      { min: 6 * EOK, max: null, ratePpm: 8_000, cap: null },
    ],
  },
  {
    from: '2021-10-19',
    to: null,
    label: '현행 (2021년 10월 19일 시행)',
    basis: '공인중개사법 시행규칙 §20① [별표 1] (2021.10.19 시행) · 시·도 조례',
    sale: [
      { min: 0, max: 5_000 * MAN, ratePpm: 6_000, cap: 25 * MAN },
      { min: 5_000 * MAN, max: 2 * EOK, ratePpm: 5_000, cap: 80 * MAN },
      { min: 2 * EOK, max: 9 * EOK, ratePpm: 4_000, cap: null },
      { min: 9 * EOK, max: 12 * EOK, ratePpm: 5_000, cap: null },
      { min: 12 * EOK, max: 15 * EOK, ratePpm: 6_000, cap: null },
      { min: 15 * EOK, max: null, ratePpm: 7_000, cap: null },
    ],
    lease: [
      { min: 0, max: 5_000 * MAN, ratePpm: 5_000, cap: 20 * MAN },
      { min: 5_000 * MAN, max: 1 * EOK, ratePpm: 4_000, cap: 30 * MAN },
      { min: 1 * EOK, max: 6 * EOK, ratePpm: 3_000, cap: null },
      { min: 6 * EOK, max: 12 * EOK, ratePpm: 4_000, cap: null },
      { min: 12 * EOK, max: 15 * EOK, ratePpm: 5_000, cap: null },
      { min: 15 * EOK, max: null, ratePpm: 6_000, cap: null },
    ],
  },
]

/** 현행 주택 요율표 */
export const CURRENT_HOUSE_FEE_SCHEDULE: HouseFeeSchedule = HOUSE_FEE_SCHEDULES[HOUSE_FEE_SCHEDULES.length - 1]

/** 주거용 오피스텔 상한요율 — 시행규칙 §20④1호 [별표 2] (2015-01-06 시행) */
export const OFFICETEL_FEE = {
  saleRatePpm: 5_000,
  leaseRatePpm: 4_000,
  /** 전용면적 상한 (㎡) */
  maxAreaM2: 85,
  effectiveFrom: '2015-01-06',
  /** §20④1호 '상한요율 이내에서 … 협의' 문구 명시 개정 시행일 (별표 2·요율 불변) */
  negotiationWordingFrom: '2026-08-28',
  /** 위 개정 법령 번호 (2026-08-11 공포) */
  negotiationWordingAct: '국토교통부령 제1611호',
} as const

/** 그 밖의 중개대상물 상한요율 — 시행규칙 §20④2호 '거래금액의 1천분의 9 이내 협의' (매매·임대차 공통) */
export const OTHER_PROPERTY_FEE = { ratePpm: 9_000 } as const

/** 월세 거래금액 환산 — 시행규칙 §20⑤1호 */
export const LEASE_CONVERSION = {
  /** 보증금 + 월 차임 × 100 */
  multiplier: 100,
  /** 위 합계가 lowThreshold 미만이면 보증금 + 월 차임 × 70 */
  lowMultiplier: 70,
  lowThreshold: 50_000_000,
} as const

/** 부가가치세율 (%) — 부가가치세법 §30. 일반과세자 중개사무소가 중개보수와 별도로 받는 세액 */
export const BROKERAGE_VAT_PCT = 10

/** 간이과세자 참고치 — 부가가치세법 §36①2호·§63·§69, 같은 법 시행령 §111② (2021-07-01 이후 부가가치율) */
export const SIMPLIFIED_TAXPAYER = {
  /** 부동산 관련 서비스업 업종별 부가가치율 (%) */
  valueAddedRatePct: 40,
  /** 연 공급대가가 이 금액 미만이면 납부의무 면제 (원) — §69① */
  exemptBelow: 48_000_000,
  /** 직전 연도 공급대가가 이 금액 이상이면 세금계산서 발급 의무 (미만이면 영수증 발급) (원) — §36①2호가 */
  invoiceRequiredFrom: 48_000_000,
} as const

/** 초과 수수 벌칙 — 공인중개사법 §49①10호 (§33①3호 위반): N년 이하 징역 또는 M원 이하 벌금 */
export const BROKERAGE_OVERCHARGE_PENALTY = { prisonYears: 1, fineWon: 10_000_000 } as const

/** 주요 개정·시행일 */
export const BROKERAGE_RULE_DATES = {
  houseSchedule: '2021-10-19',
  officetel: OFFICETEL_FEE.effectiveFrom,
  officetelNegotiation: OFFICETEL_FEE.negotiationWordingFrom,
} as const

/* ─── 내부 유틸 ─── */

/** 금액 정규화 — NaN·음수 → 0, 원 미만 버림, 1조 클램프 */
function normWon(v: number | undefined): number {
  if (v === undefined || !Number.isFinite(v)) return 0
  return Math.floor(Math.min(BROKERAGE_MAX_AMOUNT, Math.max(0, v)))
}

/** amount × ppm / 1,000,000 을 정수 연산으로 (원 미만 버림) */
export function mulPpm(amount: number, ppm: number): number {
  const p = normWon(amount)
  const q = Math.floor(p / 1_000_000)
  const r = p - q * 1_000_000
  return q * ppm + Math.floor((r * ppm) / 1_000_000)
}

/** ppm → % 숫자 (6,000 → 0.6) */
export const ppmToPct = (ppm: number): number => ppm / PPM_PER_PCT

/** 금액 라벨 — 5천만원·2억원·12억원 (구간 경계 표기용) */
export function boundaryLabel(won: number): string {
  if (won >= EOK && won % EOK === 0) return `${(won / EOK).toLocaleString('ko-KR')}억원`
  if (won % (1_000 * MAN) === 0) return `${won / (1_000 * MAN)}천만원`
  if (won % MAN === 0) return `${(won / MAN).toLocaleString('ko-KR')}만원`
  return `${won.toLocaleString('ko-KR')}원`
}

/** 구간 라벨 — '5천만원 미만' · '2억원 이상 9억원 미만' · '15억원 이상' */
export function bracketLabel(b: FeeBracket): string {
  if (b.min === 0 && b.max !== null) return `${boundaryLabel(b.max)} 미만`
  if (b.max === null) return `${boundaryLabel(b.min)} 이상`
  return `${boundaryLabel(b.min)} 이상 ${boundaryLabel(b.max)} 미만`
}

/** 계약일에 적용되는 주택 요율표 — 'YYYY-MM-DD' 문자열 비교(날짜 파싱 없음). 생략·형식 오류면 현행 */
export function houseScheduleFor(date?: string): HouseFeeSchedule {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return CURRENT_HOUSE_FEE_SCHEDULE
  for (let i = HOUSE_FEE_SCHEDULES.length - 1; i >= 0; i--) {
    if (HOUSE_FEE_SCHEDULES[i].from <= date) return HOUSE_FEE_SCHEDULES[i]
  }
  return HOUSE_FEE_SCHEDULES[0] // 2015-04-14 이전 계약은 지원 범위 밖 — 가장 오래된 표로 근사
}

/** 거래금액이 속한 주택 구간 */
export function findHouseBracket(amount: number, kind: BrokerageKind, date?: string): { bracket: FeeBracket; index: number } {
  const list = houseScheduleFor(date)[kind]
  const a = normWon(amount)
  const index = list.findIndex(b => a >= b.min && (b.max === null || a < b.max))
  const i = index < 0 ? list.length - 1 : index
  return { bracket: list[i], index: i }
}

export interface LeaseAmount {
  deposit: number
  monthlyRent: number
  /** 보증금 + 월세 × 100 */
  amount100: number
  /** 적용 배수 (차임이 없으면 null) */
  multiplier: 100 | 70 | null
  /** 중개보수 산정 거래금액 */
  amount: number
}

/** 임대차 거래금액 — 시행규칙 §20⑤1호. 차임이 없으면 보증금 그대로 */
export function leaseTransactionAmount(deposit: number, monthlyRent: number): LeaseAmount {
  const d = normWon(deposit)
  const r = normWon(monthlyRent)
  const C = LEASE_CONVERSION
  const amount100 = Math.min(BROKERAGE_MAX_AMOUNT, d + r * C.multiplier)
  if (r === 0) return { deposit: d, monthlyRent: 0, amount100: d, multiplier: null, amount: d }
  if (amount100 < C.lowThreshold) {
    return { deposit: d, monthlyRent: r, amount100, multiplier: C.lowMultiplier, amount: d + r * C.lowMultiplier }
  }
  return { deposit: d, monthlyRent: r, amount100, multiplier: C.multiplier, amount: amount100 }
}

export interface BrokerageFeeInput {
  deal: BrokerageDeal
  property: BrokerageProperty
  /** 매매·교환: 거래금액(교환은 큰 쪽 가액) / 전세·월세: 보증금 (원) */
  amount: number
  /** 월 차임 (원) — deal='monthly'에서만 사용 */
  monthlyRent?: number
  /** 협의 요율 (%) — 생략·음수·NaN이면 상한요율. 상한 초과면 상한으로 잘라 rateClamped */
  negotiatedRatePct?: number
  /** 계약일 'YYYY-MM-DD' — 주택 요율표 기간 선택 (생략 시 현행) */
  date?: string
}

export interface BrokerageFeeResult {
  deal: BrokerageDeal
  kind: BrokerageKind
  property: BrokerageProperty
  /** 중개보수 산정 거래금액 */
  transactionAmount: number
  /** 월세 환산 내역 (deal='monthly'만) */
  lease: LeaseAmount | null
  /** 주택 구간 (주택만) */
  bracket: FeeBracket | null
  bracketIndex: number
  /** '2억원 이상 9억원 미만' · '주거용 오피스텔' 등 */
  bracketText: string
  /** 상한요율 ppm */
  maxRatePpm: number
  /** 한도액 (원) — 없으면 null */
  cap: number | null
  /** 거래금액 × 상한요율 (한도 적용 전) */
  rawMaxFee: number
  /** 최대 중개보수 (한도 적용, 한쪽) */
  maxFee: number
  /** 한도액에 걸려 줄었는가 */
  capApplied: boolean
  /** 실제 적용 요율 ppm (협의 요율 또는 상한) */
  appliedRatePpm: number
  /** 협의 요율 입력이 있었는가 */
  negotiated: boolean
  /** 협의 요율이 상한을 넘어 상한으로 잘렸는가 */
  rateClamped: boolean
  /** 거래금액 × 적용 요율 (한도 적용 전) */
  rawFee: number
  /** 적용 요율 계산값이 한도액을 넘어 한도액으로 줄었는가 */
  feeCapped: boolean
  /** 적용 중개보수 (한쪽, 부가세 전) */
  fee: number
  /** 부가세 10% (세금계산서 발급 사무소 기준, 원 미만 버림) */
  vat: number
  feeWithVat: number
  /** 쌍방 각각 같은 금액을 낸다고 가정한 양측 합계 (부가세 전) */
  bothSides: number
  /** 근거 조문 */
  basis: string
}

/** 요율 규칙 (상한요율·한도액·구간) */
function ruleFor(property: BrokerageProperty, kind: BrokerageKind, amount: number, date?: string) {
  if (property === 'house') {
    const { bracket, index } = findHouseBracket(amount, kind, date)
    const sched = houseScheduleFor(date)
    return { ratePpm: bracket.ratePpm, cap: bracket.cap, bracket, index, text: bracketLabel(bracket), basis: sched.basis }
  }
  if (property === 'officetel') {
    return {
      ratePpm: kind === 'sale' ? OFFICETEL_FEE.saleRatePpm : OFFICETEL_FEE.leaseRatePpm,
      cap: null, bracket: null, index: -1,
      text: `주거용 오피스텔 ${kind === 'sale' ? '매매·교환' : '임대차'}`,
      basis: '공인중개사법 시행규칙 §20④1호 [별표 2]',
    }
  }
  return {
    ratePpm: OTHER_PROPERTY_FEE.ratePpm, cap: null, bracket: null, index: -1,
    text: '주택 외 (토지·상가 등)',
    basis: '공인중개사법 시행규칙 §20④2호',
  }
}

/** 중개보수 상한·협의액 계산 (한쪽 기준 + 양측 합계) */
export function calcBrokerageFee(input: BrokerageFeeInput): BrokerageFeeResult {
  const kind = kindOfDeal(input.deal)
  const lease = input.deal === 'monthly' ? leaseTransactionAmount(input.amount, input.monthlyRent ?? 0) : null
  const transactionAmount = lease ? lease.amount : normWon(input.amount)
  const rule = ruleFor(input.property, kind, transactionAmount, input.date)

  const rawMaxFee = mulPpm(transactionAmount, rule.ratePpm)
  const maxFee = rule.cap !== null ? Math.min(rawMaxFee, rule.cap) : rawMaxFee
  const capApplied = rule.cap !== null && rawMaxFee > rule.cap

  const n = input.negotiatedRatePct
  const negotiated = n !== undefined && Number.isFinite(n) && n >= 0
  let appliedRatePpm = rule.ratePpm
  let rateClamped = false
  if (negotiated) {
    const ppm = Math.round(n * PPM_PER_PCT)
    if (ppm > rule.ratePpm) rateClamped = true
    else appliedRatePpm = ppm
  }
  const rawFee = mulPpm(transactionAmount, appliedRatePpm)
  const fee = rule.cap !== null ? Math.min(rawFee, rule.cap) : rawFee
  const vat = Math.floor((fee * BROKERAGE_VAT_PCT) / 100)

  return {
    deal: input.deal, kind, property: input.property,
    transactionAmount, lease,
    bracket: rule.bracket, bracketIndex: rule.index, bracketText: rule.text,
    maxRatePpm: rule.ratePpm, cap: rule.cap,
    rawMaxFee, maxFee, capApplied,
    appliedRatePpm, negotiated, rateClamped,
    rawFee, feeCapped: rule.cap !== null && rawFee > rule.cap,
    fee, vat, feeWithVat: fee + vat, bothSides: fee * 2,
    basis: rule.basis,
  }
}

/** 주택 매매 중개보수 상한 (한쪽, 부가세 전) — finance/real-estate 등 간편 호출용 */
export const houseSaleMaxFee = (price: number): number =>
  calcBrokerageFee({ deal: 'sale', property: 'house', amount: price }).maxFee
