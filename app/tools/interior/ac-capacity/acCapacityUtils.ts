/* ──────────────────────────────────────────────────────
   interior/ac-capacity/acCapacityUtils.ts
   에어컨 평형 계산 — 상수·입력 파싱·환산 (순수 함수, node 검산용)
   ────────────────────────────────────────────────────── */

import { KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH, ELEC_SIMPLE_KRW_PER_KWH } from '@/lib/krElectricityRates'

export const PYUNG_TO_M2 = 3.3058
export const LOAD_W_PER_SQM = 123          // KS C 9306 부속서 D — 거주공간 냉방부하 약 123 W/㎡ (8,100W 이하)
export const W_PER_PYEONG = 407            // 1평형 정격 냉방능력 ≈ 123 W/㎡ × 3.3058 ≈ 407W (KS·실측 기준)
export const BTU_PER_PYEONG = 1389         // 1평형 ≈ 0.407kW ≈ 1,389 BTU/h (= 407 × 3.412)
export const STANDARD_PYEONG = [6, 9, 11, 13, 15, 18, 22, 25, 30, 36]

/* 전기료 단순 가정 단가 (원/kWh) — lib/krElectricityRates.ts 단일 소스
 * 한전 주택용(저압) 누진 1단계 전력량요금에 부가 요금 일부를 얹은 어림값. 부가세·기금 별도.
 * (출처·기준일은 lib 주석 참고) */
export const KEPCO_TIER1_KRW_PER_KWH = KEPCO_RESIDENTIAL_LOW_KRW_PER_KWH.tier1
export const SIMPLE_KRW_PER_KWH = ELEC_SIMPLE_KRW_PER_KWH

/** 입력 문자열 → 숫자. 빈 값·비숫자는 fallback, 범위 밖은 [min, max]로 클램프.
 *  (onChange에서 바로 클램프하면 첫 타자가 최솟값으로 치환돼 입력이 불가능해지므로 계산 단계에서만 적용) */
export function parseClamp(s: string, min: number, max: number, fallback = min): number {
  const x = parseFloat(s)
  if (!Number.isFinite(x)) return fallback
  return Math.min(max, Math.max(min, x))
}

export type ConvertMode = 'pyeong' | 'btu' | 'w' | 'kw'

/* 환산기 입력 범위 — 시판 최대(36평형)의 10배 수준까지 허용 */
export const CONVERT_LIMITS: Record<ConvertMode, { min: number; max: number }> = {
  pyeong: { min: 1,    max: 360 },
  btu:    { min: 1000, max: 500000 },
  w:      { min: 100,  max: 150000 },
  kw:     { min: 0.1,  max: 150 },
}

/** 환산기: 선택한 단위의 입력 문자열 → 평형·BTU/h·W·kW */
export function convertCapacity(mode: ConvertMode, raw: string) {
  const lim = CONVERT_LIMITS[mode]
  const v = parseClamp(raw, lim.min, lim.max)
  let pyeong = 0
  if (mode === 'pyeong') pyeong = v
  else if (mode === 'btu') pyeong = v / BTU_PER_PYEONG
  else if (mode === 'w') pyeong = v / W_PER_PYEONG
  else pyeong = (v * 1000) / W_PER_PYEONG
  return {
    pyeong,
    btu: pyeong * BTU_PER_PYEONG,
    w: pyeong * W_PER_PYEONG,
    kw: (pyeong * W_PER_PYEONG) / 1000,
  }
}

/** 매칭 평형의 한 단계 아래·위 표준 평형 (없으면 0 — 표시 단계에서 '해당 없음') */
export function neighborPyeong(matched: number): { smaller: number; bigger: number } {
  const idx = STANDARD_PYEONG.indexOf(matched)
  if (idx < 0) return { smaller: 0, bigger: 0 }
  return {
    smaller: idx > 0 ? STANDARD_PYEONG[idx - 1] : 0,
    bigger: idx < STANDARD_PYEONG.length - 1 ? STANDARD_PYEONG[idx + 1] : 0,
  }
}
