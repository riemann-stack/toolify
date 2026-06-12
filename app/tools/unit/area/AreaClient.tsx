'use client'

import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo } from 'react'
import styles from './area.module.css'

const PYEONG_TO_SQM = 3.305785  // 1평 = 400/121 ㎡
const QUICK_SQM = [39, 49, 59, 74, 84, 102, 114, 135]

const APT_SIZES = [
  { sqm: 39,  pyeong: 11.79, name: '11평형',  desc: '원룸·청년주택', usage: '1인 가구·신혼' },
  { sqm: 49,  pyeong: 14.82, name: '14평형',  desc: '신혼·1인 가구', usage: '1~2인 가구' },
  { sqm: 59,  pyeong: 17.85, name: '24평형',  desc: '소형 (전용 59 = 분양 24)', usage: '소형 가족' },
  { sqm: 74,  pyeong: 22.39, name: '29평형',  desc: '소형~중소형',   usage: '3인 가구' },
  { sqm: 84,  pyeong: 25.41, name: '34평형 ⭐', desc: '국민평형 (전용 84 = 분양 34)', usage: '4인 가구 (가장 흔함)' },
  { sqm: 102, pyeong: 30.87, name: '40평형',  desc: '중대형',        usage: '4~5인 가구' },
  { sqm: 114, pyeong: 34.49, name: '45평형',  desc: '대형',          usage: '대가족' },
  { sqm: 135, pyeong: 40.84, name: '50평형',  desc: '대형',          usage: '대가족·부유층' },
  { sqm: 158, pyeong: 47.80, name: '60평형',  desc: '초대형',        usage: '초대형 주택' },
  { sqm: 198, pyeong: 59.90, name: '70평형',  desc: '펜트하우스급',   usage: '럭셔리 펜트하우스' },
]

type Tab = 'convert' | 'apt-table' | 'area-types' | 'room-guide'

const TABS: { id: Tab; name: string; icon: string }[] = [
  { id: 'convert',    name: '면적 변환',  icon: '🔄' },
  { id: 'apt-table',  name: '아파트 평형표', icon: '🏢' },
  { id: 'area-types', name: '전용·공급·계약', icon: '📐' },
  { id: 'room-guide', name: '평형별 방 가이드', icon: '🛋️' },
]

