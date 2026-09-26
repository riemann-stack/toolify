import Link from 'next/link'
import KinshipClient from './KinshipClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { PRESETS, resolvePath, pick, isLegalRelative } from './kinshipData'

export const metadata = buildMetadata({
  path: '/tools/life/kinship',
  title: '가족 호칭 계산기 — 촌수·호칭어·지칭어와 가계도',
  description: '아버지의 사촌은? 처형의 남편은? 관계를 버튼으로 따라가면 호칭어·지칭어·촌수와 가계도가 자동으로. 시가·처가·사돈까지, 국립국어원 표준 언어 예절 기준.',
  keywords: ['가족 호칭 계산기', '호칭 계산기', '촌수 계산기', '가족 호칭 정리', '명절 호칭', '시댁 호칭', '처가 호칭', '사돈 호칭', '가계도', '당숙'],
})

const FAQ_LD = [
  { q: '촌수는 어떻게 세나요?', a: '<strong>부모-자식 사이가 1촌</strong>이고, 공통 조상까지 올라갔다 내려오며 한 단계마다 1씩 더합니다(민법 제770조). 형제자매는 부모(1촌)를 거치므로 2촌, 부모의 형제는 3촌, 그 자녀(사촌)는 4촌, 아버지의 사촌(당숙)은 5촌, 당숙의 자녀(재종형제)는 6촌입니다. 배우자는 촌수를 따지지 않으며(흔히 「무촌」), 인척의 촌수는 두 갈래입니다 — <strong>배우자의 혈족</strong>(시부모·처남 등)은 배우자의 촌수를, <strong>혈족의 배우자</strong>(형수·큰어머니 등)는 그 혈족의 촌수를 그대로 따릅니다(제771조).' },
  { q: '아버지의 사촌은 뭐라고 부르나요?', a: '<strong>당숙(堂叔)</strong>입니다(어머니 쪽이면 외당숙, 여성이면 당고모). 5촌 혈족이라 「오촌 아저씨」라고도 하며, 부를 때는 <strong>아저씨</strong> 또는 <strong>당숙</strong>을 씁니다(표준국어대사전 용례 기준). 당숙의 자녀는 재종형제(육촌)입니다.' },
  { q: '사촌의 아들은 뭐라고 하나요?', a: '사촌 형제(남자 사촌)의 아들이 <strong>당질(堂姪)</strong>, 딸이 당질녀입니다. 5촌 혈족이며, 일상에서는 넓게 「조카」라고 부르는 경우가 많지만 정확한 지칭은 당질입니다. 반대로 당질에게 나는 당숙(여성이면 당고모)입니다. 사촌 자매(여자 사촌)의 자녀를 이르는 별도의 표준 표제어는 없습니다.' },
  { q: '결혼한 삼촌을 계속 삼촌이라고 불러도 되나요?', a: '됩니다. 『표준 언어 예절』(2011)은 아버지의 남동생을 <strong>기혼·미혼과 관계없이 「작은아버지」·「아저씨」·「삼촌」</strong>으로 부를 수 있다고 안내합니다. 「결혼 전엔 삼촌, 결혼 후엔 작은아버지」 구분은 1992년 표준 화법의 옛 기준으로 2011년 개정에서 사라졌습니다. 관용적으로는 미혼이면 삼촌, 기혼이면 작은아버지가 우세합니다(표준국어대사전).' },
  { q: '도련님·아가씨는 꼭 써야 하나요?', a: '『표준 언어 예절』(2011)의 전통 호칭은 남편의 남동생을 <strong>도련님(미혼)·서방님(기혼)</strong>, 남편의 여동생을 <strong>아가씨</strong>로 부르는 것입니다. 국립국어원이 2020년 발간한 『우리, 뭐라고 부를까요?』는 이런 호칭에 부담을 느끼는 언어 현실을 반영해 <strong>이름에 씨를 붙여 부르는 등 가족이 합의한 호칭도 쓸 수 있다</strong>는 안내를 담고 있습니다. 이 도구는 표준 호칭을 기본으로, 2020 안내를 병기합니다.' },
  { q: '호칭어와 지칭어는 무엇이 다른가요?', a: '<strong>호칭어는 그 사람을 직접 부를 때</strong>, <strong>지칭어는 남에게 그 사람을 말할 때</strong> 씁니다. 예를 들어 남편의 형은 부를 때 「아주버님」(호칭어)이지만 남에게는 「시아주버니」(지칭어)라고 말합니다. 누나의 아들은 부를 때 이름을 부르지만 전통 지칭은 「생질」입니다.' },
  { q: '민법에서 친족은 몇 촌까지인가요?', a: '민법 제777조는 <strong>8촌 이내의 혈족, 4촌 이내의 인척, 배우자</strong>를 친족으로 규정합니다. 혼인은 8촌 이내 혈족 사이에서 금지됩니다(제809조 제1항). 사돈(자녀 배우자의 부모)은 혈족도 인척도 아니어서 민법상 친족이 아닙니다.' },
  { q: '외할아버지를 그냥 할아버지라고 불러도 되나요?', a: '됩니다. 이미 『표준 언어 예절』(2011)부터 <strong>외가 조부모도 「할아버지·할머니」로 부를 수 있다</strong>고 안내했고(구별이 필요할 때만 「외-」), 2020년 안내서도 이를 재확인합니다. 구분이 필요할 때 지역 이름을 붙여(부산 할아버지) 부르는 방식도 널리 쓰입니다.' },
  { q: '처형의 남편, 처제의 남편은 뭐라고 부르나요?', a: '둘 다 나와 <strong>동서</strong> 관계입니다. 처형의 남편이 나보다 연상이면 <strong>형님</strong>, 처제의 남편은 <strong>동서</strong> 또는 「○ 서방」으로 부르는 것이 표준 언어 예절의 안내입니다. 아내 쪽 동서 사이 서열은 나이 기준이라는 점이 남편 쪽(남편 형제 서열 기준)과 다릅니다.' },
]

