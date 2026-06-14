'use client'

import { useMemo, useState } from 'react'
import s from '../dev.module.css'

// ─────────────────────────────────────────────
// 두벌식 ↔ QWERTY 매핑
// ─────────────────────────────────────────────
const EN_TO_JAMO: Record<string, string> = {
  q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
  a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
  z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',
  Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', Y: 'ㅛ', U: 'ㅕ', I: 'ㅑ', O: 'ㅒ', P: 'ㅖ',
  A: 'ㅁ', S: 'ㄴ', D: 'ㅇ', F: 'ㄹ', G: 'ㅎ', H: 'ㅗ', J: 'ㅓ', K: 'ㅏ', L: 'ㅣ',
  Z: 'ㅋ', X: 'ㅌ', C: 'ㅊ', V: 'ㅍ', B: 'ㅠ', N: 'ㅜ', M: 'ㅡ',
}

// 자모 → 영문 키 (소문자 우선). 쌍자모·된소리·일부 이중모음은 Shift 키
const JAMO_TO_EN: Record<string, string> = {}
for (const [en, jamo] of Object.entries(EN_TO_JAMO)) {
  if (!(jamo in JAMO_TO_EN)) JAMO_TO_EN[jamo] = en
}
const SHIFT_JAMO: Record<string, string> = {
  'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T', 'ㅒ': 'O', 'ㅖ': 'P',
}
for (const [jamo, en] of Object.entries(SHIFT_JAMO)) JAMO_TO_EN[jamo] = en

// ─────────────────────────────────────────────
// 초·중·종 테이블 (유니코드 조합 순서)
// ─────────────────────────────────────────────
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

const CHO_IDX: Record<string, number> = {}; CHO.forEach((c, i) => { CHO_IDX[c] = i })
const JUNG_IDX: Record<string, number> = {}; JUNG.forEach((c, i) => { JUNG_IDX[c] = i })
const JONG_IDX: Record<string, number> = {}; JONG.forEach((c, i) => { if (c) JONG_IDX[c] = i })

// 겹받침 결합: (앞받침 + 뒤자음) → 합성받침
const JONG_COMBINE: Record<string, string> = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ',
}
const JONG_SPLIT: Record<string, [string, string]> = {}
for (const [k, v] of Object.entries(JONG_COMBINE)) JONG_SPLIT[v] = [k[0], k[1]]

// 이중모음 결합: (앞모음 + 뒤모음) → 합성모음
const JUNG_COMBINE: Record<string, string> = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ',
}
const JUNG_SPLIT: Record<string, [string, string]> = {}
for (const [k, v] of Object.entries(JUNG_COMBINE)) JUNG_SPLIT[v] = [k[0], k[1]]

const isCho = (j: string) => j in CHO_IDX
const isJung = (j: string) => j in JUNG_IDX
const isJong = (j: string) => j in JONG_IDX

function compose(cho: number, jung: number, jong: number): string {
  return String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong)
}

// ─────────────────────────────────────────────
// 영문 → 한글 (두벌식 오토마타)
// ─────────────────────────────────────────────
function enToKo(input: string): string {
  const tokens: string[] = []
  for (const ch of input) tokens.push(EN_TO_JAMO[ch] ?? ch)

  let out = ''
  let cho = -1, jung = -1, jong = -1

  const flush = () => {
    if (cho >= 0 && jung >= 0) out += compose(cho, jung, jong < 0 ? 0 : jong)
    else if (cho >= 0) out += CHO[cho]
    else if (jung >= 0) out += JUNG[jung]
    else if (jong >= 0) out += JONG[jong]
    cho = -1; jung = -1; jong = -1
  }

  for (const t of tokens) {
    const isC = isCho(t)
    const isV = isJung(t)

    if (!isC && !isV) { flush(); out += t; continue }

    if (isV) {
      if (cho < 0 && jung < 0 && jong < 0) {
        jung = JUNG_IDX[t]
      } else if (cho >= 0 && jung < 0) {
        jung = JUNG_IDX[t]
      } else if (jung >= 0 && jong < 0) {
        const combined = JUNG_COMBINE[JUNG[jung] + t]
        if (combined) jung = JUNG_IDX[combined]
        else { flush(); jung = JUNG_IDX[t] }
      } else if (jong >= 0) {
        // 종성 + 모음 → 종성(의 뒷자음)이 다음 음절 초성으로 넘어감
        const jongJamo = JONG[jong]
        if (jongJamo in JONG_SPLIT) {
          const [first, second] = JONG_SPLIT[jongJamo]
          jong = JONG_IDX[first]
          flush()
          cho = CHO_IDX[second]; jung = JUNG_IDX[t]
        } else {
          const moved = jongJamo
          jong = -1
          flush()
          cho = isCho(moved) ? CHO_IDX[moved] : -1
          if (cho < 0) out += moved
          jung = JUNG_IDX[t]
        }
      } else {
        flush(); jung = JUNG_IDX[t]
      }
      continue
    }

    // 자음
    if (cho < 0 && jung < 0 && jong < 0) {
      cho = CHO_IDX[t]
    } else if (cho >= 0 && jung < 0) {
      flush(); cho = CHO_IDX[t]
    } else if (jung >= 0 && jong < 0) {
      if (isJong(t)) jong = JONG_IDX[t]
      else { flush(); cho = CHO_IDX[t] }
    } else if (jong >= 0) {
      const combined = JONG_COMBINE[JONG[jong] + t]
      if (combined) jong = JONG_IDX[combined]
      else { flush(); cho = CHO_IDX[t] }
    }
  }
  flush()
  return out
}

