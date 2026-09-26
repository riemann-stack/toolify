/* components/Callout.tsx — 이모지 콜아웃(💡 360 · ⚠️ 837) 대체 (스펙 §10.5). 섹션당 1개 이하. role="note"
   tone: tip(accent-soft · bulb) | warn(warning-soft · alert) | note(bg3 · info) — 색만이 아니라 아이콘·제목으로도 구분(1.4.1) */
import type { ReactNode } from 'react'
import styles from './Callout.module.css'
import UiIcon from './UiIcon'

const TONE = {
  tip: { cls: '', icon: 'bulb' },
  warn: { cls: styles.coWarn, icon: 'alert' },
  note: { cls: styles.coNote, icon: 'info' },
} as const

export type CalloutTone = keyof typeof TONE

export default function Callout({ tone = 'tip', title, children }: { tone?: CalloutTone; title?: string; children: ReactNode }) {
  const t = TONE[tone]
  return (
    <div className={`${styles.co} ${t.cls}`} role="note">
      <UiIcon name={t.icon} size={20} />
      <div className={styles.coMain}>
        {title && <strong className={styles.coTitle}>{title}</strong>}
        <div className={styles.coBody}>{children}</div>
      </div>
    </div>
  )
}
