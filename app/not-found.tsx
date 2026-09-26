/* app/not-found.tsx (server) — 404 (Trust Ledger 상태 화면)
   ─ 검색: components/HomeSearch(= lib/search.ts searchTools, Nav·홈과 같은 결과). JS 없이도 <form action="/tools">?q= 로 동작.
     첫 탭은 GA 순위가 아니라 편집 추천이므로 라벨을 '추천'으로(사실과 어긋나지 않게). 최근·즐겨찾기 = youtil:nav:v1.
   ─ 바로가기: 로또(도박 인접) 대신 핵심 생활·금융 도구 (adsense P1-7). 레지스트리에 없는 href는 자동으로 빠진다(통폐합 대비).
   ─ 광고 없음: 존재하지 않는 경로는 lib/ads AD_ALLOWED_PATHS 밖 → AutoAds·AdSlot 미렌더. */
import Link from 'next/link'
import { categories, totalTools } from '@/lib/tools'
import { buildMetadata } from '@/lib/seo'
import CatIcon from '@/components/CatIcon'
import HomeSearch, { type HomeChip } from '@/components/HomeSearch'
import s from './_trust/trust.module.css'

export const metadata = buildMetadata({
  path: '/404',
  title: '페이지를 찾을 수 없습니다 (404)',
  description: '요청하신 페이지를 찾을 수 없습니다. 계산기 이름으로 검색하거나 분야별로 Youtil의 무료 도구를 둘러보세요.',
  noIndex: true,
})

/** 길을 잃었을 때 가장 많이 필요한 핵심 도구 — 금융·날짜·단위·건강 */
const CORE_HREFS = [
  '/tools/finance/salary',
  '/tools/finance/4-insurance',
  '/tools/finance/severance',
  '/tools/finance/loan',
  '/tools/date/age',
  '/tools/date/dday',
  '/tools/unit/area',
  '/tools/health/bmi',
]

const CHIP_BY_HREF = new Map<string, HomeChip>()
for (const c of categories) for (const t of c.tools) CHIP_BY_HREF.set(t.href, { href: t.href, label: t.name.replace(/\s*계산기$/, ''), cat: c.id })
const CORE = CORE_HREFS.map(h => CHIP_BY_HREF.get(h)).filter((x): x is HomeChip => !!x)

export default function NotFound() {
  return (
    <div className={s.state}>
      <p className={s.stateCode}>404 · 페이지 없음</p>
      <h1 className={s.stateTitle}>찾으시는 페이지가 없습니다</h1>
      <p className={s.stateLead}>
        주소가 바뀌었거나 없어진 페이지일 수 있습니다. 계산기 이름으로 검색하거나, 아래 추천 도구와 분야에서 골라 주세요.
      </p>

      <HomeSearch popular={CORE} popLabel="추천" />

      <div className={s.actions}>
        <Link className="ui-btn ui-btn-outline ui-btn-sm" href="/">홈으로</Link>
        <Link className="ui-btn ui-btn-outline ui-btn-sm" href="/tools">전체 도구 {totalTools}개 보기</Link>
      </div>

      <section className={s.stateSec} aria-labelledby="nf-cats">
        <h2 id="nf-cats" className={s.stateSecH}>분야별로 찾기</h2>
        <p className={s.stateSecP}>{categories.length}개 분야, {totalTools}개 계산기와 도구</p>
        <ul className={s.cats}>
          {categories.map(c => (
            <li key={c.id}>
              <Link href={`/tools/${c.id}`} data-cat={c.id}>
                <span className="ui-chipIc ui-sm" aria-hidden="true"><CatIcon id={c.id} size={16} /></span>
                {c.name}
                <small>{c.tools.length}개</small>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className={s.stateFoot}>
        사이트 안의 링크를 눌렀는데 이 화면이 나왔다면, 어느 페이지에서 눌렀는지 <Link href="/contact">문의·오류 제보</Link>로 알려 주세요.
      </p>
    </div>
  )
}
