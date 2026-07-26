/* 스케일 음계 계산기 — 데이터·계산 유틸 */

export type Accidental = 'sharp' | 'flat'
export type ScaleId =
  | 'major' | 'natminor' | 'harmonic' | 'melodic'
  | 'majpenta' | 'minpenta' | 'blues'
  | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian'

export type Tuning = 'standard' | 'dropd' | 'openg' | 'dadgad'

/* 12 음 (반음 단위, 0=C) */
export const NOTES_SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
export const NOTES_FLAT  = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']

/** 키 인덱스 (0~11) → 표기 */
export function noteName(idx: number, acc: Accidental = 'sharp'): string {
  const i = ((idx % 12) + 12) % 12
  return acc === 'sharp' ? NOTES_SHARP[i] : NOTES_FLAT[i]
}

/* 각 키 인덱스 (UI 키 선택용) */
export interface KeyMeta {
  index: number
  sharp: string
  flat: string
}

export const KEYS: KeyMeta[] = NOTES_SHARP.map((s, i) => ({
  index: i,
  sharp: s,
  flat: NOTES_FLAT[i],
}))

/* ─────────────────────────────────────────────
   스케일 정의 (반음 간격 기준)
   ───────────────────────────────────────────── */

export interface ScaleMeta {
  id: ScaleId
  emoji: string
  label: string
  shortName: string
  intervals: number[]      // 반음 간격 (루트=0 기준)
  pattern: string          // W-W-H-W-W-W-H 등
  degrees: string[]        // 도수 표시 (1·2·♭3 등)
  mood: string
  genre: string
  examples: string
  desc: string
}

