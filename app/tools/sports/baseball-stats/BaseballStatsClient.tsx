'use client'

import { useMemo, useState } from 'react'
import styles from './baseball-stats.module.css'

/* ─────────────────────────────────────────────────────────
 * 리그 프리셋
 * ───────────────────────────────────────────────────────── */
const LEAGUES: Array<{ id: string; flag: string; name: string; games: number; cls: string; avgAVG: number; avgOPS: number; avgERA: number; avgWHIP: number }> = [
  { id: 'kbo',     flag: '🇰🇷', name: 'KBO',     games: 144, cls: 'leagueKBO',     avgAVG: 0.275, avgOPS: 0.760, avgERA: 4.65, avgWHIP: 1.40 },
  { id: 'mlb',     flag: '🇺🇸', name: 'MLB',     games: 162, cls: 'leagueMLB',     avgAVG: 0.247, avgOPS: 0.730, avgERA: 4.20, avgWHIP: 1.30 },
  { id: 'npb',     flag: '🇯🇵', name: 'NPB',     games: 143, cls: 'leagueNPB',     avgAVG: 0.250, avgOPS: 0.700, avgERA: 3.50, avgWHIP: 1.27 },
  { id: 'amateur', flag: '🥎',   name: '사회인',  games: 30,  cls: 'leagueAmateur', avgAVG: 0.250, avgOPS: 0.700, avgERA: 5.00, avgWHIP: 1.50 },
  { id: 'custom',  flag: '⚙️',   name: '직접 입력', games: 100, cls: 'leagueCustom', avgAVG: 0.260, avgOPS: 0.730, avgERA: 4.20, avgWHIP: 1.30 },
]

/* OPS 수준 평가 */
function opsLevel(ops: number): { label: string; cls: string } {
  if (ops >= 1.000) return { label: '🌟 MVP급',     cls: styles.lvMVP }
  if (ops >= 0.900) return { label: '✅ 올스타급',  cls: styles.lvAllStar }
  if (ops >= 0.800) return { label: '주전급',        cls: styles.lvRegular }
  if (ops >= 0.700) return { label: '평균',          cls: styles.lvAvg }
  if (ops >= 0.600) return { label: '🔶 평균 이하',  cls: styles.lvBelow }
  return { label: '❌ 백업·교체', cls: styles.lvBackup }
}

/* ERA 수준 평가 (KBO 기준) */
function eraLevel(era: number): { label: string; cls: string } {
  if (era < 2.50) return { label: '🌟 에이스급',     cls: styles.lvMVP }
  if (era < 3.50) return { label: '✅ 선발급',        cls: styles.lvAllStar }
  if (era < 4.50) return { label: '평균',             cls: styles.lvAvg }
  if (era < 5.50) return { label: '🔶 평균 이하',     cls: styles.lvBelow }
  return { label: '❌ 마이너급', cls: styles.lvBackup }
}

/* ─────────────────────────────────────────────────────────
 * 투구 이닝 파서: 5.1 → 5.333..., 5.2 → 5.667...
 * ───────────────────────────────────────────────────────── */
function parseInnings(input: number): number {
  if (!Number.isFinite(input) || input < 0) return 0
  const whole = Math.floor(input)
  const fracTenth = Math.round((input - whole) * 10)
  if (fracTenth === 1) return whole + 1 / 3
  if (fracTenth === 2) return whole + 2 / 3
  return whole + (input - whole) // 그 외는 그대로 (소수)
}

/* ─────────────────────────────────────────────────────────
 * 안전 파싱: 0 미만 막기
 * ───────────────────────────────────────────────────────── */
function n(v: string): number {
  const x = Number(v)
  if (!Number.isFinite(x) || x < 0) return 0
  return x
}

