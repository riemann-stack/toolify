'use client'

import { useEffect, useMemo, useState } from 'react'
import s from './fov.module.css'
import {
  SENSORS, POPULAR_FOCALS, USE_CASES, getSensor, getLensCategory,
  type SensorId,
  equiv35, aov, frameSize, equivAperture, rule500, rule300,
  fmt, fmtInt, fmtDistance, aovDescription,
} from './fovUtils'

type Tab = 'equiv' | 'frame' | 'compare' | 'guide'

const STORAGE_KEY = 'youtil_fov_v1'

export default function FovClient() {
  const [tab, setTab] = useState<Tab>('equiv')

  /* 공통 */
  const [sensorId, setSensorId] = useState<SensorId>('ff')
  const [focalLength, setFocalLength] = useState<number>(50) // 실제 mm
  const [aperture, setAperture] = useState<number>(2.8)

  /* 시야 너비 탭 */
  const [distance, setDistance] = useState<number>(3) // m

  /* 비교 탭 */
  const [compareSensorId, setCompareSensorId] = useState<SensorId>('ff')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.sensorId) setSensorId(j.sensorId)
      if (typeof j.focalLength === 'number') setFocalLength(j.focalLength)
      if (typeof j.aperture === 'number') setAperture(j.aperture)
      if (typeof j.distance === 'number') setDistance(j.distance)
      if (j.compareSensorId) setCompareSensorId(j.compareSensorId)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sensorId, focalLength, aperture, distance, compareSensorId }))
    } catch {}
  }, [sensorId, focalLength, aperture, distance, compareSensorId])

  /* 계산 */
  const sensor = getSensor(sensorId)
  const fl35 = useMemo(() => equiv35(focalLength, sensor), [focalLength, sensor])
  const aovH = useMemo(() => aov(sensor.width, focalLength), [sensor, focalLength])
  const aovV = useMemo(() => aov(sensor.height, focalLength), [sensor, focalLength])
  const aovD = useMemo(() => aov(sensor.diagonal, focalLength), [sensor, focalLength])
  const lensCat = useMemo(() => getLensCategory(fl35), [fl35])
  const equivAp = useMemo(() => equivAperture(aperture, sensor.cropFactor), [aperture, sensor])

  const frameW = useMemo(() => frameSize(distance, sensor.width, focalLength), [distance, sensor, focalLength])
  const frameH = useMemo(() => frameSize(distance, sensor.height, focalLength), [distance, sensor, focalLength])

  const star500 = rule500(fl35)
  const star300 = rule300(fl35)

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        <button className={`${s.tab} ${tab === 'equiv' ? s.tabActive : ''}`}    onClick={() => setTab('equiv')}>📷 35mm 환산·화각</button>
        <button className={`${s.tab} ${tab === 'frame' ? s.tabActive : ''}`}    onClick={() => setTab('frame')}>📏 시야 너비</button>
        <button className={`${s.tab} ${tab === 'compare' ? s.tabActive : ''}`}  onClick={() => setTab('compare')}>🔍 화각 비교</button>
        <button className={`${s.tab} ${tab === 'guide' ? s.tabActive : ''}`}    onClick={() => setTab('guide')}>🎯 용도별 가이드</button>
      </div>

      {/* ───── 탭 1: 35mm 환산·화각 ───── */}
      {tab === 'equiv' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📐 카메라 센서</span>
            <select value={sensorId} onChange={(e) => setSensorId(e.target.value as SensorId)} className={s.input}>
              {SENSORS.map((sm) => (
                <option key={sm.id} value={sm.id}>
                  {sm.label} (×{sm.cropFactor})
                </option>
              ))}
            </select>
            <p className={s.hint}>
              <strong>{sensor.width} × {sensor.height} mm</strong> · 대각선 {fmt(sensor.diagonal, 2)} mm · 크롭 팩터 ×{sensor.cropFactor}<br />
              <span className={s.muted}>예: {sensor.example}</span>
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🔭 실제 초점거리 (mm)</span>
            <div className={s.sliderHead}>
              <span className={s.sliderLabel}>렌즈 표기 mm</span>
              <span className={s.sliderValue}>{fmt(focalLength, 0)} mm</span>
            </div>
            <input
              type="range" min={4} max={800} step={1}
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
              className={s.slider}
            />
            <div className={s.sliderTicks}>
              <span>4</span><span>14</span><span>50</span><span>200</span><span>400</span><span>800</span>
            </div>
            <div className={s.quickRow}>
              {[14, 24, 35, 50, 85, 105, 200, 300, 400, 600].map((f) => (
                <button key={f} className={s.quickChip} onClick={() => setFocalLength(f)}>{f}mm</button>
              ))}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🌀 조리개 (등가 조리개 환산용)</span>
            <div className={s.sliderHead}>
              <span className={s.sliderLabel}>f/N</span>
              <span className={s.sliderValue}>f/{fmt(aperture, 1)}</span>
            </div>
            <input
              type="range" min={1.0} max={22} step={0.1}
              value={aperture}
              onChange={(e) => setAperture(Number(e.target.value))}
              className={s.slider}
            />
            <div className={s.sliderTicks}>
              <span>f/1</span><span>f/2.8</span><span>f/5.6</span><span>f/11</span><span>f/22</span>
            </div>
          </div>

          {/* 결과 — 35mm 환산 */}
          <div className={s.heroCard}>
            <div>
              <p className={s.heroLabel}>35mm 환산 초점거리</p>
              <p className={s.heroValue}>
                <span className={s.heroNum}>{fmt(fl35, 0)}</span> mm 환산
              </p>
              <p className={s.heroSub}>
                실제 <strong>{focalLength}mm</strong> × 크롭 ×{sensor.cropFactor} = <strong>{fmt(fl35, 1)} mm</strong> (풀프레임 환산)
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroEvDesc}>
                {lensCat.emoji} <strong>{lensCat.name}</strong>
                <br />
                <span className={s.muted}>{lensCat.use}</span>
              </p>
            </div>
          </div>

          {/* 화각 결과 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📐 화각 (Angle of View)</span>
            <div className={s.aovGrid}>
              <div className={s.aovCell}>
                <p className={s.aovLabel}>수평 (Horizontal)</p>
                <p className={s.aovValue}>{fmt(aovH, 1)}°</p>
              </div>
              <div className={s.aovCell}>
                <p className={s.aovLabel}>수직 (Vertical)</p>
                <p className={s.aovValue}>{fmt(aovV, 1)}°</p>
              </div>
              <div className={s.aovCell}>
                <p className={s.aovLabel}>대각 (Diagonal)</p>
                <p className={s.aovValue}>{fmt(aovD, 1)}°</p>
              </div>
            </div>
            <p className={s.hint}>
              {aovDescription(aovD)} · 공식: AOV = 2 × atan(센서변 / 2f)
            </p>

            {/* AOV SVG 시각화 */}
            <div className={s.aovSvgWrap}>
              <AovDiagram aovDegrees={aovH} color="var(--accent)" />
            </div>
          </div>

          {/* 등가 조리개 + 별 룰 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🎯 추가 환산</span>
            <div className={s.tableSimple}>
              <div className={s.row}>
                <span className={s.rowKey}>등가 조리개 (심도 환산)</span>
                <span className={s.rowVal}>f/{fmt(equivAp, 1)}</span>
              </div>
              <div className={s.row}>
                <span className={s.rowKey}>별 사진 500룰 — 최대 셔터</span>
                <span className={s.rowVal}>{fmt(star500, 1)} 초</span>
              </div>
              <div className={s.row}>
                <span className={s.rowKey}>고해상도 300룰 (45MP+)</span>
                <span className={s.rowVal}>{fmt(star300, 1)} 초</span>
              </div>
              <div className={s.row}>
                <span className={s.rowKey}>안전 셔터 룰 (1/35mm환산)</span>
                <span className={s.rowVal}>1/{fmtInt(fl35)} 초</span>
              </div>
            </div>
            <p className={s.hint}>
              💡 <strong>등가 조리개</strong> — 같은 35mm 환산 화각·동일 거리에서 풀프레임과 같은 심도(보케)를 만들려면 풀프레임 f/{fmt(equivAp, 1)} 정도가 필요합니다.
            </p>
          </div>
        </>
      )}

      {/* ───── 탭 2: 시야 너비 ───── */}
      {tab === 'frame' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📐 카메라 + 렌즈 + 거리</span>
            <div className={s.field}>
              <label className={s.fieldLabel}>센서</label>
              <select value={sensorId} onChange={(e) => setSensorId(e.target.value as SensorId)} className={s.input}>
                {SENSORS.map((sm) => (
                  <option key={sm.id} value={sm.id}>{sm.label} (×{sm.cropFactor})</option>
                ))}
              </select>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel}>실제 초점거리 (mm) — {fmt(focalLength, 0)} mm · 35mm 환산 {fmt(fl35, 0)}mm</label>
              <input type="range" min={4} max={800} step={1}
                value={focalLength}
                onChange={(e) => setFocalLength(Number(e.target.value))}
                className={s.slider} />
              <div className={s.quickRow}>
                {[14, 24, 35, 50, 85, 105, 200, 400].map((f) => (
                  <button key={f} className={s.quickChip} onClick={() => setFocalLength(f)}>{f}mm</button>
                ))}
              </div>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel}>피사체 거리 — {fmtDistance(distance)}</label>
              <input type="range" min={0.1} max={100} step={0.1}
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className={s.slider} />
              <div className={s.quickRow}>
                {[0.5, 1, 2, 3, 5, 10, 20, 50].map((d) => (
                  <button key={d} className={s.quickChip} onClick={() => setDistance(d)}>{d < 1 ? `${d * 100}cm` : `${d}m`}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 결과 — 시야 너비/높이 */}
          <div className={s.heroCard}>
            <div>
              <p className={s.heroLabel}>{fmtDistance(distance)} 거리에서 프레임 크기</p>
              <p className={s.heroValue}>
                <span className={s.heroNum}>{fmt(frameW, 2)}</span> × <span className={s.heroNum}>{fmt(frameH, 2)}</span> m
              </p>
              <p className={s.heroSub}>
                가로 {fmtDistance(frameW)} · 세로 {fmtDistance(frameH)}
                {' · '}대각 {fmtDistance(Math.sqrt(frameW * frameW + frameH * frameH))}
              </p>
            </div>
            <div className={s.heroRight}>
              <p className={s.heroEvDesc}>
                공식: 너비 = 거리 × 센서변 / 초점거리
              </p>
            </div>
          </div>

          {/* 거리별 비교 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📊 같은 렌즈로 거리별 시야 너비</span>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>거리</th>
                  <th>가로</th>
                  <th>세로</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {[0.5, 1, 2, 3, 5, 10, 20, 50, 100].map((d) => {
                  const w = frameSize(d, sensor.width, focalLength)
                  const h = frameSize(d, sensor.height, focalLength)
                  return (
                    <tr key={d} className={Math.abs(d - distance) < 0.01 ? s.rowHighlight : ''}>
                      <td className={s.mono}>{d < 1 ? `${d * 100}cm` : `${d}m`}</td>
                      <td className={s.mono}>{fmtDistance(w)}</td>
                      <td className={s.mono}>{fmtDistance(h)}</td>
                      <td className={s.muted}>
                        {d < 1 && '클로즈업·매크로'}
                        {d >= 1 && d < 3 && '인물·제품'}
                        {d >= 3 && d < 10 && '환경 인물·실내'}
                        {d >= 10 && d < 30 && '풍경·이벤트'}
                        {d >= 30 && '원거리·스포츠'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className={s.hint}>
              💡 시야 너비는 <strong>거리에 비례</strong>합니다. 거리 2배 → 시야 너비 2배.
            </p>
          </div>
        </>
      )}

      {/* ───── 탭 3: 화각 비교 ───── */}
      {tab === 'compare' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>📐 비교 기준 센서</span>
            <select value={compareSensorId} onChange={(e) => setCompareSensorId(e.target.value as SensorId)} className={s.input}>
              {SENSORS.map((sm) => (
                <option key={sm.id} value={sm.id}>{sm.label} (×{sm.cropFactor})</option>
              ))}
            </select>
            <p className={s.hint}>
              ⓘ 35mm 환산 초점거리 8개를 모두 표시합니다. 선택한 센서의 실제 초점거리도 함께 보여요.
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>🔍 35mm 환산별 화각 비교 (수평)</span>
            <div className={s.compareSvgWrap}>
              <CompareDiagram sensorWidth={getSensor(compareSensorId).width} />
            </div>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>35mm 환산</th>
                  <th>{getSensor(compareSensorId).label} 실제</th>
                  <th>수평 화각</th>
                  <th>분류</th>
                </tr>
              </thead>
              <tbody>
                {POPULAR_FOCALS.map((p) => {
                  const sensor = getSensor(compareSensorId)
                  const actualFL = p.fl / sensor.cropFactor
                  const aovHorz = aov(36, p.fl)  // 풀프레임 width로 계산 (35mm 환산 화각)
                  const cat = getLensCategory(p.fl)
                  return (
                    <tr key={p.fl}>
                      <td className={s.mono} style={{ color: p.color }}>{p.label}</td>
                      <td className={s.mono}>{fmt(actualFL, 1)} mm</td>
                      <td className={s.mono}>{fmt(aovHorz, 1)}°</td>
                      <td>{cat.emoji} {cat.name}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 렌즈 카테고리 가이드 */}
          <div className={s.card}>
            <span className={s.cardLabel}>📚 35mm 환산 렌즈 카테고리</span>
            <div className={s.lensCatList}>
              {LENS_CATEGORIES_FOR_DISPLAY.map((cat, i) => (
                <div key={i} className={s.lensCatCard}>
                  <p className={s.lensCatName}>{cat.emoji} <strong>{cat.name}</strong> · {cat.range[0]}–{cat.range[1] === 1200 ? '∞' : cat.range[1]}mm</p>
                  <p className={s.lensCatUse}>{cat.use}</p>
                  <p className={s.lensCatExamples}>예: {cat.examples}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ───── 탭 4: 용도별 가이드 ───── */}
      {tab === 'guide' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>🎯 10 용도별 추천 — 35mm 환산</span>
            <div className={s.useCaseGrid}>
              {USE_CASES.map((u) => (
                <button key={u.id} className={s.useCaseCard} onClick={() => {
                  /* 첫 추천 환산값을 현재 센서의 실제 mm로 환산 적용 */
                  const sensorObj = getSensor(sensorId)
                  setFocalLength(Math.round((u.primary / sensorObj.cropFactor) * 10) / 10)
                  setTab('equiv')
                }}>
                  <div className={s.useHead}>
                    <span className={s.useEmoji}>{u.emoji}</span>
                    <div>
                      <p className={s.useName}>{u.name}</p>
                      <p className={s.usePrimary}>주력 {u.primary}mm 환산</p>
                    </div>
                  </div>
                  <div className={s.useChips}>
                    {u.recommended.map((f) => (
                      <span key={f} className={s.useChip}>{f}mm</span>
                    ))}
                  </div>
                  <p className={s.useTip}>{u.tip}</p>
                </button>
              ))}
            </div>
            <p className={s.hint}>
              💡 카드 클릭 시 35mm 환산 추천값을 현재 센서(<strong>{sensor.label}</strong>)의 <strong>실제 mm</strong>로 환산해 환산·화각 탭에 적용됩니다.
            </p>
          </div>

          {/* 환산 빠른 참고 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🧮 35mm 환산 ↔ 실제 mm 변환표</span>
            <table className={s.dataTable}>
              <thead>
                <tr>
                  <th>35mm 환산</th>
                  {SENSORS.slice(0, 5).map((sm) => (
                    <th key={sm.id}>{sm.label.split(' ')[0]} (×{sm.cropFactor})</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[14, 24, 35, 50, 85, 135, 200, 400].map((fl35) => (
                  <tr key={fl35}>
                    <td className={s.mono}>{fl35} mm</td>
                    {SENSORS.slice(0, 5).map((sm) => (
                      <td key={sm.id} className={s.mono}>{fmt(fl35 / sm.cropFactor, 1)} mm</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={s.hint}>
              ⓘ 표의 의미 — &quot;APS-C(×1.5)에서 35mm 환산 50mm 화각을 얻으려면 실제 33.3mm 렌즈가 필요&quot;.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── SVG 화각 도식 (단일 렌즈) ─── */
function AovDiagram({ aovDegrees, color }: { aovDegrees: number; color: string }) {
  const W = 360, H = 180
  const cx = W / 2, cy = H - 18
  const R = 150
  const aovRad = aovDegrees * Math.PI / 180
  const halfA = aovRad / 2
  const x1 = cx - R * Math.sin(halfA)
  const y1 = cy - R * Math.cos(halfA)
  const x2 = cx + R * Math.sin(halfA)
  const y2 = cy - R * Math.cos(halfA)
  const largeArc = aovDegrees > 180 ? 1 : 0
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 420, display: 'block', margin: '0 auto' }}>
      {/* 배경 호 (180°) */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        stroke="var(--bg3)" strokeWidth={1.5} fill="none"
      />
      {/* 화각 영역 */}
      <path
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={color} fillOpacity={0.20} stroke={color} strokeWidth={1.5}
      />
      {/* 카메라 점 */}
      <circle cx={cx} cy={cy} r={4} fill={color} />
      {/* 각도 텍스트 */}
      <text x={cx} y={cy - R - 4} textAnchor="middle" fill={color} fontSize={14} fontWeight={700} fontFamily="Syne, sans-serif">
        {aovDegrees.toFixed(1)}°
      </text>
    </svg>
  )
}

/* ─── SVG 비교 도식 (여러 초점거리 겹침) ─── */
function CompareDiagram({ sensorWidth }: { sensorWidth: number }) {
  const W = 480, H = 240
  const cx = W / 2, cy = H - 24
  const R = 200
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 540, display: 'block', margin: '0 auto' }}>
      {/* 배경 호 */}
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
        stroke="var(--bg3)" strokeWidth={1.5} fill="none"
      />
      {POPULAR_FOCALS.map((p) => {
        // 각 35mm 환산 초점거리의 수평 화각 (풀프레임 width 36mm 기준)
        const aovDeg = aov(36, p.fl)
        const aovRad = aovDeg * Math.PI / 180
        const halfA = aovRad / 2
        // 화각이 클수록 호가 길어 보이도록 안에서 바깥으로 단계 적용
        const idxR = R - (POPULAR_FOCALS.indexOf(p) * 6)
        const x1 = cx - idxR * Math.sin(halfA)
        const y1 = cy - idxR * Math.cos(halfA)
        const x2 = cx + idxR * Math.sin(halfA)
        const y2 = cy - idxR * Math.cos(halfA)
        return (
          <g key={p.fl}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${idxR} ${idxR} 0 0 1 ${x2} ${y2} Z`}
              fill={p.color} fillOpacity={0.10} stroke={p.color} strokeWidth={1.2}
            />
            <text
              x={x2 + 4} y={y2 + 4}
              fill={p.color} fontSize={11} fontWeight={700} fontFamily="Syne, sans-serif"
            >
              {p.label} ({aovDeg.toFixed(0)}°)
            </text>
          </g>
        )
      })}
      {/* 카메라 점 */}
      <circle cx={cx} cy={cy} r={5} fill="var(--text)" />
      <text x={cx} y={cy + 18} textAnchor="middle" fill="var(--muted)" fontSize={10} fontFamily="Noto Sans KR, sans-serif">
        카메라 (센서 {sensorWidth}mm)
      </text>
    </svg>
  )
}

/* 카테고리 표시용 (export not from utils to keep file separation) */
const LENS_CATEGORIES_FOR_DISPLAY = [
  { range: [0, 16] as [number, number],     name: '초광각/어안',  emoji: '🌌', use: '실내·인테리어·드라마틱 풍경·VR',          examples: '시그마 14mm f/1.8 · 캐논 RF 11-24mm' },
  { range: [16, 35] as [number, number],    name: '광각',         emoji: '🏞️', use: '풍경·여행·건축·환경 인물',                examples: '24-70mm f/2.8 · 시그마 24mm f/1.4' },
  { range: [35, 60] as [number, number],    name: '준광각·표준',  emoji: '🚶', use: '스트리트·다큐·일상·환경 인물',           examples: '35mm f/1.4 · 50mm f/1.8 (인생 렌즈)' },
  { range: [60, 105] as [number, number],   name: '단망원·인물',  emoji: '👤', use: '인물·웨딩·제품',                          examples: '85mm f/1.4 · 시그마 85mm Art' },
  { range: [105, 200] as [number, number],  name: '중망원',       emoji: '🎤', use: '인물 압축·실내 스포츠·이벤트',           examples: '70-200mm f/2.8 · 135mm f/1.8' },
  { range: [200, 400] as [number, number],  name: '망원',         emoji: '⚽', use: '야외 스포츠·항공·새 사진',               examples: '300mm f/4 · 100-400mm 줌' },
  { range: [400, 1200] as [number, number], name: '초망원',       emoji: '🦒', use: '야생·달·천체 사진·스포츠 사이드라인',    examples: '600mm f/4 · 시그마 150-600mm' },
]
