import Link from 'next/link'
import ConverterClient from './ConverterClient'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/unit/converter',
  title: '통합 단위 변환기 — 길이·무게·부피·온도·시간·면적 한 곳에서',
  description:
    '9개 카테고리 통합 단위 변환기. 길이·면적·무게·부피·온도·시간·속도·압력·데이터 + 한국 전통 단위(자·척·근·돈·평·홉·되) 한 번에 변환. cm·m·inch·ft·kg·lb·㎡·평·℃·℉ 모두 지원.',
  keywords: [
    '단위 변환기', '단위 변환', '길이 변환', '무게 변환', '온도 변환',
    '시간 변환', '면적 변환', 'cm to inch', 'kg to lb', '평 ㎡',
    '근 그램', '돈 그램', '자 cm', '한국 전통 단위',
    '섭씨 화씨', '갤런 리터', 'mph kmh',
  ],
})

export default function ConverterPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📐 통합 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        길이·면적·무게·부피·온도·시간·속도·압력·데이터 9개 카테고리를 한 곳에서.
        <strong style={{ color: 'var(--text)' }}> 한국 전통·생활 단위(자·척·근·돈·평·홉·되·소주잔·종이컵)</strong>까지 즉시 변환.
      </p>

      <ConverterClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 자주 쓰는 변환 표 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 쓰는 변환</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>카테고리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>입력</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#C485E0', fontWeight: 700 }}>결과</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['📏 길이', '1 마일',     '1.609 km'],
                  ['📏 길이', '1 피트',     '30.48 cm'],
                  ['📏 길이', '1 야드',     '0.914 m'],
                  ['📏 길이', '1 인치',     '2.54 cm'],
                  ['🏠 면적', '1 평',       '3.306 ㎡'],
                  ['🏠 면적', '84 ㎡',      '25.4 평'],
                  ['🏠 면적', '1 에이커',   '4,047 ㎡ (약 1,224평)'],
                  ['⚖️ 무게', '1 근 (한국)', '600 g'],
                  ['⚖️ 무게', '1 돈',       '3.75 g'],
                  ['⚖️ 무게', '1 파운드',   '453.59 g'],
                  ['⚖️ 무게', '1 온스',     '28.35 g'],
                  ['🧴 부피', '1 컵 (한국)', '200 ml'],
                  ['🧴 부피', '1 갤런 (US)', '3,785 ml'],
                  ['🧴 부피', '1 큰술',     '15 ml'],
                  ['🧴 부피', '1 되',       '1.8 L'],
                  ['🌡️ 온도', '0 ℃',       '32 ℉'],
                  ['🌡️ 온도', '100 ℃',     '212 ℉'],
                  ['🌡️ 온도', '37 ℃',      '98.6 ℉ (체온)'],
                  ['🚗 속도', '60 mph',    '96.56 km/h'],
                  ['💨 압력', '1 bar',     '14.5 psi'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#C485E0', fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 한국 전통 단위 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>한국 전통·생활 단위 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            본 도구는 한국에서 일상적으로 쓰이는 전통·생활 단위를 모두 지원합니다. 시대·지역·용도에 따라 차이가 있어 주의가 필요한 단위도 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { name: '📏 길이', items: ['치(寸) ≈ 3.03cm', '자(尺) ≈ 30.3cm', '보(步) ≈ 1.82m', '리(里) ≈ 393m (한국)'] },
              { name: '🏠 면적', items: ['평(坪) = 400/121 ㎡ ≈ 3.306㎡', '단보(段) ≈ 991㎡ (300평)', '마지기 ≈ 661㎡ (200평·지역차 큼)'] },
              { name: '⚖️ 무게', items: ['돈(錢) = 3.75g (귀금속)', '냥(兩) = 37.5g', '근(斤) = 600g (한국 시장 관행)', '관(貫) = 3.75kg'] },
              { name: '🧴 부피', items: ['홉(合) = 180ml', '되(升) = 1.8L', '말(斗) = 18L', '컵 = 200ml (한국 표준)', '소주잔 ≈ 50ml · 종이컵 ≈ 180ml'] },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid rgba(176,62,255,0.30)', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#C485E0', marginBottom: '6px' }}>{c.name}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
                  {c.items.map((it, j) => <li key={j}>· {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⓘ <strong style={{ color: 'var(--text)' }}>1근 주의</strong> — 옛날 한국 1근 = 400g, 중국 1근 = 500g, 한국 시장 관행 1근 = 600g. 정육점·과일가게에서는 보통 600g 기준이며, 옛 문헌의 1근은 400g인 경우가 많습니다.
          </p>
        </section>

        {/* 카테고리별 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>9개 카테고리 가이드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📏', name: '길이', desc: 'mm·cm·m·km / inch·ft·yard·mile / 치·자·보·간·정·리(한국)' },
              { icon: '🏠', name: '면적', desc: '㎡·a·ha·km² / ft²·yd²·acre / 평·단보·마지기(한국)' },
              { icon: '⚖️', name: '무게', desc: 'mg·g·kg·ton / oz·lb / 돈·냥·근·관(한국)' },
              { icon: '🧴', name: '부피', desc: 'ml·L / fl oz·gallon(US) / 큰술·작은술·컵 / 홉·되·말·섬(전통) / 소주잔·종이컵·밥숟가락(생활)' },
              { icon: '🌡️', name: '온도', desc: '섭씨(℃)·화씨(℉)·켈빈(K)·랭킨(°R) — 비선형 변환 별도 처리' },
              { icon: '⏱️', name: '시간', desc: 'ms·s·min·h·day·week·month·year + 근무시간(주 40h·월 209h·연 2,508h)' },
              { icon: '🚗', name: '속도', desc: 'm/s·km/h·mph·knot·ft/s' },
              { icon: '💨', name: '압력', desc: 'Pa·kPa·MPa·bar·psi·atm·mmHg — 자동차 타이어·혈압·기상에 활용' },
              { icon: '💾', name: '데이터', desc: 'bit·byte·KB·MB·GB·TB (1000) + KiB·MiB·GiB(1024)' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{c.icon} {c.name}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '1근은 정확히 몇 g인가요?',
                a: '용도·시대·지역에 따라 다릅니다. <strong>한국 시장 관행(정육점·과일가게)에서는 1근 = 600g</strong>이 표준이지만, 옛날 한국 1근은 400g이었고 중국·대만 1근은 500g입니다. 본 도구는 한국 시장 관행인 600g을 기본으로 적용하며, 옛 문헌·약재 단위로 1근을 해석할 때는 별도 확인이 필요합니다.',
              },
              {
                q: '평(坪)은 정확히 몇 제곱미터인가요?',
                a: '<strong>1평 = 400/121 ㎡ ≈ 3.305785㎡</strong>입니다 (1평 = 6자×6자 = 36 제곱자). 일반적으로 3.3㎡로 어림하지만 정확히는 3.3057㎡로 약간 큽니다. 한국 부동산에서 자주 쓰는 환산 — 84㎡ ≈ 25.4평, 59㎡ ≈ 17.85평. 더 자세한 아파트 평형 환산은 <a href="/tools/unit/area" style="color: var(--accent); text-decoration: underline">평수 ↔ ㎡ 변환기</a>를 활용하세요.',
              },
              {
                q: '한국 1리와 일본 1리가 다른가요?',
                a: '네, 매우 다릅니다. <strong>한국 1리 ≈ 393m</strong>, <strong>일본 1리 ≈ 3,927m</strong>로 약 10배 차이가 납니다. 한국·중국 1리는 동일하게 약 393m이지만 일본은 메이지 시대에 1리를 36정(약 3.9km)으로 재정의했습니다. 옛 문헌에서 거리를 해석할 때 출처(한국·중국·일본)를 확인해야 합니다.',
              },
              {
                q: 'KB와 KiB는 어떻게 다른가요?',
                a: '<strong>KB = 1,000바이트</strong> (SI 표준), <strong>KiB = 1,024바이트</strong> (이진 표준)입니다. 하드디스크·통신은 KB(1000)을 쓰고, OS(Windows·Mac)·메모리(RAM)는 KiB(1024)를 쓰는 경우가 많아 표시 차이가 발생합니다. 예: 1TB SSD를 사면 OS에서는 약 931GiB로 보입니다 (1,000⁴ ÷ 1,024⁴ ≈ 0.909).',
              },
              {
                q: '온도 변환 공식이 왜 다른 변환과 다른가요?',
                a: '온도는 <strong>비선형 변환</strong>이기 때문입니다. 길이·무게는 단순히 곱셈/나눗셈으로 변환되지만 온도는 <strong>0점이 다릅니다</strong> — 섭씨 0℃는 화씨 32℉, 켈빈 273.15K. 따라서 ℉ = ℃ × 9/5 + <strong>32</strong> 같은 덧셈 항이 필요합니다. 본 도구는 모든 온도 단위를 정확하게 처리합니다.',
              },
              {
                q: '소주잔 1잔, 종이컵 1잔은 정확히 몇 ml인가요?',
                a: '국내 표준에 가까운 어림값으로 — <strong>소주잔 ≈ 50ml</strong> (1샷, 보드카·위스키 샷잔과 동일), <strong>종이컵 ≈ 180ml</strong> (정수기·자판기 표준), <strong>한국 종이컵 큰 사이즈 ≈ 240ml</strong>(테이크아웃). 정확한 값은 제조사·용도별로 차이가 있어 본 도구의 값은 일반적인 어림값입니다.',
              },
              {
                q: 'mph와 km/h, 어느 게 더 빠르나요?',
                a: '같은 숫자라면 <strong>mph가 더 빠릅니다</strong>. 1마일 = 1.609km이므로 60mph = 96.56km/h입니다. 미국·영국은 mph, 한국·유럽·일본은 km/h를 씁니다. 자동차 속도계가 mph로 표시되어 있다면 약 1.6배 곱하면 km/h가 됩니다.',
              },
              {
                q: '근무시간 변환은 어떻게 계산되나요?',
                a: '한국 근로기준법 기준으로 <strong>주 40시간 = 월 209시간 = 연 2,508시간</strong>입니다 (주 40시간 + 주휴 8시간 = 주 48시간 × 4.345주 ≈ 209시간/월). 시급·연봉 환산은 <a href="/tools/finance/salary" style="color: var(--accent); text-decoration: underline">연봉 실수령액 계산기</a>의 [시급] 탭에서 야근·출퇴근 포함 체감 시급까지 계산할 수 있습니다.',
              },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 ↔ ㎡ 변환기',     desc: '아파트 평형·전용·공급면적' },
              { href: '/tools/unit/size',          icon: '🛍️', name: '해외 직구 사이즈 변환기', desc: '의류·신발 US·EU → 한국' },
              { href: '/tools/unit/battery',       icon: '🔋', name: '배터리 용량 변환기',     desc: 'mAh·Wh + 비행기 반입' },
              { href: '/tools/unit/fuel-economy',  icon: '⛽', name: '연비 단위 변환기',       desc: 'km/L·L/100km·mpg' },
              { href: '/tools/unit/tire-pressure', icon: '🛞', name: '타이어 공기압 변환기',   desc: 'psi·kPa·bar + 차량별' },
              { href: '/tools/finance/salary',     icon: '💴', name: '연봉 실수령액 계산기',   desc: '시급·근무시간 환산' },
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
        </section>

      </div>
    </div>
  )
}
