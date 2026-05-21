'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './grip-size.module.css'
import {
  TENNIS_GRIPS, GOLF_GRIPS, BADMINTON_GRIPS, SQUASH_GRIPS,
  recommendTennis, gloveByHandLength, golfGripByGlove,
  recommendBadminton, recommendSquash,
  palmToFullHand, fullHandToPalm, cmToInchFraction,
  INJURIES,
} from './gripData'

const STORAGE_KEY = 'youtil_grip_size_v1'

type Method = 'ruler' | 'pencil'

export default function GripSizeClient() {
  /* 측정 방식 */
  const [method, setMethod] = useState<Method>('ruler')

  /* 측정값 */
  const [palmCm, setPalmCm] = useState(11.0)   // 손바닥+약지 (테니스 측정법)
  const [fullCm, setFullCm] = useState(19.0)   // 손 전체 (골프용)
  const [gloveSize, setGloveSize] = useState(23)  // 직접 입력 시 override
  const [useDirectGlove, setUseDirectGlove] = useState(false)

  /* 옵션 */
  const [tennisOvergrip, setTennisOvergrip] = useState<0 | 1 | 2>(0)
  const [badmintonOvergrip, setBadmintonOvergrip] = useState<0 | 1 | 2>(1)

  /* 펜슬 테스트 결과 입력 */
  const [pencilResult, setPencilResult] = useState<'snug' | 'fit' | 'gap' | null>(null)

  /* 성별·체형 빠른 프리셋 */
  const applyPreset = (palm: number) => {
    setPalmCm(palm)
    setFullCm(palmToFullHand(palm))
    setUseDirectGlove(false)
  }

  /* 두 측정값 연동 — 사용자가 한쪽만 바꿔도 다른 쪽 자동 갱신 */
  const onPalmChange = (v: number) => {
    setPalmCm(v)
    setFullCm(palmToFullHand(v))
  }
  const onFullChange = (v: number) => {
    setFullCm(v)
    setPalmCm(fullHandToPalm(v))
  }

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (typeof j.palmCm === 'number') setPalmCm(j.palmCm)
      if (typeof j.fullCm === 'number') setFullCm(j.fullCm)
      if (typeof j.gloveSize === 'number') setGloveSize(j.gloveSize)
      if (typeof j.useDirectGlove === 'boolean') setUseDirectGlove(j.useDirectGlove)
      if (typeof j.tennisOvergrip === 'number') setTennisOvergrip(j.tennisOvergrip)
      if (typeof j.badmintonOvergrip === 'number') setBadmintonOvergrip(j.badmintonOvergrip)
      if (j.method) setMethod(j.method)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        palmCm, fullCm, gloveSize, useDirectGlove,
        tennisOvergrip, badmintonOvergrip, method,
      }))
    } catch {}
  }, [palmCm, fullCm, gloveSize, useDirectGlove, tennisOvergrip, badmintonOvergrip, method])

  /* 추천 결과 */
  const tennis = useMemo(() => recommendTennis(palmCm, tennisOvergrip), [palmCm, tennisOvergrip])
  const effectiveGlove = useDirectGlove ? gloveSize : gloveByHandLength(fullCm)
  const golf = useMemo(() => golfGripByGlove(effectiveGlove), [effectiveGlove])
  const badminton = useMemo(() => recommendBadminton(palmCm, badmintonOvergrip), [palmCm, badmintonOvergrip])
  const squash = useMemo(() => recommendSquash(palmCm), [palmCm])

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/sports/golf-distance', label: '골프 비거리 계산기' },
          { href: '/tools/sports/one-rm',        label: '1RM 계산기' },
          { href: '/tools/health/weightloss',    label: '체중 감량 계산기' },
        ]}
      >
        손 크기 평균 데이터 기반 일반 권장값입니다. 실제 매장 시타·시타용 그립 테스트와 함께 결정하세요.
      </Disclaimer>

      {/* ── 1. 측정 방법 선택 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📐 측정 방법</div>
        <div className={s.methodRow}>
          <button
            type="button"
            className={`${s.methodBtn} ${method === 'ruler' ? s.methodActive : ''}`}
            onClick={() => setMethod('ruler')}
          >
            <span className={s.methodIcon}>📏</span>
            <span className={s.methodName}>자로 측정</span>
            <span className={s.methodDesc}>정확도 ↑ · 손에 자만 있으면 OK</span>
          </button>
          <button
            type="button"
            className={`${s.methodBtn} ${method === 'pencil' ? s.methodActive : ''}`}
            onClick={() => setMethod('pencil')}
          >
            <span className={s.methodIcon}>✏️</span>
            <span className={s.methodName}>펜슬 테스트</span>
            <span className={s.methodDesc}>라켓 보유자용 · 즉시 확인</span>
          </button>
        </div>
      </div>

      {/* ── 2. 측정값 입력 ── */}
      {method === 'ruler' && (
        <div className={s.card}>
          <div className={s.cardLabel}>✋ 손 측정 (cm)</div>

          {/* SVG 가이드 */}
          <HandMeasureSvg palmCm={palmCm} fullCm={fullCm} />

          <div className={s.subLabel} style={{ marginTop: 12 }}>
            ① 손바닥 + 약지 길이 <span className={s.hint}>(테니스 측정법)</span>
          </div>
          <div className={s.sliderRow}>
            <input
              type="range"
              min={8} max={13} step={0.1}
              value={palmCm}
              onChange={e => onPalmChange(parseFloat(e.target.value))}
              className={s.slider}
            />
            <span className={s.sliderVal}>{palmCm.toFixed(1)} cm</span>
          </div>
          <div className={s.tickRow}>
            <span>8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span>
          </div>

          <div className={s.subLabel} style={{ marginTop: 14 }}>
            ② 손 전체 길이 <span className={s.hint}>(손목 주름 ~ 중지 끝, 골프 글러브용)</span>
          </div>
          <div className={s.sliderRow}>
            <input
              type="range"
              min={14} max={24} step={0.1}
              value={fullCm}
              onChange={e => onFullChange(parseFloat(e.target.value))}
              className={s.slider}
            />
            <span className={s.sliderVal}>{fullCm.toFixed(1)} cm</span>
          </div>

          <div className={s.subLabel} style={{ marginTop: 14 }}>빠른 프리셋</div>
          <div className={s.presetRow}>
            <button type="button" className={s.presetBtn} onClick={() => applyPreset(9.8)}>
              <span>👧 청소년</span>
              <small>~ 9.8cm</small>
            </button>
            <button type="button" className={s.presetBtn} onClick={() => applyPreset(10.4)}>
              <span>👩 여성 평균</span>
              <small>~ 10.4cm</small>
            </button>
            <button type="button" className={s.presetBtn} onClick={() => applyPreset(11.0)}>
              <span>👨 남성 평균</span>
              <small>~ 11.0cm</small>
            </button>
            <button type="button" className={s.presetBtn} onClick={() => applyPreset(11.6)}>
              <span>👨‍🦱 큰 손 남성</span>
              <small>~ 11.6cm</small>
            </button>
          </div>
        </div>
      )}

      {method === 'pencil' && (
        <div className={s.card}>
          <div className={s.cardLabel}>✏️ 펜슬 테스트 (라켓 보유자)</div>
          <PencilTestSvg result={pencilResult} />

          <ol className={s.steps}>
            <li>라켓을 <strong>이스턴 포핸드 그립</strong>으로 잡으세요 (악수하듯).</li>
            <li>잡지 않은 손의 <strong>검지</strong>를 손가락 끝과 손바닥 사이 빈 공간에 넣어보세요.</li>
            <li>아래에서 결과를 선택하세요.</li>
          </ol>

          <div className={s.pencilResultRow}>
            <button type="button"
              className={`${s.pencilBtn} ${pencilResult === 'snug' ? s.pencilActiveS : ''}`}
              onClick={() => { setPencilResult('snug'); setPalmCm(Math.max(8, palmCm - 0.3)); setFullCm(palmToFullHand(Math.max(8, palmCm - 0.3))) }}
            >
              <span className={s.pencilEmoji}>🔴</span>
              <strong>검지가 안 들어감</strong>
              <small>그립이 너무 작음 → 한 사이즈 ↑ 권장</small>
            </button>
            <button type="button"
              className={`${s.pencilBtn} ${pencilResult === 'fit' ? s.pencilActiveF : ''}`}
              onClick={() => setPencilResult('fit')}
            >
              <span className={s.pencilEmoji}>🟢</span>
              <strong>검지가 딱 맞게 들어감</strong>
              <small>현재 그립이 적당함</small>
            </button>
            <button type="button"
              className={`${s.pencilBtn} ${pencilResult === 'gap' ? s.pencilActiveG : ''}`}
              onClick={() => { setPencilResult('gap'); setPalmCm(Math.min(13, palmCm + 0.3)); setFullCm(palmToFullHand(Math.min(13, palmCm + 0.3))) }}
            >
              <span className={s.pencilEmoji}>🟠</span>
              <strong>검지보다 여유 있음</strong>
              <small>그립이 너무 큼 → 한 사이즈 ↓ 권장</small>
            </button>
          </div>

          {pencilResult && pencilResult !== 'fit' && (
            <p className={s.pencilNote}>
              💡 자동으로 측정값을 조정했습니다. 더 정확한 권장을 위해 「자로 측정」 모드에서 직접 입력하세요.
            </p>
          )}
        </div>
      )}

      {/* ── 3. 옵션: 오버그립·글러브 직접 입력 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>⚙️ 세부 옵션</div>

        <div className={s.optBlock}>
          <div className={s.optTitle}>🎾 테니스 오버그립</div>
          <div className={s.overgripRow}>
            {[0, 1, 2].map(n => (
              <button key={n}
                type="button"
                className={`${s.overgripBtn} ${tennisOvergrip === n ? s.overgripActive : ''}`}
                onClick={() => setTennisOvergrip(n as 0 | 1 | 2)}
              >
                {n === 0 ? '없음' : `${n}겹`}
              </button>
            ))}
          </div>
          <p className={s.optHint}>오버그립 1겹당 그립 약 0.5단계 굵어짐 — 작은 그립 + 오버그립 활용 가능</p>
        </div>

        <div className={s.optBlock}>
          <div className={s.optTitle}>🏸 배드민턴 오버그립</div>
          <div className={s.overgripRow}>
            {[0, 1, 2].map(n => (
              <button key={n}
                type="button"
                className={`${s.overgripBtn} ${badmintonOvergrip === n ? s.overgripActive : ''}`}
                onClick={() => setBadmintonOvergrip(n as 0 | 1 | 2)}
              >
                {n === 0 ? '없음' : `${n}겹`}
              </button>
            ))}
          </div>
          <p className={s.optHint}>한국 동호인 80%가 1~2겹 사용 — 기본 라켓 G4 + 1겹이 표준</p>
        </div>

        <div className={s.optBlock}>
          <div className={s.optTitle}>⛳ 골프 글러브 호수 (직접 입력)</div>
          <label className={s.toggleLabel}>
            <input type="checkbox"
              checked={useDirectGlove}
              onChange={e => setUseDirectGlove(e.target.checked)}
            />
            <span>이미 알고 있는 글러브 호수로 정확히 매칭</span>
          </label>
          {useDirectGlove && (
            <div className={s.sliderRow} style={{ marginTop: 8 }}>
              <input
                type="range"
                min={20} max={30} step={1}
                value={gloveSize}
                onChange={e => setGloveSize(parseInt(e.target.value))}
                className={s.slider}
              />
              <span className={s.sliderVal}>{gloveSize}호</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. 결과 — 4종목 카드 ── */}
      <div className={s.resultGrid}>
        {/* 테니스 */}
        <div className={s.resultCard} style={{ '--accent': '#FFD93E' } as React.CSSProperties}>
          <div className={s.resultHeader}>
            <span className={s.resultSport}>🎾 테니스</span>
            <span className={s.resultBadge}>{tennis.grip.eu}</span>
          </div>
          <div className={s.resultBig}>{tennis.grip.size}</div>
          <div className={s.resultSub}>
            US #{tennis.grip.us} · {tennis.grip.cm.toFixed(2)} cm
          </div>
          <p className={s.resultDesc}>{tennis.grip.desc}</p>
          {tennisOvergrip > 0 && (
            <p className={s.resultNote}>오버그립 {tennisOvergrip}겹 반영</p>
          )}
        </div>

        {/* 골프 */}
        <div className={s.resultCard} style={{ '--accent': '#059669' } as React.CSSProperties}>
          <div className={s.resultHeader}>
            <span className={s.resultSport}>⛳ 골프</span>
            <span className={s.resultBadge}>{effectiveGlove}호</span>
          </div>
          <div className={s.resultBig}>{golf.name}</div>
          <div className={s.resultSub}>
            지름 {golf.diameter} · {golf.delta}
          </div>
          <p className={s.resultDesc}>{golf.desc}</p>
          <p className={s.resultNote}>{golf.recommendedGlove}</p>
        </div>

        {/* 배드민턴 */}
        <div className={s.resultCard} style={{ '--accent': '#0891B2' } as React.CSSProperties}>
          <div className={s.resultHeader}>
            <span className={s.resultSport}>🏸 배드민턴</span>
            <span className={s.resultBadge}>{badminton.id}</span>
          </div>
          <div className={s.resultBig}>{badminton.id}</div>
          <div className={s.resultSub}>
            둘레 {badminton.circumferenceMm} mm
          </div>
          <p className={s.resultDesc}>{badminton.desc}</p>
          {badmintonOvergrip > 0 && (
            <p className={s.resultNote}>오버그립 {badmintonOvergrip}겹 반영</p>
          )}
        </div>

        {/* 스쿼시 */}
        <div className={s.resultCard} style={{ '--accent': '#B885DA' } as React.CSSProperties}>
          <div className={s.resultHeader}>
            <span className={s.resultSport}>🎾 스쿼시</span>
            <span className={s.resultBadge}>{cmToInchFraction(squash.inches * 2.54)}</span>
          </div>
          <div className={s.resultBig}>{squash.size.split(' (')[0]}</div>
          <div className={s.resultSub}>
            지름 {squash.size.split(' (')[1]?.replace(')', '')}
          </div>
          <p className={s.resultDesc}>{squash.desc}</p>
        </div>
      </div>

      {/* ── 5. 사이즈 차트 (참고) ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📊 사이즈 차트 — 측정값 기준 가까운 사이즈</div>
        <div className={s.tableWrap}>
          <table className={s.gripTable}>
            <thead>
              <tr>
                <th>손바닥+약지 (cm)</th>
                <th>테니스 (EU·US)</th>
                <th>배드민턴</th>
                <th>스쿼시</th>
              </tr>
            </thead>
            <tbody>
              {[
                { palm: 9.8, label: '~ 9.8' },
                { palm: 10.4, label: '10.0~10.4' },
                { palm: 10.7, label: '10.5~10.7' },
                { palm: 11.0, label: '10.8~11.1' },
                { palm: 11.3, label: '11.2~11.4' },
                { palm: 11.7, label: '11.5~11.7' },
                { palm: 12.0, label: '11.8~12.0' },
              ].map(row => {
                const t = recommendTennis(row.palm, 0).grip
                const b = recommendBadminton(row.palm, 0)
                const sq = recommendSquash(row.palm)
                const isMe = Math.abs(row.palm - palmCm) < 0.2
                return (
                  <tr key={row.palm} className={isMe ? s.rowHi : ''}>
                    <td>{row.label}</td>
                    <td>{t.size} ({t.eu} · US #{t.us})</td>
                    <td>{b.id}</td>
                    <td>{sq.size.split(' (')[0]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. 부상 가이드 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>⚠️ 잘못된 그립 사이즈 → 부상 위험</div>
        <div className={s.injuryGrid}>
          {INJURIES.map((it, i) => (
            <div key={i} className={s.injuryCard} style={{ borderLeftColor: it.color }}>
              <div className={s.injuryHead}>
                <strong style={{ color: it.color }}>{it.cause}</strong>
                <span className={s.injurySport}>{it.sports}</span>
              </div>
              <ul className={s.injuryList}>
                {it.risks.map((r, j) => <li key={j}>{r}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. 핵심 팁 ── */}
      <div className={s.tipCard}>
        <div className={s.cardLabel}>💡 그립 사이즈 핵심 팁</div>
        <ul className={s.tipList}>
          <li><strong>의심스러우면 작게 가고 오버그립으로 보정</strong> — 키우긴 쉬워도 줄이긴 어렵다</li>
          <li><strong>한국 라켓 출고 표준</strong> — 테니스 L2~L3, 배드민턴 G4, 골프 표준</li>
          <li><strong>여름엔 약간 굵게</strong> — 땀으로 미끄러우면 그립 압력 ↑ → 부상 위험</li>
          <li><strong>관절염·약한 손목</strong> — 1단계 굵게 (그립 압력 분산 효과)</li>
          <li><strong>2년마다 그립 교체</strong> — 마모로 둘레가 1mm 이상 줄어듦</li>
          <li><strong>매장 시타 권장</strong> — 본 도구는 출발점, 최종 결정은 직접 잡아보고</li>
        </ul>
      </div>
    </div>
  )
}

