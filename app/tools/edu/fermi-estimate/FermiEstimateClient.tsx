'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './fermi-estimate.module.css'

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────
type Variable = {
  id: string
  name: string
  value: number
  unit: string
  sliderMin?: number
  sliderMax?: number
  source?: string
}

type CategoryKey = 'daily' | 'environment' | 'business' | 'education'

type Template = {
  id: string
  category: CategoryKey
  title: string
  icon: string
  description: string
  variables: Omit<Variable, 'id'>[]
  formula: string
  expectedRange: string
  resultUnit: string
  teaching?: string
}

const CATEGORIES: { key: CategoryKey; label: string; emoji: string; cls: string; tplCls: string }[] = [
  { key: 'daily',       label: '🌟 생활·소비', emoji: '🌟', cls: s.catDaily,       tplCls: s.tplDaily },
  { key: 'environment', label: '🌍 환경',     emoji: '🌍', cls: s.catEnvironment, tplCls: s.tplEnvironment },
  { key: 'business',    label: '💼 비즈니스', emoji: '💼', cls: s.catBusiness,    tplCls: s.tplBusiness },
  { key: 'education',   label: '🎓 교육·고전', emoji: '🎓', cls: s.catEducation,   tplCls: s.tplEducation },
]

const TEMPLATES: Template[] = [
  // 생활·소비
  { id: 'seoul-coffee', category: 'daily', icon: '☕', title: '서울 하루 아메리카노 판매량', description: '카페·편의점·자판기 통합', resultUnit: '잔/일',
    formula: 'A * (B/100) * C * (D/100)', expectedRange: '약 100만 ~ 300만 잔',
    variables: [
      { name: '서울 인구', value: 9_400_000, unit: '명', source: '서울시 2024', sliderMin: 9_000_000, sliderMax: 10_000_000 },
      { name: '매일 커피 마시는 비율', value: 30, unit: '%', sliderMin: 10, sliderMax: 60 },
      { name: '1인 평균 일일 커피 잔 수', value: 1.2, unit: '잔', sliderMin: 0.5, sliderMax: 3 },
      { name: '아메리카노 비중', value: 60, unit: '%', sliderMin: 30, sliderMax: 80 },
    ],
    teaching: '인구→비율→빈도→비중 4단계 분해 표준 예시',
  },
  { id: 'pizza-shops-korea', category: 'daily', icon: '🍕', title: '한국 전국 피자집 개수', description: '프랜차이즈·동네 피자 모두 포함', resultUnit: '개',
    formula: 'A / B', expectedRange: '약 1만 ~ 2.5만 개',
    variables: [
      { name: '한국 인구', value: 51_000_000, unit: '명' },
      { name: '피자집 1개당 서비스 인구', value: 5_000, unit: '명', sliderMin: 2_000, sliderMax: 10_000 },
    ],
  },
  { id: 'lifetime-rice', category: 'daily', icon: '🍚', title: '한 사람이 평생 먹는 쌀알 개수', description: '평생 식사 횟수 × 1인분 쌀알', resultUnit: '개',
    formula: 'A * 365 * B * (C/100) * D', expectedRange: '약 1.5억 ~ 3억 개',
    variables: [
      { name: '평균 수명', value: 83, unit: '세', source: '한국 평균', sliderMin: 70, sliderMax: 90 },
      { name: '하루 밥 먹는 횟수', value: 2, unit: '회', sliderMin: 1, sliderMax: 3 },
      { name: '쌀밥 비율', value: 70, unit: '%', sliderMin: 40, sliderMax: 90 },
      { name: '1회 쌀알 개수', value: 4_000, unit: '알', source: '1공기 약 4,000~5,000알', sliderMin: 2_000, sliderMax: 6_000 },
    ],
  },
  { id: 'delivery-orders', category: 'daily', icon: '🛵', title: '인구 5만 동네 하루 배달 주문', description: '배달의민족·요기요·쿠팡이츠 통합', resultUnit: '건/일',
    formula: 'A * (B/100) * C / 7', expectedRange: '약 5,000 ~ 10,000 건',
    variables: [
      { name: '동네 인구', value: 50_000, unit: '명' },
      { name: '배달 앱 사용 비율', value: 40, unit: '%', sliderMin: 20, sliderMax: 60 },
      { name: '주당 평균 주문 횟수', value: 2.5, unit: '회', sliderMin: 1, sliderMax: 5 },
    ],
  },

  // 환경
  { id: 'paper-cups', category: 'environment', icon: '🥤', title: '한국 하루 일회용 컵 폐기', description: '카페·편의점·자판기', resultUnit: '개/일',
    formula: 'A * (B/100) * (C/100)', expectedRange: '약 1,000만 ~ 1,500만 개',
    variables: [
      { name: '한국 인구', value: 51_000_000, unit: '명' },
      { name: '일일 카페·편의점 음료 비율', value: 30, unit: '%', sliderMin: 15, sliderMax: 50 },
      { name: '일회용 컵 비율', value: 80, unit: '%', sliderMin: 50, sliderMax: 95 },
    ],
  },
  { id: 'food-waste', category: 'environment', icon: '🗑️', title: '한국 한 달 음식물 쓰레기', description: '환경부 통계 기반', resultUnit: '톤',
    formula: 'A * B * 30 / 1000', expectedRange: '약 30만 ~ 75만 톤',
    variables: [
      { name: '한국 인구', value: 51_000_000, unit: '명' },
      { name: '1인당 일일 음식물 쓰레기 (kg)', value: 0.3, unit: 'kg', source: '환경부 통계', sliderMin: 0.2, sliderMax: 0.5 },
    ],
  },
  { id: 'ev-charging', category: 'environment', icon: '🔌', title: '한국 전기차 하루 충전 전력량', description: '전체 전기차 충전량 추정', resultUnit: 'MWh/일',
    formula: 'A * B * C / 1000', expectedRange: '약 3,000 ~ 8,000 MWh',
    variables: [
      { name: '전기차 등록 대수', value: 600_000, unit: '대', source: '2024 추정', sliderMin: 500_000, sliderMax: 1_000_000 },
      { name: '하루 평균 주행 거리 (km)', value: 35, unit: 'km', sliderMin: 20, sliderMax: 60 },
      { name: '전비 (kWh/km)', value: 0.18, unit: 'kWh/km', sliderMin: 0.15, sliderMax: 0.25 },
    ],
  },

  // 비즈니스
  { id: 'cafe-revenue', category: 'business', icon: '💼', title: '동네 카페 하루 예상 매출', description: '신규 카페 창업 매출 추정', resultUnit: '원/일',
    formula: 'A * (B/100) * C', expectedRange: '약 50만 ~ 200만원',
    variables: [
      { name: '하루 유동인구', value: 3_000, unit: '명', sliderMin: 500, sliderMax: 10_000 },
      { name: '카페 방문 전환율', value: 5, unit: '%', sliderMin: 1, sliderMax: 15 },
      { name: '평균 객단가 (원)', value: 6_500, unit: '원', sliderMin: 3_000, sliderMax: 15_000 },
    ],
  },
  { id: 'app-mau', category: 'business', icon: '📱', title: '신규 앱 6개월 후 MAU 추정', description: '월간 활성 사용자 추정', resultUnit: '명',
    formula: 'A * (B/100) * (C/100) * (D/100)', expectedRange: '약 6만 ~ 50만',
    variables: [
      { name: '타겟 인구', value: 15_000_000, unit: '명', source: '예: 25-40세' },
      { name: '앱 인지도 도달률', value: 5, unit: '%', sliderMin: 1, sliderMax: 20 },
      { name: '다운로드 전환율', value: 20, unit: '%', sliderMin: 10, sliderMax: 50 },
      { name: '월간 활성 비율', value: 40, unit: '%', sliderMin: 20, sliderMax: 70 },
    ],
  },
  { id: 'blog-pv', category: 'business', icon: '✍️', title: '블로그 월 100만원 광고 수익 → 필요 PV', description: 'RPM 기반 역산', resultUnit: 'PV',
    formula: 'A / B * 1000', expectedRange: '약 12만 ~ 200만 PV',
    variables: [
      { name: '목표 월 수익 (원)', value: 1_000_000, unit: '원', sliderMin: 500_000, sliderMax: 10_000_000 },
      { name: 'RPM (1,000PV당 수익, 원)', value: 2_000, unit: '원', source: '한국 블로그 평균', sliderMin: 500, sliderMax: 8_000 },
    ],
  },
  { id: 'tam-saas', category: 'business', icon: '📊', title: 'SaaS 한국 TAM (시장 규모)', description: '신규 B2B SaaS 시장 규모', resultUnit: '원/년',
    formula: 'A * (B/100) * (C/100) * D', expectedRange: '약 100억 ~ 1,000억',
    variables: [
      { name: '대상 기업 수 (한국)', value: 700_000, unit: '개', source: '예: 중소기업', sliderMin: 100_000, sliderMax: 1_000_000 },
      { name: '제품 필요성 비율', value: 30, unit: '%', sliderMin: 5, sliderMax: 60 },
      { name: '실제 구매 의향', value: 10, unit: '%', sliderMin: 2, sliderMax: 30 },
      { name: '연간 평균 결제 (원)', value: 600_000, unit: '원', sliderMin: 100_000, sliderMax: 5_000_000 },
    ],
  },

  // 교육·고전
  { id: 'piano-tuners', category: 'education', icon: '🎹', title: '서울 피아노 조율사 수', description: '엔리코 페르미의 시카고 문제 한국 버전', resultUnit: '명',
    formula: 'A * (B/100) * C / D', expectedRange: '약 100 ~ 500명',
    variables: [
      { name: '서울 가구 수', value: 4_000_000, unit: '가구', sliderMin: 3_500_000, sliderMax: 4_500_000 },
      { name: '피아노 보유 비율', value: 5, unit: '%', sliderMin: 1, sliderMax: 15 },
      { name: '연간 조율 횟수', value: 0.5, unit: '회', source: '평균 2년에 1회', sliderMin: 0.2, sliderMax: 2 },
      { name: '조율사 1명 연간 작업', value: 800, unit: '건', sliderMin: 500, sliderMax: 1_500 },
    ],
    teaching: '페르미 추정의 가장 유명한 문제. 5단계 분해.',
  },
  { id: 'windows-korea', category: 'education', icon: '🪟', title: '한국 창문 총 개수', description: '주거+상업 시설', resultUnit: '개',
    formula: 'A * B * (1 + C/100)', expectedRange: '약 1.5억 ~ 2.5억 개',
    variables: [
      { name: '한국 가구 수', value: 21_000_000, unit: '가구' },
      { name: '가구당 평균 창문 수', value: 6, unit: '개', sliderMin: 3, sliderMax: 10 },
      { name: '상업 시설 추가 비율', value: 50, unit: '%', source: '주거 외 추가', sliderMin: 30, sliderMax: 100 },
    ],
  },
  { id: 'sand-grains', category: 'education', icon: '🏖️', title: '지구 모든 해변의 모래알 개수', description: '천문학적 숫자도 추정 가능', resultUnit: '알',
    formula: 'A * 1e10 * B * C', expectedRange: '약 7.5×10²² 개',
    variables: [
      { name: '지구 해변 면적 (km²)', value: 500_000, unit: 'km²', sliderMin: 100_000, sliderMax: 1_000_000 },
      { name: '해변 평균 모래 깊이 (m)', value: 5, unit: 'm', sliderMin: 1, sliderMax: 20 },
      { name: '1cm³당 모래알 개수', value: 8_000, unit: '개', sliderMin: 5_000, sliderMax: 15_000 },
    ],
  },
  { id: 'cells-human', category: 'education', icon: '🧬', title: '인간 몸의 세포 개수', description: '체중 기반 추정', resultUnit: '개',
    formula: 'A * 1000 * B', expectedRange: '약 30조 ~ 100조 개',
    variables: [
      { name: '평균 체중 (kg)', value: 70, unit: 'kg', sliderMin: 50, sliderMax: 100 },
      { name: '1g당 평균 세포 수', value: 1e9, unit: '개', sliderMin: 1e8, sliderMax: 1e10 },
    ],
  },
]

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
let idCounter = 0
const newId = () => `v-${++idCounter}-${Math.random().toString(36).slice(2, 6)}`

