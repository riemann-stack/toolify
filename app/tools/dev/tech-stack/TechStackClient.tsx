'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './tech-stack.module.css'
import {
  type UserInputs, type ProjectType, type Scale, type Team, type Timeline,
  type Budget, type Traffic, type Experience, type Language, type Seo,
  type Recommendation,
  SCENARIOS, DEFAULT_INPUTS,
  recommendAll, estimateCost, estimateDuration, buildTradeoff,
  categoryLabel, categoryEmoji, computeWeights,
} from './techStackUtils'
import {
  type Stack, type StackScores,
  ALL_STACKS, FRONTENDS, BACKENDS, DATABASES, AUTHS, HOSTINGS, PAYMENTS, ANALYTICS, MOBILES,
} from './stackData'

type TabKey = 'recommend' | 'guide'
const STORAGE_KEY = 'youtil:tech-stack:v1'

const TABS = [
  { k: 'recommend', l: '🎯 추천 받기' },
  { k: 'guide',     l: '📚 비교 가이드' },
] as const

export default function TechStackClient() {
  const [tab, setTab] = useState<TabKey>('recommend')
  const [inputs, setInputs] = useState<UserInputs>(DEFAULT_INPUTS)
  const [activeScenario, setActiveScenario] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setInputs((prev) => ({ ...prev, ...parsed }))
      }
    } catch { /* ignore */ }
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)) } catch { /* ignore */ }
  }, [inputs, mounted])

  const update = <K extends keyof UserInputs>(k: K, v: UserInputs[K]) => {
    setInputs((prev) => ({ ...prev, [k]: v }))
    setActiveScenario(null)
  }

  const recommendations = useMemo(() => recommendAll(inputs), [inputs])
  const cost = useMemo(() => estimateCost(recommendations), [recommendations])
  const duration = useMemo(() => estimateDuration(recommendations, inputs), [recommendations, inputs])
  const weights = useMemo(() => computeWeights(inputs), [inputs])

  const applyScenario = (id: string) => {
    const s = SCENARIOS.find((x) => x.id === id)
    if (!s) return
    setInputs((prev) => ({ ...prev, ...s.inputs }))
    setActiveScenario(id)
  }

  const activeScenarioData = activeScenario ? SCENARIOS.find((s) => s.id === activeScenario) : undefined

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.k}
            className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`}
            onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'recommend' && (
        <RecommendTab
          inputs={inputs} update={update}
          activeScenario={activeScenario}
          activeScenarioData={activeScenarioData}
          applyScenario={applyScenario}
          recommendations={recommendations}
          cost={cost}
          duration={duration}
          weights={weights}
        />
      )}
      {tab === 'guide' && <GuideTab />}

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/dev/json',          label: 'JSON 포맷터' },
          { href: '/tools/dev/regex',         label: '정규식 테스트기' },
          { href: '/tools/dev/css-converter', label: 'CSS 변환기' },
        ]}
      >
        본 추천은 일반 가이드 — 정확한 선택은 팀 상황·요구사항·기존 자산에 따라 달라집니다. 2026년 5월 기준 데이터이며 기술 트렌드는 빠르게 변하므로 정기 확인. 비용은 추정치이니 정확한 가격은 각 서비스 공식 사이트 확인. 한국 특화 통합(카카오·토스 등)은 별도 사업자등록·심사 필요.
      </Disclaimer>
    </div>
  )
}

/* ═════════════════════ TAB 1: 추천 ═════════════════════ */
function RecommendTab(props: {
  inputs: UserInputs
  update: <K extends keyof UserInputs>(k: K, v: UserInputs[K]) => void
  activeScenario: string | null
  activeScenarioData: typeof SCENARIOS[number] | undefined
  applyScenario: (id: string) => void
  recommendations: Recommendation[]
  cost: ReturnType<typeof estimateCost>
  duration: ReturnType<typeof estimateDuration>
  weights: ReturnType<typeof computeWeights>
}) {
  const { inputs, update, activeScenario, activeScenarioData, applyScenario, recommendations, cost, duration, weights } = props
  const [showCustom, setShowCustom] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCmd = async (cmd: string, id: string) => {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div className={styles.panel}>
      {/* 시나리오 프리셋 */}
      <section>
        <label className={styles.label}>🎬 시나리오 프리셋 — 한 클릭 적용</label>
        <div className={styles.scenarioGrid}>
          {SCENARIOS.map((s) => (
            <button key={s.id}
              className={`${styles.scenarioCard} ${activeScenario === s.id ? styles.scenarioCardActive : ''}`}
              onClick={() => applyScenario(s.id)}>
              <div className={styles.scenarioHeadRow}>
                <span className={styles.scenarioEmoji}>{s.emoji}</span>
                <span className={styles.scenarioLabel}>{s.label.replace(/^[^\s]+\s/, '')}</span>
              </div>
              <p className={styles.scenarioDesc}>{s.desc}</p>
            </button>
          ))}
        </div>
        {activeScenarioData && (
          <div className={styles.scenarioTip}>
            <strong>💡 {activeScenarioData.label} 핵심 팁</strong>
            <ul>
              {activeScenarioData.tips.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        )}
      </section>

      {/* 수동 입력 토글 */}
      <section>
        <button className={styles.customToggle} onClick={() => setShowCustom((v) => !v)}>
          {showCustom ? '▼' : '▶'} 수동 입력 (커스텀 조건 — 8개 변수)
        </button>
        {showCustom && (
          <div className={styles.customGrid}>
            <SelectInput label="프로젝트 유형" value={inputs.projectType} onChange={(v) => update('projectType', v as ProjectType)}
              options={[
                { v: 'webapp',  l: '웹앱 (SSR)' },
                { v: 'spa',     l: 'SPA (CSR)' },
                { v: 'static',  l: '정적 사이트' },
                { v: 'mobile',  l: '모바일' },
                { v: 'api',     l: 'API 서버' },
                { v: 'desktop', l: '데스크톱' },
              ]} />
            <SelectInput label="규모" value={inputs.scale} onChange={(v) => update('scale', v as Scale)}
              options={[
                { v: 'toy',      l: '토이' },
                { v: 'sidekick', l: '사이드' },
                { v: 'mvp',      l: 'MVP' },
                { v: 'medium',   l: '중규모' },
                { v: 'large',    l: '대규모' },
              ]} />
            <SelectInput label="팀 인원" value={inputs.team} onChange={(v) => update('team', v as Team)}
              options={[
                { v: 'solo',   l: '1인' },
                { v: 'small',  l: '2~5인' },
                { v: 'medium', l: '6~20인' },
                { v: 'large',  l: '21+' },
              ]} />
            <SelectInput label="타임라인" value={inputs.timeline} onChange={(v) => update('timeline', v as Timeline)}
              options={[
                { v: '1w', l: '1주' },
                { v: '1m', l: '1개월' },
                { v: '3m', l: '3개월' },
                { v: '6m', l: '6개월+' },
              ]} />
            <SelectInput label="예산" value={inputs.budget} onChange={(v) => update('budget', v as Budget)}
              options={[
                { v: 'free',      l: '무료' },
                { v: 'low',       l: '저예산 ($50/월)' },
                { v: 'medium',    l: '중간 ($500/월)' },
                { v: 'unlimited', l: '무관' },
              ]} />
            <SelectInput label="트래픽" value={inputs.traffic} onChange={(v) => update('traffic', v as Traffic)}
              options={[
                { v: '100',  l: '100명/월' },
                { v: '10k',  l: '1만/월' },
                { v: '100k', l: '10만/월' },
                { v: '1m',   l: '100만+/월' },
              ]} />
            <SelectInput label="본인 경험" value={inputs.experience} onChange={(v) => update('experience', v as Experience)}
              options={[
                { v: 'beginner',     l: '초보' },
                { v: 'intermediate', l: '중급' },
                { v: 'senior',       l: '시니어' },
              ]} />
            <SelectInput label="익숙한 언어" value={inputs.language} onChange={(v) => update('language', v as Language)}
              options={[
                { v: 'ts',     l: 'JS/TS' },
                { v: 'python', l: 'Python' },
                { v: 'java',   l: 'Java' },
                { v: 'go',     l: 'Go' },
                { v: 'rust',   l: 'Rust' },
                { v: 'other',  l: '기타' },
              ]} />
            <SelectInput label="SEO 중요도" value={inputs.seo} onChange={(v) => update('seo', v as Seo)}
              options={[
                { v: 'high',   l: '매우 중요' },
                { v: 'medium', l: '보통' },
                { v: 'none',   l: '무관' },
              ]} />
            <div className={styles.checkRow}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={inputs.koreaIntegration}
                  onChange={(e) => update('koreaIntegration', e.target.checked)} />
                <span>🇰🇷 한국 특화 통합 필요 (카카오·토스·본인인증)</span>
              </label>
            </div>
          </div>
        )}
      </section>

      {/* 가중치 시각화 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>⚖️ 적용된 가중치 (입력값 자동 분석)</p>
        <div className={styles.weightChips}>
          {(Object.entries(weights) as Array<[keyof typeof weights, number]>).map(([k, v]) => (
            <span key={k} className={styles.weightChip}>
              {weightLabel(k)} <strong>×{v.toFixed(2)}</strong>
            </span>
          ))}
        </div>
        <p className={styles.note}>가중치가 높을수록 추천 순위에 더 큰 영향. 예산 무료 선택 시 비용 가중치 ×3.</p>
      </section>

      {/* 추천 결과 — 요약 카드 (한눈에 보기) */}
      <section>
        <label className={styles.label}>🏆 추천 풀스택 — 한눈에 보기</label>
        <div className={styles.summaryStackGrid}>
          {recommendations.map((rec) => (
            <div key={`summary-${rec.category}`} className={styles.summaryStackCard}>
              <div className={styles.summaryStackCategory}>
                {categoryEmoji(rec.category)} {categoryLabel(rec.category)}
              </div>
              <div className={styles.summaryStackName}>
                <span className={styles.summaryStackEmoji}>{rec.primary.emoji}</span>
                {rec.primary.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 추천 결과 — 상세 */}
      <section>
        <label className={styles.label}>📋 카테고리별 상세 ({recommendations.length}개)</label>
        <div className={styles.recommendGrid}>
          {recommendations.map((rec) => (
            <RecommendCard key={rec.category} rec={rec} weights={weights} onCopy={copyCmd} copiedId={copiedId} />
          ))}
        </div>
      </section>

      {/* 비용 + 기간 */}
      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>예상 월 비용 (1만 사용자 기준)</p>
          <p className={styles.summaryBig}>
            ${cost.monthlyLow}~${cost.monthlyHigh}
          </p>
          <p className={styles.summarySub}>
            연간 약 ${cost.yearlyTypical} (전형 ${cost.monthlyTypical}/월)
          </p>
        </div>
        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>예상 개발 기간</p>
          <p className={styles.summaryBig}>{duration.weeksLow}~{duration.weeksHigh}주</p>
          <p className={styles.summarySub}>
            본인 경험 ({experienceLabel(inputs.experience)}) 기준 학습 + 코딩
          </p>
        </div>
      </section>

      {/* 트레이드오프 표 — Frontend 카테고리만 별도 표시 */}
      {recommendations.find((r) => r.category === 'frontend') && (
        <section>
          <label className={styles.label}>📊 Frontend 트레이드오프 (추천 vs 대안)</label>
          <TradeoffTable rec={recommendations.find((r) => r.category === 'frontend')!} />
        </section>
      )}

      {/* 7축 레이더 차트 — 추천 vs 대안 비교 */}
      {recommendations.find((r) => r.category === 'frontend') && (
        <section>
          <label className={styles.label}>🕸️ Frontend 7축 점수 비교</label>
          <RadarChart rec={recommendations.find((r) => r.category === 'frontend')!} />
        </section>
      )}
    </div>
  )
}

/* ─── 추천 카드 ─── */
function RecommendCard({ rec, onCopy, copiedId }: {
  rec: Recommendation
  weights: ReturnType<typeof computeWeights>
  onCopy: (cmd: string, id: string) => void
  copiedId: string | null
}) {
  return (
    <div className={styles.recommendCard}>
      <div className={styles.recommendHead}>
        <span className={styles.recommendCategory}>
          {categoryEmoji(rec.category)} {categoryLabel(rec.category)}
        </span>
      </div>
      <div className={styles.recommendPrimary}>
        <span className={styles.primaryEmoji}>{rec.primary.emoji}</span>
        <div className={styles.primaryBody}>
          <p className={styles.primaryName}>{rec.primary.label}</p>
          <p className={styles.primaryDesc}>{rec.primary.desc}</p>
          <div className={styles.primaryMeta}>
            <span>💰 ${rec.primary.monthlyCostUsd[0]}~${rec.primary.monthlyCostUsd[1]}/월</span>
            <span>📚 {rec.primary.learningWeeks[0]}주 (초보) / {rec.primary.learningWeeks[1]}주 (중급)</span>
          </div>
          {rec.primary.koreaNote && (
            <p className={styles.primaryKorea}>🇰🇷 {rec.primary.koreaNote}</p>
          )}
          {rec.primary.setupCmd && (
            <div className={styles.cmdBox}>
              <code>{rec.primary.setupCmd}</code>
              <button className={styles.copyBtn} onClick={() => onCopy(rec.primary.setupCmd!, rec.primary.id)}>
                {copiedId === rec.primary.id ? '✓ 복사됨' : '📋'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pros·Cons */}
      <div className={styles.prosCons}>
        <div>
          <p className={styles.prosTitle}>✓ 장점</p>
          <ul>{rec.primary.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
        <div>
          <p className={styles.consTitle}>⚠ 단점</p>
          <ul>{rec.primary.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </div>
      </div>

      {/* 대안 */}
      {rec.alternatives.length > 0 && (
        <div className={styles.alternatives}>
          <p className={styles.altTitle}>대안 후보</p>
          <div className={styles.altList}>
            {rec.alternatives.map((alt) => (
              <div key={alt.id} className={styles.altItem}>
                <span className={styles.altEmoji}>{alt.emoji}</span>
                <div>
                  <p className={styles.altName}>{alt.label}</p>
                  <p className={styles.altDesc}>{alt.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── 트레이드오프 표 ─── */
function TradeoffTable({ rec }: { rec: Recommendation }) {
  const rows = buildTradeoff(rec)
  const stacks = [rec.primary, ...rec.alternatives]
  return (
    <div className={styles.tradeoffWrap}>
      <table className={styles.tradeoffTable}>
        <thead>
          <tr>
            <th>측면</th>
            {stacks.map((s, i) => (
              <th key={s.id}>{i === 0 ? '⭐ ' : ''}{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.axis}>
              <td>{row.label}</td>
              {row.values.map((v, i) => (
                <td key={i}>
                  <span className={styles.scoreBar} style={{ width: `${v * 10}%` }} />
                  <span className={styles.scoreText}>{v}/10</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── 7축 레이더 차트 SVG ─── */
function RadarChart({ rec }: { rec: Recommendation }) {
  const stacks = [rec.primary, ...rec.alternatives]
  const axes: Array<{ key: keyof StackScores; label: string }> = [
    { key: 'speed',       label: '속도' },
    { key: 'scale',       label: '확장성' },
    { key: 'cost',        label: '비용' },
    { key: 'learning',    label: '학습' },
    { key: 'ecosystem',   label: '생태계' },
    { key: 'performance', label: '성능' },
    { key: 'koreaJobs',   label: '한국 채용' },
  ]
  const W = 360, H = 360, cx = W / 2, cy = H / 2, R = 130
  const colors = ['#C8FF3E', '#3EC8FF', '#FFB938']

  const point = (axisIdx: number, value: number) => {
    const angle = (axisIdx / axes.length) * Math.PI * 2 - Math.PI / 2
    const r = (value / 10) * R
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  }

  const polygon = (stack: Stack) =>
    axes.map((a, i) => {
      const p = point(i, stack.scores[a.key])
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' ')

  return (
    <div className={styles.radarWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.radarSvg} preserveAspectRatio="xMidYMid meet">
        {/* 가이드 원 */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <polygon key={t}
            points={axes.map((_, i) => {
              const angle = (i / axes.length) * Math.PI * 2 - Math.PI / 2
              const r = R * t
              return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`
            }).join(' ')}
            fill="none" stroke="var(--border)" strokeWidth="1" opacity={0.4} />
        ))}
        {/* 축 라인 */}
        {axes.map((a, i) => {
          const angle = (i / axes.length) * Math.PI * 2 - Math.PI / 2
          const x2 = cx + Math.cos(angle) * R
          const y2 = cy + Math.sin(angle) * R
          const lx = cx + Math.cos(angle) * (R + 18)
          const ly = cy + Math.sin(angle) * (R + 18)
          return (
            <g key={a.key}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="var(--border)" strokeWidth="1" opacity={0.4} />
              <text x={lx} y={ly} fill="var(--muted)" fontSize="11" textAnchor="middle" dominantBaseline="middle" fontFamily="Noto Sans KR, sans-serif">
                {a.label}
              </text>
            </g>
          )
        })}
        {/* 데이터 폴리곤 */}
        {stacks.map((s, i) => (
          <polygon key={s.id} points={polygon(s)}
            fill={colors[i]} fillOpacity={0.15}
            stroke={colors[i]} strokeWidth="2" />
        ))}
        {/* 점 */}
        {stacks.map((s, sIdx) => (
          axes.map((a, aIdx) => {
            const p = point(aIdx, s.scores[a.key])
            return <circle key={`${s.id}-${a.key}`} cx={p.x} cy={p.y} r="3" fill={colors[sIdx]} />
          })
        ))}
      </svg>
      <div className={styles.radarLegend}>
        {stacks.map((s, i) => (
          <span key={s.id} className={styles.radarLegendItem}>
            <span className={styles.radarDot} style={{ background: colors[i] }} />
            {i === 0 ? '⭐ ' : ''}{s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Select 입력 ─── */
function SelectInput<T extends string>({ label, value, onChange, options }: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { v: T; l: string }[]
}) {
  return (
    <div className={styles.selectField}>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  )
}

/* ═════════════════════ TAB 2: 비교 가이드 ═════════════════════ */
function GuideTab() {
  const sections: Array<{ title: string; emoji: string; stacks: Stack[]; desc: string }> = [
    { title: 'Frontend',  emoji: '🎨', stacks: FRONTENDS,  desc: 'Next.js·Remix·Astro·SvelteKit·Nuxt·Vite' },
    { title: 'Backend',   emoji: '⚙️', stacks: BACKENDS,   desc: 'Next API·Hono·FastAPI·Express·NestJS·Spring·Django' },
    { title: 'Database',  emoji: '🗄️', stacks: DATABASES,  desc: 'Supabase·Neon·Postgres·MongoDB·SQLite·Redis' },
    { title: 'Auth',      emoji: '🔐', stacks: AUTHS,      desc: 'Clerk·Supabase·Auth.js·Firebase·카카오 직접' },
    { title: 'Hosting',   emoji: '☁️', stacks: HOSTINGS,   desc: 'Vercel·Netlify·Cloudflare·AWS·Fly·Railway' },
    { title: 'Payment',   emoji: '💳', stacks: PAYMENTS,   desc: '토스페이먼츠·포트원·카카오페이·이니시스·Stripe' },
    { title: 'Mobile',    emoji: '📱', stacks: MOBILES,    desc: 'React Native·Flutter·Swift·Kotlin·Tauri' },
    { title: 'Analytics', emoji: '📊', stacks: ANALYTICS,  desc: 'Vercel·GA4·Plausible·PostHog' },
  ]

  return (
    <div className={styles.panel}>
      {sections.map((sec) => (
        <section key={sec.title}>
          <p className={styles.guideSectionTitle}>{sec.emoji} {sec.title} <span className={styles.guideSectionSub}>{sec.desc}</span></p>
          <div className={styles.guideTableWrap}>
            <table className={styles.guideTable}>
              <thead>
                <tr>
                  <th>스택</th>
                  <th>속도</th>
                  <th>비용</th>
                  <th>학습</th>
                  <th>한국</th>
                  <th>월 비용</th>
                  <th>학습 기간</th>
                </tr>
              </thead>
              <tbody>
                {sec.stacks.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.emoji} {s.label}</strong>
                      <small>{s.desc}</small>
                    </td>
                    <td><ScoreCell value={s.scores.speed} /></td>
                    <td><ScoreCell value={s.scores.cost} /></td>
                    <td><ScoreCell value={s.scores.learning} /></td>
                    <td><ScoreCell value={s.scores.koreaJobs} /></td>
                    <td className={styles.cellPrice}>${s.monthlyCostUsd[0]}~${s.monthlyCostUsd[1]}</td>
                    <td className={styles.cellWeeks}>{s.learningWeeks[1]}~{s.learningWeeks[0]}주</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* 한국 특화 통합 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🇰🇷 한국 특화 통합 가이드</p>
        <div className={styles.koreaGuideGrid}>
          {[
            { title: '카카오 OAuth',     desc: 'Auth.js + 카카오 provider 또는 react-kakao-login. 카카오 디벨로퍼 등록 필요.' },
            { title: '네이버 OAuth',     desc: 'Auth.js naver provider. 네이버 디벨로퍼 등록 + 검수 필요.' },
            { title: '토스페이먼츠',      desc: '@tosspayments/payment-sdk. 사업자 등록 + 가맹점 심사 (1주). 수수료 2.7~3.3%.' },
            { title: '포트원 (멀티 PG)',  desc: '@portone/browser-sdk. 토스·이니시스·카카오페이 모두 한 번에.' },
            { title: '본인인증 (PASS)',   desc: 'NICE·KCB·SCI 3사. 사업자등록 + 심사 + 보안 서약 필요.' },
            { title: '카톡 알림톡',       desc: 'NHN Toast·Aligo·LMS API. 템플릿 사전 등록 후 발송.' },
            { title: '국내 SMS',         desc: 'NCloud SENS·Aligo·CoolSMS. 1건 ~10원.' },
            { title: '국내 호스팅',       desc: 'NCloud·KT·카페24. AWS Seoul region이 일반적. 공공기관은 NCloud 의무.' },
          ].map((item, i) => (
            <div key={i} className={styles.koreaGuideCard}>
              <p className={styles.koreaGuideTitle}>{item.title}</p>
              <p className={styles.koreaGuideDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 안티패턴 경고 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🚫 안티패턴 — 피해야 할 조합</p>
        <ul className={styles.antiList}>
          <li><strong>MVP에 마이크로서비스 / Kubernetes</strong> — 오버엔지니어링. 모놀리스 + Vercel/Railway로 시작</li>
          <li><strong>1인 토이에 AWS EC2 + 직접 구성</strong> — 시간 낭비. Vercel/Cloudflare 클릭 배포</li>
          <li><strong>SEO 중요한데 SPA</strong> — 검색 노출 손해. SSR (Next.js/Remix) 또는 SSG (Astro)</li>
          <li><strong>저예산 1만+ 사용자에 Clerk</strong> — $25/월. Supabase Auth 또는 Auth.js로</li>
          <li><strong>한국 전용 서비스에 Stripe</strong> — 카드사·계좌이체 부족. 토스페이먼츠 권장</li>
          <li><strong>실시간 협업에 Vercel</strong> — WebSocket 제한. Fly.io / Railway / Cloudflare Durable Objects</li>
          <li><strong>대용량 파일 업로드에 Vercel/Lambda</strong> — 4.5MB 제한. S3 Presigned URL 직접</li>
          <li><strong>초보가 처음부터 Microservices·CQRS</strong> — 학습 부담 ↑. 단일 DB·CRUD부터</li>
        </ul>
      </section>
    </div>
  )
}

function ScoreCell({ value }: { value: number }) {
  const color = value >= 8 ? '#3EFF9B' : value >= 6 ? '#C8FF3E' : value >= 4 ? '#FFB938' : '#FF8C8C'
  return (
    <span className={styles.scoreCellWrap}>
      <span className={styles.scoreCellBar} style={{ width: `${value * 10}%`, background: color }} />
      <span className={styles.scoreCellText} style={{ color }}>{value}</span>
    </span>
  )
}

/* ─── 라벨 헬퍼 ─── */
function weightLabel(k: string): string {
  return ({
    speed: '개발 속도', scale: '확장성', cost: '비용 효율',
    learning: '학습 곡선', ecosystem: '생태계', performance: '성능', koreaJobs: '한국 채용',
  } as Record<string, string>)[k] ?? k
}
function experienceLabel(e: Experience): string {
  return ({ beginner: '초보', intermediate: '중급', senior: '시니어' } as const)[e]
}