/* ─── 손 측정 SVG 가이드 ─── */
function HandMeasureSvg({ palmCm, fullCm }: { palmCm: number; fullCm: number }) {
  void palmCm; void fullCm
  return (
    <svg viewBox="0 0 400 280" className={s.handSvg} preserveAspectRatio="xMidYMid meet">
      {/* 손 외곽 (오른손 손바닥) */}
      <path
        d="M 200 260
           L 200 230
           Q 165 225 155 215
           Q 145 200 145 170
           L 145 100
           Q 145 80 158 78
           Q 168 80 168 100
           L 168 145
           L 170 145
           L 170 70
           Q 170 55 183 55
           Q 195 57 195 70
           L 195 145
           L 197 145
           L 197 60
           Q 197 45 210 45
           Q 222 47 222 60
           L 222 145
           L 224 145
           L 224 75
           Q 224 62 237 62
           Q 248 65 248 78
           L 248 165
           Q 248 200 240 215
           Q 230 225 200 230 Z"
        fill="rgba(14, 165, 233, 0.08)"
        stroke="var(--accent)"
        strokeWidth="2"
      />

      {/* 손목 라인 */}
      <line x1="160" y1="258" x2="248" y2="258" stroke="#fff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <text x="155" y="262" fill="var(--muted)" fontSize="9" textAnchor="end" fontFamily="Noto Sans KR, sans-serif">손목</text>

      {/* 약지(ring finger) 강조 + 화살표 */}
      <line x1="210" y1="45" x2="210" y2="258" stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.9" />

      {/* 손바닥 두 번째 주름 점 */}
      <circle cx="210" cy="178" r="4" fill="#FFD93E" stroke="#000" strokeWidth="1" />
      <text x="218" y="180" fill="#FFD93E" fontSize="10" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">2번째 주름</text>

      {/* 약지 끝 점 */}
      <circle cx="210" cy="45" r="4" fill="#FFD93E" stroke="#000" strokeWidth="1" />
      <text x="218" y="48" fill="#FFD93E" fontSize="10" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">약지 끝</text>

      {/* ① 측정 라벨 */}
      <g transform="translate(110, 110)">
        <rect x="-4" y="-12" width="56" height="24" rx="4" fill="rgba(0,0,0,0.7)" />
        <text x="0" y="2" fill="#059669" fontSize="10" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">① 테니스</text>
        <text x="0" y="14" fill="#fff" fontSize="9" fontFamily="Noto Sans KR, sans-serif">손바닥+약지</text>
      </g>
      <path d="M 165 117 L 200 120" stroke="#059669" strokeWidth="1.5" markerEnd="url(#arrow)" />

      {/* 손목→중지 끝 (전체 손길이) */}
      <circle cx="180" cy="258" r="3.5" fill="#0891B2" stroke="#000" strokeWidth="1" />
      <circle cx="183" cy="55" r="3.5" fill="#0891B2" stroke="#000" strokeWidth="1" />
      <line x1="180" y1="258" x2="183" y2="55" stroke="#0891B2" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.7" />

      <g transform="translate(60, 200)">
        <rect x="-4" y="-12" width="62" height="24" rx="4" fill="rgba(0,0,0,0.7)" />
        <text x="0" y="2" fill="#0891B2" fontSize="10" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">② 골프</text>
        <text x="0" y="14" fill="#fff" fontSize="9" fontFamily="Noto Sans KR, sans-serif">손목~중지 끝</text>
      </g>
      <path d="M 122 207 L 175 200" stroke="#0891B2" strokeWidth="1.5" markerEnd="url(#arrowB)" />

      {/* 화살표 마커 */}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
        </marker>
        <marker id="arrowB" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891B2" />
        </marker>
      </defs>
    </svg>
  )
}

