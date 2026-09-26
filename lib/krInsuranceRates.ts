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
  workersCompAvg: number  // 산재 전 업종 평균 %
}

/* 법정 최저시급 (시간급, 원) — 고용노동부 확정·고시.
   2026: 10,320원 (2.9% 인상, 월 209시간 기준 2,156,880원 — moel.go.kr 보도자료 news_seq=18144) */
export const MIN_HOURLY_WAGE: Record<2025 | 2026, number> = {
  2025: 10_030,
  2026: 10_320,
}

export const INSURANCE_RATES: Record<2025 | 2026, RateSet> = {
  2025: {
    pension: { total: 9.0,  employee: 4.5,    employer: 4.5 },
    health:  { total: 7.09, employee: 3.545,  employer: 3.545 },
    ltc:     { rateOfSalary: 0.9182, employee: 0.4591,  employer: 0.4591 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.43,
  },
  2026: {
    pension: { total: 9.5,  employee: 4.75,   employer: 4.75 },
    health:  { total: 7.19, employee: 3.595,  employer: 3.595 },
    ltc:     { rateOfSalary: 0.9448, employee: 0.4724,  employer: 0.4724 },
    unemp:   { employee: 0.9, employer: 0.9, extra: { under150: 0.25, under1000: 0.65, over1000: 0.85 } },
    workersCompAvg: 1.43,
  },
}

/* ──────────────────────────────────────────────────────
   국민연금 기준소득월액 상·하한 — 기간(월) 스케줄
   근거: 국민연금법 시행령 §5 — 전체 가입자 평균소득월액(A값) 3년 평균 변동률을 반영해
         보건복지부 장관 고시로 **매년 7월 1일 ~ 다음 해 6월 30일** 적용.
   · 2024.7~2025.6: 39만 ~ 617만
   · 2025.7~2026.6: 40만 ~ 637만
   · 2026.7~2027.6: 41만 ~ 659만 (저장소 기존 값 — NPS 고시로 재확인 권장)
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
  const i = PENSION_BASE_SCHEDULE.indexOf(p)
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

/** 편의값: 모듈 평가 시점의 '오늘'(lib/date.ts todayStr — 기기 로컬, 한국 사용자·KST 기준)에 적용되는 구간.
 *  ⚠ 서버 컴포넌트(page.tsx)에서는 빌드 시점 값으로 정적 HTML에 박힌다.
 *    클라이언트 컴포넌트에서 이 값을 SSG 초기 렌더에 쓰면 '7월 1일 이전 빌드·이후 방문' 때 hydration 불일치가
 *    날 수 있으므로, 클라이언트는 page.tsx가 넘긴 빌드일(asOf)을 useSyncExternalStore의 서버 스냅샷으로 쓰고
 *    hydration 직후 todayStr()로 재평가하는 패턴을 쓴다 (4-insurance · national-pension 참고). */
export const PENSION_BASE_CURRENT: PensionBasePeriod = pensionBaseAt(todayStr())
