/* components/SourceNotes.tsx (server) — 참고 자료(번호 = 본문 <Ref n>) + AboutTool '이 계산기를 만든 방법' (스펙 §10.8)
   본문 시트 마지막(FAQ 다음)에 둔다. <ToolPage>가 페이지 수정 없이 자동으로 붙인다(페이지가 직접 넣으면 그것을 쓴다).
   ─ 참고 자료: toolMeta.sources(페이지 <UpdatedMeta>·<Disclaimer> 출처에서 생성). 없으면 목록을 그리지 않는다.
   ─ AboutTool: 운영자(리만·1인 운영) → 계산 기준 / 검증(골든 테스트가 있을 때만) / 업데이트(금융·건강, git 기록이 있을 때만) / 오류 제보.
     없는 행은 그리지 않는다 — 지어낸 검증·날짜 금지. 응답 시간 문구는 app/contact·푸터와 같게. */
import Link from 'next/link'
import styles from './SourceNotes.module.css'
import UiIcon from './UiIcon'
import { AUTHOR, dotDate, sourceOrg, type ToolMeta } from '@/lib/toolMeta'

export interface SourceNotesProps {
  meta: ToolMeta
  /** 목록 제목 — 페이지에 이미 '참고 자료' 섹션이 있으면 ToolPage가 '공식 출처'로 바꿔 넘긴다 */
  title?: string
  /** false면 참고 자료 목록 없이 AboutTool만 */
  refs?: boolean
  /** 도구별 전체 변경 기록 페이지(/updates) — 페이지가 생기기 전에는 넘기지 않는다(깨진 링크 방지) */
  changelogHref?: string
}

export default function SourceNotes({ meta, title = '참고 자료', refs = true, changelogHref }: SourceNotesProps) {
  const full = meta.ymyl === true
  const v = meta.verified
  const basis = meta.method ?? meta.basis
  const log = full && meta.changelog ? meta.changelog.slice(0, 2) : []
  return (
    <>
      {refs && meta.sources.length > 0 && (<>
        <h2 id="refs">{title}</h2>
        <ol className={styles.snRefs}>
          {meta.sources.map((s, i) => (
            <li key={s.href} id={`src-${i + 1}`}>
              <span>
                <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}<span className="srOnly">(새 창)</span></a>
                {sourceOrg(s) && <small>{sourceOrg(s)}</small>}
              </span>
            </li>
          ))}
        </ol>
      </>)}
      <section className={styles.about} aria-labelledby="about-t">
        <div className={styles.aboutWho}>
          <span className={styles.aboutAvatar} aria-hidden="true">{AUTHOR.name.slice(0, 1)}</span>
          <div>
            <b id="about-t">이 계산기를 만든 사람 · {AUTHOR.name}</b>
            <span>{AUTHOR.role} · 혼자 만들고 운영하는 1인 서비스입니다</span>
          </div>
          <Link href={AUTHOR.url}>운영자 소개<UiIcon name="chev-r" size={14} /></Link>
        </div>
        <dl>
          {basis && (<><dt>계산 기준</dt><dd>{basis}</dd></>)}
          {v && (<>
            <dt>검증</dt>
            <dd>
              {v.full ? '' : `${v.scope} 계산은 `}법령·문헌 기준으로 손계산한 기대값 {v.cases}건을 골든 테스트로 고정해 두고, 코드가 바뀔 때마다 자동으로 대조합니다
              {v.date ? ` (테스트 갱신 ${dotDate(v.date)})` : ''}.
            </dd>
          </>)}
          {log.length > 0 && (<>
            <dt>업데이트</dt>
            <dd>
              <ul className={styles.aboutLog}>
                {log.map(c => <li key={c.date + c.text}><time dateTime={c.date}>{dotDate(c.date)}</time>{c.text}</li>)}
                {changelogHref && <li><Link href={changelogHref}>전체 기록 보기</Link></li>}
              </ul>
            </dd>
          </>)}
          <dt>오류 제보</dt>
          <dd>결과가 다르면 <a href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent('[오류 제보] ' + meta.slug)}`}>{AUTHOR.email}</a>로 입력 조건을 알려 주세요. 평일 기준 1~3일 안에 답변합니다.</dd>
        </dl>
      </section>
    </>
  )
}
