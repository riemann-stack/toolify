import Link from 'next/link'
import LlmVramClient from './LlmVramClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { MODELS, QUANTS, GIB, calcVram, fitGpu, macGpuRatio, type ModelSpec } from './llmVramData'

export const metadata = buildMetadata({
  path: '/tools/dev/llm-vram',
  title: '로컬 LLM VRAM 계산기 — 이 모델, 내 GPU에 돌아갈까?',
  description: '로컬 LLM 필요 VRAM 계산 — GGUF 양자화(Q4_K_M 등)별 가중치 + KV 캐시(컨텍스트) + 오버헤드. Llama·Qwen·Gemma·EXAONE 프리셋과 RTX·Mac 적합 판정.',
  keywords: [
    'LLM VRAM 계산', '로컬 LLM 사양', 'GGUF 양자화 크기', 'Q4_K_M 용량',
    'KV 캐시 계산', 'ollama 메모리', '라마 70B VRAM', 'EXAONE 실행 사양',
  ],
})

/* 가이드 표·FAQ 수치는 전부 위 계산기와 같은 엔진(llmVramData)으로 빌드 시 계산한다 — 손으로 옮겨 적지 않는다 */
const model = (name: string): ModelSpec => {
  const m = MODELS.find((x) => x.name === name)
  if (!m) throw new Error(`llm-vram: 모델 없음 ${name}`)
  return m
}
const bpwOf = (id: string) => {
  const q = QUANTS.find((x) => x.id === id)
  if (!q) throw new Error(`llm-vram: 양자화 없음 ${id}`)
  return q.bpw
}
const gb1 = (n: number) => n.toFixed(1)
const L8 = model('Llama 3.1 8B')
const Q4 = bpwOf('Q4_K_M')
const v8b4k = calcVram(L8, Q4, 4096, 2)
const v8b8k = calcVram(L8, Q4, 8192, 2)
const L70 = model('Llama 3.3 70B')
const v70q4 = calcVram(L70, Q4, 8192, 2)
const v70q2 = calcVram(L70, bpwOf('Q2_K'), 8192, 2)

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
    a: `<strong>7~8B급 Q4_K_M(가중치 약 4.7~4.9GB)</strong>이 현실적인 상한입니다. 이 계산기 기준으로 컨텍스트 4K면 여유(약 ${gb1(v8b4k.totalGB)}GB), 8K면 빠듯(약 ${gb1(v8b8k.totalGB)}GB)합니다. 32K 이상은 KV 캐시를 Q8_0으로 줄여도 Q4_K_M은 8GB를 넘으므로, Q3_K_M으로 내리거나 컨텍스트를 줄여야 빠듯하게 들어가요. 12~14B는 Q2_K에 짧은 컨텍스트일 때만 겨우 들어가고 품질 손실이 큽니다. 위 계산기에서 GPU를 선택하면 양자화별 판정을 한눈에 볼 수 있어요.`,
  },
  {
    q: '70B 모델을 로컬에서 돌릴 수 있나요?',
    a: `Q4_K_M이면 이 계산기 기준 가중치만 <strong>약 ${gb1(v70q4.weightsGB)}GB</strong>(배포 GGUF 파일은 약 42.5GB)이고, 8K 컨텍스트를 더하면 총 약 ${gb1(v70q4.totalGB)}GB라 단일 소비자 GPU(최대 32GB)로는 불가능합니다. 현실적인 방법은 ① 24GB×2 등 <strong>멀티 GPU</strong>, ② <strong>Mac 통합메모리 64GB 이상</strong>(GPU 가용 48GiB, 10진 단위로 약 51.5GB), ③ Q2_K로 낮춰 32GB급에서 구동 — 계산기 기준 가중치 약 ${gb1(v70q2.weightsGB)}GB(배포 파일 약 26.4GB)에 KV 캐시·오버헤드를 더해 총 약 ${gb1(v70q2.totalGB)}GB로 &lsquo;빠듯&rsquo;이고 품질 저하도 감수해야 합니다. 계산기 가중치가 배포 파일보다 큰 것은 bit/가중치를 Llama 3.1 8B 실측값으로 일괄 적용하기 때문으로(70B급은 실효 bit이 조금 낮음), 판정이 안전한 쪽으로 기웁니다. CPU 오프로딩도 가능하지만 속도가 크게 떨어집니다.`,
  },
  {
    q: 'Mac 통합메모리는 왜 일부만 계산하나요?',
    a: 'macOS의 Metal은 기본적으로 <strong>통합메모리의 일부만 GPU 작업 영역</strong>으로 허용합니다(recommendedMaxWorkingSetSize). 관측치로는 36GB 이하 기기는 약 2/3, 그보다 큰 기기는 약 75%라서 이 계산기도 그렇게 잡습니다. 예를 들어 32GB Mac이면 GPU 가용은 약 21.3GiB(10진 단위로 약 22.9GB), 64GB Mac이면 48GiB(약 51.5GB)예요. 계산기는 필요량과 같은 10진 GB로 바꿔 비교합니다. <code>sysctl iogpu.wired_limit_mb</code>로 상한을 올릴 수 있지만 시스템용 메모리를 침범하므로 OS·앱용 여유를 남겨두는 게 안전합니다.',
  },
  {
    q: 'KV 캐시 양자화(Q8_0·Q4_0)는 써도 되나요?',
    a: 'llama.cpp의 <code>--cache-type-k/v</code> 옵션으로 KV 캐시를 F16의 절반(Q8_0)이나 1/4(Q4_0)로 줄일 수 있습니다. <strong>Q8_0은 품질 영향이 거의 없어 긴 컨텍스트의 표준 선택</strong>이고, Q4_0은 장문에서 품질·속도 저하 보고가 있어 신중하게 쓰세요. V 캐시 양자화는 플래시 어텐션 활성화가 필요합니다. 예: 8B 모델 32K 컨텍스트의 KV가 4.3GB→2.1GB로 줄어 16GB GPU 여유가 생깁니다.',
  },
  {
    q: 'Gemma 3는 왜 KV 캐시가 유난히 작게 나오나요?',
    a: 'Gemma 3는 <strong>슬라이딩 윈도 어텐션(SWA)</strong> 구조로, 6개 레이어 중 5개는 최근 1,024토큰만 보고 1개만 전체 컨텍스트를 봅니다. 그래서 일반 공식으로 계산하면 5~6배 과대 추정돼요(27B 128K 기준 나이브 약 67GB vs 실제 약 11GB). 이 계산기는 llama.cpp의 iSWA 구현 기준으로 글로벌/로컬 레이어를 분리 계산합니다.',
  },
]

