'use client'

import { useState } from 'react'
import styles from './lotto.module.css'

// 번호별 색상 (실제 로또 공 색상)
function getBallColor(num: number): string {
  if (num <= 10) return styles.yellow
  if (num <= 20) return styles.blue
  if (num <= 30) return styles.red
  if (num <= 40) return styles.gray
  return styles.green
}

function generateNumbers(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1)
  const picked: number[] = []
  while (picked.length < 6) {
    const idx = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(idx, 1)[0])
  }
  return picked.sort((a, b) => a - b)
}

export default function LottoClient() {
  const [gameCount, setGameCount] = useState(5)
  const [results, setResults] = useState<number[][]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const handleGenerate = () => {
    setIsAnimating(true)
    setResults([])

    // 게임을 순차적으로 애니메이션 표시
    Array.from({ length: gameCount }).forEach((_, i) => {
      setTimeout(() => {
        setResults(prev => [...prev, generateNumbers()])
        if (i === gameCount - 1) setIsAnimating(false)
      }, i * 180)
    })
  }

  const handleCopy = (nums: number[]) => {
    navigator.clipboard.writeText(nums.join(', '))
  }

  return (
    <div className={styles.wrap}>

      {/* 설정 */}
      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <span className={styles.controlLabel}>게임 수</span>
          <div className={styles.countBtns}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`${styles.countBtn} ${gameCount === n ? styles.countBtnActive : ''}`}
                onClick={() => setGameCount(n)}
              >
                {n}게임
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 생성 버튼 */}
      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={isAnimating}
      >
        {isAnimating ? '추첨 중...' : '🎰 번호 생성'}
      </button>

      {/* 결과 */}
      {results.length > 0 && (
        <div className={styles.results}>
          {results.map((nums, i) => (
            <div key={i} className={styles.gameRow}>
              <span className={styles.gameLabel}>{String.fromCharCode(65 + i)}</span>
              <div className={styles.balls}>
                {nums.map((num) => (
                  <span key={num} className={`${styles.ball} ${getBallColor(num)}`}>
                    {num}
                  </span>
                ))}
              </div>
              <button
                className={styles.copyBtn}
                onClick={() => handleCopy(nums)}
                title="복사"
              >
                복사
              </button>
            </div>
          ))}

          <button
            className={styles.regenerateBtn}
            onClick={handleGenerate}
          >
            ↺ 다시 생성
          </button>
        </div>
      )}

      {/* 번호 색상 안내 */}
      <div className={styles.legend}>
        <span className={`${styles.legendDot} ${styles.yellow}`}>1~10</span>
        <span className={`${styles.legendDot} ${styles.blue}`}>11~20</span>
        <span className={`${styles.legendDot} ${styles.red}`}>21~30</span>
        <span className={`${styles.legendDot} ${styles.gray}`}>31~40</span>
        <span className={`${styles.legendDot} ${styles.green}`}>41~45</span>
      </div>

    </div>
  )
}