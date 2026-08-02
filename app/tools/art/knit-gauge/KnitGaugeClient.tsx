/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './knit-gauge.module.css'
import {
  YARN_WEIGHTS, SIZES_FEMALE, SIZES_MALE, SIZES_KIDS, ALL_SIZES, BODY_PARTS,
  PROJECTS, NEEDLE_TABLE, INC_DEC_GLOSSARY, FIT_PRESETS,
  type GaugeUnit, type YarnId, type BodyPartId, type ProjectId, type SizeMeta,
  normalizeGauge, gaugePerCm, estimateYarnWeight, needleSizeForGauge,
  convertPattern, sizeToCounts, distributeIncDec, distributeShaping, estimateYarn,
  fitToRepeat, skeinPlan, fitPresetForEase, isBelowFitRange, panelWidthFor, denormalizeGauge,
  getBodyPart, getSize, getYarn,
  fmt, fmtInt, fmtSign,
} from './knitGaugeUtils'

type Tab = 'gauge' | 'pattern' | 'size' | 'tools'

const STORAGE_KEY = 'youtil_knit_gauge_v1'

/**
 * 숫자 입력 클램프.
 * - **상한은 즉시 강제**한다. max를 두지 않으면 붙여넣은 거대값이 그대로 상태에 들어가고,
 *   그 값이 SVG 격자 배열 길이(Array.from({length: n}))가 되면 페이지가 죽는다.
 * - **하한은 0(또는 min이 음수면 min)까지만 막는다.** min을 즉시 강제하면
 *   "22 → 15"로 고치려고 첫 글자 1을 치는 순간 4로 튀어 다음 글자가 45가 되어 버린다.
 *   0 이하로 내려가도 계산 함수들이 각자 '계산 불가'·0 반환으로 방어하므로 안전하다.
 *   여유분(ease)처럼 음수가 의미 있는 입력은 min이 음수라 그 값이 그대로 하한이 된다.
 * - 빈 문자열·NaN은 min으로 되돌린다.
 */
