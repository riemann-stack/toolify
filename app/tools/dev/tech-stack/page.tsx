import Link from 'next/link'
import TechStackClient from './TechStackClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/tech-stack',
  title: '기술 스택 추천기 — 12 시나리오 + Next.js·Remix·Astro·Supabase·Vercel·토스페이먼츠 비교 + 한국 SaaS 통합 (2026)',
  description:
    '시나리오 12종 프리셋 + 8개 입력값 → Frontend·Backend·DB·Auth·Hosting·Payment 풀스택 자동 추천과 7축 점수 레이더.',
  keywords: [
    '기술 스택 추천', '풀스택 추천', '스타트업 기술 스택', 'MVP 스택',
    'Next.js vs Remix', 'Astro vs Next', 'React Native vs Flutter',
    'Supabase vs Firebase', 'Vercel vs AWS',
    '토스페이먼츠 통합', '카카오 로그인', '네이버 로그인',
    'Clerk vs Auth.js', 'Hono vs Express',
    '사이드 프로젝트 스택', 'AI 앱 스택', '이커머스 스택',
    '데스크톱 앱 Tauri', 'Electron 비교', '실시간 협업 스택',
    '한국 SaaS 스택', '한국 결제 통합', '본인인증 통합',
    'NestJS vs Spring', 'FastAPI 백엔드', 'Next.js 풀스택',
    '2026년 인기 프레임워크', '풀스택 비교', '개발 비용 추정',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '-0.01em',
}
const faqQuestion: React.CSSProperties = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '8px',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}

