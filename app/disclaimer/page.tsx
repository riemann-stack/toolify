import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/disclaimer',
  title: '면책조항 — 의료·세무·금융·법률·식품·건축·화학·운동',
  description: 'Youtil의 모든 계산 도구는 일반 정보 제공 목적이며 전문가 자문을 대체하지 않습니다. 의료·건강, 세무·재무, 금융·투자, 법률, 식품·요리, 건축·인테리어, 화학·약품, 운동·스포츠 8개 분야별 강화 면책 안내.',
})

const LAST_UPDATED  = '2026년 5월 5일'
const SITE_NAME     = 'Youtil'
const CONTACT_EMAIL = 'contact@youtil.kr'

/* ─── 공통 스타일 ─── */
const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '14px',
  marginTop: '40px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '18px 22px',
  marginBottom: '12px',
}
const para: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--text)',
  lineHeight: 1.85,
  margin: '0 0 10px',
}
const muted: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: '0 0 8px',
}

/* ─── 분야별 박스 데이터 ─── */
interface DomainBlock {
  id: string
  emoji: string
  title: string
  color: string
  tools: string
  warnings: string[]
  legal: string
  recommend: string
}

const DOMAINS: DomainBlock[] = [
  {
    id: 'medical',
    emoji: '🏥',
    title: '의료·건강',
    color: '#FF3E8C',
    tools: 'BMI · BMR · 다이어트 · 임신 주수 · 반려동물 나이 · 혈중알코올농도 · 영양제 상호작용 · 자외선 차단 · 생리 주기 추적',
    warnings: [
      '본 도구는 의학적 진단·치료·처방을 대체하지 않으며, 의사·약사·영양사 등 의료 전문가의 자문을 대신할 수 없습니다.',
      'BMI·BMR 등 일반 공식은 개인의 근육량·골밀도·연령·질환·임신·복용 약물 등을 반영하지 않으며, 운동선수·노인·청소년·임산부에게는 부정확할 수 있습니다.',
      '영양제 상호작용은 일반적 참고일 뿐, 처방약·기저질환과의 실제 상호작용은 반드시 의료진과 상담하세요.',
      '혈중알코올농도(Widmark 공식) 결과는 개인차가 매우 크며, 음주 후 운전 가능 여부를 보장하지 않습니다. 음주운전은 법으로 금지됩니다.',
      '임신 주수·생리 주기 추적은 의료 진단이 아니며, 산부인과 정기 검진을 대체하지 않습니다.',
    ],
    legal: '「의료법」 제27조의2(의료광고)·「약사법」 제68조에 따라 본 서비스는 의료 행위·의약품 권유·진단·치료를 제공하지 않습니다.',
    recommend: '👉 응급 상황은 119·1339(질병관리청 콜센터). 정기 진료는 가까운 의원·종합병원·보건소 이용.',
  },
  {
    id: 'tax',
    emoji: '💴',
    title: '세무·재무',
    color: '#3EC8FF',
    tools: '연봉 실수령액 · 4대보험료 · 상속세 · 양도소득세 · 부동산 취득세 · 퇴직금 · 부가가치세 · 종합소득세 (해당 시) · 자동차 비용',
    warnings: [
      '세금 계산 결과는 2026년 기준 공식 요율을 적용하나, 비과세 항목·부양가족·세액공제·감면·중과세·이월결손금 등 개인 상황을 완전히 반영하지 못합니다.',
      '연봉 실수령액은 일반 직장인 가정(주 40시간·9-6 근무·식대 20만원 비과세)이며, 야근·연장수당·성과급·스톡옵션·전세자금 대출이자공제 등 변수는 별도 계산이 필요합니다.',
      '상속세·양도소득세는 평가액·취득시기·1세대1주택·장기보유특별공제 등 복잡한 변수가 있어 본 도구의 결과는 큰 틀의 가늠치일 뿐입니다.',
      '4대보험료(국민연금·건강보험·고용보험·산재보험)는 사업장 형태(법인·개인사업자)·근무 형태(정규·일용·프리랜서)에 따라 요율이 다를 수 있습니다.',
      '세법은 매년·반기·임시 개정되며, 본 서비스가 항상 최신 개정을 반영한다고 보장하지 않습니다.',
    ],
    legal: '「세무사법」 제2조에 따라 본 서비스는 세무대리(세무 신고·자문)를 수행하지 않습니다. 「전자상거래법」상 정보제공자에 해당.',
    recommend: '👉 정확한 세무 계산·신고는 세무사·회계사 또는 국세청 홈택스(126·국세상담센터)·관할 세무서를 이용하세요.',
  },
  {
    id: 'finance',
    emoji: '📈',
    title: '금융·투자',
    color: '#3EFFD0',
    tools: '주식 평단가·손익 · 배당금 · 복리 · 적금·예금 · 공모주 청약 환급 · 종목 매수 결정 · 대출 이자 · 부동산 계산기 · 경매',
    warnings: [
      '본 서비스는 일반 금융 계산만 제공하며 「자본시장법」 제9조에 따른 투자권유·자문·매매중개·집합투자업에 해당하지 않습니다.',
      '주식 매수 결정 도구는 단순 시뮬레이션이며, 실제 투자 종목 추천이 아닙니다. 모든 투자 손실의 책임은 투자자 본인에게 있습니다.',
      '복리·적금 계산은 약정 이율 가정으로, 실제 상품의 변동금리·중도해지·우대조건·과세(15.4% 이자소득세) 차이가 있을 수 있습니다.',
      '대출 이자·DSR·LTV는 은행별·대출종류별 산식이 다르며, 본 도구는 표준 원리금균등·체증·체감 산식 기준입니다.',
      '경매·부동산 계산은 등기부·토지대장·공시지가 등 외부 데이터 미반영. 실제 입찰·계약 전 등기·시세·법무사 검토 필수.',
      '암호화폐·해외주식·파생상품 등 고위험 자산은 본 도구의 계산 범위가 아니며, 그 결과를 적용해서는 안 됩니다.',
    ],
    legal: '본 서비스는 「자본시장법」상 금융투자업·투자자문업·투자권유대행에 해당하지 않습니다.',
    recommend: '👉 투자 결정은 금융감독원·금융소비자보호원(1332)·등록 투자자문업자·증권사 PB와 상담 후 본인 책임으로 진행하세요.',
  },
  {
    id: 'legal',
    emoji: '⚖️',
    title: '법률·민원',
    color: '#FFB83E',
    tools: '군 복무 D-day · 역사 시대 환산 · 한자·생활 단위 · 기타 법령 인용 도구',
    warnings: [
      '본 도구의 법률·법령 정보는 2026년 시점 공개 자료를 인용한 일반 정보입니다.',
      '본 서비스는 「변호사법」 제109조의 법률사무 또는 동법 제3조의 법률 자문을 수행하지 않습니다.',
      '구체적 사건·계약·민원 처리에는 본 서비스 정보를 근거로 법적 결정을 해서는 안 됩니다.',
      '법령은 수시 개정되며, 본 서비스가 최신 개정을 즉시 반영한다고 보장하지 않습니다.',
    ],
    legal: '「변호사법」 제3조·제109조에 따라 본 서비스는 법률 자문·사건 알선·소송 대리 등을 수행하지 않습니다.',
    recommend: '👉 법률 상담은 대한변협 법률구조공단(132)·서울지방변호사회(02-3476-4000)·국선변호인 제도 또는 가까운 변호사 사무실을 이용하세요.',
  },
  {
    id: 'food',
    emoji: '🍳',
    title: '식품·요리',
    color: '#FF8C3E',
    tools: '식품 보관 기간 · 해동 시간 · 발효 일정 · 베이커 퍼센트 · 염도(절임·김치) · 시럽·당도 · 튀김 온도 · 차·커피 추출',
    warnings: [
      '식품 보관·해동 시간은 일반 권장치이며, 식품의 초기 신선도·냉장고 온도·포장 상태에 따라 실제 안전 기간이 크게 달라집니다.',
      '의심스러운 색·냄새·맛·점성 변화가 있으면 즉시 폐기하세요. 식중독 위험은 시각적 판단보다 미생물 검사가 정확합니다.',
      '저당 잼·청(14~18°Bx)은 보관 중 발효·곰팡이 위험이 ↑ → 반드시 냉장 + 1~2주 내 소비.',
      '저염 절임은 보툴리눔 독소·곰팡이 위험이 ↑. 진공 포장·저온 발효 시 산도(pH ≤ 4.6) 확인 필수.',
      '알레르기·당뇨·신장질환·임신 등 특수 상황의 식단은 영양사·의사 상담 필요.',
      '본 도구는 식품의약품안전처(MFDS) 기준이 아닌 일반 가정 레시피 기준이며, 상업적 식품 제조에는 적용할 수 없습니다.',
    ],
    legal: '상업적 식품 제조·유통은 「식품위생법」·「축산물 위생관리법」·「식품등의 표시·광고에 관한 법률」 등 별도 규제를 따라야 합니다.',
    recommend: '👉 식중독 의심 시 1339(질병관리청). 식품 안전 정보는 식품의약품안전처 식품안전나라(www.foodsafetykorea.go.kr).',
  },
  {
    id: 'construction',
    emoji: '🏗️',
    title: '건축·인테리어·구조',
    color: '#9B59B6',
    tools: '벽지·페인트·바닥재·몰딩·지붕 · 전선·배관·철근·볼트 토크·스크류 · 에어컨 평형 · 조명 와트',
    warnings: [
      '건축·인테리어 계산은 표준 시공 기준 어림치이며, 실제 자재 손실(10~15%)·시공 환경·구조 안전성을 고려하지 않습니다.',
      '전선·배관·철근·볼트 사양은 「건축법」·「전기설비기술기준」·「건축구조기준(KDS)」을 우선해야 하며, 본 도구는 일반 가정용 참고치입니다.',
      '구조 계산(철근·하중·내력벽)은 반드시 건축구조기술사·건축사의 검토를 받으세요. 본 도구는 구조 안전을 보장하지 않습니다.',
      '전기 작업(220V 이상)은 「전기공사업법」에 따라 자격(전기기사·전기공사기사)이 필요하며, 무자격 시공은 화재·감전 위험이 큽니다.',
      '에어컨 평형 계산은 일반 기준이며, 단열·층고·창 면적·일사량·인원 변수에 따라 ±20% 차이가 발생합니다.',
      '도장(페인트)·접착제·석면 함유 자재 시공 시 환기·보호장구·산업안전보건법 준수 필수.',
    ],
    legal: '「건축법」·「산업안전보건법」·「전기공사업법」에 따른 자격·인허가가 필요한 작업은 본 도구의 결과만으로 시공할 수 없습니다.',
    recommend: '👉 셀프 인테리어는 안전 작업·조명·도장 수준까지. 전기·가스·구조·내력벽 변경은 반드시 자격 보유자(전기기사·가스기사·건축사) 시공.',
  },
  {
    id: 'chemical',
    emoji: '🧪',
    title: '화학·약품',
    color: '#FFA63E',
    tools: '농도 변환 (%·ppm·ppb·mg/L·g/L) · 소독액 희석 · 비료 EC',
    warnings: [
      '약품·소독액 농도 계산은 수용액 가정의 일반 환산이며, 실제 사용 농도·반응 시간은 제조사 라벨을 우선해야 합니다.',
      '⚠️ 산성 세제(식초·구연산·변기세정제) + 염소계 표백제(락스) 절대 혼합 금지 — 유독한 염소가스(Cl₂) 발생, 사망 사고 다수 보고.',
      '락스(차아염소산나트륨)·과산화수소·산성 세제는 저농도라도 피부·호흡기·눈을 자극합니다. 환기·장갑·고글 착용 필수.',
      '의료기기·전문 화학 실험에서는 보정된 기기·표준 시약 사용. 본 도구는 일반 가정 위생·정원 비료 수준만 참고.',
      '아기·반려동물·노약자가 있는 공간에서는 충분히 환기 후 잔여 화학물질을 닦아내세요.',
      '농약·살충제는 「농약관리법」 등록 제품을 안내된 농도로만 사용. 무허가 자가 혼합은 위험·불법.',
    ],
    legal: '의료용 소독·살균은 「의료기기법」·「약사법」, 농약은 「농약관리법」, 산업용 화학물질은 「화학물질관리법」을 따릅니다.',
    recommend: '👉 약품 중독·노출 시 119·1339(질병관리청). 식품의약품안전처(MFDS)·환경부 화학물질안전원의 공식 가이드 우선 참조.',
  },
  {
    id: 'sports',
    emoji: '🏃',
    title: '운동·스포츠',
    color: '#3EFFD0',
    tools: '러닝 페이스 · 마라톤 예측 · 1RM · 인터벌 트레이닝 · 골프 핸디캡·비거리·비용 · 야구·축구 통계 · 격투기 체급',
    warnings: [
      '1RM(1회 최대 중량) 추정은 Epley·Brzycki 등 공식 기반이며, 실제 시도 전 자격 트레이너 지도와 워밍업이 필수입니다.',
      '운동 강도·페이스·심박수 권장은 일반 건강인 기준이며, 심혈관 질환·고혈압·당뇨·임신·관절 부상 등이 있는 분은 반드시 의사 상담 후 시작하세요.',
      '러닝·인터벌·중량 운동 중 가슴 통증·어지럼·호흡곤란 등이 발생하면 즉시 중단하고 119에 연락.',
      '청소년·노인·재활 중인 분은 본 도구의 일반 권장치보다 보수적으로 접근하세요.',
      '경기 규칙·체급·핸디캡 산정은 해당 협회(KFA·KBA·KGA·KFC 등) 공식 규정을 우선합니다.',
    ],
    legal: '본 서비스는 「국민체육진흥법」상 전문 체육지도자(생활스포츠지도사·전문스포츠지도사)의 지도를 대체하지 않습니다.',
    recommend: '👉 부상 시 정형외과·재활의학과. 운동 처방은 자격 트레이너·물리치료사·운동처방사와 상담.',
  },
  {
    id: 'art',
    emoji: '🎨',
    title: '예술·창작·공예',
    color: '#C485E0',
    tools: '물감·잉크 혼합 · 색상 변환 · 사진 노출·화각 · 황금비율 · 뜨개질 게이지 · 글자수 · 더미 텍스트',
    warnings: [
      '본 도구의 색 시뮬레이션은 디지털 RGB 공간의 근사이며, 실제 물감·잉크의 안료 농도·매체(수성/유성)·건조 후 변색을 완전히 반영하지 않습니다. 정확한 색은 반드시 소량 테스트 후 작업하세요.',
      '잉크/페인트 혼합 전 반드시 시린지·작은 용기에서 24시간 테스트. 만년필 잉크는 다른 브랜드/베이스(dye/pigment) 혼합 시 침전·만년필 막힘 위험이 큽니다.',
      '레진·에폭시 안료 혼합은 환기·장갑·고글 착용 필수. 미경화 레진은 피부 자극·알레르기 유발. 안료는 레진 무게의 3% 이하 권장.',
      '식용 색소(푸드컬러)는 식약처 허용 식용 색소(타르·천연)만 사용. 미술용 안료를 식용으로 절대 사용 금지.',
      '뜨개질 게이지는 실 종류·블로킹·개인 손 텐션에 따라 5~15% 차이 발생. 본 도구의 계산 결과는 어림이며 실제 작업 전 반드시 게이지 스와치 측정 권장.',
      '복잡한 케이블·레이스 패턴은 단순 비율 변환이 어려우므로 패턴 변환 결과는 단순 도안(평직·메리야스)에 한해 적용.',
      '사진 노출·화각·심도 계산은 디지털 근사이며 실제 카메라·렌즈의 광학적 특성·색감·해상력은 별도 평가가 필요합니다.',
    ],
    legal: '의료용 소독·식용 색소는 「의료기기법」·「약사법」·「식품위생법」, 화학물질은 「화학물질관리법」을 따릅니다. 본 서비스의 색·안료 혼합 정보는 일반 가정·취미용 참고이며 상업적 식품 제조·의료 용도로 사용할 수 없습니다.',
    recommend: '👉 화학·식용 색소 안전 정보는 식품의약품안전처(MFDS)·환경부 화학물질안전원. 뜨개질 패턴은 디자이너 원본 사이즈 표 우선 참조.',
  },
  {
    id: 'dev',
    emoji: '🖥️',
    title: '개발자·인코딩·암호',
    color: '#C8FF3E',
    tools: 'Base64 · JSON · CSS 변환 · 진법 변환 · 해시 생성기 · 정규식 테스트기 · YAML ↔ JSON 변환 · URL 인코더/디코더 · cURL 변환기 · HTTP 상태 코드 검색기',
    warnings: [
      '본 도구의 해시 알고리즘 중 MD5·SHA-1은 충돌 공격이 알려져 비밀번호 해싱·디지털 서명·SSL 인증서 용도로 사용 금지. 파일 무결성 확인 용도로만 사용하세요.',
      '정규식 테스터의 매칭 패턴은 형식 검증용 어림 패턴이며, 주민번호·카드번호 등 개인정보 검증·저장은 KISA·OWASP 가이드 + 검증 알고리즘(체크섬)이 추가로 필요합니다.',
      'YAML ↔ JSON 변환 시 주석·앵커·별칭·커스텀 태그가 손실됩니다. K8s·Spring 등 운영 환경 설정은 변환 후 반드시 검증·테스트 후 적용하세요. YAML 1.1의 자동 타입 추론(yes/no → boolean, 8자리 → 8진수) 함정 주의.',
      'URL 추적 파라미터 정리는 일반적 광고 추적 제거 어림이며, 일부 합법적 기능(다국어 분기·캠페인 식별·인증 토큰)도 함께 제거될 수 있습니다. OAuth state·CSRF 토큰·access_token 등 보안 파라미터는 무단 수정·공유 금지.',
      'cURL 변환기의 코드 생성은 일반 케이스 가정 어림이며, 파일 업로드(@filename)·TLS 인증서·프록시 등 일부 옵션은 미지원입니다. Authorization·API 키 등 민감 헤더는 코드 복사 후 환경 변수로 옮기세요.',
      'HTTP 상태 코드 검색기의 설명·해결 힌트는 RFC 표준과 일반 경험 정리이며, 실제 오류 진단은 서버 로그·CDN 대시보드 등 추가 정보가 필요합니다. 비표준 코드(Cloudflare·nginx)는 해당 벤더 공식 문서 우선.',
      '비밀번호는 반드시 bcrypt·scrypt·Argon2 등 KDF(Key Derivation Function)를 서버 측에서 적용하세요. 클라이언트 측 단순 해싱은 보안에 무의미합니다.',
      'HMAC Secret Key·JWT 서명 키 등은 절대 공개 저장소(GitHub 등)나 클라이언트 코드에 하드코딩하지 마세요. 환경변수·Secrets Manager 사용.',
      'Base64/JSON/진법 변환 결과는 일반 데이터 처리용이며 보안·법적 효력이 있는 데이터(개인정보·금융정보) 처리에는 적절한 암호화·전송 보안이 추가로 필요합니다.',
      '본 도구는 모든 계산을 브라우저에서 수행하므로 입력 데이터가 외부로 전송되지 않으나, 공용 PC·공유 기기에서는 입력 후 브라우저 캐시·세션 저장소를 정리하세요.',
      'CSS·진법 변환 등 단순 도구라도 출력 결과의 정확성·호환성은 사용 환경(브라우저·OS·언어)에 따라 미세 차이가 있을 수 있습니다.',
    ],
    legal: '본 도구는 일반 개발 보조용이며 「전자서명법」상 공인 디지털 서명·「개인정보 보호법」상 안전성 확보 조치를 대체하지 않습니다. 「정보통신망법」상 보안 의무는 별도로 적용됩니다.',
    recommend: '👉 보안 정밀 검토는 KISA(한국인터넷진흥원)·OWASP 가이드 참고. 인증·암호화 라이브러리는 검증된 표준(NIST·RFC) 우선. 의심 시 정보보호 전문가 자문.',
  },
]

