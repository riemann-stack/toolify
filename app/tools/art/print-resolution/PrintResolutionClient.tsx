'use client'

import { useState } from 'react'
import {
  MM_PER_INCH, PRINT_SIZES, SIZE_MAP, USE_CASES, bandFor, judgeForUse,
  fitFill, withBleed, BLEED_OPTIONS,
} from './printData'
import s from './print-resolution.module.css'

type Mode = 'forward' | 'reverse'

const num = (v: string) => { const n = parseFloat(v.replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0 }
/** 0·빈값을 조용히 1로 바꾸면 12×12px 같은 결과가 정상값처럼 보인다 — 유효하지 않으면 null */
const posOrNull = (v: string): number | null => { const n = num(v); return n > 0 ? n : null }
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
  const [bleed, setBleed] = useState<number>(0)
  const [fitMode, setFitMode] = useState<'fill' | 'fit'>('fill')

  const isCustom = sizeId === 'custom'
  const customW = posOrNull(cw), customH = posOrNull(ch)
  const sizeInvalid = isCustom && (customW === null || customH === null)
  const baseMM = isCustom
    ? { w: customW ?? 0, h: customH ?? 0 }
    : { w: SIZE_MAP[sizeId].w, h: SIZE_MAP[sizeId].h }
  /* 도련(재단 여유) 포함 실제 인쇄 크기 */
  const sizeMM = withBleed(baseMM.w, baseMM.h, bleed)

  const uc = USE_CASES.find((u) => u.id === ucId) ?? USE_CASES[0]
  const customDpi = dpiStr.trim() ? posOrNull(dpiStr) : null
  const dpiInvalid = dpiStr.trim().length > 0 && customDpi === null
  const dpi = customDpi ?? uc.dpi

  // ── 모드 ① 최소 해상도 ──
  const pxW = Math.round((sizeMM.w / MM_PER_INCH) * dpi)
  const pxH = Math.round((sizeMM.h / MM_PER_INCH) * dpi)
  const mp = (pxW * pxH) / 1_000_000

  // ── 모드 ② 품질 역산 ──
  const iw = Math.max(0, num(imgW))
  const ih = Math.max(0, num(imgH))
  const imgLong = Math.max(iw, ih)
  const imgShort = Math.min(iw, ih)
  /* ⚠️ 예전에는 긴 변·짧은 변을 대응해 낮은 쪽만 썼다 — 그건 '용지를 꽉 채우도록 잘라낸다'는
     가정인데 설명이 없었다. 맞춤/채우기를 사용자가 고르고 잘리는 비율도 보여준다. */
  const ff = fitFill(iw, ih, sizeMM.w, sizeMM.h)
  const effDpi = sizeInvalid ? 0 : (fitMode === 'fill' ? ff.fillPpi : ff.fitPpi)
  const band = bandFor(effDpi)
  /* 용도 목표 대비 판정 — 절대 밴드만 쓰면 원거리 인쇄물을 부당하게 '부적합'이라 답한다 */
  const verdict = judgeForUse(effDpi, dpi, uc.label)
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
        <span className={s.cardLabel} id="pr-size-label">인쇄 크기</span>
        <div className={s.selectWrap}>
          <select aria-labelledby="pr-size-label" className={s.select} value={sizeId} onChange={(e) => setSizeId(e.target.value)}>
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
          <>
            <div className={s.row2} style={{ marginTop: 10 }}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="pr-cw">가로 (mm)</label>
                <input id="pr-cw" className={s.input} type="text" inputMode="decimal" value={cw} onChange={(e) => setCw(e.target.value.replace(/[^0-9.]/g, ''))} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="pr-ch">세로 (mm)</label>
                <input id="pr-ch" className={s.input} type="text" inputMode="decimal" value={ch} onChange={(e) => setCh(e.target.value.replace(/[^0-9.]/g, ''))} />
              </div>
            </div>
            {sizeInvalid && <p className={s.errText} role="alert">가로·세로를 0보다 큰 값으로 입력하세요.</p>}
          </>
        ) : (
          <p className={s.dim}>{cm1(baseMM.w)} × {cm1(baseMM.h)} cm</p>
        )}

        {/* 도련(재단 여유) — 명함·전단·포스터는 사방으로 더 크게 인쇄한 뒤 자른다 */}
        <div className={s.field} style={{ marginTop: 12 }}>
          <span className={s.fieldLabel} id="pr-bleed-label">도련 (재단 여유)</span>
          <div className={s.bleedRow} role="group" aria-labelledby="pr-bleed-label">
            {BLEED_OPTIONS.map((b) => (
              <button key={b} type="button" aria-pressed={bleed === b}
                className={`${s.bleedBtn} ${bleed === b ? s.bleedActive : ''}`}
                onClick={() => setBleed(b)}>
                {b === 0 ? '없음' : `사방 ${b}mm`}
              </button>
            ))}
          </div>
          {bleed > 0 && (
            <p className={s.dim}>
              재단 전 실제 인쇄 크기 <strong>{cm1(sizeMM.w)} × {cm1(sizeMM.h)} cm</strong> (마감 {cm1(baseMM.w)}×{cm1(baseMM.h)}cm + 사방 {bleed}mm)
            </p>
          )}
        </div>
      </div>

      {mode === 'forward' ? (
        <>
          {/* 용도 → DPI */}
          <div className={s.card}>
            <span className={s.cardLabel}>용도 (권장 해상도 자동)</span>
            <div className={s.ucGrid}>
              {USE_CASES.map((u) => (
                <button key={u.id} type="button"
                  aria-pressed={ucId === u.id && !dpiStr.trim()}
                  className={`${s.ucBtn} ${ucId === u.id && !dpiStr.trim() ? s.ucActive : ''}`}
                  onClick={() => { setUcId(u.id); setDpiStr('') }}>
                  <span className={s.ucLabel}>{u.label}</span>
                  <span className={s.ucDpi}>{u.dpi} DPI</span>
                </button>
              ))}
            </div>
            <div className={s.field} style={{ marginTop: 12 }}>
              <label className={s.fieldLabel} htmlFor="pr-dpi">또는 해상도(PPI) 직접 입력</label>
              <input id="pr-dpi" className={s.input} type="text" inputMode="numeric" placeholder={`${uc.dpi}`} value={dpiStr} onChange={(e) => setDpiStr(e.target.value.replace(/[^0-9]/g, ''))} />
            {dpiInvalid && <p className={s.errText} role="alert">0보다 큰 값을 입력하세요.</p>}
            </div>
          </div>

          {/* 결과 */}
          <div className={s.hero} role="status">
            {sizeInvalid || dpiInvalid ? (
              <>
                <p className={s.heroLead}>입력을 확인하세요</p>
                <p className={s.heroValue}>—</p>
                <p className={s.heroSub}>
                  {sizeInvalid ? '인쇄 크기를 0보다 큰 값으로 입력하세요.' : '해상도를 0보다 큰 값으로 입력하세요.'}
                </p>
              </>
            ) : (
              <>
                <p className={s.heroLead}>필요한 최소 해상도 · {dpi} PPI</p>
                <p className={s.heroValue}><strong>{fmt(pxW)}</strong> × <strong>{fmt(pxH)}</strong> px</p>
                <p className={s.heroSub}>
                  약 {mp.toFixed(1)} 메가픽셀 · {cm1(sizeMM.w)}×{cm1(sizeMM.h)}cm
                  {bleed > 0 && ' (도련 포함)'}
                </p>
                <div className={s.hintBox}>📷 {cameraHint(mp)}</div>
              </>
            )}
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

          {/* 맞춤 / 채우기 — 종횡비가 다를 때 무엇을 가정하는지 */}
          <div className={s.card}>
            <span className={s.cardLabel} id="pr-fit-label">이미지를 용지에 어떻게 앉히나요?</span>
            <div className={s.bleedRow} role="group" aria-labelledby="pr-fit-label">
              <button type="button" aria-pressed={fitMode === 'fill'}
                className={`${s.bleedBtn} ${fitMode === 'fill' ? s.bleedActive : ''}`}
                onClick={() => setFitMode('fill')}>채우기 (여백 없이·일부 잘림)</button>
              <button type="button" aria-pressed={fitMode === 'fit'}
                className={`${s.bleedBtn} ${fitMode === 'fit' ? s.bleedActive : ''}`}
                onClick={() => setFitMode('fit')}>맞춤 (전체 유지·여백 생김)</button>
            </div>
            {iw > 0 && ih > 0 && !sizeInvalid && (
              <p className={s.dim}>
                {fitMode === 'fill'
                  ? ff.cropFrac > 0.005
                    ? <>이미지의 <strong>약 {(ff.cropFrac * 100).toFixed(1)}%</strong>가 잘려 나갑니다(짧은 축 기준). 종횡비가 같으면 잘림이 없습니다.</>
                    : <>이미지와 용지 비율이 거의 같아 잘리는 부분이 없습니다.</>
                  : <>전체 이미지를 남기면 실제 인쇄 크기는 <strong>{cm1(ff.fitLongMm)} × {cm1(ff.fitShortMm)} cm</strong>이고 나머지는 여백입니다.</>}
              </p>
            )}
          </div>

          {/* 용도 — 목표 해상도 기준선 */}
          <div className={s.card}>
            <span className={s.cardLabel}>어떤 용도로 인쇄하나요? (판정 기준)</span>
            <div className={s.ucGrid}>
              {USE_CASES.filter((u) => u.id !== 'screen').map((u) => (
                <button key={u.id} type="button"
                  aria-pressed={ucId === u.id && !dpiStr.trim()}
                  className={`${s.ucBtn} ${ucId === u.id && !dpiStr.trim() ? s.ucActive : ''}`}
                  onClick={() => { setUcId(u.id); setDpiStr('') }}>
                  <span className={s.ucLabel}>{u.label}</span>
                  <span className={s.ucDpi}>{u.dpi} DPI</span>
                </button>
              ))}
            </div>
          </div>

          {/* 결과 — 선택 크기 품질 */}
          <div className={s.hero}>
            <span className={s.bandBadge} style={{ background: `color-mix(in srgb, ${band.tint} 16%, transparent)`, borderColor: band.tint }}>
              <span className={s.bandDot} style={{ background: band.tint }} />{band.label}
            </span>
            <p className={s.heroValue} style={{ color: band.ink }}>{Math.round(effDpi)} PPI</p>
            <p className={s.heroSub}>{SIZE_MAP[sizeId]?.name ?? '직접 입력'} 크기로 인쇄 시 · {band.desc}</p>
            <p className={s.verdictBox}>
              <strong>{uc.label} 기준 {verdict.verdict}</strong> — {verdict.message}
            </p>
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
                    <span className={s.maxDpi}><span className={s.maxDot} style={{ background: b.tint }} />{q} DPI <span className={s.maxBand}>{b.label}</span></span>
                    <span className={s.maxSize}>{iw > 0 && ih > 0 ? `${longCm.toFixed(1)} × ${shortCm.toFixed(1)} cm` : '—'}</span>
                  </div>
                )
              })}
            </div>
            <p className={s.helpText}>
              현수막·대형 포스터처럼 멀리서 보는 인쇄물은 100 DPI 이하로도 충분합니다. 가까이서 보는 사진·명함은 300 DPI를 권장해요.
              <br />위 &quot;고품질·우수&quot; 라벨은 <strong>가까이서 보는 인쇄</strong>를 전제한 절대 기준입니다 —
              멀리서 보는 인쇄물이라면 라벨이 낮게 나와도 용도 기준 판정을 보세요.
            </p>
          </div>
        </>
      )}

      {/* 권장 DPI 참고 */}
      <div className={s.card}>
        <span className={s.cardLabel}>용도별 권장 해상도 (PPI)</span>
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
