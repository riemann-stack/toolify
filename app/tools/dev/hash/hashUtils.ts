/* 해시 생성기 — 데이터·계산 유틸
   MD5: RFC 1321 순수 JS 구현 (의존성 없음)
   SHA-1/256/384/512: Web Crypto API
   HMAC: Web Crypto API */

export type AlgorithmId = 'md5' | 'sha1' | 'sha256' | 'sha512'
export type HmacAlgorithmId = 'sha1' | 'sha256' | 'sha384' | 'sha512'
export type Safety = 'safe' | 'integrity' | 'unsafe'
export type OutputFormat = 'hex_lower' | 'hex_upper' | 'base64' | 'base64url'
export type TextEncoding = 'utf8' | 'ascii'
export type KeyFormat = 'text' | 'base64' | 'hex'

/* ─────────────────────────────────────────────
   알고리즘 메타
   ───────────────────────────────────────────── */
export interface AlgorithmMeta {
  id: AlgorithmId | HmacAlgorithmId
  name: string
  bits: number
  hexLen: number
  safety: Safety
  badgeLabel: string
  badgeColor: string
  description: string
  useCases: string
  speed: string
}

export const ALGORITHMS: AlgorithmMeta[] = [
  {
    id: 'md5',
    name: 'MD5',
    bits: 128,
    hexLen: 32,
    safety: 'integrity',
    badgeLabel: '🟡 무결성 전용',
    badgeColor: '#D97706',
    description: '1992년 발표, 2004년 충돌 공격 발견. 빠르지만 보안 부적합.',
    useCases: '체크섬, 캐시 버스팅, 중복 검출',
    speed: '매우 빠름',
  },
  {
    id: 'sha1',
    name: 'SHA-1',
    bits: 160,
    hexLen: 40,
    safety: 'integrity',
    badgeLabel: '🟡 무결성 전용',
    badgeColor: '#D97706',
    description: '1995년 발표, 2017년 SHAttered 충돌 시연. 디지털 서명 부적합.',
    useCases: 'Git 커밋 ID, 레거시 호환, HMAC-SHA1',
    speed: '빠름',
  },
  {
    id: 'sha256',
    name: 'SHA-256',
    bits: 256,
    hexLen: 64,
    safety: 'safe',
    badgeLabel: '🟢 안전 (권장)',
    badgeColor: '#0D9488',
    description: 'SHA-2 계열. 현재 가장 널리 쓰이는 안전한 해시. NIST 표준.',
    useCases: 'HTTPS, 블록체인, JWT, SRI, 디지털 서명',
    speed: '빠름',
  },
  {
    id: 'sha512',
    name: 'SHA-512',
    bits: 512,
    hexLen: 128,
    safety: 'safe',
    badgeLabel: '🟢 안전',
    badgeColor: '#0D9488',
    description: 'SHA-2 계열 512bit. 64bit 시스템에서 SHA-256보다 빠름.',
    useCases: '고보안 디지털 서명, 금융, 정부 표준',
    speed: '64bit 시스템에서 SHA-256보다 빠름',
  },
]

export const HMAC_ALGORITHMS: AlgorithmMeta[] = [
  { id: 'sha1', name: 'HMAC-SHA1', bits: 160, hexLen: 40, safety: 'integrity', badgeLabel: '🟡 레거시', badgeColor: '#D97706', description: 'AWS Signature V2 등 레거시.', useCases: '레거시 API', speed: '빠름' },
  { id: 'sha256', name: 'HMAC-SHA256', bits: 256, hexLen: 64, safety: 'safe', badgeLabel: '🟢 표준', badgeColor: '#0D9488', description: '가장 널리 쓰이는 HMAC. JWT HS256, AWS V4, 웹훅 표준.', useCases: 'GitHub/Slack 웹훅, JWT, AWS', speed: '빠름' },
  { id: 'sha384', name: 'HMAC-SHA384', bits: 384, hexLen: 96, safety: 'safe', badgeLabel: '🟢 안전', badgeColor: '#0D9488', description: 'JWT HS384, 고보안 토큰.', useCases: 'JWT HS384, 고보안 인증', speed: '빠름' },
  { id: 'sha512', name: 'HMAC-SHA512', bits: 512, hexLen: 128, safety: 'safe', badgeLabel: '🟢 고보안', badgeColor: '#0D9488', description: '최강 보안 HMAC. JWT HS512.', useCases: 'JWT HS512, 금융·정부', speed: '64bit 시스템 빠름' },
]

