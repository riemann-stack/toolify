'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './tokenCounter.module.css'
import {
  MODELS, SAMPLES, VENDOR_COLOR,
  countTokens, koreanRatio, estimateEnglishTokens,
  type Vendor,
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

export default function TokenCounterClient() {
  const [text, setText] = useState('')
  const [bulkCalls, setBulkCalls] = useState(1)
  const [outputRatio, setOutputRatio] = useState(1.0)

  // localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j = JSON.parse(raw)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof j.text === 'string') setText(j.text)
        if (typeof j.bulkCalls === 'number') setBulkCalls(j.bulkCalls)
        if (typeof j.outputRatio === 'number') setOutputRatio(j.outputRatio)
      } else {
        setText(SAMPLES[0].text)  // 첫 방문 시 한국어 샘플
      }
    } catch { setText(SAMPLES[0].text) }
  }, [])
  useEffect(() => {
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
        토큰 수는 문자 분류 기반 휴리스틱 추정치입니다 — 실제 토크나이저와 ±10~20% 차이날 수 있어요. 정확한 청구 비용은 각 공급사 콘솔에서 확인하세요. 가격은 2026년 5월 기준 참고치이며 변동 가능.
      </Disclaimer>

      {/* 입력 영역 */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <span className={s.cardLabel}>프롬프트 / 텍스트 입력</span>
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
      <div className={s.hero}>
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
          <strong>🇰🇷 한국어 효율 인사이트</strong>
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
            <label className={s.optLabel}>예상 출력 길이</label>
            <div className={s.toggleRow}>
              {OUTPUT_RATIO_PRESETS.map((p) => (
                <button key={p.id}
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
            <label className={s.optLabel}>API 호출 횟수</label>
            <div className={s.toggleRow}>
              {BULK_PRESETS.map((n) => (
                <button key={n}
                  className={`${s.toggleBtn} ${bulkCalls === n ? s.toggleActive : ''}`}
                  onClick={() => setBulkCalls(n)}>
                  {n.toLocaleString()}회
                </button>
              ))}
            </div>
            <input
              type="number" min={1} max={10_000_000} step={1}
              className={s.bulkInput}
              value={bulkCalls}
              onChange={(e) => setBulkCalls(Math.max(1, Math.min(10_000_000, parseInt(e.target.value) || 1)))}
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
            const inputCost = (inputTokens / 1_000_000) * m.inputPricePerM * bulkCalls
            const outputCost = (outputTokens / 1_000_000) * m.outputPricePerM * bulkCalls
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
                        background: ctxUsed > 0.9 ? '#DC2626' : ctxUsed > 0.5 ? '#D97706' : VENDOR_COLOR[m.vendor],
                      }} />
                  </div>
                  <div className={s.ctxLabel}>
                    컨텍스트 {(ctxUsed * 100).toFixed(ctxUsed < 0.01 ? 4 : 2)}% · 한도 {(m.contextWindow / 1000).toLocaleString()}K
                  </div>
                </div>

                <div className={s.priceBlock}>
                  <div className={s.priceRow}>
                    <span>입력 {fmtUSD(m.inputPricePerM)}/M</span>
                    <strong>{fmtUSD(inputCost)}</strong>
                  </div>
                  <div className={s.priceRow}>
                    <span>출력 {fmtUSD(m.outputPricePerM)}/M</span>
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
                      width: `${Math.min(100, (m.contextWindow / 2_000_000) * 100)}%`,
                      background: VENDOR_COLOR[m.vendor],
                    }}
                  />
                </span>
              </span>
              <span className={s.ctxNum}>{(m.contextWindow / 1000).toLocaleString()}K</span>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⓘ 위 그래프는 2M 토큰 기준 상대 길이. <strong>1K = 약 750단어 영문 / 약 400자 한국어</strong> (추정).
        </p>
      </div>
    </div>
  )
}
