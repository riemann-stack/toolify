import LoremClient from './LoremClient'
import { buildMetadata } from '@/lib/seo'
import Link from 'next/link'

export const metadata = buildMetadata({
  path: '/tools/dev/lorem',
  title: '더미 텍스트·UI 콘텐츠 생성기 — 문단·버튼·카드·JSON 더미 데이터',
  description: '디자이너·개발자를 위한 종합 더미 콘텐츠 생성기. 문단(한글·영문 Lorem Ipsum)·버튼·카드·리뷰·JSON 더미 데이터·UX 라이팅·길이 테스트까지 9가지 톤으로 한 번에 생성.',
  keywords: [
    '더미텍스트', '더미데이터', '로렘입숨', 'lorem ipsum', '한글더미', 'UI목업',
    'JSON 더미', 'mock data', 'placeholder text', '카드 목업', 'UX 라이팅',
    '버튼 카피', '리뷰 더미', '회원 더미데이터', 'CSV 더미', '테스트 데이터',
  ],
})

export default function LoremPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📝 더미 텍스트·UI 콘텐츠 생성기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        문단·버튼·카드·리뷰·JSON 더미 데이터까지 — UI 목업과 디자인 시안에 바로 쓸 수 있는 9가지 톤의 종합 더미 콘텐츠 생성 도구입니다.
      </p>

      <LoremClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 도구 개요 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>이 도구가 해결하는 문제</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            UI 디자이너와 프론트엔드 개발자는 시안 작업과 프로토타이핑 단계에서 항상 같은 고민에 부딪힙니다. <strong style={{ color: 'var(--text)' }}>실제 콘텐츠가 없으니 임시 텍스트로 채워야 하는데, 단순 Lorem Ipsum은 한국어 환경의 글자 폭과 줄바꿈을 반영하지 못합니다.</strong> 또한 카드·리뷰·회원 정보·주문 같은 구조화된 데이터도 함께 필요합니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 도구는 <strong style={{ color: 'var(--text)' }}>문단 / UI 요소 / JSON 더미 데이터 / 카드 UI 목업 / UX 라이팅 / 길이 테스트</strong> 6가지 탭을 한 곳에 모아 — 톤(친근체·전문가·커머스·SaaS·금융·헬스·교육·게임 등 9종)에 맞춰 일관된 분위기의 콘텐츠를 한꺼번에 생성합니다.
          </p>
        </section>

        {/* 2. 6 tabs guide */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>6가지 탭 활용 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { icon: '📝', title: '문단', desc: '한글·영문 Lorem Ipsum 5단계 길이(아주 짧게~매우 길게) × 9가지 톤. 1~20문단 슬라이더로 분량 조절.' },
              { icon: '🎨', title: 'UI 요소', desc: '타이틀·서브타이틀·버튼·카드 제목·상품명·리뷰·댓글·알림·에러·빈 상태·온보딩·가격 플랜·FAQ 등 19종.' },
              { icon: '📊', title: 'JSON 더미 데이터', desc: '회원·상품·주문·리뷰·게시글·거래·댓글·이벤트·주소·할일 10종 × JSON/JSONL/CSV/YAML/Markdown/HTML/JSX/TS 8개 포맷.' },
              { icon: '🃏', title: '카드 UI 목업', desc: '상품·아티클·프로필 3가지 스타일로 실제 카드를 시각적으로 렌더링. 그대로 스크린샷 가능.' },
              { icon: '✍️', title: 'UX 라이팅', desc: '로그인 실패·결제 실패·삭제 확인·빈 상태 등 5가지 시나리오를 톤별로 자동 작성. 제목·본문·버튼 카피 한 세트.' },
              { icon: '📏', title: '길이 테스트', desc: '5단계 길이 샘플 + truncate 1·2·3줄 비교 + 띄어쓰기 없는 한글, URL, 이모지 등 오버플로 케이스 박스.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{item.icon}</div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>{item.title}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. tone guide */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>9가지 톤이 만드는 차이</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            같은 &quot;시작하기&quot; 문구도 톤에 따라 분위기가 완전히 달라집니다. 디자인 시안의 무드보드를 정한 뒤, 이에 맞는 톤을 선택해 일관된 더미 콘텐츠를 채우면 시안의 설득력이 올라갑니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { tone: '기본', sample: '시작하기' },
              { tone: '친근체', sample: '지금 시작해요!' },
              { tone: '전문가', sample: '프로젝트 시작' },
              { tone: '커머스', sample: '바로 구매' },
              { tone: 'SaaS', sample: '무료로 시작하기' },
              { tone: '금융', sample: '포트폴리오 보기' },
              { tone: '헬스', sample: '오늘의 운동 시작' },
              { tone: '교육', sample: '수업 시작' },
              { tone: '게임', sample: '전투 시작!' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{t.tone}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600 }}>{t.sample}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. JSON formats */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>JSON 더미 데이터 8가지 출력 형식</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            &quot;회원 정보 50명&quot;을 만든다고 할 때, 어디에 붙여넣을지에 따라 필요한 형식이 다릅니다. 본 도구는 한 번 생성한 데이터를 8가지 포맷 중 어느 것으로든 즉시 변환합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <ul style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
              <li><strong style={{ color: 'var(--text)' }}>JSON</strong> — REST API mock, fixture 파일, 서버 응답 예시</li>
              <li><strong style={{ color: 'var(--text)' }}>JSON Lines (JSONL)</strong> — 로그 파이프라인, 스트리밍 처리, BigQuery 적재</li>
              <li><strong style={{ color: 'var(--text)' }}>CSV</strong> — Excel·Numbers·Sheets 붙여넣기, DB import</li>
              <li><strong style={{ color: 'var(--text)' }}>YAML</strong> — 설정 파일, k8s manifest 더미값, GitHub Actions matrix</li>
              <li><strong style={{ color: 'var(--text)' }}>Markdown 표</strong> — README, Notion 페이지, GitHub 이슈/PR 본문</li>
              <li><strong style={{ color: 'var(--text)' }}>HTML 표</strong> — 정적 시안 페이지, 디자인 검토용 표 미리보기</li>
              <li><strong style={{ color: 'var(--text)' }}>JSX 배열</strong> — React/Next.js 컴포넌트에 바로 붙여넣는 const 배열</li>
              <li><strong style={{ color: 'var(--text)' }}>TypeScript interface</strong> — 타입 정의 + const data 한 세트로 즉시 사용</li>
            </ul>
          </div>
        </section>

        {/* 5. when to use length test */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>길이 테스트 탭이 잡아내는 버그</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            카드·리스트·테이블 컴포넌트의 80%는 <strong style={{ color: 'var(--text)' }}>실제 데이터가 들어오면 깨집니다.</strong> 디자인 단계에서 적당한 길이의 더미 텍스트로 채우면 이상해 보이지 않지만, 실제로는 다양한 길이의 한국어 텍스트가 들어오기 때문입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { case: '제목이 모바일에서 3줄 이상', why: 'truncate 2줄로 처리할지 줄높이 기반 height 고정인지 결정해야 함' },
              { case: 'URL/긴 영문이 컨테이너를 뚫음', why: 'word-break: break-word 또는 overflow-wrap: anywhere 적용' },
              { case: '띄어쓰기 없는 한글', why: '한국어 사용자가 종종 입력하는 패턴 — 줄바꿈 안 되는 이슈' },
              { case: '이모지 + 한글 혼용', why: '폰트 fallback이 일관된지, 줄높이가 흔들리지 않는지' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}>{c.case}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{c.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. UX writing */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>UX 라이팅: 톤이 사용자 경험을 만든다</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            &quot;삭제하시겠습니까?&quot;라는 같은 질문도 — 친근체로 작성하면 부드럽지만 안전감이 약하고, 전문가 톤으로 작성하면 무겁지만 신뢰가 갑니다. 본 도구의 UX 라이팅 탭은 동일한 시나리오를 9가지 톤으로 즉시 비교할 수 있어, 제품의 분위기에 맞는 카피를 선택하는 데 도움이 됩니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            특히 <strong style={{ color: 'var(--text)' }}>로그인 실패·결제 실패·삭제 확인</strong> 같은 부정적 상황에서의 카피는 사용자 인상을 결정합니다. 톤을 바꿔보며 가장 적절한 표현을 찾아보세요.
          </p>
        </section>

        {/* 7. legal */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>저작권·사용 권한</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 도구가 생성하는 모든 텍스트와 데이터는 <strong style={{ color: 'var(--text)' }}>무작위로 조합된 가상 정보</strong>이며, 저작권이 발생하지 않습니다. 개인 프로젝트, 상업 프로젝트, 클라이언트 시안 어디에든 자유롭게 사용 가능합니다. 단, 이름·이메일·전화번호 등은 가상 데이터이므로 실제 인물을 가리키지 않습니다.
          </p>
        </section>

        {/* 8. tips */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>활용 팁 5가지</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              '디자인 시스템 검수 시 — 길이 테스트 탭의 truncate 비교를 그대로 스크린샷해 가이드 문서에 첨부',
              '시안 발표 — 카드 UI 목업 탭에서 실제 톤에 맞춰 카드 6~9개 생성 후 시안에 그대로 사용',
              'API mock — JSON 데이터 탭으로 50개 레코드를 만들고 MSW·json-server에 그대로 투입',
              'UX 라이팅 회의 — 동일 시나리오를 톤별로 비교해 PM·디자이너·라이터가 함께 결정',
              'a11y 검증 — 길이 테스트 탭의 오버플로 케이스로 스크린리더가 끊김 없이 읽는지 확인',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: '10px', alignItems: 'baseline', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>{i + 1}.</span>
                <span style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.7 }}>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '기존 /tools/dev/lorem URL을 그대로 사용해도 되나요?',
                a: '네. 기존 URL은 그대로 유지되며, 기능만 대폭 확장되었습니다. 외부 링크나 검색 결과에서 들어오시면 새 6탭 인터페이스를 바로 사용할 수 있습니다.',
              },
              {
                q: '왜 단순 Lorem Ipsum이 아니라 한국어 더미가 필요한가요?',
                a: '한국어는 영문보다 글자 폭이 넓고 자간·줄바꿈 규칙이 다릅니다. Lorem Ipsum으로 보기 좋게 짠 카드도 한국어가 들어가면 깨지는 경우가 많습니다. 본 도구는 <strong>한국어의 실제 자간을 반영한 더미</strong>를 제공해 시안과 실제 사이의 격차를 줄입니다.',
              },
              {
                q: 'JSON 데이터의 이름·이메일·전화번호는 실제 정보인가요?',
                a: '아닙니다. 모두 사전에 정의된 <strong>가상 풀에서 무작위로 조합</strong>한 데이터입니다. 실제 인물·서비스와는 무관하며, 개인정보 이슈 없이 자유롭게 사용 가능합니다.',
              },
              {
                q: '같은 결과를 다시 만들 수는 없나요? (시드 고정)',
                a: '현재는 매 클릭마다 새 무작위 데이터가 생성됩니다. 시안에서 특정 데이터가 마음에 들면 즉시 복사해 두시는 것을 권장합니다. <strong>시드 기반 재현 기능은 추후 추가를 검토 중</strong>입니다.',
              },
              {
                q: '한 번에 얼마나 많은 데이터를 생성할 수 있나요?',
                a: '<strong>문단 1~20개, UI 요소 1~30개, JSON 1~50개, 카드 2~12개</strong>까지 슬라이더로 조정할 수 있습니다. 더 많은 양이 필요하면 여러 번 생성해 결과를 합쳐 사용하세요.',
              },
            ].map((f, i) => (
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

        {/* 관련 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>관련 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { href: '/tools/dev/charcount',     icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',           desc: 'JSON 정렬·압축·유효성 검사' },
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더',  desc: '텍스트 ↔ Base64 즉시 변환' },
              { href: '/tools/dev/color',         icon: '🎨', name: '색상 코드 변환기',      desc: 'HEX·RGB·HSL 즉시 변환' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 값 변환기',         desc: 'px·rem·clamp() 변환' },
              { href: '/tools/dev/number-base',   icon: '🔢', name: '진법 변환기',           desc: '2·8·10·16진 + 비트 시각화' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
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
