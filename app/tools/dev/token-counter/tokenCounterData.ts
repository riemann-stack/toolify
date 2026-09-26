/* ──────────────────────────────────────────────────────
   token-counter/tokenCounterData.ts
   GPT·Claude·Gemini 토큰 추정 + 모델 메타데이터
   ──────────────────────────────────────────────────────
   ⚠️ 추정치 — 각 모델의 토크나이저(o200k_base / Claude BPE / SentencePiece)는
      공개 정도가 다르고, 한국어/CJK 토큰 효율도 크게 차이. 본 도구는
      문자 분류 기반 휴리스틱으로 ±10~20% 정확도를 목표로 합니다.
   ────────────────────────────────────────────────────── */

export type Vendor = 'openai' | 'anthropic' | 'google'

export interface ModelInfo {
  id: string
  name: string
  vendor: Vendor
  vendorLabel: string
  badge?: string                // 예: '저가', '균형'
  contextWindow: number         // 토큰
  inputPricePerM: number        // USD / 1M input tokens
  outputPricePerM: number       // USD / 1M output tokens
  /** 긴 프롬프트 할증 — 입력이 threshold 토큰을 넘으면 요청 전체에 이 단가 적용 (Gemini 2.5 Pro 등) */
  longContext?: { threshold: number; inputPricePerM: number; outputPricePerM: number }
  /** 가이드 표의 한 줄 설명 */
  note: string
  /** 추정 토크나이저 효율 — 'baseline' 가중치에 곱해지는 계수 */
  efficiency: 'gpt' | 'claude' | 'gemini'
}

/** 가격 점검 시점 — page.tsx UpdatedMeta·표 제목과 Client 안내문이 함께 사용 */
export const PRICE_CHECKED = '2026년 9월'

/**
 * 공개 표준 단가(USD/1M 토큰, 배치·캐시 할인 제외) — 대표 모델만 추린 참고표.
 * 출처: Anthropic platform.claude.com/docs/en/about-claude/pricing (Opus 5 $5/$25·1M, Sonnet 5 $2/$10·1M, Haiku 4.5 $1/$5·200K),
 *       OpenAI openai.com/api/pricing (GPT-5 $1.25/$10, GPT-5 mini $0.25/$2, GPT-4o $2.50/$10),
 *       Google ai.google.dev/gemini-api/docs/pricing (2.5 Pro $1.25/$10, 200K 초과 $2.50/$15 · 1,048,576 토큰, 2.5 Flash $0.30/$2.50).
 * 새 모델 출시·가격 변경이 잦으므로 PRICE_CHECKED와 함께 주기적으로 갱신할 것.
 */
