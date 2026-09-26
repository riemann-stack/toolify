'use client'

/* 중개보수(복비) 계산기 — 인터랙션 전용. 상한요율·한도액·월세 환산은 brokerageFeeUtils → lib/krBrokerageFee.ts */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import ResultHero, { BreakdownTable, type BreakdownRow } from '@/components/ResultHero'
import UiIcon from '@/components/UiIcon'
import s from './brokerageFee.module.css'
import {
  DEALS, PROPERTIES, DEFAULT_STATE, VAT_PCT_TEXT,
  mergeState, queryToState, stateToQuery, commaInput, rateInput, computeFee, scheduleRows,
  summaryText, koreanWon, manWon, num, won, pctPpm,
  type FeeState,
} from './brokerageFeeUtils'
import { CURRENT_HOUSE_FEE_SCHEDULE, LEASE_CONVERSION, OFFICETEL_FEE } from '@/lib/krBrokerageFee'

const STORAGE_KEY = 'youtil:brokerage-fee:inputs-v1'
const EOK = 100_000_000
const MAN = 10_000
const SALE_PRESETS = [1 * EOK, 3 * EOK, 5 * EOK, 9 * EOK, 12 * EOK, 15 * EOK]
const JEONSE_PRESETS = [5_000 * MAN, 1 * EOK, 2 * EOK, 3 * EOK, 6 * EOK]
const presetLabel = (n: number) => (n >= EOK ? `${n / EOK}억` : `${n / MAN}만`)
/** 'YYYY-MM-DD' → 'YYYY.M.D' (문자열 분해 — 날짜 파싱 없음) */
const dotDate = (ymd: string) => ymd.split('-').map(Number).join('.')
const HOUSE_SCHEDULE_CAPTION = `공인중개사법 시행규칙 별표 1 · ${dotDate(CURRENT_HOUSE_FEE_SCHEDULE.from)} 시행`

type CopyKind = 'result' | 'link'
type CopyFlash = '' | CopyKind | `${CopyKind}-fail`

interface SegOpt<T> { id: T; label: string }

