/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import styles from './strength-level.module.css'

/* ─────────────────────────────────────────────────────────
 * 타입 & 기준 데이터
 * ───────────────────────────────────────────────────────── */
type Sex = 'male' | 'female'
type AgeGroup = '20s' | '30s' | '40s' | '50s' | '60s'
type LiftKey = 'squat' | 'bench' | 'deadlift'
type TabKey = 'level' | 'attempt' | 'plate' | 'record'

const LIFTS: { key: LiftKey; label: string; emoji: string }[] = [
  { key: 'squat',    label: '스쿼트',     emoji: '🦵' },
  { key: 'bench',    label: '벤치프레스', emoji: '🏋️' },
  { key: 'deadlift', label: '데드리프트', emoji: '💀' },
]

const TABS: { key: TabKey; label: string }[] = [
  { key: 'level',   label: '수준·점수' },
  { key: 'attempt', label: '시도 전략' },
  { key: 'plate',   label: '대회 원판' },
  { key: 'record',  label: '내 기록' },
]

/* 20대 남성 기준 체중 대비 기준값 [초보, 중급, 상급, 엘리트] — 1RM 계산기와 동일 */
const BASE: Record<LiftKey, number[]> = {
  squat:    [0.75, 1.25, 1.5, 2.0],
  bench:    [0.5,  1.0,  1.25, 1.5],
  deadlift: [1.0,  1.5,  2.0, 2.5],
}

/* 레벨명 — index 0 = 초보 미만(입문) */
const LEVELS = ['입문', '초보', '중급', '상급', '엘리트']
const LEVEL_COLORS = ['var(--muted)', '#059669', '#0EA5E9', '#EA580C', '#DC2626']

/* 연령 보정 (1RM 계산기와 동일) */
const AGE_FACTOR: Record<AgeGroup, number> = { '20s': 1, '30s': 0.95, '40s': 0.85, '50s': 0.75, '60s': 0.65 }
const AGE_LABEL: Record<AgeGroup, string> = { '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대', '60s': '60대+' }

/* ─────────────────────────────────────────────────────────
 * 헬퍼
 * ───────────────────────────────────────────────────────── */
function sanitize(s: string): string {
  let v = s.replace(/[^0-9.]/g, '')
  const i = v.indexOf('.')
  if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, '')
  return v
}
const num = (s: string): number => {
  const v = parseFloat(s)
  return Number.isFinite(v) ? v : 0
}
const fmtKg = (n: number): string =>
  (Math.round(n * 10) / 10).toLocaleString('ko-KR', { maximumFractionDigits: 1 })

function levelOf(ratio: number, thresholds: number[]): number {
  let idx = 0
  for (let i = 0; i < thresholds.length; i++) if (ratio >= thresholds[i]) idx = i + 1
  return idx
}

/* Wilks(원판) 점수 — 체중·합계 기반, 성별 다항식 */
function wilks(total: number, bw: number, sex: Sex): number {
  if (bw < 30 || total <= 0) return 0
  const c = sex === 'male'
    ? [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8]
    : [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8]
  const d = c[0] + c[1] * bw + c[2] * bw ** 2 + c[3] * bw ** 3 + c[4] * bw ** 4 + c[5] * bw ** 5
  return d !== 0 ? (total * 500) / d : 0
}

/* DOTS 점수 — 현대 표준, 성별 다항식 */
function dots(total: number, bw: number, sex: Sex): number {
  if (bw < 30 || total <= 0) return 0
  const c = sex === 'male'
    ? [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093]
    : [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706]
  const d = c[0] + c[1] * bw + c[2] * bw ** 2 + c[3] * bw ** 3 + c[4] * bw ** 4
  return d !== 0 ? (total * 500) / d : 0
}

/* IPF GL Points — 클래식(논장비) 풀파워 기준, 2020 공식 */
function ipfGL(total: number, bw: number, sex: Sex): number {
  if (bw < 40 || total <= 0) return 0
  const [A, B, C] = sex === 'male'
    ? [1199.72839, 1025.18162, 0.00921]
    : [610.32796, 1045.59282, 0.03048]
  const denom = A - B * Math.exp(-C * bw)
  return denom > 0 ? (100 * total) / denom : 0
}

