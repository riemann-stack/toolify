'use client'

import { useEffect, useMemo, useState } from 'react'
import s from '../dev.module.css'
import {
  type Base, type BitWidth, type BitOp,
  isValidInput, normalizeInput, parseBig, parseDecBig, toBase, unsignedMax, signedRange, toUnsigned, padBits,
  applyOp, toggleBit as toggleBitValue, powerOfTwo, decompose, decToBaseSteps,
} from './numberBaseUtils'

// ─────────────────────────────────────────────
// 유틸 (계산은 numberBaseUtils — BigInt 기반)
// ─────────────────────────────────────────────
const B0 = BigInt(0)

// 4비트씩 그룹화 (오른쪽부터)
function groupBinary(b: string): string {
  const reversed = b.split('').reverse().join('')
  const grouped = reversed.match(/.{1,4}/g) || []
  return grouped.map(g => g.split('').reverse().join('')).reverse().join(' ')
}
function groupHex(h: string): string {
  // 2자리씩 그룹화 (바이트 단위)
  const reversed = h.split('').reverse().join('')
  const grouped = reversed.match(/.{1,2}/g) || []
  return grouped.map(g => g.split('').reverse().join('')).reverse().join(' ')
}

// 의미 부여 (자동 학습 코멘트)
function meaningfulNote(dec: bigint): string[] {
  const notes: string[] = []
  const n = dec >= BigInt(Number.MIN_SAFE_INTEGER) && dec <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(dec) : NaN
  if (n === 0) notes.push('0 — 모든 비트가 OFF')
  if (n === 255)  notes.push('255 — 8비트 부호 없는 최대값 (2⁸ − 1)')
  if (n === 65535) notes.push('65,535 — 16비트 부호 없는 최대값 (2¹⁶ − 1)')
  if (dec === unsignedMax(32)) notes.push('4,294,967,295 — 32비트 부호 없는 최대값 (2³² − 1)')
  if (dec === unsignedMax(64)) notes.push('18,446,744,073,709,551,615 — 64비트 부호 없는 최대값 (2⁶⁴ − 1)')
  if (n === 256)  notes.push('256 — 1바이트 다음 값 (2⁸)')
  if (n === 1024) notes.push('1024 — 1KiB 단위 (2¹⁰)')
  if (n === 1_048_576) notes.push('1,048,576 — 1MiB (2²⁰)')
  if (n >= 0x100000 && n <= 16777215) notes.push('0x000000~0xFFFFFF 범위 — RGB 색상 코드로 사용 가능')
  if (n === 127)   notes.push('127 — 8비트 부호 있는 최대값 (2⁷ − 1)')
  if (n === -128)  notes.push('−128 — 8비트 부호 있는 최소값 (−2⁷)')
  // 2의 거듭제곱 일반
  const log = powerOfTwo(dec)
  if (log !== null) notes.push(`정확히 2의 ${log}제곱 (2^${log})`)
  return notes
}

