'use client'

import { useState, useMemo } from 'react'
import styles from './nuts.module.css'

// ── Data ──────────────────────────────────────
interface NutData {
  key: string
  name: string
  emoji: string
  servingGrams: number
  servingCount: number | null
  caloriePerServing: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  keyNutrient: string
  keyNutrientAmount: string
  maxDaily: number
  warning: string | null
  danger: boolean
  allergyGroup: string
  benefit: string[]
}

const NUTS: NutData[] = [
  { key: 'almond', name: '아몬드', emoji: '🌰',
    servingGrams: 28, servingCount: 23, caloriePerServing: 164,
    protein: 6, fat: 14, carbs: 6, fiber: 3.5,
    keyNutrient: '비타민E', keyNutrientAmount: '7.3mg (하루 권장량 48%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: '핵과류',
    benefit: ['심혈관 건강', '혈당 조절', '뼈 건강'] },
  { key: 'walnut', name: '호두', emoji: '🌰',
    servingGrams: 28, servingCount: 14, caloriePerServing: 185,
    protein: 4.3, fat: 18.5, carbs: 3.9, fiber: 1.9,
    keyNutrient: '오메가3(ALA)', keyNutrientAmount: '2.6g',
    maxDaily: 30, warning: null, danger: false, allergyGroup: '견과류',
    benefit: ['뇌 건강', '항염증', '심혈관 건강'] },
  { key: 'cashew', name: '캐슈넛', emoji: '🥜',
    servingGrams: 28, servingCount: 18, caloriePerServing: 157,
    protein: 5.2, fat: 12.4, carbs: 8.6, fiber: 0.9,
    keyNutrient: '마그네슘', keyNutrientAmount: '83mg (하루 권장량 21%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: '핵과류',
    benefit: ['뼈 건강', '혈압 조절', '에너지 대사'] },
  { key: 'brazilNut', name: '브라질너트', emoji: '🌰',
    servingGrams: 10, servingCount: 2, caloriePerServing: 66,
    protein: 1.4, fat: 6.6, carbs: 1.2, fiber: 0.7,
    keyNutrient: '셀레늄', keyNutrientAmount: '175μg (하루 권장량 318%)',
    maxDaily: 10,
    warning: '하루 2~3알(10g) 초과 절대 금지. 셀레늄 독성(탈모·손발톱 변형·신경 손상) 위험.',
    danger: true, allergyGroup: '견과류',
    benefit: ['셀레늄 보충', '항산화', '갑상선 기능'] },
  { key: 'peanut', name: '땅콩', emoji: '🥜',
    servingGrams: 28, servingCount: 28, caloriePerServing: 161,
    protein: 7.3, fat: 14, carbs: 4.6, fiber: 2.4,
    keyNutrient: '단백질', keyNutrientAmount: '7.3g',
    maxDaily: 30, warning: null, danger: false,
    allergyGroup: '콩과식물 (견과류 아님, 알레르기 주의)',
    benefit: ['근육 합성', '포만감', '엽산'] },
  { key: 'sunflowerSeed', name: '해바라기씨', emoji: '🌻',
    servingGrams: 28, servingCount: null, caloriePerServing: 165,
    protein: 5.5, fat: 14.4, carbs: 6.8, fiber: 2.4,
    keyNutrient: '비타민E', keyNutrientAmount: '7.4mg (하루 권장량 49%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: '씨앗류',
    benefit: ['항산화', '심혈관 건강', '마그네슘'] },
  { key: 'pumpkinSeed', name: '호박씨', emoji: '🎃',
    servingGrams: 28, servingCount: null, caloriePerServing: 151,
    protein: 8.5, fat: 13, carbs: 5, fiber: 1.7,
    keyNutrient: '아연', keyNutrientAmount: '2.2mg (하루 권장량 20%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: '씨앗류',
    benefit: ['전립선 건강', '수면 개선', '면역 기능'] },
  { key: 'pistachio', name: '피스타치오', emoji: '🌰',
    servingGrams: 28, servingCount: 49, caloriePerServing: 159,
    protein: 5.7, fat: 12.9, carbs: 7.7, fiber: 3,
    keyNutrient: '비타민B6', keyNutrientAmount: '0.5mg (하루 권장량 25%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: '핵과류',
    benefit: ['혈당 조절', '장 건강', '항산화'] },
  { key: 'pecan', name: '피칸', emoji: '🌰',
    servingGrams: 28, servingCount: 19, caloriePerServing: 196,
    protein: 2.6, fat: 20.4, carbs: 3.9, fiber: 2.7,
    keyNutrient: '망간', keyNutrientAmount: '1.3mg (하루 권장량 65%)',
    maxDaily: 28, warning: null, danger: false, allergyGroup: '핵과류',
    benefit: ['심혈관 건강', '항산화', '뇌 건강'] },
  { key: 'macadamia', name: '마카다미아', emoji: '🌰',
    servingGrams: 28, servingCount: 10, caloriePerServing: 204,
    protein: 2.2, fat: 21.5, carbs: 3.9, fiber: 2.4,
    keyNutrient: '단일불포화지방', keyNutrientAmount: '16.7g',
    maxDaily: 28, warning: '칼로리가 높아 다이어트 시 소량 섭취 권장',
    danger: false, allergyGroup: '견과류',
    benefit: ['심혈관 건강', '뇌 건강', '항염증'] },
  { key: 'hazelnut', name: '헤이즐넛', emoji: '🌰',
    servingGrams: 28, servingCount: 21, caloriePerServing: 178,
    protein: 4.2, fat: 17.2, carbs: 4.7, fiber: 2.7,
    keyNutrient: '비타민E', keyNutrientAmount: '4.3mg (하루 권장량 28%)',
    maxDaily: 30, warning: null, danger: false, allergyGroup: '견과류',
    benefit: ['심혈관 건강', '혈당 조절', '뼈 건강'] },
  { key: 'pineNut', name: '잣', emoji: '🌰',
    servingGrams: 28, servingCount: null, caloriePerServing: 191,
    protein: 3.9, fat: 19.4, carbs: 3.7, fiber: 1,
    keyNutrient: '철분', keyNutrientAmount: '1.6mg (하루 권장량 16%)',
    maxDaily: 28, warning: null, danger: false, allergyGroup: '견과류',
    benefit: ['에너지 대사', '식욕 조절', '항산화'] },
]

