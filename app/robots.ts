import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://youtil.kr/sitemap.xml',
    host: 'https://youtil.kr',
  }
}
