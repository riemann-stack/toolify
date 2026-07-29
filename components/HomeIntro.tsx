/* 홈 하단 콘텐츠 — 서버 컴포넌트.
   '자기소개 문단' 대신 실질 정보(운영 방법론·2026 법정 기준값·사이트 FAQ)를 제공한다.
   법정 수치는 도구들과 같은 lib 단일 소스에서 직접 렌더 — 개정 시 도구와 함께 갱신되므로
   본문과 계산기가 어긋날 수 없다. (AdSense E-E-A-T·SEO용 실제 본문) */

import Link from 'next/link'
import { totalTools, categories } from '@/lib/tools'
import { MIN_HOURLY_WAGE, INSURANCE_RATES } from '@/lib/krInsuranceRates'
import { BRACKETS_2026 } from '@/lib/krIncomeTax'
import FaqJsonLd from './FaqJsonLd'
import CatIcon from './CatIcon'
import styles from '@/app/page.module.css'

const YEAR = 2026
const wage = MIN_HOURLY_WAGE[YEAR]
const monthlyWage = wage * 209 // 주 40시간·주휴 포함 월 소정근로 209시간
const rates = INSURANCE_RATES[YEAR]
const minTaxRate = Math.round(BRACKETS_2026[0].rate * 100)
const maxTaxRate = Math.round(BRACKETS_2026[BRACKETS_2026.length - 1].rate * 100)

const won = (n: number) => n.toLocaleString('ko-KR')

