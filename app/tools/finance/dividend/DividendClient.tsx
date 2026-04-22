'use client'

import { useState, useMemo, useEffect } from 'react'
import styles from './dividend.module.css'

// ── Formatters ──────────────────────────────────────
function formatKRW(n: number): string {
  if (!isFinite(n) || n <= 0) return '0원'
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

function formatEok(n: number): string {
  if (!isFinite(n) || n <= 0) return '0원'
  if (n >= 100_000_000) {
    const eok = Math.floor(n / 100_000_000)
    const man = Math.floor((n % 100_000_000) / 10_000)
    return man > 0 ? `약 ${eok}억 ${man.toLocaleString('ko-KR')}만원` : `약 ${eok}억원`
  }
  if (n >= 10_000) {
    return `약 ${Math.floor(n / 10_000).toLocaleString('ko-KR')}만원`
  }
  return `약 ${Math.round(n).toLocaleString('ko-KR')}원`
}

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/,/g, ''))
  return isFinite(n) ? n : 0
}

function fmtInput(s: string): string {
  const clean = s.replace(/[^0-9]/g, '')
  if (!clean) return ''
  return parseInt(clean, 10).toLocaleString('ko-KR')
}

// ── Core calc ──────────────────────────────────────
function afterTaxRate(divRate: number, taxRate: number): number {
  return (divRate / 100) * (1 - taxRate / 100)
}

function requiredPrincipal(
  monthlyTarget: number,
  divRate: number,
  taxRate: number,
  safety: number
): number {
  const annual = monthlyTarget * 12
  const atr = afterTaxRate(divRate, taxRate)
  if (atr <= 0) return Infinity
  return (annual * (safety / 100)) / atr
}

function yearsToAchieve(
  currentPrincipal: number,
  requiredPr: number,
  growthRate: number
): number {
  if (growthRate <= 0) return Infinity
  if (currentPrincipal <= 0) return Infinity
  if (currentPrincipal >= requiredPr) return 0
  return Math.log(requiredPr / currentPrincipal) / Math.log(1 + growthRate / 100)
}

function monthsToGoal(pv: number, fv: number, pmt: number, annualRate: number): number {
  if (pv >= fv) return 0
  const r = annualRate / 100 / 12
  if (r === 0) {
    if (pmt <= 0) return Infinity
    return Math.ceil((fv - pv) / pmt)
  }
  if (pmt <= 0 && pv <= 0) return Infinity
  let lo = 1, hi = 1200
  const grow = (n: number) => pv * Math.pow(1 + r, n) + pmt * (Math.pow(1 + r, n) - 1) / r
  if (grow(hi) < fv) return Infinity
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (grow(mid) >= fv) hi = mid
    else lo = mid + 1
  }
  return lo
}

// ── Presets ──────────────────────────────────────
const MONTHLY_PRESETS = [
  { label: '50만원', v: 500000 },
  { label: '100만원', v: 1000000 },
  { label: '200만원', v: 2000000 },
  { label: '300만원', v: 3000000 },
  { label: '500만원', v: 5000000 },
]
const RATE_PRESETS = [3, 4, 4.5, 5, 6, 7]
const TAX_PRESETS = [
  { label: '국내주식', v: 15.4 },
  { label: '해외ETF', v: 15.0 },
  { label: '종합과세(24.2%)', v: 24.2 },
  { label: '종합과세(49.5%)', v: 49.5, warn: true },
]
const SAFETY_PRESETS = [
  { label: '100% 딱 맞게', v: 100 },
  { label: '110% 여유', v: 110 },
  { label: '120% 여유', v: 120 },
  { label: '130% 여유', v: 130 },
]
const COMPARE_RATES = [3.0, 4.0, 4.5, 5.0, 6.0, 7.0, 8.0]

// ============================================================
// Tab 1 — Goal Principal Calculator
// ============================================================
type Tab1Props = {
  onTarget: (target: number) => void
}

