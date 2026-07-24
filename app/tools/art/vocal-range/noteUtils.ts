/* ──────────────────────────────────────────────────────
   music/vocal-range/noteUtils.ts
   MIDI ↔ 음표 ↔ 한국식 표기 변환
   ────────────────────────────────────────────────────── */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const KOREAN_NOTES = ['도', '도#', '레', '레#', '미', '파', '파#', '솔', '솔#', '라', '라#', '시']

export interface NoteInfo {
  midi: number
  name: string          // "A4"
  noteOnly: string       // "A"
  octave: number         // 4 (국제 과학 표기, C4 = middle C)
  koreanOctave: number   // 2 (한국 대중음악 관행, C4 = 2옥타브 도 · A4 = 2옥타브 라)
  korean: string         // "2옥타브 라"
  frequency: number
}

export function midiToNote(midi: number): NoteInfo {
  const rounded = Math.round(midi)
  const octave = Math.floor(rounded / 12) - 1
  const idx = ((rounded % 12) + 12) % 12
  /* 한국 보컬 커뮤니티 관행 = 과학 옥타브 − 2 (앵커: 소찬휘 Tears 최고음 G5 = "3옥타브 솔",
     남성 고음 기준 A4 = "2옥타브 라"). E2 등 저음은 "0옥타브 미"로 음수·0 옥타브 표기가 정상 */
  const koreanOctave = octave - 2
  return {
    midi: rounded,
    name: `${NOTE_NAMES[idx]}${octave}`,
    noteOnly: NOTE_NAMES[idx],
    octave,
    koreanOctave,
    korean: `${koreanOctave}옥타브 ${KOREAN_NOTES[idx]}`,
    frequency: midiToFrequency(rounded),
  }
}

export function frequencyToMidi(freq: number): number {
  if (freq <= 0) return 0
  return 69 + 12 * Math.log2(freq / 440)
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export function noteNameToMidi(name: string): number {
  // "A4", "F#3", "Bb2" 등 파싱 — 변화표는 자연음 MIDI ±1 (Cb4=B3, B#3=C4 옥타브 경계 자동 처리)
  const m = name.match(/^([A-G])(#|b)?(-?\d+)$/)
  if (!m) return 60
  const natural = NOTE_NAMES.indexOf(m[1])
  const accidental = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0
  const octave = parseInt(m[3], 10)
  return (octave + 1) * 12 + natural + accidental
}

/* cents 차이 (-50 ~ +50): 음표 정확도 */
export function midiCents(midi: number): number {
  const rounded = Math.round(midi)
  return Math.round((midi - rounded) * 100)
}
