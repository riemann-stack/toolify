/* components/ToolIconBadge.tsx — 도구 상세 h1 앞 분야 아이콘 칩 (스펙 §10.14 · §12, 200페이지 제자리 재스타일)
   ─ props 불변(catId). 이모지 대신 분야 라인 아이콘을 .ui-chipIc(soft 배경 + base 아이콘) 안에 넣는다.
   ─ 색은 data-cat 스코프의 --c / --c-soft (globals.css) — --accent는 건드리지 않는다.
   ─ h1 인라인 스타일은 그대로 두고 인라인 그리드 요소로 제목 흐름에 얹힌다.
   ─ 코드모드 D가 헤더를 <ToolHeader>로 바꾸면 호출부가 사라진다 → 그때 파일 삭제. */
import { categories } from '@/lib/tools'
import CatIcon from './CatIcon'

export default function ToolIconBadge({ catId }: { catId: string }) {
  if (!categories.some(c => c.id === catId)) return null
  return (
    <span
      aria-hidden="true"
      className="ui-chipIc"
      data-cat={catId}
      style={{ display: 'inline-grid', verticalAlign: 'middle', marginRight: 12 }}
    >
      <CatIcon id={catId} size={20} />
    </span>
  )
}
