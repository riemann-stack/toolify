/* ──────────────────────────────────────────────────────
   gradient-generator/gradientUtils.ts
   사용 영역: 4 색공간 보간(RGB/HSL/OKLCH/LAB), 6포맷 코드 생성,
            한국·글로벌 프리셋, 색맹 시뮬, 자동 추천,
            그라디언트 → PNG/SVG 내보내기
   color/colorUtils.ts 의 변환 함수 재사용
   ────────────────────────────────────────────────────── */

import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToLab, rgbToOklch,
  contrastRatio, wcagGrade, simulateColorblind,
  type RGB, type HSL,
} from '../color/colorUtils'

/* ───────── 타입 ───────── */
export type ColorSpace = 'rgb' | 'hsl' | 'oklch' | 'lab'
export type GradientType =
  | 'linear' | 'radial' | 'conic'
  | 'mesh'
  | 'repeating-linear' | 'repeating-radial'

export type Stop = { id: string; hex: string; pos: number /* 0~100 */ }

export type MeshCorners = { tl: string; tr: string; bl: string; br: string }

export type GradientConfig = {
  type:    GradientType
  space:   ColorSpace
  angle:   number              // linear/conic용
  shape:   'circle' | 'ellipse' // radial용
  stops:   Stop[]
  mesh?:   MeshCorners
  noise:   number              // 0~100
  /** repeating 시 1싸이클 너비(%) — 0이면 마지막 stop 위치 */
  cycle?:  number
}

/* ───────── Stop ID 카운터 (React 19 purity) ───────── */
let _stopId = 0
export const nextStopId = () => `gs-${++_stopId}`

export const makeStop = (hex: string, pos: number): Stop => ({ id: nextStopId(), hex, pos })

/* ───────── 역변환 (LAB·OKLCH → RGB) ───────── */
const linearToSrgb = (v: number): number => {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
  return Math.max(0, Math.min(255, Math.round(c * 255)))
}

/* XYZ(D50) → linear sRGB — colorUtils.rgbToLab(D50·Bradford)의 역행렬.
   D65 역행렬을 쓰면 보간 끝점이 원색으로 복원되지 않는다 (D50/D65 혼용 금지). */
function xyzToRgb(x: number, y: number, z: number): RGB {
  const r = x *  3.1338561 + y * -1.6168667 + z * -0.4906146
  const g = x * -0.9787684 + y *  1.9161415 + z *  0.0334540
  const b = x *  0.0719453 + y * -0.2289914 + z *  1.4052427
  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b) }
}

export function labToRgb(L: number, a: number, b: number): RGB {
  // L: 0~100, a/b: -128~127 — CSS lab()과 같은 D50 백색점
  const Xn = 0.96422, Yn = 1.0, Zn = 0.82521
  const fy = (L + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200
  const finv = (t: number) => {
    const t3 = t * t * t
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787
  }
  return xyzToRgb(Xn * finv(fx), Yn * finv(fy), Zn * finv(fz))
}

/* OKLab → linear sRGB → sRGB 8bit */
function oklabToRgb(L: number, a: number, b: number): RGB {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const r =  4.0767245293 * l - 3.3072168827 * m + 0.2307590544 * s
  const g = -1.2681437731 * l + 2.6093323231 * m - 0.3411344290 * s
  const bb = -0.0041119885 * l - 0.7034763098 * m + 1.7068625689 * s

  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(bb) }
}

export function oklchToRgb(l: number /*0~100*/, c: number, h: number /*deg*/): RGB {
  const L = l / 100
  const hr = (h * Math.PI) / 180
  return oklabToRgb(L, Math.cos(hr) * c, Math.sin(hr) * c)
}

/* ───────── 보간 ───────── */
export function lerp(a: number, b: number, t: number): number { return a + (b - a) * t }

/** Hue를 짧은 방향으로 보간 (0~360 wrap) */
function lerpHue(a: number, b: number, t: number): number {
  let d = b - a
  if (d > 180) d -= 360
  else if (d < -180) d += 360
  return (a + d * t + 360) % 360
}

export function interpolate(c1: RGB, c2: RGB, t: number, space: ColorSpace): RGB {
  if (space === 'rgb') {
    return {
      r: Math.round(lerp(c1.r, c2.r, t)),
      g: Math.round(lerp(c1.g, c2.g, t)),
      b: Math.round(lerp(c1.b, c2.b, t)),
    }
  }
  if (space === 'hsl') {
    const h1 = rgbToHsl(c1)
    const h2 = rgbToHsl(c2)
    return hslToRgb({
      h: lerpHue(h1.h, h2.h, t),
      s: lerp(h1.s, h2.s, t),
      l: lerp(h1.l, h2.l, t),
    })
  }
  if (space === 'oklch') {
    const o1 = rgbToOklch(c1)
    const o2 = rgbToOklch(c2)
    // 무채색이면 hue 무시
    const h1 = o1.c < 0.001 ? o2.h : o1.h
    const h2 = o2.c < 0.001 ? o1.h : o2.h
    return oklchToRgb(lerp(o1.l, o2.l, t), lerp(o1.c, o2.c, t), lerpHue(h1, h2, t))
  }
  // lab
  const l1 = rgbToLab(c1)
  const l2 = rgbToLab(c2)
  return labToRgb(lerp(l1.l, l2.l, t), lerp(l1.a, l2.a, t), lerp(l1.b, l2.b, t))
}

/** 모든 stop 사이를 dense interpolation해서 N개 색상을 반환 */
export function gradientColors(stops: Stop[], space: ColorSpace, count: number): { rgb: RGB; pos: number }[] {
  if (stops.length === 0) return []
  if (stops.length === 1) {
    const r = hexToRgb(stops[0].hex)
    return r ? [{ rgb: r, pos: 0 }] : []
  }
  const sorted = [...stops].sort((a, b) => a.pos - b.pos)
  const rgbStops = sorted.map((s) => ({ rgb: hexToRgb(s.hex) ?? { r: 0, g: 0, b: 0 }, pos: s.pos }))
  const out: { rgb: RGB; pos: number }[] = []
  for (let i = 0; i < count; i++) {
    const pos = (i / (count - 1)) * 100
    let prev = rgbStops[0]
    let next = rgbStops[rgbStops.length - 1]
    if (pos <= rgbStops[0].pos) {
      out.push({ rgb: rgbStops[0].rgb, pos })
      continue
    }
    if (pos >= rgbStops[rgbStops.length - 1].pos) {
      out.push({ rgb: rgbStops[rgbStops.length - 1].rgb, pos })
      continue
    }
    for (let j = 0; j < rgbStops.length - 1; j++) {
      if (rgbStops[j].pos <= pos && pos <= rgbStops[j + 1].pos) {
        prev = rgbStops[j]
        next = rgbStops[j + 1]
        break
      }
    }
    const span = next.pos - prev.pos
    const t = span === 0 ? 0 : (pos - prev.pos) / span
    out.push({ rgb: interpolate(prev.rgb, next.rgb, t, space), pos })
  }
  return out
}

