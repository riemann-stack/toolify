'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import styles from './frying.module.css'

// ── Types & data ──────────────────────────────────────
type ColorTarget = 'light-yellow' | 'golden' | 'near-dark'
type SecondFry = 'recommended' | 'optional' | 'unnecessary'

interface FryingData {
  key: string
  name: string
  emoji: string
  oilTemp: { min: number; max: number }
  time1: { min: number; max: number }
  time2: { min: number; max: number } | null
  secondFry: SecondFry
  targetColor: ColorTarget
  interiorCheck: boolean
  tip: string
  colorGuide: string
  airfryer: { temp: number; timeMinMin: number; timeMinMax: number }
}

const FRYING_DATA: FryingData[] = [
  { key: 'frenchFry',   name: '감자튀김',   emoji: '🍟',
    oilTemp: { min: 160, max: 170 }, time1: { min: 180, max: 240 }, time2: { min: 60, max: 90 },
    secondFry: 'recommended', targetColor: 'golden', interiorCheck: false,
    tip: '1차 160°C에서 속까지 익히고, 2차 180°C에서 30초~1분 겉면 바삭하게. 2차 튀김 후 소금은 즉시 뿌리기.',
    colorGuide: '2차 후 밝은 황금색이 목표. 진갈색은 과튀김.',
    airfryer: { temp: 200, timeMinMin: 15, timeMinMax: 20 } },
  { key: 'shrimp',      name: '새우튀김',   emoji: '🍤',
    oilTemp: { min: 170, max: 180 }, time1: { min: 90, max: 150 }, time2: null,
    secondFry: 'unnecessary', targetColor: 'golden', interiorCheck: false,
    tip: '새우는 익으면 빠르게 수분이 날아가 질겨짐. 황금색 되면 즉시 꺼내기. 오래 튀기지 않는 것이 핵심.',
    colorGuide: '옅은 황금색 도달 즉시 완성. 진갈색은 과튀김.',
    airfryer: { temp: 190, timeMinMin: 8, timeMinMax: 10 } },
  { key: 'porkCutlet',  name: '돈까스',     emoji: '🥩',
    oilTemp: { min: 160, max: 180 }, time1: { min: 240, max: 360 }, time2: { min: 60, max: 120 },
    secondFry: 'optional', targetColor: 'near-dark', interiorCheck: true,
    tip: '중온(160~165°C)으로 먼저 속까지 익힌 후, 마지막 1분 고온(180°C)으로 겉 바삭하게. 두꺼운 고기는 반드시 충분한 시간 확보.',
    colorGuide: '노릇노릇~진갈색 직전이 목표. 내부를 잘라 분홍기 없음 확인 필수.',
    airfryer: { temp: 180, timeMinMin: 12, timeMinMax: 15 } },
  { key: 'chicken',     name: '치킨',       emoji: '🍗',
    oilTemp: { min: 160, max: 175 }, time1: { min: 720, max: 900 }, time2: { min: 120, max: 180 },
    secondFry: 'recommended', targetColor: 'golden', interiorCheck: true,
    tip: '가장 두꺼운 부위 기준으로 시간 설정. 뼈 있는 부위는 시간 추가. 내부 온도 75°C 이상 반드시 확인. 조각마다 크기가 다르면 따로 튀기기.',
    colorGuide: '황금색~진갈색 직전. 내부 육즙이 투명하게 나오면 완성.',
    airfryer: { temp: 180, timeMinMin: 20, timeMinMax: 25 } },
  { key: 'squid',       name: '오징어튀김', emoji: '🦑',
    oilTemp: { min: 175, max: 185 }, time1: { min: 60, max: 120 }, time2: null,
    secondFry: 'unnecessary', targetColor: 'light-yellow', interiorCheck: false,
    tip: '오래 튀기면 질겨지고 수분 손실. 1~2분이면 충분. 반투명에서 불투명으로 바뀌면 완성. 고온에서 빠르게 튀기는 것이 핵심.',
    colorGuide: '옅은 노란색~밝은 황금색. 튀김옷이 하얗게 되면 완성.',
    airfryer: { temp: 190, timeMinMin: 6, timeMinMax: 9 } },
  { key: 'sweetPotato', name: '고구마튀김', emoji: '🍠',
    oilTemp: { min: 160, max: 175 }, time1: { min: 180, max: 300 }, time2: null,
    secondFry: 'optional', targetColor: 'golden', interiorCheck: false,
    tip: '고구마는 당분이 많아 빠르게 탐. 중저온에서 천천히 익히는 것이 핵심. 젓가락이 쑥 들어가면 완성.',
    colorGuide: '황금색이 목표. 당분 때문에 탈 수 있으니 온도 주의.',
    airfryer: { temp: 180, timeMinMin: 15, timeMinMax: 20 } },
  { key: 'dumpling',    name: '만두',       emoji: '🥟',
    oilTemp: { min: 165, max: 180 }, time1: { min: 240, max: 360 }, time2: null,
    secondFry: 'unnecessary', targetColor: 'golden', interiorCheck: true,
    tip: '냉동 만두는 과밀하게 넣으면 기름 온도 급락. 한 번에 5~6개 이내 권장. 터짐 방지를 위해 약간 해동 후 넣는 것도 좋음.',
    colorGuide: '황금갈색이 목표. 피가 기포 형성하면 속이 익는 신호.',
    airfryer: { temp: 180, timeMinMin: 10, timeMinMax: 12 } },
  { key: 'kimMali',     name: '김말이',     emoji: '🌯',
    oilTemp: { min: 170, max: 180 }, time1: { min: 120, max: 180 }, time2: null,
    secondFry: 'unnecessary', targetColor: 'golden', interiorCheck: false,
    tip: '김이 타기 쉬우니 온도 조절 주의. 굴려가며 고르게 튀기기. 고온에서 빠르게 완성.',
    colorGuide: '황금갈색. 김이 검게 타지 않도록 주의.',
    airfryer: { temp: 180, timeMinMin: 7, timeMinMax: 10 } },
  { key: 'eggplant',    name: '가지튀김',   emoji: '🫙',
    oilTemp: { min: 170, max: 180 }, time1: { min: 90, max: 150 }, time2: null,
    secondFry: 'unnecessary', targetColor: 'light-yellow', interiorCheck: false,
    tip: '가지는 기름 흡수가 많음. 과도한 기름 흡수 방지를 위해 고온에서 빠르게. 소금에 절여 수분 제거 후 튀기면 덜 기름짐.',
    colorGuide: '옅은 황금색이면 완성. 부드럽게 익은 상태가 목표.',
    airfryer: { temp: 190, timeMinMin: 6, timeMinMax: 9 } },
  { key: 'fish',        name: '생선튀김',   emoji: '🐟',
    oilTemp: { min: 170, max: 185 }, time1: { min: 180, max: 300 }, time2: null,
    secondFry: 'optional', targetColor: 'golden', interiorCheck: true,
    tip: '생선살이 쉽게 부서지므로 터너로 조심히 다루기. 뒤집을 때 한 번만. 살이 불투명해지면 속이 익은 신호.',
    colorGuide: '황금갈색. 튀김옷 전체가 황금색이면 속도 익은 상태.',
    airfryer: { temp: 185, timeMinMin: 10, timeMinMax: 14 } },
]

