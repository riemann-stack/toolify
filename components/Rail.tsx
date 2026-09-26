/* components/Rail.tsx (server) — 데스크톱 레일(≥1200) '이 계산기의 기준' 카드 (스펙 §10.7). 미니 결과·목차는 RailClient.tsx
   값은 전부 lib/toolMeta — 없는 행은 그리지 않는다(지어내지 않음). 오류 제보 메일 제목에 slug 자동 삽입. */
import styles from './Rail.module.css'
import UiIcon from './UiIcon'
import { AUTHOR, dotDate, type ToolMeta } from '@/lib/toolMeta'
export { RailResult, RailToc } from './RailClient'

export function BasisCard({ meta, hasRefs }: { meta: ToolMeta; hasRefs: boolean }) {
  const v = meta.verified
  return (
    <section className={`${styles.rlCard} ${styles.rlBasis}`} aria-labelledby="basis-t">
      <h2 className={styles.rlTitle} id="basis-t"><UiIcon name="file" size={16} />이 계산기의 기준</h2>
      <dl>
        {meta.reviewed && (<><dt>기준 점검</dt><dd>{dotDate(meta.reviewed)}</dd></>)}
        {meta.updated && (<><dt>업데이트</dt><dd>{dotDate(meta.updated)}</dd></>)}
        {meta.basis && (<><dt>적용 기준</dt><dd className={styles.rlClamp} title={meta.basis}>{meta.basis}</dd></>)}
        {v && (<><dt>검산</dt><dd className={styles.rlOk}>골든 테스트 {v.cases}건 통과{v.full ? '' : <small>{v.scope} 범위</small>}</dd></>)}
        {meta.sources.length > 0 && (<><dt>출처</dt><dd>{hasRefs ? <a href="#refs">공식 자료 {meta.sources.length}건</a> : `공식 자료 ${meta.sources.length}건`}</dd></>)}
        <dt>작성</dt><dd>{AUTHOR.name} ({AUTHOR.role})</dd>
      </dl>
      <p className={styles.rlReport}>
        결과가 다른가요?
        <a href={`mailto:${AUTHOR.email}?subject=${encodeURIComponent('[오류 제보] ' + meta.slug)}`}>오류 제보<UiIcon name="chev-r" size={14} /></a>
      </p>
    </section>
  )
}
