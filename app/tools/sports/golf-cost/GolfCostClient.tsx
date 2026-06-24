/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './golf-cost.module.css'
import {
  calcMembership, MEMBERSHIP_PRICE_PRESETS, ANNUAL_ROUNDS_PRESETS,
  loadCourses, saveCourses, newId, todayStr, fmtKrw, COURSE_TYPE_LABEL,
  type SavedGolfCourse,
} from './golfCostUtils'

type TabId = 'main' | 'membership' | 'courses'

// ───────────────────────── 타입·상수 ─────────────────────────

type CourseType = 'publicWeekday' | 'publicWeekend' | 'semiPrivate' | 'private' | 'custom'
type PlayerCount = 2 | 3 | 4
type CartMode = 'team' | 'perPerson'
type MealMode = 'each' | 'team'
type TransportMode = 'self' | 'carpool' | 'bus' | 'transit'

interface CoursePreset {
  green: number
  cart: number
  cartMode: CartMode
  caddie: number
}

const COURSE_PRESETS: Record<Exclude<CourseType, 'custom'>, CoursePreset> = {
  publicWeekday: { green: 100_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
  publicWeekend: { green: 130_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
  semiPrivate:   { green: 160_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
  private:       { green: 200_000, cart: 100_000, cartMode: 'team', caddie: 150_000 },
}

const COURSE_LABELS: { key: CourseType; label: string; cls: string }[] = [
  { key: 'publicWeekday', label: '퍼블릭 주중', cls: s.coursePubWeek },
  { key: 'publicWeekend', label: '퍼블릭 주말', cls: s.coursePubEnd },
  { key: 'semiPrivate',   label: '세미퍼블릭',  cls: s.courseSemi },
  { key: 'private',       label: '회원제',      cls: s.coursePriv },
  { key: 'custom',        label: '직접 입력',   cls: s.courseCustom },
]

// ───────────────────────── 포맷터 ─────────────────────────

function fmt(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0원'
  return Math.round(n).toLocaleString('ko-KR') + '원'
}
function fmtNum(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0'
  return Math.round(n).toLocaleString('ko-KR')
}
function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '')
  if (!cleaned) return 0
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

// ───────────────────────── 메인 ─────────────────────────

export default function GolfCostClient() {
  const [tab, setTab] = useState<TabId>('main')
  const [courseType, setCourseType] = useState<CourseType>('publicWeekend')
  const [players, setPlayers] = useState<PlayerCount>(4)

  // 그린피
  const [greenFee, setGreenFee] = useState(130_000)

  // 카트비
  const [cartFee, setCartFee] = useState(100_000)
  const [cartMode, setCartMode] = useState<CartMode>('team')

  // 캐디
  const [caddieEnabled, setCaddieEnabled] = useState(true)
  const [caddieFee, setCaddieFee] = useState(150_000)
  const [tipAmount, setTipAmount] = useState(0)

  // 식사·그늘집
  const [mealMode, setMealMode] = useState<MealMode>('each')
  const [mealAmount, setMealAmount] = useState(20_000) // 1인당 또는 팀당
  const [shadeAmount, setShadeAmount] = useState(30_000) // 팀당

  // 교통
  const [transportMode, setTransportMode] = useState<TransportMode>('carpool')
  const [carpoolTotal, setCarpoolTotal] = useState(80_000)
  const [tripDistance, setTripDistance] = useState(120) // 왕복 km
  const [efficiency, setEfficiency] = useState(12)
  const [fuelPrice, setFuelPrice] = useState(1650)
  const [transitPerPerson, setTransitPerPerson] = useState(15_000)
  const [busPerPerson, setBusPerPerson] = useState(20_000)

  // 기타
  const [glovesCost, setGlovesCost] = useState(0) // 1인당
  const [lockerFee, setLockerFee] = useState(0) // 1인당
  const [otherCost, setOtherCost] = useState(0) // 1인당

  // 내기 (선택)
  const [bettingOn, setBettingOn] = useState(false)
  const [betPlayers, setBetPlayers] = useState<{ name: string; amount: number }[]>([
    { name: '', amount: 0 },
    { name: '', amount: 0 },
    { name: '', amount: 0 },
    { name: '', amount: 0 },
  ])

  // 참여자별 정산 (선택)
  const [perPlayerOn, setPerPlayerOn] = useState(false)
  const [playerData, setPlayerData] = useState<{ name: string; adjustment: number }[]>([
    { name: '', adjustment: 0 },
    { name: '', adjustment: 0 },
    { name: '', adjustment: 0 },
    { name: '', adjustment: 0 },
  ])

  // 월간 라운딩
  const [monthlyRounds, setMonthlyRounds] = useState(2)

  // 복사
  const [copied, setCopied] = useState(false)

  // 코스 프리셋 변경 시 값 자동 적용
  useEffect(() => {
    if (courseType === 'custom') return
    const preset = COURSE_PRESETS[courseType]
    setGreenFee(preset.green)
    setCartFee(preset.cart)
    setCartMode(preset.cartMode)
    setCaddieFee(preset.caddie)
  }, [courseType])

  // ── 계산 ──
  const greenTotal = greenFee * players
  const cartTotal = cartMode === 'team' ? cartFee : cartFee * players
  const caddieTotal = caddieEnabled ? caddieFee + tipAmount : 0
  const mealTotal = mealMode === 'each' ? mealAmount * players : mealAmount
  const shadeTotal = shadeAmount

  const fuelCost = useMemo(() => {
    if (efficiency <= 0) return 0
    return (tripDistance / efficiency) * fuelPrice
  }, [tripDistance, efficiency, fuelPrice])

  const transportTotal = useMemo(() => {
    switch (transportMode) {
      case 'carpool': return carpoolTotal
      case 'self': return fuelCost
      case 'bus': return busPerPerson * players
      case 'transit': return transitPerPerson * players
      default: return 0
    }
  }, [transportMode, carpoolTotal, fuelCost, busPerPerson, transitPerPerson, players])

  const miscTotal = (glovesCost + lockerFee + otherCost) * players

  const teamTotal = greenTotal + cartTotal + caddieTotal + mealTotal + shadeTotal + transportTotal + miscTotal
  const perPerson = players > 0 ? teamTotal / players : 0

  // 내기 합계 (제로섬 검증용)
  const bettingSum = useMemo(() => {
    return betPlayers.slice(0, players).reduce((sum, p) => sum + p.amount, 0)
  }, [betPlayers, players])

  // 참여자별 정산
  const playerSettlements = useMemo(() => {
    return Array.from({ length: players }).map((_, i) => {
      const adjust = perPlayerOn ? playerData[i].adjustment : 0
      const bet = bettingOn ? betPlayers[i].amount : 0
      // 양수 bet = 받는 돈 → 본인이 내야 할 돈 줄어듦
      return {
        name: perPlayerOn ? playerData[i].name : '',
        base: perPerson + adjust - bet,
      }
    })
  }, [players, perPlayerOn, playerData, bettingOn, betPlayers, perPerson])

  // 참여자별 최종 합계 vs 팀 총액 — 조정·내기가 상쇄되지 않으면 정산이 안 맞음
  const settlementSum = useMemo(
    () => playerSettlements.reduce((sum, p) => sum + p.base, 0),
    [playerSettlements],
  )
  const settlementDiff = Math.round(settlementSum - teamTotal)

  // breakdown
  const breakdown = useMemo(() => {
    return [
      { key: 'green',  label: '그린피',     team: greenTotal, perp: greenTotal / players },
      { key: 'cart',   label: '카트비',     team: cartTotal,  perp: cartTotal / players },
      { key: 'caddie', label: '캐디피',     team: caddieTotal, perp: caddieTotal / players },
      { key: 'meal',   label: '식사·그늘집', team: mealTotal + shadeTotal, perp: (mealTotal + shadeTotal) / players },
      { key: 'trans',  label: '교통비',     team: transportTotal, perp: transportTotal / players },
      { key: 'misc',   label: '기타',       team: miscTotal, perp: miscTotal / players },
    ].filter(r => r.team > 0)
  }, [greenTotal, cartTotal, caddieTotal, mealTotal, shadeTotal, transportTotal, miscTotal, players])

  const maxItem = breakdown.reduce((m, it) => (it.team > m.team ? it : m), breakdown[0] || { key: '', team: 0 })

  // 복사
  const copyText = useMemo(() => {
    const lines = ['⛳ 오늘 골프 비용', `1인당 총비용: ${fmt(perPerson)}`, '──────────────']
    breakdown.forEach(b => lines.push(`${b.label}: ${fmt(b.perp)}`))
    lines.push('──────────────')
    lines.push(`팀 총액: ${fmt(teamTotal)} (${players}명 기준)`)
    lines.push('youtil.kr/tools/sports/golf-cost')
    return lines.join('\n')
  }, [breakdown, perPerson, teamTotal, players])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {/* noop */}
  }

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/race-predictor', label: '마라톤 예측' },
          { href: '/tools/sports/pace', label: '러닝 페이스' },
          { href: '/tools/sports/one-rm', label: '1RM 계산기' }
        ]}
      >
        ⛳ 입력값 기반 예상 비용입니다. 실제 비용은 골프장·시즌·요일·코스 컨디션·식음료 메뉴에 따라 크게 달라질 수 있습니다.
      </Disclaimer>

      {/* 탭 네비 */}
      <div className={s.tabs3} role="tablist">
        {([
          { id: 'main',       label: '🧮 오늘 정산' },
          { id: 'membership', label: '🏆 회원권 손익' },
          { id: 'courses',    label: '⛳ 내 골프장' },
        ] as { id: TabId; label: string }[]).map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`${s.tabBtn} ${tab === t.id ? s.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'membership' && (
        <MembershipTab defaultNonMemberCost={Math.round(perPerson)} />
      )}
      {tab === 'courses' && (
        <CoursesTab
          onApply={(c) => {
            setTab('main')
            setCourseType('custom' as CourseType)
            setGreenFee(c.greenFee)
            setCartFee(c.cartFee)
            setCaddieFee(c.caddieFee)
            if (c.defaultMeal) setMealAmount(c.defaultMeal)
            // 계산 모드 복원 (구버전 저장값엔 없을 수 있어 가드)
            if (c.cartMode === 'team' || c.cartMode === 'perPerson') setCartMode(c.cartMode)
            if (c.mealMode === 'each' || c.mealMode === 'team') setMealMode(c.mealMode)
            if (typeof c.caddieEnabled === 'boolean') setCaddieEnabled(c.caddieEnabled)
            if (c.transportMode === 'self' || c.transportMode === 'carpool' || c.transportMode === 'bus' || c.transportMode === 'transit') setTransportMode(c.transportMode)
            if (typeof c.tipAmount === 'number') setTipAmount(c.tipAmount)
          }}
          currentSnapshot={{
            greenFee, cartFee, caddieFee,
            mealAmount, courseType,
          }}
        />
      )}

      {tab === 'main' && (<>
      {/* 코스 프리셋 */}
      <div className={s.card}>
        <span className={s.cardLabel}>① 골프장 타입</span>
        <div className={s.courseGrid}>
          {COURSE_LABELS.map(c => (
            <button
              key={c.key} type="button" aria-pressed={courseType === c.key}
              className={`${s.courseBtn} ${c.cls} ${courseType === c.key ? s.courseActive : ''}`}
              onClick={() => setCourseType(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className={s.helperText}>
          프리셋 선택 시 그린피·카트비·캐디피 기본값이 자동 입력됩니다 (수정 가능).
        </div>

        <div className={`${s.subLabel} ${s.subLabelTop}`}>인원 수</div>
        <div className={s.playerRow}>
          {([2, 3, 4] as PlayerCount[]).map(n => (
            <button
              key={n} type="button" aria-pressed={players === n}
              className={`${s.playerBtn} ${players === n ? s.playerActive : ''}`}
              onClick={() => setPlayers(n)}
            >
              {n}명{n === 4 && ' (표준)'}
            </button>
          ))}
        </div>
      </div>

      {/* 그린피 */}
      <div className={`${s.card} ${s.cardAccent}`}>
        <span className={s.cardLabel}>⛳ 그린피</span>
        <div className={s.subLabel}>1인당 그린피</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal" aria-label="1인당 그린피" value={greenFee || ''} onChange={e => setGreenFee(parseAmount(e.target.value))} />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.liveHint}>
          {players}명 × {fmt(greenFee)} = {fmt(greenTotal)}
        </div>
      </div>

      {/* 카트비 */}
      <div className={`${s.card} ${s.cardAccent}`}>
        <span className={s.cardLabel}>🛺 카트비</span>
        <div className={s.subLabel}>부과 방식</div>
        <div className={s.toggleRow}>
          <button type="button" aria-pressed={cartMode === 'team'} className={`${s.toggleBtn} ${cartMode === 'team' ? s.toggleOn : s.toggleOff}`} onClick={() => setCartMode('team')}>팀당</button>
          <button type="button" aria-pressed={cartMode === 'perPerson'} className={`${s.toggleBtn} ${cartMode === 'perPerson' ? s.toggleOn : s.toggleOff}`} onClick={() => setCartMode('perPerson')}>1인당</button>
        </div>
        <div className={`${s.subLabel} ${s.subLabelTop}`}>{cartMode === 'team' ? '팀당 카트비' : '1인당 카트비'}</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal" aria-label="카트비 금액" value={cartFee || ''} onChange={e => setCartFee(parseAmount(e.target.value))} />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.liveHint}>
          팀 총액 {fmt(cartTotal)} · 1인당 {fmt(cartTotal / players)}
        </div>
      </div>

      {/* 캐디 */}
      <div className={`${s.card} ${s.cardAccent}`}>
        <div className={s.toggleHeader}>
          <span className={s.cardLabel} style={{ marginBottom: 0 }}>👤 캐디피</span>
          <div className={s.toggleRow} style={{ width: 200 }}>
            <button type="button" aria-pressed={caddieEnabled} className={`${s.toggleBtn} ${caddieEnabled ? s.toggleOn : s.toggleOff}`} onClick={() => setCaddieEnabled(true)}>있음</button>
            <button type="button" aria-pressed={!caddieEnabled} className={`${s.toggleBtn} ${!caddieEnabled ? s.toggleOn : s.toggleOff}`} onClick={() => setCaddieEnabled(false)}>노캐디</button>
          </div>
        </div>

        {caddieEnabled ? (
          <>
            <div className={s.subLabel}>팀당 캐디피</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal" aria-label="팀당 캐디피" value={caddieFee || ''} onChange={e => setCaddieFee(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>

            <div className={`${s.subLabel} ${s.subLabelTop}`}>봉사료(팁)</div>
            <div className={s.pills}>
              {[0, 10_000, 20_000, 30_000].map(v => (
                <button key={v} type="button" aria-pressed={tipAmount === v} className={`${s.pill} ${tipAmount === v ? s.pillActive : ''}`} onClick={() => setTipAmount(v)}>
                  {v === 0 ? '없음' : `+${(v / 10_000).toFixed(0)}만원`}
                </button>
              ))}
            </div>
            <div className={s.inputRow} style={{ marginTop: 8 }}>
              <input className={s.numInput} type="number" inputMode="decimal" aria-label="캐디 봉사료(팁)" value={tipAmount || ''} onChange={e => setTipAmount(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
              <span className={s.unit}>원</span>
            </div>

            <div className={s.liveHint}>
              ({fmt(caddieFee)} + {fmt(tipAmount)}) ÷ {players}명 = <strong>{fmt(caddieTotal / players)}</strong> / 1인
            </div>
            <div className={s.helperText}>
              💡 캐디피는 팀당 금액으로, 인원 수로 나눠 정산합니다.
            </div>
          </>
        ) : (
          <div className={s.helperText}>
            노캐디 선택 — 캐디피 0원. 일부 골프장은 노캐디를 허용하지 않을 수 있습니다.
          </div>
        )}
      </div>

      {/* 식사·그늘집 */}
      <div className={`${s.card} ${s.cardAccent}`}>
        <span className={s.cardLabel}>🍱 식사·그늘집</span>
        <div className={s.subLabel}>식사비 부과 방식</div>
        <div className={s.toggleRow}>
          <button type="button" aria-pressed={mealMode === 'each'} className={`${s.toggleBtn} ${mealMode === 'each' ? s.toggleOn : s.toggleOff}`} onClick={() => setMealMode('each')}>각자 결제</button>
          <button type="button" aria-pressed={mealMode === 'team'} className={`${s.toggleBtn} ${mealMode === 'team' ? s.toggleOn : s.toggleOff}`} onClick={() => setMealMode('team')}>팀 일괄</button>
        </div>

        <div className={`${s.subLabel} ${s.subLabelTop}`}>{mealMode === 'each' ? '1인당 식사비' : '팀 식사비 총액'}</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal" aria-label="식사비" value={mealAmount || ''} onChange={e => setMealAmount(parseAmount(e.target.value))} />
          <span className={s.unit}>원</span>
        </div>

        <div className={`${s.subLabel} ${s.subLabelTop}`}>그늘집 비용 (팀당)</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal" aria-label="그늘집 비용(팀당)" value={shadeAmount || ''} onChange={e => setShadeAmount(parseAmount(e.target.value))} />
          <span className={s.unit}>원</span>
        </div>

        <div className={s.liveHint}>
          팀 총액 {fmt(mealTotal + shadeTotal)} · 1인당 {fmt((mealTotal + shadeTotal) / players)}
        </div>
      </div>

      {/* 교통비 */}
      <div className={`${s.card} ${s.cardAccent}`}>
        <span className={s.cardLabel}>🚗 교통비</span>
        <div className={s.subLabel}>교통 수단</div>
        <div className={`${s.courseGrid} ${s.courseGrid4}`}>
          {([
            { key: 'self', label: '자차' },
            { key: 'carpool', label: '카풀' },
            { key: 'bus', label: '버스·셔틀' },
            { key: 'transit', label: '대중교통' },
          ] as { key: TransportMode; label: string }[]).map(m => (
            <button
              key={m.key} type="button" aria-pressed={transportMode === m.key}
              className={`${s.courseBtn} ${transportMode === m.key ? s.courseActive : ''}`}
              style={{ borderStyle: 'solid' }}
              onClick={() => setTransportMode(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {transportMode === 'self' && (
          <>
            <div className={s.twoCol} style={{ marginTop: 12 }}>
              <div>
                <div className={s.subLabel}>왕복 거리</div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" inputMode="decimal" aria-label="왕복 거리(km)" value={tripDistance || ''} onChange={e => setTripDistance(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
                  <span className={s.unit}>km</span>
                </div>
              </div>
              <div>
                <div className={s.subLabel}>연비</div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" inputMode="decimal" step="0.1" aria-label="연비(km/L)" value={efficiency || ''} onChange={e => setEfficiency(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
                  <span className={s.unit}>km/L</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div className={s.subLabel}>유가</div>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" inputMode="decimal" aria-label="유가(원/L)" value={fuelPrice || ''} onChange={e => setFuelPrice(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
                <span className={s.unit}>원/L</span>
              </div>
            </div>
            <div className={s.liveHint}>예상 유류비 {fmt(fuelCost)} (전체)</div>
          </>
        )}

        {transportMode === 'carpool' && (
          <>
            <div className={s.subLabel} style={{ marginTop: 12 }}>총 교통비 (유류비·통행료 합산)</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal" aria-label="총 교통비(유류비·통행료)" value={carpoolTotal || ''} onChange={e => setCarpoolTotal(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <div className={s.liveHint}>{players}명이 나누면 1인당 {fmt(carpoolTotal / players)}</div>
          </>
        )}

        {transportMode === 'bus' && (
          <>
            <div className={s.subLabel} style={{ marginTop: 12 }}>1인당 버스·셔틀 요금</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal" aria-label="1인당 버스·셔틀 요금" value={busPerPerson || ''} onChange={e => setBusPerPerson(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <div className={s.liveHint}>팀 합계 {fmt(busPerPerson * players)}</div>
          </>
        )}

        {transportMode === 'transit' && (
          <>
            <div className={s.subLabel} style={{ marginTop: 12 }}>1인당 대중교통비</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal" aria-label="1인당 대중교통비" value={transitPerPerson || ''} onChange={e => setTransitPerPerson(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <div className={s.liveHint}>팀 합계 {fmt(transitPerPerson * players)}</div>
          </>
        )}
      </div>

      {/* 기타 비용 */}
      <div className={`${s.card} ${s.cardAccent}`}>
        <span className={s.cardLabel}>💼 기타 비용 (1인당)</span>
        <div className={s.twoCol}>
          <div>
            <div className={s.subLabel}>장갑/볼/티</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal" aria-label="장갑·볼·티(1인당)" value={glovesCost || ''} onChange={e => setGlovesCost(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
              <span className={s.unit}>원</span>
            </div>
          </div>
          <div>
            <div className={s.subLabel}>로커비</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal" aria-label="로커비(1인당)" value={lockerFee || ''} onChange={e => setLockerFee(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
              <span className={s.unit}>원</span>
            </div>
          </div>
        </div>
        <div className={`${s.subLabel} ${s.subLabelTop}`}>기타</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal" aria-label="기타 비용(1인당)" value={otherCost || ''} onChange={e => setOtherCost(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.liveHint}>
          1인당 {fmt(glovesCost + lockerFee + otherCost)} · 팀 {fmt(miscTotal)}
        </div>
      </div>

      {/* 내기 (선택) */}
      <div className={s.card}>
        <div className={s.toggleHeader}>
          <span className={s.cardLabel} style={{ marginBottom: 0 }}>🎯 내기 정산 (선택)</span>
          <div
            className={`${s.toggleSwitch} ${bettingOn ? s.toggleSwitchOn : ''}`}
            onClick={() => setBettingOn(!bettingOn)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setBettingOn(!bettingOn) } }}
            role="switch" aria-checked={bettingOn} aria-label="내기 정산 포함"
            tabIndex={0}
          >
            <div className={s.toggleKnob} />
          </div>
        </div>
        {bettingOn && (
          <>
            <div className={s.bettingHelper}>
              각자의 내기 손익을 입력하세요. 양수(+) = 받을 돈, 음수(−) = 낼 돈. 합계가 0원이 되어야 정산이 맞습니다.
            </div>
            {Array.from({ length: players }).map((_, i) => (
              <div key={i} className={s.bettingRow}>
                <input
                  className={s.smallText}
                  placeholder={`참여자 ${i + 1} 이름 (선택)`}
                  value={betPlayers[i]?.name || ''}
                  onChange={e => {
                    const next = [...betPlayers]
                    next[i] = { ...next[i], name: e.target.value }
                    setBetPlayers(next)
                  }}
                />
                <input
                  className={s.smallNum}
                  type="number" inputMode="decimal"
                  placeholder="손익(+ / −)"
                  value={betPlayers[i]?.amount || ''}
                  onChange={e => {
                    const next = [...betPlayers]
                    const v = parseFloat(e.target.value.replace(/[^0-9.\-]/g, ''))
                    next[i] = { ...next[i], amount: isNaN(v) ? 0 : v }
                    setBetPlayers(next)
                  }}
                />
                <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>원</div>
              </div>
            ))}
            <div className={`${s.bettingSum} ${bettingSum === 0 ? s.bettingSumOk : s.bettingSumWarn}`}>
              합계: {bettingSum > 0 ? '+' : ''}{fmtNum(bettingSum)}원
              {bettingSum === 0 ? ' ✓ 정산 일치' : ' ⚠ 합이 0이 아닙니다'}
            </div>
          </>
        )}
      </div>

      {/* 참여자별 정산 (선택) */}
      <div className={s.card}>
        <div className={s.toggleHeader}>
          <span className={s.cardLabel} style={{ marginBottom: 0 }}>👥 참여자별 정산 (선택)</span>
          <div
            className={`${s.toggleSwitch} ${perPlayerOn ? s.toggleSwitchOn : ''}`}
            onClick={() => setPerPlayerOn(!perPlayerOn)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPerPlayerOn(!perPlayerOn) } }}
            role="switch" aria-checked={perPlayerOn} aria-label="참여자별 정산 포함"
            tabIndex={0}
          >
            <div className={s.toggleKnob} />
          </div>
        </div>
        {perPlayerOn && (
          <>
            <div className={s.bettingHelper}>
              개인별 조정 금액(+/−)을 입력하세요. 예: 카풀 운전자에게 -10,000원 차감, 늦게 합류한 참여자 +5,000원 가산.
            </div>
            {Array.from({ length: players }).map((_, i) => (
              <div key={i} className={s.playerListRow}>
                <input
                  className={s.smallText}
                  placeholder={`참여자 ${i + 1}`}
                  value={playerData[i]?.name || ''}
                  onChange={e => {
                    const next = [...playerData]
                    next[i] = { ...next[i], name: e.target.value }
                    setPlayerData(next)
                  }}
                />
                <input
                  className={s.smallNum}
                  type="number" inputMode="decimal"
                  placeholder="조정 (+/−)"
                  value={playerData[i]?.adjustment || ''}
                  onChange={e => {
                    const next = [...playerData]
                    const raw = e.target.value
                    const v = parseFloat(raw.replace(/[^0-9.\-]/g, ''))
                    next[i] = { ...next[i], adjustment: isNaN(v) ? 0 : v }
                    setPlayerData(next)
                  }}
                />
                <div className={s.playerFinal}>
                  최종 {fmt(playerSettlements[i]?.base ?? 0)}
                </div>
              </div>
            ))}
            <div className={`${s.bettingSum} ${settlementDiff === 0 ? s.bettingSumOk : s.bettingSumWarn}`}>
              참여자 합계 {fmtNum(settlementSum)}원 · 팀 총액 {fmtNum(teamTotal)}원
              {settlementDiff === 0
                ? ' ✓ 일치'
                : ` ⚠ ${settlementDiff > 0 ? '+' : ''}${fmtNum(settlementDiff)}원 — 조정·내기 합이 상쇄되지 않아 정산이 맞지 않습니다`}
            </div>
          </>
        )}
      </div>

      {/* ── 결과 ── */}
      <div className={s.hero} role="status">
        <div className={s.heroLead}>오늘 라운딩 1인당 비용</div>
        <div className={s.heroNum}>{fmt(perPerson)}</div>
        <div className={s.heroSub}>팀 총액 {fmt(teamTotal)} · {players}명 기준</div>
      </div>

      {/* breakdown */}
      <div className={s.card}>
        <span className={s.cardLabel}>📊 비용 항목 분석</span>
        <table className={s.breakdownTable}>
          <thead>
            <tr>
              <th scope="col">항목</th>
              <th scope="col" style={{ textAlign: 'right' }}>팀 총액</th>
              <th scope="col" style={{ textAlign: 'right' }}>1인당</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map(b => {
              const isMax = b.key === maxItem.key
              return (
                <tr key={b.key} className={isMax ? s.maxRow : ''}>
                  <td>{b.label}</td>
                  <td className={s.numCell}>{fmt(b.team)}</td>
                  <td className={s.numCell}>{fmt(b.perp)}</td>
                </tr>
              )
            })}
            <tr className={s.totalRow}>
              <td>합계</td>
              <td className={s.numCell}>{fmt(teamTotal)}</td>
              <td className={s.numCell}>{fmt(perPerson)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 캐디피 정산 안내 */}
      {caddieEnabled && caddieTotal > 0 && (
        <div className={s.infoCard}>
          💡 <strong>캐디피 정산 안내</strong><br />
          {tipAmount > 0
            ? <>캐디피 {fmt(caddieFee)} + 봉사료 {fmt(tipAmount)} = {fmt(caddieTotal)} ÷ {players}명 = <strong>{fmt(caddieTotal / players)}</strong></>
            : <>캐디피 {fmt(caddieTotal)} ÷ {players}명 = <strong>{fmt(caddieTotal / players)}</strong></>
          }
        </div>
      )}

      {/* 월·연간 예상 */}
      <div className={s.card}>
        <span className={s.cardLabel}>📅 월·연간 비용 예상</span>
        <div className={s.subLabel}>월 라운딩 횟수</div>
        <div className={s.sliderWrap}>
          <input
            type="range"
            min={1}
            max={8}
            value={monthlyRounds}
            onChange={e => setMonthlyRounds(parseInt(e.target.value, 10))}
            className={s.slider}
          />
          <div className={s.sliderValue}>{monthlyRounds}회</div>
        </div>
        <div className={s.forecastGrid}>
          <div className={s.forecastBox}>
            <div className={s.forecastLabel}>월 예상</div>
            <div className={s.forecastVal}>{fmt(perPerson * monthlyRounds)}</div>
            <div className={s.forecastSub}>1인당 / {monthlyRounds}회</div>
          </div>
          <div className={s.forecastBox}>
            <div className={s.forecastLabel}>연간 예상</div>
            <div className={s.forecastVal}>{fmt(perPerson * monthlyRounds * 12)}</div>
            <div className={s.forecastSub}>{monthlyRounds * 12}회 / 1인당</div>
          </div>
        </div>
      </div>

      {/* 복사 */}
      <div className={s.actionRow}>
        <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={onCopy}>
          {copied ? '✓ 복사됨' : '📋 결과 복사하기'}
        </button>
      </div>

      {/* 더치페이 도구 자동 연결 + 골프장 저장 */}
      {teamTotal > 0 && (
        <div className={s.crossLinkCard}>
          <a
            href={`/tools/life/dutch?total=${Math.round(teamTotal)}&people=${players}&context=골프`}
            className={s.crossLinkBtn}>
            <span className={s.crossLinkIcon}>🍻</span>
            <span>
              <strong>카톡방에서 N빵 정산 →</strong>
              <span className={s.crossLinkSub}>더치페이 도구로 자동 입력 (총 {fmtKrw(teamTotal)} / {players}명)</span>
            </span>
          </a>
          <CourseSaveButton
            data={{
              name: '', type: courseType, greenFee, cartFee, caddieFee,
              defaultMeal: mealAmount,
              cartMode, mealMode, caddieEnabled, transportMode, tipAmount,
            }}
          />
        </div>
      )}
      </>)}
    </div>
  )
}

/* ──────────────────────── 골프장 저장 버튼 ──────────────────────── */
function CourseSaveButton({ data }: {
  data: {
    name: string; type: string; greenFee: number; cartFee: number; caddieFee: number; defaultMeal?: number
    cartMode?: 'team' | 'perPerson'; mealMode?: 'each' | 'team'; caddieEnabled?: boolean
    transportMode?: string; tipAmount?: number
  }
}) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const handleSave = () => {
    if (!name.trim()) return
    const courses = loadCourses()
    const newCourse: SavedGolfCourse = {
      id: newId(),
      name: name.trim(),
      type: data.type,
      greenFee: data.greenFee,
      cartFee: data.cartFee,
      caddieFee: data.caddieFee,
      defaultMeal: data.defaultMeal,
      cartMode: data.cartMode,
      mealMode: data.mealMode,
      caddieEnabled: data.caddieEnabled,
      transportMode: data.transportMode,
      tipAmount: data.tipAmount,
      lastUsed: todayStr(),
    }
    saveCourses([newCourse, ...courses])
    setSaved(true); setTimeout(() => setSaved(false), 1500)
    setName('')
  }
  return (
    <div className={s.courseSaveRow}>
      <input
        type="text"
        className={s.courseSaveInput}
        placeholder="골프장 이름 (예: 스카이힐 청주)"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={40}
      />
      <button type="button"
        className={`${s.courseSaveBtn} ${saved ? s.copied : ''}`}
        onClick={handleSave} disabled={!name.trim()}>
        {saved ? '✓ 저장됨' : '💾 저장'}
      </button>
    </div>
  )
}

/* ──────────────────────── 회원권 손익 탭 ──────────────────────── */
function MembershipTab({ defaultNonMemberCost }: { defaultNonMemberCost: number }) {
  const [membershipPrice, setMembershipPrice] = useState(500_000_000)
  const [annualFee, setAnnualFee] = useState(2_000_000)
  const [holdingYears, setHoldingYears] = useState(10)
  const [nonMemberCost, setNonMemberCost] = useState(defaultNonMemberCost > 0 ? defaultNonMemberCost : 220_000)
  const [memberRoundCost, setMemberRoundCost] = useState(80_000)
  const [annualRounds, setAnnualRounds] = useState(24)
  const [resaleValue, setResaleValue] = useState(300_000_000)

  const result = useMemo(() => calcMembership({
    membershipPrice, annualFee, holdingYears,
    nonMemberCost, memberRoundCost, annualRounds, resaleValue,
  }), [membershipPrice, annualFee, holdingYears, nonMemberCost, memberRoundCost, annualRounds, resaleValue])

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>① 회원권 정보</span>
        <div className={s.subLabel}>회원권 가격</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal"
            value={membershipPrice || ''}
            onChange={e => setMembershipPrice(parseAmount(e.target.value))} />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.pills} style={{ marginTop: 6 }}>
          {MEMBERSHIP_PRICE_PRESETS.map(p => (
            <button key={p.value}
              className={`${s.pill} ${membershipPrice === p.value ? s.pillActive : ''}`}
              onClick={() => setMembershipPrice(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className={s.twoCol} style={{ marginTop: 14 }}>
          <div>
            <div className={s.subLabel}>연회비</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal"
                value={annualFee || ''}
                onChange={e => setAnnualFee(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
          </div>
          <div>
            <div className={s.subLabel}>보유 기간</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal"
                value={holdingYears || ''}
                onChange={e => setHoldingYears(parseAmount(e.target.value))} />
              <span className={s.unit}>년</span>
            </div>
          </div>
        </div>
        <div className={s.subLabel} style={{ marginTop: 14 }}>매각 시 잔존가치 (예상)</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal"
            value={resaleValue || ''}
            onChange={e => setResaleValue(parseAmount(e.target.value))} />
          <span className={s.unit}>원</span>
        </div>
        <p className={s.helperText}>회원권 가격의 50~60% 일반 (시세 변동 ±30%)</p>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>② 라운딩 비용</span>
        <div className={s.twoCol}>
          <div>
            <div className={s.subLabel}>비회원 1인당 비용</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal"
                value={nonMemberCost || ''}
                onChange={e => setNonMemberCost(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            {defaultNonMemberCost > 0 && (
              <p className={s.helperText}>오늘 정산 결과 자동 불러옴</p>
            )}
          </div>
          <div>
            <div className={s.subLabel}>회원 1인당 비용</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" inputMode="decimal"
                value={memberRoundCost || ''}
                onChange={e => setMemberRoundCost(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <p className={s.helperText}>회원 그린피 + 카트·캐디·식사</p>
          </div>
        </div>
        <div className={s.subLabel} style={{ marginTop: 14 }}>연 라운딩 횟수</div>
        <div className={s.pills}>
          {ANNUAL_ROUNDS_PRESETS.map(p => (
            <button key={p.value}
              className={`${s.pill} ${annualRounds === p.value ? s.pillActive : ''}`}
              onClick={() => setAnnualRounds(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      <div className={s.hero} style={{ borderColor: result.recoColor + 'aa' }}>
        <div className={s.heroLead}>
          <span style={{ color: result.recoColor, fontWeight: 700 }}>{result.recoLabel}</span>
        </div>
        <div className={s.heroNum} style={{ fontSize: 'clamp(28px, 7vw, 44px)' }}>
          {result.netSaving < 0 ? `회원 ${fmtKrw(Math.abs(result.netSaving))} 절약` : `비회원 ${fmtKrw(Math.abs(result.netSaving))} 절약`}
        </div>
        <div className={s.heroSub}>
          {holdingYears}년 기준 · 연 {annualRounds}회 라운딩
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>📊 회원 vs 비회원 비교 ({holdingYears}년 총)</span>
        <table className={s.breakdownTable}>
          <thead>
            <tr>
              <th scope="col">항목</th>
              <th scope="col" style={{ textAlign: 'right' }}>회원</th>
              <th scope="col" style={{ textAlign: 'right' }}>비회원</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>회원권 가격</td>
              <td className={s.numCell}>{fmtKrw(membershipPrice)}</td>
              <td className={s.numCell}>—</td>
            </tr>
            <tr>
              <td>연회비 ({holdingYears}년)</td>
              <td className={s.numCell}>{fmtKrw(annualFee * holdingYears)}</td>
              <td className={s.numCell}>—</td>
            </tr>
            <tr>
              <td>라운딩 ({annualRounds * holdingYears}회)</td>
              <td className={s.numCell}>{fmtKrw(memberRoundCost * annualRounds * holdingYears)}</td>
              <td className={s.numCell}>{fmtKrw(nonMemberCost * annualRounds * holdingYears)}</td>
            </tr>
            <tr>
              <td>매각 잔존가치</td>
              <td className={s.numCell} style={{ color: '#059669' }}>−{fmtKrw(resaleValue)}</td>
              <td className={s.numCell}>—</td>
            </tr>
            <tr className={s.totalRow}>
              <td>합계</td>
              <td className={s.numCell}>{fmtKrw(result.totalMemberCost)}</td>
              <td className={s.numCell}>{fmtKrw(result.totalNonMemberCost)}</td>
            </tr>
          </tbody>
        </table>
        <div className={s.infoCard} style={{ marginTop: 12 }}>
          💡 연 절약: <strong>{fmtKrw(result.annualSaving)}/년</strong>
          {isFinite(result.breakevenYears) && result.breakevenYears > 0 && (
            <> · 손익분기: 약 <strong>{result.breakevenYears.toFixed(1)}년</strong> ({Math.round(result.breakevenRounds)}회 라운딩)</>
          )}
        </div>
      </div>

      <div className={s.warnCard}>
        <p className={s.warnTitle}>⚠️ 회원권 구매 전 체크리스트</p>
        <ul className={s.warnList}>
          <li>골프장 재무 안정성 확인 (공시·뉴스)</li>
          <li>회원권 시세 (한국증권업협회·증권사)</li>
          <li>부도 시 보호 X (대부분) — 매각 어려움 ↑</li>
          <li>본인 라운딩 빈도 변화 가능 (이직·건강·은퇴)</li>
          <li>변호사·회계사 상담 권장</li>
        </ul>
      </div>
    </>
  )
}

/* ──────────────────────── 내 골프장 탭 ──────────────────────── */
function CoursesTab({
  onApply, currentSnapshot,
}: {
  onApply: (c: SavedGolfCourse) => void
  currentSnapshot: { greenFee: number; cartFee: number; caddieFee: number; mealAmount: number; courseType: string }
}) {
  const [courses, setCourses] = useState<SavedGolfCourse[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    setCourses(loadCourses())
    setHydrated(true)
  }, [])

  const handleSave = () => {
    if (!name.trim()) return
    const newCourse: SavedGolfCourse = {
      id: newId(),
      name: name.trim(),
      type: currentSnapshot.courseType,
      greenFee: currentSnapshot.greenFee,
      cartFee: currentSnapshot.cartFee,
      caddieFee: currentSnapshot.caddieFee,
      defaultMeal: currentSnapshot.mealAmount,
      lastUsed: todayStr(),
    }
    const updated = [newCourse, ...courses]
    setCourses(updated); saveCourses(updated)
    setName('')
  }

  const handleDelete = (id: string) => {
    const updated = courses.filter(c => c.id !== id)
    setCourses(updated); saveCourses(updated)
  }

  const handleApply = (c: SavedGolfCourse) => {
    // 마지막 사용일 갱신
    const updated = courses.map(x =>
      x.id === c.id ? { ...x, lastUsed: todayStr() } : x
    )
    setCourses(updated); saveCourses(updated)
    onApply(c)
  }

  if (!hydrated) return null

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>💾 자주 가는 골프장 저장</span>
        <p className={s.helperText} style={{ marginBottom: 12 }}>
          [오늘 정산] 탭에서 입력한 그린피·카트·캐디 값을 골프장 이름과 함께 저장. 다음 방문 시 한 번의 클릭으로 자동 입력됩니다.
        </p>
        <div className={s.courseSaveRow}>
          <input
            type="text"
            className={s.courseSaveInput}
            placeholder="골프장 이름 (예: 스카이힐 청주)"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={40}
          />
          <button type="button"
            className={s.courseSaveBtn}
            onClick={handleSave} disabled={!name.trim()}>
            💾 현재 값 저장
          </button>
        </div>
        <p className={s.helperText} style={{ marginTop: 8 }}>
          현재 값: 그린피 {fmtKrw(currentSnapshot.greenFee)} · 카트 {fmtKrw(currentSnapshot.cartFee)} · 캐디 {fmtKrw(currentSnapshot.caddieFee)}
        </p>
      </div>

      {courses.length > 0 ? (
        <div className={s.card}>
          <span className={s.cardLabel}>📋 저장된 골프장 ({courses.length}개)</span>
          <div className={s.courseList}>
            {courses.map(c => (
              <div key={c.id} className={s.courseItem}>
                <div className={s.courseInfo}>
                  <div className={s.courseName}>{c.name}</div>
                  <div className={s.courseMeta}>
                    {COURSE_TYPE_LABEL[c.type] ?? c.type} · 그린피 {fmtKrw(c.greenFee)} · 마지막 {c.lastUsed}
                  </div>
                </div>
                <div className={s.courseActions}>
                  <button type="button" className={s.courseApplyBtn}
                    onClick={() => handleApply(c)}>
                    📥 불러오기
                  </button>
                  <button type="button" className={s.courseDelBtn}
                    onClick={() => handleDelete(c.id)} aria-label="삭제">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={s.empty}>
          <strong>아직 저장된 골프장이 없습니다</strong>
          위에서 골프장 이름을 입력하고 저장해 보세요. 모든 데이터는 본인의 브라우저에만 저장됩니다 (서버 전송 X).
        </div>
      )}
    </>
  )
}
