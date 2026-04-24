'use client'

import { useState, useMemo, useEffect } from 'react'
import s from './css-converter.module.css'

type TabKey = 'length' | 'lineheight' | 'letterspacing' | 'aspect' | 'clamp' | 'time'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'length',        label: '길이 단위' },
  { key: 'lineheight',    label: 'line-height' },
  { key: 'letterspacing', label: 'letter-spacing' },
  { key: 'aspect',        label: 'aspect-ratio' },
  { key: 'clamp',         label: 'clamp()' },
  { key: 'time',          label: '시간·각도' },
]

function fmt(n: number, d = 4): string {
  if (!isFinite(n)) return '—'
  const r = +n.toFixed(d)
  return String(r)
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1000)
    } catch {
      /* ignore */
    }
  }
  return { copiedKey, copy }
}

export default function CssConverterClient() {
  const [tab, setTab] = useState<TabKey>('length')

  return (
    <div className={s.wrap}>
      <div className={s.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${s.tab} ${tab === t.key ? s.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'length' && <LengthTab />}
      {tab === 'lineheight' && <LineHeightTab />}
      {tab === 'letterspacing' && <LetterSpacingTab />}
      {tab === 'aspect' && <AspectTab />}
      {tab === 'clamp' && <ClampTab />}
      {tab === 'time' && <TimeAngleTab />}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 1 — 길이 단위 변환기
   ════════════════════════════════════════════════════════════ */
type LenUnit = 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh'
const LEN_UNITS: LenUnit[] = ['px', 'rem', 'em', '%', 'vw', 'vh']
const LEN_PROPS = ['font-size', 'width', 'height', 'padding', 'margin', 'gap']

interface LenCfg {
  rootFontSize: number
  parentFontSize: number
  viewportWidth: number
  viewportHeight: number
  baseValue: number
}

function LengthTab() {
  const { copiedKey, copy } = useCopy()
  const [value, setValue] = useState('24')
  const [fromUnit, setFromUnit] = useState<LenUnit>('px')
  const [prop, setProp] = useState('font-size')
  const [showCfg, setShowCfg] = useState(false)
  const [cfg, setCfg] = useState<LenCfg>({
    rootFontSize: 16,
    parentFontSize: 16,
    viewportWidth: 1440,
    viewportHeight: 900,
    baseValue: 100,
  })

  const num = parseFloat(value)
  const valid = isFinite(num) && num >= 0

  const toPx = (v: number, u: LenUnit): number => {
    switch (u) {
      case 'px':  return v
      case 'rem': return v * cfg.rootFontSize
      case 'em':  return v * cfg.parentFontSize
      case '%':   return (v / 100) * cfg.baseValue
      case 'vw':  return (v / 100) * cfg.viewportWidth
      case 'vh':  return (v / 100) * cfg.viewportHeight
    }
  }
  const fromPx = (px: number, u: LenUnit): number => {
    switch (u) {
      case 'px':  return px
      case 'rem': return px / cfg.rootFontSize
      case 'em':  return px / cfg.parentFontSize
      case '%':   return (px / cfg.baseValue) * 100
      case 'vw':  return (px / cfg.viewportWidth) * 100
      case 'vh':  return (px / cfg.viewportHeight) * 100
    }
  }

  const results = useMemo(() => {
    if (!valid) return []
    const px = toPx(num, fromUnit)
    return LEN_UNITS.map((u) => {
      const v = fromPx(px, u)
      return { unit: u, value: v, display: `${fmt(v)}${u}` }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [num, fromUnit, cfg, valid])

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'root16': setCfg({ ...cfg, rootFontSize: 16, parentFontSize: 16 }); break
      case 'root10': setCfg({ ...cfg, rootFontSize: 10, parentFontSize: 10 }); break
      case 'mobile': setCfg({ ...cfg, viewportWidth: 390, viewportHeight: 844 }); break
      case 'desktop': setCfg({ ...cfg, viewportWidth: 1440, viewportHeight: 900 }); break
    }
  }

  return (
    <>
      <div className={s.card}>
        <div className={s.field}>
          <label className={s.fieldLabel}>입력값</label>
          <input
            type="number"
            inputMode="decimal"
            className={s.input}
            value={value}
            min={0}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>현재 단위</label>
          <div className={s.unitRow}>
            {LEN_UNITS.map((u) => (
              <button
                key={u}
                className={`${s.unitBtn} ${fromUnit === u ? s.unitBtnActive : ''}`}
                onClick={() => setFromUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className={s.presetRow}>
          <button className={s.presetBtn} onClick={() => applyPreset('root16')}>root 16px</button>
          <button className={s.presetBtn} onClick={() => applyPreset('root10')}>root 10px</button>
          <button className={s.presetBtn} onClick={() => applyPreset('mobile')}>mobile (390×844)</button>
          <button className={s.presetBtn} onClick={() => applyPreset('desktop')}>desktop (1440×900)</button>
        </div>

        <button className={s.configToggle} onClick={() => setShowCfg((p) => !p)}>
          <span>⚙️ 설정값</span>
          <span>{showCfg ? '▲' : '▼'}</span>
        </button>
        {showCfg && (
          <div className={s.configPanel}>
            <div className={s.configField}>
              <label className={s.configLabel}>root font-size (px)</label>
              <input
                type="number"
                className={s.configInput}
                value={cfg.rootFontSize}
                onChange={(e) => setCfg({ ...cfg, rootFontSize: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className={s.configField}>
              <label className={s.configLabel}>parent font-size (px)</label>
              <input
                type="number"
                className={s.configInput}
                value={cfg.parentFontSize}
                onChange={(e) => setCfg({ ...cfg, parentFontSize: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className={s.configField}>
              <label className={s.configLabel}>viewport width (px)</label>
              <div className={s.configRow}>
                <input
                  type="number"
                  className={s.configInput}
                  value={cfg.viewportWidth}
                  onChange={(e) => setCfg({ ...cfg, viewportWidth: parseFloat(e.target.value) || 0 })}
                />
                <button
                  type="button"
                  className={s.detectBtn}
                  onClick={() => setCfg((c) => ({ ...c, viewportWidth: window.innerWidth }))}
                >자동</button>
              </div>
            </div>
            <div className={s.configField}>
              <label className={s.configLabel}>viewport height (px)</label>
              <div className={s.configRow}>
                <input
                  type="number"
                  className={s.configInput}
                  value={cfg.viewportHeight}
                  onChange={(e) => setCfg({ ...cfg, viewportHeight: parseFloat(e.target.value) || 0 })}
                />
                <button
                  type="button"
                  className={s.detectBtn}
                  onClick={() => setCfg((c) => ({ ...c, viewportHeight: window.innerHeight }))}
                >자동</button>
              </div>
            </div>
            <div className={s.configField}>
              <label className={s.configLabel}>기준값 base (px) — % 계산용</label>
              <input
                type="number"
                className={s.configInput}
                value={cfg.baseValue}
                onChange={(e) => setCfg({ ...cfg, baseValue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>변환 결과</span>

        <div className={s.summaryLine}>
          root {cfg.rootFontSize}px · parent {cfg.parentFontSize}px · viewport {cfg.viewportWidth}×{cfg.viewportHeight} · base {cfg.baseValue}px 기준
        </div>

        <div className={s.propSelectRow}>
          <span className={s.propSelectLabel}>CSS 속성</span>
          <select className={s.select} style={{ width: 'auto', flex: '0 1 auto' }} value={prop} onChange={(e) => setProp(e.target.value)}>
            {LEN_PROPS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {valid ? (
          <table className={s.resultTable}>
            <thead>
              <tr>
                <th>단위</th>
                <th>결과값</th>
                <th>CSS 선언</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const decl = `${prop}: ${r.display};`
                const k = `len-${r.unit}`
                return (
                  <tr key={r.unit}>
                    <td className={s.unitCell}>{r.unit}</td>
                    <td className={s.valCell}>{r.display}</td>
                    <td><span className={s.codeCell}>{decl}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`${s.copyBtn} ${copiedKey === k ? s.copyBtnDone : ''}`}
                        onClick={() => copy(decl, k)}
                      >
                        {copiedKey === k ? '✅' : '복사'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>값을 입력하세요.</p>
        )}
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 2 — line-height 변환기
   ════════════════════════════════════════════════════════════ */
type LhUnit = 'px' | '%' | 'em' | 'unitless'
const LH_UNITS: LhUnit[] = ['px', '%', 'em', 'unitless']

function LineHeightTab() {
  const { copiedKey, copy } = useCopy()
  const [fontSize, setFontSize] = useState('16')
  const [value, setValue] = useState('1.5')
  const [unit, setUnit] = useState<LhUnit>('unitless')

  const fs = parseFloat(fontSize)
  const v = parseFloat(value)
  const valid = isFinite(fs) && fs > 0 && isFinite(v) && v >= 0

  const px = useMemo(() => {
    if (!valid) return 0
    switch (unit) {
      case 'px':       return v
      case 'unitless': return v * fs
      case 'em':       return v * fs
      case '%':        return (v / 100) * fs
    }
  }, [v, unit, fs, valid])

  const rows = useMemo(() => {
    if (!valid) return []
    const unitless = px / fs
    return [
      { fmt: 'px',       val: `${fmt(px, 2)}px`,              note: '절대값' },
      { fmt: 'unitless', val: fmt(unitless),                  note: '✅ 권장', recommend: true },
      { fmt: 'em',       val: `${fmt(unitless)}em`,           note: '상속 주의' },
      { fmt: '%',        val: `${fmt(unitless * 100, 2)}%`,   note: '상속 주의' },
    ]
  }, [px, fs, valid])

  const recommended = valid ? fmt(px / fs) : '1.5'
  const recommendDecl = `line-height: ${recommended};`

  return (
    <>
      <div className={s.card}>
        <div className={s.field}>
          <label className={s.fieldLabel}>font-size (px)</label>
          <input
            type="number"
            className={s.input}
            value={fontSize}
            min={1}
            onChange={(e) => setFontSize(e.target.value)}
          />
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>line-height 값</label>
          <input
            type="number"
            inputMode="decimal"
            className={s.input}
            value={value}
            min={0}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>현재 단위</label>
          <div className={s.unitRow}>
            {LH_UNITS.map((u) => (
              <button
                key={u}
                className={`${s.unitBtn} ${unit === u ? s.unitBtnActive : ''}`}
                onClick={() => setUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>변환 결과</span>
        {valid ? (
          <>
            <table className={s.resultTable}>
              <thead>
                <tr>
                  <th>형식</th>
                  <th>값</th>
                  <th>비고</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const decl = `line-height: ${r.val};`
                  const k = `lh-${r.fmt}`
                  return (
                    <tr key={r.fmt} className={r.recommend ? s.resultRowRecommend : ''}>
                      <td className={s.unitCell}>{r.fmt}</td>
                      <td className={s.valCell}>{r.val}</td>
                      <td className={s.noteCell}>{r.note}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`${s.copyBtn} ${copiedKey === k ? s.copyBtnDone : ''}`}
                          onClick={() => copy(decl, k)}
                        >
                          {copiedKey === k ? '✅' : '복사'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className={s.sectionDivider} />
            <p className={s.sectionTitle}>추천 코드</p>
            <div className={s.codeBlock}>
              {recommendDecl}
              <button
                className={`${s.copyBtn} ${copiedKey === 'lh-rec' ? s.copyBtnDone : ''}`}
                onClick={() => copy(recommendDecl, 'lh-rec')}
              >
                {copiedKey === 'lh-rec' ? '✅' : '복사'}
              </button>
            </div>

            <div className={`${s.hintCard} ${s.hintRecommend}`}>
              ✅ <strong>unitless({recommended})</strong>는 자식 요소에 font-size 기준으로 재계산되어 상속이 안정적입니다.
            </div>
            <div className={`${s.hintCard} ${s.hintWarn}`}>
              ⚠️ <strong>%와 em</strong>은 계산된 px값이 그대로 상속되어 예상과 다를 수 있습니다.
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>font-size와 line-height 값을 입력하세요.</p>
        )}
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 3 — letter-spacing 변환기
   ════════════════════════════════════════════════════════════ */
type LsUnit = 'px' | 'em' | '%'
const LS_UNITS: LsUnit[] = ['px', 'em', '%']

function LetterSpacingTab() {
  const { copiedKey, copy } = useCopy()
  const [fontSize, setFontSize] = useState('16')
  const [value, setValue] = useState('0.05')
  const [unit, setUnit] = useState<LsUnit>('em')

  const fs = parseFloat(fontSize)
  const v = parseFloat(value)
  const valid = isFinite(fs) && fs > 0 && isFinite(v)

  const px = useMemo(() => {
    if (!valid) return 0
    switch (unit) {
      case 'px': return v
      case 'em': return v * fs
      case '%':  return (v / 100) * fs
    }
  }, [v, unit, fs, valid])

  const rows = valid ? [
    { fmt: 'px', val: `${fmt(px, 3)}px`,          recommend: false, supported: true },
    { fmt: 'em', val: `${fmt(px / fs, 4)}em`,     recommend: true,  supported: true },
    { fmt: '%',  val: `${fmt((px / fs) * 100, 3)}%`, recommend: false, supported: false },
  ] : []

  return (
    <>
      <div className={s.card}>
        <div className={s.field}>
          <label className={s.fieldLabel}>font-size (px)</label>
          <input type="number" className={s.input} value={fontSize} min={1} onChange={(e) => setFontSize(e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>letter-spacing 값 (음수 허용)</label>
          <input type="number" inputMode="decimal" className={s.input} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>현재 단위</label>
          <div className={s.unitRow}>
            {LS_UNITS.map((u) => (
              <button key={u} className={`${s.unitBtn} ${unit === u ? s.unitBtnActive : ''}`} onClick={() => setUnit(u)}>{u}</button>
            ))}
          </div>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>변환 결과</span>
        {valid ? (
          <>
            <table className={s.resultTable}>
              <thead>
                <tr>
                  <th>형식</th>
                  <th>값</th>
                  <th>CSS</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const decl = `letter-spacing: ${r.val};`
                  const k = `ls-${r.fmt}`
                  return (
                    <tr key={r.fmt} className={r.recommend ? s.resultRowRecommend : ''}>
                      <td className={s.unitCell}>
                        {r.fmt}
                        {!r.supported && <span className={s.noteCell} style={{ marginLeft: 6 }}>(비공식)</span>}
                      </td>
                      <td className={s.valCell}>{r.val}</td>
                      <td>
                        <span className={s.codeCell}>{decl}</span>
                        {r.recommend && <span style={{ marginLeft: 6, color: '#3EFF9B', fontSize: 11 }}>✅</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className={`${s.copyBtn} ${copiedKey === k ? s.copyBtnDone : ''}`}
                          onClick={() => copy(decl, k)}
                        >
                          {copiedKey === k ? '✅' : '복사'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className={`${s.hintCard} ${s.hintRecommend}`}>
              ✅ <strong>em 단위 권장</strong> — font-size 변경 시 자간이 자동으로 비례 조정됩니다.
            </div>
            <div className={`${s.hintCard} ${s.hintWarn}`}>
              ⚠️ CSS 명세상 <strong>letter-spacing에 % 단위는 공식 지원하지 않습니다</strong>. 위 % 값은 Figma와의 호환을 위한 참고용입니다.
            </div>
            <div className={`${s.hintCard} ${s.hintTip}`}>
              📐 <strong>Figma → CSS</strong>: Figma의 letter-spacing은 font-size의 %로 표시됩니다.<br />
              Figma에서 <strong>5%</strong> → CSS에서 <strong>0.05em</strong>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>font-size와 letter-spacing 값을 입력하세요.</p>
        )}
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 4 — aspect-ratio 변환기
   ════════════════════════════════════════════════════════════ */
type AspectMode = 'ratio' | 'wh'
const ASPECT_PRESETS: { label: string; w: number; h: number }[] = [
  { label: '16:9',     w: 16,          h: 9 },
  { label: '4:3',      w: 4,           h: 3 },
  { label: '1:1',      w: 1,           h: 1 },
  { label: '4:5',      w: 4,           h: 5 },
  { label: '3:2',      w: 3,           h: 2 },
  { label: '21:9',     w: 21,          h: 9 },
  { label: '9:16 (세로)', w: 9,        h: 16 },
  { label: 'A4 (1:√2)',  w: 1,          h: Math.SQRT2 },
]

function AspectTab() {
  const { copiedKey, copy } = useCopy()
  const [mode, setMode] = useState<AspectMode>('ratio')
  const [ratio, setRatio] = useState('16:9')
  const [w, setW] = useState('1920')
  const [h, setH] = useState('1080')

  const parseRatio = (input: string): [number, number] | null => {
    const m = input.trim().match(/^(\d+(?:\.\d+)?)[:/](\d+(?:\.\d+)?)$/)
    if (!m) return null
    const a = parseFloat(m[1])
    const b = parseFloat(m[2])
    if (a <= 0 || b <= 0) return null
    return [a, b]
  }

  const pair = useMemo<[number, number] | null>(() => {
    if (mode === 'ratio') return parseRatio(ratio)
    const wN = parseFloat(w)
    const hN = parseFloat(h)
    if (!isFinite(wN) || !isFinite(hN) || wN <= 0 || hN <= 0) return null
    return [wN, hN]
  }, [mode, ratio, w, h])

  const applyPreset = (p: { label: string; w: number; h: number }) => {
    setMode('ratio')
    setRatio(`${p.w}:${p.label.includes('A4') ? '√2' : p.h}`)
    if (p.label.includes('A4')) {
      setRatio('1:1.414')
    } else {
      setRatio(`${p.w}:${p.h}`)
    }
  }

  const paddingTopPct = pair ? ((pair[1] / pair[0]) * 100).toFixed(4) : '—'
  const ratioNum = pair ? (pair[0] / pair[1]).toFixed(3) : '—'
  const ratioDecl = pair ? `aspect-ratio: ${fmt(pair[0], 4)} / ${fmt(pair[1], 4)};` : ''
  const padDecl = pair ? `padding-top: ${paddingTopPct}%;` : ''

  const modernCode = pair
    ? `.container {\n  aspect-ratio: ${fmt(pair[0], 4)} / ${fmt(pair[1], 4)};\n}`
    : ''
  const legacyCode = pair
    ? `.container {\n  position: relative;\n  padding-top: ${paddingTopPct}%; /* ${fmt(pair[0], 2)}:${fmt(pair[1], 2)} */\n}\n.content {\n  position: absolute;\n  inset: 0;\n}`
    : ''

  const previewHeight = pair ? Math.round(320 * (pair[1] / pair[0])) : 0

  return (
    <>
      <div className={s.card}>
        <div className={s.toggleRow}>
          <button className={`${s.toggleBtn} ${mode === 'ratio' ? s.toggleBtnActive : ''}`} onClick={() => setMode('ratio')}>비율 문자열</button>
          <button className={`${s.toggleBtn} ${mode === 'wh' ? s.toggleBtnActive : ''}`} onClick={() => setMode('wh')}>width × height</button>
        </div>

        {mode === 'ratio' ? (
          <div className={s.field}>
            <label className={s.fieldLabel}>비율 (예: 16:9 또는 16/9)</label>
            <input type="text" className={s.input} value={ratio} onChange={(e) => setRatio(e.target.value)} placeholder="16:9" />
          </div>
        ) : (
          <div className={s.field}>
            <label className={s.fieldLabel}>width × height (px)</label>
            <div className={s.whPair}>
              <input type="number" className={s.input} value={w} min={1} onChange={(e) => setW(e.target.value)} />
              <span className={s.whSep}>×</span>
              <input type="number" className={s.input} value={h} min={1} onChange={(e) => setH(e.target.value)} />
            </div>
          </div>
        )}

        <div className={s.presetRow}>
          {ASPECT_PRESETS.map((p) => (
            <button key={p.label} className={s.presetBtn} onClick={() => applyPreset(p)}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>변환 결과</span>
        {pair ? (
          <>
            <table className={s.resultTable}>
              <tbody>
                <tr>
                  <td className={s.unitCell}>aspect-ratio</td>
                  <td><span className={s.codeCell}>{ratioDecl}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={`${s.copyBtn} ${copiedKey === 'ar-mod' ? s.copyBtnDone : ''}`} onClick={() => copy(ratioDecl, 'ar-mod')}>
                      {copiedKey === 'ar-mod' ? '✅' : '복사'}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className={s.unitCell}>padding-top</td>
                  <td><span className={s.codeCell}>{padDecl}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={`${s.copyBtn} ${copiedKey === 'ar-pad' ? s.copyBtnDone : ''}`} onClick={() => copy(padDecl, 'ar-pad')}>
                      {copiedKey === 'ar-pad' ? '✅' : '복사'}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className={s.unitCell}>비율 수치</td>
                  <td className={s.valCell}>{ratioNum} : 1</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div className={s.previewWrap}>
              <div className={s.previewBox} style={{ height: `${previewHeight}px` }}>
                {fmt(pair[0], 2)} : {fmt(pair[1], 2)}
              </div>
            </div>

            <div className={s.sectionDivider} />
            <p className={s.sectionTitle}>최신 방법 (권장)</p>
            <div className={s.codeBlock}>
              {modernCode}
              <button className={`${s.copyBtn} ${copiedKey === 'ar-m' ? s.copyBtnDone : ''}`} onClick={() => copy(modernCode, 'ar-m')}>
                {copiedKey === 'ar-m' ? '✅' : '복사'}
              </button>
            </div>
            <div className={s.browserBadges}>
              <span className={s.badge + ' ' + s.badgeOk}>Chrome 88+</span>
              <span className={s.badge + ' ' + s.badgeOk}>Firefox 89+</span>
              <span className={s.badge + ' ' + s.badgeOk}>Safari 15+</span>
              <span className={s.badge + ' ' + s.badgeNo}>IE ❌</span>
            </div>

            <div className={s.sectionDivider} />
            <p className={s.sectionTitle}>구형 대응 (padding-top trick)</p>
            <div className={s.codeBlock}>
              {legacyCode}
              <button className={`${s.copyBtn} ${copiedKey === 'ar-l' ? s.copyBtnDone : ''}`} onClick={() => copy(legacyCode, 'ar-l')}>
                {copiedKey === 'ar-l' ? '✅' : '복사'}
              </button>
            </div>
            <div className={s.browserBadges}>
              <span className={s.badge + ' ' + s.badgeOk}>모든 브라우저 지원</span>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>유효한 비율을 입력하세요. (예: 16:9, 16/9)</p>
        )}
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 5 — clamp() 생성기
   ════════════════════════════════════════════════════════════ */
type ClampOutputUnit = 'rem' | 'px'
const CLAMP_PROPS = ['font-size', 'gap', 'padding', 'margin', 'width']

function ClampTab() {
  const { copiedKey, copy } = useCopy()
  const [minPx, setMinPx] = useState('16')
  const [maxPx, setMaxPx] = useState('32')
  const [minVw, setMinVw] = useState('360')
  const [maxVw, setMaxVw] = useState('1440')
  const [outUnit, setOutUnit] = useState<ClampOutputUnit>('rem')
  const [prop, setProp] = useState('font-size')
  const [curVw, setCurVw] = useState<number | null>(null)

  useEffect(() => {
    const update = () => setCurVw(window.innerWidth)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const rootPx = 16
  const nMinPx = parseFloat(minPx)
  const nMaxPx = parseFloat(maxPx)
  const nMinVw = parseFloat(minVw)
  const nMaxVw = parseFloat(maxVw)
  const valid =
    isFinite(nMinPx) && isFinite(nMaxPx) && isFinite(nMinVw) && isFinite(nMaxVw) &&
    nMinPx >= 0 && nMaxPx > nMinPx && nMinVw > 0 && nMaxVw > nMinVw

  const clampStr = useMemo(() => {
    if (!valid) return ''
    const slope = (nMaxPx - nMinPx) / (nMaxVw - nMinVw)
    const slopeVw = slope * 100
    const interceptPx = nMinPx - slope * nMinVw

    if (outUnit === 'rem') {
      const minRem = +(nMinPx / rootPx).toFixed(4)
      const maxRem = +(nMaxPx / rootPx).toFixed(4)
      const intRem = +(interceptPx / rootPx).toFixed(4)
      const svw = +slopeVw.toFixed(4)
      const pref = intRem !== 0
        ? `${intRem}rem + ${svw}vw`
        : `${svw}vw`
      return `clamp(${minRem}rem, ${pref}, ${maxRem}rem)`
    } else {
      const svw = +slopeVw.toFixed(4)
      const intPx = +interceptPx.toFixed(4)
      const pref = intPx !== 0
        ? `${intPx}px + ${svw}vw`
        : `${svw}vw`
      return `clamp(${fmt(nMinPx, 4)}px, ${pref}, ${fmt(nMaxPx, 4)}px)`
    }
  }, [nMinPx, nMaxPx, nMinVw, nMaxVw, outUnit, valid])

  const declOnly = `${prop}: ${clampStr};`
  const cssVar = `--${prop}: ${clampStr};`

  const curValue = useMemo(() => {
    if (!valid || curVw === null) return null
    const v = Math.min(nMaxPx, Math.max(nMinPx, nMinPx + ((nMaxPx - nMinPx) / (nMaxVw - nMinVw)) * (curVw - nMinVw)))
    return v
  }, [curVw, valid, nMinPx, nMaxPx, nMinVw, nMaxVw])

  // SVG 그래프
  const graph = useMemo(() => {
    if (!valid) return null
    const W = 600
    const H = 180
    const padL = 52
    const padR = 24
    const padT = 16
    const padB = 30
    const innerW = W - padL - padR
    const innerH = H - padT - padB

    // domain x: [minVw*0.8, maxVw*1.1] to show plateau
    const xMin = nMinVw * 0.8
    const xMax = nMaxVw * 1.1
    const yMinPx = nMinPx
    const yMaxPx = nMaxPx
    const yPadded = (yMaxPx - yMinPx) * 0.15 || 1
    const yLow = yMinPx - yPadded
    const yHigh = yMaxPx + yPadded

    const xTo = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * innerW
    const yTo = (y: number) => padT + innerH - ((y - yLow) / (yHigh - yLow)) * innerH

    const pt1 = [xTo(xMin), yTo(yMinPx)]
    const pt2 = [xTo(nMinVw), yTo(yMinPx)]
    const pt3 = [xTo(nMaxVw), yTo(yMaxPx)]
    const pt4 = [xTo(xMax), yTo(yMaxPx)]
    const path = `M${pt1[0]},${pt1[1]} L${pt2[0]},${pt2[1]} L${pt3[0]},${pt3[1]} L${pt4[0]},${pt4[1]}`

    const markerX = curVw !== null && curVw >= xMin && curVw <= xMax ? xTo(curVw) : null

    return {
      W, H, padL, padR, padT, padB, innerW, innerH,
      path,
      minLineY: yTo(yMinPx),
      maxLineY: yTo(yMaxPx),
      xStart: xTo(nMinVw),
      xEnd: xTo(nMaxVw),
      markerX,
      curValue,
      labels: {
        minVwX: xTo(nMinVw),
        maxVwX: xTo(nMaxVw),
        minPxY: yTo(yMinPx),
        maxPxY: yTo(yMaxPx),
      },
    }
  }, [valid, nMinPx, nMaxPx, nMinVw, nMaxVw, curVw, curValue])

  return (
    <>
      <div className={s.card}>
        <div className={s.configPanel} style={{ border: 'none', padding: 0, background: 'transparent', marginTop: 0 }}>
          <div className={s.configField}>
            <label className={s.configLabel}>최솟값 (px)</label>
            <input type="number" className={s.configInput} value={minPx} onChange={(e) => setMinPx(e.target.value)} />
          </div>
          <div className={s.configField}>
            <label className={s.configLabel}>최댓값 (px)</label>
            <input type="number" className={s.configInput} value={maxPx} onChange={(e) => setMaxPx(e.target.value)} />
          </div>
          <div className={s.configField}>
            <label className={s.configLabel}>최소 viewport (px)</label>
            <input type="number" className={s.configInput} value={minVw} onChange={(e) => setMinVw(e.target.value)} />
          </div>
          <div className={s.configField}>
            <label className={s.configLabel}>최대 viewport (px)</label>
            <input type="number" className={s.configInput} value={maxVw} onChange={(e) => setMaxVw(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div className={s.field} style={{ margin: 0 }}>
            <label className={s.fieldLabel}>출력 단위</label>
            <div className={s.unitRow}>
              <button className={`${s.unitBtn} ${outUnit === 'rem' ? s.unitBtnActive : ''}`} onClick={() => setOutUnit('rem')}>rem</button>
              <button className={`${s.unitBtn} ${outUnit === 'px' ? s.unitBtnActive : ''}`} onClick={() => setOutUnit('px')}>px</button>
            </div>
          </div>
          <div className={s.field} style={{ margin: 0, minWidth: 160 }}>
            <label className={s.fieldLabel}>CSS 속성</label>
            <select className={s.select} value={prop} onChange={(e) => setProp(e.target.value)}>
              {CLAMP_PROPS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>clamp() 결과</span>
        {valid ? (
          <>
            <div className={s.codeBlock}>
              {declOnly}
              <button className={`${s.copyBtn} ${copiedKey === 'cl-decl' ? s.copyBtnDone : ''}`} onClick={() => copy(declOnly, 'cl-decl')}>
                {copiedKey === 'cl-decl' ? '✅' : '복사'}
              </button>
            </div>

            <div className={s.copyOptions}>
              <button
                className={`${s.copyBtn} ${copiedKey === 'cl-val' ? s.copyBtnDone : ''}`}
                onClick={() => copy(clampStr, 'cl-val')}
              >{copiedKey === 'cl-val' ? '✅ 복사됨' : '값만 복사'}</button>
              <button
                className={`${s.copyBtn} ${copiedKey === 'cl-decl2' ? s.copyBtnDone : ''}`}
                onClick={() => copy(declOnly, 'cl-decl2')}
              >{copiedKey === 'cl-decl2' ? '✅ 복사됨' : '속성: 값; 복사'}</button>
              <button
                className={`${s.copyBtn} ${copiedKey === 'cl-var' ? s.copyBtnDone : ''}`}
                onClick={() => copy(cssVar, 'cl-var')}
              >{copiedKey === 'cl-var' ? '✅ 복사됨' : 'CSS 변수 복사'}</button>
            </div>

            {graph && (
              <div className={s.graphWrap}>
                <svg viewBox={`0 0 ${graph.W} ${graph.H}`} className={s.graphSvg} preserveAspectRatio="xMidYMid meet">
                  <line x1={graph.padL} y1={graph.minLineY} x2={graph.W - graph.padR} y2={graph.minLineY} stroke="var(--muted)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  <line x1={graph.padL} y1={graph.maxLineY} x2={graph.W - graph.padR} y2={graph.maxLineY} stroke="var(--muted)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  <line x1={graph.xStart} y1={graph.padT} x2={graph.xStart} y2={graph.H - graph.padB} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                  <line x1={graph.xEnd} y1={graph.padT} x2={graph.xEnd} y2={graph.H - graph.padB} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                  <path d={graph.path} stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                  <text x={graph.xStart} y={graph.H - 10} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Syne">{nMinVw}px</text>
                  <text x={graph.xEnd} y={graph.H - 10} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Syne">{nMaxVw}px</text>
                  <text x={graph.padL - 6} y={graph.minLineY + 3} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Syne">{nMinPx}px</text>
                  <text x={graph.padL - 6} y={graph.maxLineY + 3} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Syne">{nMaxPx}px</text>
                  {graph.markerX !== null && (
                    <>
                      <line x1={graph.markerX} y1={graph.padT} x2={graph.markerX} y2={graph.H - graph.padB} stroke="var(--text)" strokeWidth="1.5" />
                      <text x={graph.markerX} y={graph.padT - 2} fill="var(--text)" fontSize="10" textAnchor="middle" fontFamily="Syne" fontWeight="700">
                        {curVw}px → {graph.curValue !== null ? fmt(graph.curValue, 2) : ''}px
                      </text>
                    </>
                  )}
                </svg>
                <div className={s.graphLegend}>
                  <span className={s.graphLegendItem}><span className={s.graphLegendSwatch}></span> clamp 결과</span>
                  <span className={s.graphLegendItem}><span className={s.graphLegendSwatchDashed}></span> 최솟값/최댓값</span>
                  {graph.markerX !== null && (
                    <span className={s.graphLegendItem}><span className={s.graphLegendSwatchMarker}></span> 현재 브라우저</span>
                  )}
                </div>
              </div>
            )}

            <div className={s.clampSteps}>
              <div className={s.clampStep}>📱 <strong>{nMinVw}px 이하</strong>: 최솟값 {outUnit === 'rem' ? `${+(nMinPx / rootPx).toFixed(4)}rem` : `${nMinPx}px`} ({nMinPx}px) 고정</div>
              <div className={s.clampStep}>💻 <strong>{nMinVw}px ~ {nMaxVw}px</strong>: 선형 증가 (뷰포트에 따라 유동)</div>
              <div className={s.clampStep}>🖥️ <strong>{nMaxVw}px 이상</strong>: 최댓값 {outUnit === 'rem' ? `${+(nMaxPx / rootPx).toFixed(4)}rem` : `${nMaxPx}px`} ({nMaxPx}px) 고정</div>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>최솟값 &lt; 최댓값, 최소 viewport &lt; 최대 viewport 조건을 확인해주세요.</p>
        )}
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 6 — 시간·각도 보조 변환
   ════════════════════════════════════════════════════════════ */
type TimeUnit = 'ms' | 's'
type AngUnit = 'deg' | 'rad' | 'turn' | 'grad'

const TIME_PROPS = ['transition-duration', 'animation-duration', 'transition-delay']
const ANG_PROPS = ['rotate', 'skewX', 'skewY', 'hue-rotate']

function TimeAngleTab() {
  const { copiedKey, copy } = useCopy()

  // 시간
  const [tVal, setTVal] = useState('200')
  const [tUnit, setTUnit] = useState<TimeUnit>('ms')
  const [tProp, setTProp] = useState('transition-duration')

  const tNum = parseFloat(tVal)
  const tValid = isFinite(tNum) && tNum >= 0
  const ms = tValid ? (tUnit === 'ms' ? tNum : tNum * 1000) : 0
  const seconds = ms / 1000

  const tDecl = `${tProp}: ${tProp === 'transition-duration' ? `${fmt(seconds, 4)}s ease` : `${fmt(seconds, 4)}s`};`
  // 단순화: transition-duration도 그냥 "Xs"만 쓰는 게 더 깔끔
  const tDeclSimple = `${tProp}: ${fmt(seconds, 4)}s;`

  // 각도
  const [aVal, setAVal] = useState('45')
  const [aUnit, setAUnit] = useState<AngUnit>('deg')
  const [aProp, setAProp] = useState('rotate')

  const aNum = parseFloat(aVal)
  const aValid = isFinite(aNum)
  const toDeg = (v: number, u: AngUnit): number => {
    switch (u) {
      case 'deg':  return v
      case 'rad':  return v * (180 / Math.PI)
      case 'turn': return v * 360
      case 'grad': return v * (360 / 400)
    }
  }
  const degVal = aValid ? toDeg(aNum, aUnit) : 0
  const angRows = aValid ? [
    { unit: 'deg',  val: `${fmt(degVal, 4)}deg` },
    { unit: 'rad',  val: `${fmt(degVal * Math.PI / 180, 6)}rad` },
    { unit: 'turn', val: `${fmt(degVal / 360, 6)}turn` },
    { unit: 'grad', val: `${fmt(degVal * 400 / 360, 4)}grad` },
  ] : []

  // transform 래핑은 rotate/skew가 transform 내부 함수라서
  const aDecl = aProp === 'hue-rotate'
    ? `filter: hue-rotate(${fmt(degVal, 4)}deg);`
    : `transform: ${aProp}(${fmt(degVal, 4)}deg);`

  return (
    <>
      {/* 섹션 A — 시간 */}
      <div className={s.card}>
        <p className={s.sectionTitle}>⏱️ 시간 변환 (ms ↔ s)</p>

        <div className={s.field}>
          <label className={s.fieldLabel}>값</label>
          <input type="number" inputMode="decimal" className={s.input} value={tVal} min={0} onChange={(e) => setTVal(e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>단위</label>
          <div className={s.unitRow}>
            {(['ms', 's'] as TimeUnit[]).map((u) => (
              <button key={u} className={`${s.unitBtn} ${tUnit === u ? s.unitBtnActive : ''}`} onClick={() => setTUnit(u)}>{u}</button>
            ))}
          </div>
        </div>

        <div className={s.presetRow}>
          {[100, 200, 300, 500, 1000].map((v) => (
            <button key={v} className={s.presetBtn} onClick={() => { setTUnit('ms'); setTVal(String(v)) }}>{v}ms</button>
          ))}
        </div>

        {tValid ? (
          <>
            <table className={s.resultTable}>
              <thead>
                <tr><th>단위</th><th>값</th><th></th></tr>
              </thead>
              <tbody>
                <tr><td className={s.unitCell}>ms</td><td className={s.valCell}>{fmt(ms, 4)}ms</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={`${s.copyBtn} ${copiedKey === 't-ms' ? s.copyBtnDone : ''}`} onClick={() => copy(`${fmt(ms, 4)}ms`, 't-ms')}>
                      {copiedKey === 't-ms' ? '✅' : '복사'}
                    </button>
                  </td>
                </tr>
                <tr><td className={s.unitCell}>s</td><td className={s.valCell}>{fmt(seconds, 4)}s</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={`${s.copyBtn} ${copiedKey === 't-s' ? s.copyBtnDone : ''}`} onClick={() => copy(`${fmt(seconds, 4)}s`, 't-s')}>
                      {copiedKey === 't-s' ? '✅' : '복사'}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className={s.propSelectRow} style={{ marginTop: 12 }}>
              <span className={s.propSelectLabel}>CSS 속성</span>
              <select className={s.select} style={{ width: 'auto', flex: '0 1 auto' }} value={tProp} onChange={(e) => setTProp(e.target.value)}>
                {TIME_PROPS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className={s.codeBlock}>
              {tDeclSimple}
              <button className={`${s.copyBtn} ${copiedKey === 't-decl' ? s.copyBtnDone : ''}`} onClick={() => copy(tDeclSimple, 't-decl')}>
                {copiedKey === 't-decl' ? '✅' : '복사'}
              </button>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>값을 입력하세요.</p>
        )}
      </div>

      {/* 섹션 B — 각도 */}
      <div className={s.card}>
        <p className={s.sectionTitle}>🔄 각도 변환 (deg ↔ rad ↔ turn ↔ grad)</p>

        <div className={s.field}>
          <label className={s.fieldLabel}>값</label>
          <input type="number" inputMode="decimal" className={s.input} value={aVal} onChange={(e) => setAVal(e.target.value)} />
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>단위</label>
          <div className={s.unitRow}>
            {(['deg', 'rad', 'turn', 'grad'] as AngUnit[]).map((u) => (
              <button key={u} className={`${s.unitBtn} ${aUnit === u ? s.unitBtnActive : ''}`} onClick={() => setAUnit(u)}>{u}</button>
            ))}
          </div>
        </div>

        <div className={s.presetRow}>
          {[45, 90, 180, 360].map((v) => (
            <button key={v} className={s.presetBtn} onClick={() => { setAUnit('deg'); setAVal(String(v)) }}>{v}°</button>
          ))}
        </div>

        {aValid ? (
          <>
            <table className={s.resultTable}>
              <thead>
                <tr><th>단위</th><th>값</th><th></th></tr>
              </thead>
              <tbody>
                {angRows.map((r) => (
                  <tr key={r.unit}>
                    <td className={s.unitCell}>{r.unit}</td>
                    <td className={s.valCell}>{r.val}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className={`${s.copyBtn} ${copiedKey === `a-${r.unit}` ? s.copyBtnDone : ''}`} onClick={() => copy(r.val, `a-${r.unit}`)}>
                        {copiedKey === `a-${r.unit}` ? '✅' : '복사'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={s.propSelectRow} style={{ marginTop: 12 }}>
              <span className={s.propSelectLabel}>CSS 속성</span>
              <select className={s.select} style={{ width: 'auto', flex: '0 1 auto' }} value={aProp} onChange={(e) => setAProp(e.target.value)}>
                {ANG_PROPS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className={s.codeBlock}>
              {aDecl}
              <button className={`${s.copyBtn} ${copiedKey === 'a-decl' ? s.copyBtnDone : ''}`} onClick={() => copy(aDecl, 'a-decl')}>
                {copiedKey === 'a-decl' ? '✅' : '복사'}
              </button>
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>값을 입력하세요.</p>
        )}
      </div>
    </>
  )
}
