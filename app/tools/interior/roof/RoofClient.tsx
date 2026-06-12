'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './roof.module.css'
import {
  ROOF_TYPES, ROOF_MATERIALS,
  calcRoof, validateRoofInput,
  moemaeToDeg, degToMoemae, fmtMoemae,
  uniformEaves,
  fmtSqm, fmtPyeong, fmtKrw, fmtKrwShort,
  type RoofType, type RoofInput, type RoofMaterial,
} from './roofUtils'

type TabKey = 'area' | 'material'

const ANGLE_QUICK = [15, 20, 25, 30, 35, 40]
const MOEMAE_QUICK = [3, 4, 5, 6]
const EAVES_QUICK_CM = [0, 30, 45, 60, 90]
const LOSS_QUICK = [5, 10, 15, 20]
const PRICE_PER_SQM_QUICK = [20000, 30000, 50000, 80000, 100000]

export default function RoofClient() {
  const [tab, setTab] = useState<TabKey>('area')

  // ── 입력 ──────────────────────────
  const [type, setType] = useState<RoofType>('gable')
  const [L, setL] = useState<string>('10')
  const [W, setW] = useState<string>('8')

  // 경사 입력 모드: 'angle' | 'moemae'
  const [pitchMode, setPitchMode] = useState<'angle' | 'moemae'>('moemae')
  const [pitchDeg, setPitchDeg] = useState<number>(21.8)  // = 4물매

  // 처마: 단일 모드 vs 4면 개별
  const [eavesAdvanced, setEavesAdvanced] = useState(false)
  const [eavesUniform, setEavesUniform] = useState<number>(0.6)  // m
  const [eavesFront, setEavesFront] = useState<number>(0.6)
  const [eavesBack, setEavesBack] = useState<number>(0.6)
  const [eavesLeft, setEavesLeft] = useState<number>(0.6)
  const [eavesRight, setEavesRight] = useState<number>(0.6)

  const [lossPct, setLossPct] = useState<number>(10)

  // ── 자재 견적 ──────────────────────
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, number>>({})
  // key → user-input 단가 (원/㎡)

  // ── 파싱·계산 ────────────────────
  const numL = Math.max(0, parseFloat(L) || 0)
  const numW = Math.max(0, parseFloat(W) || 0)

  const input: RoofInput = useMemo(() => {
    const eaves = eavesAdvanced
      ? { front: eavesFront, back: eavesBack, left: eavesLeft, right: eavesRight }
      : uniformEaves(eavesUniform)
    return {
      type,
      L: numL,
      W: numW,
      pitchDeg: type === 'flat' ? 0 : pitchDeg,
      eaves,
      lossRate: lossPct / 100,
    }
  }, [type, numL, numW, pitchDeg, eavesAdvanced, eavesUniform, eavesFront, eavesBack, eavesLeft, eavesRight, lossPct])

  const validationError = validateRoofInput(input)
  const result = useMemo(
    () => validationError ? null : calcRoof(input),
    [input, validationError],
  )

  // 경사 toggle handler
  const setMoemae = (n: number) => setPitchDeg(moemaeToDeg(n))
  const currentMoemae = degToMoemae(pitchDeg)

  // 자재 토글
  const toggleMaterial = (m: RoofMaterial) => {
    setSelectedMaterials((prev) => {
      if (prev[m.key] !== undefined) {
        const next = { ...prev }
        delete next[m.key]
        return next
      }
      // 기본값 = 일반 단가 중간값
      return { ...prev, [m.key]: Math.round((m.priceMin + m.priceMax) / 2) }
    })
  }
  const setMaterialPrice = (key: string, price: number) => {
    setSelectedMaterials((prev) => ({ ...prev, [key]: Math.max(0, price) }))
  }

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
        본 도구는 일반 가이드입니다 면적 계산: 표준 형태 기준. 복잡한 형태(혼합·돌출·천창)는 실측 권장. 도면 vs 실측 ±5~10% 차이 가능 자재 단가: 일반 가격 범위 — 실제 ±30% 변동. 정확한 가격은 단가 비교·시공사 견적 본 도구는 <strong>특정 브랜드·시공사 추천 X · 구조 안전 보장 X · 시공 가이드 X · 태양광 발전량 X · 단열/방습 진단 X</strong>
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs2}`}>
        <button className={`${s.tab} ${tab === 'area' ? s.tabActive : ''}`} onClick={() => setTab('area')}>📐 면적 계산</button>
        <button className={`${s.tab} ${tab === 'material' ? s.tabActive : ''}`} onClick={() => setTab('material')}>💰 자재 견적</button>
      </div>

      {/* ══════════ TAB 1: 면적 계산 ══════════ */}
      {tab === 'area' && (
        <>
          {/* 지붕 형태 */}
          <div className={s.card}>
            <span className={s.cardLabel}>① 지붕 형태</span>
            <div className={s.typeGrid}>
              {ROOF_TYPES.map((rt) => (
                <button key={rt.key}
                  className={`${s.typeBtn} ${type === rt.key ? s.typeBtnActive : ''}`}
                  onClick={() => setType(rt.key)}>
                  <span className={s.typeEmoji}>{rt.emoji}</span>
                  <span className={s.typeName}>{rt.label}</span>
                  <span className={s.typeDesc}>{rt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 치수 */}
          <div className={s.card}>
            <span className={s.cardLabel}>② 건물 치수 (m)</span>
            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel} htmlFor="roof-f1">가로 (정면)</label>
                <input id="roof-f1" type="number" inputMode="decimal" min={1} step={0.1} className={s.input}
                  value={L} onChange={(e) => setL(e.target.value)} />
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>세로 (측면)</label>
                <input type="number" inputMode="decimal" min={1} step={0.1} className={s.input}
                  value={W} onChange={(e) => setW(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 경사 */}
          {type !== 'flat' && (
            <div className={s.card}>
              <span className={s.cardLabel}>③ 지붕 경사 (물매 또는 경사각)</span>
              <div className={s.modeToggle}>
                <button className={`${s.modeBtn} ${pitchMode === 'moemae' ? s.modeBtnActive : ''}`}
                  onClick={() => setPitchMode('moemae')}>📏 물매 (한국 표준)</button>
                <button className={`${s.modeBtn} ${pitchMode === 'angle' ? s.modeBtnActive : ''}`}
                  onClick={() => setPitchMode('angle')}>🔢 경사각 (도)</button>
              </div>

              {pitchMode === 'moemae' ? (
                <div className={s.field}>
                  <div className={s.sliderRow}>
                    <input type="range" min={1} max={10} step={0.5} className={s.slider}
                      value={Math.round(currentMoemae * 2) / 2}
                      onChange={(e) => setMoemae(parseFloat(e.target.value))} />
                    <span className={s.sliderValue}>{fmtMoemae(currentMoemae)}</span>
                  </div>
                  <div className={s.quickRow}>
                    {MOEMAE_QUICK.map((m) => (
                      <button key={m}
                        className={`${s.quickChip} ${Math.abs(currentMoemae - m) < 0.3 ? s.quickChipActive : ''}`}
                        onClick={() => setMoemae(m)}>{m}물매</button>
                    ))}
                  </div>
                  <p className={s.fieldHint}>= 경사각 약 {pitchDeg.toFixed(1)}°</p>
                </div>
              ) : (
                <div className={s.field}>
                  <div className={s.sliderRow}>
                    <input type="range" min={0} max={60} step={1} className={s.slider}
                      value={Math.round(pitchDeg)}
                      onChange={(e) => setPitchDeg(parseFloat(e.target.value))} />
                    <span className={s.sliderValue}>{Math.round(pitchDeg)}°</span>
                  </div>
                  <div className={s.quickRow}>
                    {ANGLE_QUICK.map((a) => (
                      <button key={a}
                        className={`${s.quickChip} ${Math.abs(pitchDeg - a) < 1 ? s.quickChipActive : ''}`}
                        onClick={() => setPitchDeg(a)}>{a}°</button>
                    ))}
                  </div>
                  <p className={s.fieldHint}>= {fmtMoemae(currentMoemae)}</p>
                </div>
              )}
            </div>
          )}

          {/* 처마 */}
          <div className={s.card}>
            <span className={s.cardLabel}>④ 처마 길이 (m)</span>
            <label className={s.checkRow}>
              <input type="checkbox" checked={eavesAdvanced}
                onChange={(e) => setEavesAdvanced(e.target.checked)} />
              <span>4면 개별 입력 (앞·뒤·좌·우 다름)</span>
            </label>

            {!eavesAdvanced ? (
              <>
                <div className={s.sliderRow}>
                  <input type="range" min={0} max={1.5} step={0.05} className={s.slider}
                    value={eavesUniform}
                    onChange={(e) => setEavesUniform(parseFloat(e.target.value))} />
                  <span className={s.sliderValue}>{(eavesUniform * 100).toFixed(0)}cm</span>
                </div>
                <div className={s.quickRow}>
                  {EAVES_QUICK_CM.map((cm) => (
                    <button key={cm}
                      className={`${s.quickChip} ${Math.abs(eavesUniform * 100 - cm) < 1 ? s.quickChipActive : ''}`}
                      onClick={() => setEavesUniform(cm / 100)}>{cm}cm</button>
                  ))}
                </div>
              </>
            ) : (
              <div className={s.row2}>
                {([
                  { label: '앞', value: eavesFront, setter: setEavesFront },
                  { label: '뒤', value: eavesBack, setter: setEavesBack },
                  { label: '좌', value: eavesLeft, setter: setEavesLeft },
                  { label: '우', value: eavesRight, setter: setEavesRight },
                ] as const).map(({ label, value, setter }) => (
                  <div key={label} className={s.field}>
                    <label className={s.fieldLabel}>{label}</label>
                    <input type="number" inputMode="decimal" min={0} max={2} step={0.05} className={s.input}
                      value={value} onChange={(e) => setter(parseFloat(e.target.value) || 0)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 로스율 */}
          <div className={s.card}>
            <span className={s.cardLabel}>⑤ 로스율 (자재 손실·여유분)</span>
            <div className={s.sliderRow}>
              <input type="range" min={0} max={30} step={1} className={s.slider}
                value={lossPct}
                onChange={(e) => setLossPct(parseInt(e.target.value))} />
              <span className={s.sliderValue}>{lossPct}%</span>
            </div>
            <div className={s.quickRow}>
              {LOSS_QUICK.map((p) => (
                <button key={p}
                  className={`${s.quickChip} ${lossPct === p ? s.quickChipActive : ''}`}
                  onClick={() => setLossPct(p)}>{p}%</button>
              ))}
            </div>
          </div>

          {/* 시각화 */}
          <RoofVisualization input={input} />

          {validationError && (
            <div className={s.empty}>{validationError}</div>
          )}

          {result && (
            <>
              {/* 히어로 */}
              <div className={s.hero} role="status">
                <p className={s.heroLabel}>
                  {ROOF_TYPES.find((r) => r.key === type)?.emoji} {ROOF_TYPES.find((r) => r.key === type)?.label}
                  {' '}({numL}m × {numW}m{type !== 'flat' && `, ${fmtMoemae(currentMoemae)}`})
                </p>
                <p className={s.heroValue}>
                  표면 약 <strong>{result.surfaceArea.toFixed(1)}㎡</strong>
                  <span className={s.heroSubVal}> ({result.surfacePyeong.toFixed(1)}평)</span>
                </p>
                <p className={s.heroSub}>
                  로스 {lossPct}% 포함 자재 구매: <strong>{result.materialArea.toFixed(1)}㎡</strong> ({result.materialPyeong.toFixed(1)}평)
                </p>
              </div>

              {/* 상세 */}
              <div className={s.card}>
                <span className={s.cardLabel}>📊 상세 결과</span>
                <table className={s.detailTable}>
                  <tbody>
                    <tr>
                      <td>처마 포함 평면 치수</td>
                      <td className={s.cellAccent}>{result.L_total.toFixed(1)}m × {result.W_total.toFixed(1)}m</td>
                    </tr>
                    <tr>
                      <td>평면 면적 (처마 포함)</td>
                      <td>{fmtSqm(result.planArea)} ({fmtPyeong(result.planPyeong)})</td>
                    </tr>
                    {type !== 'flat' && (
                      <tr>
                        <td>경사 (배율)</td>
                        <td>{result.pitchDeg.toFixed(1)}° = {fmtMoemae(result.moemae)} (×{result.pitchFactor.toFixed(3)})</td>
                      </tr>
                    )}
                    <tr className={s.rowBig}>
                      <td>실제 표면 면적</td>
                      <td className={s.cellAccent}>{fmtSqm(result.surfaceArea)} ({fmtPyeong(result.surfacePyeong)})</td>
                    </tr>
                    <tr className={s.rowBig}>
                      <td>로스 {lossPct}% 포함 자재</td>
                      <td className={s.cellAccent}>{fmtSqm(result.materialArea)} ({fmtPyeong(result.materialPyeong)})</td>
                    </tr>
                    {result.eavesImpact > 0 && (
                      <tr>
                        <td>처마로 인한 면적 증가</td>
                        <td>+{result.eavesImpact.toFixed(1)}%</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 자재 견적 안내 */}
              <div className={s.crossLinkCard}>
                <p>
                  💰 자재별 단가·예상 비용은 <button className={s.linkBtn} onClick={() => setTab('material')}>자재 견적 탭 →</button>
                </p>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════ TAB 2: 자재 견적 ══════════ */}
      {tab === 'material' && (
        <>
          {!result && (
            <div className={s.empty}>먼저 <strong>📐 면적 계산</strong> 탭에서 치수를 입력하세요.</div>
          )}

          {result && (
            <>
              <div className={s.card}>
                <span className={s.cardLabel}>📊 자재 구매 면적 (계산 결과)</span>
                <p className={s.cardSub}>
                  {ROOF_TYPES.find((r) => r.key === type)?.label} · 표면 {result.surfaceArea.toFixed(1)}㎡ · <strong style={{ color: 'var(--accent)' }}>로스 {lossPct}% 포함 {result.materialArea.toFixed(1)}㎡ ({result.materialPyeong.toFixed(1)}평)</strong>
                </p>
              </div>

              {(['지붕재', '방수재', '특수'] as const).map((cat) => {
                const items = ROOF_MATERIALS.filter((m) => m.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat} className={s.card}>
                    <span className={s.cardLabel}>{cat === '지붕재' ? '🏠 지붕재' : cat === '방수재' ? '🛡️ 방수재 (평지붕)' : '✨ 특수재'}</span>
                    <div className={s.materialList}>
                      {items.map((m) => {
                        const selected = selectedMaterials[m.key] !== undefined
                        const userPrice = selectedMaterials[m.key] ?? Math.round((m.priceMin + m.priceMax) / 2)
                        const totalCost = result.materialArea * userPrice
                        return (
                          <div key={m.key}
                            className={`${s.materialItem} ${selected ? s.materialItemActive : ''}`}>
                            <button className={s.materialHead} onClick={() => toggleMaterial(m)}>
                              <span className={s.materialEmoji}>{m.emoji}</span>
                              <div className={s.materialInfo}>
                                <span className={s.materialName}>{m.name}</span>
                                <span className={s.materialNote}>{m.note}</span>
                              </div>
                              <span className={s.materialPriceRange}>
                                {fmtKrwShort(m.priceMin)} ~ {fmtKrwShort(m.priceMax)}/㎡
                              </span>
                            </button>

                            {selected && (
                              <div className={s.materialBody}>
                                <div className={s.priceInputRow}>
                                  <label>실제 단가 (원/㎡)</label>
                                  <input type="number" inputMode="numeric" min={0}
                                    className={s.input}
                                    value={userPrice}
                                    onChange={(e) => setMaterialPrice(m.key, parseInt(e.target.value) || 0)} />
                                </div>
                                <div className={s.quickRow} style={{ marginTop: 6 }}>
                                  {PRICE_PER_SQM_QUICK.map((p) => (
                                    <button key={p}
                                      className={`${s.quickChip} ${userPrice === p ? s.quickChipActive : ''}`}
                                      onClick={() => setMaterialPrice(m.key, p)}>
                                      {fmtKrwShort(p)}/㎡
                                    </button>
                                  ))}
                                </div>
                                <div className={s.materialResult}>
                                  <div>
                                    <span className={s.materialResultLabel}>{result.materialArea.toFixed(1)}㎡ × {userPrice.toLocaleString()}원/㎡</span>
                                    <span className={s.materialResultValue}>{fmtKrw(totalCost)}</span>
                                  </div>
                                  <div className={s.materialResultPyeong}>
                                    평당 약 {fmtKrwShort(userPrice * 3.3058)}/평
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              <div className={s.warnCard}>
                <strong>⚠️ 가격은 참고용</strong>
                <p>
                  위 단가는 2026 한국 일반 가격 범위. 실제 가격은 자재·지역·시즌·구매처별 ±30% 변동 가능.
                  정확한 가격은 <Link href="/tools/life/unit-price" className={s.link}>단가 비교 계산기</Link>·실제 견적 확인.
                </p>
              </div>

              <div className={s.crossLinkCard}>
                <p>🎨 지붕 도장 시 페인트 양 → <Link href="/tools/interior/paint" className={s.link}>페인트 계산기</Link></p>
                <p>📐 실내 면적 (벽·바닥·천장) → <Link href="/tools/interior/room-area" className={s.link}>공간 면적 계산기</Link></p>
              </div>
            </>
          )}
        </>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 시각화 — 평면도 + 측면도
// ─────────────────────────────────────────────────────────────
function RoofVisualization({ input }: { input: RoofInput }) {
  const W_view = 480
  const H_view = 240
  // 평면도 영역: 왼쪽 절반 (240x240)
  // 측면도 영역: 오른쪽 절반 (240x240)
  const planArea = { x: 0, y: 0, w: 240, h: 240, cx: 120, cy: 120 }
  const elevArea = { x: 240, y: 0, w: 240, h: 240, cx: 360, cy: 120 }

  // 평면 스케일 — L:W 비율 유지하며 영역 안에 fit
  const aspect = input.L / Math.max(input.W, 0.1)
  const planMaxW = 180
  const planMaxH = 140
  let planW: number, planH: number
  if (aspect >= planMaxW / planMaxH) {
    planW = planMaxW
    planH = planMaxW / aspect
  } else {
    planH = planMaxH
    planW = planMaxH * aspect
  }
  const planX1 = planArea.cx - planW / 2
  const planY1 = planArea.cy - planH / 2
  const planX2 = planX1 + planW
  const planY2 = planY1 + planH

  // 처마 표현 (평면 외곽에 점선)
  const eavesScale = planW / Math.max(input.L, 0.1)
  const eaveL = (input.eaves.left ?? 0) * eavesScale
  const eaveR = (input.eaves.right ?? 0) * eavesScale
  const eaveT = (input.eaves.front ?? 0) * eavesScale  // 그림 상단 = 정면
  const eaveB = (input.eaves.back ?? 0) * eavesScale

  // 측면도 — 경사각 시각화
  const elevScale = planW / Math.max(input.L, 0.1)
  const elevWidth = input.W * elevScale  // 측면 = W 길이
  const elevX1 = elevArea.cx - elevWidth / 2
  const elevX2 = elevArea.cx + elevWidth / 2
  const elevBaseY = 180  // 지면
  const wallHeight = 60
  const wallTopY = elevBaseY - wallHeight
  // 지붕 높이 = (W/2) × tan(pitch)
  const ridgeHeightScaled = (elevWidth / 2) * Math.tan(input.pitchDeg * Math.PI / 180)

  return (
    <div className={s.vizWrap}>
      <svg viewBox={`0 0 ${W_view} ${H_view}`} className={s.vizSvg} preserveAspectRatio="xMidYMid meet">
        {/* 영역 라벨 */}
        <text x={planArea.cx} y={20} fontSize="12" fill="var(--muted)" textAnchor="middle" fontFamily="Noto Sans KR">평면도 (위에서 본)</text>
        <text x={elevArea.cx} y={20} fontSize="12" fill="var(--muted)" textAnchor="middle" fontFamily="Noto Sans KR">측면도</text>

        {/* 영역 구분선 */}
        <line x1={240} y1={30} x2={240} y2={H_view - 10} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />

        {/* ── 평면도 ── */}
        {/* 처마 외곽 (점선) */}
        {(eaveL + eaveR + eaveT + eaveB) > 0 && (
          <rect x={planX1 - eaveL} y={planY1 - eaveT}
            width={planW + eaveL + eaveR} height={planH + eaveT + eaveB}
            fill="rgba(14,165,233,0.05)"
            stroke="var(--accent)" strokeWidth="1.2" strokeDasharray="4 3" />
        )}
        {/* 건물 외곽 */}
        <rect x={planX1} y={planY1} width={planW} height={planH}
          fill="var(--bg3)" stroke="var(--text)" strokeWidth="1.5" />

        {/* 형태별 능선 표시 */}
        {input.type === 'gable' && (
          <line x1={planX1} y1={planArea.cy} x2={planX2} y2={planArea.cy}
            stroke="#EA580C" strokeWidth="2" />
        )}
        {input.type === 'maetbae' && (
          <line x1={planX1} y1={planArea.cy} x2={planX2} y2={planArea.cy}
            stroke="#EA580C" strokeWidth="2" />
        )}
        {input.type === 'hip' && (
          <>
            <line x1={planX1} y1={planY1} x2={planX2} y2={planY2}
              stroke="#EA580C" strokeWidth="1.5" />
            <line x1={planX2} y1={planY1} x2={planX1} y2={planY2}
              stroke="#EA580C" strokeWidth="1.5" />
            <line x1={planX1 + planW * 0.25} y1={planArea.cy}
              x2={planX1 + planW * 0.75} y2={planArea.cy}
              stroke="#EA580C" strokeWidth="2" />
          </>
        )}
        {input.type === 'shed' && (
          // 외쪽: 화살표로 경사 방향 표시
          <g>
            <line x1={planX1 + 10} y1={planY1 + 10}
              x2={planX2 - 10} y2={planY1 + 10}
              stroke="#EA580C" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <text x={planArea.cx} y={planY1 + planH + 22} fontSize="10" fill="var(--muted)" textAnchor="middle">
              ← 낮음 / 높음 →
            </text>
          </g>
        )}
        {input.type === 'flat' && (
          <text x={planArea.cx} y={planArea.cy + 4} fontSize="12" fill="var(--muted)"
            textAnchor="middle" fontFamily="Noto Sans KR">평면</text>
        )}

        {/* 치수 라벨 */}
        <text x={planArea.cx} y={planY2 + 22} fontSize="11" fill="var(--text)" textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>
          {input.L.toFixed(1)}m
        </text>
        <text x={planX1 - 8} y={planArea.cy + 4} fontSize="11" fill="var(--text)" textAnchor="end" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif'>
          {input.W.toFixed(1)}m
        </text>
        {(eaveL + eaveR + eaveT + eaveB) > 0 && (
          <text x={planArea.cx} y={H_view - 8} fontSize="10" fill="var(--accent)" textAnchor="middle" fontFamily="Noto Sans KR">
            점선 = 처마 포함
          </text>
        )}

        {/* 화살표 정의 */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#EA580C" />
          </marker>
        </defs>

        {/* ── 측면도 ── */}
        {/* 지면 */}
        <line x1={elevArea.x + 10} y1={elevBaseY} x2={elevArea.x + elevArea.w - 10} y2={elevBaseY}
          stroke="var(--muted)" strokeWidth="1" strokeDasharray="2 2" />

        {/* 벽 */}
        <rect x={elevX1} y={wallTopY} width={elevWidth} height={wallHeight}
          fill="var(--bg3)" stroke="var(--text)" strokeWidth="1.5" />

        {/* 지붕 형태별 측면 */}
        {input.type === 'gable' && (
          <polygon points={`${elevX1},${wallTopY} ${elevArea.cx},${wallTopY - ridgeHeightScaled} ${elevX2},${wallTopY}`}
            fill="rgba(234,88,12,0.18)" stroke="#EA580C" strokeWidth="1.5" />
        )}
        {input.type === 'maetbae' && (
          <polygon points={`${elevX1},${wallTopY} ${elevArea.cx},${wallTopY - ridgeHeightScaled} ${elevX2},${wallTopY}`}
            fill="rgba(234,88,12,0.18)" stroke="#EA580C" strokeWidth="1.5" />
        )}
        {input.type === 'hip' && (
          <polygon points={`${elevX1 + elevWidth * 0.2},${wallTopY - ridgeHeightScaled} ${elevX2 - elevWidth * 0.2},${wallTopY - ridgeHeightScaled} ${elevX2},${wallTopY} ${elevX1},${wallTopY}`}
            fill="rgba(234,88,12,0.18)" stroke="#EA580C" strokeWidth="1.5" />
        )}
        {input.type === 'shed' && (
          <polygon points={`${elevX1},${wallTopY} ${elevX2},${wallTopY - ridgeHeightScaled} ${elevX2},${wallTopY}`}
            fill="rgba(234,88,12,0.18)" stroke="#EA580C" strokeWidth="1.5" />
        )}
        {input.type === 'flat' && (
          <line x1={elevX1} y1={wallTopY} x2={elevX2} y2={wallTopY}
            stroke="#EA580C" strokeWidth="3" />
        )}

        {/* 경사각 표기 */}
        {input.type !== 'flat' && (
          <text x={elevArea.cx} y={wallTopY - ridgeHeightScaled - 8} fontSize="11" fill="#EA580C"
            textAnchor="middle" fontFamily='Inter, "Noto Sans KR", system-ui, sans-serif' fontWeight={700}>
            {input.pitchDeg.toFixed(1)}° ({fmtMoemae(degToMoemae(input.pitchDeg))})
          </text>
        )}
      </svg>
    </div>
  )
}
