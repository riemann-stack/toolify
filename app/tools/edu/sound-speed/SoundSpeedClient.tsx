'use client'

import { useMemo, useState } from 'react'
import s from './sound-speed.module.css'

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const LIGHT_SPEED = 299_792_458 // m/s
const SOUND_AT_20C = 343        // m/s

function calcSoundSpeed(tempC: number): number {
  return 331.3 + 0.606 * tempC
}

// ─────────────────────────────────────────────
// 데이터
// ─────────────────────────────────────────────
const COMMON_DISTANCES = [
  { name: '교실 길이',         m: 10,         emoji: '🏫', meta: '10m' },
  { name: '100m 달리기',      m: 100,        emoji: '🏃', meta: '100m' },
  { name: '축구장 가로',       m: 105,        emoji: '⚽', meta: '105m' },
  { name: '63빌딩 높이',      m: 250,        emoji: '🏢', meta: '250m' },
  { name: '에펠탑 높이',      m: 330,        emoji: '🗼', meta: '330m' },
  { name: '롯데월드타워',      m: 555,        emoji: '🏗️', meta: '555m' },
  { name: '한강 다리',         m: 1_065,      emoji: '🌉', meta: '1.07km' },
  { name: '한라산 높이',       m: 1_947,      emoji: '⛰️', meta: '1.95km' },
  { name: '5km 마라톤',        m: 5_000,      emoji: '🏃‍♂️', meta: '5km' },
  { name: '서울→부산',         m: 325_000,    emoji: '🚄', meta: '325km' },
  { name: '한반도 남북',       m: 1_100_000,  emoji: '🗺️', meta: '1,100km' },
  { name: '지구 둘레',         m: 40_075_000, emoji: '🌍', meta: '40,075km' },
]

const VEHICLE_SPEEDS = [
  { name: '🚶 걸음',          kmh: 5,    isSuperSonic: false },
  { name: '🚗 자동차 (시내)', kmh: 60,   isSuperSonic: false },
  { name: '🛣️ 자동차 (고속)', kmh: 100,  isSuperSonic: false },
  { name: '🚄 KTX',           kmh: 305,  isSuperSonic: false },
  { name: '✈️ 여객기',         kmh: 900,  isSuperSonic: false },
  { name: '🌬️ 음속 (1마하)',   kmh: 1235, isSuperSonic: false, isMach: true },
  { name: '🛩️ F-16 전투기',    kmh: 2120, isSuperSonic: true },
  { name: '🛩️ F-15 전투기',    kmh: 3000, isSuperSonic: true },
  { name: '🛸 SR-71 정찰기',   kmh: 3530, isSuperSonic: true },
]

const MEDIUM_SPEEDS = [
  { medium: '진공',     speed: 0,      cls: 'mediumVacuum',  note: '소리 전달 불가' },
  { medium: '공기',     speed: 343,    cls: 'mediumAir',     note: '20°C 기준, 일반적' },
  { medium: '물',       speed: 1_482,  cls: 'mediumWater',   note: '공기의 약 4.3배' },
  { medium: '바닷물',   speed: 1_531,  cls: 'mediumWater',   note: '담수보다 약간 빠름' },
  { medium: '나무',     speed: 3_300,  cls: 'mediumWood',    note: '공기의 약 9.6배' },
  { medium: '벽돌',     speed: 3_650,  cls: 'mediumWood',    note: '공기의 약 10.6배' },
  { medium: '구리',     speed: 4_600,  cls: 'mediumMetal',   note: '공기의 약 13배' },
  { medium: '강철',     speed: 5_960,  cls: 'mediumMetal',   note: '공기의 약 17배' },
  { medium: '다이아몬드', speed: 12_000, cls: 'mediumCrystal', note: '공기의 약 35배 — 가장 빠름' },
]

