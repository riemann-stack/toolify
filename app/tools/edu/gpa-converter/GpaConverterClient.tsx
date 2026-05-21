'use client'

import { useEffect, useMemo, useState } from 'react'
import Disclaimer from '@/components/Disclaimer'
import s from './gpaConverter.module.css'
import {
  SCALES, METHODS, KOREAN_UNIS, LETTER_TABLE,
  convertGpa, toPercent, reverseFromUs,
  type ScaleId, type MethodId,
} from './gpaData'

const STORAGE_KEY = 'youtil_gpa_v1'

export default function GpaConverterClient() {
  const [scale, setScale] = useState<ScaleId>('4.5')
  const [input, setInput] = useState('4.0')
  const [activeMethod, setActiveMethod] = useState<MethodId>('wes')
  const [reverseUs, setReverseUs] = useState('3.5')
  const [reverseScale, setReverseScale] = useState<ScaleId>('4.5')

  // localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const j = JSON.parse(raw)
      if (j.scale) setScale(j.scale)
      if (typeof j.input === 'string') setInput(j.input)
      if (j.activeMethod) setActiveMethod(j.activeMethod)
      if (typeof j.reverseUs === 'string') setReverseUs(j.reverseUs)
      if (j.reverseScale) setReverseScale(j.reverseScale)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale, input, activeMethod, reverseUs, reverseScale }))
    } catch {}
  }, [scale, input, activeMethod, reverseUs, reverseScale])

  const gpa = parseFloat(input) || 0
  const scaleObj = SCALES.find(x => x.id === scale)!
  const valid = gpa > 0 && gpa <= scaleObj.max

  const results = useMemo(() => ({
    linear: convertGpa(gpa, scale, 'linear'),
    wes:    convertGpa(gpa, scale, 'wes'),
    korean: convertGpa(gpa, scale, 'korean'),
  }), [gpa, scale])

  const percent = useMemo(() => toPercent(gpa, scale), [gpa, scale])
  const active = results[activeMethod]

  // 역산
  const reverseUsNum = parseFloat(reverseUs) || 0
  const reverseValid = reverseUsNum > 0 && reverseUsNum <= 4.0
  const reversed = useMemo(() => reverseFromUs(reverseUsNum, reverseScale), [reverseUsNum, reverseScale])

  return (
    <div className={s.wrap}>
      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/edu/cognitive-test', label: '인지 능력 테스트' },
          { href: '/tools/edu/review-interval', label: '복습 간격 계산기' },
          { href: '/tools/edu/fermi-estimate', label: '페르미 추정' },
        ]}
      >
        GPA 환산표는 평가 기관(WES·ECE 등)·대학·국가마다 다릅니다. 본 도구는 가장 널리 쓰이는 3가지 방식을 비교 제공하는 <strong>추정용</strong>이며, 실제 유학·취업 지원 시에는 지원 기관·학교의 공식 환산을 우선하세요.
      </Disclaimer>

      {/* 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>1. 한국 학점 입력</span>
        <div className={s.scaleRow}>
          {SCALES.map((sc) => (
            <button key={sc.id}
              className={`${s.scaleBtn} ${scale === sc.id ? s.scaleBtnActive : ''}`}
              onClick={() => {
                setScale(sc.id)
                // 만점 변경 시 합리적 기본값으로 보정
                const cur = parseFloat(input) || 0
                if (cur > sc.max) {
                  setInput(sc.id === '100' ? '90' : (sc.max - 0.5).toFixed(1))
                }
              }}>
              {sc.short}
              <small>{sc.id === '100' ? '백분율' : '만점'}</small>
            </button>
          ))}
        </div>
        <div className={s.inputRow}>
          <input
            type="number"
            inputMode="decimal"
            step={scale === '100' ? 0.1 : 0.01}
            min={0}
            max={scaleObj.max}
            className={s.gpaInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <span className={s.inputUnit}>/ {scaleObj.short}</span>
          <span className={s.percentBadge}>
            ≈ <strong>{percent.toFixed(1)}%</strong>
          </span>
        </div>
        {!valid && (
          <p className={s.warn}>학점은 0 초과 {scaleObj.max} 이하 값이어야 합니다.</p>
        )}
      </div>

      {/* 환산 방식 토글 */}
      <div className={s.card}>
        <span className={s.cardLabel}>2. 환산 방식 선택</span>
        <div className={s.methodRow}>
          {METHODS.map((m) => (
            <button key={m.id}
              className={`${s.methodBtn} ${activeMethod === m.id ? s.methodBtnActive : ''}`}
              onClick={() => setActiveMethod(m.id)}>
              <span className={s.methodName}>{m.name}</span>
              <span className={s.methodDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 히어로 */}
      {valid && (
        <div className={s.hero}>
          <div className={s.heroLabel}>{METHODS.find(m => m.id === activeMethod)?.name} 결과</div>
          <div className={s.heroRow}>
            <div className={s.heroBlock}>
              <div className={s.heroSub}>미국 4.0 GPA</div>
              <div className={s.heroNum}>{active.usGpa.toFixed(2)}</div>
              <div className={s.heroNote}>평어 <strong>{active.letter}</strong></div>
            </div>
            <div className={s.heroDivider} />
            <div className={s.heroBlock}>
              <div className={s.heroSub}>영국 학위 등급</div>
              <div className={s.heroUk} style={{ color: active.ukClass.color }}>
                {active.ukClass.abbr}
              </div>
              <div className={s.heroNote}>{active.ukClass.name}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3-방식 비교 */}
      {valid && (
        <div className={s.card}>
          <span className={s.cardLabel}>
            세 가지 방식 비교
            <span className={s.cardHint}>{gpa.toFixed(2)} / {scaleObj.short} · {percent.toFixed(1)}%</span>
          </span>
          <div className={s.compareGrid}>
            {METHODS.map((m) => {
              const r = results[m.id]
              const isActive = m.id === activeMethod
              return (
                <div key={m.id} className={`${s.compareCard} ${isActive ? s.compareCardActive : ''}`}>
                  <div className={s.compareHead}>
                    <strong>{m.shortName}</strong>
                    <span className={s.letterBadge}>{r.letter}</span>
                  </div>
                  <div className={s.compareUs}>{r.usGpa.toFixed(2)} <small>/ 4.0</small></div>
                  <div className={s.compareUk} style={{ color: r.ukClass.color }}>
                    {r.ukClass.abbr} · {r.ukClass.name.replace(/ \(.+\)/, '')}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 역산 */}
      <div className={s.card}>
        <span className={s.cardLabel}>
          역산 — 목표 미국 GPA → 한국 학점
          <span className={s.cardHint}>지원 학교 평균 GPA 입력</span>
        </span>
        <div className={s.reverseRow}>
          <div className={s.reverseInputs}>
            <div>
              <label className={s.miniLabel}>목표 US GPA</label>
              <input
                type="number" inputMode="decimal" step={0.01} min={0} max={4.0}
                className={s.gpaInput}
                value={reverseUs}
                onChange={(e) => setReverseUs(e.target.value)}
              />
            </div>
            <div>
              <label className={s.miniLabel}>변환할 한국 만점</label>
              <select
                className={s.select}
                value={reverseScale}
                onChange={(e) => setReverseScale(e.target.value as ScaleId)}
              >
                {SCALES.map((sc) => (
                  <option key={sc.id} value={sc.id}>{sc.label}</option>
                ))}
              </select>
            </div>
          </div>
          {reverseValid && (
            <div className={s.reverseResult}>
              <span>{reverseUsNum.toFixed(2)} / 4.0 →</span>
              <strong>{reversed.toFixed(2)}</strong>
              <small>/ {SCALES.find(x => x.id === reverseScale)?.short}</small>
            </div>
          )}
        </div>
        <p className={s.note}>단순 비례 환산입니다. 학교마다 최저 컷오프 표기 방식이 다르므로 참고용으로만 사용하세요.</p>
      </div>

      {/* 한국 대학별 만점 */}
      <div className={s.card}>
        <span className={s.cardLabel}>한국 대학별 만점 기준</span>
        <div className={s.uniGrid}>
          {KOREAN_UNIS.map((u) => (
            <div key={u.name} className={s.uniRow}>
              <span className={s.uniName}>{u.name}</span>
              <span className={`${s.uniScale} ${u.scale === '4.3' ? s.uniScale43 : s.uniScale45}`}>
                {u.scale} 만점
              </span>
              {u.note && <span className={s.uniNote}>{u.note}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 평어 매핑표 */}
      <div className={s.card}>
        <span className={s.cardLabel}>평어 ↔ GPA 매핑 참고표</span>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>평어</th>
                <th>백분율</th>
                <th>한국 4.5</th>
                <th>한국 4.3</th>
                <th>미국 4.0</th>
              </tr>
            </thead>
            <tbody>
              {LETTER_TABLE.map((row) => (
                <tr key={row.letter}>
                  <td className={s.letterCell}>{row.letter}</td>
                  <td>{row.percent}</td>
                  <td>{row.kr45.toFixed(1)}</td>
                  <td>{row.kr43.toFixed(1)}</td>
                  <td>{row.us40.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.note}>매핑은 학교마다 다를 수 있으며, 일부 대학은 A0/B0 같은 중간 등급을 추가로 사용합니다.</p>
      </div>
    </div>
  )
}
