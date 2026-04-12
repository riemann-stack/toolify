'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import styles from './weightloss.module.css'

const KCAL_PER_KG = 7700

export default function WeightLossClient() {
  const [current, setCurrent] = useState('')
  const [target,  setTarget]  = useState('')
  const [deficit, setDeficit] = useState('500')

  const DEFICIT_PRESETS = [300, 500, 700, 1000]

  const result = useMemo(() => {
    const cur = parseFloat(current)
    const tgt = parseFloat(target)
    const def = parseInt(deficit)
    if (!cur || !tgt || !def || cur <= tgt || cur < 20 || tgt < 20 || def <= 0) return null

    const lossKg     = cur - tgt
    const totalKcal  = lossKg * KCAL_PER_KG
    const days       = Math.ceil(totalKcal / def)
    const weeks      = Math.floor(days / 7)
    const remDays    = days % 7
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + days)
    const weeklyLoss = (def * 7) / KCAL_PER_KG
    // 요요 안전 여부: 현재 체중의 0.5~1% 이내면 안전
    const safeWeeklyMax = cur * 0.01
    const isSafe = weeklyLoss <= safeWeeklyMax

    return { lossKg, days, weeks, remDays, targetDate, weeklyLoss, isSafe }
  }, [current, target, deficit])

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`

  // 동기부여 문구
  const getMotivation = (days: number, deficit: string) => {
    const def = parseInt(deficit)
    if (days <= 30)  return `딱 한 달! 할 수 있어요 💪 하루 ${def.toLocaleString()}kcal씩 꾸준히 실천해 보세요.`
    if (days <= 60)  return `D-${days}일 남았습니다. 무리하지 말고 하루 ${def.toLocaleString()}kcal씩 꾸준히 실천해 보세요! 🎯`
    if (days <= 100) return `D-${days}일, 100일 프로젝트! 매일 ${def.toLocaleString()}kcal 적자를 유지하면 반드시 도달합니다. 🏃`
    return `D-${days}일. 장기 목표일수록 꾸준함이 핵심입니다. 하루 ${def.toLocaleString()}kcal, 절대 포기하지 마세요! 🌟`
  }

  return (
    <div className={styles.wrap}>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <label className={styles.cardLabel}>현재 체중 (kg)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="75" value={current} onChange={e => setCurrent(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
        <div className={styles.card}>
          <label className={styles.cardLabel}>목표 체중 (kg)</label>
          <div className={styles.inputRow}>
            <input className={styles.numInput} type="number" inputMode="decimal"
              placeholder="65" value={target} onChange={e => setTarget(e.target.value)} />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <label className={styles.cardLabel}>하루 칼로리 적자 (kcal)</label>
        <div className={styles.inputRow}>
          <input className={styles.numInput} type="number" inputMode="numeric"
            placeholder="500" value={deficit} onChange={e => setDeficit(e.target.value)} />
          <span className={styles.unit}>kcal</span>
        </div>
        <div className={styles.presets}>
          {DEFICIT_PRESETS.map(d => (
            <button key={d}
              className={`${styles.presetBtn} ${deficit === String(d) ? styles.presetActive : ''}`}
              onClick={() => setDeficit(String(d))}>
              {d}kcal
            </button>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
          안전한 범위: 하루 300~700kcal 적자 권장 (1,200kcal 미만 섭취 비권장)
        </p>

        {/* BMR 연동 가이드 */}
        <div style={{
          marginTop: '12px',
          background: 'var(--bg3)',
          border: '1px solid rgba(200,255,62,0.15)',
          borderRadius: '10px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>
            💡 하루 소모 칼로리(TDEE)를 모른다면?
          </p>
          <Link href="/tools/health/bmr" style={{
            fontSize: '12px', fontWeight: 600, color: 'var(--accent)',
            textDecoration: 'none', whiteSpace: 'nowrap',
            border: '1px solid rgba(200,255,62,0.3)', borderRadius: '6px',
            padding: '4px 10px', background: 'var(--accent-dim)',
          }}>
            기초대사량(BMR) 계산기 →
          </Link>
        </div>
      </div>

      {result ? (
        <>
          <div className={styles.heroCard}>
            <div className={styles.heroLabel}>목표 달성 예상일</div>
            <div className={styles.heroNum}>{fmtDate(result.targetDate)}</div>
            <div className={styles.heroSub}>
              {result.weeks > 0 && `약 ${result.weeks}주 `}{result.remDays > 0 && `${result.remDays}일`} ({result.days}일) 후
            </div>
          </div>

          {/* 동기부여 문구 */}
          <div style={{
            background: 'var(--bg2)',
            border: `1px solid ${result.isSafe ? 'rgba(200,255,62,0.25)' : 'rgba(255,140,62,0.25)'}`,
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
          }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>
              {result.isSafe ? '✅' : '⚠️'}
            </span>
            <div>
              <p style={{ fontSize: '13px', color: result.isSafe ? 'var(--accent)' : '#FF8C3E', fontWeight: 600, marginBottom: '4px' }}>
                {result.isSafe
                  ? '안전한 감량 속도입니다'
                  : '주의: 감량 속도가 다소 빠릅니다'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
                {getMotivation(result.days, deficit)}
              </p>
            </div>
          </div>

          <div className={styles.grid3}>
            {[
              ['감량 목표',  result.lossKg.toFixed(1) + 'kg'],
              ['주당 감량',  result.weeklyLoss.toFixed(2) + 'kg'],
              ['총 소요일',  result.days.toLocaleString() + '일'],
            ].map(([label, value]) => (
              <div key={label} className={styles.statCard}>
                <div className={styles.statLabel}>{label}</div>
                <div className={styles.statValue}>{value}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          {current && target && parseFloat(current) <= parseFloat(target)
            ? '목표 체중은 현재 체중보다 낮아야 합니다'
            : '현재 체중, 목표 체중, 하루 칼로리 적자를 입력하면 계산됩니다'}
        </div>
      )}
    </div>
  )
}