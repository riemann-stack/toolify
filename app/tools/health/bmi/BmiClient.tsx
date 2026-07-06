'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import styles from './bmi.module.css'
import {
  Standard, Gender,
  BMI_CATEGORIES, BODY_FAT_RANGES,
  calcBMI, calcRichResult,
  calcWaistHeightRatio, classifyAbdominal, combinedJudgment,
  estimateBodyFat, classifyBodyFat,
  simulateWeightChange,
  loadBmiHistory, saveBmiHistory, newBmiId, BmiRecord,
  cmToInch, inchToCm, kgToLb, lbToKg,
} from './bmiUtils'

type Tab = 'bmi' | 'body' | 'sim'

const TABS: { id: Tab; name: string }[] = [
  { id: 'bmi',  name: 'BMI 계산' },
  { id: 'body', name: '허리·체지방' },
  { id: 'sim',  name: '체중 시뮬' },
]

const TAB_ACTIVE: Record<Tab, string> = {
  bmi:  styles.tabActive,
  body: styles.tabActiveWaist,
  sim:  styles.tabActiveSim,
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

  /* ─────── 탭 2: 허리·체지방 ─────── */
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

  /* ─────── 탭 3: 체중 시뮬 ─────── */
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

  /* ─────── 탭 2: 체지방률 입력 ─────── */
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
        sources={[
          { label: '대한비만학회', href: 'https://www.kosso.or.kr' },
          { label: 'WHO', href: 'https://www.who.int' },
        ]}
      >
        의학적 진단 도구가 아닙니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={styles.tabs} role="tablist" aria-label="BMI 도구 탭">
        {TABS.map(t => (
          <button key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tabBtn} ${tab === t.id ? TAB_ACTIVE[t.id] : ''}`}
            onClick={() => setTab(t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      {/* 공통 입력 — 키·체중·성별·나이·기준 */}
      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="bmi-height">
            키
            <button type="button" aria-label="키 단위 전환"
              className={`${styles.unitToggle} ${styles.unitToggleActive}`}
              onClick={toggleHeightUnit}>{unitH}</button>
          </label>
          <div className={styles.inputRow}>
            <input id="bmi-height" className={styles.numInput} type="number" inputMode="decimal"
              placeholder={unitH === 'cm' ? '170' : '67'}
              value={height} onChange={e => setHeight(e.target.value)} />
            <span className={styles.unit}>{unitH}</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="bmi-weight">
            체중
            <button type="button" aria-label="체중 단위 전환"
              className={`${styles.unitToggle} ${styles.unitToggleActive}`}
              onClick={toggleWeightUnit}>{unitW}</button>
          </label>
          <div className={styles.inputRow}>
            <input id="bmi-weight" className={styles.numInput} type="number" inputMode="decimal"
              placeholder={unitW === 'kg' ? '65' : '143'}
              value={weight} onChange={e => setWeight(e.target.value)} />
            <span className={styles.unit}>{unitW}</span>
          </div>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>성별</label>
          <div className={styles.toggleRow} role="group" aria-label="성별 선택">
            <button type="button" aria-pressed={gender === 'male'}
              className={`${styles.toggleBtn} ${gender === 'male' ? styles.toggleActive : ''}`}
              onClick={() => setGender('male')}>♂ 남성</button>
            <button type="button" aria-pressed={gender === 'female'}
              className={`${styles.toggleBtn} ${gender === 'female' ? styles.toggleActive : ''}`}
              onClick={() => setGender('female')}>♀ 여성</button>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="bmi-age">나이 <span className={styles.cardLabelHint}>선택</span></label>
          <div className={styles.inputRow}>
            <input id="bmi-age" className={styles.numInput} type="number" inputMode="numeric"
              placeholder="30" value={age} onChange={e => setAge(e.target.value)} />
            <span className={styles.unit}>세</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>BMI 분류 기준</label>
        <div className={styles.toggleRow} role="group" aria-label="BMI 분류 기준 선택">
          <button type="button" aria-pressed={standard === 'KOREA'}
            className={`${styles.toggleBtn} ${standard === 'KOREA' ? styles.toggleActive : ''}`}
            onClick={() => setStandard('KOREA')}>🇰🇷 대한비만학회 (권장)</button>
          <button type="button" aria-pressed={standard === 'WHO'}
            className={`${styles.toggleBtn} ${standard === 'WHO' ? styles.toggleActive : ''}`}
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
                  <div className={styles.gaugeWrap}>
                    {gaugePos !== null && (
                      <div className={styles.gaugeMarkerLabel} style={{ left: `${gaugePos}%` }}>
                        {rich.bmi.toFixed(1)}
                      </div>
                    )}
                    <div className={styles.gaugeBar}>
                      {gaugeSegs.map(s => (
                        <div key={s.id}
                          className={styles.gaugeSeg}
                          style={{ flex: s.flex, background: s.color, opacity: 0.85 }}
                        />
                      ))}
                      {gaugePos !== null && (
                        <div className={styles.gaugeMarker} style={{ left: `${gaugePos}%` }} />
                      )}
                    </div>
                  </div>
                  <div className={styles.gaugeAxis}>
                    {(standard === 'KOREA' ? [0, 18.5, 23, 25, 40] : [0, 18.5, 25, 30, 40]).map((v, i, arr) => {
                      const pct = (v / gaugeMaxBmi) * 100
                      const tx = i === 0 ? '0' : i === arr.length - 1 ? '-100%' : '-50%'
                      return (
                        <span key={v} style={{ left: `${pct}%`, transform: `translateX(${tx})` }}>
                          {v === 40 ? '40+' : v}
                        </span>
                      )
                    })}
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
                    {rich.toNormal.direction === 'in' ? '범위 내'
                      : rich.toNormal.kg === 0 ? '경계'
                      : `${rich.toNormal.direction === 'lose' ? '−' : '+'}${rich.toNormal.kg}`}
                  </div>
                  <p>{rich.toNormal.direction === 'in' ? '✓' : rich.toNormal.kg === 0 ? '⚠' : 'kg'}</p>
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
                <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                  onClick={() => copy(`키 ${Math.round(heightCm)}cm / 체중 ${Math.round(weightKg * 10) / 10}kg → BMI ${rich.bmi} (${rich.category.name})`)}>
                  {copied ? '✓ 복사됨' : '복사'}
                </button>
                <button type="button" className={styles.copyBtn} onClick={saveCurrent}>기록 저장</button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>키와 체중을 입력하세요</div>
              유효 범위: 키 {unitH === 'inch' ? '31.5~98.4in' : '80~250cm'} · 체중 {unitW === 'lb' ? '44.1~661.4lb' : '20~300kg'}
            </div>
          )}
        </>
      )}

      {/* ─────────────── 탭 2: 허리·체지방 ─────────────── */}
      {tab === 'body' && (
        <>
          <div className={styles.disclaimer}>
            <strong>허리둘레</strong>는 BMI의 한계(마른 비만·근육 우세형)를 보완하고, <strong>Navy 공식</strong>으로 체지방률을 추정합니다. 체지방률은 참고용(±3~5%)이며 정확한 측정은 InBody·DEXA를 권장합니다.
          </div>

          {/* 허리 + 목 (1줄) */}
          <div className={styles.fieldRow}>
            <div className={styles.card}>
              <label className={styles.cardLabel} htmlFor="bmi-f4">
                허리둘레
                <button type="button" aria-label="둘레 단위 전환"
                  className={`${styles.unitToggle} ${styles.unitToggleActive}`}
                  onClick={toggleWaistUnit}>{unitWaist}</button>
              </label>
              <div className={styles.inputRow}>
                <input id="bmi-f4" className={styles.numInput} type="number" inputMode="decimal"
                  placeholder={unitWaist === 'cm' ? '82' : '32'}
                  value={waist} onChange={e => setWaist(e.target.value)} />
                <span className={styles.unit}>{unitWaist}</span>
              </div>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel} htmlFor="bmi-bodyfat">목둘레 <span className={styles.cardLabelHint}>체지방용</span></label>
              <div className={styles.inputRow}>
                <input id="bmi-bodyfat" className={styles.numInput} type="number" inputMode="decimal"
                  placeholder={unitWaist === 'cm' ? '38' : '15'}
                  value={neck} onChange={e => setNeck(e.target.value)} />
                <span className={styles.unit}>{unitWaist}</span>
              </div>
            </div>
          </div>

          {gender === 'female' && (
            <div className={styles.card}>
              <label className={styles.cardLabel} htmlFor="bmi-bodyfat-2">엉덩이둘레 <span className={styles.cardLabelHint}>여성 체지방용</span></label>
              <div className={styles.inputRow}>
                <input id="bmi-bodyfat-2" className={styles.numInput} type="number" inputMode="decimal"
                  placeholder={unitWaist === 'cm' ? '95' : '37'}
                  value={hip} onChange={e => setHip(e.target.value)} />
                <span className={styles.unit}>{unitWaist}</span>
              </div>
            </div>
          )}

          <div className={styles.infoBox}>
            <strong>측정법</strong> — 허리: 배꼽 위 약 2cm(장골 능선)를 호흡 후 평행하게. 목: 후두 결절 아래. 엉덩이: 가장 두꺼운 부분. 두꺼운 옷 위 측정 X.
          </div>

          {/* 허리둘레 판정 */}
          {abdom && (
            <div className={styles.hero} style={{ borderColor: `${abdom.color}50`, background: `${abdom.color}0F` }}>
              <div className={styles.heroLabel}>허리둘레 판정</div>
              <div className={styles.heroNum} style={{ color: abdom.color, fontSize: 'clamp(40px, 10vw, 64px)' }}>
                {Math.round(waistCm * 10) / 10}<span className={styles.heroNumUnit}>cm</span>
              </div>
              <div className={styles.heroCategory} style={{ color: abdom.color }}>{abdom.name}</div>
              <div className={styles.heroSub}>{abdom.desc}</div>
              <div className={styles.heroDisclaimer}>대한비만학회 기준 — 남성 90cm·여성 85cm 이상 = 복부비만</div>
            </div>
          )}

          {/* 추정 체지방률 */}
          {bodyFat !== null && bfClass && (
            <>
              <div className={styles.hero} style={{ borderColor: `${bfClass.color}50`, background: `${bfClass.color}0F` }}>
                <div className={styles.heroLabel}>추정 체지방률</div>
                <div className={styles.heroNum} style={{ color: bfClass.color }}>
                  {bodyFat.toFixed(1)}<span className={styles.heroNumUnit}>%</span>
                </div>
                <div className={styles.heroCategory} style={{ color: bfClass.color }}>
                  {bfClass.name} ({bfClass.rangeText})
                </div>
                <div className={styles.heroDisclaimer}>Navy 공식 추정치 · ±3~5% 오차 가능</div>
              </div>

              <div className={styles.card}>
                <label className={styles.cardLabel}>{gender === 'male' ? '남성' : '여성'} 체지방률 기준</label>
                <div className={styles.bfTable}>
                  <div className={`${styles.bfRow} ${styles.headerRow}`}>
                    <span>분류</span><span style={{ textAlign: 'right' }}>남성</span><span style={{ textAlign: 'right' }}>여성</span>
                  </div>
                  {[
                    { name: '우수',     m: '<10%',   f: '<18%',   min: 0,  max: BODY_FAT_RANGES[gender].excellent },
                    { name: '좋음',     m: '10~15%', f: '18~23%', min: BODY_FAT_RANGES[gender].excellent, max: BODY_FAT_RANGES[gender].good },
                    { name: '평균',     m: '15~20%', f: '23~28%', min: BODY_FAT_RANGES[gender].good, max: BODY_FAT_RANGES[gender].average },
                    { name: '평균 이상', m: '20~25%', f: '28~33%', min: BODY_FAT_RANGES[gender].average, max: BODY_FAT_RANGES[gender].aboveAverage },
                    { name: '높음',     m: '25~30%', f: '33~38%', min: BODY_FAT_RANGES[gender].aboveAverage, max: BODY_FAT_RANGES[gender].poor },
                    { name: '위험',     m: '>30%',   f: '>38%',   min: BODY_FAT_RANGES[gender].poor, max: 999 },
                  ].map(r => {
                    const active = bodyFat >= r.min && bodyFat < r.max
                    return (
                      <div key={r.name} className={`${styles.bfRow} ${active ? styles.bfRowActive : ''}`}>
                        <span>{r.name}{active ? ' ←' : ''}</span>
                        <span style={{ textAlign: 'right' }}>{r.m}</span>
                        <span style={{ textAlign: 'right' }}>{r.f}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* 허리-신장비 */}
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
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                💡 <strong style={{ color: 'var(--text)' }}>&ldquo;허리둘레가 키의 절반을 넘지 않도록&rdquo;</strong> — 0.5 미만 유지 권장.
              </p>
            </div>
          )}

          {/* BMI×허리 종합 매트릭스 */}
          {rich && abdom && judgment && (
            <div className={styles.card}>
              <label className={styles.cardLabel}>BMI × 허리둘레 종합 해석</label>
              <div className={styles.matrix}>
                {[
                  { kind: 'healthy',        emoji: '✅', title: '건강한 체형', desc: 'BMI·허리 정상' },
                  { kind: 'skinny-fat',     emoji: '⚠️', title: '마른 비만',   desc: 'BMI 정상·허리 비만' },
                  { kind: 'muscular',       emoji: '⚠️', title: '근육 우세형', desc: 'BMI 비만·허리 정상' },
                  { kind: 'combined-obese', emoji: '🔴', title: '종합 비만',   desc: 'BMI·허리 모두 비만' },
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
              <div className={styles.infoBox} style={{ marginTop: 10, background: `${judgment.color}10`, borderColor: `${judgment.color}50` }}>
                <strong style={{ color: judgment.color }}>{judgment.emoji} {judgment.title}</strong> — {judgment.desc}
              </div>
            </div>
          )}

          {/* 체지방 정확도 안내 */}
          {bodyFat !== null && (
            <div className={styles.warnBox}>
              ⚠️ <strong>체지방률 정확도 한계</strong> — Navy 공식은 빠른 추정용이며 실제와 ±3~5% 차이가 날 수 있습니다. 정확한 분석은 <strong>InBody (±2~3%)</strong>·<strong>DEXA (±1~2%)</strong>를 권장합니다.
            </div>
          )}

          {/* 입력 안내 */}
          {!waistCm && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>허리둘레를 입력하세요</div>
              허리둘레로 복부비만·허리-신장비를, 목둘레{gender === 'female' ? '·엉덩이둘레' : ''}까지 입력하면 체지방률을 추정합니다.
            </div>
          )}
        </>
      )}

      {/* ─────────────── 탭 3: 체중 시뮬레이터 ─────────────── */}
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
                aria-label="시뮬 체중"
                aria-valuetext={`${simWeight.toFixed(1)}kg`}
                min={Math.max(20, weightKg - 20).toFixed(0)}
                max={(weightKg + 20).toFixed(0)}
                step="0.5"
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
                aria-label="주당 변화 페이스"
                aria-valuetext={`주당 ${perWeek > 0 ? '+' : ''}${perWeek.toFixed(1)}kg`}
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
                  type="button" aria-pressed={Math.abs(perWeek - o.v) < 0.05}
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
                  type="button" aria-pressed={totalWeeks === w}
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

      {/* 히스토리 (모든 탭 공통) */}
      {history.length > 0 && (
        <div className={styles.card}>
          <label className={styles.cardLabel}>
            저장된 기록 ({history.length}/60)
            <button type="button" className={`${styles.miniBtn} ${styles.miniDanger}`} onClick={clearHistory}>전체 삭제</button>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.slice(0, 8).map(h => (
              <div key={h.id} className={styles.historyRow}>
                <span className={styles.historyName}>
                  {h.weight}kg · {h.height}cm
                  <small>· {new Date(h.date).toLocaleDateString('ko-KR')}{h.waist ? ` · 허리 ${h.waist}cm` : ''}{h.bodyFat !== undefined ? ` · 체지방 ${h.bodyFat}%` : ''}</small>
                </span>
                <span className={styles.historyVal}>BMI {h.bmi}</span>
                <button type="button" className={styles.miniBtn} onClick={() => removeHistory(h.id)}>×</button>
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
