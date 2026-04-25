'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import s from './chord.module.css'

/* ────────────────────────────────────────────────
 * 음 정의
 * ──────────────────────────────────────────────── */
const NOTES_SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const
const NOTES_FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] as const
type Notation = '#' | 'b'

function notes(notation: Notation): readonly string[] {
  return notation === '#' ? NOTES_SHARP : NOTES_FLAT
}

function noteToIndex(note: string): number {
  const i = NOTES_SHARP.indexOf(note as typeof NOTES_SHARP[number])
  if (i >= 0) return i
  return NOTES_FLAT.indexOf(note as typeof NOTES_FLAT[number])
}

/* ────────────────────────────────────────────────
 * 코드 정의
 * ──────────────────────────────────────────────── */
const CHORD_INTERVALS: Record<string, number[]> = {
  Major:    [0, 4, 7],
  Minor:    [0, 3, 7],
  aug:      [0, 4, 8],
  dim:      [0, 3, 6],
  sus2:     [0, 2, 7],
  sus4:     [0, 5, 7],
  maj7:     [0, 4, 7, 11],
  m7:       [0, 3, 7, 10],
  '7':      [0, 4, 7, 10],
  m7b5:     [0, 3, 6, 10],
  dim7:     [0, 3, 6, 9],
  'maj7#5': [0, 4, 8, 11],
  mM7:      [0, 3, 7, 11],
  '9':      [0, 4, 7, 10, 14],
  maj9:     [0, 4, 7, 11, 14],
  m9:       [0, 3, 7, 10, 14],
  add9:     [0, 4, 7, 14],
  '11':     [0, 4, 7, 10, 14, 17],
  maj11:    [0, 4, 7, 11, 14, 17],
  m11:      [0, 3, 7, 10, 14, 17],
  '13':     [0, 4, 7, 10, 14, 17, 21],
  maj13:    [0, 4, 7, 11, 14, 17, 21],
  '6':      [0, 4, 7, 9],
  m6:       [0, 3, 7, 9],
  '6/9':    [0, 4, 7, 9, 14],
  '7sus4':  [0, 5, 7, 10],
  '7sus2':  [0, 2, 7, 10],
  '7b5':    [0, 4, 6, 10],
  '7#5':    [0, 4, 8, 10],
  '9b5':    [0, 4, 6, 10, 14],
  '9#5':    [0, 4, 8, 10, 14],
}

const INTERVAL_LABELS: Record<string, string[]> = {
  Major:    ['근음','장3도','완전5도'],
  Minor:    ['근음','단3도','완전5도'],
  aug:      ['근음','장3도','증5도'],
  dim:      ['근음','단3도','감5도'],
  sus2:     ['근음','장2도','완전5도'],
  sus4:     ['근음','완전4도','완전5도'],
  maj7:     ['근음','장3도','완전5도','장7도'],
  m7:       ['근음','단3도','완전5도','단7도'],
  '7':      ['근음','장3도','완전5도','단7도'],
  m7b5:     ['근음','단3도','감5도','단7도'],
  dim7:     ['근음','단3도','감5도','감7도'],
  'maj7#5': ['근음','장3도','증5도','장7도'],
  mM7:      ['근음','단3도','완전5도','장7도'],
  '9':      ['근음','장3도','완전5도','단7도','9도'],
  maj9:     ['근음','장3도','완전5도','장7도','9도'],
  m9:       ['근음','단3도','완전5도','단7도','9도'],
  add9:     ['근음','장3도','완전5도','9도'],
  '11':     ['근음','장3도','완전5도','단7도','9도','11도'],
  maj11:    ['근음','장3도','완전5도','장7도','9도','11도'],
  m11:      ['근음','단3도','완전5도','단7도','9도','11도'],
  '13':     ['근음','장3도','완전5도','단7도','9도','11도','13도'],
  maj13:    ['근음','장3도','완전5도','장7도','9도','11도','13도'],
  '6':      ['근음','장3도','완전5도','6도'],
  m6:       ['근음','단3도','완전5도','6도'],
  '6/9':    ['근음','장3도','완전5도','6도','9도'],
  '7sus4':  ['근음','완전4도','완전5도','단7도'],
  '7sus2':  ['근음','장2도','완전5도','단7도'],
  '7b5':    ['근음','장3도','감5도','단7도'],
  '7#5':    ['근음','장3도','증5도','단7도'],
  '9b5':    ['근음','장3도','감5도','단7도','9도'],
  '9#5':    ['근음','장3도','증5도','단7도','9도'],
}

