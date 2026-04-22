'use client'

import { useState, useMemo } from 'react'
import s from './golf-handicap.module.css'

// ── 라운드 수별 사용 디퍼런셜 개수 ──
function getUsedCount(n: number): number {
  if (n < 3) return 0
  if (n <= 5) return 1
  if (n <= 8) return 2
  if (n <= 11) return 3
  if (n <= 14) return 4
  if (n <= 16) return 5
  if (n === 17) return 6
  if (n === 18) return 7
  return 8
}

function getGrade(index: number): { label: string; cls: string } {
  if (index <= 0) return { label: '스크래치', cls: s.gradeScratch }
  if (index < 10) return { label: '로우 핸디캐퍼', cls: s.gradeLow }
  if (index < 19) return { label: '미드 핸디캐퍼', cls: s.gradeMid }
  if (index < 29) return { label: '하이 핸디캐퍼', cls: s.gradeHigh }
  return { label: '맥스 핸디캐퍼', cls: s.gradeMax }
}

function getDiffClass(diff: number): string {
  if (diff <= 5) return s.diffGood
  if (diff <= 18) return s.diffMid
  return s.diffBad
}

type Round = {
  id: number
  gross: string
  cr: string
  sr: string
  holes: 18 | 9
}

// ── 샘플 데이터 ──
const SAMPLE_ROUNDS: Omit<Round, 'id'>[] = [
  { gross: '92', cr: '72.3', sr: '128', holes: 18 },
  { gross: '88', cr: '71.8', sr: '122', holes: 18 },
  { gross: '95', cr: '72.5', sr: '130', holes: 18 },
  { gross: '90', cr: '72.0', sr: '125', holes: 18 },
  { gross: '86', cr: '71.5', sr: '120', holes: 18 },
  { gross: '93', cr: '72.3', sr: '128', holes: 18 },
  { gross: '89', cr: '72.0', sr: '125', holes: 18 },
  { gross: '91', cr: '71.8', sr: '123', holes: 18 },
]