const OP_DESCRIPTION: Record<BitOp, string> = {
  AND: '둘 다 1일 때만 1 — 마스킹·특정 비트 추출',
  OR: '하나라도 1이면 1 — 비트 설정',
  XOR: '다르면 1·같으면 0 — 토글·간단 암호화',
  NOT: '0↔1 반전',
  LSHIFT: '왼쪽으로 이동 — × 2 효과',
  RSHIFT: '오른쪽으로 이동 — ÷ 2 효과',
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function NumberBaseClient() {
  const [tab, setTab] = useState<'convert' | 'bit' | 'ascii' | 'learn'>('convert')

  // ─ TAB 1 ─
  const [fromBase, setFromBase] = useState<Base>(10)
  const [inputValue, setInputValue] = useState<string>('255')
  const [copiedKey, setCopiedKey] = useState<string>('')

  // ─ TAB 2 ─
  const [bitWidth, setBitWidth] = useState<BitWidth>(8)
  const [bitValue, setBitValue] = useState<bigint>(() => BigInt(170)) // 10101010
  const [opA, setOpA] = useState<string>('12')
  const [opB, setOpB] = useState<string>('10')
  const [opShift, setOpShift] = useState<string>('2')
  const [op, setOp] = useState<BitOp>('AND')
  const [tcInput, setTcInput] = useState<string>('-1')

  // ─ TAB 3 ─
  const [textInput, setTextInput] = useState<string>('Hello')
  const [codeInput, setCodeInput] = useState<string>('72 101 108 108 111')
  const [codeBase, setCodeBase] = useState<Base>(10)
  const [showExtended, setShowExtended] = useState<boolean>(false)

  // ─ TAB 4 ─
  const [learnValue, setLearnValue] = useState<string>('1011')
  const [learnFrom, setLearnFrom] = useState<Base>(2)

  // ─────────────────────────────────────────────
  // TAB 1 결과
  // ─────────────────────────────────────────────
  const isInputValid = useMemo(() => isValidInput(inputValue, fromBase), [inputValue, fromBase])
  const decimalValue = useMemo(() => parseBig(inputValue, fromBase), [inputValue, fromBase])

  const conversion = useMemo(() => {
    if (decimalValue === null) return null
    return {
      decimal: decimalValue,
      binary: toBase(decimalValue, 2),
      octal: toBase(decimalValue, 8),
      hex: toBase(decimalValue, 16),
    }
  }, [decimalValue])

  // 의미 부여
  const meanings = useMemo(() => {
    if (decimalValue === null) return []
    return meaningfulNote(decimalValue)
  }, [decimalValue])

  // 색상 코드 가능 여부 (24-bit 범위)
  const isRgbCandidate = useMemo(() => {
    return decimalValue !== null && decimalValue >= B0 && decimalValue <= BigInt(0xFFFFFF)
  }, [decimalValue])

  // ─────────────────────────────────────────────
  // TAB 2: 비트 토글
  // ─────────────────────────────────────────────
  function toggleBit(pos: number) {
    setBitValue(prev => toggleBitValue(prev, pos, bitWidth))
  }
  // 비트 폭을 줄였을 때 넘치는 상위 비트는 버린 값으로 표시
  const bitValueW = toUnsigned(bitValue, bitWidth)

  const bitArray = useMemo(() => {
    return padBits(bitValue, bitWidth).split('')
  }, [bitValue, bitWidth])

  // 좁은 화면에서는 비트 그리드를 8열로 (16열이면 셀이 카드 밖으로 넘침)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 600px)')
    const update = () => setNarrow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // 2의 보수 분석
  const tcParse = useMemo(() => {
    const n = parseDecBig(tcInput)
    if (n === null) return null
    const range = signedRange(bitWidth)
    if (n < range.min || n > range.max) {
      return { error: `이 비트 폭에서 표현 불가 (범위: ${range.min.toLocaleString('ko-KR')} ~ ${range.max.toLocaleString('ko-KR')})`, value: n }
    }
    const u = toUnsigned(n, bitWidth)
    return {
      value: n,
      twosComp: padBits(n, bitWidth),
      asUnsigned: u,
      hex: u.toString(16).toUpperCase().padStart(bitWidth / 4, '0'),
    }
  }, [tcInput, bitWidth])

  // 비트 연산 결과
  const opCalc = useMemo(() => {
    const a = parseDecBig(opA) ?? B0
    const b = parseDecBig(opB) ?? B0
    const shift = parseDecBig(opShift) ?? B0
    const aBits = padBits(a, bitWidth).split('')
    const bBits = padBits(b, bitWidth).split('')
    let result: bigint
    if (op === 'NOT') result = applyOp(a, B0, 'NOT', bitWidth)
    else if (op === 'LSHIFT') result = applyOp(a, shift, 'LSHIFT', bitWidth)
    else if (op === 'RSHIFT') result = applyOp(a, shift, 'RSHIFT', bitWidth)
    else result = applyOp(a, b, op, bitWidth)
    const rBits = padBits(result, bitWidth).split('')
    return { a, b, shift, result, aBits, bBits, rBits }
  }, [opA, opB, opShift, op, bitWidth])

  // ─────────────────────────────────────────────
  // TAB 3: ASCII
  // ─────────────────────────────────────────────
  const charsToCodes = useMemo(() => {
    if (!textInput) return []
    return Array.from(textInput).slice(0, 200).map(ch => {
      const code = ch.codePointAt(0) ?? 0
      return {
        char: ch,
        decimal: code,
        hex: code.toString(16).toUpperCase().padStart(2, '0'),
        binary: code.toString(2).padStart(8, '0'),
        octal: code.toString(8).padStart(3, '0'),
      }
    })
  }, [textInput])

  const codesToChars = useMemo(() => {
    const tokens = codeInput.split(/[,\s]+/).filter(t => t)
    return tokens.map(t => {
      const cleaned = t.replace(/^(0x|0b|0o)/i, '')
      let code = 0
      try {
        code = parseInt(cleaned, codeBase)
      } catch {
        code = 0
      }
      const valid = !Number.isNaN(code) && code >= 0 && code <= 1114111
      return { token: t, code, char: valid ? String.fromCodePoint(code) : '?', valid }
    })
  }, [codeInput, codeBase])

  // ASCII 표 (0~127 또는 0~255)
  const asciiTable = useMemo(() => {
    const n = showExtended ? 256 : 128
    const cells: { code: number; char: string; isControl: boolean; ctrlName?: string }[] = []
    const CONTROL_NAMES = ['NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','TAB','LF','VT','FF','CR','SO','SI','DLE','DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US']
    for (let i = 0; i < n; i++) {
      const isControl = i < 32 || i === 127
      let char = String.fromCharCode(i)
      let ctrlName: string | undefined
      if (i < 32) ctrlName = CONTROL_NAMES[i]
      else if (i === 32) char = '␣'
      else if (i === 127) ctrlName = 'DEL'
      cells.push({ code: i, char, isControl, ctrlName })
    }
    return cells
  }, [showExtended])

  // ─────────────────────────────────────────────
  // TAB 4: 학습 단계
  // ─────────────────────────────────────────────
  const learnDecValue = useMemo(() => parseBig(learnValue, learnFrom), [learnValue, learnFrom])
  const learnSteps = useMemo(() => {
    if (learnDecValue === null) return null
    if (learnFrom === 10) {
      // 10진수 → 2진수 변환 단계 (나누기 방식)
      const steps = decToBaseSteps(learnDecValue, 2)
      return { kind: 'divide' as const, target: 2 as Base, dec: learnDecValue, steps }
    }
    // N진수 → 10진수 자리값 분해 (밑줄·접두사는 decompose에서 제거)
    const steps = decompose(learnValue, learnFrom)
    return { kind: 'expand' as const, source: learnFrom, dec: learnDecValue, steps }
  }, [learnDecValue, learnValue, learnFrom])
  const learnNorm = normalizeInput(learnValue, learnFrom)
  const learnAbs = learnDecValue !== null && learnDecValue < B0 ? -learnDecValue : (learnDecValue ?? B0)

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyValue(val: string, key: string) {
    if (!val) return
    try {
      await navigator.clipboard.writeText(val)
    } catch {
      return // 권한 거부 등 — 복사되지 않았으므로 '복사됨'을 띄우지 않음
    }
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 1500)
  }

  function fmtForLang(dec: bigint) {
    if (dec < B0) return null
    return {
      hex: '0x' + dec.toString(16).toUpperCase(),
      hexLow: '0x' + dec.toString(16),
      bin: '0b' + dec.toString(2),
      oct: '0o' + dec.toString(8),
    }
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <div className={s.disclaimer || ''} style={{
        background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.25)', borderRadius: 'var(--radius-m)',
        padding: '12px 16px', fontSize: 13, color: 'var(--text)', lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--orange-600)' }}>참고:</strong> 정수 변환을 지원합니다. 부동소수점(IEEE 754) 변환은 별도 도구를 권장하며,
        실제 시스템 구현 시 비트 폭·엔디안·부호 처리에 따라 결과가 다를 수 있습니다. 진법 변환은 자릿수 제한 없이 정확하게(BigInt) 계산하고,
        비트 표현·연산은 선택한 비트 폭(8~64-bit)에 맞춰 넘치는 상위 비트를 버리고 계산합니다.
      </div>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabsFour}`}>
        <button className={`${s.tabBtn} ${tab === 'convert' ? s.tabActive : ''}`} onClick={() => setTab('convert')}>진법 변환</button>
        <button className={`${s.tabBtn} ${tab === 'bit'     ? s.tabActive : ''}`} onClick={() => setTab('bit')}>비트 표현·연산</button>
        <button className={`${s.tabBtn} ${tab === 'ascii'   ? s.tabActive : ''}`} onClick={() => setTab('ascii')}>ASCII·문자</button>
        <button className={`${s.tabBtn} ${tab === 'learn'   ? s.tabActive : ''}`} onClick={() => setTab('learn')}>계산 과정 학습</button>
      </div>

      {/* ─── TAB 1: 진법 변환 ─── */}
      {tab === 'convert' && (
        <>
          {/* 입력 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>입력 진법</label>
            </div>
            <div className={s.modeRow}>
              {([
                { b: 2, label: '2진수 (Binary)', hint: '0,1' },
                { b: 8, label: '8진수 (Octal)', hint: '0~7' },
                { b: 10, label: '10진수 (Decimal)', hint: '0~9' },
                { b: 16, label: '16진수 (Hex)', hint: '0~9,A~F' },
              ] as { b: Base; label: string; hint: string }[]).map(o => (
                <button key={o.b} className={`${s.modeBtn} ${fromBase === o.b ? s.modeBtnActive : ''}`} onClick={() => setFromBase(o.b)} type="button">
                  {o.label}
                </button>
              ))}
            </div>

            <div className={s.cardTop} style={{ marginTop: 14 }}>
              <label className={s.cardLabel} htmlFor="number-base-input">입력 값 (밑줄 _·공백·0x 같은 접두사는 자동 무시)</label>
              {inputValue && <button className={s.clearBtn} onClick={() => setInputValue('')}>지우기</button>}
            </div>
            <input
              id="number-base-input"
              type="text"
              className={`${s.textarea} ${!isInputValid ? s.inputInvalid : ''}`}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={fromBase === 2 ? '11111111' : fromBase === 8 ? '377' : fromBase === 10 ? '255' : 'FF'}
              spellCheck={false}
              style={{ resize: 'none', minHeight: 'unset', height: 'auto', padding: '12px 16px', fontSize: 18 }}
            />
            {!isInputValid && (
              <p style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 6 }}>⚠️ {fromBase}진수에서 사용할 수 없는 문자가 포함되어 있습니다.</p>
            )}

            <div className={s.subActionRow} style={{ marginTop: 10 }}>
              {[
                { from: 10 as Base, v: '0' },
                { from: 10 as Base, v: '1' },
                { from: 10 as Base, v: '10' },
                { from: 10 as Base, v: '100' },
                { from: 10 as Base, v: '255' },
                { from: 10 as Base, v: '1024' },
                { from: 10 as Base, v: '65535' },
              ].map(p => (
                <button key={p.v} className={s.subActionBtn} onClick={() => { setFromBase(p.from); setInputValue(p.v) }} type="button">
                  {p.v}
                </button>
              ))}
            </div>
          </div>

          {/* 결과 */}
          {conversion && (
            <>
              <div className={s.baseGrid} role="status">
                <div className={`${s.baseCard} ${s.baseBin}`}>
                  <div className={s.baseCardHeader}>
                    <span className={s.baseCardLabel}>2진수 (Binary)</span>
                    <span className={s.basePrefix}>0b</span>
                  </div>
                  <p className={s.baseValue}>{groupBinary(conversion.binary.replace('-', ''))}{conversion.binary.startsWith('-') ? ' (negative)' : ''}</p>
                  <button className={s.copyBtn} style={{ marginTop: 8 }} onClick={() => copyValue(conversion.binary, 'bin')}>
                    {copiedKey === 'bin' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <div className={`${s.baseCard} ${s.baseOct}`}>
                  <div className={s.baseCardHeader}>
                    <span className={s.baseCardLabel}>8진수 (Octal)</span>
                    <span className={s.basePrefix}>0o</span>
                  </div>
                  <p className={s.baseValue}>{conversion.octal}</p>
                  <button className={s.copyBtn} style={{ marginTop: 8 }} onClick={() => copyValue(conversion.octal, 'oct')}>
                    {copiedKey === 'oct' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <div className={`${s.baseCard} ${s.baseDec}`}>
                  <div className={s.baseCardHeader}>
                    <span className={s.baseCardLabel}>10진수 (Decimal)</span>
                    <span className={s.basePrefix}>—</span>
                  </div>
                  <p className={s.baseValue}>{conversion.decimal.toLocaleString('ko-KR')}</p>
                  <button className={s.copyBtn} style={{ marginTop: 8 }} onClick={() => copyValue(conversion.decimal.toString(), 'dec')}>
                    {copiedKey === 'dec' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
                <div className={`${s.baseCard} ${s.baseHex}`}>
                  <div className={s.baseCardHeader}>
                    <span className={s.baseCardLabel}>16진수 (Hex)</span>
                    <span className={s.basePrefix}>0x</span>
                  </div>
                  <p className={s.baseValue}>{groupHex(conversion.hex.replace('-', ''))}{conversion.hex.startsWith('-') ? ' (negative)' : ''}</p>
                  <button className={s.copyBtn} style={{ marginTop: 8 }} onClick={() => copyValue(conversion.hex, 'hex')}>
                    {copiedKey === 'hex' ? '✓ 복사됨' : '복사'}
                  </button>
                </div>
              </div>

              {/* 의미 부여 */}
              {meanings.length > 0 && (
                <div className={s.meaningCard}>
                  <strong>의미:</strong>
                  <ul style={{ paddingLeft: 22, margin: '6px 0 0' }}>
                    {meanings.map((n, i) => <li key={i} style={{ padding: '2px 0' }}>{n}</li>)}
                  </ul>
                </div>
              )}

              {/* 언어별 표기 */}
              {decimalValue !== null && decimalValue >= B0 && (() => {
                const f = fmtForLang(decimalValue)
                if (!f) return null
                return (
                  <div className={s.card}>
                    <div className={s.cardTop}>
                      <label className={s.cardLabel}>프로그래밍 언어별 표기</label>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <tbody>
                        {[
                          { l: 'C / C++ / Java',  hex: f.hex,    bin: f.bin,    oct: f.oct.replace('0o', '0') },
                          { l: 'Python',          hex: f.hexLow, bin: f.bin,    oct: f.oct },
                          { l: 'JavaScript',      hex: f.hex,    bin: f.bin,    oct: f.oct },
                          { l: 'CSS 색상',         hex: isRgbCandidate ? '#' + decimalValue.toString(16).toUpperCase().padStart(6, '0') : '— (0xFFFFFF 초과)', bin: '—', oct: '—' },
                        ].map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 10px', color: 'var(--muted)', fontSize: 12 }}>{row.l}</td>
                            <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--orange-600)', fontWeight: 600 }}>{row.hex}</td>
                            <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600, fontSize: 11 }}>{row.bin}</td>
                            <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', color: 'var(--yellow-700)', fontWeight: 600 }}>{row.oct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()}

              {/* 색상 연결 */}
              {isRgbCandidate && decimalValue !== null && (
                <div className={s.meaningCard} style={{ background: 'rgba(234,88,12,0.05)', borderLeftColor: 'var(--orange-600)' }}>
                  <strong style={{ color: 'var(--orange-600)' }}>색상 코드:</strong>
                  &nbsp;<code style={{ background: 'var(--bg3)', padding: '2px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>
                    #{decimalValue.toString(16).toUpperCase().padStart(6, '0')}
                  </code>
                  &nbsp;
                  <span style={{
                    display: 'inline-block', width: 18, height: 18, borderRadius: 4,
                    background: '#' + decimalValue.toString(16).padStart(6, '0'),
                    border: '1px solid var(--border)', verticalAlign: 'middle', marginLeft: 4,
                  }} />
                  &nbsp;&nbsp;<a href="/tools/art/color" style={{ color: 'var(--orange-600)', textDecoration: 'underline', fontSize: 12 }}>색상 코드 변환기에서 보기 →</a>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ─── TAB 2: 비트 ─── */}
      {tab === 'bit' && (
        <>
          {/* 비트 폭 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>비트 폭 선택</label>
            </div>
            <div className={s.widthToggle}>
              {([8, 16, 32, 64] as BitWidth[]).map(w => (
                <button key={w} className={`${s.widthBtn} ${bitWidth === w ? s.widthActive : ''}`} onClick={() => setBitWidth(w)} type="button">
                  {w}-bit
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
              {bitWidth}-bit 부호 없는: 0 ~ {unsignedMax(bitWidth).toLocaleString('ko-KR')} ·
              {' '}부호 있는: {signedRange(bitWidth).min.toLocaleString('ko-KR')} ~ {signedRange(bitWidth).max.toLocaleString('ko-KR')}
            </p>
          </div>

          {/* 비트 토글 그리드 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>비트 토글 ({bitWidth}-bit)</label>
              <button className={s.clearBtn} onClick={() => setBitValue(B0)}>전체 0</button>
            </div>
            <div className={s.bitGrid} style={{ gridTemplateColumns: `repeat(${Math.min(narrow ? 8 : 16, bitWidth)}, minmax(0, 1fr))` }}>
              {bitArray.map((b, i) => {
                const pos = bitWidth - 1 - i
                // 1024 이상은 2^n 표기 — 셀 폭을 넘지 않도록
                const placeValue = pos >= 10 ? '2^' + pos : String(2 ** pos)
                return (
                  <button
                    key={pos}
                    className={`${s.bitCell} ${b === '1' ? s.bitOn : s.bitOff}`}
                    onClick={() => toggleBit(pos)}
                    type="button"
                    title={`bit ${pos}`}
                    aria-label={`bit ${pos}: ${b}`}
                    aria-pressed={b === '1'}
                  >
                    <div className={s.bitValue}>{b}</div>
                    <div className={s.bitPosition}>{pos}</div>
                    <div className={s.bitPlaceValue}>{placeValue}</div>
                  </button>
                )
              })}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 14 }}>
              <tbody>
                <tr><td style={{ padding: '6px 0', color: 'var(--muted)', width: 100 }}>2진수</td><td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{groupBinary(padBits(bitValue, bitWidth))}</td></tr>
                <tr><td style={{ padding: '6px 0', color: 'var(--muted)' }}>10진수</td><td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-600)' }}>{bitValueW.toLocaleString('ko-KR')}</td></tr>
                <tr><td style={{ padding: '6px 0', color: 'var(--muted)' }}>16진수</td><td style={{ fontFamily: 'var(--font-mono)', color: 'var(--orange-600)' }}>0x{bitValueW.toString(16).toUpperCase()}</td></tr>
                <tr>
                  <td style={{ padding: '6px 0', color: 'var(--muted)' }}>ON / OFF</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: 'var(--accent)' }}>{bitArray.filter(b => b === '1').length}</span>
                    {' / '}
                    <span style={{ color: 'var(--muted)' }}>{bitArray.filter(b => b === '0').length}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2의 보수 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel} htmlFor="number-base-bit">2의 보수 (음수 표현, {bitWidth}-bit)</label>
            </div>
            <input id="number-base-bit"
              type="number" inputMode="decimal"
              className={s.textarea}
              style={{ resize: 'none', minHeight: 'unset', height: 'auto', padding: '12px 16px', fontSize: 18, textAlign: 'center', fontFamily: 'var(--font-mono)' }}
              value={tcInput}
              onChange={e => setTcInput(e.target.value)}
              placeholder="-1"
            />
            {tcParse && 'error' in tcParse && (
              <p style={{ fontSize: 12, color: 'var(--red-600)', marginTop: 8 }}>⚠️ {tcParse.error}</p>
            )}
            {tcParse && !('error' in tcParse) && (
              <div style={{ marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <tbody>
                    <tr><td style={{ padding: '6px 0', color: 'var(--muted)', width: 140 }}>부호 있는 (signed)</td><td style={{ fontFamily: 'var(--font-mono)', color: tcParse.value < B0 ? 'var(--red-600)' : 'var(--accent)' }}>{tcParse.value.toString()}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: 'var(--muted)' }}>2의 보수 ({bitWidth}-bit)</td><td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{groupBinary(tcParse.twosComp)}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: 'var(--muted)' }}>부호 없는 해석 (unsigned)</td><td style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-600)' }}>{tcParse.asUnsigned.toLocaleString('ko-KR')}</td></tr>
                    <tr><td style={{ padding: '6px 0', color: 'var(--muted)' }}>16진수</td><td style={{ fontFamily: 'var(--font-mono)', color: 'var(--orange-600)' }}>0x{tcParse.hex}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 비트 연산 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>비트 연산</label>
            </div>
            <div className={s.opToggle}>
              {(['AND', 'OR', 'XOR', 'NOT', 'LSHIFT', 'RSHIFT'] as BitOp[]).map(o => (
                <button key={o} className={`${s.opToggleBtn} ${op === o ? s.opToggleActive : ''}`} onClick={() => setOp(o)} type="button">{o}</button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
              💡 {op}: {OP_DESCRIPTION[op]}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
              <div>
                <label htmlFor="number-base-op-a" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>A (10진수)</label>
                <input id="number-base-op-a" type="number" inputMode="numeric" className={s.textarea} style={{ resize: 'none', minHeight: 'unset', padding: '10px 12px', fontSize: 14 }} value={opA} onChange={e => setOpA(e.target.value)} />
              </div>
              {(op === 'AND' || op === 'OR' || op === 'XOR') && (
                <div>
                  <label htmlFor="number-base-op-b" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>B (10진수)</label>
                  <input id="number-base-op-b" type="number" inputMode="numeric" className={s.textarea} style={{ resize: 'none', minHeight: 'unset', padding: '10px 12px', fontSize: 14 }} value={opB} onChange={e => setOpB(e.target.value)} />
                </div>
              )}
              {(op === 'LSHIFT' || op === 'RSHIFT') && (
                <div>
                  <label htmlFor="number-base-op-shift" style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>이동 수 (bits)</label>
                  <input id="number-base-op-shift" type="number" inputMode="numeric" min="0" max={bitWidth} className={s.textarea} style={{ resize: 'none', minHeight: 'unset', padding: '10px 12px', fontSize: 14 }} value={opShift} onChange={e => setOpShift(e.target.value)} />
                </div>
              )}
            </div>

            {/* 비트 연산 시각화 */}
            <div style={{ marginTop: 14, padding: 14, background: 'var(--bg3)', borderRadius: 10, fontFamily: 'var(--font-mono)' }}>
              <div className={s.opGrid}>
                <span className={s.opLabel}>A = {opCalc.a.toString()}</span>
                <div className={s.opBits}>
                  {opCalc.aBits.map((b, i) => (
                    <span key={i} className={`${s.opBit} ${b === '1' ? s.opBitOn : ''}`}>{b}</span>
                  ))}
                </div>
              </div>
              {(op === 'AND' || op === 'OR' || op === 'XOR') && (
                <div className={s.opGrid}>
                  <span className={s.opLabel}>{op} B = {opCalc.b.toString()}</span>
                  <div className={s.opBits}>
                    {opCalc.bBits.map((b, i) => (
                      <span key={i} className={`${s.opBit} ${b === '1' ? s.opBitOn : ''}`}>{b}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ borderTop: '1px dashed var(--border)', margin: '8px 0' }} />
              <div className={s.opGrid}>
                <span className={s.opLabel}>= {opCalc.result.toLocaleString('ko-KR')}</span>
                <div className={s.opBits}>
                  {opCalc.rBits.map((b, i) => (
                    <span key={i} className={`${s.opBit} ${b === '1' ? s.opBitResult : ''}`}>{b}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
                → 0x{opCalc.result.toString(16).toUpperCase()} · 0b{padBits(opCalc.result, bitWidth)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── TAB 3: ASCII ─── */}
      {tab === 'ascii' && (
        <>
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>문자 → 코드</label>
              {textInput && <button className={s.clearBtn} onClick={() => setTextInput('')}>지우기</button>}
            </div>
            <input
              type="text"
              className={s.textarea}
              style={{ resize: 'none', minHeight: 'unset', padding: '12px 16px', fontSize: 16 }}
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Hello"
            />
            {charsToCodes.length > 0 && (
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['문자', '10진', '16진', '8진', '2진'].map((h, i) => (
                        <th scope="col" key={i} style={{ padding: '8px 10px', textAlign: i === 0 ? 'center' : 'right', color: 'var(--muted)', fontSize: 11, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {charsToCodes.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700 }}>
                          {c.char === ' ' ? '␣' : c.char}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--cyan-600)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.decimal}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--orange-600)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>0x{c.hex}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--yellow-700)', fontFamily: 'var(--font-mono)' }}>{c.octal}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{c.binary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 코드 → 문자 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>코드 → 문자</label>
            </div>
            <div className={s.modeRow}>
              {([10, 16, 8, 2] as Base[]).map(b => (
                <button key={b} className={`${s.modeBtn} ${codeBase === b ? s.modeBtnActive : ''}`} onClick={() => setCodeBase(b)} type="button">{b}진수</button>
              ))}
            </div>
            <input
              type="text"
              className={s.textarea}
              style={{ resize: 'none', minHeight: 'unset', padding: '12px 16px', fontSize: 14, marginTop: 10, fontFamily: 'var(--font-mono)' }}
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              placeholder={codeBase === 10 ? '72 101 108 108 111' : codeBase === 16 ? '48 65 6C 6C 6F' : codeBase === 8 ? '110 145 154 154 157' : '01001000 01100101 01101100'}
            />
            {codesToChars.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>결과:</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 700, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius-s)' }}>
                  {codesToChars.map((c, i) => c.valid ? c.char : '?').join('')}
                </p>
              </div>
            )}
          </div>

          {/* ASCII 표 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>ASCII 표 (0~{showExtended ? 255 : 127})</label>
              <button className={s.clearBtn} onClick={() => setShowExtended(!showExtended)}>
                {showExtended ? '표준만 (0~127)' : '확장 보기 (0~255)'}
              </button>
            </div>
            <div className={s.asciiTable}>
              {asciiTable.map(c => (
                <div key={c.code} className={`${s.asciiCell} ${c.isControl ? s.asciiControl : s.asciiPrintable}`} title={c.ctrlName ? `${c.code}: ${c.ctrlName}` : `${c.code}: ${c.char}`}>
                  <div className={s.asciiNum}>{c.code}</div>
                  <div className={s.asciiChar}>{c.ctrlName ?? c.char}</div>
                  <div className={s.asciiHex}>0x{c.code.toString(16).toUpperCase().padStart(2, '0')}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              💡 자주 쓰는 코드: 32(공백) · 48~57(0~9) · 65~90(A~Z) · 97~122(a~z) · 10(LF) · 13(CR) · 9(TAB)
            </p>
          </div>
        </>
      )}

      {/* ─── TAB 4: 학습 ─── */}
      {tab === 'learn' && (
        <>
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>학습할 값과 진법</label>
            </div>
            <div className={s.modeRow}>
              {([
                { b: 2 as Base, label: '2진수 → 10진수' },
                { b: 16 as Base, label: '16진수 → 10진수' },
                { b: 10 as Base, label: '10진수 → 2진수' },
                { b: 8 as Base, label: '8진수 → 10진수' },
              ]).map(o => (
                <button key={o.b} className={`${s.modeBtn} ${learnFrom === o.b ? s.modeBtnActive : ''}`} onClick={() => setLearnFrom(o.b)} type="button">
                  {o.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              className={s.textarea}
              style={{ resize: 'none', minHeight: 'unset', padding: '12px 16px', fontSize: 18, marginTop: 10, fontFamily: 'var(--font-mono)' }}
              value={learnValue}
              onChange={e => setLearnValue(e.target.value)}
              placeholder={learnFrom === 2 ? '1011' : learnFrom === 16 ? 'FF' : learnFrom === 10 ? '255' : '377'}
            />
          </div>

          {learnSteps && learnSteps.kind === 'expand' && (
            <>
              <div className={s.learnStep}>
                <span className={s.learnStepNum}>STEP 1</span>
                <p className={s.learnStepTitle}>자리값 분해</p>
                <div className={s.learnStepBody}>
                  {learnNorm} = {learnSteps.steps.map((s, i) => {
                    const power = learnSteps.steps.length - 1 - i
                    return `${s.digit}×${learnSteps.source}${power > 0 ? '^' + power : '⁰'}`
                  }).join(' + ')}
                </div>
              </div>
              <div className={s.learnStep}>
                <span className={s.learnStepNum}>STEP 2</span>
                <p className={s.learnStepTitle}>각 자리 계산</p>
                <div className={s.learnStepBody}>
                  {learnSteps.steps.map((step, i) => {
                    const power = learnSteps.steps.length - 1 - i
                    const digit = step.value > 9 ? `${step.digit}=${step.value.toString()}` : step.digit
                    return (
                      <div key={i}>
                        {digit} × {learnSteps.source}^{power} = {step.value.toString()} × {step.place.toString()} = <strong>{step.product.toString()}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className={s.learnStep}>
                <span className={s.learnStepNum}>STEP 3</span>
                <p className={s.learnStepTitle}>합산</p>
                <div className={s.learnStepBody}>
                  {learnSteps.steps.map(s => s.product.toString()).join(' + ')} = <strong>{learnSteps.dec.toString()}</strong>
                </div>
              </div>
              <div className={s.meaningCard}>
                결과: <strong>{learnNorm}</strong>
                <sub style={{ fontSize: 11 }}>{learnSteps.source}</sub>
                {' '}={' '}
                <strong>{learnSteps.dec.toString()}</strong>
                <sub style={{ fontSize: 11 }}>10</sub>
              </div>
            </>
          )}

          {learnSteps && learnSteps.kind === 'divide' && (
            <>
              <div className={s.learnStep}>
                <span className={s.learnStepNum}>STEP 1</span>
                <p className={s.learnStepTitle}>나누기 방식 (10진수 → 2진수)</p>
                <div className={s.learnStepBody}>
                  {learnAbs.toString()}을 2로 계속 나누고 나머지를 기록 (LSB → MSB 순):
                </div>
              </div>
              <div className={s.learnStep}>
                <span className={s.learnStepNum}>STEP 2</span>
                <p className={s.learnStepTitle}>나눗셈 단계</p>
                <div className={s.learnStepBody}>
                  {(() => {
                    let n = learnAbs
                    return learnSteps.steps.map((step, i) => {
                      const before = n
                      n = step.quotient
                      return (
                        <div key={i}>
                          {before.toString()} ÷ 2 = {step.quotient.toString()} ... <strong>{step.remainder.toString()}</strong> {i === 0 ? '(LSB)' : i === learnSteps.steps.length - 1 ? '(MSB)' : ''}
                        </div>
                      )
                    })
                  })()}
                </div>
              </div>
              <div className={s.learnStep}>
                <span className={s.learnStepNum}>STEP 3</span>
                <p className={s.learnStepTitle}>나머지를 아래에서 위로 읽기</p>
                <div className={s.learnStepBody}>
                  {learnSteps.steps.map(s => s.remainder.toString()).reverse().join('')} (2진수)
                </div>
              </div>
              <div className={s.meaningCard}>
                결과: <strong>{learnSteps.dec.toString()}</strong>
                <sub style={{ fontSize: 11 }}>10</sub>
                {' '}={' '}
                {learnSteps.dec < B0 && '−'}
                <strong>{groupBinary(learnAbs.toString(2))}</strong>
                <sub style={{ fontSize: 11 }}>2</sub>
              </div>
            </>
          )}

          {/* 핵심 공식 카드 */}
          <div className={s.card}>
            <div className={s.cardTop}>
              <label className={s.cardLabel}>핵심 공식 모음</label>
            </div>
            <div style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10,
              padding: '14px 16px', fontFamily: 'var(--font-mono)', fontSize: 13,
              color: 'var(--text)', lineHeight: 2,
            }}>
              <div><span style={{ color: 'var(--muted)' }}># 자리값 (오른쪽이 0번째)</span></div>
              <div><span style={{ color: 'var(--accent)' }}>2진수</span>:  1, 2, 4, 8, 16, 32, ... (2의 거듭제곱)</div>
              <div><span style={{ color: 'var(--yellow-700)' }}>8진수</span>:  1, 8, 64, 512, ... (8의 거듭제곱)</div>
              <div><span style={{ color: 'var(--cyan-600)' }}>10진수</span>: 1, 10, 100, 1000, ...</div>
              <div><span style={{ color: 'var(--orange-600)' }}>16진수</span>: 1, 16, 256, 4096, ... (16의 거듭제곱)</div>
              <div></div>
              <div><span style={{ color: 'var(--muted)' }}># 진법 간 단축 변환</span></div>
              <div>2진수 4자리 = 16진수 1자리 (1111 = F)</div>
              <div>2진수 3자리 = 8진수 1자리  (111  = 7)</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