/* ───────── CSS 그라디언트 ───────── */
const stopsCss = (stops: Stop[]): string =>
  [...stops].sort((a, b) => a.pos - b.pos).map((s) => `${s.hex.toUpperCase()} ${s.pos.toFixed(1)}%`).join(', ')

/** repeating 유형의 1싸이클 너비(%) — 미지정 시 25 (100이면 반복이 보이지 않음) */
export const cycleOf = (cfg: GradientConfig): number => {
  const c = cfg.cycle
  return typeof c === 'number' && c > 0 ? Math.min(100, c) : 25
}

/** repeating용: stop 범위(min~max)를 0~cycle로 정규화.
    pos/100*cycle 방식은 stops가 0~100을 채운다는 가정이라, 마지막 stop이 50%면
    실주기가 cycle/2로 줄어드는 이중 스케일이 생긴다 (CSS 반복 주기 = max−min). */
function scaleStopsToCycle(stops: Stop[], cycle: number): Stop[] {
  const positions = stops.map((s) => s.pos)
  const min = Math.min(...positions)
  const span = Math.max(...positions) - min
  if (span <= 0) return stops.map((s) => ({ ...s, pos: 0 }))
  return stops.map((s) => ({ ...s, pos: ((s.pos - min) / span) * cycle }))
}

/** repeating dense용: stop 범위를 0~100으로 정규화 (이후 /100*cycle 스케일) */
function normalizeStops(stops: Stop[]): Stop[] {
  return scaleStopsToCycle(stops, 100)
}

/** 미리보기/내보내기용: 공백 보간 모드 native 문법 */
export function buildCss(cfg: GradientConfig, opts: { native?: boolean } = {}): string {
  // mesh는 어떤 경로로 들어와도 mesh로 렌더 (폴스루 시 linear로 둔갑하는 것 방지)
  if (cfg.type === 'mesh') {
    return cfg.mesh ? buildMeshCss(cfg.mesh) : `linear-gradient(${cfg.angle}deg, ${stopsCss(cfg.stops)})`
  }

  const native = opts.native ?? false
  const inSpace =
    native && cfg.space !== 'rgb'
      ? `in ${cfg.space === 'oklch' ? 'oklch' : cfg.space === 'lab' ? 'lab' : 'hsl'} `
      : ''

  // native 모드: CSS 자체가 보간 처리
  if (native) {
    const list = stopsCss(cfg.stops)
    if (cfg.type === 'linear') return `linear-gradient(${inSpace}${cfg.angle}deg, ${list})`
    if (cfg.type === 'repeating-linear') {
      const scaled = stopsCss(scaleStopsToCycle(cfg.stops, cycleOf(cfg)))
      return `repeating-linear-gradient(${inSpace}${cfg.angle}deg, ${scaled})`
    }
    // radial: <color-interpolation-method>는 콤마 앞(모양·위치와 같은 그룹) — 스톱 리스트에 넣으면 무효 CSS
    if (cfg.type === 'radial') return `radial-gradient(${inSpace}${cfg.shape} at center, ${list})`
    if (cfg.type === 'repeating-radial') {
      const scaled = stopsCss(scaleStopsToCycle(cfg.stops, cycleOf(cfg)))
      return `repeating-radial-gradient(${inSpace}${cfg.shape} at center, ${scaled})`
    }
    if (cfg.type === 'conic') return `conic-gradient(${inSpace}from ${cfg.angle}deg at center, ${list})`
  }

  // dense interpolation 모드 (RGB 외 공간을 JS로 보간 후 CSS hex stops 다수 출력)
  if (cfg.space === 'rgb') {
    // RGB는 어차피 native와 동일
    const list = stopsCss(cfg.stops)
    if (cfg.type === 'linear') return `linear-gradient(${cfg.angle}deg, ${list})`
    if (cfg.type === 'repeating-linear') {
      const scaled = stopsCss(scaleStopsToCycle(cfg.stops, cycleOf(cfg)))
      return `repeating-linear-gradient(${cfg.angle}deg, ${scaled})`
    }
    if (cfg.type === 'radial') return `radial-gradient(${cfg.shape} at center, ${list})`
    if (cfg.type === 'repeating-radial') {
      const scaled = stopsCss(scaleStopsToCycle(cfg.stops, cycleOf(cfg)))
      return `repeating-radial-gradient(${cfg.shape} at center, ${scaled})`
    }
    if (cfg.type === 'conic') return `conic-gradient(from ${cfg.angle}deg at center, ${list})`
  }

  // dense (HSL/OKLCH/LAB) — 16 stops (repeating은 stop 범위를 0~100으로 정규화해 플래토 없는 1주기 생성)
  const isRepeating = cfg.type === 'repeating-linear' || cfg.type === 'repeating-radial'
  const dense = gradientColors(isRepeating ? normalizeStops(cfg.stops) : cfg.stops, cfg.space, 16)
  const list = dense.map((d) => `${rgbToHex(d.rgb)} ${d.pos.toFixed(1)}%`).join(', ')
  if (cfg.type === 'linear') return `linear-gradient(${cfg.angle}deg, ${list})`
  if (cfg.type === 'repeating-linear') {
    const cycle = cycleOf(cfg)
    const scaled = dense.map((d) => `${rgbToHex(d.rgb)} ${((d.pos / 100) * cycle).toFixed(1)}%`).join(', ')
    return `repeating-linear-gradient(${cfg.angle}deg, ${scaled})`
  }
  if (cfg.type === 'radial') return `radial-gradient(${cfg.shape} at center, ${list})`
  if (cfg.type === 'repeating-radial') {
    const cycle = cycleOf(cfg)
    const scaled = dense.map((d) => `${rgbToHex(d.rgb)} ${((d.pos / 100) * cycle).toFixed(1)}%`).join(', ')
    return `repeating-radial-gradient(${cfg.shape} at center, ${scaled})`
  }
  if (cfg.type === 'conic') return `conic-gradient(from ${cfg.angle}deg at center, ${list})`
  return `linear-gradient(${cfg.angle}deg, ${list})`
}

/** Mesh: 4 corner radial gradient 합성 (CSS multi-background)
    맨 아래 tl 베이스 레이어 포함 — SVG(베이스 rect)·PNG(source-over)와 합성 모델 통일 */
