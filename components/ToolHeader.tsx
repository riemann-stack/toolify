/* components/ToolHeader.tsx (server) — 도구 머리: 아이브로우(분야 칩·이름·하위 분류) → H1 → 리드 → 메타 한 줄 (스펙 §10.2)
   ToolIconBadge + 대문자 eyebrow <p> + h1 + lead <p> + <UpdatedMeta>를 대체한다(코드모드 D, AST — 이후 단계).
   메타 한 줄(ToolByline)은 레거시 머리에도 <ToolPage>가 자동으로 붙인다:
     [기준 점검 2026.07 | 최종 업데이트 2026.09.20] · [검산 · 골든 테스트 N건] · 작성 리만 (Youtil 운영자) · 공식 출처 N건
   ─ 정직성: 날짜는 toolMeta(사람이 적은 점검일 → 없으면 git 최종 업데이트), '검산'은 골든 테스트가 통과한 도구만,
             출처 N건은 #refs(본문 시트의 참고 자료)로 이동. 값이 없으면 그 항목을 그리지 않는다. */
import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import styles from './ToolHeader.module.css'
import UiIcon, { hasUiIcon } from './UiIcon'
import CatIcon from './CatIcon'
import { categories } from '@/lib/tools'
import { AUTHOR, catOf, getToolMeta, metaDate, verifiedLabel, type ToolMeta } from '@/lib/toolMeta'

export interface ToolBylineProps {
  meta: ToolMeta
  /** 날짜 항목 표시(UpdatedMeta가 이미 날짜를 보여 주면 false) */
  showDate?: boolean
  /** '공식 출처 N건' 표시(UpdatedMeta가 이미 출처 링크를 보여 주면 false) */
  showSources?: boolean
  /** #refs 앵커가 페이지에 있는가(없으면 숫자만) */
  refsAnchor?: boolean
  /** true = 감싸는 요소 없이 <span> 항목만(UpdatedMeta 줄 안에 이어 붙일 때) */
  inline?: boolean
  /** 감싸는 div에 더할 클래스(ToolPage 레거시 머리 여백 보정) */
  className?: string
}

/** 메타 한 줄 — ToolHeader·ToolPage(레거시 머리)·UpdatedMeta(byline)가 공유 */
export function ToolByline({ meta, showDate = true, showSources = true, refsAnchor = true, inline = false, className }: ToolBylineProps) {
  const d = showDate ? metaDate(meta) : null
  const v = meta.verified
  const n = meta.sources.length
  const items: ReactNode[] = []
  if (d) items.push(<span key="d" className={styles.thDate}><UiIcon name="clock" size={16} /><time dateTime={d.iso}>{d.text}</time></span>)
  if (v) items.push(<span key="v" className={styles.thVerified}><UiIcon name="shield" size={16} />{verifiedLabel(v)}<span className={styles.thCases}> · 골든 테스트 {v.cases}건</span></span>)
  items.push(<span key="a">작성 <Link href={AUTHOR.url}>{AUTHOR.name}</Link> ({AUTHOR.role})</span>)
  if (showSources && n > 0) items.push(<span key="s">공식 출처 {refsAnchor ? <a href="#refs">{n}건</a> : `${n}건`}</span>)
  if (inline) return <>{items}</>
  return (
    <div className={className ? `${styles.thMeta} ${className}` : styles.thMeta}>
      {items.map((it, i) => <Fragment key={i}>{i > 0 && <i className={styles.thSep} aria-hidden="true" />}{it}</Fragment>)}
    </div>
  )
}

export interface ToolHeaderProps {
  slug: string        // '/tools/finance/salary'
  title: string       // H1 (도구명)
  lead: ReactNode     // 1~2문장: 무엇을 넣으면 무엇이 나오는지. 핵심어만 <b>
}

export default function ToolHeader({ slug, title, lead }: ToolHeaderProps) {
  const catId = catOf(slug)
  const cat = categories.find(c => c.id === catId)
  const meta = getToolMeta(slug)
  const icon = meta?.iconName && hasUiIcon(meta.iconName) ? meta.iconName : undefined
  return (
    <header className={styles.th} data-cat={cat ? catId : undefined}>
      {cat && (
        <div className={styles.thEyebrow}>
          <span className="ui-chipIc ui-sm" aria-hidden="true">{icon ? <UiIcon name={icon} size={16} /> : <CatIcon id={catId} size={16} />}</span>
          <Link href={`/tools/${catId}`}>{cat.name}</Link>
          {meta?.group && <span className={styles.thSub}>· {meta.group}</span>}
        </div>
      )}
      <h1 className={styles.thTitle}>{title}</h1>
      <p className={styles.thLead}>{lead}</p>
      {meta && <ToolByline meta={meta} />}
    </header>
  )
}
