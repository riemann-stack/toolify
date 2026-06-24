import type { CSSProperties } from 'react'
import VinDecoderClient from './VinDecoderClient'
import AdSlot from '@/components/AdSlot'
import Disclaimer from '@/components/Disclaimer'
import FaqJsonLd from '@/components/FaqJsonLd'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'

export const metadata = buildMetadata({
  path: '/tools/life/vin-decoder',
  title: '차대번호(VIN) 해석기 — 제조국·제조사·연식·체크 디지트',
  description:
    '17자리 차대번호(VIN)를 자리별로 분해해 제조국·제조사·연식·조립공장을 해석하고 차종 코드(VDS) 구간을 분리합니다. 체크 디지트 검증, 연식 코드 변환, 제조사 코드 사전까지. 구조 해석 도구 (사고·이력 조회 아님).',
  keywords: ['차대번호 해석', 'VIN 해석', 'VIN 디코더', '차대번호 연식', 'WMI 코드', '차대번호 자리', '체크 디지트', '차량식별번호', 'VIN decoder', '제조사 코드'],
})

const sectionTitle: CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px', fontWeight: 700, marginBottom: '14px', marginTop: '48px', letterSpacing: '-0.5px',
}
const card: CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px', marginBottom: '14px',
}
const para: CSSProperties = { fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }
const cell: CSSProperties = { padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text)', verticalAlign: 'top' }
const headCell: CSSProperties = { padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '12px', color: 'var(--muted)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }
const codeCell: CSSProperties = { ...cell, fontFamily: 'Inter, ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }
const faqDetails: CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '8px' }
const faqSummary: CSSProperties = { cursor: 'pointer', fontSize: '15px', fontWeight: 600, color: 'var(--text)', padding: '4px 0' }
const faqAnswer: CSSProperties = { marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }

const FAQ_LD = [
  { "q": "차대번호로 사고 이력이나 주행거리를 알 수 있나요?", "a": "<strong>아니요.</strong> 본 도구는 VIN에 표준 규칙으로 인코딩된 <strong>구조 정보</strong>(제조국·제조사·연식·공장 등)만 해석합니다. 사고·주행거리·소유자·압류 같은 <strong>이력은 VIN 문자 자체에 들어 있지 않으며</strong>, 별도의 공식 데이터베이스에서만 확인됩니다. 차량 이력은 <strong>카히스토리(보험개발원, carhistory.or.kr)</strong>, 압류·저당은 <strong>정부24 자동차등록원부</strong> 등 공식 서비스를 이용하세요." },
  { "q": "차대번호 17자리는 각각 무슨 의미인가요?", "a": "1~3번째 <strong>WMI</strong>(제조국·제조사), 4~8번째 <strong>VDS</strong>(차종·차체·엔진 등 제조사별 사양), 9번째 <strong>체크 디지트</strong>(검증용), 10번째 <strong>모델 연식</strong>, 11번째 <strong>조립 공장</strong>, 12~17번째 <strong>일련번호</strong>(생산 순서)입니다. I·O·Q는 숫자 1·0과 헷갈려 쓰지 않습니다." },
  { "q": "10번째 자리로 연식을 어떻게 아나요?", "a": "10번째 자리는 한 글자로 모델 연식을 나타냅니다. 예를 들어 <strong>T = 1996년 또는 2026년</strong>, S = 1995/2025처럼 <strong>30년 주기로 중복</strong>됩니다. 같은 코드가 30년 차이로 두 번 쓰이므로, 최근 차량은 대개 뒤쪽(2010~) 연도입니다. I·O·Q·U·Z·0은 연식 코드로 쓰지 않습니다. [연식 코드] 탭에서 코드↔연도를 바로 변환할 수 있습니다." },
  { "q": "체크 디지트(9번째 자리)는 무엇인가요? 불일치하면 위조인가요?", "a": "9번째 자리는 나머지 16자리를 정해진 가중치로 계산해 얻는 <strong>검산용 숫자(또는 X)</strong>입니다. 입력 오류를 잡아내는 용도죠. 다만 이 방식은 <strong>북미(NHTSA) 표준</strong>이라 유럽·일부 제조사는 적용하지 않거나 규칙이 다릅니다. 따라서 <strong>불일치가 곧 위변조를 뜻하지는 않습니다</strong> — 단순 오타이거나 체크 디지트 비적용 차량일 수 있습니다. 정확한 확인은 제조사·자동차등록증을 통해야 합니다." },
  { "q": "한국 차(현대·기아·제네시스)는 차대번호가 어떻게 시작하나요?", "a": "한국 생산 차량은 첫 글자가 <strong>K</strong>입니다. 현대는 <strong>KMH</strong>(승용)·<strong>KM8</strong>(SUV·MPV), 기아는 <strong>KNA·KND</strong>, 제네시스는 <strong>KMT·KMU</strong>, KG모빌리티(쌍용)는 <strong>KP…</strong>, 르노코리아는 <strong>KNM</strong>, 한국GM(쉐보레)은 <strong>KL…</strong>로 시작합니다. 단, 미국 등 해외 공장에서 만든 현대·기아는 그 나라 코드(예: 미국 생산 = 5로 시작)를 따릅니다." },
  { "q": "차대번호와 차량번호(번호판)는 다른가요?", "a": "네, 다릅니다. <strong>차대번호(VIN)</strong>는 차량마다 부여되는 17자리 고유 식별번호로 영구 불변입니다. <strong>차량번호(번호판)</strong>는 등록 번호로, 명의 이전·이사·말소 등에 따라 바뀔 수 있습니다. 본 도구가 해석하는 것은 <strong>차대번호(VIN)</strong>입니다." },
  { "q": "입력한 차대번호는 저장·전송되나요?", "a": "<strong>아니요.</strong> 본 도구는 모든 해석을 <strong>브라우저 안에서 즉시 계산</strong>하며, 입력한 VIN을 서버로 보내거나 자동 저장하지 않습니다. ‘최근 조회에 저장’을 직접 누른 경우에만 <strong>이 브라우저(localStorage)</strong>에 보관되고, 일련번호는 화면에서 가려지며 ‘전체 삭제’로 지울 수 있습니다." },
]

export default function VinDecoderPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>생활·재미</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🚗 차대번호(VIN) 해석기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        17자리 차대번호를 자리별로 분해해 <strong style={{ color: 'var(--text)' }}>제조국·제조사·연식·공장</strong>을 해석합니다.
        차종 코드(VDS)는 구간만 분리하고, 체크 디지트 검증까지. <strong style={{ color: 'var(--text)' }}>(사고·이력 조회 아님 — 구조 해석 도구)</strong>
      </p>

      <VinDecoderClient />

      <GuideDivider />

      <AdSlot position="in-article" minHeight={200} />

      {/* 1. 구조 개요 */}
      <h2 style={sectionTitle}>🧩 차대번호(VIN) 17자리 구조</h2>
      <p style={para}>
        VIN(Vehicle Identification Number, 차대번호)은 ISO 3779 국제 표준에 따라 <strong style={{ color: 'var(--text)' }}>17자리</strong>로 구성됩니다.
        숫자 1·0과 헷갈리는 <strong style={{ color: 'var(--text)' }}>I·O·Q는 사용하지 않습니다</strong>. 크게 세 덩어리로 나뉩니다.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
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
      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '10px 2px 0', lineHeight: 1.7 }}>
        📚 <strong style={{ color: 'var(--text)' }}>표준·근거</strong> — VIN 구조는 <strong style={{ color: 'var(--text)' }}>ISO 3779</strong>, 제조사 식별자(WMI)는 <strong style={{ color: 'var(--text)' }}>ISO 3780</strong>, 9번째 체크 디지트는 미국 <a href="https://www.ecfr.gov/current/title-49/part-565" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>NHTSA 49 CFR §565</a>를 따릅니다. 제조사 코드는 공개 WMI 목록과 교차 확인한 참고 데이터입니다.
      </p>

      {/* 2. WMI 제조국 */}
      <h2 style={sectionTitle}>🌍 1번째 자리 — 제조 지역</h2>
      <p style={para}>첫 글자는 차량이 만들어진 <strong style={{ color: 'var(--text)' }}>지역·국가</strong>를 나타냅니다. 같은 브랜드라도 생산 공장이 다른 나라면 첫 글자가 달라집니다.</p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead><tr><th scope="col" style={headCell}>첫 글자</th><th scope="col" style={headCell}>지역</th><th scope="col" style={headCell}>예</th></tr></thead>
          <tbody>
            <tr><td style={codeCell}>J–R</td><td style={cell}>아시아</td><td style={cell}>K 한국, J 일본, L 중국</td></tr>
            <tr><td style={codeCell}>S–Z</td><td style={cell}>유럽</td><td style={cell}>W 독일, V 프랑스·스페인, Z 이탈리아, S 영국</td></tr>
            <tr><td style={codeCell}>1–5</td><td style={cell}>북미</td><td style={cell}>1·4·5 미국, 2 캐나다, 3 멕시코</td></tr>
            <tr><td style={codeCell}>6–7</td><td style={cell}>오세아니아</td><td style={cell}>호주·뉴질랜드</td></tr>
            <tr><td style={codeCell}>8–0</td><td style={cell}>남미</td><td style={cell}>9 브라질 등</td></tr>
            <tr><td style={codeCell}>A–H</td><td style={cell}>아프리카</td><td style={cell}>남아공 등</td></tr>
          </tbody>
        </table>
      </div>

      {/* 3. 제조사 코드 */}
      <h2 style={sectionTitle}>🏷️ 주요 제조사 코드 (WMI)</h2>
      <p style={para}>1~3번째 자리로 제조사를 식별합니다. 아래는 일부 예시이며, 도구의 <strong style={{ color: 'var(--text)' }}>[제조사 사전]</strong> 탭에서 더 많은 코드를 검색할 수 있습니다.</p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
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
      <h2 style={sectionTitle}>📅 모델 연식 코드 (30년 주기)</h2>
      <p style={para}>
        10번째 자리 한 글자가 모델 연식을 나타냅니다. <strong style={{ color: 'var(--text)' }}>A=1980, B=1981 …</strong> 순서로 가다가
        I·O·Q·U·Z·0을 건너뛰며, 한 바퀴(30종)를 돌면 다시 처음으로 돌아옵니다. 그래서 같은 코드가 <strong style={{ color: 'var(--text)' }}>30년 간격으로 중복</strong>됩니다.
        예) <strong style={{ color: 'var(--text)' }}>T = 1996년 또는 2026년</strong>. 도구의 [연식 코드] 탭에 전체표가 있습니다.
      </p>

      {/* 5. 체크 디지트 */}
      <h2 style={sectionTitle}>✅ 체크 디지트 계산 원리</h2>
      <p style={para}>
        9번째 자리는 나머지 16자리를 검산하는 숫자입니다. 각 문자를 정해진 값으로 바꾼 뒤 자리별 가중치를 곱해 더하고,
        그 합을 11로 나눈 나머지가 체크 디지트입니다(나머지가 10이면 <strong style={{ color: 'var(--text)' }}>X</strong>).
        예를 들어 <code style={{ fontFamily: 'ui-monospace, monospace' }}>1HGCM82633A004352</code>의 계산 결과는 <strong style={{ color: 'var(--text)' }}>3</strong>으로, 9번째 자리와 일치합니다.
      </p>
      <p style={para}>
        다만 이 검증식은 <strong style={{ color: 'var(--text)' }}>북미(NHTSA)·중국에서 의무</strong>인 표준입니다. 한국 현대·기아·제네시스도 적용해 보통 일치하지만,
        <strong style={{ color: 'var(--text)' }}>유럽 수입차(BMW·벤츠·아우디 등)는 적용하지 않아</strong> 9번째 자리가 계산값과 달라도 정상입니다.
        따라서 <strong style={{ color: 'var(--text)' }}>불일치가 곧 위변조를 의미하지는 않습니다</strong> — 단순 오타이거나 비적용 차량일 수 있습니다. 본 도구는 북미·중국산이 아닌 차량에서 값이 다르면 “미적용일 수 있음”으로만 안내합니다.
      </p>

      {/* 6. VIN vs 번호판 */}
      <h2 style={sectionTitle}>🆔 차대번호 vs 차량번호(번호판)</h2>
      <p style={para}>
        <strong style={{ color: 'var(--text)' }}>차대번호(VIN)</strong>는 차량마다 부여된 17자리 고유 식별번호로 영구 불변입니다.
        <strong style={{ color: 'var(--text)' }}>차량번호(번호판)</strong>는 등록 번호라서 명의 이전·말소 시 바뀔 수 있습니다. 둘은 별개입니다.
      </p>

      {/* 7. VIN 위치 */}
      <h2 style={sectionTitle}>🔍 차대번호 찾는 위치</h2>
      <p style={para}>
        운전석 <strong style={{ color: 'var(--text)' }}>앞유리 하단</strong>(밖에서 보이는 금속판), 운전석 <strong style={{ color: 'var(--text)' }}>도어 안쪽 스티커</strong>,
        <strong style={{ color: 'var(--text)' }}> 보닛 내부·엔진룸</strong> 각인, 그리고 <strong style={{ color: 'var(--text)' }}>자동차등록증·보험증서</strong>에서 확인할 수 있습니다.
      </p>

      {/* 8. 이력 조회는 공식 서비스 */}
      <h2 style={sectionTitle}>📋 사고·이력 조회는 공식 서비스로</h2>
      <p style={para}>
        본 도구는 <strong style={{ color: 'var(--text)' }}>구조 해석</strong>만 합니다. 사고·보험·주행거리·소유자·압류 등은 VIN 문자에 들어 있지 않으며,
        아래 공식 서비스에서 확인하세요.
      </p>
      <div style={card}>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'var(--muted)', lineHeight: 2 }}>
          <li><strong style={{ color: 'var(--text)' }}>차량 사고·보험 이력</strong> — 카히스토리(보험개발원) <span style={{ fontFamily: 'ui-monospace, monospace' }}>carhistory.or.kr</span></li>
          <li><strong style={{ color: 'var(--text)' }}>자동차 등록·제원·정비</strong> — 자동차365(국토교통부) <span style={{ fontFamily: 'ui-monospace, monospace' }}>www.car365.go.kr</span></li>
          <li><strong style={{ color: 'var(--text)' }}>압류·저당·소유</strong> — 정부24 자동차등록원부 <span style={{ fontFamily: 'ui-monospace, monospace' }}>www.gov.kr</span></li>
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

      <h2 style={sectionTitle}>❓ 자주 묻는 질문</h2>
      <FaqJsonLd items={FAQ_LD} />
      {FAQ_LD.map((f, i) => (
        <details key={i} style={faqDetails}>
          <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
          <div style={faqAnswer} dangerouslySetInnerHTML={{ __html: f.a }} />
        </details>
      ))}
    </div>
  )
}
