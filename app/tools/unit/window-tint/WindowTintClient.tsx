'use client'

import { useMemo, useState } from 'react'
import styles from './window-tint.module.css'

// ──────────────────────────────────────
// 도로교통법 시행령 제28조 — 최소 투과율(VLT) 기준선
//   앞면(앞유리) 70% 이상 / 1열 옆면(운전석·조수석) 40% 이상
//   뒷면·2열 이후 옆면은 제한 없음
//   ※ 어린이운송용 승합자동차는 별도 체계(자동차규칙 제94조제3항): 모든 창유리 70% 이상, 정기검사 부적합으로 집행
// ──────────────────────────────────────
type Pos = 'front' | 'side1' | 'rear'

const POSITIONS: { id: Pos; label: string; zone: string; limit: number | null }[] = [
  { id: 'front', label: '앞면(앞유리)', zone: '전면 유리', limit: 70 },
  { id: 'side1', label: '운전석 옆면', zone: '1열 옆유리', limit: 40 },
  { id: 'rear',  label: '뒷면·2열',    zone: '뒷유리·뒷좌석', limit: null },
]

const PRESETS = [5, 15, 35, 50, 70]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

// 이진 부동소수점 노이즈를 제거한 소수 2자리 반올림 — 0.75×0.533=39.975가 39.9749…로 저장돼 39.97로 떨어지는 현상 방지
const round2 = (n: number) => Math.round(Number((n * 100).toPrecision(12))) / 100

// 소수점 입력의 과도한 자릿수를 2자리로 반올림하고 0~100으로 클램프 (표시·계산 동일값)
function parsePct(s: string): number {
  const n = parseFloat(s)
  if (!isFinite(n)) return 0
  return clamp(round2(n), 0, 100)
}

