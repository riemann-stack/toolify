'use client'

import { useState, useMemo, useCallback } from 'react'
import styles from './color.module.css'

// ── 변환 유틸 ──
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100
  let r, g, b
  if (s === 0) { r = g = b = l } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function getLuminance(r: number, g: number, b: number) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

const PRESETS = [
  { name: '빨강',   hex: '#FF0000' },
  { name: '주황',   hex: '#FF6B00' },
  { name: '노랑',   hex: '#FFD700' },
  { name: '초록',   hex: '#00C851' },
  { name: '하늘',   hex: '#00BFFF' },
  { name: '파랑',   hex: '#0066FF' },
  { name: '보라',   hex: '#8A2BE2' },
  { name: '분홍',   hex: '#FF69B4' },
  { name: '흰색',   hex: '#FFFFFF' },
  { name: '회색',   hex: '#808080' },
  { name: '검정',   hex: '#000000' },
  { name: '아이보리', hex: '#FFFFF0' },
]

export default function ColorClient() {
  const [hex, setHex] = useState('#3EC8FF')
  const [r, setR] = useState('62')
  const [g, setG] = useState('200')
  const [b, setB] = useState('255')
  const [h, setH] = useState('195')
  const [s, setS] = useState('100')
  const [l, setL] = useState('62')
  const [copied, setCopied] = useState('')

  const bgColor = hex
  const textColor = useMemo(() => {
    const rgb = hexToRgb(hex)
    if (!rgb) return '#000000'
    return getLuminance(...rgb) > 0.5 ? '#000000' : '#FFFFFF'
  }, [hex])

  const syncFromHex = useCallback((newHex: string) => {
    const rgb = hexToRgb(newHex)
    if (!rgb) return
    const [nr, ng, nb] = rgb
    const [nh, ns, nl] = rgbToHsl(nr, ng, nb)
    setR(String(nr)); setG(String(ng)); setB(String(nb))
    setH(String(nh)); setS(String(ns)); setL(String(nl))
  }, [])

  const syncFromRgb = useCallback((nr: number, ng: number, nb: number) => {
    const newHex = rgbToHex(nr, ng, nb)
    const [nh, ns, nl] = rgbToHsl(nr, ng, nb)
    setHex(newHex)
    setH(String(nh)); setS(String(ns)); setL(String(nl))
  }, [])

  const syncFromHsl = useCallback((nh: number, ns: number, nl: number) => {
    const [nr, ng, nb] = hslToRgb(nh, ns, nl)
    const newHex = rgbToHex(nr, ng, nb)
    setHex(newHex)
    setR(String(nr)); setG(String(ng)); setB(String(nb))
  }, [])

  const handleHexChange = (v: string) => {
    setHex(v)
    if (/^#[0-9a-fA-F]{6}$/.test(v)) syncFromHex(v)
  }

  const handlePickerChange = (v: string) => {
    setHex(v)
    syncFromHex(v)
  }

  const handleRgbChange = (which: 'r'|'g'|'b', v: string) => {
    const n = Math.min(255, Math.max(0, parseInt(v) || 0))
    if (which === 'r') { setR(String(n)); syncFromRgb(n, parseInt(g)||0, parseInt(b)||0) }
    if (which === 'g') { setG(String(n)); syncFromRgb(parseInt(r)||0, n, parseInt(b)||0) }
    if (which === 'b') { setB(String(n)); syncFromRgb(parseInt(r)||0, parseInt(g)||0, n) }
  }

  const handleHslChange = (which: 'h'|'s'|'l', v: string) => {
    const max = which === 'h' ? 360 : 100
    const n = Math.min(max, Math.max(0, parseInt(v) || 0))
    if (which === 'h') { setH(String(n)); syncFromHsl(n, parseInt(s)||0, parseInt(l)||0) }
    if (which === 's') { setS(String(n)); syncFromHsl(parseInt(h)||0, n, parseInt(l)||0) }
    if (which === 'l') { setL(String(n)); syncFromHsl(parseInt(h)||0, parseInt(s)||0, n) }
  }

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  const hexStr = hex.toUpperCase()
  const rgbStr = `rgb(${r}, ${g}, ${b})`
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`

  return (
    <div className={styles.wrap}>

      {/* 색상 미리보기 + 피커 */}
      <div className={styles.previewCard} style={{ background: bgColor }}>
        <div className={styles.previewTop}>
          <span className={styles.previewLabel} style={{ color: textColor }}>색상 미리보기</span>
          <input className={styles.colorPicker} type="color" value={hex}
            onChange={e => handlePickerChange(e.target.value)} />
        </div>
        <div className={styles.previewHex} style={{ color: textColor }}>{hexStr}</div>
      </div>

      {/* HEX 입력 */}
      <div className={styles.card}>
        <div className={styles.codeRow}>
          <div className={styles.codeLabel}>HEX</div>
          <input className={styles.codeInput} type="text" value={hex}
            onChange={e => handleHexChange(e.target.value)}
            placeholder="#000000" maxLength={7} spellCheck={false} />
          <button className={`${styles.copyBtn} ${copied === 'hex' ? styles.copied : ''}`}
            onClick={() => copy(hexStr, 'hex')}>
            {copied === 'hex' ? '✓' : '복사'}
          </button>
        </div>
      </div>

      {/* RGB 입력 */}
      <div className={styles.card}>
        <div className={styles.codeRow}>
          <div className={styles.codeLabel}>RGB</div>
          <div className={styles.rgbInputs}>
            {[['R', r, 'r'], ['G', g, 'g'], ['B', b, 'b']].map(([label, val, key]) => (
              <div key={key} className={styles.rgbItem}>
                <span className={styles.rgbLabel}>{label}</span>
                <input className={styles.rgbInput} type="number" min={0} max={255}
                  value={val} onChange={e => handleRgbChange(key as 'r'|'g'|'b', e.target.value)} />
              </div>
            ))}
          </div>
          <button className={`${styles.copyBtn} ${copied === 'rgb' ? styles.copied : ''}`}
            onClick={() => copy(rgbStr, 'rgb')}>
            {copied === 'rgb' ? '✓' : '복사'}
          </button>
        </div>
      </div>

      {/* HSL 입력 */}
      <div className={styles.card}>
        <div className={styles.codeRow}>
          <div className={styles.codeLabel}>HSL</div>
          <div className={styles.rgbInputs}>
            {[['H', h, 'h', '360°'], ['S', s, 's', '100%'], ['L', l, 'l', '100%']].map(([label, val, key, max]) => (
              <div key={key} className={styles.rgbItem}>
                <span className={styles.rgbLabel}>{label}</span>
                <input className={styles.rgbInput} type="number" min={0} max={parseInt(max)}
                  value={val} onChange={e => handleHslChange(key as 'h'|'s'|'l', e.target.value)} />
              </div>
            ))}
          </div>
          <button className={`${styles.copyBtn} ${copied === 'hsl' ? styles.copied : ''}`}
            onClick={() => copy(hslStr, 'hsl')}>
            {copied === 'hsl' ? '✓' : '복사'}
          </button>
        </div>
      </div>

      {/* 프리셋 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>자주 쓰는 색상</label>
        <div className={styles.presetGrid}>
          {PRESETS.map(p => (
            <button key={p.hex} className={styles.presetItem}
              style={{ background: p.hex, border: hex.toLowerCase() === p.hex.toLowerCase() ? '2px solid var(--accent)' : '2px solid transparent' }}
              onClick={() => { setHex(p.hex); syncFromHex(p.hex) }}
              title={`${p.name} (${p.hex})`} />
          ))}
        </div>
      </div>
    </div>
  )
}