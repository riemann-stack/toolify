/* ──────────────────────────────────────────────────────
   tech-stack/techStackUtils.ts
   12 시나리오 + 추천 알고리즘 + 비용·기간 추정
   ────────────────────────────────────────────────────── */

import {
  type Stack, type Category, type StackScores,
  ALL_STACKS, stacksByCategory,
} from './stackData'

/* ─── 시나리오 12종 ─── */
export interface Scenario {
  id: string
  emoji: string
  label: string
  desc: string
  /** 카테고리별 추천 스택 ID + 대안 ID 1~2개 */
  picks: Partial<Record<Category, { primary: string; alts: string[] }>>
  /** 자동 입력값 (수동 모드 보정) */
  inputs: Partial<UserInputs>
  /** 시나리오 별 핵심 팁 */
  tips: string[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'mvp-startup', emoji: '🚀', label: 'MVP 스타트업 (3개월)',
    desc: '3개월 내 출시 + 검증. Vercel + Supabase 무료 시작 → Pro 전환',
    picks: {
      frontend:  { primary: 'next',          alts: ['remix', 'sveltekit'] },
      backend:   { primary: 'next-api',      alts: ['hono'] },
      db:        { primary: 'supabase-pg',   alts: ['neon'] },
      auth:      { primary: 'supabase-auth', alts: ['clerk', 'auth-js'] },
      hosting:   { primary: 'vercel',        alts: ['cloudflare'] },
      payment:   { primary: 'toss-payments', alts: ['portone', 'stripe'] },
      analytics: { primary: 'vercel-analytics', alts: ['plausible', 'posthog'] },
    },
    inputs: { projectType: 'webapp', scale: 'mvp', timeline: '3m', traffic: '10k', seo: 'high' },
    tips: [
      '무료 티어로 시작 → 사용자 1만 도달 후 Pro 전환',
      'Supabase + Vercel 조합이 1인 개발에 최적',
      '결제는 Phase 2 — 처음에는 Stripe Checkout으로 빠르게',
    ],
  },
  {
    id: 'side-weekend', emoji: '🎨', label: '사이드 프로젝트 (주말)',
    desc: '재미용·포트폴리오. 거의 무료로',
    picks: {
      frontend:  { primary: 'astro',         alts: ['vite', 'next'] },
      backend:   { primary: 'hono',          alts: ['next-api'] },
      db:        { primary: 'sqlite',        alts: ['neon'] },
      auth:      { primary: 'auth-js',       alts: ['clerk'] },
      hosting:   { primary: 'cloudflare',    alts: ['vercel', 'netlify'] },
      analytics: { primary: 'plausible',     alts: ['vercel-analytics'] },
    },
    inputs: { projectType: 'static', scale: 'toy', timeline: '1w', budget: 'free', traffic: '100' },
    tips: [
      'Cloudflare Pages + D1 = 거의 무료',
      'Astro로 SEO·성능 모두 챙김',
      '인증 필요 시 Auth.js + Discord/GitHub OAuth가 가장 빠름',
    ],
  },
  {
    id: 'ai-chatbot', emoji: '🤖', label: 'AI 챗봇·LLM 앱',
    desc: 'Claude/GPT 통합. Streaming UI + 토큰 비용 관리',
    picks: {
      frontend: { primary: 'next',         alts: ['remix'] },
      backend:  { primary: 'next-api',     alts: ['fastapi', 'hono'] },
      db:       { primary: 'supabase-pg',  alts: ['neon', 'redis'] },
      auth:     { primary: 'clerk',        alts: ['supabase-auth'] },
      hosting:  { primary: 'vercel',       alts: ['cloudflare'] },
      analytics:{ primary: 'posthog',      alts: ['vercel-analytics'] },
    },
    inputs: { projectType: 'webapp', scale: 'mvp', timeline: '1m', traffic: '10k' },
    tips: [
      'Vercel AI SDK로 Streaming UI 즉시',
      '토큰 비용 추적 필수 — Redis 캐싱으로 절약',
      'Anthropic Prompt Caching 활용 시 90% 비용 절감',
    ],
  },
  {
    id: 'mobile-cross', emoji: '📱', label: '모바일 앱 크로스플랫폼',
    desc: 'iOS + Android 동시. JS 경험 활용',
    picks: {
      mobile:    { primary: 'rn-expo',       alts: ['flutter'] },
      backend:   { primary: 'next-api',      alts: ['hono', 'fastapi'] },
      db:        { primary: 'supabase-pg',   alts: ['neon'] },
      auth:      { primary: 'clerk',         alts: ['firebase-auth', 'supabase-auth'] },
      hosting:   { primary: 'vercel',        alts: ['railway'] },
      analytics: { primary: 'posthog',       alts: ['ga4'] },
    },
    inputs: { projectType: 'mobile', scale: 'mvp', timeline: '3m', traffic: '10k' },
    tips: [
      'Expo Router로 React Native 빠른 시작',
      'EAS Build로 클라우드 빌드 (Mac 없어도 iOS 빌드)',
      '카카오 로그인은 Native 모듈 별도 — react-native-kakao-login',
    ],
  },
  {
    id: 'blog-marketing', emoji: '📰', label: '블로그·마케팅 정적 사이트',
    desc: '콘텐츠 위주. 최고 SEO + 무료',
    picks: {
      frontend:  { primary: 'astro',           alts: ['next', 'sveltekit'] },
      hosting:   { primary: 'cloudflare',      alts: ['vercel', 'netlify'] },
      analytics: { primary: 'plausible',       alts: ['vercel-analytics', 'ga4'] },
    },
    inputs: { projectType: 'static', scale: 'sidekick', timeline: '1w', budget: 'free', seo: 'high' },
    tips: [
      'Astro Content Collections로 Markdown 관리',
      'View Transitions API로 SPA 같은 전환',
      'OG 이미지 자동 생성 (Astro OG 플러그인)',
    ],
  },
  {
    id: 'ecommerce', emoji: '🛒', label: '이커머스',
    desc: '상품·주문·결제·배송. 한국 결제 통합',
    picks: {
      frontend: { primary: 'next',           alts: ['nuxt'] },
      backend:  { primary: 'next-api',       alts: ['nestjs'] },
      db:       { primary: 'supabase-pg',    alts: ['postgres-self'] },
      auth:     { primary: 'auth-js',        alts: ['kakao-direct'] },
      hosting:  { primary: 'vercel',         alts: ['aws'] },
      payment:  { primary: 'toss-payments',  alts: ['portone', 'kakaopay'] },
      analytics:{ primary: 'ga4',            alts: ['posthog'] },
    },
    inputs: { projectType: 'webapp', scale: 'medium', timeline: '6m', seo: 'high', koreaIntegration: true },
    tips: [
      '토스페이먼츠가 한국 표준 (수수료 2.7%)',
      '재고·주문은 Postgres 트랜잭션 필수',
      'Cart 상태는 Redis로 빠르게',
    ],
  },
  {
    id: 'admin-dashboard', emoji: '💼', label: '사내 어드민·대시보드',
    desc: 'SEO 무관. 데이터 입력·차트·테이블',
    picks: {
      frontend:  { primary: 'vite',           alts: ['next'] },
      backend:   { primary: 'next-api',       alts: ['nestjs', 'fastapi'] },
      db:        { primary: 'postgres-self',  alts: ['supabase-pg'] },
      auth:      { primary: 'auth-js',        alts: ['clerk'] },
      hosting:   { primary: 'aws',            alts: ['railway', 'vercel'] },
      analytics: { primary: 'posthog',        alts: ['plausible'] },
    },
    inputs: { projectType: 'spa', scale: 'medium', timeline: '3m', seo: 'none' },
    tips: [
      'Vite + React + ShadCN UI = 빠른 개발',
      'TanStack Query로 API 캐싱',
      'Refine 프레임워크로 CRUD 자동 생성도 가능',
    ],
  },
  {
    id: 'realtime-collab', emoji: '⚡', label: '실시간 협업',
    desc: 'WebSocket·CRDT. Figma·Notion 풍',
    picks: {
      frontend:  { primary: 'next',          alts: ['sveltekit'] },
      backend:   { primary: 'next-api',      alts: ['hono'] },
      db:        { primary: 'supabase-pg',   alts: ['postgres-self'] },
      auth:      { primary: 'supabase-auth', alts: ['clerk'] },
      hosting:   { primary: 'flyio',         alts: ['railway', 'vercel'] },
      analytics: { primary: 'posthog',       alts: ['vercel-analytics'] },
    },
    inputs: { projectType: 'webapp', scale: 'medium', timeline: '6m', traffic: '10k' },
    tips: [
      'Supabase Realtime · Liveblocks · PartyKit 비교 검토',
      'Yjs CRDT로 charset conflict 해결',
      'WebSocket 호환 호스팅 필수 (Vercel은 제한적)',
    ],
  },
  {
    id: 'desktop-app', emoji: '🖥️', label: '데스크톱 앱',
    desc: '윈도우·맥·리눅스. Tauri 권장',
    picks: {
      mobile:   { primary: 'tauri',          alts: [] },
      frontend: { primary: 'vite',           alts: ['next'] },
      backend:  { primary: 'next-api',       alts: ['hono'] },
      db:       { primary: 'sqlite',         alts: ['supabase-pg'] },
      analytics:{ primary: 'plausible',      alts: [] },
    },
    inputs: { projectType: 'desktop', scale: 'sidekick', timeline: '3m' },
    tips: [
      'Tauri 2가 Electron보다 가벼움 (3MB vs 100MB+)',
      '로컬 데이터는 SQLite, 동기화는 Supabase',
      '자동 업데이트 GitHub Releases + Tauri Updater',
    ],
  },
  {
    id: 'api-only', emoji: '🔌', label: 'API 전용 백엔드',
    desc: 'Frontend 분리. REST/GraphQL/RPC',
    picks: {
      backend:   { primary: 'hono',          alts: ['fastapi', 'next-api'] },
      db:        { primary: 'neon',          alts: ['supabase-pg'] },
      auth:      { primary: 'auth-js',       alts: ['supabase-auth'] },
      hosting:   { primary: 'cloudflare',    alts: ['railway', 'flyio'] },
      analytics: { primary: 'posthog',       alts: [] },
    },
    inputs: { projectType: 'api', scale: 'mvp', timeline: '1m' },
    tips: [
      'Hono + Cloudflare Workers = 거의 무료 + 빠름',
      'OpenAPI 자동 문서 (Hono Zod OpenAPI)',
      'Rate Limiting은 Redis (Upstash) 사용',
    ],
  },
  {
    id: 'korea-saas', emoji: '🇰🇷', label: '한국형 SaaS',
    desc: '카카오·네이버 OAuth + 토스페이먼츠 + 본인인증',
    picks: {
      frontend:  { primary: 'next',          alts: ['nuxt'] },
      backend:   { primary: 'next-api',      alts: ['nestjs'] },
      db:        { primary: 'supabase-pg',   alts: ['postgres-self'] },
      auth:      { primary: 'auth-js',       alts: ['kakao-direct'] },
      hosting:   { primary: 'vercel',        alts: ['aws'] },
      payment:   { primary: 'toss-payments', alts: ['portone'] },
      analytics: { primary: 'ga4',           alts: ['posthog'] },
    },
    inputs: { projectType: 'webapp', scale: 'mvp', timeline: '3m', seo: 'high', koreaIntegration: true },
    tips: [
      'Auth.js + 카카오/네이버 공식 provider 사용',
      '본인인증은 NICE/PASS — 사업자등록 + 심사 필요',
      '카카오 알림톡은 Aligo·NHN Toast SDK',
    ],
  },
  {
    id: 'data-viz', emoji: '📊', label: '데이터 분석·시각화',
    desc: 'Notebook·차트·대시보드',
    picks: {
      frontend:  { primary: 'next',          alts: ['vite'] },
      backend:   { primary: 'fastapi',       alts: ['django'] },
      db:        { primary: 'postgres-self', alts: ['supabase-pg'] },
      hosting:   { primary: 'aws',           alts: ['railway', 'flyio'] },
      analytics: { primary: 'posthog',       alts: [] },
    },
    inputs: { projectType: 'webapp', scale: 'medium', timeline: '3m' },
    tips: [
      'FastAPI + Pandas/Polars로 데이터 가공',
      '차트는 Recharts·ECharts·Plotly',
      'Streamlit/Dash는 PoC, 프로덕션은 Next.js + FastAPI 분리',
    ],
  },
]

