'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './cooking.module.css'

/* ── 부피 단위 (기준: ml) ── */
interface VolumeUnit { id: string; label: string; symbol: string; ml: number; group: 'kr' | 'intl' }
const VOLUME_UNITS: VolumeUnit[] = [
  { id: 'kr_cup',    label: '한국 컵 (200ml)',  symbol: '컵',      ml: 200,        group: 'kr'   },
  { id: 'tbsp',      label: '큰술',             symbol: '큰술',    ml: 15,         group: 'kr'   },
  { id: 'tsp',       label: '작은술',           symbol: '작은술',  ml: 5,          group: 'kr'   },
  { id: 'paper_cup', label: '종이컵 (180ml)',   symbol: '종이컵',  ml: 180,        group: 'kr'   },
  { id: 'ml',        label: 'ml',               symbol: 'ml',      ml: 1,          group: 'intl' },
  { id: 'l',         label: 'L',                symbol: 'L',       ml: 1000,       group: 'intl' },
  { id: 'fl_oz',     label: 'fl oz',            symbol: 'fl oz',   ml: 29.5735,    group: 'intl' },
  { id: 'us_cup',    label: '미국 컵 (240ml)',  symbol: 'US컵',    ml: 240,        group: 'intl' },
  { id: 'us_tbsp',   label: '미국 큰술',        symbol: 'US큰술',  ml: 14.7868,    group: 'intl' },
  { id: 'us_tsp',    label: '미국 작은술',      symbol: 'US작은술',ml: 4.92892,    group: 'intl' },
  { id: 'pint',      label: '파인트 (미국)',    symbol: 'pt',      ml: 473.176,    group: 'intl' },
  { id: 'quart',     label: '쿼트',             symbol: 'qt',      ml: 946.353,    group: 'intl' },
]

/* ── 무게 단위 (기준: g) ── */
interface WeightUnit { id: string; label: string; symbol: string; g: number; group: 'intl' | 'us' | 'kr' | 'cook' }
const WEIGHT_UNITS: WeightUnit[] = [
  { id: 'g',       label: 'g (그램)',     symbol: 'g',    g: 1,        group: 'intl' },
  { id: 'kg',      label: 'kg (킬로그램)',symbol: 'kg',   g: 1000,     group: 'intl' },
  { id: 'mg',      label: 'mg (밀리그램)',symbol: 'mg',   g: 0.001,    group: 'intl' },
  { id: 'oz',      label: '온스 (oz)',    symbol: 'oz',   g: 28.3495,  group: 'us'   },
  { id: 'lb',      label: '파운드 (lb)',  symbol: 'lb',   g: 453.592,  group: 'us'   },
  { id: 'geun',    label: '근 (600g)',    symbol: '근',   g: 600,      group: 'kr'   },
  { id: 'nyang',   label: '냥 (37.5g)',   symbol: '냥',   g: 37.5,     group: 'kr'   },
  { id: 'don',     label: '돈 (3.75g)',   symbol: '돈',   g: 3.75,     group: 'kr'   },
  { id: 'gwan',    label: '관 (3750g)',   symbol: '관',   g: 3750,     group: 'kr'   },
  { id: 'pinch',   label: '한 꼬집 (≈0.5g)', symbol: '꼬집', g: 0.5,  group: 'cook' },
  { id: 'yakgan',  label: '약간 (≈1g)',   symbol: '약간', g: 1,        group: 'cook' },
]

/* ── Gas Mark 변환 테이블 ── */
const GM_TABLE = [
  { gm: 0.25, c: 110 }, { gm: 0.5, c: 130 }, { gm: 1, c: 140 },
  { gm: 2,    c: 150 }, { gm: 3,   c: 170 }, { gm: 4, c: 180 },
  { gm: 5,    c: 190 }, { gm: 6,   c: 200 }, { gm: 7, c: 220 },
  { gm: 8,    c: 230 }, { gm: 9,   c: 240 },
]

