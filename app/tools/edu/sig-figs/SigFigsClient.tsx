'use client'

import { useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './sig-figs.module.css'
import {
  countSigFigs, roundSig, toSigString, pretty, prettyExp,
  formatMeasurement, propagate, type PropOp,
} from './sigFigsUtils'

type Tab = 'sigfig' | 'error' | 'propagate'

export default function SigFigsClient() {
  const [tab, setTab] = useState<Tab>('sigfig')

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/edu/sci-units', label: '과학 단위 변환기' },
          { href: '/tools/edu/fermi-estimate', label: '페르미 추정' },
          { href: '/tools/unit/converter', label: '단위 변환기' },
        ]}
      >
        교육·실험 보고서 참고용입니다. 유효숫자·반올림 관례는 분야(물리·화학·공학)와 교재에 따라 조금씩 다를 수 있으니, 제출 기준을 함께 확인하세요. 오차 전파는 측정 오차가 <strong>서로 독립</strong>이라고 가정합니다.
      </Disclaimer>

      <div className={s.tabs} role="tablist">
        <button type="button" className={`${s.tabBtn} ${tab === 'sigfig' ? s.tabActive : ''}`} onClick={() => setTab('sigfig')}>유효숫자·반올림</button>
        <button type="button" className={`${s.tabBtn} ${tab === 'error' ? s.tabActive : ''}`} onClick={() => setTab('error')}>오차 계산</button>
        <button type="button" className={`${s.tabBtn} ${tab === 'propagate' ? s.tabActive : ''}`} onClick={() => setTab('propagate')}>오차 전파 ⭐</button>
      </div>

      {tab === 'sigfig' && <SigFigTab />}
      {tab === 'error' && <ErrorTab />}
      {tab === 'propagate' && <PropagateTab />}
    </div>
  )
}

/* ─────────────── 탭 1: 유효숫자·반올림 ─────────────── */
function SigFigTab() {
  const [raw, setRaw] = useState('0.004560')
  const [sig, setSig] = useState(3)
  const [dec, setDec] = useState(2)

  const info = useMemo(() => countSigFigs(raw), [raw])
  const num = useMemo(() => parseFloat(raw), [raw])
  const valid = Number.isFinite(num)

  const roundedSig = valid ? toSigString(roundSig(num, sig), sig) : '—'
  const roundedDec = valid ? num.toFixed(dec) : '—'
  const scientific = valid && num !== 0 ? prettyExp(num, Math.max(1, info.count ?? 3)) : (valid ? '0' : '—')

  return (
    <>
      <div className={s.card}>
        <div className={s.cardLabel}><span>측정값 입력</span><span className={s.cardHint}>예: 0.004560, 1500, 1.23e4</span></div>
        <input className={s.numInput} type="text" inputMode="decimal" value={raw}
          onChange={(e) => setRaw(e.target.value)} placeholder="0.004560" />
      </div>

      {valid ? (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}><span>유효숫자 판별</span></div>
            <div className={s.sigBig}>
              {info.count != null ? <><span className={s.sigNum}>{info.count}</span><span className={s.sigUnit}>개</span></> : <span className={s.sigNa}>판별 불가</span>}
            </div>
            {info.ambiguous && (
              <p className={s.warn}>
                ⚠️ 후행 0이 모호합니다. <strong>{raw.trim()}</strong>의 끝자리 0이 유효한지 표기만으로 알 수 없어요.
                과학적 표기(예: {scientific})로 쓰면 명확해집니다.
              </p>
            )}
          </div>

          <div className={s.card}>
            <div className={s.cardLabel}><span>반올림</span><span className={s.cardHint}>자리수 선택</span></div>

            <div className={s.ctrlRow}>
              <label className={s.ctrlLabel}>유효숫자</label>
              <select className={s.sel} value={sig} onChange={(e) => setSig(Number(e.target.value))} aria-label="유효숫자 자리">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}자리</option>)}
              </select>
              <span className={s.eq}>→</span>
              <span className={s.outVal}>{roundedSig}</span>
            </div>

            <div className={s.ctrlRow}>
              <label className={s.ctrlLabel}>소수점</label>
              <select className={s.sel} value={dec} onChange={(e) => setDec(Number(e.target.value))} aria-label="소수점 자리">
                {[0, 1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}자리</option>)}
              </select>
              <span className={s.eq}>→</span>
              <span className={s.outVal}>{roundedDec}</span>
            </div>

            <div className={s.ctrlRow}>
              <label className={s.ctrlLabel}>과학적 표기</label>
              <span className={s.eq} style={{ visibility: 'hidden' }}>→</span>
              <span className={s.outVal} style={{ marginLeft: 'auto' }}>{scientific}</span>
            </div>
          </div>
        </>
      ) : (
        <div className={s.card}><p className={s.note}>숫자를 입력하면 유효숫자 개수와 반올림 결과가 표시됩니다.</p></div>
      )}
    </>
  )
}

