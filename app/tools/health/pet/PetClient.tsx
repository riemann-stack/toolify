'use client'
import { useState } from 'react'
import styles from './pet.module.css'

// ─── 타입 ───────────────────────────────────────────────────────────────────

type DogSize = 'tiny' | 'small' | 'medium' | 'large'
type Activity = 'low' | 'normal' | 'high'
type CatEnv   = 'indoor' | 'both' | 'outdoor'
type FoodMode = 'dry' | 'wet' | 'mix'

// ─── 계산 함수 ───────────────────────────────────────────────────────────────

function rer(weight: number): number {
  return 70 * Math.pow(weight, 0.75)
}

function dogHumanAge(yrs: number, mos: number, size: DogSize): number {
  const a = yrs + mos / 12
  const inc = size === 'large' ? 6 : size === 'medium' ? 5 : 4.5
  if (a <= 0) return 0
  if (a <= 1) return Math.round(15 * a)
  if (a <= 2) return Math.round(15 + 9 * (a - 1))
  return Math.round(24 + inc * (a - 2))
}

function catHumanAge(yrs: number, mos: number): number {
  const a = yrs + mos / 12
  if (a <= 0) return 0
  if (a <= 1) return Math.round(15 * a)
  if (a <= 2) return Math.round(15 + 9 * (a - 1))
  return Math.round(24 + 4 * (a - 2))
}

function getDogStage(yrs: number, mos: number, size: DogSize): string {
  const a = yrs + mos / 12
  const seniorAt = size === 'large' ? 5 : 7
  if (a < 1) return '퍼피'
  if (a < 3) return '청년견'
  if (a < seniorAt) return '중년견'
  return '노령견'
}

function getCatStage(yrs: number, mos: number): string {
  const a = yrs + mos / 12
  if (a < 1) return '키튼'
  if (a < 7) return '성묘'
  if (a < 11) return '시니어'
  return '슈퍼시니어'
}

function getDogFactor(stage: string, neutered: boolean, activity: Activity): number {
  if (stage === '퍼피') return 2.5
  if (stage === '노령견') return neutered ? 1.1 : 1.2
  if (activity === 'high') return 1.8
  if (activity === 'low') return neutered ? 1.2 : 1.4
  return neutered ? 1.4 : 1.6
}

function getCatFactor(stage: string, neutered: boolean, env: CatEnv, activity: Activity): number {
  if (stage === '키튼') return 2.5
  if (stage === '시니어' || stage === '슈퍼시니어') return 1.1
  if (env === 'outdoor' || activity === 'high') return 1.6
  if (env === 'both' || !neutered) return 1.4
  return 1.2
}

// ─── 공통 서브컴포넌트 ─────────────────────────────────────────────────────

const DOG_STAGES = ['퍼피', '청년견', '중년견', '노령견']
const CAT_STAGES = ['키튼', '성묘', '시니어', '슈퍼시니어']
const STAGE_COLORS = ['#3EC8FF', '#3EFF9B', '#C8FF3E', '#FF8C3E']

function LifeStageBar({ stages, current }: { stages: string[]; current: string }) {
  const idx = stages.indexOf(current)
  return (
    <div className={styles.stageBar}>
      {stages.map((s, i) => (
        <div key={i} className={styles.stageSegment}
          style={i === idx ? {
            background: STAGE_COLORS[i], color: '#000',
            borderColor: STAGE_COLORS[i], fontWeight: 700,
          } : {}}>
          {s}
        </div>
      ))}
    </div>
  )
}

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

const Disclaimer = () => (
  <div className={styles.disclaimer}>
    ⚠️ 본 계산기는 수의영양학 기반 참고용 도구입니다. 개별 반려동물의 건강 상태와 질병 유무에 따라 실제 필요량은 다를 수 있습니다. 정확한 영양 관리는 수의사와 상담하시기 바랍니다.
  </div>
)

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────

