'use client'

import { useMemo, useState } from 'react'
import styles from './curtain-blind.module.css'

/* ─────────────────────────────────────────────────────────
 * 제품 종류
 * ───────────────────────────────────────────────────────── */
const PRODUCTS = [
  { id: 'curtain', icon: '🪟', label: '커튼',       sub: '주름·천',       cls: 'prodCurtain' },
  { id: 'blind',   icon: '🎚️', label: '블라인드',  sub: '슬랫',          cls: 'prodBlind' },
  { id: 'roll',    icon: '📜', label: '롤스크린',  sub: '단순',          cls: 'prodRoll' },
  { id: 'roman',   icon: '🧵', label: '로만쉐이드', sub: '가로 주름',    cls: 'prodRoman' },
  { id: 'vert',    icon: '|',  label: '버티칼',    sub: '세로형',        cls: 'prodVert' },
] as const
type ProductId = typeof PRODUCTS[number]['id']

/* 창문 위치 프리셋 */
const LOCATIONS = [
  { id: 'normal',  label: '일반 방 창',     hint: '120~180 × 120~150', w: 150, h: 130 },
  { id: 'living',  label: '거실 창 (중)',   hint: '200~250 × 150',      w: 220, h: 150 },
  { id: 'big',     label: '전면 거실 창',   hint: '300~400 × 200',      w: 350, h: 200 },
  { id: 'veranda', label: '베란다 창',      hint: '150 × 200~230',      w: 150, h: 220 },
  { id: 'small',   label: '욕실·작은 창',  hint: '60~90 × 60~90',      w: 80,  h: 80  },
  { id: 'custom',  label: '직접 입력',      hint: '',                   w: 0,   h: 0   },
]

const INSTALL_TYPES = [
  { id: 'ceiling-recessed', icon: '🟪', label: '천장 매립',    sub: '커튼박스',     cls: 'installCeilingRecessed', noteCls: 'noteCeilingRecessed', forCurtain: true,  forBlind: false },
  { id: 'ceiling-mount',    icon: '🟨', label: '천장 부착',    sub: '천장 직접',    cls: 'installCeilingMount',    noteCls: 'noteCeilingMount',    forCurtain: true,  forBlind: false },
  { id: 'wall-mount',       icon: '⬜', label: '벽면 부착',    sub: '가장 일반적',  cls: 'installWallMount',       noteCls: 'noteWallMount',       forCurtain: true,  forBlind: false },
  { id: 'inside-mount',     icon: '🔷', label: '창문틀 안',    sub: '인사이드',     cls: 'installInside',          noteCls: 'noteInside',          forCurtain: false, forBlind: true  },
  { id: 'outside-mount',    icon: '🔶', label: '창문틀 밖',    sub: '아웃사이드',   cls: 'installOutside',         noteCls: 'noteOutside',         forCurtain: false, forBlind: true  },
] as const
type InstallId = typeof INSTALL_TYPES[number]['id']

const LENGTH_OPTIONS = [
  { id: 'window',  label: '창문형',     desc: '창문 + 10cm' },
  { id: 'knee',    label: '무릎형',     desc: '창문 ~ 무릎' },
  { id: 'floor',   label: '바닥형',     desc: '바닥 5cm 위 (인기)' },
  { id: 'pooling', label: '바닥 닿기',  desc: '풀링 +15cm (고급)' },
] as const
type LengthId = typeof LENGTH_OPTIONS[number]['id']

const PANEL_STYLES = [
  { id: 'single', label: '단일',     count: 1 },
  { id: 'pair',   label: '양쪽 한 쌍', count: 2 },
  { id: 'triple', label: '3분할',    count: 3 },
] as const
type PanelId = typeof PANEL_STYLES[number]['id']

/* 유틸 */
function n(v: string | number, min = 0): number {
  const x = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(x) || x < min) return min
  return x
}
function fmt(v: number, dec = 0): string {
  return (Math.round(v * Math.pow(10, dec)) / Math.pow(10, dec)).toLocaleString('ko-KR')
}

/* ─────────────────────────────────────────────────────────
 * 메인
 * ───────────────────────────────────────────────────────── */
type TabId = 'size' | 'guide'

