'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  FOODS, GL_CATS, calcGl, glLevel, GL_LEVEL_META, type Food,
} from './glData'
import s from './glycemic-load.module.css'

interface MealItem { food: Food; servings: number }

export default function GlycemicLoadClient() {
  const [foodId, setFoodId] = useState('white-rice')
  const [servings, setServings] = useState(1)
  const [meal, setMeal] = useState<MealItem[]>([])
  const [tableCat, setTableCat] = useState('grain')

  const food = FOODS.find((f) => f.id === foodId) ?? FOODS[0]
  const singleGl = calcGl(food, servings)
  const singleLevel = glLevel(singleGl)

  const mealTotal = useMemo(() => meal.reduce((sum, m) => sum + calcGl(m.food, m.servings), 0), [meal])
  const mealCarb = useMemo(() => meal.reduce((sum, m) => sum + m.food.carb * m.servings, 0), [meal])
  const mealLevel = glLevel(mealTotal)

  const addToMeal = () => {
    if (servings <= 0) return
    setMeal((prev) => {
      const idx = prev.findIndex((m) => m.food.id === food.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { food, servings: next[idx].servings + servings }
        return next
      }
      return [...prev, { food, servings }]
    })
  }
  const removeItem = (id: string) => setMeal((prev) => prev.filter((m) => m.food.id !== id))

  const fmt1 = (n: number) => n.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const fmt0 = (n: number) => Math.round(n).toLocaleString('ko-KR')

  const tableFoods = FOODS.filter((f) => f.cat === tableCat)

  return (
    <div className={s.wrap}>
      {/* 식품·섭취량 선택 */}
      <div className={s.card}>
        <label className={s.fieldLabel} htmlFor="gl-food">식품 선택</label>
        <select id="gl-food" className={s.select} value={foodId} onChange={(e) => setFoodId(e.target.value)}>
          {GL_CATS.map((c) => (
            <optgroup key={c.id} label={c.name}>
              {FOODS.filter((f) => f.cat === c.id).map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.serving})</option>
              ))}
            </optgroup>
          ))}
        </select>

        <div className={s.servRow}>
          <span className={s.servLabel}>섭취량</span>
          <div className={s.stepper}>
            <button type="button" className={s.stepBtn} aria-label="섭취량 줄이기"
              onClick={() => setServings((v) => Math.max(0.5, Math.round((v - 0.5) * 10) / 10))}>−</button>
            <span className={s.servVal} aria-live="polite">{fmt1(servings)}<small>인분</small></span>
            <button type="button" className={s.stepBtn} aria-label="섭취량 늘리기"
              onClick={() => setServings((v) => Math.round((v + 0.5) * 10) / 10)}>+</button>
          </div>
        </div>
        <p className={s.servHint}>{food.name} 1인분 = 탄수화물 {food.carb}g · GI {food.gi}</p>
      </div>

      {/* 단일 식품 GL */}
      <div className={s.resultCard} role="status">
        <p className={s.resultLabel}>{food.name} {fmt1(servings)}인분의 당부하지수(GL)</p>
        <p className={s.hero} style={{ color: GL_LEVEL_META[singleLevel].color }}>{fmt0(singleGl)}</p>
        <p className={s.heroBadge} style={{ color: GL_LEVEL_META[singleLevel].color }}>
          {GL_LEVEL_META[singleLevel].label} · {GL_LEVEL_META[singleLevel].note}
        </p>
        <p className={s.resultSub}>탄수화물 {fmt0(food.carb * servings)}g × GI {food.gi} ÷ 100</p>
        <button type="button" className={s.addBtn} onClick={addToMeal}>＋ 이 끼니에 담기</button>
      </div>

      {/* 한 끼 합산 */}
      {meal.length > 0 && (
        <div className={s.card}>
          <div className={s.mealHead}>
            <p className={s.groupLabel}>한 끼 합산</p>
            <button type="button" className={s.clearBtn} onClick={() => setMeal([])}>비우기</button>
          </div>
          <div className={s.mealList}>
            {meal.map((m) => (
              <div key={m.food.id} className={s.mealRow}>
                <span className={s.mealName}>{m.food.name} <small>×{fmt1(m.servings)}</small></span>
                <span className={s.mealGl}>GL {fmt0(calcGl(m.food, m.servings))}</span>
                <button type="button" className={s.mealDel} aria-label={`${m.food.name} 제거`}
                  onClick={() => removeItem(m.food.id)}>✕</button>
              </div>
            ))}
          </div>
          <div className={s.mealTotal} style={{ borderColor: GL_LEVEL_META[mealLevel].color }}>
            <span className={s.mealTotalLabel}>한 끼 총 GL</span>
            <strong className={s.mealTotalVal} style={{ color: GL_LEVEL_META[mealLevel].color }}>
              {fmt0(mealTotal)} <small>({GL_LEVEL_META[mealLevel].label})</small>
            </strong>
            <span className={s.mealTotalSub}>총 탄수화물 {fmt0(mealCarb)}g</span>
          </div>
        </div>
      )}

      {/* GI/GL 조회표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>식품별 GI·GL 조회표</p>
        <div className={s.catRow}>
          {GL_CATS.map((c) => (
            <button key={c.id} type="button"
              aria-pressed={tableCat === c.id}
              className={`${s.catBtn} ${tableCat === c.id ? s.catBtnActive : ''}`}
              onClick={() => setTableCat(c.id)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className={s.tableScroll}>
          <table className={s.giTable}>
            <thead>
              <tr>
                <th scope="col">식품 (1회분)</th>
                <th scope="col">GI</th>
                <th scope="col">탄수</th>
                <th scope="col">GL</th>
              </tr>
            </thead>
            <tbody>
              {tableFoods.map((f) => {
                const gl = calcGl(f, 1)
                const lv = glLevel(gl)
                return (
                  <tr key={f.id} data-active={f.id === foodId ? 'true' : undefined}>
                    <td>
                      <span className={s.tName}>{f.name}</span>
                      <span className={s.tServ}>{f.serving}</span>
                    </td>
                    <td>{f.gi}</td>
                    <td>{f.carb}g</td>
                    <td>
                      <span className={s.glChip} style={{ color: GL_LEVEL_META[lv].color, borderColor: GL_LEVEL_META[lv].color }}>
                        {fmt0(gl)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className={s.groupNote}>
          GI·탄수화물은 대표 참고값(시드니대 GI DB·국제표·농진청)으로 품종·조리·측정에 따라 달라집니다. 판정 기준: GL 저 ≤10 · 중 11~19 · 고 ≥20.
        </p>
      </div>

      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/hba1c', label: '당화혈색소 변환기' },
          { href: '/tools/health/bmr', label: '기초대사량 계산기' },
          { href: '/tools/cooking/nuts', label: '견과류 섭취량 계산기' },
        ]}
        sources={[
          { label: 'University of Sydney — Glycemic Index', href: 'https://glycemicindex.com' },
          { label: '대한당뇨병학회', href: 'https://www.diabetes.or.kr' },
        ]}
      >
        GI·GL 수치는 대표 참고값이며 개인의 혈당 반응은 조합·조리·체질에 따라 크게 다릅니다. 이 도구는 식품 비교 참고용으로, 당뇨 진단·식이 처방을 대체하지 않습니다.
      </Disclaimer>
    </div>
  )
}
