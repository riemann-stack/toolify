/* 골든 테스트 — 취득 원인별 확장(상속·원시취득·주택 외 증여·농지) + 생애최초 감면 (lib/krAcquisitionTax.ts)
   + 부동산 취득세 계산기(app/tools/finance/acquisition-tax) 입력 정규화.
   기대값은 법령 산식으로 손계산한 값이다 (코드 출력 복사 아님). 세목별 10원 미만 절사.
   · 지방세법 §11①: 상속 2.8%(농지 2.3%) · 증여 3.5% · 원시취득 2.8% · 농지 유상 3% · 주택 외 유상 4%
   · §15①2호 가목: 무주택 1가구 1주택 상속 = 2.8% − 2% = 0.8%
   · §151①1호: 지방교육세 = (표준세율 − 2%) × 20% / 세율 특례분은 특례 취득세 × 20%
   · 농특세법 §5①6호: 과세표준 × 0.2% (85㎡ 이하 주택 비과세, 세율 특례는 0)
   · 지특법 §36의3: 생애최초 12억 이하 — 취득세 min(산출세액, 한도 200만/300만) 감면,
     교육세는 취득세 감면율만큼 감면(§151①1호), 85㎡ 초과는 감면분 농특세 20%(농특세법 §5①1호) */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcInheritAcquisitionTax, calcOriginalAcquisitionTax, calcGiftNonHouseAcquisitionTax,
  calcFarmlandPurchaseAcquisitionTax, calcAcquisitionTaxByCause, calcHouseAcquisitionTax,
  applyFirstHomeRelief, firstHomeIneligibility, FIRST_HOME_RELIEF, ACQ_RATE_PCT,
  type AcquisitionInput,
} from '../../lib/krAcquisitionTax'
import {
  parseWon, commaInput, koreanWon, pct, mergeState, queryToState, stateToQuery, computeAcq,
  buildHouseMatrix, buildCauseCompare, DEFAULT_STATE, MAX_VALUE,
} from '../../app/tools/finance/acquisition-tax/acquisitionTaxUtils'

const EOK = 100_000_000
const four = (b: { acquisitionTax: number; educationTax: number; ruralTax: number; total: number }) =>
  [b.acquisitionTax, b.educationTax, b.ruralTax, b.total]

describe('상속 (지방세법 §11①1호, §15①2호)', () => {
  test('주택 5억 ≤85㎡: 2.8% 14,000,000 + 0.16% 800,000 + 농특 0 = 14,800,000', () => {
    // 5억 × 2.8% = 14,000,000 / 교육세 (2.8−2)×20% = 0.16% → 800,000 / 85㎡ 이하 비과세
    const b = calcInheritAcquisitionTax({ value: 5 * EOK, property: 'house' })
    assert.deepEqual(four(b), [14_000_000, 800_000, 0, 14_800_000])
    assert.equal(b.category, 'inherit')
    assert.equal(b.totalRate, 2.96)
  })
  test('주택 5억 >85㎡: 농특 5억 × 0.2% = 1,000,000 → 15,800,000 (3.16%)', () => {
    const b = calcInheritAcquisitionTax({ value: 5 * EOK, property: 'house', over85: true })
    assert.deepEqual(four(b), [14_000_000, 800_000, 1_000_000, 15_800_000])
    assert.equal(b.totalRate, 3.16)
  })
  test('주택 외 3억: 8,400,000 + 480,000 + 600,000 = 9,480,000 (면적 무관 농특 과세)', () => {
    // 3억 × 2.8% = 8,400,000 / × 0.16% = 480,000 / × 0.2% = 600,000
    assert.deepEqual(four(calcInheritAcquisitionTax({ value: 3 * EOK, property: 'nonHouse' })), [8_400_000, 480_000, 600_000, 9_480_000])
  })
  test('농지 2억: 2.3% 4,600,000 + 0.06% 120,000 + 0.2% 400,000 = 5,120,000 (2.56%)', () => {
    // 교육세 (2.3−2)×20% = 0.06%
    const b = calcInheritAcquisitionTax({ value: 2 * EOK, property: 'farmland' })
    assert.deepEqual(four(b), [4_600_000, 120_000, 400_000, 5_120_000])
    assert.equal(b.category, 'inheritFarmland')
    assert.equal(b.totalRate, 2.56)
  })
  test('무주택 1가구 1주택 특례 5억: 0.8% 4,000,000 + 0.16% 800,000 + 농특 0 = 4,800,000 (85㎡ 초과도 동일)', () => {
    // 2.8% − 중과기준세율 2% = 0.8% / 교육세 = 0.8% × 20% = 0.16% / 농특: 표준세율 2%를 넣으면 2%−2% = 0
    const le = calcInheritAcquisitionTax({ value: 5 * EOK, property: 'house', homelessOneHouse: true })
    const gt = calcInheritAcquisitionTax({ value: 5 * EOK, property: 'house', homelessOneHouse: true, over85: true })
    assert.deepEqual(four(le), [4_000_000, 800_000, 0, 4_800_000])
    assert.deepEqual(four(gt), [4_000_000, 800_000, 0, 4_800_000])
    assert.equal(le.category, 'inheritOneHouse')
    assert.equal(le.totalRate, 0.96)
  })
  test('특례 플래그는 주택에만 — 주택 외에 켜도 2.8%', () => {
    assert.equal(calcInheritAcquisitionTax({ value: 5 * EOK, property: 'nonHouse', homelessOneHouse: true }).acquisitionRate, 2.8)
  })
  test('10원 미만 절사: 12,345,678원 → 345,670 + 19,750 = 365,420', () => {
    // 12,345,678 × 2.8% = 345,678.98 → 원 미만 버림 345,678 → 10원 미만 절사 345,670
    // 12,345,678 × 0.16% = 19,753.08 → 19,753 → 19,750
    assert.deepEqual(four(calcInheritAcquisitionTax({ value: 12_345_678, property: 'house' })), [345_670, 19_750, 0, 365_420])
  })
})

