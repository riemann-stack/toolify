'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './fruit-syrup.module.css'

// ─────────────────────────────────────────────
// 과일 프리셋
// ─────────────────────────────────────────────
interface FruitPreset {
  id: string
  name: string
  ratio: number        // 권장 설탕 비율 (설탕 ÷ 과일)
  stirDays: number     // 저어주기 권장 기간(일)
  readyDays: number    // 사용 가능 시작(일)
  harvestDays: number  // 과일 건지기 시점(일), 0 = 건지지 않고 그대로 보관
  keepMonths: number   // 권장 소비기한(냉장, 개월)
  prep: string         // 손질 팁
  season: string       // 제철
}

const FRUITS: FruitPreset[] = [
  { id: 'maesil',     name: '매실',   ratio: 1.0, stirDays: 20, readyDays: 100, harvestDays: 100, keepMonths: 12, prep: '깨끗이 씻어 물기를 완전히 말리고 꼭지를 제거합니다.',        season: '5~6월' },
  { id: 'lemon',      name: '레몬',   ratio: 1.0, stirDays: 7,  readyDays: 7,   harvestDays: 14,  keepMonths: 2,  prep: '베이킹소다·굵은소금으로 껍질을 문질러 세척 후 얇게 슬라이스.', season: '연중(겨울이 제맛)' },
  { id: 'yuja',       name: '유자',   ratio: 1.0, stirDays: 10, readyDays: 14,  harvestDays: 0,   keepMonths: 6,  prep: '껍질째 채 썰고 씨는 제거합니다.',                            season: '11~12월' },
  { id: 'ginger',     name: '생강',   ratio: 1.0, stirDays: 10, readyDays: 14,  harvestDays: 0,   keepMonths: 6,  prep: '껍질을 벗겨 최대한 얇게 편으로 썹니다.',                       season: '가을~겨울' },
  { id: 'grapefruit', name: '자몽',   ratio: 1.0, stirDays: 7,  readyDays: 7,   harvestDays: 14,  keepMonths: 2,  prep: '세척 후 얇게 슬라이스하거나 과육만 발라냅니다.',               season: '겨울' },
  { id: 'cheonggyul', name: '청귤',   ratio: 1.0, stirDays: 10, readyDays: 14,  harvestDays: 0,   keepMonths: 6,  prep: '껍질째 얇게 슬라이스합니다.',                                 season: '8~9월' },
  { id: 'strawberry', name: '딸기',   ratio: 1.0, stirDays: 3,  readyDays: 3,   harvestDays: 0,   keepMonths: 1,  prep: '꼭지를 떼고 반으로 자릅니다. 반드시 냉장 숙성하세요.',          season: '12~4월' },
  { id: 'quince',     name: '모과',   ratio: 1.0, stirDays: 20, readyDays: 30,  harvestDays: 30,  keepMonths: 12, prep: '단단하므로 얇게 채 썹니다.',                                  season: '10~11월' },
  { id: 'apple',      name: '사과',   ratio: 1.0, stirDays: 10, readyDays: 14,  harvestDays: 0,   keepMonths: 6,  prep: '얇게 슬라이스하거나 채 썹니다.',                               season: '가을' },
  { id: 'omija',      name: '오미자', ratio: 1.0, stirDays: 20, readyDays: 100, harvestDays: 100, keepMonths: 12, prep: '흐르는 물에 가볍게 헹궈 물기를 제거합니다.',                   season: '9~10월' },
]

const RATIO_PRESETS = [
  { v: 0.8, label: '1 : 0.8', sub: '저당·풍미' },
  { v: 1.0, label: '1 : 1',   sub: '표준·보존 안전' },
  { v: 1.2, label: '1 : 1.2', sub: '고당·장기보관' },
]

// 표준 유리병 용량 (ml)
const JAR_SIZES = [500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000]
const SUGAR_BULK_DENSITY = 0.85 // 백설탕 약 0.85 g/ml

// ─────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────
const pad = (n: number) => String(n).padStart(2, '0')
const WD = ['일', '월', '화', '수', '목', '금', '토']