export const getAlgorithm = (id: AlgorithmId): AlgorithmMeta =>
  ALGORITHMS.find((a) => a.id === id) ?? ALGORITHMS[2]

export const getHmacAlgorithm = (id: HmacAlgorithmId): AlgorithmMeta =>
  HMAC_ALGORITHMS.find((a) => a.id === id) ?? HMAC_ALGORITHMS[1]

/* ─────────────────────────────────────────────
   웹훅·API 시나리오
   ───────────────────────────────────────────── */
export interface WebhookPreset {
  id: string
  emoji: string
  name: string
  algorithm: HmacAlgorithmId
  format: OutputFormat
  header?: string
  desc: string
  example: string
}

export const WEBHOOK_PRESETS: WebhookPreset[] = [
  {
    id: 'github', emoji: '🐙', name: 'GitHub Webhook',
    algorithm: 'sha256', format: 'hex_lower',
    header: 'X-Hub-Signature-256: sha256=<hex>',
    desc: 'GitHub 웹훅 페이로드 서명 검증',
    example: 'GitHub 저장소 Settings → Webhooks → Secret 입력 후 푸시 이벤트 시 헤더로 전송됨',
  },
  {
    id: 'slack', emoji: '💬', name: 'Slack Signing',
    algorithm: 'sha256', format: 'hex_lower',
    header: 'X-Slack-Signature: v0=<hex>',
    desc: 'Slack 슬래시 명령·이벤트 검증',
    example: 'Signing Secret + 타임스탬프 + 본문 = HMAC. 5분 이내 요청만 유효',
  },
  {
    id: 'aws', emoji: '☁️', name: 'AWS Signature V4',
    algorithm: 'sha256', format: 'hex_lower',
    desc: 'AWS API 요청 인증 (S3·DynamoDB 등)',
    example: '4단계 KDF: kDate → kRegion → kService → kSigning → 최종 서명',
  },
  {
    id: 'jwt_hs256', emoji: '🎫', name: 'JWT HS256',
    algorithm: 'sha256', format: 'base64url',
    desc: 'JSON Web Token HS256 서명',
    example: 'header.payload (Base64URL) → HMAC-SHA256 → Base64URL 서명. JWT 토큰 마지막 부분',
  },
]

/* ─────────────────────────────────────────────
   포맷 변환
   ───────────────────────────────────────────── */
export function bufToHex(buf: ArrayBuffer, upper = false): string {
  const arr = new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < arr.length; i++) {
    hex += arr[i].toString(16).padStart(2, '0')
  }
  return upper ? hex.toUpperCase() : hex
}

export function bufToBase64(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i])
  return btoa(bin)
}

export function bufToBase64Url(buf: ArrayBuffer): string {
  return bufToBase64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function hexToBuf(hex: string): ArrayBuffer {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '')
  if (clean.length % 2 !== 0) throw new Error('hex 길이가 짝수가 아님')
  const arr = new Uint8Array(clean.length / 2)
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(clean.substr(i * 2, 2), 16)
  }
  return arr.buffer
}

export function base64ToBuf(b64: string): ArrayBuffer {
  /* Base64URL → Base64 정규화 */
  const norm = b64.replace(/-/g, '+').replace(/_/g, '/')
  const pad = norm.length % 4 === 0 ? norm : norm + '='.repeat(4 - (norm.length % 4))
  const bin = atob(pad)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr.buffer
}

export function formatHash(buf: ArrayBuffer, format: OutputFormat): string {
  switch (format) {
    case 'hex_lower':  return bufToHex(buf, false)
    case 'hex_upper':  return bufToHex(buf, true)
    case 'base64':     return bufToBase64(buf)
    case 'base64url':  return bufToBase64Url(buf)
  }
}

export function compareHashes(a: string, b: string): boolean {
  /* hex 비교: 대소문자·공백·콜론·하이픈 무시 */
  const norm = (s: string) => s.replace(/[^0-9a-fA-F]/g, '').toLowerCase()
  return norm(a).length > 0 && norm(a) === norm(b)
}

/** 텍스트 인코딩 */
export function encodeText(text: string, encoding: TextEncoding): ArrayBuffer {
  if (encoding === 'ascii') {
    /* 0x7F 초과는 ?로 대체 */
    const arr = new Uint8Array(text.length)
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i)
      arr[i] = c > 0x7F ? 0x3F : c
    }
    return arr.buffer
  }
  return new TextEncoder().encode(text).buffer as ArrayBuffer
}

