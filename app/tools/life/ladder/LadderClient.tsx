'use client'

import { useState, useCallback, useMemo } from 'react'
import styles from './ladder.module.css'

const MAX = 8
const COLORS = [
  '#C8FF3E', '#3EC8FF', '#FF8C3E', '#FF3E8C',
  '#B03EFF', '#3EFF9B', '#FF6B6B', '#FFD700',
]

// ── 사다리 생성 ──
function generateLadder(count: number, rows: number): boolean[][] {
  return Array.from({ length: rows }, () => {
    const row = Array(count - 1).fill(false)
    let c = 0
    while (c < count - 1) {
      if (Math.random() > 0.52) { row[c] = true; c += 2 }
      else c++
    }
    return row
  })
}

// ── 경로 추적 (도착 인덱스 반환) ──
function traceDest(ladder: boolean[][], start: number): number {
  let pos = start
  for (const row of ladder) {
    if (pos < row.length && row[pos]) pos++
    else if (pos > 0 && row[pos - 1]) pos--
  }
  return pos
}

// ── SVG 상수 ──
const SVG_W   = 600
const PAD_X   = 50   // 좌우 여백 — labelRow와 동일하게 맞춤
const ROW_H   = 26
const ROWS    = 14

export default function LadderClient() {
  const [names,    setNames]    = useState(['참가자1', '참가자2', '참가자3', '참가자4'])
  const [results,  setResults]  = useState(['당첨🎉', '꽝', '꽝', '꽝'])
  const [ladder,   setLadder]   = useState<boolean[][] | null>(null)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  const count  = names.length
  const svgH   = ROWS * ROW_H
  const colW   = (SVG_W - PAD_X * 2) / (count - 1)
  const colX   = (i: number) => PAD_X + i * colW

  // 사다리 생성
  const handleGenerate = useCallback(() => {
    setLadder(generateLadder(count, ROWS))
    setRevealed(new Set())
  }, [count])

  // 각 출발점의 도착 인덱스
  const dests = useMemo(() => {
    if (!ladder) return []
    return Array.from({ length: count }, (_, i) => traceDest(ladder, i))
  }, [ladder, count])

  // 이름 클릭 → 토글
  const handleToggle = (i: number) => {
    if (!ladder) return
    setRevealed(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const handleRevealAll = () => {
    if (!ladder) return
    if (revealed.size === count) setRevealed(new Set())
    else setRevealed(new Set(Array.from({ length: count }, (_, i) => i)))
  }

  // 경로 세그먼트 계산
  const getPathSegs = (startIdx: number) => {
    if (!ladder) return []
    const segs: { x1: number; y1: number; x2: number; y2: number }[] = []
    let pos = startIdx

    // 맨 위 → 첫 가로줄 전까지
    segs.push({ x1: colX(pos), y1: 0, x2: colX(pos), y2: ROW_H * 0.5 })

    for (let r = 0; r < ladder.length; r++) {
      const midY  = r * ROW_H + ROW_H * 0.5
      const nextY = (r + 1) * ROW_H + ROW_H * 0.5

      if (pos < ladder[r].length && ladder[r][pos]) {
        // 가로줄 → 오른쪽 이동
        segs.push({ x1: colX(pos), y1: midY, x2: colX(pos + 1), y2: midY })
        pos++
      } else if (pos > 0 && ladder[r][pos - 1]) {
        // 가로줄 → 왼쪽 이동
        segs.push({ x1: colX(pos), y1: midY, x2: colX(pos - 1), y2: midY })
        pos--
      }

      // 다음 행까지 세로
      if (r < ladder.length - 1) {
        segs.push({ x1: colX(pos), y1: midY, x2: colX(pos), y2: nextY })
      }
    }

    // 마지막 세로 → 아래 끝까지
    const lastMidY = (ROWS - 1) * ROW_H + ROW_H * 0.5
    segs.push({ x1: colX(pos), y1: lastMidY, x2: colX(pos), y2: svgH })

    return segs
  }

  // 결과 배열: dest 인덱스 위치에 어떤 출발자가 도착했는지
  const arrivals = useMemo(() => {
    const arr = Array(count).fill(-1)
    dests.forEach((dest, src) => { arr[dest] = src })
    return arr
  }, [dests, count])

  const updateName   = (i: number, v: string) => { setNames(p   => { const n=[...p]; n[i]=v; return n }); setLadder(null) }
  const updateResult = (i: number, v: string) => { setResults(p => { const n=[...p]; n[i]=v; return n }); setLadder(null) }
  const addPerson    = () => { if (count >= MAX) return; setNames(p => [...p, `참가자${p.length+1}`]); setResults(p => [...p, '꽝']); setLadder(null) }
  const removePerson = () => { if (count <= 2) return; setNames(p => p.slice(0,-1)); setResults(p => p.slice(0,-1)); setLadder(null) }

  return (
    <div className={styles.wrap}>

      {/* 입력 */}
      <div className={styles.inputSection}>
        <div className={styles.inputCol}>
          <div className={styles.colHeader}>참가자</div>
          {names.map((n, i) => (
            <div key={i} className={styles.inputWithDot}>
              <span className={styles.dot} style={{ background: COLORS[i % COLORS.length] }} />
              <input className={styles.nameInput} value={n}
                onChange={e => updateName(i, e.target.value)} placeholder={`참가자${i+1}`} />
            </div>
          ))}
        </div>
        <div className={styles.inputCol}>
          <div className={styles.colHeader}>결과</div>
          {results.map((r, i) => (
            <input key={i} className={`${styles.nameInput} ${styles.resultInput}`} value={r}
              onChange={e => updateResult(i, e.target.value)} placeholder={`결과${i+1}`} />
          ))}
        </div>
      </div>

      {/* 인원 조절 */}
      <div className={styles.countRow}>
        <button className={styles.countBtn} onClick={removePerson} disabled={count <= 2}>− 줄이기</button>
        <span className={styles.countNum}>{count}명</span>
        <button className={styles.countBtn} onClick={addPerson} disabled={count >= MAX}>+ 늘리기</button>
      </div>

      {/* 생성 버튼 */}
      <button className={styles.generateBtn} onClick={handleGenerate}>
        🪜 사다리 생성
      </button>

      {/* 사다리 영역 */}
      {ladder && (
        <div className={styles.ladderBox}>

          {/* ── 참가자 이름 (위) ── */}
          <div className={styles.nameRow}>
            {names.map((name, i) => {
              const isOn = revealed.has(i)
              return (
                <button
                  key={i}
                  className={`${styles.nameTag} ${isOn ? styles.nameTagOn : ''}`}
                  style={isOn ? { borderColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length] } : {}}
                  onClick={() => handleToggle(i)}
                  title={isOn ? '클릭해서 숨기기' : '클릭해서 경로 보기'}
                >
                  {name}
                </button>
              )
            })}
          </div>

          {/* ── SVG 사다리 ── */}
          <svg
            width="100%"
            viewBox={`0 0 ${SVG_W} ${svgH}`}
            style={{ display: 'block', overflow: 'visible' }}
          >
            {/* 기본 세로줄 */}
            {Array.from({ length: count }, (_, i) => (
              <line key={`v${i}`}
                x1={colX(i)} y1={0} x2={colX(i)} y2={svgH}
                stroke="rgba(255,255,255,0.12)" strokeWidth="2"
              />
            ))}

            {/* 기본 가로줄 */}
            {ladder.map((row, r) =>
              row.map((has, c) => !has ? null : (
                <line key={`h${r}-${c}`}
                  x1={colX(c)} y1={r * ROW_H + ROW_H * 0.5}
                  x2={colX(c+1)} y2={r * ROW_H + ROW_H * 0.5}
                  stroke="rgba(255,255,255,0.2)" strokeWidth="2"
                />
              ))
            )}

            {/* 경로 (공개된 것) */}
            {Array.from(revealed).map(i => {
              const segs = getPathSegs(i)
              const color = COLORS[i % COLORS.length]
              return segs.map((s, si) => (
                <line key={`path${i}-${si}`}
                  x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                  stroke={color} strokeWidth="4"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              ))
            })}
          </svg>

          {/* ── 결과 (아래) ── */}
          <div className={styles.nameRow}>
            {arrivals.map((srcIdx, destIdx) => {
              const isRevealed = srcIdx >= 0 && revealed.has(srcIdx)
              return (
                <div
                  key={destIdx}
                  className={`${styles.resultTag} ${isRevealed ? styles.resultTagOn : ''}`}
                  style={isRevealed ? { borderColor: COLORS[srcIdx % COLORS.length], color: COLORS[srcIdx % COLORS.length] } : {}}
                >
                  {isRevealed ? results[destIdx] : '?'}
                </div>
              )
            })}
          </div>

        </div>
      )}

      {/* 전체 공개 / 전체 숨기기 버튼 */}
      {ladder && (
        <button className={styles.revealAllBtn} onClick={handleRevealAll}>
          {revealed.size === count ? '전체 숨기기' : '전체 결과 공개'}
        </button>
      )}

    </div>
  )
}