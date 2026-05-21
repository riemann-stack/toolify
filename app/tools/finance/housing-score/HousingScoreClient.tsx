'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './housing-score.module.css'
import {
  calcTotalScore,
  computeUnhomedYears,
  computeBankbookYears,
  CUTLINES,
  SPECIAL_SUPPLIES,
  PITFALLS,
  SIMULATIONS,
  unhomedScore,
  dependentScore,
  bankbookScore,
} from './housingScoreData'

const STORAGE_KEY = 'youtil_housing_score_v1'

type HouseStatus = 'none' | 'one_sell' | 'multi'
type MarriedStatus = 'single' | 'married'

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function fromISO(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const d = new Date(s + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  return d
}

export default function HousingScoreClient() {
  /* 신청자 정보 */
  const today = useMemo(() => toISODate(new Date()), [])
  const [birthDate, setBirthDate] = useState<string>('1990-01-01')
  const [marriedStatus, setMarriedStatus] = useState<MarriedStatus>('married')
  const [marriedDate, setMarriedDate] = useState<string>('2020-01-01')

  /* 주택 보유 상태 */
  const [houseStatus, setHouseStatus] = useState<HouseStatus>('none')
  const [overrideUnhomedYears, setOverrideUnhomedYears] = useState<number | null>(null)

  /* 부양가족 */
  const [hasSpouse, setHasSpouse] = useState(true)
  const [childrenCount, setChildrenCount] = useState(1)
  const [parentsCount, setParentsCount] = useState(0)  // 직계존속 동거 인원
  const [parents3Years, setParents3Years] = useState(false)

  /* 청약통장 */
  const [bankbookJoinDate, setBankbookJoinDate] = useState<string>('2015-01-01')
  const [bankbookCount, setBankbookCount] = useState(24)

  /* 특별공급 자격 */
  const [specialChecks, setSpecialChecks] = useState<Record<string, boolean>>({})

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.birthDate) setBirthDate(j.birthDate)
      if (j.marriedStatus) setMarriedStatus(j.marriedStatus)
      if (j.marriedDate) setMarriedDate(j.marriedDate)
      if (j.houseStatus) setHouseStatus(j.houseStatus)
      if (typeof j.overrideUnhomedYears === 'number' || j.overrideUnhomedYears === null) setOverrideUnhomedYears(j.overrideUnhomedYears)
      if (typeof j.hasSpouse === 'boolean') setHasSpouse(j.hasSpouse)
      if (typeof j.childrenCount === 'number') setChildrenCount(j.childrenCount)
      if (typeof j.parentsCount === 'number') setParentsCount(j.parentsCount)
      if (typeof j.parents3Years === 'boolean') setParents3Years(j.parents3Years)
      if (j.bankbookJoinDate) setBankbookJoinDate(j.bankbookJoinDate)
      if (typeof j.bankbookCount === 'number') setBankbookCount(j.bankbookCount)
      if (j.specialChecks) setSpecialChecks(j.specialChecks)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        birthDate, marriedStatus, marriedDate, houseStatus, overrideUnhomedYears,
        hasSpouse, childrenCount, parentsCount, parents3Years,
        bankbookJoinDate, bankbookCount, specialChecks,
      }))
    } catch {}
  }, [
    birthDate, marriedStatus, marriedDate, houseStatus, overrideUnhomedYears,
    hasSpouse, childrenCount, parentsCount, parents3Years,
    bankbookJoinDate, bankbookCount, specialChecks,
  ])

  /* 계산 — 무주택 기간 */
  const unhomedYears = useMemo(() => {
    if (houseStatus === 'multi') return 0
    if (overrideUnhomedYears !== null) return overrideUnhomedYears

    const birth = fromISO(birthDate)
    if (!birth) return 0
    const married = marriedStatus === 'married' ? fromISO(marriedDate) : null
    const refDate = fromISO(today)!
    return computeUnhomedYears(birth, married, refDate)
  }, [houseStatus, overrideUnhomedYears, birthDate, marriedStatus, marriedDate, today])

  /* 부양가족 합산 */
  const dependentCount = useMemo(() => {
    let c = 0
    if (marriedStatus === 'married' && hasSpouse) c += 1
    c += Math.max(0, childrenCount)
    if (parents3Years) c += Math.max(0, parentsCount)
    return c
  }, [marriedStatus, hasSpouse, childrenCount, parentsCount, parents3Years])

  /* 통장 기간 */
  const bankbookYears = useMemo(() => {
    const d = fromISO(bankbookJoinDate)
    if (!d) return 0
    return computeBankbookYears(d, fromISO(today)!)
  }, [bankbookJoinDate, today])

  /* 종합 점수 */
  const score = useMemo(
    () => calcTotalScore({ unhomedYears, dependentCount, bankbookYears }),
    [unhomedYears, dependentCount, bankbookYears],
  )

  /* 시뮬레이션 결과 */
  const simulations = useMemo(() =>
    SIMULATIONS.map(sim => {
      const next = sim.apply({ unhomedYears, dependentCount, bankbookYears })
      const r = calcTotalScore(next)
      return { sim, result: r, delta: r.total - score.total }
    }),
  [unhomedYears, dependentCount, bankbookYears, score.total])

  /* 1순위 자격 */
  const is1stRank =
    bankbookYears >= 2 && bankbookCount >= 24 && houseStatus !== 'multi'

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/finance/rent-jeonse',  label: '월세·전세 비교' },
          { href: '/tools/finance/loan',         label: '대출이자 계산기' },
          { href: '/tools/finance/real-estate',  label: '부동산 수익률' },
        ]}
      >
        2025년 기준 주택법 시행규칙. 정부 정책·소득 기준은 매년 변경 — 청약 직전 청약홈·LH·HUG 공식 정보 재확인.
      </Disclaimer>

      {/* ─── 1. 신청자 정보 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>👤 1. 신청자 정보</div>

        <div className={s.fieldRow}>
          <div className={s.field}>
            <label>생년월일</label>
            <input type="date" className={s.dateInput}
              value={birthDate} max={today}
              onChange={e => setBirthDate(e.target.value)} />
          </div>
          <div className={s.field}>
            <label>혼인 상태</label>
            <div className={s.toggleRow}>
              <button
                type="button"
                className={`${s.toggleBtn} ${marriedStatus === 'single' ? s.toggleActive : ''}`}
                onClick={() => setMarriedStatus('single')}
              >미혼</button>
              <button
                type="button"
                className={`${s.toggleBtn} ${marriedStatus === 'married' ? s.toggleActive : ''}`}
                onClick={() => setMarriedStatus('married')}
              >기혼</button>
            </div>
          </div>
        </div>

        {marriedStatus === 'married' && (
          <div className={s.field} style={{ marginTop: 10 }}>
            <label>혼인 신고일</label>
            <input type="date" className={s.dateInput}
              value={marriedDate} max={today}
              onChange={e => setMarriedDate(e.target.value)} />
          </div>
        )}
      </div>

      {/* ─── 2. 무주택 기간 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🏠 2. 무주택 기간 ({unhomedScore(unhomedYears)}점 / 32점)</div>

        <div className={s.subLabel}>주택 보유 상태</div>
        <div className={s.statusRow}>
          <button
            type="button"
            className={`${s.statusBtn} ${houseStatus === 'none' ? s.statusActive : ''}`}
            onClick={() => setHouseStatus('none')}
          >
            <strong>✅ 무주택</strong>
            <small>세대원 전체 무주택</small>
          </button>
          <button
            type="button"
            className={`${s.statusBtn} ${houseStatus === 'one_sell' ? s.statusActive : ''}`}
            onClick={() => setHouseStatus('one_sell')}
          >
            <strong>🏚️ 1주택 (처분 서약)</strong>
            <small>입주 전 처분 동의</small>
          </button>
          <button
            type="button"
            className={`${s.statusBtn} ${houseStatus === 'multi' ? s.statusActive : ''}`}
            onClick={() => setHouseStatus('multi')}
          >
            <strong>❌ 다주택</strong>
            <small>가점 0 — 추첨제만</small>
          </button>
        </div>

        {houseStatus === 'multi' && (
          <p className={s.warnBox}>
            ⚠️ 다주택자는 가점제 적용 X — 추첨제 (민영 분양) 또는 매도 후 무주택자 전환 필요.
          </p>
        )}

        {houseStatus !== 'multi' && (
          <>
            <div className={s.autoBox}>
              <div className={s.autoBoxRow}>
                <span className={s.autoBoxLabel}>자동 산정 무주택 기간</span>
                <span className={s.autoBoxVal}>
                  {(overrideUnhomedYears ?? unhomedYears).toFixed(1)}년
                </span>
              </div>
              <p className={s.autoBoxHint}>
                {marriedStatus === 'married' ? '결혼일 또는 만 30세 중 빠른 쪽부터 카운트' : '만 30세 생일부터 카운트 (미혼 30세 미만 = 0년)'}
              </p>
              <label className={s.toggleLabel}>
                <input
                  type="checkbox"
                  checked={overrideUnhomedYears !== null}
                  onChange={e => setOverrideUnhomedYears(e.target.checked ? Math.round(unhomedYears * 10) / 10 : null)}
                />
                <span>직접 보정 (1주택 매도일 기준 등 특수 케이스)</span>
              </label>
              {overrideUnhomedYears !== null && (
                <div className={s.sliderRow}>
                  <input
                    type="range" min={0} max={20} step={0.5}
                    value={overrideUnhomedYears}
                    onChange={e => setOverrideUnhomedYears(parseFloat(e.target.value))}
                    className={s.slider}
                  />
                  <span className={s.sliderVal}>{overrideUnhomedYears.toFixed(1)}년</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── 3. 부양가족 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>👨‍👩‍👧‍👦 3. 부양가족 ({dependentScore(dependentCount)}점 / 35점)</div>

        <p className={s.cardHint}>본인 제외. 배우자·미성년 자녀·만 30세 미만 미혼 자녀·동거 직계존속만 인정.</p>

        {marriedStatus === 'married' && (
          <label className={s.toggleLabel}>
            <input
              type="checkbox"
              checked={hasSpouse}
              onChange={e => setHasSpouse(e.target.checked)}
            />
            <span>💑 배우자 (혼인 신고 후 동일 세대)</span>
          </label>
        )}

        <div className={s.subLabel} style={{ marginTop: 10 }}>자녀 수 (미성년 또는 만 30세 미만 미혼)</div>
        <div className={s.numRow}>
          <button type="button" onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}>−</button>
          <span>{childrenCount}</span>
          <button type="button" onClick={() => setChildrenCount(Math.min(10, childrenCount + 1))}>+</button>
        </div>

        <div className={s.subLabel} style={{ marginTop: 12 }}>동거 직계존속 (부모·조부모)</div>
        <div className={s.numRow}>
          <button type="button" onClick={() => setParentsCount(Math.max(0, parentsCount - 1))}>−</button>
          <span>{parentsCount}</span>
          <button type="button" onClick={() => setParentsCount(Math.min(4, parentsCount + 1))}>+</button>
        </div>
        {parentsCount > 0 && (
          <label className={s.toggleLabel} style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={parents3Years}
              onChange={e => setParents3Years(e.target.checked)}
            />
            <span>3년 이상 동일 세대 등록 + 만 60세 이상 (필수 요건)</span>
          </label>
        )}
        {parentsCount > 0 && !parents3Years && (
          <p className={s.warnBox}>
            ⚠️ 직계존속은 <strong>만 60세 이상 + 3년 이상 동일 세대</strong> 요건 미충족 시 부양가족 X.
          </p>
        )}

        <div className={s.depSummary}>
          <span>총 부양가족 수: <strong>{dependentCount}명</strong></span>
          <span>점수: <strong>{dependentScore(dependentCount)}점</strong></span>
        </div>
      </div>

      {/* ─── 4. 청약통장 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>💳 4. 청약통장 ({bankbookScore(bankbookYears)}점 / 17점)</div>

        <div className={s.fieldRow}>
          <div className={s.field}>
            <label>가입일</label>
            <input type="date" className={s.dateInput}
              value={bankbookJoinDate} max={today}
              onChange={e => setBankbookJoinDate(e.target.value)} />
          </div>
          <div className={s.field}>
            <label>납입 횟수 ({bankbookCount}회)</label>
            <input type="range" min={0} max={60} step={1}
              value={bankbookCount}
              onChange={e => setBankbookCount(parseInt(e.target.value))}
              className={s.slider}
            />
          </div>
        </div>

        <div className={s.autoBox}>
          <div className={s.autoBoxRow}>
            <span className={s.autoBoxLabel}>가입 기간</span>
            <span className={s.autoBoxVal}>{bankbookYears.toFixed(1)}년</span>
          </div>
          <p className={s.autoBoxHint}>
            1순위 자격: {is1stRank
              ? <strong style={{ color: '#059669' }}>✓ 충족 (2년 + 24회)</strong>
              : <strong style={{ color: '#EA580C' }}>미충족 — 2년 가입 + 24회 납입 필수 (수도권 기준)</strong>}
          </p>
        </div>
      </div>

      {/* ─── 메인 히어로 ─── */}
      <div className={s.heroCard}>
        <div className={s.heroLabel}>총 청약 가점</div>
        <div className={s.heroBigRow}>
          <span className={s.heroNum} style={{ color: score.grade.color }}>{score.total}</span>
          <span className={s.heroDenom}>/ 84점</span>
        </div>
        <div className={s.heroGrade} style={{ borderColor: `${score.grade.color}55`, color: score.grade.color }}>
          {score.grade.grade}급 — {score.grade.desc}
        </div>

        {/* 영역별 막대 */}
        <div className={s.barList}>
          <ScoreBar label="무주택 기간" value={score.unhomedPoints} max={32} color="#0891B2" />
          <ScoreBar label="부양가족" value={score.dependentPoints} max={35} color="#059669" />
          <ScoreBar label="청약통장" value={score.bankbookPoints} max={17} color="#FFD93E" />
        </div>
      </div>

      {/* ─── 인기 단지 커트라인 비교 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🎯 최근 인기 단지 평균 당첨 가점 비교</div>
        <div className={s.cutlineList}>
          {CUTLINES.map(c => {
            const ok = score.total >= c.avg
            const close = !ok && score.total >= c.min
            return (
              <div key={c.region} className={s.cutlineRow}>
                <div className={s.cutlineLeft}>
                  <span className={s.cutlineRegion}>{c.region}</span>
                  <span className={s.cutlineDesc}>{c.desc}</span>
                </div>
                <div className={s.cutlineRight}>
                  <span className={s.cutlineRange}>
                    {c.min} ~ {c.avg}점
                  </span>
                  <span className={`${s.cutlineBadge} ${ok ? s.cutlineOk : close ? s.cutlineClose : s.cutlineNo}`}>
                    {ok ? '✅ 당첨권' : close ? '⚠️ 도전권' : '❌ 부족'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 시뮬레이션 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📈 시뮬레이션 — 가점 올리려면?</div>
        <div className={s.simGrid}>
          {simulations.map(({ sim, result, delta }) => (
            <div key={sim.label} className={s.simCard}>
              <div className={s.simHead}>
                <span className={s.simEmoji}>{sim.emoji}</span>
                <span className={s.simLabel}>{sim.label}</span>
              </div>
              <p className={s.simDesc}>{sim.desc}</p>
              <div className={s.simResultRow}>
                <span className={s.simTotal}>{result.total}점</span>
                <span className={`${s.simDelta} ${delta > 0 ? s.simDeltaUp : s.simDeltaSame}`}>
                  {delta > 0 ? `+${delta}` : delta === 0 ? '변동 없음' : delta}
                  {delta !== 0 && '점'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 특별공급 자가진단 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>✨ 특별공급 자격 자가진단 (점수 무관)</div>
        <p className={s.cardHint}>가점이 부족해도 특별공급으로 당첨 가능. 본인 해당 여부 체크 → 조건 확인.</p>

        <div className={s.specialList}>
          {SPECIAL_SUPPLIES.map(sp => {
            const on = !!specialChecks[sp.id]
            return (
              <div key={sp.id} className={`${s.specialItem} ${on ? s.specialActive : ''}`}>
                <button
                  type="button"
                  className={s.specialHead}
                  onClick={() => setSpecialChecks(prev => ({ ...prev, [sp.id]: !prev[sp.id] }))}
                >
                  <span className={s.specialEmoji}>{sp.emoji}</span>
                  <div className={s.specialBody}>
                    <span className={s.specialName}>{sp.name}</span>
                    <span className={s.specialRatio}>{sp.ratio}</span>
                    <p className={s.specialDesc}>{sp.desc}</p>
                  </div>
                  <span className={s.specialToggle}>{on ? '▾' : '▸'}</span>
                </button>
                {on && (
                  <ul className={s.specialConditions}>
                    {sp.conditions.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── 함정·실수 가이드 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>⚠️ 청약 함정·실수 가이드</div>
        <div className={s.pitfallList}>
          {PITFALLS.map((p, i) => (
            <div
              key={i}
              className={`${s.pitfallItem} ${p.level === 'high' ? s.pitfallHigh : s.pitfallMid}`}
            >
              <strong>
                {p.level === 'high' ? '🚨' : '⚠️'} {p.title}
              </strong>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── 점수 막대 ─── */
function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className={s.barRow}>
      <span className={s.barLabel}>{label}</span>
      <span className={s.barTrack}>
        <span className={s.barFill} style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className={s.barValue}>{value}<small>/{max}</small></span>
    </div>
  )
}
