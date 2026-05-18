import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'unit')!

export const metadata = buildMetadata({
  path: '/tools/unit',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function UnitCategoryPage() {
  return (
    <CategoryView
      catId="unit"
      description="길이·무게부터 한국 전통 단위(자·근·돈·평·홉)까지 — 일상에서 자주 쓰는 모든 변환."
    />
  )
}
