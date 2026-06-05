import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior',
  title: '인테리어 계산기 — 도배·페인트·바닥재·조명·전기',
  description: '셀프 인테리어와 시공 견적을 위한 계산기 모음. 도배 벽지 롤 수, 페인트·바닥재 소요량, 조명·에어컨 평형·전선·배관 규격을 무료로 계산합니다.',
  keywords: ['인테리어계산기', '셀프인테리어', '시공견적', '도배계산기', '페인트소요량', '바닥재계산기', '인테리어비용'],
})

export default function InteriorCategoryPage() {
  return (
    <CategoryView
      catId="interior"
      description="도배·페인트·바닥재부터 조명·전선·배관·철근까지 — 셀프 시공 견적과 자재 소요량을 정확한 단위로."
    />
  )
}
