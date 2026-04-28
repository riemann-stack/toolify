/* ──────────────────────────────────────────────────────
   color/colorUtils.ts
   사용 영역: HEX/RGB/HSL/HSV/CMYK/HWB/LAB/OKLCH 변환,
            WCAG 대비비, 색맹 시뮬레이션, 팔레트 생성,
            그라디언트 보간, Tailwind 거리 매칭
   ────────────────────────────────────────────────────── */

export type RGB = { r: number; g: number; b: number; a?: number }
export type HSL = { h: number; s: number; l: number; a?: number }
export type HSV = { h: number; s: number; v: number }
export type CMYK = { c: number; m: number; y: number; k: number }
export type HWB = { h: number; w: number; b: number }
export type LAB = { l: number; a: number; b: number }
export type OKLCH = { l: number; c: number; h: number }

/* ───────── 기본 변환 ───────── */
export function hexToRgb(hex: string): RGB | null {
  const s = hex.trim().replace('#', '')
  if (/^[0-9a-fA-F]{3}$/.test(s)) {
    const [r, g, b] = s.split('').map(c => parseInt(c + c, 16))
    return { r, g, b, a: 1 }
  }
  if (/^[0-9a-fA-F]{4}$/.test(s)) {
    const [r, g, b, a] = s.split('').map(c => parseInt(c + c, 16))
    return { r, g, b, a: a / 255 }
  }
  if (/^[0-9a-fA-F]{6}$/.test(s)) {
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
      a: 1,
    }
  }
  if (/^[0-9a-fA-F]{8}$/.test(s)) {
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
      a: parseInt(s.slice(6, 8), 16) / 255,
    }
  }
  return null
}

const padHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase()

export function rgbToHex(rgb: RGB, includeAlpha = false): string {
  const base = `#${padHex(rgb.r)}${padHex(rgb.g)}${padHex(rgb.b)}`
  if (!includeAlpha || rgb.a === undefined || rgb.a >= 1) return base
  return base + padHex(rgb.a * 255)
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100), a: rgb.a }
}

export function hslToRgb(hsl: HSL): RGB {
  const h = ((hsl.h % 360) + 360) % 360 / 360
  const s = Math.max(0, Math.min(100, hsl.s)) / 100
  const l = Math.max(0, Math.min(100, hsl.l)) / 100
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255), a: hsl.a }
}

export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const v = max
  const d = max - min
  const s = max === 0 ? 0 : d / max
  let h = 0
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}

export function rgbToCmyk(rgb: RGB): CMYK {
  const rN = rgb.r / 255, gN = rgb.g / 255, bN = rgb.b / 255
  const k = 1 - Math.max(rN, gN, bN)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: Math.round(((1 - rN - k) / (1 - k)) * 100),
    m: Math.round(((1 - gN - k) / (1 - k)) * 100),
    y: Math.round(((1 - bN - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  }
}

export function rgbToHwb(rgb: RGB): HWB {
  const hsl = rgbToHsl(rgb)
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const w = Math.min(r, g, b)
  const bk = 1 - Math.max(r, g, b)
  return { h: hsl.h, w: Math.round(w * 100), b: Math.round(bk * 100) }
}

/* ───────── sRGB <-> linear <-> XYZ ───────── */
const srgbToLinear = (v: number) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/* ───────── LAB (CIE D65) ───────── */
function rgbToXyz(rgb: RGB): { x: number; y: number; z: number } {
  const r = srgbToLinear(rgb.r), g = srgbToLinear(rgb.g), b = srgbToLinear(rgb.b)
  // sRGB → XYZ (D65)
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
  return { x, y, z }
}

export function rgbToLab(rgb: RGB): LAB {
  const { x, y, z } = rgbToXyz(rgb)
  // D65 white reference
  const Xn = 0.95047, Yn = 1.0, Zn = 1.08883
  const f = (t: number) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116)
  const fx = f(x / Xn), fy = f(y / Yn), fz = f(z / Zn)
  return {
    l: Math.round((116 * fy - 16) * 10) / 10,
    a: Math.round((500 * (fx - fy)) * 10) / 10,
    b: Math.round((200 * (fy - fz)) * 10) / 10,
  }
}

/* ───────── OKLCH (CSS Color 4) ───────── */
function rgbToOklab(rgb: RGB): { L: number; a: number; b: number } {
  // sRGB → linear
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)

  // linear sRGB → LMS (per Björn Ottosson / CSS Color 4)
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  }
}