/* 계산기와 같은 함수(resolvePath·pick·isLegalRelative)로 빌드 시 계산 — 표와 도구 결과가 어긋나지 않게 */
const PRESET_ROWS = PRESETS.map((p) => {
  const g = p.gender ?? 'male'
  const node = resolvePath(p.steps, g).node
  if (!node) return null
  return {
    label: p.label,
    speaker: p.gender === 'female' ? '여성' : p.gender === 'male' ? '남성' : '남성(기본)',
    call: pick(node.call, g),
    ref: node.ref ?? '—',
    chon: node.chon === null ? (node.kind === 'spouse' ? '무촌' : '—') : `${node.chon}촌`,
    legal: isLegalRelative(node).basis,
  }
}).filter((r): r is NonNullable<typeof r> => r !== null)

/* 민법 조문(국가법령정보센터 현행) — 촌수·친족 범위가 실제로 쓰이는 곳 */
const LAW_ROWS = [
  { k: '친족의 범위', v: '8촌 이내 혈족 · 4촌 이내 인척 · 배우자', law: '제777조' },
  { k: '인척이란', v: '혈족의 배우자 · 배우자의 혈족 · 배우자의 혈족의 배우자', law: '제769조' },
  { k: '혼인 금지', v: '8촌 이내 혈족(친양자 입양 전 혈족 포함) / 6촌 이내 혈족의 배우자, 배우자의 6촌 이내 혈족, 배우자의 4촌 이내 혈족의 배우자인 인척(이었던 사람 포함)', law: '제809조' },
  { k: '상속 순위', v: '① 직계비속 ② 직계존속 ③ 형제자매 ④ 4촌 이내 방계혈족 — 배우자는 ①·②와 같은 순위로 공동상속, 없으면 단독상속', law: '제1000조 · 제1003조' },
  { k: '부양 의무', v: '직계혈족 및 그 배우자 사이 · 생계를 같이하는 그 밖의 친족 사이', law: '제974조' },
]