const clampNum = (raw: string, min: number, max: number): number => {
  const n = Number(raw)
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(Math.min(0, min), n))
}

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

  /* 무늬 반복 — "8코 반복 + 가장자리 2코" (0 = 사용 안 함) */
  const [repeatMultiple, setRepeatMultiple] = useState<number>(0)
  const [repeatPlus, setRepeatPlus] = useState<number>(0)

  /* ═══ 탭 3: 사이즈별 ═══ */
  const [bodyPartId, setBodyPartId] = useState<BodyPartId>('sweater_body')
  const [widthCm, setWidthCm] = useState<number>(50)
  const [heightCm, setHeightCm] = useState<number>(60)
  const [easeUser, setEaseUser] = useState<number>(-0.10)
  /* 사이즈 칩으로 고른 실제 신체 치수 (직접 입력 시 null로 풀림) */
  const [sizeBaseId, setSizeBaseId] = useState<string | null>(null)
  /* 완성 여유분 cm — CYC Classic fit 구간(+5~+10)의 대표값에서 시작 */
  const [fitEaseCm, setFitEaseCm] = useState<number>(7.5)
  const [workMode, setWorkMode] = useState<'flat' | 'round'>('flat')

  /* ═══ 탭 4: 늘림·줄임·실 양 ═══ */
  const [currentSts, setCurrentSts] = useState<number>(60)
  const [targetSts, setTargetSts] = useState<number>(80)
  const [incDecUnit, setIncDecUnit] = useState<'코' | '단'>('코')
  /* 세로(단) 모드 전용 — 성형 구간 단 수 / 한 성형단당 코 수 */
  const [shapingRows, setShapingRows] = useState<number>(60)
  const [stsPerEvent, setStsPerEvent] = useState<number>(2)
  /* 평면 뜨기는 겉면(RS)에서만 성형하는 것이 통상 — 켜면 간격을 짝수 단으로 맞춘다 */
  const [rsOnly, setRsOnly] = useState<boolean>(true)
  const [yarnId, setYarnId] = useState<YarnId>('dk')
  const [projectId, setProjectId] = useState<ProjectId>('sweater')
  const [yarnSizeId, setYarnSizeId] = useState<string>('female_m')
  /* 실타래 환산 — 가상의 50g/100g이 아니라 실제 라벨 값으로 */
  const [skeinG, setSkeinG] = useState<number>(50)
  const [skeinM, setSkeinM] = useState<number>(0)      // 0 = 미입력
  const [extraPct, setExtraPct] = useState<number>(0)  // 여유율은 사용자 선택 (기본 0 — 권장치를 지어내지 않음)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      /* 오염된 저장값 방어 — 타입만 보면 NaN·Infinity·음수·미지의 enum이 그대로 통과해
         normalizeGauge switch 폴스루(undefined)·0 나눗셈으로 계산이 전부 깨진다. */
      const num = (v: unknown, min: number, max: number): number | null =>
        typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : null
      const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | null =>
        typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null

      const set = <T,>(val: T | null, fn: (v: T) => void) => { if (val !== null) fn(val) }

      set(num(j.stsInput, 0.5, 100), setStsInput)
      set(num(j.rowsInput, 0.5, 100), setRowsInput)
      set(oneOf<GaugeUnit>(j.unit, ['10cm', '4inch', '1cm']), setUnit)
      set(num(j.patternStsGauge, 1, 100), setPatternStsGauge)
      set(num(j.patternRowsGauge, 1, 100), setPatternRowsGauge)
      set(num(j.patternSts, 1, 5000), setPatternSts)
      set(num(j.patternRows, 1, 5000), setPatternRows)
      set(oneOf<BodyPartId>(j.bodyPartId, BODY_PARTS.map((b) => b.id)), setBodyPartId)
      set(num(j.widthCm, 1, 300), setWidthCm)
      set(num(j.heightCm, 1, 300), setHeightCm)
      set(num(j.easeUser, -0.5, 0.5), setEaseUser)
      set(num(j.currentSts, 1, 1000), setCurrentSts)
      set(num(j.targetSts, 1, 1000), setTargetSts)
      set(oneOf<'코' | '단'>(j.incDecUnit, ['코', '단']), setIncDecUnit)
      set(oneOf<YarnId>(j.yarnId, YARN_WEIGHTS.map((y) => y.id)), setYarnId)
      set(oneOf<ProjectId>(j.projectId, PROJECTS.map((p) => p.id)), setProjectId)
      set(oneOf(j.yarnSizeId, ALL_SIZES.map((sz) => sz.id)), setYarnSizeId)
      set(num(j.repeatMultiple, 0, 60), setRepeatMultiple)
      set(num(j.repeatPlus, 0, 60), setRepeatPlus)
      set(num(j.fitEaseCm, -20, 40), setFitEaseCm)
      set(oneOf<'flat' | 'round'>(j.workMode, ['flat', 'round']), setWorkMode)
      set(num(j.shapingRows, 1, 1000), setShapingRows)
      set(num(j.stsPerEvent, 1, 20), setStsPerEvent)
      if (typeof j.rsOnly === 'boolean') setRsOnly(j.rsOnly)
      set(num(j.skeinG, 1, 1000), setSkeinG)
      set(num(j.skeinM, 0, 5000), setSkeinM)
      set(num(j.extraPct, 0, 50), setExtraPct)
      /* sizeBaseId는 null이 정상값이라 oneOf로 걸러 유효한 id일 때만 복원 */
      set(oneOf(j.sizeBaseId, ALL_SIZES.map((sz) => sz.id)), setSizeBaseId)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        stsInput, rowsInput, unit,
        patternStsGauge, patternRowsGauge, patternSts, patternRows, repeatMultiple, repeatPlus,
        bodyPartId, widthCm, heightCm, easeUser, sizeBaseId, fitEaseCm, workMode,
        currentSts, targetSts, incDecUnit, shapingRows, stsPerEvent, rsOnly,
        yarnId, projectId, yarnSizeId, skeinG, skeinM, extraPct,
      }))
    } catch {}
  }, [stsInput, rowsInput, unit, patternStsGauge, patternRowsGauge, patternSts, patternRows,
      repeatMultiple, repeatPlus, bodyPartId, widthCm, heightCm, easeUser, sizeBaseId, fitEaseCm,
      workMode, currentSts, targetSts, incDecUnit, shapingRows, stsPerEvent, rsOnly,
      yarnId, projectId, yarnSizeId, skeinG, skeinM, extraPct])

  /* ═══ 정규화 — 모든 게이지를 10cm 기준으로 ═══ */
  const stsPer10cm = useMemo(() => normalizeGauge(stsInput, unit), [stsInput, unit])
  const rowsPer10cm = useMemo(() => normalizeGauge(rowsInput, unit), [rowsInput, unit])

  /* 1cm·1코·1단 */
  const perCm = useMemo(() => gaugePerCm(stsPer10cm, rowsPer10cm), [stsPer10cm, rowsPer10cm])
  /* 입력을 비우면 0이 들어온다. 0코/10cm를 그대로 추정에 넘기면 폴백이 'Jumbo · 12.75mm'라는
     그럴듯하지만 완전히 틀린 답을 내므로, 유효 게이지가 아닐 때는 추정 자체를 보류한다. */
  const gaugeReady = stsPer10cm > 0 && rowsPer10cm > 0
  const yarnEst = useMemo(() => estimateYarnWeight(stsPer10cm), [stsPer10cm])
  const needleEst = useMemo(() => needleSizeForGauge(stsPer10cm), [stsPer10cm])
  /* 바늘 표에서 강조할 행 — 권장 mm에 가장 가까운 실제 호수 1개 */
  const nearestNeedleMm = useMemo(() => {
    let best = NEEDLE_TABLE[0].mm
    let d = Infinity
    for (const n of NEEDLE_TABLE) {
      const dist = Math.abs(n.mm - needleEst.recommended)
      if (dist < d) { d = dist; best = n.mm }
    }
    return best
  }, [needleEst.recommended])

  /* ═══ 탭 2 결과 ═══ */
  const conversion = useMemo(
    () => convertPattern({
      patternStsGauge, patternRowsGauge,
      patternSts, patternRows,
      myStsGauge: stsPer10cm, myRowsGauge: rowsPer10cm,
    }),
    [patternStsGauge, patternRowsGauge, patternSts, patternRows, stsPer10cm, rowsPer10cm],
  )

  /* 무늬 반복 보정 (0 = 사용 안 함) */
  const repeatFit = useMemo(
    () => (repeatMultiple >= 2 && !conversion.invalid ? fitToRepeat(conversion.newSts, repeatMultiple, repeatPlus) : null),
    [conversion.newSts, conversion.invalid, repeatMultiple, repeatPlus],
  )

  /* ═══ 탭 3 결과 ═══ */
  const bodyPart = getBodyPart(bodyPartId)
  const ease = bodyPart.ease !== undefined ? easeUser : 0
  const lengthEaseCm = bodyPart.lengthEaseCm ?? 0
  /* 가로 입력이 '둘레'인지 '한 장의 폭'인지 — 모자·양말은 항상 둘레, 스웨터는 사용자가 선택 */
  const canChooseMode = bodyPart.widthMeaning === 'either'
  const effectiveMode: 'flat' | 'round' =
    bodyPart.widthMeaning === 'circumference' ? 'round' : canChooseMode ? workMode : 'flat'
  const widthIsCircumference = effectiveMode === 'round' || bodyPart.widthMeaning === 'circumference'

  const sizeResult = useMemo(
    () => sizeToCounts(widthCm, heightCm, stsPer10cm, rowsPer10cm, ease, lengthEaseCm),
    [widthCm, heightCm, stsPer10cm, rowsPer10cm, ease, lengthEaseCm],
  )

  const round1 = (n: number) => Math.round(n * 10) / 10
  const round2 = (n: number) => Math.round(n * 100) / 100

  /* 측정 단위를 바꿀 때 값을 그대로 두면 22코/10cm가 22코/1cm(=220코/10cm)로 조용히 10배가 된다.
     실제 게이지(10cm 환산값)를 유지하도록 표시값을 다시 계산한다. */
  const changeUnit = (next: GaugeUnit) => {
    if (next === unit) return
    const sts10 = normalizeGauge(stsInput, unit)
    const rows10 = normalizeGauge(rowsInput, unit)
    setUnit(next)
    setStsInput(round2(denormalizeGauge(sts10, next)))
    setRowsInput(round2(denormalizeGauge(rows10, next)))
  }
  const baseSize = sizeBaseId ? getSize(sizeBaseId) : undefined
  const finishedCircumference = baseSize ? baseSize.bust + fitEaseCm : null
  const currentFit = fitPresetForEase(fitEaseCm)

  /* 부위 변경 시 기본값 적용 */
  const applyBodyPart = (id: BodyPartId) => {
    setBodyPartId(id)
    const b = getBodyPart(id)
    setWidthCm(b.defaultW)
    setHeightCm(b.defaultH)
    setSizeBaseId(null)
    if (b.ease !== undefined) setEaseUser(b.ease)
  }

  /* 사이즈·여유분·작업 방식 중 하나라도 바뀌면 가로 치수를 다시 유도한다.
     예전에는 칩이 무조건 '가슴/2'를 넣어서, 원형 몸통을 뜨면 둘레가 절반인 옷이 나오고
     여유분은 아예 0(몸에 붙는 핏)으로 고정돼 있었다. */
  const deriveWidth = (sz: SizeMeta, easeCm: number, mode: 'flat' | 'round') =>
    round1(panelWidthFor(sz.bust + easeCm, mode))

  /** 사이즈 칩은 항상 스웨터 몸통 기준이다 — 모자·양말에서 눌러도 부위를 스웨터로 옮긴다.
      스웨터 몸통은 widthMeaning이 'either'라 유도 기준은 언제나 사용자가 고른 workMode다. */
  const applySize = (sizeId: string) => {
    const sz = getSize(sizeId)
    if (!sz) return
    setBodyPartId('sweater_body')
    setSizeBaseId(sizeId)
    setWidthCm(deriveWidth(sz, fitEaseCm, workMode))
    setHeightCm(sz.length)
  }

  const applyFitEase = (cm: number) => {
    setFitEaseCm(cm)
    if (baseSize) setWidthCm(deriveWidth(baseSize, cm, effectiveMode))
  }

  const applyWorkMode = (m: 'flat' | 'round') => {
    setWorkMode(m)
    if (baseSize) setWidthCm(deriveWidth(baseSize, fitEaseCm, m))
  }

  /* ═══ 탭 4 결과 ═══ */
  const incDecResult = useMemo(
    () => distributeIncDec(currentSts, targetSts),
    [currentSts, targetSts],
  )
  const shapingResult = useMemo(
    () => distributeShaping(shapingRows, currentSts, targetSts, stsPerEvent, rsOnly),
    [shapingRows, currentSts, targetSts, stsPerEvent, rsOnly],
  )
  const yarnEstimate = useMemo(
    () => estimateYarn(yarnId, projectId, yarnSizeId),
    [yarnId, projectId, yarnSizeId],
  )
  const skeins = useMemo(
    () => skeinPlan(yarnEstimate.grams, skeinG, skeinM > 0 ? skeinM : null, extraPct),
    [yarnEstimate.grams, skeinG, skeinM, extraPct],
  )

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button type="button" aria-pressed={tab === 'gauge'}
                className={`${s.tab} ${tab === 'gauge' ? s.tabActive : ''}`}   onClick={() => setTab('gauge')}>게이지</button>
        <button type="button" aria-pressed={tab === 'pattern'}
                className={`${s.tab} ${tab === 'pattern' ? s.tabActive : ''}`} onClick={() => setTab('pattern')}>패턴 변환</button>
        <button type="button" aria-pressed={tab === 'size'}
                className={`${s.tab} ${tab === 'size' ? s.tabActive : ''}`}    onClick={() => setTab('size')}>사이즈별</button>
        <button type="button" aria-pressed={tab === 'tools'}
                className={`${s.tab} ${tab === 'tools' ? s.tabActive : ''}`}   onClick={() => setTab('tools')}>늘림·실 양</button>
      </div>

      {/* ═══════════════════ 탭 1: 게이지 입력 ═══════════════════ */}
      {tab === 'gauge' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel} id="knit-gauge-unit-label">측정 단위</span>
            <div className={s.unitRow} role="group" aria-labelledby="knit-gauge-unit-label">
              {([
                { id: '10cm',  label: '10×10cm (한국·유럽 표준)' },
                { id: '4inch', label: '4×4인치 (미국)' },
                { id: '1cm',   label: '1×1cm (정밀)' },
              ] as { id: GaugeUnit; label: string }[]).map((u) => (
                <button type="button"
                  key={u.id}
                  aria-pressed={unit === u.id}
                  className={`${s.unitBtn} ${unit === u.id ? s.unitBtnActive : ''}`}
                  onClick={() => changeUnit(u.id)}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>내 게이지 입력</span>

            {/* 코 게이지 */}
            <div className={s.field}>
              <div className={s.fieldHead}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-sts">코 수 (가로) / {unit === '4inch' ? '4 inch' : unit === '1cm' ? '1 cm' : '10 cm'}</label>
                <input id="knit-gauge-sts"
                  type="number" inputMode="decimal"
                  value={stsInput}
                  min={unit === '1cm' ? 0.5 : 4}
                  max={unit === '1cm' ? 8 : 60}
                  step={unit === '1cm' ? 0.1 : 0.5}
                  onChange={(e) => setStsInput(clampNum(e.target.value, unit === '1cm' ? 0.5 : 4, unit === '1cm' ? 8 : 60))}
                  className={s.numInput}
                />
              </div>
              <input
                aria-label="코 게이지 슬라이더"
                type="range"
                min={unit === '1cm' ? 0.5 : 4}
                max={unit === '1cm' ? 8 : 60}
                step={unit === '1cm' ? 0.1 : 0.5}
                value={stsInput}
                onChange={(e) => setStsInput(clampNum(e.target.value, unit === '1cm' ? 0.5 : 4, unit === '1cm' ? 8 : 60))}
                className={s.slider}
              />
            </div>

            {/* 단 게이지 */}
            <div className={s.field}>
              <div className={s.fieldHead}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-rows">단 수 (세로) / {unit === '4inch' ? '4 inch' : unit === '1cm' ? '1 cm' : '10 cm'}</label>
                <input id="knit-gauge-rows"
                  type="number" inputMode="decimal"
                  value={rowsInput}
                  min={unit === '1cm' ? 0.5 : 4}
                  max={unit === '1cm' ? 10 : 80}
                  step={unit === '1cm' ? 0.1 : 0.5}
                  onChange={(e) => setRowsInput(clampNum(e.target.value, unit === '1cm' ? 0.5 : 4, unit === '1cm' ? 10 : 80))}
                  className={s.numInput}
                />
              </div>
              <input
                aria-label="단 게이지 슬라이더"
                type="range"
                min={unit === '1cm' ? 0.5 : 4}
                max={unit === '1cm' ? 10 : 80}
                step={unit === '1cm' ? 0.1 : 0.5}
                value={rowsInput}
                onChange={(e) => setRowsInput(clampNum(e.target.value, unit === '1cm' ? 0.5 : 4, unit === '1cm' ? 10 : 80))}
                className={s.slider}
              />
            </div>

            {/* 빠른 칩 (10cm 기준 표준 게이지) */}
            <div className={s.quickRow}>
              {YARN_WEIGHTS.map((y) => {
                const center = Math.round((y.sts10cm[0] + y.sts10cm[1]) / 2)
                return (
                  <button type="button"
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
                10×10cm 기준 <strong>{fmt(stsPer10cm, 1)}코 × {fmt(rowsPer10cm, 1)}단</strong>
                <br />
                1코 = {fmt(perCm.mmPerSt, 2)}mm · 1단 = {fmt(perCm.mmPerRow, 2)}mm
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroLabel}>실 굵기 추정</p>
              <p className={s.heroEst}>{gaugeReady ? yarnEst.shortLabel : '—'}</p>
              <p className={s.heroSub}>
                {gaugeReady ? (
                  <>
                    CYC {yarnEst.cyc} · {yarnEst.cycName}<br />
                    권장 바늘 {fmt(needleEst.recommended, 2)}mm{needleEst.label ? ' 이상' : ''}<br />
                    <span className={s.muted}>
                      ({needleEst.label ? `${needleEst.min}mm 이상` : `${needleEst.min}–${needleEst.max} mm`})
                    </span>
                  </>
                ) : '코·단 수를 입력하세요'}
              </p>
            </div>
          </div>

          {/* SVG 게이지 시각화 */}
          <div className={s.card}>
            <span className={s.cardLabel}>10×10cm 게이지 시각화</span>
            <GaugeSvg stsPer10cm={stsPer10cm} rowsPer10cm={rowsPer10cm} />
            <p className={s.hint}>
              💡 격자가 빽빽할수록 가는 실(높은 게이지). 빨간 점선 = 5코·5단 단위 안내선.
            </p>
          </div>

          {/* 스와치 가이드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>게이지 스와치 만드는 법</span>
            <ol className={s.swatchSteps}>
              <li>
                <strong>15×15cm 시험 편물</strong>을 같은 실·바늘로 떠 줍니다.<br />
                <span className={s.muted}>(가장자리 2~3코는 측정에서 제외하기 위해)</span>
              </li>
              <li>
                <strong>물에 적신 후 펴서 말립니다 (블로킹)</strong>.<br />
                <span className={s.muted}>실은 블로킹 후 치수가 달라지므로 필수 — 패턴의 게이지는 블로킹 후 기준입니다.</span>
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
            <span className={s.cardLabel}>패턴 정보 (도안에서)</span>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-cm">패턴 코 게이지 / 10cm</label>
                <input id="knit-gauge-cm"
                  type="number" inputMode="decimal" min={4} max={60} step={0.5}
                  value={patternStsGauge}
                  onChange={(e) => setPatternStsGauge(clampNum(e.target.value, 4, 60))}
                  className={s.numInput}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-cm-2">패턴 단 게이지 / 10cm</label>
                <input id="knit-gauge-cm-2"
                  type="number" inputMode="decimal" min={4} max={80} step={0.5}
                  value={patternRowsGauge}
                  onChange={(e) => setPatternRowsGauge(clampNum(e.target.value, 4, 80))}
                  className={s.numInput}
                />
              </div>
            </div>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-start">패턴 코 수 (예: 시작 코)</label>
                <input id="knit-gauge-start"
                  type="number" inputMode="numeric" step={1} min={1} max={1000}
                  value={patternSts}
                  onChange={(e) => setPatternSts(clampNum(e.target.value, 1, 1000))}
                  className={s.numInput}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-length">패턴 단 수 (총 길이)</label>
                <input id="knit-gauge-length"
                  type="number" inputMode="numeric" step={1} min={1} max={5000}
                  value={patternRows}
                  onChange={(e) => setPatternRows(clampNum(e.target.value, 1, 5000))}
                  className={s.numInput}
                />
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>내 게이지 (탭 1에서 자동)</span>
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
              <p className={s.heroBig} role="status">
                {conversion.invalid ? (
                  <span className={s.heroNum}>—</span>
                ) : (
                  <>
                    <span className={s.heroNum}>{conversion.newSts}</span> 코{' '}
                    × <span className={s.heroNum}>{conversion.newRows}</span> 단
                  </>
                )}
              </p>
              <p className={s.heroSub}>
                {conversion.invalid ? (
                  '게이지를 0보다 큰 값으로 입력하세요.'
                ) : (
                  <>
                    패턴 {patternSts}코 → <strong>{conversion.newSts}코</strong> ({fmtSign(conversion.newSts - patternSts, 0)})<br />
                    패턴 {patternRows}단 → <strong>{conversion.newRows}단</strong> ({fmtSign(conversion.newRows - patternRows, 0)})
                  </>
                )}
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

          {/* 무늬 반복 보정 — 환산 코 수는 대개 무늬 배수에 맞지 않는다 */}
          <div className={s.card}>
            <span className={s.cardLabel}>무늬 반복 보정 (선택)</span>
            <p className={s.hint} style={{ marginTop: 0 }}>
              도안에 <strong>&ldquo;8코 반복 + 가장자리 2코&rdquo;</strong>(multiple of 8 sts plus 2) 같은 조건이 있으면 입력하세요.
              케이블·레이스·고무단은 코 수가 이 조건에 맞아야 무늬가 끊기지 않습니다.
            </p>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-repeat">무늬 반복 단위 (코) — 0 = 사용 안 함</label>
                <input id="knit-gauge-repeat"
                  type="number" inputMode="numeric" min={0} max={60}
                  value={repeatMultiple}
                  onChange={(e) => setRepeatMultiple(clampNum(e.target.value, 0, 60))}
                  className={s.numInput}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-repeat-plus">가장자리 등 추가 코</label>
                <input id="knit-gauge-repeat-plus"
                  type="number" inputMode="numeric" min={0} max={60}
                  value={repeatPlus}
                  onChange={(e) => setRepeatPlus(clampNum(e.target.value, 0, 60))}
                  className={s.numInput}
                />
              </div>
            </div>

            {repeatFit && (
              <div className={s.resultBox} role="status">
                {repeatFit.exact ? (
                  <>
                    <p className={s.resultLabel}>✓ 환산 {conversion.newSts}코 그대로 사용 가능</p>
                    <p className={s.resultText}>{repeatFit.label}</p>
                  </>
                ) : (
                  <>
                    <p className={s.resultLabel}>
                      {conversion.newSts}코 → <strong>{repeatFit.nearest}코</strong> 권장 (무늬 {repeatFit.repeats}회 반복)
                    </p>
                    <p className={s.resultText}>
                      {repeatFit.label}<br />
                      <span className={s.muted}>
                        환산값 대비 폭 차이 {fmtSign(((repeatFit.nearest - conversion.newSts) / (stsPer10cm || 1)) * 10, 1)}cm
                        {repeatFit.down < conversion.newSts && repeatFit.up > conversion.newSts
                          ? ` — ${repeatFit.down}코는 살짝 좁고 ${repeatFit.up}코는 살짝 넓습니다.`
                          : ` — 반복 1회분보다 코 수가 적어 ${repeatFit.nearest}코가 가능한 최소 코 수입니다.`}
                      </span>
                    </p>
                  </>
                )}
              </div>
            )}
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
            <span className={s.cardLabel} id="knit-gauge-part-label">부위 선택</span>
            <div className={s.bodyPartRow} role="group" aria-labelledby="knit-gauge-part-label">
              {BODY_PARTS.map((b) => (
                <button type="button"
                  key={b.id}
                  aria-pressed={bodyPartId === b.id}
                  className={`${s.bodyPartBtn} ${bodyPartId === b.id ? s.bodyPartBtnActive : ''}`}
                  onClick={() => applyBodyPart(b.id)}
                >
                  {b.emoji} {b.name}
                </button>
              ))}
            </div>
            <p className={s.hint}>{bodyPart.note}</p>
          </div>

          {/* 작업 방식 — 이 선택이 시작 코 수의 의미를 바꾼다 */}
          {canChooseMode && (
            <div className={s.card}>
              <span className={s.cardLabel} id="knit-gauge-mode-label">작업 방식</span>
              <div className={s.unitRow} role="group" aria-labelledby="knit-gauge-mode-label">
                <button type="button"
                  aria-pressed={workMode === 'flat'}
                  className={`${s.unitBtn} ${workMode === 'flat' ? s.unitBtnActive : ''}`}
                  onClick={() => applyWorkMode('flat')}
                >{bodyPartId === 'sweater_body' ? '평면 — 앞·뒤판 따로' : '평면 — 펼쳐 뜨고 봉합'}</button>
                <button type="button"
                  aria-pressed={workMode === 'round'}
                  className={`${s.unitBtn} ${workMode === 'round' ? s.unitBtnActive : ''}`}
                  onClick={() => applyWorkMode('round')}
                >{bodyPartId === 'sweater_body' ? '원형 — 한 번에' : '원형 — 통으로'}</button>
              </div>
              <p className={s.hint}>
                💡 평면은 완성 둘레의 <strong>절반</strong>이 한 장의 폭이고, 원형은 <strong>완성 둘레 전체</strong>를
                한 번에 잡습니다. 같은 부위라도 원형 시작 코 수가 평면 한 장의 약 2배입니다.
                {' '}평면은 봉합에 각 조각 1코씩(이음매당 2코)이 접혀 들어가므로 도안에 따라 셀비지 코가 더해집니다.
              </p>
            </div>
          )}

          {/* 완성 여유분 — CYC 「Bust/Chest Fit and Ease Chart」
              CYC의 여유분 권장은 **가슴둘레에만** 있으므로 소매에는 띄우지 않는다
              (소매·암홀·힙에 대한 CYC 여유분 수치는 존재하지 않는다). */}
          {bodyPartId === 'sweater_body' && (
            <div className={s.card}>
              <span className={s.cardLabel}>완성 여유분 (ease)</span>
              <div className={s.quickRow}>
                {FIT_PRESETS.map((f) => (
                  <button type="button"
                    key={f.id}
                    aria-pressed={currentFit?.id === f.id}
                    className={`${s.quickChip} ${currentFit?.id === f.id ? s.quickChipActive : ''}`}
                    onClick={() => applyFitEase(f.applyCm)}
                    title={f.desc}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className={s.field}>
                <div className={s.fieldHead}>
                  <label className={s.fieldLabel} htmlFor="knit-gauge-fit-ease">여유분 (cm)</label>
                  <span className={s.easeValue}>{fmtSign(fitEaseCm, 1)} cm</span>
                </div>
                <input id="knit-gauge-fit-ease"
                  type="range" min={-12} max={30} step={0.5}
                  value={fitEaseCm}
                  onChange={(e) => applyFitEase(clampNum(e.target.value, -12, 30))}
                  className={s.slider}
                />
                <p className={s.hint}>
                  {currentFit
                    ? <>현재 <strong>{currentFit.label}</strong>({currentFit.cycName}) — {currentFit.desc}</>
                    : isBelowFitRange(fitEaseCm)
                      ? <>CYC가 제시한 <strong>가장 작은 구간(−10cm)보다도 작은</strong> 값입니다. 그대로 써도 되지만 CYC 구간명은 붙지 않습니다.</>
                      : <>CYC가 대표값만 제시해 <strong>등급 사이 공백</strong>에 해당하는 값입니다(−5~0cm, 0~+5cm). 그대로 써도 되지만 CYC 구간명은 붙지 않습니다.</>}
                  <br />
                  CYC 「Bust/Chest Fit and Ease Chart」 기준 — 여유분은 <strong>가슴둘레에만</strong> 정해져 있고,
                  CYC 스스로 이 표를 규정이 아니라 가이드라인이라고 밝힙니다.
                </p>
              </div>
              {baseSize && finishedCircumference !== null && (
                <p className={s.resultText}>
                  📐 {baseSize.label} 실제 가슴 {baseSize.bust}cm {fitEaseCm >= 0 ? '+' : '−'} {fmt(Math.abs(fitEaseCm), 1)}cm
                  {' '}= <strong>완성 둘레 {fmt(finishedCircumference, 1)}cm</strong>
                  {' → '}
                  {effectiveMode === 'round'
                    ? <>원형이므로 <strong>둘레 {fmt(finishedCircumference, 1)}cm</strong> 전체를 한 번에</>
                    : <>평면이므로 <strong>한 장 {fmt(finishedCircumference / 2, 1)}cm</strong> × 2장</>}
                </p>
              )}
            </div>
          )}

          <div className={s.card}>
            <span className={s.cardLabel}>치수 입력</span>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <div className={s.fieldHead}>
                  <label className={s.fieldLabel} htmlFor="knit-gauge-width">
                    {widthIsCircumference ? '둘레 (cm)' : '가로 폭 (cm)'}
                  </label>
                  <input id="knit-gauge-width"
                    type="number" inputMode="decimal" min={1} max={300} step={0.5}
                    value={widthCm}
                    onChange={(e) => { setWidthCm(clampNum(e.target.value, 1, 300)); setSizeBaseId(null) }}
                    className={s.numInput}
                  />
                </div>
                <input
                  aria-label={widthIsCircumference ? '둘레 슬라이더' : '가로 폭 슬라이더'}
                  type="range" min={1} max={300} step={0.5}
                  value={widthCm}
                  onChange={(e) => { setWidthCm(clampNum(e.target.value, 1, 300)); setSizeBaseId(null) }}
                  className={s.slider}
                />
              </div>
              <div className={s.field}>
                <div className={s.fieldHead}>
                  <label className={s.fieldLabel} htmlFor="knit-gauge-height">세로 (cm)</label>
                  <input id="knit-gauge-height"
                    type="number" inputMode="decimal" min={1} max={300} step={0.5}
                    value={heightCm}
                    onChange={(e) => setHeightCm(clampNum(e.target.value, 1, 300))}
                    className={s.numInput}
                  />
                </div>
                <input
                  aria-label="세로 슬라이더"
                  type="range" min={1} max={300} step={0.5}
                  value={heightCm}
                  onChange={(e) => setHeightCm(clampNum(e.target.value, 1, 300))}
                  className={s.slider}
                />
              </div>
            </div>

            {/* 신축 보정 (모자·양말만) */}
            {bodyPart.ease !== undefined && (
              <div className={s.field}>
                <div className={s.fieldHead}>
                  <label className={s.fieldLabel} htmlFor="knit-gauge-negative-ease">신축 보정 (negative ease)</label>
                  <span className={s.easeValue}>{(easeUser * 100).toFixed(0)}%</span>
                </div>
                <input id="knit-gauge-negative-ease"
                  type="range" min={-0.20} max={0.10} step={0.01}
                  value={easeUser}
                  onChange={(e) => setEaseUser(Number(e.target.value))}
                  className={s.slider}
                />
                <p className={s.hint}>
                  💡 음수 = 둘레보다 작게 떠 늘어났을 때 잘 맞음. 모자·양말은 보통 −10%.
                  {' '}이 보정은 <strong>둘레(가로)에만</strong> 적용되고 높이·발 길이는 그대로 둡니다
                  {lengthEaseCm !== 0 && `(양말 발 길이만 ${Math.abs(lengthEaseCm)}cm 짧게)`}.
                </p>
              </div>
            )}
          </div>

          {/* 빠른 사이즈 칩 */}
          <div className={s.card}>
            <span className={s.cardLabel}>
              참고 치수 (스웨터 몸통 기준) — 클릭 시 [실제 가슴둘레 + 여유분]에서 {workMode === 'round' ? '둘레와' : '한 장 폭과'} 길이를 자동 계산
            </span>
            <p className={s.hint} style={{ marginTop: 0 }}>
              표의 가슴둘레는 <strong>몸을 잰 치수</strong>입니다. 칩을 누르면 위에서 고른 여유분을 더해 완성 치수로 바꾼 뒤
              작업 방식에 맞는 가로 치수를 넣습니다. 다른 부위를 보던 중에 누르면 <strong>스웨터 몸통으로 전환</strong>됩니다.
            </p>
            <div className={s.sizeChipGroup}>
              <p className={s.sizeChipLabel}>여성</p>
              <div className={s.sizeChipRow}>
                {SIZES_FEMALE.map((sz) => (
                  <button type="button" key={sz.id}
                    aria-pressed={sizeBaseId === sz.id}
                    className={`${s.sizeChip} ${sizeBaseId === sz.id ? s.sizeChipActive : ''}`}
                    onClick={() => applySize(sz.id)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.sizeChipGroup}>
              <p className={s.sizeChipLabel}>남성</p>
              <div className={s.sizeChipRow}>
                {SIZES_MALE.map((sz) => (
                  <button type="button" key={sz.id}
                    aria-pressed={sizeBaseId === sz.id}
                    className={`${s.sizeChip} ${sizeBaseId === sz.id ? s.sizeChipActive : ''}`}
                    onClick={() => applySize(sz.id)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={s.sizeChipGroup}>
              <p className={s.sizeChipLabel}>키즈</p>
              <div className={s.sizeChipRow}>
                {SIZES_KIDS.map((sz) => (
                  <button type="button" key={sz.id}
                    aria-pressed={sizeBaseId === sz.id}
                    className={`${s.sizeChip} ${sizeBaseId === sz.id ? s.sizeChipActive : ''}`}
                    onClick={() => applySize(sz.id)}>
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 결과 */}
          <div className={s.heroCard}>
            <div className={s.heroPrimary}>
              <p className={s.heroLabel}>
                {widthIsCircumference ? '시작 코 수 (둘레 한 바퀴) × 총 단 수' : '시작 코 수 (한 장) × 총 단 수'}
              </p>
              <p className={s.heroBig} role="status">
                <span className={s.heroNum}>{sizeResult.sts}</span> 코{' '}
                × <span className={s.heroNum}>{sizeResult.rows}</span> 단
              </p>
              <p className={s.heroSub}>
                {widthIsCircumference ? '둘레' : '폭'} {fmt(widthCm, 1)} × 길이 {fmt(heightCm, 1)} cm
                {ease !== 0 ? ` (신축 ${(ease * 100).toFixed(0)}%)` : ''}
                <br />
                {effectiveMode === 'flat' && bodyPartId === 'sweater_body' && (
                  <>앞·뒤판 두 장 합계 <strong>{sizeResult.sts * 2}코</strong> · 봉합 시접은 별도<br /></>
                )}
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
            <span className={s.cardLabel}>늘림 / 줄임 균등 분배</span>
            <div className={s.gridTwo}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-current">
                  {incDecUnit === '단' ? '구간 시작 코 수' : '현재 코 수'}
                </label>
                <input id="knit-gauge-current"
                  type="number" inputMode="numeric" step={1} min={1} max={1000}
                  value={currentSts}
                  onChange={(e) => setCurrentSts(clampNum(e.target.value, 1, 1000))}
                  className={s.numInput}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-goal">
                  {incDecUnit === '단' ? '구간 끝 코 수' : '목표 코 수'}
                </label>
                <input id="knit-gauge-goal"
                  type="number" inputMode="numeric" step={1} min={1} max={1000}
                  value={targetSts}
                  onChange={(e) => setTargetSts(clampNum(e.target.value, 1, 1000))}
                  className={s.numInput}
                />
              </div>
            </div>
            <div className={s.field}>
              <span className={s.fieldLabel} id="knit-gauge-dir-label">분배 방향</span>
              <div className={s.unitRow} role="group" aria-labelledby="knit-gauge-dir-label">
                <button type="button"
                  aria-pressed={incDecUnit === '코'}
                  className={`${s.unitBtn} ${incDecUnit === '코' ? s.unitBtnActive : ''}`}
                  onClick={() => setIncDecUnit('코')}
                >가로 — 한 단 안에서 (고무단→몸판)</button>
                <button type="button"
                  aria-pressed={incDecUnit === '단'}
                  className={`${s.unitBtn} ${incDecUnit === '단' ? s.unitBtnActive : ''}`}
                  onClick={() => setIncDecUnit('단')}
                >세로 — 여러 단에 걸쳐 (소매·래글런)</button>
              </div>
              <p className={s.hint}>
                {incDecUnit === '코'
                  ? '고무단을 끝내고 몸판으로 넘어갈 때처럼 한 단 안에서 코 수를 한 번에 맞추는 경우입니다.'
                  : '소매·래글런처럼 여러 단에 걸쳐 조금씩 성형하는 경우입니다. 아래에 성형 구간의 단 수와 한 성형단당 코 수를 넣으세요.'}
              </p>
            </div>

            {/* 세로 모드 전용 입력 — 가로와 필요한 정보 자체가 다르다 */}
            {incDecUnit === '단' && (
              <div className={s.gridTwo}>
                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="knit-gauge-shaping-rows">성형할 총 단 수</label>
                  <input id="knit-gauge-shaping-rows"
                    type="number" inputMode="numeric" min={1} max={1000}
                    value={shapingRows}
                    onChange={(e) => setShapingRows(clampNum(e.target.value, 1, 1000))}
                    className={s.numInput}
                  />
                </div>
                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="knit-gauge-per-event">한 성형단당 코 수</label>
                  <input id="knit-gauge-per-event"
                    type="number" inputMode="numeric" min={1} max={20}
                    value={stsPerEvent}
                    onChange={(e) => setStsPerEvent(clampNum(e.target.value, 1, 20))}
                    className={s.numInput}
                  />
                  <p className={s.hint} style={{ marginTop: 4 }}>
                    좌우 양끝에서 1코씩이면 <strong>2</strong>(소매), 래글런 라인 4개에서 각 2코면 <strong>8</strong>.
                  </p>
                </div>
              </div>
            )}

            {incDecUnit === '단' && (
              <div className={s.field}>
                <span className={s.fieldLabel} id="knit-gauge-rs-label">성형단 위치</span>
                <div className={s.unitRow} role="group" aria-labelledby="knit-gauge-rs-label">
                  <button type="button"
                    aria-pressed={rsOnly}
                    className={`${s.unitBtn} ${rsOnly ? s.unitBtnActive : ''}`}
                    onClick={() => setRsOnly(true)}
                  >평면 — 겉면(RS)에서만</button>
                  <button type="button"
                    aria-pressed={!rsOnly}
                    className={`${s.unitBtn} ${!rsOnly ? s.unitBtnActive : ''}`}
                    onClick={() => setRsOnly(false)}
                  >원형 — 제약 없음</button>
                </div>
                <p className={s.hint}>
                  평면 뜨기에서 겉면 단에만 성형하면 간격이 <strong>짝수 단</strong>이어야 합니다(대부분의 니터가 쓰는 방식이며,
                  엄밀한 규칙은 아닙니다). 원형은 겉·안면 교대가 없어 홀수 간격도 그대로 쓸 수 있습니다.
                </p>
              </div>
            )}

            {incDecUnit === '코' ? (
              <div className={s.resultBox} role="status">
                <p className={s.resultLabel}>
                  {incDecResult.type} {incDecResult.delta}코
                </p>
                <p className={s.resultText}>{incDecResult.label}</p>
              </div>
            ) : (
              <div className={s.resultBox} role="status">
                <p className={s.resultLabel}>
                  {shapingResult.type}
                  {shapingResult.deltaSts > 0 && ` ${shapingResult.deltaSts}코`}
                  {!shapingResult.overRange && shapingResult.events > 0 && ` · 성형단 ${shapingResult.events}회 / ${shapingRows}단`}
                </p>
                <p className={s.resultText}>{shapingResult.label}</p>
                {shapingResult.note && (
                  <p className={s.warnText} style={{ marginTop: 8 }}>⚠️ {shapingResult.note}</p>
                )}
                {!shapingResult.overRange && shapingResult.events > 0 && (
                  <p className={s.muted} style={{ fontSize: 12, marginTop: 8 }}>
                    성형단 사이는 평평하게 뜹니다.{' '}
                    {shapingResult.plainRows > 0
                      ? `간격 × 횟수 + 마지막 평평 구간 ${shapingResult.plainRows}단을`
                      : '간격 × 횟수를'}
                    {' '}모두 더하면 {shapingRows}단이 됩니다.
                  </p>
                )}
              </div>
            )}

            {/* 약어 용어집 */}
            <details className={s.glossary}>
              <summary className={s.glossarySummary}>늘림·줄임 약어 용어집 (펼치기)</summary>
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
            <span className={s.cardLabel}>실 양 추정기</span>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="knit-gauge-cyc">실 굵기 (CYC)</label>
              <select id="knit-gauge-cyc" value={yarnId} onChange={(e) => setYarnId(e.target.value as YarnId)} className={s.select}>
                {YARN_WEIGHTS.map((y) => (
                  <option key={y.id} value={y.id}>{y.label}</option>
                ))}
              </select>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="knit-gauge-f9">작품 종류</label>
              <select id="knit-gauge-f9" value={projectId} onChange={(e) => setProjectId(e.target.value as ProjectId)} className={s.select}>
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>{p.emoji} {p.label}</option>
                ))}
              </select>
            </div>

            {/* 사이즈 (스웨터·가디건만) */}
            {(projectId === 'sweater' || projectId === 'cardigan') && (
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="knit-gauge-f10">사이즈</label>
                <select id="knit-gauge-f10" value={yarnSizeId} onChange={(e) => setYarnSizeId(e.target.value)} className={s.select}>
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

            {yarnEstimate.grams > 0 ? (
              <>
                {/* 내가 살 실의 라벨 값으로 타래를 센다 — 가상의 50g/100g 표시는 실전과 어긋난다 */}
                <div className={s.gridTwo}>
                  <div className={s.field}>
                    <label className={s.fieldLabel} htmlFor="knit-gauge-skein-g">실타래 1개 무게 (g) — 라벨</label>
                    <input id="knit-gauge-skein-g"
                      type="number" inputMode="numeric" min={1} max={1000}
                      value={skeinG}
                      onChange={(e) => setSkeinG(clampNum(e.target.value, 1, 1000))}
                      className={s.numInput}
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.fieldLabel} htmlFor="knit-gauge-skein-m">실타래 1개 길이 (m) — 선택</label>
                    <input id="knit-gauge-skein-m"
                      type="number" inputMode="numeric" min={0} max={5000}
                      value={skeinM}
                      onChange={(e) => setSkeinM(clampNum(e.target.value, 0, 5000))}
                      className={s.numInput}
                    />
                  </div>
                </div>
                <div className={s.field}>
                  <div className={s.fieldHead}>
                    <label className={s.fieldLabel} htmlFor="knit-gauge-extra">구매 여유율</label>
                    <span className={s.easeValue}>+{extraPct}%</span>
                  </div>
                  <input id="knit-gauge-extra"
                    type="range" min={0} max={40} step={5}
                    value={extraPct}
                    onChange={(e) => setExtraPct(clampNum(e.target.value, 0, 40))}
                    className={s.slider}
                  />
                  <p className={s.hint} style={{ marginTop: 4 }}>
                    케이블·컬러워크는 실을 더 쓰고, 같은 다이로트(dye lot)로 한 번에 사야 색이 맞습니다.
                    표준 권장치는 없으므로 직접 정하세요.
                  </p>
                </div>

                <div className={s.yarnEstResult} role="status">
                  <div className={s.yarnEstNum}>
                    <p className={s.yarnEstLabel}>대략 필요량 (추정)</p>
                    <p className={s.yarnEstBig}>{fmtInt(skeins.totalGrams)} g</p>
                  </div>
                  <div className={s.yarnEstBalls}>
                    <p className={s.yarnEstBallText}>{skeins.skeinGramsUsed}g 실타래 <strong>{skeins.skeins}타래</strong></p>
                    {skeins.neededMeters !== null ? (
                      <p className={s.yarnEstBallText}>
                        필요 길이 약 <strong>{fmtInt(skeins.neededMeters)}m</strong>
                        <br /><span className={s.muted}>({skeins.skeins}타래 = {fmtInt(skeins.buyMeters ?? 0)}m)</span>
                      </p>
                    ) : (
                      <p className={s.yarnEstBallText}>
                        <span className={s.muted}>타래 길이(m)를 넣으면 필요 길이도 계산됩니다</span>
                      </p>
                    )}
                  </div>
                </div>
                <p className={s.hint}>
                  💡 {yarnEstimate.note}
                  {extraPct > 0 && ` · 표 근사 ${fmtInt(yarnEstimate.grams)}g + 여유 ${extraPct}%`}
                  {' '}· 평직 기준입니다.
                </p>
              </>
            ) : (
              <p className={s.hint} role="status">💡 {yarnEstimate.note}</p>
            )}
            <p className={s.hint}>
              ※ 출발점이 되는 g 값은 통용 관행 근사이며 공식 표준이 아닙니다. 같은 굵기라도 실마다 g당 길이가 크게 달라
              (Lion Brand는 &ldquo;가장 정확한 기준은 야드&rdquo;라고 안내합니다) 구매 전 실 밴드의 길이 표기로 재확인하세요.
            </p>
          </div>

          {/* 섹션 C — 바늘 호수 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>바늘 호수 ↔ 게이지 룩업</span>
            <div className={s.tableWrap}>
              <table className={s.dataTable}>
                <thead>
                  <tr>
                    <th scope="col">mm</th>
                    <th scope="col">US</th>
                    <th scope="col">UK</th>
                    <th scope="col">실 굵기</th>
                    <th scope="col">코/10cm</th>
                  </tr>
                </thead>
                <tbody>
                  {NEEDLE_TABLE.map((n) => {
                    /* 임계값(0.3mm) 방식은 권장값이 표의 어느 행과도 가깝지 않으면
                       강조 행이 0개가 되어 아래 안내문과 어긋난다 — 항상 최근접 1행을 강조한다. */
                    const isRecommended = gaugeReady && n.mm === nearestNeedleMm
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
              💡 강조 행은 현재 게이지({fmt(stsPer10cm, 1)}코/10cm)의 권장 바늘({fmt(needleEst.recommended, 2)}mm
              {needleEst.label ? ' 이상' : ''})에 가장 가까운 호수입니다. CYC 7(Jumbo)은 12.75mm 이상으로 상한이 없어
              표에 없는 더 굵은 바늘(팔뚝뜨기 포함)을 쓰기도 합니다.
            </p>
          </div>

          {/* 실 굵기 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>CYC 표준 실 굵기</span>
            <div className={s.tableWrap}>
              <table className={s.dataTable}>
                <thead>
                  <tr>
                    <th scope="col">CYC</th>
                    <th scope="col">이름</th>
                    <th scope="col">코/10cm</th>
                    <th scope="col">바늘 mm</th>
                    <th scope="col">예시</th>
                  </tr>
                </thead>
                <tbody>
                  {YARN_WEIGHTS.map((y) => {
                    const isCurrent = y.id === yarnEst.id
                    return (
                      <tr key={y.id} className={isCurrent ? s.rowHighlight : ''}>
                        <td className={s.mono}>{y.cyc}</td>
                        <td><strong>{y.shortLabel}</strong></td>
                        <td className={s.mono}>{y.stsLabel ?? `${y.sts10cm[0]}–${y.sts10cm[1]}`}</td>
                        <td className={s.mono}>{y.needleLabel ?? `${y.needleMm[0]}–${y.needleMm[1]}`}</td>
                        <td style={{ fontSize: 12 }}>{y.examples}</td>
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

  /* 격자 수 하드 캡 — 입력단에서도 클램프하지만, 저장값 복원·향후 배선 실수로
     거대값이 흘러들면 Array.from({length: n})이 그대로 페이지를 죽인다. 여기서 한 번 더 막는다. */
  const CAP = 200
  const stsCount = Math.min(CAP, Math.max(1, Math.round(stsPer10cm) || 1))
  const rowsCount = Math.min(CAP, Math.max(1, Math.round(rowsPer10cm) || 1))
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
        stroke="var(--cat-art)"
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
            stroke={isFifth ? 'var(--cat-date)' : 'var(--border)'}
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
            stroke={isFifth ? 'var(--cat-date)' : 'var(--border)'}
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
      <text x={W / 2} y={H - 8} textAnchor="middle" fill="var(--cat-art)" fontSize={12} fontWeight={700} fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>
        {getYarn(estimateYarnWeight(stsPer10cm).id).shortLabel} · {fmt(stsPer10cm, 0)} sts × {fmt(rowsPer10cm, 0)} rows / 10cm
      </text>
    </svg>
  )
}
