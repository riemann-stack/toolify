/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './exposure.module.css'
import {
  APERTURES, SHUTTERS, ISOS, ND_FILTERS, CROPS, SCENES, VIDEO_FPS,
  type CropFactor,
  calcEV, generateEquivalents, dofRating, blurRating, noiseRating,
  rule500, calcNDStackedShutter, fmtShutter, fmt, fmtStop, getCrop,
  nearestApertureIdx, nearestShutterIdx, nearestIsoIdx,
} from './exposureUtils'

type AxisId = 'aperture' | 'shutter' | 'iso'

type Tab = 'expo' | 'nd' | 'scene' | 'tradeoff'

const STORAGE_KEY = 'youtil_exposure_v2'  // v2: 1/3 stop ISO·셔터로 인덱스 체계 변경

export default function ExposureClient() {
  const [tab, setTab] = useState<Tab>('expo')

  /* 3축 슬라이더 인덱스 (기본 f/4 · 1/250 · ISO 200) */
  const [aptIdx, setAptIdx] = useState<number>(() => nearestApertureIdx(4))
  const [shIdx, setShIdx] = useState<number>(() => nearestShutterIdx(1 / 250))
  const [isoIdx, setIsoIdx] = useState<number>(() => nearestIsoIdx(200))

  /* 독립 잠금 — 각 축 토글 (최대 2개) */
  const [aptLocked, setAptLocked] = useState(false)
  const [shLocked,  setShLocked]  = useState(false)
  const [isoLocked, setIsoLocked] = useState(false)
  const lockCount = (aptLocked ? 1 : 0) + (shLocked ? 1 : 0) + (isoLocked ? 1 : 0)

  /* ND 필터 */
  const [ndId, setNdId] = useState<string>('nd8')
  const [ndStack, setNdStack] = useState<string>('none') // 추가 적층

  /* 가이드 */
  const [crop, setCrop] = useState<CropFactor>('ff')
  const [focalLength, setFocalLength] = useState<number>(20)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (typeof j.aptIdx === 'number') setAptIdx(j.aptIdx)
      if (typeof j.shIdx === 'number') setShIdx(j.shIdx)
      if (typeof j.isoIdx === 'number') setIsoIdx(j.isoIdx)
      if (typeof j.aptLocked === 'boolean') setAptLocked(j.aptLocked)
      if (typeof j.shLocked === 'boolean') setShLocked(j.shLocked)
      if (typeof j.isoLocked === 'boolean') setIsoLocked(j.isoLocked)
      if (j.crop) setCrop(j.crop)
      if (j.ndId) setNdId(j.ndId)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        aptIdx, shIdx, isoIdx,
        aptLocked, shLocked, isoLocked,
        crop, ndId,
      }))
    } catch {}
  }, [aptIdx, shIdx, isoIdx, aptLocked, shLocked, isoLocked, crop, ndId])

  /* 현재 값 */
  const apt = APERTURES[aptIdx]
  const sh = SHUTTERS[shIdx]
  const iso = ISOS[isoIdx]
  const ev = calcEV(apt.value, sh.value, iso.value)

  /* 베이스라인 (초기 셋팅 f/4·1/250·ISO 200) 대비 stop 변화 */
  const baselineEV = calcEV(4, 1 / 250, 200)
  const stopFromBaseline = ev - baselineEV

  /* 등가 노출 5종 */
  const equivalents = useMemo(
    () => generateEquivalents(aptIdx, shIdx, isoIdx),
    [aptIdx, shIdx, isoIdx]
  )

  /**
   * 슬라이더 변경:
   * - 자신이 잠겨있으면 무시
   * - 다른 두 축 중 정확히 1개가 잠겨있으면 → 나머지 1개로 보정 (등가 노출 유지)
   * - 그 외 (0개 또는 2개 잠금) → 그대로 EV 변화
   *
   * stop diff 부호:
   *  - aperture 인덱스 +1 = 1/3 stop 어두워짐
   *  - shutter  인덱스 +1 = 1 stop 어두워짐 (빠른 셔터)
   *  - iso      인덱스 +1 = 1 stop 밝아짐
   */
  /* 세 축 모두 1/3 stop 단계 → 보정은 동일 인덱스 양만큼 정확히 상쇄 (반올림·배수 불필요) */
  const onApertureChange = (newIdx: number) => {
    if (aptLocked || newIdx === aptIdx) return
    const d = newIdx - aptIdx  // +d = 어두워짐
    setAptIdx(newIdx)
    if (shLocked && !isoLocked) {
      setIsoIdx(clampIdx(isoIdx + d, ISOS.length))      // 어두워지면 ISO ↑
    } else if (isoLocked && !shLocked) {
      setShIdx(clampIdx(shIdx - d, SHUTTERS.length))    // 어두워지면 셔터 느리게(↓)
    }
  }

  const onShutterChange = (newIdx: number) => {
    if (shLocked || newIdx === shIdx) return
    const d = newIdx - shIdx  // 인덱스 ↑ = 빠름 = 어두워짐
    setShIdx(newIdx)
    if (aptLocked && !isoLocked) {
      setIsoIdx(clampIdx(isoIdx + d, ISOS.length))      // 어두워지면 ISO ↑
    } else if (isoLocked && !aptLocked) {
      setAptIdx(clampIdx(aptIdx - d, APERTURES.length)) // 어두워지면 조리개 열기(↓)
    }
  }

  const onIsoChange = (newIdx: number) => {
    if (isoLocked || newIdx === isoIdx) return
    const d = newIdx - isoIdx  // 인덱스 ↑ = ISO ↑ = 밝아짐
    setIsoIdx(newIdx)
    if (aptLocked && !shLocked) {
      setShIdx(clampIdx(shIdx + d, SHUTTERS.length))    // 밝아지면 셔터 빠르게(↑)
    } else if (shLocked && !aptLocked) {
      setAptIdx(clampIdx(aptIdx + d, APERTURES.length)) // 밝아지면 조리개 닫기(↑)
    }
  }

  /** 잠금 토글 — 이미 잠겨있으면 해제, 아니면 잠금. 단 잠금 갯수 ≥ 2일 때 새로 잠그는 건 거부. */
  const toggleLock = (axis: AxisId) => {
    const isLocked =
      axis === 'aperture' ? aptLocked :
      axis === 'shutter'  ? shLocked :
      isoLocked
    if (!isLocked && lockCount >= 2) return
    if (axis === 'aperture') setAptLocked(!aptLocked)
    else if (axis === 'shutter') setShLocked(!shLocked)
    else setIsoLocked(!isoLocked)
  }

  const dof = dofRating(apt.value)
  const blur = blurRating(sh.value)
  const noise = noiseRating(iso.value)

  /* 시각 미리보기 파라미터 (근사 시뮬레이션) */
  const previewBrightness = Math.max(0.3, Math.min(2.2, Math.pow(2, -stopFromBaseline * 0.7)))
  const bokehBlur = Math.max(0, Math.min(22, Math.round(20 / apt.value)))     // 조리개 넓을수록(작은 f) 배경 흐림 ↑
  const motionBlur =
    sh.value >= 1 / 2   ? 16 :
    sh.value >= 1 / 15  ? 9  :
    sh.value >= 1 / 60  ? 4  :
    sh.value >= 1 / 250 ? 1.5 : 0                                              // 셔터 느릴수록 모션 블러 ↑
  const grainOpacity = ((noise.level - 1) / 4) * 0.55                          // ISO 높을수록 노이즈 ↑

  /* ND 필터 계산 */
  const nd = ND_FILTERS.find((f) => f.id === ndId) ?? ND_FILTERS[2]
  const ndStackFilter = ndStack === 'none' ? null : (ND_FILTERS.find((f) => f.id === ndStack) ?? null)
  const totalNDStops = nd.stops + (ndStackFilter ? ndStackFilter.stops : 0)
  const ndShutter = calcNDStackedShutter(sh.value, totalNDStops)

  /* 별 사진 500 룰 */
  const star500 = rule500(focalLength, crop)

  /* 씬 적용 */
  const applyScene = (scene: typeof SCENES[number]) => {
    setAptIdx(nearestApertureIdx(scene.aperture))
    setShIdx(nearestShutterIdx(scene.shutter))
    setIsoIdx(nearestIsoIdx(scene.iso))
  }

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'expo' ? s.tabActive : ''}`} onClick={() => setTab('expo')}>📐 노출 환산</button>
        <button className={`${s.tab} ${tab === 'nd' ? s.tabActive : ''}`} onClick={() => setTab('nd')}>🌑 ND 필터</button>
        <button className={`${s.tab} ${tab === 'scene' ? s.tabActive : ''}`} onClick={() => setTab('scene')}>🎬 상황 가이드</button>
        <button className={`${s.tab} ${tab === 'tradeoff' ? s.tabActive : ''}`} onClick={() => setTab('tradeoff')}>⚖️ 트레이드오프</button>
      </div>

      {/* ───── 탭 1: 노출 환산 ───── */}
      {tab === 'expo' && (
        <>
          {/* 슬라이더 3축 — 먼저 자유롭게 움직여 보기 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🎛️ 3축 슬라이더</span>

            {/* 조리개 */}
            <div className={s.sliderBlock}>
              <div className={s.sliderHead}>
                <span className={s.sliderLabel}>🌀 조리개 (Aperture)</span>
                <span className={`${s.sliderValue} ${aptLocked ? s.locked : ''}`}>
                  {apt.label} {aptLocked && '🔒'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={APERTURES.length - 1}
                step={1}
                value={aptIdx}
                onChange={(e) => onApertureChange(Number(e.target.value))}
                disabled={aptLocked}
                className={s.slider}
              />
              <div className={s.sliderTicks}>
                {APERTURES.filter((a) => a.isFull).map((a) => (
                  <span key={a.label}>{a.label.replace('f/', '')}</span>
                ))}
              </div>
            </div>

            {/* 셔터 */}
            <div className={s.sliderBlock}>
              <div className={s.sliderHead}>
                <span className={s.sliderLabel}>⏱️ 셔터스피드 (Shutter)</span>
                <span className={`${s.sliderValue} ${shLocked ? s.locked : ''}`}>
                  {sh.label} {shLocked && '🔒'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={SHUTTERS.length - 1}
                step={1}
                value={shIdx}
                onChange={(e) => onShutterChange(Number(e.target.value))}
                disabled={shLocked}
                className={s.slider}
              />
              <div className={s.sliderTicks}>
                <span>30s</span>
                <span>1s</span>
                <span>1/30</span>
                <span>1/500</span>
                <span>1/8000</span>
              </div>
            </div>

            {/* ISO */}
            <div className={s.sliderBlock}>
              <div className={s.sliderHead}>
                <span className={s.sliderLabel}>📊 ISO 감도</span>
                <span className={`${s.sliderValue} ${isoLocked ? s.locked : ''}`}>
                  {iso.label} {isoLocked && '🔒'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={ISOS.length - 1}
                step={1}
                value={isoIdx}
                onChange={(e) => onIsoChange(Number(e.target.value))}
                disabled={isoLocked}
                className={s.slider}
              />
              <div className={s.sliderTicks}>
                <span>50</span>
                <span>200</span>
                <span>1600</span>
                <span>12800</span>
                <span>51200</span>
              </div>
            </div>
          </div>

          {/* 잠금 토글 (옵션) — 각 축 독립, 최대 2개 */}
          <div className={s.card}>
            <span className={s.cardLabel}>
              🔒 축 잠금 (옵션)
              <span className={s.lockCounter}>{lockCount}/2</span>
            </span>
            <div className={s.lockRow}>
              {([
                { id: 'aperture' as const, icon: '🌀', short: '조리개', locked: aptLocked },
                { id: 'shutter'  as const, icon: '⏱️', short: '셔터',   locked: shLocked },
                { id: 'iso'      as const, icon: '📊', short: 'ISO',    locked: isoLocked },
              ]).map((ax) => {
                const disabled = !ax.locked && lockCount >= 2
                return (
                  <button
                    key={ax.id}
                    className={`${s.lockBtn} ${ax.locked ? s.lockBtnActive : ''}`}
                    onClick={() => toggleLock(ax.id)}
                    disabled={disabled}
                    aria-pressed={ax.locked}
                  >
                    <span className={s.lockEmoji}>{ax.locked ? '🔒' : ax.icon}</span>
                    <span className={s.lockText}>{ax.short}</span>
                  </button>
                )
              })}
            </div>
            <p className={s.lockHint}>
              {lockCount === 0 && (
                <>💡 <strong>자유 모드</strong> — 각 슬라이더가 EV를 그대로 바꿉니다. 한 축을 잠그면 다른 축이 자동 보정되어 같은 노출을 유지합니다.</>
              )}
              {lockCount === 1 && (
                <>🔁 <strong>등가 노출 모드</strong> — 잠긴 축은 고정. 나머지 두 축 중 하나를 움직이면 다른 하나가 자동 보정되어 같은 EV가 유지됩니다.</>
              )}
              {lockCount === 2 && (
                <>🎯 <strong>1축 자유 모드</strong> — 두 축이 고정됐으므로 남은 한 축을 움직이면 EV가 바뀝니다(노출이 달라짐).</>
              )}
            </p>
          </div>

          {/* EV 결과 */}
          <div className={s.heroCard}>
            <div>
              <p className={s.heroLabel}>현재 EV (ISO 100 기준 환산)</p>
              <p className={s.heroValue}>
                EV <span className={s.heroNum}>{fmt(ev, 1)}</span>
              </p>
              <p className={s.heroSub}>
                기본값(f/4 · 1/250 · ISO 200) 대비 <strong className={stopFromBaseline >= 0 ? s.bright : s.dark}>{fmtStop(-stopFromBaseline)}</strong>
                {stopFromBaseline >= 0 ? ' 더 어두움' : ' 더 밝음'}
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroEvDesc}>{describeEV(ev)}</p>
            </div>
          </div>

          {/* 노출 시각 미리보기 */}
          <div className={s.card}>
            <span className={s.cardLabel}>👁️ 노출 미리보기 (시뮬레이션)</span>
            <div className={s.previewBox}>
              <div className={s.previewScene} style={{ filter: `brightness(${previewBrightness.toFixed(2)})` }}>
                <div className={s.previewBg} style={{ filter: `blur(${bokehBlur}px)` }}>
                  <span className={s.previewLight} style={{ left: '18%', top: '32%', background: '#fde68a' }} />
                  <span className={s.previewLight} style={{ left: '64%', top: '24%', background: '#fca5a5' }} />
                  <span className={s.previewLight} style={{ left: '80%', top: '60%', background: '#93c5fd' }} />
                  <span className={s.previewLight} style={{ left: '38%', top: '66%', background: '#86efac' }} />
                </div>
                <div className={s.previewSubject} style={{ filter: motionBlur > 0 ? `blur(${motionBlur}px)` : 'none' }}>🚶</div>
              </div>
              <div className={s.previewGrain} style={{ opacity: grainOpacity.toFixed(2) }} />
            </div>
            <div className={s.previewLegend}>
              <span>☀️ 밝기 <b>{stopFromBaseline <= -0.1 ? '밝음' : stopFromBaseline >= 0.1 ? '어두움' : '적정'}</b></span>
              <span>{dof.emoji} 심도 <b>{dof.label}</b></span>
              <span>{blur.emoji} 흔들림 <b>{blur.label}</b></span>
              <span>{noise.emoji} 노이즈 <b>{noise.label}</b></span>
            </div>
            <p className={s.lockHint}>※ 입력값 기반 근사 시뮬레이션 — 밝기·배경 흐림(심도)·움직임 블러·노이즈를 시각화. 실제 촬영 결과와 다를 수 있습니다.</p>
          </div>

          {/* 등가 노출 5종 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🔁 등가 노출 5종 (같은 밝기 다른 효과)</span>
            <div className={s.equivList}>
              {equivalents.map((eq, i) => (
                <button
                  key={i}
                  className={s.equivItem}
                  onClick={() => { setAptIdx(eq.apertureIdx); setShIdx(eq.shutterIdx); setIsoIdx(eq.isoIdx) }}
                >
                  <span className={s.equivAxis}>
                    <span className={s.equivLabel}>🌀</span>
                    <span className={s.equivVal}>{eq.apertureLabel}</span>
                  </span>
                  <span className={s.equivAxis}>
                    <span className={s.equivLabel}>⏱️</span>
                    <span className={s.equivVal}>{eq.shutterLabel}</span>
                  </span>
                  <span className={s.equivAxis}>
                    <span className={s.equivLabel}>📊</span>
                    <span className={s.equivVal}>{eq.isoLabel}</span>
                  </span>
                  <span className={s.equivApply}>적용 →</span>
                </button>
              ))}
            </div>
            <p className={s.lockHint}>
              💡 같은 EV이지만 효과가 다릅니다. 조리개 ↓ = 보케 ↑ / 셔터 ↑ = 동작 정지 / ISO ↑ = 노이즈
            </p>
          </div>
        </>
      )}

      {/* ───── 탭 2: ND 필터 ───── */}
      {tab === 'nd' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📷 현재 노출</span>
            <div className={s.currentRow}>
              <span><strong>{apt.label}</strong></span>
              <span>·</span>
              <span><strong>{sh.label}</strong></span>
              <span>·</span>
              <span><strong>{iso.label}</strong></span>
              <span className={s.evBadge}>EV {fmt(ev, 1)}</span>
            </div>
            <p className={s.lockHint}>
              ⚠️ 노출 환산 탭에서 설정한 값을 사용합니다. ND 적용 시 셔터스피드만 변경됩니다.
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🌑 ND 필터 선택</span>
            <div className={s.ndGrid}>
              {ND_FILTERS.map((f) => (
                <button
                  key={f.id}
                  className={`${s.ndBtn} ${ndId === f.id ? s.ndBtnActive : ''}`}
                  onClick={() => setNdId(f.id)}
                >
                  <span className={s.ndLabel}>{f.label}</span>
                  <span className={s.ndStops}>{f.stops} stop</span>
                </button>
              ))}
            </div>
            <p className={s.ndUse}>{nd.use}</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>➕ 추가 적층 (옵션)</span>
            <div className={s.ndGrid}>
              <button className={`${s.ndBtn} ${ndStack === 'none' ? s.ndBtnActive : ''}`} onClick={() => setNdStack('none')}>
                <span className={s.ndLabel}>없음</span>
                <span className={s.ndStops}>0 stop</span>
              </button>
              {ND_FILTERS.map((f) => (
                <button
                  key={`stack-${f.id}`}
                  className={`${s.ndBtn} ${ndStack === f.id ? s.ndBtnActive : ''}`}
                  onClick={() => setNdStack(f.id)}
                >
                  <span className={s.ndLabel}>+{f.label}</span>
                  <span className={s.ndStops}>{f.stops} stop</span>
                </button>
              ))}
            </div>
            <p className={s.lockHint}>💡 두 ND 필터를 같이 끼우면 stop이 합산됩니다 (ND8 + ND64 = 9 stop).</p>
          </div>

          <div className={s.heroCard}>
            <div>
              <p className={s.heroLabel}>ND 적용 셔터스피드</p>
              <p className={s.heroValue}>
                <span className={s.heroNum}>{fmtShutter(ndShutter)}</span>
              </p>
              <p className={s.heroSub}>
                원본 <strong>{sh.label}</strong> → ND <strong>{totalNDStops} stop</strong> 추가 → {fmtShutter(ndShutter)}
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroEvDesc}>{describeShutter(ndShutter)}</p>
            </div>
          </div>

          {/* ND 사용 시나리오 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📚 장노출 시나리오 — ND별 권장</span>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>효과</th>
                  <th>권장 셔터</th>
                  <th>권장 ND (대낮 기준)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>물 흐름 살짝 흐림</td><td>1/15 ~ 1/4 초</td><td>ND4 ~ ND8</td></tr>
                <tr><td>폭포 실크 효과</td><td>1/2 ~ 2 초</td><td>ND16 ~ ND32</td></tr>
                <tr><td>파도 안개·구름 흐름</td><td>5 ~ 15 초</td><td>ND64 ~ ND400</td></tr>
                <tr><td>장노출 — 군중 사라짐</td><td>30초 ~ 2 분</td><td>ND400 ~ ND1000</td></tr>
                <tr><td>일주·구름 streak</td><td>2 ~ 5 분</td><td>ND1000 + ND8 적층</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ───── 탭 3: 상황 가이드 ───── */}
      {tab === 'scene' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>☀️ Sunny 16 — 8 상황별 권장 설정</span>
            <div className={s.sceneGrid}>
              {SCENES.map((sc) => (
                <button key={sc.id} className={s.sceneCard} onClick={() => { applyScene(sc); setTab('expo') }}>
                  <div className={s.sceneHead}>
                    <span className={s.sceneEmoji}>{sc.emoji}</span>
                    <div>
                      <p className={s.sceneLabel}>{sc.label}</p>
                      <p className={s.sceneDesc}>{sc.desc}</p>
                    </div>
                    {sc.needTripod && <span className={s.tripodBadge}>🛠️ 삼각대</span>}
                  </div>
                  <div className={s.sceneSpec}>
                    <span>f/{sc.aperture}</span>
                    <span>·</span>
                    <span>{fmtShutter(sc.shutter)}</span>
                    <span>·</span>
                    <span>ISO {sc.iso}</span>
                  </div>
                  <p className={s.sceneTip}>{sc.tip}</p>
                </button>
              ))}
            </div>
            <p className={s.lockHint}>💡 카드를 클릭하면 노출 환산 탭에 자동 적용됩니다.</p>
          </div>

          {/* 별 사진 500 룰 */}
          <div className={s.card}>
            <span className={s.cardLabel}>⭐ 별 사진 500 룰 (점광원 한계 셔터)</span>
            <div className={s.starInputs}>
              <div className={s.field}>
                <label className={s.fieldLabel}>초점거리 (mm)</label>
                <input
                  type="number" inputMode="decimal"
                  min={8}
                  max={400}
                  value={focalLength}
                  onChange={(e) => setFocalLength(Math.max(8, Math.min(400, Number(e.target.value) || 0)))}
                  className={s.input}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>센서 크기</label>
                <select value={crop} onChange={(e) => setCrop(e.target.value as CropFactor)} className={s.input}>
                  {CROPS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label} (×{c.factor})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={s.starResult}>
              <p className={s.starResultLabel}>최대 셔터스피드 (점광원 유지)</p>
              <p className={s.starResultValue}>
                <span className={s.heroNum}>{star500.toFixed(1)}</span> 초
              </p>
              <p className={s.heroSub}>
                500 ÷ ({focalLength}mm × {getCrop(crop).factor}) = {star500.toFixed(2)} 초.
                이 시간을 넘으면 별이 선으로 흐려집니다 (별궤적).
              </p>
            </div>
          </div>

          {/* 영상 셔터 룰 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🎥 영상 180° 셔터 룰 (자연스러운 모션 블러)</span>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>프레임레이트</th>
                  <th>권장 셔터</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {VIDEO_FPS.map((v) => (
                  <tr key={v.fps}>
                    <td><strong>{v.label}</strong></td>
                    <td className={s.mono}>{v.shutterLabel}</td>
                    <td>fps × 2 = 셔터 분모 (180° = 1/(2×fps))</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={s.lockHint}>
              ⚠️ 셔터를 더 빠르게 하면 동작이 끊어보이고, 더 느리게 하면 흐름이 과해집니다. 자연스러운 영상은 180° 룰이 표준.
            </p>
          </div>
        </>
      )}

      {/* ───── 탭 4: 트레이드오프 ───── */}
      {tab === 'tradeoff' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📷 현재 설정의 효과</span>
            <div className={s.currentRow}>
              <span><strong>{apt.label}</strong></span>
              <span>·</span>
              <span><strong>{sh.label}</strong></span>
              <span>·</span>
              <span><strong>{iso.label}</strong></span>
              <span className={s.evBadge}>EV {fmt(ev, 1)}</span>
            </div>
          </div>

          {/* 심도 (조리개) */}
          <div className={s.tradeCard}>
            <div className={s.tradeHead}>
              <span className={s.tradeIcon}>{dof.emoji}</span>
              <div>
                <p className={s.tradeAxis}>🌀 조리개 → 심도 (Depth of Field)</p>
                <p className={s.tradeLabel}>{dof.label}</p>
              </div>
            </div>
            <RatingBar level={dof.level} max={5} color="#0D9488" />
            <p className={s.tradeDesc}>{dof.desc}</p>
            <p className={s.tradeNote}>
              현재 {apt.label} → 5 단계 중 <strong>{dof.level}단계</strong>.
              심도는 조리개·초점거리·피사체 거리에 의해 결정됩니다.
            </p>
          </div>

          {/* 흔들림 (셔터) */}
          <div className={s.tradeCard}>
            <div className={s.tradeHead}>
              <span className={s.tradeIcon}>{blur.emoji}</span>
              <div>
                <p className={s.tradeAxis}>⏱️ 셔터 → 흔들림 위험 (Motion Blur)</p>
                <p className={s.tradeLabel}>{blur.label}{blur.tripod && ' · 🛠️ 삼각대 권장'}</p>
              </div>
            </div>
            <RatingBar level={6 - blur.level} max={5} color="#D97706" />
            <p className={s.tradeDesc}>{blur.desc}</p>
            <p className={s.tradeNote}>
              📐 안전 셔터 룰: <strong>1 / (초점거리 × 크롭 팩터)</strong> 이상.
              50mm 풀프레임 → 1/50 이상, 200mm APS-C → 1/300 이상 권장.
            </p>
          </div>

          {/* 노이즈 (ISO) */}
          <div className={s.tradeCard}>
            <div className={s.tradeHead}>
              <span className={s.tradeIcon}>{noise.emoji}</span>
              <div>
                <p className={s.tradeAxis}>📊 ISO → 노이즈 (Noise / Grain)</p>
                <p className={s.tradeLabel}>{noise.label}</p>
              </div>
            </div>
            <RatingBar level={noise.level} max={5} color="#DB2777" />
            <p className={s.tradeDesc}>{noise.desc}</p>
            <p className={s.tradeNote}>
              💡 최신 풀프레임 카메라(2020~)는 ISO 6400~12800까지 실용 가능.
              크롭/스마트폰은 ISO 1600 이상 노이즈 큼. 노이즈 제거 소프트웨어(Topaz, DxO)로 보정 가능.
            </p>
          </div>

          {/* 종합 트레이드오프 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>⚖️ 노출 3축 효과 요약</span>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>축</th>
                  <th>밝게 (값 ↓)</th>
                  <th>어둡게 (값 ↑)</th>
                  <th>부작용</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🌀 <strong>조리개</strong></td>
                  <td>f/1.4 (열림)</td>
                  <td>f/22 (닫힘)</td>
                  <td>열기 → 심도 ↓ · 닫기 → 회절 흐림</td>
                </tr>
                <tr>
                  <td>⏱️ <strong>셔터</strong></td>
                  <td>30s (느림)</td>
                  <td>1/8000 (빠름)</td>
                  <td>느림 → 흔들림 · 빠름 → 광량 부족</td>
                </tr>
                <tr>
                  <td>📊 <strong>ISO</strong></td>
                  <td>ISO 51200 (높음)</td>
                  <td>ISO 50 (낮음)</td>
                  <td>높음 → 노이즈 · 낮음 → 광량 부족</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── 도우미 ─── */

function clampIdx(v: number, len: number): number {
  return Math.max(0, Math.min(len - 1, v))
}

function describeEV(ev: number): string {
  if (ev >= 16) return '극도 밝음 — 눈, 모래사장, 직사광 반사'
  if (ev >= 14) return '대낮 햇빛 — Sunny 16 권장'
  if (ev >= 12) return '약간 흐림 — 일반 야외'
  if (ev >= 10) return '흐림 — 그늘진 야외'
  if (ev >= 7)  return '실내 밝은 곳 — 창가·LED 조명'
  if (ev >= 4)  return '실내 어둑함 — 백열등'
  if (ev >= 0)  return '야경·실내 어두움 — 삼각대 권장'
  return '극저광 — 별·달빛 (장노출 필수)'
}

function describeShutter(sec: number): string {
  if (sec >= 60) return '극장노출 — 일주·구름 streak (삼각대 + 케이블 릴리즈 필수)'
  if (sec >= 5)  return '장노출 — 안개 같은 파도·구름 (삼각대 필수)'
  if (sec >= 1)  return '중장노출 — 폭포 실크 효과'
  if (sec >= 1/15) return '느린 셔터 — 흐름 살짝 보임'
  return '일반 셔터 — 정지 사진'
}

/* 등급 막대 */
function RatingBar({ level, max, color }: { level: number; max: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 8, marginBottom: 8 }}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < level
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: 8,
              borderRadius: 4,
              background: filled ? color : 'var(--bg3)',
              opacity: filled ? 1 : 0.4,
            }}
          />
        )
      })}
    </div>
  )
}
