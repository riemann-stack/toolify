/* 도구 상세 h1 앞 카테고리 아이콘 배지 — 이모지 대체.
   OS별로 다르게 렌더링되던 h1 이모지를 카테고리 라인 아이콘(카테고리색 틴트 박스)으로
   통일 — 홈 벤토 타일·카테고리 허브 히어로와 같은 문법. h1 인라인 스타일은 불변,
   인라인 요소로 텍스트 흐름에 얹힌다. */

import { categories } from '@/lib/tools'
import CatIcon from './CatIcon'

export default function ToolIconBadge({ catId }: { catId: string }) {
  const cat = categories.find(c => c.id === catId)
  if (!cat) return null
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        borderRadius: 10,
        background: `color-mix(in srgb, ${cat.color} 12%, var(--bg2))`,
        color: cat.color,
        verticalAlign: 'middle',
        marginRight: 12,
        flexShrink: 0,
      }}
    >
      <CatIcon id={catId} size={20} />
    </span>
  )
}