function gmToC(gm: number): number {
  if (gm <= GM_TABLE[0].gm) return GM_TABLE[0].c
  if (gm >= GM_TABLE[GM_TABLE.length - 1].gm) return GM_TABLE[GM_TABLE.length - 1].c
  for (let i = 0; i < GM_TABLE.length - 1; i++) {
    if (gm >= GM_TABLE[i].gm && gm <= GM_TABLE[i + 1].gm) {
      const t = (gm - GM_TABLE[i].gm) / (GM_TABLE[i + 1].gm - GM_TABLE[i].gm)
      return GM_TABLE[i].c + t * (GM_TABLE[i + 1].c - GM_TABLE[i].c)
    }
  }
  return GM_TABLE[GM_TABLE.length - 1].c
}

function cToGM(c: number): number {
  if (c <= GM_TABLE[0].c) return GM_TABLE[0].gm
  if (c >= GM_TABLE[GM_TABLE.length - 1].c) return GM_TABLE[GM_TABLE.length - 1].gm
  for (let i = 0; i < GM_TABLE.length - 1; i++) {
    if (c >= GM_TABLE[i].c && c <= GM_TABLE[i + 1].c) {
      const t = (c - GM_TABLE[i].c) / (GM_TABLE[i + 1].c - GM_TABLE[i].c)
      return GM_TABLE[i].gm + t * (GM_TABLE[i + 1].gm - GM_TABLE[i].gm)
    }
  }
  return GM_TABLE[GM_TABLE.length - 1].gm
}

const cToF = (c: number) => c * 9 / 5 + 32
const fToC = (f: number) => (f - 32) * 5 / 9

/* ── 숫자 포맷 ── */
function fmtVal(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '-'
  if (n === 0) return '0'
  if (n < 0.0001 && n > 0) return '< 0.0001'
  if (Math.abs(n) >= 10000) return n.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
  if (Math.abs(n) >= 100)   return n.toFixed(1).replace(/\.0$/, '')
  if (Math.abs(n) >= 10)    return n.toFixed(2).replace(/\.?0+$/, '')
  if (Math.abs(n) >= 1)     return n.toFixed(3).replace(/\.?0+$/, '')
  return n.toFixed(4).replace(/\.?0+$/, '')
}

/* ── 분수 변환 ── */
function toFrac(n: number): string | null {
  if (!isFinite(n) || n < 0) return null
  const whole = Math.floor(n)
  const dec = n - whole
  const fracs: [number, string][] = [
    [1 / 8, '⅛'], [1 / 4, '¼'], [1 / 3, '⅓'], [3 / 8, '⅜'],
    [1 / 2, '½'], [5 / 8, '⅝'], [2 / 3, '⅔'], [3 / 4, '¾'], [7 / 8, '⅞'],
  ]
  for (const [v, s] of fracs) {
    if (Math.abs(dec - v) < 0.025) return whole > 0 ? `${whole}${s}` : s
  }
  if (dec < 0.025 && whole > 0) return String(whole)
  return null
}

/* ── 결과 행 공통 컴포넌트 ── */
interface ResultRowProps {
  id: string; label: string; symbol: string
  value: number; isCurrent: boolean; showFrac: boolean
  copied: string | null; onCopy: (id: string, text: string) => void
}
function ResultRow({ id, label, symbol, value, isCurrent, showFrac, copied, onCopy }: ResultRowProps) {
  const val  = fmtVal(value)
  const frac = showFrac ? toFrac(value) : null
  return (
    <div className={`${styles.resultRow} ${isCurrent ? styles.resultRowActive : ''}`}>
      <div className={styles.resultInfo}>
        <span className={styles.resultUnitName}>{label}</span>
        {isCurrent && <span className={styles.currentBadge}>입력</span>}
      </div>
      <div className={styles.resultRight}>
        <span className={styles.resultVal}>{val}</span>
        <span className={styles.resultUnitSym}>{symbol}</span>
        {frac && <span className={styles.resultFrac}>({frac})</span>}
        <button
          className={`${styles.copyBtn} ${copied === id ? styles.copyBtnDone : ''}`}
          onClick={() => onCopy(id, `${val} ${symbol}`)}
        >{copied === id ? '✓' : '⎘'}</button>
      </div>
    </div>
  )
}

