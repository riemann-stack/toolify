/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './lotto.module.css'
import {
  GENERATION_MODES, NUMBER_RANGES, ODDS_FIRST_PRIZE, PRICE_PER_GAME,
  generateGames, analyzeNumbers, simulateDraws, simulateUntilFirstPrize, calcAfterTax,
  loadSaved, saveSaved, newId, isNoticeDismissed, dismissNotice, reopenNotice,
  getBallColor, getBallTextColor, interpretAnalysis,
  type LottoGame, type ModeId, type SavedNumber, type SimResult, type FirstPrizeSimResult, type GameAnalysis,
} from './lottoUtils'

type Tab = 'generate' | 'analyze' | 'simulator' | 'jackpot' | 'tax'

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function LottoClient() {
  const [tab, setTab] = useState<Tab>('generate')
  const [noticeOpen, setNoticeOpen] = useState(true)

  // 첫 마운트에서 dismiss 여부 확인
  useEffect(() => {
    if (isNoticeDismissed()) setNoticeOpen(false)
  }, [])

  return (
    <div className={s.wrap}>
      {noticeOpen ? (
        <div className={s.responsibilityBanner}>
          <button className={s.responsibilityClose}
            onClick={() => { dismissNotice(); setNoticeOpen(false) }}
            aria-label="닫기">×</button>
          ⚠️ <strong>수학적으로 모든 6개 번호 조합의 1등 확률은 1/8,145,060로 동일합니다.</strong>
          어떤 생성 모드·분석·필터도 당첨 확률에 영향을 주지 않으며, 본 도구는 <strong>번호 조합 다양화·재미용 시뮬레이터</strong>입니다.
          로또는 본인의 경제 능력 안에서 오락 목적으로 즐기시고, 도박 의존 우려 시 <strong>한국도박문제예방치유원 1336</strong>(24시간 무료)에 상담받으실 수 있습니다.
        </div>
      ) : (
        <div className={s.responsibilityMini}>
          <button onClick={() => { reopenNotice(); setNoticeOpen(true) }}>
            ⚠️ 사행성 안내 다시 펼치기
          </button>
        </div>
      )}

      <div className={s.tabs}>
        {([
          ['generate',  '번호 생성'],
          ['analyze',   '번호 분석'],
          ['simulator', '확률 시뮬'],
          ['jackpot',   '1등 체감'],
          ['tax',       '당첨금 세후'],
        ] as [Tab, string][]).map(([key, label]) => {
          const cls =
            tab !== key ? '' :
            key === 'analyze'   ? s.tabActiveAnalyze :
            key === 'simulator' ? s.tabActiveSim :
            key === 'jackpot'   ? s.tabActiveJackpot :
            key === 'tax'       ? s.tabActiveTax : s.tabActive
          return (
            <button key={key} className={`${s.tabBtn} ${cls}`} onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'generate'  && <GenerateTab />}
      {tab === 'analyze'   && <AnalyzeTab />}
      {tab === 'simulator' && <SimulatorTab />}
      {tab === 'jackpot'   && <JackpotTab />}
      {tab === 'tax'       && <TaxTab />}
    </div>
  )
}

/* ─── 공 ─── */
function Ball({ n, size = 'md' }: { n: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? s.savedBall : s.ball
  return (
    <span className={cls} style={{ background: getBallColor(n), color: getBallTextColor(n) }}>
      {n}
    </span>
  )
}

/* ═════════════════════════════════════════ 탭 1 — 번호 생성 ═════════════════════════════════════════ */
function GenerateTab() {
  const [mode, setMode] = useState<ModeId>('balanced')
  const [gameCount, setGameCount] = useState(5)
  const [fixed, setFixed] = useState<number[]>([])
  const [excluded, setExcluded] = useState<number[]>([])
  const [editMode, setEditMode] = useState<'fix' | 'excl'>('fix')
  const [avoidOverlap, setAvoidOverlap] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(true)
  const [games, setGames] = useState<LottoGame[]>([])
  const [copied, setCopied] = useState(false)
  const [saveConfirm, setSaveConfirm] = useState(false)

  const toggleNumber = (n: number) => {
    if (editMode === 'fix') {
      if (fixed.includes(n)) {
        setFixed(fixed.filter(x => x !== n))
      } else if (fixed.length < 5 && !excluded.includes(n)) {
        setFixed([...fixed, n])
      }
    } else {
      if (excluded.includes(n)) {
        setExcluded(excluded.filter(x => x !== n))
      } else if (!fixed.includes(n)) {
        setExcluded([...excluded, n])
      }
    }
  }

  const handleGenerate = () => {
    const opts = {
      mode,
      gameCount: mode === 'quick-pick' ? 5 : gameCount,
      fixed: fixed.length > 0 ? fixed : undefined,
      excluded: excluded.length > 0 ? excluded : undefined,
      avoidGameOverlap: avoidOverlap,
    }
    setGames(generateGames(opts))
    setCopied(false)
  }

  const handleCopyAll = () => {
    if (games.length === 0) return
    const lines = games.map((g, i) =>
      `${String.fromCharCode(65 + i)}. ${g.numbers.join(', ')}`
    )
    const text = `🎰 ${GENERATION_MODES.find(m => m.id === mode)?.name} (${games.length}게임)\n──────────────\n${lines.join('\n')}\n\n— youtil.kr 로또 번호 생성기\n※ 모든 번호 조합의 1등 확률은 1/8,145,060로 동일합니다.`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const handleSaveOne = (g: LottoGame) => {
    const all = loadSaved()
    all.push({
      id: newId(),
      numbers: g.numbers,
      mode,
      savedAt: new Date().toISOString(),
    })
    saveSaved(all)
    setSaveConfirm(true)
    setTimeout(() => setSaveConfirm(false), 1500)
  }

  const handleSaveAll = () => {
    const all = loadSaved()
    const now = new Date().toISOString()
    games.forEach(g => {
      all.push({ id: newId(), numbers: g.numbers, mode, savedAt: now })
    })
    saveSaved(all)
    setSaveConfirm(true)
    setTimeout(() => setSaveConfirm(false), 1500)
  }

  return (
    <>
      {/* 모드 선택 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          생성 모드
          <span className={s.cardLabelHint}>8가지 — 모두 동일 확률</span>
        </label>
        <div className={s.modeGrid}>
          {GENERATION_MODES.map(m => (
            <button key={m.id}
              className={`${s.modeCard} ${mode === m.id ? s.modeCardActive : ''}`}
              onClick={() => setMode(m.id)}>
              <div className={s.modeCardEmoji}>{m.icon}</div>
              <div className={s.modeCardName}>{m.name}</div>
              <div className={s.modeCardDesc}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 게임 수 */}
      {mode !== 'quick-pick' && (
        <div className={s.card}>
          <label className={s.cardLabel}>게임 수</label>
          <div className={s.countRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n}
                className={`${s.countBtn} ${gameCount === n ? s.countActive : ''}`}
                onClick={() => setGameCount(n)}>
                {n}게임
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 고정·제외 번호 */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          고정·제외 번호 (선택)
          <span className={s.cardLabelHint}>고정 {fixed.length}/5 · 제외 {excluded.length}</span>
        </label>
        <div className={s.fixExcludeToggle}>
          <button className={`${s.fixExcludeBtn} ${editMode === 'fix' ? s.fixActive : ''}`}
            onClick={() => setEditMode('fix')}>📌 고정 번호 (최대 5)</button>
          <button className={`${s.fixExcludeBtn} ${editMode === 'excl' ? s.exclActive : ''}`}
            onClick={() => setEditMode('excl')}>🚫 제외 번호</button>
        </div>
        <div className={s.numGrid}>
          {Array.from({ length: 45 }, (_, i) => i + 1).map(n => {
            const isFixed = fixed.includes(n)
            const isExcl = excluded.includes(n)
            const cls = isFixed ? s.numCellFixed : isExcl ? s.numCellExcluded : ''
            return (
              <button key={n} className={`${s.numCell} ${cls}`}
                onClick={() => toggleNumber(n)}
                disabled={editMode === 'fix' ? isExcl : isFixed}>
                {n}
              </button>
            )
          })}
        </div>
        <div className={s.numLegend}>
          {NUMBER_RANGES.map(r => (
            <span key={r.id}>
              <strong style={{ color: r.color }}>{r.start}~{r.end}</strong> {r.name.split(' ')[1]}
            </span>
          ))}
        </div>
        {(fixed.length > 0 || excluded.length > 0) && (
          <button className={s.miniBtn}
            style={{ marginTop: 8 }}
            onClick={() => { setFixed([]); setExcluded([]) }}>
            모두 해제
          </button>
        )}
      </div>

      {/* 옵션 */}
      <div className={s.card}>
        <label className={s.cardLabel}>옵션</label>
        <label className={s.toggleLabel} style={{ marginBottom: 6 }}>
          <input type="checkbox" checked={avoidOverlap} onChange={e => setAvoidOverlap(e.target.checked)} />
          5게임 간 중복 최소화 (4개 이상 겹침 방지)
        </label>
        <label className={s.toggleLabel}>
          <input type="checkbox" checked={showAnalysis} onChange={e => setShowAnalysis(e.target.checked)} />
          각 게임의 번호 분석 함께 표시
        </label>
      </div>

      <button className={s.bigGenerate} onClick={handleGenerate}>
        🎰 {mode === 'quick-pick' ? '빠른픽 5게임 생성' : `${GENERATION_MODES.find(m => m.id === mode)?.name} ${gameCount}게임 생성`}
      </button>

      {/* 결과 */}
      {games.length > 0 && (
        <>
          <div className={s.gameCards}>
            {games.map((g, i) => (
              <div key={i} className={s.gameCard}>
                <div className={s.gameHeader}>
                  <span className={s.gameLabel}>
                    {String.fromCharCode(65 + i)}게임
                    <small>{GENERATION_MODES.find(m => m.id === mode)?.name}</small>
                  </span>
                  <div className={s.miniRow}>
                    <button className={s.miniBtn}
                      onClick={() => navigator.clipboard.writeText(g.numbers.join(', '))}>
                      📋 복사
                    </button>
                    <button className={s.miniBtn} onClick={() => handleSaveOne(g)}>💾 저장</button>
                  </div>
                </div>
                <div className={s.balls}>
                  {g.numbers.map(n => <Ball key={n} n={n} />)}
                </div>
                {showAnalysis && (
                  <div className={s.gameMeta}>
                    합 <strong style={{ color: 'var(--accent)' }}>{g.analysis.sum}</strong> ·
                    {' '}홀짝 <strong style={{ color: 'var(--accent)' }}>{g.analysis.oddCount}:{g.analysis.evenCount}</strong> ·
                    {' '}저고 <strong style={{ color: 'var(--accent)' }}>{g.analysis.lowCount}:{g.analysis.highCount}</strong>
                    {g.analysis.consecutivePairs > 0 && <> · 연속 {g.analysis.consecutivePairs}쌍</>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={s.resultActions}>
            <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopyAll}>
              {copied ? '✓ 복사됨' : '📋 전체 텍스트 복사'}
            </button>
            <button className={`${s.copyBtn} ${saveConfirm ? s.copied : ''}`} onClick={handleSaveAll}>
              {saveConfirm ? '✓ 저장됨' : '💾 모두 저장'}
            </button>
            <button className={s.copyBtn} onClick={handleGenerate}>🔄 다시 생성</button>
          </div>
        </>
      )}

      {/* 저장된 번호 */}
      <SavedList />
    </>
  )
}

/* ─── 저장된 번호 목록 ─── */
function SavedList() {
  const [saved, setSaved] = useState<SavedNumber[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setSaved(loadSaved()); setLoaded(true) }, [])

  const handleDelete = (id: string) => {
    const next = saved.filter(s => s.id !== id)
    setSaved(next)
    saveSaved(next)
  }
  const handleClear = () => {
    if (!confirm('저장된 번호를 모두 삭제하시겠습니까?')) return
    setSaved([])
    saveSaved([])
  }

  if (!loaded || saved.length === 0) return null

  return (
    <div className={s.card}>
      <label className={s.cardLabel}>
        💾 저장된 번호
        <span className={s.cardLabelHint}>{saved.length}개</span>
      </label>
      <div className={s.savedList}>
        {saved.slice(-20).reverse().map(s2 => {
          const mode = GENERATION_MODES.find(m => m.id === s2.mode)
          return (
            <div key={s2.id} className={s.savedRow}>
              <div className={s.savedNumbers}>
                {s2.numbers.map(n => <Ball key={n} n={n} size="sm" />)}
                <span className={s.savedMeta}>
                  {mode?.icon} {new Date(s2.savedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <button className={`${s.miniBtn} ${s.miniDanger}`} onClick={() => handleDelete(s2.id)}>×</button>
            </div>
          )
        })}
      </div>
      <button className={`${s.miniBtn} ${s.miniDanger}`} style={{ marginTop: 8 }} onClick={handleClear}>
        🗑️ 모두 삭제
      </button>
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 2 — 번호 분석 ═════════════════════════════════════════ */
function AnalyzeTab() {
  const [nums, setNums] = useState<(number | '')[]>(['', '', '', '', '', ''])

  const updateNum = (i: number, v: string) => {
    if (v === '') {
      setNums(prev => prev.map((p, j) => j === i ? '' : p))
      return
    }
    const n = parseInt(v)
    if (!Number.isFinite(n) || n < 1 || n > 45) return
    setNums(prev => prev.map((p, j) => j === i ? n : p))
  }

  const valid = nums.filter((n): n is number => typeof n === 'number') as number[]
  const dedup = [...new Set(valid)]
  const ready = dedup.length === 6

  const analysis: GameAnalysis | null = ready ? analyzeNumbers(dedup) : null

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          분석할 번호 6개 입력
          <span className={s.cardLabelHint}>1~45</span>
        </label>
        <div className={s.numInputRow}>
          {nums.map((n, i) => (
            <input key={i} className={s.numInput} type="number" min={1} max={45}
              value={n === '' ? '' : n}
              onChange={e => updateNum(i, e.target.value)}
              placeholder="?" />
          ))}
        </div>
        {valid.length !== dedup.length && (
          <p style={{ fontSize: 11.5, color: '#FF6B6B', marginTop: 8 }}>
            중복된 번호가 있습니다. 6개 모두 다른 번호여야 합니다.
          </p>
        )}
      </div>

      {!ready && (
        <div className={s.empty}>
          <div className={s.emptyTitle}>🔢 6개 번호를 모두 입력해 주세요</div>
          <p>홀짝·저고·구간·소수·연속·간격 등 통계 패턴을 분석합니다.</p>
        </div>
      )}

      {ready && analysis && (
        <>
          <div className={s.card}>
            <label className={s.cardLabel}>입력한 번호</label>
            <div className={s.balls}>
              {[...dedup].sort((a, b) => a - b).map(n => <Ball key={n} n={n} />)}
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>기본 통계</label>
            <div className={s.analysisGrid}>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>총합</div>
                <div className={s.analysisValue}>{analysis.sum}</div>
                <div className={s.analysisHint}>역대 평균 ≈ 138</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>평균</div>
                <div className={s.analysisValue}>{analysis.avg.toFixed(1)}</div>
                <div className={s.analysisHint}>이론값 23</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>홀짝</div>
                <div className={s.analysisValue}>{analysis.oddCount}:{analysis.evenCount}</div>
                <div className={s.analysisHint}>역대 평균 3:3</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>저고 (1~22 / 23~45)</div>
                <div className={s.analysisValue}>{analysis.lowCount}:{analysis.highCount}</div>
                <div className={s.analysisHint}>역대 평균 3:3</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>소수 개수</div>
                <div className={s.analysisValue}>{analysis.primeCount}</div>
                <div className={s.analysisHint}>2,3,5,7,11... 14개 중</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>3의 배수</div>
                <div className={s.analysisValue}>{analysis.multipleOf3Count}</div>
                <div className={s.analysisHint}>3,6,9... 15개 중</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>연속 쌍</div>
                <div className={s.analysisValue}>{analysis.consecutivePairs}</div>
                <div className={s.analysisHint}>인접 번호 쌍</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>같은 끝자리 (최대)</div>
                <div className={s.analysisValue}>{analysis.sameTailMax}</div>
                <div className={s.analysisHint}>가장 많이 겹친 끝자리</div>
              </div>
              <div className={s.analysisCard}>
                <div className={s.analysisLabel}>평균 간격</div>
                <div className={s.analysisValue}>{analysis.intervalAvg.toFixed(1)}</div>
                <div className={s.analysisHint}>이론 평균 7.5</div>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>구간 분포</label>
            <div className={s.rangeBars}>
              {NUMBER_RANGES.map(r => {
                const c = analysis.rangeDistribution[r.id] ?? 0
                return (
                  <div key={r.id} className={s.rangeRow}>
                    <span>{r.name}</span>
                    <span className={s.rangeBarTrack}>
                      <span className={s.rangeBarFill}
                        style={{ width: `${(c / 6) * 100}%`, background: r.color }} />
                    </span>
                    <span>{c}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>패턴 해석</label>
            <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.85, fontFamily: 'Noto Sans KR, sans-serif', marginBottom: 10 }}>
              {interpretAnalysis(analysis)}
            </p>
            <div className={s.warningBox}>
              <strong>⚠️ 통계 학습 목적</strong>입니다. 위 패턴은 통계적 분류일 뿐 <strong>당첨 확률에는 영향이 없습니다.</strong> 모든 6개 번호 조합의 1등 확률은 1/8,145,060로 동일합니다.
            </div>
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3 — 확률 시뮬레이터 ═════════════════════════════════════════ */
function SimulatorTab() {
  const [nums, setNums] = useState<(number | '')[]>(['', '', '', '', '', ''])
  const [drawCount, setDrawCount] = useState(10000)
  const [result, setResult] = useState<SimResult | null>(null)
  const [running, setRunning] = useState(false)

  const updateNum = (i: number, v: string) => {
    if (v === '') {
      setNums(prev => prev.map((p, j) => j === i ? '' : p))
      return
    }
    const n = parseInt(v)
    if (!Number.isFinite(n) || n < 1 || n > 45) return
    setNums(prev => prev.map((p, j) => j === i ? n : p))
  }

  const valid = nums.filter((n): n is number => typeof n === 'number') as number[]
  const dedup = [...new Set(valid)]
  const ready = dedup.length === 6

  const handleSim = () => {
    if (!ready) return
    setRunning(true)
    // setTimeout으로 UI 블로킹 회피
    setTimeout(() => {
      setResult(simulateDraws(dedup, drawCount))
      setRunning(false)
    }, 50)
  }

  const fmtMoney = (n: number) => n.toLocaleString('ko-KR') + '원'

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          내 번호 6개
          <span className={s.cardLabelHint}>이 번호로 가상 추첨 반복</span>
        </label>
        <div className={s.numInputRow}>
          {nums.map((n, i) => (
            <input key={i} className={s.numInput} type="number" min={1} max={45}
              value={n === '' ? '' : n}
              onChange={e => updateNum(i, e.target.value)}
              placeholder="?" />
          ))}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>시뮬레이션 횟수</label>
        <div className={s.simInputRow}>
          {[100, 1000, 10000, 100000].map(n => (
            <button key={n}
              className={`${s.simBtn} ${drawCount === n ? s.simActive : ''}`}
              onClick={() => setDrawCount(n)}>
              {n.toLocaleString()}회
            </button>
          ))}
        </div>
      </div>

      <button className={s.bigGenerate} onClick={handleSim} disabled={!ready || running}>
        {running ? '시뮬레이션 중...' : `🎲 ${drawCount.toLocaleString()}회 가상 추첨`}
      </button>

      {!ready && (
        <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 4 }}>
          6개 번호를 모두 입력해야 시뮬레이션이 가능합니다.
        </p>
      )}

      {result && (
        <>
          <div className={s.simHero}>
            <div className={s.simHeroTitle}>{result.totalGames.toLocaleString()}회 가상 구매 결과</div>
            <div className={`${s.simHeroNum} ${result.netResult >= 0 ? s.simHeroProfit : s.simHeroLoss}`}>
              {result.netResult >= 0 ? '+' : ''}{result.netResult.toLocaleString()}원
            </div>
            <div className={s.simHeroBreakdown}>
              총 구매금액 <strong style={{ color: 'var(--text)' }}>{fmtMoney(result.totalCost)}</strong>
              {' / '}
              총 회수금 <strong style={{ color: 'var(--text)' }}>{fmtMoney(result.totalPrize)}</strong>
              <br />
              회수율 <strong style={{ color: result.returnRate >= 100 ? '#3EFF9B' : '#FF6B6B' }}>
                {result.returnRate.toFixed(1)}%
              </strong>
            </div>
          </div>

          <div className={s.card}>
            <label className={s.cardLabel}>등수별 당첨 횟수</label>
            <div className={s.simTable}>
              {[
                { grade: 1, label: '1등', match: '6개 일치', odds: '1/8,145,060', avgPrize: 25_00_000_000 },
                { grade: 2, label: '2등', match: '5개+보너스', odds: '1/1,357,510', avgPrize: 60_000_000 },
                { grade: 3, label: '3등', match: '5개 일치', odds: '1/35,724', avgPrize: 1_700_000 },
                { grade: 4, label: '4등', match: '4개 일치', odds: '1/733', avgPrize: 50_000 },
                { grade: 5, label: '5등', match: '3개 일치', odds: '1/45', avgPrize: 5_000 },
              ].map(row => {
                const count = result.prizeCounts[row.grade] ?? 0
                const total = count * row.avgPrize
                return (
                  <div key={row.grade} className={s.simRow}>
                    <span className={s.simRowGrade}>{row.label}</span>
                    <span className={s.simRowLabel}>{row.match}<small>{row.odds}</small></span>
                    <span className={count > 0 ? s.simRowVal + ' ' + s.simRowValProfit : s.simRowEmpty}>
                      {count}회 {count > 0 && `(${fmtMoney(total)})`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.warningBox}>
            <strong>⚠️ 시뮬레이션 결과 해석</strong> — 본 시뮬레이션은 무작위 추첨을 {result.totalGames.toLocaleString()}회 반복한 통계 결과이며, 실제 당첨을 예측하지 않습니다. 시뮬레이션 결과가 좋게 나와도 실제 구매 시 동일한 결과가 보장되지 않습니다. 1등 확률은 매 게임 1/8,145,060로 동일합니다.
            <br /><br />
            로또는 오락 목적으로 즐기시고, 무리한 구매는 자제하세요. 도박 의존 우려 시 <a href="tel:1336">한국도박문제예방치유원 1336</a>(24시간 무료) 상담받으실 수 있습니다.
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 4 — 1등 체감 ═════════════════════════════════════════ */
function JackpotTab() {
  const [weeklyGames, setWeeklyGames] = useState(5)
  const [startAge, setStartAge] = useState(30)
  const [result, setResult] = useState<FirstPrizeSimResult | null>(null)
  const [running, setRunning] = useState(false)

  const handleSim = () => {
    setRunning(true)
    setTimeout(() => {
      setResult(simulateUntilFirstPrize(weeklyGames, 1000, startAge))
      setRunning(false)
    }, 50)
  }

  // 수학적 평균 (확률의 기댓값)
  const avgGames = ODDS_FIRST_PRIZE
  const avgWeeks = avgGames / weeklyGames
  const avgYears = avgWeeks / 52
  const fmtMoney = (n: number) => n.toLocaleString('ko-KR') + '원'

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>
          주간 구매 게임 수
          <span className={s.cardLabelHint}>한 주에 사는 게임 수</span>
        </label>
        <div className={s.simInputRow}>
          {[1, 5, 10, 20, 50].map(n => (
            <button key={n}
              className={`${s.simBtn} ${weeklyGames === n ? s.simActive : ''}`}
              onClick={() => setWeeklyGames(n)}>
              {n}게임
            </button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>시작 나이 (선택)</label>
        <div className={s.fieldRow}>
          <input className={s.numberField} type="number" min={1} max={100}
            value={startAge} onChange={e => setStartAge(Math.max(1, Math.min(100, parseInt(e.target.value) || 30)))} />
          <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center', fontFamily: 'Noto Sans KR, sans-serif' }}>
            결과에 &quot;{startAge + Math.round(avgYears)}세에 1등&quot; 형식으로 표시
          </span>
        </div>
      </div>

      <button className={s.bigGenerate} onClick={handleSim} disabled={running}>
        {running ? '시뮬레이션 중...' : '🎯 1등까지 시뮬레이션'}
      </button>

      {/* 수학적 평균 안내 */}
      <div className={s.card}>
        <label className={s.cardLabel}>수학적 평균 (기댓값)</label>
        <div className={s.compareTable}>
          <div className={s.compareRow}>
            <span>매주 {weeklyGames}게임 × 1주</span>
            <span>{ODDS_FIRST_PRIZE.toLocaleString()}분의 1</span>
          </div>
          <div className={s.compareRow}>
            <span>1등까지 평균 게임 수</span>
            <span>{avgGames.toLocaleString()}회</span>
          </div>
          <div className={s.compareRow}>
            <span>1등까지 평균 주</span>
            <span>{Math.round(avgWeeks).toLocaleString()}주</span>
          </div>
          <div className={s.compareRow}>
            <span>1등까지 평균 연수</span>
            <span>{avgYears.toFixed(1)}년</span>
          </div>
          <div className={s.compareRow}>
            <span>총 구매금액 (평균)</span>
            <span>{fmtMoney(avgGames * PRICE_PER_GAME)}</span>
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
          ⓘ 수학적 평균은 확률의 기댓값이며, 실제 한 사람의 결과는 더 빠를 수도 더 늦을 수도 있습니다. 매주 사도 한 평생 1등을 못 볼 확률이 99% 이상입니다.
        </p>
      </div>

      {result && (
        <>
          <div className={s.jackpotHero}>
            <div className={s.jackpotEmoji}>{result.reached ? '🎉' : '🕰️'}</div>
            <div className={s.jackpotTitle}>
              {result.reached ? '1등까지 걸린 시간' : '1000년 동안 1등 X'}
            </div>
            <div className={s.jackpotYears}>
              {result.years.toFixed(1)}<span className={s.jackpotYearsUnit}>년</span>
            </div>
            <div className={s.jackpotMeta}>
              {result.reached
                ? <>매주 {weeklyGames}게임씩 <strong>{result.weeks.toLocaleString()}주</strong> 후 1등!</>
                : <>1000년 시뮬레이션에서도 1등이 나오지 않았습니다 (확률 1/{ODDS_FIRST_PRIZE.toLocaleString()})</>}
              <br />
              {result.reached && (
                <>당첨 시 나이: <span className={s.jackpotAge}>{result.ageImpact.toFixed(1)}세</span>
                  {' '}({startAge}세 시작)</>
              )}
            </div>
          </div>

          <div className={s.jackpotInfoGrid}>
            <div className={s.jackpotInfoBox}>
              <div className={s.jackpotInfoVal}>{result.totalGames.toLocaleString()}</div>
              <div className={s.jackpotInfoLbl}>총 구매 게임</div>
            </div>
            <div className={s.jackpotInfoBox}>
              <div className={s.jackpotInfoVal}>{fmtMoney(result.totalCost)}</div>
              <div className={s.jackpotInfoLbl}>총 구매금액</div>
            </div>
            <div className={s.jackpotInfoBox}>
              <div className={s.jackpotInfoVal}>{result.weeks.toLocaleString()}</div>
              <div className={s.jackpotInfoLbl}>주(週)</div>
            </div>
          </div>

          <div className={s.warningBox}>
            <strong>⚠️ 1등 체감 의미</strong> — 수학적으로 매주 {weeklyGames}게임씩 평균 <strong>{avgYears.toFixed(0)}년</strong>을 사야 1등 한 번 나오는 확률입니다. 실제로는 더 빠를 수도, 평생 못 볼 수도 있습니다.
            <br /><br />
            로또는 일확천금이 아닌 <strong>&quot;재미&quot;</strong>로 접근하시기를 권장합니다. 사용 예산을 미리 정하고 그 안에서만 즐기세요. 도박 의존 우려 시 <a href="tel:1336">한국도박문제예방치유원 1336</a>.
          </div>
        </>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 5 — 당첨금 세후 ═════════════════════════════════════════ */
function TaxTab() {
  const [grade, setGrade] = useState(1)
  const [gross, setGross] = useState(2_500_000_000)

  const result = useMemo(() => calcAfterTax(gross), [gross])
  const fmt = (n: number) => n.toLocaleString('ko-KR') + '원'

  const presets = [
    { grade: 1, prize: 2_500_000_000, label: '1등 평균 25억' },
    { grade: 1, prize: 3_000_000_000, label: '1등 30억' },
    { grade: 2, prize: 60_000_000,    label: '2등 평균 6,000만' },
    { grade: 3, prize: 1_700_000,     label: '3등 평균 170만' },
    { grade: 4, prize: 50_000,        label: '4등 5만원 (고정)' },
    { grade: 5, prize: 5_000,         label: '5등 5천원 (고정)' },
  ]

  return (
    <>
      <div className={s.card}>
        <label className={s.cardLabel}>당첨 등수 빠른 선택</label>
        <div className={s.modeGrid}>
          {presets.map((p, i) => (
            <button key={i}
              className={`${s.modeCard} ${grade === p.grade && gross === p.prize ? s.modeCardActive : ''}`}
              onClick={() => { setGrade(p.grade); setGross(p.prize) }}>
              <div className={s.modeCardEmoji}>{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][p.grade - 1]}</div>
              <div className={s.modeCardName}>{p.label}</div>
              <div className={s.modeCardDesc}>{fmt(p.prize)}</div>
            </button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>
          당첨금 (세전)
          <span className={s.cardLabelHint}>{fmt(gross)}</span>
        </label>
        <input className={s.numberField} type="number" min={0} step={1000}
          value={gross} onChange={e => setGross(Math.max(0, parseInt(e.target.value) || 0))} />
      </div>

      <div className={s.taxHero}>
        <div className={s.taxLabel}>세후 실수령액</div>
        <div className={s.taxNet}>
          {fmt(result.net).replace(/원$/, '')}<span className={s.taxNetUnit}>원</span>
        </div>
        <div className={s.taxRate}>
          실효세율 <strong style={{ color: '#FF6B6B' }}>{result.effectiveRate.toFixed(1)}%</strong>
          {' / '}세금 합계 <strong style={{ color: '#FF6B6B' }}>{fmt(result.totalTax)}</strong>
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>상세 계산</label>
        <div className={s.taxBreakdown}>
          <div className={s.taxRow}>
            <span>세전 당첨금</span>
            <span>{fmt(result.gross)}</span>
          </div>
          <div className={s.taxRow}>
            <span>비과세 구간 (200만원 이하)</span>
            <span>{fmt(result.exempt)}</span>
          </div>
          <div className={s.taxRow}>
            <span>22% 과세 (200만~3억 부분)</span>
            <span>{fmt(result.taxed22)}</span>
          </div>
          <div className={s.taxRow}>
            <span>33% 과세 (3억 초과 부분)</span>
            <span>{fmt(result.taxed33)}</span>
          </div>
          <div className={`${s.taxRow} ${s.taxRowTax}`}>
            <span>세금 합계</span>
            <span>− {fmt(result.totalTax)}</span>
          </div>
          <div className={`${s.taxRow} ${s.taxRowTotal}`}>
            <span>세후 실수령</span>
            <span>{fmt(result.net)}</span>
          </div>
        </div>
      </div>

      <div className={s.card}>
        <label className={s.cardLabel}>세금 적용 구간</label>
        <table className={s.taxTable}>
          <thead>
            <tr><th>구간</th><th>세율</th></tr>
          </thead>
          <tbody>
            <tr><td>200만원 이하</td><td>0% (비과세)</td></tr>
            <tr><td>200만원 ~ 3억원</td><td>22% (소득세 20% + 지방세 2%)</td></tr>
            <tr><td>3억원 초과 부분</td><td>33% (소득세 30% + 지방세 3%)</td></tr>
          </tbody>
        </table>
      </div>

      <div className={s.warningBox}>
        <strong>⚠️ 본 계산은 일반 기준 추정치입니다.</strong> 실제 세금은 다른 소득과의 합산 신고 방식·기타 공제에 따라 달라질 수 있으며, 1등 당첨 시 <strong>세무사·회계사 상담을 강력히 권장</strong>합니다. 또한 5등 5천원·4등 5만원은 실제로는 분리과세 면제 대상이지만, 본 도구는 200만원 기준으로 단순 계산합니다.
      </div>
    </>
  )
}
