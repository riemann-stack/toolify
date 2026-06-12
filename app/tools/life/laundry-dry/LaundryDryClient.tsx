/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useMemo, useEffect } from 'react'
import Disclaimer from '@/components/Disclaimer'
import styles from './laundry-dry.module.css'
import {
  LAUNDRY_EQUIPMENT, recommendCombos, evaluateCombo,
  fmtMinutes, fmtKrw, tempFactorOf, humidFactorOf,
  type Priority,
} from './laundryUtils'

type TabId = 'main' | 'combo' | 'target'

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
/* tempFactorOf · humidFactorOf 는 laundryUtils에서 공유 (메인·조합 탭 동일 곡선) */
const WIND_FACTOR: Record<WindId, number> = { none: 1.3, weak: 1.0, moderate: 0.75, strong: 0.55 }
const SUN_FACTOR:  Record<SunId, number>  = { none: 1.2, indirect: 0.9, direct: 0.65 }
const ENV_FACTOR:  Record<EnvId, number>  = { indoor: 1.4, balcony: 1.1, outdoor: 1.0 }

function bumpWind(w: WindId): WindId {
  return w === 'none' ? 'weak' : w === 'weak' ? 'moderate' : w === 'moderate' ? 'strong' : 'strong'
}

function getDrySpeed(totalFactor: number): { label: string; color: string } {
  if (totalFactor < 0.7) return { label: '매우 빠른 편',  color: '#059669' }
  if (totalFactor < 0.9) return { label: '빠른 편',       color: '#0EA5E9' }
  if (totalFactor < 1.1) return { label: '보통',         color: '#0EA5E9' }
  if (totalFactor < 1.4) return { label: '느린 편',       color: '#EA580C' }
  return                         { label: '매우 느린 편', color: '#DC2626' }
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

/* 완료 시각 — 날짜를 넘기면 '내일/모레/N일 후'를 붙인다 */
function formatFinishTime(target: Date, start: Date): string {
  const dayKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const dayDiff = Math.round((dayKey(target) - dayKey(start)) / 86400000)
  const t = formatTime(target)
  if (dayDiff <= 0) return t
  if (dayDiff === 1) return `내일 ${t}`
  if (dayDiff === 2) return `모레 ${t}`
  return `${dayDiff}일 후 ${t}`
}

/* ──────────────────────── 메인 ──────────────────────── */
export default function LaundryDryClient() {
  const [tab, setTab] = useState<TabId>('main')
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

    // 장비(난방·제습기 등 조합 탭 장비) 영향 제외 baseline — 조합 추천·역산 탭용.
    // 단, 창문 개방(adjWind)은 환경 설정이므로 baseline에 포함한다.
    const baselineHours = baseHours * itemFactor * (
      tempFactorOf(temp) * humidFactorOf(humidity) * WIND_FACTOR[adjWind] * SUN_FACTOR[sun] * eF
    )

    return {
      dryHours,
      surfaceDry: dryHours * 0.6,
      minHours: dryHours * 0.8,
      maxHours: dryHours * 1.2,
      totalFactor,
      tF, hF, wF, sF, eF, materialF, thickF, spinF, spaceF, optionFactor,
      adjTemp, adjHumidity, adjWind,
      baselineHours,
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

  /* 완료 시각은 '지금 넌 시점'(anchor)에 고정 — 진행바와 같은 기준. 매분 밀리지 않음 */
  const [anchorMs, setAnchorMs] = useState<number | null>(null)
  const [timelineMs, setTimelineMs] = useState(0)
  useEffect(() => {
    setAnchorMs(Date.now())
    setTimelineMs(0)
    const start = Date.now()
    const id = setInterval(() => setTimelineMs(Date.now() - start), 1000)
    return () => clearInterval(id)
  }, [result.dryHours, result.surfaceDry])
  const finishAt = anchorMs != null ? addHours(new Date(anchorMs), result.dryHours) : null
  const surfaceAt = anchorMs != null ? addHours(new Date(anchorMs), result.surfaceDry) : null
  const timelinePct = Math.min(100, (timelineMs / (result.dryHours * 3600 * 1000)) * 100)
  const surfacePct = 60

  return (
    <div className={styles.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/life/packing', label: '여행 짐 체크리스트' },
          { href: '/tools/life/unit-price', label: '단위당 가격 비교' },
          { href: '/tools/life/pomodoro', label: '뽀모도로 타이머' }
        ]}
      >
        건조 시간은 옷감·두께·습도·통풍·기온에 따라 크게 달라지는 <strong>참고용 추정</strong>입니다. 실제 건조 상태를 직접 확인하시고, 건조기 등 가전은 제조사 사용 설명서를 따르세요.
      </Disclaimer>

      {/* ── 탭 네비 ── */}
      <div className={styles.tabs} role="tablist" aria-label="건조 계산 모드">
        {([
          { id: 'main',   label: '🧮 건조 시간 계산' },
          { id: 'combo',  label: '⚡ 최단 조합 추천' },
          { id: 'target', label: '🎯 목표 시간 역산' },
        ] as { id: TabId; label: string }[]).map(t => (
          <button key={t.id}
            type="button" role="tab" aria-selected={tab === t.id}
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab !== 'main' && (
        <>
          {tab === 'combo' && (
            <ComboTab baselineHours={result.baselineHours} env={env} envCtx={{ temp, humidity }} />
          )}
          {tab === 'target' && (
            <TargetTab baselineHours={result.baselineHours} now={now} envCtx={{ temp, humidity }} />
          )}
          {/* 면책 */}
          <p style={{ fontSize: 11, color: 'var(--muted)', padding: '12px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, lineHeight: 1.7, marginTop: 4 }}>
            ⚠️ 본 추천은 일반 가이드입니다. 실제 건조 시간은 의류 두께·소재·빨래량·통풍·날씨에 따라 ±20% 차이 가능. 전기료는 한국 평균 200원/kWh 기준 (누진제 단계에 따라 ±50% 차이 가능). 정확한 정보는 한국전력 고객센터 <strong style={{ color: '#EA580C' }}>123</strong> 또는 기상청 빨래건조지수(weather.go.kr).
          </p>
        </>
      )}

      {tab === 'main' && (<>
      {/* ── 섹션 1: 환경 ── */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>① 건조 환경</div>
        <div className={styles.envRow}>
          {ENV_META.map(e => (
            <button
              key={e.id}
              type="button"
              aria-pressed={env === e.id}
              className={`${styles.envBtn} ${styles['envBtn_' + e.id]} ${env === e.id ? styles.envBtnActive : ''}`}
              onClick={() => setEnv(e.id)}
            >
              <span className={styles.envIcon} aria-hidden="true">{e.icon}</span>
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
          aria-label="온도"
          aria-valuetext={`${temp}°C`}
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
              type="button"
              aria-pressed={temp === p.t}
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
          aria-label="습도"
          aria-valuetext={`${humidity}%`}
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
              type="button"
              aria-pressed={humidity === p.h}
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
              type="button"
              aria-pressed={wind === w.id}
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
              type="button"
              aria-pressed={sun === s.id}
              className={`${styles.segBtn} ${sun === s.id ? styles.segBtnActive : ''}`}
              onClick={() => setSun(s.id)}
              disabled={env === 'indoor' && s.id !== 'none'}
            >
              <span aria-hidden="true">{s.icon}</span>
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
                type="button"
                aria-pressed={active}
                className={`${styles.itemBtn} ${active ? styles.itemBtnActive : ''}`}
                onClick={() => toggleItem(it.id)}
              >
                {active && <span className={styles.itemCheck} aria-hidden="true">✓</span>}
                <span className={styles.itemIcon} aria-hidden="true">{it.icon}</span>
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
          }) 기준으로 계산합니다 · 소재·두께는 공통 적용, 빨래 <strong>양(장수)</strong>은 반영하지 않습니다</p>
        )}
      </div>

      {/* 소재 */}
      <div className={styles.card}>
        <div className={styles.cardLabel}>소재</div>
        <div className={styles.segRow5}>
          {MATERIAL_META.map(m => (
            <button
              key={m.id}
              type="button"
              aria-pressed={material === m.id}
              className={`${styles.segBtn} ${material === m.id ? styles.segBtnActive : ''}`}
              onClick={() => setMaterial(m.id)}
            >
              <span aria-hidden="true">{m.icon}</span>
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
              type="button"
              aria-pressed={thick === t.id}
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
              type="button"
              aria-pressed={spin === s.id}
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
              type="button"
              aria-pressed={space === s.id}
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
            {surfaceAt && anchorMs != null && (
              <div className={styles.heroTime}>{formatFinishTime(surfaceAt, new Date(anchorMs))}까지</div>
            )}
          </div>
          <div className={styles.heroDivider} aria-hidden />
          <div className={styles.heroBlock}>
            <div className={styles.heroSubAccent}>완전 건조</div>
            <div className={styles.heroNumMain}>{formatHours(result.dryHours)}</div>
            <div className={styles.heroRange}>
              {formatHours(result.minHours)}~{formatHours(result.maxHours)}
            </div>
            {finishAt && anchorMs != null && (
              <div className={styles.heroTimeMain}>{formatFinishTime(finishAt, new Date(anchorMs))}까지</div>
            )}
          </div>
        </div>
        <div className={styles.speedBadge} style={{ color: speed.color, borderColor: speed.color + '55' }}>
          🌬️ 현재 조건은 <strong>{speed.label}</strong>입니다
        </div>
        <span aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          완전 건조 예상 {formatHours(result.dryHours)}{finishAt && anchorMs != null ? `, ${formatFinishTime(finishAt, new Date(anchorMs))}까지` : ''} · {speed.label}
        </span>
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
      </>)}
    </div>
  )
}

/* ──────────────────────── 최단 조합 추천 탭 ──────────────────────── */
function ComboTab({ baselineHours, env, envCtx }: { baselineHours: number; env: EnvId; envCtx: { temp: number; humidity: number } }) {
  const [owned, setOwned] = useState<Set<string>>(() => new Set(['fan', 'dehumidifier', 'extra-spin']))
  const [priority, setPriority] = useState<Priority>('speed')
  const [bathroomMode, setBathroomMode] = useState(false)

  const toggleEq = (id: string) => {
    setOwned(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const baseMin = Math.max(30, baselineHours * 60)

  // 욕실 모드면 욕실 환풍기 자동 포함
  const effectiveOwned = useMemo(() => {
    const arr = Array.from(owned)
    if (bathroomMode && !arr.includes('bathroom-fan')) arr.push('bathroom-fan')
    return arr
  }, [owned, bathroomMode])

  const recommendations = useMemo(() => {
    return recommendCombos(effectiveOwned, baseMin, priority, envCtx).slice(0, 6)
  }, [effectiveOwned, baseMin, priority, envCtx])

  const best = recommendations[0]
  const noEq = useMemo(() => evaluateCombo([], baseMin, envCtx), [baseMin, envCtx])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>① 보유 장비 (체크)</div>
        <div className={styles.eqGrid}>
          {LAUNDRY_EQUIPMENT.map(eq => (
            <button key={eq.id}
              type="button"
              aria-pressed={owned.has(eq.id)}
              className={`${styles.eqCard} ${owned.has(eq.id) ? styles.eqCardActive : ''}`}
              onClick={() => toggleEq(eq.id)}>
              <span className={styles.eqIcon} aria-hidden="true">{eq.icon}</span>
              <span className={styles.eqName}>{eq.name}</span>
              <span className={styles.eqMeta}>{eq.powerW > 0 ? `${eq.powerW}W` : '전력 0'}</span>
              <span className={styles.eqDesc}>{eq.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>② 우선순위</div>
        <div className={styles.segRow3}>
          {([
            { id: 'speed',    label: '⚡ 시간 최우선' },
            { id: 'balanced', label: '⚖️ 균형 (추천)' },
            { id: 'cost',     label: '💰 전기료 최저' },
          ] as { id: Priority; label: string }[]).map(p => (
            <button key={p.id}
              type="button"
              aria-pressed={priority === p.id}
              className={`${styles.segBtn} ${priority === p.id ? styles.segBtnActive : ''}`}
              onClick={() => setPriority(p.id)}>
              {p.label}
            </button>
          ))}
        </div>

        {env === 'indoor' && (
          <button
            type="button"
            role="switch"
            aria-checked={bathroomMode}
            className={`${styles.toggleRow} ${bathroomMode ? styles.toggleRowOn : ''}`}
            style={{ marginTop: 10 }}
            onClick={() => setBathroomMode(!bathroomMode)}>
            <span className={styles.toggleIcon}>🚿</span>
            <span className={styles.toggleBody}>
              <span className={styles.toggleLabel}>욕실 건조 모드 (한국 가정 인기)</span>
              <span className={styles.toggleSub}>욕실 환풍기 자동 추가 (-25%) · 1~2명분만 권장</span>
            </span>
            <span className={`${styles.toggle} ${bathroomMode ? styles.toggleOn : ''}`} aria-hidden>
              <span className={styles.toggleKnob} />
            </span>
          </button>
        )}
      </div>

      {best ? (
        <>
          {/* 최우선 추천 */}
          <div className={styles.hero}>
            <div className={styles.heroLabel}>⭐ 최우선 추천 조합</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {best.combo.map(id => {
                const eq = LAUNDRY_EQUIPMENT.find(e => e.id === id)
                return eq ? (
                  <span key={id} className={styles.eqChip}>{eq.icon} {eq.name}</span>
                ) : null
              })}
            </div>
            <div className={styles.heroRow}>
              <div className={styles.heroBlock}>
                <div className={styles.heroSub}>예상 시간</div>
                <div className={styles.heroNumMain}>{fmtMinutes(best.minutes)}</div>
                <div className={styles.heroRange}>기본 {fmtMinutes(noEq.minutes)} 대비 -{best.reductionPct}%</div>
              </div>
              <div className={styles.heroDivider} aria-hidden />
              <div className={styles.heroBlock}>
                <div className={styles.heroSubAccent}>예상 전기료</div>
                <div className={styles.heroNumMain} style={{ color: best.cost < 50 ? '#059669' : best.cost < 300 ? 'var(--accent)' : '#EA580C' }}>{fmtKrw(best.cost)}</div>
                <div className={styles.heroRange}>{best.kwh} kWh · 200원/kWh 기준</div>
              </div>
            </div>
          </div>

          {/* 차순위 비교 */}
          {recommendations.length > 1 && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>다른 조합 비교 (상위 6개)</div>
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.compareTable}>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">조합</th>
                      <th scope="col" style={{ textAlign: 'right' }}>시간</th>
                      <th scope="col" style={{ textAlign: 'right' }}>전기료</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations.map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{i === 0 ? '⭐' : i + 1}</td>
                        <td style={{ fontSize: 11 }}>
                          {r.combo.map(id => LAUNDRY_EQUIPMENT.find(e => e.id === id)?.icon).join(' ')}
                          {' '}
                          <span style={{ color: 'var(--muted)' }}>
                            {r.combo.map(id => LAUNDRY_EQUIPMENT.find(e => e.id === id)?.name).join(' + ')}
                          </span>
                        </td>
                        <td className={styles.tableNum}>{fmtMinutes(r.minutes)}</td>
                        <td className={styles.tableNum} style={{ color: r.cost < 50 ? '#059669' : 'var(--text)' }}>{fmtKrw(r.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.note} style={{ marginTop: 10 }}>
                💡 가장 저렴한 옵션을 원하면 우선순위를 [💰 전기료 최저]로 변경. 같은 카테고리(예: 선풍기 + 서큘레이터)는 효과가 큰 쪽만 적용됩니다.
              </p>
            </div>
          )}

          {bathroomMode && (
            <div className={styles.card} style={{ background: 'rgba(234,88,12,0.06)', borderColor: 'rgba(234,88,12,0.3)' }}>
              <p style={{ fontSize: 12, color: '#EA580C', fontWeight: 600, marginBottom: 6 }}>🚿 욕실 건조 시 주의</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
                <li>욕실 사전 환기 필수 (사용 후 24시간+ 환풍기 가동)</li>
                <li>1~2명분 빨래만 권장 (이불·다수 X)</li>
                <li>곰팡이 발생 위험 ↑ — 사용 후 욕실 청소</li>
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className={styles.empty}>보유 장비를 1개 이상 선택하세요</div>
      )}
    </div>
  )
}

/* ──────────────────────── 목표 시간 역산 탭 ──────────────────────── */
function TargetTab({ baselineHours, now, envCtx }: { baselineHours: number; now: Date | null; envCtx: { temp: number; humidity: number } }) {
  const [targetTime, setTargetTime] = useState('18:00')
  const [owned, setOwned] = useState<Set<string>>(() => new Set(['fan', 'dehumidifier', 'circulator', 'extra-spin']))

  const toggleEq = (id: string) => {
    setOwned(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  const baseMin = Math.max(30, baselineHours * 60)

  const target = useMemo(() => {
    if (!now || !targetTime) return null
    const [hh, mm] = targetTime.split(':').map(n => parseInt(n))
    if (isNaN(hh) || isNaN(mm)) return null
    const t = new Date(now)
    t.setHours(hh, mm, 0, 0)
    if (t.getTime() <= now.getTime()) t.setDate(t.getDate() + 1)
    return t
  }, [targetTime, now])

  const minutesAvailable = target && now ? Math.round((target.getTime() - now.getTime()) / 60000) : null

  const scenarios = useMemo(() => {
    if (!minutesAvailable) return null
    const ownedArr = Array.from(owned)
    const natural = evaluateCombo([], baseMin, envCtx)
    // 장비가 없어도 자연 건조 시간·달성 여부는 보여준다
    if (ownedArr.length === 0) {
      return { fastest: natural, balanced: natural, cheapest: natural, natural }
    }
    const fastest = recommendCombos(ownedArr, baseMin, 'speed', envCtx)[0] ?? natural
    const balanced = recommendCombos(ownedArr, baseMin, 'balanced', envCtx)[0] ?? natural
    const cheapest = recommendCombos(ownedArr, baseMin, 'cost', envCtx).filter(c => c.minutes <= minutesAvailable)[0]
      ?? recommendCombos(ownedArr, baseMin, 'cost', envCtx)[0] ?? natural
    return { fastest, balanced, cheapest, natural }
  }, [owned, baseMin, minutesAvailable, envCtx])

  const noEq = useMemo(() => evaluateCombo([], baseMin, envCtx), [baseMin, envCtx])

  return (
    <div className={styles.tabContent}>
      <div className={styles.card}>
        <div className={styles.cardLabel}>① 목표 완료 시각</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="time"
            value={targetTime}
            aria-label="목표 완료 시각"
            onChange={e => setTargetTime(e.target.value)}
            style={{
              background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', fontSize: 16,
              fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700,
            }}
          />
          {minutesAvailable !== null && (
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>
              지금부터 <strong style={{ color: 'var(--accent)' }}>{fmtMinutes(minutesAvailable)}</strong> 남음
            </span>
          )}
        </div>
        <p className={styles.note}>현재 시각이 지난 시간을 입력하면 내일로 자동 처리됩니다.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardLabel}>② 보유 장비</div>
        <div className={styles.eqGrid}>
          {LAUNDRY_EQUIPMENT.map(eq => (
            <button key={eq.id}
              type="button"
              aria-pressed={owned.has(eq.id)}
              className={`${styles.eqCard} ${owned.has(eq.id) ? styles.eqCardActive : ''}`}
              onClick={() => toggleEq(eq.id)}>
              <span className={styles.eqIcon} aria-hidden="true">{eq.icon}</span>
              <span className={styles.eqName}>{eq.name}</span>
              <span className={styles.eqMeta}>{eq.powerW > 0 ? `${eq.powerW}W` : '전력 0'}</span>
            </button>
          ))}
        </div>
      </div>

      {scenarios && minutesAvailable !== null && scenarios.fastest ? (
        <>
          <div className={styles.hero}>
            <div className={styles.heroLabel}>🎯 목표 시간까지</div>
            <div className={styles.heroNumMain}>
              {scenarios.fastest.minutes <= minutesAvailable
                ? '✅ 가능'
                : '⚠️ 시간 부족'}
            </div>
            <p className={styles.heroRange} style={{ marginTop: 4 }}>
              가장 빠른 조합: <strong style={{ color: 'var(--accent)' }}>{fmtMinutes(scenarios.fastest.minutes)}</strong>
              {scenarios.fastest.minutes <= minutesAvailable
                ? ` · 여유 ${fmtMinutes(minutesAvailable - scenarios.fastest.minutes)}`
                : ` · 부족 ${fmtMinutes(scenarios.fastest.minutes - minutesAvailable)}`}
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>3가지 시나리오 비교</div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th scope="col">시나리오</th>
                    <th scope="col">장비</th>
                    <th scope="col" style={{ textAlign: 'right' }}>시간</th>
                    <th scope="col" style={{ textAlign: 'right' }}>전기료</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: '#059669', fontWeight: 700 }}>⚡ 가장 빠른</td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {scenarios.fastest.combo.map(id => LAUNDRY_EQUIPMENT.find(e => e.id === id)?.icon).join(' ')}
                    </td>
                    <td className={styles.tableNum}>{fmtMinutes(scenarios.fastest.minutes)}</td>
                    <td className={styles.tableNum}>{fmtKrw(scenarios.fastest.cost)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>⚖️ 균형</td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {scenarios.balanced.combo.map(id => LAUNDRY_EQUIPMENT.find(e => e.id === id)?.icon).join(' ')}
                    </td>
                    <td className={styles.tableNum}>{fmtMinutes(scenarios.balanced.minutes)}</td>
                    <td className={styles.tableNum}>{fmtKrw(scenarios.balanced.cost)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#0891B2', fontWeight: 700 }}>💰 최저 비용</td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {scenarios.cheapest?.combo.map(id => LAUNDRY_EQUIPMENT.find(e => e.id === id)?.icon).join(' ') ?? '—'}
                    </td>
                    <td className={styles.tableNum}>{scenarios.cheapest ? fmtMinutes(scenarios.cheapest.minutes) : '—'}</td>
                    <td className={styles.tableNum}>{scenarios.cheapest ? fmtKrw(scenarios.cheapest.cost) : '—'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--muted)' }}>🌬️ 자연 건조</td>
                    <td style={{ fontSize: 11, color: 'var(--muted)' }}>—</td>
                    <td className={styles.tableNum}>{fmtMinutes(scenarios.natural.minutes)}</td>
                    <td className={styles.tableNum} style={{ color: '#059669' }}>0원</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {scenarios.fastest.minutes > minutesAvailable && (
              <p className={styles.note} style={{ marginTop: 10, color: '#EA580C' }}>
                ⚠️ 가장 빠른 조합도 목표 시간 안에 어렵습니다. 권장: ① 보유 장비 추가 ② 목표 시간 {fmtMinutes(scenarios.fastest.minutes - minutesAvailable)} 늦추기 ③ 욕실 건조 모드 (-25%)
              </p>
            )}
            <p className={styles.note} style={{ marginTop: 8 }}>
              기본 (장비 없음): {fmtMinutes(noEq.minutes)} · 환경 데이터는 [건조 시간 계산] 탭에서 조정 — 현재 환경 그대로 반영됩니다.
            </p>
          </div>
        </>
      ) : (
        <div className={styles.empty}>목표 시각과 보유 장비를 입력하세요</div>
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
      role="switch"
      aria-checked={on}
      className={`${styles.toggleRow} ${on ? styles.toggleRowOn : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className={styles.toggleIcon} aria-hidden="true">{icon}</span>
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
