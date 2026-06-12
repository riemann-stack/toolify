'use client'

import Disclaimer from '@/components/Disclaimer'
import { useEffect, useMemo, useState } from 'react'
import s from './car-tax.module.css'
import {
  calcCarTax, REGIONS, CAR_TYPE_LABEL, FUEL_LABEL, EXEMPTION_LABEL,
  TAX_TABLE_NON_BUSINESS, TRANSFER_NOTE, SAVING_TIPS,
  type CarType, type FuelType, type RegionId,
} from './carTaxData'

const STORAGE_KEY = 'youtil_car_tax_v1'

type Exemption = keyof typeof EXEMPTION_LABEL

export default function CarTaxClient() {
  /* 차량 정보 */
  const [carPrice, setCarPrice] = useState(30_000_000)
  const [carType, setCarType] = useState<CarType>('normal')
  const [fuelType, setFuelType] = useState<FuelType>('gasoline')
  const [cc, setCc] = useState(1999)
  const [yearsSinceReg, setYearsSinceReg] = useState(0)
  const [regionId, setRegionId] = useState<RegionId>('seoul')

  /* 운행 */
  const [monthlyKm, setMonthlyKm] = useState(1500)
  const [effStr, setEffStr] = useState('12')  // 연비 — 자유 입력(빈칸 허용)
  const effNum = parseFloat(effStr)
  const efficiencyKmL = Number.isFinite(effNum) && effNum > 0 ? effNum : 1

  /* 옵션 */
  const [prepay, setPrepay] = useState(true)
  const [exemption, setExemption] = useState<Exemption>('none')
  const [yearsToHold, setYearsToHold] = useState(5)

  /* 차종 변경 시 연료타입 자동 조정 — carType이 다른 state(fuelType/cc)의 규칙적 제약을
   *  강제하는 패턴이라 effect로 동기화. 사용자 명시 선택을 덮어쓰지 않게 carType만 의존성으로. */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (carType === 'ev' && fuelType !== 'electric') {
      setFuelType('electric')
      setCc(0)
    }
    if (carType === 'hybrid' && fuelType !== 'hybrid') {
      setFuelType('hybrid')
    }
    if (carType === 'light' && cc > 1000) setCc(998)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [carType, fuelType, cc])

  /* localStorage — 마운트 후 1회 복원, 하이드레이션 안전 패턴(의도됨) */
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (typeof j.carPrice === 'number') setCarPrice(j.carPrice)
      if (j.carType) setCarType(j.carType)
      if (j.fuelType) setFuelType(j.fuelType)
      if (typeof j.cc === 'number') setCc(j.cc)
      if (typeof j.yearsSinceReg === 'number') setYearsSinceReg(j.yearsSinceReg)
      if (j.regionId) setRegionId(j.regionId)
      if (typeof j.monthlyKm === 'number') setMonthlyKm(j.monthlyKm)
      if (typeof j.efficiencyKmL === 'number') setEffStr(String(j.efficiencyKmL))
      if (typeof j.prepay === 'boolean') setPrepay(j.prepay)
      if (j.exemption) setExemption(j.exemption)
      if (typeof j.yearsToHold === 'number') setYearsToHold(j.yearsToHold)
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        carPrice, carType, fuelType, cc, yearsSinceReg, regionId,
        monthlyKm, efficiencyKmL, prepay, exemption, yearsToHold,
      }))
    } catch {}
  }, [carPrice, carType, fuelType, cc, yearsSinceReg, regionId,
      monthlyKm, efficiencyKmL, prepay, exemption, yearsToHold])

  /* 계산 */
  const result = useMemo(() => calcCarTax({
    carPrice, carType, fuelType, cc, yearsSinceReg, regionId,
    monthlyKm, efficiencyKmL, prepay, exemption, yearsToHold,
  }), [carPrice, carType, fuelType, cc, yearsSinceReg, regionId,
      monthlyKm, efficiencyKmL, prepay, exemption, yearsToHold])

  const fmt = (n: number) => n.toLocaleString('ko-KR')
  const fmtMan = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만 원`

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/finance/car-cost',  label: '자동차 유지비 계산기' },
          { href: '/tools/finance/loan',      label: '대출이자 계산기' },
          { href: '/tools/finance/4-insurance', label: '4대보험 계산기' },
        ]}
        sources={[
          { label: '위택스(지방세)', href: 'https://www.wetax.go.kr' },
          { label: '국세청 홈택스', href: 'https://hometax.go.kr' },
        ]}
      >
        2026년 기준 자동차 세제 + 시장 평균 유류세. 친환경차 감면·다자녀 등 제도는 매년 일부 변경 — 등록 직전 정부24·홈택스 확인.
      </Disclaimer>

      {/* ── 1. 차량 정보 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🚗 1. 차량 정보</div>

        <div className={s.field}>
          <label htmlFor="car-tax-price">차량 가격 (출고가)</label>
          <div className={s.priceRow}>
            <input id="car-tax-price" type="text" inputMode="numeric"
              className={s.numInput}
              placeholder="30,000,000"
              value={carPrice ? carPrice.toLocaleString('ko-KR') : ''}
              onChange={e => {
                const digits = e.target.value.replace(/[^\d]/g, '')
                setCarPrice(digits ? parseInt(digits, 10) : 0)
              }} />
            <span className={s.unit}>원</span>
            {carPrice > 0 && <span className={s.priceLabel}>{fmtMan(carPrice)}</span>}
          </div>
        </div>

        <div className={s.subLabel} style={{ marginTop: 14 }}>차종</div>
        <div className={s.typeGrid} role="group" aria-label="차종 선택">
          {(Object.keys(CAR_TYPE_LABEL) as CarType[]).map(t => (
            <button key={t} type="button"
              aria-pressed={carType === t}
              className={`${s.typeBtn} ${carType === t ? s.typeActive : ''}`}
              onClick={() => setCarType(t)}>
              {CAR_TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <div className={s.grid2} style={{ marginTop: 14 }}>
          <div className={s.field}>
            <label htmlFor="car-tax-f2">연료</label>
            <select id="car-tax-f2" className={s.select}
              value={fuelType}
              onChange={e => setFuelType(e.target.value as FuelType)}
              disabled={carType === 'ev'}
            >
              {(Object.keys(FUEL_LABEL) as FuelType[]).map(f => (
                <option key={f} value={f}>{FUEL_LABEL[f]}</option>
              ))}
            </select>
          </div>
          <div className={s.field}>
            <label htmlFor="car-tax-cc">배기량 (cc) {carType === 'ev' && '— 전기차 N/A'}</label>
            <input id="car-tax-cc" type="number" inputMode="numeric"
              className={s.numInput}
              value={cc}
              disabled={carType === 'ev'}
              min={0} max={5000} step={1}
              onChange={e => setCc(parseInt(e.target.value) || 0)} />
          </div>
        </div>

        <div className={s.grid2} style={{ marginTop: 14 }}>
          <div className={s.field}>
            <label htmlFor="car-tax-f4">경과 년수</label>
            <input id="car-tax-f4" type="number" inputMode="numeric"
              className={s.numInput}
              value={yearsSinceReg} min={0} max={20} step={1}
              onChange={e => setYearsSinceReg(parseInt(e.target.value) || 0)} />
            <div className={s.fieldHint}>
              {yearsSinceReg < 3 ? '자동차세 감면 없음' :
                `자동차세 ${Math.min(50, (yearsSinceReg - 2) * 5)}% 감면`}
            </div>
          </div>
          <div className={s.field}>
            <label htmlFor="car-tax-f5">거주 지역</label>
            <select id="car-tax-f5" className={s.select}
              value={regionId}
              onChange={e => setRegionId(e.target.value as RegionId)}>
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (공채 {(r.bondRate * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. 운행 정보 (유류세용) ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>⛽ 2. 운행 정보 — 유류세 추정용</div>
        <div className={s.grid2}>
          <div className={s.field}>
            <label htmlFor="car-tax-distance">월 주행거리</label>
            <div className={s.priceRow}>
              <input id="car-tax-distance" type="number" inputMode="numeric"
                className={s.numInput}
                value={monthlyKm} min={0} max={5000} step={100}
                onChange={e => setMonthlyKm(parseInt(e.target.value) || 0)} />
              <span className={s.unit}>km</span>
            </div>
          </div>
          <div className={s.field}>
            <label htmlFor="car-tax-f7">연비 ({fuelType === 'electric' ? 'km/kWh' : 'km/L'})</label>
            <input id="car-tax-f7" type="text" inputMode="decimal"
              className={s.numInput}
              placeholder="12"
              value={fuelType === 'electric' ? '' : effStr}
              disabled={fuelType === 'electric'}
              onChange={e => setEffStr(e.target.value.replace(/[^\d.]/g, ''))} />
          </div>
        </div>
        <p className={s.fieldHint}>
          💡 한국 평균 휘발유 12km/L · 디젤 14km/L · 하이브리드 18km/L. 전기차는 유류세 면제.
        </p>
      </div>

      {/* ── 3. 옵션 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>⚙️ 3. 옵션</div>

        <div className={s.subLabel}>감면 자격</div>
        <div className={s.exemptionList} role="group" aria-label="감면 자격 선택">
          {(Object.keys(EXEMPTION_LABEL) as Exemption[]).map(k => {
            const meta = EXEMPTION_LABEL[k]
            return (
              <button key={k} type="button"
                aria-pressed={exemption === k}
                className={`${s.exemptionBtn} ${exemption === k ? s.exemptionActive : ''}`}
                onClick={() => setExemption(k)}>
                <strong>{meta.name}</strong>
                <span>{meta.desc}</span>
              </button>
            )
          })}
        </div>

        <div className={s.toggleRow}>
          <label className={s.toggleLabel}>
            <input type="checkbox" checked={prepay} onChange={e => setPrepay(e.target.checked)} />
            <span>🗓️ 자동차세 1월 연납 할인 적용 (약 4.6% ↓)</span>
          </label>
        </div>

        <div className={s.field} style={{ marginTop: 14 }}>
          <label>보유 시뮬레이션 기간</label>
          <div className={s.holdRow} role="group" aria-label="보유 시뮬레이션 기간 선택">
            {[1, 3, 5, 7, 10].map(y => (
              <button key={y} type="button"
                aria-pressed={yearsToHold === y}
                className={`${s.holdBtn} ${yearsToHold === y ? s.holdActive : ''}`}
                onClick={() => setYearsToHold(y)}>
                {y}년
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 메인 히어로 ── */}
      <div className={s.heroCard}>
        <div className={s.heroLabel}>
          {yearsToHold}년 보유 시 총 세금
          {exemption !== 'none' && result.exemptionSaved > 0 &&
            ` · 감면 ${fmtMan(result.exemptionSaved)} 절감`}
        </div>
        <div className={s.heroRow}>
          <span className={s.heroNum}>
            {fmtMan(result.totalForPeriod)}
          </span>
        </div>
        <div className={s.heroSub}>
          취득 {fmtMan(result.initialTotal)} + 매년 약 {fmtMan(result.annualTotal)}
        </div>
      </div>

      {/* ── 취득 시 세금 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🛒 취득 시점 세금</div>
        <ul className={s.taxList}>
          <li className={s.taxItem}>
            <div>
              <strong>취득세</strong>
              <span className={s.taxSub}>
                {(ACQUISITION_TAX_RATES_DISPLAY[carType] * 100).toFixed(0)}%
                {carType === 'ev' && ' (140만원 한도 면제)'}
                {exemption !== 'none' && exemption !== 'multi_child' && ' (감면 자격)'}
              </span>
            </div>
            <span className={s.taxVal}>{fmt(result.acquisitionTax)}원</span>
          </li>
          <li className={s.taxItem}>
            <div>
              <strong>공채 매입 실비</strong>
              <span className={s.taxSub}>
                {REGIONS.find(r => r.id === regionId)?.name} {((REGIONS.find(r => r.id === regionId)?.bondRate ?? 0) * 100).toFixed(0)}% 매입 후 즉시 매도 (할인율 12%)
              </span>
            </div>
            <span className={s.taxVal}>{fmt(result.bondCost)}원</span>
          </li>
          <li className={s.taxItem}>
            <div>
              <strong>번호판·등록 수수료</strong>
              <span className={s.taxSub}>일반 발급 기준</span>
            </div>
            <span className={s.taxVal}>{fmt(result.registrationFee)}원</span>
          </li>
          <li className={`${s.taxItem} ${s.taxTotal}`}>
            <div><strong>합계</strong></div>
            <span className={s.taxVal}>{fmt(result.initialTotal)}원</span>
          </li>
        </ul>
      </div>

      {/* ── 연간 세금 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>🗓️ 연간 세금 (현재 시점)</div>
        <ul className={s.taxList}>
          <li className={s.taxItem}>
            <div>
              <strong>자동차세 본세</strong>
              <span className={s.taxSub}>
                {exemption === 'disabled' || exemption === 'merit'
                  ? '장애인·국가유공자 — 자동차세 면제'
                  : carType === 'ev' ? '전기차 정액 10만원 (본세)'
                  : carType === 'business' ? `${cc}cc × ${cc > 2500 ? '24' : cc > 1600 ? '19' : '18'}원/cc (영업용)`
                  : `${cc}cc × ${cc > 1600 ? '200' : cc > 1000 ? '140' : '80'}원/cc`}
                {exemption !== 'disabled' && exemption !== 'merit' && carType !== 'ev' && yearsSinceReg >= 3 && ` · 연식 ${Math.min(50, (yearsSinceReg - 2) * 5)}% 감면`}
                {exemption !== 'disabled' && exemption !== 'merit' && prepay && ' · 연납 약 4.6% 추가 할인'}
              </span>
            </div>
            <span className={s.taxVal}>{fmt(result.annualCarTax)}원</span>
          </li>
          <li className={s.taxItem}>
            <div>
              <strong>지방교육세</strong>
              <span className={s.taxSub}>자동차세 × 30%</span>
            </div>
            <span className={s.taxVal}>{fmt(result.annualEduTax)}원</span>
          </li>
          {result.annualEnvFee > 0 && (
            <li className={s.taxItem}>
              <div>
                <strong>환경개선부담금</strong>
                <span className={s.taxSub}>경유차 · 배기량별 정액 (연 2회 부과 합산)</span>
              </div>
              <span className={s.taxVal}>{fmt(result.annualEnvFee)}원</span>
            </li>
          )}
          {result.annualFuelTax > 0 && (
            <li className={s.taxItem}>
              <div>
                <strong>유류세 (추정)</strong>
                <span className={s.taxSub}>
                  연 {fmt(monthlyKm * 12)}km · 연비 {efficiencyKmL}km/L · {FUEL_LABEL[fuelType]}
                </span>
              </div>
              <span className={s.taxVal}>{fmt(result.annualFuelTax)}원</span>
            </li>
          )}
          <li className={`${s.taxItem} ${s.taxTotal}`}>
            <div><strong>연 합계</strong></div>
            <span className={s.taxVal}>{fmt(result.annualTotal)}원</span>
          </li>
        </ul>
      </div>

      {/* ── 연도별 누적 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📈 {yearsToHold}년간 연도별 누적</div>
        <div className={s.tableWrap}>
          <table className={s.yearlyTable}>
            <thead>
              <tr>
                <th scope="col">경과</th>
                <th scope="col">자동차세</th>
                <th scope="col">지방교육세</th>
                {result.annualEnvFee > 0 && <th scope="col">환경부담금</th>}
                {result.annualFuelTax > 0 && <th scope="col">유류세</th>}
                <th scope="col">연 합계</th>
                <th scope="col">누적</th>
              </tr>
            </thead>
            <tbody>
              <tr className={s.initialRow}>
                <td>취득</td>
                <td colSpan={2 + (result.annualEnvFee > 0 ? 1 : 0) + (result.annualFuelTax > 0 ? 1 : 0)}>
                  취득세 + 공채 + 등록비
                </td>
                <td>{fmt(result.initialTotal)}</td>
                <td><strong>{fmt(result.initialTotal)}</strong></td>
              </tr>
              {result.yearlyBreakdown.map(y => (
                <tr key={y.year}>
                  <td>{y.year}년차</td>
                  <td>{fmt(y.carTax)}</td>
                  <td>{fmt(y.eduTax)}</td>
                  {result.annualEnvFee > 0 && <td>{fmt(y.envFee)}</td>}
                  {result.annualFuelTax > 0 && <td>{fmt(y.fuelTax)}</td>}
                  <td>{fmt(y.total)}</td>
                  <td><strong>{fmt(y.cumulative)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 자동차세 단가표 (가이드) ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>📋 자동차세 단가 (비영업용 cc당)</div>
        <ul className={s.tipList}>
          {TAX_TABLE_NON_BUSINESS.map((t, i) => (
            <li key={i}>
              <strong>{t.range}</strong> — {t.perCC}원/cc · {t.example}
            </li>
          ))}
          <li><strong>전기·수소차</strong> — 본세 100,000원 + 교육세 = 13만원/년 (배기량 무관·차령 경감 없음)</li>
          <li><strong>연식 감면</strong> — 3년차 5% · 4년차 10% · … · 12년차 이후 50% 최대 (내연기관만)</li>
          <li><strong>연납 할인</strong> — 1월 일괄 납부 시 약 4.6% 추가 할인 (2026년 공제율 5%)</li>
        </ul>
      </div>

      {/* ── 양도·폐차 안내 ── */}
      <div className={s.card}>
        <div className={s.cardLabel}>{TRANSFER_NOTE.title}</div>
        <ul className={s.tipList}>
          {TRANSFER_NOTE.points.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>

      {/* ── 절세 팁 ── */}
      <div className={s.tipCard}>
        <div className={s.cardLabel}>💡 자동차 세금 절세 팁</div>
        <ul className={s.tipList}>
          {SAVING_TIPS.map((t, i) => (
            <li key={i}><strong>{t.title}</strong> — {t.detail}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// 차종별 취득세율 (display용)
const ACQUISITION_TAX_RATES_DISPLAY: Record<CarType, number> = {
  normal: 0.07, light: 0.04, business: 0.04, ev: 0.07, hybrid: 0.07,
}
