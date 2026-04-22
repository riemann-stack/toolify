'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './capo.module.css'

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const
type Note = typeof NOTES[number]

const NOTES_FLAT: Record<Note, string> = {
  'C':'C','C#':'Db','D':'D','D#':'Eb','E':'E','F':'F','F#':'Gb','G':'G','G#':'Ab','A':'A','A#':'Bb','B':'B',
}
const SHARP_SET = new Set<Note>(['C#','D#','F#','G#','A#'])

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11]
const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'] as const
const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const FUNCTION_LABELS = ['토닉 (T)', '서브도미넌트 (SD)', '토닉 대리', '서브도미넌트 (SD)', '도미넌트 (D)', '토닉 대리', '도미넌트 대리']
const FUNCTION_COLORS = ['#C8FF3E', '#3EC8FF', '#C8FF3E', '#3EC8FF', '#FF8C3E', '#C8FF3E', '#FF8C3E']

const EASY_OPEN_CHORDS = new Set(['C','G','D','Em','Am','A','E','Dm'])
const BARRE_CHORDS = new Set([
  'F','Bb','Eb','Ab','Db','Gb','B','F#','C#','G#','D#','A#',
  'Bm','F#m','C#m','G#m','D#m','A#m','Fm','Bbm','Ebm',
])

function flatOf(note: Note): string { return NOTES_FLAT[note] }

function getDiatonic(rootKey: Note): string[] {
  const rootIdx = NOTES.indexOf(rootKey)
  return MAJOR_INTERVALS.map((interval, i) => {
    const idx = (rootIdx + interval) % 12
    return NOTES[idx] + MAJOR_QUALITIES[i]
  })
}

function parseChord(chord: string): { rootIdx: number; quality: string } | null {
  if (!chord) return null
  let root = chord[0]
  let rest = chord.slice(1)
  if (rest.startsWith('#')) { root += '#'; rest = rest.slice(1) }
  else if (rest.startsWith('b')) {
    const flatToSharp: Record<string, string> = { 'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#' }
    const key = root + 'b'
    if (flatToSharp[key]) { root = flatToSharp[key]; rest = rest.slice(1) }
  }
  const idx = NOTES.indexOf(root as Note)
  if (idx < 0) return null
  return { rootIdx: idx, quality: rest }
}

function transposeChord(chord: string, semitones: number): string {
  const parsed = parseChord(chord)
  if (!parsed) return chord
  const newIdx = ((parsed.rootIdx + semitones) % 12 + 12) % 12
  return NOTES[newIdx] + parsed.quality
}

function isEasyChord(chord: string): boolean { return EASY_OPEN_CHORDS.has(chord) }
function isBarreChord(chord: string): boolean {
  if (EASY_OPEN_CHORDS.has(chord)) return false
  if (chord.endsWith('dim')) return false
  return BARRE_CHORDS.has(chord)
}

