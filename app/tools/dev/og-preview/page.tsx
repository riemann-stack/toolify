import Link from 'next/link'
import OgPreviewClient from './OgPreviewClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/og-preview',
  title: 'OG 미리보기 시뮬레이터 — 카카오톡·페이스북·X·LinkedIn·Slack 동시 확인',
  description:
    'URL이나 HTML을 입력하면 카카오톡·페이스북·X·LinkedIn·Slack에서 어떻게 보일지 동시에 미리보기. og:image 검증·메타태그 생성·카카오톡 캐시 초기화 가이드.',
  keywords: [
    'OG 미리보기', 'Open Graph', '오픈그래프', '메타태그 미리보기',
    '카카오톡 미리보기', '카톡 og:image', '카카오톡 썸네일',
    'Facebook OG', 'Twitter Card', 'X 카드',
    'LinkedIn 미리보기', 'Slack unfurl',
    'og:title', 'og:description', 'og:image',
    'twitter:card', 'summary_large_image',
    '메타태그 생성기', '카카오톡 캐시',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

const FAQ_LD = [
              {
                q: '메타태그를 수정했는데 카카오톡 카드가 그대로예요.',
                a: '카카오톡은 URL당 약 <strong>48시간 캐시</strong>가 적용됩니다. <a href="https://developers.kakao.com/tool/clear/og" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-weight: 600;">카카오 개발자 도구</a>의 "공유 디버거" 또는 "캐시 삭제" 메뉴에 URL을 넣고 캐시를 갱신하세요. Facebook은 <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-weight: 600;">Sharing Debugger</a>, X는 <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-weight: 600;">Card Validator</a>(deprecated 됐으나 일부 동작), LinkedIn은 <a href="https://www.linkedin.com/post-inspector/" target="_blank" rel="noopener noreferrer" style="color: var(--accent); font-weight: 600;">Post Inspector</a>를 사용합니다.',
              },
              {
                q: 'og:image는 어느 크기·비율이 가장 안전한가요?',
                a: '<strong>1200×630px (2:1)</strong>이 가장 보편적입니다. Facebook 권장 1.91:1, 카카오톡 2:1, X 2:1(summary_large_image) — 1200×630 한 장이면 모든 플랫폼에서 잘림 없이 표시됩니다. 파일 형식은 <strong>jpg(사진) 또는 png(텍스트·로고)</strong>, 용량은 <strong>5MB 이하</strong> 권장. 절대 URL(<code style="color: var(--text)">https://example.com/og.png</code>)을 사용해야 하며 상대 경로는 일부 플랫폼에서 표시 실패합니다.',
              },
              {
                q: 'URL 입력 모드에서 "페이지를 불러올 수 없다"고 나옵니다.',
                a: '대상 서버가 봇/스크래퍼를 차단했거나(쿠팡·일부 쇼핑몰), Cloudflare 등 WAF가 우리 요청을 막은 경우입니다. <strong>HTML 붙여넣기 모드</strong>로 전환해 브라우저 페이지 소스(Cmd+U / Ctrl+U)의 <code style="color: var(--text)">&lt;head&gt;</code> 부분을 복사해 붙여넣으면 동일하게 동작합니다.',
              },
              {
                q: 'twitter:card는 꼭 따로 넣어야 하나요?',
                a: 'X(Twitter)는 <code style="color: var(--text)">twitter:*</code> 태그를 우선 사용하며, 없으면 <code style="color: var(--text)">og:*</code>로 폴백합니다. 다만 <strong>twitter:card 선언이 없으면 카드 표시 자체가 안 되는</strong> 경우가 있으므로 <code style="color: var(--text)">&lt;meta name="twitter:card" content="summary_large_image"&gt;</code> 한 줄은 필수에 가깝습니다. summary_large_image는 큰 이미지 카드, summary는 작은 정사각 썸네일 카드.',
              },
              {
                q: 'og:image에 동적 이미지(서버에서 생성)를 써도 되나요?',
                a: '됩니다. Next.js의 <code style="color: var(--text)">opengraph-image.tsx</code>, Vercel OG, Cloudflare Workers의 OG 이미지 생성 등이 흔합니다. 단 <strong>응답 속도 &lt; 3초</strong>, <strong>Cache-Control 적용</strong>, <strong>안정적인 도메인</strong> 사용은 필수. 카카오톡은 응답이 느리면 캐시 갱신을 포기하고 빈 카드를 보여줍니다.',
              },
              {
                q: '같은 페이지를 SNS별로 다르게 보이게 할 수 있나요?',
                a: '가능합니다. <code style="color: var(--text)">og:*</code>는 공통 폴백으로 두고, <code style="color: var(--text)">twitter:title</code>·<code style="color: var(--text)">twitter:description</code>·<code style="color: var(--text)">twitter:image</code>를 별도 지정하면 X에서만 다른 카드가 표시됩니다. Slack은 <code style="color: var(--text)">og:site_name</code>이 큰 영향을 미치므로 브랜드명 명시 권장. LinkedIn은 <code style="color: var(--text)">og:type=article</code>일 때 더 풍부한 카드를 보여줍니다.',
              },
              {
                q: '검색엔진(SEO)에는 OG 태그가 영향을 미치나요?',
                a: '직접적인 검색 순위 영향은 없지만, <strong>간접 효과는 큽니다</strong>. SNS 공유 → 카드가 매력적 → 클릭률 ↑ → 트래픽 ↑ → 백링크 자연 발생. Google은 <code style="color: var(--text)">title</code>·<code style="color: var(--text)">meta description</code>을 우선 보지만, 일부 검색 결과(Discover 등)에서는 <code style="color: var(--text)">og:image</code>를 썸네일로 사용하므로 둘 다 정성껏 작성하세요.',
              },
              {
                q: '검색이 안 되는 사이트에서도 메타태그가 보이나요?',
                a: '검색 노출 여부와 OG는 무관합니다. <code style="color: var(--text)">robots.txt</code>나 <code style="color: var(--text)">noindex</code> 메타로 검색은 차단해도, SNS 공유 카드는 정상 표시됩니다. 반대로 검색은 잘 되는데 OG 카드가 비어 있는 경우도 많으니 — <strong>이 도구로 한 번 확인</strong>하시는 게 좋아요.',
              },
            ]

export default function OgPreviewPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />OG 미리보기 시뮬레이터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>카카오톡·페이스북·X·LinkedIn·Slack</strong>에서 공유했을 때 어떻게 보일지 한 화면에. 메타태그 검증 + 코드 생성까지.
      </p>

      <OgPreviewClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. Open Graph란? */}
        <section>
          <h2 style={sectionTitle}>Open Graph(OG) — 한 줄 요약</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            Open Graph는 2010년 Facebook이 만든 메타데이터 규약으로, <strong style={{ color: 'var(--text)' }}>URL이 공유될 때 어떤 카드로 표시될지</strong>를 페이지 작성자가 직접 지정할 수 있게 합니다.
            카카오톡·Facebook·LinkedIn·Slack·Discord는 모두 OG 태그를 따르고, X(Twitter)만 자체 <code style={{ color: 'var(--text)' }}>twitter:*</code> 태그를 우선 참조(없으면 OG로 폴백).
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
            <li><strong style={{ color: 'var(--text)' }}>og:title</strong> — 카드 헤드라인 (필수)</li>
            <li><strong style={{ color: 'var(--text)' }}>og:description</strong> — 카드 본문 (권장)</li>
            <li><strong style={{ color: 'var(--text)' }}>og:image</strong> — 카드 썸네일 (필수, 1200×630 권장)</li>
            <li><strong style={{ color: 'var(--text)' }}>og:url</strong> — 페이지 canonical URL</li>
            <li><strong style={{ color: 'var(--text)' }}>og:site_name</strong> — 사이트 이름 (카드 하단 도메인 영역에 표시)</li>
            <li><strong style={{ color: 'var(--text)' }}>og:type</strong> — website / article / video.movie 등</li>
            <li><strong style={{ color: 'var(--text)' }}>og:locale</strong> — ko_KR 등 언어 코드</li>
          </ul>
        </section>

        {/* 2. 카카오톡 OG 가이드 */}
        <section>
          <h2 style={sectionTitle}>🇰🇷 카카오톡 OG 가이드 — 가장 까다로움</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            한국에서 가장 중요한 공유 채널이면서 가장 까다로운 곳이 카카오톡입니다. 다음 규칙을 모르면 카드가 표시되지 않거나 깨집니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '이미지 비율', d: '2:1 또는 1.91:1', desc: '1200×630px 권장. 정사각 1:1은 작게 표시.' },
              { t: '이미지 용량', d: '5MB 이하', desc: 'jpg / png / webp 권장. gif는 첫 프레임만.' },
              { t: '캐시', d: '약 48시간', desc: '한 번 캐싱되면 변경이 반영 안 됨 — 캐시 초기화 도구 필수.' },
              { t: 'HTTPS 필수', d: 'http는 무시', desc: 'og:image도 https URL이어야 표시.' },
              { t: '문자 인코딩', d: 'UTF-8', desc: '한글 깨짐 방지 — Content-Type charset 명시.' },
              { t: '리다이렉트', d: '직접 URL 권장', desc: '단축 URL·리다이렉트 체인은 카드 표시 실패 사례 많음.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: '3px solid #FEE500', borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: 12, color: '#FEE500', fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
            💡 메타태그 수정 후 즉시 반영하려면{' '}
            <a href="https://developers.kakao.com/tool/clear/og" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              developers.kakao.com/tool/clear/og
            </a>{' '}
            에서 캐시를 초기화하세요(URL 입력 → 조회 → 캐시 삭제).
          </p>
        </section>

        {/* 3. 플랫폼별 차이 */}
        <section>
          <h2 style={sectionTitle}>플랫폼별 카드 차이 한눈에</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['플랫폼', '이미지 비율', '캐시', '특이사항'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['🇰🇷 카카오톡',  '2:1 (1200×630)',  '48시간',     'HTTPS·og 태그만, 캐시 초기화 도구 필수'],
                  ['Facebook',    '1.91:1',          '24시간~',    'Sharing Debugger로 강제 새로고침 가능'],
                  ['X (Twitter)', '2:1 또는 1:1',    '7일',        'twitter:card 별도 — summary_large_image 권장'],
                  ['LinkedIn',    '1.91:1',          '7일',        'Post Inspector로 캐시 초기화'],
                  ['Slack',       '제한 없음',        '1시간',      'unfurl_links 옵션 영향, 봇 정책 적용'],
                  ['Discord',     '카드 형태 다양',   '재요청 시',   'embed.color 등 추가 옵션 지원'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 5. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',           desc: 'API 응답·메타데이터 정리' },
              { href: '/tools/dev/url-encode',    icon: '🔗', name: 'URL 인코더/디코더',     desc: 'UTM·인코딩 처리' },
              { href: '/tools/dev/token-counter', icon: '🪙', name: 'AI 토큰 카운터',         desc: '메타 description AI 작성 비용' },
              { href: '/tools/art/color',         icon: '🎨', name: '색상 변환기',           desc: 'OG 이미지 브랜드 컬러 추출' },
              { href: '/tools/dev/curl',          icon: '🌀', name: 'cURL 변환기',           desc: '메타태그 점검 자동화' },
              { href: '/tools/art/charcount',     icon: '✏️', name: '글자 수 세기',          desc: 'title·description 최적 길이' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
