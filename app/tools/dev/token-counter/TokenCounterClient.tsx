'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './tokenCounter.module.css'
import {
  MODELS, SAMPLES, VENDOR_COLOR, PRICE_CHECKED, MAX_CONTEXT,
  countTokens, koreanRatio, estimateEnglishTokens, priceFor, fmtContext,
} from './tokenCounterData'

const STORAGE_KEY = 'youtil_token_counter_v1'
const BULK_PRESETS = [1, 100, 1_000, 10_000, 100_000]
const OUTPUT_RATIO_PRESETS = [
  { id: 'short',  label: '짧은 답',     ratio: 0.3 },
  { id: 'normal', label: '일반 답',     ratio: 1.0 },
  { id: 'long',   label: '긴 답·문서',  ratio: 2.5 },
]

const fmtUSD = (n: number) => {
  if (n < 0.01) return `$${n.toFixed(5)}`
  if (n < 1) return `$${n.toFixed(4)}`
  if (n < 100) return `$${n.toFixed(2)}`
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
const fmtKRW = (usd: number, rate = 1380) => {
  const krw = usd * rate
  if (krw < 100) return `₩${krw.toFixed(1)}`
  if (krw < 1_000_000) return `₩${Math.round(krw).toLocaleString('ko-KR')}`
  return `₩${Math.round(krw).toLocaleString('ko-KR')}`
}
const fmtTokens = (n: number) => n.toLocaleString('en-US')
const MAX_CALLS = 10_000_000
/* 호출 횟수 입력 문자열 → 숫자 (빈 값은 1회로 계산, 상한 클램프) */
const parseCalls = (s: string) => {
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(n) && n >= 1 ? Math.min(MAX_CALLS, n) : 1
}

export default function TokenCounterClient() {
  const [text, setText] = useState('')
  /* 입력 중에는 빈 칸을 허용하기 위해 문자열로 보관 — 계산할 때만 1 이상으로 클램프 */
  const [bulkInput, setBulkInput] = useState('1')
  const bulkCalls = parseCalls(bulkInput)
  const [outputRatio, setOutputRatio] = useState(1.0)

  // localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j: unknown = JSON.parse(raw)
        const o = (j && typeof j === 'object' ? j : {}) as { text?: unknown; bulkCalls?: unknown; outputRatio?: unknown }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof o.text === 'string') setText(o.text)
        if (typeof o.bulkCalls === 'number' && Number.isFinite(o.bulkCalls) && o.bulkCalls >= 1) {
          setBulkInput(Math.min(MAX_CALLS, Math.floor(o.bulkCalls)).toLocaleString('en-US'))
        }
        const ratio = o.outputRatio
        if (typeof ratio === 'number' && OUTPUT_RATIO_PRESETS.some((p) => p.ratio === ratio)) setOutputRatio(ratio)
      } else {
        setText(SAMPLES[0].text)  // 첫 방문 시 한국어 샘플
      }
    } catch { setText(SAMPLES[0].text) }
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ text, bulkCalls, outputRatio })) } catch {}
  }, [text, bulkCalls, outputRatio])

  // 모델별 토큰 계산 (eff 그룹 단위로 한 번만)
  const counts = useMemo(() => ({
    gpt:    countTokens(text, 'gpt'),
    claude: countTokens(text, 'claude'),
    gemini: countTokens(text, 'gemini'),
  }), [text])

  const gptCount = counts.gpt
  const krRatio = koreanRatio(gptCount.breakdown, gptCount.chars)
  const englishEstimateGpt = estimateEnglishTokens(gptCount.breakdown, 'gpt')

  // 헤로 — GPT-4o 기준으로 표시 (가장 일반적)
  const heroTokens = gptCount.tokens

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/dev/json', label: 'JSON 포맷터' },
          { href: '/tools/dev/regex', label: '정규식 테스트기' },
          { href: '/tools/dev/hash', label: '해시 생성기' },
        ]}
      >
        토큰 수는 문자 분류 기반 휴리스틱 추정치입니다 — 실제 토크나이저와 ±10~20% 차이날 수 있어요. 정확한 청구 비용은 각 공급사 콘솔에서 확인하세요. 가격은 {PRICE_CHECKED}에 점검한 각 사 공개 표준 단가(대표 모델 일부)이며, 새 모델 출시·가격 변경이 잦으니 결제 전 공식 가격표를 확인하세요.
      </Disclaimer>

      {/* 입력 영역 */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <label htmlFor="tc-text" className={s.cardLabel}>프롬프트 / 텍스트 입력</label>
          <div className={s.sampleRow}>
            {SAMPLES.map((sm) => (
              <button key={sm.id} type="button" className={s.sampleBtn} onClick={() => setText(sm.text)}>
                {sm.label}
              </button>
            ))}
            <button type="button" className={`${s.sampleBtn} ${s.clearBtn}`} onClick={() => setText('')}>
              비우기
            </button>
          </div>
        </div>
        <textarea
          id="tc-text"
          className={s.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 프롬프트나 문서를 붙여넣으세요…"
          rows={10}
          spellCheck={false}
        />
        <div className={s.metaRow}>
          <span><strong>{gptCount.chars.toLocaleString()}</strong>자</span>
          <span className={s.dot}>·</span>
          <span>한글 <strong>{gptCount.breakdown.hangul.toLocaleString()}</strong></span>
          <span className={s.dot}>·</span>
          <span>영문 <strong>{gptCount.breakdown.latin.toLocaleString()}</strong></span>
          <span className={s.dot}>·</span>
          <span>숫자 <strong>{gptCount.breakdown.digit.toLocaleString()}</strong></span>
          <span className={s.dot}>·</span>
          <span>공백 <strong>{gptCount.breakdown.ws.toLocaleString()}</strong></span>
        </div>
      </div>

      {/* 히어로 */}
      <div className={s.hero} role="status">
        <div className={s.heroLabel}>예상 토큰 수 (GPT-4o 기준)</div>
        <div className={s.heroNum}>{fmtTokens(heroTokens)}</div>
        <div className={s.heroSub}>
          GPT <strong>{fmtTokens(counts.gpt.tokens)}</strong>
          {' · '}Claude <strong>{fmtTokens(counts.claude.tokens)}</strong>
          {' · '}Gemini <strong>{fmtTokens(counts.gemini.tokens)}</strong>
        </div>
      </div>

      {/* 한국어 효율 인사이트 */}
      {krRatio > 0.25 && gptCount.chars > 20 && (
        <div className={s.insightCard}>
          <strong>한국어 효율 인사이트</strong>
          <p>
            이 텍스트의 <strong>{Math.round(krRatio * 100)}%</strong>가 한국어/CJK 문자입니다. 영문으로 같은 내용을 작성하면 GPT-4o 기준 약{' '}
            <strong className={s.savingAmt}>{fmtTokens(englishEstimateGpt)}</strong> 토큰으로 줄어들 수 있어요{' '}
            (<strong className={s.savingPct}>−{Math.max(0, Math.round((1 - englishEstimateGpt / Math.max(1, counts.gpt.tokens)) * 100))}%</strong>).
            Claude는 한국어 비효율이 가장 크므로 비용 민감 작업은 영문 프롬프트가 유리합니다.
          </p>
        </div>
      )}

      {/* 출력 길이 + 호출 횟수 */}
      <div className={s.card}>
        <span className={s.cardLabel}>비용 계산 옵션</span>
        <div className={s.optRow}>
          <div className={s.optBlock}>
            <span className={s.optLabel} id="tc-ratio-label">예상 출력 길이</span>
            <div className={s.toggleRow} role="group" aria-labelledby="tc-ratio-label">
              {OUTPUT_RATIO_PRESETS.map((p) => (
                <button key={p.id} type="button"
                  aria-pressed={outputRatio === p.ratio}
                  className={`${s.toggleBtn} ${outputRatio === p.ratio ? s.toggleActive : ''}`}
                  onClick={() => setOutputRatio(p.ratio)}>
                  <span>{p.label}</span>
                  <small>×{p.ratio}</small>
                </button>
              ))}
            </div>
            <p className={s.optHint}>입력 토큰 기준 배수 — 출력이 입력의 {outputRatio}배라고 가정</p>
          </div>
          <div className={s.optBlock}>
            <label htmlFor="tc-bulk" className={s.optLabel}>API 호출 횟수</label>
            <div className={s.toggleRow}>
              {BULK_PRESETS.map((n) => (
                <button key={n} type="button"
                  aria-pressed={bulkCalls === n}
                  className={`${s.toggleBtn} ${bulkCalls === n ? s.toggleActive : ''}`}
                  onClick={() => setBulkInput(n.toLocaleString('en-US'))}>
                  {n.toLocaleString()}회
                </button>
              ))}
            </div>
            <input
              id="tc-bulk"
              type="text" inputMode="numeric" autoComplete="off"
              className={s.bulkInput}
              value={bulkInput}
              placeholder="1"
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '').slice(0, 8)
                const n = digits ? Math.min(MAX_CALLS, parseInt(digits, 10)) : 0
                setBulkInput(digits ? n.toLocaleString('en-US') : '')
              }}
            />
          </div>
        </div>
      </div>

      {/* 모델별 비교 */}
      <div className={s.card}>
        <span className={s.cardLabel}>
          모델별 비교
          <span className={s.cardHint}>{bulkCalls.toLocaleString()}회 호출 × 출력 ×{outputRatio} 가정</span>
        </span>
        <div className={s.modelGrid}>
          {MODELS.map((m) => {
            const cnt = counts[m.efficiency]
            const inputTokens = cnt.tokens
            const outputTokens = Math.ceil(inputTokens * outputRatio)
            const ctxUsed = inputTokens / m.contextWindow
            const price = priceFor(m, inputTokens)
            const inputCost = (inputTokens / 1_000_000) * price.input * bulkCalls
            const outputCost = (outputTokens / 1_000_000) * price.output * bulkCalls
            const total = inputCost + outputCost
            return (
              <div key={m.id} className={s.modelCard} style={{ borderTopColor: VENDOR_COLOR[m.vendor] }}>
                <div className={s.modelHead}>
                  <div>
                    <span className={s.vendorTag} style={{ color: VENDOR_COLOR[m.vendor] }}>{m.vendorLabel}</span>
                    <div className={s.modelName}>{m.name}</div>
                  </div>
                  {m.badge && <span className={s.badge}>{m.badge}</span>}
                </div>

                <div className={s.tokenRow}>
                  <span className={s.tokenLabel}>이 텍스트</span>
                  <strong className={s.tokenVal}>{fmtTokens(inputTokens)}</strong>
                </div>

                <div className={s.ctxBar}>
                  <div className={s.ctxBarTrack}>
                    <div className={s.ctxBarFill}
                      style={{
                        width: `${Math.min(100, ctxUsed * 100)}%`,
                        background: ctxUsed > 0.9 ? 'var(--red-600)' : ctxUsed > 0.5 ? 'var(--amber-600)' : VENDOR_COLOR[m.vendor],
                      }} />
                  </div>
                  <div className={s.ctxLabel}>
                    컨텍스트 {(ctxUsed * 100).toFixed(ctxUsed < 0.01 ? 4 : 2)}% · 한도 {fmtContext(m.contextWindow)}
                  </div>
                </div>

                <div className={s.priceBlock}>
                  <div className={s.priceRow}>
                    <span>입력 {fmtUSD(price.input)}/M</span>
                    <strong>{fmtUSD(inputCost)}</strong>
                  </div>
                  <div className={s.priceRow}>
                    <span>출력 {fmtUSD(price.output)}/M</span>
                    <strong>{fmtUSD(outputCost)}</strong>
                  </div>
                  <div className={`${s.priceRow} ${s.priceTotal}`}>
                    <span>합계</span>
                    <strong>
                      {fmtUSD(total)}
                      <small className={s.krwHint}>≈ {fmtKRW(total)}</small>
                    </strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 컨텍스트 윈도우 한눈에 */}
      <div className={s.card}>
        <span className={s.cardLabel}>컨텍스트 윈도우 한눈에</span>
        <div className={s.ctxTable}>
          {MODELS.map((m) => (
            <div key={m.id} className={s.ctxRow}>
              <span className={s.ctxName}>
                <span className={s.vendorDot} style={{ background: VENDOR_COLOR[m.vendor] }} />
                {m.name}
              </span>
              <span className={s.ctxMeter}>
                <span className={s.ctxMeterTrack}>
                  <span
                    className={s.ctxMeterFill}
                    style={{
                      width: `${Math.min(100, (m.contextWindow / MAX_CONTEXT) * 100)}%`,
                      background: VENDOR_COLOR[m.vendor],
                    }}
                  />
                </span>
              </span>
              <span className={s.ctxNum}>{fmtContext(m.contextWindow)}</span>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⓘ 위 그래프는 가장 긴 한도({fmtContext(MAX_CONTEXT)}) 기준 상대 길이. <strong>1K 토큰 ≈ 영문 약 750단어 / 한국어 약 650자(Claude)~1,000자(GPT·Gemini)</strong> — 이 도구 가중치로 본 추정.
        </p>
      </div>
    </div>
  )
}
