/* app/tools/page.tsx (server) — 전체 도구 목록 (Trust Ledger)
   흰 히어로(브레드크럼·H1·리드) → ToolsBrowser(sticky 검색 · 분야 › 하위 분류 목록) → 분야별로 둘러보기 → FAQ
   · 하위 분류는 허브와 같은 단일 소스(lib/categoryGuides resolveGroups), 배지는 lib/toolSignals(GA 인기·공개 60일 NEW)
   · 규모 과시 문구(‘N가지 도구’) 대신 쓰임새로 설명한다(AdSense 감사 P1-4) */
import Link from 'next/link'
import { categories } from '@/lib/tools'
import { resolveGroups } from '@/lib/categoryGuides'
import { badgeMap } from '@/lib/toolSignals'
import { buildMetadata } from '@/lib/seo'
import CatIcon from '@/components/CatIcon'
import UiIcon from '@/components/UiIcon'
import Faq from '@/components/Faq'
import ToolsBrowser, { type BrowserSection } from './ToolsBrowser'
import styles from './tools.module.css'

export const metadata = buildMetadata({
  path: '/tools',
  title: '전체 도구 목록 — 분야별 계산기·변환기 찾기',
  description: '연봉·세금·대출, 건강, 요리, 날짜, 단위 변환, 개발자 도구까지 분야와 하위 분류로 정리한 무료 계산기 목록입니다. 이름이나 하고 싶은 계산으로 검색하세요.',
})

/** 분야 한 줄 소개 — 허브 본문과 겹치지 않게 별도 문구 */
const CATEGORY_TAGLINES: Record<string, string> = {
  finance: '월급·대출·세금·투자를 2026년 세율과 4대보험 요율로 계산합니다.',
  health: 'BMI·기초대사량·임신 주수·수면 부채를 널리 쓰는 공식으로 추정합니다.',
  cooking: '레시피 비율·해동·발효·보관 기한을 계산합니다.',
  life: '더치페이·경조사·여행 예산처럼 일상의 소소한 계산을 돕습니다.',
  sports: '러닝 페이스·근력 1RM·골프 핸디캡 등 운동 기록을 관리합니다.',
  interior: '평수·도배·페인트 양처럼 집을 고칠 때 필요한 계산을 미리 합니다.',
  unit: '면적·사이즈·연비처럼 헷갈리는 단위를 표준 계수로 바꿉니다.',
  date: 'D-day·만 나이·연차·쉥겐 체류일을 계산합니다.',
  art: '노래 키·색상 코드·사진 노출·글자수처럼 창작에 쓰는 도구입니다.',
  edu: '내신·학점 환산, 유효숫자, 복습 간격처럼 공부에 쓰는 도구입니다.',
  dev: '인코딩·정규식·JWT처럼 개발용 변환을 브라우저 안에서 처리합니다.',
}

const FAQS = [
  {
    q: '여기 있는 도구는 무료인가요?',
    a: '네. 모든 도구를 회원가입·로그인 없이 무료로 쓸 수 있습니다. 운영비는 광고 수익으로 충당할 수 있으며, 광고는 계산 결과에 영향을 주지 않습니다.',
  },
  {
    q: '계산 결과는 얼마나 정확한가요?',
    a: '각 도구는 공개된 공식·세율·기준을 근거로 계산하고, 법정 수치를 쓰는 도구에는 기준 연도와 출처를 적습니다. 다만 세금·건강·금융 결과는 개인 상황에 따라 달라지는 추정값이므로, 중요한 결정 전에는 해당 기관이나 전문가에게 확인하세요.',
  },
  {
    q: '입력한 정보가 저장되거나 전송되나요?',
    a: '계산 입력값(연봉·건강 수치 등)은 브라우저 안에서만 처리되고 수집하지 않습니다. 다만 서버 시간 확인·시세 조회·OG 미리보기처럼 외부 조회가 필요한 일부 도구는 입력한 공개 정보(웹사이트 주소·조회 품목)를 서버로 보내 결과를 받아오며, 자세한 내용은 개인정보처리방침에 있습니다.',
  },
  {
    q: '찾는 도구가 없으면 어떻게 하나요?',
    a: '검색창에 하고 싶은 계산을 문장으로 적어 보세요(예: 퇴직금 세금, 아파트 평수). 그래도 없다면 문의 페이지로 알려 주세요. 요청을 모아 새 도구를 만들 때 참고합니다.',
  },
]

export default function ToolsPage() {
  const sections: BrowserSection[] = categories.map((c) => ({
    catId: c.id,
    name: c.name,
    tagline: c.tagline,
    groups: resolveGroups(c.id, c.tools).map((g) => ({ name: g.name, hrefs: g.tools.map((t) => t.href) })),
  }))
  const badges = badgeMap()

  return (
    <div className={styles.tl}>
      <section className={styles.tlBand} aria-labelledby="tl-h1">
        <div className={styles.tlWrap}>
          <nav className={styles.tlCrumb} aria-label="현재 위치">
            <Link href="/">홈</Link>
            <UiIcon name="chev-r" size={14} />
            <span aria-current="page">전체 도구</span>
          </nav>
          <div className={styles.tlHero}>
            <h1 className={styles.tlH1} id="tl-h1">전체 도구</h1>
            <p className={styles.tlLead}>
              연봉·세금·대출부터 BMI·레시피·여행까지, 모든 계산기를 분야와 하위 분류로 정리했습니다. 이름이나 하고 싶은 계산으로
              검색하거나 분야를 골라 둘러보세요. 로그인 없이 브라우저에서 바로 계산합니다.
            </p>
          </div>
        </div>
      </section>

      <ToolsBrowser sections={sections} badges={badges} />

      <div className={styles.tlWrap}>
        <section className={styles.hubs} aria-labelledby="tl-hubs-h">
          <h2 className={styles.secH} id="tl-hubs-h">분야별로 둘러보기</h2>
          <div className={styles.hubGrid}>
            {categories.map((c) => (
              <Link key={c.id} href={`/tools/${c.id}`} className={styles.hubCard} data-cat={c.id}>
                <span className="ui-chipIc" aria-hidden="true"><CatIcon id={c.id} size={20} /></span>
                <span>
                  <b>{c.name}</b>
                  <span>{CATEGORY_TAGLINES[c.id] ?? c.tagline ?? `${c.name} 관련 도구 모음입니다.`}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.faq} aria-label="자주 묻는 질문">
          <Faq items={FAQS} />
        </section>
      </div>
    </div>
  )
}
