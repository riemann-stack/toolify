import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Nav from '@/components/Nav'
import SectionBar from '@/components/SectionBar'
import Footer from '@/components/Footer'
import BottomNav from '@/components/BottomNav'
import bottomNavStyles from '@/components/BottomNav.module.css'
import SiteJsonLd from '@/components/SiteJsonLd'
import AutoAds from '@/components/AutoAds'
import { totalTools } from '@/lib/tools'

// 모바일 뷰포트 + 라이트 테마 (status bar / 모바일 브라우저 UI) — 스펙 §6.2: 흰 헤더와 같은 #FFFFFF
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // 홈 화면 추가(standalone) 실행 시 하단 탭바의 env(safe-area-inset-bottom)이 유효하려면 필수
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
  colorScheme: 'light',
}

const SITE_DESCRIPTION =
  `연봉 실수령액·대출이자·BMI·만 나이·평수 변환까지. 금융·건강·요리·생활·스포츠·주거·단위·날짜·예술·교육·개발 11개 분야 무료 계산기 ${totalTools}개를 로그인 없이 바로 쓰세요.`
const SHARE_DESCRIPTION =
  '금융·건강·요리·생활·날짜·단위 변환·개발까지 11개 분야 무료 계산기 모음. 로그인 없이 바로 계산하세요.'

/* 루트 metadata = 모든 페이지의 상속 기본값. 페이지별 값(canonical·og:url)은 여기에 두지 않는다 (SEO-06):
   루트 canonical이 있으면 metadata를 빠뜨린 하위 페이지가 조용히 '홈'을 canonical로 상속해 색인에서 빠진다.
   → buildMetadata(lib/seo.ts)를 쓰는 페이지는 각자 alternates.canonical·openGraph.url을 path로 설정한다.
   → 홈(app/page.tsx)은 자체 metadata로 canonical '/'을 명시해야 한다. */
export const metadata: Metadata = {
  metadataBase: new URL('https://youtil.kr'),
  title: {
    default: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    template: '%s | Youtil',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Youtil',
  // iOS '홈 화면에 추가' 시: 아이콘 아래 이름을 'Youtil'로, 웹앱(전체화면)으로 실행
  appleWebApp: {
    capable: true,
    title: 'Youtil',
    statusBarStyle: 'default',
  },
  // 운영자 공시(app/about·contact: 필명 '리만', 1인 운영)와 일치 — 푸터 운영자 줄·Organization.founder와 같은 값
  authors: [{ name: '리만', url: 'https://youtil.kr/about' }],
  creator: '리만',
  publisher: 'Youtil',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: 'Youtil',
    title: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    description: SHARE_DESCRIPTION,
    // images는 app/opengraph-image.png 파일 컨벤션이 루트에 자동 적용. og:url은 페이지별(buildMetadata)로만 설정
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youtil | 자주 쓰는 계산기와 무료 온라인 도구 모음',
    description: SHARE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '-iy41VlIHWNyy-1njszGVK2UM6dq-0vAkhaEbSvOTlI',
    other: {
      'naver-site-verification': '77892a28985ac64263859f613be41f7fda5c19d5',
    },
  },
}

// 폰트 CSS URL — Pretendard Variable dynamic-subset (스펙 §6.2).
// preload·삽입 스크립트·noscript 3곳이 동일 URL을 참조해야 캐시가 한 번만 쓰임.
// 92개 unicode-range 조각 중 페이지에 쓰인 글자만 받는다(굵기 45~920 한 파일, font-display: swap).
// 경로는 npm 패키지 pretendard@1.3.9 에 실재하는 파일(dist/web/variable/pretendardvariable-dynamic-subset.css)을 확인해 고정.
// (.min.css 는 패키지에 없고 jsDelivr 자동 축소에 의존하므로 쓰지 않는다 — gzip 13KB 차이 미미)
// JetBrains Mono는 개발자 도구(app/tools/dev)에서만 따로 로드한다.
const FONT_CSS_URL =
  'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // data-scroll-behavior: globals의 html { scroll-behavior: smooth } 를 라우트 전환 순간에만 끄도록 Next에 알림
    // (없으면 페이지 이동 시 맨 위로 '스르륵' 스크롤 애니메이션 — Next 16 동작)
    // withTabBar(html): ≤640에서 --bottom-nav-h(탭바 높이+safe-area) 변수 · body 하단 패딩 · scroll-padding-bottom.
    // html(스크롤 컨테이너)에 달아야 scroll-padding-bottom 이 변수를 읽는다 — 포커스·앵커 대상이 탭바에 가리지 않게(WCAG 2.4.11).
    // 고정 UI(토스트·스티키 결과 바)는 bottom: calc(var(--bottom-nav-h, 0px) + Npx) 로 탭바를 피한다.
    <html lang="ko" data-scroll-behavior="smooth" className={bottomNavStyles.withTabBar}>
      <head>
        {/* Google AdSense — 사이트 소유권 확인 (전 페이지) */}
        <meta name="google-adsense-account" content="ca-pub-9104888603507576" />

        {/* 폰트 CDN preconnect 2개 — 연결 풀이 자격 증명 모드별로 나뉜다:
            폰트 CSS(<link rel=stylesheet>, no-cors·자격 증명 포함)는 crossOrigin 없는 연결, woff2(CORS 익명)는 crossOrigin 연결 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* 폰트 CSS 비차단 로드 — 파서 삽입 stylesheet는 렌더를 차단(모바일 LCP 주범)하므로
            preload로 조기 fetch만 걸고, 스크립트 삽입 stylesheet(스펙상 비차단)로 적용.
            font-display: swap과 결합해 첫 페인트는 시스템 폰트로 즉시 → 로드 후 스왑.
            next/font 전환 금지(인라인 fontFamily 실명 참조 파일 다수) 제약 하의 최적안. */}
        <link rel="preload" as="style" href={FONT_CSS_URL} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${FONT_CSS_URL}';document.head.appendChild(l);})();`,
          }}
        />
        <noscript>
          <link rel="stylesheet" href={FONT_CSS_URL} />
        </noscript>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1J054JW010"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1J054JW010');
          `}
        </Script>
      </head>
      <body>
        <AutoAds />
        <SiteJsonLd />
        <Nav />
        {/* 데스크톱(≥1024) 11분야 섹션 바 — sticky 아님. 링크는 모든 폭에서 SSR HTML에 포함 */}
        <SectionBar />
        <main>{children}</main>
        <Footer />
        {/* 모바일 하단 탭바 — 전제: AdSense 앵커 광고 콘솔 OFF (BottomNav.tsx 주석 참조) */}
        <BottomNav />
      </body>
    </html>
  )
}
