// CSS 단위 변환기 — 길이 변환 순수 로직

export type LenUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh'
export const LEN_UNITS: LenUnit[] = ['px', 'rem', 'em', '%', 'vw', 'vh']

export interface LenCfg {
  rootFontSize: number
  parentFontSize: number
  viewportWidth: number
  viewportHeight: number
  /** width·padding·margin·gap 등의 % 기준(부모·컨테이너 크기) */
  baseValue: number
}

/** % 단위의 기준 px — font-size의 %는 부모 글꼴 크기, 그 밖의 속성은 부모(컨테이너) 크기 */
export function percentBase(prop: string, cfg: LenCfg): number {
  return prop === 'font-size' ? cfg.parentFontSize : cfg.baseValue
}

function unitBase(u: LenUnit, prop: string, cfg: LenCfg): number {
  switch (u) {
    case 'px':  return 1
    case 'rem': return cfg.rootFontSize
    case 'em':  return cfg.parentFontSize
    case '%':   return percentBase(prop, cfg) / 100
    case 'vw':  return cfg.viewportWidth / 100
    case 'vh':  return cfg.viewportHeight / 100
  }
}

/** 입력값(v, fromUnit)을 모든 단위로 변환. 기준값이 비었거나 0이면 해당 행 value는 NaN */
export function convertLength(v: number, fromUnit: LenUnit, prop: string, cfg: LenCfg): { unit: LenUnit; value: number }[] {
  const fromBase = unitBase(fromUnit, prop, cfg)
  const px = fromBase > 0 ? v * fromBase : NaN
  return LEN_UNITS.map((u) => {
    const b = unitBase(u, prop, cfg)
    return { unit: u, value: b > 0 ? px / b : NaN }
  })
}

/** '16:9', '16/9', '16 / 9', '1.85 : 1' → [w, h] */
export function parseRatio(input: string): [number, number] | null {
  const m = input.trim().match(/^(\d+(?:\.\d+)?)\s*[:/]\s*(\d+(?:\.\d+)?)$/)
  if (!m) return null
  const a = parseFloat(m[1])
  const b = parseFloat(m[2])
  if (a <= 0 || b <= 0) return null
  return [a, b]
}
