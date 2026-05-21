'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import styles from './bmi.module.css'
import {
  Standard, Gender,
  BMI_CATEGORIES, BODY_FAT_RANGES,
  calcBMI, calcRichResult, calcTargetWeight, buildTargetTable,
  calcWaistHeightRatio, classifyAbdominal, combinedJudgment,
  estimateBodyFat, classifyBodyFat,
  simulateWeightChange, recommendTargetBMI,
  loadBmiHistory, saveBmiHistory, newBmiId, BmiRecord,
  cmToInch, inchToCm, kgToLb, lbToKg,
} from './bmiUtils'

type Tab = 'bmi' | 'target' | 'waist' | 'sim' | 'bf'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'bmi',    name: 'BMI 계산',    icon: '⚖️' },
  { id: 'target', name: '목표 체중',   icon: '🎯' },
  { id: 'waist',  name: '허리둘레',    icon: '📐' },
  { id: 'sim',    name: '체중 시뮬',   icon: '🎚️' },
  { id: 'bf',     name: '체지방률',    icon: '📊' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  bmi:    styles.tabActive,
  target: styles.tabActiveTarget,
  waist:  styles.tabActiveWaist,
  sim:    styles.tabActiveSim,
  bf:     styles.tabActiveBf,
}

export default function BmiClient() {
  const [tab, setTab] = useState<Tab>('bmi')

  /* ── 공통 입력 ── */
  const [height, setHeight] = useState('170')
  const [weight, setWeight] = useState('65')
  const [gender, setGender] = useState<Gender>('male')
  const [age, setAge] = useState('')
  const [standard, setStandard] = useState<Standard>('KOREA')
  const [unitH, setUnitH] = useState<'cm' | 'inch'>('cm')
  const [unitW, setUnitW] = useState<'kg' | 'lb'>('kg')

  /* ── 단위 환산값 ── */
  const heightCm = useMemo(() => {
    const v = parseFloat(height)
    if (!Number.isFinite(v) || v <= 0) return 0
    return unitH === 'cm' ? v : inchToCm(v)
  }, [height, unitH])

  const weightKg = useMemo(() => {
    const v = parseFloat(weight)
    if (!Number.isFinite(v) || v <= 0) return 0
    return unitW === 'kg' ? v : lbToKg(v)
  }, [weight, unitW])

  /* ── BMI 결과 ── */
  const rich = useMemo(() => {
    if (heightCm < 80 || heightCm > 250 || weightKg < 20 || weightKg > 300) return null
    return calcRichResult(heightCm, weightKg, standard)
  }, [heightCm, weightKg, standard])

  /* ── 게이지 ── */
  const gaugeMaxBmi = 40
  const gaugeSegs = useMemo(() => {
    const list = BMI_CATEGORIES[standard]
    return list.map((c, i) => {
      const min = c.min
      const max = c.max >= 999 ? gaugeMaxBmi : c.max
      const span = Math.max(0, max - min)
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        flex: span,
        min,
        max,
        range: i === list.length - 1 ? `${min}+` : `${min}~${max}`,
      }
    }).filter(s => s.flex > 0)
  }, [standard])

  const gaugePos = useMemo(() => {
    if (!rich) return null
    return Math.min(Math.max((rich.bmi / gaugeMaxBmi) * 100, 0), 100)
  }, [rich])

  /* ─────── 탭 2: 목표 BMI ─────── */
  const recommended = useMemo(() => {
    if (!rich) return 22
    return recommendTargetBMI(rich.bmi, standard)
  }, [rich, standard])
  const [targetBMI, setTargetBMI] = useState(22)
  useEffect(() => { setTargetBMI(recommended) }, [recommended])

  const targetWeight = useMemo(
    () => heightCm > 0 ? calcTargetWeight(heightCm, targetBMI) : 0,
    [heightCm, targetBMI],
  )

  const targetTable = useMemo(
    () => heightCm > 0 ? buildTargetTable(heightCm, weightKg) : [],
    [heightCm, weightKg],
  )

  const targetDiff = useMemo(() => {
    const d = Math.round((weightKg - targetWeight) * 10) / 10
    if (Math.abs(d) < 0.05) return { dir: 'eq' as const, kg: 0 }
    return d > 0 ? { dir: 'lose' as const, kg: Math.abs(d) } : { dir: 'gain' as const, kg: Math.abs(d) }
  }, [weightKg, targetWeight])

  /* ─────── 탭 3: 허리둘레 ─────── */
  const [waist, setWaist] = useState('')
  const [unitWaist, setUnitWaist] = useState<'cm' | 'inch'>('cm')

  const waistCm = useMemo(() => {
    const v = parseFloat(waist)
    if (!Number.isFinite(v) || v <= 0) return 0
    return unitWaist === 'cm' ? v : inchToCm(v)
  }, [waist, unitWaist])

  const abdom = useMemo(
    () => waistCm > 0 ? classifyAbdominal(waistCm, gender) : null,
    [waistCm, gender],
  )

  const whtr = useMemo(
    () => (waistCm > 0 && heightCm > 0) ? calcWaistHeightRatio(waistCm, heightCm) : null,
    [waistCm, heightCm],
  )

  const judgment = useMemo(() => {
    if (!rich || !abdom) return null
    return combinedJudgment(rich.bmi, abdom.isObese, standard)
  }, [rich, abdom, standard])

  /* ─────── 탭 4: 체중 시뮬 ─────── */
  const [simWeight, setSimWeight] = useState(weightKg)
  useEffect(() => { setSimWeight(weightKg) }, [weightKg])
  const [perWeek, setPerWeek] = useState(-0.5)
  const [totalWeeks, setTotalWeeks] = useState(12)

  const simBmi = useMemo(
    () => heightCm > 0 ? calcBMI(heightCm, simWeight) : 0,
    [heightCm, simWeight],
  )
  const simCat = useMemo(() => {
    if (!simBmi) return null
    const list = BMI_CATEGORIES[standard]
    return list.find(c => simBmi >= c.min && simBmi < c.max) ?? list[list.length - 1]
  }, [simBmi, standard])

  const simSteps = useMemo(
    () => (heightCm > 0 && weightKg > 0)
      ? simulateWeightChange(weightKg, heightCm, standard, perWeek, totalWeeks)
      : [],
    [heightCm, weightKg, standard, perWeek, totalWeeks],
  )

  /* ─────── 탭 5: 체지방률 ─────── */
  const [neck, setNeck] = useState('')
  const [hip, setHip] = useState('')
  const neckCm = useMemo(() => {
    const v = parseFloat(neck); if (!Number.isFinite(v) || v <= 0) return 0
    return unitWaist === 'cm' ? v : inchToCm(v)
  }, [neck, unitWaist])
  const hipCm = useMemo(() => {
    const v = parseFloat(hip); if (!Number.isFinite(v) || v <= 0) return 0
    return unitWaist === 'cm' ? v : inchToCm(v)
  }, [hip, unitWaist])

  const bodyFat = useMemo(() => {
    if (heightCm <= 0 || waistCm <= 0 || neckCm <= 0) return null
    return estimateBodyFat({
      gender, height: heightCm, waist: waistCm, neck: neckCm,
      hip: gender === 'female' ? hipCm : undefined,
    })
  }, [gender, heightCm, waistCm, neckCm, hipCm])

  const bfClass = useMemo(
    () => bodyFat !== null ? classifyBodyFat(bodyFat, gender) : null,
    [bodyFat, gender],
  )

  /* ─────── 단위 토글 ─────── */
  const toggleHeightUnit = () => {
    const v = parseFloat(height)
    if (Number.isFinite(v) && v > 0) {
      const next = unitH === 'cm' ? cmToInch(v) : inchToCm(v)
      setHeight(String(Math.round(next * 10) / 10))
    }
    setUnitH(unitH === 'cm' ? 'inch' : 'cm')
  }
  const toggleWeightUnit = () => {
    const v = parseFloat(weight)
    if (Number.isFinite(v) && v > 0) {
      const next = unitW === 'kg' ? kgToLb(v) : lbToKg(v)
      setWeight(String(Math.round(next * 10) / 10))
    }
    setUnitW(unitW === 'kg' ? 'lb' : 'kg')
  }
  const toggleWaistUnit = () => {
    const conv = (s: string, fwd: boolean) => {
      const v = parseFloat(s); if (!Number.isFinite(v) || v <= 0) return s
      return String(Math.round((fwd ? cmToInch(v) : inchToCm(v)) * 10) / 10)
    }
    const fwd = unitWaist === 'cm'
    setWaist(prev => conv(prev, fwd))
    setNeck(prev => conv(prev, fwd))
    setHip(prev => conv(prev, fwd))
    setUnitWaist(fwd ? 'inch' : 'cm')
  }

  /* ─────── 복사 / 저장 ─────── */
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch { /* */ }
  }

  const [history, setHistory] = useState<BmiRecord[]>([])
  useEffect(() => { setHistory(loadBmiHistory()) }, [])

  const saveCurrent = () => {
    if (!rich) return
    const item: BmiRecord = {
      id: newBmiId(),
      date: new Date().toISOString(),
      height: Math.round(heightCm * 10) / 10,
      weight: Math.round(weightKg * 10) / 10,
      bmi: rich.bmi,
      ...(waistCm > 0 ? { waist: Math.round(waistCm * 10) / 10 } : {}),
      ...(bodyFat !== null ? { bodyFat } : {}),
    }
    const next = [item, ...history].slice(0, 60)
    setHistory(next); saveBmiHistory(next)
  }
  const removeHistory = (id: string) => {
    const next = history.filter(h => h.id !== id)
    setHistory(next); saveBmiHistory(next)
  }
  const clearHistory = () => { setHistory([]); saveBmiHistory([]) }

  /* ─────── 정신 건강 안내 ─────── */
  const showMentalHealth = rich !== null && rich.bmi < 16
  const ageNum = parseInt(age, 10)
  const ageGuide = (() => {
    if (!Number.isFinite(ageNum) || ageNum <= 0) return null
    if (ageNum < 18) return { color: '#EA580C', text: '본 도구는 성인(18세 이상) 기준입니다. 소아청소년은 백분위수 차트 활용을 권장합니다.' }
    if (ageNum >= 65) return { color: '#0891B2', text: '65세 이상에서는 BMI 22~27도 적정일 수 있습니다. 근감소증·낙상 위험을 고려해 단순 BMI보다 종합 평가를 권장합니다.' }
    return null
  })()

  /* ────────────────────────────── 렌더 ────────────────────────────── */
  return (
    <div className={styles.wrap}>

      {/* 면책 */}
      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량' },
          { href: '/tools/health/weightloss', label: '체중감량 계산기' }
        ]}
      >
        의학적 진단 도구가 아닙니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* 공통 입력 — 키·체중·성별·나이·기준 */}
      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            키
            <button className={`${styles.unitToggle} ${styles.unitToggleActive}`}
              onClick={toggleHeightUnit}>{unitH}</button>
          </label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder={unitH === 'cm' ? '170' : '67'}
              value={height} onChange={e => setHeight(e.target.value)} />
            <span className={styles.unit}>{unitH}</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            체중
            <button className={`${styles.unitToggle} ${styles.unitToggleActive}`}
              onClick={toggleWeightUnit}>{unitW}</button>
          </label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder={unitW === 'kg' ? '65' : '143'}
              value={weight} onChange={e => setWeight(e.target.value)} />
            <span className={styles.unit}>{unitW}</span>
          </div>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>성별</label>
          <div className={styles.toggleRow}>
            <button className={`${styles.toggleBtn} ${gender === 'male' ? styles.toggleActive : ''}`}
              onClick={() => setGender('male')}>♂ 남성</button>
            <button className={`${styles.toggleBtn} ${gender === 'female' ? styles.toggleActive : ''}`}
              onClick={() => setGender('female')}>♀ 여성</button>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>나이 <span className={styles.cardLabelHint}>선택</span></label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30" value={age} onChange={e => setAge(e.target.value)} />
            <span className={styles.unit}>세</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>BMI 분류 기준</label>
        <div className={styles.toggleRow}>
          <button className={`${styles.toggleBtn} ${standard === 'KOREA' ? styles.toggleActive : ''}`}
            onClick={() => setStandard('KOREA')}>🇰🇷 대한비만학회 (권장)</button>
          <button className={`${styles.toggleBtn} ${standard === 'WHO' ? styles.toggleActive : ''}`}
            onClick={() => setStandard('WHO')}>🌐 WHO (국제)</button>
        </div>
      </div>

      {ageGuide && (
        <div className={styles.infoBox} style={{ borderColor: `${ageGuide.color}50`, background: `${ageGuide.color}10` }}>
          ⓘ {ageGuide.text}
        </div>
      )}

      {/* ─────────────── 탭 1: BMI 계산 ─────────────── */}
      {tab === 'bmi' && (
        <>
          {rich ? (
            <>
              <div className={styles.hero}
                style={{ borderColor: `${rich.category.color}50`, background: `${rich.category.color}0F` }}>
                <div className={styles.heroLabel}>BMI 체질량지수</div>
                <div className={styles.heroNum} style={{ color: rich.category.color }}>
                  {rich.bmi.toFixed(1)}
                </div>
                <div className={styles.heroCategory} style={{ color: rich.category.color }}>
                  {rich.category.name}
                </div>
                <div className={styles.heroSub}>{rich.category.desc}</div>
                <div className={styles.heroDisclaimer}>* 건강 지표 중 하나일 뿐, 의학적 진단이 아닙니다</div>
              </div>

              {/* BMI 게이지 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>
                  BMI 위치 ({standard === 'KOREA' ? '대한비만학회' : 'WHO'} 기준)
                </label>
                <div className={styles.gauge}>
                  <div className={styles.gaugeBar} style={{ marginTop: 30 }}>
                    {gaugeSegs.map(s => (
                      <div key={s.id}
                        className={styles.gaugeSeg}
                        style={{ flex: s.flex, background: s.color, opacity: 0.85 }}
                      />
                    ))}
                    {gaugePos !== null && (
                      <>
                        <div className={styles.gaugeMarkerLabel} style={{ left: `${gaugePos}%` }}>
                          {rich.bmi.toFixed(1)}
                        </div>
                        <div className={styles.gaugeMarker} style={{ left: `${gaugePos}%` }} />
                      </>
                    )}
                  </div>
                  <div className={styles.gaugeAxis}>
                    <span>0</span><span>18.5</span>
                    <span>{standard === 'KOREA' ? '23' : '25'}</span>
                    <span>{standard === 'KOREA' ? '25' : '30'}</span>
                    <span>40+</span>
                  </div>
                  {/* 범례 — 각 구간 색상·이름·BMI 범위 */}
                  <div className={styles.gaugeLegend}>
                    {gaugeSegs.map(s => {
                      const isCurrent = s.id === rich.category.id
                      const rangeText =
                        s.min === 0 ? `~${s.max}` :
                        s.max >= gaugeMaxBmi ? `${s.min}+` :
                        `${s.min}~${s.max}`
                      return (
                        <div key={s.id} className={`${styles.gaugeLegendItem} ${isCurrent ? styles.gaugeLegendItemActive : ''}`}>
                          <span className={styles.gaugeLegendDot} style={{ background: s.color }} />
                          <span className={styles.gaugeLegendName}>{s.name}</span>
                          <span className={styles.gaugeLegendRange}>{rangeText}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* 키별 체중 구간 표 */}
              <div className={styles.card}>
                <label className={styles.cardLabel}>
                  키 {Math.round(heightCm)}cm 기준 체중 구간
                </label>
                <div className={styles.rangeTable}>
                  {rich.weightRanges.map(r => {
                    const isCurrent = r.id === rich.category.id
                    const text = r.maxWeight === null
                      ? `${r.minWeight}kg 이상`
                      : r.minWeight === 0 ? `~${r.maxWeight}kg` : `${r.minWeight} ~ ${r.maxWeight}kg`
                    return (
                      <div key={r.id}
                        className={`${styles.rangeRow} ${isCurrent ? styles.rangeRowActive : ''}`}
                        style={{ borderLeftColor: r.color }}>
                        <span className={styles.rangeName} style={{ color: isCurrent ? r.color : 'var(--text)' }}>
                          {r.name}
                        </span>
                        <span className={styles.rangeWeight}>{text}</span>
                        <span className={styles.rangeMark}>{isCurrent ? '✓' : ''}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 현재 위치 안내 */}
              <div className={styles.detailGrid3}>
                <div className={styles.detailItem}>
                  <small>정상 범위 ({standard === 'KOREA' ? '한국' : 'WHO'})</small>
                  <div>{rich.normalMin}<span style={{ fontSize: 14, opacity: 0.7, margin: '0 2px', fontFamily: 'Noto Sans KR, sans-serif', fontWeight: 600 }}>~</span>{rich.normalMax}</div>
                  <p>kg</p>
                </div>
                <div className={styles.detailItem}>
                  <small>정상까지</small>
                  <div style={{ color: rich.toNormal.direction === 'in' ? '#059669' : 'var(--accent)' }}>
                    {rich.toNormal.direction === 'in' ? '범위 내' :
                      `${rich.toNormal.direction === 'lose' ? '−' : '+'}${rich.toNormal.kg}`}
                  </div>
                  <p>{rich.toNormal.direction === 'in' ? '✓' : 'kg'}</p>
                </div>
                <div className={styles.detailItem}>
                  <small>BMI 1당</small>
                  <div>{rich.bmiPerKg}</div>
                  <p>kg ({Math.round(heightCm)}cm)</p>
                </div>
              </div>

              {rich.nextStage && (
                <div className={styles.infoBox}>
                  💡 다음 단계 <strong>{rich.nextStage.name}</strong> 시작 — 체중 <strong>{rich.nextStage.weight}kg</strong> (BMI {rich.nextStage.bmi})
                  &nbsp;· 현재까지 +{Math.round((rich.nextStage.weight - weightKg) * 10) / 10}kg
                </div>
              )}

              {rich.toBmi22.direction !== 'eq' && (
                <div className={styles.infoBox}>
                  🎯 <strong>BMI 22 (한국 권장)</strong>까지
                  {rich.toBmi22.direction === 'lose' ? ` −${rich.toBmi22.kg}kg 감량` : ` +${rich.toBmi22.kg}kg 증량`}
                </div>
              )}

              {showMentalHealth && (
                <div className={styles.warnBox}>
                  💛 BMI가 매우 낮습니다. <strong>건강 우려가 있다면 의료 전문가와 상담</strong>하시고,
                  체중 강박·거식증 신호가 있다면 도움을 받으세요 — 정신건강 위기상담 <strong>1577-0199</strong> · 자살예방상담 <strong>1393</strong> (24시간).
                </div>
              )}

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`키 ${Math.round(heightCm)}cm / 체중 ${Math.round(weightKg * 10) / 10}kg → BMI ${rich.bmi} (${rich.category.name})`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <button className={styles.copyBtn} onClick={() => setTab('target')}>🎯 목표 체중</button>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 기록 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>키와 체중을 입력하세요</div>
              유효 범위: 키 80~250{unitH === 'inch' ? 'in' : 'cm'} · 체중 20~300{unitW === 'lb' ? 'lb' : 'kg'}
            </div>
          )}
        </>
      )}

      {/* ─────────────── 탭 2: 목표 체중 ─────────────── */}
      {tab === 'target' && (
        <>
          <div className={styles.disclaimer}>
            <strong>목표 BMI</strong>를 선택하면 필요한 체중과 차이가 계산됩니다. 건강한 감량 페이스는 주당 0.3~0.5kg가 권장됩니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>목표 BMI 빠른 선택</label>
            <div className={styles.optionRow4}>
              {[
                { v: 18.5, label: 'BMI 18.5\n정상 하한' },
                { v: 21,   label: 'BMI 21\n이상 체중' },
                { v: 22,   label: 'BMI 22\n한국 권장' },
                { v: 23,   label: 'BMI 23\n정상 상한' },
              ].map(o => (
                <button key={o.v}
                  className={`${styles.optionBtn} ${Math.abs(targetBMI - o.v) < 0.05 ? styles.optionActive : ''}`}
                  onClick={() => setTargetBMI(o.v)} style={{ whiteSpace: 'pre-line' }}>
                  {o.label}
                </button>
              ))}
            </div>
            <button className={styles.optionBtn} style={{ marginTop: 6, width: '100%' }}
              onClick={() => setTargetBMI(recommended)}>
              ⭐ 자동 추천: BMI {recommended} (현재 BMI 기반)
            </button>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              직접 입력 — BMI {targetBMI.toFixed(1)}
            </label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="15" max="30" step="0.1"
                value={targetBMI}
                onChange={e => setTargetBMI(parseFloat(e.target.value))} />
              <span className={styles.sliderVal}>{targetBMI.toFixed(1)}</span>
            </div>
          </div>

          {rich && (
            <>
              <div className={styles.hero}
                style={{ borderColor: '#CA8A0450', background: '#CA8A0410' }}>
                <div className={styles.heroLabel}>목표 BMI {targetBMI.toFixed(1)} 체중</div>
                <div className={styles.heroNum} style={{ color: '#CA8A04' }}>
                  {targetWeight}<span className={styles.heroNumUnit}>kg</span>
                </div>
                <div className={styles.heroSub}>
                  현재 {Math.round(weightKg * 10) / 10}kg →&nbsp;
                  {targetDiff.dir === 'eq' ? <strong style={{ color: '#059669' }}>이미 목표 도달</strong>
                    : targetDiff.dir === 'lose'
                      ? <span>{targetDiff.kg}kg 감량 필요</span>
                      : <span>+{targetDiff.kg}kg 증량 필요</span>}
                </div>
              </div>

              {targetDiff.dir === 'lose' && targetDiff.kg > 0 && (
                <div className={styles.infoBox}>
                  💡 <strong>건강한 감량 페이스</strong> 주당 0.3~0.5kg 기준 ·
                  {targetDiff.kg}kg 감량 시 약 <strong>{Math.ceil(targetDiff.kg / 0.5)}~{Math.ceil(targetDiff.kg / 0.3)}주 ({Math.ceil(targetDiff.kg / 0.5 / 4)}~{Math.ceil(targetDiff.kg / 0.3 / 4)}개월)</strong> 소요. 무리한 감량은 근손실·요요·건강 위험이 있습니다.
                </div>
              )}

              <div className={styles.card}>
                <label className={styles.cardLabel}>BMI별 체중 표 (키 {Math.round(heightCm)}cm)</label>
                <div className={styles.targetTable}>
                  {targetTable.map(t => (
                    <div key={t.bmi}
                      className={`${styles.targetRow} ${Math.abs(t.bmi - targetBMI) < 0.3 ? styles.targetRowActive : ''}`}>
                      <span className={styles.targetBmi}>BMI {t.bmi}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {t.bmi === 18.5 ? '정상 하한' :
                         t.bmi === 22 ? '한국 권장' :
                         t.bmi === 23 ? '정상 상한 (한국)' :
                         t.bmi === 24.9 ? '정상 상한 (WHO)' :
                         t.isCurrent ? '현재' : ''}
                      </span>
                      <span className={styles.targetWeight}>
                        {t.weight}kg{Math.abs(t.bmi - targetBMI) < 0.3 ? ' ←' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.resultActions}>
                <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`목표 BMI ${targetBMI} → 체중 ${targetWeight}kg (${targetDiff.dir === 'eq' ? '도달' : targetDiff.dir === 'lose' ? `−${targetDiff.kg}kg` : `+${targetDiff.kg}kg`})`)}>
                  {copied ? '✓ 복사됨' : '📋 복사'}
                </button>
                <a className={styles.copyBtn} href="/tools/health/weightloss"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                  🎯 감량 기간 계산 →
                </a>
                <button className={styles.copyBtn} onClick={saveCurrent}>💾 저장</button>
              </div>
            </>
          )}
        </>
      )}

      {/* ─────────────── 탭 3: 허리둘레 ─────────────── */}
      {tab === 'waist' && (
        <>
          <div className={styles.disclaimer}>
            <strong>허리둘레는 BMI의 한계를 보완</strong>하는 핵심 지표입니다.
            &lsquo;마른 비만&rsquo;·&lsquo;근육 우세형&rsquo;을 BMI 단독으로는 구분할 수 없지만, 허리둘레와 함께 보면 명확해집니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              허리둘레
              <button className={`${styles.unitToggle} ${styles.unitToggleActive}`}
                onClick={toggleWaistUnit}>{unitWaist}</button>
            </label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder={unitWaist === 'cm' ? '82' : '32'}
                value={waist} onChange={e => setWaist(e.target.value)} />
              <span className={styles.unit}>{unitWaist}</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--text)' }}>측정법</strong> — 호흡 후 자연스러운 자세에서 배꼽 위 약 2cm(장골 능선 위) 위치를 줄자가 평행하게 둘러서 측정. 두꺼운 옷 위로 측정하지 마세요.
            </div>
          </div>

          {abdom && (
            <div className={styles.hero}
              style={{ borderColor: `${abdom.color}50`, background: `${abdom.color}0F` }}>
              <div className={styles.heroLabel}>허리둘레 판정</div>
              <div className={styles.heroNum} style={{ color: abdom.color, fontSize: 'clamp(40px, 10vw, 64px)' }}>
                {Math.round(waistCm * 10) / 10}<span className={styles.heroNumUnit}>cm</span>
              </div>
              <div className={styles.heroCategory} style={{ color: abdom.color }}>
                {abdom.name}
              </div>
              <div className={styles.heroSub}>{abdom.desc}</div>
              <div className={styles.heroDisclaimer}>
                대한비만학회 기준 — 남성 90cm·여성 85cm 이상 = 복부비만
              </div>
            </div>
          )}

          {whtr && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>허리-신장비 (Waist-to-Height Ratio)</label>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <small>비율</small>
                  <div style={{ color: whtr.color }}>{whtr.ratio.toFixed(2)}</div>
                  <p>허리 ÷ 키</p>
                </div>
                <div className={styles.detailItem}>
                  <small>판정</small>
                  <div style={{ color: whtr.color, fontSize: 14 }}>{whtr.name}</div>
                  <p>{whtr.desc}</p>
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                💡 <strong style={{ color: 'var(--text)' }}>&ldquo;허리둘레가 키의 절반을 넘지 않도록&rdquo;</strong> — 0.5 미만 유지 권장.
                BMI보다 복부비만 위험을 직관적으로 파악할 수 있어 국제적으로 보조 지표로 자주 활용됩니다.
              </p>
            </div>
          )}

          {/* BMI×허리 종합 매트릭스 */}
          {rich && abdom && judgment && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>BMI × 허리둘레 종합 해석</label>
              <div className={styles.matrix}>
                {[
                  { kind: 'healthy',        emoji: '✅', title: '건강한 체형',     desc: 'BMI·허리 정상' },
                  { kind: 'skinny-fat',     emoji: '⚠️', title: '마른 비만',       desc: 'BMI 정상·허리 비만' },
                  { kind: 'muscular',       emoji: '⚠️', title: '근육 우세형',     desc: 'BMI 비만·허리 정상' },
                  { kind: 'combined-obese', emoji: '🔴', title: '종합 비만',       desc: 'BMI·허리 모두 비만' },
                ].map(m => (
                  <div key={m.kind}
                    className={`${styles.matrixCell} ${judgment.kind === m.kind ? styles.matrixCellActive : ''}`}
                    style={judgment.kind === m.kind ? { borderColor: judgment.color } : {}}>
                    <strong style={judgment.kind === m.kind ? { color: judgment.color } : {}}>
                      {m.emoji} {m.title}
                    </strong>
                    {m.desc}
                  </div>
                ))}
              </div>
              <div className={styles.infoBox} style={{
                marginTop: 10,
                background: `${judgment.color}10`,
                borderColor: `${judgment.color}50`,
              }}>
                <strong style={{ color: judgment.color }}>{judgment.emoji} {judgment.title}</strong> — {judgment.desc}
              </div>
            </div>
          )}

          {!waistCm && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>허리둘레를 입력하세요</div>
              성별 + 허리둘레로 복부비만·허리-신장비를 판정합니다
            </div>
          )}
        </>
      )}

      {/* ─────────────── 탭 4: 체중 시뮬레이터 ─────────────── */}
      {tab === 'sim' && (
        <>
          <div className={styles.disclaimer}>
            <strong>체중 시뮬레이터</strong> — 체중 변화에 따른 BMI 변화와 미래 시점(4·8·12주) 예상 체중을 확인할 수 있습니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              체중 슬라이더 — {simWeight.toFixed(1)}kg
            </label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min={Math.max(20, weightKg - 20).toFixed(0)}
                max={(weightKg + 20).toFixed(0)}
                step="0.1"
                value={simWeight}
                onChange={e => setSimWeight(parseFloat(e.target.value))} />
              <span className={styles.sliderVal}>{simWeight.toFixed(1)}kg</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
              현재 ±20kg 범위
            </p>
          </div>

          {simCat && rich && (
            <div className={styles.hero}
              style={{ borderColor: `${simCat.color}50`, background: `${simCat.color}0F` }}>
              <div className={styles.heroLabel}>예상 BMI</div>
              <div className={styles.heroNum} style={{ color: simCat.color }}>
                {simBmi.toFixed(1)}
              </div>
              <div className={styles.heroCategory} style={{ color: simCat.color }}>
                {simCat.name}
              </div>
              <div className={styles.heroSub}>
                현재 {weightKg.toFixed(1)}kg (BMI {rich.bmi}) → {simWeight.toFixed(1)}kg ({simWeight > weightKg ? '+' : ''}{(simWeight - weightKg).toFixed(1)}kg)
              </div>
            </div>
          )}

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              주당 변화 페이스 — {perWeek > 0 ? '+' : ''}{perWeek.toFixed(1)}kg/주
            </label>
            <div className={styles.sliderRow}>
              <input className={styles.slider} type="range"
                min="-1" max="1" step="0.1"
                value={perWeek}
                onChange={e => setPerWeek(parseFloat(e.target.value))} />
              <span className={styles.sliderVal}>{perWeek > 0 ? '+' : ''}{perWeek.toFixed(1)}</span>
            </div>
            <div className={styles.optionRow4} style={{ marginTop: 8 }}>
              {[
                { v: -0.5, label: '−0.5kg\n건강 감량' },
                { v: -0.3, label: '−0.3kg\n완만 감량' },
                { v: 0.3,  label: '+0.3kg\n완만 증량' },
                { v: 0.5,  label: '+0.5kg\n근성장' },
              ].map(o => (
                <button key={o.v}
                  className={`${styles.optionBtn} ${Math.abs(perWeek - o.v) < 0.05 ? styles.optionActive : ''}`}
                  onClick={() => setPerWeek(o.v)} style={{ whiteSpace: 'pre-line' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>총 기간 — {totalWeeks}주</label>
            <div className={styles.optionRow4}>
              {[4, 8, 12, 24].map(w => (
                <button key={w}
                  className={`${styles.optionBtn} ${totalWeeks === w ? styles.optionActive : ''}`}
                  onClick={() => setTotalWeeks(w)}>
                  {w}주
                </button>
              ))}
            </div>
          </div>

          {simSteps.length > 0 && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>변화 시뮬레이션</label>
              <div className={styles.simSteps}>
                {simSteps.map(s => (
                  <div key={s.weeks} className={styles.simStep} style={{ borderLeftColor: s.color }}>
                    <span className={styles.simStepWeeks}>{s.weeks}주</span>
                    <span className={styles.simStepWeight}>{s.weight}kg</span>
                    <span className={styles.simStepBmi} style={{ color: s.color }}>BMI {s.bmi}</span>
                    <span className={styles.simStepCat} style={{ color: s.color }}>{s.category}</span>
                  </div>
                ))}
              </div>
              {Math.abs(perWeek) > 0.5 && (
                <div className={styles.warnBox} style={{ marginTop: 10 }}>
                  ⚠️ <strong>주당 0.5kg 초과 변화는 권장되지 않습니다.</strong> 급격한 감량은 근손실·요요·건강 위험이 있고, 급격한 증량도 지방 비율 증가 등 부작용이 있을 수 있습니다.
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─────────────── 탭 5: 체지방률 ─────────────── */}
      {tab === 'bf' && (
        <>
          <div className={styles.disclaimer}>
            <strong>Navy 공식</strong> 기반 체지방률 추정 (미 해군 군 측정법). 정확도 ±3~5%로 빠른 참고용이며, 정확한 측정은 InBody·DEXA 등 체성분 검사를 권장합니다.
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>
              허리둘레
              <button className={`${styles.unitToggle} ${styles.unitToggleActive}`}
                onClick={toggleWaistUnit}>{unitWaist}</button>
            </label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder={unitWaist === 'cm' ? '82' : '32'}
                value={waist} onChange={e => setWaist(e.target.value)} />
              <span className={styles.unit}>{unitWaist}</span>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>목둘레</label>
            <div className={styles.inputRow}>
              <input className={styles.numInput} type="number" inputMode="decimal"
                placeholder={unitWaist === 'cm' ? '38' : '15'}
                value={neck} onChange={e => setNeck(e.target.value)} />
              <span className={styles.unit}>{unitWaist}</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
              후두 결절(목 가장 두꺼운 부분) 아래 측정
            </p>
          </div>

          {gender === 'female' && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>엉덩이둘레 <span className={styles.cardLabelHint}>여성만</span></label>
              <div className={styles.inputRow}>
                <input className={styles.numInput} type="number" inputMode="decimal"
                  placeholder={unitWaist === 'cm' ? '95' : '37'}
                  value={hip} onChange={e => setHip(e.target.value)} />
                <span className={styles.unit}>{unitWaist}</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                엉덩이 가장 두꺼운 부분 측정
              </p>
            </div>
          )}

          {bodyFat !== null && bfClass && (
            <>
              <div className={styles.hero}
                style={{ borderColor: `${bfClass.color}50`, background: `${bfClass.color}0F` }}>
                <div className={styles.heroLabel}>추정 체지방률</div>
                <div className={styles.heroNum} style={{ color: bfClass.color }}>
                  {bodyFat.toFixed(1)}<span className={styles.heroNumUnit}>%</span>
                </div>
                <div className={styles.heroCategory} style={{ color: bfClass.color }}>
                  {bfClass.name} ({bfClass.rangeText})
                </div>
                <div className={styles.heroDisclaimer}>
                  Navy 공식 추정치 · ±3~5% 오차 가능 · 정확도 ↓
                </div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>{gender === 'male' ? '남성' : '여성'} 체지방률 기준</label>
                <div className={styles.bfTable}>
                  <div className={`${styles.bfRow} ${styles.headerRow}`}>
                    <span>분류</span><span style={{ textAlign: 'right' }}>남성</span><span style={{ textAlign: 'right' }}>여성</span>
                  </div>
                  {[
                    { name: '우수',     m: '<10%',     f: '<18%',     min: 0,  max: BODY_FAT_RANGES[gender].excellent },
                    { name: '좋음',     m: '10~15%',   f: '18~23%',   min: BODY_FAT_RANGES[gender].excellent, max: BODY_FAT_RANGES[gender].good },
                    { name: '평균',     m: '15~20%',   f: '23~28%',   min: BODY_FAT_RANGES[gender].good, max: BODY_FAT_RANGES[gender].average },
                    { name: '평균 이상', m: '20~25%',   f: '28~33%',   min: BODY_FAT_RANGES[gender].average, max: BODY_FAT_RANGES[gender].aboveAverage },
                    { name: '높음',     m: '25~30%',   f: '33~38%',   min: BODY_FAT_RANGES[gender].aboveAverage, max: BODY_FAT_RANGES[gender].poor },
                    { name: '위험',     m: '>30%',     f: '>38%',     min: BODY_FAT_RANGES[gender].poor, max: 999 },
                  ].map(r => {
                    const active = bodyFat >= r.min && bodyFat < r.max
                    return (
                      <div key={r.name}
                        className={`${styles.bfRow} ${active ? styles.bfRowActive : ''}`}>
                        <span>{r.name}{active ? ' ←' : ''}</span>
                        <span style={{ textAlign: 'right' }}>{r.m}</span>
                        <span style={{ textAlign: 'right' }}>{r.f}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {rich && (
                <div className={styles.infoBox}>
                  💡 <strong>BMI {rich.bmi} ({rich.category.name}) + 체지방률 {bodyFat.toFixed(1)}% ({bfClass.name})</strong>
                  <br />
                  {(() => {
                    const bmiNormal = rich.category.id === 'normal'
                    const bfHigh = bodyFat >= BODY_FAT_RANGES[gender].average
                    if (bmiNormal && !bfHigh) return '→ 건강한 체형으로 추정됩니다.'
                    if (bmiNormal && bfHigh)  return '→ "마른 비만" 가능성. 근력 운동 + 식단 점검을 권장합니다.'
                    if (!bmiNormal && !bfHigh) return '→ 근육 우세형 체형 가능성. BMI는 높지만 체지방은 양호합니다.'
                    return '→ 체중·체지방 모두 관리가 필요합니다.'
                  })()}
                </div>
              )}

              <div className={styles.warnBox}>
                ⚠️ <strong>정확도 한계</strong> — Navy 공식은 빠른 추정용이며 실제와 ±3~5% 차이가 날 수 있습니다.
                정확한 체성분 분석은 <strong>InBody (±2~3%)</strong>·<strong>DEXA (±1~2%)</strong> 등 전문 측정을 권장합니다.
              </div>
            </>
          )}

          {bodyFat === null && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>측정값을 모두 입력하세요</div>
              {gender === 'male' ? '남성: 키·허리·목둘레' : '여성: 키·허리·목둘레·엉덩이둘레'}
            </div>
          )}
        </>
      )}

      {/* 히스토리 (모든 탭 공통) */}
      {history.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            저장된 기록 ({history.length}/60)
            <button className={`${styles.miniBtn} ${styles.miniDanger}`} onClick={clearHistory}>전체 삭제</button>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.slice(0, 8).map(h => (
              <div key={h.id} className={styles.historyRow}>
                <span className={styles.historyName}>
                  {h.weight}kg · {h.height}cm
                  <small>· {new Date(h.date).toLocaleDateString('ko-KR')}{h.waist ? ` · 허리 ${h.waist}cm` : ''}{h.bodyFat !== undefined ? ` · 체지방 ${h.bodyFat}%` : ''}</small>
                </span>
                <span className={styles.historyVal}>BMI {h.bmi}</span>
                <button className={styles.miniBtn} onClick={() => removeHistory(h.id)}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 면책 — 강화 */}
      <div className={styles.warnBox}>
        💛 <strong>BMI는 자존감의 절대값이 아닙니다.</strong> 체중·외모 강박이 있다면 객관적 정보보다
        신체 건강·정신 건강 모두 고려가 중요합니다. 도움이 필요하면 —
        <br />· 정신건강 위기상담: <strong>1577-0199</strong> (24시간)
        <br />· 보건복지부 자살예방상담: <strong>1393</strong> (24시간)
      </div>
    </div>
  )
}
