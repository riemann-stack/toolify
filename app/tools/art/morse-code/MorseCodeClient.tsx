'use client'

import { useMemo, useRef, useState } from 'react'
import {
  encodeMorseDetailed, decodeMorseDetailed, normalizeMorse, hasHangul,
  spellNatoDetailed, NATO, NATO_UNITS, type Lang,
} from './morseData'
import s from './morse-code.module.css'

type Mode = 'morse' | 'nato'
type Dir = 'encode' | 'decode'

const FREQ = 600

const MODES: [Mode, string][] = [['morse', '· − 모스 부호'], ['nato', '음성 문자 (NATO)']]

/** 조난 신호는 글자 간격 없이 이어 보내는 하나의 프로사인(S̅O̅S̅)이라, 재생용 부호를 따로 둔다.
    ⚠️ 예전 SOS 버튼은 입력을 'SOS'로 채우기만 해서 "... --- ..."가 되고, 재생 시 글자마다
       3단위 무음이 들어갔다(13 WPM이면 0.277초 × 2회). 실제 조난 신호 리듬과 다르다. */
const SOS_PROSIGN = '...---...'

/** 건너뛴 문자 목록을 사람이 읽을 수 있게 (중복 제거·최대 6종) */
function fmtDropped(dropped: string[]): string {
  const uniq = [...new Set(dropped)]
  const shown = uniq.slice(0, 6).map((c) => (c === ' ' ? '공백' : c)).join(' ')
  return uniq.length > 6 ? `${shown} 외 ${uniq.length - 6}종` : shown
}