export function rgbToOklch(rgb: RGB): OKLCH {
  const { L, a, b } = rgbToOklab(rgb)
  const c = Math.sqrt(a * a + b * b)
  let h = (Math.atan2(b, a) * 180) / Math.PI
  if (h < 0) h += 360
  return {
    l: Math.round(L * 1000) / 10, // %로 표시
    c: Math.round(c * 1000) / 1000,
    h: Math.round(h * 10) / 10,
  }
}

/* ───────── WCAG 휘도·대비비 ───────── */
export function relativeLuminance(rgb: RGB): number {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type WCAGGrade = {
  ratio: number
  aaa_normal: boolean
  aa_normal:  boolean
  aaa_large:  boolean
  aa_large:   boolean
  ui:         boolean
  level:      'AAA' | 'AA' | 'AA Large' | 'Fail'
}
export function wcagGrade(ratio: number): WCAGGrade {
  const aaa_normal = ratio >= 7
  const aa_normal  = ratio >= 4.5
  const aaa_large  = ratio >= 4.5
  const aa_large   = ratio >= 3
  const ui         = ratio >= 3
  let level: WCAGGrade['level'] = 'Fail'
  if (aaa_normal) level = 'AAA'
  else if (aa_normal) level = 'AA'
  else if (aa_large) level = 'AA Large'
  return { ratio, aaa_normal, aa_normal, aaa_large, aa_large, ui, level }
}

/** 대비비를 만족하도록 텍스트 색상의 명도(L)를 조정 */
export function suggestPassingColor(textRgb: RGB, bgRgb: RGB, target = 4.5): RGB {
  const baseHsl = rgbToHsl(textRgb)
  const bgLum = relativeLuminance(bgRgb)
  const goDark = bgLum > 0.5 // 배경이 밝으면 텍스트는 어둡게

  const range = goDark
    ? Array.from({ length: baseHsl.l + 1 }, (_, i) => baseHsl.l - i) // L 감소
    : Array.from({ length: 100 - baseHsl.l + 1 }, (_, i) => baseHsl.l + i) // L 증가

  for (const l of range) {
    const candidate = hslToRgb({ h: baseHsl.h, s: baseHsl.s, l: Math.max(0, Math.min(100, l)) })
    if (contrastRatio(candidate, bgRgb) >= target) return candidate
  }
  // 극단적 fallback
  return goDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
}

/* ───────── 색맹 시뮬레이션 ───────── */
export type ColorblindType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

const CB_MATRICES: Record<ColorblindType, number[][]> = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0,     0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7,   0.3,   0],
    [0,     0.3,   0.7],
  ],
  tritanopia: [
    [0.95,  0.05,  0],
    [0,     0.433, 0.567],
    [0,     0.475, 0.525],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
}

export function simulateColorblind(rgb: RGB, type: ColorblindType): RGB {
  const m = CB_MATRICES[type]
  return {
    r: Math.round(Math.max(0, Math.min(255, rgb.r * m[0][0] + rgb.g * m[0][1] + rgb.b * m[0][2]))),
    g: Math.round(Math.max(0, Math.min(255, rgb.r * m[1][0] + rgb.g * m[1][1] + rgb.b * m[1][2]))),
    b: Math.round(Math.max(0, Math.min(255, rgb.r * m[2][0] + rgb.g * m[2][1] + rgb.b * m[2][2]))),
  }
}

