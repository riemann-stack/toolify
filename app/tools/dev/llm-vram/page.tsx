import Link from 'next/link'
import LlmVramClient from './LlmVramClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/llm-vram',
  title: '로컬 LLM VRAM 계산기 — 이 모델, 내 GPU에 돌아갈까?',
  description: '로컬 LLM 필요 VRAM 계산 — GGUF 양자화(Q4_K_M 등)별 가중치 + KV 캐시(컨텍스트) + 오버헤드. Llama·Qwen·Gemma·EXAONE 프리셋과 RTX·Mac 적합 판정.',
  keywords: [
    'LLM VRAM 계산', '로컬 LLM 사양', 'GGUF 양자화 크기', 'Q4_K_M 용량',
    'KV 캐시 계산', 'ollama 메모리', '라마 70B VRAM', 'EXAONE 실행 사양',
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
    q: '왜 모델 파일 크기보다 VRAM이 더 필요한가요?',
    a: 'VRAM에는 가중치(=파일 크기) 외에 두 가지가 더 올라갑니다. ① <strong>KV 캐시</strong> — 대화 컨텍스트를 기억하는 메모리로, 컨텍스트 길이에 정비례해 커집니다(Llama 3.1 8B는 토큰당 128KiB → 32K 컨텍스트에서 약 4.3GB). ② <strong>런타임 오버헤드</strong> — CUDA 컨텍스트와 연산 버퍼로 1~2GB. 그래서 4.9GB짜리 Q4_K_M 8B 모델도 8GB GPU에서 긴 컨텍스트를 쓰면 빠듯해집니다.',
  },
  {
    q: '양자화는 어떤 걸 골라야 하나요?',
    a: '커뮤니티 기본 추천은 <strong>Q4_K_M</strong>(약 4.89bit/가중치)입니다 — 원본 대비 품질 저하가 작으면서 용량이 F16의 약 30%예요. VRAM에 여유가 있으면 Q5_K_M·Q6_K로 올리고, 부족하면 Q3_K_M까지 내려볼 수 있습니다. <strong>Q2_K는 품질 손실이 눈에 띄게 커서</strong> 큰 모델을 억지로 구겨 넣을 때의 최후 수단으로 보세요. 같은 양자화라도 모델에 따라 실효 bit이 ±1~2% 다릅니다.',
  },
  {
    q: '8GB GPU로는 어떤 모델까지 가능한가요?',
    a: '<strong>7~8B급 Q4_K_M(가중치 약 4.7~4.9GB)</strong>이 현실적인 상한입니다. 짧은 컨텍스트(4~8K)라면 여유 있게 돌고, 32K 이상 긴 컨텍스트는 KV 캐시를 Q8_0으로 양자화하면 가능해요. 12~14B는 Q3 계열로 내려야 해서 품질 타협이 필요합니다. 위 계산기에서 GPU를 선택하면 양자화별 판정을 한눈에 볼 수 있어요.',
  },
  {
    q: '70B 모델을 로컬에서 돌릴 수 있나요?',
    a: 'Q4_K_M 기준 가중치만 <strong>약 42.5GB</strong>라 단일 소비자 GPU(최대 32GB)로는 불가능합니다. 현실적인 방법은 ① 24GB×2 등 <strong>멀티 GPU</strong>, ② <strong>Mac 통합메모리 64GB 이상</strong>(GPU 가용 약 48GB), ③ Q2_K(약 26GB)로 낮춰 32GB급에서 구동 — 단 품질 저하 감수. CPU 오프로딩도 가능하지만 속도가 크게 떨어집니다.',
  },
  {
    q: 'Mac 통합메모리는 왜 75%만 계산하나요?',
    a: 'macOS의 Metal은 기본적으로 <strong>통합메모리의 약 75%까지만 GPU 작업 영역</strong>으로 허용합니다(recommendedMaxWorkingSetSize, 소용량 기기는 65~70% 수준). 예를 들어 32GB Mac이면 GPU 가용은 약 24GB예요. <code>sysctl iogpu.wired_limit_mb</code>로 상한을 올릴 수 있지만 시스템용 메모리를 침범하므로 OS·앱용 여유를 남겨두는 게 안전합니다.',
  },
  {
    q: 'KV 캐시 양자화(Q8_0·Q4_0)는 써도 되나요?',
    a: 'llama.cpp의 <code>--cache-type-k/v</code> 옵션으로 KV 캐시를 F16의 절반(Q8_0)이나 1/4(Q4_0)로 줄일 수 있습니다. <strong>Q8_0은 품질 영향이 거의 없어 긴 컨텍스트의 표준 선택</strong>이고, Q4_0은 장문에서 품질·속도 저하 보고가 있어 신중하게 쓰세요. V 캐시 양자화는 플래시 어텐션 활성화가 필요합니다. 예: 8B 모델 32K 컨텍스트의 KV가 4.3GB→2.1GB로 줄어 16GB GPU 여유가 생깁니다.',
  },
  {
    q: 'Gemma 3는 왜 KV 캐시가 유난히 작게 나오나요?',
    a: 'Gemma 3는 <strong>슬라이딩 윈도 어텐션(SWA)</strong> 구조로, 6개 레이어 중 5개는 최근 1,024토큰만 보고 1개만 전체 컨텍스트를 봅니다. 그래서 일반 공식으로 계산하면 5~6배 과대 추정돼요(27B 128K 기준 나이브 66GB vs 실제 약 12GB). 이 계산기는 llama.cpp의 iSWA 구현 기준으로 글로벌/로컬 레이어를 분리 계산합니다.',
  },
]

