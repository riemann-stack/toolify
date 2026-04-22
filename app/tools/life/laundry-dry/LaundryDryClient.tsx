'use client'

import { useState, useMemo, useEffect } from 'react'
import styles from './laundry-dry.module.css'

/* ──────────────────────── 상수 ──────────────────────── */
type EnvId      = 'indoor' | 'balcony' | 'outdoor'
type WindId     = 'none' | 'weak' | 'moderate' | 'strong'
type SunId      = 'none' | 'indirect' | 'direct'
type MaterialId = 'cotton' | 'synthetic' | 'wool' | 'denim' | 'blend'
type ThickId    = 'thin' | 'normal' | 'thick'
type SpinId     = 'weak' | 'normal' | 'strong'
type SpaceId    = 'narrow' | 'normal' | 'wide'
type ItemId     = 'tshirt' | 'shirt' | 'pants' | 'towel' | 'jeans' | 'hoodie' | 'bedcover' | 'socks'

const BASE_DRY_HOURS: Record<ItemId, number> = {
  tshirt: 2,  shirt: 3,  pants: 4,  towel: 3,
  jeans:  6,  hoodie: 5, bedcover: 7, socks: 1.5,
}

const ITEM_META: { id: ItemId; icon: string; name: string }[] = [
  { id: 'tshirt',   icon: '👕', name: '티셔츠' },
  { id: 'shirt',    icon: '👔', name: '셔츠' },
  { id: 'pants',    icon: '👖', name: '바지' },
  { id: 'towel',    icon: '🧺', name: '수건' },
  { id: 'jeans',    icon: '🪢', name: '청바지' },
  { id: 'hoodie',   icon: '🧥', name: '후드티' },
  { id: 'bedcover', icon: '🛏️', name: '이불커버' },
  { id: 'socks',    icon: '🧦', name: '양말·속옷' },
]

const ENV_META: { id: EnvId; icon: string; name: string; sub: string }[] = [
  { id: 'indoor',  icon: '🏠', name: '실내',   sub: '환기 가능한 실내' },
  { id: 'balcony', icon: '🌤️', name: '베란다', sub: '반외부 공간' },
  { id: 'outdoor', icon: '☀️', name: '실외',   sub: '직접 야외 건조' },
]

const WIND_META: { id: WindId; label: string }[] = [
  { id: 'none',     label: '없음' },
  { id: 'weak',     label: '약함' },
  { id: 'moderate', label: '보통' },
  { id: 'strong',   label: '강함' },
]

const SUN_META: { id: SunId; icon: string; label: string }[] = [
  { id: 'none',     icon: '☁️', label: '없음' },
  { id: 'indirect', icon: '🌤️', label: '간접광' },
  { id: 'direct',   icon: '☀️', label: '직사광' },
]

const MATERIAL_META: { id: MaterialId; icon: string; name: string; factor: number }[] = [
  { id: 'cotton',    icon: '🌾', name: '면',        factor: 1.0  },
  { id: 'synthetic', icon: '🔧', name: '합성섬유',   factor: 0.7  },
  { id: 'wool',      icon: '🐑', name: '울',         factor: 1.4  },
  { id: 'denim',     icon: '👖', name: '데님',       factor: 1.3  },
  { id: 'blend',     icon: '🔀', name: '혼방',       factor: 0.85 },
]

const THICK_META: { id: ThickId; label: string; factor: number }[] = [
  { id: 'thin',   label: '얇음',   factor: 0.7 },
  { id: 'normal', label: '보통',   factor: 1.0 },
  { id: 'thick',  label: '두꺼움', factor: 1.5 },
]

const SPIN_META: { id: SpinId; label: string; factor: number }[] = [
  { id: 'weak',   label: '약',   factor: 1.4  },
  { id: 'normal', label: '보통', factor: 1.0  },
  { id: 'strong', label: '강',   factor: 0.75 },
]

const SPACE_META: { id: SpaceId; label: string; factor: number }[] = [
  { id: 'narrow', label: '좁음', factor: 1.3  },
  { id: 'normal', label: '보통', factor: 1.0  },
  { id: 'wide',   label: '넓음', factor: 0.85 },
]

