import CategoryView from '@/components/CategoryView'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/art',
  title: "예술·창작 도구 — 음악·색상·사진·글자수",
  description: "색상 코드 변환과 물감 혼합, BPM·음역대 측정, 카메라 화각, 자기소개서 글자수 세기까지 창작에 필요한 계산을 브라우저에서 바로 쓸 수 있습니다.",
})

export default function ArtCategoryPage() {
  return (
    <CategoryView
      catId="art"
      description="노래 키와 코드, 색상 코드, 사진 노출, 글자수처럼 창작 작업 중에 필요한 변환과 계산을 모았습니다."
    />
  )
}
