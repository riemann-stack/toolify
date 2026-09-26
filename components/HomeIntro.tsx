/* components/HomeIntro.tsx (server) — 홈 본문 섹션 모음 (스펙 §10.20). app/page.tsx가 순서대로 배치한다.
   · HomeStandards  : '2026년, 계산의 기준이 되는 숫자' — 값은 전부 lib 법정 수치 단일 소스에서 계산(홈 하드코딩 금지)
                      + 출처 줄(데이터 최종 갱신일은 git 생성값) + '오늘' 한 줄(LiveWidget)
   · HomePrinciples : 운영 원칙(1인 운영자 리만) + 최근 업데이트(공개일·lastmod·법정 수치 갱신 — 전부 git 기반 생성 JSON)
   · HOME_FAQ       : 사이트 FAQ(화면 + FAQPage JSON-LD는 <Faq>가 동시 렌더)
   정직성: '검산'은 tests/golden 골든 테스트가 실제로 있는 범위만 말한다. 날짜는 지어내지 않는다(없으면 줄째 생략). */
import Link from 'next/link'
import styles from '@/app/page.module.css'
import UiIcon from './UiIcon'
import LiveWidget from './LiveWidget'
import type { TodayInfo } from '@/lib/todayInfo'
import { SITE_OPERATOR } from './SiteJsonLd'
import { allTools, categories } from '@/lib/tools'
import { MIN_HOURLY_WAGE, INSURANCE_RATES } from '@/lib/krInsuranceRates'
import { BRACKETS_2026 } from '@/lib/krIncomeTax'
import { UI_DAILY_CAP_2026, UI_DAILY_FLOOR_2026 } from '@/lib/krUnemployment'
import { pensionStartAge } from '@/lib/krNationalPension'
import { holidaysInYear } from '@/lib/krHolidays'
import { LEGAL_UPDATED, GOLDEN_UPDATED, recentlyAdded } from '@/lib/toolSignals'
import lastmodJson from '@/app/sitemap-lastmod.json'

const YEAR = 2026
const wage = MIN_HOURLY_WAGE[YEAR]
const monthlyWage = wage * 209 // 주 40시간·주휴 포함 월 소정근로 209시간
const rates = INSURANCE_RATES[YEAR]
const minTaxRate = Math.round(BRACKETS_2026[0].rate * 100)
const maxTaxRate = Math.round(BRACKETS_2026[BRACKETS_2026.length - 1].rate * 100)
const holidayCount = holidaysInYear(YEAR).length
const pensionAge = pensionStartAge(1969) // 1969년생부터 65세

const won = (n: number) => n.toLocaleString('ko-KR')
const TOOL_BY_HREF = new Map(allTools.map((t) => [t.href, t]))
/** 'YYYY-MM-DD' → 'YYYY.MM.DD' (문자열만 — Date 파싱 안 함) */
const dot = (iso: string) => iso.slice(0, 10).replace(/-/g, '.')

/* ── 2026 기준 숫자 — 값은 lib에서 계산, href의 도구가 같은 데이터를 쓴다 ── */
const STATS: { label: string; value: string; unit: string; note: string; href: string; tool: string }[] = [
  { label: '최저시급', value: won(wage), unit: '원', note: `월 ${won(monthlyWage)}원 (주 40시간, 월 209시간)`, href: '/tools/finance/salary', tool: '연봉 실수령액' },
  { label: '국민연금 보험료율', value: `${rates.pension.total}`, unit: '%', note: `근로자 ${rates.pension.employee}% + 사업주 ${rates.pension.employer}%`, href: '/tools/finance/4-insurance', tool: '4대보험' },
  { label: '건강보험료율', value: `${rates.health.total}`, unit: '%', note: `근로자 ${rates.health.employee}% · 장기요양 ${rates.ltc.rateOfSalary}% 별도`, href: '/tools/finance/4-insurance', tool: '4대보험' },
  { label: '고용보험료율(근로자)', value: `${rates.unemp.employee}`, unit: '%', note: '실업급여분 · 사업주는 규모별 추가 부담', href: '/tools/finance/4-insurance', tool: '4대보험' },
  { label: '소득세 기본세율', value: `${minTaxRate}~${maxTaxRate}`, unit: '%', note: `과세표준 ${BRACKETS_2026.length}구간 누진 · 지방소득세는 소득세의 10%`, href: '/tools/finance/year-end-tax', tool: '연말정산' },
  { label: '구직급여 1일 상한', value: won(UI_DAILY_CAP_2026), unit: '원', note: `하한 ${won(UI_DAILY_FLOOR_2026)}원 — 최저시급에 연동`, href: '/tools/finance/unemployment-benefit', tool: '실업급여' },
  { label: `${YEAR}년 공휴일`, value: `${holidayCount}`, unit: '일', note: '대체공휴일·선거일 포함, 주말과 겹친 날 포함', href: '/tools/date/holiday-bridge', tool: '징검다리 연휴' },
  { label: '노령연금 개시 나이', value: `${pensionAge}`, unit: '세', note: '1969년생부터 · 출생연도별 60~65세', href: '/tools/finance/national-pension', tool: '국민연금 수령액' },
]