/* ─────────────── 탭 2: 오차 계산 ─────────────── */
type ErrMode = 'accuracy' | 'uncertainty'
function ErrorTab() {
  const [mode, setMode] = useState<ErrMode>('accuracy')

  // 참값 비교
  const [measured, setMeasured] = useState('9.78')
  const [trueVal, setTrueVal] = useState('9.81')
  // 불확도 변환
  const [value, setValue] = useState('25.4')
  const [absErr, setAbsErr] = useState('0.3')

  const acc = useMemo(() => {
    const m = parseFloat(measured), t = parseFloat(trueVal)
    if (!Number.isFinite(m) || !Number.isFinite(t) || t === 0) return null
    const abs = m - t
    const rel = Math.abs(abs) / Math.abs(t)
    return { abs, absAbs: Math.abs(abs), relPct: rel * 100 }
  }, [measured, trueVal])

  const unc = useMemo(() => {
    const v = parseFloat(value), e = parseFloat(absErr)
    if (!Number.isFinite(v) || !Number.isFinite(e) || v === 0) return null
    return { fmt: formatMeasurement(v, e), relPct: (e / Math.abs(v)) * 100 }
  }, [value, absErr])

  return (
    <>
      <div className={s.segRow}>
        <button type="button" className={`${s.seg} ${mode === 'accuracy' ? s.segActive : ''}`} onClick={() => setMode('accuracy')}>참값 비교 (정확도)</button>
        <button type="button" className={`${s.seg} ${mode === 'uncertainty' ? s.segActive : ''}`} onClick={() => setMode('uncertainty')}>불확도 표현</button>
      </div>

      {mode === 'accuracy' ? (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}><span>측정값 vs 참값(이론값)</span></div>
            <div className={s.twoCol}>
              <div>
                <label className={s.miniLabel}>측정값</label>
                <input className={s.numInput} type="number" inputMode="decimal" value={measured} onChange={(e) => setMeasured(e.target.value)} placeholder="9.78" />
              </div>
              <div>
                <label className={s.miniLabel}>참값(이론·인정값)</label>
                <input className={s.numInput} type="number" inputMode="decimal" value={trueVal} onChange={(e) => setTrueVal(e.target.value)} placeholder="9.81" />
              </div>
            </div>
          </div>
          {acc ? (
            <div className={s.card}>
              <div className={s.cardLabel}><span>오차</span></div>
              <div className={s.resGrid}>
                <Row name="절대오차 (측정−참)" val={pretty(acc.abs)} />
                <Row name="절대오차 |값|" val={pretty(acc.absAbs)} />
                <Row name="상대오차" val={`${pretty(acc.relPct / 100, 4)}`} />
                <Row name="백분율오차" val={`${Number(acc.relPct.toPrecision(3))} %`} accent />
              </div>
              <p className={s.note}>백분율오차 = |측정값 − 참값| ÷ |참값| × 100. 값이 작을수록 정확합니다.</p>
            </div>
          ) : <div className={s.card}><p className={s.note}>측정값과 0이 아닌 참값을 입력하세요.</p></div>}
        </>
      ) : (
        <>
          <div className={s.card}>
            <div className={s.cardLabel}><span>측정값 ± 절대불확도</span></div>
            <div className={s.twoCol}>
              <div>
                <label className={s.miniLabel}>측정값</label>
                <input className={s.numInput} type="number" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="25.4" />
              </div>
              <div>
                <label className={s.miniLabel}>절대불확도 δ</label>
                <input className={s.numInput} type="number" inputMode="decimal" value={absErr} onChange={(e) => setAbsErr(e.target.value)} placeholder="0.3" />
              </div>
            </div>
          </div>
          {unc ? (
            <div className={s.card}>
              <div className={s.cardLabel}><span>정리된 표현</span></div>
              <div className={s.measureBig}>{unc.fmt.valueStr} ± {unc.fmt.errorStr}</div>
              <div className={s.resGrid} style={{ marginTop: 10 }}>
                <Row name="상대불확도" val={pretty(unc.relPct / 100, 4)} />
                <Row name="백분율 불확도" val={`${Number(unc.relPct.toPrecision(3))} %`} accent />
              </div>
              <p className={s.note}>불확도는 보통 1~2개 유효숫자로 반올림하고, 측정값을 같은 소수 자리에 맞춥니다.</p>
            </div>
          ) : <div className={s.card}><p className={s.note}>0이 아닌 측정값과 불확도를 입력하세요.</p></div>}
        </>
      )}
    </>
  )
}