const FAQ_LD = [
              {
                q: 'Next.js vs Remix, 뭐가 좋나요?',
                a: '<strong>Next.js</strong> — 한국 채용 시장 1순위. App Router·Server Components·Turbopack. Vercel 배포 0-config. 생태계 최대.<br/><br/><strong>Remix (React Router 7)</strong> — 웹 표준(Form·Loader) 중심. 더 명시적이고 진보적 향상. 생태계 작음. 한국 채용 미미.<br/><br/><strong>결론</strong> — 한국 취업·신규 프로젝트는 Next.js. 학습·웹 표준 가치 중시는 Remix. 둘 다 최고 수준이지만 채용·생태 격차는 압도적으로 Next.js 우위.',
              },
              {
                q: 'Supabase vs Firebase, 어느 게 낫나요?',
                a: '· <strong>Supabase</strong> — Postgres 기반(관계형). RLS로 권한 강력. 오픈소스(자체 호스팅 가능). SQL 친화. <em>웹 위주 추천</em>.<br/>· <strong>Firebase</strong> — NoSQL(Firestore). Google 락인. 모바일 SDK 우수. Phone Auth 강력. <em>모바일 위주 추천</em>.<br/><br/><strong>결론</strong> — 웹 + 관계형 데이터(주문·결제·소셜) → Supabase. 모바일 + 단순 문서 → Firebase. 가격은 비슷하지만 Supabase가 락인 적어 장기적으로 유리.',
              },
              {
                q: 'React Native vs Flutter, 어느 쪽?',
                a: '· <strong>React Native (Expo)</strong> — JS/React 경험 활용. 웹·앱 코드 일부 공유. EAS Build로 클라우드 빌드. 한국 채용 풍부.<br/>· <strong>Flutter</strong> — 픽셀 단위 동일 UI. 60fps 보장. Dart 학습 필요. Material·Cupertino 둘 다 지원.<br/><br/><strong>결론</strong> — 웹 개발 경험 있으면 React Native(Expo). UI 일관성·게임풍 인터랙션 → Flutter. 둘 다 한국에서 채용 활발하지만 React Native 비중이 더 큼.',
              },
              {
                q: 'MVP에 모놀리스 vs 마이크로서비스?',
                a: '<strong>MVP는 100% 모놀리스로 시작.</strong> 마이크로서비스는 다음 조건일 때만 —<br/>· 팀 50명+ (서비스별 책임 팀 분리)<br/>· 일부 모듈만 트래픽 폭증 (스케일 분리 필요)<br/>· 기술 스택 다양 (Python ML + Node API)<br/><br/>초기에 분리하면 네트워크 오버헤드·배포 복잡도·디버깅 지옥이 시간을 다 잡아먹음. 모놀리스로 시작 → 트래픽·팀 성장 시 점진적 분리가 정답.',
              },
              {
                q: 'Vercel vs AWS, 뭐가 저렴한가요?',
                a: '<strong>1만 사용자까지는 Vercel이 압도적으로 저렴 + 빠름.</strong> 무료 티어로 시작 → Pro $20/월. 0-config 배포·Preview·Edge·Image 자동 최적화.<br/><br/><strong>10만+ 사용자</strong>는 트래픽·함수 호출량 따라 비용 ↑. 이때 AWS(CloudFront + Lambda 또는 ECS) 직접 구성이 더 저렴할 수 있음. 단 운영 부담 큼.<br/><br/><strong>한국 대기업·금융</strong>은 AWS Seoul 또는 NCloud. 자체 인증·보안 요구사항 충족. 채용도 AWS 강세.',
              },
              {
                q: '한국 결제는 토스페이먼츠가 표준인가요?',
                a: '<strong>2026년 신규 SaaS 80%+가 토스페이먼츠 채택.</strong> 이유 —<br/>· 개발자 문서 우수 (한국 PG 중 압도적)<br/>· SDK·콜백 깔끔<br/>· 카드·계좌·간편결제(카카오·네이버페이) 통합<br/>· 수수료 2.7~3.3% (경쟁사 대비 합리적)<br/><br/><strong>예외</strong> — 대기업·금융권은 여전히 KG이니시스 다수(관행) / 멀티 PG 필요 시 포트원(구 아임포트) / 글로벌 + 한국 동시는 Stripe + 토스 병행.',
              },
              {
                q: '초보가 백엔드를 빠르게 배우려면?',
                a: 'JS/TS 기반이라면 <strong>Next.js + Supabase</strong> 조합이 가장 부드러운 시작.<br/>· 주 1~2 — Next.js Route Handlers + Supabase Auth<br/>· 주 3~4 — Postgres SQL 기초 + RLS 정책<br/>· 주 5~6 — 트랜잭션·인덱스·백그라운드 작업<br/>· 월 2~3 — 캐싱(Redis)·큐(Inngest)<br/><br/>Python 친숙하면 <strong>FastAPI + Supabase</strong>도 좋음. 프론트는 그대로 Next.js + API만 분리.<br/><br/><strong>피해야 할 함정</strong> — 초보가 Spring·NestJS 시작 → 보일러플레이트로 시간 다 보냄. 단순 도구(Next.js API)로 빠르게 결과물 → 점진적 학습.',
              },
              {
                q: 'Astro는 언제 안 좋나요?',
                a: 'Astro는 <strong>콘텐츠 우선 사이트에 최적</strong>이지만 다음에는 부적합 —<br/>· <strong>실시간 협업·대시보드</strong> — SPA 인터랙션이 핵심, Next.js·Vite 권장<br/>· <strong>SaaS 풀스택</strong> — Auth·DB·결제 통합은 Next.js가 압도<br/>· <strong>복잡한 폼·다단계 워크플로우</strong> — React Hook Form 등 React 생태계 친화 도구<br/>· <strong>실시간 채팅·알림</strong> — WebSocket 기반 SPA 권장<br/><br/>Astro 강점은 블로그·문서·마케팅·포트폴리오. 동적 인터랙션 80%+면 Next.js로.',
              },
              {
                q: '본 도구의 추천을 그대로 따라도 되나요?',
                a: '추천은 <strong>일반적인 가이드라인</strong>입니다. 본 도구는 35+ 스택을 7축 점수로 비교한 추천 엔진이지만, 실제 의사결정에는 다음을 같이 고려해야 합니다 —<br/>· 팀이 이미 익숙한 스택 (학습 비용)<br/>· 외부 클라이언트·기존 시스템 호환성<br/>· 특정 라이브러리 의존도 (예: 결제 PG 협약)<br/>· 회사 보안·컴플라이언스 정책<br/><br/>추천 결과를 시작점으로 두고, 「대안 후보」와 「7축 점수」를 함께 보며 본인 상황에 맞게 조정하세요.',
              },
            ]

