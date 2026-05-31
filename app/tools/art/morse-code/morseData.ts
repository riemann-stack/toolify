// ─────────────────────────────────────────────────────────
// 모스 부호 · NATO 음성기호 데이터
//  · 영문 모스: ITU 국제 표준
//  · 한글 모스(국문 전신부호): 김학우 안 기반, 한국 위키백과 표 검증
//    자음 14 + 모음 12(ㅐ·ㅔ 포함). 음운(자모) 사이 공백, 단어 사이 " / ".
//  · NATO: ICAO 음성 문자(Alfa~Zulu) + 숫자
// ─────────────────────────────────────────────────────────

// ── 영문·숫자·문장부호 모스 ──
export const MORSE_EN: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
}

// ── 한글 자모(기본 26) 모스 ──
export const MORSE_KO: Record<string, string> = {
  // 자음 14
  ㄱ: '.-..', ㄴ: '..-.', ㄷ: '-...', ㄹ: '...-', ㅁ: '--', ㅂ: '.--', ㅅ: '--.',
  ㅇ: '-.-', ㅈ: '.--.', ㅊ: '-.-.', ㅋ: '-..-', ㅌ: '--..', ㅍ: '---', ㅎ: '.---',
  // 모음 12
  ㅏ: '.', ㅑ: '..', ㅓ: '-', ㅕ: '...', ㅗ: '.-', ㅛ: '-.', ㅜ: '....', ㅠ: '.-.',
  ㅡ: '-..', ㅣ: '..-', ㅐ: '--.-', ㅔ: '-.--',
}

// 기본 자모가 아닌 겹자모 → 기본 자모 분해 (인코딩용)
const KO_DECOMPOSE: Record<string, string> = {
  // 겹자음(초성·종성 공통)
  ㄲ: 'ㄱㄱ', ㄸ: 'ㄷㄷ', ㅃ: 'ㅂㅂ', ㅆ: 'ㅅㅅ', ㅉ: 'ㅈㅈ',
  // 겹받침
  ㄳ: 'ㄱㅅ', ㄵ: 'ㄴㅈ', ㄶ: 'ㄴㅎ', ㄺ: 'ㄹㄱ', ㄻ: 'ㄹㅁ', ㄼ: 'ㄹㅂ',
  ㄽ: 'ㄹㅅ', ㄾ: 'ㄹㅌ', ㄿ: 'ㄹㅍ', ㅀ: 'ㄹㅎ', ㅄ: 'ㅂㅅ',
  // 겹모음
  ㅘ: 'ㅗㅏ', ㅙ: 'ㅗㅐ', ㅚ: 'ㅗㅣ', ㅝ: 'ㅜㅓ', ㅞ: 'ㅜㅔ', ㅟ: 'ㅜㅣ',
  ㅢ: 'ㅡㅣ', ㅒ: 'ㅑㅣ', ㅖ: 'ㅕㅣ',
}

// 유니코드 한글 음절 분해용 자모 리스트
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

// 한 글자(자모/음절)를 기본 자모 배열로 분해
function toBaseJamo(ch: string): string[] {
  const code = ch.charCodeAt(0)
  // 완성형 음절(가~힣)
  if (code >= 0xac00 && code <= 0xd7a3) {
    const idx = code - 0xac00
    const cho = CHO[Math.floor(idx / 588)]
    const jung = JUNG[Math.floor((idx % 588) / 28)]
    const jong = JONG[idx % 28]
    return [...expand(cho), ...expand(jung), ...(jong ? expand(jong) : [])]
  }
  // 단독 자모(호환 자모 ㄱ~ㅣ)
  if (MORSE_KO[ch] || KO_DECOMPOSE[ch]) return expand(ch)
  return []
}
function expand(jamo: string): string[] {
  const d = KO_DECOMPOSE[jamo]
  return d ? d.split('') : [jamo]
}