/* ───────── 팔레트 생성 ───────── */
export function complementary(hsl: HSL): HSL[] {
  return [hsl, { ...hsl, h: (hsl.h + 180) % 360 }]
}
export function analogous(hsl: HSL): HSL[] {
  return [
    { ...hsl, h: (hsl.h - 30 + 360) % 360 },
    hsl,
    { ...hsl, h: (hsl.h + 30) % 360 },
  ]
}
export function triadic(hsl: HSL): HSL[] {
  return [
    hsl,
    { ...hsl, h: (hsl.h + 120) % 360 },
    { ...hsl, h: (hsl.h + 240) % 360 },
  ]
}
export function tetradic(hsl: HSL): HSL[] {
  return [
    hsl,
    { ...hsl, h: (hsl.h + 90) % 360 },
    { ...hsl, h: (hsl.h + 180) % 360 },
    { ...hsl, h: (hsl.h + 270) % 360 },
  ]
}
export function splitComplement(hsl: HSL): HSL[] {
  return [
    hsl,
    { ...hsl, h: (hsl.h + 150) % 360 },
    { ...hsl, h: (hsl.h + 210) % 360 },
  ]
}
export function monochromatic(hsl: HSL, count = 5): HSL[] {
  return Array.from({ length: count }, (_, i) => ({
    ...hsl,
    l: Math.round(15 + (i * 70) / Math.max(1, count - 1)),
  }))
}
export function shades(hsl: HSL, count = 5): HSL[] {
  return Array.from({ length: count }, (_, i) => ({
    ...hsl,
    s: Math.round((hsl.s * (count - i)) / count),
  }))
}

/** Tailwind 11단계 (50/100/.../900/950) */
export function tailwindScale(hsl: HSL): { shade: number; rgb: RGB; hex: string }[] {
  // 베이스 hue 유지, lightness 단계, 채도 미세 조정
  const targets: Array<[number, number, number]> = [
    // [shade, l, satMul]
    [50,  97, 0.5],
    [100, 94, 0.65],
    [200, 86, 0.75],
    [300, 76, 0.85],
    [400, 66, 0.95],
    [500, 50, 1.0],   // base lightness fixed at 50
    [600, 42, 1.0],
    [700, 34, 0.95],
    [800, 26, 0.9],
    [900, 18, 0.85],
    [950, 10, 0.8],
  ]
  return targets.map(([shade, l, mul]) => {
    const sat = Math.max(0, Math.min(100, hsl.s * mul))
    const rgb = hslToRgb({ h: hsl.h, s: sat, l })
    return { shade, rgb, hex: rgbToHex(rgb) }
  })
}

/* ───────── lighten·darken ───────── */
export function lighten(hsl: HSL, percent: number): HSL {
  return { ...hsl, l: Math.max(0, Math.min(100, hsl.l + percent)) }
}
export function darken(hsl: HSL, percent: number): HSL {
  return { ...hsl, l: Math.max(0, Math.min(100, hsl.l - percent)) }
}
export function desaturate(hsl: HSL, percent: number): HSL {
  return { ...hsl, s: Math.max(0, Math.min(100, hsl.s - percent)) }
}

/* ───────── 그라디언트 ───────── */
export function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  }
}

export type GradientStop = { hex: string; pos: number /* 0~100 */ }

export function gradientSteps(stops: GradientStop[], steps: number): RGB[] {
  if (stops.length < 2) {
    const r = stops[0] ? hexToRgb(stops[0].hex) : null
    return r ? [r] : []
  }
  const sorted = [...stops].sort((a, b) => a.pos - b.pos)
  const out: RGB[] = []
  for (let i = 0; i < steps; i++) {
    const t = (i / (steps - 1)) * 100
    // 두 stop 사이 보간
    let prev = sorted[0]
    let next = sorted[sorted.length - 1]
    for (let j = 0; j < sorted.length - 1; j++) {
      if (sorted[j].pos <= t && t <= sorted[j + 1].pos) {
        prev = sorted[j]
        next = sorted[j + 1]
        break
      }
    }
    if (t <= sorted[0].pos) prev = next = sorted[0]
    if (t >= sorted[sorted.length - 1].pos) prev = next = sorted[sorted.length - 1]
    const span = next.pos - prev.pos
    const localT = span === 0 ? 0 : (t - prev.pos) / span
    const a = hexToRgb(prev.hex) || { r: 0, g: 0, b: 0 }
    const b = hexToRgb(next.hex) || { r: 0, g: 0, b: 0 }
    out.push(lerpRgb(a, b, localT))
  }
  return out
}