/** 네이티브 라디오 세그먼트 — 화살표 키 이동·라벨 연결을 브라우저가 처리 */
function Seg<T extends string>({ name, legend, value, options, onChange }: {
  name: string; legend: string; value: T; options: SegOpt<T>[]; onChange: (v: T) => void
}) {
  return (
    <fieldset className={`ui-fieldset ${s.fs}`}>
      <legend className="ui-label">{legend}</legend>
      <div className={s.seg}>
        {options.map(o => (
          <label key={o.id} className={s.segOpt}>
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function MoneyField({ id, label, hint, value, onChange, helper, presets }: {
  id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; helper: ReactNode; presets?: number[]
}) {
  const n = Number(value.replace(/,/g, '')) || 0
  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>{label}{hint && <span className="ui-hint">{hint}</span>}</label>
      <div className="ui-input">
        <input id={id} type="text" inputMode="numeric" autoComplete="off" aria-describedby={`${id}-help`}
          value={value} onChange={e => onChange(commaInput(e.target.value))} placeholder="0" />
        <span className="ui-unit">원</span>
      </div>
      <p className="ui-helper" id={`${id}-help`}>{helper}</p>
      {presets && (
        <div className="ui-chips" role="group" aria-label={`${label} 빠른 입력`}>
          {presets.map(p => (
            <button key={p} type="button" className="ui-chip" aria-pressed={n === p} onClick={() => onChange(commaInput(String(p)))}>
              {presetLabel(p)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BrokerageFeeClient() {
  const [st, setSt] = useState<FeeState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)
  const [copied, setCopied] = useState<CopyFlash>('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* 복원 — 공유 링크(?d=…) 우선, 없으면 localStorage. 둘 다 mergeState로 검증 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    let next: FeeState | null = null
    try { next = queryToState(window.location.search) } catch { next = null }
    if (!next) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) next = mergeState(JSON.parse(raw))
      } catch { next = null }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (next) setSt(next)
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(st)) } catch { /* 저장 불가 환경 무시 */ }
  }, [hydrated, st])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const set = <K extends keyof FeeState>(k: K, v: FeeState[K]) => setSt(p => ({ ...p, [k]: v }))

  const v = useMemo(() => computeFee(st), [st])
  const { r } = v
  const rows = useMemo(() => (st.property === 'house' ? scheduleRows(r.kind) : []), [st.property, r.kind])
  const hasValue = r.transactionAmount > 0

  const flash = (k: CopyFlash) => {
    setCopied(k)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(''), 1500)
  }
  const copy = async (text: string, k: CopyKind) => {
    try { await navigator.clipboard.writeText(text); flash(k) } catch { flash(`${k}-fail`) }
  }
  const shareUrl = () => (typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}?${stateToQuery(st)}`)

  const maxPct = pctPpm(r.maxRatePpm)
  const rateErr = r.rateClamped ? `상한요율 ${maxPct}를 넘을 수 없어 ${maxPct}로 계산했습니다` : null
  const sideA = st.deal === 'sale' ? '매도인' : '임대인'
  const sideB = st.deal === 'sale' ? '매수인' : '임차인'
  const L = LEASE_CONVERSION

  /* 결과 카드 내역 */
  const bd: BreakdownRow[] = [
    { label: '거래금액', note: r.lease?.multiplier ? `보증금 + 월세 × ${r.lease.multiplier}` : undefined, cols: [num(r.transactionAmount)] },
    { label: r.negotiated && !r.rateClamped ? '협의 요율' : '상한요율', note: r.bracketText, cols: [pctPpm(r.appliedRatePpm)] },
    { label: '한도액', note: r.feeCapped ? '한도액 적용' : undefined, cols: [r.cap === null ? '없음' : num(r.cap)] },
    { label: '중개보수', note: '부가세 전', color: 'data-1', cols: [num(r.fee)] },
    ...(st.vat ? [{ label: `부가세 ${VAT_PCT_TEXT}`, note: '세금계산서 발급 사무소', color: 'data-2' as const, cols: [num(r.vat)] }] : []),
    { label: '한쪽 합계', kind: 'sum', cols: [num(v.shown)] },
    { label: '양측 합계', note: `${sideA} + ${sideB}`, kind: 'net', cols: [num(v.shownBoth)] },
  ]

  const formula = (
    <>
      거래금액 <b>{num(r.transactionAmount)}</b> × <b>{pctPpm(r.appliedRatePpm)}</b>
      {' '}= <b>{num(r.rawFee)}</b>{r.feeCapped && r.cap !== null && <> → 한도액 <b>{num(r.cap)}</b></>}
      {st.vat ? <> + 부가세 <b>{num(r.vat)}</b> = <b>{won(r.feeWithVat)}</b></> : <>원 (부가세 별도)</>}
    </>
  )

  return (
    <div className={s.wrap}>
      <section className="ui-card" aria-label="거래 조건 입력">
        <Seg name="bf-deal" legend="거래 종류" value={st.deal} options={DEALS} onChange={x => set('deal', x)} />
        <Seg name="bf-prop" legend="중개대상물" value={st.property} options={PROPERTIES.map(p => ({ id: p.id, label: p.label }))} onChange={x => set('property', x)} />
        <p className={s.propNote}>
          {st.property === 'house' && <>아파트·빌라·단독·다가구 등. 주택과 상가가 섞인 건물은 <b>주택 면적이 절반 이상</b>이면 주택 요율입니다.</>}
          {st.property === 'officetel' && <>전용 <b>{OFFICETEL_FEE.maxAreaM2}㎡ 이하</b>이고 상·하수도가 갖춰진 <b>전용 입식 부엌·수세식 화장실·목욕시설</b>을 모두 갖춘 오피스텔만 해당합니다. 하나라도 빠지면 &lsquo;토지·상가 등&rsquo;을 고르세요.</>}
          {st.property === 'other' && <>토지·상가·사무실·공장, 주거용 요건을 못 갖춘 오피스텔. 매매·임대 모두 <b>상한 안에서 협의</b>하는 구조라 계산 결과는 최대치입니다.</>}
        </p>

        {st.deal === 'sale' && (
          <MoneyField id="bf-price" label="거래금액" hint="매매가 · 교환은 큰 쪽 가액" value={st.price} onChange={x => set('price', x)}
            helper={<><strong>{koreanWon(v.amount)}</strong> · 분양권은 기납입금(계약금·중도금) + 프리미엄</>} presets={SALE_PRESETS} />
        )}
        {st.deal === 'jeonse' && (
          <MoneyField id="bf-jeonse" label="전세 보증금" value={st.jeonse} onChange={x => set('jeonse', x)}
            helper={<strong>{koreanWon(v.amount)}</strong>} presets={JEONSE_PRESETS} />
        )}
        {st.deal === 'monthly' && (<>
          <div className="ui-row2">
            <MoneyField id="bf-deposit" label="보증금" value={st.deposit} onChange={x => set('deposit', x)} helper={<strong>{koreanWon(v.amount)}</strong>} />
            <MoneyField id="bf-rent" label="월세" hint="월 차임" value={st.rent} onChange={x => set('rent', x)} helper={<strong>{koreanWon(v.rent)}</strong>} />
          </div>
          {r.lease && r.lease.multiplier && (
            <p className={s.info}>
              <UiIcon name="calc" size={16} />
              <span>
                보증금 + 월세 × {L.multiplier} = <b>{manWon(r.lease.amount100)}</b>
                {r.lease.multiplier === L.lowMultiplier
                  ? <> → {manWon(L.lowThreshold)} 미만이라 × {L.lowMultiplier}으로 다시 계산: <b>{manWon(r.lease.amount)}</b></>
                  : <> ({manWon(L.lowThreshold)} 이상이라 그대로 거래금액)</>}
              </span>
            </p>
          )}
        </>)}

        <div className="ui-field">
          <label className="ui-label" htmlFor="bf-rate">협의 요율 <span className="ui-hint">선택 · 비우면 상한 {maxPct}</span></label>
          <div className="ui-input ui-sm">
            <input id="bf-rate" type="text" inputMode="decimal" autoComplete="off" placeholder={pctPpm(r.maxRatePpm).replace('%', '')}
              aria-invalid={rateErr ? true : undefined} aria-describedby="bf-rate-help"
              value={st.rate} onChange={e => set('rate', rateInput(e.target.value))} />
            <span className="ui-unit">%</span>
          </div>
          <p className={`ui-helper ${rateErr ? 'ui-err' : ''}`} id="bf-rate-help">
            {rateErr ?? '중개사무소와 미리 합의한 요율이 있으면 넣으세요. 상한을 넘는 약정은 넘는 부분이 무효입니다.'}
          </p>
        </div>

        <div className="ui-field">
          <div className="ui-checks">
            <label className="ui-check">
              <input type="checkbox" checked={st.vat} onChange={e => set('vat', e.target.checked)} />
              <span>부가세 {VAT_PCT_TEXT} 포함<small>세금계산서 발급 사무소 기준 — 간이과세자는 아래 안내 참고</small></span>
            </label>
          </div>
        </div>
      </section>

      <ResultHero
        label={`${r.negotiated && !r.rateClamped ? '협의' : '최대'} 중개보수 (한쪽${st.vat ? '·부가세 포함' : ''})`}
        value={hasValue ? num(v.shown) : undefined}
        unit="원"
        pill={hasValue ? `상한요율 ${maxPct}` : undefined}
        empty="금액을 입력하면 법정 상한 중개보수가 표시됩니다"
        sub={<>{r.bracketText} · 한도액 <b>{r.cap === null ? '없음' : manWon(r.cap)}</b> · 양측 합계 <b>{won(v.shownBoth)}</b></>}
        formula={formula}
        actions={
          <div className="ui-btnRow">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={() => copy(shareUrl(), 'link')}>
              <UiIcon name={copied === 'link' ? 'check' : 'share'} size={18} />{copied === 'link' ? '링크 복사됨' : copied === 'link-fail' ? '복사 실패' : '링크 공유'}
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => copy(summaryText(st, v), 'result')}>
              <UiIcon name={copied === 'result' ? 'check' : 'copy'} size={18} />{copied === 'result' ? '복사됨' : copied === 'result-fail' ? '복사 실패' : '결과 복사'}
            </button>
          </div>
        }
      >
        <BreakdownTable caption="중개보수 내역" unit="원" head={['항목', '금액']} rows={bd} />
        {rateErr && <p className={s.warn}><UiIcon name="alert" size={16} />{rateErr}. 법정 한도를 넘는 약정은 넘는 범위에서 무효입니다.</p>}
        <p className={s.info}>
          <UiIcon name="info" size={16} />
          <span>중개보수는 {sideA}과 {sideB}이 <b>각각</b> 냅니다. 위 금액은 한쪽 몫이고, 상한 안에서 사무소와 협의해 정합니다.</span>
        </p>
      </ResultHero>

      {rows.length > 0 && (
        <figure className={s.fig}>
          <figcaption className={s.figCap}>주택 {r.kind === 'sale' ? '매매·교환' : '임대차'} 상한요율표<span>{HOUSE_SCHEDULE_CAPTION}</span></figcaption>
          <div className={`tableScroll ${s.box}`}>
            <table>
              <thead><tr><th scope="col">거래금액</th><th scope="col">상한요율</th><th scope="col">한도액</th></tr></thead>
              <tbody>
                {rows.map((row, i) => {
                  const here = hasValue && i === r.bracketIndex
                  return (
                    <tr key={row.label} className={here ? s.here : undefined}>
                      <th scope="row">{row.label}{here && <small>입력값</small>}</th>
                      <td>{row.rate}</td>
                      <td>{row.cap}{row.capFrom !== null && <small>{manWon(row.capFrom)}부터 한도</small>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className={s.figNote}>상한요율·한도액은 부가세 별도 금액입니다. 서울 등 시·도 조례도 같은 표를 쓰며, 중개사무소가 있는 시·도의 조례가 기준입니다.</p>
        </figure>
      )}
    </div>
  )
}
