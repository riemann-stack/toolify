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
export default function TirePressureClient() {
  const [tab, setTab] = useState<'convert' | 'check'>('convert')

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'convert' ? styles.tabActive : ''}`}
          onClick={() => setTab('convert')}
        >
          🛞 단위 변환
        </button>
        <button
          className={`${styles.tab} ${tab === 'check' ? styles.tabActive : ''}`}
          onClick={() => setTab('check')}
        >
          ✅ 권장 공기압 체크
        </button>
      </div>

      {tab === 'convert' ? <ConvertTab /> : <CheckTab />}
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

      {/* 계절별 보정 */}
      <div className={styles.seasonBox}>
        <p className={styles.seasonTitle}>🌡️ 계절별 공기압 변화 가이드</p>
        <ul className={styles.seasonList}>
          <li>• <strong>기온 10°C 변화 시 공기압 약 1 psi(≈ 7 kPa) 변화</strong></li>
          <li>• <strong>여름 → 겨울</strong> (예: 30°C → 0°C): 약 3 psi 자연 감소 → 보충 필요</li>
          <li>• <strong>겨울 → 여름</strong> (예: 0°C → 30°C): 약 3 psi 자연 증가</li>
          <li>• 측정은 <strong>주행 전 차가운 상태</strong>에서 (주행 후 측정 시 +3~5 psi 더 높게 나옴)</li>
          <li>• 한 달에 1~2번 정기 점검 권장 (자연 누설로 월 1~2 psi 감소)</li>
        </ul>
      </div>
    </>
  )
}
