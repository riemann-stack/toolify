'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import styles from './golden-ratio.module.css'

const PHI = 1.6180339887498948

type Unit = 'px' | 'cm' | 'mm' | 'pt' | 'inch'
type RatioUnit = 'px' | 'cm' | 'mm'
type Decimals = 0 | 1 | 2 | 3

const UNITS: Unit[] = ['px', 'cm', 'mm', 'pt', 'inch']
const RATIO_UNITS: RatioUnit[] = ['px', 'cm', 'mm']

const PRESETS: { label: string; long: number; short: number; unit: Unit }[] = [
  { label: '명함 (90×50mm)',        long: 90,   short: 50,  unit: 'mm' },
  { label: 'A4 (297×210mm)',        long: 297,  short: 210, unit: 'mm' },
  { label: '인스타 정사각 한 변 (1080px)', long: 1080, short: 1080, unit: 'px' },
  { label: '유튜브 썸네일 (1280×720px)', long: 1280, short: 720, unit: 'px' },
]

function fmt(n: number, d: Decimals): string {
  if (!isFinite(n)) return '-'
  return n.toFixed(d)
}

/* ──────────────────────── 탭 1: 황금 비율 계산기 ──────────────────────── */
function RatioTab({ decimals }: { decimals: Decimals }) {
  const [mode, setMode] = useState<'A' | 'B' | 'T'>('A')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [t, setT] = useState('')
  const [unit, setUnit] = useState<Unit>('px')
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    if (mode === 'A') {
      const A = parseFloat(a)
      if (!A || A <= 0) return null
      const B = A / PHI
      return { A, B, total: A + B }
    } else if (mode === 'B') {
      const B = parseFloat(b)
      if (!B || B <= 0) return null
      const A = B * PHI
      return { A, B, total: A + B }
    } else {
      const T = parseFloat(t)
      if (!T || T <= 0) return null
      const A = T / PHI
      const B = T - A
      return { A, B, total: T }
    }
  }, [mode, a, b, t])

  const applyPreset = useCallback((p: typeof PRESETS[0]) => {
    setUnit(p.unit)
    setMode('A')
    setA(String(p.long))
    setB('')
    setT('')
  }, [])

  const handleCopy = useCallback(async () => {
    if (!result) return
    const text = `긴 변(A): ${fmt(result.A, decimals)}${unit} · 짧은 변(B): ${fmt(result.B, decimals)}${unit} · 전체: ${fmt(result.total, decimals)}${unit}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }, [result, decimals, unit])

  return (
    <div className={styles.tabContent}>
      {/* 기준 선택 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>기준 변 선택</div>
        <div className={styles.modeTabs}>
          <button type="button" aria-pressed={mode === 'A'}
            className={`${styles.modeTab} ${mode === 'A' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('A')}
          >긴 변(A) → B 계산</button>
          <button type="button" aria-pressed={mode === 'B'}
            className={`${styles.modeTab} ${mode === 'B' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('B')}
          >짧은 변(B) → A 계산</button>
          <button type="button" aria-pressed={mode === 'T'}
            className={`${styles.modeTab} ${mode === 'T' ? styles.modeTabActive : ''}`}
            onClick={() => setMode('T')}
          >전체(T) → A·B 계산</button>
        </div>

        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="golden-ratio-f1">긴 변 (A)</label>
            <div className={styles.inputRow}>
              <input id="golden-ratio-f1"
                className={styles.numInput}
                type="number"
                inputMode="decimal"
                placeholder="100"
                value={mode === 'A' ? a : (result ? fmt(result.A, decimals) : '')}
                onChange={e => setA(e.target.value)}
                disabled={mode !== 'A'}
              />
              <span className={styles.unit}>{unit}</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="golden-ratio-f2">짧은 변 (B)</label>
            <div className={styles.inputRow}>
              <input id="golden-ratio-f2"
                className={styles.numInput}
                type="number"
                inputMode="decimal"
                placeholder="61.8"
                value={mode === 'B' ? b : (result ? fmt(result.B, decimals) : '')}
                onChange={e => setB(e.target.value)}
                disabled={mode !== 'B'}
              />
              <span className={styles.unit}>{unit}</span>
            </div>
          </div>
          <div className={styles.fieldGroup} style={{ gridColumn: '1 / -1' }}>
            <label className={styles.fieldLabel} htmlFor="golden-ratio-length">전체 길이 (T = A + B)</label>
            <div className={styles.inputRow}>
              <input id="golden-ratio-length"
                className={styles.numInput}
                type="number"
                inputMode="decimal"
                placeholder="161.8"
                value={mode === 'T' ? t : (result ? fmt(result.total, decimals) : '')}
                onChange={e => setT(e.target.value)}
                disabled={mode !== 'T'}
              />
              <span className={styles.unit}>{unit}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className={styles.fieldLabel} style={{ marginBottom: 6 }}>단위</div>
          <div className={styles.selectRow}>
            {UNITS.map(u => (
              <button
                key={u} type="button" aria-pressed={unit === u}
                className={`${styles.selectBtn} ${unit === u ? styles.selectBtnActive : ''}`}
                onClick={() => setUnit(u)}
              >{u}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 프리셋 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>프리셋 (긴 변 기준 적용)</div>
        <div className={styles.presetRow}>
          {PRESETS.map(p => (
            <button key={p.label} type="button" className={styles.presetBtn} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {result ? (
        <div className={styles.resultCard} role="status">
          <div className={styles.heroRow}>
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>긴 변 (A)</div>
              <div className={styles.heroNum}>{fmt(result.A, decimals)}<span className={styles.heroUnit}>{unit}</span></div>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>짧은 변 (B)</div>
              <div className={styles.heroNum}>{fmt(result.B, decimals)}<span className={styles.heroUnit}>{unit}</span></div>
            </div>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoNum}>{fmt(result.total, decimals)}{unit}</div>
              <div className={styles.infoLabel}>전체 길이 (A+B)</div>
            </div>
            <div className={styles.infoItem}>
              {/* φ는 고정 상수 — 소수점 0~1 선택 시 "1 : 2"로 뭉개지지 않게 3자리 고정 */}
              <div className={styles.infoNum}>1 : 1.618</div>
              <div className={styles.infoLabel}>비율 (B : A)</div>
            </div>
          </div>

          {/* 미니 황금 직사각형 시각화 */}
          <MiniGoldenRect A={result.A} B={result.B} unit={unit} />

          <button type="button" className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`} onClick={handleCopy} style={{ marginTop: 10 }}>
            {copied ? '✓ 복사됨' : '결과 복사'}
          </button>
        </div>
      ) : (
        <div className={styles.empty}>기준 변(A·B) 또는 전체 길이(T)를 입력하면 나머지가 계산됩니다</div>
      )}
    </div>
  )
}

