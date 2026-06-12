'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './hyrox.module.css'
import {
  LEVELS, STATIONS, LEVEL_PRESETS, WEIGHT_TABLE, FIXED_SPECS, DIVISION_NOTE,
  RUN_COUNT, predict, requiredPace, fmtTime, fmtPace,
  type Level,
} from './hyroxData'

const STORAGE_KEY = 'youtil_hyrox_v1'
type Tab = 'predict' | 'target' | 'weights'

const num = (v: string): number => {
  const x = parseFloat(v)
  return Number.isFinite(x) && x >= 0 ? x : 0
}

export default function HyroxClient() {
  const [tab, setTab] = useState<Tab>('predict')
  const [level, setLevel] = useState<Level>('intermediate')

  // 페이스 입력 (m:ss 분리)
  const [paceMin, setPaceMin] = useState('5')
  const [paceSec, setPaceSec] = useState('30')
  // 스테이션 시간 (초) — 문자열로 자유 입력
  const [stationStr, setStationStr] = useState<Record<string, string>>(
    () => Object.fromEntries(STATIONS.map(st => [st.id, String(LEVEL_PRESETS.intermediate.stations[st.id])]))
  )
  const [roxStr, setRoxStr] = useState(String(LEVEL_PRESETS.intermediate.roxzoneSec))

  // 목표 역산
  const [tgtH, setTgtH] = useState('1')
  const [tgtM, setTgtM] = useState('30')

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const j = JSON.parse(raw)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (j.level) setLevel(j.level)
        if (j.paceMin) setPaceMin(j.paceMin)
        if (j.paceSec) setPaceSec(j.paceSec)
        if (j.stationStr) setStationStr(j.stationStr)
        if (j.roxStr) setRoxStr(j.roxStr)
      }
    } catch {}
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ level, paceMin, paceSec, stationStr, roxStr })) } catch {}
  }, [hydrated, level, paceMin, paceSec, stationStr, roxStr])

  // 레벨 적용 → 페이스·스테이션·록스존 기본값 채우기
  function applyLevel(lv: Level) {
    setLevel(lv)
    const p = LEVEL_PRESETS[lv]
    setPaceMin(String(Math.floor(p.runPaceSec / 60)))
    setPaceSec(String(p.runPaceSec % 60))
    setStationStr(Object.fromEntries(STATIONS.map(st => [st.id, String(p.stations[st.id])])))
    setRoxStr(String(p.roxzoneSec))
  }

  const runPaceSec = num(paceMin) * 60 + num(paceSec)
  const stationSec = useMemo(
    () => Object.fromEntries(STATIONS.map(st => [st.id, num(stationStr[st.id] ?? '0')])),
    [stationStr]
  )
  const roxzoneSec = num(roxStr)

  const result = useMemo(
    () => predict({ runPaceSec, stationSec, roxzoneSec }),
    [runPaceSec, stationSec, roxzoneSec]
  )

  // 분할표 (런/스테이션 교대, 누적)
  const splits = useMemo(() => {
    const rows: { label: string; time: number; cum: number; isRun: boolean }[] = []
    let cum = 0
    STATIONS.forEach((st, i) => {
      cum += runPaceSec
      rows.push({ label: `${i + 1}km 런`, time: runPaceSec, cum, isRun: true })
      const t = stationSec[st.id] || 0
      cum += t
      rows.push({ label: `${st.name}`, time: t, cum, isRun: false })
    })
    return rows
  }, [runPaceSec, stationSec])

  // 목표 역산
  const targetSec = num(tgtH) * 3600 + num(tgtM) * 60
  const reqPace = requiredPace(targetSec, result.stationTotalSec, roxzoneSec)

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/sports/pace', label: '러닝 페이스 계산기' },
          { href: '/tools/sports/vo2max', label: 'VO₂ Max 계산기' },
          { href: '/tools/sports/one-rm', label: '1RM 계산기' },
        ]}
      >
        스테이션 예상 시간은 개인 편차가 매우 큽니다. 레벨 기본값은 일반 참고 추정이며, 본인 기록으로 직접 수정해 사용하세요. 중량·규격은 시즌·대회에 따라 변경될 수 있어 공식 HYROX 규정을 우선합니다.
      </Disclaimer>

      <div className={s.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'predict'} className={`${s.tabBtn} ${tab === 'predict' ? s.tabActive : ''}`} onClick={() => setTab('predict')}>완주 시간 예측</button>
        <button type="button" role="tab" aria-selected={tab === 'target'} className={`${s.tabBtn} ${tab === 'target' ? s.tabActive : ''}`} onClick={() => setTab('target')}>목표 역산</button>
        <button type="button" role="tab" aria-selected={tab === 'weights'} className={`${s.tabBtn} ${tab === 'weights' ? s.tabActive : ''}`} onClick={() => setTab('weights')}>부문별 중량</button>
      </div>

      {/* ───────── 탭 1·2 공통 입력 ───────── */}
      {(tab === 'predict' || tab === 'target') && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>레벨 선택</span>
              <span className={s.cardHint}>기본값 자동 채움 · 수정 가능</span>
            </div>
            <div className={s.segRow}>
              {LEVELS.map(l => (
                <button key={l.id} type="button" className={`${s.segBtn} ${level === l.id ? s.segActive : ''}`} onClick={() => applyLevel(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 14 }}>
              <span className={s.fieldLabel}>1km 런 평균 페이스</span>
              <div className={s.inputRow}>
                <input className={s.numInput} inputMode="numeric" value={paceMin} onChange={e => setPaceMin(e.target.value.replace(/[^\d]/g, ''))} />
                <span className={s.unit}>분</span>
                <input className={s.numInput} inputMode="numeric" value={paceSec} onChange={e => setPaceSec(e.target.value.replace(/[^\d]/g, ''))} />
                <span className={s.unit}>초 / km</span>
              </div>
            </div>
          </div>

          {/* 스테이션 시간 입력 */}
          <div className={s.card}>
            <div className={s.cardLabel}>
              <span>스테이션별 예상 시간</span>
              <span className={s.cardHint}>초 단위</span>
            </div>
            <div className={s.stationGrid}>
              {STATIONS.map(st => (
                <div key={st.id} className={s.stationItem}>
                  <span className={s.stationName}>{st.name}<span className={s.stationSpec}>{st.spec}</span></span>
                  <div className={s.stationInputRow}>
                    <input className={s.stationInput} inputMode="numeric"
                      value={stationStr[st.id] ?? ''}
                      onChange={e => setStationStr(prev => ({ ...prev, [st.id]: e.target.value.replace(/[^\d]/g, '') }))} />
                    <span className={s.stationUnit}>초</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              <span className={s.fieldLabel}>록스존 (전환 8회 총합)</span>
              <div className={s.inputRow}>
                <input className={s.numInput} inputMode="numeric" value={roxStr} onChange={e => setRoxStr(e.target.value.replace(/[^\d]/g, ''))} />
                <span className={s.unit}>초</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ───────── 탭 1: 완주 시간 예측 ───────── */}
      {tab === 'predict' && (
        <>
          <div className={s.hero} role="status">
            <div className={s.heroLabel}>예상 완주 시간</div>
            <div className={s.heroNum}>{fmtTime(result.totalSec)}</div>
            <p className={s.heroSub}>
              런 8km <strong>{fmtTime(result.runTotalSec)}</strong> · 스테이션 <strong>{fmtTime(result.stationTotalSec)}</strong> · 록스존 <strong>{fmtTime(result.roxzoneSec)}</strong>
            </p>
          </div>

          {/* 비중 */}
          <div className={s.card}>
            <div className={s.cardLabel}><span>시간 비중 (런 vs 스테이션)</span></div>
            <div className={s.shareBar}>
              <div className={`${s.shareSeg} ${s.shareRun}`} style={{ width: `${result.runShare}%` }}>{result.runShare >= 12 ? `런 ${result.runShare.toFixed(0)}%` : ''}</div>
              <div className={`${s.shareSeg} ${s.shareStation}`} style={{ width: `${result.stationShare}%` }}>{result.stationShare >= 12 ? `스테이션 ${result.stationShare.toFixed(0)}%` : ''}</div>
              <div className={`${s.shareSeg} ${s.shareRox}`} style={{ width: `${result.roxShare}%` }}>{result.roxShare >= 12 ? `록스존 ${result.roxShare.toFixed(0)}%` : ''}</div>
            </div>
            <div className={s.shareLegend}>
              <span><i className={`${s.dot} ${s.shareRun}`} />런 {result.runShare.toFixed(0)}%</span>
              <span><i className={`${s.dot} ${s.shareStation}`} />스테이션 {result.stationShare.toFixed(0)}%</span>
              <span><i className={`${s.dot} ${s.shareRox}`} />록스존 {result.roxShare.toFixed(0)}%</span>
            </div>
            <p className={s.note}>
              엘리트일수록 런 비중이 높습니다(체력 우위). 스테이션 비중이 크면 근지구력·테크닉 보강이, 록스존이 크면 전환 효율 개선이 기록 단축 포인트입니다.
            </p>
          </div>

          {/* 구간 분할표 */}
          <div className={s.card}>
            <div className={s.cardLabel}><span>구간 분할 (누적 시간)</span></div>
            <table className={s.splitTable}>
              <thead>
                <tr><th scope="col">구간</th><th scope="col">시간</th><th scope="col">누적</th></tr>
              </thead>
              <tbody>
                {splits.map((r, i) => (
                  <tr key={i} className={r.isRun ? s.splitRun : ''}>
                    <td>{r.label}</td>
                    <td className={s.splitVal}>{fmtTime(r.time)}</td>
                    <td className={s.splitCum}>{fmtTime(r.cum)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ───────── 탭 2: 목표 역산 ───────── */}
      {tab === 'target' && (
        <div className={s.card}>
          <div className={s.cardLabel}>
            <span>목표 완주 시간 → 필요 런 페이스</span>
            <span className={s.cardHint}>위 스테이션 시간 가정</span>
          </div>
          <span className={s.fieldLabel}>목표 완주 시간</span>
          <div className={s.inputRow}>
            <input className={s.numInput} inputMode="numeric" value={tgtH} onChange={e => setTgtH(e.target.value.replace(/[^\d]/g, ''))} />
            <span className={s.unit}>시간</span>
            <input className={s.numInput} inputMode="numeric" value={tgtM} onChange={e => setTgtM(e.target.value.replace(/[^\d]/g, ''))} />
            <span className={s.unit}>분</span>
          </div>

          <div className={s.revResult}>
            {reqPace > 0 ? (
              <>
                <div className={s.revPace}>{fmtPace(reqPace)}<span className={s.revPaceUnit}> /km</span></div>
                <p className={s.revBreak}>
                  목표 <strong style={{ color: 'var(--text)' }}>{fmtTime(targetSec)}</strong> 달성 시 — 런 8km를 <strong style={{ color: 'var(--text)' }}>km당 {fmtPace(reqPace)}</strong> 페이스로.
                  <br />스테이션 {fmtTime(result.stationTotalSec)} + 록스존 {fmtTime(roxzoneSec)} = 비런 {fmtTime(result.stationTotalSec + roxzoneSec)} 가정
                </p>
              </>
            ) : (
              <p className={s.revBreak}>
                <span className={s.revWarn}>목표 시간이 스테이션+록스존 시간보다 짧습니다.</span><br />
                목표를 늘리거나 스테이션 예상 시간을 줄여보세요. (비런 합 {fmtTime(result.stationTotalSec + roxzoneSec)})
              </p>
            )}
          </div>
          <p className={s.note}>
            런 {RUN_COUNT}회 합계로 균등 분배한 평균 페이스입니다. 실제로는 후반 런이 느려지므로 초반은 이보다 약간 빠르게, 스테이션 직후 회복 구간을 감안해 페이싱하세요.
          </p>
        </div>
      )}

      {/* ───────── 탭 3: 부문별 중량 ───────── */}
      {tab === 'weights' && (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}><span>부문별 중량 (개인전)</span></div>
            <div className={s.tableWrap}>
              <table className={s.wTable}>
                <thead>
                  <tr>
                    <th scope="col">스테이션</th>
                    <th scope="col">Open 남</th>
                    <th scope="col">Open 여</th>
                    <th scope="col">Pro 남</th>
                    <th scope="col">Pro 여</th>
                  </tr>
                </thead>
                <tbody>
                  {WEIGHT_TABLE.map(r => (
                    <tr key={r.station}>
                      <td>{r.station}</td>
                      <td>{r.open_m}</td>
                      <td>{r.open_f}</td>
                      <td className={s.wProMale}>{r.pro_m}</td>
                      <td>{r.pro_f}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={s.note}>{DIVISION_NOTE}</p>
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}><span>중량 무관 종목 (공통 규격)</span></div>
            <div className={s.tableWrap}>
              <table className={s.wTable}>
                <tbody>
                  {FIXED_SPECS.map(r => (
                    <tr key={r.station}>
                      <td>{r.station}</td>
                      <td style={{ textAlign: 'right', fontFamily: "'Inter', system-ui, sans-serif" }}>{r.spec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
