/* app/page.tsx (server) — 홈 (스펙 §10.20 · AdSense 감사 P1-4 콘텐츠 우선 · UX-10)
   흰 히어로(법정 수치 갱신일 pill · H1 · 사이트 소개 · 검색 · [인기|최근|즐겨찾기] · 예시 결과 카드) + 신뢰 4요소
   → 분야별로 찾기 → 편집 추천(조회 순위와 분리) → 2026 기준 숫자(lib 단일 소스·출처) → 많이 찾는 계산기(GA 1~10, 놀이형 제외)
   히어로 칩은 편집 추천(라벨 '추천') — GA 원본 순위는 아래 '많이 찾는 계산기' 섹션에만 둔다(AdSense 감사 P1-4 '상위 노출은 편집 추천과 분리')
   → [계산 해설 — lib/guides 게시 글 3편 이상일 때만] → 상황별 가이드 → 운영 원칙 + 최근 업데이트 → FAQ
   규모 과시('11개 분야 200개 도구')는 쓰지 않는다. 심사 전 홈 광고 0(lib/ads) — 광고 슬롯 없음. */
import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'
import HomeSearch, { type HomeChip } from '@/components/HomeSearch'
import HomeJsonLd from '@/components/HomeJsonLd'
import { HomeStandards, HomePrinciples, HOME_FAQ } from '@/components/HomeIntro'
import CollectionBanner from '@/components/CollectionBanner'
import Faq from '@/components/Faq'
import CatIcon from '@/components/CatIcon'
import UiIcon from '@/components/UiIcon'
import { categories, type Tool } from '@/lib/tools'
import { getFeaturedSlug } from '@/lib/collections'
import { INSURANCE_RATES } from '@/lib/krInsuranceRates'
import { holidaysInYear } from '@/lib/krHolidays'
import { POPULAR, POPULAR_IS_MEASURED, LEGAL_UPDATED } from '@/lib/toolSignals'
import { GUIDES, GUIDES_HUB, guideHref, showGuides } from '@/lib/guides'
import { AUTHOR } from '@/lib/toolMeta'
import { kstShifted, kstTodayStr, todayInfo } from '@/lib/todayInfo'
import { calcSalary } from '@/app/tools/finance/salary/salaryUtils'

// ISR — 1시간마다 재생성(시즌 추천·오늘 줄·국민연금 상·하한 구간이 날짜에 따라 바뀐다)
export const revalidate = 3600

const HOME_TITLE = 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음'
const HOME_DESC = '연봉 실수령액·4대보험·대출이자부터 BMI·만 나이·평수 변환까지, 생활에 필요한 계산을 로그인 없이 바로. 세율·요율 같은 법정 수치는 2026년 기준과 공식 출처를 함께 밝힙니다.'

/* 루트 layout은 canonical을 두지 않는다(SEO-06) → 홈이 직접 '/'를 선언.
   openGraph는 페이지 값이 layout 값을 통째로 덮으므로 필요한 필드를 모두 적는다(이미지는 app/opengraph-image.png 파일 규약) */
export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESC,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Youtil',
    url: '/',
    title: HOME_TITLE,
    description: HOME_DESC,
  },
}

const YEAR = 2026
const won = (n: number) => n.toLocaleString('ko-KR')
const dot = (iso: string) => iso.slice(0, 10).replace(/-/g, '.')

const TOOL_CAT = new Map<string, { tool: Tool; catId: string; catName: string }>()
for (const c of categories) for (const t of c.tools) TOOL_CAT.set(t.href, { tool: t, catId: c.id, catName: c.name })
const shortCat = (name: string) => name.split('·')[0]
const chipOf = (href: string): HomeChip | null => {
  const x = TOOL_CAT.get(href)
  return x ? { href, label: x.tool.name.replace(/\s*계산기$/, ''), cat: x.catId } : null
}

/* 놀이형 도구 — 홈 순위에서만 제외(분야 허브 TOP3에는 그대로). 실제로 빠진 도구가 있을 때만 섹션 설명에 제외 사실을 적는다 */
const PLAY_TOOLS = new Set([
  '/tools/life/lotto', '/tools/life/random', '/tools/life/ladder', '/tools/life/zodiac',
  '/tools/life/drake', '/tools/life/monty-hall',
  '/tools/edu/cognitive-test', '/tools/edu/planet-comparison', '/tools/edu/cosmic-calendar',
])

