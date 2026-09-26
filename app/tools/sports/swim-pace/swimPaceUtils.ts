// 수영 페이스 계산기 — Client와 page.tsx(빌드 시 환산표)가 함께 쓰는 상수·파서

// 영법별 참고 계수 (자유형 속도 = 1 기준 · verified=false · 개인차 큼)
export const STROKES = [
  { key: 'free', name: '자유형', coef: 1.0 },
  { key: 'back', name: '배영', coef: 0.9 },
  { key: 'breast', name: '평영', coef: 0.78 },
  { key: 'fly', name: '접영', coef: 0.92 },
] as const

export type StrokeKey = typeof STROKES[number]['key']

export const strokeCoef = (key: StrokeKey): number => STROKES.find(s => s.key === key)!.coef

/** 안내 문구용 — "배영 0.9·평영 0.78·접영 0.92" */
export const STROKE_COEF_TEXT = STROKES.filter(s => s.key !== 'free').map(s => `${s.name} ${s.coef}`).join('·')

/** 총 거리 상한(m) — 오타로 자릿수가 폭주해도 계산이 깨지지 않게 */
export const MAX_DIST_M = 100_000

/** 거리 입력 파싱 — 콤마만 걷어 내고 parseFloat (소수점을 자릿수로 흡수하지 않음) + 상한 클램프 */
export function parseDist(v: string): number {
  const n = parseFloat(v.replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? Math.min(n, MAX_DIST_M) : 0
}

/** 거리 입력칸 표시값 — 정수부 실시간 콤마 + 소수 1자리까지 유지 (입력 중인 "1371." 도 보존) */
export function formatDistInput(v: string): string {
  const clean = v.replace(/[^\d.]/g, '')
  if (!clean) return ''
  const dot = clean.indexOf('.')
  const intDigits = (dot < 0 ? clean : clean.slice(0, dot)).replace(/^0+(?=\d)/, '')
  const frac = dot < 0 ? null : clean.slice(dot + 1).replace(/\./g, '').slice(0, 1)
  const intNum = intDigits ? parseInt(intDigits, 10) : 0
  if (intNum + (frac ? Number(`0.${frac}`) : 0) > MAX_DIST_M) return MAX_DIST_M.toLocaleString('ko-KR')
  const intStr = intDigits ? intNum.toLocaleString('ko-KR') : '0'
  return frac === null ? intStr : `${intStr}.${frac}`
}

/** 초 단위 소수 입력(한 바퀴 시간 등) — 숫자와 점 하나, 소수 1자리까지 */
export function sanitizeDecimal(v: string, maxInt = 3): string {
  const clean = v.replace(/[^\d.]/g, '')
  const dot = clean.indexOf('.')
  if (dot < 0) return clean.slice(0, maxInt)
  return `${clean.slice(0, dot).slice(0, maxInt)}.${clean.slice(dot + 1).replace(/\./g, '').slice(0, 1)}`
}

export function parseDecimal(v: string): number {
  const n = parseFloat(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}