const RELATED = [
  { href: '/tools/dev/token-counter', icon: '🪙', name: 'AI 토큰 카운터', desc: 'GPT·Claude 토큰·비용' },
  { href: '/tools/dev/tech-stack', icon: '🛠️', name: '기술 스택 추천기', desc: '프로젝트 풀스택 추천' },
  { href: '/tools/dev/json', icon: '📋', name: 'JSON 포맷터', desc: '정렬·검증·타입 생성' },
  { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 인코더', desc: '텍스트↔Base64 변환' },
  { href: '/tools/dev/number-base', icon: '🔢', name: '진법 변환기', desc: '2·8·10·16진수 변환' },
  { href: '/tools/unit/converter', icon: '📏', name: '단위 변환기', desc: 'GB·GiB 등 14종 환산' },
]

export default function LlmVramPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />로컬 LLM VRAM 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        이 모델, 내 GPU에 돌아갈까? — <strong style={{ color: 'var(--text)' }}>양자화별 가중치 + KV 캐시 + 오버헤드</strong>를 llama.cpp 실측 기준으로.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="llama.cpp quantize README 실측 bpw · HuggingFace 공식 config.json (Llama·Qwen·Gemma·EXAONE 등 13종)"
        sources={[
          { label: 'llama.cpp', href: 'https://github.com/ggml-org/llama.cpp' },
          { label: 'HuggingFace', href: 'https://huggingface.co' },
        ]}
      />

      <LlmVramClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 공식 */}
        <section>
          <h2 style={sectionTitle}>필요 VRAM은 이렇게 계산해요</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1, overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}>가중치</span> = 파라미터 수 × 실효 bit ÷ 8</div>
            <div><span style={{ color: 'var(--muted)' }}>KV 캐시</span> = 2 × 레이어 × KV헤드 × head_dim × 컨텍스트 × 2B</div>
            <div><span style={{ color: 'var(--muted)' }}>총 필요</span> = 가중치 + KV 캐시 + 오버헤드(1~2GB 관행)</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>검산 앵커:</strong> Llama 3.1 8B Q4_K_M = 8.03B × 4.8944 ÷ 8 = <strong style={{ color: 'var(--accent)' }}>4.91GB</strong> (실제 파일 4.92GB, 오차 0.2%) ·
            KV는 토큰당 128KiB → 32K 컨텍스트에서 4.3GB. 최신 모델은 GQA 덕분에 KV헤드가 8개 수준이라 KV 캐시가 구세대(MHA)보다 4배 이상 작아요.
          </div>
        </section>

        {/* 2. 양자화 크기표 */}
        <section>
          <h2 style={sectionTitle}>양자화별 크기 — Llama 3.1 8B 기준 실측</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['양자화', 'bit/가중치', '8B 파일', '70B 파일', '용도'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Q2_K', '3.16', '3.18GB', '26.4GB', '최후 수단'],
                  ['Q3_K_M', '4.00', '4.02GB', '34.3GB', 'VRAM 부족 시'],
                  ['Q4_K_M', '4.89', '4.92GB', '42.5GB', '기본 추천'],
                  ['Q5_K_M', '5.70', '5.73GB', '50.0GB', '여유 있으면'],
                  ['Q6_K', '6.56', '6.60GB', '57.9GB', '고품질'],
                  ['Q8_0', '8.50', '8.54GB', '75.0GB', '사실상 무손실'],
                  ['F16', '16.0', '14.96GB', '141GB+', '원본'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: r[0] === 'Q4_K_M' ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{r[3]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ bit/가중치는 llama.cpp quantize README의 Llama-3.1-8B 실측값, 파일 크기는 bartowski GGUF 저장소 공표값. 모델·아키텍처에 따라 실효 bit은 ±1~2% 달라집니다.
          </p>
        </section>

        {/* 3. 팁 카드 */}
        <section>
          <h2 style={sectionTitle}>VRAM이 모자랄 때 — 우선순위 3가지</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '1️⃣ KV 캐시 양자화', d: 'Q8_0 KV는 품질 영향이 거의 없이 캐시를 절반으로. 긴 컨텍스트를 쓴다면 가장 먼저 시도할 옵션이에요.' },
              { t: '2️⃣ 컨텍스트 줄이기', d: 'KV 캐시는 컨텍스트에 정비례합니다. 128K를 다 쓸 일이 없다면 8~16K로 제한하는 것만으로 수 GB가 절약돼요.' },
              { t: '3️⃣ 양자화 한 단계 아래로', d: 'Q4_K_M→Q3_K_M은 8B 기준 약 0.9GB 절약. 품질 타협이 시작되는 지점이라 마지막 카드로 쓰세요.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
