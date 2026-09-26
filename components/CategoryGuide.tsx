/* components/CategoryGuide.tsx (server) — 분야 허브 본문 시트 (스펙 §10.19 '분야 안내')
   ArticleSheet(바이라인: 리만 작성 · Youtil 운영자) 안에 소개 → 상황별 표(표 1) → 운영 원칙 → [금융] 2025→2026 비교표(표 2) → FAQ.
   목적: 링크 그리드(doorway)를 실제로 읽을 거리가 있는 페이지로 — AdSense '가치 낮은 콘텐츠' 대응.
   정직성: 비교표 값은 도구와 같은 lib 단일 소스에서 계산(하드코딩 금지), 바뀐 값만 싣는다. 날짜는 git 기반 생성값만. */
import Link from 'next/link'
import { Fragment } from 'react'
import { ArticleSheet } from './Article'
import DataFigure from './DataFigure'
import Faq from './Faq'
import styles from './CategoryView.module.css'
import { CATEGORY_GUIDES, CATEGORY_HUBS } from '@/lib/categoryGuides'
import { allTools, categories } from '@/lib/tools'
import { INSURANCE_RATES, MIN_HOURLY_WAGE } from '@/lib/krInsuranceRates'
import { LEGAL_UPDATED } from '@/lib/toolSignals'
import { dotDate } from '@/lib/toolMeta'

const toolByHref = new Map(allTools.map((t) => [t.href, t]))
/** 표 안에서는 '계산기'를 떼고 짧게 — 390px 3열이 스크롤 없이 들어가게 */
const shortName = (name: string) => name.replace(/\s*(계산기|변환기|생성기)$/, '')

function ToolLinks({ hrefs }: { hrefs?: string[] }) {
  const tools = (hrefs ?? []).map((h) => toolByHref.get(h)).filter((t): t is NonNullable<typeof t> => !!t)
  if (tools.length === 0) return <span className={styles.cgSep}>—</span>
  return (
    <>
      {tools.map((t, i) => (
        <Fragment key={t.href}>
          {i > 0 && <span className={styles.cgSep}> · </span>}
          <Link href={t.href}>{shortName(t.name)}</Link>
        </Fragment>
      ))}
    </>
  )
}

const pct = (n: number) => `${n}%`
const won = (n: number) => `${n.toLocaleString('ko-KR')}원`

/** 금융 허브 — 2025 → 2026 바뀐 법정 기준 (도구가 쓰는 lib 값 그대로) */
function financeChanges() {
  const a = INSURANCE_RATES[2025]
  const b = INSURANCE_RATES[2026]
  const rows: { label: string; before: string; after: string }[] = [
    { label: '국민연금 보험료율', before: pct(a.pension.total), after: pct(b.pension.total) },
    { label: '건강보험료율', before: pct(a.health.total), after: pct(b.health.total) },
    { label: '장기요양보험료율', before: pct(a.ltc.rateOfSalary), after: pct(b.ltc.rateOfSalary) },
    { label: '고용보험료율(근로자)', before: pct(a.unemp.employee), after: pct(b.unemp.employee) },
    { label: '최저시급', before: won(MIN_HOURLY_WAGE[2025]), after: won(MIN_HOURLY_WAGE[2026]) },
  ]
  return rows.filter((r) => r.before !== r.after)
}

export default function CategoryGuide({ catId }: { catId: string }) {
  const guide = CATEGORY_GUIDES[catId]
  const hub = CATEGORY_HUBS[catId]
  const cat = categories.find((c) => c.id === catId)
  if (!guide || !cat) return null

  const [how, ...rest] = guide.sections
  const changes = catId === 'finance' ? financeChanges() : []
  let figN = 0

  return (
    <ArticleSheet title={hub?.guideTitle ?? `${cat.name} 도구 안내`}>
      <p>{guide.intro}</p>

      {how && (
        <>
          <h2 id="hub-how">{how.h}</h2>
          <p>{how.body}</p>
        </>
      )}

      {hub && hub.situations.length > 0 && (
        <DataFigure n={++figN} title="이런 상황이라면 이 계산기">
          <table className={styles.cgSit}>
            <thead>
              <tr><th scope="col">상황</th><th scope="col">먼저 볼 도구</th><th scope="col">이어서</th></tr>
            </thead>
            <tbody>
              {hub.situations.map((s) => (
                <tr key={s.when}>
                  <td>{s.when}</td>
                  <td><ToolLinks hrefs={s.first} /></td>
                  <td><ToolLinks hrefs={s.next} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataFigure>
      )}

      {rest.map((sec, i) => (
        <Fragment key={sec.h}>
          <h2 id={`hub-s${i + 2}`}>{sec.h}</h2>
          <p>{sec.body}</p>
        </Fragment>
      ))}

      {changes.length > 0 && (
        <>
          <h2 id="hub-changed">2026년에 바뀐 기준</h2>
          <p>올해 계산 결과가 작년과 다르다면 아래 기준이 바뀌었기 때문일 가능성이 큽니다. 표의 값은 각 계산기가 쓰는 데이터와 같은 소스에서 읽어 오므로, 개정되면 계산기와 함께 바뀝니다.</p>
          <DataFigure
            n={++figN}
            title="2025년 → 2026년 주요 기준"
            unit="바뀐 값만"
            source={<>자료: 국민연금공단·국민건강보험공단 보험료율 고시, 고용노동부 최저임금 고시{LEGAL_UPDATED ? ` — 법정 수치 데이터 최종 갱신 ${dotDate(LEGAL_UPDATED)}` : ''}</>}
          >
            <table>
              <thead>
                <tr><th scope="col">항목</th><th scope="col" className="r">2025</th><th scope="col" className="r">2026</th></tr>
              </thead>
              <tbody>
                {changes.map((r) => (
                  <tr key={r.label}><td>{r.label}</td><td className="r">{r.before}</td><td className="r em">{r.after}</td></tr>
                ))}
              </tbody>
            </table>
          </DataFigure>
        </>
      )}

      <Faq items={guide.faqs} id="hub-faq" />
    </ArticleSheet>
  )
}
