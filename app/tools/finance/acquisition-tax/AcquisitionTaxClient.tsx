'use client'

/* 부동산 취득세 계산기 — 인터랙션 전용. 세율·감면 판단은 acquisitionTaxUtils → lib/krAcquisitionTax.ts */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import ResultHero, { BreakdownTable, type BreakdownRow } from '@/components/ResultHero'
import UiIcon from '@/components/UiIcon'
import s from './acquisitionTax.module.css'
import {
  CAUSES, PROPERTIES, CAP_KINDS, VALUE_LABEL, DEFAULT_STATE,
  mergeState, queryToState, stateToQuery, commaInput, computeAcq,
  buildHouseMatrix, buildCauseCompare, summaryText, koreanWon, num, won, pct,
  type AcqState,
} from './acquisitionTaxUtils'
import {
  FIRST_HOME_RELIEF, LOW_VALUE_HOUSE_MAX_STD_VALUE, GIFT_HOUSE_HEAVY_MIN_STD_VALUE, NATIONAL_HOUSING_AREA_M2,
  TEMP_TWO_HOMES_DISPOSAL_YEARS, ACQ_REFORM_PROPOSAL_2026,
} from '@/lib/krAcquisitionTax'

const STORAGE_KEY = 'youtil:acquisition-tax:inputs-v1'
const PRESETS = [300_000_000, 500_000_000, 700_000_000, 900_000_000, 1_200_000_000]
const EOK = 100_000_000
/** 'YYYY-MM-DD' → '2026.10.1' (문자열 분해 — Date 파싱 없음) */
const dotDate = (ymd: string) => { const [y, m, d] = ymd.split('-'); return `${y}.${Number(m)}.${Number(d)}` }
const P = ACQ_REFORM_PROPOSAL_2026
/** 개편안 처분기한 단축 안내 — 시행령 사항이라 시행 여부를 취득 전에 확인하도록 */
const TEMP_PROPOSAL_NOTE = `${dotDate(P.tempTwoHomesFrom)} 이후 취득분은 종전 주택이 조정대상지역이면 ${P.tempTwoHomesYears}년으로 단축 예정(${dotDate(P.announced)} 개편안) — 시행령 개정 여부 확인`

type CopyKey = 'result' | 'link'

interface SegOpt<T> { id: T; label: string; disabled?: boolean }