/* ─── 펜슬 테스트 SVG ─── */
function PencilTestSvg({ result }: { result: 'snug' | 'fit' | 'gap' | null }) {
  void result
  return (
    <svg viewBox="0 0 400 200" className={s.handSvg} preserveAspectRatio="xMidYMid meet">
      {/* 그립 (8각형 모양 라켓 손잡이) */}
      <rect x="160" y="60" width="80" height="100" rx="6"
        fill="rgba(255, 217, 62, 0.20)" stroke="#FFD93E" strokeWidth="2" />
      <text x="200" y="115" fill="#FFD93E" fontSize="11" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">라켓 그립</text>

      {/* 손가락 (그립을 감싼) */}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <rect x={155 + i * 23} y="40" width="18" height="50" rx="4"
            fill="rgba(14, 165, 233, 0.18)" stroke="var(--accent)" strokeWidth="1.5" />
        </g>
      ))}

      {/* 손가락 끝 ~ 손바닥 사이 공간 */}
      <line x1="160" y1="90" x2="240" y2="90" stroke="#fff" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

      {/* 검지 (테스트용) */}
      <rect x="275" y="65" width="16" height="48" rx="4"
        fill="rgba(8, 145, 178, 0.30)" stroke="#0891B2" strokeWidth="2" />
      <text x="283" y="55" fill="#0891B2" fontSize="10" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">검지</text>
      <path d="M 283 122 Q 283 140 240 140" stroke="#0891B2" strokeWidth="1.5" fill="none" strokeDasharray="3 3" markerEnd="url(#arrowC)" />

      {/* 안내 텍스트 */}
      <text x="200" y="180" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="Noto Sans KR, sans-serif">
        손가락 끝 ↔ 손바닥 빈 공간에 검지가 딱 들어가면 OK
      </text>

      <defs>
        <marker id="arrowC" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#0891B2" />
        </marker>
      </defs>
    </svg>
  )
}
