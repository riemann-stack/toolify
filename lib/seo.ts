import type { Metadata } from 'next'

const SITE_NAME = 'Youtil'
const SUFFIX = ` | ${SITE_NAME}`

export interface SEOInput {
  /** 절대 경로 — 선행 슬래시 포함 (예: '/tools/finance/salary')
   *  metadataBase가 layout.tsx에 설정되어 있어 자동으로 https://youtil.kr 로 확장됨 */
  path: string
  /** 페이지 타이틀. ' | Youtil' 접미사는 자동 처리됨 (template + manual) */
  title: string
  /** 검색·OG 설명 (160자 권장) */
  description: string
  /** 검색 키워드 배열 */
  keywords?: string[]
  /** 검색 엔진 노출 차단 (404 등) */
  noIndex?: boolean
}

/**
 * 페이지별 metadata 빌더 — canonical / openGraph / twitter 자동 구성.
 * - root layout의 title.template과 충돌 방지: 입력에 ' | Youtil' 있으면 자동 제거
 * - openGraph.title 과 twitter.title 은 풀 형태(' | Youtil' 포함)로 생성
 *   (소셜 카드는 브랜드 인지가 중요하므로 풀 타이틀 사용)
 * - openGraph.url 과 alternates.canonical 은 path 그대로 — metadataBase가 풀 URL로 확장
 */
export function buildMetadata({
  path,
  title,
  description,
  keywords,
  noIndex,
}: SEOInput): Metadata {
  // template과 충돌 방지 — 입력에 이미 ' | Youtil'이 있으면 제거 후 template에 맡김
  const cleanTitle = title.endsWith(SUFFIX) ? title.slice(0, -SUFFIX.length) : title
  const fullTitle = cleanTitle + SUFFIX

  return {
    title: cleanTitle,
    description,
    ...(keywords && { keywords }),
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
      // images는 app/opengraph-image.png 가 자동 적용
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}