/* ── 탭 1: 부피 변환기 ── */
const VOL_PRESETS = [
  { label: '1 한국 컵', from: 'kr_cup',    val: 1 },
  { label: '1 큰술',   from: 'tbsp',      val: 1 },
  { label: '1 작은술', from: 'tsp',       val: 1 },
  { label: '1 미국 컵',from: 'us_cup',    val: 1 },
  { label: '1 fl oz', from: 'fl_oz',     val: 1 },
]

function VolumeTab() {
  const [fromId,   setFromId]   = useState('ml')
  const [input,    setInput]    = useState('')
  const [showFrac, setShowFrac] = useState(false)
  const [copied,   setCopied]   = useState<string | null>(null)

  const results = useMemo(() => {
    const v = parseFloat(input)
    if (!v || v <= 0) return null
    const base = v * VOLUME_UNITS.find(u => u.id === fromId)!.ml
    return VOLUME_UNITS.map(u => ({ ...u, value: base / u.ml }))
  }, [input, fromId])

  const handleCopy = useCallback(async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopied(id); setTimeout(() => setCopied(null), 1500)
  }, [])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>부피 입력</div>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="decimal"
            placeholder="1" value={input} onChange={e => setInput(e.target.value)} />
          <select className={styles.unitSelect} value={fromId} onChange={e => setFromId(e.target.value)}>
            <optgroup label="🇰🇷 한국">
              {VOLUME_UNITS.filter(u => u.group === 'kr').map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </optgroup>
            <optgroup label="🌍 국제">
              {VOLUME_UNITS.filter(u => u.group === 'intl').map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className={styles.presetRow} style={{ marginTop: 10 }}>
          {VOL_PRESETS.map(p => (
            <button key={p.label} className={styles.presetBtn}
              onClick={() => { setFromId(p.from); setInput(String(p.val)) }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {results ? (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span className={styles.resultHeaderLabel}>변환 결과</span>
            <button
              className={`${styles.fracToggle} ${showFrac ? styles.fracToggleActive : ''}`}
              onClick={() => setShowFrac(v => !v)}>
              ½ 분수 표시
            </button>
          </div>
          {results.map(r => (
            <ResultRow key={r.id} {...r} isCurrent={r.id === fromId}
              showFrac={showFrac} copied={copied} onCopy={handleCopy} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>숫자를 입력하면 모든 단위로 변환됩니다</div>
      )}
    </div>
  )
}

/* ── 탭 2: 무게 변환기 ── */
const WT_PRESETS = [
  { label: '1 oz',   from: 'oz',    val: 1   },
  { label: '1 lb',   from: 'lb',    val: 1   },
  { label: '1 근',   from: 'geun',  val: 1   },
  { label: '1 냥',   from: 'nyang', val: 1   },
  { label: '100 g',  from: 'g',     val: 100 },
]

function WeightTab() {
  const [fromId,   setFromId]   = useState('g')
  const [input,    setInput]    = useState('')
  const [showFrac, setShowFrac] = useState(false)
  const [copied,   setCopied]   = useState<string | null>(null)

  const results = useMemo(() => {
    const v = parseFloat(input)
    if (!v || v <= 0) return null
    const base = v * WEIGHT_UNITS.find(u => u.id === fromId)!.g
    return WEIGHT_UNITS.map(u => ({ ...u, value: base / u.g }))
  }, [input, fromId])

  const handleCopy = useCallback(async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopied(id); setTimeout(() => setCopied(null), 1500)
  }, [])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>무게 입력</div>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="decimal"
            placeholder="100" value={input} onChange={e => setInput(e.target.value)} />
          <select className={styles.unitSelect} value={fromId} onChange={e => setFromId(e.target.value)}>
            <optgroup label="🌍 국제">
              {WEIGHT_UNITS.filter(u => u.group === 'intl').map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </optgroup>
            <optgroup label="🇺🇸 미국식">
              {WEIGHT_UNITS.filter(u => u.group === 'us').map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </optgroup>
            <optgroup label="🇰🇷 한국 전통">
              {WEIGHT_UNITS.filter(u => u.group === 'kr').map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </optgroup>
            <optgroup label="🍳 요리 편의">
              {WEIGHT_UNITS.filter(u => u.group === 'cook').map(u => (
                <option key={u.id} value={u.id}>{u.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className={styles.presetRow} style={{ marginTop: 10 }}>
          {WT_PRESETS.map(p => (
            <button key={p.label} className={styles.presetBtn}
              onClick={() => { setFromId(p.from); setInput(String(p.val)) }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {results ? (
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <span className={styles.resultHeaderLabel}>변환 결과</span>
            <button
              className={`${styles.fracToggle} ${showFrac ? styles.fracToggleActive : ''}`}
              onClick={() => setShowFrac(v => !v)}>
              ½ 분수 표시
            </button>
          </div>
          {results.map(r => (
            <ResultRow key={r.id} {...r} isCurrent={r.id === fromId}
              showFrac={showFrac} copied={copied} onCopy={handleCopy} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>무게를 입력하면 모든 단위로 변환됩니다</div>
      )}
    </div>
  )
}

/* ── 탭 3: 오븐 온도 변환기 ── */
type TUnit = 'c' | 'f' | 'gm'

interface OvenPreset { label: string; c: number; gm: number; desc: string; color: string }
const OVEN_PRESETS: OvenPreset[] = [
  { label: '저온',   c: 150, gm: 2, desc: '머랭·건조',            color: '#3EC8FF' },
  { label: '중저온', c: 170, gm: 3, desc: '파운드케이크·치즈케이크', color: '#88DDAA' },
  { label: '중온',   c: 180, gm: 4, desc: '쿠키·케이크 (일반적)',  color: '#C8FF3E' },
  { label: '중고온', c: 200, gm: 6, desc: '빵·머핀',              color: '#FFB44E' },
  { label: '고온',   c: 220, gm: 7, desc: '피자·바게트·구이',     color: '#FF8C3E' },
  { label: '초고온', c: 250, gm: 9, desc: '나폴리 피자',          color: '#FF6B6B' },
]

function TempTab() {
  const [fromUnit, setFromUnit] = useState<TUnit>('c')
  const [input,    setInput]    = useState('')
  const [copied,   setCopied]   = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<OvenPreset | null>(null)

  const result = useMemo(() => {
    const v = parseFloat(input)
    if (isNaN(v)) return null
    let c: number
    if (fromUnit === 'c')  c = v
    else if (fromUnit === 'f') c = fToC(v)
    else c = gmToC(v)
    const f  = cToF(c)
    const gm = cToGM(c)
    return { c: Math.round(c * 10) / 10, f: Math.round(f * 10) / 10, gm: Math.round(gm * 10) / 10 }
  }, [input, fromUnit])

  const display = activePreset && result
    ? { c: result.c, f: result.f, gm: activePreset.gm }
    : result

  const handleCopy = useCallback(async (id: string, text: string) => {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopied(id); setTimeout(() => setCopied(null), 1500)
  }, [])

  const applyPreset = (p: OvenPreset) => {
    setActivePreset(p); setFromUnit('c'); setInput(String(p.c))
  }

  const UNITS_CFG: { id: TUnit; sym: string; label: string }[] = [
    { id: 'c',  sym: '°C',  label: '섭씨'     },
    { id: 'f',  sym: '°F',  label: '화씨'     },
    { id: 'gm', sym: 'GM',  label: '가스 마크' },
  ]

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>입력 단위</div>
        <div className={styles.unitRow}>
          {UNITS_CFG.map(u => (
            <button key={u.id}
              className={`${styles.unitBtn} ${fromUnit === u.id ? styles.unitBtnActive : ''}`}
              onClick={() => { setFromUnit(u.id); setInput(''); setActivePreset(null) }}>
              <span className={styles.unitBtnSym}>{u.sym}</span>
              <span className={styles.unitBtnLabel}>{u.label}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder={fromUnit === 'gm' ? '4' : fromUnit === 'c' ? '180' : '350'}
              value={input}
              onChange={e => { setInput(e.target.value); setActivePreset(null) }} />
            <span className={styles.unitSym}>
              {fromUnit === 'c' ? '°C' : fromUnit === 'f' ? '°F' : 'GM'}
            </span>
          </div>
        </div>
      </div>

      {display ? (
        <div className={styles.resultCard}>
          <div className={styles.tempResultRow}>
            {UNITS_CFG.map(u => {
              const val = u.id === 'c' ? display.c : u.id === 'f' ? display.f : display.gm
              return (
                <div key={u.id} className={`${styles.tempBlock} ${fromUnit === u.id ? styles.tempBlockActive : ''}`}>
                  <div className={styles.tempBlockLabel}>{u.label}</div>
                  <div className={styles.tempBlockVal}>{val}<span className={styles.tempBlockSym}>{u.sym}</span></div>
                  <button
                    className={`${styles.copyBtn} ${styles.copyBtnFull} ${copied === u.id ? styles.copyBtnDone : ''}`}
                    onClick={() => handleCopy(u.id, `${val}${u.sym}`)}>
                    {copied === u.id ? '✓ 복사됨' : '📋 복사'}
                  </button>
                </div>
              )
            })}
          </div>
          {activePreset && (
            <div className={styles.presetTag}
              style={{ borderColor: `${activePreset.color}50`, color: activePreset.color }}>
              {activePreset.label} 오븐 — {activePreset.desc}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.empty}>온도를 입력하면 섭씨·화씨·가스 마크로 변환됩니다</div>
      )}

      <div className={styles.card}>
        <div className={styles.cardLabel}>오븐 온도 프리셋</div>
        <div className={styles.ovenGrid}>
          {OVEN_PRESETS.map(p => (
            <button key={p.label} className={styles.ovenBtn}
              style={{ '--oven-color': p.color } as React.CSSProperties}
              onClick={() => applyPreset(p)}>
              <span className={styles.ovenBtnLabel}>{p.label}</span>
              <span className={styles.ovenBtnTemp}>{p.c}°C</span>
              <span className={styles.ovenBtnF}>{cToF(p.c).toFixed(0)}°F · GM{p.gm}</span>
              <span className={styles.ovenBtnDesc}>{p.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── 메인 ── */
export default function CookingUnitClient() {
  const [tab, setTab] = useState<'vol' | 'wt' | 'temp'>('vol')
  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'vol'  ? styles.tabActive : ''}`} onClick={() => setTab('vol')}>
          🥄 부피 변환
        </button>
        <button className={`${styles.tab} ${tab === 'wt'   ? styles.tabActive : ''}`} onClick={() => setTab('wt')}>
          ⚖️ 무게 변환
        </button>
        <button className={`${styles.tab} ${tab === 'temp' ? styles.tabActive : ''}`} onClick={() => setTab('temp')}>
          🌡️ 오븐 온도
        </button>
      </div>
      {tab === 'vol'  && <VolumeTab />}
      {tab === 'wt'   && <WeightTab />}
      {tab === 'temp' && <TempTab />}
    </div>
  )
}
