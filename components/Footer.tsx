import Link from 'next/link'
import pkg from '../package.json'
import UiIcon from './UiIcon'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <>
      {/* 면책 안내 — 푸터 바로 위 중성 화이트 밴드 (페이퍼·쿨톤 양쪽 캔버스 공통) */}
      <div className={styles.disclaimer}>
        <p>
          <span className={styles.disclaimerIcon}><UiIcon name="alert" size={13} /></span>
          Youtil의 모든 도구는 <strong>일반 정보 제공·참고 목적</strong>입니다.
          의료·세무·금융·법률·식품·건축·화학·운동 등 전문 판단이 필요한 사안은 반드시 해당 분야 전문가의 자문을 받으세요.
          계산 결과 사용으로 발생한 직·간접 손실에 운영자는 법적 책임을 지지 않습니다.{' '}
          <Link href="/disclaimer" className={styles.disclaimerLink}>면책조항 자세히 →</Link>
        </p>
      </div>

      {/* 푸터 — 잉크 다크 블록 (홈 '전체 보기' 타일·Nav 로고 마크와 수미상관) */}
      <footer className={styles.footer}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <span className={styles.logoMark} aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
                <path d="M8 7m0 1a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1z" />
                <path d="M8 14l0 .01" /><path d="M12 14l0 .01" /><path d="M16 14l0 .01" />
                <path d="M8 17l0 .01" /><path d="M12 17l0 .01" /><path d="M16 17l0 .01" />
              </svg>
            </span>
            Youtil
          </div>
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