function safeEvaluate(formula: string, vars: Variable[]): number {
  let expr = formula
  // 가장 긴 변수 letter부터 (Z, Y, ...) 치환하면 충돌 방지
  for (let i = vars.length - 1; i >= 0; i--) {
    const letter = String.fromCharCode(65 + i)
    expr = expr.replace(new RegExp(`\\b${letter}\\b`, 'g'), `(${vars[i].value})`)
  }
  // 안전 검증: 숫자, 연산자, 괄호, 공백, 지수표기(e/E)만 허용
  if (!/^[\d\s+\-*/().eE,]+$/.test(expr)) return NaN
  try {
    const result = new Function(`"use strict"; return (${expr})`)()
    return typeof result === 'number' && Number.isFinite(result) ? result : NaN
  } catch {
    return NaN
  }
}

function formatLargeNumber(n: number): { value: string; unit: string } {
  if (!Number.isFinite(n)) return { value: '-', unit: '' }
  const abs = Math.abs(n)
  if (abs >= 1e16) return { value: n.toExponential(2), unit: '' }
  if (abs >= 1e12) return { value: (n / 1e12).toFixed(2), unit: '조' }
  if (abs >= 1e8)  return { value: (n / 1e8).toFixed(2),  unit: '억' }
  if (abs >= 1e4)  return { value: (n / 1e4).toFixed(1),  unit: '만' }
  if (abs >= 1)    return { value: Math.round(n).toLocaleString('ko-KR'), unit: '' }
  return { value: n.toFixed(3), unit: '' }
}

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '-'
  if (Math.abs(n) >= 1e6) return n.toExponential(2)
  return n.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

