'use client'

import Disclaimer from '@/components/Disclaimer'
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './vocal-range.module.css'
import {
  VocalAnalyzer, PitchSample,
  detectStableNotes, calcRangeStats,
} from './pitchAnalyzer'
import { midiToNote, midiCents, NOTE_NAMES } from './noteUtils'
import {
  VOCAL_RANGES, classifyVocalRange, matchSongs,
} from './vocalData'

type Tab = 'live' | 'measure' | 'result' | 'log'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'live',    name: '실시간',     icon: '🎤' },
  { id: 'measure', name: '음역 측정',   icon: '🎯' },
  { id: 'result',  name: '결과·노래',   icon: '⭐' },
  { id: 'log',     name: '측정 기록',   icon: '📊' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  live:    styles.tabActive,
  measure: styles.tabActiveMeasure,
  result:  styles.tabActiveResult,
  log:     styles.tabActiveLog,
}

interface MeasureRecord {
  id: string
  date: string
  lowestMidi: number
  highestMidi: number
  rangeSemitones: number
  classId: string
}

const STORAGE_KEY = 'youtil_vocal_range_v1'

function loadHistory(): MeasureRecord[] {
  if (typeof window === 'undefined') return []
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
}
function saveHistory(items: MeasureRecord[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30))) } catch { /* */ }
}

