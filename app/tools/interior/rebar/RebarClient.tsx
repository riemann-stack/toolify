/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './rebar.module.css'
import {
  REBAR_SIZES, REBAR_DATA, STANDARD_LENGTHS, STRENGTH_META,
  TRUCKS, REBAR_PLANS,
  type RebarSize, type Strength, type StandardLength,
  totalWeight, withLoss, tyingWire, calcPrice, perPiece,
  weightToCount, budgetToWeight, truckTrips, fmt, fmtKg,
} from './rebarUtils'

type Tab = 'calc' | 'reverse' | 'truck' | 'plan'

const STORAGE_KEY = 'youtil_rebar_v1'

export default function RebarClient() {
  const [tab, setTab] = useState<Tab>('calc')

  /* 공통 */
  const [size, setSize] = useState<RebarSize>('D13')
  const [strength, setStrength] = useState<Strength>('SD400')
  const [pricePerTon, setPricePerTon] = useState('100')

  /* 탭 1 */
  const [lengthMode, setLengthMode] = useState<'standard' | 'custom'>('standard')
  const [standardLen, setStandardLen] = useState<StandardLength>(6)
  const [customLen, setCustomLen] = useState('6')
  const [count, setCount] = useState('100')
  const [lossPct, setLossPct] = useState('5')
  const [withTying, setWithTying] = useState(true)

  /* 탭 2 */
  const [revMode, setRevMode] = useState<'weight' | 'budget'>('weight')
  const [revTons, setRevTons] = useState('1')
  const [revBudget, setRevBudget] = useState('100')
  const [revLength, setRevLength] = useState<StandardLength>(6)

  /* 탭 3 */
  const [shipKg, setShipKg] = useState('5000')
  const [shipMaxLen, setShipMaxLen] = useState<StandardLength>(6)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.size && REBAR_SIZES.includes(j.size)) setSize(j.size)
      if (j.strength in STRENGTH_META) setStrength(j.strength)
      if (typeof j.pricePerTon === 'string') setPricePerTon(j.pricePerTon)
      if ((STANDARD_LENGTHS as readonly number[]).includes(j.standardLen)) setStandardLen(j.standardLen)
      if (typeof j.count === 'string') setCount(j.count)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        size, strength, pricePerTon, standardLen, count,
      }))
    } catch {}
  }, [size, strength, pricePerTon, standardLen, count])

  /* 계산 */
  const data = REBAR_DATA[size]
  const length = lengthMode === 'standard' ? standardLen : Math.max(0, parseFloat(customLen) || 0)
  const countN = Math.max(0, parseInt(count) || 0)
  const lossPctN = Math.max(0, parseFloat(lossPct) || 0)
  const priceTon = Math.max(0, parseFloat(pricePerTon) || 0)

  const baseKg = useMemo(() => totalWeight(size, length, countN), [size, length, countN])
  const lossKg = useMemo(() => withLoss(baseKg, lossPctN), [baseKg, lossPctN])
  const tyingKg = useMemo(() => tyingWire(lossKg), [lossKg])
  const finalKg = withTying ? lossKg + tyingKg : lossKg
  // 가격은 철근(로스 포함)만 — 결속선은 별도 품목이라 철근 톤단가·강도 보정 대상 아님
  const priceMan = useMemo(() => calcPrice(lossKg, priceTon, strength), [lossKg, priceTon, strength])
  const piece = perPiece(size, length)

  /* 탭 2 */
  const targetKg = revMode === 'weight'
    ? Math.max(0, parseFloat(revTons) || 0) * 1000
    : budgetToWeight(Math.max(0, parseFloat(revBudget) || 0), priceTon, strength)

  /* 탭 3 */
  const shipKgN = Math.max(0, parseFloat(shipKg) || 0)
  const availableTrucks = TRUCKS.filter((t) => t.maxLengthM >= shipMaxLen)

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/interior/wallpaper', label: '도배 소요량' },
          { href: '/tools/interior/paint', label: '페인트 계산' },
          { href: '/tools/interior/room-area', label: '방 면적 계산' }
        ]}
      >
        사용·시공 안내 표시 단위중량은 <strong>KS D 3504 표준치</strong>이며, 제조사·롯트별 ±5% 오차 가능. 가격은 사용자 입력 또는 일반 참고치 — <strong>한국철강협회·시세 우선</strong>. 구조 설계·배근 도면은 반드시 <strong>구조기술사·건축사 책임</strong>입니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="철근 계산 모드">
        {([
          { id: 'calc',    label: '본수→중량' },
          { id: 'reverse', label: '중량→본수' },
          { id: 'truck',   label: '트럭·운반' },
          { id: 'plan',    label: '배근 가이드' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 탭 1: 본수 → 중량 ════════ */}
      {tab === 'calc' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>철근 규격 (KS D 3504)</span>
            <div className={s.pillRow}>
              {REBAR_SIZES.map((b) => (
                <button
                  key={b}
                  aria-pressed={size === b}
                  className={`${s.pill} ${size === b ? s.pillActive : ''}`}
                  onClick={() => setSize(b)}
                  type="button"
                >
                  {b} ({fmt(REBAR_DATA[b].weightPerM, 2)} kg/m)
                </button>
              ))}
            </div>
            <div className={s.helpText}>
              공칭 직경 <strong>{data.diameter} mm</strong> · 단면적{' '}
              <strong>{fmt(data.area, 1)} mm²</strong> · 1m 중량{' '}
              <strong className={s.cellAccent}>{fmt(data.weightPerM, 3)} kg</strong>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>길이 · 본수 입력</span>

            <div className={s.field}>
              <label className={s.fieldLabel}>길이 모드</label>
              <div className={s.pillRow}>
                <button
                  aria-pressed={lengthMode === 'standard'}
                  className={`${s.pill} ${lengthMode === 'standard' ? s.pillActive : ''}`}
                  onClick={() => setLengthMode('standard')}
                  type="button"
                >
                  표준 길이
                </button>
                <button
                  aria-pressed={lengthMode === 'custom'}
                  className={`${s.pill} ${lengthMode === 'custom' ? s.pillActive : ''}`}
                  onClick={() => setLengthMode('custom')}
                  type="button"
                >
                  직접 입력
                </button>
              </div>
            </div>

            {lengthMode === 'standard' ? (
              <div className={s.field}>
                <label className={s.fieldLabel}>표준 길이 (m)</label>
                <div className={s.pillRow}>
                  {STANDARD_LENGTHS.map((l) => (
                    <button
                      key={l}
                      aria-pressed={standardLen === l}
                      className={`${s.pill} ${standardLen === l ? s.pillActive : ''}`}
                      onClick={() => setStandardLen(l)}
                      type="button"
                    >
                      {l}m
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="rebar-length">길이 (m)</label>
                <input id="rebar-length"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={customLen}
                  onChange={(e) => setCustomLen(e.target.value)}
                  min={0.1}
                  max={50}
                  step={0.1}
                />
              </div>
            )}

            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="rebar-f2">본수 (개)</label>
                <input id="rebar-f2"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min={1}
                  max={100000}
                  step={1}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="rebar-f3">절단 로스율 (%)</label>
                <input id="rebar-f3"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={lossPct}
                  onChange={(e) => setLossPct(e.target.value)}
                  min={0}
                  max={20}
                  step={0.5}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[0, 3, 5, 7, 10].map((p) => (
                    <button key={p} className={s.pill} onClick={() => setLossPct(String(p))} type="button">
                      {p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label htmlFor="rebar-tying" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)', cursor: 'pointer', marginTop: 6 }}>
              <input
                id="rebar-tying"
                type="checkbox"
                checked={withTying}
                onChange={(e) => setWithTying(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              결속선 자동 포함 (철근 1톤당 약 6.5kg)
            </label>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>강도 등급 · 단가</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>강도 등급 (가격 보정)</label>
                <div className={s.pillRow}>
                  {(Object.keys(STRENGTH_META) as Strength[]).map((st) => (
                    <button
                      key={st}
                      aria-pressed={strength === st}
                      className={`${s.pill} ${strength === st ? s.pillActive : ''}`}
                      onClick={() => setStrength(st)}
                      type="button"
                    >
                      {st} (×{STRENGTH_META[st].priceFactor})
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="rebar-sd400">SD400 톤당 단가 (만원)</label>
                <input id="rebar-sd400"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={pricePerTon}
                  onChange={(e) => setPricePerTon(e.target.value)}
                  min={50}
                  max={300}
                  step={5}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[80, 100, 120, 150].map((p) => (
                    <button key={p} className={s.pill} onClick={() => setPricePerTon(String(p))} type="button">
                      {p}만원
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 메인 결과 */}
          <div className={s.hero} role="status">
            <p className={s.heroLabel}>{size} · {length}m × {countN}본</p>
            <p className={s.heroValue}>
              총 중량 <strong>{fmtKg(finalKg)}</strong>
            </p>
            <p className={s.heroSub}>
              철근 예상 가격{' '}
              <strong style={{ color: 'var(--accent)' }}>
                {fmt(priceMan, 1)} 만원
              </strong>
              {' · '}1본 무게{' '}
              <strong style={{ color: 'var(--text)' }}>{fmt(piece, 2)} kg</strong>
            </p>
          </div>

          {/* 상세표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>계산 상세</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>1m당 중량</td><td className={s.cellMono}>{fmt(data.weightPerM, 3)} kg</td></tr>
                  <tr><td>1본 ({length}m) 무게</td><td className={s.cellMono}>{fmt(piece, 2)} kg</td></tr>
                  <tr><td>총 길이</td><td className={s.cellMono}>{fmt(length * countN, 1)} m</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>중량</td></tr>
                  <tr><td>기본 총 중량</td><td className={s.cellMono}>{fmt(baseKg, 1)} kg</td></tr>
                  <tr><td>+ 절단 로스 ({lossPctN}%)</td><td className={s.cellMono}>{fmt(lossKg - baseKg, 1)} kg</td></tr>
                  {withTying && (
                    <tr><td>+ 결속선 (톤당 6.5kg)</td><td className={s.cellMono}>{fmt(tyingKg, 1)} kg</td></tr>
                  )}
                  <tr><td>발주 권장 중량</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmtKg(finalKg)}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>가격 (참고치 — 철근만, 결속선 별도)</td></tr>
                  <tr><td>SD400 톤당</td><td className={s.cellMono}>{priceTon} 만원</td></tr>
                  <tr><td>{strength} 보정</td><td className={s.cellMono}>×{STRENGTH_META[strength].priceFactor}</td></tr>
                  <tr><td>철근 예상 총액 ({fmt(lossKg, 1)} kg)</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(priceMan, 1)} 만원</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>발주 팁</strong>
            <p>
              • 절단 로스는 일반 현장 <strong>5~10%</strong> 권장 (설계 도면대로 시공 시 5%, 임의 절단 다발 시 10%)<br />
              • 결속선(#18~#21)은 표준품셈상 <strong>철근 1톤당 약 5~8kg</strong>(간단 5·보통 6.5·복잡 8kg)<br />
              • 가격은 시기·시세에 따라 변동 → <strong>한국철강협회·POSCO·현대제철 시세</strong> 참고<br />
              • SD500/SD600 고강도는 SD400 대비 10~20% 더 비쌈
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 중량 → 본수 ════════ */}
      {tab === 'reverse' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>역계산 모드</span>
            <div className={s.pillRow}>
              <button
                aria-pressed={revMode === 'weight'}
                className={`${s.pill} ${revMode === 'weight' ? s.pillActive : ''}`}
                onClick={() => setRevMode('weight')}
                type="button"
              >
                목표 톤수로 계산
              </button>
              <button
                aria-pressed={revMode === 'budget'}
                className={`${s.pill} ${revMode === 'budget' ? s.pillActive : ''}`}
                onClick={() => setRevMode('budget')}
                type="button"
              >
                예산으로 계산
              </button>
            </div>

            <div className={s.row2}>
              {revMode === 'weight' ? (
                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="rebar-goal">목표 중량 (톤)</label>
                  <input id="rebar-goal"
                    type="number" inputMode="decimal"
                    className={s.input}
                    value={revTons}
                    onChange={(e) => setRevTons(e.target.value)}
                    min={0.1}
                    max={100}
                    step={0.1}
                  />
                  <div className={s.pillRow} style={{ marginTop: 8 }}>
                    {[0.5, 1, 2, 5, 10].map((t) => (
                      <button key={t} className={s.pill} onClick={() => setRevTons(String(t))} type="button">
                        {t}톤
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="rebar-budget">예산 (만원)</label>
                  <input id="rebar-budget"
                    type="number" inputMode="decimal"
                    className={s.input}
                    value={revBudget}
                    onChange={(e) => setRevBudget(e.target.value)}
                    min={1}
                    max={100000}
                    step={10}
                  />
                  <div className={s.pillRow} style={{ marginTop: 8 }}>
                    {[50, 100, 300, 500, 1000].map((b) => (
                      <button key={b} className={s.pill} onClick={() => setRevBudget(String(b))} type="button">
                        {b}만원
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={s.field}>
                <label className={s.fieldLabel}>철근 길이 (m)</label>
                <div className={s.pillRow}>
                  {STANDARD_LENGTHS.map((l) => (
                    <button
                      key={l}
                      aria-pressed={revLength === l}
                      className={`${s.pill} ${revLength === l ? s.pillActive : ''}`}
                      onClick={() => setRevLength(l)}
                      type="button"
                    >
                      {l}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={s.hero} role="status">
            <p className={s.heroLabel}>
              {revMode === 'weight' ? `${revTons}톤` : `${revBudget}만원`} ·{' '}
              {revLength}m 길이 기준
            </p>
            <p className={s.heroValue}>
              ≈ <strong>{fmtKg(targetKg)}</strong>
            </p>
            <p className={s.heroSub}>
              {revMode === 'budget' && (priceTon > 0
                ? `${strength} ${priceTon}만원/톤 기준`
                : '⚠️ 본수→중량 탭에서 톤당 단가를 먼저 입력하세요')}
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>규격별 본수 매트릭스</span>
            <div className={s.tableScroll}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th scope="col">규격</th>
                    <th scope="col">kg/m</th>
                    <th scope="col">1본({revLength}m)</th>
                    <th scope="col">{fmtKg(targetKg)} 본수</th>
                  </tr>
                </thead>
                <tbody>
                  {REBAR_SIZES.map((b) => {
                    const perBar = perPiece(b, revLength)
                    const cnt = weightToCount(targetKg, b, revLength)
                    return (
                      <tr key={b}>
                        <td className={s.cellMono}>{b}</td>
                        <td className={s.cellMono}>{fmt(REBAR_DATA[b].weightPerM, 3)}</td>
                        <td className={s.cellMono}>{fmt(perBar, 1)} kg</td>
                        <td className={`${s.cellMono} ${s.cellAccent}`}>{cnt.toLocaleString()} 본</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>활용 팁</strong>
            <p>
              • 같은 1톤이라도 D10은 약 <strong>298본</strong>, D25는 약 <strong>42본</strong><br />
              • 운반 차량 적재 한도 기준 본수 미리 가늠<br />
              • 고철 매도 시 추정에도 활용 — 철근 1톤은 시세에 따라 약 25~50만원 (등락 큼)
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 트럭·운반 ════════ */}
      {tab === 'truck' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>운반할 철근</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="rebar-kg">총 중량 (kg)</label>
                <input id="rebar-kg"
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={shipKg}
                  onChange={(e) => setShipKg(e.target.value)}
                  min={100}
                  max={500000}
                  step={100}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[1000, 2500, 5000, 10000, 20000].map((k) => (
                    <button key={k} className={s.pill} onClick={() => setShipKg(String(k))} type="button">
                      {k.toLocaleString()}kg
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>최대 철근 길이 (m)</label>
                <div className={s.pillRow}>
                  {STANDARD_LENGTHS.map((l) => (
                    <button
                      key={l}
                      aria-pressed={shipMaxLen === l}
                      className={`${s.pill} ${shipMaxLen === l ? s.pillActive : ''}`}
                      onClick={() => setShipMaxLen(l)}
                      type="button"
                    >
                      {l}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>트럭별 추천</span>
            <div className={s.truckGrid}>
              {TRUCKS.map((t) => {
                const trips = truckTrips(shipKgN, t.id)
                const canCarry = t.maxLengthM >= shipMaxLen
                return (
                  <div
                    key={t.id}
                    className={`${s.truckCard} ${!canCarry ? s.truckDisabled : ''}`}
                  >
                    <p className={s.truckTitle}>
                      {t.emoji} {t.label}
                    </p>
                    <p className={s.truckCap}>
                      적재 <strong>{t.capacityKg.toLocaleString()} kg</strong>
                    </p>
                    <p className={s.truckLen}>
                      최대 길이 <strong>{t.maxLengthM}m</strong>
                    </p>
                    {canCarry ? (
                      <p className={s.truckTrips}>
                        필요 회차{' '}
                        <strong className={s.cellAccent}>{trips}회</strong>
                      </p>
                    ) : (
                      <p className={s.truckTrips} style={{ color: '#DB2777' }}>
                        ❌ 길이 초과
                      </p>
                    )}
                    <p className={s.truckCost}>운반비 {t.costRange}</p>
                    <p className={s.truckNote}>{t.note}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>트럭 선정 팁</strong>
            <p>
              • <strong>1톤 트럭</strong>은 6m 철근 적재 길이 가능 (적재함 위로 살짝 돌출 가능)<br />
              • <strong>12m 철근</strong>은 5톤 카고 이상 필수, 적재 결박 강하게<br />
              • 회차가 많아지면 5톤 1회보다 11톤 1회가 경제적인 경우 多<br />
              • 운반비는 거리·시기·결박 작업 포함 여부로 변동<br />
              • {availableTrucks.length === 0 && '⚠️ 선택한 길이를 운반할 수 있는 트럭이 없습니다 — 절단 필요'}
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 배근 가이드 ════════ */}
      {tab === 'plan' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>소형 비구조물 참고 배근 예시 4가지 (시공은 전문가 확인 필수)</span>
            <div className={s.planGrid}>
              {REBAR_PLANS.map((p) => (
                <div key={p.id} className={s.planCard}>
                  <p className={s.planTitle}>{p.emoji} {p.label}</p>
                  <p className={s.planSpec}>{p.spec}</p>
                  <div className={s.planSpecs}>
                    <span>피복 <b>{p.cover} mm</b></span>
                    <span>1m²당 <b>{p.perM2} m</b></span>
                    <span>1m² 무게 <b>{fmt(p.perM2 * REBAR_DATA[p.size].weightPerM, 1)} kg</b></span>
                  </div>
                  <p className={s.planDesc}>{p.desc}</p>
                  <p className={s.planCaution}>⚠️ {p.caution}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>배근 기본 원칙</strong>
            <p>
              • <strong>피복두께</strong>: 콘크리트 표면에서 철근까지 거리. 옥내 30~40mm, 옥외 50mm, 토중 70mm 이상.<br />
              • <strong>이음 길이</strong>: 일반 40d (D10이면 400mm), 인장은 60d 이상.<br />
              • <strong>결속</strong>: 교차점은 모두 결속선으로 묶음 (간격 1m마다 1회).<br />
              • <strong>스페이서</strong>: 1m²당 5~8개 사용해 피복두께 유지.<br />
              • 구조 부재(주택 슬래브·옹벽 1.5m↑)는 반드시 구조기술사 도면에 따라 시공.
            </p>
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/interior/wire" className={s.crossLink}>
        ⚡ 전선 굵기 계산기 → 현장 분전반·임시전기는 여기로
      </Link>
    </div>
  )
}