function scoreBand(s: number): string {
  if (s <= 0) return '—'
  if (s < 200) return '입문~초급 수준'
  if (s < 300) return '중급 수준'
  if (s < 400) return '상급 수준'
  if (s < 500) return '매우 우수'
  return '엘리트급'
}

/* 대회 시도 라운딩 — 바벨 2.5kg 단위 */
const round25 = (x: number) => Math.round(x / 2.5) * 2.5
const floor25 = (x: number) => Math.floor(x / 2.5 + 1e-9) * 2.5
function attemptSet(oneRM: number): { first: number; second: number; third: number } | null {
  if (oneRM <= 0) return null
  return { first: floor25(oneRM * 0.90), second: round25(oneRM * 0.95), third: round25(oneRM) }
}

/* 대회 원판 — IPF/IWF kg 색상, 바 20kg + 칼라 2.5kg×2 = 25kg base */
const BAR = 20, COLLAR = 2.5
type Plate = { kg: number; color: string; dark?: boolean }
const PLATES: Plate[] = [
  { kg: 25,   color: '#C0392B' },
  { kg: 20,   color: '#1D4ED8' },
  { kg: 15,   color: '#CA9A04' },
  { kg: 10,   color: '#15803D' },
  { kg: 5,    color: '#E5E7EB', dark: true },
  { kg: 2.5,  color: '#1F2937' },
  { kg: 1.25, color: '#9CA3AF', dark: true },
]
function platesFor(target: number): { side: Plate[]; loadable: boolean; actual: number; base: number } {
  const base = BAR + 2 * COLLAR
  const side: Plate[] = []
  let perSide = Math.max(0, (target - base) / 2)
  for (const p of PLATES) while (perSide >= p.kg - 1e-9) { side.push(p); perSide -= p.kg }
  const loadable = target >= base && perSide < 1e-6
  const actual = base + 2 * (Math.max(0, (target - base) / 2) - perSide)
  return { side, loadable, actual, base }
}

