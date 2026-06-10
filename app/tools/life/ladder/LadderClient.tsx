/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './ladder.module.css'
import {
  MAX_PARTICIPANTS, MIN_PARTICIPANTS, CHARACTER_EMOJIS,
  ANIMATION_SPEEDS, DIFFICULTIES,
  generateLadderNoSelf, traceDest, shuffleArray,
  segsToPathD, pathTotalLength,
  loadGames, saveGames, newId,
  type AnimSpeed, type Difficulty, type SavedGame, type PathSeg,
} from './ladderUtils'
import { LADDER_TEMPLATES, getTemplate } from './ladderTemplates'

/* ─── SVG 상수 ─── */
const SVG_W = 600
const PAD_X = 50
const ROW_H = 26

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function LadderClient() {
  /* 상태 — 입력 */
  const [names, setNames] = useState<string[]>(['김민수', '이지은', '박서준', '최수아'])
  const [results, setResults] = useState<string[]>(['커피 사기', '꽝', '꽝', '발표'])

  /* 옵션 */
  const [speed, setSpeed] = useState<AnimSpeed>('slow')
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')

  /* 사다리·게임 상태 */
  const [regenKey, setRegenKey] = useState(0)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [rungsVisible, setRungsVisible] = useState(false)   // 가로줄 공개 여부 (스포일러 방지)
  const [copied, setCopied] = useState(false)
  const [tableReady, setTableReady] = useState(false)        // 경로 애니메이션 후 결과표 노출 (긴장감)

  /* 카운트·행 수 */
  const count = names.length
  const rows = useMemo(() => {
    const diff = DIFFICULTIES.find(d => d.id === difficulty)!
    return Math.max(8, Math.ceil(count * diff.rowsMul))
  }, [count, difficulty])
  const svgH = rows * ROW_H
  const colW = (SVG_W - PAD_X * 2) / Math.max(1, count - 1)
  const colX = useCallback((i: number) => PAD_X + i * colW, [colW])

  /* 사다리 — 클라이언트에서만 생성 (Math.random hydration mismatch 방지)
     SSR·첫 렌더 시 빈 배열, mount 후 useEffect 로 가로줄 생성 */
  const [ladder, setLadder] = useState<boolean[][]>([])
  const pendingLadderRef = useRef<boolean[][] | null>(null)  // 저장된 게임 불러오기 시 그대로 복원
  useEffect(() => {
    if (pendingLadderRef.current) {
      setLadder(pendingLadderRef.current)
      pendingLadderRef.current = null
      return
    }
    const diff = DIFFICULTIES.find(d => d.id === difficulty)!
    // 시크릿 산타 등 이름=결과가 겹치면 자기 배정을 피해 생성 (안 겹치면 첫 시도 통과 → 일반 추첨 무영향)
    setLadder(generateLadderNoSelf(count, rows, diff.rungProb, names, results))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, rows, difficulty, regenKey])

  /* 인원 변경 시 결과 배열 길이 동기화 (단순 slice/pad with 빈 문자열) */
  useEffect(() => {
    if (results.length !== count) {
      const next = [...results]
      while (next.length < count) next.push('')
      setResults(next.slice(0, count))
    }
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps

  /* 인원 변경·셔플·새 가로줄 시 공개 상태 + 가로줄 모두 초기화 (스포일러 방지) */
  useEffect(() => {
    setRevealed(new Set())
    setRungsVisible(false)
  }, [count, regenKey, difficulty])

  /* 셋터들 */
  /* 입력을 수정하면 공개 결과를 닫는다 — 추첨 후 결과를 바꾼 것처럼 보이는 문제 방지 */
  const setName = (i: number, v: string) => {
    setNames(prev => prev.map((p, j) => j === i ? v : p))
    setRevealed(new Set()); setRungsVisible(false)
  }
  const setResult = (i: number, v: string) => {
    setResults(prev => prev.map((p, j) => j === i ? v : p))
    setRevealed(new Set()); setRungsVisible(false)
  }
  const addPerson = () => {
    if (count >= MAX_PARTICIPANTS) return
    setNames(prev => [...prev, `참가자${prev.length + 1}`])
    setResults(prev => [...prev, '꽝'])
  }
  const removePerson = () => {
    if (count <= MIN_PARTICIPANTS) return
    setNames(prev => prev.slice(0, -1))
    setResults(prev => prev.slice(0, -1))
  }
  const handleShuffle = () => {
    setNames(prev => shuffleArray(prev))
    setResults(prev => shuffleArray(prev))
    setRegenKey(k => k + 1)
    setRevealed(new Set())
  }

  /* 도착점 */
  const dests = useMemo<number[]>(() => {
    return Array.from({ length: count }, (_, i) => traceDest(ladder, i))
  }, [ladder, count])
  const arrivals = useMemo<number[]>(() => {
    const arr = Array(count).fill(-1)
    dests.forEach((dest, src) => { arr[dest] = src })
    return arr
  }, [dests, count])

  /* 시크릿 산타 등에서 본인↔본인 매칭 감지 (참가자 이름이 자신의 도착 결과와 같을 때) */
  const hasSelfMatch = useMemo(
    () => ladder.length > 0 && names.some((n, i) => n.trim() !== '' && n === results[dests[i]]),
    [ladder.length, names, results, dests],
  )

  /* 경로 세그먼트 (참가자 i 의 경로) */
  const getPathSegs = useCallback((startIdx: number): PathSeg[] => {
    const segs: PathSeg[] = []
    let pos = startIdx
    segs.push({ x1: colX(pos), y1: 0, x2: colX(pos), y2: ROW_H * 0.5 })
    for (let r = 0; r < ladder.length; r++) {
      const midY = r * ROW_H + ROW_H * 0.5
      const nextY = (r + 1) * ROW_H + ROW_H * 0.5
      if (pos < ladder[r].length && ladder[r][pos]) {
        segs.push({ x1: colX(pos), y1: midY, x2: colX(pos + 1), y2: midY })
        pos++
      } else if (pos > 0 && ladder[r][pos - 1]) {
        segs.push({ x1: colX(pos), y1: midY, x2: colX(pos - 1), y2: midY })
        pos--
      }
      if (r < ladder.length - 1) {
        segs.push({ x1: colX(pos), y1: midY, x2: colX(pos), y2: nextY })
      }
    }
    const lastMidY = (rows - 1) * ROW_H + ROW_H * 0.5
    segs.push({ x1: colX(pos), y1: lastMidY, x2: colX(pos), y2: svgH })
    return segs
  }, [ladder, colX, rows, svgH])

  const handleRevealAll = () => {
    setRungsVisible(true)
    setRevealed(new Set(Array.from({ length: count }, (_, i) => i)))
  }
  const handleHideAll = () => {
    setRevealed(new Set())
    setRungsVisible(false)   // 다시 가리기
  }
  const handleNewRungs = () => {
    setRegenKey(k => k + 1)
    setRevealed(new Set())
    setRungsVisible(false)
  }

  /* 🆕 새 게임 (초기화) — 명단·결과 기본값 + 새 사다리 + 모두 가리기 */
  const handleNewGame = () => {
    setNames(['김민수', '이지은', '박서준', '최수아'])
    setResults(['커피 사기', '꽝', '꽝', '발표'])
    setRegenKey(k => k + 1)
    setRevealed(new Set())
    setRungsVisible(false)
  }

  const handleClickPerson = (i: number) => {
    setRungsVisible(true)   // 한 명이라도 공개 시 가로줄 노출
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }
  const handleClickResult = (destIdx: number) => {
    const srcIdx = arrivals[destIdx]
    if (srcIdx < 0) return
    handleClickPerson(srcIdx)
  }

  const handleCopy = () => {
    const lines = names.map((n, i) => `${CHARACTER_EMOJIS[i % CHARACTER_EMOJIS.length]} ${n} → ${results[dests[i]] || '—'}`)
    const text = `🪜 사다리타기 결과 (${count}명)\n──────────────\n${lines.join('\n')}\n\n— youtil.kr 사다리타기`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const applyTemplate = (id: string) => {
    const t = getTemplate(id)
    if (!t) return
    const ps = t.participants.length > 0 ? t.participants : ['참가자1', '참가자2', '참가자3', '참가자4']
    const rs = t.results.length > 0 ? t.results : Array(ps.length).fill('꽝')
    setNames(ps)
    setResults(rs)
    setRegenKey(k => k + 1)
    setRevealed(new Set())
  }

  const speedDef = ANIMATION_SPEEDS.find(sp => sp.id === speed)!
  const allRevealed = revealed.size === count && count > 0

  /* 결과표는 경로 애니메이션이 끝난 뒤에 노출 (느림 2초 선택 시 긴장감 유지) */
  useEffect(() => {
    if (!allRevealed) { setTableReady(false); return }
    const t = setTimeout(() => setTableReady(true), speedDef.drawMs)
    return () => clearTimeout(t)
  }, [allRevealed, speedDef.drawMs])

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/travel-budget', label: '여행 예산' },
          { href: '/tools/life/lotto', label: '로또 번호 생성기' },
          { href: '/tools/life/dutch', label: '더치페이 계산기' }
        ]}
      >
        본 사다리타기는 Math.random() 기반 의사난수로 가로줄이 매번 새로 생성
      </Disclaimer>

      {/* ── 입력 ── */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          참가자 · 결과
          <span className={s.cardLabelHint}>{count}명 · 입력 즉시 사다리에 반영</span>
        </label>
        <div className={s.inputSection}>
          <div className={s.inputCol}>
            <div className={s.colHeader}>👥 참가자</div>
            {names.map((n, i) => (
              <div key={i} className={s.inputWithDot}>
                <span className={s.dot} title={`참가자 ${i + 1}`}>
                  {CHARACTER_EMOJIS[i % CHARACTER_EMOJIS.length]}
                </span>
                <input className={s.nameInput} type="text"
                  aria-label={`참가자 ${i + 1} 이름`}
                  value={n} onChange={e => setName(i, e.target.value)}
                  placeholder={`참가자${i + 1}`} maxLength={20} />
              </div>
            ))}
          </div>
          <div className={s.inputCol}>
            <div className={s.colHeader}>🎯 결과</div>
            {Array.from({ length: count }, (_, i) => (
              <input key={i} className={`${s.nameInput} ${s.resultInput}`} type="text"
                aria-label={`결과 ${i + 1}`}
                value={results[i] ?? ''}
                onChange={e => setResult(i, e.target.value)}
                placeholder={`결과${i + 1}`} maxLength={20} />
            ))}
          </div>
        </div>

        <div className={s.countRow} style={{ marginTop: 10 }}>
          <button className={s.countBtn} onClick={removePerson} disabled={count <= MIN_PARTICIPANTS}>− 줄이기</button>
          <span className={s.countNum}>{count}명</span>
          <button className={s.countBtn} onClick={addPerson} disabled={count >= MAX_PARTICIPANTS}>+ 늘리기</button>
          <button className={s.shuffleBtn} onClick={handleShuffle} title="참가자·결과 순서 무작위 + 새 사다리">
            🔀 순서 섞기
          </button>
        </div>
      </div>

      {/* ── 빠른 템플릿 ── */}
      <div className={s.card}>
        <label className={s.cardLabel}>
          빠른 시작 템플릿
          <span className={s.cardLabelHint}>한 번 클릭으로 명단·결과 채우기</span>
        </label>
        <div className={s.tplGrid}>
          {LADDER_TEMPLATES.map(t => (
            <button key={t.id} className={s.tplCard} onClick={() => applyTemplate(t.id)}>
              <div className={s.tplEmoji}>{t.icon}</div>
              <div className={s.tplName}>{t.name}</div>
              <div className={s.tplDesc}>{t.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 옵션 ── */}
      <div className={s.card}>
        <label className={s.cardLabel}>옵션</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <span className={s.subLabel}>애니메이션 속도</span>
            <div className={s.optionRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} role="group" aria-label="애니메이션 속도 선택">
              {ANIMATION_SPEEDS.map(sp => (
                <button key={sp.id}
                  type="button"
                  aria-pressed={speed === sp.id}
                  className={`${s.optionBtn} ${speed === sp.id ? s.optionActive : ''}`}
                  onClick={() => setSpeed(sp.id)}>
                  {sp.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={s.subLabel}>가로줄 난이도 (많을수록 결과가 더 섞임)</span>
            <div className={s.optionRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} role="group" aria-label="가로줄 난이도 선택">
              {DIFFICULTIES.map(d => (
                <button key={d.id}
                  type="button"
                  aria-pressed={difficulty === d.id}
                  className={`${s.optionBtn} ${difficulty === d.id ? s.optionActive : ''}`}
                  onClick={() => setDifficulty(d.id)}>
                  {d.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 사다리 (항상 표시) ── */}
      <div className={s.ladderBox}>
        {/* 참가자 행 (클릭으로 공개) */}
        <div className={s.nameRow} style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
          {names.map((name, i) => {
            const isOn = revealed.has(i)
            return (
              <button key={i}
                type="button"
                aria-pressed={isOn}
                className={`${s.nameTag} ${isOn ? s.nameTagOn : ''}`}
                onClick={() => handleClickPerson(i)}
                title={isOn ? '경로 숨기기' : '경로 보기'}>
                <span className={s.nameEmoji}>{CHARACTER_EMOJIS[i % CHARACTER_EMOJIS.length]}</span>
                <span className={s.nameLabel}>{name || `참가자${i + 1}`}</span>
              </button>
            )
          })}
        </div>

        <svg viewBox={`0 0 ${SVG_W} ${svgH}`} className={s.ladderSvg} aria-hidden="true">
          {/* 세로줄 */}
          {Array.from({ length: count }, (_, i) => (
            <line key={`v${i}`} className={s.baseLine}
              x1={colX(i)} y1={0} x2={colX(i)} y2={svgH}
              strokeWidth={2} />
          ))}
          {/* 가로줄 — 공개 전에는 숨김 (스포일러 방지) */}
          {rungsVisible && ladder.map((row, r) =>
            row.map((has, c) => has ? (
              <line key={`h${r}-${c}`} className={s.rungLine}
                x1={colX(c)} y1={r * ROW_H + ROW_H * 0.5}
                x2={colX(c + 1)} y2={r * ROW_H + ROW_H * 0.5}
                strokeWidth={2.5} />
            ) : null)
          )}
          {/* 공개된 경로 — stroke-dasharray 애니메이션 */}
          {Array.from(revealed).map(i => {
            const segs = getPathSegs(i)
            const len = pathTotalLength(segs)
            const d = segsToPathD(segs)
            const hue = (i * 360) / Math.max(1, count)
            const color = `hsl(${hue}, 75%, 62%)`
            return (
              <path key={`p${i}-${regenKey}`}
                className={s.pathLine}
                d={d}
                stroke={color}
                strokeWidth={4}
                style={{
                  strokeDasharray: len,
                  strokeDashoffset: len,
                  ['--draw-dur' as string]: `${speedDef.drawMs}ms`,
                }}
              />
            )
          })}
        </svg>

        {/* 결과 행 (클릭으로 공개) */}
        <div className={s.resultRow} style={{ gridTemplateColumns: `repeat(${count}, 1fr)` }}>
          {Array.from({ length: count }, (_, destIdx) => {
            const srcIdx = arrivals[destIdx]
            const isOn = srcIdx >= 0 && revealed.has(srcIdx)
            return (
              <button key={destIdx}
                type="button"
                aria-pressed={isOn}
                className={`${s.resultTag} ${isOn ? s.resultTagOn : ''}`}
                onClick={() => handleClickResult(destIdx)}
                title={isOn ? '경로 숨기기' : '경로 보기'}
                style={{ cursor: 'pointer', border: 'none' }}>
                {results[destIdx] || `결과${destIdx + 1}`}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 안내 + 시작 버튼 ── */}
      <div className={s.clickHint}>
        🙈 <strong>가로선은 공개 전까지 숨겨져 있어요</strong> (암산 스포일러 방지).
        한 번에 공개하거나, 이름·결과를 클릭해 한 명씩 공개하세요.
      </div>

      {hasSelfMatch && (
        <div style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.35)', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: 'var(--text)', lineHeight: 1.6 }}>
          🎁 <strong>시크릿 산타 주의</strong> — 자기 배정을 자동으로 피하려 했지만, 중복 이름 등으로 본인에게 배정된 사람이 남아 있어요. 참가자·결과 이름을 서로 다르게 하면 해결됩니다.
        </div>
      )}

      <div className={s.startBtnRow}>
        <button className={s.bigGenerate} onClick={handleRevealAll}
          disabled={count < MIN_PARTICIPANTS}>
          👥 한 번에 공개
        </button>
        <button className={s.startBtnSecondary} onClick={handleNewRungs}
          disabled={count < MIN_PARTICIPANTS}>
          🔄 가로선 새로 만들기
        </button>
        <button className={s.startBtnSecondary} onClick={handleNewGame}>
          🆕 새 게임 (초기화)
        </button>
      </div>

      {/* ── 전체 공개 + 애니메이션 종료 후 결과표 ── */}
      {allRevealed && tableReady && (
        <div className={s.card} role="status" aria-live="polite">
          <label className={s.cardLabel}>
            🎉 결과표
            <span className={s.cardLabelHint}>{count}명 모두 공개</span>
          </label>
          <div className={s.resultTable}>
            {names.map((n, i) => (
              <div key={i} className={s.resultTableRow}
                style={{ borderLeft: `4px solid hsl(${(i * 360) / Math.max(1, count)}, 75%, 62%)` }}>
                <span className={s.resultTableEmoji}>{CHARACTER_EMOJIS[i % CHARACTER_EMOJIS.length]}</span>
                <span className={s.resultTableName}>{n || `참가자${i + 1}`}</span>
                <span className={s.resultTableArrow}>→</span>
                <span className={s.resultTableValue}>{results[dests[i]] || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 결과 액션 ── */}
      {revealed.size > 0 && (
        <div className={s.resultActions}>
          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사됨' : '📋 결과 텍스트 복사'}
          </button>
          <button className={s.copyBtn} onClick={allRevealed ? handleHideAll : handleRevealAll}>
            {allRevealed ? '🙈 전체 숨기기' : '👁️ 전체 공개'}
          </button>
        </div>
      )}

      {/* ── 저장된 게임 ── */}
      <SavedGamesSection
        currentNames={names}
        currentResults={results}
        currentLadder={ladder}
        currentDifficulty={difficulty}
        onApply={(g) => {
          if (g.difficulty) setDifficulty(g.difficulty)
          // 저장된 가로줄이 있으면 그대로 복원 (없으면 새로 생성)
          pendingLadderRef.current = (g.ladder && g.ladder.length > 0) ? g.ladder : null
          setNames(g.participants)
          setResults(g.results)
          setRegenKey(k => k + 1)
          setRevealed(new Set())
          setRungsVisible(false)
        }}
      />
    </div>
  )
}

/* ═════════════════════════════════════════ 저장된 게임 ═════════════════════════════════════════ */
function SavedGamesSection({
  currentNames, currentResults, currentLadder, currentDifficulty, onApply,
}: {
  currentNames: string[]
  currentResults: string[]
  currentLadder: boolean[][]
  currentDifficulty: Difficulty
  onApply: (g: SavedGame) => void
}) {
  const [games, setGames] = useState<SavedGame[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { setGames(loadGames()); setLoaded(true) }, [])

  const handleSave = () => {
    if (!name.trim()) { alert('게임 이름을 입력해 주세요'); return }
    if (currentNames.length === 0) { alert('참가자가 없습니다'); return }
    const now = new Date().toISOString()
    const next = [...games, {
      id: newId(),
      name: name.trim(),
      participants: currentNames,
      results: currentResults,
      ladder: currentLadder,           // 가로줄·결과 그대로 저장 → 불러오면 동일 결과
      difficulty: currentDifficulty,
      createdAt: now,
      updatedAt: now,
    }].slice(-30)
    setGames(next)
    saveGames(next)
    setShowForm(false)
    setName('')
  }
  const handleDelete = (id: string) => {
    if (!confirm('이 게임을 삭제하시겠습니까?')) return
    const next = games.filter(g => g.id !== id)
    setGames(next)
    saveGames(next)
  }
  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ version: 1, games }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `youtil-ladder-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const obj = JSON.parse(e.target?.result as string)
        const list = Array.isArray(obj) ? obj : (Array.isArray(obj.games) ? obj.games : null)
        if (!list) { alert('잘못된 백업 파일입니다'); return }
        const valid = (list as unknown[]).filter((g) => {
          const x = g as SavedGame
          return x && typeof x.id === 'string'
            && Array.isArray(x.participants) && x.participants.length >= MIN_PARTICIPANTS && x.participants.length <= MAX_PARTICIPANTS
            && Array.isArray(x.results)
        }) as SavedGame[]
        if (valid.length === 0) { alert('가져올 수 있는 유효한 게임이 없습니다 (참가자 2~16명·결과 배열 필요).'); return }
        // 취소 = 중단(기존 데이터 유지), 확인 = 현재 목록에 추가
        if (!confirm(`백업에서 ${valid.length}개 게임을 현재 목록에 추가합니다. 계속할까요?`)) return
        const merged = [...games, ...valid.filter((g) => !games.some(x => x.id === g.id))].slice(-30)
        setGames(merged); saveGames(merged)
      } catch { alert('잘못된 백업 파일입니다') }
    }
    reader.readAsText(file)
  }

  if (!loaded) return null

  return (
    <div className={s.card}>
      <label className={s.cardLabel}>
        💾 저장된 게임
        <span className={s.cardLabelHint}>{games.length}/30 · 자주 쓰는 사다리 보관</span>
      </label>

      {!showForm && (
        <button className={s.actionBtn} onClick={() => setShowForm(true)}>
          + 현재 사다리 저장
        </button>
      )}

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          <input className={s.nameInput} type="text" placeholder="게임 이름 (예: 동아리 회식)"
            value={name} onChange={e => setName(e.target.value)} maxLength={30} />
          <div className={s.miniRow}>
            <button className={s.actionBtn} style={{ width: 'auto', flex: 1 }} onClick={handleSave}>저장</button>
            <button className={s.miniBtn} onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      {games.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
            {games.map(g => (
              <div key={g.id} className={s.savedRow}>
                <div className={s.savedName}>
                  {g.name}
                  <small>{g.participants.length}명 · {new Date(g.updatedAt).toLocaleDateString('ko-KR')}</small>
                </div>
                <div className={s.miniRow}>
                  <button className={s.miniBtn} onClick={() => onApply(g)}>불러오기</button>
                  <button className={`${s.miniBtn} ${s.miniDanger}`} onClick={() => handleDelete(g.id)}>×</button>
                </div>
              </div>
            ))}
          </div>
          <div className={s.miniRow} style={{ marginTop: 10 }}>
            <button className={s.miniBtn} onClick={handleExport}>📥 백업 다운로드</button>
            <button className={s.miniBtn} onClick={() => fileRef.current?.click()}>📤 가져오기</button>
            <input ref={fileRef} type="file" accept=".json" hidden
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f) }} />
          </div>
        </>
      )}
    </div>
  )
}
