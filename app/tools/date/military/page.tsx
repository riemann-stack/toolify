import Link from 'next/link'
import MilitaryClient from './MilitaryClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'

export const metadata = buildMetadata({
  path: '/tools/date/military',
  title: '군대 전역일 계산기 — 복무율·D-day·진급·말년 (2026년 최신)',
  description:
    '입대일과 복무 형태로 전역일·복무율·D-day를 계산합니다. 월말 입영 예외(민법 제160조)까지 반영하고, 진급 시점은 군인사법 시행규칙 제32조 기준으로 표시합니다.',
  keywords: ['군대 전역일 계산기', '복무율 계산기', '말년 시작일', '입대 100일', '사회복무요원 전역일', '일병 진급 시기', '포상휴가 전역일'],
})

const FAQ_LD = [
              {
                q: '전역일은 입대일로부터 정확히 몇 개월 뒤인가요?',
                a: '입대일에 복무 개월을 더한 후 1일을 뺀 날짜입니다. 2026년 1월 15일에 18개월 육군으로 입대하면 전역일은 <strong>2027년 7월 14일</strong>입니다. 단 <strong>월말 입영은 예외</strong>입니다 — 8월 31일에 18개월로 입영하면 「+18개월」이 2월 31일이라 존재하지 않으므로, 「민법」 제160조제3항에 따라 <strong>2월 말일이 전역일</strong>이 되고 여기서 1일을 더 빼지 않습니다. 실제 전역일이 밀리는 사유는 「병역법」 제18조제3항의 형 집행일수·군기교육처분일수·복무이탈일수뿐이며, <strong>휴가는 전역일을 바꾸지 않습니다</strong>. 정확한 전역일은 소속 부대 또는 병무청에 확인하세요.',
              },
              {
                q: '사회복무요원도 계산할 수 있나요?',
                a: '네. 사회복무요원 복무 기간 <strong>21개월</strong> 기준으로 계산할 수 있습니다. 병무청은 사회복무요원의 복무 기간을 21개월로 안내하고 있으며, 본 계산기에서 동일 기준으로 적용합니다.',
              },
              {
                q: '복무 기간 표는 어떤 기준인가요?',
                a: '<strong>2026년 7월 기준 병무청 병역이행안내</strong>입니다. 본 계산기가 지원하는 <strong>10가지</strong>는 육군·해병대 18개월, 해군 20개월, 공군 21개월, 상근예비역 18개월, 사회복무요원 21개월, 산업기능요원 현역 34개월·보충역 23개월, 전문연구요원과 대체복무요원 각 36개월입니다. 병무청의 복무제도 분류는 이보다 넓어 <strong>예술체육요원·승선근무예비역·공중보건의사</strong> 등도 포함하는데, 이들은 본 계산기에 없으므로 <strong>「직접 입력」</strong>으로 개월 수를 지정해 쓰세요.',
              },
              {
                q: '의무경찰·의무소방은 왜 선택지에 없나요?',
                a: '의무경찰·의무소방·해양경찰 제도는 <strong>2023년 모두 폐지</strong>되어 현재 신규 선발이 이루어지지 않습니다. 해당 제도로 복무 중이거나 복무한 분들은 <strong>"직접 입력" 옵션</strong>으로 복무 기간을 입력해 사용하실 수 있습니다.',
              },
              {
                q: '포상휴가를 많이 받으면 전역이 빨라지나요?',
                a: '<strong>아닙니다.</strong> 흔한 오해인데, 현역병의 전역일은 <strong>입영일 + 복무기간</strong>으로 고정되며 개인 단위로 이를 단축하는 조항이 병역법에 없습니다. 포상휴가는 「군인의 지위 및 복무에 관한 기본법 시행령」상 <strong>특별휴가의 한 종류</strong>(모범이 되는 공적, 10일 이내)이고, 휴가는 승인된 복무 중 부재이므로 복무기간에 그대로 산입됩니다 — 즉 <strong>나가는 휴가 일수가 늘 뿐 전역일은 그대로</strong>입니다. 「병역법」 제18조제3항은 복무기간에 산입하지 않는 사유를 <strong>형의 집행일수·군기교육처분일수·복무이탈일수 세 가지로 한정 열거</strong>하며, 셋 다 전역일을 <strong>뒤로 미룹니다</strong>. 「말년휴가를 몰아 써서 일찍 나온다」는 것은 부대 복귀를 하지 않는 것일 뿐 전역일(군인 신분 종료일) 자체가 바뀌는 것은 아닙니다.',
              },
              {
                q: '군기교육이나 병가를 받으면 전역이 밀리나요?',
                a: '<strong>군기교육은 밀립니다.</strong> 「병역법」 제18조제3항에 따라 군기교육처분일수는 <strong>전부</strong> 복무기간에 산입되지 않아 받은 일수만큼 그대로 전역이 연기됩니다 — 며칠 이내는 봐준다는 면제 구간은 <strong>없습니다</strong>(1일을 받으면 1일 연기). 군기교육은 「군인사법」 제57조상 15일 이내이며, 2020년 8월 영창이 폐지되면서 이를 대체해 도입됐습니다.<br/><br/><strong>병가는 신분에 따라 다릅니다.</strong> <strong>현역병</strong>의 병가는 청원휴가로서 복무기간에 산입되므로 전역일이 바뀌지 않습니다(미산입 3사유에 병가가 없습니다). 반면 <strong>사회복무요원</strong>은 공무 외 질병·부상 병가가 통산 30일까지만 산입되고 초과분만큼 연장복무합니다. 개인별 내역은 부대 인사담당자 또는 복무기관에 확인하세요.',
              },
              {
                q: '특정 날짜 기준으로도 복무율을 계산할 수 있나요?',
                a: '네. 본 계산기는 <strong>"특정 날짜 기준"</strong> 옵션을 제공합니다. 다음 휴가 복귀일, 새해, 생일 등 임의의 날짜를 기준으로 한 복무율과 D-day를 계산할 수 있어 일정 계획에 유용합니다.',
              },
              {
                q: '입대 100일이 일병 진급일인가요?',
                a: '<strong>아닙니다.</strong> 「군인사법 시행규칙」 제32조제2항은 일등병 진급 최저복무기간을 <strong>「이등병으로서 2개월」</strong>로 정하므로, 일병 진급은 <strong>입대 후 약 60일</strong>에 가능해집니다. 입대 100일차는 이미 진급하고 <strong>40일쯤 지난 시점</strong>입니다. 「100일 = 일병 진급」은 이등병 기간이 3개월이던 2019년 8월 개정(2019-09-01 시행) 이전의 통념이 남은 것입니다.<br/><br/>그럼에도 100일이 의미 있는 이유는 <strong>문화</strong>입니다 — 신병교육과 자대 적응을 마치고 군 생활이 익숙해지는 첫 분기점으로 보아 가족이 <strong>100일 면회·선물·휴가</strong>를 챙기는 풍습이 정착돼 있습니다. 본 계산기는 100일을 진급일이 아닌 문화적 기념일로 표시하고, 진급은 별도 마일스톤(2·8·14개월)으로 계산합니다.',
              },
              {
                q: '"말년", "왕고"는 정확히 언제부터인가요?',
                a: '법령 용어가 아닌 <strong>관행적 표현</strong>입니다 — <strong>말년 = 전역 D-100 이내</strong>(마지막 100일), <strong>왕고 = 전역 D-30 이내</strong>(마지막 한 달). 18개월(546~550일) 복무 기준으로 D-100 시점은 <strong>약 14.7개월 차</strong>이고 복무율로는 <strong>약 82%</strong>입니다(20개월 84%, 21개월 84%). 본 계산기의 「말년 시작 D-100」 카드와 진행바의 D-100 마커에서 자기 날짜를 확인할 수 있습니다.',
              },
              {
                q: '본 계산기의 결과를 진단서·확인서로 사용할 수 있나요?',
                a: '아닙니다. 본 도구는 <strong>일반 공식에 기반한 추정 계산</strong>이므로 공식 증빙으로 사용할 수 없습니다. 정확한 전역일·복무 일수가 필요한 경우(전역증·복무 기간 확인서 등) <strong>병무청 민원24</strong>(mma.go.kr) 또는 소속 부대 인사처에서 공식 발급 받으시기 바랍니다.',
              },
            ]

