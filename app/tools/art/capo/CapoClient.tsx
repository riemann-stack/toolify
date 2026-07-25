'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import styles from './capo.module.css'

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const
type Note = typeof NOTES[number]

const NOTES_FLAT: Record<Note, string> = {
  'C':'C','C#':'Db','D':'D','D#':'Eb','E':'E','F':'F','F#':'Gb','G':'G','G#':'Ab','A':'A','A#':'Bb','B':'B',
}
const SHARP_SET = new Set<Note>(['C#','D#','F#','G#','A#'])

// 조성 표시 관행: 플랫 키는 Db·Eb·Ab·Bb로, F#만 샤프 유지 (조표 6개 이하 선택)
const KEY_DISPLAY = ['C','Db','D','Eb','E','F','F#','G','Ab','A','Bb','B'] as const
const FLAT_NAMES  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] as const
const FLAT_PREF_PCS = new Set([1, 3, 5, 8, 10]) // Db·Eb·F·Ab·Bb 조는 플랫 표기
const LETTERS = ['C','D','E','F','G','A','B'] as const
const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }

const pcOf = (n: Note) => NOTES.indexOf(n)
const keyName = (pc: number) => KEY_DISPLAY[((pc % 12) + 12) % 12]

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'] as const
const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const FUNCTION_LABELS = ['토닉 (T)', '서브도미넌트 (SD)', '토닉 대리', '서브도미넌트 (SD)', '도미넌트 (D)', '토닉 대리', '도미넌트 대리']
const FUNCTION_COLORS = ['var(--accent-ink)', 'var(--cat-health)', 'var(--accent-ink)', 'var(--cat-health)', 'var(--warning)', 'var(--accent-ink)', 'var(--warning)']

const EASY_OPEN_CHORDS = new Set(['C','G','D','Em','Am','A','E','Dm'])

function flatOf(note: Note): string { return NOTES_FLAT[note] }

// 조성에 맞는 음이름 철자(레터워크): F장조 B♭, D♭장조 G♭, F♯장조 E♯dim
function spellDiatonic(rootPc: number): string[] {
  const rootName = keyName(rootPc)
  const startLetter = LETTERS.indexOf(rootName[0] as typeof LETTERS[number])
  return MAJOR_INTERVALS.map((interval, i) => {
    const letter = LETTERS[(startLetter + i) % 7]
    const pc = (((rootPc + interval) % 12) + 12) % 12
    const acc = ((pc - LETTER_PC[letter] + 6) % 12 + 12) % 12 - 6
    const accStr = acc === 0 ? '' : acc === 1 ? '#' : acc === -1 ? 'b' : acc === 2 ? '##' : 'bb'
    return letter + accStr + MAJOR_QUALITIES[i]
  })
}

function getDiatonic(rootKey: Note): string[] {
  return spellDiatonic(pcOf(rootKey))
}

