import type { Metadata } from 'next'
import LoremClient from './LoremClient'

export const metadata: Metadata = {
  title: '더미 텍스트 생성기 — Lorem Ipsum 한글 영문 | Youtil',
  description: '한글 및 영문 더미 텍스트(Lorem Ipsum)를 문단·문장·단어 단위로 생성합니다. UI 목업, 디자인 시안, 개발 테스트에 유용.',
  keywords: ['로렘입숨', '더미텍스트생성기', 'lorem ipsum', '한글더미텍스트', '텍스트생성기', '목업텍스트'],
}

export default function LoremPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자·텍스트</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📝 더미 텍스트(Lorem Ipsum) 생성기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        UI 목업과 디자인 시안에 사용할 한글·영문 더미 텍스트를 문단 단위로 생성합니다.
      </p>

      <LoremClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Lorem Ipsum이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            Lorem Ipsum은 출판 및 그래픽 디자인 분야에서 사용되는 표준 더미 텍스트입니다. 기원전 45년 키케로의 라틴어 문헌에서 유래했으며, 1500년대부터 인쇄 산업의 표준 더미 텍스트로 사용되어 왔습니다. 현재는 웹 개발, UI 디자인, 목업 작성 등 다양한 분야에서 내용보다 디자인에 집중할 수 있도록 의미 없는 자리채움 텍스트로 활용됩니다.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>더미 텍스트 활용 사례</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { icon: '🎨', title: 'UI/UX 디자인', desc: '피그마, 스케치 등에서 레이아웃 설계 시 실제 콘텐츠 대신 삽입해 디자인에 집중합니다.' },
              { icon: '💻', title: '웹 개발', desc: 'HTML/CSS 테스트, 반응형 레이아웃 확인 시 실제 텍스트가 없을 때 사용합니다.' },
              { icon: '📄', title: '문서·인쇄물', desc: '브로슈어, 전단지, 책자 등의 레이아웃 시안 제작 시 활용합니다.' },
              { icon: '🤖', title: 'AI/ML 테스트', desc: '텍스트 처리 알고리즘, 자연어 처리 모델 테스트에 대량 텍스트가 필요할 때 활용합니다.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: 'Lorem Ipsum 텍스트는 왜 라틴어인가요?', a: 'Lorem Ipsum의 기원은 키케로(Cicero)의 "De Finibus Bonorum et Malorum" (기원전 45년)입니다. 중세 인쇄업자가 이 라틴어 텍스트를 변형해 더미 텍스트로 사용했고, 이후 표준이 되었습니다. 라틴어는 일반인이 내용을 읽으려 하지 않아 디자인에 집중하기 좋습니다.' },
              { q: '한글 더미 텍스트는 왜 필요한가요?', a: '한국어 웹사이트나 앱 개발 시 한글 글자폭이 영문과 다르기 때문에, 실제 환경과 유사한 테스트를 위해 한글 더미 텍스트가 필요합니다. 특히 줄바꿈, 폰트 렌더링, 레이아웃 테스트에 유용합니다.' },
              { q: '생성된 텍스트를 상업적으로 사용해도 되나요?', a: '네, 본 생성기가 만드는 텍스트는 저작권이 없는 무의미한 텍스트입니다. 개인 프로젝트, 상업 프로젝트 어디서든 자유롭게 사용하실 수 있습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}