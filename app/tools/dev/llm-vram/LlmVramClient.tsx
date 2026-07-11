'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  QUANTS, MODELS, CTX_OPTIONS, KV_TYPES, GPUS, OVERHEAD_GB, MAC_GPU_RATIO,
  calcVram, fitGpu,
  type KvTypeId, type ModelSpec, type FitLevel,
} from './llmVramData'
import s from './llm-vram.module.css'

const fmtGB = (n: number, d = 1) => n.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d })
const fmtCtx = (c: number) => (c >= 1024 ? `${Math.round(c / 1024)}K` : String(c))

const FIT_LABEL: Record<FitLevel, { text: string; cls: string }> = {
  ok: { text: '여유', cls: 'fitOk' },
  tight: { text: '빠듯', cls: 'fitTight' },
  no: { text: '불가', cls: 'fitNo' },
}

export default function LlmVramClient() {
  const [modelId, setModelId] = useState('llama31-8b')
  const [custom, setCustom] = useState({ paramsB: '8', layers: '32', kvHeads: '8', headDim: '128' })
  const [quantId, setQuantId] = useState('Q4_K_M')
  const [ctx, setCtx] = useState(8192)
  const [kvType, setKvType] = useState<KvTypeId>('f16')
  const [gpuId, setGpuId] = useState('3060')
  const [macRam, setMacRam] = useState('16')

  const isCustom = modelId === 'custom'
  const model: ModelSpec = useMemo(() => {
    if (!isCustom) return MODELS.find((m) => m.id === modelId)!
    return {
      id: 'custom', name: '직접 입력',
      paramsB: Math.min(parseFloat(custom.paramsB) || 0, 2000),
      layers: Math.min(parseInt(custom.layers, 10) || 0, 300),
      kvHeads: Math.min(parseInt(custom.kvHeads, 10) || 0, 128),
      headDim: Math.min(parseInt(custom.headDim, 10) || 0, 512),
      nativeCtx: 131072, maxCtx: 131072,
    }
  }, [isCustom, modelId, custom])

  const quant = QUANTS.find((q) => q.id === quantId)!
  const kvInfo = KV_TYPES.find((k) => k.id === kvType)!
  const effCtx = Math.min(ctx, model.maxCtx)

  const result = useMemo(() => {
    if (model.paramsB <= 0 || model.layers <= 0 || model.kvHeads <= 0 || model.headDim <= 0) return null
    return calcVram(model, quant.bpw, effCtx, kvInfo.bytes)
  }, [model, quant, effCtx, kvInfo])

  const gpu = GPUS.find((g) => g.id === gpuId)!
  const gpuGb = gpu.id === 'mac'
    ? Math.max(0, Math.min(parseFloat(macRam) || 0, 512)) * MAC_GPU_RATIO
    : gpu.gb
  const fit = result && gpuGb > 0 ? fitGpu(result.totalBytes, gpuGb) : null

  const quantTable = useMemo(() => {
    if (model.paramsB <= 0 || model.layers <= 0) return []
    return QUANTS.map((q) => {
      const r = calcVram(model, q.bpw, effCtx, kvInfo.bytes)
      return { q, r, fit: gpuGb > 0 ? fitGpu(r.totalBytes, gpuGb) : null }
    })
  }, [model, effCtx, kvInfo, gpuGb])

  const pct = (part: number) => (result ? Math.max(2, (part / result.totalGB) * 100) : 0)

  return (
    <div className={s.wrap}>
      {/* 모델 선택 */}
      <div className={s.card}>
        <p className={s.groupLabel}>모델</p>
        <div className={s.modelGrid} role="group" aria-label="모델 선택">
          {MODELS.map((m) => (
            <button key={m.id} type="button"
              className={`${s.modelBtn} ${m.id === modelId ? s.on : ''}`}
              aria-pressed={m.id === modelId}
              onClick={() => setModelId(m.id)}>
              <span className={s.modelName}>{m.name}</span>
              <span className={s.modelMeta}>{m.paramsB}B{m.tag ? ` · ${m.tag}` : ''}</span>
            </button>
          ))}
          <button type="button"
            className={`${s.modelBtn} ${isCustom ? s.on : ''}`}
            aria-pressed={isCustom}
            onClick={() => setModelId('custom')}>
            <span className={s.modelName}>직접 입력</span>
            <span className={s.modelMeta}>파라미터·레이어</span>
          </button>
        </div>

        {isCustom && (
          <div className={s.customGrid}>
            {([
              ['paramsB', '파라미터 (B)'],
              ['layers', '레이어 수'],
              ['kvHeads', 'KV 헤드'],
              ['headDim', 'head_dim'],
            ] as const).map(([k, label]) => (
              <label key={k} className={s.customField}>
                <span className={s.miniLabel}>{label}</span>
                <input className={s.numInput} type="text" inputMode="decimal" value={custom[k]}
                  onChange={(e) => setCustom((p) => ({ ...p, [k]: e.target.value.replace(/[^0-9.]/g, '') }))}
                  aria-label={label} />
              </label>
            ))}
          </div>
        )}

        {/* 양자화 */}
        <p className={s.groupLabel} style={{ marginTop: 14 }}>양자화 (GGUF)</p>
        <div className={s.quantRow} role="group" aria-label="양자화 선택">
          {QUANTS.map((q) => (
            <button key={q.id} type="button"
              className={`${s.pill} ${q.id === quantId ? s.on : ''}`}
              aria-pressed={q.id === quantId}
              onClick={() => setQuantId(q.id)}>
              {q.id}
            </button>
          ))}
        </div>
        <p className={s.groupNote}>{quant.hint} · 약 {quant.bpw.toFixed(2)} bit/가중치 (llama.cpp 실측)</p>

        {/* 컨텍스트 + KV */}
        <div className={s.ctxRow}>
          <div>
            <p className={s.groupLabel}>컨텍스트 길이</p>
            <div className={s.quantRow} role="group" aria-label="컨텍스트 길이 선택">
              {CTX_OPTIONS.map((c) => (
                <button key={c} type="button"
                  className={`${s.pill} ${c === ctx ? s.on : ''} ${c > model.maxCtx ? s.pillOff : ''}`}
                  aria-pressed={c === ctx}
                  disabled={c > model.maxCtx}
                  onClick={() => setCtx(c)}>
                  {fmtCtx(c)}
                </button>
              ))}
            </div>
            {effCtx > model.nativeCtx && (
              <p className={s.groupNote}>⚠️ 네이티브 {fmtCtx(model.nativeCtx)} 초과 — YaRN 등 컨텍스트 확장 설정이 필요해요.</p>
            )}
          </div>
          <div>
            <p className={s.groupLabel}>KV 캐시 정밀도</p>
            <div className={s.quantRow} role="group" aria-label="KV 캐시 정밀도 선택">
              {KV_TYPES.map((k) => (
                <button key={k.id} type="button"
                  className={`${s.pill} ${k.id === kvType ? s.on : ''}`}
                  aria-pressed={k.id === kvType}
                  onClick={() => setKvType(k.id)}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className={s.resultCard} role="status">
        <p className={s.resultLabel}>{model.name} · {quant.id} · {fmtCtx(effCtx)} 컨텍스트</p>
        {result ? (
          <>
            <p className={s.hero}>
              {fmtGB(result.totalGB)}<span className={s.heroUnit}>GB</span>
            </p>
            <p className={s.resultSub}>
              가중치 {fmtGB(result.weightsGB)} + KV 캐시 {fmtGB(result.kvGB)} + 오버헤드 약 {fmtGB(result.overheadGB)}GB
            </p>
            <div className={s.stack} aria-hidden>
              <div className={s.stackSeg} style={{ width: `${pct(result.weightsGB)}%`, background: 'var(--accent)' }} />
              <div className={s.stackSeg} style={{ width: `${pct(result.kvGB)}%`, background: 'var(--cat-health)' }} />
              <div className={s.stackSeg} style={{ width: `${pct(result.overheadGB)}%`, background: 'var(--border-hover)' }} />
            </div>
            <div className={s.legend}>
              <span><i className={s.dot} style={{ background: 'var(--accent)' }} />가중치</span>
              <span><i className={s.dot} style={{ background: 'var(--cat-health)' }} />KV 캐시</span>
              <span><i className={s.dot} style={{ background: 'var(--border-hover)' }} />오버헤드(관행)</span>
            </div>
            {model.swa && (
              <p className={s.swaNote}>Gemma 3는 슬라이딩 윈도 어텐션이라 KV 캐시가 일반 공식보다 훨씬 작게 계산됐어요 (llama.cpp iSWA 기준).</p>
            )}
          </>
        ) : (
          <p className={s.emptyNote}>모델 스펙을 입력하면 필요 VRAM을 계산해요.</p>
        )}
      </div>

      {/* GPU 판정 */}
      <div className={s.card}>
        <p className={s.groupLabel}>내 GPU에 들어갈까?</p>
        <div className={s.gpuRow}>
          <select className={s.gpuSelect} value={gpuId} onChange={(e) => setGpuId(e.target.value)} aria-label="GPU 선택">
            {GPUS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
          {gpu.id === 'mac' && (
            <span className={s.macBox}>
              <input className={s.numInput} type="text" inputMode="numeric" value={macRam}
                onChange={(e) => setMacRam(e.target.value.replace(/[^0-9]/g, ''))}
                aria-label="Mac 통합메모리 (기가바이트)" />
              <span className={s.miniLabel}>GB RAM → GPU 가용 약 {fmtGB(gpuGb, 0)}GB (75%)</span>
            </span>
          )}
        </div>
        {result && fit && (
          <p className={s.fitLine}>
            필요 {fmtGB(result.totalGB)}GB / 가용 {fmtGB(gpuGb, 0)}GB →{' '}
            <strong className={s[FIT_LABEL[fit].cls]}>
              {fit === 'ok' ? '✅ 여유 있게 구동 가능' : fit === 'tight' ? '⚠️ 빠듯함 — 컨텍스트·KV 축소 권장' : '❌ 초과 — 더 작은 양자화·모델 필요'}
            </strong>
          </p>
        )}

        {/* 양자화별 표 */}
        <div className={s.tableScroll}>
          <table className={s.refTable}>
            <thead>
              <tr>
                <th scope="col">양자화</th>
                <th scope="col">가중치</th>
                <th scope="col">총 필요</th>
                <th scope="col">판정</th>
              </tr>
            </thead>
            <tbody>
              {quantTable.map(({ q, r, fit: f }) => (
                <tr key={q.id} className={q.id === quantId ? s.rowOn : undefined}>
                  <td><strong>{q.id}</strong></td>
                  <td>{fmtGB(r.weightsGB)}GB</td>
                  <td>{fmtGB(r.totalGB)}GB</td>
                  <td>{f ? <span className={s[FIT_LABEL[f].cls]}>{FIT_LABEL[f].text}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.groupNote}>
          총 필요 = 가중치 + KV 캐시({fmtCtx(effCtx)}·{kvInfo.label.split(' ')[0]}) + 오버헤드 {OVERHEAD_GB}GB.
          실효 bpw는 모델별 ±1~2% 편차가 있어(대형 모델은 소폭 과대) &lsquo;약&rsquo;으로 보세요.
        </p>
      </div>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/dev/token-counter', label: 'AI 토큰 카운터' },
          { href: '/tools/dev/tech-stack', label: '기술 스택 추천기' },
          { href: '/tools/unit/converter', label: '단위 변환기' },
        ]}
        sources={[
          { label: 'llama.cpp quantize README (실측 bpw)', href: 'https://github.com/ggml-org/llama.cpp/tree/master/tools/quantize' },
          { label: 'HuggingFace 모델 config.json', href: 'https://huggingface.co' },
        ]}
      >
        가중치·KV 캐시는 llama.cpp 실측 기반 산술값, 오버헤드는 커뮤니티 관행 추정치입니다. 실제 사용량은 런타임(llama.cpp·ollama·vLLM)·드라이버·배치 설정에 따라 달라지므로 1~2GB 여유를 두고 판단하세요.
      </Disclaimer>
    </div>
  )
}
