'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './hardness.module.css'
import {
  SCALES, KNIFE_EXAMPLES, TOOL_EXAMPLES, MOHS_TABLE, SHORE_NOTE,
  convertHardness, inRange, tableRange,
  type Scale,
} from './hardnessData'

const STORAGE_KEY = 'youtil_hardness_v1'
const PRESETS: { label: string; scale: Scale; value: number }[] = [
  { label: '주방칼',     scale: 'hrc', value: 56 },
  { label: 'EDC 폴딩',   scale: 'hrc', value: 60 },
  { label: '프리미엄',   scale: 'hrc', value: 62 },
  { label: 'HSS 드릴',   scale: 'hrc', value: 64 },
  { label: '저탄소강',   scale: 'hrb', value: 80 },
  { label: '주철',       scale: 'hb',  value: 200 },
]

export default function HardnessClient() {
  const [scale, setScale] = useState<Scale>('hrc')
  const [input, setInput] = useState('60')

  useEffect(() => {
    // localStorage 복원 — 마운트 후 1회, 하이드레이션 안전 패턴(의도됨)
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw) as { scale?: unknown; input?: unknown }
      // scale은 반드시 SCALES enum 검증 — 오염된 값이면 inRange/SCALES.find가 전부 무너져 도구가 크래시
      if (typeof j.scale === 'string' && SCALES.some((sc) => sc.id === j.scale)) setScale(j.scale as Scale)
      if (typeof j.input === 'string' && j.input.length <= 12) setInput(j.input)
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale, input })) } catch {}
  }, [scale, input])

  const value = parseFloat(input) || 0
  const valid = value > 0
  const result = useMemo(() => valid ? convertHardness(scale, value) : null, [scale, value, valid])

  const fmt = (n: number | null, scaleId: Scale): string => {
    if (n === null || !isFinite(n)) return '—'
    if (scaleId === 'hrc' || scaleId === 'hrb') return n.toFixed(1)
    if (scaleId === 'tensile') return Math.round(n).toLocaleString('en-US')
    return Math.round(n).toString()
  }

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/unit/converter', label: '단위 변환기' },
          { href: '/tools/interior/wire', label: '전선 굵기' },
          { href: '/tools/interior/screw', label: '나사·피스' },
        ]}
        sources={[
          { label: 'ASTM E140 — 금속 경도 환산 표준', href: 'https://www.astm.org/e0140-12br19e01.html' },
          { label: 'ISO 18265 — 경도값의 인장강도 환산', href: 'https://www.iso.org/standard/53810.html' },
        ]}
      >
        경도 상호 환산은 ASTM E140(Table 1·2), 인장강도 추정은 ISO 18265 표 A.1(비합금·저합금강) 기반 근사치입니다. ASTM은 재료별 편차가 커서 환산 오차의 신뢰한계를 일반화할 수 없다고 명시하며(합금 성분·열처리·표면 상태에 따라 편차 상이), 스테인리스 칼 강재는 Table 1 명시 재료(탄소강·합금강·공구강) 밖이라 편차가 더 클 수 있어요. 정밀 판정은 해당 스케일 실측이 원칙. 카바이드·비철금속·고무·플라스틱(Shore)에는 적용되지 않습니다.
      </Disclaimer>

      {/* 스케일 선택 */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 입력 스케일</span>
        <div className={s.scaleGrid}>
          {SCALES.map((sc) => (
            <button key={sc.id} type="button"
              aria-pressed={scale === sc.id}
              className={`${s.scaleBtn} ${scale === sc.id ? s.scaleBtnActive : ''}`}
              onClick={() => setScale(sc.id)}>
              <span className={s.scaleName}>{sc.name}</span>
              <span className={s.scaleFull}>{sc.fullName}</span>
            </button>
          ))}
        </div>
        <p className={s.scaleDesc}>
          <strong className={s.accent}>{SCALES.find(x => x.id === scale)?.fullName}</strong> ·
          {' '}{SCALES.find(x => x.id === scale)?.desc}
        </p>
        <p className={s.scaleMeta}>
          압자: <strong>{SCALES.find(x => x.id === scale)?.indenter}</strong> · 하중: <strong>{SCALES.find(x => x.id === scale)?.load}</strong> · 측정 범위: <strong>{SCALES.find(x => x.id === scale)?.range.join('~')}{SCALES.find(x => x.id === scale)?.unit ? ' ' + SCALES.find(x => x.id === scale)?.unit : ''}</strong>
        </p>
      </div>

      {/* 값 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>2. 경도 값</span>
        <div className={s.inputRow}>
          <input
            type="number"
            inputMode="decimal"
            step={scale === 'tensile' || scale === 'hv' || scale === 'hb' ? 1 : 0.1}
            min={0}
            className={s.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={`${SCALES.find(x => x.id === scale)?.fullName ?? '경도'} 값 입력`}
          />
          <span className={s.unit}>{SCALES.find(x => x.id === scale)?.name}{SCALES.find(x => x.id === scale)?.unit ? ' ' + SCALES.find(x => x.id === scale)?.unit : ''}</span>
        </div>
        {valid && !inRange(scale, value) && (
          <p className={s.warn}>
            ⚠️ 입력값이 {SCALES.find(x => x.id === scale)?.name}의 실용 측정 범위
            ({SCALES.find(x => x.id === scale)?.range.join('~')})를 벗어났습니다.
          </p>
        )}
        <div className={s.presetRow}>
          {PRESETS.map((p, i) => (
            <button key={i} type="button"
              className={s.presetBtn}
              onClick={() => { setScale(p.scale); setInput(String(p.value)) }}>
              {p.label} <small>{p.value} {SCALES.find(x => x.id === p.scale)?.name}</small>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 카드 */}
      {result ? (
        <div role="status">
          {result.outOfRange && (
            <p className={s.warn} style={{ margin: '0 0 8px' }}>
              ⚠️ 입력값이 환산표 수록 범위({tableRange(scale)?.join('~')} {SCALES.find(x => x.id === scale)?.name})를
              벗어나 환산할 수 없습니다. 범위 안의 값을 입력하세요.
            </p>
          )}
          <div className={s.resultGrid}>
            {SCALES.map((sc) => {
              const v = result[sc.id]
              const isInput = sc.id === scale
              const isInScaleRange = inRange(sc.id, v)
              return (
                <div key={sc.id} className={`${s.resCard} ${isInput ? s.resCardInput : ''} ${v === null || !isInScaleRange ? s.resCardDim : ''}`}>
                  <div className={s.resHead}>
                    <span className={s.resName}>{sc.name}</span>
                    {isInput && <span className={s.inputTag}>입력</span>}
                  </div>
                  <div className={s.resValue}>
                    {fmt(v, sc.id)}
                    {sc.unit && v !== null && <span className={s.resUnit}>{sc.unit}</span>}
                  </div>
                  <div className={s.resFull}>{sc.fullName}</div>
                  {v !== null && !isInScaleRange && (
                    <div className={s.resRange}>범위 외 (참고만)</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.note} style={{ margin: 0 }}>
            0보다 큰 경도 값을 입력하면 HRC·HV·HB·HRB·인장강도 5개 스케일로 동시 환산합니다.
          </p>
        </div>
      )}

      {/* 칼 경도 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>칼 경도 가이드</span>
        <div className={s.refList}>
          {KNIFE_EXAMPLES.map((k) => (
            <ExampleRow key={k.name} item={k} currentHrc={result?.hrc ?? null} />
          ))}
        </div>
      </div>

      {/* 공구 경도 가이드 */}
      <div className={s.card}>
        <span className={s.cardLabel}>공구·부품 경도 가이드</span>
        <div className={s.refList}>
          {TOOL_EXAMPLES.map((k) => (
            <ExampleRow key={k.name} item={k} currentHrc={result?.hrc ?? null} />
          ))}
        </div>
      </div>

      {/* 모스 경도 비교 */}
      <div className={s.card}>
        <span className={s.cardLabel}>모스(Mohs) 경도 비교</span>
        <div className={s.mohsList}>
          {MOHS_TABLE.map((m) => (
            <div key={m.mohs} className={s.mohsRow}>
              <span className={s.mohsNum}>{m.mohs}</span>
              <span className={s.mohsName}>{m.mineral}</span>
              <span className={s.mohsHv}>HV {m.approxHv ?? '—'}</span>
              <span className={s.mohsNote}>{m.note ?? ''}</span>
            </div>
          ))}
        </div>
        <p className={s.note}>
          ⓘ 모스 경도는 <strong>긁힘 저항</strong> 기반 정성 척도라 비커스(HV)와 정확히 1:1 대응하지 않습니다 (특히 8~10 범위는 비선형). 표는 대략 비교용.
        </p>
      </div>

      {/* Shore 분리 안내 */}
      <div className={s.shoreCard}>
        <strong className={s.shoreTitle}>{SHORE_NOTE.title}</strong>
        <p className={s.shoreBody}>{SHORE_NOTE.body}</p>
      </div>
    </div>
  )
}

/* ─── 예시 행 — 현재 입력값과 매칭되는 항목 강조 ──────────── */
function ExampleRow({ item, currentHrc }: { item: { name: string; hrcMin: number; hrcMax: number; note?: string; unit?: string }; currentHrc: number | null }) {
  // unit 지정 행(HRB 등)은 HRC 값이 아니므로 현재 값 매칭에서 제외
  const matches = !item.unit && currentHrc !== null && currentHrc >= item.hrcMin && currentHrc <= item.hrcMax
  return (
    <div className={`${s.refRow} ${matches ? s.refRowMatch : ''}`}>
      <div className={s.refMain}>
        <span className={s.refName}>{item.name}</span>
        {item.note && <span className={s.refNote}>{item.note}</span>}
      </div>
      <span className={s.refHrc}>
        <strong>{item.hrcMin === item.hrcMax ? item.hrcMin : `${item.hrcMin}~${item.hrcMax}`}</strong>
        <small>{item.unit ?? 'HRC'}</small>
      </span>
      {matches && <span className={s.refMatchBadge}>현재 값</span>}
    </div>
  )
}