export function buildMeshCss(mesh: MeshCorners): string {
  const { tl, tr, bl, br } = mesh
  return [
    `radial-gradient(circle at 0% 0%,   ${tl} 0%, transparent 70%)`,
    `radial-gradient(circle at 100% 0%, ${tr} 0%, transparent 70%)`,
    `radial-gradient(circle at 0% 100%, ${bl} 0%, transparent 70%)`,
    `radial-gradient(circle at 100% 100%, ${br} 0%, transparent 70%)`,
    `linear-gradient(${tl}, ${tl})`,
  ].join(', ')
}

/* ───────── 출력 포맷 ───────── */
export function exportCss(cfg: GradientConfig): string {
  const noise = cfg.noise > 0 ? `${noiseSvgUrl(cfg.noise)},\n  ` : ''
  if (cfg.type === 'mesh' && cfg.mesh) {
    return `background:\n  ${noise}${buildMeshCss(cfg.mesh).split(', ').join(',\n  ')};`
  }
  if (noise) return `background:\n  ${noise}${buildCss(cfg, { native: true })};`
  return `background: ${buildCss(cfg, { native: true })};`
}

export function exportTailwind(cfg: GradientConfig): string {
  if (cfg.type === 'mesh' && cfg.mesh) {
    // Tailwind는 mesh 미지원 — arbitrary value로 대체
    return `bg-[${buildMeshCss(cfg.mesh).replace(/\s+/g, '_').replace(/,/g, ',')}]`
  }
  // arbitrary value 형태로 출력
  const css = buildCss(cfg, { native: true }).replace(/\s+/g, '_')
  return `bg-[${css}]`
}

export function exportSvg(cfg: GradientConfig, w = 400, h = 200, opts?: { noise?: number }): string {
  const id = 'g1'
  const meshNoiseXml = (opts?.noise ?? 0) > 0
    ? `
  <filter id="ng"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${(((opts?.noise ?? 0) / 100) * 0.5).toFixed(2)} 0"/></filter>
  <rect width="100%" height="100%" filter="url(#ng)"/>`
    : ''
  if (cfg.type === 'mesh' && cfg.mesh) {
    const { tl, tr, bl, br } = cfg.mesh
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g-tl" cx="0" cy="0" r="0.7"><stop offset="0%" stop-color="${tl}"/><stop offset="100%" stop-color="${tl}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-tr" cx="1" cy="0" r="0.7"><stop offset="0%" stop-color="${tr}"/><stop offset="100%" stop-color="${tr}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-bl" cx="0" cy="1" r="0.7"><stop offset="0%" stop-color="${bl}"/><stop offset="100%" stop-color="${bl}" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-br" cx="1" cy="1" r="0.7"><stop offset="0%" stop-color="${br}"/><stop offset="100%" stop-color="${br}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="${tl}"/>
  <rect width="100%" height="100%" fill="url(#g-tl)"/>
  <rect width="100%" height="100%" fill="url(#g-tr)"/>
  <rect width="100%" height="100%" fill="url(#g-bl)"/>
  <rect width="100%" height="100%" fill="url(#g-br)"/>${meshNoiseXml}
</svg>`
  }

  // dense stops (SVG는 offset 역순을 클램프하므로 반드시 정렬)
  const isRepeating = cfg.type === 'repeating-linear' || cfg.type === 'repeating-radial'
  const srcStops = isRepeating ? normalizeStops(cfg.stops) : cfg.stops
  let dense =
    cfg.space === 'rgb'
      ? [...srcStops].sort((a, b) => a.pos - b.pos).map((s) => ({ rgb: hexToRgb(s.hex) ?? { r: 0, g: 0, b: 0 }, pos: s.pos }))
      : gradientColors(srcStops, cfg.space, 16)

  // repeating: 싸이클을 0~100%에 반복 배치 (SVG에는 repeating-gradient가 없음)
  if (isRepeating) {
    const cycle = cycleOf(cfg)
    const tiled: typeof dense = []
    for (let k = 0; k * cycle < 100; k++) {
      for (const d of dense) {
        const pos = k * cycle + (d.pos / 100) * cycle
        if (pos <= 100) tiled.push({ rgb: d.rgb, pos })
      }
    }
    dense = tiled
  }

  const stopsXml = dense
    .map((d) => `      <stop offset="${d.pos.toFixed(1)}%" stop-color="${rgbToHex(d.rgb)}"/>`)
    .join('\n')

  const noiseXml = meshNoiseXml

  if (cfg.type === 'linear' || cfg.type === 'repeating-linear') {
    const rad = ((cfg.angle - 90) * Math.PI) / 180
    const x1 = 50 - 50 * Math.cos(rad)
    const y1 = 50 - 50 * Math.sin(rad)
    const x2 = 50 + 50 * Math.cos(rad)
    const y2 = 50 + 50 * Math.sin(rad)
    return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}" x1="${x1.toFixed(1)}%" y1="${y1.toFixed(1)}%" x2="${x2.toFixed(1)}%" y2="${y2.toFixed(1)}%">
${stopsXml}
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#${id})"/>${noiseXml}
</svg>`
  }
  // radial / repeating-radial: circle·ellipse 구분 (CSS 기본 = farthest-corner)
  // conic: SVG 표준에 conic이 없어 radial 폴백 (도구 안내와 동일)
  const gradAttrs =
    cfg.type !== 'conic' && cfg.shape === 'circle'
      ? `gradientUnits="userSpaceOnUse" cx="${(w / 2).toFixed(1)}" cy="${(h / 2).toFixed(1)}" r="${Math.hypot(w / 2, h / 2).toFixed(1)}"`
      : `cx="50%" cy="50%" r="70.71%"` // objectBoundingBox r=1/√2 → farthest-corner 타원(rx=w/√2, ry=h/√2)
  const conicComment = cfg.type === 'conic' ? '\n  <!-- SVG는 conic-gradient를 지원하지 않아 radial로 폴백됩니다 -->' : ''
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${conicComment}
  <defs>
    <radialGradient id="${id}" ${gradAttrs}>
${stopsXml}
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#${id})"/>${noiseXml}
</svg>`
}

export function exportReact(cfg: GradientConfig): string {
  const noise = cfg.noise > 0 ? `${noiseSvgUrl(cfg.noise)}, ` : ''
  if (cfg.type === 'mesh' && cfg.mesh) {
    return `const style = {
  background: \`${noise}${buildMeshCss(cfg.mesh)}\`,
}`
  }
  // 노이즈 data URI에 작은따옴표가 들어갈 수 있어 백틱으로 출력
  return `const style = {
  background: \`${noise}${buildCss(cfg, { native: true })}\`,
}`
}

