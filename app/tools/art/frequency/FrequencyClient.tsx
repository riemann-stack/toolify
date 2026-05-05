'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './frequency.module.css'

/* ── 상수 ── */
const NOTE_NAMES  = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTE_KR     = ['도', '도♯', '레', '레♯', '미', '파', '파♯', '솔', '솔♯', '라', '라♯', '시']
const IS_BLACK    = [false, true, false, true, false, false, true, false, true, false, true, false]
const SPEED_CM    = 34300 // cm/s

const REF_PITCHES = [
  { label: 'A4 = 440 Hz (표준)', value: 440 },
  { label: 'A4 = 432 Hz',        value: 432 },
  { label: 'A4 = 443 Hz (오케스트라)', value: 443 },
  { label: 'A4 = 415 Hz (바로크)', value: 415 },
]

const INTERVAL_NAMES = [
  '완전1도 (유니즌)', '단2도', '장2도', '단3도', '장3도', '완전4도',
  '증4도/감5도 (삼전음)', '완전5도', '단6도', '장6도', '단7도', '장7도',
  '완전8도 (옥타브)',
]
const INTERVAL_JI = ['1:1','16:15','9:8','6:5','5:4','4:3','45:32','3:2','8:5','5:3','16:9','15:8','2:1']

/* ── 수학 ── */
const midiToHz   = (m: number, a4 = 440) => a4 * Math.pow(2, (m - 69) / 12)
const hzToMidi   = (hz: number, a4 = 440) => 69 + 12 * Math.log2(hz / a4)
const noteToMidi = (ni: number, oct: number) => (oct + 1) * 12 + ni
const midiToInfo = (m: number) => {
  const ni = ((m % 12) + 12) % 12
  const oct = Math.floor(m / 12) - 1
  return { ni, oct, name: NOTE_NAMES[ni], kr: NOTE_KR[ni] }
}

/* ── 피아노 건반 SVG ── */
const WW = 20, WH = 80   // white key width/height
const BW = 13, BH = 50   // black key width/height
const WHITE_NI = [0, 2, 4, 5, 7, 9, 11]
const BLACK_GAPS: { ni: number; gap: number }[] = [
  { ni: 1, gap: 1 }, { ni: 3, gap: 2 }, { ni: 6, gap: 4 },
  { ni: 8, gap: 5 }, { ni: 10, gap: 6 },
]

function PianoKeyboard({ midiA, midiB }: { midiA: number | null; midiB?: number | null }) {
  const START = 3, OCT = 2
  const whites: { midi: number; x: number; ni: number }[] = []
  const blacks: { midi: number; x: number; ni: number }[] = []

  for (let o = 0; o < OCT; o++) {
    const oct = START + o
    WHITE_NI.forEach((ni, wi) => whites.push({ midi: (oct + 1) * 12 + ni, x: (o * 7 + wi) * WW, ni }))
    BLACK_GAPS.forEach(({ ni, gap }) =>
      blacks.push({ midi: (oct + 1) * 12 + ni, x: (o * 7 + gap) * WW - BW / 2, ni })
    )
  }

  const pcA = midiA !== null ? ((midiA % 12) + 12) % 12 : -1
  const pcB = midiB != null  ? ((midiB % 12) + 12) % 12 : -1
  const inRange = (m: number) => m >= 48 && m <= 71

  const fill = (midi: number, isBlack: boolean) => {
    const exact = inRange(midiA ?? -1) ? midiA === midi : false
    const exactB = inRange(midiB ?? -1) ? midiB === midi : false
    const pc = ((midi % 12) + 12) % 12
    if (exact || (!inRange(midiA ?? -1) && midiA !== null && pc === pcA)) return 'var(--accent)'
    if (exactB || (!inRange(midiB ?? -1) && midiB != null && pc === pcB)) return '#3EC8FF'
    return isBlack ? '#1A1A1A' : '#E8E8E8'
  }

  return (
    <svg viewBox={`0 0 ${14 * WW} ${WH}`} width="100%" style={{ display: 'block' }}>
      {whites.map(k => (
        <rect key={k.midi} x={k.x + 0.5} y={0.5} width={WW - 1} height={WH - 1}
          rx={3} fill={fill(k.midi, false)} stroke="#888" strokeWidth={0.5} />
      ))}
      {blacks.map(k => (
        <rect key={k.midi} x={k.x} y={0} width={BW} height={BH}
          rx={2} fill={fill(k.midi, true)} />
      ))}
    </svg>
  )
}

