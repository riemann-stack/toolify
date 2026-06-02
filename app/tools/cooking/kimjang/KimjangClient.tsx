'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import s from './kimjang.module.css'
import {
  INGREDIENTS,
  CONSUMPTION_PROFILES,
  KIMCHI_VARIANTS,
  KIMJANG_SCHEDULE,
  calcCabbages,
  calcIngredients,
  type CalculatedIngredient,
} from './kimjangData'

type Profile = typeof CONSUMPTION_PROFILES[number]['id']

interface PriceUpdate {
  id: string
  price: number
  date: string
  source: 'kamis' | 'fallback'
}

export default function KimjangClient() {
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [profileId, setProfileId] = useState<Profile>('normal')
  const [months, setMonths] = useState(3)
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])
  // 부가 김치 선택은 reduceRatio 만큼 배추 양을 줄임 → 사용자가 토글
  const [reduceMain, setReduceMain] = useState(true)

  // 가격 보정 (사용자가 직접 수정한 가격)
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({})

  // 실시간 가격
  const [livePrices, setLivePrices] = useState<Record<string, PriceUpdate>>({})
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceLoaded, setPriceLoaded] = useState(false)
  const [priceError, setPriceError] = useState(false)

  /* 배추 포기 수 계산 */
  const baseCabbages = useMemo(
    () => calcCabbages({ adults, kids, profileId, months }),
    [adults, kids, profileId, months],
  )

  // 부가 김치 선택 시 메인 배추 양 일부 감소
  const totalReduce = reduceMain
    ? selectedVariants.reduce((acc, vid) => {
        const v = KIMCHI_VARIANTS.find(x => x.id === vid)
        return acc + (v?.reduceRatio ?? 0)
      }, 0)
    : 0
  const adjustedCabbages = Math.max(1, Math.round(baseCabbages * (1 - totalReduce)))

  /* 재료 계산 — 부가 김치는 감산 전(baseCabbages) 기준으로 사이즈 (이중 감산 방지) */
  const items = useMemo(
    () => calcIngredients(adjustedCabbages, selectedVariants, baseCabbages),
    [adjustedCabbages, selectedVariants, baseCabbages],
  )

  /* 가격 오버라이드·실시간 가격 적용 */
  const itemsPriced = useMemo<CalculatedIngredient[]>(() => {
    return items.map(it => {
      const override = priceOverrides[it.ing.id]
      const live = livePrices[it.ing.id]
      const finalPrice = override !== undefined ? override
        : live ? live.price
        : it.ing.pricePerUnit
      return { ...it, totalPriceWon: Math.round(it.priceAmount * finalPrice) }
    })
  }, [items, priceOverrides, livePrices])

  /* 합계 */
  const totalWon = itemsPriced.reduce((acc, it) => acc + it.totalPriceWon, 0)
  const totalByCat = itemsPriced.reduce<Record<string, number>>((acc, it) => {
    acc[it.ing.cat] = (acc[it.ing.cat] ?? 0) + it.totalPriceWon
    return acc
  }, {})

  /* 실시간 가격 조회 */
  const fetchLivePrices = useCallback(async () => {
    setPriceLoading(true)
    setPriceError(false)
    try {
      // KAMIS 매핑된 항목만
      const target = ['baechu', 'mu', 'jjokpa', 'gochugaru', 'maneul', 'saenggang']
      const res = await fetch(`/api/produce-price?items=${target.join(',')}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { ok: boolean; results?: PriceUpdate[] }
      if (data.ok && data.results) {
        const map: Record<string, PriceUpdate> = {}
        data.results.forEach(r => { map[r.id] = r })
        setLivePrices(map)
      }
    } catch {
      setPriceError(true)
    } finally {
      // 성공·실패 모두 '조회 끝' 처리 — 실패해도 평균가로 계산은 되므로 안내만 갱신
      setPriceLoaded(true)
      setPriceLoading(false)
    }
  }, [])

  // 페이지 첫 진입 시 자동 1회 조회 (서버 응답 빠름)
  useEffect(() => {
    void fetchLivePrices()
  }, [fetchLivePrices])

  /* 장보기 리스트 마크다운 복사 */
  const [copied, setCopied] = useState(false)
  const buildShoppingList = useCallback(() => {
    const lines: string[] = [
      `# 🥬 김장 장보기 (${adults}성인+${kids}어린이, ${months}개월)`,
      `_배추 ${adjustedCabbages}포기 기준 · 예상 비용 ${totalWon.toLocaleString()}원_`,
      '',
    ]
    const cats: Array<typeof INGREDIENTS[number]['cat']> = ['주재료', '양념', '젓갈·액젓', '기타']
    for (const cat of cats) {
      const inCat = itemsPriced.filter(it => it.ing.cat === cat)
      if (inCat.length === 0) continue
      lines.push(`## ${cat}`)
      for (const it of inCat) {
        lines.push(`- [ ] ${it.ing.name} **${it.displayAmount}${it.displayUnit}** — ${it.totalPriceWon.toLocaleString()}원`)
      }
      lines.push('')
    }
    return lines.join('\n')
  }, [adults, kids, months, adjustedCabbages, totalWon, itemsPriced])

  const copyShoppingList = async () => {
    try {
      await navigator.clipboard.writeText(buildShoppingList())
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      alert('복사 실패 — 브라우저 권한 확인')
    }
  }

  /* 부가 김치 토글 */
  const toggleVariant = (id: string) => {
    setSelectedVariants(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  /* 가격 직접 수정 */
  const onPriceEdit = (id: string, val: string) => {
    const n = parseFloat(val)
    if (!isFinite(n) || n < 0) {
      setPriceOverrides(prev => { const c = { ...prev }; delete c[id]; return c })
    } else {
      setPriceOverrides(prev => ({ ...prev, [id]: n }))
    }
  }

  const priceSourceInfo = !priceLoaded
    ? '가격 조회 중…'
    : priceError
      ? '※ 시세 조회 실패 — 평균가로 계산 (참고용)'
      : Object.values(livePrices).some(p => p.source === 'kamis')
        ? '✓ KAMIS 실시간 시세 적용 (배추·무 등 농산물 6종)'
        : '※ 평균가로 계산 (KAMIS 미연동, 참고용)'

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/cooking/recipe', label: '레시피 비율 계산기' },
          { href: '/tools/cooking/serving', label: '1인분 분량 계산기' },
          { href: '/tools/cooking/food-storage', label: '식재료 보관 계산기' },
        ]}
      >
        배추·무·고춧가루·마늘·생강·쪽파는 KAMIS 시세, 젓갈·소금 등은 고정 평균가(2025년 11월 기준)입니다. 작황·지역·구매처로 ±30% 차이 가능 — 장보기 직전 시세 확인 권장.
      </Disclaimer>

      {/* ── 메인 히어로 ── */}
      <div className={s.heroCard}>
        <div className={s.heroLabel}>
          {adults}성인 {kids > 0 ? `+ ${kids}어린이 · ` : '·'} {months}개월 분량
        </div>
        <div className={s.heroBigRow}>
          <div className={s.heroBigItem}>
            <div className={s.heroNum}>{adjustedCabbages}</div>
            <div className={s.heroUnit}>포기</div>
            <div className={s.heroSub}>배추 (≈{(adjustedCabbages * 3).toFixed(0)}kg)</div>
          </div>
          <div className={s.heroDivider} />
          <div className={s.heroBigItem}>
            <div className={s.heroNum}>{totalWon >= 10000 ? (totalWon / 10000).toFixed(1) : (totalWon / 1000).toFixed(0)}</div>
            <div className={s.heroUnit}>{totalWon >= 10000 ? '만원' : '천원'}</div>
            <div className={s.heroSub}>예상 비용 ({totalWon.toLocaleString()}원)</div>
          </div>
        </div>
        <div className={s.heroFootRow}>
          <span className={s.priceSource}>{priceSourceInfo}</span>
          <button
            type="button"
            className={s.refreshBtn}
            onClick={fetchLivePrices}
            disabled={priceLoading}
          >
            {priceLoading ? '조회 중…' : '↻ 최신 시세'}
          </button>
        </div>
      </div>

      {/* ── 인원·소비 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>👨‍👩‍👧 가족 구성 · 소비 패턴</div>

        <div className={s.numRow}>
          <div className={s.numField}>
            <label>성인</label>
            <div className={s.numCtrl}>
              <button type="button" aria-label="성인 한 명 줄이기" onClick={() => setAdults(Math.max(0, adults - 1))}>−</button>
              <span>{adults}</span>
              <button type="button" aria-label="성인 한 명 늘리기" onClick={() => setAdults(Math.min(15, adults + 1))}>+</button>
            </div>
          </div>
          <div className={s.numField}>
            <label>어린이</label>
            <div className={s.numCtrl}>
              <button type="button" aria-label="어린이 한 명 줄이기" onClick={() => setKids(Math.max(0, kids - 1))}>−</button>
              <span>{kids}</span>
              <button type="button" aria-label="어린이 한 명 늘리기" onClick={() => setKids(Math.min(10, kids + 1))}>+</button>
            </div>
          </div>
        </div>

        <div className={s.subLabel} style={{ marginTop: 14 }}>소비 패턴</div>
        <div className={s.profileGrid}>
          {CONSUMPTION_PROFILES.map(p => (
            <button
              key={p.id}
              type="button"
              aria-pressed={profileId === p.id}
              className={`${s.profileBtn} ${profileId === p.id ? s.profileActive : ''}`}
              onClick={() => setProfileId(p.id)}
            >
              <div className={s.profileTitle}>{p.label}</div>
              <div className={s.profileDesc}>{p.desc}</div>
              <div className={s.profileMeta}>성인 {p.adultDailyG}g/일</div>
            </button>
          ))}
        </div>

        <div className={s.subLabel} style={{ marginTop: 14 }}>보관 기간</div>
        <div className={s.monthRow}>
          {[1, 2, 3, 4, 6, 12].map(m => (
            <button
              key={m}
              type="button"
              aria-pressed={months === m}
              className={`${s.monthBtn} ${months === m ? s.profileActive : ''}`}
              onClick={() => setMonths(m)}
            >
              {m === 12 ? '1년' : `${m}개월`}
            </button>
          ))}
        </div>
      </div>

      {/* ── 부가 김치 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🥢 추가 김치 종류 (선택)</div>
        <div className={s.variantGrid}>
          {KIMCHI_VARIANTS.map(v => {
            const on = selectedVariants.includes(v.id)
            return (
              <button
                key={v.id}
                type="button"
                aria-pressed={on}
                className={`${s.variantBtn} ${on ? s.variantActive : ''}`}
                onClick={() => toggleVariant(v.id)}
              >
                <span className={s.variantCheck}>{on ? '✓' : ''}</span>
                <div className={s.variantText}>
                  <div className={s.variantName}>{v.name}</div>
                  <div className={s.variantDesc}>{v.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
        {selectedVariants.length > 0 && (
          <label className={s.toggleReduce}>
            <input
              type="checkbox"
              checked={reduceMain}
              onChange={e => setReduceMain(e.target.checked)}
            />
            <span>배추김치 양을 부가 김치만큼 자동 줄이기 ({Math.round(totalReduce * 100)}%)</span>
          </label>
        )}
      </div>

      {/* ── 재료 리스트 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🧂 재료 + 비용 상세</div>

        {(['주재료', '양념', '젓갈·액젓', '기타'] as const).map(cat => {
          const inCat = itemsPriced.filter(it => it.ing.cat === cat)
          if (inCat.length === 0) return null
          const catTotal = totalByCat[cat] ?? 0
          return (
            <div key={cat} className={s.catBlock}>
              <div className={s.catHeader}>
                <span className={s.catName}>{cat}</span>
                <span className={s.catTotal}>{catTotal.toLocaleString()}원</span>
              </div>
              <ul className={s.ingList}>
                {inCat.map(it => {
                  const live = livePrices[it.ing.id]
                  const override = priceOverrides[it.ing.id]
                  const currentPrice = override ?? live?.price ?? it.ing.pricePerUnit
                  return (
                    <li key={it.ing.id} className={s.ingItem}>
                      <div className={s.ingMain}>
                        <span className={s.ingName}>{it.ing.name}</span>
                        <span className={s.ingAmt}>{it.displayAmount}{it.displayUnit}</span>
                      </div>
                      <div className={s.ingPriceRow}>
                        <input
                          type="number"
                          className={s.ingPriceInput}
                          value={currentPrice}
                          onChange={e => onPriceEdit(it.ing.id, e.target.value)}
                          min={0}
                          step={1}
                          aria-label={`${it.ing.name} 단가`}
                        />
                        <span className={s.ingPriceUnit}>원/{it.ing.unit}</span>
                        {live?.source === 'kamis' && (
                          <span className={s.ingLive} title={`KAMIS ${live.date}`}>실시간</span>
                        )}
                      </div>
                      <div className={s.ingTotal}>{it.totalPriceWon.toLocaleString()}원</div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}

        <div className={s.totalRow}>
          <span>총 예상 비용</span>
          <span className={s.totalNum}>{totalWon.toLocaleString()}원</span>
        </div>

        <button type="button" className={s.copyBtn} onClick={copyShoppingList}>
          {copied ? '✓ 복사됨' : '📋 장보기 리스트 복사 (마크다운)'}
        </button>
      </div>

      {/* ── 김장 일정 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📅 김장 D-day 일정</div>
        <div className={s.timeline}>
          {KIMJANG_SCHEDULE.map((step, i) => {
            const positive = step.day >= 0
            return (
              <div key={i} className={`${s.timelineItem} ${positive ? s.timelinePost : s.timelinePre}`}>
                <div className={s.timelineDay}>
                  {step.day === 0 ? 'D' : step.day > 0 ? `D+${step.day}` : `D${step.day}`}
                </div>
                <div className={s.timelineBody}>
                  <div className={s.timelineLabel}>{step.label}</div>
                  <div className={s.timelineDesc}>{step.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 팁 ── */}
      <div className={s.tipCard}>
        <div className={s.cardLabel}>💡 김장 잘하는 팁</div>
        <ul className={s.tipList}>
          <li><strong>배추는 절임 전 3kg, 절임 후 2.5kg</strong> — 1포기로 약 1주 4인 가족 분량</li>
          <li><strong>고춧가루는 햇고추로</strong> — 9~10월 수확한 햇고추가 색·향 최상</li>
          <li><strong>새우젓은 육젓·추젓</strong> — 6월 육젓이 단맛, 가을 추젓은 깔끔. 김장에 둘 다 ok</li>
          <li><strong>찹쌀풀로 발효 도움</strong> — 유산균 먹이 + 양념이 배추에 잘 밴다</li>
          <li><strong>절임 시 소금은 천일염</strong> — 정제염은 쓴맛. 1차 절임 6~8h + 뒤집기</li>
          <li><strong>김장 직전 12시간은 양념 숙성</strong> — 따로 두면 맛이 어우러짐</li>
          <li><strong>김치통은 80% 채움</strong> — 발효 가스로 부풀어 — 가득 채우면 흘러넘침</li>
        </ul>
      </div>
    </div>
  )
}
