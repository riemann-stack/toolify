'use client'

import { useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './sci-units.module.css'
import {
  SI_PREFIXES, SCI_UNIT_GROUPS, CONSTANTS,
  toScientific, toEngineering, toPrefix,
  fmtPlain, fmtSig, supExp,
} from './sciUnitsData'

type Tab = 'notation' | 'units' | 'constants'

export default function SciUnitsClient() {
  const [tab, setTab] = useState<Tab>('notation')

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/unit/converter', label: '단위 변환기' },
          { href: '/tools/edu/fermi-estimate', label: '페르미 추정' },
          { href: '/tools/edu/sound-speed', label: '음속 계산기' },
        ]}
      >
        물리 상수는 CODATA·SI 정의값 기준입니다. 측정·계산 시 유효숫자와 단위를 함께 확인하세요.
      </Disclaimer>

      <div className={s.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'notation'} className={`${s.tabBtn} ${tab === 'notation' ? s.tabActive : ''}`} onClick={() => setTab('notation')}>접두어·표기 변환</button>
        <button type="button" role="tab" aria-selected={tab === 'units'} className={`${s.tabBtn} ${tab === 'units' ? s.tabActive : ''}`} onClick={() => setTab('units')}>과학 스케일 단위</button>
        <button type="button" role="tab" aria-selected={tab === 'constants'} className={`${s.tabBtn} ${tab === 'constants' ? s.tabActive : ''}`} onClick={() => setTab('constants')}>물리 상수표</button>
      </div>

      {tab === 'notation' && <NotationTab />}
      {tab === 'units' && <UnitsTab />}
      {tab === 'constants' && <ConstantsTab />}
    </div>
  )
}

/* ─────────────── 탭 1: SI 접두어 ↔ 과학적/공학적 표기 ─────────────── */
function NotationTab() {
  // 입력 = 가수 + 접두어(지수). 기본 1.5 µ
  const [mantissaStr, setMantissaStr] = useState('1.5')
  const [prefixExp, setPrefixExp] = useState(-6) // µ
  const [copied, setCopied] = useState<string | null>(null)

  const value = useMemo(() => {
    const m = parseFloat(mantissaStr)
    if (!Number.isFinite(m)) return NaN
    return m * Math.pow(10, prefixExp)
  }, [mantissaStr, prefixExp])

  const sci = useMemo(() => (Number.isFinite(value) ? toScientific(value) : null), [value])
  const eng = useMemo(() => (Number.isFinite(value) ? toEngineering(value) : null), [value])
  const pre = useMemo(() => (Number.isFinite(value) ? toPrefix(value) : null), [value])

  const copy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(key); setTimeout(() => setCopied(null), 1200)
  }

  const rows = Number.isFinite(value) ? [
    { key: 'plain', name: '일반 표기', display: fmtPlain(value), copyText: String(value) },
    { key: 'sci', name: '과학적 표기', display: sci ? `${fmtSig(sci.mantissa)} × 10${supExp(sci.exp)}` : '', copyText: sci ? `${fmtSig(sci.mantissa)}e${sci.exp}` : '' },
    { key: 'eng', name: '공학적 표기 (지수 3배수)', display: eng ? `${fmtSig(eng.mantissa)} × 10${supExp(eng.exp)}` : '', copyText: eng ? `${fmtSig(eng.mantissa)}e${eng.exp}` : '' },
    { key: 'pre', name: 'SI 접두어', display: pre ? `${fmtSig(pre.mantissa)} ${pre.prefix.symbol || '(기본)'}` : '', copyText: pre ? `${fmtSig(pre.mantissa)}${pre.prefix.symbol}` : '' },
  ] : []

  return (
    <>
      <div className={s.card}>
        <div className={s.cardLabel}><span>값 입력</span><span className={s.cardHint}>가수 × 10ⁿ (접두어)</span></div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal" value={mantissaStr}
            onChange={e => setMantissaStr(e.target.value)} placeholder="1.5" />
          <select className={s.selUnit} value={prefixExp} onChange={e => setPrefixExp(Number(e.target.value))} aria-label="접두어">
            {SI_PREFIXES.map(p => (
              <option key={p.exp} value={p.exp}>{p.symbol ? `${p.symbol} · ` : ''}{p.name} (10{supExp(p.exp)})</option>
            ))}
          </select>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className={s.card}>
          <div className={s.cardLabel}><span>변환 결과</span><span className={s.cardHint}>탭하면 복사</span></div>
          <div className={s.resGrid}>
            {rows.map(r => (
              <button key={r.key} className={s.resRow} onClick={() => copy(r.key, r.copyText)}>
                <span className={s.resName}>{r.name}</span>
                <span className={s.resVal}>{r.display}</span>
                <span className={s.resCopy}>{copied === r.key ? '✓' : '복사'}</span>
              </button>
            ))}
          </div>
          <p className={s.note}>
            예) <strong>1.5 µ</strong> = 1.5×10⁻⁶ = 0.0000015. 공학적 표기는 지수를 항상 3의 배수로 맞춰 SI 접두어와 1:1 대응합니다.
          </p>
        </div>
      ) : (
        <div className={s.card}><p className={s.note}>숫자를 입력하면 일반·과학적·공학적 표기와 SI 접두어로 변환됩니다.</p></div>
      )}
    </>
  )
}