/* 내 기록 (localStorage) */
type Rec = { id: string; date: string; sex: Sex; bw: number; total: number; dots: number; ipfgl: number }
const REC_KEY = 'youtil:strength-level:records-v1'
function loadRecs(): Rec[] {
  try { const r = localStorage.getItem(REC_KEY); const a = r ? JSON.parse(r) : []; return Array.isArray(a) ? a : [] }
  catch { return [] }
}
function saveRecs(r: Rec[]): void {
  try { localStorage.setItem(REC_KEY, JSON.stringify(r)) } catch { /* noop */ }
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function StrengthLevelClient() {
  const [tab, setTab] = useState<TabKey>('level')
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState<AgeGroup>('20s')
  const [bwStr, setBwStr] = useState('75')
  const [squatStr, setSquatStr] = useState('100')
  const [benchStr, setBenchStr] = useState('70')
  const [deadStr, setDeadStr] = useState('130')
  const [copied, setCopied] = useState(false)
  const [targetStr, setTargetStr] = useState('100')   // 대회 원판 목표 무게
  const [recs, setRecs] = useState<Rec[]>([])
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setRecs(loadRecs()); setMounted(true) }, [])

  const bw = num(bwStr)
  const squat = num(squatStr)
  const bench = num(benchStr)
  const dead = num(deadStr)
  const total = squat + bench + dead
  const factor = (sex === 'female' ? 0.7 : 1) * AGE_FACTOR[age]

  const liftVals: Record<LiftKey, number> = { squat, bench, deadlift: dead }
  const perLift = LIFTS.map(({ key, label, emoji }) => {
    const w = liftVals[key]
    const thresholds = BASE[key].map((t) => t * factor)
    const ratio = bw > 0 ? w / bw : 0
    const idx = w > 0 && bw > 0 ? levelOf(ratio, thresholds) : 0
    const nextThreshold = idx < 4 ? thresholds[idx] : null
    const needKg = nextThreshold !== null && bw > 0 ? Math.max(0, nextThreshold * bw - w) : 0
    return { key, label, emoji, w, ratio, idx, needKg, hasNext: idx < 4, valid: w > 0 && bw > 0 }
  })

  const totalThresholds = [0, 1, 2, 3].map(
    (i) => (BASE.squat[i] + BASE.bench[i] + BASE.deadlift[i]) * factor
  )
  const totalRatio = bw > 0 ? total / bw : 0
  const overallIdx = total > 0 && bw > 0 ? levelOf(totalRatio, totalThresholds) : 0
  const wilksScore = wilks(total, bw, sex)
  const dotsScore = dots(total, bw, sex)
  const ipfScore = ipfGL(total, bw, sex)
  const valid = bw > 0 && total > 0

  // 시도 — 종목별 1·2·3차 + 3차 합계 투영
  const attempts = LIFTS.map(({ key, label, emoji }) => ({ key, label, emoji, set: attemptSet(liftVals[key]) }))
  const projTotal = attempts.reduce((a, x) => a + (x.set?.third ?? 0), 0)
  const projDots = dots(projTotal, bw, sex)
  const projIpf = ipfGL(projTotal, bw, sex)

  // 원판
  const target = num(targetStr)
  const plate = platesFor(target)
  // 시도 무게 퀵버튼용
  const attemptQuick = attempts.flatMap((a) =>
    a.set ? [
      { label: `${a.label} 1차`, kg: a.set.first },
      { label: `${a.label} 3차`, kg: a.set.third },
    ] : []
  )

  function handleCopy() {
    const txt = [
      '── 파워리프팅 ──',
      `${sex === 'male' ? '남성' : '여성'} · ${AGE_LABEL[age]} · 체중 ${fmtKg(bw)}kg`,
      `스쿼트 ${fmtKg(squat)} / 벤치 ${fmtKg(bench)} / 데드 ${fmtKg(dead)} (kg)`,
      `3대 합: ${fmtKg(total)}kg (체중 ${totalRatio.toFixed(2)}배) · 종합 ${LEVELS[overallIdx]}`,
      `DOTS ${dotsScore.toFixed(1)} · Wilks ${wilksScore.toFixed(1)} · IPF GL ${ipfScore.toFixed(1)}`,
      'youtil.kr/tools/sports/strength-level',
    ].join('\n')
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  function saveRecord() {
    if (!valid) return
    const d = new Date()
    const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    const id = `${d.getTime()}`
    const next = [{ id, date, sex, bw, total, dots: dotsScore, ipfgl: ipfScore }, ...recs].slice(0, 50)
    setRecs(next); saveRecs(next)
    setSaved(true); window.setTimeout(() => setSaved(false), 1200)
  }
  function delRecord(id: string) {
    const next = recs.filter((r) => r.id !== id)
    setRecs(next); saveRecs(next)
  }

  // 추이 (오래된→최신 순으로 첫↔최근)
  const recOldFirst = [...recs].reverse()
  const firstRec = recOldFirst[0]
  const lastRec = recOldFirst[recOldFirst.length - 1]
  const hasTrend = recs.length >= 2 && firstRec && lastRec

  return (
    <div className={styles.wrap}>
      {/* ── 공유 입력: 기본 정보 ── */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>기본 정보</span>
        <div className={styles.row2}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>성별</span>
            <div className={styles.segment} role="group" aria-label="성별">
              <button type="button" aria-pressed={sex === 'male'} className={`${styles.segBtn} ${sex === 'male' ? styles.segActive : ''}`} onClick={() => setSex('male')}>남성</button>
              <button type="button" aria-pressed={sex === 'female'} className={`${styles.segBtn} ${sex === 'female' ? styles.segActive : ''}`} onClick={() => setSex('female')}>여성</button>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="sl-bw">체중 (kg)</label>
            <input id="sl-bw" className={styles.input} type="text" inputMode="decimal"
              value={bwStr} onChange={(e) => setBwStr(sanitize(e.target.value))} placeholder="예: 75" />
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>연령대</span>
          <div className={styles.pillRow} role="group" aria-label="연령대">
            {(Object.keys(AGE_LABEL) as AgeGroup[]).map((a) => (
              <button key={a} type="button" aria-pressed={age === a}
                className={`${styles.pill} ${age === a ? styles.pillActive : ''}`} onClick={() => setAge(a)}>
                {AGE_LABEL[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 공유 입력: 3대 ── */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>3대 운동 최대 중량 (1RM, kg)</span>
        <div className={styles.liftInputs}>
          {LIFTS.map(({ key, label, emoji }) => {
            const v = key === 'squat' ? squatStr : key === 'bench' ? benchStr : deadStr
            const set = key === 'squat' ? setSquatStr : key === 'bench' ? setBenchStr : setDeadStr
            return (
              <div key={key} className={styles.field}>
                <label className={styles.fieldLabel} htmlFor={`sl-${key}`}>{emoji} {label}</label>
                <input id={`sl-${key}`} className={styles.input} type="text" inputMode="decimal"
                  value={v} onChange={(e) => set(sanitize(e.target.value))} placeholder="0" />
              </div>
            )
          })}
        </div>
        <p className={styles.helpText}>
          1RM(1회 최대 중량)을 모르면 <a href="/tools/sports/one-rm" className={styles.link}>1RM 계산기</a>로 먼저 추정하세요.
        </p>
      </div>

      {/* ── 탭 ── */}
      <div className={styles.tabs} role="tablist" aria-label="파워리프팅 도구">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 탭: 수준·점수 ── */}
      {tab === 'level' && (valid ? (
        <>
          <div className={styles.hero} role="status">
            <p className={styles.heroLabel}>3대 합 (스쿼트+벤치+데드)</p>
            <p className={styles.heroValue}><strong>{fmtKg(total)}</strong> kg</p>
            <p className={styles.heroSub}>체중의 {totalRatio.toFixed(2)}배</p>
            <span className={styles.overallBadge} style={{ background: LEVEL_COLORS[overallIdx], color: '#fff' }}>
              종합 {LEVELS[overallIdx]}
            </span>
          </div>

          <div className={styles.scoreGrid}>
            <div className={styles.scoreCard}>
              <span className={styles.scoreName}>DOTS</span>
              <span className={styles.scoreValue}>{dotsScore.toFixed(1)}</span>
              <span className={styles.scoreBand}>{scoreBand(dotsScore)}</span>
            </div>
            <div className={styles.scoreCard}>
              <span className={styles.scoreName}>Wilks</span>
              <span className={styles.scoreValue}>{wilksScore.toFixed(1)}</span>
              <span className={styles.scoreBand}>{scoreBand(wilksScore)}</span>
            </div>
            <div className={styles.scoreCard}>
              <span className={styles.scoreName}>IPF GL</span>
              <span className={styles.scoreValue}>{ipfScore.toFixed(1)}</span>
              <span className={styles.scoreBand}>클래식 기준</span>
            </div>
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>종목별 레벨</span>
            <div className={styles.liftList}>
              {perLift.map((p) => (
                <div key={p.key} className={styles.liftRow}>
                  <div className={styles.liftHead}>
                    <span className={styles.liftName}>{p.emoji} {p.label}</span>
                    <span className={styles.liftMeta}>
                      {p.valid ? (
                        <>
                          <strong style={{ color: LEVEL_COLORS[p.idx] }}>{LEVELS[p.idx]}</strong>
                          <span className={styles.liftRatio}> · 체중 {p.ratio.toFixed(2)}배</span>
                        </>
                      ) : (<span className={styles.liftRatio}>중량 입력</span>)}
                    </span>
                  </div>
                  <div className={styles.levelBar} aria-hidden>
                    {LEVELS.map((lv, i) => (
                      <div key={lv} className={styles.levelSeg}
                        style={{ background: p.valid && i <= p.idx ? LEVEL_COLORS[p.idx] : 'var(--bg3)', opacity: p.valid && i <= p.idx ? 1 : 0.5 }}
                        title={lv} />
                    ))}
                  </div>
                  {p.valid && p.hasNext && (
                    <p className={styles.nextLine}>다음 레벨(<strong>{LEVELS[p.idx + 1]}</strong>)까지 <strong>+{fmtKg(p.needKg)}kg</strong></p>
                  )}
                  {p.valid && !p.hasNext && <p className={styles.nextLine}>최고 등급에 도달했습니다 🎉</p>}
                </div>
              ))}
            </div>
            <p className={styles.helpText}>
              {sex === 'female' ? '여성' : '남성'} · {AGE_LABEL[age]} 기준 보정(계수 {factor.toFixed(3)}×). 점수는 참고·발전용이며 타인과 비교해 압박받을 필요는 없습니다.
            </p>
          </div>

          <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
          </button>
        </>
      ) : (
        <div className={styles.emptyHint}>체중과 3대 중량을 입력하면 레벨·DOTS·Wilks·IPF GL 점수가 표시됩니다.</div>
      ))}

      {/* ── 탭: 시도 전략 ── */}
      {tab === 'attempt' && (
        <div className={styles.card}>
          <span className={styles.cardLabel}>대회 시도 (1·2·3차) — 2.5kg 단위</span>
          {projTotal > 0 ? (
            <>
              <div className={styles.attemptList}>
                {attempts.map((a) => (
                  <div key={a.key} className={styles.attemptRow}>
                    <span className={styles.attemptName}>{a.emoji} {a.label}</span>
                    {a.set ? (
                      <div className={styles.attemptVals}>
                        <span className={styles.attBox}><b className={styles.attN}>1차</b>{fmtKg(a.set.first)}</span>
                        <span className={styles.attBox}><b className={styles.attN}>2차</b>{fmtKg(a.set.second)}</span>
                        <span className={`${styles.attBox} ${styles.attThird}`}><b className={styles.attN}>3차</b>{fmtKg(a.set.third)}</span>
                      </div>
                    ) : <span className={styles.liftRatio}>1RM 입력</span>}
                  </div>
                ))}
              </div>
              <div className={styles.projBox}>
                <span>3차 성공 시 합계 <strong>{fmtKg(projTotal)}kg</strong></span>
                {valid && <span className={styles.projScore}>DOTS {projDots.toFixed(1)} · IPF GL {projIpf.toFixed(1)}</span>}
              </div>
              <p className={styles.helpText}>
                1차(오프너)는 1RM의 약 90%를 <strong>내림</strong>해 확실히 드는 무게로 — 실격을 막는 보험입니다. 2차 ~95%, 3차는 현재 1RM(≈100%). PR에 도전하면 3차에 +2.5~5kg. 95%+ 시도는 폼·세이프티·스포터 필수.
              </p>
            </>
          ) : (
            <div className={styles.emptyHint}>위에 3대 1RM을 입력하면 종목별 1·2·3차 시도가 제안됩니다.</div>
          )}
        </div>
      )}

      {/* ── 탭: 대회 원판 ── */}
      {tab === 'plate' && (
        <div className={styles.card}>
          <span className={styles.cardLabel}>대회 원판 세팅 (바 20kg + 칼라 2.5kg×2)</span>
          <div className={styles.plateInputRow}>
            <input className={styles.input} type="text" inputMode="decimal" aria-label="목표 무게 (kg)"
              value={targetStr} onChange={(e) => setTargetStr(sanitize(e.target.value))} placeholder="목표 무게" />
            <span className={styles.plateUnit}>kg</span>
          </div>
          {attemptQuick.length > 0 && (
            <div className={styles.plateQuick}>
              {attemptQuick.map((q, i) => (
                <button key={i} type="button" className={styles.quickBtn} onClick={() => setTargetStr(String(q.kg))}>
                  {q.label} {fmtKg(q.kg)}
                </button>
              ))}
            </div>
          )}
          {target >= plate.base ? (
            <>
              <div className={styles.plateStack} role="img"
                aria-label={`한쪽 원판: ${plate.side.length ? plate.side.map((p) => p.kg + 'kg').join(', ') : '없음(바와 칼라만)'}`}>
                {plate.side.length === 0
                  ? <span className={styles.plateNone}>바 + 칼라만 (25kg)</span>
                  : plate.side.map((p, i) => (
                    <span key={i} className={styles.plateChip}
                      style={{ background: p.color, color: p.dark ? '#111' : '#fff', borderColor: p.dark ? 'var(--border)' : p.color }}>
                      {p.kg}
                    </span>
                  ))}
              </div>
              <p className={styles.plateLine}>
                한쪽 = {plate.side.length ? plate.side.map((p) => fmtKg(p.kg)).join(' + ') + ' kg' : '없음'} · 양쪽 동일
              </p>
              {!plate.loadable && (
                <p className={styles.plateWarn}>
                  ⚠️ {fmtKg(target)}kg는 2.5kg 단위로 정확히 맞지 않습니다 — 실제 장착 가능 ≈ <strong>{fmtKg(plate.actual)}kg</strong> (양쪽 0.25/0.5kg 원판이 있으면 조정 가능).
                </p>
              )}
            </>
          ) : (
            <div className={styles.emptyHint}>목표 무게를 25kg(바+칼라) 이상으로 입력하세요.</div>
          )}
          <p className={styles.helpText}>
            색상은 IPF/IWF kg 규격(25 빨강·20 파랑·15 노랑·10 초록·5 흰색·2.5·1.25 소형). 대회 칼라는 한쪽 2.5kg입니다. 일반 헬스장 칼라(0.5~1kg 안팎)와 다를 수 있으니 실제 봉·칼라 무게를 확인하세요.
          </p>
        </div>
      )}

      {/* ── 탭: 내 기록 ── */}
      {tab === 'record' && (
        <div className={styles.card}>
          <span className={styles.cardLabel}>내 기록 (이 기기에 저장)</span>
          <button type="button" className={`${styles.copyBtn} ${saved ? styles.copied : ''}`}
            onClick={saveRecord} disabled={!valid}
            style={!valid ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
            {saved ? '✓ 저장됨' : '＋ 현재 합계·점수 저장'}
          </button>
          {!valid && <p className={styles.helpText}>체중과 3대 중량을 입력한 뒤 저장하세요.</p>}

          {mounted && hasTrend && (
            <div className={styles.trendBox}>
              <span>첫 기록 대비</span>
              <strong className={lastRec.total - firstRec.total >= 0 ? styles.trendUp : styles.trendDown}>
                합계 {lastRec.total - firstRec.total >= 0 ? '+' : ''}{fmtKg(lastRec.total - firstRec.total)}kg
              </strong>
              <strong className={lastRec.dots - firstRec.dots >= 0 ? styles.trendUp : styles.trendDown}>
                DOTS {lastRec.dots - firstRec.dots >= 0 ? '+' : ''}{(lastRec.dots - firstRec.dots).toFixed(1)}
              </strong>
            </div>
          )}

          {mounted && recs.length > 0 ? (
            <div className={styles.recList}>
              {recs.map((r) => (
                <div key={r.id} className={styles.recItem}>
                  <span className={styles.recDate}>{r.date}</span>
                  <span className={styles.recTotal}>{fmtKg(r.total)}kg</span>
                  <span className={styles.recScore}>DOTS {r.dots.toFixed(1)} · IPF GL {r.ipfgl.toFixed(1)}</span>
                  <button type="button" className={styles.recDel} aria-label={`${r.date} 기록 삭제`} onClick={() => delRecord(r.id)}>×</button>
                </div>
              ))}
            </div>
          ) : mounted ? (
            <div className={styles.emptyHint}>아직 저장된 기록이 없습니다. 테스트·대회 때마다 저장하면 발전 추이를 볼 수 있어요.</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
