/* app/guides/_components/GuideLayout.tsx (server) — '계산 해설' 글 공용 틀
   경로(홈 › 계산 해설 › 제목) → 아이브로우·H1·리드·바이라인(리만 · 발행 · 최종 업데이트 · 읽는 시간)·기준 줄
   → 흰 본문 시트(.prose — h2 자동 번호): 한눈에 보기 → 목차(본문 h2 id에서 자동) → 본문 → 참고 자료 → 이 글을 쓴 사람
   → 면책 → 관련 계산기 → 허브로. JSON-LD = Article + BreadcrumbList (@graph 한 블록).
   ─ 제목·요약·날짜·분야·읽는 시간은 lib/guides 레지스트리(GUIDES)가 단일 소스 — 페이지는 slug만 넘긴다.
   ─ 작성자 = AUTHOR(필명 '리만', 1인 운영) 단일 상수. 지어낸 경험담·통계·인용 금지(app/editorial-policy '경험담 원칙').
   ─ 광고 코드 없음(AutoAds가 사이트 전역에서 처리). 정적 콘텐츠만 — 클라이언트 컴포넌트를 넣지 않는다.
   `_components`는 밑줄 폴더(Next private folder)라 라우트가 아니다.

   사용 예 (app/guides/<slug>/page.tsx):
     export const metadata = guideMetadata('<slug>')
     export default function Page() {
       return (
         <GuideLayout slug="<slug>" lead={<>…</>} basis="2026년 요율 기준" glance={[<>…</>, <>…</>]}
           sources={[{ label: '소득세법 제134조', href: 'https://www.law.go.kr/법령/소득세법/제134조', org: '국가법령정보센터' }]}
           related={[{ href: '/tools/finance/salary' }]} disclaimer={<>…</>}>
           <h2 id="flow">…</h2><p>…<Ref n={1} /></p>
           <DataFigure n={1} title="…">…</DataFigure>
           <Faq items={FAQ} />
         </GuideLayout>
       )
     } */
import Link from 'next/link'
import { Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'
import type { Metadata } from 'next'
import UiIcon from '@/components/UiIcon'
import Faq from '@/components/Faq'
import Disclaimer, { type DisclaimerVariant } from '@/components/Disclaimer'
import RelatedTools, { type RelatedItem } from '@/components/RelatedTools'
import { ORGANIZATION_ID } from '@/components/SiteJsonLd'
import { AUTHOR, dotDate } from '@/lib/toolMeta'
import { buildMetadata } from '@/lib/seo'
import { categories } from '@/lib/tools'
import { getGuide, guideHref, GUIDES_HUB, type GuideArticle } from '@/lib/guides'
import s from './guide.module.css'

export { Ref } from '@/components/Article'
export { GUIDES_HUB }

const SITE = 'https://youtil.kr'

export interface GuideSource {
  /** 자료 이름 — 조문 번호·간행물 이름까지 정확히 (예: '소득세법 제134조(근로소득 원천징수시기 및 방법)') */
  label: string
  /** 공식 출처 URL (law.go.kr · nts.go.kr · nps.or.kr · nhis.or.kr · ei.go.kr · moel.go.kr · korea.kr 등) */
  href: string
  /** 발행 기관 (예: '국가법령정보센터') — 목록 두 번째 줄 */
  org?: string
}

export interface GuideLayoutProps {
  /** lib/guides GUIDES의 slug(경로 조각만) — 제목·요약·날짜·분야·읽는 시간을 레지스트리에서 읽는다 */
  slug: string
  /** H1 아래 리드 문단 */
  lead: ReactNode
  /** 시간 민감 수치의 기준 한 줄(기준일·적용 기간) — 예: '2026년 4대보험 요율 · 국민연금 상·하한 2026년 7월~2027년 6월' */
  basis?: ReactNode
  /** '한눈에 보기' 요약 항목(3~5개). 생략하면 상자를 그리지 않는다 */
  glance?: ReactNode[]
  /** 참고 자료 — 배열 순서 = 본문 <Ref n> 번호(#src-n) */
  sources: GuideSource[]
  /** '관련 계산기' 카드(RelatedTools items). 레지스트리에 없는 경로는 조용히 빠진다 */
  related: RelatedItem[]
  /** 면책(Disclaimer children) — 넘기면 시트 아래에 접힌 상자로 */
  disclaimer?: ReactNode
  disclaimerVariant?: DisclaimerVariant
  /** 본문 — <h2 id="…">(목차 라벨이 길면 data-toc="짧은 라벨") 섹션들 + DataFigure·Callout·Faq */
  children: ReactNode
}

/* ── 레지스트리 조회 ─────────────────────────────────────── */
function mustGuide(slug: string): GuideArticle {
  const g = getGuide(slug)
  if (!g) throw new Error(`[GuideLayout] lib/guides GUIDES에 없는 slug: ${slug}`)
  return g
}

/** 글 페이지 metadata — 레지스트리 제목·요약으로 canonical·OG(article)·twitter를 만든다 */
export function guideMetadata(slug: string): Metadata {
  const g = mustGuide(slug)
  const base = buildMetadata({ path: guideHref(g.slug), title: g.title, description: g.summary, keywords: g.keywords })
  return {
    ...base,
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: g.published,
      modifiedTime: g.updated,
      authors: [`${SITE}${AUTHOR.url}`],
    },
  }
}