/** Key 입력 형식 → ArrayBuffer */
export function parseKey(key: string, format: KeyFormat): ArrayBuffer {
  if (format === 'text') return new TextEncoder().encode(key).buffer as ArrayBuffer
  if (format === 'hex') return hexToBuf(key)
  return base64ToBuf(key)
}

/* ═════════════════════════════════════════════
   해시 함수
   ═════════════════════════════════════════════ */

export async function hashText(
  text: string,
  algorithm: AlgorithmId,
  encoding: TextEncoding = 'utf8',
): Promise<ArrayBuffer> {
  const data = encodeText(text, encoding)
  if (algorithm === 'md5') return md5Buffer(data)
  const subtleAlg = algorithm === 'sha1' ? 'SHA-1' : algorithm === 'sha256' ? 'SHA-256' : 'SHA-512'
  return crypto.subtle.digest(subtleAlg, data)
}

export async function hashBuffer(
  data: ArrayBuffer,
  algorithm: AlgorithmId,
): Promise<ArrayBuffer> {
  if (algorithm === 'md5') return md5Buffer(data)
  const subtleAlg = algorithm === 'sha1' ? 'SHA-1' : algorithm === 'sha256' ? 'SHA-256' : 'SHA-512'
  return crypto.subtle.digest(subtleAlg, data)
}

/** 파일 해시 — MD5는 청크, SHA는 한 번 (Web Crypto가 스트리밍 미지원) */
export async function hashFile(
  file: File,
  algorithm: AlgorithmId,
  onProgress?: (pct: number) => void,
): Promise<ArrayBuffer> {
  if (algorithm === 'md5') {
    /* 청크 처리 (8MB 단위) */
    const CHUNK = 8 * 1024 * 1024
    const md = new Md5State()
    let offset = 0
    while (offset < file.size) {
      const blob = file.slice(offset, Math.min(offset + CHUNK, file.size))
      const buf = await blob.arrayBuffer()
      md.update(new Uint8Array(buf))
      offset += CHUNK
      if (onProgress) onProgress(Math.min(100, (offset / file.size) * 100))
      /* UI 업데이트 보장 */
      await new Promise((r) => setTimeout(r, 0))
    }
    if (onProgress) onProgress(100)
    return md.finalize()
  }
  /* SHA: 한 번에 (FileReader → ArrayBuffer) */
  if (onProgress) onProgress(10)
  const data = await file.arrayBuffer()
  if (onProgress) onProgress(60)
  const subtleAlg = algorithm === 'sha1' ? 'SHA-1' : algorithm === 'sha256' ? 'SHA-256' : 'SHA-512'
  const result = await crypto.subtle.digest(subtleAlg, data)
  if (onProgress) onProgress(100)
  return result
}

/** HMAC 서명 */
export async function hmacSign(
  keyBuf: ArrayBuffer,
  messageBuf: ArrayBuffer,
  algorithm: HmacAlgorithmId,
): Promise<ArrayBuffer> {
  const subtleAlg =
    algorithm === 'sha1' ? 'SHA-1' :
    algorithm === 'sha256' ? 'SHA-256' :
    algorithm === 'sha384' ? 'SHA-384' : 'SHA-512'
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBuf,
    { name: 'HMAC', hash: subtleAlg },
    false, ['sign'],
  )
  return crypto.subtle.sign('HMAC', cryptoKey, messageBuf)
}

/* ═════════════════════════════════════════════
   MD5 (RFC 1321) — 순수 JS 구현
   chunked update + finalize 패턴
   ═════════════════════════════════════════════ */

class Md5State {
  private h0 = 0x67452301
  private h1 = 0xefcdab89
  private h2 = 0x98badcfe
  private h3 = 0x10325476
  private buffer: Uint8Array = new Uint8Array(0)
  private byteCount = 0
  private finalized = false

  update(data: Uint8Array): void {
    if (this.finalized) throw new Error('Md5 already finalized')
    this.byteCount += data.length
    /* 64 byte 블록 단위 처리 */
    let combined: Uint8Array
    if (this.buffer.length > 0) {
      combined = new Uint8Array(this.buffer.length + data.length)
      combined.set(this.buffer, 0)
      combined.set(data, this.buffer.length)
    } else {
      combined = data
    }
    let i = 0
    while (i + 64 <= combined.length) {
      this.processBlock(combined, i)
      i += 64
    }
    /* 남은 부분 보관 */
    this.buffer = combined.slice(i)
  }

