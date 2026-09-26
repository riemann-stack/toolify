/* components/UpdatedMeta.tsx — (과도기) 도구 머리의 기준 점검·기준·출처 한 줄 (스펙 §10.13, 86페이지 제자리 재스타일)
   ─ props 불변: date · basis · sources. 박스형 → ToolHeader 메타와 같은 한 줄 모양.
   ─ basis(적용 기준, YMYL)는 자르지 않고 전문을 DOM에 둔다 — 스크린리더·터치 기기는 전문, 마우스 환경(hover)만 CSS 2줄 접힘 + title.
   ─ date는 사람이 적은 점검 시점('2026년 7월') — '기준 점검'으로 표기(검산·검수 아님). lib/toolMeta의 reviewed도 이 값에서 생성된다.
   ─ byline(선택): <ToolPage>가 cloneElement로 넣는 작성자·검산 표기(ToolByline inline). 페이지는 직접 넘기지 않는다.
   ─ 코드모드 D가 <ToolHeader>로 흡수하면 호출부가 사라진다. */
import type { ReactNode } from 'react'
import styles from './UpdatedMeta.module.css'
import UiIcon from './UiIcon'

export interface MetaSource {
  label: string
  href: string
}

interface Props {
  /** 최종 검토 시점. 예: "2026년 5월" */
  date: string
  /** 기준 근거. 예: "2026년 종합소득세율 기준" */
  basis?: string
  /** 공식 출처 링크 */
  sources?: MetaSource[]
  /** (ToolPage 전용) 같은 줄 끝에 붙는 작성자·검산 표기 */
  byline?: ReactNode
}

/** 이보다 길면 마우스 환경에서 2줄로 접히므로 title로 전문을 보여 준다(접힘은 CSS만 — 전문은 항상 DOM에 있다) */
const BASIS_LONG = 60

export default function UpdatedMeta({ date, basis, sources, byline }: Props) {
  return (
    <p className={styles.um}>
      <span className={styles.umDate}><UiIcon name="clock" size={16} />{date} 기준 점검</span>
      {basis && <span className={styles.umBasis} title={basis.length > BASIS_LONG ? basis : undefined}>{basis}</span>}
      {sources && sources.length > 0 && (
        <span className={styles.umSrc}>
          출처{' '}
          {sources.map((s, i) => (
            <span key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}<span className="srOnly">(새 창)</span></a>
              {i < sources.length - 1 && ' ·'}
            </span>
          ))}
        </span>
      )}
      {byline}
    </p>
  )
}