describe('원시취득(신축) 2.8% (§11①3호) — 중과 없음', () => {
  test('주택 5억 ≤85: 14,800,000 / >85: 15,800,000', () => {
    assert.deepEqual(four(calcOriginalAcquisitionTax({ value: 5 * EOK, property: 'house' })), [14_000_000, 800_000, 0, 14_800_000])
    assert.deepEqual(four(calcOriginalAcquisitionTax({ value: 5 * EOK, property: 'house', over85: true })), [14_000_000, 800_000, 1_000_000, 15_800_000])
  })
  test('주택 외 5억: 15,800,000 · 농지 입력은 주택 외로 취급', () => {
    assert.equal(calcOriginalAcquisitionTax({ value: 5 * EOK, property: 'nonHouse' }).total, 15_800_000)
    assert.equal(calcOriginalAcquisitionTax({ value: 5 * EOK, property: 'farmland' }).total, 15_800_000)
  })
  test('다주택 입력이 있어도 원시취득은 2.8% (dispatcher)', () => {
    const b = calcAcquisitionTaxByCause({ cause: 'original', property: 'house', value: 10 * EOK, over85: false, homeCount: 4, adjusted: true })
    assert.equal(b.acquisitionRate, 2.8)
    assert.equal(b.total, 29_600_000) // 10억 × 2.96%
  })
})

describe('주택 외 증여 · 농지 매매', () => {
  test('주택 외 증여 5억: 3.5% 17,500,000 + 0.3% 1,500,000 + 0.2% 1,000,000 = 20,000,000 (4.0%)', () => {
    // 교육세 (3.5−2)×20% = 0.3%
    const b = calcGiftNonHouseAcquisitionTax(5 * EOK)
    assert.deepEqual(four(b), [17_500_000, 1_500_000, 1_000_000, 20_000_000])
    assert.equal(b.totalRate, 4)
  })
  test('농지 매매 5억: 3% 15,000,000 + 0.2% 1,000,000 + 0.2% 1,000,000 = 17,000,000 (3.4%)', () => {
    // 교육세 (3−2)×20% = 0.2%
    const b = calcFarmlandPurchaseAcquisitionTax(5 * EOK)
    assert.deepEqual(four(b), [15_000_000, 1_000_000, 1_000_000, 17_000_000])
    assert.equal(b.totalRate, 3.4)
  })
  test('0 · 음수 · NaN → 0원', () => {
    assert.equal(calcGiftNonHouseAcquisitionTax(0).total, 0)
    assert.equal(calcFarmlandPurchaseAcquisitionTax(-5).total, 0)
    assert.equal(calcInheritAcquisitionTax({ value: Number.NaN, property: 'house' }).total, 0)
    assert.equal(calcOriginalAcquisitionTax({ value: Number.POSITIVE_INFINITY, property: 'house' }).total, 0)
  })
  test('표시용 세율 상수', () => {
    assert.deepEqual(
      [ACQ_RATE_PCT.inherit, ACQ_RATE_PCT.inheritFarmland, ACQ_RATE_PCT.inheritOneHouse, ACQ_RATE_PCT.original, ACQ_RATE_PCT.gift, ACQ_RATE_PCT.farmlandPurchase, ACQ_RATE_PCT.ruralBase],
      [2.8, 2.3, 0.8, 2.8, 3.5, 3, 0.2],
    )
  })
})