/* ── 미니 황금 직사각형 (입력값 시각화) ── */
function MiniGoldenRect({ A, B, unit }: { A: number; B: number; unit: string }) {
  if (!A || !B) return null
  // viewBox 기준 A를 가로, B를 세로로 정규화
  const W = 320
  const H = Math.round(W * (B / A))
  return (
    <div className={styles.miniRectWrap}>
      <svg className={styles.miniRectSvg} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W }}>
        {/* 전체 직사각형 */}
        <rect x={0} y={0} width={W} height={H} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
        {/* B × B 정사각형 (왼쪽) — 황금 분할 */}
        <rect x={0} y={0} width={H} height={H} fill="rgba(14,165,233,0.07)" stroke="rgba(14,165,233,0.5)" strokeWidth={1} />
        {/* 분할 호 (사분원) */}
        <path
          d={`M ${H} 0 A ${H} ${H} 0 0 1 0 ${H}`}
          fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeLinecap="round"
        />
        {/* A 라벨 (가로 전체) */}
        <text x={W / 2} y={H - 6} fill="var(--muted)" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontSize="11" fontWeight={700} textAnchor="middle">
          A = {A.toFixed(1)}{unit}
        </text>
        {/* B 라벨 (세로) */}
        <text x={H / 2} y={14} fill="var(--accent)" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontSize="11" fontWeight={700} textAnchor="middle">
          B = {B.toFixed(1)}{unit}
        </text>
      </svg>
    </div>
  )
}

