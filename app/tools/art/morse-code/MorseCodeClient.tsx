'use client'

import { useRef, useState } from 'react'
import { encodeMorse, decodeMorse, spellNato, NATO, type Lang } from './morseData'
import s from './morse-code.module.css'

type Mode = 'morse' | 'nato'
type Dir = 'encode' | 'decode'

const FREQ = 600
const sanitizeMorse = (v: string) => v.replace(/[^.\-/\s]/g, '')

export default function MorseCodeClient() {
  const [mode, setMode] = useState<Mode>('morse')
  const [dir, setDir] = useState<Dir>('encode')
  const [lang, setLang] = useState<Lang>('ko')
  const [input, setInput] = useState('안녕하세요')
  const [wpm, setWpm] = useState(13)
  const [playing, setPlaying] = useState(false)
  const [lampOn, setLampOn] = useState(false)
  const [natoInput, setNatoInput] = useState('Toolify')
  const [copied, setCopied] = useState('')

  const ctxRef = useRef<AudioContext | null>(null)
  const timers = useRef<number[]>([])

  // 모스 결과
  const output = dir === 'encode' ? encodeMorse(input, lang) : decodeMorse(sanitizeMorse(input), lang)
  const morseToPlay = dir === 'encode' ? output : sanitizeMorse(input)

  const copy = async (text: string, key: string) => {
    if (!text) return
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(''), 1200) } catch { /* noop */ }
  }

  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    try { ctxRef.current?.close() } catch { /* noop */ }
    ctxRef.current = null
    setPlaying(false)
    setLampOn(false)
  }

  const play = () => {
    if (playing) { stop(); return }
    const code = morseToPlay.trim()
    if (!/[.-]/.test(code)) return

    type AC = typeof AudioContext
    const Ctor: AC | undefined = window.AudioContext || (window as unknown as { webkitAudioContext?: AC }).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    ctxRef.current = ctx
    const u = 1.2 / wpm // 1 unit(초) — PARIS 기준

    // 톤 구간 [start,end] (초) 누적 계산
    const tones: Array<[number, number]> = []
    let t = 0
    code.split(/\s*\/\s*/).forEach((word, wi) => {
      if (wi > 0) t += 7 * u
      word.split(/\s+/).filter(Boolean).forEach((letter, li) => {
        if (li > 0) t += 3 * u
        ;[...letter].forEach((el, ei) => {
          if (ei > 0) t += u
          const dur = el === '-' ? 3 * u : u
          tones.push([t, t + dur]); t += dur
        })
      })
    })
    const total = t

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = FREQ
    osc.type = 'sine'
    gain.gain.value = 0
    osc.connect(gain); gain.connect(ctx.destination)
    const t0 = ctx.currentTime + 0.06
    for (const [a, b] of tones) {
      gain.gain.setValueAtTime(0.0001, t0 + a)
      gain.gain.exponentialRampToValueAtTime(0.28, t0 + a + 0.008)
      gain.gain.setValueAtTime(0.28, t0 + b - 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + b)
      // 램프(불빛) 동기화
      timers.current.push(window.setTimeout(() => setLampOn(true), (0.06 + a) * 1000))
      timers.current.push(window.setTimeout(() => setLampOn(false), (0.06 + b) * 1000))
    }
    osc.start(t0)
    osc.stop(t0 + total + 0.05)
    setPlaying(true)
    timers.current.push(window.setTimeout(stop, (0.06 + total + 0.1) * 1000))
  }

  const swapDir = () => {
    // 결과를 입력으로 옮기며 방향 전환 (편의)
    setInput(output)
    setDir((d) => (d === 'encode' ? 'decode' : 'encode'))
    if (playing) stop()
  }

  const sos = () => {
    if (playing) stop()
    setMode('morse'); setDir('encode'); setLang('en'); setInput('SOS')
  }

  const natoList = spellNato(natoInput)
  const natoStr = natoList.map((n) => n.word).join(' ')

  return (
    <div className={s.wrap}>
      {/* 모드 토글 */}
      <div className={s.modeToggle} role="tablist" aria-label="변환 종류">
        <button type="button" role="tab" aria-selected={mode === 'morse'}
          className={`${s.modeBtn} ${mode === 'morse' ? s.modeActive : ''}`}
          onClick={() => { if (playing) stop(); setMode('morse') }}>· − 모스 부호</button>
        <button type="button" role="tab" aria-selected={mode === 'nato'}
          className={`${s.modeBtn} ${mode === 'nato' ? s.modeActive : ''}`}
          onClick={() => { if (playing) stop(); setMode('nato') }}>NATO 음성기호</button>
      </div>

      {mode === 'morse' ? (
        <>
          {/* 방향 + 언어 */}
          <div className={s.card}>
            <div className={s.ctrlRow}>
              <div className={s.ctrlGroup}>
                <span className={s.ctrlLabel}>방향</span>
                <div className={s.segment} role="group" aria-label="변환 방향">
                  <button type="button" aria-pressed={dir === 'encode'} className={`${s.segBtn} ${dir === 'encode' ? s.segActive : ''}`} onClick={() => setDir('encode')}>텍스트 → 모스</button>
                  <button type="button" aria-pressed={dir === 'decode'} className={`${s.segBtn} ${dir === 'decode' ? s.segActive : ''}`} onClick={() => setDir('decode')}>모스 → 텍스트</button>
                </div>
              </div>
              <div className={s.ctrlGroup}>
                <span className={s.ctrlLabel}>언어</span>
                <div className={s.segment} role="group" aria-label="언어">
                  <button type="button" aria-pressed={lang === 'ko'} className={`${s.segBtn} ${lang === 'ko' ? s.segActive : ''}`} onClick={() => setLang('ko')}>한글</button>
                  <button type="button" aria-pressed={lang === 'en'} className={`${s.segBtn} ${lang === 'en' ? s.segActive : ''}`} onClick={() => setLang('en')}>영문</button>
                </div>
              </div>
            </div>
          </div>

          {/* 입력 */}
          <div className={s.card}>
            <div className={s.ioHead}>
              <span className={s.cardLabel}>{dir === 'encode' ? '텍스트 입력' : '모스 부호 입력 (· − / 공백)'}</span>
              <button type="button" className={s.miniBtn} onClick={swapDir}>⇅ 방향 바꾸기</button>
            </div>
            <textarea className={s.textarea} rows={3}
              value={input}
              placeholder={dir === 'encode' ? (lang === 'ko' ? '예) 안녕하세요' : '예) HELLO') : '예) .... . .-.. .-.. ---'}
              onChange={(e) => setInput(dir === 'decode' ? sanitizeMorse(e.target.value) : e.target.value)} />
          </div>

          {/* 출력 */}
          <div className={s.card}>
            <div className={s.ioHead}>
              <span className={s.cardLabel}>{dir === 'encode' ? '모스 부호' : '텍스트'}</span>
              <button type="button" className={s.miniBtn} onClick={() => copy(output, 'out')} disabled={!output}>
                {copied === 'out' ? '✓ 복사됨' : '복사'}
              </button>
            </div>
            <div className={`${s.output} ${dir === 'encode' ? s.outMorse : ''}`}>{output || <span className={s.ph}>—</span>}</div>
          </div>

          {/* 재생 */}
          <div className={s.card}>
            <span className={s.cardLabel}>소리 · 빛으로 재생</span>
            <div className={`${s.lamp} ${lampOn ? s.lampOn : ''}`} aria-hidden />
            <div className={s.playRow}>
              <button type="button" className={`${s.playBtn} ${playing ? s.playStop : ''}`} onClick={play} disabled={!/[.-]/.test(morseToPlay)}>
                {playing ? '■ 정지' : '▶ 재생'}
              </button>
              <button type="button" className={s.sosBtn} onClick={sos}>SOS</button>
            </div>
            <div className={s.speedRow}>
              <span className={s.speedLabel}>속도 {wpm} WPM</span>
              <input className={s.range} type="range" min={5} max={30} step={1} value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value, 10))} aria-label="재생 속도(WPM)" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* NATO 입력 */}
          <div className={s.card}>
            <span className={s.cardLabel}>철자로 읽을 텍스트 (영문·숫자)</span>
            <textarea className={s.textarea} rows={2} value={natoInput}
              placeholder="예) BTS-7 / 예약번호 AB3" onChange={(e) => setNatoInput(e.target.value)} />
          </div>

          {/* NATO 결과 */}
          <div className={s.card}>
            <div className={s.ioHead}>
              <span className={s.cardLabel}>NATO 음성기호</span>
              <button type="button" className={s.miniBtn} onClick={() => copy(natoStr, 'nato')} disabled={!natoStr}>
                {copied === 'nato' ? '✓ 복사됨' : '복사'}
              </button>
            </div>
            <div className={s.output}>{natoStr || <span className={s.ph}>—</span>}</div>
            <div className={s.natoChips}>
              {natoList.map((n, i) => (
                <div key={i} className={s.natoChip}>
                  <span className={s.natoCh}>{n.ch === ' ' ? '␣' : n.ch}</span>
                  <span className={s.natoWord}>{n.word}</span>
                  {n.ko && <span className={s.natoKo}>{n.ko}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* NATO 참고표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>NATO 음성 문자표</span>
            <div className={s.refGrid}>
              {NATO.map((n) => (
                <div key={n.ch} className={s.refCell}>
                  <span className={s.refCh}>{n.ch}</span>
                  <span className={s.refWord}>{n.word}<span className={s.refKo}>{n.ko}</span></span>
                </div>
              ))}
            </div>
            <p className={s.helpText}>항공·군에서는 숫자를 또렷이 하려고 <strong>3=Tree, 4=Fower, 5=Fife, 9=Niner</strong>로 발음하기도 합니다.</p>
          </div>
        </>
      )}
    </div>
  )
}
