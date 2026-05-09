'use client'

import Disclaimer from '@/components/Disclaimer'
import { useMemo, useState } from 'react'
import s from './inheritance.module.css'
import {
  RELATIONS,
  ASSET_KINDS,
  TAX_BRACKETS,
  calcGiftTax,
  calcInheritanceTax,
  calcInheritanceDistribution,
  simulateSpouseDeduction,
  estimatePropertyGift,
  estimateBurdenedGift,
  calcSplitScenarios,
  getSpouseLegalShare,
  getDeduction,
  formatKRW,
  formatShortKRW,
  parseAmount,
  commaInput,
  type Relation,
  type AssetKind,
} from './inheritanceUtils'

type TabKey = 'gift' | 'inherit' | 'heirs' | 'split' | 'compare'

const TABS: { key: TabKey; label: string; cls: string }[] = [
  { key: 'gift',    label: '증여세 계산',    cls: s.tabActive },
  { key: 'inherit', label: '상속세 계산',    cls: s.tabActiveInherit },
  { key: 'heirs',   label: '상속인별 분배',  cls: s.tabActiveHeirs },
  { key: 'split',   label: '분산 증여',      cls: s.tabActiveSplit },
  { key: 'compare', label: '비교 분석',      cls: s.tabActiveCompare },
]