/* 편집 추천 — 운영자가 고른 기본 계산기(조회 순위와 별개). 설명은 도구가 실제로 하는 일만, 수치는 lib에서 */
const rates = INSURANCE_RATES[YEAR]
const EDITOR_PICKS: { href: string; why: string; fact?: string }[] = [
  { href: '/tools/finance/salary', why: '세금과 4대보험을 떼고 매달 통장에 들어오는 금액을 계산합니다. 이직이나 연봉 협상 전에 가장 먼저 확인할 숫자입니다.', fact: `국민연금 ${rates.pension.employee}% · 건강보험 ${rates.health.employee}% 반영` },
  { href: '/tools/finance/loan', why: '원리금균등·원금균등 등 상환 방식별로 매달 내는 돈과 총이자를 비교합니다. 중도상환·갈아타기 손익도 함께 볼 수 있습니다.' },
  { href: '/tools/date/age', why: '2023년 6월부터 법적·행정상 나이는 만 나이로 통일됐습니다. 생일 기준 만 나이와 다음 생일까지 남은 날을 확인합니다.' },
  { href: '/tools/unit/area', why: '분양 광고의 평형과 등기부의 ㎡는 가리키는 면적이 다릅니다. 전용·공급면적과 평을 서로 환산합니다.', fact: '1평 = 400/121㎡ ≈ 3.3058㎡' },
  { href: '/tools/health/bmi', why: '키와 몸무게로 비만도와 정상 체중 범위를 구합니다. 대한비만학회 기준과 WHO 기준을 바꿔 가며 볼 수 있습니다.' },
  { href: '/tools/date/holiday-bridge', why: '남은 연차를 공휴일·대체공휴일 사이에 배치해 가장 길게 쉬는 날짜 조합을 찾습니다.', fact: `${YEAR}년 공휴일 ${holidaysInYear(YEAR).length}일 반영` },
]

/* 히어로 '추천' 칩 — 편집 추천 6개 + D-Day(목업 칩 구성). 운영자가 고른 목록이라 라벨도 '추천' */
const HERO_PICKS = [...EDITOR_PICKS.map((p) => p.href), '/tools/date/dday']

/* 신뢰 4요소 — 전부 사실인 것만(검산 = tests/golden 골든 테스트가 있는 법정 수치 계산).
   입력값: 서버 시간·OG 미리보기·농산물 시세처럼 외부 조회가 필요한 도구는 입력한 공개 정보를 서버로 보낸다 → 절대 표현 금지,
   범위는 HOME_FAQ 4번·개인정보처리방침 11조('서버 미저장')와 같게 */
const TRUST: { icon: string; title: string; desc: string }[] = [
  { icon: 'calc', title: '가입 없이 무료', desc: '로그인·설치 없이 바로 계산' },
  { icon: 'file', title: '기준일·출처 표기', desc: '세율·요율은 공식 고시 기준' },
  { icon: 'shield', title: '법정 수치 검산', desc: '골든 테스트로 기준값 대조' },
  { icon: 'lock', title: '입력값 서버 미저장', desc: '대부분 브라우저 안에서 계산 · 외부 조회 도구만 예외' },
]