export default function DisclaimerPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        법적 고지
      </p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        ⚠️ 면책조항 (Disclaimer)
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '28px' }}>
        최종 업데이트: {LAST_UPDATED} · 「<a href="/terms" style={{ color: 'var(--accent)' }}>이용약관</a>」 제7조의 보강 문서
      </p>

      {/* 핵심 요약 */}
      <div style={{
        background: 'rgba(255, 138, 62, 0.06)',
        border: '1px solid rgba(255, 138, 62, 0.40)',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '32px',
      }}>
        <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.85, margin: 0 }}>
          <strong style={{ color: '#FFA63E' }}>핵심 요약</strong> — {SITE_NAME}의 모든 도구는{' '}
          <strong>일반 정보 제공·교육·참고 목적</strong>입니다. 의료·세무·금융·법률 등 전문가 자문이 필요한 사안에 본 서비스의 계산 결과를 단독 근거로 사용하지 마세요.
          본 서비스는 <strong>「있는 그대로(As-Is)」</strong> 제공되며 정확성·완전성·최신성을 보장하지 않습니다.
          서비스 이용으로 발생한 직접·간접 손해에 대해 운영자는 법적 책임을 지지 않습니다.
        </p>
      </div>

      {/* 분야 빠른 이동 */}
      <div style={card}>
        <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px', fontWeight: 600 }}>
          📑 분야별 빠른 이동
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {DOMAINS.map((d) => (
            <a key={d.id} href={`#${d.id}`} style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              padding: '6px 12px',
              fontSize: 12,
              color: 'var(--text)',
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              {d.emoji} {d.title}
            </a>
          ))}
        </div>
      </div>

      {/* 1. 일반 면책 */}
      <h2 style={sectionTitle}>1. 일반 면책 (As-Is · 무보증 · 책임 한계)</h2>
      <div style={card}>
        <p style={para}>
          <strong>1.1 「있는 그대로(As-Is)」 제공</strong> — 본 서비스 및 모든 계산 도구는 현재 상태 그대로 제공되며, 명시적 또는 묵시적으로 어떠한 보증(상품성·특정 목적 적합성·정확성·완전성·최신성·무중단성·무오류성)도 하지 않습니다.
        </p>
        <p style={para}>
          <strong>1.2 정확성 보장 없음</strong> — {SITE_NAME}은 도구의 계산 로직·공식·외부 인용 자료(법령·공식 요율·공인 통계)의 정확성과 최신성을 검증·보장하지 않습니다. 법령·세율·요율·물가·환율·이자율·공식 가이드는 수시로 변경되며, 본 서비스가 즉시 반영한다고 보장하지 않습니다.
        </p>
        <p style={para}>
          <strong>1.3 책임 한계</strong> — 이용자가 본 서비스의 계산 결과를 사용함으로써 발생한 직접·간접·부수·결과·징벌적 손해(데이터 손실·이익 상실·기회비용·법적 책임·신체 상해·재산 피해 등)에 대해 {SITE_NAME}, 운영자, 기여자는 어떠한 법적 책임도 지지 않습니다.
        </p>
        <p style={para}>
          <strong>1.4 전문가 자문 우선</strong> — 의료·세무·금융·법률·건축·화학·식품·운동 등 전문 분야 결정에는 반드시 해당 분야 자격 보유 전문가의 자문을 우선하세요. 본 서비스 결과만으로 결정·시행하지 마세요.
        </p>
        <p style={para}>
          <strong>1.5 사용자 책임</strong> — 입력 데이터의 정확성, 계산 결과의 해석, 결과의 실제 적용은 전적으로 이용자 본인의 책임입니다.
        </p>
      </div>

      {/* 2. 분야별 강화 면책 */}
      <h2 style={sectionTitle}>2. 분야별 강화 면책</h2>
      <p style={muted}>
        130+ 도구가 8개 위험 영역에 걸쳐 있어, 각 영역별로 추가 면책을 명시합니다. 도구 페이지 내 짧은 인라인 경고는 아래 박스의 요약입니다.
      </p>

      {DOMAINS.map((d) => (
        <div
          key={d.id}
          id={d.id}
          style={{
            background: 'var(--bg2)',
            border: `1px solid ${d.color}40`,
            borderLeft: `4px solid ${d.color}`,
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '14px',
            scrollMarginTop: '80px',
          }}
        >
          <h3 style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '18px',
            fontWeight: 700,
            color: d.color,
            margin: '0 0 6px',
          }}>
            {d.emoji} {d.title}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.7 }}>
            관련 도구: <span style={{ color: 'var(--text)' }}>{d.tools}</span>
          </p>
          <ul style={{ paddingLeft: 18, margin: '0 0 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.warnings.map((w, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.75 }}>{w}</li>
            ))}
          </ul>
          <div style={{
            background: 'var(--bg3)',
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 8,
          }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
              ⚖️ <strong style={{ color: 'var(--text)' }}>법령 관계</strong> — {d.legal}
            </p>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>
            {d.recommend}
          </p>
        </div>
      ))}

      {/* 3. 외부 자료·법령 인용 */}
      <h2 style={sectionTitle}>3. 외부 자료·법령 인용에 관한 면책</h2>
      <div style={card}>
        <p style={para}>
          본 서비스의 도구 설명·계산 공식에는 정부 부처·공공기관·학술 자료 등의 공개 정보가 인용되어 있습니다. 인용 시점의 자료를 기반으로 작성되었으므로, 다음 사항을 유의해 주세요.
        </p>
        <ul style={{ paddingLeft: 20, margin: '0 0 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li style={muted}>법령·세율·요율·통계는 개정 시점과 본 서비스 업데이트 시점 간에 시차가 발생할 수 있습니다.</li>
          <li style={muted}>외부 사이트 링크는 편의 제공 목적이며, 해당 사이트의 콘텐츠·운영에 {SITE_NAME}은 책임지지 않습니다.</li>
          <li style={muted}>인용된 공식·표준이 잘못 인용되었거나 누락된 경우 정정 요청을 환영합니다.</li>
        </ul>
        <p style={muted}>
          정확한 최신 법령은 <a href="https://www.law.go.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>국가법령정보센터(www.law.go.kr)</a>, 세제는 <a href="https://www.nts.go.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>국세청 홈택스</a>·<a href="https://www.hometax.go.kr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>국세청 126</a>에서 확인하실 수 있습니다.
        </p>
      </div>

      {/* 4. 사용자 책임 */}
      <h2 style={sectionTitle}>4. 사용자의 책임</h2>
      <div style={card}>
        <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li style={para}><strong>입력 데이터의 정확성</strong> — 잘못된 입력은 잘못된 결과를 만듭니다. 단위·소수점·기간을 반드시 확인하세요.</li>
          <li style={para}><strong>결과의 해석</strong> — 단일 수치만 보지 말고 도구 페이지의 설명·표·FAQ를 함께 참고하세요.</li>
          <li style={para}><strong>실제 적용 전 검증</strong> — 의료·금전·안전과 관련된 결과는 다른 출처(공식 기관·전문가)와 교차 확인 후 사용.</li>
          <li style={para}><strong>법령 변경 추적</strong> — 본인이 사용하는 분야의 법령·요율 개정은 직접 모니터링해 주세요.</li>
        </ul>
      </div>

      {/* 5. 신고·정정 요청 */}
      <h2 style={sectionTitle}>5. 신고·정정 요청 채널</h2>
      <div style={card}>
        <p style={para}>
          계산 오류, 잘못된 인용, 부정확한 안내, 법령 개정 미반영 등을 발견하셨다면 아래 채널로 알려주세요. 빠르게 검토·수정하겠습니다.
        </p>
        <ul style={{ paddingLeft: 20, margin: '0 0 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li style={muted}>📧 <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--accent)' }}>{CONTACT_EMAIL}</a> — 도구명·입력값·예상 결과·실제 결과를 함께 보내주시면 빠르게 처리됩니다.</li>
          <li style={muted}>💬 <Link href="/contact" style={{ color: 'var(--accent)' }}>문의 페이지</Link> — 일반 문의·기능 요청·도구 추가 제안</li>
        </ul>
        <p style={muted}>
          신고 시 개인정보(주민번호·계좌번호·연락처 등)는 절대 포함하지 마세요. 익명 신고도 환영합니다.
        </p>
      </div>

      {/* 6. 변경 이력 */}
      <h2 style={sectionTitle}>6. 변경 이력</h2>
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>날짜</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>변경 내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>2026-05-05</td>
              <td style={{ padding: '10px', color: 'var(--text)' }}>면책조항 페이지 신설(이용약관 제7조 보강) — 8개 분야별 강화 면책 추가</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>2026-04-12</td>
              <td style={{ padding: '10px', color: 'var(--text)' }}>이용약관 제7조 면책조항 작성 (금융 일반)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 마무리 */}
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginTop: 24,
      }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.8 }}>
          본 면책조항은 「<Link href="/terms" style={{ color: 'var(--accent)' }}>이용약관</Link>」의 일부를 구성합니다. 면책조항과 이용약관 간 해석상 충돌이 있을 경우, <strong style={{ color: 'var(--text)' }}>본 면책조항이 우선 적용</strong>됩니다.
          서비스 이용으로 본 면책조항에 동의한 것으로 간주됩니다.
        </p>
      </div>
    </div>
  )
}
