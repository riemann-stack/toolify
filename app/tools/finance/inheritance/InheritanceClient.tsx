'use client'

import { useMemo, useState } from 'react'
import s from './inheritance.module.css'

// ───────────────────────── 데이터 ─────────────────────────

type Relation = '배우자' | '성인자녀' | '미성년자녀' | '부모' | '기타친족' | '타인'

const RELATIONS: { key: Relation; label: string; cls: string }[] = [
  { key: '배우자', label: '배우자', cls: s.relSpouse },
  { key: '성인자녀', label: '성인 자녀', cls: s.relAdult },
  { key: '미성년자녀', label: '미성년 자녀', cls: s.relMinor },
  { key: '부모', label: '부모', cls: s.relParent },
  { key: '기타친족', label: '기타 친족', cls: s.relRelative },
  { key: '타인', label: '타인', cls: s.relOther },
]

const GIFT_DEDUCTION: Record<Relation, number> = {
  배우자: 6_000_000_000,
  성인자녀: 50_000_000,
  미성년자녀: 20_000_000,
  부모: 50_000_000,
  기타친족: 10_000_000,
  타인: 0,
}

type AssetKind = '현금' | '주식' | '부동산' | '기타'
const ASSET_KINDS: AssetKind[] = ['현금', '주식', '부동산', '기타']

interface Bracket {
  min: number
  max: number
  rate: number
  deduction: number
}

const TAX_BRACKETS: Bracket[] = [
  { min: 0,             max: 100_000_000,   rate: 0.10, deduction: 0           },
  { min: 100_000_000,   max: 500_000_000,   rate: 0.20, deduction: 10_000_000  },
  { min: 500_000_000,   max: 1_000_000_000, rate: 0.30, deduction: 60_000_000  },
  { min: 1_000_000_000, max: 3_000_000_000, rate: 0.40, deduction: 160_000_000 },
  { min: 3_000_000_000, max: Infinity,      rate: 0.50, deduction: 460_000_000 },
]

function calcProgressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0
  let bracket: Bracket = TAX_BRACKETS[0]
  for (const b of TAX_BRACKETS) {
    if (taxBase > b.min) bracket = b
  }
  return Math.max(0, taxBase * bracket.rate - bracket.deduction)
}

// ───────────────────────── 포맷터 ─────────────────────────

function formatKRW(n: number): string {
  if (!isFinite(n)) return '-'
  return Math.round(n).toLocaleString('ko-KR') + '원'
}

function formatShortKRW(n: number): string {
  if (!isFinite(n) || n === 0) return '0원'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000)
    const man = Math.floor((abs % 100_000_000) / 10_000)
    if (man === 0) return `${sign}${eok}억원`
    return `${sign}${eok}억 ${man.toLocaleString('ko-KR')}만원`
  }
  if (abs >= 10_000) {
    const man = Math.floor(abs / 10_000)
    return `${sign}${man.toLocaleString('ko-KR')}만원`
  }
  return `${sign}${abs.toLocaleString('ko-KR')}원`
}

function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9]/g, '')
  if (!cleaned) return 0
  return parseInt(cleaned, 10)
}

function commaInput(n: number): string {
  if (!n) return ''
  return n.toLocaleString('ko-KR')
}

// ───────────────────────── 메인 ─────────────────────────

type TabKey = 'gift' | 'inherit' | 'compare'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'gift', label: '증여세 계산' },
  { key: 'inherit', label: '상속세 계산' },
  { key: 'compare', label: '비교 분석' },
]

