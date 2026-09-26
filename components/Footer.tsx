/* components/Footer.tsx (server) — 스펙 §10.18
   운영자·문의·광고 고지(모든 페이지) + 분야 11 + Youtil + 정책 + 사이트 공통 면책.
   ─ 문구는 사실만: 운영자·연락처·응답 시간은 app/about·app/contact 공시와 일치시킨다('편집팀' 표기 금지).
   ─ 분야 허브 11개 링크를 SSR로 노출 (SEO-07). 분야 점 색은 data-cat → --c (globals 토큰). */
import Link from 'next/link'
import { categories, totalTools } from '@/lib/tools'
import { SITE_OPERATOR } from './SiteJsonLd'
import styles from './Footer.module.css'

/** '계산 해설'(/guides) 공개 스위치 — 글 3편 이상이 실제로 발행된 뒤 true (스펙 §10.18·§10.20: 빈 지면 = 얇은 사이트 신호).
 *  Nav.tsx 의 GUIDES_LIVE 와 함께 바꿀 것. */
const GUIDES_LIVE = false

export default function Footer() {
  return (
    <footer className={styles.ft}>
      <div className={styles.ftIn}>
        <div className={styles.ftGrid}>
          <div className={styles.ftBrand}>
            <Link href="/" className={styles.ftLogo} aria-label="Youtil 홈">
              <svg className={styles.ftLogoMark} viewBox="0 0 28 28" aria-hidden="true" focusable="false">
                <rect width="28" height="28" rx="8" fill="currentColor" />
                <rect x="7.5" y="9.5" width="13" height="3" rx="1.5" fill="#fff" />
                <rect x="7.5" y="15.5" width="8.5" height="3" rx="1.5" fill="#fff" />
              </svg>
              Youtil
            </Link>
            <p>
              계산은 정확하게, 기준은 투명하게. 금융·건강·생활 계산기 {totalTools}개를 무료로 제공하고,
              법정 수치에는 기준일과 공식 출처를 밝히는 것을 원칙으로 합니다.
            </p>
            <div className={styles.ftOp}>
              <span>
                <b>운영</b>
                <span>{SITE_OPERATOR.name} (1인 운영) · <Link href="/about">운영자 소개</Link></span>
              </span>
              <span>
                <b>문의</b>
                <span><a href={`mailto:${SITE_OPERATOR.email}`}>{SITE_OPERATOR.email}</a> · 평일 기준 1~3일 안에 답변합니다</span>
              </span>
              <span>
                <b>광고</b>
                <span>Google AdSense 광고를 게재해 운영비를 충당합니다 · <Link href="/ads-policy">광고 게재 원칙</Link></span>
              </span>
            </div>
          </div>

          <div className={styles.ftCatsCol}>
            <h2 className={styles.ftH}>분야별 도구</h2>
            <ul className={`${styles.ftList} ${styles.ftCats}`}>
              {categories.map(c => (
                <li key={c.id}><Link data-cat={c.id} href={`/tools/${c.id}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={styles.ftH}>Youtil</h2>
            <ul className={styles.ftList}>
              <li><Link href="/about">소개</Link></li>
              <li><Link href="/editorial-policy">편집·검산 원칙</Link></li>
              <li><Link href="/updates">업데이트 기록</Link></li>
              {GUIDES_LIVE && <li><Link href="/guides">계산 해설</Link></li>}
              <li><Link href="/collections">상황별 가이드</Link></li>
              <li><Link href="/contact">문의·오류 제보</Link></li>
            </ul>
          </div>

          <div>
            <h2 className={styles.ftH}>정책</h2>
            <ul className={styles.ftList}>
              <li><Link href="/privacy"><strong>개인정보처리방침</strong></Link></li>
              <li><Link href="/terms">이용약관</Link></li>
              <li><Link href="/disclaimer">면책조항</Link></li>
              <li><Link href="/ads-policy">광고 게재 원칙</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.ftLegal}>
          <p>
            Youtil의 모든 계산 결과는 <strong>일반 정보 제공을 위한 추정치</strong>입니다.
            세무·의료·법률·금융 등 전문 판단이 필요한 사안은 해당 기관이나 전문가에게 확인하세요.
            계산 결과 사용으로 생긴 직·간접 손실에 운영자는 법적 책임을 지지 않습니다(<Link href="/disclaimer">면책조항</Link>).
            대부분의 계산은 브라우저 안에서 끝나며, 입력값을 서버에 저장하지 않습니다.
          </p>
          <p>© {new Date().getFullYear()} Youtil · youtil.kr</p>
        </div>
      </div>
    </footer>
  )
}
