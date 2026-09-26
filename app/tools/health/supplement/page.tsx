import Link from 'next/link'
import SupplementClient from './SupplementClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import Disclaimer from '@/components/Disclaimer'
import ToolPage from '@/components/ToolPage'

export const metadata = buildMetadata({
  path: '/tools/health/supplement',
  title: '영양제 중복 체크 계산기 — 중복 합산·상한·약물 상호작용·임산부 안전',
  description: '복용 중인 영양제 50종 자동 합산 → 상한 초과·약물 상호작용 경고. 오메가3 EPA+DHA, 임산부·고령자 안전 체크.',
  keywords: [
    '영양제중복체크', '영양제성분체크', '영양제같이먹어도되나', '비타민D중복', '영양제상한량',
    '영양제복용조합', '영양제계산기', '오메가3합산', 'EPA DHA',
    '영양제약물상호작용', '임산부영양제', '고령자영양제', '갑상선약철분',
    '항응고제비타민E', 'PPI비타민B12', '센트룸실버', '임산부엽산',
  ],
})

const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}

const FAQ_LD = [
  { q: '종합비타민과 개별 비타민을 같이 먹어도 되나요?', a: '종합비타민에 이미 여러 성분이 들어 있어 개별 비타민을 더하면 같은 성분이 겹칩니다. 특히 비타민A(레티놀)·D·E, 철분, 아연, 셀레늄은 상한량을 넘기기 쉬운 성분입니다. 각 제품 라벨의 성분표를 도구에 입력해 성분별 합계가 상한량 안에 있는지 먼저 확인하세요.' },
  { q: '수용성 비타민은 과잉 섭취해도 괜찮나요?', a: '비타민C·B군 같은 수용성 비타민은 남는 양이 소변으로 빠져 지용성 비타민(A·D·E·K)보다 쌓일 위험이 낮지만, 상한량이 없는 것은 아닙니다. 비타민C는 하루 2,000mg을 넘기면 설사 같은 소화 장애가 흔하고, 비타민B6는 고용량을 오래 먹으면 손발 저림 같은 신경 손상이 보고돼 상한 100mg이 정해져 있습니다. 나이아신(B3)도 보충제 기준 상한 35mg을 넘으면 홍조가 잘 생깁니다.' },
  { q: '영양제와 약을 같이 먹을 때 주의사항은?', a: '비타민E·오메가3 고용량은 혈액 응고를 억제하는 쪽으로 작용해 와파린 같은 항응고제와 겹치고, 비타민K는 와파린 효과를 약하게 만듭니다. 칼슘·마그네슘·철분은 일부 항생제·갑상선약·골다공증약의 흡수를 방해하므로 시간 간격이 필요합니다(갑상선약과 철분·칼슘은 4시간 이상). 본 도구의 「약물·특수 상황」 탭에서 대표적인 조합을 확인할 수 있지만, 처방약을 먹고 있다면 반드시 의사·약사와 상담하세요.' },
  { q: '영양제는 언제 먹는 게 가장 효과적인가요?', a: '지용성 비타민(A·D·E·K)과 오메가3·코엔자임Q10은 지방이 든 식사와 함께 먹을 때 흡수가 잘 됩니다. 철분은 공복에 비타민C와 함께 먹으면 흡수가 올라가지만 속이 쓰리면 식후에 먹어도 됩니다. 칼슘은 한 번에 500mg 이하로 나눠 먹어야 흡수율이 좋습니다. 마그네슘을 저녁에 먹는 사람이 많지만 수면 개선 효과의 근거는 제한적이며, 무엇보다 매일 같은 시간에 꾸준히 먹는 것이 중요합니다.' },
  { q: '상한 섭취량(UL)을 넘으면 바로 위험한가요?', a: '상한 섭취량은 「거의 모든 사람이 매일 먹어도 건강 문제가 생기지 않을 것으로 보는 최대량」입니다. 하루 이틀 넘었다고 곧바로 중독 증상이 나타나는 것은 아니지만, 넘는 상태가 <strong>매일 이어지면</strong> 위험이 커지므로 용량을 줄이는 것이 원칙입니다. 또 마그네슘(350mg)·엽산(1,000μg)·나이아신(35mg)·비타민E 상한은 음식이 아닌 <strong>보충제·강화식품으로 먹는 양</strong>에만 적용되는데, 본 도구는 영양제 성분만 합산하므로 이 성분들은 결과를 그대로 상한과 비교하면 됩니다. 반대로 칼슘·철분·아연 등은 음식 섭취까지 합한 상한이라 식사량을 고려해야 합니다.' },
  { q: '비타민D·E·A의 IU는 mg·μg으로 어떻게 바꾸나요?', a: '영양소마다 환산 계수가 다릅니다. <strong>비타민D는 1μg = 40IU</strong>(1,000IU = 25μg)입니다. <strong>비타민E는 천연형(d-α-토코페롤) 1mg = 1.49IU</strong>, 합성형(dl-α)은 1mg = 2.22IU로, 같은 400IU라도 천연형은 약 268mg, 합성형은 약 180mg입니다. 본 도구는 천연형 기준으로 환산하므로 라벨에 합성형(dl-)이라고 적혀 있으면 실제 mg은 도구 값보다 적습니다. <strong>비타민A(레티놀)는 1IU = 0.3μg</strong>이며, 베타카로틴은 환산 계수가 달라 레티놀 기준인 도구 값과 맞지 않고 비타민A 상한(레티놀 기준)에도 포함되지 않습니다.' },
  { q: '오메가3 EPA와 DHA를 따로 보지 않고 합산해도 되나요?', a: '일반 건강 목적에서는 EPA+DHA 합산으로 보는 것이 보통입니다(WHO·미국심장협회가 참고하는 목표 250~500mg/일, 공식 권장량은 없음). 목적에 따라 비율이 달라질 수 있어, 임신·수유 중에는 DHA를 따로 200mg 이상 챙기라고 권하는 경우가 많습니다. 국내 건강기능식품 기준은 EPA+DHA 하루 0.5~2g이고, FDA는 보충제로 하루 2g(식품 포함 3g)을 넘기지 말라고 권고합니다. 본 도구가 두 성분을 자동으로 더해 구간을 보여 줍니다.' },
  { q: '임산부는 어떤 영양제를 먹어야 하나요?', a: '대개 임산부 전용 종합비타민으로 핵심 성분을 챙기고 산부인과의 안내를 따릅니다. 흔히 권하는 성분은 엽산 600~800μg(신경관 결손 예방, 임신 전부터), 철분 27mg(미국 권장량), 요오드(미국 기준 임신 중 220μg), DHA 200mg 이상, 콜린 450mg입니다. 반대로 레티놀 형태 비타민A 고용량(3,000μg 이상)과 성요한초는 피해야 합니다. 본 도구의 「약물·특수 상황」 탭에서 「임신 중」을 고르면 이 기준으로 다시 확인합니다.' },
  { q: '65세 이상 고령자는 일반 종합비타민으로 충분한가요?', a: '성분에 따라 다릅니다. 나이가 들면 위산이 줄어 음식 속 비타민B12 흡수가 떨어지므로 보충제·강화식품 형태의 B12가 도움이 되고, 비타민D는 미국 기준 71세 이상 800IU로 권장량이 늘어납니다. 칼슘 1,000~1,200mg(미국 기준)은 <strong>음식과 보충제를 합친 총량</strong>이라 보충제로 전부 채울 필요는 없습니다. 비타민E 고용량과, 결핍 진단 없는 철분 보충은 피하는 편이 좋습니다. 복용 약이 많은 연령대라 상호작용도 함께 확인하세요.' },
  { q: '영양제 라벨 보고 입력하기 어려운데 도움이 있나요?', a: '본 도구의 「영양제 등록」 탭 빠른 입력 프리셋에서 종합비타민·비타민D 1,000~5,000IU·오메가3 (rTG)·임산부 종합비타민·프로바이오틱스·글루코사민·콜라겐 등 흔한 제품 구성을 자동 입력할 수 있습니다. 프리셋은 대표적인 함량일 뿐 제품마다 다르니, 라벨의 「1일 섭취량」 기준 성분량으로 고쳐 넣으세요. 하루 2알을 먹는 제품이면 1알이 아니라 2알 기준 함량을 입력해야 합니다.' },
]

