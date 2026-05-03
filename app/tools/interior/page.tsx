import CategoryView, { type ComingSoonItem } from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior',
  title: '인테리어 계산기 — 도배·페인트·바닥재·타일 소요량',
  description: '셀프 인테리어와 시공 견적을 위한 계산기 모음. 도배 벽지 롤 수, 페인트·바닥재·타일 소요량, 인테리어 비용 견적을 무료로 계산합니다.',
  keywords: ['인테리어계산기', '셀프인테리어', '시공견적', '도배계산기', '페인트소요량', '인테리어비용'],
})

const COMING_SOON: ComingSoonItem[] = [
  { icon: '🟦', name: '타일 소요량 계산기',       desc: '면적·줄눈·로스율 반영 박스 수' },
  { icon: '🪟', name: '셀프 줄눈·실리콘 견적',     desc: '욕실·주방 보수 자재량' },
  { icon: '🌡️', name: '단열재 두께 계산기',       desc: '벽체·지붕 부위별 R값' },
  { icon: '🧰', name: '시공 일정 캘린더',         desc: '도배·바닥·페인트 순서·기간' },
]

export default function InteriorCategoryPage() {
  return (
    <CategoryView
      catId="interior"
      description="도배·페인트·바닥재·커튼·조명·에어컨까지 — 셀프 인테리어와 시공 견적을 위한 정확한 소요량·비용 계산기 모음."
      comingSoon={COMING_SOON}
    />
  )
}
