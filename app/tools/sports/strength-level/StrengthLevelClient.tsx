'use client'

import { useState } from 'react'
import styles from './strength-level.module.css'

/* ─────────────────────────────────────────────────────────
 * 타입 & 기준 데이터
 * ───────────────────────────────────────────────────────── */
type Sex = 'male' | 'female'
type AgeGroup = '20s' | '30s' | '40s' | '50s' | '60s'
type LiftKey = 'squat' | 'bench' | 'deadlift'

const LIFTS: { key: LiftKey; label: string; emoji: string }[] = [
  { key: 'squat',    label: '스쿼트',     emoji: '🦵' },
  { key: 'bench',    label: '벤치프레스', emoji: '🏋️' },
  { key: 'deadlift', label: '데드리프트', emoji: '💀' },
]

/* 20대 남성 기준 체중 대비 기준값 [초보, 중급, 상급, 엘리트] — 1RM 계산기와 동일 */
const BASE: Record<LiftKey, number[]> = {
  squat:    [0.75, 1.25, 1.5, 2.0],
  bench:    [0.5,  1.0,  1.25, 1.5],
  deadlift: [1.0,  1.5,  2.0, 2.5],
}

/* 레벨명 — index 0 = 초보 미만(입문) */
const LEVELS = ['입문', '초보', '중급', '상급', '엘리트']
const LEVEL_COLORS = ['#94A3B8', '#059669', '#0EA5E9', '#EA580C', '#DC2626']

/* 연령 보정 (1RM 계산기와 동일) */
const AGE_FACTOR: Record<AgeGroup, number> = { '20s': 1, '30s': 0.95, '40s': 0.85, '50s': 0.75, '60s': 0.65 }
const AGE_LABEL: Record<AgeGroup, string> = { '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대', '60s': '60대+' }

/* ─────────────────────────────────────────────────────────
 * 헬퍼
 * ───────────────────────────────────────────────────────── */
/* 숫자(소수 1자리 허용) 입력 정제 — 빈 문자열은 그대로 두어 "0이 안 지워지는" 버그 방지 */
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

/* ratio가 도달한 레벨 index (0=입문 ~ 4=엘리트) */
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

