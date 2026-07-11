'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  a1cToEag, eagToA1c, mgdlToMmol, bandForA1c, buildRefTable, roundScrub,
} from './hba1cData'
import s from './hba1c.module.css'

type Mode = 'a1c' | 'eag'

export default function Hba1cClient() {
  const [mode, setMode] = useState<Mode>('a1c')
  const [a1c, setA1c] = useState('6.0')
  const [eag, setEag] = useState('126')

  const refTable = useMemo(() => buildRefTable(), [])

  // 입력 스케일 기준 값 계산
  const a1cNum = parseFloat(a1c)
  const eagNum = parseFloat(eag)

  const result = useMemo(() => {
    if (mode === 'a1c') {
      if (!isFinite(a1cNum) || a1cNum <= 0) return null
      const mg = a1cToEag(a1cNum)
      if (mg <= 0) return null
      return { a1c: a1cNum, eagMg: mg, eagMmol: mgdlToMmol(mg) }
    } else {
      if (!isFinite(eagNum) || eagNum <= 0) return null
      const a = eagToA1c(eagNum)
      if (a <= 0) return null
      return { a1c: a, eagMg: eagNum, eagMmol: mgdlToMmol(eagNum) }
    }
  }, [mode, a1cNum, eagNum])

  const band = result ? bandForA1c(result.a1c) : null

  const fmt1 = (n: number) => n.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const fmt0 = (n: number) => roundScrub(n).toLocaleString('ko-KR')

  return (
    <div className={s.wrap}>
      {/* 방향 토글 */}
      <div className={s.card}>
        <div className={s.modeToggle} role="group" aria-label="변환 방향">
          <button type="button" aria-pressed={mode === 'a1c'}
            className={`${s.modeBtn} ${mode === 'a1c' ? s.modeBtnActive : ''}`}
            onClick={() => setMode('a1c')}>
            당화혈색소 → 평균혈당
          </button>
          <button type="button" aria-pressed={mode === 'eag'}
            className={`${s.modeBtn} ${mode === 'eag' ? s.modeBtnActive : ''}`}
            onClick={() => setMode('eag')}>
            평균혈당 → 당화혈색소
          </button>
        </div>

        {mode === 'a1c' ? (
          <div className={s.inputBlock}>
            <label className={s.fieldLabel} htmlFor="hb-a1c">당화혈색소 (HbA1c)</label>
            <div className={s.inputRow}>
              <input id="hb-a1c" type="number" inputMode="decimal" min={0} max={20} step={0.1}
                className={s.input} value={a1c}
                onChange={(e) => setA1c(e.target.value)} aria-label="당화혈색소(%)" />
              <span className={s.unit}>%</span>
            </div>
          </div>
        ) : (
          <div className={s.inputBlock}>
            <label className={s.fieldLabel} htmlFor="hb-eag">추정 평균혈당 (eAG)</label>
            <div className={s.inputRow}>
              <input id="hb-eag" type="number" inputMode="decimal" min={0} step={1}
                className={s.input} value={eag}
                onChange={(e) => setEag(e.target.value)} aria-label="추정 평균혈당(mg/dL)" />
              <span className={s.unit}>mg/dL</span>
            </div>
          </div>
        )}
      </div>

      {/* 결과 */}
      {result ? (
        <div className={s.resultCard} role="status">
          <div className={s.resultGrid}>
            <div className={s.resItem}>
              <span className={s.resLabel}>당화혈색소</span>
              <span className={s.resValue}>{fmt1(result.a1c)}<small>%</small></span>
            </div>
            <div className={s.resArrow} aria-hidden>↔</div>
            <div className={s.resItem}>
              <span className={s.resLabel}>추정 평균혈당</span>
              <span className={s.resValue}>{fmt0(result.eagMg)}<small>mg/dL</small></span>
              <span className={s.resSub}>{fmt1(result.eagMmol)} mmol/L</span>
            </div>
          </div>

          {band && (
            <div className={s.bandBox} style={{ borderColor: band.color }}>
              <span className={s.bandLabel} style={{ color: band.color }}>{band.label}</span>
              <span className={s.bandNote}>{band.note}</span>
            </div>
          )}

          <p className={s.caveat}>
            ⓘ eAG는 <strong>2~3개월 평균 혈당의 추정치</strong>입니다. 그날그날 재는 자가혈당(공복·식후)과는 다르며, 빈혈·임신·특정 혈액질환이 있으면 실제와 차이가 날 수 있습니다.
          </p>
        </div>
      ) : (
        <div className={s.card} role="status">
          <p className={s.emptyNote}>0보다 큰 값을 입력하면 당화혈색소와 추정 평균혈당을 서로 변환합니다.</p>
        </div>
      )}

      {/* 진단 구간 */}
      <div className={s.card}>
        <p className={s.groupLabel}>진단 구간 (대한당뇨병학회·ADA)</p>
        <div className={s.bandList}>
          {[
            { l: '정상', r: 'HbA1c 5.7% 미만', c: 'var(--success)' },
            { l: '당뇨 전단계', r: '5.7 ~ 6.4%', c: 'var(--warning)' },
            { l: '당뇨병', r: '6.5% 이상', c: 'var(--danger)' },
          ].map((b, i) => (
            <div key={i} className={s.bandRow}
              style={{ borderLeftColor: b.c }}
              data-active={band?.label.startsWith(b.l) ? 'true' : undefined}>
              <span className={s.bandRowLabel} style={{ color: b.c }}>{b.l}</span>
              <span className={s.bandRowRange}>{b.r}</span>
            </div>
          ))}
        </div>
        <p className={s.groupNote}>
          진단은 다른 검사와 함께 의료진이 판단합니다. 관리 목표(예: 6.5% 미만)는 나이·저혈당 위험 등에 따라 개인별로 달라집니다.
        </p>
      </div>

      {/* 참고 환산표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>HbA1c ↔ 평균혈당 환산표</p>
        <div className={s.tableScroll}>
          <table className={s.refTable}>
            <thead>
              <tr>
                <th scope="col">HbA1c (%)</th>
                <th scope="col">eAG (mg/dL)</th>
                <th scope="col">eAG (mmol/L)</th>
              </tr>
            </thead>
            <tbody>
              {refTable.map((r) => (
                <tr key={r.a1c} data-hit={result && Math.abs(result.a1c - r.a1c) < 0.25 ? 'true' : undefined}>
                  <td>{fmt1(r.a1c)}</td>
                  <td>{fmt0(r.eagMg)}</td>
                  <td>{fmt1(r.eagMmol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Disclaimer
        variant="medical"
        related={[
          { href: '/tools/health/bmi', label: 'BMI 계산기' },
          { href: '/tools/health/bmr', label: '기초대사량 계산기' },
          { href: '/tools/cooking/nuts', label: '견과류 섭취량 계산기' },
        ]}
        sources={[
          { label: '대한당뇨병학회', href: 'https://www.diabetes.or.kr' },
          { label: 'ADA — eAG/A1C Conversion', href: 'https://diabetes.org' },
        ]}
      >
        eAG 변환은 ADAG 연구의 공인 회귀식(28.7×A1c−46.7)이며, 진단·치료를 대체하지 않습니다. 빈혈·혈색소 이상·임신 등에서는 실제 평균혈당과 차이가 날 수 있으니 결과는 반드시 의료진과 함께 해석하세요.
      </Disclaimer>
    </div>
  )
}
