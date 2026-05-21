/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './knit-gauge.module.css'
import {
  YARN_WEIGHTS, SIZES_FEMALE, SIZES_MALE, SIZES_KIDS, BODY_PARTS,
  PROJECTS, NEEDLE_TABLE, INC_DEC_GLOSSARY,
  type GaugeUnit, type YarnId, type BodyPartId, type ProjectId,
  normalizeGauge, gaugePerCm, estimateYarnWeight, needleSizeForGauge,
  convertPattern, sizeToCounts, distributeIncDec, estimateYarn,
  getBodyPart, getSize, getYarn,
  fmt, fmtInt, fmtSign,
} from './knitGaugeUtils'

type Tab = 'gauge' | 'pattern' | 'size' | 'tools'

const STORAGE_KEY = 'youtil_knit_gauge_v1'

export default function KnitGaugeClient() {
  const [tab, setTab] = useState<Tab>('gauge')

  /* ═══ 공유 게이지 상태 ═══ */
  const [stsInput, setStsInput] = useState<number>(22)   // 기본 DK
  const [rowsInput, setRowsInput] = useState<number>(30)
  const [unit, setUnit] = useState<GaugeUnit>('10cm')

  /* ═══ 탭 2: 패턴 변환 ═══ */
  const [patternStsGauge, setPatternStsGauge] = useState<number>(20)
  const [patternRowsGauge, setPatternRowsGauge] = useState<number>(28)
  const [patternSts, setPatternSts] = useState<number>(100)
  const [patternRows, setPatternRows] = useState<number>(140)

  /* ═══ 탭 3: 사이즈별 ═══ */
  const [bodyPartId, setBodyPartId] = useState<BodyPartId>('sweater_body')
  const [widthCm, setWidthCm] = useState<number>(50)
  const [heightCm, setHeightCm] = useState<number>(60)
  const [easeUser, setEaseUser] = useState<number>(-0.10)

  /* ═══ 탭 4: 늘림·줄임·실 양 ═══ */
  const [currentSts, setCurrentSts] = useState<number>(60)
  const [targetSts, setTargetSts] = useState<number>(80)
  const [incDecUnit, setIncDecUnit] = useState<'코' | '단'>('코')
  const [yarnId, setYarnId] = useState<YarnId>('dk')
  const [projectId, setProjectId] = useState<ProjectId>('sweater')
  const [yarnSizeId, setYarnSizeId] = useState<string>('female_m')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (typeof j.stsInput === 'number') setStsInput(j.stsInput)
      if (typeof j.rowsInput === 'number') setRowsInput(j.rowsInput)
      if (j.unit) setUnit(j.unit)
      if (typeof j.patternStsGauge === 'number') setPatternStsGauge(j.patternStsGauge)
      if (typeof j.patternRowsGauge === 'number') setPatternRowsGauge(j.patternRowsGauge)
      if (typeof j.patternSts === 'number') setPatternSts(j.patternSts)
      if (typeof j.patternRows === 'number') setPatternRows(j.patternRows)
      if (j.bodyPartId) setBodyPartId(j.bodyPartId)
      if (typeof j.widthCm === 'number') setWidthCm(j.widthCm)
      if (typeof j.heightCm === 'number') setHeightCm(j.heightCm)
      if (typeof j.easeUser === 'number') setEaseUser(j.easeUser)
      if (typeof j.currentSts === 'number') setCurrentSts(j.currentSts)
      if (typeof j.targetSts === 'number') setTargetSts(j.targetSts)
      if (j.incDecUnit) setIncDecUnit(j.incDecUnit)
      if (j.yarnId) setYarnId(j.yarnId)
      if (j.projectId) setProjectId(j.projectId)
      if (j.yarnSizeId) setYarnSizeId(j.yarnSizeId)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stsInput, rowsInput, unit,
        patternStsGauge, patternRowsGauge, patternSts, patternRows,
        bodyPartId, widthCm, heightCm, easeUser,
        currentSts, targetSts, incDecUnit,
        yarnId, projectId, yarnSizeId,
      }))
    } catch {}
  }, [stsInput, rowsInput, unit, patternStsGauge, patternRowsGauge, patternSts, patternRows,
      bodyPartId, widthCm, heightCm, easeUser, currentSts, targetSts, incDecUnit,
      yarnId, projectId, yarnSizeId])

  /* ═══ 정규화 — 모든 게이지를 10cm 기준으로 ═══ */
  const stsPer10cm = useMemo(() => normalizeGauge(stsInput, unit), [stsInput, unit])
  const rowsPer10cm = useMemo(() => normalizeGauge(rowsInput, unit), [rowsInput, unit])

  /* 1cm·1코·1단 */
  const perCm = useMemo(() => gaugePerCm(stsPer10cm, rowsPer10cm), [stsPer10cm, rowsPer10cm])
  const yarnEst = useMemo(() => estimateYarnWeight(stsPer10cm), [stsPer10cm])
  const needleEst = useMemo(() => needleSizeForGauge(stsPer10cm), [stsPer10cm])

  /* ═══ 탭 2 결과 ═══ */
  const conversion = useMemo(
    () => convertPattern({
      patternStsGauge, patternRowsGauge,
      patternSts, patternRows,
      myStsGauge: stsPer10cm, myRowsGauge: rowsPer10cm,
    }),
    [patternStsGauge, patternRowsGauge, patternSts, patternRows, stsPer10cm, rowsPer10cm],
  )

  /* ═══ 탭 3 결과 ═══ */
  const bodyPart = getBodyPart(bodyPartId)
  const ease = bodyPart.ease !== undefined ? easeUser : 0
  const sizeResult = useMemo(
    () => sizeToCounts(widthCm, heightCm, stsPer10cm, rowsPer10cm, ease),
    [widthCm, heightCm, stsPer10cm, rowsPer10cm, ease],
  )

  /* 부위 변경 시 기본값 적용 */
  const applyBodyPart = (id: BodyPartId) => {
    setBodyPartId(id)
    const b = getBodyPart(id)
    setWidthCm(b.defaultW)
    setHeightCm(b.defaultH)
    if (b.ease !== undefined) setEaseUser(b.ease)
  }

  /* 한국 사이즈 칩 적용 (가로 = 가슴/2, 세로 = length) */
  const applySize = (sizeId: string) => {
    const sz = getSize(sizeId)
    if (!sz) return
    setBodyPartId('sweater_body')
    setWidthCm(sz.bust / 2)
    setHeightCm(sz.length)
    setEaseUser(0)
  }

  /* ═══ 탭 4 결과 ═══ */
  const incDecResult = useMemo(
    () => distributeIncDec(currentSts, targetSts, incDecUnit),
    [currentSts, targetSts, incDecUnit],
  )
  const yarnEstimate = useMemo(
    () => estimateYarn(yarnId, projectId, yarnSizeId),
    [yarnId, projectId, yarnSizeId],
  )

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'gauge' ? s.tabActive : ''}`}   onClick={() => setTab('gauge')}>📐 게이지</button>
        <button className={`${s.tab} ${tab === 'pattern' ? s.tabActive : ''}`} onClick={() => setTab('pattern')}>🔄 패턴 변환</button>
        <button className={`${s.tab} ${tab === 'size' ? s.tabActive : ''}`}    onClick={() => setTab('size')}>📏 사이즈별</button>
        <button className={`${s.tab} ${tab === 'tools' ? s.tabActive : ''}`}   onClick={() => setTab('tools')}>📊 늘림·실 양</button>
      </div>

      {/* ═══════════════════ 탭 1: 게이지 입력 ═══════════════════ */}
      {tab === 'gauge' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📏 측정 단위</span>
            <div className={s.unitRow}>
              {([
                { id: '10cm',  label: '10cm² (한국·유럽 표준)' },
                { id: '4inch', label: '4inch² (미국)' },
                { id: '1cm',   label: '1cm² (정밀)' },
              ] as { id: GaugeUnit; label: string }[]).map((u) => (
                <button
                  key={u.id}
                  className={`${s.unitBtn} ${unit === u.id ? s.unitBtnActive : ''}`}
                  onClick={() => setUnit(u.id)}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🧶 내 게이지 입력</span>

            {/* 코 게이지 */}
            <div className={s.field}>
              <div className={s.fieldHead}>
                <label className={s.fieldLabel}>코 수 (가로) / {unit === '4inch' ? '4 inch' : unit === '1cm' ? '1 cm' : '10 cm'}</label>
                <input
                  type="number"
                  value={stsInput}
                  min={unit === '1cm' ? 0.5 : 4}
                  max={unit === '1cm' ? 8 : 60}
                  step={unit === '1cm' ? 0.1 : 0.5}
                  onChange={(e) => setStsInput(Math.max(0.1, Number(e.target.value) || 0))}
                  className={s.numInput}
                />
              </div>
              <input
                type="range"
                min={unit === '1cm' ? 0.5 : 4}
                max={unit === '1cm' ? 8 : 60}
                step={unit === '1cm' ? 0.1 : 0.5}
                value={stsInput}
                onChange={(e) => setStsInput(Number(e.target.value))}
                className={s.slider}
              />
            </div>

            {/* 단 게이지 */}
            <div className={s.field}>
              <div className={s.fieldHead}>
                <label className={s.fieldLabel}>단 수 (세로) / {unit === '4inch' ? '4 inch' : unit === '1cm' ? '1 cm' : '10 cm'}</label>
                <input
                  type="number"
                  value={rowsInput}
                  min={unit === '1cm' ? 0.5 : 4}
                  max={unit === '1cm' ? 10 : 80}
                  step={unit === '1cm' ? 0.1 : 0.5}
                  onChange={(e) => setRowsInput(Math.max(0.1, Number(e.target.value) || 0))}
                  className={s.numInput}
                />
              </div>
              <input
                type="range"
                min={unit === '1cm' ? 0.5 : 4}
                max={unit === '1cm' ? 10 : 80}
                step={unit === '1cm' ? 0.1 : 0.5}
                value={rowsInput}
                onChange={(e) => setRowsInput(Number(e.target.value))}
                className={s.slider}
              />
            </div>

            {/* 빠른 칩 (10cm 기준 표준 게이지) */}
            <div className={s.quickRow}>
              {YARN_WEIGHTS.map((y) => {
                const center = Math.round((y.sts10cm[0] + y.sts10cm[1]) / 2)
                return (
                  <button
                    key={y.id}
                    className={s.quickChip}
                    onClick={() => {
                      setUnit('10cm')
                      setStsInput(center)
                      const rowsCenter = Math.round((y.rows10cm[0] + y.rows10cm[1]) / 2)
                      setRowsInput(rowsCenter)
                    }}
                  >
                    {y.shortLabel} ({center})
                  </button>
                )
              })}
            </div>
          </div>

          {/* 결과 영웅 카드 */}
          <div className={s.heroCard}>
            <div className={s.heroPrimary}>
              <p className={s.heroLabel}>1cm 당</p>
              <p className={s.heroBig}>
                <span className={s.heroNum}>{fmt(perCm.stsPerCm, 2)}</span> 코{' '}
                × <span className={s.heroNum}>{fmt(perCm.rowsPerCm, 2)}</span> 단
              </p>
              <p className={s.heroSub}>
                10cm² 기준 <strong>{fmt(stsPer10cm, 1)}코 × {fmt(rowsPer10cm, 1)}단</strong>
                <br />
                1코 = {fmt(perCm.mmPerSt, 2)}mm · 1단 = {fmt(perCm.mmPerRow, 2)}mm
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroLabel}>실 굵기 추정</p>
              <p className={s.heroEst}>{yarnEst.shortLabel}</p>
              <p className={s.heroSub}>
                CYC {yarnEst.cyc}<br />
                권장 바늘 {fmt(needleEst.recommended, 2)}mm<br />
                <span className={s.muted}>({needleEst.min}–{needleEst.max} mm)</span>
              </p>
            </div>
          </div>

          {/* SVG 게이지 시각화 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🎨 10×10cm 게이지 시각화</span>
            <GaugeSvg stsPer10cm={stsPer10cm} rowsPer10cm={rowsPer10cm} />
            <p className={s.hint}>
              💡 격자가 빽빽할수록 가는 실(높은 게이지). 빨간 점선 = 5코·5단 단위 안내선.
            </p>
          </div>

          {/* 스와치 가이드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📚 게이지 스와치 만드는 법</span>
            <ol className={s.swatchSteps}>
              <li>
                <strong>15×15cm 시험 편물</strong>을 같은 실·바늘로 떠 줍니다.<br />
                <span className={s.muted}>(가장자리 2~3코는 측정에서 제외하기 위해)</span>
              </li>
              <li>
                <strong>물에 적신 후 펴서 말립니다 (블로킹)</strong>.<br />
                <span className={s.muted}>실은 블로킹 후 5~15% 변하므로 필수.</span>
              </li>
              <li>
                가운데 <strong>10×10cm를 핀으로 표시</strong>하고 그 안의 코·단 수를 셉니다.
              </li>
            </ol>
            <p className={s.hint}>
              ⚠️ 흔한 실수: 스와치를 작게 떠서 측정(부정확) / 블로킹 생략 / 너무 빠듯하게 측정.
            </p>
          </div>
        </>
      )}

      {/* ═══════════════════ 탭 2: 패턴 변환 ═══════════════════ */}
      {tab === 'pattern' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📋 패턴 정보 (도안에서)</span>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <label className={s.fieldLabel}>패턴 코 게이지 / 10cm</label>
                <input
                  type="number" min={4} max={60} step={0.5}
                  value={patternStsGauge}
                  onChange={(e) => setPatternStsGauge(Math.max(1, Number(e.target.value) || 1))}
                  className={s.numInput}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>패턴 단 게이지 / 10cm</label>
                <input
                  type="number" min={4} max={80} step={0.5}
                  value={patternRowsGauge}
                  onChange={(e) => setPatternRowsGauge(Math.max(1, Number(e.target.value) || 1))}
                  className={s.numInput}
                />
              </div>
            </div>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <label className={s.fieldLabel}>패턴 코 수 (예: 시작 코)</label>
                <input
                  type="number" min={1} max={1000}
                  value={patternSts}
                  onChange={(e) => setPatternSts(Math.max(1, Number(e.target.value) || 1))}
                  className={s.numInput}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>패턴 단 수 (총 길이)</label>
                <input
                  type="number" min={1} max={5000}
                  value={patternRows}
                  onChange={(e) => setPatternRows(Math.max(1, Number(e.target.value) || 1))}
                  className={s.numInput}
                />
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🧶 내 게이지 (탭 1에서 자동)</span>
            <p className={s.bigGaugeText}>
              <strong>{fmt(stsPer10cm, 1)}</strong>코 × <strong>{fmt(rowsPer10cm, 1)}</strong>단 / 10cm
              <br />
              <span className={s.muted}>📐 변경하려면 [게이지] 탭에서 수정하세요.</span>
            </p>
          </div>

          {/* 결과 */}
          <div className={s.heroCard}>
            <div className={s.heroPrimary}>
              <p className={s.heroLabel}>내 게이지로 환산</p>
              <p className={s.heroBig}>
                <span className={s.heroNum}>{conversion.newSts}</span> 코{' '}
                × <span className={s.heroNum}>{conversion.newRows}</span> 단
              </p>
              <p className={s.heroSub}>
                패턴 {patternSts}코 → <strong>{conversion.newSts}코</strong> ({fmtSign(conversion.newSts - patternSts, 0)})<br />
                패턴 {patternRows}단 → <strong>{conversion.newRows}단</strong> ({fmtSign(conversion.newRows - patternRows, 0)})
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroLabel}>게이지 차이</p>
              <p className={s.deltaPct}>
                코 {fmtSign(conversion.stsDeltaPct, 1)}%<br />
                단 {fmtSign(conversion.rowsDeltaPct, 1)}%
              </p>
            </div>
          </div>

          {/* 코칭 */}
          <div className={s.card}>
            <p className={s.adviceText}>{conversion.needleAdvice}</p>
            {conversion.ratioWarning && (
              <p className={s.warnText}>
                ⚠️ 코·단 비율 차이가 큽니다 ({Math.abs(conversion.stsDeltaPct - conversion.rowsDeltaPct).toFixed(1)}%p).
                길이는 단 수 대신 <strong>cm로 측정</strong>해 작업하세요.
              </p>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════ 탭 3: 사이즈별 ═══════════════════ */}
      {tab === 'size' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>👕 부위 선택</span>
            <div className={s.bodyPartRow}>
              {BODY_PARTS.map((b) => (
                <button
                  key={b.id}
                  className={`${s.bodyPartBtn} ${bodyPartId === b.id ? s.bodyPartBtnActive : ''}`}
                  onClick={() => applyBodyPart(b.id)}
                >
                  {b.emoji} {b.name}
                </button>
              ))}
            </div>
            <p className={s.hint}>{bodyPart.note}</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>📐 치수 입력</span>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <div className={s.fieldHead}>
                  <label className={s.fieldLabel}>가로 (cm)</label>
                  <input
                    type="number" min={1} max={300} step={0.5}
                    value={widthCm}
                    onChange={(e) => setWidthCm(Math.max(1, Number(e.target.value) || 1))}
                    className={s.numInput}
                  />
                </div>
                <input
                  type="range" min={1} max={200} step={0.5}
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className={s.slider}
                />
              </div>
              <div className={s.field}>
                <div className={s.fieldHead}>
                  <label className={s.fieldLabel}>세로 (cm)</label>
                  <input
                    type="number" min={1} max={300} step={0.5}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value) || 1))}
                    className={s.numInput}
                  />
                </div>
                <input
                  type="range" min={1} max={200} step={0.5}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className={s.slider}
                />
              </div>
            </div>

            {/* 신축 보정 (모자·양말만) */}
            {bodyPart.ease !== undefined && (
              <div className={s.field}>
                <div className={s.fieldHead}>
                  <label className={s.fieldLabel}>신축 보정 (negative ease)</label>
                  <span className={s.easeValue}>{(easeUser * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range" min={-0.20} max={0.10} step={0.01}
                  value={easeUser}
                  onChange={(e) => setEaseUser(Number(e.target.value))}
                  className={s.slider}
                />
                <p className={s.hint}>
                  💡 음수 = 둘레보다 작게 떠 늘어났을 때 잘 맞음. 모자·양말은 보통 -10%.
                </p>
              </div>
            )}
          </div>

          {/* 빠른 사이즈 칩 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🇰🇷 한국 표준 사이즈 — 클릭 시 가로(가슴/2) + 세로(길이) 자동 적용</span>
            <div className={s.sizeChipGroup}>
              <p className={s.sizeChipLabel}>여성</p>
              <div className={s.sizeChipRow}>
                {SIZES_FEMALE.map((sz) => (
                  <button key={sz.id} className={s.sizeChip} onClick={() => applySize(sz.id)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.sizeChipGroup}>
              <p className={s.sizeChipLabel}>남성</p>
              <div className={s.sizeChipRow}>
                {SIZES_MALE.map((sz) => (
                  <button key={sz.id} className={s.sizeChip} onClick={() => applySize(sz.id)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.sizeChipGroup}>
              <p className={s.sizeChipLabel}>키즈</p>
              <div className={s.sizeChipRow}>
                {SIZES_KIDS.map((sz) => (
                  <button key={sz.id} className={s.sizeChip} onClick={() => applySize(sz.id)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 결과 */}
          <div className={s.heroCard}>
            <div className={s.heroPrimary}>
              <p className={s.heroLabel}>시작 코 수 × 총 단 수</p>
              <p className={s.heroBig}>
                <span className={s.heroNum}>{sizeResult.sts}</span> 코{' '}
                × <span className={s.heroNum}>{sizeResult.rows}</span> 단
              </p>
              <p className={s.heroSub}>
                {fmt(widthCm, 1)} × {fmt(heightCm, 1)} cm{ease !== 0 ? ` (신축 ${(ease * 100).toFixed(0)}%)` : ''}
                <br />
                실수치: {fmt(sizeResult.stsRaw, 1)}코 × {fmt(sizeResult.rowsRaw, 1)}단
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroLabel}>권장</p>
              <p className={s.heroEst}>
                짝수 {sizeResult.evenSts}<br />
                홀수 {sizeResult.oddSts}
              </p>
              <p className={s.muted} style={{ fontSize: 11 }}>
                스웨터·소매는 보통 짝수,<br />
                가운데 무늬 있으면 홀수
              </p>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════ 탭 4: 늘림·실 양·바늘 ═══════════════════ */}
      {tab === 'tools' && (
        <>
          {/* 섹션 A — 늘림·줄임 분배 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🔢 늘림 / 줄임 균등 분배</span>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <label className={s.fieldLabel}>현재 코 수</label>
                <input
                  type="number" min={1} max={1000}
                  value={currentSts}
                  onChange={(e) => setCurrentSts(Math.max(1, Number(e.target.value) || 1))}
                  className={s.numInput}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>목표 코 수</label>
                <input
                  type="number" min={1} max={1000}
                  value={targetSts}
                  onChange={(e) => setTargetSts(Math.max(1, Number(e.target.value) || 1))}
                  className={s.numInput}
                />
              </div>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel}>분배 단위</label>
              <div className={s.unitRow}>
                <button
                  className={`${s.unitBtn} ${incDecUnit === '코' ? s.unitBtnActive : ''}`}
                  onClick={() => setIncDecUnit('코')}
                >코 (가로 분배)</button>
                <button
                  className={`${s.unitBtn} ${incDecUnit === '단' ? s.unitBtnActive : ''}`}
                  onClick={() => setIncDecUnit('단')}
                >단 (세로 분배)</button>
              </div>
            </div>

            <div className={s.resultBox}>
              <p className={s.resultLabel}>
                {incDecResult.type} {incDecResult.delta}{incDecUnit}
              </p>
              <p className={s.resultText}>{incDecResult.label}</p>
            </div>

            {/* 약어 용어집 */}
            <details className={s.glossary}>
              <summary className={s.glossarySummary}>📖 늘림·줄임 약어 용어집 (펼치기)</summary>
              <div className={s.glossaryGrid}>
                {INC_DEC_GLOSSARY.map((g) => (
                  <div key={g.abbr} className={s.glossaryItem}>
                    <p className={s.glossaryAbbr}>{g.abbr} <span className={s.glossaryType}>{g.type}</span></p>
                    <p className={s.glossaryName}>{g.fullName} · {g.korean}</p>
                    <p className={s.glossaryDesc}>{g.desc}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* 섹션 B — 실 양 추정 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🧶 실 양 추정기</span>

            <div className={s.field}>
              <label className={s.fieldLabel}>실 굵기 (CYC)</label>
              <select value={yarnId} onChange={(e) => setYarnId(e.target.value as YarnId)} className={s.select}>
                {YARN_WEIGHTS.map((y) => (
                  <option key={y.id} value={y.id}>{y.label}</option>
                ))}
              </select>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel}>작품 종류</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value as ProjectId)} className={s.select}>
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
                ))}
              </select>
            </div>

            {/* 사이즈 (스웨터·가디건만) */}
            {(projectId === 'sweater' || projectId === 'cardigan') && (
              <div className={s.field}>
                <label className={s.fieldLabel}>사이즈</label>
                <select value={yarnSizeId} onChange={(e) => setYarnSizeId(e.target.value)} className={s.select}>
                  <optgroup label="여성">
                    {SIZES_FEMALE.map((sz) => <option key={sz.id} value={sz.id}>{sz.label}</option>)}
                  </optgroup>
                  <optgroup label="남성">
                    {SIZES_MALE.map((sz) => <option key={sz.id} value={sz.id}>{sz.label}</option>)}
                  </optgroup>
                  <optgroup label="키즈">
                    {SIZES_KIDS.map((sz) => <option key={sz.id} value={sz.id}>{sz.label}</option>)}
                  </optgroup>
                </select>
              </div>
            )}

            <div className={s.yarnEstResult}>
              <div className={s.yarnEstNum}>
                <p className={s.yarnEstLabel}>총 권장 양</p>
                <p className={s.yarnEstBig}>{fmtInt(yarnEstimate.grams)} g</p>
              </div>
              <div className={s.yarnEstBalls}>
                <p className={s.yarnEstBallText}>50g 실타래 <strong>{yarnEstimate.balls50g}타래</strong></p>
                <p className={s.yarnEstBallText}>100g 실타래 <strong>{yarnEstimate.balls100g}타래</strong></p>
              </div>
            </div>
            <p className={s.hint}>
              💡 {yarnEstimate.note} · 일반 작업 기준 평균값으로, 케이블·컬러워크는 ~30% 더 필요. 여유분 +10% 권장.
            </p>
          </div>

          {/* 섹션 C — 바늘 호수 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🪡 바늘 호수 ↔ 게이지 룩업</span>
            <div className={s.tableWrap}>
              <table className={s.dataTable}>
                <thead>
                  <tr>
                    <th>mm</th>
                    <th>US</th>
                    <th>UK</th>
                    <th>실 굵기</th>
                    <th>코/10cm</th>
                  </tr>
                </thead>
                <tbody>
                  {NEEDLE_TABLE.map((n) => {
                    const isRecommended = Math.abs(n.mm - needleEst.recommended) < 0.3
                    return (
                      <tr key={n.mm} className={isRecommended ? s.rowHighlight : ''}>
                        <td className={s.mono}>{n.mm}</td>
                        <td className={s.mono}>{n.usSize}</td>
                        <td className={s.mono}>{n.ukSize}</td>
                        <td>{n.recommendedYarn}</td>
                        <td className={s.mono}>{n.approxStsGauge}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className={s.hint}>
              💡 보라색 강조 행은 현재 게이지({fmt(stsPer10cm, 1)}코/10cm)에 권장되는 바늘 호수입니다.
            </p>
          </div>

          {/* 실 굵기 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📚 CYC 표준 실 굵기</span>
            <div className={s.tableWrap}>
              <table className={s.dataTable}>
                <thead>
                  <tr>
                    <th>CYC</th>
                    <th>이름</th>
                    <th>코/10cm</th>
                    <th>바늘 mm</th>
                    <th>예시</th>
                  </tr>
                </thead>
                <tbody>
                  {YARN_WEIGHTS.map((y) => {
                    const isCurrent = y.id === yarnEst.id
                    return (
                      <tr key={y.id} className={isCurrent ? s.rowHighlight : ''}>
                        <td className={s.mono}>{y.cyc}</td>
                        <td><strong>{y.shortLabel}</strong></td>
                        <td className={s.mono}>{y.sts10cm[0]}–{y.sts10cm[1]}</td>
                        <td className={s.mono}>{y.needleMm[0]}–{y.needleMm[1]}</td>
                        <td style={{ fontSize: 11.5 }}>{y.examples}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SVG 게이지 시각화
   10×10cm 사각형 안에 코·단 격자 표시
   ───────────────────────────────────────────── */
function GaugeSvg({ stsPer10cm, rowsPer10cm }: { stsPer10cm: number; rowsPer10cm: number }) {
  const W = 320, H = 320
  const padding = 30
  const gridSize = W - padding * 2  /* 10cm을 픽셀로 표현 */

  const stsCount = Math.max(1, Math.round(stsPer10cm))
  const rowsCount = Math.max(1, Math.round(rowsPer10cm))
  const stsStep = gridSize / stsCount
  const rowsStep = gridSize / rowsCount

  /* 격자가 너무 빽빽한 경우(>30) 5단위마다만 표시 */
  const stsSkip = stsCount > 30 ? 2 : 1
  const rowsSkip = rowsCount > 30 ? 2 : 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 360, display: 'block', margin: '0 auto', background: 'var(--bg3)', borderRadius: 8 }}>
      {/* 외곽 사각형 (10×10cm) */}
      <rect
        x={padding} y={padding}
        width={gridSize} height={gridSize}
        fill="var(--bg2)"
        stroke="#9333EA"
        strokeWidth={2}
      />

      {/* 세로선 (코 = 가로 방향) */}
      {Array.from({ length: stsCount + 1 }).map((_, i) => {
        if (i % stsSkip !== 0 && i !== 0 && i !== stsCount) return null
        const x = padding + i * stsStep
        const isFifth = i % 5 === 0
        return (
          <line
            key={`v-${i}`}
            x1={x} y1={padding}
            x2={x} y2={padding + gridSize}
            stroke={isFifth ? '#DB2777' : 'var(--border)'}
            strokeWidth={isFifth ? 0.8 : 0.4}
            strokeDasharray={isFifth ? '2 2' : ''}
            opacity={isFifth ? 0.7 : 0.5}
          />
        )
      })}

      {/* 가로선 (단 = 세로 방향) */}
      {Array.from({ length: rowsCount + 1 }).map((_, i) => {
        if (i % rowsSkip !== 0 && i !== 0 && i !== rowsCount) return null
        const y = padding + i * rowsStep
        const isFifth = i % 5 === 0
        return (
          <line
            key={`h-${i}`}
            x1={padding} y1={y}
            x2={padding + gridSize} y2={y}
            stroke={isFifth ? '#DB2777' : 'var(--border)'}
            strokeWidth={isFifth ? 0.8 : 0.4}
            strokeDasharray={isFifth ? '2 2' : ''}
            opacity={isFifth ? 0.7 : 0.5}
          />
        )
      })}

      {/* 라벨 */}
      <text x={padding + gridSize / 2} y={padding - 10} textAnchor="middle" fill="var(--muted)" fontSize={11} fontFamily="Noto Sans KR, sans-serif">
        ← 10cm ({stsCount}코) →
      </text>
      <text
        x={padding - 14} y={padding + gridSize / 2}
        textAnchor="middle" fill="var(--muted)" fontSize={11} fontFamily="Noto Sans KR, sans-serif"
        transform={`rotate(-90 ${padding - 14} ${padding + gridSize / 2})`}
      >
        ← 10cm ({rowsCount}단) →
      </text>

      {/* 중앙 표시 — Yarn 이름 */}
      <text x={W / 2} y={H - 8} textAnchor="middle" fill="#9333EA" fontSize={12} fontWeight={700} fontFamily="Inter, system-ui, sans-serif">
        {getYarn(estimateYarnWeight(stsPer10cm).id).shortLabel} · {fmt(stsPer10cm, 0)} sts × {fmt(rowsPer10cm, 0)} rows / 10cm
      </text>
    </svg>
  )
}