function scoreBand(s: number): string {
  if (s <= 0) return '—'
  if (s < 200) return '입문~초급 수준'
  if (s < 300) return '중급 수준'
  if (s < 400) return '상급 수준'
  if (s < 500) return '매우 우수'
  return '엘리트급'
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
export default function StrengthLevelClient() {
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState<AgeGroup>('20s')
  const [bwStr, setBwStr] = useState('75')
  const [squatStr, setSquatStr] = useState('100')
  const [benchStr, setBenchStr] = useState('70')
  const [deadStr, setDeadStr] = useState('130')
  const [copied, setCopied] = useState(false)

  const bw = num(bwStr)
  const squat = num(squatStr)
  const bench = num(benchStr)
  const dead = num(deadStr)
  const total = squat + bench + dead

  const factor = (sex === 'female' ? 0.7 : 1) * AGE_FACTOR[age]

  // 계산 비용이 작아 메모이제이션 없이 매 렌더 직접 계산
  const liftVals: Record<LiftKey, number> = { squat, bench, deadlift: dead }
  const perLift = LIFTS.map(({ key, label, emoji }) => {
    const w = liftVals[key]
    const thresholds = BASE[key].map((t) => t * factor)
    const ratio = bw > 0 ? w / bw : 0
    const idx = w > 0 && bw > 0 ? levelOf(ratio, thresholds) : 0
    // 다음 레벨까지 필요한 추가 중량
    const nextThreshold = idx < 4 ? thresholds[idx] : null
    const needKg = nextThreshold !== null && bw > 0 ? Math.max(0, nextThreshold * bw - w) : 0
    return { key, label, emoji, w, ratio, idx, needKg, hasNext: idx < 4, valid: w > 0 && bw > 0 }
  })

  // 종합 레벨 — 3대 합 기준 (각 레벨의 합)
  const totalThresholds = [0, 1, 2, 3].map(
    (i) => (BASE.squat[i] + BASE.bench[i] + BASE.deadlift[i]) * factor
  )
  const totalRatio = bw > 0 ? total / bw : 0
  const overallIdx = total > 0 && bw > 0 ? levelOf(totalRatio, totalThresholds) : 0
  const wilksScore = wilks(total, bw, sex)
  const dotsScore = dots(total, bw, sex)

  const valid = bw > 0 && total > 0

  function handleCopy() {
    const txt = [
      '── 스트렝스 레벨 ──',
      `${sex === 'male' ? '남성' : '여성'} · ${AGE_LABEL[age]} · 체중 ${fmtKg(bw)}kg`,
      `스쿼트 ${fmtKg(squat)} / 벤치 ${fmtKg(bench)} / 데드 ${fmtKg(dead)} (kg)`,
      `3대 합: ${fmtKg(total)}kg (체중 ${totalRatio.toFixed(2)}배)`,
      `종합 레벨: ${LEVELS[overallIdx]}`,
      `DOTS ${dotsScore.toFixed(1)} · Wilks ${wilksScore.toFixed(1)}`,
      'youtil.kr/tools/sports/strength-level',
    ].join('\n')
    navigator.clipboard?.writeText(txt).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    })
  }

  return (
    <div className={styles.wrap}>
      {/* ── 입력 ── */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>기본 정보</span>

        <div className={styles.row2}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>성별</span>
            <div className={styles.segment}>
              <button type="button" className={`${styles.segBtn} ${sex === 'male' ? styles.segActive : ''}`} onClick={() => setSex('male')}>남성</button>
              <button type="button" className={`${styles.segBtn} ${sex === 'female' ? styles.segActive : ''}`} onClick={() => setSex('female')}>여성</button>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>체중 (kg)</span>
            <input
              className={styles.input}
              type="text"
              inputMode="decimal"
              value={bwStr}
              onChange={(e) => setBwStr(sanitize(e.target.value))}
              placeholder="예: 75"
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>연령대</span>
          <div className={styles.pillRow}>
            {(Object.keys(AGE_LABEL) as AgeGroup[]).map((a) => (
              <button
                key={a}
                type="button"
                className={`${styles.pill} ${age === a ? styles.pillActive : ''}`}
                onClick={() => setAge(a)}
              >
                {AGE_LABEL[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <span className={styles.cardLabel}>3대 운동 최대 중량 (1RM, kg)</span>
        <div className={styles.liftInputs}>
          {LIFTS.map(({ key, label, emoji }) => {
            const v = key === 'squat' ? squatStr : key === 'bench' ? benchStr : deadStr
            const set = key === 'squat' ? setSquatStr : key === 'bench' ? setBenchStr : setDeadStr
            return (
              <div key={key} className={styles.field}>
                <span className={styles.fieldLabel}>{emoji} {label}</span>
                <input
                  className={styles.input}
                  type="text"
                  inputMode="decimal"
                  value={v}
                  onChange={(e) => set(sanitize(e.target.value))}
                  placeholder="0"
                />
              </div>
            )
          })}
        </div>
        <p className={styles.helpText}>
          1RM(1회 최대 중량)을 모르면 <a href="/tools/sports/one-rm" className={styles.link}>1RM 계산기</a>로 먼저 추정하세요.
        </p>
      </div>

      {/* ── 결과 ── */}
      {valid ? (
        <>
          {/* 히어로 — 3대 합 + 종합 레벨 */}
          <div className={styles.hero}>
            <p className={styles.heroLabel}>3대 합 (스쿼트+벤치+데드)</p>
            <p className={styles.heroValue}>
              <strong>{fmtKg(total)}</strong> kg
            </p>
            <p className={styles.heroSub}>체중의 {totalRatio.toFixed(2)}배</p>
            <span
              className={styles.overallBadge}
              style={{ background: LEVEL_COLORS[overallIdx], color: '#fff' }}
            >
              종합 {LEVELS[overallIdx]}
            </span>
          </div>

          {/* 점수 카드 — DOTS / Wilks */}
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
          </div>

          {/* 종목별 레벨 */}
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
                      ) : (
                        <span className={styles.liftRatio}>중량 입력</span>
                      )}
                    </span>
                  </div>
                  {/* 5단계 세그먼트 바 */}
                  <div className={styles.levelBar} aria-hidden>
                    {LEVELS.map((lv, i) => (
                      <div
                        key={lv}
                        className={styles.levelSeg}
                        style={{
                          background: p.valid && i <= p.idx ? LEVEL_COLORS[p.idx] : 'var(--bg3)',
                          opacity: p.valid && i <= p.idx ? 1 : 0.5,
                        }}
                        title={lv}
                      />
                    ))}
                  </div>
                  {p.valid && p.hasNext && (
                    <p className={styles.nextLine}>
                      다음 레벨(<strong>{LEVELS[p.idx + 1]}</strong>)까지 <strong>+{fmtKg(p.needKg)}kg</strong>
                    </p>
                  )}
                  {p.valid && !p.hasNext && (
                    <p className={styles.nextLine}>최고 등급에 도달했습니다 🎉</p>
                  )}
                </div>
              ))}
            </div>
            <p className={styles.helpText}>
              {sex === 'female' ? '여성' : '남성'} · {AGE_LABEL[age]} 기준으로 보정된 평가입니다
              (적용 계수 {factor.toFixed(3)}×). 체중 대비 기준이라 같은 무게라도 체중에 따라 레벨이 달라집니다.
            </p>
          </div>

          <button
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
          </button>
        </>
      ) : (
        <div className={styles.emptyHint}>
          체중과 3대 중량을 입력하면 레벨·DOTS·Wilks 점수가 표시됩니다.
        </div>
      )}
    </div>
  )
}