/* ─────────────── 탭 3: 오차 전파 ─────────────── */
const OPS: { id: PropOp; label: string; sym: string }[] = [
  { id: 'add', label: '덧셈', sym: '+' },
  { id: 'sub', label: '뺄셈', sym: '−' },
  { id: 'mul', label: '곱셈', sym: '×' },
  { id: 'div', label: '나눗셈', sym: '÷' },
  { id: 'pow', label: '거듭제곱', sym: 'Aⁿ' },
]
function PropagateTab() {
  const [op, setOp] = useState<PropOp>('mul')
  const [a, setA] = useState('12.0')
  const [da, setDa] = useState('0.2')
  const [b, setB] = useState('3.40')
  const [db, setDb] = useState('0.05')
  const [n, setN] = useState('2')

  const res = useMemo(() => propagate(
    op,
    parseFloat(a), parseFloat(da),
    parseFloat(b), parseFloat(db),
    parseFloat(n),
  ), [op, a, da, b, db, n])

  const isPow = op === 'pow'
  const fmt = res ? formatMeasurement(res.value, res.errQuad) : null
  const fmtMax = res ? formatMeasurement(res.value, res.errMax) : null

  return (
    <>
      <div className={s.card}>
        <div className={s.cardLabel}><span>연산 선택</span></div>
        <div className={s.opRow}>
          {OPS.map((o) => (
            <button key={o.id} type="button" className={`${s.opBtn} ${op === o.id ? s.opActive : ''}`} onClick={() => setOp(o.id)}>
              <span className={s.opSym}>{o.sym}</span>
              <span className={s.opLbl}>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardLabel}><span>측정값 A ± δA</span></div>
        <div className={s.twoCol}>
          <div>
            <label className={s.miniLabel}>A</label>
            <input className={s.numInput} type="number" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="12.0" />
          </div>
          <div>
            <label className={s.miniLabel}>δA (불확도)</label>
            <input className={s.numInput} type="number" inputMode="decimal" value={da} onChange={(e) => setDa(e.target.value)} placeholder="0.2" />
          </div>
        </div>
      </div>

      {isPow ? (
        <div className={s.card}>
          <div className={s.cardLabel}><span>지수 n</span><span className={s.cardHint}>R = Aⁿ</span></div>
          <input className={s.numInput} type="number" inputMode="decimal" value={n} onChange={(e) => setN(e.target.value)} placeholder="2" />
        </div>
      ) : (
        <div className={s.card}>
          <div className={s.cardLabel}><span>측정값 B ± δB</span></div>
          <div className={s.twoCol}>
            <div>
              <label className={s.miniLabel}>B</label>
              <input className={s.numInput} type="number" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="3.40" />
            </div>
            <div>
              <label className={s.miniLabel}>δB (불확도)</label>
              <input className={s.numInput} type="number" inputMode="decimal" value={db} onChange={(e) => setDb(e.target.value)} placeholder="0.05" />
            </div>
          </div>
        </div>
      )}

      {res && fmt && fmtMax ? (
        <div className={s.card}>
          <div className={s.cardLabel}><span>전파 결과</span><span className={s.cardHint}>독립 오차 가정</span></div>
          <div className={s.measureBig}>{fmt.valueStr} ± {fmt.errorStr}</div>
          <div className={s.resGrid} style={{ marginTop: 10 }}>
            <Row name="표준 불확도 δR (제곱합)" val={pretty(res.errQuad, 3)} accent />
            <Row name="상대 불확도" val={`${Number(res.relPctQuad.toPrecision(3))} %`} />
            <Row name="최대 오차 (단순 합·상한)" val={`± ${pretty(res.errMax, 3)}`} />
          </div>
          <p className={s.formula}>{res.formula}</p>
          <p className={s.note}>
            <strong>제곱합(quadrature)</strong>은 오차가 서로 독립인 무작위 오차일 때 표준 방법입니다.
            <strong> 최대 오차</strong>는 모든 오차가 같은 방향으로 겹친 최악의 경우(상한)입니다.
          </p>
        </div>
      ) : (
        <div className={s.card}><p className={s.note}>값과 불확도를 입력하면 오차가 전파됩니다. (곱·나눗셈은 0이 아닌 값 필요)</p></div>
      )}
    </>
  )
}

/* ─────────────── 공용 결과 행 ─────────────── */
function Row({ name, val, accent }: { name: string; val: string; accent?: boolean }) {
  return (
    <div className={s.resRow}>
      <span className={s.resName}>{name}</span>
      <span className={`${s.resVal} ${accent ? s.resAccent : ''}`}>{val}</span>
    </div>
  )
}