const TYPE_GROUPS: { label: string; types: string[] }[] = [
  { label: '기본 코드',       types: ['Major','Minor','aug','dim','sus2','sus4'] },
  { label: '7th 코드',         types: ['maj7','m7','7','m7b5','dim7','maj7#5','mM7'] },
  { label: '9th·11th·13th',    types: ['9','maj9','m9','add9','11','maj11','m11','13','maj13'] },
  { label: '추가 변형',        types: ['6','m6','6/9','7sus4','7sus2','7b5','7#5','9b5','9#5'] },
]

const ALL_ROOTS_SHARP = NOTES_SHARP

function chordSuffix(type: string): string {
  if (type === 'Major') return ''
  if (type === 'Minor') return 'm'
  return type
}
function chordFullName(root: string, type: string): string {
  return root + chordSuffix(type)
}

function getChordNotes(root: string, type: string, notation: Notation): string[] {
  const ns = notes(notation)
  const rootIdx = noteToIndex(root)
  if (rootIdx === -1) return []
  const intervals = CHORD_INTERVALS[type] ?? []
  return intervals.map(iv => ns[(rootIdx + iv) % 12])
}

/* ────────────────────────────────────────────────
 * 다이아토닉
 * ──────────────────────────────────────────────── */
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
const MAJOR_CHORD_TYPES = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5']
const MAJOR_FUNCTIONS: ('tonic'|'sub'|'dom')[] = ['tonic','sub','tonic','sub','dom','tonic','dom']

const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]
const MINOR_CHORD_TYPES = ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7']
const MINOR_FUNCTIONS: ('tonic'|'sub'|'dom')[] = ['tonic','sub','tonic','sub','dom','sub','dom']

const ROMAN_MAJOR = ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ']
const ROMAN_MINOR = ['ⅰ','ⅱ','Ⅲ','ⅳ','ⅴ','Ⅵ','Ⅶ']

const FUNC_LABEL: Record<'tonic'|'sub'|'dom', string> = {
  tonic: '토닉',
  sub: '서브도미넌트',
  dom: '도미넌트',
}

function getDiatonicChords(rootKey: string, mode: 'major'|'minor', notation: Notation) {
  const ns = notes(notation)
  const rootIdx = noteToIndex(rootKey)
  const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE
  const types = mode === 'major' ? MAJOR_CHORD_TYPES : MINOR_CHORD_TYPES
  const funcs = mode === 'major' ? MAJOR_FUNCTIONS : MINOR_FUNCTIONS
  const romans = mode === 'major' ? ROMAN_MAJOR : ROMAN_MINOR
  return scale.map((interval, i) => {
    const chordRoot = ns[(rootIdx + interval) % 12]
    const type = types[i]
    return {
      degree: romans[i],
      root: chordRoot,
      type,
      name: chordFullName(chordRoot, type),
      notes: getChordNotes(chordRoot, type, notation),
      func: funcs[i],
    }
  })
}

/* ────────────────────────────────────────────────
 * 진행 패턴
 * ──────────────────────────────────────────────── */