type StateK = 'fresh' | 'fridge' | 'frozen'
type ThickK = 'thin' | 'medium' | 'thick'
type BatterK = 'none' | 'thin' | 'medium' | 'thick'
type QtyK = 'small' | 'medium' | 'large'

const STATE_F: Record<StateK, number> = { fresh: 1.0, fridge: 1.15, frozen: 1.4 }
const THICK_F: Record<ThickK, number> = { thin: 0.8, medium: 1.0, thick: 1.3 }
const BATTER_F: Record<BatterK, number> = { none: 0.85, thin: 0.95, medium: 1.0, thick: 1.2 }
const QTY_F: Record<QtyK, number> = { small: 0.95, medium: 1.0, large: 1.25 }

// ── Utils ──────────────────────────────────────
function fmtSec(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.round(sec % 60)
  if (m === 0) return `${s}초`
  if (s === 0) return `${m}분`
  return `${m}분 ${s}초`
}

function fmtTimerSec(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function tempFactor(actual: number, baseMid: number): number {
  const f = 1 - (actual - baseMid) * 0.015
  return Math.max(0.5, Math.min(2.0, f))
}

function colorMarkerPos(t: ColorTarget): number {
  // 0~100%
  if (t === 'light-yellow') return 28
  if (t === 'golden')       return 55
  return 82
}

function colorLabel(t: ColorTarget): string {
  if (t === 'light-yellow') return '옅은 노란색'
  if (t === 'golden')       return '황금색'
  return '진갈색 직전'
}

function secondFryLabel(s: SecondFry): string {
  if (s === 'recommended') return '필수·권장'
  if (s === 'optional')    return '선택'
  return '불필요'
}

// ── Component ──────────────────────────────────────
export default function FryingClient() {
  const [selected, setSelected] = useState<string[]>(['porkCutlet'])
  const [state, setState] = useState<StateK>('fresh')
  const [thick, setThick] = useState<ThickK>('medium')
  const [batter, setBatter] = useState<BatterK>('medium')
  const [oilTemp, setOilTemp] = useState<number>(180)
  const [customTemp, setCustomTemp] = useState('')
  const [qty, setQty] = useState<QtyK>('medium')
  const [showAir, setShowAir] = useState(true)
  const [showTimer, setShowTimer] = useState(true)
  const [timerSec, setTimerSec] = useState<number>(0)
  const [timerTotal, setTimerTotal] = useState<number>(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerDone, setTimerDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const toggleIng = (k: string) => {
    setSelected(prev => prev.includes(k)
      ? prev.filter(x => x !== k)
      : [...prev, k])
  }

  const selectedData = useMemo(
    () => FRYING_DATA.filter(d => selected.includes(d.key)),
    [selected]
  )

  // Calculate adjusted times per ingredient
  const adjustedFactor = STATE_F[state] * THICK_F[thick] * BATTER_F[batter] * QTY_F[qty]

  // Recommended oil temp: from first selected (or union range)
  const recTemp = useMemo(() => {
    if (!selectedData.length) return null
    const min = Math.max(...selectedData.map(d => d.oilTemp.min))
    const max = Math.min(...selectedData.map(d => d.oilTemp.max))
    return { min, max }
  }, [selectedData])

  const tempOutOfRange = recTemp && (oilTemp < recTemp.min - 5 || oilTemp > recTemp.max + 5)

  // Timer
  useEffect(() => {
    if (!timerRunning) return
    intervalRef.current = setInterval(() => {
      setTimerSec(s => {
        if (s <= 1) {
          setTimerRunning(false)
          setTimerDone(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerRunning])

  const startTimerFor = (seconds: number) => {
    setTimerTotal(seconds)
    setTimerSec(seconds)
    setTimerDone(false)
    setTimerRunning(true)
    // scroll to timer
    setTimeout(() => {
      document.getElementById('frying-timer')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const toggleTimer = () => setTimerRunning(r => !r)
  const resetTimer = () => {
    setTimerRunning(false)
    setTimerSec(timerTotal)
    setTimerDone(false)
  }

  return (
    <div className={styles.wrap}>

      {/* ── 1. 재료 선택 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>1. 재료 선택 (복수 선택 가능)</label>
        <div className={styles.ingGrid}>
          {FRYING_DATA.map((d, idx) => {
            const active = selected.includes(d.key)
            const badgeNum = active ? selected.indexOf(d.key) + 1 : 0
            return (
              <button key={d.key} type="button"
                className={`${styles.ingBtn} ${active ? styles.ingActive : ''}`}
                onClick={() => toggleIng(d.key)}>
                <span className={styles.ingEmoji}>{d.emoji}</span>
                <span className={styles.ingName}>{d.name}</span>
                {active && selected.length > 1 && (
                  <span className={styles.ingBadge}>{badgeNum}</span>
                )}
              </button>
            )
          })}
        </div>
        {selected.length > 1 && (
          <p className={styles.cardSub}>
            ✅ {selected.length}개 재료 선택됨 — 각 재료별로 결과 카드가 표시됩니다.
          </p>
        )}
      </div>

      {/* ── 2. 조건 설정 ── */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>2. 재료 상태</label>
        <div className={styles.condRow}>
          {[
            { k: 'fresh',  label: '🌱 생재료', cls: styles.stateFresh },
            { k: 'fridge', label: '❄️ 냉장',   cls: styles.stateFridge },
            { k: 'frozen', label: '🧊 냉동',   cls: styles.stateFrozen },
          ].map(s => (
            <button key={s.k} type="button"
              className={`${styles.condBtn} ${s.cls} ${state === s.k ? styles.condActive : ''}`}
              onClick={() => setState(s.k as StateK)}>
              {s.label}
            </button>
          ))}
        </div>
        {state === 'frozen' && (
          <div className={styles.warnNote}>
            ⚠️ 냉동 상태에서 바로 튀기면 기름 온도가 급격히 낮아질 수 있습니다. 시간 +30~40% 보정 또는 해동 후 튀김 권장.
          </div>
        )}
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>3. 크기·두께</label>
        <div className={styles.condRow}>
          {[
            { k: 'thin',   label: '얇음' },
            { k: 'medium', label: '보통' },
            { k: 'thick',  label: '두꺼움' },
          ].map(t => (
            <button key={t.k} type="button"
              className={`${styles.condBtn} ${thick === t.k ? styles.condActive : ''}`}
              onClick={() => setThick(t.k as ThickK)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>4. 튀김옷</label>
        <div className={styles.condRow}>
          {[
            { k: 'none',   label: '없음' },
            { k: 'thin',   label: '얇음' },
            { k: 'medium', label: '보통' },
            { k: 'thick',  label: '두꺼움' },
          ].map(b => (
            <button key={b.k} type="button"
              className={`${styles.condBtn} ${batter === b.k ? styles.condActive : ''}`}
              onClick={() => setBatter(b.k as BatterK)}>
              {b.label}
            </button>
          ))}
        </div>
        {batter === 'thick' && (
          <p className={styles.cardSub}>두꺼운 튀김옷은 속까지 열이 느리게 전달됩니다. 시간 +20% 보정.</p>
        )}
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>
          5. 기름 온도
          {recTemp && (
            <span className={styles.recBadge}>권장 {recTemp.min}~{recTemp.max}°C</span>
          )}
        </label>
        <div className={styles.condRow}>
          {[160, 170, 180, 190].map(t => {
            const isRec = recTemp && t >= recTemp.min && t <= recTemp.max
            return (
              <button key={t} type="button"
                className={`${styles.condBtn} ${styles.tempBtn} ${styles['temp' + t]} ${oilTemp === t ? styles.condActive : ''} ${isRec ? styles.tempRecBorder : ''}`}
                onClick={() => { setOilTemp(t); setCustomTemp('') }}>
                {t}°C{isRec ? ' 👍' : ''}
              </button>
            )
          })}
        </div>
        <div className={styles.customTempRow}>
          <input
            type="number"
            className={styles.customTempInput}
            placeholder="직접 입력"
            value={customTemp}
            min={100} max={220} step={1}
            onChange={e => {
              setCustomTemp(e.target.value)
              const v = parseInt(e.target.value, 10)
              if (!isNaN(v) && v >= 100 && v <= 220) setOilTemp(v)
            }} />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>°C</span>
        </div>
        {tempOutOfRange && (
          <div className={styles.warnNote}>
            ⚠️ 선택한 재료 권장 온도 범위를 벗어납니다. {oilTemp < (recTemp?.min ?? 0) ? '속이 덜 익거나 기름 흡수 증가' : '겉이 타고 속이 덜 익을 위험'} 주의.
          </div>
        )}
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>6. 한 번에 넣는 양</label>
        <div className={styles.condRow}>
          {[
            { k: 'small',  label: '적음 (20%)',  cls: styles.qtySmall },
            { k: 'medium', label: '보통 (50%)',  cls: '' },
            { k: 'large',  label: '많음 (80%+)', cls: styles.qtyLarge },
          ].map(q => (
            <button key={q.k} type="button"
              className={`${styles.condBtn} ${q.cls} ${qty === q.k ? styles.condActive : ''}`}
              onClick={() => setQty(q.k as QtyK)}>
              {q.label}
            </button>
          ))}
        </div>
        {qty === 'large' && (
          <div className={styles.warnNote}>
            ⚠️ 많이 넣으면 기름 온도 15~20°C 급락. 시간 +25% 보정됐습니다. 가능하면 나눠서 튀기세요.
          </div>
        )}
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>7. 옵션</label>
        <div className={styles.optRow}>
          <label className={styles.optItem}>
            <input type="checkbox" checked={showAir} onChange={e => setShowAir(e.target.checked)} />
            에어프라이어 병행 안내 표시
          </label>
          <label className={styles.optItem}>
            <input type="checkbox" checked={showTimer} onChange={e => setShowTimer(e.target.checked)} />
            카운트다운 타이머 연동
          </label>
        </div>
      </div>

      {/* ── RESULTS ── */}
      {selectedData.length === 0 ? (
        <div className={styles.empty}>재료를 하나 이상 선택하세요</div>
      ) : (
        selectedData.map(d => {
          const baseMid = (d.oilTemp.min + d.oilTemp.max) / 2
          const tf = tempFactor(oilTemp, baseMid)
          const t1min = d.time1.min * adjustedFactor * tf
          const t1max = d.time1.max * adjustedFactor * tf
          const t2min = d.time2 ? d.time2.min * adjustedFactor * tf : 0
          const t2max = d.time2 ? d.time2.max * adjustedFactor * tf : 0
          const totMin = t1min + t2min
          const totMax = t1max + t2max
          const markerLeft = colorMarkerPos(d.targetColor)
          const frozenNote = state === 'frozen' && d.interiorCheck
            ? '냉동 상태에서 바로 튀기면 내부가 덜 익을 수 있습니다. 해동 후 튀김 강력 권장.'
            : null

          return (
            <div key={d.key} className={styles.result}>
              <div className={styles.resultHead}>
                <span className={styles.resultEmoji}>{d.emoji}</span>
                <div>
                  <div className={styles.resultName}>{d.name}</div>
                  <span className={styles.tempBadge}>
                    권장 {d.oilTemp.min}~{d.oilTemp.max}°C
                  </span>
                </div>
              </div>

              <div className={styles.timeGrid}>
                <div className={styles.timeBox}>
                  <div className={styles.timeLabel}>1차 튀김</div>
                  <div className={styles.timeValue}>
                    {fmtSec(t1min)}<span className={styles.timeTilde}>~</span>{fmtSec(t1max)}
                  </div>
                </div>
                <div className={styles.timeBox}>
                  <div className={styles.timeLabel}>
                    2차 튀김 · {secondFryLabel(d.secondFry)}
                  </div>
                  {d.time2 ? (
                    <div className={styles.timeValue}>
                      {fmtSec(t2min)}<span className={styles.timeTilde}>~</span>{fmtSec(t2max)}
                    </div>
                  ) : (
                    <div className={`${styles.timeValue} ${styles.timeValueAccent}`} style={{ fontSize: 18 }}>
                      불필요
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.totalBox}>
                <div className={styles.totalLabel}>총 예상 시간</div>
                <div className={styles.totalValue}>
                  {fmtSec(totMin)} ~ {fmtSec(totMax)}
                </div>
              </div>

              <div className={styles.adjList}>
                <div><strong>조건 보정:</strong> 기본 × {adjustedFactor.toFixed(2)} (상태·두께·튀김옷·양), 온도 × {tf.toFixed(2)}</div>
                {state !== 'fresh' && (
                  <div>· 상태 {state === 'fridge' ? '냉장 +15%' : '냉동 +40%'}</div>
                )}
                {thick !== 'medium' && (
                  <div>· 두께 {thick === 'thin' ? '얇음 −20%' : '두꺼움 +30%'}</div>
                )}
                {batter !== 'medium' && batter !== 'thick' && (
                  <div>· 튀김옷 {batter === 'none' ? '없음 −15%' : '얇음 −5%'}</div>
                )}
                {batter === 'thick' && <div>· 튀김옷 두꺼움 +20%</div>}
                {qty === 'large' && <div>· 양 많음 +25% (온도 급락 보정)</div>}
                {qty === 'small' && <div>· 양 적음 −5%</div>}
              </div>

              <div className={styles.colorWrap}>
                <div className={styles.colorLabel}>색상 기준 · 목표: {colorLabel(d.targetColor)}</div>
                <div className={styles.colorBarWrap}>
                  <div className={styles.colorMarker} style={{ left: `${markerLeft}%` }} />
                  <div className={styles.colorBar} />
                  <div className={styles.colorLabels}>
                    <span>연노랑</span>
                    <span>황금색</span>
                    <span>진갈색</span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
                  {d.colorGuide}
                </p>
              </div>

              <div className={styles.tipBox}>
                <strong>💡 겉바속촉 포인트</strong><br />
                {d.tip}
              </div>

              {d.interiorCheck && (
                <div className={styles.warnBox}>
                  <strong>⚠️ 속 익힘 확인 필수</strong><br />
                  {d.name === '치킨' || d.name === '돈까스'
                    ? '내부 온도 75°C 이상 확인. 가장 두꺼운 부분을 잘랐을 때 분홍기·투명 육즙 없어야 합니다.'
                    : '중심부까지 완전히 익었는지 확인 후 꺼내세요. 덜 익으면 식중독 위험.'}
                  {frozenNote && <><br />{frozenNote}</>}
                </div>
              )}

              {showAir && (
                <div className={styles.airBox}>
                  <div className={styles.airHead}>🌀 에어프라이어로 변환</div>
                  <div className={styles.airGrid}>
                    <div className={styles.airItem}>
                      <div className={styles.airLabel}>온도</div>
                      <div className={styles.airVal}>{d.airfryer.temp}°C</div>
                    </div>
                    <div className={styles.airItem}>
                      <div className={styles.airLabel}>시간</div>
                      <div className={styles.airVal}>{d.airfryer.timeMinMin}~{d.airfryer.timeMinMax}분</div>
                    </div>
                  </div>
                  <div className={styles.airNote}>
                    예열 3~5분 권장 · 중간에 한 번 뒤집기 · 에어프라이어는 겉면에 식용유 분사 시 더 바삭해집니다.
                  </div>
                </div>
              )}

              {showTimer && (
                <button type="button"
                  className={styles.startBtn}
                  onClick={() => startTimerFor(Math.round(t1max))}>
                  ⏱ {fmtSec(t1max)} 타이머 시작 (1차 최대 시간 기준)
                </button>
              )}
            </div>
          )
        })
      )}

      {/* ── TIMER ── */}
      {showTimer && timerTotal > 0 && (
        <div id="frying-timer" className={`${styles.timerCard} ${timerDone ? styles.timerCardDone : ''}`}>
          <div className={`${styles.timerTitle} ${timerDone ? styles.timerTitleDone : ''}`}>
            {timerDone ? '✅ 1차 튀김 완료!' : timerRunning ? '🔥 튀김 진행 중' : '⏸ 일시정지'}
          </div>
          <TimerRing
            secondsLeft={timerSec}
            total={timerTotal}
            done={timerDone}
          />
          <div className={styles.timerBtns}>
            {!timerDone && (
              <button type="button" className={`${styles.timerBtn} ${styles.timerBtnPrimary}`} onClick={toggleTimer}>
                {timerRunning ? '⏸ 일시정지' : '▶ 시작'}
              </button>
            )}
            <button type="button" className={styles.timerBtn} onClick={resetTimer}>
              ↻ 리셋
            </button>
          </div>
          {timerDone && (
            <div className={styles.timerDoneMsg}>
              휴지(2~3분) 후 2차 튀김을 시작하세요. 필요 없으면 그대로 완성!
            </div>
          )}
        </div>
      )}

      <div className={styles.disclaimer}>
        <strong>⚠️ 식품 안전 주의:</strong> 본 가이드는 일반적인 참고용입니다. 조리 환경·재료 크기·보관 상태에 따라 실제 시간은 달라집니다. 육류(돼지 63°C / 닭 75°C)와 냉동 재료는 반드시 내부 익힘 상태를 확인하세요.
      </div>
    </div>
  )
}

// ── Timer ring SVG ──
function TimerRing({ secondsLeft, total, done }: { secondsLeft: number; total: number; done: boolean }) {
  const size = 160
  const stroke = 8
  const r = (size - stroke) / 2
  const c = Math.PI * 2 * r
  const pct = total > 0 ? Math.max(0, Math.min(1, secondsLeft / total)) : 0
  const dashOffset = c * (1 - pct)
  const color = done ? '#3EFF9B' : 'var(--accent)'

  return (
    <div className={styles.timerRing}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="var(--bg3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>
      <div className={`${styles.timerCenter} ${done ? styles.timerCenterDone : ''}`}>
        {done ? '완료!' : fmtTimerSec(secondsLeft)}
      </div>
    </div>
  )
}
