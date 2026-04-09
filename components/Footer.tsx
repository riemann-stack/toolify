import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logo}>Tool<span>ify</span></div>
      <div className={styles.copy}>© 2026 Toolify · 무료 온라인 도구 모음</div>
    </footer>
  )
}