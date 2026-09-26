/* 골든 테스트 — 러닝 공식 (lib/running.ts): Daniels/Gilbert VDOT · 훈련 강도 · Riegel
   기준: Daniels & Gilbert 「Oxygen Power」(1979) 회귀식, Daniels' Running Formula VDOT 표.
   · VDOT 50 공식표: 5K 19:57 · 마라톤 3:10:49 / 훈련 페이스 M 4:31 · T 4:15 · I 3:55 · R 3:40 (/km)
     공식(연속식)은 표와 몇 초 차이 — 아래 허용오차로 대조
   · Riegel: T2 = T1 × (D2/D1)^1.06 → 10K 40:00 → 하프 5,295.4초(88:15) */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  vo2FromV, vFromVo2, pctVO2max, vdotFromRace, timeFromVdot, paceFromVdot, riegelTime,
  DANIELS_PCT, E_FAST_PCT, RIEGEL_EXPONENT,
} from '../../lib/running'
import * as racePredictor from '../../app/tools/sports/race-predictor/racePredictorUtils'
import { INTENSITY_PCT, getPace, calcVDOT } from '../../app/tools/sports/interval-training/intervalUtils'
import { INTENSITY_LABEL } from '../../app/tools/sports/buildup/buildupUtils'
import { trainingPaces } from '../../app/tools/sports/vo2max/vo2maxData'

const near = (a: number, b: number, eps: number) => assert.ok(Math.abs(a - b) <= eps, `${a} ≠ ${b} (±${eps})`)

describe('계수', () => {
  test('Daniels 강도 %VO2max · E 빠른 끝 · Riegel 지수', () => {
    assert.deepEqual({ ...DANIELS_PCT }, { E: 0.59, M: 0.82, T: 0.88, I: 0.97, R: 1.06 })
    assert.equal(E_FAST_PCT, 0.74)
    assert.equal(RIEGEL_EXPONENT, 1.06)
  })
  test('도구 계수 = lib (interval-training · buildup)', () => {
    assert.deepEqual({ ...INTENSITY_PCT }, { ...DANIELS_PCT })
    for (const z of ['E', 'M', 'T', 'I', 'R'] as const) assert.equal(INTENSITY_LABEL[z].pct, DANIELS_PCT[z], z)
  })
})

describe('VDOT 회귀식', () => {
  test('산소 비용·역함수', () => {
    near(vo2FromV(200), 36.0116, 1e-9)                 // −4.60 + 0.182258·200 + 0.000104·200²
    for (const v of [100, 200, 268.1, 400]) near(vFromVo2(vo2FromV(v)), v, 1e-9)
  })
  test('지속 가능 %VO2max: t=0 → 1.2883951, t→∞ → 0.8', () => {
    near(pctVO2max(0), 1.2883951, 1e-12)
    near(pctVO2max(1e9), 0.8, 1e-12)
  })
  test('VDOT 50 표 대조: 5K 20:00 ≈ 49.8, 마라톤 3:10:49 ≈ 50.0', () => {
    near(vdotFromRace(5, 20 * 60), 49.81, 0.01)
    near(vdotFromRace(42.195, 3 * 3600 + 10 * 60 + 49), 49.95, 0.01)
  })
  test('timeFromVdot: VDOT 50 → 5K ≈ 19:56 (표 19:57), 마라톤 ≈ 3:10:40 (표 3:10:49)', () => {
    near(timeFromVdot(5, 50), 19 * 60 + 57, 2)
    near(timeFromVdot(42.195, 50), 3 * 3600 + 10 * 60 + 49, 10)
  })
  test('timeFromVdot ∘ vdotFromRace 왕복', () => {
    for (const [d, t] of [[5, 1500], [10, 2400], [21.0975, 5400], [42.195, 12_600]] as const) {
      near(timeFromVdot(d, vdotFromRace(d, t)), t, 0.01)
    }
  })
})

