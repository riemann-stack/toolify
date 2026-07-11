'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  STAGES, BASES, calcPorridge, calcBatch,
  SOAK_FACTOR, COOK_FACTOR, RICE_CUP_G,
  type StageId, type BasisId,
} from './babyPorridgeData'
import s from './baby-porridge.module.css'

export default function BabyPorridgeClient() {
  const [stageId, setStageId] = useState<StageId>('early')
  const [basis, setBasis] = useState<BasisId>('soaked')
  const [amount, setAmount] = useState('50')
  const [ratio, setRatio] = useState<number | null>(null) // null = 단계 기본값
  const [days, setDays] = useState(3)

  const stage = STAGES.find((st) => st.id === stageId)!
  const activeRatio = ratio !== null && stage.ratioOptions.includes(ratio) ? ratio : stage.ratioDefault

  const result = useMemo(
    () => calcPorridge(stage, basis, amount, activeRatio),
    [stage, basis, amount, activeRatio],
  )
  const batch = useMemo(() => calcBatch(stage, days, activeRatio), [stage, days, activeRatio])

  const basisInfo = BASES.find((b) => b.id === basis)!
  const fmt = (n: number) => n.toLocaleString('ko-KR')

  return (
    <div className={s.wrap}>
      {/* 단계 선택 */}
      <div className={s.card}>
        <p className={s.groupLabel}>이유식 단계</p>
        <div className={s.stageGrid} role="group" aria-label="이유식 단계 선택">
          {STAGES.map((st) => (
            <button
              key={st.id} type="button"
              className={`${s.stageBtn} ${st.id === stageId ? s.stageOn : ''}`}
              aria-pressed={st.id === stageId}
              onClick={() => { setStageId(st.id); setRatio(null) }}
            >
              <span className={s.stageName}>{st.label}</span>
              <span className={s.stageMonths}>{st.months}</span>
              <span className={s.stageRatio}>{st.ratioDefault}배죽 · {st.texture.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* 배죽 조절 */}
        {stage.ratioOptions.length > 1 && (
          <div className={s.ratioRow} role="group" aria-label="배죽 되기 조절">
            <span className={s.ratioLabel}>되기 조절</span>
            {stage.ratioOptions.map((r) => (
              <button
                key={r} type="button"
                className={`${s.ratioBtn} ${r === activeRatio ? s.ratioOn : ''}`}
                aria-pressed={r === activeRatio}
                onClick={() => setRatio(r)}
              >
                {r}배죽
              </button>
            ))}
          </div>
        )}

        {/* 재료 기준 + 양 */}
        <div className={s.inputRow}>
          <div className={s.basisGroup} role="group" aria-label="재료 기준 선택">
            {BASES.map((b) => (
              <button
                key={b.id} type="button"
                className={`${s.basisBtn} ${b.id === basis ? s.basisOn : ''}`}
                aria-pressed={b.id === basis}
                onClick={() => setBasis(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className={s.amountBox}>
            <input
              id="bp-amount" className={s.amountInput}
              type="text" inputMode="decimal" value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              aria-label={`${basisInfo.label} 양 (그램)`}
            />
            <span className={s.amountUnit}>g</span>
          </div>
        </div>
        <p className={s.groupNote}>
          {basis === 'soaked' && '배죽의 기준이 되는 재료예요. 쌀을 20~30분 불린 뒤 무게를 재세요.'}
          {basis === 'dry' && `생쌀은 불리면 약 ${SOAK_FACTOR}배(1.2~1.35배)가 돼요 — 불린쌀로 환산해 계산합니다.`}
          {basis === 'flour' && '쌀가루는 수분을 많이 흡수해 불린쌀보다 물을 1.5~2배 더 잡아요(초기 15~20배).'}
          {basis === 'bap' && `밥은 이미 생쌀의 약 ${COOK_FACTOR}배 무게(수분 포함)라 물을 훨씬 적게 넣어요.`}
        </p>
      </div>

      {/* 결과 히어로 */}
      <div className={s.resultCard} role="status">
        <p className={s.resultLabel}>{stage.label} {basis === 'bap' ? '밥죽' : `${activeRatio}배죽`} — 물양</p>
        {result.waterMl !== null ? (
          <>
            <p className={s.hero}>
              {fmt(result.waterMl)}<span className={s.heroUnit}>ml</span>
            </p>
            <p className={s.resultSub}>
              {basisInfo.label} {fmt(parseFloat(amount))}g
              {result.soakedEquivG !== null && basis === 'dry' && <> (불린쌀 약 {fmt(result.soakedEquivG)}g)</>}
              {' '}: 물 {fmt(result.waterMl)}ml
              {basis !== 'soaked' && result.effectiveRatio !== null && <> · 입력 기준 약 {result.effectiveRatio}배</>}
            </p>
            {result.yieldG && result.meals && (
              <div className={s.subGrid}>
                <div className={s.subItem}>
                  <span className={s.subLabel}>예상 완성량</span>
                  <span className={s.subValue}>약 {fmt(result.yieldG[0])}~{fmt(result.yieldG[1])}g</span>
                </div>
                <div className={s.subItem}>
                  <span className={s.subLabel}>{stage.label} 한 끼 {stage.mealG[0]}~{stage.mealG[1]}g 기준</span>
                  <span className={s.subValue}>약 {result.meals[0]}~{result.meals[1]}끼</span>
                </div>
              </div>
            )}
            <p className={s.yieldNote}>완성량은 끓이는 시간·화력에 따라 줄어드는 정도가 달라요 (참고치).</p>
          </>
        ) : (
          <p className={s.emptyNote}>{result.notice ?? `${basisInfo.label} 양(g)을 입력하면 물양을 계산해요.`}</p>
        )}
      </div>

      {/* 역방향: 큐브 소분 */}
      <div className={s.card}>
        <p className={s.groupLabel}>🧊 며칠치 만들까? — 큐브 소분 역산</p>
        <div className={s.daysRow} role="group" aria-label="만들 일수 선택">
          {[2, 3, 4, 5].map((d) => (
            <button
              key={d} type="button"
              className={`${s.dayBtn} ${d === days ? s.dayOn : ''}`}
              aria-pressed={d === days}
              onClick={() => setDays(d)}
            >
              {d}일치
            </button>
          ))}
        </div>
        {batch && (
          <div className={s.batchBox}>
            <p className={s.batchLine}>
              {stage.label} 하루 {stage.mealsPerDay}회 × {days}일 = <strong>{batch.cubeCount}끼</strong>
              {' '}(한 끼 약 {batch.cubeMl}ml 큐브·용기 {batch.cubeCount}개)
            </p>
            <p className={s.batchLine}>
              필요한 양: <strong>불린쌀 약 {fmt(batch.soakedG)}g + 물 약 {fmt(batch.waterMl)}ml</strong>
              {' '}({activeRatio}배죽 · 완성 약 {fmt(batch.totalG)}g)
            </p>
            <p className={s.groupNote}>3일분씩 만들어 큐브·이유식 용기에 소분 냉동하는 관행 기준이에요. 냉동 보관은 1~2주 안에 소진을 권장.</p>
          </div>
        )}
      </div>

      {/* 단계별 참고표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>단계별 배죽·한 끼 양 참고표</p>
        <div className={s.tableScroll}>
          <table className={s.refTable}>
            <thead>
              <tr>
                <th scope="col">단계</th>
                <th scope="col">배죽(불린쌀)</th>
                <th scope="col">형태</th>
                <th scope="col">한 끼</th>
                <th scope="col">횟수</th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map((st) => (
                <tr key={st.id} className={st.id === stageId ? s.rowOn : undefined}>
                  <td><strong>{st.label}</strong> <span className={s.dim}>{st.months}</span></td>
                  <td>{st.id === 'early' ? '10배죽 (쌀가루 15~20배)' : st.ratioOptions.length > 1 ? `${st.ratioOptions[0]}~${st.ratioOptions[st.ratioOptions.length - 1]}배죽` : `${st.ratioDefault}배죽`}</td>
                  <td>{st.texture}</td>
                  <td>{st.mealG[0]}~{st.mealG[1]}g</td>
                  <td>하루 {st.mealsPerDay}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.groupNote}>
          배죽 수치는 공식 규격이 아닌 육아 서적·레시피 플랫폼의 통용 관행이에요. {STAGES.find((st) => st.id === stageId)?.note}
        </p>
      </div>

      {/* 환산 미니표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>쌀 환산 참고</p>
        <ul className={s.convList}>
          <li>생쌀 → 불린쌀: 약 <strong>×{SOAK_FACTOR}</strong> (1.2~1.35배, 20~30분 불림 기준)</li>
          <li>생쌀 → 밥: 약 <strong>×{COOK_FACTOR}</strong> (2.2~2.5배, 물양·밥솥 따라 편차)</li>
          <li>밥솥 계량컵 1컵(180ml) = 쌀 약 <strong>{RICE_CUP_G}g</strong></li>
          <li>밥죽 물 배수: 초기 밥 1 : 물 5~6 · 중기 1 : 3.5 안팎 · 후기 1 : 2 안팎</li>
        </ul>
      </div>

      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/cooking/recipe', label: '레시피 비율 계산기' },
          { href: '/tools/cooking/thawing', label: '해동 시간 계산기' },
          { href: '/tools/health/child-height', label: '자녀 키 예측 계산기' },
        ]}
        sources={[
          { label: '질병관리청 국가건강정보포털 — 이유기 보충식', href: 'https://health.kdca.go.kr' },
        ]}
      >
        배죽 비율·한 끼 양은 통용 관행 기반 참고치이며 공식 의료 지침이 아닙니다. 아기마다 발달 속도·소화 능력이 다르므로 시작 시기·진행 속도·알레르기 관련 판단은 소아청소년과 전문의와 상담하세요.
      </Disclaimer>
    </div>
  )
}
