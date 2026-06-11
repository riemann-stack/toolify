'use client'
import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import styles from './pet.module.css'
import {
  Activity, Species,
  calculateAll, BodyEvaluation, LifeProgress,
  DOG_BREEDS, DOG_SIZE_GROUPS, sizeOfBreed,
} from './petUtils'

// ─── 타입 ───────────────────────────────────────────────────────────────────

type CatEnv   = 'indoor' | 'both' | 'outdoor'
type FoodMode = 'dry' | 'wet' | 'mix'

// ─── 공통 서브컴포넌트 ─────────────────────────────────────────────────────

const DOG_STAGES = ['퍼피', '청년견', '중년견', '노령견']
const CAT_STAGES = ['키튼', '성묘', '시니어', '슈퍼시니어']
const STAGE_COLORS = ['#0891B2', '#059669', '#0EA5E9', '#EA580C']

function CalCard({ title, num, unit, sub, treat = false }: {
  title: string; num: number; unit: string; sub: string; treat?: boolean
}) {
  return (
    <div className={styles.calCard}>
      <div className={styles.calTitle}>{title}</div>
      <div className={`${styles.calNum}${treat ? ' ' + styles.calNumTreat : ''}`}>{num}</div>
      <div className={styles.calUnit}>{unit}</div>
      <div className={styles.calSub}>{sub}</div>
    </div>
  )
}

function BodyConditionCard({ body, weight, species }: { body: BodyEvaluation; weight: number; species: Species }) {
  // 막대 위치 — bcsBar 그라데이션(저체중 0~20 / 적정 25~55 / 과체중 60~75 / 비만 80~100)에 맞춤
  let pct = 40
  if (species === 'dog' && body.range) {
    const { min, max } = body.range
    if (weight < min)              pct = Math.max(6, 6 + ((weight - min * 0.4) / (min * 0.6)) * 14)     // 6~20
    else if (weight <= max)        pct = 28 + ((weight - min) / (max - min)) * 25                       // 28~53
    else if (weight <= max * 1.25) pct = 62 + ((weight - max) / (max * 0.25)) * 12                      // 62~74
    else                           pct = Math.min(98, 82 + ((weight - max * 1.25) / (max * 0.75)) * 16) // 82~98
  } else {
    // 고양이 (3.0~5.5kg 적정)
    if (weight < 3.0)       pct = Math.max(6, 6 + ((weight - 1.5) / 1.5) * 14)   // 6~20
    else if (weight <= 5.5) pct = 28 + ((weight - 3.0) / 2.5) * 25               // 28~53
    else if (weight <= 7.0) pct = 62 + ((weight - 5.5) / 1.5) * 12               // 62~74
    else                    pct = Math.min(98, 82 + ((weight - 7.0) / 3) * 16)   // 82~98
  }
  pct = Math.max(0, Math.min(100, pct))

  return (
    <div className={styles.bcsCard} style={{ borderLeftColor: body.color }}>
      <div className={styles.bcsHeader}>
        <span className={styles.bcsTitle}>체중 평가</span>
        <span className={styles.bcsBadge}
          style={{ background: `${body.color}22`, color: body.color, border: `1px solid ${body.color}66` }}>
          {body.label}
        </span>
      </div>
      <div className={styles.bcsWeight} style={{ color: body.color }}>
        {weight}<span style={{ fontSize: 14, color: 'var(--muted)', marginLeft: 4 }}>kg</span>
      </div>
      {body.range && (
        <div className={styles.bcsRange}>
          {body.range.sizeName} 정상 범위: <strong style={{ color: 'var(--text)', fontFamily: 'Inter, system-ui, sans-serif' }}>{body.range.min}~{body.range.max}kg</strong>
        </div>
      )}
      <div className={styles.bcsBar}>
        <div className={styles.bcsMarker} style={{ left: `${pct}%` }} />
      </div>
      <div className={styles.bcsMessage}>{body.message}</div>
      <div className={styles.lifeNote}>
        ⓘ 본 평가는 품종 크기·체중만 반영한 추정입니다. 정확한 BCS(1~9 또는 1~5)는 수의사가 갈비뼈·허리·복부를 직접 만져 평가합니다.
      </div>
    </div>
  )
}