export default function VocalRangeClient() {
  const [tab, setTab] = useState<Tab>('live')
  const analyzerRef = useRef<VocalAnalyzer | null>(null)

  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSample, setCurrentSample] = useState<PitchSample | null>(null)
  const [volume, setVolume] = useState(0)
  const [samples, setSamples] = useState<PitchSample[]>([])

  // 측정 단계 — manual lowest / highest 기록
  const [measuredLowMidi, setMeasuredLowMidi] = useState<number | null>(null)
  const [measuredHighMidi, setMeasuredHighMidi] = useState<number | null>(null)
  const [falsettoHighMidi, setFalsettoHighMidi] = useState<number | null>(null)
  const [measureStep, setMeasureStep] = useState<'idle' | 'low' | 'high' | 'falsetto' | 'done'>('idle')

  const [history, setHistory] = useState<MeasureRecord[]>([])
  useEffect(() => { setHistory(loadHistory()) }, [])

  const startAnalyzer = async () => {
    setError(null)
    if (analyzerRef.current) analyzerRef.current.stop()
    const a = new VocalAnalyzer()
    analyzerRef.current = a
    try {
      await a.start({
        onSample: s => {
          setCurrentSample(s)
          setSamples(prev => {
            const next = [...prev, s]
            return next.length > 600 ? next.slice(-600) : next
          })
        },
        onVolume: setVolume,
        onStatusChange: (status, err) => {
          if (status === 'running') setRunning(true)
          if (status === 'stopped') setRunning(false)
          if (status === 'error') { setRunning(false); setError(err ?? '알 수 없는 오류') }
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : '마이크 접근 실패'
      setError(`${msg} — 브라우저 설정에서 마이크 권한을 허용하고 다시 시도하세요.`)
    }
  }

  const stopAnalyzer = () => {
    if (analyzerRef.current) {
      analyzerRef.current.stop()
      analyzerRef.current = null
    }
    setRunning(false)
    setCurrentSample(null)
    setVolume(0)
  }

  useEffect(() => () => { if (analyzerRef.current) analyzerRef.current.stop() }, [])

  /* 안정 음 감지 (실시간) */
  const stableNotes = useMemo(() => detectStableNotes(samples), [samples])

  /* 측정 진행 — 단계별 자동 갱신 */
  useEffect(() => {
    if (!running || measureStep === 'idle' || measureStep === 'done') return
    const recent = stableNotes.slice(-1)[0]
    if (!recent) return

    if (measureStep === 'low') {
      if (measuredLowMidi === null || recent.noteRoundedMidi < measuredLowMidi) {
        setMeasuredLowMidi(recent.noteRoundedMidi)
      }
    } else if (measureStep === 'high') {
      if (measuredHighMidi === null || recent.noteRoundedMidi > measuredHighMidi) {
        setMeasuredHighMidi(recent.noteRoundedMidi)
      }
    } else if (measureStep === 'falsetto') {
      if (falsettoHighMidi === null || recent.noteRoundedMidi > falsettoHighMidi) {
        setFalsettoHighMidi(recent.noteRoundedMidi)
      }
    }
  }, [stableNotes, measureStep, running, measuredLowMidi, measuredHighMidi, falsettoHighMidi])

  /* 결과 */
  const stats = useMemo(() => {
    if (measuredLowMidi !== null && measuredHighMidi !== null) {
      return {
        lowestMidi: measuredLowMidi,
        highestMidi: measuredHighMidi,
        rangeSemitones: measuredHighMidi - measuredLowMidi,
        octaves: Math.round(((measuredHighMidi - measuredLowMidi) / 12) * 10) / 10,
        noteCount: 0,
      }
    }
    return calcRangeStats(stableNotes)
  }, [measuredLowMidi, measuredHighMidi, stableNotes])

  const classification = useMemo(
    () => stats ? classifyVocalRange(stats.lowestMidi, stats.highestMidi) : null,
    [stats],
  )

  const songMatches = useMemo(
    () => stats ? matchSongs(stats.lowestMidi, stats.highestMidi) : [],
    [stats],
  )

  /* 저장 */
  const [saved, setSaved] = useState(false)
  const handleSave = () => {
    if (!stats || !classification) return
    const item: MeasureRecord = {
      id: Date.now().toString(36),
      date: new Date().toISOString(),
      lowestMidi: stats.lowestMidi,
      highestMidi: stats.highestMidi,
      rangeSemitones: stats.rangeSemitones,
      classId: classification.id,
    }
    const next = [item, ...history].slice(0, 30)
    setHistory(next); saveHistory(next)
    setSaved(true); setTimeout(() => setSaved(false), 1500)
  }
  const removeRecord = (id: string) => {
    const next = history.filter(h => h.id !== id)
    setHistory(next); saveHistory(next)
  }
  const clearHistory = () => {
    if (!confirm('모든 측정 기록을 삭제할까요?')) return
    setHistory([]); saveHistory([])
  }

  /* 복사 */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* */ }
  }

  /* 피치 그래프 좌표 */
  const chartData = useMemo(() => {
    if (samples.length < 2) return null
    const W = 600, H = 160, pad = { l: 30, r: 8, t: 8, b: 18 }
    const recent = samples.slice(-300)
    const minMidi = Math.min(...recent.map(s => s.midi)) - 1
    const maxMidi = Math.max(...recent.map(s => s.midi)) + 1
    const xScale = (i: number) => pad.l + ((W - pad.l - pad.r) * i) / Math.max(1, recent.length - 1)
    const yScale = (m: number) => pad.t + ((H - pad.t - pad.b) * (maxMidi - m)) / Math.max(0.1, maxMidi - minMidi)
    const points = recent.map((s, i) => `${xScale(i).toFixed(1)},${yScale(s.midi).toFixed(1)}`).join(' ')
    return { W, H, pad, points, minMidi, maxMidi, count: recent.length }
  }, [samples])

  const noteInfo = currentSample ? midiToNote(currentSample.midi) : null
  const cents = currentSample ? midiCents(currentSample.midi) : 0

  const lowNote = stats ? midiToNote(stats.lowestMidi) : null
  const highNote = stats ? midiToNote(stats.highestMidi) : null
  const falsettoNote = falsettoHighMidi !== null ? midiToNote(falsettoHighMidi) : null

  /* 피아노 건반 — C2~C7 (5옥타브) */
  const pianoKeys = useMemo(() => {
    const start = 36 // C2
    const end = 96 // C7
    const keys: { midi: number; isBlack: boolean; label: string }[] = []
    for (let m = start; m <= end; m++) {
      const idx = m % 12
      const isBlack = [1, 3, 6, 8, 10].includes(idx)
      const noteName = NOTE_NAMES[idx]
      const oct = Math.floor(m / 12) - 1
      keys.push({ midi: m, isBlack, label: idx === 0 ? `${noteName}${oct}` : '' })
    }
    return keys
  }, [])

  /* ──────────────────── 렌더 ──────────────────── */
  return (
    <div className={styles.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/art/color', label: '색상 변환' },
          { href: '/tools/art/gradient-generator', label: '그라디언트' },
          { href: '/tools/art/golden-ratio', label: '황금 비율' }
        ]}
      >
        참고용·재미용 도구
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* 마이크 컨트롤 */}
      {!running ? (
        <button className={styles.startBtn} onClick={startAnalyzer}>
          🎤 마이크 시작 — 권한 허용 후 음정 감지
        </button>
      ) : (
        <button className={styles.stopBtn} onClick={stopAnalyzer}>
          ⏸️ 정지 — 마이크 권한 종료
        </button>
      )}

      {error && (
        <div className={styles.warnBox}>
          ⚠️ <strong>마이크 오류</strong> — {error}
          <br />브라우저 주소창의 자물쇠 아이콘에서 마이크 권한을 확인하거나, HTTPS 환경에서 접속해주세요.
        </div>
      )}

      {/* ─── 탭 1: 실시간 ─── */}
      {tab === 'live' && (
        <>
          <div className={`${styles.noteCard} ${!currentSample ? styles.noteCardIdle : ''}`}>
            <div className={styles.noteName}>
              {noteInfo ? noteInfo.name : '—'}
            </div>
            {noteInfo && <div className={styles.noteKorean}>{noteInfo.korean}</div>}
            {currentSample && (
              <>
                <div className={styles.noteFreq}>{currentSample.frequency.toFixed(1)} Hz</div>
                <div className={`${styles.noteCents} ${Math.abs(cents) <= 5 ? styles.centsAccurate : ''}`}>
                  {cents > 0 ? `+${cents}` : cents} cents
                  {Math.abs(cents) <= 5 ? ' · 정확' : Math.abs(cents) <= 20 ? ' · 가까움' : ' · 흔들림'}
                </div>
              </>
            )}
            {!currentSample && running && (
              <div className={styles.noteKorean}>마이크에 &lsquo;아—&rsquo; 음을 길게 내보세요</div>
            )}
            {!running && (
              <div className={styles.noteKorean}>위 버튼을 눌러 마이크를 시작하세요</div>
            )}

            {/* 볼륨 */}
            <div className={styles.volumeWrap}>
              <div className={styles.volumeBar}>
                <div className={styles.volumeFill} style={{ width: `${Math.min(100, volume * 1000)}%` }} />
              </div>
              <div className={styles.volumeLabel}>
                {volume < 0.01 ? '⚠️ 소리가 너무 작습니다 — 더 가까이' : volume < 0.05 ? '🔈 보통' : '🔊 충분'}
              </div>
            </div>
          </div>

          {/* 피치 그래프 */}
          {chartData && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>최근 음정 흐름 (300프레임)</label>
              <div className={styles.chartWrap}>
                <svg viewBox={`0 0 ${chartData.W} ${chartData.H}`} className={styles.chartSvg} preserveAspectRatio="none">
                  <line x1={chartData.pad.l} y1={chartData.H - chartData.pad.b} x2={chartData.W - chartData.pad.r} y2={chartData.H - chartData.pad.b}
                    stroke="var(--border)" strokeWidth="1" />
                  <text x={4} y={chartData.pad.t + 8} className={styles.chartAxis}>
                    {midiToNote(Math.round(chartData.maxMidi)).name}
                  </text>
                  <text x={4} y={chartData.H - chartData.pad.b - 4} className={styles.chartAxis}>
                    {midiToNote(Math.round(chartData.minMidi)).name}
                  </text>
                  <polyline points={chartData.points} fill="none"
                    stroke="#9333EA" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          )}

          {/* 안정 음 리스트 */}
          {stableNotes.length > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>
                안정 음 ({stableNotes.length}건)
                <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>0.5초+ 유지</span>
              </label>
              <div className={styles.stableList}>
                {[...stableNotes].reverse().slice(0, 12).map((n, i) => {
                  const info = midiToNote(n.noteRoundedMidi)
                  return (
                    <div key={i} className={styles.stableRow}>
                      <span className={styles.stableNote}>
                        {info.name}
                        <small>{info.korean} · {n.avgFreq.toFixed(1)}Hz</small>
                      </span>
                      <span className={styles.stableDuration}>{(n.durationMs / 1000).toFixed(1)}초</span>
                      <span className={styles.stableClarity}>{Math.round(n.avgClarity * 100)}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className={styles.guideBox}>
            💡 <strong>측정 가이드</strong>
            <ul>
              <li>조용한 환경 (반주·말소리 X)</li>
              <li>마이크 가까이 (15cm 이내)</li>
              <li>&lsquo;아&rsquo; 또는 &lsquo;오&rsquo; 모음으로 길게 (3초+) 안정적으로</li>
              <li>비브라토·떨림 없이 평탄하게</li>
            </ul>
          </div>
        </>
      )}

      {/* ─── 탭 2: 측정 ─── */}
      {tab === 'measure' && (
        <>
          <div className={styles.disclaimer}>
            🎯 <strong>3단계 음역 측정</strong> — 최저음 → 최고음(진성) → 가성 최고음(선택). 각 단계에서 안정적으로 0.5초 이상 유지된 음만 자동 기록됩니다.
          </div>

          {/* 1단계 */}
          <div className={`${styles.stepCard} ${measureStep === 'low' ? styles.stepCardActive : measuredLowMidi !== null ? styles.stepCardDone : ''}`}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>1단계</span>
              <span className={`${styles.stepStatus} ${measureStep === 'low' ? styles.stepStatusActive : measuredLowMidi !== null ? styles.stepStatusDone : ''}`}>
                {measureStep === 'low' ? '진행 중' : measuredLowMidi !== null ? '완료' : '대기'}
              </span>
            </div>
            <div className={styles.stepTitle}>최저음 측정</div>
            <div className={styles.stepDesc}>점점 낮게 &lsquo;아—&rsquo;를 5번 반복. 편한 가장 낮은 음에서 5초간 유지하세요.</div>
            {measuredLowMidi !== null && (
              <div className={styles.stepValue}>
                <span className={styles.stepValueLabel}>현재 최저</span>
                <span className={styles.stepValueNote} style={{ color: '#059669' }}>
                  {midiToNote(measuredLowMidi).name} ({midiToNote(measuredLowMidi).korean})
                </span>
              </div>
            )}
            <button className={styles.copyBtn}
              onClick={() => {
                if (!running) startAnalyzer()
                setMeasureStep('low')
              }}
              disabled={measureStep === 'low'}>
              {measureStep === 'low' ? '측정 중...' : measuredLowMidi !== null ? '🔄 다시 측정' : '▶ 시작'}
            </button>
            {measureStep === 'low' && (
              <button className={styles.copyBtn} style={{ marginTop: 5 }}
                onClick={() => setMeasureStep('idle')}>
                ✓ 1단계 완료
              </button>
            )}
          </div>

          {/* 2단계 */}
          <div className={`${styles.stepCard} ${measureStep === 'high' ? styles.stepCardActive : measuredHighMidi !== null ? styles.stepCardDone : ''}`}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>2단계 — 진성 최고음</span>
              <span className={`${styles.stepStatus} ${measureStep === 'high' ? styles.stepStatusActive : measuredHighMidi !== null ? styles.stepStatusDone : ''}`}>
                {measureStep === 'high' ? '진행 중' : measuredHighMidi !== null ? '완료' : '대기'}
              </span>
            </div>
            <div className={styles.stepTitle}>진성 최고음 측정</div>
            <div className={styles.stepDesc}>점점 높게 &lsquo;아—&rsquo;를 5번 반복. 삑사리 나기 직전 안정 가능한 가장 높은 음.</div>
            {measuredHighMidi !== null && (
              <div className={styles.stepValue}>
                <span className={styles.stepValueLabel}>현재 최고 (진성)</span>
                <span className={styles.stepValueNote}>
                  {midiToNote(measuredHighMidi).name} ({midiToNote(measuredHighMidi).korean})
                </span>
              </div>
            )}
            <button className={styles.copyBtn}
              onClick={() => {
                if (!running) startAnalyzer()
                setMeasureStep('high')
              }}
              disabled={measureStep === 'high'}>
              {measureStep === 'high' ? '측정 중...' : measuredHighMidi !== null ? '🔄 다시 측정' : '▶ 시작'}
            </button>
            {measureStep === 'high' && (
              <button className={styles.copyBtn} style={{ marginTop: 5 }}
                onClick={() => setMeasureStep('idle')}>
                ✓ 2단계 완료
              </button>
            )}
          </div>

          {/* 3단계 (선택) */}
          <div className={`${styles.stepCard} ${measureStep === 'falsetto' ? styles.stepCardActive : falsettoHighMidi !== null ? styles.stepCardDone : ''}`}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNum}>3단계 — 가성 (선택)</span>
              <span className={`${styles.stepStatus} ${measureStep === 'falsetto' ? styles.stepStatusActive : falsettoHighMidi !== null ? styles.stepStatusDone : ''}`}>
                {measureStep === 'falsetto' ? '진행 중' : falsettoHighMidi !== null ? '완료' : '대기'}
              </span>
            </div>
            <div className={styles.stepTitle}>가성 최고음 측정</div>
            <div className={styles.stepDesc}>가성으로 가장 높은 음을 길게 내보세요. 무리하지 마세요.</div>
            {falsettoHighMidi !== null && (
              <div className={styles.stepValue}>
                <span className={styles.stepValueLabel}>가성 최고</span>
                <span className={styles.stepValueNote} style={{ color: '#A16207' }}>
                  {midiToNote(falsettoHighMidi).name} ({midiToNote(falsettoHighMidi).korean})
                </span>
              </div>
            )}
            <div className={styles.optionRow}>
              <button className={styles.copyBtn}
                onClick={() => {
                  if (!running) startAnalyzer()
                  setMeasureStep('falsetto')
                }}
                disabled={measureStep === 'falsetto'}>
                {measureStep === 'falsetto' ? '측정 중...' : '▶ 시작'}
              </button>
              <button className={styles.copyBtn} onClick={() => setMeasureStep('idle')}>
                {measureStep === 'falsetto' ? '✓ 완료' : '⏭️ 건너뛰기'}
              </button>
              <button className={styles.copyBtn}
                onClick={() => { stopAnalyzer(); setTab('result') }}>
                🎯 결과 보기 →
              </button>
            </div>
          </div>

          {currentSample && (
            <div className={styles.noteCard} style={{ padding: '20px 18px' }}>
              <div className={styles.noteName} style={{ fontSize: 'clamp(40px, 12vw, 72px)' }}>
                {midiToNote(currentSample.midi).name}
              </div>
              <div className={styles.noteKorean}>{midiToNote(currentSample.midi).korean} · {currentSample.frequency.toFixed(1)} Hz</div>
            </div>
          )}

          <div className={styles.warnBox}>
            ⚠️ <strong>안전 주의</strong> — 무리한 고음·저음은 성대 손상 위험이 있습니다. 통증·이상 시 즉시 중단하세요. 충분한 워밍업 후 측정을 권장합니다.
          </div>
        </>
      )}

      {/* ─── 탭 3: 결과·노래 ─── */}
      {tab === 'result' && (
        <>
          {!stats || !classification || !lowNote || !highNote ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>먼저 음역 측정을 완료하세요</div>
              [실시간] 또는 [음역 측정] 탭에서 안정 음을 기록하면 결과가 표시됩니다
            </div>
          ) : (
            <>
              <div className={styles.hero}>
                <div className={styles.heroLabel}>당신의 음역대</div>
                <div className={styles.heroRange}>
                  {lowNote.name} <span style={{ color: 'var(--muted)', fontSize: '0.7em' }}>~</span> {highNote.name}
                </div>
                <div className={styles.heroOctaves}>
                  {stats.octaves} 옥타브 · {stats.rangeSemitones} 반음
                </div>
                <div className={styles.heroKorean}>
                  {lowNote.korean} ~ {highNote.korean}
                </div>
                {falsettoNote && (
                  <div className={styles.heroKorean} style={{ color: '#A16207' }}>
                    가성 최고: {falsettoNote.name} ({falsettoNote.korean})
                  </div>
                )}
                <span className={styles.heroClass}
                  style={{ background: `${classification.color}22`, color: classification.color, border: `1px solid ${classification.color}66` }}>
                  {classification.name} · {classification.examples}
                </span>
              </div>

              {/* 피아노 건반 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>피아노 건반 시각화 (C2~C7)</label>
                <div className={styles.pianoWrap}>
                  <div className={styles.piano}>
                    {pianoKeys.filter(k => !k.isBlack).map(k => {
                      const inRange = k.midi >= stats.lowestMidi && k.midi <= stats.highestMidi
                      const inFalsetto = falsettoHighMidi !== null && k.midi > stats.highestMidi && k.midi <= falsettoHighMidi
                      const isCurrent = currentSample !== null && Math.round(currentSample.midi) === k.midi
                      return (
                        <div key={k.midi}
                          className={`${styles.pianoKey} ${isCurrent ? styles.pianoKeyCurrent : inFalsetto ? styles.pianoKeyHiliteFalsetto : inRange ? styles.pianoKeyHilite : ''}`}>
                          {k.label && <span className={styles.pianoKeyLabel}>{k.label}</span>}
                        </div>
                      )
                    })}
                    {/* 검은 건반 */}
                    {pianoKeys.filter(k => k.isBlack).map(k => {
                      const inRange = k.midi >= stats.lowestMidi && k.midi <= stats.highestMidi
                      const inFalsetto = falsettoHighMidi !== null && k.midi > stats.highestMidi && k.midi <= falsettoHighMidi
                      const isCurrent = currentSample !== null && Math.round(currentSample.midi) === k.midi
                      // 검은 건반 위치 — 흰 건반 인덱스 기반
                      const whitesBefore = pianoKeys.filter(x => !x.isBlack && x.midi < k.midi).length
                      return (
                        <div key={k.midi}
                          className={`${styles.pianoKeyBlack} ${isCurrent ? styles.pianoKeyCurrent : inFalsetto ? styles.pianoKeyHiliteFalsetto : inRange ? styles.pianoKeyHilite : ''}`}
                          style={{ left: `calc(${(whitesBefore / pianoKeys.filter(x => !x.isBlack).length) * 100}% - 10px)` }} />
                      )
                    })}
                  </div>
                </div>
                <div className={styles.pianoLegend}>
                  <span><i style={{ background: 'rgba(16,185,129,0.55)' }} />진성 음역</span>
                  {falsettoNote && <span><i style={{ background: 'rgba(161,98,7,0.55)' }} />가성 음역</span>}
                  <span><i style={{ background: 'rgba(255,107,217,0.85)' }} />현재 음 (실시간)</span>
                </div>
              </div>

              {/* 음역 분류 안내 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>음역대 분류 8가지</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {VOCAL_RANGES.map(r => {
                    const isCurrent = r.id === classification.id
                    return (
                      <div key={r.id} style={{
                        background: isCurrent ? `${r.color}15` : 'var(--bg3)',
                        border: `1px solid ${isCurrent ? r.color : 'var(--border)'}`,
                        borderLeft: `4px solid ${r.color}`,
                        borderRadius: 8, padding: '8px 14px',
                        display: 'grid', gridTemplateColumns: '1fr auto auto',
                        gap: 10, alignItems: 'center',
                        fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif',
                        opacity: isCurrent ? 1 : 0.7,
                      }}>
                        <span style={{ color: 'var(--text)', fontWeight: isCurrent ? 700 : 600 }}>
                          {r.name}{isCurrent && ' ←'}
                          <small style={{ display: 'block', color: 'var(--muted)', fontSize: 11, fontWeight: 400 }}>{r.examples}</small>
                        </span>
                        <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, fontSize: 11, color: r.color }}>
                          {r.low}~{r.high}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.gender === 'male' ? '♂' : r.gender === 'female' ? '♀' : '·'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 노래 매칭 */}
              {songMatches.length > 0 && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>
                    부를 수 있는 한국 노래 ({songMatches.length}곡)
                    <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'none', letterSpacing: 0 }}>키 ±6 시뮬</span>
                  </label>
                  <div className={styles.songList}>
                    <div className={`${styles.songRow} ${styles.headerRow}`}>
                      <span>곡 / 가수</span>
                      <span style={{ textAlign: 'right' }}>원곡 음역</span>
                      <span style={{ textAlign: 'right' }}>키 변경</span>
                      <span style={{ textAlign: 'center' }}>난이도</span>
                    </div>
                    {songMatches.map((s, i) => {
                      const shiftClass = s.bestKeyShift === 0 ? styles.songShiftZero
                        : Math.abs(s.bestKeyShift) <= 2 ? styles.songShiftSmall : styles.songShiftLarge
                      const diffClass = s.difficulty === '하' ? styles.diffEasy
                        : s.difficulty === '중' ? styles.diffMid
                        : s.difficulty === '중상' || s.difficulty === '상' ? styles.diffHard : styles.diffVeryHard
                      return (
                        <div key={i} className={styles.songRow}>
                          <span className={styles.songInfo}>
                            {s.title}
                            <small>{s.artist} · {s.genre}</small>
                          </span>
                          <span className={styles.songRange}>{s.lowest}~{s.highest}</span>
                          <span className={`${styles.songShift} ${shiftClass}`}>
                            {s.bestKeyShift === 0 ? '원키' : s.bestKeyShift > 0 ? `+${s.bestKeyShift}` : `${s.bestKeyShift}`}
                          </span>
                          <span className={`${styles.songDifficulty} ${diffClass}`}>{s.difficulty}</span>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                    ⓘ 본 매칭은 단순 음역 비교 결과이며, 실제 노래 난이도는 멜로디·리듬·발성 기교에 따라 다릅니다. 키 변경은 노래방 ±6 키 기준입니다.
                  </p>
                </div>
              )}

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`내 음역대: ${lowNote.name}~${highNote.name} · ${stats.octaves}옥타브 · ${classification.name}${falsettoNote ? ` · 가성 ${falsettoNote.name}` : ''}`)}>
                  {copied ? '✓ 복사됨' : '📋 결과 복사'}
                </button>
                <button className={`${styles.copyBtn} ${saved ? styles.copied : ''}`}
                  onClick={handleSave}>{saved ? '✓ 저장됨' : '💾 기록 저장'}</button>
                <button className={styles.copyBtn} onClick={() => setTab('measure')}>🔄 다시 측정</button>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── 탭 4: 기록 ─── */}
      {tab === 'log' && (
        <>
          <div className={styles.disclaimer}>
            📊 <strong>측정 기록</strong> — localStorage에 최대 30개 저장 (서버 전송 X). 보컬 트레이닝 진행 추적에 활용하세요.
          </div>

          {history.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>저장된 측정 기록이 없습니다</div>
              [결과] 탭에서 [💾 기록 저장] 버튼으로 저장할 수 있습니다
            </div>
          ) : (
            <>
              <div className={styles.card}>
                <label className={styles.cardLabel}>
                  최근 측정 ({history.length}/30)
                  <button className={`${styles.miniBtn} ${styles.miniDanger}`} onClick={clearHistory}>전체 삭제</button>
                </label>
                <div className={styles.historyTable}>
                  <div className={`${styles.historyRow} ${styles.headerRow}`}>
                    <span>날짜</span>
                    <span style={{ textAlign: 'right' }}>최저</span>
                    <span style={{ textAlign: 'right' }}>최고</span>
                    <span style={{ textAlign: 'right' }}>음역</span>
                    <span>분류</span>
                    <span></span>
                  </div>
                  {history.map(h => {
                    const cls = VOCAL_RANGES.find(r => r.id === h.classId)
                    return (
                      <div key={h.id} className={styles.historyRow}>
                        <span className={styles.historyDate}>{h.date.slice(0, 10)}</span>
                        <span className={styles.historyNote}>{midiToNote(h.lowestMidi).name}</span>
                        <span className={styles.historyNote}>{midiToNote(h.highestMidi).name}</span>
                        <span className={styles.historyNote}>{h.rangeSemitones}반</span>
                        <span className={styles.historyClass} style={cls ? { color: cls.color } : {}}>
                          {cls?.name ?? h.classId}
                        </span>
                        <button className={`${styles.miniBtn} ${styles.miniDanger}`}
                          onClick={() => removeRecord(h.id)}>×</button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {history.length >= 2 && (() => {
                const first = history[history.length - 1]
                const last = history[0]
                const lowDelta = last.lowestMidi - first.lowestMidi
                const highDelta = last.highestMidi - first.highestMidi
                const rangeDelta = last.rangeSemitones - first.rangeSemitones
                return (
                  <div className={styles.guideBox}>
                    💡 <strong>변화 추세</strong> — 첫 측정({first.date.slice(0, 10)}) → 최근({last.date.slice(0, 10)})
                    <ul>
                      <li>최저음: {lowDelta === 0 ? '변화 없음' : lowDelta < 0 ? `${Math.abs(lowDelta)}반음 낮아짐 ↓` : `${lowDelta}반음 높아짐 ↑`}</li>
                      <li>최고음: {highDelta === 0 ? '변화 없음' : highDelta > 0 ? `${highDelta}반음 높아짐 ↑` : `${Math.abs(highDelta)}반음 낮아짐 ↓`}</li>
                      <li>음역: {rangeDelta === 0 ? '변화 없음' : rangeDelta > 0 ? `${rangeDelta}반음 늘어남` : `${Math.abs(rangeDelta)}반음 줄어듦`}</li>
                    </ul>
                    {rangeDelta > 0 && '보컬 트레이닝 효과가 추정됩니다.'}
                  </div>
                )
              })()}
            </>
          )}
        </>
      )}

      {/* 하단 면책 강화 */}
      <div className={styles.warnBox}>
        🔒 <strong>개인정보·안전</strong> — 마이크 음성은 브라우저 내에서만 분석되며 서버 전송 X. 측정 기록은 localStorage에만 저장됩니다.
        무리한 고음·저음 발성은 성대 손상 위험이 있으니 통증·이상 시 즉시 중단하세요.
      </div>
    </div>
  )
}
