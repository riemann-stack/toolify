'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './paint-mix.module.css'
import {
  SCHOOL_12, PRO_24, INK_BRANDS, FOOD_COLORS, PALETTES, getPalette,
  RECIPES, COLOR_WHEEL_12, FIELD_GUIDES,
  complementaryIdx, analogousIdx, triadicIdx,
  hexToRgb, rgbToHsl, rgbToCmyk, rgbToLab, normalizeHex,
  mixColors, findClosestPreset, suggestRecipe, deltaE, deltaEGrade,
  computeAmounts, UNIT_TO_ML, UNIT_LABELS,
  type MixModel, type PaletteId, type VolumeUnit,
} from './paintMixUtils'

type Tab = 'mix' | 'volume' | 'match' | 'recipe'

interface Slot {
  hex: string
  weight: number
}

const STORAGE_KEY = 'youtil_paint_mix_v1'

const DEFAULT_SLOTS: Slot[] = [
  { hex: '#264E86', weight: 1 },  /* 파랑 */
  { hex: '#F9DC5C', weight: 1 },  /* 노랑 */
]

export default function PaintMixClient() {
  const [tab, setTab] = useState<Tab>('mix')

  /* 공유 상태 — 탭 1·2 */
  const [slots, setSlots] = useState<Slot[]>(DEFAULT_SLOTS)
  const [model, setModel] = useState<MixModel>('subtractive')

  /* 분량 환산 (탭 2) */
  const [totalAmount, setTotalAmount] = useState<number>(100)
  const [unit, setUnit] = useState<VolumeUnit>('ml')
  const [pigmentScale, setPigmentScale] = useState<number>(1)

  /* 컬러 매칭 (탭 3) */
  const [targetHex, setTargetHex] = useState<string>('#90BE6D')
  const [matchPalette, setMatchPalette] = useState<PaletteId>('school12')
  const [matchResult, setMatchResult] = useState<ReturnType<typeof suggestRecipe> | null>(null)
  const [matching, setMatching] = useState(false)
  const [whiteAdd, setWhiteAdd] = useState<number>(0)   /* 0~5 parts */
  const [blackAdd, setBlackAdd] = useState<number>(0)

  /* 색환 (탭 4) */
  const [wheelIdx, setWheelIdx] = useState<number>(0)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (Array.isArray(j.slots) && j.slots.length >= 2) setSlots(j.slots)
      if (j.model) setModel(j.model)
      if (typeof j.totalAmount === 'number') setTotalAmount(j.totalAmount)
      if (j.unit) setUnit(j.unit)
      if (typeof j.pigmentScale === 'number') setPigmentScale(j.pigmentScale)
      if (j.targetHex) setTargetHex(j.targetHex)
      if (j.matchPalette) setMatchPalette(j.matchPalette)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        slots, model, totalAmount, unit, pigmentScale, targetHex, matchPalette,
      }))
    } catch {}
  }, [slots, model, totalAmount, unit, pigmentScale, targetHex, matchPalette])

  /* ═══════════════════ 탭 1: 색 혼합 시뮬레이터 ═══════════════════ */
  const totalParts = useMemo(() => slots.reduce((sum, sl) => sum + sl.weight, 0), [slots])
  const mixedHex = useMemo(() => mixColors(slots, model), [slots, model])
  const mixedRgb = useMemo(() => hexToRgb(mixedHex), [mixedHex])
  const mixedHsl = useMemo(() => rgbToHsl(mixedRgb.r, mixedRgb.g, mixedRgb.b), [mixedRgb])
  const mixedCmyk = useMemo(() => rgbToCmyk(mixedRgb.r, mixedRgb.g, mixedRgb.b), [mixedRgb])
  const mixedLab = useMemo(() => rgbToLab(mixedRgb.r, mixedRgb.g, mixedRgb.b), [mixedRgb])
  const closestPro = useMemo(() => findClosestPreset(mixedHex, PRO_24), [mixedHex])

  const updateSlot = (i: number, patch: Partial<Slot>) => {
    setSlots((prev) => prev.map((sl, idx) => idx === i ? { ...sl, ...patch } : sl))
  }
  const addSlot = () => {
    if (slots.length >= 4) return
    /* 보색 추가하면 흥미로움 */
    setSlots((prev) => [...prev, { hex: '#FFFFFF', weight: 1 }])
  }
  const removeSlot = (i: number) => {
    if (slots.length <= 2) return
    setSlots((prev) => prev.filter((_, idx) => idx !== i))
  }
  const resetEqual = () => {
    setSlots((prev) => prev.map((sl) => ({ ...sl, weight: 1 })))
  }

  /* ═══════════════════ 탭 2: 분량 환산 ═══════════════════ */
  const amountsMl = useMemo(
    () => computeAmounts(slots.map((sl) => sl.weight), totalAmount * UNIT_TO_ML[unit], pigmentScale),
    [slots, totalAmount, unit, pigmentScale],
  )
  const amountsDisplay = useMemo(
    () => amountsMl.map((amt) => amt / UNIT_TO_ML[unit]),
    [amountsMl, unit],
  )

  /* ═══════════════════ 탭 3: 컬러 매칭 ═══════════════════ */
  const startMatching = () => {
    setMatching(true)
    /* setTimeout으로 UI 업데이트 후 brute-force */
    setTimeout(() => {
      try {
        const palette = getPalette(matchPalette).colors
        const result = suggestRecipe(targetHex, palette, 3, 'subtractive')
        setMatchResult(result)
      } finally {
        setMatching(false)
      }
    }, 50)
  }

  /* white/black 첨가 적용된 최종 색 */
  const matchAdjustedHex = useMemo(() => {
    if (!matchResult) return null
    const allColors = [
      ...matchResult.colors.map((c) => ({ hex: c.color.hex, weight: c.weight })),
    ]
    if (whiteAdd > 0) allColors.push({ hex: '#FFFFFF', weight: whiteAdd })
    if (blackAdd > 0) allColors.push({ hex: '#000000', weight: blackAdd })
    return mixColors(allColors, 'subtractive')
  }, [matchResult, whiteAdd, blackAdd])

  const matchAdjustedDeltaE = useMemo(() => {
    if (!matchAdjustedHex) return null
    const t = hexToRgb(targetHex)
    const a = hexToRgb(matchAdjustedHex)
    return deltaE(rgbToLab(t.r, t.g, t.b), rgbToLab(a.r, a.g, a.b))
  }, [matchAdjustedHex, targetHex])

  const applyMatchToTab1 = () => {
    if (!matchResult) return
    const newSlots: Slot[] = matchResult.colors.map((c) => ({ hex: c.color.hex, weight: c.weight }))
    if (whiteAdd > 0 && newSlots.length < 4) newSlots.push({ hex: '#FFFFFF', weight: whiteAdd })
    if (blackAdd > 0 && newSlots.length < 4) newSlots.push({ hex: '#000000', weight: blackAdd })
    setSlots(newSlots.slice(0, 4))
    setTab('mix')
  }

  /* ═══════════════════ 탭 4: 레시피 ═══════════════════ */
  const applyRecipe = (recipe: typeof RECIPES[number]) => {
    /* 학교 12색 이름 → HEX 매핑 */
    const map = new Map(SCHOOL_12.map((c) => [c.name, c.hex]))
    const newSlots: Slot[] = recipe.mix.slice(0, 4).map(([name, parts]) => ({
      hex: map.get(name) ?? '#888888',
      weight: parts,
    }))
    setSlots(newSlots)
    setTab('mix')
  }

  /* 색환 - 보색·유사색·triadic */
  const wheelComp = COLOR_WHEEL_12[complementaryIdx(wheelIdx)]
  const wheelAna = analogousIdx(wheelIdx).map((i) => COLOR_WHEEL_12[i])
  const wheelTri = triadicIdx(wheelIdx).map((i) => COLOR_WHEEL_12[i])

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'mix' ? s.tabActive : ''}`}    onClick={() => setTab('mix')}>🎨 색 혼합</button>
        <button className={`${s.tab} ${tab === 'volume' ? s.tabActive : ''}`} onClick={() => setTab('volume')}>📏 분량 환산</button>
        <button className={`${s.tab} ${tab === 'match' ? s.tabActive : ''}`}  onClick={() => setTab('match')}>🔄 컬러 매칭</button>
        <button className={`${s.tab} ${tab === 'recipe' ? s.tabActive : ''}`} onClick={() => setTab('recipe')}>📚 레시피·색환</button>
      </div>

      {/* ═════════════ 탭 1: 색 혼합 시뮬레이터 ═════════════ */}
      {tab === 'mix' && (
        <>
          {/* 모델 토글 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🧪 혼합 모델</span>
            <div className={s.modelRow}>
              {([
                { id: 'subtractive', label: '⚫ Subtractive (물감)' },
                { id: 'additive',    label: '💡 Additive (빛)' },
                { id: 'ryb',         label: '🎒 RYB (전통)' },
              ] as { id: MixModel; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  className={`${s.modelBtn} ${model === m.id ? s.modelBtnActive : ''}`}
                  onClick={() => setModel(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <p className={s.hint}>
              💡 Subtractive(기본) — 물감/잉크처럼 빛을 흡수해 어두워짐. <br />
              💡 Additive — 모니터/조명처럼 빛이 더해져 밝아짐 (R+G+B = 흰색). <br />
              💡 RYB — 학교 미술 빨강·노랑·파랑 3원색 모델 (직관적이지만 부정확).
            </p>
          </div>

          {/* 색 슬롯 */}
          <div className={s.card}>
            <div className={s.slotHead}>
              <span className={s.cardLabel}>🎨 혼합할 색 ({slots.length}/4)</span>
              <div className={s.slotActions}>
                <button className={s.smBtn} onClick={resetEqual}>균등</button>
                <button className={s.smBtn} onClick={addSlot} disabled={slots.length >= 4}>+ 색 추가</button>
              </div>
            </div>

            {slots.map((sl, i) => (
              <SlotEditor
                key={i}
                index={i}
                slot={sl}
                totalParts={totalParts}
                onChange={(p) => updateSlot(i, p)}
                onRemove={() => removeSlot(i)}
                canRemove={slots.length > 2}
              />
            ))}
          </div>

          {/* 영웅 결과 카드 */}
          <div className={s.heroCard}>
            <div className={s.previewBox} style={{ background: mixedHex }} />
            <div className={s.heroContent}>
              <p className={s.heroLabel}>혼합 결과</p>
              <p className={s.heroHex}>{mixedHex}</p>
              <p className={s.heroSub}>
                가장 가까운 전문가 색: <strong style={{ color: closestPro.color.hex === '#FFFFFF' ? 'var(--text)' : closestPro.color.hex }}>
                  {closestPro.color.name}
                </strong> (ΔE {closestPro.deltaE.toFixed(1)})
              </p>
            </div>
          </div>

          {/* 색공간 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📊 색공간 변환</span>
            <table className={s.dataTable}>
              <tbody>
                <tr><td>HEX</td><td className={s.mono}>{mixedHex}</td></tr>
                <tr><td>RGB</td><td className={s.mono}>{mixedRgb.r}, {mixedRgb.g}, {mixedRgb.b}</td></tr>
                <tr><td>HSL</td><td className={s.mono}>{mixedHsl.h}°, {mixedHsl.s}%, {mixedHsl.l}%</td></tr>
                <tr><td>CMYK</td><td className={s.mono}>{mixedCmyk.c}, {mixedCmyk.m}, {mixedCmyk.y}, {mixedCmyk.k}</td></tr>
                <tr><td>LAB</td><td className={s.mono}>L {mixedLab.L} · a {mixedLab.a} · b {mixedLab.b}</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═════════════ 탭 2: 분량 환산 ═════════════ */}
      {tab === 'volume' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📏 총 분량</span>
            <div className={s.volRow}>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={totalAmount}
                onChange={(e) => setTotalAmount(Math.max(0.1, Number(e.target.value) || 0))}
                className={s.numInput}
              />
              <select value={unit} onChange={(e) => setUnit(e.target.value as VolumeUnit)} className={s.unitSelect}>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="tbsp">큰술 (15ml)</option>
                <option value="tsp">작은술 (5ml)</option>
                <option value="drop">방울 (0.05ml)</option>
              </select>
            </div>
            <div className={s.quickRow}>
              {[10, 50, 100, 200, 500, 1000].map((v) => (
                <button key={v} className={s.quickChip} onClick={() => setTotalAmount(v)}>{v}</button>
              ))}
              <button className={s.quickChip} onClick={() => setTotalAmount(totalAmount * 2)}>×2</button>
              <button className={s.quickChip} onClick={() => setTotalAmount(totalAmount * 5)}>×5</button>
              <button className={s.quickChip} onClick={() => setTotalAmount(totalAmount * 10)}>×10</button>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🧪 안료 농도 보정 (옵션)</span>
            <div className={s.sliderHead}>
              <span className={s.sliderLabel}>진하기 배수</span>
              <span className={s.sliderValue}>×{pigmentScale.toFixed(2)}</span>
            </div>
            <input
              type="range" min={0.5} max={2.0} step={0.05}
              value={pigmentScale}
              onChange={(e) => setPigmentScale(Number(e.target.value))}
              className={s.slider}
            />
            <div className={s.sliderTicks}>
              <span>0.5×</span><span>1.0×</span><span>1.5×</span><span>2.0×</span>
            </div>
            <p className={s.hint}>
              💡 푸드컬러 젤·진한 잉크는 <strong>0.5×</strong>(절반만 사용), 흐린 수채화는 <strong>1.5×~2×</strong>로 보정.
            </p>
          </div>

          {/* 분량 표 */}
          <div className={s.heroCard}>
            <div className={s.previewBox} style={{ background: mixedHex }} />
            <div className={s.heroContent}>
              <p className={s.heroLabel}>총 분량</p>
              <p className={s.heroHex}>
                <span className={s.heroBig}>{(totalAmount * pigmentScale).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}</span> {UNIT_LABELS[unit]}
              </p>
              <p className={s.heroSub}>
                혼합 결과 <strong style={{ color: mixedHex === '#FFFFFF' ? 'var(--text)' : mixedHex }}>{mixedHex}</strong> · {slots.length}색 혼합
              </p>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>📋 색별 분량</span>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>색</th>
                  <th>비율</th>
                  <th>분량 ({UNIT_LABELS[unit]})</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((sl, i) => {
                  const pct = totalParts > 0 ? (sl.weight / totalParts) * 100 : 0
                  return (
                    <tr key={i}>
                      <td>
                        <div className={s.colorChip} style={{ background: sl.hex }} />
                        <span className={s.mono}>{sl.hex}</span>
                      </td>
                      <td className={s.mono}>{sl.weight.toFixed(1)}</td>
                      <td className={s.mono}>{amountsDisplay[i].toLocaleString('ko-KR', { maximumFractionDigits: 2 })}</td>
                      <td className={s.mono}>{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
                <tr className={s.totalRow}>
                  <td>합계</td>
                  <td className={s.mono}>{totalParts.toFixed(1)}</td>
                  <td className={s.mono}>{(totalAmount * pigmentScale).toLocaleString('ko-KR', { maximumFractionDigits: 2 })}</td>
                  <td className={s.mono}>100%</td>
                </tr>
              </tbody>
            </table>
            <p className={s.hint}>
              ⓘ 단위 환산: 1큰술 = 15ml = 약 15g(물 기준), 1작은술 = 5ml, 1방울 ≈ 0.05ml. 안료의 실제 무게는 종류에 따라 다릅니다.
            </p>
          </div>
        </>
      )}

      {/* ═════════════ 탭 3: 컬러 매칭 ═════════════ */}
      {tab === 'match' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🎯 목표 색</span>
            <div className={s.targetRow}>
              <div className={s.previewBox} style={{ background: targetHex }} />
              <div className={s.targetInputs}>
                <input
                  type="color"
                  value={targetHex}
                  onChange={(e) => setTargetHex(e.target.value.toUpperCase())}
                  className={s.colorPicker}
                />
                <HexInput value={targetHex} onChange={setTargetHex} />
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🎒 사용 가능한 색 팔레트</span>
            <div className={s.paletteRow}>
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  className={`${s.paletteBtn} ${matchPalette === p.id ? s.paletteBtnActive : ''}`}
                  onClick={() => { setMatchPalette(p.id); setMatchResult(null) }}
                >
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
            <p className={s.hint}>
              💡 팔레트가 클수록 매칭이 정확해지지만 계산 시간 ↑ (전문가 24색은 5초 이상 소요 가능).
            </p>
            <button
              className={s.primaryBtn}
              onClick={startMatching}
              disabled={matching}
            >
              {matching ? '🔍 분석 중...' : '🔄 매칭 시작'}
            </button>
          </div>

          {matchResult && matchAdjustedHex && matchAdjustedDeltaE != null && (
            <>
              {/* 비교 결과 */}
              <div className={s.card}>
                <span className={s.cardLabel}>⚖️ 매칭 결과 비교</span>
                <div className={s.compareRow}>
                  <div className={s.compareCell}>
                    <div className={s.previewBox} style={{ background: targetHex }} />
                    <p className={s.compareLabel}>목표</p>
                    <p className={s.mono}>{targetHex}</p>
                  </div>
                  <div className={s.compareArrow}>→</div>
                  <div className={s.compareCell}>
                    <div className={s.previewBox} style={{ background: matchAdjustedHex }} />
                    <p className={s.compareLabel}>혼합 결과</p>
                    <p className={s.mono}>{matchAdjustedHex}</p>
                  </div>
                </div>
                <DeltaEBar deltaE={matchAdjustedDeltaE} />
              </div>

              {/* 추천 레시피 */}
              <div className={s.card}>
                <span className={s.cardLabel}>📝 추천 혼합 레시피</span>
                <div className={s.recipeView}>
                  {matchResult.colors.map((c, i) => (
                    <div key={i} className={s.recipeItem}>
                      <div className={s.colorChip} style={{ background: c.color.hex }} />
                      <span className={s.recipeName}>{c.color.name}</span>
                      <span className={s.recipeParts}>{c.weight} parts</span>
                    </div>
                  ))}
                </div>

                {/* 화이트·블랙 미세 조정 */}
                <div className={s.adjustBlock}>
                  <p className={s.adjustLabel}>🎚️ 미세 조정</p>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>흰색 추가 — {whiteAdd} parts</label>
                    <input type="range" min={0} max={5} step={1}
                      value={whiteAdd}
                      onChange={(e) => setWhiteAdd(Number(e.target.value))}
                      className={s.slider}
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.fieldLabel}>검정 추가 — {blackAdd} parts</label>
                    <input type="range" min={0} max={5} step={1}
                      value={blackAdd}
                      onChange={(e) => setBlackAdd(Number(e.target.value))}
                      className={s.slider}
                    />
                  </div>
                </div>

                <button className={s.primaryBtn} onClick={applyMatchToTab1}>
                  🎨 탭 1에 적용
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ═════════════ 탭 4: 레시피 + 색환 ═════════════ */}
      {tab === 'recipe' && (
        <>
          {/* 색환 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🎡 12색 색환 — 클릭하면 보색·유사색·삼각배색 표시</span>
            <ColorWheel selectedIdx={wheelIdx} onSelect={setWheelIdx} />
            <div className={s.wheelInfo}>
              <div className={s.wheelInfoBlock}>
                <p className={s.wheelInfoLabel}>🟣 선택</p>
                <div className={s.colorChip} style={{ background: COLOR_WHEEL_12[wheelIdx].hex }} />
                <p className={s.wheelInfoText}>{COLOR_WHEEL_12[wheelIdx].name}</p>
              </div>
              <div className={s.wheelInfoBlock}>
                <p className={s.wheelInfoLabel}>♻️ 보색</p>
                <div className={s.colorChip} style={{ background: wheelComp.hex }} />
                <p className={s.wheelInfoText}>{wheelComp.name}</p>
              </div>
              <div className={s.wheelInfoBlock}>
                <p className={s.wheelInfoLabel}>🌗 유사색</p>
                <div className={s.chipPair}>
                  {wheelAna.map((c, i) => (
                    <div key={i}>
                      <div className={s.colorChip} style={{ background: c.hex }} />
                      <p className={s.wheelInfoTextSm}>{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.wheelInfoBlock}>
                <p className={s.wheelInfoLabel}>🔺 삼각배색</p>
                <div className={s.chipPair}>
                  {wheelTri.map((c, i) => (
                    <div key={i}>
                      <div className={s.colorChip} style={{ background: c.hex }} />
                      <p className={s.wheelInfoTextSm}>{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className={s.hint}>
              💡 <strong>보색 혼합 → 무채색</strong>: 빨강+초록 = 갈색~회색, 파랑+주황 = 회색~갈색.
              피해야 할 조합처럼 보이지만, <strong>그림자·중성색</strong>을 만드는 가장 자연스러운 방법입니다.
            </p>
          </div>

          {/* 레시피 그리드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📚 30+ 인기 색 레시피 (클릭 시 탭 1에 적용)</span>
            <div className={s.recipeGrid}>
              {RECIPES.map((r, i) => {
                /* 미리보기 색 계산 */
                const map = new Map(SCHOOL_12.map((c) => [c.name, c.hex]))
                const preview = mixColors(
                  r.mix.map(([name, parts]) => ({ hex: map.get(name) ?? '#888', weight: parts })),
                  'subtractive',
                )
                return (
                  <button key={i} className={s.recipeCard} onClick={() => applyRecipe(r)}>
                    <div className={s.recipePreview} style={{ background: preview }} />
                    <p className={s.recipeCardName}>{r.emoji} {r.name}</p>
                    <p className={s.recipeCardMix}>
                      {r.mix.map((m) => `${m[0]} ${m[1]}`).join(' + ')}
                    </p>
                    <p className={s.recipeCardDesc}>{r.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 분야별 가이드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🎓 분야별 추천 색 세트</span>
            <div className={s.fieldList}>
              {FIELD_GUIDES.map((f) => (
                <div key={f.id} className={s.fieldCard}>
                  <p className={s.fieldName}>{f.emoji} <strong>{f.name}</strong></p>
                  <p className={s.fieldRec}><strong>추천 색 세트:</strong> {f.recommended}</p>
                  <p className={s.fieldTip}>{f.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── 슬롯 편집기 ─── */
function SlotEditor({
  index, slot, totalParts, onChange, onRemove, canRemove,
}: {
  index: number
  slot: Slot
  totalParts: number
  onChange: (patch: Partial<Slot>) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const pct = totalParts > 0 ? (slot.weight / totalParts) * 100 : 0
  return (
    <div className={s.slotRow}>
      <div className={s.slotPreview} style={{ background: slot.hex }} />

      <div className={s.slotInputs}>
        {/* HEX + 컬러 피커 */}
        <div className={s.colorInputRow}>
          <input
            type="color"
            value={slot.hex}
            onChange={(e) => onChange({ hex: e.target.value.toUpperCase() })}
            className={s.colorPicker}
          />
          <HexInput value={slot.hex} onChange={(hex) => onChange({ hex })} />
          <PresetSelect onPick={(hex) => onChange({ hex })} />
        </div>

        {/* 비율 슬라이더 + 숫자 */}
        <div className={s.weightRow}>
          <input
            type="range" min={0.1} max={10} step={0.1}
            value={slot.weight}
            onChange={(e) => onChange({ weight: Number(e.target.value) })}
            className={s.slider}
          />
          <input
            type="number" min={0.1} max={10} step={0.1}
            value={slot.weight}
            onChange={(e) => onChange({ weight: Math.max(0.1, Math.min(10, Number(e.target.value) || 0.1)) })}
            className={s.weightNum}
          />
          <span className={s.pctTag}>{pct.toFixed(0)}%</span>
        </div>
      </div>

      {canRemove && (
        <button className={s.iconBtn} onClick={onRemove} aria-label={`색 ${index + 1} 삭제`}>
          🗑️
        </button>
      )}
    </div>
  )
}

/* ─── HEX 입력 (정규화 포함) ─── */
function HexInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const [local, setLocal] = useState(value)
  useEffect(() => { setLocal(value) }, [value])
  const commit = () => {
    const norm = normalizeHex(local)
    if (norm) {
      onChange(norm)
      setLocal(norm)
    } else {
      setLocal(value)  /* 잘못된 입력 → 원복 */
    }
  }
  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur() }}
      className={s.hexInput}
      maxLength={7}
      placeholder="#RRGGBB"
    />
  )
}

/* ─── 프리셋 드롭다운 ─── */
function PresetSelect({ onPick }: { onPick: (hex: string) => void }) {
  const [v, setV] = useState('')
  return (
    <select
      value={v}
      onChange={(e) => {
        if (e.target.value) {
          onPick(e.target.value)
          setV('')  /* 선택 후 초기화 */
        }
      }}
      className={s.presetSelect}
    >
      <option value="">📋 프리셋</option>
      <optgroup label="🎒 학교 12색">
        {SCHOOL_12.map((c) => <option key={c.hex} value={c.hex}>{c.name}</option>)}
      </optgroup>
      <optgroup label="🎨 전문가 24색">
        {PRO_24.map((c) => <option key={c.hex} value={c.hex}>{c.name}</option>)}
      </optgroup>
      <optgroup label="✒️ 만년필 잉크">
        {INK_BRANDS.map((c) => <option key={c.hex} value={c.hex}>{c.name}</option>)}
      </optgroup>
      <optgroup label="🧁 푸드컬러">
        {FOOD_COLORS.map((c) => <option key={c.hex} value={c.hex}>{c.name}</option>)}
      </optgroup>
    </select>
  )
}

/* ─── ΔE 등급 막대 ─── */
function DeltaEBar({ deltaE }: { deltaE: number }) {
  const grade = deltaEGrade(deltaE)
  return (
    <div className={s.deltaBar}>
      <div className={s.deltaInfo}>
        <span className={s.deltaLabel}>색 차이 ΔE = <strong>{deltaE.toFixed(2)}</strong></span>
        <span className={s.deltaGrade} style={{ color: grade.color }}>
          {grade.label} · {grade.pct}%
        </span>
      </div>
      <div className={s.deltaBarBg}>
        <div className={s.deltaBarFill} style={{ width: `${grade.pct}%`, background: grade.color }} />
      </div>
      <p className={s.hint} style={{ marginTop: 6 }}>
        ΔE 0~1 완벽 / 1~2 매우 비슷 / 2~5 비슷 / 5~10 가능 / 10+ 다름
      </p>
    </div>
  )
}

/* ─── 12색환 SVG ─── */
function ColorWheel({ selectedIdx, onSelect }: { selectedIdx: number; onSelect: (i: number) => void }) {
  const W = 300, H = 300
  const cx = W / 2, cy = H / 2, R = 120, rInner = 50
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 320, display: 'block', margin: '0 auto' }}>
      {COLOR_WHEEL_12.map((c, i) => {
        const a0 = (i / 12) * Math.PI * 2 - Math.PI / 2 - Math.PI / 12
        const a1 = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2 - Math.PI / 12
        const x0 = cx + R * Math.cos(a0)
        const y0 = cy + R * Math.sin(a0)
        const x1 = cx + R * Math.cos(a1)
        const y1 = cy + R * Math.sin(a1)
        const xi0 = cx + rInner * Math.cos(a0)
        const yi0 = cy + rInner * Math.sin(a0)
        const xi1 = cx + rInner * Math.cos(a1)
        const yi1 = cy + rInner * Math.sin(a1)
        const isSelected = i === selectedIdx
        return (
          <g key={i} onClick={() => onSelect(i)} style={{ cursor: 'pointer' }}>
            <path
              d={`M ${xi0} ${yi0} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} A ${rInner} ${rInner} 0 0 0 ${xi0} ${yi0} Z`}
              fill={c.hex}
              stroke={isSelected ? 'var(--text)' : 'var(--bg)'}
              strokeWidth={isSelected ? 3 : 1.5}
              opacity={isSelected ? 1 : 0.85}
            />
          </g>
        )
      })}
      {/* 중앙에 선택 색 표시 */}
      <circle cx={cx} cy={cy} r={rInner - 4} fill={COLOR_WHEEL_12[selectedIdx].hex} stroke="var(--bg)" strokeWidth={2} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--bg)" fontSize={12} fontWeight={700} fontFamily="Noto Sans KR, sans-serif">
        {COLOR_WHEEL_12[selectedIdx].name}
      </text>
    </svg>
  )
}
