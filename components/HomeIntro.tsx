/* 홈 하단 콘텐츠 — 서버 컴포넌트.
   구성: ① 2026 기준 숫자 스탯 타일(카테고리 횡단, lib 단일 소스 렌더)
        ② 사이트 FAQ 6문(FAQPage JSON-LD 동반)
        ③ 다크 마감 밴드(운영 원칙 압축 + 소개·문의·전체 도구 CTA)
   상단 벤토와 같은 1200px 컨테이너·타일 문법을 사용해 페이지가 한 시스템으로 읽히게 한다.
   법정 수치는 도구들과 같은 lib 단일 소스에서 직접 렌더 — 개정 시 도구와 함께 갱신되므로
   본문과 계산기가 어긋날 수 없다. (AdSense E-E-A-T·SEO용 실제 본문) */

import Link from 'next/link'
import { totalTools } from '@/lib/tools'
import { MIN_HOURLY_WAGE, INSURANCE_RATES } from '@/lib/krInsuranceRates'
import { BRACKETS_2026 } from '@/lib/krIncomeTax'
import { UI_DAILY_CAP_2026, UI_DAILY_FLOOR_2026 } from '@/lib/krUnemployment'
import { pensionStartAge } from '@/lib/krNationalPension'
import { holidaysInYear } from '@/lib/krHolidays'
import FaqJsonLd from './FaqJsonLd'
import styles from '@/app/page.module.css'

const YEAR = 2026
const wage = MIN_HOURLY_WAGE[YEAR]
const monthlyWage = wage * 209 // 주 40시간·주휴 포함 월 소정근로 209시간
const rates = INSURANCE_RATES[YEAR]
const minTaxRate = Math.round(BRACKETS_2026[0].rate * 100)
const maxTaxRate = Math.round(BRACKETS_2026[BRACKETS_2026.length - 1].rate * 100)
const holidayCount = holidaysInYear(YEAR).length
const pensionAge = pensionStartAge(1969) // 1969년생부터 65세 — 표기용

const won = (n: number) => n.toLocaleString('ko-KR')

/* 2026 기준 숫자 — 값은 전부 lib에서 계산. href의 도구가 같은 데이터를 사용 */
const STATS: {
  label: string; value: string; unit: string; note: string
  href: string; tool: string; cat: string
}[] = [
  {
    label: '최저시급', value: won(wage), unit: '원',
    note: `월 ${won(monthlyWage)}원 (주 40시간·209시간)`,
    href: '/tools/finance/salary', tool: '연봉 실수령액', cat: 'var(--cat-finance)',
  },
  {
    label: '소득세 기본세율', value: `${minTaxRate}~${maxTaxRate}`, unit: '%',
    note: `과세표준 ${BRACKETS_2026.length}구간 누진 · 지방소득세 별도 10%`,
    href: '/tools/finance/year-end-tax', tool: '연말정산', cat: 'var(--cat-finance)',
  },
  {
    label: '국민연금 요율', value: `${rates.pension.total}`, unit: '%',
    note: `근로자 ${rates.pension.employee}% + 사업주 ${rates.pension.employer}%`,
    href: '/tools/finance/4-insurance', tool: '4대보험', cat: 'var(--cat-finance)',
  },
  {
    label: '건강보험 요율', value: `${rates.health.total}`, unit: '%',
    note: `근로자 ${rates.health.employee}% · 장기요양 ${rates.ltc.rateOfSalary}% 합산 고지`,
    href: '/tools/finance/4-insurance', tool: '4대보험', cat: 'var(--cat-finance)',
  },
  {
    label: '고용보험 요율', value: `${rates.unemp.employee}`, unit: '%',
    note: '근로자 부담 · 사업주는 규모별 추가',
    href: '/tools/finance/4-insurance', tool: '4대보험', cat: 'var(--cat-finance)',
  },
  {
    label: '구직급여 1일 상한', value: won(UI_DAILY_CAP_2026), unit: '원',
    note: `하한 ${won(UI_DAILY_FLOOR_2026)}원 — 최저시급에 연동`,
    href: '/tools/finance/unemployment-benefit', tool: '실업급여', cat: 'var(--cat-finance)',
  },
  {
    label: `${YEAR}년 법정 공휴일`, value: `${holidayCount}`, unit: '일',
    note: '대체공휴일 포함 · 연차 붙이기는 계산기에서',
    href: '/tools/date/holiday-bridge', tool: '징검다리 연휴', cat: 'var(--cat-date)',
  },
  {
    label: '노령연금 개시 나이', value: `${pensionAge}`, unit: '세',
    note: '1969년생부터 · 출생연도별 60~65세',
    href: '/tools/finance/national-pension', tool: '국민연금 수령액', cat: 'var(--cat-finance)',
  },
]

