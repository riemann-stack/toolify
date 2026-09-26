/* app/collections/page.tsx (server) — 상황별 가이드 목록 (Trust Ledger)
   흰 히어로(브레드크럼·H1·리드) → 가이드 카드(대표 분야 칩 · 제목 · 한 줄 설명 · 도구 수·단계 · 추천 시기). 심사 전 광고 0 */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { COLLECTIONS } from '@/lib/collections'
import CollectionIcon from '@/components/CollectionIcon'
import { collectionCatId, collectionStats } from '@/components/CollectionBanner'
import UiIcon from '@/components/UiIcon'
import styles from './collections.module.css'

export const metadata = buildMetadata({
  path: '/collections',
  title: '상황별 가이드 — 라이프이벤트별 도구 모음',
  description:
    '해외여행, 내 집 마련, 명절 준비, 다이어트까지 — 상황과 라이프이벤트에 필요한 계산 도구를 진행 순서대로 묶은 가이드 모음입니다.',
})

/** [1, 7, 8, 12] → '1·7·8·12월' */
const monthsLabel = (m?: number[]) => (m && m.length > 0 ? `${[...m].sort((a, b) => a - b).join('·')}월` : '')

export default function CollectionsIndexPage() {
  return (
    <div className={styles.cl}>
      <section className={styles.clBand} aria-labelledby="cl-h1">
        <div className={styles.clWrap}>
          <nav className={styles.clCrumb} aria-label="현재 위치">
            <Link href="/">홈</Link>
            <UiIcon name="chev-r" size={14} />
            <span aria-current="page">상황별 가이드</span>
          </nav>
          <div className={styles.clHero}>
            <h1 className={styles.clH1} id="cl-h1">상황별 가이드</h1>
            <p className={styles.clLead}>
              도구를 하나씩 찾는 대신, 한 가지 일을 끝내는 데 필요한 계산을 진행 순서대로 모았습니다. 해외여행 준비부터 내 집 마련,
              명절 행사, 건강 관리까지 각 가이드는 실제로 일이 진행되는 단계에 맞춰 도구를 묶었습니다.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.clWrap}>
        <ul className={styles.clList}>
          {COLLECTIONS.map((c) => {
            const st = collectionStats(c)
            return (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className={styles.clCard} data-cat={collectionCatId(c)}>
                  <span className="ui-chipIc" aria-hidden="true"><CollectionIcon slug={c.slug} size={20} /></span>
                  <span className={styles.clCardBody}>
                    <h2>{c.title}</h2>
                    <p>{c.lead}</p>
                    <span className={styles.clMeta}>
                      <span>도구 {st.tools}개 · {st.steps}단계</span>
                      {c.seasonMonths && <span className={styles.clSeason}>추천 시기 {monthsLabel(c.seasonMonths)}</span>}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
