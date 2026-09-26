/* ──────────────────────────────────────────────────────
   lib/krInsuranceRates.ts
   4대보험 요율 (2025 · 2026) + 국민연금 기준소득월액 상·하한 기간 스케줄 — 단일 소스
   사용처: 4-insurance · salary · year-end-tax(추정) · national-pension(상·하한)
   요율 개정 시 이 파일만 갱신하면 모든 도구에 함께 반영됨
   ────────────────────────────────────────────────────── */

import { todayStr } from './date'

/* 요율은 '연도' 단위(1월 1일 개정)로 바뀌므로 연도 키.
   국민연금 기준소득월액 상·하한은 매년 7월에 바뀌므로 여기 두지 않는다 →
   아래 PENSION_BASE_SCHEDULE / pensionBaseAt()를 반드시 거칠 것. */
export type RateSet = {
  pension:    { total: number; employee: number; employer: number }                                    // %
  health:     { total: number; employee: number; employer: number }                                    // %
  ltc:        { rateOfSalary: number; employee: number; employer: number }                             // 보수월액 대비 %
  unemp:      { employee: number; employer: number; extra: { under150: number; under1000: number; over1000: number } } // %
  workersCompAvg: number  // 산재 전 업종 평균 % (고용노동부 발표 평균 요율)
}

/* 법정 최저시급 (시간급, 원) — 고용노동부 확정·고시.
   2026: 10,320원 (2.9% 인상, 월 209시간 기준 2,156,880원 — moel.go.kr 보도자료 news_seq=18144)
   2027: 10,700원 (3.7%·380원 인상, 월 209시간 기준 2,236,300원 — 고용노동부 2026-08-05 고시, 2027-01-01 시행) */
export const MIN_HOURLY_WAGE: Record<2025 | 2026 | 2027, number> = {
  2025: 10_030,
  2026: 10_320,
  2027: 10_700,
}

/** 해당 연도에 시행 중인 최저시급 — 표보다 뒤 연도는 최신 고시값, 앞 연도는 표의 첫 값 */
export function minHourlyWageFor(year: number): number {
  const years = (Object.keys(MIN_HOURLY_WAGE).map(Number) as (keyof typeof MIN_HOURLY_WAGE)[]).sort((a, b) => a - b)
  let pick = years[0]
  for (const y of years) if (y <= year) pick = y
  return MIN_HOURLY_WAGE[pick]
}

/* 법정 근로시간 기준 — 근로기준법 §50 주 40시간(1일 8시간), 주휴(§55) 포함 월 209시간.
   209 = (주 40시간 + 주휴 8시간) × 365일 ÷ 7일 ÷ 12개월 ≈ 208.57 → 올림. 고용노동부 최저임금 월 환산 고시 기준
   (위 최저시급 × 209 = 월 환산액). 기준일 2026-09 — 주 40시간제가 바뀌지 않는 한 연도와 무관. */
/** 법정 주 소정근로시간 (주휴 미포함) */
export const WORK_HOURS_WEEK = 40
/** 월 소정근로시간 — 주휴 포함, 최저임금 월 환산 기준 */
export const MONTHLY_WORK_HOURS = 209

