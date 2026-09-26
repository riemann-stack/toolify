/* app/guides/page.tsx (server) — '계산 해설' 허브: lib/guides GUIDES 전체를 카드로.
   ─ 신뢰 페이지 문법(경로 → 아이브로우·H1·리드 → 흰 시트)을 따른다. 스타일은 글 틀과 같은 guide.module.css.
   ─ 카드 수치(figure)·날짜·읽는 시간은 레지스트리 값 그대로(레지스트리가 lib 단일 소스에서 계산) — 여기서 숫자를 만들지 않는다.
   ─ 헤더·푸터 링크는 Nav/Footer의 GUIDES_LIVE 스위치(글 3편 이상 검증 후 true), 홈 섹션은 lib/guides showGuides()가 관리한다. */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { categories } from '@/lib/tools'
import { GUIDES, GUIDES_HUB, guideHref } from '@/lib/guides'
import { AUTHOR, dotDate } from '@/lib/toolMeta'
import UiIcon from '@/components/UiIcon'
import s from './_components/guide.module.css'

const TITLE = '계산 해설'
const DESC = '연봉·세금·보험처럼 여러 계산기를 거쳐야 답이 나오는 일을 한 흐름으로 풀어 쓴 글입니다. 법정 수치와 예시 금액은 계산기와 같은 코드로 계산해 넣고, 근거 법령과 기준일을 함께 적습니다.'

export const metadata = buildMetadata({
  path: GUIDES_HUB.href,
  title: `${TITLE} — 계산기 숫자 뒤의 기준을 풀어 쓴 글`,
  description: DESC,
})

const SITE = 'https://youtil.kr'
/* 최신 글 먼저(발행일 내림차순, 같으면 레지스트리 순서) */
const LIST = [...GUIDES].sort((a, b) => (a.published < b.published ? 1 : a.published > b.published ? -1 : 0))

export default function GuidesHubPage() {
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE}${GUIDES_HUB.href}#page`,
        name: TITLE,
        description: DESC,
        url: `${SITE}${GUIDES_HUB.href}`,
        inLanguage: 'ko-KR',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: LIST.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${guideHref(g.slug)}`, name: g.title })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '홈', item: SITE },
          { '@type': 'ListItem', position: 2, name: TITLE, item: `${SITE}${GUIDES_HUB.href}` },
        ],
      },
    ],
  }

  return (
    <div className={s.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />

      <nav className={s.crumb} aria-label="현재 위치">
        <Link href="/">홈</Link>
        <UiIcon name="chev-r" size={14} />
        <span aria-current="page">{TITLE}</span>
      </nav>

      <header className={s.head}>
        <p className={s.eyebrow}><span><UiIcon name="book" size={16} />Youtil 읽을거리</span></p>
        <h1 className={s.title}>{TITLE}</h1>
        <p className={s.lead}>
          계산기 하나로 끝나지 않는 일이 있습니다. 첫 월급 명세서를 읽거나 연말정산 결과를 이해하려면 연봉·4대보험·연말정산 계산기를 차례로 거쳐야 합니다.
          계산 해설은 그 과정을 <strong>한 흐름으로 이어</strong> 설명하는 글입니다.
        </p>
      </header>

      <div className={`${s.sheet} prose`}>
        <h2 id="what" data-nonum="">이 글들은 무엇인가요</h2>
        <p>
          각 계산기 페이지의 설명은 그 계산기 하나의 입력과 결과를 다룹니다. 계산 해설은 한 걸음 물러나서, 어떤 순서로 어떤 숫자가 정해지는지와
          계산기 사이의 숫자가 서로 어떻게 이어지는지를 설명합니다. 글마다 끝에 관련 계산기를 달아 두었으니, 읽은 흐름을 그대로 자기 숫자로 계산해 볼 수 있습니다.
        </p>
        <h2 id="numbers" data-nonum="">숫자는 어디서 오나요</h2>
        <p>
          세율·보험료율·상하한 같은 법정 수치는 사이트 전체가 한 곳에 둔 값을 씁니다. 글 속 표와 예시 금액도 사람이 옮겨 적지 않고,
          계산기와 같은 계산 코드로 사이트를 만들 때 계산해 넣습니다. 그래서 기준값이 바뀌면 계산기와 글의 숫자가 함께 바뀝니다.
          각 글에는 근거 법령의 조문 번호와 공식 기관 자료, 그리고 수치의 기준일을 적습니다.
        </p>
        <p>
          글은 운영자 {AUTHOR.name} 한 사람이 쓰고 고칩니다. 겪지 않은 경험담이나 출처 없는 통계는 넣지 않습니다.
          자료를 고르고 검산하는 방식은 <Link href="/editorial-policy">편집·검산 원칙</Link>에 적어 두었습니다.
        </p>
      </div>

      <section className={s.listSec} aria-labelledby="guides-list-h">
        <h2 className={s.listH} id="guides-list-h">전체 글</h2>
        <p className={s.listP}>{LIST.length}편 · 최신 글 순</p>
        {LIST.length > 0 ? (
          <ul className={s.list}>
            {LIST.map(g => {
              const cat = categories.find(c => c.id === g.catId)
              return (
                <li key={g.slug}>
                  <Link className={s.card} href={guideHref(g.slug)} data-cat={g.catId}>
                    <span className={s.cardK}>{cat?.name ?? TITLE}</span>
                    <h3 className={s.cardT}>{g.title}</h3>
                    <p className={s.cardS}>{g.summary}</p>
                    {g.figure && <span className={s.cardFig}><b>{g.figure.value}</b><span>{g.figure.caption}</span></span>}
                    <span className={s.cardM}>
                      {AUTHOR.name} · <time dateTime={g.published}>{dotDate(g.published)}</time> · 읽는 시간 약 {g.readMinutes}분
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className={s.empty}>아직 게시된 글이 없습니다.</p>
        )}
      </section>
    </div>
  )
}