export default function InheritanceClient() {
  const [tab, setTab] = useState<TabKey>('gift')

  // ── 증여 ──
  const [giftAmountStr, setGiftAmountStr] = useState('100000000')
  const [giftRelation, setGiftRelation] = useState<Relation>('성인자녀')
  const [prevGiftStr, setPrevGiftStr] = useState('0')
  const [assetKind, setAssetKind] = useState<AssetKind>('현금')
  const [showGiftDetail, setShowGiftDetail] = useState(false)

  // 부동산 / 부담부증여 (NEW)
  const [propertyMode, setPropertyMode] = useState<'none' | 'simple' | 'burdened'>('none')
  const [propertyValueStr, setPropertyValueStr] = useState('500000000')
  const [propertyShareStr, setPropertyShareStr] = useState('100')
  const [isAdjustedZone, setIsAdjustedZone] = useState(false)
  const [isMultiHomeReceiver, setIsMultiHomeReceiver] = useState(false)
  const [debtAssumedStr, setDebtAssumedStr] = useState('200000000')

  // ── 상속 ──
  const [totalAssetStr, setTotalAssetStr] = useState('5000000000')
  const [hasSpouse, setHasSpouse] = useState(true)
  const [childCount, setChildCount] = useState(2)
  const [otherHeirCount, setOtherHeirCount] = useState(0)
  const [priorGiftStr, setPriorGiftStr] = useState('0')
  const [funeralStr, setFuneralStr] = useState('5000000')
  const [debtStr, setDebtStr] = useState('0')
  const [showInheritDetail, setShowInheritDetail] = useState(false)
  // 강화 — 배우자 실제 상속분 + 금융재산 + 동거주택
  const [spouseActualStr, setSpouseActualStr] = useState('')
  const [financialAssetStr, setFinancialAssetStr] = useState('')
  const [cohabitHomeStr, setCohabitHomeStr] = useState('')

  // ── 상속인별 분배 ──
  const [parentsAlive, setParentsAlive] = useState(0)
  const [siblingsCount, setSiblingsCount] = useState(0)
  const [customRatios, setCustomRatios] = useState<{ [id: string]: number }>({})

  // ── 분산 증여 ──
  const [splitTotalStr, setSplitTotalStr] = useState('200000000')
  const [splitChildren, setSplitChildren] = useState(2)
  const [splitRounds, setSplitRounds] = useState<1 | 2 | 3>(1)

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="finance"
        related={[
          { href: '/tools/finance/salary', label: '연봉 실수령액' },
          { href: '/tools/finance/loan', label: '대출이자 계산기' },
          { href: '/tools/finance/compound', label: '복리 계산기' }
        ]}
      >
        본 계산기는 단순 참고용입니다.
      </Disclaimer>

      <div className={s.tabs}>
        {TABS.map(t => (
          <button key={t.key}
            className={`${s.tabBtn} ${tab === t.key ? t.cls : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'gift' && <GiftTab
        amountStr={giftAmountStr} setAmountStr={setGiftAmountStr}
        relation={giftRelation} setRelation={setGiftRelation}
        prevStr={prevGiftStr} setPrevStr={setPrevGiftStr}
        assetKind={assetKind} setAssetKind={setAssetKind}
        showDetail={showGiftDetail} setShowDetail={setShowGiftDetail}
        propertyMode={propertyMode} setPropertyMode={setPropertyMode}
        propertyValueStr={propertyValueStr} setPropertyValueStr={setPropertyValueStr}
        propertyShareStr={propertyShareStr} setPropertyShareStr={setPropertyShareStr}
        isAdjustedZone={isAdjustedZone} setIsAdjustedZone={setIsAdjustedZone}
        isMultiHomeReceiver={isMultiHomeReceiver} setIsMultiHomeReceiver={setIsMultiHomeReceiver}
        debtAssumedStr={debtAssumedStr} setDebtAssumedStr={setDebtAssumedStr}
      />}

      {tab === 'inherit' && <InheritTab
        totalAssetStr={totalAssetStr} setTotalAssetStr={setTotalAssetStr}
        hasSpouse={hasSpouse} setHasSpouse={setHasSpouse}
        childCount={childCount} setChildCount={setChildCount}
        otherHeirCount={otherHeirCount} setOtherHeirCount={setOtherHeirCount}
        priorGiftStr={priorGiftStr} setPriorGiftStr={setPriorGiftStr}
        funeralStr={funeralStr} setFuneralStr={setFuneralStr}
        debtStr={debtStr} setDebtStr={setDebtStr}
        showDetail={showInheritDetail} setShowDetail={setShowInheritDetail}
        spouseActualStr={spouseActualStr} setSpouseActualStr={setSpouseActualStr}
        financialAssetStr={financialAssetStr} setFinancialAssetStr={setFinancialAssetStr}
        cohabitHomeStr={cohabitHomeStr} setCohabitHomeStr={setCohabitHomeStr}
      />}

      {tab === 'heirs' && <HeirsTab
        totalAssetStr={totalAssetStr} setTotalAssetStr={setTotalAssetStr}
        hasSpouse={hasSpouse} setHasSpouse={setHasSpouse}
        childCount={childCount} setChildCount={setChildCount}
        parentsAlive={parentsAlive} setParentsAlive={setParentsAlive}
        siblingsCount={siblingsCount} setSiblingsCount={setSiblingsCount}
        customRatios={customRatios} setCustomRatios={setCustomRatios}
        priorGiftStr={priorGiftStr} debtStr={debtStr} funeralStr={funeralStr}
      />}

      {tab === 'split' && <SplitTab
        totalStr={splitTotalStr} setTotalStr={setSplitTotalStr}
        childCount={splitChildren} setChildCount={setSplitChildren}
        rounds={splitRounds} setRounds={setSplitRounds}
      />}

      {tab === 'compare' && <CompareTab
        giftAmount={parseAmount(giftAmountStr)}
        giftRelation={giftRelation}
        prevGift={parseAmount(prevGiftStr)}
        hasSpouse={hasSpouse}
        childCount={childCount}
        assetKind={assetKind}
      />}
    </div>
  )
}

// ─────────── GiftTab ───────────
interface GiftTabProps {
  amountStr: string
  setAmountStr: (v: string) => void
  relation: Relation
  setRelation: (r: Relation) => void
  prevStr: string
  setPrevStr: (v: string) => void
  assetKind: AssetKind
  setAssetKind: (a: AssetKind) => void
  showDetail: boolean
  setShowDetail: (b: boolean) => void
  propertyMode: 'none' | 'simple' | 'burdened'
  setPropertyMode: (m: 'none' | 'simple' | 'burdened') => void
  propertyValueStr: string
  setPropertyValueStr: (v: string) => void
  propertyShareStr: string
  setPropertyShareStr: (v: string) => void
  isAdjustedZone: boolean
  setIsAdjustedZone: (b: boolean) => void
  isMultiHomeReceiver: boolean
  setIsMultiHomeReceiver: (b: boolean) => void
  debtAssumedStr: string
  setDebtAssumedStr: (v: string) => void
}

function GiftTab(p: GiftTabProps) {
  const amount = parseAmount(p.amountStr)
  const prev = parseAmount(p.prevStr)
  const isSkipGen = p.relation === '손자녀'
  const result = useMemo(() => calcGiftTax(amount, p.relation, prev, isSkipGen),
    [amount, p.relation, prev, isSkipGen])

  // 부동산 단순 추정
  const propertyEst = useMemo(() => {
    if (p.propertyMode !== 'simple') return null
    return estimatePropertyGift(
      parseAmount(p.propertyValueStr),
      parseFloat(p.propertyShareStr) || 100,
      p.isAdjustedZone,
      p.isMultiHomeReceiver,
      p.relation,
      prev,
    )
  }, [p.propertyMode, p.propertyValueStr, p.propertyShareStr, p.isAdjustedZone, p.isMultiHomeReceiver, p.relation, prev])

  // 부담부증여 단순 분리
  const burdenedEst = useMemo(() => {
    if (p.propertyMode !== 'burdened') return null
    return estimateBurdenedGift(
      parseAmount(p.propertyValueStr),
      parseAmount(p.debtAssumedStr),
      p.relation,
      prev,
    )
  }, [p.propertyMode, p.propertyValueStr, p.debtAssumedStr, p.relation, prev])

  return (
    <>
      {/* 증여 금액 */}
      <div className={s.card}>
        <span className={s.cardLabel}>증여 금액</span>
        <div className={s.inputRow}>
          <input className={s.numInput} type="text" inputMode="numeric"
            value={commaInput(amount)}
            onChange={e => p.setAmountStr(parseAmount(e.target.value).toString())}
            placeholder="100,000,000" />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.pills}>
          {[10_000_000, 50_000_000, 100_000_000, 500_000_000, 1_000_000_000].map(v => (
            <button key={v}
              className={`${s.pill} ${amount === v ? s.pillActive : ''}`}
              onClick={() => p.setAmountStr(v.toString())}>
              {formatShortKRW(v)}
            </button>
          ))}
        </div>
        {amount > 0 && <div className={s.helperText}>= {formatShortKRW(amount)}</div>}
      </div>

      {/* 관계 (확장: 9종) */}
      <div className={s.card}>
        <span className={s.cardLabel}>받는 사람 (수증자) 관계</span>
        <div className={s.relGrid}>
          {RELATIONS.map(r => (
            <button key={r.key}
              className={`${s.relBtn} ${s[r.cls]} ${p.relation === r.key ? s.relActive : ''}`}
              onClick={() => p.setRelation(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
        <div className={s.helperText}>
          공제 한도: <strong style={{ color: 'var(--text)' }}>{formatShortKRW(getDeduction(p.relation))}</strong> (10년간 합산)
          {RELATIONS.find(r => r.key === p.relation)?.note && (
            <span style={{ color: '#FF8C3E', marginLeft: 8 }}>· {RELATIONS.find(r => r.key === p.relation)?.note}</span>
          )}
        </div>
      </div>

      {/* 10년 내 기존 증여액 */}
      <div className={s.card}>
        <span className={s.cardLabel}>10년 내 동일인 기존 증여액</span>
        <div className={s.inputRow}>
          <input className={s.numInput} type="text" inputMode="numeric"
            value={commaInput(prev)}
            onChange={e => p.setPrevStr(parseAmount(e.target.value).toString())}
            placeholder="없으면 0" />
          <span className={s.unit}>원</span>
        </div>
      </div>

      {/* 재산 종류 */}
      <div className={s.card}>
        <span className={s.cardLabel}>재산 종류</span>
        <div className={s.pills}>
          {ASSET_KINDS.map(k => (
            <button key={k}
              className={`${s.pill} ${p.assetKind === k ? s.pillActive : ''}`}
              onClick={() => p.setAssetKind(k)}>
              {k === '현금' ? '💵 현금·예금' : k === '주식' ? '📈 주식·펀드' : k === '부동산' ? '🏠 부동산' : '📦 기타'}
            </button>
          ))}
        </div>
        {p.assetKind === '부동산' && (
          <div className={s.helperText}>
            🏠 부동산은 시가·공시가격 기준에 따라 평가액이 다름. 아래에서 단순 추정 보기 가능.
          </div>
        )}
      </div>

      {/* 결과 (현금/주식/기타) */}
      <div className={s.hero}>
        <div className={s.heroLead}>예상 증여세 (신고 세액공제 3% 반영)</div>
        <div className={s.heroNum}>{formatShortKRW(result.finalTax)}</div>
        <div className={s.heroSub}>= {formatKRW(result.finalTax)}</div>
        {result.isSkipGeneration && result.surchargeAmount && result.surchargeAmount > 0 && (
          <div className={s.heroSubAccent} style={{ color: '#FF8C3E' }}>
            ⚠️ 세대생략 가산 30% (+{formatShortKRW(result.surchargeAmount)})
          </div>
        )}
        {result.finalTax === 0 && (
          <div className={s.heroSubAccent} style={{ color: '#3EFF9B' }}>✅ 공제 한도 내 — 증여세 부담 없음</div>
        )}
      </div>

      <button className={s.detailToggle} onClick={() => p.setShowDetail(!p.showDetail)}>
        {p.showDetail ? '▲' : '▼'} 계산 과정 보기
      </button>
      {p.showDetail && (
        <div className={s.detailBox}>
          <div className={s.detailRow}><span>증여 금액</span><span>{formatKRW(amount)}</span></div>
          <div className={s.detailRow}><span>10년 내 기존 증여</span><span>+ {formatKRW(prev)}</span></div>
          <div className={s.detailRow}><span>합산 증여액</span><span>{formatKRW(amount + prev)}</span></div>
          <div className={s.detailRow}><span>공제 한도 ({p.relation})</span><span>− {formatKRW(getDeduction(p.relation))}</span></div>
          <hr className={s.detailDivider} />
          <div className={s.detailRow}><span>과세표준</span><span>{formatKRW(result.taxableBase)}</span></div>
          <div className={s.detailRow}><span>적용 세율</span><span>{(result.appliedRate * 100).toFixed(0)}%</span></div>
          <div className={s.detailRow}><span>누진공제</span><span>− {formatKRW(result.bracketDeduction)}</span></div>
          {result.isSkipGeneration && result.surchargeAmount && result.surchargeAmount > 0 && (
            <div className={s.detailRow}><span>세대생략 가산 (30%)</span><span>+ {formatKRW(result.surchargeAmount)}</span></div>
          )}
          <div className={s.detailRow}><span>산출세액</span><span>{formatKRW(result.calculatedTax)}</span></div>
          <div className={s.detailRow}><span>신고세액공제 (3%)</span><span>− {formatKRW(result.filingDiscount)}</span></div>
          <hr className={s.detailDivider} />
          <div className={`${s.detailRow} ${s.detailFinal}`}><span>예상 납부세액</span><span>{formatKRW(result.finalTax)}</span></div>
        </div>
      )}

      {/* ─── 부동산 단순 추정 (NEW) ─── */}
      <div className={s.card}>
        <span className={s.cardLabel}>🏠 부동산 증여 (단순 추정)</span>
        <div className={s.optionRow3}>
          <button className={`${s.optionBtn} ${p.propertyMode === 'none' ? s.optionActive : ''}`}
            onClick={() => p.setPropertyMode('none')}>사용 안 함</button>
          <button className={`${s.optionBtn} ${p.propertyMode === 'simple' ? s.optionActive : ''}`}
            onClick={() => p.setPropertyMode('simple')}>일반 부동산 증여</button>
          <button className={`${s.optionBtn} ${p.propertyMode === 'burdened' ? s.optionActive : ''}`}
            onClick={() => p.setPropertyMode('burdened')}>부담부증여 (전세·대출)</button>
        </div>

        {p.propertyMode === 'simple' && (
          <div style={{ marginTop: 12 }}>
            <div className={s.twoCol}>
              <div>
                <span className={s.cardLabel}>부동산 평가액</span>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="text" inputMode="numeric"
                    value={commaInput(parseAmount(p.propertyValueStr))}
                    onChange={e => p.setPropertyValueStr(parseAmount(e.target.value).toString())} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.cardLabel}>증여 지분 (%)</span>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="number" inputMode="numeric"
                    value={p.propertyShareStr}
                    onChange={e => p.setPropertyShareStr(e.target.value)} />
                  <span className={s.unit}>%</span>
                </div>
              </div>
            </div>
            <div className={s.checkRow}>
              <input type="checkbox" checked={p.isAdjustedZone}
                onChange={e => p.setIsAdjustedZone(e.target.checked)} />
              조정대상지역
            </div>
            <div className={s.checkRow}>
              <input type="checkbox" checked={p.isMultiHomeReceiver}
                onChange={e => p.setIsMultiHomeReceiver(e.target.checked)} />
              수증자 다주택자
            </div>

            {propertyEst && (
              <div style={{ marginTop: 14 }}>
                <div className={s.metrics}>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>증여 평가액</div>
                    <div className={s.metricValue}>{formatShortKRW(propertyEst.giftValue)}</div>
                  </div>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>증여세 (단순)</div>
                    <div className={`${s.metricValue} ${s.metricValueAccent}`}>{formatShortKRW(propertyEst.giftTax)}</div>
                  </div>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>취득세 ({(propertyEst.acquisitionTaxRate * 100).toFixed(1)}%)</div>
                    <div className={`${s.metricValue} ${s.metricValueRed}`}>{formatShortKRW(propertyEst.acquisitionTax)}</div>
                  </div>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>총 추가 부담</div>
                    <div className={s.metricValue}>{formatShortKRW(propertyEst.giftTax + propertyEst.acquisitionTax)}</div>
                  </div>
                </div>

                <div className={s.cautionBox} style={{ marginTop: 12 }}>
                  <strong>⚠️ 본 도구는 증여세·취득세만 단순 추정:</strong>
                  <ul>
                    {propertyEst.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {p.propertyMode === 'burdened' && (
          <div style={{ marginTop: 12 }}>
            <div className={s.twoCol}>
              <div>
                <span className={s.cardLabel}>부동산 평가액</span>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="text" inputMode="numeric"
                    value={commaInput(parseAmount(p.propertyValueStr))}
                    onChange={e => p.setPropertyValueStr(parseAmount(e.target.value).toString())} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
              <div>
                <span className={s.cardLabel}>인수 채무 (전세 + 대출)</span>
                <div className={s.inputRow}>
                  <input className={s.numInput} type="text" inputMode="numeric"
                    value={commaInput(parseAmount(p.debtAssumedStr))}
                    onChange={e => p.setDebtAssumedStr(parseAmount(e.target.value).toString())} />
                  <span className={s.unit}>원</span>
                </div>
              </div>
            </div>

            {burdenedEst && (
              <div style={{ marginTop: 14 }}>
                <div className={s.metrics}>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>증여 부분 (수증자)</div>
                    <div className={`${s.metricValue} ${s.metricValueAccent}`}>{formatShortKRW(burdenedEst.giftPortion)}</div>
                  </div>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>양도 부분 (증여자)</div>
                    <div className={`${s.metricValue} ${s.metricValueRed}`}>{formatShortKRW(burdenedEst.transferPortion)}</div>
                  </div>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>증여세 (단순)</div>
                    <div className={s.metricValue}>{formatShortKRW(burdenedEst.giftTaxOnly)}</div>
                  </div>
                  <div className={s.metric}>
                    <div className={s.metricLabel}>양도세 (별도)</div>
                    <div className={s.metricValue} style={{ color: '#FF6B6B', fontSize: 14 }}>본 도구 미반영</div>
                  </div>
                </div>

                <div className={s.warnBox} style={{ marginTop: 12 }}>
                  <strong>⚠️ 부담부증여는 가장 복잡한 세무 영역 중 하나입니다:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: 'var(--muted)' }}>
                    {burdenedEst.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 주의 항목 */}
      <WarnList items={[
        prev > 0 && '🔔 10년 내 기존 증여액이 있어 합산되어 계산되었습니다.',
        p.assetKind === '부동산' && p.propertyMode === 'none' && '🔔 부동산은 시가·공시가 기준에 따라 평가액이 달라집니다 — 위 「부동산 증여」 모드에서 단순 추정 가능.',
        p.relation === '미성년자녀' && '🔔 미성년 자녀는 결혼·출산 공제(혼인 시 1억) 추가 적용 가능.',
        p.relation === '손자녀' && '🔔 세대생략 증여는 30% 가산세 — 부모 살아 계신 경우 세무사 상담 권장.',
      ].filter(Boolean) as string[]} />
    </>
  )
}

// ─────────── InheritTab ───────────
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
  spouseActualStr: string
  setSpouseActualStr: (v: string) => void
  financialAssetStr: string
  setFinancialAssetStr: (v: string) => void
  cohabitHomeStr: string
  setCohabitHomeStr: (v: string) => void
}

function InheritTab(p: InheritTabProps) {
  const totalAsset = parseAmount(p.totalAssetStr)
  const priorGift = parseAmount(p.priorGiftStr)
  const funeral = parseAmount(p.funeralStr)
  const debt = parseAmount(p.debtStr)
  const spouseActual = parseAmount(p.spouseActualStr)
  const financialAsset = parseAmount(p.financialAssetStr)
  const cohabitHome = parseAmount(p.cohabitHomeStr)

  const result = useMemo(() => calcInheritanceTax({
    totalAsset, priorGift, funeral, debt,
    hasSpouse: p.hasSpouse, childCount: p.childCount, otherHeirCount: p.otherHeirCount,
    spouseActualShare: spouseActual > 0 ? spouseActual : undefined,
    financialAsset: financialAsset > 0 ? financialAsset : undefined,
    cohabitHomeValue: cohabitHome > 0 ? cohabitHome : undefined,
  }), [totalAsset, priorGift, funeral, debt, p.hasSpouse, p.childCount, p.otherHeirCount, spouseActual, financialAsset, cohabitHome])

  // 배우자 시뮬 표
  const spouseSim = useMemo(() => {
    if (!p.hasSpouse || totalAsset <= 0) return []
    return simulateSpouseDeduction(totalAsset, p.childCount, debt, funeral, financialAsset)
  }, [p.hasSpouse, totalAsset, p.childCount, debt, funeral, financialAsset])

  return (
    <>
      <div className={s.card}>
        <span className={s.cardLabel}>상속 예상 총재산</span>
        <div className={s.inputRow}>
          <input className={s.numInput} type="text" inputMode="numeric"
            value={commaInput(totalAsset)}
            onChange={e => p.setTotalAssetStr(parseAmount(e.target.value).toString())}
            placeholder="5,000,000,000" />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.pills}>
          {[500_000_000, 1_000_000_000, 3_000_000_000, 5_000_000_000, 10_000_000_000].map(v => (
            <button key={v}
              className={`${s.pill} ${totalAsset === v ? s.pillActive : ''}`}
              onClick={() => p.setTotalAssetStr(v.toString())}>
              {formatShortKRW(v)}
            </button>
          ))}
        </div>
        {totalAsset > 0 && <div className={s.helperText}>= {formatShortKRW(totalAsset)}</div>}
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>상속인 구성</span>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>배우자 여부</div>
        <div className={s.toggleRow}>
          <button className={`${s.toggleBtn} ${p.hasSpouse ? s.toggleActive : ''}`} onClick={() => p.setHasSpouse(true)}>배우자 있음</button>
          <button className={`${s.toggleBtn} ${!p.hasSpouse ? s.toggleActive : ''}`} onClick={() => p.setHasSpouse(false)}>배우자 없음</button>
        </div>

        <div className={s.twoCol} style={{ marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>자녀 수</div>
            <select className={s.selectInput} value={p.childCount}
              onChange={e => p.setChildCount(parseInt(e.target.value, 10))}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}명</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>기타 상속인</div>
            <input className={s.numInput} type="number" min={0} style={{ fontSize: 16 }}
              value={p.otherHeirCount}
              onChange={e => p.setOtherHeirCount(Math.max(0, parseInt(e.target.value || '0', 10)))} />
          </div>
        </div>
      </div>

      {/* 강화된 공제 입력 (NEW) */}
      <div className={s.card}>
        <span className={s.cardLabel}>추가 공제 항목 (선택)</span>
        <div className={s.twoCol}>
          {p.hasSpouse && (
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>배우자 실제 상속분 (선택)</div>
              <div className={s.inputRow}>
                <input className={s.numInput} type="text" inputMode="numeric" style={{ fontSize: 16 }}
                  value={commaInput(spouseActual)}
                  onChange={e => p.setSpouseActualStr(parseAmount(e.target.value).toString())}
                  placeholder="비우면 법정한도 자동" />
                <span className={s.unit}>원</span>
              </div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>금융재산 (20% 공제, 최대 2억)</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="text" inputMode="numeric" style={{ fontSize: 16 }}
                value={commaInput(financialAsset)}
                onChange={e => p.setFinancialAssetStr(parseAmount(e.target.value).toString())}
                placeholder="0" />
              <span className={s.unit}>원</span>
            </div>
          </div>
        </div>
        <div className={s.twoCol} style={{ marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>동거주택 가액 (10년 동거 + 1주택 등 조건 충족 시)</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="text" inputMode="numeric" style={{ fontSize: 16 }}
                value={commaInput(cohabitHome)}
                onChange={e => p.setCohabitHomeStr(parseAmount(e.target.value).toString())}
                placeholder="0 (조건 미충족 시)" />
              <span className={s.unit}>원</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>10년 내 사전 증여 합산 (상속인 대상)</span>
        <div className={s.inputRow}>
          <input className={s.numInput} type="text" inputMode="numeric"
            value={commaInput(priorGift)}
            onChange={e => p.setPriorGiftStr(parseAmount(e.target.value).toString())}
            placeholder="없으면 0" />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.helperText}>
          사망 전 10년 이내 상속인에게 증여한 금액은 상속재산에 합산. 비상속인은 5년 이내.
        </div>
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>채무·공과금 차감</span>
        <div className={s.twoCol}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>장례비용</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="text" inputMode="numeric" style={{ fontSize: 16 }}
                value={commaInput(funeral)}
                onChange={e => p.setFuneralStr(parseAmount(e.target.value).toString())} />
              <span className={s.unit}>원</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>채무액</div>
            <div className={s.inputRow}>
              <input className={s.numInput} type="text" inputMode="numeric" style={{ fontSize: 16 }}
                value={commaInput(debt)}
                onChange={e => p.setDebtStr(parseAmount(e.target.value).toString())} />
              <span className={s.unit}>원</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.hero}>
        <div className={s.heroLead}>예상 상속세 총액 (신고 세액공제 3% 반영)</div>
        <div className={s.heroNum}>{formatShortKRW(result.finalTax)}</div>
        <div className={s.heroSub}>= {formatKRW(result.finalTax)}</div>
        {result.finalTax === 0 && (
          <div className={s.heroSubAccent} style={{ color: '#3EFF9B' }}>✅ 공제 한도 내 — 상속세 부담 없음</div>
        )}
      </div>

      {/* ★ 배우자 상속공제 정량 시뮬 (NEW) ★ */}
      {p.hasSpouse && spouseSim.length > 0 && (
        <div className={s.card}>
          <span className={s.cardLabel}>📊 배우자 상속공제 정량 시뮬 — 실제 상속분에 따른 차이</span>
          <div className={s.spouseSimTable}>
            <div className={`${s.spouseSimRow} ${s.headerRow}`}>
              <span>배우자 실제 상속분</span>
              <span>적용 공제</span>
              <span>과세표준</span>
              <span>상속세</span>
            </div>
            {spouseSim.map((row, i) => {
              const isOptimal = i > 0 && row.inheritanceTax === Math.min(...spouseSim.map(r => r.inheritanceTax))
              return (
                <div key={i} className={`${s.spouseSimRow} ${isOptimal ? s.spouseSimRowOptimal : ''}`}>
                  <span>{row.actualShare === 0 ? '0원 (포기)' : formatShortKRW(row.actualShare)}{isOptimal && ' ★'}</span>
                  <span>{formatShortKRW(row.appliedDeduction)}</span>
                  <span>{formatShortKRW(row.taxableBase)}</span>
                  <span style={{ color: row.inheritanceTax === 0 ? '#3EFF9B' : 'var(--text)' }}>
                    {formatShortKRW(row.inheritanceTax)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className={s.helperText} style={{ marginTop: 10 }}>
            ※ 법정한도(배우자 비율 × 총재산) = <strong style={{ color: 'var(--text)' }}>{formatShortKRW(result.spouseLegalLimit)}</strong>.
            법정한도까지 공제 효과 최대, 그 이상 받아도 추가 공제 X.
          </div>
          <div className={s.cautionBox} style={{ marginTop: 10 }}>
            <strong>⚠️ 주의:</strong>{' '}
            <ul>
              <li>배우자 사망 시 2차 상속세 발생 (이중과세)</li>
              <li>자녀에게 분배가 장기적으로 유리할 수 있음</li>
              <li>가족 상황·자녀 나이·건강 종합 고려</li>
              <li>본 시뮬은 단순화된 가정 — 세무사·변호사 상담 필수</li>
            </ul>
          </div>
        </div>
      )}

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
          {result.financialDeduction > 0 && (
            <div className={s.detailRow}><span>금융재산공제 (20%, 최대 2억)</span><span>− {formatKRW(result.financialDeduction)}</span></div>
          )}
          {result.homeDeduction > 0 && (
            <div className={s.detailRow}><span>동거주택공제 (최대 6억)</span><span>− {formatKRW(result.homeDeduction)}</span></div>
          )}
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

      <WarnList items={[
        priorGift > 0 && '🔔 사전 증여액 10년 합산 적용.',
        totalAsset >= 10_000_000_000 && '🔔 30억 초과분은 50% 최고세율 구간.',
        totalAsset <= 500_000_000 && !p.hasSpouse && '🔔 일괄공제(5억) 범위 내로 상속세 0 가능성.',
        '🔔 본 도구는 단순 참고용 — 실제는 부동산 평가·기타 공제·신고 시점에 따라 차이.',
      ].filter(Boolean) as string[]} />
    </>
  )
}

// ─────────── HeirsTab (NEW) ───────────
interface HeirsTabProps {
  totalAssetStr: string
  setTotalAssetStr: (v: string) => void
  hasSpouse: boolean
  setHasSpouse: (b: boolean) => void
  childCount: number
  setChildCount: (n: number) => void
  parentsAlive: number
  setParentsAlive: (n: number) => void
  siblingsCount: number
  setSiblingsCount: (n: number) => void
  customRatios: { [id: string]: number }
  setCustomRatios: (r: { [id: string]: number }) => void
  priorGiftStr: string
  debtStr: string
  funeralStr: string
}

function HeirsTab(p: HeirsTabProps) {
  const totalAsset = parseAmount(p.totalAssetStr)
  const priorGift = parseAmount(p.priorGiftStr)
  const debt = parseAmount(p.debtStr)
  const funeral = parseAmount(p.funeralStr)

  // 상속세 (탭2와 같은 입력 사용)
  const taxResult = useMemo(() => calcInheritanceTax({
    totalAsset, priorGift, funeral, debt,
    hasSpouse: p.hasSpouse, childCount: p.childCount, otherHeirCount: 0,
  }), [totalAsset, priorGift, funeral, debt, p.hasSpouse, p.childCount])

  const distribution = useMemo(() => calcInheritanceDistribution({
    totalEstate: totalAsset,
    totalInheritanceTax: taxResult.finalTax,
    hasSpouse: p.hasSpouse,
    childrenCount: p.childCount,
    parentsAlive: p.parentsAlive,
    siblingsCount: p.siblingsCount,
    customRatios: p.customRatios,
  }), [totalAsset, taxResult.finalTax, p.hasSpouse, p.childCount, p.parentsAlive, p.siblingsCount, p.customRatios])

  const totalActualRatio = distribution.heirs.reduce((s, h) => s + h.actualRatio, 0)

  return (
    <>
      <div className={s.infoBox}>
        💡 <strong>법정상속분 자동 계산</strong> + 협의 분할(실제 비율) 입력 가능. 각 상속인이 받는 금액·세금 부담·세후 취득을 한 번에 확인.
      </div>

      {/* 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>상속 총재산</span>
        <div className={s.inputRow}>
          <input className={s.numInput} type="text" inputMode="numeric"
            value={commaInput(totalAsset)}
            onChange={e => p.setTotalAssetStr(parseAmount(e.target.value).toString())} />
          <span className={s.unit}>원</span>
        </div>
        {totalAsset > 0 && <div className={s.helperText}>= {formatShortKRW(totalAsset)}</div>}
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>가족 구성</span>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>배우자</div>
        <div className={s.toggleRow}>
          <button className={`${s.toggleBtn} ${p.hasSpouse ? s.toggleActive : ''}`} onClick={() => p.setHasSpouse(true)}>있음</button>
          <button className={`${s.toggleBtn} ${!p.hasSpouse ? s.toggleActive : ''}`} onClick={() => p.setHasSpouse(false)}>없음</button>
        </div>

        <div className={s.threeCol} style={{ marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>자녀 수</div>
            <select className={s.selectInput} value={p.childCount}
              onChange={e => p.setChildCount(parseInt(e.target.value, 10))}>
              {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}명</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>부모 생존 (자녀 0일 때)</div>
            <select className={s.selectInput} value={p.parentsAlive}
              onChange={e => p.setParentsAlive(parseInt(e.target.value, 10))}
              disabled={p.childCount > 0}>
              {[0, 1, 2].map(n => <option key={n} value={n}>{n}명</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>형제자매 (배·자·부 모두 X)</div>
            <select className={s.selectInput} value={p.siblingsCount}
              onChange={e => p.setSiblingsCount(parseInt(e.target.value, 10))}
              disabled={p.hasSpouse || p.childCount > 0 || p.parentsAlive > 0}>
              {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}명</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 상속세 표시 */}
      {totalAsset > 0 && (
        <div className={s.metrics}>
          <div className={s.metric}>
            <div className={s.metricLabel}>총 상속재산</div>
            <div className={s.metricValue}>{formatShortKRW(totalAsset)}</div>
          </div>
          <div className={s.metric}>
            <div className={s.metricLabel}>예상 상속세 (총액)</div>
            <div className={`${s.metricValue} ${s.metricValueRed}`}>{formatShortKRW(taxResult.finalTax)}</div>
          </div>
        </div>
      )}

      {/* 결과 표 */}
      {distribution.noHeir ? (
        <div className={s.warnBox}>
          ⚠️ 상속인이 없습니다. 배우자/자녀/부모/형제자매 중 하나는 입력해주세요.
        </div>
      ) : distribution.heirs.length > 0 && totalAsset > 0 && (
        <>
          <div className={`${s.hero} ${s.heroGold}`}>
            <div className={s.heroLead}>법정상속분 자동 분배 (협의 분할 가능)</div>
            <div className={`${s.heroNum} ${s.heroNumGold}`} style={{ fontSize: 'clamp(20px, 4vw, 30px)' }}>
              상속인 {distribution.heirs.length}명
            </div>
            <div className={s.heroSub}>
              {p.hasSpouse && '배우자 + '}{p.childCount > 0 && `자녀 ${p.childCount}명 `}
              {!p.hasSpouse && p.childCount === 0 && p.parentsAlive > 0 && `부모 ${p.parentsAlive}명 `}
              {!p.hasSpouse && p.childCount === 0 && p.parentsAlive === 0 && p.siblingsCount > 0 && `형제자매 ${p.siblingsCount}명`}
            </div>
          </div>

          <div className={s.card}>
            <span className={s.cardLabel}>법정상속분 + 협의 분할 시뮬</span>
            <div className={s.heirsTableWrap}>
              <table className={s.heirsTable}>
                <thead>
                  <tr>
                    <th>상속인</th>
                    <th>법정 비율</th>
                    <th>법정 금액</th>
                    <th>실제 비율 (협의)</th>
                    <th>실제 금액</th>
                    <th>세금 부담</th>
                    <th>세후 취득</th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.heirs.map(h => (
                    <tr key={h.id}>
                      <td>{h.name}</td>
                      <td>{(h.legalShare * 100).toFixed(1)}%</td>
                      <td>{formatShortKRW(h.legalShareAmount)}</td>
                      <td>
                        <input className={s.heirRatioInput} type="number" step="1" min={0} max={100}
                          value={(h.actualRatio * 100).toFixed(1)}
                          onChange={e => {
                            const v = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                            p.setCustomRatios({ ...p.customRatios, [h.id]: v / 100 })
                          }} />%
                      </td>
                      <td style={{ color: 'var(--accent)' }}>{formatShortKRW(h.actualAmount)}</td>
                      <td style={{ color: '#FF6B6B' }}>−{formatShortKRW(h.taxBurden)}</td>
                      <td style={{ color: '#3EFF9B' }}>{formatShortKRW(h.afterTax)}</td>
                    </tr>
                  ))}
                  <tr className={s.totalRow}>
                    <td>합계</td>
                    <td>100%</td>
                    <td>{formatShortKRW(totalAsset)}</td>
                    <td>{(totalActualRatio * 100).toFixed(1)}%</td>
                    <td>{formatShortKRW(distribution.heirs.reduce((s, h) => s + h.actualAmount, 0))}</td>
                    <td>{formatShortKRW(taxResult.finalTax)}</td>
                    <td>{formatShortKRW(distribution.heirs.reduce((s, h) => s + h.afterTax, 0))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {Math.abs(totalActualRatio - 1.0) > 0.01 && (
              <div className={s.warnBox} style={{ marginTop: 12 }}>
                <strong>⚠️ 실제 비율 합계가 100%가 아닙니다 ({(totalActualRatio * 100).toFixed(1)}%).</strong>{' '}
                협의 분할은 합계 100%여야 합니다.
              </div>
            )}
          </div>

          {/* 유류분 안내 */}
          <div className={s.card}>
            <span className={s.cardLabel}>⚖️ 유류분 (법정상속분의 1/2 또는 1/3)</span>
            <div className={s.heirsTableWrap}>
              <table className={s.heirsTable} style={{ minWidth: 480 }}>
                <thead>
                  <tr>
                    <th>상속인</th>
                    <th>유류분 비율</th>
                    <th>유류분 금액</th>
                    <th>유류분 침해 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.heirs.map(h => {
                    const violated = h.actualAmount < h.legalReserveAmount
                    return (
                      <tr key={h.id}>
                        <td>{h.name}</td>
                        <td>{(h.legalReserveRatio * 100).toFixed(1)}%</td>
                        <td>{formatShortKRW(h.legalReserveAmount)}</td>
                        <td style={{ color: violated ? '#FF6B6B' : '#3EFF9B' }}>
                          {violated ? '⚠️ 침해 가능' : '✅ 안전'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className={s.cautionBox} style={{ marginTop: 12 }}>
              <strong>유류분이란?</strong>{' '}
              유언으로도 침해할 수 없는 상속인의 최소 권리 (법정상속분의 1/2 또는 1/3).
              <ul>
                <li>배우자·직계비속(자녀): 법정상속분 × 1/2</li>
                <li>부모·형제자매: 법정상속분 × 1/3</li>
                <li>유류분 침해 시 청구권 행사 가능 — 분쟁 가능</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* 법정상속분 가이드 표 */}
      <div className={s.card}>
        <span className={s.cardLabel}>📚 법정상속분 가이드</span>
        <div className={s.heirsTableWrap}>
          <table className={s.heirsTable} style={{ minWidth: 520 }}>
            <thead>
              <tr>
                <th>가족 구성</th>
                <th>배우자</th>
                <th>자녀</th>
                <th>부모</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['배우자 + 자녀 1명',     '3/5 (60%)',  '2/5 (40%)',  '—'],
                ['배우자 + 자녀 2명',     '3/7 (43%)',  '각 2/7 (29%)','—'],
                ['배우자 + 자녀 3명',     '3/9 (33%)',  '각 2/9 (22%)','—'],
                ['배우자만 (자녀·부모 X)', '100%',        '—',          '—'],
                ['자녀만 (배우자 X)',     '—',           '각 1/n',     '—'],
                ['배우자 + 부모 (자녀 X)','3/7 (43%)',  '—',          '각 2/7'],
                ['부모만',                '—',          '—',          '각 1/n'],
              ].map((row, i) => (
                <tr key={i}>
                  <td>{row[0]}</td><td>{row[1]}</td><td>{row[2]}</td><td>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

// ─────────── SplitTab ───────────
interface SplitTabProps {
  totalStr: string
  setTotalStr: (v: string) => void
  childCount: number
  setChildCount: (n: number) => void
  rounds: 1 | 2 | 3
  setRounds: (n: 1 | 2 | 3) => void
}

function SplitTab(p: SplitTabProps) {
  const total = parseAmount(p.totalStr)
  const scenarios = useMemo(() => calcSplitScenarios(total, p.childCount, p.rounds), [total, p.childCount, p.rounds])
  const bestIdx = scenarios.reduce((best, cur, i) => cur.totalTax < scenarios[best].totalTax ? i : best, 0)

  return (
    <>
      <div className={s.infoBox}>
        💡 <strong>분산 증여로 절세 효과를 시뮬레이션</strong>합니다. 같은 금액이라도 「누구에게」 「몇 명에게」 「몇 년에 걸쳐」에 따라 세금이 크게 달라집니다.
      </div>

      <div className={s.card}>
        <span className={s.cardLabel}>총 이전 금액</span>
        <div className={s.inputRow}>
          <input className={s.numInput} type="text" inputMode="numeric"
            value={commaInput(total)}
            onChange={e => p.setTotalStr(parseAmount(e.target.value).toString())}
            placeholder="200,000,000" />
          <span className={s.unit}>원</span>
        </div>
        <div className={s.pills}>
          {[100_000_000, 200_000_000, 500_000_000, 1_000_000_000].map(v => (
            <button key={v}
              className={`${s.pill} ${total === v ? s.pillActive : ''}`}
              onClick={() => p.setTotalStr(v.toString())}>
              {formatShortKRW(v)}
            </button>
          ))}
        </div>
      </div>

      <div className={s.twoCol}>
        <div className={s.card}>
          <span className={s.cardLabel}>대상 자녀 수</span>
          <select className={s.selectInput} value={p.childCount}
            onChange={e => p.setChildCount(parseInt(e.target.value, 10))}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}명</option>)}
          </select>
        </div>
        <div className={s.card}>
          <span className={s.cardLabel}>증여 회차 (10년 주기)</span>
          <div className={s.optionRow3}>
            {[1, 2, 3].map(n => (
              <button key={n}
                className={`${s.optionBtn} ${p.rounds === n ? s.optionActive : ''}`}
                onClick={() => p.setRounds(n as 1 | 2 | 3)}>
                {n === 1 ? '1회' : n === 2 ? '2회' : '3회'}
              </button>
            ))}
          </div>
          <div className={s.helperText}>10년마다 새 공제 한도</div>
        </div>
      </div>

      {/* 비교 표 */}
      <div className={s.card}>
        <span className={s.cardLabel}>📊 분산 증여 시나리오 비교</span>
        <div className={s.heirsTableWrap}>
          <table className={s.heirsTable} style={{ minWidth: 560 }}>
            <thead>
              <tr>
                <th>방식</th>
                <th>총 증여세</th>
                <th>1인당 세금</th>
                <th>세후 수령</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc, i) => {
                const isBest = i === bestIdx
                return (
                  <tr key={i} className={isBest ? s.totalRow : ''}>
                    <td>{sc.label}{isBest && ' ★ 최적'}<div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sc.description}</div></td>
                    <td style={{ color: sc.totalTax === 0 ? '#3EFF9B' : 'var(--text)' }}>{formatShortKRW(sc.totalTax)}</td>
                    <td>{formatShortKRW(sc.perPerson)}</td>
                    <td style={{ color: '#3EFF9B' }}>{formatShortKRW(total - sc.totalTax)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className={s.helperText} style={{ marginTop: 10 }}>
          💡 10년마다 성인 자녀 1인당 5천만원까지 비과세 증여 가능. 부와 모가 각자 증여하면 합산 1억까지 가능.
        </div>
      </div>

      {/* 10년 주기 타임라인 */}
      <div className={s.card}>
        <span className={s.cardLabel}>📅 10년 주기 활용 — 30년 절세 계획</span>
        <div className={s.timelineWrap}>
          <div className={s.timelineLine} />
          <div className={s.timelineNodes}>
            {[
              { year: '2026', label: '미성년 증여', amount: '2,000만' },
              { year: '2034', label: '추가 증여', amount: '+2,000만' },
              { year: '2044', label: '성인 후', amount: '+5,000만' },
              { year: '2054', label: '+10년', amount: '+5,000만' },
              { year: '2064', label: '+10년', amount: '+5,000만' },
            ].map((node, i) => (
              <div key={i} className={s.timelineNode}>
                <div className={s.timelineYear}>{node.year}</div>
                <div className={s.timelineDot} />
                <div className={s.timelineLabel}>{node.label}</div>
                <div className={s.timelineAmount}>{node.amount}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={s.helperText}>
          ※ 자녀 1명 기준. 30년+ 활용 시 총 <strong style={{ color: 'var(--text)' }}>1억 9,000만</strong> 비과세 증여 가능.
          재산 변동·법령 개정·사망 시점 등 변수 다양하므로 장기 계획은 세무사 상담 권장.
        </div>
      </div>

      <div className={s.cautionBox}>
        <strong>⚠️ 주의 — 분산 증여 핵심 규칙:</strong>
        <ul>
          <li>같은 직계존속(부·모·조부모)은 합산 5,000만 한도 (10년 단위)</li>
          <li>부와 모가 각자 증여 시 합산 1억 가능 (별도 증여자)</li>
          <li>조부모 → 손자녀 직접 증여는 30% 가산세 (세대생략)</li>
          <li>사망 10년 이내 상속인 증여는 상속세에 자동 합산</li>
          <li>10년 주기는 「수증자 기준」 (받는 사람 기준)</li>
        </ul>
      </div>
    </>
  )
}

// ─────────── CompareTab ───────────
interface CompareTabProps {
  giftAmount: number
  giftRelation: Relation
  prevGift: number
  hasSpouse: boolean
  childCount: number
  assetKind: AssetKind
}

function CompareTab(p: CompareTabProps) {
  const giftResult = useMemo(
    () => calcGiftTax(p.giftAmount, p.giftRelation, p.prevGift),
    [p.giftAmount, p.giftRelation, p.prevGift],
  )
  const inheritResult = useMemo(
    () => calcInheritanceTax({
      totalAsset: p.giftAmount, priorGift: 0, funeral: 0, debt: 0,
      hasSpouse: p.hasSpouse, childCount: p.childCount, otherHeirCount: 0,
    }),
    [p.giftAmount, p.hasSpouse, p.childCount],
  )

  const giftAfter = p.giftAmount - giftResult.finalTax
  const inheritAfter = p.giftAmount - inheritResult.finalTax
  const giftBetter = giftResult.finalTax < inheritResult.finalTax
  const diff = Math.abs(giftResult.finalTax - inheritResult.finalTax)

  return (
    <>
      <div className={s.explainCard}>
        💡 <strong>「증여세 계산」·「상속세 계산」 탭의 입력값 기준 비교</strong>.{' '}
        증여 금액 <strong style={{ color: 'var(--accent)' }}>{formatShortKRW(p.giftAmount)}</strong>를{' '}
        지금 <strong style={{ color: '#3EC8FF' }}>증여</strong>할 때 vs 같은 금액을 나중에 <strong style={{ color: '#FF8C3E' }}>상속</strong>할 때
      </div>

      <div className={`${s.hero} ${s.heroPurple}`}>
        <div className={s.heroLead}>현재 입력값 기준</div>
        <div className={`${s.heroNum} ${s.heroNumPurple}`} style={{ fontSize: 'clamp(22px, 4vw, 38px)' }}>
          {giftBetter ? '증여' : inheritResult.finalTax === giftResult.finalTax ? '동일' : '상속'}
          {giftResult.finalTax !== inheritResult.finalTax && '이 유리'}
        </div>
        <div className={s.heroSubAccent}>
          {diff === 0 ? '세금 부담이 동일합니다.' : `세금 차이 약 ${formatShortKRW(diff)}`}
        </div>
      </div>

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

      <div className={s.explainCard}>
        <strong>왜 차이가 발생하나요?</strong>
        <ul>
          {p.hasSpouse && <li>배우자가 있어 상속 시 최소 5억원의 배우자 공제 적용 (최대 30억).</li>}
          {p.giftAmount <= 500_000_000 && <li>금액이 5억 이하라 상속 일괄공제 범위 내 — 상속세 0원 가능.</li>}
          {p.childCount >= 2 && <li>자녀가 {p.childCount}명이라 분산 증여 시 각자 공제 한도(5천만)를 활용해 절세 효과.</li>}
          {p.prevGift > 0 && <li>10년 내 기존 증여액 {formatShortKRW(p.prevGift)}이 합산되어 증여세 부담 ↑.</li>}
          {p.assetKind === '부동산' && <li>부동산은 평가 기준(시가/공시가)에 따라 결과가 크게 달라짐.</li>}
          {p.giftAmount >= 3_000_000_000 && <li>30억 초과 구간은 양쪽 모두 50% 최고세율 적용.</li>}
        </ul>
      </div>

      {/* 세율표 (참고) */}
      <div className={s.card}>
        <span className={s.cardLabel}>📊 증여세·상속세 세율 (동일 누진 구조)</span>
        <div className={s.heirsTableWrap}>
          <table className={s.heirsTable} style={{ minWidth: 420 }}>
            <thead>
              <tr><th>과세표준</th><th>세율</th><th>누진공제</th></tr>
            </thead>
            <tbody>
              {TAX_BRACKETS.map((b, i) => (
                <tr key={i}>
                  <td>{i === 0 ? '1억 이하' : i === TAX_BRACKETS.length - 1 ? '30억 초과' : `${formatShortKRW(b.min)} 초과 ~ ${formatShortKRW(b.max)} 이하`}</td>
                  <td style={{ color: b.rate >= 0.4 ? '#FF6B6B' : b.rate >= 0.3 ? '#FF8C3E' : 'var(--text)' }}>
                    {(b.rate * 100).toFixed(0)}%
                  </td>
                  <td>{formatShortKRW(b.deduction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <WarnList items={[
        p.prevGift > 0 && '🔔 10년 내 증여 이력이 있어 합산.',
        p.assetKind === '부동산' && '🔔 부동산은 평가 기준에 따라 세금이 다름 — 단순 추정만 가능.',
        p.hasSpouse && '🔔 배우자 상속공제 적용 시 결과 크게 달라짐 (최대 30억).',
        '🔔 본 비교는 단순 참고 — 실제 세무 의사결정은 세무사 상담 필수.',
      ].filter(Boolean) as string[]} />
    </>
  )
}

// ─────────── WarnList ───────────
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

// ESLint warning 회피용 (사용 가능성 표시)
void getSpouseLegalShare
