'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo, useEffect } from 'react'
import s from './blood-alcohol.module.css'
import {
  DECAY_RATES,
  FOOD_STATES,
  DRUG_ALCOHOL_RISKS,
  BAC_THRESHOLDS,
  calcTomorrowMorning,
  calcCumulativeBAC,
  alcoholGrams as calcAlcoholGrams,
  fmtTimeMin,
  fmtBAC,
  pad2 as utilPad2,
  type DrinkingSession,
} from './bacUtils'

type Sex = 'male' | 'female'
type Drink = { id: number; name: string; volume: string; abv: string }
type TabId = 'main' | 'tomorrow' | 'cumulative' | 'guide'

void utilPad2  // 타입 호환 위해 import만

const PRESETS: { name: string; volume: number; abv: number; label: string }[] = [
  { name: '소주',   volume: 50,  abv: 16,   label: '소주 1잔 (50ml, 16%)' },
  { name: '소주 1병', volume: 360, abv: 16,   label: '소주 1병 (360ml, 16%)' },
  { name: '맥주 1캔', volume: 355, abv: 4.5,  label: '맥주 1캔 (355ml, 4.5%)' },
  { name: '맥주 500cc', volume: 500, abv: 4.5,  label: '맥주 500cc (500ml, 4.5%)' },
  { name: '와인 1잔', volume: 150, abv: 13,   label: '와인 1잔 (150ml, 13%)' },
  { name: '막걸리 1잔', volume: 200, abv: 6,   label: '막걸리 1잔 (200ml, 6%)' },
  { name: '양주 1샷', volume: 45,  abv: 40,   label: '양주 1샷 (45ml, 40%)' },
]

function pad2(n: number) { return n < 10 ? `0${n}` : `${n}` }

// HH:MM → minutes from 00:00
function toMin(h: number, m: number) { return h * 60 + m }

// minutes → { h, m, dayOffset }
function fromMin(mins: number): { h: number; m: number; dayOffset: number } {
  const totalMin = Math.round(mins)
  const dayOffset = Math.floor(totalMin / 1440)
  const rest = ((totalMin % 1440) + 1440) % 1440
  return { h: Math.floor(rest / 60), m: rest % 60, dayOffset }
}

function formatTime(mins: number, baseDay = 0): string {
  const { h, m, dayOffset } = fromMin(mins)
  const suffix = dayOffset + baseDay > 0 ? ` (+${dayOffset + baseDay}일)` : ''
  return `${pad2(h)}:${pad2(m)}${suffix}`
}

function getStatus(bac: number): { label: string; cls: string; heroCls: string; numCls: string } {
  if (bac <= 0)       return { label: '✅ 정상',         cls: s.statusSafe,    heroCls: '',          numCls: s.heroNumSafe }
  if (bac < 0.03)     return { label: '⚠️ 소량 검출',    cls: s.statusCaution, heroCls: s.heroWarn,  numCls: '' }
  if (bac < 0.08)     return { label: '🚫 면허정지 수준', cls: s.statusWarn,    heroCls: s.heroWarn,  numCls: s.heroNumWarn }
  if (bac < 0.2)      return { label: '❌ 면허취소 수준', cls: s.statusDanger,  heroCls: s.heroDanger, numCls: s.heroNumDanger }
  return { label: '🚨 가중처벌 수준 (0.2+)', cls: s.statusCrit, heroCls: s.heroDanger, numCls: s.heroNumDanger }
}