/* 사이트 공통 FAQ — 화면 <details> + FAQPage JSON-LD 동시 렌더 */
const SITE_FAQ = [
  {
    q: '연봉 실수령액은 어떻게 계산되나요?',
    a: `세전 연봉에서 4대보험 근로자 부담분(국민연금 ${rates.pension.employee}%, 건강보험 ${rates.health.employee}%, 장기요양·고용보험)과 근로소득 간이세액표 기준 소득세·지방소득세를 뺀 값이 실수령액입니다. 부양가족 수와 비과세액에 따라 달라지며, 연봉 실수령액 계산기에서 ${YEAR}년 요율로 바로 확인할 수 있습니다.`,
  },
  {
    q: '계산 결과를 그대로 믿어도 되나요?',
    a: '모든 결과는 공개된 공식·요율에 따른 참고용 추정값입니다. 실제 금액은 회사의 급여 규정, 감면·특례, 개인 상황에 따라 달라질 수 있어 결과가 추정인 도구에는 그 한계를 함께 표기합니다. 세금·대출·건강처럼 중요한 결정은 실행 전에 해당 기관이나 전문가 확인을 권장합니다.',
  },
  {
    q: '입력한 값은 어디에 저장되나요?',
    a: '모든 계산은 사용자의 브라우저 안에서만 실행되며, 입력값이 서버로 전송되거나 저장되지 않습니다. 일부 도구의 "저장" 기능도 사용자의 브라우저(localStorage)에만 기록되고, 다른 기기나 저희 쪽에서는 볼 수 없습니다.',
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

/* 2026 법정 기준값 표 — 값은 전부 lib에서 계산 */
const RATE_ROWS: { item: string; value: string; note: string; href: string; tool: string }[] = [
  {
    item: '최저시급',
    value: `${won(wage)}원`,
    note: `월 ${won(monthlyWage)}원 (주 40시간·209시간 기준)`,
    href: '/tools/finance/salary',
    tool: '연봉 실수령액',
  },
  {
    item: '소득세율',
    value: `${minTaxRate}% ~ ${maxTaxRate}%`,
    note: `과세표준 ${BRACKETS_2026.length}구간 누진 · 지방소득세 별도 10%`,
    href: '/tools/finance/year-end-tax',
    tool: '연말정산',
  },
  {
    item: '국민연금',
    value: `${rates.pension.total}%`,
    note: `근로자 ${rates.pension.employee}% + 사업주 ${rates.pension.employer}%`,
    href: '/tools/finance/4-insurance',
    tool: '4대보험',
  },
  {
    item: '건강보험',
    value: `${rates.health.total}%`,
    note: `근로자 ${rates.health.employee}% + 사업주 ${rates.health.employer}%`,
    href: '/tools/finance/4-insurance',
    tool: '4대보험',
  },
  {
    item: '장기요양보험',
    value: `${rates.ltc.rateOfSalary}%`,
    note: '보수월액 대비 (건강보험료에 합산 고지)',
    href: '/tools/finance/4-insurance',
    tool: '4대보험',
  },
  {
    item: '고용보험 (실업급여)',
    value: `${rates.unemp.employee}%`,
    note: `근로자 부담 · 사업주는 규모별 추가 요율`,
    href: '/tools/finance/4-insurance',
    tool: '4대보험',
  },
]

const METHOD_CARDS = [
  {
    step: 'Step 1 · 출처',
    title: '공식 1차 자료만 씁니다',
    body: '세율·요율·규격은 국세청·고용노동부·식품의약품안전처 같은 공식 기관의 고시·보도자료를 직접 확인해 반영합니다. 블로그 재인용이나 출처 불명 수치는 쓰지 않습니다.',
  },
  {
    step: 'Step 2 · 검산',
    title: '검산을 거쳐 게시합니다',
    body: '계산 로직은 별도 검산 스크립트로 경계값까지 대조한 뒤 게시합니다. 법정 수치는 여러 도구가 하나의 데이터 소스를 공유해, 개정 시 한 곳만 고치면 관련 도구가 함께 갱신됩니다.',
  },
  {
    step: 'Step 3 · 표기',
    title: '기준일과 한계를 밝힙니다',
    body: '시간에 민감한 수치에는 기준일과 출처를 페이지에 함께 적고, 결과가 추정인 경우 무엇이 반영되지 않았는지(감면·특례·개인차)를 숨기지 않고 표기합니다.',
  },
]

export default function HomeIntro() {
  const featured = ['finance', 'health', 'cooking', 'life']
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  return (
    <section aria-label="Youtil 소개" className={styles.introSection}>
      <FaqJsonLd items={SITE_FAQ} />

      {/* 1. 계산을 만드는 방법 — 실제 운영 방식 */}
      <div className={styles.introBlock}>
        <h2 className={styles.introH2}>Youtil이 계산을 만드는 방법</h2>
        <p className={styles.introLead}>
          Youtil(유틸)은 연봉·세금·건강·요리·단위변환까지 {totalTools}개 계산기를 11개 카테고리로 제공하는
          무료 도구 사이트입니다. 결과 하나하나가 근거를 갖도록 세 가지 원칙으로 만듭니다.
        </p>
        <div className={styles.introCards}>
          {METHOD_CARDS.map((c) => (
            <div key={c.step} className={styles.introCard}>
              <span className={styles.introCardStep}>{c.step}</span>
              <span className={styles.introCardTitle}>{c.title}</span>
              <p className={styles.introCardBody}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 2026 법정 기준값 — lib 단일 소스 렌더 */}
      <div className={styles.introBlock}>
        <h2 className={styles.introH2}>{YEAR}년 주요 법정 기준값</h2>
        <p className={styles.introLead}>
          급여·세금 계산의 뼈대가 되는 올해 기준값입니다. 아래 수치는 각 계산기가 쓰는 것과{' '}
          <strong>같은 데이터에서 그대로 표시</strong>되므로, 개정되면 도구와 함께 갱신됩니다.
        </p>
        <div className={styles.introTableWrap}>
          <table className={styles.introTable}>
            <thead>
              <tr>
                <th scope="col">항목</th>
                <th scope="col">{YEAR}년 기준</th>
                <th scope="col">비고</th>
                <th scope="col">계산해 보기</th>
              </tr>
            </thead>
            <tbody>
              {RATE_ROWS.map((r) => (
                <tr key={r.item + r.note}>
                  <td className={styles.introTableItem}>{r.item}</td>
                  <td className={styles.introTableValue}>{r.value}</td>
                  <td className={styles.introTableNote}>{r.note}</td>
                  <td>
                    <Link href={r.href} className={styles.introTableLink}>{r.tool} →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.introCaption}>
          출처: 고용노동부 최저임금 고시, 국세청 소득세 기본세율, 국민연금공단·국민건강보험공단·근로복지공단 {YEAR}년 요율.
          산재보험은 업종별 요율이 달라 표에서 제외했습니다.
        </p>
      </div>

      {/* 3. 자주 묻는 질문 — FAQPage JSON-LD 동반 */}
      <div className={styles.introBlock}>
        <h2 className={styles.introH2}>자주 묻는 질문</h2>
        <div>
          {SITE_FAQ.map((f) => (
            <details key={f.q} className={styles.introFaqItem}>
              <summary className={styles.introFaqQ}>{f.q}</summary>
              <p className={styles.introFaqA}>
                {f.a}
                {f.q.includes('실수령액') && (
                  <> <Link href="/tools/finance/salary" style={{ color: 'var(--paper-ink)', fontWeight: 600 }}>연봉 실수령액 계산기 →</Link></>
                )}
                {f.q.includes('잘못된 수치') && (
                  <> <Link href="/contact" style={{ color: 'var(--paper-ink)', fontWeight: 600 }}>문의하기 →</Link></>
                )}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* 4. 둘러보기 — 카테고리 칩 */}
      <div className={styles.introBlock}>
        <h2 className={styles.introH2}>이런 도구가 있어요</h2>
        <p className={styles.introLead}>
          가장 많이 찾는 카테고리부터 둘러보세요. 운영 방침은 <Link href="/about" style={{ color: 'var(--paper-ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>소개</Link>,
          제안·오류 제보는 <Link href="/contact" style={{ color: 'var(--paper-ink)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>문의</Link>에서 받습니다.
        </p>
        <div className={styles.introChips}>
          {featured.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools/${cat.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '999px',
                border: '1px solid var(--paper-line)',
                background: 'var(--paper-card)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--paper-ink)',
                textDecoration: 'none',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', color: cat.color }} aria-hidden="true">
                <CatIcon id={cat.id} size={14} />
              </span>
              {cat.name}
            </Link>
          ))}
          <Link
            href="/tools"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1px solid var(--paper-ink)',
              background: 'var(--paper-ink)',
              fontSize: '13px',
              fontWeight: 700,
              color: '#ffffff',
              textDecoration: 'none',
            }}
          >
            전체 {totalTools}가지 도구 →
          </Link>
        </div>
      </div>
    </section>
  )
}
