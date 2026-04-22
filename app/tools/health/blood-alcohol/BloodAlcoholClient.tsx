'use client'

import { useState, useMemo } from 'react'
import s from './blood-alcohol.module.css'

type Sex = 'male' | 'female'
type Drink = { id: number; name: string; volume: string; abv: string }

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
  if (bac < 0.1)      return { label: '❌ 면허취소 수준', cls: s.statusDanger,  heroCls: s.heroDanger, numCls: s.heroNumDanger }
  return { label: '❌ 형사처벌 수준', cls: s.statusCrit, heroCls: s.heroDanger, numCls: s.heroNumDanger }
}

const DECAY = 0.015 // g/dL per hour

export default function BloodAlcoholClient() {
  const [sex, setSex] = useState<Sex>('male')
  const [weight, setWeight] = useState('70')
  const [empty, setEmpty] = useState(false)

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
  const emptyFactor = empty ? 1.2 : 1.0

  const totalAlcoholG = useMemo(() => {
    return drinks.reduce((sum, d) => {
      const v = parseFloat(d.volume) || 0
      const a = parseFloat(d.abv) || 0
      return sum + (v * a / 100 * 0.7894)
    }, 0)
  }, [drinks])

  const peakBAC = useMemo(() => {
    if (!weightN || !totalAlcoholG) return 0
    const bac = totalAlcoholG / (weightN * r * 10) * emptyFactor
    return Math.max(0, bac)
  }, [totalAlcoholG, weightN, r, emptyFactor])

  // 시각 계산 (모두 분 단위로 변환)
  const endMin = toMin(endH, endM)
  const nowMin = nowMode === 'end' ? endMin : toMin(nowH, nowM)

  // 현재 BAC (음주 종료 후 경과 시간)
  const elapsedFromEndH = Math.max(0, (nowMin - endMin) / 60)
  const currentBAC = Math.max(0, peakBAC - DECAY * elapsedFromEndH)

  // 기준 도달 시각 (음주 종료 시점부터 계산)
  const suspendHoursFromEnd = peakBAC > 0.03 ? (peakBAC - 0.03) / DECAY : 0
  const revokeHoursFromEnd  = peakBAC > 0.08 ? (peakBAC - 0.08) / DECAY : 0
  const zeroHoursFromEnd    = peakBAC > 0    ? peakBAC / DECAY : 0

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

  // BAC 곡선: 0시간(음주 종료)에 peak, 시간당 -0.015, 0에서 종료
  const linePoints: string[] = []
  const steps = 60
  for (let i = 0; i <= steps; i++) {
    const hr = (i / steps) * maxHours
    const bac = Math.max(0, peakBAC - DECAY * hr)
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

  return (
    <div className={s.wrap}>
      <div className={s.disclaimer}>
        <strong>⚠️ 참고용 도구입니다</strong>
        개인의 신체 상태·음식 섭취량·건강 상태에 따라 실제 BAC와 크게 다를 수 있습니다.
        계산 결과와 관계없이 <strong style={{ color: '#FF6B6B', display: 'inline', margin: 0 }}>음주 후에는 절대 운전하지 마시고</strong> 대리운전 또는 대중교통을 이용하세요.
      </div>

      {/* ── 섹션 1: 신체 정보 ── */}
      <div className={s.card}>
        <span className={s.cardLabel}><span className={s.sectionNum}>1</span>신체 정보</span>

        <div className={s.row2} style={{ marginBottom: '14px' }}>
          <div>
            <label className={s.drinkLabel}>성별</label>
            <div className={s.btnGroup}>
              <button
                className={`${s.toggleBtn} ${sex === 'male' ? s.toggleMale : ''}`}
                onClick={() => setSex('male')}
              >남성 (r=0.68)</button>
              <button
                className={`${s.toggleBtn} ${sex === 'female' ? s.toggleFemale : ''}`}
                onClick={() => setSex('female')}
              >여성 (r=0.55)</button>
            </div>
          </div>
          <div>
            <label className={s.drinkLabel}>공복 여부</label>
            <div className={s.btnGroup}>
              <button
                className={`${s.toggleBtn} ${!empty ? s.toggleActive : ''}`}
                onClick={() => setEmpty(false)}
              >식사 후</button>
              <button
                className={`${s.toggleBtn} ${empty ? s.toggleActive : ''}`}
                onClick={() => setEmpty(true)}
              >공복 (+20%)</button>
            </div>
          </div>
        </div>

        <label className={s.drinkLabel}>체중</label>
        <div className={s.weightRow}>
          <input
            type="number" inputMode="decimal" min={40} max={150}
            className={s.weightInput}
            value={weight} onChange={e => setWeight(e.target.value)}
          />
          <span className={s.weightUnit}>kg</span>
        </div>
        <input
          type="range" min={40} max={150} step={1}
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
              <select className={s.timeSelect} value={startH} onChange={e => setStartH(+e.target.value)}>
                {hourOptions.map(h => <option key={h} value={h}>{pad2(h)}시</option>)}
              </select>
              <span className={s.timeColon}>:</span>
              <select className={s.timeSelect} value={startM} onChange={e => setStartM(+e.target.value)}>
                {minOptions.map(m => <option key={m} value={m}>{pad2(m)}분</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={s.drinkLabel}>음주 종료</label>
            <div className={s.timeRow}>
              <select className={s.timeSelect} value={endH} onChange={e => setEndH(+e.target.value)}>
                {hourOptions.map(h => <option key={h} value={h}>{pad2(h)}시</option>)}
              </select>
              <span className={s.timeColon}>:</span>
              <select className={s.timeSelect} value={endM} onChange={e => setEndM(+e.target.value)}>
                {minOptions.map(m => <option key={m} value={m}>{pad2(m)}분</option>)}
              </select>
            </div>
          </div>
        </div>

        <label className={s.drinkLabel}>현재 시각 (BAC 확인용)</label>
        <div className={s.btnGroup} style={{ marginBottom: '10px' }}>
          <button
            className={`${s.toggleBtn} ${nowMode === 'end' ? s.toggleActive : ''}`}
            onClick={() => setNowMode('end')}
          >음주 종료 시점</button>
          <button
            className={`${s.toggleBtn} ${nowMode === 'custom' ? s.toggleActive : ''}`}
            onClick={() => setNowMode('custom')}
          >직접 입력</button>
        </div>
        {nowMode === 'custom' && (
          <div className={s.timeRow}>
            <select className={s.timeSelect} value={nowH} onChange={e => setNowH(+e.target.value)}>
              {hourOptions.map(h => <option key={h} value={h}>{pad2(h)}시</option>)}
            </select>
            <span className={s.timeColon}>:</span>
            <select className={s.timeSelect} value={nowM} onChange={e => setNowM(+e.target.value)}>
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
            <button key={p.label} className={s.presetBtn} onClick={() => applyPreset(p)}>
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
              <button className={s.drinkDelete} onClick={() => removeDrink(d.id)} aria-label="삭제">×</button>
            </div>
          ))}
        </div>

        <button className={s.addBtn} onClick={addDrink} disabled={drinks.length >= 5}>
          + 주류 추가
        </button>
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
                <div className={`${s.thresholdName} ${s.thresholdNameSuspend}`}>🚫 면허정지 해소</div>
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
                <div className={`${s.thresholdName} ${s.thresholdNameRevoke}`}>❌ 면허취소 해소</div>
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
                  fill="var(--muted)" fontSize="10" fontFamily="Syne" textAnchor="end"
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
                    fill="var(--muted)" fontSize="10" fontFamily="Syne" textAnchor="middle"
                  >
                    +{h}h
                  </text>
                )
              })}
              {/* 기준선 */}
              <line x1={padL} x2={chartW - padR} y1={y003} y2={y003}
                stroke="#FF8C3E" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={chartW - padR - 4} y={y003 - 4}
                fill="#FF8C3E" fontSize="10" fontFamily="Syne" textAnchor="end"
              >
                0.03 면허정지
              </text>
              <line x1={padL} x2={chartW - padR} y1={y008} y2={y008}
                stroke="#FF6B6B" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={chartW - padR - 4} y={y008 - 4}
                fill="#FF6B6B" fontSize="10" fontFamily="Syne" textAnchor="end"
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
              <span><span className={s.legendDot} style={{ background: '#FF8C3E' }}></span>면허정지 0.03</span>
              <span><span className={s.legendDot} style={{ background: '#FF6B6B' }}></span>면허취소 0.08</span>
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
          <div style={{ color: '#3EC8FF', fontWeight: 600, marginTop: '6px' }}>
            💡 가장 안전한 방법은 <strong style={{ color: '#3EC8FF' }}>술자리 시작 전에 미리 대리운전을 예약</strong>하는 것입니다.
          </div>
        </div>
      </div>

      <div className={s.disclaimer}>
        <strong>🚫 음주운전은 범죄입니다</strong>
        BAC 0.03% 이상 면허정지, 0.08% 이상 면허취소·형사처벌 대상입니다.
        본 계산기는 음주 예방 교육 목적이며, 법적 판단 근거로 사용할 수 없습니다.
        본인과 타인의 생명을 지키기 위해 음주 후 운전은 절대 금지입니다.
      </div>
    </div>
  )
}