export function HomeStandards({ today }: { today: TodayInfo }) {
  return (
    <section className={styles.hmSec} aria-labelledby="std-h">
      <div className={styles.hmSecH}>
        <div>
          <h2 id="std-h">{YEAR}년, 계산의 기준이 되는 숫자</h2>
          <p>각 계산기가 쓰는 것과 같은 데이터에서 그대로 표시합니다. 개정되면 계산기와 함께 바뀝니다.</p>
        </div>
      </div>
      <div className={styles.hmStd}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.hmStdC}>
            <span className={styles.hmStdL}>{s.label}</span>
            <span className={styles.hmStdV}>{s.value}<small>{s.unit}</small></span>
            <span className={styles.hmStdD}>{s.note}</span>
            <Link className={styles.hmStdA} href={s.href}>{TOOL_BY_HREF.get(s.href)?.name ?? s.tool}<UiIcon name="chev-r" size={14} /></Link>
          </div>
        ))}
      </div>
      <p className={styles.hmSrc}>
        출처: 고용노동부 최저임금·구직급여 상한액 고시, 소득세법 기본세율, 국민연금공단·국민건강보험공단·근로복지공단 {YEAR}년 보험료율,
        공휴일에 관한 법률·관공서의 공휴일에 관한 규정. 산재보험은 업종별 요율이 달라 제외했습니다.
        {LEGAL_UPDATED && <> 법정 수치 데이터 최종 갱신 {dot(LEGAL_UPDATED)}.</>}
      </p>
      <LiveWidget initial={today} />
    </section>
  )
}

/* ── 최근 업데이트 — git 기반 생성값만 (수기 날짜 금지) ── */
type LogRow = { date: string; title: string; text: string; href?: string }

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

/** sitemap-lastmod.json(git 커밋일, 기계적 일괄 커밋 제외) 중 '같은 날 3개 이하'만 = 개별 도구를 손본 날 */
function targetedUpdates(): LogRow[] {
  const raw: unknown = lastmodJson
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return []
  const byDate = new Map<string, string[]>()
  for (const [href, d] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof d !== 'string' || !DAY_RE.test(d) || !TOOL_BY_HREF.has(href)) continue
    byDate.set(d, [...(byDate.get(d) ?? []), href])
  }
  const rows: LogRow[] = []
  for (const [date, hrefs] of byDate) {
    if (hrefs.length > 3) continue
    for (const href of hrefs) rows.push({ date, title: TOOL_BY_HREF.get(href)!.name, text: '페이지 내용 갱신', href })
  }
  return rows
}

