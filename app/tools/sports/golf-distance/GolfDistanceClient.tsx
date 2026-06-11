/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './golf-distance.module.css'
import {
  GENDER_AGE_LABEL, SENIOR_FACTOR, LIE_LABEL,
  calcEnvCorrected,
  loadRecords, saveRecords, newId, todayStr, analyzeRecords,
  LOCATION_LABEL,
  type GenderAge, type DistanceUnit, type WindDirection, type LieType,
  type DistanceRecord, type RecordLocation,
} from './golfDistanceUtils'

/* ────────────────────────────────────────────────
 * 클럽 정의
 * ──────────────────────────────────────────────── */
const CLUB_LIST = [
  'DR', '3W', '5W', '4U', '5U',
  '4I', '5I', '6I', '7I', '8I', '9I',
  'PW', 'AW', 'SW', 'LW',
] as const
type Club = typeof CLUB_LIST[number]

const CLUB_NAME_KR: Record<Club, string> = {
  DR: '드라이버',
  '3W': '3번 우드',
  '5W': '5번 우드',
  '4U': '4번 유틸',
  '5U': '5번 유틸',
  '4I': '4번 아이언',
  '5I': '5번 아이언',
  '6I': '6번 아이언',
  '7I': '7번 아이언',
  '8I': '8번 아이언',
  '9I': '9번 아이언',
  PW: '피칭 웨지',
  AW: '어프로치 웨지',
  SW: '샌드 웨지',
  LW: '로브 웨지',
}

// 7번 아이언 기준 추정 계수
const RATIO_FROM_7I: Record<Club, number> = {
  DR:  2.30,
  '3W': 1.93,
  '5W': 1.76,
  '4U': 1.67,
  '5U': 1.57,
  '4I': 1.21,
  '5I': 1.14,
  '6I': 1.07,
  '7I': 1.00,
  '8I': 0.93,
  '9I': 0.86,
  PW:   0.76,
  AW:   0.69,
  SW:   0.61,
  LW:   0.53,
}

// 아마추어 평균
const AVG_DISTANCE: Record<'male' | 'female', Record<Club, number>> = {
  male: {
    DR: 210, '3W': 185, '5W': 170, '4U': 165, '5U': 155,
    '4I': 170, '5I': 160, '6I': 150, '7I': 140, '8I': 130,
    '9I': 120, PW: 110, AW: 100, SW: 85, LW: 70,
  },
  female: {
    DR: 160, '3W': 140, '5W': 130, '4U': 125, '5U': 118,
    '4I': 130, '5I': 120, '6I': 112, '7I': 105, '8I': 96,
    '9I': 88, PW: 80, AW: 73, SW: 62, LW: 52,
  },
}

// 권장 간격 범위
const GAP_RULES: Record<string, { min: number; max: number }> = {
  iron:    { min: 8,  max: 16 },
  wood:    { min: 12, max: 28 },
  wedge:   { min: 8,  max: 18 },
  ironWood:{ min: 10, max: 22 },
  default: { min: 10, max: 22 },
}

function clubGroup(c: Club): 'wood' | 'iron' | 'wedge' {
  if (c === 'DR' || c === '3W' || c === '5W' || c === '4U' || c === '5U') return 'wood'
  if (c === 'PW' || c === 'AW' || c === 'SW' || c === 'LW') return 'wedge'
  return 'iron'
}
function gapRuleFor(a: Club, b: Club) {
  const ga = clubGroup(a)
  const gb = clubGroup(b)
  if (ga === gb && ga === 'iron')  return GAP_RULES.iron
  if (ga === gb && ga === 'wood')  return GAP_RULES.wood
  if (ga === gb && ga === 'wedge') return GAP_RULES.wedge
  if ((ga === 'iron' && gb === 'wood') || (ga === 'wood' && gb === 'iron')) return GAP_RULES.ironWood
  if ((ga === 'iron' && gb === 'wedge') || (ga === 'wedge' && gb === 'iron')) return GAP_RULES.iron
  return GAP_RULES.default
}

/* ────────────────────────────────────────────────
 * 컴포넌트
 * ──────────────────────────────────────────────── */