function parseISO(iso: string): Date | null {
  const m = iso.split('-').map(Number)
  if (m.length !== 3 || m.some(isNaN)) return null
  return new Date(m[0], m[1] - 1, m[2])
}
function addDays(d: Date, n: number): Date { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function addMonths(d: Date, n: number): Date { const x = new Date(d); x.setMonth(x.getMonth() + n); return x }
function fmtDate(d: Date): string { return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} (${WD[d.getDay()]})` }
function fmtG(n: number): string { return Math.round(n).toLocaleString('ko-KR') }

// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function FruitSyrupClient() {
  const [fruitId, setFruitId] = useState('maesil')
  const [weightStr, setWeightStr] = useState('1000')
  const [ratio, setRatio] = useState(1.0)
  const [ratioCustom, setRatioCustom] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [copied, setCopied] = useState(false)

  // SSR 안전 — 마운트 후 오늘 날짜로 초기화
  useEffect(() => {
    const t = new Date()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartDate(`${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`)
  }, [])

  const fruit = FRUITS.find(f => f.id === fruitId) ?? FRUITS[0]
  const weight = parseFloat(weightStr) || 0

  function pickFruit(f: FruitPreset) {
    setFruitId(f.id)
    if (!ratioCustom) setRatio(f.ratio)
  }

  const calc = useMemo(() => {
    const sugar = weight * ratio
    const totalWeight = weight + sugar
    const fruitMl = weight                 // 과일 밀도 ≈ 1 g/ml
    const sugarMl = sugar / SUGAR_BULK_DENSITY
    const totalMl = fruitMl + sugarMl
    const needed = totalMl * 1.2           // 여유 20%
    const jarMl = JAR_SIZES.find(j => j >= needed) ?? JAR_SIZES[JAR_SIZES.length - 1]
    const syrupMl = totalWeight * 0.6      // 완성 원액 근사
    const drinkCups = Math.floor((syrupMl * 9) / 200) // 1:8 희석, 200ml 잔
    return { sugar, totalWeight, totalMl, jarMl, syrupMl, drinkCups }
  }, [weight, ratio])

  const schedule = useMemo(() => {
    const base = startDate ? parseISO(startDate) : null
    if (!base) return []
    const rows: { key: string; label: string; date: string; note: string }[] = [
      { key: 'start', label: '담근 날', date: fmtDate(base), note: '과일과 설탕을 켜켜이 담고 맨 위를 설탕으로 덮습니다.' },
      { key: 'stir',  label: '저어주기', date: `~ ${fmtDate(addDays(base, fruit.stirDays))}`, note: `설탕이 다 녹을 때까지 약 ${fruit.stirDays}일간 하루 1회 위아래로 섞어줍니다.` },
      { key: 'ready', label: '사용 가능', date: fmtDate(addDays(base, fruit.readyDays)), note: '설탕이 녹고 맛이 어우러지면 음료·요리에 쓸 수 있습니다.' },
    ]
    if (fruit.harvestDays > 0) {
      rows.push({ key: 'harvest', label: '과일 건지기', date: fmtDate(addDays(base, fruit.harvestDays)), note: '이 시점에 과일을 건져내면 떫은맛·잡내 없이 깔끔하게 보관됩니다.' })
    }
    rows.push({ key: 'best', label: '권장 소비기한', date: fmtDate(addMonths(base, fruit.keepMonths)), note: `냉장 보관 기준 약 ${fruit.keepMonths}개월. 곰팡이·이취가 나면 즉시 폐기하세요.` })
    return rows
  }, [startDate, fruit])

  function handleCopy() {
    const lines = [
      `🍯 ${fruit.name}청 담그기`,
      `과일 ${fmtG(weight)}g : 설탕 ${fmtG(calc.sugar)}g (1:${ratio})`,
      `담금 총 중량 ${fmtG(calc.totalWeight)}g · 권장 용기 ${calc.jarMl >= 1000 ? (calc.jarMl / 1000) + 'L' : calc.jarMl + 'ml'}`,
      `완성 원액 약 ${fmtG(calc.syrupMl)}ml (근사)`,
    ]
    if (schedule.length) {
      lines.push('──────────')
      schedule.forEach(r => lines.push(`${r.label}: ${r.date}`))
    }
    lines.push('youtil.kr/tools/cooking/fruit-syrup')
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/cooking/kimjang', label: '김장 양 계산기' },
          { href: '/tools/cooking/food-storage', label: '식재료 보관 계산기' },
          { href: '/tools/cooking/recipe', label: '레시피 비율 계산기' },
        ]}
      >
        설탕 비율·숙성 기간은 일반적인 가정 담금 기준입니다. 위생(물기 완전 제거)이 보존성을 좌우하며, 곰팡이·이취가 보이면 섭취하지 말고 폐기하세요.
      </Disclaimer>

      {/* 1. 과일 선택 */}
      <div className={s.card}>
        <span className={s.cardLabel}>과일 선택</span>
        <div className={s.fruitGrid}>
          {FRUITS.map(f => (
            <button
              key={f.id}
              type="button"
              className={`${s.fruitBtn} ${fruitId === f.id ? s.fruitActive : ''}`}
              onClick={() => pickFruit(f)}
            >
              {f.name}
            </button>
          ))}
        </div>
        <p className={s.prepNote}><strong>손질:</strong> {fruit.prep} <span className={s.season}>· 제철 {fruit.season}</span></p>
      </div>

      {/* 2. 과일 무게 */}
      <div className={s.card}>
        <span className={s.cardLabel}>과일 무게</span>
        <div className={s.inputRow}>
          <input
            type="number" min={0} step={100} inputMode="decimal" className={s.numInput}
            value={weightStr}
            onChange={e => setWeightStr(e.target.value)}
            onBlur={() => { const v = parseFloat(weightStr); setWeightStr(isNaN(v) ? '' : String(Math.max(0, v))) }}
          />
          <span className={s.unit}>g</span>
        </div>
        <div className={s.quickRow}>
          {[500, 1000, 2000, 3000].map(w => (
            <button key={w} type="button"
              className={`${s.quickBtn} ${weightStr === String(w) ? s.quickActive : ''}`}
              onClick={() => setWeightStr(String(w))}>
              {w >= 1000 ? `${w / 1000}kg` : `${w}g`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 설탕 비율 */}
      <div className={s.card}>
        <span className={s.cardLabel}>설탕 비율 <small className={s.cardHint}>과일 : 설탕</small></span>
        <div className={s.ratioRow}>
          {RATIO_PRESETS.map(r => (
            <button key={r.v} type="button"
              className={`${s.ratioBtn} ${!ratioCustom && ratio === r.v ? s.ratioActive : ''}`}
              onClick={() => { setRatio(r.v); setRatioCustom(false) }}>
              <span className={s.ratioLabel}>{r.label}</span>
              <span className={s.ratioSub}>{r.sub}</span>
            </button>
          ))}
          <button type="button"
            className={`${s.ratioBtn} ${ratioCustom ? s.ratioActive : ''}`}
            onClick={() => setRatioCustom(true)}>
            <span className={s.ratioLabel}>직접</span>
            <span className={s.ratioSub}>비율 입력</span>
          </button>
        </div>
        {ratioCustom && (
          <div className={s.inputRow} style={{ marginTop: 10 }}>
            <span className={s.unit} style={{ marginRight: 8 }}>1 :</span>
            <input type="number" min={0.1} max={2} step={0.1} className={s.numInput} style={{ maxWidth: 120 }}
              value={ratio} onChange={e => setRatio(Math.max(0, parseFloat(e.target.value) || 0))} />
          </div>
        )}
      </div>

      {/* 4. 담근 날짜 */}
      <div className={s.card}>
        <span className={s.cardLabel}>담근 날짜 <small className={s.cardHint}>숙성 일정 계산용</small></span>
        <input type="date" className={s.dateInput} value={startDate} onChange={e => setStartDate(e.target.value)} />
      </div>

      {/* ── 결과 ── */}
      <div className={s.hero}>
        <div className={s.heroLead}>{fruit.name} {fmtG(weight)}g 에 필요한 설탕</div>
        <div className={s.heroNum}>{fmtG(calc.sugar)}<span className={s.heroUnit}>g</span></div>
        <div className={s.heroSub}>과일 : 설탕 = 1 : {ratio}</div>
      </div>

      <div className={s.resultGrid}>
        <div className={s.resultBox}>
          <div className={s.resultLabel}>담금 총 중량</div>
          <div className={s.resultNum}>{fmtG(calc.totalWeight)}<small>g</small></div>
        </div>
        <div className={s.resultBox}>
          <div className={s.resultLabel}>권장 유리병</div>
          <div className={s.resultNum}>{calc.jarMl >= 1000 ? <>{calc.jarMl / 1000}<small>L</small></> : <>{calc.jarMl}<small>ml</small></>}</div>
          <div className={s.resultFoot}>여유 20% 포함</div>
        </div>
        <div className={s.resultBox}>
          <div className={s.resultLabel}>완성 원액 (근사)</div>
          <div className={s.resultNum}>약 {fmtG(calc.syrupMl)}<small>ml</small></div>
          <div className={s.resultFoot}>1:8 희석 시 약 {calc.drinkCups}잔(200ml)</div>
        </div>
      </div>

      {/* 일정 */}
      {schedule.length > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>숙성·보관 일정</span>
          <div className={s.timeline}>
            {schedule.map(r => (
              <div key={r.key} className={s.tlRow}>
                <div className={s.tlDot} />
                <div className={s.tlBody}>
                  <div className={s.tlHead}>
                    <span className={s.tlName}>{r.label}</span>
                    <span className={s.tlDate}>{r.date}</span>
                  </div>
                  <div className={s.tlNote}>{r.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className={`${s.copyBtn} ${copied ? s.copied : ''}`} type="button" onClick={handleCopy}>
        {copied ? '✓ 복사됨' : '📋 결과 복사'}
      </button>
    </div>
  )
}
