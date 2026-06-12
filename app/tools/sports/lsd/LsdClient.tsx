'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import s from './lsd.module.css'

// ─────────────────────────────────────────────
// 상수·유틸
// ─────────────────────────────────────────────
const DIST_PRESETS = [
  { label: '5K', km: 5 },
  { label: '10K', km: 10 },
  { label: '하프', km: 21.0975 },
  { label: '풀', km: 42.195 },
]

const pad = (n: number) => String(n).padStart(2, '0')

// Riegel 거리 환산: T2 = T1 × (D2/D1)^1.06
function riegel(t1Sec: number, d1Km: number, d2Km: number): number {
  if (t1Sec <= 0 || d1Km <= 0) return 0
  return t1Sec * Math.pow(d2Km / d1Km, 1.06)
}

function fmtPace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '–'
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${pad(s)}`
}
function fmtDur(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return '–'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const ss = Math.round(sec % 60)
  if (h > 0) return `${h}시간 ${pad(m)}분`
  return `${m}분 ${pad(ss)}초`
}
const intOr0 = (v: string) => { const n = parseInt(v, 10); return isFinite(n) && n > 0 ? n : 0 }
const floatOr0 = (v: string) => { const n = parseFloat(v); return isFinite(n) && n > 0 ? n : 0 }

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function LsdClient() {
  const [distKm, setDistKm] = useState(10)
  const [hh, setHh] = useState('0')
  const [mm, setMm] = useState('50')
  const [ssStr, setSsStr] = useState('00')
  const [age, setAge] = useState('35')
  const [restHr, setRestHr] = useState('')   // 선택
  const [longMode, setLongMode] = useState<'dist' | 'time'>('dist')
  const [longKm, setLongKm] = useState('20')
  const [longMin, setLongMin] = useState('120')
  const [copied, setCopied] = useState(false)

  const raceSec = intOr0(hh) * 3600 + intOr0(mm) * 60 + intOr0(ssStr)

  // ── 페이스 계산 ──
  const pace = useMemo(() => {
    if (raceSec <= 0 || distKm <= 0) return null
    const t10 = riegel(raceSec, distKm, 10)
    const pace10 = t10 / 10                         // 10K 환산 페이스 (sec/km)
    const tM = riegel(raceSec, distKm, 42.195)
    const paceM = tM / 42.195                        // 마라톤 환산 페이스
    const threshold = pace10 * 1.05                  // 임계(템포)
    const easyFast = pace10 * 1.20                   // 이지 빠른 끝
    const easySlow = pace10 * 1.30                   // 이지 느린 끝
    const recovSlow = easySlow * 1.08                // 회복주
    return { pace10, paceM, threshold, easyFast, easySlow, recovSlow }
  }, [raceSec, distKm])

  // ── 심박 존2 ──
  const hr = useMemo(() => {
    const a = intOr0(age)
    if (a <= 0) return null
    const maxHr = Math.round(208 - 0.7 * a)          // Tanaka
    const rest = intOr0(restHr)
    if (rest > 0 && rest < maxHr) {
      // Karvonen (심박예비, 60~70%)
      const z2Lo = Math.round(rest + (maxHr - rest) * 0.60)
      const z2Hi = Math.round(rest + (maxHr - rest) * 0.70)
      return { maxHr, z2Lo, z2Hi, method: 'Karvonen (안정시 심박 반영)' }
    }
    const z2Lo = Math.round(maxHr * 0.60)
    const z2Hi = Math.round(maxHr * 0.70)
    return { maxHr, z2Lo, z2Hi, method: '최대심박 %' }
  }, [age, restHr])

  // ── 롱런 플래너 ──
  const longRun = useMemo(() => {
    if (!pace) return null
    const easyMid = (pace.easyFast + pace.easySlow) / 2
    let durSec: number, km: number
    if (longMode === 'dist') {
      km = floatOr0(longKm)
      durSec = km * easyMid
    } else {
      durSec = intOr0(longMin) * 60
      km = easyMid > 0 ? durSec / easyMid : 0
    }
    if (durSec <= 0) return null
    const durMin = durSec / 60
    // 수분: 20분마다 약 150ml
    const waterMl = Math.round(durMin / 20) * 150
    // 탄수 보급: 75분 이상부터, 약 40분 간격 (45분 시작)
    let gels = 0
    if (durMin >= 75) gels = Math.floor((durMin - 45) / 40) + 1
    const carbsG = gels * 25
    return { durSec, km, waterMl, gels, carbsG }
  }, [pace, longMode, longKm, longMin])

  function handleCopy() {
    if (!pace) return
    const lines = [
      '🏃 LSD·이지런 페이스',
      `기준 기록: ${DIST_PRESETS.find(d => d.km === distKm)?.label ?? distKm + 'km'} ${fmtDur(raceSec)}`,
      `이지/LSD 페이스: ${fmtPace(pace.easyFast)} ~ ${fmtPace(pace.easySlow)} /km`,
      `마라톤 페이스: ${fmtPace(pace.paceM)} · 임계(템포): ${fmtPace(pace.threshold)} /km`,
      hr ? `존2 심박: ${hr.z2Lo}~${hr.z2Hi} bpm (최대 ${hr.maxHr})` : '',
      `🚦 ${fmtPace(pace.easyFast)}보다 빠른 이지런은 회색지대(정크 마일)`,
      'youtil.kr/tools/sports/lsd',
    ].filter(Boolean)
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/interval-training', label: '인터벌 훈련' },
          { href: '/tools/sports/buildup', label: '러닝 빌드업' },
          { href: '/tools/sports/vo2max', label: 'VO₂max' },
        ]}
      >
        페이스·심박 구간은 일반 공식(Riegel·Tanaka) 기반 추정 범위입니다. 개인 체력·기온·지형·컨디션에 따라 달라지며, 통증·어지럼증이 있으면 즉시 멈추세요. LSD의 핵심은 숫자보다 &lsquo;편안함&rsquo;입니다.
      </Disclaimer>

      {/* 1. 기준 기록 */}
      <div className={s.card}>
        <span className={s.cardLabel}>최근 기록 (또는 현재 실력)</span>
        <div className={s.distRow}>
          {DIST_PRESETS.map(d => (
            <button key={d.label} type="button"
              className={`${s.distBtn} ${distKm === d.km ? s.distActive : ''}`}
              onClick={() => setDistKm(d.km)}>
              {d.label}
            </button>
          ))}
        </div>
        <div className={s.timeRow}>
          <div className={s.timeField}>
            <input className={s.timeInput} type="number" min={0} inputMode="numeric" value={hh} onChange={e => setHh(e.target.value)} />
            <span className={s.timeUnit}>시</span>
          </div>
          <div className={s.timeField}>
            <input className={s.timeInput} type="number" min={0} max={59} inputMode="numeric" value={mm} onChange={e => setMm(e.target.value)} />
            <span className={s.timeUnit}>분</span>
          </div>
          <div className={s.timeField}>
            <input className={s.timeInput} type="number" min={0} max={59} inputMode="numeric" value={ssStr} onChange={e => setSsStr(e.target.value)} />
            <span className={s.timeUnit}>초</span>
          </div>
        </div>
        {pace && <div className={s.helperText}>입력 기록 = {fmtPace(raceSec / distKm)} /km · 10K 환산 {fmtPace(pace.pace10)} /km</div>}
      </div>

      {/* ── 결과: 이지 페이스 ── */}
      {pace ? (
        <>
          <div className={s.hero} role="status">
            <div className={s.heroLead}>나의 이지·LSD 페이스</div>
            <div className={s.heroNum}>{fmtPace(pace.easyFast)} ~ {fmtPace(pace.easySlow)}</div>
            <div className={s.heroSub}>분 / km · 이 구간 안에서 &lsquo;대화 가능한&rsquo; 속도로</div>
          </div>

          {/* 회색지대 경고 */}
          <div className={s.grayCard}>
            🚦 <strong>{fmtPace(pace.easyFast)}보다 빠른 이지런은 &lsquo;회색지대(정크 마일)&rsquo;</strong>입니다.
            마라톤 페이스({fmtPace(pace.paceM)})와 이지 페이스 사이는 &ldquo;힘들진 않은데 회복도 안 되는&rdquo; 애매한 구간 —
            여기서 매일 뛰면 피로만 쌓이고 유산소 토대는 안 늘어납니다. <strong>의식적으로 더 느리게.</strong>
          </div>

          {/* 페이스 가이드 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>강도별 페이스 가이드</span>
            <table className={s.paceTable}>
              <tbody>
                <tr>
                  <td className={s.pName}>임계 (템포)</td>
                  <td className={s.pVal}>{fmtPace(pace.threshold)}</td>
                  <td className={s.pNote}>20~40분 지속, 약간 힘든</td>
                </tr>
                <tr>
                  <td className={s.pName}>마라톤</td>
                  <td className={s.pVal}>{fmtPace(pace.paceM)}</td>
                  <td className={s.pNote}>풀코스 목표 페이스</td>
                </tr>
                <tr className={s.pHi}>
                  <td className={s.pName}>이지 · LSD ✓</td>
                  <td className={s.pVal}>{fmtPace(pace.easyFast)}~{fmtPace(pace.easySlow)}</td>
                  <td className={s.pNote}>훈련의 80%, 대화 가능</td>
                </tr>
                <tr>
                  <td className={s.pName}>회복주</td>
                  <td className={s.pVal}>{fmtPace(pace.easySlow)} 이상</td>
                  <td className={s.pNote}>고강도 다음날, 더 천천히</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 나이·심박 */}
          <div className={s.card}>
            <span className={s.cardLabel}>존2 심박 (선택 입력)</span>
            <div className={s.hrInputRow}>
              <div className={s.hrField}>
                <span className={s.hrFieldLabel}>나이</span>
                <input className={s.hrInput} type="number" min={5} max={100} inputMode="numeric" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className={s.hrField}>
                <span className={s.hrFieldLabel}>안정시 심박 (선택)</span>
                <input className={s.hrInput} type="number" min={30} max={120} inputMode="numeric" value={restHr} onChange={e => setRestHr(e.target.value)} placeholder="예: 60" />
              </div>
            </div>
            {hr && (
              <div className={s.hrResult}>
                <div className={s.hrBig}>{hr.z2Lo} ~ {hr.z2Hi}<span className={s.hrUnit}>bpm</span></div>
                <div className={s.hrMeta}>존2 (유산소) · 최대심박 {hr.maxHr} · {hr.method}</div>
              </div>
            )}
            <div className={s.infoBox}>
              💬 <strong>대화 테스트</strong> — 옆 사람과 문장을 끊김 없이 말할 수 있고, 코로만 호흡해도 버틸 정도면 이지 강도입니다. 말이 끊기면 너무 빠른 것.
            </div>
          </div>

          {/* 롱런 플래너 */}
          <div className={s.card}>
            <span className={s.cardLabel}>롱런 보급 플래너</span>
            <div className={s.segRow}>
              <button type="button" className={`${s.segBtn} ${longMode === 'dist' ? s.segActive : ''}`} onClick={() => setLongMode('dist')}>거리로</button>
              <button type="button" className={`${s.segBtn} ${longMode === 'time' ? s.segActive : ''}`} onClick={() => setLongMode('time')}>시간으로</button>
            </div>
            {longMode === 'dist' ? (
              <div className={s.longInputRow}>
                <input className={s.longInput} type="number" min={1} inputMode="decimal" value={longKm} onChange={e => setLongKm(e.target.value)} />
                <span className={s.longUnit}>km</span>
              </div>
            ) : (
              <div className={s.longInputRow}>
                <input className={s.longInput} type="number" min={10} inputMode="numeric" value={longMin} onChange={e => setLongMin(e.target.value)} />
                <span className={s.longUnit}>분</span>
              </div>
            )}
            {longRun && (
              <>
                <div className={s.longGrid}>
                  <div className={s.longBox}>
                    <div className={s.longLabel}>{longMode === 'dist' ? '예상 소요시간' : '예상 거리'}</div>
                    <div className={s.longVal}>{longMode === 'dist' ? fmtDur(longRun.durSec) : `${longRun.km.toFixed(1)}km`}</div>
                  </div>
                  <div className={s.longBox}>
                    <div className={s.longLabel}>수분 (총)</div>
                    <div className={s.longVal}>~{longRun.waterMl}ml</div>
                    <div className={s.longFoot}>15~20분마다 한 모금</div>
                  </div>
                  <div className={s.longBox}>
                    <div className={s.longLabel}>탄수 보급</div>
                    <div className={s.longVal}>{longRun.gels > 0 ? `젤 ~${longRun.gels}개` : '물만 OK'}</div>
                    <div className={s.longFoot}>{longRun.gels > 0 ? `~${longRun.carbsG}g · 30~45분마다` : '75분 미만은 불필요'}</div>
                  </div>
                </div>
                <div className={s.infoBox}>
                  🦵 마라톤 준비는 거리보다 <strong>&lsquo;발 위에서 보낸 시간(time on feet)&rsquo;</strong>이 핵심입니다. 처음 5~10분은 더 천천히 워밍업하고, 컨디션이 좋으면 마지막 구간만 살짝 올리세요(네거티브 스플릿).
                </div>
              </>
            )}
          </div>

          <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} type="button" onClick={handleCopy}>
            {copied ? '✓ 복사됨' : '📋 결과 복사'}
          </button>
        </>
      ) : (
        <div className={s.empty}>최근 기록(거리·시간)을 입력하면 이지 페이스와 존2 심박을 계산합니다.</div>
      )}
    </div>
  )
}