export const MODELS: ModelInfo[] = [
  // OpenAI
  { id: 'gpt-5',         name: 'GPT-5',         vendor: 'openai',    vendorLabel: 'OpenAI',                  contextWindow: 400_000,   inputPricePerM: 1.25, outputPricePerM: 10.00, efficiency: 'gpt', note: '범용 추론 모델 (입력+출력 합산 400K)' },
  { id: 'gpt-5-mini',    name: 'GPT-5 mini',    vendor: 'openai',    vendorLabel: 'OpenAI',    badge: '저가',  contextWindow: 400_000,   inputPricePerM: 0.25, outputPricePerM: 2.00,  efficiency: 'gpt', note: '저가형 — 분류·요약·추출' },
  { id: 'gpt-4o',        name: 'GPT-4o',        vendor: 'openai',    vendorLabel: 'OpenAI',    badge: '이전 세대', contextWindow: 128_000, inputPricePerM: 2.50, outputPricePerM: 10.00, efficiency: 'gpt', note: '이전 세대 멀티모달 모델' },
  // Anthropic
  { id: 'claude-opus-5',   name: 'Claude Opus 5',    vendor: 'anthropic', vendorLabel: 'Anthropic', badge: '고성능', contextWindow: 1_000_000, inputPricePerM: 5.00, outputPricePerM: 25.00, efficiency: 'claude', note: '복잡한 추론·코딩·장문 작업' },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5',  vendor: 'anthropic', vendorLabel: 'Anthropic', badge: '균형',   contextWindow: 1_000_000, inputPricePerM: 2.00, outputPricePerM: 10.00, efficiency: 'claude', note: '성능·비용 균형형' },
  { id: 'claude-haiku-4-5',name: 'Claude Haiku 4.5', vendor: 'anthropic', vendorLabel: 'Anthropic', badge: '저가',   contextWindow: 200_000,   inputPricePerM: 1.00, outputPricePerM: 5.00,  efficiency: 'claude', note: '빠르고 저렴 — 분류·태깅' },
  // Google
  { id: 'gemini-2.5-pro',  name: 'Gemini 2.5 Pro',  vendor: 'google', vendorLabel: 'Google', badge: '장문', contextWindow: 1_048_576, inputPricePerM: 1.25, outputPricePerM: 10.00, efficiency: 'gemini', note: '긴 문서 — 입력 200K 초과 시 $2.50/$15', longContext: { threshold: 200_000, inputPricePerM: 2.50, outputPricePerM: 15.00 } },
  { id: 'gemini-2.5-flash',name: 'Gemini 2.5 Flash',vendor: 'google', vendorLabel: 'Google', badge: '저가', contextWindow: 1_048_576, inputPricePerM: 0.30, outputPricePerM: 2.50,  efficiency: 'gemini', note: '저가 + 1M 컨텍스트' },
]

/** 입력 토큰 수에 따라 적용되는 단가 (긴 프롬프트 할증 반영) */
export function priceFor(m: ModelInfo, inputTokens: number): { input: number; output: number } {
  if (m.longContext && inputTokens > m.longContext.threshold) {
    return { input: m.longContext.inputPricePerM, output: m.longContext.outputPricePerM }
  }
  return { input: m.inputPricePerM, output: m.outputPricePerM }
}

/** 컨텍스트 한도 표기 — 1,048,576(2^20)·1,000,000은 1M, 그 밖은 K 단위 */
export function fmtContext(n: number): string {
  if (n % 1_048_576 === 0) return `${n / 1_048_576}M`
  if (n >= 1_000_000) return `${Math.round(n / 100_000) / 10}M`
  return `${Math.round(n / 1000).toLocaleString('en-US')}K`
}

/** 컨텍스트 막대 기준(가장 큰 모델 한도) */
export const MAX_CONTEXT = Math.max(...MODELS.map((m) => m.contextWindow))

export const VENDOR_COLOR: Record<Vendor, string> = {
  openai:    '#10A37F',
  anthropic: '#D97757',
  google:    '#4285F4',
}

// ─── 문자 분류 ────────────────────────────────────────────
export type CharClass = 'hangul' | 'cjk' | 'latin' | 'digit' | 'ws' | 'punct' | 'other'