export const SCALES: ScaleMeta[] = [
  {
    id: 'major',
    emoji: '😊',
    label: 'Major (Ionian)',
    shortName: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    pattern: 'W-W-H-W-W-W-H',
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    mood: '밝음·행복·안정',
    genre: '팝·동요·축가·클래식',
    examples: '🎵 Happy Birthday · Let It Be',
    desc: '가장 기본적인 장음계. 도-레-미-파-솔-라-시.',
  },
  {
    id: 'natminor',
    emoji: '😢',
    label: 'Natural Minor (Aeolian)',
    shortName: 'Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    pattern: 'W-H-W-W-H-W-W',
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
    mood: '슬픔·차분·우수',
    genre: '록·발라드·블루스',
    examples: '🎵 Losing My Religion · All Along the Watchtower',
    desc: '기본 단음계. ♭3·♭6·♭7로 우울한 느낌.',
  },
  {
    id: 'harmonic',
    emoji: '🌌',
    label: 'Harmonic Minor',
    shortName: 'Harmonic',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    pattern: 'W-H-W-W-H-W½-H',
    degrees: ['1', '2', '♭3', '4', '5', '♭6', '7'],
    mood: '이국적·드라마틱·신비',
    genre: '클래식·중동·메탈·플라멩코',
    examples: '🎵 Hava Nagila · 네오클래시컬 메탈 (Yngwie Malmsteen)',
    desc: '자연단음계의 7도를 반음 올림. 6→7도가 1.5음 점프.',
  },
  {
    id: 'melodic',
    emoji: '✨',
    label: 'Melodic Minor (상행)',
    shortName: 'Melodic',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    pattern: 'W-H-W-W-W-W-H',
    degrees: ['1', '2', '♭3', '4', '5', '6', '7'],
    mood: '재즈·세련·복합',
    genre: '재즈·보사노바·현대 클래식',
    examples: '🎵 Yesterday (Beatles) · 재즈 마이너 솔로',
    desc: '단음계의 6·7도를 반음 올림. 상행 시 사용.',
  },
  {
    id: 'majpenta',
    emoji: '🌸',
    label: 'Major Pentatonic',
    shortName: 'Major Pent',
    intervals: [0, 2, 4, 7, 9],
    pattern: 'W-W-W½-W-W½',
    degrees: ['1', '2', '3', '5', '6'],
    mood: '밝음·동요·민요',
    genre: '컨트리·팝·한국 민요',
    examples: '🎵 Amazing Grace · 아리랑',
    desc: '5음 음계. 4도와 7도 제거로 불협화음 없음.',
  },
  {
    id: 'minpenta',
    emoji: '🎸',
    label: 'Minor Pentatonic',
    shortName: 'Minor Pent',
    intervals: [0, 3, 5, 7, 10],
    pattern: 'W½-W-W-W½-W',
    degrees: ['1', '♭3', '4', '5', '♭7'],
    mood: '록·블루스·솔로',
    genre: '록·블루스·팝·솔로 즉흥',
    examples: '🎵 Smoke on the Water · 록 솔로 표준',
    desc: '록·블루스 솔로의 표준. 5음으로 어디든 어울림.',
  },
  {
    id: 'blues',
    emoji: '🎺',
    label: 'Blues',
    shortName: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    pattern: 'W½-W-H-H-W½-W',
    degrees: ['1', '♭3', '4', '♭5', '5', '♭7'],
    mood: '블루지·끈적함·소울풀',
    genre: '블루스·재즈·록',
    examples: '🎵 Sweet Home Chicago · BB King',
    desc: 'Minor Pentatonic + ♭5(블루노트). 12-bar blues 표준.',
  },
  {
    id: 'dorian',
    emoji: '🍃',
    label: 'Dorian',
    shortName: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    pattern: 'W-H-W-W-W-H-W',
    degrees: ['1', '2', '♭3', '4', '5', '6', '♭7'],
    mood: '재즈적·세련·중성',
    genre: '재즈·소울·록 (모달)',
    examples: '🎵 Scarborough Fair · So What (Miles Davis)',
    desc: 'Minor + M6. 자연단음계보다 밝고 재즈에 표준.',
  },
  {
    id: 'phrygian',
    emoji: '🌶️',
    label: 'Phrygian',
    shortName: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    pattern: 'H-W-W-W-H-W-W',
    degrees: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
    mood: '스페인·메탈·이국적',
    genre: '플라멩코·메탈·중동',
    examples: '🎵 Wherever I May Roam · 스페인 기타',
    desc: 'Minor + ♭2. 강렬하고 이국적. 메탈 솔로에도 자주.',
  },
  {
    id: 'lydian',
    emoji: '🌙',
    label: 'Lydian',
    shortName: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    pattern: 'W-W-W-H-W-W-H',
    degrees: ['1', '2', '3', '♯4', '5', '6', '7'],
    mood: '꿈결·부유감·신비',
    genre: '영화 OST·재즈·환상적',
    examples: '🎵 The Simpsons · E.T. Flying Theme',
    desc: 'Major + ♯4. 환상적·부유하는 느낌, 영화 OST에 자주.',
  },
  {
    id: 'mixolydian',
    emoji: '🤘',
    label: 'Mixolydian',
    shortName: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    pattern: 'W-W-H-W-W-H-W',
    degrees: ['1', '2', '3', '4', '5', '6', '♭7'],
    mood: '블루지·록·축제',
    genre: '블루스·록·아일랜드 민요',
    examples: '🎵 Sweet Child O\' Mine (인트로) · Norwegian Wood (벌스)',
    desc: 'Major + ♭7. 도미넌트 7th의 본격 모드, 록·블루스 표준.',
  },
  {
    id: 'locrian',
    emoji: '😈',
    label: 'Locrian',
    shortName: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    pattern: 'H-W-W-H-W-W-W',
    degrees: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
    mood: '가장 어두움·불안정',
    genre: '메탈·실험·재즈',
    examples: '🎵 Army of Me (Björk) · 메탈 일부',
    desc: '♭2 + ♭5. 가장 어두운 모드, 안정감이 거의 없음.',
  },
]

export const getScale = (id: ScaleId) => SCALES.find((s) => s.id === id)!

/* ─────────────────────────────────────────────
   스케일 음 생성
   ───────────────────────────────────────────── */

/** 키(0~11) + 스케일 → 음 인덱스 배열 (한 옥타브) */
export function buildScale(rootKey: number, scale: ScaleMeta): number[] {
  return scale.intervals.map((iv) => (rootKey + iv) % 12)
}

/* ─────────────────────────────────────────────
   도수 기반 레터워크 철자 — 반음이 아니라 도수가 글자를 결정
   (장음계 계열은 A~G 7글자를 한 번씩 사용, F♯ 장조 E♯·G♭ 장조 C♭)
   ───────────────────────────────────────────── */

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