export function exportSwiftUI(cfg: GradientConfig): string {
  if (cfg.type === 'mesh') {
    return `// SwiftUI는 iOS 18+에서 MeshGradient 지원
// 4 모서리 색상으로 Mesh 구성:
import SwiftUI

@available(iOS 18, macOS 15, *)
let gradient = MeshGradient(width: 2, height: 2, points: [
  [0,0],[1,0],[0,1],[1,1]
], colors: [
  Color(hex: "${cfg.mesh?.tl}"), Color(hex: "${cfg.mesh?.tr}"),
  Color(hex: "${cfg.mesh?.bl}"), Color(hex: "${cfg.mesh?.br}"),
])`
  }
  const colors = cfg.stops.map((s) => `Color(hex: "${s.hex}")`).join(',\n    ')
  const stops = cfg.stops
    .map((s) => `Gradient.Stop(color: Color(hex: "${s.hex}"), location: ${(s.pos / 100).toFixed(2)})`)
    .join(',\n    ')

  if (cfg.type === 'radial' || cfg.type === 'repeating-radial') {
    return `RadialGradient(
  gradient: Gradient(stops: [
    ${stops}
  ]),
  center: .center,
  startRadius: 0,
  endRadius: 200
)`
  }
  if (cfg.type === 'conic') {
    return `AngularGradient(
  gradient: Gradient(colors: [
    ${colors}
  ]),
  center: .center,
  angle: .degrees(${cfg.angle})
)`
  }
  // linear (repeating은 SwiftUI 미지원 — 일반 Linear로)
  const angRad = ((cfg.angle - 90) * Math.PI) / 180
  const sx = (0.5 - 0.5 * Math.cos(angRad)).toFixed(2)
  const sy = (0.5 - 0.5 * Math.sin(angRad)).toFixed(2)
  const ex = (0.5 + 0.5 * Math.cos(angRad)).toFixed(2)
  const ey = (0.5 + 0.5 * Math.sin(angRad)).toFixed(2)
  return `LinearGradient(
  gradient: Gradient(stops: [
    ${stops}
  ]),
  startPoint: UnitPoint(x: ${sx}, y: ${sy}),
  endPoint: UnitPoint(x: ${ex}, y: ${ey})
)`
}

export function exportFlutter(cfg: GradientConfig): string {
  if (cfg.type === 'mesh') {
    return `// Flutter는 mesh gradient 표준 지원 X — 4모서리 RadialGradient Stack:
Stack(children: [
  Container(decoration: BoxDecoration(gradient: RadialGradient(
    center: Alignment.topLeft, radius: 0.7,
    colors: [Color(0xFF${cfg.mesh?.tl.replace('#', '')}), Colors.transparent],
  ))),
  // 나머지 3 모서리도 동일 패턴...
])`
  }
  const flutterStops = cfg.type === 'repeating-linear' || cfg.type === 'repeating-radial' ? normalizeStops(cfg.stops) : cfg.stops
  const colorsList = flutterStops.map((s) => `Color(0xFF${s.hex.replace('#', '')})`).join(',\n      ')
  const stopsList = flutterStops.map((s) => (s.pos / 100).toFixed(3)).join(', ')

  if (cfg.type === 'radial' || cfg.type === 'repeating-radial') {
    return `Container(
  decoration: BoxDecoration(
    gradient: RadialGradient(
      center: Alignment.center,
      radius: ${cfg.type === 'repeating-radial' ? (0.7 * cycleOf(cfg) / 100).toFixed(2) : '0.7'},
      colors: [
        ${colorsList}
      ],
      stops: [${stopsList}],
      tileMode: ${cfg.type === 'repeating-radial' ? 'TileMode.repeated' : 'TileMode.clamp'},
    ),
  ),
)`
  }
  if (cfg.type === 'conic') {
    return `// Flutter SweepGradient (== Conic)
Container(
  decoration: BoxDecoration(
    gradient: SweepGradient(
      center: Alignment.center,
      startAngle: ${(((cfg.angle - 90) * Math.PI) / 180).toFixed(2)},
      endAngle: ${(((cfg.angle - 90) * Math.PI) / 180 + Math.PI * 2).toFixed(2)},
      colors: [
        ${colorsList}
      ],
      stops: [${stopsList}],
    ),
  ),
)`
  }
  // linear — repeating은 begin/end 스팬을 싸이클 비율로 줄여야 TileMode.repeated가 실제로 타일링됨
  const angRad = ((cfg.angle - 90) * Math.PI) / 180
  const scale = cfg.type === 'repeating-linear' ? cycleOf(cfg) / 100 : 1
  const sx = (-Math.cos(angRad) * scale).toFixed(2)
  const sy = (-Math.sin(angRad) * scale).toFixed(2)
  const ex = (Math.cos(angRad) * scale).toFixed(2)
  const ey = (Math.sin(angRad) * scale).toFixed(2)
  return `Container(
  decoration: BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment(${sx}, ${sy}),
      end: Alignment(${ex}, ${ey}),
      colors: [
        ${colorsList}
      ],
      stops: [${stopsList}],
      tileMode: ${cfg.type === 'repeating-linear' ? 'TileMode.repeated' : 'TileMode.clamp'},
    ),
  ),
)`
}

