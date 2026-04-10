import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <div className={styles.logo}>You<span>til</span></div>
        <div className={styles.copy}>© 2026 Youtil · 무료 온라인 도구 모음</div>
      </div>
      <div className={styles.links}>
        <Link href="/about"   className={styles.link}>소개</Link>
        <Link href="/privacy" className={styles.link}>개인정보처리방침</Link>
        <Link href="/terms"   className={styles.link}>이용약관</Link>
      </div>
    </footer>
  )
}