'use client'

import { useState, useMemo, useId } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  BANDS, OVERALL_MEAN, MMA_2024_MEAN, calcHeightRank, rankAcrossBands, stdNormalCdf,
  type Gender,
} from './heightRankData'
import s from './height-rank.module.css'

/** 정규분포 곡선 SVG (실측 평균·SD 축) */
function BellCurve({ mean, sd, height }: { mean: number; sd: number; height: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const W = 400, H = 130, PAD = 10
  const xMin = mean - 4 * sd, xMax = mean + 4 * sd
  const xToPx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - PAD * 2)
  const pdf = (x: number) => Math.exp(-((x - mean) ** 2) / (2 * sd * sd))
  const steps = 80
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const x = xMin + ((xMax - xMin) * i) / steps
    const y = H - PAD - pdf(x) * (H - PAD * 2)
    pts.push(`${xToPx(x).toFixed(1)},${y.toFixed(1)}`)
  }
  const curve = pts.join(' ')
  const hx = Math.min(Math.max(height, xMin), xMax)
  const hPx = xToPx(hx)
  const hY = H - PAD - pdf(hx) * (H - PAD * 2)
  const areaPts = pts.filter((_, i) => xMin + ((xMax - xMin) * i) / steps <= hx)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={s.curve} role="img"
      aria-label={`평균 ${mean}cm 정규분포 곡선에서 내 키 ${height}cm 위치`}>
      <defs>
        <linearGradient id={`hr-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {areaPts.length > 1 && (
        <polygon
          points={`${PAD},${H - PAD} ${areaPts.join(' ')} ${areaPts[areaPts.length - 1].split(',')[0]},${H - PAD}`}
          fill={`url(#hr-fill-${uid})`}
        />
      )}
      <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth="2" />
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--border)" strokeWidth="1" />
      <line x1={hPx} y1={hY} x2={hPx} y2={H - PAD} stroke="var(--danger)" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx={hPx} cy={hY} r="4" fill="var(--danger)" />
      {[mean - 2 * sd, mean, mean + 2 * sd].map((tick, i) => (
        <text key={i} x={xToPx(tick)} y={H - 1} textAnchor="middle"
          fontSize="9" fill="var(--muted)" fontFamily="Inter, sans-serif">
          {tick.toFixed(0)}
        </text>
      ))}
    </svg>
  )
}