function Tab1Goal({ onTarget }: Tab1Props) {
  const [monthly, setMonthly] = useState('1,000,000')
  const [rate, setRate] = useState('4.5')
  const [tax, setTax] = useState('15.4')
  const [safety, setSafety] = useState(100)
  const [current, setCurrent] = useState('')
  const [growth, setGrowth] = useState('0')

  const monthlyV = parseNum(monthly)
  const rateV = parseNum(rate)
  const taxV = parseNum(tax)
  const currentV = parseNum(current)
  const growthV = parseNum(growth)

  const required = useMemo(
    () => requiredPrincipal(monthlyV, rateV, taxV, safety),
    [monthlyV, rateV, taxV, safety]
  )
  const atr = afterTaxRate(rateV, taxV)
  const annualTarget = monthlyV * 12
  const effectiveRate = safety > 0 ? atr * 100 / safety : 0

  // sync to tab 2
  useEffect(() => {
    if (isFinite(required) && required > 0) onTarget(required)
  }, [required, onTarget])

  const additionalNeeded = isFinite(required) ? Math.max(0, required - currentV) : Infinity
  const achievement = isFinite(required) && required > 0
    ? Math.min(100, (currentV / required) * 100)
    : 0

  const yearsGrowth = currentV > 0 && growthV > 0 && isFinite(required)
    ? yearsToAchieve(currentV, required, growthV)
    : Infinity

  const valid = monthlyV > 0 && rateV > 0 && taxV >= 0 && taxV < 100

  return (
    <>
      {/* Monthly target */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>목표 월배당금</label>
        <div className={styles.inputRow}>
          <input
            className={`${styles.numInput} ${styles.numInputBig}`}
            type="text" inputMode="numeric"
            placeholder="1,000,000"
            value={monthly}
            onChange={e => setMonthly(fmtInput(e.target.value))}
          />
          <span className={styles.unit}>원</span>
        </div>
        {monthlyV > 0 && (
          <div className={styles.liveHint}>{formatEok(monthlyV)} / 월</div>
        )}
        <div className={styles.presets}>
          {MONTHLY_PRESETS.map(p => (
            <button key={p.v} type="button"
              className={`${styles.presetBtn} ${monthlyV === p.v ? styles.presetActive : ''}`}
              onClick={() => setMonthly(p.v.toLocaleString('ko-KR'))}
            >{p.label}</button>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Rate */}
        <div className={styles.card}>
          <label className={styles.cardLabel}>예상 연 배당수익률</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="4.5" step={0.1} min={0.1} max={30}
              value={rate} onChange={e => setRate(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          <div className={styles.presets}>
            {RATE_PRESETS.map(r => (
              <button key={r} type="button"
                className={`${styles.presetBtn} ${rateV === r ? styles.presetActive : ''}`}
                onClick={() => setRate(String(r))}
              >{r}%</button>
            ))}
          </div>
        </div>

        {/* Tax */}
        <div className={styles.card}>
          <label className={styles.cardLabel}>배당소득세율</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="15.4" step={0.1} min={0} max={99}
              value={tax} onChange={e => setTax(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          <div className={styles.presets}>
            {TAX_PRESETS.map(p => (
              <button key={p.label} type="button"
                className={`${styles.presetBtn} ${p.warn ? styles.presetWarn : ''} ${taxV === p.v ? styles.presetActive : ''}`}
                onClick={() => setTax(String(p.v))}
                title={p.warn ? '금융소득 종합과세 최고세율' : ''}
              >{p.label}{p.warn ? ' ⚠️' : ''}</button>
            ))}
          </div>
          <p className={styles.cardDesc}>
            국내주식 15.4%(배당소득세 14% + 지방세 1.4%) · 해외ETF 15.0% · 금융소득 2,000만원 초과 시 종합과세.
          </p>
        </div>
      </div>

      {/* Safety factor */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>목표 안전계수 (배당 삭감·공백기 대비)</label>
        <div className={styles.presets}>
          {SAFETY_PRESETS.map(p => (
            <button key={p.v} type="button"
              className={`${styles.presetBtn} ${safety === p.v ? styles.presetActive : ''}`}
              onClick={() => setSafety(p.v)}
            >{p.label}</button>
          ))}
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Current */}
        <div className={styles.card}>
          <label className={styles.cardLabel}>현재 투자금 (선택)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="text" inputMode="numeric"
              placeholder="50,000,000"
              value={current}
              onChange={e => setCurrent(fmtInput(e.target.value))} />
            <span className={styles.unit}>원</span>
          </div>
          {currentV > 0 && (
            <div className={styles.liveHint}>{formatEok(currentV)}</div>
          )}
        </div>

        {/* Growth */}
        <div className={styles.card}>
          <label className={styles.cardLabel}>배당 성장률 (% / 년) — 선택</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="0" step={0.5} min={0} max={50}
              value={growth} onChange={e => setGrowth(e.target.value)} />
            <span className={styles.unit}>%</span>
          </div>
          <p className={styles.cardDesc}>매년 배당이 이만큼 성장한다고 가정</p>
        </div>
      </div>

      {/* ── Results ── */}
      {valid && isFinite(required) ? (
        <>
          <div className={styles.hero}>
            <div className={styles.heroLead}>
              월 <strong style={{ color: 'var(--text)' }}>{formatKRW(monthlyV)}</strong>의 배당금을 받으려면
            </div>
            <div className={styles.heroNum}>{formatKRW(required)}</div>
            <div className={styles.heroSub}>{formatEok(required)} 필요</div>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>세전 배당수익률</div>
              <div className={styles.metricValue}>{rateV.toFixed(2)}%</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>세후 배당수익률</div>
              <div className={`${styles.metricValue} ${styles.metricValueAccent}`}>{(atr * 100).toFixed(2)}%</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>연간 필요 배당금</div>
              <div className={styles.metricValue}>{formatKRW(annualTarget)}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>실효 수익률 (안전계수 반영)</div>
              <div className={styles.metricValue}>{effectiveRate.toFixed(2)}%</div>
            </div>
          </div>

          {currentV > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>현재 {formatEok(currentV)} 투자 중이라면</label>
              {additionalNeeded > 0 ? (
                <>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--accent)' }}>
                    추가 필요 {formatKRW(additionalNeeded)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    {formatEok(additionalNeeded)} 더 모아야 합니다
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 800, color: '#3EFF9B' }}>
                  🎉 이미 목표 달성!
                </div>
              )}
              <div className={styles.progressRow}>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${achievement}%` }} />
                </div>
                <div className={styles.progressPct}>{achievement.toFixed(1)}%</div>
              </div>
            </div>
          )}

          {currentV > 0 && growthV > 0 && isFinite(yearsGrowth) && yearsGrowth > 0 && (
            <div className={styles.noticeAccent}>
              <p>
                연 <strong>{growthV}%</strong> 배당 성장 시 →
                현재 원금 {formatEok(currentV)}이 <strong>{yearsGrowth.toFixed(1)}년 후</strong> 목표 수익률에 도달합니다.
              </p>
            </div>
          )}

          <div className={styles.interpret}>
            <p><strong>💡 해석:</strong> 월배당 목표는 배당수익률보다 <strong>세후 수익률</strong> 기준으로 보는 것이 더 현실적입니다.</p>
            <p>이 계산은 현재 배당수익률이 유지된다고 가정합니다.</p>
          </div>

          {/* Comparison table */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>배당수익률별 필요 원금 비교</label>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>연 배당수익률</span>
                <span>세후 수익률</span>
                <span>필요 원금</span>
              </div>
              {COMPARE_RATES.map(r => {
                const req = requiredPrincipal(monthlyV, r, taxV, safety)
                const at = afterTaxRate(r, taxV) * 100
                const isActive = Math.abs(r - rateV) < 0.01
                const isWarn = r >= 8
                return (
                  <div key={r}
                    className={`${styles.tableRow} ${isActive ? styles.tableRowActive : ''} ${isWarn ? styles.tableRowWarn : ''}`}>
                    <span className={styles.tableCell}>{r.toFixed(1)}%{isWarn ? ' ⚠️' : ''}</span>
                    <span className={styles.tableCell}>{at.toFixed(2)}%</span>
                    <span className={styles.tableCellRight}>{formatEok(req)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.disclaimer}>
            배당금은 기업 실적·배당 정책·환율·세금 변화에 따라 달라질 수 있습니다.
            이 계산기는 현재 조건이 유지된다는 가정 하의 추정치이며 투자 권유가 아닙니다.
          </div>
        </>
      ) : (
        <div className={styles.empty}>목표 월배당금과 배당수익률을 입력하세요</div>
      )}
    </>
  )
}

// ============================================================
// Tab 2 — Monthly Accumulation Plan
// ============================================================
type Tab2Props = {
  linkedTarget: number
}

const MONTHLY_SAVE_PRESETS = [500000, 1000000, 2000000, 3000000]

function Tab2Plan({ linkedTarget }: Tab2Props) {
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [saving, setSaving] = useState('1,000,000')
  const [ret, setRet] = useState('7')
  const [manual, setManual] = useState(false)

  // auto-sync from tab1 unless user manually edited
  useEffect(() => {
    if (!manual && linkedTarget > 0) {
      setTarget(Math.round(linkedTarget).toLocaleString('ko-KR'))
    }
  }, [linkedTarget, manual])

  const targetV = parseNum(target)
  const currentV = parseNum(current)
  const savingV = parseNum(saving)
  const retV = parseNum(ret)

  const months = useMemo(
    () => monthsToGoal(currentV, targetV, savingV, retV),
    [currentV, targetV, savingV, retV]
  )

  const years = Math.floor(months / 12)
  const remainMonth = months % 12

  const now = new Date()
  const achieveDate = new Date(now.getFullYear(), now.getMonth() + months, 1)
  const achieveLabel = `${achieveDate.getFullYear()}년 ${achieveDate.getMonth() + 1}월`

  const totalSaved = currentV + savingV * months
  const interest = targetV - totalSaved
  const valid = targetV > 0 && savingV > 0 && isFinite(months)

  const principalRatio = valid && targetV > 0 ? totalSaved / targetV : 0
  const interestRatio = valid && targetV > 0 ? Math.max(0, interest) / targetV : 0

  return (
    <>
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          목표 투자 원금 {linkedTarget > 0 && !manual && (
            <span style={{ color: 'var(--accent)', fontSize: '10px', marginLeft: '6px' }}>
              ← 탭1 자동 연동
            </span>
          )}
        </label>
        <div className={styles.inputRow}>
          <input className={`${styles.numInput} ${styles.numInputBig}`} type="text" inputMode="numeric"
            placeholder="315,000,000"
            value={target}
            onChange={e => { setManual(true); setTarget(fmtInput(e.target.value)) }} />
          <span className={styles.unit}>원</span>
        </div>
        {targetV > 0 && <div className={styles.liveHint}>{formatEok(targetV)}</div>}
      </div>

      <div className={styles.twoCol}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>현재 보유 금액</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="text" inputMode="numeric"
              placeholder="0"
              value={current}
              onChange={e => setCurrent(fmtInput(e.target.value))} />
            <span className={styles.unit}>원</span>
          </div>
          {currentV > 0 && <div className={styles.liveHint}>{formatEok(currentV)}</div>}
        </div>

        <div className={styles.card}>
          <label className={styles.cardLabel}>월 적립액</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="text" inputMode="numeric"
              placeholder="1,000,000"
              value={saving}
              onChange={e => setSaving(fmtInput(e.target.value))} />
            <span className={styles.unit}>원</span>
          </div>
          <div className={styles.presets}>
            {MONTHLY_SAVE_PRESETS.map(v => (
              <button key={v} type="button"
                className={`${styles.presetBtn} ${savingV === v ? styles.presetActive : ''}`}
                onClick={() => setSaving(v.toLocaleString('ko-KR'))}
              >{(v / 10_000).toLocaleString()}만</button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>연 수익률 (배당 + 시세차익 가정)</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="decimal"
            placeholder="7" step={0.1} min={0} max={30}
            value={ret} onChange={e => setRet(e.target.value)} />
          <span className={styles.unit}>%</span>
        </div>
        <div className={styles.presets}>
          {[3, 5, 7, 10, 12].map(r => (
            <button key={r} type="button"
              className={`${styles.presetBtn} ${retV === r ? styles.presetActive : ''}`}
              onClick={() => setRet(String(r))}
            >{r}%</button>
          ))}
        </div>
      </div>

      {valid ? (
        <>
          <div className={styles.hero}>
            <div className={styles.heroLead}>목표 달성까지 예상 기간</div>
            <div className={styles.heroNum}>
              {years > 0 ? `${years}년 ` : ''}{remainMonth}개월
            </div>
            <div className={styles.heroSub}>달성 예상: {achieveLabel}</div>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>총 납입 원금</div>
              <div className={styles.metricValue}>{formatEok(totalSaved)}</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>복리 수익</div>
              <div className={`${styles.metricValue} ${styles.metricValueAccent}`}>
                {interest > 0 ? formatEok(interest) : '0원'}
              </div>
            </div>
          </div>

          {/* Pie */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>원금 vs 수익 비율</label>
            <div className={styles.pieWrap}>
              <PieChart principalRatio={principalRatio} interestRatio={interestRatio} />
              <div className={styles.pieLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: 'var(--accent)' }} />
                  <div>
                    <div className={styles.legendLabel}>납입 원금</div>
                    <div>
                      <span className={styles.legendValue}>{(principalRatio * 100).toFixed(1)}%</span>
                      <span className={styles.legendLabel}> · {formatEok(totalSaved)}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#3EFF9B' }} />
                  <div>
                    <div className={styles.legendLabel}>복리 수익</div>
                    <div>
                      <span className={styles.legendValue}>{(interestRatio * 100).toFixed(1)}%</span>
                      <span className={styles.legendLabel}> · {interest > 0 ? formatEok(interest) : '0원'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>월 적립액별 비교</label>
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>월 적립</span>
                <span>달성 기간</span>
                <span>달성 시기</span>
              </div>
              {MONTHLY_SAVE_PRESETS.map(v => {
                const m = monthsToGoal(currentV, targetV, v, retV)
                const y = Math.floor(m / 12)
                const rm = m % 12
                const isActive = savingV === v
                if (!isFinite(m)) {
                  return (
                    <div key={v} className={`${styles.tableRow} ${isActive ? styles.tableRowActive : ''}`}>
                      <span className={styles.tableCell}>{(v / 10_000).toLocaleString()}만원</span>
                      <span className={styles.tableCell}>—</span>
                      <span className={styles.tableCellRight}>달성 불가</span>
                    </div>
                  )
                }
                const d = new Date(now.getFullYear(), now.getMonth() + m, 1)
                return (
                  <div key={v} className={`${styles.tableRow} ${isActive ? styles.tableRowActive : ''}`}>
                    <span className={styles.tableCell}>{(v / 10_000).toLocaleString()}만원</span>
                    <span className={styles.tableCell}>{y > 0 ? `${y}년 ` : ''}{rm}개월</span>
                    <span className={styles.tableCellRight}>{d.getFullYear()}년 {d.getMonth() + 1}월</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.disclaimer}>
            연 수익률은 가정치입니다. 실제 시장 수익률은 매년 변동하며, 특히 단기 구간에서 편차가 큽니다.
            세금·수수료·인플레이션은 반영되지 않은 명목 수익 기준입니다.
          </div>
        </>
      ) : (
        <div className={styles.empty}>목표 원금과 월 적립액을 입력하세요</div>
      )}
    </>
  )
}

// ── Pie ──
function PieChart({ principalRatio, interestRatio }: { principalRatio: number; interestRatio: number }) {
  const size = 140
  const r = 60
  const cx = size / 2
  const cy = size / 2
  const total = principalRatio + interestRatio
  if (total <= 0) {
    return (
      <svg width={size} height={size} className={styles.pieSvg}>
        <circle cx={cx} cy={cy} r={r} fill="var(--bg3)" />
      </svg>
    )
  }
  const pRatio = principalRatio / total
  const angle = pRatio * Math.PI * 2
  const x = cx + r * Math.sin(angle)
  const y = cy - r * Math.cos(angle)
  const large = angle > Math.PI ? 1 : 0
  const pPath = `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x} ${y} Z`

  return (
    <svg width={size} height={size} className={styles.pieSvg}>
      <circle cx={cx} cy={cy} r={r} fill="#3EFF9B" />
      <path d={pPath} fill="var(--accent)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg2)" strokeWidth={2} />
    </svg>
  )
}

// ============================================================
// Root
// ============================================================
export default function DividendClient() {
  const [tab, setTab] = useState<'goal' | 'plan'>('goal')
  const [linkedTarget, setLinkedTarget] = useState(0)

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button type="button"
          className={`${styles.tabBtn} ${tab === 'goal' ? styles.tabActive : ''}`}
          onClick={() => setTab('goal')}>
          🎯 목표 원금 계산
        </button>
        <button type="button"
          className={`${styles.tabBtn} ${tab === 'plan' ? styles.tabActive : ''}`}
          onClick={() => setTab('plan')}>
          📈 월 적립 계획
        </button>
      </div>

      {tab === 'goal'
        ? <Tab1Goal onTarget={setLinkedTarget} />
        : <Tab2Plan linkedTarget={linkedTarget} />
      }
    </div>
  )
}
