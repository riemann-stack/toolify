import Link from 'next/link'
import OgPreviewClient from './OgPreviewClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'

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

const code: React.CSSProperties = { background: 'var(--bg3)', padding: '2px 6px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }
const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', verticalAlign: 'top', lineHeight: 1.6 }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })
const pre: React.CSSProperties = { background: 'var(--bg2)', padding: '8px 12px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)', overflowX: 'auto', marginBottom: '12px' }

/* 1200×630 원본을 각 표시 비율로 중앙 크롭했을 때 잘리는 픽셀 — 빌드 시 계산 */
const OG_W = 1200
const OG_H = 630
const CROP_ROWS = [
  { ratio: '1.91:1', r: 1.91, use: 'Facebook·LinkedIn 큰 카드' },
  { ratio: '2:1', r: 2, use: 'X 큰 카드·카카오톡 기본형(800×400)' },
  { ratio: '1:1', r: 1, use: 'X summary·리스트형 작은 썸네일' },
].map(({ ratio, r, use }) => {
  const wide = OG_W / OG_H > r            // 원본이 더 넓으면 좌우를, 아니면 상하를 자른다
  const keepW = wide ? Math.round(OG_H * r) : OG_W
  const keepH = wide ? OG_H : Math.round(OG_W / r)
  const cut = wide ? (OG_W - keepW) / 2 : (OG_H - keepH) / 2
  return { ratio, use, cut: `${wide ? '좌우' : '상하'} 각 ${cut < 2 ? `약 ${Math.max(1, Math.round(cut))}` : Math.round(cut)}px`, keep: `중앙 ${keepW}×${keepH}` }
})

const FAQ_LD = [
  {
    q: '메타태그를 수정했는데 카카오톡 카드가 그대로예요.',
    a: '카카오톡은 한 번 수집한 미리보기를 <strong>일정 기간 캐시</strong>합니다(기간은 공개되어 있지 않음). 기다리기보다 <a href="https://developers.kakao.com/tool/clear/og" target="_blank" rel="noopener noreferrer">카카오 개발자 도구의 OG 캐시 초기화</a>에 URL을 넣어 캐시를 지우세요. Facebook은 <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer">Sharing Debugger</a>의 다시 스크랩, LinkedIn은 <a href="https://www.linkedin.com/post-inspector/" target="_blank" rel="noopener noreferrer">Post Inspector</a>로 즉시 다시 수집하게 할 수 있습니다. X는 별도 초기화 도구가 없어, 카드 정보가 약 7일 동안 캐시된다는 점을 감안하고 급하면 URL 끝에 <code>?v=2</code> 같은 쿼리를 붙여 새 주소로 공유합니다.',
  },
  {
    q: 'og:image는 어느 크기·비율이 가장 안전한가요?',
    a: '<strong>1200×630px(약 1.91:1)</strong>이 가장 보편적입니다. Facebook·LinkedIn은 1.91:1, 카카오톡·X 큰 카드(summary_large_image)는 2:1로 표시하므로 1200×630 한 장이면 상하 15px 정도만 잘리고 대부분의 플랫폼에 쓸 수 있습니다. 제목·로고는 가장자리를 피해 중앙에 두세요. 형식은 <strong>jpg(사진)·png(텍스트·로고)</strong>, 용량은 X 카드 이미지 한도인 <strong>5MB 미만</strong>에 맞추면 Facebook(8MB)까지 함께 만족합니다. 경로는 <code>https://example.com/og.png</code> 같은 절대 URL을 쓰세요 — Open Graph 명세의 값은 URL이며, 상대 경로는 크롤러가 해석하지 못할 수 있습니다.',
  },
  {
    q: 'URL 입력 모드에서 "페이지를 불러올 수 없다"고 나옵니다.',
    a: '대상 서버가 봇·스크래퍼 요청을 차단했거나, Cloudflare 같은 WAF가 이 도구의 서버 요청을 막은 경우입니다. <strong>HTML 붙여넣기 모드</strong>로 전환해 브라우저 페이지 소스(Cmd+Option+U / Ctrl+U)의 <code>&lt;head&gt;</code> 부분을 복사해 넣으면 같은 방식으로 분석합니다. 이때 자바스크립트로 나중에 삽입되는 메타태그는 페이지 소스에 없고, 자바스크립트를 실행하지 않는 대부분의 SNS 크롤러도 그 태그를 보지 못합니다 — 메타태그는 서버가 보내는 HTML에 들어 있어야 합니다.',
  },
  {
    q: 'twitter:card는 꼭 따로 넣어야 하나요?',
    a: 'X(Twitter)는 <code>twitter:*</code> 태그를 먼저 읽고, title·description·image가 없으면 <code>og:*</code>로 대신합니다. 하지만 카드 종류를 정하는 <code>twitter:card</code>는 대체값이 없는 필수 태그라 빠지면 카드가 표시되지 않을 수 있습니다. <code>&lt;meta name="twitter:card" content="summary_large_image"&gt;</code> 한 줄은 넣어 두세요. summary_large_image는 큰 이미지 카드, summary는 작은 정사각 썸네일 카드입니다.',
  },
  {
    q: 'og:image에 동적 이미지(서버에서 생성)를 써도 되나요?',
    a: '됩니다. Next.js의 <code>opengraph-image.tsx</code>(ImageResponse), Vercel OG, Cloudflare Workers 등으로 글마다 제목이 들어간 이미지를 만드는 방식이 흔합니다. 다만 SNS 크롤러는 응답을 오래 기다리지 않으므로 이미지 생성은 빠르게 끝나야 하고, 한 번 만든 이미지는 <code>Cache-Control</code>로 캐시해 두는 것이 좋습니다. 이미지 URL이 배포마다 바뀌면 플랫폼 캐시와 어긋나므로 주소는 안정적으로 유지하세요.',
  },
  {
    q: '같은 페이지를 SNS별로 다르게 보이게 할 수 있나요?',
    a: 'X에 한해서는 가능합니다. <code>og:*</code>를 공통값으로 두고 <code>twitter:title</code>·<code>twitter:description</code>·<code>twitter:image</code>를 따로 지정하면 X에서만 다른 카드가 표시됩니다. 카카오톡·Facebook·LinkedIn은 모두 <code>og:*</code>를 읽으므로 이들 사이에서는 같은 값을 공유합니다. 워드프레스의 Yoast·Rank Math는 이 구분을 게시물별 Social 탭에서 설정하게 해 줍니다.',
  },
  {
    q: '검색엔진(SEO)에는 OG 태그가 영향을 미치나요?',
    a: 'Google 검색 결과의 제목과 설명은 주로 <code>&lt;title&gt;</code>과 <code>meta description</code>, 본문 내용을 바탕으로 만들어지고, OG 태그는 SNS 공유 카드를 위한 것입니다. 다만 공유 카드가 잘 보이면 공유 링크의 클릭이 늘어 간접적으로 방문이 늘 수 있으므로, 두 종류의 태그를 모두 채워 두는 것이 좋습니다.',
  },
  {
    q: '검색에서 막아 둔 페이지도 공유 카드가 보이나요?',
    a: '<code>noindex</code> 메타 태그는 검색 색인만 막으므로 공유 카드와는 무관합니다. 하지만 <code>robots.txt</code>는 다릅니다 — X의 크롤러(Twitterbot)는 robots.txt를 따르므로 사이트 전체를 <code>Disallow</code>로 막아 두면 X 카드가 만들어지지 않습니다. 크롤러마다 robots.txt 준수 여부가 달라서, 검색만 막으려면 robots.txt보다 noindex를 쓰는 편이 공유 카드에 안전합니다.',
  },
]

export default function OgPreviewPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/og-preview">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />OG 미리보기 시뮬레이터
      </h1>
      <p className="tp-lead">
        <strong style={{ color: 'var(--text)' }}>카카오톡·페이스북·X·LinkedIn·Slack</strong>에서 공유했을 때 어떻게 보일지 한 화면에. 메타태그 검증 + 코드 생성까지.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="태그 해석·검증 규칙 = Open Graph 프로토콜 + 플랫폼 공식 개발자 문서 기준"
        sources={[
          { label: 'Open Graph 프로토콜', href: 'https://ogp.me/' },
          { label: 'Meta 공유 이미지 가이드', href: 'https://developers.facebook.com/docs/sharing/webmasters/images/' },
          { label: '카카오 공유 디버거', href: 'https://developers.kakao.com/tool/clear/og' },
          { label: 'X Cards 문서', href: 'https://developer.x.com/en/docs/x-for-websites/cards/guides/getting-started' },
          { label: 'LinkedIn 공유 도움말', href: 'https://www.linkedin.com/help/linkedin/answer/a521928' },
          { label: 'Slack 링크 미리보기 봇', href: 'https://api.slack.com/robots' },
        ]}
      />

      <OgPreviewClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. Open Graph란? */}
        <section>
          <h2 className="g-h2">Open Graph(OG) — 한 줄 요약</h2>
          <p className="g-p">
            Open Graph는 2010년 Facebook이 만든 메타데이터 규약으로, <strong>URL이 공유될 때 어떤 카드로 표시될지</strong>를 페이지 작성자가 직접 지정할 수 있게 합니다.
            카카오톡·Facebook·LinkedIn·Slack·Discord는 모두 OG 태그를 읽고, X(Twitter)만 자체 <code style={code}>twitter:*</code> 태그를 먼저 참조합니다(없으면 OG로 대체).
            Open Graph 명세(ogp.me)가 <strong>필수</strong>로 정한 속성은 og:title·og:type·og:image·og:url 네 가지입니다.
          </p>
          <ul className="g-list">
            <li><strong>og:title</strong> — 카드 헤드라인 (필수)</li>
            <li><strong>og:type</strong> — website·article·video.movie 등 (필수 — 이 도구의 코드 생성은 값이 없으면 website로 채움)</li>
            <li><strong>og:image</strong> — 카드 썸네일 (필수, 1200×630 권장)</li>
            <li><strong>og:url</strong> — 이 페이지의 대표(canonical) URL (필수)</li>
            <li><strong>og:description</strong> — 카드 본문 한두 문장 (선택이지만 권장)</li>
            <li><strong>og:site_name</strong> — 사이트 이름, 플랫폼에 따라 카드에 출처로 표시 (선택)</li>
            <li><strong>og:locale</strong> — 언어_지역 형식, 기본값 en_US이므로 한국어 페이지는 ko_KR (선택)</li>
          </ul>
          <p className="g-p">
            이 도구의 검증은 명세 필수 여부보다 <strong>실제 카드 표시</strong>를 기준으로 합니다. 제목·이미지가 없으면 오류, og:title·og:image 없이 &lt;title&gt;이나 twitter:image로 대신 표시되는 경우는 경고로 알리고,
            제목은 60자·설명은 160자를 넘으면 잘릴 수 있다고 표시합니다. 이 글자 수 기준은 플랫폼이 공개한 값이 아니라 카드 폭에서 흔히 잘리는 길이를 잡은 실무 기준입니다.
          </p>
        </section>

        {/* 2. 카카오톡 OG 가이드 */}
        <section>
          <h2 className="g-h2">카카오톡 OG 가이드 — 가장 까다로움</h2>
          <p className="g-p">
            한국에서 가장 중요한 공유 채널이면서, 캐시 때문에 수정이 바로 반영되지 않아 가장 자주 문의가 생기는 곳이 카카오톡입니다. 다음 규칙을 알고 있으면 대부분의 문제를 피할 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '이미지 비율', d: '2:1 (800×400)', desc: '채팅방 미리보기는 800×400으로 리사이즈·크롭됩니다(카카오 데브톡 답변 기준). 1200×630 원본이면 상하가 조금 잘림.' },
              { t: '이미지 용량', d: '5MB 미만 권장', desc: 'jpg·png·webp. X 카드 이미지 한도(5MB)에 맞추면 여러 플랫폼에 공통으로 안전.' },
              { t: '캐시', d: '기간 비공개', desc: '한 번 수집되면 일정 기간 유지 — 수정 후에는 캐시 초기화 도구로 삭제.' },
              { t: '이미지 주소', d: '절대 URL', desc: 'og:image는 https://로 시작하는 전체 주소로. 상대 경로는 해석에 실패할 수 있음.' },
              { t: '문자 인코딩', d: 'UTF-8', desc: '한글 깨짐 방지 — 문서와 Content-Type에 charset 명시.' },
              { t: '리다이렉트', d: '최종 URL 공유', desc: '단축 URL·여러 단계 리다이렉트보다 최종 주소를 직접 공유하는 편이 안전.' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: '3px solid var(--warning)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px', fontFamily: 'var(--font-sans)' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <Callout tone="tip" title="수정이 반영되지 않을 때">
            메타태그를 고친 뒤에는{' '}
            <a href="https://developers.kakao.com/tool/clear/og" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)', fontWeight: 600 }}>
              developers.kakao.com/tool/clear/og
            </a>{' '}
            에서 URL을 넣고 캐시를 삭제하세요. 삭제 후 처음 공유되는 순간 새 태그로 다시 수집됩니다.
          </Callout>
        </section>

        {/* 3. 플랫폼별 차이 */}
        <section>
          <h2 className="g-h2">플랫폼별 카드 차이 한눈에</h2>
          <p className="g-p">
            같은 태그를 넣어도 플랫폼마다 이미지 비율, 캐시 기간, 수정 반영 방법이 다릅니다. 캐시 기간은 각 플랫폼 공식 문서에 적힌 값만 적었고, 공개되지 않은 곳은 비공개로 표시했습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['플랫폼', '이미지 비율', '캐시', '수정 반영·특이사항'].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['카카오톡',    '2:1 (800×400으로 리사이즈·크롭)', '일정 기간 (비공개)', 'OG 캐시 초기화 도구로 즉시 삭제'],
                  ['Facebook',    '1.91:1',                          '첫 공유 때 수집·캐시', 'Sharing Debugger로 다시 스크랩 · 이미지 최소 200×200, 8MB 이하'],
                  ['X (Twitter)', '큰 카드 2:1 · summary 1:1',       '약 7일',               'twitter:card 필수 · Twitterbot은 robots.txt 준수'],
                  ['LinkedIn',    '1.91:1',                          '약 7일',               'Post Inspector로 다시 수집'],
                  ['Slack',       '—',                               '약 30분',              'Slackbot-LinkExpanding이 OG·Twitter Card·oEmbed 태그를 읽음'],
                ].map((row, i) => (
                  <tr key={i} style={rowStyle(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row[0]}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{row[2]}</td>
                    <td style={{ ...td, color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. OG 이미지 안전 영역 */}
        <section>
          <h2 className="g-h2">1200×630 안전 영역 — 제목 텍스트, 어디까지 잘리나</h2>
          <p className="g-p">
            1200×630 한 장으로 통일해도 플랫폼마다 <strong>표시 비율이 달라 가장자리가 잘립니다</strong>.
            X는 카드 비율에 맞춰 이미지를 잘라 표시하고, Facebook은 &ldquo;1.91:1에 가깝게 유지해야 피드에서 크롭 없이 전체가 표시된다&rdquo;고 공식 문서에 명시합니다.
            1200×630 원본이 각 비율에서 잃는 픽셀을 계산하면 이렇습니다(중앙 크롭 기준 — 크롭 위치는 앱 버전에 따라 달라질 수 있으니 중앙 배치가 안전).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['표시 비율', '대표 사례', '잘리는 픽셀', '살아남는 영역'].map(h => (
                    <th scope="col" key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CROP_ROWS.map((row, i) => (
                  <tr key={row.ratio} style={rowStyle(i)}>
                    <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700 }}>{row.ratio}</td>
                    <td style={td}>{row.use}</td>
                    <td style={{ ...td, fontWeight: 700, whiteSpace: 'nowrap' }}>{row.cut}</td>
                    <td style={{ ...td, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{row.keep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            상하 15px 크롭은 여유가 있지만, 진짜 위험은 <strong>정사각 썸네일</strong> — 좌우 폭의 절반 가까이가 사라집니다.
            제목 텍스트·로고는 <strong>중앙 80% 영역(가로 960×세로 504px)</strong> 안에 두고,
            정사각 크롭까지 버텨야 한다면 핵심 요소를 <strong>중앙 630px 폭</strong> 안에 배치하세요.
            Facebook 공식 기준으로 이미지는 최소 200×200px 이상이어야 하고, 600×315px 이상이어야 큰 이미지 카드로 표시되며, 파일 용량은 8MB를 넘을 수 없습니다.
          </p>
        </section>

        {/* 5. 프레임워크별 OG 삽입 위치 */}
        <section>
          <h2 className="g-h2">프레임워크별 삽입 위치 — 순수 HTML·Next.js·워드프레스</h2>
          <p className="g-p">
            검증이 끝났으면 실제 코드에 넣을 차례. 순수 HTML이라면 <code style={code}>&lt;head&gt;</code> 안에 명세 필수 4개(og:title·og:type·og:image·og:url)에 og:description·twitter:card를 더한 아래 6줄이 최소 세트입니다 — 이 도구의 코드 생성 결과와 같은 골격이에요.
          </p>
          <pre style={pre}>
{`<meta property="og:title" content="글 제목" />
<meta property="og:description" content="한 줄 설명" />
<meta property="og:image" content="https://example.com/og.png" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />`}
          </pre>
          <p className="g-p">
            OG 태그는 <code style={code}>property</code> 속성, 트위터 태그는 <code style={code}>name</code> 속성을 쓰는 것이 각 명세의 표기입니다. 이 도구의 HTML 분석은 두 속성을 모두 읽지만, 일부 크롤러는 한쪽만 읽으므로 명세대로 적는 편이 안전합니다.
          </p>
          <p className="g-p">
            <strong>Next.js(App Router)</strong>는 메타태그를 직접 쓰지 않고 <code style={code}>page.tsx</code>의 <code style={code}>metadata</code> 객체로 선언합니다.
            같은 라우트 폴더에 <code style={code}>opengraph-image.png</code>(또는 ImageResponse를 반환하는 <code style={code}>opengraph-image.tsx</code>)를 두면 og:image 태그가 자동 생성됩니다.
            아래처럼 이미지에 상대 경로를 쓰려면 루트 layout에 <code style={code}>metadataBase</code>를 지정해야 절대 URL로 바뀌어 출력됩니다.
          </p>
          <pre style={pre}>
{`// app/blog/[slug]/page.tsx
export const metadata = {
  openGraph: {
    title: '글 제목',
    description: '한 줄 설명',
    url: 'https://example.com/blog/1',
    siteName: '사이트 이름',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    type: 'article',
  },
  twitter: { card: 'summary_large_image' },
}`}
          </pre>
          <ul className="g-list">
            <li><strong>워드프레스 + Yoast SEO</strong> — 글 편집 화면의 Yoast SEO 박스에서 <strong>소셜(Social) 탭</strong>을 열면 게시물별 OG 이미지·제목·설명을 지정할 수 있고, 여기 입력한 이미지가 대표 이미지보다 우선 적용됩니다.</li>
            <li><strong>워드프레스 + Rank Math</strong> — 메타박스의 <strong>Social 탭</strong>에서 Facebook용·X용 이미지를 따로 설정하고, X 카드 타입(summary / summary_large_image)도 선택합니다.</li>
            <li>어느 쪽이든 발행 후 이 도구에 URL을 넣어 실제 출력을 확인하고, 수정했다면 카카오·Facebook 캐시를 초기화하세요.</li>
          </ul>
        </section>

        <Faq items={FAQ_LD} />

        {/* 7. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/dev/json',          name: 'JSON 포맷터',           desc: 'API 응답·메타데이터 정리' },
              { href: '/tools/dev/url-encode',    name: 'URL 인코더/디코더',     desc: 'UTM·인코딩 처리' },
              { href: '/tools/dev/token-counter', name: 'AI 토큰 카운터',         desc: '메타 description AI 작성 비용' },
              { href: '/tools/art/color',         name: '색상 변환기',           desc: 'OG 이미지 브랜드 컬러 추출' },
              { href: '/tools/dev/curl',          name: 'cURL 변환기',           desc: '메타태그 점검 자동화' },
              { href: '/tools/art/charcount',     name: '글자 수 세기',          desc: 'title·description 최적 길이' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'block', color: 'inherit' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