// ─────────────────────────────────────────────
// 한글 → 영문 (자모 분해 후 역매핑)
// ─────────────────────────────────────────────
function jamoToEn(jamo: string): string {
  if (jamo in JONG_SPLIT) {
    const [a, b] = JONG_SPLIT[jamo]
    return (JAMO_TO_EN[a] ?? '') + (JAMO_TO_EN[b] ?? '')
  }
  if (jamo in JUNG_SPLIT) {
    const [a, b] = JUNG_SPLIT[jamo]
    return (JAMO_TO_EN[a] ?? '') + (JAMO_TO_EN[b] ?? '')
  }
  return JAMO_TO_EN[jamo] ?? jamo
}

function koToEn(input: string): string {
  let out = ''
  for (const ch of input) {
    const code = ch.charCodeAt(0)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      const sIdx = code - 0xAC00
      const cho = Math.floor(sIdx / (21 * 28))
      const jung = Math.floor((sIdx % (21 * 28)) / 28)
      const jong = sIdx % 28
      out += jamoToEn(CHO[cho]) + jamoToEn(JUNG[jung]) + (jong > 0 ? jamoToEn(JONG[jong]) : '')
    } else if (ch in JAMO_TO_EN || ch in JONG_SPLIT || ch in JUNG_SPLIT) {
      out += jamoToEn(ch)
    } else {
      out += ch
    }
  }
  return out
}

// 입력에 한글이 섞여 있는지 (방향 자동 추정용)
function looksKorean(text: string): boolean {
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if ((code >= 0xAC00 && code <= 0xD7A3) || (code >= 0x3131 && code <= 0x3163)) return true
  }
  return false
}

type Dir = 'enToKo' | 'koToEn'

// ─────────────────────────────────────────────
// 자판 행 (자판 표 시각화)
// ─────────────────────────────────────────────
const KB_ROWS: { en: string; ko: string; shift?: string }[][] = [
  [
    { en: 'Q', ko: 'ㅂ', shift: 'ㅃ' }, { en: 'W', ko: 'ㅈ', shift: 'ㅉ' }, { en: 'E', ko: 'ㄷ', shift: 'ㄸ' },
    { en: 'R', ko: 'ㄱ', shift: 'ㄲ' }, { en: 'T', ko: 'ㅅ', shift: 'ㅆ' }, { en: 'Y', ko: 'ㅛ' },
    { en: 'U', ko: 'ㅕ' }, { en: 'I', ko: 'ㅑ' }, { en: 'O', ko: 'ㅐ', shift: 'ㅒ' }, { en: 'P', ko: 'ㅔ', shift: 'ㅖ' },
  ],
  [
    { en: 'A', ko: 'ㅁ' }, { en: 'S', ko: 'ㄴ' }, { en: 'D', ko: 'ㅇ' }, { en: 'F', ko: 'ㄹ' },
    { en: 'G', ko: 'ㅎ' }, { en: 'H', ko: 'ㅗ' }, { en: 'J', ko: 'ㅓ' }, { en: 'K', ko: 'ㅏ' }, { en: 'L', ko: 'ㅣ' },
  ],
  [
    { en: 'Z', ko: 'ㅋ' }, { en: 'X', ko: 'ㅌ' }, { en: 'C', ko: 'ㅊ' }, { en: 'V', ko: 'ㅍ' },
    { en: 'B', ko: 'ㅠ' }, { en: 'N', ko: 'ㅜ' }, { en: 'M', ko: 'ㅡ' },
  ],
]

