'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import styles from './zodiac.module.css'

// ── Chinese zodiac (띠) ──────────────────────────────────────
const CHINESE_ZODIAC = [
  { name: '쥐',    emoji: '🐭', years: [1924,1936,1948,1960,1972,1984,1996,2008,2020], traits: ['영리함', '적응력', '기민함'], personality: '쥐띠는 영리하고 재치 있으며 적응력이 뛰어납니다. 사교적이고 관찰력이 좋아 주변 상황을 빠르게 파악합니다. 절약 정신이 강하고 계획성이 있습니다.' },
  { name: '소',    emoji: '🐮', years: [1925,1937,1949,1961,1973,1985,1997,2009,2021], traits: ['성실함', '인내심', '신뢰감'], personality: '소띠는 성실하고 참을성이 강합니다. 한 번 마음먹은 일은 끝까지 해내는 추진력이 있으며, 주변 사람들에게 신뢰를 줍니다. 말보다 행동으로 보여주는 타입입니다.' },
  { name: '호랑이', emoji: '🐯', years: [1926,1938,1950,1962,1974,1986,1998,2010,2022], traits: ['용감함', '리더십', '열정'], personality: '호랑이띠는 용감하고 열정적입니다. 타고난 리더십으로 주목을 받으며, 모험심이 강하고 도전을 즐깁니다. 때로는 충동적이지만 그만큼 강한 추진력을 발휘합니다.' },
  { name: '토끼',  emoji: '🐰', years: [1927,1939,1951,1963,1975,1987,1999,2011,2023], traits: ['온순함', '섬세함', '행운'], personality: '토끼띠는 온순하고 섬세합니다. 예술적 감각이 뛰어나고 주변 사람들과 조화를 이루는 것을 좋아합니다. 행운이 따르는 편이며 우아함과 품위를 중시합니다.' },
  { name: '용',    emoji: '🐲', years: [1928,1940,1952,1964,1976,1988,2000,2012,2024], traits: ['카리스마', '야망', '자신감'], personality: '용띠는 12간지 중 가장 강한 카리스마를 가집니다. 야망이 크고 자신감이 넘치며, 주변 사람들을 이끄는 매력이 있습니다. 완벽주의적 성향이 강합니다.' },
  { name: '뱀',    emoji: '🐍', years: [1929,1941,1953,1965,1977,1989,2001,2013,2025], traits: ['지혜로움', '직관력', '신중함'], personality: '뱀띠는 지혜롭고 직관력이 뛰어납니다. 신중하게 생각하고 행동하며, 내면의 깊이가 있습니다. 철학적 사고를 즐기고 비밀스러운 매력이 있습니다.' },
  { name: '말',    emoji: '🐴', years: [1930,1942,1954,1966,1978,1990,2002,2014,2026], traits: ['자유로움', '활동성', '열정'], personality: '말띠는 자유를 사랑하고 활동적입니다. 에너지가 넘치고 여행과 모험을 즐깁니다. 사교적이고 유머 감각이 뛰어나며, 구속받는 것을 싫어합니다.' },
  { name: '양',    emoji: '🐑', years: [1931,1943,1955,1967,1979,1991,2003,2015,2027], traits: ['온화함', '창의성', '공감능력'], personality: '양띠는 온화하고 창의적입니다. 예술적 감수성이 뛰어나고 공감 능력이 높습니다. 사람들과의 관계를 소중히 여기며, 평화로운 환경을 선호합니다.' },
  { name: '원숭이', emoji: '🐵', years: [1932,1944,1956,1968,1980,1992,2004,2016,2028], traits: ['영리함', '유머', '변화'], personality: '원숭이띠는 영리하고 유머 감각이 넘칩니다. 변화를 즐기고 문제 해결 능력이 뛰어납니다. 호기심이 많고 빠른 학습 능력으로 다양한 분야에서 두각을 나타냅니다.' },
  { name: '닭',    emoji: '🐔', years: [1933,1945,1957,1969,1981,1993,2005,2017,2029], traits: ['꼼꼼함', '성실함', '솔직함'], personality: '닭띠는 꼼꼼하고 성실합니다. 관찰력이 뛰어나고 세밀한 부분까지 신경 씁니다. 직설적으로 의사를 표현하며, 맡은 일에 책임감이 강합니다.' },
  { name: '개',    emoji: '🐶', years: [1934,1946,1958,1970,1982,1994,2006,2018,2030], traits: ['충직함', '정직함', '의리'], personality: '개띠는 충직하고 의리가 있습니다. 한 번 맺은 관계를 소중히 여기고, 정직함을 중요시합니다. 타인을 위해 헌신하는 것을 주저하지 않습니다.' },
  { name: '돼지',  emoji: '🐷', years: [1935,1947,1959,1971,1983,1995,2007,2019,2031], traits: ['너그러움', '성실함', '행복'], personality: '돼지띠는 너그럽고 성실합니다. 낙천적인 성격으로 주변에 행복을 가져다줍니다. 욕심이 없고 배려심이 깊으며, 맛있는 음식과 편안한 생활을 즐깁니다.' },
]

