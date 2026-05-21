/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Disclaimer from '@/components/Disclaimer'
import s from './roomMode.module.css'
import {
  ROOM_PRESETS, TRAPS, MODE_COLORS, MODE_LABELS,
  soundSpeed, buildAllModes, schroederFreq, largestGap, boomingRanges,
  diagnoseRatio, bonelloAnalysis, inBoltArea, pressureAt, listenerScore,
  fmt,
} from './roomModeUtils'

type Tab = 'modes' | 'plan' | 'ratio' | 'traps'

const STORAGE_KEY = 'youtil_roommode_v1'

export default function RoomModeClient() {
  const [tab, setTab] = useState<Tab>('modes')

  /* 공통 입력 */
  const [W, setW] = useState('3.5')   // 가로
  const [L, setL] = useState('5.0')   // 세로
  const [H, setH] = useState('2.4')   // 높이
  const [tempC, setTempC] = useState('20')

  /* 탭 2: 평면도 */
  // 정규화 좌표 (0~1) — yRel = 길이 방향 (L), xRel = 가로 방향 (W)
  const [speakerL, setSpeakerL] = useState({ x: 0.25, y: 0.10 })
  const [speakerR, setSpeakerR] = useState({ x: 0.75, y: 0.10 })
  const [listener, setListener] = useState({ x: 0.50, y: 0.38 })

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.W) setW(j.W)
      if (j.L) setL(j.L)
      if (j.H) setH(j.H)
      if (j.tempC) setTempC(j.tempC)
      if (j.speakerL) setSpeakerL(j.speakerL)
      if (j.speakerR) setSpeakerR(j.speakerR)
      if (j.listener) setListener(j.listener)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ W, L, H, tempC, speakerL, speakerR, listener }))
    } catch {}
  }, [W, L, H, tempC, speakerL, speakerR, listener])

  /* 계산 */
  const Wn = parseFloat(W) || 1
  const Ln = parseFloat(L) || 1
  const Hn = parseFloat(H) || 1
  const T = parseFloat(tempC) || 20
  const c = soundSpeed(T)
  const modes = useMemo(() => buildAllModes(Ln, Wn, Hn, c, 5, 300), [Ln, Wn, Hn, c])
  const fSchroeder = schroederFreq(Ln, Wn, Hn)
  const firstMode = modes[0]?.freq ?? 0
  const gap = largestGap(modes)
  const booming = boomingRanges(modes)
  const ratio = diagnoseRatio(Wn, Ln, Hn)
  const bonello = bonelloAnalysis(modes)
  const maxBonello = Math.max(...bonello.map((b) => b.count), 1)

  return (
    <div className={s.wrap}>
      {/* 탭 */}
      <div className={`${s.tabs} ${s.tabs4}`}>
        {([
          { id: 'modes', label: '📊 모드 분석' },
          { id: 'plan',  label: '🗺️ 방 평면도' },
          { id: 'ratio', label: '📐 방 비율 진단' },
          { id: 'traps', label: '🛡️ 트랩·튜닝' },
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

      {/* 공통 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>방 치수</span>
        <div className={s.field}>
          <label className={s.fieldLabel}>한국 거실 프리셋</label>
          <div className={s.pillRow}>
            {ROOM_PRESETS.map((p) => (
              <button
                key={p.id}
                className={s.pill}
                onClick={() => {
                  setL(String(p.L)); setW(String(p.W)); setH(String(p.H))
                }}
                type="button"
              >
                {p.emoji} {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className={s.row3}>
          <div className={s.field}>
            <label className={s.fieldLabel}>가로 W (m)</label>
            <input type="number" className={s.input} value={W} onChange={(e) => setW(e.target.value)} min={0.5} max={20} step={0.1} />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>세로 L (m)</label>
            <input type="number" className={s.input} value={L} onChange={(e) => setL(e.target.value)} min={0.5} max={20} step={0.1} />
          </div>
          <div className={s.field}>
            <label className={s.fieldLabel}>높이 H (m)</label>
            <input type="number" className={s.input} value={H} onChange={(e) => setH(e.target.value)} min={2} max={6} step={0.05} />
          </div>
        </div>
        <div className={s.field}>
          <label className={s.fieldLabel}>온도 ({tempC}°C → 음속 {fmt(c, 1)} m/s)</label>
          <input type="range" min={-10} max={40} step={1} value={tempC} onChange={(e) => setTempC(e.target.value)} className={s.slider} />
        </div>
        <p className={s.helpText}>
          체적 <strong>{fmt(Wn * Ln * Hn, 1)} m³</strong> ·
          슈로더 주파수 <strong className={s.cellAccent}>{fmt(fSchroeder, 1)} Hz</strong>
          {' '}(이 미만에서 룸 모드 지배)
        </p>
      </div>

      {/* ════════ 탭 1: 모드 분석 ════════ */}
      {tab === 'modes' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>📊 룸 모드 분석</p>
            <p className={s.heroValue}>
              총 <strong>{modes.length}개</strong> 모드 (20~300Hz)
            </p>
            <p className={s.heroSub}>
              1차 모드 <strong>{fmt(firstMode, 1)}Hz</strong> ·
              슈로더 <strong>{fmt(fSchroeder, 1)}Hz</strong>
              {gap.gap > 0 && ` · 최대 갭 ${fmt(gap.gap, 1)}Hz (${fmt(gap.from, 1)}→${fmt(gap.to, 1)})`}
            </p>
          </div>

          {/* SVG 막대 차트 */}
          <div className={s.card}>
            <span className={s.cardLabel}>주파수별 모드 분포 (20~300Hz)</span>
            <ModeBarChart modes={modes} schroeder={fSchroeder} />
            <div className={s.legend}>
              <span><span className={s.legendDot} style={{ background: MODE_COLORS.axial }}/>{MODE_LABELS.axial}</span>
              <span><span className={s.legendDot} style={{ background: MODE_COLORS.tangential }}/>{MODE_LABELS.tangential}</span>
              <span><span className={s.legendDot} style={{ background: MODE_COLORS.oblique }}/>{MODE_LABELS.oblique}</span>
            </div>
            <p className={s.helpText}>
              막대 높이 = 모드 강도 (축방향 1.0 / 접선 0.7 / 사선 0.4)<br />
              점선 세로축 = 슈로더 주파수 ({fmt(fSchroeder, 1)} Hz). 이 미만에서 룸 모드가 지배.
            </p>
          </div>

          {/* 부밍 위험 구간 */}
          {booming.length > 0 && (
            <div className={s.warnCardStrong}>
              <strong>🚨 부밍 위험 구간 ({booming.length}곳)</strong>
              <p>
                다음 주파수 부근 5Hz 이내에 모드 3개 이상 몰림 — 부밍·먹먹함 위험:<br />
                {booming.map((b) => `${fmt(b.freq, 1)}Hz (×${b.count})`).join(' · ')}<br />
                → 이 구간에 베이스 트랩·EQ 보정 권장.
              </p>
            </div>
          )}

          {/* 모드 표 */}
          <div className={s.card}>
            <span className={s.cardLabel}>모드 상세 (낮은 주파수 순, 상위 25개)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr>
                    <th>주파수</th>
                    <th>종류</th>
                    <th>차수 (p,q,r)</th>
                    <th>강도</th>
                  </tr>
                </thead>
                <tbody>
                  {modes.slice(0, 25).map((m, i) => (
                    <tr key={i}>
                      <td className={s.cellMono} style={{ color: MODE_COLORS[m.type] }}>{fmt(m.freq, 2)} Hz</td>
                      <td><span className={s.typeBadge} style={{ background: MODE_COLORS[m.type], color: '#0D0D0D' }}>{MODE_LABELS[m.type].split(' ')[0]}</span></td>
                      <td className={s.cellMono}>({m.p}, {m.q}, {m.r})</td>
                      <td className={s.cellMono}>{m.strength.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {modes.length > 25 && <p className={s.helpText}>※ {modes.length - 25}개 더 있음 — 차트로 전체 확인</p>}
          </div>
        </>
      )}

      {/* ════════ 탭 2: 방 평면도 ════════ */}
      {tab === 'plan' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>🗺️ {fmt(Wn, 1)}m × {fmt(Ln, 1)}m 평면도</p>
            <p className={s.heroValue}>
              청취 위치 점수 <strong>{listenerScore(listener.x, listener.y)} / 100</strong>
            </p>
            <p className={s.heroSub}>모드 노드(저음 약한 영역) + 38% 룰을 종합한 점수</p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>top-view (위에서 본 평면도)</span>
            <RoomPlanSVG
              W={Wn} L={Ln}
              speakerL={speakerL}
              speakerR={speakerR}
              listener={listener}
              onSpeakerLChange={setSpeakerL}
              onSpeakerRChange={setSpeakerR}
              onListenerChange={setListener}
            />
            <div className={s.legend}>
              <span><span className={s.legendBox} style={{ background: 'rgba(219, 39, 119, 0.5)' }}/>음압 최대 (벽)</span>
              <span><span className={s.legendBox} style={{ background: 'rgba(13, 148, 136, 0.4)' }}/>모드 노드 (좋음)</span>
              <span>🔊 스피커</span>
              <span>🪑 청취자</span>
              <span style={{ borderTop: '1px dashed var(--accent)', paddingTop: 2 }}>38% 라인</span>
            </div>
            <p className={s.helpText}>
              스피커·청취자 마커를 클릭/드래그해 위치를 조정. 모드 노드(연한 초록) 영역에 청취자가 있으면 저음이 균형 잡힘.
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>위치 정보 (벽에서 거리, m)</span>
            <div className={s.tableScroll}>
              <table className={s.detailTable}>
                <thead>
                  <tr><th>위치</th><th>가로 (W)</th><th>세로 (L)</th><th>점수</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🔊 좌 스피커</td>
                    <td className={s.cellMono}>{fmt(speakerL.x * Wn, 2)}m</td>
                    <td className={s.cellMono}>{fmt(speakerL.y * Ln, 2)}m</td>
                    <td className={s.cellMono}>—</td>
                  </tr>
                  <tr>
                    <td>🔊 우 스피커</td>
                    <td className={s.cellMono}>{fmt(speakerR.x * Wn, 2)}m</td>
                    <td className={s.cellMono}>{fmt(speakerR.y * Ln, 2)}m</td>
                    <td className={s.cellMono}>—</td>
                  </tr>
                  <tr>
                    <td>🪑 청취자</td>
                    <td className={s.cellMono}>{fmt(listener.x * Wn, 2)}m</td>
                    <td className={s.cellMono}>{fmt(listener.y * Ln, 2)}m ({fmt(listener.y * 100, 0)}%)</td>
                    <td className={`${s.cellMono} ${s.cellAccent}`}>{listenerScore(listener.x, listener.y)}/100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>🎯 38% 룰 (Wilson Audio)</strong>
            <p>
              청취자를 방 길이의 <strong>38% 위치 (앞 벽에서)</strong>에 두는 것이 음향적으로 가장 안정.<br />
              본인 방 기준 <strong>앞 벽에서 {fmt(Ln * 0.38, 2)}m</strong> 지점.<br />
              스피커는 청취자와 정삼각형을 이루고, 측벽에서 0.8~1.2m 떨어뜨림 권장.
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 3: 방 비율 진단 ════════ */}
      {tab === 'ratio' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>📐 방 비율 진단</p>
            <p className={s.heroValue} style={{ color: ratio.color }}>
              {ratio.diagnosis}등급 · <strong>{ratio.label}</strong>
            </p>
            <p className={s.heroSub}>
              본인 비율 <strong>{fmt(ratio.ratio.h, 2)} : {fmt(ratio.ratio.w, 2)} : {fmt(ratio.ratio.l, 2)}</strong>
              {' '}(H:W:L)
              {' · '}황금비 1 : 1.14 : 1.39
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>진단 상세</span>
            <p className={s.tipBox}>{ratio.desc}</p>
            <div className={s.tableScroll} style={{ marginTop: 10 }}>
              <table className={s.detailTable}>
                <tbody>
                  <tr><td>본인 방 (H:W:L)</td><td className={s.cellMono}>1 : {fmt(Wn / Hn, 2)} : {fmt(Ln / Hn, 2)}</td></tr>
                  <tr><td>Sepmeyer 황금비</td><td className={s.cellMono}>1 : 1.14 : 1.39</td></tr>
                  <tr><td>Bolt Area 안전 여부</td><td className={s.cellMono} style={{ color: inBoltArea(Wn / Hn, Ln / Hn) ? 'var(--accent)' : '#DB2777' }}>
                    {inBoltArea(Wn / Hn, Ln / Hn) ? '✅ 안전 영역' : '❌ 위험 영역'}
                  </td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bolt Area 플로팅 */}
          <div className={s.card}>
            <span className={s.cardLabel}>Bolt Area 플로팅 (W/H × L/H)</span>
            <BoltAreaSVG W={Wn} L={Ln} H={Hn} />
            <p className={s.helpText}>
              Bolt가 1946년 정의한 &quot;음향적으로 안전한&quot; 비율 영역.
              본인 방 위치(노란 점)가 안전 영역(초록) 안에 있으면 좋음.
            </p>
          </div>

          {/* Bonello criterion */}
          <div className={s.card}>
            <span className={s.cardLabel}>Bonello criterion (1/3 옥타브 모드 분포)</span>
            <div className={s.bonelloGrid}>
              {bonello.map((b, i) => {
                const w = (b.count / maxBonello) * 100
                const isPrev = i > 0 ? bonello[i - 1].count : 0
                const isWorse = i > 0 && b.count < isPrev   // 모드가 줄면 안 좋음
                return (
                  <div key={b.freq} className={s.bonelloRow}>
                    <span className={s.bonelloLabel}>{b.freq}Hz</span>
                    <div className={s.bonelloTrack}>
                      <div
                        className={s.bonelloFill}
                        style={{
                          width: `${Math.max(w, 4)}%`,
                          background: b.count === 0 ? '#444' : (isWorse ? '#DB2777' : '#0D9488'),
                        }}
                      >
                        <span className={s.bonelloVal}>{b.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className={s.helpText}>
              ✅ <strong style={{ color: '#0D9488' }}>균등 증가</strong>가 좋음 — 모든 대역에 모드가 분포<br />
              ❌ <strong style={{ color: '#DB2777' }}>몰림·갭</strong>이 나쁨 — 특정 대역만 몰리면 부밍
            </p>
          </div>
        </>
      )}

      {/* ════════ 탭 4: 트랩·튜닝 ════════ */}
      {tab === 'traps' && (
        <>
          <div className={s.hero}>
            <p className={s.heroLabel}>🛡️ 베이스 트랩 권장</p>
            <p className={s.heroValue}>
              슈로더 미만 모드 <strong>{modes.filter((m) => m.freq < fSchroeder).length}개</strong>
            </p>
            <p className={s.heroSub}>
              {fmt(fSchroeder, 1)}Hz 미만 영역에 트랩 집중 권장
            </p>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>베이스 트랩 4종 비교</span>
            <div className={s.trapGrid}>
              {TRAPS.map((t) => (
                <div key={t.id} className={s.trapCard} style={{ borderTopColor: t.color }}>
                  <p className={s.trapHead}>
                    <span className={s.trapEmoji}>{t.emoji}</span>
                    <strong>{t.label}</strong>
                  </p>
                  <p className={s.trapEffective}>유효 주파수 <strong>{t.effectiveFrom}Hz~</strong></p>
                  <p className={s.trapSpec}>두께: <strong>{t.thicknessMm}</strong></p>
                  <p className={s.trapSpec}>위치: {t.position}</p>
                  <p className={s.trapDesc}>{t.desc}</p>
                  <div className={s.trapPriceRow}>
                    <span>{t.diyPrice}</span>
                    <span>{t.proPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={s.warnCard}>
            <strong>🛠️ 시공 가이드 (우선순위)</strong>
            <p>
              1. <strong>코너 트랩 3~4개</strong>를 앞 양쪽 코너 + 뒤 1개 (필수)<br />
              2. <strong>1차 반사 지점 벽 트랩</strong> 4개 (스피커-청취자 사이 측벽)<br />
              3. <strong>천장 클라우드</strong> 1~2개 (청취자 머리 위)<br />
              4. 부밍 주파수 특정되면 <strong>멤브레인·헬름홀츠</strong> 추가<br />
              5. 측정 마이크 + REW로 사후 검증<br />
              <br />
              💰 일반 거실 기본 패키지 <strong>50~100만원 (DIY)</strong> / <strong>100~300만원 (완제품)</strong>
            </p>
          </div>

          <div className={s.warnCardStrong}>
            <strong>📏 본인 방 권장 트랩 수량 (참고)</strong>
            <p>
              체적 <strong>{fmt(Wn * Ln * Hn, 1)} m³</strong> 기준:<br />
              • 코너 트랩: <strong>{Math.max(3, Math.min(8, Math.ceil(Wn * Ln * Hn / 15)))}개</strong><br />
              • 벽 트랩: <strong>{Math.max(2, Math.min(8, Math.ceil(Wn * Ln / 8)))}개</strong><br />
              • 천장 클라우드: <strong>{Math.max(1, Math.min(4, Math.ceil(Wn * Ln / 12)))}개</strong><br />
              ※ 일반 가이드 — 실제 측정으로 조정 필요
            </p>
          </div>
        </>
      )}

      {/* 안내 */}
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/edu/cosmic-calendar', label: '코스믹 캘린더' },
          { href: '/tools/edu/planet-comparison', label: '행성 비교' },
          { href: '/tools/edu/cognitive-test', label: '인지 테스트' }
        ]}
      >
        사용 안내 룸 모드는 <strong>직사각형 방 가정</strong> — 비대칭·복도·가구 영향 큼. 표시 주파수는 <strong>이상 모델</strong> — 실제는 ±10Hz 변동. 정확한 측정은 <strong>REW (Room EQ Wizard) + 측정 마이크</strong>를 권장합니다.
      </Disclaimer>

      {/* 크로스링크 */}
      <Link href="/tools/edu/sound-speed" className={s.crossLink}>
        🔊 음속 계산기 → 천둥 거리·반향·RT60·에코까지
      </Link>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ModeBarChart — 주파수 막대 차트
   ───────────────────────────────────────────── */
interface BarProps { modes: { freq: number; type: 'axial' | 'tangential' | 'oblique'; strength: number }[]; schroeder: number }

function ModeBarChart({ modes, schroeder }: BarProps) {
  const W = 700
  const H = 180
  const padL = 32
  const padR = 12
  const padT = 12
  const padB = 28
  const fMin = 20
  const fMax = 300
  const xScale = (f: number) => padL + ((f - fMin) / (fMax - fMin)) * (W - padL - padR)
  const yBase = H - padB
  const yMax = padT
  const yScale = (s: number) => yBase - s * (yBase - yMax)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 600, width: '100%' }}>
        {/* 격자 */}
        {[20, 50, 100, 150, 200, 250, 300].map((f) => (
          <g key={f}>
            <line x1={xScale(f)} y1={padT} x2={xScale(f)} y2={yBase} stroke="var(--border)" strokeWidth="0.5" />
            <text x={xScale(f)} y={H - 10} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">{f}Hz</text>
          </g>
        ))}
        {/* 강도 라벨 */}
        {[0.4, 0.7, 1.0].map((s) => (
          <g key={s}>
            <line x1={padL} y1={yScale(s)} x2={W - padR} y2={yScale(s)} stroke="var(--border)" strokeWidth="0.3" strokeDasharray="2,3" />
            <text x={padL - 4} y={yScale(s) + 3} fill="var(--muted)" fontSize="9" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">{s}</text>
          </g>
        ))}
        {/* 슈로더 라인 */}
        {schroeder >= fMin && schroeder <= fMax && (
          <g>
            <line x1={xScale(schroeder)} y1={padT - 4} x2={xScale(schroeder)} y2={yBase + 4} stroke="#D97706" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x={xScale(schroeder)} y={padT - 2} fill="#D97706" fontSize="9" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="700">슈로더</text>
          </g>
        )}
        {/* 모드 막대 */}
        {modes.map((m, i) => {
          if (m.freq < fMin || m.freq > fMax) return null
          const x = xScale(m.freq)
          const y = yScale(m.strength)
          return (
            <rect
              key={i}
              x={x - 1.5}
              y={y}
              width={3}
              height={yBase - y}
              fill={MODE_COLORS[m.type]}
              opacity={0.8}
            >
              <title>{`${m.freq.toFixed(1)}Hz · ${MODE_LABELS[m.type]}`}</title>
            </rect>
          )
        })}
        {/* X축 */}
        <line x1={padL} y1={yBase} x2={W - padR} y2={yBase} stroke="var(--text)" strokeWidth="1" />
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────────
   RoomPlanSVG — 방 평면도 (인터랙티브)
   ───────────────────────────────────────────── */
interface PlanProps {
  W: number; L: number
  speakerL: { x: number; y: number }
  speakerR: { x: number; y: number }
  listener: { x: number; y: number }
  onSpeakerLChange: (p: { x: number; y: number }) => void
  onSpeakerRChange: (p: { x: number; y: number }) => void
  onListenerChange: (p: { x: number; y: number }) => void
}

function RoomPlanSVG({ W, L, speakerL, speakerR, listener, onSpeakerLChange, onSpeakerRChange, onListenerChange }: PlanProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [drag, setDrag] = useState<'sL' | 'sR' | 'listener' | null>(null)

  /* SVG 표시 영역 (정사각형 가까이 유지) */
  const maxDim = 360
  const aspect = W / L
  const w = aspect >= 1 ? maxDim : maxDim * aspect
  const h = aspect >= 1 ? maxDim / aspect : maxDim
  const pad = 30
  const totalW = w + pad * 2
  const totalH = h + pad * 2

  /* 음압 컬러맵: 격자 셀 */
  const cellsX = 24
  const cellsY = 24
  const cells: { x: number; y: number; p: number }[] = []
  for (let i = 0; i < cellsX; i++) {
    for (let j = 0; j < cellsY; j++) {
      const xRel = (i + 0.5) / cellsX
      const yRel = (j + 0.5) / cellsY
      cells.push({ x: i, y: j, p: pressureAt(xRel, yRel) })
    }
  }

  /* 마우스/터치 이벤트 */
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const xRel = Math.max(0, Math.min(1, ((e.clientX - rect.left) / rect.width * totalW - pad) / w))
    const yRel = Math.max(0, Math.min(1, ((e.clientY - rect.top) / rect.height * totalH - pad) / h))
    if (drag === 'sL') onSpeakerLChange({ x: xRel, y: yRel })
    else if (drag === 'sR') onSpeakerRChange({ x: xRel, y: yRel })
    else if (drag === 'listener') onListenerChange({ x: xRel, y: yRel })
  }

  return (
    <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ touchAction: drag ? 'none' : 'auto', userSelect: 'none', maxWidth: '100%' }}
        onPointerMove={onPointerMove}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        {/* 음압 컬러맵 */}
        {cells.map((c, i) => {
          const cellW = w / cellsX
          const cellH = h / cellsY
          const x = pad + c.x * cellW
          const y = pad + c.y * cellH
          // p (0~1) → 색상: 0=초록(노드, 좋음), 1=빨강(최대, 나쁨)
          const r = Math.floor(255 * c.p)
          const g = Math.floor(180 * (1 - c.p))
          const opacity = 0.18 + c.p * 0.25
          return (
            <rect key={i} x={x} y={y} width={cellW} height={cellH} fill={`rgb(${r},${g},90)`} opacity={opacity} />
          )
        })}
        {/* 방 외곽선 */}
        <rect x={pad} y={pad} width={w} height={h} fill="none" stroke="var(--text)" strokeWidth="2" />
        {/* 38% 라인 */}
        <line x1={pad} y1={pad + h * 0.38} x2={pad + w} y2={pad + h * 0.38} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="6,4" />
        <text x={pad + w + 4} y={pad + h * 0.38 + 4} fill="var(--accent)" fontSize="10" fontFamily="Inter, system-ui, sans-serif">38%</text>
        {/* 가로/세로 치수 */}
        <text x={pad + w / 2} y={pad - 8} fill="var(--muted)" fontSize="11" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">{fmt(W, 1)}m (가로 W)</text>
        <text x={pad - 8} y={pad + h / 2} fill="var(--muted)" fontSize="11" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" transform={`rotate(-90, ${pad - 8}, ${pad + h / 2})`}>
          {fmt(L, 1)}m (세로 L)
        </text>
        {/* 앞 벽 라벨 */}
        <text x={pad + w / 2} y={pad + 14} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">앞 벽 (스피커 면)</text>
        <text x={pad + w / 2} y={pad + h - 6} fill="var(--muted)" fontSize="9" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">뒤 벽</text>

        {/* 청취자 (드래그) */}
        <g
          onPointerDown={(e) => { e.preventDefault(); setDrag('listener') }}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={pad + listener.x * w} cy={pad + listener.y * h} r={16} fill="rgba(8, 145, 178, 0.25)" />
          <circle cx={pad + listener.x * w} cy={pad + listener.y * h} r={12} fill="#0891B2" stroke="#000" strokeWidth="1.5" />
          <text x={pad + listener.x * w} y={pad + listener.y * h + 4} fontSize="14" textAnchor="middle">🪑</text>
        </g>

        {/* 좌 스피커 */}
        <g
          onPointerDown={(e) => { e.preventDefault(); setDrag('sL') }}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={pad + speakerL.x * w} cy={pad + speakerL.y * h} r={11} fill="#EA580C" stroke="#000" strokeWidth="1.5" />
          <text x={pad + speakerL.x * w} y={pad + speakerL.y * h + 4} fontSize="13" textAnchor="middle">L</text>
        </g>

        {/* 우 스피커 */}
        <g
          onPointerDown={(e) => { e.preventDefault(); setDrag('sR') }}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={pad + speakerR.x * w} cy={pad + speakerR.y * h} r={11} fill="#EA580C" stroke="#000" strokeWidth="1.5" />
          <text x={pad + speakerR.x * w} y={pad + speakerR.y * h + 4} fontSize="13" textAnchor="middle">R</text>
        </g>

        {/* 스피커-청취자 정삼각형 가이드 */}
        <line x1={pad + speakerL.x * w} y1={pad + speakerL.y * h} x2={pad + listener.x * w} y2={pad + listener.y * h} stroke="rgba(234, 88, 12, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={pad + speakerR.x * w} y1={pad + speakerR.y * h} x2={pad + listener.x * w} y2={pad + listener.y * h} stroke="rgba(234, 88, 12, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={pad + speakerL.x * w} y1={pad + speakerL.y * h} x2={pad + speakerR.x * w} y2={pad + speakerR.y * h} stroke="rgba(234, 88, 12, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────────
   BoltAreaSVG — Bolt Area 플로팅
   ───────────────────────────────────────────── */
function BoltAreaSVG({ W, L, H }: { W: number; L: number; H: number }) {
  const wlRatio = W / H
  const llRatio = L / H

  const svgW = 360
  const svgH = 280
  const padL = 36
  const padR = 12
  const padT = 12
  const padB = 28
  const xMin = 1.0, xMax = 2.6
  const yMin = 1.0, yMax = 2.6
  const xScale = (v: number) => padL + ((v - xMin) / (xMax - xMin)) * (svgW - padL - padR)
  const yScale = (v: number) => svgH - padB - ((v - yMin) / (yMax - yMin)) * (svgH - padT - padB)

  /* 안전 영역 폴리곤 (단순 박스) */
  const safePoly = `
    ${xScale(1.1)},${yScale(1.4)}
    ${xScale(1.1)},${yScale(2.5)}
    ${xScale(2.5)},${yScale(2.5)}
    ${xScale(2.5)},${yScale(1.4)}
  `

  return (
    <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        {/* 격자 */}
        {[1.0, 1.5, 2.0, 2.5].map((v) => (
          <g key={`gx-${v}`}>
            <line x1={xScale(v)} y1={padT} x2={xScale(v)} y2={svgH - padB} stroke="var(--border)" strokeWidth="0.4" />
            <text x={xScale(v)} y={svgH - 10} fill="var(--muted)" fontSize="10" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">{v}</text>
          </g>
        ))}
        {[1.0, 1.5, 2.0, 2.5].map((v) => (
          <g key={`gy-${v}`}>
            <line x1={padL} y1={yScale(v)} x2={svgW - padR} y2={yScale(v)} stroke="var(--border)" strokeWidth="0.4" />
            <text x={padL - 6} y={yScale(v) + 3} fill="var(--muted)" fontSize="10" textAnchor="end" fontFamily="Inter, system-ui, sans-serif">{v}</text>
          </g>
        ))}
        {/* 안전 영역 */}
        <polygon points={safePoly} fill="rgba(13, 148, 136, 0.18)" stroke="#0D9488" strokeWidth="1.5" />
        {/* 황금비 점 (Sepmeyer) */}
        <circle cx={xScale(1.14)} cy={yScale(1.39)} r={6} fill="#D97706" stroke="#000" strokeWidth="0.5" />
        <text x={xScale(1.14) + 8} y={yScale(1.39) + 4} fill="#D97706" fontSize="9" fontFamily="Inter, system-ui, sans-serif">Sepmeyer ⭐</text>
        {/* 정육면체 (위험) */}
        <circle cx={xScale(1.0)} cy={yScale(1.0)} r={5} fill="#DB2777" stroke="#000" strokeWidth="0.5" />
        <text x={xScale(1.0) + 7} y={yScale(1.0) + 4} fill="#DB2777" fontSize="9" fontFamily="Inter, system-ui, sans-serif">정육면체 ⚠️</text>
        {/* 본인 방 */}
        {wlRatio >= xMin && wlRatio <= xMax && llRatio >= yMin && llRatio <= yMax && (
          <g>
            <circle cx={xScale(wlRatio)} cy={yScale(llRatio)} r={9} fill="var(--accent)" stroke="#000" strokeWidth="1.5" />
            <text x={xScale(wlRatio)} y={yScale(llRatio) - 14} fill="var(--accent)" fontSize="11" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontWeight="700">내 방</text>
          </g>
        )}
        {/* 축 라벨 */}
        <text x={svgW / 2} y={svgH - 1} fill="var(--text)" fontSize="11" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif">W / H (가로/높이)</text>
        <text x={padL - 28} y={svgH / 2} fill="var(--text)" fontSize="11" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" transform={`rotate(-90, ${padL - 28}, ${svgH / 2})`}>L / H (세로/높이)</text>
      </svg>
    </div>
  )
}
