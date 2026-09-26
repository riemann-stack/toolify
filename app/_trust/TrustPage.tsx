/* app/_trust/TrustPage.tsx (server) — 신뢰·정책 텍스트 페이지 공용 틀 (Trust Ledger)
   머리(아이브로우·H1·리드·메타) → 흰 본문 시트(.prose — h2 자동 번호) → 운영 문서 내비.
   ─ 광고 없음: 이 틀을 쓰는 경로는 lib/ads 의 AD_ALLOWED_PATHS(실재 도구 경로)에 없어 AutoAds·AdSlot이 렌더되지 않는다.
   ─ 운영자 표기는 components/SiteJsonLd 의 SITE_OPERATOR(= lib/toolMeta AUTHOR) 단일 소스 — '편집팀' 표기 금지.
   `app/_trust`는 밑줄 폴더(Next private folder)라 라우트가 아니다. */
import Link from 'next/link'
import type { ReactNode } from 'react'
import UiIcon from '@/components/UiIcon'
import { SITE_OPERATOR } from '@/components/SiteJsonLd'
import s from './trust.module.css'

export interface TrustTocItem { id: string; label: string }

/** 운영 문서 — 푸터 'Youtil'·'정책' 열과 같은 집합. 새 문서를 만들면 여기와 푸터에 함께 추가 */
export const TRUST_DOCS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/about', label: '소개' },
  { href: '/editorial-policy', label: '편집·검산 원칙' },
  { href: '/updates', label: '업데이트 기록' },
  { href: '/ads-policy', label: '광고 게재 원칙' },
  { href: '/contact', label: '문의·오류 제보' },
  { href: '/privacy', label: '개인정보처리방침' },
  { href: '/terms', label: '이용약관' },
  { href: '/disclaimer', label: '면책조항' },
]

/** '2026-09-26' → '2026.09.26' (Date 파싱 없이 문자열만 — UTC 해석 버그 회피) */
export function dot(iso: string): string {
  return iso.replace(/-/g, '.')
}

export interface TrustPageProps {
  /** 현재 경로 — 운영 문서 내비의 aria-current */
  path: string
  eyebrow: string
  icon?: string
  title: string
  lead?: ReactNode
  /** 메타 한 줄 항목들(작성자·최종 업데이트 등) — 데이터로 뒷받침되는 값만 */
  meta?: ReactNode[]
  toc?: TrustTocItem[]
  /** 목차 번호(01…)를 붙일지 — 원문에 이미 조·항 번호가 있는 법률 문서는 false */
  tocNumbered?: boolean
  /** 880 와이드(표 위주 문서) */
  wide?: boolean
  children: ReactNode
}

export default function TrustPage({ path, eyebrow, icon, title, lead, meta, toc, tocNumbered = true, wide, children }: TrustPageProps) {
  return (
    <div className={wide ? `${s.page} ${s.wide}` : s.page}>
      <header className={s.head}>
        <p className={s.eyebrow}>{icon && <UiIcon name={icon} size={16} />}{eyebrow}</p>
        <h1 className={s.title}>{title}</h1>
        {lead && <p className={s.lead}>{lead}</p>}
        {meta && meta.length > 0 && (
          <p className={s.meta}>{meta.map((m, i) => <span key={i}>{m}</span>)}</p>
        )}
      </header>

      <div className={`${s.sheet} prose`}>
        {toc && toc.length > 1 && (
          <nav className={`${s.toc} ${tocNumbered ? '' : s.tocPlain} ${toc.length > 6 ? s.tocCols : ''}`} aria-label="목차">
            <b>이 문서의 목차</b>
            <ol>{toc.map(t => <li key={t.id}><a href={`#${t.id}`}>{t.label}</a></li>)}</ol>
          </nav>
        )}
        {children}
      </div>

      <nav className={s.docs} aria-label="Youtil 운영 문서">
        <p className={s.docsL}>운영 문서</p>
        <ul>
          {TRUST_DOCS.map(d => (
            <li key={d.href}>
              <Link href={d.href} aria-current={d.href === path ? 'page' : undefined}>{d.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** 메타 줄의 작성자 항목 — '작성 리만 · Youtil 운영자' */
export function AuthorMeta({ verb = '작성' }: { verb?: string }) {
  return (
    <>
      <span className={s.metaAvatar} aria-hidden="true">{SITE_OPERATOR.name.slice(0, 1)}</span>
      {verb} <b>{SITE_OPERATOR.name}</b> · {SITE_OPERATOR.role}
    </>
  )
}

/** 운영자 카드 — 아바타 '리' + 이름·역할 + 한 줄 설명 (+ 선택: 소개 링크) */
export function OperatorCard({ sub, link = false }: { sub: ReactNode; link?: boolean }) {
  return (
    <div className={s.who}>
      <span className={s.avatar} aria-hidden="true">{SITE_OPERATOR.name.slice(0, 1)}</span>
      <span className={s.whoBody}>
        <span className={s.whoName}>{SITE_OPERATOR.name} · {SITE_OPERATOR.role}</span>
        <span className={s.whoSub}>{sub}</span>
      </span>
      {link && (
        <Link className={s.whoLink} href={SITE_OPERATOR.url}>운영자 소개<UiIcon name="chev-r" size={16} /></Link>
      )}
    </div>
  )
}
