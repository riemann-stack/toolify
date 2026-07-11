'use client'

import { useState, useMemo } from 'react'
import Disclaimer from '@/components/Disclaimer'
import {
  computeSubject, weightedAverages, type SubjectInput,
} from './nesinData'
import s from './nesin-5grade.module.css'

let nextId = 100

export default function Nesin5GradeClient() {
  const [subjects, setSubjects] = useState<SubjectInput[]>([
    { id: 1, name: '국어', rank: '15', total: '250', units: '4' },
    { id: 2, name: '수학', rank: '40', total: '250', units: '4' },
    { id: 3, name: '영어', rank: '80', total: '250', units: '4' },
  ])

  const results = useMemo(() => subjects.map(computeSubject), [subjects])
  const avg = useMemo(() => weightedAverages(results), [results])

  const update = (id: number, field: keyof SubjectInput, value: string) =>
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  const addRow = () =>
    setSubjects((prev) => [...prev, { id: ++nextId, name: '', rank: '', total: '', units: '3' }])
  const removeRow = (id: number) => setSubjects((prev) => prev.filter((s) => s.id !== id))

  const gradeColor = (g: number | null) => {
    if (g === null) return 'var(--muted)'
    if (g <= 1) return 'var(--success)'
    if (g <= 2) return 'var(--cat-health)'
    if (g <= 3) return 'var(--accent-ink)'
    if (g <= 4) return 'var(--warning)'
    return 'var(--danger)'
  }

  const fmt2 = (n: number) => n.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className={s.wrap}>
      {/* 결과 히어로 */}
      <div className={s.resultCard} role="status">
        <p className={s.resultLabel}>이수단위 가중 평균 내신</p>
        {avg.avg5 !== null ? (
          <>
            <p className={s.hero} style={{ color: gradeColor(Math.round(avg.avg5)) }}>
              {fmt2(avg.avg5)}<span className={s.heroUnit}>등급</span>
            </p>
            <p className={s.resultSub}>
              5등급제 · 총 {avg.totalUnits}단위 · 구 9등급 환산 <strong>{avg.avg9 !== null ? fmt2(avg.avg9) : '—'}등급</strong>
            </p>
          </>
        ) : (
          <p className={s.emptyNote}>과목별 석차·재적수·이수단위를 입력하면 5등급 가중 평균과 9등급 환산을 계산합니다.</p>
        )}
      </div>

      {/* 과목 입력 */}
      <div className={s.card}>
        <div className={s.tableHead}>
          <span className={`${s.colName}`}>과목</span>
          <span className={s.colNum}>석차</span>
          <span className={s.colNum}>재적</span>
          <span className={s.colNum}>단위</span>
          <span className={s.colGrade}>등급</span>
          <span className={s.colDel} aria-hidden />
        </div>
        {subjects.map((sub, i) => {
          const r = results[i]
          return (
            <div key={sub.id} className={s.row}>
              <input className={`${s.inp} ${s.colName}`} value={sub.name} placeholder="과목명"
                onChange={(e) => update(sub.id, 'name', e.target.value)} aria-label={`${i + 1}번 과목명`} />
              <input className={`${s.inp} ${s.colNum}`} type="number" inputMode="numeric" min={1} value={sub.rank}
                onChange={(e) => update(sub.id, 'rank', e.target.value)} aria-label={`${i + 1}번 석차`} />
              <input className={`${s.inp} ${s.colNum}`} type="number" inputMode="numeric" min={1} value={sub.total}
                onChange={(e) => update(sub.id, 'total', e.target.value)} aria-label={`${i + 1}번 재적수`} />
              <input className={`${s.inp} ${s.colNum}`} type="number" inputMode="decimal" min={0} value={sub.units}
                onChange={(e) => update(sub.id, 'units', e.target.value)} aria-label={`${i + 1}번 이수단위`} />
              <span className={s.colGrade}>
                <span className={s.gradeBadge} style={{ color: gradeColor(r.grade5), borderColor: gradeColor(r.grade5) }}>
                  {r.grade5 ?? '—'}
                </span>
              </span>
              <button type="button" className={`${s.del} ${s.colDel}`} aria-label={`${i + 1}번 과목 삭제`}
                onClick={() => removeRow(sub.id)} disabled={subjects.length <= 1}>✕</button>
            </div>
          )
        })}
        <button type="button" className={s.addBtn} onClick={addRow}>＋ 과목 추가</button>
      </div>

      {/* 과목별 상세 */}
      {results.some((r) => r.grade5 !== null) && (
        <div className={s.card}>
          <p className={s.groupLabel}>과목별 5등급 vs 9등급 환산</p>
          <div className={s.tableScroll}>
            <table className={s.detailTable}>
              <thead>
                <tr>
                  <th scope="col">과목</th>
                  <th scope="col">석차%</th>
                  <th scope="col">5등급</th>
                  <th scope="col">9등급</th>
                </tr>
              </thead>
              <tbody>
                {results.filter((r) => r.grade5 !== null).map((r) => (
                  <tr key={r.id}>
                    <td>{r.name || '—'}</td>
                    <td>{r.pct !== null ? `${r.pct.toFixed(1)}%` : '—'}</td>
                    <td><strong style={{ color: gradeColor(r.grade5) }}>{r.grade5}</strong></td>
                    <td className={s.dim}>{r.grade9}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={s.groupNote}>
            석차% = 석차 ÷ 재적수 × 100. 5등급은 누적 10·34·66·90·100%, 9등급은 4·11·23·40·60·77·89·96·100% 기준입니다.
          </p>
        </div>
      )}

      {/* 5등급 구간 표 */}
      <div className={s.card}>
        <p className={s.groupLabel}>5등급 상대평가 구간 (2025 고1~)</p>
        <div className={s.bandList}>
          {[
            { g: 1, r: '상위 10%', p: '10%' },
            { g: 2, r: '10 ~ 34%', p: '24%' },
            { g: 3, r: '34 ~ 66%', p: '32%' },
            { g: 4, r: '66 ~ 90%', p: '24%' },
            { g: 5, r: '90 ~ 100%', p: '10%' },
          ].map((b) => (
            <div key={b.g} className={s.bandRow}>
              <span className={s.bandGrade} style={{ color: gradeColor(b.g) }}>{b.g}등급</span>
              <span className={s.bandRange}>누적 {b.r}</span>
              <span className={s.bandPct}>{b.p}</span>
            </div>
          ))}
        </div>
      </div>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/edu/gpa-converter', label: '학점(GPA) 환산기' },
          { href: '/tools/edu/review-interval', label: '복습 간격 계산기' },
          { href: '/tools/finance/housing-score', label: '청약 가점 계산기' },
        ]}
        sources={[
          { label: '교육부 — 2028 대입·고교학점제', href: 'https://www.moe.go.kr' },
        ]}
      >
        5등급·9등급 환산은 교육부 고시 누적 비율에 따른 참고 추정치입니다. 동점자 처리·반올림·과목 특성에 따라 실제 학생부 등급과 다를 수 있으니, 공식 등급은 학교 성적 산출(NEIS)을 따르세요.
      </Disclaimer>
    </div>
  )
}
