/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useMemo, useEffect } from 'react'
import styles from './nuts.module.css'
import {
  NUTS_DATA, PROC_DATA, POPULAR_MIXES,
  ALLERGY_GROUP_LABEL, SELENIUM_RDA, SELENIUM_UL,
  loadSettings, saveSettings,
  type ProcK, type AllergyGroup,
} from './nutsData'

type GoalK = 'diet' | 'maintain' | 'gain'

// 견과류별 입력 양 (g) — 0이면 미선택
type AmountMap = Record<string, number>

export default function NutsClient() {
  const [allergies, setAllergies] = useState<AllergyGroup[]>([])
  const [proc, setProc] = useState<ProcK>('raw')
  const [weight, setWeight] = useState(65)
  const [goal, setGoal] = useState<GoalK>('maintain')
  const [dailyKcal, setDailyKcal] = useState('')
  const [amounts, setAmounts] = useState<AmountMap>({ almond: 28 })
  const [mounted, setMounted] = useState(false)

  // localStorage 로드
  useEffect(() => {
    const s = loadSettings()
    if (s.weight) setWeight(s.weight)
    if (s.goal) setGoal(s.goal)
    if (s.dailyKcal) setDailyKcal(s.dailyKcal)
    if (s.proc) setProc(s.proc)
    if (s.allergies) setAllergies(s.allergies)
    setMounted(true)
  }, [])

  // 변경 시 저장
  useEffect(() => {
    if (!mounted) return
    saveSettings({ weight, goal, dailyKcal, proc, allergies })
  }, [weight, goal, dailyKcal, proc, allergies, mounted])

  const procData = PROC_DATA.find((p) => p.key === proc)!

  const isAllergenic = (group: AllergyGroup) => allergies.includes(group)

  const toggleAllergy = (g: AllergyGroup) => {
    setAllergies((prev) => {
      if (prev.includes(g)) return prev.filter((x) => x !== g)
      // 알레르기 추가 시, 해당 그룹 견과 자동 해제
      const newAllergies = [...prev, g]
      const next: AmountMap = {}
      for (const [k, v] of Object.entries(amounts)) {
        const nut = NUTS_DATA.find((n) => n.key === k)
        if (nut && !newAllergies.includes(nut.allergyGroup)) next[k] = v
      }
      setAmounts(next)
      return newAllergies
    })
  }

  const setAmount = (key: string, grams: number) => {
    setAmounts((prev) => {
      const next = { ...prev }
      if (grams <= 0) delete next[key]
      else next[key] = grams
      return next
    })
  }
  const toggleNut = (key: string, defaultGrams: number) => {
    setAmounts((prev) => {
      if (prev[key]) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: defaultGrams }
    })
  }

  const applyPreset = (preset: typeof POPULAR_MIXES[0]) => {
    const next: AmountMap = {}
    for (const item of preset.items) {
      const nut = NUTS_DATA.find((n) => n.key === item.key)
      if (nut && !isAllergenic(nut.allergyGroup)) next[item.key] = item.grams
    }
    setAmounts(next)
  }

  // 자동 칼로리 목표
  const autoKcal = useMemo(() => {
    const factor = goal === 'diet' ? 25 : goal === 'gain' ? 40 : 32
    return Math.round((weight * factor) / 10) * 10
  }, [weight, goal])
  const targetKcal = parseInt(dailyKcal, 10) || autoKcal

  // 선택 견과 + 양 계산
  const selectedNuts = useMemo(() => {
    return NUTS_DATA.filter((n) => amounts[n.key] && amounts[n.key] > 0)
      .map((n) => {
        const grams = amounts[n.key]
        const ratio = grams / n.servingGrams
        return {
          ...n,
          grams,
          count: n.servingCount !== null ? Math.round(n.servingCount * ratio) : null,
          kcal: n.caloriePerServing * ratio * procData.calFactor,
          protein: n.protein * ratio,
          fat: n.fat * ratio,
          carbs: n.carbs * ratio,
          fiber: n.fiber * ratio,
          selenium: n.selenium * ratio,
        }
      })
  }, [amounts, procData])

  // 합계
  const totals = useMemo(() => {
    return selectedNuts.reduce((acc, n) => ({
      kcal: acc.kcal + n.kcal,
      protein: acc.protein + n.protein,
      fat: acc.fat + n.fat,
      carbs: acc.carbs + n.carbs,
      fiber: acc.fiber + n.fiber,
      grams: acc.grams + n.grams,
      sodium: acc.sodium + procData.sodiumAdd,
      selenium: acc.selenium + n.selenium,
    }), { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, grams: 0, sodium: 0, selenium: 0 })
  }, [selectedNuts, procData])

  const pctOfDaily = targetKcal > 0 ? (totals.kcal / targetKcal) * 100 : 0
  const seleniumPct = (totals.selenium / SELENIUM_RDA) * 100
  const kcalColorClass =
    totals.kcal <= 200 ? styles.progressFillGreen
    : totals.kcal <= 300 ? styles.progressFillAccent
    : styles.progressFillOrange

  // 가시 견과 (알레르기 필터)
  const visibleNuts = NUTS_DATA.filter((n) => !isAllergenic(n.allergyGroup))

  return (
    <div className={styles.wrap}>
      {/* ── 0. 인기 믹스 프리셋 (NEW) ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>🥗 인기 믹스 — 한 번 클릭으로 적용</label>
        <div className={styles.presetGrid}>
          {POPULAR_MIXES.map((p) => {
            const blocked = p.items.some((it) => {
              const nut = NUTS_DATA.find((n) => n.key === it.key)
              return nut && isAllergenic(nut.allergyGroup)
            })
            return (
              <button key={p.id} type="button"
                className={`${styles.presetBtn} ${blocked ? styles.presetBtnBlocked : ''}`}
                onClick={() => !blocked && applyPreset(p)}
                disabled={blocked}
                title={blocked ? '알레르기 그룹 포함' : ''}
              >
                <span className={styles.presetName}>{p.name}</span>
                <span className={styles.presetDesc}>{p.desc}</span>
                <span className={styles.presetItems}>
                  {p.items.map((it) => {
                    const nut = NUTS_DATA.find((n) => n.key === it.key)
                    return nut ? `${nut.icon} ${nut.name} ${it.grams}g` : ''
                  }).join(' · ')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 1. 알레르기 필터 (NEW) ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>🛡️ 알레르기 필터 (선택)</label>
        <div className={styles.allergyRow}>
          {(Object.keys(ALLERGY_GROUP_LABEL) as AllergyGroup[]).map((g) => (
            <button key={g} type="button"
              className={`${styles.allergyChip} ${isAllergenic(g) ? styles.allergyChipActive : ''}`}
              onClick={() => toggleAllergy(g)}>
              {isAllergenic(g) ? '🚫' : '☐'} {ALLERGY_GROUP_LABEL[g]}
            </button>
          ))}
        </div>
        <p className={styles.allergyHint}>
          체크 시 해당 그룹 견과류는 선택 그리드에서 숨겨집니다. 알레르기 진단은 의사·전문 검사를 받으세요. 응급(아나필락시스): 즉시 119.
        </p>
      </div>

      {/* ── 2. 견과류 선택 + 양 입력 (강화) ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>🥜 견과류 선택 + 양 입력 (g)</label>
        <p className={styles.cardSub}>각 견과류별 양을 g 단위로 직접 입력. 칩 클릭 시 기본값(28g, 브라질너트 10g) 자동 채움.</p>
        <div className={styles.nutGrid}>
          {visibleNuts.map((n) => {
            const isSelected = !!amounts[n.key]
            const defaultGrams = n.servingGrams
            return (
              <div key={n.key}
                className={`${styles.nutCard} ${isSelected ? styles.nutCardActive : ''} ${n.danger ? styles.nutCardDanger : ''}`}>
                <button type="button" className={styles.nutToggle}
                  onClick={() => toggleNut(n.key, defaultGrams)}
                  aria-label={isSelected ? '제거' : '추가'}>
                  <span className={styles.nutColorDot} style={{ background: n.color }} />
                  <span className={styles.nutIcon}>{n.icon}</span>
                  <span className={styles.nutName}>{n.name}</span>
                  <span className={styles.nutKcal}>{n.caloriePerServing}kcal/{n.servingGrams}g</span>
                </button>
                {isSelected && (
                  <div className={styles.nutAmountRow}>
                    <input type="number" inputMode="numeric" min={0} max={500}
                      className={styles.nutAmountInput}
                      value={amounts[n.key]}
                      onChange={(e) => setAmount(n.key, Math.max(0, +e.target.value || 0))}
                    />
                    <span className={styles.nutUnit}>g</span>
                    {n.servingCount !== null && (
                      <span className={styles.nutCount}>
                        ≈ {Math.round((amounts[n.key] / n.servingGrams) * n.servingCount)}알
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {visibleNuts.length === 0 && (
          <p className={styles.empty}>알레르기 필터로 모든 견과류가 제외되었습니다.</p>
        )}
      </div>

      {/* ── 3. 가공 상태 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>🔥 가공 상태</label>
        <div className={styles.condRow}>
          {PROC_DATA.map((p) => (
            <button key={p.key} type="button"
              className={`${styles.condBtn} ${p.heavy ? styles.condWarn : ''} ${proc === p.key ? styles.condActive : ''}`}
              onClick={() => setProc(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
        {procData.warning && (
          <div className={styles.procWarn} style={{ marginTop: 12 }}>
            <strong>⚠️ {procData.label}:</strong> {procData.warning}
            {procData.calFactor !== 1.0 && (<> · 칼로리 × {procData.calFactor.toFixed(2)} 보정</>)}
          </div>
        )}
      </div>

      {/* ── 4. 개인 정보 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>👤 개인 정보 (선택)</label>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>체중 (kg)</div>
          <div className={styles.sliderRow}>
            <input type="range" min={40} max={120} step={1}
              className={styles.slider}
              value={weight}
              onChange={(e) => setWeight(parseInt(e.target.value, 10))} />
            <span className={styles.sliderValue}>{weight}kg</span>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>목표</div>
          <div className={styles.condRow}>
            {[
              { k: 'diet',     label: '🔻 다이어트' },
              { k: 'maintain', label: '⚖️ 체중 유지' },
              { k: 'gain',     label: '💪 근육 증가' },
            ].map((g) => (
              <button key={g.k} type="button"
                className={`${styles.condBtn} ${goal === g.k ? styles.condActive : ''}`}
                onClick={() => setGoal(g.k as GoalK)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
            하루 칼로리 목표 (비우면 자동: <strong style={{ color: 'var(--accent)' }}>{autoKcal.toLocaleString()}kcal</strong>)
          </div>
          <input type="number" inputMode="numeric"
            className={styles.numInput}
            placeholder={`${autoKcal}`}
            value={dailyKcal}
            onChange={(e) => setDailyKcal(e.target.value)}
            min={1000} max={5000} />
        </div>
      </div>

      {/* ── 결과 ── */}
      {selectedNuts.length === 0 ? (
        <div className={styles.empty}>견과류를 하나 이상 선택하세요</div>
      ) : (
        <>
          {/* 합산 카드 */}
          <div className={styles.summary}>
            <div className={styles.summaryHead}>📊 합산 — {selectedNuts.length}종 / 총 {Math.round(totals.grams)}g</div>
            <div className={styles.summaryKcal}>{Math.round(totals.kcal).toLocaleString()} kcal</div>
            <div className={styles.summaryKcalSub}>나트륨 {Math.round(totals.sodium)}mg · 셀레늄 {Math.round(totals.selenium)}μg</div>

            <div className={styles.progressRow}>
              <span className={styles.progressLabel}>하루 칼로리 대비</span>
              <div className={styles.progressBar}>
                <div className={`${styles.progressFill} ${kcalColorClass}`}
                  style={{ width: `${Math.min(100, pctOfDaily)}%` }} />
              </div>
              <span className={styles.progressPct}>{pctOfDaily.toFixed(1)}%</span>
            </div>

            <div className={styles.summaryNutri}>
              <div className={styles.nutriBox}>
                <div className={styles.nutriLabel}>단백질</div>
                <div className={styles.nutriVal}>{totals.protein.toFixed(1)}g</div>
              </div>
              <div className={styles.nutriBox}>
                <div className={styles.nutriLabel}>지방</div>
                <div className={styles.nutriVal}>{totals.fat.toFixed(1)}g</div>
              </div>
              <div className={styles.nutriBox}>
                <div className={styles.nutriLabel}>탄수화물</div>
                <div className={styles.nutriVal}>{totals.carbs.toFixed(1)}g</div>
              </div>
              <div className={styles.nutriBox}>
                <div className={styles.nutriLabel}>식이섬유</div>
                <div className={styles.nutriVal}>{totals.fiber.toFixed(1)}g</div>
              </div>
            </div>

            {/* 셀레늄 자동 경고 */}
            {totals.selenium > 0 && (
              <div className={`${styles.seleniumBar} ${
                totals.selenium >= SELENIUM_UL ? styles.seleniumDanger
                : totals.selenium >= SELENIUM_RDA * 2 ? styles.seleniumWarn
                : styles.seleniumOk
              }`}>
                <div className={styles.seleniumHead}>
                  <span>셀레늄 {totals.selenium.toFixed(0)}μg</span>
                  <span className={styles.seleniumPct}>
                    RDA {SELENIUM_RDA}μg의 {seleniumPct.toFixed(0)}% · UL {SELENIUM_UL}μg
                  </span>
                </div>
                <div className={styles.seleniumBarTrack}>
                  <div className={styles.seleniumBarFill}
                    style={{ width: `${Math.min(100, (totals.selenium / SELENIUM_UL) * 100)}%` }} />
                </div>
                {totals.selenium >= SELENIUM_UL && (
                  <p className={styles.seleniumMsg}>
                    🔴 <strong>상한(UL) 초과!</strong> 브라질너트 줄이기 권장. 매일 섭취 시 셀레늄 독성(탈모·손발톱 변형) 위험.
                  </p>
                )}
                {totals.selenium >= SELENIUM_RDA * 2 && totals.selenium < SELENIUM_UL && (
                  <p className={styles.seleniumMsg}>
                    🟡 <strong>권장량 2배 초과.</strong> 매일이 아닌 주 2~3회로 제한 권장.
                  </p>
                )}
                {totals.selenium < SELENIUM_RDA * 2 && (
                  <p className={styles.seleniumMsg}>
                    ✅ 안전 범위. 셀레늄은 갑상선·항산화에 필수.
                  </p>
                )}
              </div>
            )}

            {totals.kcal > 300 && (
              <div className={styles.warnBox} style={{ marginTop: 12 }}>
                ⚠️ 합산 칼로리가 300kcal를 넘습니다. 하루 권장 간식 칼로리(총 열량의 10~15%)의 상한선에 가깝습니다. 종류·양을 줄이거나 분할 섭취 고려.
              </div>
            )}
          </div>

          {/* 견과류별 카드 */}
          <div className={styles.cardLabelStandalone}>견과류별 상세</div>
          {selectedNuts.map((n) => (
            <div key={n.key} className={styles.result}>
              <div className={styles.resultHead}>
                <span className={styles.resultColorDot} style={{ background: n.color }} />
                <span className={styles.resultEmoji}>{n.icon}</span>
                <div>
                  <div className={styles.resultName}>{n.name}</div>
                  <div className={styles.resultAllergyTag}>알레르기 그룹: {ALLERGY_GROUP_LABEL[n.allergyGroup]}</div>
                </div>
              </div>

              <div className={styles.amountHero}>
                <div className={styles.amountLead}>현재 입력</div>
                <div className={styles.amountValue}>
                  {n.count !== null ? `약 ${n.count}알 (${n.grams}g)` : `${n.grams}g`}
                </div>
                <div className={styles.amountSub}>약 <strong>{Math.round(n.kcal)}kcal</strong></div>
              </div>

              <div className={styles.nutriGrid}>
                <div className={styles.nutriBox}><div className={styles.nutriLabel}>단백질</div><div className={styles.nutriVal}>{n.protein.toFixed(1)}g</div></div>
                <div className={styles.nutriBox}><div className={styles.nutriLabel}>지방</div><div className={styles.nutriVal}>{n.fat.toFixed(1)}g</div></div>
                <div className={styles.nutriBox}><div className={styles.nutriLabel}>탄수화물</div><div className={styles.nutriVal}>{n.carbs.toFixed(1)}g</div></div>
                <div className={styles.nutriBox}><div className={styles.nutriLabel}>식이섬유</div><div className={styles.nutriVal}>{n.fiber.toFixed(1)}g</div></div>
              </div>

              <div className={styles.badges}>
                <span className={styles.keyBadge}>★ {n.keyNutrient} · {n.keyNutrientAmount}</span>
                {n.benefit.map((b, i) => (
                  <span key={i} className={styles.benefitBadge}>{b}</span>
                ))}
              </div>

              {n.danger && (
                <div className={styles.dangerBox}>🚨 <strong>{n.warning}</strong></div>
              )}
              {!n.danger && n.warning && (
                <div className={styles.warnBox}>⚠️ {n.warning}</div>
              )}
            </div>
          ))}
        </>
      )}

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 도구는 일반 가이드입니다.</strong>
        <ul>
          <li>영양 정보는 평균값 (USDA·한국영양학회 기준 — 브랜드·지역별 차이)</li>
          <li>알레르기 진단·치료, 영양 상담, 의약품·보충제 비교, 특정 브랜드 추천 X</li>
          <li>영유아·임산부·신장/갑상선 환자: 의사·영양사 상담 우선</li>
          <li>아나필락시스(호흡 곤란·의식 저하·전신 두드러기) 시 즉시 119</li>
          <li>참고: 한국영양학회 (kns.or.kr), 식약처 식품안전정보 1399</li>
        </ul>
      </div>
    </div>
  )
}
