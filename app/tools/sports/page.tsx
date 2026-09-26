import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/sports',
  title: "스포츠 계산기 — 러닝 페이스·골프·등산·수영",
  description: "러닝 페이스와 VO₂max, 인터벌 훈련부터 골프 거리·핸디캡, 등산 소요 시간, 수영 페이스까지 기록 향상을 돕는 무료 스포츠 계산기 모음.",
})

export default function SportsCategoryPage() {
  return (
    <CategoryView
      catId="sports"
      description="러닝 페이스와 기록 예측, 근력 운동 중량, 골프 핸디캡처럼 운동 기록을 숫자로 관리하는 계산기입니다."
    />
  )
}