/* ─── 사용자 입력 ─── */
export type ProjectType = 'webapp' | 'spa' | 'static' | 'mobile' | 'api' | 'desktop'
export type Scale = 'toy' | 'sidekick' | 'mvp' | 'medium' | 'large'
export type Team = 'solo' | 'small' | 'medium' | 'large'
export type Timeline = '1w' | '1m' | '3m' | '6m'
export type Budget = 'free' | 'low' | 'medium' | 'unlimited'
export type Traffic = '100' | '10k' | '100k' | '1m'
export type Experience = 'beginner' | 'intermediate' | 'senior'
export type Language = 'ts' | 'python' | 'java' | 'go' | 'rust' | 'other'
export type Seo = 'high' | 'medium' | 'none'

export interface UserInputs {
  projectType: ProjectType
  scale: Scale
  team: Team
  timeline: Timeline
  budget: Budget
  traffic: Traffic
  experience: Experience
  language: Language
  seo: Seo
  koreaIntegration: boolean
}

export const DEFAULT_INPUTS: UserInputs = {
  projectType: 'webapp',
  scale: 'mvp',
  team: 'solo',
  timeline: '3m',
  budget: 'low',
  traffic: '10k',
  experience: 'intermediate',
  language: 'ts',
  seo: 'high',
  koreaIntegration: false,
}