/* ─────────────── 탭 2: 과학 스케일 단위 ─────────────── */
function UnitsTab() {
  const [groupId, setGroupId] = useState(SCI_UNIT_GROUPS[0].id)
  const group = SCI_UNIT_GROUPS.find(g => g.id === groupId)!
  const [fromId, setFromId] = useState(group.units.find(u => u.id === 'A')?.id ?? group.units[0].id)
  const [valStr, setValStr] = useState('1')

  const changeGroup = (id: string) => {
    const g = SCI_UNIT_GROUPS.find(x => x.id === id)!
    setGroupId(id)
    setFromId(g.units[0].id)
  }

  const fromUnit = group.units.find(u => u.id === fromId) ?? group.units[0]
  const input = parseFloat(valStr)
  const baseValue = Number.isFinite(input) ? input * fromUnit.toBase : NaN

  return (
    <>
      <div className={s.card}>
        <div className={s.cardLabel}><span>도메인</span></div>
        <div className={s.groupTabs}>
          {SCI_UNIT_GROUPS.map(g => (
            <button key={g.id} type="button" className={`${s.groupTab} ${groupId === g.id ? s.groupTabActive : ''}`} onClick={() => changeGroup(g.id)}>
              {g.name}
            </button>
          ))}
        </div>
        <div className={s.inputRow}>
          <input className={s.numInput} type="number" inputMode="decimal" value={valStr}
            onChange={e => setValStr(e.target.value)} placeholder="1" />
          <select className={s.selUnit} value={fromId} onChange={e => setFromId(e.target.value)} aria-label="기준 단위">
            {group.units.map(u => (
              <option key={u.id} value={u.id}>{u.symbol} · {u.name}</option>
            ))}
          </select>
        </div>
      </div>

      {Number.isFinite(baseValue) ? (
        <div className={s.card}>
          <div className={s.cardLabel}>
            <span>전체 단위 환산</span>
            <span className={s.cardHint}>탭하면 기준 변경</span>
          </div>
          <div className={s.unitGrid}>
            {group.units.map(u => {
              const v = baseValue / u.toBase
              const isFrom = u.id === fromUnit.id
              return (
                <button key={u.id} className={`${s.unitCell} ${isFrom ? s.unitCellActive : ''}`}
                  onClick={() => { setFromId(u.id); setValStr(fmtSig(v)) }}>
                  <span className={s.unitCellName}>{u.symbol}<small>{u.name}</small></span>
                  <span className={s.unitCellVal}>{fmtPlain(v)}</span>
                </button>
              )
            })}
          </div>
          {fromUnit.note && <p className={s.note}><strong>{fromUnit.symbol}</strong> — {fromUnit.note}</p>}
        </div>
      ) : (
        <div className={s.card}><p className={s.note}>값을 입력하면 도메인 내 모든 단위로 환산됩니다.</p></div>
      )}
    </>
  )
}

/* ─────────────── 탭 3: 물리 상수표 ─────────────── */
function ConstantsTab() {
  return (
    <div className={s.card}>
      <div className={s.cardLabel}><span>주요 물리 상수</span><span className={s.cardHint}>CODATA·SI</span></div>
      <div style={{ overflowX: 'auto' }}>
        <table className={s.constTable}>
          <thead>
            <tr><th>기호</th><th>이름</th><th>값</th><th>단위</th></tr>
          </thead>
          <tbody>
            {CONSTANTS.map(c => (
              <tr key={c.symbol}>
                <td className={s.constSym}>{c.symbol}</td>
                <td>{c.name}</td>
                <td className={s.constVal}>{c.value}</td>
                <td className={s.constUnit}>{c.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.note}>
        ※ 2019년 SI 재정의 이후 c·h·e·k_B·N_A는 <strong>정의 상수(정확값)</strong>이며, G·m_e 등은 측정값(불확도 존재)입니다.
      </p>
    </div>
  )
}
