'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import styles from './ventilation.module.css'
import {
  SPACE_STANDARDS, CO2_BY_ACTIVITY, CO2_THRESHOLDS,
  WINDOW_MODES, WIND_SPEEDS, DUST_LEVELS,
  calcRequiredAirflow, recommendCADR, evaluateCurrentPerformance,
  estimateWindowVentilationTime, estimateCO2Risk,
  fmt,
} from './ventilationUtils'

type Tab = 'main' | 'cadr' | 'perf' | 'window' | 'co2'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'main',   name: '환기량 계산',   icon: '💨' },
  { id: 'cadr',   name: '공기청정기',     icon: '🌀' },
  { id: 'perf',   name: '성능 평가',      icon: '⚙️' },
  { id: 'window', name: '창문 환기',      icon: '🪟' },
  { id: 'co2',    name: 'CO₂·인원',       icon: '🫁' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  main:   styles.tabActive,
  cadr:   styles.tabActiveCadr,
  perf:   styles.tabActivePerf,
  window: styles.tabActiveWindow,
  co2:    styles.tabActiveCo2,
}

export default function VentilationClient() {
  const [tab, setTab] = useState<Tab>('main')

  /* 공통 입력 */
  const [area, setArea] = useState('20')
  const [ceilingHeight, setCeilingHeight] = useState('2.4')
  const [spaceTypeId, setSpaceTypeId] = useState('living')
  const [occupants, setOccupants] = useState(2)
  const [targetAch, setTargetAch] = useState(0.8)

  const areaN = parseFloat(area) || 0
  const ceilingN = parseFloat(ceilingHeight) || 0

  /* 공간 변경 시 권장 ACH 자동 적용 */
  const handleSpaceChange = (id: string) => {
    setSpaceTypeId(id)
    const std = SPACE_STANDARDS.find(s => s.id === id)
    if (std) setTargetAch(std.achRecommended)
  }

  /* ─── 메인 결과 ─── */
  const main = useMemo(
    () => areaN > 0 && ceilingN > 0
      ? calcRequiredAirflow({
        area: areaN, ceilingHeight: ceilingN, spaceTypeId,
        occupants, targetAch,
      })
      : null,
    [areaN, ceilingN, spaceTypeId, occupants, targetAch],
  )

  /* ─── 탭 2: CADR ─── */
  const cadr = useMemo(
    () => areaN > 0 && ceilingN > 0
      ? recommendCADR(areaN, ceilingN, targetAch)
      : null,
    [areaN, ceilingN, targetAch],
  )

  /* ─── 탭 3: 성능 평가 ─── */
  const [currentAirflow, setCurrentAirflow] = useState('120')
  const perf = useMemo(() => {
    const v = main?.volume ?? 0
    const af = parseFloat(currentAirflow) || 0
    if (v <= 0) return null
    return evaluateCurrentPerformance(v, af, targetAch)
  }, [main, currentAirflow, targetAch])

  /* ─── 탭 4: 창문 환기 ─── */
  const [windowMode, setWindowMode] = useState('cross')
  const [windSpeed, setWindSpeed] = useState('moderate')
  const [cycles, setCycles] = useState(1)
  const window = useMemo(() => {
    const v = main?.volume ?? 0
    if (v <= 0) return null
    return estimateWindowVentilationTime(v, windowMode, windSpeed, cycles)
  }, [main, windowMode, windSpeed, cycles])

  /* ─── 탭 5: CO₂ ─── */
  const [co2Duration, setCo2Duration] = useState(60)
  const [co2Activity, setCo2Activity] = useState('study')
  const [co2Airflow, setCo2Airflow] = useState(0)
  const co2 = useMemo(() => {
    const v = main?.volume ?? 0
    if (v <= 0) return null
    return estimateCO2Risk({
      volume: v,
      occupants,
      durationMinutes: co2Duration,
      airflowM3PerHour: co2Airflow,
      activityId: co2Activity,
    })
  }, [main, occupants, co2Duration, co2Airflow, co2Activity])

  /* ─── 미세먼지 등급 ─── */
  const [dustLevel, setDustLevel] = useState('moderate')
  const dust = DUST_LEVELS.find(d => d.id === dustLevel)!

  /* ─── 복사 ─── */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* */ }
  }

  /* ─────────────────── 렌더 ─────────────────── */
  return (
    <div className={styles.wrap}>
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/interior/wallpaper', label: '도배 소요량' },
          { href: '/tools/interior/paint', label: '페인트 계산' },
          { href: '/tools/interior/room-area', label: '방 면적 계산' }
        ]}
      >
        참고용 가이드 도구
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* 공통 입력 */}
      <div className={styles.fieldRow3}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>면적</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="20" value={area} onChange={e => setArea(e.target.value)} />
            <span className={styles.unit}>㎡</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>천장 높이</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="2.4" value={ceilingHeight} onChange={e => setCeilingHeight(e.target.value)} />
            <span className={styles.unit}>m</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>인원 수</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="2" value={occupants} min={0} max={50}
              onChange={e => setOccupants(Math.max(0, parseInt(e.target.value, 10) || 0))} />
            <span className={styles.unit}>명</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>
          공간 용도 <span className={styles.cardLabelHint}>선택 시 권장 ACH 자동 적용</span>
        </label>
        <div className={styles.spaceGrid}>
          {SPACE_STANDARDS.map(s => (
            <button key={s.id}
              className={`${styles.spaceCard} ${spaceTypeId === s.id ? styles.spaceCardActive : ''}`}
              onClick={() => handleSpaceChange(s.id)}>
              <span className={styles.spaceCardIcon}>{s.icon}</span>
              <span className={styles.spaceCardName}>{s.name}</span>
              <span className={styles.spaceCardAch}>{s.achMin}~{s.achMax} ACH</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>
          목표 ACH (시간당 환기 횟수) — {targetAch.toFixed(1)} 회/h
        </label>
        <div className={styles.sliderRow}>
          <input className={styles.slider} type="range"
            min="0.3" max="15" step="0.1"
            value={targetAch} onChange={e => setTargetAch(parseFloat(e.target.value))} />
          <span className={styles.sliderVal}>{targetAch.toFixed(1)}</span>
        </div>
        {main?.achInfo && (
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
            ⓘ <strong style={{ color: '#E89757' }}>{SPACE_STANDARDS.find(s => s.id === spaceTypeId)?.name}</strong> 권장: {main.achInfo.min}~{main.achInfo.max} ACH ({main.achInfo.standard})
          </p>
        )}
      </div>

      {!main && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>면적과 천장 높이를 입력하세요</div>
          공간 부피와 인원수를 기반으로 필요 환기량이 자동 계산됩니다
        </div>
      )}

      {/* ─── 탭 1: 환기량 ─── */}
      {tab === 'main' && main && (
        <>
          <div className={styles.hero}
            style={{ borderColor: 'rgba(232,151,87,0.40)', background: 'rgba(232,151,87,0.06)' }}>
            <div className={styles.heroLabel}>필요 환기량</div>
            <div className={styles.heroNum} style={{ color: '#E89757' }}>
              {fmt(main.requiredAirflow)}<span className={styles.heroNumUnit}>㎥/h</span>
            </div>
            <div className={styles.heroSub}>
              {SPACE_STANDARDS.find(s => s.id === spaceTypeId)?.name} · 부피 {fmt(main.volume, 1)}㎥ · 목표 {targetAch.toFixed(1)} ACH
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>상세</label>
            <div className={styles.detailTable}>
              <div className={styles.detailRow}><span>공간 부피</span><span>{fmt(main.volume, 1)} ㎥</span></div>
              <div className={styles.detailRow}><span>목표 ACH</span><span>{targetAch.toFixed(1)} 회/h</span></div>
              <div className={`${styles.detailRow} ${styles.detailRowAccent}`}><span>필요 환기량</span><span>{fmt(main.requiredAirflow)} ㎥/h</span></div>
              {occupants > 0 && (
                <div className={styles.detailRow}><span>1인당 환기량 ({occupants}명)</span><span>{fmt(main.perPersonAirflow)} ㎥/h</span></div>
              )}
              <div className={styles.detailRow}><span>1회 교체 시간</span><span>{fmt(main.oneCycleMinutes)} 분</span></div>
            </div>
          </div>

          {main.achInfo && (
            <div className={styles.infoBox}>
              💡 <strong>{SPACE_STANDARDS.find(s => s.id === spaceTypeId)?.name} 권장 — {main.achInfo.min}~{main.achInfo.max} ACH</strong>
              <br />{main.achInfo.recommended} · 출처: {main.achInfo.standard}
              {targetAch > main.achInfo.max && (
                <><br /><br />⚠️ 사용자 입력 {targetAch.toFixed(1)} ACH는 표준보다 높은 편입니다 (인원 밀집·운동 등 특수 상황).</>
              )}
              {targetAch < main.achInfo.min && (
                <><br /><br />⚠️ 사용자 입력 {targetAch.toFixed(1)} ACH는 표준보다 낮은 편입니다 (CO₂·습기 누적 가능).</>
              )}
            </div>
          )}

          <div className={styles.resultActions}>
            <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={() => copy(`${SPACE_STANDARDS.find(s => s.id === spaceTypeId)?.name} (${fmt(main.volume, 1)}㎥) → 필요 환기량 ${fmt(main.requiredAirflow)}㎥/h (${targetAch} ACH)`)}>
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
            <button className={styles.copyBtn} onClick={() => setTab('cadr')}>🌀 공기청정기 CADR</button>
            <button className={styles.copyBtn} onClick={() => setTab('window')}>🪟 창문 환기 시간</button>
          </div>
        </>
      )}

      {/* ─── 탭 2: CADR ─── */}
      {tab === 'cadr' && main && cadr && (
        <>
          <div className={styles.disclaimer}>
            🌀 <strong>공기청정기 CADR</strong>는 미국 AHAM 표준 (㎥/h). 한국 공기청정기는 <strong>표시면적(㎡)</strong>으로 표기하며 본 계산기가 환산합니다.
          </div>

          <div className={styles.hero}
            style={{ borderColor: 'rgba(62,200,255,0.40)', background: 'rgba(62,200,255,0.06)' }}>
            <div className={styles.heroLabel}>권장 CADR</div>
            <div className={styles.heroNum} style={{ color: '#3EC8FF' }}>
              {fmt(cadr.minCadr)}~{fmt(cadr.idealCadr)}<span className={styles.heroNumUnit}>㎥/h</span>
            </div>
            <div className={styles.heroSub}>
              한국 공기청정기 표시면적 ≈ <strong style={{ color: '#3EC8FF' }}>{cadr.displayAreaApprox}㎡</strong> 제품 권장
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>CADR 등급별 권장</label>
            <div className={styles.detailTable}>
              <div className={styles.detailRow}><span>최소 (4 ACH 기준)</span><span>{fmt(cadr.minCadr)} ㎥/h</span></div>
              <div className={`${styles.detailRow} ${styles.detailRowAccent}`}><span>이상 (5 ACH, 빠른 제거)</span><span>{fmt(cadr.idealCadr)} ㎥/h</span></div>
              <div className={styles.detailRow}><span>사용자 목표 ({targetAch.toFixed(1)} ACH)</span><span>{fmt(cadr.smartCadr)} ㎥/h</span></div>
              <div className={styles.detailRow}><span>한국 표시면적 환산</span><span>{cadr.displayAreaApprox} ㎡</span></div>
            </div>
          </div>

          <div className={styles.warnBox}>
            ⚠️ <strong>공기청정기 ≠ 환기 (중요)</strong>
            <br />공기청정기는 미세먼지·일부 입자만 줄입니다. 다음은 줄이지 못합니다 — <strong>CO₂ · 산소 부족 · 냄새(장기) · 습기·곰팡이</strong>.
            이런 경우 외부 공기와의 환기가 필요하며, 미세먼지 나쁜 날에도 짧은 환기(5분) + 공기청정기 병행을 권장합니다.
          </div>

          <div className={styles.infoBox}>
            💡 <strong>한국 표시면적 환산법</strong> — CADR (㎥/h) ≈ 표시면적 (㎡) × 7.5. 한국 제조사는 보수적으로 환산하므로 실제 CADR이 약 1.4배 높을 수 있습니다.
          </div>
        </>
      )}

      {/* ─── 탭 3: 성능 평가 ─── */}
      {tab === 'perf' && main && perf && (
        <>
          <div className={styles.disclaimer}>
            ⚙️ <strong>현재 환풍기·전열교환기 성능</strong>이 목표 환기율을 달성하는지 평가합니다. 제품 사양의 풍량(㎥/h)을 입력하세요.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>현재 풍량 (제품 사양)</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="numeric"
                placeholder="120" value={currentAirflow} onChange={e => setCurrentAirflow(e.target.value)} />
              <span className={styles.unit}>㎥/h</span>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
              ⓘ 환풍기 사양에 보통 표기되어 있습니다. 신축 아파트 전열교환기는 약 100~250 ㎥/h.
            </p>
          </div>

          <div className={styles.hero}
            style={{ borderColor: `${perf.efficiencyColor}50`, background: `${perf.efficiencyColor}0F` }}>
            <div className={styles.heroLabel}>현재 ACH</div>
            <div className={styles.heroNum} style={{ color: perf.efficiencyColor }}>
              {perf.currentAch.toFixed(2)}<span className={styles.heroNumUnit}>회/h</span>
            </div>
            <div className={styles.heroSub}>
              공기 1회 교체: 약 {fmt(perf.oneCycleMinutes)}분 · 목표 {targetAch.toFixed(1)} ACH 대비
            </div>
            <div className={styles.heroCategory}
              style={{ background: `${perf.efficiencyColor}22`, color: perf.efficiencyColor, border: `1px solid ${perf.efficiencyColor}66` }}>
              {perf.efficiencyLabel}
            </div>
          </div>

          {!perf.isAdequate && perf.shortageAirflow > 0 && (
            <div className={styles.warnBox}>
              ⚠️ <strong>목표 ACH 대비 약 {Math.round((1 - perf.currentAch / targetAch) * 100)}% 부족</strong>
              <br />추가 풍량 필요: <strong style={{ color: '#FF6B6B' }}>약 {fmt(perf.shortageAirflow)} ㎥/h</strong>
              <br /><br />옵션 — ① 더 강한 환풍기 설치 / ② 창문 환기 보조 (탭 4) / ③ 공기청정기 추가 (CADR {Math.ceil(perf.shortageAirflow)}+, 미세먼지 한정).
            </div>
          )}

          {perf.isAdequate && (
            <div className={styles.infoBox}>
              ✅ <strong>목표 환기율 달성</strong> — 현재 풍량({fmt(parseFloat(currentAirflow))}㎥/h)이 목표({fmt(main.requiredAirflow)}㎥/h)를 충족합니다.
            </div>
          )}
        </>
      )}

      {/* ─── 탭 4: 창문 환기 ─── */}
      {tab === 'window' && main && (
        <>
          <div className={styles.disclaimer}>
            🪟 <strong>창문 자연환기 시간</strong> 추정 — 창문 개방 방식 + 바람 세기로 1회 이상 공기 교체 시간 계산.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>창문 개방 방식</label>
            <div className={styles.optionRow}>
              {WINDOW_MODES.map(m => (
                <button key={m.id}
                  className={`${styles.optionBtn} ${windowMode === m.id ? styles.optionActive : ''}`}
                  onClick={() => setWindowMode(m.id)}>
                  {m.name}
                  <br />
                  <small style={{ fontSize: 10, opacity: 0.7 }}>{m.achMin}~{m.achMax} ACH</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>바람 세기</label>
            <div className={styles.optionRow4}>
              {WIND_SPEEDS.map(w => (
                <button key={w.id}
                  className={`${styles.optionBtn} ${windSpeed === w.id ? styles.optionActive : ''}`}
                  onClick={() => setWindSpeed(w.id)}>
                  {w.name}
                  <br />
                  <small style={{ fontSize: 10, opacity: 0.7 }}>×{w.factor}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>목표 교체 횟수 — {cycles}회</label>
            <div className={styles.optionRow4}>
              {[1, 2, 3, 5].map(n => (
                <button key={n}
                  className={`${styles.optionBtn} ${cycles === n ? styles.optionActive : ''}`}
                  onClick={() => setCycles(n)}>
                  {n}회
                </button>
              ))}
            </div>
          </div>

          {window && (
            <>
              <div className={styles.hero}
                style={{ borderColor: 'rgba(62,255,155,0.40)', background: 'rgba(62,255,155,0.06)' }}>
                <div className={styles.heroLabel}>{window.modeName} · 바람 {window.windName} · {window.cycles}회 교체</div>
                <div className={styles.heroNum} style={{ color: '#3EFF9B', fontSize: 'clamp(36px, 9vw, 52px)' }}>
                  {window.minMinutes}~{window.maxMinutes}<span className={styles.heroNumUnit}>분</span>
                </div>
                <div className={styles.heroSub}>
                  1회 교체당 {window.perCycle.min}~{window.perCycle.max}분
                </div>
              </div>

              <div className={styles.infoBox}>
                💡 {window.recommendation}
              </div>

              <div className={styles.warnBox}>
                ⚠️ <strong>자연환기량은 ±300% 변동 가능</strong> — 본 결과는 일반 가정의 표준 창문(1.5×1.5m) 기준 추정값입니다. 실제 환기량은 창문 크기·바람·실내외 온도차·구조에 따라 크게 달라질 수 있습니다.
              </div>
            </>
          )}

          <div className={styles.card}>
            <label className={styles.cardLabel}>오늘의 미세먼지 등급</label>
            <div className={styles.dustGrid}>
              {DUST_LEVELS.map(d => (
                <button key={d.id}
                  className={`${styles.dustChip} ${dustLevel === d.id ? styles.dustChipActive : ''}`}
                  style={dustLevel === d.id ? { color: d.color, borderColor: d.color } : {}}
                  onClick={() => setDustLevel(d.id)}>
                  {d.name}
                </button>
              ))}
            </div>
            <div className={styles.infoBox} style={{ marginTop: 10, background: `${dust.color}10`, borderColor: `${dust.color}50` }}>
              💨 <strong style={{ color: dust.color }}>{dust.name}</strong> — {dust.recommendation}
            </div>
          </div>
        </>
      )}

      {/* ─── 탭 5: CO₂ ─── */}
      {tab === 'co2' && main && (
        <>
          <div className={styles.disclaimer}>
            🫁 <strong>CO₂ 위험도 추정</strong> — 인원·체류 시간·활동 수준·환기량으로 실내 CO₂ 농도를 추정합니다.
            정확한 측정은 CO₂ 센서 사용을 권장하며 본 결과는 ±50% 오차가 가능합니다.
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.card}>
              <label className={styles.cardLabel}>체류 시간 — {co2Duration}분</label>
              <input className={styles.slider} type="range"
                min="10" max="240" step="10"
                value={co2Duration} onChange={e => setCo2Duration(parseInt(e.target.value, 10))} />
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel}>환기량 ({co2Airflow === 0 ? '무환기' : `${co2Airflow}㎥/h`})</label>
              <input className={styles.slider} type="range"
                min="0" max="500" step="10"
                value={co2Airflow} onChange={e => setCo2Airflow(parseInt(e.target.value, 10))} />
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>활동 수준</label>
            <div className={styles.optionRow5}>
              {CO2_BY_ACTIVITY.map(a => (
                <button key={a.id}
                  className={`${styles.optionBtn} ${co2Activity === a.id ? styles.optionActive : ''}`}
                  onClick={() => setCo2Activity(a.id)}>
                  {a.name}
                  <br />
                  <small style={{ fontSize: 10, opacity: 0.7 }}>{a.co2LperHour}L/h</small>
                </button>
              ))}
            </div>
          </div>

          {co2 && occupants > 0 && (
            <>
              <div className={styles.hero}
                style={{ borderColor: `${co2.riskLevel.color}50`, background: `${co2.riskLevel.color}0F` }}>
                <div className={styles.heroLabel}>추정 CO₂ 농도</div>
                <div className={styles.heroNum} style={{ color: co2.riskLevel.color }}>
                  {fmt(co2.estimatedPpm)}<span className={styles.heroNumUnit}>ppm</span>
                </div>
                <div className={styles.heroSub}>
                  {co2Airflow ? '환기 시 정상상태' : '무환기 시 누적'} · 외부 공기(420 ppm) +{fmt(co2.ppmIncrease)}
                </div>
                <div className={styles.heroCategory}
                  style={{ background: `${co2.riskLevel.color}22`, color: co2.riskLevel.color, border: `1px solid ${co2.riskLevel.color}66` }}>
                  {co2.riskLevel.label} · {co2.riskLevel.desc}
                </div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>CO₂ 농도별 영향</label>
                <div className={styles.co2Table}>
                  {CO2_THRESHOLDS.slice(0, -1).map((t, i) => {
                    const prevMax = i === 0 ? 400 : CO2_THRESHOLDS[i - 1].max
                    const isCurrent = co2.riskLevel.level === t.level
                    return (
                      <div key={t.level}
                        className={`${styles.co2Row} ${isCurrent ? styles.co2RowActive : ''}`}
                        style={{ borderLeftColor: t.color, ...(isCurrent ? { borderColor: t.color, background: `${t.color}15` } : {}) }}>
                        <span className={styles.co2Range} style={{ color: t.color }}>
                          {prevMax === 400 ? '~' + t.max : `${prevMax}~${t.max}`}
                          <small style={{ display: 'block', color: 'var(--muted)', fontSize: 9.5 }}>ppm</small>
                        </span>
                        <span className={styles.co2Label}>
                          <strong style={{ color: t.color }}>{t.label}</strong>
                          <small>{t.desc.replace(/\(.*?\)/, '').trim()}</small>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {co2Airflow === 0 && (
                <div className={styles.infoBox}>
                  💡 <strong>환기 권장 주기</strong> — 무환기 상태에서 1,000 ppm 도달까지 약 <strong style={{ color: '#3EC8FF' }}>{co2.recommendVentilateMinutes}분</strong>.
                  {co2.recommendVentilateMinutes < 60
                    ? ' 30~45분마다 5~10분 맞통풍 환기를 권장합니다.'
                    : ' 1~2시간마다 짧은 환기로 충분합니다.'}
                </div>
              )}

              <div className={styles.warnBox}>
                ⚠️ <strong>{co2.warning}</strong> CO₂ 자체보다 &quot;환기 부족&quot;의 지표로 보는 것이 정확합니다. 의학적 진단·산업안전 도구가 아닙니다.
              </div>
            </>
          )}

          {occupants === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>인원 수를 입력하세요</div>
              상단 입력에서 인원 수가 1명 이상이어야 CO₂ 추정이 가능합니다
            </div>
          )}
        </>
      )}

      {/* 냉난방 손실 안내 (모든 탭 공통) */}
      <div className={styles.infoBox}>
        💡 <strong>환기 시 냉난방 손실 줄이기</strong>
        <br />· <strong>짧고 강한 맞통풍 (5~10분)</strong> 권장 — 에너지 손실 최소
        <br />· 오래 조금 열어두기 X — 에너지 손실 큼
        <br />· 미세먼지 나쁜 날 — 짧은 환기 + 공기청정기 병행
        <br />· 신축 아파트 <strong>전열교환기</strong> 사용 시 50~70% 회수
      </div>

      {/* 면책 강화 */}
      <div className={styles.warnBox}>
        ⓘ <strong>본 도구는 일반 환기·공기질 가이드를 제공하는 참고용 계산기</strong>입니다. 의료·산업안전 진단 도구가 아닙니다.
        천식·호흡기 질환자, 영유아, 임산부 등 민감군은 의료 전문가 상담을 권장합니다.
      </div>
    </div>
  )
}
