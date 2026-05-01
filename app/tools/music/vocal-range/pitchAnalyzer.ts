/* ──────────────────────────────────────────────────────
   music/vocal-range/pitchAnalyzer.ts
   마이크 입력 + pitchy YIN 알고리즘
   ────────────────────────────────────────────────────── */

import { PitchDetector } from 'pitchy'
import { frequencyToMidi } from './noteUtils'

export interface PitchSample {
  frequency: number
  clarity: number
  midi: number
  rms: number
  timestamp: number
}

export interface StableNote {
  midi: number
  noteRoundedMidi: number
  durationMs: number
  avgClarity: number
  avgFreq: number
  startTime: number
}

export type AnalyzerStatus = 'idle' | 'requesting' | 'running' | 'error' | 'stopped'

export interface AnalyzerCallbacks {
  onSample?: (s: PitchSample) => void
  onVolume?: (rms: number) => void
  onStatusChange?: (status: AnalyzerStatus, error?: string) => void
}

export class VocalAnalyzer {
  private audioContext: AudioContext | null = null
  private analyserNode: AnalyserNode | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private detector: PitchDetector<any> | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buffer: any = null
  private rafId: number | null = null
  private mediaStream: MediaStream | null = null
  private samples: PitchSample[] = []
  private cb: AnalyzerCallbacks = {}
  private status: AnalyzerStatus = 'idle'

  // 사람 목소리 범위 (E2 ~ C7, 약 80~2100 Hz — 가성/소프라노 포함)
  private readonly MIN_FREQ = 70
  private readonly MAX_FREQ = 2200
  private readonly MIN_CLARITY = 0.85
  private readonly MIN_RMS = 0.01

  async start(callbacks: AnalyzerCallbacks): Promise<void> {
    this.cb = callbacks
    this.setStatus('requesting')

    try {
      // iOS Safari: 사용자 제스처 후에만 AudioContext 생성 가능
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioContext = new AC()

      // 마이크 권한
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 2048
      source.connect(this.analyserNode)

      this.detector = PitchDetector.forFloat32Array(this.analyserNode.fftSize)
      this.buffer = new Float32Array(this.detector.inputLength)

      this.setStatus('running')
      this.tick()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'unknown error'
      this.setStatus('error', msg)
      throw e
    }
  }

  private setStatus(s: AnalyzerStatus, err?: string) {
    this.status = s
    this.cb.onStatusChange?.(s, err)
  }

  private tick = () => {
    if (!this.analyserNode || !this.detector || !this.buffer || !this.audioContext) return

    this.analyserNode.getFloatTimeDomainData(this.buffer)

    // RMS (볼륨)
    let sumSq = 0
    for (let i = 0; i < this.buffer.length; i++) sumSq += this.buffer[i] * this.buffer[i]
    const rms = Math.sqrt(sumSq / this.buffer.length)
    this.cb.onVolume?.(rms)

    if (rms < this.MIN_RMS) {
      this.rafId = requestAnimationFrame(this.tick)
      return
    }

    const [freq, clarity] = this.detector.findPitch(this.buffer, this.audioContext.sampleRate)

    if (clarity < this.MIN_CLARITY || freq < this.MIN_FREQ || freq > this.MAX_FREQ) {
      this.rafId = requestAnimationFrame(this.tick)
      return
    }

    const sample: PitchSample = {
      frequency: freq,
      clarity,
      midi: frequencyToMidi(freq),
      rms,
      timestamp: Date.now(),
    }

    this.samples.push(sample)
    if (this.samples.length > 5000) this.samples.shift()
    this.cb.onSample?.(sample)

    this.rafId = requestAnimationFrame(this.tick)
  }

  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop())
      this.mediaStream = null
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => { /* */ })
      this.audioContext = null
    }
    this.analyserNode = null
    this.detector = null
    this.buffer = null
    this.setStatus('stopped')
  }

  clearSamples() { this.samples = [] }
  getSamples() { return [...this.samples] }
  getStatus() { return this.status }
}

/* ─── 안정 음 감지 ─── */
export function detectStableNotes(samples: PitchSample[]): StableNote[] {
  if (samples.length < 10) return []
  const stable: StableNote[] = []
  const MIN_DURATION_MS = 500
  const MIDI_TOLERANCE = 0.7  // 반음의 70% 이내 흔들림 허용

  let groupStart = 0
  for (let i = 1; i <= samples.length; i++) {
    const isLast = i === samples.length
    const diff = isLast ? Infinity : Math.abs(samples[i].midi - samples[i - 1].midi)

    if (diff > MIDI_TOLERANCE || isLast) {
      const group = samples.slice(groupStart, i)
      if (group.length >= 5) {
        const duration = group[group.length - 1].timestamp - group[0].timestamp
        if (duration >= MIN_DURATION_MS) {
          const avgMidi = group.reduce((s, x) => s + x.midi, 0) / group.length
          const avgClarity = group.reduce((s, x) => s + x.clarity, 0) / group.length
          const avgFreq = group.reduce((s, x) => s + x.frequency, 0) / group.length
          stable.push({
            midi: avgMidi,
            noteRoundedMidi: Math.round(avgMidi),
            durationMs: duration,
            avgClarity,
            avgFreq,
            startTime: group[0].timestamp,
          })
        }
      }
      groupStart = i
    }
  }
  return stable
}

/* ─── 음역 통계 ─── */
export interface RangeStats {
  lowestMidi: number   // 가장 낮은 안정 음
  highestMidi: number
  rangeSemitones: number
  octaves: number
  noteCount: number    // 안정 음 개수
}

export function calcRangeStats(stableNotes: StableNote[]): RangeStats | null {
  if (stableNotes.length === 0) return null
  const lowest = stableNotes.reduce((m, n) => n.noteRoundedMidi < m.noteRoundedMidi ? n : m)
  const highest = stableNotes.reduce((m, n) => n.noteRoundedMidi > m.noteRoundedMidi ? n : m)
  const range = highest.noteRoundedMidi - lowest.noteRoundedMidi
  return {
    lowestMidi: lowest.noteRoundedMidi,
    highestMidi: highest.noteRoundedMidi,
    rangeSemitones: range,
    octaves: Math.round((range / 12) * 10) / 10,
    noteCount: stableNotes.length,
  }
}