  finalize(): ArrayBuffer {
    if (this.finalized) throw new Error('Md5 already finalized')
    this.finalized = true
    /* 패딩: 0x80 + zeros + 길이(64bit, little-endian) */
    const remain = this.buffer.length
    const padLen = remain < 56 ? 56 - remain : 120 - remain
    const padded = new Uint8Array(remain + padLen + 8)
    padded.set(this.buffer, 0)
    padded[remain] = 0x80
    /* 비트 길이 (little-endian 64bit) */
    const bitLen = this.byteCount * 8
    const bitLenLow = bitLen >>> 0
    const bitLenHigh = Math.floor(this.byteCount / 0x20000000)  /* >>> 29 */
    const lenOffset = remain + padLen
    padded[lenOffset]     = bitLenLow & 0xff
    padded[lenOffset + 1] = (bitLenLow >>> 8) & 0xff
    padded[lenOffset + 2] = (bitLenLow >>> 16) & 0xff
    padded[lenOffset + 3] = (bitLenLow >>> 24) & 0xff
    padded[lenOffset + 4] = bitLenHigh & 0xff
    padded[lenOffset + 5] = (bitLenHigh >>> 8) & 0xff
    padded[lenOffset + 6] = (bitLenHigh >>> 16) & 0xff
    padded[lenOffset + 7] = (bitLenHigh >>> 24) & 0xff
    for (let i = 0; i < padded.length; i += 64) {
      this.processBlock(padded, i)
    }
    /* 결과: little-endian */
    const out = new ArrayBuffer(16)
    const view = new DataView(out)
    view.setUint32(0, this.h0, true)
    view.setUint32(4, this.h1, true)
    view.setUint32(8, this.h2, true)
    view.setUint32(12, this.h3, true)
    return out
  }

  private processBlock(data: Uint8Array, offset: number): void {
    const x = new Array(16)
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4
      x[i] = (data[j] | (data[j + 1] << 8) | (data[j + 2] << 16) | (data[j + 3] << 24)) >>> 0
    }
    let a = this.h0, b = this.h1, c = this.h2, d = this.h3

    /* Round 1 */
    a = ff(a, b, c, d, x[0],  7,  0xd76aa478)
    d = ff(d, a, b, c, x[1],  12, 0xe8c7b756)
    c = ff(c, d, a, b, x[2],  17, 0x242070db)
    b = ff(b, c, d, a, x[3],  22, 0xc1bdceee)
    a = ff(a, b, c, d, x[4],  7,  0xf57c0faf)
    d = ff(d, a, b, c, x[5],  12, 0x4787c62a)
    c = ff(c, d, a, b, x[6],  17, 0xa8304613)
    b = ff(b, c, d, a, x[7],  22, 0xfd469501)
    a = ff(a, b, c, d, x[8],  7,  0x698098d8)
    d = ff(d, a, b, c, x[9],  12, 0x8b44f7af)
    c = ff(c, d, a, b, x[10], 17, 0xffff5bb1)
    b = ff(b, c, d, a, x[11], 22, 0x895cd7be)
    a = ff(a, b, c, d, x[12], 7,  0x6b901122)
    d = ff(d, a, b, c, x[13], 12, 0xfd987193)
    c = ff(c, d, a, b, x[14], 17, 0xa679438e)
    b = ff(b, c, d, a, x[15], 22, 0x49b40821)

    /* Round 2 */
    a = gg(a, b, c, d, x[1],  5,  0xf61e2562)
    d = gg(d, a, b, c, x[6],  9,  0xc040b340)
    c = gg(c, d, a, b, x[11], 14, 0x265e5a51)
    b = gg(b, c, d, a, x[0],  20, 0xe9b6c7aa)
    a = gg(a, b, c, d, x[5],  5,  0xd62f105d)
    d = gg(d, a, b, c, x[10], 9,  0x02441453)
    c = gg(c, d, a, b, x[15], 14, 0xd8a1e681)
    b = gg(b, c, d, a, x[4],  20, 0xe7d3fbc8)
    a = gg(a, b, c, d, x[9],  5,  0x21e1cde6)
    d = gg(d, a, b, c, x[14], 9,  0xc33707d6)
    c = gg(c, d, a, b, x[3],  14, 0xf4d50d87)
    b = gg(b, c, d, a, x[8],  20, 0x455a14ed)
    a = gg(a, b, c, d, x[13], 5,  0xa9e3e905)
    d = gg(d, a, b, c, x[2],  9,  0xfcefa3f8)
    c = gg(c, d, a, b, x[7],  14, 0x676f02d9)
    b = gg(b, c, d, a, x[12], 20, 0x8d2a4c8a)

