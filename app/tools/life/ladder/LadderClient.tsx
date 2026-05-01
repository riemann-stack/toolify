/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import s from './ladder.module.css'
import {
  MAX_PARTICIPANTS, MIN_PARTICIPANTS, CHARACTER_EMOJIS,
  ANIMATION_SPEEDS, DIFFICULTIES,
  generateLadder, traceDest, shuffleArray,
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
  const [copied, setCopied] = useState(false)

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
  useEffect(() => {
    const diff = DIFFICULTIES.find(d => d.id === difficulty)!
    setLadder(generateLadder(count, rows, diff.rungProb))
  }, [count, rows, difficulty, regenKey])

  /* 인원 변경 시 결과 배열 길이 동기화 (단순 slice/pad with 빈 문자열) */
  useEffect(() => {
    if (results.length !== count) {
      const next = [...results]
      while (next.length < count) next.push('')
      setResults(next.slice(0, count))
    }
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps

  /* 인원 변경·셔플·새 가로줄 시 공개 상태 초기화 */
  useEffect(() => {
    setRevealed(new Set())
  }, [count, regenKey, difficulty])

  /* 셋터들 */
  const setName = (i: number, v: string) => {
    setNames(prev => prev.map((p, j) => j === i ? v : p))
  }
  const setResult = (i: number, v: string) => {
    setResults(prev => prev.map((p, j) => j === i ? v : p))
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
    setRevealed(new Set(Array.from({ length: count }, (_, i) => i)))
  }
  const handleHideAll = () => setRevealed(new Set())
  const handleNewRungs = () => {
    setRegenKey(k => k + 1)
    setRevealed(new Set())
  }

  const handleClickPerson = (i: number) => {
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

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        💡 <strong>본 사다리타기는 Math.random() 기반 의사난수로 가로줄이 매번 새로 생성</strong>되어 공정합니다. 캐릭터 이모지 16종, 참가자/결과 클릭으로 개별 공개, 빠른 시작 템플릿 6종을 제공합니다.
      </div>

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
                  value={n} onChange={e => setName(i, e.target.value)}
                  placeholder={`참가자${i + 1}`} maxLength={20} />
              </div>
            ))}
          </div>
          <div className={s.inputCol}>
            <div className={s.colHeader}>🎯 결과</div>
            {Array.from({ length: count }, (_, i) => (
              <input key={i} className={`${s.nameInput} ${s.resultInput}`} type="text"
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
            <div className={s.optionRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {ANIMATION_SPEEDS.map(sp => (
                <button key={sp.id}
                  className={`${s.optionBtn} ${speed === sp.id ? s.optionActive : ''}`}
                  onClick={() => setSpeed(sp.id)}>
                  {sp.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={s.subLabel}>가로줄 난이도 (많을수록 결과가 더 섞임)</span>
            <div className={s.optionRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {DIFFICULTIES.map(d => (
                <button key={d.id}
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
                className={`${s.nameTag} ${isOn ? s.nameTagOn : ''}`}
                onClick={() => handleClickPerson(i)}
                title={isOn ? '경로 숨기기' : '경로 보기'}>
                <span className={s.nameEmoji}>{CHARACTER_EMOJIS[i % CHARACTER_EMOJIS.length]}</span>
                <span className={s.nameLabel}>{name || `참가자${i + 1}`}</span>
              </button>
            )
          })}
        </div>

        <svg viewBox={`0 0 ${SVG_W} ${svgH}`} className={s.ladderSvg}>
          {/* 세로줄 */}
          {Array.from({ length: count }, (_, i) => (
            <line key={`v${i}`} className={s.baseLine}
              x1={colX(i)} y1={0} x2={colX(i)} y2={svgH}
              strokeWidth={2} />
          ))}
          {/* 가로줄 */}
          {ladder.map((row, r) =>
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

      {/* ── 안내 + 시작 버튼 2개 ── */}
      <div className={s.clickHint}>
        💡 <strong>이름이나 결과를 클릭하면 해당 경로만 공개</strong>됩니다. 원하는 사람부터 자유롭게 공개해 보세요.
      </div>

      <div className={s.startBtnRow}>
        <button className={s.bigGenerate} onClick={handleRevealAll}
          disabled={count < MIN_PARTICIPANTS}>
          👥 한 번에 공개
        </button>
        <button className={s.startBtnSecondary} onClick={handleNewRungs}
          disabled={count < MIN_PARTICIPANTS}>
          🔄 가로선 새로 만들기
        </button>
      </div>

      {/* ── 전체 공개 시 결과표 ── */}
      {allRevealed && (
        <div className={s.card}>
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
        onApply={(g) => {
          setNames(g.participants)
          setResults(g.results)
          setRegenKey(k => k + 1)
          setRevealed(new Set())
        }}
      />
    </div>
  )
}

/* ═════════════════════════════════════════ 저장된 게임 ═════════════════════════════════════════ */
function SavedGamesSection({
  currentNames, currentResults, onApply,
}: {
  currentNames: string[]
  currentResults: string[]
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
      createdAt: now,
      updatedAt: now,
    }]
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
        const valid = list.filter((g: unknown) => {
          const x = g as SavedGame
          return x && typeof x.id === 'string' && Array.isArray(x.participants)
        })
        if (!confirm(`${valid.length}개 게임을 가져옵니다. 기존 데이터에 추가? (취소 시 교체)`)) {
          setGames(valid); saveGames(valid); return
        }
        const merged = [...games, ...valid.filter((g: SavedGame) => !games.some(x => x.id === g.id))]
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
