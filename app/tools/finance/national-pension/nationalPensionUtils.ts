/* national-pension 도구 전용 표시·보조 유틸.
   ※ 법정 수치(A값·비례상수·요율·개시연령 등)는 절대 여기 두지 않는다 — 전부 @/lib/krNationalPension.
   이 파일은 (1) 숫자 포맷, (2) 보정 없는 단순 누적 손익분기 계산만 담당한다. */

/** 천단위 콤마 (원 단위 정수) */
export function fmtWon(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}

/** 만원 단위 환산 표시 (예: 6,120,000 → "612.0만원") — 보조 라벨용 */
export function fmtMan(won: number): string {
  return `${(won / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만원`
}

/** 콤마 입력 → 숫자 (자릿수만 추출) */
export function parseAmount(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

/** 숫자 → 실시간 콤마 문자열 (입력칸 표시용) */
export function commafy(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return ''
  return parseInt(digits, 10).toLocaleString('ko-KR')
}

/** 보정계수(adjustFactor) → 부호 있는 % 문자열 (예: 0.7 → "−30%", 1.36 → "+36%") */
export function adjustPct(factor: number): string {
  const pct = Math.round((factor - 1) * 1000) / 10 // 소수 1자리
  if (pct === 0) return '0%'
  return `${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`
}

export interface BreakEven {
  /** 손익분기까지 도달하는 '정상수령 개시 후' 개월수 (정상 기준 시점부터) */
  monthsAfterNormalStart: number
  /** 손익분기 만 나이 (정상 개시연령 기준). 교차 없으면 null */
  ageAtCrossover: number | null
  /** 교차가 평생 발생하지 않는지 (조기수령이 항상 손해/이득인 비교 불가 케이스) */
  noCrossover: boolean
}

/**
 * 보정 없는(물가·기대수명 미반영) 단순 누적 손익분기.
 * - 정상수령: 정상 개시연령(normalStartAge)부터 normalMonthly/월.
 * - 조기/연기: 정상보다 adjustYears만큼 일찍(조기) 또는 늦게(연기) 시작, altMonthly/월.
 * 두 누적 수령액이 같아지는 '나이'를 구한다.
 *
 * @param normalMonthly  정상수령 월액 (calcPension(normal).monthly)
 * @param altMonthly     조기/연기 월액 (calcPension(early|defer).monthly)
 * @param normalStartAge 정상 수급개시연령 (pensionStartAge)
 * @param adjustYears    조기/연기 연수 (양수)
 * @param mode           'early' | 'defer'
 */
export function calcBreakEven(
  normalMonthly: number,
  altMonthly: number,
  normalStartAge: number,
  adjustYears: number,
  mode: 'early' | 'defer',
): BreakEven {
  const empty: BreakEven = { monthsAfterNormalStart: 0, ageAtCrossover: null, noCrossover: true }
  if (adjustYears <= 0 || normalMonthly <= 0 || altMonthly <= 0) return empty

  const headMonths = adjustYears * 12 // 정상보다 먼저/늦게 시작하는 개월수

  if (mode === 'early') {
    // 조기: 정상 개시연령 시점에 이미 (altMonthly × headMonths)만큼 누적, 이후 월 altMonthly.
    // 정상: 0에서 출발해 월 normalMonthly. normalMonthly > altMonthly이므로 추격.
    // 교차: head·alt + alt·t = normal·t  →  t = head·alt / (normal − alt)
    const denom = normalMonthly - altMonthly
    if (denom <= 0) return empty // 감액인데 정상 이하가 아니면 비교 불가
    const tAfterNormalStart = (headMonths * altMonthly) / denom // 정상 개시 후 개월
    return {
      monthsAfterNormalStart: tAfterNormalStart,
      ageAtCrossover: normalStartAge + tAfterNormalStart / 12,
      noCrossover: false,
    }
  }

  // defer: 연기 시작은 정상보다 headMonths 늦음. 정상은 그 사이 (normalMonthly × headMonths) 선취.
  // 연기 시작 후 정상은 normal·(head+t), 연기는 alt·t. alt > normal이므로 추격.
  // 교차: alt·t = normal·(head + t)  →  t = normal·head / (alt − normal)  (연기 개시 후 개월)
  const gain = altMonthly - normalMonthly
  if (gain <= 0) return empty
  const tAfterDeferStart = (normalMonthly * headMonths) / gain
  const monthsAfterNormalStart = headMonths + tAfterDeferStart
  return {
    monthsAfterNormalStart,
    ageAtCrossover: normalStartAge + monthsAfterNormalStart / 12,
    noCrossover: false,
  }
}