function accStr(diff: number): string {
  if (diff === 0) return ''
  if (diff === 1) return '♯'
  if (diff === 2) return '𝄪'
  if (diff === -1) return '♭'
  if (diff === -2) return '𝄫'
  return diff > 0 ? '♯'.repeat(diff) : '♭'.repeat(-diff)
}

/** 루트 표기에서 시작해 도수 숫자만큼 글자를 걸어가며 철자 생성 (블루스 ♭5·5처럼 같은 숫자는 같은 글자) */
function spellFromRoot(rootName: string, rootPc: number, scale: ScaleMeta): string[] {
  const rIdx = LETTERS.indexOf(rootName[0])
  return scale.degrees.map((d, i) => {
    const num = parseInt(d.replace(/[^\d]/g, ''), 10)
    const letter = LETTERS[(rIdx + num - 1) % 7]
    const pc = (rootPc + scale.intervals[i]) % 12
    let diff = pc - LETTER_PC[letter]
    while (diff > 6) diff -= 12
    while (diff < -6) diff += 12
    return letter + accStr(diff)
  })
}

export interface ScaleSpelling {
  rootName: string             // 실제 표기에 쓴 루트 (이명동음 전환 시 원선택과 다름)
  names: string[]              // 도수별 철자
  byPc: Record<number, string> // 피아노·지판 라벨용 pc → 철자
  respelled: boolean           // 이중임시표(𝄪·𝄫) 회피를 위해 이명동음 루트로 전환됨
}

const hasDoubleAcc = (ns: string[]) => ns.some((n) => n.includes('𝄪') || n.includes('𝄫'))

export function buildScaleSpelling(rootKey: number, scale: ScaleMeta, acc: Accidental): ScaleSpelling {
  const primary = noteName(rootKey, acc)
  let rootName = primary
  let names = spellFromRoot(primary, rootKey, scale)
  let respelled = false
  // D♯ 장조(F𝄪)처럼 이중임시표가 나오는 이론적 조성은 실용 관행대로 이명동음(E♭ 장조)으로 표기
  const alt = noteName(rootKey, acc === 'sharp' ? 'flat' : 'sharp')
  if (hasDoubleAcc(names) && alt !== primary) {
    const altNames = spellFromRoot(alt, rootKey, scale)
    if (!hasDoubleAcc(altNames)) {
      rootName = alt
      names = altNames
      respelled = true
    }
  }
  const byPc: Record<number, string> = {}
  scale.intervals.forEach((iv, i) => { byPc[(rootKey + iv) % 12] = names[i] })
  return { rootName, names, byPc, respelled }
}

/** 키 + 스케일 → 표기명 배열 (레터워크 철자) */
export function buildScaleNames(rootKey: number, scale: ScaleMeta, acc: Accidental): string[] {
  return buildScaleSpelling(rootKey, scale, acc).names
}

/* ─────────────────────────────────────────────
   다이어토닉 코드 생성 (자연 7화음)
   ───────────────────────────────────────────── */

export interface DiatonicChord {
  degree: string         // I, ii, iii, IV, V, vi, viiº
  root: string           // 코드 루트 (음 이름)
  rootIdx: number
  name: string           // 코드 이름 (Cmaj7·Dm7 등)
  type: string           // 코드 종류 (maj7·m7·dom7·m7♭5)
  notes: number[]        // 4 음 인덱스
  notesNames: string[]
  function: 'Tonic' | 'Subdominant' | 'Dominant' | null   // 모달 스케일은 장·단조식 T/SD/D 분류를 보류
  color: string
}