/* ── 본문 트리 읽기 (서버 렌더 시 1회) ───────────────────── */
type El = ReactElement<{ children?: ReactNode; id?: string; title?: string; items?: unknown; 'data-toc'?: string; 'data-nonum'?: unknown }>
const MAX_DEPTH = 24

function textOf(node: ReactNode, depth = 0): string {
  if (node == null || typeof node === 'boolean' || depth > MAX_DEPTH) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(n => textOf(n, depth + 1)).join('')
  if (isValidElement(node)) return textOf((node as El).props.children, depth + 1)
  return ''
}

export interface GuideTocItem { id: string; label: string }

/** 본문의 h2(id 있고 data-nonum 없음)와 <Faq>를 문서 순서대로 — 번호가 .prose h2 counter와 맞는다 */
function collectToc(node: ReactNode, out: GuideTocItem[], depth = 0): void {
  if (node == null || typeof node === 'boolean' || depth > MAX_DEPTH) return
  if (Array.isArray(node)) { node.forEach(n => collectToc(n, out, depth + 1)); return }
  if (!isValidElement(node)) return
  const el = node as El
  if (el.type === 'h2') {
    if (el.props.id && el.props['data-nonum'] === undefined) out.push({ id: el.props.id, label: el.props['data-toc'] ?? textOf(el.props.children) })
    return
  }
  if (el.type === Faq) {
    const items = el.props.items
    if (Array.isArray(items) && items.length > 0) out.push({ id: el.props.id ?? 'faq', label: el.props.title ?? '자주 묻는 질문' })
    return
  }
  if (typeof el.type === 'string' || el.type === Fragment) collectToc(el.props.children, out, depth + 1)
}

/** 읽는 시간용 글자 수(공백 제외) — 컴포넌트는 props.children만 따라가고, Faq는 문항·답변(태그 제거)을 센다(ToolPage와 같은 기준) */
function countChars(node: ReactNode, depth = 0): number {
  if (node == null || typeof node === 'boolean' || depth > MAX_DEPTH) return 0
  if (typeof node === 'string' || typeof node === 'number') return String(node).replace(/\s+/g, '').length
  if (Array.isArray(node)) return node.reduce<number>((n, c) => n + countChars(c, depth + 1), 0)
  if (!isValidElement(node)) return 0
  const el = node as El
  if (el.type === Faq) {
    const items = el.props.items
    if (!Array.isArray(items)) return 0
    return (items as { q?: unknown; a?: unknown }[]).reduce<number>(
      (n, it) => n + `${it.q ?? ''}${String(it.a ?? '').replace(/<[^>]+>/g, '')}`.replace(/\s+/g, '').length, 0)
  }
  return countChars(el.props.children, depth + 1)
}