/* 사이트 공통 FAQ — 화면 <details> + FAQPage JSON-LD 동시 렌더 */
const SITE_FAQ = [
  {
    q: '연봉 실수령액은 어떻게 계산되나요?',
    a: `세전 연봉에서 4대보험 근로자 부담분(국민연금 ${rates.pension.employee}%, 건강보험 ${rates.health.employee}%, 장기요양·고용보험)과 근로소득 간이세액표 기준 소득세·지방소득세를 뺀 값이 실수령액입니다. 부양가족 수와 비과세액에 따라 달라지며, 연봉 실수령액 계산기에서 ${YEAR}년 요율로 바로 확인할 수 있습니다.`,
  },
  {
    q: `${YEAR}년 법정 기준값이 반영되어 있나요?`,
    a: `네. 최저시급 ${won(wage)}원(월 ${won(monthlyWage)}원), 소득세 기본세율 ${minTaxRate}~${maxTaxRate}% ${BRACKETS_2026.length}구간, 국민연금 ${rates.pension.total}%, 건강보험 ${rates.health.total}%(장기요양 ${rates.ltc.rateOfSalary}% 합산 고지), 고용보험 근로자 ${rates.unemp.employee}% 등 ${YEAR}년 고시 기준입니다. 위 '기준 숫자'와 각 계산기는 같은 데이터를 공유하므로 개정되면 함께 갱신됩니다. 산재보험은 업종별 요율이라 개별 도구에서 다룹니다.`,
  },
  {
    q: '계산 결과를 그대로 믿어도 되나요?',
    a: '모든 결과는 공개된 공식·요율에 따른 참고용 추정값입니다. 실제 금액은 회사의 급여 규정, 감면·특례, 개인 상황에 따라 달라질 수 있어 결과가 추정인 도구에는 그 한계를 함께 표기합니다. 세금·대출·건강처럼 중요한 결정은 실행 전에 해당 기관이나 전문가 확인을 권장합니다.',
  },
  {
    q: '입력한 값은 어디에 저장되나요?',
    a: '계산 입력값(급여·건강 수치 등)은 사용자의 브라우저 안에서만 처리되고 저희가 수집하지 않습니다. 일부 도구의 "저장" 기능도 사용자의 브라우저(localStorage)에만 기록됩니다. 다만 서버 시간 확인·시세 조회처럼 외부 조회가 필요한 일부 도구는 입력한 공개 정보(웹사이트 주소·조회 품목)를 서버로 보내 결과를 받아오며, 자세한 내용은 개인정보처리방침에 안내되어 있습니다.',
  },
  {
    q: '이용료나 회원가입이 필요한가요?',
    a: `아니요. ${totalTools}개 도구 전부 무료이고 회원가입·로그인 없이 바로 사용할 수 있습니다. 운영 비용은 광고 수익으로 충당될 수 있으며, 광고가 계산 결과에 영향을 주지 않습니다.`,
  },
  {
    q: '잘못된 수치를 발견하면 어떻게 하나요?',
    a: '문의 페이지로 알려 주시면 공식 출처와 대조해 확인하고, 오류가 맞으면 근거와 함께 수정합니다. 세율·요율처럼 시간에 민감한 수치는 기준일을 페이지에 표기하고 개정 시 갱신합니다.',
  },
]

export default function HomeIntro() {
  return (
    <section aria-label="2026년 기준 정보와 자주 묻는 질문" className={styles.introSection}>
      <FaqJsonLd items={SITE_FAQ} />

      {/* 1. 2026 기준 숫자 — 카테고리 틴트 스탯 타일 */}
      <div className={styles.introBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{YEAR}년, 계산의 기준이 되는 숫자</h2>
        </div>
        <p className={styles.introLead}>
          급여·세금·연휴 계산의 뼈대가 되는 올해 기준값입니다. 아래 수치는 각 계산기가 쓰는 것과{' '}
          <strong>같은 데이터에서 그대로 표시</strong>되므로, 개정되면 도구와 함께 갱신됩니다.
        </p>
        <div className={styles.statGrid}>
          {STATS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className={styles.statTile}
              style={{ ['--cat' as string]: s.cat }}
            >
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>
                {s.value}
                <span className={styles.statUnit}>{s.unit}</span>
              </span>
              <span className={styles.statNote}>{s.note}</span>
              <span className={styles.statCta}>{s.tool} →</span>
            </Link>
          ))}
        </div>
        <p className={styles.introCaption}>
          출처: 고용노동부 최저임금·구직급여 상한 고시, 국세청 소득세 기본세율, 국민연금공단·국민건강보험공단·근로복지공단 {YEAR}년 요율,
          관공서의 공휴일에 관한 규정. 산재보험은 업종별 요율이 달라 표에서 제외했습니다.
        </p>
      </div>

      {/* 2. 자주 묻는 질문 — FAQPage JSON-LD 동반 */}
      <div className={styles.introBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>자주 묻는 질문</h2>
        </div>
        <div className={styles.faqGrid}>
          {SITE_FAQ.map((f) => (
            <details key={f.q} className={styles.introFaqItem}>
              <summary className={styles.introFaqQ}>{f.q}</summary>
              <p className={styles.introFaqA}>
                {f.a}
                {f.q.includes('실수령액') && (
                  <> <Link href="/tools/finance/salary" className={styles.introFaqLink}>연봉 실수령액 계산기 →</Link></>
                )}
                {f.q.includes('잘못된 수치') && (
                  <> <Link href="/contact" className={styles.introFaqLink}>문의하기 →</Link></>
                )}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* 3. 마감 밴드 — 운영 원칙 압축 + CTA (벤토 다크 타일과 수미상관) */}
      <div className={styles.closingBand}>
        <div className={styles.closingBody}>
          <span className={styles.closingTitle}>숫자를 다루는 원칙</span>
          <ul className={styles.closingPrinciples}>
            <li><strong>공식 1차 출처</strong> — 국세청·고용노동부 등 고시·보도자료만 반영</li>
            <li><strong>검산 후 게시</strong> — 계산 로직은 경계값까지 별도 스크립트로 대조</li>
            <li><strong>기준일 표기</strong> — 시간 민감 수치는 기준일·출처·한계를 명시</li>
          </ul>
          <span className={styles.closingLinks}>
            <Link href="/about">운영 방침 자세히 →</Link>
            <Link href="/contact">오류 제보·제안 →</Link>
          </span>
        </div>
        <Link href="/tools" className={styles.closingCta}>
          전체 {totalTools}개 도구 →
        </Link>
      </div>
    </section>
  )
}