describe('훈련 페이스 (VDOT 50)', () => {
  test('공식표 M 4:31 · T 4:15 · I 3:55 · R 3:40 과 ±1초', () => {
    near(paceFromVdot(50, DANIELS_PCT.M), 271, 1)
    near(paceFromVdot(50, DANIELS_PCT.T), 255, 1)
    near(paceFromVdot(50, DANIELS_PCT.I), 235, 1)
    near(paceFromVdot(50, DANIELS_PCT.R), 220, 1)
  })
  test('강도가 높을수록 빠르다: E > E_FAST > M > T > I > R (초/km)', () => {
    const p = [DANIELS_PCT.E, E_FAST_PCT, DANIELS_PCT.M, DANIELS_PCT.T, DANIELS_PCT.I, DANIELS_PCT.R].map(k => paceFromVdot(50, k))
    for (let i = 1; i < p.length; i++) assert.ok(p[i] < p[i - 1])
  })
  test('도구 함수 = lib 공식 (interval getPace · vo2max trainingPaces)', () => {
    for (const vdot of [30, 45.5, 60]) {
      const tp = trainingPaces(vdot)
      for (const z of ['E', 'M', 'T', 'I', 'R'] as const) {
        assert.equal(getPace(vdot, z), paceFromVdot(vdot, DANIELS_PCT[z]))
        assert.equal(tp[z], paceFromVdot(vdot, DANIELS_PCT[z]))
      }
    }
    assert.equal(getPace(0, 'E'), 0)
    assert.equal(calcVDOT(1200, 5000), vdotFromRace(5, 1200))
    assert.equal(calcVDOT(0, 5000), 0)
  })
})

describe('Riegel', () => {
  test('10K 40:00 → 하프 ≈ 5,295.4초 · 같은 거리는 그대로', () => {
    near(riegelTime(10, 2400, 21.0975), 5295.37, 0.01)
    assert.equal(riegelTime(10, 2400, 10), 2400)
    near(riegelTime(5, 1200, 10), 1200 * Math.pow(2, 1.06), 1e-9)
  })
  test('race-predictor 재수출 = lib 함수 결과', () => {
    assert.equal(racePredictor.riegelTime(10, 2400, 42.195), riegelTime(10, 2400, 42.195))
    assert.equal(racePredictor.vdotFromRace(10, 2400), vdotFromRace(10, 2400))
    assert.equal(racePredictor.paceFromVdot(50, 0.88), paceFromVdot(50, 0.88))
  })
})

// ── 인터벌 회복 규칙 (app/tools/sports/interval-training/intervalUtils.recoveryRule)
//    Daniels' Running Formula: R = 같은 거리 조깅·달린 시간의 2~3배 · I = 달린 시간 이내·거리 절반 안팎 · T = 5분당 약 1분
import { recoveryRule } from '../../app/tools/sports/interval-training/intervalUtils'
describe('인터벌 회복 규칙 (recoveryRule)', () => {
  test('R 400m 랩 1:38 → 400m 조깅, 3:16~4:54, 소요 합산 2.5배', () => {
    assert.deepEqual(recoveryRule('R', 400, 98), { jogM: 400, loSec: 196, hiSec: 294, sec: 245 })
  })
  test('R은 화면에 보이는 정수 초 랩타임에서 배수 계산 (97.6초 → 98초)', () => {
    assert.deepEqual(recoveryRule('R', 400, 97.6), recoveryRule('R', 400, 98))
  })
  test('I 800m 3:32 → 400m 조깅, 3:32 이내', () => {
    assert.deepEqual(recoveryRule('I', 800, 212), { jogM: 400, loSec: 212, hiSec: 212, sec: 212 })
  })
  test('I 조깅 거리는 100m 단위 반올림, 최소 100m', () => {
    assert.equal(recoveryRule('I', 1000, 260)?.jogM, 500)
    assert.equal(recoveryRule('I', 100, 20)?.jogM, 100)
  })
  test('T 1.6km 7:40 → 짧은 조깅·휴식 약 1:32 (1/5)', () => {
    assert.deepEqual(recoveryRule('T', 1600, 460), { jogM: null, loSec: 92, hiSec: 92, sec: 92 })
  })
  test('M·E 등 그 밖의 강도, 0·음수 입력은 null', () => {
    assert.equal(recoveryRule('M', 1000, 300), null)
    assert.equal(recoveryRule('R', 400, 0), null)
    assert.equal(recoveryRule('I', 0, 200), null)
  })
})