// 코드 진행 직접 변환용 — E#·Cb 등 임시표 포함 음이름 파싱
function parseNoteName(name: string): number | null {
  const m = /^([A-Ga-g])([#b]{0,2})$/.exec(name)
  if (!m) return null
  let pc = LETTER_PC[m[1].toUpperCase()]
  for (const ch of m[2]) pc += ch === '#' ? 1 : -1
  return ((pc % 12) + 12) % 12
}

const CHORD_TOKEN = /^([A-G][#b]{0,2})([^/\s]*)(?:\/([A-G][#b]{0,2}))?$/
// 서픽스·슬래시 베이스 보존, 루트·베이스만 이동 — 새 키 조표에 맞는 표기 선택
function transposeChordSmart(token: string, semitones: number, prefer: 'sharp' | 'flat'): string {
  const m = CHORD_TOKEN.exec(token)
  if (!m) return token
  const names = prefer === 'flat' ? FLAT_NAMES : NOTES
  const shiftName = (name: string) => {
    const pc = parseNoteName(name)
    return pc === null ? name : names[((pc + semitones) % 12 + 12) % 12]
  }
  return shiftName(m[1]) + m[2] + (m[3] ? '/' + shiftName(m[3]) : '')
}

function isEasyChord(chord: string): boolean { return EASY_OPEN_CHORDS.has(chord) }
// 내부 표기는 샤프 전용 — 오픈 코드·dim 외의 maj/min은 전부 바레(하이 포지션) 취급
function isBarreChord(chord: string): boolean {
  return !EASY_OPEN_CHORDS.has(chord) && !chord.endsWith('dim')
}

function recommendCapos(targetKey: Note): { fret: number; easyCount: number; barreCount: number }[] {
  const targetIdx = NOTES.indexOf(targetKey)
  const scored: { fret: number; easyCount: number; barreCount: number }[] = []
  // FAQ 권장(5프렛 이하)과 정합 — 표시 표는 7프렛까지, 추천은 0~5프렛만
  for (let fret = 0; fret <= 5; fret++) {
    const playIdx = ((targetIdx - fret) % 12 + 12) % 12
    const playKey = NOTES[playIdx]
    const chords = getDiatonic(playKey)
    scored.push({
      fret,
      easyCount: chords.filter(isEasyChord).length,
      barreCount: chords.filter(isBarreChord).length,
    })
  }
  const best = [...scored].sort((a, b) => {
    if (b.easyCount !== a.easyCount) return b.easyCount - a.easyCount
    if (a.barreCount !== b.barreCount) return a.barreCount - b.barreCount
    return a.fret - b.fret
  })
  return [best[0], best[1]]
}

/* ──────────────────────── 공통: 12개 키 그리드 ──────────────────────── */
function KeyGrid({ value, onChange }: { value: Note; onChange: (n: Note) => void }) {
  return (
    <div className={styles.keyGrid}>
      {NOTES.map(n => {
        const sharp = SHARP_SET.has(n)
        return (
          <button
            key={n}
            type="button"
            aria-pressed={value === n}
            className={`${styles.keyBtn} ${sharp ? styles.keyBtnSharp : ''} ${value === n ? styles.keyBtnActive : ''}`}
            onClick={() => onChange(n)}
          >
            <span className={styles.keyBtnMain}>{n}</span>
            {sharp && <span className={styles.keyBtnSub}>{flatOf(n)}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ──────────────────────── 탭 1: 카포 계산기 ──────────────────────── */
function CapoTab() {
  const [targetKey, setTargetKey] = useState<Note>('C')
  const [fret, setFret] = useState(0)

  const targetPc = pcOf(targetKey)
  const playPc = ((targetPc - fret) % 12 + 12) % 12

  const diatonicTarget = useMemo(() => spellDiatonic(targetPc), [targetPc])
  // 카포 열별 코드는 각 연주 키의 조표에 맞춰 철자 (F장조 B♭, A♭장조 D♭ 등)
  const colChords = useMemo(
    () => [0,1,2,3,4,5,6,7].map(f => spellDiatonic(((targetPc - f) % 12 + 12) % 12)),
    [targetPc]
  )
  const recommended = useMemo(() => recommendCapos(targetKey), [targetKey])
  const recommendedFrets = useMemo(() => new Set(recommended.map(r => r.fret)), [recommended])

  // 모바일: 선택한 카포 열을 표 스크롤 중앙으로
  const tableWrapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const wrap = tableWrapRef.current
    const el = wrap?.querySelector<HTMLElement>('[data-active-fret="1"]')
    if (wrap && el && wrap.scrollWidth > wrap.clientWidth) {
      // behavior:'smooth'는 일부 환경(임베디드 웹뷰)에서 무시됨 — 즉시 스크롤 사용
      wrap.scrollLeft = el.offsetLeft - wrap.clientWidth / 2 + el.offsetWidth / 2
    }
  }, [fret])

  return (
    <div className={styles.tabContent}>
      {/* 원래 키 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>① 원래 키 (곡의 실제 키 · 장조 기준)</div>
        <KeyGrid value={targetKey} onChange={setTargetKey} />
        <p className={styles.note}>
          * 장조 기준 계산기입니다. 단조 곡은 나란한 장조로 선택하세요 (Am→C, Em→G, Bm→D) —
          조표와 다이아토닉 코드 구성이 같아 결과가 그대로 적용됩니다.
        </p>
      </div>

      {/* 카포 위치 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>② 카포 위치</div>
        <div className={styles.fretRow}>
          {[0,1,2,3,4,5,6,7].map(f => (
            <button
              key={f}
              type="button"
              aria-pressed={fret === f}
              className={`${styles.fretBtn} ${fret === f ? styles.fretBtnActive : ''} ${recommendedFrets.has(f) ? styles.fretBtnRec : ''}`}
              onClick={() => setFret(f)}
            >
              <span className={styles.fretBtnNum}>{f === 0 ? '없음' : f}</span>
              {f !== 0 && <span className={styles.fretBtnSub}>fret</span>}
              {recommendedFrets.has(f) && <span className={styles.fretBtnBadge}>✨</span>}
            </button>
          ))}
        </div>
        <input
          className={styles.fretSlider}
          type="range" min={0} max={7} step={1}
          value={fret}
          onChange={e => setFret(parseInt(e.target.value))}
          aria-label="카포 프렛"
        />
      </div>

      {/* 결과 히어로 */}
      <div className={styles.hero} role="status">
        <div className={styles.heroLabel}>
          카포 {fret === 0 ? '없음' : `${fret}프렛`}에서
        </div>
        <div className={styles.heroRow}>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>연주 키(코드 모양)</div>
            <div className={styles.heroChord}>{keyName(playPc)}</div>
          </div>
          <div className={styles.heroArrow}>→</div>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>실제 울리는 키</div>
            <div className={styles.heroChord}>{keyName(targetPc)}</div>
          </div>
        </div>
        <div className={styles.heroNote}>
          {keyName(playPc)} 코드 모양 + 카포 {fret}프렛 = <strong>{keyName(targetPc)}</strong> 소리
        </div>
      </div>

      {/* 카포별 코드 변환 표 */}
      <div className={styles.card}>
        <div className={styles.cardLabelRow}>
          <span className={styles.cardLabel}>③ 카포 위치별 코드 변환 표</span>
          <span className={styles.legendRow}>
            <span className={styles.legendEasy}>● 쉬운 코드</span>
            <span className={styles.legendBarre}>● 바레 코드</span>
          </span>
        </div>
        <div className={styles.tableWrap} ref={tableWrapRef}>
          <table className={styles.chordTable}>
            <thead>
              <tr>
                <th scope="col" className={styles.thDegree}>도수</th>
                <th scope="col" className={styles.thOriginal}>원키 코드 ({keyName(targetPc)})</th>
                {[0,1,2,3,4,5,6,7].map(f => (
                  <th scope="col"
                    key={f}
                    data-active-fret={fret === f ? '1' : undefined}
                    className={`${styles.thFret} ${fret === f ? styles.thFretActive : ''} ${recommendedFrets.has(f) ? styles.thFretRec : ''}`}
                  >
                    <div className={styles.thFretNum}>{f === 0 ? '없음' : `${f}F`}</div>
                    {recommendedFrets.has(f) && <div className={styles.thFretBadge}>추천</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diatonicTarget.map((chord, i) => (
                <tr key={i}>
                  <td className={styles.tdDegree}>{ROMAN[i]}</td>
                  <td className={styles.tdOriginal}>{chord}</td>
                  {[0,1,2,3,4,5,6,7].map(f => {
                    const playChord = colChords[f][i]
                    const easy = isEasyChord(playChord)
                    const barre = isBarreChord(playChord)
                    return (
                      <td
                        key={f}
                        className={`${styles.tdChord} ${fret === f ? styles.tdChordActive : ''} ${easy ? styles.tdChordEasy : ''} ${barre ? styles.tdChordBarre : ''}`}
                      >{playChord}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          표의 각 열은 카포 위치, 각 행은 원키의 다이아토닉 코드입니다. 해당 카포에서 잡는 코드 모양이 표시됩니다.
        </p>
      </div>

      {/* 추천 배지 */}
      <div className={styles.recCard}>
        <div className={styles.recLabel}>쉬운 코드 추천 카포 위치</div>
        <div className={styles.recList}>
          {recommended.map((r, i) => {
            const pk = keyName(((targetPc - r.fret) % 12 + 12) % 12)
            return (
              <div key={i} className={styles.recItem}>
                <div className={styles.recItemHead}>
                  <span className={styles.recItemRank}>{i === 0 ? '1순위' : '2순위'}</span>
                  <span className={styles.recItemFret}>{r.fret === 0 ? '카포 없음' : `카포 ${r.fret}프렛`}</span>
                </div>
                <div className={styles.recItemBody}>
                  {pk} 키 모양으로 연주 · 쉬운 코드 {r.easyCount}개 / 바레 {r.barreCount}개
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────── 탭 2: 키 변환기 (전조) ──────────────────────── */
function PianoKeyboard({ highlightFrom, highlightTo }: { highlightFrom: Note; highlightTo: Note }) {
  const whiteNotes: Note[] = ['C','D','E','F','G','A','B','C']
  const blackMap: Record<number, Note> = { 0: 'C#', 1: 'D#', 3: 'F#', 4: 'G#', 5: 'A#' }
  const whiteW = 36
  const whiteH = 150
  const blackW = 22
  const blackH = 92
  const width = whiteNotes.length * whiteW
  const height = whiteH + 24

  return (
    <div className={styles.pianoWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.pianoSvg} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* White keys */}
        {whiteNotes.map((n, i) => {
          const fromHit = (i < 7 && n === highlightFrom) || (i === 7 && highlightFrom === 'C')
          const toHit   = (i < 7 && n === highlightTo)   || (i === 7 && highlightTo === 'C')
          const fill = fromHit ? 'var(--accent)' : toHit ? 'var(--cat-health)' : '#E8E8E8'
          return (
            <g key={`w-${i}`}>
              <rect
                x={i * whiteW + 1} y={0}
                width={whiteW - 2} height={whiteH}
                fill={fill}
                stroke="#999" strokeWidth={1}
                rx={0} ry={0}
              />
              <text
                x={i * whiteW + whiteW/2}
                y={whiteH - 14}
                fontSize={11}
                fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
                fontWeight={700}
                fill={fromHit || toHit ? '#ffffff' : '#555'}
                textAnchor="middle"
              >{n}</text>
              {fromHit && (
                <circle cx={i*whiteW + whiteW/2} cy={whiteH + 12} r={5} fill="var(--accent)" />
              )}
              {toHit && !fromHit && (
                <circle cx={i*whiteW + whiteW/2} cy={whiteH + 12} r={5} fill="var(--cat-health)" />
              )}
            </g>
          )
        })}
        {/* Black keys */}
        {whiteNotes.slice(0, 7).map((_, i) => {
          const n = blackMap[i]
          if (!n) return null
          const fromHit = n === highlightFrom
          const toHit   = n === highlightTo
          const fill = fromHit ? 'var(--accent)' : toHit ? 'var(--cat-health)' : '#1a1a1a'
          const cx = (i + 1) * whiteW - blackW / 2
          return (
            <g key={`b-${i}`}>
              <rect
                x={cx} y={0}
                width={blackW} height={blackH}
                fill={fill}
                stroke="#000" strokeWidth={1}
                rx={2} ry={2}
              />
              <text
                x={cx + blackW/2}
                y={blackH - 8}
                fontSize={9}
                fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
                fontWeight={700}
                fill={fromHit || toHit ? '#ffffff' : '#777'}
                textAnchor="middle"
              >{n}</text>
            </g>
          )
        })}
      </svg>
      <div className={styles.pianoLegend}>
        <span><span className={styles.pianoDotAccent} /> 원래 키 ({keyName(pcOf(highlightFrom))})</span>
        <span><span className={styles.pianoDotBlue} /> 새 키 ({keyName(pcOf(highlightTo))})</span>
      </div>
    </div>
  )
}

function TransposeTab() {
  const [origKey, setOrigKey] = useState<Note>('C')
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [semitones, setSemitones] = useState(2)
  const [progText, setProgText] = useState('')
  const [progCopied, setProgCopied] = useState<'ok' | 'fail' | null>(null)

  const shift = direction === 'up' ? semitones : -semitones
  const origPc = pcOf(origKey)
  const newPc = ((origPc + shift) % 12 + 12) % 12
  const newKey = NOTES[newPc]

  const origDiatonic = useMemo(() => spellDiatonic(origPc), [origPc])
  const newDiatonic = useMemo(() => spellDiatonic(newPc), [newPc])

  const progResult = useMemo(() => {
    if (!progText.trim()) return ''
    const prefer: 'sharp' | 'flat' = FLAT_PREF_PCS.has(newPc) ? 'flat' : 'sharp'
    return progText
      .split(/(\s+|[|,()\u00b7\u2013\u2014-]+)/)
      .map(tok => transposeChordSmart(tok, shift, prefer))
      .join('')
  }, [progText, shift, newPc])

  const handleProgCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(progResult)
      setProgCopied('ok')
    } catch {
      setProgCopied('fail')
    }
    setTimeout(() => setProgCopied(null), 1500)
  }, [progResult])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>① 원래 키</div>
        <KeyGrid value={origKey} onChange={setOrigKey} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>② 이동 방향</div>
        <div className={styles.dirRow}>
          <button
            type="button" aria-pressed={direction === 'up'}
            className={`${styles.dirBtn} ${direction === 'up' ? styles.dirBtnActive : ''}`}
            onClick={() => setDirection('up')}
          >↑ 올리기</button>
          <button
            type="button" aria-pressed={direction === 'down'}
            className={`${styles.dirBtn} ${direction === 'down' ? styles.dirBtnActive : ''}`}
            onClick={() => setDirection('down')}
          >↓ 내리기</button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>③ 이동 반음 수</div>
        <div className={styles.semiRow}>
          {[1,2,3,4,5,6].map(s => (
            <button
              key={s}
              type="button"
              aria-pressed={semitones === s}
              className={`${styles.semiBtn} ${semitones === s ? styles.semiBtnActive : ''}`}
              onClick={() => setSemitones(s)}
            >{s}반음</button>
          ))}
        </div>
      </div>

      <div className={styles.hero} role="status">
        <div className={styles.heroLabel}>
          {keyName(origPc)} 키 {direction === 'up' ? '↑' : '↓'} {semitones}반음 전조
        </div>
        <div className={styles.heroRow}>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>원래 키</div>
            <div className={styles.heroChord}>{keyName(origPc)}</div>
          </div>
          <div className={styles.heroArrow}>→</div>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>전조 후 키</div>
            <div className={styles.heroChordBlue}>{keyName(newPc)}</div>
          </div>
        </div>
      </div>

      {/* Piano */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>④ 건반 시각화</div>
        <PianoKeyboard highlightFrom={origKey} highlightTo={newKey} />
      </div>

      {/* Chord conversion table */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>⑤ 다이아토닉 코드 변환</div>
        <div className={styles.tableWrap}>
          <table className={`${styles.chordTable} ${styles.chordTableNarrow}`}>
            <thead>
              <tr>
                <th scope="col" className={styles.thDegree}>도수</th>
                <th scope="col" className={styles.thOriginal}>원키 ({keyName(origPc)})</th>
                <th scope="col" className={styles.thNewKey}>새 키 ({keyName(newPc)})</th>
              </tr>
            </thead>
            <tbody>
              {origDiatonic.map((c, i) => (
                <tr key={i}>
                  <td className={styles.tdDegree}>{ROMAN[i]}</td>
                  <td className={styles.tdOriginal}>{c}</td>
                  <td className={styles.tdNewKey}>{newDiatonic[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          전조는 곡의 모든 코드·멜로디를 같은 반음 수만큼 이동시키는 작업입니다. 보컬 음역대 조정·악기 편곡에 활용됩니다.
        </p>
      </div>

      {/* 코드 진행 직접 변환 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>⑥ 코드 진행 직접 변환 (선택)</div>
        <textarea
          className={styles.progInput}
          rows={3}
          placeholder="예: Cadd9 G/B Am7 Fsus2 — 코드를 공백이나 | 로 구분해 입력"
          value={progText}
          onChange={e => setProgText(e.target.value)}
          aria-label="변환할 코드 진행"
        />
        {progText.trim() !== '' && (
          <>
            <div className={styles.progOut} role="status">{progResult}</div>
            <button type="button" className={styles.copyBtn} onClick={handleProgCopy}>
              {progCopied === 'ok' ? '✓ 복사됨' : progCopied === 'fail' ? '✗ 복사 실패' : '변환 결과 복사'}
            </button>
          </>
        )}
        <p className={styles.note}>
          서픽스(add9·sus4·m7 등)와 슬래시 베이스(G/B)는 유지하고 루트·베이스 음만 이동합니다.
          새 키의 조표에 맞춰 샤프/플랫 표기를 자동 선택합니다. 코드 외 텍스트(가사 등)는 넣지 마세요.
        </p>
      </div>
    </div>
  )
}

/* ──────────────────────── 탭 3: 다이아토닉 코드표 ──────────────────────── */
function DegreeTab() {
  const [rootKey, setRootKey] = useState<Note>('C')
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null)
  const rootPc = pcOf(rootKey)
  const diatonic = useMemo(() => spellDiatonic(rootPc), [rootPc])

  const handleCopy = useCallback(async () => {
    const text = `${keyName(rootPc)} 키 다이아토닉 코드: ` + diatonic.map((c, i) => `${ROMAN[i]}=${c}`).join(', ')
    try {
      await navigator.clipboard.writeText(text)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
    setTimeout(() => setCopied(null), 1500)
  }, [rootPc, diatonic])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>원키 선택</div>
        <KeyGrid value={rootKey} onChange={setRootKey} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>{keyName(rootPc)} 키의 다이아토닉 코드 7개</div>
        <div className={styles.degreeGrid}>
          {diatonic.map((c, i) => (
            <div
              key={i}
              className={styles.degreeCard}
              style={{ borderColor: `color-mix(in srgb, ${FUNCTION_COLORS[i]} 27%, transparent)` }}
            >
              <div className={styles.degreeRoman} style={{ color: FUNCTION_COLORS[i] }}>{ROMAN[i]}</div>
              <div className={styles.degreeChord}>{c}</div>
              <div className={styles.degreeFunc}>{FUNCTION_LABELS[i]}</div>
            </div>
          ))}
        </div>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied === 'ok' ? '✓ 복사됨' : copied === 'fail' ? '✗ 복사 실패' : '코드 목록 복사'}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>대표 코드 진행 — {keyName(rootPc)} 키</div>
        <div className={styles.progList}>
          {[
            { name: 'I - V - vi - IV', nick: '팝/발라드 기본', indices: [0, 4, 5, 3] },
            { name: 'ii - V - I',      nick: '재즈 투파이브원', indices: [1, 4, 0] },
            { name: 'I - vi - IV - V', nick: '50년대 진행',    indices: [0, 5, 3, 4] },
            { name: 'vi - IV - I - V', nick: '이모 진행',      indices: [5, 3, 0, 4] },
          ].map(p => (
            <div key={p.name} className={styles.progItem}>
              <div className={styles.progHead}>
                <span className={styles.progName}>{p.name}</span>
                <span className={styles.progNick}>{p.nick}</span>
              </div>
              <div className={styles.progChords}>
                {p.indices.map((idx, k) => (
                  <span key={k} className={styles.progChord}>{diatonic[idx]}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────── 메인 ──────────────────────── */
export default function CapoClient() {
  const [tab, setTab] = useState<'capo' | 'transpose' | 'degree'>('capo')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button type="button" aria-pressed={tab === 'capo'} className={`${styles.tab} ${tab === 'capo' ? styles.tabActive : ''}`} onClick={() => setTab('capo')}>
          카포 계산기
        </button>
        <button type="button" aria-pressed={tab === 'transpose'} className={`${styles.tab} ${tab === 'transpose' ? styles.tabActive : ''}`} onClick={() => setTab('transpose')}>
          전조 계산
        </button>
        <button type="button" aria-pressed={tab === 'degree'} className={`${styles.tab} ${tab === 'degree' ? styles.tabActive : ''}`} onClick={() => setTab('degree')}>
          다이아토닉
        </button>
      </div>

      {/* 탭 전환 시 입력 상태 보존을 위해 언마운트하지 않고 hidden 처리 */}
      <div hidden={tab !== 'capo'}><CapoTab /></div>
      <div hidden={tab !== 'transpose'}><TransposeTab /></div>
      <div hidden={tab !== 'degree'}><DegreeTab /></div>
    </div>
  )
}
