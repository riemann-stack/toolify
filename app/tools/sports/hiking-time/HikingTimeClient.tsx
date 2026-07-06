'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import styles from './hiking-time.module.css'
import {
  type CalcInputs, type TimelineStep,
  type FitnessLevel, type TerrainType, type PackWeight, type GroupType, type WeatherType,
  MOUNTAINS, FITNESS, TERRAIN, PACK, GROUP, WEATHER,
  SUN_AVERAGES, CHECKLIST, EMERGENCY,
  calculate, buildTimeline,
  fmtHHMM, fmtDuration, parseHHMM,
} from './hikingUtils'

const STORAGE_KEY = 'youtil:hiking-time:v1'

const DEFAULT_INPUTS: CalcInputs = {
  distanceKm: 7.0,
  elevGainM: 720,
  elevLossM: 720,
  fitness: 'normal',
  terrain: 'normal',
  pack:    'day',
  group:   'solo',
  weather: 'normal',
  startTime:  '09:00',
  sunsetTime: '18:30',
  restMode: 'auto',
  manualRestMin: 0,
}

export default function HikingTimeClient() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [region, setRegion] = useState<string>('수도권')
  const [mounted, setMounted] = useState(false)

  /* localStorage 복원 — 손상·변조 방어 (무검증 spread 시 NaN 결과 가능) */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j: unknown = JSON.parse(raw)
        if (j && typeof j === 'object') {
          const o = j as Record<string, unknown>
          const n3 = (v: unknown, lo: number, hi: number, d: number) =>
            typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d
          const en = <T,>(v: unknown, arr: { id: T }[], d: T) => arr.some((x) => x.id === v) ? (v as T) : d
          const tm = (v: unknown, d: string) => typeof v === 'string' && /^\d{1,2}:\d{2}$/.test(v) ? v : d
          const safe: CalcInputs = {
            distanceKm: n3(o.distanceKm, 1, 50, DEFAULT_INPUTS.distanceKm),
            elevGainM:  n3(o.elevGainM, 0, 2000, DEFAULT_INPUTS.elevGainM),
            elevLossM:  n3(o.elevLossM, 0, 2000, DEFAULT_INPUTS.elevLossM),
            fitness: en(o.fitness, FITNESS, DEFAULT_INPUTS.fitness),
            terrain: en(o.terrain, TERRAIN, DEFAULT_INPUTS.terrain),
            pack:    en(o.pack, PACK, DEFAULT_INPUTS.pack),
            group:   en(o.group, GROUP, DEFAULT_INPUTS.group),
            weather: en(o.weather, WEATHER, DEFAULT_INPUTS.weather),
            startTime:  tm(o.startTime, DEFAULT_INPUTS.startTime),
            sunsetTime: tm(o.sunsetTime, DEFAULT_INPUTS.sunsetTime),
            restMode: o.restMode === 'manual' ? 'manual' : 'auto',
            manualRestMin: n3(o.manualRestMin, 0, 300, 0),
          }
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setInputs(safe)
        }
      }
    } catch { /* ignore */ }
    // 현재 시각 ± 일몰 자동 설정 (hydration safe)
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    setInputs((prev) => ({
      ...prev,
      startTime: prev.startTime ?? `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`,
    }))
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs)) } catch { /* ignore */ }
  }, [inputs, mounted])

  const update = <K extends keyof CalcInputs>(k: K, v: CalcInputs[K]) => {
    setInputs((prev) => ({ ...prev, [k]: v }))
    setActivePreset(null)
  }

  const result = useMemo(() => calculate(inputs), [inputs])
  const timeline = useMemo(() => buildTimeline(inputs, result), [inputs, result])

  /* 프리셋 적용 */
  const applyPreset = (id: string) => {
    const m = MOUNTAINS.find((x) => x.id === id)
    if (!m) return
    setInputs((prev) => ({
      ...prev,
      distanceKm: m.distanceKm,
      elevGainM:  m.elevGainM,
      elevLossM:  m.elevLossM,
    }))
    setActivePreset(id)
  }

  const REGIONS = ['수도권', '강원', '경상', '충청', '전라', '제주', '종주']
  const filteredMountains = MOUNTAINS.filter((m) => m.region === region)

  /* 안전도 텍스트 */
  const safetyMessage = result.isDanger
    ? `🚨 일몰(${inputs.sunsetTime}) 이후 도착 — 야간 산행 위험!`
    : result.isRisky
      ? `⚠️ 일몰 1시간 전(${fmtHHMM(result.turnaroundMinutes)}) 이후 도착 — 헤드랜턴 필수`
      : `✓ 일몰 1시간 전(${fmtHHMM(result.turnaroundMinutes)}) 이전 도착 — 안전`

  const activePresetData = activePreset ? MOUNTAINS.find((m) => m.id === activePreset) : null

  return (
    <div className={styles.wrap}>

      {/* ════════ 통합 면책 (상단) ════════ */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/race-predictor',     label: '마라톤 예측' },
          { href: '/tools/sports/pace',               label: '러닝 페이스' },
          { href: '/tools/sports/interval-training',  label: '인터벌 훈련' },
        ]}
        sources={[
          { label: '국립공원공단', href: 'https://www.knps.or.kr' },
          { label: '산림청', href: 'https://www.forest.go.kr' },
          { label: '한국천문연구원(일출·일몰)', href: 'https://astro.kasi.re.kr/life/pageView/9' },
        ]}
      >
        개인 페이스·날씨·등산로 상태에 따라 <strong>±20% 차이</strong> 가능. 일몰 1시간 전 하산을 권장하며, 동계·우천·야간 산행은 경험자만 시도하세요. 응급 상황 시 <strong>119</strong> 즉시 신고 (산림청 산림안전 앱으로 GPS 좌표 전송). 국립공원·도립공원은 계절별 입산 시간 제한이 있으니 사전 확인 필수.
      </Disclaimer>

      {/* ════════ 1. 한국 100대 명산 프리셋 ════════ */}
      <section>
        <label className={styles.label}>한국 100대 명산 프리셋 ({MOUNTAINS.length}개)</label>
        <div className={styles.regionTabs}>
          {REGIONS.map((r) => (
            <button key={r} type="button" aria-pressed={region === r}
              className={`${styles.regionTab} ${region === r ? styles.regionTabActive : ''}`}
              onClick={() => setRegion(r)}>
              {r}
            </button>
          ))}
        </div>
        <div className={styles.mountainGrid}>
          {filteredMountains.map((m) => (
            <button key={m.id} type="button" aria-pressed={activePreset === m.id}
              className={`${styles.mountainCard} ${activePreset === m.id ? styles.mountainCardActive : ''}`}
              onClick={() => applyPreset(m.id)}>
              <div className={styles.mountainHead}>
                <span className={styles.mountainName}>{m.name}</span>
                <span className={`${styles.diffBadge} ${styles[`diff_${m.difficulty}`]}`}>{m.difficulty}</span>
              </div>
              <p className={styles.mountainStats}>
                <span>📏 {m.distanceKm}km</span>
                <span>📈 +{m.elevGainM}m</span>
                <span>⏱️ {m.baseHours}h</span>
              </p>
              <p className={styles.mountainDesc}>{m.description}</p>
            </button>
          ))}
        </div>
        {activePresetData && (
          <div className={styles.presetTip}>
            <strong>{activePresetData.name}</strong>
            <span>· 거리 {activePresetData.distanceKm}km · 표고차 +{activePresetData.elevGainM}m / -{activePresetData.elevLossM}m · {activePresetData.difficulty} · 표준 {activePresetData.baseHours}시간</span>
            <span className={styles.presetTipNote}>※ 표준 시간은 이 산의 <strong>지형 난이도({activePresetData.difficulty})가 반영된</strong> 일반 페이스 추정입니다. 아래 체력·지형·날씨 보정은 본인 조건에 맞춰 추가로 조정하세요.</span>
          </div>
        )}
      </section>

      {/* ════════ 2. 입력 영역 ════════ */}
      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>거리 · 표고차 (수동 입력 가능)</p>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span>거리</span>
            <span className={styles.headInput}>
              <input type="number" inputMode="decimal" min={1} max={50} step={0.5}
                aria-label="거리 직접 입력 (km)" value={inputs.distanceKm}
                onChange={(e) => update('distanceKm', Math.min(50, Math.max(1, +e.target.value || 0)))}
                className={styles.headNumber} />
              <span className={styles.headUnit}>km</span>
            </span>
          </div>
          <input type="range" min={1} max={50} step={0.5} value={inputs.distanceKm}
            aria-label="거리 (km)" aria-valuetext={`${inputs.distanceKm.toFixed(1)}km`}
            onChange={(e) => update('distanceKm', +e.target.value)} className={styles.slider} />
        </div>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span>오르막 표고차</span>
            <span className={styles.headInput}>
              <input type="number" inputMode="numeric" min={0} max={2000} step={10}
                aria-label="오르막 표고차 직접 입력 (m)" value={inputs.elevGainM}
                onChange={(e) => update('elevGainM', Math.min(2000, Math.max(0, +e.target.value || 0)))}
                className={styles.headNumber} />
              <span className={styles.headUnit}>m</span>
            </span>
          </div>
          <input type="range" min={0} max={2000} step={10} value={inputs.elevGainM}
            aria-label="오르막 표고차 (m)" aria-valuetext={`${inputs.elevGainM}m`}
            onChange={(e) => update('elevGainM', +e.target.value)} className={styles.slider} />
        </div>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <span>내리막 표고차</span>
            <span className={styles.headInput}>
              <input type="number" inputMode="numeric" min={0} max={2000} step={10}
                aria-label="내리막 표고차 직접 입력 (m)" value={inputs.elevLossM}
                onChange={(e) => update('elevLossM', Math.min(2000, Math.max(0, +e.target.value || 0)))}
                className={styles.headNumber} />
              <span className={styles.headUnit}>m</span>
            </span>
          </div>
          <input type="range" min={0} max={2000} step={10} value={inputs.elevLossM}
            aria-label="내리막 표고차 (m)" aria-valuetext={`${inputs.elevLossM}m`}
            onChange={(e) => update('elevLossM', +e.target.value)} className={styles.slider} />
        </div>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>체력 등급</p>
        <div className={styles.pillRow}>
          {FITNESS.map((f) => (
            <button key={f.id} type="button" aria-pressed={inputs.fitness === f.id}
              className={`${styles.pill} ${inputs.fitness === f.id ? styles.pillActive : ''}`}
              onClick={() => update('fitness', f.id as FitnessLevel)}
              title={f.desc}>
              {f.label}
              <span className={styles.pillSub}>×{f.factor.toFixed(2)}</span>
            </button>
          ))}
        </div>
        <p className={styles.note}>{FITNESS.find((f) => f.id === inputs.fitness)?.desc}</p>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>지형 유형</p>
        <div className={styles.pillRow}>
          {TERRAIN.map((t) => (
            <button key={t.id} type="button" aria-pressed={inputs.terrain === t.id}
              className={`${styles.pill} ${inputs.terrain === t.id ? styles.pillActive : ''}`}
              onClick={() => update('terrain', t.id as TerrainType)}>
              {t.label}
              <span className={styles.pillSub}>×{t.factor.toFixed(2)}</span>
            </button>
          ))}
        </div>
        <p className={styles.note}>{TERRAIN.find((t) => t.id === inputs.terrain)?.desc}</p>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>배낭 무게</p>
        <div className={styles.pillRow}>
          {PACK.map((p) => (
            <button key={p.id} type="button" aria-pressed={inputs.pack === p.id}
              className={`${styles.pill} ${inputs.pack === p.id ? styles.pillActive : ''}`}
              onClick={() => update('pack', p.id as PackWeight)}>
              {p.label} {p.weightKg}kg
              <span className={styles.pillSub}>×{p.factor.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>그룹 인원</p>
        <div className={styles.pillRow}>
          {GROUP.map((g) => (
            <button key={g.id} type="button" aria-pressed={inputs.group === g.id}
              className={`${styles.pill} ${inputs.group === g.id ? styles.pillActive : ''}`}
              onClick={() => update('group', g.id as GroupType)}>
              {g.label}
              <span className={styles.pillSub}>×{g.factor.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>계절·날씨</p>
        <div className={styles.pillRow}>
          {WEATHER.map((w) => (
            <button key={w.id} type="button" aria-pressed={inputs.weather === w.id}
              className={`${styles.pill} ${inputs.weather === w.id ? styles.pillActive : ''}`}
              onClick={() => update('weather', w.id as WeatherType)}>
              {w.label}
              <span className={styles.pillSub}>×{w.factor.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>시작·일몰 시각</p>
        <div className={styles.timeRow}>
          <div className={styles.timeInputBlock}>
            <label htmlFor="hiking-time-time">출발 시각</label>
            <input id="hiking-time-time" type="time" className={styles.timeInput}
              value={inputs.startTime}
              onChange={(e) => update('startTime', e.target.value)} />
          </div>
          <div className={styles.timeInputBlock}>
            <label htmlFor="hiking-time-time-2">일몰 시각</label>
            <input id="hiking-time-time-2" type="time" className={styles.timeInput}
              value={inputs.sunsetTime}
              onChange={(e) => update('sunsetTime', e.target.value)} />
          </div>
        </div>
        <p className={styles.note}>일몰 시각은 네이버에서 &quot;[지역명] 일몰&quot; 검색 후 입력. 또는 아래 안전 가이드의 월별 평균표 참조.</p>
      </section>

      <section className={styles.optionCard}>
        <p className={styles.gapTitle}>휴식 시간</p>
        <div className={styles.pillRow}>
          <button type="button" aria-pressed={inputs.restMode === 'auto'}
            className={`${styles.pill} ${inputs.restMode === 'auto' ? styles.pillActive : ''}`}
            onClick={() => update('restMode', 'auto')}>
            자동 (50분 보행 + 10분 휴식)
          </button>
          <button type="button" aria-pressed={inputs.restMode === 'manual'}
            className={`${styles.pill} ${inputs.restMode === 'manual' ? styles.pillActive : ''}`}
            onClick={() => update('restMode', 'manual')}>
            수동 입력
          </button>
        </div>
        {inputs.restMode === 'manual' && (
          <div className={styles.numberRow} style={{ marginTop: 10 }}>
            <label htmlFor="hiking-time-time-3">총 휴식 시간 (분)</label>
            <input id="hiking-time-time-3"
              type="number" inputMode="decimal" min={0} max={300}
              className={styles.smallNumber}
              value={inputs.manualRestMin}
              onChange={(e) => update('manualRestMin', +e.target.value || 0)}
            />
            <span>분</span>
          </div>
        )}
      </section>

      {/* ════════ 3. 결과 카드 ════════ */}
      <section>
        <div role="status" aria-live="polite" className={`${styles.resultMain} ${result.isDanger ? styles.resultDanger : result.isRisky ? styles.resultRisky : styles.resultSafe}`}>
          <div className={styles.resultLeft}>
            <p className={styles.resultLabel}>총 소요 시간 (한국 표준 기준)</p>
            <p className={styles.resultBig}>{fmtDuration(result.totalMin)}</p>
            <p className={styles.resultSub}>
              {mounted
                ? <>출발 {inputs.startTime} → 도착 <strong>{fmtHHMM(result.arrivalMinutes)}</strong></>
                : '계산 중…'}
            </p>
            <p className={`${styles.safetyMsg} ${result.isDanger ? styles.dangerMsg : result.isRisky ? styles.riskyMsg : styles.safeMsg}`}>
              {safetyMessage}
            </p>
          </div>

          <div className={styles.resultBreakdown}>
            <div>
              <span>오르막</span>
              <strong>{fmtDuration(result.selected.ascendMin)}</strong>
            </div>
            <div>
              <span>내리막·평지</span>
              <strong>{fmtDuration(result.selected.descendMin + result.selected.flatMin)}</strong>
            </div>
            <div>
              <span>휴식</span>
              <strong>{fmtDuration(result.restMin)}</strong>
            </div>
          </div>
        </div>

        {/* 보정 내역 */}
        <div className={styles.adjustmentsBox}>
          <p className={styles.adjustmentsTitle}>적용 보정 (총 ×{result.appliedFactor.toFixed(2)})</p>
          <div className={styles.adjustmentsList}>
            {result.factorBreakdown.map((f, i) => (
              <span key={i} className={styles.adjChip}>
                {f.label} <strong>×{f.factor.toFixed(2)}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* 3공식 비교 */}
        <div className={styles.formulaCompare}>
          <p className={styles.formulaTitle}>3 공식 비교 (보정 적용)</p>
          <div className={styles.formulaGrid}>
            {result.formulas.map((f) => (
              <div key={f.formula} className={`${styles.formulaCard} ${f.formula === 'korean' ? styles.formulaCardActive : ''}`}>
                <p className={styles.formulaName}>{f.label}</p>
                <p className={styles.formulaTime}>{fmtDuration(f.totalMin)}</p>
                <p className={styles.formulaSub}>
                  오르막 {fmtDuration(f.ascendMin)} · 내림·평지 {fmtDuration(f.descendMin + f.flatMin)}
                </p>
              </div>
            ))}
          </div>
          <p className={styles.note}>※ 한국 코스타임(100대 명산 표준 소요시간 보정)이 한국 산 환경에 가장 가까움 (기본 적용). Naismith는 영국 평균, Tobler는 경사 정밀.</p>
        </div>
      </section>

      {/* ════════ 4. 단계별 타임라인 ════════ */}
      <section>
        <label className={styles.label}>단계별 도착 예상 시각</label>
        <TimelineSvg timeline={timeline} sunsetMinutes={parseHHMM(inputs.sunsetTime)} startMinutes={parseHHMM(inputs.startTime)} />
        <div className={styles.timelineList}>
          {timeline.map((step, i) => {
            const dangerous = step.arrivalAtMinutes > parseHHMM(inputs.sunsetTime)
            const risky = !dangerous && step.arrivalAtMinutes > result.turnaroundMinutes
            return (
              <div key={i} className={`${styles.timelineItem} ${step.isSummit ? styles.timelineSummit : ''} ${dangerous ? styles.timelineDanger : risky ? styles.timelineRisky : ''}`}>
                <span className={styles.timelineKm}>{step.km.toFixed(0)}km</span>
                <span className={styles.timelineLabel}>{step.label}</span>
                <span className={styles.timelineTime}>{fmtHHMM(step.arrivalAtMinutes)}</span>
                <span className={styles.timelineDuration}>+{fmtDuration(step.minutesFromStart)}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* ════════ 5. 안전 가이드 ════════ */}
      <section>
        <label className={styles.label}>등산 안전 가이드</label>

        {/* 일출·일몰 평균표 */}
        <div className={styles.optionCard}>
          <p className={styles.gapTitle}>월별 일출·일몰 평균 (한국 도시별)</p>
          <div className={styles.tableWrap}>
            <table className={styles.sunTable}>
              <thead>
                <tr>
                  <th scope="col">월</th>
                  <th scope="col">서울 (일출/일몰)</th>
                  <th scope="col">부산</th>
                  <th scope="col">제주</th>
                </tr>
              </thead>
              <tbody>
                {SUN_AVERAGES.map((s) => (
                  <tr key={s.month}>
                    <td>{s.month}월</td>
                    <td>{s.seoul.rise} / {s.seoul.set}</td>
                    <td>{s.busan.rise} / {s.busan.set}</td>
                    <td>{s.jeju.rise} / {s.jeju.set}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>※ 월별 평균 근사치(중순 기준) — 정확한 일자별·지역별 시각은 <a href="https://astro.kasi.re.kr/life/pageView/9" target="_blank" rel="noopener noreferrer">한국천문연구원 일출·일몰 시각 계산</a> 또는 네이버 &quot;[지역명] 일몰&quot; 검색에서 확인하세요.</p>
        </div>

        {/* 비상 연락 */}
        <div className={styles.emergencyCard}>
          <p className={styles.gapTitle}>🚨 비상 연락처</p>
          <div className={styles.emergencyGrid}>
            <a href="tel:119" className={styles.emergencyItem}>
              <span className={styles.emergencyNum}>119</span>
              <span>소방·구급·산악구조</span>
            </a>
            <a href="tel:1670-9201" className={styles.emergencyItem}>
              <span className={styles.emergencyNum}>1670-9201</span>
              <span>국립공원공단 콜센터<br/>(국립공원 사고·문의)</span>
            </a>
            <div className={styles.emergencyItem}>
              <span className={styles.emergencyApp}>📱</span>
              <span>산림청 &quot;산림안전&quot; 앱<br/>(GPS 좌표 신고)</span>
            </div>
          </div>
        </div>

        {/* 체크리스트 */}
        <div className={styles.optionCard}>
          <p className={styles.gapTitle}>등산 준비 체크리스트</p>
          <ul className={styles.checklist}>
            {CHECKLIST.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {/* 비상 대응 */}
        <div className={styles.optionCard}>
          <p className={styles.gapTitle}>🆘 비상 상황 대응</p>
          <div className={styles.emergencySteps}>
            {EMERGENCY.map((e, i) => (
              <div key={i} className={styles.emergencyStep}>
                <p className={styles.emergencyTitle}>{e.title}</p>
                <ol>
                  {e.steps.map((s, j) => <li key={j}>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}

/* ─── SVG 타임라인 ─── */
function TimelineSvg({ timeline, sunsetMinutes, startMinutes }: { timeline: TimelineStep[]; sunsetMinutes: number; startMinutes: number }) {
  if (timeline.length < 2) return null
  const W = 600, H = 100, padL = 30, padR = 30, padT = 30, padB = 30
  const maxKm = timeline[timeline.length - 1].km
  const xOf = (km: number) => padL + (km / Math.max(0.1, maxKm)) * (W - padL - padR)

  // 일몰 위치 (시간 → km로 역산)
  const totalMin = timeline[timeline.length - 1].minutesFromStart
  const sunsetMinFromStart = sunsetMinutes - startMinutes
  const sunsetX = sunsetMinFromStart > 0 && sunsetMinFromStart < totalMin
    ? padL + (sunsetMinFromStart / totalMin) * (W - padL - padR)
    : null

  return (
    <div className={styles.timelineSvgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.timelineSvg} preserveAspectRatio="xMidYMid meet"
        role="img" aria-label="등산 진행 타임라인 — 출발·정상·도착 시각과 일몰 시점 표시 (아래 목록에 동일 정보)">
        {/* 메인 라인 */}
        <line x1={padL} y1={H/2} x2={W-padR} y2={H/2} stroke="var(--border)" strokeWidth="2" />

        {/* 일몰 마커 */}
        {sunsetX !== null && (
          <>
            <line x1={sunsetX} y1={padT-10} x2={sunsetX} y2={H-padB+10} stroke="#DC2626" strokeWidth="2" strokeDasharray="4 3" />
            <text x={sunsetX} y={padT-12} fill="#DC2626" fontSize="10" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight="700">
              🌅 일몰 {fmtHHMM(sunsetMinutes)}
            </text>
          </>
        )}

        {/* 정상·시작·끝 점 */}
        {timeline.map((step, i) => {
          const x = xOf(step.km)
          const isEdge = i === 0 || i === timeline.length - 1
          const fill = step.isSummit ? '#0EA5E9' : isEdge ? '#0891B2' : 'var(--muted)'
          const r = step.isSummit ? 7 : isEdge ? 6 : 4
          return (
            <g key={i}>
              <circle cx={x} cy={H/2} r={r} fill={fill} stroke="#0B0B0B" strokeWidth="2" />
              {(step.isSummit || isEdge) && (
                <text x={x} y={H/2 + 22} fill="var(--text)" fontSize="10" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">
                  {fmtHHMM(step.arrivalAtMinutes)}
                </text>
              )}
              {step.isSummit && (
                <text x={x} y={H/2 - 14} fontSize="14" textAnchor="middle">🏔️</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
