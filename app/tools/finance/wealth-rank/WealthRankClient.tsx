'use client'

import { useMemo, useState } from 'react'
import s from './wealth-rank.module.css'
import {
  computeRank,
  AGE_GROUPS,
  REGIONS,
  type Mode,
} from './wealthData'

const MODES: { id: Mode; label: string }[] = [
  { id: 'nation', label: '전국' },
  { id: 'region', label: '시도' },
  { id: 'age', label: '연령대' },
  { id: 'world', label: '세계' },
]

const PRESETS = [
  { label: '1억', v: 10000 },
  { label: '3억', v: 30000 },
  { label: '5억', v: 50000 },
  { label: '10억', v: 100000 },
]

// 만원 → "X억 Y,YYY만원"
function fmtMan(m: number): string {
  const neg = m < 0
  const abs = Math.round(Math.abs(m))
  const eok = Math.floor(abs / 10000)
  const man = abs % 10000
  let out = ''
  if (eok) out += `${eok.toLocaleString('ko-KR')}억`
  if (man) out += `${eok ? ' ' : ''}${man.toLocaleString('ko-KR')}만`
  if (!eok && !man) out = '0'
  return `${neg ? '-' : ''}${out}원`
}
// 짧은 표기 (억 기준, 소수 1자리)
function fmtEok(m: number): string {
  const v = m / 10000
  const neg = v < 0
  const a = Math.abs(v)
  const str = a >= 100 ? a.toFixed(0) : a.toFixed(1)
  return `${neg ? '-' : ''}${str.replace(/\.0$/, '')}억`
}

