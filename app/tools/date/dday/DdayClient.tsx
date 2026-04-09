'use client'

import { useState } from 'react'
import styles from '../date.module.css'

interface DdayItem {
  id: number
  label: string
  date: string
}

function calcDday(dateStr: string): { diff: number; label: string; isPast: boolean; isToday: boolean } {
  const target = new Date(dateStr)
  const today  = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - today.getTime()) / 86400000)

  if (diff === 0) return { diff: 0, label: 'D-day', isPast: false, isToday: true }
  if (diff > 0)   return { diff,    label: `D-${diff}`, isPast: false, isToday: false }
  return { diff: Math.abs(diff), label: `D+${Math.abs(diff)}`, isPast: true, isToday: false }
}

let idCounter = 3

export default function DdayClient() {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // 기본 예시 아이템
  const getDefaultDate = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  const [items, setItems] = useState<DdayItem[]>([
    { id: 1, label: '내 목표일', date: getDefaultDate(100) },
    { id: 2, label: '프로젝트 마감', date: getDefaultDate(30) },
  ])
  const [newLabel, setNewLabel] = useState('')
  const [newDate,  setNewDate]  = useState('')

  const handleAdd = () => {
    if (!newDate) return
    setItems(prev => [...prev, {
      id: idCounter++,
      label: newLabel.trim() || '새 디데이',
      date: newDate,
    }])
    setNewLabel('')
    setNewDate('')
  }

  const handleRemove = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // 날짜순 정렬
  const sorted = [...items].sort((a, b) => {
    const da = calcDday(a.date)
    const db = calcDday(b.date)
    if (!da.isPast && !db.isPast) return da.diff - db.diff
    if (da.isPast && db.isPast)   return da.diff - db.diff
    return da.isPast ? 1 : -1
  })

  return (
    <div className={styles.wrap}>

      {/* 추가 폼 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>디데이 추가</label>
        <div className={styles.addRow}>
          <input
            className={styles.textInput}
            type="text"
            placeholder="이름 (예: 수능, 결혼식)"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <input
            className={styles.dateInput}
            type="date"
            value={newDate}
            min={todayStr}
            onChange={e => setNewDate(e.target.value)}
          />
          <button className={styles.addBtn} onClick={handleAdd} disabled={!newDate}>
            추가
          </button>
        </div>
      </div>

      {/* 디데이 목록 */}
      {sorted.length > 0 && (
        <div className={styles.ddayList}>
          {sorted.map(item => {
            const d = calcDday(item.date)
            return (
              <div key={item.id} className={`${styles.ddayCard} ${d.isToday ? styles.ddayToday : ''} ${d.isPast ? styles.ddayPast : ''}`}>
                <div className={styles.ddayLeft}>
                  <div className={styles.ddayBadge}>{d.label}</div>
                  <div className={styles.ddayLabel}>{item.label}</div>
                  <div className={styles.ddayDate}>
                    {new Date(item.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(item.id)}
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {sorted.length === 0 && (
        <div className={styles.empty}>디데이를 추가해보세요</div>
      )}
    </div>
  )
}