// 잔향 시간 — 재질별 흡음률 (단순화)
const ABSORPTION = {
  wall: {
    concrete: 0.02,
    brick:    0.03,
    wood:     0.10,
    gypsum:   0.15,
    panel:    0.30,
  },
  floor: {
    concrete: 0.02,
    tile:     0.03,
    wood:     0.07,
    carpet:   0.30,
  },
  ceiling: {
    concrete: 0.02,
    gypsum:   0.10,
    panel:    0.40,
  },
}
const ROOM_PRESETS = [
  { name: '작은 방',  rt: 0.4, w: 4,  d: 4,  h: 2.5 },
  { name: '교실',     rt: 0.6, w: 8,  d: 8,  h: 3 },
  { name: '강당',     rt: 1.2, w: 20, d: 20, h: 8 },
  { name: '콘서트홀', rt: 1.8, w: 30, d: 30, h: 15 },
  { name: '대성당',   rt: 4.0, w: 50, d: 50, h: 25 },
  { name: '동굴',     rt: 8.0, w: 100, d: 100, h: 30 },
]

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
function fmtDist(m: number): string {
  if (!Number.isFinite(m)) return '-'
  if (Math.abs(m) >= 1_000_000) return `${(m / 1_000_000).toFixed(2)} 백만 km`
  if (Math.abs(m) >= 1000)      return `${(m / 1000).toFixed(2)} km`
  return `${m.toFixed(1)} m`
}
function fmtTime(s: number): string {
  if (!Number.isFinite(s)) return '-'
  if (s < 0.001) return `${(s * 1_000_000).toFixed(2)} µs`
  if (s < 1)     return `${(s * 1000).toFixed(2)} ms`
  if (s < 60)    return `${s.toFixed(2)}초`
  if (s < 3600)  return `${Math.floor(s / 60)}분 ${Math.round(s % 60)}초`
  if (s < 86400) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    return `${h}시간 ${m}분`
  }
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  return `${d}일 ${h}시간`
}

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function SoundSpeedClient() {
  const [tab, setTab] = useState<'thunder' | 'arrival' | 'vs' | 'echo'>('thunder')
  const [tempC, setTempC] = useState<number>(20)
  const soundSpeed = useMemo(() => calcSoundSpeed(tempC), [tempC])

  // 탭 1
  const [thunderSec, setThunderSec] = useState<number>(5)

  // 탭 2
  const [distM, setDistM] = useState<number>(100)

  // 탭 4
  const [echoMode, setEchoMode] = useState<'simple' | 'rt60'>('simple')
  const [wallM, setWallM] = useState<number>(20)
  // RT60
  const [roomW, setRoomW] = useState<number>(8)
  const [roomD, setRoomD] = useState<number>(8)
  const [roomH, setRoomH] = useState<number>(3)
  const [wallMat, setWallMat] = useState<keyof typeof ABSORPTION.wall>('gypsum')
  const [floorMat, setFloorMat] = useState<keyof typeof ABSORPTION.floor>('wood')
  const [ceilMat, setCeilMat] = useState<keyof typeof ABSORPTION.ceiling>('gypsum')

  const [copied, setCopied] = useState<boolean>(false)

  // ─────────────────────────────────────────────
  // 탭 1 계산 — 천둥 거리
  // ─────────────────────────────────────────────
  const thunderResult = useMemo(() => {
    const distM = thunderSec * soundSpeed
    let level: 'safe' | 'lowRisk' | 'midRisk' | 'highRisk' | 'extreme'
    let levelText: string
    if (thunderSec >= 30)      { level = 'safe';     levelText = '🟢 안전 (10km+)' }
    else if (thunderSec >= 10) { level = 'lowRisk';  levelText = '🟡 약간 가까움 (3~10km)' }
    else if (thunderSec >= 5)  { level = 'midRisk';  levelText = '🟠 가까움 (1.7~3km)' }
    else if (thunderSec >= 1)  { level = 'highRisk'; levelText = '🔴 매우 가까움' }
    else                        { level = 'extreme';  levelText = '🟣 위험 — 직격 가능성' }
    return { distM, distKm: distM / 1000, distMile: distM / 1609.34, level, levelText }
  }, [thunderSec, soundSpeed])

  // ─────────────────────────────────────────────
  // 탭 2 — 소리 도달 시간
  // ─────────────────────────────────────────────
  const arrivalResult = useMemo(() => {
    const soundTime = distM / soundSpeed
    const lightTime = distM / LIGHT_SPEED
    return {
      soundTime, lightTime,
      diff: soundTime - lightTime,
      ratio: LIGHT_SPEED / soundSpeed,
    }
  }, [distM, soundSpeed])

  // ─────────────────────────────────────────────
  // 탭 4 — 에코·RT60
  // ─────────────────────────────────────────────
  const echoSimple = useMemo(() => {
    const round = wallM * 2
    const delayS = round / soundSpeed
    let cat: 'low' | 'mid' | 'high' | 'vhigh'
    if (delayS < 0.05)      cat = 'low'
    else if (delayS < 0.1)  cat = 'mid'
    else if (delayS < 1)    cat = 'high'
    else                    cat = 'vhigh'
    return { delayS, delayMs: delayS * 1000, cat }
  }, [wallM, soundSpeed])

  const rt60Result = useMemo(() => {
    const V = roomW * roomD * roomH
    const wallArea = 2 * (roomW * roomH + roomD * roomH)
    const floorArea = roomW * roomD
    const ceilArea = roomW * roomD
    const A = wallArea * ABSORPTION.wall[wallMat]
            + floorArea * ABSORPTION.floor[floorMat]
            + ceilArea * ABSORPTION.ceiling[ceilMat]
    const rt60 = A > 0 ? 0.161 * V / A : 0
    return { V, A, rt60 }
  }, [roomW, roomD, roomH, wallMat, floorMat, ceilMat])

  function applyRoomPreset(p: typeof ROOM_PRESETS[0]) {
    setRoomW(p.w); setRoomD(p.d); setRoomH(p.h)
  }

  // ─────────────────────────────────────────────
  // 복사
  // ─────────────────────────────────────────────
  async function copyResult() {
    let text = ''
    if (tab === 'thunder') {
      text = [
        `[천둥 번개 거리]`,
        `시간 차: ${thunderSec}초 · 기온: ${tempC}°C (음속 ${soundSpeed.toFixed(1)}m/s)`,
        `거리: ${fmtDist(thunderResult.distM)} (${thunderResult.distKm.toFixed(2)}km)`,
        `등급: ${thunderResult.levelText}`,
        ``,
        `https://youtil.kr/tools/edu/sound-speed`,
      ].join('\n')
    } else if (tab === 'arrival') {
      text = [
        `[소리 도달 시간]`,
        `거리: ${fmtDist(distM)} · 기온: ${tempC}°C`,
        `소리 도달: ${fmtTime(arrivalResult.soundTime)}`,
        `빛 도달: ${fmtTime(arrivalResult.lightTime)}`,
        `빛은 소리의 약 ${Math.round(arrivalResult.ratio).toLocaleString()}배 빠름`,
        ``,
        `https://youtil.kr/tools/edu/sound-speed`,
      ].join('\n')
    } else if (tab === 'vs') {
      text = [
        `[빛 vs 소리 비교]`,
        `광속: 299,792,458 m/s ≈ 30만 km/s`,
        `음속: ${soundSpeed.toFixed(1)} m/s (${tempC}°C)`,
        `비율: 빛은 소리의 약 ${Math.round(arrivalResult.ratio).toLocaleString()}배 빠름`,
        ``,
        `https://youtil.kr/tools/edu/sound-speed`,
      ].join('\n')
    } else {
      if (echoMode === 'simple') {
        text = [
          `[에코 지연]`,
          `벽까지 거리: ${wallM}m`,
          `왕복 거리: ${wallM * 2}m`,
          `에코 지연: ${echoSimple.delayMs.toFixed(1)}ms`,
          ``,
          `https://youtil.kr/tools/edu/sound-speed`,
        ].join('\n')
      } else {
        text = [
          `[잔향 시간 RT60]`,
          `공간: ${roomW} × ${roomD} × ${roomH}m (부피 ${rt60Result.V.toFixed(0)}m³)`,
          `벽: ${wallMat} · 바닥: ${floorMat} · 천장: ${ceilMat}`,
          `RT60: ${rt60Result.rt60.toFixed(2)}초`,
          ``,
          `https://youtil.kr/tools/edu/sound-speed`,
        ].join('\n')
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <div className={s.disclaimer}>
        <strong>교육·학습 목적 시뮬레이터</strong>입니다. 실제 음속은 공기 밀도·습도·고도·바람에 따라 달라질 수 있으며,
        표시값은 표준 조건(건조한 공기, 1기압) 기준입니다. 번개·낙뢰 안전은 기상청 가이드를 따르세요.
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        <button className={`${s.tabBtn} ${tab === 'thunder' ? s.tabActive : ''}`} onClick={() => setTab('thunder')}>천둥 번개 거리</button>
        <button className={`${s.tabBtn} ${tab === 'arrival' ? s.tabActive : ''}`} onClick={() => setTab('arrival')}>소리 도달 시간</button>
        <button className={`${s.tabBtn} ${tab === 'vs'      ? s.tabActive : ''}`} onClick={() => setTab('vs')}>빛 vs 소리</button>
        <button className={`${s.tabBtn} ${tab === 'echo'    ? s.tabActive : ''}`} onClick={() => setTab('echo')}>반향·에코</button>
      </div>

      {/* 공통: 온도 슬라이더 */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>외부 기온 (°C)</span>
          <span className={s.cardLabelHint}>음속 = 331.3 + 0.606 × T</span>
        </div>
        <div className={s.sliderRow}>
          <input type="range" min={-20} max={40} step={1} value={tempC} onChange={e => setTempC(parseFloat(e.target.value))} />
          <span className={s.sliderValue}>{tempC}°C</span>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7, textAlign: 'center' }}>
          현재 음속: <strong style={{ color: '#3EFFD0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{soundSpeed.toFixed(1)} m/s</strong>
          {' '}≈ {(soundSpeed * 3.6).toFixed(0)} km/h ≈ <strong style={{ color: '#3EFFD0' }}>1마하</strong>
        </p>
      </div>

      {/* ─── TAB 1: 천둥 번개 거리 ─── */}
      {tab === 'thunder' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>번개 후 천둥까지 시간 (초)</span>
              <span className={s.cardLabelHint}>0.5~30초</span>
            </div>
            <div className={s.sliderRow}>
              <input type="range" min={0.5} max={30} step={0.5} value={thunderSec} onChange={e => setThunderSec(parseFloat(e.target.value))} />
              <span className={s.sliderValue}>{thunderSec.toFixed(1)}초</span>
            </div>
            <div className={s.quickRow} style={{ marginTop: 10 }}>
              {[1, 3, 5, 10, 20].map(t => (
                <button key={t} className={`${s.quickBtn} ${Math.abs(thunderSec - t) < 0.01 ? s.quickActive : ''}`} onClick={() => setThunderSec(t)}>
                  {t}초
                </button>
              ))}
            </div>
          </div>

          {/* HERO */}
          <div className={`${s.hero} ${
            thunderResult.level === 'safe'      ? s.heroSafe :
            thunderResult.level === 'lowRisk'   ? s.heroLowRisk :
            thunderResult.level === 'midRisk'   ? s.heroMidRisk :
            thunderResult.level === 'highRisk'  ? s.heroHighRisk :
            s.heroExtreme
          }`}>
            <p className={s.heroLead}>번개와의 거리</p>
            <p className={s.heroLevel}>{thunderResult.levelText}</p>
            <div>
              <span className={s.heroNum}>{thunderResult.distKm < 1 ? thunderResult.distM.toFixed(0) : thunderResult.distKm.toFixed(2)}</span>
              <span className={s.heroUnit}>{thunderResult.distKm < 1 ? 'm' : 'km'}</span>
            </div>
            <p className={s.heroSub}>
              <strong>{thunderSec}초</strong> × <strong>{soundSpeed.toFixed(1)}m/s</strong> ({tempC}°C 음속) =
              {' '}<strong>{thunderResult.distM.toFixed(0)}m</strong>
            </p>
          </div>

          {/* 30-30 안전 안내 */}
          <div className={s.safetyNote}>
            ⚠️ <strong>NOAA &quot;30-30 규칙&quot;:</strong> 번개를 본 후 30초 이내 천둥이 들리면 즉시 실내로 대피.
            마지막 천둥 후 <strong>30분간 실내 대기</strong>가 권장됩니다.
          </div>

          {/* 빠른 참조 표 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>시간별 거리 빠른 참조</span>
              <span className={s.cardLabelHint}>{tempC}°C 기준</span>
            </div>
            <div className={s.tableScroll}>
              <table className={s.compareTable} style={{ minWidth: 460 }}>
                <thead>
                  <tr><th>시간</th><th>거리 (m)</th><th>거리 (km)</th><th>안전 등급</th></tr>
                </thead>
                <tbody>
                  {[1, 3, 5, 10, 15, 30].map(t => {
                    const d = t * soundSpeed
                    const isCurrent = Math.abs(thunderSec - t) < 0.01
                    const lvl = t >= 30 ? '🟢 안전' : t >= 10 ? '🟡 약간 멀음' : t >= 5 ? '🟠 주의' : t >= 3 ? '🔴 가까움' : '🟣 위험'
                    return (
                      <tr key={t} className={isCurrent ? s.currentRow : ''}>
                        <td>{t}초</td>
                        <td>{d.toFixed(0)}m</td>
                        <td>{(d / 1000).toFixed(2)}km</td>
                        <td>{lvl}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 음파 시각화 SVG */}
          <div className={s.waveWrap}>
            <svg viewBox="0 0 720 200" className={s.waveSvg}>
              <defs>
                <radialGradient id="lightning" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"  stopColor="#FFD700" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* 번개 */}
              <circle cx="80" cy="100" r="30" fill="url(#lightning)" opacity="0.7" />
              <text x="80" y="108" fontSize="36" textAnchor="middle">⚡</text>
              <text x="80" y="160" fontSize="11" fill="var(--muted)" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif">번개 (T=0)</text>

              {/* 음파 */}
              <circle cx="80" cy="100" r="50"  fill="none" stroke="#3EFFD0" strokeWidth="2" opacity="0.6" className={s.soundRing} />
              <circle cx="80" cy="100" r="50"  fill="none" stroke="#3EFFD0" strokeWidth="2" opacity="0.5" className={s.soundRing2} />
              <circle cx="80" cy="100" r="50"  fill="none" stroke="#3EFFD0" strokeWidth="2" opacity="0.4" className={s.soundRing3} />
              <circle cx="80" cy="100" r="50"  fill="none" stroke="#3EFFD0" strokeWidth="2" opacity="0.3" className={s.soundRing4} />

              {/* 거리 표시 */}
              <line x1="120" y1="100" x2="600" y2="100" stroke="var(--muted)" strokeWidth="1" strokeDasharray="4 4" />
              <text x="360" y="92" fontSize="13" fill="#3EFFD0" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight={800}>
                {thunderResult.distM.toFixed(0)}m
              </text>

              {/* 사람 */}
              <text x="640" y="115" fontSize="40" textAnchor="middle">👤</text>
              <text x="640" y="160" fontSize="11" fill="var(--muted)" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif">관찰자 (T={thunderSec}초)</text>
            </svg>
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ─── TAB 2: 소리 도달 시간 ─── */}
      {tab === 'arrival' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>거리 (m)</span>
              <span className={s.cardLabelHint}>1m ~ 40,000km</span>
            </div>
            <div className={s.sliderRow}>
              <input
                type="range"
                min={0}
                max={1000}
                step={1}
                value={Math.log10(Math.max(1, distM)) * 100}
                onChange={e => {
                  const v = parseFloat(e.target.value) / 100
                  setDistM(Math.round(Math.pow(10, v)))
                }}
              />
              <span className={s.sliderValue}>{fmtDist(distM)}</span>
            </div>
            <div className={s.distPresetGrid} style={{ marginTop: 10 }}>
              {COMMON_DISTANCES.map(d => (
                <button
                  key={d.m}
                  className={`${s.distPresetBtn} ${distM === d.m ? s.distPresetActive : ''}`}
                  onClick={() => setDistM(d.m)}
                  type="button"
                >
                  <span className={s.distPresetEmoji}>{d.emoji}</span>
                  {d.name}
                  <span className={s.distPresetMeta}>{d.meta}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 결과 4분할 */}
          <div className={s.resultGrid}>
            <div className={`${s.resultCard} ${s.resCardSound}`}>
              <p className={s.resultLabel}>🔊 소리 도달</p>
              <p className={s.resultValue}>{fmtTime(arrivalResult.soundTime)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resCardLight}`}>
              <p className={s.resultLabel}>💡 빛 도달</p>
              <p className={s.resultValue}>{fmtTime(arrivalResult.lightTime)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resCardDist}`}>
              <p className={s.resultLabel}>📏 거리</p>
              <p className={s.resultValue}>{fmtDist(distM)}</p>
            </div>
            <div className={`${s.resultCard} ${s.resCardRatio}`}>
              <p className={s.resultLabel}>⚡ 빛/소리 비율</p>
              <p className={s.resultValue}>×{Math.round(arrivalResult.ratio).toLocaleString()}</p>
            </div>
          </div>

          {/* 일상 거리 비교 표 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>일상 거리 비교</span>
            </div>
            <div className={s.tableScroll}>
              <table className={s.compareTable} style={{ minWidth: 480 }}>
                <thead>
                  <tr><th>거리</th><th>실제 거리</th><th>소리 시간</th><th>빛 시간</th></tr>
                </thead>
                <tbody>
                  {COMMON_DISTANCES.map(d => {
                    const sT = d.m / soundSpeed
                    const lT = d.m / LIGHT_SPEED
                    const isCurrent = distM === d.m
                    return (
                      <tr key={d.m} className={isCurrent ? s.currentRow : ''}>
                        <td>{d.emoji} {d.name}</td>
                        <td>{d.meta}</td>
                        <td style={{ color: '#FF8C3E' }}>{fmtTime(sT)}</td>
                        <td style={{ color: '#3EFFD0' }}>{lT < 0.001 ? '거의 즉시' : fmtTime(lT)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.funFactCard}>
            <p className={s.funFactTitle}>💡 흥미로운 사실</p>
            소리는 1km를 가는 데 약 <strong>2.9초</strong>가 걸립니다.
            반면 빛은 같은 1km를 <strong>0.0000033초</strong>에 갑니다.
            빛이 지구를 한 바퀴 도는 데 <strong>0.13초</strong>면 충분하지만,
            소리는 같은 거리를 가는 데 <strong>약 32시간</strong>이 걸립니다.
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ─── TAB 3: 빛 vs 소리 ─── */}
      {tab === 'vs' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>광속 vs 음속</span>
            </div>
            <div style={{
              background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '16px 18px', fontFamily: 'JetBrains Mono, Menlo, monospace',
              fontSize: 13, color: 'var(--text)', lineHeight: 2,
            }}>
              <div>💡 <strong style={{ color: '#3EFFD0' }}>빛의 속도</strong>: 299,792,458 m/s ≈ 30만 km/s</div>
              <div>🔊 <strong style={{ color: '#FF8C3E' }}>음속 (공기, {tempC}°C)</strong>: {soundSpeed.toFixed(1)} m/s</div>
              <div style={{ paddingLeft: 20, color: 'var(--muted)', fontSize: 12 }}>
                → 빛은 소리의 약 <strong style={{ color: '#3EFFD0' }}>{Math.round(arrivalResult.ratio).toLocaleString()}배</strong> 빠름
              </div>
            </div>
          </div>

          {/* 같은 거리 1km 비교 시각화 */}
          <div className={s.vsBar}>
            <p style={{ fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 700, color: 'var(--text)', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
              같은 1km 거리 도달 시간
            </p>
            <div className={s.vsBarRow}>
              <span className={s.vsBarLabel}>💡 빛</span>
              <div className={s.vsBarTrack}>
                <div className={`${s.vsBarFill} ${s.vsBarLight}`} style={{ width: '0.1%' }} />
              </div>
              <span className={s.vsBarValue}>{fmtTime(1000 / LIGHT_SPEED)}</span>
            </div>
            <div className={s.vsBarRow}>
              <span className={s.vsBarLabel}>🔊 소리</span>
              <div className={s.vsBarTrack}>
                <div className={`${s.vsBarFill} ${s.vsBarSound}`} style={{ width: '100%' }} />
              </div>
              <span className={s.vsBarValue}>{fmtTime(1000 / soundSpeed)}</span>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
              ※ 막대는 시각화용. 실제 빛은 소리보다 약 87만 배 빠름.
            </p>
          </div>

          {/* 매질별 음속 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>매질별 음속</span>
              <span className={s.cardLabelHint}>20°C, 1기압</span>
            </div>
            <div className={s.mediumGrid}>
              {MEDIUM_SPEEDS.map(m => (
                <div key={m.medium} className={`${s.mediumCard} ${s[m.cls]}`}>
                  <p className={s.mediumCardName}>{m.medium}</p>
                  <p className={s.mediumCardSpeed}>{m.speed === 0 ? '0' : m.speed.toLocaleString()}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>m/s</span></p>
                  <p className={s.mediumCardNote}>{m.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 마하 비교 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>마하 비교 (1마하 = 약 {(soundSpeed * 3.6).toFixed(0)} km/h)</span>
            </div>
            <div className={s.tableScroll}>
              <table className={s.compareTable} style={{ minWidth: 480 }}>
                <thead>
                  <tr><th>대상</th><th>속도 (km/h)</th><th>마하</th></tr>
                </thead>
                <tbody>
                  {VEHICLE_SPEEDS.map((v, i) => {
                    const mach = (v.kmh * 1000 / 3600) / soundSpeed
                    const cls = v.isMach ? s.machSpeed : v.isSuperSonic ? s.superSonic : ''
                    return (
                      <tr key={i} className={cls}>
                        <td>{v.name}</td>
                        <td>{v.kmh.toLocaleString()} km/h</td>
                        <td>{mach.toFixed(2)} 마하</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
              ⭐ 음속(1마하)은 자동차의 <strong style={{ color: '#3EFFD0' }}>약 12배</strong>, KTX의 <strong style={{ color: '#3EFFD0' }}>약 4배</strong> 빠릅니다.
            </p>
          </div>

          <div className={s.funFactCard}>
            <p className={s.funFactTitle}>💡 흥미로운 사실 모음</p>
            <ul style={{ paddingLeft: 20, margin: 0, lineHeight: 2 }}>
              <li>음속을 처음 돌파한 건 <strong>1947년 척 예거</strong>의 X-1 비행기</li>
              <li>음속 돌파 시 <strong>소닉붐</strong>(충격파) 발생</li>
              <li>광속은 <strong>우주의 절대 속도 한계</strong> (특수 상대성 이론)</li>
              <li>빛은 <strong>1초에 지구를 약 7바퀴</strong></li>
              <li>태양빛이 지구에 닿는 데 약 <strong>8분 20초</strong></li>
              <li>달까지 빛 도달: <strong>약 1.3초</strong></li>
            </ul>
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}

      {/* ─── TAB 4: 반향·에코 ─── */}
      {tab === 'echo' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>모드 선택</span>
            </div>
            <div className={s.modeRow}>
              <button className={`${s.modeBtn} ${echoMode === 'simple' ? s.modeActive : ''}`} onClick={() => setEchoMode('simple')}>단순 에코 (벽 반사)</button>
              <button className={`${s.modeBtn} ${echoMode === 'rt60'   ? s.modeActive : ''}`} onClick={() => setEchoMode('rt60')}>잔향 시간 (RT60 / Sabine)</button>
            </div>
          </div>

          {echoMode === 'simple' && (
            <>
              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>벽까지 거리 (m)</span>
                  <span className={s.cardLabelHint}>5~200m</span>
                </div>
                <div className={s.sliderRow}>
                  <input type="range" min={5} max={200} step={1} value={wallM} onChange={e => setWallM(parseFloat(e.target.value))} />
                  <span className={s.sliderValue}>{wallM}m</span>
                </div>
              </div>

              <div className={`${s.hero} ${s.heroNeutral}`}>
                <p className={s.heroLead}>에코 지연 시간</p>
                <div>
                  <span className={s.heroNum}>{echoSimple.delayMs.toFixed(0)}</span>
                  <span className={s.heroUnit}>ms</span>
                </div>
                <p className={s.heroSub}>
                  왕복 <strong>{wallM * 2}m</strong> ÷ <strong>{soundSpeed.toFixed(1)}m/s</strong> =
                  {' '}<strong>{echoSimple.delayS.toFixed(3)}초</strong>
                </p>
              </div>

              <div className={s.echoLevels}>
                {[
                  { c: 'low',   label: '0~50ms',   desc: '단일 소리 (분리 인식 X)' },
                  { c: 'mid',   label: '50~100ms', desc: '약간 길게 느껴짐' },
                  { c: 'high',  label: '100~1000ms', desc: '분리된 에코 인식' },
                  { c: 'vhigh', label: '1초+',     desc: '명확한 메아리' },
                ].map((lv) => (
                  <div key={lv.c} className={`${s.echoLevel} ${s[`echo${lv.c.charAt(0).toUpperCase() + lv.c.slice(1)}`]} ${echoSimple.cat === lv.c ? s.echoActive : ''}`}>
                    <strong>{lv.label}</strong>
                    {lv.desc}
                  </div>
                ))}
              </div>
            </>
          )}

          {echoMode === 'rt60' && (
            <>
              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>공간 프리셋</span>
                  <span className={s.cardLabelHint}>클릭 시 자동 입력</span>
                </div>
                <div className={s.distPresetGrid}>
                  {ROOM_PRESETS.map(p => (
                    <button key={p.name} className={s.distPresetBtn} onClick={() => applyRoomPreset(p)} type="button">
                      {p.name}<span className={s.distPresetMeta}>{p.w}×{p.d}×{p.h}m</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>공간 크기 (m)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <span className={s.subLabel}>가로 (W)</span>
                    <input className={s.bigInput} type="number" min="1" max="200" step="1" value={roomW} onChange={e => setRoomW(parseFloat(e.target.value) || 1)} />
                  </div>
                  <div>
                    <span className={s.subLabel}>세로 (D)</span>
                    <input className={s.bigInput} type="number" min="1" max="200" step="1" value={roomD} onChange={e => setRoomD(parseFloat(e.target.value) || 1)} />
                  </div>
                  <div>
                    <span className={s.subLabel}>높이 (H)</span>
                    <input className={s.bigInput} type="number" min="1" max="50" step="0.5" value={roomH} onChange={e => setRoomH(parseFloat(e.target.value) || 1)} />
                  </div>
                </div>
              </div>

              <div className={s.card}>
                <div className={s.cardLabel}>
                  <span>표면 재질 (흡음률 자동)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div>
                    <span className={s.subLabel}>벽</span>
                    <select className={s.bigInput} value={wallMat} onChange={e => setWallMat(e.target.value as keyof typeof ABSORPTION.wall)}>
                      <option value="concrete">콘크리트 (0.02)</option>
                      <option value="brick">벽돌 (0.03)</option>
                      <option value="wood">나무 (0.10)</option>
                      <option value="gypsum">석고 (0.15)</option>
                      <option value="panel">흡음 패널 (0.30)</option>
                    </select>
                  </div>
                  <div>
                    <span className={s.subLabel}>바닥</span>
                    <select className={s.bigInput} value={floorMat} onChange={e => setFloorMat(e.target.value as keyof typeof ABSORPTION.floor)}>
                      <option value="concrete">콘크리트 (0.02)</option>
                      <option value="tile">타일 (0.03)</option>
                      <option value="wood">원목/마루 (0.07)</option>
                      <option value="carpet">카펫 (0.30)</option>
                    </select>
                  </div>
                  <div>
                    <span className={s.subLabel}>천장</span>
                    <select className={s.bigInput} value={ceilMat} onChange={e => setCeilMat(e.target.value as keyof typeof ABSORPTION.ceiling)}>
                      <option value="concrete">콘크리트 (0.02)</option>
                      <option value="gypsum">석고 (0.10)</option>
                      <option value="panel">흡음 패널 (0.40)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={`${s.hero} ${s.heroNeutral}`}>
                <p className={s.heroLead}>잔향 시간 RT60</p>
                <div>
                  <span className={s.heroNum}>{rt60Result.rt60.toFixed(2)}</span>
                  <span className={s.heroUnit}>초</span>
                </div>
                <p className={s.heroSub}>
                  부피 <strong>{rt60Result.V.toFixed(0)}m³</strong> · 흡음량 <strong>{rt60Result.A.toFixed(2)}m²</strong>
                  <br />
                  Sabine 공식: <strong>RT60 = 0.161 × V / A</strong>
                </p>
              </div>

              <div className={s.rt60Card}>
                <p className={s.rt60Title}>📊 일반 공간 RT60 비교</p>
                {ROOM_PRESETS.map(p => (
                  <div key={p.name} className={s.rt60Row}>
                    <span>{p.name}</span>
                    <strong>{p.rt.toFixed(1)}초</strong>
                  </div>
                ))}
              </div>

              <div className={s.funFactCard}>
                <p className={s.funFactTitle}>💡 콘서트홀 설계의 비밀</p>
                콘서트홀은 음악에 적합한 <strong>1.5~2초 RT60</strong>로 의도적 설계됩니다.
                너무 짧으면 음악이 메마르고(드라이), 너무 길면 흐려져서 명료도가 떨어집니다.
                예술의전당·세종문화회관 같은 한국 주요 콘서트홀은 약 1.8초로 조정되어 있습니다.
              </div>
            </>
          )}

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyResult} type="button">
            {copied ? '✓ 복사됨' : '결과 복사하기'}
          </button>
        </>
      )}
    </div>
  )
}