/* 색상 팔레트 — 타격 분포 파이 */
const PIE_COLORS = ['#C8FF3E', '#3EC8FF', '#FF8C3E', '#FFD700']

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function BaseballStatsClient() {
  const [tab, setTab] = useState<'batter' | 'pitcher' | 'pace'>('batter')
  const [leagueId, setLeagueId] = useState('kbo')

  /* 타자 기본 입력 (string으로 저장 → 빈 칸 허용) */
  const [ab,  setAb]  = useState('320')   // 타수
  const [h,   setH]   = useState('97')    // 안타
  const [b2,  setB2]  = useState('20')    // 2루타
  const [b3,  setB3]  = useState('2')     // 3루타
  const [hr,  setHr]  = useState('15')    // 홈런
  const [bb,  setBb]  = useState('45')    // 볼넷
  const [hbp, setHbp] = useState('5')     // 사구
  const [sf,  setSf]  = useState('3')     // 희생플라이

  /* 타자 고급 */
  const [showAdv,  setShowAdv]  = useState(false)
  const [k,   setK]   = useState('72')
  const [sb,  setSb]  = useState('12')
  const [cs,  setCs]  = useState('3')
  const [rbi, setRbi] = useState('58')
  const [run, setRun] = useState('52')
  const [sh,  setSh]  = useState('2')

  /* 시즌 페이스 */
  const [gPlayed, setGPlayed] = useState('80')

  /* 투수 입력 */
  const [pIp,    setPIp]    = useState('120.1')
  const [pEr,    setPEr]    = useState('46')
  const [pR,     setPR]     = useState('52')
  const [pH,     setPH]     = useState('108')
  const [pHr,    setPHr]    = useState('14')
  const [pBb,    setPBb]    = useState('38')
  const [pHbp,   setPHbp]   = useState('5')
  const [pK,     setPK]     = useState('127')
  const [pWin,   setPWin]   = useState('8')
  const [pLoss,  setPLoss]  = useState('5')
  const [pSave,  setPSave]  = useState('0')
  const [pHold,  setPHold]  = useState('0')

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  const league = LEAGUES.find(l => l.id === leagueId)!

  /* ───── 타자 파생 계산 ───── */
  const calc = useMemo(() => {
    const _ab  = n(ab)
    const _h   = n(h)
    const _b2  = n(b2)
    const _b3  = n(b3)
    const _hr  = n(hr)
    const _bb  = n(bb)
    const _hbp = n(hbp)
    const _sf  = n(sf)
    const _k   = n(k)
    const _sb  = n(sb)
    const _cs  = n(cs)
    const _sh  = n(sh)

    // 1루타 (음수 방지)
    const singles = Math.max(0, _h - _b2 - _b3 - _hr)

    // 타석 (자동)
    const pa = _ab + _bb + _hbp + _sf + _sh

    // 타율
    const avg = _ab > 0 ? _h / _ab : 0
    // 출루율
    const obpDen = _ab + _bb + _hbp + _sf
    const obp = obpDen > 0 ? (_h + _bb + _hbp) / obpDen : 0
    // 장타율
    const tb = singles + _b2 * 2 + _b3 * 3 + _hr * 4
    const slg = _ab > 0 ? tb / _ab : 0
    const ops = obp + slg

    // 세이버
    const iso = slg - avg
    const babipDen = _ab - _k - _hr + _sf
    const babip = babipDen > 0 ? (_h - _hr) / babipDen : 0
    const wobaDen = _ab + _bb + _hbp + _sf
    const wobaSimple = wobaDen > 0
      ? (0.69 * _bb + 0.72 * _hbp + 0.89 * singles + 1.27 * _b2 + 1.62 * _b3 + 2.10 * _hr) / wobaDen
      : 0

    const sbAttempts = _sb + _cs
    const sbRate = sbAttempts > 0 ? (_sb / sbAttempts) * 100 : 0

    // 검증 메시지
    const validMsgs: string[] = []
    if (_h < _b2 + _b3 + _hr) validMsgs.push(`안타(${_h}) < 2B+3B+HR(${_b2 + _b3 + _hr}) — 1루타 음수 발생, 입력을 확인하세요.`)
    if (_ab > 0 && pa < _ab) validMsgs.push('타석 합계가 타수보다 작습니다.')
    if (sbAttempts > 0 && _cs > _sb + _cs) validMsgs.push('도루 실패 수치를 확인하세요.')

    return {
      singles, pa, tb,
      avg, obp, slg, ops,
      iso, babip, wobaSimple, sbAttempts, sbRate,
      validMsgs,
    }
  }, [ab, h, b2, b3, hr, bb, hbp, sf, k, sb, cs, sh])

  /* ───── 투수 파생 계산 ───── */
  const pcalc = useMemo(() => {
    const ip   = parseInnings(Number(pIp))
    const er   = n(pEr)
    const _h   = n(pH)
    const _bb  = n(pBb)
    const _hbp = n(pHbp)
    const _hr  = n(pHr)
    const _k   = n(pK)

    const era  = ip > 0 ? (er * 9) / ip : 0
    const whip = ip > 0 ? (_h + _bb) / ip : 0
    const k9   = ip > 0 ? (_k * 9) / ip : 0
    const bb9  = ip > 0 ? (_bb * 9) / ip : 0
    const kbb  = _bb > 0 ? _k / _bb : (_k > 0 ? _k : 0)
    const fip  = ip > 0
      ? ((13 * _hr + 3 * (_bb + _hbp) - 2 * _k) / ip) + 3.1
      : 0

    return { ip, era, whip, k9, bb9, kbb, fip }
  }, [pIp, pEr, pH, pBb, pHbp, pHr, pK])

  /* ───── 시즌 페이스 환산 ───── */
  const pace = useMemo(() => {
    const g = n(gPlayed)
    const total = league.games
    if (g <= 0 || total <= 0) return null
    const ratio = total / g
    const projHits = Math.round(n(h) * ratio)
    const projHr   = Math.round(n(hr) * ratio)
    const projRbi  = Math.round(n(rbi) * ratio)
    const projRun  = Math.round(n(run) * ratio)
    const projSb   = Math.round(n(sb) * ratio)

    return { ratio, projHits, projHr, projRbi, projRun, projSb }
  }, [gPlayed, h, hr, rbi, run, sb, league])

  /* OPS 수준 */
  const opsLv = opsLevel(calc.ops)
  const eraLv = eraLevel(pcalc.era)

  /* 리그 평균 비교 — 막대 그래프 max 값 */
  const compareMax = {
    avg: Math.max(0.500, calc.avg + 0.1),
    obp: Math.max(0.500, calc.obp + 0.1),
    slg: Math.max(0.700, calc.slg + 0.1),
    ops: Math.max(1.200, calc.ops + 0.2),
  }

  /* ───── 파이 차트 (타격 분포) ───── */
  const piePaths = useMemo(() => {
    const total = calc.singles + n(b2) + n(b3) + n(hr)
    if (total === 0) return [] as Array<{ d: string; color: string; label: string; value: number; pct: number }>
    const items = [
      { value: calc.singles, color: PIE_COLORS[0], label: '1루타' },
      { value: n(b2),        color: PIE_COLORS[1], label: '2루타' },
      { value: n(b3),        color: PIE_COLORS[2], label: '3루타' },
      { value: n(hr),        color: PIE_COLORS[3], label: '홈런'   },
    ]
    let acc = 0
    return items.filter(it => it.value > 0).map(it => {
      const start = (acc / total) * Math.PI * 2 - Math.PI / 2
      acc += it.value
      const end = (acc / total) * Math.PI * 2 - Math.PI / 2
      const x1 = 80 + 70 * Math.cos(start)
      const y1 = 80 + 70 * Math.sin(start)
      const x2 = 80 + 70 * Math.cos(end)
      const y2 = 80 + 70 * Math.sin(end)
      const large = end - start > Math.PI ? 1 : 0
      const d = `M 80 80 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 70 70 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`
      return { d, color: it.color, label: it.label, value: it.value, pct: (it.value / total) * 100 }
    })
  }, [calc.singles, b2, b3, hr])

  /* ───── 마일스톤 ───── */
  function milestoneStatus(current: number, target: number): { cls: string; label: string } {
    if (current >= target) return { cls: styles.msReach, label: '✅ 달성' }
    if (current >= target * 0.9) return { cls: styles.msReach, label: '✅ 가능' }
    if (current >= target * 0.7) return { cls: styles.msHard,  label: '🔶 어려움' }
    return { cls: styles.msImpossible, label: '❌ 매우 어려움' }
  }

  /* 결과 복사 */
  function handleCopy() {
    let text = ''
    if (tab === 'batter') {
      text = [
        `── 타자 기록 (${league.name}) ──`,
        `${n(ab)}타수 ${n(h)}안타 ${n(hr)}홈런`,
        `타율 ${calc.avg.toFixed(3)} / 출루율 ${calc.obp.toFixed(3)} / 장타율 ${calc.slg.toFixed(3)}`,
        `OPS ${calc.ops.toFixed(3)} (${opsLv.label})`,
        `리그 평균 OPS ${league.avgOPS.toFixed(3)} 대비 ${calc.ops >= league.avgOPS ? '+' : ''}${(calc.ops - league.avgOPS).toFixed(3)}`,
        'youtil.kr/tools/sports/baseball-stats',
      ].join('\n')
    } else if (tab === 'pitcher') {
      text = [
        `── 투수 기록 (${league.name}) ──`,
        `${pIp}이닝 ${n(pEr)}자책 ${n(pK)}K ${n(pBb)}BB`,
        `ERA ${pcalc.era.toFixed(2)} / WHIP ${pcalc.whip.toFixed(2)} / K/9 ${pcalc.k9.toFixed(1)}`,
        `${eraLv.label}`,
        'youtil.kr/tools/sports/baseball-stats',
      ].join('\n')
    } else if (pace) {
      text = [
        `── 시즌 페이스 환산 (${league.name} ${league.games}경기) ──`,
        `${n(gPlayed)}경기 출전 → 시즌 종료 예상`,
        `안타 ${pace.projHits}개 / 홈런 ${pace.projHr}개 / 타점 ${pace.projRbi}점`,
        `타율 ${calc.avg.toFixed(3)} / OPS ${calc.ops.toFixed(3)}`,
        'youtil.kr/tools/sports/baseball-stats',
      ].join('\n')
    }
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  /* 입력 셀 헬퍼 */
  function StatCell(label: string, abbr: string, value: string, setter: (v: string) => void, cls?: string) {
    return (
      <div className={`${styles.statCell} ${cls ?? ''}`}>
        <div className={styles.statLabel}>{label} <small>({abbr})</small></div>
        <input className={styles.statInput} type="number" inputMode="numeric" min={0} value={value} onChange={e => setter(e.target.value)} />
      </div>
    )
  }

  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚖️ 본 계산기는 통계 참고용입니다.</strong> 실제 KBO·MLB 공식 기록과 소수점 처리 방식 차이로 미세한 차이가 있을 수 있습니다. wOBA·FIP는 간이 공식을 사용해 공식 통계와 약간 다를 수 있습니다.
      </div>

      {/* 리그 프리셋 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>
          <span>리그 선택</span>
          <span className={styles.cardLabelHint}>리그 평균과 자동 비교</span>
        </div>
        <div className={styles.leagueGrid}>
          {LEAGUES.map(l => (
            <button
              key={l.id}
              type="button"
              className={`${styles.leagueBtn} ${styles[l.cls]} ${leagueId === l.id ? styles.leagueActive : ''}`}
              onClick={() => setLeagueId(l.id)}
            >
              {l.flag} {l.name}
              {l.id !== 'custom' && <small>{l.games}경기</small>}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'batter' ? styles.tabActive : ''}`}  onClick={() => setTab('batter')}>타자 기록</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'pitcher' ? styles.tabActive : ''}`} onClick={() => setTab('pitcher')}>투수 기록</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'pace' ? styles.tabActive : ''}`}    onClick={() => setTab('pace')}>시즌 페이스</button>
      </div>

      {/* ─────────────────── 타자 ─────────────────── */}
      {tab === 'batter' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>타자 기록 입력</span>
              <span className={styles.cardLabelHint}>타석 자동 = {calc.pa}</span>
            </div>

            <div className={styles.groupHeader}>기본 타격</div>
            <div className={styles.statGrid}>
              {StatCell('타수', 'AB', ab, setAb)}
              {StatCell('안타', 'H',  h,  setH,  styles.cellH)}
              {StatCell('2루타','2B', b2, setB2)}
              {StatCell('3루타','3B', b3, setB3)}
              {StatCell('홈런', 'HR', hr, setHr, styles.cellHR)}
            </div>

            <div className={styles.groupHeader}>출루</div>
            <div className={styles.statGrid3}>
              {StatCell('볼넷',     'BB',  bb,  setBb,  styles.cellWalk)}
              {StatCell('사구',     'HBP', hbp, setHbp, styles.cellWalk)}
              {StatCell('희생플라이','SF',  sf,  setSf,  styles.cellOut)}
            </div>

            <button type="button" className={styles.advancedToggle} onClick={() => setShowAdv(v => !v)}>
              {showAdv ? '▾' : '▸'} 고급 입력 — 삼진·도루·타점·득점·희생번트
            </button>
            {showAdv && (
              <>
                <div className={styles.groupHeader}>고급 — 클러치·주루</div>
                <div className={styles.statGrid}>
                  {StatCell('삼진',    'K',   k,   setK,   styles.cellOut)}
                  {StatCell('도루',    'SB',  sb,  setSb,  styles.cellRun)}
                  {StatCell('도루실패','CS',  cs,  setCs)}
                  {StatCell('타점',    'RBI', rbi, setRbi, styles.cellRun)}
                  {StatCell('득점',    'R',   run, setRun, styles.cellRun)}
                </div>
                <div className={styles.statGrid3} style={{ marginTop: 6 }}>
                  {StatCell('희생번트','SH', sh, setSh)}
                </div>
              </>
            )}

            {calc.validMsgs.length > 0 && (
              <div className={styles.validMsg}>
                ⚠️ {calc.validMsgs.join(' / ')}
              </div>
            )}
          </div>

          {/* 히어로 */}
          <div className={styles.hero}>
            <p className={styles.heroLead}>OPS</p>
            <p className={styles.heroNum}>{calc.ops.toFixed(3)}</p>
            <span className={`${styles.heroBadge} ${opsLv.cls}`}>{opsLv.label}</span>
          </div>

          {/* 4 KPI */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>타율 (AVG)</div>
              <div className={styles.kpiValue}>{calc.avg.toFixed(3)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>출루율 (OBP)</div>
              <div className={styles.kpiValue}>{calc.obp.toFixed(3)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>장타율 (SLG)</div>
              <div className={styles.kpiValue}>{calc.slg.toFixed(3)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>OPS</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueAccent}`}>{calc.ops.toFixed(3)}</div>
            </div>
          </div>

          {/* 리그 평균 비교 */}
          <div className={styles.compareCard}>
            <div className={styles.cardLabel}>
              <span>{league.name} 평균 비교</span>
              <span className={styles.cardLabelHint}>{league.flag} {league.games}경기 평균</span>
            </div>
            {[
              { title: '타율', mine: calc.avg, league: league.avgAVG, max: compareMax.avg, fmt: 3 },
              { title: '출루율', mine: calc.obp, league: league.avgAVG + 0.063, max: compareMax.obp, fmt: 3 },
              { title: '장타율', mine: calc.slg, league: league.avgOPS - (league.avgAVG + 0.063), max: compareMax.slg, fmt: 3 },
              { title: 'OPS', mine: calc.ops, league: league.avgOPS, max: compareMax.ops, fmt: 3 },
            ].map((row, i) => (
              <div key={i} className={styles.compareRow}>
                <div className={styles.compareTopRow}>
                  <span className={styles.compareTitle}>{row.title}</span>
                  <span className={styles.compareValue}>
                    {row.mine.toFixed(row.fmt)}
                    <span style={{ color: row.mine >= row.league ? '#3EFF9B' : '#FF8C3E', marginLeft: 8, fontSize: 12 }}>
                      ({row.mine >= row.league ? '+' : ''}{(row.mine - row.league).toFixed(row.fmt)})
                    </span>
                  </span>
                </div>
                <div className={styles.compareBar}>
                  <div className={styles.compareBarMine} style={{ width: `${Math.min(100, (row.mine / row.max) * 100)}%` }} />
                  <div className={styles.compareBarLeague} style={{ left: `${Math.min(100, (row.league / row.max) * 100)}%` }} />
                </div>
              </div>
            ))}
            <div className={styles.compareLegend}>
              <span><span className={`${styles.legendDot} ${styles.legendDotMine}`} />내 기록</span>
              <span><span className={`${styles.legendDot} ${styles.legendDotLeague}`} />리그 평균</span>
            </div>
          </div>

          {/* 타격 분포 파이 */}
          {piePaths.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>타격 분포</span>
                <span className={styles.cardLabelHint}>안타 {n(h)}개 기준</span>
              </div>
              <div className={styles.pieWrap}>
                <svg className={styles.pieSvg} viewBox="0 0 160 160" aria-hidden="true">
                  {piePaths.map((p, i) => (
                    <path key={i} d={p.d} fill={p.color} />
                  ))}
                </svg>
                <div className={styles.pieLegend}>
                  {piePaths.map((p, i) => (
                    <div key={i} className={styles.pieRow}>
                      <span><span className={styles.pieDot} style={{ background: p.color }} />{p.label} ({p.value})</span>
                      <strong>{p.pct.toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 고급 지표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>세이버메트릭스 (고급 지표)</span>
              <span className={styles.cardLabelHint}>ⓘ 호버 시 설명</span>
            </div>
            <div className={styles.advGrid}>
              <div className={styles.advCard}>
                <div className={styles.advLabel}>
                  ISO (순수 장타력)
                  <span className={styles.advTip} data-tip="장타율 − 타율, 단타 외 장타 비율">ⓘ</span>
                </div>
                <div className={styles.advValue}>{calc.iso.toFixed(3)}</div>
                <div className={styles.advSub}>{calc.iso >= 0.200 ? '슬러거급' : calc.iso >= 0.140 ? '평균 이상' : '평균 이하'}</div>
              </div>
              <div className={styles.advCard}>
                <div className={styles.advLabel}>
                  BABIP (인플레이 타율)
                  <span className={styles.advTip} data-tip="인플레이 타구의 타율, 운 요소 판단">ⓘ</span>
                </div>
                <div className={styles.advValue}>{calc.babip.toFixed(3)}</div>
                <div className={styles.advSub}>{calc.babip >= 0.350 ? '운빨 의심' : calc.babip <= 0.250 ? '불운 가능' : '평균 수준'}</div>
              </div>
              <div className={styles.advCard}>
                <div className={styles.advLabel}>
                  wOBA (간이)
                  <span className={styles.advTip} data-tip="타격 가치를 출루율 척도로 통합">ⓘ</span>
                </div>
                <div className={styles.advValue}>{calc.wobaSimple.toFixed(3)}</div>
                <div className={styles.advSub}>{calc.wobaSimple >= 0.370 ? '엘리트' : calc.wobaSimple >= 0.330 ? '평균 이상' : '평균 이하'}</div>
              </div>
              <div className={styles.advCard}>
                <div className={styles.advLabel}>
                  도루 성공률
                  <span className={styles.advTip} data-tip="SB ÷ (SB + CS) — 75% 이상 권장">ⓘ</span>
                </div>
                <div className={styles.advValue}>{calc.sbAttempts > 0 ? `${calc.sbRate.toFixed(0)}%` : '—'}</div>
                <div className={styles.advSub}>{calc.sbAttempts > 0 ? `${n(sb)}회 / ${calc.sbAttempts}회 시도` : '입력 없음'}</div>
              </div>
            </div>
          </div>

          {/* 명선수 비교 표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>역대 명선수 비교 (KBO)</span>
              <span className={styles.cardLabelHint}>통산 기록</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.legendTable}>
                <thead>
                  <tr><th>선수</th><th>AVG</th><th>OBP</th><th>SLG</th><th>OPS</th></tr>
                </thead>
                <tbody>
                  <tr className={styles.ourRow}>
                    <td>내 기록</td>
                    <td>{calc.avg.toFixed(3)}</td>
                    <td>{calc.obp.toFixed(3)}</td>
                    <td>{calc.slg.toFixed(3)}</td>
                    <td>{calc.ops.toFixed(3)}</td>
                  </tr>
                  <tr><td>이승엽</td><td>0.302</td><td>0.378</td><td>0.519</td><td>0.897</td></tr>
                  <tr><td>양준혁</td><td>0.316</td><td>0.421</td><td>0.497</td><td>0.918</td></tr>
                  <tr><td>장종훈</td><td>0.291</td><td>0.398</td><td>0.521</td><td>0.919</td></tr>
                  <tr><td>이정후</td><td>0.340</td><td>0.407</td><td>0.491</td><td>0.898</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─────────────────── 투수 ─────────────────── */}
      {tab === 'pitcher' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>투수 기록 입력</span>
              <span className={styles.cardLabelHint}>이닝 5.1 = 5⅓</span>
            </div>

            <div className={styles.groupHeader}>기본 — 이닝·실점·피안타</div>
            <div className={styles.statGrid}>
              <div className={styles.statCell}>
                <div className={styles.statLabel}>투구이닝 <small>(IP)</small></div>
                <input className={styles.statInput} type="number" inputMode="decimal" min={0} step={0.1} value={pIp} onChange={e => setPIp(e.target.value)} />
              </div>
              {StatCell('자책점', 'ER', pEr, setPEr, styles.cellOut)}
              {StatCell('실점',   'R',  pR,  setPR)}
              {StatCell('피안타', 'H',  pH,  setPH, styles.cellH)}
              {StatCell('피홈런', 'HR', pHr, setPHr, styles.cellHR)}
            </div>

            <div className={styles.groupHeader}>볼넷·삼진</div>
            <div className={styles.statGrid3}>
              {StatCell('볼넷', 'BB',  pBb,  setPBb, styles.cellWalk)}
              {StatCell('사구', 'HBP', pHbp, setPHbp, styles.cellWalk)}
              {StatCell('탈삼진','K',  pK,   setPK,  styles.cellRun)}
            </div>

            <div className={styles.groupHeader}>승·패·세이브·홀드</div>
            <div className={styles.statGrid}>
              {StatCell('승',     'W',  pWin,  setPWin,  styles.cellWin)}
              {StatCell('패',     'L',  pLoss, setPLoss, styles.cellLoss)}
              {StatCell('세이브', 'SV', pSave, setPSave)}
              {StatCell('홀드',   'HLD',pHold, setPHold)}
            </div>
          </div>

          {/* 히어로 */}
          <div className={styles.hero}>
            <p className={styles.heroLead}>ERA</p>
            <p className={styles.heroNum}>{pcalc.era.toFixed(2)}</p>
            <span className={`${styles.heroBadge} ${eraLv.cls}`}>{eraLv.label}</span>
          </div>

          {/* 4 KPI */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>ERA</div>
              <div className={`${styles.kpiValue} ${styles.kpiValueAccent}`}>{pcalc.era.toFixed(2)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>WHIP</div>
              <div className={styles.kpiValue}>{pcalc.whip.toFixed(2)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>K/9</div>
              <div className={styles.kpiValue}>{pcalc.k9.toFixed(1)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>BB/9</div>
              <div className={styles.kpiValue}>{pcalc.bb9.toFixed(1)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>K/BB</div>
              <div className={styles.kpiValue}>{pcalc.kbb.toFixed(2)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>FIP (간이)</div>
              <div className={styles.kpiValue}>{pcalc.fip.toFixed(2)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>실투 이닝</div>
              <div className={styles.kpiValue}>{pcalc.ip.toFixed(2)}</div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiLabel}>승-패-S-H</div>
              <div className={styles.kpiValue} style={{ fontSize: 18 }}>{n(pWin)}-{n(pLoss)}-{n(pSave)}-{n(pHold)}</div>
            </div>
          </div>

          {/* 리그 평균 비교 */}
          <div className={styles.compareCard}>
            <div className={styles.cardLabel}>
              <span>{league.name} 투수 평균 비교</span>
              <span className={styles.cardLabelHint}>{league.flag} 평균 ERA {league.avgERA.toFixed(2)} / WHIP {league.avgWHIP.toFixed(2)}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              내 ERA <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{pcalc.era.toFixed(2)}</strong> 는 리그 평균 {league.avgERA.toFixed(2)} 대비
              <strong style={{ color: pcalc.era <= league.avgERA ? '#3EFF9B' : '#FF8C3E', marginLeft: 6 }}>
                {pcalc.era <= league.avgERA ? '−' : '+'}{Math.abs(pcalc.era - league.avgERA).toFixed(2)}
              </strong>
              {pcalc.era <= league.avgERA ? ' (좋음)' : ' (나쁨)'}.
              {pcalc.fip > 0 && (
                <>
                  <br />
                  <strong style={{ color: 'var(--text)' }}>FIP({pcalc.fip.toFixed(2)})</strong> 가 ERA보다 {pcalc.fip < pcalc.era ? '낮음 → 운이 나빴을 가능성' : '높음 → 운이 좋았을 가능성'}.
                </>
              )}
            </p>
          </div>
        </>
      )}

      {/* ─────────────────── 시즌 페이스 ─────────────────── */}
      {tab === 'pace' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>시즌 페이스 환산 입력</span>
              <span className={styles.cardLabelHint}>{league.name} {league.games}경기 기준</span>
            </div>
            <div className={styles.statGrid3}>
              <div className={styles.statCell}>
                <div className={styles.statLabel}>출전 경기 <small>(G)</small></div>
                <input className={styles.statInput} type="number" inputMode="numeric" min={0} value={gPlayed} onChange={e => setGPlayed(e.target.value)} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              현재 입력한 타자 기록(타수·안타·홈런·타점·득점·도루)이 풀시즌까지 동일 페이스로 유지된다고 가정한 환산입니다.
            </p>
          </div>

          {pace ? (
            <>
              <div className={styles.hero}>
                <p className={styles.heroLead}>시즌 종료 예상 기록</p>
                <p className={styles.heroNum}>{pace.projHits}<span style={{ fontSize: 18, color: 'var(--muted)', marginLeft: 6, verticalAlign: 'middle' }}>안타</span></p>
                <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
                  현재 페이스 × <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{pace.ratio.toFixed(2)}</strong>
                </p>
              </div>

              <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>예상 안타</div>
                  <div className={`${styles.kpiValue} ${styles.kpiValueAccent}`}>{pace.projHits}</div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>예상 홈런</div>
                  <div className={styles.kpiValue}>{pace.projHr}</div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>예상 타점</div>
                  <div className={styles.kpiValue}>{pace.projRbi}</div>
                </div>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiLabel}>예상 득점</div>
                  <div className={styles.kpiValue}>{pace.projRun}</div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>
                  <span>마일스톤 도달 가능성</span>
                  <span className={styles.cardLabelHint}>현재 페이스 기준</span>
                </div>
                {(() => {
                  const items = [
                    { title: '🎯 30홈런 도달',  current: pace.projHr,  target: 30 },
                    { title: '🎯 100타점 도달', current: pace.projRbi, target: 100 },
                    { title: '🎯 100득점 도달', current: pace.projRun, target: 100 },
                    { title: '🎯 200안타 도달', current: pace.projHits, target: 200 },
                    { title: '🎯 30도루 도달', current: pace.projSb, target: 30 },
                  ]
                  return items.map((m, i) => {
                    const s = milestoneStatus(m.current, m.target)
                    return (
                      <div key={i} className={styles.milestoneCard}>
                        <div className={styles.milestoneInfo}>
                          <span className={styles.milestoneTitle}>{m.title}</span>
                          <span className={styles.milestoneSub}>현재 페이스 <strong>{m.current}</strong> / 목표 <strong>{m.target}</strong></span>
                        </div>
                        <span className={`${styles.milestoneBadge} ${s.cls}`}>{s.label}</span>
                      </div>
                    )
                  })
                })()}
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>
                  <span>30-30 클럽 가능성</span>
                  <span className={styles.cardLabelHint}>홈런 30 + 도루 30</span>
                </div>
                {(() => {
                  const ok = pace.projHr >= 30 && pace.projSb >= 30
                  const cls = ok ? styles.msReach : pace.projHr >= 25 && pace.projSb >= 25 ? styles.msHard : styles.msImpossible
                  const label = ok ? '✅ 가능' : pace.projHr >= 25 && pace.projSb >= 25 ? '🔶 도전권' : '❌ 매우 어려움'
                  return (
                    <div className={styles.milestoneCard}>
                      <div className={styles.milestoneInfo}>
                        <span className={styles.milestoneTitle}>30-30 클럽 가입</span>
                        <span className={styles.milestoneSub}>홈런 <strong>{pace.projHr}</strong> · 도루 <strong>{pace.projSb}</strong></span>
                      </div>
                      <span className={`${styles.milestoneBadge} ${cls}`}>{label}</span>
                    </div>
                  )
                })()}
              </div>

              <div className={styles.card}>
                <div className={styles.cardLabel}>
                  <span>KBO 역대 단일시즌 기록 비교</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                  <div>최다 안타 — <strong style={{ color: 'var(--text)' }}>서건창 201개 (2014)</strong> · 내 페이스: <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{pace.projHits}개</strong></div>
                  <div>최다 홈런 — <strong style={{ color: 'var(--text)' }}>이승엽 56개 (2003)</strong> · 내 페이스: <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{pace.projHr}개</strong></div>
                  <div>최고 OPS — <strong style={{ color: 'var(--text)' }}>이승엽 1.124 (2003)</strong> · 내 OPS: <strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{calc.ops.toFixed(3)}</strong></div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.disclaimer} style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
              출전 경기 수를 입력하면 시즌 종료 예상 기록을 자동 환산합니다.
            </div>
          )}
        </>
      )}

      {/* 결과 복사 */}
      <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
      </button>
    </div>
  )
}
