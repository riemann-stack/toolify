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

/* 계산 중 스케일 감을 잡는 로그 사다리 5종 — 값은 FLUID_REFS 단일 소스에서 이름으로 추출.
   전체 11종 목록은 page.tsx 가이드의 정적 표가 담당한다(같은 페이지 중복 노출 방지). */
const ANCHOR_NAMES = ['공기', '물', '식용유 (올리브유)', '글리세린', '꿀']
const FLUID_ANCHORS = ANCHOR_NAMES
  .map((n) => FLUID_REFS.find((f) => f.name === n))
  .filter((f): f is (typeof FLUID_REFS)[number] => Boolean(f))

// temp 미지정 프리셋(꿀 @20°C)은 측정온도 토글을 건드리지 않는다 — 20°C 값에 @40/@100 라벨이 붙는 부정합 방지
const PRESETS: { label: string; scale: Scale; value: number; temp?: TempRef; density?: number }[] = [
  { label: '물 @40°C',        scale: 'cp',  value: 0.65,  temp: '40',  density: 0.99 },
  { label: '엔진오일 @100°C', scale: 'cst', value: 10,    temp: '100', density: 0.85 },
  { label: '엔진오일 @40°C',  scale: 'cst', value: 90,    temp: '40',  density: 0.87 },
  { label: '유압유 VG 46',  scale: 'cst', value: 46,    temp: '40',  density: 0.87 },
  { label: '꿀 @20°C',       scale: 'cp',  value: 10000, density: 1.42 },
  { label: '글리세린 @40°C',  scale: 'cp',  value: 284,   temp: '40',  density: 1.25 },
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
      const j = JSON.parse(raw) as { scale?: unknown; input?: unknown; density?: unknown; tempRef?: unknown }
      // enum 검증 필수 — 오염된 scale/tempRef면 활성 버튼·단위·SAE/ISO 카드가 전부 사라지는 고장 상태
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (typeof j.scale === 'string' && SCALES.some((sc) => sc.id === j.scale)) setScale(j.scale as Scale)
      if (typeof j.input === 'string' && j.input.length <= 12) setInput(j.input)
      if (typeof j.density === 'string' && j.density.length <= 8) setDensity(j.density)
      if (j.tempRef === '40' || j.tempRef === '100') setTempRef(j.tempRef)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale, input, density, tempRef })) } catch {}
  }, [scale, input, density, tempRef])

  const value = parseFloat(input) || 0
  // `|| 1` 금지 — 밀도 0 입력이 조용히 1.0으로 대체되어 10 cSt·ρ0 → 10 cP처럼 정상 계산되는 버그
  const rhoParsed = parseFloat(density)
  const rho = Number.isFinite(rhoParsed) ? rhoParsed : 0
  // SUS는 32.0초(=1.81 cSt)부터 정의 (ASTM D2161 측정 하한) — 미만 입력은 환산 불가로 안내
  const susBelowRange = scale === 'sus' && value > 0 && value < 32
  // 일반 액체 밀도 범위 밖이면 계산은 유지하되 경고 (입력↔계산 불일치 방지)
  const rhoOutOfRange = rho > 0 && (rho < 0.5 || rho > 2.0)
  const valid = value > 0 && rho > 0 && !susBelowRange

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
        sources={[
          { label: 'ASTM D2161 — Saybolt 점도 환산 표준', href: 'https://www.astm.org/d2161-19.html' },
          { label: 'SAE J300 — 엔진오일 점도 분류 (현행 202405)', href: 'https://www.sae.org/standards/content/j300_202405/' },
        ]}
      >
        SUS 환산은 ASTM D2161 공식 계산식(100°F 기준), SAE J300·ISO 3448은 표준 규격 기반입니다. 점도는 <strong>온도에 매우 민감</strong>해 측정 온도(@40°C·@100°C)가 다르면 직접 비교 불가. cP ↔ cSt 환산에 사용하는 밀도도 시료 온도에 따라 변하므로 ±5% 오차가 흔합니다.
      </Disclaimer>

      {/* 스케일 선택 */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 입력 스케일</span>
        <div className={s.scaleGrid}>
          {SCALES.map((sc) => (
            <button key={sc.id} type="button"
              aria-pressed={scale === sc.id}
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
            <label className={s.fieldLabel} htmlFor="viscosity-f1">점도 값</label>
            <div className={s.inputRow}>
              <input id="viscosity-f1"
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
            <label className={s.fieldLabel} htmlFor="viscosity-cm">밀도 ρ (g/cm³)</label>
            <div className={s.inputRow}>
              <input id="viscosity-cm"
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
                  aria-pressed={parseFloat(density) === p.rho}
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
              aria-pressed={tempRef === '40'}
              className={`${s.tempBtn} ${tempRef === '40' ? s.tempBtnActive : ''}`}
              onClick={() => setTempRef('40')}>
              @ 40°C <small>ISO VG</small>
            </button>
            <button type="button"
              aria-pressed={tempRef === '100'}
              className={`${s.tempBtn} ${tempRef === '100' ? s.tempBtnActive : ''}`}
              onClick={() => setTempRef('100')}>
              @ 100°C <small>SAE J300</small>
            </button>
          </div>
          <span className={s.tempHint}>
            엔진오일 등급은 100°C, 산업용 윤활유는 40°C 기준
          </span>
        </div>

        {susBelowRange && (
          <p className={s.warnNote}>
            ⚠️ SUS는 <strong>32.0초부터 정의</strong>됩니다(ASTM D2161 측정 하한 = 1.81 cSt). 32 미만 값은 환산할 수 없습니다.
          </p>
        )}
        {rhoOutOfRange && (
          <p className={s.warnNote}>
            ⚠️ 밀도가 일반 액체 범위(0.5~2.0 g/cm³)를 벗어났습니다 — 입력값 그대로 계산하지만 cP↔cSt 결과를 확인하세요.
          </p>
        )}

        <div className={s.presetRow}>
          {PRESETS.map((p, i) => (
            <button key={i} type="button"
              className={s.presetBtn}
              onClick={() => {
                setScale(p.scale); setInput(String(p.value))
                if (p.temp) setTempRef(p.temp)
                if (p.density !== undefined) setDensity(String(p.density))
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {result && valid ? (
        <div role="status">
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
          {!isFinite(result.sus) && (
            <p className={s.note}>
              ⓘ SUS는 1.81 cSt(= 32.0초) 미만에서 정의되지 않아(ASTM D2161 측정 하한) &lsquo;—&rsquo;로 표시합니다.
            </p>
          )}
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.note} style={{ margin: 0 }}>
            {susBelowRange
              ? 'SUS 32 이상 값을 입력하면 cP·cSt·Pa·s로 환산합니다.'
              : '0보다 큰 점도 값과 밀도를 입력하면 cP·cSt·SUS·Pa·s 4개 단위로 동시 환산합니다.'}
          </p>
        </div>
      )}

      {/* SAE J300 매칭 */}
      {tempRef === '100' && result && valid && (
        <div className={s.card}>
          <span className={s.cardLabel}>
            SAE J300 엔진오일 등급 매칭
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
          <p className={s.note}>
            ⓘ 100°C 동점도로는 <strong>뒤 숫자(고온 등급)</strong>만 판정할 수 있습니다 — 앞의 0W·5W(저온 W 등급)는 CCS·MRV 저온 시험으로 별도 결정되므로 &lsquo;xW-&rsquo;로 표기합니다.
          </p>
        </div>
      )}

      {/* ISO VG 매칭 */}
      {tempRef === '40' && result && valid && (
        <div className={s.card}>
          <span className={s.cardLabel}>
            ISO VG (3448) 산업 윤활유 등급
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
          <p className={s.note}>
            ⓘ ISO 3448은 <strong>40°C 동점도 분류 체계</strong>일 뿐이고, 표의 용도는 일반 관행 예시입니다. 실제 등급 선택은 장비 제조사 지정·운전 온도·펌프 조건이 우선입니다.
          </p>
        </div>
      )}

      {/* 자동차 오일 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>자동차·산업 윤활유 가이드</span>
        <div className={s.oilGrid}>
          {OIL_GUIDES.map((o) => (
            <div key={o.type} className={s.oilCard}>
              <div className={s.oilType}>{o.type}</div>
              <div className={s.oilGrade}>
                {o.sae !== '—' && <span className={s.gradeBadge}>{o.sae}</span>}
                {o.iso && <span className={`${s.gradeBadge} ${s.gradeBadgeIso}`}>ISO {o.iso}</span>}
              </div>
              <p className={s.oilUse}>{o.use}</p>
            </div>
          ))}
        </div>
        <p className={s.note}>
          💡 기어유 75W-90·80W-90·85W-140은 <strong>SAE J306(기어유 점도 분류)</strong> 등급으로, 엔진오일 SAE J300 숫자와 직접 비교할 수 없습니다(기어유 90등급 ≈ 엔진오일 40~50 상당). 위 J300 매칭에 기어유 점도를 넣으면 엔진 등급으로 잘못 매칭됩니다.
        </p>
      </div>

      {/* 스케일 감 잡기 — 전체 목록은 아래 가이드의 '일상 유체 점도 한눈에' 표로 위임(중복 노출 방지) */}
      <div className={s.card}>
        <span className={s.cardLabel}>스케일 감 잡기</span>
        <div className={s.fluidList}>
          {FLUID_ANCHORS.map((f) => (
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
          💡 공기(0.018 cP)에서 꿀(~10,000 cP)까지 약 <strong>55만 배</strong> 차이입니다. 케첩·땅콩버터처럼 전단속도에 따라 점도가 변하는 <strong>비뉴턴 유체</strong>를 포함한 전체 목록은 아래 <strong>일상 유체 점도 한눈에</strong> 표에 있습니다.
        </p>
      </div>
    </div>
  )
}
