import Link from 'next/link'
import SchengenClient from './SchengenClient'
import AdSlot from '@/components/AdSlot'
import UpdatedMeta from '@/components/UpdatedMeta'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/date/schengen',
  title: '쉥겐 체류일 계산기 — 90/180일 무비자 체류 + 다음 입국 가능일',
  description:
    '쉥겐 90/180 규칙(최근 180일 내 최대 90일)을 출입국 기록으로 정확히 계산. 남은 체류일·연속 체류 가능일·다음 입국 가능일을 자동으로. 유럽 무비자 여행 필수.',
  keywords: ['쉥겐체류일계산기', '쉥겐90일계산', '쉥겐180일', '유럽무비자90일', '쉥겐조약', '솅겐계산기', '유럽장기여행', '쉥겐재입국'],
})

const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-card)',
  padding: '18px 20px',
}

const FAQ_LD = [
  { q: '쉥겐 90/180 규칙이 정확히 무엇인가요?', a: '쉥겐 지역에서 무비자(또는 단기비자)로 머물 수 있는 한도입니다. <strong>임의의 날을 기준으로 직전 180일 동안 합산 체류일이 최대 90일</strong>을 넘으면 안 됩니다. 90일을 연속으로 쓸 수도, 여러 번 나눠 쓸 수도 있지만 어떤 180일 구간에서도 90일을 초과하면 안 됩니다.' },
  { q: '180일은 언제부터 세나요?', a: '고정된 분기·반기가 아니라 <strong>‘롤링(rolling) 180일’</strong>입니다. 오늘을 포함한 직전 180일을 매일 뒤로 한 칸씩 밀면서 봅니다. 그래서 과거 체류일이 180일 창 밖으로 빠져나가면 그만큼 체류 가능일이 다시 회복됩니다.' },
  { q: '입국일과 출국일도 체류일에 포함되나요?', a: '네. <strong>입국한 날과 출국하는 날 모두 각각 ‘체류 1일’로 계산</strong>합니다. 예를 들어 6월 1일 입국, 6월 10일 출국이면 (단순 차이인) 9일이 아니라 <strong>10일(1일~10일)</strong>로 셉니다. 가장 흔한 계산 실수이므로 주의하세요.' },
  { q: '90일을 다 쓰면 언제 다시 입국할 수 있나요?', a: '가장 오래된 체류일이 180일 창에서 빠져나가야 그만큼 다시 채울 수 있습니다. 본 계산기의 <strong>‘다음 입국 가능일’</strong>이 1일 이상 체류 가능한 가장 이른 날짜를 자동으로 알려줍니다.<br/><br/>90일을 연속으로 모두 쓴 경우, <strong>마지막 출국일로부터 91일째(90일 연속 부재 후)부터는 다시 최대 90일 연속 체류도 가능</strong>합니다 — 체류하는 동안 매일 옛 체류일이 180일 창 밖으로 하나씩 빠져나가기 때문입니다(EU 계산기 사용자 설명서 기준, 위 계산기도 동일하게 계산). ‘잔여 카운터’ 표시가 90으로 완전히 리셋되는 시점은 이와 별개로 마지막 출국일로부터 180일이 지난 날입니다.' },
  { q: '영국·아일랜드도 쉥겐인가요?', a: '아닙니다. <strong>영국(브렉시트 후)·아일랜드는 쉥겐 지역이 아니며 각자 별도의 입국 규정</strong>을 적용합니다(영국은 보통 6개월, 단 2025년 1월부터 한국인도 <strong>ETA 전자여행허가 사전 신청</strong> 필요). 쉥겐 90일과 별개로 카운트되므로 영국 체류는 이 계산기에 넣지 마세요. 키프로스는 아직 쉥겐 미가입이며, 가입 여부에 대한 EU 이사회 결정이 2026년 하반기로 예정되어 있습니다. (2026년 7월 기준)' },
  { q: '여러 나라를 옮겨 다녀도 합산되나요?', a: '네. 쉥겐은 <strong>29개 회원국 전체를 하나의 지역</strong>으로 봅니다. 프랑스 → 독일 → 이탈리아를 이동해도 국경 심사 없이 다닐 수 있지만 체류일은 모두 <strong>하나로 합산</strong>됩니다. 나라별 90일이 아니라 쉥겐 전체 90일입니다.' },
  { q: '90일을 초과하면 어떻게 되나요?', a: '초과 체류(오버스테이)는 <strong>벌금, 출국 명령, 향후 쉥겐 입국 금지(수개월~수년)</strong> 등의 불이익을 받을 수 있습니다. 2026년 4월부터 전면 시행된 <strong>EES(입·출국 시스템)가 입·출국을 전산 기록</strong>하므로 초과 체류가 자동으로 확인됩니다. 단 하루라도 넘기지 않도록 보수적으로 일정을 잡으세요.' },
  { q: 'EES 시행 후에도 여권 도장을 받나요?', a: 'EES(EU 입·출국 시스템)는 2025년 10월 12일 단계 도입을 거쳐 <strong>2026년 4월 10일부터 모든 쉥겐 국가에서 전면 시행</strong>됐습니다(EU 집행위 발표). 여권 스탬프는 <strong>디지털 입·출국 기록으로 대체</strong>되고, 최초 입국 시 얼굴 사진과 지문을 등록합니다. 체류일이 전산으로 자동 계산되므로 90/180일 한도를 넘기면 바로 드러납니다. (2026년 7월 기준)' },
  { q: '독일 같은 양자협정 국가에서는 90일과 별도로 더 머물 수 있나요?', a: '외교부 해외안전여행 안내 기준, <strong>독일·네덜란드·벨기에 등 13개국은 한국과의 양자 사증면제협정이 쉥겐 90/180 규칙보다 우선 적용</strong>됩니다. 예컨대 독일은 주한독일대사관 안내상 다른 쉥겐국 체류 직후에도 독일에서 90일까지 체류할 수 있습니다. 다만 벨기에의 90일은 네덜란드·룩셈부르크 체류와 합산되는 등 허용 기간·조건이 국가별로 다르고 입국 심사는 각국 재량이므로, 이용 전 반드시 외교부 해외안전여행(0404.go.kr)과 해당국 대사관에서 확인하세요. 본 계산기는 표준 90/180 규칙 기준입니다. (2026년 7월 기준)' },
]

