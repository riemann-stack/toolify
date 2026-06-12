'use client'

import { useState } from 'react'
import {
  MM_PER_INCH, PRINT_SIZES, SIZE_MAP, USE_CASES, bandFor,
} from './printData'
import s from './print-resolution.module.css'

type Mode = 'forward' | 'reverse'

const num = (v: string) => { const n = parseFloat(v.replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0 }
const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR')
const cm1 = (mm: number) => (mm / 10).toFixed(1)

function cameraHint(mp: number): string {
  if (mp < 2) return '웹·소형 인화용 (대부분 이미지 OK)'
  if (mp < 12) return '스마트폰 사진으로도 충분'
  if (mp < 24) return '고급 스마트폰·미러리스 권장'
  if (mp < 50) return '고화소 카메라(2400만+) 필요'
  return '고화소·중형 카메라 또는 이어붙이기 필요'
}

const REVERSE_DPIS = [300, 200, 150, 100]

export default function PrintResolutionClient() {
  const [mode, setMode] = useState<Mode>('forward')
  const [sizeId, setSizeId] = useState('a4')
  const [cw, setCw] = useState('200')   // custom mm
  const [ch, setCh] = useState('300')
  const [ucId, setUcId] = useState('photo')
  const [dpiStr, setDpiStr] = useState('')  // 빈 값이면 용도 DPI 사용
  const [imgW, setImgW] = useState('4000')
  const [imgH, setImgH] = useState('3000')

  const isCustom = sizeId === 'custom'
  const sizeMM = isCustom
    ? { w: Math.max(1, num(cw)), h: Math.max(1, num(ch)) }
    : { w: SIZE_MAP[sizeId].w, h: SIZE_MAP[sizeId].h }

  const uc = USE_CASES.find((u) => u.id === ucId) ?? USE_CASES[0]
  const dpi = dpiStr.trim() ? Math.max(1, num(dpiStr)) : uc.dpi

  // ── 모드 ① 최소 해상도 ──
  const pxW = Math.round((sizeMM.w / MM_PER_INCH) * dpi)
  const pxH = Math.round((sizeMM.h / MM_PER_INCH) * dpi)
  const mp = (pxW * pxH) / 1_000_000

  // ── 모드 ② 품질 역산 ──
  const iw = Math.max(0, num(imgW))
  const ih = Math.max(0, num(imgH))
  const imgLong = Math.max(iw, ih)
  const imgShort = Math.min(iw, ih)
  const inLong = Math.max(sizeMM.w, sizeMM.h) / MM_PER_INCH
  const inShort = Math.min(sizeMM.w, sizeMM.h) / MM_PER_INCH
  const effDpi = iw > 0 && ih > 0 ? Math.min(imgLong / inLong, imgShort / inShort) : 0
  const band = bandFor(effDpi)
  const imgMp = (iw * ih) / 1_000_000

  return (
    <div className={s.wrap}>
      {/* 모드 토글 */}
      <div className={s.modeToggle} role="tablist" aria-label="계산 방향">
        <button type="button" role="tab" aria-selected={mode === 'forward'}
          className={`${s.modeBtn} ${mode === 'forward' ? s.modeActive : ''}`}
          onClick={() => setMode('forward')}>① 최소 해상도</button>
        <button type="button" role="tab" aria-selected={mode === 'reverse'}
          className={`${s.modeBtn} ${mode === 'reverse' ? s.modeActive : ''}`}
          onClick={() => setMode('reverse')}>② 인쇄 품질 역산</button>
      </div>

      {/* 공통: 인쇄 크기 */}
      <div className={s.card}>
        <span className={s.cardLabel}>인쇄 크기</span>
        <div className={s.selectWrap}>
          <select className={s.select} value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
            {(['사진', 'A규격', '기타'] as const).map((g) => (
              <optgroup key={g} label={g}>
                {PRINT_SIZES.filter((x) => x.group === g).map((x) => (
                  <option key={x.id} value={x.id}>{x.name}</option>
                ))}
              </optgroup>
            ))}
            <option value="custom">직접 입력 (mm)</option>
          </select>
          <span className={s.selectArrow}>▼</span>
        </div>
        {isCustom ? (
          <div className={s.row2} style={{ marginTop: 10 }}>
            <div className={s.field}>
              <span className={s.fieldLabel}>가로 (mm)</span>
              <input className={s.input} type="text" inputMode="decimal" value={cw} onChange={(e) => setCw(e.target.value.replace(/[^0-9.]/g, ''))} />
            </div>
            <div className={s.field}>
              <span className={s.fieldLabel}>세로 (mm)</span>
              <input className={s.input} type="text" inputMode="decimal" value={ch} onChange={(e) => setCh(e.target.value.replace(/[^0-9.]/g, ''))} />
            </div>
          </div>
        ) : (
          <p className={s.dim}>{cm1(sizeMM.w)} × {cm1(sizeMM.h)} cm</p>
        )}
      </div>

      {mode === 'forward' ? (
        <>
          {/* 용도 → DPI */}
          <div className={s.card}>
            <span className={s.cardLabel}>용도 (권장 DPI 자동)</span>
            <div className={s.ucGrid}>
              {USE_CASES.map((u) => (
                <button key={u.id} type="button"
                  className={`${s.ucBtn} ${ucId === u.id && !dpiStr.trim() ? s.ucActive : ''}`}
                  onClick={() => { setUcId(u.id); setDpiStr('') }}>
                  <span className={s.ucLabel}>{u.label}</span>
                  <span className={s.ucDpi}>{u.dpi} DPI</span>
                </button>
              ))}
            </div>
            <div className={s.field} style={{ marginTop: 12 }}>
              <span className={s.fieldLabel}>또는 DPI 직접 입력</span>
              <input className={s.input} type="text" inputMode="numeric" placeholder={`${uc.dpi}`} value={dpiStr} onChange={(e) => setDpiStr(e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
          </div>

          {/* 결과 */}
          <div className={s.hero} role="status">
            <p className={s.heroLead}>필요한 최소 해상도 · {dpi} DPI</p>
            <p className={s.heroValue}><strong>{fmt(pxW)}</strong> × <strong>{fmt(pxH)}</strong> px</p>
            <p className={s.heroSub}>약 {mp.toFixed(1)} 메가픽셀 · {cm1(sizeMM.w)}×{cm1(sizeMM.h)}cm</p>
            <div className={s.hintBox}>📷 {cameraHint(mp)}</div>
          </div>
        </>
      ) : (
        <>
          {/* 이미지 픽셀 */}
          <div className={s.card}>
            <span className={s.cardLabel}>내 이미지 해상도 (픽셀)</span>
            <div className={s.row2}>
              <div className={s.field}>
                <span className={s.fieldLabel}>가로 (px)</span>
                <input className={s.input} type="text" inputMode="numeric" value={imgW} onChange={(e) => setImgW(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
              <div className={s.field}>
                <span className={s.fieldLabel}>세로 (px)</span>
                <input className={s.input} type="text" inputMode="numeric" value={imgH} onChange={(e) => setImgH(e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </div>
            {imgMp > 0 && <p className={s.dim}>약 {imgMp.toFixed(1)} 메가픽셀</p>}
          </div>

          {/* 결과 — 선택 크기 품질 */}
          <div className={s.hero}>
            <span className={s.bandBadge} style={{ background: band.color }}>{band.label}</span>
            <p className={s.heroValue} style={{ color: band.color }}>{Math.round(effDpi)} DPI</p>
            <p className={s.heroSub}>{SIZE_MAP[sizeId]?.name ?? '직접 입력'} 크기로 인쇄 시 · {band.desc}</p>
          </div>

          {/* 품질별 최대 인쇄 크기 */}
          <div className={s.card}>
            <span className={s.cardLabel}>품질별 최대 인쇄 크기</span>
            <div className={s.maxList}>
              {REVERSE_DPIS.map((q) => {
                const longCm = (imgLong / q) * 2.54
                const shortCm = (imgShort / q) * 2.54
                const b = bandFor(q)
                return (
                  <div key={q} className={s.maxRow}>
                    <span className={s.maxDpi}><span className={s.maxDot} style={{ background: b.color }} />{q} DPI <span className={s.maxBand}>{b.label}</span></span>
                    <span className={s.maxSize}>{iw > 0 && ih > 0 ? `${longCm.toFixed(1)} × ${shortCm.toFixed(1)} cm` : '—'}</span>
                  </div>
                )
              })}
            </div>
            <p className={s.helpText}>현수막·대형 포스터처럼 멀리서 보는 인쇄물은 100 DPI 이하로도 충분합니다. 가까이서 보는 사진·명함은 300 DPI를 권장해요.</p>
          </div>
        </>
      )}

      {/* 권장 DPI 참고 */}
      <div className={s.card}>
        <span className={s.cardLabel}>용도별 권장 DPI</span>
        <div className={s.dpiRefList}>
          {USE_CASES.filter((u) => u.id !== 'screen').map((u) => (
            <div key={u.id} className={s.dpiRefRow}>
              <span className={s.dpiRefDpi}>{u.dpi}</span>
              <div>
                <div className={s.dpiRefLabel}>{u.label}</div>
                <div className={s.dpiRefNote}>{u.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
