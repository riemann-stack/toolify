import Link from 'next/link'
import TechStackClient from './TechStackClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/dev/tech-stack',
  title: '기술 스택 추천기 — 12 시나리오 + Next.js·Remix·Astro·Supabase·Vercel·토스페이먼츠 비교 + 한국 SaaS 통합 (2026)',
  description:
    '프로젝트 유형·규모·예산·SEO·한국 특화 입력 시 Frontend·Backend·DB·Auth·Hosting·Payment·Analytics 풀스택 자동 추천. 7축 점수 레이더 차트, 시나리오 프리셋 12종(MVP·사이드·AI·이커머스·한국 SaaS 등), 비용·기간·시작 명령어, 트레이드오프 표.',
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
  fontFamily: 'Inter, system-ui, sans-serif',
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

export default function TechStackPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🛠️ 기술 스택 추천기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        프로젝트 유형·규모·예산·SEO·한국 특화 통합 입력 시 Frontend·Backend·DB·Auth·Hosting·Payment·Analytics 풀스택을 자동 추천. MVP 스타트업·AI 챗봇·한국형 SaaS 등 12 시나리오 프리셋과 7축 점수 레이더 차트로 의사결정.
      </p>

      <TechStackClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 알고리즘 가이드 */}
        <section>
          <h2 style={sectionTitle}>추천 알고리즘 — 어떻게 결정되나</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            본 도구는 35+ 스택을 7축으로 채점한 데이터베이스를 보유합니다. 사용자 입력에 따라 가중치가 자동 결정되고, 카테고리별 최고 점수 스택이 추천됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['입력', '영향받는 가중치', '예시'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['타임라인 1주',          '개발 속도 ×3',                '빠른 프로토타입 → Astro·Vite 우대'],
                  ['예산 무료',             '비용 효율 ×4',                'Cloudflare·SQLite·Auth.js 우대'],
                  ['트래픽 100만+/월',      '확장성·성능 ×2~3',            'AWS·Postgres self-hosted·Spring 우대'],
                  ['경험 초보',             '학습 곡선 ×3',                'Next.js·Supabase·Clerk 우대 (보일러플레이트 ↓)'],
                  ['SEO 매우중요',          '성능 + SSR 친화 가중',         'Next.js·Astro·Remix 우대'],
                  ['한국 통합 필요',         '한국 채용·생태 ×3, Stripe 제외', '토스페이먼츠·Auth.js 카카오 우대'],
                  ['규모 대규모',           '확장성·생태계 가중',           'NestJS·Spring·AWS·Postgres 우대'],
                  ['프로젝트 정적',         'frontend·hosting·analytics만 추천', 'backend·auth 등 불필요 카테고리 제외'],
                ].map(([inp, wei, ex], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{inp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{wei}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
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

        {/* 3. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <p style={faqQuestion}>Q1. Next.js vs Remix, 뭐가 좋나요?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>Next.js</strong>: 한국 채용 시장 1순위. App Router·Server Components·Turbopack. Vercel 배포 0-config. 생태계 최대.
                <br /><br />
                <strong style={{ color: 'var(--text)' }}>Remix (React Router 7)</strong>: 웹 표준 (Form·Loader) 중심. 더 명시적이고 진보적 향상. 생태계 작음. 한국 채용 미미.
                <br /><br />
                <strong>결론</strong>: 한국 취업·신규 프로젝트는 Next.js. 학습·웹 표준 가치 중시는 Remix. 둘 다 최고 수준이지만 채용·생태 격차는 압도적으로 Next.js 우위.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q2. Supabase vs Firebase, 어느 게 낫나요?</p>
              <div style={faqAnswer}>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong style={{ color: 'var(--text)' }}>Supabase</strong>: Postgres 기반 (관계형). RLS로 권한 강력. 오픈소스 (자체 호스팅 가능). SQL 친화. <em style={{ color: 'var(--text)', fontStyle: 'normal' }}>웹 위주 추천</em>.</li>
                  <li><strong style={{ color: 'var(--text)' }}>Firebase</strong>: NoSQL (Firestore). Google 락인. 모바일 SDK 우수. Phone Auth 강력. <em style={{ color: 'var(--text)', fontStyle: 'normal' }}>모바일 위주 추천</em>.</li>
                </ul>
                <strong>결론</strong>: 웹 + 관계형 데이터(주문·결제·소셜) → Supabase. 모바일 + 단순 문서 → Firebase. 가격은 비슷하지만 Supabase가 락인 적어 장기적으로 유리.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q3. React Native vs Flutter, 어느 쪽?</p>
              <div style={faqAnswer}>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong style={{ color: 'var(--text)' }}>React Native (Expo)</strong>: JS/React 경험 활용. 웹·앱 코드 일부 공유. EAS Build로 클라우드 빌드. 한국 채용 풍부.</li>
                  <li><strong style={{ color: 'var(--text)' }}>Flutter</strong>: 픽셀 단위 동일 UI. 60fps 보장. Dart 학습 필요. Material·Cupertino 둘 다 지원.</li>
                </ul>
                <strong>결론</strong>: 웹 개발 경험 있으면 React Native (Expo). UI 일관성·게임풍 인터랙션 → Flutter. 둘 다 한국에서 채용 활발하지만 React Native 비중이 더 큼.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q4. MVP에 모놀리스 vs 마이크로서비스?</p>
              <div style={faqAnswer}>
                <strong style={{ color: '#FF8C8C' }}>MVP는 100% 모놀리스로 시작.</strong> 마이크로서비스는 다음 조건일 때만:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>팀 50명+ (서비스별 책임 팀 분리)</li>
                  <li>일부 모듈만 트래픽 폭증 (스케일 분리 필요)</li>
                  <li>기술 스택 다양 (Python ML + Node API)</li>
                </ul>
                초기에 분리하면 <strong>네트워크 오버헤드·배포 복잡도·디버깅 지옥</strong>이 시간을 다 잡아먹음. 모놀리스로 시작 → 트래픽·팀 성장 시 점진적 분리가 정답.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q5. Vercel vs AWS, 뭐가 저렴한가요?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>1만 사용자까지는 Vercel이 압도적으로 저렴 + 빠름.</strong> 무료 티어로 시작 → Pro $20/월. 0-config 배포·Preview·Edge·Image 자동 최적화.
                <br /><br />
                <strong>10만+ 사용자</strong>는 트래픽·함수 호출량 따라 비용 ↑. 이때 AWS (CloudFront + Lambda 또는 ECS) 직접 구성이 더 저렴할 수 있음. 단 운영 부담 큼.
                <br /><br />
                <strong>한국 대기업·금융</strong>은 AWS Seoul 또는 NCloud. 자체 인증·보안 요구사항 충족. 채용도 AWS 강세.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q6. 한국 결제는 토스페이먼츠가 표준인가요?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>2026년 신규 SaaS 80%+가 토스페이먼츠 채택.</strong> 이유:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>개발자 문서 우수 (한국 PG 중 압도적)</li>
                  <li>SDK·콜백 깔끔</li>
                  <li>카드·계좌·간편결제 (카카오·네이버페이) 통합</li>
                  <li>수수료 2.7~3.3% (경쟁사 대비 합리적)</li>
                </ul>
                <strong>예외</strong>:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>대기업·금융권은 여전히 KG이니시스 다수 (관행)</li>
                  <li>멀티 PG 필요 시 포트원 (구 아임포트)</li>
                  <li>글로벌 + 한국 동시는 Stripe + 토스 병행</li>
                </ul>
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q7. 초보가 백엔드를 빠르게 배우려면?</p>
              <div style={faqAnswer}>
                JS/TS 기반이라면 <strong style={{ color: 'var(--text)' }}>Next.js + Supabase</strong> 조합이 가장 부드러운 시작.
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>주 1~2</strong>: Next.js Route Handlers + Supabase Auth</li>
                  <li><strong>주 3~4</strong>: Postgres SQL 기초 + RLS 정책</li>
                  <li><strong>주 5~6</strong>: 트랜잭션·인덱스·백그라운드 작업</li>
                  <li><strong>월 2~3</strong>: 캐싱(Redis)·큐(Inngest)</li>
                </ul>
                Python 친숙하면 <strong>FastAPI + Supabase</strong>도 좋음. 프론트는 그대로 Next.js + API만 분리.
                <br /><br />
                <strong>피해야 할 함정</strong>: 초보가 Spring·NestJS 시작 → 보일러플레이트로 시간 다 보냄. 단순 도구 (Next.js API)로 빠르게 결과물 → 점진적 학습.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q8. Astro는 언제 안 좋나요?</p>
              <div style={faqAnswer}>
                Astro는 <strong style={{ color: 'var(--text)' }}>콘텐츠 우선 사이트에 최적</strong>이지만 다음에는 부적합:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>실시간 협업·대시보드</strong>: SPA 인터랙션이 핵심 — Next.js·Vite 권장</li>
                  <li><strong>SaaS 풀스택</strong>: Auth·DB·결제 통합은 Next.js가 압도</li>
                  <li><strong>복잡한 폼·다단계 워크플로우</strong>: React Hook Form 등 React 생태계 친화 도구</li>
                  <li><strong>실시간 채팅·알림</strong>: WebSocket 기반 SPA 권장</li>
                </ul>
                Astro 강점은 <strong>블로그·문서·마케팅·포트폴리오</strong>. 동적 인터랙션 80%+면 Next.js로.
              </div>
            </div>

          </div>
        </section>

        {/* 4. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>관련 도구</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 2 }}>
            <li><Link href="/tools/dev/json" style={{ color: 'var(--accent)' }}>JSON 포맷터</Link> — API 응답 정리</li>
            <li><Link href="/tools/dev/regex" style={{ color: 'var(--accent)' }}>정규식 테스트기</Link> — 한국 패턴 30+</li>
            <li><Link href="/tools/dev/css-converter" style={{ color: 'var(--accent)' }}>CSS 단위 변환기</Link> — px·rem 변환</li>
            <li><Link href="/tools/dev/curl" style={{ color: 'var(--accent)' }}>cURL 변환기</Link> — fetch·axios·Python 등 변환</li>
            <li><Link href="/tools/dev/yaml-json" style={{ color: 'var(--accent)' }}>YAML ↔ JSON 변환기</Link></li>
            <li><Link href="/tools/dev/http-status" style={{ color: 'var(--accent)' }}>HTTP 상태 코드 검색기</Link></li>
            <li><Link href="/tools/art/gradient-generator" style={{ color: 'var(--accent)' }}>CSS 그라디언트 생성기</Link> — 디자인 토큰</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
