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
  octave: number         // 4 (음악 정통, C4 = middle C)
  koreanOctave: number   // 3 (한국 관행, C4 = 3옥타브 도)
  korean: string         // "3옥타브 라"
  frequency: number
}

export function midiToNote(midi: number): NoteInfo {
  const rounded = Math.round(midi)
  const octave = Math.floor(rounded / 12) - 1
  const idx = ((rounded % 12) + 12) % 12
  const koreanOctave = octave - 1  // C4 = 3옥타브
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
  // "A4", "F#3" 등 파싱
  const m = name.match(/^([A-G])(#|b)?(-?\d+)$/)
  if (!m) return 60
  const noteIdx = NOTE_NAMES.indexOf(m[1] + (m[2] === '#' ? '#' : ''))
  const octave = parseInt(m[3], 10)
  let idx = noteIdx
  if (m[2] === 'b') {
    // flat → 한 칸 아래
    idx = NOTE_NAMES.indexOf(m[1])
    if (idx > 0) idx--
  }
  if (idx < 0) idx = 0
  return (octave + 1) * 12 + idx
}

/* cents 차이 (-50 ~ +50): 음표 정확도 */
export function midiCents(midi: number): number {
  const rounded = Math.round(midi)
  return Math.round((midi - rounded) * 100)
}
