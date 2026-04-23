'use client'

import { useMemo, useState } from 'react'
import s from './fart-risk.module.css'

type FoodKey =
  | 'beans' | 'lentils' | 'chickpeas'
  | 'milk' | 'cheese' | 'yogurt' | 'iceCream'
  | 'cabbage' | 'broccoli' | 'onion' | 'garlic' | 'sweetPotato' | 'potato' | 'asparagus'
  | 'flour' | 'friedFood' | 'processed'
  | 'soda' | 'beer' | 'soju' | 'energyDrink'
  | 'egg' | 'redMeat' | 'protein'
  | 'spicy' | 'sweetener' | 'fruit'

type FoodInfo = { score: number; emoji: string; reason: string; name: string; category: string }

const FOOD_SCORES: Record<FoodKey, FoodInfo> = {
  beans:       { score: 3, emoji: '🫘', reason: '올리고당 함량 높음', name: '콩류', category: 'beans' },
  lentils:     { score: 3, emoji: '🫛', reason: '콩류 특성', name: '렌틸콩', category: 'beans' },
  chickpeas:   { score: 3, emoji: '🟡', reason: '콩류 특성', name: '병아리콩', category: 'beans' },
  milk:        { score: 3, emoji: '🥛', reason: '유당 함량', name: '우유', category: 'dairy' },
  cheese:      { score: 2, emoji: '🧀', reason: '유제품', name: '치즈', category: 'dairy' },
  yogurt:      { score: 2, emoji: '🥛', reason: '유제품 (유익균도 있음)', name: '요거트', category: 'dairy' },
  iceCream:    { score: 2, emoji: '🍦', reason: '유당+지방', name: '아이스크림', category: 'dairy' },
  cabbage:     { score: 2, emoji: '🥬', reason: '황 함유 채소', name: '양배추', category: 'veggie' },
  broccoli:    { score: 2, emoji: '🥦', reason: '황 함유 채소', name: '브로콜리', category: 'veggie' },
  onion:       { score: 2, emoji: '🧅', reason: '프럭탄 함유', name: '양파', category: 'veggie' },
  garlic:      { score: 2, emoji: '🧄', reason: '프럭탄 함유', name: '마늘', category: 'veggie' },
  sweetPotato: { score: 2, emoji: '🍠', reason: '식이섬유+전분', name: '고구마', category: 'veggie' },
  potato:      { score: 1, emoji: '🥔', reason: '전분 함유', name: '감자', category: 'veggie' },
  asparagus:   { score: 2, emoji: '🌿', reason: '아스파라긴산', name: '아스파라거스', category: 'veggie' },
  flour:       { score: 2, emoji: '🍞', reason: '글루텐+발효', name: '밀가루 음식', category: 'flour' },
  friedFood:   { score: 1, emoji: '🍟', reason: '기름 소화 부담', name: '튀긴 음식', category: 'flour' },
  processed:   { score: 1, emoji: '🥫', reason: '첨가물 포함', name: '가공식품', category: 'flour' },
  soda:        { score: 2, emoji: '🥤', reason: '탄산가스 직접 흡입', name: '탄산음료', category: 'drink' },
  beer:        { score: 2, emoji: '🍺', reason: '탄산+발효', name: '맥주', category: 'drink' },
  soju:        { score: 1, emoji: '🍶', reason: '공기 삼킴', name: '소주', category: 'drink' },
  energyDrink: { score: 2, emoji: '⚡', reason: '탄산+카페인', name: '에너지드링크', category: 'drink' },
  egg:         { score: 2, emoji: '🥚', reason: '황 함유 단백질', name: '계란', category: 'protein' },
  redMeat:     { score: 1, emoji: '🥩', reason: '단백질 발효', name: '고기류(적색육)', category: 'protein' },
  protein:     { score: 3, emoji: '💪', reason: '고단백 발효 가스', name: '단백질 보충제', category: 'protein' },
  spicy:       { score: 1, emoji: '🌶️', reason: '장 자극', name: '매운 음식', category: 'etc' },
  sweetener:   { score: 3, emoji: '🍬', reason: '소르비톨/자일리톨', name: '인공감미료', category: 'etc' },
  fruit:       { score: 2, emoji: '🍎', reason: '과당+수분', name: '과일(사과/배/수박)', category: 'etc' },
}