// ── 역방향(디코딩) 맵 ──
const REV_EN: Record<string, string> = Object.fromEntries(Object.entries(MORSE_EN).map(([k, v]) => [v, k]))
const REV_KO: Record<string, string> = Object.fromEntries(Object.entries(MORSE_KO).map(([k, v]) => [v, k]))

// 디코딩 시 인접 자모 재결합 규칙
const VOWEL_COMPOSE: Record<string, string> = {
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ', 'ㅑㅣ': 'ㅒ', 'ㅕㅣ': 'ㅖ',
}
const FINAL_COMPOSE: Record<string, string> = {
  'ㄱㄱ': 'ㄲ', 'ㅅㅅ': 'ㅆ', 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ',
}
const DOUBLE_CHO: Record<string, string> = { 'ㄱㄱ': 'ㄲ', 'ㄷㄷ': 'ㄸ', 'ㅂㅂ': 'ㅃ', 'ㅅㅅ': 'ㅆ', 'ㅈㅈ': 'ㅉ' }
const KO_CONS = new Set('ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'.split(''))
const isVowel = (j: string) => !!j && !KO_CONS.has(j)

// ── 인코딩: 텍스트 → 모스 ──
export type Lang = 'en' | 'ko'

export function encodeMorse(text: string, lang: Lang): string {
  const out: string[] = []
  for (const raw of [...text]) {
    if (raw === ' ') { out.push('/'); continue }
    if (lang === 'ko') {
      const jamos = toBaseJamo(raw)
      if (jamos.length) { for (const j of jamos) if (MORSE_KO[j]) out.push(MORSE_KO[j]); continue }
    }
    const up = raw.toUpperCase()
    if (MORSE_EN[up]) out.push(MORSE_EN[up])
  }
  // 자모/문자 사이 공백, 단어(원문 공백)는 '/' 토큰 → 자연히 " / "
  return out.join(' ').trim()
}

// ── 디코딩: 모스 → 텍스트 ──
function composeHangul(cho: string, jung: string, jong: string): string {
  const ci = CHO.indexOf(cho), ji = JUNG.indexOf(jung), ti = JONG.indexOf(jong || '')
  if (ci < 0 || ji < 0 || ti < 0) return cho + jung + jong
  return String.fromCharCode(0xac00 + (ci * 21 + ji) * 28 + ti)
}

// 기본 자모 배열 → 한글 음절 문자열(그리디 재결합)
function assembleHangul(jamo: string[]): string {
  let out = ''
  let i = 0
  const n = jamo.length
  while (i < n) {
    // 초성
    let cho = ''
    if (KO_CONS.has(jamo[i])) {
      if (i + 2 < n && jamo[i] === jamo[i + 1] && DOUBLE_CHO[jamo[i] + jamo[i + 1]] && isVowel(jamo[i + 2])) {
        cho = DOUBLE_CHO[jamo[i] + jamo[i + 1]]; i += 2
      } else { cho = jamo[i]; i += 1 }
    } else { cho = 'ㅇ' } // 자음 없이 모음으로 시작하면 ㅇ 보정
    // 중성
    if (!isVowel(jamo[i])) { out += cho; continue } // 모음이 없으면 자모 그대로
    let jung = jamo[i]; i += 1
    if (i < n && isVowel(jamo[i]) && VOWEL_COMPOSE[jung + jamo[i]]) { jung = VOWEL_COMPOSE[jung + jamo[i]]; i += 1 }
    // 종성: 다음 모음 전의 자음 런에서 마지막 자음은 다음 초성
    let jong = ''
    if (i < n && KO_CONS.has(jamo[i])) {
      // 자음 런 수집
      let j = i
      while (j < n && KO_CONS.has(jamo[j])) j++
      const hasVowelAfter = j < n && isVowel(jamo[j])
      const runEnd = hasVowelAfter ? j - 1 : j // 다음 초성 1개 남김
      const finals = jamo.slice(i, runEnd)
      if (finals.length === 2 && FINAL_COMPOSE[finals[0] + finals[1]]) { jong = FINAL_COMPOSE[finals[0] + finals[1]]; i = runEnd }
      else if (finals.length >= 1) { jong = finals[0]; i += 1 }
    }
    out += composeHangul(cho, jung, jong)
  }
  return out
}

