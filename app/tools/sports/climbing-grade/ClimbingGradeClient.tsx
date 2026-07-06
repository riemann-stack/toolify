'use client'

import { useState } from 'react'
import {
  BANDS, BOULDER_ROWS, ROUTE_ROWS, SYSTEMS,
  type Mode, type BoulderRow, type RouteRow,
} from './climbingData'
import s from './climbing-grade.module.css'

type AnyRow = BoulderRow | RouteRow
const cell = (row: AnyRow, key: string): string => (row as unknown as Record<string, string>)[key]

export default function ClimbingGradeClient() {
  const [mode, setMode] = useState<Mode>('boulder')
  const [systemId, setSystemId] = useState('v')
  const [rowIdx, setRowIdx] = useState(4) // V4 (중급)

  const rows: AnyRow[] = mode === 'boulder' ? BOULDER_ROWS : ROUTE_ROWS
  const systems = SYSTEMS[mode]
  const sys = systems.find((x) => x.id === systemId) ?? systems[0]
  const idx = Math.min(rowIdx, rows.length - 1)
  const row = rows[idx]
  const band = BANDS[row.band]

  function switchMode(m: Mode) {
    if (m === mode) return
    setMode(m)
    setSystemId(SYSTEMS[m][0].id)
    setRowIdx(m === 'boulder' ? 4 : 9) // 볼더 V4 / 루트 5.11a
  }

  return (
    <div className={s.wrap}>
      {/* 모드 토글 */}
      <div className={s.modeToggle} role="tablist" aria-label="클라이밍 종류">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'boulder'}
          className={`${s.modeBtn} ${mode === 'boulder' ? s.modeActive : ''}`}
          onClick={() => switchMode('boulder')}
        >볼더링</button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'route'}
          className={`${s.modeBtn} ${mode === 'route' ? s.modeActive : ''}`}
          onClick={() => switchMode('route')}
        >루트(리드)</button>
      </div>

      {/* 입력 */}
      <div className={s.card}>
        <span className={s.cardLabel}>내 등급 입력</span>

        <div className={s.field}>
          <span className={s.fieldLabel} id="cg-system-label">기준 체계</span>
          <div className={s.segment} role="group" aria-labelledby="cg-system-label" style={{ gridTemplateColumns: `repeat(${systems.length}, 1fr)` }}>
            {systems.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={systemId === x.id}
                className={`${s.segBtn} ${systemId === x.id ? s.segActive : ''}`}
                onClick={() => setSystemId(x.id)}
              >{x.label}</button>
            ))}
          </div>
        </div>

        <div className={s.field}>
          <span className={s.fieldLabel}>{sys.label} 등급</span>
          <div className={s.selectWrap}>
            <select
              className={s.select}
              aria-label={`${sys.label} 등급 선택`}
              value={idx}
              onChange={(e) => setRowIdx(Number(e.target.value))}
            >
              {rows.map((r, i) => (
                <option key={i} value={i}>{cell(r, sys.key)}</option>
              ))}
            </select>
            <span className={s.selectArrow}>▼</span>
          </div>
        </div>
      </div>

      {/* 결과 */}
      <div className={s.hero} role="status">
        <span className={s.bandBadge} style={{ background: band.color }}>{band.label}</span>
        <div className={s.systemGrid} style={{ gridTemplateColumns: `repeat(${systems.length}, 1fr)` }}>
          {systems.map((x) => (
            <div key={x.id} className={`${s.systemChip} ${x.id === systemId ? s.systemChipActive : ''}`}>
              <span className={s.systemName}>{x.label}</span>
              <span className={s.systemValue}>{cell(row, x.key)}</span>
            </div>
          ))}
        </div>
        <p className={s.bandDesc}>{band.desc}</p>
      </div>

      {/* 변환표 */}
      <div className={s.card}>
        <span className={s.cardLabel}>{mode === 'boulder' ? '볼더링' : '루트'} 등급 변환표</span>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                {systems.map((x) => <th scope="col" key={x.id}>{x.label}</th>)}
                <th scope="col">난이도</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-current={i === idx ? 'true' : undefined}
                  aria-label={`${systems.map((x) => `${x.label} ${cell(r, x.key)}`).join(', ')} · ${BANDS[r.band].label}`}
                  className={i === idx ? s.rowActive : ''}
                  onClick={() => setRowIdx(i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRowIdx(i) } }}
                >
                  {systems.map((x) => (
                    <td key={x.id} className={x.id === systemId ? s.cellPrimary : ''}>{cell(r, x.key)}</td>
                  ))}
                  <td>
                    <span className={s.bandDot} style={{ background: BANDS[r.band].color }} />
                    {BANDS[r.band].label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={s.helpText}>
          행을 누르면 해당 등급으로 바뀝니다. 변환은 표준 환산표 기준 <strong>근사치</strong>로, 출처·루트 성향에 따라 한 단계 차이날 수 있습니다.
        </p>
      </div>
    </div>
  )
}
