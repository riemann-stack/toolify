'use client'

import { useMemo, useState } from 'react'
import styles from './football-points.module.css'

/* ─────────────────────────────────────────────────────────
 * 리그 프리셋
 * ───────────────────────────────────────────────────────── */
const LEAGUES: Array<{ id: string; flag: string; name: string; games: number; isK?: boolean }> = [
  { id: 'k1',     flag: '🇰🇷', name: 'K리그1',    games: 38, isK: true },
  { id: 'k2',     flag: '🇰🇷', name: 'K리그2',    games: 36, isK: true },
  { id: 'epl',    flag: '🏴',   name: 'EPL',        games: 38 },
  { id: 'laliga', flag: '🇪🇸', name: '라리가',    games: 38 },
  { id: 'seria',  flag: '🇮🇹', name: '세리에A',  games: 38 },
  { id: 'bundes', flag: '🇩🇪', name: '분데스',    games: 34 },
  { id: 'ligue1', flag: '🇫🇷', name: '리그앙',    games: 34 },
  { id: 'jleague',flag: '🇯🇵', name: 'J리그',     games: 34 },
  { id: 'custom', flag: '⚙️',   name: '직접 입력', games: 38 },
]

/* 리그별 우승 평균 승점 추천 */
const TARGET_PRESETS_BY_LEAGUE: Record<string, { champ: number; ucl: number; uel: number; safe: number }> = {
  k1:      { champ: 75, ucl: 60, uel: 50, safe: 35 },
  k2:      { champ: 70, ucl: 55, uel: 45, safe: 32 },
  epl:     { champ: 88, ucl: 70, uel: 60, safe: 40 },
  laliga:  { champ: 85, ucl: 70, uel: 60, safe: 38 },
  seria:   { champ: 85, ucl: 68, uel: 58, safe: 38 },
  bundes:  { champ: 75, ucl: 62, uel: 52, safe: 35 },
  ligue1:  { champ: 78, ucl: 62, uel: 52, safe: 35 },
  jleague: { champ: 72, ucl: 58, uel: 48, safe: 32 },
  custom:  { champ: 75, ucl: 60, uel: 50, safe: 35 },
}

interface TeamStats {
  name: string
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
}

interface CalcResult {
  played: number
  remaining: number
  points: number
  goalDiff: number
  ppg: number
  winRate: number
  drawRate: number
  gpg: number
  apg: number
  projectedFinal: number
  maxPossible: number
  minPossible: number
}

function calcStats(t: TeamStats, totalGames: number, sys: { w: number; d: number }): CalcResult {
  const played = t.wins + t.draws + t.losses
  const remaining = Math.max(0, totalGames - played)
  const points = t.wins * sys.w + t.draws * sys.d
  const goalDiff = t.goalsFor - t.goalsAgainst
  const ppg = played > 0 ? points / played : 0
  const winRate  = played > 0 ? (t.wins / played) * 100 : 0
  const drawRate = played > 0 ? (t.draws / played) * 100 : 0
  const gpg = played > 0 ? t.goalsFor / played : 0
  const apg = played > 0 ? t.goalsAgainst / played : 0
  const projectedFinal = Math.round(points + ppg * remaining)
  const maxPossible = points + remaining * sys.w
  const minPossible = points
  return { played, remaining, points, goalDiff, ppg, winRate, drawRate, gpg, apg, projectedFinal, maxPossible, minPossible }
}

/* ─────────────────────────────────────────────────────────
 * 메인 컴포넌트
 * ───────────────────────────────────────────────────────── */
