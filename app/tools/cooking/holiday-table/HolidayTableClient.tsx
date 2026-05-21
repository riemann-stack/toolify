'use client'

import Disclaimer from '@/components/Disclaimer'
import { useCallback, useEffect, useMemo, useState } from 'react'
import s from './holiday-table.module.css'
import {
  HOLIDAYS, ITEMS, calcRows, CHARYE_LAYOUT, SAVING_TIPS,
  type Category, type HolidayId, type FormatId,
} from './holidayData'

const STORAGE_KEY = 'youtil_holiday_table_v1'

interface LivePrice {
  id: string
  price: number
  date: string
  source: 'kamis' | 'fallback'
}

const CATEGORIES: Category[] = ['정육', '수산', '채소·과일', '곡물·떡', '견과·제수', '음료·기타']

export default function HolidayTableClient() {
  const [holidayId, setHolidayId] = useState<HolidayId>('chuseok')
  const [formatId, setFormatId] = useState<FormatId>('simple')
  const [people, setPeople] = useState(6)
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({})
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({})
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceLoaded, setPriceLoaded] = useState(false)
  const [copied, setCopied] = useState(false)

  /* localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.holidayId) setHolidayId(j.holidayId)
      if (j.formatId) setFormatId(j.formatId)
      if (typeof j.people === 'number') setPeople(j.people)
      if (j.priceOverrides) setPriceOverrides(j.priceOverrides)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ holidayId, formatId, people, priceOverrides }))
    } catch {}
  }, [holidayId, formatId, people, priceOverrides])

  /* 실시간 시세 조회 */
  const fetchLivePrices = useCallback(async () => {
    setPriceLoading(true)
    try {
      const target = ['baechu', 'mu', 'sagua', 'bae', 'gam', 'sigeumchi', 'hobak', 'daepa', 'maneul']
      const res = await fetch(`/api/produce-price?items=${target.join(',')}`, { cache: 'no-store' })
      const data = await res.json() as { ok: boolean; results?: LivePrice[] }
      if (data.ok && data.results) {
        const map: Record<string, LivePrice> = {}
        data.results.forEach(r => { map[r.id] = r })
        setLivePrices(map)
      }
      setPriceLoaded(true)
    } catch {
      // ignore
    } finally {
      setPriceLoading(false)
    }
  }, [])

  // 페이지 진입 시 자동 1회
  useEffect(() => {
    void fetchLivePrices()
  }, [fetchLivePrices])

  /* 계산 */
  const livePriceMap = useMemo(() => {
    const m: Record<string, number> = {}
    Object.entries(livePrices).forEach(([k, v]) => { m[k] = v.price })
    return m
  }, [livePrices])

  const rows = useMemo(
    () => calcRows(holidayId, formatId, people, priceOverrides, livePriceMap),
    [holidayId, formatId, people, priceOverrides, livePriceMap],
  )

  /* 카테고리별 그룹 + 합계 */
  const grouped = useMemo(() => {
    const map: Partial<Record<Category, typeof rows>> = {}
    for (const r of rows) {
      const cat = r.item.category
      if (!map[cat]) map[cat] = []
      map[cat]!.push(r)
    }
    return map
  }, [rows])

  const totalsByCategory = useMemo(() => {
    const o: Partial<Record<Category, number>> = {}
    for (const r of rows) {
      const cat = r.item.category
      o[cat] = (o[cat] ?? 0) + r.totalPriceWon
    }
    return o
  }, [rows])

  const grandTotal = rows.reduce((s, r) => s + r.totalPriceWon, 0)
  const perPersonCost = people > 0 ? Math.round(grandTotal / people) : 0

  /* 가격 직접 수정 */
  const onPriceEdit = (itemId: string, val: string) => {
    const n = parseFloat(val)
    if (!isFinite(n) || n < 0) {
      setPriceOverrides(prev => { const c = { ...prev }; delete c[itemId]; return c })
    } else {
      setPriceOverrides(prev => ({ ...prev, [itemId]: n }))
    }
  }
  const resetPrices = () => setPriceOverrides({})

  /* 마크다운 복사 */
  const copyMarkdown = async () => {
    const cfg = HOLIDAYS[holidayId]
    const fmt = cfg.formats[formatId]
    const lines: string[] = [
      `# ${cfg.emoji} ${cfg.name} ${fmt.name} (${people}인)`,
      ``,
      `_예상 총 비용 **${grandTotal.toLocaleString()}원** · 1인당 **${perPersonCost.toLocaleString()}원**_`,
      ``,
    ]
    for (const cat of CATEGORIES) {
      const items = grouped[cat]
      if (!items || items.length === 0) continue
      lines.push(`## ${cat} — ${(totalsByCategory[cat] ?? 0).toLocaleString()}원`)
      for (const r of items) {
        lines.push(`- [ ] ${r.item.name} **${r.displayAmount}${r.displayUnit}** — ${r.totalPriceWon.toLocaleString()}원`)
      }
      lines.push('')
    }
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      alert('복사 실패')
    }
  }

  const cfg = HOLIDAYS[holidayId]
  const fmt = cfg.formats[formatId]
  const hasLive = priceLoaded && Object.values(livePrices).some(p => p.source === 'kamis')

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/cooking/kimjang',  label: '김장 양 계산기' },
          { href: '/tools/cooking/serving',  label: '1인분 분량 계산기' },
          { href: '/tools/cooking/recipe',   label: '레시피 비율 계산기' },
        ]}
      >
        최근 시장 평균가 + KAMIS 실시간 시세. 지역·구매처·작황별 ±30% 차이 가능 — 장보기 직전 시세 확인 권장.
      </Disclaimer>

      {/* ── 명절 선택 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📅 명절</div>
        <div className={s.holidayRow}>
          {(Object.keys(HOLIDAYS) as HolidayId[]).map(id => {
            const h = HOLIDAYS[id]
            const on = holidayId === id
            return (
              <button
                key={id}
                type="button"
                className={`${s.holidayBtn} ${on ? s.holidayActive : ''}`}
                onClick={() => setHolidayId(id)}
              >
                <span className={s.holidayEmoji}>{h.emoji}</span>
                <span className={s.holidayName}>{h.name}</span>
                <span className={s.holidayDesc}>{h.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 상 형식·인원 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🍱 상 형식 + 인원</div>

        <div className={s.subLabel}>상 형식</div>
        <div className={s.formatRow}>
          {(['formal', 'simple', 'meal'] as FormatId[]).map(fid => {
            const f = cfg.formats[fid]
            const on = formatId === fid
            return (
              <button
                key={fid}
                type="button"
                className={`${s.formatBtn} ${on ? s.formatActive : ''}`}
                onClick={() => setFormatId(fid)}
              >
                <div className={s.formatName}>{f.name}</div>
                <div className={s.formatDesc}>{f.desc}</div>
              </button>
            )
          })}
        </div>

        <div className={s.subLabel} style={{ marginTop: 14 }}>인원 수 — {people}명</div>
        <div className={s.peopleRow}>
          <input
            type="range"
            min={1} max={20} step={1}
            value={people}
            onChange={e => setPeople(parseInt(e.target.value))}
            className={s.slider}
          />
          <div className={s.peopleQuick}>
            {[2, 4, 6, 8, 10, 15].map(n => (
              <button key={n}
                type="button"
                className={`${s.quickBtn} ${people === n ? s.quickActive : ''}`}
                onClick={() => setPeople(n)}
              >{n}명</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 메인 결과 히어로 ── */}
      <div className={s.heroCard}>
        <div className={s.heroLabel}>
          {cfg.emoji} {cfg.name} {fmt.name} · {people}명
        </div>
        <div className={s.heroBigRow}>
          <div className={s.heroBigItem}>
            <div className={s.heroNum}>
              {grandTotal >= 100000 ? (grandTotal / 10000).toFixed(1) : (grandTotal / 1000).toFixed(0)}
            </div>
            <div className={s.heroUnit}>{grandTotal >= 100000 ? '만원' : '천원'}</div>
            <div className={s.heroSub}>총 비용 ({grandTotal.toLocaleString()}원)</div>
          </div>
          <div className={s.heroDivider} />
          <div className={s.heroBigItem}>
            <div className={s.heroNum}>{perPersonCost.toLocaleString()}</div>
            <div className={s.heroUnit}>원</div>
            <div className={s.heroSub}>1인당 비용</div>
          </div>
        </div>
        <div className={s.heroFootRow}>
          <span className={s.priceSource}>
            {hasLive ? '✓ KAMIS 실시간 시세 적용' : '※ 최근 시장 평균가 (KAMIS API 키 미설정 폴백)'}
          </span>
          <button
            type="button"
            className={s.refreshBtn}
            onClick={fetchLivePrices}
            disabled={priceLoading}
          >
            {priceLoading ? '조회 중…' : '↻ 최신 시세'}
          </button>
        </div>
      </div>

      {/* ── 카테고리별 품목 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>
          <span>🛒 품목별 수량 + 비용</span>
          {Object.keys(priceOverrides).length > 0 && (
            <button className={s.resetBtn} onClick={resetPrices}>가격 초기화</button>
          )}
        </div>

        {CATEGORIES.map(cat => {
          const items = grouped[cat]
          if (!items || items.length === 0) return null
          const catTotal = totalsByCategory[cat] ?? 0
          return (
            <div key={cat} className={s.catBlock}>
              <div className={s.catHeader}>
                <span className={s.catName}>{cat}</span>
                <span className={s.catTotal}>{catTotal.toLocaleString()}원</span>
              </div>
              <ul className={s.itemList}>
                {items.map(r => {
                  const live = livePrices[r.item.id]
                  const override = priceOverrides[r.item.id]
                  const currentPrice = override ?? live?.price ?? r.item.pricePerUnit
                  return (
                    <li key={r.item.id} className={s.itemRow}>
                      <div className={s.itemMain}>
                        <span className={s.itemName}>
                          {r.item.name}
                          {r.item.note && <span className={s.itemNote}> · {r.item.note}</span>}
                        </span>
                        <span className={s.itemAmt}>{r.displayAmount}{r.displayUnit}</span>
                      </div>
                      <div className={s.itemPriceRow}>
                        <input
                          type="number"
                          className={s.itemPriceInput}
                          value={currentPrice}
                          onChange={e => onPriceEdit(r.item.id, e.target.value)}
                          min={0}
                          step={1}
                          aria-label={`${r.item.name} 단가`}
                        />
                        <span className={s.itemPriceUnit}>원/{r.item.unit}</span>
                        {live?.source === 'kamis' && (
                          <span className={s.itemLive} title={`KAMIS ${live.date}`}>실시간</span>
                        )}
                      </div>
                      <div className={s.itemTotal}>{r.totalPriceWon.toLocaleString()}원</div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}

        <div className={s.totalRow}>
          <span>총 예상 비용</span>
          <span className={s.totalNum}>{grandTotal.toLocaleString()}원</span>
        </div>

        <button type="button" className={`${s.copyBtn} ${copied ? s.copied : ''}`} onClick={copyMarkdown}>
          {copied ? '✓ 복사됨' : '📋 장보기 리스트 복사 (마크다운)'}
        </button>
      </div>

      {/* ── 차례상 5열 배치 (formal일 때만) ── */}
      {formatId === 'formal' && (
        <div className={s.card}>
          <div className={s.cardLabel}>📜 차례상 5열 배치 원칙</div>
          <div className={s.layoutWrap}>
            <CharyeLayoutSvg />
          </div>
          <div className={s.layoutTable}>
            {CHARYE_LAYOUT.map(row => (
              <div key={row.row} className={s.layoutRow}>
                <div className={s.layoutRowNum}>{row.row}열</div>
                <div className={s.layoutRowBody}>
                  <div className={s.layoutRowLabel}>{row.label}</div>
                  <div className={s.layoutRowItems}>{row.items}</div>
                  <div className={s.layoutRowPrinciple}>{row.principle}</div>
                </div>
              </div>
            ))}
          </div>
          <p className={s.layoutNote}>
            💡 <strong>어동육서</strong>: 동쪽에 어물, 서쪽에 육류 · <strong>홍동백서</strong>: 동쪽에 붉은 과일, 서쪽에 흰 과일 · <strong>조율이시</strong>: 대추·밤·배·감(곶감) 순서로 배치
          </p>
        </div>
      )}

      {/* ── 절약 팁 ── */}
      <div className={s.tipCard}>
        <div className={s.cardLabel}>💡 명절 비용 절약 팁</div>
        <ul className={s.tipList}>
          {SAVING_TIPS.map((t, i) => (
            <li key={i}><strong>{t.tip}</strong> — {t.detail}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ─── 차례상 5열 배치 SVG ─── */
function CharyeLayoutSvg() {
  return (
    <svg viewBox="0 0 500 280" className={s.charyeSvg} preserveAspectRatio="xMidYMid meet">
      {/* 상 외곽 (격자) */}
      <rect x="20" y="20" width="460" height="240" rx="8"
        fill="rgba(217,119,6,0.04)" stroke="#D97706" strokeWidth="2" />

      {/* 5개 가로 행 (북=위, 남=아래) */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i}
          x1="20" x2="480"
          y1={20 + (i + 1) * 48}
          y2={20 + (i + 1) * 48}
          stroke="#D97706" strokeWidth="1" opacity="0.4" strokeDasharray="3 3"
        />
      ))}

      {/* 신위 (북쪽) 표시 */}
      <text x="250" y="14" textAnchor="middle" fill="#D97706" fontSize="11"
        fontFamily="Noto Sans KR, sans-serif" fontWeight="700">↑ 신위 (북)</text>

      {/* 1열: 메·갱 */}
      <text x="100" y="48" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">메(밥)</text>
      <text x="200" y="48" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">갱(국)</text>
      <text x="300" y="48" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">잔</text>
      <text x="400" y="48" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">시접</text>

      {/* 2열: 면·떡·송편 */}
      <text x="120" y="96" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif">면·국수</text>
      <text x="250" y="96" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif" textAnchor="middle">송편·떡</text>
      <text x="380" y="96" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif">편·꿀</text>

      {/* 3열: 적·전 (어동육서) */}
      <text x="60" y="144" fill="#0891B2" fontSize="10" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">어 (동)</text>
      <text x="120" y="144" fill="#fff" fontSize="10" fontFamily="Noto Sans KR, sans-serif">조기·동태전</text>
      <text x="250" y="144" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif" textAnchor="middle">동그랑땡·전</text>
      <text x="370" y="144" fill="#fff" fontSize="10" fontFamily="Noto Sans KR, sans-serif">갈비찜·산적</text>
      <text x="430" y="144" fill="#EA580C" fontSize="10" fontFamily="Noto Sans KR, sans-serif" fontWeight="700">육 (서)</text>

      {/* 4열: 탕 (육탕·소탕·어탕) */}
      <text x="140" y="192" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif">육탕</text>
      <text x="250" y="192" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif" textAnchor="middle">소탕</text>
      <text x="360" y="192" fill="#fff" fontSize="11" fontFamily="Noto Sans KR, sans-serif">어탕</text>

      {/* 5열: 포·나물·과일 (조율이시·홍동백서) */}
      <text x="50" y="240" fill="#059669" fontSize="9" fontFamily="Noto Sans KR, sans-serif">대추</text>
      <text x="100" y="240" fill="#059669" fontSize="9" fontFamily="Noto Sans KR, sans-serif">밤</text>
      <text x="150" y="240" fill="#059669" fontSize="9" fontFamily="Noto Sans KR, sans-serif">배</text>
      <text x="200" y="240" fill="#059669" fontSize="9" fontFamily="Noto Sans KR, sans-serif">감</text>
      <text x="245" y="240" fill="#fff" fontSize="9" fontFamily="Noto Sans KR, sans-serif">시금치</text>
      <text x="300" y="240" fill="#fff" fontSize="9" fontFamily="Noto Sans KR, sans-serif">도라지</text>
      <text x="355" y="240" fill="#fff" fontSize="9" fontFamily="Noto Sans KR, sans-serif">고사리</text>
      <text x="410" y="240" fill="#fff" fontSize="9" fontFamily="Noto Sans KR, sans-serif">한과·식혜</text>

      {/* 5열 라벨 */}
      <text x="30" y="265" fill="#D97706" fontSize="10" fontFamily="Noto Sans KR, sans-serif">조율이시 + 홍동백서</text>
    </svg>
  )
}
