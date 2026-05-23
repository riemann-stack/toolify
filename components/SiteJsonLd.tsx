/* 사이트 전역 구조화 데이터 — WebSite(+SearchAction) · Organization
   app/layout.tsx <body>에서 1회 렌더. 모든 페이지에 공통 적용. */

const BASE = 'https://youtil.kr'

const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Youtil',
  alternateName: '유틸 · youtil.kr',
  url: BASE,
  inLanguage: 'ko-KR',
  description: '금융·건강·생활·날짜·변환·개발자 도구까지 — 로그인 없이 즉시 쓰는 무료 온라인 계산기 모음.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE}/tools?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Youtil',
  url: BASE,
  logo: `${BASE}/opengraph-image.png`,
}

export default function SiteJsonLd() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }} />
    </>
  )
}
