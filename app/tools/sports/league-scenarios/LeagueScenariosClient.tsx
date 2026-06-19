/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import s from './league-scenarios.module.css'
import {
  calcScenarios, teamPoints, teamGD,
  type Team, type Match, type Outcome, type PlayedMatch, type SelfPath,
} from './scenarioCalc'
import {
  COMPETITIONS, getCompetition, CRITERION_LABEL,
} from './tiebreakers'

/* ── localStorage ── */
const LS_KEY = 'youtil:league-scenarios:state-v1'

interface SavedState {
  presetId: string
  teams: Team[]
  remaining: Match[]
  played: PlayedMatch[]
  advance: number
  focusId: string
}

const OUTCOMES: Outcome[] = ['home', 'draw', 'away']
const isOutcome = (v: unknown): v is Outcome => v === 'home' || v === 'draw' || v === 'away'

let _seq = 0
const newId = () => `t${Date.now().toString(36)}${(_seq++).toString(36)}`

function makeTeam(name: string): Team {
  return { id: newId(), name, win: 0, draw: 0, loss: 0, gf: 0, ga: 0 }
}

/* 프리셋 팀 수에 맞춘 기본 순위표 (월드컵 등 4팀 예시 한국 포함, 그 외 일반 팀명).
   ★ 기본 팀 id는 결정적(t0·t1…) — SSR/클라이언트 동일 보장(Date.now 기반 id의 하이드레이션 불일치 방지)
     + teams와 focusId가 같은 id를 갖게 함(초기 focusId 유령 id 버그 방지). 사용자 추가 팀만 newId(). */
function defaultTeams(count: number): Team[] {
  const sample = ['대한민국', '포르투갈', '우루과이', '가나']
  const arr: Team[] = []
  for (let i = 0; i < Math.min(count, 8); i++) {
    arr.push({ id: `t${i}`, name: sample[i] ?? `팀 ${String.fromCharCode(65 + i)}`, win: 0, draw: 0, loss: 0, gf: 0, ga: 0 })
  }
  return arr
}

/* ── 검증 로더 ── */
function loadState(): SavedState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as unknown
    if (typeof o !== 'object' || o === null) return null
    const r = o as Record<string, unknown>
    if (typeof r.presetId !== 'string') return null
    if (!Array.isArray(r.teams)) return null
    const teams: Team[] = []
    for (const t of r.teams) {
      if (typeof t !== 'object' || t === null) return null
      const tt = t as Record<string, unknown>
      if (typeof tt.id !== 'string' || typeof tt.name !== 'string') return null
      const nums = ['win', 'draw', 'loss', 'gf', 'ga'] as const
      if (nums.some((k) => typeof tt[k] !== 'number' || !Number.isFinite(tt[k]))) return null
      teams.push({
        id: tt.id, name: tt.name,
        win: tt.win as number, draw: tt.draw as number, loss: tt.loss as number,
        gf: tt.gf as number, ga: tt.ga as number,
      })
    }
    if (teams.length === 0) return null
    const ids = new Set(teams.map((t) => t.id))
    if (!Array.isArray(r.remaining)) return null
    const remaining: Match[] = []
    for (const m of r.remaining) {
      if (typeof m !== 'object' || m === null) continue
      const mm = m as Record<string, unknown>
      if (typeof mm.home !== 'string' || typeof mm.away !== 'string') continue
      if (!ids.has(mm.home) || !ids.has(mm.away) || mm.home === mm.away) continue
      remaining.push({ home: mm.home, away: mm.away })
    }
    const played: PlayedMatch[] = []
    if (Array.isArray(r.played)) {
      for (const m of r.played) {
        if (typeof m !== 'object' || m === null) continue
        const mm = m as Record<string, unknown>
        if (typeof mm.home !== 'string' || typeof mm.away !== 'string') continue
        if (!ids.has(mm.home) || !ids.has(mm.away) || mm.home === mm.away) continue
        if (!isOutcome(mm.result)) continue
        played.push({ home: mm.home, away: mm.away, result: mm.result })
      }
    }
    const advance = typeof r.advance === 'number' && Number.isFinite(r.advance)
      ? Math.max(1, Math.min(teams.length, Math.floor(r.advance))) : 2
    const focusId = typeof r.focusId === 'string' && ids.has(r.focusId) ? r.focusId : teams[0].id
    if (!COMPETITIONS.some((c) => c.id === r.presetId)) return null
    return { presetId: r.presetId, teams, remaining, played, advance, focusId }
  } catch {
    return null
  }
}