export default function CurtainBlindClient() {
  const [tab, setTab] = useState<TabId>('size')
  const [productId, setProductId] = useState<ProductId>('curtain')

  /* 창문 입력 */
  const [locationId, setLocationId] = useState('living')
  const [winW, setWinW] = useState(220)
  const [winH, setWinH] = useState(150)
  const [winFromFloor, setWinFromFloor] = useState(85)   // 창문 하단~바닥 (cm)
  const [ceilingH, setCeilingH] = useState(240)            // cm

  /* 설치 방식 — 커튼류는 wall-mount 기본, 블라인드류는 inside-mount 기본 */
  const isCurtainFamily = productId === 'curtain' || productId === 'roman'
  const [installId, setInstallId] = useState<InstallId>('wall-mount')

  /* 길이 옵션 (커튼만) */
  const [lengthOpt, setLengthOpt] = useState<LengthId>('floor')

  /* 주름 배수 (커튼만) */
  const [pleatRatio, setPleatRatio] = useState(2.0)

  /* 패널 스타일 (커튼만) */
  const [panelStyle, setPanelStyle] = useState<PanelId>('pair')

  /* 이중 커튼 (커튼만) */
  const [doubleLayer, setDoubleLayer] = useState(false)

  /* 복사 피드백 */
  const [copied, setCopied] = useState(false)

  /* 위치 변경 시 사이즈 자동 */
  function selectLocation(id: string) {
    setLocationId(id)
    const loc = LOCATIONS.find(l => l.id === id)
    if (loc && loc.id !== 'custom') {
      setWinW(loc.w)
      setWinH(loc.h)
    }
  }

  /* 제품 변경 시 설치 방식 기본값 보정 */
  function selectProduct(id: ProductId) {
    setProductId(id)
    const isBlindNow = id === 'blind' || id === 'roll' || id === 'vert'
    if (isBlindNow && (installId === 'ceiling-recessed' || installId === 'ceiling-mount' || installId === 'wall-mount')) {
      setInstallId('inside-mount')
    } else if (!isBlindNow && (installId === 'inside-mount' || installId === 'outside-mount')) {
      setInstallId('wall-mount')
    }
  }

  /* ─── 핵심 계산 ─── */
  const result = useMemo(() => {
    if (productId === 'curtain') {
      const rodLength = winW + 30  // 좌우 15cm씩
      const totalCurtainWidth = rodLength * pleatRatio
      const panelCount = PANEL_STYLES.find(p => p.id === panelStyle)?.count ?? 2
      const widthPerPanel = totalCurtainWidth / panelCount

      // 길이 계산
      let curtainLength = 0
      if (installId === 'ceiling-recessed' || installId === 'ceiling-mount') {
        // 천장 기준
        if (lengthOpt === 'floor') curtainLength = ceilingH - 5
        else if (lengthOpt === 'pooling') curtainLength = ceilingH + 15
        else if (lengthOpt === 'window') curtainLength = winH + 10
        else curtainLength = winFromFloor + winH - 50  // knee — 정확하진 않지만 천장 매립이면 의미 작음
      } else {
        // 벽 부착 기준 (창문 위 약 10cm 위에 봉)
        const rodAboveWindow = 10
        if (lengthOpt === 'window') curtainLength = winH + 10
        else if (lengthOpt === 'knee') curtainLength = winH + rodAboveWindow + winFromFloor - 50  // 무릎 50cm
        else if (lengthOpt === 'floor') curtainLength = winH + rodAboveWindow + winFromFloor - 5
        else curtainLength = winH + rodAboveWindow + winFromFloor + 15  // pooling
      }
      const finalLength = Math.max(0, curtainLength) + 10  // 헴 10cm

      return {
        type: 'curtain' as const,
        rodLength,
        totalCurtainWidth,
        widthPerPanel,
        panelCount,
        curtainLength: finalLength,
      }
    }

    if (productId === 'roman') {
      let width = 0, height = 0
      if (installId === 'inside-mount') {
        width = winW - 1
        height = winH
      } else {
        width = winW + 10
        height = winH + 5
      }
      return { type: 'roman' as const, width, height }
    }

    // 블라인드 / 롤스크린 / 버티칼
    let width = 0, height = 0
    if (installId === 'inside-mount') {
      width = winW - 1
      height = winH - 0.5
    } else if (installId === 'outside-mount') {
      width = winW + 10
      height = winH + 10
    } else {
      // 벽 부착 등 기본 (블라인드의 경우 outside와 동일하게)
      width = winW + 10
      height = winH + 10
    }
    return { type: 'blind' as const, width, height }
  }, [productId, winW, winH, winFromFloor, ceilingH, installId, lengthOpt, pleatRatio, panelStyle])

  /* 결과 복사 */
  function handleCopy() {
    const lines: string[] = []
    const productName = PRODUCTS.find(p => p.id === productId)?.label ?? ''
    lines.push(`🪟 ${productName} 추천 사이즈`)
    lines.push(`창문: ${winW} × ${winH}cm`)
    if (result.type === 'curtain') {
      lines.push(`커튼봉 길이: ${fmt(result.rodLength)}cm`)
      lines.push(`커튼 전체 폭: ${fmt(result.totalCurtainWidth)}cm (주름 ${pleatRatio}배)`)
      lines.push(`1패널당 폭: ${fmt(result.widthPerPanel)}cm × ${result.panelCount}장`)
      lines.push(`커튼 길이: ${fmt(result.curtainLength)}cm`)
    } else if (result.type === 'roman') {
      lines.push(`로만쉐이드 폭: ${fmt(result.width)}cm × 길이 ${fmt(result.height)}cm`)
    } else {
      lines.push(`${productName} 폭: ${fmt(result.width)}cm × 길이 ${fmt(result.height)}cm`)
    }
    if (doubleLayer) lines.push('이중 커튼 (시어 + 암막)')
    lines.push('youtil.kr/tools/interior/curtain-blind')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); window.setTimeout(() => setCopied(false), 1200)
    })
  }

  /* 패널 권장 안내 */
  const panelTip = useMemo(() => {
    if (winW <= 100) return { kind: 'small',  text: '작은 창 (≤100cm) — 단일 패널 또는 블라인드·롤스크린 추천' }
    if (winW <= 200) return { kind: 'medium', text: '일반 방 창 (100~200cm) — 양쪽 한 쌍 권장' }
    if (winW <= 350) return { kind: 'large',  text: '큰 거실 창 (200~350cm) — 양쪽 한 쌍 (각 패널 폭 200~350cm)' }
    return                  { kind: 'huge',   text: '전면 거실 창 (≥350cm) — 3분할 (양쪽 + 중앙) 또는 4분할 권장 — 1패널당 폭 200cm 이하 권장' }
  }, [winW])

  /* 현재 설치 방식 정보 */
  const currentInstall = INSTALL_TYPES.find(i => i.id === installId)!
  const installNote = useMemo(() => {
    if (installId === 'ceiling-recessed') return { title: '천장 매립 (커튼박스)', body: '커튼박스가 있는 경우 사용. 길이는 천장에서 바닥까지로 계산. 천장 높이를 정확히 측정하세요.' }
    if (installId === 'ceiling-mount')    return { title: '천장 부착',            body: '천장에 직접 봉 또는 레일 설치. 무게 분산 고려. 콘크리트 천장은 앵커 필요, 석고보드는 보강 필요.' }
    if (installId === 'wall-mount')       return { title: '벽면 부착 (가장 일반적)', body: '창문 위쪽 벽에 봉 또는 레일 설치. 창문 상단에서 약 10~15cm 위에 부착하면 시각적으로 천장이 높아 보입니다.' }
    if (installId === 'inside-mount')     return { title: '창문틀 안 (인사이드 마운트)', body: '창문틀 안쪽에 정확히 맞춰 설치. 좌우 0.5cm씩 여유를 두어 작동에 방해되지 않게 함. 창문틀 깊이 6cm 이상 권장.' }
    return                                       { title: '창문틀 밖 (아웃사이드 마운트)', body: '창문틀 밖에 설치. 창문보다 좌우 5cm씩 더 크게. 빛 차단 효과 우수, 작은 창을 크게 보이게 함.' }
  }, [installId])

  return (
    <div className={styles.wrap}>

      <div className={styles.disclaimer}>
        <strong>⚠️ 본 계산기는 일반적인 한국 표준 측정법 기준 참고용</strong>입니다.
        주문 제작 시 실제 사이즈는 0.5~1cm 차이가 날 수 있으므로 구매 전 매장 확인 또는 전문 시공자 상담을 권장합니다.
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" className={`${styles.tabBtn} ${tab === 'size' ? styles.tabActive : ''}`}  onClick={() => setTab('size')}>사이즈 계산</button>
        <button type="button" className={`${styles.tabBtn} ${tab === 'guide' ? styles.tabActive : ''}`} onClick={() => setTab('guide')}>종류별 가이드</button>
      </div>

      {/* ────────────── 탭 1: 사이즈 ────────────── */}
      {tab === 'size' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>제품 종류</span>
              <span className={styles.cardLabelHint}>5가지 중 선택</span>
            </div>
            <div className={styles.productGrid}>
              {PRODUCTS.map(p => (
                <button key={p.id} type="button" className={`${styles.productBtn} ${styles[p.cls]} ${productId === p.id ? styles.prodActive : ''}`} onClick={() => selectProduct(p.id)}>
                  <span className={styles.icon}>{p.icon}</span>
                  {p.label}
                  <small>{p.sub}</small>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>창문 정보</span>
              <span className={styles.cardLabelHint}>cm 단위</span>
            </div>

            <span className={styles.subLabel}>창문 위치 — 빠른 선택</span>
            <div className={styles.locationGrid}>
              {LOCATIONS.map(l => (
                <button key={l.id} type="button" className={`${styles.locationBtn} ${locationId === l.id ? styles.locationActive : ''}`} onClick={() => selectLocation(l.id)}>
                  {l.label}
                  {l.hint && <small>{l.hint}</small>}
                </button>
              ))}
            </div>

            <div style={{ height: 14 }} />
            <span className={styles.subLabel}>창문 가로 × 세로 (cm)</span>
            <div className={styles.dimRow}>
              <input className={styles.bigInput} type="number" min={1} step={1} value={winW} onChange={e => { setWinW(n(e.target.value, 1)); setLocationId('custom') }} />
              <span className={styles.dimSep}>×</span>
              <input className={styles.bigInput} type="number" min={1} step={1} value={winH} onChange={e => { setWinH(n(e.target.value, 1)); setLocationId('custom') }} />
            </div>

            {(productId === 'curtain') && (
              <>
                <div style={{ height: 12 }} />
                <span className={styles.subLabel}>창문 하단 ~ 바닥 (cm)</span>
                <div className={styles.inputRow}>
                  <input className={styles.smallInput} type="number" min={0} max={300} value={winFromFloor} onChange={e => setWinFromFloor(n(e.target.value))} />
                  <span className={styles.unit}>cm</span>
                </div>
                {(installId === 'ceiling-recessed' || installId === 'ceiling-mount') && (
                  <>
                    <div style={{ height: 8 }} />
                    <span className={styles.subLabel}>천장 높이 (cm)</span>
                    <div className={styles.inputRow}>
                      <input className={styles.smallInput} type="number" min={150} max={500} value={ceilingH} onChange={e => setCeilingH(n(e.target.value, 150))} />
                      <span className={styles.unit}>cm</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* 설치 방식 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>설치 방식</span>
              <span className={styles.cardLabelHint}>{isCurtainFamily ? '벽면 부착이 가장 일반적' : '인사이드/아웃사이드'}</span>
            </div>
            <div className={styles.installGrid}>
              {INSTALL_TYPES
                .filter(i => isCurtainFamily ? i.forCurtain : i.forBlind)
                .map(i => (
                  <button key={i.id} type="button" className={`${styles.installBtn} ${styles[i.cls]} ${installId === i.id ? styles.installActive : ''}`} onClick={() => setInstallId(i.id)}>
                    <span style={{ fontSize: 16 }}>{i.icon}</span>
                    <span>{i.label}</span>
                    <small style={{ fontSize: 10, color: 'var(--muted)' }}>{i.sub}</small>
                  </button>
                ))}
            </div>
            <div className={`${styles.installNoteCard} ${styles[currentInstall.noteCls]}`} style={{ marginTop: 14 }}>
              <strong>{installNote.title}</strong> — {installNote.body}
            </div>
          </div>

          {/* 길이 옵션 (커튼만) */}
          {productId === 'curtain' && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>커튼 길이 옵션</span>
                <span className={styles.cardLabelHint}>한국 표준은 바닥형</span>
              </div>
              <div className={styles.lengthGrid}>
                {LENGTH_OPTIONS.map(opt => {
                  // 각 옵션별 미니 SVG (창문 + 커튼 길이 비교)
                  const heights = { window: 35, knee: 50, floor: 70, pooling: 78 }
                  return (
                    <button key={opt.id} type="button" className={`${styles.lengthBtn} ${lengthOpt === opt.id ? styles.lengthActive : ''}`} onClick={() => setLengthOpt(opt.id)}>
                      <svg className={styles.lengthSvg} width="40" height="80" viewBox="0 0 40 80" aria-hidden="true">
                        {/* 창문 */}
                        <rect x="8" y="14" width="24" height="22" fill="rgba(62,200,255,0.15)" stroke="#3EC8FF" strokeWidth="1" />
                        {/* 커튼 */}
                        <line x1="6" y1="12" x2="6" y2={heights[opt.id]} stroke={lengthOpt === opt.id ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2" />
                        <line x1="34" y1="12" x2="34" y2={heights[opt.id]} stroke={lengthOpt === opt.id ? 'var(--accent)' : 'var(--muted)'} strokeWidth="2" />
                        {/* 바닥 */}
                        <line x1="2" y1="74" x2="38" y2="74" stroke="var(--muted)" strokeWidth="0.8" strokeDasharray="2 2" opacity="0.5" />
                      </svg>
                      <span>{opt.label}</span>
                      <small style={{ fontSize: 10, color: 'var(--muted)' }}>{opt.desc}</small>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 주름 배수 (커튼만) */}
          {productId === 'curtain' && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>주름 배수</span>
                <span className={styles.cardLabelHint}>한국 표준 2배</span>
              </div>
              <div className={styles.pleatRow}>
                <input className={styles.slider} type="range" min={1.5} max={3.0} step={0.5} value={pleatRatio} onChange={e => setPleatRatio(Number(e.target.value))} />
                <span className={styles.sliderValue}>×{pleatRatio.toFixed(1)}</span>
              </div>
              <div className={styles.pleatPills}>
                {[1.5, 2.0, 2.5, 3.0].map(r => (
                  <button key={r} type="button"
                    className={`${styles.pleatPill} ${r === 2.0 ? styles.pleatPillStd : ''} ${pleatRatio === r ? styles.pleatPillActive : ''}`}
                    onClick={() => setPleatRatio(r)}
                  >
                    ×{r.toFixed(1)}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text)' }}>1.5배</strong> 가벼운 주름 · <strong style={{ color: 'var(--text)' }}>2배</strong> 한국 표준 · <strong style={{ color: 'var(--text)' }}>2.5~3배</strong> 호텔·고급
              </p>
            </div>
          )}

          {/* 패널 스타일 (커튼만) */}
          {productId === 'curtain' && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <span>패널 구성</span>
              </div>
              <div className={styles.panelGrid}>
                {PANEL_STYLES.map(p => (
                  <button key={p.id} type="button" className={`${styles.panelBtn} ${panelStyle === p.id ? styles.panelActive : ''}`} onClick={() => setPanelStyle(p.id)}>
                    {p.label}
                    <small>{p.count}장</small>
                  </button>
                ))}
              </div>
              <label className={styles.toggleRow}>
                <input type="checkbox" checked={doubleLayer} onChange={e => setDoubleLayer(e.target.checked)} />
                <span>이중 커튼 (시어 + 암막)</span>
              </label>
              <div className={styles.panelTipCard} style={{ marginTop: 12 }}>
                <strong>💡 패널 권장</strong> — {panelTip.text}
              </div>
            </div>
          )}

          {/* 결과 — HERO */}
          <div className={styles.hero}>
            <p className={styles.heroLead}>{PRODUCTS.find(p => p.id === productId)?.label} 추천 사이즈</p>
            {result.type === 'curtain' ? (
              <div className={styles.heroDual}>
                <div>
                  <p className={styles.heroDualLabel}>전체 폭</p>
                  <p className={styles.heroDualNum}>{fmt(result.totalCurtainWidth)}<span className={styles.heroDualUnit}>cm</span></p>
                </div>
                <span className={styles.heroDualSep}>×</span>
                <div>
                  <p className={styles.heroDualLabel}>길이</p>
                  <p className={styles.heroDualNum}>{fmt(result.curtainLength)}<span className={styles.heroDualUnit}>cm</span></p>
                </div>
              </div>
            ) : result.type === 'roman' ? (
              <div className={styles.heroDual}>
                <div>
                  <p className={styles.heroDualLabel}>폭</p>
                  <p className={styles.heroDualNum}>{fmt(result.width)}<span className={styles.heroDualUnit}>cm</span></p>
                </div>
                <span className={styles.heroDualSep}>×</span>
                <div>
                  <p className={styles.heroDualLabel}>길이</p>
                  <p className={styles.heroDualNum}>{fmt(result.height)}<span className={styles.heroDualUnit}>cm</span></p>
                </div>
              </div>
            ) : (
              <div className={styles.heroDual}>
                <div>
                  <p className={styles.heroDualLabel}>폭</p>
                  <p className={styles.heroDualNum}>{fmt(result.width)}<span className={styles.heroDualUnit}>cm</span></p>
                </div>
                <span className={styles.heroDualSep}>×</span>
                <div>
                  <p className={styles.heroDualLabel}>길이</p>
                  <p className={styles.heroDualNum}>{fmt(result.height)}<span className={styles.heroDualUnit}>cm</span></p>
                </div>
              </div>
            )}
            {result.type === 'curtain' && (
              <p className={styles.heroSub}>
                1패널당 <strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{fmt(result.widthPerPanel)}cm × {fmt(result.curtainLength)}cm × {result.panelCount}장</strong>
                {doubleLayer && ' · 이중 (시어 + 암막)'}
              </p>
            )}
            {result.type !== 'curtain' && (
              <p className={styles.heroSub}>
                {installId === 'inside-mount' ? '인사이드 마운트 (창문틀 안)' : installId === 'outside-mount' ? '아웃사이드 마운트 (창문틀 밖)' : '벽 부착'}
              </p>
            )}
          </div>

          {/* 상세 사이즈 표 */}
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>상세 사이즈</span></div>
            <table className={styles.sizeTable}>
              <tbody>
                {result.type === 'curtain' ? (
                  <>
                    <tr><td>커튼봉 길이</td><td>{fmt(result.rodLength)}cm</td><td>창문 폭 + 좌우 15cm씩</td></tr>
                    <tr><td>커튼 전체 폭</td><td>{fmt(result.totalCurtainWidth)}cm</td><td>봉 길이 × 주름 {pleatRatio}배</td></tr>
                    <tr><td>패널 1장 폭</td><td>{fmt(result.widthPerPanel)}cm</td><td>{result.panelCount}장 분할</td></tr>
                    <tr className={styles.highlightRow}><td>커튼 길이</td><td>{fmt(result.curtainLength)}cm</td><td>{LENGTH_OPTIONS.find(o => o.id === lengthOpt)?.desc} + 헴 10cm</td></tr>
                    <tr><td>패널 수</td><td>{result.panelCount}장</td><td>{PANEL_STYLES.find(p => p.id === panelStyle)?.label}</td></tr>
                    {doubleLayer && <tr><td>이중 커튼</td><td>×2</td><td>시어 + 암막 각각 동일 사이즈</td></tr>}
                  </>
                ) : (
                  <>
                    <tr><td>{PRODUCTS.find(p => p.id === productId)?.label} 폭</td><td>{fmt(result.width)}cm</td><td>{installId === 'inside-mount' ? '창문 안쪽 -1cm (좌우 0.5씩)' : '창문 +10cm'}</td></tr>
                    <tr className={styles.highlightRow}><td>{PRODUCTS.find(p => p.id === productId)?.label} 길이</td><td>{fmt(result.height)}cm</td><td>{installId === 'inside-mount' ? '창문 안쪽 -0.5cm' : '창문 +10cm'}</td></tr>
                    <tr><td>설치 방식</td><td>{installId === 'inside-mount' ? '인사이드' : installId === 'outside-mount' ? '아웃사이드' : '벽 부착'}</td><td>{currentInstall.label}</td></tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* 시각화 SVG */}
          <div className={styles.card}>
            <div className={styles.cardLabel}>
              <span>시각화</span>
              <span className={styles.cardLabelHint}>창문 + {PRODUCTS.find(p => p.id === productId)?.label}</span>
            </div>
            <div className={styles.vizWrap}>
              {(() => {
                const VBW = 360, VBH = 220
                // 창문 비율
                const winRatio = winW / winH
                const maxWinW = 180
                const maxWinH = 110
                let drawWinW = maxWinW
                let drawWinH = maxWinW / winRatio
                if (drawWinH > maxWinH) {
                  drawWinH = maxWinH
                  drawWinW = maxWinH * winRatio
                }
                const winX = (VBW - drawWinW) / 2
                const winY = 50
                return (
                  <svg className={styles.vizSvg} viewBox={`0 0 ${VBW} ${VBH}`} aria-hidden="true">
                    {/* 바닥 */}
                    <line x1="20" y1={VBH - 10} x2={VBW - 20} y2={VBH - 10} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                    <text x={VBW - 25} y={VBH - 14} textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="monospace">바닥</text>

                    {/* 창문 */}
                    <rect x={winX} y={winY} width={drawWinW} height={drawWinH} fill="rgba(62,200,255,0.10)" stroke="#3EC8FF" strokeWidth="2" />
                    {/* 창문 격자 (4분할) */}
                    <line x1={winX + drawWinW / 2} y1={winY} x2={winX + drawWinW / 2} y2={winY + drawWinH} stroke="#3EC8FF" strokeWidth="0.8" opacity="0.5" />
                    <line x1={winX} y1={winY + drawWinH / 2} x2={winX + drawWinW} y2={winY + drawWinH / 2} stroke="#3EC8FF" strokeWidth="0.8" opacity="0.5" />
                    <text x={winX + drawWinW / 2} y={winY - 8} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="monospace">창문 {winW}cm</text>
                    <text x={winX + drawWinW + 8} y={winY + drawWinH / 2 + 3} textAnchor="start" fill="var(--muted)" fontSize="10" fontFamily="monospace">{winH}cm</text>

                    {/* 제품별 시각화 */}
                    {productId === 'curtain' && result.type === 'curtain' && (() => {
                      const rodExt = (drawWinW * (result.rodLength / winW) - drawWinW) / 2
                      const rodX1 = winX - rodExt
                      const rodX2 = winX + drawWinW + rodExt
                      const rodY = winY - 12
                      // 커튼 길이 비율
                      const heightTotal = winFromFloor + winH
                      const drawCurtainBottom = lengthOpt === 'window' ? winY + drawWinH + 5
                        : lengthOpt === 'knee' ? winY + drawWinH + (drawWinH * 0.4)
                        : lengthOpt === 'floor' ? VBH - 10
                        : VBH - 4 // pooling
                      const panelCount = result.panelCount
                      const totalCurtainW = rodX2 - rodX1
                      const panels = []
                      for (let i = 0; i < panelCount; i++) {
                        const px = rodX1 + (totalCurtainW / panelCount) * i
                        const pw = totalCurtainW / panelCount
                        // 주름 표현 — 작은 세로선 여러 개
                        const lines = []
                        for (let j = 1; j < 5; j++) {
                          lines.push(<line key={j} x1={px + (pw / 5) * j} y1={rodY + 2} x2={px + (pw / 5) * j} y2={drawCurtainBottom} stroke="var(--accent)" strokeWidth="0.6" opacity="0.4" />)
                        }
                        panels.push(
                          <g key={i}>
                            <rect x={px + 2} y={rodY + 2} width={pw - 4} height={drawCurtainBottom - rodY - 2} fill="rgba(200,255,62,0.12)" stroke="var(--accent)" strokeWidth="1" rx="1" />
                            {lines}
                          </g>
                        )
                      }
                      return (
                        <>
                          {/* 봉 */}
                          <line x1={rodX1} y1={rodY} x2={rodX2} y2={rodY} stroke="#FFD700" strokeWidth="2.5" />
                          <circle cx={rodX1} cy={rodY} r="3" fill="#FFD700" />
                          <circle cx={rodX2} cy={rodY} r="3" fill="#FFD700" />
                          <text x={(rodX1 + rodX2) / 2} y={rodY - 5} textAnchor="middle" fill="#FFD700" fontSize="9" fontFamily="monospace">봉 {fmt(result.rodLength)}cm</text>
                          {/* 커튼 패널 */}
                          {panels}
                        </>
                      )
                    })()}

                    {(productId === 'blind' || productId === 'roll' || productId === 'roman') && (() => {
                      const isInside = installId === 'inside-mount'
                      const offsetX = isInside ? 2 : -8
                      const offsetY = isInside ? 1 : -8
                      const w = drawWinW - 2 * offsetX
                      const h = drawWinH - (isInside ? 2 : 0) - (isInside ? 0 : -16)
                      const slats = []
                      const slatCount = productId === 'blind' ? 8 : productId === 'roman' ? 4 : 0
                      for (let i = 1; i < slatCount; i++) {
                        slats.push(<line key={i} x1={winX + offsetX} y1={winY + offsetY + (h / slatCount) * i} x2={winX + offsetX + w} y2={winY + offsetY + (h / slatCount) * i} stroke={productId === 'roman' ? '#9B59B6' : '#3EC8FF'} strokeWidth={productId === 'roman' ? 1 : 0.6} opacity="0.5" />)
                      }
                      const fillColor = productId === 'blind' ? 'rgba(62,200,255,0.18)' : productId === 'roll' ? 'rgba(255,215,0,0.18)' : 'rgba(155,89,182,0.18)'
                      const strokeColor = productId === 'blind' ? '#3EC8FF' : productId === 'roll' ? '#FFD700' : '#9B59B6'
                      return (
                        <>
                          <rect x={winX + offsetX} y={winY + offsetY} width={w} height={h} fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
                          {slats}
                        </>
                      )
                    })()}

                    {productId === 'vert' && (() => {
                      const offsetX = -8
                      const offsetY = -8
                      const w = drawWinW - 2 * offsetX
                      const h = drawWinH + 16
                      const verts = []
                      for (let i = 0; i <= 8; i++) {
                        const x = winX + offsetX + (w / 8) * i
                        verts.push(<line key={i} x1={x} y1={winY + offsetY} x2={x} y2={winY + offsetY + h} stroke="#FF6B6B" strokeWidth="1.5" opacity="0.6" />)
                      }
                      return (
                        <>
                          <rect x={winX + offsetX} y={winY + offsetY} width={w} height={h} fill="rgba(255,107,107,0.10)" stroke="#FF6B6B" strokeWidth="1" />
                          {verts}
                        </>
                      )
                    })()}
                  </svg>
                )
              })()}
            </div>
          </div>

          <button type="button" className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
            {copied ? '✓ 복사 완료' : '📋 결과 텍스트 복사'}
          </button>
        </>
      )}

      {/* ────────────── 탭 2: 종류별 가이드 ────────────── */}
      {tab === 'guide' && (
        <>
          <div className={styles.card}>
            <div className={styles.cardLabel}><span>커튼 종류 비교</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.compareTable}>
                <thead>
                  <tr><th>종류</th><th>특징</th><th>추천 공간</th><th>주름 배수</th></tr>
                </thead>
                <tbody>
                  <tr><td>일반 커튼</td><td>천 + 주름, 풍성함</td><td>거실·침실</td><td>×2</td></tr>
                  <tr><td>암막 커튼</td><td>두꺼운 원단, 빛 차단</td><td>침실·홈시어터</td><td>×2</td></tr>
                  <tr><td>시어 커튼</td><td>얇은 천, 빛 투과</td><td>거실·창가</td><td>×2</td></tr>
                  <tr><td>이중 커튼</td><td>시어 + 암막</td><td>거실·침실</td><td>각 ×2</td></tr>
                  <tr><td>발란스</td><td>위쪽 장식</td><td>고급 인테리어</td><td>—</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>블라인드 종류 비교</span></div>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.compareTable}>
                <thead>
                  <tr><th>종류</th><th>특징</th><th>추천 공간</th><th></th></tr>
                </thead>
                <tbody>
                  <tr><td>가로형 (베네치안)</td><td>슬랫 각도 조절</td><td>거실·사무실</td><td>—</td></tr>
                  <tr><td>세로형 (버티칼)</td><td>큰 창문·발코니</td><td>거실·사무실</td><td>—</td></tr>
                  <tr><td>우드 블라인드</td><td>우드 슬랫</td><td>거실·서재</td><td>—</td></tr>
                  <tr><td>알루미늄</td><td>가벼움·저렴</td><td>욕실·주방</td><td>—</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>롤스크린 vs 로만쉐이드</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
              <div style={{ background: 'var(--bg3)', borderLeft: '3px solid #FFD700', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#FFD700', fontWeight: 700, marginBottom: 6 }}>📜 롤스크린</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.8 }}>
                  <li>단순한 천 형태, 위로 말려 올라감</li>
                  <li>작은 창·욕실·주방에 인기</li>
                  <li>가격 저렴</li>
                </ul>
              </div>
              <div style={{ background: 'var(--bg3)', borderLeft: '3px solid #9B59B6', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: '#C485E0', fontWeight: 700, marginBottom: 6 }}>🧵 로만쉐이드</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.8 }}>
                  <li>가로 주름이 잡히며 올라감</li>
                  <li>커튼처럼 부드러운 느낌</li>
                  <li>가격 중상</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>📏 커튼 측정법</span></div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>1</span>
              <span className={styles.guideStepBody}>창문 폭 측정 — <strong>창문 안쪽 끝 ~ 끝</strong></span>
            </div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>2</span>
              <span className={styles.guideStepBody}>봉 길이 결정 — 창문 폭 + <strong>좌우 15cm씩</strong> (총 30cm 추가)</span>
            </div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>3</span>
              <span className={styles.guideStepBody}>길이 측정 — 봉 위치 ~ 원하는 종료점 + 헴 10cm</span>
            </div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>4</span>
              <span className={styles.guideStepBody}>주름 배수 — 일반적으로 <strong>2배</strong> (한국 표준)</span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>📏 블라인드 측정법 — 인사이드 마운트</span></div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>1</span>
              <span className={styles.guideStepBody}>창문 안쪽 폭 — <strong>3개 지점 측정 후 가장 작은 값</strong> -0.5cm</span>
            </div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>2</span>
              <span className={styles.guideStepBody}>창문 안쪽 높이 — 좌·중·우 측정 후 가장 작은 값</span>
            </div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>3</span>
              <span className={styles.guideStepBody}>창문틀 깊이 — 블라인드 본체가 들어갈 공간 <strong>≥ 6cm 권장</strong></span>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}><span>📏 블라인드 측정법 — 아웃사이드 마운트</span></div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>1</span>
              <span className={styles.guideStepBody}>가리고 싶은 영역 폭 — 창문 폭 + <strong>좌우 5cm씩</strong></span>
            </div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>2</span>
              <span className={styles.guideStepBody}>가리고 싶은 영역 높이 — 창문 위 +5cm, 아래 +5cm</span>
            </div>
            <div className={styles.guideStep}>
              <span className={styles.guideStepNum}>3</span>
              <span className={styles.guideStepBody}>시각적으로 <strong>창문이 더 커 보이게</strong> 함</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
