import type { Metadata } from 'next'
import Link from 'next/link'
import HistoryEraClient from './HistoryEraClient'

export const metadata: Metadata = {
  title: '역사 연호·연대 변환기 — 단기·조선왕·간지 ↔ 서기 변환 | Youtil',
  description: '단기·불기·황기, 조선 27대 왕 연호, 일본·중국 연호를 서기로 즉시 변환합니다. 60갑자 간지 변환기, 한국사 연표 내장.',
  keywords: ['역사연호변환기','단기변환','조선왕연호','간지변환기','60갑자','불기변환','연호계산기','한국사연표','임진왜란연도','훈민정음연도'],
}

const JOSEON_TABLE = [
  {num:1, name:'태조',   s:1392, e:1398, event:'조선 건국'},
  {num:2, name:'정종',   s:1399, e:1400, event:''},
  {num:3, name:'태종',   s:1401, e:1418, event:'한양 재천도'},
  {num:4, name:'세종',   s:1419, e:1450, event:'훈민정음 반포 (1446)'},
  {num:5, name:'문종',   s:1451, e:1452, event:''},
  {num:6, name:'단종',   s:1453, e:1455, event:'계유정난'},
  {num:7, name:'세조',   s:1455, e:1468, event:'경국대전 편찬 착수'},
  {num:8, name:'예종',   s:1469, e:1469, event:''},
  {num:9, name:'성종',   s:1469, e:1494, event:'경국대전 완성 (1485)'},
  {num:10,name:'연산군', s:1494, e:1506, event:'갑자사화 (1504)'},
  {num:11,name:'중종',   s:1506, e:1544, event:'조광조 개혁'},
  {num:12,name:'인종',   s:1544, e:1545, event:''},
  {num:13,name:'명종',   s:1545, e:1567, event:'을사사화 (1545)'},
  {num:14,name:'선조',   s:1567, e:1608, event:'임진왜란 (1592)'},
  {num:15,name:'광해군', s:1608, e:1623, event:'중립 외교 정책'},
  {num:16,name:'인조',   s:1623, e:1649, event:'병자호란 (1636)'},
  {num:17,name:'효종',   s:1649, e:1659, event:'북벌 운동'},
  {num:18,name:'현종',   s:1659, e:1674, event:'예송논쟁'},
  {num:19,name:'숙종',   s:1674, e:1720, event:'대동법 확대'},
  {num:20,name:'경종',   s:1720, e:1724, event:''},
  {num:21,name:'영조',   s:1724, e:1776, event:'탕평책·균역법 (1750)'},
  {num:22,name:'정조',   s:1776, e:1800, event:'규장각 설립·수원 화성'},
  {num:23,name:'순조',   s:1800, e:1834, event:'세도정치 시작'},
  {num:24,name:'헌종',   s:1834, e:1849, event:''},
  {num:25,name:'철종',   s:1849, e:1863, event:''},
  {num:26,name:'고종',   s:1863, e:1907, event:'대한제국 선포 (1897)'},
  {num:27,name:'순종',   s:1907, e:1910, event:'경술국치 (1910)'},
]