/* ───────── 노이즈 SVG (필터) ───────── */
export function noiseSvgUrl(intensity: number /*0~100*/): string {
  if (intensity <= 0) return 'none'
  const opacity = (intensity / 100) * 0.5
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${opacity.toFixed(2)} 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`
  // url-encode SVG
  const encoded = encodeURIComponent(svg).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/')
  return `url("data:image/svg+xml,${encoded}")`
}

/* ───────── 접근성 ───────── */
export type ContrastReport = {
  whiteRatio: number
  blackRatio: number
  whiteGrade: ReturnType<typeof wcagGrade>
  blackGrade: ReturnType<typeof wcagGrade>
  bestText: 'white' | 'black'
  worstSampleHex: string
  worstSampleAt: number
}

/** 특정 위치의 보간 색 (gradientColors와 동일 규칙: 범위 밖 클램프) */
function colorAtPos(sorted: { rgb: RGB; pos: number }[], space: ColorSpace, pos: number): RGB {
  if (sorted.length === 0) return { r: 0, g: 0, b: 0 }
  if (pos <= sorted[0].pos) return sorted[0].rgb
  if (pos >= sorted[sorted.length - 1].pos) return sorted[sorted.length - 1].rgb
  for (let j = 0; j < sorted.length - 1; j++) {
    if (sorted[j].pos <= pos && pos <= sorted[j + 1].pos) {
      const span = sorted[j + 1].pos - sorted[j].pos
      const t = span === 0 ? 0 : (pos - sorted[j].pos) / span
      return interpolate(sorted[j].rgb, sorted[j + 1].rgb, t, space)
    }
  }
  return sorted[0].rgb
}

/** 그라디언트를 샘플링해서 흰/검 텍스트 worst-case 대비비 계산.
    균일 샘플만으로는 좁은 밴드(예: stop 49·50·51·52%)를 건너뛰므로
    모든 stop 위치 + 인접 stop 사이 세분점을 반드시 포함한다. */
export function analyzeContrast(stops: Stop[], space: ColorSpace, samples = 12): ContrastReport {
  const sorted = [...stops]
    .sort((a, b) => a.pos - b.pos)
    .map((s) => ({ rgb: hexToRgb(s.hex) ?? { r: 0, g: 0, b: 0 }, pos: s.pos }))
  const positions = new Set<number>([0, 100])
  for (let i = 0; i < samples; i++) positions.add((i / (samples - 1)) * 100)
  for (const s of sorted) positions.add(s.pos)
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i].pos, b = sorted[i + 1].pos
    for (const t of [0.25, 0.5, 0.75]) positions.add(a + (b - a) * t)
  }
  const dense = [...positions].sort((x, y) => x - y).map((pos) => ({ rgb: colorAtPos(sorted, space, pos), pos }))
  let worstWhite = Infinity
  let worstBlack = Infinity
  const W: RGB = { r: 255, g: 255, b: 255 }
  const B: RGB = { r: 0, g: 0, b: 0 }
  for (const d of dense) {
    const w = contrastRatio(W, d.rgb)
    const b = contrastRatio(B, d.rgb)
    if (w < worstWhite) worstWhite = w
    if (b < worstBlack) worstBlack = b
  }
  const bestText: 'white' | 'black' = worstWhite > worstBlack ? 'white' : 'black'
  // 최난 지점은 추천 텍스트(bestText) 기준으로 — min(흰,검) 기준이면 추천색이 잘 보이는 지점을 가리킬 수 있음
  let worstHex = '#000000'
  let worstAt = 0
  let worstRatio = Infinity
  for (const d of dense) {
    const r = contrastRatio(bestText === 'white' ? W : B, d.rgb)
    if (r < worstRatio) {
      worstRatio = r
      worstHex = rgbToHex(d.rgb)
      worstAt = d.pos
    }
  }
  return {
    whiteRatio: Math.round(worstWhite * 100) / 100,
    blackRatio: Math.round(worstBlack * 100) / 100,
    whiteGrade: wcagGrade(worstWhite),
    blackGrade: wcagGrade(worstBlack),
    bestText,
    worstSampleHex: worstHex,
    worstSampleAt: worstAt,
  }
}

/** Mesh 대비 분석용 유사 stops — 모서리 4색 (모서리 사이 혼합색은 근사적으로 이 범위 안) */
export function meshAnalysisStops(mesh: MeshCorners): Stop[] {
  return [
    { id: 'mesh-tl', hex: mesh.tl, pos: 0 },
    { id: 'mesh-tr', hex: mesh.tr, pos: 33 },
    { id: 'mesh-bl', hex: mesh.bl, pos: 67 },
    { id: 'mesh-br', hex: mesh.br, pos: 100 },
  ]
}

/** Mesh 4 모서리를 색맹 시뮬레이션 적용 */
export function colorblindMesh(mesh: MeshCorners, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): MeshCorners {
  const sim = (hex: string) => rgbToHex(simulateColorblind(hexToRgb(hex) ?? { r: 0, g: 0, b: 0 }, type))
  return { tl: sim(mesh.tl), tr: sim(mesh.tr), bl: sim(mesh.bl), br: sim(mesh.br) }
}

/** 그라디언트 stops 자체를 색맹 시뮬레이션 적용 */
export function colorblindStops(stops: Stop[], type: 'protanopia' | 'deuteranopia' | 'tritanopia'): Stop[] {
  return stops.map((s) => {
    const rgb = hexToRgb(s.hex) ?? { r: 0, g: 0, b: 0 }
    const sim = simulateColorblind(rgb, type)
    return { ...s, hex: rgbToHex(sim) }
  })
}

/* ───────── 자동 추천 (1색 → 그라디언트 5종) ───────── */
export type AutoSuggestion = {
  label: string
  desc:  string
  stops: Stop[]
}

export function autoSuggestions(baseHex: string): AutoSuggestion[] {
  const rgb = hexToRgb(baseHex) ?? { r: 100, g: 100, b: 100 }
  const hsl = rgbToHsl(rgb)
  const mk = (a: HSL, b: HSL): Stop[] => [
    makeStop(rgbToHex(hslToRgb(a)), 0),
    makeStop(rgbToHex(hslToRgb(b)), 100),
  ]
  return [
    {
      label: '유사색',
      desc:  '+30° hue, 부드러운 흐름',
      stops: mk(hsl, { ...hsl, h: (hsl.h + 30) % 360 }),
    },
    {
      label: '보색',
      desc:  '+180° hue, 강한 대비',
      stops: mk(hsl, { ...hsl, h: (hsl.h + 180) % 360 }),
    },
    {
      label: '삼각',
      desc:  '+120° hue, 활기찬 톤',
      stops: [
        makeStop(rgbToHex(hslToRgb(hsl)), 0),
        makeStop(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 120) % 360 })), 50),
        makeStop(rgbToHex(hslToRgb({ ...hsl, h: (hsl.h + 240) % 360 })), 100),
      ],
    },
    {
      label: '단일 명도',
      desc:  '같은 hue, 명도 변화',
      stops: mk({ ...hsl, l: Math.max(15, hsl.l - 25) }, { ...hsl, l: Math.min(85, hsl.l + 25) }),
    },
    {
      label: '노을',
      desc:  '따뜻한 톤 시프트',
      stops: mk(
        { ...hsl, h: (hsl.h + 20) % 360, l: Math.min(70, hsl.l + 10) },
        { h: (hsl.h - 30 + 360) % 360, s: Math.min(100, hsl.s + 10), l: Math.max(25, hsl.l - 20) },
      ),
    },
  ]
}

/* ───────── 프리셋 라이브러리 ───────── */
export type Preset = {
  id: string
  name: string
  category: string
  type?: GradientType
  angle?: number
  space?: ColorSpace
  stops: Array<[string, number]> // [hex, pos]
}

const P = (id: string, name: string, category: string, stops: Array<[string, number]>, opts?: Partial<Preset>): Preset =>
  ({ id, name, category, stops, ...(opts ?? {}) })

/* 한국 무드 — 직접 디자인 (특정 브랜드 컬러 그대로 차용 X) */
export const KOREAN_PRESETS: Preset[] = [
  // 계절 — 봄 (5)
  P('k-spring-1', '벚꽃 새벽',     '봄', [['#FFE4F1', 0], ['#F8B4D9', 50], ['#A8C5E8', 100]]),
  P('k-spring-2', '연두 들판',     '봄', [['#E8F5C8', 0], ['#C7E89F', 50], ['#7AB348', 100]]),
  P('k-spring-3', '봄비',          '봄', [['#D7E8F0', 0], ['#A8C5D8', 50], ['#7B9BB0', 100]]),
  P('k-spring-4', '복숭아꽃',      '봄', [['#FFD9C4', 0], ['#FFB6A0', 100]]),
  P('k-spring-5', '진달래',        '봄', [['#FFB7DC', 0], ['#E76FA1', 50], ['#A53A6F', 100]]),
  // 여름 (6)
  P('k-summer-1', '한강 일몰',     '여름', [['#FFC685', 0], ['#FF7B7B', 40], ['#7B4FA8', 100]]),
  P('k-summer-2', '제주 바다',     '여름', [['#7FD1E0', 0], ['#3E9DBF', 50], ['#1A4D80', 100]]),
  P('k-summer-3', '여름밤',        '여름', [['#1A2B5F', 0], ['#3D4F8C', 50], ['#7B82A8', 100]]),
  P('k-summer-4', '수박 한입',     '여름', [['#FF6B7E', 0], ['#FFB0A8', 50], ['#5BC85B', 100]]),
  P('k-summer-5', '계곡 물빛',     '여름', [['#A8E5D5', 0], ['#5FB89D', 100]]),
  P('k-summer-6', '소나기',        '여름', [['#5C7295', 0], ['#3A4B6B', 50], ['#1A2438', 100]]),
  // 가을 (6)
  P('k-fall-1',   '단풍 절정',     '가을', [['#FFE08A', 0], ['#FF8C42', 50], ['#C73838', 100]]),
  P('k-fall-2',   '가을 들판',     '가을', [['#F4D58A', 0], ['#D4A050', 50], ['#7B5230', 100]]),
  P('k-fall-3',   '은행나무',      '가을', [['#FFE066', 0], ['#FFB938', 100]]),
  P('k-fall-4',   '코스모스',      '가을', [['#FFB7DC', 0], ['#E580B7', 50], ['#A0CFE5', 100]]),
  P('k-fall-5',   '서리 새벽',     '가을', [['#E0E0E8', 0], ['#A8B0BA', 50], ['#5C6878', 100]]),
  P('k-fall-6',   '저녁 노을',     '가을', [['#FFAB7B', 0], ['#E5638F', 50], ['#5C2C7B', 100]]),
  // 겨울 (5)
  P('k-winter-1', '겨울 새벽',     '겨울', [['#B5C8E0', 0], ['#7B96B8', 50], ['#3D5273', 100]]),
  P('k-winter-2', '눈 내리는 밤',  '겨울', [['#1A2540', 0], ['#384866', 50], ['#A8B8D5', 100]]),
  P('k-winter-3', '얼음 호수',     '겨울', [['#E5F1F5', 0], ['#A8CCD8', 50], ['#5C8BA0', 100]]),
  P('k-winter-4', '동백꽃',        '겨울', [['#C73838', 0], ['#7B1A2E', 100]]),
  P('k-winter-5', '겨울 안개',     '겨울', [['#D5DCE0', 0], ['#7B8590', 100]]),
  // 풍경 (6)
  P('k-scape-1',  '설악산 능선',   '풍경', [['#7B96B8', 0], ['#5C7290', 50], ['#384866', 100]]),
  P('k-scape-2',  '청보리밭',      '풍경', [['#D5EE9B', 0], ['#88C56E', 50], ['#3A7A48', 100]]),
  P('k-scape-3',  '메밀꽃',        '풍경', [['#FFFFFF', 0], ['#E5DCEB', 50], ['#9883B5', 100]]),
  P('k-scape-4',  '서해 갯벌',     '풍경', [['#D5BFA5', 0], ['#A88E70', 50], ['#5C4A35', 100]]),
  P('k-scape-5',  '낙동강',        '풍경', [['#A8C5D8', 0], ['#5C8BA0', 50], ['#2C4860', 100]]),
  P('k-scape-6',  '월출봉',        '풍경', [['#FFAB7B', 0], ['#5C2C7B', 100]]),
  // 트렌드 무드 (10)
  P('k-trend-1',  'Y2K 핑크',      '트렌드', [['#FF8AC8', 0], ['#A8E0FF', 100]]),
  P('k-trend-2',  '소프트 파스텔', '트렌드', [['#FFD9D9', 0], ['#D9E0FF', 50], ['#D9FFD9', 100]]),
  P('k-trend-3',  '로파이 무드',   '트렌드', [['#FFB78A', 0], ['#A88AC8', 50], ['#5C4A85', 100]]),
  P('k-trend-4',  '뉴진스 톤',     '트렌드', [['#A8E5FF', 0], ['#FFB7DC', 50], ['#FFE08A', 100]]),
  P('k-trend-5',  'K-인디고',      '트렌드', [['#384AAB', 0], ['#1A2466', 100]]),
  P('k-trend-6',  '복고 라떼',     '트렌드', [['#E8D5B5', 0], ['#A88E70', 50], ['#5C4A35', 100]]),
  P('k-trend-7',  '청량 민트',     '트렌드', [['#A8F5D5', 0], ['#5FBFA8', 100]]),
  P('k-trend-8',  '보랏빛 새벽',   '트렌드', [['#7B82A8', 0], ['#A88AC8', 50], ['#FFB7DC', 100]]),
  P('k-trend-9',  '레트로 게임',   '트렌드', [['#DC2626', 0], ['#FFB938', 50], ['#5BC85B', 100]]),
  P('k-trend-10', '인디 무드',     '트렌드', [['#5C2C7B', 0], ['#C73838', 50], ['#FFAB7B', 100]]),
]

/* 글로벌 트렌드 — 잘 알려진 디자인 시스템 풍 (직접 해석) */
export const GLOBAL_PRESETS: Preset[] = [
  // 메쉬 / 부드러운 (5)
  P('g-mesh-1',  '소프트 메쉬 1',   '부드러운', [['#FFC1CC', 0], ['#A0C4FF', 50], ['#BDB2FF', 100]]),
  P('g-mesh-2',  '소프트 메쉬 2',   '부드러운', [['#FFE5D9', 0], ['#FFDDD2', 100]]),
  P('g-mesh-3',  '미스트 블루',     '부드러운', [['#E0F4FF', 0], ['#A8D5F0', 100]]),
  P('g-mesh-4',  '라일락',          '부드러운', [['#E5D4F1', 0], ['#C9B6E0', 100]]),
  P('g-mesh-5',  '베이지',          '부드러운', [['#F5E8D5', 0], ['#E5D0AB', 100]]),
  // Vapor / Retro (5)
  P('g-vapor-1', 'Vaporwave',       'Retro',   [['#FF71CE', 0], ['#01CDFE', 100]]),
  P('g-vapor-2', 'Sunset 80s',      'Retro',   [['#FF6E7F', 0], ['#BFE9FF', 100]]),
  P('g-vapor-3', 'Synthwave',       'Retro',   [['#5F4B8B', 0], ['#E11D48', 50], ['#FFB938', 100]]),
  P('g-vapor-4', 'Outrun',          'Retro',   [['#FF4D8D', 0], ['#5E2A84', 50], ['#1B1464', 100]]),
  P('g-vapor-5', 'Miami',           'Retro',   [['#FF6F91', 0], ['#FFC75F', 100]]),
  // Modern UI (10)
  P('g-ui-1',    'Stripe 풍',        'UI 그라디언트', [['#A8FF78', 0], ['#78FFD6', 100]]),
  P('g-ui-2',    'Cosmic Fusion',    'UI 그라디언트', [['#FF00CC', 0], ['#333399', 100]]),
  P('g-ui-3',    'Royal',            'UI 그라디언트', [['#536976', 0], ['#292E49', 100]]),
  P('g-ui-4',    'Mojito',           'UI 그라디언트', [['#1D976C', 0], ['#93F9B9', 100]]),
  P('g-ui-5',    'Ocean View',       'UI 그라디언트', [['#1CB5E0', 0], ['#000046', 100]]),
  P('g-ui-6',    'Sunset Vibes',     'UI 그라디언트', [['#FF512F', 0], ['#F09819', 100]]),
  P('g-ui-7',    'Purple Bliss',     'UI 그라디언트', [['#360033', 0], ['#0B8793', 100]]),
  P('g-ui-8',    'Aqua Marine',      'UI 그라디언트', [['#1A2980', 0], ['#26D0CE', 100]]),
  P('g-ui-9',    'Citrus Peel',      'UI 그라디언트', [['#FDC830', 0], ['#F37335', 100]]),
  P('g-ui-10',   'Deep Space',       'UI 그라디언트', [['#000000', 0], ['#434343', 100]]),
  // Pastel / Dreamy (8)
  P('g-pastel-1', '코튼 캔디',       '파스텔', [['#FFE0EC', 0], ['#D4E4FF', 100]]),
  P('g-pastel-2', '민트 크림',       '파스텔', [['#D4F4E2', 0], ['#A8E6CF', 100]]),
  P('g-pastel-3', '버터플라이',      '파스텔', [['#F5D4E5', 0], ['#E5C4F0', 100]]),
  P('g-pastel-4', '바닐라 스카이',   '파스텔', [['#FFF3D4', 0], ['#FFD4E5', 100]]),
  P('g-pastel-5', '드림 클라우드',   '파스텔', [['#E5E0FF', 0], ['#FFE5F5', 100]]),
  P('g-pastel-6', '만개한 봄',       '파스텔', [['#FCE4EC', 0], ['#E1BEE7', 50], ['#C5CAE9', 100]]),
  P('g-pastel-7', '아이스 라떼',     '파스텔', [['#F5E6D3', 0], ['#D4C5B0', 100]]),
  P('g-pastel-8', '베이비 블루',     '파스텔', [['#E0F2FF', 0], ['#B5E0FF', 100]]),
]

export const ALL_PRESETS = [...KOREAN_PRESETS, ...GLOBAL_PRESETS]

/** Preset → GradientConfig 변환 */
export function presetToConfig(p: Preset, defaultSpace: ColorSpace = 'oklch'): Pick<GradientConfig, 'type' | 'angle' | 'space' | 'stops' | 'shape'> {
  return {
    type:  p.type ?? 'linear',
    angle: p.angle ?? 135,
    space: p.space ?? defaultSpace,
    shape: 'circle',
    stops: p.stops.map(([hex, pos]) => makeStop(hex, pos)),
  }
}

/* ───────── 즐겨찾기 (localStorage) ───────── */
const FAV_KEY = 'youtil:gradient-favs:v1'

export type FavItem = {
  id: string
  name: string
  config: GradientConfig
  savedAt: number
}

/* 저장 항목 구조 검증 — 무검증 복원은 corrupt 시 렌더 크래시 (localStorage 크래시 재발 클래스) */
const VALID_TYPES: GradientType[] = ['linear', 'radial', 'conic', 'mesh', 'repeating-linear', 'repeating-radial']
const VALID_SPACES: ColorSpace[] = ['rgb', 'hsl', 'oklch', 'lab']
const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)

function isValidFav(item: unknown): item is FavItem {
  if (typeof item !== 'object' || item === null) return false
  const f = item as Partial<FavItem>
  if (typeof f.id !== 'string' || typeof f.name !== 'string') return false
  const c = f.config as Partial<GradientConfig> | undefined
  if (!c || typeof c !== 'object') return false
  if (!VALID_TYPES.includes(c.type as GradientType)) return false
  if (!VALID_SPACES.includes(c.space as ColorSpace)) return false
  if (typeof c.angle !== 'number' || !Number.isFinite(c.angle)) return false
  if (!Array.isArray(c.stops) || c.stops.length < 1 || c.stops.length > 8) return false
  if (!c.stops.every((s) => s && isHex((s as Stop).hex) && typeof (s as Stop).pos === 'number' && (s as Stop).pos >= 0 && (s as Stop).pos <= 100)) return false
  if (c.mesh !== undefined && !(c.mesh && isHex(c.mesh.tl) && isHex(c.mesh.tr) && isHex(c.mesh.bl) && isHex(c.mesh.br))) return false
  return true
}

export function loadFavs(): FavItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isValidFav)
      .map((f) => ({
        ...f,
        // 구버전 필드 보정 (shape·noise 누락 시 기본값)
        config: { ...f.config, shape: f.config.shape ?? 'circle', noise: typeof f.config.noise === 'number' ? f.config.noise : 0 },
      }))
      .slice(0, 30)
  } catch { return [] }
}
export function saveFavs(favs: FavItem[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favs.slice(0, 30))) } catch { /* quota */ }
}

/* ───────── PNG/SVG 내보내기 ───────── */
export async function downloadGradientPng(cfg: GradientConfig, w: number, h: number, withNoise: boolean): Promise<void> {
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  if (cfg.type === 'mesh' && cfg.mesh) {
    // 4 모서리 radial 합성
    const { tl, tr, bl, br } = cfg.mesh
    ctx.fillStyle = tl
    ctx.fillRect(0, 0, w, h)
    // source-over 유지 — 'lighter' 가산 합성은 CSS·SVG(normal)와 다른 밝기를 만든다
    const cs: Array<[string, number, number]> = [[tl, 0, 0], [tr, w, 0], [bl, 0, h], [br, w, h]]
    for (const [color, x, y] of cs) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.7)
      grad.addColorStop(0, color)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    }
  } else {
    const isRep = cfg.type === 'repeating-linear' || cfg.type === 'repeating-radial'
    const srcStops = isRep ? normalizeStops(cfg.stops) : cfg.stops
    let dense = cfg.space === 'rgb'
      ? [...srcStops].sort((a, b) => a.pos - b.pos).map((s) => ({ rgb: hexToRgb(s.hex) ?? { r: 0, g: 0, b: 0 }, pos: s.pos }))
      : gradientColors(srcStops, cfg.space, 32)
    // repeating: canvas 그라디언트에는 반복이 없어 싸이클을 직접 타일링
    if (isRep) {
      const cycle = cycleOf(cfg)
      const tiled: typeof dense = []
      for (let k = 0; k * cycle < 100; k++) {
        for (const d of dense) {
          const pos = k * cycle + (d.pos / 100) * cycle
          if (pos <= 100) tiled.push({ rgb: d.rgb, pos })
        }
      }
      dense = tiled
    }
    if (cfg.type === 'linear' || cfg.type === 'repeating-linear') {
      const rad = ((cfg.angle - 90) * Math.PI) / 180
      const cx = w / 2, cy = h / 2
      const len = Math.abs(Math.cos(rad)) * w / 2 + Math.abs(Math.sin(rad)) * h / 2
      const x1 = cx - Math.cos(rad) * len
      const y1 = cy - Math.sin(rad) * len
      const x2 = cx + Math.cos(rad) * len
      const y2 = cy + Math.sin(rad) * len
      const grad = ctx.createLinearGradient(x1, y1, x2, y2)
      dense.forEach((d) => grad.addColorStop(Math.min(1, Math.max(0, d.pos / 100)), rgbToHex(d.rgb)))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)
    } else if (cfg.type === 'radial' || cfg.type === 'repeating-radial') {
      // CSS 기본 크기 = farthest-corner. circle은 대각 반경, ellipse는 rx=w/√2·ry=h/√2 (scale 변환)
      if (cfg.shape === 'ellipse') {
        const rx = (w / 2) * Math.SQRT2
        const ry = (h / 2) * Math.SQRT2
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.scale(1, ry / rx)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx)
        dense.forEach((d) => grad.addColorStop(Math.min(1, Math.max(0, d.pos / 100)), rgbToHex(d.rgb)))
        ctx.fillStyle = grad
        ctx.fillRect(-w / 2, (-h / 2) * (rx / ry), w, h * (rx / ry))
        ctx.restore()
      } else {
        const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w / 2, h / 2))
        dense.forEach((d) => grad.addColorStop(Math.min(1, Math.max(0, d.pos / 100)), rgbToHex(d.rgb)))
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }
    } else if (cfg.type === 'conic') {
      // Canvas conic은 createConicGradient (모던 브라우저)
      // 폴백: 라디얼로
      try {
        type ConicCtx = { createConicGradient?: (a: number, x: number, y: number) => CanvasGradient }
        const cgFn = (ctx as unknown as ConicCtx).createConicGradient
        if (typeof cgFn === 'function') {
          // canvas conic은 3시 방향 시작, CSS conic-gradient는 12시 시작 — 90° 보정
          const grad = cgFn.call(ctx, ((cfg.angle - 90) * Math.PI) / 180, w / 2, h / 2)
          dense.forEach((d) => grad.addColorStop(Math.min(1, Math.max(0, d.pos / 100)), rgbToHex(d.rgb)))
          ctx.fillStyle = grad
          ctx.fillRect(0, 0, w, h)
        } else {
          ctx.fillStyle = rgbToHex(dense[0].rgb)
          ctx.fillRect(0, 0, w, h)
        }
      } catch {
        // fallback
        ctx.fillStyle = rgbToHex(dense[0].rgb)
        ctx.fillRect(0, 0, w, h)
      }
    }
  }

  // 노이즈 (optional)
  if (withNoise && cfg.noise > 0) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const intensity = (cfg.noise / 100) * 32
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * intensity
      data[i]     = Math.max(0, Math.min(255, data[i] + n))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
    }
    ctx.putImageData(imageData, 0, 0)
  }

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gradient-${w}x${h}.png`
      a.click()
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}