function fmt(n: number, digits = 2): string {
  if (!isFinite(n)) return '0'
  return String(Number(n.toFixed(digits)))
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

  // 원시 입력이 범위를 벗어나면 실제 계산에 쓰는 값을 그대로 알림 (입력창 150 ↔ 내부 100 불일치 방지)
  const rangeWarn = (raw: string, parsed: number): string | null => {
    const t = raw.trim()
    if (t === '') return null
    const n = parseFloat(t)
    if (!isFinite(n)) return `숫자로 인식할 수 없어 ${fmt(parsed)}%로 계산합니다`
    if (n < 0 || n > 100) return `0~100% 범위를 벗어나 ${fmt(parsed)}%로 계산합니다`
    return null
  }
  const glassWarn = rangeWarn(glass, glassPct)
  const filmWarn = rangeWarn(film, filmPct)
  const film2Warn = overlay ? rangeWarn(film2, film2Pct) : null

  // ── 핵심 계산 ──
  const combined = useMemo(() => {
    const g = glassPct / 100
    const f = filmPct / 100
    // 자체값: 원유리 × 필름 (곱셈) / 합산값: 표기값 그대로(원유리 곱 안 함 — 이중계산 방지)
    let vlt = interpret === 'self' ? g * f * 100 : filmPct
    if (overlay) vlt = vlt * (film2Pct / 100)
    // 소수 2자리 반올림값을 표시·판정에 동일 사용 (39.975가 화면 40% + 판정 부적합으로 갈리는 불일치 방지)
    return clamp(round2(vlt), 0, 100)
  }, [glassPct, filmPct, film2Pct, interpret, overlay])

  // 사용 중인 입력이 모두 0보다 커야 판정 (빈 입력을 0% 실측처럼 단정하지 않음)
  const hasInput = filmPct > 0 && (interpret === 'applied' || glassPct > 0) && (!overlay || film2Pct > 0)

  const shade = 100 - combined           // 차광률
  const nightWarn = combined < 35        // 야간 시인성 경고 임계

  const current = POSITIONS.find(p => p.id === pos)!
  const verdict = useMemo(() => {
    if (!hasInput) {
      return { kind: 'empty' as const, margin: 0 }
    }
    if (current.limit === null) {
      return { kind: 'none' as const, margin: 0 }
    }
    const margin = combined - current.limit
    return { kind: margin >= 0 ? ('pass' as const) : ('fail' as const), margin }
  }, [combined, current.limit, hasInput])

  // 기준 충족에 필요한 최소 필름 투과율 역산 (원유리·덧방 등 나머지 조건 고정)
  const minFilmNeeded = useMemo(() => {
    if (current.limit === null) return null
    const other = (interpret === 'self' ? glassPct / 100 : 1) * (overlay ? film2Pct / 100 : 1)
    if (other <= 0) return null
    return Math.ceil((current.limit / other) * 10) / 10
  }, [current.limit, interpret, glassPct, overlay, film2Pct])

  return (
    <div className={styles.wrap}>
      {/* ── 입력: 원유리 ── */}
      <div className={styles.card} style={interpret === 'applied' ? { opacity: 0.65 } : undefined}>
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
                onBlur={() => setGlass(String(glassPct))}
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
        {glassWarn && <p className={styles.inputWarn}>{glassWarn}</p>}
        <p className={styles.metricSub} style={{ marginTop: 10 }}>
          {interpret === 'applied'
            ? <><strong>부착 후 합산값 모드에서는 이 값을 계산에 사용하지 않습니다</strong> — 표기값이 이미 유리+필름 합산이기 때문입니다.</>
            : <>별도 코팅 없는 OEM 출고 유리는 보통 약 70~80%(앞유리는 더 높음). 모르면 기본 75% 그대로 두세요.</>}
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
                onBlur={() => setFilm(String(filmPct))}
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
        {filmWarn && <p className={styles.inputWarn}>{filmWarn}</p>}
        <div className={styles.presetRow}>
          {PRESETS.map(p => (
            <button
              key={p}
              type="button"
              aria-pressed={filmPct === p}
              className={`${styles.presetBtn} ${filmPct === p ? styles.presetActive : ''}`}
              onClick={() => setFilm(String(p))}
            >
              {p}% 농도
            </button>
          ))}
        </div>

        <span className={styles.cardLabel} style={{ marginTop: 18 }}>표기 수치 해석</span>
        <div className={styles.radioRow} role="group" aria-label="필름 표기 수치 해석">
          <button
            type="button"
            className={`${styles.radioBtn} ${interpret === 'self' ? styles.radioActive : ''}`}
            aria-pressed={interpret === 'self'}
            onClick={() => setInterpret('self')}
          >
            <div className={styles.radioTitle}>필름 자체값</div>
            <div className={styles.radioSub}>필름만의 투과율 → 원유리와 곱함</div>
          </button>
          <button
            type="button"
            className={`${styles.radioBtn} ${interpret === 'applied' ? styles.radioActive : ''}`}
            aria-pressed={interpret === 'applied'}
            onClick={() => setInterpret('applied')}
          >
            <div className={styles.radioTitle}>부착 후 합산값</div>
            <div className={styles.radioSub}>내 차에서 실측한 최종값 → 그대로 사용</div>
          </button>
        </div>
        <p className={styles.note} style={{ marginTop: 10 }}>
          <strong>시중 필름 표기는 &lsquo;부착 후 합산값&rsquo;인 경우가 많습니다.</strong> 표기가 합산값인데 원유리와 또 곱하면 이중계산이 됩니다. 다만 제조사 카탈로그의 합산값은 내 차가 아니라 <strong>기준 유리</strong>(국내 관행 3mm 판유리, 북미 자료는 6mm)에 붙여 잰 값이라, 실제 차 유리가 그보다 어두우면 — 특히 자외선 차단 유리(약 70~80%) — 실측은 표기보다 낮아집니다. 예: 3M SAS 35는 89% 유리에서 32%, 73% 유리에서 27%(3M 기술자료). 이 모드는 <strong>내 차에서 직접 측정한 값</strong>일 때 정확하고, 카탈로그 값만 있다면 &lsquo;필름 자체값&rsquo; 결과와 함께 폭으로 참고하세요.
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
            type="button"
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
                  onBlur={() => setFilm2(String(film2Pct))}
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
            {film2Warn && <p className={styles.inputWarn}>{film2Warn}</p>}
            <p className={styles.metricSub}>
              둘째 필름은 <strong>필름 자체값</strong> 기준으로 곱합니다. 표기가 부착 후 합산값이면 실제보다 짙게(보수적으로) 추정됩니다.
            </p>
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
              type="button"
              aria-pressed={pos === p.id}
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
          {hasInput ? <>{fmt(combined)}<span className={styles.heroUnit}>%</span></> : '—'}
        </div>
        <p className={styles.heroSub}>
          {!hasInput
            ? <>사용 중인 투과율 값을 0보다 크게 입력하면 합산 VLT를 계산합니다.</>
            : interpret === 'self'
              ? <>원유리 {fmt(glassPct)}% × 필름 {fmt(filmPct)}%{overlay ? <> × 덧방 {fmt(film2Pct)}%</> : null} = <strong>{fmt(combined)}%</strong></>
              : <>부착 후 표기값 {fmt(filmPct)}%{overlay ? <> × 덧방 {fmt(film2Pct)}%</> : null} = <strong>{fmt(combined)}%</strong> (원유리 곱 안 함)</>}
        </p>
      </div>

      {/* ── 법규 적합 배지 ── */}
      <div className={`${styles.verdict} ${verdict.kind === 'pass' ? styles.vPass : verdict.kind === 'fail' ? styles.vFail : styles.vNone}`}>
        {verdict.kind === 'empty' ? (
          <>
            <div className={styles.vTitle}>투과율을 입력하세요</div>
            <div className={styles.vDesc}>
              사용 중인 입력({interpret === 'self' ? '원유리·필름' : '필름'}{overlay ? '·덧방' : ''})을 모두 0보다 큰 값으로 채우면 <strong>{current.label}</strong> 기준과 대조해 적합 여부를 판정해 드립니다.
            </div>
          </>
        ) : verdict.kind === 'none' ? (
          <>
            <div className={styles.vTitle}>제한 없음</div>
            <div className={styles.vDesc}>
              <strong>{current.label}</strong>(뒷유리·2열 옆면)은 도로교통법 시행령상 투과율 제한이 없습니다. 단, 어린이통학버스 등 <strong>어린이운송용 승합자동차</strong>는 자동차 안전기준(자동차규칙 제94조제3항)에 따라 모든 창유리가 70% 이상이어야 합니다. 일반 차량도 너무 짙으면 야간·후진 시야가 나빠집니다.
            </div>
          </>
        ) : verdict.kind === 'pass' ? (
          <>
            <div className={styles.vTitle}>적합 — 기준 충족</div>
            <div className={styles.vDesc}>
              <strong>{current.label}</strong> 기준 {current.limit}% 이상. 현재 {fmt(combined)}%로 기준 대비 <span className={styles.vMargin} style={{ color: 'var(--success)' }}>+{fmt(verdict.margin)}%p</span> 여유.
              {verdict.margin < 1 && <> 다만 기준선과 차이가 1%p 미만입니다 — 곱셈식 추정과 실측은 다를 수 있으니 시공 전후 측정기 확인을 권합니다.</>}
            </div>
          </>
        ) : (
          <>
            <div className={styles.vTitle}>부적합 — 기준 미달</div>
            <div className={styles.vDesc}>
              <strong>{current.label}</strong> 기준 {current.limit}% 이상이어야 하는데 현재 {fmt(combined)}%로 <span className={styles.vMargin} style={{ color: 'var(--danger)' }}>{fmt(Math.abs(verdict.margin))}%p</span> 모자랍니다. 단속 시 과태료 2만원(도로교통법 제160조제2항, 시행령 별표6 — 전국 동일) 대상이 될 수 있습니다.
              {minFilmNeeded !== null && (minFilmNeeded <= 100
                ? <> 같은 조건에서 이 기준을 충족하려면 필름({interpret === 'self' ? '자체값' : '표기값'}) 투과율이 약 <strong>{fmt(minFilmNeeded, 1)}% 이상</strong>이어야 합니다.</>
                : <> 현재 원유리{overlay ? '·덧방' : ''} 조건에서는 어떤 필름으로도 이 기준을 충족할 수 없습니다.</>)}
              {Math.abs(verdict.margin) < 1 && <> 기준선과 차이가 1%p 미만이라 실측으로는 결과가 다를 수 있습니다 — 측정기 확인을 권합니다.</>}
            </div>
          </>
        )}
      </div>

      {/* ── 보조 지표 ── */}
      <div className={styles.metricRow}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>차광률 (100 − VLT)</div>
          <div className={styles.metricValue}>{hasInput ? <>{fmt(shade)}<small>%</small></> : '—'}</div>
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
              const pass = !hasInput || p.limit === null ? null : combined >= p.limit
              return (
                <tr key={p.id} className={p.id === pos ? styles.rowCurrent : ''}>
                  <td>{p.label}</td>
                  <td className={styles.num}>{p.limit === null ? '제한 없음' : `${p.limit}% 이상`}</td>
                  <td className={styles.num}>{hasInput ? `${fmt(combined)}%` : '—'}</td>
                  <td>
                    {pass === null
                      ? <span className={styles.tagNone}>{p.limit === null ? '해당 없음' : '입력 대기'}</span>
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
      {hasInput && (
      <div className={`${styles.nightBox} ${nightWarn ? styles.nightWarn : ''}`}>
        <div className={styles.nightTitle}>
          {nightWarn ? '야간 시인성 주의' : '야간 시인성 참고'}
        </div>
        <div className={styles.nightDesc}>
          {nightWarn ? (
            <>합산 VLT {fmt(combined)}%는 <strong>35% 미만</strong>입니다. 통과하는 빛이 적어 야간·우천·터널에서 대비 식별과 인지 거리가 짧아질 수 있고, 연령이 높을수록 저하 폭이 커지는 경향이 보고됩니다(개인 시력·조명 환경에 따라 차이). 운전석 옆면은 충분한 시야 확보가 안전합니다.</>
          ) : (
            <>합산 VLT {fmt(combined)}%는 <strong>35% 이상</strong>입니다. 다만 35%는 야간 안전을 보장하는 수치가 아니라 미국 여러 주의 법정 하한에서 온 관행적 기준입니다. 60대 운전자는 투과율 37%에서도 야간 대비감도가 유의하게 낮아졌다는 연구(LaMotte 외, 2000)가 있으니, 야간 운전이 잦거나 연령·시력이 걱정되면 한 단계 밝은 농도가 안전할 수 있습니다.</>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
