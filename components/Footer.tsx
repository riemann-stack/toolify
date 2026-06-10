import Link from 'next/link'
import pkg from '../package.json'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <>
      {/* 면책 안내 — 푸터 바로 위에 별도 배치 */}
      <div className={styles.disclaimer}>
        <p>
          ⚠️ Youtil의 모든 도구는 <strong>일반 정보 제공·참고 목적</strong>입니다.
          의료·세무·금융·법률·식품·건축·화학·운동 등 전문 판단이 필요한 사안은 반드시 해당 분야 전문가의 자문을 받으세요.
          계산 결과 사용으로 발생한 직·간접 손실에 운영자는 법적 책임을 지지 않습니다.{' '}
          <Link href="/disclaimer" className={styles.disclaimerLink}>면책조항 자세히 →</Link>
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
          <Link href="/collections" className={styles.link}>상황별 가이드</Link>
          <Link href="/about"      className={styles.link}>소개</Link>
          <Link href="/contact"    className={styles.link}>문의</Link>
          <Link href="/privacy"    className={styles.link}>개인정보처리방침</Link>
          <Link href="/terms"      className={styles.link}>이용약관</Link>
          <Link href="/disclaimer" className={styles.link}>면책조항</Link>
        </div>
      </footer>
    </>
  )
}