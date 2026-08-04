// ─────────────────────────────────────────────────────────
// 모스 부호 · NATO 음성기호 데이터
//  · 영문 모스: ITU 국제 표준
//  · 한글 모스(국문 전신부호): 김학우 안 기반, 한국 위키백과 표 검증
//    자음 14 + 모음 12(ㅐ·ㅔ 포함). 음운(자모) 사이 공백, 단어 사이 " / ".
//  · 음성 문자: ICAO Annex 10 Vol II(7판, 2016) Figure 5-1 및 5.2.1.4.3.1
//    ⚠️ 예전 주석은 출처를 'ICAO'로만 적었지만 실제 데이터는 ICAO(문자)·ACP 125 군용표(Xray)·
//       일상 영어(Three/Four…)가 섞여 있었다. ICAO 기준으로 통일하고 규정 발음을 별도 열로 둔다.
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

/* ── 모스 입력 정규화 ──
   ⚠️ 이 페이지의 부호표·프로사인표는 가독성 때문에 ·(U+00B7)와 −(U+2212)로 렌더링하는데,
      입력 정제기는 ASCII `.`/`-`만 통과시켰다. **표에서 복사해 붙여 넣으면 전부 삭제되어
      빈 입력이 됐다**(입력창에 공백만 남고 결과는 '—'). 라벨·플레이스홀더조차 "· − / 공백"이라
      적혀 있어 안내대로 입력하면 아무것도 되지 않았다.
      실제로 사람들이 쓰는 점·선 변형을 전부 ASCII로 접어 준다. */
const DOT_CHARS = '·•∙‧⋅・･。ᐧ．'     // middle dot·bullet·katakana middle dot·전각 마침표 등
const DASH_CHARS = '−–—―ー_ｰ－'       // minus·en/em dash·horizontal bar·전각 하이픈 등
const SLASH_CHARS = '／|｜'           // 전각 슬래시·세로줄(단어 구분으로 흔히 씀)

/** 사용자가 붙여 넣은 모스 문자열을 ASCII `.` `-` `/` 공백으로 정규화한다. */
export function normalizeMorse(v: string): string {
  let out = ''
  for (const ch of v) {
    if (ch === '.' || ch === '-' || ch === '/') { out += ch; continue }
    if (DOT_CHARS.includes(ch)) { out += '.'; continue }
    if (DASH_CHARS.includes(ch)) { out += '-'; continue }
    if (SLASH_CHARS.includes(ch)) { out += '/'; continue }
    if (/\s/.test(ch) || ch === '\u3000') { out += ' '; continue }   // 전각 공백 포함
    // 그 밖의 문자는 버린다
  }
  return out
}

// ── 인코딩: 텍스트 → 모스 ──
export type Lang = 'en' | 'ko'

/** 인코딩 결과 + 변환하지 못해 건너뛴 문자.
    ⚠️ 예전에는 미지원 문자를 조용히 버렸다 — 영문 모드에서 한글을 입력하면 결과가 통째로
       비었는데 이유를 알려 주지 않았고, '50%'는 아무 말 없이 '50'이 됐다. */
export interface EncodeResult { code: string; dropped: string[] }

export function encodeMorseDetailed(text: string, lang: Lang): EncodeResult {
  const out: string[] = []
  const dropped: string[] = []
  for (const raw of [...text]) {
    if (raw === ' ') { out.push('/'); continue }
    if (/\s/.test(raw)) { out.push('/'); continue }        // 줄바꿈·탭도 단어 구분으로
    if (lang === 'ko') {
      const jamos = toBaseJamo(raw)
      if (jamos.length) { for (const j of jamos) if (MORSE_KO[j]) out.push(MORSE_KO[j]); continue }
    }
    const up = raw.toUpperCase()
    if (MORSE_EN[up]) { out.push(MORSE_EN[up]); continue }
    dropped.push(raw)
  }
  // 자모/문자 사이 공백, 단어(원문 공백)는 '/' 토큰 → 자연히 " / "
  // 앞뒤 단어 구분자와 연속 구분자를 정리 (예전엔 " 안녕"이 "/ ..."로 시작했다)
  while (out.length && out[0] === '/') out.shift()
  while (out.length && out[out.length - 1] === '/') out.pop()
  const collapsed = out.filter((tok, i) => !(tok === '/' && out[i - 1] === '/'))
  return { code: collapsed.join(' '), dropped }
}

export function encodeMorse(text: string, lang: Lang): string {
  return encodeMorseDetailed(text, lang).code
}

