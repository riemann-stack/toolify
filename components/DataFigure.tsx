/* components/DataFigure.tsx — 데이터 표 래퍼 (스펙 §10.4): '표 N.' 캡션 + 단위 + .tableScroll + 자료 줄
   children은 평범한 <table>(th/td 인라인 스타일 없이, th에 scope). 표 안 보조 클래스(전역 이름):
     tr.here = 사용자 입력과 같은 행(soft 배경 + 좌측 3px 블루 + '입력값' 라벨 — 색 외 단서) · td.em 강조 열 · .r 우측 정렬 · .wrap 줄바꿈 허용
   390px에서 4열까지 스크롤 없이 들어가도록 셀 패딩 10(≤380은 8). 5열 이상은 가로 스크롤. */
import type { ReactNode } from 'react'
import styles from './DataFigure.module.css'

export interface DataFigureProps {
  n: number            // 표 번호 (페이지 안 순서)
  title: string        // '2026년 연봉별 월 실수령액'
  unit?: string        // '단위: 원' 등 캡션 우측
  source?: ReactNode   // <>자료: 국세청 간이세액표<Ref n={1}/> — Youtil 계산</>
  children: ReactNode  // <table>
}

export default function DataFigure({ n, title, unit, source, children }: DataFigureProps) {
  return (
    <figure className={styles.df}>
      <figcaption className={styles.dfCap}>
        <span className={styles.dfCapT}><b>표 {n}.</b>{title}</span>
        {unit && <span className={styles.dfCapU}>{unit}</span>}
      </figcaption>
      {/* 가로로 넘치는 표를 키보드로도 스크롤할 수 있게(Safari 등) 포커스 가능한 이름 있는 영역 */}
      <div className={`tableScroll ${styles.dfBox}`} tabIndex={0} role="region" aria-label={`표 ${n}. ${title}`}>{children}</div>
      {source && <p className={styles.dfSrc}>{source}</p>}
    </figure>
  )
}
