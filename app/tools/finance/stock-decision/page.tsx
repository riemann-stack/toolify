import Link from 'next/link'
import StockDecisionClient from './StockDecisionClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/finance/stock-decision',
  title: '주식 매도·매수 심리 진단 — 행동경제학 7대 편향 자가진단',
  description: '팔까 살까 망설일 때, 행동경제학 7개 편향(FOMO·손실회피·매몰비용 등)으로 내 결정에 끼어든 감정을 점검하는 자가진단 도구. 투자 권유·종목 추천 X.',
  keywords: ['주식 고민', '주식 결정', '주식 사야할까', '팔까 살까', '매수 매도 심리', '행동경제학 투자', 'FOMO', '손실회피', '매몰비용', '결정장애', '투자 심리'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
}
const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

const FAQ_LD = [
  { "q":"정말 무작위가 인간보다 나은가요?","a":"장기·평균적으로는 그런 통계가 많습니다. DALBAR(매년), Cass Business School(2013, 1만 무작위 포트폴리오), Burton Malkiel(1973)·Lusha 침팬지(2009)·Orlando 고양이(2012) 등. 단, 이는 인간 평균 이야기 — 일관된 원칙으로 투자하는 소수는 무작위보다 훨씬 잘합니다. 본 도구의 메시지는 &ldquo;무작위가 천재다&rdquo;가 아니라 &ldquo;인간이 자기 편향을 이기는 게 어렵다&rdquo;입니다." },
  { "q":"이 도구로 종목 추천도 받을 수 있나요?","a":"아니요 — 절대 X. 본 도구는 종목 정보 검색·DB·추천 기능을 제공하지 않습니다. 사용자가 입력한 종목명도 화면에만 표시되고 서버·localStorage 저장 X. 종목 정보는 DART 증권신고서·본인 거래 증권사 안내에서 직접 확인." },
  { "q":"자가진단 결과가 빨강(🔴)이면 사면 안 되나요?","a":"금지가 아니라 보류 권장입니다. 매수/매도 권유는 절대 X. 빨강이 나오면: 24~48시간 보류 후 재진단 같은 결정이 다시 나오면 본인 판단 신뢰 다른 결정이 나오면 그게 본심 모든 결정의 책임은 본인에게 있습니다." },
  { "q":"친칠라 모드의 주인공 Lusha는 무슨 동물인가요?","a":"Lusha는 2009년 러시아 서커스 침팬지입니다 (쥐가 아닙니다). 종목명 큐브 30개 중 8개를 골라 펀드 매니저 94%를 이긴 이야기에서 영감을 받았고, 본 도구 마스코트는 더 친근한 친칠라로 표현했을 뿐 — 동물 자체가 중요한 게 아니라 &ldquo;인간 편향이 없는 무작위 선택의 힘&rdquo;이 핵심." },
  { "q":"무작위 결과를 그대로 따르면 되나요?","a":"아니요 — 결과를 보고 5초 멈춰 자문해보세요. &ldquo;이 결과를 봤을 때 어떤 감정이 드는가?&rdquo; 안도·거부감 같은 반응이 본인 상태를 점검하는 신호입니다. 무작위 모드는 결정을 내려주는 게 아니라 감정 반응을 비춰보는 보조 장치이며, 결과를 그대로 따르라는 뜻이 아닙니다." },
  { "q":"자가진단 기록은 어디에 저장되나요?","a":"본인 브라우저(localStorage)에만 저장 — 서버 전송 X. 저장 내용은 날짜·방향·점수만 (종목명·매수가 등 민감 정보 X). 다른 기기·브라우저 자동 동기화 X. 브라우저 데이터 삭제 시 사라짐. 도구 내 &ldquo;전체 기록 삭제&rdquo; 버튼으로 즉시 정리 가능." },
  { "q":"다른 youtil 주식 도구와 어떻게 다른가요?","a":"📊 주식 물타기 계산기: 평단·물타기 계산 📈 복리 계산기: 장기 수익 시뮬 💰 월배당 목표 자산: 배당주 설계 💰 공모주 청약 증거금: IPO 계산 🐭 본 도구: 의사결정 심리·자가진단·무작위 보조 본 도구는 계산이 아닌 의사결정 망설임 해결에 특화." }
]

