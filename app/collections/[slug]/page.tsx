/* app/collections/[slug]/page.tsx (server) — 상황별 가이드 상세 (Trust Ledger)
   흰 히어로(브레드크럼·분야 칩·H1·리드·도구 수·추천 시기) → 엮은이 노트(리만 · 1인 운영) → 단계(번호·설명·도구 행)
   → 가이드 본문(ArticleSheet: 순서의 이유·단계별 숫자 표·흔한 실수·전문가 확인·참고 자료 — _guides/<slug>.tsx)
   → 전체 도구 안내 → 다른 상황별 가이드. 칩 색은 대표 분야 data-cat 토큰. 심사 전 광고 0.
   색인: noindex 컬렉션은 robots {index:false, follow:true} — 링크는 따라가게(buildMetadata noIndex는 follow:false라 쓰지 않는다).
     색인 여부는 isCollectionIndexable 하나로 정한다(sitemap도 같은 함수). 색인 컬렉션에 본문(_guides)이 없으면 빌드를 멈춘다.
   재생성: 본문 일부('다가오는 명절·수능', 올해 최저임금·요율)가 오늘 날짜로 정해지므로 하루 1회 ISR.
   JSON-LD: ItemList(단계 순서대로 도구) — 화면 목록과 같은 데이터 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { COLLECTIONS, getCollection, isCollectionIndexable } from '@/lib/collections'
import { categories } from '@/lib/tools'
import CollectionIcon from '@/components/CollectionIcon'
import { collectionCatId, collectionStats, liveSteps } from '@/components/CollectionBanner'
import CatIcon from '@/components/CatIcon'
import UiIcon from '@/components/UiIcon'
import { SITE_OPERATOR } from '@/components/SiteJsonLd'
import { ArticleSheet } from '@/components/Article'
import { COLLECTION_GUIDES } from '../_guides'
import styles from '../collections.module.css'

const BASE = 'https://youtil.kr'

// 오늘 날짜로 고르는 본문(다가오는 설·추석·수능, 올해 최저임금·4대보험 요율 연도)이 배포 사이에도 하루 안에 갱신되도록
export const revalidate = 86400

// 색인 컬렉션은 본문 가이드가 반드시 있어야 한다 — 없으면 얇은 목록 페이지가 색인·sitemap에 들어가므로 빌드에서 막는다.
// (본문 없이 두려면 lib/collections에서 noindex: true로 표시 → robots noindex·sitemap 제외)
const INDEXABLE_WITHOUT_GUIDE = COLLECTIONS.filter((c) => isCollectionIndexable(c) && !(c.slug in COLLECTION_GUIDES)).map((c) => c.slug)
if (INDEXABLE_WITHOUT_GUIDE.length > 0) {
  throw new Error(`[collections] 본문 가이드 없는 색인 컬렉션: ${INDEXABLE_WITHOUT_GUIDE.join(', ')} — app/collections/_guides에 본문을 추가하거나 noindex: true로 표시하세요`)
}

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const c = getCollection(slug)
  if (!c) return buildMetadata({ path: `/collections/${slug}`, title: '상황별 가이드', description: '상황·라이프이벤트별 도구 모음.' })
  const meta = buildMetadata({
    path: `/collections/${c.slug}`,
    title: `${c.title} — 상황별 도구 모음`,
    description: c.lead,
  })
  // 묶음형(noindex)은 색인 제외 — 링크는 따라가게 follow:true. 색인 컬렉션의 본문 존재는 위 모듈 가드가 보장한다
  return isCollectionIndexable(c) ? meta : { ...meta, robots: { index: false, follow: true } }
}

const CAT_BY_HREF = new Map<string, { id: string; name: string }>()
for (const cat of categories) for (const t of cat.tools) CAT_BY_HREF.set(t.href, { id: cat.id, name: cat.name })

const monthsLabel = (m?: number[]) => (m && m.length > 0 ? `${[...m].sort((a, b) => a - b).join('·')}월` : '')

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = getCollection(slug)
  if (!c) notFound()

  const catId = collectionCatId(c)
  const guide = COLLECTION_GUIDES[c.slug]
  const others = COLLECTIONS.filter((x) => x.slug !== c.slug)
  // 화면 목록·JSON-LD·'도구 N개 · M단계'가 같은 데이터(레지스트리에 있는 도구만, 빈 단계 제외)를 쓴다
  const steps = liveSteps(c)
  const toolCount = steps.reduce((n, s) => n + s.tools.length, 0)
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.title,
    description: c.lead,
    itemListElement: steps.flatMap((s) => s.tools).map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `${BASE}${t.href}`,
    })),
  }

  return (
    <div className={styles.cl}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

      <section className={styles.clBand} aria-labelledby="cl-h1" data-cat={catId}>
        <div className={`${styles.clWrap} ${styles.clNarrow}`}>
          <nav className={styles.clCrumb} aria-label="현재 위치">
            <Link href="/">홈</Link>
            <UiIcon name="chev-r" size={14} />
            <Link href="/collections">상황별 가이드</Link>
            <UiIcon name="chev-r" size={14} />
            <span aria-current="page">{c.short}</span>
          </nav>
          <div className={styles.clHero}>
            <div className={styles.clId}>
              <span className="ui-chipIc" aria-hidden="true"><CollectionIcon slug={c.slug} size={20} /></span>
              <span className={styles.clEyebrow}>상황별 가이드</span>
            </div>
            <h1 className={styles.clH1} id="cl-h1">{c.title}</h1>
            <p className={styles.clLead}>{c.lead}</p>
            <div className={styles.clStats}>
              <span className={styles.clStat}>도구 {toolCount}개 · {steps.length}단계</span>
              {c.seasonMonths && <span className={styles.clStat}>추천 시기 {monthsLabel(c.seasonMonths)}</span>}
            </div>
          </div>
        </div>
      </section>

      <div className={`${styles.clWrap} ${styles.clNarrow}`}>
        {/* 엮은이 노트 — 1인 운영자(필명 리만)가 고르고 순서를 정했다 */}
        <aside className={styles.clNote} aria-label="엮은이 노트">
          <span className={styles.clNoteK}><UiIcon name="book" size={16} />엮은이 노트</span>
          <p>{c.intro}</p>
          <div className={styles.clBy}>
            <span className={styles.clAvatar} aria-hidden="true">{SITE_OPERATOR.name.slice(0, 1)}</span>
            <span><b>{SITE_OPERATOR.name}</b> 엮음 · {SITE_OPERATOR.role} <Link href={SITE_OPERATOR.url}>소개</Link></span>
          </div>
        </aside>

        <ol className={styles.clSteps}>
          {steps.map((step, i) => (
            <li key={step.title} className={styles.clStep}>
              <div className={styles.clStepH}>
                <span className={styles.clStepN} aria-hidden="true">{i + 1}</span>
                <h2>{step.title}</h2>
              </div>
              {step.note && <p className={styles.clStepNote}>{step.note}</p>}
              <ul className={styles.clTools}>
                {step.tools.map((t) => {
                  const cat = CAT_BY_HREF.get(t.href)
                  return (
                    <li key={t.href}>
                      <Link href={t.href} className={styles.clTool} data-cat={cat?.id}>
                        <span className="ui-chipIc ui-sm" aria-hidden="true">{cat && <CatIcon id={cat.id} size={16} />}</span>
                        <span><b>{t.name}</b><small>{t.desc}</small></span>
                        <UiIcon name="chev-r" size={18} />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
        </ol>

        {guide && (
          <ArticleSheet title={guide.title}>
            <guide.Body />
          </ArticleSheet>
        )}

        <p className={styles.clCta}>
          찾는 도구가 없나요? <Link href="/tools">전체 도구 목록</Link>에서 분야별로 찾아보거나 이름으로 검색해 보세요.
        </p>

        <section className={styles.clOthers} aria-labelledby="cl-others-h">
          <h2 className={styles.clSecH} id="cl-others-h">다른 상황별 가이드</h2>
          <ul className={styles.clOtherGrid}>
            {others.map((o) => {
              const st = collectionStats(o)
              return (
                <li key={o.slug}>
                  <Link href={`/collections/${o.slug}`} className={styles.clOther} data-cat={collectionCatId(o)}>
                    <span className="ui-chipIc ui-sm" aria-hidden="true"><CollectionIcon slug={o.slug} size={16} /></span>
                    <span><b>{o.short}</b><small>도구 {st.tools}개 · {st.steps}단계</small></span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