describe('calcAcquisitionTaxByCause — 기존 함수 위임이 같은 값을 내는지', () => {
  const base = { over85: false, homeCount: 1, adjusted: false }
  test('매매 주택 7억 = 12,859,000 (1.67% + 0.167%)', () => {
    assert.equal(calcAcquisitionTaxByCause({ ...base, cause: 'purchase', property: 'house', value: 7 * EOK }).total, 12_859_000)
  })
  test('매매 조정 2주택 10억 = 84,000,000 (8% + 0.4%)', () => {
    assert.equal(calcAcquisitionTaxByCause({ ...base, cause: 'purchase', property: 'house', value: 10 * EOK, homeCount: 2, adjusted: true }).total, 84_000_000)
  })
  test('매매 주택 외 5억 = 23,000,000 (4.6%)', () => {
    assert.equal(calcAcquisitionTaxByCause({ ...base, cause: 'purchase', property: 'nonHouse', value: 5 * EOK }).total, 23_000_000)
  })
  test('증여 주택 5억 = 19,000,000 (3.5% + 0.3%), 조정·3억 이상 = 62,000,000 (12% + 0.4%), 1주택자 가족 증여는 중과 제외', () => {
    const g = (o: Partial<AcquisitionInput>) => calcAcquisitionTaxByCause({ ...base, cause: 'gift', property: 'house', value: 5 * EOK, ...o }).total
    assert.equal(g({}), 19_000_000)
    assert.equal(g({ adjusted: true, giftStdValueOver3eok: true }), 62_000_000)
    assert.equal(g({ adjusted: true, giftStdValueOver3eok: true, giftFamilyExempt: true }), 19_000_000)
    assert.equal(g({ adjusted: false, giftStdValueOver3eok: true }), 19_000_000)
  })
})