/* ─── 추천 알고리즘 ─── */
export type Weights = StackScores

/** 입력에 따라 7축 가중치 결정 */
export function computeWeights(inputs: UserInputs): Weights {
  const w: Weights = { speed: 1, scale: 1, cost: 1, learning: 1, ecosystem: 1, performance: 1, koreaJobs: 1 }

  // 타임라인 짧으면 speed 가중
  if (inputs.timeline === '1w')      w.speed += 2
  else if (inputs.timeline === '1m') w.speed += 1
  else if (inputs.timeline === '6m') w.speed -= 0.3

  // 트래픽
  if (inputs.traffic === '1m')         { w.scale += 2; w.performance += 1 }
  else if (inputs.traffic === '100k')  { w.scale += 1; w.performance += 0.5 }
  else if (inputs.traffic === '100')   { w.scale -= 0.3; w.cost += 1 }

  // 예산
  if (inputs.budget === 'free')          w.cost += 3
  else if (inputs.budget === 'low')      w.cost += 1.5
  else if (inputs.budget === 'unlimited') w.cost -= 0.5

  // 경험
  if (inputs.experience === 'beginner') {
    w.learning += 2
    w.ecosystem += 0.5
  } else if (inputs.experience === 'senior') {
    w.learning -= 0.5
    w.performance += 0.5
  }

  // 규모
  if (inputs.scale === 'large')        { w.scale += 1.5; w.ecosystem += 0.5 }
  else if (inputs.scale === 'toy')     { w.cost += 1; w.learning += 0.5 }

  // SEO
  if (inputs.seo === 'high')           w.performance += 0.5

  // 한국
  if (inputs.koreaIntegration)         w.koreaJobs += 2

  return w
}

