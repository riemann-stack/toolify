'use client'

import dynamic from 'next/dynamic'
import Disclaimer from '@/components/Disclaimer'
import { useInitialTab } from '@/components/useInitialTab'
import { useState, useMemo, useRef } from 'react'
import s from './screw.module.css'
import type { BoltPreset } from './BoltTab'
import {
  SYSTEMS, MATERIALS, ENGAGEMENT_LABEL,
  METRIC_SCREWS, METRIC_QUICK,
  UNIFIED_SCREWS, PT_SCREWS, WOOD_PILOTS,
  STD_INCH_FRACTIONS, STD_MM_SIZES,
  calcMetricTapDrill, generalTorque,
  inchToMm, mmToInch, parseInchInput, mmToNearestFraction, fmtFraction,
  fmtMm, INCH_TO_MM,
  type ScrewSystem, type Material, type Engagement,
} from './screwUtils'

type TabKey = 'calc' | 'convert' | 'tables' | 'bolt'
// ?tab= 딥링크 허용 목록 — 'bolt'는 구 /tools/interior/bolt-wrench 301 목적지
const TABS: readonly TabKey[] = ['bolt', 'calc', 'convert', 'tables']

// 볼트·스패너 탭(구 bolt-wrench) — 지연 로드로 기본 탭(탭드릴 계산) 번들 유지
const BoltTab = dynamic(() => import('./BoltTab'), {
  loading: () => <p style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>불러오는 중…</p>,
})