type Progression = { name: string; nick: string; degrees: number[]; types?: string[] }
const MAJOR_PROGRESSIONS: Progression[] = [
  { name: 'Ⅰ → Ⅴ → Ⅵm → Ⅳ', nick: '1645 진행 (팝의 왕)', degrees: [0,4,5,3] },
  { name: 'Ⅱ → Ⅴ → Ⅰ',       nick: '2-5-1 (재즈 기본)',     degrees: [1,4,0] },
  { name: 'Ⅰ → Ⅵm → Ⅳ → Ⅴ', nick: '1-6-4-5 (올드팝)',     degrees: [0,5,3,4] },
  { name: 'Ⅰ → Ⅳ → Ⅴ',       nick: '1-4-5 (블루스·록)',     degrees: [0,3,4] },
]
const MINOR_PROGRESSIONS: Progression[] = [
  { name: 'ⅰ → Ⅵ → Ⅲ → Ⅶ', nick: '서정적 마이너 진행', degrees: [0,5,2,6] },
  { name: 'ⅰ → Ⅳ → Ⅴ',       nick: '마이너 1-4-5',       degrees: [0,3,4] },
  { name: 'ⅱ° → Ⅴ → ⅰ',     nick: '마이너 2-5-1',       degrees: [1,4,0] },
]

/* ────────────────────────────────────────────────
 * 다음 코드 추천
 * ──────────────────────────────────────────────── */
function getNextChords(root: string, type: string, notation: Notation): { name: string; reason: string }[] {
  const ns = notes(notation)
  const rootIdx = noteToIndex(root)
  const at = (offset: number) => ns[((rootIdx + offset) % 12 + 12) % 12]

  const major = ['Major','maj7','maj9','6','add9','6/9','maj11','maj13']
  const dom   = ['7','9','13','7sus4','7sus2','7b5','7#5','9b5','9#5','11']
  const minor = ['Minor','m7','m9','m11','m6','mM7']
  const dimType = ['dim','dim7','m7b5']
  const sus = ['sus2','sus4']
  const augType = ['aug','maj7#5']

  if (major.includes(type)) {
    return [
      { name: at(5) + 'maj7', reason: 'Ⅳ (서브도미넌트)' },
      { name: at(7) + '7',    reason: 'Ⅴ7 (도미넌트)' },
      { name: at(9) + 'm7',   reason: 'Ⅵm7 (관련 단조)' },
      { name: at(2) + 'm7',   reason: 'Ⅱm7' },
    ]
  }
  if (dom.includes(type)) {
    return [
      { name: at(5) + 'maj7', reason: 'Ⅰ (5도 아래 해결)' },
      { name: at(5) + 'm7',   reason: 'ⅰ (단조 해결)' },
      { name: at(0) + 'sus4', reason: '동음 sus4 (해결 지연)' },
    ]
  }
  if (minor.includes(type)) {
    return [
      { name: at(5) + 'm7',    reason: 'ⅳm7' },
      { name: at(7) + '7',     reason: 'Ⅴ7' },
      { name: at(3) + 'maj7',  reason: '관련 장조 Ⅰ' },
      { name: at(8) + 'maj7',  reason: 'Ⅵmaj7' },
    ]
  }
  if (dimType.includes(type)) {
    return [
      { name: at(1) + 'maj7', reason: '반음 위 해결' },
      { name: at(1) + 'm7',   reason: '반음 위 해결(단)' },
      { name: at(5) + 'maj7', reason: '4도 위 해결' },
    ]
  }
  if (sus.includes(type)) {
    return [
      { name: at(0) + 'maj7', reason: '동음 메이저 해결' },
      { name: at(0) + '7',    reason: '동음 도미넌트' },
    ]
  }
  if (augType.includes(type)) {
    return [
      { name: at(5) + 'maj7', reason: 'Ⅳ로 진행' },
      { name: at(9) + 'm7',   reason: 'Ⅵm7' },
    ]
  }
  return []
}

/* ────────────────────────────────────────────────
 * 컴포넌트
 * ──────────────────────────────────────────────── */
type Tab = 'find' | 'reverse' | 'diatonic'

