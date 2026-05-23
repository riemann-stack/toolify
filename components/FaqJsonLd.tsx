/* FAQPage 구조화 데이터 — 페이지 FAQ 배열을 그대로 받아 JSON-LD 생성.
   답변에 포함된 HTML 태그는 제거해 순수 텍스트로 변환합니다.
   사용: 페이지의 FAQ 데이터를 const로 추출 후 <FaqJsonLd items={faqs} /> 렌더. */

interface FaqItem { q: string; a: string }

function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export default function FaqJsonLd({ items }: { items: FaqItem[] }) {
  if (!items || items.length === 0) return null
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: stripHtml(it.q),
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(it.a) },
    })),
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
