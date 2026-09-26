/* 사이트 전역 구조화 데이터 — WebSite(+SearchAction) · Organization (스펙 §10.22)
   app/layout.tsx <body>에서 1회 렌더. 모든 페이지에 공통 적용.
   원칙: 화면에 보이는 사실과 같은 값만 넣는다.
   ─ founder = 리만(필명, 1인 운영) — app/about "리만이 혼자 만들고 운영하는 1인 무료 웹서비스", app/contact 운영자 정보와 일치
   ─ contactPoint = contact@youtil.kr — 푸터·about·contact에 공시된 주소
   ─ sameAs 없음: 실존하는 공식 외부 프로필이 생기기 전에는 넣지 않는다(가짜 신호 금지)
   ─ WebSite·Organization 을 한 <script>의 @graph 로 묶는다 — WebSite.publisher → Organization @id 참조가
     같은 문서 안에서 해석된다(스크립트 두 개로 나누면 도구마다 연결 해석이 달라질 수 있음).
     도구 JSON-LD(AutoToolJsonLd)도 같은 @id(ORGANIZATION_ID)를 참조할 수 있다 */

const BASE = 'https://youtil.kr'

/** 운영자 — 푸터 운영자 줄과 JSON-LD founder 의 단일 소스.
 *  lib/toolMeta.ts 의 AUTHOR(바이라인용)와 반드시 같은 값 — '편집팀' 표기 금지. */
export const SITE_OPERATOR = {
  name: '리만',
  role: 'Youtil 운영자',
  url: '/about',
  email: 'contact@youtil.kr',
} as const

export const ORGANIZATION_ID = `${BASE}/#organization`
export const WEBSITE_ID = `${BASE}/#website`

const WEBSITE = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: 'Youtil',
  // 사이트 이름 후보 — 선호 순서 배열 (구 합성 문자열 '유틸 · youtil.kr' 교체, SEO-03)
  alternateName: ['유틸', 'youtil.kr'],
  url: BASE,
  inLanguage: 'ko-KR',
  description: '금융·건강·요리·생활·스포츠·주거·단위 변환·날짜·예술·교육·개발 11개 분야의 무료 생활 계산기 모음. 로그인 없이 바로 쓸 수 있습니다.',
  publisher: { '@id': ORGANIZATION_ID },
  // /tools?q= 는 ToolsBrowser가 실제로 처리한다 (사이트링크 검색창은 폐지됐지만 무해)
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
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Youtil',
  url: BASE,
  // Google은 Organization 로고에 정사각형(최소 112×112)을 권장 — 1200×630 OG 배너 대신 앱 아이콘 사용
  logo: `${BASE}/icon-512.png`,
  email: SITE_OPERATOR.email,
  founder: {
    '@type': 'Person',
    name: SITE_OPERATOR.name,
    jobTitle: SITE_OPERATOR.role,
    url: `${BASE}${SITE_OPERATOR.url}`,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: SITE_OPERATOR.email,
    availableLanguage: ['ko'],
    url: `${BASE}/contact`,
  },
}

const SITE_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [WEBSITE, ORGANIZATION],
}

export default function SiteJsonLd() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_GRAPH) }} />
}