function recommendCapos(targetKey: Note): { fret: number; easyCount: number; barreCount: number }[] {
  const targetIdx = NOTES.indexOf(targetKey)
  const scored: { fret: number; easyCount: number; barreCount: number }[] = []
  for (let fret = 0; fret <= 7; fret++) {
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

  const playKey = useMemo<Note>(() => {
    const idx = ((NOTES.indexOf(targetKey) - fret) % 12 + 12) % 12
    return NOTES[idx]
  }, [targetKey, fret])

  const diatonicTarget = useMemo(() => getDiatonic(targetKey), [targetKey])
  const recommended = useMemo(() => recommendCapos(targetKey), [targetKey])
  const recommendedFrets = useMemo(() => new Set(recommended.map(r => r.fret)), [recommended])

  const playingDiatonic = useMemo(
    () => diatonicTarget.map(c => transposeChord(c, -fret)),
    [diatonicTarget, fret]
  )

  return (
    <div className={styles.tabContent}>
      {/* 원래 키 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>① 원래 키 (곡의 실제 키)</div>
        <KeyGrid value={targetKey} onChange={setTargetKey} />
      </div>

      {/* 카포 위치 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>② 카포 위치</div>
        <div className={styles.fretRow}>
          {[0,1,2,3,4,5,6,7].map(f => (
            <button
              key={f}
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
      <div className={styles.hero}>
        <div className={styles.heroLabel}>
          카포 {fret === 0 ? '없음' : `${fret}프렛`}에서
        </div>
        <div className={styles.heroRow}>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>연주 키(코드 모양)</div>
            <div className={styles.heroChord}>{playKey}</div>
          </div>
          <div className={styles.heroArrow}>→</div>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>실제 울리는 키</div>
            <div className={styles.heroChord}>{targetKey}</div>
          </div>
        </div>
        <div className={styles.heroNote}>
          {playKey} 코드 모양 + 카포 {fret}프렛 = <strong>{targetKey}</strong> 소리
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
        <div className={styles.tableWrap}>
          <table className={styles.chordTable}>
            <thead>
              <tr>
                <th className={styles.thDegree}>도수</th>
                <th className={styles.thOriginal}>원키 코드 ({targetKey})</th>
                {[0,1,2,3,4,5,6,7].map(f => (
                  <th
                    key={f}
                    className={`${styles.thFret} ${fret === f ? styles.thFretActive : ''} ${recommendedFrets.has(f) ? styles.thFretRec : ''}`}
                  >
                    <div className={styles.thFretNum}>{f === 0 ? '없음' : `${f}F`}</div>
                    {recommendedFrets.has(f) && <div className={styles.thFretBadge}>✨ 추천</div>}
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
                    const playChord = transposeChord(chord, -f)
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
        <div className={styles.recLabel}>✨ 쉬운 코드 추천 카포 위치</div>
        <div className={styles.recList}>
          {recommended.map((r, i) => {
            const pk = NOTES[((NOTES.indexOf(targetKey) - r.fret) % 12 + 12) % 12]
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
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.pianoSvg} preserveAspectRatio="xMidYMid meet">
        {/* White keys */}
        {whiteNotes.map((n, i) => {
          const fromHit = (i < 7 && n === highlightFrom) || (i === 7 && highlightFrom === 'C')
          const toHit   = (i < 7 && n === highlightTo)   || (i === 7 && highlightTo === 'C')
          const fill = fromHit ? '#C8FF3E' : toHit ? '#3EC8FF' : '#E8E8E8'
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
                fontFamily="Syne, sans-serif"
                fontWeight={700}
                fill={fromHit || toHit ? '#0D0D0D' : '#555'}
                textAnchor="middle"
              >{n}</text>
              {fromHit && (
                <circle cx={i*whiteW + whiteW/2} cy={whiteH + 12} r={5} fill="#C8FF3E" />
              )}
              {toHit && !fromHit && (
                <circle cx={i*whiteW + whiteW/2} cy={whiteH + 12} r={5} fill="#3EC8FF" />
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
          const fill = fromHit ? '#C8FF3E' : toHit ? '#3EC8FF' : '#1a1a1a'
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
                fontFamily="Syne, sans-serif"
                fontWeight={700}
                fill={fromHit || toHit ? '#0D0D0D' : '#777'}
                textAnchor="middle"
              >{n}</text>
            </g>
          )
        })}
      </svg>
      <div className={styles.pianoLegend}>
        <span><span className={styles.pianoDotAccent} /> 원래 키 ({highlightFrom})</span>
        <span><span className={styles.pianoDotBlue} /> 새 키 ({highlightTo})</span>
      </div>
    </div>
  )
}

function TransposeTab() {
  const [origKey, setOrigKey] = useState<Note>('C')
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [semitones, setSemitones] = useState(2)

  const shift = direction === 'up' ? semitones : -semitones
  const newKey = useMemo<Note>(() => {
    const idx = ((NOTES.indexOf(origKey) + shift) % 12 + 12) % 12
    return NOTES[idx]
  }, [origKey, shift])

  const origDiatonic = useMemo(() => getDiatonic(origKey), [origKey])
  const newDiatonic = useMemo(() => getDiatonic(newKey), [newKey])

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
            className={`${styles.dirBtn} ${direction === 'up' ? styles.dirBtnActive : ''}`}
            onClick={() => setDirection('up')}
          >↑ 올리기</button>
          <button
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
              className={`${styles.semiBtn} ${semitones === s ? styles.semiBtnActive : ''}`}
              onClick={() => setSemitones(s)}
            >{s}반음</button>
          ))}
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroLabel}>
          {origKey} 키 {direction === 'up' ? '↑' : '↓'} {semitones}반음 전조
        </div>
        <div className={styles.heroRow}>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>원래 키</div>
            <div className={styles.heroChord}>{origKey}</div>
          </div>
          <div className={styles.heroArrow}>→</div>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>전조 후 키</div>
            <div className={styles.heroChordBlue}>{newKey}</div>
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
          <table className={styles.chordTable}>
            <thead>
              <tr>
                <th className={styles.thDegree}>도수</th>
                <th className={styles.thOriginal}>원키 ({origKey})</th>
                <th className={styles.thNewKey}>새 키 ({newKey})</th>
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
    </div>
  )
}

/* ──────────────────────── 탭 3: 다이아토닉 코드표 ──────────────────────── */
function DegreeTab() {
  const [rootKey, setRootKey] = useState<Note>('C')
  const diatonic = useMemo(() => getDiatonic(rootKey), [rootKey])

  const handleCopy = useCallback(async () => {
    const text = `${rootKey} 키 다이아토닉 코드: ` + diatonic.map((c, i) => `${ROMAN[i]}=${c}`).join(', ')
    try { await navigator.clipboard.writeText(text) } catch {}
  }, [rootKey, diatonic])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>원키 선택</div>
        <KeyGrid value={rootKey} onChange={setRootKey} />
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>{rootKey} 키의 다이아토닉 코드 7개</div>
        <div className={styles.degreeGrid}>
          {diatonic.map((c, i) => (
            <div
              key={i}
              className={styles.degreeCard}
              style={{ borderColor: `${FUNCTION_COLORS[i]}44` }}
            >
              <div className={styles.degreeRoman} style={{ color: FUNCTION_COLORS[i] }}>{ROMAN[i]}</div>
              <div className={styles.degreeChord}>{c}</div>
              <div className={styles.degreeFunc}>{FUNCTION_LABELS[i]}</div>
            </div>
          ))}
        </div>
        <button className={styles.copyBtn} onClick={handleCopy}>📋 코드 목록 복사</button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>대표 코드 진행 — {rootKey} 키</div>
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
        <button className={`${styles.tab} ${tab === 'capo' ? styles.tabActive : ''}`} onClick={() => setTab('capo')}>
          🎸 카포 계산기
        </button>
        <button className={`${styles.tab} ${tab === 'transpose' ? styles.tabActive : ''}`} onClick={() => setTab('transpose')}>
          🔄 전조 계산
        </button>
        <button className={`${styles.tab} ${tab === 'degree' ? styles.tabActive : ''}`} onClick={() => setTab('degree')}>
          🎼 다이아토닉
        </button>
      </div>

      {tab === 'capo'      && <CapoTab />}
      {tab === 'transpose' && <TransposeTab />}
      {tab === 'degree'    && <DegreeTab />}
    </div>
  )
}
