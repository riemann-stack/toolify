'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './brewing.module.css'
import {
  SCALES, CATEGORY_GUIDES, PH_GUIDE,
  convertAll, abvSimple, abvCorrected, abvFromBrix,
  abvToUsProof, usProofToAbv, abvToUkProof,
  brixToSg,
  type Scale,
} from './brewingData'

const STORAGE_KEY = 'youtil_brewing_v1'

const SCALE_PRESETS: { label: string; scale: Scale; value: number }[] = [
  { label: '와인 머스트 23 Brix',  scale: 'brix',    value: 23 },
  { label: '비어 워트 1.050 SG',  scale: 'sg',      value: 1.050 },
  { label: '잼 65 Brix',          scale: 'brix',    value: 65 },
  { label: '독일 Kabinett 73°Oe', scale: 'oechsle', value: 73 },
  { label: '와인 13°Bé',          scale: 'baume',   value: 13 },
]

export default function BrewingClient() {
  const [scale, setScale] = useState<Scale>('brix')
  const [input, setInput] = useState('23')

  // ABV calculator state (SG 입력)
  const [ogSg, setOgSg] = useState('1.060')
  const [fgSg, setFgSg] = useState('1.010')
  const [proofMode, setProofMode] = useState<'us' | 'uk'>('us')
  const [abvInput, setAbvInput] = useState('40')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (j.scale) setScale(j.scale)
      if (typeof j.input === 'string') setInput(j.input)
      if (typeof j.ogSg === 'string') setOgSg(j.ogSg)
      if (typeof j.fgSg === 'string') setFgSg(j.fgSg)
      if (typeof j.abvInput === 'string') setAbvInput(j.abvInput)
      if (j.proofMode) setProofMode(j.proofMode)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale, input, ogSg, fgSg, abvInput, proofMode })) } catch {}
  }, [scale, input, ogSg, fgSg, abvInput, proofMode])

  const value = parseFloat(input) || 0
  const valid = value > 0
  const result = useMemo(() => valid ? convertAll(scale, value) : null, [scale, value, valid])

  const og = parseFloat(ogSg) || 0
  const fg = parseFloat(fgSg) || 0
  const abvValid = og > fg && og >= 1.0 && fg >= 0.98
  const abvSimpleVal = abvValid ? abvSimple(og, fg) : 0
  const abvCorrectedVal = abvValid ? abvCorrected(og, fg) : 0

  // 와인 머스트 Brix → 예상 ABV
  const brixForWine = result?.brix ?? 0
  const wineAbv = brixForWine > 0 ? abvFromBrix(brixForWine) : { low: 0, high: 0 }

  const abvNum = parseFloat(abvInput) || 0
  const proofVal = proofMode === 'us' ? abvToUsProof(abvNum) : abvToUkProof(abvNum)

  const fmt = (n: number, scaleId: Scale): string => {
    if (!isFinite(n)) return '—'
    if (scaleId === 'sg') return n.toFixed(4)
    if (scaleId === 'oechsle') return n.toFixed(1)
    return n.toFixed(2)
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/unit/hardness',  label: '경도 변환기' },
          { href: '/tools/unit/viscosity', label: '점도 변환기' },
          { href: '/tools/cooking/sourdough', label: '사워도우 스타터' },
        ]}
      >
        환산식은 ASBC·OIV 표준 다항식 기반 추정치(±0.1°). 굴절계는 25°C 기준이라 다른 온도에서는 보정 필요. ABV 공식은 일반 양조용 — 상업 도수 표기는 증류·블렌딩 후 실측이 우선입니다.
      </Disclaimer>

      {/* 스케일 선택 */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 입력 스케일</span>
        <div className={s.scaleGrid}>
          {SCALES.map((sc) => (
            <button key={sc.id} type="button"
              className={`${s.scaleBtn} ${scale === sc.id ? s.scaleBtnActive : ''}`}
              onClick={() => setScale(sc.id)}>
              <span className={s.scaleName}>{sc.name}</span>
              <span className={s.scaleUnit}>{sc.unit || '비중'}</span>
            </button>
          ))}
        </div>
        <p className={s.scaleDesc}>
          <strong className={s.accent}>{SCALES.find(x => x.id === scale)?.fullName}</strong> — {SCALES.find(x => x.id === scale)?.desc}
        </p>
      </div>

      {/* 값 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>2. 값 입력</span>
        <div className={s.inputRow}>
          <input
            type="number"
            inputMode="decimal"
            step={scale === 'sg' ? 0.001 : scale === 'oechsle' ? 1 : 0.1}
            min={0}
            className={s.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <span className={s.unit}>
            {SCALES.find(x => x.id === scale)?.unit || 'SG'}
          </span>
        </div>
        <div className={s.presetRow}>
          {SCALE_PRESETS.map((p, i) => (
            <button key={i} type="button"
              className={s.presetBtn}
              onClick={() => { setScale(p.scale); setInput(String(p.value)) }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 5종 */}
      {result && (
        <div className={s.resultGrid}>
          {SCALES.map((sc) => {
            const v = result[sc.id]
            const isInput = sc.id === scale
            return (
              <div key={sc.id} className={`${s.resCard} ${isInput ? s.resCardInput : ''}`}>
                <div className={s.resHead}>
                  <span className={s.resName}>{sc.name}</span>
                  {isInput && <span className={s.inputTag}>입력</span>}
                </div>
                <div className={s.resValue}>{fmt(v, sc.id)}</div>
                <div className={s.resUnit}>{sc.unit || 'SG'}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* 와인 예상 ABV (Brix 기준) */}
      {result && result.brix > 8 && result.brix < 30 && (
        <div className={s.tipCard}>
          <strong>🍷 와인 머스트 예상 ABV</strong>
          <p>
            현재 <strong>{result.brix.toFixed(1)} °Bx</strong>로 발효하면 (FG ≈ 0.992 가정){' '}
            <strong className={s.accentVal}>{wineAbv.low.toFixed(1)} ~ {wineAbv.high.toFixed(1)} % ABV</strong>{' '}
            예상.
            효모 종류·잔당·온도에 따라 ±1% 차이. 정확한 값은 발효 후 OG·FG로 계산하세요.
          </p>
        </div>
      )}

      {/* ABV 계산기 — OG·FG */}
      <div className={s.card}>
        <span className={s.cardLabel}>3. 발효 ABV 계산 (OG·FG)</span>
        <div className={s.row2}>
          <div className={s.inputField}>
            <label className={s.fieldLabel} htmlFor="brewing-og-sg">OG (발효 전 SG)</label>
            <input id="brewing-og-sg"
              type="number" inputMode="decimal" step={0.001} min={0.99} max={1.20}
              className={s.input}
              value={ogSg}
              onChange={(e) => setOgSg(e.target.value)}
            />
            {parseFloat(ogSg) > 1 && (
              <p className={s.miniHint}>≈ {((og - 1) * 1000).toFixed(0)} °Oe · {((182.4601 * og - 775.6821) * og + 1262.7794) * og - 669.5622 | 0} °Bx 부근</p>
            )}
          </div>
          <div className={s.inputField}>
            <label className={s.fieldLabel} htmlFor="brewing-fg-sg">FG (발효 후 SG)</label>
            <input id="brewing-fg-sg"
              type="number" inputMode="decimal" step={0.001} min={0.98} max={1.10}
              className={s.input}
              value={fgSg}
              onChange={(e) => setFgSg(e.target.value)}
            />
            <p className={s.miniHint}>비어 보통 1.008~1.018 · 와인 0.990~0.998</p>
          </div>
        </div>
        {abvValid ? (
          <div className={s.abvResult}>
            <div className={s.abvBlock}>
              <span className={s.abvLabel}>단순 공식</span>
              <strong className={s.abvValue}>{abvSimpleVal.toFixed(2)}<small>% ABV</small></strong>
              <span className={s.abvSub}>(OG − FG) × 131.25</span>
            </div>
            <div className={s.abvBlock}>
              <span className={s.abvLabel}>보정 공식 (고알코올 정확)</span>
              <strong className={s.abvValue}>{abvCorrectedVal.toFixed(2)}<small>% ABV</small></strong>
              <span className={s.abvSub}>고알코올 와인·증류 권장</span>
            </div>
          </div>
        ) : (
          <p className={s.warn}>OG는 FG보다 크고 1.000 이상이어야 합니다.</p>
        )}
      </div>

      {/* ABV ↔ Proof */}
      <div className={s.card}>
        <span className={s.cardLabel}>4. ABV ↔ Proof</span>
        <div className={s.row2}>
          <div className={s.inputField}>
            <label className={s.fieldLabel} htmlFor="brewing-abv">ABV (%)</label>
            <input id="brewing-abv"
              type="number" inputMode="decimal" step={0.1} min={0} max={100}
              className={s.input}
              value={abvInput}
              onChange={(e) => setAbvInput(e.target.value)}
            />
          </div>
          <div className={s.inputField}>
            <label className={s.fieldLabel}>Proof 단위</label>
            <div className={s.proofToggle}>
              <button type="button"
                className={`${s.proofBtn} ${proofMode === 'us' ? s.proofBtnActive : ''}`}
                onClick={() => setProofMode('us')}>
                US Proof <small>×2</small>
              </button>
              <button type="button"
                className={`${s.proofBtn} ${proofMode === 'uk' ? s.proofBtnActive : ''}`}
                onClick={() => setProofMode('uk')}>
                UK Proof <small>÷0.5715</small>
              </button>
            </div>
          </div>
        </div>
        <div className={s.proofResult}>
          <strong>{abvNum.toFixed(1)}% ABV</strong>
          <span className={s.proofArrow}>=</span>
          <strong className={s.accentVal}>{proofVal.toFixed(1)}° {proofMode === 'us' ? 'US' : 'UK'} Proof</strong>
        </div>
        <p className={s.note}>
          US Proof는 ABV × 2 (간편). UK Proof는 1816년 기준으로 100° = 57.15% ABV — 현재 거의 사용 안 함 (참고용).
        </p>
      </div>

      {/* 카테고리별 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>5. 카테고리별 권장 범위</span>
        <div className={s.guideList}>
          {CATEGORY_GUIDES.map((g) => {
            const sgIn = (parseFloat(ogSg) || 0) > 0 ? parseFloat(ogSg) : (result?.sg ?? 1)
            const inRange = sgIn >= g.ogRangeSG[0] && sgIn <= g.ogRangeSG[1]
            return (
              <div key={g.name} className={`${s.guideCard} ${inRange ? s.guideCardMatch : ''}`}>
                <div className={s.guideHead}>
                  <span className={s.guideEmoji}>{g.emoji}</span>
                  <strong className={s.guideName}>{g.name}</strong>
                  {inRange && <span className={s.matchBadge}>현재 범위</span>}
                </div>
                <div className={s.guideSpecs}>
                  <span><b>SG</b> {g.ogRangeSG[0].toFixed(3)} ~ {g.ogRangeSG[1].toFixed(3)}</span>
                  {g.brix && <span><b>Brix</b> {g.brix[0]}~{g.brix[1]}°</span>}
                  {g.abv && <span><b>ABV</b> {g.abv[0]}~{g.abv[1]}%</span>}
                  {g.ph && <span><b>pH</b> {g.ph[0]}~{g.ph[1]}</span>}
                  {g.ta && <span><b>TA</b> {g.ta}</span>}
                </div>
                {g.note && <p className={s.guideNote}>{g.note}</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* pH 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>🧪 pH 측정 참고 — TA(산도)는 별도 측정 필요</span>
        <div className={s.phList}>
          {PH_GUIDE.map((p, i) => (
            <div key={i} className={s.phRow}>
              <span className={s.phRange}>{p.range}</span>
              <span className={s.phLabel}>{p.label}</span>
              <span className={s.phNote}>{p.note}</span>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⚠️ pH(로그 스케일)와 <strong>TA(Titratable Acidity, 산도 적정)</strong>는 별개의 측정량입니다. 와인·치즈는 두 값을 모두 측정해야 발효 진행도를 정확히 알 수 있어요. 직접 변환은 불가.
        </p>
      </div>
    </div>
  )
}
