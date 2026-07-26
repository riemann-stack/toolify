/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './scale.module.css'
import {
  KEYS, SCALES, TUNINGS, CHURCH_MODES, MODE_NAMES, PROGRESSIONS, FUNCTIONAL_SCALES,
  type Accidental, type ScaleId, type Tuning,
  noteName, getScale, buildScale, buildScaleSpelling, buildDiatonicChords,
  noteFreq, intervalColor, COLORS,
} from './scaleUtils'

type Tab = 'scale' | 'guitar' | 'diatonic' | 'modes'

const STORAGE_KEY = 'youtil_scale_v1'

export default function ScaleClient() {
  const [tab, setTab] = useState<Tab>('scale')

  /* 공통 입력 */
  const [rootKey, setRootKey] = useState<number>(0)        // 0 = C
  const [scaleId, setScaleId] = useState<ScaleId>('major')
  const [acc, setAcc] = useState<Accidental>('sharp')
  const [octave, setOctave] = useState(4)
  const [showInterval, setShowInterval] = useState(false)

  /* 탭 2: 기타 */
  const [tuning, setTuning] = useState<Tuning>('standard')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      // 무검증 복원은 getScale(id)! 크래시로 이어짐 — enum·범위 검증 필수
      if (Number.isInteger(j.rootKey) && j.rootKey >= 0 && j.rootKey <= 11) setRootKey(j.rootKey)
      if (SCALES.some((sc) => sc.id === j.scaleId)) setScaleId(j.scaleId)
      if (j.acc === 'sharp' || j.acc === 'flat') setAcc(j.acc)
      if ([3, 4, 5].includes(j.octave)) setOctave(j.octave)
      if (TUNINGS.some((t) => t.id === j.tuning)) setTuning(j.tuning)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rootKey, scaleId, acc, octave, tuning }))
    } catch {}
  }, [rootKey, scaleId, acc, octave, tuning])

  /* AudioContext */
  const audioCtxRef = useRef<AudioContext | null>(null)
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
      const Ctx = W.AudioContext || W.webkitAudioContext
      if (Ctx) audioCtxRef.current = new Ctx()
    }
    return audioCtxRef.current
  }

  /* 예약된 오실레이터 추적 — 재생 버튼 연타 시 이전 예약을 취소해 중첩 방지 */
  const activeNodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([])
  const playEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const stopAll = () => {
    activeNodesRef.current.forEach(({ osc, gain }) => {
      try { osc.stop() } catch {}
      try { osc.disconnect(); gain.disconnect() } catch {}
    })
    activeNodesRef.current = []
    if (playEndTimerRef.current) { clearTimeout(playEndTimerRef.current); playEndTimerRef.current = null }
    setIsPlaying(false)
  }

  /** 한 음 재생 */
  const playNote = (freq: number, when: number, duration = 0.4, vol = 0.15) => {
    const ctx = getAudioCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.connect(gain).connect(ctx.destination)
    gain.gain.setValueAtTime(0, when)
    gain.gain.linearRampToValueAtTime(vol, when + 0.02)
    gain.gain.linearRampToValueAtTime(vol, when + duration - 0.06)
    gain.gain.linearRampToValueAtTime(0, when + duration)
    osc.start(when)
    osc.stop(when + duration + 0.05)
    activeNodesRef.current.push({ osc, gain })
    osc.onended = () => {
      activeNodesRef.current = activeNodesRef.current.filter((n) => n.osc !== osc)
    }
  }

  /** 재생 완료 시점에 상태 리셋 예약 */
  const markPlaying = (totalSec: number) => {
    setIsPlaying(true)
    if (playEndTimerRef.current) clearTimeout(playEndTimerRef.current)
    playEndTimerRef.current = setTimeout(() => setIsPlaying(false), totalSec * 1000)
  }

  /** 시퀀스 재생 (순차) — 재호출 시 이전 예약 취소 */
  const playSequence = (freqs: number[], gap = 0.45) => {
    const ctx = getAudioCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    stopAll()
    const start = ctx.currentTime + 0.05
    freqs.forEach((f, i) => playNote(f, start + i * gap, 0.4, 0.15))
    markPlaying(freqs.length * gap + 0.3)
  }

  /** 코드 재생 (합주) — 재호출 시 이전 예약 취소 */
  const playChord = (freqs: number[], duration = 0.9) => {
    const ctx = getAudioCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    stopAll()
    const start = ctx.currentTime + 0.05
    freqs.forEach((f) => playNote(f, start, duration, 0.10))
  }

  /** 건반 단음 재생 (즉시) */
  const playKeyNote = (noteIdx: number, oct: number) => {
    const ctx = getAudioCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    playNote(noteFreq(noteIdx, oct), ctx.currentTime + 0.02)
  }

  /* 계산 */
  const scale = getScale(scaleId)
  const scaleNotes = useMemo(() => buildScale(rootKey, scale), [rootKey, scale])
  const spelling = useMemo(() => buildScaleSpelling(rootKey, scale, acc), [rootKey, scale, acc])
  const scaleNotesNames = spelling.names
  const diatonics = useMemo(() => buildDiatonicChords(rootKey, scale, acc), [rootKey, scale, acc])
  const isFunctional = FUNCTIONAL_SCALES.includes(scaleId)

  /* 스케일 음 + 옥타브 위 1음 (시퀀스 재생용) */
  const playFreqs = useMemo(() => {
    return scale.intervals.map((iv) => noteFreq((rootKey + iv) % 12, octave + Math.floor((rootKey + iv) / 12)))
      .concat(noteFreq(rootKey, octave + 1))
  }, [scale, rootKey, octave])

  return (
    <div className={s.wrap}>
      {/* 안내 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/art/chord', label: '코드 구성음' },
          { href: '/tools/art/capo', label: '카포 차트' },
          { href: '/tools/art/frequency', label: '음 주파수' }
        ]}
      >
        사용 안내 음악 이론 표기는 학파·교재마다 약간 다를 수 있습니다. 다이어토닉 코드는 <strong>자연 7도 기준</strong>이며, 응용 화성학에서 추가 코드가 가능합니다. 기타 지판은 표준 튜닝(EADGBE) 기본 + 다른 튜닝 옵션.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'scale',    label: '스케일' },
          { id: 'guitar',   label: '기타 지판' },
          { id: 'diatonic', label: '다이어토닉' },
          { id: 'modes',    label: '모드 비교' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            aria-pressed={tab === t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 공통 입력: 키·스케일·표기 */}
      <div className={s.card}>
        <span className={s.cardLabel}>키 · 스케일</span>

        <div className={s.field}>
          <label className={s.fieldLabel}>키 (Root)</label>
          <div className={s.keyRow}>
            {KEYS.map((k) => (
              <button
                key={k.index}
                aria-pressed={rootKey === k.index}
                className={`${s.keyBtn} ${rootKey === k.index ? s.keyBtnActive : ''}`}
                onClick={() => setRootKey(k.index)}
                type="button"
              >
                {acc === 'sharp' ? k.sharp : k.flat}
              </button>
            ))}
          </div>
          <div className={s.pillRow} style={{ marginTop: 8 }}>
            <button aria-pressed={acc === 'sharp'} className={`${s.pill} ${acc === 'sharp' ? s.pillActive : ''}`} onClick={() => setAcc('sharp')} type="button">♯ 샵</button>
            <button aria-pressed={acc === 'flat'} className={`${s.pill} ${acc === 'flat' ? s.pillActive : ''}`} onClick={() => setAcc('flat')} type="button">♭ 플랫</button>
            <button aria-pressed={showInterval} className={`${s.pill} ${showInterval ? s.pillActive : ''}`} onClick={() => setShowInterval(!showInterval)} type="button">
              인터벌 표시
            </button>
          </div>
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>스케일 (12종)</label>
          <div className={s.scaleGrid}>
            {SCALES.map((sc) => (
              <button
                key={sc.id}
                aria-pressed={scaleId === sc.id}
                className={`${s.scaleBtn} ${scaleId === sc.id ? s.scaleBtnActive : ''}`}
                onClick={() => setScaleId(sc.id)}
                type="button"
              >
                <span className={s.scaleEmoji}>{sc.emoji}</span>
                <span className={s.scaleLabel}>{sc.shortName}</span>
                <span className={s.scaleDesc}>{sc.degrees.join('·')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ 탭 1: 스케일 ════════ */}
      {tab === 'scale' && (
        <>
          <div className={s.hero} role="status">
            <p className={s.heroLabel}>{scale.emoji} {spelling.rootName} {scale.label}</p>
            <p className={s.heroValue}>
              {scaleNotesNames.join(' - ')}
            </p>
            <p className={s.heroSub}>
              인터벌 패턴 <strong>{scale.pattern}</strong>
              {' · '}도수 <strong>{scale.degrees.join(' · ')}</strong>
            </p>
            {spelling.respelled && (
              <p className={s.heroSub}>
                {noteName(rootKey, acc)} 표기는 이중임시표(𝄪·𝄫)가 필요한 이론적 조성이라 실용 관행대로 이명동음 <strong>{spelling.rootName}</strong>로 표기합니다.
              </p>
            )}
            <button className={s.playBtn} onClick={() => isPlaying ? stopAll() : playSequence(playFreqs)} type="button">
              {isPlaying ? '■ 정지' : '▶ 순차 재생'}
            </button>
          </div>

          {/* 피아노 SVG */}
          <div className={s.card}>
            <span className={s.cardLabel}>피아노 건반 (기준 옥타브 {octave})</span>
            <PianoSVG
              scaleNotes={scaleNotes}
              scale={scale}
              rootKey={rootKey}
              acc={acc}
              nameByPc={spelling.byPc}
              baseOctave={octave}
              showInterval={showInterval}
              onPlayNote={playKeyNote}
            />
            <div className={s.legend}>
              <span><span className={s.legendDot} style={{ background: COLORS.root }}/>루트 (1)</span>
              <span><span className={s.legendDot} style={{ background: COLORS.third }}/>3·5도</span>
              <span><span className={s.legendDot} style={{ background: COLORS.other }}/>나머지 음</span>
            </div>
          </div>

          {/* 스케일 정보 */}
          <div className={s.card}>
            <span className={s.cardLabel}>스케일 정보</span>
            <div className={s.infoGrid}>
              <div><span>분위기</span><strong>{scale.mood}</strong></div>
              <div><span>주 사용 장르</span><strong>{scale.genre}</strong></div>
              <div><span>대표 곡</span><strong>{scale.examples}</strong></div>
            </div>
            <p className={s.helpText}>{scale.desc}</p>
          </div>

          {/* 옥타브 + 음 인덱스 */}
          <div className={s.card}>
            <span className={s.cardLabel}>옥타브 · 주파수</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>재생 옥타브</label>
              <div className={s.pillRow}>
                {[3, 4, 5].map((o) => (
                  <button
                    key={o}
                    aria-pressed={octave === o}
                    className={`${s.pill} ${octave === o ? s.pillActive : ''}`}
                    onClick={() => setOctave(o)}
                    type="button"
                  >
                    옥타브 {o}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">도수</th>
                    <th scope="col">음</th>
                    <th scope="col">주파수 (Hz)</th>
                  </tr>
                </thead>
                <tbody>
                  {scale.intervals.map((iv, i) => (
                    <tr key={i}>
                      <td className={s.cellMono} style={{ color: intervalColor(iv) }}>{scale.degrees[i]}</td>
                      <td className={s.cellMono}>{scaleNotesNames[i]}</td>
                      <td className={s.cellMono}>{noteFreq((rootKey + iv) % 12, octave + Math.floor((rootKey + iv) / 12)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 기타 지판 ════════ */}
      {tab === 'guitar' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>튜닝</span>
            <div className={s.pillRow}>
              {TUNINGS.map((t) => (
                <button
                  key={t.id}
                  aria-pressed={tuning === t.id}
                  className={`${s.pill} ${tuning === t.id ? s.pillActive : ''}`}
                  onClick={() => setTuning(t.id)}
                  type="button"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>{scale.emoji} {spelling.rootName} {scale.label}</p>
            <p className={s.heroValue}>{scaleNotesNames.join(' - ')}</p>
            <p className={s.heroSub}>{TUNINGS.find((t) => t.id === tuning)!.label}</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>기타 지판 (0~15 프렛)</span>
            <FretboardSVG
              scaleNotes={scaleNotes}
              rootKey={rootKey}
              acc={acc}
              nameByPc={spelling.byPc}
              tuning={tuning}
              showInterval={showInterval}
            />
            <div className={s.legend}>
              <span><span className={s.legendDot} style={{ background: COLORS.root }}/>루트</span>
              <span><span className={s.legendDot} style={{ background: COLORS.third }}/>3·5도</span>
              <span><span className={s.legendDot} style={{ background: COLORS.other }}/>나머지</span>
            </div>
            <p className={s.helpText}>모바일에서는 좌우로 스크롤하여 전체 지판을 확인하세요.</p>
          </div>

          <div className={s.warnCard}>
            <strong>기타 1박스 운지법</strong>
            <p>
              한 박스(5프렛 범위) 안의 모든 스케일 음을 한 손 모양으로 익히는 것이 즉흥 연주의 시작.<br />
              • <strong>1박스 (5포지션)</strong>: minor pentatonic의 가장 흔한 박스<br />
              • Minor Pentatonic A → 5프렛부터 시작<br />
              • 박스를 외운 후 다른 박스로 확장<br />
              • 루트(빨강) 위치를 우선 익히면 키 변경 쉬움
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 다이어토닉 ════════ */}
      {tab === 'diatonic' && (
        <>
          {diatonics.length === 0 ? (
            <div className={s.warnCard}>
              <strong>ℹ️ 다이어토닉 코드 없음</strong>
              <p>
                Pentatonic·Blues 같은 5·6음 스케일은 자연 7화음을 만들기 어렵습니다.<br />
                Major·Minor·모드 7음 스케일을 선택하세요.
              </p>
            </div>
          ) : (
            <>
              <div className={s.hero}>
                <p className={s.heroLabel}>{spelling.rootName} {scale.label} 다이어토닉</p>
                <p className={s.heroValue}>
                  {diatonics.map((d) => d.name).join(' · ')}
                </p>
                <p className={s.heroSub}>스케일 안의 자연 7화음 (3-5-7도 쌓아 올림)</p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>7화음 상세</span>
                <div className={s.chordGrid}>
                  {diatonics.map((c, i) => (
                    <button
                      key={i}
                      className={s.chordCard}
                      style={{ borderTopColor: c.color }}
                      onClick={() => {
                        const freqs = c.notes.map((n, j) => noteFreq(n % 12, octave + (j > 0 && n < c.notes[0] ? 1 : 0)))
                        playChord(freqs)
                      }}
                      type="button"
                    >
                      <p className={s.chordDegree} style={{ color: c.color }}>{c.degree}</p>
                      <p className={s.chordName}>{c.name}</p>
                      <p className={s.chordNotes}>{c.notesNames.join(' · ')}</p>
                      <p className={s.chordFn}>{c.function ?? '모달'}</p>
                      <span className={s.chordPlay}>▶ 재생</span>
                    </button>
                  ))}
                </div>
                {!isFunctional && (
                  <p className={s.helpText}>
                    Tonic·Subdominant·Dominant 기능 분류는 장·단조 화성학 기준이라 교회 모드에는 적용하지 않습니다.
                    모드에서는 도수·화음 품질(로마숫자)로 파악하세요.
                  </p>
                )}
              </div>

              {/* 진행 추천 */}
              <div className={s.card}>
                <span className={s.cardLabel}>추천 코드 진행 4종</span>
                <p className={s.helpText} style={{ marginTop: 0 }}>
                  진행 이름은 장·단조 기준 통칭이며, 현재 선택한 스케일의 다이어토닉 코드로 해당 도수를 연주합니다.
                  모드·하모닉 계열에서는 원곡 분위기와 다르게 들릴 수 있습니다.
                </p>
                <div className={s.progGrid}>
                  {PROGRESSIONS.map((p) => {
                    const validIdx = p.pattern.filter((i) => i < diatonics.length)
                    const chords = validIdx.map((i) => diatonics[i])
                    const playProg = () => {
                      const ctx = getAudioCtx()
                      if (!ctx) return
                      if (ctx.state === 'suspended') ctx.resume()
                      const start = ctx.currentTime + 0.05
                      chords.forEach((c, ci) => {
                        const freqs = c.notes.map((n, j) => noteFreq(n % 12, octave + (j > 0 && n < c.notes[0] ? 1 : 0)))
                        freqs.forEach((f) => playNote(f, start + ci * 1.0, 0.95, 0.10))
                      })
                    }
                    /* 진행 이름·예시 곡은 홈 조성(장/단)에서만 그대로 통용 — 그 외 스케일은 도수 적용 예시로 표시 */
                    const atHome = p.home === 'major'
                      ? scaleId === 'major'
                      : ['natminor', 'harmonic', 'melodic'].includes(scaleId)
                    return (
                      <div key={p.id} className={s.progCard}>
                        <p className={s.progTitle}>{p.emoji} {p.label}</p>
                        <p className={s.progChords}>{chords.map((c) => c.name).join(' → ')}</p>
                        <p className={s.progDesc}>{p.desc}</p>
                        {atHome ? (
                          <p className={s.progEx}>예: {p.examples}</p>
                        ) : (
                          <p className={s.progEx}>현재 스케일 도수 적용: {chords.map((c) => c.degree).join('-')} — 원곡 분위기와 다르게 들릴 수 있어요.</p>
                        )}
                        <button className={s.playBtnSm} onClick={playProg} type="button">▶ 진행 재생</button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ════════ 탭 4: 모드 비교 ════════ */}
      {tab === 'modes' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>같은 루트 ({noteName(rootKey, acc)}) 기준 7 교회 모드 — 평행 모드 비교</p>
            <p className={s.heroValue}>모드별 분위기 비교</p>
            <p className={s.heroSub}>루트를 고정하고 음 집합을 바꿔, 모드별 색채 차이를 직접 들어보는 배치입니다</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>7 모드 한눈에</span>
            <div className={s.modeList}>
              {CHURCH_MODES.map((mid) => {
                const m = getScale(mid)
                const notes = buildScaleSpelling(rootKey, m, acc).names
                const freqs = m.intervals.map((iv) => noteFreq((rootKey + iv) % 12, octave + Math.floor((rootKey + iv) / 12)))
                  .concat(noteFreq(rootKey, octave + 1))
                const isCurrent = scaleId === mid
                return (
                  <div key={mid} className={`${s.modeRow} ${isCurrent ? s.modeRowActive : ''}`}>
                    <div className={s.modeHead}>
                      <span className={s.modeEmoji}>{m.emoji}</span>
                      <strong>{MODE_NAMES[mid]}</strong>
                      <button className={s.playBtnSm} onClick={() => playSequence(freqs, 0.35)} type="button">▶</button>
                    </div>
                    <p className={s.modeNotes}>{notes.join(' - ')}</p>
                    <p className={s.modeMood}>{m.mood} · {m.genre}</p>
                    <p className={s.modeEx}>{m.examples}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>교회 모드 (Church Modes) — 상대 모드 vs 평행 모드</strong>
            <p>
              교회 모드는 메이저 스케일을 각 음에서 시작한 7가지 변형입니다.<br />
              • <strong>상대 모드</strong>: C Ionian · D Dorian · E Phrygian처럼 <strong>같은 음 집합</strong>을 시작음만 바꿔 쓰는 관계<br />
              • <strong>평행 모드</strong>: C Ionian · C Dorian · C Phrygian처럼 <strong>루트를 고정</strong>하고 음 집합을 바꾸는 관계<br />
              • Ionian (1도) · Dorian (2도) · Phrygian (3도) · Lydian (4도) · Mixolydian (5도) · Aeolian (6도, = Natural Minor) · Locrian (7도)<br />
              위 비교표는 <strong>평행 모드</strong> 배치입니다 — 루트가 같아야 모드별 색채 차이가 귀에 직접 들리기 때문이에요.
            </p>
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/art/chord" className={s.crossLink}>
        코드 구성음 계산기 → 스케일 안의 코드를 자세히 분석
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PianoSVG — 1.5 옥타브 (C ~ G of next octave)
   ───────────────────────────────────────────── */
interface PianoProps {
  scaleNotes: number[]
  scale: { intervals: number[]; degrees: string[] }
  rootKey: number
  acc: Accidental
  nameByPc: Record<number, string>   // 스케일 음은 레터워크 철자로 라벨 (F♯ 장조의 F 건반 = E♯)
  baseOctave: number                 // 첫 건반 옥타브 = 선택한 재생 옥타브
  showInterval: boolean
  onPlayNote: (noteIdx: number, octave: number) => void
}

function PianoSVG({ scaleNotes, scale, rootKey, acc, nameByPc, baseOctave, showInterval, onPlayNote }: PianoProps) {
  // 18 흰 건반(2.5옥타브 정도 = 너무 큼) → 13 흰 건반 (약 1.85 옥타브)
  // 흰 건반 (C D E F G A B) 인덱스: 0 2 4 5 7 9 11
  const whiteIdx = [0, 2, 4, 5, 7, 9, 11]
  // 검은 건반 (C♯ D♯ F♯ G♯ A♯) 인덱스: 1 3 6 8 10
  const blackIdx = [1, 3, 6, 8, 10]
  // 검은 건반의 흰 건반 사이 위치 (왼쪽 흰 건반의 인덱스)
  const blackPos: Record<number, number> = { 1: 0, 3: 1, 6: 3, 8: 4, 10: 5 }

  const whiteW = 36
  const whiteH = 140
  const blackW = 22
  const blackH = 88

  // 13 흰 건반 (약 1.85옥타브: C4~F5)
  const totalWhites = 13
  const totalW = totalWhites * whiteW

  /* 인터벌 (0~11 → 도수 표시) */
  const intervalMap: Record<number, string> = {}
  scale.intervals.forEach((iv, i) => {
    intervalMap[(rootKey + iv) % 12] = scale.degrees[i]
  })

  /** 흰 건반 그리기 */
  const whiteKeys: React.ReactElement[] = []
  for (let w = 0; w < totalWhites; w++) {
    const octaveOffset = Math.floor(w / 7)
    const within = w % 7
    const noteIdx = whiteIdx[within]
    const isInScale = scaleNotes.includes(noteIdx)
    const isRoot = noteIdx === rootKey
    const intervalFromRoot = ((noteIdx - rootKey) + 12) % 12
    const fill = isRoot
      ? COLORS.root
      : isInScale
        ? (intervalFromRoot === 4 || intervalFromRoot === 3 || intervalFromRoot === 7 || intervalFromRoot === 6 ? COLORS.third : COLORS.other)
        : 'white'
    const textColor = isInScale ? '#0D0D0D' : '#666'

    whiteKeys.push(
      <g key={`w-${w}`} onClick={() => onPlayNote(noteIdx, baseOctave + octaveOffset)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlayNote(noteIdx, baseOctave + octaveOffset) } }}
        role="button" aria-label={`${noteName(noteIdx, acc)}${baseOctave + octaveOffset} 재생`} tabIndex={0}
        style={{ cursor: 'pointer' }}>
        <rect
          x={w * whiteW}
          y={0}
          width={whiteW - 1}
          height={whiteH}
          fill={fill}
          stroke="#000"
          strokeWidth="0.5"
        />
        <text
          x={w * whiteW + whiteW / 2}
          y={whiteH - 12}
          fill={textColor}
          fontSize="11"
          textAnchor="middle"
          fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
          fontWeight={isInScale ? 800 : 500}
        >
          {showInterval && isInScale ? intervalMap[noteIdx] : (isInScale ? nameByPc[noteIdx] ?? noteName(noteIdx, acc) : noteName(noteIdx, acc))}
        </text>
      </g>,
    )
  }

  /** 검은 건반 그리기 */
  const blackKeys: React.ReactElement[] = []
  for (let w = 0; w < totalWhites; w++) {
    const within = w % 7
    blackIdx.forEach((bIdx) => {
      if (blackPos[bIdx] === within) {
        const isInScale = scaleNotes.includes(bIdx)
        const isRoot = bIdx === rootKey
        const intervalFromRoot = ((bIdx - rootKey) + 12) % 12
        const fill = isRoot
          ? COLORS.root
          : isInScale
            ? (intervalFromRoot === 4 || intervalFromRoot === 3 || intervalFromRoot === 7 || intervalFromRoot === 6 ? COLORS.third : COLORS.other)
            : '#1a1a1a'
        const textColor = isInScale ? '#0D0D0D' : '#aaa'
        const xCenter = (w + 1) * whiteW
        const xLeft = xCenter - blackW / 2
        const octaveOffset = Math.floor(w / 7)

        blackKeys.push(
          <g key={`b-${w}-${bIdx}`} onClick={() => onPlayNote(bIdx, baseOctave + octaveOffset)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlayNote(bIdx, baseOctave + octaveOffset) } }}
            role="button" aria-label={`${noteName(bIdx, acc)}${baseOctave + octaveOffset} 재생`} tabIndex={0}
            style={{ cursor: 'pointer' }}>
            <rect
              x={xLeft}
              y={0}
              width={blackW}
              height={blackH}
              fill={fill}
              stroke="#000"
              strokeWidth="0.5"
            />
            <text
              x={xLeft + blackW / 2}
              y={blackH - 8}
              fill={textColor}
              fontSize="9"
              textAnchor="middle"
              fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
              fontWeight={isInScale ? 800 : 500}
            >
              {showInterval && isInScale ? intervalMap[bIdx] : (isInScale ? nameByPc[bIdx] ?? noteName(bIdx, acc) : noteName(bIdx, acc))}
            </text>
          </g>,
        )
      }
    })
  }

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 0' }}>
      <svg width={totalW} height={whiteH} viewBox={`0 0 ${totalW} ${whiteH}`} style={{ minWidth: totalW }}>
        {whiteKeys}
        {blackKeys}
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FretboardSVG — 6줄 × 0~15 프렛
   ───────────────────────────────────────────── */
interface FretProps {
  scaleNotes: number[]
  rootKey: number
  acc: Accidental
  nameByPc: Record<number, string>
  tuning: Tuning
  showInterval: boolean
}

function FretboardSVG({ scaleNotes, rootKey, acc, nameByPc, tuning, showInterval }: FretProps) {
  const tuningMeta = TUNINGS.find((t) => t.id === tuning)!
  // 표준 지판 다이어그램 관행: 위 = 1번줄(높은 E, 가늘게) → 아래 = 6번줄(낮은 E, 굵게)
  const stringNotes = [...tuningMeta.strings].reverse()  // index 0 = 1번줄(높은 음)
  const numFrets = 15
  const fretW = 50
  const stringSpacing = 26
  const padLeft = 30
  const padRight = 10
  const padTop = 22
  const padBottom = 30
  const totalW = padLeft + fretW * numFrets + padRight
  const totalH = padTop + stringSpacing * 6 + padBottom

  /* 인터벌 */
  const intervalLabel: Record<number, string> = {}
  const degrees = ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7']
  for (let i = 0; i < 12; i++) {
    intervalLabel[(rootKey + i) % 12] = degrees[i]
  }

  /* 마커 (3·5·7·9·12·15) */
  const fretMarkers = [3, 5, 7, 9, 12, 15]

  return (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 0' }}>
      <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`} style={{ minWidth: 720 }} role="img" aria-label="기타 지판 스케일 위치 표시">
        {/* 배경 */}
        <rect x={padLeft} y={padTop - 4} width={fretW * numFrets} height={stringSpacing * 6 + 8} fill="rgba(123, 79, 44, 0.15)" />

        {/* 너트 */}
        <rect x={padLeft - 3} y={padTop - 4} width={4} height={stringSpacing * 6 + 8} fill="#fff" />

        {/* 프렛 */}
        {Array.from({ length: numFrets }).map((_, i) => (
          <line
            key={`f-${i}`}
            x1={padLeft + (i + 1) * fretW}
            y1={padTop - 4}
            x2={padLeft + (i + 1) * fretW}
            y2={padTop + stringSpacing * 6 + 4}
            stroke="#888"
            strokeWidth="1.2"
          />
        ))}

        {/* 프렛 마커 (가운데 점) */}
        {fretMarkers.map((m) => {
          const cx = padLeft + (m - 0.5) * fretW
          const cy = padTop + stringSpacing * 3
          if (m === 12) {
            return (
              <g key={`m-${m}`}>
                <circle cx={cx} cy={cy - stringSpacing * 1.5} r={5} fill="#666" />
                <circle cx={cx} cy={cy + stringSpacing * 1.5} r={5} fill="#666" />
              </g>
            )
          }
          return <circle key={`m-${m}`} cx={cx} cy={cy} r={5} fill="#666" />
        })}

        {/* 줄 + 음 마커 */}
        {stringNotes.map((openNote, sIdx) => {
          const y = padTop + sIdx * stringSpacing + stringSpacing / 2
          const elements = []
          // 줄
          elements.push(
            <line
              key={`s-${sIdx}`}
              x1={padLeft - 4}
              y1={y}
              x2={padLeft + fretW * numFrets}
              y2={y}
              stroke="#ccc"
              strokeWidth={sIdx >= 3 ? 2 : 1.2}
            />,
          )
          // 각 프렛 마커
          for (let f = 0; f <= numFrets; f++) {
            const noteIdx = (openNote + f) % 12
            if (!scaleNotes.includes(noteIdx)) continue
            const isRoot = noteIdx === rootKey
            const intervalFromRoot = ((noteIdx - rootKey) + 12) % 12
            const fill = isRoot
              ? COLORS.root
              : (intervalFromRoot === 4 || intervalFromRoot === 3 || intervalFromRoot === 7 || intervalFromRoot === 6 ? COLORS.third : COLORS.other)
            const cx = f === 0 ? padLeft - 14 : padLeft + (f - 0.5) * fretW
            const r = 11
            elements.push(
              <g key={`n-${sIdx}-${f}`}>
                <circle cx={cx} cy={y} r={r} fill={fill} stroke="#000" strokeWidth="0.5" />
                <text
                  x={cx}
                  y={y + 3.5}
                  fill="#0D0D0D"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
                  fontWeight="800"
                >
                  {showInterval ? intervalLabel[noteIdx] : nameByPc[noteIdx] ?? noteName(noteIdx, acc)}
                </text>
              </g>,
            )
          }
          return <g key={`g-${sIdx}`}>{elements}</g>
        })}

        {/* 프렛 번호 (하단) */}
        {Array.from({ length: numFrets + 1 }).map((_, f) => (
          <text
            key={`fn-${f}`}
            x={f === 0 ? padLeft - 14 : padLeft + (f - 0.5) * fretW}
            y={padTop + stringSpacing * 6 + 16}
            fill="var(--muted)"
            fontSize="10"
            textAnchor="middle"
            fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
          >
            {f}
          </text>
        ))}

        {/* 줄 이름 (왼쪽) */}
        {stringNotes.map((openNote, sIdx) => (
          <text
            key={`sl-${sIdx}`}
            x={padLeft - 22}
            y={padTop + sIdx * stringSpacing + stringSpacing / 2 + 3}
            fill="var(--muted)"
            fontSize="10"
            textAnchor="middle"
            fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
            fontWeight="700"
          >
            {noteName(openNote, acc)}
          </text>
        ))}
      </svg>
    </div>
  )
}
