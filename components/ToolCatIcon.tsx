/* 도구 아이콘 = 소속 카테고리 라인 아이콘(카테고리 색).
   OS마다 다르게 렌더링되는 도구별 이모지를 대체 — 검색 결과·칩·드로어 공용.
   도구별 개별 아이콘 매핑(186종) 대신 카테고리 11종으로 통일한 의도적 결정. */

import { categories } from '@/lib/tools'
import CatIcon from './CatIcon'

const catByHref = new Map<string, { id: string; color: string }>()
for (const c of categories) for (const t of c.tools) catByHref.set(t.href, { id: c.id, color: c.color })

export default function ToolCatIcon({ href, size = 16 }: { href: string; size?: number }) {
  const cat = catByHref.get(href)
  if (!cat) return null
  return (
    <span
      style={{ color: cat.color, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
      aria-hidden="true"
    >
      <CatIcon id={cat.id} size={size} />
    </span>
  )
}