/** 스케일 안의 i번째 음(0~6)에서 위로 3-5-7도 쌓아 7화음 생성 */
function buildSeventhChord(scaleNotes: number[], i: number): { type: string; notes: number[] } {
  const root = scaleNotes[i]
  const third = scaleNotes[(i + 2) % scaleNotes.length]
  const fifth = scaleNotes[(i + 4) % scaleNotes.length]
  const seventh = scaleNotes[(i + 6) % scaleNotes.length]

  const intervals = [
    ((third - root) + 12) % 12,
    ((fifth - root) + 12) % 12,
    ((seventh - root) + 12) % 12,
  ]
  const [m3, m5, m7] = intervals

  let type = ''
  if (m3 === 4 && m5 === 7 && m7 === 11) type = 'maj7'
  else if (m3 === 4 && m5 === 7 && m7 === 10) type = '7'  // dominant 7
  else if (m3 === 3 && m5 === 7 && m7 === 10) type = 'm7'
  else if (m3 === 3 && m5 === 7 && m7 === 11) type = 'mM7'  // 마이너-메이저7 (하모닉·멜로딕 i도)
  else if (m3 === 3 && m5 === 6 && m7 === 10) type = 'm7♭5'
  else if (m3 === 3 && m5 === 6 && m7 === 9) type = 'dim7'
  else if (m3 === 4 && m5 === 8 && m7 === 11) type = 'maj7♯5'
  else type = '7'

  return { type, notes: [root, third, fifth, seventh] }
}

/** 코드 기능 분류 — 장·단조 화성학 관행 (모달 스케일에는 적용하지 않음) */
function chordFunction(degree: number): 'Tonic' | 'Subdominant' | 'Dominant' {
  if (degree === 0 || degree === 2 || degree === 5) return 'Tonic'
  if (degree === 1 || degree === 3) return 'Subdominant'
  return 'Dominant'
}

/** T/SD/D 분류가 통용되는 장·단조 계열 (교회 모드는 모달 화성이라 보류) */
export const FUNCTIONAL_SCALES: ScaleId[] = ['major', 'natminor', 'harmonic', 'melodic']

const FUNCTION_COLOR = {
  Tonic: 'var(--cat-edu)',
  Subdominant: 'var(--cat-cooking)',
  Dominant: 'var(--cat-date)',
}

const ROMAN_BASE = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

/** 도수 라벨 — 스케일 도수(♭·♯ 접두)와 실제 화음 품질(대소문자·ø/º/+)로 동적 생성 */
function degreeLabel(degStr: string, chordType: string): string {
  const accPrefix = degStr.startsWith('♭') ? '♭' : degStr.startsWith('♯') ? '♯' : ''
  const num = parseInt(degStr.replace(/[^\d]/g, ''), 10) - 1
  const base = ROMAN_BASE[num] ?? 'I'
  const isMinorType = chordType === 'm7' || chordType === 'mM7'
  const isDimType = chordType === 'm7♭5' || chordType === 'dim7'
  const roman = isMinorType || isDimType ? base.toLowerCase() : base
  const suffix = chordType === 'm7♭5' ? 'ø' : chordType === 'dim7' ? 'º' : chordType === 'maj7♯5' ? '+' : ''
  return accPrefix + roman + suffix
}

export function buildDiatonicChords(rootKey: number, scale: ScaleMeta, acc: Accidental): DiatonicChord[] {
  /* 7음 스케일만 다이어토닉 코드 의미 있음 (Pentatonic·Blues는 적용 X) */
  if (scale.intervals.length !== 7) return []

  const scaleNotes = buildScale(rootKey, scale)
  const spelling = buildScaleSpelling(rootKey, scale, acc)
  const functional = FUNCTIONAL_SCALES.includes(scale.id)

  return scaleNotes.map((rootIdx, i) => {
    const chord = buildSeventhChord(scaleNotes, i)
    // 코드 루트·구성음 철자는 스케일 레터워크 철자를 그대로 사용 (F♯ 장조 ⅶø = E♯m7♭5)
    const root = spelling.names[i]
    const notesNames = [0, 2, 4, 6].map((k) => spelling.names[(i + k) % 7])
    const fn = functional ? chordFunction(i) : null
    return {
      degree: degreeLabel(scale.degrees[i], chord.type),
      root,
      rootIdx,
      name: `${root}${chord.type}`,
      type: chord.type,
      notes: chord.notes,
      notesNames,
      function: fn,
      color: fn ? FUNCTION_COLOR[fn] : 'var(--accent)',
    }
  })
}

/* ─────────────────────────────────────────────
   교회 모드 7종 (Major 기준 비교)
   ───────────────────────────────────────────── */

export const CHURCH_MODES: ScaleId[] = ['major', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'natminor', 'locrian']

