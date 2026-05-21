'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './viscosity.module.css'
import {
  SCALES, DENSITY_PRESETS, SAE_GRADES, ISO_VG, FLUID_REFS, OIL_GUIDES,
  convertAll, matchSae, matchIsoVg,
  type Scale,
} from './viscosityData'

const STORAGE_KEY = 'youtil_viscosity_v1'
type TempRef = '40' | '100'

const PRESETS: { label: string; scale: Scale; value: number; temp: TempRef; density?: number }[] = [
  { label: '물',          scale: 'cp',  value: 1.0,    temp: '40',  density: 1.0 },
  { label: '엔진오일 @100°C', scale: 'cst', value: 10,    temp: '100', density: 0.85 },
  { label: '엔진오일 @40°C',  scale: 'cst', value: 90,    temp: '40',  density: 0.87 },
  { label: '유압유 VG 46',  scale: 'cst', value: 46,    temp: '40',  density: 0.87 },
  { label: '꿀',          scale: 'cp',  value: 10000, temp: '40',  density: 1.42 },
  { label: '글리세린',     scale: 'cp',  value: 1400,  temp: '40',  density: 1.26 },
]

export default function ViscosityClient() {
  const [scale, setScale] = useState<Scale>('cst')
  const [input, setInput] = useState('10')
  const [density, setDensity] = useState('0.87')
  const [tempRef, setTempRef] = useState<TempRef>('100')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.scale) setScale(j.scale)
      if (typeof j.input === 'string') setInput(j.input)
      if (typeof j.density === 'string') setDensity(j.density)
      if (j.tempRef) setTempRef(j.tempRef)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale, input, density, tempRef })) } catch {}
  }, [scale, input, density, tempRef])

  const value = parseFloat(input) || 0
  const rho = parseFloat(density) || 1
  const valid = value > 0 && rho > 0

  const result = useMemo(() => valid ? convertAll(scale, value, rho) : null, [valid, scale, value, rho])
  const saeMatches = useMemo(() => result && tempRef === '100' ? matchSae(result.cst) : [], [result, tempRef])
  const isoMatch = useMemo(() => result && tempRef === '40' ? matchIsoVg(result.cst) : null, [result, tempRef])

  const fmt = (n: number, scaleId: Scale): string => {
    if (!isFinite(n) || n <= 0) return '—'
    if (scaleId === 'pas') return n < 0.001 ? n.toExponential(2) : n.toFixed(4)
    if (scaleId === 'sus') return Math.round(n).toLocaleString('en-US')
    if (n < 0.01) return n.toExponential(2)
    if (n < 1) return n.toFixed(3)
    if (n < 100) return n.toFixed(2)
    if (n < 10000) return n.toFixed(1)
    return Math.round(n).toLocaleString('en-US')
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/unit/hardness',  label: '경도 변환기' },
          { href: '/tools/unit/converter', label: '단위 변환기' },
          { href: '/tools/finance/car-cost', label: '자동차 유지비' },
        ]}
      >
        SUS 환산은 ASTM D2161 근사식, SAE J300·ISO 3448은 표준 규격 기반입니다. 점도는 <strong>온도에 매우 민감</strong>해 측정 온도(@40°C·@100°C)가 다르면 직접 비교 불가. cP ↔ cSt 환산에 사용하는 밀도도 시료 온도에 따라 변하므로 ±5% 오차가 흔합니다.
      </Disclaimer>

      {/* 스케일 선택 */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 입력 스케일</span>
        <div className={s.scaleGrid}>
          {SCALES.map((sc) => (
            <button key={sc.id} type="button"
              className={`${s.scaleBtn} ${scale === sc.id ? s.scaleBtnActive : ''}`}
              onClick={() => setScale(sc.id)}>
              <span className={s.scaleName}>{sc.name}</span>
              <span className={s.scaleType}>{sc.type === 'dynamic' ? '절대' : sc.type === 'kinematic' ? '동' : '시간'}</span>
            </button>
          ))}
        </div>
        <p className={s.scaleDesc}>
          <strong className={s.accent}>{SCALES.find(x => x.id === scale)?.fullName}</strong> — {SCALES.find(x => x.id === scale)?.desc}
        </p>
      </div>

      {/* 값 + 밀도 + 온도 */}
      <div className={s.card}>
        <span className={s.cardLabel}>2. 값 · 밀도 · 측정 온도</span>
        <div className={s.inputGrid}>
          <div className={s.inputField}>
            <label className={s.fieldLabel}>점도 값</label>
            <div className={s.inputRow}>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                className={s.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <span className={s.unit}>{SCALES.find(x => x.id === scale)?.unit}</span>
            </div>
          </div>
          <div className={s.inputField}>
            <label className={s.fieldLabel}>밀도 ρ (g/cm³)</label>
            <div className={s.inputRow}>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0.5}
                max={2.0}
                className={s.input}
                value={density}
                onChange={(e) => setDensity(e.target.value)}
              />
              <span className={s.unit}>g/cm³</span>
            </div>
            <div className={s.densityPresets}>
              {DENSITY_PRESETS.map((p) => (
                <button key={p.id} type="button"
                  className={`${s.densityBtn} ${parseFloat(density) === p.rho ? s.densityBtnActive : ''}`}
                  onClick={() => setDensity(String(p.rho))}
                  title={p.temp ?? ''}>
                  {p.label} <small>{p.rho}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={s.tempRow}>
          <span className={s.tempLabel}>측정 온도</span>
          <div className={s.tempToggle}>
            <button type="button"
              className={`${s.tempBtn} ${tempRef === '40' ? s.tempBtnActive : ''}`}
              onClick={() => setTempRef('40')}>
              @ 40°C <small>ISO VG</small>
            </button>
            <button type="button"
              className={`${s.tempBtn} ${tempRef === '100' ? s.tempBtnActive : ''}`}
              onClick={() => setTempRef('100')}>
              @ 100°C <small>SAE J300</small>
            </button>
          </div>
          <span className={s.tempHint}>
            엔진오일 등급은 100°C, 산업용 윤활유는 40°C 기준
          </span>
        </div>

        <div className={s.presetRow}>
          {PRESETS.map((p, i) => (
            <button key={i} type="button"
              className={s.presetBtn}
              onClick={() => {
                setScale(p.scale); setInput(String(p.value)); setTempRef(p.temp)
                if (p.density !== undefined) setDensity(String(p.density))
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {result && valid && (
        <div className={s.resultGrid}>
          {SCALES.map((sc) => {
            const v = result[sc.id]
            const isInput = sc.id === scale
            return (
              <div key={sc.id} className={`${s.resCard} ${isInput ? s.resCardInput : ''}`}>
                <div className={s.resHead}>
                  <span className={s.resName}>{sc.name}</span>
                  {isInput && <span className={s.inputTag}>입력</span>}
                </div>
                <div className={s.resValue}>{fmt(v, sc.id)}</div>
                <div className={s.resFull}>{sc.fullName}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* SAE J300 매칭 */}
      {tempRef === '100' && result && valid && (
        <div className={s.card}>
          <span className={s.cardLabel}>
            🚗 SAE J300 엔진오일 등급 매칭
            <span className={s.cardHint}>{result.cst.toFixed(2)} cSt @100°C 기준</span>
          </span>
          {saeMatches.length > 0 ? (
            <div className={s.saeMatched}>
              {saeMatches.map((g) => (
                <div key={g.grade} className={s.saeChip}>
                  <strong>{g.grade}</strong>
                  <small>{g.minCst}~{g.maxCst} cSt</small>
                  <span className={s.saeHint}>{g.hint}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={s.note}>현재 점도는 SAE J300 등급 범위(4.0~26.1 cSt @100°C)를 벗어났습니다.</p>
          )}
          <div className={s.saeFullList}>
            <p className={s.subLabel}>전체 SAE J300 등급</p>
            <div className={s.saeList}>
              {SAE_GRADES.map((g) => {
                const active = saeMatches.some((m) => m.grade === g.grade)
                return (
                  <div key={g.grade} className={`${s.saeRow} ${active ? s.saeRowActive : ''}`}>
                    <span className={s.saeGrade}>{g.grade}</span>
                    <span className={s.saeRange}>{g.minCst}~{g.maxCst}</span>
                    <span className={s.saeNote}>{g.hint}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ISO VG 매칭 */}
      {tempRef === '40' && result && valid && (
        <div className={s.card}>
          <span className={s.cardLabel}>
            🏭 ISO VG (3448) 산업 윤활유 등급
            <span className={s.cardHint}>{result.cst.toFixed(2)} cSt @40°C 기준</span>
          </span>
          {isoMatch ? (
            <div className={s.isoMatchedCard}>
              <div className={s.isoMatchedNum}>VG {isoMatch.vg}</div>
              <div className={s.isoMatchedRange}>{isoMatch.minCst}~{isoMatch.maxCst} cSt @40°C</div>
              <div className={s.isoMatchedUse}>{isoMatch.use}</div>
            </div>
          ) : (
            <p className={s.note}>현재 점도는 ISO VG 표준 등급 범위(1.98~1650 cSt @40°C) 안에서 정확히 매칭되지 않습니다.</p>
          )}
          <div className={s.isoFullList}>
            <p className={s.subLabel}>전체 ISO VG 등급</p>
            <div className={s.isoList}>
              {ISO_VG.map((v) => {
                const active = isoMatch?.vg === v.vg
                return (
                  <div key={v.vg} className={`${s.isoRow} ${active ? s.isoRowActive : ''}`}>
                    <span className={s.isoVg}>VG {v.vg}</span>
                    <span className={s.isoRange}>{v.minCst}~{v.maxCst} cSt</span>
                    <span className={s.isoUse}>{v.use}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* 자동차 오일 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>🚗 자동차·산업 윤활유 가이드</span>
        <div className={s.oilGrid}>
          {OIL_GUIDES.map((o) => (
            <div key={o.type} className={s.oilCard}>
              <div className={s.oilType}>{o.type}</div>
              <div className={s.oilGrade}>
                {o.sae !== '—' && <span className={s.gradeBadge}>SAE {o.sae}</span>}
                {o.iso && <span className={`${s.gradeBadge} ${s.gradeBadgeIso}`}>ISO {o.iso}</span>}
              </div>
              <p className={s.oilUse}>{o.use}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 일상 유체 참고 */}
      <div className={s.card}>
        <span className={s.cardLabel}>🍯 일상 유체 점도 (참고)</span>
        <div className={s.fluidList}>
          {FLUID_REFS.map((f) => (
            <div key={f.name} className={s.fluidRow}>
              <span className={s.fluidEmoji}>{f.emoji}</span>
              <span className={s.fluidName}>{f.name}</span>
              <span className={s.fluidCp}>{f.cp}</span>
              <span className={s.fluidTemp}>{f.temp ?? ''}</span>
              <span className={s.fluidNote}>{f.note ?? ''}</span>
            </div>
          ))}
        </div>
        <p className={s.note}>
          💡 케첩·땅콩버터·페인트 등은 <strong>비뉴턴 유체</strong>로, 전단속도·압력에 따라 점도가 변하며 단일 cP 값으로 정확히 표현되지 않습니다.
        </p>
      </div>
    </div>
  )
}
