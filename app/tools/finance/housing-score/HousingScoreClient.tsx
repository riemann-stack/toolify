'use client'

import Disclaimer from '@/components/Disclaimer'
import { todayStr } from '@/lib/date'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
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

type HouseStatus = 'none' | 'one_sell' | 'one_keep' | 'multi'
type MarriedStatus = 'single' | 'married'
const HOUSE_STATUSES: readonly HouseStatus[] = ['none', 'one_sell', 'one_keep', 'multi']
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/
const isIntIn = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max

/** 청약 1순위 가입기간·납입횟수 요건 (지역별) */
type RankRegion = 'regulated' | 'metro' | 'nonmetro'
const RANK_RULES: Record<RankRegion, { years: number; count: number; label: string; period: string }> = {
  regulated: { years: 2,   count: 24, label: '규제지역', period: '2년' },
  metro:     { years: 1,   count: 12, label: '수도권',   period: '1년' },
  nonmetro:  { years: 0.5, count: 6,  label: '비수도권', period: '6개월' },
}

/* 기준일(오늘) — SSG·hydration 첫 렌더는 page.tsx가 넘긴 빌드일을 쓰고, 직후 기기 날짜로 다시 렌더 (불일치 방지) */
const noopSubscribe = () => () => {}
function useToday(buildDate: string): string {
  return useSyncExternalStore(noopSubscribe, todayStr, () => buildDate)
}
function fromISO(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const d = new Date(s + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  return d
}

export default function HousingScoreClient({ buildDate }: { buildDate?: string }) {
  /* 신청자 정보 */
  const today = useToday(buildDate ?? '')
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
  const [rankRegion, setRankRegion] = useState<RankRegion>('metro')

  /* 특별공급 자격 */
  const [specialChecks, setSpecialChecks] = useState<Record<string, boolean>>({})

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed: unknown = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return
      const j = parsed as Record<string, unknown>
      const isIso = (v: unknown): v is string => typeof v === 'string' && ISO_RE.test(v) && fromISO(v) !== null
      /* eslint-disable react-hooks/set-state-in-effect */
      if (isIso(j.birthDate)) setBirthDate(j.birthDate)
      if (j.marriedStatus === 'single' || j.marriedStatus === 'married') setMarriedStatus(j.marriedStatus)
      if (isIso(j.marriedDate)) setMarriedDate(j.marriedDate)
      if (typeof j.houseStatus === 'string' && (HOUSE_STATUSES as readonly string[]).includes(j.houseStatus)) setHouseStatus(j.houseStatus as HouseStatus)
      if (j.overrideUnhomedYears === null || (typeof j.overrideUnhomedYears === 'number' && Number.isFinite(j.overrideUnhomedYears) && j.overrideUnhomedYears >= 0 && j.overrideUnhomedYears <= 20)) setOverrideUnhomedYears(j.overrideUnhomedYears)
      if (typeof j.hasSpouse === 'boolean') setHasSpouse(j.hasSpouse)
      if (isIntIn(j.childrenCount, 0, 10)) setChildrenCount(j.childrenCount)
      if (isIntIn(j.parentsCount, 0, 4)) setParentsCount(j.parentsCount)
      if (typeof j.parents3Years === 'boolean') setParents3Years(j.parents3Years)
      if (isIso(j.bankbookJoinDate)) setBankbookJoinDate(j.bankbookJoinDate)
      if (isIntIn(j.bankbookCount, 0, 60)) setBankbookCount(j.bankbookCount)
      if (j.rankRegion === 'regulated' || j.rankRegion === 'metro' || j.rankRegion === 'nonmetro') setRankRegion(j.rankRegion)
      const sc = j.specialChecks
      if (sc && typeof sc === 'object' && !Array.isArray(sc)) {
        const clean: Record<string, boolean> = {}
        for (const [k, v] of Object.entries(sc as Record<string, unknown>)) if (typeof v === 'boolean') clean[k] = v
        setSpecialChecks(clean)
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        birthDate, marriedStatus, marriedDate, houseStatus, overrideUnhomedYears,
        hasSpouse, childrenCount, parentsCount, parents3Years,
        bankbookJoinDate, bankbookCount, rankRegion, specialChecks,
      }))
    } catch {}
  }, [
    birthDate, marriedStatus, marriedDate, houseStatus, overrideUnhomedYears,
    hasSpouse, childrenCount, parentsCount, parents3Years,
    bankbookJoinDate, bankbookCount, rankRegion, specialChecks,
  ])

  /* 계산 — 무주택 기간. 모집공고일 현재 주택을 소유한 세대(1주택 처분서약 포함)는 무주택 기간 0점 → null.
     무주택자라도 만 30세 미만 미혼이면 기산 전 → null(0점). 직접 보정은 기산이 시작된 경우에만 적용 */
  const unhomedYears = useMemo((): number | null => {
    if (houseStatus !== 'none') return null

    const birth = fromISO(birthDate)
    const refDate = fromISO(today)
    if (!birth || !refDate) return null
    const married = marriedStatus === 'married' ? fromISO(marriedDate) : null
    const auto = computeUnhomedYears(birth, married, refDate)
    if (auto === null) return null
    return overrideUnhomedYears !== null ? overrideUnhomedYears : auto
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
    const refDate = fromISO(today)
    if (!d || !refDate) return 0
    return computeBankbookYears(d, refDate)
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

  /* 1순위 자격 — 지역별 가입기간·납입횟수 요건 */
  const rankRule = RANK_RULES[rankRegion]
  const is1stRank =
    bankbookYears >= rankRule.years && bankbookCount >= rankRule.count && houseStatus !== 'multi'

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/finance/rent-jeonse',  label: '월세·전세 비교' },
          { href: '/tools/finance/loan',         label: '대출이자 계산기' },
          { href: '/tools/finance/real-estate',  label: '부동산 수익률' },
        ]}
        sources={[
          { label: '청약홈', href: 'https://www.applyhome.co.kr' },
          { label: 'LH 청약플러스', href: 'https://apply.lh.or.kr' },
        ]}
      >
        2026년 기준 「주택공급에 관한 규칙」. 정부 정책·소득 기준은 매년 변경 — 청약 직전 청약홈·LH·HUG 공식 정보 재확인.
      </Disclaimer>

      {/* ─── 1. 신청자 정보 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>1. 신청자 정보</div>

        <div className={s.fieldRow}>
          <div className={s.field}>
            <label htmlFor="housing-score-birth">생년월일</label>
            <input id="housing-score-birth" type="date" className={s.dateInput}
              value={birthDate} max={today}
              onChange={e => setBirthDate(e.target.value)} />
          </div>
          <div className={s.field}>
            <label>혼인 상태</label>
            <div className={s.toggleRow} role="group" aria-label="혼인 상태">
              <button
                type="button"
                aria-pressed={marriedStatus === 'single'}
                className={`${s.toggleBtn} ${marriedStatus === 'single' ? s.toggleActive : ''}`}
                onClick={() => setMarriedStatus('single')}
              >미혼</button>
              <button
                type="button"
                aria-pressed={marriedStatus === 'married'}
                className={`${s.toggleBtn} ${marriedStatus === 'married' ? s.toggleActive : ''}`}
                onClick={() => setMarriedStatus('married')}
              >기혼</button>
            </div>
          </div>
        </div>

        {marriedStatus === 'married' && (
          <div className={s.field} style={{ marginTop: 10 }}>
            <label htmlFor="housing-score-f2">혼인 신고일</label>
            <input id="housing-score-f2" type="date" className={s.dateInput}
              value={marriedDate} max={today}
              onChange={e => setMarriedDate(e.target.value)} />
          </div>
        )}
      </div>

      {/* ─── 2. 무주택 기간 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>2. 무주택 기간 ({unhomedScore(unhomedYears)}점 / 32점)</div>

        <div className={s.subLabel}>주택 보유 상태</div>
        <div className={s.statusRow} role="group" aria-label="주택 보유 상태">
          <button
            type="button"
            aria-pressed={houseStatus === 'none'}
            className={`${s.statusBtn} ${houseStatus === 'none' ? s.statusActive : ''}`}
            onClick={() => setHouseStatus('none')}
          >
            <strong>✅ 무주택</strong>
            <small>세대원 전체 무주택</small>
          </button>
          <button
            type="button"
            aria-pressed={houseStatus === 'one_sell'}
            className={`${s.statusBtn} ${houseStatus === 'one_sell' ? s.statusActive : ''}`}
            onClick={() => setHouseStatus('one_sell')}
          >
            <strong>1주택 (처분 조건)</strong>
            <small>무주택 기간 0점 — 주로 추첨제</small>
          </button>
          <button
            type="button"
            aria-pressed={houseStatus === 'one_keep'}
            className={`${s.statusBtn} ${houseStatus === 'one_keep' ? s.statusActive : ''}`}
            onClick={() => setHouseStatus('one_keep')}
          >
            <strong>1주택 (미서약)</strong>
            <small>가점제 X — 추첨제만</small>
          </button>
          <button
            type="button"
            aria-pressed={houseStatus === 'multi'}
            className={`${s.statusBtn} ${houseStatus === 'multi' ? s.statusActive : ''}`}
            onClick={() => setHouseStatus('multi')}
          >
            <strong>❌ 다주택</strong>
            <small>가점제 X — 추첨제만</small>
          </button>
        </div>

        {houseStatus === 'one_sell' && (
          <p className={s.warnBox}>
            ⚠️ 입주자모집공고일 현재 주택을 가진 세대는 처분 조건이어도 <strong>무주택 기간 가점이 0점</strong>입니다. 처분 조건은 주로 추첨제 청약 자격과 관련된 제도입니다. 이미 집을 팔았다면 「무주택」을 고르고, 무주택 기간은 처분일부터 다시 셉니다(아래 「직접 보정」 활용).
          </p>
        )}
        {houseStatus === 'one_keep' && (
          <p className={s.warnBox}>
            ⚠️ 처분서약을 하지 않은 1주택자는 <strong>가점제 청약 대상이 아닙니다</strong> — 민영 추첨제로만 신청 가능. 1주택자는 처분 조건을 걸어도 <strong>무주택 기간 가점이 0점</strong>이며, 처분 조건은 주로 추첨제 청약 자격과 관련됩니다.
          </p>
        )}
        {houseStatus === 'multi' && (
          <p className={s.warnBox}>
            ⚠️ 다주택자는 가점제 적용 X — 추첨제 (민영 분양) 또는 매도 후 무주택자 전환 필요.
          </p>
        )}

        {houseStatus === 'none' && (
          <>
            <div className={s.autoBox}>
              <div className={s.autoBoxRow}>
                <span className={s.autoBoxLabel}>자동 산정 무주택 기간</span>
                <span className={s.autoBoxVal}>
                  {unhomedYears === null ? '산정 전' : `${unhomedYears.toFixed(1)}년`}
                </span>
              </div>
              <p className={s.autoBoxHint}>
                {marriedStatus === 'married' ? '혼인신고일 또는 만 30세 중 빠른 쪽부터 카운트' : '만 30세 생일부터 카운트 (만 30세 미만 미혼은 산정 전이라 0점)'}
              </p>
              <label className={s.toggleLabel}>
                <input
                  type="checkbox"
                  checked={overrideUnhomedYears !== null && unhomedYears !== null}
                  disabled={unhomedYears === null}
                  onChange={e => setOverrideUnhomedYears(e.target.checked ? Math.round((unhomedYears ?? 0) * 10) / 10 : null)}
                />
                <span>직접 보정 (과거 주택을 처분한 경우 처분일 기준 등)</span>
              </label>
              {overrideUnhomedYears !== null && unhomedYears !== null && (
                <div className={s.sliderRow}>
                  <input
                    type="range" min={0} max={20} step={0.5}
                    value={overrideUnhomedYears}
                    onChange={e => setOverrideUnhomedYears(parseFloat(e.target.value))}
                    className={s.slider}
                    aria-label="무주택 기간 직접 보정 (년)"
                    aria-valuetext={`${overrideUnhomedYears.toFixed(1)}년`}
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
        <div className={s.cardLabel}>3. 부양가족 ({dependentScore(dependentCount)}점 / 35점)</div>

        <p className={s.cardHint}>본인 제외. 배우자·미혼 자녀(만 30세 이상은 최근 1년 이상 같은 등본)·최근 3년 이상 같은 등본의 직계존속만 인정.</p>

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

        <div className={s.fieldRow} style={{ marginTop: 10, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <div className={s.field}>
            <div className={s.subLabel} style={{ marginBottom: 4 }}>자녀 수 <small style={{ fontWeight: 400 }}>(미혼 · 만30세 이상은 1년 이상 동일 등본)</small></div>
            <div className={s.numRow}>
              <button type="button" aria-label="자녀 수 감소" onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}>−</button>
              <span>{childrenCount}</span>
              <button type="button" aria-label="자녀 수 증가" onClick={() => setChildrenCount(Math.min(10, childrenCount + 1))}>+</button>
            </div>
          </div>
          <div className={s.field}>
            <div className={s.subLabel} style={{ marginBottom: 4 }}>동거 직계존속 <small style={{ fontWeight: 400 }}>(부모·조부모)</small></div>
            <div className={s.numRow}>
              <button type="button" aria-label="동거 직계존속 감소" onClick={() => setParentsCount(Math.max(0, parentsCount - 1))}>−</button>
              <span>{parentsCount}</span>
              <button type="button" aria-label="동거 직계존속 증가" onClick={() => setParentsCount(Math.min(4, parentsCount + 1))}>+</button>
            </div>
          </div>
        </div>

        {parentsCount > 0 && (
          <label className={s.toggleLabel} style={{ marginTop: 8 }}>
            <input
              type="checkbox"
              checked={parents3Years}
              onChange={e => setParents3Years(e.target.checked)}
            />
            <span>본인이 세대주 + 최근 3년 이상 같은 등본 + 부모(와 그 배우자) 모두 무주택</span>
          </label>
        )}
        {parentsCount > 0 && !parents3Years && (
          <p className={s.warnBox}>
            ⚠️ 직계존속은 <strong>신청자가 세대주이고 최근 3년 이상 같은 주민등록표에 올라 있어야</strong> 부양가족으로 인정됩니다. 직계존속이나 그 배우자가 주택을 가지고 있으면 제외됩니다. 나이 요건은 없습니다.
          </p>
        )}

        <div className={s.depSummary}>
          <span>총 부양가족 수: <strong>{dependentCount}명</strong></span>
          <span>점수: <strong>{dependentScore(dependentCount)}점</strong></span>
        </div>
      </div>

      {/* ─── 4. 청약통장 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>4. 청약통장 ({bankbookScore(bankbookYears)}점 / 17점)</div>

        <div className={s.fieldRow}>
          <div className={s.field}>
            <label htmlFor="housing-score-f3">가입일</label>
            <input id="housing-score-f3" type="date" className={s.dateInput}
              value={bankbookJoinDate} max={today}
              onChange={e => setBankbookJoinDate(e.target.value)} />
          </div>
          <div className={s.field}>
            <label>납입 횟수 ({bankbookCount}회)</label>
            <input type="range" min={0} max={60} step={1}
              value={bankbookCount}
              onChange={e => setBankbookCount(parseInt(e.target.value))}
              className={s.slider}
              aria-label="청약통장 납입 횟수"
              aria-valuetext={`${bankbookCount}회`}
            />
          </div>
        </div>

        <div className={s.subLabel} style={{ marginTop: 12, marginBottom: 4 }}>청약 지역 <small style={{ fontWeight: 400 }}>(1순위 기준)</small></div>
        <div className={s.toggleRow} role="group" aria-label="청약 지역 (1순위 기준)">
          {(Object.keys(RANK_RULES) as RankRegion[]).map(r => (
            <button
              key={r}
              type="button"
              aria-pressed={rankRegion === r}
              className={`${s.toggleBtn} ${rankRegion === r ? s.toggleActive : ''}`}
              onClick={() => setRankRegion(r)}
            >{RANK_RULES[r].label}</button>
          ))}
        </div>

        <div className={s.autoBox}>
          <div className={s.autoBoxRow}>
            <span className={s.autoBoxLabel}>가입 기간</span>
            <span className={s.autoBoxVal}>{bankbookYears.toFixed(1)}년</span>
          </div>
          <p className={s.autoBoxHint}>
            1순위 자격 <small style={{ fontWeight: 400 }}>({rankRule.label} · {rankRule.period}·{rankRule.count}회)</small>: {is1stRank
              ? <strong style={{ color: '#059669' }}>✓ 충족</strong>
              : <strong style={{ color: '#EA580C' }}>미충족 — {rankRule.period} 가입 + {rankRule.count}회 납입 필요</strong>}
          </p>
          <p className={s.autoBoxHint} style={{ marginTop: 4 }}>
            ※ 규제지역 = 투기과열지구·청약과열지역(2025.10.15 이후 서울 전역·경기 12곳 등). 그 외 수도권 1년·12회, 비수도권 6개월·6회. 가점은 가입기간만 반영하며, 민영은 지역·평형별 예치금도 충족해야 1순위.
          </p>
        </div>
      </div>

      {/* ─── 메인 히어로 ─── */}
      <div className={s.heroCard} role="status">
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
        <div className={s.cardLabel}>최근 인기 단지 평균 당첨 가점 비교</div>
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
        <div className={s.cardLabel}>시뮬레이션 — 가점 올리려면?</div>
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

      {/* ─── 특별공급 자격 가이드 ─── */}
      <div className={s.card}>
        <div className={s.cardLabel}>특별공급 자격 가이드 (점수 무관)</div>
        <p className={s.cardHint}>가점이 부족해도 특별공급으로 당첨 가능. 항목을 펼쳐 본인 해당 조건을 확인하세요 (소득·자산 요건은 청약홈에서 확인).</p>

        <div className={s.specialList}>
          {SPECIAL_SUPPLIES.map(sp => {
            const on = !!specialChecks[sp.id]
            return (
              <div key={sp.id} className={`${s.specialItem} ${on ? s.specialActive : ''}`}>
                <button
                  type="button"
                  className={s.specialHead}
                  aria-expanded={on}
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
