'use client'

import { useMemo, useState } from 'react'
import styles from './window-tint.module.css'

// ──────────────────────────────────────
// 도로교통법 시행령 제28조 — 최소 투과율(VLT) 기준선
//   앞면(앞유리) 70% 이상 / 1열 옆면(운전석·조수석) 40% 이상
//   뒷면·2열 이후 옆면은 제한 없음
// ──────────────────────────────────────
type Pos = 'front' | 'side1' | 'rear'

const POSITIONS: { id: Pos; label: string; zone: string; limit: number | null }[] = [
  { id: 'front', label: '앞면(앞유리)', zone: '전면 유리', limit: 70 },
  { id: 'side1', label: '운전석 옆면', zone: '1열 옆유리', limit: 40 },
  { id: 'rear',  label: '뒷면·2열',    zone: '뒷유리·뒷좌석', limit: null },
]

const PRESETS = [5, 15, 35, 50, 70]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// 소수점 입력의 과도한 자릿수를 흡수하고 0~100으로 클램프
function parsePct(s: string): number {
  const n = parseFloat(s)
  if (!isFinite(n)) return 0
  return clamp(n, 0, 100)
}

function fmt(n: number, digits = 1): string {
  if (!isFinite(n)) return '0'
  const r = Number(n.toFixed(digits))
  return r % 1 === 0 ? String(r) : r.toFixed(digits)
}

