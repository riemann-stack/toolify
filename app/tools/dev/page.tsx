import { categories } from '@/lib/tools'
import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

const cat = categories.find((c) => c.id === 'dev')!

export const metadata = buildMetadata({
  path: '/tools/dev',
  title: `${cat.name} 계산기 모음`,
  description: `${cat.tools.map((t) => t.name).join(', ')} 등 ${cat.name} 무료 도구 모음.`,
})

export default function DevCategoryPage() {
  return (
    <CategoryView
      catId="dev"
      description="JSON 포맷·Base64·색상·CSS·진법·글자수까지 — 개발자가 매일 찾는 텍스트·디자인 변환 유틸 모음."
    />
  )
}