export default function HistoryEraPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📜 역사 연호·연대 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        단기·불기·조선 왕 연호·일본·중국 연호를 서기로, 서기를 각 연호로 즉시 변환합니다. 60갑자 간지 조회와 한국사 연표도 제공합니다.
      </p>

      <HistoryEraClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 연호 계산 방법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>연호 ↔ 서기 변환 원리</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            모든 연호·기년법은 <strong style={{ color: 'var(--text)' }}>기준 연도(원년) + 재위년 - 1</strong> 공식으로 서기로 변환됩니다.
            아래 기준 연도를 알면 암산으로도 쉽게 계산할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연호','한자','원년 (서기)','공식','비고'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['단기',    '檀紀', '기원전 2333', '서기 = 단기 − 2333', '고조선 건국 기준'],
                  ['불기',    '佛紀', '기원전 544',  '서기 = 불기 − 544',  '부처 열반 기준'],
                  ['황기',    '皇紀', '기원전 660',  '서기 = 황기 − 660',  '일본 초대 천황'],
                  ['메이지',  '明治', '1868',        '서기 = 메이지 + 1867','1868~1912'],
                  ['다이쇼',  '大正', '1912',        '서기 = 다이쇼 + 1911','1912~1926'],
                  ['쇼와',    '昭和', '1926',        '서기 = 쇼와 + 1925', '1926~1989'],
                  ['헤이세이','平成', '1989',        '서기 = 헤이세이 + 1988','1989~2019'],
                  ['레이와',  '令和', '2019',        '서기 = 레이와 + 2018','2019~현재'],
                  ['민국',    '民國', '1912',        '서기 = 민국 + 1911', '중화민국'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 600, color: 'var(--text)' }}>{row[0]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontFamily: 'serif' }}>{row[1]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FF3E8C' }}>{row[2]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--text)', fontSize: '12px' }}>{row[3]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 조선 27대 왕 연호표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>조선 27대 왕 재위 기간표</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            조선 왕 연호는 즉위년을 1년으로 계산합니다. 예: 세종 28년 = 서기 1419 + 28 − 1 = <strong style={{ color: 'var(--text)' }}>1446년</strong> (훈민정음 반포).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대수','왕명','재위 (서기)','재위 년수','주요 사건'].map((h, i) => (
                    <th key={i} style={{ padding: '8px 10px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JOSEON_TABLE.map((k, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '7px 10px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif', whiteSpace: 'nowrap' }}>{k.num}대</td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{k.name}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', color: 'var(--text)', whiteSpace: 'nowrap' }}>{k.s}~{k.e}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#FF3E8C' }}>{k.e - k.s + 1}년</td>
                    <td style={{ padding: '7px 10px', color: 'var(--muted)' }}>{k.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 60갑자 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>60갑자(六十甲子)란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            10개의 천간(甲~癸)과 12개의 지지(子~亥)를 순서대로 짝지어 만드는 60개의 간지 조합입니다.
            최소공배수 LCM(10, 12) = 60이기 때문에 60년마다 같은 간지가 반복됩니다.
            천간이 양(갑·병·무·경·임)이면 지지도 양(자·인·진·오·신·술), 음이면 음이어야 하므로 유효 조합은 60개입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
            {[
              { stem:'갑(甲)', branch:'자(子)', year:2024, animal:'용 → 쥐 → ... 쥐' },
              { stem:'을(乙)', branch:'사(巳)', year:2025, animal:'뱀의 해' },
              { stem:'병(丙)', branch:'오(午)', year:2026, animal:'말의 해' },
              { stem:'정(丁)', branch:'미(未)', year:2027, animal:'양의 해' },
              { stem:'무(戊)', branch:'신(申)', year:2028, animal:'원숭이 해' },
              { stem:'기(己)', branch:'유(酉)', year:2029, animal:'닭의 해' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#FF3E8C', marginBottom: '4px' }}>{item.year}</p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{item.stem}{item.branch}년</p>
                <p style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.animal}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(255,62,140,0.2)', borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '12px', color: '#FF3E8C', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>간지 공식</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.7 }}>
              천간 = ((서기년 − 4) mod 10 + 10) mod 10<br />
              지지 = ((서기년 − 4) mod 12 + 12) mod 12
            </p>
          </div>
        </div>

        {/* ── 4. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '단기 4356년은 서기 몇 년인가요?',
                a: '단기에서 2333을 빼면 서기가 됩니다. 4356 − 2333 = 서기 2023년입니다. 반대로 서기 2026년은 단기 2026 + 2333 = 4359년입니다.',
              },
              {
                q: '조선 세종 28년은 서기 몇 년인가요?',
                a: '세종은 서기 1419년에 즉위했으므로, 세종 N년 = 서기 (1419 + N − 1)년입니다. 세종 28년 = 1419 + 28 − 1 = 서기 1446년으로, 훈민정음이 반포된 해입니다.',
              },
              {
                q: '일본 쇼와 64년은 서기 몇 년인가요?',
                a: '쇼와의 서기 기준 연도는 1925년이므로, 쇼와 64년 = 1925 + 64 = 서기 1989년입니다. 쇼와 64년은 1989년 1월 7일 히로히토 천황이 붕어한 날까지만으로, 바로 다음날 헤이세이가 시작됩니다.',
              },
              {
                q: '60갑자에서 유효하지 않은 조합이 있나요?',
                a: '있습니다. 천간이 양(갑·병·무·경·임)이면 지지도 반드시 양(자·인·진·오·신·술)이어야 하고, 천간이 음이면 지지도 음이어야 합니다. 예를 들어 갑축(甲丑)이나 을자(乙子)는 실존하지 않는 간지입니다.',
              },
              {
                q: '불기 2568년은 서기 몇 년인가요?',
                a: '불기에서 544를 빼면 서기가 됩니다. 불기 2568 − 544 = 서기 2024년입니다. 한국 불교에서는 석가모니 열반을 기원전 544년으로 계산합니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/age',    icon: '🎂', name: '만 나이 계산기',     desc: '2023 만 나이 통일법 기준' },
              { href: '/tools/date/dday',   icon: '📅', name: 'D-day 계산기',       desc: '목표일까지 남은 일수' },
              { href: '/tools/date/diff',   icon: '📆', name: '날짜 차이 계산기',   desc: '두 날짜 사이 기간 계산' },
              { href: '/tools/date/military',icon:'🎖️', name: '군 전역일 계산기',   desc: '전역일·복무율 계산' },
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