export function buildUpdateLog(limit = 5): LogRow[] {
  const rows: LogRow[] = [
    ...recentlyAdded(limit).map(({ tool, date }) => ({ date, title: tool.name, text: '새 계산기 공개', href: tool.href })),
    ...targetedUpdates(),
  ]
  if (LEGAL_UPDATED) {
    rows.push({
      date: LEGAL_UPDATED,
      title: '법정 수치 데이터',
      text: GOLDEN_UPDATED === LEGAL_UPDATED ? '세율·요율 단일 소스와 검산용 골든 테스트 갱신' : '세율·요율 단일 소스 갱신',
    })
  }
  const seen = new Set<string>()
  return rows
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((r) => {
      const k = r.href ?? r.title
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, limit)
}

const PRINCIPLES: { icon: string; title: string; body: string }[] = [
  { icon: 'file', title: '공식 1차 출처를 씁니다', body: '세율·요율·최저시급처럼 법으로 정해지는 숫자는 국세청·고용노동부·국민연금공단 등의 고시와 법령을 근거로 하고, 그 숫자를 쓰는 도구에는 기준과 출처를 적습니다.' },
  { icon: 'shield', title: '숫자는 한 곳에서 관리하고 검산합니다', body: '법정 수치는 하나의 데이터 파일에 두고 계산기와 이 페이지가 함께 읽습니다. 연봉 실수령액·4대보험·소득세·취득세 계산은 기준값 골든 테스트로 검산하고, 코드를 바꿀 때마다 자동으로 다시 돌립니다.' },
  { icon: 'calendar', title: '기준일을 숨기지 않습니다', body: '해마다 바뀌는 수치는 기준 연도를 함께 적고, 개정되면 도구와 설명을 같이 고칩니다. 결과가 추정인 도구는 그 한계도 함께 밝힙니다.' },
]

export function HomePrinciples() {
  const log = buildUpdateLog(5)
  const catOf = (href?: string) => (href ? categories.find((c) => c.tools.some((t) => t.href === href))?.id : undefined)
  return (
    <section className={styles.hmSec} aria-label="운영 원칙과 업데이트 기록">
      <div className={styles.hmEdit}>
        <div className={styles.hmPr}>
          <h2 className={styles.hmPrH}>Youtil이 숫자를 다루는 방식</h2>
          <div className={styles.hmPrList}>
            {PRINCIPLES.map((p) => (
              <div key={p.title} className={styles.hmPrI}>
                <span className="ui-chipIc" aria-hidden="true"><UiIcon name={p.icon} size={20} /></span>
                <span><b>{p.title}</b><span>{p.body}</span></span>
              </div>
            ))}
          </div>
          <div className={styles.hmPrBy}>
            <span className={styles.hmPrAvatar} aria-hidden="true">{SITE_OPERATOR.name.slice(0, 1)}</span>
            <span><b>{SITE_OPERATOR.name}</b> · 기획·개발·검산을 혼자 하는 1인 운영</span>
            <span className={styles.hmPrLinks}>
              <Link href="/editorial-policy">편집·검산 원칙 전문<UiIcon name="chev-r" size={14} /></Link>
              <Link href={SITE_OPERATOR.url}>운영자 소개<UiIcon name="chev-r" size={14} /></Link>
            </span>
          </div>
        </div>
        {log.length > 0 && (
          <div className={styles.hmLog}>
            <div className={styles.hmLogHead}>
              <h2 className={styles.hmLogH}>최근 업데이트</h2>
              <Link className={styles.hmMore} href="/updates">기록 전체<UiIcon name="chev-r" size={16} /></Link>
            </div>
            <ul>
              {log.map((r) => (
                <li key={`${r.date}-${r.href ?? r.title}`}>
                  <time dateTime={r.date}>{dot(r.date)}</time>
                  <div data-cat={catOf(r.href)}>
                    {r.href ? <Link href={r.href}><b>{r.title}</b></Link> : <b>{r.title}</b>}
                    <span>{r.text}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.hmLogNote}>날짜는 저장소 커밋 기록에서 자동으로 뽑습니다.</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* ── 사이트 FAQ — 화면 <details> + FAQPage JSON-LD 동시 렌더(<Faq>) ── */
export const HOME_FAQ = [
  {
    q: '계산 결과를 그대로 믿어도 되나요?',
    a: '모든 결과는 공개된 공식·요율에 따른 참고용 추정값입니다. 실제 금액은 회사의 급여 규정, 감면·특례, 개인 상황에 따라 달라질 수 있어 결과가 추정인 도구에는 그 한계를 함께 적습니다. 세금·대출·건강처럼 중요한 결정은 실행 전에 홈택스·금융기관 등 공식 창구나 전문가에게 확인하세요.',
  },
  {
    q: `${YEAR}년 법정 기준값이 반영되어 있나요?`,
    a: `네. 최저시급 ${won(wage)}원(월 ${won(monthlyWage)}원), 소득세 기본세율 ${minTaxRate}~${maxTaxRate}% ${BRACKETS_2026.length}구간, 국민연금 ${rates.pension.total}%, 건강보험 ${rates.health.total}%(장기요양 ${rates.ltc.rateOfSalary}% 별도), 고용보험 근로자 ${rates.unemp.employee}% 등 ${YEAR}년 고시 기준입니다. 위 기준 숫자와 각 계산기는 같은 데이터를 읽으므로 개정되면 함께 바뀝니다. 산재보험은 업종별 요율이라 개별 도구에서 다룹니다.`,
  },
  {
    q: '연봉 실수령액은 어떻게 계산되나요?',
    a: `세전 연봉에서 4대보험 근로자 부담분(국민연금 ${rates.pension.employee}%, 건강보험 ${rates.health.employee}%, 장기요양·고용보험)과 근로소득 간이세액표 기준 소득세·지방소득세를 뺀 값이 실수령액입니다. 부양가족 수와 비과세액에 따라 달라지며, 연봉 실수령액 계산기에서 ${YEAR}년 요율로 바로 확인할 수 있습니다.`,
  },
  {
    q: '입력한 값은 어디에 저장되나요?',
    a: '계산 입력값(급여·건강 수치 등)은 브라우저 안에서만 처리되고 수집하지 않습니다. 일부 도구의 저장 기능도 사용자의 브라우저(localStorage)에만 기록됩니다. 다만 서버 시간 확인·농산물 시세 조회·OG 미리보기처럼 외부 조회가 필요한 도구는 입력한 공개 정보(웹사이트 주소·조회 품목)를 서버로 보내 결과를 받아오며, 자세한 내용은 개인정보처리방침에 있습니다.',
  },
  {
    q: '이용료나 회원가입이 필요한가요?',
    a: '아니요. 모든 도구를 회원가입·로그인 없이 무료로 쓸 수 있습니다. 운영비는 광고 수익으로 충당할 수 있으며, 광고는 계산 결과에 영향을 주지 않습니다.',
  },
  {
    q: '누가 만들고 운영하나요?',
    a: `필명 ${SITE_OPERATOR.name}을 쓰는 1인 운영자가 기획·개발·검산을 모두 맡고 있습니다. 편집팀이나 외부 필진은 없습니다. 오류 제보와 제안은 문의 페이지나 ${SITE_OPERATOR.email}로 받습니다.`,
  },
  {
    q: '잘못된 수치를 발견하면 어떻게 하나요?',
    a: '문의 페이지로 알려 주시면 공식 출처와 대조해 확인하고, 오류가 맞으면 근거와 함께 고칩니다. 세율·요율처럼 시간에 민감한 수치는 기준 연도를 페이지에 적고 개정되면 갱신합니다.',
  },
]