const fmt = (n: number) => {
  const fixed = Math.round(n * 100) / 100
  return fixed.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AreaClient() {
  const [tab, setTab] = useState<Tab>('convert')

  // 양방향 — sqm 또는 pyeong 중 하나가 source
  const [sqm, setSqm] = useState('84')
  const [pyeong, setPyeong] = useState('')
  const [activeInput, setActiveInput] = useState<'sqm' | 'pyeong'>('sqm')

  const result = useMemo(() => {
    if (activeInput === 'sqm') {
      const s = parseFloat(sqm)
      if (!Number.isFinite(s) || s <= 0) return null
      const p = s / PYEONG_TO_SQM
      return { sqm: s, pyeong: Math.round(p * 100) / 100 }
    } else {
      const p = parseFloat(pyeong)
      if (!Number.isFinite(p) || p <= 0) return null
      const s = p * PYEONG_TO_SQM
      return { sqm: Math.round(s * 100) / 100, pyeong: p }
    }
  }, [sqm, pyeong, activeInput])

  const matchedApt = useMemo(() => {
    if (!result) return null
    return APT_SIZES.reduce<typeof APT_SIZES[0] | null>((best, apt) => {
      const dist = Math.abs(apt.sqm - result.sqm)
      if (best === null) return apt
      const bestDist = Math.abs(best.sqm - result.sqm)
      return dist < bestDist ? apt : best
    }, null)
  }, [result])

  const handleSqmChange = (v: string) => {
    setSqm(v); setActiveInput('sqm')
    const n = parseFloat(v)
    if (Number.isFinite(n) && n > 0) {
      setPyeong(String(Math.round((n / PYEONG_TO_SQM) * 100) / 100))
    }
  }
  const handlePyeongChange = (v: string) => {
    setPyeong(v); setActiveInput('pyeong')
    const n = parseFloat(v)
    if (Number.isFinite(n) && n > 0) {
      setSqm(String(Math.round((n * PYEONG_TO_SQM) * 100) / 100))
    }
  }

  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* */ }
  }

  return (
    <div className={styles.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/unit/converter', label: '단위 변환기' },
          { href: '/tools/unit/area', label: '면적 단위' },
          { href: '/tools/unit/fuel-economy', label: '연비 변환' }
        ]}
      >
        1평 = 400/121 ㎡ ≈ 3.306㎡
      </Disclaimer>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.id}
            className={`${styles.tabBtn} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}>
            <span style={{ marginRight: 4 }}>{t.icon}</span>{t.name}
          </button>
        ))}
      </div>

      {/* ──────── 탭 1: 면적 변환 ──────── */}
      {tab === 'convert' && (
        <>
          <div className={styles.fieldRow}>
            <div className={styles.card}>
              <label className={styles.cardLabel} htmlFor="area-f1">제곱미터 (㎡)</label>
              <input id="area-f1" className={styles.numInput} type="number" inputMode="decimal"
                placeholder="84" value={sqm} onChange={e => handleSqmChange(e.target.value)} />
              <span className={styles.unit}>㎡</span>
            </div>
            <div className={styles.card}>
              <label className={styles.cardLabel} htmlFor="area-f2">평</label>
              <input id="area-f2" className={styles.numInput} type="number" inputMode="decimal"
                placeholder="25.41" value={pyeong} onChange={e => handlePyeongChange(e.target.value)} />
              <span className={styles.unit}>평</span>
            </div>
          </div>

          <div className={styles.card}>
            <label className={styles.cardLabel}>빠른 변환 (전용면적 기준)</label>
            <div className={styles.quickRow}>
              {QUICK_SQM.map(v => (
                <button key={v}
                  className={`${styles.quickChip} ${parseFloat(sqm) === v ? styles.quickChipActive : ''}`}
                  onClick={() => handleSqmChange(String(v))}>
                  {v}㎡
                </button>
              ))}
            </div>
          </div>

          {result && (
            <>
              <div className={styles.hero} role="status">
                <div className={styles.heroLabel}>면적 변환 결과</div>
                <div className={styles.heroNum}>
                  {fmt(result.sqm)}<span className={styles.heroUnit}>㎡</span>
                  <span style={{ fontSize: '0.5em', color: 'var(--muted)', margin: '0 8px' }}>=</span>
                  {fmt(result.pyeong)}<span className={styles.heroUnit}>평</span>
                </div>
                {matchedApt && Math.abs(matchedApt.sqm - result.sqm) <= 5 && (
                  <div className={styles.heroSub}>
                    가장 가까운 한국 평형: <strong>{matchedApt.name}</strong> · {matchedApt.usage}
                  </div>
                )}
              </div>

              <button className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
                onClick={() => copy(`${fmt(result.sqm)}㎡ = ${fmt(result.pyeong)}평`)}>
                {copied ? '✓ 복사됨' : '📋 복사'}
              </button>
            </>
          )}

          <div className={styles.infoBox}>
            💡 <strong>변환 공식</strong> — 평 → ㎡: 평수 × 3.3058 / ㎡ → 평: 면적 ÷ 3.3058. 정확히는 1평 = 400/121 ㎡로 계산됩니다.
          </div>
        </>
      )}

      {/* ──────── 탭 2: 아파트 평형표 ──────── */}
      {tab === 'apt-table' && (
        <>
          <div className={styles.disclaimer}>
            🏢 <strong>한국 아파트는 전용면적 기준</strong>으로 분양됩니다. &lsquo;34평형&rsquo;은 보통 전용 84㎡ + 공용 약 26㎡ 합계로 분양면적이 약 110㎡ 수준입니다.
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">전용면적</th>
                  <th scope="col">평수</th>
                  <th scope="col">일반 호칭</th>
                  <th scope="col">가구 유형</th>
                </tr>
              </thead>
              <tbody>
                {APT_SIZES.map((apt, i) => {
                  const isCurrent = result && Math.abs(apt.sqm - result.sqm) <= 3
                  return (
                    <tr key={i} className={isCurrent ? styles.tableRowActive : ''}>
                      <td><strong>{apt.sqm}㎡</strong></td>
                      <td>{fmt(apt.pyeong)}평</td>
                      <td className={styles.tableHighlight}>{apt.name}</td>
                      <td className={styles.tableMuted}>{apt.usage}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.infoBox}>
            ⭐ <strong>국민평형 34평형 (전용 84㎡)</strong> — 한국 아파트에서 가장 흔한 평형. 보통 4인 가구 기준이며 방 3개·욕실 2개·거실·주방 구성이 표준입니다.
          </div>
        </>
      )}

      {/* ──────── 탭 3: 전용·공급·계약 ──────── */}
      {tab === 'area-types' && (
        <>
          <div className={styles.disclaimer}>
            📐 <strong>면적 표기 3가지</strong> — 전용 / 공급 / 계약. 같은 아파트도 어떤 기준이냐에 따라 평수가 크게 달라집니다.
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">면적 종류</th>
                  <th scope="col">포함 항목</th>
                  <th scope="col">예 (84㎡ 기준)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#059669' }}>전용면적</strong></td>
                  <td>거실·방·주방·화장실·발코니</td>
                  <td>약 84.96㎡ <small style={{ color: 'var(--muted)' }}>(약 25.7평)</small></td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#A16207' }}>주거공용</strong></td>
                  <td>계단·복도·엘리베이터</td>
                  <td>약 25㎡</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--accent)' }}>공급면적</strong></td>
                  <td>전용 + 주거공용 (분양 평수)</td>
                  <td>약 110㎡ <small style={{ color: 'var(--muted)' }}>(약 33평)</small></td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#EA580C' }}>기타공용</strong></td>
                  <td>지하주차장·관리실·놀이터</td>
                  <td>약 50㎡</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#DC2626' }}>계약면적</strong></td>
                  <td>공급 + 기타공용 (분양가 산정)</td>
                  <td>약 160㎡ <small style={{ color: 'var(--muted)' }}>(약 48평)</small></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.cardGrid}>
            {[
              { name: '✅ 실거주 면적이 궁금할 때', use: '전용면적', color: '#059669' },
              { name: '🏷️ 분양·매매 광고 평수', use: '공급면적', color: 'var(--accent)' },
              { name: '💰 분양가 비교·재산세', use: '계약면적', color: '#DC2626' },
            ].map((c, i) => (
              <div key={i} className={styles.guideCard} style={{ borderColor: `${c.color}40` }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>→ {c.use} 기준</p>
              </div>
            ))}
          </div>

          <div className={styles.infoBox}>
            💡 <strong>주의</strong> — 같은 &lsquo;34평 아파트&rsquo;도 전용면적 기준이면 약 25평, 공급면적 기준이면 34평, 계약면적 기준이면 48평입니다. <strong>광고에서 보는 평수는 보통 공급면적</strong>이며, 등기부등본은 전용면적입니다.
          </div>
        </>
      )}

      {/* ──────── 탭 4: 평형별 방 가이드 ──────── */}
      {tab === 'room-guide' && (
        <>
          <div className={styles.disclaimer}>
            🛋️ <strong>평형별 방 크기·가구 가이드</strong> — 어떤 평수에 어떤 가구가 들어가는지 한눈에 비교.
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">평형</th>
                  <th scope="col">방 개수</th>
                  <th scope="col">거실 크기</th>
                  <th scope="col">추천 가구</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['11평 (39㎡)', '1', '작음', '1인 침대·소형 식탁'],
                  ['17평 (59㎡)', '2~3', '작음', '2인용 식탁·1.5인 침대'],
                  ['24평 (84㎡)', '3', '중간', '4인 식탁·퀸 침대·소파'],
                  ['30평+ (102㎡)', '3~4', '큼', '6인 식탁·드레스룸 가능'],
                  ['40평+ (135㎡)', '4+', '매우 큼', '별도 서재·홈오피스 가능'],
                ].map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row[0]}</strong></td>
                    <td>{row[1]}</td>
                    <td className={styles.tableMuted}>{row[2]}</td>
                    <td className={styles.tableMuted}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.infoBox}>
            💡 <strong>인테리어·가구 배치 팁</strong> — 24평(84㎡) 미만은 다용도 가구(소파베드·확장식 식탁) 활용 권장. 30평 이상은 가구 비례를 신중히 고려하지 않으면 공간이 빈 듯 보일 수 있습니다.
          </div>
        </>
      )}
    </div>
  )
}
