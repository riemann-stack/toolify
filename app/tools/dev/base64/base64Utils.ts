// Base64 도구 순수 로직 — 디코딩 결과 판별·JWT 시간 표시

export type B64Decoded =
  | { ok: true; text: string; bytes: Uint8Array }
  | { ok: false; reason: 'invalid-b64' }
  | { ok: false; reason: 'not-utf8'; bytes: Uint8Array }

/** Base64 → 바이트 → UTF-8 텍스트.
 *  atob 실패(=Base64 아님)와 UTF-8 해석 실패(=바이너리·EUC-KR 등)를 구분해 돌려준다. */
export function decodeB64(b64: string, urlSafe = false): B64Decoded {
  let cleaned = b64.trim().replace(/\s/g, '')
  if (urlSafe) cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/')
  while (cleaned.length % 4 !== 0) cleaned += '='
  let bin: string
  try {
    bin = atob(cleaned)
  } catch {
    return { ok: false, reason: 'invalid-b64' }
  }
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  try {
    // ignoreBOM: 기존 decodeURIComponent(escape()) 방식처럼 BOM(U+FEFF)도 그대로 보존
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
    return { ok: true, text, bytes }
  } catch {
    return { ok: false, reason: 'not-utf8', bytes }
  }
}

/** 바이트 → 공백 구분 hex (예: "89 50 4e 47") */
export function bytesToHex(bytes: Uint8Array, max = Infinity): string {
  const n = Math.min(bytes.length, max)
  const out: string[] = []
  for (let i = 0; i < n; i++) out.push(bytes[i].toString(16).padStart(2, '0'))
  return out.join(' ')
}

/** 한국 레거시 인코딩(EUC-KR/CP949)으로 읽히면 그 텍스트, 아니면 null */
export function tryDecodeEucKr(bytes: Uint8Array): string | null {
  try {
    const text = new TextDecoder('euc-kr', { fatal: true }).decode(bytes)
    // 제어문자(탭·줄바꿈 제외)가 섞이면 텍스트가 아닌 바이너리로 본다
    return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text) ? null : text
  } catch {
    return null
  }
}

/** epoch 초 → 'YYYY. M. D. 오후 h:mm:ss (KST)'. 0(1970-01-01)도 정상 표시 */
export function fmtTimestamp(ts: number): string {
  if (!Number.isFinite(ts)) return '-'
  const d = new Date(ts * 1000)
  if (Number.isNaN(d.getTime())) return '-'
  return `${d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} (KST)`
}

/** 초 → '30일', '1일 2시간', '5분 3초' (큰 단위 2개까지, 0이면 '0초') */
export function fmtDuration(totalSec: number): string {
  const t = Math.abs(Math.trunc(totalSec))
  const units: [number, string][] = [
    [Math.floor(t / 86400), '일'],
    [Math.floor((t % 86400) / 3600), '시간'],
    [Math.floor((t % 3600) / 60), '분'],
    [t % 60, '초'],
  ]
  const parts = units.filter(([v]) => v > 0).slice(0, 2).map(([v, u]) => `${v.toLocaleString('ko-KR')}${u}`)
  return parts.length ? parts.join(' ') : '0초'
}

/** RFC 7519: 현재 시각이 exp 이상이면 만료 */
export function isJwtExpired(exp: number, nowSec: number): boolean {
  return nowSec >= exp
}
