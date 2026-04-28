'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './uv-protection.module.css'

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const fmt = (v: number, dp = 0): string => {
  if (!Number.isFinite(v)) return '-'
  return v.toLocaleString('ko-KR', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
const round = (v: number, dp = 1) => Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp)

// ─────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────
type SkinTypeId = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'
const SKIN_TYPES: {
  id: SkinTypeId
  name: string
  desc: string
  swatch: string
  medJm2: number
  multiplier: number
  koreanRatio: string
  isKoreanCommon: boolean
}[] = [
  { id: 'I',   name: '타입 I',   desc: '매우 흰 피부, 항상 화상',          swatch: '#FFE4D6', medJm2: 200,  multiplier: 2.5, koreanRatio: '1% 미만',        isKoreanCommon: false },
  { id: 'II',  name: '타입 II',  desc: '흰 피부, 보통 화상',                 swatch: '#FFD4BB', medJm2: 250,  multiplier: 3,   koreanRatio: '1~5%',          isKoreanCommon: false },
  { id: 'III', name: '타입 III', desc: '한국인 평균, 가끔 화상',              swatch: '#E8B894', medJm2: 300,  multiplier: 4,   koreanRatio: '40~50%',         isKoreanCommon: true },
  { id: 'IV',  name: '타입 IV',  desc: '약간 어두움, 드물게 화상',            swatch: '#C8956D', medJm2: 450,  multiplier: 5,   koreanRatio: '40~50%',         isKoreanCommon: true },
  { id: 'V',   name: '타입 V',   desc: '어두운 피부, 매우 드물게 화상',       swatch: '#8D5524', medJm2: 600,  multiplier: 8,   koreanRatio: '5% 미만',        isKoreanCommon: false },
  { id: 'VI',  name: '타입 VI',  desc: '매우 어두움, 거의 화상 X',           swatch: '#553A29', medJm2: 1000, multiplier: 12,  koreanRatio: '1% 미만',        isKoreanCommon: false },
]

type SpfId = 'none' | 'spf15' | 'spf30' | 'spf50' | 'spf70'
const SPF_OPTIONS: { id: SpfId; spf: number; blocks: number; name: string; cls: string }[] = [
  { id: 'none',  spf: 1,  blocks: 0,    name: '없음',     cls: s.spfNone },
  { id: 'spf15', spf: 15, blocks: 93.3, name: 'SPF 15',  cls: s.spf15 },
  { id: 'spf30', spf: 30, blocks: 96.7, name: 'SPF 30',  cls: s.spf30 },
  { id: 'spf50', spf: 50, blocks: 98.0, name: 'SPF 50',  cls: s.spf50 },
  { id: 'spf70', spf: 70, blocks: 98.6, name: 'SPF 70+', cls: s.spf70 },
]

type EnvId = 'daily' | 'running' | 'beach' | 'hiking' | 'snow' | 'water' | 'driving'
const ENVIRONMENTS: { id: EnvId; name: string; mult: number; icon: string; cls: string; note: string }[] = [
  { id: 'daily',   name: '일상 외출',  mult: 1.0, icon: '🚶', cls: '',          note: '' },
  { id: 'running', name: '러닝·운동',  mult: 1.0, icon: '🏃', cls: '',          note: '땀으로 SPF 효과 단축' },
  { id: 'beach',   name: '해변·수영장',mult: 1.5, icon: '🏖️', cls: s.envBeach,  note: '모래·물 반사로 자외선 약 50% 증가' },
  { id: 'hiking',  name: '등산·고지대',mult: 1.2, icon: '⛰️', cls: s.envHiking, note: '고도 1km당 자외선 약 12% 증가' },
  { id: 'snow',    name: '눈·스키',    mult: 1.8, icon: '⛷️', cls: s.envSnow,   note: '눈 반사로 자외선 약 80% 증가' },
  { id: 'water',   name: '수상 스포츠',mult: 1.5, icon: '🚤', cls: s.envWater,  note: '물 반사로 자외선 약 50% 증가' },
  { id: 'driving', name: '운전·실내',  mult: 0.5, icon: '🚗', cls: s.envDriving,note: '유리창 UVB 차단, UVA 일부 통과' },
]

// UV 등급
const UV_LEVELS: { range: [number, number]; level: string; color: string; icon: string; advice: string; heroCls: string; quickCls: string }[] = [
  { range: [0, 2],   level: '낮음',     color: '#3EFF9B', icon: '🟢', advice: '특별한 보호 불필요. 야외 활동 무리 없음.',                heroCls: s.heroLow,     quickCls: s.uvQuickLow },
  { range: [3, 5],   level: '보통',     color: '#FFD700', icon: '🟡', advice: '오전 10시~오후 4시 차단제·모자 권장.',                  heroCls: s.heroMid,     quickCls: s.uvQuickMid },
  { range: [6, 7],   level: '높음',     color: '#FF8C3E', icon: '🟠', advice: '차단제·모자·긴 옷 필수. 그늘 활용.',                    heroCls: s.heroHigh,    quickCls: s.uvQuickHigh },
  { range: [8, 10],  level: '매우 높음', color: '#FF6B6B', icon: '🔴', advice: '오전 10시~오후 4시 야외 활동 자제. 추가 보호 필수.',     heroCls: s.heroVHigh,   quickCls: s.uvQuickVHigh },
  { range: [11, 20], level: '위험',     color: '#9B59B6', icon: '🟣', advice: '가능한 외출 자제. 모든 보호 수단 필수.',                heroCls: s.heroExtreme, quickCls: s.uvQuickExtreme },
]
function findUvLevel(uvi: number) {
  return UV_LEVELS.find(l => uvi >= l.range[0] && uvi <= l.range[1]) ?? UV_LEVELS[0]
}

// ─────────────────────────────────────────────
// 핵심 계산
// ─────────────────────────────────────────────
function calcBurnTime(input: {
  uvIndex: number
  skinTypeId: SkinTypeId
  spfId: SpfId
  envId: EnvId
  altitude: number
  cloudCover: number
  isWaterContact: boolean
}) {
  const skin = SKIN_TYPES.find(x => x.id === input.skinTypeId)!
  const spf = SPF_OPTIONS.find(x => x.id === input.spfId)!
  const env = ENVIRONMENTS.find(x => x.id === input.envId)!

  const altitudeMult = 1 + Math.max(0, input.altitude / 1000) * 0.12
  const cloudMult = 1 - (Math.min(100, Math.max(0, input.cloudCover)) / 100) * 0.3
  const adjustedUvi = Math.max(0.1, input.uvIndex * env.mult * altitudeMult * cloudMult)

  // 단순 공식
  const t1 = (200 * skin.multiplier) / (3 * adjustedUvi)
  // MED 기반
  const irradiance = adjustedUvi * 0.025
  const t2 = skin.medJm2 / (irradiance * 60)
  const baseMin = Math.min(t1, t2)

  // SPF 적용 (도포량 50% 보수적)
  const realSpf = 1 + 0.5 * (spf.spf - 1)
  let withSpf = baseMin * realSpf
  if (input.isWaterContact && spf.spf > 1) withSpf *= 0.5

  // 보수적 범위 (±30%)
  return {
    adjustedUvi,
    uvLevel: findUvLevel(adjustedUvi),
    base: baseMin,
    withSpf,
    rangeMin: withSpf * 0.7,
    rangeMax: withSpf * 1.3,
    spfBlocks: spf.blocks,
    reapplyMinutes: input.isWaterContact ? 60 : 120,
  }
}

function fmtMinutes(min: number): string {
  if (!Number.isFinite(min)) return '-'
  if (min < 1) return '< 1분'
  if (min < 60) return `${Math.round(min)}분`
  const h = Math.floor(min / 60)
  const m = Math.round(min - h * 60)
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}
function fmtRange(minVal: number, maxVal: number): string {
  if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) return '-'
  if (maxVal < 60) return `약 ${Math.round(minVal)}~${Math.round(maxVal)}분`
  if (minVal < 60 && maxVal >= 60) return `약 ${Math.round(minVal)}분 ~ ${fmtMinutes(maxVal)}`
  return `약 ${fmtMinutes(minVal)} ~ ${fmtMinutes(maxVal)}`
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function UvProtectionClient() {
  const [tab, setTab] = useState<'calc' | 'activity' | 'reference'>('calc')

  const [uvIndex, setUvIndex] = useState<number>(6)
  const [skinTypeId, setSkinTypeId] = useState<SkinTypeId>('III')
  const [spfId, setSpfId] = useState<SpfId>('spf50')
  const [envId, setEnvId] = useState<EnvId>('daily')
  const [altitude, setAltitude] = useState<number>(0)
  const [cloudCover, setCloudCover] = useState<number>(0)
  const [isWaterContact, setIsWaterContact] = useState<boolean>(false)

  // 재도포 카운트다운
  const [reapplyStartedAt, setReapplyStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState<number>(Date.now())
  useEffect(() => {
    if (reapplyStartedAt === null) return
    const tid = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(tid)
  }, [reapplyStartedAt])

  // 복사
  const [copied, setCopied] = useState<boolean>(false)

  const result = useMemo(() => calcBurnTime({
    uvIndex, skinTypeId, spfId, envId, altitude, cloudCover, isWaterContact,
  }), [uvIndex, skinTypeId, spfId, envId, altitude, cloudCover, isWaterContact])

  const env = ENVIRONMENTS.find(e => e.id === envId)!

  // 시나리오 비교 (UV 동일, 환경/고도/구름 동일, SPF만 변동)
  const scenarios = useMemo(() => {
    const opts: SpfId[] = ['none', 'spf30', 'spf50']
    return opts.map(id => {
      const r = calcBurnTime({ uvIndex, skinTypeId, spfId: id, envId, altitude, cloudCover, isWaterContact })
      return { id, r, name: SPF_OPTIONS.find(x => x.id === id)!.name }
    })
  }, [uvIndex, skinTypeId, envId, altitude, cloudCover, isWaterContact])

  // 재도포 카운트다운
  type Countdown = { isDue: true } | { isDue: false; min: number; sec: number }
  const reapplyCountdown: Countdown | null = useMemo(() => {
    if (reapplyStartedAt === null) return null
    const elapsedMs = now - reapplyStartedAt
    const remaining = result.reapplyMinutes * 60 * 1000 - elapsedMs
    if (remaining <= 0) return { isDue: true }
    const min = Math.floor(remaining / 60000)
    const sec = Math.floor((remaining % 60000) / 1000)
    return { isDue: false, min, sec }
  }, [reapplyStartedAt, now, result.reapplyMinutes])

  // 환경별 안내
  const envNotes = useMemo(() => {
    const notes: string[] = []
    if (env.note) notes.push(env.note)
    if (envId === 'running' && uvIndex >= 6) {
      notes.push('땀으로 SPF 효과 빨리 감소 — 1시간마다 재도포 권장')
    }
    if (envId === 'beach' && uvIndex >= 8) {
      notes.push('자외선이 매우 강함 — 차단복·그늘·SPF 50 + 방수 권장')
    }
    if (envId === 'hiking' && altitude >= 1000) {
      notes.push(`해발 ${altitude}m — 평지보다 자외선 ${round((altitude / 1000) * 12, 0)}% 증가`)
    }
    if (envId === 'driving') {
      notes.push('UVA는 유리창 통과 — 장시간 운전 시 SPF 30+ 사용 권장 (특히 왼팔·얼굴)')
    }
    return notes
  }, [env, envId, uvIndex, altitude])

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    const skin = SKIN_TYPES.find(x => x.id === skinTypeId)!
    const spf = SPF_OPTIONS.find(x => x.id === spfId)!
    const text = [
      `[자외선 노출 가이드 — 참고용 추정치]`,
      `UV 지수: ${uvIndex} (환경 보정 후 ${round(result.adjustedUvi, 1)})`,
      `등급: ${result.uvLevel.icon} ${result.uvLevel.level}`,
      `피부 타입: ${skin.name} · SPF: ${spf.name} · 환경: ${env.icon} ${env.name}`,
      ``,
      `무보호 화상 위험: ${fmtMinutes(result.base)}`,
      `${spf.name} 적용 (이상적): ${fmtRange(result.rangeMin, result.rangeMax)}`,
      ``,
      `※ '안전 시간'이 아닌 화상 위험 추정치입니다.`,
      `※ 실제 도포량·땀·재도포 빈도에 따라 보호 시간이 단축될 수 있습니다.`,
      ``,
      `https://youtil.kr/tools/health/uv-protection`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  // ─────────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────────
  return (
    <div className={s.wrap}>
      {/* 의료 도구 강조 면책 */}
      <div className={s.medicalDisclaimer}>
        <strong>ℹ️ 이 도구는 참고용 추정 도구입니다.</strong> UV 지수·피부 타입·SPF 기반 일광화상 위험 시간 <strong>추정치</strong>를 제공하며,
        다음 요인에 따라 실제 위험은 달라질 수 있습니다:
        <ul>
          <li>개인 피부 상태·민감도·복용 약물</li>
          <li>지역·고도·계절·시간대·구름 양·반사면</li>
          <li>차단제 도포량·균등성·재도포 빈도</li>
        </ul>
        <strong>표시된 시간은 &lsquo;안전 시간&rsquo;이 아닌 &lsquo;화상 위험 추정 시간&rsquo;</strong>입니다.
        피부 이상 증상(붉어짐·통증·물집)이 있다면 즉시 그늘로 이동하고, 필요 시 피부과 전문의 상담을 받으세요.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'calc'      ? s.tabActive : ''}`} onClick={() => setTab('calc')}>위험 시간 계산</button>
        <button className={`${s.tabBtn} ${tab === 'activity'  ? s.tabActive : ''}`} onClick={() => setTab('activity')}>활동별 가이드</button>
        <button className={`${s.tabBtn} ${tab === 'reference' ? s.tabActive : ''}`} onClick={() => setTab('reference')}>SPF·UV 비교표</button>
      </div>

      {/* ──────────── TAB 1 ──────────── */}
      {tab === 'calc' && (
        <>
          {/* UV 지수 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>UV 지수</span>
              <span className={s.cardLabelHint}>0~15</span>
            </div>
            <div className={s.uvSliderWrap}>
              <div className={s.uvSliderTrack}>
                <input
                  type="range" min={0} max={15} step={1}
                  value={uvIndex}
                  onChange={e => setUvIndex(Number(e.target.value))}
                  className={s.uvSliderInput}
                  aria-label="UV 지수"
                />
              </div>
              <div className={s.uvSliderLabels}>
                <span>0</span><span>3</span><span>6</span><span>8</span><span>11</span><span>15</span>
              </div>
              <div className={s.uvIndexNum} style={{ color: result.uvLevel.color }}>
                {uvIndex}
                <div>
                  <span className={s.uvIndexBadge} style={{ background: `${result.uvLevel.color}22`, color: result.uvLevel.color }}>
                    {result.uvLevel.icon} {result.uvLevel.level}
                  </span>
                </div>
              </div>
            </div>
            <div className={s.uvQuickRow}>
              <button className={`${s.uvQuickBtn} ${s.uvQuickLow}     ${uvIndex >= 0  && uvIndex <= 2  ? s.uvQuickActive : ''}`} onClick={() => setUvIndex(2)}  type="button">🟢 0~2<br /><small>낮음</small></button>
              <button className={`${s.uvQuickBtn} ${s.uvQuickMid}     ${uvIndex >= 3  && uvIndex <= 5  ? s.uvQuickActive : ''}`} onClick={() => setUvIndex(4)}  type="button">🟡 3~5<br /><small>보통</small></button>
              <button className={`${s.uvQuickBtn} ${s.uvQuickHigh}    ${uvIndex >= 6  && uvIndex <= 7  ? s.uvQuickActive : ''}`} onClick={() => setUvIndex(7)}  type="button">🟠 6~7<br /><small>높음</small></button>
              <button className={`${s.uvQuickBtn} ${s.uvQuickVHigh}   ${uvIndex >= 8  && uvIndex <= 10 ? s.uvQuickActive : ''}`} onClick={() => setUvIndex(9)}  type="button">🔴 8~10<br /><small>매우 높음</small></button>
              <button className={`${s.uvQuickBtn} ${s.uvQuickExtreme} ${uvIndex >= 11                 ? s.uvQuickActive : ''}`} onClick={() => setUvIndex(11)} type="button">🟣 11+<br /><small>위험</small></button>
            </div>
            <div className={s.uvSourceLink}>
              📡 현재 UV 지수를 모르세요? <a href="https://www.weather.go.kr/w/theme/daily-life/life-jobs.do" target="_blank" rel="noopener noreferrer">한국 기상청 자외선지수</a>에서 확인하세요.
            </div>
          </div>

          {/* 피부 타입 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>피부 타입 (Fitzpatrick)</span>
              <span className={s.cardLabelHint}>한국인은 보통 III·IV</span>
            </div>
            <div className={s.skinGrid}>
              {SKIN_TYPES.map(t => (
                <button
                  key={t.id}
                  className={`${s.skinCard} ${t.isKoreanCommon ? s.skinKoreanCommon : ''} ${skinTypeId === t.id ? s.skinActive : ''}`}
                  onClick={() => setSkinTypeId(t.id)}
                  type="button"
                >
                  <div className={s.skinSwatch} style={{ background: t.swatch }} />
                  <p className={s.skinName}>{t.name}</p>
                  <p className={s.skinDesc}>{t.desc}</p>
                  <span className={s.skinKoreanRatio}>한국인 {t.koreanRatio}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SPF */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>자외선 차단제 (SPF)</span>
              <span className={s.cardLabelHint}>SPF 50이 한국 표준</span>
            </div>
            <div className={s.spfGrid}>
              {SPF_OPTIONS.map(o => (
                <button
                  key={o.id}
                  className={`${s.spfCard} ${o.cls} ${spfId === o.id ? s.spfActive : ''}`}
                  onClick={() => setSpfId(o.id)}
                  type="button"
                >
                  <p className={s.spfName}>{o.name}</p>
                  <p className={s.spfBlocks}>{o.blocks > 0 ? `차단 ${o.blocks}%` : '차단 0%'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 환경 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>활동 환경</span>
              <span className={s.cardLabelHint}>반사면 보정</span>
            </div>
            <div className={s.envGrid}>
              {ENVIRONMENTS.map(e => (
                <button
                  key={e.id}
                  className={`${s.envCard} ${e.cls} ${envId === e.id ? s.envActive : ''}`}
                  onClick={() => setEnvId(e.id)}
                  type="button"
                >
                  <div className={s.envIcon}>{e.icon}</div>
                  <p className={s.envName}>{e.name}</p>
                  <p className={s.envMult}>× {e.mult.toFixed(1)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 고급 옵션 */}
          <details className={s.advancedDetails}>
            <summary className={s.advancedSummary}>고급 옵션 (고도·구름·수영)</summary>
            <div className={s.advancedBody}>
              <div>
                <span className={s.subLabel}>고도 (m): {altitude}m</span>
                <div className={s.sliderRow}>
                  <input type="range" min={0} max={5000} step={100} value={altitude} onChange={e => setAltitude(Number(e.target.value))} />
                  <span className={s.sliderValue}>{fmt(altitude)}m</span>
                </div>
              </div>
              <div>
                <span className={s.subLabel}>구름 양 (%): {cloudCover}%</span>
                <div className={s.sliderRow}>
                  <input type="range" min={0} max={100} step={10} value={cloudCover} onChange={e => setCloudCover(Number(e.target.value))} />
                  <span className={s.sliderValue}>{cloudCover}%</span>
                </div>
              </div>
              <label className={s.checkboxRow}>
                <input type="checkbox" checked={isWaterContact} onChange={e => setIsWaterContact(e.target.checked)} />
                💧 수영·물 접촉 또는 다량의 땀 (SPF 효과 약 50% 단축)
              </label>
            </div>
          </details>

          {/* HERO */}
          <div className={`${s.hero} ${result.uvLevel.heroCls}`}>
            <p className={s.heroLead}>화상 위험 추정 시간</p>
            <p className={s.heroLevelLabel}>{result.uvLevel.icon} {result.uvLevel.level} (UV 지수 {round(result.adjustedUvi, 1)})</p>
            <div>
              <span className={s.heroNum}>{fmtRange(result.rangeMin, result.rangeMax)}</span>
            </div>
            <p className={s.heroSub}>
              {SPF_OPTIONS.find(x => x.id === spfId)!.name} 사용 + 이상적 도포 가정 ·
              {' '}<span className={s.heroSubAccent}>{result.uvLevel.advice}</span>
            </p>
            <p className={s.heroFinePrint}>
              ⚠️ 이 시간은 <strong style={{ color: 'var(--text)' }}>안전 시간이 아닌 화상 위험 추정 시간</strong>입니다.
              실제 도포량 부족·땀·재도포 미실시로 보호 시간이 약 50% 수준으로 단축될 수 있습니다.
            </p>
          </div>

          {/* 시나리오 비교 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>SPF별 비교 (UV {round(result.adjustedUvi, 1)} 환경 동일)</span>
            </div>
            <table className={s.scenarioTable}>
              <thead>
                <tr>
                  <th>조건</th>
                  <th>화상 위험 시간 (추정 범위)</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(sc => (
                  <tr key={sc.id} className={sc.id === spfId ? s.currentRow : ''}>
                    <td>{sc.name}{isWaterContact && sc.id !== 'none' ? ' + 수영·땀' : ''}</td>
                    <td>{sc.id === 'none' ? fmtMinutes(sc.r.base) : fmtRange(sc.r.rangeMin, sc.r.rangeMax)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              ⚠️ 위 수치는 도포량 충분 + 균등 도포 + 재도포 가정. 실제로는 도포량 부족·땀·물 등으로 보호 시간이 약 50% 수준일 수 있습니다.
            </p>
          </div>

          {/* 행동 가이드 */}
          <div className={s.guideCard}>
            <p className={s.guideTitle}>🛡️ 권장 보호 행동</p>
            <ul>
              <li>오전 10시~오후 4시 야외 활동 자제</li>
              <li>SPF 30 이상 광범위(UVA·UVB) 차단제 사용</li>
              <li>모자·선글라스(UV400)·긴팔 활용</li>
              <li>충분한 수분 섭취</li>
              <li>차단제 2시간마다 재도포 (수영·땀 후 즉시 재도포)</li>
              <li>입술·귀·목 뒤·발등 등 자주 잊는 부위 주의</li>
            </ul>
          </div>

          {/* 환경별 추가 안내 */}
          {envNotes.length > 0 && (
            <div className={s.envNoteCard}>
              <strong>📌 {env.icon} {env.name} 추가 안내:</strong>
              <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                {envNotes.map((note, i) => <li key={i}>{note}</li>)}
              </ul>
            </div>
          )}

          {/* 재도포 카운트다운 */}
          <div className={s.reapplyCard}>
            <p className={s.reapplyTitle}>⏰ 재도포 알림 (권장 {result.reapplyMinutes}분 간격)</p>
            <div className={s.reapplyTimer}>
              {reapplyStartedAt === null || reapplyCountdown === null ? (
                <>
                  <p className={s.reapplyValue}>{result.reapplyMinutes}<small>분</small></p>
                  <button className={s.reapplyBtn} onClick={() => { setReapplyStartedAt(Date.now()); setNow(Date.now()) }} type="button">
                    ▶ 차단제 도포 시작
                  </button>
                </>
              ) : reapplyCountdown.isDue ? (
                <>
                  <p className={s.reapplyValue} style={{ color: '#FF8C3E' }}>재도포 필요!<small>지금</small></p>
                  <button className={s.reapplyBtn} onClick={() => setReapplyStartedAt(Date.now())} type="button">
                    🔄 다시 도포
                  </button>
                </>
              ) : (
                <>
                  <p className={s.reapplyValue}>
                    {reapplyCountdown.min}<small>분</small> {reapplyCountdown.sec.toString().padStart(2, '0')}<small>초</small>
                  </p>
                  <button className={s.reapplyBtn} onClick={() => setReapplyStartedAt(null)} type="button">
                    ✕ 알림 해제
                  </button>
                </>
              )}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              ※ 일반 환경 2시간 / 수영·땀 활동 1시간 권장. 옷·수건 마찰 후에도 재도포하세요.
            </p>
          </div>

          {/* 복사 */}
          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ──────────── TAB 2: 활동별 가이드 ──────────── */}
      {tab === 'activity' && (
        <div className={s.activityGrid}>
          {[
            {
              cls: s.actBorderRunning, emoji: '🏃', name: '러닝·조깅',
              uvGuide: ['UV 0~2: 시간 무관', 'UV 3~5: 차단제 + 모자 권장', 'UV 6~7: 차단제 + 모자 + 토시', 'UV 8+: 가능한 새벽·해질녘'],
              gear: ['SPF 50 방수 차단제 (얼굴·목·팔)', '챙 있는 모자', 'UV 차단 토시 (UPF 30+)', '자외선 차단 선글라스 (UV400)'],
              caution: ['땀으로 차단제 효과 1시간 내 감소', '1시간마다 재도포', '입술·귀·목 뒤·발등 자주 잊는 부위'],
            },
            {
              cls: s.actBorderGolf, emoji: '⛳', name: '골프',
              uvGuide: ['보통 4~5시간 야외 노출 → 자외선 누적 큼', '한낮 라운드는 SPF 50+ 권장'],
              gear: ['SPF 30 이상 광범위 차단제', '챙 넓은 골프 모자', 'UV 차단 골프 장갑·토시'],
              caution: ['4시간 이상 라운드 시 중간 재도포', '왼팔·목 뒤·코끝 화상 흔함'],
            },
            {
              cls: s.actBorderBeach, emoji: '🏖️', name: '해변·수영장',
              uvGuide: ['🚨 가장 위험한 환경', '모래 반사 15% + 물 반사 25% = 자외선 약 50% 증가'],
              gear: ['SPF 50 이상 + 방수(Water Resistant 80분)', '래시가드·수영복 활용', '챙 넓은 모자·UV 차단 비치 우산'],
              caution: ['1시간마다 재도포 (수영 후 즉시)', '12~14시 직사광 피하기', '얕은 물에서도 자외선 통과'],
            },
            {
              cls: s.actBorderHiking, emoji: '⛰️', name: '등산·트레킹',
              uvGuide: ['고도 1km당 자외선 약 12% 증가', '해발 1,000m: +12% / 2,000m: +24% / 3,000m: +36%'],
              gear: ['SPF 50 광범위 차단제', '챙 넓은 모자', '긴팔·긴바지 (UPF 30+)'],
              caution: ['정상에서는 평지보다 훨씬 강함', '구름 위에서는 자외선 직접 노출', '눈이 쌓인 산은 추가 반사 주의'],
            },
            {
              cls: s.actBorderSki, emoji: '⛷️', name: '스키·스노보드',
              uvGuide: ['🚨 눈 반사 약 80% — 가장 강력한 반사면', '눈 + 자외선 = 설맹(雪盲) 위험'],
              gear: ['SPF 50 이상 (얼굴 전체)', 'UV 100% 차단 고글', '입술 보호 (SPF 립밤)'],
              caution: ['얼굴 아래쪽도 화상 가능 (반사)', '입술·코 자주 재도포', '흐린 날에도 자외선 통과'],
            },
            {
              cls: s.actBorderDriving, emoji: '🚗', name: '운전·실내',
              uvGuide: ['일반 유리창은 UVB 95% 차단', 'UVA는 약 50% 통과 → 운전석 쪽 피부 노화'],
              gear: ['SPF 30+ (왼팔·얼굴)', '자외선 차단 운전 장갑', '자외선 차단 필름 부착 검토'],
              caution: ['장시간 운전 시 한쪽 팔만 일광 노화', '여름 한낮 운전 시 즉시 차단제 도포'],
            },
          ].map((a, i) => (
            <div key={i} className={`${s.activityCard} ${a.cls}`}>
              <div className={s.activityHeader}>
                <span className={s.activityEmoji}>{a.emoji}</span>
                <span className={s.activityName}>{a.name}</span>
              </div>
              <div className={s.activitySection}>
                <p className={s.activitySectionTitle}>UV 지수별 권장</p>
                <ul>{a.uvGuide.map((g, j) => <li key={j}>{g}</li>)}</ul>
              </div>
              <div className={s.activitySection}>
                <p className={s.activitySectionTitle}>권장 장비</p>
                <ul>{a.gear.map((g, j) => <li key={j}>{g}</li>)}</ul>
              </div>
              <div className={s.activitySection}>
                <p className={s.activitySectionTitle}>주의 사항</p>
                <ul>{a.caution.map((g, j) => <li key={j}>{g}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────────── TAB 3: SPF·UV 비교표 ──────────── */}
      {tab === 'reference' && (
        <>
          {/* SPF 차단율 표 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>SPF 차단율 비교</span>
              <span className={s.cardLabelHint}>UVB 기준</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.refTable} style={{ minWidth: 460 }}>
                <thead>
                  <tr>
                    <th>SPF</th>
                    <th>UVB 차단율</th>
                    <th>통과율</th>
                    <th>특성</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>차단제 없음</td><td>0%</td><td>100%</td><td style={{ color: 'var(--muted)', fontWeight: 500 }}>—</td></tr>
                  <tr><td>SPF 15</td><td>93.3%</td><td>6.7%</td><td style={{ color: 'var(--muted)', fontWeight: 500 }}>일상 산책</td></tr>
                  <tr><td>SPF 30</td><td>96.7%</td><td>3.3%</td><td style={{ color: 'var(--muted)', fontWeight: 500 }}>일반 외출</td></tr>
                  <tr className={s.highlightRow}><td>SPF 50</td><td>98.0%</td><td>2.0%</td><td style={{ color: '#3EFF9B', fontWeight: 700 }}>한국 표준</td></tr>
                  <tr><td>SPF 70+</td><td>98.6%</td><td>1.4%</td><td style={{ color: 'var(--muted)', fontWeight: 500 }}>야외 장시간</td></tr>
                </tbody>
              </table>
            </div>
            <div style={{ background: 'rgba(255,140,62,0.05)', border: '1px solid rgba(255,140,62,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 12.5, color: 'var(--text)', marginTop: 12, lineHeight: 1.85 }}>
              ⚠️ <strong style={{ color: '#FF8C3E' }}>SPF는 &quot;햇빛에 X배 더 오래 머물 수 있다&quot;는 의미가 아닙니다.</strong>
              도포량·땀·수영·시간 경과에 따라 실제 효과는 표시 SPF의 50% 수준일 수 있습니다.
            </div>
          </div>

          {/* UV 지수 행동 가이드 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>UV 지수 행동 가이드</span>
              <span className={s.cardLabelHint}>한국 기상청 5단계</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.refTable} style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>UV 지수</th>
                    <th>위험도</th>
                    <th>권장 행동</th>
                  </tr>
                </thead>
                <tbody>
                  {UV_LEVELS.map((lv, i) => (
                    <tr key={i}>
                      <td>{lv.range[0]}~{lv.range[1] >= 11 ? '11+' : lv.range[1]}</td>
                      <td>
                        <span className={s.uvLevelDot} style={{ background: lv.color }} />
                        <span style={{ color: lv.color, fontWeight: 700 }}>{lv.icon} {lv.level}</span>
                      </td>
                      <td style={{ color: 'var(--muted)', fontWeight: 500, fontFamily: '"Noto Sans KR", sans-serif' }}>{lv.advice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 피부 타입별 화상 위험 시간 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>피부 타입별 화상 위험 시간</span>
              <span className={s.cardLabelHint}>UV 지수 6 기준</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className={s.refTable} style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>피부 타입</th>
                    <th>한국인 비율</th>
                    <th>무보호 시간</th>
                    <th>SPF 30 적용</th>
                  </tr>
                </thead>
                <tbody>
                  {SKIN_TYPES.map(t => {
                    const r1 = calcBurnTime({ uvIndex: 6, skinTypeId: t.id, spfId: 'none', envId: 'daily', altitude: 0, cloudCover: 0, isWaterContact: false })
                    const r2 = calcBurnTime({ uvIndex: 6, skinTypeId: t.id, spfId: 'spf30', envId: 'daily', altitude: 0, cloudCover: 0, isWaterContact: false })
                    return (
                      <tr key={t.id} className={t.isKoreanCommon ? s.highlightRow : ''}>
                        <td>{t.name}</td>
                        <td>{t.koreanRatio}</td>
                        <td>{fmtMinutes(r1.base)}</td>
                        <td>{fmtMinutes(r2.withSpf)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 실제 SPF vs 라벨 SPF */}
          <div className={s.guideCard}>
            <p className={s.guideTitle}>📊 실제 SPF vs 라벨 SPF</p>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8, lineHeight: 1.85 }}>
              실제 일상 사용 시 라벨 SPF의 <strong style={{ color: '#3EC8FF' }}>약 50% 정도 효과</strong>입니다:
            </p>
            <ul>
              <li>도포량 부족 (실제 0.5~1mg/cm² vs 권장 2mg/cm²)</li>
              <li>땀·옷 마찰</li>
              <li>시간 경과 (4시간 후 약 50% 감소)</li>
              <li>수영·물 접촉</li>
            </ul>
            <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 12, lineHeight: 1.85 }}>
              따라서 <strong style={{ color: '#3EC8FF' }}>라벨 SPF 50 → 실제 SPF 25 정도 효과</strong>이며,
              충분한 도포량과 2시간마다의 재도포가 매우 중요합니다.
            </p>
          </div>

          {/* 한국 계절별 UV */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>한국 계절별 평균 UV 지수</span>
              <span className={s.cardLabelHint}>참고용</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              {[
                { s: '봄 (3~5월)',   r: '5~8',  level: '보통~높음',   c: '#FF8C3E' },
                { s: '여름 (6~8월)', r: '8~11', level: '매우 높음~위험', c: '#FF6B6B' },
                { s: '가을 (9~11월)',r: '4~7',  level: '보통~높음',   c: '#FFD700' },
                { s: '겨울 (12~2월)',r: '1~4',  level: '낮음~보통',   c: '#3EFF9B' },
              ].map((r, i) => (
                <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${r.c}`, borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 4, fontWeight: 600 }}>{r.s}</p>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: r.c }}>{r.r}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.level}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 공식 자료 출처 (모든 탭 공통 푸터) */}
      <div style={{ background: 'rgba(62,200,255,0.05)', border: '1px solid rgba(62,200,255,0.25)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.85 }}>
        <p style={{ fontWeight: 700, color: '#3EC8FF', marginBottom: 6, fontFamily: '"Noto Sans KR", sans-serif' }}>📚 공식 자료 출처</p>
        한국 기상청 자외선지수 · 미국 EPA UV Index Scale · WHO Global Solar UV Index · 대한피부과학회.
        피부 이상 증상 또는 일광화상 시 즉시 피부과 전문의 상담을 받으세요.
      </div>
    </div>
  )
}