/** 컨텍스트 8K · KV F16 · 표기 용량(GiB 환산) 92% 이하 기준, 각 GPU에서 통과하는 최대 양자화 (본 계산기 엔진으로 산출) */
const MATRIX_MODELS = ['Llama 3.1 8B', 'Qwen3 14B', 'Mistral Small 3 24B', 'Qwen3 32B', 'Gemma 3 27B', 'Llama 3.3 70B']
const MATRIX_GPUS: { gpu: string; gib: number }[] = [
  { gpu: 'RTX 4060 (8GB)', gib: 8 },
  { gpu: 'RTX 4070 (12GB)', gib: 12 },
  { gpu: 'RTX 4080 / 5080 (16GB)', gib: 16 },
  { gpu: 'RTX 4090 / 3090 (24GB)', gib: 24 },
  { gpu: 'RTX 5090 (32GB)', gib: 32 },
  ...[32, 64].map((ram) => {
    const gib = ram * macGpuRatio(ram)
    return { gpu: `Mac ${ram}GB (가용 ${Number.isInteger(gib) ? '' : '약 '}${gb1(gib).replace(/\.0$/, '')}GiB≈${gb1((gib * GIB) / 1e9)}GB)`, gib }
  }),
]

type MatrixCell = [quant: string, size: string, tight?: boolean] | null

const GPU_MATRIX: { gpu: string; cells: MatrixCell[] }[] = MATRIX_GPUS.map(({ gpu, gib }) => ({
  gpu,
  cells: MATRIX_MODELS.map((name): MatrixCell => {
    const cap = gib * GIB
    let best: MatrixCell = null
    for (const q of QUANTS) {
      const r = calcVram(model(name), q.bpw, 8192, 2)
      if (r.totalBytes <= cap * 0.92) best = [q.id, `${gb1(r.totalGB)}GB`, fitGpu(r.totalBytes, gib) === 'tight']
    }
    return best
  }),
}))

/** Llama 3.1 8B · Q4_K_M · KV F16 — 컨텍스트별 KV/총량 (KV 비중은 두 값의 비) */
const CTX_ROWS = [4096, 8192, 32768, 131072].map((ctx) => {
  const r = calcVram(L8, Q4, ctx, 2)
  return [`${Math.round(ctx / 1024)}K (${ctx.toLocaleString('en-US')})`, `${r.kvGB.toFixed(2)}GB`, `${gb1(r.totalGB)}GB`, `${Math.round((r.kvGB / r.totalGB) * 100)}%`]
})
const ctx128 = calcVram(L8, Q4, 131072, 2)