/** 네이티브 라디오 세그먼트 — 화살표 키 이동·라벨 연결을 브라우저가 처리 */
function Seg<T extends string | number>({ name, legend, hint, value, options, onChange, cols }: {
  name: string; legend: string; hint?: ReactNode; value: T; options: SegOpt<T>[]; onChange: (v: T) => void; cols?: 'four'
}) {
  return (
    <fieldset className={`ui-fieldset ${s.fs}`}>
      <legend className="ui-label">{legend}{hint && <span className="ui-hint">{hint}</span>}</legend>
      <div className={`${s.seg} ${cols === 'four' ? s.seg4 : ''}`}>
        {options.map(o => (
          <label key={String(o.id)} className={s.segOpt}>
            <input type="radio" name={name} value={String(o.id)} checked={value === o.id} disabled={o.disabled} onChange={() => onChange(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Check({ checked, onChange, title, desc, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; title: string; desc?: ReactNode; disabled?: boolean
}) {
  return (
    <label className={`ui-check ${disabled ? s.checkOff : ''}`}>
      <input type="checkbox" checked={checked && !disabled} disabled={disabled} onChange={e => onChange(e.target.checked)} />
      <span>{title}{desc && <small>{desc}</small>}</span>
    </label>
  )
}

export default function AcquisitionTaxClient() {
  const [st, setSt] = useState<AcqState>(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)
  /** 복사 결과는 누른 버튼에만 표시 — 실패도 해당 버튼에 */
  const [copied, setCopied] = useState<{ key: CopyKey; ok: boolean } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* 복원 — 공유 링크(?c=…) 우선, 없으면 localStorage. 둘 다 mergeState로 검증 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    let next: AcqState | null = null
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

  const set = <K extends keyof AcqState>(k: K, v: AcqState[K]) => setSt(p => {
    const n = { ...p, [k]: v }
    if (n.cause === 'original' && n.property === 'farmland') n.property = 'nonHouse'
    return n
  })

  const purchaseHouse = st.cause === 'purchase' && st.property === 'house'
  // 화면에서 비활성(체크 해제로 보이는) 생애최초는 계산에서도 뺀다 — 12억 초과·중과 등 사유는 경고로 보여 준다.
  // 세대 주택 수로는 막지 않는다: 요건은 본인·배우자의 소유 이력이고, 부모 등 세대원 주택은 무관(지특법 §36의3①)
  const firstHomeOn = st.firstHome && purchaseHouse && !st.corporate
  const r = useMemo(() => computeAcq({ ...st, firstHome: firstHomeOn }), [st, firstHomeOn])
  const value = r.input.value
  const isHouse = r.input.property === 'house'
  const matrix = useMemo(() => (purchaseHouse && value > 0 ? buildHouseMatrix(value, r.input.over85) : []), [purchaseHouse, value, r.input.over85])
  const causeRows = useMemo(() => (value > 0 ? buildCauseCompare(value, r.input.property, r.input.over85) : []), [value, r.input.property, r.input.over85])

  const flash = (key: CopyKey, ok: boolean) => {
    setCopied({ key, ok })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1500)
  }
  const copy = async (text: string, key: CopyKey) => {
    try { await navigator.clipboard.writeText(text); flash(key, true) } catch { flash(key, false) }
  }
  const copyState = (key: CopyKey): 'ok' | 'fail' | null => (copied?.key === key ? (copied.ok ? 'ok' : 'fail') : null)
  const linkCopy = copyState('link')
  const resultCopy = copyState('result')
  const shareUrl = () => (typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}?${stateToQuery(st)}`)

  /* 결과 카드 내역 */
  const b = r.base
  const rel = r.relief
  const rows: BreakdownRow[] = [
    { label: '취득세', note: b.label, color: 'data-1', cols: [pct(b.acquisitionRate), num(b.acquisitionTax)] },
    ...(rel ? [{ label: '생애최초 감면', note: '취득세 감면', cols: ['', `−${num(rel.acquisitionRelief)}`] }] : []),
    { label: '지방교육세', color: 'data-2' as const, cols: [pct(b.educationRate), num(b.educationTax)] },
    ...(rel && rel.educationRelief > 0 ? [{ label: '교육세 감면', note: '취득세 감면율만큼', cols: ['', `−${num(rel.educationRelief)}`] }] : []),
    { label: '농어촌특별세', note: isHouse && !r.input.over85 ? `전용 ${NATIONAL_HOUSING_AREA_M2}㎡ 이하 비과세` : undefined, color: 'data-4' as const, cols: [b.ruralRate ? pct(b.ruralRate) : '비과세', num(b.ruralTax)] },
    ...(rel && rel.ruralOnRelief > 0 ? [{ label: '감면분 농특세', note: `감면액 × ${FIRST_HOME_RELIEF.ruralOnReliefPct}%`, cols: ['', `+${num(rel.ruralOnRelief)}`] }] : []),
    { label: '합계', kind: 'sum' as const, cols: [pct(Math.round(r.effectiveRate * 1000) / 1000), num(r.total)] },
  ]
  const seg = r.total > 0 ? [
    { label: '취득세', value: Math.round((r.acquisitionTax / r.total) * 1000) / 10, color: 'data-1' as const },
    { label: '지방교육세', value: Math.round((r.educationTax / r.total) * 1000) / 10, color: 'data-2' as const },
    ...(r.ruralTax > 0 ? [{ label: '농특세', value: Math.round((r.ruralTax / r.total) * 1000) / 10, color: 'data-4' as const }] : []),
  ] : undefined

  const vl = VALUE_LABEL[st.cause]
  const lowLabel = `공시가격 ${LOW_VALUE_HOUSE_MAX_STD_VALUE.capital / EOK}억(비수도권 ${LOW_VALUE_HOUSE_MAX_STD_VALUE.nonCapital / EOK}억) 이하`

  return (
    <div className={s.wrap}>
      <section className="ui-card" aria-label="취득 조건 입력">
        <Seg name="acq-cause" legend="취득 원인" value={st.cause} cols="four"
          options={CAUSES.map(c => ({ id: c.id, label: c.label }))} onChange={v => set('cause', v)} />
        <Seg name="acq-prop" legend="물건 종류"
          hint={st.property === 'nonHouse' ? '오피스텔·상가·건물·토지' : st.property === 'farmland' ? '전·답·과수원' : '아파트·빌라·단독'}
          value={r.input.property}
          options={PROPERTIES.map(p => ({ id: p.id, label: p.label, disabled: p.id === 'farmland' && st.cause === 'original' }))}
          onChange={v => set('property', v)} />

        <div className="ui-field">
          <label className="ui-label" htmlFor="acq-value">{vl.label}<span className="ui-hint">{vl.hint}</span></label>
          <div className="ui-input">
            <input id="acq-value" type="text" inputMode="numeric" autoComplete="off" aria-describedby="acq-value-help"
              value={st.value} onChange={e => set('value', commaInput(e.target.value))} placeholder="0" />
            <span className="ui-unit">원</span>
          </div>
          <p className="ui-helper" id="acq-value-help"><strong>{koreanWon(value)}</strong>{st.cause === 'inherit' ? ' · 상속은 시가가 아니라 시가표준액이 과세표준입니다' : st.cause === 'gift' ? ' · 2023년부터 증여는 시가인정액 기준' : ''}</p>
          <div className="ui-chips" role="group" aria-label="금액 빠른 입력">
            {PRESETS.map(p => (
              <button key={p} type="button" className="ui-chip" aria-pressed={value === p} onClick={() => set('value', commaInput(String(p)))}>
                {p / EOK}억
              </button>
            ))}
          </div>
        </div>

        {isHouse && (
          <div className="ui-field">
            <div className="ui-checks">
              <Check checked={st.over85} onChange={v => set('over85', v)} title={`전용면적 ${NATIONAL_HOUSING_AREA_M2}㎡ 초과`}
                desc="국민주택규모를 넘으면 농어촌특별세가 붙습니다 (수도권 외 읍·면은 100㎡ 기준)" />
            </div>
          </div>
        )}

        {purchaseHouse && (<>
          <Seg name="acq-count" legend="취득 후 1세대 주택 수" hint="이번 주택 포함"
            value={st.homeCount} cols="four"
            options={[1, 2, 3, 4].map(n => ({ id: n as AcqState['homeCount'], label: n === 4 ? '4주택+' : `${n}주택`, disabled: st.corporate }))}
            onChange={v => set('homeCount', v)} />
          <p className="ui-helper">2020.8.12 이후 취득한 분양권·입주권·주거용 오피스텔도 주택 수에 들어갑니다.</p>
          <div className="ui-field">
            <div className="ui-checks">
              <Check checked={st.adjusted} onChange={v => set('adjusted', v)} title="조정대상지역 주택" disabled={st.corporate}
                desc="취득일(지정 전 계약·계약금 지급분은 계약일) 기준 — 2025.10.15 대책으로 서울 전역·경기 12곳 지정" />
              <Check checked={st.temporary} onChange={v => set('temporary', v)} title="일시적 2주택"
                disabled={st.corporate || !(st.homeCount === 2 && st.adjusted)}
                desc={`조정지역 2주택 중 종전 주택을 ${TEMP_TWO_HOMES_DISPOSAL_YEARS}년(현행) 안에 처분할 예정 → 1주택 세율. ${TEMP_PROPOSAL_NOTE}`} />
              <Check checked={st.lowValue} onChange={v => set('lowValue', v)} title="중과 제외 저가주택"
                desc={`${lowLabel} 주택 (정비구역 등 제외) → 주택 수와 관계없이 기본세율`} />
              <Check checked={st.corporate} onChange={v => set('corporate', v)} title="법인이 취득" desc="주택 수·지역과 관계없이 중과" />
              <Check checked={st.firstHome} onChange={v => set('firstHome', v)} title="생애최초 주택 구입 감면"
                disabled={st.corporate}
                desc={`본인·배우자 모두 주택 소유 이력 없음 (부모 등 다른 세대원 주택은 무관) + 취득가액 ${FIRST_HOME_RELIEF.maxPrice / EOK}억 이하 + ${FIRST_HOME_RELIEF.residenceStartMonths}개월 안 전입·${FIRST_HOME_RELIEF.residenceYears}년 거주`} />
            </div>
          </div>
          {firstHomeOn && (
            <div className="ui-field">
              <label className="ui-label" htmlFor="acq-cap">감면 한도</label>
              <select id="acq-cap" className={s.select} value={st.capKind} onChange={e => {
                const k = CAP_KINDS.find(c => c.id === e.target.value)
                if (k) set('capKind', k.id)
              }}>
                {CAP_KINDS.map(c => (
                  <option key={c.id} value={c.id} disabled={st.over85 && (c.id === 'smallCapital' || c.id === 'smallNonCapital')}>{c.label}</option>
                ))}
              </select>
              <p className="ui-helper">
                소형주택 = 전용 {FIRST_HOME_RELIEF.smallMaxAreaM2}㎡ 이하 연립·다세대·다가구·도시형생활주택 (아파트 제외){st.over85 ? ` — ${NATIONAL_HOUSING_AREA_M2}㎡ 초과라 선택 불가` : ''}.
                {st.capKind === 'depopulation' && ' 인구감소지역 한도는 수도권 인구감소지역(강화·옹진·연천·가평) 포함 여부를 위택스·세무과에서 확인하세요.'}
              </p>
            </div>
          )}
        </>)}

        {st.cause === 'gift' && isHouse && (
          <div className="ui-field">
            <div className="ui-checks">
              <Check checked={st.adjusted} onChange={v => set('adjusted', v)} title="조정대상지역 주택" />
              <Check checked={st.giftOver3eok} onChange={v => set('giftOver3eok', v)} title={`시가표준액 ${GIFT_HOUSE_HEAVY_MIN_STD_VALUE / EOK}억원 이상`} desc="공시가격 기준 (증여가액 아님)" />
              <Check checked={st.giftFamily} onChange={v => set('giftFamily', v)} title="1세대 1주택자가 배우자·직계존비속에게 증여" desc="해당하면 중과 제외" />
            </div>
          </div>
        )}

        {st.cause === 'inherit' && isHouse && (
          <div className="ui-field">
            <div className="ui-checks">
              <Check checked={st.inheritHomeless} onChange={v => set('inheritHomeless', v)} title="무주택 1가구의 1주택 상속"
                desc="상속인 가구가 상속주택 외 주택이 없음 → 세율 특례" />
            </div>
          </div>
        )}
      </section>

      <ResultHero
        label="취득세 합계"
        value={value > 0 ? num(r.total) : undefined}
        unit="원"
        pill={value > 0 ? `실효 ${pct(Math.round(r.effectiveRate * 1000) / 1000)}` : undefined}
        empty="금액을 입력하면 취득세·지방교육세·농어촌특별세 합계가 표시됩니다"
        sub={<>적용: <b>{b.label}</b>{rel && <> · 생애최초 순감면 <b>{won(rel.netRelief)}</b></>}</>}
        formula={<>취득세 <b>{num(r.acquisitionTax)}</b> + 지방교육세 <b>{num(r.educationTax)}</b> + 농특세 <b>{num(r.ruralTax)}</b> = <b>{won(r.total)}</b></>}
        segments={seg}
        actions={
          <div className="ui-btnRow">
            <button type="button" className="ui-btn ui-btn-secondary" onClick={() => copy(shareUrl(), 'link')}>
              <UiIcon name={linkCopy === 'ok' ? 'check' : linkCopy === 'fail' ? 'alert' : 'share'} size={18} />
              {linkCopy === 'ok' ? '링크 복사됨' : linkCopy === 'fail' ? '복사 실패' : '링크 공유'}
            </button>
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => copy(summaryText(st, r), 'result')}>
              <UiIcon name={resultCopy === 'ok' ? 'check' : resultCopy === 'fail' ? 'alert' : 'copy'} size={18} />
              {resultCopy === 'ok' ? '복사됨' : resultCopy === 'fail' ? '복사 실패' : '결과 복사'}
            </button>
          </div>
        }
      >
        <BreakdownTable caption="세목별 내역" unit="원" head={['세목', '세율', '세액']} rows={rows} />
        {r.reliefBlocked && <p className={s.warn}><UiIcon name="alert" size={16} />생애최초 감면 미적용 — {r.reliefBlocked}</p>}
        {rel?.note && <p className={s.warn}><UiIcon name="alert" size={16} />{rel.note}</p>}
        {rel && rel.ruralOnRelief > 0 && (
          <p className={s.info}>{NATIONAL_HOUSING_AREA_M2}㎡ 초과 감면분 농특세는 추정입니다 — 본세분 농특세(과세표준 × {pct(b.ruralRate)})는 그대로 두고 감면액의 {FIRST_HOME_RELIEF.ruralOnReliefPct}%를 더했습니다. 산정 방식은 위택스 모의계산으로 확인하세요.</p>
        )}
        {purchaseHouse && r.input.temporaryTwoHomes && !st.corporate && !st.lowValue && (
          <p className={s.warn}><UiIcon name="alert" size={16} />일시적 2주택 처분기한은 현행 {TEMP_TWO_HOMES_DISPOSAL_YEARS}년입니다. {TEMP_PROPOSAL_NOTE}. 기한 안에 못 팔면 중과세율 차액과 가산세가 추징됩니다.</p>
        )}
        {st.corporate && purchaseHouse && <p className={s.info}>법인 취득은 주택 수·조정대상지역과 관계없이 판단합니다(저가주택 제외).</p>}
        {st.cause === 'original' && <p className={s.info}>신축(원시취득)은 다주택 중과 대상이 아닙니다. 법인의 과밀억제권역 안 신·증축 중과는 반영하지 않았습니다.</p>}
      </ResultHero>

      {matrix.length > 0 && (
        <figure className={s.fig}>
          <figcaption className={s.figCap}>같은 가격, 주택 수·지역별 취득세 합계<span>매매 · 개인 · 단위 원</span></figcaption>
          <div className={`tableScroll ${s.box}`}>
            <table>
              <thead><tr><th scope="col">취득 후 주택 수</th><th scope="col">비조정지역</th><th scope="col">조정대상지역</th></tr></thead>
              <tbody>
                {matrix.map(m => {
                  const here = !st.corporate && !st.lowValue && m.homeCount === st.homeCount
                  return (
                    <tr key={m.homeCount} className={here ? s.here : undefined}>
                      <th scope="row">{m.label}{here && <small>입력값</small>}</th>
                      <td>{num(m.normal.total)}<small>{pct(m.normal.totalRate)} · 본세 {pct(m.normal.acquisitionRate)}</small></td>
                      <td>{num(m.adjusted.total)}<small>{pct(m.adjusted.totalRate)} · 본세 {pct(m.adjusted.acquisitionRate)}</small></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className={s.figNote}>작은 글씨 = 합계 세율 · 취득세 본세율. 조정대상지역 2주택이라도 일시적 2주택이면 1주택 줄과 같습니다.</p>
        </figure>
      )}

      {causeRows.length > 0 && (
        <figure className={s.fig}>
          <figcaption className={s.figCap}>같은 금액, 취득 원인별 비교<span>{PROPERTIES.find(p => p.id === r.input.property)?.label} · 단위 원</span></figcaption>
          <div className={`tableScroll ${s.box}`}>
            <table>
              <thead><tr><th scope="col">취득 원인</th><th scope="col">취득세</th><th scope="col">교육세</th><th scope="col">농특세</th><th scope="col">합계</th></tr></thead>
              <tbody>
                {causeRows.map(c => {
                  const here = c.b.category === b.category && c.key.startsWith(st.cause)
                  return (
                    <tr key={c.key} className={here ? s.here : undefined}>
                      <th scope="row">{c.label}<small>{pct(c.b.totalRate)}{here && ' · 입력값'}</small></th>
                      <td>{num(c.b.acquisitionTax)}</td>
                      <td>{num(c.b.educationTax)}</td>
                      <td>{num(c.b.ruralTax)}</td>
                      <td className={s.em}>{num(c.b.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className={s.figNote}>원인마다 과세표준이 다릅니다(매매 실거래가·증여 시가인정액·상속 시가표준액). 같은 숫자를 넣은 단순 세율 비교입니다. 생애최초 감면 제외.</p>
        </figure>
      )}

      <p className={s.wetax}>
        <UiIcon name="info" size={16} />
        신고 전에는 <a href="https://www.wetax.go.kr" target="_blank" rel="noopener noreferrer">위택스(wetax.go.kr)<span className="srOnly">(새 창)</span></a> 모의계산으로 한 번 더 대조하세요. 서울은 이택스(etax.seoul.go.kr)에서도 신고합니다.
      </p>
    </div>
  )
}