export const MODE_NAMES: Record<ScaleId, string> = {
  major:      'Ionian (Major)',
  dorian:     'Dorian',
  phrygian:   'Phrygian',
  lydian:     'Lydian',
  mixolydian: 'Mixolydian',
  natminor:   'Aeolian (Natural Minor)',
  locrian:    'Locrian',
  harmonic:   '',
  melodic:    '',
  majpenta:   '',
  minpenta:   '',
  blues:      '',
}

/* ─────────────────────────────────────────────
   기타 튜닝
   ───────────────────────────────────────────── */

export interface TuningMeta {
  id: Tuning
  label: string
  /** 6→1번줄 음 인덱스 (낮은음에서 높은음 순) */
  strings: number[]
}

export const TUNINGS: TuningMeta[] = [
  { id: 'standard', label: 'Standard (EADGBE)',  strings: [4, 9, 2, 7, 11, 4] },   // E A D G B E
  { id: 'dropd',    label: 'Drop D (DADGBE)',     strings: [2, 9, 2, 7, 11, 4] },
  { id: 'openg',    label: 'Open G (DGDGBD)',     strings: [2, 7, 2, 7, 11, 2] },
  { id: 'dadgad',   label: 'DADGAD',              strings: [2, 9, 2, 7, 9, 2] },
]

/* ─────────────────────────────────────────────
   주파수 계산 (MIDI 기반, A4 = 440Hz)
   ───────────────────────────────────────────── */

/** 음 인덱스 + 옥타브 → 주파수
 *  C4 = MIDI 60, A4 = MIDI 69 = 440Hz
 *  freq = 440 * 2^((midi - 69) / 12)
 */
export function noteFreq(noteIdx: number, octave = 4): number {
  const midi = 12 + octave * 12 + noteIdx  // C0=12, C4=60
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/* ─────────────────────────────────────────────
   진행 추천 4종
   ───────────────────────────────────────────── */

export interface Progression {
  id: string
  emoji: string
  label: string
  pattern: number[]   // 도수 인덱스 (0=I, 1=ii, 2=iii, ...)
  home: 'major' | 'minor'   // 진행 이름·예시 곡이 통용되는 조성 (그 외 스케일에선 도수 적용 예시로만 표시)
  desc: string
  examples: string
}

export const PROGRESSIONS: Progression[] = [
  { id: 'pop',     emoji: '🎤', label: 'I-V-vi-IV (Pop)',           pattern: [0, 4, 5, 3], home: 'major', desc: '가장 인기 있는 진행. 수많은 팝송에 사용.', examples: 'Let It Be · Don\'t Stop Believin\'' },
  { id: 'jazz',   emoji: '🎷', label: 'ii-V-I (Jazz)',              pattern: [1, 4, 0],    home: 'major', desc: '재즈의 가장 기본 진행.',                     examples: 'Autumn Leaves · 모든 재즈 스탠다드' },
  { id: 'doowop', emoji: '🎶', label: 'I-vi-IV-V (50\'s Doo-wop)',  pattern: [0, 5, 3, 4], home: 'major', desc: '50년대 두왑·발라드 표준.',                  examples: 'Stand By Me · Earth Angel' },
  { id: 'and',    emoji: '🌶️', label: 'i-VII-VI-V (Andalusian)',    pattern: [0, 6, 5, 4], home: 'minor', desc: '스페인·플라멩코 분위기. 실전에서는 마지막 v를 장화음 V(예: A단조의 E·E7)로 바꿔 치는 관행.',              examples: 'Hit the Road Jack · Stray Cat Strut' },
]

/* ─────────────────────────────────────────────
   포맷
   ───────────────────────────────────────────── */

export const fmt = (n: number, digits = 1) =>
  n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits })

/* 컬러 (피아노·기타 시각화 공통) */
export const COLORS = {
  root: 'var(--cat-date)',
  third: 'var(--cat-cooking)',
  fifth: 'var(--cat-cooking)',
  other: 'var(--cat-edu)',
  bg: 'var(--bg3)',
}

/** 인터벌(0~11) → 시각화 색상 */
export function intervalColor(interval: number): string {
  if (interval === 0) return COLORS.root
  if (interval === 4 || interval === 3) return COLORS.third
  if (interval === 7 || interval === 6) return COLORS.fifth
  return COLORS.other
}
