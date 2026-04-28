import Link from 'next/link'
import FlooringClient from './FlooringClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/interior/flooring',
  title: '바닥재 소요량 계산기 — 마루·장판·데코타일 박스 수·비용',
  description: '강화마루·강마루·원목마루·장판·데코타일 박스 수와 시공 비용을 계산합니다. 한국 표준 박스 면적, 헤링본·평행 시공별 로스율, 셀프 vs 전문 시공 비용 비교.',
  keywords: ['바닥재계산기', '마루박스수', '강화마루소요량', '강마루계산', '장판소요량', '데코타일계산', '헤링본바닥재', '바닥재비용'],
})

export default function FlooringPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        인테리어
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🪵 바닥재 소요량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        평수 또는 가로·세로를 입력하면 <strong style={{ color: 'var(--text)' }}>강화마루·강마루·원목마루·장판·데코타일·도기 타일</strong>의
        박스 수, 로스율 반영 구매량, 셀프 vs 전문 시공 비용까지 계산합니다. 평행·대각선·헤링본·쉐브론 패턴별 로스율 자동 반영.
      </p>

      <FlooringClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 바닥재 종류별 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            바닥재 종류별 비교
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['종류', '단가(㎡)', '내구', '방수', '추천 공간'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i <= 1 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '장판 (PVC)',       p: '8,000~15,000원',  d: '★★☆☆☆', w: '★★★★★', u: '전세·임대·예산형' },
                  { t: '강화마루',         p: '25,000~45,000원', d: '★★★★☆', w: '★★☆☆☆', u: '아파트 표준 (가성비)' },
                  { t: '강마루',           p: '40,000~70,000원', d: '★★★★☆', w: '★★★☆☆', u: '거실·아이방 (난방 OK)' },
                  { t: '원목마루',         p: '80,000~150,000원',d: '★★★★★', w: '★★☆☆☆', u: '프리미엄·자연 질감' },
                  { t: '데코타일 (LVT)',  p: '20,000~40,000원', d: '★★★★☆', w: '★★★★★', u: '주방·욕실·상가' },
                  { t: '도기/자기 타일',   p: '30,000~80,000원', d: '★★★★★', w: '★★★★★', u: '욕실·현관·발코니' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.w}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 한국 시판 박스 면적 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 시판 박스 면적 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '강화마루', c: 'var(--accent)', items: [
                ['일반 박스', '약 2.4 ㎡'],
                ['두께', '8~12mm'],
                ['1박스 ≈', '0.73평'],
              ]},
              { t: '강마루', c: '#FFD700', items: [
                ['일반 박스', '약 2.6 ㎡'],
                ['두께', '7~9mm'],
                ['1박스 ≈', '0.79평'],
              ]},
              { t: '원목마루', c: '#9B59B6', items: [
                ['일반 박스', '약 2.0 ㎡'],
                ['두께', '14~21mm'],
                ['1박스 ≈', '0.61평'],
              ]},
              { t: '데코타일', c: '#3EC8FF', items: [
                ['일반 박스', '약 3.3 ㎡'],
                ['두께', '3~5mm'],
                ['1박스 ≈', '1평'],
              ]},
              { t: '장판 (롤)', c: '#3EFF9B', items: [
                ['폭', '1.8m / 2.0m'],
                ['길이', '미터 단위 절단'],
                ['두께', '1.8~4.5mm'],
              ]},
              { t: '도기 타일', c: '#FF6B6B', items: [
                ['주력 사이즈', '60×60cm'],
                ['1장 면적', '0.36 ㎡'],
                ['1평 ≈', '약 9.2장'],
              ]},
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {g.items.map(([k, v], j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                      <span>{k}</span>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 시공 방식별 로스율 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            시공 방식별 로스율 (여유분)
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>구매량</span> = 면적 × (1 + 기본 로스율 + 시공 추가율)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>※ 기본 로스율(자투리·실측 오차) 5~15% + 시공 패턴별 추가 0~15%</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: 12 }}>
            {[
              { t: '평행 시공',   c: '#3EFF9B',     v: '+0%', d: '벽과 평행하게 일자' },
              { t: '대각선 시공', c: 'var(--accent)', v: '+5%', d: '45° 기울여 시공' },
              { t: '헤링본',     c: '#FF8C3E',     v: '+10%', d: 'V자 반복 패턴' },
              { t: '쉐브론',     c: '#FF6B6B',     v: '+15%', d: '대칭 V자 패턴' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${m.c}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: m.c, fontWeight: 700, marginBottom: 4 }}>{m.t}</p>
                <p style={{ fontSize: 22, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{m.v}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 평수별 박스 수 빠른 참조 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            평수별 박스 수 빠른 참조 (평행 시공 +10% 기준)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['평수', '면적(㎡)', '강화마루', '강마루', '원목마루', '데코타일'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '5평',  m: 16.5,  s: 8,  k: 7,  o: 10, d: 6 },
                  { p: '7평',  m: 23.1,  s: 11, k: 10, o: 13, d: 8 },
                  { p: '10평', m: 33.1,  s: 15, k: 14, o: 19, d: 11 },
                  { p: '15평', m: 49.6,  s: 23, k: 21, o: 28, d: 17 },
                  { p: '20평', m: 66.1,  s: 31, k: 28, o: 37, d: 22 },
                  { p: '25평', m: 82.6,  s: 38, k: 35, o: 46, d: 28 },
                  { p: '30평', m: 99.2,  s: 46, k: 42, o: 55, d: 33 },
                  { p: '35평', m: 115.7, s: 53, k: 49, o: 64, d: 39 },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.m}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.s}박스</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.k}박스</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.o}박스</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.d}박스</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 표준 박스 면적 기준(강화 2.4㎡ / 강마루 2.6㎡ / 원목 2.0㎡ / 데코타일 3.3㎡), 헤링본·쉐브론 시공 시 1.5~2박스 추가 권장
          </p>
        </div>

        {/* ── 5. 셀프 vs 전문 시공 비용 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            셀프 vs 전문 시공 비용 비교 (15평 강화마루 기준)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>🛠️ 셀프 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>자재비 (23박스): <strong>약 130만원</strong></li>
                <li>본드·몰딩·보양재: <strong>약 12만원</strong></li>
                <li>공구 대여 (1일): <strong>약 5만원</strong></li>
                <li style={{ color: 'var(--accent)', fontWeight: 700, marginTop: 4 }}>총: 약 147만원</li>
                <li style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>※ 작업 시간: 2~3일</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: '#FF8C3E', fontWeight: 700, marginBottom: 8 }}>👷 전문 시공</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>자재비: <strong>약 130만원</strong></li>
                <li>인건비 (㎡당 1.5만원): <strong>약 75만원</strong></li>
                <li>철거·정리: <strong>약 20만원</strong></li>
                <li style={{ color: '#FF8C3E', fontWeight: 700, marginTop: 4 }}>총: 약 225만원</li>
                <li style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>※ 작업 시간: 1일 (헤링본 +50%)</li>
              </ul>
            </div>
          </div>
          <div style={{
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid rgba(200,255,62,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            fontSize: 13,
            color: 'var(--text)',
            marginTop: 12,
            lineHeight: 1.75,
          }}>
            ✅ <strong style={{ color: 'var(--accent)' }}>장판·데코타일은 셀프 도전 가능</strong>, 강마루·원목마루는 단차·접착 난이도 높아 <strong style={{ color: '#FF8C3E' }}>전문 시공 권장</strong>
          </div>
        </div>

        {/* ── 6. 바닥재 선택 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            바닥재 선택 가이드 (예산·내구성·디자인)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              { t: '💸 예산형 (~평당 5만원)', c: '#3EFF9B', items: ['장판 (PVC)', '저가 데코타일', '전세·임대·1~2년 거주'] },
              { t: '⚖️ 표준 (평당 8~15만원)', c: 'var(--accent)', items: ['강화마루', '강마루', '아파트 표준 선택'] },
              { t: '✨ 프리미엄 (평당 20만원~)', c: '#9B59B6', items: ['원목마루', '대형 포세린 타일', '신축·자가·장기 거주'] },
              { t: '💧 방수 필수 공간', c: '#3EC8FF', items: ['도기/자기 타일', '데코타일 (LVT)', '욕실·주방·발코니'] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, marginBottom: 8 }}>{g.t}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85 }}>
                  {g.items.map((v, j) => (<li key={j}>{v}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 시공 시 주의사항 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            시공 시 주의사항
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {[
              { t: '🌡️ 양생 기간', d: '시공 전 자재 박스를 시공할 방에 24~48시간 두어 온·습도에 적응시켜야 변형이 적습니다.' },
              { t: '📏 바닥 평탄도', d: '구조용 합판이나 셀프 레벨링 시공이 필요한 경우 비용·시간이 추가됩니다. 단차 3mm 이상은 보정 필수.' },
              { t: '🧱 몰딩·걸레받이', d: '바닥재 교체 시 몰딩 재시공이 필요할 수 있어 추가 비용을 미리 잡아두세요.' },
              { t: '🔥 난방 호환', d: '온수 난방은 강마루·강화마루 OK, 원목마루는 두께·재질 확인 필수. 장판은 모두 OK.' },
              { t: '🌬️ 환기', d: '본드·실리콘 시공 후 24시간 환기 필수. 새집증후군 예방.' },
              { t: '✂️ 여유분 보관', d: '동일 로트(LOT) 자재 1박스는 보수용으로 남겨두세요. 추후 부분 교체 시 색·결 차이 방지.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 8. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '강화마루와 강마루 차이가 뭐예요?',
                a: '<strong>강화마루</strong>는 HDF(고밀도 섬유판)에 멜라민 필름을 압착한 합성 마루로 가격이 저렴하고 스크래치에 강합니다. <strong>강마루</strong>는 합판 위에 천연 무늬목을 붙인 형태로 더 부드럽고 따뜻한 질감이며 난방에도 적합합니다. 가격은 강마루가 1.5~2배 비싸지만 거주감과 내구성에서 우수해 아파트 거실·아이방에서 가장 많이 선택됩니다.',
              },
              {
                q: '바닥재 1박스는 몇 평인가요?',
                a: '한국 시판 기준으로 <strong>강화마루 1박스 ≈ 2.4㎡ ≈ 0.73평</strong>, 강마루 1박스 ≈ 2.6㎡ ≈ 0.79평, 원목마루 1박스 ≈ 2.0㎡ ≈ 0.61평, 데코타일 1박스 ≈ 3.3㎡ ≈ 1평 정도입니다. 브랜드·시리즈마다 ±10% 차이가 있으므로 실제 구매 전 박스 표기 면적을 반드시 확인하세요.',
              },
              {
                q: '헤링본 시공은 왜 자재가 더 많이 필요한가요?',
                a: '헤링본은 <strong>V자 패턴으로 반복</strong>되어 짧은 자재가 많이 발생하고, 가장자리 절단 시 자투리가 평행 시공보다 2~3배 많이 나옵니다. 그래서 평행 대비 <strong>+10% 추가 자재</strong>(쉐브론은 +15%)를 권장합니다. 또한 시공 난이도가 높아 인건비도 평행 대비 <strong>+50% 정도 더 나옵니다</strong>. 디자인 효과는 좋지만 비용·자재 모두 여유 있게 잡으세요.',
              },
              {
                q: '장판은 셀프 시공이 가능한가요?',
                a: '네, <strong>장판은 셀프 시공 난이도가 가장 낮습니다</strong>. 폭 1.8m 또는 2.0m 롤 형태로 절단 후 본드 또는 양면테이프로 고정하면 됩니다. 단, 정확한 실측·재단·이음매 처리가 중요하며, 5평 이상은 두 사람이 작업하는 것이 안전합니다. 강마루·원목마루는 단차·접착 정밀도가 필요해 전문 시공을 권장합니다.',
              },
              {
                q: '바닥재 위에 다른 바닥재를 덧시공할 수 있나요?',
                a: '<strong>조건부로 가능합니다.</strong> 기존 바닥이 평탄하고(단차 3mm 이내) 들뜸·곰팡이가 없으면 데코타일·장판은 덧시공 가능합니다. 강화·강마루는 두께(8~12mm) 때문에 문턱·문 하단·콘센트 위치에 영향이 갈 수 있어 주의가 필요합니다. 가장 깨끗한 결과는 <strong>기존 바닥 철거 후 시공</strong>이지만, 비용 절감을 위해 덧시공도 많이 선택합니다.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 9. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피' },
              { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 소요량 계산기',         desc: '벽지 롤 수·시공 비용' },
              { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 소요량 계산기',       desc: '벽·천장 페인트 양' },
              { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈',       desc: '창문 사이즈로 추천 사이즈' },
              { href: '/tools/interior/lighting',      icon: '💡', name: '조명 밝기 계산기',           desc: '공간별 권장 루멘·조명 개수' },
              { href: '/tools/unit/area',              icon: '🏠', name: '평수 ↔ ㎡ 변환기',          desc: '아파트 면적 단위 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
