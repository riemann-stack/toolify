'use client'

import { useMemo, useState } from 'react'
import styles from './converter.module.css'
import {
  CategoryId, CATEGORIES, QUICK_CONVERSIONS,
  convert, formatNumber,
} from './converterUtils'

export default function ConverterClient() {
  const [categoryId, setCategoryId] = useState<CategoryId>('length')
  const [inputValue, setInputValue] = useState('100')
  const [fromUnitId, setFromUnitId] = useState('cm')
  const [showKorean, setShowKorean] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const category = useMemo(
    () => CATEGORIES.find(c => c.id === categoryId)!,
    [categoryId],
  )

  const fromUnit = useMemo(
    () => category.units.find(u => u.id === fromUnitId) ?? category.units[0],
    [category, fromUnitId],
  )

  const value = useMemo(() => {
    const n = parseFloat(inputValue)
    return Number.isFinite(n) ? n : 0
  }, [inputValue])

  const results = useMemo(() => {
    return category.units.map(u => ({
      unit: u,
      value: convert(value, fromUnit, u, categoryId),
      isSource: u.id === fromUnit.id,
    }))
  }, [category, fromUnit, value, categoryId])

  const visibleResults = useMemo(() => {
    if (showKorean) return results
    return results.filter(r => !r.unit.isKorean)
  }, [results, showKorean])

  const handleCategoryChange = (id: CategoryId) => {
    const newCat = CATEGORIES.find(c => c.id === id)!
    setCategoryId(id)
    // 카테고리 변경 시 첫 단위로 초기화
    setFromUnitId(newCat.units[0].id)
  }

  const handleQuickClick = (q: typeof QUICK_CONVERSIONS[number]) => {
    setCategoryId(q.from.categoryId)
    setFromUnitId(q.from.unitId)
    setInputValue(String(q.from.value))
  }

  const copyResult = async (id: string, value: number, unit: string) => {
    try {
      await navigator.clipboard.writeText(`${formatNumber(value)} ${unit}`)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch { /* */ }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.disclaimer}>
        <strong>9개 카테고리</strong> 통합 단위 변환기 — 길이·면적·무게·부피·온도·시간·속도·압력·데이터 + <strong>한국 전통 단위</strong>(자·척·근·돈·홉·되·평) 포함. 모든 값은 SI 기준 환산이며 일부 한국 단위는 시대·지역별 차이가 있습니다.
      </div>

      {/* 카테고리 탭 */}
      <div className={styles.tabs}>
        {CATEGORIES.map(c => (
          <button key={c.id}
            className={`${styles.tabBtn} ${categoryId === c.id ? styles.tabActive : ''}`}
            onClick={() => handleCategoryChange(c.id)}>
            <span style={{ marginRight: 4 }}>{c.icon}</span>{c.name}
          </button>
        ))}
      </div>

      {/* 빠른 변환 칩 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          빠른 변환
          <span className={styles.cardLabelHint}>자주 쓰는 변환 한 번에</span>
        </label>
        <div className={styles.quickRow}>
          {QUICK_CONVERSIONS.map((q, i) => (
            <button key={i} className={styles.quickChip} onClick={() => handleQuickClick(q)}>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          {category.icon} {category.name} 변환
          {category.units.some(u => u.isKorean) && (
            <label className={styles.toggleLabel}>
              <input type="checkbox" checked={showKorean}
                onChange={e => setShowKorean(e.target.checked)} />
              한국 단위 함께 표시
            </label>
          )}
        </label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="decimal"
            value={inputValue} onChange={e => setInputValue(e.target.value)}
            placeholder="값 입력" />
          <select className={styles.unitSelect}
            value={fromUnitId}
            onChange={e => setFromUnitId(e.target.value)}>
            {category.units.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.shortName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 결과 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>
          변환 결과
          <span className={styles.cardLabelHint}>{value} {fromUnit.shortName} 입력 기준</span>
        </label>
        <div className={styles.resultGrid}>
          {visibleResults.map(r => (
            <div key={r.unit.id}
              className={`${styles.resultRow} ${r.isSource ? styles.resultRowSource : r.unit.isKorean ? styles.resultRowKorean : ''}`}
              onClick={() => copyResult(r.unit.id, r.value, r.unit.shortName)}>
              <span className={styles.resultUnit}>
                {r.unit.name}
                {r.unit.note && <small>{r.unit.note}</small>}
              </span>
              <span className={styles.resultValue}>
                {formatNumber(r.value)} <span style={{ fontSize: '0.7em', color: 'var(--muted)' }}>{r.unit.shortName}</span>
              </span>
              <button className={styles.resultCopy}
                onClick={e => { e.stopPropagation(); copyResult(r.unit.id, r.value, r.unit.shortName) }}>
                {copiedId === r.unit.id ? '✓' : '📋'}
              </button>
            </div>
          ))}
        </div>

        {category.units.some(u => u.isKorean) && showKorean && (
          <div className={styles.koreanNote}>
            <strong>한국 전통·생활 단위 안내</strong> — 보라색으로 표시된 단위는 한국 전통(자·척·근·돈·홉·되·평) 또는 생활(종이컵·소주잔·밥숟가락) 단위입니다.
            {categoryId === 'weight' && ' 1근의 경우 시대·용도에 따라 400g·500g·600g으로 다르게 사용되며, 본 도구는 한국 시장 관행 600g을 기준으로 합니다.'}
            {categoryId === 'length' && ' 한국 1리(393m)는 일본 1리(3,927m)와 다르므로 옛 문헌 해석 시 주의가 필요합니다.'}
          </div>
        )}
      </div>

      {/* 카테고리별 정보 */}
      {categoryId === 'temperature' && (
        <div className={styles.infoBox}>
          💡 <strong>온도 변환 공식</strong> — ℉ = ℃ × 9/5 + 32 / K = ℃ + 273.15. 일상에서 자주 쓰는 환산: <strong>0℃ = 32℉</strong>(어는점) · <strong>100℃ = 212℉</strong>(끓는점) · <strong>37℃ = 98.6℉</strong>(체온).
        </div>
      )}
      {categoryId === 'data' && (
        <div className={styles.infoBox}>
          💡 <strong>1024 vs 1000 차이</strong> — KB·MB·GB는 SI(1,000)로 정의되지만 OS·메모리는 1,024 단위를 쓰는 경우가 많습니다. 정확한 표기는 <strong>KiB·MiB·GiB</strong>(1024)이지만 마케팅·하드디스크는 KB(1000)를 사용해 차이가 발생합니다.
        </div>
      )}
      {categoryId === 'speed' && (
        <div className={styles.infoBox}>
          🏃 <strong>일상 속도 어림값</strong> — 걷기 4km/h · 빠른 걷기 6km/h · 조깅 8km/h · 러닝 10km/h · 자전거 15~25km/h · 자동차 60~100km/h.
        </div>
      )}
      {categoryId === 'pressure' && (
        <div className={styles.infoBox}>
          💨 <strong>일상 압력 참고</strong> — 자동차 타이어 약 30~36 psi (2.07~2.48 bar) · 혈압 정상 약 120/80 mmHg · 1기압(atm) = 1.013 bar = 760 mmHg.
        </div>
      )}
      {categoryId === 'time' && (
        <div className={styles.infoBox}>
          ⏱️ <strong>근무시간 변환</strong> — 한국 표준 주 40시간 / 월 209시간(주휴 포함) / 연 2,508시간. 시급 환산은 <a href="/tools/finance/salary" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>연봉 실수령액 계산기</a>의 [시급] 탭 활용을 권장합니다.
        </div>
      )}
    </div>
  )
}