export default function PetClient() {
  const [tab, setTab] = useState<'dog' | 'cat'>('dog')
  return (
    <div className={styles.wrap}>
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab}${tab === 'dog' ? ' ' + styles.tabDogActive : ''}`}
          onClick={() => setTab('dog')}>🐶 강아지</button>
        <button
          className={`${styles.tab}${tab === 'cat' ? ' ' + styles.tabCatActive : ''}`}
          onClick={() => setTab('cat')}>🐱 고양이</button>
      </nav>
      {tab === 'dog' ? <DogTab /> : <CatTab />}
    </div>
  )
}

// ─── 강아지 탭 ───────────────────────────────────────────────────────────────

const DOG_SIZES: { id: DogSize; icon: string; name: string; desc: string }[] = [
  { id: 'tiny',   icon: '🐩', name: '초소형', desc: '5kg 미만' },
  { id: 'small',  icon: '🐕', name: '소형',   desc: '5~10kg'  },
  { id: 'medium', icon: '🐕‍🦺', name: '중형',   desc: '10~25kg' },
  { id: 'large',  icon: '🦮', name: '대형',   desc: '25kg~'   },
]

function DogTab() {
  const [ageYrs,   setAgeYrs]   = useState(3)
  const [ageMos,   setAgeMos]   = useState(0)
  const [weight,   setWeight]   = useState(10)
  const [size,     setSize]     = useState<DogSize>('medium')
  const [neutered, setNeutered] = useState(true)
  const [activity, setActivity] = useState<Activity>('normal')
  const [calDen,   setCalDen]   = useState(350)
  const [copied,   setCopied]   = useState(false)

  const humanAge = dogHumanAge(ageYrs, ageMos, size)
  const stage    = getDogStage(ageYrs, ageMos, size)
  const stageIdx = DOG_STAGES.indexOf(stage)
  const rerVal   = Math.round(rer(weight))
  const factor   = getDogFactor(stage, neutered, activity)
  const der      = Math.round(rerVal * factor)
  const foodG    = calDen > 0 ? Math.round(der / calDen * 100) : 0
  const treatCal = Math.round(der * 0.1)
  const water    = Math.round(weight * 55)

  function handleCopy() {
    navigator.clipboard.writeText(
      `🐶 강아지 계산 결과\n사람 나이: ${humanAge}세 (${stage})\n` +
      `일일 권장 칼로리: ${der}kcal\n사료 권장량: ${foodG}g/일 (${calDen}kcal/100g 기준)\n` +
      `간식 허용: ${treatCal}kcal/일\n권장 수분: ${water}ml/일`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className={`${styles.section} ${styles.dogSection}`}>
      {/* 나이 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>나이</span>
        <div className={styles.ageRow}>
          <select className={styles.ageSelect} value={ageYrs} onChange={e => setAgeYrs(Number(e.target.value))}>
            {Array.from({ length: 21 }, (_, i) => <option key={i} value={i}>{i}년</option>)}
          </select>
          <select className={styles.ageSelect} value={ageMos} onChange={e => setAgeMos(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i}개월</option>)}
          </select>
        </div>
      </div>

      {/* 체중 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>체중</span>
        <div className={styles.weightRow}>
          <input type="number" min={0.5} max={80} step={0.5} className={styles.weightInput}
            value={weight}
            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setWeight(Math.max(0.5, Math.min(80, v))) }} />
          <span className={styles.weightUnit}>kg</span>
        </div>
        <input type="range" min={0.5} max={80} step={0.5} className={styles.slider}
          value={weight} onChange={e => setWeight(parseFloat(e.target.value))} />
        <div className={styles.sliderLabels}>
          <span>0.5</span><span>20</span><span>40</span><span>60</span><span>80kg</span>
        </div>
      </div>

      {/* 품종 크기 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>품종 크기</span>
        <div className={styles.sizeGrid}>
          {DOG_SIZES.map(s => (
            <button key={s.id}
              className={`${styles.sizeBtn}${size === s.id ? ' ' + styles.petBtnActive : ''}`}
              onClick={() => setSize(s.id)}>
              <span className={styles.sizeBtnIcon}>{s.icon}</span>
              <span className={styles.sizeBtnText}>{s.name}</span>
              <span className={styles.sizeBtnDesc}>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 중성화 + 활동량 */}
      <div className={styles.row2}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>중성화</span>
          <div className={styles.btnGroup}>
            {([true, false] as const).map(v => (
              <button key={String(v)}
                className={`${styles.toggleBtn}${neutered === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setNeutered(v)}>{v ? '예' : '아니오'}</button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>활동량</span>
          <div className={styles.btnGroup}>
            {([['low','낮음'],['normal','보통'],['high','높음']] as [Activity, string][]).map(([v, l]) => (
              <button key={v}
                className={`${styles.toggleBtn}${activity === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setActivity(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 결과 */}
      <LifeStageBar stages={DOG_STAGES} current={stage} />

      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroTop}>
            <span className={styles.heroNum}>{humanAge}</span>
            <span className={styles.heroUnit}>세</span>
          </div>
          <div className={styles.heroSub}>사람 나이 환산 (품종 크기 보정)</div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroStage} style={{ color: STAGE_COLORS[stageIdx] }}>{stage}</div>
          <div className={styles.heroFactor}>생활계수 ×{factor}</div>
        </div>
      </div>

      {/* 사료 칼로리 밀도 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>사료 칼로리 밀도 (kcal / 100g)</span>
        <div className={styles.presetRow}>
          {[{n:'로얄캐닌',v:380},{n:'힐스',v:360},{n:'퓨리나',v:350}].map(p => (
            <button key={p.n}
              className={`${styles.presetBtn}${calDen === p.v ? ' ' + styles.presetDogActive : ''}`}
              onClick={() => setCalDen(p.v)}>{p.n} {p.v}</button>
          ))}
          <span style={{ fontSize: '11px', color: 'var(--muted)', alignSelf: 'center' }}>참고용 근사값</span>
        </div>
        <div className={styles.calDenRow}>
          <input type="number" min={100} max={600} className={styles.calDenInput}
            value={calDen} onChange={e => setCalDen(Math.max(100, Number(e.target.value)) || 350)} />
          <span className={styles.calDenUnit}>kcal / 100g</span>
        </div>
      </div>

      <div className={styles.calGrid}>
        <CalCard title="일일 권장 칼로리" num={der} unit="kcal / 일" sub={`RER ${rerVal} × ${factor}`} />
        <CalCard title="사료 권장량" num={foodG} unit="g / 일" sub={`${calDen}kcal/100g 기준`} />
        <CalCard title="간식 허용 칼로리" num={treatCal} unit="kcal / 일" sub="일일 칼로리의 10%" treat />
      </div>

      <div className={styles.waterCard}>
        <span className={styles.waterIcon}>💧</span>
        <div>
          <span className={styles.waterNum}>{water}ml</span>
          <span className={styles.waterLabel}> 권장 수분 섭취량 / 일</span>
        </div>
      </div>

      <button className={`${styles.copyBtn}${copied ? ' ' + styles.copyBtnDone : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 복사'}
      </button>
      <Disclaimer />
    </div>
  )
}

// ─── 고양이 탭 ───────────────────────────────────────────────────────────────

function CatTab() {
  const [ageYrs,    setAgeYrs]    = useState(3)
  const [ageMos,    setAgeMos]    = useState(0)
  const [weight,    setWeight]    = useState(4)
  const [neutered,  setNeutered]  = useState(true)
  const [env,       setEnv]       = useState<CatEnv>('indoor')
  const [activity,  setActivity]  = useState<Activity>('normal')
  const [foodMode,  setFoodMode]  = useState<FoodMode>('dry')
  const [dryDen,    setDryDen]    = useState(350)
  const [wetDen,    setWetDen]    = useState(90)
  const [copied,    setCopied]    = useState(false)

  const humanAge  = catHumanAge(ageYrs, ageMos)
  const stage     = getCatStage(ageYrs, ageMos)
  const stageIdx  = CAT_STAGES.indexOf(stage)
  const rerVal    = Math.round(rer(weight))
  const factor    = getCatFactor(stage, neutered, env, activity)
  const der       = Math.round(rerVal * factor)
  const dryG      = dryDen > 0 ? Math.round(der / dryDen * 100) : 0
  const wetG      = wetDen > 0 ? Math.round(der / wetDen * 100) : 0
  const mixDryG   = dryDen > 0 ? Math.round(der * 0.5 / dryDen * 100) : 0
  const mixWetG   = wetDen > 0 ? Math.round(der * 0.5 / wetDen * 100) : 0
  const treatCal  = Math.round(der * 0.1)

  function handleCopy() {
    const foodTxt = foodMode === 'dry' ? `건식 ${dryG}g` :
      foodMode === 'wet' ? `습식 ${wetG}g` :
      `건식 ${mixDryG}g + 습식 ${mixWetG}g`
    navigator.clipboard.writeText(
      `🐱 고양이 계산 결과\n사람 나이: ${humanAge}세 (${stage})\n` +
      `일일 권장 칼로리: ${der}kcal\n사료 권장량: ${foodTxt}/일\n간식 허용: ${treatCal}kcal/일`
    ).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className={`${styles.section} ${styles.catSection}`}>
      {/* 나이 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>나이</span>
        <div className={styles.ageRow}>
          <select className={styles.ageSelect} value={ageYrs} onChange={e => setAgeYrs(Number(e.target.value))}>
            {Array.from({ length: 26 }, (_, i) => <option key={i} value={i}>{i}년</option>)}
          </select>
          <select className={styles.ageSelect} value={ageMos} onChange={e => setAgeMos(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{i}개월</option>)}
          </select>
        </div>
      </div>

      {/* 체중 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>체중</span>
        <div className={styles.weightRow}>
          <input type="number" min={0.5} max={15} step={0.1} className={styles.weightInput}
            value={weight}
            onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setWeight(Math.max(0.5, Math.min(15, v))) }} />
          <span className={styles.weightUnit}>kg</span>
        </div>
      </div>

      {/* 중성화 + 환경 */}
      <div className={styles.row2}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>중성화</span>
          <div className={styles.btnGroup}>
            {([true, false] as const).map(v => (
              <button key={String(v)}
                className={`${styles.toggleBtn}${neutered === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setNeutered(v)}>{v ? '예' : '아니오'}</button>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>생활 환경</span>
          <div className={styles.btnGroup}>
            {([['indoor','🏠실내'],['both','🏡겸용'],['outdoor','🌳실외']] as [CatEnv, string][]).map(([v, l]) => (
              <button key={v}
                className={`${styles.toggleBtn}${env === v ? ' ' + styles.petBtnActive : ''}`}
                onClick={() => setEnv(v)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 활동량 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>활동량</span>
        <div className={styles.btnGroup}>
          {([['low','낮음'],['normal','보통'],['high','높음']] as [Activity, string][]).map(([v, l]) => (
            <button key={v}
              className={`${styles.toggleBtn}${activity === v ? ' ' + styles.petBtnActive : ''}`}
              onClick={() => setActivity(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      <LifeStageBar stages={CAT_STAGES} current={stage} />

      <div className={styles.heroCard}>
        <div className={styles.heroLeft}>
          <div className={styles.heroTop}>
            <span className={styles.heroNum}>{humanAge}</span>
            <span className={styles.heroUnit}>세</span>
          </div>
          <div className={styles.heroSub}>사람 나이 환산</div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroStage} style={{ color: STAGE_COLORS[stageIdx] }}>{stage}</div>
          <div className={styles.heroFactor}>생활계수 ×{factor}</div>
        </div>
      </div>

      {/* 사료 모드 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>사료 구성</span>
        <div className={styles.foodModeRow}>
          {([['dry','건식만'],['wet','습식만'],['mix','건식+습식']] as [FoodMode, string][]).map(([v, l]) => (
            <button key={v}
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
                {[{n:'로얄캐닌',v:380},{n:'힐스',v:360},{n:'퓨리나',v:350}].map(p => (
                  <button key={p.n}
                    className={`${styles.presetBtn}${dryDen === p.v ? ' ' + styles.presetCatActive : ''}`}
                    onClick={() => setDryDen(p.v)}>{p.n}</button>
                ))}
              </div>
              <div className={styles.calDenRow}>
                <input type="number" min={100} max={600} className={styles.calDenInput}
                  value={dryDen} onChange={e => setDryDen(Math.max(100, Number(e.target.value)) || 350)} />
                <span className={styles.calDenUnit}>kcal/100g</span>
              </div>
            </div>
          )}
          {(foodMode === 'wet' || foodMode === 'mix') && (
            <div>
              <div className={styles.densityLabel}>습식 사료</div>
              <div className={styles.presetRow}>
                {[{n:'로얄캐닌',v:85},{n:'힐스',v:90},{n:'퓨리나',v:95}].map(p => (
                  <button key={p.n}
                    className={`${styles.presetBtn}${wetDen === p.v ? ' ' + styles.presetCatActive : ''}`}
                    onClick={() => setWetDen(p.v)}>{p.n}</button>
                ))}
              </div>
              <div className={styles.calDenRow}>
                <input type="number" min={50} max={200} className={styles.calDenInput}
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
          <CalCard title="일일 권장 칼로리" num={der} unit="kcal / 일" sub={`RER ${rerVal} × ${factor}`} />
          <CalCard title="건식 사료 (50%)" num={mixDryG} unit="g / 일" sub={`${dryDen}kcal/100g`} />
          <CalCard title="습식 사료 (50%)" num={mixWetG} unit="g / 일" sub={`${wetDen}kcal/100g`} />
          <CalCard title="간식 허용 칼로리" num={treatCal} unit="kcal / 일" sub="일일 칼로리의 10%" treat />
        </div>
      ) : (
        <div className={styles.calGrid}>
          <CalCard title="일일 권장 칼로리" num={der} unit="kcal / 일" sub={`RER ${rerVal} × ${factor}`} />
          <CalCard title={foodMode === 'dry' ? '건식 사료량' : '습식 사료량'} num={foodMode === 'dry' ? dryG : wetG} unit="g / 일" sub={`${foodMode === 'dry' ? dryDen : wetDen}kcal/100g`} />
          <CalCard title="간식 허용 칼로리" num={treatCal} unit="kcal / 일" sub="일일 칼로리의 10%" treat />
        </div>
      )}

      <div className={styles.waterTip}>
        💧 <strong style={{ color: 'var(--text)' }}>고양이 수분 섭취 팁:</strong> 고양이는 본능적으로 물을 잘 마시지 않아 만성 탈수와 신장병 위험이 높습니다. 습식 사료(수분 약 70~80%)를 활용하거나, 흐르는 물 분수를 사용하면 수분 섭취를 늘릴 수 있습니다.
      </div>

      <button className={`${styles.copyBtn}${copied ? ' ' + styles.copyBtnDone : ''}`} onClick={handleCopy}>
        {copied ? '✓ 복사 완료' : '📋 결과 복사'}
      </button>
      <Disclaimer />
    </div>
  )
}