/** Q4_K_M · 컨텍스트 8K · KV F16 — 모델별 소요량 분해 */
const Q4_ROWS = ['Llama 3.1 8B', 'Qwen3 14B', 'Mistral Small 3 24B', 'Gemma 3 27B', 'Qwen3 32B', 'Llama 3.3 70B'].map((name) => {
  const r = calcVram(model(name), Q4, 8192, 2)
  return [name, `${gb1(r.weightsGB)}GB`, `${r.kvGB.toFixed(2)}GB`, `${gb1(r.overheadGB)}GB`, `${gb1(r.totalGB)}GB`]
})
const q4_32b = calcVram(model('Qwen3 32B'), Q4, 8192, 2)

/** 양자화별 크기 — bit/가중치는 엔진 값(llama.cpp quantize README 실측), 파일 크기는 GGUF 저장소 공표값(외부 데이터) */
const QUANT_FILES: Record<string, [string, string, string]> = {
  Q2_K: ['3.18GB', '26.4GB', '최후 수단'],
  Q3_K_M: ['4.02GB', '34.3GB', 'VRAM 부족 시'],
  Q4_K_M: ['4.92GB', '42.5GB', '기본 추천'],
  Q5_K_M: ['5.73GB', '50.0GB', '여유 있으면'],
  Q6_K: ['6.60GB', '57.9GB', '고품질'],
  Q8_0: ['8.54GB', '75.0GB', '사실상 무손실'],
  F16: ['16.06GB', '141GB+', '원본'],
}