// emoji 매핑 (compat 카드용)
const ZODIAC_EMOJI: Record<string, string> = {
  '쥐': '🐭', '소': '🐮', '호랑이': '🐯', '토끼': '🐰',
  '용': '🐲', '뱀': '🐍', '말': '🐴', '양': '🐑',
  '원숭이': '🐵', '닭': '🐔', '개': '🐶', '돼지': '🐷',
}

// ── 간지 (天干·地支) ──────────────────────────────────────
const HEAVENLY_STEMS = [
  { h: '甲', k: '갑' }, { h: '乙', k: '을' }, { h: '丙', k: '병' }, { h: '丁', k: '정' },
  { h: '戊', k: '무' }, { h: '己', k: '기' }, { h: '庚', k: '경' }, { h: '辛', k: '신' },
  { h: '壬', k: '임' }, { h: '癸', k: '계' },
]
const EARTHLY_BRANCHES = [
  { h: '子', k: '자' }, { h: '丑', k: '축' }, { h: '寅', k: '인' }, { h: '卯', k: '묘' },
  { h: '辰', k: '진' }, { h: '巳', k: '사' }, { h: '午', k: '오' }, { h: '未', k: '미' },
  { h: '申', k: '신' }, { h: '酉', k: '유' }, { h: '戌', k: '술' }, { h: '亥', k: '해' },
]

function getGanji(year: number) {
  const stemIdx = ((year - 4) % 10 + 10) % 10
  const branchIdx = ((year - 4) % 12 + 12) % 12
  const order = (((year - 4) % 60) + 60) % 60 + 1
  return {
    stem: HEAVENLY_STEMS[stemIdx],
    branch: EARTHLY_BRANCHES[branchIdx],
    order,
  }
}

// ── 별자리 ──────────────────────────────────────
const STAR_SIGNS = [
  { name: '염소자리',   emoji: '♑', sm: 12, sd: 22, em: 1,  ed: 19, element: '지',   color: '#C8FF3E', traits: ['인내', '실용성', '야망'] },
  { name: '물병자리',   emoji: '♒', sm: 1,  sd: 20, em: 2,  ed: 18, element: '공기', color: '#3EC8FF', traits: ['독창성', '인도주의', '독립'] },
  { name: '물고기자리', emoji: '♓', sm: 2,  sd: 19, em: 3,  ed: 20, element: '물',   color: '#6B8BFF', traits: ['감수성', '직관력', '공감'] },
  { name: '양자리',     emoji: '♈', sm: 3,  sd: 21, em: 4,  ed: 19, element: '불',   color: '#FF6B6B', traits: ['용기', '열정', '솔직함'] },
  { name: '황소자리',   emoji: '♉', sm: 4,  sd: 20, em: 5,  ed: 20, element: '지',   color: '#C8FF3E', traits: ['안정', '인내', '신뢰'] },
  { name: '쌍둥이자리', emoji: '♊', sm: 5,  sd: 21, em: 6,  ed: 21, element: '공기', color: '#3EC8FF', traits: ['호기심', '유연성', '소통'] },
  { name: '게자리',     emoji: '♋', sm: 6,  sd: 22, em: 7,  ed: 22, element: '물',   color: '#6B8BFF', traits: ['감성', '보호본능', '직관'] },
  { name: '사자자리',   emoji: '♌', sm: 7,  sd: 23, em: 8,  ed: 22, element: '불',   color: '#FF6B6B', traits: ['자신감', '창의성', '관대함'] },
  { name: '처녀자리',   emoji: '♍', sm: 8,  sd: 23, em: 9,  ed: 22, element: '지',   color: '#C8FF3E', traits: ['분석력', '꼼꼼함', '성실'] },
  { name: '천칭자리',   emoji: '♎', sm: 9,  sd: 23, em: 10, ed: 23, element: '공기', color: '#3EC8FF', traits: ['균형', '공정함', '우아함'] },
  { name: '전갈자리',   emoji: '♏', sm: 10, sd: 24, em: 11, ed: 22, element: '물',   color: '#6B8BFF', traits: ['집중력', '열정', '통찰'] },
  { name: '사수자리',   emoji: '♐', sm: 11, sd: 23, em: 12, ed: 21, element: '불',   color: '#FF6B6B', traits: ['낙관', '자유', '철학'] },
]