export default function WindowTintClient() {
  // 원유리 투과율(%) — OEM 출고 유리는 보통 ~75%
  const [glass, setGlass] = useState('75')
  // 필름 표기 투과율·농도(%)
  const [film, setFilm] = useState('35')
  // 표기 해석: self=필름 자체값(원유리와 곱함) / applied=부착 후 합산값(그대로)
  const [interpret, setInterpret] = useState<'self' | 'applied'>('self')
  // 적용 위치 — 법규 기준선 자동 전환
  const [pos, setPos] = useState<Pos>('side1')
  // 덧방(추가필름)
  const [overlay, setOverlay] = useState(false)
  const [film2, setFilm2] = useState('50')

  const glassPct = parsePct(glass)
  const filmPct = parsePct(film)
  const film2Pct = parsePct(film2)

  // ── 핵심 계산 ──
  const combined = useMemo(() => {
    const g = glassPct / 100
    const f = filmPct / 100
    // 자체값: 원유리 × 필름 (곱셈) / 합산값: 표기값 그대로(원유리 곱 안 함 — 이중계산 방지)
    let vlt = interpret === 'self' ? g * f * 100 : filmPct
    if (overlay) vlt = vlt * (film2Pct / 100)
    return clamp(vlt, 0, 100)
  }, [glassPct, filmPct, film2Pct, interpret, overlay])

  const shade = 100 - combined           // 차광률
  const nightWarn = combined < 35        // 야간 시인성 경고 임계

  const current = POSITIONS.find(p => p.id === pos)!
  const verdict = useMemo(() => {
    if (current.limit === null) {
      return { kind: 'none' as const, margin: 0 }
    }
    const margin = combined - current.limit
    return { kind: margin >= 0 ? ('pass' as const) : ('fail' as const), margin }
  }, [combined, current.limit])

  return (
    <div className={styles.wrap}>
      {/* ── 입력: 원유리 ── */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>원유리 투과율</span>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <label htmlFor="wt-glass" className={styles.sliderName}>출고 유리 자체 투과율</label>
            <div className={styles.sliderInputBox}>
              <input
                id="wt-glass" type="text" inputMode="decimal"
                className={styles.sliderField}
                value={glass}
                onChange={e => setGlass(e.target.value)}
              />
              <span className={styles.sliderUnit}>%</span>
            </div>
          </div>
          <input
            type="range" min={0} max={100} step={1}
            className={styles.slider}
            value={glassPct}
            onChange={e => setGlass(e.target.value)}
            aria-label="원유리 투과율 슬라이더"
          />
        </div>
        <p className={styles.metricSub} style={{ marginTop: 10 }}>
          별도 코팅 없는 OEM 출고 유리는 보통 약 70~80%(앞유리는 더 높음). 모르면 기본 75% 그대로 두세요.
        </p>
      </div>

      {/* ── 입력: 필름 + 표기 해석 ── */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>필름 표기 투과율(농도)</span>
        <div className={styles.sliderRow}>
          <div className={styles.sliderHead}>
            <label htmlFor="wt-film" className={styles.sliderName}>필름 농도(낮을수록 짙음)</label>
            <div className={styles.sliderInputBox}>
              <input
                id="wt-film" type="text" inputMode="decimal"
                className={styles.sliderField}
                value={film}
                onChange={e => setFilm(e.target.value)}
              />
              <span className={styles.sliderUnit}>%</span>
            </div>
          </div>
          <input
            type="range" min={0} max={100} step={1}
            className={styles.slider}
            value={filmPct}
            onChange={e => setFilm(e.target.value)}
            aria-label="필름 투과율 슬라이더"
          />
        </div>
        <div className={styles.presetRow}>
          {PRESETS.map(p => (
            <button
              key={p}
              className={`${styles.presetBtn} ${filmPct === p ? styles.presetActive : ''}`}
              onClick={() => setFilm(String(p))}
            >
              {p}% 농도
            </button>
          ))}
        </div>

        <span className={styles.cardLabel} style={{ marginTop: 18 }}>표기 수치 해석</span>
        <div className={styles.radioRow} role="radiogroup" aria-label="필름 표기 수치 해석">
          <button
            className={`${styles.radioBtn} ${interpret === 'self' ? styles.radioActive : ''}`}
            role="radio" aria-checked={interpret === 'self'}
            onClick={() => setInterpret('self')}
          >
            <div className={styles.radioTitle}>필름 자체값</div>
            <div className={styles.radioSub}>필름만의 투과율 → 원유리와 곱함</div>
          </button>
          <button
            className={`${styles.radioBtn} ${interpret === 'applied' ? styles.radioActive : ''}`}
            role="radio" aria-checked={interpret === 'applied'}
            onClick={() => setInterpret('applied')}
          >
            <div className={styles.radioTitle}>부착 후 합산값</div>
            <div className={styles.radioSub}>표준유리에 붙여 잰 값 → 그대로 사용</div>
          </button>
        </div>
        <p className={styles.note} style={{ marginTop: 10 }}>
          <strong>시중 필름 표기는 &lsquo;부착 후 합산값&rsquo;인 경우가 많습니다.</strong> 표기가 합산값인데 원유리와 또 곱하면 실제보다 낮게(짙게) 계산돼 이중계산이 됩니다. 표기 출처가 불확실하면 두 결과를 모두 비교해 보세요.
        </p>
      </div>

      {/* ── 덧방 ── */}
      <div className={styles.card}>
        <div className={styles.toggleBox}>
          <span className={styles.toggleLabel}>
            덧방(추가 필름)
            <small>기존 필름 위에 한 겹 더 — 투과율을 누적으로 곱합니다</small>
          </span>
          <button
            className={`${styles.toggle} ${overlay ? styles.toggleOn : ''}`}
            role="switch" aria-checked={overlay} aria-label="덧방 추가 필름"
            onClick={() => setOverlay(v => !v)}
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        {overlay && (
          <div className={styles.sliderRow} style={{ marginTop: 14 }}>
            <div className={styles.sliderHead}>
              <label htmlFor="wt-film2" className={styles.sliderName}>둘째 필름 투과율</label>
              <div className={styles.sliderInputBox}>
                <input
                  id="wt-film2" type="text" inputMode="decimal"
                  className={styles.sliderField}
                  value={film2}
                  onChange={e => setFilm2(e.target.value)}
                />
                <span className={styles.sliderUnit}>%</span>
              </div>
            </div>
            <input
              type="range" min={0} max={100} step={1}
              className={styles.slider}
              value={film2Pct}
              onChange={e => setFilm2(e.target.value)}
              aria-label="둘째 필름 투과율 슬라이더"
            />
          </div>
        )}
      </div>

      {/* ── 적용 위치 ── */}
      <div className={styles.card}>
        <span className={styles.cardLabel}>적용 위치 (법규 기준 자동 전환)</span>
        <div className={styles.posRow}>
          {POSITIONS.map(p => (
            <button
              key={p.id}
              className={`${styles.posBtn} ${pos === p.id ? styles.posActive : ''}`}
              onClick={() => setPos(p.id)}
            >
              {p.label}
              <small>{p.limit === null ? '제한 없음' : `${p.limit}% 이상`}</small>
            </button>
          ))}
        </div>
      </div>

      {/* ── 결과 히어로 ── */}
      <div className={styles.hero} role="status">
        <div className={styles.heroLabel}>합산 가시광선 투과율 (VLT)</div>
        <div className={styles.heroNum}>
          {fmt(combined)}<span className={styles.heroUnit}>%</span>
        </div>
        <p className={styles.heroSub}>
          {interpret === 'self'
            ? <>원유리 {fmt(glassPct, 0)}% × 필름 {fmt(filmPct, 0)}%{overlay ? <> × 덧방 {fmt(film2Pct, 0)}%</> : null} = <strong>{fmt(combined)}%</strong></>
            : <>부착 후 표기값 {fmt(filmPct, 0)}%{overlay ? <> × 덧방 {fmt(film2Pct, 0)}%</> : null} = <strong>{fmt(combined)}%</strong> (원유리 곱 안 함)</>}
        </p>
      </div>

      {/* ── 법규 적합 배지 ── */}
      <div className={`${styles.verdict} ${verdict.kind === 'pass' ? styles.vPass : verdict.kind === 'fail' ? styles.vFail : styles.vNone}`}>
        {verdict.kind === 'none' ? (
          <>
            <div className={styles.vTitle}>제한 없음</div>
            <div className={styles.vDesc}>
              <strong>{current.label}</strong>(뒷유리·2열 옆면)은 도로교통법 시행령상 투과율 제한이 없습니다. 다만 너무 짙으면 야간·후진 시야가 나빠집니다.
            </div>
          </>
        ) : verdict.kind === 'pass' ? (
          <>
            <div className={styles.vTitle}>적합 — 기준 충족</div>
            <div className={styles.vDesc}>
              <strong>{current.label}</strong> 기준 {current.limit}% 이상. 현재 {fmt(combined)}%로 기준 대비 <span className={styles.vMargin} style={{ color: 'var(--success)' }}>+{fmt(verdict.margin)}%p</span> 여유.
            </div>
          </>
        ) : (
          <>
            <div className={styles.vTitle}>부적합 — 기준 미달</div>
            <div className={styles.vDesc}>
              <strong>{current.label}</strong> 기준 {current.limit}% 이상이어야 하는데 현재 {fmt(combined)}%로 <span className={styles.vMargin} style={{ color: 'var(--danger)' }}>{fmt(verdict.margin)}%p</span> 모자랍니다. 단속 시 범칙금·과태료(통상 2만원 안팎) 대상이 될 수 있습니다.
            </div>
          </>
        )}
      </div>

      {/* ── 보조 지표 ── */}
      <div className={styles.metricRow}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>차광률 (100 − VLT)</div>
          <div className={styles.metricValue}>{fmt(shade)}<small>%</small></div>
          <div className={styles.metricSub}>빛을 막는 비율 (참고값)</div>
        </div>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>현재 위치 기준선</div>
          <div className={styles.metricValue}>
            {current.limit === null ? '없음' : <>{current.limit}<small>%</small></>}
          </div>
          <div className={styles.metricSub}>{current.zone}</div>
        </div>
      </div>

      {/* ── 위치별 요약표 ── */}
      <div className="tableScroll">
        <table className={styles.posTable}>
          <thead>
            <tr>
              <th scope="col">위치</th>
              <th scope="col">법정 기준</th>
              <th scope="col">현재 VLT</th>
              <th scope="col">판정</th>
            </tr>
          </thead>
          <tbody>
            {POSITIONS.map(p => {
              const pass = p.limit === null ? null : combined >= p.limit
              return (
                <tr key={p.id} className={p.id === pos ? styles.rowCurrent : ''}>
                  <td>{p.label}</td>
                  <td className={styles.num}>{p.limit === null ? '제한 없음' : `${p.limit}% 이상`}</td>
                  <td className={styles.num}>{fmt(combined)}%</td>
                  <td>
                    {pass === null
                      ? <span className={styles.tagNone}>해당 없음</span>
                      : pass
                        ? <span className={styles.tagPass}>통과</span>
                        : <span className={styles.tagFail}>부적합</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── 야간 시인성 ── */}
      <div className={`${styles.nightBox} ${nightWarn ? styles.nightWarn : ''}`}>
        <div className={styles.nightTitle}>
          {nightWarn ? '야간 시인성 주의' : '야간 시인성 양호 범위'}
        </div>
        <div className={styles.nightDesc}>
          {nightWarn ? (
            <>합산 VLT {fmt(combined)}%는 <strong>35% 미만</strong>입니다. 통과하는 빛이 적어 야간·우천·터널에서 인지 거리가 짧아질 수 있습니다(개인 시력·조명 환경에 따라 차이). 운전석 옆면은 충분한 시야 확보가 안전합니다.</>
          ) : (
            <>합산 VLT {fmt(combined)}%는 <strong>35% 이상</strong>이라 일반적으로 야간 시야 확보에 큰 무리가 없는 범위입니다. 다만 비 오는 밤·가로등 없는 도로는 더 밝은 쪽이 안전합니다.</>
          )}
        </div>
      </div>
    </div>
  )
}
