/* lib/guides.ts — '계산 해설'(독립 롱폼 글) 레지스트리.
   스펙 §10.20: 게시된 글이 GUIDES_MIN_TO_SHOW편 이상일 때만 홈·헤더에 '계산 해설'을 렌더한다(빈 지면 = 얇은 사이트 신호).
   ─ 글을 추가할 때 실제로 app/guides/<slug>/page.tsx가 있어야 한다(홈·허브·사이트맵이 이 배열에서 링크를 만든다).
   ─ 날짜: published = 그 페이지의 git 첫 커밋일, updated = 내용(수치·설명)이 바뀐 날. 디자인·오타 수정으로 updated를 올리지 않는다.
   ─ 작성자는 필명 '리만'(1인 운영)만 쓴다. 카드 수치(figure)·본문 수치는 계산기와 같은 lib 단일 소스에서 계산한다.
   ─ readMinutes = 본문 글자 수(공백 제외, 표·FAQ 포함) ÷ 500 반올림 — ToolPage 가이드와 같은 기준.
     GuideLayout이 개발 모드에서 실제 본문으로 다시 세어 다르면 경고한다. */
import { INSURANCE_RATES, MIN_HOURLY_WAGE, MONTHLY_WORK_HOURS } from './krInsuranceRates'
import { UI_DAILY_CAP_2026, UI_DAILY_FLOOR_2026 } from './krUnemployment'

export interface GuideArticle {
  /** 경로 조각만(선행 슬래시·'/guides/' 없이) — 예: 'first-paycheck'. 페이지 = app/guides/<slug>/page.tsx, URL = guideHref(slug) */
  slug: string
  /** H1 · 카드 제목 · JSON-LD headline */
  title: string
  /** 카드 요약 + meta description + JSON-LD description (80~160자) */
  summary: string
  /** 분야 점 색 (lib/tools categories id) */
  catId: string
  /** 'YYYY-MM-DD' — git 첫 커밋일 (datePublished) */
  published: string
  /** 'YYYY-MM-DD' — 내용이 마지막으로 바뀐 날 (dateModified · 사이트맵 lastmod) */
  updated: string
  readMinutes: number
  /** 카드 핵심 수치 — 반드시 lib 단일 소스에서 계산한 값 */
  figure?: { value: string; caption: string }
  keywords?: string[]
}

/* 부동소수 합(4.75 + 3.595 + 0.4724 + 0.9 = 9.717400000000001)을 요율 표기 자릿수(소수 4자리)로 정리 */
const pct4 = (n: number) => `${Math.round(n * 1e4) / 1e4}%`
const R26 = INSURANCE_RATES[2026]
/** 2026년 근로자 4대보험 요율 합계(국민연금 + 건강 + 장기요양(보수 대비) + 고용, 산재 제외) */
export const EMPLOYEE_INSURANCE_TOTAL_2026 = R26.pension.employee + R26.health.employee + R26.ltc.employee + R26.unemp.employee

export const GUIDES: readonly GuideArticle[] = [
  {
    slug: 'first-paycheck',
    title: '첫 월급 명세서 읽는 법 — 2026년 4대보험·소득세가 빠지는 순서',
    summary: '연봉이 월급이 되고, 비과세를 뺀 뒤 4대보험과 소득세가 차례로 빠져 실수령액이 되기까지. 연봉 3개 예시를 계산기와 같은 코드로 풀고, 첫 달만의 예외와 연말정산으로 이어지는 흐름을 정리했습니다.',
    catId: 'finance',
    published: '2026-09-26',
    updated: '2026-09-26',
    readMinutes: 12,
    figure: { value: pct4(EMPLOYEE_INSURANCE_TOTAL_2026), caption: '2026년 근로자 4대보험 요율 합계' },
    keywords: ['월급 명세서 보는 법', '첫 월급', '급여명세서', '4대보험 공제', '근로소득 간이세액표', '실수령액', '국민연금 기준소득월액', '연말정산 기납부세액'],
  },
  {
    slug: 'numbers-2026-2027',
    title: '2026→2027 달라지는 생활 숫자 — 최저임금·4대보험·국민연금 기준소득월액',
    summary: `2027년 최저시급 ${MIN_HOURLY_WAGE[2027].toLocaleString('ko-KR')}원이 월급·실수령·구직급여 하한으로 어떻게 이어지는지, 1월에 바뀌는 4대보험 요율과 7월에 바뀌는 국민연금 기준소득월액까지. 확정된 숫자와 아직 발표 전인 숫자를 날짜와 출처로 나눠 정리했습니다.`,
    catId: 'finance',
    published: '2026-09-26',
    updated: '2026-09-26',
    readMinutes: 12,
    figure: { value: `${(MIN_HOURLY_WAGE[2027] * MONTHLY_WORK_HOURS).toLocaleString('ko-KR')}원`, caption: `2027년 최저임금 월 환산액(${MONTHLY_WORK_HOURS}시간)` },
    keywords: ['2027 최저임금', '2027 최저임금 월급', '2027 4대보험 요율', '2027 건강보험료율', '국민연금 보험료율 인상', '국민연금 기준소득월액 상한', '실업급여 하한액 2027', '2027 달라지는 것'],
  },
  {
    slug: 'leaving-job-money',
    title: '퇴사할 때 받는 돈 한 번에 — 퇴직금·연차수당·실업급여·4대보험 정산',
    summary: '퇴직금·미사용 연차수당·실업급여를 받는 요건과 순서, 퇴사 다음 날 바뀌는 건강보험·국민연금, 중도 퇴사자의 연말정산과 다음 해 5월 신고까지. 월 300만 원·근속 3년 2개월 예시를 계산기와 같은 코드로 끝까지 계산했습니다.',
    catId: 'finance',
    published: '2026-09-26',
    updated: '2026-09-26',
    readMinutes: 13,
    figure: { value: `${UI_DAILY_FLOOR_2026.toLocaleString('ko-KR')}~${UI_DAILY_CAP_2026.toLocaleString('ko-KR')}원`, caption: '2026년 이직자 구직급여 1일 하한~상한(8시간 기준)' },
    keywords: ['퇴사할 때 받는 돈', '퇴직금 계산', '퇴직금 통상임금 평균임금', '미사용 연차수당', '실업급여 조건', '구직급여 소정급여일수', '퇴사 후 건강보험 임의계속가입', '중도퇴사 연말정산'],
  },
]

/** 홈 '계산 해설' 섹션 노출 최소 편수 */
export const GUIDES_MIN_TO_SHOW = 3

export const showGuides = (): boolean => GUIDES.length >= GUIDES_MIN_TO_SHOW

/** 허브 경로·이름 — 글 틀(경로·돌아가기)·허브·홈 섹션 '전체 보기'가 함께 쓴다 */
export const GUIDES_HUB = { href: '/guides', label: '계산 해설' } as const

/** 'first-paycheck' → '/guides/first-paycheck' */
export const guideHref = (slug: string): string => `${GUIDES_HUB.href}/${slug}`

export function getGuide(slug: string): GuideArticle | undefined {
  return GUIDES.find(g => g.slug === slug)
}