/** 스택의 가중 점수 */
export function scoreStack(stack: Stack, weights: Weights): number {
  return (
    stack.scores.speed       * weights.speed +
    stack.scores.scale       * weights.scale +
    stack.scores.cost        * weights.cost +
    stack.scores.learning    * weights.learning +
    stack.scores.ecosystem   * weights.ecosystem +
    stack.scores.performance * weights.performance +
    stack.scores.koreaJobs   * weights.koreaJobs
  )
}

export interface Recommendation {
  category: Category
  primary: Stack
  alternatives: Stack[]
  primaryScore: number
}

/** 카테고리별 추천 (점수 정렬, top 1 + 대안 2) */
export function recommendCategory(category: Category, weights: Weights, inputs: UserInputs): Recommendation | null {
  let candidates = stacksByCategory(category)

  // 프로젝트 유형 필터
  if (inputs.projectType === 'static') {
    if (category === 'frontend') {
      candidates = candidates.filter((c) => ['astro', 'next', 'sveltekit'].includes(c.id))
    }
    if (category === 'backend' || category === 'auth') return null  // 정적 사이트 불필요
  }
  if (inputs.projectType === 'mobile') {
    if (category === 'frontend') return null  // mobile 카테고리 별도
  }
  if (inputs.projectType === 'api') {
    if (category === 'frontend') return null
  }

  // 한국 통합 필요 시 worstFor 필터
  if (inputs.koreaIntegration && category === 'payment') {
    candidates = candidates.filter((c) => c.id !== 'stripe')
  }

  if (candidates.length === 0) return null

  const scored = candidates.map((c) => ({ stack: c, score: scoreStack(c, weights) }))
  scored.sort((a, b) => b.score - a.score)

  return {
    category,
    primary: scored[0].stack,
    alternatives: scored.slice(1, 3).map((x) => x.stack),
    primaryScore: scored[0].score,
  }
}

