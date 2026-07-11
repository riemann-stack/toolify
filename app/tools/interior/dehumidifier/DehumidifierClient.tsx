'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  HOME_TYPES, ENV_FACTORS, PRODUCT_TIERS,
  calcDehumidifier, pyeongToSqm,
} from './dehumidifierData'
import s from './dehumidifier.module.css'

type AreaUnit = 'pyeong' | 'sqm'

export default function DehumidifierClient() {
  const [area, setArea] = useState('20')
  const [unit, setUnit] = useState<AreaUnit>('pyeong')
  const [home, setHome] = useState('apt')
  const [env, setEnv] = useState('normal')
  const [hours, setHours] = useState('6')
  const [won, setWon] = useState('160')

  const areaNum = parseFloat(area) || 0
  const areaSqm = unit === 'pyeong' ? pyeongToSqm(areaNum) : areaNum
  const valid = areaNum > 0

  const homeType = HOME_TYPES.find((h) => h.id === home) ?? HOME_TYPES[0]
  const envFactor = ENV_FACTORS.find((e) => e.id === env) ?? ENV_FACTORS[0]

  const result = useMemo(() => {
    if (!valid) return null
    return calcDehumidifier(
      areaSqm,
      homeType.coeff,
      envFactor.mult,
      parseFloat(hours) || 0,
      parseFloat(won) || 0,
    )
  }, [valid, areaSqm, homeType.coeff, envFactor.mult, hours, won])

  const fmt = (n: number, d = 1) => n.toLocaleString('ko-KR', { maximumFractionDigits: d })

  return (
    <div className={s.wrap}>
      {/* 면적 입력 */}
      <div className={s.card}>
        <div className={s.fieldHead}>
          <label className={s.fieldLabel} htmlFor="dehum-area">공간 면적</label>
          <div className={s.unitToggle} role="group" aria-label="면적 단위">
            {(['pyeong', 'sqm'] as AreaUnit[]).map((u) => (
              <button key={u} type="button"
                aria-pressed={unit === u}
                className={`${s.unitBtn} ${unit === u ? s.unitBtnActive : ''}`}
                onClick={() => setUnit(u)}>
                {u === 'pyeong' ? '평' : '㎡'}
              </button>
            ))}
          </div>
        </div>
        <div className={s.inputRow}>
          <input
            id="dehum-area"
            type="number"
            inputMode="decimal"
            min={0}
            step={unit === 'pyeong' ? 1 : 3}
            className={s.input}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            aria-label={`공간 면적 (${unit === 'pyeong' ? '평' : '제곱미터'})`}
          />
          <span className={s.unit}>{unit === 'pyeong' ? '평' : '㎡'}</span>
        </div>
        {valid && (
          <p className={s.subHint}>
            ≈ {unit === 'pyeong' ? `${fmt(areaSqm)} ㎡` : `${fmt(areaSqm / 3.305785)} 평`}
          </p>
        )}
      </div>

      {/* 주거 유형 */}
      <div className={s.card}>
        <p className={s.groupLabel}>주거 유형</p>
        <div className={s.btnGrid3}>
          {HOME_TYPES.map((h) => (
            <button key={h.id} type="button"
              aria-pressed={home === h.id}
              className={`${s.optBtn} ${home === h.id ? s.optBtnActive : ''}`}
              onClick={() => setHome(h.id)}>
              <span className={s.optName}>{h.name}</span>
              <span className={s.optNote}>{h.note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 습도 환경 */}
      <div className={s.card}>
        <p className={s.groupLabel}>습도 환경 <span className={s.groupSub}>(중복 상황은 더 습한 쪽 선택)</span></p>
        <div className={s.btnGrid2}>
          {ENV_FACTORS.map((e) => (
            <button key={e.id} type="button"
              aria-pressed={env === e.id}
              className={`${s.optBtn} ${env === e.id ? s.optBtnActive : ''}`}
              onClick={() => setEnv(e.id)}>
              <span className={s.optName}>{e.name}</span>
              <span className={s.optNote}>{e.note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 */}
      {result ? (
        <div className={s.resultCard} role="status">
          <p className={s.resultLabel}>하루 제거 수분량 (실사용 추정)</p>
          <p className={s.hero}>
            {fmt(result.dailyLiters)}<span className={s.heroUnit}>L / 일</span>
          </p>
          <p className={s.resultSub}>
            {homeType.name} · {envFactor.name} 기준 · {fmt(areaSqm)}㎡
          </p>

          <div className={s.tierBox}>
            <div className={s.tierMain}>
              <span className={s.tierLabel}>권장 제품 용량</span>
              <strong className={s.tierValue}>{result.tier.label}</strong>
              <span className={s.tierSpace}>{result.tier.space}</span>
            </div>
            <p className={s.tierNote}>
              제품 정격({result.tier.ratedL}L/일)은 30℃·80%RH 고온다습 조건 시험값이라 실사용 제거량보다 큽니다 — 여유분 포함이 정상입니다.
            </p>
          </div>

          <div className={s.powerBox}>
            <div className={s.powerRow}>
              <span className={s.powerKey}>정격 소비전력</span>
              <span className={s.powerVal}>{result.tier.watt} W</span>
            </div>
            <div className={s.powerRow}>
              <span className={s.powerKey}>월 소비전력량</span>
              <span className={s.powerVal}>{fmt(result.monthlyKwh)} kWh</span>
            </div>
            <div className={`${s.powerRow} ${s.powerRowMain}`}>
              <span className={s.powerKey}>월 추가 전기요금</span>
              <span className={s.powerValMain}>약 {fmt(result.monthlyCost, 0)} 원</span>
            </div>
          </div>

          {/* 가동시간·단가 */}
          <div className={s.assumeRow}>
            <div className={s.assumeField}>
              <label className={s.assumeLabel} htmlFor="dehum-hours">하루 가동</label>
              <div className={s.assumeInputWrap}>
                <input id="dehum-hours" type="number" inputMode="decimal" min={0} max={24}
                  className={s.assumeInput} value={hours}
                  onChange={(e) => setHours(e.target.value)} aria-label="하루 가동시간(시간)" />
                <span className={s.assumeUnit}>시간</span>
              </div>
            </div>
            <div className={s.assumeField}>
              <label className={s.assumeLabel} htmlFor="dehum-won">전기요금 단가</label>
              <div className={s.assumeInputWrap}>
                <input id="dehum-won" type="number" inputMode="numeric" min={0}
                  className={s.assumeInput} value={won}
                  onChange={(e) => setWon(e.target.value)} aria-label="전기요금 단가(원/kWh)" />
                <span className={s.assumeUnit}>원/kWh</span>
              </div>
            </div>
          </div>
          <p className={s.assumeNote}>
            단가는 주택용 누진 구간에 따라 100~280원/kWh로 달라집니다. 여름 3단계(450kWh 초과)는 kWh당 약 280원. 정확한 요금은 <a href="https://cyber.kepco.co.kr" target="_blank" rel="noopener noreferrer">한전 사이버지점</a>에서 확인하세요.
          </p>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.emptyNote}>
            0보다 큰 면적을 입력하면 하루 제거 수분량과 권장 제품 용량, 월 전기요금을 계산합니다.
          </p>
        </div>
      )}

      {/* 제품 등급 표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>시판 제품 용량 등급</p>
        <div className={s.tierList}>
          {PRODUCT_TIERS.map((t) => (
            <div key={t.ratedL}
              className={`${s.tierRow} ${result?.tier.ratedL === t.ratedL ? s.tierRowActive : ''}`}>
              <strong className={s.tierRowL}>{t.label}</strong>
              <span className={s.tierRowSpace}>{t.space}</span>
              <span className={s.tierRowWatt}>{t.watt}W</span>
              {result?.tier.ratedL === t.ratedL && <span className={s.tierRowBadge}>추천</span>}
            </div>
          ))}
        </div>
      </div>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/interior/ac-capacity', label: '에어컨 평형 계산기' },
          { href: '/tools/interior/ventilation', label: '환기량 계산기' },
          { href: '/tools/life/laundry-dry', label: '빨래 건조 시간 계산기' },
        ]}
        sources={[
          { label: '한국환경산업기술원 실내공기질', href: 'https://www.keiti.re.kr' },
        ]}
      >
        제습량은 업계 통용 가이드(아파트 평당 약 0.76L·주택 1.02L)에 습도 환경 보정을 곱한 추정치입니다. 실제 필요량은 외기 습도·환기·침수 이력에 따라 달라지며, 제품 정격은 제조사 스펙(30℃·80%RH)을 확인하세요.
      </Disclaimer>
    </div>
  )
}
