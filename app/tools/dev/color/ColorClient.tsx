'use client'

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './color.module.css'
import {
  hexToRgb, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, rgbToCmyk, rgbToHwb,
  rgbToLab, rgbToOklch,
  formatHex, formatHexa, formatRgb, formatRgba, formatHsl, formatHsla,
  formatHsv, formatCmyk, formatHwb, formatLab, formatOklch,
  contrastRatio, wcagGrade, suggestPassingColor,
  simulateColorblind, type ColorblindType,
  complementary, analogous, triadic, tetradic, splitComplement,
  monochromatic, shades, tailwindScale, lerpRgb, gradientSteps,
  rgbDistance, getKoreanColorName, darken, desaturate,
  type RGB, type HSL,
} from './colorUtils'
import { TAILWIND_COLORS, BRAND_COLORS, GRADIENT_PRESETS } from './tailwindColors'

/* ───────── 타입 ───────── */
type Tab = 'convert' | 'a11y' | 'palette' | 'css' | 'gradient' | 'extract'
type PaletteType =
  | 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'splitComplement'
  | 'monochromatic' | 'shades' | 'tailwind'
type ExportFormat = 'css' | 'tailwind' | 'json' | 'scss'
type GradientType = 'linear' | 'radial' | 'conic'

const PRESETS = [
  { name: '빨강',     hex: '#EF4444' },
  { name: '주황',     hex: '#F97316' },
  { name: '노랑',     hex: '#EAB308' },
  { name: '연두',     hex: '#84CC16' },
  { name: '초록',     hex: '#22C55E' },
  { name: '청록',     hex: '#14B8A6' },
  { name: '하늘',     hex: '#0EA5E9' },
  { name: '파랑',     hex: '#3B82F6' },
  { name: '보라',     hex: '#A855F7' },
  { name: '분홍',     hex: '#EC4899' },
  { name: '검정',     hex: '#000000' },
  { name: '흰색',     hex: '#FFFFFF' },
  { name: '아이보리', hex: '#FFFFF0' },
  { name: '회색',     hex: '#737373' },
  { name: 'Toolify',  hex: '#3EC8FF' },
  { name: '액센트',   hex: '#C8FF3E' },
]

/* localStorage 히스토리 */
const STORAGE_KEY = 'youtil-color-history-v2'
function loadHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.slice(0, 24) : []
  } catch {
    return []
  }
}
function saveHistory(items: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 24)))
  } catch {/* ignore */}
}

/* 클립보드 훅 */
function useCopy(): [string | null, (key: string, text: string) => void] {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = (key: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    })
  }
  return [copiedKey, copy]
}

/* ═════════════════════════════════════════ Main ═════════════════════════════════════════ */
export default function ColorClient() {
  const [tab, setTab] = useState<Tab>('convert')
  const [hex, setHex] = useState('#3EC8FF')
  const [alpha, setAlpha] = useState(100)
  const [history, setHistory] = useState<string[]>([])
  const [copiedKey, copy] = useCopy()

  const rgb: RGB = useMemo(() => {
    const r = hexToRgb(hex) ?? { r: 62, g: 200, b: 255, a: 1 }
    return { ...r, a: alpha / 100 }
  }, [hex, alpha])
  const hsl: HSL = useMemo(() => rgbToHsl(rgb), [rgb])
  const hsv = useMemo(() => rgbToHsv(rgb), [rgb])
  const cmyk = useMemo(() => rgbToCmyk(rgb), [rgb])
  const hwb = useMemo(() => rgbToHwb(rgb), [rgb])
  const lab = useMemo(() => rgbToLab(rgb), [rgb])
  const oklch = useMemo(() => rgbToOklch(rgb), [rgb])
  const colorName = useMemo(() => getKoreanColorName(rgb), [rgb])

  /* 히스토리 초기화·추가 */
  useEffect(() => { setHistory(loadHistory()) }, [])
  useEffect(() => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return
    const upper = hex.toUpperCase()
    setHistory(prev => {
      const filtered = prev.filter(h => h.toUpperCase() !== upper)
      const next = [upper, ...filtered].slice(0, 24)
      saveHistory(next)
      return next
    })
  }, [hex])

  /* 입력 핸들러 */
  const handleHex = (v: string) => {
    const cleaned = v.startsWith('#') ? v : '#' + v
    setHex(cleaned)
  }
  const handlePicker = (v: string) => setHex(v.toUpperCase())

  /* ═════════════════════════════════════════ Render ═════════════════════════════════════════ */
  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        💡 <strong>참고용 색상 분석 도구</strong> — WCAG 대비비는 W3C 공식 기준 계산이며 실제 접근성은 다양한 환경 테스트가 필요합니다. 색맹 시뮬레이션은 표준 행렬 변환 기반의 근사치이며 실제 색각 이상자의 인식과 차이가 있을 수 있습니다.
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {([
          ['convert',  '코드 변환'],
          ['a11y',     '접근성'],
          ['palette',  '팔레트'],
          ['css',      'CSS·Tailwind'],
          ['gradient', '그라디언트'],
          ['extract',  '색상 추출'],
        ] as [Tab, string][]).map(([key, label]) => {
          const activeClass =
            tab !== key ? '' :
            key === 'a11y'     ? styles.tabActiveA11y :
            key === 'palette'  ? styles.tabActivePalette :
            key === 'css'      ? styles.tabActiveCss :
            key === 'gradient' ? styles.tabActiveGradient :
            key === 'extract'  ? styles.tabActiveExtract :
            styles.tabActive
          return (
            <button key={key}
              className={`${styles.tabBtn} ${activeClass}`}
              onClick={() => setTab(key)}>
              {label}
            </button>
          )
        })}
      </div>

      {tab === 'convert'  && <ConvertTab hex={hex} alpha={alpha} setAlpha={setAlpha} setHex={handlePicker} setHexRaw={handleHex}
                                          rgb={rgb} hsl={hsl} hsv={hsv} cmyk={cmyk} hwb={hwb} lab={lab} oklch={oklch}
                                          colorName={colorName} history={history} copiedKey={copiedKey} copy={copy} />}
      {tab === 'a11y'     && <A11yTab initialHex={hex} copiedKey={copiedKey} copy={copy} />}
      {tab === 'palette'  && <PaletteTab hex={hex} setHex={setHex} copiedKey={copiedKey} copy={copy} />}
      {tab === 'css'      && <CssTab hex={hex} setHex={setHex} copiedKey={copiedKey} copy={copy} />}
      {tab === 'gradient' && <GradientTab copiedKey={copiedKey} copy={copy} />}
      {tab === 'extract'  && <ExtractTab copiedKey={copiedKey} copy={copy} />}
    </div>
  )
}