/** 한글이 섞여 있는지 — 영문 모드에서 한글을 넣으면 전부 버려지므로 화면에서 알려 준다. */
export function hasHangul(text: string): boolean {
  return /[\uac00-\ud7a3\u3131-\u318e]/.test(text)
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

/** 디코딩 결과 + 표에 없어 해석하지 못한 부호.
    ⚠️ 예전에는 모르는 부호를 조용히 버렸다. '.-.-.-.-.- ...'를 넣으면 앞 토큰이 사라지고
       '여'라는 **그럴듯한 오답**만 남아, 입력의 절반이 무시됐다는 사실을 알 수 없었다. */
export interface DecodeResult { text: string; unknown: string[] }

/** 글자가 아닌 운용 신호 — 부호표에 없다고 버리면 SOS조차 '알 수 없는 부호'가 된다.
    부호가 이미 문자에 배정된 것(+ = & K)은 여기 넣지 않는다(문자 해석이 우선). */
export const PROSIGN_BY_CODE: Record<string, string> = {
  '...---...': 'SOS (조난)',
  '........': 'HH (정정)',
  '-.-.-': 'KA (송신 시작)',
  '...-.': 'SN (수신 양해)',
  '...-.-': 'VA (교신 종료)',
}

export function decodeMorseDetailed(morse: string, lang: Lang): DecodeResult {
  const unknown: string[] = []
  const words = morse.trim().split(/\s*\/\s*/)
  const decodedWords = words.map((w) => {
    const tokens = w.split(/\s+/).filter(Boolean)
    if (lang === 'en') {
      return tokens.map((t) => {
        const ch = REV_EN[t]
        if (ch !== undefined) return ch
        const ps = PROSIGN_BY_CODE[t]
        if (ps) return `⟨${ps}⟩`
        unknown.push(t)
        return ''
      }).join('')
    }
    /* 한글 모드에서도 운용 신호는 언어와 무관하므로 이름으로 보여 준다.
       자모 사이에 끼면 음절 조립이 끊기므로 조각을 나눠 이어 붙인다. */
    let acc = ''
    let jamo: string[] = []
    const flush = () => { acc += assembleHangul(jamo); jamo = [] }
    for (const t of tokens) {
      const j = REV_KO[t]
      if (j !== undefined) { jamo.push(j); continue }
      const ps = PROSIGN_BY_CODE[t]
      if (ps) { flush(); acc += `⟨${ps}⟩`; continue }
      unknown.push(t)
    }
    flush()
    return acc
  })
  return { text: decodedWords.join(' '), unknown }
}

export function decodeMorse(morse: string, lang: Lang): string {
  return decodeMorseDetailed(morse, lang).text
}

// ── NATO 음성기호 ──
/** ch = 글자, word = 철자 코드어, say = ICAO 규정 발음(대문자 음절에 강세), ko = 한국어 근사음.
    ⚠️ 예전에는 word와 ko만 있었는데 숫자 행에서 word='Three'·ko='트리'(=TREE)로 **한 줄 안에서
       철자와 발음이 어긋났다.** 원인은 ICAO 표에 '숫자의 영어 단어 철자'라는 열이 아예 없다는 것 —
       표의 두 열은 '숫자'와 '발음'뿐이다. 그래서 규정 발음을 say로 분리하고, 숫자의 word는
       일상 표기임을 화면에서 구분해 보여 준다. */
export interface NatoEntry { ch: string; word: string; say: string; ko: string; kind?: 'unit' }
export const NATO: NatoEntry[] = [
  { ch: 'A', word: 'Alfa', say: 'AL FAH', ko: '알파' },
  { ch: 'B', word: 'Bravo', say: 'BRAH VOH', ko: '브라보' },
  { ch: 'C', word: 'Charlie', say: 'CHAR LEE', ko: '찰리' },
  { ch: 'D', word: 'Delta', say: 'DELL TAH', ko: '델타' },
  { ch: 'E', word: 'Echo', say: 'ECK OH', ko: '에코' },
  { ch: 'F', word: 'Foxtrot', say: 'FOKS TROT', ko: '폭스트롯' },
  { ch: 'G', word: 'Golf', say: 'GOLF', ko: '골프' },
  { ch: 'H', word: 'Hotel', say: 'HOH TELL', ko: '호텔' },
  { ch: 'I', word: 'India', say: 'IN DEE AH', ko: '인디아' },
  { ch: 'J', word: 'Juliett', say: 'JEW LEE ETT', ko: '줄리엣' },
  { ch: 'K', word: 'Kilo', say: 'KEY LOH', ko: '킬로' },
  { ch: 'L', word: 'Lima', say: 'LEE MAH', ko: '리마' },
  { ch: 'M', word: 'Mike', say: 'MIKE', ko: '마이크' },
  { ch: 'N', word: 'November', say: 'NO VEM BER', ko: '노벰버' },
  { ch: 'O', word: 'Oscar', say: 'OSS CAH', ko: '오스카' },
  { ch: 'P', word: 'Papa', say: 'PAH PAH', ko: '파파' },
  /* ⚠️ Q의 규정 발음은 '퀘벡'이 아니라 KEH BECK(케벡)이다 — 26자 중 일상 독음과 가장 크게 어긋난다. */
  { ch: 'Q', word: 'Quebec', say: 'KEH BECK', ko: '케벡' },
  { ch: 'R', word: 'Romeo', say: 'ROW ME OH', ko: '로미오' },
  { ch: 'S', word: 'Sierra', say: 'SEE AIR RAH', ko: '시에라' },
  { ch: 'T', word: 'Tango', say: 'TANG GO', ko: '탱고' },
  { ch: 'U', word: 'Uniform', say: 'YOU NEE FORM', ko: '유니폼' },
  { ch: 'V', word: 'Victor', say: 'VIK TAH', ko: '빅타' },
  { ch: 'W', word: 'Whiskey', say: 'WISS KEY', ko: '위스키' },
  /* ⚠️ ICAO Annex 10·ITU 무선규칙 부록14·NATO 공식 표기는 모두 하이픈이 있는 'X-ray'다.
        하이픈 없는 'XRAY'는 군용 통신규정 ACP 125 표의 표기. */
  { ch: 'X', word: 'X-ray', say: 'ECKS RAY', ko: '엑스레이' },
  { ch: 'Y', word: 'Yankee', say: 'YANG KEY', ko: '양키' },
  { ch: 'Z', word: 'Zulu', say: 'ZOO LOO', ko: '줄루' },
  /* 숫자 — word 열은 일상 영어 표기이고, 규정된 것은 say(발음)다.
     ICAO Annex 10 Vol II 5.2.1.4.3.1: "numbers shall be transmitted using the following
     pronunciation" — 영어로 통신할 때는 선택이 아니라 의무다. */
  { ch: '0', word: 'Zero', say: 'ZE-RO', ko: '제로' },
  { ch: '1', word: 'One', say: 'WUN', ko: '원' },
  { ch: '2', word: 'Two', say: 'TOO', ko: '투' },
  { ch: '3', word: 'Three', say: 'TREE', ko: '트리' },
  { ch: '4', word: 'Four', say: 'FOW-er', ko: '포워' },
  { ch: '5', word: 'Five', say: 'FIFE', ko: '파이프' },
  { ch: '6', word: 'Six', say: 'SIX', ko: '식스' },
  { ch: '7', word: 'Seven', say: 'SEV-en', ko: '세븐' },
  { ch: '8', word: 'Eight', say: 'AIT', ko: '에이트' },
  { ch: '9', word: 'Nine', say: 'NIN-er', ko: '나이너' },
]

/** ICAO 표가 숫자와 함께 규정하는 단위어 — 도구의 철자 변환 대상은 아니지만 참고표에 싣는다. */
export const NATO_UNITS: NatoEntry[] = [
  { ch: '.', word: 'Decimal', say: 'DAY-SEE-MAL', ko: '데이시말', kind: 'unit' },
  { ch: '100', word: 'Hundred', say: 'HUN-dred', ko: '헌드러드', kind: 'unit' },
  { ch: '1000', word: 'Thousand', say: 'TOU-SAND', ko: '타우산드', kind: 'unit' },
]
const NATO_MAP = new Map(NATO.map((n) => [n.ch, n]))

export interface NatoSpell { entries: NatoEntry[]; unmapped: string[] }

export function spellNatoDetailed(text: string): NatoSpell {
  const out: NatoEntry[] = []
  const unmapped: string[] = []
  for (const raw of [...text]) {
    const up = raw.toUpperCase()
    const e = NATO_MAP.get(up)
    if (e) { out.push(e); continue }
    if (/\s/.test(raw)) { out.push({ ch: ' ', word: '(띄어쓰기)', say: '', ko: '' }); continue }
    /* 음성 문자표에 없는 글자 — 그대로 두되 '읽을 코드어가 없다'는 사실을 화면에서 알린다.
       ⚠️ 예전에는 word에 그 글자를 그대로 넣어, 복사한 문자열에 '-'·'한' 같은 값이 섞여 나갔다. */
    out.push({ ch: raw, word: raw, say: '', ko: '' })
    unmapped.push(raw)
  }
  return { entries: out, unmapped }
}

export function spellNato(text: string): NatoEntry[] {
  return spellNatoDetailed(text).entries
}
