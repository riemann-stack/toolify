/* components/CategoryView.tsx (server) — 분야 허브 (스펙 §10.19)
   구조: 흰 히어로(브레드크럼·분야 칩·H1·리드·통계 | TOP3) → sticky 하위 분류 칩 → [대표 계산 예시 — toolMeta.example 있을 때만]
        → 그룹별 목록(6개 + 'N개 더 보기', 링크는 전부 SSR) → 분야 안내 본문 시트(CategoryGuide) → 다른 분야 둘러보기
   정직성:
   · TOP3는 GA 조회 순위(app/popular-tools.json)에서 먼저 채우고, 모자라면 편집 선정(CATEGORY_HUBS.picks)으로 채운다 — 제목·라벨로 구분
   · 배지: 인기 = GA 상위(lib/toolSignals), NEW = 공개 60일 이내(git 첫 커밋). 수기 Tool.badge 무시. 그룹당 최대 2개
   · 행 메타(검산·기준 점검·최종 업데이트)는 lib/toolMeta에 기록이 있을 때만. 없으면 비운다(지어내지 않음)
   · 광고: 스펙 §11 ④ — 그룹 사이(2번째 그룹 뒤, 그룹 3개 이상일 때) 1개만. 심사 전에는 lib/ads isAdRestrictedPage가 허브를 막아 null
   분야색은 [data-cat] → --c/--c-ink/--c-soft(칩·점)에만. --accent는 바꾸지 않는다. */
import Link from 'next/link'
import { Fragment } from 'react'
import styles from './CategoryView.module.css'
import UiIcon, { hasUiIcon } from './UiIcon'
import CatIcon from './CatIcon'
import CategoryGuide from './CategoryGuide'
import AdSlot from './AdSlot'
import { categories, type Tool } from '@/lib/tools'
import { CATEGORY_HUBS, resolveGroups } from '@/lib/categoryGuides'
import { dotDate, getToolMeta, metaDate, verifiedLabel } from '@/lib/toolMeta'
import { POPULAR, POPULAR_IS_MEASURED, popularRank, toolBadge, type ToolBadge } from '@/lib/toolSignals'
import { todayStr } from '@/lib/date'

interface CategoryViewProps {
  catId: string
  /** 히어로 리드 한 문장 (허브 page.tsx가 넘긴다) */
  description?: string
}

const GROUP_VISIBLE = 6
const BADGES_PER_GROUP = 2
const BADGE_LABEL: Record<ToolBadge, string> = { hot: '인기', new: 'NEW' }

function Row({ t, catId, badge }: { t: Tool; catId: string; badge?: ToolBadge }) {
  const m = getToolMeta(t.href)
  const date = m ? metaDate(m) : null
  return (
    <Link className={styles.cvRow} href={t.href}>
      <span className="ui-chipIc" aria-hidden="true">
        {m?.iconName && hasUiIcon(m.iconName) ? <UiIcon name={m.iconName} size={20} /> : <CatIcon id={catId} size={20} />}
      </span>
      <span className={styles.cvRowBody}>
        <span className={styles.cvRowT}>
          {t.name}
          {badge && <span className={`ui-badge ui-badge-${badge}`}>{BADGE_LABEL[badge]}</span>}
        </span>
        <span className={styles.cvRowD}>{t.desc}</span>
        {(m?.verified || date) && (
          <span className={styles.cvRowM}>
            {m?.verified && <span className={styles.cvRowOk}><UiIcon name="shield" size={14} />{verifiedLabel(m.verified)}</span>}
            {date && <span>{date.text}</span>}
          </span>
        )}
      </span>
      <UiIcon name="chev-r" size={18} />
    </Link>
  )
}