// ── 띠 궁합 ──────────────────────────────────────
const ZODIAC_COMPAT: Record<string, { best: [string, string]; avoid: string }> = {
  '쥐':    { best: ['용', '원숭이'],   avoid: '말' },
  '소':    { best: ['뱀', '닭'],       avoid: '양' },
  '호랑이': { best: ['말', '개'],       avoid: '원숭이' },
  '토끼':  { best: ['양', '돼지'],     avoid: '닭' },
  '용':    { best: ['쥐', '원숭이'],   avoid: '개' },
  '뱀':    { best: ['소', '닭'],       avoid: '돼지' },
  '말':    { best: ['호랑이', '개'],   avoid: '쥐' },
  '양':    { best: ['토끼', '돼지'],   avoid: '소' },
  '원숭이': { best: ['쥐', '용'],       avoid: '호랑이' },
  '닭':    { best: ['소', '뱀'],       avoid: '토끼' },
  '개':    { best: ['호랑이', '말'],   avoid: '용' },
  '돼지':  { best: ['토끼', '양'],     avoid: '뱀' },
}

// ── 별자리 원소 궁합 ──────────────────────────────────────
const ELEMENT_COMPAT: Record<string, { partner: string; desc: string; color: string }> = {
  '불':   { partner: '공기', color: '#FF6B6B', desc: '같은 불 자리(양·사자·사수)끼리 열정적으로 잘 통하며, 공기 자리(쌍둥이·천칭·물병)와도 서로의 에너지를 북돋아 줍니다.' },
  '지':   { partner: '물',   color: '#C8FF3E', desc: '같은 지 자리(황소·처녀·염소)끼리 안정적이며, 물 자리(게·전갈·물고기)와 만나면 감성과 현실이 균형을 이룹니다.' },
  '공기': { partner: '불',   color: '#3EC8FF', desc: '같은 공기 자리(쌍둥이·천칭·물병)끼리 지적으로 통하며, 불 자리(양·사자·사수)와 서로 영감을 주고받습니다.' },
  '물':   { partner: '지',   color: '#6B8BFF', desc: '같은 물 자리(게·전갈·물고기)끼리 깊이 공감하며, 지 자리(황소·처녀·염소)와 만나면 감정과 현실의 조화를 이룹니다.' },
}

// ── 유명인 데이터 ──────────────────────────────────────
// 대략적인 예시 데이터 — 정확성보다 흥미 유발 용도
const FAMOUS_ZODIAC: Record<string, string[]> = {
  '쥐':    ['장동건', '강다니엘', '셰익스피어'],
  '소':    ['박찬호', 'BTS 정국', '버락 오바마'],
  '호랑이': ['레오나르도 디카프리오', '송중기', '레이디 가가'],
  '토끼':  ['이승기', '리오넬 메시', '브래드 피트'],
  '용':    ['존 레논', '리한나', '김수현'],
  '뱀':    ['테일러 스위프트', '김희선', '마크 저커버그'],
  '말':    ['박명수', '김연아', '폴 매카트니'],
  '양':    ['이병헌', '빌 게이츠', '브루스 윌리스'],
  '원숭이': ['마이클 잭슨', '셀레나 고메즈', '지드래곤'],
  '닭':    ['박보검', '아이유', '비욘세'],
  '개':    ['원빈', '강호동', '마돈나'],
  '돼지':  ['힐러리 클린턴', '신동엽', '아놀드 슈워제네거'],
}

