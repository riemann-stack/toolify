'use client'

import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import { useState, useMemo } from 'react'
import s from './screw.module.css'
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

type TabKey = 'calc' | 'convert' | 'tables'

export default function ScrewClient() {
  const [tab, setTab] = useState<TabKey>('calc')

  // ── 탭드릴 계산 입력 ────────────────
  const [system, setSystem] = useState<ScrewSystem>('metric')

  // 미터 나사
  const [metricDiameter, setMetricDiameter] = useState<number>(6)
  const [pitchMode, setPitchMode] = useState<'coarse' | 'fine' | 'custom'>('coarse')
  const [customPitch, setCustomPitch] = useState<number>(1.0)

  // 유니파이
  const [unifiedKey, setUnifiedKey] = useState<string>('1/4-20')

  // 파이프
  const [pipeKey, setPipeKey] = useState<string>('PT 1/4')

  // 목재/석고
  const [woodDiameter, setWoodDiameter] = useState<number>(3.5)
  const [woodLength, setWoodLength] = useState<number>(30)
  const [woodHardness, setWoodHardness] = useState<'hard' | 'soft'>('hard')

  // 공통 옵션
  const [material, setMaterial] = useState<Material>('steel')
  const [engagement, setEngagement] = useState<Engagement>(75)

  // ── 미터 나사 spec ───────────────────
  const metricSpec = useMemo(() => METRIC_SCREWS.find((m) => m.diameter === metricDiameter), [metricDiameter])
  const currentPitch = useMemo(() => {
    if (pitchMode === 'custom') return customPitch
    if (pitchMode === 'fine' && metricSpec?.pitchFine) return metricSpec.pitchFine
    return metricSpec?.pitchCoarse ?? 1.0
  }, [pitchMode, customPitch, metricSpec])
  const metricTapDrill = useMemo(() => {
    if (!metricSpec) return null
    return calcMetricTapDrill(metricDiameter, currentPitch, engagement, material)
  }, [metricSpec, metricDiameter, currentPitch, engagement, material])
  // 관통홀은 ISO 273 표값(spec)을 직접 사용 — 사이즈 표 탭과 일치
  const metricClearance = useMemo(() => metricSpec
    ? { tight: metricSpec.clearanceTight, normal: metricSpec.clearanceNormal, loose: metricSpec.clearanceLoose }
    : { tight: 0, normal: 0, loose: 0 }, [metricSpec])
  const metricTorque = useMemo(() => generalTorque(metricDiameter), [metricDiameter])

  // ── 유니파이 spec ────────────────────
  const unifiedSpec = useMemo(() => UNIFIED_SCREWS.find((u) => `${u.label} (${u.system})` === unifiedKey || u.label === unifiedKey), [unifiedKey])

  // ── 파이프 spec ──────────────────────
  const pipeSpec = useMemo(() => PT_SCREWS.find((p) => p.label === pipeKey), [pipeKey])

  // ── 목재 spec ────────────────────────
  const woodSpec = useMemo(() => {
    // 가까운 표준 사이즈 찾기
    const sorted = WOOD_PILOTS.slice().sort((a, b) =>
      Math.abs(a.diameter - woodDiameter) - Math.abs(b.diameter - woodDiameter))
    return sorted[0]
  }, [woodDiameter])
  const woodPilot = woodHardness === 'hard' ? woodSpec.hardwood : woodSpec.softwood
  const woodPilotRatio = woodDiameter > 0 ? Math.round((woodPilot / woodDiameter) * 100) : 0
  // WOOD_PILOTS 데이터 범위(2.5~6.0mm)를 벗어나면 가장 가까운 값으로 근사
  const woodOutOfRange = woodDiameter > 6.0 || woodDiameter < 2.5

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
        본 도구는 일반 가이드입니다 표준 사이즈 기준 (KS·DIN·ISO·JIS 일반). 실제 호환성은 ±0.1~0.5mm 차이 가능 본 도구는 <strong>특정 브랜드·공구 추천 X · 정확한 토크값 보장 X · 인장/전단강도 보장 X · 항공/자동차 정밀 산업 적용 X</strong> ⚠️ 드릴 작업 시 보호 안경·장갑 필수. 절삭유 사용 (특히 스테인리스·알루미늄). 응급 119
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs3}`} role="tablist" aria-label="나사 규격 도구 모드">
        <button type="button" role="tab" aria-selected={tab === 'calc'} className={`${s.tab} ${tab === 'calc' ? s.tabActive : ''}`} onClick={() => setTab('calc')}>🔩 탭드릴 계산</button>
        <button type="button" role="tab" aria-selected={tab === 'convert'} className={`${s.tab} ${tab === 'convert' ? s.tabActive : ''}`} onClick={() => setTab('convert')}>📏 인치 ↔ mm</button>
        <button type="button" role="tab" aria-selected={tab === 'tables'} className={`${s.tab} ${tab === 'tables' ? s.tabActive : ''}`} onClick={() => setTab('tables')}>📋 사이즈 표</button>
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
                      value={customPitch}
                      onChange={(e) => setCustomPitch(Math.min(3, Math.max(0.1, parseFloat(e.target.value) || 1)))} />
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
                value={unifiedKey}
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
                value={pipeKey}
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
                    value={woodDiameter}
                    onChange={(e) => setWoodDiameter(parseFloat(e.target.value) || 3.5)} />
                  <div className={s.pillRow}>
                    {[3.0, 3.5, 4.0, 4.5, 5.0].map((d) => (
                      <button key={d} type="button" aria-pressed={woodDiameter === d}
                        className={`${s.pill} ${woodDiameter === d ? s.pillActive : ''}`}
                        onClick={() => setWoodDiameter(d)}>{d}mm</button>
                    ))}
                  </div>
                </div>
                <div className={s.field}>
                  <label className={s.fieldLabel} htmlFor="screw-mm-2">길이 (mm)</label>
                  <input id="screw-mm-2" type="number" inputMode="numeric" min={10} max={150} step={5}
                    className={s.input}
                    value={woodLength}
                    onChange={(e) => setWoodLength(parseInt(e.target.value) || 30)} />
                  <div className={s.pillRow}>
                    {[20, 30, 40, 50, 65].map((l) => (
                      <button key={l} type="button" aria-pressed={woodLength === l}
                        className={`${s.pill} ${woodLength === l ? s.pillActive : ''}`}
                        onClick={() => setWoodLength(l)}>{l}mm</button>
                    ))}
                  </div>
                </div>
              </div>
              {system === 'wood' && (
                <div className={s.field} style={{ marginTop: 10 }}>
                  <label className={s.fieldLabel}>목재 종류</label>
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
          {system === 'metric' && metricSpec && metricTapDrill !== null && (
            <>
              <div className={s.hero} role="status">
                <p className={s.heroLabel}>M{metricDiameter} × P{currentPitch} ({MATERIALS.find((m) => m.key === material)?.label})</p>
                <p className={s.heroValue}>탭드릴 약 <strong>{metricTapDrill.toFixed(2)}mm</strong></p>
                <p className={s.heroSub}>{engagement}% 결합률 · 외경 {metricDiameter}mm · 피치 {currentPitch}mm</p>
              </div>

              <div className={s.card}>
                <span className={s.cardLabel}>📐 탭드릴·관통홀</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr className={s.rowBig}>
                      <td>🔩 탭드릴 (탭 가공용)</td>
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
                <span className={s.cardLabel}>🔧 호환 공구</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr>
                      <td>육각렌치 (알렌키)</td>
                      <td className={s.cellAccent}>{metricSpec.hexWrench}mm</td>
                    </tr>
                    <tr>
                      <td>스패너 (이면대각)</td>
                      <td className={s.cellAccent}>{metricSpec.spanner}mm</td>
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
                  🔧 머리 모양별 알렌 사이즈·ISO vs 옛 JIS 스패너 차이·강도등급별 토크는{' '}
                  <Link href="/tools/interior/bolt-wrench" style={{ color: 'var(--accent)', fontWeight: 600 }}>볼트 스패너 계산기</Link>에서 자세히 확인하세요.
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
                <span className={s.cardLabel}>📐 탭드릴·관통홀</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr className={s.rowBig}>
                      <td>🔩 탭드릴</td>
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
                <span className={s.cardLabel}>📐 파이프 나사 정보</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr className={s.rowBig}>
                      <td>🔩 탭드릴</td>
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
          {(system === 'wood' || system === 'drywall') && (
            <>
              <div className={s.hero} role="status">
                <p className={s.heroLabel}>{system === 'wood' ? '목재피스' : '석고피스'} {woodDiameter}×{woodLength}mm</p>
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
                  <span className={s.cardLabel}>📐 목재피스 파일럿홀</span>
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
                      <tr><td>길이</td><td>{woodLength}mm</td></tr>
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
                  <span className={s.cardLabel}>📐 석고피스 정보</span>
                  <table className={s.detailTable}>
                    <tbody>
                      <tr><td>외경</td><td>{woodDiameter}mm</td></tr>
                      <tr><td>길이</td><td>{woodLength}mm</td></tr>
                      <tr><td>파일럿홀</td><td className={s.cellAccent}>불필요 (직접 박기)</td></tr>
                      <tr><td>드라이버</td><td>+ (Phillips) 또는 PH2</td></tr>
                    </tbody>
                  </table>
                  <p className={s.noteSmall}>
                    💡 석고보드 전용 — 목재에 박으면 잘 빠짐. 콘크리트는 칼블록 + 콘크리트 앵커 사용.
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
              드릴 작업 시 보호 안경·장갑 필수. 절삭유 사용 (특히 스테인리스·알루미늄). 본 도구는 일반 가이드 — 정확한 호환성은 실측 권장. 항공·자동차 등 정밀 산업은 표준 인증서 확인.
            </p>
          </div>
        </>
      )}

      {/* ══════════ TAB 2: 인치 ↔ mm — 2분할 (모바일도 좌·우) ══════════ */}
      {tab === 'convert' && (
        <>
          <div className={s.convertSplit}>
            <div className={s.card}>
              <span className={s.cardLabel}>📏 인치 → mm</span>
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
              <span className={s.cardLabel}>📏 mm → 인치</span>
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
            <span className={s.cardLabel}>📋 표준 인치 ↔ mm 변환표</span>
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
            <span className={s.cardLabel}>🔩 미터 나사 (Metric) — 자주 쓰는 사이즈</span>
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
                    <th scope="col">스패너</th>
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
                      <td className={s.cellMono}>{m.spanner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 유니파이 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>🔧 유니파이 나사 (UNC / UNF)</span>
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
            <span className={s.cardLabel}>🚿 파이프 나사 (PT / NPT)</span>
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
            <span className={s.cardLabel}>🪵 목재피스 파일럿홀 가이드</span>
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

    </div>
  )
}