// ── Processing ──────────────────────────────────────
type ProcK = 'raw' | 'salted' | 'roasted' | 'oilCoated' | 'chocolate' | 'honey'

interface ProcData {
  key: ProcK
  label: string
  calFactor: number
  sodiumAdd: number
  warning: string | null
  heavy: boolean
}

const PROC: ProcData[] = [
  { key: 'raw',         label: '🌱 생/건조 (무염)', calFactor: 1.0,  sodiumAdd: 0,   warning: null, heavy: false },
  { key: 'salted',      label: '🧂 가염',           calFactor: 1.0,  sodiumAdd: 150, warning: '나트륨 과잉 주의 (고혈압 주의)', heavy: false },
  { key: 'roasted',     label: '🔥 볶음',           calFactor: 1.05, sodiumAdd: 0,   warning: null, heavy: false },
  { key: 'oilCoated',   label: '🛢 오일 코팅',       calFactor: 1.1,  sodiumAdd: 80,  warning: '불필요한 지방 추가', heavy: true },
  { key: 'chocolate',   label: '🍫 초콜릿·시즈닝',   calFactor: 1.6,  sodiumAdd: 50,  warning: '설탕·트랜스지방 주의. 건강 효과 크게 감소.', heavy: true },
  { key: 'honey',       label: '🍯 꿀 코팅',         calFactor: 1.2,  sodiumAdd: 20,  warning: '당분 추가 (혈당 주의)', heavy: true },
]

type GoalK = 'diet' | 'maintain' | 'gain'