export function classifyChar(ch: string): CharClass {
  const code = ch.charCodeAt(0)
  if (code >= 0xAC00 && code <= 0xD7AF) return 'hangul'  // 한글 음절
  if (code >= 0x3130 && code <= 0x318F) return 'hangul'  // 한글 자모
  if (code >= 0x4E00 && code <= 0x9FFF) return 'cjk'     // CJK 통합 한자
  if (code >= 0x3040 && code <= 0x30FF) return 'cjk'     // 히라가나·가타카나
  if ((code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A)) return 'latin'
  if (code >= 0x30 && code <= 0x39) return 'digit'
  if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') return 'ws'
  if (/[.,!?;:'"`(){}\[\]<>/\\|@#$%^&*\-+=_~]/.test(ch)) return 'punct'
  return 'other'
}

/**
 * 모델별 문자당 토큰 가중치 — 실제 토크나이저 대비 ±10~20% 근사.
 *
 * Claude: 한국어·CJK에서 비교적 비효율 (1.5+ tokens/syllable).
 * GPT-4o (o200k_base): 한국어 효율 개선됨 (이전 cl100k 대비 30~40% ↓).
 * Gemini (SentencePiece): GPT와 비슷하거나 약간 더 효율적.
 */
const WEIGHTS: Record<'gpt' | 'claude' | 'gemini', Record<CharClass, number>> = {
  gpt:    { hangul: 0.95, cjk: 1.05, latin: 0.25, digit: 0.33, ws: 0.25, punct: 0.50, other: 1.00 },
  claude: { hangul: 1.55, cjk: 1.35, latin: 0.28, digit: 0.40, ws: 0.28, punct: 0.60, other: 1.20 },
  gemini: { hangul: 0.90, cjk: 1.00, latin: 0.25, digit: 0.33, ws: 0.25, punct: 0.50, other: 0.95 },
}

export interface CountResult {
  tokens: number
  chars: number
  breakdown: Record<CharClass, number>  // 문자 분포
}

export function countTokens(text: string, eff: 'gpt' | 'claude' | 'gemini'): CountResult {
  const w = WEIGHTS[eff]
  let tokens = 0
  const breakdown: Record<CharClass, number> = {
    hangul: 0, cjk: 0, latin: 0, digit: 0, ws: 0, punct: 0, other: 0,
  }
  for (const ch of text) {
    const cls = classifyChar(ch)
    breakdown[cls]++
    tokens += w[cls]
  }
  return { tokens: Math.ceil(tokens), chars: Array.from(text).length, breakdown }
}

/** 한국어 비중 (한글 + CJK) 비율 */
export function koreanRatio(breakdown: Record<CharClass, number>, chars: number): number {
  if (chars === 0) return 0
  return (breakdown.hangul + breakdown.cjk) / chars
}

/** 한국어를 영문으로 번역했을 때 토큰 절감 추정.
 *  대략 한글 1자 ≈ 영문 1.4단어 정도의 정보량 → 영문 토큰은 한글 토큰의 ~40% */
export function estimateEnglishTokens(breakdown: Record<CharClass, number>, eff: 'gpt' | 'claude' | 'gemini'): number {
  const w = WEIGHTS[eff]
  // 한글·CJK 부분을 영문화한다고 가정 — 평균 5자 단어 ~ 1.2토큰
  const koreanChars = breakdown.hangul + breakdown.cjk
  const koreanAsEnglishTokens = koreanChars * 0.6   // 영문 환산
  // 비한글 부분(이미 영문/숫자/공백·구두점)은 그대로
  const restTokens =
    breakdown.latin * w.latin +
    breakdown.digit * w.digit +
    breakdown.ws    * w.ws +
    breakdown.punct * w.punct +
    breakdown.other * w.other
  return Math.ceil(koreanAsEnglishTokens + restTokens)
}

// ─── 샘플 텍스트 ───────────────────────────────────────────
export const SAMPLES: { id: string; label: string; text: string }[] = [
  {
    id: 'kr',
    label: '한국어 글',
    text: '인공지능 챗봇이 대중화되면서 토큰 비용이 새로운 가계부 항목이 됐다. 특히 한국어는 영어보다 토큰 효율이 떨어져, 같은 의미를 표현해도 더 많은 토큰을 소비하는 경향이 있다.',
  },
  {
    id: 'en',
    label: '영문',
    text: 'AI assistants have changed how we think about productivity. The pricing of large language models is now measured per million tokens, and Korean text typically uses 50% more tokens than equivalent English.',
  },
  {
    id: 'mix',
    label: '한영 혼합',
    text: 'GPT-4o의 context window는 128K token입니다. 긴 문서를 한 번에 요약하려면 Gemini 2.5 Pro (1M tokens)를 고려해보세요. Claude Sonnet 5도 1M을 지원합니다.',
  },
  {
    id: 'code',
    label: '코드',
    text: `function countTokens(text, model) {
  let tokens = 0
  for (const ch of text) {
    const cls = classify(ch)
    tokens += WEIGHTS[model][cls]
  }
  return Math.ceil(tokens)
}`,
  },
]