    /* Round 3 */
    a = hh(a, b, c, d, x[5],  4,  0xfffa3942)
    d = hh(d, a, b, c, x[8],  11, 0x8771f681)
    c = hh(c, d, a, b, x[11], 16, 0x6d9d6122)
    b = hh(b, c, d, a, x[14], 23, 0xfde5380c)
    a = hh(a, b, c, d, x[1],  4,  0xa4beea44)
    d = hh(d, a, b, c, x[4],  11, 0x4bdecfa9)
    c = hh(c, d, a, b, x[7],  16, 0xf6bb4b60)
    b = hh(b, c, d, a, x[10], 23, 0xbebfbc70)
    a = hh(a, b, c, d, x[13], 4,  0x289b7ec6)
    d = hh(d, a, b, c, x[0],  11, 0xeaa127fa)
    c = hh(c, d, a, b, x[3],  16, 0xd4ef3085)
    b = hh(b, c, d, a, x[6],  23, 0x04881d05)
    a = hh(a, b, c, d, x[9],  4,  0xd9d4d039)
    d = hh(d, a, b, c, x[12], 11, 0xe6db99e5)
    c = hh(c, d, a, b, x[15], 16, 0x1fa27cf8)
    b = hh(b, c, d, a, x[2],  23, 0xc4ac5665)

    /* Round 4 */
    a = ii(a, b, c, d, x[0],  6,  0xf4292244)
    d = ii(d, a, b, c, x[7],  10, 0x432aff97)
    c = ii(c, d, a, b, x[14], 15, 0xab9423a7)
    b = ii(b, c, d, a, x[5],  21, 0xfc93a039)
    a = ii(a, b, c, d, x[12], 6,  0x655b59c3)
    d = ii(d, a, b, c, x[3],  10, 0x8f0ccc92)
    c = ii(c, d, a, b, x[10], 15, 0xffeff47d)
    b = ii(b, c, d, a, x[1],  21, 0x85845dd1)
    a = ii(a, b, c, d, x[8],  6,  0x6fa87e4f)
    d = ii(d, a, b, c, x[15], 10, 0xfe2ce6e0)
    c = ii(c, d, a, b, x[6],  15, 0xa3014314)
    b = ii(b, c, d, a, x[13], 21, 0x4e0811a1)
    a = ii(a, b, c, d, x[4],  6,  0xf7537e82)
    d = ii(d, a, b, c, x[11], 10, 0xbd3af235)
    c = ii(c, d, a, b, x[2],  15, 0x2ad7d2bb)
    b = ii(b, c, d, a, x[9],  21, 0xeb86d391)

    this.h0 = (this.h0 + a) >>> 0
    this.h1 = (this.h1 + b) >>> 0
    this.h2 = (this.h2 + c) >>> 0
    this.h3 = (this.h3 + d) >>> 0
  }
}

/* MD5 round helper functions */
function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0
}
function add32(...args: number[]): number {
  let s = 0
  for (const a of args) s = (s + a) >>> 0
  return s
}
function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return (add32(b, rotl(add32(a, (b & c) | (~b & d), x, t), s)))
}
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return (add32(b, rotl(add32(a, (b & d) | (c & ~d), x, t), s)))
}
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return (add32(b, rotl(add32(a, b ^ c ^ d, x, t), s)))
}
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return (add32(b, rotl(add32(a, c ^ (b | ~d), x, t), s)))
}

/** 단일 호출 MD5 */
export function md5Buffer(data: ArrayBuffer): ArrayBuffer {
  const md = new Md5State()
  md.update(new Uint8Array(data))
  return md.finalize()
}

/* ═════════════════════════════════════════════
   포맷 헬퍼
   ═════════════════════════════════════════════ */

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function countBytes(text: string, encoding: TextEncoding): number {
  if (encoding === 'utf8') return new TextEncoder().encode(text).length
  return text.length  /* ASCII */
}
