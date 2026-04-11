import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './tools.module.css'

export const metadata: Metadata = {
  title: '전체 도구 목록 — 무료 계산기·유틸리티 | Youtil',
  description: '연봉 계산기, BMI, 로또 번호 생성기, 주식 물타기, 더치페이, 군 전역일 등 24가지 무료 온라인 도구를 한눈에 확인하세요.',
}

const categories = [
  {
    id: 'finance', icon: '💰', name: '금융·재테크', color: '#3EFF9B',
    tools: [
      { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '2026년 세후 월 실수령액' },
      { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '원리금균등·원금균등 비교' },
      { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '거치식·적립식 복리 수익' },
      { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '새 평단가·수익률 계산' },
      { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',    desc: '공급가액·부가세 역산 계산' },
    ],
  },
  {
    id: 'health', icon: '🏃', name: '건강·피트니스', color: '#3EC8FF',
    tools: [
      { href: '/tools/health/bmi',        icon: '⚖️', name: 'BMI 계산기',               desc: '체질량지수 비만도 확인' },
      { href: '/tools/health/bmr',        icon: '🔥', name: '기초대사량 계산기',         desc: '하루 권장 칼로리 계산' },
      { href: '/tools/health/pace',       icon: '🏃', name: '러닝 페이스 계산기',       desc: '마라톤 목표 페이스 계산' },
      { href: '/tools/health/weightloss', icon: '🎯', name: '목표 체중 감량 기간 계산기', desc: '칼로리 적자로 달성일 예측' },
      { href: '/tools/health/pregnancy', icon: '🤰', name: '임신 주수 계산기', desc: '출산 예정일·산전 검사 일정' },
    ],
  },
  {
    id: 'life', icon: '🎲', name: '생활·재미', color: '#FF8C3E',
    tools: [
      { href: '/tools/life/lotto',  icon: '🎰', name: '로또 번호 생성기',       desc: '행운의 번호 자동 추첨' },
      { href: '/tools/life/random', icon: '🎲', name: '랜덤 추첨기',            desc: '숫자·항목 무작위 뽑기' },
      { href: '/tools/life/ladder', icon: '🪜', name: '사다리타기',             desc: '공정한 무작위 사다리' },
      { href: '/tools/life/dutch',  icon: '🍻', name: '더치페이(N빵) 계산기',   desc: '술값 따로, 단위 올림 옵션' },
    ],
  },
  {
    id: 'unit', icon: '📐', name: '단위·변환', color: '#B03EFF',
    tools: [
      { href: '/tools/unit/area',   icon: '🏠', name: '평수 ↔ ㎡ 변환기',       desc: '아파트 면적 단위 변환' },
      { href: '/tools/unit/length', icon: '📏', name: '길이 변환기',             desc: 'cm·m·inch·ft·mile' },
      { href: '/tools/unit/weight', icon: '⚖️', name: '무게 변환기',             desc: 'kg·g·lb·oz·근·돈' },
      { href: '/tools/unit/size',   icon: '🛍️', name: '해외 직구 사이즈 변환기', desc: 'US·EU → 한국 사이즈' },
      { href: '/tools/unit/temperature', icon: '🌡️', name: '온도 변환기',      desc: '섭씨·화씨·켈빈 즉시 변환' },
    ],
  },
  {
    id: 'date', icon: '📅', name: '날짜·시간', color: '#FF3E8C',
    tools: [
      { href: '/tools/date/age',      icon: '🎂', name: '만 나이 계산기',          desc: '법 개정 기준 만 나이' },
      { href: '/tools/date/dday',     icon: '📅', name: 'D-day 계산기',            desc: '목표까지 남은 일수' },
      { href: '/tools/date/diff',     icon: '📆', name: '날짜 차이 계산기',        desc: '두 날짜 사이 기간 계산' },
      { href: '/tools/date/military', icon: '🎖️', name: '군 전역일·복무율 계산기', desc: '전역일·복무율 계산' },
    ],
  },
  {
    id: 'dev', icon: '🖥️', name: '개발자·텍스트', color: '#C8FF3E',
    tools: [
      { href: '/tools/dev/charcount', icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
      { href: '/tools/dev/base64',    icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 변환' },
      { href: '/tools/dev/json',      icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·유효성 검사' },
      { href: '/tools/dev/lorem',     icon: '📝', name: '더미 텍스트 생성기',   desc: 'Lorem Ipsum·한글 더미 생성' },
    ],
  },
]

export default function ToolsPage() {
  const totalTools = categories.reduce((s, c) => s + c.tools.length, 0)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        전체 도구 목록
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '48px' }}>
        총 <strong style={{ color: 'var(--accent)' }}>{totalTools}가지</strong> 무료 도구 · 로그인 없이 즉시 사용
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {categories.map(cat => (
          <div key={cat.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: cat.color }}>
                  {cat.name}
                </span>
              </div>
              <Link href={`/tools/${cat.id}`} style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none' }}>
                카테고리 보기 →
              </Link>
            </div>

            <div className={styles.toolGrid}>
              {cat.tools.map(tool => (
                <Link key={tool.href} href={tool.href} className={styles.toolCard}>
                  <span className={styles.toolIcon}>{tool.icon}</span>
                  <div className={styles.toolInfo}>
                    <div className={styles.toolName}>{tool.name}</div>
                    <div className={styles.toolDesc}>{tool.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}