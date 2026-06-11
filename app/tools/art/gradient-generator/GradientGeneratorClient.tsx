'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './gradient-generator.module.css'
import {
  type ColorSpace, type GradientType, type GradientConfig, type Stop, type FavItem,
  makeStop, buildCss, buildMeshCss, noiseSvgUrl,
  exportCss, exportTailwind, exportSvg, exportReact, exportSwiftUI, exportFlutter,
  analyzeContrast, colorblindStops, autoSuggestions,
  KOREAN_PRESETS, GLOBAL_PRESETS, presetToConfig,
  loadFavs, saveFavs,
  downloadGradientPng, downloadGradientSvg, extractColorsFromImage,
} from './gradientUtils'

type TabKey = 'create' | 'analyze' | 'presets'

const SPACES: { key: ColorSpace; label: string; tip: string }[] = [
  { key: 'rgb',   label: 'RGB',   tip: '단순·빠름. 중간색이 어두워질 수 있음' },
  { key: 'hsl',   label: 'HSL',   tip: '직관적·일러스트풍' },
  { key: 'oklch', label: 'OKLCH', tip: '지각 균등 — UI 권장 ★' },
  { key: 'lab',   label: 'LAB',   tip: '인쇄·정밀 색상' },
]

const TYPES: { key: GradientType; label: string }[] = [
  { key: 'linear',           label: 'Linear' },
  { key: 'radial',           label: 'Radial' },
  { key: 'conic',            label: 'Conic' },
  { key: 'mesh',             label: 'Mesh' },
  { key: 'repeating-linear', label: 'Linear 반복' },
  { key: 'repeating-radial', label: 'Radial 반복' },
]

const EXPORT_PREVIEWS = [
  { key: 'card',     label: '카드' },
  { key: 'button',   label: '버튼' },
  { key: 'hero',     label: '히어로' },
  { key: 'text',     label: '텍스트' },
  { key: 'border',   label: '보더' },
] as const

const EXPORT_SIZES = [
  { w: 1920, h: 1080, label: '1920×1080 (FHD)' },
  { w: 1080, h: 1080, label: '1080×1080 (Square)' },
  { w: 1200, h: 630,  label: '1200×630 (OG)' },
  { w: 1080, h: 1920, label: '1080×1920 (9:16)' },
]

/* 모듈 카운터 (favs ID) */
let _favIdCounter = 0
const nextFavId = () => `fav-${++_favIdCounter}-${Math.floor(performance.now())}`

const DEFAULT_CONFIG = (): GradientConfig => ({
  type:  'linear',
  space: 'oklch',
  angle: 135,
  shape: 'circle',
  stops: [makeStop('#E11D48', 0), makeStop('#7B82E0', 50), makeStop('#0891B2', 100)],
  mesh:  { tl: '#E11D48', tr: '#FFB938', bl: '#0891B2', br: '#7B82E0' },
  noise: 0,
})