/* ═════════════════════════════════════════ 탭 1: 코드 변환 ═════════════════════════════════════════ */
type ConvertTabProps = {
  hex: string
  alpha: number
  setAlpha: (n: number) => void
  setHex: (v: string) => void
  setHexRaw: (v: string) => void
  rgb: RGB
  hsl: HSL
  hsv: ReturnType<typeof rgbToHsv>
  cmyk: ReturnType<typeof rgbToCmyk>
  hwb: ReturnType<typeof rgbToHwb>
  lab: ReturnType<typeof rgbToLab>
  oklch: ReturnType<typeof rgbToOklch>
  colorName: ReturnType<typeof getKoreanColorName>
  history: string[]
  copiedKey: string | null
  copy: (key: string, text: string) => void
}
function ConvertTab(p: ConvertTabProps) {
  const formats: { key: string; label: string; value: string }[] = [
    { key: 'hex',   label: 'HEX',   value: formatHex(p.rgb) },
    { key: 'hexa',  label: 'HEXA',  value: formatHexa(p.rgb) },
    { key: 'rgb',   label: 'RGB',   value: formatRgb(p.rgb) },
    { key: 'rgba',  label: 'RGBA',  value: formatRgba(p.rgb) },
    { key: 'hsl',   label: 'HSL',   value: formatHsl(p.hsl) },
    { key: 'hsla',  label: 'HSLA',  value: formatHsla(p.hsl) },
    { key: 'hsv',   label: 'HSV',   value: formatHsv(p.hsv) },
    { key: 'hwb',   label: 'HWB',   value: formatHwb(p.hwb) },
    { key: 'cmyk',  label: 'CMYK',  value: formatCmyk(p.cmyk) },
    { key: 'lab',   label: 'LAB',   value: formatLab(p.lab) },
    { key: 'oklch', label: 'OKLCH', value: formatOklch(p.oklch) },
    { key: 'raw',   label: '십진',  value: `${p.rgb.r}, ${p.rgb.g}, ${p.rgb.b}` },
  ]

  // 미리보기 텍스트 색상 (배경 명도에 따라)
  const previewTextColor = useMemo(() => {
    return (0.299 * p.rgb.r + 0.587 * p.rgb.g + 0.114 * p.rgb.b) / 255 > 0.5 ? '#000' : '#FFF'
  }, [p.rgb])

  return (
    <>
      {/* 큰 미리보기 + 입력 */}
      <div className={styles.card}>
        <div className={styles.bigPreviewWrap}>
          <div className={styles.bigPreview}>
            <div className={styles.bigPreviewInner} style={{ background: formatRgba(p.rgb) }} />
            <div className={styles.bigPreviewHex} style={{ color: previewTextColor }}>
              {formatHex(p.rgb)}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input className={styles.colorPicker} type="color"
                value={p.hex} onChange={e => p.setHex(e.target.value)} />
              <input className={styles.hexInput} type="text"
                value={p.hex.toUpperCase()}
                onChange={e => p.setHexRaw(e.target.value)}
                placeholder="#000000" maxLength={9} spellCheck={false} />
            </div>
            <div>
              <span className={styles.subLabel}>알파 ({p.alpha}%)</span>
              <div className={styles.alphaSliderWrap} style={{ color: formatHex(p.rgb) }}>
                <input className={styles.alphaSlider} type="range" min={0} max={100}
                  value={p.alpha} onChange={e => p.setAlpha(parseInt(e.target.value))} />
                <span className={styles.alphaValue}>{p.alpha}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 형식별 결과 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          전체 형식
          <span className={styles.cardLabelHint}>클릭해 복사</span>
        </label>
        <div className={styles.formatTable}>
          {formats.map(f => (
            <div key={f.key} className={styles.formatRow}>
              <span className={styles.formatLabel}>{f.label}</span>
              <span className={styles.formatValue}>{f.value}</span>
              <button
                className={`${styles.miniCopyBtn} ${p.copiedKey === f.key ? styles.miniCopied : ''}`}
                onClick={() => p.copy(f.key, f.value)}>
                {p.copiedKey === f.key ? '✓' : '복사'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 색상 정보 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>색상 정보</label>
        <div className={styles.infoGrid}>
          <div className={styles.infoBox}>
            <div className={styles.infoBoxLabel}>한국어 이름</div>
            <div className={styles.infoBoxValue}>{p.colorName.name}</div>
          </div>
          <div className={styles.infoBox}>
            <div className={styles.infoBoxLabel}>계열</div>
            <div className={styles.infoBoxValue}>{p.colorName.family}</div>
          </div>
          <div className={styles.infoBox}>
            <div className={styles.infoBoxLabel}>톤</div>
            <div className={styles.infoBoxValue}>{p.colorName.tone}</div>
          </div>
          <div className={styles.infoBox}>
            <div className={styles.infoBoxLabel}>감성</div>
            <div className={styles.infoBoxValue}>{p.colorName.vibe}</div>
          </div>
        </div>
      </div>

      {/* 자주 쓰는 색상 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>자주 쓰는 색상</label>
        <div className={styles.presetGrid}>
          {PRESETS.map(item => {
            const active = p.hex.toUpperCase() === item.hex.toUpperCase()
            return (
              <button key={item.hex}
                className={`${styles.presetItem} ${active ? styles.presetActive : ''}`}
                style={{ background: item.hex }}
                onClick={() => p.setHex(item.hex)}
                title={`${item.name} (${item.hex})`}
                aria-label={`${item.name} ${item.hex}`} />
            )
          })}
        </div>
      </div>

      {/* 한국 브랜드 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>한국 브랜드 색상</label>
        <div className={styles.brandRow}>
          {BRAND_COLORS.map(b => (
            <button key={b.hex} className={styles.brandBtn}
              onClick={() => p.setHex(b.hex)}>
              <span className={styles.brandSwatch} style={{ background: b.hex }} />
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 히스토리 */}
      {p.history.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>최근 사용한 색상</label>
          <div className={styles.historyRow}>
            {p.history.map(h => (
              <button key={h} className={styles.historyChip}
                style={{ background: h }}
                onClick={() => p.setHex(h)}
                title={h} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/* ═════════════════════════════════════════ 탭 2: 접근성 ═════════════════════════════════════════ */
type A11yTabProps = {
  initialHex: string
  copiedKey: string | null
  copy: (key: string, text: string) => void
}
function A11yTab({ initialHex, copiedKey, copy }: A11yTabProps) {
  const [textHex, setTextHex] = useState(initialHex)
  const [bgHex, setBgHex]   = useState('#FFFFFF')

  const textRgb = useMemo(() => hexToRgb(textHex) ?? { r: 0, g: 0, b: 0 }, [textHex])
  const bgRgb   = useMemo(() => hexToRgb(bgHex)   ?? { r: 255, g: 255, b: 255 }, [bgHex])
  const ratio   = useMemo(() => contrastRatio(textRgb, bgRgb), [textRgb, bgRgb])
  const grade   = useMemo(() => wcagGrade(ratio), [ratio])

  const swap = () => {
    const t = textHex
    setTextHex(bgHex)
    setBgHex(t)
  }

  // 자동 통과 색상 (AA 4.5)
  const suggested = useMemo(() => {
    if (grade.aa_normal) return null
    return suggestPassingColor(textRgb, bgRgb, 4.5)
  }, [textRgb, bgRgb, grade.aa_normal])

  const interpretation = useMemo(() => {
    if (ratio >= 7)   return { msg: '대비비가 매우 우수합니다. 모든 텍스트 크기와 UI에서 사용 가능합니다.', color: '#3EFF9B' }
    if (ratio >= 4.5) return { msg: '일반 텍스트(AA)와 큰 텍스트(AAA) 기준을 통과합니다. 충분한 가독성입니다.', color: '#C8FF3E' }
    if (ratio >= 3)   return { msg: '큰 텍스트(18pt+)나 UI 컴포넌트에는 사용 가능하지만 본문 텍스트로는 부족합니다.', color: '#FFD700' }
    return                   { msg: '대비비가 낮아 가독성이 떨어집니다. 일반 본문에는 권장하지 않습니다.', color: '#FF6B6B' }
  }, [ratio])

  // 색맹 시뮬레이션 — 두 색상 동시 변환
  const cbModes: { type: ColorblindType; label: string; hint: string }[] = [
    { type: 'protanopia',    label: '적색맹 (Protanopia)',    hint: '남성 약 1%' },
    { type: 'deuteranopia',  label: '녹색맹 (Deuteranopia)',  hint: '남성 약 1%, 가장 흔함' },
    { type: 'tritanopia',    label: '청색맹 (Tritanopia)',    hint: '매우 드뭄' },
    { type: 'achromatopsia', label: '전색맹 (Achromatopsia)', hint: '흑백만' },
  ]

  return (
    <>
      {/* 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          텍스트·배경 색상
          <button className={styles.swapBtn} onClick={swap}>↔ 스왑</button>
        </label>
        <div className={styles.a11yInputRow}>
          <div className={styles.a11yInputBox}>
            <input className={styles.a11yPicker} type="color"
              value={textHex} onChange={e => setTextHex(e.target.value)} />
            <input className={styles.a11yHexInput} type="text"
              value={textHex.toUpperCase()}
              onChange={e => setTextHex(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)}
              placeholder="텍스트 색상" maxLength={7} />
          </div>
          <div className={styles.a11yInputBox}>
            <input className={styles.a11yPicker} type="color"
              value={bgHex} onChange={e => setBgHex(e.target.value)} />
            <input className={styles.a11yHexInput} type="text"
              value={bgHex.toUpperCase()}
              onChange={e => setBgHex(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)}
              placeholder="배경 색상" maxLength={7} />
          </div>
        </div>
      </div>

      {/* 미리보기 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>실제 미리보기</label>
        <div className={styles.a11yPreview} style={{ background: bgHex, color: textHex }}>
          <div className={styles.a11yPreviewBig}>큰 제목 18pt+</div>
          <div className={styles.a11yPreviewBody}>본문 텍스트 16pt — 가독성 확인용 한글 샘플 ABC 123 가나다 라마바</div>
          <div className={styles.a11yPreviewSmall}>작은 텍스트 13pt — 캡션이나 부가 정보에 사용되는 작은 글씨</div>
        </div>
      </div>

      {/* 대비비 결과 */}
      <div className={styles.contrastHero}>
        <div className={styles.contrastValue}
          style={{ color: grade.level === 'AAA' || grade.level === 'AA' ? '#3EFF9B' : grade.level === 'AA Large' ? '#FFD700' : '#FF6B6B' }}>
          {ratio.toFixed(2)} : 1
        </div>
        <div className={styles.contrastLabel}>WCAG 대비비 — 등급 {grade.level}</div>
        <p style={{ marginTop: 12, fontSize: 13, color: interpretation.color, lineHeight: 1.6 }}>
          {interpretation.msg}
        </p>
      </div>

      {/* 등급 표 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>WCAG 등급 통과 여부</label>
        <div className={styles.gradeTable}>
          {[
            { name: 'AAA · 일반 텍스트',  req: '7 : 1',   pass: grade.aaa_normal },
            { name: 'AA · 일반 텍스트',   req: '4.5 : 1', pass: grade.aa_normal },
            { name: 'AAA · 큰 텍스트 18pt+', req: '4.5 : 1', pass: grade.aaa_large },
            { name: 'AA · 큰 텍스트 18pt+',  req: '3 : 1',   pass: grade.aa_large },
            { name: 'UI 컴포넌트',         req: '3 : 1',   pass: grade.ui },
          ].map((row, i) => (
            <div key={i} className={styles.gradeRow}>
              <span className={styles.gradeName}>{row.name}</span>
              <span className={styles.gradeReq}>{row.req}</span>
              <span className={row.pass ? styles.gradePass : styles.gradeFailChip}>
                {row.pass ? '✓ 통과' : '✕ 미달'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 자동 통과 색상 추천 */}
      {suggested && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>AA 통과를 위한 텍스트 색상 추천</label>
          <div className={styles.suggestRow}>
            <div className={styles.suggestSwatch}>
              <span className={styles.suggestColor} style={{ background: textHex }} />
              <span className={styles.suggestHex}>{textHex.toUpperCase()}</span>
            </div>
            <span className={styles.suggestArrow}>→</span>
            <div className={styles.suggestSwatch}>
              <span className={styles.suggestColor} style={{ background: rgbToHex(suggested) }} />
              <span className={styles.suggestHex}>{rgbToHex(suggested)}</span>
            </div>
            <button className={styles.actionBtn}
              onClick={() => setTextHex(rgbToHex(suggested))}>
              적용
            </button>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
            HSL 명도 단계만 조정해 4.5:1 통과를 만족하는 가장 가까운 색상입니다.
          </p>
        </div>
      )}

      {/* 색맹 시뮬레이션 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          색맹 시뮬레이션
          <span className={styles.cardLabelHint}>4가지 유형 동시 비교</span>
        </label>
        <div className={styles.cbGrid}>
          {cbModes.map(mode => {
            const cbText = simulateColorblind(textRgb, mode.type)
            const cbBg   = simulateColorblind(bgRgb, mode.type)
            const cbRatio = contrastRatio(cbText, cbBg)
            const distinct = cbRatio >= 3
            return (
              <div key={mode.type} className={styles.cbCard}>
                <div className={styles.cbCardLabel}>
                  <span>{mode.label}</span>
                  <span style={{ opacity: 0.7, fontWeight: 400 }}>{mode.hint}</span>
                </div>
                <div className={styles.cbPreview}
                  style={{ background: rgbToHex(cbBg), color: rgbToHex(cbText) }}>
                  Aa 가나다 ABC 123
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {cbRatio.toFixed(2)} : 1
                  </span>
                  <span className={distinct ? styles.cbDistinct : styles.cbWarning}>
                    {distinct ? '구분 가능' : '구분 어려움'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button
        className={`${styles.copyBtn} ${copiedKey === 'a11y-summary' ? styles.copied : ''}`}
        onClick={() => copy('a11y-summary',
          `텍스트: ${textHex}\n배경: ${bgHex}\n대비비: ${ratio.toFixed(2)}:1 (${grade.level})\nAA 일반: ${grade.aa_normal ? '통과' : '미달'}\nAA 큰 텍스트: ${grade.aa_large ? '통과' : '미달'}`
        )}>
        {copiedKey === 'a11y-summary' ? '✓ 복사됨' : '📋 분석 결과 복사'}
      </button>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 3: 팔레트 ═════════════════════════════════════════ */
type PaletteTabProps = {
  hex: string
  setHex: (h: string) => void
  copiedKey: string | null
  copy: (key: string, text: string) => void
}
function PaletteTab({ hex, setHex, copiedKey, copy }: PaletteTabProps) {
  const [type, setType] = useState<PaletteType>('tailwind')
  const [exportFmt, setExportFmt] = useState<ExportFormat>('css')

  const baseRgb = useMemo(() => hexToRgb(hex) ?? { r: 62, g: 200, b: 255 }, [hex])
  const baseHsl = useMemo(() => rgbToHsl(baseRgb), [baseRgb])

  /* 팔레트 계산 */
  const palette = useMemo(() => {
    switch (type) {
      case 'complementary':   return complementary(baseHsl)
      case 'analogous':       return analogous(baseHsl)
      case 'triadic':         return triadic(baseHsl)
      case 'tetradic':        return tetradic(baseHsl)
      case 'splitComplement': return splitComplement(baseHsl)
      case 'monochromatic':   return monochromatic(baseHsl, 5)
      case 'shades':          return shades(baseHsl, 5)
      default: return [] as HSL[]
    }
  }, [type, baseHsl])

  const tailwindResult = useMemo(() => tailwindScale(baseHsl), [baseHsl])

  /* 내보내기 코드 */
  const exportCode = useMemo(() => {
    if (type === 'tailwind') {
      const entries = tailwindResult.map(s => [s.shade, s.hex] as const)
      if (exportFmt === 'css') {
        return ':root {\n' + entries.map(([s, h]) => `  --color-primary-${s}: ${h.toLowerCase()};`).join('\n') + '\n}'
      }
      if (exportFmt === 'tailwind') {
        return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n${entries.map(([s, h]) => `          '${s}': '${h.toLowerCase()}',`).join('\n')}\n        },\n      },\n    },\n  },\n}`
      }
      if (exportFmt === 'scss') {
        return entries.map(([s, h]) => `$primary-${s}: ${h.toLowerCase()};`).join('\n')
      }
      // json
      return JSON.stringify(Object.fromEntries(entries.map(([s, h]) => [s, h.toLowerCase()])), null, 2)
    }
    // 일반 팔레트
    const hexes = palette.map(h => rgbToHex(hslToRgb(h)).toLowerCase())
    if (exportFmt === 'css') {
      return ':root {\n' + hexes.map((h, i) => `  --color-${i + 1}: ${h};`).join('\n') + '\n}'
    }
    if (exportFmt === 'tailwind') {
      return `// tailwind.config.js\nmodule.exports = {\n  theme: { extend: { colors: {\n${hexes.map((h, i) => `    'color-${i + 1}': '${h}',`).join('\n')}\n  } } }\n}`
    }
    if (exportFmt === 'scss') {
      return hexes.map((h, i) => `$color-${i + 1}: ${h};`).join('\n')
    }
    return JSON.stringify(hexes, null, 2)
  }, [type, exportFmt, palette, tailwindResult])

  return (
    <>
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          기준 색상
          <span className={styles.cardLabelHint}>{hex.toUpperCase()}</span>
        </label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input className={styles.colorPicker} type="color"
            value={hex} onChange={e => setHex(e.target.value.toUpperCase())} />
          <input className={styles.hexInput} type="text"
            value={hex.toUpperCase()}
            onChange={e => setHex(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)}
            maxLength={7} />
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>팔레트 유형</label>
        <div className={styles.paletteTypeGrid}>
          {([
            ['tailwind',        '🎨', 'Tailwind 스케일', '11단계'],
            ['complementary',   '⚖️', '보색',           '180°'],
            ['analogous',       '🌊', '유사색',         '±30°'],
            ['triadic',         '🔺', '삼각',           '120°'],
            ['tetradic',        '🟦', '사각',           '90°'],
            ['splitComplement', '✂️', '분할 보색',      '+150°'],
            ['monochromatic',   '🌗', '단색 (명도)',    '5단계'],
            ['shades',          '💧', '음영 (채도)',    '5단계'],
          ] as [PaletteType, string, string, string][]).map(([key, icon, label, hint]) => (
            <button key={key}
              className={`${styles.paletteTypeBtn} ${type === key ? styles.paletteTypeActive : ''}`}
              onClick={() => setType(key)}>
              <small>{icon}</small>
              <div>{label}</div>
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{hint}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {type === 'tailwind' ? (
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            Tailwind 11단계
            <span className={styles.cardLabelHint}>★ = 가장 가까운 단계</span>
          </label>
          <div className={styles.tailwindRow}>
            {tailwindResult.map(s => {
              const txtColor = (0.299 * s.rgb.r + 0.587 * s.rgb.g + 0.114 * s.rgb.b) / 255 > 0.5 ? '#000' : '#FFF'
              return (
                <button key={s.shade} className={styles.tailwindSwatch}
                  style={{ background: s.hex, color: txtColor }}
                  onClick={() => copy('tw-' + s.shade, s.hex)}
                  title={`${s.shade} · ${s.hex}`}>
                  {s.shade}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <label className={styles.cardLabel}>팔레트 색상 ({palette.length}개)</label>
          <div className={styles.paletteSwatchRow}>
            {palette.map((h, i) => {
              const rgb = hslToRgb(h)
              const hex = rgbToHex(rgb)
              const txtColor = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.5 ? '#000' : '#FFF'
              return (
                <button key={i}
                  className={styles.paletteSwatch}
                  style={{ background: hex, color: txtColor }}
                  onClick={() => copy('p-' + i, hex)}>
                  <span className={styles.paletteSwatchHex}>{hex.toUpperCase()}</span>
                  <span className={styles.paletteSwatchShade}>{i + 1}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 내보내기 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>내보내기 형식</label>
        <div className={styles.exportRow}>
          {([
            ['css',      'CSS 변수'],
            ['tailwind', 'Tailwind'],
            ['scss',     'SCSS'],
            ['json',     'JSON'],
          ] as [ExportFormat, string][]).map(([key, label]) => (
            <button key={key}
              className={`${styles.exportBtn} ${exportFmt === key ? styles.exportActive : ''}`}
              onClick={() => setExportFmt(key)}>
              {label}
            </button>
          ))}
        </div>
        <pre className={styles.codeBlock} style={{ marginTop: 12 }}>{exportCode}</pre>
        <button
          className={`${styles.copyBtn} ${copiedKey === 'pal-export' ? styles.copied : ''}`}
          style={{ marginTop: 10 }}
          onClick={() => copy('pal-export', exportCode)}>
          {copiedKey === 'pal-export' ? '✓ 복사됨' : '📋 코드 복사'}
        </button>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 4: CSS·Tailwind ═════════════════════════════════════════ */
type CssTabProps = {
  hex: string
  setHex: (h: string) => void
  copiedKey: string | null
  copy: (key: string, text: string) => void
}
function CssTab({ hex, setHex, copiedKey, copy }: CssTabProps) {
  const [colorName, setColorName] = useState('primary')

  const baseRgb = useMemo(() => hexToRgb(hex) ?? { r: 62, g: 200, b: 255 }, [hex])
  const baseHsl = useMemo(() => rgbToHsl(baseRgb), [baseRgb])

  /* CSS 변수 코드 */
  const cssVars = useMemo(() => {
    const scale = tailwindScale(baseHsl)
    const lines = scale.map(s => `  --color-${colorName}-${s.shade}: ${s.hex.toLowerCase()};`).join('\n')
    return `:root {\n${lines}\n\n  --color-${colorName}: ${rgbToHex(baseRgb).toLowerCase()};\n  --color-${colorName}-rgb: ${baseRgb.r} ${baseRgb.g} ${baseRgb.b};\n  --color-${colorName}-hsl: ${baseHsl.h} ${baseHsl.s}% ${baseHsl.l}%;\n}`
  }, [baseHsl, baseRgb, colorName])

  /* Tailwind config 코드 */
  const tailwindConfig = useMemo(() => {
    const scale = tailwindScale(baseHsl)
    const entries = scale.map(s => `        '${s.shade}': '${s.hex.toLowerCase()}',`).join('\n')
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${colorName}: {\n${entries}\n        },\n      },\n    },\n  },\n}`
  }, [baseHsl, colorName])

  /* Tailwind 가장 가까운 색 */
  const tailwindMatches = useMemo(() => {
    const candidates: { name: string; hex: string; distance: number }[] = []
    for (const [colorKey, shades] of Object.entries(TAILWIND_COLORS)) {
      for (const [shade, h] of Object.entries(shades)) {
        const tRgb = hexToRgb(h)!
        candidates.push({ name: `${colorKey}-${shade}`, hex: h, distance: rgbDistance(baseRgb, tRgb) })
      }
    }
    return candidates.sort((a, b) => a.distance - b.distance).slice(0, 5)
  }, [baseRgb])

  /* UI 상태 */
  const uiStates = useMemo(() => {
    const base    = baseHsl
    const hover   = darken(base, 8)
    const active  = darken(base, 15)
    const disabledRgb = hslToRgb(desaturate({ ...base, l: 70 }, 50))
    return [
      { name: 'Base',      hsl: base,   hex: rgbToHex(hslToRgb(base)) },
      { name: 'Hover',     hsl: hover,  hex: rgbToHex(hslToRgb(hover)) },
      { name: 'Active',    hsl: active, hex: rgbToHex(hslToRgb(active)) },
      { name: 'Focus Ring',hsl: base,   hex: rgbToHex(hslToRgb(base)) + '40' },
      { name: 'Disabled',  hsl: base,   hex: rgbToHex(disabledRgb) },
    ]
  }, [baseHsl])

  const uiCss = useMemo(() => {
    return `.btn-${colorName} {\n  background: ${uiStates[0].hex.toLowerCase()};\n  color: white;\n}\n.btn-${colorName}:hover {\n  background: ${uiStates[1].hex.toLowerCase()};\n}\n.btn-${colorName}:active {\n  background: ${uiStates[2].hex.toLowerCase()};\n}\n.btn-${colorName}:focus-visible {\n  box-shadow: 0 0 0 3px ${uiStates[3].hex.toLowerCase()};\n}\n.btn-${colorName}:disabled {\n  background: ${uiStates[4].hex.toLowerCase()};\n  cursor: not-allowed;\n}`
  }, [uiStates, colorName])

  /* 시맨틱 색상 (베이스 색상 기준) */
  const semantic = useMemo(() => {
    return [
      { label: 'Primary', hex: rgbToHex(baseRgb) },
      { label: 'Info',    hex: '#3B82F6' },
      { label: 'Success', hex: '#22C55E' },
      { label: 'Warning', hex: '#F59E0B' },
      { label: 'Error',   hex: '#EF4444' },
      { label: 'Neutral', hex: '#737373' },
    ]
  }, [baseRgb])

  return (
    <>
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          색상 이름 (CSS 변수 prefix)
        </label>
        <input className={styles.colorNameInput} type="text"
          value={colorName} onChange={e => setColorName(e.target.value.replace(/[^a-zA-Z0-9-]/g, '') || 'primary')}
          placeholder="primary" maxLength={20} />
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>
          기준 색상
          <span className={styles.cardLabelHint}>{hex.toUpperCase()}</span>
        </label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input className={styles.colorPicker} type="color"
            value={hex} onChange={e => setHex(e.target.value.toUpperCase())} />
          <input className={styles.hexInput} type="text"
            value={hex.toUpperCase()}
            onChange={e => setHex(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)}
            maxLength={7} />
        </div>
      </div>

      {/* CSS 변수 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>CSS 변수 (11단계)</label>
        <pre className={styles.codeBlock}>{cssVars}</pre>
        <button
          className={`${styles.copyBtn} ${copiedKey === 'css-vars' ? styles.copied : ''}`}
          style={{ marginTop: 10 }}
          onClick={() => copy('css-vars', cssVars)}>
          {copiedKey === 'css-vars' ? '✓ 복사됨' : '📋 CSS 변수 복사'}
        </button>
      </div>

      {/* Tailwind config */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>Tailwind config</label>
        <pre className={styles.codeBlock}>{tailwindConfig}</pre>
        <button
          className={`${styles.copyBtn} ${copiedKey === 'tw-config' ? styles.copied : ''}`}
          style={{ marginTop: 10 }}
          onClick={() => copy('tw-config', tailwindConfig)}>
          {copiedKey === 'tw-config' ? '✓ 복사됨' : '📋 Tailwind 설정 복사'}
        </button>
      </div>

      {/* Tailwind 가장 가까운 색 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>가장 가까운 Tailwind 색상</label>
        <div className={styles.tailwindMatchList}>
          {tailwindMatches.map((m, i) => (
            <div key={i} className={styles.tailwindMatchRow}>
              <span className={styles.tailwindMatchSwatch} style={{ background: m.hex }} />
              <div>
                <div className={styles.tailwindMatchName}>{m.name}</div>
                <div className={styles.tailwindMatchHex}>{m.hex}</div>
              </div>
              <span className={styles.tailwindMatchDist}>거리 {Math.round(m.distance)}</span>
              <button
                className={`${styles.miniCopyBtn} ${copiedKey === 'tw-' + i ? styles.miniCopied : ''}`}
                onClick={() => copy('tw-' + i, m.name)}>
                {copiedKey === 'tw-' + i ? '✓' : '복사'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* UI 상태 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>UI 상태 자동 생성</label>
        <div className={styles.uiStatesTable}>
          {uiStates.map((s, i) => (
            <div key={i} className={styles.uiStateRow}>
              <span className={styles.uiStateName}>{s.name}</span>
              <span className={styles.uiStateSwatch} style={{ background: s.hex }} />
              <span className={styles.uiStateCode}>{s.hex.toUpperCase()}</span>
              <button
                className={`${styles.miniCopyBtn} ${copiedKey === 'ui-' + i ? styles.miniCopied : ''}`}
                onClick={() => copy('ui-' + i, s.hex)}>
                {copiedKey === 'ui-' + i ? '✓' : '복사'}
              </button>
            </div>
          ))}
        </div>
        <pre className={styles.codeBlock} style={{ marginTop: 12 }}>{uiCss}</pre>
        <button
          className={`${styles.copyBtn} ${copiedKey === 'ui-css' ? styles.copied : ''}`}
          style={{ marginTop: 10 }}
          onClick={() => copy('ui-css', uiCss)}>
          {copiedKey === 'ui-css' ? '✓ 복사됨' : '📋 UI CSS 복사'}
        </button>
      </div>

      {/* 시맨틱 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>시맨틱 색상 세트</label>
        <div className={styles.semanticGrid}>
          {semantic.map((s, i) => (
            <div key={i} className={styles.semanticBox}>
              <span className={styles.semanticSwatch} style={{ background: s.hex }} />
              <span className={styles.semanticLabel}>{s.label}</span>
              <span className={styles.semanticHex}>{s.hex}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 5: 그라디언트 ═════════════════════════════════════════ */
function GradientTab({ copiedKey, copy }: { copiedKey: string | null; copy: (k: string, t: string) => void }) {
  const [stops, setStops] = useState<{ hex: string; pos: number }[]>([
    { hex: '#3EC8FF', pos: 0 },
    { hex: '#A855F7', pos: 100 },
  ])
  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(135)

  const cssGradient = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos)
    const stopStr = sorted.map(s => `${s.hex.toLowerCase()} ${s.pos}%`).join(', ')
    if (type === 'radial') return `radial-gradient(circle, ${stopStr})`
    if (type === 'conic')  return `conic-gradient(from ${angle}deg, ${stopStr})`
    return `linear-gradient(${angle}deg, ${stopStr})`
  }, [stops, type, angle])

  const steps10 = useMemo(() => gradientSteps(stops, 10), [stops])

  const updateStop = (i: number, patch: Partial<{ hex: string; pos: number }>) => {
    setStops(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))
  }
  const addStop = () => {
    if (stops.length >= 5) return
    const sorted = [...stops].sort((a, b) => a.pos - b.pos)
    const last = sorted[sorted.length - 1]
    const second = sorted[sorted.length - 2]
    const newPos = Math.round((last.pos + second.pos) / 2)
    const newHex = rgbToHex(lerpRgb(hexToRgb(second.hex)!, hexToRgb(last.hex)!, 0.5))
    setStops([...stops, { hex: newHex, pos: newPos }])
  }
  const removeStop = (i: number) => {
    if (stops.length <= 2) return
    setStops(stops.filter((_, idx) => idx !== i))
  }

  const cssVariations = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.pos - b.pos)
    const stopStr = sorted.map(s => `${s.hex.toLowerCase()} ${s.pos}%`).join(', ')
    return `/* 다양한 형식 */
background: linear-gradient(${angle}deg, ${stopStr});
background: linear-gradient(to right, ${sorted.map(s => s.hex.toLowerCase()).join(', ')});
background: radial-gradient(circle, ${stopStr});
background: conic-gradient(from 0deg, ${stopStr});`
  }, [stops, angle])

  return (
    <>
      <div className={styles.card}>
        <label className={styles.cardLabel}>미리보기</label>
        <div className={styles.gradPreview} style={{ background: cssGradient }} />
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>그라디언트 종류</label>
        <div className={styles.gradTypeRow}>
          {([
            ['linear', '직선'],
            ['radial', '원형'],
            ['conic',  '원뿔'],
          ] as [GradientType, string][]).map(([key, label]) => (
            <button key={key}
              className={`${styles.gradTypeBtn} ${type === key ? styles.gradTypeActive : ''}`}
              onClick={() => setType(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {(type === 'linear' || type === 'conic') && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            각도
            <span className={styles.cardLabelHint}>{angle}°</span>
          </label>
          <div className={styles.gradAngleRow}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>0°</span>
            <input className={styles.gradAngleSlider} type="range" min={0} max={360}
              value={angle} onChange={e => setAngle(parseInt(e.target.value))} />
            <span className={styles.gradAngleValue}>{angle}°</span>
          </div>
        </div>
      )}

      <div className={styles.card}>
        <label className={styles.cardLabel}>
          색상 정지점 ({stops.length}/5)
        </label>
        <div className={styles.gradStopList}>
          {stops.map((s, i) => (
            <div key={i} className={styles.gradStopRow}>
              <input className={styles.gradStopPicker} type="color"
                value={s.hex} onChange={e => updateStop(i, { hex: e.target.value.toUpperCase() })} />
              <input className={styles.gradStopHex} type="text"
                value={s.hex.toUpperCase()}
                onChange={e => updateStop(i, { hex: e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value })}
                maxLength={7} />
              <input type="number" className={styles.gradStopHex} min={0} max={100}
                style={{ textAlign: 'right' }}
                value={s.pos} onChange={e => updateStop(i, { pos: parseInt(e.target.value) || 0 })} />
              <button className={styles.gradStopRemove}
                disabled={stops.length <= 2}
                onClick={() => removeStop(i)}>
                ✕
              </button>
            </div>
          ))}
        </div>
        {stops.length < 5 && (
          <button className={styles.gradAddBtn} onClick={addStop} style={{ marginTop: 8 }}>
            + 색상 추가
          </button>
        )}
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>CSS 코드</label>
        <pre className={styles.codeBlock}>{`background: ${cssGradient};`}</pre>
        <button
          className={`${styles.copyBtn} ${copiedKey === 'grad-css' ? styles.copied : ''}`}
          style={{ marginTop: 10 }}
          onClick={() => copy('grad-css', `background: ${cssGradient};`)}>
          {copiedKey === 'grad-css' ? '✓ 복사됨' : '📋 CSS 복사'}
        </button>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>10단계 색상 미리보기</label>
        <div className={styles.gradStepsRow}>
          {steps10.map((rgb, i) => {
            const hex = rgbToHex(rgb)
            const txtColor = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255 > 0.5 ? '#000' : '#FFF'
            return (
              <button key={i} className={styles.gradStep}
                style={{ background: hex, color: txtColor }}
                onClick={() => copy('step-' + i, hex)}
                title={hex}>
                {hex.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>다양한 CSS 형식</label>
        <pre className={styles.codeBlock}>{cssVariations}</pre>
        <button
          className={`${styles.copyBtn} ${copiedKey === 'grad-vars' ? styles.copied : ''}`}
          style={{ marginTop: 10 }}
          onClick={() => copy('grad-vars', cssVariations)}>
          {copiedKey === 'grad-vars' ? '✓ 복사됨' : '📋 모든 형식 복사'}
        </button>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>인기 그라디언트 프리셋</label>
        <div className={styles.gradPresetGrid}>
          {GRADIENT_PRESETS.map(p => {
            const sorted = [...p.stops].sort((a, b) => a.pos - b.pos)
            const stopStr = sorted.map(s => `${s.hex} ${s.pos}%`).join(', ')
            const bg = `linear-gradient(${p.angle}deg, ${stopStr})`
            return (
              <button key={p.name} className={styles.gradPresetCard}
                style={{ background: bg }}
                onClick={() => { setStops(p.stops); setAngle(p.angle); setType('linear') }}>
                {p.name}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

/* ═════════════════════════════════════════ 탭 6: 색상 추출 ═════════════════════════════════════════ */
function ExtractTab({ copiedKey, copy }: { copiedKey: string | null; copy: (k: string, t: string) => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<{ hex: string; pct: number; rgb: RGB }[]>([])
  const [count, setCount] = useState(5)
  const [dragActive, setDragActive] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지는 5MB 이하로 업로드해 주세요.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result as string
      setImageUrl(url)
    }
    reader.readAsDataURL(file)
  }, [])

  // 이미지 로드 후 추출
  useEffect(() => {
    if (!imageUrl) { setExtracted([]); return }
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 100
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, 100, 100)
      const data = ctx.getImageData(0, 0, 100, 100).data

      const buckets = new Map<string, number>()
      const total = (data.length / 4) | 0
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3]
        if (a < 128) continue
        const r = Math.floor(data[i] / 24) * 24
        const g = Math.floor(data[i + 1] / 24) * 24
        const b = Math.floor(data[i + 2] / 24) * 24
        const key = `${r},${g},${b}`
        buckets.set(key, (buckets.get(key) || 0) + 1)
      }
      const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, count)
      const result = sorted.map(([key, cnt]) => {
        const [r, g, b] = key.split(',').map(Number)
        return {
          rgb: { r, g, b } as RGB,
          hex: rgbToHex({ r, g, b }),
          pct: Math.round((cnt / total) * 100),
        }
      })
      setExtracted(result)
    }
    img.src = imageUrl
  }, [imageUrl, count])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  /* 자동 분류 */
  const classification = useMemo(() => {
    if (extracted.length === 0) return null
    // 비율 큰 + 채도 낮은 → 배경
    let bg = extracted[0]
    let bgScore = -Infinity
    for (const c of extracted) {
      const hsl = rgbToHsl(c.rgb)
      const score = c.pct - hsl.s * 0.3
      if (score > bgScore) { bgScore = score; bg = c }
    }
    // 비율 작은 + 채도 높은 → 포인트
    let accent = extracted[0]
    let accentScore = -Infinity
    for (const c of extracted) {
      if (c.hex === bg.hex) continue
      const hsl = rgbToHsl(c.rgb)
      const score = hsl.s - c.pct * 0.5
      if (score > accentScore) { accentScore = score; accent = c }
    }
    // 텍스트 후보 — 배경과 대비 가장 큰
    let text = extracted[0]
    let bestRatio = 0
    for (const c of extracted) {
      if (c.hex === bg.hex) continue
      const r = contrastRatio(c.rgb, bg.rgb)
      if (r > bestRatio) { bestRatio = r; text = c }
    }
    return { bg, accent, text, contrast: bestRatio }
  }, [extracted])

  const exportPalette = useMemo(() => {
    if (extracted.length === 0) return ''
    return ':root {\n' + extracted.map((c, i) => `  --color-${i + 1}: ${c.hex.toLowerCase()};`).join('\n') + '\n}'
  }, [extracted])

  return (
    <>
      <div className={styles.card}>
        <label className={styles.cardLabel}>이미지 업로드</label>
        <div
          className={`${styles.dropArea} ${dragActive ? styles.dropAreaActive : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}>
          <div className={styles.dropAreaIcon}>🖼️</div>
          <div className={styles.dropAreaText}>이미지를 드래그하거나 클릭해 업로드</div>
          <div className={styles.dropAreaHint}>JPG · PNG · WebP — 최대 5MB</div>
          <input ref={fileRef} type="file" accept="image/*" hidden
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      </div>

      {imageUrl && (
        <>
          <div className={styles.card}>
            <label className={styles.cardLabel}>원본 이미지</label>
            <div className={styles.imagePreviewWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.imagePreview} src={imageUrl} alt="업로드한 이미지" />
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>추출 색상 수</label>
            <div className={styles.exportRow}>
              {[3, 5, 8, 10].map(n => (
                <button key={n}
                  className={`${styles.exportBtn} ${count === n ? styles.exportActive : ''}`}
                  onClick={() => setCount(n)}>
                  {n}개
                </button>
              ))}
            </div>
          </div>

          {extracted.length > 0 && (
            <>
              <div className={styles.card}>
                <label className={styles.cardLabel}>
                  추출된 색상
                  <span className={styles.cardLabelHint}>비율순 · 클릭해 복사</span>
                </label>
                <div className={styles.extractedRow}>
                  {extracted.map((c, i) => {
                    const txtColor = (0.299 * c.rgb.r + 0.587 * c.rgb.g + 0.114 * c.rgb.b) / 255 > 0.5 ? '#000' : '#FFF'
                    return (
                      <button key={i} className={styles.extractedCard}
                        style={{ background: c.hex, color: txtColor }}
                        onClick={() => copy('ex-' + i, c.hex)}>
                        <span className={styles.extractedHex}>{c.hex.toUpperCase()}</span>
                        <span className={styles.extractedPct}>{c.pct}%</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {classification && (
                <div className={styles.card}>
                  <label className={styles.cardLabel}>자동 분류</label>
                  <div className={styles.classifyGrid}>
                    <div className={styles.classifyRow}>
                      <span className={styles.classifyLabel}>배경 후보</span>
                      <span className={styles.classifySwatch} style={{ background: classification.bg.hex }} />
                      <span className={styles.classifyHex}>{classification.bg.hex} · 비율 {classification.bg.pct}%</span>
                    </div>
                    <div className={styles.classifyRow}>
                      <span className={styles.classifyLabel}>포인트 후보</span>
                      <span className={styles.classifySwatch} style={{ background: classification.accent.hex }} />
                      <span className={styles.classifyHex}>{classification.accent.hex} · 채도 강조</span>
                    </div>
                    <div className={styles.classifyRow}>
                      <span className={styles.classifyLabel}>텍스트 후보</span>
                      <span className={styles.classifySwatch} style={{ background: classification.text.hex }} />
                      <span className={styles.classifyHex}>{classification.text.hex} · 대비 {classification.contrast.toFixed(2)}:1</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.card}>
                <label className={styles.cardLabel}>CSS 변수로 내보내기</label>
                <pre className={styles.codeBlock}>{exportPalette}</pre>
                <button
                  className={`${styles.copyBtn} ${copiedKey === 'ex-css' ? styles.copied : ''}`}
                  style={{ marginTop: 10 }}
                  onClick={() => copy('ex-css', exportPalette)}>
                  {copiedKey === 'ex-css' ? '✓ 복사됨' : '📋 CSS 복사'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  )
}
