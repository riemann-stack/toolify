/* lib/krEggGrades.ts — 계란 중량규격 (단일 소스: 계란 삶기 타이머·제과 배합 계산기)
   근거: 축산법 시행규칙 계란 중량규격 — 2026-05-21 개정(관보 게재 즉시 시행)으로 명칭이
   왕·특·대·중·소 → 2XL·XL·L·M·S로 바뀌었고 중량 기준은 그대로다. 개정 뒤 6개월(2026-11 하순까지)은 옛 명칭 병행 가능.
   무게는 껍질째 1개 기준, min 이상 · max 미만(g). */

export type EggGradeId = '2XL' | 'XL' | 'L' | 'M' | 'S'

export interface EggGrade {
  id: EggGradeId
  /** 옛 명칭(병행 표기용) */
  old: string
  /** 이상(g) — S는 0 */
  min: number
  /** 미만(g) — 2XL은 null(상한 없음) */
  max: number | null
}

export const EGG_WEIGHT_GRADES: readonly EggGrade[] = [
  { id: '2XL', old: '왕란', min: 68, max: null },
  { id: 'XL',  old: '특란', min: 60, max: 68 },
  { id: 'L',   old: '대란', min: 52, max: 60 },
  { id: 'M',   old: '중란', min: 44, max: 52 },
  { id: 'S',   old: '소란', min: 0,  max: 44 },
]

export function eggGrade(id: EggGradeId): EggGrade {
  const g = EGG_WEIGHT_GRADES.find(x => x.id === id)
  if (!g) throw new Error(`unknown egg grade ${id}`)
  return g
}

/** '68g+' · '60~68g' · '44g 미만' */
export function eggGradeRangeText(g: EggGrade): string {
  if (g.max === null) return `${g.min}g+`
  if (g.min === 0) return `${g.max}g 미만`
  return `${g.min}~${g.max}g`
}
