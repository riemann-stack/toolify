/* ──────────────────────────────────────────────────────
   dev/llm-vram/llmVramData.ts
   로컬 LLM VRAM 계산 — GGUF 양자화 가중치 + KV 캐시 + 오버헤드
   ──────────────────────────────────────────────────────
   근거 (2026-07 웹검증 — 리서치+적대검증 워크플로)
   - 실효 bpw: llama.cpp tools/quantize README의 Llama-3.1-8B 실측표 (공식).
     Q2_K 3.1593 / Q3_K_M 3.9960 / Q4_K_M 4.8944 / Q5_K_M 5.7036 / Q6_K 6.5633 /
     Q8_0 8.5008 / F16 16.0005. 임베딩·고정밀 텐서 포함 실효값이라 별도 보정 불필요.
   - 가중치 공식: 파일 GB ≈ 파라미터(B) × bpw ÷ 8. 앵커: Llama3.1-8B Q4_K_M 4.92GB(계산 4.91),
     Qwen2.5-7B Q4_K_M 4.68GB(계산 4.66). 70B급은 실효 bpw가 소폭 낮아 ~1.5-2% 과대 추정
     (70.6B 계산 43.2 vs 실제 42.52GB) → '약' 표기.
   - KV 캐시: bytes = 2(K,V) × layers × kv_heads × head_dim × ctx × elem(F16 2 / Q8_0 1 / Q4_0 0.5).
     앵커: Llama3.1-8B = 128KiB/tok → 128K ctx에서 16GiB(=17.2GB). NVIDIA 기술블로그 공식과 등가.
   - Gemma 3는 sliding window attention(윈도 1024, 6레이어 중 5 로컬) — 나이브 공식이 5~6배
     과대 → 글로벌 레이어(1/6)만 전체 ctx, 로컬은 min(ctx,1024)로 계산 (llama.cpp iSWA 지원).
   - 모델 스펙: HuggingFace 공식 config.json 실측 (검증 에이전트 재확인).
   - 오버헤드: CUDA 런타임 ~0.3-0.75GB + 컴퓨트 버퍼 여유 1~2GB (커뮤니티 관행 — 공식 수치 없음).
   - GPU 용량: NVIDIA 공표 스펙. 표기 GB는 GiB이므로 비교는 ×2^30 바이트 기준(약간 보수적 아님, 정확).
   - Apple Silicon: Metal 기본 GPU 할당 상한 ≈ 통합메모리의 ~75% (llama.cpp Discussion #2182).
   ────────────────────────────────────────────────────── */

export interface Quant {
  id: string
  bpw: number
  hint: string
}

export const QUANTS: Quant[] = [
  { id: 'Q2_K', bpw: 3.1593, hint: '최소 용량 — 품질 손실 큼' },
  { id: 'Q3_K_M', bpw: 3.996, hint: 'VRAM 부족할 때 차선' },
  { id: 'Q4_K_M', bpw: 4.8944, hint: '용량·품질 균형 — 기본 추천' },
  { id: 'Q5_K_M', bpw: 5.7036, hint: '여유 있으면 권장' },
  { id: 'Q6_K', bpw: 6.5633, hint: '원본에 근접한 품질' },
  { id: 'Q8_0', bpw: 8.5008, hint: '사실상 무손실' },
  { id: 'F16', bpw: 16.0005, hint: '원본 정밀도' },
]

export interface ModelSpec {
  id: string
  name: string
  paramsB: number
  layers: number
  kvHeads: number
  headDim: number
  /** 네이티브 컨텍스트 (초과 선택 시 YaRN 등 확장 필요 표시) */
  nativeCtx: number
  /** 선택 가능한 최대 컨텍스트 */
  maxCtx: number
  /** Gemma 3 계열 sliding window attention */
  swa?: { window: number; pattern: number }
  tag?: string
}

