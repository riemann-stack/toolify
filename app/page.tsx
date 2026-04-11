'use client'

import { useState } from 'react'
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

const allTools = [
  { icon: '💴', name: '연봉 실수령액 계산기', desc: '세전 연봉 → 세후 월 실수령액', href: '/tools/finance/salary', badge: 'hot' },
  { icon: '💳', name: '대출이자 계산기',      desc: '원리금균등/원금균등 상환 비교', href: '/tools/finance/loan',   badge: null },
  { icon: '📈', name: '복리 계산기',          desc: '거치식·적립식 복리 수익 계산', href: '/tools/finance/compound', badge: null },
  { icon: '📉', name: '주식 물타기 계산기',       desc: '추가 매수 후 새 평단가 계산', href: '/tools/finance/stock',    badge: null },
  { icon: '🧾', name: '부가세 계산기',    desc: '공급가액·부가세 역산 계산',    href: '/tools/finance/vat',      badge: 'new' },
  { icon: '⚖️', name: 'BMI 계산기',           desc: '키와 체중으로 체질량지수 계산', href: '/tools/health/bmi',    badge: null },
  { icon: '🔥', name: '기초대사량 계산기',    desc: '하루 권장 칼로리 계산',         href: '/tools/health/bmr',    badge: null },
  { icon: '🏃', name: '러닝 페이스 계산기',  desc: '목표 기록으로 km당 페이스',     href: '/tools/health/pace',   badge: null },
  { icon: '🎯', name: '목표 체중 감량 기간 계산기', desc: '칼로리 적자로 목표 달성일',   href: '/tools/health/weightloss', badge: 'new' },
  { icon: '🤰', name: '임신 주수 계산기', desc: '출산 예정일·산전 검사 일정',    href: '/tools/health/pregnancy',  badge: 'new' },
  { icon: '🎰', name: '로또 번호 생성기',    desc: '이번 주 행운의 번호를 자동 추첨', href: '/tools/life/lotto',   badge: 'hot' },
  { icon: '🎲', name: '랜덤 추첨기',         desc: '숫자 또는 항목을 무작위로 추첨', href: '/tools/life/random',  badge: null },
  { icon: '🪜', name: '사다리타기',          desc: '공정한 무작위 사다리 게임',      href: '/tools/life/ladder',  badge: null },
  { icon: '🍻', name: '더치페이(N빵) 계산기',      desc: '술값 따로, 단위 올림 옵션',   href: '/tools/life/dutch',        badge: null },
  { icon: '🎂', name: '만 나이 계산기',      desc: '법 개정 기준 만 나이 즉시 계산', href: '/tools/date/age',     badge: 'new' },
  { icon: '📅', name: 'D-day 계산기',        desc: '날짜까지 남은 일수 카운트다운',  href: '/tools/date/dday',    badge: null },
  { icon: '📆', name: '날짜 차이 계산기',    desc: '두 날짜 사이의 기간 계산',       href: '/tools/date/diff',    badge: null },
  { icon: '🎖️', name: '군 전역일·복무율 계산기',  desc: '전역일·복무율 계산',          href: '/tools/date/military',     badge: 'new' },
  { icon: '🏠', name: '평수 ↔ ㎡ 변환기',   desc: '평수와 제곱미터 간단 변환',      href: '/tools/unit/area',    badge: null },
  { icon: '📏', name: '길이 변환기',         desc: 'cm·m·inch·ft·mile 변환',        href: '/tools/unit/length',  badge: null },
  { icon: '⚖️', name: '무게 변환기',         desc: 'kg·g·lb·oz·근·돈 변환',         href: '/tools/unit/weight',  badge: null },
  { icon: '🛍️', name: '해외 직구 사이즈 변환기',  desc: 'US·EU → 한국 사이즈',        href: '/tools/unit/size',         badge: null },
  { icon: '🌡️', name: '온도 변환기',      desc: '섭씨·화씨·켈빈 즉시 변환',     href: '/tools/unit/temperature',  badge: 'new' },
  { icon: '🔡', name: '글자수 세기',         desc: '공백 포함/제외 글자수 실시간',   href: '/tools/dev/charcount', badge: null },
  { icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 즉시 변환',    href: '/tools/dev/base64',   badge: null },
  { icon: '📋', name: 'JSON 포맷터',         desc: 'JSON 정렬·압축·유효성 검사',    href: '/tools/dev/json',     badge: null },
  { icon: '📝', name: '더미 텍스트 생성기',        desc: 'Lorem Ipsum·한글 더미 생성', href: '/tools/dev/lorem',         badge: null }, 
]

const popularTools = allTools.filter(t => t.badge === 'hot' || t.badge === 'new').concat(
  allTools.filter(t => !t.badge).slice(0, 6)
).slice(0, 9)

export default function HomePage() {
  const [query, setQuery] = useState('')

  const searchResults = query.trim()
    ? allTools.filter(t =>
        t.name.includes(query) ||
        t.desc.includes(query)
      )
    : []

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

          {/* 검색창 */}
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="도구 검색... (예: 연봉 계산기, BMI)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            <svg className={styles.searchIcon} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>

            {/* 검색 결과 드롭다운 */}
            {query.trim() && (
              <div className={styles.searchDropdown}>
                {searchResults.length > 0 ? (
                  searchResults.map(tool => (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className={styles.searchItem}
                      onClick={() => setQuery('')}
                    >
                      <span className={styles.searchItemIcon}>{tool.icon}</span>
                      <div>
                        <div className={styles.searchItemName}>{tool.name}</div>
                        <div className={styles.searchItemDesc}>{tool.desc}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.searchEmpty}>검색 결과가 없습니다</div>
                )}
              </div>
            )}
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