export default function SupplementPage() {
  return (
    <ToolPage width={880} slug="/tools/health/supplement">
      <h1 className="tp-h1">
        <ToolIconBadge catId="health" />영양제 중복 체크 계산기
      </h1>
      <p className="tp-lead">
        복용 중인 영양제 50종 자동 합산 → <strong style={{ color: 'var(--text)' }}>상한 초과·약물 상호작용</strong> 경고.
      </p>

      <UpdatedMeta date="2026년 9월" basis="영양소 권장량·상한량(미국 NIH 영양소 섭취기준 중심의 성인 대표값 — 비타민C·B6·칼슘 등 일부 권장량은 한국인 영양소 섭취기준 값) · 오메가3 EPA+DHA 합산 250~500mg 목표·보충제 2,000mg(식품 포함 총 3,000mg) 한도(미국 FDA 권고)" sources={[{ label: 'NIH ODS 영양소 섭취기준(DRI)', href: 'https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx' }, { label: '보건복지부·한국영양학회 (KDRIs)', href: 'https://www.kns.or.kr' }, { label: 'NIH ODS 오메가3', href: 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/' }, { label: 'NIH ODS 셀레늄 (브라질너트 함량)', href: 'https://ods.od.nih.gov/factsheets/Selenium-HealthProfessional/' }, { label: 'NCCIH — 성요한초 상호작용', href: 'https://www.nccih.nih.gov/health/st-johns-wort' }]} />

      <SupplementClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 중복 TOP 5 */}
        <div>
          <h2 className="g-h2">자주 중복되는 성분 TOP 5</h2>
          <p className="g-p">
            영양제를 두세 가지만 먹어도 같은 성분이 여러 제품에 나눠 들어 있는 경우가 많습니다. 본 도구는 제품별 성분을 같은 단위(mg·μg·IU)로 바꿔 합친 뒤 권장량·상한량과 비교합니다. 특히 아래 성분은 이름이 다른 제품에 흔히 겹쳐 들어 있어 라벨을 놓치기 쉽습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { rank: '1', name: '비타민D',   desc: '종합비타민 + 비타민D 단독 + 칼슘·비타민D 복합제에 모두 포함' },
              { rank: '2', name: '비타민C',   desc: '종합비타민 + 비타민C 단독 + 콜라겐·피부 제품에 포함' },
              { rank: '3', name: '아연',      desc: '종합비타민 + 면역 제품 + 남성 건강 제품에 포함' },
              { rank: '4', name: '엽산',      desc: '종합비타민 + 임산부용 + 비타민B 복합체에 포함' },
              { rank: '5', name: '마그네슘',  desc: '종합비타민 + 수면 보조 + 근육 이완 제품에 포함' },
            ].map((item) => (
              <div key={item.rank} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 800, color: 'var(--accent-ink)', minWidth: '26px' }}>{item.rank}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. RDA/UL 표 */}
        <div>
          <h2 className="g-h2">주요 영양소 1일 권장량 & 상한 섭취량</h2>
          <p className="g-p">
            미국 NIH 영양소 섭취기준(DRI) 중심의 성인 대표값입니다. 비타민C·B6·칼슘 권장량은 한국인 영양소 섭취기준 값이며, 그 밖의 성분은 한국 기준(보건복지부, 2025 개정)과 다를 수 있고 성별·연령에 따라서도 달라집니다.
            범위로 적은 성분은 도구가 낮은 쪽 값을 권장량으로 씁니다. <strong>상한량을 넘는 성분이 있으면 도구가 경고</strong>하므로, 결과를 볼 때는 권장량 달성률보다 상한 초과 여부를 먼저 확인하세요.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', overflow: 'hidden' }}>
            <div className="tableScroll">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                <thead>
                  <tr>
                    <th scope="col" style={headCell}>영양소</th>
                    <th scope="col" style={headCell}>권장량</th>
                    <th scope="col" style={headCell}>상한량</th>
                    <th scope="col" style={headCell}>초과 주의사항</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['비타민A', '700~900μg', '3,000μg', '간 독성, 임신 초기 기형 위험 (레티놀 기준)'],
                    ['비타민D', '600IU',   '4,000IU', '고칼슘혈증, 신장 결석'],
                    ['비타민C', '100mg',   '2,000mg', '설사 등 소화 장애, 신장 결석'],
                    ['비타민E', '15mg',    '1,000mg', '출혈 위험 증가 (보충제 기준)'],
                    ['비타민B6','1.5mg',   '100mg',   '신경 손상 (고용량 장기)'],
                    ['엽산',    '400μg',   '1,000μg', 'B12 결핍 마스킹 (보충제 기준)'],
                    ['철분',    '8~18mg',  '45mg',    '소화 장애, 장기 과잉 시 장기 손상'],
                    ['아연',    '8~11mg',  '40mg',    '구리 결핍, 면역 저하'],
                    ['셀레늄',  '55μg',    '400μg',   '탈모, 손발톱 변형'],
                    ['칼슘',    '800mg',   '2,500mg', '신장 결석, 변비'],
                    ['마그네슘','310~420mg', '350mg', '설사 (보충제 기준 상한)'],
                    ['요오드',  '150μg',   '1,100μg', '갑상선 기능 이상'],
                  ].map((row, i, arr) => (
                    <tr key={row[0]}>
                      <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontWeight: 600, color: 'var(--text)' }}>{row[0]}</td>
                      <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-sans)' }}>{row[1]}</td>
                      <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, fontFamily: 'var(--font-sans)', color: 'var(--warning)', fontWeight: 600 }}>{row[2]}</td>
                      <td style={{ ...cell, borderBottom: i === arr.length - 1 ? 'none' : cell.borderBottom, color: 'var(--muted)', fontSize: 12 }}>{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 「보충제 기준」 표시 성분(비타민E·엽산·마그네슘 등)은 음식이 아닌 영양제·강화식품으로 먹는 양에만 상한이 적용됩니다. 마그네슘은 권장량 범위가 보충제 상한과 겹쳐 보이지만, 권장량은 음식 포함 총량이고 상한은 보충제만의 양이라 서로 다른 기준입니다.
          </p>
        </div>

        {/* 3. 복용 타이밍 */}
        <div>
          <h2 className="g-h2">복용 타이밍 가이드</h2>
          <p className="g-p">
            영양제 흡수는 「몇 시에 먹느냐」보다 <strong>무엇과 함께 먹느냐</strong>에 더 크게 좌우됩니다. 근거가 비교적 분명한 원칙만 추렸습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
            {[
              {
                title: '식사와 함께 (지용성)',
                items: ['비타민 A·D·E·K', '오메가3(EPA/DHA)', '코엔자임Q10', '루테인·지아잔틴'],
                tip: '지방이 든 식사와 함께 먹어야 흡수가 잘 됩니다',
              },
              {
                title: '공복 또는 식전',
                items: ['철분 (비타민C와 함께면 흡수 ↑)', '갑상선약 복용자는 약을 먼저, 미네랄은 4시간 뒤'],
                tip: '철분 때문에 속이 쓰리면 식후에 먹어도 됩니다 (흡수는 다소 감소)',
              },
              {
                title: '나눠서 먹기',
                items: ['칼슘 — 한 번에 500mg 이하', '마그네슘 고용량 — 설사가 나면 나눠서'],
                tip: '칼슘은 한 번에 많이 먹을수록 흡수율이 떨어집니다',
              },
              {
                title: '시간보다 꾸준함',
                items: ['비타민B군·비타민C (수용성)', '프로바이오틱스 — 제품 라벨의 권장 시점'],
                tip: '매일 같은 때에 먹는 습관이 효과를 좌우합니다',
              },
            ].map((item) => (
              <div key={item.title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-ink)', marginBottom: '8px' }}>{item.title}</p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.items.map((t) => (
                    <li key={t} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>• {t}</li>
                  ))}
                </ul>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border)', lineHeight: 1.6 }}>{item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. 주의 조합 5 */}
        <div>
          <h2 className="g-h2">주의해야 할 조합 5가지</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { pair: '철분 + 칼슘',            text: '칼슘이 철분 흡수를 방해합니다. 둘 다 먹는다면 2시간 이상 간격을 두세요.' },
              { pair: '아연 고용량 + 구리',      text: '아연을 상한(40mg) 가까이 오래 먹으면 구리 흡수가 막혀 구리 결핍성 빈혈이 생길 수 있습니다. 아연:구리 비율 약 8~15:1이 흔히 권장됩니다.' },
              { pair: '비타민E 고용량 + 항응고제', text: '출혈 위험이 커집니다. 와파린·아스피린 등을 복용 중이라면 비타민E 고용량 제품은 의사와 상의하세요.' },
              { pair: '셀레늄 보충제 + 브라질너트', text: '브라질너트는 1알에 평균 약 70~90μg(편차 큼)으로 한 알이 이미 권장량(55μg)을 넘습니다. 셀레늄 200μg 보충제에 몇 알만 더해도 상한 400μg에 가까워집니다.' },
              { pair: '엽산 고용량 + 비타민B12 부족', text: '엽산이 B12 결핍으로 생기는 빈혈을 가려, 신경 손상이 늦게 발견될 수 있습니다. 50세 이상·채식·위산억제제나 메트포르민 복용자는 B12 상태도 함께 확인하세요.' },
            ].map((item) => (
              <div key={item.pair} style={{ background: 'var(--warning-soft)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--warning)', marginBottom: '4px' }}>{item.pair}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.7 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 오메가3 EPA + DHA 합산 가이드 */}
        <div>
          <h2 className="g-h2">오메가3 EPA + DHA 합산 가이드</h2>
          <p className="g-p">
            오메가3는 EPA + DHA <strong>합산</strong>으로 보는 게 일반적입니다(EPA·DHA는 ALA와 달리 <strong>공식 권장량(RDA)이 설정돼 있지 않습니다 — NIH ODS</strong>).
            제품 앞면의 「오메가3 1,000mg」은 보통 어유 전체 무게라서, 실제 EPA+DHA는 뒷면 성분표에서 따로 확인해야 합니다. 본 도구의 「성분 분석」 탭은 두 값을 자동으로 더해 아래 구간으로 보여 줍니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={headCell}>EPA + DHA 합산</th>
                  <th scope="col" style={headCell}>구간</th>
                  <th scope="col" style={headCell}>설명</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>250mg 미만</td><td style={cell}><strong style={{ color: 'var(--warning)' }}>목표 미달</strong></td><td style={cell}>식사(등푸른 생선) 보충 고려</td></tr>
                <tr><td style={cell}>250~500mg</td><td style={cell}><strong style={{ color: 'var(--success)' }}>목표 범위</strong></td><td style={cell}>WHO·심장협회 참고 목표 (공식 RDA 미설정)</td></tr>
                <tr><td style={cell}>500~2,000mg</td><td style={cell}><strong style={{ color: 'var(--warning)' }}>목표보다 높음</strong></td><td style={cell}>심혈관 목적 고용량은 의사 상담</td></tr>
                <tr><td style={cell}>2,000~3,000mg</td><td style={cell}><strong style={{ color: 'var(--warning)' }}>보충제 권고 한도 초과</strong></td><td style={cell}>FDA 보충제 권고 한도(2,000mg) 초과 — 용량 조정·의사 상담</td></tr>
                <tr><td style={cell}>3,000mg 초과</td><td style={cell}><strong style={{ color: 'var(--danger)' }}>권고 한도 초과</strong></td><td style={cell}>FDA 권고 한도(식품 포함 총 3,000mg) 초과 — 출혈 위험 ↑</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 예: 「EPA 360mg + DHA 240mg」 제품 1캡슐이면 합산 600mg으로 「목표보다 높음」, 하루 2캡슐이면 1,200mg입니다. FDA는 건강 효과 근거가 제한적이라 보고 보충제 기준 2,000mg/일(총 3,000mg) 이하를 권고하며, 국내 건강기능식품 기준은 하루 0.5~2g입니다. rTG 형태가 EE 형태보다 흡수가 잘 된다는 연구가 있고, EE 형태는 특히 지방이 든 식사와 함께 먹을 때 흡수가 좋아집니다.
          </p>
        </div>

        {/* 6. 약물별 영양제 주의 */}
        <div>
          <h2 className="g-h2">약물별 영양제 주의 가이드</h2>
          <p className="g-p">
            처방약을 먹는 중에는 영양제가 약의 흡수를 막거나 효과를 바꿀 수 있습니다. 본 도구의 「약물·특수 상황」 탭에서 약물을 고르면 등록한 영양제와 자동으로 맞춰 봅니다. 아래 표는 그중 대표적인 조합이며, 간격 시간은 미국 NIH 영양보충제국(ODS) 자료 등에서 흔히 권하는 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={headCell}>약물</th>
                  <th scope="col" style={headCell}>주의 영양제</th>
                  <th scope="col" style={headCell}>대응</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>와파린</td><td style={cell}>비타민K</td><td style={cell}>약효를 약하게 함 → 갑자기 늘리거나 끊지 말고 주치의와 상의</td></tr>
                <tr><td style={cell}>항응고·항혈소판제 (와파린·아스피린·클로피도그렐)</td><td style={cell}>비타민E 고용량·오메가3 고용량·강황</td><td style={cell}>출혈 위험 ↑ → 의사 상담</td></tr>
                <tr><td style={cell}>갑상선약 (레보티록신)</td><td style={cell}>철분·칼슘·마그네슘</td><td style={cell}>흡수 크게 방해 → 4시간 간격</td></tr>
                <tr><td style={cell}>항생제 (테트라사이클린·퀴놀론계)</td><td style={cell}>칼슘·마그네슘·철분·아연</td><td style={cell}>항생제를 2시간 먼저, 또는 영양제 4~6시간 뒤</td></tr>
                <tr><td style={cell}>골다공증약 (비스포스포네이트)</td><td style={cell}>칼슘·철분·마그네슘</td><td style={cell}>약 복용 후 2시간 이상 지나서</td></tr>
                <tr><td style={cell}>혈압약 (ACE억제제·ARB)</td><td style={cell}>칼륨</td><td style={cell}>고칼륨혈증 위험 → 주치의 상담</td></tr>
                <tr><td style={cell}>당뇨약</td><td style={cell}>크롬·알파리포산</td><td style={cell}>혈당 변화 가능 → 혈당 모니터링</td></tr>
                <tr><td style={cell}>위산억제제 (PPI)</td><td style={cell}>비타민B12·철분·칼슘·마그네슘</td><td style={cell}>장기 복용 시 결핍 가능 → 주기적 검사</td></tr>
                <tr><td style={cell}>콜레스테롤약 (스타틴)</td><td style={cell}>코엔자임Q10 / 고용량 나이아신</td><td style={cell}>CoQ10은 대체로 안전하나 근육통 개선 근거는 엇갈림 / 고용량 나이아신 병용은 근육 부작용 주의</td></tr>
                <tr><td style={cell}>항우울제 (SSRI 등)</td><td style={cell}>성요한초(세인트존스워트)</td><td style={cell}>세로토닌 증후군 위험 → 함께 먹지 않기</td></tr>
                <tr><td style={cell}>경구 피임약·일부 처방약</td><td style={cell}>성요한초(세인트존스워트)</td><td style={cell}>약효를 떨어뜨림 → 복용 전 약사 확인</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 가장 흔한 패턴만 담았습니다. 성요한초는 본 도구의 성분 목록에 없으므로 복용 중이라면 약사에게 직접 알리세요. 정확한 평가는 단골 약사·주치의 상담이 필요합니다.
          </p>
        </div>

        {/* 7. 임산부·수유부 가이드 */}
        <div>
          <h2 className="g-h2">임산부·수유부 영양제 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--success-soft)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--success)', fontWeight: 700, marginBottom: 8 }}>임신 시 흔히 권하는 성분</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.85, color: 'var(--text-body)' }}>
                <li>엽산 600~800μg (신경관 결손 예방, 임신 전부터)</li>
                <li>철분 27mg (미국 권장량, 빈혈 예방)</li>
                <li>요오드 — 미국 기준 임신 중 220μg. 해조류를 자주 먹으면 이미 충분할 수 있어 보충 전 상담</li>
                <li>DHA 200mg 이상 (태아 뇌·시각)</li>
                <li>콜린 450mg (뇌 발달)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--danger-soft)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>임신 시 주의</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.85, color: 'var(--text-body)' }}>
                <li>레티놀 형태 비타민A 고용량 (3,000μg 이상) — 임신 초기 기형 위험. 베타카로틴 형태 제품으로</li>
                <li>비타민D 상한 4,000IU 초과 — 고칼슘혈증 위험</li>
                <li>성요한초 — 임신 중 안전성 미입증</li>
                <li>카페인 200mg/일 미만 (아메리카노 Tall 약 1.3잔)</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ※ 임산부 전용 종합비타민을 먹는다면 여기에 엽산·철분 단일제를 더할 때 중복을 꼭 확인하세요. 본 도구의 「약물·특수 상황」 탭에서 「임신 중」을 고르면 엽산 상한(1,000μg)·비타민A 상한 기준으로 다시 확인합니다. 산부인과 상담이 우선입니다.
          </p>
        </div>

        {/* 8. 고령자(65세+) 가이드 */}
        <div>
          <h2 className="g-h2">65세 이상 고령자 영양제 가이드</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--success-soft)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--success)', fontWeight: 700, marginBottom: 8 }}>부족해지기 쉬운 성분</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.85, color: 'var(--text-body)' }}>
                <li>비타민D 800~1,000IU (미국 기준 71세 이상 800IU)</li>
                <li>칼슘 — 음식 포함 총량 1,000~1,200mg (미국 기준), 보충제는 부족분만</li>
                <li>비타민B12 2.4μg 이상 — 위산 감소로 음식 속 B12 흡수가 떨어짐</li>
                <li>오메가3 EPA+DHA 250mg 이상 (생선을 잘 안 먹는 경우)</li>
                <li>마그네슘 (식사량이 줄면 부족해지기 쉬움)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--danger-soft)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
              <p style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>고령자 주의</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, lineHeight: 1.85, color: 'var(--text-body)' }}>
                <li>비타민E 400IU 초과 고용량 (출혈 위험)</li>
                <li>철분 — 결핍 진단이 없으면 철분 함유 제품은 피하기 (철 과잉 위험)</li>
                <li>복용 약이 많아 상호작용 가능성 ↑ — 약 목록을 약사에게 보여 주기</li>
                <li>신장 기능이 떨어졌다면 마그네슘·칼륨 보충은 의사와 상의</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 9. 함께 먹으면 좋다는 조합 — 근거 수준 */}
        <div>
          <h2 className="g-h2">「같이 먹으면 좋다」는 조합, 근거는 얼마나 있나</h2>
          <p className="g-p">
            영양제 광고에서 흔히 말하는 「시너지 조합」은 근거 수준이 제각각입니다. 흡수·작용 원리가 분명한 조합과, 연구가 부족하거나 대규모 시험에서 효과가 없던 조합을 구분해 두면 불필요한 제품을 덜 사게 됩니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={headCell}>조합</th>
                  <th scope="col" style={headCell}>근거 수준</th>
                  <th scope="col" style={headCell}>설명</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={cell}>비타민D + 칼슘</td><td style={cell}><strong style={{ color: 'var(--success)' }}>원리 확립</strong></td><td style={cell}>비타민D가 장에서 칼슘 흡수를 돕습니다. 비타민D가 부족하면 칼슘을 먹어도 흡수가 떨어집니다.</td></tr>
                <tr><td style={cell}>비타민C + 철분</td><td style={cell}><strong style={{ color: 'var(--success)' }}>원리 확립</strong></td><td style={cell}>비타민C가 식물성·보충제 철(비헴철)의 흡수를 높입니다. 같은 끼니에 먹어야 효과가 있습니다.</td></tr>
                <tr><td style={cell}>지용성 비타민·오메가3 + 식사</td><td style={cell}><strong style={{ color: 'var(--success)' }}>원리 확립</strong></td><td style={cell}>지방이 든 식사와 함께 먹을 때 흡수가 잘 됩니다.</td></tr>
                <tr><td style={cell}>비타민B12 + 엽산</td><td style={cell}><strong style={{ color: 'var(--accent-ink)' }}>역할 보완</strong></td><td style={cell}>둘 다 적혈구 생성에 필요합니다. 다만 엽산만 많이 먹으면 B12 결핍을 가릴 수 있습니다.</td></tr>
                <tr><td style={cell}>아연 + 비타민C</td><td style={cell}><strong style={{ color: 'var(--warning)' }}>근거 엇갈림</strong></td><td style={cell}>감기 기간 단축 연구가 있으나 결과가 일관되지 않습니다. 아연 고용량 장기 복용은 구리 결핍 위험이 있습니다.</td></tr>
                <tr><td style={cell}>마그네슘 + 비타민B6</td><td style={cell}><strong style={{ color: 'var(--warning)' }}>근거 제한적</strong></td><td style={cell}>소규모 연구 위주로, 꼭 함께 먹어야 할 이유로 보기는 어렵습니다.</td></tr>
                <tr><td style={cell}>비타민E + 셀레늄</td><td style={cell}><strong style={{ color: 'var(--danger)' }}>대규모 시험서 효과 없음</strong></td><td style={cell}>3만 5천여 명이 참여한 SELECT 시험에서 전립선암 예방 효과가 없었고, 비타민E 단독군은 오히려 전립선암이 약간 늘었습니다.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 10. FAQ */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* 11. 면책 */}
        <div>
          <Disclaimer
            variant="medical"
            open
            sources={[
              { label: '보건복지부·한국영양학회 — 한국인 영양소 섭취기준(KDRIs)', href: 'https://www.kns.or.kr' },
              { label: 'NIH Office of Dietary Supplements', href: 'https://ods.od.nih.gov' },
            ]}
          >
            본 도구는 공개된 섭취 기준(미국 NIH ODS 기준 중심, 한국인 영양소 섭취기준 일부 병행)을 바탕으로 <strong>성분 합산량을 정리하는 참고용</strong>이며, 영양제는 의약품이 아니고 본 도구도 처방·진단 도구가 아닙니다.
            약물 상호작용 표는 <strong>대표적인 패턴만</strong> 담고 있어 개인의 질환·처방약 조합을 모두 반영하지 못합니다.
            영양제 시작·중단·용량 변경 전, 특히 처방약 복용 중·임신·수유·기저질환이 있다면 반드시 의사·약사와 상담하세요.
          </Disclaimer>
        </div>

        {/* 12. 관련 도구 */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/health/bmr',  emoji: '🔥', name: '기초대사량 계산기', desc: '하루 칼로리 관리' },
              { href: '/tools/health/bmi',  emoji: '⚖️', name: 'BMI 계산기',        desc: '체질량지수 확인' },
              { href: '/tools/cooking/nuts', emoji: '🌰', name: '견과류 섭취량 계산기', desc: '영양소 일일 기준' },
              { href: '/tools/health/caffeine', emoji: '☕', name: '카페인 잔존량 트래커', desc: '임신 중 카페인 한도 확인' },
            ].map((t) => (
              <Link key={t.href} href={t.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>{t.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
