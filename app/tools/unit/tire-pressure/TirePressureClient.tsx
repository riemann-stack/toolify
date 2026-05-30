'use client'

import { useMemo, useState } from 'react'
import styles from './tire-pressure.module.css'

// ──────────────────────────────────────
// 변환 상수 (1 psi 기준)
// ──────────────────────────────────────
const PSI_TO = {
  kPa: 6.89476,
  bar: 0.0689476,
  kgf: 0.0703069,
}

type PressureUnit = 'psi' | 'kPa' | 'bar' | 'kgf'

const UNIT_META: { id: PressureUnit; label: string; sub: string }[] = [
  { id: 'psi', label: 'psi',     sub: '미국·한국 (운전자 일반)' },
  { id: 'kPa', label: 'kPa',     sub: '한국 차량 표기' },
  { id: 'bar', label: 'bar',     sub: '유럽' },
  { id: 'kgf', label: 'kgf/cm²', sub: '일본·과거 한국' },
]

const PRESETS: { label: string; value: number; unit: PressureUnit }[] = [
  { label: '30 psi',   value: 30,  unit: 'psi' },
  { label: '33 psi',   value: 33,  unit: 'psi' },
  { label: '35 psi',   value: 35,  unit: 'psi' },
  { label: '100 kPa',  value: 100, unit: 'kPa' },
  { label: '200 kPa',  value: 200, unit: 'kPa' },
  { label: '2.0 bar',  value: 2.0, unit: 'bar' },
  { label: '2.3 bar',  value: 2.3, unit: 'bar' },
]

// ──────────────────────────────────────
// 변환 함수
// ──────────────────────────────────────
function toPsi(value: number, from: PressureUnit): number {
  if (value <= 0) return 0
  if (from === 'psi') return value
  if (from === 'kPa') return value / PSI_TO.kPa
  if (from === 'bar') return value / PSI_TO.bar
  if (from === 'kgf') return value / PSI_TO.kgf
  return value
}

function fromPsi(psi: number, to: PressureUnit): number {
  if (psi <= 0) return 0
  if (to === 'psi') return psi
  if (to === 'kPa') return psi * PSI_TO.kPa
  if (to === 'bar') return psi * PSI_TO.bar
  if (to === 'kgf') return psi * PSI_TO.kgf
  return psi
}

function formatNumber(n: number, digits: number = 2): string {
  if (!isFinite(n)) return '0'
  const abs = Math.abs(n)
  if (abs === 0) return '0'
  if (abs >= 100) return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (abs >= 10)  return n.toLocaleString('en-US', { maximumFractionDigits: digits })
  if (abs >= 1)   return n.toLocaleString('en-US', { maximumFractionDigits: digits })
  return n.toLocaleString('en-US', { maximumFractionDigits: 4 })
}

function formatSigned(n: number, digits: number = 1): string {
  const sign = n > 0 ? '+' : ''
  return sign + formatNumber(n, digits)
}

// ──────────────────────────────────────
// Component
// ──────────────────────────────────────
type MainTab = 'convert' | 'check' | 'size' | 'wear'

export default function TirePressureClient() {
  const [tab, setTab] = useState<MainTab>('convert')

  const TABS: { id: MainTab; label: string }[] = [
    { id: 'convert', label: '🛞 단위 변환' },
    { id: 'check',   label: '✅ 공기압 체크' },
    { id: 'size',    label: '📐 규격 해석' },
    { id: 'wear',    label: '🔧 교체·마모' },
  ]

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'convert' && <ConvertTab />}
      {tab === 'check' && <CheckTab />}
      {tab === 'size' && <SizeTab />}
      {tab === 'wear' && <WearTab />}
    </div>
  )
}

