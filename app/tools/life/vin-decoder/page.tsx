import type { CSSProperties } from 'react'
import VinDecoderClient from './VinDecoderClient'
import AdSlot from '@/components/AdSlot'
import Disclaimer from '@/components/Disclaimer'
import Faq from '@/components/Faq'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import { calcCheckDigit } from '@/lib/vinDecoder'

export const metadata = buildMetadata({
  path: '/tools/life/vin-decoder',
  title: '차대번호(VIN) 해석기 — 제조국·제조사·연식·체크 디지트',
  description:
    '17자리 차대번호(VIN)를 자리별로 분해해 제조국·제조사·연식·조립공장을 해석하고 차종 코드(VDS) 구간을 분리합니다. 체크 디지트 검증, 연식 코드 변환, 제조사 코드 사전까지. 구조 해석 도구 (사고·이력 조회 아님).',
  keywords: ['차대번호 해석', 'VIN 해석', 'VIN 디코더', '차대번호 연식', 'WMI 코드', '차대번호 자리', '체크 디지트', '차량식별번호', 'VIN decoder', '제조사 코드'],
})

const card: CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '20px 22px', marginBottom: '14px',
}
const tableBox: CSSProperties = { border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', marginBottom: '14px' }
const strong: CSSProperties = { color: 'var(--text)' }
const cell: CSSProperties = { padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text)', verticalAlign: 'top' }
const headCell: CSSProperties = { padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }
const codeCell: CSSProperties = { ...cell, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }
const numCell: CSSProperties = { ...cell, textAlign: 'center', padding: '8px 6px', fontFamily: 'var(--font-mono)' }

/* 체크 디지트 계산 예시 — 49 CFR 565.15 의 문자 변환값(Table IV)·자리 가중치(Table V).
   결과 칸은 도구와 같은 lib/vinDecoder.calcCheckDigit 값을 그대로 표시해 두 계산이 어긋나면 화면에서 드러난다. */
const TRANSLIT_ROWS: [string, number][] = [
  ['A', 1], ['B', 2], ['C', 3], ['D', 4], ['E', 5], ['F', 6], ['G', 7], ['H', 8],
  ['J', 1], ['K', 2], ['L', 3], ['M', 4], ['N', 5], ['P', 7], ['R', 9],
  ['S', 2], ['T', 3], ['U', 4], ['V', 5], ['W', 6], ['X', 7], ['Y', 8], ['Z', 9],
]
const TRANSLIT = new Map(TRANSLIT_ROWS)
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
const EX_VIN = '1HGCM82633A004352'
const EX_STEPS = EX_VIN.split('').map((ch, i) => {
  const v = /\d/.test(ch) ? Number(ch) : (TRANSLIT.get(ch) ?? 0)
  return { pos: i + 1, ch, v, w: WEIGHTS[i], p: v * WEIGHTS[i] }
})
const EX_SUM = EX_STEPS.reduce((a, s) => a + s.p, 0)
const EX_CHECK = calcCheckDigit(EX_VIN)

const FAQ_LD = [
  { q: '차대번호로 사고 이력이나 주행거리를 알 수 있나요?', a: '<strong>아니요.</strong> 본 도구는 VIN에 표준 규칙으로 인코딩된 <strong>구조 정보</strong>(제조국·제조사·연식·공장 등)만 해석합니다. 사고·주행거리·소유자·압류 같은 <strong>이력은 VIN 문자 자체에 들어 있지 않으며</strong>, 별도의 공식 데이터베이스에서만 확인됩니다. 차량 이력은 <strong>카히스토리(보험개발원, carhistory.or.kr)</strong>, 압류·저당은 <strong>정부24 자동차등록원부</strong> 등 공식 서비스를 이용하세요.' },
  { q: '차대번호 17자리는 각각 무슨 의미인가요?', a: '1~3번째 <strong>WMI</strong>(제조국·제조사), 4~8번째 <strong>VDS</strong>(차종·차체·엔진 등 제조사별 사양), 9번째 <strong>체크 디지트</strong>(검증용), 10번째 <strong>모델 연식</strong>, 11번째 <strong>조립 공장</strong>, 12~17번째 <strong>일련번호</strong>(생산 순서)입니다. I·O·Q는 숫자 1·0과 헷갈려 쓰지 않습니다. 국제 표준 ISO 3779는 4~9번째를 한 덩어리(VDS), 10~17번째를 VIS로 나누고, 9번째를 체크 디지트로 쓰는 것은 북미·중국 등의 규칙입니다.' },
  { q: '10번째 자리로 연식을 어떻게 아나요?', a: '10번째 자리는 한 글자로 모델 연식을 나타냅니다. 예를 들어 <strong>T = 1996년 또는 2026년</strong>, S = 1995/2025처럼 <strong>30년 주기로 중복</strong>됩니다. 알파벳 코드라면 요즘 차량은 대개 뒤쪽(2010~) 연도입니다. 숫자 코드 1~9는 2001~2009년식, W·X·Y는 1998~2000년식입니다(2028~2039년식은 아직 나오지 않은 연식). I·O·Q·U·Z·0은 연식 코드로 쓰지 않습니다. 다만 10번째 자리 연식 표기는 북미 규정(49 CFR 565)의 의무이고 ISO 3779에서는 권장 사항이라, <strong>유럽 내수용 차량 등은 10번째 자리가 연식이 아닐 수 있습니다</strong>. [연식 코드] 탭에서 코드↔연도를 바로 변환할 수 있습니다.' },
  { q: '체크 디지트(9번째 자리)는 무엇인가요? 불일치하면 위조인가요?', a: '9번째 자리는 나머지 16자리를 정해진 가중치로 계산해 얻는 <strong>검산용 숫자(또는 X)</strong>입니다. 입력 오류를 잡아내는 용도죠. 다만 이 방식은 <strong>북미(NHTSA) 표준</strong>이라 유럽·일부 제조사는 적용하지 않거나 규칙이 다릅니다. 따라서 <strong>불일치가 곧 위변조를 뜻하지는 않습니다</strong> — 단순 오타이거나 체크 디지트 비적용 차량일 수 있습니다. 정확한 확인은 제조사·자동차등록증을 통해야 합니다.' },
  { q: '한국 차(현대·기아·제네시스)는 차대번호가 어떻게 시작하나요?', a: '한국 생산 차량은 첫 글자가 <strong>K</strong>입니다. 현대는 <strong>KMH</strong>(승용)·<strong>KM8</strong>(SUV·MPV), 기아는 <strong>KNA·KND</strong>, 제네시스는 <strong>KMT·KMU</strong>, KG모빌리티(쌍용)는 <strong>KP…</strong>, 르노코리아는 <strong>KNM</strong>, 한국GM(쉐보레)은 <strong>KL…</strong>로 시작합니다. 단, 미국 등 해외 공장에서 만든 현대·기아는 그 나라 코드(예: 미국 생산 = 5로 시작)를 따릅니다.' },
  { q: '차대번호와 차량번호(번호판)는 다른가요?', a: '네, 다릅니다. <strong>차대번호(VIN)</strong>는 차량마다 부여되는 17자리 고유 식별번호로 영구 불변입니다. <strong>차량번호(번호판)</strong>는 등록 번호로, 명의 이전·이사·말소 등에 따라 바뀔 수 있습니다. 본 도구가 해석하는 것은 <strong>차대번호(VIN)</strong>입니다.' },
  { q: '연식 코드가 30년마다 겹치면 어떻게 구분하나요?', a: '북미 판매용 승용차·MPV·경트럭(총중량 10,000lb 이하)은 <strong>7번째 자리</strong>로 구분합니다. 49 CFR 565.15에 따라 <strong>7번째 자리가 숫자면 1980~2009년</strong>, <strong>문자면 2010~2039년</strong> 주기의 연식입니다. 이 규칙이 적용되지 않는 차량은 차의 세대(외관·사양)와 자동차등록증의 <strong>최초등록일·제작연월</strong>을 함께 보면 30년 차이는 쉽게 가려집니다.' },
  { q: '차대번호가 17자리가 아니거나 I·O·Q가 들어 있어요.', a: '대부분 <strong>옮겨 적을 때의 실수</strong>입니다. VIN에는 I·O·Q가 쓰이지 않으므로 O는 숫자 0, I는 숫자 1로 읽으면 맞는 경우가 많고, 도구도 이 글자가 들어오면 경고합니다. 17자리 형식은 미국에서 <strong>1981년식부터 의무화</strong>되었고 ISO 3779도 17자리를 표준으로 하므로, 그보다 오래된 클래식카나 일부 특수 차량은 제조사 고유의 짧은 차대번호를 쓸 수 있습니다. 이런 번호는 표준 규칙으로 해석되지 않습니다.' },
]

export default function VinDecoderPage() {
  return (
    <ToolPage width={880} slug="/tools/life/vin-decoder">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />차대번호(VIN) 해석기
      </h1>
      <p className="tp-lead">
        17자리 차대번호를 자리별로 분해해 <strong style={{ color: 'var(--text)' }}>제조국·제조사·연식·공장</strong>을 해석합니다.
        차종 코드(VDS)는 구간만 분리하고, 체크 디지트 검증까지. <strong style={{ color: 'var(--text)' }}>(사고·이력 조회 아님 — 구조 해석 도구)</strong>
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="자리 구조 = ISO 3779 · 제조사 식별(WMI) = ISO 3780 · 체크 디지트 = 49 CFR 565.15(문자 변환값 × 자리 가중치 합 ÷ 11의 나머지, 10이면 X — 북미·중국 의무) · 연식 코드 = 30년 주기(A=1980/2010 … 9=2009/2039) · 제조사 코드 = 공개 WMI 목록 교차 확인 참고 데이터"
        sources={[
          { label: 'ISO 3779:2009 — Vehicle identification number (VIN) 내용과 구조', href: 'https://www.iso.org/standard/52200.html' },
          { label: 'eCFR — 49 CFR Part 565 VIN Requirements(NHTSA)', href: 'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-565' },
          { label: '국가법령정보센터 — 자동차관리법(차대번호 표기·훼손 금지)', href: 'https://www.law.go.kr/법령/자동차관리법' },
        ]}
      />

      <VinDecoderClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      {/* 1. 구조 개요 */}
      <h2 className="g-h2">차대번호(VIN) 17자리 구조</h2>
      <p className="g-p">
        VIN(Vehicle Identification Number, 차대번호)은 ISO 3779 국제 표준에 따라 <strong>17자리</strong>로 구성됩니다.
        숫자 1·0과 헷갈리는 <strong>I·O·Q는 사용하지 않습니다</strong>. 크게 세 덩어리로 나뉩니다.
      </p>
      <div className="tableScroll" style={tableBox}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
          <thead><tr><th scope="col" style={headCell}>자리</th><th scope="col" style={headCell}>구분</th><th scope="col" style={headCell}>의미</th></tr></thead>
          <tbody>
            <tr><td style={codeCell}>1–3</td><td style={cell}>WMI</td><td style={cell}>제조국 + 제조사 (World Manufacturer Identifier)</td></tr>
            <tr><td style={codeCell}>4–8</td><td style={cell}>VDS</td><td style={cell}>차종·차체·엔진·등급 (제조사별 자체 코드)</td></tr>
            <tr><td style={codeCell}>9</td><td style={cell}>체크</td><td style={cell}>체크 디지트 (검산용 계산값)</td></tr>
            <tr><td style={codeCell}>10</td><td style={cell}>연식</td><td style={cell}>모델 연식 (30년 주기 코드)</td></tr>
            <tr><td style={codeCell}>11</td><td style={cell}>공장</td><td style={cell}>조립 공장 (제조사별 코드)</td></tr>
            <tr><td style={codeCell}>12–17</td><td style={cell}>일련번호</td><td style={cell}>생산 순서 (고유 번호)</td></tr>
          </tbody>
        </table>
      </div>
      <p className="g-note">
        <strong style={strong}>표준·근거</strong> — VIN 구조는 <strong style={strong}>ISO 3779</strong>, 제조사 식별자(WMI)는 <strong style={strong}>ISO 3780</strong>, 9번째 체크 디지트는 미국 <a href="https://www.ecfr.gov/current/title-49/part-565" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>NHTSA 49 CFR §565</a>를 따릅니다. 제조사 코드는 공개 WMI 목록과 교차 확인한 참고 데이터입니다.
      </p>
      <p className="g-p" style={{ marginTop: 16 }}>
        위 표는 북미 규정 기준의 자리 구분입니다. ISO 3779 자체는 4~9번째 여섯 자리를 한 덩어리의 VDS로, 10~17번째 여덟 자리를 VIS(차량 지시부)로만 정하고
        그 안을 어떻게 쓸지는 제조사에 맡깁니다. 미국 49 CFR 565는 여기에 9번째 체크 디지트, 10번째 연식, 11번째 공장을 의무로 얹었고,
        한국 제조사도 같은 배치를 쓰기 때문에 국산차·미국차는 표대로 읽으면 됩니다. 반면 <strong>유럽 내수용 차량은 10·11번째 자리가 연식·공장이 아닐 수 있어</strong>
        도구의 연식 해석을 그대로 믿기보다 자동차등록증의 제작연월과 함께 확인하는 것이 안전합니다.
      </p>

      {/* 2. WMI 제조국 */}
      <h2 className="g-h2">1번째 자리 — 제조 지역</h2>
      <p className="g-p">첫 글자는 차량이 만들어진 <strong>지역·국가</strong>를 나타냅니다. 같은 브랜드라도 생산 공장이 다른 나라면 첫 글자가 달라집니다.</p>
      <div className="tableScroll" style={tableBox}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead><tr><th scope="col" style={headCell}>첫 글자</th><th scope="col" style={headCell}>지역</th><th scope="col" style={headCell}>예</th></tr></thead>
          <tbody>
            <tr><td style={codeCell}>J–R</td><td style={cell}>아시아</td><td style={cell}>K 한국, J 일본, L 중국</td></tr>
            <tr><td style={codeCell}>S–Z</td><td style={cell}>유럽</td><td style={cell}>W 독일, V 프랑스·스페인, Z 이탈리아, S 영국</td></tr>
            <tr><td style={codeCell}>1–5, 7F–7Z</td><td style={cell}>북미</td><td style={cell}>1·4·5 미국, 2 캐나다, 3 멕시코, 7F~7Z 미국(신규 할당, 예: 테슬라 텍사스 7SA)</td></tr>
            <tr><td style={codeCell}>6, 7A–7E</td><td style={cell}>오세아니아</td><td style={cell}>6 호주, 7A~7E 뉴질랜드</td></tr>
            <tr><td style={codeCell}>8–0</td><td style={cell}>남미</td><td style={cell}>9 브라질 등</td></tr>
            <tr><td style={codeCell}>A–H</td><td style={cell}>아프리카</td><td style={cell}>남아공 등</td></tr>
          </tbody>
        </table>
      </div>

      {/* 3. 제조사 코드 */}
      <h2 className="g-h2">주요 제조사 코드 (WMI)</h2>
      <p className="g-p">1~3번째 자리로 제조사를 식별합니다. 아래는 일부 예시이며, 도구의 <strong>[제조사 사전]</strong> 탭에서 더 많은 코드를 검색할 수 있습니다.</p>
      <div className="tableScroll" style={tableBox}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
          <thead><tr><th scope="col" style={headCell}>코드</th><th scope="col" style={headCell}>제조사</th><th scope="col" style={headCell}>코드</th><th scope="col" style={headCell}>제조사</th></tr></thead>
          <tbody>
            <tr><td style={codeCell}>KMH</td><td style={cell}>현대 (승용)</td><td style={codeCell}>JHM</td><td style={cell}>혼다</td></tr>
            <tr><td style={codeCell}>KM8</td><td style={cell}>현대 (SUV·MPV)</td><td style={codeCell}>JT</td><td style={cell}>토요타</td></tr>
            <tr><td style={codeCell}>KMT</td><td style={cell}>제네시스</td><td style={codeCell}>WBA</td><td style={cell}>BMW</td></tr>
            <tr><td style={codeCell}>KNA</td><td style={cell}>기아 (승용)</td><td style={codeCell}>WDB</td><td style={cell}>메르세데스-벤츠</td></tr>
            <tr><td style={codeCell}>KPT</td><td style={cell}>KG모빌리티(쌍용)</td><td style={codeCell}>WVW</td><td style={cell}>폭스바겐</td></tr>
            <tr><td style={codeCell}>KNM</td><td style={cell}>르노코리아</td><td style={codeCell}>1FA</td><td style={cell}>포드</td></tr>
            <tr><td style={codeCell}>KL</td><td style={cell}>한국GM (쉐보레)</td><td style={codeCell}>5YJ</td><td style={cell}>테슬라 (미국)</td></tr>
            <tr><td style={codeCell}>5NP</td><td style={cell}>현대 (미국 생산)</td><td style={codeCell}>5XY</td><td style={cell}>기아 (미국 생산)</td></tr>
          </tbody>
        </table>
      </div>

      {/* 4. 연식 코드 */}
      <h2 className="g-h2">모델 연식 코드 (30년 주기)</h2>
      <p className="g-p">
        10번째 자리 한 글자가 모델 연식을 나타냅니다. <strong>A=1980, B=1981 …</strong> 순서로 가다가
        I·O·Q·U·Z·0을 건너뛰며, 한 바퀴(30종)를 돌면 다시 처음으로 돌아옵니다. 그래서 같은 코드가 <strong>30년 간격으로 중복</strong>됩니다.
        예) <strong>T = 1996년 또는 2026년</strong>. 도구의 [연식 코드] 탭에 전체표가 있습니다.
      </p>
      <p className="g-p">
        두 후보 중 어느 쪽인지는 북미 판매용 승용차·MPV·경트럭이라면 <strong>7번째 자리</strong>로 가립니다. 49 CFR 565.15는 이 차종의 7번째 자리가
        숫자면 1980~2009년, 문자면 2010~2039년 주기로 읽도록 정했습니다. 또 <strong>모델 연식은 제작 연도와 다를 수 있습니다</strong> — 미국 시장에서는
        다음 해 모델을 전년도 가을부터 파는 일이 흔해, 2025년 10월에 만든 차의 10번째 자리가 2026년식(T)인 경우가 자연스럽습니다.
      </p>

      {/* 5. 체크 디지트 */}
      <h2 className="g-h2">체크 디지트 계산 원리</h2>
      <p className="g-p">
        9번째 자리는 나머지 16자리를 검산하는 숫자입니다. 각 문자를 정해진 값으로 바꾼 뒤 자리별 가중치를 곱해 더하고,
        그 합을 11로 나눈 나머지가 체크 디지트입니다(나머지가 10이면 <strong>X</strong>). 9번째 자리 자신은 가중치가 0이라 계산에 들어가지 않습니다.
        아래는 <code style={{ fontFamily: 'var(--font-mono)' }}>{EX_VIN}</code>을 한 자리씩 계산한 과정입니다.
      </p>
      <div className="tableScroll" style={tableBox}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <tbody>
            {([
              ['자리', (s: typeof EX_STEPS[number]) => s.pos],
              ['문자', (s: typeof EX_STEPS[number]) => s.ch],
              ['변환값', (s: typeof EX_STEPS[number]) => s.v],
              ['가중치', (s: typeof EX_STEPS[number]) => s.w],
              ['곱', (s: typeof EX_STEPS[number]) => s.p],
            ] as const).map(([label, get]) => (
              <tr key={label}>
                <th scope="row" style={{ ...headCell, whiteSpace: 'nowrap' }}>{label}</th>
                {EX_STEPS.map((s) => (
                  <td key={s.pos} style={{ ...numCell, fontWeight: label === '문자' || label === '곱' ? 700 : 400, color: s.pos === 9 ? 'var(--muted)' : 'var(--text)' }}>{get(s)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="g-p">
        곱의 합은 <strong>{EX_SUM}</strong>, {EX_SUM} ÷ 11의 나머지는 <strong>{EX_SUM % 11}</strong>입니다. 도구의 계산 결과도 <strong>{EX_CHECK.expected}</strong>로,
        실제 9번째 자리({EX_CHECK.actual})와 {EX_CHECK.valid ? '일치합니다' : '다릅니다'}. 문자 변환값은 A~I, J~R, S~Z 세 묶음에 1~9(S 묶음은 2부터)를 차례로 붙이되 쓰지 않는 I·O·Q 자리는 비워 두는 규칙이라(그래서 P=7, R=9)
        외우기보다 아래 표를 보는 편이 빠릅니다. 숫자는 그대로 자기 값입니다.
      </p>
      <div className="tableScroll" style={tableBox}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <tbody>
            <tr>
              <th scope="row" style={{ ...headCell, whiteSpace: 'nowrap' }}>문자</th>
              {TRANSLIT_ROWS.map(([c]) => <td key={c} style={{ ...numCell, fontWeight: 700 }}>{c}</td>)}
            </tr>
            <tr>
              <th scope="row" style={{ ...headCell, whiteSpace: 'nowrap' }}>값</th>
              {TRANSLIT_ROWS.map(([c, v]) => <td key={c} style={numCell}>{v}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="g-p">
        다만 이 검증식은 <strong>북미(NHTSA)·중국에서 의무</strong>인 표준입니다. 한국 현대·기아·제네시스도 적용해 보통 일치하지만,
        <strong>유럽 수입차(BMW·벤츠·아우디 등)는 적용하지 않아</strong> 9번째 자리가 계산값과 달라도 정상입니다.
        따라서 <strong>불일치가 곧 위변조를 의미하지는 않습니다</strong> — 단순 오타이거나 비적용 차량일 수 있습니다. 본 도구는 북미·중국산이 아닌 차량에서 값이 다르면 “미적용일 수 있음”으로만 안내합니다.
        반대로 북미·중국산 차량에서 불일치가 나오면 먼저 옮겨 적은 글자(특히 8과 B, 5와 S, 2와 Z)를 다시 확인해 보세요.
      </p>

      {/* 6. VIN vs 번호판 */}
      <h2 className="g-h2">차대번호 vs 차량번호(번호판)</h2>
      <p className="g-p">
        <strong>차대번호(VIN)</strong>는 차량마다 부여된 17자리 고유 식별번호로 영구 불변입니다.
        <strong> 차량번호(번호판)</strong>는 등록 번호라서 명의 이전·말소 시 바뀔 수 있습니다. 둘은 별개입니다.
      </p>

      {/* 7. VIN 위치 */}
      <h2 className="g-h2">차대번호 찾는 위치</h2>
      <p className="g-p">
        운전석 <strong>앞유리 하단</strong>(밖에서 보이는 금속판), 운전석 <strong>도어 안쪽 스티커</strong>,
        <strong> 보닛 내부·엔진룸</strong> 각인, 그리고 <strong>자동차등록증·보험증서</strong>에서 확인할 수 있습니다.
      </p>
      <p className="g-p">
        중고차를 살 때는 이 여러 곳의 번호가 모두 같은지, 자동차등록증의 차대번호와 일치하는지 대조해 보는 것이 기본입니다.
        자동차관리법은 차대번호 표기를 제작사 등 법이 정한 자만 하도록 하고, 누구든지 표기를 지우거나 알아보기 어렵게 하는 행위를 금지합니다(차대번호 등의 표기·부정사용 금지 조항).
        각인이 긁혀 있거나 스티커가 재부착된 흔적이 있다면 구조 해석보다 판매자·정비업체에 경위를 먼저 확인하세요.
      </p>

      {/* 8. 이력 조회는 공식 서비스 */}
      <h2 className="g-h2">사고·이력 조회는 공식 서비스로</h2>
      <p className="g-p">
        본 도구는 <strong>구조 해석</strong>만 합니다. 사고·보험·주행거리·소유자·압류 등은 VIN 문자에 들어 있지 않으며,
        아래 공식 서비스에서 확인하세요.
      </p>
      <div style={card}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--muted)', lineHeight: 2 }}>
          <li><strong style={strong}>차량 사고·보험 이력</strong> — 카히스토리(보험개발원) <span style={{ fontFamily: 'var(--font-mono)' }}>carhistory.or.kr</span></li>
          <li><strong style={strong}>자동차 등록·제원·정비</strong> — 자동차365(국토교통부) <span style={{ fontFamily: 'var(--font-mono)' }}>www.car365.go.kr</span></li>
          <li><strong style={strong}>압류·저당·소유</strong> — 정부24 자동차등록원부 <span style={{ fontFamily: 'var(--font-mono)' }}>www.gov.kr</span></li>
        </ul>
      </div>

      <Disclaimer
        variant="default"
        related={[
          { href: '/tools/finance/car-cost', label: '자동차 유지비 계산기' },
          { href: '/tools/finance/car-tax', label: '자동차 세금 계산기' },
        ]}
        sources={[
          { label: '카히스토리(보험개발원) — 차량 이력', href: 'https://www.carhistory.or.kr' },
          { label: '자동차365(국토교통부) — 등록·제원', href: 'https://www.car365.go.kr' },
        ]}
      >
        본 도구는 표준 규칙으로 인코딩된 <strong>VIN 구조만 해석</strong>하며, 사고·주행거리·소유자 등 <strong>이력 조회가 아닙니다</strong>.
        VDS(차종 코드)는 제조사별 자체 체계라 일반 해석에 한계가 있고, 연식 코드는 30년 주기로 중복되며, 체크 디지트는 북미 표준입니다.
        입력한 VIN은 서버로 전송·자동 저장되지 않습니다.
      </Disclaimer>

      <section style={{ marginTop: '48px' }}>
        <Faq items={FAQ_LD} />
      </section>
    </ToolPage>
  )
}