export default function HeightRankClient() {
  const [gender, setGender] = useState<Gender>('M')
  const [bandId, setBandId] = useState('25-29')
  const [height, setHeight] = useState('')

  const result = useMemo(() => calcHeightRank(gender, bandId, height), [gender, bandId, height])
  const across = useMemo(() => rankAcrossBands(gender, height), [gender, height])
  const band = BANDS[gender].find((b) => b.id === bandId)!
  const h = parseFloat(height)

  const topLabel = (p: number, clamped: 'top' | 'bottom' | null) => {
    if (clamped === 'top') return '상위 0.1% 이내'
    if (clamped === 'bottom') return '하위 0.1% 이내'
    return `상위 ${p.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
  }

  return (
    <div className={s.wrap}>
      {/* 입력 */}
      <div className={s.card}>
        <div className={s.genderRow} role="group" aria-label="성별 선택">
          <button type="button" className={`${s.genderBtn} ${gender === 'M' ? s.on : ''}`}
            aria-pressed={gender === 'M'} onClick={() => setGender('M')}>남성</button>
          <button type="button" className={`${s.genderBtn} ${gender === 'F' ? s.on : ''}`}
            aria-pressed={gender === 'F'} onClick={() => setGender('F')}>여성</button>
        </div>

        <div className={s.bandGrid} role="group" aria-label="연령대 선택">
          {BANDS[gender].map((b) => (
            <button key={b.id} type="button"
              className={`${s.bandBtn} ${b.id === bandId ? s.on : ''}`}
              aria-pressed={b.id === bandId}
              onClick={() => setBandId(b.id)}>
              {b.label}
            </button>
          ))}
        </div>

        <div className={s.heightRow}>
          <label className={s.heightLabel} htmlFor="hr-height">내 키</label>
          <input id="hr-height" className={s.heightInput}
            type="text" inputMode="decimal" placeholder={band.mean.toFixed(0)}
            value={height}
            onChange={(e) => setHeight(e.target.value.replace(/[^0-9.]/g, ''))} />
          <span className={s.unit}>cm</span>
        </div>
        {result?.warning && <p className={s.warn} role="alert">⚠️ {result.warning}</p>}
      </div>

      {/* 결과 히어로 */}
      <div className={s.resultCard} role="status">
        <p className={s.resultLabel}>
          같은 {gender === 'M' ? '남성' : '여성'} {band.label} 중에서
        </p>
        {result && !result.warning ? (
          <>
            <p className={s.hero}>
              {result.clamped ? topLabel(result.topPct, result.clamped) : (
                <>상위 {result.topPct.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<span className={s.heroUnit}>%</span></>
              )}
            </p>
            <p className={s.resultSub}>
              100명이 키순으로 서면 <strong>앞에서 약 {result.rankIn100}번째</strong> ·
              평균 {band.mean.toFixed(1)}cm보다 {result.diff >= 0 ? `${result.diff.toFixed(1)}cm 큼` : `${Math.abs(result.diff).toFixed(1)}cm 작음`}
            </p>
            {isFinite(h) && h > 0 && (
              <div className={s.curveBox}>
                <BellCurve mean={band.mean} sd={band.sd} height={h} />
                <p className={s.curveNote}>
                  {gender === 'M' ? '남성' : '여성'} {band.label} 분포 (평균 {band.mean.toFixed(1)} · 표준편차 {band.sd.toFixed(1)}cm, 표본 {band.n.toLocaleString('ko-KR')}명)
                </p>
              </div>
            )}
            {result.clamped && (
              <p className={s.tailNote}>극단 구간(상·하위 0.1% 밖)은 정규분포 근사 오차가 커져 &lsquo;이내&rsquo;로만 표시해요.</p>
            )}
          </>
        ) : (
          <p className={s.emptyNote}>키(cm)를 입력하면 사이즈코리아 8차 실측 통계 기준 백분위를 계산해요.</p>
        )}
      </div>

      {/* 연령대별 비교 */}
      {result && !result.warning && across.length > 0 && (
        <div className={s.card}>
          <p className={s.groupLabel}>같은 키, 다른 연령대라면?</p>
          <div className={s.acrossGrid}>
            {across.map(({ band: b, topPct }) => (
              <div key={b.id} className={`${s.acrossItem} ${b.id === bandId ? s.acrossOn : ''}`}>
                <span className={s.acrossBand}>{b.label}</span>
                <span className={s.acrossPct}>상위 {topPct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <p className={s.groupNote}>
            세대가 젊을수록 평균 키가 커서 같은 키라도 젊은 연령대에서 백분위가 낮아져요
            (남성 평균: 30대 후반 175.4cm vs 60대 168.2cm).
          </p>
        </div>
      )}

      {/* 실측 백분위 참고표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>실측 백분위 — {gender === 'M' ? '남성' : '여성'} {band.label}</p>
        <div className={s.tableScroll}>
          <table className={s.refTable}>
            <thead>
              <tr>
                {['하위 5%', '하위 25%', '중앙값', '상위 25%', '상위 5%'].map((hd) => (
                  <th scope="col" key={hd}>{hd}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {band.pct.map((v, i) => <td key={i}>{v.toFixed(1)}cm</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        <p className={s.groupNote}>
          사이즈코리아 8차 조사에서 실제 측정된 백분위 지점이에요. 이 계산기의 정규분포 모델은 이 실측값과
          p5~p95 구간 최대 1cm 미만 오차로 일치합니다.
        </p>
      </div>

      {/* 참고 통계 */}
      <div className={s.card}>
        <p className={s.groupLabel}>참고 통계</p>
        <ul className={s.factList}>
          <li>한국 성인(20~69세) 전체 평균: 남성 <strong>{OVERALL_MEAN.M}cm</strong> · 여성 <strong>{OVERALL_MEAN.F}cm</strong> (8차 인체치수조사)</li>
          <li>2024년 병역판정검사(2005년생 남성 약 21.1만 명) 평균: <strong>{MMA_2024_MEAN}cm</strong> (병무청)</li>
          <li>중앙값 근처에서는 1cm 차이가 백분위 약 {Math.round((stdNormalCdf(0.5 / band.sd) - 0.5) * 200) / 2}%p를 좌우해요 — 아침저녁 키 변화(1~2cm)만으로도 순위가 꽤 움직입니다.</li>
        </ul>
      </div>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/health/child-height', label: '자녀 키 예측 계산기' },
          { href: '/tools/finance/wealth-rank', label: '자산 순위 계산기' },
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
        ]}
        sources={[
          { label: '사이즈코리아 — 8차 한국인 인체치수조사', href: 'https://sizekorea.kr' },
          { label: '국가기술표준원 보도자료 (2022.3.)', href: 'https://www.kats.go.kr' },
        ]}
      >
        백분위는 사이즈코리아 8차 조사(20~69세 표본 6,839명) 통계에 정규분포 모델을 적용한 추정치입니다. 표본조사 특성상 실제 인구 분포와 다를 수 있고, 자가 측정 키(신발·자세·측정 시각)에 따라서도 결과가 달라집니다.
      </Disclaimer>
    </div>
  )
}