/* ──────────────────────── 탭 2: 비율 변환기 ──────────────────────── */
function ConvertTab({ decimals }: { decimals: Decimals }) {
  const [w, setW] = useState('')
  const [h, setH] = useState('')
  const [unit, setUnit] = useState<RatioUnit>('px')

  const result = useMemo(() => {
    const W = parseFloat(w)
    const H = parseFloat(h)
    if (!W || !H || W <= 0 || H <= 0) return null
    const ratio = W / H
    // 세로형(H>W) 입력은 세로 황금비(W:H = 1:1.618)를 기준으로 비교·제안
    const portrait = H > W
    const target = portrait ? 1 / PHI : PHI
    const diffPct = ((ratio - target) / target) * 100
    // 가장 가까운 단순비 찾기
    const simple = findSimpleRatio(W, H)
    // 황금 비율 제안 (방향 유지)
    const suggestWKeepH = portrait ? H / PHI : H * PHI
    const suggestHKeepW = portrait ? W * PHI : W / PHI
    return {
      ratio,
      diffPct,
      simple,
      suggestWKeepH,
      suggestHKeepW,
      portrait,
    }
  }, [w, h])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>가로·세로 입력</div>
        <div className={styles.inputGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="golden-ratio-f4">가로 (W)</label>
            <div className={styles.inputRow}>
              <input id="golden-ratio-f4"
                className={styles.numInput}
                type="number" inputMode="decimal"
                placeholder="1920"
                value={w} onChange={e => setW(e.target.value)}
              />
              <span className={styles.unit}>{unit}</span>
            </div>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="golden-ratio-f5">세로 (H)</label>
            <div className={styles.inputRow}>
              <input id="golden-ratio-f5"
                className={styles.numInput}
                type="number" inputMode="decimal"
                placeholder="1080"
                value={h} onChange={e => setH(e.target.value)}
              />
              <span className={styles.unit}>{unit}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className={styles.fieldLabel} style={{ marginBottom: 6 }}>단위</div>
          <div className={styles.selectRow}>
            {RATIO_UNITS.map(u => (
              <button
                key={u} type="button" aria-pressed={unit === u}
                className={`${styles.selectBtn} ${unit === u ? styles.selectBtnActive : ''}`}
                onClick={() => setUnit(u)}
              >{u}</button>
            ))}
          </div>
        </div>
      </div>

      {result ? (
        <div className={styles.resultCard} role="status">
          <div className={styles.heroRow}>
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>현재 비율 (W:H)</div>
              <div className={styles.heroNum}>{result.simple.approx && <span className={styles.heroUnit}>≈ </span>}{result.simple.a}<span className={styles.heroUnit}>:</span>{result.simple.b}</div>
            </div>
            <div className={styles.heroDivider} />
            <div className={styles.heroBlock}>
              <div className={styles.heroLabel}>소수 비율</div>
              <div className={styles.heroNum}>{fmt(result.ratio, decimals)}</div>
            </div>
          </div>

          <div className={styles.diffRow}>
            <span className={styles.diffLabel}>황금 비율({result.portrait ? '세로형 1:1.618' : '가로형 1.618:1'}) 대비 차이</span>
            <span className={`${styles.diffValue} ${Math.abs(result.diffPct) < 1 ? styles.diffValueGood : ''}`}>
              {result.diffPct >= 0 ? '+' : ''}{fmt(result.diffPct, 2)}%
            </span>
          </div>

          <div className={styles.suggestList}>
            <div className={styles.suggestItem}>
              <span className={styles.suggestLabel}>세로(H) 유지 시 가로(W) 제안</span>
              <span className={styles.suggestNum}>{fmt(result.suggestWKeepH, decimals)} {unit}</span>
            </div>
            <div className={styles.suggestItem}>
              <span className={styles.suggestLabel}>가로(W) 유지 시 세로(H) 제안</span>
              <span className={styles.suggestNum}>{fmt(result.suggestHKeepW, decimals)} {unit}</span>
            </div>
          </div>
          <p className={styles.stdNote}>
            * 가로형(W≥H)은 W/H ≈ 1.618, 세로형(H&gt;W)은 H/W ≈ 1.618(스토리·릴스 방향)을 기준으로 비교·제안합니다. 차이 0%에 가까울수록 황금 비율에 근접합니다.
          </p>
        </div>
      ) : (
        <div className={styles.empty}>가로·세로를 입력하면 현재 비율과 황금 비율과의 차이를 계산합니다</div>
      )}
    </div>
  )
}