function saveState(st: SavedState) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(st))
  } catch { /* 저장 실패 무시 */ }
}

/* ── 사람말 변환 ── */
/** focus 팀 기준 한 경기 결과를 '이기면/비기면/지면'으로. */
function ownVerb(m: Match, focusId: string, o: Outcome): string {
  if (o === 'draw') return '비기면'
  const focusIsHome = m.home === focusId
  const focusWins = (o === 'home' && focusIsHome) || (o === 'away' && !focusIsHome)
  return focusWins ? '이기면' : '지면'
}
/** 한 경기 결과를 'A 승 / 무 / B 승' 식으로 (팀명). */
function matchResultText(m: Match, o: Outcome, name: (id: string) => string): string {
  if (o === 'home') return `${name(m.home)} 승`
  if (o === 'away') return `${name(m.away)} 승`
  return `${name(m.home)}-${name(m.away)} 무`
}

const numFromInput = (raw: string, max: number): number => {
  const d = raw.replace(/[^0-9]/g, '').slice(0, 3)
  if (d === '') return 0
  return Math.min(max, parseInt(d, 10) || 0)
}

export default function LeagueScenariosClient() {
  const initPreset = COMPETITIONS[0]
  const [presetId, setPresetId] = useState(initPreset.id)
  const [teams, setTeams] = useState<Team[]>(() => defaultTeams(initPreset.teams))
  const [remaining, setRemaining] = useState<Match[]>([])
  const [played, setPlayed] = useState<PlayedMatch[]>([])
  const [advance, setAdvance] = useState(initPreset.advance)
  const [advText, setAdvText] = useState(String(initPreset.advance))
  const [focusId, setFocusId] = useState<string>(() => defaultTeams(initPreset.teams)[0].id)
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // 초기 로드 — 1회만, 검증 통과 시에만 복원
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setPresetId(saved.presetId)
      setTeams(saved.teams)
      setRemaining(saved.remaining)
      setPlayed(saved.played)
      setAdvance(saved.advance)
      setAdvText(String(saved.advance))
      setFocusId(saved.focusId)
    }
    setLoaded(true)
  }, [])

  // 변경 시 저장
  useEffect(() => {
    if (loaded) saveState({ presetId, teams, remaining, played, advance, focusId })
  }, [loaded, presetId, teams, remaining, played, advance, focusId])

  const competition = useMemo(() => getCompetition(presetId), [presetId])
  const nameOf = useMemo(() => {
    const map = new Map(teams.map((t) => [t.id, t.name]))
    return (id: string) => map.get(id) ?? '?'
  }, [teams])

  // 프리셋 변경: 진출 자리·기본 팀 수 반영(팀 수가 기본보다 적으면 채움). 팀명은 사용자 입력 보존.
  const onPreset = (id: string) => {
    const c = getCompetition(id)
    setPresetId(id)
    setAdvance(Math.max(1, Math.min(teams.length, c.advance)))
    setAdvText(String(Math.max(1, Math.min(teams.length, c.advance))))
  }

  /* ── 순위표 편집 ── */
  const updateTeam = (id: string, patch: Partial<Team>) =>
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))

  const addTeam = () => {
    if (teams.length >= 8) return
    const t = makeTeam(`팀 ${String.fromCharCode(65 + teams.length)}`)
    setTeams((prev) => [...prev, t])
  }
  const removeTeam = (id: string) => {
    if (teams.length <= 2) return
    setTeams((prev) => prev.filter((t) => t.id !== id))
    setRemaining((prev) => prev.filter((m) => m.home !== id && m.away !== id))
    setPlayed((prev) => prev.filter((m) => m.home !== id && m.away !== id))
    if (focusId === id) {
      const next = teams.find((t) => t.id !== id)
      if (next) setFocusId(next.id)
    }
    if (advance > teams.length - 1) {
      setAdvance(teams.length - 1)
      setAdvText(String(teams.length - 1))
    }
  }

  /* ── 잔여 경기 편집 ── */
  const addMatch = () => {
    if (teams.length < 2) return
    setRemaining((prev) => [...prev, { home: teams[0].id, away: teams[1].id }])
  }
  const updateMatch = (i: number, patch: Partial<Match>) =>
    setRemaining((prev) => prev.map((m, j) => (j === i ? { ...m, ...patch } : m)))
  const removeMatch = (i: number) =>
    setRemaining((prev) => prev.filter((_, j) => j !== i))

  /* ── 맞대결(played) 편집 ── */
  const addPlayed = () => {
    if (teams.length < 2) return
    setPlayed((prev) => [...prev, { home: teams[0].id, away: teams[1].id, result: 'home' }])
  }
  const updatePlayed = (i: number, patch: Partial<PlayedMatch>) =>
    setPlayed((prev) => prev.map((m, j) => (j === i ? { ...m, ...patch } : m)))
  const removePlayed = (i: number) =>
    setPlayed((prev) => prev.filter((_, j) => j !== i))

  const onAdvChange = (raw: string) => {
    const d = raw.replace(/[^0-9]/g, '').slice(0, 2)
    setAdvText(d)
    const n = d === '' ? 1 : Math.max(1, Math.min(teams.length, parseInt(d, 10) || 1))
    setAdvance(n)
  }

  // 잔여 경기 중 유효(서로 다른 팀)한 것만 엔진에 전달
  const validRemaining = useMemo(
    () => remaining.filter((m) => m.home !== m.away),
    [remaining],
  )
  const validPlayed = useMemo(
    () => played.filter((m) => m.home !== m.away),
    [played],
  )

  // 무거운 전수 계산(잔여 11경기=3^11)을 지연값으로 — 입력 타이핑 응답성 유지(낮은 우선순위로 재계산)
  const dTeams = useDeferredValue(teams)
  const dRemaining = useDeferredValue(validRemaining)
  const dPlayed = useDeferredValue(validPlayed)
  const result = useMemo(() => calcScenarios({
    teams: dTeams,
    remaining: dRemaining,
    played: dPlayed.length > 0 ? dPlayed : undefined,
    competition,
    advance: Math.max(1, Math.min(dTeams.length, advance)),
    focusId,
  }), [dTeams, dRemaining, dPlayed, competition, advance, focusId])

  const advanceLabel = advance >= teams.length ? '잔류' : `상위 ${advance}위 진출`

  /* ── 공유 텍스트 ── */
  const shareText = useMemo(() => {
    if (result.tooMany) return ''
    const lines: string[] = []
    lines.push(`⚽ ${result.focusName} ${advanceLabel} 경우의 수 (${competition.name})`)
    lines.push(`진출 확정 ${result.advanceCount} / 전체 ${result.total}가지` +
      (result.undeterminedCount > 0 ? ` · 갈림 ${result.undeterminedCount}가지` : ''))
    lines.push(result.selfAdvancePossible ? '자력 진출 가능 ✅' : '자력 진출 불가(타 경기 결과 필요)')
    const adv = result.selfPaths.filter((p) => p.verdict === 'always_advance')
    if (adv.length > 0 && adv[0].ownMatches.length > 0) {
      const words = adv.map((p) =>
        p.ownMatches.map((m, k) => ownVerb(m, focusId, p.ownOutcomes[k])).join(' & '))
      lines.push(`자력 조건: ${words.join(' 또는 ')}`)
    }
    lines.push('— 모든 결과(승/무/패) 동일 가정·전력 미반영·베팅 아님 (youtil.kr)')
    return lines.join('\n')
  }, [result, advanceLabel, competition.name, focusId])

  const copyShare = () => {
    if (!shareText) return
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true)
      setToast('결과 요약을 복사했습니다')
      window.setTimeout(() => { setCopied(false); setToast(null) }, 1500)
    }).catch(() => {
      setToast('복사에 실패했습니다')
      window.setTimeout(() => setToast(null), 1500)
    })
  }

  // 표 노출 상한
  const MAX_ROWS = 50
  const shownCombos = result.combos.slice(0, MAX_ROWS)
  const ownIdxSet = useMemo(() => {
    const set = new Set<number>()
    validRemaining.forEach((m, i) => { if (m.home === focusId || m.away === focusId) set.add(i) })
    return set
  }, [validRemaining, focusId])

  const probPct = (result.advanceProbability * 100).toFixed(1)

  return (
    <div className={s.wrap}>
      {/* ── 대회 프리셋 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>대회 / 순위 규칙</span>
        <div className={s.field}>
          <label className={s.fieldLabel} htmlFor="ls-preset">대회 프리셋</label>
          <select
            id="ls-preset"
            className={s.select}
            value={presetId}
            onChange={(e) => onPreset(e.target.value)}
          >
            {COMPETITIONS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className={s.presetNote}>
          <div>{competition.note}</div>
          <div className={s.orderChips} aria-label="동점 시 순위 결정 순서">
            {competition.order.map((k, i) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span className={s.orderArrow} aria-hidden>›</span>}
                <span className={s.orderChip}>
                  <span className={s.orderNum}>{i + 1}</span>
                  {CRITERION_LABEL[k]}
                </span>
              </span>
            ))}
          </div>
          {competition.needsHeadToHead && (
            <div className={s.h2hBadge}>승자승 우선 — 아래 ‘이미 치른 맞대결’ 입력 권장</div>
          )}
        </div>
      </div>

      {/* ── 현재 순위표 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>현재 순위표</span>
        <p className={s.cardDesc}>각 팀의 승·무·패·득점·실점을 입력하면 승점·경기수·골득실이 자동 계산됩니다.</p>
        <div className={`tableScroll ${s.tableScroll}`}>
          <table className={s.standTable}>
            <thead>
              <tr>
                <th scope="col">팀</th>
                <th scope="col">승</th>
                <th scope="col">무</th>
                <th scope="col">패</th>
                <th scope="col">득점</th>
                <th scope="col">실점</th>
                <th scope="col">승점</th>
                <th scope="col">득실</th>
                <th scope="col" aria-label="삭제" />
              </tr>
            </thead>
            <tbody>
              {teams.map((t, i) => (
                <tr key={t.id}>
                  <td>
                    <label htmlFor={`ls-name-${t.id}`} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>팀 {i + 1} 이름</label>
                    <input
                      id={`ls-name-${t.id}`}
                      className={s.teamNameInput}
                      type="text"
                      value={t.name}
                      onChange={(e) => updateTeam(t.id, { name: e.target.value.slice(0, 14) })}
                      placeholder={`팀 ${i + 1}`}
                    />
                  </td>
                  {(['win', 'draw', 'loss', 'gf', 'ga'] as const).map((k) => (
                    <td key={k}>
                      <label htmlFor={`ls-${k}-${t.id}`} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
                        {t.name} {k === 'win' ? '승' : k === 'draw' ? '무' : k === 'loss' ? '패' : k === 'gf' ? '득점' : '실점'}
                      </label>
                      <input
                        id={`ls-${k}-${t.id}`}
                        className={s.numCell}
                        type="text"
                        inputMode="numeric"
                        value={String(t[k])}
                        onChange={(e) => updateTeam(t.id, { [k]: numFromInput(e.target.value, 999) })}
                      />
                    </td>
                  ))}
                  <td className={s.derived}>{teamPoints(t)}</td>
                  <td className={`${s.derived} ${s.derivedMuted}`}>{teamGD(t) > 0 ? `+${teamGD(t)}` : teamGD(t)}</td>
                  <td>
                    <button
                      type="button"
                      className={s.rowDel}
                      onClick={() => removeTeam(t.id)}
                      disabled={teams.length <= 2}
                      aria-label={`${t.name} 삭제`}
                    >×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className={s.addRowBtn} onClick={addTeam} disabled={teams.length >= 8}>
          + 팀 추가 {teams.length >= 8 && '(최대 8팀)'}
        </button>
      </div>

      {/* ── 잔여 경기 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>잔여 경기 (아직 안 치른 경기)</span>
        <p className={s.cardDesc}>남은 경기의 홈·원정 팀을 고르세요. 이 경기들의 승/무/패 조합을 모두 따져 경우의 수를 계산합니다.</p>
        {remaining.map((m, i) => (
          <div className={s.matchRow} key={i}>
            <select
              className={s.matchSelect}
              value={m.home}
              onChange={(e) => updateMatch(i, { home: e.target.value })}
              aria-label={`잔여 경기 ${i + 1} 홈팀`}
            >
              {teams.filter((t) => t.id !== m.away).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <span className={s.vs}>vs</span>
            <select
              className={s.matchSelect}
              value={m.away}
              onChange={(e) => updateMatch(i, { away: e.target.value })}
              aria-label={`잔여 경기 ${i + 1} 원정팀`}
            >
              {teams.filter((t) => t.id !== m.home).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button type="button" className={s.rowDel} onClick={() => removeMatch(i)} aria-label={`잔여 경기 ${i + 1} 삭제`}>×</button>
          </div>
        ))}
        <button type="button" className={s.addRowBtn} onClick={addMatch}>+ 잔여 경기 추가</button>
        <p className={`${s.matchCount} ${validRemaining.length > 11 ? s.matchCountWarn : ''}`}>
          잔여 {validRemaining.length}경기 · 경우의 수 {validRemaining.length <= 11 ? Math.pow(3, validRemaining.length).toLocaleString() : '11경기 초과'}가지
          {validRemaining.length > 11 && ' — 12경기 이상은 전수 계산이 어렵습니다'}
        </p>
      </div>

      {/* ── 진출 자리 + 관심 팀 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>진출 조건 · 관심 팀</span>
        <div className={s.twoCol}>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="ls-advance">
              진출 자리 <span className={s.fieldHint}>(상위 N)</span>
            </label>
            <input
              id="ls-advance"
              className={s.advInput}
              type="text"
              inputMode="numeric"
              value={advText}
              onChange={(e) => onAdvChange(e.target.value)}
              placeholder="2"
            />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel} htmlFor="ls-focus">관심 팀 <span className={s.fieldHint}>(이 팀 기준 분석)</span></label>
            <select
              id="ls-focus"
              className={s.select}
              value={focusId}
              onChange={(e) => setFocusId(e.target.value)}
            >
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── 이미 치른 맞대결 (승자승 정확 계산용) ── */}
      <details className={s.collapse} open={competition.needsHeadToHead && played.length > 0 ? true : undefined}>
        <summary className={s.collapseSummary}>
          🤝 이미 치른 맞대결 결과 입력 {competition.needsHeadToHead ? '(승자승 우선 — 권장)' : '(선택)'}
        </summary>
        <div className={s.collapseBody}>
          <p className={s.collapseHint}>
            {competition.needsHeadToHead
              ? '이 대회는 승점이 같으면 전체 골득실보다 맞대결(승자승)을 먼저 봅니다. 순위표 팀들끼리 이미 치른 경기 결과를 넣으면 승자승이 정확히 계산됩니다. 비워두면 승자승으로 갈리는 동률은 ‘승자승(맞대결 결과 필요)’으로 표시됩니다.'
              : '이 대회는 골득실이 승자승보다 먼저라 보통 필요 없지만, 동률이 끝까지 승자승까지 갈 경우를 정확히 보려면 입력할 수 있습니다.'}
          </p>
          {played.map((m, i) => (
            <div className={s.matchRow} key={i}>
              <select
                className={s.matchSelect}
                value={m.home}
                onChange={(e) => updatePlayed(i, { home: e.target.value })}
                aria-label={`맞대결 ${i + 1} 홈팀`}
              >
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className={s.resSeg} role="group" aria-label={`맞대결 ${i + 1} 결과`}>
                {([['home', '홈승'], ['draw', '무'], ['away', '원정승']] as [Outcome, string][]).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    className={`${s.resBtn} ${m.result === v ? s.resBtnActive : ''}`}
                    onClick={() => updatePlayed(i, { result: v })}
                    aria-pressed={m.result === v}
                  >{label}</button>
                ))}
              </div>
              <select
                className={s.matchSelect}
                value={m.away}
                onChange={(e) => updatePlayed(i, { away: e.target.value })}
                aria-label={`맞대결 ${i + 1} 원정팀`}
              >
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button type="button" className={s.rowDel} onClick={() => removePlayed(i)} aria-label={`맞대결 ${i + 1} 삭제`}>×</button>
            </div>
          ))}
          <button type="button" className={s.addRowBtn} onClick={addPlayed}>+ 맞대결 결과 추가</button>
        </div>
      </details>

      {/* ── 결과 ── */}
      {result.tooMany ? (
        <div className={s.notice} role="status">
          <p className={s.noticeTitle}>잔여 경기가 너무 많습니다 (12경기 이상)</p>
          전체 경우의 수(3<sup>{validRemaining.length}</sup>가지)가 너무 커서 전수 계산이 어렵습니다.
          관심 팀과 직접 관련된 경기 위주로 잔여 경기를 줄여보세요.
        </div>
      ) : validRemaining.length === 0 ? (
        <div className={s.notice}>
          <p className={s.noticeTitle}>잔여 경기를 추가하세요</p>
          남은 경기(홈 vs 원정)를 입력하면 {result.focusName}의 진출 경우의 수와 자력/타력 조건을 계산합니다.
        </div>
      ) : (
        <>
          {/* 관심 팀 시나리오 카드 */}
          {validRemaining.length > 0 && (
            <div className={s.focusCard}>
              <p className={s.focusTitle}>⚽ {result.focusName} {advanceLabel} 시나리오</p>
              {result.selfPaths.map((p, i) => (
                <SelfPathRow key={i} path={p} focusId={focusId} nameOf={nameOf} />
              ))}
            </div>
          )}

          {/* 요약 히어로 */}
          <div className={s.hero} role="status" aria-live="polite">
            <p className={s.heroTop}>{result.focusName} 진출 확정 경우의 수</p>
            <p className={s.heroNum}>
              {result.advanceCount}
              <span className={s.heroNumSep}>/</span>
              <span className={s.heroDen}>{result.total}</span>
              <span className={s.heroUnit}>가지</span>
            </p>
            <div className={s.heroBadges}>
              <span className={`${s.badge} ${result.selfAdvancePossible ? s.badgeOk : ''}`}>
                {result.selfAdvancePossible ? '자력 진출 가능' : '자력 진출 불가'}
              </span>
              {result.eliminatedCount > 0 && (
                <span className={s.badge}>탈락 {result.eliminatedCount}가지</span>
              )}
              {result.undeterminedCount > 0 && (
                <span className={`${s.badge} ${s.badgeWarn}`}>경계서 갈림 {result.undeterminedCount}가지</span>
              )}
            </div>
            {result.undeterminedCount > 0 && (
              <p className={s.heroAux}>
                {result.undeterminedCount}가지는 승점이 같아 골득실·승자승 등 세부 기준에 따라 진출이 갈립니다.
              </p>
            )}

            {/* 진출 확률(참고) */}
            <div className={s.probBox}>
              <div className={s.probRow}>
                <span className={s.probLabel}>진출 확률(참고)</span>
                <span className={s.probVal}>{probPct}%</span>
              </div>
              <p className={s.probWarn}>
                ⚠️ 모든 경기 결과(승/무/패)가 동일하게 나온다는 단순 가정입니다. 팀 전력·경기력 미반영. 베팅·도박 목적이 아닌 경우의 수 참고용입니다.
              </p>
            </div>
          </div>

          {/* 전체 시나리오 표 */}
          {validRemaining.length > 0 && (
            <details className={s.tableDetails}>
              <summary className={s.tableSummary}>📋 전체 시나리오 표 보기 ({result.total}가지)</summary>
              <div className={`tableScroll ${s.tableScroll}`}>
                <table className={s.scenTable}>
                  <thead>
                    <tr>
                      <th scope="col">{result.focusName} 경기</th>
                      <th scope="col">그 외 경기</th>
                      <th scope="col">{result.focusName} 순위</th>
                      <th scope="col">진출</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownCombos.map((c, ci) => {
                      const own = validRemaining
                        .map((m, mi) => (ownIdxSet.has(mi) ? matchResultText(m, c.combo[mi], nameOf) : null))
                        .filter((x): x is string => x !== null)
                      const other = validRemaining
                        .map((m, mi) => (!ownIdxSet.has(mi) ? matchResultText(m, c.combo[mi], nameOf) : null))
                        .filter((x): x is string => x !== null)
                      const rank = c.focusRankLo === c.focusRankHi
                        ? `${c.focusRankLo}위`
                        : `${c.focusRankLo}~${c.focusRankHi}위`
                      return (
                        <tr key={ci}>
                          <td className={s.cellOwn}>{own.length > 0 ? own.join(', ') : '—'}</td>
                          <td className={s.cellOther}>{other.length > 0 ? other.join(' · ') : '—'}</td>
                          <td className={s.cellRank}>{rank}</td>
                          <td>
                            {c.focusStatus === 'advance' && <span className={s.statusAdv}>✅ 진출</span>}
                            {c.focusStatus === 'eliminated' && <span className={s.statusElim}>❌ 탈락</span>}
                            {c.focusStatus === 'undetermined' && (
                              <span className={s.statusUnd}>
                                🔶 {c.undeterminedBy ? `${CRITERION_LABEL[c.undeterminedBy]}에 따라 갈림` : '세부 기준에 따라 갈림'}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {result.total > MAX_ROWS && (
                <p className={s.tableMore}>전체 {result.total}가지 중 상위 {MAX_ROWS}가지만 표시했습니다. 잔여 경기를 줄이면 전체를 볼 수 있습니다.</p>
              )}
            </details>
          )}

          {/* 공유 */}
          {validRemaining.length > 0 && (
            <button
              type="button"
              className={`${s.copyBtn} ${copied ? s.copyBtnDone : ''}`}
              onClick={copyShare}
            >
              {copied ? '복사됨 ✓' : '결과 요약 복사'}
            </button>
          )}
        </>
      )}

      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  )
}

/* ── 자력/타력 분기 한 행 ── */
function SelfPathRow({ path, focusId, nameOf }: { path: SelfPath; focusId: string; nameOf: (id: string) => string }) {
  // focus의 자기 경기 결과를 사람말로
  const condText = path.ownMatches.length === 0
    ? '자기 경기 없음'
    : path.ownMatches.map((m, k) => {
        const other = m.home === focusId ? m.away : m.home
        return `${nameOf(other)}전 ${ownVerb(m, focusId, path.ownOutcomes[k])}`
      }).join(' & ')

  const advRatio = `${path.advanceCount}/${path.total}`
  let rowClass = s.pathRow
  let icon = '🔶'
  let verdict: React.ReactNode
  if (path.verdict === 'always_advance') {
    rowClass += ` ${s.pathAdvance}`
    icon = '✅'
    verdict = <>다른 경기 결과와 무관하게 <strong>진출 확정</strong><span className={s.selfTag}>자력</span></>
  } else if (path.verdict === 'always_eliminated') {
    rowClass += ` ${s.pathElim}`
    icon = '❌'
    verdict = <>다른 경기 결과와 무관하게 <strong>탈락</strong></>
  } else {
    icon = '🔶'
    verdict = <>다른 경기 결과에 따라 갈림 — {advRatio} 조합에서 진출{path.undeterminedCount > 0 ? `, ${path.undeterminedCount}가지는 골득실·승자승서 갈림` : ''}<span className={s.depTag}>타력</span></>
  }

  return (
    <div className={rowClass}>
      <span className={s.pathIcon} aria-hidden>{icon}</span>
      <div className={s.pathText}>
        <p className={s.pathCond}>{condText}</p>
        <p className={s.pathVerdict}>{verdict}</p>
      </div>
    </div>
  )
}
