/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './pipe.module.css'
import {
  PIPE_SIZES, MATERIALS, FITTINGS, FLOW_GUIDES,
  INSULATION_THICK, BEND_RADIUS_MULT,
  type PipeSize, type Material,
  getDim, getMaterial, getSizeMeta, calcFlow, fmt,
} from './pipeUtils'

type Tab = 'convert' | 'compare' | 'fitting' | 'flow'

const STORAGE_KEY = 'youtil_pipe_v1'

export default function PipeClient() {
  const [tab, setTab] = useState<Tab>('convert')
  const [size, setSize] = useState<PipeSize>('15A')
  const [material, setMaterial] = useState<Material>('steel')
  const [grade, setGrade] = useState<string>('sgp_white')

  /* 탭 4 (유량) */
  const [velocity, setVelocity] = useState('1.5')
  const [flowMaterial, setFlowMaterial] = useState<Material>('steel')
  const [flowSize, setFlowSize] = useState<PipeSize>('20A')

  /* 탭 3 (부속) */
  const [fitMaterial, setFitMaterial] = useState<Material>('steel')

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.size && PIPE_SIZES.includes(j.size)) setSize(j.size)
      if (j.material) setMaterial(j.material)
      if (j.grade) setGrade(j.grade)
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ size, material, grade })) } catch {}
  }, [size, material, grade])

  /* 재질이 바뀌면 grade를 첫 옵션으로 리셋 */
  useEffect(() => {
    const m = getMaterial(material)
    if (m.grades && m.grades.length > 0) {
      const has = m.grades.some((g) => g.id === grade)
      if (!has) setGrade(m.grades[0].id)
    } else {
      setGrade('')
    }
  }, [material, grade])

  /* 계산 */
  const meta = getSizeMeta(size)
  const matMeta = getMaterial(material)
  const dim = getDim(material, size, grade)
  const fitMatMeta = getMaterial(fitMaterial)
  const fittings = FITTINGS[fitMaterial]

  /* 유량 */
  const flowDim = getDim(flowMaterial, flowSize)
  const flow = useMemo(() => {
    const v = parseFloat(velocity)
    return isNaN(v) || v <= 0 ? null : calcFlow(flowDim.id, v)
  }, [velocity, flowDim.id])

  /* 6재질 비교 데이터 (탭 2) */
  const compareData = MATERIALS.map((m) => ({
    mat: m,
    dim: getDim(m.id, size),
  }))
  const maxOd = Math.max(...compareData.map((c) => c.dim.od))

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
        사용·시공 안내 표시 치수는 KS·JIS·ISO·DIN <strong>표준 일반치 참고용</strong>입니다. 실제 제품은 제조사 도면·시방서 우선. <strong>가스·고압·플랜트·소방 배관은 자격자 시공 의무</strong> (도시가스법·고압가스안전관리법 등). <strong>음용수 배관</strong>은 KC·위생 인증(KS·KCs) 자재만 사용해야 합니다.
      </Disclaimer>

      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'convert',  label: '🔁 호칭 변환' },
          { id: 'compare',  label: '⚖️ 재질 비교' },
          { id: 'fitting',  label: '🔧 부속·연결' },
          { id: 'flow',     label: '💧 유량·등급' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            className={`${s.tab} ${tab === t.id ? s.tabActive : ''}`}
            onClick={() => setTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ 탭 1: 호칭 변환 ════════ */}
      {tab === 'convert' && (
        <>
          {/* 재질 선택 */}
          <div className={s.card}>
            <span className={s.cardLabel}>배관 재질</span>
            <div className={s.systemGrid}>
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  className={`${s.systemBtn} ${material === m.id ? s.systemBtnActive : ''}`}
                  onClick={() => setMaterial(m.id)}
                  type="button"
                >
                  <span className={s.systemEmoji}>{m.emoji}</span>
                  <span className={s.systemLabel}>{m.label}</span>
                  <span className={s.systemDesc}>{m.use}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 호칭 + 등급 */}
          <div className={s.card}>
            <span className={s.cardLabel}>호칭경 · 등급</span>

            <div className={s.field}>
              <label className={s.fieldLabel}>호칭 (A호칭·인치·DN — 모두 같은 값)</label>
              <div className={s.pillRow}>
                {PIPE_SIZES.map((p) => {
                  const m = getSizeMeta(p)
                  return (
                    <button
                      key={p}
                      className={`${s.pill} ${size === p ? s.pillActive : ''}`}
                      onClick={() => setSize(p)}
                      type="button"
                      title={`${p} = ${m.inch} = ${m.dn}`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {matMeta.grades && matMeta.grades.length > 0 && (
              <div className={s.field}>
                <label className={s.fieldLabel}>등급 / 두께 종류</label>
                <div className={s.pillRow}>
                  {matMeta.grades.map((g) => (
                    <button
                      key={g.id}
                      className={`${s.pill} ${grade === g.id ? s.pillActive : ''}`}
                      onClick={() => setGrade(g.id)}
                      type="button"
                      title={g.note}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
                <p className={s.helpText}>
                  {matMeta.grades.find((g) => g.id === grade)?.note}
                </p>
              </div>
            )}
          </div>

          {/* 메인 결과 */}
          <div className={s.hero}>
            <p className={s.heroLabel}>
              {matMeta.emoji} {matMeta.label} · {size}
            </p>
            <p className={s.heroValue}>
              외경 OD <strong>{fmt(dim.od, 2)} mm</strong>
            </p>
            <p className={s.heroSub}>
              내경 ID {fmt(dim.id, 2)} mm · 두께 {fmt(dim.t, 2)} mm
            </p>
            <div className={s.aliasRow}>
              <div className={s.aliasChip}><span>A호칭</span><strong>{meta.a}</strong></div>
              <div className={s.aliasChip}><span>인치 (B)</span><strong>{meta.inch}</strong></div>
              <div className={s.aliasChip}><span>DN (ISO)</span><strong>{meta.dn}</strong></div>
            </div>
          </div>

          {/* 상세표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>{size} · {matMeta.label} 상세 사양</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr><th>항목</th><th>값</th></tr>
                </thead>
                <tbody>
                  <tr className={s.cellSubtitle}><td colSpan={2}>치수</td></tr>
                  <tr><td>외경 (OD)</td><td className={`${s.cellMono} ${s.cellAccent}`}>⌀ {fmt(dim.od, 2)} mm</td></tr>
                  <tr><td>내경 (ID, 참고)</td><td className={s.cellMono}>⌀ {fmt(dim.id, 2)} mm</td></tr>
                  <tr><td>관 두께 (t)</td><td className={s.cellMono}>{fmt(dim.t, 2)} mm</td></tr>
                  <tr><td>단면적</td><td className={s.cellMono}>{fmt(Math.PI * Math.pow(dim.id / 2, 2), 1)} mm²</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>호칭 시스템</td></tr>
                  <tr><td>A호칭 (한국·일본 KS B 1503)</td><td className={s.cellMono}>{meta.a}</td></tr>
                  <tr><td>B호칭 (미국 ASME 인치)</td><td className={s.cellMono}>{meta.inch}</td></tr>
                  <tr><td>DN (ISO/EN 6708)</td><td className={s.cellMono}>{meta.dn}</td></tr>
                  <tr className={s.cellSubtitle}><td colSpan={2}>표준·시공</td></tr>
                  <tr><td>표준 규격</td><td style={{ textAlign: 'right', fontFamily: 'inherit', fontWeight: 'normal', fontSize: 12 }}>{matMeta.std}</td></tr>
                  <tr><td>주 사용처</td><td style={{ textAlign: 'right', fontFamily: 'inherit', fontWeight: 'normal', fontSize: 12 }}>{matMeta.use}</td></tr>
                  <tr><td>단열재 권장 두께</td><td className={s.cellMono}>{INSULATION_THICK[size]} mm</td></tr>
                  <tr><td>최소 곡률 반지름</td><td className={s.cellMono}>OD × {BEND_RADIUS_MULT[material]} = {fmt(dim.od * BEND_RADIUS_MULT[material], 0)} mm</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>⚠️ 주의 — 호칭 ≠ 외경</strong>
            <p>
              {size}는 <strong style={{ color: '#D97706' }}>모든 재질에서 같은 호칭</strong>이지만,
              실제 외경은 재질별로 <strong>최대 5~6mm까지 차이</strong>가 납니다.
              <br />이종 재질 연결에는 반드시 <strong>이종 어댑터·이종조인</strong>이 필요합니다.
              <br />→ 재질 비교 탭에서 차이를 확인해 보세요.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 2: 재질 비교 ════════ */}
      {tab === 'compare' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>비교할 호칭</span>
            <div className={s.pillRow}>
              {PIPE_SIZES.map((p) => (
                <button
                  key={p}
                  className={`${s.pill} ${size === p ? s.pillActive : ''}`}
                  onClick={() => setSize(p)}
                  type="button"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>📏 {size} ({meta.inch} · {meta.dn}) 재질별 외경 비교</p>
            <p className={s.heroValue}><strong>최대 {fmt(maxOd - Math.min(...compareData.map((c) => c.dim.od)), 2)} mm 차이</strong></p>
            <p className={s.heroSub}>같은 호칭이지만 재질·표준에 따라 외경 다름</p>
          </div>

          {/* SVG 막대그래프 */}
          <div className={s.card}>
            <span className={s.cardLabel}>외경 비교 (mm)</span>
            <div className={s.barChart}>
              {compareData.map((c) => {
                const w = (c.dim.od / maxOd) * 100
                return (
                  <div key={c.mat.id} className={s.barRow}>
                    <span className={s.barLabel}>
                      {c.mat.emoji} {c.mat.label.split(' ')[0]}
                    </span>
                    <div className={s.barTrack}>
                      <div
                        className={s.barFill}
                        style={{ width: `${w}%` }}
                      >
                        <span className={s.barValue}>{fmt(c.dim.od, 2)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>{size} · 6재질 상세 비교표</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>재질</th>
                    <th>외경 OD</th>
                    <th>내경 ID</th>
                    <th>두께 t</th>
                  </tr>
                </thead>
                <tbody>
                  {compareData.map((c) => (
                    <tr key={c.mat.id}>
                      <td>{c.mat.emoji} {c.mat.label}</td>
                      <td className={`${s.cellMono} ${s.cellAccent}`}>{fmt(c.dim.od, 2)}</td>
                      <td className={s.cellMono}>{fmt(c.dim.id, 2)}</td>
                      <td className={s.cellMono}>{fmt(c.dim.t, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>🚨 같은 {size}지만 외경이 모두 다릅니다</strong>
            <p>
              호칭은 &quot;그 정도 사이즈&quot;를 묶은 분류 이름일 뿐이며, 실제 외경은 재질·표준별로 모두 다릅니다.
              <br />→ 부속(엘보·티·소켓) 교차 사용 불가
              <br />→ 이종 재질 연결에는 <strong>전용 이종 어댑터</strong> 필수
              <br />→ 같은 재질 안에서도 등급(VG1/2, K/L/M 등)에 따라 두께·내경 다름
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 부속·연결법 ════════ */}
      {tab === 'fitting' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>재질 선택</span>
            <div className={s.systemGrid}>
              {MATERIALS.map((m) => (
                <button
                  key={m.id}
                  className={`${s.systemBtn} ${fitMaterial === m.id ? s.systemBtnActive : ''}`}
                  onClick={() => setFitMaterial(m.id)}
                  type="button"
                >
                  <span className={s.systemEmoji}>{m.emoji}</span>
                  <span className={s.systemLabel}>{m.label}</span>
                  <span className={s.systemDesc}>{m.std}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={s.hero}>
            <p className={s.heroLabel}>{fitMatMeta.emoji} {fitMatMeta.label} 연결법</p>
            <p className={s.heroValue}><strong>{fittings.length}가지</strong> 표준 시공법</p>
            <p className={s.heroSub}>{fitMatMeta.desc}</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>사용 가능 부속·연결법</span>
            <div className={s.fitGrid}>
              {fittings.map((f, i) => (
                <div key={i} className={s.fitCard}>
                  <p className={s.fitName}>
                    {f.name}
                    <span className={s.fitDiff}>
                      {'★'.repeat(f.difficulty)}{'☆'.repeat(3 - f.difficulty)}
                    </span>
                  </p>
                  <p className={s.fitDesc}>{f.desc}</p>
                  {f.note && <p className={s.fitNote}>{f.note}</p>}
                </div>
              ))}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>📌 시공 자격 안내</strong>
            <p>
              • <strong>가스배관(도시가스·LPG)</strong>: 가스시설시공업·가스기능사 등록 사업자만 시공 가능 (자가시공 불법)<br />
              • <strong>고압·플랜트 용접</strong>: 산업기사·용접사 자격 필수<br />
              • <strong>소방용 배관</strong>: 소방시설공사업 등록업체<br />
              • 일반 옥내 급수·배수·바닥난방 PB/XL 정도가 셀프 시공 한계
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 유량·두께 등급 ════════ */}
      {tab === 'flow' && (
        <>
          <div className={s.card}>
            <span className={s.cardLabel}>유량 계산 입력</span>

            <div className={s.row2}>
              <div className={s.field}>
                <label className={s.fieldLabel}>재질</label>
                <select
                  className={s.input}
                  value={flowMaterial}
                  onChange={(e) => setFlowMaterial(e.target.value as Material)}
                >
                  {MATERIALS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className={s.field}>
                <label className={s.fieldLabel}>호칭</label>
                <select
                  className={s.input}
                  value={flowSize}
                  onChange={(e) => setFlowSize(e.target.value as PipeSize)}
                >
                  {PIPE_SIZES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel}>유속 (m/s)</label>
              <input
                type="number"
                className={s.input}
                value={velocity}
                onChange={(e) => setVelocity(e.target.value)}
                min={0.1}
                max={30}
                step={0.1}
              />
              <div className={s.pillRow} style={{ marginTop: 8 }}>
                {[1.0, 1.5, 2.0, 2.5, 3.0].map((v) => (
                  <button
                    key={v}
                    className={s.pill}
                    onClick={() => setVelocity(String(v))}
                    type="button"
                  >
                    {v} m/s
                  </button>
                ))}
              </div>
            </div>

            <div className={s.helpText} style={{ marginTop: 4 }}>
              내경 자동 계산: <strong>⌀ {fmt(flowDim.id, 2)} mm</strong>
            </div>
          </div>

          {flow && (
            <div className={s.hero}>
              <p className={s.heroLabel}>{flowMaterial} {flowSize} · 유속 {velocity} m/s</p>
              <p className={s.heroValue}><strong>{fmt(flow.lpm, 1)} L/min</strong></p>
              <p className={s.heroSub}>
                = {fmt(flow.m3h, 2)} m³/h · 단면적 {fmt(Math.PI * Math.pow(flowDim.id / 2, 2), 0)} mm²
              </p>
            </div>
          )}

          <div className={s.card}>
            <span className={s.cardLabel}>용도별 권장 유속</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>용도</th>
                    <th>권장 유속 (m/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {FLOW_GUIDES.map((g) => (
                    <tr key={g.use}>
                      <td>{g.emoji} {g.use}</td>
                      <td className={s.cellMono}>
                        {g.min === 0 ? '~' : g.min} ~ {g.max}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={s.helpText}>
              너무 빠르면 소음·캐비테이션, 너무 느리면 침전·정체 발생.
            </p>
          </div>

          {/* 두께 등급표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>두께 등급 가이드</span>
            <div className={s.gradeBox}>
              <p className={s.gradeTitle}>🔩 강관 (STPG)</p>
              <ul>
                <li><strong>Sch 40</strong> — 일반 압력 배관 표준 (가장 흔함)</li>
                <li><strong>Sch 80</strong> — 고압·증기·암모니아 (Sch 40보다 두껍고 무거움)</li>
                <li><strong>Sch 160</strong> — 초고압 (플랜트·발전소)</li>
              </ul>
            </div>
            <div className={s.gradeBox}>
              <p className={s.gradeTitle}>🔵 PVC관</p>
              <ul>
                <li><strong>VG1</strong> — 수도용 두꺼움 (1.0~1.6 MPa, 음용수)</li>
                <li><strong>VG2</strong> — 배수용 얇음 (비압력 배수·통기)</li>
                <li><strong>HI-VG</strong> — VG1 + 내충격 향상 (한랭지·노출 배관)</li>
              </ul>
            </div>
            <div className={s.gradeBox}>
              <p className={s.gradeTitle}>🟤 동관</p>
              <ul>
                <li><strong>K Type</strong> — 가장 두꺼움 (의료용 가스·고압)</li>
                <li><strong>L Type</strong> — 중간 (가정용 가스·급수 표준)</li>
                <li><strong>M Type</strong> — 가장 얇음 (저압·일반 냉난방)</li>
              </ul>
            </div>
            <div className={s.gradeBox}>
              <p className={s.gradeTitle}>⚪ 스테인리스</p>
              <ul>
                <li><strong>Su (KS D 3595)</strong> — 위생관, 박벽, 음용수</li>
                <li><strong>STS (KS D 3596)</strong> — 일반관, 압력</li>
              </ul>
            </div>
            <p className={s.helpText}>
              ※ 압력 등급(MPa)은 등급·온도·관경에 따라 변동. 정확한 값은 제조사 시방서·도면을 따르세요.
            </p>
          </div>
        </>
      )}

      {/* 크로스링크 */}
      <Link href="/tools/interior/screw" className={s.crossLink}>
        🔩 나사 규격 계산기 → 배관 부속 나사(PT) 사이즈는 여기로
      </Link>
    </div>
  )
}