/* ──────────────────────── 계산 ──────────────────────── */
function tempFactorOf(t: number): number {
  if (t < 5)  return 2.0
  if (t < 10) return 1.6
  if (t < 15) return 1.3
  if (t < 20) return 1.1
  if (t < 28) return 1.0
  return 0.85
}
function humidFactorOf(h: number): number {
  if (h < 40) return 0.7
  if (h < 55) return 0.85
  if (h < 70) return 1.0
  if (h < 80) return 1.3
  if (h < 90) return 1.7
  return 2.3
}
const WIND_FACTOR: Record<WindId, number> = { none: 1.3, weak: 1.0, moderate: 0.75, strong: 0.55 }
const SUN_FACTOR:  Record<SunId, number>  = { none: 1.2, indirect: 0.9, direct: 0.65 }
const ENV_FACTOR:  Record<EnvId, number>  = { indoor: 1.4, balcony: 1.1, outdoor: 1.0 }

function bumpWind(w: WindId): WindId {
  return w === 'none' ? 'weak' : w === 'weak' ? 'moderate' : w === 'moderate' ? 'strong' : 'strong'
}

function getDrySpeed(totalFactor: number): { label: string; color: string } {
  if (totalFactor < 0.7) return { label: '매우 빠른 편',  color: '#3EFF9B' }
  if (totalFactor < 0.9) return { label: '빠른 편',       color: '#C8FF3E' }
  if (totalFactor < 1.1) return { label: '보통',         color: '#C8FF3E' }
  if (totalFactor < 1.4) return { label: '느린 편',       color: '#FF8C3E' }
  return                         { label: '매우 느린 편', color: '#FF6B6B' }
}