function LifeProgressCard({ life, color }: { life: LifeProgress; color: string }) {
  return (
    <div className={styles.lifeCard}>
      <div className={styles.lifeHeader}>
        <span className={styles.lifeTitle}>평균 수명 진행률</span>
        <span className={styles.lifePercent} style={{ color }}>
          {Math.round(life.progressPercent)}%
        </span>
      </div>
      <div className={styles.lifeGauge}>
        <div className={styles.lifeFill} style={{ width: `${Math.min(100, life.progressPercent)}%` }} />
      </div>
      <div className={styles.lifeAxis}>
        <span>0세</span>
        <span>{life.avg}세 (평균)</span>
        <span>{life.max}세 (최장수)</span>
      </div>
      <div className={styles.lifeStage}>
        {life.stageLabel} · 평균까지 약 {life.remainingYears}년
      </div>
      <div className={styles.lifeMsg}>{life.stageMessage}</div>
      {life.note && <div className={styles.lifeNote}>ⓘ {life.note}</div>}
      <div className={styles.lifeNote}>
        ⓘ 평균 수명은 통계 평균이며 개체차가 매우 큽니다. 본 진행률은 보호자의 건강 관리 인식 도구이며 &lsquo;수명 예측&rsquo;이 아닙니다.
      </div>
    </div>
  )
}

const PetDisclaimer = () => (
  <Disclaimer
    variant="medical"
    related={[
      { href: '/tools/health/bmi',         label: 'BMI 계산기' },
      { href: '/tools/health/bmr',         label: '기초대사량' },
      { href: '/tools/health/weightloss',  label: '체중감량 계산기' },
    ]}
    sources={[
      { label: '대한수의사회', href: 'https://www.kvma.or.kr' },
      { label: '농림축산식품부', href: 'https://www.mafra.go.kr' },
      { label: 'Merck Veterinary Manual', href: 'https://www.merckvetmanual.com' },
      { label: 'AAHA', href: 'https://www.aaha.org' },
      { label: 'WSAVA', href: 'https://wsava.org' },
    ]}
  >
    ⚠️ 본 계산기는 수의영양학 기반 참고용 도구입니다. 의료 진단·약물 용량·영양제 추천 X. 개별 반려동물의 건강 상태·질병 유무에 따라 실제 필요량은 다를 수 있으니 정확한 영양 관리는 수의사와 상담하세요.
  </Disclaimer>
)

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

export default function PetClient() {
  const [tab, setTab] = useState<'dog' | 'cat'>('dog')
  return (
    <div className={styles.wrap}>
      <PetDisclaimer />
      <nav className={styles.tabs} role="tablist" aria-label="반려동물 종류">
        <button type="button" role="tab" aria-selected={tab === 'dog'}
          className={`${styles.tab}${tab === 'dog' ? ' ' + styles.tabDogActive : ''}`}
          onClick={() => setTab('dog')}>🐶 강아지</button>
        <button type="button" role="tab" aria-selected={tab === 'cat'}
          className={`${styles.tab}${tab === 'cat' ? ' ' + styles.tabCatActive : ''}`}
          onClick={() => setTab('cat')}>🐱 고양이</button>
      </nav>
      {tab === 'dog' ? <DogTab /> : <CatTab />}
    </div>
  )
}

// ─── 강아지 탭 ───────────────────────────────────────────────────────────────