const EXAMPLES: { label: string; dir: Dir; text: string }[] = [
  { label: 'dkssudgktpdy', dir: 'enToKo', text: 'dkssudgktpdy' },
  { label: 'rkatkgkqslek', dir: 'enToKo', text: 'rkatkgkqslek' },
  { label: 'rhoscksgdkdy', dir: 'enToKo', text: 'rhoscksgdkdy' },
  { label: 'ㅗ디ㅣㅐ', dir: 'koToEn', text: 'ㅗ디ㅣㅐ' },
  { label: '안녕하세요', dir: 'koToEn', text: '안녕하세요' },
]

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function KeyboardLayoutClient() {
  const [dir, setDir] = useState<Dir>('enToKo')
  const [auto, setAuto] = useState<boolean>(true)
  const [input, setInput] = useState<string>('dkssudgktpdy')
  const [copied, setCopied] = useState<boolean>(false)

  // 자동 방향 추정 (auto일 때만): 입력에 한글이 있으면 한→영
  const effectiveDir: Dir = useMemo(() => {
    if (!auto) return dir
    return looksKorean(input) ? 'koToEn' : 'enToKo'
  }, [auto, dir, input])

  const output = useMemo(() => {
    if (!input) return ''
    return effectiveDir === 'enToKo' ? enToKo(input) : koToEn(input)
  }, [input, effectiveDir])

  function copy() {
    if (!output || typeof navigator === 'undefined' || !navigator.clipboard) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  // 입력↔출력 스왑: 변환 결과를 입력으로 옮기고 방향 반전
  function swap() {
    if (!output) return
    setInput(output)
    if (!auto) setDir(d => (d === 'enToKo' ? 'koToEn' : 'enToKo'))
  }

  const dirLabel = effectiveDir === 'enToKo' ? '영문 자판 → 한글' : '한글 → 영문 자판'

  return (
    <div className={s.wrap}>
      {/* 방향 / 모드 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel}>변환 방향</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={auto}
              onChange={e => setAuto(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: 'var(--cat-dev)', cursor: 'pointer' }}
            />
            한글 감지 시 자동 전환
          </label>
        </div>
        <div className={s.modeRow}>
          <button
            type="button"
            className={`${s.modeBtn} ${effectiveDir === 'enToKo' ? s.modeBtnActive : ''}`}
            onClick={() => { setAuto(false); setDir('enToKo') }}
          >
            영문 → 한글 (dkssud → 안녕)
          </button>
          <button
            type="button"
            className={`${s.modeBtn} ${effectiveDir === 'koToEn' ? s.modeBtnActive : ''}`}
            onClick={() => { setAuto(false); setDir('koToEn') }}
          >
            한글 → 영문 (안녕 → dkssud)
          </button>
        </div>
        {auto && (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
            현재 입력 기준 <strong style={{ color: 'var(--cat-dev)' }}>{dirLabel}</strong>으로 변환 중입니다. 버튼을 누르면 수동 고정됩니다.
          </p>
        )}
      </div>

      {/* 입력 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel} htmlFor="kbl-input">
            입력 ({effectiveDir === 'enToKo' ? '영문 그대로 친 글자' : '한글'})
          </label>
          {input && <button type="button" className={s.clearBtn} onClick={() => setInput('')}>지우기</button>}
        </div>
        <textarea
          id="kbl-input"
          className={s.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={effectiveDir === 'enToKo' ? 'dkssudgktpdy' : '안녕하세요'}
          spellCheck={false}
          rows={3}
          style={{ fontSize: 16, minHeight: 84 }}
        />
        <div className={s.subActionRow} style={{ marginTop: 10 }}>
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              type="button"
              className={s.subActionBtn}
              onClick={() => { setAuto(false); setDir(ex.dir); setInput(ex.text) }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* 스왑 */}
      <button
        type="button"
        className={s.swapCenterBtn}
        onClick={swap}
        disabled={!output}
        title="변환 결과를 입력으로 옮기고 방향을 뒤집습니다"
      >
        ⇅ 결과를 입력으로
      </button>

      {/* 출력 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel} htmlFor="kbl-output">변환 결과 ({dirLabel})</label>
          <button type="button" className={s.copyBtn} onClick={copy} disabled={!output}>
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>
        <div
          id="kbl-output"
          role="status"
          aria-live="polite"
          className={`${s.outputBox} ${!output ? s.outputPlaceholder : ''}`}
          style={{ fontSize: 18, minHeight: 84 }}
        >
          {output || '결과가 여기 표시됩니다.'}
        </div>
      </div>

      {/* 자판 매핑 표 */}
      <div className={s.card}>
        <div className={s.cardTop}>
          <label className={s.cardLabel}>두벌식 자판 배열 (QWERTY 기준)</label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {KB_ROWS.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: 'flex',
                gap: 4,
                flexWrap: 'wrap',
                paddingLeft: ri * 12,
              }}
            >
              {row.map(key => (
                <div
                  key={key.en}
                  style={{
                    flex: '1 1 0',
                    minWidth: 40,
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '6px 4px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{key.en}</div>
                  <div style={{ fontSize: 17, color: 'var(--cat-dev)', fontWeight: 700, lineHeight: 1.3 }}>{key.ko}</div>
                  {key.shift && (
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>⇧ {key.shift}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
          ⇧ 표시는 Shift를 함께 눌렀을 때의 자모(된소리 ㅃㅉㄸㄲㅆ, 이중모음 ㅒㅖ)입니다.
          영문 외 문자(공백·숫자·기호)는 변환하지 않고 그대로 둡니다.
        </p>
      </div>
    </div>
  )
}
