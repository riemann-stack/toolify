import Link from 'next/link'
import HistoryEraClient from './HistoryEraClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'

export const metadata = buildMetadata({
  path: '/tools/date/history-era',
  title: '연호·연대 변환기 — 단기·조선왕·간지·한·중·일 동시',
  description: '단기·불기·조선왕·간지·일본·중국 연호 동시 변환 + 단군~현재 통합 연표와 한·중·일 동시 비교.',
  keywords: ['역사연호변환기','단기변환','조선왕연호','간지변환기','60갑자','불기변환','연호계산기','한국사연표','임진왜란연도','훈민정음연도','메이지 다이쇼 쇼와','한국 통합 연표','동아시아 연호','오늘 단기'],
})

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

const FAQ_LD = [
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
                a: '있습니다. 천간이 양(갑·병·무·경·임)이면 지지도 반드시 양(자·인·진·오·신·술)이어야 하고, 천간이 음이면 지지도 음이어야 합니다. 예를 들어 갑축(甲丑)이나 을자(乙子)는 실존하지 않는 간지입니다. 본 도구의 [간지 변환] 탭이 자동 검증합니다.',
              },
              {
                q: '불기 2568년은 서기 몇 년인가요?',
                a: '불기에서 544를 빼면 서기가 됩니다. 불기 2568 − 544 = 서기 2024년입니다. 한국 불교에서는 석가모니 열반을 기원전 544년으로 계산합니다.',
              },
              {
                q: '단군 시대부터 현재까지 한국사를 한눈에 볼 수 있나요?',
                a: '본 도구의 [역사 연표] 탭 활용. 70+ 사건을 시대별 필터(고대·삼국·고려·조선·근현대)로 조회 가능.<br/>• 고조선 (BC 2333~108)<br/>• 삼국시대 (BC 57~AD 668)<br/>• 통일신라·발해 (676~935)<br/>• 고려 34대 (918~1392)<br/>• 조선 27대 (1392~1897)<br/>• 대한제국 (1897~1910)<br/>• 일제강점기 (1910~1945)<br/>• 대한민국 (1948~현재)',
              },
              {
                q: '&ldquo;임진왜란&rdquo; 같은 사건명만 알고 연도를 모를 때?',
                a: '본 도구의 [역사 연표] 탭 검색창에 사건명 입력. 예: &ldquo;임진왜란&rdquo; → 1592년 / &ldquo;광복&rdquo; → 1945년 / &ldquo;훈민정음&rdquo; → 1446년 / &ldquo;3·1&rdquo; → 1919년. 70+ 한국사 사건이 매칭됩니다. 학교 과제·시험 준비에 활용.',
              },
              {
                q: '1910년 한국·중국·일본은 동시에 어떤 시대였나요?',
                a: '동아시아 격동의 시기:<br/>• 🇰🇷 <strong>한국</strong>: 조선 순종 4년, 경술국치 (8월 29일)<br/>• 🇯🇵 <strong>일본</strong>: 메이지 43년, 한국 합병 단행<br/>• 🇨🇳 <strong>중국</strong>: 청 선통 2년, 신해혁명 1년 전<br/>본 도구의 [서기→연호] 탭에 1910 입력 시 모든 매핑 한 화면 표시.',
              },
              {
                q: '60갑자가 60년마다 정말 같이 반복되나요?',
                a: '네, 정확히 60년입니다. 10천간과 12지지의 최소공배수 LCM(10, 12) = 60이기 때문입니다. 예를 들어 2026년 = 병오년(말띠)이고, 60년 뒤인 2086년에 다시 병오년이 됩니다. 환갑(60세)은 본인 출생 간지가 다시 돌아오는 해입니다. 본 도구 상단 [📅 오늘은 무슨 해?] 카드로 매년 자동 표시되며, 천간·지지 구성과 연도별 간지·띠 일람은 양력 음력 변환기(/tools/date/lunar)를 참고하세요.',
              },
              {
                q: '한국에서 어떤 기년법을 어떻게 쓰나요?',
                a: '상황별 기년법:<br/>• <strong>서기 (표준)</strong> — 학교·관공서·일반 공식 문서<br/>• <strong>불기</strong> — 사찰·법회·경전·불교 기념일<br/>• <strong>단기</strong> — 단군교·대종교·일부 보수 단체<br/>• <strong>서기 + 간지</strong> — 결혼식·택일·돌잔치·환갑·제사<br/>• <strong>띠</strong> — 돌·궁합·인연 (12지지)<br/>본 도구로 모두 즉시 양방향 변환 가능.',
              },
            ]

