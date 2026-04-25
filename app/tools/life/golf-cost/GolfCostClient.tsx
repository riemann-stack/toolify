'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './golf-cost.module.css'

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
  publicWeekday: { green: 100_000, cart: 40_000,  cartMode: 'team', caddie: 120_000 },
  publicWeekend: { green: 130_000, cart: 40_000,  cartMode: 'team', caddie: 120_000 },
  semiPrivate:   { green: 160_000, cart: 48_000,  cartMode: 'team', caddie: 140_000 },
  private:       { green: 200_000, cart: 0,       cartMode: 'team', caddie: 140_000 },
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
  const [courseType, setCourseType] = useState<CourseType>('publicWeekend')
  const [players, setPlayers] = useState<PlayerCount>(4)

  // 그린피
  const [greenFee, setGreenFee] = useState(130_000)

  // 카트비
  const [cartFee, setCartFee] = useState(40_000)
  const [cartMode, setCartMode] = useState<CartMode>('team')

  // 캐디
  const [caddieEnabled, setCaddieEnabled] = useState(true)
  const [caddieFee, setCaddieFee] = useState(120_000)
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
    lines.push('youtil.kr/tools/life/golf-cost')
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
      {/* 코스 프리셋 */}
      <div className={s.card}>
        <span className={s.cardLabel}>① 골프장 타입</span>
        <div className={s.courseGrid}>
          {COURSE_LABELS.map(c => (
            <button
              key={c.key}
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
              key={n}
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
          <input className={s.numInput} type="number" value={greenFee || ''} onChange={e => setGreenFee(parseAmount(e.target.value))} />
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
          <button className={`${s.toggleBtn} ${cartMode === 'team' ? s.toggleOn : s.toggleOff}`} onClick={() => setCartMode('team')}>팀당</button>
          <button className={`${s.toggleBtn} ${cartMode === 'perPerson' ? s.toggleOn : s.toggleOff}`} onClick={() => setCartMode('perPerson')}>1인당</button>
        </div>
        <div className={`${s.subLabel} ${s.subLabelTop}`}>{cartMode === 'team' ? '팀당 카트비' : '1인당 카트비'}</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" value={cartFee || ''} onChange={e => setCartFee(parseAmount(e.target.value))} />
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
            <button className={`${s.toggleBtn} ${caddieEnabled ? s.toggleOn : s.toggleOff}`} onClick={() => setCaddieEnabled(true)}>있음</button>
            <button className={`${s.toggleBtn} ${!caddieEnabled ? s.toggleOn : s.toggleOff}`} onClick={() => setCaddieEnabled(false)}>노캐디</button>
          </div>
        </div>

        {caddieEnabled ? (
          <>
            <div className={s.subLabel}>팀당 캐디피</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={caddieFee || ''} onChange={e => setCaddieFee(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>

            <div className={`${s.subLabel} ${s.subLabelTop}`}>봉사료(팁)</div>
            <div className={s.pills}>
              {[0, 10_000, 20_000, 30_000].map(v => (
                <button key={v} className={`${s.pill} ${tipAmount === v ? s.pillActive : ''}`} onClick={() => setTipAmount(v)}>
                  {v === 0 ? '없음' : `+${(v / 10_000).toFixed(0)}만원`}
                </button>
              ))}
            </div>
            <div className={s.inputRow} style={{ marginTop: 8 }}>
              <input className={s.numInput} type="number" value={tipAmount || ''} onChange={e => setTipAmount(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
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
          <button className={`${s.toggleBtn} ${mealMode === 'each' ? s.toggleOn : s.toggleOff}`} onClick={() => setMealMode('each')}>각자 결제</button>
          <button className={`${s.toggleBtn} ${mealMode === 'team' ? s.toggleOn : s.toggleOff}`} onClick={() => setMealMode('team')}>팀 일괄</button>
        </div>

        <div className={`${s.subLabel} ${s.subLabelTop}`}>{mealMode === 'each' ? '1인당 식사비' : '팀 식사비 총액'}</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" value={mealAmount || ''} onChange={e => setMealAmount(parseAmount(e.target.value))} />
          <span className={s.unit}>원</span>
        </div>

        <div className={`${s.subLabel} ${s.subLabelTop}`}>그늘집 비용 (팀당)</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" value={shadeAmount || ''} onChange={e => setShadeAmount(parseAmount(e.target.value))} />
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
        <div className={s.courseGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {([
            { key: 'self', label: '자차' },
            { key: 'carpool', label: '카풀' },
            { key: 'bus', label: '버스·셔틀' },
            { key: 'transit', label: '대중교통' },
          ] as { key: TransportMode; label: string }[]).map(m => (
            <button
              key={m.key}
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
                  <input className={s.numInput} type="number" value={tripDistance || ''} onChange={e => setTripDistance(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
                  <span className={s.unit}>km</span>
                </div>
              </div>
              <div>
                <div className={s.subLabel}>연비</div>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" step="0.1" value={efficiency || ''} onChange={e => setEfficiency(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
                  <span className={s.unit}>km/L</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div className={s.subLabel}>유가</div>
              <div className={s.inputRow}>
                <input className={s.numInput} type="number" value={fuelPrice || ''} onChange={e => setFuelPrice(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
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
              <input className={s.numInput} type="number" value={carpoolTotal || ''} onChange={e => setCarpoolTotal(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <div className={s.liveHint}>{players}명이 나누면 1인당 {fmt(carpoolTotal / players)}</div>
          </>
        )}

        {transportMode === 'bus' && (
          <>
            <div className={s.subLabel} style={{ marginTop: 12 }}>1인당 버스·셔틀 요금</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={busPerPerson || ''} onChange={e => setBusPerPerson(parseAmount(e.target.value))} />
              <span className={s.unit}>원</span>
            </div>
            <div className={s.liveHint}>팀 합계 {fmt(busPerPerson * players)}</div>
          </>
        )}

        {transportMode === 'transit' && (
          <>
            <div className={s.subLabel} style={{ marginTop: 12 }}>1인당 대중교통비</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={transitPerPerson || ''} onChange={e => setTransitPerPerson(parseAmount(e.target.value))} />
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
              <input className={s.numInput} type="number" value={glovesCost || ''} onChange={e => setGlovesCost(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
              <span className={s.unit}>원</span>
            </div>
          </div>
          <div>
            <div className={s.subLabel}>로커비</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="number" value={lockerFee || ''} onChange={e => setLockerFee(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
              <span className={s.unit}>원</span>
            </div>
          </div>
        </div>
        <div className={`${s.subLabel} ${s.subLabelTop}`}>기타</div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" value={otherCost || ''} onChange={e => setOtherCost(parseAmount(e.target.value))} style={{ fontSize: 16 }} />
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
            role="button"
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
                  type="number"
                  placeholder="손익(+ / −)"
                  value={betPlayers[i]?.amount || ''}
                  onChange={e => {
                    const next = [...betPlayers]
                    next[i] = { ...next[i], amount: parseAmount(e.target.value) || (e.target.value.startsWith('-') ? -parseAmount(e.target.value) : 0) }
                    // simpler: parse with sign
                    const raw = e.target.value
                    const v = parseFloat(raw.replace(/[^0-9.\-]/g, ''))
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
            role="button"
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
                  type="number"
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
          </>
        )}
      </div>

      {/* ── 결과 ── */}
      <div className={s.hero}>
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
              <th>항목</th>
              <th style={{ textAlign: 'right' }}>팀 총액</th>
              <th style={{ textAlign: 'right' }}>1인당</th>
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

      {/* 면책 */}
      <div className={s.disclaimer}>
        ⛳ 입력값 기반 예상 비용입니다. 실제 비용은 골프장·시즌·요일·코스 컨디션·식음료 메뉴에 따라 크게 달라질 수 있습니다.
      </div>
    </div>
  )
}