/* ── 센트 게이지 ── */
function CentGauge({ cents }: { cents: number }) {
  const clamped = Math.max(-50, Math.min(50, cents))
  const pct = Math.max(1, Math.min(99, ((clamped + 50) / 100) * 100))
  const inTune = Math.abs(cents) < 5

  return (
    <div className={styles.centGauge}>
      <div className={styles.centGaugeLabels}>
        <span>♭ −50 센트</span><span>± 0 (정확)</span><span>+50 센트 ♯</span>
      </div>
      <div className={styles.centBarWrap}>
        <div className={styles.centBarCenter} />
        <div className={styles.centNeedle} style={{ left: `calc(${pct}% - 1px)` }} />
      </div>
      <div className={styles.centValue}>
        {cents >= 0 ? '+' : ''}{cents.toFixed(1)} 센트
        {inTune && <span className={styles.centInTune}>✓ 정확</span>}
      </div>
    </div>
  )
}

/* ── 음이름+옥타브 선택기 (인터벌 탭용) ── */
interface NoteSelectorProps {
  label: string
  ni: number; oct: number
  onNi: (i: number) => void; onOct: (o: number) => void
}
function NoteSelector({ label, ni, oct, onNi, onOct }: NoteSelectorProps) {
  return (
    <div className={styles.intervalCol}>
      <div className={styles.intervalColLabel}>{label}</div>
      <div className={styles.intervalColNote}>{NOTE_NAMES[ni]}{oct}</div>
      <div className={styles.noteGridSmall} style={{ marginBottom: 8 }}>
        {NOTE_NAMES.map((n, i) => (
          <button key={i}
            className={`${styles.noteBtn} ${IS_BLACK[i] ? styles.noteBtnBlack : ''} ${ni === i ? styles.noteBtnActive : ''}`}
            onClick={() => onNi(i)}>{n}</button>
        ))}
      </div>
      <div className={styles.octaveRow}>
        {[0,1,2,3,4,5,6,7,8].map(o => (
          <button key={o} className={`${styles.octBtn} ${oct === o ? styles.octBtnActive : ''}`} onClick={() => onOct(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── 탭 1: Hz → 음정 ── */
const HZ_PRESETS = [
  { label: 'A4 440 Hz',        hz: 440 },
  { label: 'C4 261.63 Hz',     hz: 261.63 },
  { label: 'E2 기타 6번줄',    hz: 82.41 },
  { label: 'G2 기타 3번줄',    hz: 196.00 },
]

function HzToNoteTab({ a4 }: { a4: number }) {
  const [hz, setHz] = useState('')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    const h = parseFloat(hz)
    if (!h || h <= 0 || h > 20000) return null
    const midiRaw = hzToMidi(h, a4)
    const midiR   = Math.round(midiRaw)
    const { ni, oct, name, kr } = midiToInfo(midiR)
    const theoHz  = midiToHz(midiR, a4)
    const cents   = 1200 * Math.log2(h / theoHz)
    const wave    = SPEED_CM / h
    return { name, kr, oct, ni, cents, midi: midiR, wave }
  }, [hz, a4])

  const handleCopy = useCallback(async () => {
    if (!result) return
    const h = parseFloat(hz)
    const txt = `${result.name}${result.oct} (${result.kr}) | ${h.toFixed(2)} Hz | MIDI ${result.midi} | 센트 오차 ${result.cents >= 0 ? '+' : ''}${result.cents.toFixed(1)}`
    try { await navigator.clipboard.writeText(txt) } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }, [result, hz])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>주파수 입력</div>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="decimal"
            placeholder="440" value={hz} onChange={e => setHz(e.target.value)} />
          <span className={styles.unit}>Hz</span>
        </div>
        <div className={styles.presetRow} style={{ marginTop: 10 }}>
          {HZ_PRESETS.map(p => (
            <button key={p.label} className={styles.presetBtn} onClick={() => setHz(String(p.hz))}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result ? (
        <div className={styles.resultCard}>
          <div className={styles.heroRow}>
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>음정</div>
              <div className={styles.heroNum}>{result.name}{result.oct}</div>
              <div className={styles.heroSub}>{result.kr} · 옥타브 {result.oct}</div>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>MIDI 번호</div>
              <div className={styles.heroNum}>{result.midi}</div>
              <div className={styles.heroSub}>파장 {result.wave.toFixed(1)} cm</div>
            </div>
          </div>

          <CentGauge cents={result.cents} />

          <div className={styles.pianoWrap} style={{ marginBottom: 10 }}>
            <PianoKeyboard midiA={noteToMidi(result.ni, result.oct)} />
          </div>

          <button className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사됨' : '📋 결과 복사'}
          </button>
          <p className={styles.stdNote}>* 기준음 A4 = {a4} Hz 기준 · 피아노 건반은 C3–B4 표시</p>
        </div>
      ) : (
        <div className={styles.empty}>주파수(Hz)를 입력하면 가장 가까운 음정으로 변환합니다</div>
      )}
    </div>
  )
}

/* ── 탭 2: 음정 → Hz ── */
function NoteToHzTab({ a4 }: { a4: number }) {
  const [ni,  setNi]  = useState(9)  // A
  const [oct, setOct] = useState(4)  // 4
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    const midi  = noteToMidi(ni, oct)
    const hz    = midiToHz(midi, a4)
    const wave  = SPEED_CM / hz
    const prevInfo = midiToInfo(midi - 1)
    const nextInfo = midiToInfo(midi + 1)
    return {
      midi, hz, wave,
      prev: { label: `${prevInfo.name}${prevInfo.oct}`, hz: midiToHz(midi - 1, a4) },
      next: { label: `${nextInfo.name}${nextInfo.oct}`, hz: midiToHz(midi + 1, a4) },
    }
  }, [ni, oct, a4])

  const handleCopy = useCallback(async () => {
    const txt = `${NOTE_NAMES[ni]}${oct} | ${result.hz.toFixed(3)} Hz | MIDI ${result.midi} | 파장 ${result.wave.toFixed(1)} cm`
    try { await navigator.clipboard.writeText(txt) } catch {}
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }, [ni, oct, result])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>음이름 선택</div>
        <div className={styles.noteGrid}>
          {NOTE_NAMES.map((n, i) => (
            <button key={i}
              className={`${styles.noteBtn} ${IS_BLACK[i] ? styles.noteBtnBlack : ''} ${ni === i ? styles.noteBtnActive : ''}`}
              onClick={() => setNi(i)}>{n}</button>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div className={styles.cardLabel}>옥타브</div>
          <div className={styles.octaveRow}>
            {[0,1,2,3,4,5,6,7,8].map(o => (
              <button key={o} className={`${styles.octBtn} ${oct === o ? styles.octBtnActive : ''}`} onClick={() => setOct(o)}>
                {o}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.resultCard}>
        <div className={styles.heroRow}>
          <div className={styles.heroBlock}>
            <div className={styles.heroLabel}>주파수</div>
            <div className={styles.heroNum}>{result.hz.toFixed(2)}</div>
            <div className={styles.heroSub}>Hz</div>
          </div>
          <div className={styles.heroDivider} />
          <div className={styles.heroBlock}>
            <div className={styles.heroLabel}>MIDI 번호</div>
            <div className={styles.heroNum}>{result.midi}</div>
            <div className={styles.heroSub}>파장 {result.wave.toFixed(1)} cm</div>
          </div>
        </div>

        <div className={styles.pianoWrap} style={{ marginBottom: 10 }}>
          <PianoKeyboard midiA={result.midi} />
        </div>

        <div className={styles.neighborRow} style={{ marginBottom: 10 }}>
          <div className={styles.neighborItem}>
            <div className={styles.neighborLabel}>↓ 반음 아래</div>
            <div className={styles.neighborNote}>{result.prev.label}</div>
            <div className={styles.neighborHz}>{result.prev.hz.toFixed(3)} Hz</div>
          </div>
          <div className={styles.neighborItem}>
            <div className={styles.neighborLabel}>↑ 반음 위</div>
            <div className={styles.neighborNote}>{result.next.label}</div>
            <div className={styles.neighborHz}>{result.next.hz.toFixed(3)} Hz</div>
          </div>
        </div>

        <button className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`} onClick={handleCopy}>
          {copied ? '✓ 복사됨' : '📋 결과 복사'}
        </button>
        <p className={styles.stdNote}>* 기준음 A4 = {a4} Hz 기준 · 파장 = 34,300 cm/s ÷ Hz</p>
      </div>
    </div>
  )
}

/* ── 탭 3: 음정 간격 계산기 ── */
function IntervalTab({ a4 }: { a4: number }) {
  const [aNi,  setANi]  = useState(9)  // A
  const [aOct, setAOct] = useState(4)
  const [bNi,  setBNi]  = useState(4)  // E
  const [bOct, setBOct] = useState(5)

  const result = useMemo(() => {
    const midiA = noteToMidi(aNi, aOct)
    const midiB = noteToMidi(bNi, bOct)
    const semi  = Math.abs(midiB - midiA)
    const hzA   = midiToHz(midiA, a4)
    const hzB   = midiToHz(midiB, a4)
    const ratio = (hzA > hzB ? hzA / hzB : hzB / hzA)

    let name: string, ji: string
    if (semi < INTERVAL_NAMES.length) {
      name = INTERVAL_NAMES[semi]
      ji   = INTERVAL_JI[semi]
    } else {
      const base = semi % 12
      name = `${Math.floor(semi / 12)}옥타브 + ${INTERVAL_NAMES[base]}`
      ji   = `${ratio.toFixed(4)}:1`
    }

    return { semi, name, ji, ratio, midiA, midiB, hzA, hzB }
  }, [aNi, aOct, bNi, bOct, a4])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.intervalCols}>
          <NoteSelector label="음정 A" ni={aNi} oct={aOct} onNi={setANi} onOct={setAOct} />
          <NoteSelector label="음정 B" ni={bNi} oct={bOct} onNi={setBNi} onOct={setBOct} />
        </div>
      </div>

      <div className={styles.resultCard}>
        <div className={styles.intervalBadge}>{result.semi} 반음</div>
        <div className={styles.intervalName}>{result.name}</div>
        <div className={styles.intervalRatio}>
          순정 비율: {result.ji} · 평균율 실제: {result.ratio.toFixed(4)}:1
        </div>

        <div className={styles.pianoWrap} style={{ margin: '14px 0' }}>
          <PianoKeyboard midiA={result.midiA} midiB={result.midiB} />
        </div>

        <div className={styles.neighborRow} style={{ marginBottom: 10 }}>
          <div className={styles.neighborItem}>
            <div className={styles.neighborLabel} style={{ color: 'var(--accent)' }}>● 음정 A</div>
            <div className={styles.neighborNote}>{NOTE_NAMES[aNi]}{aOct}</div>
            <div className={styles.neighborHz}>{result.hzA.toFixed(3)} Hz</div>
          </div>
          <div className={styles.neighborItem}>
            <div className={styles.neighborLabel} style={{ color: '#3EC8FF' }}>● 음정 B</div>
            <div className={styles.neighborNote}>{NOTE_NAMES[bNi]}{bOct}</div>
            <div className={styles.neighborHz}>{result.hzB.toFixed(3)} Hz</div>
          </div>
        </div>

        <p className={styles.stdNote}>* 기준음 A4 = {a4} Hz · 건반 초록=A, 파랑=B</p>
      </div>
    </div>
  )
}

/* ── 메인 ── */
export default function FrequencyClient() {
  const [tab, setTab] = useState<'hz2note' | 'note2hz' | 'interval'>('hz2note')
  const [a4,  setA4]  = useState(440)

  return (
    <div className={styles.wrap}>
      {/* 기준음 선택 */}
      <div className={styles.card} style={{ padding: '14px 20px' }}>
        <div className={styles.cardLabel}>기준음 (A4)</div>
        <div className={styles.refRow}>
          {REF_PITCHES.map(r => (
            <button key={r.value}
              className={`${styles.refBtn} ${a4 === r.value ? styles.refBtnActive : ''}`}
              onClick={() => setA4(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'hz2note'  ? styles.tabActive : ''}`} onClick={() => setTab('hz2note')}>
          🔊 Hz → 음정
        </button>
        <button className={`${styles.tab} ${tab === 'note2hz'  ? styles.tabActive : ''}`} onClick={() => setTab('note2hz')}>
          🎹 음정 → Hz
        </button>
        <button className={`${styles.tab} ${tab === 'interval' ? styles.tabActive : ''}`} onClick={() => setTab('interval')}>
          📏 음정 간격
        </button>
      </div>

      {tab === 'hz2note'  && <HzToNoteTab  a4={a4} />}
      {tab === 'note2hz'  && <NoteToHzTab  a4={a4} />}
      {tab === 'interval' && <IntervalTab  a4={a4} />}
    </div>
  )
}