function DogTab() {
  const [ageYrs,    setAgeYrs]    = useState(3)
  const [ageMos,    setAgeMos]    = useState(0)
  const [weightStr, setWeightStr] = useState('10')
  const [breedId,   setBreedId]   = useState('beagle')
  const [neutered,  setNeutered]  = useState(true)
  const [activity,  setActivity]  = useState<Activity>('normal')
  const [calDen,    setCalDen]    = useState(350)
  const [copied,    setCopied]    = useState(false)

  const weight = parseFloat(weightStr) || 0
  const size = sizeOfBreed(breedId)

  // ★ 단일 useMemo로 모든 결과 계산 — 의존성 변경 시 즉시 리렌더
  const result = useMemo(
    () => calculateAll({
      species: 'dog', yrs: ageYrs, mos: ageMos, weight, size,
      isNeutered: neutered, activity, foodKcalPer100g: calDen,
    }),
    [ageYrs, ageMos, weight, size, neutered, activity, calDen],
  )

  const stageIdx = DOG_STAGES.indexOf(result.stage)
  const foodG = calDen > 0 ? Math.round(result.der / calDen * 100) : 0

  function handleCopy() {
    navigator.clipboard.writeText(
      `🐶 강아지 계산 결과\n사람 나이: ${result.humanAge}세 (${result.stage})\n` +
      `일일 권장 칼로리: ${result.der}kcal (RER ${result.rerVal} × ${result.derFactor})\n` +
      `사료 권장량: ${foodG}g/일 (${calDen}kcal/100g 기준)\n` +
      `간식 허용: ${result.treatKcal}kcal/일\n권장 수분: ${result.waterMl}ml/일\n` +
      `체중 평가: ${result.body.label} · 수명 진행률: ${Math.round(result.life.progressPercent)}%`,
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className={`${styles.section} ${styles.dogSection}`}>
      {/* 나이 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>나이</span>
        <div className={styles.ageRow}>
          <select aria-label="나이(년)" className={styles.ageSelect} value={ageYrs} onChange={e => setAgeYrs(Number(e.target.value))}>
            {Array.from({ length: 21 }, (_, i) => <option key={i} value={i}>{i}년</option>)}
          </select>
          <select aria-label="나이(개월)" className={styles.ageSelect} value={ageMos} onChange={e => setAgeMos(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i}개월</option>)}
          </select>
        </div>
      </div>

      {/* 체중 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>체중</span>
        <div className={styles.weightRow}>
          <input type="number" inputMode="decimal" aria-label="체중(kg)" min={0.5} max={80} step={0.5} className={styles.weightInput}
            value={weightStr}
            onChange={e => setWeightStr(e.target.value)}
            onBlur={() => { const v = parseFloat(weightStr); setWeightStr(isNaN(v) ? '' : String(Math.max(0.5, Math.min(80, v)))) }} />
          <span className={styles.weightUnit}>kg</span>
        </div>
      </div>

      {/* 품종 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>품종</span>
        <select aria-label="품종" className={styles.breedSelect} value={breedId} onChange={e => setBreedId(e.target.value)}>
          {DOG_SIZE_GROUPS.map(g => (
            <optgroup key={g.size} label={g.label}>
              {DOG_BREEDS.filter(b => b.size === g.size).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className={styles.breedHint}>선택한 품종의 크기 기준으로 나이·적정 체중·수명을 계산합니다.</div>
      </div>

      {/* 중성화 + 활동량 */}
      <div className={styles.row2}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>중성화</span>
          <div className={styles.btnGroup} role="group" aria-label="중성화 여부">
            {([true, false] as const).map(v => (
              <button key={String(v)} type="button" aria-pressed={neutered === v}
                className={`${styles.toggleBtn}${neutered === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setNeutered(v)}>{v ? '예' : '아니오'}</button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>활동량</span>
          <div className={styles.btnGroup} role="group" aria-label="활동량">
            {([['low', '낮음'], ['normal', '보통'], ['high', '높음']] as [Activity, string][]).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={activity === v}
                className={`${styles.toggleBtn}${activity === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setActivity(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroTop}>
            <span className={styles.heroNum}>{result.humanAge}</span>
            <span className={styles.heroUnit}>세</span>
          </div>
          <div className={styles.heroSub}>사람 나이 환산</div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroStage} style={{ color: STAGE_COLORS[stageIdx] }}>{result.stage}</div>
        </div>
      </div>

      {/* 체중 평가 */}
      <BodyConditionCard body={result.body} weight={weight} species="dog" />

      {/* 수명 진행률 */}
      <LifeProgressCard life={result.life} color="#FFB347" />

      {/* 사료 칼로리 밀도 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>사료 칼로리 밀도 (kcal / 100g)</span>
        <div className={styles.presetRow}>
          {[{ n: '로얄캐닌', v: 380 }, { n: '힐스', v: 360 }, { n: '퓨리나', v: 350 }].map(p => (
            <button key={p.n} type="button" aria-pressed={calDen === p.v}
              className={`${styles.presetBtn}${calDen === p.v ? ' ' + styles.presetDogActive : ''}`}
              onClick={() => setCalDen(p.v)}>{p.n} {p.v}</button>
          ))}
          <span style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'center' }}>참고용 근사값</span>
        </div>
        <div className={styles.calDenRow}>
          <input type="number" inputMode="decimal" aria-label="사료 칼로리 밀도 (kcal/100g)" min={100} max={600} className={styles.calDenInput}
            value={calDen} onChange={e => setCalDen(Math.max(100, Number(e.target.value)) || 350)} />
          <span className={styles.calDenUnit}>kcal / 100g</span>
        </div>
      </div>

      <div className={styles.calGrid}>
        <CalCard title="일일 권장 칼로리" num={result.der} unit="kcal / 일" sub={`RER ${result.rerVal} × ${result.derFactor}`} />
        <CalCard title="사료 권장량" num={foodG} unit="g / 일" sub={`${calDen}kcal/100g 기준`} />
        <CalCard title="간식 허용 칼로리" num={result.treatKcal} unit="kcal / 일" sub="일일 칼로리의 10% · 사료에서 차감" treat />
      </div>

      <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.6 }}>ⓘ 사료 권장량은 간식 미급여 기준입니다. 간식을 주면 그만큼(최대 10%) 사료를 줄여 하루 총 칼로리를 유지하세요.</p>

      <div className={styles.waterCard}>
        <span className={styles.waterIcon}>💧</span>
        <div>
          <span className={styles.waterNum}>{result.waterMl}ml</span>
          <span className={styles.waterLabel}> 권장 수분 섭취량 / 일</span>
        </div>
      </div>

      <button type="button" className={`${styles.copyBtn}${copied ? ' ' + styles.copyBtnDone : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 복사'}
      </button>    </div>
  )
}

// ─── 고양이 탭 ───────────────────────────────────────────────────────────────

function CatTab() {
  const [ageYrs,    setAgeYrs]    = useState(3)
  const [ageMos,    setAgeMos]    = useState(0)
  const [weightStr, setWeightStr] = useState('4')
  const [neutered,  setNeutered]  = useState(true)
  const [env,       setEnv]       = useState<CatEnv>('indoor')
  const [activity,  setActivity]  = useState<Activity>('normal')
  const [foodMode,  setFoodMode]  = useState<FoodMode>('dry')
  const [dryDen,    setDryDen]    = useState(350)
  const [wetDen,    setWetDen]    = useState(90)
  const [copied,    setCopied]    = useState(false)

  const weight = parseFloat(weightStr) || 0

  // ★ 환경(env) → 활동(activity) 보정: 실외/겸용은 활동 한 단계 ↑로 환산
  // 단, 사용자가 명시적으로 활동을 설정한 경우엔 그대로 적용 (env는 보조)
  const effectiveActivity: Activity = useMemo(() => {
    if (env === 'outdoor' && activity !== 'high') return 'high'
    if (env === 'both' && activity === 'low') return 'normal'
    return activity
  }, [env, activity])

  const result = useMemo(
    () => calculateAll({
      species: 'cat', yrs: ageYrs, mos: ageMos, weight, size: 'small',
      isNeutered: neutered, activity: effectiveActivity,
      catOutdoor: env === 'outdoor', foodKcalPer100g: dryDen,
    }),
    [ageYrs, ageMos, weight, neutered, effectiveActivity, env, dryDen],
  )

  const stageIdx = CAT_STAGES.indexOf(result.stage)
  const dryG    = dryDen > 0 ? Math.round(result.der / dryDen * 100) : 0
  const wetG    = wetDen > 0 ? Math.round(result.der / wetDen * 100) : 0
  // 혼합 급여 비율 — 본문 권장과 동일하게 건식 70% : 습식 30%
  const mixDryG = dryDen > 0 ? Math.round(result.der * 0.7 / dryDen * 100) : 0
  const mixWetG = wetDen > 0 ? Math.round(result.der * 0.3 / wetDen * 100) : 0

  function handleCopy() {
    const foodTxt = foodMode === 'dry' ? `건식 ${dryG}g` :
      foodMode === 'wet' ? `습식 ${wetG}g` :
      `건식 ${mixDryG}g + 습식 ${mixWetG}g`
    navigator.clipboard.writeText(
      `🐱 고양이 계산 결과\n사람 나이: ${result.humanAge}세 (${result.stage})\n` +
      `일일 권장 칼로리: ${result.der}kcal (RER ${result.rerVal} × ${result.derFactor})\n` +
      `사료 권장량: ${foodTxt}/일\n간식 허용: ${result.treatKcal}kcal/일\n` +
      `체중 평가: ${result.body.label} · 수명 진행률: ${Math.round(result.life.progressPercent)}%`,
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className={`${styles.section} ${styles.catSection}`}>
      {/* 나이 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>나이</span>
        <div className={styles.ageRow}>
          <select aria-label="나이(년)" className={styles.ageSelect} value={ageYrs} onChange={e => setAgeYrs(Number(e.target.value))}>
            {Array.from({ length: 26 }, (_, i) => <option key={i} value={i}>{i}년</option>)}
          </select>
          <select aria-label="나이(개월)" className={styles.ageSelect} value={ageMos} onChange={e => setAgeMos(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i}개월</option>)}
          </select>
        </div>
      </div>

      {/* 체중 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>체중</span>
        <div className={styles.weightRow}>
          <input type="number" inputMode="decimal" aria-label="체중(kg)" min={0.5} max={15} step={0.1} className={styles.weightInput}
            value={weightStr}
            onChange={e => setWeightStr(e.target.value)}
            onBlur={() => { const v = parseFloat(weightStr); setWeightStr(isNaN(v) ? '' : String(Math.max(0.5, Math.min(15, v)))) }} />
          <span className={styles.weightUnit}>kg</span>
        </div>
      </div>

      {/* 중성화 + 환경 */}
      <div className={styles.row2}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>중성화</span>
          <div className={styles.btnGroup} role="group" aria-label="중성화 여부">
            {([true, false] as const).map(v => (
              <button key={String(v)} type="button" aria-pressed={neutered === v}
                className={`${styles.toggleBtn}${neutered === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setNeutered(v)}>{v ? '예' : '아니오'}</button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>생활 환경</span>
          <div className={styles.btnGroup} role="group" aria-label="생활 환경">
            {([['indoor', '🏠실내'], ['both', '🏡겸용'], ['outdoor', '🌳실외']] as [CatEnv, string][]).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={env === v}
                className={`${styles.toggleBtn}${env === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setEnv(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 활동량 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>활동량</span>
        <div className={styles.btnGroup} role="group" aria-label="활동량">
          {([['low', '낮음'], ['normal', '보통'], ['high', '높음']] as [Activity, string][]).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={activity === v}
              className={`${styles.toggleBtn}${activity === v ? ' ' + styles.petBtnActive : ''}`}
              onClick={() => setActivity(v)}>{l}</button>
          ))}
        </div>
        {effectiveActivity !== activity && (
          <div className={styles.factorBadge} style={{ marginTop: 8 }}>
            ⓘ <b>{env === 'outdoor' ? '실외' : '겸용'}</b> 환경 보정으로 활동 <b>{
              effectiveActivity === 'high' ? '높음' : effectiveActivity === 'normal' ? '보통' : '낮음'
            }</b>으로 적용
          </div>
        )}
      </div>

      {/* 결과 */}
      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroTop}>
            <span className={styles.heroNum}>{result.humanAge}</span>
            <span className={styles.heroUnit}>세</span>
          </div>
          <div className={styles.heroSub}>사람 나이 환산</div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroStage} style={{ color: STAGE_COLORS[stageIdx] }}>{result.stage}</div>
        </div>
      </div>

      {/* 체중 평가 */}
      <BodyConditionCard body={result.body} weight={weight} species="cat" />

      {/* 수명 진행률 */}
      <LifeProgressCard life={result.life} color="#C084FC" />

      {/* 사료 모드 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>사료 구성</span>
        <div className={styles.foodModeRow} role="group" aria-label="사료 구성">
          {([['dry', '건식만'], ['wet', '습식만'], ['mix', '건식+습식']] as [FoodMode, string][]).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={foodMode === v}
              className={`${styles.foodModeBtn}${foodMode === v ? ' ' + styles.petBtnActive : ''}`}
              onClick={() => setFoodMode(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* 칼로리 밀도 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>사료 칼로리 밀도 (kcal / 100g)</span>
        <div className={styles.densityGrid}>
          {(foodMode === 'dry' || foodMode === 'mix') && (
            <div>
              <div className={styles.densityLabel}>건식 사료</div>
              <div className={styles.presetRow}>
                {[{ n: '로얄캐닌', v: 380 }, { n: '힐스', v: 360 }, { n: '퓨리나', v: 350 }].map(p => (
                  <button key={p.n} type="button" aria-pressed={dryDen === p.v}
                    className={`${styles.presetBtn}${dryDen === p.v ? ' ' + styles.presetCatActive : ''}`}
                    onClick={() => setDryDen(p.v)}>{p.n}</button>
                ))}
              </div>
              <div className={styles.calDenRow}>
                <input type="number" inputMode="decimal" aria-label="건식 사료 칼로리 밀도 (kcal/100g)" min={100} max={600} className={styles.calDenInput}
                  value={dryDen} onChange={e => setDryDen(Math.max(100, Number(e.target.value)) || 350)} />
                <span className={styles.calDenUnit}>kcal/100g</span>
              </div>
            </div>
          )}
          {(foodMode === 'wet' || foodMode === 'mix') && (
            <div>
              <div className={styles.densityLabel}>습식 사료</div>
              <div className={styles.presetRow}>
                {[{ n: '로얄캐닌', v: 85 }, { n: '힐스', v: 90 }, { n: '퓨리나', v: 95 }].map(p => (
                  <button key={p.n} type="button" aria-pressed={wetDen === p.v}
                    className={`${styles.presetBtn}${wetDen === p.v ? ' ' + styles.presetCatActive : ''}`}
                    onClick={() => setWetDen(p.v)}>{p.n}</button>
                ))}
              </div>
              <div className={styles.calDenRow}>
                <input type="number" inputMode="decimal" aria-label="습식 사료 칼로리 밀도 (kcal/100g)" min={50} max={200} className={styles.calDenInput}
                  value={wetDen} onChange={e => setWetDen(Math.max(50, Number(e.target.value)) || 90)} />
                <span className={styles.calDenUnit}>kcal/100g</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 칼로리 카드 */}
      {foodMode === 'mix' ? (
        <div className={styles.calGrid4}>
          <CalCard title="일일 권장 칼로리" num={result.der} unit="kcal / 일" sub={`RER ${result.rerVal} × ${result.derFactor}`} />
          <CalCard title="건식 사료 (70%)" num={mixDryG} unit="g / 일" sub={`${dryDen}kcal/100g`} />
          <CalCard title="습식 사료 (30%)" num={mixWetG} unit="g / 일" sub={`${wetDen}kcal/100g`} />
          <CalCard title="간식 허용 칼로리" num={result.treatKcal} unit="kcal / 일" sub="일일 칼로리의 10% · 사료에서 차감" treat />
        </div>
      ) : (
        <div className={styles.calGrid}>
          <CalCard title="일일 권장 칼로리" num={result.der} unit="kcal / 일" sub={`RER ${result.rerVal} × ${result.derFactor}`} />
          <CalCard title={foodMode === 'dry' ? '건식 사료량' : '습식 사료량'} num={foodMode === 'dry' ? dryG : wetG} unit="g / 일" sub={`${foodMode === 'dry' ? dryDen : wetDen}kcal/100g`} />
          <CalCard title="간식 허용 칼로리" num={result.treatKcal} unit="kcal / 일" sub="일일 칼로리의 10% · 사료에서 차감" treat />
        </div>
      )}

      <p style={{ fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.6 }}>ⓘ 사료 권장량은 간식 미급여 기준입니다. 간식을 주면 그만큼(최대 10%) 사료를 줄여 하루 총 칼로리를 유지하세요.</p>

      <div className={styles.waterTip}>
        💧 <strong style={{ color: 'var(--text)' }}>고양이 수분 섭취 팁:</strong> 고양이는 본능적으로 물을 잘 마시지 않아 만성 탈수와 신장병 위험이 높습니다. 습식 사료(수분 약 70~80%)를 활용하거나, 흐르는 물 분수를 사용하면 수분 섭취를 늘릴 수 있습니다.
      </div>

      <button type="button" className={`${styles.copyBtn}${copied ? ' ' + styles.copyBtnDone : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 복사'}
      </button>    </div>
  )
}