// ── Component ──────────────────────────────────────
export default function NutsClient() {
  const [selected, setSelected] = useState<string[]>(['almond'])
  const [proc, setProc] = useState<ProcK>('raw')
  const [weight, setWeight] = useState(65)
  const [goal, setGoal] = useState<GoalK>('maintain')
  const [dailyKcal, setDailyKcal] = useState('')

  const toggle = (k: string) => {
    setSelected(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  const selectedNuts = useMemo(
    () => NUTS.filter(n => selected.includes(n.key)),
    [selected]
  )
  const procData = PROC.find(p => p.key === proc)!

  // Auto kcal goal from weight + goal
  const autoKcal = useMemo(() => {
    // rough estimate: weight(kg) × factor
    const factor = goal === 'diet' ? 25 : goal === 'gain' ? 40 : 32
    return Math.round(weight * factor / 10) * 10
  }, [weight, goal])

  const targetKcal = parseInt(dailyKcal, 10) || autoKcal

  // calculate personalized serving multiplier
  // default 28g = ~164kcal = 8% of 2000kcal. Scale proportionally.
  const servingMultiplier = useMemo(() => {
    // for diet, slight reduction; gain, slight increase
    if (goal === 'diet') return 0.85
    if (goal === 'gain') return 1.15
    return 1.0
  }, [goal])

  // aggregate totals
  const totals = useMemo(() => {
    return selectedNuts.reduce((acc, n) => {
      const mult = (n.danger ? 1 : servingMultiplier) * procData.calFactor
      const grams = n.danger ? n.servingGrams : n.servingGrams * (n.danger ? 1 : servingMultiplier)
      return {
        kcal: acc.kcal + n.caloriePerServing * mult,
        protein: acc.protein + n.protein * (grams / n.servingGrams),
        fat: acc.fat + n.fat * (grams / n.servingGrams),
        carbs: acc.carbs + n.carbs * (grams / n.servingGrams),
        fiber: acc.fiber + n.fiber * (grams / n.servingGrams),
        grams: acc.grams + grams,
        sodium: acc.sodium + procData.sodiumAdd,
      }
    }, { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, grams: 0, sodium: 0 })
  }, [selectedNuts, procData, servingMultiplier])

  const pctOfDaily = targetKcal > 0 ? (totals.kcal / targetKcal) * 100 : 0
  const kcalColorClass =
    totals.kcal <= 200 ? styles.progressFillGreen
    : totals.kcal <= 300 ? styles.progressFillAccent
    : styles.progressFillOrange

  return (
    <div className={styles.wrap}>

      {/* 1. 견과류 선택 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>1. 견과류 선택 (복수 선택 가능)</label>
        <div className={styles.nutGrid}>
          {NUTS.map(n => {
            const active = selected.includes(n.key)
            const num = active ? selected.indexOf(n.key) + 1 : 0
            return (
              <button key={n.key} type="button"
                className={`${styles.nutBtn} ${active ? styles.nutActive : ''}`}
                onClick={() => toggle(n.key)}>
                <span className={styles.nutEmoji}>{n.emoji}</span>
                <span className={styles.nutName}>{n.name}</span>
                <span className={styles.nutKcal}>{n.caloriePerServing}kcal/{n.servingGrams}g</span>
                {active && selected.length > 1 && (
                  <span className={styles.nutBadge}>{num}</span>
                )}
              </button>
            )
          })}
        </div>
        {selected.length > 1 && (
          <p className={styles.cardSub}>
            ✅ {selected.length}종 선택됨 — 각 견과류별 결과 + 하단 합산 카드가 표시됩니다.
          </p>
        )}
      </div>

      {/* 2. 가공 상태 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>2. 가공 상태</label>
        <div className={styles.condRow}>
          {PROC.map(p => (
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
            {procData.calFactor !== 1.0 && (
              <> · 칼로리 × {procData.calFactor.toFixed(2)} 보정</>
            )}
          </div>
        )}
      </div>

      {/* 3. 개인 정보 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>3. 개인 정보 (선택)</label>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>체중 (kg)</div>
          <div className={styles.sliderRow}>
            <input type="range" min={40} max={120} step={1}
              className={styles.slider}
              value={weight}
              onChange={e => setWeight(parseInt(e.target.value, 10))} />
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
            ].map(g => (
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
            onChange={e => setDailyKcal(e.target.value)}
            min={1000} max={5000} />
        </div>
      </div>

      {/* RESULTS per-nut */}
      {selectedNuts.length === 0 ? (
        <div className={styles.empty}>견과류를 하나 이상 선택하세요</div>
      ) : (
        selectedNuts.map(n => {
          const mult = n.danger ? 1 : servingMultiplier
          const grams = Math.round(n.servingGrams * mult)
          const count = n.servingCount !== null ? Math.round(n.servingCount * mult) : null
          const kcal = Math.round(n.caloriePerServing * mult * procData.calFactor)
          const p = +(n.protein * mult).toFixed(1)
          const f = +(n.fat * mult).toFixed(1)
          const c = +(n.carbs * mult).toFixed(1)
          const fb = +(n.fiber * mult).toFixed(1)

          return (
            <div key={n.key} className={styles.result}>
              <div className={styles.resultHead}>
                <span className={styles.resultEmoji}>{n.emoji}</span>
                <div>
                  <div className={styles.resultName}>{n.name}</div>
                  <div className={styles.resultAllergyTag}>알레르기 그룹: {n.allergyGroup}</div>
                </div>
              </div>

              <div className={styles.amountHero}>
                <div className={styles.amountLead}>하루 적정 섭취량</div>
                <div className={styles.amountValue}>
                  {count !== null ? `약 ${count}알` : `${grams}g`}
                </div>
                <div className={styles.amountSub}>
                  {count !== null && `≈ ${grams}g`} · 약 <strong>{kcal}kcal</strong>
                </div>
              </div>

              <div className={styles.nutriGrid}>
                <div className={styles.nutriBox}>
                  <div className={styles.nutriLabel}>단백질</div>
                  <div className={styles.nutriVal}>{p}g</div>
                </div>
                <div className={styles.nutriBox}>
                  <div className={styles.nutriLabel}>지방</div>
                  <div className={styles.nutriVal}>{f}g</div>
                </div>
                <div className={styles.nutriBox}>
                  <div className={styles.nutriLabel}>탄수화물</div>
                  <div className={styles.nutriVal}>{c}g</div>
                </div>
                <div className={styles.nutriBox}>
                  <div className={styles.nutriLabel}>식이섬유</div>
                  <div className={styles.nutriVal}>{fb}g</div>
                </div>
              </div>

              <div className={styles.badges}>
                <span className={styles.keyBadge}>★ {n.keyNutrient} · {n.keyNutrientAmount}</span>
                {n.benefit.map((b, i) => (
                  <span key={i} className={styles.benefitBadge}>{b}</span>
                ))}
              </div>

              {n.danger && (
                <div className={styles.dangerBox}>
                  🚨 <strong>{n.warning}</strong>
                </div>
              )}
              {!n.danger && n.warning && (
                <div className={styles.warnBox}>
                  ⚠️ {n.warning}
                </div>
              )}
              {proc === 'salted' && (
                <div className={styles.warnBox} style={{ marginTop: 8 }}>
                  🧂 가염 · 28g당 약 150mg 나트륨 추가 — 고혈압·신장 질환 있으면 주의.
                </div>
              )}
            </div>
          )
        })
      )}

      {/* SUMMARY (multi-select only) */}
      {selectedNuts.length >= 2 && (
        <div className={styles.summary}>
          <div className={styles.summaryHead}>📊 합산 — {selectedNuts.length}종 모두 섭취 시</div>
          <div className={styles.summaryKcal}>{Math.round(totals.kcal).toLocaleString()} kcal</div>
          <div className={styles.summaryKcalSub}>총 {Math.round(totals.grams)}g · 나트륨 약 {Math.round(totals.sodium)}mg</div>

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

          {totals.kcal > 300 && (
            <div className={styles.warnBox} style={{ marginTop: 14 }}>
              ⚠️ 합산 칼로리가 300kcal를 넘습니다. 하루 권장 간식 칼로리(총 열량의 10~15%)의 상한선에 가깝습니다. 종류를 줄이거나 절반씩 섭취하는 것을 고려하세요.
            </div>
          )}
        </div>
      )}

      <div className={styles.disclaimer}>
        <strong>의료 면책:</strong> 본 계산기는 일반 영양 정보를 참고용으로 제공합니다. 건강 상태·알레르기·기저 질환(신장·갑상선 등)에 따라 적정 섭취량이 다를 수 있으며, 브라질너트 등 특정 견과류는 과다 섭취 시 위험할 수 있습니다. 구체적인 식이 계획은 의사·영양사와 상담하세요. (참고: 한국영양학회·WHO 지침)
      </div>
    </div>
  )
}