export default function StockDecisionPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧠 주식 매도·매수 심리 진단
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        팔까 살까 망설일 때, <strong style={{ color: 'var(--text)' }}>행동경제학 7대 편향 자가진단</strong>으로 내 결정에 끼어든 감정을 먼저 점검하세요. <strong style={{ color: 'var(--text)' }}>투자 권유·종목 추천이 아닙니다.</strong>
      </p>

      <StockDecisionClient />

      <GuideDivider />

      {/* 1. 왜 이 도구가 필요한가 */}
      <h2 style={sectionTitle}>📊 왜 인간은 자기 편향을 이기기 어려운가</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          DALBAR 보고서가 매년 보여주는 충격적 사실 — <strong>일반 투자자는 본인이 산 펀드 자체 수익률보다 절반 이하만 가져갑니다</strong>. 이유는 단순:
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, marginTop: '10px', paddingLeft: '18px', marginBottom: 0 }}>
          <li>오를 때 사고 (FOMO) → 고점 매수</li>
          <li>떨어질 때 팔고 (손실 회피) → 저점 매도</li>
          <li>본전만 회복하면 팔고 (매몰 비용) → 짧은 차익</li>
          <li>SNS·뉴스에 휘둘리고 (군중 심리) → 상투 잡기</li>
        </ul>
        <p style={{ fontSize: '13px', color: 'var(--accent)', lineHeight: 1.7, marginTop: '14px', marginBottom: 0 }}>
          → 무작위는 이런 편향이 없어서 평균을 가져갑니다. <strong>인간이 자기 자신(편향)을 이기지 못해서</strong>지, 무작위가 천재인 건 아닙니다.
        </p>
      </div>

      {/* 2. 5가지 무작위 모드 비교 */}
      <h2 style={sectionTitle}>🎲 5가지 무작위 모드 — 영감 사례</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { emoji: '🪙', name: '동전 던지기', story: '가장 단순. 50:50 확률.', use: 'BUY/SELL 양자택일' },
          { emoji: '🐭', name: '친칠라 픽', story: 'Lusha 침팬지 (러시아, 2009) — 펀드 매니저 94% 이김', use: '3~8개 옵션 픽' },
          { emoji: '🎯', name: '다트', story: 'Burton Malkiel 원숭이 (1973)', use: '4분면 결정' },
          { emoji: '🐱', name: '고양이 발', story: 'Orlando 고양이 (영국, 2012) — Observer 1년 1등', use: '여러 옵션 톡톡' },
          { emoji: '🎰', name: '룰렛', story: 'Cass Business School (2013) — 1만 원숭이', use: '시각적 회전' },
        ].map((m, i) => (
          <div key={i} style={{ ...card, marginBottom: 0 }}>
            <p style={{ fontSize: '24px', marginBottom: '6px' }}>{m.emoji}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>{m.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '6px', lineHeight: 1.5 }}>{m.story}</p>
            <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0 }}>적합: {m.use}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        ⚠️ 위 사례(Lusha·Orlando·Malkiel·Cass·DALBAR)는 특정 시점의 일화·연구입니다. 과거 결과가 미래·재현·투자 성과를 보장하지 않으며, 종목 추천이 아니라 &ldquo;인간이 자기 편향을 이기기 어렵다&rdquo;는 의사결정 심리 교훈으로만 인용합니다.
      </p>

      {/* 3. 자가진단 활용 가이드 */}
      <h2 style={sectionTitle}>🧠 자가진단 활용 가이드</h2>
      <div style={card}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.8, margin: '0 0 12px' }}>
          본 도구의 <strong>자가진단</strong>은 매수·매도·보유 3가지 상황별로 10개 질문을 제시. 위험 신호 vs 이성 신호의 격차로 4단계 결과:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { color: '#059669', name: '🟢 비교적 이성적', desc: '본인 판단 신뢰. 다만 과신 위험 — 5초 더 생각.' },
            { color: '#FFD93E', name: '🟡 균형 (보류 권장)', desc: '판단·감정 비슷. 1~2일 보류 후 재점검.' },
            { color: '#EA580C', name: '🟠 감정 ↑ (신중)', desc: '분할 진행·소액 테스트로 영향 줄이기.' },
            { color: '#DC2626', name: '🔴 강한 감정 신호', desc: '24~48시간 보류 강력 권장. 정말 같은 결정인지 재검토.' },
          ].map((b, i) => (
            <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${b.color}55`, borderLeft: `3px solid ${b.color}`, borderRadius: '8px', padding: '10px 14px' }}>
              <p style={{ fontSize: '13px', color: b.color, fontWeight: 700, marginBottom: '4px' }}>{b.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 행동경제학 7대 편향 */}
      <h2 style={sectionTitle}>🚨 투자자가 자주 빠지는 7대 편향</h2>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg3)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>편향</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>전형적 증상</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['😰 FOMO', '"이번엔 다르다·놓치면 후회한다"'],
              ['🛡️ 손실 회피', '+10% 무덤덤, -10% 잠 못잠'],
              ['🪨 매몰 비용', '"이미 잃었으니 본전만 오면..."'],
              ['🔍 확증 편향', '내 종목 호재만 찾아 읽음'],
              ['💪 과신', '단타 3회 성공 → 신용·미수까지'],
              ['⚓ 앵커링', '"10만 원에 샀으니 9만에 팔면 손해"'],
              ['👥 군중 심리', '"개미 90% 매수" 보고 따라감'],
            ].map(([name, sym], i) => (
              <tr key={i}>
                <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{name}</td>
                <td style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>{sym}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        💡 도구 안의 <strong>📚 왜 지는가</strong> 탭에서 각 편향 상세 + 대처법 확인.
      </p>

      {/* 5. 사용 시나리오 */}
      <h2 style={sectionTitle}>💡 추천 사용 흐름</h2>
      <div style={card}>
        <ol style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 2, paddingLeft: '24px', margin: 0 }}>
          <li><strong style={{ color: 'var(--accent)' }}>🧠 자가진단</strong>으로 감정 신호 먼저 점검</li>
          <li>🟢 녹색이면 본인 판단대로 진행 (단, 5초 더 생각)</li>
          <li>🟡🟠 노랑·주황이면 24~48시간 보류 + 다음날 재진단</li>
          <li>🔴 빨강이면 매수·매도 강력 보류</li>
          <li>그래도 결정 못하면 — <strong style={{ color: 'var(--accent)' }}>🎲 결정 보조</strong>로 친칠라·동전·다트</li>
          <li>무작위 결과를 보고 5초 멈춤 — 어떤 감정(안도·거부감)이 드는지 관찰</li>
          <li>그 감정 반응이 점검 신호 — 결과를 그대로 따르라는 뜻이 아닙니다</li>
        </ol>
      </div>

      {/* 6. FAQ — accordion */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 정말 무작위가 인간보다 나은가요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>장기·평균적</strong>으로는 그런 통계가 많습니다. DALBAR(매년), Cass Business School(2013, 1만 무작위 포트폴리오), Burton Malkiel(1973)·Lusha 침팬지(2009)·Orlando 고양이(2012) 등. 단, 이는 <strong>인간 평균</strong> 이야기 — 일관된 원칙으로 투자하는 소수는 무작위보다 훨씬 잘합니다. 본 도구의 메시지는 &ldquo;무작위가 천재다&rdquo;가 아니라 &ldquo;<strong>인간이 자기 편향을 이기는 게 어렵다</strong>&rdquo;입니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 이 도구로 종목 추천도 받을 수 있나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: '#DC2626' }}>아니요 — 절대 X.</strong> 본 도구는 종목 정보 검색·DB·추천 기능을 제공하지 않습니다. 사용자가 입력한 종목명도 화면에만 표시되고 서버·localStorage 저장 X. 종목 정보는 <Link href="https://dart.fss.or.kr" target="_blank" style={{ color: 'var(--accent)' }}>DART 증권신고서</Link>·본인 거래 증권사 안내에서 직접 확인.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 자가진단 결과가 빨강(🔴)이면 사면 안 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>금지가 아니라 보류 권장</strong>입니다. 매수/매도 권유는 절대 X. 빨강이 나오면:
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>24~48시간 보류 후 재진단</li>
            <li>같은 결정이 다시 나오면 본인 판단 신뢰</li>
            <li>다른 결정이 나오면 그게 본심</li>
          </ul>
          모든 결정의 책임은 본인에게 있습니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 친칠라 모드의 주인공 Lusha는 무슨 동물인가요?</summary>
        <div style={faqAnswer}>
          Lusha는 <strong style={{ color: 'var(--text)' }}>2009년 러시아 서커스 침팬지</strong>입니다 (쥐가 아닙니다). 종목명 큐브 30개 중 8개를 골라 펀드 매니저 94%를 이긴 이야기에서 영감을 받았고, 본 도구 마스코트는 더 친근한 친칠라로 표현했을 뿐 — 동물 자체가 중요한 게 아니라 <strong>&ldquo;인간 편향이 없는 무작위 선택의 힘&rdquo;</strong>이 핵심.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 무작위 결과를 그대로 따르면 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>아니요</strong> — 결과를 보고 5초 멈춰 자문해보세요. <strong>&ldquo;이 결과를 봤을 때 어떤 감정이 드는가?&rdquo;</strong> 안도·거부감 같은 반응이 본인 상태를 점검하는 신호입니다. 무작위 모드는 <strong>결정을 내려주는 게 아니라 감정 반응을 비춰보는 보조 장치</strong>이며, 결과를 그대로 따르라는 뜻이 아닙니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 자가진단 기록은 어디에 저장되나요?</summary>
        <div style={faqAnswer}>
          본인 브라우저(localStorage)에만 저장 — 서버 전송 X. 저장 내용은 <strong>날짜·방향·점수만</strong> (종목명·매수가 등 민감 정보 X). 다른 기기·브라우저 자동 동기화 X. 브라우저 데이터 삭제 시 사라짐. 도구 내 &ldquo;전체 기록 삭제&rdquo; 버튼으로 즉시 정리 가능.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 다른 youtil 주식 도구와 어떻게 다른가요?</summary>
        <div style={faqAnswer}>
          <ul style={{ paddingLeft: 18, marginTop: 0 }}>
            <li>📊 <Link href="/tools/finance/stock" style={{ color: 'var(--accent)' }}>주식 물타기 계산기</Link>: 평단·물타기 계산</li>
            <li>📈 <Link href="/tools/finance/compound" style={{ color: 'var(--accent)' }}>복리 계산기</Link>: 장기 수익 시뮬</li>
            <li>💰 <Link href="/tools/finance/dividend" style={{ color: 'var(--accent)' }}>월배당 목표 자산</Link>: 배당주 설계</li>
            <li>💰 <Link href="/tools/finance/ipo-deposit" style={{ color: 'var(--accent)' }}>공모주 청약 증거금</Link>: IPO 계산</li>
            <li>🐭 <strong style={{ color: 'var(--text)' }}>본 도구</strong>: 의사결정 심리·자가진단·무작위 보조</li>
          </ul>
          본 도구는 <strong>계산</strong>이 아닌 <strong>의사결정 망설임</strong> 해결에 특화.
        </div>
      </details>

      {/* 7. 면책 */}
      <Disclaimer
        variant="finance"
        open
        sources={[
          { label: 'DART 증권신고서', href: 'https://dart.fss.or.kr' },
          { label: 'KIND 공시', href: 'https://kind.krx.co.kr' },
        ]}
      >
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>본 도구는 <strong>의사결정 보조·교육·재미</strong> 목적입니다.</li>
          <li>본 도구는 <strong>특정 종목·증권사 추천 X · 주가 예측 X · 투자 권유 X · 종목 정보 검색 X</strong>.</li>
          <li>자가진단 점수·무작위 결과 모두 <strong>본인 판단 보조</strong> — 모든 책임은 본인에게.</li>
          <li>학계 사례(Lusha·Orlando·Malkiel·Cass·DALBAR)는 의사결정 심리 교훈이며, &ldquo;무작위 투자 권장&rdquo;이 아닙니다.</li>
          <li>투자 판단 전 필수 확인: DART 증권신고서·KIND 공시(아래 근거 자료 링크)·본인 거래 증권사 안내.</li>
          <li>도움 받기: 금융감독원 1332 / 본인 거래 증권사 고객센터.</li>
        </ul>
      </Disclaimer>

      {/* 8. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/finance/stock" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📉</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>주식 물타기 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>평단·물타기·시나리오</div>
        </Link>
        <Link href="/tools/finance/ipo-deposit" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>공모주 청약 증거금</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>IPO 계산</div>
        </Link>
        <Link href="/tools/finance/compound" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>📈</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>복리 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>장기 수익 시뮬</div>
        </Link>
        <Link href="/tools/finance/dividend" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💰</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>월배당 목표 자산</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>배당주 설계</div>
        </Link>
        <Link href="/tools/life/random" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎲</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>랜덤 추첨기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>일반 추첨·룰렛</div>
        </Link>
        <Link href="/tools/life/monty-hall" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🚪</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>몬티홀 시뮬</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>확률 직관 교정</div>
        </Link>
      </div>
    </div>
  )
}
