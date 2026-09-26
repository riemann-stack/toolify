import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // 페이지 렌더링에 필요한 API는 허용 — Googlebot(WRS)은 렌더링 중 JS fetch에도 robots.txt를 적용한다.
      // 막으면 렌더된 본문에 오류 상태가 색인된다:
      //   /api/time          → server-time·network-test 시각 동기화 ('서버 동기화 실패' 표시)
      //   /api/produce-price → kimjang·holiday-table 시세 ('시세 조회 실패' 표시)
      // Google은 가장 긴 규칙이 이기므로 아래 Allow가 Disallow: /api/ 보다 우선한다(쿼리스트링 포함 접두 매칭).
      allow: ['/', '/api/time', '/api/produce-price'],
      // 그 밖의 API(사용자 입력으로만 호출 — og-preview·proxy-time·speedtest)는 크롤 대상이 아님(크롤 예산 절약).
      // 응답 자체에도 X-Robots-Tag: noindex를 붙인다(app/api/_lib/http.ts) — 허용한 두 API도 색인되지는 않는다.
      // 참고: Mediapartners-Google(애드센스)·AdsBot은 '*' 규칙을 따르지 않으므로 영향 없음.
      disallow: '/api/',
    },
    sitemap: 'https://youtil.kr/sitemap.xml',
    host: 'https://youtil.kr',
  }
}