const CATEGORIES: { id: string; label: string; items: FoodKey[] }[] = [
  { id: 'beans',   label: '🫘 콩·곡류',   items: ['beans', 'lentils', 'chickpeas'] },
  { id: 'dairy',   label: '🥛 유제품',    items: ['milk', 'cheese', 'yogurt', 'iceCream'] },
  { id: 'veggie',  label: '🥦 채소류',    items: ['cabbage', 'broccoli', 'onion', 'garlic', 'sweetPotato', 'potato', 'asparagus'] },
  { id: 'flour',   label: '🌾 밀가루·가공', items: ['flour', 'friedFood', 'processed'] },
  { id: 'drink',   label: '🥤 음료',      items: ['soda', 'beer', 'soju', 'energyDrink'] },
  { id: 'protein', label: '🍖 단백질',    items: ['egg', 'redMeat', 'protein'] },
  { id: 'etc',     label: '🍬 기타',      items: ['spicy', 'sweetener', 'fruit'] },
]

type ComboDef = { foods: FoodKey[]; bonus: number; label: string }
const COMBOS: ComboDef[] = [
  { foods: ['beans', 'onion', 'soda'],       bonus: 3, label: '🚨 콩+양파+탄산 콤보 발동!' },
  { foods: ['beer', 'friedFood'],             bonus: 2, label: '🍺 맥주+튀김 조합' },
  { foods: ['milk', 'sweetPotato'],           bonus: 2, label: '🥛 우유+고구마 조합' },
  { foods: ['beans', 'egg', 'broccoli'],      bonus: 3, label: '💣 콩+계란+브로콜리 황 폭탄' },
  { foods: ['protein', 'beans'],              bonus: 2, label: '💪 단백질 더블 콤보' },
]

type CondKey = 'overate' | 'eatFast' | 'drankSoda' | 'lactoseIntol' | 'sensitiveGut' | 'stressed'
const CONDITIONS: { key: CondKey; add: number; factor: number; label: string; short: string }[] = [
  { key: 'overate',      add: 0, factor: 1.5, label: '평소보다 많이 먹었다 (과식)',                short: '과식으로 소화 부담 증가' },
  { key: 'eatFast',      add: 1, factor: 1.0, label: '식사 속도가 빨랐다',                      short: '빠른 식사로 공기 삼킴 증가' },
  { key: 'drankSoda',    add: 1, factor: 1.0, label: '탄산음료와 함께 먹었다',                  short: '탄산 함께 섭취' },
  { key: 'lactoseIntol', add: 2, factor: 1.0, label: '유제품 먹으면 속이 불편한 편이다 (유당불내증 의심)', short: '유제품 민감 (유당불내증 의심)' },
  { key: 'sensitiveGut', add: 2, factor: 1.0, label: '평소 장이 예민한 편이다 (IBS 등)',         short: '장 예민 체질' },
  { key: 'stressed',     add: 1, factor: 1.0, label: '스트레스를 많이 받은 날이다',               short: '스트레스로 장 운동 영향' },
]

const DAIRY: FoodKey[] = ['milk', 'cheese', 'yogurt', 'iceCream']

function levelFor(score: number) {
  if (score <= 3)  return { key: 'calm',    emoji: '😌', name: '평온한 배',      cls: s.levelCalm,   verdict: '오늘은 장이 평화로운 하루예요. 특별히 가스 유발 식품을 많이 먹지 않았거나, 체질적으로 잘 견디는 날입니다. 산책으로 가볍게 마무리해보세요.' }
  if (score <= 7)  return { key: 'slight',  emoji: '😐', name: '살짝 빵빵',       cls: s.levelSlight, verdict: '배가 조금 묵직할 수 있어요. 아직 위험 수준은 아니지만 저녁 식사 뒤 가벼운 스트레칭과 따뜻한 물 한 잔을 추천합니다.' }
  if (score <= 11) return { key: 'warn',    emoji: '😬', name: '경고 단계',       cls: s.levelWarn,   verdict: '오늘의 조합이 다소 위험합니다. 회의·데이트·대중교통 이용 시 조심하세요. 생강차와 함께 천천히 식사 후 휴식을 추천합니다.' }
  return            { key: 'bomb',    emoji: '💨', name: '가스 폭탄 주의',  cls: s.levelBomb,   verdict: '오늘은 폭탄급입니다. 좁은 공간은 피하고 창문을 열어두세요. 무릎 당기기 스트레칭과 따뜻한 차로 가스 배출을 도와주세요.' }
}