const COUNTRY_GROUPS: { region: string; items: string[] }[] = [
  { region: '서유럽', items: ['프랑스', '독일', '네덜란드', '벨기에', '룩셈부르크', '스위스', '오스트리아', '리히텐슈타인'] },
  { region: '남유럽', items: ['이탈리아', '스페인', '포르투갈', '그리스', '몰타', '슬로베니아', '크로아티아'] },
  { region: '북유럽', items: ['스웨덴', '덴마크', '핀란드', '노르웨이', '아이슬란드', '에스토니아', '라트비아', '리투아니아'] },
  { region: '중·동유럽', items: ['체코', '폴란드', '헝가리', '슬로바키아', '루마니아', '불가리아'] },
]

export default function SchengenPage() {
  return (
    <ToolPage width={760} slug="/tools/date/schengen">
      <h1 className="tp-h1">
        <ToolIconBadge catId="date" />쉥겐 체류일 계산기
      </h1>
      <p className="tp-lead">
        출입국 기록만 입력하면 <strong style={{ color: 'var(--text)' }}>최근 180일 내 90일 규칙</strong>으로 남은 체류일·다음 입국 가능일을 자동 계산.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="쉥겐 29개 회원국 · EES 전면 시행(2026-04-10) 반영"
        sources={[
          { label: 'EU 공식 쉥겐 계산기', href: 'https://ec.europa.eu/assets/home/visa-calculator/calculator.htm' },
          { label: 'EU EES·ETIAS 안내', href: 'https://travel-europe.europa.eu/ees_en' },
          { label: '외교부 해외안전여행', href: 'https://0404.go.kr/bbs/contsPst/MST0000000000117/17/detail' },
        ]}
      />

      <SchengenClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '44px', marginTop: '48px' }}>

        {/* 규칙 */}
        <div>
          <h2 className="g-h2">쉥겐 90/180 규칙 한눈에</h2>
          <p className="g-p">
            한국 여권 소지자는 쉥겐 지역에서 <strong>무비자로 단기 체류</strong>가 가능하지만, <strong>임의의 180일 동안 최대 90일</strong>이라는 한도가 있습니다.
          </p>
          <ul className="g-list">
            <li><strong>롤링 180일</strong> — 고정 구간이 아니라 ‘오늘 기준 직전 180일’을 매일 슬라이딩하며 검사</li>
            <li><strong>입국일·출국일 모두 1일</strong>로 계산 (몇 시간만 머물러도 하루)</li>
            <li><strong>29개국 전체 합산</strong> — 나라별 90일이 아니라 쉥겐 전체 90일</li>
            <li>과거 체류일이 180일 창 밖으로 빠지면 그만큼 체류 가능일 <strong>회복</strong></li>
          </ul>
        </div>

        {/* 가입국 */}
        <div>
          <h2 className="g-h2">쉥겐 가입국 (29개국)</h2>
          <p className="g-p">
            불가리아·루마니아는 2025년 1월 육로까지 전면 가입해 현재 29개국입니다. <strong>아일랜드·키프로스는 쉥겐이 아니며</strong>(키프로스 가입은 2026년 하반기 EU 이사회 결정 예정), 영국은 브렉시트 후 별도 규정(보통 6개월·ETA 필요)을 적용합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {COUNTRY_GROUPS.map((g) => (
              <div key={g.region} style={{ ...card, padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--accent-ink)', fontWeight: 700, marginBottom: '8px' }}>{g.region}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, margin: 0 }}>{g.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 계산 방식 — SchengenClient.tsx 로직과 1:1 */}
        <div>
          <h2 className="g-h2">계산기는 이렇게 셉니다</h2>
          <ol className="g-list">
            <li><strong>사용일</strong> — 기준일을 포함한 직전 180일(기준일 − 179일 ~ 기준일) 안에 들어오는 체류일을 셉니다. 기록이 겹치거나 맞닿으면 한 번만 셉니다(같은 날 두 번 입력해도 1일).</li>
            <li><strong>잔여</strong> = 90 − 사용일. 음수면 이미 초과 체류입니다. 입력한 기록 전체를 하루씩 훑어 과거·미래 어느 날이든 90일을 넘는 구간이 있으면 경고합니다.</li>
            <li><strong>연속 체류 가능일</strong> — 기준일에 입국해 하루씩 머문다고 가정하고, 매일 그날 기준 180일 창을 다시 세어 90일을 처음 넘기 직전 날까지를 셉니다. 머무는 동안 옛 체류일이 창 밖으로 빠지는 것까지 반영되므로 잔여 일수보다 길게 나올 수 있습니다.</li>
            <li><strong>다음 입국 가능일</strong> — 기준일부터 하루씩 앞으로 가며 ‘그날 하루를 더해도 90일 이하’가 되는 첫날을 찾습니다.</li>
            <li>출국일을 비워 두면 기준일까지 체류 중으로 계산합니다(EU 공식 계산기의 통제일 입력 관행과 같음).</li>
          </ol>
        </div>

        {/* 계산 예시 — 아래 표 값은 SchengenClient 알고리즘으로 산출·검산 (2026년, 평년) */}
        <div>
          <h2 className="g-h2">체류 패턴별 계산 결과</h2>
          <p className="g-p">
            같은 90일이라도 나눠 쓰는 방식에 따라 다음 입국 가능일과 연속 체류 가능일이 달라집니다. 아래는 2026년 날짜로 계산기에 넣었을 때의 실제 결과입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['체류 기록', '기준일', '180일 내 사용', '기준일 입국 시 연속 체류', '다음 입국 가능일'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1/1~1/30 (30일)', '3/1', '30일 · 잔여 60', '60일 (4/29까지)', '3/1 (바로 가능)'],
                  ['1/10~3/20 (70일)', '4/15', '70일 · 잔여 20', '20일 (5/4까지)', '4/15 (바로 가능)'],
                  ['1/1~3/31 (90일 연속)', '4/1', '90일 · 잔여 0', '입국 불가', '6/30 — 그날부터 90일 연속'],
                  ['1/1~3/31 (90일 연속)', '6/30', '89일 · 잔여 1', '90일 (9/27까지)', '6/30'],
                  ['1/1~2/14 + 4/1~5/15 (45일×2)', '5/16', '90일 · 잔여 0', '입국 불가', '6/30 — 그날부터 45일 연속'],
                  ['1·3·5월 30일씩 (30일×3)', '6/1', '90일 · 잔여 0', '입국 불가', '6/30 — 그날부터 30일 연속'],
                  ['1/1~4/5 (95일)', '4/6', '95일 · 5일 초과', '입국 불가', '7/5 (초과 체류 경고)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r[3]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            ※ 1·3·5월 30일씩 = 1/1~1/30, 3/1~3/30, 5/1~5/30. 날짜는 모두 2026년이며 입국일·출국일을 각각 1일로 셌습니다.
          </p>
          <p className="g-p">
            표에서 읽을 점은 세 가지입니다. 첫째, <strong>잔여 일수와 연속 체류 가능일은 다릅니다</strong> — 90일을 연속으로 쓴 뒤 6월 30일에는 잔여가 1일로 보이지만, 머무는 동안 1월 체류일이 하루씩 창 밖으로 빠져 실제로는 90일을 연속으로 머물 수 있습니다.
            둘째, <strong>「30일 머물고 30일 나갔다 오기」를 반복하면 5월 말에 한도가 찹니다</strong>. 180일 창 안에 30일짜리 세 번이 모두 들어가기 때문입니다.
            셋째, 90일을 나눠 썼을수록 다음 입국 뒤 한 번에 머물 수 있는 기간이 짧아집니다(45일×2 → 45일, 30일×3 → 30일).
          </p>
          <Callout tone="warn" title="자주 틀리는 계산">
            6월 1일~6월 10일은 9일이 아니라 <strong>10일</strong>입니다. 또 ‘1월 1일부터 180일’처럼 달력 반기로 끊어 세면 한도를 넘기기 쉽습니다 — 규칙은 체류하는 하루하루를 기준으로 직전 180일을 다시 보는 방식이라, 입국 심사도 입국하는 그날(출국 심사는 출국하는 그날)을 기준으로 셉니다.
          </Callout>
        </div>

        {/* EES·ETIAS */}
        <div>
          <h2 className="g-h2">EES·ETIAS — 2026년 쉥겐 입국 변화</h2>
          <p className="g-p">
            <strong>EES(입·출국 시스템)</strong> — 2025년 10월 12일 단계 도입을 시작해 <strong>2026년 4월 10일부터 모든 쉥겐 국가에서 전면 시행</strong>됐습니다(EU 집행위 발표).
          </p>
          <ul className="g-list">
            <li><strong>여권 스탬프 → 디지털 기록</strong> — 입·출국 날짜와 장소가 전산에 자동 기록됩니다</li>
            <li><strong>생체정보 등록</strong> — 최초 입국 시 얼굴 사진과 지문을 등록합니다</li>
            <li><strong>체류일 자동 산출</strong> — 90/180일 초과(오버스테이)가 시스템에서 바로 확인되므로 체류일 관리가 더 중요해졌습니다</li>
          </ul>
          <p className="g-p">
            <strong>ETIAS(전자여행허가)</strong> — <strong>개시 시기 미정</strong>입니다. 당초 2026년 4분기 목표였으나 2026년 7월 EU 공식 사이트에서 목표 시점이 삭제됐고, 2027년 연기 가능성이 보도되고 있습니다(공식 확정 아님). EU는 정확한 개시일을 <strong>개시 수개월 전에 공지</strong>할 예정이며, 현재는 신청 접수 자체가 시작되지 않았습니다 — 지금 신청을 받는 사이트는 공식이 아닙니다.
          </p>
          <ul className="g-list">
            <li>한국 등 무비자 여행자는 개시 후 출발 전 <strong>온라인 사전 신청</strong>이 필요합니다 (수수료 20유로, <strong>18세 미만·70세 초과는 면제</strong>)</li>
            <li>유효기간은 <strong>3년 또는 여권 만료일 중 빠른 쪽</strong>까지입니다</li>
            <li>개시 후 <strong>최소 6개월의 과도기</strong>(ETIAS 없어도 나머지 입국 요건 충족 시 입국 거부 안 됨)와 <strong>최소 6개월의 유예기간</strong>(과도기 종료 후 첫 입국자만 예외 허용)이 이어져 합계 최소 1년의 완충이 예정되어 있습니다</li>
          </ul>
          <p className="g-note">
            기준: 2026년 7월 · 출처: EU 집행위(home-affairs.ec.europa.eu) · EU 공식 여행정보(travel-europe.europa.eu/etias)
          </p>
        </div>

        {/* 양자 사증면제협정 */}
        <div>
          <h2 className="g-h2">한국과의 양자 사증면제협정 — 90/180일과 별도?</h2>
          <p className="g-p">
            외교부 해외안전여행 안내(2026년 6월 확인) 기준, 아래 <strong>13개국은 한국과의 양자 사증면제협정이 쉥겐 90/180 규칙보다 우선 적용</strong>됩니다. 나머지 16개국(프랑스·스페인·스위스·폴란드 등)은 쉥겐 규칙이 우선입니다.
          </p>
          <p className="g-p">
            <strong>독일 · 네덜란드 · 벨기에 · 오스트리아 · 이탈리아 · 체코 · 몰타 · 덴마크 · 노르웨이 · 스웨덴 · 아이슬란드 · 루마니아 · 리투아니아</strong>
          </p>
          <p className="g-p">
            예를 들어 독일은 주한독일대사관 안내상 <strong>다른 쉥겐국 체류 직후에도 독일에서 90일까지 체류</strong>할 수 있습니다. 알려진 국가별 단서(외교부 0404 알림 기준)는 다음과 같습니다.
          </p>
          <ul className="g-list">
            <li><strong>벨기에</strong> — 90일은 <strong>네덜란드·룩셈부르크 체류와 합산</strong>(베네룩스 합산 90일)</li>
            <li><strong>오스트리아</strong> — 90일 체류 후 출국했다가 바로 재입국하는 것은 <strong>1회에 한해 허용</strong></li>
            <li>우선 적용 여부는 <strong>각국 고유 권한</strong>으로 수시로 변경될 수 있습니다 (외교부가 결정하는 사항이 아님)</li>
          </ul>
          <Callout tone="warn" title="양자협정은 이 계산기에 반영되지 않습니다">
            허용 체류기간과 적용 방식은 <strong>국가별로 다르고 입국 심사는 각국 재량</strong>이므로, 이용 전 반드시 외교부 해외안전여행(0404.go.kr)과 해당국 대사관에서 최신 기준을 확인하세요. 본 계산기는 표준 90/180 규칙만 반영합니다.
          </Callout>
        </div>

        {/* FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 면책 */}
        <Disclaimer variant="default" open>
          본 계산기는 일반적인 90/180 규칙에 따른 <strong>참고용 추정</strong>입니다. 쉥겐 회원국·규정은 변경될 수 있고, 장기비자·거주허가·일부 국가와의 양자협정 등 예외가 있습니다. <strong>최종 입·출국 허가는 현지 입국심사관의 재량</strong>이며, 정확한 판단은 해당국 대사관 또는 EU 공식 쉥겐 계산기로 재확인하세요.
        </Disclaimer>

        {/* 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/timezone', icon: '🕐', name: '시간대 변환기', desc: '현지 시각·시차 확인' },
              { href: '/tools/date/jet-lag', icon: '✈️', name: '시차 적응 계산기', desc: '도착 후 수면 조정' },
              { href: '/tools/life/customs', icon: '🛃', name: '면세 한도 계산기', desc: '귀국 시 세관 신고' },
              { href: '/tools/date/dday', icon: '📅', name: 'D-Day 계산기', desc: '출국·귀국일 카운트' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={{ ...card, display: 'block', textDecoration: 'none', padding: '14px 16px' }}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
