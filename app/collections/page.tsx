/* app/collections/page.tsx (server) — 상황별 가이드 목록 (Trust Ledger)
   흰 히어로(브레드크럼·H1·리드) → 가이드 카드(대표 분야 칩 · 제목 · 한 줄 설명 · 도구 수·단계 · 추천 시기)
   → 가이드를 읽는 법 · 시기별로 찾기(표 1 — 카드의 '추천 시기'와 같은 seasonMonths 데이터). 심사 전 광고 0 */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { COLLECTIONS } from '@/lib/collections'
import CollectionIcon from '@/components/CollectionIcon'
import { collectionCatId, collectionStats } from '@/components/CollectionBanner'
import UiIcon from '@/components/UiIcon'
import DataFigure from '@/components/DataFigure'
import styles from './collections.module.css'

export const metadata = buildMetadata({
  path: '/collections',
  title: '상황별 가이드 — 라이프이벤트별 도구 모음',
  description:
    '해외여행, 내 집 마련, 명절 준비, 다이어트까지 — 상황과 라이프이벤트에 필요한 계산 도구를 진행 순서대로 묶은 가이드 모음입니다.',
})

/** [1, 7, 8, 12] → '1·7·8·12월' */
const monthsLabel = (m?: number[]) => (m && m.length > 0 ? `${[...m].sort((a, b) => a - b).join('·')}월` : '')

/** 월(1~12) → 그 달이 추천 시기인 가이드 — 카드의 '추천 시기'와 같은 데이터 */
const BY_MONTH = Array.from({ length: 12 }, (_, i) => ({
  month: i + 1,
  items: COLLECTIONS.filter((c) => c.seasonMonths?.includes(i + 1)),
}))

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

        <section className={styles.clAbout} aria-labelledby="cl-about-h">
          <h2 className="g-h2" id="cl-about-h">상황별 가이드를 읽는 법</h2>
          <p className="g-p">
            각 가이드는 도구를 진행 순서대로 묶은 목록과 함께, 왜 그 순서인지, 단계마다 어떤 숫자를 확인해야 하는지, 자주 하는 실수와 전문가·기관에 확인해야 하는 경우를 한 페이지에 담고 있습니다.
            본문의 예시 표는 계산기와 같은 코드로 페이지를 만들 때 계산하므로 계산기 결과와 어긋나지 않습니다. 세율·요율·한도 같은 법정 수치는 본문에 손으로 적지 않고 사이트의 기준 데이터에서 읽어 오며, 계산기가 같은 데이터를 쓰는 경우에는 계산기 결과도 함께 바뀝니다.
            근거가 된 법령·공식 안내는 각 가이드 끝의 참고 자료에 모았습니다. 한 가지 상황의 흐름이 아니라 도구를 모아 둔 묶음은 목록만 제공합니다.
          </p>
          <h2 className="g-h2">시기별로 찾기</h2>
          <p className="g-p">명절·연말정산·김장처럼 때가 정해진 일은 준비를 시작하는 달에 맞춰 보면 편합니다. 아래 표는 각 가이드 카드에 적힌 추천 시기를 달별로 모은 것입니다.</p>
          <DataFigure n={1} title="달별 추천 상황별 가이드" unit="엮은이가 정한 추천 시기">
            <table className={styles.clMonthT}>
              <thead>
                <tr><th scope="col">달</th><th scope="col">가이드</th></tr>
              </thead>
              <tbody>
                {BY_MONTH.map((row) => (
                  <tr key={row.month}>
                    <td>{row.month}월</td>
                    <td className="wrap">
                      {row.items.length === 0
                        ? '—'
                        : row.items.map((c, i) => (
                            <span key={c.slug}>{i > 0 && ' · '}<Link href={`/collections/${c.slug}`}>{c.short}</Link></span>
                          ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
        </section>
      </div>
    </div>
  )
}
