import Link from 'next/link'
import styles from './page.module.css'

const categories = [
  { id: 'finance', icon: '💰', name: '금융·재테크', count: 3, color: 'finance' },
  { id: 'health',  icon: '🏃', name: '건강·피트니스', count: 3, color: 'health'  },
  { id: 'life',    icon: '🎲', name: '생활·재미',    count: 3, color: 'life'    },
  { id: 'unit',    icon: '📐', name: '단위·변환',    count: 3, color: 'unit'    },
  { id: 'date',    icon: '📅', name: '날짜·시간',    count: 3, color: 'date'    },
  { id: 'dev',     icon: '🖥️', name: '개발자·텍스트', count: 3, color: 'dev'     },
]

const popularTools = [
  { icon: '🎰', name: '로또 번호 생성기',    desc: '이번 주 행운의 번호를 자동 추첨',         href: '/tools/life/lotto',   badge: 'hot' },
  { icon: '💴', name: '연봉 실수령액 계산기', desc: '세전 연봉 → 세후 월 실수령액',           href: '/tools/finance/salary', badge: 'hot' },
  { icon: '🎂', name: '만 나이 계산기',      desc: '법 개정 기준 만 나이 즉시 계산',         href: '/tools/date/age',     badge: 'new' },
  { icon: '⚖️', name: 'BMI 계산기',         desc: '키와 체중으로 체질량지수 계산',           href: '/tools/health/bmi',   badge: null  },
  { icon: '📅', name: 'D-day 계산기',       desc: '날짜까지 남은 일수 카운트다운',           href: '/tools/date/dday',    badge: null  },
  { icon: '🏠', name: '평수 ↔ ㎡ 변환기',   desc: '평수와 제곱미터 간단 변환',              href: '/tools/unit/area',    badge: null  },
  { icon: '💳', name: '대출이자 계산기',     desc: '원리금균등/원금균등 상환 비교',           href: '/tools/finance/loan', badge: null  },
  { icon: '🏃', name: '러닝 페이스 계산기',  desc: '목표 기록으로 킬로미터당 페이스',         href: '/tools/health/pace',  badge: 'new' },
  { icon: '🔡', name: '글자수 세기',         desc: '공백 포함/제외 글자수 실시간 카운트',     href: '/tools/dev/charcount', badge: null  },
]

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroTag}>
            <span className={styles.dot} />
            무료 · 로그인 없음 · 즉시 사용
          </div>
          <h1 className={styles.h1}>
            모든 계산,<br /><em className={styles.accent}>한 곳에서.</em>
          </h1>
          <p className={styles.heroSub}>
            연봉 계산부터 로또 번호까지 — 일상에서 자주 쓰는 도구들을<br />
            빠르고 간편하게 사용하세요.
          </p>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="도구 검색... (예: 연봉 계산기, BMI)"
              readOnly
            />
            <svg className={styles.searchIcon} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNum}>18<span className={styles.accent}>+</span></span>
              <span className={styles.statLabel}>무료 도구</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>6</span>
              <span className={styles.statLabel}>카테고리</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>0</span>
              <span className={styles.statLabel}>로그인 필요</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className={styles.content}>

        {/* CATEGORIES */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>카테고리</span>
          <Link href="/tools" className={styles.sectionLink}>전체 보기 →</Link>
        </div>
        <div className={styles.catGrid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/tools/${cat.id}`}
              className={`${styles.catCard} ${styles[`cat_${cat.color}`]}`}
            >
              <span className={styles.catIcon}>{cat.icon}</span>
              <span className={styles.catName}>{cat.name}</span>
              <span className={styles.catCount}>{cat.count}개 도구</span>
            </Link>
          ))}
        </div>

        {/* POPULAR TOOLS */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>인기 도구</span>
          <Link href="/tools" className={styles.sectionLink}>전체 보기 →</Link>
        </div>
        <div className={styles.toolsGrid}>
          {popularTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className={styles.toolCard}>
              <div className={styles.toolIconWrap}>{tool.icon}</div>
              <div className={styles.toolInfo}>
                <div className={styles.toolName}>{tool.name}</div>
                <div className={styles.toolDesc}>{tool.desc}</div>
              </div>
              {tool.badge === 'hot' && <span className={`${styles.badge} ${styles.badgeHot}`}>HOT</span>}
              {tool.badge === 'new' && <span className={`${styles.badge} ${styles.badgeNew}`}>NEW</span>}
            </Link>
          ))}
        </div>

      </div>
    </>
  )
}