const FAMOUS_STAR: Record<string, string[]> = {
  '염소자리':   ['마틴 루터 킹', '미셸 오바마'],
  '물병자리':   ['오프라 윈프리', '샤키라'],
  '물고기자리': ['저스틴 비버', '리한나'],
  '양자리':     ['엠마 왓슨', '레이디 가가'],
  '황소자리':   ['아델', '드웨인 존슨'],
  '쌍둥이자리': ['마릴린 먼로', '칸예 웨스트'],
  '게자리':     ['일론 머스크', '아리아나 그란데'],
  '사자자리':   ['버락 오바마', '제니퍼 로페즈'],
  '처녀자리':   ['비욘세', '키아누 리브스'],
  '천칭자리':   ['김연아', '윌 스미스'],
  '전갈자리':   ['빌 게이츠', '레오나르도 디카프리오'],
  '사수자리':   ['테일러 스위프트', '브리트니 스피어스'],
}

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getChineseZodiac(year: number) {
  const idx = ((year - 1900) % 12 + 12) % 12
  return CHINESE_ZODIAC[idx]
}

function getStarSign(month: number, day: number) {
  const sign = STAR_SIGNS.find(s => {
    if (s.sm > s.em) return (month === s.sm && day >= s.sd) || (month === s.em && day <= s.ed)
    return (month === s.sm && day >= s.sd) || (month === s.em && day <= s.ed) || (month > s.sm && month < s.em)
  })
  return sign ?? STAR_SIGNS[0]
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => currentYear - i)