export default function HistoryEraPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📜 연호·연대 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        단기·불기·조선왕·간지·일본·중국 연호 동시 변환 + <strong style={{ color: 'var(--text)' }}>단군~현재 통합 연표</strong>.
      </p>

      <HistoryEraClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 연호 계산 방법 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>연호 ↔ 서기 변환 원리</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            모든 연호·기년법은 <strong style={{ color: 'var(--text)' }}>기준 연도(원년) + 재위년 - 1</strong> 공식으로 서기로 변환됩니다.
            아래 기준 연도를 알면 암산으로도 쉽게 계산할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['연호','한자','원년 (서기)','공식','비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
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
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: '#DB2777' }}>{row[2]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)', fontSize: '12px' }}>{row[3]}</td>
                    <td style={{ padding: '9px 10px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 조선 27대 왕 연호표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>조선 27대 왕 재위 기간표</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            조선 왕 연호는 즉위년을 1년으로 계산합니다. 예: 세종 28년 = 서기 1419 + 28 − 1 = <strong style={{ color: 'var(--text)' }}>1446년</strong> (훈민정음 반포).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['대수','왕명','재위 (서기)','재위 년수','주요 사건'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '8px 10px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JOSEON_TABLE.map((k, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '7px 10px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', whiteSpace: 'nowrap' }}>{k.num}대</td>
                    <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{k.name}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--text)', whiteSpace: 'nowrap' }}>{k.s}~{k.e}</td>
                    <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, color: '#DB2777' }}>{k.e - k.s + 1}년</td>
                    <td style={{ padding: '7px 10px', color: 'var(--muted)' }}>{k.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 60갑자 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>60갑자(六十甲子)란?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            10개의 천간(甲~癸)과 12개의 지지(子~亥)를 순서대로 짝지어 60년마다 반복되는 연도 표기입니다 (예: 2026년 = 병오년).
            천간이 양(갑·병·무·경·임)이면 지지도 양(자·인·진·오·신·술), 음이면 음이어야 하므로 갑축(甲丑) 같은 조합은 존재하지 않습니다 — 본 도구의 [간지 변환] 탭이 이를 자동 검증합니다.
            천간·지지의 전체 구성과 띠·환갑 등 60갑자 순환 원리는{' '}
            <Link href="/tools/date/lunar" style={{ color: 'var(--accent)', fontWeight: 600 }}>양력 음력 변환기</Link>에서 자세히 다룹니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(219,39,119,0.2)', borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '12px', color: '#DB2777', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>간지 공식</p>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.7 }}>
              천간 = ((서기년 − 4) mod 10 + 10) mod 10<br />
              지지 = ((서기년 − 4) mod 12 + 12) mod 12
            </p>
          </div>
        </div>

        {/* ── 4. 한국 통합 연표 (단군~현재) (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🇰🇷 한국 통합 연표 (단군~현재)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [역사 연표] 탭에서 70+ 사건을 시대별 필터로 조회 가능. 시대 구조:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>시대</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>기간</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>주요 사건</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { e: '🌳 고조선', p: 'BC 2333 ~ BC 108', ev: '단군 건국 / 위만조선 / 한사군' },
                  { e: '⚔️ 삼국시대', p: 'BC 57 ~ AD 668', ev: '신라·고구려·백제 건국 / 살수대첩(612)' },
                  { e: '🏯 통일신라·발해', p: '676 ~ 935', ev: '삼국통일 / 발해 건국(698)' },
                  { e: '🏰 고려', p: '918 ~ 1392', ev: '왕건 건국 / 귀주대첩(1019) / 무신정변(1170) / 몽골 침입' },
                  { e: '👑 조선', p: '1392 ~ 1897', ev: '훈민정음(1446) / 임진왜란(1592) / 병자호란(1636)' },
                  { e: '🏛️ 대한제국', p: '1897 ~ 1910', ev: '대한제국 선포 / 을사늑약(1905) / 경술국치(1910)' },
                  { e: '🇯🇵 일제강점기', p: '1910 ~ 1945', ev: '3·1 운동(1919) / 윤봉길 의거(1932) / 광복(1945)' },
                  { e: '🇰🇷 대한민국', p: '1948 ~ 현재', ev: '정부 수립 / 6·25(1950) / 6월 항쟁(1987) / 월드컵(2002)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', color: '#DB2777', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.ev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. 동아시아 연호 동시 비교 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            🌏 동아시아 연호 동시 비교
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            본 도구의 [서기→연호] 탭에서 한 연도 입력 시 한국·중국·일본·기타 매핑을 동시에 표시. 동아시아 격동기 비교.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>서기</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: '#059669',     fontWeight: 600 }}>🇰🇷 한국</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: '#0891B2',     fontWeight: 600 }}>🇯🇵 일본</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: '#A16207',     fontWeight: 600 }}>🇨🇳 중국</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ad: '1592', kr: '조선 선조 25년 (임진왜란)', jp: '분로쿠(文禄) 1년', cn: '명 만력 20년' },
                  { ad: '1636', kr: '조선 인조 14년 (병자호란)', jp: '간에이 13년',      cn: '명 숭정 9년·청 숭덕 1년' },
                  { ad: '1894', kr: '조선 고종 31년 (갑오개혁)', jp: '메이지 27년 (청일전쟁)', cn: '청 광서 20년' },
                  { ad: '1910', kr: '조선 순종 4년 (경술국치)',    jp: '메이지 43년',       cn: '청 선통 2년' },
                  { ad: '1919', kr: '대한민국 임시정부 (3·1 운동)', jp: '다이쇼 8년',       cn: '민국 8년' },
                  { ad: '1945', kr: '광복 (8·15)',                jp: '쇼와 20년 (패전)',   cn: '민국 34년' },
                  { ad: '2026', kr: '서기 2026년 (단기 4359)',     jp: '레이와 8년',         cn: '민국 115년 (대만)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.ad}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.kr}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.jp}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.cn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 한국 주요 역사 사건 30선 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📌 한국 주요 역사 사건 30선
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            학교 과제·시험 자주 출제되는 사건. 본 도구의 [역사 연표] 탭 검색에서 사건명 또는 연도 입력으로 즉시 조회.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>연도</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>사건</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>당시 연호</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { y: 'BC 2333', ev: '단군왕검 고조선 건국',     era: '단기 1년' },
                  { y: '612',     ev: '살수대첩 (을지문덕)',      era: '고구려 영양왕 23년' },
                  { y: '676',     ev: '신라 삼국통일',             era: '신라 문무왕 16년' },
                  { y: '1019',    ev: '귀주대첩 (강감찬)',         era: '고려 현종 10년' },
                  { y: '1392',    ev: '조선 건국',                 era: '조선 태조 1년' },
                  { y: '1446',    ev: '훈민정음 반포',             era: '조선 세종 28년' },
                  { y: '1592',    ev: '임진왜란',                  era: '조선 선조 25년' },
                  { y: '1636',    ev: '병자호란',                  era: '조선 인조 14년' },
                  { y: '1876',    ev: '강화도 조약',               era: '조선 고종 13년' },
                  { y: '1894',    ev: '갑오개혁·동학농민운동',     era: '조선 고종 31년' },
                  { y: '1897',    ev: '대한제국 선포',             era: '대한제국 광무 1년' },
                  { y: '1905',    ev: '을사늑약',                  era: '대한제국 광무 9년' },
                  { y: '1910',    ev: '경술국치',                  era: '대한제국 융희 4년' },
                  { y: '1919',    ev: '3·1 운동·임시정부 수립',    era: '일제강점기' },
                  { y: '1945',    ev: '광복 (8·15)',               era: '일제강점기 끝' },
                  { y: '1948',    ev: '대한민국 정부 수립',         era: '대한민국 1년' },
                  { y: '1950',    ev: '6·25 전쟁 발발',            era: '대한민국 3년' },
                  { y: '1960',    ev: '4·19 혁명',                 era: '대한민국 13년' },
                  { y: '1987',    ev: '6·10 민주항쟁',             era: '대한민국 40년' },
                  { y: '2002',    ev: '한일 FIFA 월드컵',           era: '대한민국 55년' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', textAlign: 'right', color: '#DB2777', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.y}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.ev}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.era}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 7. 한국 기년법 사용 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            📚 한국에서 어떤 기년법을 쓰나?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            상황에 따라 다른 기년법을 사용합니다. 본 도구로 모두 즉시 변환 가능.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { e: '🌐', t: '서기 (표준)', d: '학교·관공서·일반 모든 공식 문서. 한국 표준.' },
              { e: '☸️', t: '불기', d: '사찰·법회·경전·불교 기념일 (석가모니 열반 BC 544 기준)' },
              { e: '🌳', t: '단기', d: '단군교·대종교·일부 보수 단체 (단군 BC 2333 기준)' },
              { e: '💍', t: '서기 + 간지', d: '결혼식·택일·돌잔치·환갑 등 전통 행사 (예: 갑진년)' },
              { e: '⚱️', t: '간지·연호', d: '제사·전통 행사·서예 작품 (예: 갑진년 봄)' },
              { e: '🎂', t: '띠', d: '돌·생일·궁합·인연 (12지지 기반, 서기 + 4 = 60갑자 위치)' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '20px', marginBottom: '4px' }}>{m.e}</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#DB2777', marginBottom: '6px' }}>{m.t}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/age',     icon: '🎂', name: '만 나이 계산기',     desc: '2023 만 나이 통일법 기준' },
              { href: '/tools/date/dday',    icon: '📅', name: 'D-day 계산기',       desc: '역사적 D-day·기념일' },
              { href: '/tools/life/zodiac',  icon: '🐯', name: '띠·별자리 계산기',   desc: '간지·띠·궁합 시너지' },
              { href: '/tools/date/lunar',   icon: '🌙', name: '음양력 변환기',       desc: '정확한 음양력·세시풍속' },
              { href: '/tools/date/military',icon: '🎖️', name: '군 전역일 계산기',   desc: '전역일·복무율 계산' },
              { href: '/tools/life/drake',   icon: '👽', name: '드레이크 방정식',     desc: '단군~현재 시간 스케일 비교' },
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