const RELATED = [
  { href: '/tools/dev/token-counter', icon: '🪙', name: 'AI 토큰 카운터', desc: 'GPT·Claude 토큰·비용' },
  { href: '/tools/dev/curl', icon: '🌀', name: 'cURL 변환기', desc: '로컬 LLM API 요청을 코드로 변환' },
  { href: '/tools/dev/json', icon: '📋', name: 'JSON 포맷터', desc: '정렬·검증·타입 생성' },
  { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 인코더', desc: '텍스트↔Base64 변환' },
  { href: '/tools/dev/number-base', icon: '🔢', name: '진법 변환기', desc: '2·8·10·16진수 변환' },
  { href: '/tools/unit/converter', icon: '📏', name: '단위 변환기', desc: 'GB·GiB 등 14종 환산' },
]

export default function LlmVramPage() {
  return (
    <ToolPage width={760} slug="/tools/dev/llm-vram">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />로컬 LLM VRAM 계산기
      </h1>
      <p className="tp-lead">
        이 모델, 내 GPU에 돌아갈까? — <strong style={{ color: 'var(--text)' }}>양자화별 가중치 + KV 캐시 + 오버헤드</strong>를 llama.cpp 실측 기준으로.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="llama.cpp quantize README 실측 bpw · HuggingFace 공식 config.json (Llama·Qwen·Gemma·EXAONE 등 13종)"
        sources={[
          { label: 'llama.cpp', href: 'https://github.com/ggml-org/llama.cpp' },
          { label: 'HuggingFace', href: 'https://huggingface.co' },
          { label: 'Gemma 3 기술 보고서', href: 'https://arxiv.org/abs/2503.19786' },
          { label: 'Apple Metal recommendedMaxWorkingSetSize', href: 'https://developer.apple.com/documentation/metal/mtldevice/recommendedmaxworkingsetsize' },
        ]}
      />

      <LlmVramClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 공식 */}
        <section>
          <h2 className="g-h2">필요 VRAM은 이렇게 계산해요</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
            padding: '18px 20px', fontFamily: 'var(--font-mono)',
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1, overflowX: 'auto',
          }}>
            <div><span style={{ color: 'var(--muted)' }}>가중치</span> = 파라미터 수 × 실효 bit ÷ 8</div>
            <div><span style={{ color: 'var(--muted)' }}>KV 캐시</span> = 2 × 레이어 × KV헤드 × head_dim × 컨텍스트 × 2B</div>
            <div><span style={{ color: 'var(--muted)' }}>총 필요</span> = 가중치 + KV 캐시 + 오버헤드(1~2GB 관행)</div>
          </div>
          <Callout tone="note" title="검산 앵커">
            Llama 3.1 8B Q4_K_M = 8.03B × 4.8944 ÷ 8 = <strong>{v8b4k.weightsGB.toFixed(2)}GB</strong> (실제 파일 4.92GB, 오차 0.2%) ·
            KV는 2(K·V) × 32레이어 × 8헤드 × 128차원 × 2바이트 = 토큰당 128KiB → 32K 컨텍스트에서 4.3GB. 최신 모델은 GQA(그룹 쿼리 어텐션) 덕분에 KV헤드가 8개 수준이라, 어텐션 헤드 수만큼 KV를 두던 구세대(MHA) 구조보다 KV 캐시가 4배 이상 작아요.
          </Callout>
        </section>

        {/* 2. 양자화 크기표 */}
        <section>
          <h2 className="g-h2">양자화별 크기 — Llama 3.1 8B 기준 실측</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['양자화', 'bit/가중치', '8B 파일', '70B 파일', '용도'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUANTS.map((q) => [q.id, q.bpw.toFixed(2), ...(QUANT_FILES[q.id] ?? ['—', '—', q.hint])]).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: r[0] === 'Q4_K_M' ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[3]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ bit/가중치는 llama.cpp quantize README의 Llama-3.1-8B 실측값(계산기와 같은 값), 파일 크기는 bartowski GGUF 저장소 공표값입니다. F16 8B는 README의 14.96GiB를 10진 GB로 환산했습니다(다른 행과 같은 단위). 모델·아키텍처에 따라 실효 bit은 ±1~2% 달라집니다.
          </p>
        </section>

        {/* 3. GPU × 모델 매트릭스 */}
        <section>
          <h2 className="g-h2">GPU별 돌아가는 모델 — 한눈에</h2>
          <p className="g-p">
            양자화별 크기를 알아도 &lsquo;그래서 내 카드엔 뭐가 올라가나&rsquo;가 남죠. 위 계산기를 모델 6종 × GPU 7종으로 돌려,
            각 조합에서 <strong style={{ color: 'var(--text)' }}>표기 용량(8GB=8GiB로 환산)의 92% 이하로 들어가는 가장 높은 양자화</strong>를 뽑았습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 700 }}>
              <caption style={{ captionSide: 'bottom', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'left', paddingTop: 10 }}>
                컨텍스트 8K · KV 캐시 F16 · GPU 표기 용량을 GiB(×2<sup>30</sup>)로 환산한 바이트의 92% 이하 사용 기준. 셀의 GB는 10진 GB라 표기 숫자끼리 나눈 비율은 이보다 커 보입니다(예: 24GB 카드의 22.7GB = 실제 88%). 본 계산기와 같은 공식으로 산출한 값 — 실측은 런타임(llama.cpp·ollama·vLLM)·OS·드라이버에 따라 다릅니다.
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, minWidth: 130 }}>GPU (가용 VRAM)</th>
                  {MATRIX_MODELS.map((m) => (
                    <th scope="col" key={m} style={{ padding: '10px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GPU_MATRIX.map((row, i) => (
                  <tr key={row.gpu} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <th scope="row" style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text)', fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-sans)' }}>{row.gpu}</th>
                    {row.cells.map((c, j) => (
                      <td key={j} style={{ padding: '9px 10px', verticalAlign: 'top' }}>
                        {c ? (
                          <>
                            <span style={{ color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{c[0]}{c[2] ? '†' : ''}</span>
                            <br />
                            <span style={{ color: 'var(--muted)', fontSize: 11 }}>{c[1]}</span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.75 }}>
            ※ <strong style={{ color: 'var(--text)' }}>—</strong> 는 8K 컨텍스트에서 92% 기준을 통과하는 양자화가 하나도 없다는 뜻 — 해당 GPU 단독으로는 어렵고 멀티 GPU·CPU 오프로딩·통합메모리를 검토해야 합니다.
            <strong style={{ color: 'var(--text)' }}> †</strong> 는 같은 GiB 환산 기준으로 90%를 넘겨 위 계산기가 <strong style={{ color: 'var(--warning)' }}>&lsquo;빠듯&rsquo;</strong>으로 판정하는 조합이에요.
            Mac은 Metal 기본 상한(통합메모리 36GB 이하 약 2/3, 그보다 크면 약 75%)을 가용 용량으로 잡았고, 총량에는 오버헤드 2.0GB가 포함돼 있습니다(공식 수치가 아닌 커뮤니티 관행치).
          </p>
          <Callout tone="note" title="읽는 법">
            <strong>24GB가 분수령</strong>입니다 — 8B는 F16 원본, 14B는 Q8_0, 24B·27B는 Q5~Q6까지 올라가요.
            16GB에서는 24B가 Q3_K_M, 27B가 Q2_K로 내려가 품질 타협이 시작되고, 32B를 Q6_K로 쓰려면 32GB가 필요합니다.
            70B는 Mac 64GB(가용 48GiB≈51.5GB)의 Q3_K_M이 표에서 유일한 통과 조합이에요.
            8GB가 Q3_K_M인 것도 컨텍스트 8K를 잡았기 때문 — 4K로 줄이면 Q4_K_M(아래 표의 총 {gb1(v8b4k.totalGB)}GB)도 같은 기준을 통과합니다.
          </Callout>
        </section>

        {/* 4. 컨텍스트 → VRAM */}
        <section>
          <h2 className="g-h2">컨텍스트가 VRAM을 얼마나 먹나</h2>
          <p className="g-p">
            KV 캐시는 컨텍스트 길이에 정비례합니다. 같은 모델·같은 양자화라도 컨텍스트를 어디까지 열어두느냐로 필요량이 <strong style={{ color: 'var(--text)' }}>3배 넘게</strong> 벌어져요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 440 }}>
              <caption style={{ captionSide: 'bottom', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'left', paddingTop: 10 }}>
                Llama 3.1 8B · Q4_K_M · KV 캐시 F16 기준. 본 계산기와 같은 공식으로 산출한 값 — 실측은 런타임·OS·드라이버에 따라 다릅니다.
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['컨텍스트', 'KV 캐시', '총 필요', 'KV 비중'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CTX_ROWS.map((r, i) => (
                  <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)', background: i === CTX_ROWS.length - 1 ? 'color-mix(in srgb, var(--warning) 8%, transparent)' : i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="g-h3">
            Q4_K_M 기준 모델별 소요량 — 가중치 + KV + 오버헤드
          </h3>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <caption style={{ captionSide: 'bottom', fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, textAlign: 'left', paddingTop: 10 }}>
                컨텍스트 8K · KV 캐시 F16 기준. 본 계산기와 같은 공식으로 산출한 값 — 실측은 런타임·OS·드라이버에 따라 다릅니다.
                오버헤드 2.0GB는 공식 규격이 아니라 CUDA 런타임 + 컴퓨트 버퍼를 잡아둔 <strong style={{ color: 'var(--text)' }}>커뮤니티 관행치</strong>입니다.
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['모델', '가중치', 'KV(8K)', '오버헤드', '총 필요'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Q4_ROWS.map((r, i) => (
                  <tr key={r[0]} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700, fontSize: 12, fontFamily: 'var(--font-sans)' }}>{r[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r[3]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout tone="note" title="실전 결론 — 128K는 가중치보다 캐시가 큰 영역">
            Llama 3.1 8B는 Q4_K_M 가중치가 {gb1(ctx128.weightsGB)}GB뿐이지만, 컨텍스트를 128K까지 열면 KV 캐시만 <strong>{ctx128.kvGB.toFixed(2)}GB</strong>로 불어나
            총 {gb1(ctx128.totalGB)}GB — 총량의 {Math.round((ctx128.kvGB / ctx128.totalGB) * 100)}%가 캐시입니다.
            즉 <strong>128K 컨텍스트는 8B 모델도 24GB급 카드가 필요</strong>합니다. 반대로 8K로 제한하면 같은 모델이 {gb1(v8b8k.totalGB)}GB로 끝나요.
            긴 컨텍스트가 꼭 필요하다면 KV 정밀도를 Q8_0으로 낮춰 캐시를 절반으로 줄이는 게 첫 카드고(위 계산기의 &lsquo;KV 캐시 정밀도&rsquo;에서 바로 비교 가능),
            32B급은 가중치 {gb1(q4_32b.weightsGB)}GB에 KV·오버헤드가 붙어 총 {gb1(q4_32b.totalGB)}GB가 되기 때문에 24GB 카드에서 Q3_K_M으로 내려가게 됩니다.
          </Callout>
        </section>

        {/* 5. 팁 카드 */}
        <section>
          <h2 className="g-h2">VRAM이 모자랄 때 — 우선순위 3가지</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '1. KV 캐시 양자화', d: 'Q8_0 KV는 품질 영향이 거의 없이 캐시를 절반으로. 긴 컨텍스트를 쓴다면 가장 먼저 시도할 옵션이에요.' },
              { t: '2. 컨텍스트 줄이기', d: 'KV 캐시는 컨텍스트에 정비례합니다. 128K를 다 쓸 일이 없다면 8~16K로 제한하는 것만으로 수 GB가 절약돼요.' },
              { t: '3. 양자화 한 단계 아래로', d: `Q4_K_M→Q3_K_M은 8B 기준 약 ${gb1(calcVram(L8, Q4, 8192, 2).weightsGB - calcVram(L8, bpwOf('Q3_K_M'), 8192, 2).weightsGB)}GB 절약. 품질 타협이 시작되는 지점이라 마지막 카드로 쓰세요.` },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