/** 전체 풀스택 추천 */
export function recommendAll(inputs: UserInputs): Recommendation[] {
  const weights = computeWeights(inputs)
  const cats: Category[] = (() => {
    if (inputs.projectType === 'static') return ['frontend', 'hosting', 'analytics']
    if (inputs.projectType === 'mobile') return ['mobile', 'backend', 'db', 'auth', 'hosting', 'analytics']
    if (inputs.projectType === 'api')    return ['backend', 'db', 'auth', 'hosting', 'analytics']
    if (inputs.projectType === 'desktop') return ['mobile', 'frontend', 'db']  // mobile = Tauri
    return ['frontend', 'backend', 'db', 'auth', 'hosting', 'analytics']
  })()
  if (inputs.koreaIntegration) cats.push('payment')

  return cats
    .map((c) => recommendCategory(c, weights, inputs))
    .filter((r): r is Recommendation => r !== null)
}

/* ─── 비용 추정 ─── */
export interface CostEstimate {
  monthlyLow: number
  monthlyHigh: number
  monthlyTypical: number
  yearlyTypical: number
}

export function estimateCost(recs: Recommendation[]): CostEstimate {
  const lows  = recs.reduce((s, r) => s + r.primary.monthlyCostUsd[0], 0)
  const highs = recs.reduce((s, r) => s + r.primary.monthlyCostUsd[1], 0)
  const typ   = (lows + highs) / 2
  return {
    monthlyLow: lows,
    monthlyHigh: highs,
    monthlyTypical: Math.round(typ),
    yearlyTypical: Math.round(typ * 12),
  }
}

/* ─── 개발 기간 추정 ─── */
export function estimateDuration(recs: Recommendation[], inputs: UserInputs): { weeksLow: number; weeksHigh: number } {
  const expIdx = inputs.experience === 'beginner' ? 0 : 1  // index in learningWeeks
  const learningSum = recs.reduce((s, r) => s + r.primary.learningWeeks[expIdx], 0)

  // 프로젝트 자체 코딩 추정 (학습 + 코딩)
  const codingMul =
    inputs.scale === 'toy'      ? 0.5 :
    inputs.scale === 'sidekick' ? 1.0 :
    inputs.scale === 'mvp'      ? 2.5 :
    inputs.scale === 'medium'   ? 8 :
    20  // large

  const totalWeeks = learningSum + codingMul
  return {
    weeksLow: Math.max(1, Math.round(totalWeeks * 0.7)),
    weeksHigh: Math.max(2, Math.round(totalWeeks * 1.3)),
  }
}

/* ─── 트레이드오프 (추천 vs 대안 비교용) ─── */
export interface TradeoffRow {
  axis: keyof StackScores
  label: string
  values: number[]  // [primary, ...alts]
}

export function buildTradeoff(rec: Recommendation): TradeoffRow[] {
  const axes: { axis: keyof StackScores; label: string }[] = [
    { axis: 'speed',       label: '개발 속도' },
    { axis: 'scale',       label: '확장성' },
    { axis: 'cost',        label: '비용 효율' },
    { axis: 'learning',    label: '학습 곡선' },
    { axis: 'ecosystem',   label: '생태계' },
    { axis: 'performance', label: '성능' },
    { axis: 'koreaJobs',   label: '한국 채용' },
  ]
  const stacks = [rec.primary, ...rec.alternatives]
  return axes.map((a) => ({
    axis: a.axis,
    label: a.label,
    values: stacks.map((s) => s.scores[a.axis]),
  }))
}

export function categoryLabel(c: Category): string {
  return ({
    frontend:  'Frontend',
    backend:   'Backend',
    db:        'Database',
    auth:      'Auth',
    hosting:   'Hosting',
    payment:   'Payment',
    analytics: 'Analytics',
    mobile:    'Mobile',
  } as const)[c]
}

export function categoryEmoji(c: Category): string {
  return ({
    frontend:  '🎨',
    backend:   '⚙️',
    db:        '🗄️',
    auth:      '🔐',
    hosting:   '☁️',
    payment:   '💳',
    analytics: '📊',
    mobile:    '📱',
  } as const)[c]
}