export default function MilitaryPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>날짜·시간</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="date" />군대 전역일 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        입대일 기준 <strong style={{ color: 'var(--text)' }}>전역일과 복무율</strong>을 시각화.
      </p>

      <MilitaryClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 기준일·출처 ── */}
        <UpdatedMeta
          date="2026년 7월"
          basis="복무기간 = 병무청 병역이행안내 / 전역일 산정 = 「병역법」 제18조·시행령 제27조 + 「민법」 제160조 / 진급 = 「군인사법 시행규칙」 제32조 (국방부령 제1207호, 시행 2026-03-01)"
          sources={[
            { label: '병역법 제18조(현역의 복무) — 국가법령정보센터', href: 'https://www.law.go.kr/법령/병역법/제18조' },
            { label: '군인사법 시행규칙 제32조(병의 진급 등) — 국가법령정보센터', href: 'https://www.law.go.kr/법령/군인사법시행규칙/제32조' },
            { label: '민법 제160조(역에 의한 계산) — 국가법령정보센터', href: 'https://www.law.go.kr/법령/민법/제160조' },
            { label: '병무청 병역이행안내', href: 'https://www.mma.go.kr/contents.do?mc=usr0000041' },
          ]}
        />

        {/* ── 2. 복무 기간·형태 통합표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            2026년 기준 병역 복무 형태 한눈에 보기
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            본 계산기가 지원하는 10가지 복무 형태입니다. 육·해·공·해병대 현역 기간은 <strong style={{ color: 'var(--text)' }}>국방개혁 2.0</strong>에 따라
            2018년 10월 1일 전역자부터 2주 단위로 1일씩 점진 단축되어 <strong style={{ color: 'var(--text)' }}>2021년 12월 14일에 완료</strong>됐습니다.
            병무청 「병역이행안내」의 복무제도 분류는 이보다 넓어 예술체육요원·승선근무예비역·공중보건의사 등도 포함합니다(본 계산기는 미지원 — 직접 입력을 쓰세요).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['복무 형태', '기간', '일수', '특징'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '육군 현역',         p: '18개월', d: '546~550일',   c: 'var(--success)',     note: '신병교육 5주 → 자대 배치' },
                  { t: '해병대 현역',       p: '18개월', d: '546~550일',   c: 'var(--success)',     note: '신병교육 6주 → 자대 배치' },
                  { t: '상근예비역',        p: '18개월', d: '546~550일',   c: 'var(--success)',     note: '신병교육 후 거주지 인근 부대 출퇴근' },
                  { t: '해군 현역',         p: '20개월', d: '607~611일',   c: 'var(--accent)',      note: '함정·해상 작전' },
                  { t: '공군 현역',         p: '21개월', d: '638~642일',   c: 'var(--cat-sports)',  note: '기지·방공 작전' },
                  { t: '사회복무요원',      p: '21개월', d: '638~642일',   c: 'var(--cat-sports)',  note: '복지·행정기관 출퇴근 (계급 없음)' },
                  { t: '산업기능요원(보충역)', p: '23개월', d: '699~703일',   c: 'var(--warning)',  note: '지정업체 생산직 (계급 없음)' },
                  { t: '산업기능요원(현역)',   p: '34개월', d: '1,033~1,037일', c: 'var(--danger)', note: '군사교육 후 지정업체 (계급 없음)' },
                  { t: '전문연구요원',      p: '36개월', d: '1,095~1,096일', c: 'var(--cat-art)',   note: '석·박사 연구인력 (계급 없음)' },
                  { t: '대체복무요원',      p: '36개월', d: '1,095~1,096일', c: 'var(--cat-art)',   note: '교정시설 합숙 (계급 없음)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: r.c, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ <strong style={{ color: 'var(--text)' }}>의무경찰·의무소방·해양경찰</strong> 제도는 2023년 모두 폐지되어 신규 선발이 종료되었습니다. 이전 복무자는 본 계산기의 <strong style={{ color: 'var(--text)' }}>「직접 입력」</strong>으로 복무 기간을 지정해 사용하세요.
          </p>
        </div>

        {/* ── 3. 군 복무 마일스톤 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎯 군 복무 주요 마일스톤 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {[
              { i: '🎒', t: '신병교육 수료',      d: '육군 5주 · 해병대 6주 후 자대 배치', color: 'var(--cat-health)' },
              { i: '🎖️', t: '일병 진급 (2개월)',  d: '이병 최저복무기간 2개월 경과',       color: 'var(--accent)' },
              { i: '🥇', t: '입대 100일',        d: '면회·100일 휴가 문화 (진급일 아님)',  color: 'var(--cat-art)' },
              { i: '⏱️', t: '복무 50% (반환점)', d: '절반 통과',                          color: 'var(--cat-sports)' },
              { i: '🔥', t: '전역 D-100',        d: '"말년" 시작 — 18개월 기준 약 82%',   color: 'var(--warning)' },
              { i: '👑', t: '전역 D-30',         d: '"왕고" 시기',                        color: 'var(--danger)' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${m.color}`, borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{m.i}</p>
                <p style={{ fontSize: 13, color: m.color, fontWeight: 700, marginBottom: 2 }}>{m.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 휴가·징계와 전역일 영향 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            무엇이 전역일을 바꾸나 — 휴가·징계·병가
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            현역병의 전역일은 <strong style={{ color: 'var(--text)' }}>입영일 + 복무기간</strong>으로 고정됩니다. 이를 바꾸는 사유는
            「병역법」 제18조제3항이 <strong style={{ color: 'var(--text)' }}>딱 세 가지만 한정해서 열거</strong>하고 있고, 셋 다 복무기간에
            산입되지 않아 <strong style={{ color: 'var(--text)' }}>전역일이 그만큼 뒤로 밀립니다</strong>. 전역일을 앞당기는 조항은 병역법에 없습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--danger)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 700, marginBottom: 6 }}>📉 전역이 밀리는 3가지 (법정)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>징역·금고·구류형의 <strong>집행일수</strong></li>
                <li><strong>군기교육처분일수</strong></li>
                <li><strong>복무이탈일수</strong></li>
              </ul>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
                해당 일수 <strong style={{ color: 'var(--text)' }}>전부</strong>가 미산입입니다 — 면제되는 하한(예: 며칠 이내)은 없습니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--success)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700, marginBottom: 6 }}>= 모든 휴가 (영향 없음)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>정기휴가 · 공가</li>
                <li>청원휴가 (본인·가족 질병, 혼인 등)</li>
                <li>특별휴가 = <strong>포상</strong>·위로·보상휴가</li>
              </ul>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
                휴가는 <strong style={{ color: 'var(--text)' }}>승인된 복무 중 부재</strong>라 복무기간에 그대로 산입됩니다.
                <strong style={{ color: 'var(--text)' }}> 포상휴가를 많이 받아도 전역일은 당겨지지 않습니다</strong> — 나가는 휴가 일수가 늘 뿐입니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-health)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--cat-health)', fontWeight: 700, marginBottom: 6 }}>🏥 병가 — 신분에 따라 다름</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li><strong>현역병</strong>: 청원휴가로 산입 → 전역일 불변</li>
                <li><strong>사회복무요원</strong>: 공무 외 병가는 통산 30일까지만 산입, 초과분만큼 연장복무</li>
              </ul>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
                병가는 「병역법」 제18조제3항의 미산입 3사유에 <strong style={{ color: 'var(--text)' }}>포함되지 않습니다</strong>.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--warning)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 700, marginBottom: 6 }}>⚠️ 군기교육 (영창 대체)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>2020년 8월 영창 폐지 → 군기교육으로 대체</li>
                <li>「군인사법」 제57조상 <strong>15일 이내</strong></li>
                <li>처분일수 <strong>전부</strong> 미산입 → 1일이면 1일 연기</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 이 밖에 「병역법」 제18조제4항의 <strong style={{ color: 'var(--text)' }}>전역 보류</strong>(형사사건 구속, 공상 입원치료 계속, 중요 작전·훈련 수행)에 해당하면
            의무복무 만료일 이후로 전역이 미뤄질 수 있습니다.
          </p>
        </div>

        {/* ── 5. 계급 진급 시점 (육군 18개월 기준) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🎖️ 현역병 계급 진급 시점
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            근거는 <strong style={{ color: 'var(--text)' }}>「군인사법 시행규칙」 제32조</strong>(병의 진급 등)입니다. 최저복무기간이 지나면
            <strong style={{ color: 'var(--text)' }}> 진급심사를 거쳐</strong> 1계급씩 진급합니다(제1항, 2024-02-29 개정 — 이전에는 심사 없이 진급했습니다).
            같은 조 제2항의 표에는 <strong style={{ color: 'var(--text)' }}>군별 구분이 없어</strong> 육·해·공·해병대의 진급 시점이 같습니다.
            군별로 달라지는 것은 진급 시점이 아니라 <strong style={{ color: 'var(--text)' }}>병장으로 복무하는 잔여 기간</strong>입니다(총 복무기간 − 14개월).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['계급', '진급 최저복무기간', '입대 기준 누적', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '이병',   t: '입영한 날에 이등병',      d: '0~2개월',   c: 'var(--cat-health)', note: '「병역법 시행령」 제27조제1항' },
                  { r: '일병',   t: '이등병으로서 2개월',      d: '2개월차~',  c: 'var(--accent)',     note: '입대 100일차엔 이미 일병' },
                  { r: '상병',   t: '일등병으로서 6개월',      d: '8개월차~',  c: 'var(--cat-sports)', note: '18개월 기준 복무율 약 44%' },
                  { r: '병장',   t: '상등병으로서 6개월',      d: '14개월차~', c: 'var(--warning)',    note: '18개월 기준 복무율 약 78%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: r.c, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: '12px' }}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 위는 <strong style={{ color: 'var(--text)' }}>최저</strong> 기간이라 실제 진급일은 <strong style={{ color: 'var(--text)' }}>빨라질 수도 늦어질 수도</strong> 있습니다.
            <strong style={{ color: 'var(--text)' }}> 빨라지는 쪽</strong> — 같은 조 제3항은 근무성적 우수자(해당 계급 진급인원의 10분의 1 이내)에게
            상병 4개월·병장 5개월로 단축을 허용하고, 제4항은 그 인원을 전투부대 10분의 2·경계부대 10분의 3까지 넓힙니다(개정 2025-10-24).
            즉 상병은 최단 6개월차, 병장은 최단 11개월차도 가능합니다. 제33조제2항은 의무복무를 마쳤는데 전역일 전일까지 상등병인 사람을
            병장으로 진급시켜 전역하게 할 수 있습니다.
            <strong style={{ color: 'var(--text)' }}> 늦어지는 쪽</strong> — 제2항 단서는 참모총장이 국방부장관 승인을 받아 1개월 범위에서 연장할 수 있게 하고,
            제36조는 유죄판결·징계 시 1~3개월의 진급제한기간을 둡니다. 정확한 진급일은 인사담당자에게 확인하세요.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.7 }}>
            ※ 계급은 <strong style={{ color: 'var(--text)' }}>현역병·상근예비역</strong>에만 해당합니다. 사회복무요원·산업기능요원·전문연구요원·대체복무요원은 병 계급이 없어
            위 진급 마일스톤이 적용되지 않으며, 계산기도 해당 복무 형태에서는 진급 항목을 표시하지 않습니다.
          </p>
        </div>

        {/* ── 5-1. 한국 군 복무 기간 단축 역사 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📜 한국 군 복무 기간 단축 역사
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            육군 기준 복무 기간은 6·25 직후 36개월에서 시작해 현재 <strong style={{ color: 'var(--text)' }}>18개월</strong>까지 줄었습니다.
            다만 <strong style={{ color: 'var(--text)' }}>단조 감소가 아닙니다</strong> — 1968년 1·21 사태 직후에는 오히려 연장됐습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시점', '육군', '해군', '공군', '비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['~1959', '36개월', '36개월', '36개월', '6·25 직후'],
                  ['1962',  '30개월', '36개월', '36개월', '육군 단축'],
                  ['1968',  '36개월', '39개월', '39개월', '1·21 사태 후 연장 ↑'],
                  ['1993',  '26개월', '30개월', '30개월', '1992년 결정 → 1993년 1월 시행'],
                  ['2003',  '24개월', '26개월', '28개월', '국방개혁 시작'],
                  ['2011',  '21개월', '23개월', '24개월', '단계적 단축'],
                  ['2021',  '18개월', '20개월', '21개월', '국방개혁 2.0 완료 (현재)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--muted)' }}>{r[3]}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--muted)', fontSize: 12 }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 6. 직접 계산 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            전역일 직접 계산 공식
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
            <div><span style={{ color: 'var(--muted)' }}>전역일</span> = 입대일 + 복무 개월 − 1일</div>
            <div><span style={{ color: 'var(--muted)' }}>총 복무 일수</span> = 전역일 − 입대일 + 1  <span style={{ color: 'var(--muted)' }}>(양 끝 포함)</span></div>
            <div><span style={{ color: 'var(--muted)' }}>복무율 (%)</span> = (오늘 − 입대일 + 1) ÷ 총 복무 일수 × 100</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginTop: 12 }}>
            예시: 2026년 1월 15일에 18개월 육군으로 입대 → 전역일은 <strong style={{ color: 'var(--accent-ink)' }}>2027년 7월 14일</strong>, 총 546일.
            입대일과 전역일을 <strong style={{ color: 'var(--text)' }}>모두 복무 일수에 넣습니다</strong> — 입대 당일이 1일차, 전역 당일이 100%입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--warning)', borderRadius: 12, padding: '14px 18px', marginTop: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>월말에 입영했다면 — 「−1일」이 그대로 통하지 않습니다</p>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              8월 31일에 18개월로 입영하면 「+18개월」이 <strong style={{ color: 'var(--text)' }}>2월 31일</strong>이라 존재하지 않습니다.
              「병역법」에는 만료일 계산 규칙이 없어 <strong style={{ color: 'var(--text)' }}>「민법」 제155조</strong>에 따라 민법 기간 규정이 준용되는데,
              제160조제2항은 해당일이 있으면 <strong style={{ color: 'var(--text)' }}>그 전일</strong>에(= 통념 공식의 −1일), 제160조제3항은 해당일이 없으면
              <strong style={{ color: 'var(--text)' }}> 그 달의 말일</strong>에 기간이 만료한다고 정합니다. 즉 <strong style={{ color: 'var(--text)' }}>2월 말일이 곧 전역일</strong>이며
              여기서 다시 1일을 빼지 않습니다. 본 계산기는 이 규정대로 산정합니다.
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
              ※ 병무청은 공식 전역일 계산기를 제공하지 않아 <strong style={{ color: 'var(--text)' }}>월말 입영 사례의 실무 처리를 1차출처로 확인하지 못했습니다</strong>.
              위는 민법 규정에 따른 산정이므로, 월말 입영자는 소속 부대·병무청에 확인하시기 바랍니다.
            </p>
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
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

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/dday',      icon: '📅', name: 'D-Day 계산기', desc: '두 날짜 사이·페이스 통합' },
              { href: '/tools/date/age',       icon: '🎂', name: '만 나이 계산기',    desc: '법 개정 기준 만 나이' },
              { href: '/tools/date/jet-lag',   icon: '✈️', name: '시차 적응 계산기',  desc: '여행 시차 적응 일정' },
              { href: '/tools/date/life-time', icon: '⏳', name: '생애 시간 계산기',  desc: '기대수명 기준 시간 환산' },
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

        <Disclaimer
          variant="default"
          sources={[
            { label: '병역법 제18조 — 국가법령정보센터', href: 'https://www.law.go.kr/법령/병역법/제18조' },
            { label: '군인사법 시행규칙 제32조 — 국가법령정보센터', href: 'https://www.law.go.kr/법령/군인사법시행규칙/제32조' },
            { label: '병무청 병역이행안내', href: 'https://www.mma.go.kr/contents.do?mc=usr0000041' },
          ]}
        >
          전역일은 <strong>「병역법」 제18조·시행령 제27조(입영일 기산)</strong>와 <strong>「민법」 제160조(기간 만료)</strong>에 따른 산정입니다.
          병무청이 공식 전역일 계산기를 제공하지 않아 <strong>월말 입영 사례의 실무 처리는 1차출처로 확인하지 못했습니다</strong>.
          군기교육·형 집행·복무이탈이 있었다면 그 일수만큼 전역이 밀리며, 전역 보류 사유(제18조제4항)도 있을 수 있습니다.
          정확한 전역일·복무 일수는 <strong>병무청 민원24</strong>(mma.go.kr) 또는 소속 부대 인사처에서 확인하세요.
        </Disclaimer>

      </div>
    </div>
  )
}
