/* app/updates/page.tsx (server) — 공개 업데이트 기록 (스펙 §1.3 #10 · §10.18 · adsense P1-3 '공개 정정 기록')
   데이터 = app/_trust/updatesData.ts (git log origin/main 커밋에서 옮겨 적은 실제 정정·추가 내역만).
   ─ 앵커: 도구 slug 마지막 조각(#lunar) → 그 도구의 가장 최근 항목. SourceNotes의 changelogHref(`/updates#<slug>`)가 이 규칙을 쓴다.
   ─ 광고 없음(AD_ALLOWED_PATHS 밖). */
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { allTools } from '@/lib/tools'
import { categoryOf } from '@/lib/search'
import TrustPage, { AuthorMeta, dot } from '../_trust/TrustPage'
import { UPDATES, UPDATE_KINDS, type UpdateEntry, type UpdateKind } from '../_trust/updatesData'
import s from '../_trust/trust.module.css'

export const metadata = buildMetadata({
  path: '/updates',
  title: '업데이트 기록 — 계산 오류 정정·기준 반영·새 도구',
  description: 'Youtil 계산기의 오류 정정, 법령·고시 변경 반영, 새 도구 추가 내역을 날짜순으로 공개합니다. 음력 KASI 기준 교체, 전역일 월말 오류, 국민연금 상·하한 7월 반영 등.',
})

const KIND_CLASS: Record<UpdateKind, string> = { fix: s.kindFix, law: s.kindLaw, new: s.kindNew, imp: s.kindImp }
const TOOL_BY_HREF = new Map(allTools.map(t => [t.href, t]))

/** 'YYYY-MM' → '2026년 7월' */
function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return `${y}년 ${Number(m)}월`
}

// 월별 묶음 (데이터는 최신순) + 도구 앵커(각 도구의 가장 최근 항목에만)
const anchored = new Set<string>()
const months: { ym: string; items: { e: UpdateEntry; anchors: string[] }[] }[] = []
for (const e of UPDATES) {
  const ym = e.date.slice(0, 7)
  let g = months[months.length - 1]
  if (!g || g.ym !== ym) { g = { ym, items: [] }; months.push(g) }
  const anchors: string[] = []
  for (const href of e.tools ?? []) {
    if (!TOOL_BY_HREF.has(href)) continue
    const slug = href.split('/').pop() ?? ''
    if (slug && !anchored.has(slug)) { anchored.add(slug); anchors.push(slug) }
  }
  g.items.push({ e, anchors })
}

const counts = UPDATES.reduce<Record<UpdateKind, number>>((acc, e) => { acc[e.kind] += 1; return acc }, { fix: 0, law: 0, new: 0, imp: 0 })
const latest = UPDATES[0]?.date

export default function UpdatesPage() {
  return (
    <TrustPage
      path="/updates"
      eyebrow="운영 기록"
      icon="history"
      title="업데이트 기록"
      lead={<>계산 오류를 고치거나 기준을 바꾼 내역, 새로 추가한 도구를 날짜순으로 적었습니다. 개발 기록(git)에서 옮겨 적고 문장만 다듬었습니다. <strong>틀렸던 것은 틀렸다고 남깁니다.</strong></>}
      meta={[
        <AuthorMeta key="a" verb="기록" />,
        latest ? <>마지막 기록 <time dateTime={latest}>{dot(latest)}</time></> : null,
        <>정정 <b>{counts.fix}</b> · 기준 반영 <b>{counts.law}</b> · 추가 <b>{counts.new}</b> · 개선 <b>{counts.imp}</b></>,
      ].filter(Boolean)}
      toc={[...months.map(m => ({ id: `m-${m.ym}`, label: monthLabel(m.ym) })), { id: 'before', label: '2026년 6월 이전' }]}
      tocNumbered={false}
    >
      <p>
        여기에는 사용자가 결과나 설명에서 차이를 느낄 만한 변경만 적습니다. 오탈자·내부 코드 정리처럼 결과가 달라지지 않는 수정은 빼고,
        같은 날 같은 도구를 여러 번 고친 경우는 한 줄로 합쳤습니다. 계산이 틀렸던 경우에는 무엇이 얼마나 틀렸는지 함께 적습니다.
        오류를 발견하면 <Link href="/contact">문의·오류 제보</Link>로 알려 주세요. 고치는 방법은 <Link href="/editorial-policy">편집·검산 원칙</Link>에 있습니다.
      </p>
      <ul className={s.legend} aria-label="표시 구분">
        {(Object.keys(UPDATE_KINDS) as UpdateKind[]).map(k => (
          <li key={k}><span className={`${s.kind} ${KIND_CLASS[k]}`}>{UPDATE_KINDS[k].label}</span>{UPDATE_KINDS[k].desc}</li>
        ))}
      </ul>

      {months.map(m => (
        <section key={m.ym} aria-labelledby={`m-${m.ym}`}>
          <h2 id={`m-${m.ym}`} data-nonum="">{monthLabel(m.ym)}</h2>
          <ol className={s.log}>
            {m.items.map(({ e, anchors }, i) => {
              const tools = (e.tools ?? []).map(h => TOOL_BY_HREF.get(h)).filter((t): t is NonNullable<typeof t> => !!t)
              return (
                <li key={`${e.date}-${i}`} id={anchors[0]}>
                  <time dateTime={e.date}>{dot(e.date)}</time>
                  <div className={s.logBody}>
                    {anchors.slice(1).map(a => <span key={a} id={a} />)}
                    <div className={s.logHead}>
                      <span className={`${s.kind} ${KIND_CLASS[e.kind]}`}>{UPDATE_KINDS[e.kind].label}</span>
                      <h3 className={s.logTitle}>{e.title}</h3>
                    </div>
                    <p className={s.logText}>{e.text}</p>
                    {tools.length > 0 && (
                      <div className={s.logTools}>
                        {tools.map(t => (
                          <Link key={t.href} href={t.href} data-cat={categoryOf(t.href)?.id}>{t.name}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      ))}

      <h2 id="before" data-nonum="">2026년 6월 이전</h2>
      <p>
        Youtil은 2026년 4월 9일 처음 배포했습니다(당시 이름 Toolify, 이튿날 Youtil로 변경). 5월까지는 도구를 늘리고 화면 틀을 갖추는 시기였고,
        이 시기의 변경은 도구별로 나눠 적어 두지 않아 여기에 옮기지 않았습니다. 각 도구의 &lsquo;최종 업데이트&rsquo; 날짜는 개발 기록(git)에서 자동으로 만들며, 도구 머리에 차례로 표시하고 있습니다.
      </p>
    </TrustPage>
  )
}