export function decodeMorse(morse: string, lang: Lang): string {
  // 단어 구분: "/" → 공백. 자모/문자 구분: 공백
  const words = morse.trim().split(/\s*\/\s*/)
  const decodedWords = words.map((w) => {
    const tokens = w.split(/\s+/).filter(Boolean)
    if (lang === 'en') {
      return tokens.map((t) => REV_EN[t] ?? '').join('')
    }
    const jamo = tokens.map((t) => REV_KO[t]).filter((j): j is string => Boolean(j))
    return assembleHangul(jamo)
  })
  return decodedWords.join(' ')
}

// ── NATO 음성기호 ──
export interface NatoEntry { ch: string; word: string; ko: string }
export const NATO: NatoEntry[] = [
  { ch: 'A', word: 'Alfa', ko: '알파' }, { ch: 'B', word: 'Bravo', ko: '브라보' },
  { ch: 'C', word: 'Charlie', ko: '찰리' }, { ch: 'D', word: 'Delta', ko: '델타' },
  { ch: 'E', word: 'Echo', ko: '에코' }, { ch: 'F', word: 'Foxtrot', ko: '폭스트롯' },
  { ch: 'G', word: 'Golf', ko: '골프' }, { ch: 'H', word: 'Hotel', ko: '호텔' },
  { ch: 'I', word: 'India', ko: '인디아' }, { ch: 'J', word: 'Juliett', ko: '줄리엣' },
  { ch: 'K', word: 'Kilo', ko: '킬로' }, { ch: 'L', word: 'Lima', ko: '리마' },
  { ch: 'M', word: 'Mike', ko: '마이크' }, { ch: 'N', word: 'November', ko: '노벰버' },
  { ch: 'O', word: 'Oscar', ko: '오스카' }, { ch: 'P', word: 'Papa', ko: '파파' },
  { ch: 'Q', word: 'Quebec', ko: '퀘벡' }, { ch: 'R', word: 'Romeo', ko: '로미오' },
  { ch: 'S', word: 'Sierra', ko: '시에라' }, { ch: 'T', word: 'Tango', ko: '탱고' },
  { ch: 'U', word: 'Uniform', ko: '유니폼' }, { ch: 'V', word: 'Victor', ko: '빅터' },
  { ch: 'W', word: 'Whiskey', ko: '위스키' }, { ch: 'X', word: 'Xray', ko: '엑스레이' },
  { ch: 'Y', word: 'Yankee', ko: '양키' }, { ch: 'Z', word: 'Zulu', ko: '줄루' },
  { ch: '0', word: 'Zero', ko: '제로' }, { ch: '1', word: 'One', ko: '원' },
  { ch: '2', word: 'Two', ko: '투' }, { ch: '3', word: 'Three', ko: '트리' },
  { ch: '4', word: 'Four', ko: '포워' }, { ch: '5', word: 'Five', ko: '파이프' },
  { ch: '6', word: 'Six', ko: '식스' }, { ch: '7', word: 'Seven', ko: '세븐' },
  { ch: '8', word: 'Eight', ko: '에이트' }, { ch: '9', word: 'Nine', ko: '나이너' },
]
const NATO_MAP = new Map(NATO.map((n) => [n.ch, n]))

export function spellNato(text: string): NatoEntry[] {
  const out: NatoEntry[] = []
  for (const raw of [...text]) {
    const up = raw.toUpperCase()
    const e = NATO_MAP.get(up)
    if (e) out.push(e)
    else if (raw === ' ') out.push({ ch: ' ', word: '(공백)', ko: '띄어쓰기' })
    else if (raw.trim()) out.push({ ch: raw, word: raw, ko: '' })
  }
  return out
}
