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
      description="길이·무게·온도·평형·해외 사이즈·배터리·연비·타이어 공기압까지 — 한국 전통 단위(자·근·돈·평·홉·되) 포함 종합 변환."
    />
  )
}
