import LoremClient from './LoremClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Link from 'next/link'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/art/lorem',
  title: '더미 텍스트 생성기 — 문단·버튼·카드·JSON 더미 데이터',
  description: '한글·영문 문단, 버튼·카드·리뷰 UI 카피, 회원·상품 JSON/CSV 더미까지 9가지 톤으로 생성. truncate 길이 테스트·UX 라이팅 시나리오 포함, UI 목업에 바로 붙여 쓰는 더미 콘텐츠 생성기.',
  keywords: [
    '더미텍스트', '더미데이터', '로렘입숨', 'lorem ipsum', '한글더미', 'UI목업',
    'JSON 더미', 'mock data', 'placeholder text', '카드 목업', 'UX 라이팅',
    '버튼 카피', '리뷰 더미', '회원 더미데이터', 'CSV 더미', '테스트 데이터',
  ],
})

const FAQ_LD = [
              {
                q: '생성한 JSON 더미를 MSW·json-server 목 서버에 어떻게 쓰나요?',
                a: 'JSON 더미 데이터 탭에서 회원·상품·주문 등 원하는 종류를 골라 최대 50개 레코드를 생성한 뒤, 복사한 JSON 배열을 json-server의 db.json이나 MSW 핸들러의 응답 본문에 그대로 붙여 넣으면 됩니다. REST API 응답 예시·fixture 파일로도 바로 쓸 수 있고, 필요하면 JSONL·CSV·TypeScript interface 등 8가지 포맷으로 즉시 변환됩니다.',
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
            ]

export default function LoremPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>예술·창작</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="art" />더미 텍스트 생성기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        문단·버튼·카드·리뷰·JSON 더미를 <strong style={{ color: 'var(--text)' }}>UI 목업에 바로</strong> 붙여 쓸 수 있게.
      </p>

      <LoremClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 도구 개요 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>이 도구가 해결하는 문제</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            UI 디자이너와 프론트엔드 개발자는 시안 작업과 프로토타이핑 단계에서 항상 같은 고민에 부딪힙니다. <strong style={{ color: 'var(--text)' }}>실제 콘텐츠가 없으니 임시 텍스트로 채워야 하는데, 단순 Lorem Ipsum은 한국어 환경의 글자 폭과 줄바꿈을 반영하지 못합니다.</strong> 또한 카드·리뷰·회원 정보·주문 같은 구조화된 데이터도 함께 필요합니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 도구는 <strong style={{ color: 'var(--text)' }}>문단 / UI 요소 / JSON 더미 데이터 / 카드 UI 목업 / UX 라이팅 / 길이 테스트</strong> 6가지 탭을 한 곳에 모아 — 톤(친근체·전문가·커머스·SaaS·금융·헬스·교육·게임 등 9종)에 맞춰 일관된 분위기의 콘텐츠를 한꺼번에 생성합니다.
          </p>
        </section>

        {/* 2. 6 tabs guide */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>6가지 탭 활용 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '10px' }}>
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
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, overflowWrap: 'anywhere' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. tone guide */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>9가지 톤이 만드는 차이</h2>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>JSON 더미 데이터 8가지 출력 형식</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            &quot;회원 정보 50명&quot;을 만든다고 할 때, 어디에 붙여넣을지에 따라 필요한 형식이 다릅니다. 본 도구는 한 번 생성한 데이터를 8가지 포맷 중 어느 것으로든 즉시 변환합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 2, listStyle: 'none', padding: 0, margin: 0 }}>
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>길이 테스트 탭이 잡아내는 버그</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            카드·리스트·테이블 컴포넌트의 상당수는 <strong style={{ color: 'var(--text)' }}>실제 데이터가 들어오면 깨집니다.</strong> 디자인 단계에서 적당한 길이의 더미 텍스트로 채우면 이상해 보이지 않지만, 실제로는 다양한 길이의 한국어 텍스트가 들어오기 때문입니다.
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
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>UX 라이팅: 톤이 사용자 경험을 만든다</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            &quot;삭제하시겠습니까?&quot;라는 같은 질문도 — 친근체로 작성하면 부드럽지만 안전감이 약하고, 전문가 톤으로 작성하면 무겁지만 신뢰가 갑니다. 본 도구의 UX 라이팅 탭은 동일한 시나리오를 9가지 톤으로 즉시 비교할 수 있어, 제품의 분위기에 맞는 카피를 선택하는 데 도움이 됩니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            특히 <strong style={{ color: 'var(--text)' }}>로그인 실패·결제 실패·삭제 확인</strong> 같은 부정적 상황에서의 카피는 사용자 인상을 결정합니다. 톤을 바꿔보며 가장 적절한 표현을 찾아보세요.
          </p>
        </section>

        {/* 6b. lorem ipsum origin */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>Lorem Ipsum은 어디서 왔나 — 2,000년 전 키케로</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            Lorem Ipsum은 무작위 음절 뭉치가 아니라 <strong style={{ color: 'var(--text)' }}>실제 고전 문헌의 조각</strong>입니다. 원전은 기원전 45년 키케로(Cicero)의 윤리학 저작 「De finibus bonorum et malorum」 1권 32~33절 — 원문의 &quot;neque porro quisquam est, qui <strong style={{ color: 'var(--text)' }}>dolorem ipsum</strong>, quia dolor sit, <strong style={{ color: 'var(--text)' }}>amet, consectetur, adipisci velit</strong>…&quot; 대목에서 필러 첫 문장이 나왔고, 필러 후반부의 &quot;sed ut perspiciatis&quot; &quot;at vero eos et accusamus&quot; 같은 문구도 같은 32~33절과 연속으로 대응합니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
            <table style={{ width: '100%', minWidth: '480px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {['키케로 원문 (기원전 45년)', '표준 필러 텍스트', '변화'].map((h, i) => (
                    <th key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '8px 10px', textAlign: 'left', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { src: 'dolorem ipsum', out: 'Lorem ipsum', how: '앞 음절 do- 절단' },
                  { src: 'adipisci velit', out: 'adipiscing elit', how: '어형 변형' },
                  { src: 'eius modi tempora incidunt', out: 'eiusmod tempor incididunt', how: '축약·변형' },
                  { src: 'ut labore et dolore magnam aliquam', out: 'ut labore et dolore magna aliqua', how: '어미 탈락' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid var(--border)', padding: '8px 10px', color: 'var(--muted)', fontStyle: 'italic' }}>{r.src}</td>
                    <td style={{ border: '1px solid var(--border)', padding: '8px 10px', color: 'var(--text)' }}>{r.out}</td>
                    <td style={{ border: '1px solid var(--border)', padding: '8px 10px', color: 'var(--muted)' }}>{r.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            표준 필러 열은 본 도구의 영문 문단 탭이 생성하는 텍스트와 동일합니다(본 도구 기준값).
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            필러가 dolorem이 아니라 <strong style={{ color: 'var(--text)' }}>lorem으로 시작하는 이유</strong>에도 물증이 있습니다. 1914년 Loeb Classical Library판(라틴·영문 대역) 스캔을 보면 라틴어 텍스트 페이지가 정확히 &quot;lorem ipsum quia dolor sit amet…&quot;로 시작합니다 — &apos;dolorem&apos;의 &apos;do-&apos;가 앞 페이지 끝에 걸려 잘렸고, 필러 텍스트는 이 페이지 첫머리를 그대로 따른 것입니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            이 출처를 밝혀낸 사람은 고전학자 출신으로 미국 햄든-시드니 칼리지 출판부장을 지낸 <strong style={{ color: 'var(--text)' }}>리처드 매클린톡(Richard McClintock)</strong>입니다(흔히 &apos;라틴어 교수&apos;로 소개되지만 부정확한 표기). 필러에 든 희귀 라틴어 consectetur의 고전 문헌 인용례를 역추적해 키케로 원전을 확인했고, 1990년대 디자인 잡지 Before &amp; After에 서한을 보내자 잡지가 &apos;Lorem Oopsum&apos;이라는 제목으로 정정을 실었습니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>&apos;1500년대 무명 인쇄공&apos; 통설의 반전</p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              &quot;1500년대에 어느 무명 인쇄공이 활자 견본용으로 만들었다&quot;는 유명한 이야기는 매클린톡 본인의 미확인 회고가 출처였습니다. 정작 본인도 그 옛 견본집을 다시 찾지 못했고, 확실히 추적된 가장 오래된 사용은 <strong style={{ color: 'var(--text)' }}>1966년 Letraset 전사(레터링) 시트</strong>라고 인정했습니다. 통설의 진원지였던 lipsum.com조차 최근 이 서술을 공식 개정해(2026-07 확인 기준), 지금은 1966년 Letraset이 런던 세인트브라이드 인쇄도서관 사서 제임스 모즐리(James Mosley)와 함께 1914년판 키케로 번역본을 재배열해 만들었다는 설명으로 바뀌었습니다(모즐리가 직접 재배열까지 했는지 자문에 그쳤는지는 자료마다 서술이 다릅니다). 최근 재조사에서는 1966년 시트 실물을 1914년판과 대조하기도 했습니다. 한국어 웹 상당수에는 아직 옛 &apos;1500년대&apos; 서술이 그대로 남아 있습니다. 이후 1980년대 Aldus PageMaker에 더미 텍스트로 번들되면서 데스크톱 출판과 함께 업계 표준으로 굳어졌습니다.
            </p>
          </div>
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: '8px' }}>
              &quot;No one rejects, dislikes or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful.&quot;
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7 }}>
              — H. Rackham 영역(1914년 Loeb판). 자체 번역: &quot;쾌락 그 자체를 거부하거나 싫어하거나 피하는 사람은 없다. 다만 쾌락을 이성적으로 추구할 줄 모르는 이들에게 극심한 고통이라는 결과가 따르기 때문이다.&quot; 쾌락과 고통에 관한 진지한 윤리학 논증이 &apos;의미 없는 채움글&apos;의 원료가 된 셈입니다.
            </p>
          </div>
        </section>

        {/* 6c. why korean dummy */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>한국어 더미 텍스트는 왜 따로 필요한가</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            한글은 글자 폭과 줄바꿈 특성이 라틴 알파벳과 다릅니다. 같은 폭 안에 들어가는 글자 수, 줄이 바뀌는 위치, 단어가 끊기는 방식이 달라서 <strong style={{ color: 'var(--text)' }}>Lorem Ipsum으로 보기 좋게 맞춘 카드·버튼·제목이 한국어 실데이터를 넣는 순간 다르게 흐르는</strong> 일이 흔합니다. 그래서 실무에서는 목표 언어와 같은 문자 체계의 더미 텍스트로 조판을 확인하는 것이 통용 관행입니다. 본 도구의 문단 탭이 한글 더미를 9가지 톤으로 따로 제공하고, 길이 테스트 탭이 띄어쓰기 없는 한글·긴 URL 같은 극단 케이스를 별도로 두는 이유입니다.
          </p>
        </section>

        {/* 7. legal */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>저작권·사용 권한</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 도구가 생성하는 모든 텍스트와 데이터는 <strong style={{ color: 'var(--text)' }}>무작위로 조합된 가상 정보</strong>이며, 저작권이 발생하지 않습니다. 개인 프로젝트, 상업 프로젝트, 클라이언트 시안 어디에든 자유롭게 사용 가능합니다. 단, 이름·이메일·전화번호 등은 가상 데이터이므로 실제 인물을 가리키지 않습니다.
          </p>
        </section>

        {/* 8. tips */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>활용 팁 5가지</h2>
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
                <span style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
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

        {/* 관련 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 700, marginBottom: '14px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { href: '/tools/art/charcount',     icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',           desc: 'JSON 정렬·압축·유효성 검사' },
              { href: '/tools/dev/base64',        icon: '🔐', name: 'Base64 인코더/디코더',  desc: '텍스트 ↔ Base64 즉시 변환' },
              { href: '/tools/art/color',         icon: '🎨', name: '색상 코드 변환기',      desc: 'HEX·RGB·HSL 즉시 변환' },
              { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 단위 변환기',         desc: 'px·rem·clamp() 변환' },
              { href: '/tools/dev/number-base',   icon: '🔢', name: '진법 변환기',           desc: '2·8·10·16진 + 비트 시각화' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center' }}>
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