describe('생애최초 감면 (지특법 §36의3)', () => {
  const one = (price: number, over85 = false) => calcHouseAcquisitionTax({ price, homeCount: 1, adjusted: false, over85 })
  test('5억 일반: 취득세 5,000,000 − 2,000,000, 교육세 500,000 → 300,000, 합계 3,300,000 (순감면 2,200,000)', () => {
    // 감면율 = 200만/500만 = 40% → 교육세 500,000 × 60% = 300,000
    const r = applyFirstHomeRelief(one(5 * EOK), { capKind: 'general', over85: false })
    assert.deepEqual(four(r.after), [3_000_000, 300_000, 0, 3_300_000])
    assert.equal(r.acquisitionRelief, 2_000_000)
    assert.equal(r.educationRelief, 200_000)
    assert.equal(r.netRelief, 2_200_000)
  })
  test('2억: 산출세액 2,000,000 = 한도 → 전액 면제 (교육세 포함 0원)', () => {
    const r = applyFirstHomeRelief(one(2 * EOK), { capKind: 'general', over85: false })
    assert.equal(r.after.total, 0)
    assert.equal(r.netRelief, 2_200_000)
  })
  test('2억 1,000원 (한도 +10원): 취득세 2,000,010 → 10원 남음, 교육세 200,000 × 10/2,000,010 → 0', () => {
    // 200,001,000 × 1% = 2,000,010 / 교육세 200,001,000 × 0.1% = 200,001 → 200,000 (10원 절사)
    // 감면 후 교육세 = floor(200,000 × 10 / 2,000,010) = 0
    const r = applyFirstHomeRelief(one(200_001_000), { capKind: 'general', over85: false })
    assert.deepEqual(four(r.after), [10, 0, 0, 10])
  })
  test('[가정] 7억 >85㎡: 취득세 9,690,000 + 교육세 969,000 + 농특 1,400,000 + 감면분 농특 400,000 = 12,459,000', () => {
    // 산출 11,690,000 − 2,000,000 = 9,690,000 / 교육세 1,169,000 × 9,690,000/11,690,000 = 969,000
    // 농특 7억 × 0.2% = 1,400,000 + 감면세액 2,000,000 × 20% = 400,000
    // ※ 법령 산식 확정값이 아니라 lib의 가정(본세분 농특세 0.2%를 감면과 무관하게 유지)을 고정하는 테스트.
    //   농특세법 §5①6호를 '감면 후 취득세액 기준'으로 읽으면 본세분이 비례 감액돼 약 12,219,470 — 위택스 대조 후 확정할 것.
    const r = applyFirstHomeRelief(one(7 * EOK, true), { capKind: 'general', over85: true })
    assert.deepEqual(four(r.after), [9_690_000, 969_000, 1_800_000, 12_459_000])
    assert.equal(r.ruralOnRelief, 400_000)
    assert.equal(r.netRelief, 1_800_000)
  })
  test('소형주택 비수도권 2.8억: 산출 2,800,000 ≤ 300만 → 0원, 순감면 3,080,000', () => {
    const r = applyFirstHomeRelief(one(280_000_000), { capKind: 'smallNonCapital', over85: false })
    assert.equal(r.after.total, 0)
    assert.equal(r.netRelief, 3_080_000)
    assert.equal(r.capKind, 'smallNonCapital')
  })
  test('소형주택 비수도권 경계: 3억 이하 300만 / 3억 1만원은 일반 200만으로 대체', () => {
    const at = applyFirstHomeRelief(one(3 * EOK), { capKind: 'smallNonCapital', over85: false })
    assert.equal(at.cap, 3_000_000)
    assert.equal(at.after.total, 0) // 산출 3,000,000 전액
    const over = applyFirstHomeRelief(one(300_010_000), { capKind: 'smallNonCapital', over85: false })
    // 300,010,000 × 1% = 3,000,100 − 2,000,000 = 1,000,100 / 교육세 300,010 × 1,000,100/3,000,100 = 100,010
    assert.equal(over.capKind, 'general')
    assert.ok(over.note)
    assert.deepEqual(four(over.after), [1_000_100, 100_010, 0, 1_100_110])
  })
  test('소형주택 수도권 6억: 6,000,000 − 3,000,000, 교육세 600,000 → 300,000 = 3,300,000', () => {
    const r = applyFirstHomeRelief(one(6 * EOK), { capKind: 'smallCapital', over85: false })
    assert.deepEqual(four(r.after), [3_000_000, 300_000, 0, 3_300_000])
  })
  test('인구감소지역 5억: 300만 한도 → 2,000,000 + 200,000 = 2,200,000', () => {
    const r = applyFirstHomeRelief(one(5 * EOK), { capKind: 'depopulation', over85: false })
    assert.deepEqual(four(r.after), [2_000_000, 200_000, 0, 2_200_000])
  })
  test('자격: 12억 정확히는 가능(36,000,000 − 2,000,000 → 합계 37,400,000), 12억+1원은 불가', () => {
    const input = (value: number): AcquisitionInput => ({ cause: 'purchase', property: 'house', value, over85: false, homeCount: 1 })
    const b12 = calcAcquisitionTaxByCause(input(FIRST_HOME_RELIEF.maxPrice))
    assert.equal(firstHomeIneligibility(input(FIRST_HOME_RELIEF.maxPrice), b12), null)
    // 교육세 3,600,000 × 34,000,000/36,000,000 = 3,400,000
    assert.equal(applyFirstHomeRelief(b12, { capKind: 'general', over85: false }).after.total, 37_400_000)
    const b12p = calcAcquisitionTaxByCause(input(FIRST_HOME_RELIEF.maxPrice + 1))
    assert.match(firstHomeIneligibility(input(FIRST_HOME_RELIEF.maxPrice + 1), b12p) ?? '', /12억/)
  })
  test('자격: 법인·증여·주택 외, 그리고 중과(조정 2주택·비조정 3주택)는 불가', () => {
    const mk = (o: Partial<AcquisitionInput>): AcquisitionInput => ({ cause: 'purchase', property: 'house', value: 5 * EOK, over85: false, homeCount: 1, ...o })
    for (const o of [{ corporate: true }, { cause: 'gift' as const }, { property: 'nonHouse' as const },
      { homeCount: 2, adjusted: true }, { homeCount: 3, adjusted: false }]) {
      const i = mk(o)
      assert.notEqual(firstHomeIneligibility(i, calcAcquisitionTaxByCause(i)), null, JSON.stringify(o))
    }
    // 중과 차단 사유 문구
    const heavy = mk({ homeCount: 2, adjusted: true })
    assert.match(firstHomeIneligibility(heavy, calcAcquisitionTaxByCause(heavy)) ?? '', /중과세율/)
  })
  test('자격: 세대 주택 수는 요건이 아님 — 비조정 2주택(부모 주택 포함 세대)·조정 일시적 2주택·저가주택 3주택은 가능', () => {
    // 지특법 §36의3①: 본인·배우자의 주택 소유 이력만 본다. 세대 2주택이어도 비조정이면 §11①8호 표준세율(중과 아님)
    const mk = (o: Partial<AcquisitionInput>): AcquisitionInput => ({ cause: 'purchase', property: 'house', value: 5 * EOK, over85: false, homeCount: 1, ...o })
    for (const o of [{ homeCount: 2, adjusted: false }, { homeCount: 2, adjusted: true, temporaryTwoHomes: true }, { homeCount: 3, lowValueHouse: true }]) {
      const i = mk(o)
      assert.equal(firstHomeIneligibility(i, calcAcquisitionTaxByCause(i)), null, JSON.stringify(o))
    }
  })
  test('소형주택 한도 + 85㎡ 초과(모순 입력) → 일반 200만 한도로 대체: 5억 수도권 4,700,000', () => {
    // 소형주택은 전용 60㎡ 이하 → 85㎡ 초과면 가액(6억 이하)과 관계없이 일반 한도
    // 산출: 취득세 5억 × 1% = 5,000,000 · 교육세 0.1% = 500,000 · 농특 0.2% = 1,000,000
    // 감면 2,000,000 → 취득세 3,000,000 / 교육세 500,000 × 3,000,000/5,000,000 = 300,000
    // 농특 1,000,000 + 감면분 2,000,000 × 20% = 400,000 → 1,400,000 / 합계 4,700,000
    const r = applyFirstHomeRelief(one(5 * EOK, true), { capKind: 'smallCapital', over85: true })
    assert.equal(r.capKind, 'general')
    assert.equal(r.cap, 2_000_000)
    assert.match(r.note ?? '', /60㎡/)
    assert.deepEqual(four(r.after), [3_000_000, 300_000, 1_400_000, 4_700_000])
  })
  test('소형주택 비수도권 + 85㎡ 초과 → 일반 한도: 2.8억 1,840,000', () => {
    // 산출: 2,800,000 / 280,000 / 농특 560,000
    // 감면 2,000,000 → 800,000 / 교육세 280,000 × 800,000/2,800,000 = 80,000 / 농특 560,000 + 400,000 = 960,000
    const r = applyFirstHomeRelief(one(280_000_000, true), { capKind: 'smallNonCapital', over85: true })
    assert.equal(r.capKind, 'general')
    assert.deepEqual(four(r.after), [800_000, 80_000, 960_000, 1_840_000])
  })
})

