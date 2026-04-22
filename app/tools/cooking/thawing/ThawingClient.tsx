'use client'

import { useState, useMemo } from 'react'
import s from './thawing.module.css'

type FoodKey = 'beef_pork' | 'chicken' | 'fish' | 'vegetable' | 'bread' | 'cooked'
type Method = 'fridge' | 'water' | 'room' | 'micro'
type FrozenState = 'full' | 'partial'
type InitialTemp = 'fridge' | 'room' | 'hot'
type FreezerTemp = 'normal' | 'fast'

const FOODS: { key: FoodKey; icon: string; label: string; thawFactor: number; microFactor: number; storageMin: number; storageMax: number; tip: string }[] = [
  { key: 'beef_pork', icon: '🥩', label: '소·돼지고기',   thawFactor: 2.5, microFactor: 3.5, storageMin: 3, storageMax: 6,  tip: '공기 최대한 제거·소분 냉동. 해동 후 24시간 내 조리 권장.' },
  { key: 'chicken',   icon: '🍗', label: '닭·가금류',     thawFactor: 2.0, microFactor: 3.0, storageMin: 2, storageMax: 3,  tip: '살모넬라 주의. 해동수 접촉 도구·도마 즉시 세척.' },
  { key: 'fish',      icon: '🐟', label: '생선·해산물',   thawFactor: 1.5, microFactor: 2.5, storageMin: 2, storageMax: 3,  tip: '해동 후 물기 제거. 비브리오 주의로 당일 조리 권장.' },
  { key: 'vegetable', icon: '🥦', label: '채소·과일',     thawFactor: 1.0, microFactor: 2.0, storageMin: 8, storageMax: 12, tip: '블랜칭 후 냉동 시 영양소·색 유지. 해동 없이 바로 조리 가능.' },
  { key: 'bread',     icon: '🍞', label: '빵·반죽',       thawFactor: 1.8, microFactor: 2.5, storageMin: 2, storageMax: 3,  tip: '슬라이스 후 냉동하면 필요한 양만 해동 가능.' },
  { key: 'cooked',    icon: '🍱', label: '조리된 음식',   thawFactor: 1.2, microFactor: 2.2, storageMin: 1, storageMax: 3,  tip: '식힌 후 냉동. 해동 후 재가열 시 중심부 74°C 이상 확인.' },
]

const THICKNESS_GUIDES = [
  { value: 1,  label: '얇음 (1cm)',    desc: '생선 필레·삼겹살 1장' },
  { value: 3,  label: '보통 (3cm)',    desc: '스테이크·닭가슴살' },
  { value: 5,  label: '두꺼움 (5cm)',  desc: '통삼겹·닭다리' },
  { value: 10, label: '덩어리 (10cm)', desc: '통닭·로스용 덩어리고기' },
]

const WEIGHT_PRESETS = [200, 500, 1000, 2000]

function formatHours(h: number): { value: string; sub: string } {
  if (h < 1) {
    const min = Math.round(h * 60)
    return { value: `${min}`, sub: '분' }
  }
  if (h < 10) {
    const hi = Math.floor(h)
    const mm = Math.round((h - hi) * 60)
    return { value: mm === 0 ? `${hi}` : `${hi}시 ${mm}분`, sub: '' }
  }
  return { value: `${Math.round(h * 10) / 10}`, sub: '시간' }
}

function formatMinutes(m: number): { value: string; sub: string } {
  if (m < 60) return { value: `${Math.round(m)}`, sub: '분' }
  const h = Math.floor(m / 60)
  const rest = Math.round(m - h * 60)
  return { value: rest === 0 ? `${h}` : `${h}시 ${rest}분`, sub: rest === 0 ? '시간' : '' }
}