export default function FootballPointsClient() {
  const [tab, setTab] = useState<'main' | 'scenario' | 'rival'>('main')
  const [leagueId, setLeagueId] = useState('k1')
  const [totalGames, setTotalGames] = useState(38)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [pointsSystem, setPointsSystem] = useState<'modern' | 'classic'>('modern')

  /* 우리 팀 */
  const [team, setTeam] = useState<TeamStats>({
    name: '우리 팀',
    wins: 14,
    draws: 5,
    losses: 5,
    goalsFor: 38,
    goalsAgainst: 20,
  })

  /* 라이벌 */
  const [rivals, setRivals] = useState<TeamStats[]>([
    { name: '라이벌 A', wins: 16, draws: 3, losses: 6, goalsFor: 42, goalsAgainst: 30 },
    { name: '라이벌 B', wins: 13, draws: 6, losses: 5, goalsFor: 35, goalsAgainst: 26 },
  ])

  /* 목표 승점 */
  const [target, setTarget] = useState<number>(75)

  /* 시뮬레이터 */
  const [simWins,   setSimWins]   = useState(0)
  const [simLosses, setSimLosses] = useState(0)

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* 승점 시스템 */
  const sys = pointsSystem === 'modern' ? { w: 3, d: 1 } : { w: 2, d: 1 }

  /* 리그 변경 시 총 경기 수 갱신 */
  function selectLeague(id: string) {
    setLeagueId(id)
    const l = LEAGUES.find(x => x.id === id)
    if (l) setTotalGames(l.games)
    const preset = TARGET_PRESETS_BY_LEAGUE[id]
    if (preset) setTarget(preset.champ)
  }

  /* ─── 파생값 ─── */
  const stats = useMemo(() => calcStats(team, totalGames, sys), [team, totalGames, sys])

  /* 페이스 시나리오 */
  const scenarioPoints = useMemo(() => {
    const consPpg = Math.max(0, stats.ppg * 0.9)
    const optPpg  = stats.ppg * 1.1
    return {
      cons: Math.round(stats.points + consPpg * stats.remaining),
      base: stats.projectedFinal,
      opt:  Math.min(stats.maxPossible, Math.round(stats.points + optPpg * stats.remaining)),
    }
  }, [stats])

  /* 목표 달성 가능성 */
  const targetAnalysis = useMemo(() => {
    const needed = target - stats.points
    if (needed <= 0) return { status: 'achieved' as const, needed: 0, ratio: 0 }
    if (needed > stats.remaining * sys.w) return { status: 'impossible' as const, needed, ratio: 100 }
    const ratio = (needed / (stats.remaining * sys.w)) * 100
    return { status: 'possible' as const, needed, ratio }
  }, [target, stats, sys])

  /* 가능성 라벨 + 색상 */
  const feasibility = useMemo(() => {
    if (targetAnalysis.status === 'achieved') return { label: '✅ 이미 달성', cls: styles.fbEasy }
    if (targetAnalysis.status === 'impossible') return { label: '❌ 수학적 불가능', cls: styles.fbImpossible }
    const r = targetAnalysis.ratio
    if (r <= 50) return { label: '✅ 매우 가능', cls: styles.fbEasy }
    if (r <= 80) return { label: '🔶 도전적',     cls: styles.fbMid }
    return { label: '🚨 매우 어려움', cls: styles.fbHard }
  }, [targetAnalysis])

  /* 시나리오 조합 (적은 승수 우선 5개) */
  const targetScenarios = useMemo(() => {
    if (targetAnalysis.status !== 'possible') return [] as Array<{ wins: number; draws: number; losses: number; points: number }>
    const out: Array<{ wins: number; draws: number; losses: number; points: number }> = []
    const needed = targetAnalysis.needed
    for (let w = 0; w <= stats.remaining; w++) {
      for (let d = 0; d <= stats.remaining - w; d++) {
        const pts = w * sys.w + d * sys.d
        if (pts >= needed) {
          out.push({ wins: w, draws: d, losses: stats.remaining - w - d, points: pts })
          break // 같은 w 안에서 가장 적은 d 1개만
        }
      }
    }
    return out.slice(0, 5)
  }, [targetAnalysis, stats.remaining, sys])

  /* 시뮬레이터 — 슬라이더로 직접 시나리오 시뮬레이션 */
  const simDraws = Math.max(0, stats.remaining - simWins - simLosses)
  const simPoints = stats.points + simWins * sys.w + simDraws * sys.d
  const simReachedTarget = simPoints >= target

  /* 라이벌 통계 */
  const rivalStats = useMemo(
    () => rivals.map(r => ({ team: r, calc: calcStats(r, totalGames, sys) })),
    [rivals, totalGames, sys]
  )

  /* 시즌 종료 예상 순위 */
  const projectedRanking = useMemo(() => {
    const all = [
      { name: team.name, projected: stats.projectedFinal, isOurs: true },
      ...rivalStats.map(r => ({ name: r.team.name, projected: r.calc.projectedFinal, isOurs: false })),
    ]
    return all.sort((a, b) => b.projected - a.projected)
  }, [team.name, stats.projectedFinal, rivalStats])

  /* 라이벌 추격 분석 — 라이벌별 격차/추월 가능성 */
  function analyzeRival(r: { team: TeamStats; calc: CalcResult }) {
    const gap = r.calc.points - stats.points  // 양수: 라이벌 앞섬
    if (gap === 0) return { status: 'tied' as const, gap, msg: '동점입니다.' }
    if (gap < 0) {
      // 우리가 앞섬
      const theirMax = r.calc.maxPossible
      const ourMin = stats.minPossible
      if (theirMax > ourMin) {
        const needWins = Math.max(0, Math.ceil((theirMax - stats.points + 1) / sys.w))
        return {
          status: 'leading' as const,
          gap: Math.abs(gap),
          msg: `${Math.abs(gap)}점 앞서 있습니다. 라이벌이 남은 ${r.calc.remaining}경기 전승 시 최대 ${theirMax}점 가능 — 우리가 추가 ${needWins}승만 거둬도 추월 불가능합니다.`,
        }
      }
      return {
        status: 'leading' as const,
        gap: Math.abs(gap),
        msg: `${Math.abs(gap)}점 앞서 있으며, 라이벌이 남은 경기를 모두 이겨도 따라잡을 수 없습니다. (수학적으로 안전)`,
      }
    }
    // 우리가 추격
    const ourMax = stats.maxPossible
    const theirMin = r.calc.minPossible
    if (ourMax >= theirMin + 1) {
      const winsNeeded = Math.max(0, Math.ceil((r.calc.points - stats.points + 1) / sys.w))
      return {
        status: 'chase' as const,
        gap,
        msg: `${gap}점 뒤져 있습니다. 라이벌이 남은 ${r.calc.remaining}경기 전패하더라도 ${theirMin}점 → 우리가 남은 ${stats.remaining}경기에서 최소 ${winsNeeded}승 이상 거둬야 추월 가능합니다.`,
      }
    }
    return { status: 'impossible' as const, gap, msg: `${gap}점 뒤져 있으며, 남은 경기를 모두 승리해도 라이벌의 현재 승점을 따라잡을 수 없습니다.` }
  }

  /* 라이벌 추가/삭제 */
  function addRival() {
    if (rivals.length >= 3) return
    setRivals([...rivals, { name: `라이벌 ${String.fromCharCode(65 + rivals.length)}`, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }])
  }
  function removeRival(idx: number) {
    setRivals(rivals.filter((_, i) => i !== idx))
  }
  function updateRival(idx: number, patch: Partial<TeamStats>) {
    setRivals(rivals.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }

  /* 결과 복사 */
  function handleCopy() {
    const lines = [
      `── ${team.name} 시즌 분석 ──`,
      `${LEAGUES.find(l => l.id === leagueId)?.name ?? ''} (${totalGames}경기)`,
      `${stats.played}경기 ${team.wins}승 ${team.draws}무 ${team.losses}패 / 승점 ${stats.points}점 / 득실 ${stats.goalDiff >= 0 ? '+' : ''}${stats.goalDiff}`,
      `현재 페이스 시즌 종료 예상: ${stats.projectedFinal}점 (보수 ${scenarioPoints.cons} / 낙관 ${scenarioPoints.opt})`,
      `목표 ${target}점까지 ${targetAnalysis.needed}점 필요`,
      'youtil.kr/tools/sports/football-points',
    ]
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  /* ─────────────────────────────────────────────────────── 렌더 ─────────────────────────────────────────────────────── */
  return (
    <div className={styles.wrap}>

      {/* ── 리그 프리셋 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>리그 선택</span>
          <span className={styles.cardLabelHint}>총 경기 수 자동 입력</span>
        </div>
        <div className={styles.leagueGrid}>
          {LEAGUES.map(l => (
            <button
              key={l.id}
              type="button"
              className={`${styles.leagueBtn} ${l.isK ? styles.leagueK : ''} ${leagueId === l.id ? styles.leagueActive : ''}`}
              onClick={() => selectLeague(l.id)}
            >
              <span className={styles.flag}>{l.flag}</span>{l.name}
              {l.id !== 'custom' && <small>{l.games}경기</small>}
            </button>
          ))}
        </div>

        {leagueId === 'custom' && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>총 경기 수</label>
            <input
              className={styles.targetInput}
              type="number"
              min={1}
              max={200}
              value={totalGames}
              onChange={e => setTotalGames(Math.max(1, Number(e.target.value) || 1))}
              style={{ marginTop: 6, fontSize: 20, padding: 10 }}
            />
          </div>
        )}

        <button type="button" className={styles.advancedToggle} onClick={() => setShowAdvanced(v => !v)}>
          {showAdvanced ? '▾' : '▸'} 고급 옵션 — 승점 시스템
        </button>
        {showAdvanced && (
          <div className={styles.advancedBox}>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>승점 시스템</p>
            <div className={styles.systemRow}>
              <button type="button" className={`${styles.systemBtn} ${pointsSystem === 'modern'  ? styles.systemActive : ''}`} onClick={() => setPointsSystem('modern')}>현대 (3-1-0)</button>
              <button type="button" className={`${styles.systemBtn} ${pointsSystem === 'classic' ? styles.systemActive : ''}`} onClick={() => setPointsSystem('classic')}>고전 (2-1-0)</button>
            </div>
          </div>
        )}
      </div>

      {/* ── 탭 ── */}
      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'main' ? styles.tabActive : ''}`}     onClick={() => setTab('main')}>승점 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'scenario' ? styles.tabActive : ''}`} onClick={() => setTab('scenario')}>시나리오 분석</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'rival' ? styles.tabActive : ''}`}    onClick={() => setTab('rival')}>라이벌 비교</button>
      </div>

      {/* ── 우리 팀 입력 카드 (모든 탭 공통) ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>{team.name} 입력</span>
          <span className={styles.cardLabelHint}>치른 경기 {stats.played} · 남은 {stats.remaining}</span>
        </div>

        <input
          className={styles.teamNameInput}
          type="text"
          value={team.name}
          onChange={e => setTeam({ ...team, name: e.target.value || '우리 팀' })}
          placeholder="팀 이름"
        />

        <div className={styles.wdlGrid}>
          <div className={`${styles.wdlCell} ${styles.wdlWin}`}>
            <p className={styles.wdlLabel}>승</p>
            <input
              className={styles.wdlInput}
              type="number"
              min={0}
              value={team.wins}
              onChange={e => setTeam({ ...team, wins: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
          <div className={`${styles.wdlCell} ${styles.wdlDraw}`}>
            <p className={styles.wdlLabel}>무</p>
            <input
              className={styles.wdlInput}
              type="number"
              min={0}
              value={team.draws}
              onChange={e => setTeam({ ...team, draws: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
          <div className={`${styles.wdlCell} ${styles.wdlLoss}`}>
            <p className={styles.wdlLabel}>패</p>
            <input
              className={styles.wdlInput}
              type="number"
              min={0}
              value={team.losses}
              onChange={e => setTeam({ ...team, losses: Math.max(0, Number(e.target.value) || 0) })}
            />
          </div>
        </div>

        <div className={styles.gfGrid}>
          <div className={styles.gfCell}>
            <p className={styles.gfLabel}>득점</p>
            <div className={styles.gfInputRow}>
              <span className={`${styles.gfSign} ${styles.gfPositive}`}>+</span>
              <input
                className={styles.gfInput}
                type="number"
                min={0}
                value={team.goalsFor}
                onChange={e => setTeam({ ...team, goalsFor: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
          </div>
          <div className={styles.gfCell}>
            <p className={styles.gfLabel}>실점</p>
            <div className={styles.gfInputRow}>
              <span className={`${styles.gfSign} ${styles.gfNegative}`}>−</span>
              <input
                className={styles.gfInput}
                type="number"
                min={0}
                value={team.goalsAgainst}
                onChange={e => setTeam({ ...team, goalsAgainst: Math.max(0, Number(e.target.value) || 0) })}
              />
            </div>
          </div>
        </div>

        <div className={styles.gdLine}>
          <span>득실차</span>
          <span className={`${styles.gdValue} ${stats.goalDiff > 0 ? styles.pos : stats.goalDiff < 0 ? styles.neg : ''}`}>
            {stats.goalDiff > 0 ? '+' : ''}{stats.goalDiff}
          </span>
        </div>
      </div>

      {/* ─────────────────────────── 탭 1: 승점 계산 ─────────────────────────── */}
      {tab === 'main' && (
        <>
          <div className={styles.hero}>
            <p className={styles.heroLead}>현재 승점</p>
            <p className={styles.heroNum}>
              {stats.points}<span className={styles.heroUnit}>점</span>
            </p>
          </div>

          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>치른 경기</div>
              <div className={styles.kpiValue}>{stats.played}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>승률</div>
              <div className={styles.kpiValue}>{stats.winRate.toFixed(1)}%</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>득실차</div>
              <div className={`${styles.kpiValue} ${stats.goalDiff > 0 ? styles.kpiValuePos : stats.goalDiff < 0 ? styles.kpiValueNeg : ''}`}>
                {stats.goalDiff > 0 ? '+' : ''}{stats.goalDiff}
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>승점/경기</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueAccent}`}>{stats.ppg.toFixed(2)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>경기당 득점</div>
              <div className={styles.kpiValue}>{stats.gpg.toFixed(2)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>경기당 실점</div>
              <div className={styles.kpiValue}>{stats.apg.toFixed(2)}</div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>시즌 종료 예상 승점</span>
              <span className={styles.cardLabelHint}>남은 {stats.remaining}경기</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 14 }}>
              남은 <strong style={{ color: 'var(--text)' }}>{stats.remaining}경기</strong>를 현재 페이스(승점 {stats.ppg.toFixed(2)}/경기)로 마치면 시즌 최종 승점은 약 <strong style={{ color: 'var(--accent)' }}>{stats.projectedFinal}점</strong>입니다.
            </p>
            <div className={styles.scenarioGrid}>
              <div className={`${styles.scenarioCard} ${styles.scenarioCons}`}>
                <p className={styles.scenarioLabel}>🔻 보수적 (-10%)</p>
                <p className={styles.scenarioPts}>{scenarioPoints.cons}</p>
              </div>
              <div className={`${styles.scenarioCard} ${styles.scenarioBase}`}>
                <p className={styles.scenarioLabel}>✅ 현재 페이스</p>
                <p className={styles.scenarioPts}>{scenarioPoints.base}</p>
              </div>
              <div className={`${styles.scenarioCard} ${styles.scenarioOpt}`}>
                <p className={styles.scenarioLabel}>🔺 낙관적 (+10%)</p>
                <p className={styles.scenarioPts}>{scenarioPoints.opt}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────── 탭 2: 시나리오 분석 ─────────────────────────── */}
      {tab === 'scenario' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>목표 승점 설정</span>
              <span className={styles.cardLabelHint}>{LEAGUES.find(l => l.id === leagueId)?.name} 기준</span>
            </div>
            <div className={styles.targetGrid}>
              {(() => {
                const p = TARGET_PRESETS_BY_LEAGUE[leagueId] ?? TARGET_PRESETS_BY_LEAGUE.k1
                const items = [
                  { v: p.champ, label: '🏆 우승 목표' },
                  { v: p.ucl,   label: '⭐ 챔스 진출' },
                  { v: p.uel,   label: '✨ 유로파' },
                  { v: p.safe,  label: '🛟 잔류 목표' },
                ]
                return items.map(it => (
                  <button
                    key={it.label}
                    type="button"
                    className={`${styles.targetBtn} ${target === it.v ? styles.targetActive : ''}`}
                    onClick={() => setTarget(it.v)}
                  >
                    {it.label}
                    <small>{it.v}점</small>
                  </button>
                ))
              })()}
            </div>
            <input
              className={styles.targetInput}
              type="number"
              min={0}
              value={target}
              onChange={e => setTarget(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>

          <div className={styles.feasibilityCard}>
            <span className={`${styles.feasibilityBadge} ${feasibility.cls}`}>{feasibility.label}</span>
            {targetAnalysis.status === 'achieved' ? (
              <>
                <p className={`${styles.fbValue} ${styles.posVal}`}>이미 {team.name}이(가) 목표를 달성했습니다.</p>
                <p className={styles.fbSub}>현재 승점 <strong>{stats.points}점</strong> ≥ 목표 <strong>{target}점</strong></p>
              </>
            ) : targetAnalysis.status === 'impossible' ? (
              <>
                <p className={`${styles.fbValue} ${styles.negVal}`}>도달 불가능</p>
                <p className={styles.fbSub}>
                  남은 {stats.remaining}경기 전승해도 최대 <strong>{stats.maxPossible}점</strong>으로 목표 <strong>{target}점</strong>에 도달할 수 없습니다.
                </p>
              </>
            ) : (
              <>
                <p className={styles.fbValue}>+{targetAnalysis.needed}점 필요</p>
                <p className={styles.fbSub}>
                  남은 <strong>{stats.remaining}경기</strong> 최대 <strong>{stats.remaining * sys.w}점</strong> 중 필요량 비율 <strong>{targetAnalysis.ratio.toFixed(1)}%</strong>
                </p>
              </>
            )}
          </div>

          {targetAnalysis.status === 'possible' && targetScenarios.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>가능한 승-무-패 조합</span>
                <span className={styles.cardLabelHint}>적은 승수 우선 5개</span>
              </div>
              <table className={styles.scenarioTable}>
                <thead>
                  <tr>
                    <th>승</th><th>무</th><th>패</th><th>획득 승점</th>
                  </tr>
                </thead>
                <tbody>
                  {targetScenarios.map((s, i) => (
                    <tr key={i}>
                      <td className={styles.scWin}>{s.wins}</td>
                      <td className={styles.scDraw}>{s.draws}</td>
                      <td className={styles.scLoss}>{s.losses}</td>
                      <td className={styles.scPts}>+{s.points}점</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 시뮬레이터 */}
          {stats.remaining > 0 && (
            <div className={styles.simulator}>
              <div className={styles.cardLabel} style={{ marginBottom: 14 }}>
                <span>남은 경기 시뮬레이션</span>
                <span className={styles.cardLabelHint}>슬라이더로 직접 조정</span>
              </div>

              <div className={styles.simRow}>
                <span className={styles.simLabel}>승</span>
                <input
                  className={`${styles.simSlider} ${styles.simWinSlider}`}
                  type="range"
                  min={0}
                  max={stats.remaining}
                  value={simWins}
                  onChange={e => {
                    const w = Number(e.target.value)
                    setSimWins(w)
                    if (w + simLosses > stats.remaining) setSimLosses(stats.remaining - w)
                  }}
                />
                <span className={styles.simNum}>{simWins}</span>
              </div>

              <div className={styles.simRow}>
                <span className={styles.simLabel}>무</span>
                <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 99, opacity: 0.5 }} />
                <span className={`${styles.simNum} ${styles.simNumLocked}`}>{simDraws}</span>
              </div>

              <div className={styles.simRow}>
                <span className={styles.simLabel}>패</span>
                <input
                  className={`${styles.simSlider} ${styles.simLossSlider}`}
                  type="range"
                  min={0}
                  max={stats.remaining}
                  value={simLosses}
                  onChange={e => {
                    const l = Number(e.target.value)
                    setSimLosses(l)
                    if (l + simWins > stats.remaining) setSimWins(stats.remaining - l)
                  }}
                />
                <span className={styles.simNum}>{simLosses}</span>
              </div>

              <div className={styles.simResult}>
                <div>
                  <span className={styles.simHint}>최종 승점</span>
                  <p className={`${styles.simResultPts} ${simReachedTarget ? styles.reachedTarget : styles.missedTarget}`}>
                    {simPoints}점
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={styles.simHint}>목표 {target}점</span>
                  <p style={{ fontSize: 13, color: simReachedTarget ? '#3EFF9B' : '#FF6B6B', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                    {simReachedTarget ? `✅ 도달 (+${simPoints - target})` : `❌ 미달 (${simPoints - target})`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────── 탭 3: 라이벌 비교 ─────────────────────────── */}
      {tab === 'rival' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>라이벌 팀 정보</span>
              <span className={styles.cardLabelHint}>최대 3팀 ({rivals.length}/3)</span>
            </div>

            <div className={styles.rivalSubInputs}>
              <span className={styles.rivalSubLabel}>승 / 무 / 패</span>
              <span className={styles.rivalSubLabel}>득점 / 실점</span>
            </div>

            {rivals.map((r, i) => (
              <div key={i} className={styles.rivalRow}>
                <input
                  className={styles.rivalNameInput}
                  type="text"
                  value={r.name}
                  onChange={e => updateRival(i, { name: e.target.value || `라이벌 ${i + 1}` })}
                  placeholder={`라이벌 ${String.fromCharCode(65 + i)}`}
                />
                <input className={styles.rivalNumInput} type="number" min={0} value={r.wins}   onChange={e => updateRival(i, { wins:   Math.max(0, Number(e.target.value) || 0) })} title="승" />
                <input className={styles.rivalNumInput} type="number" min={0} value={r.draws}  onChange={e => updateRival(i, { draws:  Math.max(0, Number(e.target.value) || 0) })} title="무" />
                <input className={styles.rivalNumInput} type="number" min={0} value={r.losses} onChange={e => updateRival(i, { losses: Math.max(0, Number(e.target.value) || 0) })} title="패" />
                <button type="button" className={styles.rivalRemoveBtn} onClick={() => removeRival(i)} aria-label="삭제">✕</button>
              </div>
            ))}

            <div className={styles.rivalSubInputs} style={{ marginTop: 4 }}>
              <span className={styles.rivalSubLabel}>득점 / 실점 입력</span>
            </div>
            {rivals.map((r, i) => (
              <div key={`gf-${i}`} className={styles.rivalRow} style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>{r.name}</span>
                <input className={styles.rivalNumInput} type="number" min={0} value={r.goalsFor}     onChange={e => updateRival(i, { goalsFor:     Math.max(0, Number(e.target.value) || 0) })} title="득점" />
                <input className={styles.rivalNumInput} type="number" min={0} value={r.goalsAgainst} onChange={e => updateRival(i, { goalsAgainst: Math.max(0, Number(e.target.value) || 0) })} title="실점" />
              </div>
            ))}

            {rivals.length < 3 && (
              <button type="button" className={styles.addRivalBtn} onClick={addRival}>+ 라이벌 추가</button>
            )}
          </div>

          {/* 비교 표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>비교 표</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.compareTable}>
                <thead>
                  <tr><th>팀</th><th>경기</th><th>승점</th><th>득실</th><th>격차</th></tr>
                </thead>
                <tbody>
                  <tr className={styles.ourRow}>
                    <td>{team.name}</td>
                    <td>{stats.played}</td>
                    <td>{stats.points}</td>
                    <td>{stats.goalDiff > 0 ? '+' : ''}{stats.goalDiff}</td>
                    <td>—</td>
                  </tr>
                  {rivalStats.map((r, i) => {
                    const gap = stats.points - r.calc.points
                    return (
                      <tr key={i}>
                        <td>{r.team.name}</td>
                        <td>{r.calc.played}</td>
                        <td>{r.calc.points}</td>
                        <td>{r.calc.goalDiff > 0 ? '+' : ''}{r.calc.goalDiff}</td>
                        <td className={gap > 0 ? styles.gapPos : gap < 0 ? styles.gapNeg : ''}>
                          {gap > 0 ? '+' : ''}{gap}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 추격 분석 */}
          {rivalStats.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rivalStats.map((r, i) => {
                const a = analyzeRival(r)
                const cls =
                  a.status === 'leading' ? styles.overtakeCardLead :
                  a.status === 'chase'   ? styles.overtakeCardChase :
                  a.status === 'impossible' ? styles.overtakeCardImpossible : ''
                return (
                  <div key={i} className={`${styles.overtakeCard} ${cls}`}>
                    <p className={styles.overtakeTitle}>vs {r.team.name}</p>
                    <p className={styles.overtakeBody}>{a.msg}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* 시즌 종료 예상 순위 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>시즌 종료 예상 순위</span>
              <span className={styles.cardLabelHint}>현재 페이스 유지 시</span>
            </div>
            <div className={styles.rankList}>
              {projectedRanking.map((r, i) => {
                const badge = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`
                const cls   = i === 0 ? styles.rankGold : i === 1 ? styles.rankSilver : i === 2 ? styles.rankBronze : styles.rankOther
                return (
                  <div key={i} className={`${styles.rankRow} ${r.isOurs ? styles.ourRank : ''}`}>
                    <span className={`${styles.rankBadge} ${cls}`}>{badge}</span>
                    <span className={styles.rankName}>{r.name}</span>
                    <span className={styles.rankPts}>{r.projected}점</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* 결과 복사 */}
      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}