describe('계산기 입력 정규화 (acquisitionTaxUtils)', () => {
  test('parseWon: 콤마 제거·0 하한·1조 상한·원 미만 버림', () => {
    assert.equal(parseWon('1,234,567'), 1_234_567)
    assert.equal(parseWon(''), 0)
    assert.equal(parseWon('abc'), 0)
    assert.equal(parseWon('-5'), 0)
    assert.equal(parseWon('99999999999999999'), MAX_VALUE)
    assert.equal(parseWon('1234.9'), 1234)
  })
  test('commaInput: 숫자만·앞자리 0 제거·상한', () => {
    assert.equal(commaInput('0012a34'), '1,234')
    assert.equal(commaInput(''), '')
    assert.equal(commaInput('99999999999999999999'), MAX_VALUE.toLocaleString('ko-KR'))
  })
  test('koreanWon · pct 표기', () => {
    assert.equal(koreanWon(750_000_000), '7억 5,000만원')
    assert.equal(koreanWon(1_200_003_456), '12억 3,456원')
    assert.equal(koreanWon(0), '0원')
    assert.equal(pct(1.67), '1.67%')
    assert.equal(pct(0.16), '0.16%')
    assert.equal(pct(0.1 + 0.2), '0.3%') // 부동소수 잔여 제거
  })
  test('mergeState: 잘못된 타입·값은 기본값 유지, 신축+농지는 주택 외로', () => {
    assert.deepEqual(mergeState(null), DEFAULT_STATE)
    assert.deepEqual(mergeState([1, 2]), DEFAULT_STATE)
    const m = mergeState({ cause: 'lease', homeCount: 7, over85: 'yes', value: '1억', capKind: 'vip' })
    assert.deepEqual(m, DEFAULT_STATE)
    assert.equal(mergeState({ cause: 'original', property: 'farmland' }).property, 'nonHouse')
  })
  test('공유 링크 왕복', () => {
    const s = { ...DEFAULT_STATE, cause: 'purchase' as const, value: '1,000,000,000', homeCount: 2 as const, adjusted: true, over85: true }
    const back = queryToState(stateToQuery(s))
    assert.deepEqual(back, s)
    assert.equal(queryToState('?foo=1'), null)
  })
  test('computeAcq: 기본(7억 1주택) 12,859,000 → 생애최초 켜면 10,659,000', () => {
    assert.equal(computeAcq(DEFAULT_STATE).total, 12_859_000)
    // 11,690,000 − 2,000,000 = 9,690,000 + 교육세 969,000
    const r = computeAcq({ ...DEFAULT_STATE, firstHome: true })
    assert.equal(r.total, 10_659_000)
    assert.equal(r.reliefBlocked, null)
  })
  test('computeAcq: 비조정 세대 2주택(부모 주택) 5억 생애최초 → 적용 3,300,000 / 조정이면 중과로 미적용 42,000,000', () => {
    // 비조정 2주택 = 표준 1%: 5,000,000 − 2,000,000 = 3,000,000 + 교육세 500,000 × 60% = 300,000
    const ok = computeAcq({ ...DEFAULT_STATE, value: '500,000,000', homeCount: 2, adjusted: false, firstHome: true })
    assert.equal(ok.reliefBlocked, null)
    assert.equal(ok.total, 3_300_000)
    // 조정 2주택 = 8% + 교육세 0.4% = 8.4% → 42,000,000 (감면 미계산)
    const heavy = computeAcq({ ...DEFAULT_STATE, value: '500,000,000', homeCount: 2, adjusted: true, firstHome: true })
    assert.ok(heavy.reliefBlocked)
    assert.equal(heavy.relief, null)
    assert.equal(heavy.total, 42_000_000)
  })
  test('computeAcq: 13억 생애최초 → 미적용 사유, 합계는 감면 전', () => {
    const r = computeAcq({ ...DEFAULT_STATE, value: '1,300,000,000', firstHome: true })
    assert.ok(r.reliefBlocked)
    assert.equal(r.total, 42_900_000) // 13억 × 3.3%
  })
  test('일시적 2주택 플래그는 조정 2주택에서만 의미', () => {
    const t = (o: Partial<typeof DEFAULT_STATE>) => computeAcq({ ...DEFAULT_STATE, value: '1,000,000,000', temporary: true, ...o }).total
    assert.equal(t({ homeCount: 2, adjusted: true }), 33_000_000)   // 표준 3.3%
    assert.equal(t({ homeCount: 3, adjusted: false }), 84_000_000)  // 비조정 3주택 8.4% 유지
  })
  test('주택 수 × 지역 매트릭스 (10억, 85㎡ 이하)', () => {
    // 1주택 3.3% = 33,000,000 · 8.4% = 84,000,000 · 12.4% = 124,000,000
    assert.deepEqual(buildHouseMatrix(10 * EOK, false).map(m => [m.normal.total, m.adjusted.total]), [
      [33_000_000, 33_000_000],
      [33_000_000, 84_000_000],
      [84_000_000, 124_000_000],
      [124_000_000, 124_000_000],
    ])
  })
  test('원인별 비교 (5억 주택 ≤85): 매매 5.5백만 · 증여 19백만 · 증여중과 62백만 · 상속 14.8백만 · 특례 4.8백만 · 신축 14.8백만', () => {
    assert.deepEqual(buildCauseCompare(5 * EOK, 'house', false).map(r => r.b.total),
      [5_500_000, 19_000_000, 62_000_000, 14_800_000, 4_800_000, 14_800_000])
    assert.equal(buildCauseCompare(5 * EOK, 'farmland', false).some(r => r.key === 'original'), false)
  })
})