export const MODELS: ModelSpec[] = [
  { id: 'llama31-8b', name: 'Llama 3.1 8B', paramsB: 8.03, layers: 32, kvHeads: 8, headDim: 128, nativeCtx: 131072, maxCtx: 131072 },
  { id: 'llama33-70b', name: 'Llama 3.3 70B', paramsB: 70.6, layers: 80, kvHeads: 8, headDim: 128, nativeCtx: 131072, maxCtx: 131072 },
  { id: 'qwen3-8b', name: 'Qwen3 8B', paramsB: 8.2, layers: 36, kvHeads: 8, headDim: 128, nativeCtx: 32768, maxCtx: 131072 },
  { id: 'qwen3-14b', name: 'Qwen3 14B', paramsB: 14.8, layers: 40, kvHeads: 8, headDim: 128, nativeCtx: 32768, maxCtx: 131072 },
  { id: 'qwen3-32b', name: 'Qwen3 32B', paramsB: 32.8, layers: 64, kvHeads: 8, headDim: 128, nativeCtx: 32768, maxCtx: 131072 },
  { id: 'gemma3-12b', name: 'Gemma 3 12B', paramsB: 12.2, layers: 48, kvHeads: 8, headDim: 256, nativeCtx: 131072, maxCtx: 131072, swa: { window: 1024, pattern: 6 } },
  { id: 'gemma3-27b', name: 'Gemma 3 27B', paramsB: 27.4, layers: 62, kvHeads: 16, headDim: 128, nativeCtx: 131072, maxCtx: 131072, swa: { window: 1024, pattern: 6 } },
  { id: 'mistral-small3', name: 'Mistral Small 3 24B', paramsB: 23.6, layers: 40, kvHeads: 8, headDim: 128, nativeCtx: 32768, maxCtx: 32768 },
  { id: 'dsr1-qwen-14b', name: 'DeepSeek-R1 Distill 14B', paramsB: 14.8, layers: 48, kvHeads: 8, headDim: 128, nativeCtx: 131072, maxCtx: 131072 },
  { id: 'dsr1-qwen-32b', name: 'DeepSeek-R1 Distill 32B', paramsB: 32.8, layers: 64, kvHeads: 8, headDim: 128, nativeCtx: 131072, maxCtx: 131072 },
  { id: 'exaone35-7b', name: 'EXAONE 3.5 7.8B', paramsB: 7.8, layers: 32, kvHeads: 8, headDim: 128, nativeCtx: 32768, maxCtx: 32768, tag: '🇰🇷 LG' },
  { id: 'exaone35-32b', name: 'EXAONE 3.5 32B', paramsB: 32.0, layers: 64, kvHeads: 8, headDim: 128, nativeCtx: 32768, maxCtx: 32768, tag: '🇰🇷 LG' },
  { id: 'kanana15-8b', name: 'Kanana 1.5 8B', paramsB: 8.03, layers: 32, kvHeads: 8, headDim: 128, nativeCtx: 32768, maxCtx: 131072, tag: '🇰🇷 카카오' },
]

export const CTX_OPTIONS = [2048, 4096, 8192, 16384, 32768, 65536, 131072]

export const KV_TYPES = [
  { id: 'f16', label: 'F16 (기본)', bytes: 2 },
  { id: 'q8_0', label: 'Q8_0 (½)', bytes: 1 },
  { id: 'q4_0', label: 'Q4_0 (¼)', bytes: 0.5 },
] as const

export type KvTypeId = (typeof KV_TYPES)[number]['id']

/** 오버헤드 관행치: CUDA 런타임 ~0.75GB + 컴퓨트 버퍼 여유 ~1.25GB (공식 수치 아님) */
export const OVERHEAD_GB = 2.0

export interface GpuOption {
  id: string
  label: string
  gb: number // 공표 용량 (GiB)
}

export const GPUS: GpuOption[] = [
  { id: '4060', label: 'RTX 4060 · 3070 (8GB)', gb: 8 },
  { id: '3080', label: 'RTX 3080 (10GB)', gb: 10 },
  { id: '3060', label: 'RTX 3060 · 4070 · 5070 (12GB)', gb: 12 },
  { id: '4080', label: 'RTX 4080 · 5080 · 4060 Ti 16G (16GB)', gb: 16 },
  { id: '3090', label: 'RTX 3090 · 4090 (24GB)', gb: 24 },
  { id: '5090', label: 'RTX 5090 (32GB)', gb: 32 },
  { id: 'mac', label: 'Mac 통합메모리 (직접 입력)', gb: 0 },
]

/** Mac 통합메모리 중 GPU 사용 가능 비율 (Metal 기본 상한 관행) */
export const MAC_GPU_RATIO = 0.75

const GIB = 1024 ** 3

/** 가중치 크기 (bytes) */
export function weightsBytes(paramsB: number, bpw: number): number {
  return (paramsB * 1e9 * bpw) / 8
}

/** KV 캐시 크기 (bytes) — SWA 모델은 글로벌/로컬 레이어 분리 */
export function kvCacheBytes(m: Pick<ModelSpec, 'layers' | 'kvHeads' | 'headDim' | 'swa'>, ctx: number, elemBytes: number): number {
  const perLayerPerTok = 2 * m.kvHeads * m.headDim * elemBytes
  if (m.swa) {
    const globalL = Math.ceil(m.layers / m.swa.pattern)
    const localL = m.layers - globalL
    return perLayerPerTok * (globalL * ctx + localL * Math.min(ctx, m.swa.window))
  }
  return perLayerPerTok * m.layers * ctx
}

export interface VramResult {
  weightsGB: number
  kvGB: number
  overheadGB: number
  totalGB: number
  totalBytes: number
}

export function calcVram(m: ModelSpec, bpw: number, ctx: number, kvElemBytes: number): VramResult {
  const w = weightsBytes(m.paramsB, bpw)
  const kv = kvCacheBytes(m, ctx, kvElemBytes)
  const overhead = OVERHEAD_GB * 1e9
  const total = w + kv + overhead
  return {
    weightsGB: w / 1e9,
    kvGB: kv / 1e9,
    overheadGB: OVERHEAD_GB,
    totalGB: total / 1e9,
    totalBytes: total,
  }
}

export type FitLevel = 'ok' | 'tight' | 'no'

/** GPU 적합 판정 — 공표 GB(GiB)를 바이트로 환산해 비교 */
export function fitGpu(totalBytes: number, gpuGb: number): FitLevel {
  const cap = gpuGb * GIB
  if (totalBytes <= cap * 0.9) return 'ok'
  if (totalBytes <= cap) return 'tight'
  return 'no'
}