/** 주어진 Date의 UTC 필드 기준 연중 일자(1-366) */
function dayOfYear(d: Date): number {
  return Math.floor((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86_400_000)
}

export default function HomePage() {
  // 한국(KST) 기준 '오늘' — 서버는 UTC라 +9h 시프트 후 UTC 필드를 읽는다(자정~09시 어긋남 방지)
  const kst = kstShifted()
  const month = kst.getUTCMonth() + 1
  const featuredSlug = getFeaturedSlug(month, dayOfYear(kst))
  const today = todayInfo(kstTodayStr())

  /* 많이 찾는 계산기 = GA 실측 순위(놀이형 제외). 실측이 없으면 섹션을 숨긴다.
     설명 문구는 매니페스트에 있는 사실만: 집계 기간(days)이 없으면 기간을 쓰지 않고, 제외 문구는 실제로 뺀 도구가 있을 때만 */
  const ranked = POPULAR_IS_MEASURED ? POPULAR.hrefs.filter((h) => !PLAY_TOOLS.has(h) && TOOL_CAT.has(h)).slice(0, 10) : []
  // 실제로 건너뛴 놀이형 도구가 있나 — 10개를 다 채웠으면 마지막 노출 순위 앞쪽만, 못 채웠으면 목록 전체에서 본다
  const lastShown = ranked.length > 0 ? POPULAR.hrefs.indexOf(ranked[ranked.length - 1]) : -1
  const playExcluded = ranked.length > 0 && POPULAR.hrefs.slice(0, ranked.length < 10 ? undefined : lastShown + 1).some((h) => PLAY_TOOLS.has(h))
  const rankNote = [
    POPULAR.days ? `최근 ${POPULAR.days}일 조회 기준` : '조회 순',
    playExcluded && '놀이형 도구 제외',
    POPULAR.generated && `${dot(POPULAR.generated)} 집계`,
  ].filter(Boolean).join(' · ')
  const heroChips = HERO_PICKS.map(chipOf).filter((c): c is HomeChip => !!c).slice(0, 8)

  /* 예시 결과 카드 — 연봉 계산기와 같은 함수(골든 테스트 대상)로 계산. 하드코딩 금지 */
  const ex = calcSalary({ grossYearly: 50_000_000, dependents: 1, childrenCount: 0, nonTaxableMonthly: 0, isInsured: true })
  const pctOf = (n: number) => `${Math.max(0, Math.min(100, (n / ex.grossMonthly) * 100)).toFixed(1)}%`

  return (
    <div className={styles.hm}>
      <HomeJsonLd />

      <section className={styles.hmBand} aria-labelledby="hm-h1">
        <div className={styles.hmWrap}>
          <div className={styles.hmHero}>
            <div className={styles.hmHeroMain}>
              {LEGAL_UPDATED && (
                <span className={styles.hmMast}><i aria-hidden="true" />법정 수치 갱신 {dot(LEGAL_UPDATED)} · {YEAR}년 세율·4대보험 요율</span>
              )}
              <h1 className={styles.hmH1} id="hm-h1">계산은 정확하게,<br /><em>기준은 투명하게.</em></h1>
              <p className={styles.hmLead}>
                Youtil은 1인 운영자 리만이 만드는 생활 계산 레퍼런스입니다. 연봉·세금·대출부터 건강·요리·날짜까지 자주 하는 계산을
                로그인 없이 바로 하고, 법정 수치에는 기준일과 공식 출처를 함께 적습니다.
              </p>
              <HomeSearch popular={heroChips} popLabel="추천" />
            </div>

            <Link className={styles.hmPreview} href="/tools/finance/salary" data-cat="finance" aria-label={`연봉 실수령액 계산기 예시 — 연봉 5,000만원이면 월 ${won(ex.netMonthly)}원`}>
              <span className={styles.hmPreviewTop}>
                <span><span className="ui-chipIc ui-sm" aria-hidden="true"><CatIcon id="finance" size={16} /></span>연봉 실수령액 계산기</span>
                <span className="ui-pill ui-pill-gray">예시</span>
              </span>
              <span className={styles.hmPreviewQ}>연봉 5,000만원이면 매달 통장에</span>
              <span className={styles.hmPreviewN}>{won(ex.netMonthly)}<small>원</small></span>
              <span className={styles.hmPreviewBar} aria-hidden="true">
                <span style={{ width: pctOf(ex.netMonthly), background: 'var(--data-1)' }} />
                <span style={{ width: pctOf(ex.totalInsurance), background: 'var(--data-2)' }} />
                <span style={{ width: pctOf(ex.totalTax), background: 'var(--data-3)' }} />
              </span>
              <span className={styles.hmPreviewRows}>
                <span><span>4대보험 (국민연금·건강·장기요양·고용)</span><b>{won(ex.totalInsurance)}원</b></span>
                <span><span>소득세 + 지방소득세</span><b>{won(ex.totalTax)}원</b></span>
              </span>
              <span className={styles.hmPreviewF}>부양가족 1명(본인)·비과세 0원 · {YEAR}년 요율·간이세액표</span>
              <span className={styles.hmPreviewGo}>내 연봉으로 계산하기<UiIcon name="arrow-r" size={18} /></span>
            </Link>
          </div>

          <ul className={styles.hmTrust} aria-label="Youtil의 원칙">
            {TRUST.map((t) => (
              <li key={t.title} className={styles.hmTrustI}>
                <span className="ui-chipIc" aria-hidden="true"><UiIcon name={t.icon} size={20} /></span>
                <span><b>{t.title}</b><span>{t.desc}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className={styles.hmWrap}>
        {/* 분야별로 찾기 — 개수 배지 없이(규모 과시 축소) 분야 이름 + 대표 도구 한 줄 */}
        <section className={styles.hmSec} aria-labelledby="cat-h">
          <div className={styles.hmSecH}>
            <div><h2 id="cat-h">분야별로 찾기</h2><p>돈·몸·집·날짜처럼 쓰임새로 나눠 두었습니다.</p></div>
            <Link className={styles.hmMore} href="/tools">전체 도구<UiIcon name="chev-r" size={16} /></Link>
          </div>
          <div className={styles.hmCats}>
            {categories.map((c) => (
              <Link key={c.id} className={styles.hmCat} data-cat={c.id} href={`/tools/${c.id}`}>
                <span className="ui-chipIc" aria-hidden="true"><CatIcon id={c.id} size={20} /></span>
                <span>
                  <span className={styles.hmCatN}>{c.name}</span>
                  {c.tagline && <span className={styles.hmCatT}>{c.tagline}</span>}
                </span>
              </Link>
            ))}
            <Link className={`${styles.hmCat} ${styles.hmCatAll}`} href="/tools">
              <span className="ui-chipIc" aria-hidden="true"><UiIcon name="grid" size={20} /></span>
              <span>
                <span className={styles.hmCatN}>전체 보기</span>
                <span className={styles.hmCatT}>분야별 목록 · 검색</span>
              </span>
            </Link>
          </div>
        </section>

        {/* 편집 추천 — 조회 순위와 분리(AdSense 감사 P1-4) */}
        <section className={styles.hmSec} aria-labelledby="pick-h">
          <div className={styles.hmSecH}>
            <div><h2 id="pick-h">처음이라면 이 계산기부터</h2><p>운영자가 고른 기본 계산기입니다. 조회 순위와는 따로 정했습니다.</p></div>
          </div>
          <div className={styles.hmPicks}>
            {EDITOR_PICKS.map((p) => {
              const x = TOOL_CAT.get(p.href)
              if (!x) return null
              return (
                <Link key={p.href} className={styles.hmPick} data-cat={x.catId} href={p.href}>
                  <span className={styles.hmPickK}>{x.catName}</span>
                  <h3>{x.tool.name}</h3>
                  <p>{p.why}</p>
                  {p.fact && <span className={styles.hmPickF}>{p.fact}</span>}
                </Link>
              )
            })}
          </div>
        </section>

        <HomeStandards today={today} />

        {ranked.length > 0 && (
          <section className={styles.hmSec} aria-labelledby="pop-h">
            <div className={styles.hmSecH}>
              <div>
                <h2 id="pop-h">많이 찾는 계산기</h2>
                <p>{rankNote}</p>
              </div>
            </div>
            <ol className={styles.hmRank} style={{ ['--rows' as string]: Math.ceil(ranked.length / 2) }}>
              {ranked.map((href, i) => {
                const x = TOOL_CAT.get(href)
                if (!x) return null
                return (
                  <li key={href}>
                    <Link href={href} data-cat={x.catId}>
                      <span className={styles.hmRankN}>{i + 1}</span>
                      <span className={styles.hmRankB}><b>{x.tool.name}</b><span>{x.tool.desc}</span></span>
                      <span className={styles.hmRankC}>{shortCat(x.catName)}</span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        )}

        {/* 계산 해설 — lib/guides 게시 글이 GUIDES_MIN_TO_SHOW편 이상일 때만(빈 지면 = 얇은 사이트 신호) */}
        {showGuides() && (
          <section className={styles.hmSec} aria-labelledby="art-h">
            <div className={styles.hmSecH}>
              <div><h2 id="art-h">{GUIDES_HUB.label}</h2><p>숫자 뒤의 기준을 풀어 쓴 글입니다.</p></div>
              <Link className={styles.hmMore} href={GUIDES_HUB.href}>전체 보기<UiIcon name="chev-r" size={16} /></Link>
            </div>
            <div className={styles.hmArts}>
              {GUIDES.slice(0, 3).map((g) => (
                <Link key={g.slug} className={styles.hmArt} data-cat={g.catId} href={guideHref(g.slug)}>
                  <span className={styles.hmArtK}>{categories.find((c) => c.id === g.catId)?.name ?? '해설'}</span>
                  <h3>{g.title}</h3>
                  <p>{g.summary}</p>
                  {g.figure && <span className={styles.hmArtFig}><b>{g.figure.value}</b><span>{g.figure.caption}</span></span>}
                  <span className={styles.hmArtM}>{AUTHOR.name} · {dot(g.published)} · 읽는 시간 {g.readMinutes}분</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={styles.hmSec} aria-labelledby="col-h">
          <div className={styles.hmSecH}>
            <div><h2 id="col-h">상황별 가이드</h2><p>한 가지 일을 끝내는 데 필요한 계산기를 순서대로 묶었습니다.</p></div>
            <Link className={styles.hmMore} href="/collections">가이드 전체<UiIcon name="chev-r" size={16} /></Link>
          </div>
          <CollectionBanner featuredSlug={featuredSlug} month={month} />
        </section>

        <HomePrinciples />

        <section className={`${styles.hmSec} ${styles.hmFaq}`} aria-label="자주 묻는 질문">
          <Faq items={HOME_FAQ} />
        </section>
      </div>
    </div>
  )
}
