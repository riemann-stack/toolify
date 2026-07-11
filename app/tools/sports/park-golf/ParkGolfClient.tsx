'use client'

import { useState, useMemo, useEffect } from 'react'
import Disclaimer from '@/components/Disclaimer'
import { todayStr } from '@/lib/date'
import {
  DEFAULT_PARS_9, MAX_PLAYERS, MAX_STROKES,
  scoreTerm, playerTotal, rankPlayers,
  loadRounds, saveRounds, type SavedRound,
} from './parkGolfData'
import s from './park-golf.module.css'

let nextId = 100

interface Player { id: number; name: string; scores: number[] }

const makeScores = (n: number) => Array.from({ length: n }, () => 0)

export default function ParkGolfClient() {
  const [holeCount, setHoleCount] = useState<9 | 18>(9)
  const [pars, setPars] = useState<number[]>([...DEFAULT_PARS_9, ...DEFAULT_PARS_9])
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: '나', scores: makeScores(18) },
    { id: 2, name: 'P2', scores: makeScores(18) },
  ])
  const [doubleParCut, setDoubleParCut] = useState(false)
  const [course, setCourse] = useState('')
  const [rounds, setRounds] = useState<SavedRound[]>([])
  const [mounted, setMounted] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => { setRounds(loadRounds()); setMounted(true) }, [])

  const activePars = pars.slice(0, holeCount)
  const totals = useMemo(
    () => players.map((p) => playerTotal(p.scores.slice(0, holeCount), activePars)),
    [players, holeCount, activePars],
  )
  const ranks = useMemo(() => rankPlayers(totals), [totals])
  const parTotal = activePars.reduce((a, b) => a + b, 0)

  const setScore = (pid: number, hole: number, next: number) => {
    const par = activePars[hole]
    let v = Math.max(0, Math.min(next, MAX_STROKES))
    if (doubleParCut && v > par * 2) v = par * 2
    setPlayers((prev) => prev.map((p) => (p.id === pid ? { ...p, scores: p.scores.map((sc, i) => (i === hole ? v : sc)) } : p)))
  }

  const setPar = (hole: number, delta: number) => {
    setPars((prev) => prev.map((p, i) => (i === hole ? Math.max(3, Math.min(5, p + delta)) : p)))
  }

  const setName = (pid: number, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === pid ? { ...p, name: name.slice(0, 8) } : p)))
  }

  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return
    setPlayers((prev) => [...prev, { id: ++nextId, name: `P${prev.length + 1}`, scores: makeScores(18) }])
  }
  const removePlayer = (pid: number) => {
    if (players.length <= 1) return
    setPlayers((prev) => prev.filter((p) => p.id !== pid))
  }

  const resetScores = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, scores: makeScores(18) })))
  }

  const saveRound = () => {
    const round: SavedRound = {
      id: `${Date.now()}`,
      date: todayStr(),
      course: course.trim() || '파크골프장',
      holeCount,
      pars: activePars,
      players: players.map((p) => ({ name: p.name || '플레이어', scores: p.scores.slice(0, holeCount) })),
    }
    const next = [round, ...rounds]
    setRounds(next)
    saveRounds(next)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1500)
  }

  const deleteRound = (id: string) => {
    const next = rounds.filter((r) => r.id !== id)
    setRounds(next)
    saveRounds(next)
  }

  const anyScore = totals.some((t) => t.holesPlayed > 0)

  return (
    <div className={s.wrap}>
      {/* 설정 */}
      <div className={s.card}>
        <div className={s.setupRow}>
          <div className={s.holeToggle} role="group" aria-label="홀 수 선택">
            {([9, 18] as const).map((h) => (
              <button key={h} type="button"
                className={`${s.holeBtn} ${holeCount === h ? s.on : ''}`}
                aria-pressed={holeCount === h}
                onClick={() => setHoleCount(h)}>
                {h}홀 (파{h === 9 ? 33 : 66})
              </button>
            ))}
          </div>
          <input className={s.courseInput} type="text" placeholder="구장 이름 (선택)"
            value={course} onChange={(e) => setCourse(e.target.value.slice(0, 20))}
            aria-label="구장 이름" />
        </div>
        <div className={s.optRow}>
          <button type="button" className={`${s.cutBtn} ${doubleParCut ? s.on : ''}`}
            aria-pressed={doubleParCut}
            onClick={() => setDoubleParCut((v) => !v)}>
            더블파 컷 (로컬룰) {doubleParCut ? 'ON' : 'OFF'}
          </button>
          <p className={s.optNote}>공식 규칙엔 최대 타수 제한이 없어요 — 진행 속도용 로컬룰 관행입니다.</p>
        </div>

        {/* 플레이어 */}
        <div className={s.playerRow}>
          {players.map((p, i) => (
            <span key={p.id} className={s.playerChip}>
              <input className={s.playerName} value={p.name} placeholder={`P${i + 1}`}
                onChange={(e) => setName(p.id, e.target.value)} aria-label={`${i + 1}번 플레이어 이름`} />
              <button type="button" className={s.playerDel} aria-label={`${p.name || `${i + 1}번`} 삭제`}
                onClick={() => removePlayer(p.id)} disabled={players.length <= 1}>✕</button>
            </span>
          ))}
          {players.length < MAX_PLAYERS && (
            <button type="button" className={s.addPlayer} onClick={addPlayer}>＋ 동반자</button>
          )}
        </div>
      </div>

      {/* 리더보드 */}
      <div className={s.resultCard} role="status">
        <p className={s.resultLabel}>{course.trim() || '오늘의 라운드'} · {holeCount}홀 파{parTotal}</p>
        {anyScore ? (
          <div className={s.board}>
            {players.map((p, i) => {
              const t = totals[i]
              const r = ranks[i]
              return (
                <div key={p.id} className={`${s.boardRow} ${r === 1 ? s.boardLead : ''}`}>
                  <span className={s.boardRank}>{r ? `${r}위` : '—'}</span>
                  <span className={s.boardName}>{p.name || `P${i + 1}`}</span>
                  <span className={s.boardScore}>{t.holesPlayed > 0 ? t.total : '—'}</span>
                  <span className={s.boardPar}>
                    {t.holesPlayed > 0 ? (t.toPar === 0 ? 'E' : t.toPar > 0 ? `+${t.toPar}` : t.toPar) : ''}
                    {holeCount === 18 && t.holesPlayed > 0 && <em className={s.boardSplit}> ({t.front}·{t.back})</em>}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className={s.emptyNote}>홀별 타수를 입력하면 합계·순위가 실시간으로 계산돼요. OB는 +2타를 더해 기록하세요.</p>
        )}
        <div className={s.actionRow}>
          <button type="button" className={s.saveBtn} onClick={saveRound} disabled={!anyScore}>
            {savedFlash ? '✓ 저장됨' : '💾 라운드 저장'}
          </button>
          <button type="button" className={s.resetBtn} onClick={resetScores} disabled={!anyScore}>스코어 초기화</button>
        </div>
      </div>

      {/* 스코어 그리드 */}
      <div className={s.card}>
        <p className={s.groupLabel}>홀별 스코어 — 탭해서 입력</p>
        <div className={s.tableScroll}>
          <table className={s.grid}>
            <thead>
              <tr>
                <th scope="col" className={s.holeCol}>홀</th>
                <th scope="col" className={s.parCol}>파</th>
                {players.map((p, i) => <th scope="col" key={p.id}>{p.name || `P${i + 1}`}</th>)}
              </tr>
            </thead>
            <tbody>
              {activePars.map((par, h) => (
                <tr key={h} className={h === 8 && holeCount === 18 ? s.frontEnd : undefined}>
                  <td className={s.holeCol}>{h + 1}</td>
                  <td className={s.parCol}>
                    <span className={s.parCell}>
                      <button type="button" className={s.parBtn} aria-label={`${h + 1}번 홀 파 낮추기`} onClick={() => setPar(h, -1)}>−</button>
                      <strong>{par}</strong>
                      <button type="button" className={s.parBtn} aria-label={`${h + 1}번 홀 파 높이기`} onClick={() => setPar(h, 1)}>＋</button>
                    </span>
                  </td>
                  {players.map((p) => {
                    const sc = p.scores[h]
                    const term = scoreTerm(sc, par)
                    return (
                      <td key={p.id}>
                        <span className={s.scoreCell}>
                          <button type="button" className={s.stepBtn}
                            aria-label={`${p.name} ${h + 1}번 홀 타수 줄이기`}
                            onClick={() => setScore(p.id, h, sc - 1)} disabled={sc <= 0}>−</button>
                          <span className={s.scoreNum} style={term ? { color: term.color } : undefined}>
                            {sc > 0 ? sc : '·'}
                          </span>
                          <button type="button" className={s.stepBtn}
                            aria-label={`${p.name} ${h + 1}번 홀 타수 늘리기`}
                            onClick={() => setScore(p.id, h, sc > 0 ? sc + 1 : par)}>＋</button>
                        </span>
                        {term && <span className={s.termTag} style={{ color: term.color }}>{term.label}</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.groupNote}>
          ＋를 처음 누르면 파 타수부터 시작해요. OB가 나면 2벌타 — 해당 홀 타수에 +2를 더해 기록하세요 (예: 티샷 OB 후 4타째로 컵인 = 총 4타).
        </p>
      </div>

      {/* 저장된 라운드 */}
      {mounted && rounds.length > 0 && (
        <div className={s.card}>
          <p className={s.groupLabel}>📒 저장된 라운드 ({rounds.length})</p>
          <ul className={s.roundList}>
            {rounds.map((r) => {
              const best = r.players
                .map((p) => ({ name: p.name, t: playerTotal(p.scores, r.pars) }))
                .filter((x) => x.t.holesPlayed > 0)
                .sort((a, b) => a.t.total - b.t.total)[0]
              return (
                <li key={r.id} className={s.roundItem}>
                  <span className={s.roundDate}>{r.date}</span>
                  <span className={s.roundInfo}>
                    {r.course} · {r.holeCount}홀 · {r.players.length}명
                    {best && <> · 베스트 {best.name} {best.t.total}타</>}
                  </span>
                  <button type="button" className={s.roundDel} aria-label={`${r.date} ${r.course} 라운드 삭제`}
                    onClick={() => deleteRound(r.id)}>삭제</button>
                </li>
              )
            })}
          </ul>
          <p className={s.groupNote}>이 브라우저에만 저장돼요 (최근 30개).</p>
        </div>
      )}

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/sports/golf-handicap', label: '골프 핸디캡 계산기' },
          { href: '/tools/sports/golf-distance', label: '골프 거리 계산기' },
          { href: '/tools/sports/hiking-time', label: '등산 시간 계산기' },
        ]}
        sources={[
          { label: '대한파크골프협회 경기규칙', href: 'https://www.kpga7330.com' },
        ]}
      >
        파 구성·벌타 처리는 대한파크골프협회 경기규칙 기준이며, 구장·대회별 로컬룰이 우선할 수 있습니다. 공식 대회 기록은 대회 규정과 경기위원 판정을 따르세요.
      </Disclaimer>
    </div>
  )
}