function addMinutesToNow(minutes: number): string {
  const now = new Date()
  const eta = new Date(now.getTime() + minutes * 60 * 1000)
  const sameDay = eta.getDate() === now.getDate()
  const mm = String(eta.getMinutes()).padStart(2, '0')
  const hh = String(eta.getHours()).padStart(2, '0')
  if (sameDay) return `오늘 ${hh}:${mm}`
  const diffDays = Math.floor((eta.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / (24 * 60 * 60 * 1000))
  if (diffDays === 1) return `내일 ${hh}:${mm}`
  return `${eta.getMonth() + 1}월 ${eta.getDate()}일 ${hh}:${mm}`
}

// ── 해동 시간 탭 ──
function ThawTab() {
  const [food, setFood] = useState<FoodKey>('beef_pork')
  const [thickness, setThickness] = useState('3')
  const [weight, setWeight] = useState('500')
  const [frozen, setFrozen] = useState<FrozenState>('full')
  const [method, setMethod] = useState<Method>('fridge')
  const [copied, setCopied] = useState(false)

  const f = FOODS.find(x => x.key === food)!
  const t = parseFloat(thickness) || 0
  const w = parseFloat(weight) || 0
  const frozenFactor = frozen === 'full' ? 1.0 : 0.6

  // 냉장 해동 기준 시간 (시간 단위)
  // 두께² × 식품계수 × 무게보정(무게^(1/3)/500^(1/3)) × 냉동상태보정
  const fridgeHours = useMemo(() => {
    if (!t || !w) return 0
    const base = t * t * f.thawFactor / 4
    const weightAdj = Math.pow(w / 500, 1 / 3)
    return base * weightAdj * frozenFactor
  }, [t, w, f.thawFactor, frozenFactor])

  const waterHours = fridgeHours / 5     // 흐르는 물 (약 5배 빠름)
  const roomHours  = fridgeHours / 3     // 실온 (약 3배 빠름)
  const microMinutes = useMemo(() => {
    if (!w) return 0
    return (w / 100) * f.microFactor * frozenFactor
  }, [w, f.microFactor, frozenFactor])

  const methods: { key: Method; icon: string; name: string; sub: string; time: { value: string; sub: string }; totalMin: number; safety: { label: string; cls: string }; warning: string; cardCls: string; heroCls: string }[] = [
    {
      key: 'fridge',
      icon: '🧊',
      name: '냉장 해동 (4°C)',
      sub: '가장 안전한 방법',
      time: formatHours(fridgeHours),
      totalMin: fridgeHours * 60,
      safety: { label: '★★★★★ 안전', cls: s.safeHigh },
      warning: '세균 증식 억제. 해동 후 1~2일 내 조리.',
      cardCls: s.methodFridge,
      heroCls: '',
    },
    {
      key: 'water',
      icon: '💧',
      name: '흐르는 물 해동',
      sub: '15~20°C 물 · 밀봉 필수',
      time: formatHours(waterHours),
      totalMin: waterHours * 60,
      safety: { label: '★★★★ 주의', cls: s.safeMid },
      warning: '반드시 밀봉·흐르는 찬물. 최대 2시간 권장.',
      cardCls: s.methodWater,
      heroCls: '',
    },
    {
      key: 'room',
      icon: '🌡️',
      name: '실온 해동',
      sub: '비권장 · 위험 온도대',
      time: formatHours(roomHours),
      totalMin: roomHours * 60,
      safety: { label: '★★ 비권장', cls: s.safeLow },
      warning: '위험 온도대(4~60°C) 노출. 2시간 이상 금지.',
      cardCls: s.methodRoom,
      heroCls: s.heroRoom,
    },
    {
      key: 'micro',
      icon: '⚡',
      name: '전자레인지 해동',
      sub: '가장 빠르지만 즉시 조리',
      time: formatMinutes(microMinutes),
      totalMin: microMinutes,
      safety: { label: '★★★ 보통', cls: s.safeCaution },
      warning: '부분 가열 가능성 → 해동 후 즉시 조리 필수.',
      cardCls: s.methodMicro,
      heroCls: s.heroMicro,
    },
  ]

  const selected = methods.find(m => m.key === method)!

  const copyResult = async () => {
    const text = [
      `냉동·해동 시간 계산 결과`,
      `식품: ${f.label} (${f.icon})`,
      `두께 ${t}cm · 무게 ${w}g · ${frozen === 'full' ? '완전냉동' : '부분냉동'}`,
      ``,
      `■ 해동 방법 비교`,
      `• 냉장 해동: ${formatHours(fridgeHours).value}${formatHours(fridgeHours).sub}`,
      `• 흐르는 물: ${formatHours(waterHours).value}${formatHours(waterHours).sub}`,
      `• 실온 해동: ${formatHours(roomHours).value}${formatHours(roomHours).sub} (비권장)`,
      `• 전자레인지: ${formatMinutes(microMinutes).value}${formatMinutes(microMinutes).sub}`,
      ``,
      `선택: ${selected.name} → 완료 ${addMinutesToNow(selected.totalMin)}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={s.wrap}>
      {/* 식품 선택 */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 식품 종류</span>
        <div className={s.foodGrid}>
          {FOODS.map(item => (
            <button
              key={item.key}
              className={`${s.foodBtn} ${food === item.key ? s.foodActive : ''}`}
              onClick={() => setFood(item.key)}
            >
              <span className={s.foodBtnIcon}>{item.icon}</span>
              <span className={s.foodBtnText}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 두께 */}
      <div className={s.card}>
        <span className={s.cardLabel}>2. 두께</span>
        <div className={s.guideRow}>
          {THICKNESS_GUIDES.map(g => (
            <button
              key={g.value}
              className={`${s.guideBtn} ${parseFloat(thickness) === g.value ? s.guideActive : ''}`}
              onClick={() => setThickness(String(g.value))}
              title={g.desc}
            >{g.label}</button>
          ))}
        </div>
        <div className={s.valueRow}>
          <input
            type="number" inputMode="decimal" step="0.5" min={0.5} max={20}
            className={s.valueInput}
            value={thickness} onChange={e => setThickness(e.target.value)}
          />
          <span className={s.valueUnit}>cm</span>
        </div>
        <input
          type="range" min={0.5} max={20} step={0.5}
          className={s.slider}
          value={thickness} onChange={e => setThickness(e.target.value)}
        />
        <div className={s.sliderLabels}><span>0.5</span><span>10</span><span>20</span></div>
      </div>

      {/* 무게 */}
      <div className={s.card}>
        <span className={s.cardLabel}>3. 무게</span>
        <div className={s.valueRow}>
          <input
            type="number" inputMode="decimal" step="50" min={50} max={5000}
            className={s.valueInput}
            value={weight} onChange={e => setWeight(e.target.value)}
          />
          <span className={s.valueUnit}>g</span>
        </div>
        <div className={s.presetRow}>
          {WEIGHT_PRESETS.map(p => (
            <button
              key={p}
              className={`${s.presetBtn} ${parseFloat(weight) === p ? s.presetActive : ''}`}
              onClick={() => setWeight(String(p))}
            >{p >= 1000 ? `${p / 1000}kg` : `${p}g`}</button>
          ))}
        </div>
      </div>

      {/* 냉동 상태 */}
      <div className={s.card}>
        <span className={s.cardLabel}>4. 냉동 상태</span>
        <div className={s.btnGroup}>
          <button
            className={`${s.toggleBtn} ${frozen === 'full' ? s.toggleActive : ''}`}
            onClick={() => setFrozen('full')}
          >완전냉동 (−18°C)</button>
          <button
            className={`${s.toggleBtn} ${frozen === 'partial' ? s.toggleActive : ''}`}
            onClick={() => setFrozen('partial')}
          >부분냉동 (−5°C)</button>
        </div>
      </div>

      {/* 해동 방법 4카드 */}
      <div>
        <div className={s.cardTitle} style={{ padding: '0 4px', marginBottom: '10px' }}>해동 방법별 예상 시간</div>
        <div className={s.methodGrid}>
          {methods.map(m => {
            const isSelected = method === m.key
            return (
              <div
                key={m.key}
                className={`${s.methodCard} ${m.cardCls} ${isSelected ? s.methodSelected : ''}`}
                onClick={() => setMethod(m.key)}
              >
                <div className={s.methodHead}>
                  <div>
                    <div className={s.methodName}><span style={{ marginRight: '6px' }}>{m.icon}</span>{m.name}</div>
                    <div className={s.methodSub}>{m.sub}</div>
                  </div>
                  <span className={`${s.safetyBadge} ${m.safety.cls}`}>{m.safety.label}</span>
                </div>
                <div>
                  <span className={s.methodTime}>{m.time.value}</span>
                  <span className={s.methodTimeSub}> {m.time.sub}</span>
                </div>
                <div className={s.methodTimeSub}>{m.warning}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 히어로 */}
      {fridgeHours > 0 && (
        <div className={`${s.hero} ${selected.heroCls}`}>
          <div className={s.heroTop}>
            <div>
              <div className={s.heroLabel}>선택한 방법</div>
              <div className={s.heroMethod}>{selected.icon} {selected.name}</div>
            </div>
            <span className={`${s.safetyBadge} ${selected.safety.cls}`}>{selected.safety.label}</span>
          </div>
          <div>
            <span className={s.heroNum}>{selected.time.value}</span>
            <span className={s.heroUnit}>{selected.time.sub}</span>
          </div>
          <div className={s.heroSub}>{selected.warning}</div>
          <div className={s.etaBox}>
            <span className={s.etaLabel}>지금 시작하면 완료</span>
            <span className={s.etaTime}>{addMinutesToNow(selected.totalMin)}</span>
          </div>
        </div>
      )}

      {/* 식품별 안전 ── */}
      <div className={s.infoBox}>
        <strong>{f.icon} {f.label} 맞춤 팁</strong><br/>
        {f.tip}
      </div>

      {/* 위험 온도대 경고 */}
      {method === 'room' && (
        <div className={s.warnBox}>
          <strong>⚠️ 실온 해동은 비권장</strong><br/>
          실온(20~25°C)은 세균이 가장 빠르게 증식하는 위험 온도대입니다.
          식약처는 실온 해동 시 <strong>2시간 이내</strong>를 권장하며, 초과 시 살모넬라·대장균 등이 급증할 수 있습니다.
          가급적 냉장 해동이나 흐르는 물 해동을 사용하세요.
        </div>
      )}

      <button className={`${s.copyBtn} ${copied ? s.copyBtnDone : ''}`} onClick={copyResult}>
        {copied ? '✓ 복사 완료' : '📋 결과 복사'}
      </button>
    </div>
  )
}

// ── 냉동 시간 탭 ──
function FreezeTab() {
  const [food, setFood] = useState<FoodKey>('beef_pork')
  const [thickness, setThickness] = useState('3')
  const [weight, setWeight] = useState('500')
  const [initialTemp, setInitialTemp] = useState<InitialTemp>('fridge')
  const [freezerTemp, setFreezerTemp] = useState<FreezerTemp>('normal')

  const f = FOODS.find(x => x.key === food)!
  const t = parseFloat(thickness) || 0
  const w = parseFloat(weight) || 0

  // 초기 온도 보정
  const initialFactor = initialTemp === 'fridge' ? 1.0 : initialTemp === 'room' ? 1.3 : 1.8
  const freezerFactor = freezerTemp === 'fast' ? 0.65 : 1.0

  const freezeHours = useMemo(() => {
    if (!t || !w) return 0
    const base = t * t * f.thawFactor / 3.5
    const weightAdj = Math.pow(w / 500, 1 / 3)
    return base * weightAdj * initialFactor * freezerFactor
  }, [t, w, f.thawFactor, initialFactor, freezerFactor])

  const ft = formatHours(freezeHours)

  // 보관 기간 바 최대값 (12개월)
  const maxStorage = 12

  return (
    <div className={s.wrap}>
      {/* 식품 */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 식품 종류</span>
        <div className={s.foodGrid}>
          {FOODS.map(item => (
            <button
              key={item.key}
              className={`${s.foodBtn} ${food === item.key ? s.foodActive : ''}`}
              onClick={() => setFood(item.key)}
            >
              <span className={s.foodBtnIcon}>{item.icon}</span>
              <span className={s.foodBtnText}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 두께/무게 */}
      <div className={s.card}>
        <span className={s.cardLabel}>2. 두께 / 무게</span>
        <div className={s.row2}>
          <div>
            <label className={s.fieldLabel}>두께 (cm)</label>
            <div className={s.valueRow}>
              <input
                type="number" inputMode="decimal" step="0.5" min={0.5} max={20}
                className={s.valueInput}
                value={thickness} onChange={e => setThickness(e.target.value)}
              />
              <span className={s.valueUnit}>cm</span>
            </div>
          </div>
          <div>
            <label className={s.fieldLabel}>무게 (g)</label>
            <div className={s.valueRow}>
              <input
                type="number" inputMode="decimal" step="50" min={50} max={5000}
                className={s.valueInput}
                value={weight} onChange={e => setWeight(e.target.value)}
              />
              <span className={s.valueUnit}>g</span>
            </div>
          </div>
        </div>
      </div>

      {/* 온도 설정 */}
      <div className={s.card}>
        <span className={s.cardLabel}>3. 초기 온도 · 냉동고 온도</span>
        <div style={{ marginBottom: '12px' }}>
          <label className={s.fieldLabel}>초기 온도</label>
          <div className={s.btnGroup}>
            <button
              className={`${s.toggleBtn} ${initialTemp === 'fridge' ? s.toggleActive : ''}`}
              onClick={() => setInitialTemp('fridge')}
            >냉장 (4°C)</button>
            <button
              className={`${s.toggleBtn} ${initialTemp === 'room' ? s.toggleActive : ''}`}
              onClick={() => setInitialTemp('room')}
            >실온 (20°C)</button>
            <button
              className={`${s.toggleBtn} ${initialTemp === 'hot' ? s.toggleActive : ''}`}
              onClick={() => setInitialTemp('hot')}
            >조리 직후 (70°C)</button>
          </div>
        </div>
        <div>
          <label className={s.fieldLabel}>냉동고 온도</label>
          <div className={s.btnGroup}>
            <button
              className={`${s.toggleBtn} ${freezerTemp === 'normal' ? s.toggleActive : ''}`}
              onClick={() => setFreezerTemp('normal')}
            >일반 냉동 (−18°C)</button>
            <button
              className={`${s.toggleBtn} ${freezerTemp === 'fast' ? s.toggleActive : ''}`}
              onClick={() => setFreezerTemp('fast')}
            >급속 냉동 (−24°C)</button>
          </div>
        </div>
      </div>

      {/* 히어로 */}
      {freezeHours > 0 && (
        <div className={`${s.hero} ${s.heroFreeze}`}>
          <div className={s.heroTop}>
            <div>
              <div className={s.heroLabel}>완전 냉동까지</div>
              <div className={s.heroMethod}>🧊 {freezerTemp === 'fast' ? '급속 냉동' : '일반 냉동'}</div>
            </div>
          </div>
          <div>
            <span className={s.heroNum} style={{ color: '#7DC4FF' }}>{ft.value}</span>
            <span className={s.heroUnit}>{ft.sub}</span>
          </div>
          <div className={s.heroSub}>
            {initialTemp === 'hot' && '⚠️ 조리 직후 식품은 실온에서 1시간 이내로 식힌 후 냉동하세요. '}
            {freezerTemp === 'fast' && '급속 냉동은 얼음 결정이 작게 형성돼 식품 조직 손상이 적습니다.'}
            {freezerTemp === 'normal' && initialTemp !== 'hot' && '소분 후 평평하게 펼쳐 냉동하면 더 빠르게 얼립니다.'}
          </div>
          <div className={s.etaBox}>
            <span className={s.etaLabel}>지금 넣으면 완료</span>
            <span className={s.etaTime}>{addMinutesToNow(freezeHours * 60)}</span>
          </div>
        </div>
      )}

      {/* 보관 기간 */}
      <div className={s.card}>
        <span className={s.cardLabel}>식품별 냉동 보관 기간</span>
        <div className={s.storageList}>
          {FOODS.map(item => (
            <div key={item.key} className={s.storageRow} style={item.key === food ? { filter: 'none' } : { opacity: 0.55 }}>
              <div className={s.storageName}>{item.icon} {item.label}</div>
              <div className={s.storageBarTrack}>
                <div className={s.storageBarFill} style={{ width: `${Math.min(100, item.storageMax / maxStorage * 100)}%` }} />
              </div>
              <div className={s.storageTime}>{item.storageMin}~{item.storageMax}개월</div>
            </div>
          ))}
        </div>
      </div>

      {/* 팁 */}
      <div className={s.infoBox}>
        <strong>{f.icon} {f.label} 냉동 팁</strong><br/>
        {f.tip}
      </div>

      <div className={s.warnBox}>
        <strong>⚠️ 냉동 전 반드시 확인</strong><br/>
        · 조리 직후 식품은 <strong style={{ color: '#FF6B6B' }}>반드시 식힌 후</strong> 냉동 (1시간 이내)<br/>
        · 공기 최대한 제거 · 1회분씩 소분하면 재냉동 방지<br/>
        · 해동한 생 식품의 재냉동은 식중독 위험으로 권장하지 않습니다
      </div>
    </div>
  )
}

// ── 온도계 (공용 시각화) ──
function ThermometerBox() {
  return (
    <div className={s.thermBox}>
      <div className={s.cardTitle} style={{ marginBottom: '12px' }}>🌡️ 식품 안전 온도 구간</div>
      <svg className={s.thermSvg} viewBox="0 0 560 90" preserveAspectRatio="xMidYMid meet">
        {/* 4구간 바 */}
        {[
          { x: 0,   w: 140, color: '#7DC4FF', label: '냉동', range: '−24~−18°C' },
          { x: 140, w: 120, color: '#3EC8FF', label: '냉장', range: '0~4°C' },
          { x: 260, w: 160, color: '#FF6B6B', label: '위험 온도대', range: '4~60°C' },
          { x: 420, w: 140, color: '#FF8C3E', label: '조리 안전', range: '60°C 이상' },
        ].map((seg, i) => (
          <g key={i}>
            <rect x={seg.x} y={20} width={seg.w} height={28} fill={seg.color} opacity="0.85"
                  rx={i === 0 ? 6 : 0} ry={i === 0 ? 6 : 0} />
            <text x={seg.x + seg.w / 2} y={14} fill="var(--text)" fontSize="11" fontFamily="Noto Sans KR" textAnchor="middle" fontWeight="600">
              {seg.label}
            </text>
            <text x={seg.x + seg.w / 2} y={64} fill="var(--muted)" fontSize="10" fontFamily="Syne" textAnchor="middle">
              {seg.range}
            </text>
          </g>
        ))}
        {/* 구분선 */}
        {[140, 260, 420].map((x, i) => (
          <line key={i} x1={x} x2={x} y1={20} y2={48} stroke="var(--bg)" strokeWidth="1.5" />
        ))}
        {/* 2시간 규칙 */}
        <text x={340} y={82} fill="#FF6B6B" fontSize="10" fontFamily="Noto Sans KR" textAnchor="middle" fontWeight="600">
          ⚠ 2시간 규칙 · 위험 온도대 2시간 초과 노출 시 폐기 권장
        </text>
      </svg>
    </div>
  )
}

// ── 메인 ──
export default function ThawingClient() {
  const [tab, setTab] = useState<'thaw' | 'freeze'>('thaw')

  return (
    <div className={s.wrap}>
      <div className={s.tabs}>
        <button
          className={`${s.tab} ${tab === 'thaw' ? s.tabThawActive : ''}`}
          onClick={() => setTab('thaw')}
        >🔥 해동 시간</button>
        <button
          className={`${s.tab} ${tab === 'freeze' ? s.tabFreezeActive : ''}`}
          onClick={() => setTab('freeze')}
        >🧊 냉동 시간</button>
      </div>

      {tab === 'thaw' ? <ThawTab /> : <FreezeTab />}

      <ThermometerBox />
    </div>
  )
}