// ──────────────────────────────────────
// 탭 1 — 단위 변환
// ──────────────────────────────────────
function ConvertTab() {
  const [value, setValue] = useState<string>('33')
  const [unit, setUnit] = useState<PressureUnit>('psi')
  const [copied, setCopied] = useState<PressureUnit | null>(null)

  const numValue = parseFloat(value) || 0
  const basePsi = useMemo(() => toPsi(numValue, unit), [numValue, unit])

  const results = useMemo(() => {
    return UNIT_META.map(m => ({
      ...m,
      value: fromPsi(basePsi, m.id),
    }))
  }, [basePsi])

  function handleCopy(u: PressureUnit, val: number) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatNumber(val).replace(/,/g, ''))
      setCopied(u)
      setTimeout(() => setCopied(null), 1200)
    }
  }

  function applyPreset(p: typeof PRESETS[number]) {
    setValue(p.value.toString())
    setUnit(p.unit)
  }

  const currentLabel = UNIT_META.find(m => m.id === unit)?.label ?? ''

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>공기압 입력</span>

        <div className={styles.inputRow}>
          <input
            type="number"
            className={`${styles.input} ${value && numValue > 0 ? styles.inputFilled : ''}`}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="33"
            step="any"
          />
          <select
            className={styles.unitSelect}
            value={unit}
            onChange={e => setUnit(e.target.value as PressureUnit)}
          >
            {UNIT_META.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.presetRow}>
          {PRESETS.map((p, i) => (
            <button key={i} className={styles.presetBtn} onClick={() => applyPreset(p)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultHeaderLabel}>입력값</div>
          <div className={styles.resultHeaderValue}>
            {formatNumber(numValue)} {currentLabel}
          </div>
        </div>
        {results.map(r => {
          const isSelf = r.id === unit
          return (
            <div key={r.id} className={`${styles.resultRow} ${isSelf ? styles.resultRowHighlight : ''}`}>
              <div>
                <div className={styles.resultLabel}>{r.label}</div>
                <div className={styles.resultLabelSub}>{r.sub}</div>
              </div>
              <div className={`${styles.resultValue} ${isSelf ? styles.resultValueSelf : ''}`}>
                {formatNumber(r.value)}
              </div>
              <button
                className={`${styles.copyBtn} ${copied === r.id ? styles.copyBtnDone : ''}`}
                onClick={() => handleCopy(r.id, r.value)}
              >
                {copied === r.id ? '✓' : '복사'}
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 탭 2 — 권장 공기압 체크
// ──────────────────────────────────────
type Vehicle = 'car' | 'road' | 'mtb' | 'moto'

const VEHICLES: { id: Vehicle; label: string; defaultPsi: number }[] = [
  { id: 'car',  label: '🚗 자동차',         defaultPsi: 33 },
  { id: 'road', label: '🚴 자전거 (로드)',  defaultPsi: 100 },
  { id: 'mtb',  label: '🚵 자전거 (MTB)',   defaultPsi: 35 },
  { id: 'moto', label: '🏍️ 오토바이',       defaultPsi: 36 },
]

type Status = 'ok' | 'warnLow' | 'alertLow' | 'warnHigh' | 'alertHigh'

function judge(diffPsi: number): { status: Status; title: string; desc: string } {
  if (diffPsi >= -2 && diffPsi <= 2) {
    return { status: 'ok', title: '✅ 적정 공기압', desc: '권장값 ±2 psi 이내. 그대로 운행해도 안전합니다.' }
  }
  if (diffPsi < -5) {
    return { status: 'alertLow', title: '🚨 공기압 부족', desc: '5 psi 이상 부족. 즉시 보충 필요. 펑크·연비 저하·측면 마모 위험이 큽니다.' }
  }
  if (diffPsi < 0) {
    return { status: 'warnLow', title: '🔶 약간 부족', desc: '권장보다 3~5 psi 낮음. 가까운 시일 내 보충하세요.' }
  }
  if (diffPsi > 5) {
    return { status: 'alertHigh', title: '🚨 공기압 과다', desc: '5 psi 이상 초과. 빼주세요. 중앙 마모·승차감 저하·제동 거리 증가.' }
  }
  return { status: 'warnHigh', title: '🔶 약간 과다', desc: '권장보다 3~5 psi 높음. 적정 수준으로 빼주는 것이 좋습니다.' }
}

function statusClass(s: Status): string {
  if (s === 'ok') return styles.statusOk
  if (s === 'warnLow' || s === 'warnHigh') return styles.statusWarn
  return styles.statusAlert
}

function CheckTab() {
  const [vehicle, setVehicle] = useState<Vehicle>('car')
  const [recPsi, setRecPsi] = useState<string>('33')
  const [curPsi, setCurPsi] = useState<string>('30')

  const recommended = parseFloat(recPsi) || 0
  const current = parseFloat(curPsi) || 0
  const diffPsi = current - recommended
  const diffKpaSigned = diffPsi * PSI_TO.kPa
  const diffBarSigned = diffPsi * PSI_TO.bar

  const result = judge(diffPsi)

  function pickVehicle(v: Vehicle) {
    setVehicle(v)
    const def = VEHICLES.find(x => x.id === v)?.defaultPsi
    if (def) setRecPsi(def.toString())
  }

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>차량 종류</span>
        <div className={styles.vehicleGrid}>
          {VEHICLES.map(v => (
            <button
              key={v.id}
              className={`${styles.vehicleBtn} ${vehicle === v.id ? styles.vehicleBtnActive : ''}`}
              onClick={() => pickVehicle(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className={styles.dualInput}>
          <div className={styles.dualCell}>
            <div className={styles.dualLabel}>권장 공기압 (매뉴얼 기준)</div>
            <div className={styles.dualInputBox}>
              <input
                type="number"
                className={styles.dualField}
                value={recPsi}
                onChange={e => setRecPsi(e.target.value)}
                placeholder="33"
                step="0.5"
              />
              <span className={styles.dualUnit}>psi</span>
            </div>
          </div>
          <div className={styles.dualCell}>
            <div className={styles.dualLabel}>현재 측정 공기압</div>
            <div className={styles.dualInputBox}>
              <input
                type="number"
                className={styles.dualField}
                value={curPsi}
                onChange={e => setCurPsi(e.target.value)}
                placeholder="30"
                step="0.5"
              />
              <span className={styles.dualUnit}>psi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 판정 */}
      <div className={`${styles.statusCard} ${statusClass(result.status)}`}>
        <div className={styles.statusTitle}>{result.title}</div>
        <div className={styles.statusDesc}>{result.desc}</div>
        <div className={styles.statusDiff}>
          <div className={styles.statusDiffItem}>
            <span className={styles.statusDiffLabel}>차이 (psi)</span>
            <span className={styles.statusDiffValue}>{formatSigned(diffPsi, 1)}</span>
          </div>
          <div className={styles.statusDiffItem}>
            <span className={styles.statusDiffLabel}>차이 (kPa)</span>
            <span className={styles.statusDiffValue}>{formatSigned(diffKpaSigned, 1)}</span>
          </div>
          <div className={styles.statusDiffItem}>
            <span className={styles.statusDiffLabel}>차이 (bar)</span>
            <span className={styles.statusDiffValue}>{formatSigned(diffBarSigned, 2)}</span>
          </div>
        </div>
      </div>

      {/* 영향 안내 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>공기압 부족·과다의 영향</span>
        <div className={styles.impactGrid}>
          <div className={styles.impactCell}>
            <p className={`${styles.impactTitle} ${styles.impactTitleLow}`}>🔻 부족 시</p>
            <ul className={styles.impactList}>
              <li>• 연비 저하 (10% 부족 시 <strong>약 3% 감소</strong>)</li>
              <li>• <strong>타이어 측면 마모</strong> 가속</li>
              <li>• 펑크·블로아웃(파열) 위험 증가</li>
              <li>• 핸들 무거움, 코너링 불안정</li>
            </ul>
          </div>
          <div className={styles.impactCell}>
            <p className={`${styles.impactTitle} ${styles.impactTitleHigh}`}>🔺 과다 시</p>
            <ul className={styles.impactList}>
              <li>• 승차감 저하 (노면 충격 직접 전달)</li>
              <li>• <strong>타이어 중앙 마모</strong> 가속</li>
              <li>• 접지력 저하 → <strong>제동 거리 증가</strong></li>
              <li>• 펑크 시 측면 손상 가능성↑</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 권장 공기압 참조표 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>일반 권장 공기압 참조</span>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.refTable}>
            <thead>
              <tr>
                <th>차종</th>
                <th>psi</th>
                <th>kPa</th>
              </tr>
            </thead>
            <tbody>
              {[
                { c: '경차',         p: '31~33', k: '213~228' },
                { c: '소형 세단',    p: '32~35', k: '220~241' },
                { c: '중형 세단',    p: '33~35', k: '228~241' },
                { c: 'SUV',         p: '33~36', k: '228~248' },
                { c: '로드바이크',   p: '90~120',k: '620~830' },
                { c: 'MTB',         p: '25~50', k: '170~340' },
                { c: '오토바이',     p: '32~42', k: '220~290' },
              ].map((r, i) => (
                <tr key={i}>
                  <td className={styles.refLabel}>{r.c}</td>
                  <td className={styles.refValue}>{r.p}</td>
                  <td>{r.k}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px', opacity: 0.8 }}>
          ⚠️ 정확한 권장 공기압은 차량 운전석 도어 안쪽 스티커 또는 매뉴얼을 우선 참조하세요.
        </p>
      </div>

      {/* 탑승인원·적재 보정 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>탑승인원·적재별 공기압 보정</span>
        <ul className={styles.seasonList}>
          <li>• <strong>1~3명 일상 주행</strong>: 도어 스티커의 표준(기본) 공기압 그대로</li>
          <li>• <strong>5인 만차·트렁크 가득·고속 장거리</strong>: 후륜 위주 <strong>+2~4 psi</strong> (스티커의 &lsquo;만차/고하중(full load)&rsquo; 칸 참조)</li>
          <li>• <strong>짐 많은 SUV·승합·캠핑</strong>: 제조사 만차 기준까지 상향, 후륜을 전륜보다 높게</li>
          <li>• 도어 스티커에 <strong>전륜/후륜·표준/만차</strong>가 따로 적혀 있으면 그 값을 우선</li>
        </ul>
      </div>

      {/* 냉간/온간 + 계절 보정 */}
      <div className={styles.seasonBox}>
        <p className={styles.seasonTitle}>🌡️ 냉간·온간 & 계절별 보정 가이드</p>
        <ul className={styles.seasonList}>
          <li>• 측정은 <strong>주행 전 “냉간(cold)” 상태</strong>에서 — 주행 후에는 마찰열로 <strong>+3~4 psi</strong> 더 높게 측정됩니다(2~3시간 주차 후 권장).</li>
          <li>• <strong>기온 10°C 변화 시 공기압 약 1~2 psi(≈ 7~14 kPa) 변동</strong></li>
          <li>• <strong>겨울 (기온 ↓ → 공기압 ↓)</strong>: 여름→겨울(예 30°C→0°C) 약 3 psi 자연 감소 → 보충 필요</li>
          <li>• <strong>여름 (기온 ↑ → 공기압 ↑)</strong>: 겨울→여름(예 0°C→30°C) 약 3 psi 자연 증가</li>
          <li>• 한 달에 1~2번 정기 점검 권장 (자연 누설로 월 1~2 psi 감소)</li>
        </ul>
      </div>

      {/* TPMS 경고등 기준 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>🚨 TPMS 경고등 점등 기준</span>
        <ul className={styles.seasonList}>
          <li>• TPMS(타이어 공기압 경고장치)는 보통 <strong>권장값의 약 25% 이하(≈ −25%)</strong>로 떨어지면 점등됩니다.</li>
          <li>• 예: 권장 33 psi → 약 <strong>25 psi</strong> 부근에서 경고등 ON</li>
          <li>• 경고등이 켜지면 안전한 곳에 정차 후 즉시 공기압 점검·보충</li>
          <li>• 보충해도 다시 켜지면 <strong>펑크·휠 림 손상·센서 고장</strong> 의심 → 정비소 점검</li>
          <li>• 겨울철 기온 급강하 시 일시 점등될 수 있음(적정값 보충하면 해제)</li>
        </ul>
      </div>
    </>
  )
}

// ──────────────────────────────────────
// 탭 3 — 규격 해석 / 인치업
// ──────────────────────────────────────
interface TireSize { width: number; aspect: number; wheel: number }

function parseTireSize(input: string): TireSize | null {
  const m = input.replace(/\s/g, '').toUpperCase().match(/^(\d{3})\/(\d{2})Z?R?(\d{2}(?:\.\d)?)$/)
  if (!m) return null
  const width = parseInt(m[1], 10)
  const aspect = parseInt(m[2], 10)
  const wheel = parseFloat(m[3])
  if (width < 100 || width > 405 || aspect < 20 || aspect > 90 || wheel < 8 || wheel > 26) return null
  return { width, aspect, wheel }
}
function sidewallMm(s: TireSize): number { return (s.width * s.aspect) / 100 }
function outerDiaMm(s: TireSize): number { return s.wheel * 25.4 + 2 * sidewallMm(s) }
function sizeLabel(s: TireSize): string { return `${s.width}/${s.aspect}R${s.wheel}` }

function inchUpOptions(base: TireSize): { size: TireSize; outer: number; diff: number }[] {
  const baseOuter = outerDiaMm(base)
  const seen = new Set<string>()
  const out: { size: TireSize; outer: number; diff: number }[] = []
  for (const dw of [1, 2]) {
    const wheel = base.wheel + dw
    for (const widthDelta of [0, 10, 20, 30]) {
      const width = base.width + widthDelta
      if (width > 355) continue
      const ideal = ((baseOuter - wheel * 25.4) / (2 * width)) * 100
      const aspect = Math.round(ideal / 5) * 5
      if (aspect < 25 || aspect > 70) continue
      const size: TireSize = { width, aspect, wheel }
      const key = sizeLabel(size)
      if (seen.has(key)) continue
      seen.add(key)
      const outer = outerDiaMm(size)
      const diff = ((outer - baseOuter) / baseOuter) * 100
      if (Math.abs(diff) <= 3) out.push({ size, outer, diff })
    }
  }
  return out.sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff)).slice(0, 6)
}

function SizeTab() {
  const [input, setInput] = useState('205/55R16')
  const [compare, setCompare] = useState('')
  const base = useMemo(() => parseTireSize(input), [input])
  const cmp = useMemo(() => parseTireSize(compare), [compare])

  const baseOuter = base ? outerDiaMm(base) : 0
  const cmpOuter = cmp ? outerDiaMm(cmp) : 0
  const diffPct = base && cmp ? ((cmpOuter - baseOuter) / baseOuter) * 100 : 0
  const ratio = base && cmp && baseOuter > 0 ? cmpOuter / baseOuter : 1
  const realAt100 = base && cmp ? 100 * ratio : 0
  // 외경 변화의 파생 영향 (계기판/계기는 원래 외경 기준으로 회전수를 환산하므로)
  // 속도·주행거리는 ratio 비례(= 외경차이%), 표시 연비·엔진 회전수는 1/ratio 비례
  const fuelDevPct = (1 / ratio - 1) * 100
  const rideMm = (cmpOuter - baseOuter) / 2   // 지상고(차고) = 반경 변화
  const options = base ? inchUpOptions(base) : []

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>타이어 규격 입력 (예: 205/55R16)</span>
        <input
          className={`${styles.input} ${base ? styles.inputFilled : ''}`}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="205/55R16"
        />
        <div className={styles.presetRow}>
          {['205/55R16', '225/45R17', '235/55R18', '195/65R15', '245/40R19'].map(p => (
            <button key={p} className={styles.presetBtn} onClick={() => setInput(p)}>{p}</button>
          ))}
        </div>
      </div>

      {base ? (
        <>
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <div className={styles.resultHeaderLabel}>{sizeLabel(base)} 해석</div>
              <div className={styles.resultHeaderValue}>외경 {outerDiaMm(base).toFixed(0)} mm</div>
            </div>
            {[
              { l: '단면폭 (트레드 폭)', v: `${base.width} mm` },
              { l: '편평비 (높이÷폭)', v: `${base.aspect} %` },
              { l: '사이드월 높이', v: `${sidewallMm(base).toFixed(1)} mm` },
              { l: '휠(림) 지름', v: `${base.wheel}″ (${(base.wheel * 25.4).toFixed(0)} mm)` },
              { l: '타이어 외경', v: `${outerDiaMm(base).toFixed(1)} mm (${(outerDiaMm(base) / 10).toFixed(1)} cm)` },
              { l: '1회전 거리(둘레)', v: `${((Math.PI * outerDiaMm(base)) / 1000).toFixed(3)} m` },
            ].map((r, i) => (
              <div key={i} className={styles.resultRow}>
                <div><div className={styles.resultLabel}>{r.l}</div></div>
                <div className={styles.resultValue}>{r.v}</div>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>교체 사이즈 비교 (외경 차이 → 속도계 오차)</span>
            <input
              className={`${styles.input} ${cmp ? styles.inputFilled : ''}`}
              value={compare}
              onChange={e => setCompare(e.target.value)}
              placeholder="비교할 사이즈 (예: 215/50R17)"
            />
            {cmp && (
              <>
                <div className={`${styles.statusCard} ${Math.abs(diffPct) <= 3 ? styles.statusOk : styles.statusWarn}`} style={{ marginTop: 12 }}>
                  <div className={styles.statusTitle}>
                    외경 차이 {formatSigned(diffPct, 1)}% {Math.abs(diffPct) <= 3 ? '✅ 호환 권장 범위' : '⚠️ 3% 초과 — 비권장'}
                  </div>
                  <div className={styles.statusDesc}>
                    계기판 <strong>100 km/h</strong>일 때 실제 약 <strong>{realAt100.toFixed(1)} km/h</strong>
                    {diffPct > 0.05 ? ' (실제가 더 빠름)' : diffPct < -0.05 ? ' (실제가 더 느림)' : ''}.
                    외경 차이는 ±3% 이내를 권장합니다.
                  </div>
                </div>

                {/* 속도 구간별 — 계기판 표시 → 실제 속도 */}
                <div style={{ overflowX: 'auto', marginTop: 12 }}>
                  <table className={styles.refTable}>
                    <thead><tr><th>계기판 표시</th><th>실제 속도</th></tr></thead>
                    <tbody>
                      {[40, 60, 80, 100, 120].map(v => (
                        <tr key={v}>
                          <td>{v} km/h</td>
                          <td className={styles.refValue}>{(v * ratio).toFixed(1)} km/h</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 외경 변화의 추가 영향 */}
                <div className={styles.resultCard} style={{ marginTop: 12 }}>
                  <div className={styles.resultRow}>
                    <div><div className={styles.resultLabel}>주행거리계 오차</div></div>
                    <div className={styles.resultValue}>
                      {Math.abs(diffPct) < 0.1 ? '거의 없음' : `${formatSigned(diffPct, 1)}% (실제가 더 ${diffPct > 0 ? '김' : '짧음'})`}
                    </div>
                  </div>
                  <div className={styles.resultRow}>
                    <div><div className={styles.resultLabel}>연비 표시 오차</div></div>
                    <div className={styles.resultValue}>
                      {Math.abs(fuelDevPct) < 0.1 ? '거의 없음' : `${formatSigned(fuelDevPct, 1)}% (실제가 더 ${fuelDevPct < 0 ? '좋음' : '나쁨'})`}
                    </div>
                  </div>
                  <div className={styles.resultRow}>
                    <div><div className={styles.resultLabel}>지상고(차고) 변화</div></div>
                    <div className={styles.resultValue}>{formatSigned(rideMm, 1)} mm</div>
                  </div>
                  <div className={styles.resultRow}>
                    <div><div className={styles.resultLabel}>엔진 회전수(RPM)</div></div>
                    <div className={styles.resultValue}>
                      {Math.abs(fuelDevPct) < 0.1 ? '거의 없음' : `같은 속도에서 ${formatSigned(fuelDevPct, 1)}%`}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8, opacity: 0.85 }}>
                  외경이 커지면 계기판·주행기록계는 실제보다 <strong>적게</strong> 표시되고(표시 연비는 실제보다 낮게 나와 실제 연비는 더 좋음), 지상고는 올라가며 같은 속도에서 엔진 회전수는 낮아집니다. 양산차 계기판은 보통 안전을 위해 실제보다 약간 높게 표시됩니다.
                </p>
              </>
            )}
          </div>

          <div className={styles.card}>
            <span className={styles.cardLabel}>인치업 조합 (외경 ±3% 유지)</span>
            {options.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className={styles.refTable}>
                  <thead><tr><th>사이즈</th><th>휠</th><th>외경</th><th>차이</th></tr></thead>
                  <tbody>
                    {options.map((o, i) => (
                      <tr key={i}>
                        <td className={styles.refValue}>{sizeLabel(o.size)}</td>
                        <td>{o.size.wheel}″</td>
                        <td>{o.outer.toFixed(0)}mm</td>
                        <td className={styles.refLabel}>{formatSigned(o.diff, 1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p style={{ fontSize: 12, color: 'var(--muted)' }}>유효한 인치업 조합을 찾지 못했습니다.</p>}
            <p style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 10, opacity: 0.85 }}>
              ⚠️ 인치업은 휠 지름을 키우고 편평비를 낮춰 외경을 유지하는 조합입니다. 실제 장착은 휠 폭·옵셋(ET)·펜더 간섭·하중지수(LI)·속도기호를 함께 확인하고 전문점 상담을 권장합니다.
            </p>
          </div>
        </>
      ) : (
        <div className={styles.card}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>형식에 맞게 입력하세요 — 예: <strong>205/55R16</strong> (단면폭/편평비R휠인치)</p>
        </div>
      )}
    </>
  )
}

// ──────────────────────────────────────
// 탭 4 — 교체·마모 (트레드 / 주행·연식 / DOT)
// ──────────────────────────────────────
function treadJudge(mm: number): { status: Status; title: string; desc: string } {
  if (mm >= 7) return { status: 'ok', title: '✅ 신품 수준', desc: '트레드가 충분합니다. 정기 점검만 유지하세요.' }
  if (mm >= 4) return { status: 'ok', title: '🟢 양호', desc: '아직 여유가 있습니다. 4mm 이하부터 빗길 제동력이 떨어지기 시작합니다.' }
  if (mm > 1.6) return { status: 'warnLow', title: '🔶 교체 준비', desc: '3mm 부근부터 교체를 준비하세요. 빗길 수막현상 위험이 커집니다.' }
  return { status: 'alertLow', title: '🚨 마모 한계 — 즉시 교체', desc: '법정 마모한계 1.6mm 이하입니다. 즉시 교체하세요(미달 시 정비불량).' }
}

function WearTab() {
  const [tread, setTread] = useState('5')
  const [km, setKm] = useState('40000')
  const [years, setYears] = useState('4')
  const [dot, setDot] = useState('2419')

  const treadMm = parseFloat(tread) || 0
  const tj = treadJudge(treadMm)
  const kmN = parseFloat(km) || 0
  const yrN = parseFloat(years) || 0
  const nowYear = new Date().getFullYear()

  const dotDigits = dot.replace(/\D/g, '').slice(-4)
  let dotInfo: { week: number; year: number; age: number } | null = null
  if (dotDigits.length === 4) {
    const week = parseInt(dotDigits.slice(0, 2), 10)
    const year = 2000 + parseInt(dotDigits.slice(2), 10)
    if (week >= 1 && week <= 53) dotInfo = { week, year, age: Math.max(0, nowYear - year) }
  }

  const kmStatus = kmN >= 50000 ? '교체 권장 (5만 km 초과)' : kmN >= 30000 ? '점검 강화' : '양호'
  const ageStatus = yrN >= 6 ? '교체 권장 (6년 경과)' : yrN >= 4 ? '점검 강화' : '양호'

  return (
    <>
      <div className={styles.card}>
        <span className={styles.cardLabel}>트레드(홈) 깊이</span>
        <div className={styles.dualInputBox}>
          <input type="number" className={styles.dualField} value={tread} onChange={e => setTread(e.target.value)} step="0.5" placeholder="5" />
          <span className={styles.dualUnit}>mm</span>
        </div>
      </div>
      <div className={`${styles.statusCard} ${statusClass(tj.status)}`}>
        <div className={styles.statusTitle}>{tj.title}</div>
        <div className={styles.statusDesc}>{tj.desc}</div>
      </div>
      <div className={styles.seasonBox}>
        <p className={styles.seasonTitle}>🪙 트레드 깊이 간단 측정 (한국 100원 동전)</p>
        <ul className={styles.seasonList}>
          <li>• 100원 동전을 홈에 거꾸로 꽂아 <strong>이순신 장군의 상투(감투)</strong>가 보이면 약 2.5mm 이하 — 교체 시기입니다.</li>
          <li>• 타이어 홈 안의 <strong>△ 마모 한계 표시(1.6mm)</strong>가 트레드 면과 같은 높이가 되면 즉시 교체.</li>
          <li>• 법정 마모한계 <strong>1.6mm</strong>(승용). 빗길 안전은 <strong>3mm</strong>부터 챙기는 것이 좋습니다.</li>
        </ul>
      </div>

      <div className={styles.card}>
        <span className={styles.cardLabel}>주행거리 · 사용 연수</span>
        <div className={styles.dualInput}>
          <div className={styles.dualCell}>
            <div className={styles.dualLabel}>장착 후 주행거리</div>
            <div className={styles.dualInputBox}>
              <input type="number" className={styles.dualField} value={km} onChange={e => setKm(e.target.value)} step="1000" />
              <span className={styles.dualUnit}>km</span>
            </div>
          </div>
          <div className={styles.dualCell}>
            <div className={styles.dualLabel}>사용 연수</div>
            <div className={styles.dualInputBox}>
              <input type="number" className={styles.dualField} value={years} onChange={e => setYears(e.target.value)} step="1" />
              <span className={styles.dualUnit}>년</span>
            </div>
          </div>
        </div>
        <ul className={styles.seasonList} style={{ marginTop: 12 }}>
          <li>• 주행거리 기준: <strong>{kmStatus}</strong> — 일반 승용 타이어 수명 약 <strong>4~5만 km</strong>.</li>
          <li>• 사용 연수 기준: <strong>{ageStatus}</strong> — 마모와 무관하게 고무 경화로 <strong>4~6년</strong>이면 점검·교체 검토.</li>
        </ul>
      </div>

      <div className={styles.card}>
        <span className={styles.cardLabel}>제조주차(DOT) 해석 — 끝 4자리</span>
        <div className={styles.dualInputBox}>
          <input className={styles.dualField} value={dot} onChange={e => setDot(e.target.value)} placeholder="2419" maxLength={4} />
          <span className={styles.dualUnit}>DOT</span>
        </div>
        {dotInfo ? (
          <div className={`${styles.statusCard} ${dotInfo.age >= 10 ? styles.statusAlert : dotInfo.age >= 6 ? styles.statusWarn : styles.statusOk}`} style={{ marginTop: 12 }}>
            <div className={styles.statusTitle}>{dotInfo.year}년 {dotInfo.week}주차 제조 · 약 {dotInfo.age}년 경과</div>
            <div className={styles.statusDesc}>
              {dotInfo.age >= 10 ? '🚨 제조 10년 이상 — 마모와 무관하게 즉시 교체 권장.'
                : dotInfo.age >= 6 ? '🔶 제조 6년 이상 — 고무 경화 진행, 교체 검토.'
                : '✅ 비교적 최근 제조. 마모·상태 위주로 점검.'}
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>DOT 끝 4자리를 입력하세요. 예) <strong>2419</strong> → 2019년 24주차. (타이어 옆면 &lsquo;DOT … 2419&rsquo; 형식)</p>
        )}
      </div>
    </>
  )
}