export default function CategoryView({ catId, description }: CategoryViewProps) {
  const cat = categories.find((c) => c.id === catId)
  if (!cat) return null
  const hub = CATEGORY_HUBS[catId]
  const today = todayStr()

  /* ── TOP3: GA 조회 순위 → 부족분은 편집 선정 ── */
  const ranked = POPULAR_IS_MEASURED
    ? cat.tools.filter((t) => popularRank(t.href) > 0).sort((a, b) => popularRank(a.href) - popularRank(b.href)).slice(0, 3)
    : []
  const pickPool = [...(hub?.picks ?? []).map((h) => cat.tools.find((t) => t.href === h)), ...cat.tools]
    .filter((t): t is Tool => !!t)
  const fill: Tool[] = []
  for (const t of pickPool) {
    if (ranked.length + fill.length >= 3) break
    if (!ranked.includes(t) && !fill.includes(t)) fill.push(t)
  }
  const top = [...ranked, ...fill]
  const topAllMeasured = ranked.length === top.length && top.length > 0
  const topTitle = topAllMeasured ? '이 분야에서 많이 찾는 도구' : '먼저 보면 좋은 도구'
  // 집계 기간은 매니페스트에 days가 있을 때만 적는다(없는 숫자를 지어내지 않음)
  const topNote = topAllMeasured
    ? (POPULAR.days ? `최근 ${POPULAR.days}일 조회` : '조회 순')
    : ranked.length > 0 ? '조회 상위 + 편집 선정' : '편집 선정'

  /* ── 하위 분류 + 배지(그룹당 최대 2개) ── */
  const groups = resolveGroups(catId, cat.tools).map((g) => {
    let used = 0
    const badges = new Map<string, ToolBadge>()
    for (const t of g.tools) {
      const b = toolBadge(t, today)
      if (b && used < BADGES_PER_GROUP) { badges.set(t.href, b); used++ }
    }
    return { ...g, badges }
  })

  /* ── 대표 계산 예시 — toolMeta.example(사람이 검산해 적은 값)이 있는 도구만. 없으면 섹션 자체를 숨김 ── */
  const featured = cat.tools
    .map((t) => ({ t, m: getToolMeta(t.href) }))
    .filter((x) => !!x.m?.example)
    .slice(0, 3)

  /* ── 통계 pill — 실제 기록에서 집계 ── */
  const metas = cat.tools.map((t) => getToolMeta(t.href))
  const verifiedCount = metas.filter((m) => m?.verified).length
  const lastUpdated = metas.map((m) => m?.updated).filter((d): d is string => !!d).sort().pop()

  return (
    <div data-cat={catId} className={styles.cv}>
      <section className={styles.cvBand} id="top" aria-labelledby="cv-h1">
        <div className={styles.cvWrap}>
          <nav className={styles.cvCrumb} aria-label="현재 위치">
            <Link href="/">홈</Link>
            <UiIcon name="chev-r" size={14} />
            <Link href="/tools">전체 도구</Link>
            <UiIcon name="chev-r" size={14} />
            <span aria-current="page">{cat.name}</span>
          </nav>
          <div className={styles.cvHero}>
            <div>
              <div className={styles.cvId}>
                <span className="ui-chipIc ui-lg" aria-hidden="true"><CatIcon id={catId} size={28} /></span>
                <span className={styles.cvEyebrow}>분야<span>{cat.tagline ?? cat.name}</span></span>
              </div>
              <h1 className={styles.cvH1} id="cv-h1">{hub?.h1 ?? cat.name}</h1>
              {description && <p className={styles.cvLead}>{description}</p>}
              <div className={styles.cvStats}>
                <span className={styles.cvStat}><span><b>{cat.tools.length}</b>개 도구 · 하위 분류 {groups.length}개</span></span>
                {verifiedCount > 0 && (
                  <span className={`${styles.cvStat} ${styles.cvStatOk}`}><UiIcon name="shield" size={14} />검산 기록 {verifiedCount}개</span>
                )}
                {lastUpdated && <span className={styles.cvStat}>최근 업데이트 {dotDate(lastUpdated)}</span>}
              </div>
            </div>
            {top.length > 0 && (
              <aside className={styles.cvTop} aria-labelledby="cv-top-h">
                <p className={styles.cvTopH} id="cv-top-h">{topTitle} <span>{topNote}</span></p>
                <ol>
                  {top.map((t, i) => (
                    <li key={t.href}>
                      <Link href={t.href}>
                        <span className={styles.cvRank} aria-hidden="true">{i + 1}</span>
                        <span><b>{t.name}</b><small>{t.desc}</small></span>
                        <UiIcon name="chev-r" size={18} />
                      </Link>
                    </li>
                  ))}
                </ol>
              </aside>
            )}
          </div>
        </div>
      </section>

      {groups.length > 1 && (
        <nav className={styles.cvFilter} aria-label="하위 분류로 이동">
          <div className={styles.cvWrap}>
            <div className={styles.cvFilterIn}>
              {/* 앵커 이동 칩 — 스크롤 위치를 추적하지 않으므로 어떤 칩도 '선택됨'처럼 칠하지 않는다('전체' = 맨 위로) */}
              <a className={styles.cvFchip} href="#top">전체 <small>{cat.tools.length}</small></a>
              {groups.map((g) => (
                <a key={g.id} className={styles.cvFchip} href={`#${g.id}`}>{g.name} <small>{g.tools.length}</small></a>
              ))}
            </div>
          </div>
        </nav>
      )}

      <div className={styles.cvWrap}>
        {featured.length > 0 && (
          <section className={styles.cvSec} aria-labelledby="cv-feat-h">
            <div className={styles.cvSecH}><h2 id="cv-feat-h">대표 계산 예시</h2></div>
            <p className={styles.cvSecD}>자주 쓰는 조건으로 미리 계산한 결과입니다. 눌러서 내 조건으로 바꿔 보세요.</p>
            <div className={styles.cvFeat}>
              {featured.map(({ t, m }) => m?.example && (
                <Link key={t.href} className={styles.cvFcard} href={t.href}>
                  <span className="ui-chipIc" aria-hidden="true">
                    {m.iconName && hasUiIcon(m.iconName) ? <UiIcon name={m.iconName} size={20} /> : <CatIcon id={catId} size={20} />}
                  </span>
                  <h3>{t.name}</h3>
                  <p>{t.desc}</p>
                  <div className={styles.cvEx}>
                    <span>{m.example.label}</span>
                    <b>{m.example.value}<small>{m.example.unit}</small></b>
                    <em>{m.example.caption}</em>
                  </div>
                  <span className={styles.cvGo}>내 조건으로 계산<UiIcon name="chev-r" size={16} /></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {groups.map((g, gi) => (
          <Fragment key={g.id}>
          {gi === 2 && <AdSlot position="between-tools" />}
          <section className={styles.cvSec} id={g.id} aria-labelledby={`${g.id}-h`}>
            <div className={styles.cvSecH}><h2 id={`${g.id}-h`}>{g.name}</h2><span>{g.tools.length}</span></div>
            {g.blurb && <p className={styles.cvSecD}>{g.blurb}</p>}
            <div className={styles.cvGrid}>
              {g.tools.slice(0, GROUP_VISIBLE).map((t) => <Row key={t.href} t={t} catId={catId} badge={g.badges.get(t.href)} />)}
            </div>
            {g.tools.length > GROUP_VISIBLE && (
              <details className={styles.cvMore}>
                <summary>{g.name} {g.tools.length - GROUP_VISIBLE}개 더 보기<UiIcon name="chev-d" size={16} /></summary>
                <div className={styles.cvGrid}>
                  {g.tools.slice(GROUP_VISIBLE).map((t) => <Row key={t.href} t={t} catId={catId} badge={g.badges.get(t.href)} />)}
                </div>
              </details>
            )}
          </section>
          </Fragment>
        ))}

        <CategoryGuide catId={catId} />

        <section className={styles.cvSec} aria-labelledby="cv-other-h">
          <div className={styles.cvSecH}><h2 id="cv-other-h">다른 분야 둘러보기</h2></div>
          <div className={styles.cvOther}>
            {categories.filter((c) => c.id !== catId).map((c) => (
              <Link key={c.id} className={styles.cvOtherT} data-cat={c.id} href={`/tools/${c.id}`}>
                <span className="ui-chipIc ui-sm" aria-hidden="true"><CatIcon id={c.id} size={16} /></span>
                <span>{c.name}{c.tagline && <small>{c.tagline}</small>}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