export default function BloodAlcoholClient() {
  const [tab, setTab] = useState<TabId>('main')
  const [sex, setSex] = useState<Sex>('male')
  const [weight, setWeight] = useState('70')
  const [decayRateId, setDecayRateId] = useState('normal')
  const [foodStateId, setFoodStateId] = useState<string>('normal')

  const [startH, setStartH] = useState(19)
  const [startM, setStartM] = useState(0)
  const [endH, setEndH] = useState(22)
  const [endM, setEndM] = useState(0)

  const [drinks, setDrinks] = useState<Drink[]>([
    { id: 1, name: '소주', volume: '360', abv: '16' },
  ])
  const [nowMode, setNowMode] = useState<'end' | 'custom'>('end')
  const [nowH, setNowH] = useState(23)
  const [nowM, setNowM] = useState(0)

  /* 실시간 카운트다운 — 매초 갱신 */
  const [realNowMs, setRealNowMs] = useState<number>(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setRealNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const addDrink = () => {
    if (drinks.length >= 5) return
    const nextId = Math.max(0, ...drinks.map(d => d.id)) + 1
    setDrinks([...drinks, { id: nextId, name: '', volume: '', abv: '' }])
  }

  const removeDrink = (id: number) => {
    setDrinks(drinks.filter(d => d.id !== id))
  }

  const updateDrink = (id: number, field: keyof Drink, value: string) => {
    setDrinks(drinks.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const applyPreset = (p: typeof PRESETS[number]) => {
    if (drinks.length === 0) {
      setDrinks([{ id: 1, name: p.name, volume: String(p.volume), abv: String(p.abv) }])
      return
    }
    // 비어있는 마지막 행이 있으면 거기에, 없으면 새로 추가
    const lastEmpty = [...drinks].reverse().find(d => !d.volume && !d.abv)
    if (lastEmpty) {
      updateDrink(lastEmpty.id, 'name', p.name)
      setDrinks(prev => prev.map(d => d.id === lastEmpty.id ? { ...d, name: p.name, volume: String(p.volume), abv: String(p.abv) } : d))
    } else {
      if (drinks.length >= 5) return
      const nextId = Math.max(0, ...drinks.map(d => d.id)) + 1
      setDrinks([...drinks, { id: nextId, name: p.name, volume: String(p.volume), abv: String(p.abv) }])
    }
  }

  // ── 계산 ──
  const weightN = parseFloat(weight) || 0
  const r = sex === 'male' ? 0.68 : 0.55
  // 분해 속도·식사 상태 (정밀 보정) — 모든 탭(메인 포함) 공통 적용
  const decayRate = DECAY_RATES.find(d => d.id === decayRateId)?.rate ?? 0.015
  const foodMultiplier = FOOD_STATES.find(f => f.id === foodStateId)?.multiplier ?? 1.0

  const totalAlcoholG = useMemo(() => {
    return drinks.reduce((sum, d) => {
      const v = parseFloat(d.volume) || 0
      const a = parseFloat(d.abv) || 0
      return sum + (v * a / 100 * 0.7894)
    }, 0)
  }, [drinks])

  const peakBAC = useMemo(() => {
    if (!weightN || !totalAlcoholG) return 0
    const bac = totalAlcoholG / (weightN * r * 10) * foodMultiplier
    return Math.max(0, bac)
  }, [totalAlcoholG, weightN, r, foodMultiplier])

  // 시각 계산 (모두 분 단위로 변환)
  const endMin = toMin(endH, endM)
  // 현재 시각 직접 입력이 종료보다 이른 시각이면 다음날로 해석(예: 종료 22:00, 현재 08:00 → +24h)
  const nowMin = nowMode === 'end'
    ? endMin
    : (toMin(nowH, nowM) < endMin ? toMin(nowH, nowM) + 1440 : toMin(nowH, nowM))
  // 음주 시작 > 종료면 자정을 넘긴 것(예: 22시 시작 → 02시 종료) → 종료는 익일
  const drinkEndDayOffset = endMin < toMin(startH, startM) ? 1 : 0

  // 현재 BAC (음주 종료 후 경과 시간)
  const elapsedFromEndH = Math.max(0, (nowMin - endMin) / 60)
  const currentBAC = Math.max(0, peakBAC - decayRate * elapsedFromEndH)

  // 기준 도달 시각 (음주 종료 시점부터 계산)
  const suspendHoursFromEnd = peakBAC > 0.03 ? (peakBAC - 0.03) / decayRate : 0
  const revokeHoursFromEnd  = peakBAC > 0.08 ? (peakBAC - 0.08) / decayRate : 0
  const zeroHoursFromEnd    = peakBAC > 0    ? peakBAC / decayRate : 0

  const suspendTimeMin = endMin + suspendHoursFromEnd * 60
  const revokeTimeMin  = endMin + revokeHoursFromEnd * 60
  const zeroTimeMin    = endMin + zeroHoursFromEnd * 60

  const status = getStatus(currentBAC)

  // ── 그래프 ──
  const chartW = 560
  const chartH = 220
  const padL = 48, padR = 16, padT = 16, padB = 28
  const plotW = chartW - padL - padR
  const plotH = chartH - padT - padB

  const maxHours = Math.max(zeroHoursFromEnd + 1, 4)
  const maxBAC = Math.max(peakBAC * 1.1, 0.12)

  const xFromHour = (h: number) => padL + (h / maxHours) * plotW
  const yFromBAC  = (b: number) => padT + (1 - b / maxBAC) * plotH

  // BAC 곡선: 0시간(음주 종료)에 peak, 시간당 -decayRate, 0에서 종료
  const linePoints: string[] = []
  const steps = 60
  for (let i = 0; i <= steps; i++) {
    const hr = (i / steps) * maxHours
    const bac = Math.max(0, peakBAC - decayRate * hr)
    linePoints.push(`${xFromHour(hr).toFixed(1)},${yFromBAC(bac).toFixed(1)}`)
  }
  const linePath = `M ${linePoints.join(' L ')}`

  const y003 = yFromBAC(0.03)
  const y008 = yFromBAC(0.08)
  const nowX = xFromHour(Math.min(elapsedFromEndH, maxHours))

  // 표준잔 (알코올 8g)
  const standardDrinks = totalAlcoholG / 8
  const pureAlcoholMl = totalAlcoholG / 0.7894

  // 시각 옵션
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minOptions  = [0, 10, 20, 30, 40, 50]

  // ── 실시간 KST 시각·운전 가능까지 카운트다운 ──
  const KST_OFFSET_MS = 9 * 3600 * 1000
  const kstNowDate = new Date(realNowMs + KST_OFFSET_MS)
  const realHH = kstNowDate.getUTCHours()
  const realMM = kstNowDate.getUTCMinutes()
  const realSS = kstNowDate.getUTCSeconds()
  // 오늘의 음주 종료 시각 (KST) → epoch ms
  const todayEndKst = new Date(realNowMs + KST_OFFSET_MS)
  todayEndKst.setUTCHours(endH, endM, 0, 0)
  let endEpochMs = todayEndKst.getTime() - KST_OFFSET_MS
  // 음주 종료가 미래 (오늘 저녁 마실 예정) — 그대로 사용
  // 음주 종료가 과거 24h 이내 — 그대로 사용 (오늘)
  // 음주 종료가 미래 + 12시간 초과 — 어제 음주라고 가정
  if (endEpochMs - realNowMs > 12 * 3600 * 1000) endEpochMs -= 24 * 3600 * 1000
  const suspendEpochMs = endEpochMs + suspendHoursFromEnd * 3600 * 1000
  const revokeEpochMs  = endEpochMs + revokeHoursFromEnd * 3600 * 1000
  const zeroEpochMs    = endEpochMs + zeroHoursFromEnd * 3600 * 1000
  const remainSuspendMs = Math.max(0, suspendEpochMs - realNowMs)
  const remainRevokeMs  = Math.max(0, revokeEpochMs - realNowMs)
  const remainZeroMs    = Math.max(0, zeroEpochMs - realNowMs)
  const fmtRemain = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`
  }
  const endInFuture = endEpochMs > realNowMs

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/life/alcohol', label: '알코올 도수 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량' },
        ]}
        sources={[
          { label: '도로교통공단', href: 'https://www.koroad.or.kr' },
          { label: '경찰청', href: 'https://www.police.go.kr' },
          { label: '찾기쉬운 생활법령정보(음주운전)', href: 'https://www.easylaw.go.kr' },
          { label: 'NIAAA(표준잔)', href: 'https://www.niaaa.nih.gov' },
          { label: 'WHO 알코올', href: 'https://www.who.int/health-topics/alcohol' },
        ]}
      >
        본 도구는 Widmark 공식 기반 <strong>참고용 추정</strong>이며, 개인 신체·식사·건강 상태에 따라 실제와 ±20~30% 이상 차이날 수 있습니다. <strong>BAC가 낮게 추정되더라도, 그리고 계산값과 관계없이 음주 후에는 운전하지 마세요</strong>(자가용·자전거·전동킥보드 모두). 음주운전은 형사처벌 대상이며 본 결과는 법적 판단 근거가 아닙니다. 대리운전·대중교통을 이용하세요.
      </Disclaimer>

      {/* 4개 탭 */}
      <div className={s.tabs} role="tablist" aria-label="계산 모드">
        {[
          { id: 'main',       label: '🍺 BAC 계산',       cls: s.tabActive },
          { id: 'tomorrow',   label: '🌅 다음날 아침',     cls: s.tabActiveTomorrow },
          { id: 'cumulative', label: '🔢 여러 자리 누적',  cls: s.tabActiveCumul },
          { id: 'guide',      label: '📖 영향·면허 가이드', cls: s.tabActiveGuide },
        ].map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`${s.tabBtn} ${tab === t.id ? t.cls : ''}`}
            onClick={() => setTab(t.id as TabId)}
          >{t.label}</button>
        ))}
      </div>

      {/* ──────── TAB 1: BAC 계산 (메인, 기존 유지) ──────── */}
      {tab === 'main' && <>

      {/* ── 섹션 1: 신체 정보 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}><span className={s.sectionNum}>1</span>신체 정보</span>

        <div style={{ marginBottom: '14px' }}>
          <label className={s.drinkLabel}>성별</label>
          <div className={s.btnGroup} role="group" aria-label="성별">
            <button type="button" aria-pressed={sex === 'male'}
              className={`${s.toggleBtn} ${sex === 'male' ? s.toggleMale : ''}`}
              onClick={() => setSex('male')}
            >남성 (r=0.68)</button>
            <button type="button" aria-pressed={sex === 'female'}
              className={`${s.toggleBtn} ${sex === 'female' ? s.toggleFemale : ''}`}
              onClick={() => setSex('female')}
            >여성 (r=0.55)</button>
          </div>
        </div>

        <label className={s.drinkLabel}>체중</label>
        <div className={s.weightRow}>
          <input
            type="number" inputMode="decimal" min={40} max={150}
            aria-label="체중(kg)"
            className={s.weightInput}
            value={weight} onChange={e => setWeight(e.target.value)}
          />
          <span className={s.weightUnit}>kg</span>
        </div>
        <input
          type="range" min={40} max={150} step={1}
          aria-label="체중 슬라이더(kg)"
          className={s.slider}
          value={weight} onChange={e => setWeight(e.target.value)}
        />
        <div className={s.sliderLabels}><span>40</span><span>95</span><span>150</span></div>
      </div>

      {/* ── 섹션 2: 음주 시각 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}><span className={s.sectionNum}>2</span>음주 시각</span>

        <div className={s.row2} style={{ marginBottom: '14px' }}>
          <div>
            <label className={s.drinkLabel}>음주 시작</label>
            <div className={s.timeRow}>
              <select aria-label="음주 시작 시" className={s.timeSelect} value={startH} onChange={e => setStartH(+e.target.value)}>
                {hourOptions.map(h => <option key={h} value={h}>{pad2(h)}시</option>)}
              </select>
              <span className={s.timeColon}>:</span>
              <select aria-label="음주 시작 분" className={s.timeSelect} value={startM} onChange={e => setStartM(+e.target.value)}>
                {minOptions.map(m => <option key={m} value={m}>{pad2(m)}분</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={s.drinkLabel}>음주 종료</label>
            <div className={s.timeRow}>
              <select aria-label="음주 종료 시" className={s.timeSelect} value={endH} onChange={e => setEndH(+e.target.value)}>
                {hourOptions.map(h => <option key={h} value={h}>{pad2(h)}시</option>)}
              </select>
              <span className={s.timeColon}>:</span>
              <select aria-label="음주 종료 분" className={s.timeSelect} value={endM} onChange={e => setEndM(+e.target.value)}>
                {minOptions.map(m => <option key={m} value={m}>{pad2(m)}분</option>)}
              </select>
            </div>
          </div>
        </div>

        <label className={s.drinkLabel}>현재 시각 (BAC 확인용)</label>
        <div className={s.btnGroup} style={{ marginBottom: '10px' }} role="group" aria-label="현재 시각 기준">
          <button type="button" aria-pressed={nowMode === 'end'}
            className={`${s.toggleBtn} ${nowMode === 'end' ? s.toggleActive : ''}`}
            onClick={() => setNowMode('end')}
          >음주 종료 시점</button>
          <button type="button" aria-pressed={nowMode === 'custom'}
            className={`${s.toggleBtn} ${nowMode === 'custom' ? s.toggleActive : ''}`}
            onClick={() => setNowMode('custom')}
          >직접 입력</button>
        </div>
        {nowMode === 'custom' && (
          <div className={s.timeRow}>
            <select aria-label="현재 시" className={s.timeSelect} value={nowH} onChange={e => setNowH(+e.target.value)}>
              {hourOptions.map(h => <option key={h} value={h}>{pad2(h)}시</option>)}
            </select>
            <span className={s.timeColon}>:</span>
            <select aria-label="현재 분" className={s.timeSelect} value={nowM} onChange={e => setNowM(+e.target.value)}>
              {minOptions.map(m => <option key={m} value={m}>{pad2(m)}분</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── 섹션 3: 음주 항목 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}><span className={s.sectionNum}>3</span>음주 항목 ({drinks.length}/5)</span>

        <div className={s.cardTitle}>빠른 입력 (프리셋)</div>
        <div className={s.presetGrid}>
          {PRESETS.map(p => (
            <button key={p.label} type="button" className={s.presetBtn} onClick={() => applyPreset(p)}>
              {p.name}
              <span>{p.volume}ml · {p.abv}%</span>
            </button>
          ))}
        </div>

        <div className={s.drinkList}>
          {drinks.map(d => (
            <div key={d.id} className={s.drinkRow}>
              <div>
                <label className={s.drinkLabel}>주류</label>
                <input
                  type="text" className={s.drinkInputText}
                  value={d.name} onChange={e => updateDrink(d.id, 'name', e.target.value)}
                  placeholder="예: 소주"
                />
              </div>
              <div>
                <label className={s.drinkLabel}>용량(ml)</label>
                <input
                  type="number" inputMode="decimal" className={s.drinkInput}
                  value={d.volume} onChange={e => updateDrink(d.id, 'volume', e.target.value)}
                  placeholder="360"
                />
              </div>
              <div>
                <label className={s.drinkLabel}>도수(%)</label>
                <input
                  type="number" inputMode="decimal" step="0.1" className={s.drinkInput}
                  value={d.abv} onChange={e => updateDrink(d.id, 'abv', e.target.value)}
                  placeholder="16"
                />
              </div>
              <button type="button" className={s.drinkDelete} onClick={() => removeDrink(d.id)} aria-label="삭제">×</button>
            </div>
          ))}
        </div>

        <button type="button" className={s.addBtn} onClick={addDrink} disabled={drinks.length >= 5}>
          + 주류 추가
        </button>
      </div>

      {/* ── 분해 속도·식사 상태 (정밀 보정) — 모든 탭 공통 적용 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}>분해 속도·식사 상태 (정밀 보정)</span>
        <div className={s.drinkLabel} style={{ marginTop: 6 }}>알코올 분해 속도 (개인차)</div>
        <div className={s.optionRow5} role="group" aria-label="알코올 분해 속도">
          {DECAY_RATES.map(d => (
            <button key={d.id} type="button" aria-pressed={decayRateId === d.id}
              className={`${s.optionBtn} ${decayRateId === d.id ? s.optionActive : ''}`}
              onClick={() => setDecayRateId(d.id)} title={d.desc}>
              {d.label}<br /><span style={{ fontSize: 10, color: 'var(--muted)' }}>{d.rate.toFixed(3)}/h</span>
            </button>
          ))}
        </div>
        <div className={s.drinkLabel} style={{ marginTop: 12 }}>음주 시 식사 상태 (공복 포함)</div>
        <div className={s.optionRow5} role="group" aria-label="음주 시 식사 상태">
          {FOOD_STATES.map(f => (
            <button key={f.id} type="button" aria-pressed={foodStateId === f.id}
              className={`${s.optionBtn} ${foodStateId === f.id ? s.optionActive : ''}`}
              onClick={() => setFoodStateId(f.id)} title={f.desc}>
              {f.label}<br /><span style={{ fontSize: 10, color: 'var(--muted)' }}>×{f.multiplier.toFixed(2)}</span>
            </button>
          ))}
        </div>
        <div className={s.infoBox} style={{ marginTop: 10 }}>
          💡 <strong>ALDH2 결손 (한국인 30~40%)</strong>이면 아세트알데히드 분해가 느려 독성 축적·홍조가 크고, 에탄올 제거도 다소 느릴 수 있습니다.
          술 마시면 얼굴 빨개짐·심박 ↑·구역질 빨리 → 「느림」 또는 「매우 느림」 선택 권장.
          공복 음주는 흡수 25% 빠름 → BAC 더 높고 오래 유지.
        </div>
      </div>

      {/* ── 결과: BAC 히어로 ── */}
      {peakBAC > 0 && (
        <>
          <div className={`${s.hero} ${status.heroCls}`}>
            <div>
              <div className={s.heroLabel}>현재 추정 BAC</div>
              <div>
                <span className={`${s.heroNum} ${status.numCls}`}>{currentBAC.toFixed(3)}</span>
                <span className={s.heroUnit}>g/dL</span>
              </div>
              <div className={s.heroSub}>
                최고 BAC {peakBAC.toFixed(3)} · 음주 종료 후 {elapsedFromEndH.toFixed(1)}시간 경과
              </div>
            </div>
            <div>
              <span className={`${s.statusBadge} ${status.cls}`}>{status.label}</span>
            </div>
          </div>

          {/* ── 기준별 소멸 시각 ── */}
          <div className={s.thresholdList}>
            <div className={`${s.thresholdCard} ${s.thresholdSuspend}`}>
              <div className={s.thresholdLeft}>
                <div className={s.thresholdLabel}>면허정지 기준 이하 (0.03)</div>
                <div className={`${s.thresholdName} ${s.thresholdNameSuspend}`}>🚫 0.03 미만 추정 시점</div>
              </div>
              <div className={s.thresholdRight}>
                {peakBAC <= 0.03 ? (
                  <div className={`${s.thresholdTime} ${s.thresholdMet}`}>이미 해당 없음</div>
                ) : (
                  <>
                    <div className={s.thresholdTime}>{formatTime(suspendTimeMin)}</div>
                    <div className={s.thresholdDelta}>종료 후 +{suspendHoursFromEnd.toFixed(1)}시간</div>
                  </>
                )}
              </div>
            </div>

            <div className={`${s.thresholdCard} ${s.thresholdRevoke}`}>
              <div className={s.thresholdLeft}>
                <div className={s.thresholdLabel}>면허취소 기준 이하 (0.08)</div>
                <div className={`${s.thresholdName} ${s.thresholdNameRevoke}`}>❌ 0.08 미만 추정 시점</div>
              </div>
              <div className={s.thresholdRight}>
                {peakBAC <= 0.08 ? (
                  <div className={`${s.thresholdTime} ${s.thresholdMet}`}>이미 해당 없음</div>
                ) : (
                  <>
                    <div className={s.thresholdTime}>{formatTime(revokeTimeMin)}</div>
                    <div className={s.thresholdDelta}>종료 후 +{revokeHoursFromEnd.toFixed(1)}시간</div>
                  </>
                )}
              </div>
            </div>

            <div className={`${s.thresholdCard} ${s.thresholdZero}`}>
              <div className={s.thresholdLeft}>
                <div className={s.thresholdLabel}>완전 소멸 (0.000)</div>
                <div className={`${s.thresholdName} ${s.thresholdNameZero}`}>✅ 알코올 완전 분해</div>
              </div>
              <div className={s.thresholdRight}>
                <div className={s.thresholdTime}>{formatTime(zeroTimeMin)}</div>
                <div className={s.thresholdDelta}>종료 후 +{zeroHoursFromEnd.toFixed(1)}시간</div>
              </div>
            </div>
          </div>

          {/* ── 실시간 카운트다운 ── */}
          <div className={s.liveCard}>
            <div className={s.liveHeader}>
              <span className={s.liveBadge}>🕐 실시간 카운트다운 (KST)</span>
              <span className={s.liveClock}>{pad2(realHH)}:{pad2(realMM)}:{pad2(realSS)}</span>
            </div>
            {endInFuture ? (
              <p className={s.liveNote}>
                ⏳ 음주 종료 시각이 아직 미래입니다 ({pad2(endH)}:{pad2(endM)}).
                음주 종료 후 다시 확인하세요.
              </p>
            ) : (
              <div className={s.liveGrid}>
                {peakBAC > 0.03 && (
                  <div className={`${s.liveBox} ${remainSuspendMs === 0 ? s.liveBoxDone : s.liveBoxWarn}`}>
                    <div className={s.liveLabel}>🚫 0.03 미만 추정까지</div>
                    <div className={s.liveTime}>
                      {remainSuspendMs === 0 ? '✓ 통과' : fmtRemain(remainSuspendMs)}
                    </div>
                  </div>
                )}
                {peakBAC > 0.08 && (
                  <div className={`${s.liveBox} ${remainRevokeMs === 0 ? s.liveBoxDone : s.liveBoxDanger}`}>
                    <div className={s.liveLabel}>❌ 0.08 미만 추정까지</div>
                    <div className={s.liveTime}>
                      {remainRevokeMs === 0 ? '✓ 통과' : fmtRemain(remainRevokeMs)}
                    </div>
                  </div>
                )}
                <div className={`${s.liveBox} ${remainZeroMs === 0 ? s.liveBoxDone : s.liveBoxSafe}`}>
                  <div className={s.liveLabel}>✅ 완전 분해까지 (0.000)</div>
                  <div className={s.liveTime}>
                    {remainZeroMs === 0 ? '✓ 통과' : fmtRemain(remainZeroMs)}
                  </div>
                </div>
              </div>
            )}
            <p className={s.liveCaveat}>
              ⚠️ 위 카운트다운은 종료 시각 <strong>{pad2(endH)}:{pad2(endM)}</strong> 기준이며,
              ALDH2 결손·수면 부족·식사량 등으로 ±20~30% 오차 가능 — <strong>계산값과 관계없이 음주 후 운전은 금지</strong>입니다.
            </p>
          </div>

          {/* ── 숙취(아세트알데히드) 회복 타임라인 ── */}
          {peakBAC > 0.05 && (
            <div className={s.hangoverCard}>
              <div className={s.cardLabel}>💧 숙취 회복 단계 (BAC 0 ≠ 완전 회복)</div>
              <p className={s.hangoverIntro}>
                알코올이 분해돼 BAC가 0이 돼도 <strong>아세트알데히드(독성 대사물)·탈수·수면 부채</strong>로
                인지·운동 능력은 6~24시간 추가로 영향 받습니다.
              </p>
              <div className={s.hangoverList}>
                <div className={s.hangoverItem}>
                  <span className={s.hangoverPhase}>0~2h</span>
                  <div>
                    <strong>아세트알데히드 피크</strong> — 얼굴 빨개짐·심박 ↑·구역질.
                    물 500ml + 비타민 B군 (헛개·미숫가루 효과 부족, 핵심은 수분)
                  </div>
                </div>
                <div className={s.hangoverItem}>
                  <span className={s.hangoverPhase}>2~6h</span>
                  <div>
                    <strong>탈수 진행</strong> — 알코올의 이뇨 작용으로 평소보다 1.5~2배 수분 손실.
                    이온음료·꿀물·따뜻한 국물 권장
                  </div>
                </div>
                <div className={s.hangoverItem}>
                  <span className={s.hangoverPhase}>6~12h</span>
                  <div>
                    <strong>BAC 0 도달 추정·간 회복 시작</strong> — BAC가 0으로 추정돼도 집중력은 70~80%로 저하된 상태.
                    중요 회의·면접·시험은 피하고, 음주 후 운전은 금지
                  </div>
                </div>
                <div className={s.hangoverItem}>
                  <span className={s.hangoverPhase}>12~24h</span>
                  <div>
                    <strong>수면 질 회복</strong> — 알코올은 REM 수면 차단 → 다음날 피로감 ↑.
                    카페인보다 30분 낮잠이 효과적
                  </div>
                </div>
                <div className={s.hangoverItem}>
                  <span className={s.hangoverPhase}>24~48h</span>
                  <div>
                    <strong>완전 회복</strong> — 간 효소·근육 글리코겐 정상화.
                    이때까지 추가 음주는 간 부담 누적
                  </div>
                </div>
              </div>
              <div className={s.infoBox} style={{ marginTop: 10 }}>
                💊 <strong>「숙취 해소제」 객관적 효능</strong>: 헛개·콘디션·여명 등은 임상 효과 미미 (위약 대비 차이 작음).
                실증된 것은 <strong>수분 + 전해질 + 수면 + 시간</strong>뿐.
              </div>
            </div>
          )}

          {/* ── 그래프 ── */}
          <div className={s.graphBox}>
            <div className={s.cardTitle} style={{ marginBottom: '10px' }}>시간별 BAC 변화</div>
            <svg className={s.graphSvg} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
              {/* 그리드 */}
              {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                <line key={i}
                  x1={padL} x2={chartW - padR}
                  y1={padT + t * plotH} y2={padT + t * plotH}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1"
                />
              ))}
              {/* Y축 레이블 */}
              {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                <text key={i} x={padL - 6} y={padT + (1 - t) * plotH + 3}
                  fill="var(--muted)" fontSize="10" fontFamily="Inter, system-ui, sans-serif" textAnchor="end"
                >
                  {(t * maxBAC).toFixed(2)}
                </text>
              ))}
              {/* X축 레이블 */}
              {Array.from({ length: Math.min(Math.ceil(maxHours) + 1, 9) }, (_, i) => {
                const h = i * Math.ceil(maxHours / 8)
                if (h > maxHours) return null
                return (
                  <text key={i} x={xFromHour(h)} y={chartH - padB + 14}
                    fill="var(--muted)" fontSize="10" fontFamily="Inter, system-ui, sans-serif" textAnchor="middle"
                  >
                    +{h}h
                  </text>
                )
              })}
              {/* 기준선 */}
              <line x1={padL} x2={chartW - padR} y1={y003} y2={y003}
                stroke="#EA580C" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={chartW - padR - 4} y={y003 - 4}
                fill="#EA580C" fontSize="10" fontFamily="Inter, system-ui, sans-serif" textAnchor="end"
              >
                0.03 면허정지
              </text>
              <line x1={padL} x2={chartW - padR} y1={y008} y2={y008}
                stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={chartW - padR - 4} y={y008 - 4}
                fill="#DC2626" fontSize="10" fontFamily="Inter, system-ui, sans-serif" textAnchor="end"
              >
                0.08 면허취소
              </text>
              {/* BAC 곡선 */}
              <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
              {/* 현재 시각 세로선 */}
              {elapsedFromEndH <= maxHours && (
                <>
                  <line x1={nowX} x2={nowX} y1={padT} y2={chartH - padB}
                    stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="2 3" />
                  <circle cx={nowX} cy={yFromBAC(currentBAC)} r="4" fill="var(--accent)" stroke="#000" strokeWidth="1.5" />
                </>
              )}
            </svg>
            <div className={s.graphLegend}>
              <span><span className={s.legendDot} style={{ background: 'var(--accent)' }}></span>BAC 곡선</span>
              <span><span className={s.legendDot} style={{ background: '#EA580C' }}></span>면허정지 0.03</span>
              <span><span className={s.legendDot} style={{ background: '#DC2626' }}></span>면허취소 0.08</span>
              <span><span className={s.legendDot} style={{ background: 'rgba(255,255,255,0.5)' }}></span>현재 시각</span>
            </div>
          </div>

          {/* ── 음주량 요약 ── */}
          <div>
            <div className={s.cardTitle} style={{ marginBottom: '8px', padding: '0 4px' }}>음주량 요약</div>
            <div className={s.summaryGrid}>
              <div className={s.summaryCard}>
                <div className={s.summaryTitle}>총 섭취 알코올</div>
                <div className={s.summaryNum}>{totalAlcoholG.toFixed(1)}</div>
                <div className={s.summaryUnit}>g</div>
              </div>
              <div className={s.summaryCard}>
                <div className={s.summaryTitle}>순수 알코올</div>
                <div className={s.summaryNum}>{pureAlcoholMl.toFixed(0)}</div>
                <div className={s.summaryUnit}>ml</div>
              </div>
              <div className={s.summaryCard}>
                <div className={s.summaryTitle}>표준 음주량<br/>(1잔=8g)</div>
                <div className={s.summaryNum}>{standardDrinks.toFixed(1)}</div>
                <div className={s.summaryUnit}>표준잔</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── 안전 귀가 ── */}
      <div className={s.safeBox}>
        <div className={s.safeTitle}>🚕 안전 귀가 안내</div>
        <div className={s.safeList}>
          <div>• <strong>카카오 T 대리 · 티맵 대리</strong> 앱으로 즉시 호출</div>
          <div>• <strong>전국 대리운전 대표번호</strong> 이용 또는 지역 대리운전</div>
          <div>• <strong>택시·지하철·버스</strong> 등 대중교통 이용</div>
          <div style={{ color: '#0891B2', fontWeight: 600, marginTop: '6px' }}>
            💡 가장 안전한 방법은 <strong style={{ color: '#0891B2' }}>술자리 시작 전에 미리 대리운전을 예약</strong>하는 것입니다.
          </div>
        </div>
      </div>

      </>}

      {/* ──────── TAB 2: 다음날 아침 ──────── */}
      {tab === 'tomorrow' && (
        <TomorrowMorningTab
          peakBAC={peakBAC}
          decayRate={decayRate}
          endH={endH}
          endM={endM}
          drinkEndDayOffset={drinkEndDayOffset}
        />
      )}

      {/* ──────── TAB 3: 여러 자리 누적 ──────── */}
      {tab === 'cumulative' && (
        <CumulativeTab
          weightKg={weightN}
          sex={sex}
          foodMultiplier={foodMultiplier}
          decayRate={decayRate}
        />
      )}

      {/* ──────── TAB 4: 영향·면허 가이드 ──────── */}
      {tab === 'guide' && <GuideTab />}

    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 2 — 다음날 아침 BAC (NEW)
   ════════════════════════════════════════════════════════════ */
function TomorrowMorningTab({ peakBAC, decayRate, endH, endM, drinkEndDayOffset }: {
  peakBAC: number
  decayRate: number
  endH: number
  endM: number
  drinkEndDayOffset: number
}) {
  const [morningH, setMorningH] = useState(8)
  const [morningM, setMorningM] = useState(0)

  const result = useMemo(() => calcTomorrowMorning({
    drinkEndH: endH, drinkEndM: endM, drinkEndDayOffset,
    morningH, morningM,
    peakBAC, decayRate,
  }), [endH, endM, drinkEndDayOffset, morningH, morningM, peakBAC, decayRate])

  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const minOptions = [0, 10, 20, 30, 40, 50]

  if (peakBAC <= 0) {
    return (
      <div className={s.infoBox}>
        💡 먼저 「BAC 계산」 탭에서 음주량과 음주 종료 시각을 입력해주세요.
      </div>
    )
  }

  return (
    <>
      <div className={s.infoBox}>
        💡 <strong>한국 음주운전 단속 가장 흔한 시각: 오전 7~9시</strong>.
        전날 과음 후 다음날 출근길 단속 매우 많음.「잠 자고 일어났으니 깼겠지」는 잘못된 통념.
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>다음날 운전 예정 시각</span>
        <div className={s.timeRow}>
          <select aria-label="다음날 운전 시" className={s.timeSelect} value={morningH} onChange={e => setMorningH(+e.target.value)}>
            {hourOptions.map(h => <option key={h} value={h}>{h < 10 ? '0' + h : h}시</option>)}
          </select>
          <span className={s.timeColon}>:</span>
          <select aria-label="다음날 운전 분" className={s.timeSelect} value={morningM} onChange={e => setMorningM(+e.target.value)}>
            {minOptions.map(m => <option key={m} value={m}>{m < 10 ? '0' + m : m}분</option>)}
          </select>
        </div>
        <div className={s.drinkLabel} style={{ marginTop: 10, color: 'var(--muted)' }}>
          빠른 선택:
        </div>
        <div className={s.btnGroup} style={{ flexWrap: 'wrap' }}>
          {[7, 8, 9, 10, 12].map(h => (
            <button key={h} type="button" aria-pressed={morningH === h && morningM === 0}
              className={`${s.toggleBtn} ${morningH === h && morningM === 0 ? s.toggleActive : ''}`}
              onClick={() => { setMorningH(h); setMorningM(0) }}>
              {h}:00
            </button>
          ))}
        </div>
      </div>

      {/* 히어로 */}
      <div className={s.tomorrowHero}>
        <div className={s.tomorrowHeroLabel}>
          내일 {morningH < 10 ? '0' + morningH : morningH}:{morningM < 10 ? '0' + morningM : morningM} 운전 시 BAC
        </div>
        <div className={s.tomorrowHeroNum}
          style={{ color: result.statusColor }}>
          {fmtBAC(result.morningBAC)}
        </div>
        <div className={s.tomorrowHeroSub}>
          음주 종료 후 {result.hoursElapsed.toFixed(1)}시간 경과
        </div>
        <div className={s.tomorrowStatusBadge}
          style={{ background: `${result.statusColor}1A`, color: result.statusColor, border: `1px solid ${result.statusColor}55` }}>
          {result.statusLabel}
        </div>
      </div>

      {/* 법적 추정(BAC 0) ≠ 보수적 안전 권고 — 분리 안내 */}
      {result.status === 'safe' && result.morningMin < result.recommendedSafeMin && (
        <div className={s.warnBox}>
          ⚠️ <strong>법적 기준(BAC 0 추정)은 통과</strong>하나, ±20~30% 오차를 감안한 <strong>보수적 안전 권고 시각은 {fmtTimeMin(result.recommendedSafeMin)}</strong>(완전 분해 추정 +1시간)입니다. 그 전 운전은 측정 시 양성 위험이 남습니다.
        </div>
      )}

      {/* 타임라인 */}
      <div className={s.card}>
        <span className={s.cardLabel}>📅 안전 운전 타임라인</span>
        <div className={s.timelineList}>
          <div className={s.timelineRow}>
            <span className={s.timelineTime}>{fmtTimeMin(result.endMin)}</span>
            <span className={s.timelineLabel}>🍺 음주 종료 (최고 BAC {fmtBAC(peakBAC)})</span>
          </div>
          {peakBAC > BAC_THRESHOLDS.REVOKE && (
            <div className={`${s.timelineRow} ${s.timelineRowDanger}`}>
              <span className={s.timelineTime}>{fmtTimeMin(result.revokeClearMin)}</span>
              <span className={s.timelineLabel}>❌ 0.08 미만 추정 시점</span>
            </div>
          )}
          {peakBAC > BAC_THRESHOLDS.GENERAL_SUSPEND && (
            <div className={`${s.timelineRow} ${s.timelineRowDanger}`}>
              <span className={s.timelineTime}>{fmtTimeMin(result.suspendClearMin)}</span>
              <span className={s.timelineLabel}>🚫 0.03 미만 추정 시점</span>
            </div>
          )}
          <div className={`${s.timelineRow} ${s.timelineRowSafe}`}>
            <span className={s.timelineTime}>{fmtTimeMin(result.zeroMin)}</span>
            <span className={s.timelineLabel}>✅ 알코올 완전 분해</span>
          </div>
          <div className={`${s.timelineRow} ${s.timelineRowSafe}`}>
            <span className={s.timelineTime}>{fmtTimeMin(result.recommendedSafeMin)}</span>
            <span className={s.timelineLabel}>⭐ 권장 안전 운전 시각 (1시간 여유)</span>
          </div>
          <div className={s.timelineRow}
            style={{ background: result.status === 'safe' ? 'rgba(16,185,129,0.06)' : 'rgba(220,38,38,0.06)',
              borderColor: result.status === 'safe' ? 'rgba(16,185,129,0.30)' : 'rgba(220,38,38,0.30)' }}>
            <span className={s.timelineTime}
              style={{ color: result.status === 'safe' ? '#059669' : '#DC2626' }}>
              {fmtTimeMin(result.morningMin)}
            </span>
            <span className={s.timelineLabel} style={{ fontWeight: 700 }}>
              내일 운전 예정 — BAC {fmtBAC(result.morningBAC)}
            </span>
          </div>
        </div>
      </div>

      {/* 안전 출근 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>🚕 안전 출근 가이드</span>
        <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
          <li><strong style={{ color: 'var(--text)' }}>택시·지하철·버스 이용</strong> — 가장 안전</li>
          <li>재택 근무 또는 휴가 검토</li>
          <li>오후 출근으로 변경 (회사 협의)</li>
          <li>출근 직전까지 BAC가 0.03 미만이라도 측정 시 양성 가능</li>
        </ul>
      </div>

      <div className={s.warnBox}>
        <strong>⚠️ 한국 음주운전 단속 최다 케이스:</strong> 새벽 2~3시까지 음주 → 다음날 8시 운전 시 BAC 0.05~0.08 초과 가능성 큼.
        「술이 깬 것 같다」는 주관적 판단 ≠ 실제 BAC. 본 도구 결과 ±20~30% 오차 가능 — 계산값과 관계없이 음주 후 운전은 금지.
      </div>
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 3 — 여러 자리 누적 음주 (NEW)
   ════════════════════════════════════════════════════════════ */
type CumulSession = {
  id: string
  startH: number
  startM: number
  endH: number
  endM: number
  drinks: { id: string; name: string; volume: string; abv: string }[]
}

// 차수를 입력 순서대로 처리하며 자정을 넘긴 차수는 다음날로 누적 보정 (순수 함수)
function buildDrinkingSessions(sessions: CumulSession[]): DrinkingSession[] {
  let prevStart = -Infinity
  let dayOffset = 0
  return sessions.map(ses => {
    let startMin = ses.startH * 60 + ses.startM + dayOffset * 1440
    if (startMin < prevStart) { dayOffset += 1; startMin += 1440 }  // 이전 차수보다 이른 시작 = 다음날 차수
    let endMin = ses.endH * 60 + ses.endM + dayOffset * 1440
    if (endMin < startMin) endMin += 1440   // 차수 자체가 자정을 넘김
    prevStart = startMin
    const grams = ses.drinks.reduce((s, d) => s + calcAlcoholGrams(parseFloat(d.volume) || 0, parseFloat(d.abv) || 0), 0)
    return { id: ses.id, startMin, endMin, alcoholGrams: grams }
  })
}

function CumulativeTab({ weightKg, sex, foodMultiplier, decayRate }: {
  weightKg: number
  sex: 'male' | 'female'
  foodMultiplier: number
  decayRate: number
}) {
  const [sessions, setSessions] = useState<CumulSession[]>([
    { id: '1', startH: 19, startM: 0, endH: 20, endM: 30,
      drinks: [
        { id: 'd1', name: '소주 1병', volume: '360', abv: '16' },
        { id: 'd2', name: '맥주 500cc', volume: '500', abv: '4.5' },
      ] },
    { id: '2', startH: 22, startM: 0, endH: 23, endM: 30,
      drinks: [{ id: 'd3', name: '맥주 500cc 2잔', volume: '1000', abv: '4.5' }] },
  ])

  const drinkingSessions = useMemo<DrinkingSession[]>(() => buildDrinkingSessions(sessions), [sessions])

  const result = useMemo(() => calcCumulativeBAC({
    sessions: drinkingSessions,
    weightKg, sex, foodMultiplier, decayRate,
  }), [drinkingSessions, weightKg, sex, foodMultiplier, decayRate])

  const standardDrinks = result.totalAlcoholGrams / 8

  const updateSession = (id: string, patch: Partial<CumulSession>) =>
    setSessions(sessions.map(s => s.id === id ? { ...s, ...patch } : s))

  const updateDrink = (sesId: string, drinkId: string, field: 'name' | 'volume' | 'abv', value: string) =>
    setSessions(sessions.map(s =>
      s.id === sesId ? { ...s, drinks: s.drinks.map(d => d.id === drinkId ? { ...d, [field]: value } : d) } : s))

  const addSession = () => {
    if (sessions.length >= 5) return
    const lastEnd = sessions[sessions.length - 1]
    const newStartH = (lastEnd.endH + 1) % 24
    setSessions([...sessions, {
      id: String(Date.now()),
      startH: newStartH, startM: 0,
      endH: (newStartH + 1) % 24, endM: 0,
      drinks: [{ id: 'd' + Date.now(), name: '', volume: '', abv: '' }],
    }])
  }
  const removeSession = (id: string) => setSessions(sessions.filter(s => s.id !== id))
  const addDrink = (sesId: string) => setSessions(sessions.map(s =>
    s.id === sesId ? { ...s, drinks: [...s.drinks, { id: 'd' + Date.now(), name: '', volume: '', abv: '' }] } : s))
  const removeDrink = (sesId: string, drinkId: string) => setSessions(sessions.map(s =>
    s.id === sesId ? { ...s, drinks: s.drinks.filter(d => d.id !== drinkId) } : s))

  if (weightKg <= 0) {
    return (
      <div className={s.infoBox}>
        💡 먼저 「BAC 계산」 탭에서 체중·성별을 설정해주세요.
      </div>
    )
  }

  // 곡선 차트 (간단 SVG)
  const W = 600, H = 200, P = 30
  const minTime = result.curve.length > 0 ? result.curve[0].min : 0
  const maxTime = result.curve.length > 0 ? result.curve[result.curve.length - 1].min : 1440
  const maxBAC = Math.max(result.peakBAC * 1.1, 0.12)
  const xs = (t: number) => P + ((t - minTime) / Math.max(1, maxTime - minTime)) * (W - P * 2)
  const ys = (b: number) => H - P - (b / maxBAC) * (H - P * 1.5)

  return (
    <>
      <div className={s.infoBox}>
        💡 <strong>1차·2차·3차 누적 음주</strong> 시뮬. 자리별 시작·종료 시각과 음주 항목을 입력하면 BAC 곡선·0.03 미만 추정 시각 자동 계산.
      </div>

      {/* 자리 입력 */}
      {sessions.map((ses, idx) => (
        <div key={ses.id} className={s.sessionCard}>
          <div className={s.sessionHeader}>
            <span className={s.sessionTitle}>{idx + 1}차</span>
            {sessions.length > 1 && (
              <button type="button" className={s.sessionDelBtn} onClick={() => removeSession(ses.id)}>×</button>
            )}
          </div>
          <div className={s.sessionTimeRow}>
            <div>
              <div className={s.drinkLabel}>시작</div>
              <div className={s.timeRow}>
                <select className={s.timeSelect} value={ses.startH} onChange={e => updateSession(ses.id, { startH: +e.target.value })}>
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i < 10 ? '0' + i : i}시</option>)}
                </select>
                <span className={s.timeColon}>:</span>
                <select className={s.timeSelect} value={ses.startM} onChange={e => updateSession(ses.id, { startM: +e.target.value })}>
                  {[0, 10, 20, 30, 40, 50].map(m => <option key={m} value={m}>{m < 10 ? '0' + m : m}분</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className={s.drinkLabel}>종료</div>
              <div className={s.timeRow}>
                <select className={s.timeSelect} value={ses.endH} onChange={e => updateSession(ses.id, { endH: +e.target.value })}>
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i < 10 ? '0' + i : i}시</option>)}
                </select>
                <span className={s.timeColon}>:</span>
                <select className={s.timeSelect} value={ses.endM} onChange={e => updateSession(ses.id, { endM: +e.target.value })}>
                  {[0, 10, 20, 30, 40, 50].map(m => <option key={m} value={m}>{m < 10 ? '0' + m : m}분</option>)}
                </select>
              </div>
            </div>
          </div>
          {ses.drinks.map(d => (
            <div key={d.id} className={s.sessionAlcoholRow}>
              <input type="text" className={s.drinkInputText} value={d.name}
                onChange={e => updateDrink(ses.id, d.id, 'name', e.target.value)} placeholder="주류" />
              <input type="number" inputMode="decimal" className={s.drinkInput} value={d.volume}
                onChange={e => updateDrink(ses.id, d.id, 'volume', e.target.value)} placeholder="용량(ml)" />
              <input type="number" inputMode="decimal" step="0.1" className={s.drinkInput} value={d.abv}
                onChange={e => updateDrink(ses.id, d.id, 'abv', e.target.value)} placeholder="도수(%)" />
              <button type="button" className={s.drinkDelete} onClick={() => removeDrink(ses.id, d.id)}>×</button>
            </div>
          ))}
          <button type="button" className={s.addBtn} onClick={() => addDrink(ses.id)}>+ 주류 추가</button>
        </div>
      ))}

      {sessions.length < 5 && (
        <button type="button" className={s.addSessionBtn} onClick={addSession}>+ 자리 추가 ({sessions.length}/5)</button>
      )}

      {/* 결과 */}
      {result.peakBAC > 0 && (
        <>
          <div className={s.tomorrowHero} style={{ borderColor: 'rgba(220,38,38,0.40)', background: 'rgba(220,38,38,0.04)' }}>
            <div className={s.tomorrowHeroLabel}>최고 BAC ({result.totalAlcoholGrams.toFixed(1)}g 알코올 = 표준잔 {standardDrinks.toFixed(1)})</div>
            <div className={s.tomorrowHeroNum} style={{ color: '#DC2626' }}>
              {fmtBAC(result.peakBAC)}
            </div>
            <div className={s.tomorrowHeroSub}>
              피크 시각 {fmtTimeMin(result.peakMin)} · 음주 종료 {fmtTimeMin(result.finalEndMin)}
            </div>
          </div>

          {/* SVG 곡선 */}
          <div className={s.card}>
            <span className={s.cardLabel}>BAC 누적 곡선</span>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 200, display: 'block', background: 'var(--bg3)', borderRadius: 8 }}>
              {[0.03, 0.08].map(t => (
                <g key={t}>
                  <line x1={P} x2={W - P} y1={ys(t)} y2={ys(t)} stroke={t === 0.08 ? '#DC2626' : '#EA580C'} strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x={W - P - 4} y={ys(t) - 4} fill={t === 0.08 ? '#DC2626' : '#EA580C'} fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">{t === 0.08 ? '0.08 취소' : '0.03 정지'}</text>
                </g>
              ))}
              {/* 자리별 영역 */}
              {drinkingSessions.map(ses => (
                <rect key={ses.id} x={xs(ses.startMin)} y={P / 2}
                  width={Math.max(2, xs(ses.endMin) - xs(ses.startMin))}
                  height={H - P * 1.5}
                  fill="rgba(14,165,233,0.04)" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
              ))}
              {/* BAC 곡선 */}
              {result.curve.length > 1 && (
                <path d={result.curve.map((c, i) => `${i === 0 ? 'M' : 'L'} ${xs(c.min)} ${ys(c.bac)}`).join(' ')}
                  fill="none" stroke="var(--accent)" strokeWidth="2" />
              )}
            </svg>
          </div>

          {/* 자리별 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>자리별 음주 합계</span>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.cumTable}>
                <thead>
                  <tr><th>자리</th><th>시간</th><th>음주</th><th>알코올(g)</th></tr>
                </thead>
                <tbody>
                  {sessions.map((ses, idx) => {
                    const grams = ses.drinks.reduce((s, d) => s + calcAlcoholGrams(parseFloat(d.volume) || 0, parseFloat(d.abv) || 0), 0)
                    return (
                      <tr key={ses.id}>
                        <td>{idx + 1}차</td>
                        <td>{utilPad2(ses.startH)}:{utilPad2(ses.startM)}~{utilPad2(ses.endH)}:{utilPad2(ses.endM)}</td>
                        <td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 400 }}>
                          {ses.drinks.map(d => d.name || '?').join(', ')}
                        </td>
                        <td>{grams.toFixed(1)}</td>
                      </tr>
                    )
                  })}
                  <tr className={s.totalRow}>
                    <td colSpan={3}>합계 ({standardDrinks.toFixed(1)} 표준잔)</td>
                    <td>{result.totalAlcoholGrams.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={s.timelineList} style={{ marginTop: 12 }}>
              <div className={`${s.timelineRow} ${s.timelineRowDanger}`}>
                <span className={s.timelineTime}>{fmtTimeMin(result.suspendClearMin)}</span>
                <span className={s.timelineLabel}>0.03 미만 추정 시점</span>
              </div>
              <div className={`${s.timelineRow} ${s.timelineRowSafe}`}>
                <span className={s.timelineTime}>{fmtTimeMin(result.zeroMin)}</span>
                <span className={s.timelineLabel}>완전 소멸</span>
              </div>
            </div>
          </div>

          {result.totalAlcoholGrams > 80 && (
            <div className={s.warnBox}>
              <strong>⚠️ 위험 음주 수준</strong> — 알코올 {result.totalAlcoholGrams.toFixed(0)}g (표준잔 {standardDrinks.toFixed(1)})은
              WHO 위험 음주 (남 60g·여 40g) 초과. 본인뿐 아니라 다른 사람에게도 위험 (사고·폭력·건강).
              한국알코올중독상담센터 <strong>1899-0975</strong>.
            </div>
          )}
        </>
      )}
    </>
  )
}

/* ════════════════════════════════════════════════════════════
   TAB 4 — 영향·면허 가이드 (NEW)
   ════════════════════════════════════════════════════════════ */
function GuideTab() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([])

  const toggleDrug = (id: string) =>
    setSelectedDrugs(selectedDrugs.includes(id)
      ? selectedDrugs.filter(d => d !== id)
      : [...selectedDrugs, id])

  return (
    <>
      {/* BAC 단계별 영향 */}
      <div className={s.card}>
        <span className={s.cardLabel}>📊 BAC 단계별 신체·정신 영향</span>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.cumTable}>
            <thead>
              <tr>
                <th>BAC (g/dL)</th>
                <th>한국 처벌</th>
                <th>신체·정신 영향</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>0.00~0.02</td><td style={{ color: '#059669' }}>정상</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>거의 영향 없음</td></tr>
              <tr><td>0.02~0.03</td><td style={{ color: '#059669' }}>단속 기준 미만</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>약간 어지러움·기분 상승</td></tr>
              <tr><td style={{ color: '#EA580C' }}>0.03~0.05</td><td style={{ color: '#EA580C' }}>일반 정지 ❌</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>판단력 약간 ↓</td></tr>
              <tr><td>0.05~0.08</td><td style={{ color: '#EA580C' }}>정지</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>운동 능력 ↓·반응 속도 ↓</td></tr>
              <tr><td style={{ color: '#DC2626' }}>0.08~0.10</td><td style={{ color: '#DC2626' }}>취소 ❌</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>명확한 인지 장애</td></tr>
              <tr><td>0.10~0.20</td><td style={{ color: '#DC2626' }}>취소</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>균형 잃음·언어 둔화</td></tr>
              <tr><td>0.20~0.30</td><td style={{ color: '#DC2626' }}>취소</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>의식 혼탁·구토</td></tr>
              <tr><td>0.30~0.40</td><td style={{ color: '#FF3E3E' }}>취소</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR', color: '#DC2626', fontWeight: 700 }}>의식 상실 위험 ⚠️</td></tr>
              <tr><td style={{ color: '#FF3E3E' }}>0.40+</td><td style={{ color: '#FF3E3E' }}>응급</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR', color: '#FF3E3E', fontWeight: 700 }}>사망 가능성 🚨</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 면허 종류별 기준 */}
      <div className={s.card}>
        <span className={s.cardLabel}>🚗 운전 면허 종류별 기준</span>
        <div style={{ overflowX: 'auto' }}>
          <table className={s.cumTable}>
            <thead>
              <tr>
                <th>직군</th>
                <th>면허정지</th>
                <th>면허취소</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>일반 면허</td><td>0.03</td><td>0.08</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>자가용</td></tr>
              <tr><td>영업용 (택시·버스·화물)</td><td>0.03</td><td>0.08</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>법적 기준 동일 + 자격정지·해고 등 추가 제재</td></tr>
              <tr><td>자전거</td><td>0.03</td><td>—</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>2021년부터 처벌 (3만원 범칙금)</td></tr>
              <tr><td>전동킥보드</td><td>0.03</td><td>0.08</td><td style={{ textAlign: 'left', fontFamily: 'Noto Sans KR' }}>도로교통법 (10~20만원)</td></tr>
            </tbody>
          </table>
        </div>
        <div className={s.warnBox} style={{ marginTop: 10 }}>
          <strong>⚠️ 자전거·전동킥보드도 음주운전 처벌 대상.</strong>{' '}
          「자전거니까 괜찮아」 잘못된 통념. 2021년 도로교통법 개정 — 도심 자전거·킥보드는 보행자 사고 위험 큼.
        </div>
      </div>

      {/* 약물 + 알코올 위험 */}
      <div className={s.card}>
        <span className={s.cardLabel}>💊 약물 + 알코올 위험 체크</span>
        <div className={s.drinkLabel}>현재 복용 중인 약물 (해당 시 모두 선택)</div>
        <div className={s.drugGrid}>
          {DRUG_ALCOHOL_RISKS.map(d => (
            <button key={d.id} type="button" aria-pressed={selectedDrugs.includes(d.id)}
              className={`${s.drugBtn} ${selectedDrugs.includes(d.id) ? s.drugBtnActive : ''}`}
              onClick={() => toggleDrug(d.id)}>
              {selectedDrugs.includes(d.id) ? '✓ ' : ''}{d.name}
            </button>
          ))}
        </div>

        {selectedDrugs.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DRUG_ALCOHOL_RISKS.filter(d => selectedDrugs.includes(d.id)).map(d => (
              <div key={d.id} className={s.warnBox}
                style={{
                  background: d.risk === 'high' ? 'rgba(220,38,38,0.06)' : 'rgba(234,88,12,0.06)',
                  borderColor: d.risk === 'high' ? 'rgba(220,38,38,0.40)' : 'rgba(234,88,12,0.40)',
                }}>
                <strong style={{ color: d.risk === 'high' ? '#DC2626' : '#EA580C' }}>
                  {d.risk === 'high' ? '🚨' : '⚠️'} {d.name} + 알코올
                </strong>{' '}
                — {d.desc}
              </div>
            ))}
          </div>
        )}

        <div className={s.infoBox} style={{ marginTop: 12 }}>
          ⚠️ 본 정보는 일반 안내. 정확한 약물·알코올 상호작용은 약사·의사 상담 필수.
          한국 식약처 의약품안전사용서비스: <strong>1577-2334</strong>
        </div>
      </div>

      {/* 면책 강화 */}
      <div className={s.disclaimerStrong}>
        <strong>🚨 음주운전은 범죄 — 절대 X</strong>
        <ul>
          <li>음주운전 처벌 (윤창호법): 면허정지·취소 + 1~5년 징역, 500만~2,000만원 벌금</li>
          <li>사망사고 시 무기징역까지</li>
          <li>본 도구 결과 ≠ 면책 근거 (±20~30% 오차)</li>
          <li>「측정기에 안 잡힐 정도」 X — 측정 시 양성이면 단속</li>
          <li>자가용·자전거·전동킥보드 모두 처벌</li>
        </ul>
        <strong>🚕 안전 귀가</strong>
        <ul>
          <li>카카오 T 대리: <strong>1577-1577</strong></li>
          <li>티맵 대리: <strong>1644-3030</strong></li>
          <li>음주운전 신고: <strong>080-911-7700</strong></li>
          <li>응급: <strong>119</strong></li>
          <li>한국알코올중독상담센터: <strong>1899-0975</strong></li>
          <li>정신건강 위기상담: <strong>1577-0199</strong></li>
        </ul>
      </div>
    </>
  )
}