export default function InheritanceClient() {
  const [tab, setTab] = useState<TabKey>('gift')

  // ── 증여 상태 ──
  const [giftAmountStr, setGiftAmountStr] = useState('100000000')
  const [giftRelation, setGiftRelation] = useState<Relation>('성인자녀')
  const [prevGiftStr, setPrevGiftStr] = useState('0')
  const [assetKind, setAssetKind] = useState<AssetKind>('현금')
  const [recipients, setRecipients] = useState<{ rel: Relation; amount: number }[]>([])
  const [showGiftDetail, setShowGiftDetail] = useState(false)

  // ── 상속 상태 ──
  const [totalAssetStr, setTotalAssetStr] = useState('5000000000')
  const [hasSpouse, setHasSpouse] = useState(true)
  const [childCount, setChildCount] = useState(2)
  const [otherHeirCount, setOtherHeirCount] = useState(0)
  const [priorGiftStr, setPriorGiftStr] = useState('0')
  const [funeralStr, setFuneralStr] = useState('5000000')
  const [debtStr, setDebtStr] = useState('0')
  const [showInheritDetail, setShowInheritDetail] = useState(false)

  // ── 비교 분석 시나리오 ──
  const [scTotalStr, setScTotalStr] = useState('200000000')
  const [scChildCount, setScChildCount] = useState(2)
  const [scRounds, setScRounds] = useState<1 | 2 | 3>(1)

  return (
    <div className={s.wrap}>
      {/* 면책 조항 (항상 표시) */}
      <div className={s.disclaimer}>
        ⚖️ <strong>본 계산기는 단순 참고용입니다.</strong><br />
        실제 세금은 재산 평가, 공제 항목, 신고 시점, 가족관계에 따라 크게 달라질 수 있습니다.
        정확한 신고·절세는 세무사와 상담하세요.<br />
        <span style={{ color: 'var(--muted)' }}>현행 세율 기준: 2026년 상속세 및 증여세법</span>
      </div>

      {/* 탭 */}
      <div className={s.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`${s.tabBtn} ${tab === t.key ? s.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gift' && (
        <GiftTab
          amountStr={giftAmountStr}
          setAmountStr={setGiftAmountStr}
          relation={giftRelation}
          setRelation={setGiftRelation}
          prevStr={prevGiftStr}
          setPrevStr={setPrevGiftStr}
          assetKind={assetKind}
          setAssetKind={setAssetKind}
          recipients={recipients}
          setRecipients={setRecipients}
          showDetail={showGiftDetail}
          setShowDetail={setShowGiftDetail}
        />
      )}

      {tab === 'inherit' && (
        <InheritTab
          totalAssetStr={totalAssetStr}
          setTotalAssetStr={setTotalAssetStr}
          hasSpouse={hasSpouse}
          setHasSpouse={setHasSpouse}
          childCount={childCount}
          setChildCount={setChildCount}
          otherHeirCount={otherHeirCount}
          setOtherHeirCount={setOtherHeirCount}
          priorGiftStr={priorGiftStr}
          setPriorGiftStr={setPriorGiftStr}
          funeralStr={funeralStr}
          setFuneralStr={setFuneralStr}
          debtStr={debtStr}
          setDebtStr={setDebtStr}
          showDetail={showInheritDetail}
          setShowDetail={setShowInheritDetail}
        />
      )}

      {tab === 'compare' && (
        <CompareTab
          giftAmount={parseAmount(giftAmountStr)}
          giftRelation={giftRelation}
          prevGift={parseAmount(prevGiftStr)}
          totalAsset={parseAmount(totalAssetStr)}
          hasSpouse={hasSpouse}
          childCount={childCount}
          assetKind={assetKind}
          scTotalStr={scTotalStr}
          setScTotalStr={setScTotalStr}
          scChildCount={scChildCount}
          setScChildCount={setScChildCount}
          scRounds={scRounds}
          setScRounds={setScRounds}
        />
      )}
    </div>
  )
}

// ───────────────────────── 증여세 탭 ─────────────────────────

interface GiftTabProps {
  amountStr: string
  setAmountStr: (v: string) => void
  relation: Relation
  setRelation: (r: Relation) => void
  prevStr: string
  setPrevStr: (v: string) => void
  assetKind: AssetKind
  setAssetKind: (a: AssetKind) => void
  recipients: { rel: Relation; amount: number }[]
  setRecipients: (r: { rel: Relation; amount: number }[]) => void
  showDetail: boolean
  setShowDetail: (b: boolean) => void
}

function GiftTab(p: GiftTabProps) {
  const amount = parseAmount(p.amountStr)
  const prev = parseAmount(p.prevStr)
  const result = useMemo(() => calcGiftTax(amount, p.relation, prev), [amount, p.relation, prev])

  // 분할 증여 결과
  const splitTotal = useMemo(() => {
    if (p.recipients.length === 0) return null
    let totalTax = 0
    const each = p.recipients.map(r => {
      const t = calcGiftTax(r.amount, r.rel, 0)
      totalTax += t.finalTax
      return { ...r, tax: t.finalTax }
    })
    return { totalTax, each }
  }, [p.recipients])

  return (
    <>
      {/* 증여 금액 */}
      <div className={s.card}>
        <span className={s.cardLabel}>증여 금액</span>
        <div className={s.inputRow}>
          <input
            className={s.numInput}
            type="text"
            inputMode="numeric"
            value={commaInput(amount)}
            onChange={e => p.setAmountStr(parseAmount(e.target.value).toString())}
            placeholder="100,000,000"
          />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.pills}>
          {[10_000_000, 50_000_000, 100_000_000, 500_000_000, 1_000_000_000].map(v => (
            <button
              key={v}
              className={`${s.pill} ${amount === v ? s.pillActive : ''}`}
              onClick={() => p.setAmountStr(v.toString())}
            >
              {formatShortKRW(v)}
            </button>
          ))}
        </div>
        {amount > 0 && (
          <div className={s.helperText}>= {formatShortKRW(amount)}</div>
        )}
      </div>

      {/* 관계 */}
      <div className={s.card}>
        <span className={s.cardLabel}>받는 사람 (수증자) 관계</span>
        <div className={s.relGrid}>
          {RELATIONS.map(r => (
            <button
              key={r.key}
              className={`${s.relBtn} ${r.cls} ${p.relation === r.key ? s.relActive : ''}`}
              onClick={() => p.setRelation(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className={s.helperText}>
          공제 한도: <strong style={{ color: 'var(--text)' }}>{formatShortKRW(GIFT_DEDUCTION[p.relation])}</strong> (10년간 합산)
        </div>
      </div>

      {/* 10년 내 기존 증여액 */}
      <div className={s.card}>
        <span className={s.cardLabel}>10년 내 동일인 기존 증여액</span>
        <div className={s.inputRow}>
          <input
            className={s.numInput}
            type="text"
            inputMode="numeric"
            value={commaInput(prev)}
            onChange={e => p.setPrevStr(parseAmount(e.target.value).toString())}
            placeholder="없으면 0"
          />
          <span className={s.unit}>원</span>
        </div>
      </div>

      {/* 재산 종류 */}
      <div className={s.card}>
        <span className={s.cardLabel}>재산 종류</span>
        <div className={s.pills}>
          {ASSET_KINDS.map(k => (
            <button
              key={k}
              className={`${s.pill} ${p.assetKind === k ? s.pillActive : ''}`}
              onClick={() => p.setAssetKind(k)}
            >
              {k === '현금' ? '💵 현금·예금' : k === '주식' ? '📈 주식·펀드' : k === '부동산' ? '🏠 부동산' : '📦 기타'}
            </button>
          ))}
        </div>
        {p.assetKind === '부동산' && (
          <div className={s.helperText}>
            🏠 부동산은 시가(실거래가, 감정평가)·공시가격 기준에 따라 평가액이 달라집니다.
          </div>
        )}
      </div>

      {/* 분할 증여 */}
      <div className={s.card}>
        <span className={s.cardLabel}>분할 증여 (선택, 최대 5명)</span>
        {p.recipients.map((r, i) => (
          <div key={i} className={s.recipientRow}>
            <select
              className={s.smallSelect}
              value={r.rel}
              onChange={e => {
                const next = [...p.recipients]
                next[i] = { ...next[i], rel: e.target.value as Relation }
                p.setRecipients(next)
              }}
            >
              {RELATIONS.map(rel => <option key={rel.key} value={rel.key}>{rel.label}</option>)}
            </select>
            <input
              className={s.smallNum}
              type="text"
              inputMode="numeric"
              value={commaInput(r.amount)}
              placeholder="금액"
              onChange={e => {
                const next = [...p.recipients]
                next[i] = { ...next[i], amount: parseAmount(e.target.value) }
                p.setRecipients(next)
              }}
            />
            <button className={s.removeBtn} onClick={() => p.setRecipients(p.recipients.filter((_, j) => j !== i))}>
              삭제
            </button>
          </div>
        ))}
        {p.recipients.length < 5 && (
          <button
            className={s.addBtn}
            onClick={() => p.setRecipients([...p.recipients, { rel: '성인자녀', amount: 50_000_000 }])}
          >
            + 수증자 추가 ({p.recipients.length}/5)
          </button>
        )}
        {splitTotal && (
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 10, fontSize: 13, color: 'var(--text)' }}>
            분할 증여 총 세금: <strong style={{ color: 'var(--accent)', fontFamily: 'Syne' }}>{formatKRW(splitTotal.totalTax)}</strong>
          </div>
        )}
      </div>

      {/* 결과 */}
      <div className={s.hero}>
        <div className={s.heroLead}>예상 증여세 (신고 세액공제 3% 반영)</div>
        <div className={s.heroNum}>{formatShortKRW(result.finalTax)}</div>
        <div className={s.heroSub}>= {formatKRW(result.finalTax)}</div>
        {result.finalTax === 0 && (
          <div className={s.heroSubAccent} style={{ color: '#3EFF9B' }}>✅ 공제 한도 내 — 증여세 부담 없음</div>
        )}
      </div>

      {/* 계산 과정 */}
      <button className={s.detailToggle} onClick={() => p.setShowDetail(!p.showDetail)}>
        {p.showDetail ? '▲' : '▼'} 계산 과정 보기
      </button>
      {p.showDetail && (
        <div className={s.detailBox}>
          <div className={s.detailRow}><span>증여 금액</span><span>{formatKRW(amount)}</span></div>
          <div className={s.detailRow}><span>10년 내 기존 증여</span><span>+ {formatKRW(prev)}</span></div>
          <div className={s.detailRow}><span>합산 증여액</span><span>{formatKRW(amount + prev)}</span></div>
          <div className={s.detailRow}><span>공제 한도 ({p.relation})</span><span>− {formatKRW(GIFT_DEDUCTION[p.relation])}</span></div>
          <hr className={s.detailDivider} />
          <div className={s.detailRow}><span>과세표준</span><span>{formatKRW(result.taxableBase)}</span></div>
          <div className={s.detailRow}><span>적용 세율</span><span>{(result.appliedRate * 100).toFixed(0)}%</span></div>
          <div className={s.detailRow}><span>누진공제</span><span>− {formatKRW(result.bracketDeduction)}</span></div>
          <div className={s.detailRow}><span>산출세액</span><span>{formatKRW(result.calculatedTax)}</span></div>
          <div className={s.detailRow}><span>신고세액공제 (3%)</span><span>− {formatKRW(result.filingDiscount)}</span></div>
          <hr className={s.detailDivider} />
          <div className={`${s.detailRow} ${s.detailFinal}`}><span>예상 납부세액</span><span>{formatKRW(result.finalTax)}</span></div>
        </div>
      )}

      {/* 주의 항목 */}
      <WarnList
        items={[
          prev > 0 && '🔔 10년 내 기존 증여액이 있어 합산되어 계산되었습니다.',
          p.assetKind === '부동산' && '🔔 부동산은 시가·공시가 기준에 따라 평가액이 달라집니다.',
          p.relation === '미성년자녀' && '🔔 미성년 자녀는 결혼·출산 공제(혼인 시 1억) 추가 적용 가능합니다.',
          amount + prev > GIFT_DEDUCTION[p.relation] && p.relation === '배우자' && '🔔 배우자 공제는 6억원으로 큰 편이지만, 추가 증여 시 합산 합산됨에 유의하세요.',
        ].filter(Boolean) as string[]}
      />
    </>
  )
}

// ───────────────────────── 상속세 탭 ─────────────────────────

interface InheritTabProps {
  totalAssetStr: string
  setTotalAssetStr: (v: string) => void
  hasSpouse: boolean
  setHasSpouse: (b: boolean) => void
  childCount: number
  setChildCount: (n: number) => void
  otherHeirCount: number
  setOtherHeirCount: (n: number) => void
  priorGiftStr: string
  setPriorGiftStr: (v: string) => void
  funeralStr: string
  setFuneralStr: (v: string) => void
  debtStr: string
  setDebtStr: (v: string) => void
  showDetail: boolean
  setShowDetail: (b: boolean) => void
}

function InheritTab(p: InheritTabProps) {
  const totalAsset = parseAmount(p.totalAssetStr)
  const priorGift = parseAmount(p.priorGiftStr)
  const funeral = parseAmount(p.funeralStr)
  const debt = parseAmount(p.debtStr)

  const result = useMemo(() => calcInheritanceTax({
    totalAsset, priorGift, funeral, debt,
    hasSpouse: p.hasSpouse, childCount: p.childCount, otherHeirCount: p.otherHeirCount,
  }), [totalAsset, priorGift, funeral, debt, p.hasSpouse, p.childCount, p.otherHeirCount])

  const heirCount = (p.hasSpouse ? 1 : 0) + p.childCount + p.otherHeirCount
  const perHeir = heirCount > 0 ? result.finalTax / heirCount : 0

  return (
    <>
      {/* 총재산 */}
      <div className={s.card}>
        <span className={s.cardLabel}>상속 예상 총재산</span>
        <div className={s.inputRow}>
          <input
            className={s.numInput}
            type="text"
            inputMode="numeric"
            value={commaInput(totalAsset)}
            onChange={e => p.setTotalAssetStr(parseAmount(e.target.value).toString())}
            placeholder="5,000,000,000"
          />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.pills}>
          {[500_000_000, 1_000_000_000, 3_000_000_000, 5_000_000_000, 10_000_000_000].map(v => (
            <button
              key={v}
              className={`${s.pill} ${totalAsset === v ? s.pillActive : ''}`}
              onClick={() => p.setTotalAssetStr(v.toString())}
            >
              {formatShortKRW(v)}
            </button>
          ))}
        </div>
        {totalAsset > 0 && <div className={s.helperText}>= {formatShortKRW(totalAsset)}</div>}
      </div>

      {/* 상속인 구성 */}
      <div className={s.card}>
        <span className={s.cardLabel}>상속인 구성</span>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>배우자 여부</div>
        <div className={s.toggleRow}>
          <button className={`${s.toggleBtn} ${p.hasSpouse ? s.toggleActive : ''}`} onClick={() => p.setHasSpouse(true)}>배우자 있음</button>
          <button className={`${s.toggleBtn} ${!p.hasSpouse ? s.toggleActive : ''}`} onClick={() => p.setHasSpouse(false)}>배우자 없음</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>자녀 수</div>
            <select
              className={s.selectInput}
              value={p.childCount}
              onChange={e => p.setChildCount(parseInt(e.target.value, 10))}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}명</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>기타 상속인</div>
            <input
              className={s.smallNum}
              type="number"
              min={0}
              value={p.otherHeirCount}
              onChange={e => p.setOtherHeirCount(Math.max(0, parseInt(e.target.value || '0', 10)))}
            />
          </div>
        </div>
      </div>

      {/* 사전 증여 */}
      <div className={s.card}>
        <span className={s.cardLabel}>10년 내 사전 증여 합산 (상속인 대상)</span>
        <div className={s.inputRow}>
          <input
            className={s.numInput}
            type="text"
            inputMode="numeric"
            value={commaInput(priorGift)}
            onChange={e => p.setPriorGiftStr(parseAmount(e.target.value).toString())}
            placeholder="없으면 0"
          />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.helperText}>
          사망 전 10년 이내 상속인에게 증여한 금액은 상속재산에 합산됩니다.
        </div>
      </div>

      {/* 채무·장례비 */}
      <div className={s.card}>
        <span className={s.cardLabel}>채무·공과금 차감</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>장례비용</div>
            <div className={s.inputRow}>
              <input
                className={s.numInput}
                type="text"
                inputMode="numeric"
                value={commaInput(funeral)}
                onChange={e => p.setFuneralStr(parseAmount(e.target.value).toString())}
                style={{ fontSize: 16 }}
              />
              <span className={s.unit}>원</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>채무액</div>
            <div className={s.inputRow}>
              <input
                className={s.numInput}
                type="text"
                inputMode="numeric"
                value={commaInput(debt)}
                onChange={e => p.setDebtStr(parseAmount(e.target.value).toString())}
                style={{ fontSize: 16 }}
              />
              <span className={s.unit}>원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className={s.hero}>
        <div className={s.heroLead}>예상 상속세 총액 (신고 세액공제 3% 반영)</div>
        <div className={s.heroNum}>{formatShortKRW(result.finalTax)}</div>
        <div className={s.heroSub}>= {formatKRW(result.finalTax)}</div>
        {heirCount > 0 && (
          <div className={s.heroSubAccent}>
            상속인 {heirCount}명 1인당 부담: {formatShortKRW(perHeir)}
          </div>
        )}
        {result.finalTax === 0 && (
          <div className={s.heroSubAccent} style={{ color: '#3EFF9B' }}>✅ 공제 한도 내 — 상속세 부담 없음</div>
        )}
      </div>

      {/* 계산 과정 */}
      <button className={s.detailToggle} onClick={() => p.setShowDetail(!p.showDetail)}>
        {p.showDetail ? '▲' : '▼'} 계산 과정 보기
      </button>
      {p.showDetail && (
        <div className={s.detailBox}>
          <div className={s.detailRow}><span>상속 총재산</span><span>{formatKRW(totalAsset)}</span></div>
          <div className={s.detailRow}><span>사전 증여 합산</span><span>+ {formatKRW(priorGift)}</span></div>
          <div className={s.detailRow}><span>채무</span><span>− {formatKRW(debt)}</span></div>
          <div className={s.detailRow}><span>장례비</span><span>− {formatKRW(funeral)}</span></div>
          <hr className={s.detailDivider} />
          <div className={s.detailRow}><span>과세가액</span><span>{formatKRW(result.taxableValue)}</span></div>
          {p.hasSpouse && <div className={s.detailRow}><span>배우자 공제</span><span>− {formatKRW(result.spouseDeduction)}</span></div>}
          <div className={s.detailRow}><span>일괄/인적공제</span><span>− {formatKRW(result.appliedDeduction)}</span></div>
          <hr className={s.detailDivider} />
          <div className={s.detailRow}><span>과세표준</span><span>{formatKRW(result.taxableBase)}</span></div>
          <div className={s.detailRow}><span>적용 세율</span><span>{(result.appliedRate * 100).toFixed(0)}%</span></div>
          <div className={s.detailRow}><span>누진공제</span><span>− {formatKRW(result.bracketDeduction)}</span></div>
          <div className={s.detailRow}><span>산출세액</span><span>{formatKRW(result.calculatedTax)}</span></div>
          <div className={s.detailRow}><span>신고세액공제 (3%)</span><span>− {formatKRW(result.filingDiscount)}</span></div>
          <hr className={s.detailDivider} />
          <div className={`${s.detailRow} ${s.detailFinal}`}><span>예상 납부세액</span><span>{formatKRW(result.finalTax)}</span></div>
        </div>
      )}

      {/* 배우자 안내 */}
      {p.hasSpouse && (
        <div className={s.explainCard}>
          💡 <strong>배우자 상속공제</strong> — 배우자가 실제 상속받은 금액 기준 최소 5억원 ~ 최대 30억원까지 공제됩니다.
          현재 적용된 배우자 공제: <strong style={{ color: 'var(--accent)' }}>{formatShortKRW(result.spouseDeduction)}</strong>
        </div>
      )}

      {/* 주의 항목 */}
      <WarnList
        items={[
          priorGift > 0 && '🔔 사전 증여액 10년 합산이 적용되었습니다.',
          totalAsset >= 10_000_000_000 && '🔔 30억 초과분은 50% 최고세율 적용 구간입니다.',
          totalAsset <= 500_000_000 && !p.hasSpouse && '🔔 일괄공제(5억) 범위 내로 상속세가 없을 가능성이 높습니다.',
          '🔔 금융재산공제(최대 2억), 동거주택공제(최대 6억) 등은 본 계산에 미반영되어 실제 부담이 더 낮을 수 있습니다.',
        ].filter(Boolean) as string[]}
      />
    </>
  )
}

// ───────────────────────── 비교 분석 탭 ─────────────────────────

interface CompareTabProps {
  giftAmount: number
  giftRelation: Relation
  prevGift: number
  totalAsset: number
  hasSpouse: boolean
  childCount: number
  assetKind: AssetKind
  scTotalStr: string
  setScTotalStr: (v: string) => void
  scChildCount: number
  setScChildCount: (n: number) => void
  scRounds: 1 | 2 | 3
  setScRounds: (n: 1 | 2 | 3) => void
}

function CompareTab(p: CompareTabProps) {
  // 증여세: 입력값 사용
  const giftResult = useMemo(
    () => calcGiftTax(p.giftAmount, p.giftRelation, p.prevGift),
    [p.giftAmount, p.giftRelation, p.prevGift],
  )

  // 상속세: 동일 금액을 상속한다고 가정
  const inheritResult = useMemo(
    () => calcInheritanceTax({
      totalAsset: p.giftAmount,
      priorGift: 0, funeral: 0, debt: 0,
      hasSpouse: p.hasSpouse, childCount: p.childCount, otherHeirCount: 0,
    }),
    [p.giftAmount, p.hasSpouse, p.childCount],
  )

  const giftAfter = p.giftAmount - giftResult.finalTax
  const inheritAfter = p.giftAmount - inheritResult.finalTax
  const giftBetter = giftResult.finalTax < inheritResult.finalTax
  const diff = Math.abs(giftResult.finalTax - inheritResult.finalTax)

  // 분할 증여 시뮬레이션
  const scTotal = parseAmount(p.scTotalStr)
  const scenarios = useMemo(() => calcSplitScenarios(scTotal, p.scChildCount, p.scRounds), [scTotal, p.scChildCount, p.scRounds])
  const bestIdx = scenarios.reduce((best, cur, i) => cur.totalTax < scenarios[best].totalTax ? i : best, 0)

  return (
    <>
      {/* 비교 대상 안내 */}
      <div className={s.explainCard}>
        💡 <strong>증여세 탭과 상속세 탭의 입력값을 기준으로 비교합니다.</strong><br />
        증여 금액 <strong style={{ color: 'var(--accent)' }}>{formatShortKRW(p.giftAmount)}</strong>를
        지금 <strong style={{ color: '#3EC8FF' }}>증여</strong>할 때 vs 같은 금액을 나중에 <strong style={{ color: '#FF8C3E' }}>상속</strong>할 때
      </div>

      {/* 최종 비교 히어로 */}
      <div className={s.hero}>
        <div className={s.heroLead}>현재 입력값 기준</div>
        <div className={s.heroNum} style={{ fontSize: 'clamp(22px, 4vw, 38px)' }}>
          {giftBetter ? '증여' : inheritResult.finalTax === giftResult.finalTax ? '동일' : '상속'}
          {giftResult.finalTax !== inheritResult.finalTax && '이 유리'}
        </div>
        <div className={s.heroSubAccent}>
          {diff === 0 ? '세금 부담이 동일합니다.' : `세금 차이 약 ${formatShortKRW(diff)}`}
        </div>
      </div>

      {/* 비교 카드 */}
      <div className={s.compareGrid}>
        <div className={`${s.compareCard} ${s.compareGift}`}>
          <div className={s.compareLabel}>지금 증여</div>
          <div className={s.compareValue}>{formatShortKRW(giftResult.finalTax)}</div>
          <div className={s.compareSub}>세후 이전 금액 {formatShortKRW(giftAfter)}</div>
          {giftBetter && <span className={s.winnerBadge}>✅ 유리</span>}
        </div>
        <div className={`${s.compareCard} ${s.compareInherit}`}>
          <div className={s.compareLabel}>나중 상속</div>
          <div className={s.compareValue}>{formatShortKRW(inheritResult.finalTax)}</div>
          <div className={s.compareSub}>세후 이전 금액 {formatShortKRW(inheritAfter)}</div>
          {!giftBetter && inheritResult.finalTax !== giftResult.finalTax && <span className={s.winnerBadge}>✅ 유리</span>}
        </div>
      </div>

      {/* 왜 차이가 나는지 */}
      <div className={s.explainCard}>
        <strong>왜 차이가 발생하나요?</strong>
        <ul>
          {p.hasSpouse && <li>배우자가 있어 상속 시 최소 5억원의 배우자 공제가 적용됩니다 (최대 30억).</li>}
          {p.giftAmount <= 500_000_000 && <li>금액이 5억원 이하라 상속 일괄공제 범위 안에 들어와 상속세가 0원이 될 수 있습니다.</li>}
          {p.childCount >= 2 && <li>자녀가 {p.childCount}명이라 분산 증여 시 각자 공제 한도(5천만원)를 활용해 절세 효과가 있습니다.</li>}
          {p.prevGift > 0 && <li>10년 내 기존 증여액 {formatShortKRW(p.prevGift)}이 합산되어 증여세 부담이 커집니다.</li>}
          {p.assetKind === '부동산' && <li>부동산은 평가 기준(시가/공시가)에 따라 결과가 크게 달라집니다.</li>}
          {p.giftAmount >= 3_000_000_000 && <li>30억 초과 구간은 양쪽 모두 50% 최고세율이 적용됩니다.</li>}
        </ul>
      </div>

      {/* 분할 증여 시뮬레이션 */}
      <div className={s.card}>
        <span className={s.cardLabel}>📊 분할 증여 시뮬레이션</span>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
          자녀에게 나눠서 증여하면 얼마나 달라질까요?
        </div>

        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, marginBottom: 6 }}>총 이전 금액</div>
        <div className={s.inputRow}>
          <input
            className={s.numInput}
            type="text"
            inputMode="numeric"
            value={commaInput(scTotal)}
            onChange={e => p.setScTotalStr(parseAmount(e.target.value).toString())}
            placeholder="200,000,000"
            style={{ fontSize: 18 }}
          />
          <span className={s.unit}>원</span>
        </div>

        <div className={s.scenarioRow}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>대상 자녀 수</div>
            <select
              className={s.selectInput}
              value={p.scChildCount}
              onChange={e => p.setScChildCount(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}명</option>)}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>증여 회차</div>
            <div className={s.pills}>
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  className={`${s.pill} ${p.scRounds === n ? s.pillActive : ''}`}
                  onClick={() => p.setScRounds(n as 1 | 2 | 3)}
                >
                  {n === 1 ? '한 번에' : n === 2 ? '10년 후 1회 더' : '10·20년 후 추가'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <table className={s.compareTable} style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>방식</th>
              <th style={{ textAlign: 'right' }}>총 증여세</th>
              <th style={{ textAlign: 'right' }}>1인당 세금</th>
              <th style={{ textAlign: 'right' }}>세후 수령</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((sc, i) => (
              <tr
                key={i}
                className={`${i === bestIdx ? s.bestRow : ''} ${sc.totalTax === 0 ? s.zeroTaxRow : ''}`}
              >
                <td>{sc.label}</td>
                <td className={s.numCell}>{formatShortKRW(sc.totalTax)}</td>
                <td className={s.numCell}>{formatShortKRW(sc.perPerson)}</td>
                <td className={s.numCell}>{formatShortKRW(scTotal - sc.totalTax)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={s.helperText}>
          💡 10년마다 성인 자녀 1인당 5천만원까지 비과세로 증여 가능합니다.
        </div>
      </div>

      {/* 체크 변수 */}
      <WarnList
        items={[
          p.prevGift > 0 && '🔔 10년 내 증여 이력이 있어 합산됩니다.',
          p.assetKind === '부동산' && '🔔 부동산은 평가 기준에 따라 세금이 달라집니다.',
          p.hasSpouse && '🔔 배우자 상속공제 적용 시 결과가 크게 달라집니다 (최대 30억).',
          '🔔 금융재산·동거주택 추가 공제 항목이 있을 수 있습니다.',
          '🔔 본 비교는 단순 참고용이며 실제 세무 의사결정은 세무사 상담 필수입니다.',
        ].filter(Boolean) as string[]}
      />
    </>
  )
}

// ───────────────────────── WarnList 컴포넌트 ─────────────────────────

function WarnList({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className={s.warnList}>
      <ul>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  )
}

// ───────────────────────── 계산 함수 ─────────────────────────

interface GiftResult {
  taxableBase: number
  appliedRate: number
  bracketDeduction: number
  calculatedTax: number
  filingDiscount: number
  finalTax: number
}

function calcGiftTax(amount: number, relation: Relation, prevGift: number): GiftResult {
  const total = amount + prevGift
  const deduction = GIFT_DEDUCTION[relation]
  const taxableBase = Math.max(0, total - deduction)

  // 이미 이전에 사용한 공제분 = min(prevGift, deduction)
  // 이전 분에 대해서는 이미 세금이 계산되었다고 가정하고, 이번 추가분의 한계세액 산정:
  // (현재 누진세 방식: 합산 과세표준에서 산출 후 기납부분 차감)
  const totalTax = calcProgressiveTax(taxableBase)
  const prevTaxBase = Math.max(0, prevGift - deduction)
  const prevTax = calcProgressiveTax(prevTaxBase)
  const calculatedTax = Math.max(0, totalTax - prevTax)

  // 적용 세율·누진공제 (현재 합산 표준 기준)
  let appliedRate = 0
  let bracketDeduction = 0
  for (const b of TAX_BRACKETS) {
    if (taxableBase > b.min) {
      appliedRate = b.rate
      bracketDeduction = b.deduction
    }
  }

  const filingDiscount = Math.round(calculatedTax * 0.03)
  const finalTax = Math.max(0, calculatedTax - filingDiscount)

  return { taxableBase, appliedRate, bracketDeduction, calculatedTax, filingDiscount, finalTax }
}

interface InheritResult {
  taxableValue: number
  spouseDeduction: number
  appliedDeduction: number
  taxableBase: number
  appliedRate: number
  bracketDeduction: number
  calculatedTax: number
  filingDiscount: number
  finalTax: number
}

function calcInheritanceTax(args: {
  totalAsset: number
  priorGift: number
  funeral: number
  debt: number
  hasSpouse: boolean
  childCount: number
  otherHeirCount: number
}): InheritResult {
  const { totalAsset, priorGift, funeral, debt, hasSpouse, childCount } = args

  // 과세가액 = 총재산 + 사전증여 - 채무 - 장례비
  const taxableValue = Math.max(0, totalAsset + priorGift - debt - funeral)

  // 일괄공제 vs (기초공제 2억 + 자녀 1인당 5천)
  const baseDeduction = 200_000_000
  const childDeduction = childCount * 50_000_000
  const personalDeduction = baseDeduction + childDeduction
  const lumpSum = 500_000_000
  const appliedDeduction = Math.max(personalDeduction, lumpSum)

  // 배우자 상속공제: max(5억, min(30억, 총재산 × 0.5))
  const spouseDeduction = hasSpouse
    ? Math.max(500_000_000, Math.min(3_000_000_000, totalAsset * 0.5))
    : 0

  const totalDeduction = appliedDeduction + spouseDeduction
  const taxableBase = Math.max(0, taxableValue - totalDeduction)

  const calculatedTax = calcProgressiveTax(taxableBase)

  let appliedRate = 0
  let bracketDeduction = 0
  for (const b of TAX_BRACKETS) {
    if (taxableBase > b.min) {
      appliedRate = b.rate
      bracketDeduction = b.deduction
    }
  }

  const filingDiscount = Math.round(calculatedTax * 0.03)
  const finalTax = Math.max(0, calculatedTax - filingDiscount)

  return { taxableValue, spouseDeduction, appliedDeduction, taxableBase, appliedRate, bracketDeduction, calculatedTax, filingDiscount, finalTax }
}

// 분할 증여 시나리오
function calcSplitScenarios(total: number, childCount: number, rounds: 1 | 2 | 3) {
  const scenarios: { label: string; totalTax: number; perPerson: number }[] = []

  // 1) 자녀 1명 1회
  {
    const tax = calcGiftTax(total, '성인자녀', 0).finalTax
    scenarios.push({ label: '자녀 1명에게 1회', totalTax: tax, perPerson: tax })
  }

  // 2) N명 분산 (1회)
  if (childCount >= 2) {
    const each = Math.floor(total / childCount)
    const tax = calcGiftTax(each, '성인자녀', 0).finalTax * childCount
    scenarios.push({ label: `자녀 ${childCount}명에게 분산 (1회)`, totalTax: tax, perPerson: tax / childCount })
  }

  // 3) N명 × 회차 분산 (10·20년 주기)
  if (rounds >= 2) {
    const each = Math.floor(total / (childCount * rounds))
    // 각 회차는 10년 주기 새 공제 → 합산되지 않음
    const taxPerRound = calcGiftTax(each, '성인자녀', 0).finalTax * childCount
    const totalTax = taxPerRound * rounds
    scenarios.push({
      label: `${childCount}명 × ${rounds}회 (10년 주기)`,
      totalTax,
      perPerson: childCount > 0 ? totalTax / childCount : 0,
    })
  }

  return scenarios
}