export default function MorseCodeClient() {
  const [mode, setMode] = useState<Mode>('morse')
  const [dir, setDir] = useState<Dir>('encode')
  const [lang, setLang] = useState<Lang>('ko')
  const [input, setInput] = useState('안녕하세요')
  const [wpm, setWpm] = useState(13)
  const [playing, setPlaying] = useState(false)
  const [lampOn, setLampOn] = useState(false)
  /* ⚠️ 광과민성 안전 — 연속 단점 구간의 점멸수는 WPM/2.4회/초다(켜짐 1단위 + 꺼짐 1단위 = 2단위 주기).
     WCAG 2.3.1(레벨 A)은 초당 3회를 넘는 번쩍임을 제한하는데, 기본값 13 WPM이면 이미 5.4회/초이고
     상한 30 WPM에서는 12.5회/초다. 기준을 통과하는 것은 약 7 WPM 이하뿐이라, 빛은 기본 꺼짐으로 두고
     사용자가 위험을 알고 켜도록 한다. 소리 재생은 그대로 동작한다. */
  const [lampEnabled, setLampEnabled] = useState(false)
  const [natoInput, setNatoInput] = useState('Toolify')
  const [copied, setCopied] = useState('')

  const ctxRef = useRef<AudioContext | null>(null)
  const timers = useRef<number[]>([])
  const rafRef = useRef<number | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // 모스 결과 — 손실(건너뛴 문자·해석 못한 부호)까지 함께 받아 화면에 알린다
  const normalizedInput = useMemo(() => normalizeMorse(input), [input])
  const enc = useMemo(() => encodeMorseDetailed(input, lang), [input, lang])
  const dec = useMemo(() => decodeMorseDetailed(normalizedInput, lang), [normalizedInput, lang])
  const output = dir === 'encode' ? enc.code : dec.text
  const morseToPlay = dir === 'encode' ? enc.code : normalizedInput
  /* 영문 모드에 한글을 넣으면 전부 버려져 결과가 빈다 — 가장 흔한 막힘 지점이라 따로 안내 */
  const wrongLang = dir === 'encode' && lang === 'en' && hasHangul(input)
  const isSos = dir === 'decode' && normalizedInput.replace(/\s/g, '') === SOS_PROSIGN
  const droppedMsg = dir === 'encode' && enc.dropped.length > 0 && !wrongLang
    ? `모스 부호에 없는 문자 ${enc.dropped.length}개를 건너뛰었습니다 — ${fmtDropped(enc.dropped)}`
    : ''
  const unknownMsg = dir === 'decode' && dec.unknown.length > 0
    ? `부호표에 없는 신호 ${dec.unknown.length}개를 건너뛰었습니다 — ${fmtDropped(dec.unknown)}`
    : ''

  const copy = async (text: string, key: string) => {
    if (!text) return
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(''), 1200) } catch { /* noop */ }
  }

  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
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
    /* 엔벨로프 — 30 WPM에서 단점이 40ms이므로 어택·릴리스는 그보다 훨씬 짧아야 한다.
       exponentialRamp는 0을 인자로 받지 못해 0.0001에서 오르내린다(클릭 노이즈 방지). */
    for (const [a, b] of tones) {
      /* 상승·하강 시간. CW 실무 권장치는 약 5ms이고, 30 WPM에서 단점이 40ms이므로
         단위 길이에 비례해 줄여 이벤트 시각이 역전되지 않게 한다. */
      const edge = Math.min(0.005, u / 5)
      gain.gain.setValueAtTime(0.0001, t0 + a)
      gain.gain.exponentialRampToValueAtTime(0.28, t0 + a + edge)
      gain.gain.setValueAtTime(0.28, t0 + b - edge)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + b)
    }
    osc.start(t0)
    osc.stop(t0 + total + 0.05)
    setPlaying(true)

    /* 램프는 오디오 시계(ctx.currentTime)를 폴링해 맞춘다.
       ⚠️ 예전에는 톤마다 setTimeout 2개를 걸었다 — 1,000자를 넣으면 타이머 4,000개가 쌓이고,
          setTimeout은 오디오 시계와 별개라 재생이 길어질수록 빛과 소리가 어긋났다. */
    let idx = 0
    let lastOn: boolean | null = null
    const tick = () => {
      const ctxNow = ctxRef.current
      if (!ctxNow) return
      const el = ctxNow.currentTime - t0
      if (el > total + 0.05) { stop(); return }
      while (idx < tones.length && tones[idx][1] < el) idx++
      const on = lampEnabled && idx < tones.length && el >= tones[idx][0] && el < tones[idx][1]
      if (on !== lastOn) { lastOn = on; setLampOn(on) }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    // 탭이 백그라운드로 가면 rAF가 멈추므로 종료 보장용 타이머를 하나 남긴다
    timers.current.push(window.setTimeout(stop, (0.06 + total + 0.2) * 1000))
  }

  const swapDir = () => {
    // 결과를 입력으로 옮기며 방향 전환 (편의)
    setInput(output)
    setDir((d) => (d === 'encode' ? 'decode' : 'encode'))
    if (playing) stop()
  }

  const onTabKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = MODES.length - 1
    let next = -1
    if (e.key === 'ArrowRight') next = i === last ? 0 : i + 1
    else if (e.key === 'ArrowLeft') next = i === 0 ? last : i - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    if (playing) stop()
    setMode(MODES[next][0])
    tabRefs.current[next]?.focus()
  }

  const sos = () => {
    if (playing) stop()
    /* 한 덩어리 토큰이므로 play()가 요소 간 1단위만 넣는다(글자 간격 없음) */
    setMode('morse'); setDir('decode'); setLang('en'); setInput(SOS_PROSIGN)
  }

  /* 재생에 걸리는 시간 — WPM 슬라이더의 의미를 눈에 보이게 하고, 긴 입력을 눌렀을 때
     몇 분짜리 재생이 시작되는지 미리 알린다(입력 길이에 상한이 없다). */
  const playSeconds = useMemo(() => {
    const code = morseToPlay.trim()
    if (!/[.-]/.test(code)) return 0
    let u = 0
    code.split(/\s*\/\s*/).forEach((word, wi) => {
      if (wi > 0) u += 7
      word.split(/\s+/).filter(Boolean).forEach((letter, li) => {
        if (li > 0) u += 3
        ;[...letter].forEach((el, ei) => { if (ei > 0) u += 1; u += el === '-' ? 3 : 1 })
      })
    })
    return (u * 1.2) / wpm
  }, [morseToPlay, wpm])
  const playLabel = playSeconds >= 60
    ? `${Math.floor(playSeconds / 60)}분 ${Math.round(playSeconds % 60)}초`
    : `${playSeconds.toFixed(1)}초`

  const nato = spellNatoDetailed(natoInput)
  const natoList = nato.entries
  const natoStr = natoList.map((n) => n.word).join(' ')
  const natoUnmapped = [...new Set(nato.unmapped)]

  return (
    <div className={s.wrap}>
      {/* 모드 토글 */}
      {/* role="tablist"를 붙인 이상 WAI-ARIA가 요구하는 화살표·Home/End 이동과 roving tabindex,
          그리고 aria-controls가 가리킬 tabpanel까지 갖춘다 — role만 붙이면 "화살표로 이동 가능"이라고
          알려 놓고 실제로는 동작하지 않는 상태가 된다. */}
      <div className={s.modeToggle} role="tablist" aria-label="변환 종류">
        {MODES.map(([key, label], i) => (
          <button type="button" key={key}
            id={`morse-tab-${key}`}
            role="tab"
            aria-selected={mode === key}
            aria-controls={`morse-panel-${key}`}
            tabIndex={mode === key ? 0 : -1}
            ref={(el) => { tabRefs.current[i] = el }}
            className={`${s.modeBtn} ${mode === key ? s.modeActive : ''}`}
            onKeyDown={(e) => onTabKeyDown(e, i)}
            onClick={() => { if (playing) stop(); setMode(key) }}>{label}</button>
        ))}
      </div>

      {mode === 'morse' ? (
        <div className={s.panel} role="tabpanel" id="morse-panel-morse" aria-labelledby="morse-tab-morse">
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
            {/* ⚠️ 예전에는 디코드 입력에서 `.`/`-` 외 문자를 즉시 삭제했다. 이 페이지의 부호표는
                ·(U+00B7)·−(U+2212)로 렌더링하므로 **표에서 복사해 붙여 넣으면 전부 사라졌다.**
                이제 원문을 그대로 두고 해석 단계에서 정규화한다. */}
            <textarea className={s.textarea} rows={3}
              value={input}
              placeholder={dir === 'encode' ? (lang === 'ko' ? '예) 안녕하세요' : '예) HELLO') : '예) .... . .-.. .-.. ---   (· − 도 됩니다)'}
              onChange={(e) => setInput(e.target.value)} />
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
            {wrongLang && (
              <p className={s.warn} role="status">
                입력에 한글이 있는데 <strong>언어가 &lsquo;영문&rsquo;</strong>으로 되어 있습니다. 영문 부호표에는 한글 자모가 없어 그대로 버려집니다.{' '}
                <button type="button" className={s.inlineBtn} onClick={() => setLang('ko')}>한글로 바꾸기</button>
              </p>
            )}
            {droppedMsg && <p className={s.note} role="status">{droppedMsg}</p>}
            {unknownMsg && <p className={s.note} role="status">{unknownMsg}</p>}
            {isSos && (
              <p className={s.note}>
                조난 신호는 <strong>글자 사이를 띄우지 않고</strong> 점 3·선 3·점 3을 한 덩어리로 이어 보냅니다. 그래서 인쇄할 때 세 글자 위에 줄을 그어 <strong>S̅O̅S̅</strong>로 적어요. 지금 재생되는 리듬이 규정대로의 SOS입니다.
              </p>
            )}
          </div>

          {/* 재생 */}
          <div className={s.card}>
            <span className={s.cardLabel}>소리로 재생</span>
            <label className={s.lampToggle}>
              <input type="checkbox" checked={lampEnabled}
                onChange={(e) => { setLampEnabled(e.target.checked); if (!e.target.checked) setLampOn(false) }} />
              <span>빛으로도 보기</span>
              <span className={s.lampRate}>
                {lampEnabled ? `현재 속도에서 초당 최대 ${(wpm / 2.4).toFixed(1)}회 점멸` : '켜면 화면이 빠르게 점멸합니다'}
              </span>
            </label>
            {lampEnabled && wpm > 7 && (
              <p className={s.warn}>
                <strong>광과민성 주의</strong> — 이 속도에서는 초당 <strong>{(wpm / 2.4).toFixed(1)}회</strong>까지 점멸합니다. 접근성 기준(WCAG 2.3.1)이 권하는 한도는 초당 3회로, 이 도구에서는 약 <strong>7 WPM 이하</strong>에서만 지켜집니다. 빛에 민감하시면 이 항목을 꺼 두세요.
              </p>
            )}
            {lampEnabled && <div className={`${s.lamp} ${lampOn ? s.lampOn : ''}`} aria-hidden />}
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
            {playSeconds > 0 && (
              <p className={s.note} style={{ marginTop: '10px' }}>
                재생 길이 약 <strong>{playLabel}</strong> · 단점 1개 {Math.round(1200 / wpm)}ms
                {playSeconds > 120 && ' — 꽤 깁니다. 속도를 올리거나 입력을 줄여 보세요.'}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className={s.panel} role="tabpanel" id="morse-panel-nato" aria-labelledby="morse-tab-nato">
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
            {natoUnmapped.length > 0 && (
              <p className={s.note} role="status">
                음성 문자표에 없는 글자 {natoUnmapped.length}종은 그대로 두었습니다 — {natoUnmapped.join(' ')}. 표는 <strong>영문 26자와 숫자 10개</strong>만 규정합니다.
              </p>
            )}
            <div className={s.natoChips}>
              {natoList.map((n, i) => (
                <div key={i} className={s.natoChip}>
                  <span className={s.natoCh}>{n.ch === ' ' ? '␣' : n.ch}</span>
                  <span className={s.natoWord}>{n.word}</span>
                  {n.say && <span className={s.natoSay}>{n.say}</span>}
                  {n.ko && <span className={s.natoKo}>{n.ko}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* NATO 참고표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>음성 문자표 (ICAO Annex 10)</span>
            <div className={s.refGrid}>
              {NATO.map((n) => (
                <div key={n.ch} className={s.refCell}>
                  <span className={s.refCh}>{n.ch}</span>
                  <span className={s.refWord}>
                    {n.word}
                    <span className={s.refSay}>{n.say}</span>
                    <span className={s.refKo}>{n.ko}</span>
                  </span>
                </div>
              ))}
            </div>
            {/* ⚠️ 예전 안내문은 "발음하기도 합니다"라며 선택 사항처럼 적었다. ICAO Annex 10 Vol II
                5.2.1.4.3.1은 "numbers shall be transmitted using the following pronunciation" —
                영어로 통신할 때는 의무 규정이다. */}
            <p className={s.helpText}>
              대문자로 쓴 음절에 <strong>강세</strong>를 둡니다(ICAO 표기 그대로). 영어로 무선 통신할 때 숫자 발음은 <strong>선택이 아니라 규정</strong>입니다 — 3은 TREE, 4는 FOW-er, 5는 FIFE, 9는 NIN-er, 8은 AIT로 읽습니다. Q도 일상 독음 &lsquo;퀘벡&rsquo;이 아니라 <strong>KEH BECK</strong>입니다.
            </p>
            <div className={s.refGrid} style={{ marginTop: '12px' }}>
              {NATO_UNITS.map((n) => (
                <div key={n.word} className={s.refCell}>
                  <span className={s.refCh}>{n.ch}</span>
                  <span className={s.refWord}>
                    {n.word}
                    <span className={s.refSay}>{n.say}</span>
                    <span className={s.refKo}>{n.ko}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className={s.helpText}>같은 표가 규정하는 단위어입니다. 소수점·백·천은 숫자와 함께 이 발음으로 읽습니다.</p>
          </div>
        </div>
      )}
    </div>
  )
}