export default function TechStackPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />기술 스택 추천기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        프로젝트 시나리오로 <strong style={{ color: 'var(--text)' }}>Frontend·Backend·DB·Auth·Hosting·Payment</strong> 풀스택 자동 추천.
      </p>

      <TechStackClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 알고리즘 가이드 — 풀어 쓰는 설명 */}
        <section>
          <h2 style={sectionTitle}>추천 알고리즘 — 어떻게 결정되나</h2>
          <p style={{ ...faqAnswer, marginBottom: '16px' }}>
            본 도구는 35+ 스택을 7축(개발 속도·생산성·성능·확장성·학습 곡선·생태계·비용)으로 채점한 데이터베이스를 보유합니다. 입력하신 8개 변수가 각 축의 중요도를 조정해 카테고리별 최고 점수 스택을 추천합니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                input: '⏱️ 타임라인 (1주 → 6개월)',
                impact: '짧을수록 「개발 속도」와 「초기 셋업이 빠른 스택」이 우선됩니다. 1~2주짜리 프로토타입에서는 보일러플레이트가 적은 Astro·Vite·Next.js 같은 옵션이 점수가 올라가고, 6개월짜리 정식 프로덕트는 학습 시간을 들여도 장기 운영이 편한 스택(NestJS·Spring 등)이 후보로 들어옵니다.',
              },
              {
                input: '💰 예산 (무료 → 무관)',
                impact: '예산이 낮을수록 「비용 효율」이 큰 영향을 줍니다. 무료 티어에서는 Cloudflare Workers·Pages·SQLite·Auth.js 같은 옵션이, 예산이 충분하면 Vercel Pro·AWS·관리형 DB(Supabase, PlanetScale 등)가 더 잘 추천됩니다.',
              },
              {
                input: '👥 트래픽 (100명 → 100만+/월)',
                impact: '트래픽이 클수록 「확장성」과 「성능」이 중요해집니다. 100~1만 사용자 규모는 Vercel·Supabase로 충분하지만, 100만+ 규모로 가면 AWS·Postgres 셀프 호스트·NestJS/Spring처럼 수평 확장이 검증된 스택이 우선 추천됩니다.',
              },
              {
                input: '🎓 경험 (초보 → 시니어)',
                impact: '경험이 낮을수록 「학습 곡선」 영향이 커집니다. 초보는 Next.js·Supabase·Clerk처럼 문서·튜토리얼이 풍부하고 보일러플레이트가 적은 스택이, 시니어는 더 세밀하게 제어할 수 있는 직접 구성형 스택(Hono·Fastify·Drizzle 등)도 후보로 들어옵니다.',
              },
              {
                input: '🔍 SEO 중요도',
                impact: '높을수록 SSR/SSG가 기본인 프레임워크가 유리합니다. Next.js·Astro·Remix가 우선되고, CSR 전용 SPA(Vite + React) 같은 옵션은 SEO 항목에서 감점됩니다.',
              },
              {
                input: '🇰🇷 한국 특화 통합',
                impact: '체크 시 「한국 채용 시장·생태」와 「한국 결제·인증 지원」이 크게 가중됩니다. 토스페이먼츠·Auth.js(카카오/네이버 provider)·NCloud 등이 우선되고, 한국에서 자주 안 쓰이거나 호환이 까다로운 옵션(Stripe·Clerk 일부 기능 등)은 후보에서 제외되거나 낮은 우선순위로 떨어집니다.',
              },
              {
                input: '🏗️ 프로젝트 유형 (웹앱·SPA·정적·모바일·API·데스크톱)',
                impact: '유형에 따라 추천 카테고리 구성 자체가 달라집니다. 정적 사이트는 frontend·hosting·analytics만 추천되고 backend·auth·payment 카테고리는 제외됩니다. 모바일은 React Native·Flutter·Expo Hosting 위주로, API 서버는 frontend 카테고리 없이 backend·DB·hosting 중심으로 구성됩니다.',
              },
              {
                input: '📏 규모 (토이 → 대규모)',
                impact: '규모가 커질수록 「생태계」와 「장기 유지보수성」이 중요해집니다. 토이 프로젝트는 단순한 SQLite·Cloudflare 조합이, 대규모는 모니터링·CI/CD·온콜 대응이 성숙한 AWS·Postgres·NestJS·Spring 같은 옵션이 더 적합하게 점수가 매겨집니다.',
              },
              {
                input: '💻 익숙한 언어 (JS/TS·Python·Java·Go·Rust)',
                impact: '익숙한 언어 생태계에서 빠르게 시작할 수 있는 스택이 우선됩니다. JS/TS면 Next.js·NestJS·Hono, Python이면 FastAPI·Django, Java면 Spring 등이 우대됩니다. 학습 비용을 줄이려는 가중치입니다.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>{item.input}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>{item.impact}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 카테고리별 라이브러리 */}
        <section>
          <h2 style={sectionTitle}>카테고리별 인기 라이브러리 (2026년 5월)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['카테고리', '인기 라이브러리'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['UI 컴포넌트',     'ShadCN UI · Radix · Mantine · Chakra · Headless UI · DaisyUI'],
                  ['Form',            'React Hook Form + Zod · TanStack Form · Conform'],
                  ['상태 관리',       'Zustand · Jotai · Redux Toolkit · TanStack Query (서버) · nuqs (URL)'],
                  ['Data Fetching',   'TanStack Query · SWR · tRPC · Server Components'],
                  ['스타일',          'Tailwind CSS 4 · CSS Modules · Stitches · vanilla-extract'],
                  ['차트',            'Recharts · Chart.js · ECharts · Plotly · D3 · Visx'],
                  ['Animation',       'Framer Motion · Motion (vanilla) · Lottie · Spring'],
                  ['ORM',             'Prisma · Drizzle · Kysely · TypeORM · MikroORM'],
                  ['Validation',      'Zod · Valibot · Yup · ArkType'],
                  ['Email',           'Resend · SendGrid · NHN Toast · AWS SES'],
                  ['File Upload',     'UploadThing · Cloudinary · S3 Presigned · Vercel Blob'],
                  ['Search',          'Algolia · Meilisearch · Typesense · Postgres FTS · Elasticsearch'],
                  ['CMS',             'Sanity · Contentful · Notion API · Storyblok · Payload'],
                  ['Webhook',         'Inngest · Trigger.dev · Defer · Cron'],
                  ['Testing',         'Vitest · Playwright · Cypress · Jest · React Testing Library'],
                ].map(([cat, libs], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{cat}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{libs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. FAQ — 아코디언 */}
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
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 4. 관련 도구 — 2열 카드 그리드 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/dev/json',              icon: '📋', name: 'JSON 포맷터',              desc: 'API 응답 정렬·압축·검증' },
              { href: '/tools/dev/regex',             icon: '🔍', name: '정규식 테스트기',          desc: '한국 데이터 패턴 30+' },
              { href: '/tools/dev/css-converter',     icon: '🎨', name: 'CSS 단위 변환기',          desc: 'px·rem·clamp() 변환' },
              { href: '/tools/dev/curl',              icon: '🌀', name: 'cURL 변환기',              desc: 'fetch·axios·Python 등 변환' },
              { href: '/tools/dev/yaml-json',         icon: '📄', name: 'YAML ↔ JSON 변환기',       desc: 'K8s·Compose·CI 설정' },
              { href: '/tools/dev/http-status',       icon: '🌐', name: 'HTTP 상태 코드 검색기',    desc: '65+ 코드 한국어 설명' },
              { href: '/tools/dev/hash',              icon: '🔒', name: '해시 생성기',              desc: 'MD5·SHA·HMAC·SRI' },
              { href: '/tools/art/gradient-generator', icon: '🌈', name: 'CSS 그라디언트 생성기',   desc: '디자인 토큰 + 코드 생성' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