export default function ChordClient() {
  const [tab, setTab] = useState<Tab>('find')
  const [notation, setNotation] = useState<Notation>('#')
  const [root, setRoot] = useState<string>('C')
  const [chordType, setChordType] = useState<string>('maj7')

  // 역방향 검색
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]) // pitch class indices
  const [searchScope, setSearchScope] = useState<'all'|'tri'|'tet'>('all')

  // 다이아토닉
  const [diatonicKey, setDiatonicKey] = useState<string>('C')
  const [diatonicMode, setDiatonicMode] = useState<'major'|'minor'>('major')

  // 표시할 root/key 텍스트 (notation에 맞게 변환)
  const displayRoot = useMemo(() => {
    const idx = noteToIndex(root)
    return notes(notation)[idx] ?? root
  }, [root, notation])
  const displayDiatonicKey = useMemo(() => {
    const idx = noteToIndex(diatonicKey)
    return notes(notation)[idx] ?? diatonicKey
  }, [diatonicKey, notation])

  const chordNotes = useMemo(() =>
    getChordNotes(displayRoot, chordType, notation),
  [displayRoot, chordType, notation])

  const chordFullStr = chordFullName(displayRoot, chordType)
  const intervalLabels = INTERVAL_LABELS[chordType] ?? []

  const nextChords = useMemo(() =>
    getNextChords(displayRoot, chordType, notation),
  [displayRoot, chordType, notation])

  /* ── 역방향 검색 매칭 ── */
  const matches = useMemo(() => {
    if (selectedNotes.length < 2) return []
    const selSet = new Set(selectedNotes)
    const results: { name: string; type: string; root: string; chordPCs: number[]; matched: number; pct: number }[] = []

    for (const r of ALL_ROOTS_SHARP) {
      for (const type of Object.keys(CHORD_INTERVALS)) {
        const intervals = CHORD_INTERVALS[type]
        if (searchScope === 'tri' && intervals.length !== 3) continue
        if (searchScope === 'tet' && intervals.length !== 4) continue

        const rootIdx = noteToIndex(r)
        const pcs = Array.from(new Set(intervals.map(iv => (rootIdx + iv) % 12)))
        const matched = pcs.filter(pc => selSet.has(pc)).length
        const denom = Math.max(pcs.length, selectedNotes.length)
        const pct = matched / denom

        if (pct >= 0.5) {
          results.push({
            name: chordFullName(r, type),
            type,
            root: r,
            chordPCs: pcs,
            matched,
            pct,
          })
        }
      }
    }
    // 정렬: 일치율 desc, 다음 chord size asc(단순한 코드 우선)
    results.sort((a, b) =>
      b.pct - a.pct ||
      a.chordPCs.length - b.chordPCs.length ||
      a.name.localeCompare(b.name),
    )
    // notation 기준 이름 변환
    return results.slice(0, 12).map(r => ({
      ...r,
      displayName: chordFullName(notes(notation)[noteToIndex(r.root)], r.type),
      displayNotes: r.chordPCs.map(pc => notes(notation)[pc]),
    }))
  }, [selectedNotes, searchScope, notation])

  /* ── 다이아토닉 ── */
  const diatonic = useMemo(() =>
    getDiatonicChords(displayDiatonicKey, diatonicMode, notation),
  [displayDiatonicKey, diatonicMode, notation])

  const progressions = diatonicMode === 'major' ? MAJOR_PROGRESSIONS : MINOR_PROGRESSIONS

  /* ── 액션 ── */
  const togglePc = (pc: number) => {
    setSelectedNotes(prev => prev.includes(pc) ? prev.filter(p => p !== pc) : [...prev, pc].sort((a,b)=>a-b))
  }
  const goToFind = (r: string, type: string) => {
    setRoot(r)
    setChordType(type)
    setTab('find')
  }
  const handleCopy = async () => {
    const text = `${chordFullStr} = ${chordNotes.join(', ')}`
    try { await navigator.clipboard.writeText(text) } catch {}
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'find' ? s.tabActive : ''}`} onClick={() => setTab('find')}>코드 → 구성음</button>
        <button className={`${s.tab} ${tab === 'reverse' ? s.tabActive : ''}`} onClick={() => setTab('reverse')}>구성음 → 코드</button>
        <button className={`${s.tab} ${tab === 'diatonic' ? s.tabActive : ''}`} onClick={() => setTab('diatonic')}>다이아토닉</button>
      </div>

      {/* ── 탭 1: 코드 → 구성음 ── */}
      {tab === 'find' && (
        <div className={s.tabContent}>
          {/* Root + Notation */}
          <div className={s.card}>
            <div className={s.cardLabelRow}>
              <span className={s.cardLabel}>근음 (Root) 선택</span>
              <NotationToggle value={notation} onChange={setNotation} />
            </div>
            <KeyGrid value={root} onChange={setRoot} notation={notation} />
          </div>

          {/* Chord type */}
          <div className={s.card}>
            <span className={s.cardLabel}>코드 타입 선택</span>
            {TYPE_GROUPS.map(group => (
              <div key={group.label} className={s.typeSection}>
                <span className={s.typeSectionLabel}>{group.label}</span>
                <div className={s.typeRow}>
                  {group.types.map(t => (
                    <button
                      key={t}
                      className={`${s.typeBtn} ${chordType === t ? s.typeBtnActive : ''}`}
                      onClick={() => setChordType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Hero */}
          <div className={s.hero}>
            <div className={s.heroLabel}>Chord</div>
            <div className={s.heroChord}>{chordFullStr}</div>
            <div className={s.heroSub}>{chordNotes.length}음 코드</div>
          </div>

          {/* Chips */}
          <div className={s.card}>
            <span className={s.cardLabel}>구성음</span>
            <div className={s.chipRow}>
              {chordNotes.map((n, i) => (
                <div key={i} className={s.chipWrap}>
                  <div className={`${s.chip} ${i === 0 ? s.chipRoot : ''}`}>{n}</div>
                  <span className={s.chipDeg}>{intervalLabels[i] ?? ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Piano */}
          <div className={s.card}>
            <span className={s.cardLabel}>피아노 건반</span>
            <div className={s.pianoWrap}>
              <div className={s.pianoSvgBox}>
                <PianoKeyboard chordPCs={chordNotes.map(noteToIndex)} rootPC={noteToIndex(displayRoot)} notation={notation} />
              </div>
              <div className={s.pianoLegend}>
                <span><span className={s.pianoDotRoot}></span> 근음</span>
                <span><span className={s.pianoDotAccent}></span> 구성음</span>
              </div>
            </div>
          </div>

          {/* Copy */}
          <button className={s.copyBtn} onClick={handleCopy}>
            📋 "{chordFullStr} = {chordNotes.join(', ')}" 복사
          </button>

          {/* Next chord recommendations */}
          {nextChords.length > 0 && (
            <div className={s.recCard}>
              <div className={s.recLabel}>💡 어울리는 다음 코드</div>
              <div className={s.recChips}>
                {nextChords.map((rc, i) => (
                  <button
                    key={i}
                    className={s.recChip}
                    onClick={() => {
                      // 추천에서 root와 type 분리
                      const m = rc.name.match(/^([A-G][#b]?)(.*)$/)
                      if (m) {
                        const reverse = NOTES_SHARP[noteToIndex(m[1])] ?? m[1]
                        const t = m[2] || 'Major'
                        if (CHORD_INTERVALS[t]) {
                          setRoot(reverse)
                          setChordType(t)
                        }
                      }
                    }}
                    title={rc.reason}
                  >
                    {rc.name}
                  </button>
                ))}
              </div>
              <p className={s.note}>
                * 추천 코드는 일반적인 진행 관행에 기반합니다. 곡의 분위기·키에 따라 다른 선택도 자연스럽습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 탭 2: 구성음 → 코드 ── */}
      {tab === 'reverse' && (
        <div className={s.tabContent}>
          <div className={s.card}>
            <div className={s.cardLabelRow}>
              <span className={s.cardLabel}>포함된 음 선택 (복수)</span>
              <NotationToggle value={notation} onChange={setNotation} />
            </div>

            {/* Note selection grid */}
            <div className={s.keyGrid}>
              {ALL_ROOTS_SHARP.map((noteSharp, pc) => {
                const sharpName = noteSharp
                const flatName = NOTES_FLAT[pc]
                const isSharp = sharpName.includes('#')
                const display = notation === '#' ? sharpName : flatName
                const sub = isSharp ? (notation === '#' ? `(${flatName})` : `(${sharpName})`) : ''
                const selected = selectedNotes.includes(pc)
                return (
                  <button
                    key={pc}
                    className={`${s.keyBtn} ${isSharp ? s.keyBtnSharp : ''} ${selected ? s.keyBtnActive : ''}`}
                    onClick={() => togglePc(pc)}
                  >
                    <span className={s.keyBtnMain}>{display}</span>
                    {sub && <span className={s.keyBtnSub}>{sub}</span>}
                  </button>
                )
              })}
            </div>

            {/* Scope */}
            <div style={{ marginTop: 14 }}>
              <span className={s.cardLabel}>검색 범위</span>
              <div className={s.searchScopeRow}>
                <button className={`${s.scopeBtn} ${searchScope === 'all' ? s.scopeBtnActive : ''}`} onClick={() => setSearchScope('all')}>전체</button>
                <button className={`${s.scopeBtn} ${searchScope === 'tri' ? s.scopeBtnActive : ''}`} onClick={() => setSearchScope('tri')}>3음 코드</button>
                <button className={`${s.scopeBtn} ${searchScope === 'tet' ? s.scopeBtnActive : ''}`} onClick={() => setSearchScope('tet')}>4음 코드</button>
              </div>
            </div>

            {selectedNotes.length > 0 && (
              <button
                className={s.copyBtn}
                style={{ marginTop: 12 }}
                onClick={() => setSelectedNotes([])}
              >
                선택 초기화
              </button>
            )}
          </div>

          {/* Results */}
          {selectedNotes.length < 2 ? (
            <div className={s.emptyHint}>
              <strong>2개 이상의 음을 선택하세요</strong>
              선택한 음들을 포함하는 코드 후보를 찾아드립니다.
            </div>
          ) : matches.length === 0 ? (
            <div className={s.emptyHint}>
              <strong>일치하는 코드를 찾지 못했습니다</strong>
              검색 범위를 변경하거나 음 선택을 조정해보세요.
            </div>
          ) : (
            <div className={s.card}>
              <span className={s.cardLabel}>매칭 결과 ({matches.length}개)</span>
              <div style={{ overflowX: 'auto' }}>
                <table className={s.matchTable}>
                  <thead>
                    <tr>
                      <th>코드명</th>
                      <th>구성음</th>
                      <th style={{ textAlign: 'right' }}>일치율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m, i) => {
                      const full = m.pct >= 0.999
                      return (
                        <tr key={i} className={full ? s.matchRowFull : ''}>
                          <td>
                            <span className={s.matchChord} onClick={() => goToFind(m.root, m.type)}>
                              {m.displayName}
                            </span>
                          </td>
                          <td className={s.matchNotes}>{m.displayNotes.join(', ')}</td>
                          <td className={`${s.matchPct} ${full ? s.matchPctFull : s.matchPctPart}`}>
                            {full
                              ? '100% (완전 일치)'
                              : `${m.matched}/${m.chordPCs.length} (${Math.round(m.pct * 100)}%)`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className={s.note}>
                * 코드명을 클릭하면 "코드 → 구성음" 탭에서 상세하게 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── 탭 3: 다이아토닉 ── */}
      {tab === 'diatonic' && (
        <div className={s.tabContent}>
          {/* Mode + Notation */}
          <div className={s.card}>
            <div className={s.cardLabelRow}>
              <span className={s.cardLabel}>키 선택</span>
              <NotationToggle value={notation} onChange={setNotation} />
            </div>
            <div className={s.modeRow}>
              <button className={`${s.modeBtn} ${diatonicMode === 'major' ? s.modeBtnActive : ''}`} onClick={() => setDiatonicMode('major')}>메이저</button>
              <button className={`${s.modeBtn} ${diatonicMode === 'minor' ? s.modeBtnActive : ''}`} onClick={() => setDiatonicMode('minor')}>마이너 (자연단음계)</button>
            </div>
            <KeyGrid value={diatonicKey} onChange={setDiatonicKey} notation={notation} />
          </div>

          {/* Diatonic table */}
          <div className={s.card}>
            <span className={s.cardLabel}>{displayDiatonicKey} {diatonicMode === 'major' ? '메이저' : '마이너'} 다이아토닉 코드</span>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.diatonicTable}>
                <thead>
                  <tr>
                    <th>도수</th>
                    <th>코드명</th>
                    <th>구성음</th>
                    <th style={{ textAlign: 'right' }}>기능</th>
                  </tr>
                </thead>
                <tbody>
                  {diatonic.map((d, i) => {
                    const rowCls =
                      d.func === 'tonic' ? s.diatonicRowTonic :
                      d.func === 'sub'   ? s.diatonicRowSub :
                                           s.diatonicRowDom
                    const funcCls =
                      d.func === 'tonic' ? s.funcTonic :
                      d.func === 'sub'   ? s.funcSub :
                                           s.funcDom
                    return (
                      <tr
                        key={i}
                        className={`${s.diatonicRow} ${rowCls}`}
                        onClick={() => goToFind(d.root, d.type)}
                      >
                        <td className={s.tdRoman}>{d.degree}</td>
                        <td className={s.tdChord}>{d.name}</td>
                        <td className={s.tdNotes}>{d.notes.join(', ')}</td>
                        <td className={`${s.tdFunc} ${funcCls}`}>{FUNC_LABEL[d.func]}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={s.note}>
              * 행을 클릭하면 "코드 → 구성음" 탭에서 해당 코드를 자세히 볼 수 있습니다.
            </p>
          </div>

          {/* Progressions */}
          <div className={s.card}>
            <span className={s.cardLabel}>자주 쓰이는 코드 진행</span>
            <div className={s.progList}>
              {progressions.map((p, i) => {
                const chords = p.degrees.map(d => diatonic[d])
                return (
                  <div key={i} className={s.progItem}>
                    <div className={s.progHead}>
                      <span className={s.progName}>{p.name}</span>
                      <span className={s.progNick}>{p.nick}</span>
                    </div>
                    <div className={s.progChords}>
                      {chords.map((c, j) => (
                        <span key={j} className={s.progChord}>{c.name}</span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <Link href="/tools/music/capo" className={s.linkBtn}>
              🎸 이 키를 카포로 연주하기 →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────
 * Subcomponents
 * ──────────────────────────────────────────────── */
function NotationToggle({ value, onChange }: { value: Notation; onChange: (v: Notation) => void }) {
  return (
    <div className={s.notationToggle}>
      <button className={`${s.notationBtn} ${value === '#' ? s.notationBtnActive : ''}`} onClick={() => onChange('#')}>♯ 샵</button>
      <button className={`${s.notationBtn} ${value === 'b' ? s.notationBtnActive : ''}`} onClick={() => onChange('b')}>♭ 플랫</button>
    </div>
  )
}

function KeyGrid({ value, onChange, notation }: { value: string; onChange: (v: string) => void; notation: Notation }) {
  const valueIdx = noteToIndex(value)
  return (
    <div className={s.keyGrid}>
      {ALL_ROOTS_SHARP.map((noteSharp, pc) => {
        const sharpName = noteSharp
        const flatName = NOTES_FLAT[pc]
        const isSharp = sharpName.includes('#')
        const display = notation === '#' ? sharpName : flatName
        const sub = isSharp ? (notation === '#' ? `(${flatName})` : `(${sharpName})`) : ''
        const active = pc === valueIdx
        return (
          <button
            key={pc}
            className={`${s.keyBtn} ${isSharp ? s.keyBtnSharp : ''} ${active ? s.keyBtnActive : ''}`}
            onClick={() => onChange(notation === '#' ? sharpName : flatName)}
          >
            <span className={s.keyBtnMain}>{display}</span>
            {sub && <span className={s.keyBtnSub}>{sub}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ────────────────────────────────────────────────
 * 피아노 건반 SVG (2 옥타브, C3~B4)
 * ──────────────────────────────────────────────── */
function PianoKeyboard({ chordPCs, rootPC, notation }: { chordPCs: number[]; rootPC: number; notation: Notation }) {
  const whiteW = 36, whiteH = 100, blackW = 22, blackH = 62
  const whitePCs = [0, 2, 4, 5, 7, 9, 11] // C, D, E, F, G, A, B
  const whiteLabels = notation === '#' ? ['C','D','E','F','G','A','B'] : ['C','D','E','F','G','A','B']
  const blackOffsets = [0, 1, 3, 4, 5] // index in whitePCs after which a black key sits (C, D, F, G, A)
  const blackPCs = [1, 3, 6, 8, 10]
  const blackLabels = notation === '#' ? ['C#','D#','F#','G#','A#'] : ['Db','Eb','Gb','Ab','Bb']

  const octaves = 2
  const totalWhite = whitePCs.length * octaves
  const width = totalWhite * whiteW
  const height = whiteH + 22 // label area below

  const chordSet = new Set(chordPCs)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ display: 'block' }}>
      {/* White keys */}
      {Array.from({ length: octaves }).map((_, oct) =>
        whitePCs.map((pc, i) => {
          const x = (oct * whitePCs.length + i) * whiteW
          const isHighlight = chordSet.has(pc)
          const isRoot = isHighlight && pc === rootPC
          return (
            <g key={`w-${oct}-${i}`}>
              <rect
                x={x + 1} y={0}
                width={whiteW - 2} height={whiteH}
                rx={4}
                fill={isHighlight ? '#C8FF3E' : '#E8E8E8'}
                stroke={isRoot ? '#0D0D0D' : '#888'}
                strokeWidth={isRoot ? 2.5 : 1}
              />
              <text
                x={x + whiteW / 2} y={whiteH - 8}
                textAnchor="middle"
                fontSize="10" fontFamily="Syne, sans-serif" fontWeight="700"
                fill={isHighlight ? '#0D0D0D' : '#666'}
              >
                {whiteLabels[i]}
              </text>
            </g>
          )
        })
      )}

      {/* Black keys */}
      {Array.from({ length: octaves }).map((_, oct) =>
        blackOffsets.map((wi, j) => {
          const pc = blackPCs[j]
          const x = (oct * whitePCs.length + wi + 1) * whiteW - blackW / 2
          const isHighlight = chordSet.has(pc)
          const isRoot = isHighlight && pc === rootPC
          return (
            <g key={`b-${oct}-${j}`}>
              <rect
                x={x} y={0}
                width={blackW} height={blackH}
                rx={3}
                fill={isHighlight ? '#C8FF3E' : '#1a1a1a'}
                stroke={isRoot ? '#0D0D0D' : '#000'}
                strokeWidth={isRoot ? 2.5 : 1}
              />
              {isHighlight && (
                <text
                  x={x + blackW / 2} y={blackH - 6}
                  textAnchor="middle"
                  fontSize="9" fontFamily="Syne, sans-serif" fontWeight="800"
                  fill="#0D0D0D"
                >
                  {blackLabels[j]}
                </text>
              )}
            </g>
          )
        })
      )}

      {/* Octave separator label */}
      <text x={whiteW * whitePCs.length / 2} y={height - 4} textAnchor="middle" fontSize="9" fill="#777" fontFamily="Syne">C3 옥타브</text>
      <text x={whiteW * whitePCs.length * 1.5} y={height - 4} textAnchor="middle" fontSize="9" fill="#777" fontFamily="Syne">C4 옥타브</text>
    </svg>
  )
}
