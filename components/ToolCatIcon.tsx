/* components/ToolCatIcon.tsx — 도구 href → 소속 분야 라인 아이콘 (검색 결과·칩·드로어·컬렉션 공용)
   ─ 기본(variant 생략) = 기존과 같은 '분야색 아이콘만' 렌더 — 호출부 4곳 호환.
   ─ 스펙 §12: 분야 아이콘은 .ui-chipIc(soft 배경 + base 아이콘) 안에 두는 것이 원칙 → 새 코드는 variant="chip" | "chip-sm".
   ─ 클라이언트 컴포넌트(HomeClient·ToolsBrowser)에서도 쓰이므로 lib/toolMeta(서버 전용 JSON)를 import하지 않는다
     — 도구별 아이콘(toolMeta.iconName)은 서버 컴포넌트(RelatedTools·ToolHeader)에서만 쓴다. */
import { categories } from '@/lib/tools'
import CatIcon from './CatIcon'

const catByHref = new Map<string, { id: string; color: string }>()
for (const c of categories) for (const t of c.tools) catByHref.set(t.href, { id: c.id, color: c.color })

export default function ToolCatIcon({ href, size = 16, variant = 'plain' }: { href: string; size?: number; variant?: 'plain' | 'chip' | 'chip-sm' }) {
  const cat = catByHref.get(href)
  if (!cat) return null
  if (variant !== 'plain') {
    return (
      <span className={variant === 'chip-sm' ? 'ui-chipIc ui-sm' : 'ui-chipIc'} data-cat={cat.id} aria-hidden="true">
        <CatIcon id={cat.id} size={variant === 'chip-sm' ? 16 : size} />
      </span>
    )
  }
  return (
    <span
      style={{ color: cat.color, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
      aria-hidden="true"
    >
      <CatIcon id={cat.id} size={size} />
    </span>
  )
}