// ── 탭 1: 핸디캡 지수 계산기 ──
function HandicapIndexTab({
  rounds,
  setRounds,
  onSetIndex,
}: {
  rounds: Round[]
  setRounds: (r: Round[]) => void
  onSetIndex: (idx: number) => void
}) {
  const addRound = () => {
    if (rounds.length >= 20) return
    const nextId = rounds.length ? Math.max(...rounds.map(r => r.id)) + 1 : 1
    setRounds([...rounds, { id: nextId, gross: '', cr: '72.0', sr: '113', holes: 18 }])
  }

  const removeRound = (id: number) => {
    setRounds(rounds.filter(r => r.id !== id))
  }

  const updateRound = (id: number, field: keyof Round, value: string | number) => {
    setRounds(rounds.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const loadSample = () => {
    setRounds(SAMPLE_ROUNDS.map((r, i) => ({ ...r, id: i + 1 })))
  }

  const clearAll = () => {
    setRounds([])
  }

  // 디퍼런셜 계산
  const roundsWithDiff = useMemo(() => {
    return rounds.map(r => {
      const gross = parseFloat(r.gross)
      const cr = parseFloat(r.cr)
      const sr = parseFloat(r.sr)
      if (!gross || !cr || !sr) return { ...r, diff: null as number | null }
      // 9홀은 18홀로 환산 (단순 2배)
      const adjustedGross = r.holes === 9 ? gross * 2 : gross
      const adjustedCr = r.holes === 9 ? cr * 2 : cr
      const diff = (adjustedGross - adjustedCr) * 113 / sr
      return { ...r, diff }
    })
  }, [rounds])

  const validRounds = roundsWithDiff.filter(r => r.diff !== null)
  const usedCount = getUsedCount(validRounds.length)

  // 최저 N개 선택
  const usedIds = useMemo(() => {
    if (usedCount === 0) return new Set<number>()
    const sorted = [...validRounds].sort((a, b) => (a.diff as number) - (b.diff as number))
    return new Set(sorted.slice(0, usedCount).map(r => r.id))
  }, [validRounds, usedCount])

  const handicapIndex = useMemo(() => {
    if (usedCount === 0) return null
    const used = validRounds.filter(r => usedIds.has(r.id))
    const avg = used.reduce((sum, r) => sum + (r.diff as number), 0) / used.length
    return Math.round(avg * 0.96 * 10) / 10
  }, [validRounds, usedIds, usedCount])

  const grade = handicapIndex !== null ? getGrade(handicapIndex) : null

  return (
    <div className={s.section}>
      {/* 히어로 결과 */}
      {handicapIndex !== null && grade && (
        <div className={s.hero}>
          <div className={s.heroLeft}>
            <div className={s.heroLabel}>Handicap Index</div>
            <div className={s.heroNum}>{handicapIndex.toFixed(1)}</div>
            <div className={s.heroSub}>{validRounds.length}라운드 중 최저 {usedCount}개 평균 × 0.96</div>
          </div>
          <div className={s.heroRight}>
            <span className={`${s.gradeBadge} ${grade.cls}`}>{grade.label}</span>
          </div>
        </div>
      )}

      {/* 라운드 입력 */}
      <div className={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className={s.cardLabel} style={{ margin: 0 }}>라운드 기록 ({rounds.length}/20)</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>
            사용 {validRounds.length > 0 ? usedCount : 0}개
          </span>
        </div>

        <div className={s.roundList}>
          {roundsWithDiff.map((r, idx) => {
            const isUsed = usedIds.has(r.id)
            return (
              <div key={r.id} className={`${s.roundRow} ${isUsed ? s.roundRowUsed : ''}`}>
                <div className={s.roundNum}>#{idx + 1}</div>

                <div>
                  <label className={s.roundInputLabel}>그로스</label>
                  <input
                    type="number" inputMode="numeric" className={s.roundInput}
                    value={r.gross} onChange={e => updateRound(r.id, 'gross', e.target.value)}
                    placeholder="92"
                  />
                </div>

                <div>
                  <label className={s.roundInputLabel}>코스 레이팅</label>
                  <input
                    type="number" inputMode="decimal" step="0.1" className={s.roundInput}
                    value={r.cr} onChange={e => updateRound(r.id, 'cr', e.target.value)}
                    placeholder="72.0"
                  />
                </div>

                <div>
                  <label className={s.roundInputLabel}>슬로프</label>
                  <input
                    type="number" inputMode="numeric" className={s.roundInput}
                    value={r.sr} onChange={e => updateRound(r.id, 'sr', e.target.value)}
                    placeholder="113"
                  />
                </div>

                <button className={s.roundDelete} onClick={() => removeRound(r.id)} aria-label="삭제">×</button>

                <div style={{ gridColumn: '1 / -1' }} className={s.roundMeta}>
                  <div className={s.holeToggle}>
                    <button
                      className={`${s.holeBtn} ${r.holes === 18 ? s.holeBtnActive : ''}`}
                      onClick={() => updateRound(r.id, 'holes', 18)}
                    >18홀</button>
                    <button
                      className={`${s.holeBtn} ${r.holes === 9 ? s.holeBtnActive : ''}`}
                      onClick={() => updateRound(r.id, 'holes', 9)}
                    >9홀</button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>디퍼런셜</span>
                  <span className={`${s.roundDiff} ${r.diff !== null ? getDiffClass(r.diff) : ''}`}>
                    {r.diff !== null ? r.diff.toFixed(1) : '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className={s.actionRow}>
          <button className={s.addBtn} onClick={addRound} disabled={rounds.length >= 20}>
            + 라운드 추가
          </button>
          {rounds.length === 0 ? (
            <button className={s.sampleBtn} onClick={loadSample}>샘플 8라운드 불러오기</button>
          ) : (
            <button className={s.sampleBtn} onClick={clearAll}>전체 삭제</button>
          )}
        </div>

        {rounds.length > 0 && rounds.length < 3 && (
          <p style={{ fontSize: '12px', color: '#FF8C3E', marginTop: '10px', textAlign: 'center' }}>
            핸디캡 지수 계산에는 최소 3라운드가 필요합니다. ({3 - rounds.length}라운드 더 입력)
          </p>
        )}
      </div>

      {handicapIndex !== null && (
        <button
          onClick={() => onSetIndex(handicapIndex)}
          style={{
            background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.3)',
            borderRadius: '10px', padding: '12px', color: 'var(--accent)',
            fontSize: '13px', fontFamily: 'Noto Sans KR', cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          이 지수를 탭 2(코스 핸디캡)에 적용 →
        </button>
      )}
    </div>
  )
}

// ── 탭 2: 코스 핸디캡 계산기 ──
const COURSE_PRESETS = [
  { name: '표준 코스', cr: '72.0', sr: '113', par: '72' },
  { name: '어려운 코스', cr: '74.5', sr: '130', par: '72' },
  { name: '쉬운 코스', cr: '70.2', sr: '105', par: '72' },
]

function CourseHandicapTab({
  indexValue,
  setIndexValue,
}: {
  indexValue: string
  setIndexValue: (v: string) => void
}) {
  const [sr, setSr] = useState('125')
  const [cr, setCr] = useState('72.3')
  const [par, setPar] = useState('72')
  const [gross, setGross] = useState('')

  const idx = parseFloat(indexValue)
  const srN = parseFloat(sr)
  const crN = parseFloat(cr)
  const parN = parseFloat(par)

  const courseHandicap = useMemo(() => {
    if (!idx && idx !== 0) return null
    if (!srN || !crN || !parN) return null
    return Math.round(idx * (srN / 113) + (crN - parN))
  }, [idx, srN, crN, parN])

  const playingHandicap = useMemo(() => {
    if (courseHandicap === null) return null
    return Math.round(courseHandicap * 0.95)
  }, [courseHandicap])

  const grossN = parseFloat(gross)
  const netScore = useMemo(() => {
    if (!grossN || courseHandicap === null) return null
    return grossN - courseHandicap
  }, [grossN, courseHandicap])

  const applyPreset = (p: typeof COURSE_PRESETS[number]) => {
    setCr(p.cr); setSr(p.sr); setPar(p.par)
  }

  const activePreset = COURSE_PRESETS.findIndex(p => p.cr === cr && p.sr === sr && p.par === par)

  return (
    <div className={s.section}>
      <div className={s.card}>
        <span className={s.cardLabel}>핸디캡 지수</span>
        <div className={s.inputRow}>
          <input
            type="number" inputMode="decimal" step="0.1"
            className={s.bigInput}
            value={indexValue} onChange={e => setIndexValue(e.target.value)}
            placeholder="12.5"
          />
          <span className={s.inputUnit}>HI</span>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>코스 정보</span>
        <div className={s.presetRow}>
          {COURSE_PRESETS.map((p, i) => (
            <button
              key={p.name}
              className={`${s.presetBtn} ${activePreset === i ? s.presetActive : ''}`}
              onClick={() => applyPreset(p)}
            >{p.name}</button>
          ))}
        </div>

        <div className={s.grid2}>
          <div>
            <label className={s.fieldLabel}>코스 레이팅 (CR)</label>
            <input
              type="number" inputMode="decimal" step="0.1"
              className={s.bigInput}
              value={cr} onChange={e => setCr(e.target.value)}
            />
          </div>
          <div>
            <label className={s.fieldLabel}>슬로프 레이팅</label>
            <input
              type="number" inputMode="numeric"
              className={s.bigInput}
              value={sr} onChange={e => setSr(e.target.value)}
            />
          </div>
          <div>
            <label className={s.fieldLabel}>파 (Par)</label>
            <input
              type="number" inputMode="numeric"
              className={s.bigInput}
              value={par} onChange={e => setPar(e.target.value)}
            />
          </div>
          <div>
            <label className={s.fieldLabel}>그로스 스코어 (선택)</label>
            <input
              type="number" inputMode="numeric"
              className={s.bigInput}
              value={gross} onChange={e => setGross(e.target.value)}
              placeholder="-"
            />
          </div>
        </div>
      </div>

      {courseHandicap !== null && (
        <div className={s.resultGrid}>
          <div className={s.resultCard}>
            <div className={s.resultTitle}>코스 핸디캡</div>
            <div className={s.resultNum}>{courseHandicap}</div>
            <div className={s.resultUnit}>strokes</div>
          </div>
          <div className={s.resultCard}>
            <div className={s.resultTitle}>플레잉 핸디캡<br/>(×0.95)</div>
            <div className={s.resultNum}>{playingHandicap}</div>
            <div className={s.resultUnit}>strokes</div>
          </div>
          <div className={s.resultCard}>
            <div className={s.resultTitle}>네트 스코어<br/>(그로스 − CH)</div>
            <div className={s.resultNum}>{netScore !== null ? netScore : '—'}</div>
            <div className={s.resultUnit}>{netScore !== null ? (netScore < parN ? `${parN - netScore}언더` : netScore > parN ? `${netScore - parN}오버` : '이븐') : 'gross 입력'}</div>
          </div>
        </div>
      )}

      <div className={s.infoBox}>
        <strong style={{ color: 'var(--text)' }}>공식</strong><br/>
        코스 핸디캡 = 핸디캡지수 × (슬로프 ÷ 113) + (코스레이팅 − 파)<br/>
        플레잉 핸디캡 = 코스 핸디캡 × 0.95 (스트로크 플레이 기준)
      </div>
    </div>
  )
}

// ── 탭 3: 네트 스코어 & 스태블포드 ──
function ScoreTab({ courseHandicap, setCourseHandicap }: { courseHandicap: string; setCourseHandicap: (v: string) => void }) {
  const [mode, setMode] = useState<'stroke' | 'stable'>('stroke')
  const [totalGross, setTotalGross] = useState('')
  const [parTotal, setParTotal] = useState('72')

  // 홀별 (스태블포드)
  const [holes, setHoles] = useState<string[]>(Array(18).fill(''))
  const holePars = [4,4,3,4,5,3,4,4,5,4,3,5,4,4,3,4,5,4] // 파72 예시

  const ch = parseInt(courseHandicap)
  const grossN = parseFloat(totalGross)
  const parN = parseFloat(parTotal)

  const netScore = useMemo(() => {
    if (!grossN || isNaN(ch)) return null
    return grossN - ch
  }, [grossN, ch])

  // 홀별 핸디캡 스트로크 분배 (코스핸디캡 만큼 난이도 1~18 순서로 분배)
  const holeStrokes = useMemo(() => {
    if (isNaN(ch) || ch <= 0) return Array(18).fill(0)
    const strokes = Array(18).fill(0)
    let remaining = ch
    // 18홀 씩 전체 분배
    while (remaining > 0) {
      for (let i = 0; i < 18 && remaining > 0; i++) {
        strokes[i] += 1
        remaining -= 1
      }
    }
    return strokes
  }, [ch])

  const stablefordPoints = useMemo(() => {
    return holes.map((scoreStr, i) => {
      const score = parseInt(scoreStr)
      if (!score) return null
      const par = holePars[i]
      const netHole = score - holeStrokes[i]
      const diff = netHole - par
      let pts = 0
      if (diff <= -3) pts = 5
      else if (diff === -2) pts = 4
      else if (diff === -1) pts = 3
      else if (diff === 0) pts = 2
      else if (diff === 1) pts = 1
      else pts = 0
      return pts
    })
  }, [holes, holeStrokes])

  const stableTotal = stablefordPoints.reduce((sum: number, p) => p !== null ? sum + p : sum, 0)
  const stableFilled = stablefordPoints.filter(p => p !== null).length

  const pointCls = (p: number) => {
    if (p >= 4) return s.pointEagle
    if (p === 3) return s.pointBirdie
    if (p === 2) return s.pointPar
    if (p === 1) return s.pointBogey
    return s.pointZero
  }

  return (
    <div className={s.section}>
      <div className={s.card}>
        <span className={s.cardLabel}>계산 방식</span>
        <div className={s.modeRow}>
          <button className={`${s.modeBtn} ${mode === 'stroke' ? s.modeActive : ''}`} onClick={() => setMode('stroke')}>
            스트로크 플레이
          </button>
          <button className={`${s.modeBtn} ${mode === 'stable' ? s.modeActive : ''}`} onClick={() => setMode('stable')}>
            스태블포드
          </button>
        </div>

        <div className={s.grid2} style={{ marginBottom: mode === 'stroke' ? 0 : '12px' }}>
          <div>
            <label className={s.fieldLabel}>코스 핸디캡</label>
            <input
              type="number" inputMode="numeric"
              className={s.bigInput}
              value={courseHandicap} onChange={e => setCourseHandicap(e.target.value)}
              placeholder="14"
            />
          </div>
          <div>
            <label className={s.fieldLabel}>파 (Par)</label>
            <input
              type="number" inputMode="numeric"
              className={s.bigInput}
              value={parTotal} onChange={e => setParTotal(e.target.value)}
            />
          </div>
        </div>
      </div>

      {mode === 'stroke' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>그로스 스코어 (18홀 총 타수)</span>
            <div className={s.inputRow}>
              <input
                type="number" inputMode="numeric"
                className={s.bigInput}
                value={totalGross} onChange={e => setTotalGross(e.target.value)}
                placeholder="92"
              />
              <span className={s.inputUnit}>strokes</span>
            </div>
          </div>

          {netScore !== null && (
            <div className={s.resultGrid}>
              <div className={s.resultCard}>
                <div className={s.resultTitle}>그로스</div>
                <div className={s.resultNum}>{grossN}</div>
                <div className={s.resultUnit}>{grossN > parN ? `+${grossN - parN}` : grossN < parN ? `${grossN - parN}` : 'E'}</div>
              </div>
              <div className={s.resultCard}>
                <div className={s.resultTitle}>네트 스코어</div>
                <div className={s.resultNum}>{netScore}</div>
                <div className={s.resultUnit}>{netScore > parN ? `+${netScore - parN}` : netScore < parN ? `${netScore - parN}` : 'E'}</div>
              </div>
              <div className={s.resultCard}>
                <div className={s.resultTitle}>파 대비</div>
                <div className={s.resultNum} style={{
                  color: netScore < parN ? '#3EFF9B' : netScore > parN ? '#FF6B6B' : 'var(--accent)',
                }}>
                  {netScore === parN ? '이븐' : netScore < parN ? `${parN - netScore}↓` : `${netScore - parN}↑`}
                </div>
                <div className={s.resultUnit}>net vs par</div>
              </div>
            </div>
          )}
        </>
      )}

      {mode === 'stable' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>홀별 스코어 (Out · 1~9홀)</span>
            <div className={s.holeGrid}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className={s.holeCell}>
                  <span className={s.holeLabel}>#{i + 1}</span>
                  <input
                    type="number" inputMode="numeric" className={s.holeScore}
                    value={holes[i]}
                    onChange={e => {
                      const n = [...holes]; n[i] = e.target.value; setHoles(n)
                    }}
                    placeholder={`P${holePars[i]}`}
                  />
                  {stablefordPoints[i] !== null && (
                    <span className={`${s.holePoint} ${pointCls(stablefordPoints[i] as number)}`}>
                      {stablefordPoints[i]}pt
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>홀별 스코어 (In · 10~18홀)</span>
            <div className={s.holeGrid}>
              {Array.from({ length: 9 }, (_, i) => {
                const idx = i + 9
                return (
                  <div key={idx} className={s.holeCell}>
                    <span className={s.holeLabel}>#{idx + 1}</span>
                    <input
                      type="number" inputMode="numeric" className={s.holeScore}
                      value={holes[idx]}
                      onChange={e => {
                        const n = [...holes]; n[idx] = e.target.value; setHoles(n)
                      }}
                      placeholder={`P${holePars[idx]}`}
                    />
                    {stablefordPoints[idx] !== null && (
                      <span className={`${s.holePoint} ${pointCls(stablefordPoints[idx] as number)}`}>
                        {stablefordPoints[idx]}pt
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {stableFilled > 0 && (
            <div className={s.stableTotal}>
              <div>
                <div className={s.stableTotalLabel}>스태블포드 총점</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  {stableFilled}홀 입력 · 코스 핸디캡 {isNaN(ch) ? 0 : ch}타 분배
                </div>
              </div>
              <div className={s.stableTotalNum}>{stableTotal}pt</div>
            </div>
          )}

          <div className={s.infoBox}>
            <strong style={{ color: 'var(--text)' }}>스태블포드 포인트</strong><br/>
            더블이글(−3) 5pt · 이글(−2) 4pt · 버디(−1) 3pt · 파 2pt · 보기(+1) 1pt · 더블 이상 0pt<br/>
            각 홀 네트 스코어 = 홀 스코어 − 홀 분배 스트로크
          </div>
        </>
      )}
    </div>
  )
}

// ── 메인 ──
export default function GolfHandicapClient() {
  const [tab, setTab] = useState<'index' | 'course' | 'score'>('index')
  const [rounds, setRounds] = useState<Round[]>([])
  const [indexValue, setIndexValue] = useState('12.5')
  const [courseHandicap, setCourseHandicap] = useState('14')

  return (
    <div className={s.wrap}>
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'index' ? s.tabActive : ''}`} onClick={() => setTab('index')}>
          핸디캡 지수
        </button>
        <button className={`${s.tab} ${tab === 'course' ? s.tabActive : ''}`} onClick={() => setTab('course')}>
          코스 핸디캡
        </button>
        <button className={`${s.tab} ${tab === 'score' ? s.tabActive : ''}`} onClick={() => setTab('score')}>
          네트·스태블포드
        </button>
      </div>

      {tab === 'index' && (
        <HandicapIndexTab
          rounds={rounds}
          setRounds={setRounds}
          onSetIndex={(v) => { setIndexValue(v.toFixed(1)); setTab('course') }}
        />
      )}
      {tab === 'course' && (
        <CourseHandicapTab
          indexValue={indexValue}
          setIndexValue={setIndexValue}
        />
      )}
      {tab === 'score' && (
        <ScoreTab
          courseHandicap={courseHandicap}
          setCourseHandicap={setCourseHandicap}
        />
      )}
    </div>
  )
}
