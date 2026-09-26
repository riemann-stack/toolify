import Link from 'next/link'
import TokenCounterClient from './TokenCounterClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import { MODELS, PRICE_CHECKED, SAMPLES, fmtContext, countTokens, priceFor, estimateEnglishTokens } from './tokenCounterData'
import ToolPage from '@/components/ToolPage'

const fmtPrice = (n: number) => `$${n.toFixed(2)}`
/* 도구 화면과 같은 규칙의 USD 표기 (작은 금액은 소수 자리를 늘림) */
const fmtUSD = (n: number) => (n < 0.01 ? `$${n.toFixed(5)}` : n < 1 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`)
const KRW_RATE = 1380

export const metadata = buildMetadata({
  path: '/tools/dev/token-counter',
  title: 'AI 프롬프트 토큰 카운터 — GPT·Claude·Gemini 토큰 수·API 비용 동시 계산',
  description:
    '한국어 텍스트의 토큰 수와 컨텍스트 윈도우 사용량을 GPT·Claude·Gemini 대표 8개 모델로 동시 추정. 입력·출력 단가 반영 API 비용 + 한국어 비효율 인사이트.',
  keywords: [
    'AI 토큰 카운터', 'GPT 토큰 계산', 'Claude 토큰', 'Gemini 토큰',
    'API 비용 계산기', 'OpenAI 가격', 'Anthropic 가격', 'Google AI 가격',
    '컨텍스트 윈도우', 'tokenizer', 'tiktoken', 'o200k_base',
    '한국어 토큰 효율', '프롬프트 비용', 'LLM 비용 추정',
    'GPT-4o 가격', 'Claude Opus', 'Claude Sonnet', 'Gemini 2.5 Pro',
  ],
})

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '9px 12px', color: 'var(--text)', fontSize: 13 }
const tdNum: React.CSSProperties = { ...td, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }
const rowBorder: React.CSSProperties = { borderBottom: '1px solid var(--border)' }

/* ── 가이드 표는 손으로 적지 않고 도구와 같은 tokenCounterData 함수로 빌드 시 계산한다 ── */
type Eff = 'gpt' | 'claude' | 'gemini'
const EFFS: Eff[] = ['gpt', 'claude', 'gemini']
/* 문자 1개당 가중치 — 같은 문자 1,000개를 세어 역산 (올림 오차 ≤ 0.001 → 소수 둘째 자리에서 정확) */
const weightOf = (ch: string, eff: Eff) => Math.round(countTokens(ch.repeat(1000), eff).tokens / 10) / 100
const WEIGHT_ROWS = [
  { label: '한글 (음절·자모)', ex: '가' },
  { label: '한자·가나', ex: '漢' },
  { label: '영문자', ex: 'a' },
  { label: '숫자', ex: '1' },
  { label: '공백·줄바꿈', ex: ' ' },
  { label: '문장부호·기호', ex: '.' },
  { label: '그 밖의 문자 (이모지 등)', ex: '→' },
].map((r) => ({ ...r, w: EFFS.map((e) => weightOf(r.ex, e)) }))
const GA_1000 = { gpt: countTokens('가'.repeat(1000), 'gpt').tokens, claude: countTokens('가'.repeat(1000), 'claude').tokens }

/* 예시 — 도구의 첫 샘플(한국어 글)을 1,000회 호출, 출력 길이 '일반 답'(×1.0) */
const EX_TEXT = SAMPLES[0].text
const EX_CALLS = 1000
const EX_RATIO = 1.0
const EX_COUNT = { gpt: countTokens(EX_TEXT, 'gpt'), claude: countTokens(EX_TEXT, 'claude'), gemini: countTokens(EX_TEXT, 'gemini') }
const EX_EN = estimateEnglishTokens(EX_COUNT.gpt.breakdown, 'gpt')
const EX_ROWS = MODELS.map((m) => {
  const inTok = EX_COUNT[m.efficiency].tokens
  const outTok = Math.ceil(inTok * EX_RATIO)
  const p = priceFor(m, inTok)
  const total = ((inTok / 1_000_000) * p.input + (outTok / 1_000_000) * p.output) * EX_CALLS
  return { name: m.name, inTok, outTok, total }
})
const RATIOS = MODELS.map((m) => m.outputPricePerM / m.inputPricePerM)
const RATIO_MIN = Math.min(...RATIOS)
const RATIO_MAX = Math.max(...RATIOS)
const fmtRatio = (r: number) => (Number.isInteger(r) ? String(r) : r.toFixed(1))

const FAQ_LD = [
  {
    q: '토큰 수가 공식 토크나이저 결과와 다른 이유는?',
    a: '이 도구는 실제 토크나이저를 돌리지 않고, 문자를 한글·한자·영문·숫자·공백·문장부호·기타 7종으로 나눠 모델 계열별 가중치를 곱해 더하는 <strong>휴리스틱 추정</strong>을 씁니다. 실제 토크나이저는 자주 쓰이는 단어·어절을 한 토큰으로 묶기 때문에, 같은 글자 수라도 흔한 표현이 많으면 더 적게, 고유명사·신조어가 많으면 더 많이 나옵니다. 그래서 <strong>±10~20% 정도 차이</strong>가 날 수 있고 한국어 비중이 높을수록 차이가 커집니다. 청구 금액을 정확히 맞춰야 한다면 OpenAI tokenizer 페이지, Anthropic의 <code>count_tokens</code> API, Gemini API의 <code>countTokens</code>로 실제 값을 확인하세요.',
  },
  {
    q: 'tiktoken 같은 실제 토크나이저를 쓰지 않는 이유는?',
    a: 'OpenAI 토크나이저(tiktoken)는 모델별 어휘(BPE) 파일만 해도 1MB가 넘어 모바일에서 페이지를 무겁게 만듭니다. 또 Claude는 최신 모델용 공개 토크나이저가 없어 API(<code>count_tokens</code>)로 세거나 추정해야 하고, Gemini도 공식 SDK의 로컬 토크나이저는 텍스트 전용 실험 기능이라 정확한 청구 기준은 <code>countTokens</code> API입니다. 이 도구는 세 회사 모델을 같은 화면에서 즉시 비교하는 가벼움을 우선했고, 정확도가 결정적인 작업은 각 사 토큰 계산 API를 권장합니다.',
  },
  {
    q: '한국어가 영어보다 토큰을 더 많이 쓰는 이유는?',
    a: '토크나이저 어휘는 학습 데이터에 많이 나온 문자열 조각으로 만들어집니다. 영어는 <code>the</code>·<code>ing</code> 같은 흔한 조각이 통째로 어휘에 들어 있어 여러 글자가 1토큰으로 압축되지만, 한국어는 음절 조합이 많고 학습 데이터 비중이 작아 한 음절이 1토큰 안팎으로 쪼개지는 일이 흔합니다. 같은 내용을 영어로 쓰면 토큰이 얼마나 줄어드는지는 본문 ‘한국어 토큰 효율’ 절의 샘플 계산을 참고하세요. 차이는 모델·토크나이저 버전마다 크게 다르므로 실제 비교는 각 사 API로 확인하세요.',
  },
  {
    q: '시스템 프롬프트도 매번 비용으로 청구되나요?',
    a: '예. API는 대화 상태를 기억하지 않으므로 시스템 프롬프트와 이전 대화가 <strong>매 호출마다 입력 토큰으로</strong> 다시 청구됩니다. 대신 OpenAI·Anthropic·Google 모두 <strong>프롬프트 캐싱</strong>을 제공해, 앞부분이 똑같이 반복되는 입력은 할인된 단가(대략 정가의 10~50%)로 청구됩니다. 최소 길이, 캐시 유지 시간 같은 조건이 있고, Anthropic처럼 캐시에 처음 쓸 때는 정가보다 비싸게 받는 곳도 있으니 호출 빈도가 충분히 높을 때 효과가 큽니다. 캐시는 앞부분이 한 글자만 달라져도 깨지므로 날짜·요청 ID 같은 변하는 값은 프롬프트 뒤쪽에 두세요.',
  },
  {
    q: '출력 토큰이 입력 토큰보다 비싼 이유는?',
    a: '입력 토큰은 한 번에 병렬로 처리할 수 있지만, 출력은 토큰을 하나씩 순서대로 생성(자기회귀 디코딩)해야 해서 같은 토큰 수에 GPU 시간이 훨씬 많이 듭니다. 이 페이지 표의 대표 모델 기준으로 입력:출력 단가 비율은 <strong>1:' + fmtRatio(RATIO_MIN) + '~1:' + fmtRatio(RATIO_MAX) + '</strong>입니다. 그래서 응답 길이를 줄이는 것이 가장 큰 절감 수단입니다. <code>max_tokens</code>로 상한을 두고, "300자 이내" 같은 지시나 JSON 스키마로 필요한 항목만 받게 하세요.',
  },
  {
    q: '컨텍스트 한도를 넘으면 어떻게 되나요?',
    a: 'API는 요청을 처리하지 않고 <strong>오류를 반환</strong>합니다(보통 HTTP 400, OpenAI는 <code>context_length_exceeded</code>). 입력과 출력 상한(<code>max_tokens</code>)을 합친 값이 한도를 넘어도 거부되는 모델이 있으니 긴 입력에는 출력 여유분을 남기세요. 웹 채팅 서비스는 제품마다 처리 방식이 달라 오래된 대화를 요약하거나 잘라내기도 하고, 새 대화를 시작하라고 안내하기도 합니다. 긴 대화에서 앞부분 맥락이 흐려진다고 느껴지면 핵심을 요약해 새 대화로 옮기는 편이 안전합니다.',
  },
  {
    q: 'API 비용을 줄이는 가장 효과적인 방법은?',
    a: '<strong>1) 모델 선택</strong> — 분류·요약·추출은 저가 모델(mini·Haiku·Flash), 복잡한 추론만 상위 모델로 나눕니다. <strong>2) 출력 제한</strong> — 출력 단가가 입력보다 몇 배 비싸므로 <code>max_tokens</code>와 길이 지시가 효과적입니다. <strong>3) 프롬프트 캐싱</strong> — 긴 시스템 프롬프트·참고 문서를 앞에 고정합니다. <strong>4) 배치 API</strong> — 즉시 응답이 필요 없는 대량 작업은 OpenAI·Anthropic·Google 모두 배치 처리 시 표준 단가의 절반입니다. <strong>5) 입력 정리</strong> — 반복되는 예시·불필요한 대화 기록을 빼면 매 호출 입력이 줄어듭니다.',
  },
  {
    q: '원화 금액은 어떤 환율로 계산하나요?',
    a: '₩ 환산은 <strong>1 USD = ' + KRW_RATE.toLocaleString('en-US') + '원</strong> 고정값으로 단순 곱합니다. 실제 청구는 결제 시점 환율과 카드사 해외 결제 수수료가 붙어 달라지므로, 예산을 잡을 때는 달러 금액을 기준으로 보고 원화는 대략적인 감으로만 쓰세요.',
  },
]

export default function TokenCounterPage() {
  return (
    <ToolPage width={880} slug="/tools/dev/token-counter">
      <h1 className="tp-h1">
        <ToolIconBadge catId="dev" />AI 프롬프트 토큰 카운터
      </h1>
      <p className="tp-lead">
        GPT·Claude·Gemini 토큰 수와 컨텍스트 사용량을 한 화면에. <strong style={{ color: 'var(--text)' }}>한국어 비효율과 API 비용</strong>까지 동시 추정.
      </p>
      <UpdatedMeta
        date={PRICE_CHECKED}
        basis="각 사 공개 API 표준 단가(대표 모델, 배치·캐시 할인 제외)"
        sources={[
          { label: 'Anthropic 가격', href: 'https://platform.claude.com/docs/en/about-claude/pricing' },
          { label: 'OpenAI 가격', href: 'https://openai.com/api/pricing/' },
          { label: 'Gemini API 가격', href: 'https://ai.google.dev/gemini-api/docs/pricing' },
        ]}
      />

      <TokenCounterClient />

      <GuideDivider />

      {/* 1. 토큰이란? */}
      <h2 className="g-h2">토큰(token)이란?</h2>
      <p className="g-p">
        LLM은 문자가 아닌 <strong>토큰</strong>이라는 단위로 텍스트를 처리합니다. 한 토큰은
        영문 기준 약 <strong>4글자(¾ 단어)</strong>에 해당하며, 한국어는 한 음절이
        대략 <strong>1~1.5토큰</strong>으로 쪼개집니다(모델마다 다름). 모델 가격·컨텍스트 한도·응답 속도가 모두 토큰 단위로 매겨지므로
        프롬프트를 최적화하려면 토큰 수를 의식하는 것이 첫걸음입니다.
      </p>
      <p className="g-p">
        토큰은 모델마다 다른 &lsquo;어휘 사전&rsquo;으로 잘립니다. 같은 문장이라도 GPT·Claude·Gemini의 토큰 수가 서로 다르게 나오는 이유이고,
        같은 회사 모델이라도 세대가 바뀌며 토크나이저가 바뀌면 토큰 수가 달라집니다. 그래서 비용을 비교할 때는 &lsquo;1M 토큰당 가격&rsquo;만이 아니라
        &lsquo;내 글이 그 모델에서 몇 토큰인지&rsquo;를 함께 곱해야 합니다.
      </p>

      {/* 2. 모델별 한도·가격 */}
      <h2 className="g-h2">모델별 컨텍스트 한도·가격 ({PRICE_CHECKED} 점검)</h2>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
          <thead>
            <tr style={rowBorder}>
              {['모델', '컨텍스트', '입력 / 1M', '출력 / 1M', '특징'].map(h => (
                <th scope="col" key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODELS.map((m) => [
              m.name, fmtContext(m.contextWindow), fmtPrice(m.inputPricePerM), fmtPrice(m.outputPricePerM), m.note,
            ]).map((row, i) => (
              <tr key={i} style={{ ...rowBorder, background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                <td style={{ ...td, color: 'var(--accent-ink)', fontWeight: 700 }}>{row[0]}</td>
                <td style={{ ...tdNum, fontWeight: 700 }}>{row[1]}</td>
                <td style={tdNum}>{row[2]}</td>
                <td style={tdNum}>{row[3]}</td>
                <td style={{ ...td, color: 'var(--muted)' }}>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Callout tone="warn" title="결제 전 공식 단가 확인">
        대표 모델 일부만 추린 표입니다. 새 모델이 자주 나오고 가격도 바뀌므로 결제 전 OpenAI·Anthropic·Google 공식 가격 페이지에서 최신 단가를 확인하세요.
        배치 처리·프롬프트 캐싱 할인, 긴 입력 할증은 표준 단가와 별도로 적용됩니다.
      </Callout>

      {/* 3. 계산 방식 */}
      <h2 className="g-h2">이 도구의 계산 방식 — 문자 가중치와 비용 공식</h2>
      <p className="g-p">
        입력한 글을 한 글자씩 읽어 아래 7가지 종류로 나누고, 종류마다 정해진 &lsquo;문자 1개당 토큰&rsquo; 가중치를 더한 뒤 올림합니다.
        가중치는 GPT·Claude·Gemini 세 계열로 따로 두며, 같은 계열 모델(GPT-5·GPT-5 mini·GPT-4o 등)은 같은 토큰 수를 공유합니다.
        도구 입력란에 같은 글자를 1,000개 넣으면 표의 값에 1,000을 곱한 만큼(반올림 차이 ±1) 토큰이 나오므로 직접 확인해 볼 수 있습니다
        (예: &lsquo;가&rsquo; 1,000자 → GPT 계열 {GA_1000.gpt.toLocaleString('en-US')}토큰, Claude 계열 {GA_1000.claude.toLocaleString('en-US')}토큰).
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
          <thead>
            <tr style={rowBorder}>
              {['문자 종류', '예', 'GPT 계열', 'Claude 계열', 'Gemini 계열'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {WEIGHT_ROWS.map((r) => (
              <tr key={r.label} style={rowBorder}>
                <td style={td}>{r.label}</td>
                <td style={{ ...td, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{r.ex === ' ' ? '(공백)' : r.ex}</td>
                {r.w.map((w, i) => <td key={i} style={tdNum}>{w.toFixed(2)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 12 }}>
        비용은 <strong>(입력 토큰 × 입력 단가 + 출력 토큰 × 출력 단가) ÷ 1,000,000 × 호출 횟수</strong>로 계산합니다. 출력 토큰은 미리 알 수 없으므로
        &lsquo;예상 출력 길이&rsquo;에서 고른 배수(짧은 답 ×0.3 · 일반 답 ×1.0 · 긴 답 ×2.5)를 입력 토큰에 곱해 가정합니다.
        Gemini 2.5 Pro처럼 긴 프롬프트 할증이 있는 모델은 입력이 기준(20만 토큰)을 넘으면 그 요청 전체에 높은 단가를 적용하고,
        원화는 1달러 {KRW_RATE.toLocaleString('en-US')}원 고정 환율로 환산합니다.
      </p>
      <p className="g-p">
        예를 들어 도구의 &lsquo;한국어 글&rsquo; 샘플({EX_COUNT.gpt.chars}자 — 한글 {EX_COUNT.gpt.breakdown.hangul}자, 공백 {EX_COUNT.gpt.breakdown.ws}개, 문장부호 {EX_COUNT.gpt.breakdown.punct}개)은
        GPT 계열 {EX_COUNT.gpt.tokens}토큰, Claude 계열 {EX_COUNT.claude.tokens}토큰, Gemini 계열 {EX_COUNT.gemini.tokens}토큰으로 추정됩니다.
        같은 글을 &lsquo;일반 답&rsquo;(×1.0)으로 {EX_CALLS.toLocaleString('en-US')}번 호출하면 모델별 비용은 아래와 같습니다. 도구에서 샘플을 누르고 호출 횟수에 {EX_CALLS.toLocaleString('en-US')}을 넣으면 같은 값이 나옵니다.
      </p>
      <div className="tableScroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
          <thead>
            <tr style={rowBorder}>
              {['모델', '입력 토큰/회', '출력 토큰/회', `${EX_CALLS.toLocaleString('en-US')}회 비용`, '원화 환산'].map((h) => <th scope="col" key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {EX_ROWS.map((r) => (
              <tr key={r.name} style={rowBorder}>
                <td style={{ ...td, fontWeight: 700 }}>{r.name}</td>
                <td style={tdNum}>{r.inTok.toLocaleString('en-US')}</td>
                <td style={tdNum}>{r.outTok.toLocaleString('en-US')}</td>
                <td style={{ ...tdNum, fontWeight: 700 }}>{fmtUSD(r.total)}</td>
                <td style={{ ...tdNum, color: 'var(--muted)' }}>₩{Math.round(r.total * KRW_RATE).toLocaleString('ko-KR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p" style={{ marginTop: 12 }}>
        짧은 글 한 편은 몇 원 수준이지만, 챗봇처럼 이전 대화를 매번 다시 보내는 구조에서는 대화가 길어질수록 호출당 입력 토큰이 계속 불어납니다.
        월 비용을 잡을 때는 &lsquo;평균 대화 길이 × 하루 호출 수 × 30&rsquo;으로 입력 토큰을 먼저 어림한 뒤 이 도구에 넣어 보는 것이 안전합니다.
      </p>

      {/* 4. 한국어 토큰 효율 */}
      <h2 className="g-h2">한국어 토큰 효율 — 왜 영문보다 비쌀까?</h2>
      <p className="g-p">
        LLM 토크나이저는 영어 비중이 큰 데이터로 어휘를 만들기 때문에 <strong>한국어 음절을 더 잘게 쪼갭니다</strong>.
        이 도구의 영문 환산 추정으로는 위 한국어 샘플({EX_COUNT.gpt.tokens}토큰, GPT 기준)을 영어로 쓰면 약 {EX_EN}토큰으로 줄어듭니다.
        GPT-4o부터 쓰는 o200k_base 토크나이저는 이전 cl100k_base보다 한국어를 훨씬 적은 토큰으로 처리하도록 개선됐고,
        이 도구는 Claude 계열 가중치를 가장 높게(한글 1자 ≈ 1.55토큰) 잡은 보수적 추정을 씁니다. 모델·토크나이저 버전마다 차이가 크므로 정확한 비교는 각 사 토큰 계산 API로 확인하세요.
      </p>
      <ul className="g-list">
        <li><strong>비용 민감 작업</strong>: 시스템 프롬프트·참고 문서는 영문으로, 사용자에게 보이는 응답만 한국어로 받습니다.</li>
        <li><strong>간결한 지시</strong>: 같은 지시를 짧게 쓰면 매 호출 입력 토큰이 그만큼 줄어듭니다. 예시·설명이 반복되지 않는지 점검하세요.</li>
        <li><strong>JSON 출력</strong>: 한글 key 대신 영문 key를 씁니다. key는 항목마다 반복되므로 효과가 큽니다.</li>
        <li><strong>여러 모델 비교</strong>: 같은 글도 모델별 토큰 수가 달라 단가표만으로는 순위가 뒤바뀔 수 있습니다. 실제 글로 토큰 수를 재서 비교하세요.</li>
      </ul>

      {/* 5. 컨텍스트 윈도우 활용 */}
      <h2 className="g-h2">컨텍스트 윈도우(context window) 활용 가이드</h2>
      <p className="g-p">
        컨텍스트 윈도우는 모델이 한 요청에서 다룰 수 있는 최대 토큰 수입니다. 보통 입력과 출력을 합친 한도라서, 긴 문서를 넣으면 받을 수 있는 답의 길이도 그만큼 줄어듭니다.
        초과하면 API는 오류를 돌려주고, 채팅 서비스는 앞부분 대화를 요약하거나 잘라낼 수 있습니다.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {[
          { t: '128K (GPT-4o)', d: '긴 문서 1~2개', desc: '단일 PDF·코드 파일 1~2개, 일반 대화에 충분' },
          { t: '200K (Claude Haiku 4.5)', d: '긴 보고서 여러 편', desc: '긴 문서 요약·중간 규모 코드 분석' },
          { t: '400K (GPT-5)', d: '긴 문서 여러 편', desc: '출력 토큰까지 합친 한도 — 긴 답을 받으려면 입력을 그만큼 줄여야 함' },
          { t: '1M (Claude Opus·Sonnet 5, Gemini 2.5)', d: '문서 묶음 한 번에', desc: '여러 문서 비교, 대형 코드베이스·논문 묶음' },
        ].map((g, i) => (
          <div key={i} style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 13, color: 'var(--accent-ink)', fontWeight: 700, margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>{g.t}</p>
            <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px' }}>{g.d}</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
          </div>
        ))}
      </div>
      <Callout tone="tip" title="크다고 늘 좋은 것은 아닙니다">
        컨텍스트가 길수록 응답이 느려지고, 일부 모델은 긴 입력에 할증 단가를 적용합니다(예: Gemini 2.5 Pro는 입력 20만 토큰 초과 시 입력 단가 2배).
        필요한 부분만 골라 넣는 편이 비용과 답의 정확도 모두에 유리합니다.
      </Callout>

      {/* FAQ */}
      <Faq items={FAQ_LD} />

      {/* 함께 쓰면 좋은 도구 */}
      <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {[
          { href: '/tools/dev/json',          icon: '📋', name: 'JSON 포맷터',           desc: '응답 정리·TypeScript 타입 추출' },
          { href: '/tools/dev/regex',         icon: '🔍', name: '정규식 테스트기',        desc: '프롬프트 응답 파싱·검증' },
          { href: '/tools/dev/curl',          icon: '🌀', name: 'cURL 변환기',           desc: 'fetch·axios·Python으로 즉시' },
          { href: '/tools/dev/http-status',   icon: '🌐', name: 'HTTP 상태 코드 검색기',   desc: '400·429 같은 API 오류 해석' },
          { href: '/tools/art/charcount',     icon: '✏️', name: '글자 수 세기',          desc: '바이트·공백 제외 카운트' },
          { href: '/tools/dev/llm-vram',      icon: '🧠', name: '로컬 LLM VRAM 계산기',   desc: '내 GPU에 모델이 돌아갈까' },
        ].map((tool, i) => (
          <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
            <span style={{ fontSize: '22px' }}>{tool.icon}</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </ToolPage>
  )
}