export default function ZodiacClient() {
  const [year,  setYear]  = useState('')
  const [month, setMonth] = useState('')
  const [day,   setDay]   = useState('')
  const [copied, setCopied] = useState(false)

  const daysInMonth = year && month ? getDaysInMonth(parseInt(year), parseInt(month)) : 31
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const result = useMemo(() => {
    const y = parseInt(year)
    const m = parseInt(month)
    const d = parseInt(day)
    if (!y || !m || !d) return null
    const chinese = getChineseZodiac(y)
    const star    = getStarSign(m, d)
    const ganji   = getGanji(y)
    const compat  = ZODIAC_COMPAT[chinese.name]
    const eCompat = ELEMENT_COMPAT[star.element]
    const famousZ = FAMOUS_ZODIAC[chinese.name] ?? []
    const famousS = FAMOUS_STAR[star.name] ?? []
    return { chinese, star, year: y, ganji, compat, eCompat, famousZ, famousS }
  }, [year, month, day])

  const handleMonthChange = (v: string) => {
    setMonth(v)
    setDay('')
  }

  const handleShare = async () => {
    if (!result) return
    const best = result.compat.best
      .map(n => `${ZODIAC_EMOJI[n]} ${n}`).join(', ')
    const text = `나는 ${result.chinese.emoji} ${result.chinese.name}띠 + ${result.star.emoji} ${result.star.name}!
간지: ${result.ganji.stem.h}${result.ganji.branch.h}(${result.ganji.stem.k}${result.ganji.branch.k})년생
나의 최고 궁합 띠: ${best}
youtil.kr/tools/life/zodiac`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className={styles.wrap}>

      {/* 드롭다운 입력 */}
      <div className={styles.card}>
        <label className={styles.cardLabel}>생년월일 선택</label>
        <div className={styles.selectRow}>
          <div className={styles.selectWrap}>
            <select className={styles.select} value={year}
              onChange={e => { setYear(e.target.value); setDay('') }}>
              <option value="">년도</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>
          <div className={styles.selectWrap}>
            <select className={styles.select} value={month}
              onChange={e => handleMonthChange(e.target.value)}>
              <option value="">월</option>
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>
          <div className={styles.selectWrap}>
            <select className={styles.select} value={day}
              onChange={e => setDay(e.target.value)}
              disabled={!month}>
              <option value="">일</option>
              {days.map(d => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
            <span className={styles.selectArrow}>▾</span>
          </div>
        </div>
      </div>

      {result ? (
        <>
          {/* ── 카드 1: 띠·별자리 ── */}
          <div className={styles.resultRow}>
            <div className={styles.resultCard}>
              <div className={styles.resultEmoji}>{result.chinese.emoji}</div>
              <div className={styles.resultType}>띠</div>
              <div className={styles.resultName}>{result.chinese.name}띠</div>
              <div className={styles.traitsRow}>
                {result.chinese.traits.map(t => (
                  <span key={t} className={styles.trait}>{t}</span>
                ))}
              </div>
            </div>
            <div className={styles.resultCard}>
              <div className={styles.resultEmoji}>{result.star.emoji}</div>
              <div className={styles.resultType}>별자리</div>
              <div className={styles.resultName}>{result.star.name}</div>
              <div className={styles.traitsRow}>
                {result.star.traits.map(t => (
                  <span key={t} className={styles.trait}>{t}</span>
                ))}
              </div>
              <div className={styles.element} style={{ color: result.star.color }}>
                {result.star.element}의 별자리
              </div>
            </div>
          </div>

          {/* 성격 설명 */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>{result.chinese.name}띠 성격</label>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, margin: 0 }}>
              {result.chinese.personality}
            </p>
          </div>

          {/* ── 카드 2: 간지 ── */}
          <div className={styles.ganjiCard}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              나의 간지 (干支)
            </div>
            <div className={styles.ganjiHanja}>
              {result.ganji.stem.h}{result.ganji.branch.h}
            </div>
            <div className={styles.ganjiHangul}>
              {result.ganji.stem.k}{result.ganji.branch.k}년생 · {result.chinese.name}띠
            </div>
            <div className={styles.ganjiSub}>
              60갑자 중 <strong>{result.ganji.order}번째</strong> 해
            </div>
          </div>

          {/* ── 카드 3: 궁합 ── */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>나의 띠·별자리 궁합</label>

            <div className={styles.compatGrid}>
              <div className={`${styles.compatBox} ${styles.compatBest}`}>
                <div className={styles.compatHead}>❤️ 최고 궁합</div>
                <div className={styles.compatList}>
                  {result.compat.best.map(n => (
                    <span key={n} className={styles.compatPill}>
                      {ZODIAC_EMOJI[n]} {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className={`${styles.compatBox} ${styles.compatAvoid}`}>
                <div className={styles.compatHead}>⚡ 주의 궁합</div>
                <div className={styles.compatList}>
                  <span className={styles.compatPill}>
                    {ZODIAC_EMOJI[result.compat.avoid]} {result.compat.avoid}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.elementCompat}>
              <span className={styles.elementTag} style={{
                background: `${result.eCompat.color}22`,
                color: result.eCompat.color,
              }}>
                {result.star.element}의 별자리
              </span>
              <strong>{result.star.name}</strong>의 별자리 원소 궁합: <br />
              {result.eCompat.desc}
            </div>
          </div>

          {/* ── 카드 4: 유명인 ── */}
          <div className={styles.card}>
            <label className={styles.cardLabel}>같은 띠·별자리 유명인</label>

            <div className={styles.famousGroup}>
              <div className={styles.famousLabel}>{result.chinese.emoji} 같은 {result.chinese.name}띠</div>
              <div className={styles.famousRow}>
                {result.famousZ.map(n => (
                  <span key={n} className={styles.famousPill}>{n}</span>
                ))}
              </div>
            </div>

            <div className={styles.famousGroup}>
              <div className={styles.famousLabel}>{result.star.emoji} 같은 {result.star.name}</div>
              <div className={styles.famousRow}>
                {result.famousS.map(n => (
                  <span key={n} className={styles.famousPill}>{n}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── 카드 5: 음력 안내 ── */}
          <div className={styles.lunarBanner}>
            <div className={styles.lunarText}>
              📅 <strong>음력 생년월일</strong>로 알고 계신가요?<br />
              설날 전후 출생자는 띠가 1년 다를 수 있습니다. 음력 → 양력 변환 후 이 계산기를 이용하세요.
            </div>
            <Link href="/tools/date/lunar" className={styles.lunarLink}>
              양음력 변환기 →
            </Link>
          </div>

          {/* ── 카드 6: 공유 ── */}
          <div className={styles.shareCard}>
            <div className={styles.shareText}>
              <strong>내 띠·별자리·간지·궁합</strong>을 친구에게 공유해보세요
            </div>
            <button type="button"
              className={`${styles.shareBtn} ${copied ? styles.copied : ''}`}
              onClick={handleShare}>
              {copied ? '✅ 복사됨' : '📋 복사하기'}
            </button>
          </div>

          {/* ── 같은 띠 해 (별도 섹션) ── */}
          <div className={styles.yearSection}>
            <div className={styles.yearHead}>같은 {result.chinese.name}띠 해 (12년 주기)</div>
            <div className={styles.yearRow}>
              {result.chinese.years.map(y => (
                <span key={y}
                  className={`${styles.yearTag} ${y === result.year ? styles.yearTagActive : ''}`}>
                  {y}년
                </span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          {year && month && !day
            ? '일(日)을 선택해주세요'
            : '생년월일을 선택하면 띠·별자리·간지·궁합이 계산됩니다'}
        </div>
      )}
    </div>
  )
}
