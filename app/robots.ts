import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // API 라우트(JSON·바이너리)는 색인 대상이 아님 — 크롤 예산 낭비 방지.
      // 응답 자체에도 X-Robots-Tag: noindex를 붙인다(app/api/_lib/http.ts).
      // 참고: Mediapartners-Google(애드센스)·AdsBot은 '*' 규칙을 따르지 않으므로 영향 없음.
      // 렌더링 시 /api 호출(시세·시각)은 크롤러에서 실패해도 각 도구가 폴백 값으로 정상 표시된다.
      disallow: '/api/',
    },
    sitemap: 'https://youtil.kr/sitemap.xml',
    host: 'https://youtil.kr',
  }
}
