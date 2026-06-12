/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import s from './stock-decision.module.css'
import {
  CHECKLIST, DIRECTION_LABEL, MODE_META, BIASES, CASES,
  diagnose, loadHistory, saveHistory, todayKST,
  type Direction, type RandomMode, type DiagnoseHistory,
} from './stockDecisionUtils'

type TabKey = 'diagnose' | 'random' | 'learn'

const DEFAULT_OPTIONS = ['🟢 BUY', '🟡 HOLD', '🔴 SELL']

// 옵션별 시각 색상 (BUY/HOLD/SELL 자동 매핑 + 폴백)
const SLICE_COLORS = ['#059669', '#FFD93E', '#DC2626', '#0891B2', '#0EA5E9', '#EA580C', '#B885DA', '#0D9488']

function colorFor(option: string, idx: number): string {
  if (option.includes('BUY') || option.includes('매수')) return '#059669'
  if (option.includes('SELL') || option.includes('매도')) return '#DC2626'
  if (option.includes('HOLD') || option.includes('보유')) return '#FFD93E'
  return SLICE_COLORS[idx % SLICE_COLORS.length]
}

// 극좌표 → CSS 위치 (conic-gradient 기준: 0deg = 12시, 시계방향)
function polarPos(angleDeg: number, radius: number): React.CSSProperties {
  const rad = (angleDeg * Math.PI) / 180
  const x = Math.sin(rad) * radius
  const y = -Math.cos(rad) * radius
  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`,
    transform: 'translate(-50%, -50%)',
  }
}

function uid(): string { return Math.random().toString(36).slice(2, 10) }

export default function StockDecisionClient() {
  const [tab, setTab] = useState<TabKey>('diagnose')

  // 자가진단
  const [direction, setDirection] = useState<Direction>('buy')
  const [stockName, setStockName] = useState('')   // 사용자만 보는 메모, 저장 X
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [showResult, setShowResult] = useState(false)

  // 무작위 모드
  const [mode, setMode] = useState<RandomMode>('chinchilla')
  const [options, setOptions] = useState<string[]>(DEFAULT_OPTIONS)
  const [optDraft, setOptDraft] = useState('')
  const [running, setRunning] = useState(false)
  const [pickedIdx, setPickedIdx] = useState<number | null>(null)
  const runIdRef = useRef(0)

  // 5개 모드 결과 종합 (모드별 최신 1회)
  const [modeResults, setModeResults] = useState<Partial<Record<RandomMode, string>>>({})
  const summary = useMemo(() => {
    const tally = new Map<string, number>()
    for (const v of Object.values(modeResults)) {
      if (v) tally.set(v, (tally.get(v) ?? 0) + 1)
    }
    const sorted = Array.from(tally.entries()).sort((a, b) => b[1] - a[1])
    const total = sorted.reduce((s, [, n]) => s + n, 0)
    const winner = sorted.length > 0 && (sorted.length === 1 || sorted[0][1] > sorted[1][1])
      ? sorted[0][0] : null
    return { tally: sorted, total, winner }
  }, [modeResults])

  // 기록 (점수만 저장 — 종목명·매수가 X)
  const [history, setHistory] = useState<DiagnoseHistory[]>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setHistory(loadHistory()); setMounted(true) }, [])
  useEffect(() => { if (mounted) saveHistory(history) }, [history, mounted])

  const items = CHECKLIST[direction]
  const result = useMemo(
    () => showResult ? diagnose(direction, Array.from(checked)) : null,
    [direction, checked, showResult],
  )

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
    setShowResult(false)
  }

  const runDiagnose = () => {
    setShowResult(true)
    const r = diagnose(direction, Array.from(checked))
    setHistory((p) => [{
      id: uid(),
      date: todayKST(),
      direction: r.direction,
      band: r.band,
      riskScore: r.riskScore,
      rationalScore: r.rationalScore,
    }, ...p])
  }

  const resetDiagnose = () => { setChecked(new Set()); setShowResult(false) }

  // ── 옵션 관리 ─────────────────────
  const clearAllResults = () => {
    setModeResults({})
    setPickedIdx(null)
  }
  const addOption = () => {
    if (!optDraft.trim() || options.length >= 8) return
    setOptions((p) => [...p, optDraft.trim()])
    setOptDraft('')
    clearAllResults()
  }
  const removeOption = (idx: number) => {
    setOptions((p) => p.filter((_, i) => i !== idx))
    clearAllResults()
  }
  const resetOptions = () => {
    setOptions(DEFAULT_OPTIONS)
    clearAllResults()
  }

  // ── 무작위 실행 ───────────────────
  const runRandom = () => {
    if (running || options.length === 0) return
    setRunning(true)
    setPickedIdx(null)
    const id = ++runIdRef.current
    const idx = Math.floor(Math.random() * options.length)
    // 모드별 애니메이션 길이
    const dur: Record<RandomMode, number> = {
      coin: 2200, chinchilla: 4500, dart: 1800, cat: 3200, roulette: 4000,
    }
    setTimeout(() => {
      if (runIdRef.current !== id) return
      setPickedIdx(idx)
      setRunning(false)
      // 종합 결과에 등록
      setModeResults((prev) => ({ ...prev, [mode]: options[idx] }))
    }, dur[mode])
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
      >
        본 도구는 <strong>투자 의사결정 심리 점검용</strong>이며, 특정 종목·증권사 추천 X · 주가 예측 X · 투자 권유 X 입니다. 자가진단·결정 보조 결과 모두 <strong>본인 판단을 돕는 참고용</strong>일 뿐, 그대로 따르라는 권고가 아니며 모든 책임은 본인에게 있습니다. 종목 정보 검색·DB 보유 X, 입력한 종목명은 화면에만 표시되고 서버·localStorage에 저장되지 않습니다.
      </Disclaimer>

      {/* 헤더 마스코트 */}
      <div className={s.mascotHeader}>
        <div className={s.mascotImgWrap}>
          <Image src="/images/stock-decision/chinchilla-face.png" alt="친칠라 마스코트"
            fill sizes="80px" className={s.mascotImg} priority />
        </div>
        <div className={s.mascotText}>
          <p className={s.mascotTitle}>매수·매도 결정이 망설여지나요?</p>
          <p className={s.mascotSub}><strong>자가진단</strong>으로 감정·편향 신호를 먼저 점검하세요. 결정 보조(무작위)는 본심을 끌어내는 보조 장치일 뿐, 결과를 그대로 따르는 게 아닙니다.</p>
        </div>
      </div>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs3}`} role="tablist" aria-label="주식 결정 도구 모드">
        <button type="button" role="tab" aria-selected={tab === 'diagnose'} className={`${s.tab} ${tab === 'diagnose' ? s.tabActive : ''}`} onClick={() => setTab('diagnose')}>
          🧠 자가진단
        </button>
        <button type="button" role="tab" aria-selected={tab === 'random'} className={`${s.tab} ${tab === 'random' ? s.tabActive : ''}`} onClick={() => setTab('random')}>
          🎲 결정 보조
        </button>
        <button type="button" role="tab" aria-selected={tab === 'learn'} className={`${s.tab} ${tab === 'learn' ? s.tabActive : ''}`} onClick={() => setTab('learn')}>
          📚 왜 지는가
        </button>
      </div>

      {/* ══════════ TAB 1: 자가진단 ══════════ */}
      {tab === 'diagnose' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel} id="dir-label">① 무엇을 망설이고 있나요?</span>
            <div className={s.dirRow} role="group" aria-labelledby="dir-label">
              {(['buy', 'sell', 'hold'] as Direction[]).map((d) => (
                <button key={d} type="button" aria-pressed={direction === d}
                  className={`${s.dirBtn} ${direction === d ? s.dirBtnActive : ''}`}
                  onClick={() => { setDirection(d); resetDiagnose() }}>
                  {DIRECTION_LABEL[d]}
                </button>
              ))}
            </div>
            <div className={s.field} style={{ marginTop: 14, marginBottom: 0 }}>
              <label className={s.fieldLabel} htmlFor="stock-decision-memo">종목명 (선택 · 본인만 보는 메모 · 저장 X)</label>
              <input id="stock-decision-memo" type="text" maxLength={20} className={s.input}
                placeholder="예: ABC전자"
                value={stockName} onChange={(e) => setStockName(e.target.value)} />
              <p className={s.fieldHint}>⚠️ 종목 정보 검색·추천 X. 본인 판단 보조용 메모만.</p>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>② 솔직히 체크해주세요 ({items.length}개 중 {checked.size}개)</span>
            <div className={s.checklistWrap}>
              {items.map((it) => {
                const isChecked = checked.has(it.id)
                return (
                  <label key={it.id}
                    className={`${s.checkItem} ${isChecked ? (it.isRiskSignal ? s.checkItemRisk : s.checkItemGood) : ''}`}>
                    <input type="checkbox" checked={isChecked} onChange={() => toggleCheck(it.id)} />
                    <span className={s.checkLabel}>{it.label}</span>
                    {it.bias && (
                      <span className={s.checkBiasTag}>{it.bias}</span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>

          <div className={s.card}>
            <button className={s.runBtn} onClick={runDiagnose} disabled={checked.size === 0}>
              🧠 자가진단 결과 보기
            </button>
            {showResult && (
              <button className={s.resetBtn} onClick={resetDiagnose}>다시 체크</button>
            )}
          </div>

          {result && (
            <div className={`${s.resultCard} ${s[`band_${result.band}`]}`}>
              <p className={s.resultTitle}>{result.title}</p>
              <p className={s.resultMessage}>{result.message}</p>
              <div className={s.scoreRow}>
                <div className={s.scoreCol}>
                  <span className={s.scoreLabel}>위험 신호</span>
                  <span className={s.scoreVal} style={{ color: '#DC2626' }}>{result.riskScore}</span>
                </div>
                <div className={s.scoreCol}>
                  <span className={s.scoreLabel}>이성 신호</span>
                  <span className={s.scoreVal} style={{ color: '#059669' }}>{result.rationalScore}</span>
                </div>
                <div className={s.scoreCol}>
                  <span className={s.scoreLabel}>총 체크</span>
                  <span className={s.scoreVal} style={{ color: 'var(--text)' }}>{result.total}</span>
                </div>
              </div>
              {result.criticalSignals.length > 0 && (
                <div className={s.criticalBox}>
                  <p className={s.criticalTitle}>🚨 고위험 신호 감지 — 결과를 강제로 높였습니다</p>
                  <ul className={s.criticalList}>
                    {result.criticalSignals.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <p className={s.criticalNote}>위 항목은 이성 신호를 함께 체크해도 상쇄되지 않습니다. 특히 대출·신용 매수는 손실이 원금을 넘을 수 있어 별도 점검이 필요합니다.</p>
                </div>
              )}
              {result.triggeredBiases.length > 0 && (
                <div className={s.biasBoxes}>
                  <p className={s.biasBoxesTitle}>🚨 감지된 편향</p>
                  <div className={s.biasChips}>
                    {result.triggeredBiases.map((b) => (
                      <span key={b} className={s.biasChip}>{b}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className={s.resultDisclaimer}>
                ⚠️ 본 점수는 본인 판단 보조용. 매수/매도 권유 X. 모든 책임은 본인에게.
              </p>
            </div>
          )}

          {mounted && history.length > 0 && (
            <div className={s.card}>
              <span className={s.cardLabel}>📊 자가진단 기록 (최근 {Math.min(10, history.length)}건 · 점수만 저장)</span>
              <div className={s.historyList}>
                {history.slice(0, 10).map((h) => (
                  <div key={h.id} className={`${s.historyItem} ${s[`band_${h.band}`]}`}>
                    <span className={s.histDate}>{h.date}</span>
                    <span className={s.histDir}>{DIRECTION_LABEL[h.direction]}</span>
                    <span className={s.histScore}>위험 {h.riskScore} · 이성 {h.rationalScore}</span>
                  </div>
                ))}
              </div>
              <button className={s.resetBtn}
                onClick={() => { if (confirm('모든 기록을 삭제하시겠습니까?')) setHistory([]) }}>
                전체 기록 삭제
              </button>
            </div>
          )}
        </>
      )}

      {/* ══════════ TAB 2: 결정 보조 ══════════ */}
      {tab === 'random' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel} id="mode-label">① 무작위 모드 선택</span>
            <div className={s.modeGrid} role="group" aria-labelledby="mode-label">
              {(Object.keys(MODE_META) as RandomMode[]).map((m) => (
                <button key={m} type="button" aria-pressed={mode === m}
                  aria-label={MODE_META[m].label}
                  className={`${s.modeBtn} ${mode === m ? s.modeBtnActive : ''}`}
                  onClick={() => { setMode(m); setPickedIdx(null) }}>
                  <span className={s.modeEmoji}>{MODE_META[m].emoji}</span>
                  <span className={s.modeLabel}>{MODE_META[m].label}</span>
                </button>
              ))}
            </div>
            <p className={s.modeStory}>{MODE_META[mode].story}</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>② 옵션 ({options.length}개 · 최대 8개)</span>
            <div className={s.optList}>
              {options.map((o, i) => (
                <div key={i} className={s.optItem}>
                  <span className={s.optText}>{o}</span>
                  <button className={s.optRemove} onClick={() => removeOption(i)} aria-label="삭제">✕</button>
                </div>
              ))}
            </div>
            <div className={s.optAddRow}>
              <input type="text" maxLength={20} className={s.input}
                placeholder="옵션 추가 (예: 분할 매수, 50% 매도)"
                value={optDraft}
                onChange={(e) => setOptDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addOption() }}
                disabled={options.length >= 8} />
              <button className={s.optAddBtn} onClick={addOption} disabled={!optDraft.trim() || options.length >= 8}>+</button>
            </div>
            <button className={s.resetBtn} onClick={resetOptions}>기본값(BUY/SELL/HOLD)으로 초기화</button>
          </div>

          {/* 애니메이션 무대 */}
          <div className={s.card}>
            <span className={s.cardLabel}>③ {MODE_META[mode].emoji} {MODE_META[mode].label}</span>

            <div className={s.stage}>
              {mode === 'coin' && (
                <CoinStage running={running} pickedIdx={pickedIdx} options={options} />
              )}
              {mode === 'chinchilla' && (
                <ChinchillaStage running={running} pickedIdx={pickedIdx} options={options} />
              )}
              {mode === 'dart' && (
                <DartStage running={running} pickedIdx={pickedIdx} options={options} />
              )}
              {mode === 'cat' && (
                <CatPawStage running={running} pickedIdx={pickedIdx} options={options} />
              )}
              {mode === 'roulette' && (
                <RouletteStage running={running} pickedIdx={pickedIdx} options={options} />
              )}
            </div>

            <button className={s.runBtn} onClick={runRandom} disabled={running || options.length === 0}>
              {running ? '⏳ 진행 중...' : `🎬 ${MODE_META[mode].label} 시작`}
            </button>

            {pickedIdx !== null && !running && (
              <div className={s.pickedCard}>
                <p className={s.pickedLabel}>{MODE_META[mode].emoji} {MODE_META[mode].label}의 선택</p>
                <p className={s.pickedValue}>{options[pickedIdx]}</p>
                <p className={s.pickedThink}>
                  ⏰ 5초 멈춤 — 이 결과를 봤을 때 드는 감정(안도·거부감)을 확인하세요. 결과대로 따르라는 뜻이 아니라, 본인 반응을 살피는 용도입니다.
                </p>
              </div>
            )}
          </div>

          {/* ── 5개 모드 종합 결과 ── */}
          {summary.total > 0 && (
            <div className={s.summaryCard}>
              <div className={s.summaryHead}>
                <span className={s.summaryTitle}>📊 5가지 모드 종합 ({summary.total}/5)</span>
                <button className={s.summaryReset} onClick={clearAllResults}>전체 초기화</button>
              </div>

              {/* 모드별 결과 한 줄씩 */}
              <div className={s.modeResultList}>
                {(Object.keys(MODE_META) as RandomMode[]).map((m) => {
                  const picked = modeResults[m]
                  return (
                    <div key={m} className={`${s.modeResultRow} ${picked ? s.modeResultRowDone : ''}`}>
                      <span className={s.modeResultEmoji}>{MODE_META[m].emoji}</span>
                      <span className={s.modeResultName}>{MODE_META[m].label}</span>
                      <span className={s.modeResultPick}>
                        {picked ? (
                          <strong style={{ color: colorFor(picked, 0) }}>{picked}</strong>
                        ) : (
                          <span className={s.modeResultPending}>⋯ 미실행</span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* 투표 집계 바 */}
              <div className={s.tallyWrap}>
                <p className={s.tallyTitle}>🗳️ 투표 집계</p>
                {summary.tally.map(([opt, cnt]) => {
                  const pct = (cnt / summary.total) * 100
                  const c = colorFor(opt, 0)
                  return (
                    <div key={opt} className={s.tallyRow}>
                      <span className={s.tallyOpt}>{opt}</span>
                      <div className={s.tallyBar}>
                        <div className={s.tallyFill}
                          style={{ width: `${pct}%`, background: c }} />
                      </div>
                      <span className={s.tallyCount} style={{ color: c }}>{cnt}표</span>
                    </div>
                  )
                })}
              </div>

              {/* 다수결 */}
              {summary.total >= 3 && summary.winner && (
                <div className={s.winnerBox} style={{ borderColor: colorFor(summary.winner, 0) }}>
                  <p className={s.winnerLabel}>📊 모드 결과 요약 ({summary.total}/5)</p>
                  <p className={s.winnerValue} style={{ color: colorFor(summary.winner, 0) }}>{summary.winner}</p>
                  {summary.total < 5 && (
                    <p className={s.winnerHint}>나머지 {5 - summary.total}개 모드도 돌려서 참고해보세요. (결정이 아닌 감정 확인용)</p>
                  )}
                </div>
              )}
              {summary.total >= 3 && !summary.winner && (
                <div className={s.winnerBox} style={{ borderColor: '#D97706' }}>
                  <p className={s.winnerLabel}>🤷 의견 분분</p>
                  <p className={s.winnerHint}>모드 결과가 갈렸습니다. 어느 쪽에 더 끌리는지 본인 감정을 확인해보세요 (결과는 참고용).</p>
                </div>
              )}
            </div>
          )}

          <div className={s.warnCard}>
            <strong>⚠️ 무작위 모드는 결정장애 해소 보조</strong>
            <p>
              본 결과는 재미·심리 보조 목적. 매수·매도 권유 X. 모든 결정의 책임은 본인에게.
              실제 투자 정보는 <a href="https://dart.fss.or.kr" target="_blank" rel="noopener" className={s.link}>DART 증권신고서</a>·본인 거래 증권사 안내 확인.
            </p>
          </div>
        </>
      )}

      {/* ══════════ TAB 3: 교육 ══════════ */}
      {tab === 'learn' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📊 왜 무작위가 종종 인간을 이기나</span>
            <p className={s.learnIntro}>
              무작위가 인간을 이기는 게 아닙니다. <strong>인간이 자기 자신(편향)을 이기지 못해서</strong>입니다.
              아래는 학계·언론에 보고된 대표 사례입니다 — 종목 추천이 아닌 <strong>의사결정 심리</strong> 교훈.
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🐭 5가지 사례</span>
            <p className={s.caseDisclaimer}>⚠️ 아래는 특정 시점의 일화·연구입니다. 재현이나 투자 성과를 보장하지 않으며, 연도·조건은 각 출처 원문에서 확인하세요.</p>
            <div className={s.caseList}>
              {CASES.map((c) => (
                <div key={c.key} className={s.caseItem}>
                  <div className={s.caseHead}>
                    <span className={s.caseTitle}>{c.title}</span>
                    <span className={s.caseYear}>{c.year}</span>
                  </div>
                  <p className={s.caseWho}>{c.who}</p>
                  <p className={s.caseResult}><strong>결과:</strong> {c.result}</p>
                  <p className={s.caseSource}>출처: {c.source}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🧠 자주 빠지는 7가지 편향</span>
            <div className={s.biasList}>
              {BIASES.map((b) => (
                <div key={b.key} className={s.biasItem}>
                  <p className={s.biasTitle}>{b.emoji} {b.name}</p>
                  <p className={s.biasDesc}>{b.desc}</p>
                  <p className={s.biasExample}><strong>예:</strong> {b.example}</p>
                  <p className={s.biasTip}><strong>💡 대처:</strong> {b.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 무작위 모드별 애니메이션 무대
// ─────────────────────────────────────────────────────────────

function CoinStage({ running, pickedIdx, options }: { running: boolean; pickedIdx: number | null; options: string[] }) {
  // 동전은 2면이지만 옵션이 3개 이상일 수 있음 → 착지 면에 실제 선택된 옵션을 표시
  // (패리티로 앞/뒤 면만 결정 — 시각적 변화용)
  const landed = pickedIdx !== null && !running
  const showHeads = pickedIdx === null || pickedIdx % 2 === 0
  const pickedText = pickedIdx !== null ? options[pickedIdx] : null
  const heads = landed && showHeads && pickedText !== null ? pickedText : (options[0] ?? '앞')
  const tails = landed && !showHeads && pickedText !== null ? pickedText : (options[1] ?? '뒤')
  return (
    <div className={s.coinScene}>
      <div className={`${s.coin} ${running ? s.coinSpin : ''} ${pickedIdx !== null ? (showHeads ? s.coinShowHeads : s.coinShowTails) : ''}`}>
        <div className={`${s.coinFace} ${s.coinHeads}`}>{heads}</div>
        <div className={`${s.coinFace} ${s.coinTails}`}>{tails}</div>
      </div>
    </div>
  )
}

function ChinchillaStage({ running, pickedIdx, options }: { running: boolean; pickedIdx: number | null; options: string[] }) {
  return (
    <div className={s.chinScene}>
      <div className={s.cubesRow}>
        {options.map((o, i) => (
          <div key={i}
            className={`${s.cube} ${pickedIdx === i && !running ? s.cubeChosen : ''} ${running && pickedIdx === null ? s.cubeIdle : ''}`}>
            {o}
          </div>
        ))}
      </div>
      <div className={`${s.chin} ${running ? s.chinScurry : ''} ${pickedIdx !== null && !running ? s.chinHappy : ''}`}>
        <Image src="/images/stock-decision/chinchilla-body.png" alt="친칠라"
          fill sizes="100px" className={s.chinImg} />
      </div>
    </div>
  )
}

function DartStage({ running, pickedIdx, options }: { running: boolean; pickedIdx: number | null; options: string[] }) {
  const N = options.length
  const sliceAngle = N > 0 ? 360 / N : 360

  // 단일 conic-gradient — 슬라이스가 선명한 단색 구획
  const background = useMemo(() => {
    if (N === 0) return 'transparent'
    const stops = options.map((o, i) => {
      const a1 = i * sliceAngle
      const a2 = (i + 1) * sliceAngle
      const c = colorFor(o, i)
      const isPicked = pickedIdx === i && !running
      // 선택된 슬라이스는 더 밝게
      return `${isPicked ? c : c + 'CC'} ${a1}deg ${a2}deg`
    }).join(', ')
    return `conic-gradient(from 0deg, ${stops})`
  }, [options, sliceAngle, pickedIdx, running, N])

  // 선택된 슬라이스 중심 각도 (12시 기준 시계방향)
  const pickedCenterDeg = pickedIdx !== null ? (pickedIdx + 0.5) * sliceAngle : 0

  return (
    <div className={s.dartScene}>
      <div className={s.dartBoard} style={{ background }}>
        {/* 슬라이스 경계선 */}
        {options.map((_, i) => {
          const a = i * sliceAngle
          return (
            <div key={`div-${i}`} className={s.dartDivider}
              style={{ transform: `rotate(${a}deg)` }} />
          )
        })}
        {/* 텍스트 레이블 (각 슬라이스 중심) */}
        {options.map((o, i) => {
          const center = (i + 0.5) * sliceAngle
          const isPicked = pickedIdx === i && !running
          return (
            <span key={`lbl-${i}`}
              className={`${s.dartLabel} ${isPicked ? s.dartLabelPicked : ''}`}
              style={polarPos(center, 60)}>
              {o}
            </span>
          )
        })}
        <div className={s.dartCenter} />
      </div>
      <div className={`${s.dart} ${running ? s.dartFly : ''} ${pickedIdx !== null && !running ? s.dartStuck : ''}`}
        style={pickedIdx !== null && !running
          ? { transform: `translate(-50%, -50%) rotate(${pickedCenterDeg}deg) translateY(-55px)` }
          : undefined}>
        🎯
      </div>
    </div>
  )
}

function CatPawStage({ running, pickedIdx, options }: { running: boolean; pickedIdx: number | null; options: string[] }) {
  return (
    <div className={s.catScene}>
      <div className={s.catOptionsRow}>
        {options.map((o, i) => (
          <div key={i}
            className={`${s.catCube} ${pickedIdx === i && !running ? s.catCubeChosen : ''}`}>
            {o}
          </div>
        ))}
      </div>
      <div className={`${s.paw} ${running ? s.pawWiggle : ''} ${pickedIdx !== null && !running ? s.pawTap : ''}`}
        style={pickedIdx !== null && !running ? { left: `${(pickedIdx + 0.5) * (100 / options.length)}%` } : undefined}>
        <Image src="/images/stock-decision/cat-paw.png" alt="고양이 발"
          fill sizes="70px" className={s.pawImg} />
      </div>
    </div>
  )
}

function RouletteStage({ running, pickedIdx, options }: { running: boolean; pickedIdx: number | null; options: string[] }) {
  const N = options.length
  const sliceAngle = N > 0 ? 360 / N : 360

  // 단일 conic-gradient — 선명한 단색 구획
  const background = useMemo(() => {
    if (N === 0) return 'transparent'
    const stops = options.map((o, i) => {
      const a1 = i * sliceAngle
      const a2 = (i + 1) * sliceAngle
      const c = colorFor(o, i)
      return `${c}E6 ${a1}deg ${a2}deg`  // E6 = 90% 불투명도
    }).join(', ')
    return `conic-gradient(from 0deg, ${stops})`
  }, [options, sliceAngle, N])

  // 회전 각도 (포인터=12시·0deg에 picked가 오도록)
  const targetAngle = pickedIdx !== null
    ? -((pickedIdx + 0.5) * sliceAngle) - 360 * 5
    : 0

  return (
    <div className={s.rouletteScene}>
      <div className={s.roulettePointer}>▼</div>
      <div className={`${s.rouletteWheel} ${running ? s.rouletteSpin : ''}`}
        style={{
          background,
          transform: pickedIdx !== null && !running ? `rotate(${targetAngle}deg)` : undefined,
          transition: pickedIdx !== null && !running ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.21, 0.99)' : undefined,
        }}>
        {/* 슬라이스 경계선 */}
        {options.map((_, i) => {
          const a = i * sliceAngle
          return (
            <div key={`div-${i}`} className={s.rouletteDivider}
              style={{ transform: `rotate(${a}deg)` }} />
          )
        })}
        {/* 슬라이스별 레이블 (휠과 함께 회전) */}
        {options.map((o, i) => {
          const center = (i + 0.5) * sliceAngle
          return (
            <span key={`lbl-${i}`} className={s.rouletteLabel}
              style={polarPos(center, 75)}>
              {o}
            </span>
          )
        })}
        <div className={s.rouletteCenter} />
      </div>
    </div>
  )
}

