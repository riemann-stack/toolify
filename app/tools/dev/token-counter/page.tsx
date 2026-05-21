import Link from 'next/link'
import TokenCounterClient from './TokenCounterClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/dev/token-counter',
  title: 'AI 프롬프트 토큰 카운터 — GPT·Claude·Gemini 토큰 수·API 비용 동시 계산',
  description:
    '한국어 텍스트의 토큰 수와 컨텍스트 윈도우 사용량을 GPT-4o·Claude·Gemini 등 8개 모델 동시 추정. 입력·출력 단가 반영 API 비용 + 한국어 비효율 인사이트.',
  keywords: [
    'AI 토큰 카운터', 'GPT 토큰 계산', 'Claude 토큰', 'Gemini 토큰',
    'API 비용 계산기', 'OpenAI 가격', 'Anthropic 가격', 'Google AI 가격',
    '컨텍스트 윈도우', 'tokenizer', 'tiktoken', 'o200k_base',
    '한국어 토큰 효율', '프롬프트 비용', 'LLM 비용 추정',
    'GPT-4o 가격', 'Claude Opus', 'Claude Sonnet', 'Gemini 2.5 Pro',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

export default function TokenCounterPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>개발자</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪙 AI 프롬프트 토큰 카운터
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        GPT·Claude·Gemini 토큰 수와 컨텍스트 사용량을 한 화면에. <strong style={{ color: 'var(--text)' }}>한국어 비효율과 API 비용</strong>까지 동시 추정.
      </p>

      <TokenCounterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 토큰이란? */}
        <section>
          <h2 style={sectionTitle}>토큰(token)이란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            LLM은 문자가 아닌 <strong style={{ color: 'var(--text)' }}>토큰</strong>이라는 단위로 텍스트를 처리합니다. 한 토큰은
            영문 기준 약 <strong style={{ color: 'var(--text)' }}>4글자(¾ 단어)</strong>에 해당하며, 한국어는 한 음절이
            <strong style={{ color: 'var(--text)' }}> 1~2 토큰</strong>으로 쪼개집니다. 모델 가격·컨텍스트 한도·응답 속도가 모두 토큰 단위로 매겨지므로
            프롬프트를 최적화하려면 토큰 수를 의식하는 게 첫걸음.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {[
              { t: '영문', e: '4 chars ≈ 1 token', c: '#059669' },
              { t: '한국어', e: '1~1.5 자 ≈ 1 token', c: '#D97706' },
              { t: '코드', e: '3 chars ≈ 1 token', c: '#0891B2' },
              { t: '숫자·공백', e: '3 chars ≈ 1 token', c: '#9333EA' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${g.c}`, borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: 12.5, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>{g.e}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. 모델별 한도·가격 */}
        <section>
          <h2 style={sectionTitle}>모델별 컨텍스트 한도·가격 (2026.05 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['모델', '컨텍스트', '입력 / 1M', '출력 / 1M', '특징'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 11.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['GPT-4o',        '128K', '$2.50',  '$10.00', '범용 주력, 멀티모달 강함'],
                  ['GPT-4o mini',   '128K', '$0.15',  '$0.60',  '저가 + 빠름, 분류·요약'],
                  ['Claude Opus 4', '200K', '$15.00', '$75.00', '추론·코드 최강, 장문 안정'],
                  ['Claude Sonnet 4','200K', '$3.00',  '$15.00', '균형형 — 대부분 작업에 적합'],
                  ['Claude Haiku 4.5','200K','$0.80', '$4.00',  '빠르고 저렴, 분류·태깅'],
                  ['Gemini 2.5 Pro','2M',   '$1.25',  '$10.00', '초장문 — 책·논문 한 번에'],
                  ['Gemini 2.5 Flash','1M', '$0.30',  '$2.50',  '저가 + 1M 컨텍스트'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{row[3]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
            ⚠️ 가격은 변동될 수 있습니다. 결제 전 <strong style={{ color: 'var(--text)' }}>OpenAI / Anthropic / Google AI Studio</strong> 공식 페이지에서 최신 단가 확인 권장.
          </p>
        </section>

        {/* 3. 한국어 토큰 효율 */}
        <section>
          <h2 style={sectionTitle}>한국어 토큰 효율 — 왜 영문보다 비쌀까?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            LLM 토크나이저는 영어 위주 코퍼스로 학습되어 <strong style={{ color: 'var(--text)' }}>한국어 음절을 더 잘게 쪼갭니다</strong>. 동일 의미를 표현해도
            한국어는 영문 대비 약 1.5~2배 토큰을 소비. 모델별 차이도 큽니다 — GPT-4o의 o200k_base는 이전 cl100k 대비 한국어를 30~40% 효율적으로 처리하며,
            Claude는 한국어가 가장 비효율적인 편입니다.
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.9 }}>
            <li><strong style={{ color: 'var(--text)' }}>비용 민감 작업</strong>: 시스템 프롬프트·context document는 영문으로, 사용자 응답만 한국어로</li>
            <li><strong style={{ color: 'var(--text)' }}>토큰 절약 팁</strong>: 불필요한 존댓말·접속사 제거 (~10~15% 절감)</li>
            <li><strong style={{ color: 'var(--text)' }}>JSON 출력</strong>: 한글 key 대신 영문 key 사용 (key가 매번 반복되므로 효과 큼)</li>
            <li><strong style={{ color: 'var(--text)' }}>여러 언어 혼용 시</strong>: 모델별 큰 차이 — GPT/Gemini 우선 검토</li>
          </ul>
        </section>

        {/* 4. 컨텍스트 윈도우 활용 */}
        <section>
          <h2 style={sectionTitle}>컨텍스트 윈도우(context window) 활용 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            모델이 한 번에 읽을 수 있는 토큰 수. 입력 + 출력 합산 한도로, 초과 시 오래된 메시지가 잘리거나 에러가 발생합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '128K (GPT-4o)', d: '책 1권의 ¼ 수준', desc: '단일 PDF·코드 파일 1~2개, 일반 대화에 충분' },
              { t: '200K (Claude)', d: '책 한 권 절반', desc: '긴 문서 요약·코드베이스 분석에 안정적' },
              { t: '1M (Gemini Flash)', d: '책 4~5권', desc: '여러 문서 비교, 영상 자막 요약' },
              { t: '2M (Gemini Pro)', d: '책 10권 분량', desc: '대형 코드베이스·논문 묶음 한 번에' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, margin: '0 0 4px', fontFamily: 'Inter, system-ui, sans-serif' }}>{g.t}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 10 }}>
            💡 컨텍스트가 길수록 모델 응답 속도는 느려지고 가격도 일부 단계에서 올라갑니다(예: Gemini Pro는 200K 초과 시 입력가 2배). 무조건 크다고 좋은 게 아닙니다.
          </p>
        </section>

        {/* 5. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '이 도구의 토큰 수는 얼마나 정확한가요?',
                a: '문자 분류(한글/CJK/영문/숫자/공백/구두점) 기반 휴리스틱으로 계산하므로 <strong>실제 토크나이저와 ±10~20% 오차</strong>가 있을 수 있습니다. 한국어 비중이 높을수록 오차가 커집니다. 정확한 수치가 필요하면 OpenAI의 tokenizer.openai.com, Anthropic의 count_tokens API, Google AI Studio를 사용하세요. 본 도구는 <strong>모델 간 상대 비교와 비용 견적</strong>에 최적화돼 있습니다.',
              },
              {
                q: 'tiktoken 같은 정확한 토크나이저를 쓰지 않는 이유는?',
                a: 'tiktoken WASM은 ~1.5MB로 페이지 무게를 크게 늘립니다. 또한 Claude·Gemini 토크나이저는 공개돼 있지 않아 어차피 추정뿐입니다. 본 도구는 모바일에서도 즉시 동작하는 가벼움을 우선했습니다. 정확도가 결정적인 작업은 공식 도구를 권장합니다.',
              },
              {
                q: '왜 한국어가 영어보다 토큰을 더 많이 쓰나요?',
                a: 'LLM 토크나이저는 영어 코퍼스에 최적화돼 있어 "the", "ing" 같은 흔한 영문 패턴은 1토큰으로 압축되지만, 한글 음절은 보통 1~2개 서브워드로 쪼개집니다. 같은 의미의 한국어 텍스트는 영문 대비 <strong>약 50~100% 더 많은 토큰</strong>을 소비. 모델별로는 GPT-4o의 o200k_base가 한국어를 가장 효율적으로 처리하고, Claude가 가장 비효율적인 편입니다.',
              },
              {
                q: '시스템 프롬프트도 매번 비용으로 청구되나요?',
                a: '예. <strong>입력 토큰</strong>으로 매 호출마다 청구됩니다. 다만 OpenAI·Anthropic·Gemini 모두 <strong>프롬프트 캐싱</strong>을 제공해 반복되는 시스템 프롬프트는 50~90% 할인된 단가가 적용됩니다(최소 토큰 수·캐시 유지 시간 등 조건 있음). 긴 시스템 프롬프트를 자주 호출한다면 캐싱 활용이 핵심.',
              },
              {
                q: '출력 토큰이 입력 토큰보다 훨씬 비싼 이유는?',
                a: '생성은 자기회귀(autoregressive)로 토큰 하나하나를 순차 디코딩해야 해서 GPU 시간이 더 듭니다. 모델 가격이 보통 <strong>입력:출력 = 1:3~5</strong>로 책정되는 이유. "답변을 짧게" 또는 구조화된 JSON 스키마로 응답 길이를 제한하면 비용을 크게 절감할 수 있습니다.',
              },
              {
                q: '컨텍스트 한도를 넘으면 어떻게 되나요?',
                a: 'API는 <strong>에러를 반환</strong>합니다(보통 400 Bad Request, context_length_exceeded). ChatGPT·Claude 웹 인터페이스는 자동으로 가장 오래된 메시지를 잘라내(truncate) 진행. 의식하지 못한 채 이전 맥락이 사라질 수 있으니 긴 대화에서는 주기적으로 요약·정리 권장.',
              },
              {
                q: 'API 비용을 효과적으로 줄이려면?',
                a: '<strong>1) 모델 선택</strong> — 분류·요약은 mini/Haiku/Flash, 복잡한 추론만 GPT-4o/Opus. <strong>2) 출력 제한</strong> — max_tokens 설정 + "300자 이내" 같은 지시. <strong>3) 프롬프트 캐싱</strong> — 반복 시스템 프롬프트 활용. <strong>4) 영문 프롬프트</strong> — 시스템·context는 영문으로. <strong>5) 배치 API</strong> — OpenAI/Anthropic의 batch는 50% 할인.',
              },
              {
                q: '환율은 어떻게 계산되나요?',
                a: '₩ 환산은 <strong>1 USD = 1,380원</strong>으로 단순 계산합니다. 실제 카드 청구는 결제 시점 환율 + 카드사 수수료가 추가되므로 실제 청구액은 표시 금액보다 약 1~3% 높을 수 있습니다.',
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

        {/* 6. 함께 보면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 보면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',           desc: '응답 정리·TypeScript 타입 추출' },
              { href: '/tools/dev/regex',         icon: '🔍', name: '정규식 테스트기',        desc: '프롬프트 응답 파싱·검증' },
              { href: '/tools/dev/curl',          icon: '🌀', name: 'cURL 변환기',           desc: 'fetch·axios·Python으로 즉시' },
              { href: '/tools/dev/yaml-json',     icon: '📄', name: 'YAML ↔ JSON',          desc: '설정 파일 양방향 변환' },
              { href: '/tools/art/charcount',     icon: '✏️', name: '글자 수 세기',          desc: '바이트·공백 제외 카운트' },
              { href: '/tools/dev/tech-stack',    icon: '🛠️', name: '기술 스택 추천기',       desc: 'AI 앱용 풀스택 자동 추천' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
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
