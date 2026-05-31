'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import styles from './gold-converter.module.css'
import {
  type WeightUnit, type PriceInputs, type AssetItem,
  UNITS, KARATS, SCENARIOS,
  toGram, fromGram, pureGoldGram, convertKarat,
  calculatePrice, koreaPremium, buildPriceTable,
  nextAssetId,
  fmtKRW, fmtKRWFull,
} from './goldUtils'

type TabKey = 'convert' | 'price' | 'guide'
const STORAGE_KEY = 'youtil:gold:v1'

interface StoredState {
  weight: number
  unit: WeightUnit
  karat: string
  price: PriceInputs
  assets: AssetItem[]
}

const DEFAULT_PRICE: PriceInputs = {
  pricePerGram24k: 145_000,
  vatIncluded: false,
  spreadPercent: 7,
  feePercent: 1,
  craftFee: 0,
  usdKrw: 1_350,
  internationalOzUsd: 3_300,
}

const TABS = [
  { k: 'convert', l: '⚖️ 단위·순도' },
  { k: 'price',   l: '💰 가격 계산' },
  { k: 'guide',   l: '📚 가이드' },
] as const

const SPREAD_PRESETS = [3, 5, 7, 10]

export default function GoldConverterClient() {
  const [tab, setTab] = useState<TabKey>('convert')
  const [weight, setWeight] = useState(1)
  const [unit, setUnit] = useState<WeightUnit>('don')
  const [karat, setKarat] = useState('24k')
  const [price, setPrice] = useState<PriceInputs>(DEFAULT_PRICE)
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [mounted, setMounted] = useState(false)

  /* localStorage 복원 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw) as Partial<StoredState>
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (typeof s.weight === 'number') setWeight(s.weight)
        if (s.unit) setUnit(s.unit)
        if (s.karat) setKarat(s.karat)
        if (s.price) setPrice({ ...DEFAULT_PRICE, ...s.price })
        if (Array.isArray(s.assets)) setAssets(s.assets)
      }
    } catch { /* ignore */ }
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ weight, unit, karat, price, assets }))
    } catch { /* ignore */ }
  }, [weight, unit, karat, price, assets, mounted])

  /* 입력 → g 환산 */
  const grams = useMemo(() => toGram(weight, unit), [weight, unit])

  return (
    <div className={styles.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/vat',      label: '부가세 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' },
          { href: '/tools/unit/converter',   label: '단위 변환기' },
        ]}
        sources={[
          { label: '한국거래소 KRX 금시장', href: 'https://www.krx.co.kr' },
          { label: '한국금거래소', href: 'https://www.koreagoldx.co.kr' },
        ]}
      >
        금 시세는 사용자 직접 입력이며 외부 API 의존 X (실시세는 <a href="https://www.koreagoldx.co.kr" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>한국금거래소</a>·<a href="https://www.komsco.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>한국조폐공사</a>·은행 확인). 부가세·수수료·세공비·스프레드는 매장별 차이가 크니 실거래는 매장 확인. <strong>본 도구는 단위·가격 계산용 — 투자 권유 X.</strong>
      </Disclaimer>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button key={t.k}
            className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`}
            onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {tab === 'convert' && (
        <ConvertTab
          weight={weight} unit={unit} karat={karat}
          setWeight={setWeight} setUnit={setUnit} setKarat={setKarat}
          grams={grams}
        />
      )}
      {tab === 'price' && (
        <PriceTab
          weight={weight} unit={unit} karat={karat} grams={grams}
          price={price} setPrice={setPrice}
          assets={assets} setAssets={setAssets}
        />
      )}
      {tab === 'guide' && <GuideTab />}

    </div>
  )
}

/* ═════════════════════ TAB 1: 단위 변환·순도 ═════════════════════ */
function ConvertTab({ weight, unit, karat, setWeight, setUnit, setKarat, grams }: {
  weight: number; unit: WeightUnit; karat: string
  setWeight: (n: number) => void; setUnit: (u: WeightUnit) => void; setKarat: (k: string) => void
  grams: number
}) {
  const koreanUnits = UNITS.filter((u) => u.region === '한국')
  const intlUnits = UNITS.filter((u) => u.region === '국제')

  const applyScenario = (id: string) => {
    const sc = SCENARIOS.find((x) => x.id === id)
    if (!sc) return
    setWeight(sc.weightG)
    setUnit('g')
    setKarat(sc.karat)
  }

  return (
    <div className={styles.panel}>
      {/* 빠른 선택 — PC: 카드 그리드 / 모바일: 드롭다운 */}
      <section>
        <label className={styles.label}>빠른 선택</label>
        <div className={styles.scenarioGrid}>
          {SCENARIOS.map((s) => (
            <button key={s.id} className={styles.scenarioCard}
              onClick={() => applyScenario(s.id)}>
              <span className={styles.scenarioEmoji}>{s.emoji}</span>
              <div>
                <p className={styles.scenarioLabel}>{s.label}</p>
                <p className={styles.scenarioDesc}>{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <select
          className={styles.scenarioSelect}
          defaultValue=""
          onChange={(e) => { if (e.target.value) applyScenario(e.target.value); e.target.value = '' }}
          aria-label="빠른 선택 (모바일)"
        >
          <option value="">— 시나리오 선택 —</option>
          {SCENARIOS.map((s) => (
            <option key={s.id} value={s.id}>{s.emoji} {s.label} · {s.desc}</option>
          ))}
        </select>
      </section>

      {/* 무게 + 단위 */}
      <section>
        <label className={styles.label}>무게 입력</label>
        <div className={styles.weightInputRow}>
          <input
            type="text"
            inputMode="decimal"
            className={styles.weightInput}
            value={weight}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.]/g, '')
              setWeight(parseFloat(v) || 0)
            }}
          />
          <select
            className={styles.unitSelect}
            value={unit}
            onChange={(e) => setUnit(e.target.value as WeightUnit)}
          >
            <optgroup label="한국 단위">
              {koreanUnits.map((u) => (
                <option key={u.key} value={u.key}>{u.label} ({u.short})</option>
              ))}
            </optgroup>
            <optgroup label="국제 단위">
              {intlUnits.map((u) => (
                <option key={u.key} value={u.key}>{u.label} ({u.short})</option>
              ))}
            </optgroup>
          </select>
        </div>
      </section>

      {/* 순도 — 모바일도 1줄 6칸 */}
      <section>
        <label className={styles.label}>순도 (Karat)</label>
        <div className={styles.karatRow}>
          {KARATS.map((k) => (
            <button key={k.key}
              className={`${styles.karatPill} ${karat === k.key ? styles.karatPillActive : ''}`}
              onClick={() => setKarat(k.key)}
              style={{ ['--karat-color' as string]: k.color }}>
              {k.label}
            </button>
          ))}
        </div>
        <p className={styles.note}>
          {KARATS.find((k) => k.key === karat)?.desc}
        </p>
      </section>

      {/* 단위 변환 결과 — 국제·한국 섹션 분리 */}
      <section>
        <label className={styles.label}>단위 변환 결과 <span className={styles.labelSub}>({grams.toLocaleString(undefined, { maximumFractionDigits: 4 })}g 기준)</span></label>

        <p className={styles.regionTitle}>🇰🇷 한국 단위</p>
        <div className={styles.unitGrid}>
          {koreanUnits.map((u) => {
            const value = fromGram(grams, u.key)
            const isInput = u.key === unit
            return (
              <div key={u.key} className={`${styles.unitCard} ${isInput ? styles.unitCardActive : ''}`}>
                <p className={styles.unitCardLabel}>{u.label}</p>
                <p className={styles.unitCardValue}>
                  {value.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  <span className={styles.unitCardShort}>{u.short}</span>
                </p>
              </div>
            )
          })}
        </div>

        <p className={styles.regionTitle} style={{ marginTop: 16 }}>🌐 국제 단위</p>
        <div className={styles.unitGrid}>
          {intlUnits.map((u) => {
            const value = fromGram(grams, u.key)
            const isInput = u.key === unit
            return (
              <div key={u.key} className={`${styles.unitCard} ${isInput ? styles.unitCardActive : ''}`}>
                <p className={styles.unitCardLabel}>{u.label}</p>
                <p className={styles.unitCardValue}>
                  {value.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  <span className={styles.unitCardShort}>{u.short}</span>
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 순도 환산 */}
      <section>
        <label className={styles.label}>순도 환산 <span className={styles.labelSub}>(같은 순금량 = 다른 K로 환산)</span></label>
        <div className={styles.purityMatrix}>
          {KARATS.map((k) => {
            const eqGram = convertKarat(grams, karat, k.key)
            const isCurrent = k.key === karat
            return (
              <div key={k.key} className={`${styles.purityCard} ${isCurrent ? styles.purityCardCurrent : ''}`}
                style={{ ['--karat-color' as string]: k.color }}>
                <p className={styles.purityCardK}>{k.label}</p>
                <p className={styles.purityCardWeight}>
                  {eqGram.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                  <span>g</span>
                </p>
                <p className={styles.purityCardRatio}>{(k.ratio * 100).toFixed(1)}%</p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* ═════════════════════ TAB 2: 가격 계산 ═════════════════════ */
function PriceTab({ weight, unit, karat, grams, price, setPrice, assets, setAssets }: {
  weight: number; unit: WeightUnit; karat: string; grams: number
  price: PriceInputs; setPrice: (p: PriceInputs) => void
  assets: AssetItem[]; setAssets: (a: AssetItem[] | ((prev: AssetItem[]) => AssetItem[])) => void
}) {
  const updatePrice = <K extends keyof PriceInputs>(k: K, v: PriceInputs[K]) =>
    setPrice({ ...price, [k]: v })

  const result = useMemo(() => calculatePrice(grams, karat, price), [grams, karat, price])
  const premium = useMemo(() => koreaPremium(price), [price])
  const priceTable = useMemo(() => buildPriceTable(price, karat), [price, karat])

  // 자산 합산
  const assetTotals = useMemo(() => {
    const totalPureG = assets.reduce((sum, a) => sum + pureGoldGram(a.weightG, a.karat), 0)
    const cleanPrice = price.vatIncluded ? price.pricePerGram24k / 1.10 : price.pricePerGram24k
    const baseValue = totalPureG * cleanPrice
    const sellBase = baseValue * (1 - price.spreadPercent / 100)
    const sellFee = sellBase * (price.feePercent / 100)
    const sellRevenue = sellBase - sellFee
    return { totalPureG, baseValue, sellRevenue }
  }, [assets, price])

  const addAsset = () => {
    setAssets((prev) => [...prev, {
      id: nextAssetId(),
      nickname: `금 ${prev.length + 1}`,
      weightG: 3.75,
      karat: '24k',
    }])
  }
  const removeAsset = (id: string) => setAssets((prev) => prev.filter((a) => a.id !== id))
  const updateAsset = (id: string, patch: Partial<AssetItem>) =>
    setAssets((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a))

  return (
    <div className={styles.panel}>
      {/* 시세 입력 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>📈 24K 1g 시세 (KRW)</p>
        <p className={styles.note}>
          오늘 시세는 <a href="https://www.koreagoldx.co.kr" target="_blank" rel="noreferrer">한국금거래소</a>·<a href="https://www.komsco.com" target="_blank" rel="noreferrer">한국조폐공사</a>·은행 사이트에서 확인 후 입력하세요.
        </p>
        <div className={styles.numberRow}>
          <label>1g 시세</label>
          <CompactInput value={price.pricePerGram24k} onChange={(n) => updatePrice('pricePerGram24k', n)} />
        </div>
        <div className={styles.numberRow}>
          <label>1돈 시세 (자동)</label>
          <span className={styles.autoValue}>{fmtKRW(price.pricePerGram24k * 3.75)}</span>
        </div>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={price.vatIncluded}
            onChange={(e) => updatePrice('vatIncluded', e.target.checked)} />
          <span>입력 시세에 부가세 10% 포함</span>
        </label>
      </section>

      {/* 거래 비용 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>💸 거래 비용</p>
        <div className={styles.numberRow}>
          <label>매수-매도 스프레드</label>
          <div className={styles.presetRow}>
            {SPREAD_PRESETS.map((s) => (
              <button key={s}
                className={`${styles.preset} ${price.spreadPercent === s ? styles.presetActive : ''}`}
                onClick={() => updatePrice('spreadPercent', s)}>
                {s}%
              </button>
            ))}
            <input
              type="number" step={0.1} min={0} max={20}
              className={styles.smallNumber}
              value={price.spreadPercent}
              onChange={(e) => updatePrice('spreadPercent', +e.target.value || 0)}
            />
            <span>%</span>
          </div>
        </div>
        <div className={styles.numberRow}>
          <label>거래 수수료</label>
          <div className={styles.presetRow}>
            <input
              type="number" step={0.1} min={0} max={10}
              className={styles.smallNumber}
              value={price.feePercent}
              onChange={(e) => updatePrice('feePercent', +e.target.value || 0)}
            />
            <span>%</span>
          </div>
        </div>
        <div className={styles.numberRow}>
          <label>세공비 (보석류)</label>
          <CompactInput value={price.craftFee} onChange={(n) => updatePrice('craftFee', n)} placeholder="0" />
        </div>
      </section>

      {/* 매수/매도 결과 */}
      <section>
        <label className={styles.label}>현재 입력 ({weight} {UNITS.find((u) => u.key === unit)?.short} {karat.toUpperCase()}) 매수·매도 가격</label>
        <div className={styles.priceCardGrid}>
          <div className={`${styles.priceCard} ${styles.priceCardBuy}`}>
            <p className={styles.priceLabel}>📥 매수 실비용</p>
            <p className={styles.priceBig}>{fmtKRW(result.buyCost)}</p>
            <p className={styles.priceFull}>{fmtKRWFull(result.buyCost)}</p>
            <div className={styles.priceBreak}>
              <div><span>시세</span><span>{fmtKRW(result.baseValue)}</span></div>
              <div><span>부가세 10%</span><span>+{fmtKRW(result.vatAmount)}</span></div>
              <div><span>수수료</span><span>+{fmtKRW(result.baseValue * (price.feePercent / 100))}</span></div>
              {price.craftFee > 0 && <div><span>세공비</span><span>+{fmtKRW(price.craftFee)}</span></div>}
            </div>
          </div>

          <div className={`${styles.priceCard} ${styles.priceCardSell}`}>
            <p className={styles.priceLabel}>📤 매도 실수령</p>
            <p className={styles.priceBig}>{fmtKRW(result.sellRevenue)}</p>
            <p className={styles.priceFull}>{fmtKRWFull(result.sellRevenue)}</p>
            <div className={styles.priceBreak}>
              <div><span>시세</span><span>{fmtKRW(result.baseValue)}</span></div>
              <div><span>스프레드 {price.spreadPercent}%</span><span>-{fmtKRW(result.baseValue * (price.spreadPercent / 100))}</span></div>
              <div><span>수수료</span><span>-{fmtKRW(result.baseValue * (1 - price.spreadPercent / 100) * (price.feePercent / 100))}</span></div>
              <div className={styles.warnRow}><span>※ 부가세 환급 X</span><span>—</span></div>
            </div>
          </div>
        </div>

        <div className={styles.spreadInfo}>
          <p>💡 <strong>매수→매도 손실:</strong> {fmtKRW(result.spreadLoss)} ({(result.spreadLoss / Math.max(1, result.buyCost) * 100).toFixed(1)}%)</p>
          <p className={styles.note}>골드바를 사서 바로 팔면 부가세 10% + 스프레드 + 수수료로 약 {Math.round(((result.spreadLoss) / Math.max(1, result.buyCost)) * 100)}% 손실. 단기 거래는 KRX 금현물 권장.</p>
        </div>
      </section>

      {/* 무게별 가격표 */}
      <section>
        <label className={styles.label}>무게별 가격표 <span className={styles.labelSub}>({KARATS.find((k) => k.key === karat)?.label} 기준)</span></label>
        <div className={styles.priceTable}>
          <div className={styles.priceTableHead}>
            <span>무게</span>
            <span>매수 실비용</span>
            <span>매도 실수령</span>
            <span>차이</span>
          </div>
          {priceTable.map((row) => (
            <div key={row.label} className={styles.priceTableRow}>
              <span>{row.label}</span>
              <span className={styles.tableBuy}>{fmtKRW(row.buyCost)}</span>
              <span className={styles.tableSell}>{fmtKRW(row.sellRevenue)}</span>
              <span className={styles.tableDiff}>-{fmtKRW(row.buyCost - row.sellRevenue)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 코리아 프리미엄 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🌐 코리아 프리미엄 (한국 vs 국제 시세)</p>
        <div className={styles.numberRow}>
          <label>USD/KRW 환율</label>
          <CompactInput value={price.usdKrw} onChange={(n) => updatePrice('usdKrw', n)} />
        </div>
        <div className={styles.numberRow}>
          <label>국제 1 oz 시세 (USD)</label>
          <CompactInput value={price.internationalOzUsd} onChange={(n) => updatePrice('internationalOzUsd', n)} />
        </div>
        <div className={styles.premiumResult}>
          <div>
            <p className={styles.premiumLabel}>한국 1 oz</p>
            <p className={styles.premiumValue}>{fmtKRW(premium.koreaPerOz)}</p>
          </div>
          <div className={styles.premiumArrow}>vs</div>
          <div>
            <p className={styles.premiumLabel}>국제 1 oz</p>
            <p className={styles.premiumValue}>{fmtKRW(premium.intlPerOzKrw)}</p>
          </div>
          <div className={styles.premiumBig}>
            <p className={styles.premiumLabel}>프리미엄</p>
            <p className={`${styles.premiumValueBig} ${premium.premiumPercent >= 0 ? styles.premiumPos : styles.premiumNeg}`}>
              {premium.premiumPercent >= 0 ? '+' : ''}{premium.premiumPercent.toFixed(2)}%
            </p>
          </div>
        </div>
        <p className={styles.note}>
          {premium.premiumPercent > 5 && '⚠️ 코리아 프리미엄 5% 초과 — 국내 매수 시 비싸게 사는 셈. 환율·국제 시세 모니터링 필요.'}
          {premium.premiumPercent <= 5 && premium.premiumPercent >= -5 && '국제 시세와 큰 차이 없음 (정상 범위).'}
          {premium.premiumPercent < -5 && '국내가 국제 대비 저렴 — 매수 유리 시점 가능성.'}
        </p>
      </section>

      {/* 자산 합산 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>📊 자산 가치 합산기</p>
        <p className={styles.note}>보유한 금을 모두 추가해 합계 시세 가치와 매도 시 실수령액을 확인하세요.</p>
        {assets.length === 0 && (
          <p className={styles.emptyMsg}>아직 추가된 자산이 없습니다. 아래 버튼으로 시작하세요.</p>
        )}
        {assets.map((a) => (
          <div key={a.id} className={styles.assetRow}>
            <input
              type="text"
              className={styles.assetNickname}
              value={a.nickname}
              onChange={(e) => updateAsset(a.id, { nickname: e.target.value })}
              placeholder="별명 (예: 결혼반지)"
            />
            <input
              type="text"
              inputMode="decimal"
              className={styles.assetWeight}
              value={a.weightG}
              onChange={(e) => updateAsset(a.id, { weightG: parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0 })}
            />
            <span className={styles.assetUnit}>g</span>
            <select
              className={styles.assetKarat}
              value={a.karat}
              onChange={(e) => updateAsset(a.id, { karat: e.target.value })}
            >
              {KARATS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
            </select>
            <button className={styles.assetRemove} onClick={() => removeAsset(a.id)}>✕</button>
          </div>
        ))}
        <button className={styles.addBtn} onClick={addAsset}>+ 자산 추가</button>
        {assets.length > 0 && (
          <div className={styles.assetTotal}>
            <div>
              <span>총 순금 환산</span>
              <strong>{assetTotals.totalPureG.toLocaleString(undefined, { maximumFractionDigits: 3 })}g</strong>
              <span className={styles.assetTotalSub}>({fromGram(assetTotals.totalPureG, 'don').toFixed(2)}돈)</span>
            </div>
            <div>
              <span>시세 가치</span>
              <strong>{fmtKRW(assetTotals.baseValue)}</strong>
            </div>
            <div className={styles.assetTotalAccent}>
              <span>매도 시 실수령</span>
              <strong>{fmtKRW(assetTotals.sellRevenue)}</strong>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

/* ═════════════════════ TAB 3: 가이드 ═════════════════════ */
function GuideTab() {
  return (
    <div className={styles.panel}>
      {/* 비교표 */}
      <section>
        <label className={styles.label}>🔍 KRX 금현물 vs 골드바 vs 금통장</label>
        <div className={styles.comparisonGrid}>
          {[
            {
              title: 'KRX 금현물',
              emoji: '📊',
              color: '#059669',
              recommend: '단기·중기 투자',
              vat: '면제 ✓',
              capitalGain: '비과세 ✓',
              spread: '0.3~0.5% (낮음)',
              storage: '디지털',
              redemption: '즉시 (장중)',
              note: '한국거래소 금시장. 증권사 계좌 필요. 1g 단위 매매. 99.99% 실물 전환 가능.',
            },
            {
              title: '골드바',
              emoji: '🪙',
              color: '#CA8A04',
              recommend: '선물·증여·실물 보유',
              vat: '10% 부담 ✗',
              capitalGain: '비과세 ✓',
              spread: '7~10% (높음)',
              storage: '실물',
              redemption: '매장 방문',
              note: '한국조폐공사·한국금거래소·은행. 부가세 환급 X. 단기 매매 시 큰 손실.',
            },
            {
              title: '금통장 (KB·신한 등)',
              emoji: '💳',
              color: '#0891B2',
              recommend: '소액 적립·환금성',
              vat: '면제 ✓',
              capitalGain: '15.4% 부과 ✗',
              spread: '1~2% (중간)',
              storage: '디지털',
              redemption: '영업일 매도',
              note: '0.01g 단위 적립. 양도세 부담. 실물 인출 시 부가세 10% 추가.',
            },
          ].map((item) => (
            <div key={item.title} className={styles.compareCard} style={{ ['--c-color' as string]: item.color }}>
              <div className={styles.compareHead}>
                <span className={styles.compareEmoji}>{item.emoji}</span>
                <span className={styles.compareTitle}>{item.title}</span>
              </div>
              <div className={styles.compareRows}>
                <div><span>추천</span><strong>{item.recommend}</strong></div>
                <div><span>부가세</span><strong>{item.vat}</strong></div>
                <div><span>양도세</span><strong>{item.capitalGain}</strong></div>
                <div><span>스프레드</span><strong>{item.spread}</strong></div>
                <div><span>보관</span><strong>{item.storage}</strong></div>
                <div><span>환매</span><strong>{item.redemption}</strong></div>
              </div>
              <p className={styles.compareNote}>{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 한국 인기 골드바 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🥇 한국 인기 골드바 종류</p>
        <ul className={styles.guideList}>
          <li><strong>한국조폐공사 (KOMSCO)</strong> — 정부 기관 발행. 신뢰도 최고. 1g/3.75g/10g/한냥/100g/1kg</li>
          <li><strong>한국금거래소</strong> — 다양한 무게·디자인. 카드 매수 가능.</li>
          <li><strong>은행 골드바</strong> — KB·신한·우리·하나. 매장 픽업.</li>
          <li><strong>대형 귀금속 매장</strong> — 종로·남대문 도매. 가격 협상 가능 but 주의.</li>
          <li><strong>해외 브랜드</strong> — PAMP·Heraeus 등 (해외 직구 시 통관·부가세 별도).</li>
        </ul>
      </section>

      {/* 거래 비용 구조 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>💸 골드바 거래 비용 구조</p>
        <div className={styles.costFlow}>
          <div className={styles.costStep}>
            <span className={styles.costStepNum}>1</span>
            <div>
              <p className={styles.costStepTitle}>매수</p>
              <p className={styles.costStepDesc}>시세 + 부가세 10% + 매장 수수료 1~3% (+ 세공비 시 1~5만)</p>
            </div>
          </div>
          <div className={styles.costStep}>
            <span className={styles.costStepNum}>2</span>
            <div>
              <p className={styles.costStepTitle}>보유</p>
              <p className={styles.costStepDesc}>보유 자체에는 세금 X (단, 금통장은 평가차익 시 양도세)</p>
            </div>
          </div>
          <div className={styles.costStep}>
            <span className={styles.costStepNum}>3</span>
            <div>
              <p className={styles.costStepTitle}>매도</p>
              <p className={styles.costStepDesc}>매장 매수가 (시세 - 스프레드 5~10%) - 수수료 · <strong>부가세 환급 없음</strong></p>
            </div>
          </div>
        </div>
        <p className={styles.note}>
          ⚠️ 골드바 단기 매매 (몇 개월 내) 시 부가세 + 스프레드로 약 15~20% 손실 가능. 장기 보유 또는 KRX 금현물 권장.
        </p>
      </section>

      {/* 관련 도구 */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>🔗 관련 도구</p>
        <ul className={styles.relatedList}>
          <li><Link href="/tools/finance/vat">부가세 계산기</Link> — 부가세 역산·견적서</li>
          <li><Link href="/tools/finance/compound">복리 계산기</Link> — 금 vs 예금·주식 장기 수익 비교</li>
          <li><Link href="/tools/finance/stock">주식 물타기 계산기</Link> — 단가 평균화 시뮬</li>
          <li><Link href="/tools/unit/converter">단위 변환기</Link> — 길이·부피 등 일반 단위</li>
        </ul>
      </section>
    </div>
  )
}

/* ─── 공통 입력 컴포넌트 ─── */
function CompactInput({ value, onChange, placeholder }: { value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div className={styles.compactInputWrap}>
      <input
        type="text"
        inputMode="numeric"
        className={styles.compactInput}
        value={value.toLocaleString()}
        placeholder={placeholder}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
          onChange(Math.min(100_000_000_000, n))
        }}
      />
      <span>원</span>
    </div>
  )
}