export default function GradientGeneratorClient() {
  const [tab, setTab] = useState<TabKey>('create')
  const [cfg, setCfg] = useState<GradientConfig>(DEFAULT_CONFIG)
  const [activeStopId, setActiveStopId] = useState<string | null>(null)

  /* ── 그라디언트 미리보기 CSS ── */
  const previewBg = useMemo(() => {
    if (cfg.type === 'mesh' && cfg.mesh) return buildMeshCss(cfg.mesh)
    return buildCss(cfg)
  }, [cfg])

  const previewBgNative = useMemo(() => {
    if (cfg.type === 'mesh' && cfg.mesh) return buildMeshCss(cfg.mesh)
    return buildCss(cfg, { native: true })
  }, [cfg])

  /* ── stops 정렬 ── */
  const sortedStops = useMemo(() => [...cfg.stops].sort((a, b) => a.pos - b.pos), [cfg.stops])

  /* ── Stops 편집 ── */
  const addStopAt = (pos: number) => {
    if (cfg.stops.length >= 8) return
    // 그 위치의 색상은 현재 그라디언트 색상으로 추정
    const sorted = [...cfg.stops].sort((a, b) => a.pos - b.pos)
    let color = sorted[0]?.hex ?? '#888888'
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].pos <= pos && pos <= sorted[i + 1].pos) {
        const t = (pos - sorted[i].pos) / (sorted[i + 1].pos - sorted[i].pos)
        color = t < 0.5 ? sorted[i].hex : sorted[i + 1].hex
        break
      }
    }
    if (pos > sorted[sorted.length - 1].pos) color = sorted[sorted.length - 1].hex
    const ns = makeStop(color, Math.round(pos))
    setCfg({ ...cfg, stops: [...cfg.stops, ns] })
    setActiveStopId(ns.id)
  }
  const removeStop = (id: string) => {
    if (cfg.stops.length <= 2) return
    setCfg({ ...cfg, stops: cfg.stops.filter((s) => s.id !== id) })
    if (activeStopId === id) setActiveStopId(null)
  }
  const updateStop = (id: string, patch: Partial<Stop>) => {
    setCfg({
      ...cfg,
      stops: cfg.stops.map((s) => s.id === id ? { ...s, ...patch } : s),
    })
  }

  /* ── 그라디언트 바 클릭 → 새 stop ── */
  const barRef = useRef<HTMLDivElement>(null)
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    addStopAt(pos)
  }

  /* ── 드래그 ── */
  const draggingId = useRef<string | null>(null)
  const onStopMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    draggingId.current = id
    setActiveStopId(id)
  }
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingId.current || !barRef.current) return
      const rect = barRef.current.getBoundingClientRect()
      const pos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const id = draggingId.current
      setCfg((prev) => ({
        ...prev,
        stops: prev.stops.map((s) => s.id === id ? { ...s, pos: Math.round(pos) } : s),
      }))
    }
    const onUp = () => { draggingId.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  /* ── 출력 코드 ── */
  const codes = useMemo(() => ({
    css:      exportCss(cfg),
    tailwind: exportTailwind(cfg),
    svg:      exportSvg(cfg),
    react:    exportReact(cfg),
    swift:    exportSwiftUI(cfg),
    flutter:  exportFlutter(cfg),
  }), [cfg])

  const [activeCode, setActiveCode] = useState<keyof typeof codes>('css')
  const [copied, setCopied] = useState<string | null>(null)
  const copyCode = async (key: keyof typeof codes) => {
    try {
      await navigator.clipboard.writeText(codes[key])
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch { /* 권한 거부 */ }
  }

  /* ── 분석 (Tab 2) ── */
  const contrast = useMemo(() => analyzeContrast(cfg.stops, cfg.space), [cfg.stops, cfg.space])

  const cbStops = useMemo(() => ({
    protanopia:   colorblindStops(cfg.stops, 'protanopia'),
    deuteranopia: colorblindStops(cfg.stops, 'deuteranopia'),
    tritanopia:   colorblindStops(cfg.stops, 'tritanopia'),
  }), [cfg.stops])

  /* ── 자동 추천 (1색 기준) ── */
  const [autoBase, setAutoBase] = useState('#0891B2')
  const suggestions = useMemo(() => autoSuggestions(autoBase), [autoBase])

  /* ── 즐겨찾기 ── */
  const [favs, setFavs] = useState<FavItem[]>([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setFavs(loadFavs())
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    saveFavs(favs)
  }, [favs, mounted])

  const addToFavs = () => {
    if (favs.length >= 30) return
    const item: FavItem = {
      id: nextFavId(),
      name: `그라디언트 ${favs.length + 1}`,
      config: cfg,
      savedAt: Date.now(),
    }
    setFavs([item, ...favs])
  }
  const removeFav = (id: string) => setFavs(favs.filter((f) => f.id !== id))
  const applyFav = (item: FavItem) => setCfg(item.config)

  /* ── 이미지에서 추출 ── */
  const fileRef = useRef<HTMLInputElement>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractedHexes, setExtractedHexes] = useState<string[]>([])
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setExtracting(true)
    try {
      const hexes = await extractColorsFromImage(file, 5)
      setExtractedHexes(hexes)
    } finally {
      setExtracting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }
  const applyExtracted = () => {
    if (extractedHexes.length === 0) return
    const stops = extractedHexes.map((hex, i) =>
      makeStop(hex, Math.round((i / Math.max(1, extractedHexes.length - 1)) * 100)),
    )
    setCfg({ ...cfg, stops })
  }

  /* ── 내보내기 ── */
  const [exportSize, setExportSize] = useState(0)
  const [exportNoise, setExportNoise] = useState(true)
  const handlePngDownload = async () => {
    const s = EXPORT_SIZES[exportSize]
    await downloadGradientPng(cfg, s.w, s.h, exportNoise)
  }
  const handleSvgDownload = () => {
    const s = EXPORT_SIZES[exportSize]
    downloadGradientSvg(cfg, s.w, s.h)
  }

  /* ── 미리보기 컴포넌트 ── */
  const [previewKind, setPreviewKind] = useState<typeof EXPORT_PREVIEWS[number]['key']>('card')

  return (
    <div className={styles.wrap}>
      {/* 면책 / 가이드 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/art/color', label: '색상 변환' },
          { href: '/tools/art/gradient-generator', label: '그라디언트' },
          { href: '/tools/art/golden-ratio', label: '황금 비율' }
        ]}
      >
        사용 가이드 <strong>OKLCH</strong>는 인지적으로 가장 균등한 색공간 — UI 그라디언트에 권장 <strong>Mesh</strong>는 표준이 아니므로 export는 multi-radial-gradient로 출력 <strong>Conic</strong>은 Figma 미지원 (Linear/Radial 권장)
      </Disclaimer>

      {/* ── 탭 ── */}
      <div className={styles.tabs}>
        {([
          { k: 'create',  l: '🎨 만들기' },
          { k: 'analyze', l: '🔍 분석·접근성' },
          { k: 'presets', l: '📚 프리셋' },
        ] as const).map((t) => (
          <button key={t.k} className={`${styles.tab} ${tab === t.k ? styles.tabActive : ''}`} onClick={() => setTab(t.k)}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1: 만들기 ══════════ */}
      {tab === 'create' && (
        <div className={styles.panel}>
          {/* 메인 미리보기 */}
          <section>
            <div
              className={styles.mainPreview}
              style={{
                backgroundImage: cfg.noise > 0 ? `${noiseSvgUrl(cfg.noise)}, ${previewBg}` : previewBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className={styles.mainPreviewBadge}>
                {cfg.type.toUpperCase()} · {cfg.space.toUpperCase()}
              </div>
            </div>
          </section>

          {/* 보간 모드 4종 비교 */}
          <section>
            <label className={styles.label}>보간 모드 비교 <span className={styles.labelSub}>(같은 stops · 다른 색공간)</span></label>
            <div className={styles.spaceCompare}>
              {SPACES.map((sp) => {
                const previewCfg = { ...cfg, space: sp.key }
                const bg = previewCfg.type === 'mesh' && previewCfg.mesh ? buildMeshCss(previewCfg.mesh) : buildCss(previewCfg)
                const active = cfg.space === sp.key
                return (
                  <button
                    key={sp.key}
                    className={`${styles.spaceCard} ${active ? styles.spaceCardActive : ''}`}
                    onClick={() => setCfg({ ...cfg, space: sp.key })}
                  >
                    <div className={styles.spaceCardSwatch} style={{ backgroundImage: bg }} />
                    <span className={styles.spaceCardLabel}>{sp.label}</span>
                    {active && <span className={styles.spaceCardTip}>{sp.tip}</span>}
                  </button>
                )
              })}
            </div>
          </section>

          {/* 그라디언트 유형 */}
          <section>
            <label className={styles.label}>그라디언트 유형</label>
            <div className={styles.typeRow}>
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  className={`${styles.typeBtn} ${cfg.type === t.key ? styles.typeBtnActive : ''}`}
                  onClick={() => setCfg({ ...cfg, type: t.key })}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {cfg.type === 'conic' && (
              <p className={styles.note}>⚠️ Conic gradient는 Figma에서 미지원. 디자인 툴 호환을 위해서는 Linear/Radial 권장.</p>
            )}
          </section>

          {/* 각도 / 모양 / 노이즈 */}
          <section className={styles.controls}>
            {(cfg.type === 'linear' || cfg.type === 'repeating-linear' || cfg.type === 'conic') && (
              <div className={styles.sliderRow}>
                <label>각도 <strong>{cfg.angle}°</strong></label>
                <input
                  type="range" min={0} max={360} step={1} value={cfg.angle}
                  onChange={(e) => setCfg({ ...cfg, angle: +e.target.value })}
                  className={styles.slider}
                />
              </div>
            )}
            {(cfg.type === 'radial' || cfg.type === 'repeating-radial') && (
              <div className={styles.pillRow}>
                <span className={styles.pillRowLabel}>모양</span>
                <button className={`${styles.pill} ${cfg.shape === 'circle' ? styles.pillActive : ''}`} onClick={() => setCfg({ ...cfg, shape: 'circle' })}>Circle</button>
                <button className={`${styles.pill} ${cfg.shape === 'ellipse' ? styles.pillActive : ''}`} onClick={() => setCfg({ ...cfg, shape: 'ellipse' })}>Ellipse</button>
              </div>
            )}
            <div className={styles.sliderRow}>
              <label>노이즈 <strong>{cfg.noise}%</strong></label>
              <input
                type="range" min={0} max={100} step={1} value={cfg.noise}
                onChange={(e) => setCfg({ ...cfg, noise: +e.target.value })}
                className={styles.slider}
              />
            </div>
          </section>

          {/* Mesh 4 모서리 색상 */}
          {cfg.type === 'mesh' && cfg.mesh && (
            <section>
              <label className={styles.label}>Mesh 4 모서리 색상</label>
              <div className={styles.meshGrid}>
                {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                  <div key={corner} className={styles.meshCornerCard}>
                    <span className={styles.meshCornerLabel}>{corner.toUpperCase()}</span>
                    <input
                      type="color"
                      value={cfg.mesh![corner]}
                      onChange={(e) => setCfg({ ...cfg, mesh: { ...cfg.mesh!, [corner]: e.target.value.toUpperCase() } })}
                      className={styles.colorPicker}
                    />
                    <input
                      type="text"
                      value={cfg.mesh![corner]}
                      onChange={(e) => {
                        const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setCfg({ ...cfg, mesh: { ...cfg.mesh!, [corner]: v.toUpperCase() } })
                      }}
                      className={styles.hexInput}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Stops 편집기 (mesh 외) */}
          {cfg.type !== 'mesh' && (
            <section>
              <div className={styles.stopsHead}>
                <label className={styles.label}>컬러 Stops <span className={styles.labelSub}>({cfg.stops.length}/8 · 바 클릭으로 추가)</span></label>
                {cfg.stops.length < 8 && (
                  <button className={styles.smallBtn} onClick={() => addStopAt(50)}>+ Stop 추가</button>
                )}
              </div>
              <div
                ref={barRef}
                className={styles.stopBar}
                style={{ backgroundImage: previewBgNative }}
                onClick={handleBarClick}
                role="presentation"
              >
                {sortedStops.map((s) => (
                  <div
                    key={s.id}
                    className={`${styles.stopMarker} ${activeStopId === s.id ? styles.stopMarkerActive : ''}`}
                    style={{ left: `${s.pos}%`, background: s.hex }}
                    onMouseDown={(e) => onStopMouseDown(e, s.id)}
                    onClick={(e) => { e.stopPropagation(); setActiveStopId(s.id) }}
                  />
                ))}
              </div>
              <div className={styles.stopList}>
                {sortedStops.map((s) => (
                  <div key={s.id} className={`${styles.stopItem} ${activeStopId === s.id ? styles.stopItemActive : ''}`}>
                    <input
                      type="color"
                      value={s.hex}
                      onChange={(e) => updateStop(s.id, { hex: e.target.value.toUpperCase() })}
                      className={styles.colorPicker}
                      aria-label="색상 선택"
                    />
                    <input
                      type="text"
                      value={s.hex}
                      onChange={(e) => {
                        const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value
                        if (/^#[0-9a-fA-F]{0,6}$/.test(v)) updateStop(s.id, { hex: v.toUpperCase() })
                      }}
                      className={styles.hexInput}
                      maxLength={7}
                    />
                    <input
                      type="number" inputMode="decimal"
                      min={0} max={100} step={1}
                      value={s.pos}
                      onChange={(e) => updateStop(s.id, { pos: Math.max(0, Math.min(100, +e.target.value || 0)) })}
                      className={styles.posInput}
                      aria-label="위치 %"
                    />
                    <span className={styles.posUnit}>%</span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeStop(s.id)}
                      disabled={cfg.stops.length <= 2}
                      aria-label="stop 제거"
                    >✕</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 미리보기 컴포넌트 */}
          <section>
            <label className={styles.label}>실용 미리보기</label>
            <div className={styles.pillRow}>
              {EXPORT_PREVIEWS.map((p) => (
                <button
                  key={p.key}
                  className={`${styles.pill} ${previewKind === p.key ? styles.pillActive : ''}`}
                  onClick={() => setPreviewKind(p.key)}
                >{p.label}</button>
              ))}
            </div>
            <div className={styles.previewWrap}>
              {previewKind === 'card' && (
                <div className={styles.previewCard} style={{ backgroundImage: cfg.noise > 0 ? `${noiseSvgUrl(cfg.noise)}, ${previewBg}` : previewBg }}>
                  <h3>그라디언트 카드</h3>
                  <p>제목 + 부제 가독성 확인용</p>
                </div>
              )}
              {previewKind === 'button' && (
                <div className={styles.previewBtnWrap}>
                  <button className={styles.previewBtn} style={{ backgroundImage: previewBg }}>버튼 텍스트</button>
                  <button className={styles.previewBtn} style={{ backgroundImage: previewBg, color: '#000' }}>검정 텍스트</button>
                </div>
              )}
              {previewKind === 'hero' && (
                <div className={styles.previewHero} style={{ backgroundImage: cfg.noise > 0 ? `${noiseSvgUrl(cfg.noise)}, ${previewBg}` : previewBg }}>
                  <p className={styles.previewHeroEyebrow}>HEADLINE</p>
                  <h2>그라디언트 히어로 섹션</h2>
                  <p>긴 본문 텍스트의 가독성을 확인합니다. 다양한 크기의 글자가 그라디언트 위에서 어떻게 보이는지 점검하세요.</p>
                </div>
              )}
              {previewKind === 'text' && (
                <div className={styles.previewTextWrap}>
                  <h2 className={styles.previewText} style={{ backgroundImage: previewBg }}>GRADIENT TEXT</h2>
                  <h3 className={styles.previewText} style={{ backgroundImage: previewBg }}>그라디언트 텍스트</h3>
                </div>
              )}
              {previewKind === 'border' && (
                <div className={styles.previewBorderWrap}>
                  <div className={styles.previewBorder} style={{ borderImageSource: previewBg }}>
                    <p>그라디언트 보더</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 출력 코드 */}
          <section>
            <label className={styles.label}>코드 복사 <span className={styles.labelSub}>(6포맷)</span></label>
            <div className={styles.codeTabs}>
              {(Object.keys(codes) as Array<keyof typeof codes>).map((k) => (
                <button
                  key={k}
                  className={`${styles.codeTab} ${activeCode === k ? styles.codeTabActive : ''}`}
                  onClick={() => setActiveCode(k)}
                >
                  {k.toUpperCase()}
                </button>
              ))}
            </div>
            <div className={styles.codeBox}>
              <button className={styles.copyBtn} onClick={() => copyCode(activeCode)}>
                {copied === activeCode ? '✓ 복사됨' : '📋 복사'}
              </button>
              <pre className={styles.codePre}>{codes[activeCode]}</pre>
            </div>
            {activeCode === 'tailwind' && (
              <p className={styles.note}>💡 Tailwind 4+ arbitrary value · 운영 코드는 <code>theme.extend.backgroundImage</code>에 등록 권장.</p>
            )}
            {activeCode === 'swift' && cfg.type === 'mesh' && (
              <p className={styles.note}>⚠️ MeshGradient는 iOS 18+ / macOS 15+. 미만 버전은 LinearGradient로 폴백 필요.</p>
            )}
            {activeCode === 'flutter' && cfg.type === 'mesh' && (
              <p className={styles.note}>⚠️ Flutter는 mesh gradient 표준 미지원 — 4 RadialGradient Stack으로 흉내.</p>
            )}
          </section>

          {/* 내보내기 (PNG/SVG) + 저장 */}
          <section className={styles.optionCard}>
            <p className={styles.gapTitle}>📥 이미지 내보내기 + 즐겨찾기</p>
            <div className={styles.exportRow}>
              <select className={styles.select} value={exportSize} onChange={(e) => setExportSize(+e.target.value)}>
                {EXPORT_SIZES.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
              </select>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={exportNoise} onChange={(e) => setExportNoise(e.target.checked)} />
                <span>노이즈 포함</span>
              </label>
            </div>
            <div className={styles.exportBtns}>
              <button className={styles.primaryBtn} onClick={handlePngDownload}>PNG 다운로드</button>
              <button className={styles.secondaryBtn} onClick={handleSvgDownload}>SVG 다운로드</button>
              <button className={styles.secondaryBtn} onClick={addToFavs} disabled={favs.length >= 30}>
                ⭐ 즐겨찾기 ({favs.length}/30)
              </button>
            </div>
            {mounted && favs.length > 0 && (
              <div className={styles.favList}>
                {favs.map((f) => {
                  const bg = f.config.type === 'mesh' && f.config.mesh ? buildMeshCss(f.config.mesh) : buildCss(f.config)
                  return (
                    <div key={f.id} className={styles.favItem}>
                      <button className={styles.favSwatch} style={{ backgroundImage: bg }} onClick={() => applyFav(f)} aria-label={`${f.name} 적용`} />
                      <button className={styles.favRemove} onClick={() => removeFav(f.id)} aria-label="삭제">✕</button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ══════════ TAB 2: 분석·접근성 ══════════ */}
      {tab === 'analyze' && (
        <div className={styles.panel}>
          <section>
            <div
              className={styles.mainPreview}
              style={{ backgroundImage: cfg.noise > 0 ? `${noiseSvgUrl(cfg.noise)}, ${previewBg}` : previewBg }}
            />
          </section>

          {/* WCAG */}
          <section>
            <label className={styles.label}>WCAG 대비비 <span className={styles.labelSub}>(전 구간 worst-case)</span></label>
            <div className={styles.contrastGrid}>
              <div className={styles.contrastCard}>
                <p className={styles.contrastLabel}>흰 텍스트</p>
                <p className={styles.contrastRatio}>{contrast.whiteRatio.toFixed(2)} : 1</p>
                <p className={styles.contrastGrade} data-grade={contrast.whiteGrade.level.toLowerCase().replace(' ', '-')}>{contrast.whiteGrade.level}</p>
                <p className={styles.contrastNote}>{contrast.whiteGrade.aa_normal ? '✓ 본문 통과' : contrast.whiteGrade.aa_large ? '큰 글자만 통과' : '✗ 미통과'}</p>
              </div>
              <div className={styles.contrastCard}>
                <p className={styles.contrastLabel}>검은 텍스트</p>
                <p className={styles.contrastRatio}>{contrast.blackRatio.toFixed(2)} : 1</p>
                <p className={styles.contrastGrade} data-grade={contrast.blackGrade.level.toLowerCase().replace(' ', '-')}>{contrast.blackGrade.level}</p>
                <p className={styles.contrastNote}>{contrast.blackGrade.aa_normal ? '✓ 본문 통과' : contrast.blackGrade.aa_large ? '큰 글자만 통과' : '✗ 미통과'}</p>
              </div>
            </div>
            <p className={styles.contrastTip}>
              💡 추천 텍스트 색상: <strong>{contrast.bestText === 'white' ? '흰색' : '검정'}</strong>
              {' · '}최난색 구간: <code style={{ background: contrast.worstSampleHex, color: contrast.bestText, padding: '2px 6px', borderRadius: 4 }}>{contrast.worstSampleHex}</code> ({contrast.worstSampleAt.toFixed(0)}%)
            </p>
          </section>

          {/* 색맹 시뮬 */}
          <section>
            <label className={styles.label}>색맹 시뮬레이션</label>
            <div className={styles.cbGrid}>
              {(['protanopia', 'deuteranopia', 'tritanopia'] as const).map((type) => {
                const simCfg = { ...cfg, stops: cbStops[type] }
                const bg = buildCss(simCfg)
                return (
                  <div key={type} className={styles.cbCard}>
                    <div className={styles.cbSwatch} style={{ backgroundImage: bg }} />
                    <p className={styles.cbLabel}>{type === 'protanopia' ? '적색맹 (1형)' : type === 'deuteranopia' ? '녹색맹 (2형)' : '청색맹 (3형)'}</p>
                    <p className={styles.cbDesc}>{type === 'protanopia' ? '인구 1%' : type === 'deuteranopia' ? '인구 5% (가장 흔함)' : '인구 0.01%'}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* 이미지에서 추출 */}
          <section className={styles.optionCard}>
            <p className={styles.gapTitle}>🖼️ 이미지에서 색상 추출 → 그라디언트</p>
            <p className={styles.note}>이미지는 <strong>브라우저 내에서만 처리</strong>되며 서버로 전송되지 않습니다 (K-means 5색 추출).</p>
            <div className={styles.uploadRow}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className={styles.fileInput} />
              {extracting && <span className={styles.note}>추출 중…</span>}
            </div>
            {extractedHexes.length > 0 && (
              <>
                <div className={styles.extractedRow}>
                  {extractedHexes.map((hex) => (
                    <div key={hex} className={styles.extractedSwatch} style={{ background: hex }}>
                      <span>{hex}</span>
                    </div>
                  ))}
                </div>
                <button className={styles.primaryBtn} onClick={applyExtracted}>이 색상으로 그라디언트 만들기</button>
              </>
            )}
          </section>
        </div>
      )}

      {/* ══════════ TAB 3: 프리셋 ══════════ */}
      {tab === 'presets' && (
        <div className={styles.panel}>
          {/* 자동 추천 */}
          <section className={styles.optionCard}>
            <p className={styles.gapTitle}>🎯 1색에서 자동 생성</p>
            <div className={styles.autoRow}>
              <input
                type="color"
                value={autoBase}
                onChange={(e) => setAutoBase(e.target.value.toUpperCase())}
                className={styles.colorPicker}
              />
              <input
                type="text"
                value={autoBase}
                onChange={(e) => {
                  const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setAutoBase(v.toUpperCase())
                }}
                className={styles.hexInput}
                maxLength={7}
              />
              <span className={styles.note}>← 베이스 색상 선택</span>
            </div>
            <div className={styles.suggestGrid}>
              {suggestions.map((s) => {
                const bg = `linear-gradient(135deg, ${s.stops.map((x) => `${x.hex} ${x.pos}%`).join(', ')})`
                return (
                  <button
                    key={s.label}
                    className={styles.suggestCard}
                    onClick={() => setCfg({ ...cfg, stops: s.stops, type: cfg.type === 'mesh' ? 'linear' : cfg.type })}
                  >
                    <div className={styles.suggestSwatch} style={{ backgroundImage: bg }} />
                    <span className={styles.suggestLabel}>{s.label}</span>
                    <span className={styles.suggestDesc}>{s.desc}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* 한국 프리셋 */}
          <PresetGroup title="🇰🇷 한국 무드" subtitle={`${KOREAN_PRESETS.length}종 · 계절·풍경·트렌드`} presets={KOREAN_PRESETS} onApply={(p) => setCfg({ ...cfg, ...presetToConfig(p) })} />

          {/* 글로벌 프리셋 */}
          <PresetGroup title="🌐 글로벌 트렌드" subtitle={`${GLOBAL_PRESETS.length}종 · 부드러운·Retro·UI·파스텔`} presets={GLOBAL_PRESETS} onApply={(p) => setCfg({ ...cfg, ...presetToConfig(p) })} />
        </div>
      )}
    </div>
  )
}

/* ───────── 프리셋 그룹 컴포넌트 ───────── */
function PresetGroup({ title, subtitle, presets, onApply }: {
  title: string
  subtitle: string
  presets: typeof KOREAN_PRESETS
  onApply: (p: typeof KOREAN_PRESETS[number]) => void
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof presets>()
    for (const p of presets) {
      const arr = map.get(p.category) ?? []
      arr.push(p)
      map.set(p.category, arr)
    }
    return Array.from(map.entries())
  }, [presets])

  return (
    <section>
      <p className={styles.presetGroupTitle}>{title} <span className={styles.labelSub}>{subtitle}</span></p>
      {grouped.map(([cat, list]) => (
        <div key={cat} className={styles.presetCatBlock}>
          <p className={styles.presetCatLabel}>{cat}</p>
          <div className={styles.presetGrid}>
            {list.map((p) => {
              const bg = `linear-gradient(135deg, ${p.stops.map(([h, pos]) => `${h} ${pos}%`).join(', ')})`
              return (
                <button key={p.id} className={styles.presetCard} onClick={() => onApply(p)}>
                  <div className={styles.presetSwatch} style={{ backgroundImage: bg }} />
                  <span className={styles.presetName}>{p.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