export default function KinshipPage() {
  return (
    <ToolPage width={760} slug="/tools/life/kinship">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />가족 호칭 계산기
      </h1>
      <p className="tp-lead">
        관계를 따라가면 <strong style={{ color: 'var(--text)' }}>호칭어·지칭어·촌수와 가계도</strong>가 자동으로. 시가·처가·사돈까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="국립국어원 『표준 언어 예절』(2011) 가정에서의 호칭·지칭 + 『우리, 뭐라고 부를까요?』(2020) 안내 · 촌수·친족 범위는 민법 제767~777조(현행)"
        sources={[
          { label: '국립국어원 표준 언어 예절(2011) — 가정에서의 호칭, 지칭', href: 'https://www.korean.go.kr/front/reportData/reportDataView.do?mn_id=207&report_seq=772' },
          { label: '국립국어원 우리, 뭐라고 부를까요?(2020)', href: 'https://www.korean.go.kr/front/etcData/etcDataView.do?mn_id=208&etc_seq=648' },
          { label: '민법 제777조(친족의 범위)', href: 'https://www.law.go.kr/법령/민법/제777조' },
          { label: '민법 제1000조(상속의 순위)', href: 'https://www.law.go.kr/법령/민법/제1000조' },
        ]}
      />

      <KinshipClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 호칭어 vs 지칭어 ── */}
        <div>
          <h2 className="g-h2">
            호칭어와 지칭어 — 부를 때와 말할 때
          </h2>
          <p className="g-p">
            한국어 가족 표현은 <strong>호칭어</strong>(그 사람을 직접 부를 때)와
            {' '}<strong>지칭어</strong>(남에게 그 사람을 말할 때)가 다른 경우가 많습니다.
            이 도구는 두 가지를 구분해 보여줍니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['관계', '호칭어 (부를 때)', '지칭어 (남에게)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '남편의 형', c: '아주버님', j: '시아주버니' },
                  { r: '형의 아내 (남성)', c: '형수님', j: '형수' },
                  { r: '오빠의 아내 (여성)', c: '(새)언니', j: '올케' },
                  { r: '누나의 아들', c: '이름', j: '조카 (전통: 생질)' },
                  { r: '아들의 아내', c: '아가·새아가', j: '며느리' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{row.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted-strong)' }}>{row.j}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 1-2. 결과 읽는 법 (계산기 함수로 빌드 시 계산한 예시) ── */}
        <div>
          <h2 className="g-h2">계산기 결과 읽는 법 — 경로·촌수·친족 여부</h2>
          <p className="g-p">
            먼저 나의 성별을 고른 뒤 아버지·어머니·형제·자녀·배우자 버튼을 눌러 <strong>나에서 출발해 한 사람씩</strong> 관계를 따라갑니다.
            「아버지의 사촌」이라면 아버지 → 아버지 → 형 → 아들 순서로 할아버지를 거쳐 내려오는 식이며, 경로는 최대 5단계까지 이어 붙일 수 있습니다.
            국립국어원 자료에 표준 호칭이 정해져 있지 않은 경로는 버튼이 비활성으로 바뀌어, 근거 없는 호칭을 지어내지 않습니다.
            남편은 여성 화자, 아내는 남성 화자로 시작할 때만 누를 수 있고, 형·오빠나 누나·언니는 바로 앞 사람의 성별에 맞춰 자동으로 바뀝니다.
          </p>
          <p className="g-p">
            결과 카드에는 부를 때 쓰는 <strong>호칭어</strong>, 남에게 말할 때의 <strong>지칭어</strong>, 촌수, 그 사람이 나를 부르는 말,
            그리고 민법 제777조 기준 친족인지가 함께 나옵니다. 처남·사촌처럼 나이에 따라 부르는 말이 갈리는 관계는 연상·연하를 나눠 보여 줍니다.
            아래 표는 자주 찾는 관계를 계산기와 같은 데이터로 미리 풀어 둔 것입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['관계 경로', '화자', '호칭어', '지칭어', '촌수', '민법상 친족'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRESET_ROWS.map((row, i) => (
                  <tr key={row.label} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row.label}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted-strong)' }}>{row.speaker}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{row.call}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted-strong)' }}>{row.ref}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{row.chon}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted-strong)', fontSize: 12 }}>{row.legal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 촌수 계산법 ── */}
        <div>
          <h2 className="g-h2">
            촌수 계산법 — 민법 제770조
          </h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
            padding: '18px 20px', fontFamily: 'var(--font-mono)',
            fontSize: '13px', color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div>부모 ↔ 자식 = <strong style={{ color: 'var(--accent-ink)' }}>1촌</strong></div>
            <div>공통 조상까지 <span style={{ color: 'var(--accent-ink)' }}>올라간 수</span> + <span style={{ color: 'var(--accent-ink)' }}>내려온 수</span> = 촌수</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>
              형제 = 나→부모(1) + 부모→형제(1) = 2촌<br />
              사촌 = 나→조부모(2) + 조부모→사촌(2) = 4촌<br />
              당숙 = 나→증조(3) + 증조→당숙(2) = 5촌
            </div>
            <div style={{ marginTop: 6 }}>배우자 = <strong style={{ color: 'var(--accent-ink)' }}>무촌</strong>(관용) · 인척 = 배우자의 혈족은 <strong style={{ color: 'var(--accent-ink)' }}>배우자의 촌수</strong>, 혈족의 배우자는 <strong style={{ color: 'var(--accent-ink)' }}>그 혈족의 촌수</strong> (제771조)</div>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            직계는 세대 수가 곧 촌수라서 할아버지는 2촌, 증조할아버지는 3촌입니다. 방계는 공통 조상을 찾는 것이 핵심인데,
            외사촌·이종사촌도 공통 조상이 외조부모일 뿐 계산은 같아 친사촌과 똑같이 4촌입니다.
            흔한 착각은 「사촌의 자녀는 육촌」이라는 것인데, 사촌의 자녀는 한 세대만 더 내려가므로 5촌(당질)이고, 육촌은 당숙의 자녀(재종형제)입니다.
          </p>
        </div>

        {/* ── 2-2. 촌수가 법적으로 쓰이는 곳 ── */}
        <div>
          <h2 className="g-h2">촌수가 법적으로 쓰이는 곳 — 친족·혼인·상속·부양</h2>
          <p className="g-p">
            촌수는 명절 호칭에만 쓰이는 말이 아니라 민법이 친족의 범위와 권리·의무를 가르는 기준입니다.
            다만 조문마다 범위가 달라서 「몇 촌까지 친족」이라는 한 가지 숫자로 모든 문제를 판단할 수는 없습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['구분', '범위', '민법'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LAW_ROWS.map((row, i) => (
                  <tr key={row.k} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600, whiteSpace: 'nowrap' }}>{row.k}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted-strong)', lineHeight: 1.6 }}>{row.v}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }}>{row.law}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            예를 들어 조카·삼촌·고모·이모(3촌)와 사촌(4촌)은 앞 순위 상속인이 없을 때 4순위 상속인이 될 수 있지만,
            당숙(5촌)이나 육촌은 민법상 친족이면서도 상속인은 되지 않습니다. 사돈(자녀 배우자의 부모)은 1990년 개정으로 「혈족의 배우자의 혈족」이 인척에서 빠지면서 지금은 혈족도 인척도 아니므로 민법상 친족이 아닙니다.
            상속 포기, 부양료 청구, 혼인 가능 여부처럼 실제 권리가 걸린 문제는 이 표만으로 결론 내리지 말고 가정법원 절차 안내나 변호사·법무사 상담으로 확인하세요.
          </p>
        </div>

        {/* ── 3. 친가·외가 표 ── */}
        <div>
          <h2 className="g-h2">
            친가·외가 호칭 한눈에
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['관계', '호칭', '한자 지칭', '촌수'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i >= 3 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '아버지의 형 / 아내', c: '큰아버지 / 큰어머니', h: '백부 / 백모 (맏형만)', n: '3촌' },
                  { r: '아버지의 남동생 / 아내', c: '작은아버지·삼촌 / 작은어머니', h: '숙부 / 숙모', n: '3촌' },
                  { r: '아버지의 자매 / 남편', c: '고모 / 고모부', h: '고모 / 고모부', n: '3촌' },
                  { r: '어머니의 형제 / 아내', c: '외삼촌 / 외숙모', h: '외숙 / 외숙모', n: '3촌' },
                  { r: '어머니의 자매 / 남편', c: '이모 / 이모부', h: '이모 / 이모부', n: '3촌' },
                  { r: '큰·작은아버지의 자녀', c: '사촌', h: '종형제·종자매', n: '4촌' },
                  { r: '고모의 자녀', c: '고종사촌', h: '내종형제', n: '4촌' },
                  { r: '외삼촌의 자녀', c: '외사촌', h: '외종형제', n: '4촌' },
                  { r: '이모의 자녀', c: '이종사촌', h: '이종형제', n: '4촌' },
                  { r: '아버지의 사촌', c: '당숙 (아저씨)', h: '당숙·종숙', n: '5촌' },
                  { r: '사촌 형제의 자녀', c: '이름 (지칭 당질)', h: '당질·종질', n: '5촌' },
                  { r: '당숙의 자녀', c: '육촌 (재종)', h: '재종형제', n: '6촌' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row.r}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{row.c}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted-strong)' }}>{row.h}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 시가·처가 표 ── */}
        <div>
          <h2 className="g-h2">
            시가·처가 호칭 한눈에
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>시가 (아내 → 남편 가족)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
                <li>남편의 부모 → <strong>아버님 · 어머님</strong></li>
                <li>남편의 형 → <strong>아주버님</strong> (시아주버니)</li>
                <li>남편의 남동생 → <strong>도련님</strong>(미혼)·<strong>서방님</strong>(기혼)</li>
                <li>남편의 누나 → <strong>형님</strong> · 여동생 → <strong>아가씨</strong></li>
                <li>남편 형의 아내 → <strong>형님</strong> · 동생의 아내 → <strong>동서</strong></li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>처가 (남편 → 아내 가족)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 2 }}>
                <li>아내의 부모 → <strong>장인어른 · 장모님</strong> (아버님·어머님)</li>
                <li>아내의 오빠 → <strong>형님</strong>(연상) · 남동생 → <strong>처남</strong></li>
                <li>아내의 언니 → <strong>처형</strong> · 여동생 → <strong>처제</strong></li>
                <li>처남의 아내 → <strong>아주머니</strong>(손위) · <strong>처남댁</strong>(손아래)</li>
                <li>처형·처제의 남편 → <strong>동서</strong> (연상은 형님)</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 시가 쪽 동서 서열은 <strong style={{ color: 'var(--text)' }}>남편 형제의 서열</strong>, 처가 쪽 동서 서열은
            {' '}<strong style={{ color: 'var(--text)' }}>나이</strong>를 따르는 것이 표준 언어 예절의 안내입니다.
          </p>
        </div>

        {/* ── 5. 2011 표준과 2020 안내 ── */}
        <div>
          <h2 className="g-h2">
            표준 언어 예절(2011)과 2020 안내서
          </h2>
          <p className="g-p">
            이 도구의 기본 호칭은 국립국어원 <strong>『표준 언어 예절』(2011)</strong>의 전통 호칭을 따르고,
            2020년 발간된 <strong>『우리, 뭐라고 부를까요?』</strong>의 완화 안내를 병기합니다.
            주의할 점은 <strong>두 자료 모두 어문 규범이 아니라 국립국어원의 지침·안내서</strong>라는 것입니다
            — 호칭·지칭어는 규범으로 정해져 있지 않으며, 국립국어원은 이후의 언어 변화를 반영한 2020 안내서 참고를 권합니다(온라인가나다 답변).
            2020 안내서는 2017년부터 진행한 실태 조사와 정책 연구를 바탕으로, 도련님·아가씨 같은 호칭 대신 <strong>가족이 합의한
            호칭(이름+씨 등)도 쓸 수 있다</strong>는 방향을 담고 있습니다. 전통 호칭과 달라 고민되는 자리라면
            가족끼리 미리 합의하는 것이 가장 좋습니다.
          </p>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/date/age',    icon: '🎂', name: '나이 계산기',       desc: '만 나이·세는 나이·띠·전통 나이 호칭' },
              { href: '/tools/life/zodiac', icon: '🐯', name: '띠·별자리 계산기',   desc: '가족 띠 비교·궁합까지' },
              { href: '/tools/date/lunar',  icon: '🌙', name: '양력↔음력 변환기',  desc: '제사·명절 날짜 계산' },
              { href: '/tools/date/dday',   icon: '📅', name: 'D-day 계산기',      desc: '명절·가족 행사 카운트다운' },
              { href: '/tools/life/gift-money', icon: '💌', name: '경조사비 가이드', desc: '관계별 축의금·부의금 적정선' },
              { href: '/tools/life',        icon: '🍀', name: '생활·일상 카테고리', desc: '더 많은 생활 도구' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block', padding: '14px 16px', background: 'var(--bg2)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
                  textDecoration: 'none', transition: 'border-color 0.15s',
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
    </ToolPage>
  )
}