export default function ScrewClient() {
  const [tab, setTab] = useState<TabKey>('calc')
  // 볼트·스패너 탭은 처음 열 때 마운트하고, 이후 다른 탭으로 가도 숨김만 해 입력(역검색·너트·와셔 선택)을 유지
  const [boltMounted, setBoltMounted] = useState(false)
  const [boltPreset, setBoltPreset] = useState<BoltPreset | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const selectTab = (t: TabKey) => {
    setTab(t)
    if (t === 'bolt') setBoltMounted(true)
  }
  useInitialTab(TABS, selectTab)
  // 탭드릴 결과의 「볼트·스패너 탭」 → 같은 호칭경으로 사이즈 찾기 열기 + 탭 줄로 스크롤
  const openBolt = (d: number) => {
    setBoltPreset((p) => ({ d, n: (p?.n ?? 0) + 1 }))
    selectTab('bolt')
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── 탭드릴 계산 입력 ────────────────
  const [system, setSystem] = useState<ScrewSystem>('metric')

  // 미터 나사
  const [metricDiameter, setMetricDiameter] = useState<number>(6)
  const [pitchMode, setPitchMode] = useState<'coarse' | 'fine' | 'custom'>('coarse')
  const [customPitchStr, setCustomPitchStr] = useState<string>('1.0')

  // 유니파이
  const [unifiedKey, setUnifiedKey] = useState<string>('1/4-20')

  // 파이프
  const [pipeKey, setPipeKey] = useState<string>('PT 1/4')

  // 목재/석고 — 입력 문자열을 그대로 보관하고 계산 시점에 파싱(지우기·0.x 입력 가능)
  const [woodDiameterStr, setWoodDiameterStr] = useState<string>('3.5')
  const [woodLengthStr, setWoodLengthStr] = useState<string>('30')
  const [woodHardness, setWoodHardness] = useState<'hard' | 'soft'>('hard')

  // 공통 옵션
  const [material, setMaterial] = useState<Material>('steel')
  const [engagement, setEngagement] = useState<Engagement>(75)

  // ── 미터 나사 spec ───────────────────
  const metricSpec = useMemo(() => METRIC_SCREWS.find((m) => m.diameter === metricDiameter), [metricDiameter])
  // 직접 입력 피치: 빈 값·0 이하는 null(결과 대신 안내), 그 외 0.1~3mm로 클램프
  const customPitch = useMemo(() => {
    const p = parseFloat(customPitchStr)
    return Number.isFinite(p) && p > 0 ? Math.min(3, Math.max(0.1, p)) : null
  }, [customPitchStr])
  const currentPitch = useMemo<number | null>(() => {
    if (pitchMode === 'custom') return customPitch
    if (pitchMode === 'fine' && metricSpec?.pitchFine) return metricSpec.pitchFine
    return metricSpec?.pitchCoarse ?? 1.0
  }, [pitchMode, customPitch, metricSpec])
  const metricTapDrill = useMemo(() => {
    if (!metricSpec || currentPitch === null) return null
    const d = calcMetricTapDrill(metricDiameter, currentPitch, engagement, material)
    return d > 0 ? d : null   // 피치가 외경에 비해 지나치게 크면 물리적으로 불가능한 값 → 안내
  }, [metricSpec, metricDiameter, currentPitch, engagement, material])
  // 관통홀은 ISO 273 표값(spec)을 직접 사용 — 사이즈 표 탭과 일치
  const metricClearance = useMemo(() => metricSpec
    ? { tight: metricSpec.clearanceTight, normal: metricSpec.clearanceNormal, loose: metricSpec.clearanceLoose }
    : { tight: 0, normal: 0, loose: 0 }, [metricSpec])
  const metricTorque = useMemo(() => generalTorque(metricDiameter), [metricDiameter])

  // ── 유니파이 spec ────────────────────
  // 현재 계열(UNC/UNF)의 규격만 대상으로 찾고, 없으면(계열 전환 직후) 그 계열의 첫 규격으로 fallback
  // — 셀렉트에 보이는 값과 결과가 항상 일치
  const unifiedSpec = useMemo(() => {
    const list = UNIFIED_SCREWS.filter((u) => u.system === system)
    return list.find((u) => u.label === unifiedKey) ?? list[0]
  }, [system, unifiedKey])

  // ── 파이프 spec (PT/NPT도 같은 방식) ──
  const pipeSpec = useMemo(() => {
    const list = PT_SCREWS.filter((p) => p.system === system)
    return list.find((p) => p.label === pipeKey) ?? list[0]
  }, [system, pipeKey])

  // ── 목재 spec ────────────────────────
  const woodDiameterNum = parseFloat(woodDiameterStr)
  const woodDiameter = Number.isFinite(woodDiameterNum) && woodDiameterNum > 0 ? Math.min(10, woodDiameterNum) : null
  const woodLengthNum = parseFloat(woodLengthStr)
  const woodLength = Number.isFinite(woodLengthNum) && woodLengthNum > 0 ? Math.min(300, woodLengthNum) : null
  const woodSpec = useMemo(() => {
    if (woodDiameter === null) return WOOD_PILOTS[0]
    // 가까운 표준 사이즈 찾기
    const sorted = WOOD_PILOTS.slice().sort((a, b) =>
      Math.abs(a.diameter - woodDiameter) - Math.abs(b.diameter - woodDiameter))
    return sorted[0]
  }, [woodDiameter])
  const woodPilot = woodHardness === 'hard' ? woodSpec.hardwood : woodSpec.softwood
  const woodPilotRatio = woodDiameter ? Math.round((woodPilot / woodDiameter) * 100) : 0
  // WOOD_PILOTS 데이터 범위(2.5~6.0mm)를 벗어나면 가장 가까운 값으로 근사
  const woodOutOfRange = woodDiameter !== null && (woodDiameter > 6.0 || woodDiameter < 2.5)

  // ── 인치 ↔ mm 변환 ──────────────────
  const [inchInput, setInchInput] = useState<string>('1/2')
  const [mmInput, setMmInput] = useState<string>('25.4')
  const inchValue = useMemo(() => parseInchInput(inchInput), [inchInput])
  const mmValue = useMemo(() => Math.max(0, parseFloat(mmInput) || 0), [mmInput])
  const inchToMmResult = inchValue !== null ? inchToMm(inchValue) : null
  const mmToInchResult = mmValue > 0 ? mmToInch(mmValue) : null
  const mmToFraction = mmValue > 0 ? mmToNearestFraction(mmValue, 64) : null
  const mmToFraction32 = mmValue > 0 ? mmToNearestFraction(mmValue, 32) : null

  return (
    <div className={s.wrap}>
      {/* 면책 */}
      <Disclaimer
        variant="safety"
        related={[
          { href: '/tools/interior/wallpaper', label: '도배 소요량' },
          { href: '/tools/interior/paint', label: '페인트 계산' },
          { href: '/tools/interior/room-area', label: '방 면적 계산' }
        ]}
      >
        본 도구는 KS·DIN·ISO·JIS 표준 사이즈 기준의 일반 가이드이며, 실제 호환성은 ±0.1~0.5mm 차이가 날 수 있습니다. <strong>특정 브랜드·공구 추천, 정확한 토크값, 인장·전단강도는 보장하지 않으며 항공·자동차 등 정밀 산업에는 적용하지 마세요.</strong> ⚠️ 드릴 작업 시 보안경을 쓰고, 회전하는 드릴에는 면장갑처럼 말려 들어갈 수 있는 장갑을 끼지 마세요. 스테인리스·알루미늄은 절삭유를 사용하세요. 응급 시 119.
      </Disclaimer>

      {/* 탭 */}
      <div ref={tabsRef} className={`${s.tabs} ${s.tabs4}`} role="tablist" aria-label="나사 규격 도구 모드">
        <button type="button" role="tab" aria-selected={tab === 'calc'} className={`${s.tab} ${tab === 'calc' ? s.tabActive : ''}`} onClick={() => selectTab('calc')}>탭드릴 계산</button>
        <button type="button" role="tab" aria-selected={tab === 'convert'} className={`${s.tab} ${tab === 'convert' ? s.tabActive : ''}`} onClick={() => selectTab('convert')}>인치 ↔ mm</button>
        <button type="button" role="tab" aria-selected={tab === 'tables'} className={`${s.tab} ${tab === 'tables' ? s.tabActive : ''}`} onClick={() => selectTab('tables')}>사이즈 표</button>
        <button type="button" role="tab" aria-selected={tab === 'bolt'} className={`${s.tab} ${tab === 'bolt' ? s.tabActive : ''}`} onClick={() => selectTab('bolt')}>볼트·스패너</button>
      </div>

      {/* ══════════ TAB 1: 탭드릴 계산 ══════════ */}
      {tab === 'calc' && (
        <>
          {/* 나사 종류 */}
          <div className={s.card}>
            <span className={s.cardLabel}>① 나사 종류</span>
            <div className={s.systemGrid}>
              {SYSTEMS.map((sys) => (
                <button key={sys.key} type="button" aria-pressed={system === sys.key}
                  className={`${s.systemBtn} ${system === sys.key ? s.systemBtnActive : ''}`}
                  onClick={() => setSystem(sys.key)}>
                  <span className={s.systemEmoji} aria-hidden="true">{sys.emoji}</span>
                  <span className={s.systemLabel}>{sys.label}</span>
                  <span className={s.systemDesc}>{sys.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 미터 나사 — 사이즈·피치 */}
          {system === 'metric' && (
            <>
              <div className={s.card}>
                <span className={s.cardLabel}>② 호칭 사이즈</span>
                <div className={s.pillRow}>
                  {METRIC_QUICK.map((d) => (
                    <button key={d} type="button" aria-pressed={metricDiameter === d}
                      className={`${s.pill} ${metricDiameter === d ? s.pillActive : ''}`}
                      onClick={() => setMetricDiameter(d)}>M{d}</button>
                  ))}
                </div>
                <div className={s.customInput}>
                  <select className={s.input} aria-label="미터 나사 호칭 사이즈"
                    value={metricDiameter}
                    onChange={(e) => setMetricDiameter(parseFloat(e.target.value))}>
                    {METRIC_SCREWS.map((m) => (
                      <option key={m.diameter} value={m.diameter}>M{m.diameter} (외경 {m.diameter}mm)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>③ 피치 (mm)</span>
                <div className={s.pillRow}>
                  <button type="button" aria-pressed={pitchMode === 'coarse'} className={`${s.pill} ${pitchMode === 'coarse' ? s.pillActive : ''}`}
                    onClick={() => setPitchMode('coarse')}>
                    표준 ({metricSpec?.pitchCoarse}mm)
                  </button>
                  {metricSpec?.pitchFine && (
                    <button type="button" aria-pressed={pitchMode === 'fine'} className={`${s.pill} ${pitchMode === 'fine' ? s.pillActive : ''}`}
                      onClick={() => setPitchMode('fine')}>
                      정밀 ({metricSpec.pitchFine}mm)
                    </button>
                  )}
                  <button type="button" aria-pressed={pitchMode === 'custom'} className={`${s.pill} ${pitchMode === 'custom' ? s.pillActive : ''}`}
                    onClick={() => setPitchMode('custom')}>직접 입력</button>
                </div>
                {pitchMode === 'custom' && (
                  <div className={s.customInput}>
                    <input type="number" inputMode="decimal" min={0.25} max={3.0} step={0.05}
                      className={s.input}
                      aria-label="피치 직접 입력 (mm)"
                      value={customPitchStr}
                      onChange={(e) => setCustomPitchStr(e.target.value)} />
                    <span className={s.unitText}>mm</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 유니파이 사이즈 */}
          {(system === 'unc' || system === 'unf') && (
            <div className={s.card}>
              <span className={s.cardLabel}>② {system === 'unc' ? 'UNC' : 'UNF'} 사이즈</span>
              <select className={s.input} aria-label={`${system === 'unc' ? 'UNC' : 'UNF'} 나사 사이즈`}
                value={unifiedSpec?.label ?? ''}
                onChange={(e) => setUnifiedKey(e.target.value)}>
                {UNIFIED_SCREWS.filter((u) => u.system === system).map((u) => (
                  <option key={u.label} value={u.label}>
                    {u.label} ({u.system.toUpperCase()}) · 외경 {u.diameterMm.toFixed(2)}mm · {u.tpi} TPI
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 파이프 사이즈 */}
          {(system === 'pt' || system === 'npt') && (
            <div className={s.card}>
              <span className={s.cardLabel}>② {system === 'pt' ? 'PT' : 'NPT'} 사이즈</span>
              <select className={s.input} aria-label={`${system === 'pt' ? 'PT' : 'NPT'} 파이프 나사 사이즈`}
                value={pipeSpec?.label ?? ''}
                onChange={(e) => setPipeKey(e.target.value)}>
                {PT_SCREWS.filter((p) => p.system === system).map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label} · 외경 {p.outerDiameterMm}mm · 산 {p.threadsPerInch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 목재/석고 사이즈 */}
          {(system === 'wood' || system === 'drywall') && (
            <div className={s.card}>
              <span className={s.cardLabel}>② {system === 'wood' ? '목재피스' : '석고피스'} 사이즈</span>
              <div className={s.row2}>
                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="screw-mm">직경 (mm)</label>
                  <input id="screw-mm" type="number" inputMode="decimal" min={2} max={10} step={0.5}
                    className={s.input}
                    value={woodDiameterStr}
                    onChange={(e) => setWoodDiameterStr(e.target.value)} />
                  <div className={s.pillRow}>
                    {[3.0, 3.5, 4.0, 4.5, 5.0].map((d) => (
                      <button key={d} type="button" aria-pressed={woodDiameter === d}
                        className={`${s.pill} ${woodDiameter === d ? s.pillActive : ''}`}
                        onClick={() => setWoodDiameterStr(String(d))}>{d}mm</button>
                    ))}
                  </div>
                </div>
                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="screw-mm-2">길이 (mm)</label>
                  <input id="screw-mm-2" type="number" inputMode="numeric" min={10} max={150} step={5}
                    className={s.input}
                    value={woodLengthStr}
                    onChange={(e) => setWoodLengthStr(e.target.value)} />
                  <div className={s.pillRow}>
                    {[20, 30, 40, 50, 65].map((l) => (
                      <button key={l} type="button" aria-pressed={woodLength === l}
                        className={`${s.pill} ${woodLength === l ? s.pillActive : ''}`}
                        onClick={() => setWoodLengthStr(String(l))}>{l}mm</button>
                    ))}
                  </div>
                </div>
              </div>
              {system === 'wood' && (
                <div className={s.field} style={{ marginTop: 10 }} role="group" aria-labelledby="screw-wood-kind">
                  <span className={s.fieldLabel} id="screw-wood-kind">목재 종류</span>
                  <div className={s.pillRow}>
                    <button type="button" aria-pressed={woodHardness === 'hard'} className={`${s.pill} ${woodHardness === 'hard' ? s.pillActive : ''}`}
                      onClick={() => setWoodHardness('hard')}>경질목 (오크·메이플)</button>
                    <button type="button" aria-pressed={woodHardness === 'soft'} className={`${s.pill} ${woodHardness === 'soft' ? s.pillActive : ''}`}
                      onClick={() => setWoodHardness('soft')}>연질목 (소나무·삼나무)</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 소재 (미터 나사만 탭드릴 보정에 반영됨) */}
          {system === 'metric' && (
            <div className={s.card}>
              <span className={s.cardLabel}>④ 소재 (탭드릴 보정)</span>
              <div className={s.materialGrid}>
                {MATERIALS.map((m) => (
                  <button key={m.key} type="button" aria-pressed={material === m.key}
                    className={`${s.materialBtn} ${material === m.key ? s.materialBtnActive : ''}`}
                    onClick={() => setMaterial(m.key)}>
                    <span className={s.materialEmoji} aria-hidden="true">{m.emoji}</span>
                    <span className={s.materialLabel}>{m.label}</span>
                    <span className={s.materialNote}>{m.note}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 결합률 (M만) */}
          {system === 'metric' && (
            <div className={s.card}>
              <span className={s.cardLabel}>⑤ 결합률 (탭드릴 정밀도)</span>
              <div className={s.pillRow}>
                {([50, 75, 85] as Engagement[]).map((e) => (
                  <button key={e} type="button" aria-pressed={engagement === e}
                    className={`${s.pill} ${engagement === e ? s.pillActive : ''}`}
                    onClick={() => setEngagement(e)}>
                    {ENGAGEMENT_LABEL[e]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══════════ 결과 — 미터 ══════════ */}
          {system === 'metric' && metricSpec && metricTapDrill === null && (
            <div className={s.hero} role="status">
              <p className={s.heroLabel}>M{metricDiameter}</p>
              <p className={s.heroSub}>
                {currentPitch === null
                  ? '피치(mm)를 입력하세요 — 예: 0.75, 1.25'
                  : `피치 ${currentPitch}mm는 M${metricDiameter}에 비해 너무 커요. 피치를 확인하세요.`}
              </p>
            </div>
          )}
          {system === 'metric' && metricSpec && metricTapDrill !== null && currentPitch !== null && (
            <>
              <div className={s.hero} role="status">
                <p className={s.heroLabel}>M{metricDiameter} × P{currentPitch} ({MATERIALS.find((m) => m.key === material)?.label})</p>
                <p className={s.heroValue}>탭드릴 약 <strong>{metricTapDrill.toFixed(2)}mm</strong></p>
                <p className={s.heroSub}>{engagement}% 결합률 · 외경 {metricDiameter}mm · 피치 {currentPitch}mm</p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>탭드릴·관통홀</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr className={s.rowBig}>
                      <td>탭드릴 (탭 가공용)</td>
                      <td className={s.cellAccent}>∅{metricTapDrill.toFixed(2)}mm</td>
                    </tr>
                    <tr><td colSpan={2} className={s.cellSubtitle}>관통홀 (볼트 통과용)</td></tr>
                    <tr>
                      <td>정밀 끼워맞춤</td>
                      <td>∅{metricClearance.tight.toFixed(1)}mm</td>
                    </tr>
                    <tr>
                      <td>일반</td>
                      <td className={s.cellAccent}>∅{metricClearance.normal.toFixed(1)}mm</td>
                    </tr>
                    <tr>
                      <td>헐거움</td>
                      <td>∅{metricClearance.loose.toFixed(1)}mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>호환 공구</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr>
                      <td>육각렌치 (알렌키)</td>
                      <td className={s.cellAccent}>{metricSpec.hexWrench}mm</td>
                    </tr>
                    <tr>
                      <td>스패너 (대변거리)</td>
                      <td className={s.cellAccent}>
                        {metricSpec.spanner}mm
                        {metricSpec.spannerISO && metricSpec.spannerISO !== metricSpec.spanner && (
                          <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · ISO {metricSpec.spannerISO}mm</span>
                        )}
                      </td>
                    </tr>
                    {metricTorque && (
                      <tr>
                        <td>일반 토크 (참고만)</td>
                        <td>약 {metricTorque.min}~{metricTorque.max} N·m</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {metricTorque && (
                  <p className={s.noteSmall}>
                    ⚠️ 토크값은 <strong>8.8 등급</strong> 일반 참고. 정확한 토크는 제조사 사양·기계 매뉴얼 확인.
                  </p>
                )}
                <p className={s.noteSmall}>
                  🔧 스패너 치수는 구 DIN·KS 부속서 기준이며, 현행 ISO 볼트는 M10·M12·M14가 한 치수 작습니다. 규격별 머리 크기 차이, 머리 모양별 알렌 사이즈, 강도등급별 토크는{' '}
                  <button type="button" className={s.inlineLink} onClick={() => openBolt(metricDiameter)}>볼트·스패너 탭</button>에서 자세히 확인하세요.
                </p>
              </div>
            </>
          )}

          {/* ══════════ 결과 — 유니파이 ══════════ */}
          {(system === 'unc' || system === 'unf') && unifiedSpec && (
            <>
              <div className={s.hero} role="status">
                <p className={s.heroLabel}>{unifiedSpec.label} ({unifiedSpec.system.toUpperCase()})</p>
                <p className={s.heroValue}>탭드릴 약 <strong>{unifiedSpec.tapDrillMm}mm</strong></p>
                <p className={s.heroSub}>외경 {unifiedSpec.diameterInch}&quot; ({unifiedSpec.diameterMm.toFixed(2)}mm) · {unifiedSpec.tpi} TPI</p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>탭드릴·관통홀</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr className={s.rowBig}>
                      <td>탭드릴</td>
                      <td className={s.cellAccent}>∅{unifiedSpec.tapDrillMm}mm</td>
                    </tr>
                    <tr>
                      <td>관통홀 (일반)</td>
                      <td className={s.cellAccent}>∅{unifiedSpec.clearanceMm}mm</td>
                    </tr>
                    <tr>
                      <td>외경 (인치 / mm)</td>
                      <td>{unifiedSpec.diameterInch}&quot; / {unifiedSpec.diameterMm.toFixed(2)}mm</td>
                    </tr>
                    <tr>
                      <td>피치 환산</td>
                      <td>{(25.4 / unifiedSpec.tpi).toFixed(2)}mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ══════════ 결과 — 파이프 ══════════ */}
          {(system === 'pt' || system === 'npt') && pipeSpec && (
            <>
              <div className={s.hero} role="status">
                <p className={s.heroLabel}>{pipeSpec.label}</p>
                <p className={s.heroValue}>탭드릴 약 <strong>{pipeSpec.tapDrillMm}mm</strong></p>
                <p className={s.heroSub}>외경 {pipeSpec.outerDiameterMm}mm · 산둘레 {pipeSpec.threadsPerInch}/인치</p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>파이프 나사 정보</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr className={s.rowBig}>
                      <td>탭드릴</td>
                      <td className={s.cellAccent}>∅{pipeSpec.tapDrillMm}mm</td>
                    </tr>
                    <tr><td>외경</td><td>{pipeSpec.outerDiameterMm}mm</td></tr>
                    <tr><td>산둘레 (TPI)</td><td>{pipeSpec.threadsPerInch}</td></tr>
                  </tbody>
                </table>
                <p className={s.noteSmall}>
                  ⚠️ 파이프 나사는 <strong>테이퍼(taper)</strong> 형태 — 끼워질수록 조여짐. 누수 방지에 시일제(테플론 테이프) 권장.
                </p>
              </div>
            </>
          )}

          {/* ══════════ 결과 — 목재/석고 ══════════ */}
          {(system === 'wood' || system === 'drywall') && woodDiameter === null && (
            <div className={s.hero} role="status">
              <p className={s.heroSub}>피스 직경(mm)을 입력하세요 — 예: 3.5</p>
            </div>
          )}
          {(system === 'wood' || system === 'drywall') && woodDiameter !== null && (
            <>
              <div className={s.hero} role="status">
                <p className={s.heroLabel}>{system === 'wood' ? '목재피스' : '석고피스'} {woodDiameter}×{woodLength ?? '—'}mm</p>
                <p className={s.heroValue}>
                  파일럿홀 약 <strong>
                    {system === 'wood' ? `${woodPilot.toFixed(1)}mm` : '불필요'}
                  </strong>
                </p>
                <p className={s.heroSub}>
                  {system === 'wood'
                    ? `${woodHardness === 'hard' ? '경질목' : '연질목'} 기준 (외경의 약 ${woodPilotRatio}%)${woodOutOfRange ? ` · ⚠️ ${woodSpec.diameter}mm 기준 근사` : ''}`
                    : '석고보드는 직접 박기 가능 (드라이버 직결)'}
                </p>
              </div>

              {system === 'wood' && (
                <div className={s.card}>
                  <span className={s.cardLabel}>목재피스 파일럿홀</span>
                  <table className={s.detailTable}>
                    <tbody>
                      <tr className={s.rowBig}>
                        <td>경질목 (오크·메이플·티크)</td>
                        <td className={s.cellAccent}>∅{woodSpec.hardwood.toFixed(1)}mm</td>
                      </tr>
                      <tr className={s.rowBig}>
                        <td>연질목 (소나무·삼나무·MDF)</td>
                        <td className={s.cellAccent}>∅{woodSpec.softwood.toFixed(1)}mm</td>
                      </tr>
                      <tr><td>외경 (실측 권장)</td><td>{woodDiameter}mm</td></tr>
                      <tr><td>길이</td><td>{woodLength ?? '—'}mm</td></tr>
                      <tr>
                        <td>카운터싱크 권장 (접시머리)</td>
                        <td>∅{(woodDiameter * 1.8).toFixed(1)}mm · 깊이 ≈ 나사 머리 두께</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className={s.noteSmall}>
                    💡 두께가 얇은 합판·MDF는 파일럿홀 필수 (균열 방지). 두꺼운 무늬목은 파일럿 + 카운터싱크 권장.
                  </p>
                </div>
              )}

              {system === 'drywall' && (
                <div className={s.card}>
                  <span className={s.cardLabel}>석고피스 정보</span>
                  <table className={s.detailTable}>
                    <tbody>
                      <tr><td>외경</td><td>{woodDiameter}mm</td></tr>
                      <tr><td>길이</td><td>{woodLength ?? '—'}mm</td></tr>
                      <tr><td>파일럿홀</td><td className={s.cellAccent}>불필요 (직접 박기)</td></tr>
                      <tr><td>드라이버</td><td>+ (Phillips) 또는 PH2</td></tr>
                    </tbody>
                  </table>
                  <p className={s.noteSmall}>
                    💡 석고보드를 목상(각재)·경량철골에 고정하는 용도입니다. 보드만으로는 나사가 거의 버티지 못하니 뒤의 목상·스터드까지 박히는 길이를 고르세요. 콘크리트는 칼블록 + 콘크리트 앵커 사용.
                    <br />⚠️ 선반·거울·TV 등 <strong>하중물은 석고피스만으로 부족</strong> — 토글 앵커 또는 스터드(목상) 위에 고정하세요.
                  </p>
                </div>
              )}
            </>
          )}

          {/* 면책 — 안전 */}
          <div className={s.warnCard}>
            <strong>⚠️ 안전 주의</strong>
            <p>
              드릴 작업 시 보안경 필수 — 회전하는 드릴에 면장갑·헐거운 장갑은 말려 들어가므로 금지. 절삭유 사용 (특히 스테인리스·알루미늄). 본 도구는 일반 가이드 — 정확한 호환성은 실측 권장. 항공·자동차 등 정밀 산업은 표준 인증서 확인.
            </p>
          </div>
        </>
      )}

      {/* ══════════ TAB 2: 인치 ↔ mm — 2분할 (모바일도 좌·우) ══════════ */}
      {tab === 'convert' && (
        <>
          <div className={s.convertSplit}>
            <div className={s.card}>
              <span className={s.cardLabel}>인치 → mm</span>
              <input type="text" className={s.input}
                aria-label="인치 입력 (분수 또는 소수)"
                placeholder='예: 5/8 또는 0.625'
                value={inchInput}
                onChange={(e) => setInchInput(e.target.value)} />
              <div className={s.pillRow} style={{ marginTop: 8 }}>
                {STD_INCH_FRACTIONS.map((f) => (
                  <button key={f.label} type="button"
                    className={s.pill}
                    onClick={() => setInchInput(f.label)}>{f.label}&quot;</button>
                ))}
              </div>
              {inchValue !== null && inchToMmResult !== null && (
                <div className={s.convertResult}>
                  <p className={s.convertLabel}>{inchValue}&quot;</p>
                  <p className={s.convertValue}>{inchToMmResult.toFixed(3)}mm</p>
                </div>
              )}
              {inchInput.trim() !== '' && inchValue === null && (
                <p className={s.noteSmall}>입력 형식을 확인하세요 — 예: 5/8, 1 1/2, 0.625</p>
              )}
            </div>

            <div className={s.card}>
              <span className={s.cardLabel}>mm → 인치</span>
              <input type="number" inputMode="decimal" min={0} step={0.1}
                className={s.input}
                aria-label="mm 입력"
                placeholder="예: 25.4"
                value={mmInput}
                onChange={(e) => setMmInput(e.target.value)} />
              <div className={s.pillRow} style={{ marginTop: 8 }}>
                {STD_MM_SIZES.map((m) => (
                  <button key={m} type="button"
                    className={s.pill}
                    onClick={() => setMmInput(String(m))}>{m}mm</button>
                ))}
              </div>
              {mmValue > 0 && mmToInchResult !== null && mmToFraction && mmToFraction32 && (
                <div className={s.convertResult}>
                  <p className={s.convertLabel}>{mmValue}mm</p>
                  <p className={s.convertValue}>{mmToInchResult.toFixed(4)}&quot;</p>
                  <p className={s.convertSub}>
                    ≈ {fmtFraction(mmToFraction)} (1/64){mmToFraction.exact ? ' ✓' : ''}
                  </p>
                  <p className={s.convertSub}>
                    ≈ {fmtFraction(mmToFraction32)} (1/32){mmToFraction32.exact ? ' ✓' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 변환 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>표준 인치 ↔ mm 변환표</span>
            <table className={s.compactTable}>
              <thead>
                <tr><th scope="col">인치</th><th scope="col">mm</th><th scope="col">인치</th><th scope="col">mm</th></tr>
              </thead>
              <tbody>
                {[
                  ['1/64', 0.397, '17/64', 6.747],
                  ['1/32', 0.794, '5/16', 7.938],
                  ['1/16', 1.588, '3/8', 9.525],
                  ['3/32', 2.381, '7/16', 11.113],
                  ['1/8', 3.175, '1/2', 12.700],
                  ['5/32', 3.969, '9/16', 14.288],
                  ['3/16', 4.763, '5/8', 15.875],
                  ['7/32', 5.556, '11/16', 17.463],
                  ['1/4', 6.350, '3/4', 19.050],
                ].map((row, i) => (
                  <tr key={i}>
                    <td className={s.cellAccent}>{row[0]}&quot;</td>
                    <td className={s.cellMono}>{(row[1] as number).toFixed(2)}</td>
                    <td className={s.cellAccent}>{row[2]}&quot;</td>
                    <td className={s.cellMono}>{(row[3] as number).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td className={s.cellAccent}>13/16&quot;</td>
                  <td className={s.cellMono}>{(13 * INCH_TO_MM / 16).toFixed(2)}</td>
                  <td className={s.cellAccent}>1&quot;</td>
                  <td className={s.cellMono}>25.40</td>
                </tr>
                <tr>
                  <td className={s.cellAccent}>7/8&quot;</td>
                  <td className={s.cellMono}>{(7 * INCH_TO_MM / 8).toFixed(2)}</td>
                  <td className={s.cellAccent}>2&quot;</td>
                  <td className={s.cellMono}>50.80</td>
                </tr>
              </tbody>
            </table>
            <p className={s.noteSmall}>1인치 = {INCH_TO_MM}mm (정확값) · {fmtMm(INCH_TO_MM, 1)} (반올림)</p>
          </div>
        </>
      )}

      {/* ══════════ TAB 3: 사이즈 표 ══════════ */}
      {tab === 'tables' && (
        <>
          {/* 미터 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>미터 나사 (Metric) — 자주 쓰는 사이즈</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">호칭</th>
                    <th scope="col">외경</th>
                    <th scope="col">피치 (표준)</th>
                    <th scope="col">피치 (정밀)</th>
                    <th scope="col">탭드릴 75%</th>
                    <th scope="col">관통홀 (일반)</th>
                    <th scope="col">육각</th>
                    <th scope="col">스패너 (구 DIN)</th>
                  </tr>
                </thead>
                <tbody>
                  {METRIC_SCREWS.map((m) => (
                    <tr key={m.diameter}>
                      <td className={s.cellAccent}>M{m.diameter}</td>
                      <td className={s.cellMono}>{m.diameter}</td>
                      <td className={s.cellMono}>{m.pitchCoarse}</td>
                      <td className={s.cellMono}>{m.pitchFine ?? '—'}</td>
                      <td className={s.cellMono}>{m.tapDrill75}</td>
                      <td className={s.cellMono}>{m.clearanceNormal}</td>
                      <td className={s.cellMono}>{m.hexWrench}</td>
                      <td className={s.cellMono}>{m.spanner}{m.spannerISO && m.spannerISO !== m.spanner ? ` (ISO ${m.spannerISO})` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 유니파이 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>유니파이 나사 (UNC / UNF)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">호칭</th>
                    <th scope="col">외경 (mm)</th>
                    <th scope="col">TPI</th>
                    <th scope="col">피치 (mm)</th>
                    <th scope="col">탭드릴</th>
                    <th scope="col">관통홀</th>
                  </tr>
                </thead>
                <tbody>
                  {UNIFIED_SCREWS.map((u) => (
                    <tr key={`${u.label}-${u.system}`}>
                      <td className={s.cellAccent}>{u.label} ({u.system.toUpperCase()})</td>
                      <td className={s.cellMono}>{u.diameterMm.toFixed(2)}</td>
                      <td className={s.cellMono}>{u.tpi}</td>
                      <td className={s.cellMono}>{(25.4 / u.tpi).toFixed(2)}</td>
                      <td className={s.cellMono}>{u.tapDrillMm}</td>
                      <td className={s.cellMono}>{u.clearanceMm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 파이프 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>파이프 나사 (PT / NPT)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">호칭</th>
                    <th scope="col">산둘레</th>
                    <th scope="col">외경 (mm)</th>
                    <th scope="col">탭드릴</th>
                  </tr>
                </thead>
                <tbody>
                  {PT_SCREWS.map((p) => (
                    <tr key={p.label}>
                      <td className={s.cellAccent}>{p.label}</td>
                      <td className={s.cellMono}>{p.threadsPerInch}</td>
                      <td className={s.cellMono}>{p.outerDiameterMm}</td>
                      <td className={s.cellMono}>{p.tapDrillMm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 목재 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>목재피스 파일럿홀 가이드</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th scope="col">피스 직경</th>
                    <th scope="col">경질목 (오크·메이플)</th>
                    <th scope="col">연질목 (소나무·삼나무)</th>
                  </tr>
                </thead>
                <tbody>
                  {WOOD_PILOTS.map((w) => (
                    <tr key={w.diameter}>
                      <td className={s.cellAccent}>{w.diameter}mm</td>
                      <td className={s.cellMono}>{w.hardwood}mm</td>
                      <td className={s.cellMono}>{w.softwood}mm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={s.noteSmall}>
              💡 두께가 얇은 합판·MDF는 파일럿홀 필수 (균열 방지). 카운터싱크는 직경의 1.8배 권장.
            </p>
          </div>
        </>
      )}

      {/* ══════════ TAB 4: 볼트·스패너 (구 bolt-wrench) — 한 번 연 뒤엔 숨김만 해서 입력 유지 ══════════ */}
      {boltMounted && (
        <div hidden={tab !== 'bolt'}>
          <BoltTab preset={boltPreset} />
        </div>
      )}

    </div>
  )
}