export default function GolfDistanceClient() {
  const [tab, setTab] = useState<'estimate' | 'analysis' | 'env' | 'records'>('estimate')
  const [genderAge, setGenderAge] = useState<GenderAge>('male')
  const gender: 'male' | 'female' = (genderAge === 'female' || genderAge === 'femaleSenior') ? 'female' : 'male'
  const isSenior = genderAge === 'maleSenior' || genderAge === 'femaleSenior'
  const [style, setStyle] = useState<'power' | 'balance' | 'control'>('balance')
  const [unit, setUnit] = useState<DistanceUnit>('m')
  const [expandAll, setExpandAll] = useState(false)

  // 클럽 입력값 (string으로 보관, 빈문자열 = 미입력)
  const [inputs, setInputs] = useState<Record<Club, string>>(() =>
    CLUB_LIST.reduce((acc, c) => ({ ...acc, [c]: '' }), {} as Record<Club, string>),
  )

  const setClub = (club: Club, val: string) => {
    setInputs(prev => ({ ...prev, [club]: val.replace(/[^0-9.]/g, '') }))
  }

  // 추정 결과
  const results = useMemo(() => {
    const numInputs: Partial<Record<Club, number>> = {}
    for (const c of CLUB_LIST) {
      const v = parseFloat(inputs[c])
      if (!isNaN(v) && v > 0) numInputs[c] = v
    }
    const base7I = numInputs['7I']
    const baseDR = numInputs['DR']

    return CLUB_LIST.map(club => {
      const actual = numInputs[club]
      if (actual !== undefined) return { club, distance: Math.round(actual), isActual: true }

      let est7I: number | null = null
      let estDR: number | null = null

      if (base7I) est7I = base7I * RATIO_FROM_7I[club]
      if (baseDR) estDR = (baseDR / RATIO_FROM_7I.DR) * RATIO_FROM_7I[club]

      let estimated: number | null = null
      if (est7I !== null && estDR !== null) estimated = Math.round((est7I + estDR) / 2 / 5) * 5
      else if (est7I !== null) estimated = Math.round(est7I / 5) * 5
      else if (estDR !== null) estimated = Math.round(estDR / 5) * 5

      // 플레이 스타일 보정 (±3%)
      if (estimated !== null) {
        if (style === 'power') estimated = Math.round((estimated * 1.03) / 5) * 5
        else if (style === 'control') estimated = Math.round((estimated * 0.97) / 5) * 5
      }

      return { club, distance: estimated, isActual: false }
    }).filter((r): r is { club: Club; distance: number; isActual: boolean } => r.distance !== null && r.distance > 0)
  }, [inputs, style])

  // 시니어 평균 (참고용 - 평균 비교에만 적용)
  const seniorAdjustedAvg = useMemo(() => {
    const factor = isSenior ? SENIOR_FACTOR : 1.0
    const adjusted: Record<Club, number> = {} as Record<Club, number>
    for (const c of CLUB_LIST) {
      adjusted[c] = Math.round(AVG_DISTANCE[gender][c] * factor)
    }
    return adjusted
  }, [gender, isSenior])

  const hasInput = useMemo(() =>
    CLUB_LIST.some(c => parseFloat(inputs[c]) > 0),
  [inputs])

  // 가장 긴 비거리 (차트 스케일링)
  const maxDistance = useMemo(() => {
    const myMax = results.length ? Math.max(...results.map(r => r.distance)) : 0
    const avgMax = AVG_DISTANCE[gender].DR
    return Math.max(myMax, avgMax) * 1.05
  }, [results, gender])

  /* ── Gap 분석 ── */
  const gapList = useMemo(() => {
    const sorted = [...results].sort((a, b) => b.distance - a.distance)
    const gaps: {
      from: Club
      to: Club
      gap: number
      level: 'ok' | 'tight' | 'wide'
      suggestion?: string
    }[] = []
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i]
      const to = sorted[i + 1]
      const gap = from.distance - to.distance
      const rule = gapRuleFor(from.club, to.club)
      let level: 'ok' | 'tight' | 'wide' = 'ok'
      let suggestion: string | undefined

      if (gap < rule.min) {
        level = 'tight'
        suggestion = `${from.club} 또는 ${to.club} 중 하나 제거 고려`
      } else if (gap > rule.max) {
        level = 'wide'
        const middle = Math.round((from.distance + to.distance) / 2 / 5) * 5
        const between = clubBetween(from.club, to.club)
        suggestion = between
          ? `${between} 추가 고려 (예상 ${middle}m)`
          : `약 ${middle}m 거리를 채울 클럽 고려`
      }

      gaps.push({ from: from.club, to: to.club, gap, level, suggestion })
    }
    return gaps
  }, [results])

  /* ── 추천 카드 ── */
  const recommendations = useMemo(() => {
    const recs: { title: string; text: string }[] = []
    const sorted = [...results].sort((a, b) => b.distance - a.distance)

    // 가장 큰 wide gap 1개 우선 추천
    const widest = gapList
      .filter(g => g.level === 'wide')
      .sort((a, b) => b.gap - a.gap)[0]
    if (widest) {
      const from = sorted.find(r => r.club === widest.from)!
      const to = sorted.find(r => r.club === widest.to)!
      const middle = Math.round((from.distance + to.distance) / 2 / 5) * 5
      const fillerName = clubBetween(widest.from, widest.to)
      const text = fillerName
        ? `${widest.from}(${from.distance}m)와 ${widest.to}(${to.distance}m) 사이 ${widest.gap}m 간격이 있습니다. ${fillerName} 추가를 고려해보세요. 예상 비거리: 약 ${middle}m`
        : `${widest.from}(${from.distance}m)와 ${widest.to}(${to.distance}m) 사이 ${widest.gap}m 간격이 큽니다. 약 ${middle}m 거리를 채울 클럽을 검토해보세요.`
      recs.push({ title: '거리 공백 보완', text })
    }

    // 가장 좁은 tight gap 1개
    const tightest = gapList
      .filter(g => g.level === 'tight')
      .sort((a, b) => a.gap - b.gap)[0]
    if (tightest) {
      const from = sorted.find(r => r.club === tightest.from)!
      const to = sorted.find(r => r.club === tightest.to)!
      recs.push({
        title: '간격 중복 정리',
        text: `${tightest.from}(${from.distance}m)와 ${tightest.to}(${to.distance}m) 사이 간격이 ${tightest.gap}m로 좁습니다. 클럽 수가 많다면 ${tightest.from} 또는 ${tightest.to} 중 하나 제거를 고려해보세요.`,
      })
    }

    return recs
  }, [gapList, results])

  /* ── 7번 아이언 등급 ── */
  const sevenIronGrade = useMemo(() => {
    const v = parseFloat(inputs['7I'])
    if (!v || v <= 0) return null
    if (gender === 'male') {
      if (v >= 150) return { grade: '상위 10%', cls: s.gradeTop, note: '평균 대비 매우 우수합니다.' }
      if (v >= 140) return { grade: '평균 이상', cls: s.gradeHigh, note: '아마추어 평균보다 길게 보냅니다.' }
      if (v >= 130) return { grade: '평균', cls: s.gradeMid, note: '아마추어 평균에 가깝습니다.' }
      if (v >= 120) return { grade: '평균 이하', cls: s.gradeLow, note: '컨택·헤드 스피드 향상 여지가 있습니다.' }
      return { grade: '하위 20%', cls: s.gradeBeg, note: '입문 단계. 꾸준한 연습으로 비거리가 늘어납니다.' }
    } else {
      if (v >= 115) return { grade: '상위 10%', cls: s.gradeTop, note: '여성 평균 대비 매우 우수합니다.' }
      if (v >= 105) return { grade: '평균 이상', cls: s.gradeHigh, note: '여성 아마추어 평균보다 깁니다.' }
      if (v >= 95)  return { grade: '평균',     cls: s.gradeMid, note: '여성 아마추어 평균 수준입니다.' }
      if (v >= 85)  return { grade: '평균 이하', cls: s.gradeLow, note: '컨택 정확도부터 다져보세요.' }
      return { grade: '하위 20%', cls: s.gradeBeg, note: '입문 단계. 꾸준한 연습으로 비거리가 늘어납니다.' }
    }
  }, [inputs, gender])

  /* ── 표시 클럽 (입력 모드) ── */
  const visibleClubs: Club[] = expandAll
    ? [...CLUB_LIST]
    : (['DR', '7I', 'PW'] as Club[])

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/golf-cost', label: '골프 비용 정산' },
          { href: '/tools/sports/golf-handicap', label: '골프 핸디캡' },
          { href: '/tools/sports/pace', label: '러닝 페이스' }
        ]}
      >
        비거리는 평균 통계 기반 <strong>참고용 추정</strong>이며, 개인의 스윙 스피드·타구 질·클럽 스펙·날씨·고도·잔디 상태에 따라 큰 차이가 납니다. 정확한 비거리는 실제 라운드·런치 모니터 측정으로 확인하세요.
      </Disclaimer>

      {/* 탭 (4개) */}
      <div className={s.tabs4}>
        {([
          { id: 'estimate', label: '📏 비거리 계산' },
          { id: 'analysis', label: '🔍 클럽 분석' },
          { id: 'env',      label: '🌬️ 환경 보정' },
          { id: 'records',  label: '📅 내 기록' },
        ] as const).map(t => (
          <button key={t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 단위 토글 (모든 탭 공통) */}
      <div className={s.unitToggleRow}>
        <span className={s.unitLabel}>📏 거리 단위</span>
        <div className={s.unitToggle}>
          <button className={`${s.unitBtn} ${unit === 'm' ? s.unitBtnActive : ''}`}
            onClick={() => setUnit('m')}>m (한국 표준)</button>
          <button className={`${s.unitBtn} ${unit === 'yard' ? s.unitBtnActive : ''}`}
            onClick={() => setUnit('yard')}>yard</button>
        </div>
      </div>

      {/* ── 공통 입력 카드 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>기준 클럽 입력</span>
        <div className={s.infoBox} style={{ marginBottom: 14 }}>
          드라이버와 7번 아이언 비거리만 입력해도 전체 클럽 비거리를 추정할 수 있습니다. 더 많이 입력할수록 정확해집니다.
        </div>

        {/* 성별·연령 / 플레이 스타일 */}
        <div style={{ marginBottom: 14 }}>
          <span className={s.fieldLabel}>성별·연령 (평균 비교 기준)</span>
          <div className={s.gaGrid}>
            {(Object.keys(GENDER_AGE_LABEL) as GenderAge[]).map(k => (
              <button key={k}
                className={`${s.toggleBtn} ${genderAge === k ? s.toggleBtnActive : ''}`}
                onClick={() => setGenderAge(k)}
                style={{ padding: '10px 6px', fontSize: 12 }}>
                {GENDER_AGE_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <span className={s.fieldLabel}>플레이 스타일</span>
          <div className={s.toggleRow}>
            {([
              { key: 'power',   label: '파워형' },
              { key: 'balance', label: '균형형' },
              { key: 'control', label: '컨트롤형' },
            ] as const).map(p => (
              <button key={p.key}
                className={`${s.toggleBtn} ${style === p.key ? s.toggleBtnActive : ''}`}
                onClick={() => setStyle(p.key)}
                style={{ flex: 1, padding: '10px 6px' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 클럽 입력 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleClubs.map(club => {
            const filled = parseFloat(inputs[club]) > 0
            return (
              <div
                key={club}
                className={`${s.clubInputRow} ${filled ? s.clubInputRowActive : ''}`}
              >
                <div className={s.clubInputName}>
                  {club}
                  <small>{CLUB_NAME_KR[club]}</small>
                </div>
                <div className={s.clubInputBox}>
                  <input
                    className={s.clubInput}
                    type="text"
                    inputMode="decimal"
                    placeholder={club === 'DR' || club === '7I' ? `필수 (예: ${unit === 'm' ? '210' : '230'})` : '추정됩니다'}
                    value={inputs[club]}
                    onChange={e => setClub(club, e.target.value)}
                  />
                  <span className={s.clubInputUnit}>{unit}</span>
                </div>
              </div>
            )
          })}
        </div>

        <button className={s.expandBtn} onClick={() => setExpandAll(v => !v)}>
          {expandAll ? '간단 입력 모드로 ▲' : '전체 클럽 직접 입력하기 ▼'}
        </button>
      </div>

      {/* ── 탭 내용 ── */}
      {tab === 'env' ? (
        <EnvTab
          baseI7={parseFloat(inputs['7I']) || 0}
          baseDR={parseFloat(inputs['DR']) || 0}
          unit={unit}
        />
      ) : tab === 'records' ? (
        <RecordsTab
          unit={unit}
          currentDR={parseFloat(inputs['DR']) || undefined}
          currentI7={parseFloat(inputs['7I']) || undefined}
        />
      ) : !hasInput ? (
        <div className={s.emptyCard}>
          <strong>드라이버 또는 7번 아이언 비거리를 입력하세요</strong>
          입력값 1개만으로도 전체 클럽 비거리가 자동 계산됩니다.
        </div>
      ) : tab === 'estimate' ? (
        <EstimateView
          results={results}
          maxDistance={maxDistance}
          avgRef={seniorAdjustedAvg}
          gender={gender}
          isSenior={isSenior}
          sevenIronGrade={sevenIronGrade}
          unit={unit}
        />
      ) : (
        <AnalysisView
          results={results}
          gapList={gapList}
          recommendations={recommendations}
          unit={unit}
        />
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────
 * 비거리표 + 차트 뷰
 * ──────────────────────────────────────────────── */
function EstimateView({
  results, maxDistance, avgRef, gender, isSenior, sevenIronGrade, unit,
}: {
  results: { club: Club; distance: number; isActual: boolean }[]
  maxDistance: number
  avgRef: Record<Club, number>
  gender: 'male' | 'female'
  isSenior: boolean
  sevenIronGrade: { grade: string; cls: string; note: string } | null
  unit: DistanceUnit
}) {
  const sorted = [...results].sort((a, b) => b.distance - a.distance)
  const senderName = (isSenior ? '시니어 ' : '') + (gender === 'male' ? '남성' : '여성')

  return (
    <>
      {/* 7I 등급 카드 */}
      {sevenIronGrade && (
        <div className={s.evalCard}>
          <div className={s.evalTop}>
            <div>
              <div className={s.evalLabel}>7번 아이언 평가</div>
              <div className={s.evalNum}>
                {showDist(results.find(r => r.club === '7I')?.distance ?? 0, unit)}<span style={{ fontSize: '0.5em', color: 'var(--muted)', marginLeft: 6 }}>{unit}</span>
              </div>
              <div className={s.evalSub}>{sevenIronGrade.note}</div>
            </div>
            <span className={`${s.gradeBadge} ${sevenIronGrade.cls}`}>
              {sevenIronGrade.grade}
            </span>
          </div>
        </div>
      )}

      {/* 바 차트 */}
      <div className={s.chartWrap}>
        <div className={s.chartLegend}>
          <div className={s.legendItem}><span className={`${s.legendDot} ${s.legendDotActual}`}></span> 직접 입력</div>
          <div className={s.legendItem}><span className={`${s.legendDot} ${s.legendDotEst}`}></span> 추정값</div>
          <div className={s.legendItem}><span className={`${s.legendDot} ${s.legendDotAvg}`}></span> 아마추어 평균 ({senderName})</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sorted.map(r => {
            const widthPct = (r.distance / maxDistance) * 100
            const avg = avgRef[r.club]
            const avgPct = (avg / maxDistance) * 100
            return (
              <div key={r.club} className={s.barRow}>
                <div className={s.barLabel}>{r.club}</div>
                <div className={s.barTrack}>
                  <div
                    className={`${s.barFill} ${r.isActual ? s.barActual : s.barEst}`}
                    style={{ width: `${widthPct}%` }}
                  >
                    {widthPct > 22 && <span className={s.barNum}>{showDist(r.distance, unit)}{unit}</span>}
                  </div>
                  {widthPct <= 22 && <span className={s.barNumOutside}>{showDist(r.distance, unit)}{unit}</span>}
                  <span
                    className={s.avgMarker}
                    style={{ left: `${avgPct}%` }}
                    title={`평균 ${showDist(avg, unit)}${unit}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 비거리 표 */}
      <div className={s.card}>
        <span className={s.cardLabel}>비거리 비교표 ({senderName} 평균 대비)</span>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.distanceTable}>
            <thead>
              <tr>
                <th>클럽</th>
                <th style={{ textAlign: 'right' }}>내 비거리</th>
                <th style={{ textAlign: 'right' }}>평균</th>
                <th style={{ textAlign: 'right' }}>차이</th>
                <th style={{ textAlign: 'center' }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => {
                const avg = avgRef[r.club]
                const diff = r.distance - avg
                const diffCls = diff > 0 ? s.diffPlus : diff < 0 ? s.diffMinus : s.diffZero
                const diffSign = diff > 0 ? '▲ +' : diff < 0 ? '▼ ' : '±'
                return (
                  <tr key={r.club}>
                    <td className={s.tdClub}>{r.club}</td>
                    <td className={s.tdNum}>{showDist(r.distance, unit)}{unit}</td>
                    <td className={s.tdMuted}>{showDist(avg, unit)}{unit}</td>
                    <td className={`${s.tdDiff} ${diffCls}`}>{diffSign}{showDist(Math.abs(diff), unit)}{unit}</td>
                    <td className={s.tdStatus}>
                      <span className={`${s.barTag} ${r.isActual ? s.tagActual : s.tagEst}`}>
                        {r.isActual ? '직접 입력' : '추정'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// 단위 변환 표시 헬퍼
function showDist(mValue: number, targetUnit: DistanceUnit): number {
  if (targetUnit === 'm') return Math.round(mValue)
  return Math.round(mValue * 1.0936)
}

/* ────────────────────────────────────────────────
 * 클럽 분석 뷰
 * ──────────────────────────────────────────────── */
function AnalysisView({
  results, gapList, recommendations, unit,
}: {
  results: { club: Club; distance: number; isActual: boolean }[]
  gapList: { from: Club; to: Club; gap: number; level: 'ok' | 'tight' | 'wide'; suggestion?: string }[]
  recommendations: { title: string; text: string }[]
  unit: DistanceUnit
}) {
  const sorted = [...results].sort((a, b) => b.distance - a.distance)
  const longest = sorted[0]
  const shortest = sorted[sorted.length - 1]
  const widestGap = [...gapList].sort((a, b) => b.gap - a.gap)[0]
  const wideCount = gapList.filter(g => g.level === 'wide').length

  return (
    <>
      {/* 총평 */}
      <div className={s.card}>
        <span className={s.cardLabel}>클럽 구성 총평</span>
        <div className={s.summaryGrid}>
          <div className={s.summaryCell}>
            <div className={s.summaryLabel}>현재 클럽 수</div>
            <div className={s.summaryValue}>{results.length}<span style={{ fontSize: '0.5em', color: 'var(--muted)', marginLeft: 4 }}>/ 14</span></div>
          </div>
          <div className={s.summaryCell}>
            <div className={s.summaryLabel}>비거리 범위</div>
            <div className={s.summaryValue}>{showDist(shortest?.distance ?? 0, unit)} ~ {showDist(longest?.distance ?? 0, unit)}<span style={{ fontSize: '0.5em', color: 'var(--muted)', marginLeft: 4 }}>{unit}</span></div>
          </div>
          {widestGap && (
            <div className={s.summaryCell}>
              <div className={s.summaryLabel}>가장 큰 Gap</div>
              <div className={s.summaryValue}>{showDist(widestGap.gap, unit)}<span style={{ fontSize: '0.5em', color: 'var(--muted)', marginLeft: 4 }}>{unit}</span></div>
              <div className={s.summarySub}>{widestGap.from} → {widestGap.to}</div>
            </div>
          )}
          <div className={s.summaryCell}>
            <div className={s.summaryLabel}>보완 추천</div>
            <div className={s.summaryValue}>{wideCount}<span style={{ fontSize: '0.5em', color: 'var(--muted)', marginLeft: 4 }}>구간</span></div>
            <div className={s.summarySub}>{wideCount === 0 ? '간격 분포가 양호합니다' : '간격이 넓은 구간 있음'}</div>
          </div>
        </div>
      </div>

      {/* Gap 분석 표 */}
      {gapList.length > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>거리 간격(Gap) 분석</span>
          <div style={{ overflowX: 'auto' }}>
            <table className={s.gapTable}>
              <thead>
                <tr>
                  <th>구간</th>
                  <th style={{ textAlign: 'right' }}>간격</th>
                  <th style={{ textAlign: 'center' }}>판정</th>
                  <th>제안</th>
                </tr>
              </thead>
              <tbody>
                {gapList.map((g, i) => (
                  <tr key={i}>
                    <td className={s.tdClub}>{g.from} → {g.to}</td>
                    <td className={s.tdNum}>{showDist(g.gap, unit)}{unit}</td>
                    <td className={s.tdStatus}>
                      <span className={`${s.gapBadge} ${
                        g.level === 'ok' ? s.gapOk : g.level === 'tight' ? s.gapTight : s.gapWide
                      }`}>
                        {g.level === 'ok' ? '✅ 적정' : g.level === 'tight' ? '⚠️ 좁음' : '🚨 넓음'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{g.suggestion ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 추천 카드 */}
      {recommendations.length > 0 && (
        <div className={s.section}>
          {recommendations.map((rec, i) => (
            <div key={i} className={s.recommendCard}>
              <div className={s.recommendIcon}>💡</div>
              <div className={s.recommendBody}>
                <span className={s.recommendBadge}>추천</span>
                <p className={s.recommendText}>
                  <strong>{rec.title}</strong> — {rec.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {recommendations.length === 0 && gapList.length > 0 && (
        <div className={s.infoBox}>
          ✨ 클럽 간 거리 간격이 전반적으로 양호합니다. 현재 구성을 유지해도 좋아요.
        </div>
      )}
    </>
  )
}

/* ────────────────────────────────────────────────
 * 환경 보정 탭 (NEW)
 * ──────────────────────────────────────────────── */
function EnvTab({ baseI7, baseDR, unit }: { baseI7: number; baseDR: number; unit: DistanceUnit }) {
  // 기본 비거리 자동 채움 — 7I 우선
  const initialBase = baseI7 > 0 ? baseI7 : (baseDR > 0 ? baseDR : 145)
  const [baseDistance, setBaseDistance] = useState(initialBase)
  const [baseClub, setBaseClub] = useState<'7I' | 'DR'>(baseI7 > 0 ? '7I' : 'DR')
  const [temperature, setTemperature] = useState(20)
  const [elevation, setElevation] = useState(0)
  const [windDir, setWindDir] = useState<WindDirection>('none')
  const [windSpeed, setWindSpeed] = useState(0)
  const [slopeAngle, setSlopeAngle] = useState(0)
  const [lieType, setLieType] = useState<LieType>('fairway')

  // 7I·DR 토글 시 자동
  const handleClubChange = (c: '7I' | 'DR') => {
    setBaseClub(c)
    if (c === '7I' && baseI7 > 0) setBaseDistance(baseI7)
    else if (c === 'DR' && baseDR > 0) setBaseDistance(baseDR)
  }

  const result = useMemo(() => calcEnvCorrected({
    baseDistance, unit: 'm',
    temperature, elevation,
    windDirection: windDir, windSpeed,
    slopeAngle, lieType,
  }), [baseDistance, temperature, elevation, windDir, windSpeed, slopeAngle, lieType])

  return (
    <div className={s.section}>
      <div className={s.card}>
        <span className={s.cardLabel}>① 기본 비거리</span>
        <div className={s.toggleRow} style={{ marginBottom: 10 }}>
          <button className={`${s.toggleBtn} ${baseClub === '7I' ? s.toggleBtnActive : ''}`}
            onClick={() => handleClubChange('7I')}
            style={{ flex: 1 }}>7번 아이언</button>
          <button className={`${s.toggleBtn} ${baseClub === 'DR' ? s.toggleBtnActive : ''}`}
            onClick={() => handleClubChange('DR')}
            style={{ flex: 1 }}>드라이버</button>
        </div>
        <div className={s.envSliderRow}>
          <input type="range" min={50} max={300} step={5}
            value={baseDistance} onChange={e => setBaseDistance(parseInt(e.target.value))}
            className={s.envSlider} />
          <span className={s.envSliderValue}>{showDist(baseDistance, unit)}{unit}</span>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>② 환경 변수</span>

        {/* 기온 */}
        <div className={s.envFactorRow}>
          <span className={s.envFactorLabel}>🌡️ 기온</span>
          <div className={s.envSliderRow}>
            <input type="range" min={-10} max={40} step={1}
              value={temperature} onChange={e => setTemperature(parseInt(e.target.value))}
              className={s.envSlider} />
            <span className={s.envSliderValue} style={{ color: temperature < 10 ? '#0891B2' : temperature > 28 ? '#EA580C' : 'var(--accent)' }}>
              {temperature}°C
            </span>
          </div>
        </div>

        {/* 고도 */}
        <div className={s.envFactorRow}>
          <span className={s.envFactorLabel}>🏔️ 고도</span>
          <div className={s.envSliderRow}>
            <input type="range" min={0} max={3000} step={50}
              value={elevation} onChange={e => setElevation(parseInt(e.target.value))}
              className={s.envSlider} />
            <span className={s.envSliderValue}>{elevation}m</span>
          </div>
        </div>

        {/* 바람 */}
        <div className={s.envFactorRow}>
          <span className={s.envFactorLabel}>💨 바람 방향</span>
          <div className={s.toggleRow} style={{ flex: 1 }}>
            {([
              { key: 'none', label: '없음' },
              { key: 'head', label: '정면' },
              { key: 'tail', label: '등' },
              { key: 'cross', label: '옆' },
            ] as const).map(w => (
              <button key={w.key}
                className={`${s.toggleBtn} ${windDir === w.key ? s.toggleBtnActive : ''}`}
                onClick={() => setWindDir(w.key)}
                style={{ flex: 1, padding: '8px 4px', fontSize: 12 }}>
                {w.label}
              </button>
            ))}
          </div>
        </div>
        {windDir !== 'none' && (
          <div className={s.envFactorRow}>
            <span className={s.envFactorLabel}>바람 세기</span>
            <div className={s.envSliderRow}>
              <input type="range" min={0} max={15} step={1}
                value={windSpeed} onChange={e => setWindSpeed(parseInt(e.target.value))}
                className={s.envSlider} />
              <span className={s.envSliderValue}>{windSpeed}m/s</span>
            </div>
          </div>
        )}

        {/* 경사 */}
        <div className={s.envFactorRow}>
          <span className={s.envFactorLabel}>⛰️ 경사 (양수=오르막)</span>
          <div className={s.envSliderRow}>
            <input type="range" min={-10} max={10} step={1}
              value={slopeAngle} onChange={e => setSlopeAngle(parseInt(e.target.value))}
              className={s.envSlider} />
            <span className={s.envSliderValue}>{slopeAngle > 0 ? '+' : ''}{slopeAngle}°</span>
          </div>
        </div>

        {/* 라이 */}
        <div className={s.envFactorRow}>
          <span className={s.envFactorLabel}>🌿 라이</span>
          <div className={s.lieGrid}>
            {(Object.keys(LIE_LABEL) as LieType[]).map(l => (
              <button key={l}
                className={`${s.toggleBtn} ${lieType === l ? s.toggleBtnActive : ''}`}
                onClick={() => setLieType(l)}
                style={{ padding: '8px 4px', fontSize: 11 }}>
                {LIE_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className={s.envResultCard}>
        <div className={s.envResultHead}>
          <span className={s.cardLabel}>🌬️ 환경 보정 비거리</span>
          <span className={s.envResultBadge} style={{
            color: result.changePercent >= 0 ? '#059669' : '#DC2626',
            borderColor: (result.changePercent >= 0 ? '#059669' : '#DC2626') + '55',
          }}>
            {result.changePercent >= 0 ? '+' : ''}{result.changePercent}%
          </span>
        </div>
        <div className={s.envResultRow}>
          <div className={s.envResultBlock}>
            <div className={s.envResultLabel}>기본</div>
            <div className={s.envResultValue}>{showDist(baseDistance, unit)}{unit}</div>
          </div>
          <span className={s.envResultArrow}>→</span>
          <div className={s.envResultBlock}>
            <div className={s.envResultLabel}>보정 후</div>
            <div className={s.envResultValue} style={{ color: 'var(--accent)' }}>{showDist(result.correctedDistance, unit)}{unit}</div>
          </div>
        </div>

        {result.changes.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <table className={s.envChangeTable}>
              <thead>
                <tr>
                  <th>요인</th>
                  <th>설명</th>
                  <th style={{ textAlign: 'right' }}>변화</th>
                </tr>
              </thead>
              <tbody>
                {result.changes.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>{c.factor}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.desc}</td>
                    <td style={{
                      textAlign: 'right',
                      color: c.tone === 'pos' ? '#059669' : c.tone === 'neg' ? '#DC2626' : 'var(--muted)',
                      fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700,
                    }}>
                      {c.impact > 0 ? '+' : ''}{showDist(c.impact, unit)}{unit}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--bg3)' }}>
                  <td colSpan={2} style={{ fontWeight: 700, color: 'var(--text)' }}>합계</td>
                  <td style={{
                    textAlign: 'right',
                    color: result.totalImpact >= 0 ? '#059669' : '#DC2626',
                    fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800, fontSize: 14,
                  }}>
                    {result.totalImpact >= 0 ? '+' : ''}{showDist(result.totalImpact, unit)}{unit}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <p className={s.envHint}>
          💡 비거리 변화가 ±10% 이상이면 한 클럽 위/아래 사용 권장. 본 추정은 ±10% 오차 가능 — 실전에서 본인 감각도 함께 활용.
        </p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────
 * 내 기록 탭 (NEW)
 * ──────────────────────────────────────────────── */
function RecordsTab({ unit, currentDR, currentI7 }: { unit: DistanceUnit; currentDR?: number; currentI7?: number }) {
  const [records, setRecords] = useState<DistanceRecord[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [date, setDate] = useState(todayStr())
  const [location, setLocation] = useState<RecordLocation>('driving-range')
  const [drInput, setDrInput] = useState(currentDR ? String(Math.round(currentDR)) : '')
  const [i7Input, setI7Input] = useState(currentI7 ? String(Math.round(currentI7)) : '')
  const [tempInput, setTempInput] = useState('')
  const [windInput, setWindInput] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setRecords(loadRecords())
    setHydrated(true)
  }, [])

  const stats = useMemo(() => analyzeRecords(records), [records])

  const handleSave = () => {
    const dr = parseFloat(drInput); const i7 = parseFloat(i7Input)
    if ((!dr || dr <= 0) && (!i7 || i7 <= 0)) return
    const rec: DistanceRecord = {
      id: newId(),
      date,
      ts: new Date(date + 'T12:00:00').getTime(),
      location,
      driver: dr > 0 ? dr : undefined,
      iron7:  i7 > 0 ? i7 : undefined,
      temperature: tempInput ? parseFloat(tempInput) : undefined,
      windSpeed:   windInput ? parseFloat(windInput) : undefined,
      notes: notes.trim() || undefined,
    }
    const updated = [rec, ...records]
    setRecords(updated); saveRecords(updated)
    setDrInput(''); setI7Input(''); setTempInput(''); setWindInput(''); setNotes('')
  }

  const handleDelete = (id: string) => {
    const updated = records.filter(r => r.id !== id)
    setRecords(updated); saveRecords(updated)
  }

  const handleClearAll = () => {
    if (!confirm('모든 기록을 삭제하시겠습니까?')) return
    setRecords([]); saveRecords([])
  }

  if (!hydrated) return null

  return (
    <div className={s.section}>
      {/* 누적 통계 */}
      {records.length > 0 && (
        <div className={s.recordStatsCard}>
          <span className={s.cardLabel}>📊 누적 통계 ({records.length}회 기록)</span>
          <div className={s.recordStatsGrid}>
            <div className={s.recordStat}>
              <div className={s.recordStatLabel}>드라이버 평균</div>
              <div className={s.recordStatValue}>{stats.driverAvg !== null ? `${showDist(stats.driverAvg, unit)}${unit}` : '—'}</div>
              <div className={s.recordStatSub}>최고 {stats.bestDriver !== null ? `${showDist(stats.bestDriver, unit)}${unit}` : '—'}</div>
            </div>
            <div className={s.recordStat}>
              <div className={s.recordStatLabel}>7I 평균</div>
              <div className={s.recordStatValue}>{stats.iron7Avg !== null ? `${showDist(stats.iron7Avg, unit)}${unit}` : '—'}</div>
              <div className={s.recordStatSub}>최고 {stats.bestIron7 !== null ? `${showDist(stats.bestIron7, unit)}${unit}` : '—'}</div>
            </div>
          </div>
          {(stats.driverChange !== null || stats.iron7Change !== null) && (
            <p className={s.envHint} style={{ marginTop: 10 }}>
              📈 최근 30일 변화 — DR <strong style={{ color: (stats.driverChange ?? 0) >= 0 ? '#059669' : '#DC2626' }}>
                {stats.driverChange !== null ? `${stats.driverChange >= 0 ? '+' : ''}${showDist(stats.driverChange, unit)}${unit}` : '—'}
              </strong>, 7I <strong style={{ color: (stats.iron7Change ?? 0) >= 0 ? '#059669' : '#DC2626' }}>
                {stats.iron7Change !== null ? `${stats.iron7Change >= 0 ? '+' : ''}${showDist(stats.iron7Change, unit)}${unit}` : '—'}
              </strong>
            </p>
          )}
        </div>
      )}

      {/* 새 기록 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>➕ 새 기록 추가</span>
        <div className={s.recordFormGrid}>
          <div>
            <span className={s.fieldLabel}>날짜</span>
            <input type="date" className={s.recordDateInput}
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <span className={s.fieldLabel}>장소</span>
            <select className={s.recordSelect}
              value={location} onChange={e => setLocation(e.target.value as RecordLocation)}>
              {(Object.keys(LOCATION_LABEL) as RecordLocation[]).map(k => (
                <option key={k} value={k}>{LOCATION_LABEL[k]}</option>
              ))}
            </select>
          </div>
        </div>
        <div className={s.recordFormGrid} style={{ marginTop: 8 }}>
          <div>
            <span className={s.fieldLabel}>드라이버 ({unit})</span>
            <input type="text" inputMode="decimal" className={s.recordInput}
              placeholder={unit === 'm' ? '예: 220' : '예: 240'}
              value={drInput} onChange={e => setDrInput(e.target.value.replace(/[^0-9.]/g, ''))} />
          </div>
          <div>
            <span className={s.fieldLabel}>7I ({unit})</span>
            <input type="text" inputMode="decimal" className={s.recordInput}
              placeholder={unit === 'm' ? '예: 145' : '예: 160'}
              value={i7Input} onChange={e => setI7Input(e.target.value.replace(/[^0-9.]/g, ''))} />
          </div>
        </div>
        <div className={s.recordFormGrid} style={{ marginTop: 8 }}>
          <div>
            <span className={s.fieldLabel}>기온 (°C, 선택)</span>
            <input type="text" inputMode="decimal" className={s.recordInput}
              placeholder="예: 18"
              value={tempInput} onChange={e => setTempInput(e.target.value.replace(/[^0-9.\-]/g, ''))} />
          </div>
          <div>
            <span className={s.fieldLabel}>바람 (m/s, 선택)</span>
            <input type="text" inputMode="decimal" className={s.recordInput}
              placeholder="예: 3"
              value={windInput} onChange={e => setWindInput(e.target.value.replace(/[^0-9.]/g, ''))} />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <span className={s.fieldLabel}>메모 (선택)</span>
          <input type="text" className={s.recordInput}
            placeholder="컨디션·코스명 등"
            value={notes} onChange={e => setNotes(e.target.value)} maxLength={50} />
        </div>
        <button type="button" className={s.recordSaveBtn} onClick={handleSave}>
          📅 기록 저장
        </button>
      </div>

      {/* 기록 목록 */}
      {records.length > 0 ? (
        <div className={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className={s.cardLabel} style={{ marginBottom: 0 }}>📅 최근 기록 (최대 1년 보관)</span>
            <button type="button" onClick={handleClearAll}
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}>
              전체 삭제
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={s.distanceTable}>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>장소</th>
                  <th style={{ textAlign: 'right' }}>DR</th>
                  <th style={{ textAlign: 'right' }}>7I</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 30).map(r => (
                  <tr key={r.id}>
                    <td className={s.tdMuted} style={{ fontSize: 12, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.date}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{LOCATION_LABEL[r.location]}</td>
                    <td className={s.tdNum}>{r.driver ? `${showDist(r.driver, unit)}${unit}` : '—'}</td>
                    <td className={s.tdNum}>{r.iron7 ? `${showDist(r.iron7, unit)}${unit}` : '—'}</td>
                    <td>
                      <button type="button" onClick={() => handleDelete(r.id)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={s.emptyCard}>
          <strong>아직 기록이 없습니다</strong>
          위에서 첫 비거리 기록을 추가해 보세요. 기록은 본인의 브라우저에만 저장됩니다 (서버 X).
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────
 * Helper: 두 클럽 사이에 들어갈 만한 클럽 추천
 * ──────────────────────────────────────────────── */
function clubBetween(a: Club, b: Club): string | null {
  // 자주 발생하는 케이스: PW ↔ SW → AW
  if ((a === 'PW' && b === 'SW') || (a === 'SW' && b === 'PW')) return 'AW(어프로치 웨지, 약 52도)'
  if ((a === '9I' && b === 'PW') || (a === 'PW' && b === '9I')) return '46도 웨지'
  if ((a === 'AW' && b === 'SW') || (a === 'SW' && b === 'AW')) return '54도 웨지'
  if ((a === 'SW' && b === 'LW') || (a === 'LW' && b === 'SW')) return '58도 웨지'
  if ((a === 'DR' && b === '3W') || (a === '3W' && b === 'DR')) return 'Mini Driver 또는 강한 3W'
  if ((a === '3W' && b === '5W') || (a === '5W' && b === '3W')) return '4번 우드'
  if ((a === '5W' && b === '4U') || (a === '4U' && b === '5W')) return '3번 유틸'
  if ((a === '5W' && b === '4I') || (a === '4I' && b === '5W')) return '하이브리드 유틸리티'
  if ((a === '4I' && b === '5I') || (a === '5I' && b === '4I')) return null
  return null
}