/** 본문 글자 수 → 읽는 시간(분). 한국어 평균 읽기 속도 근사 500자/분 */
export function readMinutesOf(chars: number): number {
  return Math.max(1, Math.round(chars / 500))
}

/* ── 본문 보조 블록 (children을 그대로 받아 읽는 시간 집계에 포함된다) ── */

/** 번호 단계 목록 — <GuideSteps><li><b>제목</b><span>설명</span></li>…</GuideSteps> (신뢰 페이지 .steps와 같은 모양) */
export function GuideSteps({ children }: { children: ReactNode }) {
  return <ol className={s.steps}>{children}</ol>
}

/** 체크리스트 — <GuideChecklist><li>…</li>…</GuideChecklist>. 체크 아이콘은 장식(CSS) */
export function GuideChecklist({ children }: { children: ReactNode }) {
  return <ul className={s.check}>{children}</ul>
}

/* ── 틀 ─────────────────────────────────────────────────── */
export default function GuideLayout({ slug, lead, basis, glance, sources, related, disclaimer, disclaimerVariant = 'finance', children }: GuideLayoutProps) {
  const g = mustGuide(slug)
  const href = guideHref(g.slug)
  const url = `${SITE}${href}`
  const cat = categories.find(c => c.id === g.catId)

  const toc: GuideTocItem[] = []
  collectToc(children, toc)
  if (sources.length > 0) toc.push({ id: 'sources', label: '참고 자료' })

  // 레지스트리 readMinutes(카드·홈에 쓰는 값)가 실제 본문과 어긋나면 개발 중에 알린다 — 지어낸 읽는 시간 방지
  if (process.env.NODE_ENV !== 'production') {
    const chars = countChars(children) + countChars(lead) + countChars(glance ?? [])
    const actual = readMinutesOf(chars)
    if (actual !== g.readMinutes) console.warn(`[GuideLayout] ${slug}: readMinutes ${g.readMinutes} ≠ 본문 기준 ${actual}분(${chars}자) — lib/guides를 고치세요`)
  }

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: g.title,
        description: g.summary,
        inLanguage: 'ko-KR',
        datePublished: g.published,
        dateModified: g.updated,
        author: { '@type': 'Person', name: AUTHOR.name, url: `${SITE}${AUTHOR.url}`, jobTitle: AUTHOR.role },
        publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: 'Youtil', url: SITE, logo: { '@type': 'ImageObject', url: `${SITE}/icon-512.png` } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: `${SITE}/opengraph-image.png`,
        ...(g.keywords && g.keywords.length > 0 && { keywords: g.keywords.join(', ') }),
        ...(sources.length > 0 && {
          citation: sources.map(x => ({ '@type': 'CreativeWork', name: x.label, url: x.href, ...(x.org && { publisher: { '@type': 'Organization', name: x.org } }) })),
        }),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE },
          { '@type': 'ListItem', position: 2, name: GUIDES_HUB.label, item: `${SITE}${GUIDES_HUB.href}` },
          { '@type': 'ListItem', position: 3, name: g.title, item: url },
        ],
      },
    ],
  }

  return (
    <div className={s.page} data-cat={g.catId}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />

      <nav className={s.crumb} aria-label="현재 위치">
        <Link href="/">홈</Link>
        <UiIcon name="chev-r" size={14} />
        <Link href={GUIDES_HUB.href}>{GUIDES_HUB.label}</Link>
        <UiIcon name="chev-r" size={14} />
        <span aria-current="page">{g.title}</span>
      </nav>

      <header className={s.head}>
        <p className={s.eyebrow}>
          <span><UiIcon name="book" size={16} />{GUIDES_HUB.label}</span>
          {cat && <span className={s.cat}>{cat.name}</span>}
        </p>
        <h1 className={s.title} id="guide-title">{g.title}</h1>
        <p className={s.lead}>{lead}</p>
        <div className={s.byline}>
          <span className={s.avatar} aria-hidden="true">{AUTHOR.name.slice(0, 1)}</span>
          <p className={s.byText}>
            <b>{AUTHOR.name}</b> 작성 · {AUTHOR.role} <Link href={AUTHOR.url}>소개</Link>
            <br />
            발행 <time dateTime={g.published}>{dotDate(g.published)}</time>
            {g.updated !== g.published && <> · 최종 업데이트 <time dateTime={g.updated}>{dotDate(g.updated)}</time></>}
            {' · '}읽는 시간 약 {g.readMinutes}분
          </p>
        </div>
        {basis && <p className={s.basis}><UiIcon name="clock" size={14} /><b>기준</b><span>{basis}</span></p>}
      </header>

      <article className={`${s.sheet} prose`} aria-labelledby="guide-title">
        {glance && glance.length > 0 && (
          <section className={s.glance} aria-labelledby="glance-h">
            <h2 className={s.glanceH} id="glance-h" data-nonum=""><UiIcon name="list" size={16} />한눈에 보기</h2>
            <ul>{glance.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </section>
        )}

        {toc.length > 1 && (
          <nav className={`${s.toc} ${toc.length > 6 ? s.tocCols : ''}`} aria-label="이 글의 목차">
            <b>이 글의 목차</b>
            <ol>{toc.map(t => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}</ol>
          </nav>
        )}

        {children}

        {sources.length > 0 && (
          <>
            <h2 id="sources">참고 자료</h2>
            <ol className={s.refs}>
              {sources.map((x, i) => (
                <li key={x.href + x.label} id={`src-${i + 1}`}>
                  <span>
                    <a href={x.href} target="_blank" rel="noopener noreferrer">{x.label}<span className="srOnly">(새 창)</span></a>
                    {x.org && <small>{x.org}</small>}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        <section className={s.about} aria-labelledby="guide-about-t">
          <div className={s.aboutWho}>
            <span className={s.aboutAvatar} aria-hidden="true">{AUTHOR.name.slice(0, 1)}</span>
            <div>
              <b id="guide-about-t">이 글을 쓴 사람 · {AUTHOR.name}</b>
              <span>{AUTHOR.role} · 혼자 만들고 운영하는 1인 서비스입니다</span>
            </div>
            <Link href={AUTHOR.url}>운영자 소개<UiIcon name="chev-r" size={14} /></Link>
          </div>
          <dl>
            <dt>숫자의 출처</dt>
            <dd>세율·요율·상하한 같은 법정 수치와 표·예시의 금액은 손으로 옮겨 적지 않고, 계산기와 같은 코드·같은 기준값으로 사이트를 만들 때 계산해 넣습니다. 자세한 원칙은 <Link href="/editorial-policy">편집·검산 원칙</Link>에 있습니다.</dd>
            <dt>오류 제보</dt>
            <dd>설명이나 숫자가 공식 자료와 다르면 <a href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent('[오류 제보] ' + href)}`}>{AUTHOR.email}</a>로 알려 주세요. 평일 기준 1~3일 안에 답변합니다.</dd>
          </dl>
        </section>
      </article>

      <div className={s.after}>
        {disclaimer && <Disclaimer variant={disclaimerVariant}>{disclaimer}</Disclaimer>}
        <RelatedTools items={related} title="관련 계산기" ring={false} limit={Math.max(6, related.length)} />
        <p className={s.back}>
          <Link href={GUIDES_HUB.href}>계산 해설 전체 보기<UiIcon name="chev-r" size={16} /></Link>
        </p>
      </div>
    </div>
  )
}