export const INSURANCE_RATES: Record<2025 | 2026, RateSet> = {
  2025: {
    pension: { total: 9.0,  employee: 4.5,    employer: 4.5 },
    health:  { total: 7.09, employee: 3.545,  employer: 3.545 },
    ltc:     { rateOfSalary: 0.9182, employee: 0.4591,  employer: 0.4591 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.47,
  },
  2026: {
    pension: { total: 9.5,  employee: 4.75,   employer: 4.75 },
    health:  { total: 7.19, employee: 3.595,  employer: 3.595 },
    ltc:     { rateOfSalary: 0.9448, employee: 0.4724,  employer: 0.4724 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.47,  // 고용노동부 '2026년 평균 산재보험료율 1.47% 유지'(2025.12)
  },
}

/* ──────────────────────────────────────────────────────
   산재보험 사업종류별 보험료율 — 천분율(‰). 화면 %로 쓸 때는 ÷10.
   근거: 고용노동부 고시 「2026년도 사업종류별 산재보험료율」(moel.go.kr 훈령·예규·고시 bbs_seq=20251201757),
         「2025년도 사업종류별 산재보험료율」(bbs_seq=20241201937) — 아래 대표 업종은 두 해 요율이 같다.
   · 출퇴근재해 요율 0.6‰은 전 업종 공통 별도 가산 (WORKERS_COMP_COMMUTE_PERMILLE)
   · 임금채권부담금 0.6‰은 산재보험료와 함께 사업주가 납부 (WAGE_CLAIM_LEVY_PERMILLE)
   대표 업종만 싣는다 — 사업장의 실제 사업종류·요율은 근로복지공단 고지 기준.
   ────────────────────────────────────────────────────── */
export interface WorkersCompIndustry {
  readonly key: string
  readonly name: string
  /** 사업종류별 산재보험료율 (‰, 출퇴근재해분 제외) */
  readonly permille: number
}

const WORKERS_COMP_INDUSTRIES_BASE: readonly WorkersCompIndustry[] = [
  { key: 'finance',      name: '금융·보험업',                       permille: 5 },
  { key: 'service',      name: '전문·보건·교육·여가 서비스업',       permille: 6 },
  { key: 'electronics',  name: '전기기계·정밀기구·전자제품 제조업',   permille: 6 },
  { key: 'retail',       name: '도소매·음식·숙박업',                 permille: 8 },
  { key: 'food',         name: '식료품 제조업',                      permille: 16 },
  { key: 'transport',    name: '육상·수상운수업',                    permille: 18 },
  { key: 'construction', name: '건설업',                             permille: 35 },
]

export const WORKERS_COMP_INDUSTRIES: Record<2025 | 2026, readonly WorkersCompIndustry[]> = {
  2025: WORKERS_COMP_INDUSTRIES_BASE,
  2026: WORKERS_COMP_INDUSTRIES_BASE,
}

/** 출퇴근재해 산재보험료율 (‰, 전 업종 공통) */
export const WORKERS_COMP_COMMUTE_PERMILLE = 0.6
/** 임금채권부담금 비율 (‰, 사업주 부담) */
export const WAGE_CLAIM_LEVY_PERMILLE = 0.6

/* ──────────────────────────────────────────────────────
   국민연금 기준소득월액 상·하한 — 기간(월) 스케줄
   근거: 국민연금법 시행령 §5 — 전체 가입자 평균소득월액(A값) 3년 평균 변동률을 반영해
         보건복지부 장관 고시로 **매년 7월 1일 ~ 다음 해 6월 30일** 적용.
   · 2024.7~2025.6: 39만 ~ 617만
   · 2025.7~2026.6: 40만 ~ 637만
   · 2026.7~2027.6: 41만 ~ 659만 (국민연금공단 '2026년도 기준소득월액 상·하한액 조정' 안내로 확인)
   새 고시가 나오면 배열 끝에 { from: 'YYYY-07', ... }를 추가만 하면 된다(from 오름차순 유지).
   ────────────────────────────────────────────────────── */

export interface PensionBasePeriod {
  /** 적용 시작월 'YYYY-MM' (포함) */
  readonly from: string
  /** 기준소득월액 하한 (원) */
  readonly min: number
  /** 기준소득월액 상한 (원) */
  readonly max: number
}

export const PENSION_BASE_SCHEDULE: readonly PensionBasePeriod[] = [
  { from: '2024-07', min: 390_000, max: 6_170_000 },
  { from: '2025-07', min: 400_000, max: 6_370_000 },
  { from: '2026-07', min: 410_000, max: 6_590_000 },
]

export type YearMonth = { year: number; month: number }

const YM_RE = /^(\d{4})-(\d{2})/

/** 'YYYY-MM' | 'YYYY-MM-DD' | Date(기기 로컬) | {year, month} → 'YYYY-MM' (month 1~12 검증) */
export function toYearMonth(when: string | Date | YearMonth): string {
  let y: number
  let m: number
  if (typeof when === 'string') {
    const hit = YM_RE.exec(when)
    if (!hit) throw new RangeError(`toYearMonth: 'YYYY-MM' 형식이 아님 — ${when}`)
    y = Number(hit[1])
    m = Number(hit[2])
  } else if (when instanceof Date) {
    y = when.getFullYear()      // UTC 해석 금지 — 기기 로컬 기준 (lib/date.ts 컨벤션)
    m = when.getMonth() + 1
  } else {
    y = when.year
    m = when.month
  }
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    throw new RangeError(`toYearMonth: 잘못된 연월 — ${y}-${m}`)
  }
  return `${y}-${String(m).padStart(2, '0')}`
}

/** 해당 시점에 적용되는 기준소득월액 상·하한 구간.
 *  스케줄 첫 구간보다 이른 시점은 가장 오래된 구간으로 대체한다(이 도구들의 계산 범위 밖).
 *  반환값은 스케줄 배열의 원소 그대로(참조 안정) — useSyncExternalStore 등에서 비교해도 안전. */
export function pensionBaseAt(when: string | Date | YearMonth): PensionBasePeriod {
  const ym = toYearMonth(when)
  let hit = PENSION_BASE_SCHEDULE[0]
  for (const p of PENSION_BASE_SCHEDULE) {
    if (p.from <= ym) hit = p   // 'YYYY-MM' 0패딩 → 사전식 비교 = 시간 비교
    else break
  }
  return hit
}

/** 직전 구간 (첫 구간이면 null) — "637만 → 659만" 같은 변경 안내용 */
export function previousPensionBase(p: PensionBasePeriod): PensionBasePeriod | null {
  const i = PENSION_BASE_SCHEDULE.findIndex(q => q.from === p.from)
  return i > 0 ? PENSION_BASE_SCHEDULE[i - 1] : null
}

/** 구간 종료월 'YYYY-MM' — 매년 7월 개정이므로 from + 11개월 (다음 구간 시작 전월과 같음) */
export function pensionBaseUntil(p: PensionBasePeriod): string {
  const [y, m] = p.from.split('-').map(Number)
  const idx = y * 12 + (m - 1) + 11
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}`
}

/** 화면 표기용 적용기간 — 예: "2026년 7월~2027년 6월" */
export function pensionBasePeriodLabel(p: PensionBasePeriod): string {
  const [fy, fm] = p.from.split('-').map(Number)
  const [ty, tm] = pensionBaseUntil(p).split('-').map(Number)
  return `${fy}년 ${fm}월~${ty}년 ${tm}월`
}

/** 소득월액 → 기준소득월액 (상·하한 클램프). 0 이하 소득은 0 (미가입·무급으로 간주) */
export function clampPensionBase(monthlyIncome: number, p: Pick<PensionBasePeriod, 'min' | 'max'>): number {
  if (!(monthlyIncome > 0)) return 0
  return Math.min(p.max, Math.max(p.min, monthlyIncome))
}

/** 편의값: 모듈 평가 시점의 '오늘'(lib/date.ts todayStr — 기기 로컬 날짜 — 한국 사용자 브라우저는 KST, Vercel 빌드 서버는 UTC)에 적용되는 구간.
 *  ⚠ 서버 컴포넌트(page.tsx)에서는 빌드 시점 값으로 정적 HTML에 박힌다.
 *    클라이언트 컴포넌트에서 이 값을 SSG 초기 렌더에 쓰면 '7월 1일 이전 빌드·이후 방문' 때 hydration 불일치가
 *    날 수 있으므로, 클라이언트는 page.tsx가 넘긴 빌드일(asOf)을 useSyncExternalStore의 서버 스냅샷으로 쓰고
 *    hydration 직후 todayStr()로 재평가하는 패턴을 쓴다 (4-insurance · national-pension 참고). */
export const PENSION_BASE_CURRENT: PensionBasePeriod = pensionBaseAt(todayStr())