// ─────────────────────────────────────────────
// 라이브러리 (localStorage)
// ─────────────────────────────────────────────
type LibraryItem = {
  id: string
  title: string
  question: string
  variables: Variable[]
  formula: string
  result: number
  resultUnit: string
  savedAt: string
}
const LIB_KEY = 'youtil-fermi-estimates-v1'

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function FermiEstimateClient() {
  const [tab, setTab] = useState<'templates' | 'free' | 'scenarios' | 'library'>('templates')

  // ─ 템플릿 ─
  const [activeCat, setActiveCat] = useState<CategoryKey>('daily')

  // ─ 자유 추정 (templates·scenarios 탭과 공유) ─
  const [question, setQuestion] = useState<string>('')
  const [vars, setVars] = useState<Variable[]>([])
  const [formula, setFormula] = useState<string>('A * B')
  const [resultUnit, setResultUnit] = useState<string>('')

  // ─ 라이브러리 ─
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [saveTitle, setSaveTitle] = useState<string>('')

  // ─ 복사 ─
  const [copied, setCopied] = useState<boolean>(false)

  // localStorage 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIB_KEY)
      if (raw) setLibrary(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(LIB_KEY, JSON.stringify(library)) } catch {}
  }, [library])

  // 템플릿 로드
  function loadTemplate(t: Template) {
    setQuestion(t.title)
    setVars(t.variables.map(v => ({ ...v, id: newId() })))
    setFormula(t.formula)
    setResultUnit(t.resultUnit)
    setTab('free')
  }

  // 변수 조작
  function addVar() {
    if (vars.length >= 7) return
    setVars(prev => [...prev, { id: newId(), name: `변수 ${prev.length + 1}`, value: 1, unit: '' }])
  }
  function removeVar(id: string) {
    setVars(prev => prev.filter(v => v.id !== id))
  }
  function updateVar(id: string, patch: Partial<Variable>) {
    setVars(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v))
  }

  // ─────────────────────────────────────────────
  // 결과 계산
  // ─────────────────────────────────────────────
  const baseResult = useMemo(() => {
    if (vars.length === 0) return null
    const r = safeEvaluate(formula, vars)
    return Number.isFinite(r) ? r : null
  }, [vars, formula])

  // 시나리오 (낮음/기준/높음)
  const scenarios = useMemo(() => {
    if (vars.length === 0 || baseResult === null) return null
    const lowVars = vars.map(v => ({
      ...v,
      value: v.sliderMin !== undefined ? v.sliderMin : v.value * 0.7,
    }))
    const highVars = vars.map(v => ({
      ...v,
      value: v.sliderMax !== undefined ? v.sliderMax : v.value * 1.3,
    }))
    const low = safeEvaluate(formula, lowVars)
    const high = safeEvaluate(formula, highVars)
    return { low, base: baseResult, high }
  }, [vars, formula, baseResult])

  // 민감도 (각 변수 +20% 시 결과 변화율 절댓값)
  const sensitivity = useMemo(() => {
    if (vars.length === 0 || baseResult === null || baseResult === 0) return []
    return vars.map(v => {
      const modifiedVars = vars.map(x => x.id === v.id ? { ...x, value: x.value * 1.2 } : x)
      const newRes = safeEvaluate(formula, modifiedVars)
      const change = ((newRes - baseResult) / baseResult) * 100
      return { name: v.name, change: Math.abs(change), direction: change >= 0 ? '+' : '-' }
    }).sort((a, b) => b.change - a.change)
  }, [vars, formula, baseResult])

  // 공식 검증
  const formulaValid = useMemo(() => {
    if (vars.length === 0) return true
    const r = safeEvaluate(formula, vars)
    return Number.isFinite(r)
  }, [formula, vars])

  // 라이브러리 저장
  function saveToLibrary() {
    if (vars.length === 0 || baseResult === null) return
    const title = saveTitle.trim() || question.trim() || `추정 ${library.length + 1}`
    const item: LibraryItem = {
      id: newId(),
      title,
      question,
      variables: vars,
      formula,
      result: baseResult,
      resultUnit,
      savedAt: new Date().toISOString(),
    }
    setLibrary(prev => [item, ...prev].slice(0, 30))
    setSaveTitle('')
  }
  function loadFromLibrary(item: LibraryItem) {
    setQuestion(item.question)
    setVars(item.variables.map(v => ({ ...v, id: newId() })))
    setFormula(item.formula)
    setResultUnit(item.resultUnit)
    setTab('free')
  }
  function deleteLibrary(id: string) {
    if (!confirm('이 추정을 삭제하시겠습니까?')) return
    setLibrary(prev => prev.filter(l => l.id !== id))
  }

  // 시나리오 차이
  const scenarioRatio = useMemo(() => {
    if (!scenarios || scenarios.low === 0) return null
    return scenarios.high / scenarios.low
  }, [scenarios])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    if (!scenarios) return
    const fmtFn = (n: number) => {
      const f = formatLargeNumber(n)
      return f.value + (f.unit ? ` ${f.unit}` : '') + (resultUnit ? ` ${resultUnit}` : '')
    }
    const text = [
      `📊 페르미 추정`,
      question ? `질문: ${question}` : '',
      ``,
      `🟦 보수적: ${fmtFn(scenarios.low)}`,
      `🟢 기준: ${fmtFn(scenarios.base)}`,
      `🟡 낙관적: ${fmtFn(scenarios.high)}`,
      ``,
      `※ 입력 가정에 따라 크게 달라지는 추정값입니다.`,
      ``,
      `https://youtil.kr/tools/edu/fermi-estimate`,
    ].filter(Boolean).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // 카테고리별 템플릿 필터
  const filteredTemplates = TEMPLATES.filter(t => t.category === activeCat)

  // ─────────────────────────────────────────────
  // 렌더 헬퍼
  // ─────────────────────────────────────────────
  function renderHero() {
    if (vars.length === 0 || baseResult === null) {
      return (
        <div className={s.card} style={{ textAlign: 'center', padding: 30 }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🧮</p>
          <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.85 }}>
            템플릿을 선택하거나 변수를 추가해 추정을 시작하세요.
          </p>
        </div>
      )
    }
    const f = formatLargeNumber(baseResult)
    // 계산식 문자열
    const calcStr = vars.map(v => `${v.name} ${formatNumber(v.value)}`).join(' × ')
    return (
      <div className={s.hero}>
        <p className={s.heroLead}>{question || '추정 결과'} (기준 시나리오)</p>
        <div>
          <span className={s.heroNum}>약 {f.value}</span>
          <span className={s.heroUnit}>{f.unit}{resultUnit && ` ${resultUnit}`}</span>
        </div>
        <p className={s.heroSub}>
          정확한 값 ≈ <strong style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>{Math.round(baseResult).toLocaleString('ko-KR')}</strong>
        </p>
        <div className={s.heroCalc}>
          {calcStr}<br />
          공식: <code style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4 }}>{formula}</code>
        </div>
      </div>
    )
  }

  function renderVariables() {
    return (
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>변수 ({vars.length}/7)</span>
          <span className={s.cardLabelHint}>A, B, C... 순서로 공식에 사용</span>
        </div>
        <div className={s.varList}>
          {vars.map((v, idx) => {
            const letter = String.fromCharCode(65 + idx)
            const min = v.sliderMin ?? Math.max(0, v.value * 0.3)
            const max = v.sliderMax ?? v.value * 2
            return (
              <div key={v.id} className={s.varRow}>
                <div className={s.varHeader}>
                  <span className={s.varLetter}>{letter}</span>
                  <input
                    className={s.varNameInput}
                    type="text"
                    value={v.name}
                    onChange={e => updateVar(v.id, { name: e.target.value })}
                    placeholder="변수 이름"
                  />
                  <button className={s.varDeleteBtn} onClick={() => removeVar(v.id)} disabled={vars.length <= 1} type="button">×</button>
                </div>
                <div className={s.varValueRow}>
                  <input
                    className={s.varValueInput}
                    type="number"
                    inputMode="decimal"
                    step="any"
                    value={v.value}
                    onChange={e => updateVar(v.id, { value: parseFloat(e.target.value) || 0 })}
                  />
                  <input
                    className={s.varUnitInput}
                    type="text"
                    value={v.unit}
                    onChange={e => updateVar(v.id, { unit: e.target.value })}
                    placeholder="단위"
                  />
                </div>
                {(v.sliderMin !== undefined && v.sliderMax !== undefined) && (
                  <div className={s.varSliderRow}>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={(max - min) / 100}
                      value={v.value}
                      onChange={e => updateVar(v.id, { value: parseFloat(e.target.value) })}
                    />
                    <span className={s.varSliderRange}>{formatNumber(min)} ~ {formatNumber(max)}</span>
                  </div>
                )}
                {v.source && <p className={s.varSource}>📚 {v.source}</p>}
              </div>
            )
          })}
        </div>
        <button className={s.addVarBtn} onClick={addVar} disabled={vars.length >= 7} type="button">
          + 변수 추가 ({vars.length}/7)
        </button>
      </div>
    )
  }

  function renderFormula() {
    return (
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>공식</span>
          <span className={s.cardLabelHint}>A, B, C... 변수 + 연산자(+, −, ×, ÷)</span>
        </div>
        <div className={s.formulaCard}>
          <input
            type="text"
            value={formula}
            onChange={e => setFormula(e.target.value)}
            placeholder="A * B * (C/100)"
          />
          {!formulaValid && vars.length > 0 && (
            <p className={s.formulaError}>⚠️ 공식 평가 오류 — 변수와 연산자를 확인하세요.</p>
          )}
          <p className={s.formulaHint}>
            예: <code>A * B</code> · <code>A * (B/100) * C</code> · <code>A / B</code> · <code>A * 1e10 * B</code> (지수 표기 가능)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        <strong>📐 페르미 추정은 정답을 구하는 도구가 아닙니다.</strong> 문제를 변수로 분해하고 가정을 조절해 <strong>대략의 자릿수</strong>를 추정하는 사고 훈련 도구입니다.
        결과는 입력 가정에 따라 크게 달라지며, <strong>비즈니스 의사결정·투자·정책 결정에는 실제 시장 조사 데이터와 전문가 분석이 반드시 필요</strong>합니다.
      </div>

      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'templates' ? s.tabActive : ''}`} onClick={() => setTab('templates')}>템플릿 시작</button>
        <button className={`${s.tabBtn} ${tab === 'free'      ? s.tabActive : ''}`} onClick={() => setTab('free')}>자유 추정</button>
        <button className={`${s.tabBtn} ${tab === 'scenarios' ? s.tabActive : ''}`} onClick={() => setTab('scenarios')}>시나리오 비교</button>
        <button className={`${s.tabBtn} ${tab === 'library'   ? s.tabActive : ''}`} onClick={() => setTab('library')}>추정 라이브러리</button>
      </div>

      {/* ─── TAB 1: 템플릿 ─── */}
      {tab === 'templates' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>카테고리 선택</span>
              <span className={s.cardLabelHint}>총 15개 템플릿</span>
            </div>
            <div className={s.catRow}>
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  className={`${s.catBtn} ${c.cls} ${activeCat === c.key ? s.catActive : ''}`}
                  onClick={() => setActiveCat(c.key)}
                  type="button"
                >
                  {c.label}<br />
                  <small style={{ fontSize: 10, opacity: 0.7 }}>
                    {TEMPLATES.filter(t => t.category === c.key).length}개
                  </small>
                </button>
              ))}
            </div>
          </div>

          <div className={s.templateGrid}>
            {filteredTemplates.map(t => (
              <button
                key={t.id}
                className={`${s.templateCard} ${
                  t.category === 'daily' ? s.tplDaily :
                  t.category === 'environment' ? s.tplEnvironment :
                  t.category === 'business' ? s.tplBusiness : s.tplEducation
                }`}
                onClick={() => loadTemplate(t)}
                type="button"
              >
                <div className={s.templateHeader}>
                  <span className={s.templateIcon}>{t.icon}</span>
                  <span className={s.templateTitle}>{t.title}</span>
                </div>
                <p className={s.templateDesc}>{t.description}</p>
                <div className={s.templateMeta}>
                  <span className={s.templateRange}>{t.expectedRange}</span>
                  <span className={s.templateSteps}>{t.variables.length}단계 분해</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ─── TAB 2: 자유 추정 ─── */}
      {tab === 'free' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>추정 질문</span>
              <span className={s.cardLabelHint}>무엇을 추정하고 싶은가요?</span>
            </div>
            <input
              className={s.questionInput}
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="예: 한국 전국에 있는 자판기 개수"
              maxLength={80}
            />
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
              <span className={s.subLabel}>결과 단위 (선택)</span>
              <span style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>예: 잔/일, 명, 톤</span>
            </div>
            <input
              className={s.varUnitInput}
              type="text"
              value={resultUnit}
              onChange={e => setResultUnit(e.target.value)}
              placeholder="결과 단위"
              style={{ width: '100%' }}
            />
          </div>

          {renderVariables()}
          {renderFormula()}
          {renderHero()}

          {baseResult !== null && (
            <>
              <div className={s.actionRow}>
                <button className={`${s.actionBtn} ${s.actionBtnPrimary}`} onClick={() => setTab('scenarios')} type="button">
                  📊 시나리오 비교 →
                </button>
                <button className={s.actionBtn} onClick={() => setTab('library')} type="button">
                  💾 라이브러리에 저장 →
                </button>
              </div>

              <div className={s.interpretCard}>
                💡 <strong>해석:</strong> 페르미 추정은 정확한 답이 아닌 <strong>자릿수(order of magnitude)</strong>를 맞히는 도구입니다.
                실제 값의 1/3~3배 범위에 들어가면 좋은 추정으로 평가합니다.
              </div>
            </>
          )}
        </>
      )}

      {/* ─── TAB 3: 시나리오 비교 ─── */}
      {tab === 'scenarios' && (
        <>
          {vars.length === 0 || !scenarios ? (
            <div className={s.card} style={{ textAlign: 'center', padding: 30 }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>📊</p>
              <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.85 }}>
                먼저 <strong style={{ color: '#3EFFD0' }}>템플릿 시작</strong> 또는 <strong style={{ color: '#3EFFD0' }}>자유 추정</strong> 탭에서 추정을 입력해주세요.
              </p>
            </div>
          ) : (
            <>
              <div className={s.scenarioGrid}>
                <div className={`${s.scenarioCard} ${s.scenarioLow}`}>
                  <p className={s.scenarioLabel}>🟦 보수적</p>
                  <p className={s.scenarioName}>가장 낮은 가정</p>
                  <div>
                    <span className={s.scenarioValue}>약 {formatLargeNumber(scenarios.low).value}</span>
                    <span className={s.scenarioUnit}>{formatLargeNumber(scenarios.low).unit}{resultUnit && ` ${resultUnit}`}</span>
                  </div>
                  <p className={s.scenarioDesc}>변수 최소값 적용</p>
                </div>
                <div className={`${s.scenarioCard} ${s.scenarioBase}`}>
                  <p className={s.scenarioLabel}>🟢 기준</p>
                  <p className={s.scenarioName}>평균 가정</p>
                  <div>
                    <span className={s.scenarioValue}>약 {formatLargeNumber(scenarios.base).value}</span>
                    <span className={s.scenarioUnit}>{formatLargeNumber(scenarios.base).unit}{resultUnit && ` ${resultUnit}`}</span>
                  </div>
                  <p className={s.scenarioDesc}>현재 입력값</p>
                </div>
                <div className={`${s.scenarioCard} ${s.scenarioHigh}`}>
                  <p className={s.scenarioLabel}>🟡 낙관적</p>
                  <p className={s.scenarioName}>가장 높은 가정</p>
                  <div>
                    <span className={s.scenarioValue}>약 {formatLargeNumber(scenarios.high).value}</span>
                    <span className={s.scenarioUnit}>{formatLargeNumber(scenarios.high).unit}{resultUnit && ` ${resultUnit}`}</span>
                  </div>
                  <p className={s.scenarioDesc}>변수 최대값 적용</p>
                </div>
              </div>

              {scenarioRatio !== null && (
                <div className={s.diffCard}>
                  📏 <strong>보수적 ↔ 낙관적</strong>: 약 <strong>{scenarioRatio.toFixed(1)}배</strong> 차이 ·
                  {' '}이 차이가 크다는 건 <strong>입력 가정의 불확실성이 크다</strong>는 신호입니다.
                </div>
              )}

              {sensitivity.length > 0 && (
                <div className={s.card}>
                  <div className={s.cardLabel}>
                    <span>민감도 분석</span>
                    <span className={s.cardLabelHint}>각 변수가 결과에 미치는 영향 (변수 +20% 시 결과 변화율)</span>
                  </div>
                  <div className={s.sensitivityList}>
                    {sensitivity.map((s2, i) => {
                      const max = sensitivity[0].change || 1
                      const pct = (s2.change / max) * 100
                      const cls = i === 0 ? s.fillHigh : i <= 1 ? s.fillMid : s.fillLow
                      return (
                        <div key={i} className={s.sensitivityRow}>
                          <span className={s.sensitivityName}>{s2.name}</span>
                          <div className={s.sensitivityTrack}>
                            <div className={`${s.sensitivityFill} ${cls}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={s.sensitivityValue}>{s2.change.toFixed(1)}%</span>
                        </div>
                      )
                    })}
                  </div>
                  <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12, lineHeight: 1.7 }}>
                    💡 가장 민감한 변수에 대해서는 더 정확한 데이터를 찾는 것이 추정 정확도 향상에 효과적입니다.
                  </p>
                </div>
              )}

              {/* 공유 카드 */}
              <div className={s.shareCard}>
                <p className={s.shareTitle}>📊 페르미 추정 결과</p>
                <p className={s.shareSub}>{question || '추정'}</p>
                <p className={s.shareBig}>
                  약 {formatLargeNumber(scenarios.base).value} {formatLargeNumber(scenarios.base).unit}{resultUnit && ` ${resultUnit}`}
                </p>
                <div className={s.shareScenario}>
                  <span>🟦 보수적</span>
                  <strong>약 {formatLargeNumber(scenarios.low).value} {formatLargeNumber(scenarios.low).unit}</strong>
                </div>
                <div className={s.shareScenario}>
                  <span>🟢 기준</span>
                  <strong>약 {formatLargeNumber(scenarios.base).value} {formatLargeNumber(scenarios.base).unit}</strong>
                </div>
                <div className={s.shareScenario}>
                  <span>🟡 낙관적</span>
                  <strong>약 {formatLargeNumber(scenarios.high).value} {formatLargeNumber(scenarios.high).unit}</strong>
                </div>
                <div className={s.shareWatermark}>youtil.kr 🧮</div>
              </div>

              <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
                {copied ? '✓ 복사됨 — SNS에 붙여넣기' : '결과 공유 텍스트 복사'}
              </button>
            </>
          )}
        </>
      )}

      {/* ─── TAB 4: 라이브러리 ─── */}
      {tab === 'library' && (
        <>
          <div className={s.libraryAddBox}>
            <p className={s.libTitle}>💾 현재 추정 저장</p>
            {vars.length === 0 || baseResult === null ? (
              <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
                자유 추정 탭에서 변수를 입력한 후 저장할 수 있습니다.
              </p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                  <input
                    className={s.questionInput}
                    type="text"
                    value={saveTitle}
                    onChange={e => setSaveTitle(e.target.value)}
                    placeholder={question || '추정 제목'}
                    maxLength={50}
                  />
                  <button className={`${s.libItemBtn} ${s.actionBtnPrimary}`} onClick={saveToLibrary} style={{ padding: '8px 16px' }} type="button">
                    + 저장
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                  현재 결과: 약 {formatLargeNumber(baseResult).value} {formatLargeNumber(baseResult).unit}{resultUnit && ` ${resultUnit}`}
                </p>
              </>
            )}
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>저장된 추정 ({library.length}/30)</span>
              <span className={s.cardLabelHint}>로컬 브라우저 저장</span>
            </div>
            {library.length === 0 ? (
              <p className={s.libEmpty}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📚</span>
                저장된 추정이 없습니다. 자유 추정 후 저장해보세요.
              </p>
            ) : (
              <div className={s.libraryList}>
                {library.map(item => {
                  const f = formatLargeNumber(item.result)
                  const date = new Date(item.savedAt).toLocaleDateString('ko-KR')
                  return (
                    <div key={item.id} className={s.libraryItem}>
                      <div className={s.libItemHeader}>
                        <span className={s.libItemTitle}>{item.title}</span>
                        <span className={s.libItemDate}>{date}</span>
                      </div>
                      <p className={s.libItemValue}>약 {f.value} {f.unit}{item.resultUnit && ` ${item.resultUnit}`}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--muted)', fontFamily: 'JetBrains Mono, Menlo, monospace' }}>
                        {item.formula} · 변수 {item.variables.length}개
                      </p>
                      <div className={s.libItemActions}>
                        <button className={s.libItemBtn} onClick={() => loadFromLibrary(item)} type="button">불러오기</button>
                        <button className={`${s.libItemBtn} ${s.libItemBtnDanger}`} onClick={() => deleteLibrary(item.id)} type="button">삭제</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className={s.warnCard}>
            ⚠️ <strong>로컬 저장:</strong> 저장된 추정은 이 브라우저에만 보관됩니다. 캐시 삭제·시크릿 모드 시 사라질 수 있습니다.
          </div>
        </>
      )}
    </div>
  )
}