export function downloadGradientSvg(cfg: GradientConfig, w: number, h: number, withNoise = false) {
  const svg = exportSvg(cfg, w, h, { noise: withNoise ? cfg.noise : 0 })
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gradient-${w}x${h}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

/* ───────── 이미지 → 5색 추출 (간단 K-means) ───────── */
export async function extractColorsFromImage(file: File, k = 5): Promise<string[]> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image()
    im.onload = () => resolve(im)
    im.onerror = reject
    im.src = URL.createObjectURL(file)
  })
  // 작은 사이즈로 다운샘플링
  const W = 80
  const H = Math.round((img.height / img.width) * W)
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return []
  ctx.drawImage(img, 0, 0, W, H)
  URL.revokeObjectURL(img.src)
  const data = ctx.getImageData(0, 0, W, H).data
  const pixels: RGB[] = []
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
  }
  if (pixels.length === 0) return []

  // K-means (랜덤 시드 X — 결정론적: pixels에서 균등 간격 선택)
  const centroids: RGB[] = []
  for (let i = 0; i < k; i++) {
    centroids.push({ ...pixels[Math.floor((i / k) * pixels.length)] })
  }
  for (let iter = 0; iter < 8; iter++) {
    const sums = Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0, n: 0 }))
    for (const p of pixels) {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < k; c++) {
        const dr = p.r - centroids[c].r
        const dg = p.g - centroids[c].g
        const db = p.b - centroids[c].b
        const d = dr * dr + dg * dg + db * db
        if (d < bestD) { bestD = d; best = c }
      }
      sums[best].r += p.r; sums[best].g += p.g; sums[best].b += p.b; sums[best].n++
    }
    for (let c = 0; c < k; c++) {
      if (sums[c].n > 0) {
        centroids[c] = {
          r: Math.round(sums[c].r / sums[c].n),
          g: Math.round(sums[c].g / sums[c].n),
          b: Math.round(sums[c].b / sums[c].n),
        }
      }
    }
  }
  // 명도순 정렬
  return centroids
    .sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b))
    .map((rgb) => rgbToHex(rgb))
}
