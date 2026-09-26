/* components/Article.tsx (server) — 가이드 본문 시트 ArticleSheet + 본문 각주 Ref (스펙 §10.6)
   <ToolPage>가 GuideDivider 이후를 자동으로 감싼다(페이지 수정 없이).
   ─ 머리: 킥커 '가이드' → 제목(data-nonum) → 바이라인(아바타 · 리만 작성[·검산] · Youtil 운영자 소개 / 최종 업데이트 · 읽는 시간) → 목차(<1200, toc가 있을 때만 서버 렌더)
   ─ 조판은 전역 :where(.prose)(특이도 0) — className에 'prose'를 함께 단다. h2 앞 01·02…는 CSS counter.
   ─ 정직성: '검산'은 toolMeta.verified.full일 때만, 날짜는 git 최종 업데이트(지어내지 않음), 작성자는 AUTHOR 단일 상수. */
import Link from 'next/link'
import type { ReactNode } from 'react'
import styles from './Article.module.css'
import UiIcon from './UiIcon'
import { AUTHOR, dotDate, type ToolMeta } from '@/lib/toolMeta'

export interface TocItem { id: string; label: string }

export interface ArticleSheetProps {
  title: string
  meta?: ToolMeta
  toc?: TocItem[]
  /** 레거시(코드모드 G 전) 가이드 → data-article="v1"로 과도기 브리지 CSS(app/styles/bridge.css) 적용 */
  legacy?: boolean
  /** 읽는 시간(분) — ToolPage가 본문 글자 수로 계산해 넘긴다 */
  readMinutes?: number
  children: ReactNode
}

export function ArticleSheet({ title, meta, toc, legacy, readMinutes, children }: ArticleSheetProps) {
  const verifiedFull = meta?.verified?.full === true
  const second = [
    meta?.updated && `최종 업데이트 ${dotDate(meta.updated)}`,
    readMinutes && readMinutes > 0 && `읽는 시간 약 ${readMinutes}분`,
  ].filter(Boolean).join(' · ')
  return (
    <article className={`${styles.ar} prose`} id="guide" aria-labelledby="guide-t" data-article={legacy ? 'v1' : 'v2'}>
      <header className={styles.arHead}>
        <span className={styles.arKicker}><UiIcon name="book" size={16} />가이드</span>
        <h2 className={styles.arTitle} id="guide-t" data-nonum="">{title}</h2>
        <div className={styles.arByline}>
          <span className={styles.arAvatar} aria-hidden="true">{AUTHOR.name.slice(0, 1)}</span>
          <p className={styles.arByText}>
            <b>{AUTHOR.name}</b> 작성{verifiedFull ? '·검산' : ''} · {AUTHOR.role} <Link href={AUTHOR.url}>소개</Link>
            {second && <><br />{second}</>}
          </p>
        </div>
        {toc && toc.length > 1 && (
          <nav className={styles.arToc} aria-label="이 글의 목차">
            <b>이 글의 목차</b>
            <ol>{toc.map(t => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}</ol>
          </nav>
        )}
      </header>
      {children}
    </article>
  )
}

/** 본문 각주 — <Ref n={1} /> → [1] (참고 자료 #src-1로 이동). 번호 = toolMeta.sources 배열 순서 */
export function Ref({ n }: { n: number }) {
  return <sup className={styles.arRef}><a href={`#src-${n}`} aria-label={`참고 자료 ${n}`}>[{n}]</a></sup>
}
