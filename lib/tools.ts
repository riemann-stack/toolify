export interface Tool {
  href:  string
  icon:  string
  name:  string
  desc:  string
  badge?: 'hot' | 'new'
}

export interface Category {
  id:    string
  icon:  string
  name:  string
  color: string
  tools: Tool[]
}

export const categories: Category[] = [
  {
    id: 'finance', icon: '💰', name: '금융·재테크', color: '#3EFF9B',
    tools: [
      { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '2026년 4대보험·세금 자동, 월 실수령 역산, 인상률 시뮬, 시급 환산, 연봉표', badge: 'hot' },
      { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '원리금균등·원금균등, 중도상환·갈아타기·금리 변동·역산까지. 2026년 한국 시중 금리 기준' },
      { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '거치·적립·목표역산·ISA·연금저축·인플레이션·시나리오 비교, 매년 증액·복리 주기·수수료 반영', badge: 'hot' },
      { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '단일·분할 매수, 목표 평단 역산, 회복 시나리오, 손절 vs 물타기, 미국 주식 환율·양도세·종목 비중 점검', badge: 'hot' },
      { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',        desc: '역산·견적서·실입금 역산·세금계산서·일반 vs 간이. 프리랜서·사업자 모두', badge: 'hot' },
      { href: '/tools/finance/dividend', icon: '💰', name: '월배당 목표 자산 계산기', desc: '월배당 목표 → 필요 원금·월 적립 역산, 포트폴리오, 종합과세 경계, ISA·연금 절세 비교', badge: 'hot' },
      { href: '/tools/finance/inheritance', icon: '🏛️', name: '상속·증여세 비교 계산기', desc: '관계별 공제·10년 합산·배우자 상속공제·상속인별 분배·분산 증여 시뮬레이션' },
      { href: '/tools/finance/car-cost', icon: '🚗', name: '자동차 유지비 계산기', desc: '유류비·보험·세금·소모품·감가·구매 방식·차종 비교·전기 vs 가솔린·카쉐어링 손익분기', badge: 'hot' },
      { href: '/tools/finance/real-estate', icon: '🏘️', name: '부동산 투자 수익률 계산기', desc: '매매·임대·대출 레버리지 반영 자기자본 수익률' },
      { href: '/tools/finance/cost-rate', icon: '🍽️', name: '메뉴 원가율 계산기', desc: '재료비·배달 수수료·포장재 반영 실질 원가율 및 마진' },
      { href: '/tools/finance/installment', icon: '💳', name: '카드 할부 계산기', desc: '월 납부액·총 이자·일시불 vs 무이자 비교·개월수별 분석' },
      { href: '/tools/finance/4-insurance', icon: '🏥', name: '4대보험 계산기', desc: '국민연금·건강보험·고용보험·산재보험 근로자/사업주 부담·알바·프리랜서 비교' },
      { href: '/tools/finance/ipo-deposit', icon: '💰', name: '공모주 청약 증거금 계산기', desc: '비례 → 증거금 역산 + 증거금 → 예상 주수 + 시나리오 표 + 5사6입·청약단위·한도 자동 + D-day 메모', badge: 'new' },
      { href: '/tools/finance/stock-decision', icon: '🐭', name: '주식 고민 해결사', desc: '매수/매도 자가진단 + 친칠라·고양이·동전·다트·룰렛 5가지 무작위 + 종합 다수결 + 행동경제학 7개 편향·DALBAR·Lusha 사례', badge: 'new' },
    ],
  },
  {
    id: 'health', icon: '🏃', name: '건강·웰빙', color: '#3EC8FF',
    tools: [
      { href: '/tools/health/bmi',           icon: '⚖️', name: 'BMI 계산기',                 desc: '체질량지수, 키별 정상 체중, 목표 BMI, 허리둘레·복부비만, 체중 시뮬, 체지방률 추정' },
      { href: '/tools/health/bmr',           icon: '🔥', name: '기초대사량 계산기',          desc: 'BMR·TDEE, 4공식 비교, 운동일/휴식일, 목표별 칼로리, 스마트워치 연동' },
      { href: '/tools/health/weightloss',    icon: '🎯', name: '체중 감량 기간 계산기',     desc: '안전 감량 속도, BMI 자동 체크, 목표일 역산, 정체기 반영, 식단·운동 분리, 탄단지 자동' },
      { href: '/tools/health/pregnancy',     icon: '🤰', name: '임신 주수 계산기',          desc: '임신 타임라인, 산전 검사 일정, 태아 크기 비교, 출산 준비 체크리스트, 생리주기 보정' },
      { href: '/tools/health/pet',           icon: '🐾', name: '반려동물 나이·칼로리 계산기', desc: '강아지·고양이 사람 나이, RER/DER 칼로리, 사료량(건식·습식), 체중 평가, 수명 진행률' },
      { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 소멸 계산기',     desc: 'BAC 추정·운전 가능 시각·다음날 아침 숙취 운전 체크·1차·2차·3차 누적·ALDH2 분해 속도', badge: 'hot' },
      { href: '/tools/health/supplement',    icon: '💊', name: '영양제 성분 체크 계산기',   desc: '50종 영양소 합산·오메가3 EPA+DHA·약물 상호작용·임산부·고령자 안전 체크', badge: 'hot' },
      { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 노출 가이드 계산기', desc: 'UV 지수·피부 타입·SPF 기준 일광화상 위험 시간과 자외선 차단 가이드' },
      { href: '/tools/health/cycle',           icon: '🌙', name: '생리주기·배란일 캘린더 계산기', desc: '마지막 생리일·평균 주기 → 다음 생리·배란일·가임기·PMS 원형 시각화 + 월간 캘린더 + phase별 컨디션 가이드 + localStorage 자가체크 (서버 X)', badge: 'new' },
    ],
  },
  {
    id: 'cooking', icon: '🍳', name: '요리·식품', color: '#FFB83E',
    tools: [
      { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율·단위 변환 계산기', desc: '인분 자동 계산, 큰술↔g↔ml 단위 환산, 양념 자동 보정, 레시피 저장, 장보기 리스트' },
      { href: '/tools/cooking/thawing', icon: '🧊', name: '냉동·해동 시간 계산기',    desc: '식품·두께·무게·전자레인지 W별 4가지 해동 방법 비교, 위험도 카드, 식품별 조리 팁, 해동 시작·완료 시각 자동' },
      { href: '/tools/cooking/unit',    icon: '🥄', name: '요리 단위 변환기',         desc: '재료별 컵·큰술·g 정확 환산' },
      { href: '/tools/cooking/sourdough', icon: '🍞', name: '사워도우 스타터 계산기', desc: '르방 안정화 진단·피크 시간 예측·급이 스케줄러' },
      { href: '/tools/cooking/frying',    icon: '🍳', name: '튀김 시간·온도 계산기',   desc: '재료별 최적 기름 온도·튀김 시간·에어프라이어 변환 가이드' },
      { href: '/tools/cooking/nuts',      icon: '🥜', name: '견과류 하루 적정 섭취량 계산기', desc: '12종 견과류 알 수·칼로리·영양소 + 혼합 직접 입력 + 알레르기 필터 + 셀레늄 자동 경고 + 인기 믹스 6종' },
      { href: '/tools/cooking/serving',   icon: '🍽️', name: '1인분 분량 계산기',         desc: '재료별 인분 분량 + 합산 장보기 마크다운 + 냉장고 재료 빼기 + 가족 구성 저장 + 채식·비건·글루텐프리 필터' },
      { href: '/tools/cooking/food-storage', icon: '🧊', name: '식재료 보관 기간 계산기', desc: '냉장·냉동 식재료 보관 기간 추적·소비 기한 알림' },
      { href: '/tools/cooking/substitute', icon: '🔄', name: '식재료 대체 비율 계산기', desc: '버터·설탕·계란·생크림·한국 식재료(참기름·고추장·된장 등 14종+) 50종+ 대체 비율, 비건·글루텐프리 옵션' },
      { href: '/tools/cooking/baker-percent', icon: '🥖', name: '베이커 퍼센트 계산기', desc: '제빵 배합비·수분율·르방 자동 계산, 빵 종류별 프리셋 8종' },
      { href: '/tools/cooking/baking-schedule', icon: '🍞', name: '제빵 타임라인 계산기', desc: '빵 종류·시작·완성 시간으로 오토리즈, 폴딩, 발효, 굽기 일정 자동 생성' },
      { href: '/tools/cooking/ramen', icon: '🍜', name: '라면 물양 계산기', desc: '1~4개·국물 농도·토핑·라면별 권장 물양과 조리 시간. 신라면·짜파게티·불닭·비빔면 모두', badge: 'new' },
      { href: '/tools/cooking/baking-recipe', icon: '🧁', name: '베이킹 레시피 계산기', desc: '마들렌·파운드·쿠키·머핀·마카롱 등 제과 10종 비율 자동·진단·식감 보정·틀 용량 분량 변환·프리셋 17종', badge: 'new' },
    ],
  },
  {
    id: 'life', icon: '🎲', name: '생활·재미', color: '#FF8C3E',
    tools: [
      { href: '/tools/life/lotto',         icon: '🎰', name: '로또 번호 생성기·확률 시뮬레이터', desc: '8가지 생성 모드, 번호 분석, 가상 추첨, 1등 체감 시뮬, 당첨금 세후 계산', badge: 'hot' },
      { href: '/tools/life/random',        icon: '🎲', name: '랜덤 추첨기·룰렛·팀 편성', desc: '가중치 추첨, 룰렛, 팀 나누기, 발표 순서, 자리 배치, 공정성 검증까지' },
      { href: '/tools/life/ladder',        icon: '🪜', name: '사다리타기',          desc: '캐릭터 16종, 6가지 공개 모드(한 명씩·전체·익명·역추적), 자동 채우기, 6 템플릿' },
      { href: '/tools/life/dutch',         icon: '🍻', name: '더치페이·N빵 계산기', desc: '술값 분리·개인별 메뉴·선결제자 최소 송금·카톡 공유, 8가지 상황 프리셋' },
      { href: '/tools/life/zodiac',        icon: '🐯', name: '띠·별자리 계산기',    desc: '띠·별자리·60갑자·오행·탄생석 통합 카드 + 두 사람 궁합 시뮬(삼합·육합·충) + 가족 띠 비교' },
      { href: '/tools/life/pomodoro',      icon: '🍅', name: '뽀모도로 타이머',     desc: '7가지 프리셋(클래식·딥워크·수능·DeskTime), 일일·주간 통계, 작업명·연속일수, 알림음·브라우저 알림·키보드 단축키' },
      { href: '/tools/life/alcohol',       icon: '🍺', name: '알코올 도수 계산기',  desc: '잔 단위 프리셋·소맥·하이볼·목표 도수 희석(맥주·탄산수)·같은 알코올량 비교·1인당 분배·기준 도수 변환' },
      { href: '/tools/life/golden-ratio',  icon: '🌀', name: '황금 비율 계산기',    desc: 'φ = 1.618 가로·세로 계산, 황금 직사각형·나선 시각화, 비율 비교 (황금·백은·16:9·A4·인스타·유튜브)' },
      { href: '/tools/life/drake',         icon: '👽', name: '드레이크 방정식 계산기', desc: '7개 변수 시뮬 + 가장 가까운 문명 거리·왕복 통신·인류 전파권·페르미 역설 가설 자동 추천' },
      { href: '/tools/life/laundry-dry',   icon: '🧺', name: '빨래 건조 시간 계산기', desc: '온도·습도·소재 + 보유 장비별 최단 건조 조합 추천·전기료 비교·목표 시간 역산·욕실 건조' },
      { href: '/tools/life/monty-hall',    icon: '🚪', name: '몬티홀 문제 시뮬레이터', desc: '3·10·100·1000문 N문 확장 시뮬, 4가지 변형 규칙(표준·무작위·몬티 폴·악마), 수렴 그래프, 베이즈 추론' },
      { href: '/tools/life/fart-risk',     icon: '💨', name: '방귀 유발 가능성 계산기', desc: '가스량·냄새·복부팽만 3축 점수, 원인 유형 분류, 저FODMAP 대체, 8가지 증상별 대처' },
      { href: '/tools/life/unit-price',    icon: '🏷️', name: '단가 비교 계산기',        desc: '마트·편의점·코스트코 가격·용량·개수 즉시 비교. 1+1·2+1은 개수 2·3·소비 가능량·실질 단가까지' },
    ],
  },
  {
    id: 'sports', icon: '⛳', name: '스포츠', color: '#FFD93E',
    tools: [
      { href: '/tools/sports/fight-weight',    icon: '🥊', name: '격투기 체급 계산기',     desc: '복싱·UFC·MMA 체급별 감량 계획·D-day 일정·위험도' },
      { href: '/tools/sports/baseball-stats',  icon: '⚾', name: '야구 타율·OPS 계산기',   desc: '타율·출루율·장타율·OPS·ERA·WHIP 및 KBO 비교' },
      { href: '/tools/sports/football-points', icon: '⚽', name: '축구 승점·순위 계산기',  desc: '승무패·득실차·목표 승점·라이벌 추격 시나리오' },
      { href: '/tools/sports/pace',            icon: '🏃', name: '러닝 페이스 계산기',     desc: '페이스↔완주 시간 1줄 입력, 트레드밀 시속, 5km·10km·하프·풀 구간 스플릿' },
      { href: '/tools/sports/race-predictor',  icon: '🏅', name: '마라톤 기록 예측 계산기', desc: '5km·10km·하프 → 풀 3공식 평균 + 목표 역산 + 기온·습도·고도·연령 자동 보정 + VDOT 추이 그래프' },
      { href: '/tools/sports/one-rm',          icon: '🏋️', name: '1RM 계산기',             desc: '12종 1RM·RPE 보정·성연령 수준·워밍업 5세트 자동·진행 그래프' },
      { href: '/tools/sports/interval-training',icon: '🏃‍♂️', name: '인터벌 훈련 계산기',   desc: 'VDOT 기반 인터벌 페이스·1바퀴 랩타임·다거리 추천·4~16주 풀 스케줄·한국 대회' },
      { href: '/tools/sports/buildup',         icon: '📈', name: '러닝 빌드업 훈련 계산기', desc: '거리·페이스·구간·프로파일 → 구간별 페이스표 + 시각화 + 안전성 체크 + 워치 포맷 + 12개 프리셋', badge: 'new' },
      { href: '/tools/sports/golf-handicap',     icon: '⛳', name: '골프 핸디캡 계산기',     desc: 'WHS 핸디캡 지수·코스 핸디캡·네트·스태블포드 + 라운드 자동 저장 + 발전 추이 + 자주 가는 골프장' },
      { href: '/tools/sports/golf-cost',         icon: '🏌️', name: '골프 라운딩 비용 계산기', desc: '그린피·카트·캐디·식사·교통 1인당 정산 + 회원권 손익 + 자주 가는 골프장 저장' },
      { href: '/tools/sports/golf-distance',     icon: '🎯', name: '골프 클럽 비거리 계산기', desc: 'DR·7I 입력 → 전체 클럽 비거리 자동 추정 + 환경 보정(바람·고도·기온) + Gap 자동 분석 + 내 기록' },
    ],
  },
  {
    id: 'interior', icon: '🏠', name: '주거·인테리어', color: '#E89757',
    tools: [
      { href: '/tools/interior/room-area',     icon: '📐', name: '공간 면적 계산기',           desc: '벽·바닥·천장·평수·부피 한 번에 (도배·페인트·에어컨 활용)' },
      { href: '/tools/interior/ventilation',   icon: '💨', name: '실내 환기량·CADR 계산기',     desc: '공간 부피·인원·ACH로 필요 환기량, 공기청정기 CADR, CO₂ 위험, 창문 환기 시간', badge: 'new' },
      { href: '/tools/interior/wallpaper',     icon: '🧱', name: '도배 소요량 계산기',         desc: '벽지 롤 수·면적·셀프 시공 비용 견적' },
      { href: '/tools/interior/paint',         icon: '🎨', name: '페인트 소요량 계산기',       desc: '벽·천장 면적·칠할 횟수·페인트 종류별 필요량 및 구매 조합' },
      { href: '/tools/interior/curtain-blind', icon: '🪟', name: '커튼·블라인드 사이즈 계산기', desc: '창문 사이즈로 커튼·블라인드·롤스크린 추천 사이즈' },
      { href: '/tools/interior/lighting',      icon: '💡', name: '조명 밝기 계산기',           desc: '공간별 권장 루멘·조명 개수·W↔lm 환산·색온도 가이드' },
      { href: '/tools/interior/ac-capacity',   icon: '❄️', name: '에어컨 평형 계산기',         desc: '면적·향·층수·단열 반영 추천 평형 및 BTU·W 환산' },
      { href: '/tools/interior/flooring',      icon: '🪵', name: '바닥재 소요량 계산기',       desc: '장판·강화마루·강마루·원목·데코타일 박스 수·비용 계산' },
      { href: '/tools/interior/molding',       icon: '📏', name: '몰딩 길이 계산기',           desc: '천장 몰딩·걸레받이·띠몰딩 길이·개수·비용 계산' },
      { href: '/tools/interior/roof',          icon: '🏠', name: '지붕 면적 계산기',           desc: '박공·모임·외쪽·평지붕·맞배 5가지 + 물매/경사각 + 처마·로스율 → 평면·표면·자재 면적·평수·자재별 일반 단가', badge: 'new' },
    ],
  },
  {
    id: 'unit', icon: '📐', name: '단위·변환', color: '#B03EFF',
    tools: [
      { href: '/tools/unit/converter',     icon: '📐', name: '통합 단위 변환기',         desc: '길이·면적·무게·부피·온도·시간·속도·압력·데이터 9개 + 한국 전통 단위(자·근·돈·평·홉·되)', badge: 'new' },
      { href: '/tools/unit/area',          icon: '🏠', name: '평수 ↔ ㎡ 변환기',          desc: '아파트 평형 환산, 전용·공급·계약면적, 평형별 방 크기 가이드' },
      { href: '/tools/unit/size',          icon: '🛍️', name: '해외 직구 사이즈 변환기',    desc: 'US·EU·UK → 한국 의류·신발·속옷·반지 사이즈, 브랜드별 차이 가이드' },
      { href: '/tools/unit/battery',       icon: '🔋', name: '배터리 용량 변환기',         desc: 'mAh·Wh·Ah 변환, 비행기 반입 가능 여부, 보조배터리 가이드' },
      { href: '/tools/unit/fuel-economy',  icon: '⛽', name: '연비 단위 변환기',           desc: 'km/L·L/100km·mpg, 전기차 전비, 연료별 100km 비용 비교' },
      { href: '/tools/unit/tire-pressure', icon: '🛞', name: '타이어 공기압 변환기',       desc: 'psi·kPa·bar, 차량별 권장 공기압, 계절별 관리 가이드' },
    ],
  },
  {
    id: 'date', icon: '📅', name: '날짜·시간', color: '#FF3E8C',
    tools: [
      { href: '/tools/date/age',         icon: '🎂', name: '만 나이·생일·인생 통계 계산기', desc: '만 나이부터 D-day, 1만일 기념, 인생 시간 통계, 띠·별자리·생일 카운트다운까지', badge: 'hot' },
      { href: '/tools/date/dday',        icon: '📅', name: 'D-day 계산기·일정 관리', desc: '여러 D-day 저장, 진행률·평일·영업일·페이스 계산, 반복 D-day, 두 날짜 사이까지' },
      { href: '/tools/date/military',    icon: '🎖️', name: '군 전역일·복무율 계산기', desc: '전역일·복무율 계산' },
      { href: '/tools/date/history-era', icon: '📜', name: '역사 연호·연대 변환기',   desc: '단기·불기·조선왕·간지·일본·중국 연호 변환 + 단군~현재 통합 연표 + 한·중·일 동시' },
      { href: '/tools/date/lunar',       icon: '🌙', name: '양음력 변환기',           desc: '음력 ↔ 양력 날짜 변환 · 간지 확인' },
      { href: '/tools/date/jet-lag',     icon: '✈️', name: '시차 적응 계산기',          desc: '여행 전·중·후 시차 적응 일정·수면 타이밍 계산' },
      { href: '/tools/date/life-time',   icon: '⏳', name: '생애 시간 계산기',         desc: '기대수명 기준 살아온 시간·앞으로의 시간·행동 가치 환산' },
    ],
  },
  {
    id: 'music', icon: '🎵', name: '음악', color: '#C83EFF',
    tools: [
      { href: '/tools/music/vocal-range', icon: '🎤', name: '보컬 음역대 측정기', desc: '마이크로 실시간 음정 감지, 최저음·최고음 자동 측정, 한국 노래 30+ 곡 키 매칭', badge: 'new' },
      { href: '/tools/music/bpm',       icon: '🎛️', name: 'BPM 딜레이 타임 계산기', desc: '딜레이·리버브 ms 값 즉시 계산' },
      { href: '/tools/music/frequency', icon: '🎵', name: '주파수 음정 변환기',    desc: 'Hz ↔ 음정 변환·MIDI 번호·파장 계산' },
      { href: '/tools/music/capo',      icon: '🎸', name: '기타 카포·전조 계산기', desc: '카포 위치별 코드 변환·쉬운 코드 추천' },
      { href: '/tools/music/tap-tempo', icon: '👆', name: '탭 템포 계산기',         desc: '탭으로 BPM 측정·메트로놈·박자감 테스트' },
      { href: '/tools/music/chord',     icon: '🎹', name: '코드 구성음 계산기',     desc: 'Cmaj7·Dm7 등 코드 구성음·역방향 검색·다이아토닉 코드표' },
    ],
  },
  {
    id: 'edu', icon: '🔬', name: '교육·학습', color: '#3EFFD0',
    tools: [
      { href: '/tools/edu/planet-comparison', icon: '🪐', name: '행성 비교 시각화', desc: '8개 행성에서 내 몸무게·나이·하루 길이가 어떻게 다른지 시각화' },
      { href: '/tools/edu/cosmic-calendar',   icon: '🌌', name: '코스믹 캘린더',     desc: '138억 년 우주 역사를 1년 달력으로 압축한 인터랙티브 타임라인' },
      { href: '/tools/edu/circuit-simulator', icon: '⚡', name: '옴의 법칙 시뮬레이터', desc: '직렬·병렬 회로 전압·전류·저항·전력 시각화 + 단계별 풀이·시험 빈출 7문제' },
      { href: '/tools/edu/sound-speed',        icon: '🔊', name: '음속 시뮬레이터',     desc: '천둥·번개 거리, 소리 도달 시간, 빛 vs 소리 비교, 반향·에코·RT60' },
      { href: '/tools/edu/review-interval',    icon: '🧠', name: '복습 간격 계산기',     desc: '에빙하우스 망각곡선·SM-2 알고리즘으로 다음 복습일 계산, 학습 항목 관리' },
      { href: '/tools/edu/cognitive-test',     icon: '🧠', name: '인지 능력 테스트',     desc: '반응속도·스트룹 효과·이중 과제로 집중력과 인지 처리 속도를 측정하는 게임' },
      { href: '/tools/edu/fermi-estimate',     icon: '🧮', name: '페르미 추정 계산기',   desc: '문제를 변수로 쪼개고 시나리오로 비교해 대략적인 답을 추정하는 사고력 도구' },
    ],
  },
  {
    id: 'dev', icon: '🖥️', name: '개발자·텍스트', color: '#C8FF3E',
    tools: [
      { href: '/tools/dev/charcount', icon: '🔡', name: '글자수 세기',          desc: '공백 포함·제외 실시간 카운트' },
      { href: '/tools/dev/base64',    icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트 ↔ Base64 즉시 변환' },
      { href: '/tools/dev/json',      icon: '📋', name: 'JSON 포맷터',          desc: 'JSON 정렬·압축·유효성 검사' },
      { href: '/tools/dev/lorem',     icon: '📝', name: '더미 텍스트·UI 콘텐츠 생성기', desc: '문단·버튼·카드·리뷰·JSON 더미 데이터까지 UI 목업에 바로 쓸 수 있는 종합 더미 콘텐츠 생성기' },
      { href: '/tools/dev/color',     icon: '🎨', name: '색상 코드 변환·디자인 도구', desc: 'HEX·RGB·HSL·OKLCH·알파 변환부터 WCAG 대비비, 팔레트, Tailwind 매칭, CSS 변수, 그라디언트, 이미지 추출' },
      { href: '/tools/dev/css-converter', icon: '🎨', name: 'CSS 값 변환기',    desc: 'px·rem·em·clamp()·aspect-ratio CSS 단위 변환 및 생성' },
      { href: '/tools/dev/number-base',   icon: '🔢', name: '진법 변환기',       desc: '2진·8진·10진·16진 변환, 비트 시각화, 2의 보수, ASCII, 비트 연산' },
    ],
  },
]

// 전체 툴 flat 배열 (검색·홈 인기 툴용)
export const allTools: Tool[] = categories.flatMap(c => c.tools)

// 총 툴 수
export const totalTools = allTools.length
