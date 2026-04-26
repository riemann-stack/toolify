import Link from 'next/link'
import DrakeEquationClient from './DrakeEquationClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/life/drake',
  title: '드레이크 방정식 계산기 — 우주 지적 생명체 수 추정 시뮬레이터',
  description: '드레이크 방정식으로 우주에 교신 가능한 지적 문명의 수를 계산합니다. 7가지 변수를 직접 조정해보는 인터랙티브 시뮬레이터. 칼 세이건·페르미 역설 관점 비교.',
  keywords: ['드레이크방정식계산기', '외계인존재확률', '드레이크방정식', '우주문명계산기', '외계생명체확률', '페르미역설', '지적생명체계산기'],
})

function parseNumParam(v: string | undefined, min: number, max: number): number | undefined {
  if (!v) return undefined
  const n = parseFloat(v)
  if (!isFinite(n) || n < min || n > max) return undefined
  return n
}

export default async function DrakePage({
  searchParams,
}: {
  searchParams?: Promise<{ r?: string; fp?: string; ne?: string; fl?: string; fi?: string; fc?: string; l?: string }>
}) {
  const sp = (await searchParams) ?? {}
  const initial: {
    rStar?: number; fp?: number; ne?: number; fl?: number; fi?: number; fc?: number; L?: number
  } = {}
  const rStar = parseNumParam(sp.r, 0.1, 100);      if (rStar !== undefined) initial.rStar = rStar
  const fp    = parseNumParam(sp.fp, 0.001, 1);     if (fp    !== undefined) initial.fp    = fp
  const ne    = parseNumParam(sp.ne, 0.01, 20);     if (ne    !== undefined) initial.ne    = ne
  const fl    = parseNumParam(sp.fl, 1e-6, 1);      if (fl    !== undefined) initial.fl    = fl
  const fi    = parseNumParam(sp.fi, 1e-6, 1);      if (fi    !== undefined) initial.fi    = fi
  const fc    = parseNumParam(sp.fc, 1e-6, 1);      if (fc    !== undefined) initial.fc    = fc
  const L     = parseNumParam(sp.l,  1, 1e12);      if (L     !== undefined) initial.L     = L

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        👽 드레이크 방정식 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        7가지 변수를 직접 조정하며 우리 은하에 존재할 수 있는 교신 가능 문명의 수를 추정해보세요.
      </p>

      <DrakeEquationClient initial={initial} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            드레이크 방정식 공식
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '14px', padding: '24px 22px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', margin: 0 }}>
              <span style={{ color: 'var(--accent)' }}>N</span> = R<sub>*</sub> × f<sub>p</sub> × n<sub>e</sub> × f<sub>l</sub> × f<sub>i</sub> × f<sub>c</sub> × L
            </p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '10px 0 0', letterSpacing: '0.04em' }}>
              7개 변수의 곱으로 은하 내 교신 가능 문명 수(N)를 추정
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기호', '의미', '단위', '현재 추정 범위'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { sym: 'N',   mean: '교신 가능한 문명 수',  unit: '개',    range: '계산 결과' },
                  { sym: 'R*',  mean: '별 생성률',            unit: '개/년',  range: '1 ~ 3' },
                  { sym: 'fp',  mean: '행성 보유 별 비율',     unit: '-',      range: '0.5 ~ 1.0' },
                  { sym: 'ne',  mean: '거주 가능 행성 수',     unit: '개',    range: '0.1 ~ 2' },
                  { sym: 'fl',  mean: '생명 발생 확률',        unit: '-',      range: '0.001 ~ 1.0' },
                  { sym: 'fi',  mean: '지적 생명체 확률',      unit: '-',      range: '0.01 ~ 1.0' },
                  { sym: 'fc',  mean: '교신 기술 개발 확률',   unit: '-',      range: '0.01 ~ 0.5' },
                  { sym: 'L',   mean: '문명 존속 기간',        unit: '년',     range: '100 ~ 10억' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row.sym}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{row.mean}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{row.unit}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{row.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 역사 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            드레이크 방정식의 역사
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            드레이크 방정식은 1961년 미국 천문학자 <strong style={{ color: 'var(--text)' }}>프랭크 드레이크(Frank Drake)</strong>가
            웨스트버지니아 그린뱅크 천문대에서 열린 외계지적생명체 탐사(SETI) 관련 회의를 위해 만들었습니다.
            특정 답을 얻기 위한 계산식이 아니라, <strong style={{ color: 'var(--text)' }}>"외계 문명을 만나려면 어떤 것들을 알아야 하는가"</strong>를
            구조화한 프레임워크로 제안된 것입니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            이후 천문학자이자 작가인 <strong style={{ color: 'var(--text)' }}>칼 세이건(Carl Sagan)</strong>이 저서와 TV 시리즈 &ldquo;코스모스&rdquo;를 통해 대중화했고,
            현재도 천문학·우주생물학의 핵심 사고 도구로 쓰이며 SETI 프로그램의 이론적 기반을 이루고 있습니다.
          </p>
        </div>

        {/* ── 3. 대표 추정 결과 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            대표적 추정 결과 비교
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['추정자 / 관점', 'N 값', '주요 가정'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { who: '칼 세이건 (낙관)',       n: '~100만 개',     color: '#3EFF9B', note: '생명 발생·진화 확률 높음' },
                  { who: '드레이크 본인',          n: '~10,000 개',    color: 'var(--accent)', note: '중간 추정값' },
                  { who: '현재 과학계 중앙값',     n: '수십~수백 개',   color: 'var(--accent)', note: '거주 가능 행성 발견 기반' },
                  { who: '비관론 (레어 어스)',     n: '< 1 개',        color: '#FF8C3E', note: '지구 조건이 매우 특별함' },
                  { who: '페르미 역설 관점',       n: '수백만~수억',   color: '#3EC8FF', note: '계산상 많지만 신호 없음' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row.who}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: row.color, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{row.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 페르미 역설 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            페르미 역설 — 그들은 어디에 있는가?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            드레이크 방정식이 많은 문명을 예측한다면, 왜 우리는 아직 단 하나의 외계 신호도 받지 못했을까요?
            이탈리아 물리학자 <strong style={{ color: 'var(--text)' }}>엔리코 페르미</strong>가 1950년 점심 식사 중 던진 이 질문이 &ldquo;페르미 역설&rdquo;이 되었고,
            이를 해명하기 위한 수많은 가설이 제시됐습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '대필터 가설',         desc: '문명이 특정 단계(지능 출현, 행성 이탈, 초장기 존속 등)에서 거의 모두 멸종한다는 가설. 우리 앞에 필터가 있다면 인류 미래는 어둡다.', color: '#FF8C3E' },
              { n: '②', title: '동물원 가설',         desc: '외계 문명이 우리를 일부러 관찰만 하고 접촉하지 않는다는 가설. 성숙한 문명 전에는 간섭하지 않기로 합의했을 수 있음.',            color: '#3EC8FF' },
              { n: '③', title: '우리가 너무 시끄러움', desc: '인류의 전파는 100년에 불과해 수천~수만 광년 거리의 문명에 아직 도달하지 못함. 반대로 그들 신호도 아직 도착 안 함.',         color: 'var(--accent)' },
              { n: '④', title: '이미 지나쳐 감',      desc: '초문명은 생물학적 형태를 벗어난 디지털·기계 존재로, 이미 전파 통신을 벗어나 우리가 알아채지 못함.',                      color: '#B03EFF' },
              { n: '⑤', title: '우리가 유일함',       desc: '레어 어스 가설 — 지구와 같은 안정된 항성, 거대 위성(달), 자기장, 판 구조 등의 조합은 극도로 드물다.',                  color: '#FF3E8C' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${item.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: item.color, fontWeight: 700, marginBottom: '6px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 현재 탐사 현황 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            현재 외계 생명체 탐사 현황
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '케플러 · TESS 망원경', desc: '외계행성 5,000개 이상 발견. 거주 가능 구역(골디락스 존) 후보 행성 수십 개 확인. fp 추정값을 크게 끌어올림.' },
              { title: 'Breakthrough Listen',  desc: '2016년 시작된 10년·1억 달러 규모의 SETI 프로젝트. 가까운 별 100만 개와 100개 은하의 전파·광학 신호를 스캔 중.' },
              { title: '제임스 웹 우주망원경(JWST)', desc: '외계행성 대기 성분 분석 가능. 산소·메탄 등 생명 활동 지표(바이오시그니처)를 찾는 중.' },
              { title: '엔셀라두스 · 유로파',   desc: '태양계 내 얼음 밑 바다를 가진 위성들. NASA Europa Clipper(2024~)가 유로파의 생명 가능성을 탐사 중.' },
              { title: '중국 톈옌(FAST) 전파망원경', desc: '세계 최대 단일 전파망원경. 2022년 후보 신호 포착 후 정밀 분석 중.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>🔭 {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '드레이크 방정식은 얼마나 신뢰할 수 있나요?',
                a: '드레이크 방정식은 정확한 예측 도구라기보다 우리가 무엇을 모르는지를 구조화하는 프레임워크입니다. 특히 fl(생명 발생 확률)과 L(문명 존속 기간)은 현재 과학으로 추정하기 거의 불가능한 변수입니다. 결과값은 수십 자릿수까지 달라질 수 있습니다.' },
              { q: '케플러 망원경이 드레이크 방정식에 어떤 영향을 미쳤나요?',
                a: '케플러 망원경(2009~2018)은 fp(행성 보유 비율)를 크게 높였습니다. 관측 결과 대부분의 별이 행성을 가지고 있음이 확인되어 fp는 0.5 이상으로 상향됐습니다. 거주 가능 구역 행성도 수십~수백억 개로 추정됩니다.' },
              { q: '페르미 역설이란 무엇인가요?',
                a: '엔리코 페르미가 1950년 제기한 역설로, "우주가 이렇게 넓고 오래됐다면 외계 문명이 있을 텐데, 왜 아무런 증거가 없는가?"라는 질문입니다. 드레이크 방정식이 많은 문명을 예측할수록 이 역설은 더 강해집니다.' },
              { q: '대필터(Great Filter)란 무엇인가요?',
                a: '로빈 핸슨이 1998년 제안한 개념으로, 생명체가 우주를 정복할 수준으로 발전하는 경로에 거의 모든 문명을 멸종시키는 단계가 있다는 가설입니다. 대필터가 인류 앞에 있다면(핵전쟁, 기후변화, AI 위험 등) 인류 문명의 미래가 어둡다는 의미가 됩니다.' },
              { q: '실제로 외계 신호를 받은 적 있나요?',
                a: '1977년 "와우! 신호(Wow! Signal)"가 가장 유명한 사례입니다. 72초간 강력한 협대역 전파 신호가 감지됐지만 이후 재현되지 않았습니다. 2015년 HD 164922 항성계의 반복 신호도 주목받았으나, 현재까지 외계 기원으로 공식 확인된 신호는 없습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/lotto',        icon: '🎰', name: '로또 번호 생성기',   desc: '확률의 재미 · 당첨 확률 1/814만' },
              { href: '/tools/life/golden-ratio', icon: '🌀', name: '황금 비율 계산기',   desc: '우주와 자연을 관통하는 수학' },
              { href: '/tools/music/frequency',   icon: '🎵', name: '주파수 음정 변환기', desc: '우주 전파·SETI 주파수 대역 이해' },
              { href: '/tools/date/dday',         icon: '📅', name: 'D-day 계산기',      desc: '제1회 외계인 접촉까지 D-day?' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