/* ───────── 한국어 색상 이름 ───────── */
export type ColorName = { name: string; tone: string; family: string; vibe: string }

export function getKoreanColorName(rgb: RGB): ColorName {
  const hsl = rgbToHsl(rgb)
  // 그레이스케일 / 흑백 처리
  if (hsl.s < 8) {
    if (hsl.l >= 95) return { name: '흰색',     tone: '순백',  family: 'Neutral', vibe: '깨끗함, 순수' }
    if (hsl.l >= 85) return { name: '아이보리', tone: '연한',  family: 'Neutral', vibe: '부드러움, 따뜻함' }
    if (hsl.l >= 65) return { name: '연회색',   tone: '연한',  family: 'Neutral', vibe: '차분함, 단정' }
    if (hsl.l >= 35) return { name: '회색',     tone: '중간',  family: 'Neutral', vibe: '중립, 무난함' }
    if (hsl.l >= 15) return { name: '진회색',   tone: '진한',  family: 'Neutral', vibe: '묵직함, 모던' }
    return                    { name: '검정',     tone: '심연',  family: 'Neutral', vibe: '강렬함, 미니멀' }
  }

  const h = hsl.h
  let family = 'Red'
  let name = '빨강'
  if (h < 15 || h >= 345)        { family = 'Red';     name = '빨강' }
  else if (h < 45)               { family = 'Orange';  name = '주황' }
  else if (h < 70)               { family = 'Yellow';  name = '노랑' }
  else if (h < 100)              { family = 'Lime';    name = '연두' }
  else if (h < 150)              { family = 'Green';   name = '초록' }
  else if (h < 190)              { family = 'Teal';    name = '청록' }
  else if (h < 220)              { family = 'Sky';     name = '하늘색' }
  else if (h < 255)              { family = 'Blue';    name = '파랑' }
  else if (h < 290)              { family = 'Purple';  name = '보라' }
  else if (h < 320)              { family = 'Magenta'; name = '자주' }
  else                            { family = 'Pink';    name = '분홍' }

  // 톤·바이브
  let tone = '보통'
  let vibe = '균형감'
  if (hsl.l >= 80)        { tone = '연한';  vibe = '부드러움, 차분함' }
  else if (hsl.l >= 65)   { tone = '밝은';  vibe = '경쾌함, 청량감' }
  else if (hsl.l >= 40)   { tone = '선명';  vibe = '활기, 생동감' }
  else if (hsl.l >= 25)   { tone = '진한';  vibe = '안정감, 신뢰' }
  else                    { tone = '깊은';  vibe = '묵직함, 고급스러움' }

  if (hsl.s < 35) tone = `채도낮은 ${tone}`

  return { name: `${tone} ${name}`.trim(), tone, family, vibe }
}

/* ───────── 거리 (Tailwind 매칭 등) ───────── */
export function rgbDistance(a: RGB, b: RGB): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) +
    Math.pow(a.g - b.g, 2) +
    Math.pow(a.b - b.b, 2)
  )
}

/* ───────── 포맷 문자열 ───────── */
export function formatHex(rgb: RGB):  string { return rgbToHex(rgb) }
export function formatHexa(rgb: RGB): string { return rgbToHex(rgb, true) }
export function formatRgb(rgb: RGB):  string { return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }
export function formatRgba(rgb: RGB): string { return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${(rgb.a ?? 1).toFixed(2)})` }
export function formatHsl(hsl: HSL):  string { return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }
export function formatHsla(hsl: HSL): string { return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${(hsl.a ?? 1).toFixed(2)})` }
export function formatHsv(hsv: HSV):  string { return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` }
export function formatCmyk(c: CMYK):  string { return `cmyk(${c.c}%, ${c.m}%, ${c.y}%, ${c.k}%)` }
export function formatHwb(h: HWB):    string { return `hwb(${h.h} ${h.w}% ${h.b}%)` }
export function formatLab(lab: LAB):  string { return `lab(${lab.l} ${lab.a} ${lab.b})` }
export function formatOklch(o: OKLCH):string { return `oklch(${o.l}% ${o.c} ${o.h})` }
