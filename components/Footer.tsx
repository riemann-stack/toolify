import Link from 'next/link'
import pkg from '../package.json'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <>
      {/* 면책 안내 — 푸터 바로 위에 별도 배치 */}
      <div className={styles.disclaimer}>
        <p>
          ⚠️ Youtil의 모든 도구는 <strong>일반 정보 제공 목적</strong>입니다.
          의료·법률·세무·금융 등 전문적 판단이 필요한 사안은 반드시 해당 분야 전문가의 상담을 받으세요.
          계산 결과는 참고용이며, 결과 사용으로 인한 직·간접적 손실에 대해 운영자는 법적 책임을 지지 않습니다.
          자세한 내용은 <Link href="/terms" className={styles.disclaimerLink}>이용약관</Link>을 참고하세요.
        </p>
      </div>

      <footer className={styles.footer}>
        <div className={styles.left}>
          <div className={styles.logo}>You<span>til</span></div>
          <div className={styles.copy}>
            © 2026 Youtil · 무료 온라인 도구 모음
            <span className={styles.version}>v{pkg.version}</span>
          </div>
        </div>
        <div className={styles.links}>
          <Link href="/about"   className={styles.link}>소개</Link>
          <Link href="/contact" className={styles.link}>문의</Link>
          <Link href="/privacy" className={styles.link}>개인정보처리방침</Link>
          <Link href="/terms"   className={styles.link}>이용약관</Link>
        </div>
      </footer>
    </>
  )
}