/* 최대공약수로 단순비 구하기 (소수 포함 대응). 항이 100을 넘으면(예: 1.618×1 → 809:500)
   분모 1~40 중 상대오차 0.5% 이내 최소 분모의 근사비(≈ 13:8)로 폴백 */
function findSimpleRatio(w: number, h: number): { a: number; b: number; approx: boolean } {
  const scale = 1000
  const W = Math.round(w * scale)
  const H = Math.round(h * scale)
  const g = gcd(W, H)
  const a = Math.round(W / g)
  const b = Math.round(H / g)
  if (Math.max(a, b) <= 100) return { a, b, approx: false }
  const r = w / h
  let best = { a, b, err: Infinity }
  for (let den = 1; den <= 40; den++) {
    const num = Math.round(r * den)
    if (num < 1) continue
    const err = Math.abs(num / den - r) / r
    if (err <= 0.005) return { a: num, b: den, approx: true }
    if (err < best.err) best = { a: num, b: den, err }
  }
  return { a: best.a, b: best.b, approx: true }
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/* ──────────────────────── 탭 3: 황금 나선 시각화 ──────────────────────── */
function SpiralTab() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const svgRef = useRef<SVGSVGElement>(null)

  const unit = 18 // 1 유닛 = 18px

  // 사각형 배치 (원점 좌상단, 단위 u = 18px):
  //  21: 13..34,  0..21    13: 0..13,  0..13    8: 0..8, 13..21    5: 8..13, 16..21
  //   3: 10..13, 13..16     2: 8..10, 13..15   1a: 8..9, 15..16   1b: 9..10, 15..16
  //
  // 황금 나선은 8개의 사분원 호가 접선 연속으로 이어진 하나의 path.
  // 각 호는 해당 사각형의 한 꼭짓점에 중심을 두고, 인접 두 꼭짓점을 잇는 90° 호.
  const squares = useMemo(() => {
    const u = unit
    const placements: { x: number; y: number; size: number; label: number }[] = [
      { x: 13 * u, y: 0,      size: 21 * u, label: 21 },
      { x: 0,      y: 0,      size: 13 * u, label: 13 },
      { x: 0,      y: 13 * u, size: 8 * u,  label: 8  },
      { x: 8 * u,  y: 16 * u, size: 5 * u,  label: 5  },
      { x: 10 * u, y: 13 * u, size: 3 * u,  label: 3  },
      { x: 8 * u,  y: 13 * u, size: 2 * u,  label: 2  },
      { x: 8 * u,  y: 15 * u, size: 1 * u,  label: 1  },
      { x: 9 * u,  y: 15 * u, size: 1 * u,  label: 1  },
    ]
    // 모든 사분원: large-arc-flag=0, sweep-flag=0 (나선이 사각형 바깥쪽으로 휘어짐)
    const spiralPath = [
      `M ${34 * u} ${21 * u}`,
      `A ${21 * u} ${21 * u} 0 0 0 ${13 * u} 0`,
      `A ${13 * u} ${13 * u} 0 0 0 0 ${13 * u}`,
      `A ${8 * u} ${8 * u} 0 0 0 ${8 * u} ${21 * u}`,
      `A ${5 * u} ${5 * u} 0 0 0 ${13 * u} ${16 * u}`,
      `A ${3 * u} ${3 * u} 0 0 0 ${10 * u} ${13 * u}`,
      `A ${2 * u} ${2 * u} 0 0 0 ${8 * u} ${15 * u}`,
      `A ${1 * u} ${1 * u} 0 0 0 ${9 * u} ${16 * u}`,
      `A ${1 * u} ${1 * u} 0 0 0 ${10 * u} ${15 * u}`,
    ].join(' ')
    return { placements, spiralPath, vbW: 34 * u, vbH: 21 * u }
  }, [])

  const bg = theme === 'dark' ? '#141414' : '#F0EFE8'
  const stroke = theme === 'dark' ? '#0EA5E9' : '#1F1F1F'
  const squareStroke = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'
  const textColor = theme === 'dark' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)'

  const handleDownload = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    const scale = 2
    // width="100%" 그대로 직렬화하면 Safari·Firefox에서 래스터화가 실패/0크기가 될 수 있어
    // 클론에 명시적 픽셀 크기를 부여하고 style(max-width)을 제거
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('width', String(squares.vbW * scale))
    clone.setAttribute('height', String(squares.vbH * scale))
    clone.removeAttribute('style')
    const svgStr = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = squares.vbW * scale
      canvas.height = squares.vbH * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); return }
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      const png = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = png
      link.download = `golden-spiral-${theme}.png`
      link.click()
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }, [bg, theme, squares.vbW, squares.vbH])

  return (
    <div className={styles.tabContent}>
      <div className={styles.spiralCard}>
        <div className={styles.spiralControls}>
          <div className={styles.spiralControlsLeft}>
            <span className={styles.fieldLabel}>테마</span>
            <button type="button" aria-pressed={theme === 'dark'}
              className={`${styles.selectBtn} ${theme === 'dark' ? styles.selectBtnActive : ''}`}
              onClick={() => setTheme('dark')}
            >다크</button>
            <button type="button" aria-pressed={theme === 'light'}
              className={`${styles.selectBtn} ${theme === 'light' ? styles.selectBtnActive : ''}`}
              onClick={() => setTheme('light')}
            >라이트</button>
          </div>
          <div className={styles.spiralControlsRight}>
            <button type="button" className={styles.downloadBtn} onClick={handleDownload}>
              PNG 저장
            </button>
          </div>
        </div>

        <div className={`${styles.spiralSvgWrap} ${theme === 'light' ? styles.spiralLightBg : ''}`}>
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${squares.vbW} ${squares.vbH}`}
            width="100%"
            style={{ maxWidth: 640, background: bg }}
            preserveAspectRatio="xMidYMid meet"
          >
            <rect x={0} y={0} width={squares.vbW} height={squares.vbH} fill={bg} />
            {squares.placements.map((p, i) => (
              <g key={i}>
                <rect
                  x={p.x} y={p.y} width={p.size} height={p.size}
                  fill="none" stroke={squareStroke} strokeWidth={1}
                />
                <text
                  x={p.x + p.size / 2}
                  y={p.y + p.size / 2}
                  fill={textColor}
                  fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'
                  fontWeight={700}
                  fontSize={Math.max(p.size * 0.22, 9)}
                  textAnchor="middle"
                  dominantBaseline="central"
                >{p.label}</text>
              </g>
            ))}
            <path
              d={squares.spiralPath}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className={styles.stdNote}>
          피보나치 수(1, 1, 2, 3, 5, 8, 13, 21)로 구성된 황금 직사각형과 나선. 각 사각형의 변 길이 비율은 φ에 수렴합니다.
        </p>
      </div>
    </div>
  )
}

/* ──────────────────────── 메인 ──────────────────────── */
export default function GoldenRatioClient() {
  const [tab, setTab] = useState<'ratio' | 'convert' | 'spiral'>('ratio')
  const [decimals, setDecimals] = useState<Decimals>(2)

  return (
    <div className={styles.wrap}>
      {/* 파이 값 표시 & 소수점 선택 */}
      <div className={styles.phiBadge}>
        <div>
          <div className={styles.phiBadgeLabel}>φ (피, phi) 고정값</div>
          <div className={styles.phiBadgeValue}>1.6180339887</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className={styles.fieldLabel}>소수점</span>
          {[0, 1, 2, 3].map(d => (
            <button
              key={d} type="button" aria-pressed={decimals === d}
              aria-label={`소수점 ${d}자리`}
              className={`${styles.selectBtn} ${decimals === d ? styles.selectBtnActive : ''}`}
              onClick={() => setDecimals(d as Decimals)}
            >{d}</button>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button type="button" aria-pressed={tab === 'ratio'} className={`${styles.tab} ${tab === 'ratio'   ? styles.tabActive : ''}`} onClick={() => setTab('ratio')}>
          황금 비율 계산
        </button>
        <button type="button" aria-pressed={tab === 'convert'} className={`${styles.tab} ${tab === 'convert' ? styles.tabActive : ''}`} onClick={() => setTab('convert')}>
          비율 변환
        </button>
        <button type="button" aria-pressed={tab === 'spiral'} className={`${styles.tab} ${tab === 'spiral'  ? styles.tabActive : ''}`} onClick={() => setTab('spiral')}>
          황금 나선
        </button>
      </div>

      {tab === 'ratio'   && <RatioTab decimals={decimals} />}
      {tab === 'convert' && <ConvertTab decimals={decimals} />}
      {tab === 'spiral'  && <SpiralTab />}

      {/* 비율 비교 시각화 (모든 탭 공통) */}
      <RatioCompareCard />
    </div>
  )
}

/* ──────────────────────── 비율 비교 시각화 ──────────────────────── */
/* tint: 바 배경용 hex(알파 접미), ink: 텍스트용 AA 안전 토큰. tint=null이면 중립 바 */
const RATIO_PRESETS: { name: string; ratio: number; sub: string; tint: string | null; ink: string }[] = [
  { name: '황금 비율',     ratio: 1.618, sub: 'φ — 디자인·예술',       tint: '#0EA5E9', ink: 'var(--accent-ink)' },
  { name: '백은 비율',     ratio: 1.414, sub: '√2 — A4·B5 종이',       tint: '#0891B2', ink: 'var(--cat-health)' },
  { name: '16:9 (HD)',     ratio: 1.778, sub: '유튜브·TV·모니터',       tint: '#A16207', ink: 'var(--cat-sports)' },
  { name: '4:3',           ratio: 1.333, sub: '구식 TV·아이패드',       tint: '#9333EA', ink: 'var(--cat-art)' },
  { name: '21:9',          ratio: 2.333, sub: '울트라와이드·시네마',     tint: '#E11D48', ink: 'var(--danger)' },
  { name: '3:2',           ratio: 1.500, sub: '카메라 사진(35mm)',      tint: '#059669', ink: 'var(--cat-finance)' },
  { name: '1:1',           ratio: 1.000, sub: '인스타 정사각·앨범 커버', tint: null,      ink: 'var(--text)' },
  { name: '9:16',          ratio: 0.563, sub: '스토리·릴스·틱톡(세로)', tint: '#EA580C', ink: 'var(--cat-life)' },
]

function RatioCompareCard() {
  // 같은 세로(고정 32px) 기준 가로 길이 비교. 바 폭은 트랙 대비 % — 가장 긴 21:9(2.333)가 100%
  const fixedHeight = 32
  const maxRatio = 2.333

  return (
    <div className={styles.compareCard}>
      <span className={styles.compareLabel}>비율 비교 시각화</span>
      <p className={styles.compareDesc}>
        같은 세로 높이 기준 가로 길이 비교. 황금 비율(φ = 1.618)의 균형감을 다른 표준 비율과 함께 확인하세요.
      </p>
      <div className={styles.compareList}>
        {RATIO_PRESETS.map(p => {
          return (
            <div key={p.name} className={styles.compareRow}>
              <div>
                <div className={styles.compareName}>{p.name}</div>
                <div className={styles.compareNameSub}>{p.sub}</div>
              </div>
              <div
                className={styles.compareBar}
                style={{
                  width: `${(p.ratio / maxRatio) * 100}%`,
                  background: p.tint ? `${p.tint}25` : 'var(--border)',
                  borderColor: p.tint ? `${p.tint}55` : 'var(--border-hover)',
                  height: fixedHeight,
                }}
              />
              <span className={styles.compareValue} style={{ color: p.ink }}>{p.ratio.toFixed(3)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
