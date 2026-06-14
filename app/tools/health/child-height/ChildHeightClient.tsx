'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './childHeight.module.css'
import {
  Sex,
  predictHeight, heightBand, midParent, diffFromKrAverage,
  parseHeight, round1,
  KR_ADULT_AVG, BAND, MALE_ADJ,
} from './childHeightUtils'

const STORAGE_KEY = 'youtil:child-height:last-v1'

interface Saved {
  sex: Sex
  fatherHeight: string
  motherHeight: string
  compare: boolean
}

function isSex(v: unknown): v is Sex {
  return v === 'male' || v === 'female'
}

function loadSaved(): Saved | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw)
    if (!o || typeof o !== 'object') return null
    const sex = isSex(o.sex) ? o.sex : 'male'
    const fatherHeight = typeof o.fatherHeight === 'string' ? o.fatherHeight : ''
    const motherHeight = typeof o.motherHeight === 'string' ? o.motherHeight : ''
    const compare = typeof o.compare === 'boolean' ? o.compare : false
    return { sex, fatherHeight, motherHeight, compare }
  } catch {
    return null
  }
}

function saveLast(s: Saved) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* */
  }
}

export default function ChildHeightClient() {
  const [sex, setSex] = useState<Sex>('male')
  const [fatherHeight, setFatherHeight] = useState('')
  const [motherHeight, setMotherHeight] = useState('')
  const [compare, setCompare] = useState(false)
  const [copied, setCopied] = useState(false)

  /* 마지막 입력 복원 */
  useEffect(() => {
    const s = loadSaved()
    if (s) {
      setSex(s.sex)
      setFatherHeight(s.fatherHeight)
      setMotherHeight(s.motherHeight)
      setCompare(s.compare)
    }
  }, [])

  /* 입력 변경 시 저장 */
  useEffect(() => {
    saveLast({ sex, fatherHeight, motherHeight, compare })
  }, [sex, fatherHeight, motherHeight, compare])

  /* 정규화된 키(cm) — 클램프 포함 */
  const fH = useMemo(() => parseHeight(fatherHeight), [fatherHeight])
  const mH = useMemo(() => parseHeight(motherHeight), [motherHeight])

  /* 결과 (양쪽 키가 모두 유효할 때만) */
  const result = useMemo(() => {
    if (fH === null || mH === null) return null
    const th = predictHeight(fH, mH, sex)
    const band = heightBand(th)
    const mid = midParent(fH, mH)
    const diff = diffFromKrAverage(th, sex)
    return {
      th: round1(th),
      low: round1(band.low),
      high: round1(band.high),
      mid: round1(mid),
      diff: round1(diff),
      maleTh: round1(predictHeight(fH, mH, 'male')),
      femaleTh: round1(predictHeight(fH, mH, 'female')),
    }
  }, [fH, mH, sex])

  /* 게이지 위치 — 밴드 전폭 17cm(=2×8.5) 안에서 중앙값은 항상 가운데(50%) */
  const markerPct = 50

  const copy = async () => {
    if (!result) return
    const sexLabel = sex === 'male' ? '아들' : '딸'
    const text = `${sexLabel} 예상 키 약 ${result.th.toFixed(1)}cm (범위 ${result.low.toFixed(1)}~${result.high.toFixed(1)}cm) — 중간부모키(MPH) 추정, 의학 진단 아님`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* */
    }
  }

  const krAvg = KR_ADULT_AVG[sex]
  const sexLabel = sex === 'male' ? '남아(아들)' : '여아(딸)'

  return (
    <div className={styles.wrap}>
      {/* 성별 */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>자녀 성별</span>
        <div className={styles.toggleRow} role="group" aria-label="자녀 성별 선택">
          <button
            type="button"
            aria-pressed={sex === 'male'}
            className={`${styles.toggleBtn} ${sex === 'male' ? styles.toggleActive : ''}`}
            onClick={() => setSex('male')}
          >
            👦 남아(아들)
          </button>
          <button
            type="button"
            aria-pressed={sex === 'female'}
            className={`${styles.toggleBtn} ${sex === 'female' ? styles.toggleActive : ''}`}
            onClick={() => setSex('female')}
          >
            👧 여아(딸)
          </button>
        </div>
      </div>

      {/* 부모 키 입력 */}
      <div className={styles.fieldRow}>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="ch-father">
            아버지 키
          </label>
          <div className={styles.inputRow}>
            <input
              id="ch-father"
              className={styles.numInput}
              type="text"
              inputMode="decimal"
              placeholder="예: 175"
              value={fatherHeight}
              onChange={(e) => setFatherHeight(e.target.value)}
            />
            <span className={styles.unit}>cm</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel} htmlFor="ch-mother">
            어머니 키
          </label>
          <div className={styles.inputRow}>
            <input
              id="ch-mother"
              className={styles.numInput}
              type="text"
              inputMode="decimal"
              placeholder="예: 162"
              value={motherHeight}
              onChange={(e) => setMotherHeight(e.target.value)}
            />
            <span className={styles.unit}>cm</span>
          </div>
        </div>
      </div>

      {/* 비교 모드 토글 */}
      <button
        type="button"
        aria-pressed={compare}
        className={`${styles.compareToggle} ${compare ? styles.compareToggleActive : ''}`}
        onClick={() => setCompare((v) => !v)}
      >
        <span>아들·딸 모두 보기 (약 {MALE_ADJ}cm 차)</span>
        <span className={styles.compareToggleState}>{compare ? 'ON' : 'OFF'}</span>
      </button>

      {result ? (
        <>
          {/* 주 히어로 — role="status" 1개 */}
          <div
            className={styles.hero}
            role="status"
            style={{ borderColor: 'var(--accent)', background: 'var(--accent-dim)' }}
          >
            <div className={styles.heroLabel}>{sexLabel} 예상 성인 키</div>
            <div className={styles.heroNum}>
              {result.th.toFixed(1)}
              <span className={styles.heroNumUnit}>cm</span>
            </div>
            <div className={styles.heroSub}>
              중간부모키(MPH) 공식 기반 통계적 추정 중앙값
            </div>
            <div className={styles.heroDisclaimer}>
              * 의학적 진단이 아니며, 실제 키는 다양한 변수에 좌우됩니다
            </div>
          </div>

          {/* 예측 범위 밴드 + 게이지 */}
          <div className={styles.card}>
            <span className={styles.cardLabel}>예측 범위 (±{BAND}cm)</span>
            <div className={styles.bandLabel}>
              약 {result.low.toFixed(1)} ~ {result.high.toFixed(1)}cm
            </div>
            <div className={styles.bandSub}>약 3~97 백분위에 해당하는 분포 범위</div>
            <div className={styles.bandGauge}>
              <div className={styles.bandTrack} />
              <div className={styles.bandFill} style={{ left: '0%', right: '0%' }} />
              <div className={styles.bandMarker} style={{ left: `${markerPct}%` }} />
            </div>
            <div className={styles.bandTicks}>
              <span>{result.low.toFixed(1)}</span>
              <span>{result.th.toFixed(1)}</span>
              <span>{result.high.toFixed(1)}</span>
            </div>
          </div>

          {/* 보조 카드 — 중간키 원값 + 한국 평균 대비 차이 */}
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <small>부모 중간키</small>
              <div>{result.mid.toFixed(1)}</div>
              <p>cm · (부+모)÷2</p>
            </div>
            <div className={styles.detailItem}>
              <small>한국 평균 대비</small>
              <div style={{ color: 'var(--accent-ink)' }}>
                {result.diff >= 0 ? '+' : '−'}
                {Math.abs(result.diff).toFixed(1)}
              </div>
              <p>cm · 평균 {krAvg}cm 참고치</p>
            </div>
          </div>

          <div className={styles.infoBox}>
            부모 중간키 <strong>{result.mid.toFixed(1)}cm</strong>에 성별 보정
            {sex === 'male' ? ` +${MALE_ADJ}cm` : ` −${MALE_ADJ}cm`}를 적용한 값입니다.
            보정 {MALE_ADJ}cm는 성인 남녀의 평균 신장차로, {sex === 'male' ? '아들은 더하고' : '딸은 빼서'} 추정합니다.
          </div>

          <p className={styles.refNote}>
            ⓘ 한국 성인 {sex === 'male' ? '남성' : '여성'} 평균 약 <strong>{krAvg}cm</strong>(참고치)
            대비 {result.diff >= 0 ? '+' : '−'}{Math.abs(result.diff).toFixed(1)}cm입니다. 단순 차이일 뿐 백분위·우열을 뜻하지 않습니다.
          </p>

          {/* 비교 모드 — 아들·딸 동시 */}
          {compare && (
            <div className={styles.card}>
              <span className={styles.cardLabel}>아들 · 딸 예상키 비교</span>
              <div className={styles.compareGrid}>
                <div className={styles.compareCard}>
                  <div className={styles.compareCardSex}>👦 아들 예상키</div>
                  <div className={styles.compareCardNum}>
                    {result.maleTh.toFixed(1)}
                    <span className={styles.compareCardUnit}>cm</span>
                  </div>
                  <div className={styles.compareCardBand}>
                    {round1(result.maleTh - BAND).toFixed(1)} ~ {round1(result.maleTh + BAND).toFixed(1)}cm
                  </div>
                </div>
                <div className={styles.compareCard}>
                  <div className={styles.compareCardSex}>👧 딸 예상키</div>
                  <div className={styles.compareCardNum}>
                    {result.femaleTh.toFixed(1)}
                    <span className={styles.compareCardUnit}>cm</span>
                  </div>
                  <div className={styles.compareCardBand}>
                    {round1(result.femaleTh - BAND).toFixed(1)} ~ {round1(result.femaleTh + BAND).toFixed(1)}cm
                  </div>
                </div>
              </div>
              <p className={styles.refNote} style={{ marginTop: 10 }}>
                같은 부모라도 아들·딸 예상키는 성별 보정({MALE_ADJ}cm) 때문에 정확히 {MALE_ADJ}cm 차이가 납니다.
              </p>
            </div>
          )}

          <button
            type="button"
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
            onClick={copy}
          >
            {copied ? '✓ 복사됨' : '📋 결과 복사'}
          </button>
        </>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>아버지·어머니 키를 입력하세요</div>
          두 분의 키(cm)를 모두 입력하면 {sexLabel} 예상 성인 키와 ±{BAND}cm 범위를 계산합니다. (입력 범위 100~220cm)
        </div>
      )}

      {/* 간이 두배법 안내 — 계산이 아닌 텍스트 안내 */}
      <div className={styles.tipBox}>
        <div className={styles.tipBoxTitle}>📐 간이 두배법 (참고용 · 계산 입력 아님)</div>
        <ul className={styles.tipBoxList}>
          <li>· 남아: <strong>만 2세 키 × 2</strong> ≈ 성인 키</li>
          <li>· 여아: <strong>만 18개월(1.5세) 키 × 2</strong> ≈ 성인 키</li>
        </ul>
        <p className={styles.tipBoxNote}>
          오래 알려진 어림법이지만 개인차가 커 정확도가 낮습니다. 위 MPH 계산과는 별개의 참고용 방법으로,
          이 도구의 예상키 계산에는 반영되지 않습니다.
        </p>
      </div>
    </div>
  )
}