function parseNum(str: string): number {
  const cleaned = str.replace(/[^0-9.-]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

export default function WealthRankClient() {
  const [mode, setMode] = useState<Mode>('nation')
  const [raw, setRaw] = useState('') // 순자산 (만원, 문자열)
  const [regionId, setRegionId] = useState(REGIONS[0].id)
  const [ageId, setAgeId] = useState(AGE_GROUPS[2].id) // 50대 기본
  const [helper, setHelper] = useState(false)
  const [assetRaw, setAssetRaw] = useState('')
  const [debtRaw, setDebtRaw] = useState('')
  const [worldAdults, setWorldAdults] = useState('1') // 세계 모드: 가구 성인 수 (1인당 환산)

  // 총자산 - 부채 헬퍼가 켜지면 순자산을 자동 계산
  const netFromHelper = helper ? parseNum(assetRaw) - parseNum(debtRaw) : null
  const value = helper ? (netFromHelper ?? 0) : parseNum(raw)
  const hasInput = helper
    ? assetRaw.trim() !== '' || debtRaw.trim() !== ''
    : raw.trim() !== ''

  const groupId = mode === 'region' ? regionId : mode === 'age' ? ageId : undefined
  // 세계 모드는 UBS 성인 1인당 분포 → 가구 순자산을 성인 수로 나눠 1인당 환산 비교
  const adults = Math.max(1, parseNum(worldAdults) || 1)
  const effValue = mode === 'world' ? value / adults : value
  const result = useMemo(
    () => computeRank(mode, effValue, groupId),
    [mode, effValue, groupId],
  )

  const markerLeft = Math.max(1.5, Math.min(98.5, result.percentile))
  // 최상위 앵커(전국 200억)를 넘으면 topPercent가 0으로 반올림 → "상위 0%" 방지
  const topLabel = result.topPercent <= 0 ? '0.01% 이내' : `${result.topPercent}%`
  const top10Done = result.toTop10 <= 0
  const top1Done = result.toTop1 <= 0
  // 마커 라벨이 막대 밖으로 넘치지 않도록 가장자리에서 정렬 보정
  const labelShift = markerLeft > 80 ? '-100%' : markerLeft < 20 ? '0%' : '-50%'

  // 분포 막대 기준선 (백분위)
  const TICKS = [50, 80, 90, 99]

  return (
    <div className={s.wrap}>
      {/* 기준 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="순위 기준">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            className={`${s.tab} ${mode === m.id ? s.tabActive : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 그룹 선택 (시도 / 연령대) */}
      {mode === 'region' && (
        <div className={s.card}>
          <label className={s.fieldLabel} htmlFor="wr-region">지역 (시·도)</label>
          <select
            id="wr-region"
            className={s.select}
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            style={{ marginTop: 6 }}
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label} · 평균 {fmtEok(r.mean)}{r.real ? '' : ' (추정)'}
              </option>
            ))}
          </select>
        </div>
      )}
      {mode === 'age' && (
        <div className={s.card}>
          <label className={s.fieldLabel} htmlFor="wr-age">가구주 연령대</label>
          <select
            id="wr-age"
            className={s.select}
            value={ageId}
            onChange={(e) => setAgeId(e.target.value)}
            style={{ marginTop: 6 }}
          >
            {AGE_GROUPS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} · 평균 {fmtEok(a.mean)}{a.real ? '' : ' (추정)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 순자산 입력 */}
      <div className={s.card}>
        <div className={s.inputHead}>
          <label className={s.cardLabel} htmlFor="wr-net">내 순자산</label>
          <button
            type="button"
            className={s.helperToggle}
            aria-pressed={helper}
            onClick={() => setHelper((v) => !v)}
          >
            {helper ? '직접 입력' : '총자산 − 부채로 계산'}
          </button>
        </div>

        {!helper ? (
          <>
            <div className={s.inputUnitRow}>
              <input
                id="wr-net"
                className={s.input}
                inputMode="numeric"
                placeholder="예: 47144"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
              />
              <span className={s.unit}>만원</span>
            </div>
            <div className={s.presetRow}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className={s.preset}
                  onClick={() => setRaw(String(p.v))}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {hasInput && (
              <p className={s.echo}>= {fmtMan(value)}</p>
            )}
          </>
        ) : (
          <div className={s.helperGrid}>
            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="wr-asset">총자산 (집·예금·주식 등)</label>
              <div className={s.inputUnitRow}>
                <input
                  id="wr-asset"
                  className={s.input}
                  inputMode="numeric"
                  placeholder="예: 56678"
                  value={assetRaw}
                  onChange={(e) => setAssetRaw(e.target.value)}
                />
                <span className={s.unit}>만원</span>
              </div>
            </div>
            <div className={s.field}>
              <label className={s.fieldLabel} htmlFor="wr-debt">부채 (대출·전세보증금 등)</label>
              <div className={s.inputUnitRow}>
                <input
                  id="wr-debt"
                  className={s.input}
                  inputMode="numeric"
                  placeholder="예: 9534"
                  value={debtRaw}
                  onChange={(e) => setDebtRaw(e.target.value)}
                />
                <span className={s.unit}>만원</span>
              </div>
            </div>
            {hasInput && (
              <p className={s.echo}>순자산 = {fmtMan(value)}</p>
            )}
          </div>
        )}

        {mode === 'world' && (
          <div className={s.field} style={{ marginTop: 12 }}>
            <label className={s.fieldLabel} htmlFor="wr-adults">가구 성인 수 (1인당 환산)</label>
            <div className={s.inputUnitRow}>
              <input
                id="wr-adults"
                className={s.input}
                inputMode="numeric"
                value={worldAdults}
                onChange={(e) => setWorldAdults(e.target.value)}
              />
              <span className={s.unit}>명</span>
            </div>
            {hasInput && (
              <p className={s.echo}>
                {adults > 1 ? `1인당 ${fmtMan(effValue)} 기준으로 세계 분포와 비교` : '성인 1명 기준 (가족이면 성인 수를 늘리세요)'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 결과 */}
      {hasInput && (
        <>
          <div className={s.hero} role="status">
            <p className={s.heroLabel}>{result.basisLabel} 중 내 순자산은</p>
            <p className={s.heroValue}>
              상위 <strong>{topLabel}</strong>
            </p>
            <p className={s.heroSub}>
              백분위 <strong>{result.percentile}</strong> · <strong>{result.decile}분위</strong>
              {result.isEstimate && <span className={s.estTag}>추정</span>}
            </p>
          </div>

          {/* 분포 막대 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{result.basisLabel} 순자산 분포에서 내 위치</span>
            <div className={s.barOuter}>
              <div className={s.barTrack} />
              {TICKS.map((t) => (
                <div key={t} className={s.barTick} style={{ left: `${t}%` }} />
              ))}
              <div className={s.barMarker} style={{ left: `${markerLeft}%` }}>
                <span className={s.barMarkerDot} />
                <span
                  className={s.barMarkerLabel}
                  style={{ transform: `translateX(${labelShift})` }}
                >
                  나 · 상위 {topLabel}
                </span>
              </div>
            </div>
            <div className={s.barAxis}>
              <span>하위</span>
              <span>중앙값</span>
              <span>상위</span>
            </div>
          </div>

          {/* 기준 지표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{result.basisLabel} 기준선</span>
            <table className={s.refTable}>
              <tbody>
                <tr>
                  <td>중앙값 (딱 절반)</td>
                  <td>{fmtMan(result.median)}</td>
                </tr>
                <tr>
                  <td>상위 10% 진입선</td>
                  <td>{fmtMan(result.top10)}</td>
                </tr>
                <tr>
                  <td>상위 1% 진입선</td>
                  <td>{fmtMan(result.top1)}</td>
                </tr>
              </tbody>
            </table>

            <div className={s.goalRow}>
              {top10Done ? (
                <div className={`${s.goal} ${s.goalDone}`}>
                  <span className={s.goalMark}>✓</span>
                  <span>이미 <strong>상위 10%</strong> 안에 들어요</span>
                </div>
              ) : (
                <div className={s.goal}>
                  <span className={s.goalMark}>→</span>
                  <span>상위 10%까지 <strong>{fmtMan(result.toTop10)}</strong> 더</span>
                </div>
              )}
              {top1Done ? (
                <div className={`${s.goal} ${s.goalDone}`}>
                  <span className={s.goalMark}>✓</span>
                  <span>이미 <strong>상위 1%</strong> 안에 들어요</span>
                </div>
              ) : (
                <div className={s.goal}>
                  <span className={s.goalMark}>→</span>
                  <span>상위 1%까지 <strong>{fmtMan(result.toTop1)}</strong> 더</span>
                </div>
              )}
            </div>
          </div>

          {/* 기준별 보충 설명 */}
          {mode === 'nation' && (
            <div className={s.noteCard}>
              전국 분포는 공식 앵커(평균·중앙값·상위 컷·실측 구간) 사이를 <strong>보간한 추정 곡선</strong>입니다.
              중앙값(2억 3,860만원)은 2025 조사 실측값이지만, 그 외 하위~중간 구간의 순위는 원자료가 아닌 <strong>모델 추정값</strong>이라 실제와 다소 차이가 있을 수 있습니다.
            </div>
          )}
          {mode === 'world' && (
            <div className={s.noteCard}>
              세계 기준은 <strong>UBS Global Wealth Report 2025</strong>의 <strong>성인 1인당</strong> 순자산 분포입니다 (환율 1달러 = 1,380원).
              한국 통계는 가구 단위라, 위 <strong>가구 성인 수</strong>로 1인당 환산해 비교하세요. 1명 그대로 두면 부부·가족은 순위가 실제보다 높게 나올 수 있습니다.
            </div>
          )}
          {(mode === 'region' || mode === 'age') && (
            <div className={s.noteCard}>
              {mode === 'region' ? '시·도' : '연령대'} 비교는 전국 분포를 그룹 <strong>평균 순자산 비율로 스케일</strong>한 추정치입니다.
              분포 모양(예: 서울의 부동산 편중)은 반영하지 못해, <strong>특히 상위 10%·1% 진입선은 오차가 큰 추정</strong>입니다.
              서울·세종·경기·제주·50대(실측 평균)를 제외한 값은 평균 수준 추정이니 그룹 내 대략적 위치 참고용으로만 보세요.
            </div>
          )}
        </>
      )}
    </div>
  )
}
