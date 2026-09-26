import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior',
  title: '인테리어 계산기 — 도배·페인트·바닥재·조명·전기',
  description: '셀프 인테리어와 시공 견적을 위한 계산기 모음. 도배 벽지 롤 수, 페인트·바닥재 소요량, 조명·에어컨 평형·전선·배관 규격을 무료로 계산합니다.',
})

export default function InteriorCategoryPage() {
  return (
    <CategoryView
      catId="interior"
      description="면적 실측부터 도배·페인트·바닥재 물량, 냉난방 용량, 나사·전선 규격까지 집을 고치고 꾸밀 때 필요한 계산을 모았습니다."
    />
  )
}