export default function FartRiskClient() {
  const [selected, setSelected] = useState<Set<FoodKey>>(new Set())
  const [conds, setConds] = useState<Set<CondKey>>(new Set())
  const [copied, setCopied] = useState(false)

  const toggleFood = (k: FoodKey) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k); else next.add(k)
      return next
    })
  }
  const toggleCond = (k: CondKey) => {
    setConds((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k); else next.add(k)
      return next
    })
  }
  const reset = () => { setSelected(new Set()); setConds(new Set()); setCopied(false) }

  const result = useMemo(() => {
    if (selected.size === 0 && conds.size === 0) return null

    const foods = Array.from(selected)

    // 1. 음식 점수 합산
    let base = foods.reduce((sum, f) => sum + FOOD_SCORES[f].score, 0)

    // 2. 조합 보너스
    const triggeredCombos: ComboDef[] = []
    let comboBonus = 0
    for (const c of COMBOS) {
      if (c.foods.every((f) => selected.has(f as FoodKey))) {
        triggeredCombos.push(c)
        comboBonus += c.bonus
      }
    }
    base += comboBonus

    // 3. 과식 배수 & 4. 조건 add
    let total = base
    const activeConds: typeof CONDITIONS = []
    for (const c of CONDITIONS) {
      if (conds.has(c.key)) {
        activeConds.push(c)
        if (c.factor !== 1.0) total *= c.factor
        total += c.add
      }
    }

    // 5. 유당불내증 + 유제품 → +2
    let lactoseBonus = 0
    if (conds.has('lactoseIntol') && DAIRY.some((d) => selected.has(d))) {
      lactoseBonus = 2
      total += lactoseBonus
    }

    const score = Math.round(total)

    // TOP 3 (선택된 음식 중 점수 높은 순)
    const top3 = [...foods]
      .map((f) => ({ key: f, ...FOOD_SCORES[f] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    // 이유 목록
    const reasons: string[] = []
    const cats = new Set(foods.map((f) => FOOD_SCORES[f].category))
    if (cats.has('beans')) reasons.push('콩류 섭취 (올리고당)')
    if (cats.has('dairy')) reasons.push('유제품 섭취 (유당)')
    if (cats.has('veggie')) reasons.push('황 함유 채소·프럭탄 섭취')
    if (selected.has('soda') || selected.has('beer') || selected.has('energyDrink')) reasons.push('탄산음료 함께 마심')
    if (selected.has('sweetener')) reasons.push('인공감미료 (소르비톨/자일리톨)')
    if (selected.has('protein')) reasons.push('단백질 보충제 발효')
    if (selected.has('egg')) reasons.push('계란의 황 성분')
    for (const c of activeConds) reasons.push(c.short)

    // 완화 팁
    const tips: string[] = []
    if (cats.has('beans')) tips.push('다음엔 콩을 물에 충분히 불렸다가 요리하면 가스가 줄어요.')
    if (cats.has('dairy')) tips.push('유당불내증이라면 락타아제 효소 보충제나 락토프리 제품을 시도해보세요.')
    if (selected.has('soda') || selected.has('beer') || selected.has('energyDrink')) tips.push('탄산 대신 물을 마시면 가스가 줄어요.')
    if (conds.has('overate')) tips.push('식사량을 조금 줄이고 천천히 먹으면 소화가 편해져요.')
    if (selected.has('sweetener')) tips.push('인공감미료 대신 소량의 설탕이나 천연 감미료(스테비아)를 고려해보세요.')
    if (conds.has('stressed')) tips.push('스트레스 관리로 장 운동이 안정됩니다. 심호흡이나 가벼운 명상이 도움돼요.')
    tips.push('식사 후 가벼운 산책 10~15분이 장 운동을 도와요.')

    return {
      score,
      level: levelFor(score),
      top3,
      combos: triggeredCombos,
      reasons,
      tips,
      comboBonus,
      lactoseBonus,
    }
  }, [selected, conds])

  const handleShare = async () => {
    if (!result) return
    const topText = result.top3.map((t, i) => `${i + 1}위 ${t.name}`).join(' ')
    const text = `오늘 내 방귀 유발 가능성 점수: ${result.score}점 💨
단계: ${result.level.emoji} ${result.level.name}
원인 TOP3: ${topText}
youtil.kr/tools/life/fart-risk`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // noop
    }
  }

  return (
    <div className={s.wrap}>
      {/* 입력: 음식 */}
      <div className={s.card}>
        <span className={s.cardLabel}>오늘 먹은 음식 (복수 선택)</span>
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className={s.catGroup}>
            <div className={s.catHead}>{cat.label}</div>
            <div className={s.foodGrid}>
              {cat.items.map((k) => {
                const f = FOOD_SCORES[k]
                const on = selected.has(k)
                return (
                  <button
                    key={k}
                    type="button"
                    className={`${s.foodBtn} ${on ? s.foodActive : ''}`}
                    onClick={() => toggleFood(k)}
                  >
                    <span className={s.foodEmoji}>{f.emoji}</span>
                    <span>{f.name}</span>
                    {on && <span className={s.scoreBadge}>+{f.score}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 입력: 조건 */}
      <div className={s.card}>
        <span className={s.cardLabel}>추가 조건</span>
        <div className={s.condGrid}>
          {CONDITIONS.map((c) => {
            const on = conds.has(c.key)
            return (
              <label key={c.key} className={`${s.condItem} ${on ? s.condActive : ''}`}>
                <input
                  type="checkbox"
                  className={s.condCheck}
                  checked={on}
                  onChange={() => toggleCond(c.key)}
                />
                <span className={s.condLabel}>{c.label}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* 결과 */}
      {!result ? (
        <div className={s.empty}>음식을 선택하거나 조건을 체크하면 점수가 계산됩니다.</div>
      ) : (
        <>
          <div className={`${s.charBadge} ${result.level.cls}`}>
            <div className={s.charEmoji}>{result.level.emoji}</div>
            <div className={s.charName}>{result.level.name}</div>
            <div className={s.charScoreLabel}>가스 유발 가능성 점수</div>
            <div className={s.charScore}>{result.score}<span className={s.charUnit}>점</span></div>
          </div>

          <div className={s.verdictCard}>{result.level.verdict}</div>

          {result.top3.length > 0 && (
            <div className={s.topCard}>
              <div className={s.topHead}>🏆 오늘의 원인 TOP {result.top3.length}</div>
              {result.top3.map((t, i) => (
                <div key={t.key} className={s.topRow}>
                  <div className={`${s.topRank} ${i === 0 ? s.rank1 : i === 1 ? s.rank2 : s.rank3}`}>{i + 1}</div>
                  <span className={s.topEmoji}>{t.emoji}</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className={s.topName}>{t.name}</span>
                    <span className={s.topReason}>{t.reason}</span>
                  </div>
                  <span className={s.topScore}>+{t.score}</span>
                </div>
              ))}
            </div>
          )}

          {result.combos.length > 0 && (
            <div className={s.comboCard}>
              <div className={s.comboHead}>🚨 특별 조합 감지</div>
              {result.combos.map((c, i) => (
                <div key={i} className={s.comboItem}>
                  <span>{c.label}</span>
                  <span className={s.comboBonus}>+{c.bonus}점</span>
                </div>
              ))}
            </div>
          )}

          {result.reasons.length > 0 && (
            <div className={s.reasonCard}>
              <div className={s.reasonHead}>가스 유발이 높아진 이유</div>
              <ul className={s.reasonList}>
                {result.reasons.map((r, i) => <li key={i} className={s.reasonItem}>{r}</li>)}
              </ul>
            </div>
          )}

          <div className={s.tipCard}>
            <div className={s.tipHead}>💡 완화 팁</div>
            <div className={s.tipList}>
              {result.tips.map((t, i) => (
                <div key={i} className={s.tipItem}>
                  <span className={s.tipEmoji}>💡</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={s.actionRow}>
            <button
              type="button"
              className={`${s.shareBtn} ${copied ? s.copied : ''}`}
              onClick={handleShare}
            >
              {copied ? '✅ 복사됨!' : '오늘 나의 가스 점수 공유하기 💨'}
            </button>
            <button type="button" className={s.resetBtn} onClick={reset}>다시 계산하기</button>
          </div>
        </>
      )}

      <p className={s.disclaimer}>
        본 계산기는 재미를 위한 참고용이며 의학적 진단이 아닙니다.
      </p>
    </div>
  )
}
