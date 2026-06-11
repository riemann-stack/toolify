/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './wire.module.css'
import {
  WIRE_SIZES, WIRE_KINDS, BREAKER_SIZES, AMPACITY_HIV,
  ENV_FACTOR, TEMP_FACTOR, LOAD_PF, DROP_LIMIT, APPLIANCES,
  type WireSize, type WireKind, type Voltage, type Phase, type LoadType, type Environment, type Application,
  calcCurrent, calcPower, calcVoltageDrop, calcDropPercent,
  correctedAmpacity, recommendWireSizeWithDrop,
  recommendBreaker, breakerToSizes, getWireKind, fmt,
} from './wireUtils'

type Tab = 'pw' | 'reverse' | 'drop' | 'preset'

const STORAGE_KEY = 'youtil_wire_v1'

export default function WireClient() {
  const [tab, setTab] = useState<Tab>('pw')

  /* 공통 입력 */
  const [voltage, setVoltage] = useState<Voltage>(220)
  const [phase, setPhase] = useState<Phase>('single')
  const [load, setLoad] = useState<LoadType>('mixed')
  const [kind, setKind] = useState<WireKind>('hiv')
  const [env, setEnv] = useState<Environment>('expose')
  const [tempC, setTempC] = useState<30 | 40 | 50>(30)
  const [app, setApp] = useState<Application>('home')

  /* 탭 1: 전력 → 전선 */
  const [powerKw, setPowerKw] = useState('2')
  const [lengthM, setLengthM] = useState('15')

  /* 탭 2: 역계산 */
  const [revSq, setRevSq] = useState<WireSize>(2.5)
  const [revBreaker, setRevBreaker] = useState(20)

  /* 탭 3: 전압강하 */
  const [dropI, setDropI] = useState('15')
  const [dropL, setDropL] = useState('20')
  const [dropSq, setDropSq] = useState<WireSize>(2.5)

  /* localStorage 복원·저장 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.voltage === 220 || j.voltage === 380) setVoltage(j.voltage)
      if (j.phase === 'single' || j.phase === 'three') setPhase(j.phase)
      if (j.load) setLoad(j.load)
      if (j.kind) setKind(j.kind)
      if (j.env) setEnv(j.env)
      if (j.tempC) setTempC(j.tempC)
      if (j.app) setApp(j.app)
      if (j.powerKw) setPowerKw(j.powerKw)
      if (j.lengthM) setLengthM(j.lengthM)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        voltage, phase, load, kind, env, tempC, app, powerKw, lengthM,
      }))
    } catch {}
  }, [voltage, phase, load, kind, env, tempC, app, powerKw, lengthM])

  /* 삼상 380V로 바꾸면 phase=three 자동 */
  useEffect(() => {
    if (voltage === 380 && phase === 'single') setPhase('three')
    if (voltage === 220 && phase === 'three') setPhase('single')
  }, [voltage, phase])

  /* ───────── 계산 ───────── */
  const pf = LOAD_PF[load].pf
  const powerW = (parseFloat(powerKw) || 0) * 1000
  const length = parseFloat(lengthM) || 0
  const current = useMemo(() => calcCurrent(powerW, voltage, phase, pf), [powerW, voltage, phase, pf])
  const reco = useMemo(
    () => recommendWireSizeWithDrop(current, voltage, phase, length, kind, env, tempC, app),
    [current, voltage, phase, length, kind, env, tempC, app],
  )
  const breakerReco = useMemo(() => recommendBreaker(current), [current])
  const finalDrop = reco.finalSize ? calcVoltageDrop(current, length, reco.finalSize, phase) : 0
  const finalDropPct = calcDropPercent(finalDrop, voltage)

  /* 역계산 */
  const revAmpacity = correctedAmpacity(revSq, kind, env, tempC)
  const revPower = calcPower(revAmpacity, voltage, phase, pf) / 1000
  const revFromBreaker = breakerToSizes(revBreaker, kind, env, tempC)

  /* 전압강하 탭 */
  const dropI_ = parseFloat(dropI) || 0
  const dropL_ = parseFloat(dropL) || 0
  const dropV = calcVoltageDrop(dropI_, dropL_, dropSq, phase)
  const dropPct = calcDropPercent(dropV, voltage)
  const dropLimit = DROP_LIMIT[app].pct
  const oneStepBigger = (() => {
    const idx = WIRE_SIZES.indexOf(dropSq)
    return idx >= 0 && idx < WIRE_SIZES.length - 1 ? WIRE_SIZES[idx + 1] : null
  })()
  const oneStepDropV = oneStepBigger ? calcVoltageDrop(dropI_, dropL_, oneStepBigger, phase) : 0
  const oneStepDropPct = calcDropPercent(oneStepDropV, voltage)

  return (
    <div className={s.wrap}>
      {/* 면책 (표준 아코디언 단일) */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/interior/wallpaper', label: '도배 소요량' },
          { href: '/tools/interior/paint', label: '페인트 계산' },
          { href: '/tools/interior/room-area', label: '방 면적 계산' }
        ]}
      >
        사용·시공 안내 (반드시 읽어주세요) 🚨 <strong>일반인의 옥내·옥외 배선 자가시공은 전기공사업법상 불가능</strong>합니다. 시공은 반드시 <strong>전기기능사·전기공사기능사·전기공사업 등록 사업자</strong>에게 의뢰하세요. 자가시공 시 <strong>감전사·화재·법적 처벌·보험 거부</strong> 위험.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'pw',      label: '⚡ 전력→전선' },
          { id: 'reverse', label: '🔎 전선 용량 조회' },
          { id: 'drop',    label: '📉 전압강하' },
          { id: 'preset',  label: '🏠 가전 프리셋' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 회로 조건 (탭별로 실제 계산에 쓰이는 항목만 노출) ════════ */}
      {tab !== 'preset' && (
        <div className={s.card}>
          <span className={s.cardLabel}>회로 조건</span>

          <div className={s.row2}>
            {/* 전압 — 모든 탭 */}
            <div className={s.field}>
              <label className={s.fieldLabel}>전압 · 상</label>
              <div className={s.pillRow}>
                <button className={`${s.pill} ${voltage === 220 ? s.pillActive : ''}`} onClick={() => setVoltage(220)} type="button">단상 220V</button>
                <button className={`${s.pill} ${voltage === 380 ? s.pillActive : ''}`} onClick={() => setVoltage(380)} type="button">삼상 380V</button>
              </div>
            </div>

            {/* 전압강하 한도 — 전력→전선 · 전압강하 탭 */}
            {(tab === 'pw' || tab === 'drop') && (
              <div className={s.field}>
                <label className={s.fieldLabel}>적용 (전압강하 한도)</label>
                <select className={s.input} value={app} onChange={(e) => setApp(e.target.value as Application)}>
                  {(Object.keys(DROP_LIMIT) as Application[]).map((a) => (
                    <option key={a} value={a}>{DROP_LIMIT[a].label} ({DROP_LIMIT[a].pct}%)</option>
                  ))}
                </select>
              </div>
            )}

            {/* 아래 4개는 허용전류 계산에 쓰임 — 전력→전선 · 전선 용량 조회 탭 */}
            {(tab === 'pw' || tab === 'reverse') && (
              <>
                <div className={s.field}>
                  <label className={s.fieldLabel}>부하 종류</label>
                  <select className={s.input} value={load} onChange={(e) => setLoad(e.target.value as LoadType)}>
                    {(Object.keys(LOAD_PF) as LoadType[]).map((l) => (
                      <option key={l} value={l}>{LOAD_PF[l].label}</option>
                    ))}
                  </select>
                </div>
                <div className={s.field}>
                  <label className={s.fieldLabel}>전선 종류</label>
                  <select className={s.input} value={kind} onChange={(e) => setKind(e.target.value as WireKind)}>
                    {WIRE_KINDS.map((k) => (
                      <option key={k.id} value={k.id}>{k.label}</option>
                    ))}
                  </select>
                </div>
                <div className={s.field}>
                  <label className={s.fieldLabel}>부설 환경</label>
                  <select className={s.input} value={env} onChange={(e) => setEnv(e.target.value as Environment)}>
                    {(Object.keys(ENV_FACTOR) as Environment[]).map((ev) => (
                      <option key={ev} value={ev}>{ENV_FACTOR[ev].label}</option>
                    ))}
                  </select>
                </div>
                <div className={s.field}>
                  <label className={s.fieldLabel}>주위 온도</label>
                  <select className={s.input} value={tempC} onChange={(e) => setTempC(Number(e.target.value) as 30 | 40 | 50)}>
                    <option value={30}>30°C</option>
                    <option value={40}>40°C</option>
                    <option value={50}>50°C</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════ 탭 1: 전력 → 전선 ════════ */}
      {tab === 'pw' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>부하 입력</span>
            <div className={s.row2Tight}>
              <div className={s.field}>
                <label className={s.fieldLabel}>소비전력 (kW)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={powerKw}
                  onChange={(e) => setPowerKw(e.target.value)}
                  min={0.1}
                  max={500}
                  step={0.1}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[1, 2, 3.5, 7].map((p) => (
                    <button key={p} className={s.pill} onClick={() => setPowerKw(String(p))} type="button">
                      {p}kW
                    </button>
                  ))}
                </div>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>배선 거리 (편도, m)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={lengthM}
                  onChange={(e) => setLengthM(e.target.value)}
                  min={1}
                  max={300}
                  step={1}
                />
                <div className={s.pillRow} style={{ marginTop: 8 }}>
                  {[5, 10, 20, 50].map((m) => (
                    <button key={m} className={s.pill} onClick={() => setLengthM(String(m))} type="button">
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 결과 카드 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>{powerKw}kW · {voltage}V {phase === 'three' ? '삼상' : '단상'} · {LOAD_PF[load].label}</p>
            <p className={s.heroValue}>
              예상 전류 <strong>{fmt(current, 1)} A</strong>
            </p>
            <p className={s.heroSub}>
              권장 전선 굵기{' '}
              <strong style={{ color: 'var(--accent)' }}>
                {reco.finalSize ? `${reco.finalSize} sq` : '범위 초과'}
              </strong>
              {' · '}
              권장 차단기{' '}
              <strong style={{ color: 'var(--accent)' }}>
                {breakerReco ? `${breakerReco}A` : '—'}
              </strong>
            </p>
          </div>

          {/* 상세표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>계산 상세</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>입력 부하</td><td className={s.cellMono}>{powerKw} kW</td></tr>
                  <tr><td>회로</td><td>{voltage}V {phase === 'three' ? '삼상' : '단상'}</td></tr>
                  <tr><td>역률 cosφ</td><td className={s.cellMono}>{pf}</td></tr>
                  <tr><td>전류 I</td><td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(current, 2)} A</td></tr>
                  <tr><td>차단기 (I × 1.25)</td><td className={s.cellMono}>{fmt(current * 1.25, 1)} A → {breakerReco ?? '—'}A</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>전선 굵기 후보</td></tr>
                  <tr><td>허용전류 기준</td><td className={s.cellMono}>{reco.ampacitySize ?? '—'} sq</td></tr>
                  <tr><td>전압강하 기준 ({DROP_LIMIT[app].pct}%)</td><td className={s.cellMono}>{reco.dropSize ?? '—'} sq</td></tr>
                  <tr><td>최종 권장</td><td className={`${s.cellMono} ${s.cellAccent}`}>{reco.finalSize ?? '—'} sq</td></tr>
                  <tr><td>최종 전압강하</td><td className={s.cellMono}>{fmt(finalDrop, 2)} V ({fmt(finalDropPct, 2)}%)</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>보정 계수</td></tr>
                  <tr><td>전선 종류 ({getWireKind(kind).label.split(' ')[0]})</td><td className={s.cellMono}>×{getWireKind(kind).factor}</td></tr>
                  <tr><td>부설 환경</td><td className={s.cellMono}>×{ENV_FACTOR[env].factor}</td></tr>
                  <tr><td>주위 온도</td><td className={s.cellMono}>×{TEMP_FACTOR[tempC]}</td></tr>
                  {reco.finalSize && (
                    <tr><td>보정 후 실허용전류</td><td className={s.cellMono}>{fmt(correctedAmpacity(reco.finalSize, kind, env, tempC), 1)} A</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>📌 결과 해석</strong>
            <ul className={s.bullets}>
              <li><strong>전선 굵기</strong>는 허용전류와 전압강하 중 큰 쪽을 따라 결정됩니다.</li>
              <li><strong>거리가 길수록</strong> 전압강하 때문에 한 단계 굵은 전선이 필요해요.</li>
              <li><strong>차단기는 부하전류 × 1.25 이상</strong>의 가장 작은 표준값을 선택합니다 (KEC 232.4).</li>
              <li>가정용 분기는 별도로 <strong>누전차단기(ELCB·30mA·0.03초)</strong>가 의무입니다.</li>
            </ul>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 역계산 ════════ */}
      {tab === 'reverse' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>전선 굵기 → 허용 W·A</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>전선 사이즈 (sq mm)</label>
              <div className={s.pillRow}>
                {WIRE_SIZES.map((sq) => (
                  <button
                    key={sq}
                    className={`${s.pill} ${revSq === sq ? s.pillActive : ''}`}
                    onClick={() => setRevSq(sq)}
                    type="button"
                  >
                    {sq} sq
                  </button>
                ))}
              </div>
            </div>

            <div className={s.convertResult}>
              <p className={s.convertLabel}>
                {revSq} sq · {getWireKind(kind).label.split(' ')[0]} · {ENV_FACTOR[env].label} · {tempC}°C
              </p>
              <p className={s.convertValue}>{fmt(revAmpacity, 1)} A</p>
              <p className={s.convertSub}>
                ≈ 보호 가능 부하 <strong>{fmt(revPower, 2)} kW</strong> (역률 {pf} 기준)
              </p>
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>차단기 → 가능한 전선 굵기</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>차단기 사이즈 (A)</label>
              <div className={s.pillRow}>
                {BREAKER_SIZES.map((b) => (
                  <button
                    key={b}
                    className={`${s.pill} ${revBreaker === b ? s.pillActive : ''}`}
                    onClick={() => setRevBreaker(b)}
                    type="button"
                  >
                    {b}A
                  </button>
                ))}
              </div>
            </div>

            <div className={s.convertResult}>
              <p className={s.convertLabel}>{revBreaker}A 차단기</p>
              <p className={s.convertValue}>
                {revFromBreaker ? `≥ ${revFromBreaker} sq` : '범위 초과'}
              </p>
              <p className={s.convertSub}>
                보정 후 허용전류가 {revBreaker}A 이상인 가장 작은 전선
              </p>
            </div>
          </div>

          {/* 전체 매트릭스 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>sq별 허용전류·차단기 매트릭스</span>
            <div className={s.tableScroll}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th>sq</th>
                    <th>HIV 기본 (A)</th>
                    <th>보정 후 (A)</th>
                    <th>적정 차단기</th>
                    <th>보호 부하 ({voltage}V)</th>
                  </tr>
                </thead>
                <tbody>
                  {WIRE_SIZES.map((sq) => {
                    const a = correctedAmpacity(sq, kind, env, tempC)
                    const b = recommendBreaker(a / 1.25) ?? '—'
                    const w = calcPower(a, voltage, phase, pf) / 1000
                    return (
                      <tr key={sq} className={revSq === sq ? s.rowActive : ''}>
                        <td className={s.cellMono}>{sq}</td>
                        <td className={s.cellMono}>{AMPACITY_HIV[sq]}</td>
                        <td className={s.cellMono}>{fmt(a, 1)}</td>
                        <td className={s.cellMono}>{b}A</td>
                        <td className={s.cellMono}>{fmt(w, 1)} kW</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 전압강하 ════════ */}
      {tab === 'drop' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>전압강하 계산 입력</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>부하 전류 (A)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={dropI}
                  onChange={(e) => setDropI(e.target.value)}
                  min={1}
                  max={500}
                  step={1}
                />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>편도 거리 (m)</label>
                <input
                  type="number" inputMode="decimal"
                  className={s.input}
                  value={dropL}
                  onChange={(e) => setDropL(e.target.value)}
                  min={1}
                  max={500}
                  step={1}
                />
              </div>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel}>전선 굵기 (sq)</label>
              <div className={s.pillRow}>
                {WIRE_SIZES.map((sq) => (
                  <button
                    key={sq}
                    className={`${s.pill} ${dropSq === sq ? s.pillActive : ''}`}
                    onClick={() => setDropSq(sq)}
                    type="button"
                  >
                    {sq} sq
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 강하 게이지 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>전압강하 (한도 {dropLimit}%)</p>
            <p className={s.heroValue}>
              {fmt(dropV, 2)} V <strong>({fmt(dropPct, 2)}%)</strong>
            </p>
            <p className={s.heroSub}>
              {dropPct <= dropLimit ? '✅ 한도 이내' : '⚠️ 한도 초과 — 한 단계 굵게'}
            </p>

            {/* SVG 게이지 */}
            <svg viewBox="0 0 400 60" width="100%" style={{ marginTop: 14, maxWidth: 480 }}>
              <rect x="0" y="20" width="400" height="20" rx="10" fill="var(--bg3)" />
              <rect x="0" y="20" width={Math.min((dropPct / 5) * 400, 400)} height="20" rx="10"
                fill={dropPct <= dropLimit ? '#0D9488' : dropPct <= 5 ? '#D97706' : '#DB2777'} />
              {/* 한도 라인 */}
              <line x1={(dropLimit / 5) * 400} y1="10" x2={(dropLimit / 5) * 400} y2="50" stroke="#D97706" strokeWidth="2" strokeDasharray="3,2" />
              <text x={(dropLimit / 5) * 400} y="8" fill="#D97706" fontSize="10" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>한도 {dropLimit}%</text>
              {/* 0~5% 눈금 */}
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <text key={v} x={(v / 5) * 400} y="55" fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>{v}%</text>
              ))}
            </svg>
          </div>

          {/* 한 단계 큰 굵기 비교 */}
          {oneStepBigger && (
            <div className={s.card}>
              <span className={s.cardLabel}>한 단계 굵게 비교</span>
              <div className={s.tableScroll}>
                <table className={s.detailTable}>
                  <thead>
                    <tr>
                      <th>전선</th>
                      <th>강하 V</th>
                      <th>강하%</th>
                      <th>판정</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={s.cellMono}>{dropSq} sq (현재)</td>
                      <td className={s.cellMono}>{fmt(dropV, 2)}</td>
                      <td className={s.cellMono}>{fmt(dropPct, 2)}%</td>
                      <td className={s.cellMono} style={{ color: dropPct <= dropLimit ? 'var(--accent)' : '#DB2777' }}>
                        {dropPct <= dropLimit ? 'OK' : '초과'}
                      </td>
                    </tr>
                    <tr>
                      <td className={s.cellMono}>{oneStepBigger} sq (한 단계 ↑)</td>
                      <td className={s.cellMono}>{fmt(oneStepDropV, 2)}</td>
                      <td className={s.cellMono}>{fmt(oneStepDropPct, 2)}%</td>
                      <td className={s.cellMono} style={{ color: oneStepDropPct <= dropLimit ? 'var(--accent)' : '#DB2777' }}>
                        {oneStepDropPct <= dropLimit ? 'OK' : '초과'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={s.helpText}>
                ※ 강하율 한도는 <strong>가정 2% / 옥내 일반 3% / 옥외·간선 5%</strong>가 일반 권장입니다.
                회로 조건의 &quot;적용&quot;에서 변경할 수 있어요.
              </p>
            </div>
          )}

          <div className={s.warnCard}>
            <strong>💡 전압강하 공식</strong>
            <p>
              단상: e = (35.6 × L × I) / (1000 × A) [V]<br />
              삼상: e = (30.8 × L × I) / (1000 × A) [V]<br />
              L=편도 거리(m), I=부하전류(A), A=전선 단면적(sq)<br />
              <br />
              EV 충전·시스템 에어컨처럼 <strong>거리가 긴 회로</strong>는 허용전류는 충분해도
              강하율로 인해 한 단계 굵은 전선을 사용해야 합니다.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 가전 프리셋 ════════ */}
      {tab === 'preset' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>한국 가전·EV 프리셋</span>
            <div className={s.presetGrid}>
              {APPLIANCES.map((a) => (
                <div key={a.id} className={s.presetCard}>
                  <p className={s.presetTitle}>{a.emoji} {a.label}</p>
                  <div className={s.presetSpecs}>
                    <span><b>{a.voltage}V</b> {a.phase === 'three' ? '삼상' : '단상'}</span>
                    <span>차단기 <b>{a.breaker}A</b></span>
                    <span>전선 <b className={s.cellAccent}>{a.sq} sq</b></span>
                  </div>
                  {a.note && <p className={s.presetNote}>{a.note}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>차단기 ↔ 전선 매트릭스 ({voltage}V {phase === 'three' ? '삼상' : '단상'} · {getWireKind(kind).label.split(' ')[0]})</span>
            <div className={s.tableScroll}>
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th>차단기</th>
                    <th>최소 전선</th>
                    <th>보호 부하 (kW)</th>
                  </tr>
                </thead>
                <tbody>
                  {[15, 20, 30, 40, 50, 60, 75, 100].map((b) => {
                    const sq = breakerToSizes(b, kind, env, tempC)
                    const w = calcPower(b, voltage, phase, pf) / 1000
                    return (
                      <tr key={b}>
                        <td className={s.cellMono}>{b}A</td>
                        <td className={s.cellMono}>{sq ?? '—'} sq</td>
                        <td className={s.cellMono}>{fmt(w, 1)} kW</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>⭐ EV 충전기 시공 팁</strong>
            <p>
              완속 7kW는 <strong>40A 차단기 + 6sq HIV/F-CV</strong>가 한국 표준 조합입니다.<br />
              한전 신청 + 누전차단기(RCBO·EV용) + 매설 시 F-CV 권장.<br />
              22kW 급속은 삼상 380V로 전선 굵기를 작게 가져갈 수 있어요.<br />
              EV 충전 콘센트(EV-Plug) 단독 분기 + 누전 30mA 의무.
            </p>
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/interior/lighting" className={s.crossLink}>
        💡 조명 밝기 계산기 → 공간별 권장 루멘·조명 개수는 여기로
      </Link>
    </div>
  )
}
