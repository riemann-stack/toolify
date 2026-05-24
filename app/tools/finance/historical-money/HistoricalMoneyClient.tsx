'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './historicalMoney.module.css'
import {
  ERAS, REFORMS, PRICE_ITEMS,
  YEAR_MIN, YEAR_MAX,
  eraFromYear, convert, fmtRaw, fmtMoney, fmtCompact,
} from './historicalMoneyData'

const CURRENT_YEAR = YEAR_MAX
const STORAGE_KEY = 'youtil_hist_money_v1'

type Direction = 'past_to_now' | 'now_to_past'

const PRESET_YEARS = [1950, 1960, 1970, 1980, 1990]
const PRESET_AMOUNTS = [1000, 10000, 100000, 1000000, 10000000]

export default function HistoricalMoneyClient() {
  const [direction, setDirection] = useState<Direction>('past_to_now')
  const [pastYear, setPastYear] = useState(1970)
  const [amount, setAmount] = useState('10000')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.direction) setDirection(j.direction)
      if (typeof j.pastYear === 'number') setPastYear(j.pastYear)
      if (typeof j.amount === 'string') setAmount(j.amount)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ direction, pastYear, amount })) } catch {}
  }, [direction, pastYear, amount])

  const amt = parseFloat(amount) || 0
  const valid = amt > 0
  const pastEra = eraFromYear(pastYear)
  const currentEra = eraFromYear(CURRENT_YEAR)

  // 결과 계산
  const result = useMemo(() => {
    if (!valid) return null
    if (direction === 'past_to_now') {
      return convert(amt, pastYear, CURRENT_YEAR)
    } else {
      return convert(amt, CURRENT_YEAR, pastYear)
    }
  }, [valid, amt, pastYear, direction])

  // 5년 단위 그래프 데이터 (입력 금액의 시대별 가치)
  const decadeSeries = useMemo(() => {
    if (!valid) return []
    const points: { year: number; value: number; era: string }[] = []
    const startYear = direction === 'past_to_now' ? pastYear : CURRENT_YEAR
    const endYear = direction === 'past_to_now' ? CURRENT_YEAR : pastYear
    const lo = Math.min(startYear, endYear)
    const hi = Math.max(startYear, endYear)
    for (let y = Math.ceil(lo / 5) * 5; y <= hi; y += 5) {
      const r = convert(amt, startYear, y)
      points.push({ year: y, value: r.outputAmount, era: r.outputEra.symbol })
    }
    if (points.length === 0 || points[points.length - 1].year !== hi) {
      const r = convert(amt, startYear, hi)
      points.push({ year: hi, value: r.outputAmount, era: r.outputEra.symbol })
    }
    return points
  }, [valid, amt, pastYear, direction])

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/compound', label: '복리 계산기' },
          { href: '/tools/finance/salary',   label: '연봉 실수령액' },
          { href: '/tools/finance/savings',  label: '저축액 계산기' },
        ]}
        sources={[
          { label: '통계청 KOSIS', href: 'https://kosis.kr' },
          { label: '한국은행 경제통계시스템', href: 'https://ecos.bok.or.kr' },
        ]}
      >
        구매력 환산은 통계청 KOSIS 소비자물가지수(2020=100) 기반 <strong>추정치</strong>입니다. 1965년 이전은 한국은행·역사 자료 기반 추정이라 오차가 클 수 있으며, 품목별 인플레이션(식료품·집값·임금)은 평균과 다를 수 있습니다. 화폐개혁 환산(100圓=1환, 10환=1원)만 정확합니다.
      </Disclaimer>

      {/* 방향 토글 */}
      <div className={s.card}>
        <span className={s.cardLabel}>변환 방향</span>
        <div className={s.dirRow}>
          <button
            type="button"
            className={`${s.dirBtn} ${direction === 'past_to_now' ? s.dirBtnActive : ''}`}
            onClick={() => setDirection('past_to_now')}
          >📅 과거 → 현재</button>
          <button
            type="button"
            className={`${s.dirBtn} ${direction === 'now_to_past' ? s.dirBtnActive : ''}`}
            onClick={() => setDirection('now_to_past')}
          >🕰️ 현재 → 과거</button>
        </div>
      </div>

      {/* 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>
          {direction === 'past_to_now' ? '1. 과거 시점·금액' : '1. 비교할 과거 연도 + 현재 금액'}
        </span>
        <div className={s.inputGrid}>
          <div className={s.inputField}>
            <label className={s.fieldLabel}>
              {direction === 'past_to_now' ? '과거 연도' : '비교할 과거 연도'}
              <span className={s.fieldHint}>{pastEra.label} ({pastEra.startYear}~{pastEra.endYear === 2100 ? '' : pastEra.endYear})</span>
            </label>
            <input
              type="range"
              min={YEAR_MIN}
              max={YEAR_MAX - 1}
              step={1}
              value={pastYear}
              onChange={(e) => setPastYear(+e.target.value)}
              className={s.slider}
            />
            <div className={s.sliderHead}>
              <input
                type="number"
                min={YEAR_MIN}
                max={YEAR_MAX - 1}
                value={pastYear}
                onChange={(e) => setPastYear(Math.max(YEAR_MIN, Math.min(YEAR_MAX - 1, +e.target.value || 1970)))}
                className={s.yearInput}
              />
              <span>년</span>
            </div>
            <div className={s.presetRow}>
              {PRESET_YEARS.map((y) => (
                <button key={y} type="button"
                  className={`${s.presetBtn} ${pastYear === y ? s.presetBtnActive : ''}`}
                  onClick={() => setPastYear(y)}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className={s.inputField}>
            <label className={s.fieldLabel}>
              금액
              <span className={s.fieldHint}>
                단위: {direction === 'past_to_now' ? pastEra.symbol : currentEra.symbol}
              </span>
            </label>
            <div className={s.amountRow}>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className={s.amountInput}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className={s.amountUnit}>
                {direction === 'past_to_now' ? pastEra.symbol : currentEra.symbol}
              </span>
            </div>
            <div className={s.presetRow}>
              {PRESET_AMOUNTS.map((v) => (
                <button key={v} type="button"
                  className={`${s.presetBtn} ${amt === v ? s.presetBtnActive : ''}`}
                  onClick={() => setAmount(String(v))}>
                  {fmtCompact(v)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 결과 */}
      {result && valid && (
        <div className={s.hero}>
          <div className={s.heroIn}>
            <div className={s.heroLabel}>{direction === 'past_to_now' ? '입력 금액' : '현재 금액'}</div>
            <div className={s.heroSmall}>
              {fmtRaw(amt)}{' '}<strong>{direction === 'past_to_now' ? pastEra.symbol : currentEra.symbol}</strong>
              <small>({direction === 'past_to_now' ? pastYear : CURRENT_YEAR}년 {direction === 'past_to_now' ? pastEra.label.split(' ')[0] : '원'})</small>
            </div>
          </div>
          <div className={s.heroArrow}>≈</div>
          <div className={s.heroOut}>
            <div className={s.heroLabel}>{direction === 'past_to_now' ? `${CURRENT_YEAR}년 현재 가치` : `${pastYear}년 당시 가치`}</div>
            <div className={s.heroBig}>
              {fmtMoney(result.outputAmount)}
              <span className={s.heroUnit}>{result.outputEra.symbol}</span>
            </div>
            {direction === 'past_to_now' && result.inflationFactor > 1 && (
              <div className={s.heroNote}>
                누적 인플레 <strong className={s.factorAccent}>×{result.inflationFactor.toFixed(0)}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 시대별 가치 시계열 */}
      {result && valid && decadeSeries.length > 1 && (
        <div className={s.card}>
          <span className={s.cardLabel}>
            5년 단위 가치 변화
            <span className={s.cardHint}>입력 금액의 시점별 환산 가치</span>
          </span>
          <div className={s.timelineWrap}>
            {decadeSeries.map((p) => {
              const max = Math.max(...decadeSeries.map((x) => x.value))
              const pct = (p.value / max) * 100
              return (
                <div key={p.year} className={s.tlRow}>
                  <span className={s.tlYear}>{p.year}년</span>
                  <span className={s.tlBarTrack}>
                    <span className={s.tlBarFill} style={{ width: `${Math.max(2, pct)}%` }} />
                  </span>
                  <span className={s.tlVal}>{fmtMoney(p.value)}<small>{p.era}</small></span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 시대별 가격 비교 */}
      <div className={s.card}>
        <span className={s.cardLabel}>
          시대별 가격 비교 — 같은 금액의 체감 변화
          <span className={s.cardHint}>현재 가치(₩) 자동 환산</span>
        </span>
        <div className={s.priceGrid}>
          {PRICE_ITEMS.map((item) => {
            const years = Object.keys(item.prices).map(Number).sort((a, b) => a - b)
            const firstYear = years[0]
            const lastYear = years[years.length - 1]
            const firstPrice = item.prices[firstYear]
            const lastPrice = item.prices[lastYear]
            const firstEra = eraFromYear(firstYear)
            // 첫 가격을 현재 가치로 환산
            const firstNowValue = convert(firstPrice, firstYear, CURRENT_YEAR).outputAmount
            const realChange = lastPrice / firstNowValue   // 1보다 크면 실질가격 상승, 작으면 하락
            return (
              <div key={item.name} className={s.priceCard}>
                <div className={s.priceHead}>
                  <span className={s.priceEmoji}>{item.emoji}</span>
                  <span className={s.priceName}>{item.name}</span>
                </div>
                <div className={s.priceRow}>
                  <div>
                    <div className={s.priceYear}>{firstYear}년</div>
                    <div className={s.priceVal}>{fmtRaw(firstPrice)}<small>{firstEra.symbol}</small></div>
                    <div className={s.priceConv}>≈ 현재 {fmtMoney(firstNowValue)}원</div>
                  </div>
                  <span className={s.priceArrow}>→</span>
                  <div>
                    <div className={s.priceYear}>{lastYear}년</div>
                    <div className={s.priceVal}>{fmtRaw(lastPrice)}<small>원</small></div>
                    <div className={s.priceConv} style={{ color: realChange > 1.5 ? '#DC2626' : realChange < 0.7 ? '#059669' : 'var(--muted)' }}>
                      실질 {realChange > 1 ? '+' : ''}{((realChange - 1) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                {item.note && <div className={s.priceNote}>{item.note}</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* 화폐개혁 타임라인 */}
      <div className={s.card}>
        <span className={s.cardLabel}>한국 화폐개혁 연표</span>
        <div className={s.timeline}>
          <div className={s.eraBand}>
            {ERAS.map((era) => (
              <div key={era.id} className={`${s.eraBox} ${s['era_' + era.id]}`}>
                <div className={s.eraLabel}>{era.label}</div>
                <div className={s.eraYears}>
                  {era.startYear}~{era.endYear === 2100 ? '현재' : era.endYear}
                </div>
              </div>
            ))}
          </div>
          <div className={s.reformList}>
            {REFORMS.map((r) => (
              <div key={r.date} className={s.reformItem}>
                <div className={s.reformDate}>{r.date}</div>
                <div className={s.reformBody}>
                  <div className={s.reformTitle}>
                    <strong>{r.title}</strong>
                    <span className={s.reformRatio}>{r.from} → {r.to}</span>
                  </div>
                  <p className={s.reformDesc}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
