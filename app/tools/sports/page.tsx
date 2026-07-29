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
      description="러닝·골프·축구·웨이트 — VDOT·1RM·WHS 핸디캡까지 한국 대회 기준으로 정확하게."
    />
  )
}