function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}분`
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (mins === 0) return `${hrs}시간`
  if (mins === 60) return `${hrs + 1}시간`
  return `${hrs}시간 ${mins}분`
}

function addHours(date: Date, h: number): Date {
  return new Date(date.getTime() + h * 3600 * 1000)
}

function formatTime(d: Date): string {
  const hh = d.getHours()
  const mm = d.getMinutes()
  const ap = hh < 12 ? '오전' : '오후'
  const h12 = hh % 12 || 12
  return `${ap} ${h12}시 ${mm.toString().padStart(2, '0')}분`
}

/* ──────────────────────── 메인 ──────────────────────── */
export default function LaundryDryClient() {
  const [env, setEnv]             = useState<EnvId>('balcony')
  const [temp, setTemp]           = useState(18)
  const [humidity, setHumidity]   = useState(60)
  const [wind, setWind]           = useState<WindId>('weak')
  const [sun, setSun]             = useState<SunId>('indirect')
  const [items, setItems]         = useState<Set<ItemId>>(new Set(['tshirt']))
  const [material, setMaterial]   = useState<MaterialId>('cotton')
  const [thick, setThick]         = useState<ThickId>('normal')
  const [spin, setSpin]           = useState<SpinId>('normal')
  const [space, setSpace]         = useState<SpaceId>('normal')
  const [fan, setFan]             = useState(false)
  const [dehumid, setDehumid]     = useState(false)
  const [heating, setHeating]     = useState(false)
  const [windowOpen, setWindowOpen] = useState(false)

  /* 실내 아닐 때 창문 개방 리셋 */
  useEffect(() => {
    if (env !== 'indoor' && windowOpen) setWindowOpen(false)
  }, [env, windowOpen])

  /* 실내 선택 시 햇빛 자동 없음 */
  useEffect(() => {
    if (env === 'indoor' && sun !== 'none') setSun('none')
  }, [env, sun])

  /* 현재 시각 (초마다 업데이트) */
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const toggleItem = (id: ItemId) => {
    setItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  /* 계산 */
  const result = useMemo(() => {
    // 옵션 보정
    const adjTemp = temp + (heating ? 5 : 0)
    const adjHumidity = humidity + (dehumid ? -15 : 0)
    const adjWind = (env === 'indoor' && windowOpen) ? bumpWind(wind) : wind

    const baseHours = Math.max(...Array.from(items).map(id => BASE_DRY_HOURS[id]))

    const materialF = MATERIAL_META.find(m => m.id === material)!.factor
    const thickF    = THICK_META.find(t => t.id === thick)!.factor
    const spinF     = SPIN_META.find(s => s.id === spin)!.factor
    const spaceF    = SPACE_META.find(s => s.id === space)!.factor
    const itemFactor = materialF * thickF * spinF * spaceF

    const tF = tempFactorOf(adjTemp)
    const hF = humidFactorOf(Math.max(10, adjHumidity))
    const wF = WIND_FACTOR[adjWind]
    const sF = SUN_FACTOR[sun]
    const eF = ENV_FACTOR[env]
    const envFactor = tF * hF * wF * sF * eF

    const optionFactor = (fan ? 0.70 : 1.0)

    const totalFactor = itemFactor * envFactor * optionFactor
    const dryHours = baseHours * totalFactor

    return {
      dryHours,
      surfaceDry: dryHours * 0.6,
      minHours: dryHours * 0.8,
      maxHours: dryHours * 1.2,
      totalFactor,
      tF, hF, wF, sF, eF, materialF, thickF, spinF, spaceF, optionFactor,
      adjTemp, adjHumidity, adjWind,
    }
  }, [env, temp, humidity, wind, sun, items, material, thick, spin, space, fan, dehumid, heating, windowOpen])

  const speed = getDrySpeed(result.totalFactor)

  /* 영향 요인 분석 */
  type Impact = { label: string; pct: number; kind: 'good' | 'bad' | 'neutral' }
  const impacts = useMemo<Impact[]>(() => {
    const list: Impact[] = []
    const toPct = (f: number) => Math.round((f - 1) * 100)
    const add = (label: string, f: number) => {
      const p = toPct(f)
      if (p === 0) return
      list.push({ label, pct: p, kind: p > 0 ? 'bad' : 'good' })
    }
    add(`온도 ${result.adjTemp}°C${heating ? ' (난방 +5°C)' : ''}`, result.tF)
    add(`습도 ${result.adjHumidity}%${dehumid ? ' (제습기 -15%)' : ''}`, result.hF)
    add(`바람: ${WIND_META.find(w => w.id === result.adjWind)!.label}${env === 'indoor' && windowOpen ? ' (창문 개방)' : ''}`, result.wF)
    add(`햇빛: ${SUN_META.find(s => s.id === sun)!.label}`, result.sF)
    add(`환경: ${ENV_META.find(e => e.id === env)!.name}`, result.eF)
    add(`소재: ${MATERIAL_META.find(m => m.id === material)!.name}`, result.materialF)
    add(`두께: ${THICK_META.find(t => t.id === thick)!.label}`, result.thickF)
    add(`탈수: ${SPIN_META.find(s => s.id === spin)!.label}`, result.spinF)
    add(`간격: ${SPACE_META.find(s => s.id === space)!.label}`, result.spaceF)
    if (fan) add('선풍기·서큘레이터', result.optionFactor)
    return list.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
  }, [result, heating, dehumid, env, windowOpen, sun, material, thick, spin, space, fan])

  /* 동적 팁 */
  const tips = useMemo(() => {
    const out: { icon: string; text: string }[] = []
    if (!fan) out.push({ icon: '💨', text: '선풍기/서큘레이터 사용 시 약 30% 시간 단축' })
    if (result.adjHumidity >= 70 && !dehumid) out.push({ icon: '💧', text: '제습기 사용 시 약 1~3시간 단축' })
    if (space === 'narrow') out.push({ icon: '↔️', text: '빨래 간격을 넓히면 건조 속도 25% 향상' })
    if (env === 'indoor' && wind === 'none' && !windowOpen) out.push({ icon: '🪟', text: '창문 열면 통풍으로 약 1시간 단축' })
    if (items.has('jeans') || items.has('hoodie')) out.push({ icon: '🔄', text: '청바지·후드는 뒤집어서 건조하면 균일하게 마름' })
    if (env === 'indoor' && result.adjTemp < 15 && !heating) out.push({ icon: '🌡️', text: '겨울 실내는 난방 + 제습 조합을 권장합니다' })
    if (spin !== 'strong') out.push({ icon: '🌀', text: '탈수를 한 번 더 강하게 돌리면 15~20% 단축' })
    if (result.adjHumidity >= 85) out.push({ icon: '🛁', text: '장마철엔 욕실에 넣고 환풍기를 24시간 틀면 효과적' })
    return out.slice(0, 5)
  }, [fan, result, dehumid, space, env, wind, windowOpen, items, heating, spin])

  const finishAt = now ? addHours(now, result.dryHours) : null
  const surfaceAt = now ? addHours(now, result.surfaceDry) : null

  /* 타임라인 커서 (실시간) */
  const [timelineMs, setTimelineMs] = useState(0)
  useEffect(() => {
    setTimelineMs(0)
    const start = Date.now()
    const id = setInterval(() => setTimelineMs(Date.now() - start), 1000)
    return () => clearInterval(id)
  }, [result.dryHours])
  const timelinePct = Math.min(100, (timelineMs / (result.dryHours * 3600 * 1000)) * 100)
  const surfacePct = 60

  return (
    <div className={styles.wrap}>
      {/* ── 섹션 1: 환경 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>① 건조 환경</div>
        <div className={styles.envRow}>
          {ENV_META.map(e => (
            <button
              key={e.id}
              className={`${styles.envBtn} ${styles['envBtn_' + e.id]} ${env === e.id ? styles.envBtnActive : ''}`}
              onClick={() => setEnv(e.id)}
            >
              <span className={styles.envIcon}>{e.icon}</span>
              <span className={styles.envName}>{e.name}</span>
              <span className={styles.envSub}>{e.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 온도 */}
      <div className={styles.card}>
        <div className={styles.rowLabel}>
          <span className={styles.cardLabel} style={{ marginBottom: 0 }}>온도</span>
          <span className={`${styles.rowValue} ${tempColorClass(temp, styles)}`}>{temp}°C</span>
        </div>
        <input
          className={`${styles.slider} ${styles.sliderTemp}`}
          type="range" min={-10} max={40} step={1}
          value={temp}
          onChange={e => setTemp(parseInt(e.target.value))}
        />
        <div className={styles.presetRow}>
          {[
            { t: 5,  label: '겨울' },
            { t: 18, label: '봄·가을' },
            { t: 28, label: '여름' },
            { t: 35, label: '한여름' },
          ].map(p => (
            <button
              key={p.t}
              className={`${styles.pBtn} ${temp === p.t ? styles.pBtnActive : ''}`}
              onClick={() => setTemp(p.t)}
            >
              <span className={styles.pBtnLabel}>{p.label}</span>
              <span className={styles.pBtnVal}>{p.t}°C</span>
            </button>
          ))}
        </div>
      </div>

      {/* 습도 */}
      <div className={styles.card}>
        <div className={styles.rowLabel}>
          <span className={styles.cardLabel} style={{ marginBottom: 0 }}>습도</span>
          <span className={`${styles.rowValue} ${humidColorClass(humidity, styles)}`}>{humidity}%</span>
        </div>
        <input
          className={`${styles.slider} ${styles.sliderHumid}`}
          type="range" min={20} max={100} step={5}
          value={humidity}
          onChange={e => setHumidity(parseInt(e.target.value))}
        />
        <div className={styles.presetRow}>
          {[
            { h: 30, label: '건조' },
            { h: 50, label: '쾌적' },
            { h: 65, label: '보통' },
            { h: 80, label: '습함' },
            { h: 90, label: '장마' },
          ].map(p => (
            <button
              key={p.h}
              className={`${styles.pBtn} ${humidity === p.h ? styles.pBtnActive : ''}`}
              onClick={() => setHumidity(p.h)}
            >
              <span className={styles.pBtnLabel}>{p.label}</span>
              <span className={styles.pBtnVal}>{p.h}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* 바람 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>바람</div>
        <div className={styles.segRow4}>
          {WIND_META.map(w => (
            <button
              key={w.id}
              className={`${styles.segBtn} ${wind === w.id ? styles.segBtnActive : ''}`}
              onClick={() => setWind(w.id)}
            >{w.label}</button>
          ))}
        </div>
      </div>

      {/* 햇빛 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>햇빛</div>
        <div className={styles.segRow3}>
          {SUN_META.map(s => (
            <button
              key={s.id}
              className={`${styles.segBtn} ${sun === s.id ? styles.segBtnActive : ''}`}
              onClick={() => setSun(s.id)}
              disabled={env === 'indoor' && s.id !== 'none'}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        {env === 'indoor' && (
          <p className={styles.note}>실내 환경에서는 햇빛이 자동으로 &lsquo;없음&rsquo;으로 설정됩니다</p>
        )}
      </div>

      {/* ── 섹션 2: 세탁물 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>② 세탁물 종류 (복수 선택 가능)</div>
        <div className={styles.itemGrid}>
          {ITEM_META.map(it => {
            const active = items.has(it.id)
            return (
              <button
                key={it.id}
                className={`${styles.itemBtn} ${active ? styles.itemBtnActive : ''}`}
                onClick={() => toggleItem(it.id)}
              >
                {active && <span className={styles.itemCheck}>✓</span>}
                <span className={styles.itemIcon}>{it.icon}</span>
                <span className={styles.itemName}>{it.name}</span>
              </button>
            )
          })}
        </div>
        {items.size > 1 && (
          <p className={styles.note}>가장 오래 걸리는 항목({
            ITEM_META.find(m => m.id === Array.from(items).reduce((a, b) =>
              BASE_DRY_HOURS[a] > BASE_DRY_HOURS[b] ? a : b
            ))!.name
          }) 기준으로 계산합니다</p>
        )}
      </div>

      {/* 소재 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>소재</div>
        <div className={styles.segRow5}>
          {MATERIAL_META.map(m => (
            <button
              key={m.id}
              className={`${styles.segBtn} ${material === m.id ? styles.segBtnActive : ''}`}
              onClick={() => setMaterial(m.id)}
            >
              <span>{m.icon}</span>
              <span>{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 두께 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>두께</div>
        <div className={styles.segRow3}>
          {THICK_META.map(t => (
            <button
              key={t.id}
              className={`${styles.segBtn} ${thick === t.id ? styles.segBtnActive : ''}`}
              onClick={() => setThick(t.id)}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* 탈수 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>탈수 강도</div>
        <div className={styles.segRow3}>
          {SPIN_META.map(s => (
            <button
              key={s.id}
              className={`${styles.segBtn} ${spin === s.id ? styles.segBtnActive : ''}`}
              onClick={() => setSpin(s.id)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* 간격 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>걸어놓는 간격</div>
        <div className={styles.segRow3}>
          {SPACE_META.map(s => (
            <button
              key={s.id}
              className={`${styles.segBtn} ${space === s.id ? styles.segBtnActive : ''}`}
              onClick={() => setSpace(s.id)}
            >{s.label}</button>
          ))}
        </div>
        {space === 'narrow' && (
          <p className={styles.noteWarn}>⚠️ 빨래 간격이 좁으면 통풍이 안 돼 건조 시간이 30% 이상 늘어납니다</p>
        )}
      </div>

      {/* ── 섹션 3: 추가 옵션 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>③ 추가 옵션</div>
        <div className={styles.optList}>
          <ToggleRow icon="💨" label="선풍기·서큘레이터 사용" sub="건조 시간 약 30% 단축" on={fan} onChange={setFan} />
          <ToggleRow icon="💧" label="제습기 사용"            sub="습도 -15% 보정"        on={dehumid} onChange={setDehumid} />
          <ToggleRow icon="🌡️" label="실내 난방"              sub="온도 +5°C 보정"        on={heating} onChange={setHeating} />
          {env === 'indoor' && (
            <ToggleRow icon="🪟" label="창문 개방" sub="바람 한 단계 상향" on={windowOpen} onChange={setWindowOpen} />
          )}
        </div>
      </div>

      {/* ── 결과 ── */}
      <div className={styles.hero}>
        <div className={styles.heroLabel}>예상 건조 시간</div>
        <div className={styles.heroRow}>
          <div className={styles.heroBlock}>
            <div className={styles.heroSub}>겉마름</div>
            <div className={styles.heroNum}>{formatHours(result.surfaceDry)}</div>
            <div className={styles.heroRange}>
              {formatHours(result.surfaceDry * 0.85)}~{formatHours(result.surfaceDry * 1.15)}
            </div>
            {surfaceAt && (
              <div className={styles.heroTime}>{formatTime(surfaceAt)}까지</div>
            )}
          </div>
          <div className={styles.heroDivider} aria-hidden />
          <div className={styles.heroBlock}>
            <div className={styles.heroSubAccent}>완전 건조</div>
            <div className={styles.heroNumMain}>{formatHours(result.dryHours)}</div>
            <div className={styles.heroRange}>
              {formatHours(result.minHours)}~{formatHours(result.maxHours)}
            </div>
            {finishAt && (
              <div className={styles.heroTimeMain}>{formatTime(finishAt)}까지</div>
            )}
          </div>
        </div>
        <div className={styles.speedBadge} style={{ color: speed.color, borderColor: speed.color + '55' }}>
          🌬️ 현재 조건은 <strong>{speed.label}</strong>입니다
        </div>
      </div>

      {/* 타임라인 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>건조 진행 시뮬레이션</div>
        <div className={styles.timelineWrap}>
          <div className={styles.timeline}>
            <div className={styles.timelineSurface} style={{ width: `${surfacePct}%` }} />
            <div className={styles.timelineFull} style={{ left: `${surfacePct}%`, right: 0 }} />
            <div className={styles.timelineMarker} style={{ left: `${surfacePct}%` }}>
              <div className={styles.timelineMarkerLine} />
              <div className={styles.timelineMarkerLabelTop}>겉마름</div>
            </div>
            <div className={styles.timelineMarker} style={{ left: '100%' }}>
              <div className={styles.timelineMarkerLine} />
              <div className={styles.timelineMarkerLabelBottom}>완전 건조</div>
            </div>
            <div
              className={styles.timelineCursor}
              style={{ left: `${timelinePct}%` }}
              aria-hidden
            />
          </div>
          <div className={styles.timelineLegend}>
            <span>지금</span>
            <span>{formatHours(result.surfaceDry)} 후</span>
            <span>{formatHours(result.dryHours)} 후</span>
          </div>
        </div>
      </div>

      {/* 영향 요인 분석 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>영향 요인 분석</div>
        <div className={styles.impactList}>
          {impacts.map((imp, i) => (
            <div key={i} className={`${styles.impactRow} ${imp.kind === 'good' ? styles.impactGood : imp.kind === 'bad' ? styles.impactBad : styles.impactNeutral}`}>
              <span className={styles.impactLabel}>{imp.label}</span>
              <span className={styles.impactVal}>
                {imp.kind === 'good' ? '✅' : '⚠️'} {imp.pct > 0 ? '+' : ''}{imp.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 팁 */}
      {tips.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardLabel}>💡 더 빨리 말리는 팁</div>
          <div className={styles.tipList}>
            {tips.map((tip, i) => (
              <div key={i} className={styles.tipItem}>
                <span className={styles.tipIcon}>{tip.icon}</span>
                <span className={styles.tipText}>{tip.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────── 보조 ──────────────────────── */
function tempColorClass(t: number, styles: { [k: string]: string }): string {
  if (t <= 5)  return styles.valCold
  if (t <= 15) return styles.valCool
  if (t <= 25) return styles.valGood
  return styles.valHot
}
function humidColorClass(h: number, styles: { [k: string]: string }): string {
  if (h <= 40) return styles.valGoodAccent
  if (h <= 60) return styles.valGood
  if (h <= 75) return styles.valWarn
  if (h <= 85) return styles.valHot
  return styles.valBad
}

function ToggleRow({ icon, label, sub, on, onChange }: {
  icon: string; label: string; sub: string; on: boolean; onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      className={`${styles.toggleRow} ${on ? styles.toggleRowOn : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className={styles.toggleIcon}>{icon}</span>
      <span className={styles.toggleBody}>
        <span className={styles.toggleLabel}>{label}</span>
        <span className={styles.toggleSub}>{sub}</span>
      </span>
      <span className={`${styles.toggle} ${on ? styles.toggleOn : ''}`} aria-hidden>
        <span className={styles.toggleKnob} />
      </span>
    </button>
  )
}
