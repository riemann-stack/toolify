// ─────────────────────────────────────────────────────────────
// 똑똑한 도구 검색 — 토큰화·접미사 제거·초성·별칭·이름·설명 통합 + 스코어링
//
//  · 질의를 공백으로 토큰화 → "계산기/계산/변환기…" 같은 접미사·불용 토큰 제거
//    ("퇴직금 계산" → 퇴직금, "연봉계산기" → 연봉). 남는 게 없으면 원문 그대로 검색.
//  · 다중 토큰은 모든 필수 토큰이 name/alias/desc/초성 어딘가에 매치(AND)해야 하고 필수 토큰 평균 점수.
//    공백을 뺀 전체 구(phrase)도 한 토큰으로 따로 채점해 더 높은 쪽을 쓴다("양도 소득세").
//    금액 숫자("연봉 3000")·타이핑 중 마지막 토큰(1글자, "계사"처럼 접미사를 치다 만 것)은 선택 토큰:
//    평균에 넣지 않고, 못 맞춘 도구만 개당 ×0.92 ("5km 페이스" → 페이스 점수 그대로, 5km 없는 도구만 감점).
//    opts.partial이면 AND 0건일 때 일부 토큰만 맞는 도구를 partial=true로 낮은 점수에 돌려준다("혹시 이 도구?" 용).
//  · 공백 없이 치다 만 접미사("연봉계", "퇴직금계사", "양도세ㄱ")는 끝부분을 접미사로 보고 어근도 함께 채점.
//  · 별칭은 완전일치 우선. 접두·부분 확장은 "질의가 어휘에 없는 미완성 단어"일 때만
//    (타이핑 중 "양도" → 양도세). 이미 완결된 단어면 일반 접두 확장은 하지 않는다
//    → "나이"↛나이프(경도), "볼트"↛볼트 붙은 다른 도구. 단, 별칭이 "완결 단어 + 또 하나의 단어"인
//    복합어면 낮은 점수(50)로 잡는다("연금"→연금저축, "마라톤"→마라톤페이스). 예외: EXACT_ONLY_ALIASES
//    ("퍼센트"↛퍼센트인코딩(URL)).
//  · 이름 부분일치는 2자 이상만(1자는 단어 시작만) → "술"↛기술 스택.
//  · 초성("ㅇㅂ")·초성+음절 혼합("연ㅂ", IME 조합 중)도 지원.
//
// 회귀 테스트: npx tsx scripts/search-regression.mts  ·  tests/search.test.mts
// 별칭을 바꾸면 반드시 회귀 스크립트를 돌려 전후 비교할 것.
// ─────────────────────────────────────────────────────────────
import { categories, allTools, type Tool, type Category } from './tools'

// ── 한글 초성 ─────────────────────────────────────────────────
const INITIALS = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

function charInitial(ch: string): string {
  const code = ch.charCodeAt(0)
  if (code >= 0xAC00 && code <= 0xD7A3) {
    return INITIALS[Math.floor((code - 0xAC00) / 28 / 21)]
  }
  return ch
}

export function toInitials(s: string): string {
  return Array.from(s).map(charInitial).join('')
}

const INITIAL_SET = new Set(INITIALS)
function isAllInitials(s: string): boolean {
  if (!s) return false
  for (const ch of s) if (!INITIAL_SET.has(ch)) return false
  return true
}
function hasInitial(s: string): boolean {
  for (const ch of s) if (INITIAL_SET.has(ch)) return true
  return false
}

// ── 별칭/태그 (href → 동의어·연관 키워드) ────────────────────
// 자주 검색되는 도구 위주로 큐레이션. 정의 안 된 도구도 name/desc/초성으로 검색됨.
// 공백·하이픈은 비교 시 제거되므로 '자동차 취득세' = '자동차취득세'.
// 키가 레지스트리에 없는 href여도 무시될 뿐 오류는 나지 않는다(도구 삭제·병합 과도기 안전).
export const TOOL_ALIASES: Record<string, string[]> = {
  // 금융
  '/tools/finance/salary':       ['월급', '실수령', '세후', '세전', '연봉', '근로소득', '월급계산', '실수령액', '세금', '소득세', '시급'],
  '/tools/finance/loan':         ['주담대', '신용대출', '대출', '이자', '원리금', '갈아타기', '중도상환', '대환', '주택담보대출'],
  '/tools/finance/dsr':          ['DSR', 'LTV', '스트레스DSR', '스트레스 DSR', '대출한도', '총부채원리금상환비율', '담보인정비율', '주담대한도', '부채', 'DTI'],
  // compound는 월복리 투자 계산기 — 은행 예·적금(단리) 질의는 deposit-interest가 받는다(2026-09-26 신설)
  '/tools/finance/compound':     ['복리', '적립', '재테크', '이자수익', '투자수익'],
  '/tools/finance/deposit-interest': ['예금', '적금', '예적금', '예금이자', '적금이자', '정기예금', '정기적금', '만기수령액', '세후이자',
                                  '이자소득세', '이자세금', '단리', '비과세종합저축', '상호금융', '새마을금고', '예탁금', '금융소득종합과세'],
  // 구 stock-decision(주식 매도·매수 심리 진단) 통합(2026-09-26) — 투자 심리 7대 편향 가이드
  '/tools/finance/stock':        ['물타기', '평단', '평균단가', '주식', '추가매수', '손절', '익절', '주식매수', '주식매도', '팔까살까', '투자심리', '결정장애', '행동경제학',
                                  '투자편향', 'fomo', '손실회피', '매몰비용', '확증편향', '앵커링', '주식고민', '매도'],
  '/tools/finance/vat':          ['vat', '부가세', '매입세', '매출세', '세금계산서', '사업자', '간이과세'],
  '/tools/finance/dividend':     ['배당', '배당주', '월배당', 'isa', '연금', '인컴'],
  '/tools/finance/inheritance':  ['상속', '증여', '상속세', '증여세', '상속공제', '세대생략'],
  '/tools/finance/car-cost':     ['차', '차값', '차유지비', '카', '자차', '유류비', '자동차유지', '주유비', '연료비'],
  // 일반 '취득세'·'양도세'는 부동산 도구 몫 — 여기엔 자동차 한정 표현만
  '/tools/finance/car-tax':      ['자동차세', '자동차 취득세', '차량 취득세', '중고차 취득세', '자동차 양도', '유류세', '공채', '환경부담금', '자동차세금', '차량세금'],
  '/tools/finance/real-estate':  ['부동산', '갭투자', '월세', '전세', '임대수익', '레버리지', '임대'],
  '/tools/finance/housing-score':['청약', '가점', '특공', '특별공급', '청약통장', '무주택'],
  '/tools/finance/cost-rate':    ['원가', '마진', '음식점', '메뉴가격', '식당', '카페'],
  '/tools/finance/installment':  ['할부', '카드할부', '무이자', '할부이자'],
  '/tools/finance/4-insurance':  ['4대보험', '국민연금', '건강보험', '건강보험료', '고용보험', '산재', '4대보험료'],
  // 알바·주휴수당 전용 도구(2026-09-26 신설) — 4대보험의 알바 탭보다 이쪽이 질의 의도에 맞다
  '/tools/finance/hourly-pay':   ['알바', '아르바이트', '알바비', '알바월급', '알바 급여', '주휴수당', '주휴', '시급계산', '주급', '야간수당', '휴일수당',
                                  '연장수당', '가산수당', '최저시급', '최저임금', '파트타임', '단시간', '휴게시간'],
  '/tools/finance/annual-leave': ['연차', '연차수당', '연차휴가', '유급휴가', '월차', '연차 발생', '연차 정산', '비례연차', '회계연도 연차', '미사용 연차'],
  '/tools/finance/ipo-deposit':  ['공모주', '청약', '증거금', 'ipo', '균등배정'],

  // 건강
  '/tools/health/bmi':           ['bmi', '체질량', '비만도', '비만지수', '비만'],
  '/tools/health/bmr':           ['bmr', '기초대사량', '대사량', '활동대사', '칼로리'],
  '/tools/health/weightloss':    ['다이어트', '체중감량', '감량', '식단', '체지방'],
  '/tools/health/blood-alcohol': ['혈중알코올', '음주', '음주측정', '술', '대리운전', 'bac'],
  '/tools/health/sleep-debt':    ['수면부채', '잠빚', '몰아자기', '수면', '잠'],
  '/tools/health/caffeine':      ['카페인', '커피', '에너지드링크'],
  '/tools/health/pregnancy':     ['임신', '출산', '예정일', '임신주수'],
  '/tools/health/cycle':         ['생리', '월경', '생리주기', '배란', '가임기'],
  '/tools/health/supplement':    ['영양제', '비타민', '보충제'],
  '/tools/health/uv-protection': ['자외선', '선크림', 'spf', 'pa'],
  '/tools/health/pet':           ['반려동물', '강아지', '고양이', '펫'],

  // 운동
  '/tools/sports/vo2max':        ['vo2max', '최대산소', '유산소', '체력', '쿠퍼', '락포트'],
  // 구 race-plan(레이스 페이스 플래너) 통합(2026-09-26) — [레이스 플랜] 탭(?tab=plan)
  '/tools/sports/pace':          ['페이스', '러닝페이스', '마라톤페이스', '페이스플랜', '레이스플랜', '레이스페이스', '페이스플래너', '스플릿', '네거티브스플릿',
                                  '레이스플래너', '레이스페이스플래너', '페이스분배', '구간별페이스', '코스고도', '코스고도보정', '언덕', '언덕보정', '언덕페이스', '오르막페이스', 'gap', '통과시각', '페이스밴드'],
  '/tools/sports/buildup':       ['빌드업', '러닝', '인터벌', '러닝빌드업'],
  // '고도보정'은 대회 개최지 고도(고지대) 보정 — pace의 코스 언덕 보정은 '코스고도보정'·'언덕보정'
  '/tools/sports/race-predictor':['vdot', '레이스예측', '마라톤', '풀코스', '하프', '고도보정', '고지대'],
  // 구 lsd(LSD·이지런 페이스) 통합(2026-09-26) — [이지·LSD] 탭(?tab=easy)
  '/tools/sports/interval-training': ['인터벌', '인터벌트레이닝', '스피드', 'lsd', '이지런', '존2', 'zone2', '롱런', '조깅',
                                  '이지페이스', '롱슬로디스턴스', '정크마일', '회색지대', '존2심박', '롱런보급', '8020러닝', '대화가능페이스'],
  '/tools/sports/hyrox':         ['하이록스', 'HYROX', '하이룩스', '완주시간', '월볼', '썰매밀기', '스키에르그', '크로스핏레이스'],
  '/tools/sports/one-rm':        ['1rm', '원알엠', '근력', '벤치프레스', '데드리프트', '스쿼트'],
  '/tools/sports/formation':     ['포메이션', '축구', '442', '433'],
  '/tools/sports/baseball-stats': ['타율', '출루율', '장타율', 'ops', '야구'],
  '/tools/sports/golf-handicap': ['핸디캡', '골프핸디', '골프'],
  '/tools/sports/golf-distance': ['비거리', '골프거리'],
  '/tools/sports/golf-cost':     ['골프비용', '라운딩비'],
  '/tools/sports/hiking-time':   ['등산', '산행시간', '코스타임'],
  '/tools/sports/fight-weight':  ['감량', '체급', '계체', '복싱', '격투기'],

  // 생활
  '/tools/life/lotto':           ['로또', '복권', '추첨', '번호생성'],
  '/tools/life/dutch':           ['더치페이', '엔빵', 'n빵', '비용분배'],
  '/tools/life/customs':         ['관세', '해외직구', '직구', '관세계산'],
  '/tools/life/alcohol':         ['술', '주량', '음주', '술도수'],
  '/tools/life/drake':           ['드레이크', '외계인', '문명', '페르미'],
  '/tools/life/monty-hall':      ['몬티홀', '확률', '문제'],
  '/tools/life/ladder':          ['사다리', '사다리타기', '제비뽑기'],
  '/tools/life/random':          ['랜덤', '무작위', '추첨'],
  '/tools/life/pomodoro':        ['뽀모도로', '집중', '타이머', '시간관리'],
  '/tools/life/packing':         ['짐싸기', '패킹', '여행준비'],
  '/tools/life/travel-budget':   ['여행예산', '여행비용', '환전'],
  '/tools/life/zodiac':          ['띠', '별자리', '간지', '12간지'],
  '/tools/life/unit-price':      ['단위가격', '용량비교', '가성비'],

  // 날짜
  // 구 life-time(생애 시간 계산기) 통합(2026-09-26) — 인생 통계 탭 › 기대수명 보기(?tab=life)
  '/tools/date/age':             ['나이', '만나이', '연나이', '수명', '기대수명', '인생시간', '생애시간', '남은시간',
                                  '기대여명', '생명표', '메멘토모리', '인생진행률', '인생시계', '하루의가치', '1만시간'],
  '/tools/date/dday':            ['디데이', 'd-day', '날짜계산', '며칠'],
  '/tools/date/server-time':     ['서버시간', '네이비즘', '한국시간', 'ntp', '티켓팅'],
  '/tools/date/lunar':           ['음력', '양력', '음력변환'],
  '/tools/date/jet-lag':         ['시차', '제트래그', '해외여행'],
  '/tools/date/timezone':        ['시간대', '타임존', '시간변환', 'UTC', 'KST', 'EST', 'PST', 'BST', '서머타임', 'DST', '뉴욕시간', 'LA시간', '런던시간', '시드니시간', '인도시간', '회의시간'],
  '/tools/date/military':        ['군대', '군복무', '전역', '말년'],

  // 단위
  // '토크' 단독·N·m·kgf·m은 토크 분야 몫 (볼트 체결 토크는 screw의 '체결토크')
  '/tools/unit/converter':       ['단위변환', '미터', '인치', '파운드', 'kg', 'lb', 'eV', '전자볼트', '토크', 'n·m', 'kgf·m', 'lbf·ft'],
  '/tools/unit/area':            ['평수', '평', '제곱미터', '평계산'],
  '/tools/unit/size':            ['옷사이즈', '신발사이즈', '치수'],
  '/tools/unit/fuel-economy':    ['연비', 'mpg', 'km/l'],
  '/tools/unit/tire-pressure':   ['타이어공기압', 'psi', '공기압', '타이어계산기', '타이어규격', '205/55R16', '타이어외경', '인치업', '트레드마모', '타이어교체시기', 'DOT제조일자', '제조주차'],
  '/tools/unit/hardness':        ['경도', 'hrc', 'hrb', 'hv', 'hb', '로크웰', '비커스', '브리넬', '칼경도', '강재', '나이프', '칼덕', 'astm', '인장강도'],
  '/tools/unit/viscosity':       ['점도', 'viscosity', 'cp', 'cst', 'sus', 'sae', 'iso vg', '엔진오일', '0w-20', '5w-30', '윤활유', '유압유', '동점도', '절대점도'],
  '/tools/unit/brewing':         ['brix', 'plato', 'sg', '비중', '당도', 'baume', '보메', 'oechsle', '왹슬레', 'abv', 'proof', '도수', '자가양조', '홈브루잉', '와인', '잼', '치즈', 'ph', '산도'],
  '/tools/unit/radiation':       ['방사선', 'sievert', '시버트', 'msv', 'usv', 'gray', 'rad', 'bq', '베크렐', 'curie', '큐리', '방사능', 'ct', '엑스레이', 'x-ray', 'sar', 'emf', '전자파', '후쿠시마'],
  '/tools/unit/battery':         ['배터리용량', 'mah', '보조배터리'],

  // 개발자
  '/tools/dev/base64':           ['base64', '인코딩', '디코딩'],
  // 구 yaml-json(YAML ↔ JSON 변환기) 통합(2026-09-26) — [YAML ↔ JSON] 탭(?tab=yaml)
  '/tools/dev/json':             ['json', '포맷터', 'json포맷', 'yaml', 'yml', 'json변환', 'yaml변환',
                                  'yaml to json', 'json to yaml', 'yaml검증', 'k8s', 'kubernetes', 'kubectl', 'docker compose', 'github actions', 'helm', 'openapi', 'swagger'],
  '/tools/dev/regex':            ['정규식', 'regex', 'regexp'],
  '/tools/dev/hash':             ['해시', 'md5', 'sha', 'sha256', 'hmac'],
  '/tools/dev/url-encode':       ['url인코딩', 'urlencode', '퍼센트인코딩', '인코딩', '디코딩'],
  '/tools/dev/curl':             ['curl', 'fetch', 'axios', 'api호출'],
  '/tools/dev/http-status':      ['http', '상태코드', '404', '500', '403'],
  '/tools/dev/number-base':      ['진법', '2진법', '16진법', 'hex', 'binary'],
  '/tools/dev/css-converter':    ['css단위', 'px', 'rem', 'em', 'clamp'],
  '/tools/dev/network-test':     ['핑', 'ping', '인터넷속도', '회선', '티켓팅'],
  '/tools/dev/token-counter':    ['토큰', 'token', 'gpt', 'claude', 'gemini', 'ai비용', 'api비용', 'tokenizer', 'tiktoken', '프롬프트', '컨텍스트'],
  '/tools/dev/og-preview':       ['og', 'opengraph', '오픈그래프', '메타태그', '카카오톡', '카톡', '미리보기', '썸네일', 'twitter card', 'facebook', 'linkedin', 'slack', 'og:image'],

  // 교육
  '/tools/edu/gpa-converter':    ['학점', 'gpa', '학점환산', '4.5', '4.3', 'wes', '유학', '평점', 'a+', '평어', '백분위'],
  // 구 sci-units(과학 단위 변환기) 통합(2026-09-26) — [과학적 표기] 탭(?tab=notation): 표기·접두어·스케일 단위·물리 상수
  // (eV·전자볼트는 단위 변환기 에너지 분야가 지원하므로 /tools/unit/converter)
  '/tools/edu/sig-figs':         ['유효숫자', '유효숫자계산', '반올림', '오차', '오차전파', '상대오차', '절대오차', '백분율오차', '불확도', '측정오차', '실험보고서', '일반물리실험', '일반화학실험', 'significant figures', 'error propagation',
                                  '과학단위', '과학적표기', '공학적표기', 'SI접두어', '나노', '마이크로', '물리상수', '지수변환',
                                  '광년', '옹스트롬', 'angstrom', '파섹', '천문단위', '과학적표기법', '지수표기', '지수표기법'],

  // 인테리어
  '/tools/interior/wallpaper':   ['벽지', '도배', '도배지'],
  '/tools/interior/paint':       ['페인트', '도장'],
  '/tools/interior/wire':        ['전선', '굵기', 'sq', '전기'],
  // 구 bolt-wrench(볼트 스패너 계산기) 통합(2026-09-26) — [볼트·스패너] 탭(?tab=bolt)
  // '토크' 단독은 넣지 않는다 — 단위 변환기(/tools/unit/converter)의 토크(N·m↔kgf·m) 분야 몫. 볼트 토크는 '체결토크'·'볼트 토크'로
  '/tools/interior/screw':       ['나사', '피스', '앵커', '볼트', '렌치', '스패너', '알렌렌치', '볼트규격',
                                  '볼트스패너', '스패너사이즈', '소켓사이즈', '육각렌치', '알렌렌치사이즈', '와셔', '너트', '체결토크', '강도등급', '공구세트'],
  '/tools/interior/flooring':    ['바닥재', '마루', '장판', '강마루'],
  '/tools/interior/ventilation': ['환기', '환풍'],
  '/tools/interior/room-area':   ['방크기', '면적', '평수'],
  '/tools/interior/ac-capacity': ['에어컨', '평형', 'btu', '냉방'],
  '/tools/interior/lighting':    ['조명', '루멘', '와트', 'led'],
  '/tools/interior/curtain-blind':['커튼', '블라인드'],
  '/tools/interior/molding':     ['몰딩', '걸레받이'],
  '/tools/interior/pipe':        ['배관', '파이프', '관경'],
  '/tools/interior/rebar':       ['철근', '배근'],
  '/tools/interior/roof':        ['지붕', '경사'],

  // 요리
  '/tools/cooking/kimjang':      ['김장', '배추', '김치', '겉절이'],
  '/tools/cooking/holiday-table':['명절', '차례상', '제사상', '상차림'],
  '/tools/cooking/recipe':       ['레시피', '인분', '레시피변환'],
  // 구 cake-pan(케이크 팬 호수 변환) 통합(2026-09-26) — [케이크 팬] 탭(?tab=pan)
  // '레시피 배율'은 넣지 않는다 — 인분 배율은 /tools/cooking/recipe(레시피 비율 계산기) 몫
  '/tools/cooking/baking-recipe':['베이킹', '제빵', '베이커퍼센트', '케이크', '케이크팬', '케이크틀', '케이크 호수', '호수', '원형틀', '무스링',
                                  '케이크팬호수', '호수변환', '케이크1호', '1호케이크', '케이크인치', '무스링사이즈', '제누와즈틀', '베이킹틀'],
  '/tools/cooking/baker-percent':['베이커퍼센트', '제빵비율', '제빵'],
  '/tools/cooking/egg-timer':    ['계란', '반숙', '완숙', '삶기'],
  '/tools/cooking/ramen':        ['라면', '라면물'],
  '/tools/cooking/brew':         ['커피', '드립', '브루잉', '원두'],
  '/tools/cooking/microwave':    ['전자레인지', '데우기', '와트'],
  '/tools/cooking/thawing':      ['해동', '냉동', '냉장해동'],

  // 음악/예술
  // 구 bpm(BPM 딜레이 계산기) 통합(2026-09-26) — [딜레이 계산] 탭(?tab=delay)
  '/tools/art/tap-tempo':        ['탭템포', 'bpm측정', 'bpm', '템포', '비트', '메트로놈', '딜레이', '딜레이타임', 'bpm딜레이',
                                  '딜레이ms', '프리딜레이', '리버브', '점음표', '셋잇단', 'daw딜레이'],
  '/tools/art/chord':            ['코드', '화성', '기타', '기타코드', '피아노코드'],
  '/tools/art/capo':             ['카포', '기타'],
  '/tools/art/scale':            ['스케일', '음계', '조'],
  '/tools/art/frequency':        ['주파수', '튜닝', 'a440', 'hz'],
  '/tools/art/vocal-range':      ['음역대', '음역', '보컬'],
  '/tools/art/color':            ['색상', 'hex', 'rgb', '컬러', '팔레트'],
  '/tools/art/gradient-generator': ['그라데이션', '그라디언트', 'css그라데이션'],
  '/tools/art/lorem':            ['로렘입숨', '더미텍스트', 'lorem'],
  '/tools/art/charcount':        ['글자수', '글자수세기', '띄어쓰기'],
  '/tools/art/fov':              ['fov', '화각', '카메라'],
  '/tools/art/exposure':         ['노출', '조리개', '셔터스피드', 'iso'],

  // 금융 추가
  '/tools/finance/savings':      ['저축', '월저축', '저축률', '재무진단', '6항아리', '청년도약', 'isa', '연금저축'],
  '/tools/finance/severance':    ['퇴직금', '퇴직', '평균임금', '퇴사일', '퇴직일'],
  '/tools/finance/freelance-tax':['프리랜서', '3.3', '종합소득세', '사업소득', '세금'],
  '/tools/finance/auction':      ['경매', '부동산', '부동산경매', '낙찰가'],
  '/tools/finance/acquisition-tax': ['취득세', '부동산 취득세', '주택 취득세', '아파트 취득세', '취득세율', '다주택 취득세', '취득세 중과', '생애최초',
                                  '증여 취득세', '상속 취득세', '신축 취득세', '원시취득', '오피스텔 취득세', '지방교육세', '농특세', '일시적 2주택'],
  '/tools/finance/brokerage-fee': ['복비', '중개보수', '중개수수료', '부동산 수수료', '부동산 중개수수료', '중개보수 요율', '월세 복비', '전세 복비', '중개비'],
  '/tools/finance/rent-jeonse':  ['전월세', '전세월세', '전세전환', '월세전환'],
  '/tools/finance/gold-converter': ['금시세', '돈', '한돈', '금변환', '금값'],
  '/tools/finance/historical-money': ['화폐사', '화폐가치', '환', '구원', '옛날돈', '인플레이션', '구매력', '화폐개혁', '1953', '1962', 'cpi', '소비자물가지수'],

  // ── 커버리지 보강 (2026-07) — 별칭 없던 도구 일괄 추가 ──────
  // 금융
  '/tools/finance/year-end-tax': ['연말정산', '환급', '13월의월급', '결정세액', '신용카드공제', '월세공제', '세금'],
  '/tools/finance/capital-gains-tax': ['양도세', '양도소득세', '주택 양도세', '부동산 양도세', '1주택', '12억비과세', '장특공', '장기보유특별공제'],
  '/tools/finance/property-holding-tax': ['보유세', '재산세', '종부세', '종합부동산세', '공시가격', '공시지가'],
  '/tools/finance/unemployment-benefit': ['실업급여', '구직급여', '퇴사', '실업수당', '수급기간'],
  '/tools/finance/national-pension': ['국민연금', '연금', '노령연금', '연금수령', '조기수령', '연기연금', '예상수령액'],
  '/tools/finance/wealth-rank': ['자산순위', '순자산', '상위1퍼센트', '상위10퍼센트', '부자기준'],

  // 건강
  '/tools/health/child-height': ['예상키', '키계산', '자녀키', '아이키', '유전키', 'mph'],

  // 요리
  '/tools/cooking/sourdough': ['사워도우', '스타터', '르방', '천연발효종', '급이'],
  '/tools/cooking/frying': ['튀김', '튀김온도', '에어프라이어', '기름온도'],
  '/tools/cooking/nuts': ['견과류', '아몬드', '호두', '하루견과'],
  '/tools/cooking/serving': ['1인분', '분량', '장보기', '식단'],
  '/tools/cooking/food-storage': ['보관기간', '유통기한', '소비기한', '냉동보관', '냉장보관'],
  '/tools/cooking/substitute': ['대체재료', '재료대체', '버터대체', '베이킹파우더'],
  '/tools/cooking/tea': ['차', '홍차', '녹차', '말차', '우롱차', '냉침'],
  '/tools/cooking/baking-schedule': ['제빵일정', '발효시간', '오토리즈', '빵굽기'],
  '/tools/cooking/fruit-syrup': ['과일청', '매실청', '레몬청', '유자청', '청담그기'],

  // 생활
  '/tools/life/travel-tip': ['팁', '팁문화', '팁계산', '미국팁'],
  '/tools/life/laundry-dry': ['빨래', '건조시간', '빨래건조', '제습'],
  '/tools/life/cleaning': ['청소', '세제', '락스', '희석', '곰팡이', '기름때'],
  // life/fart-risk 삭제 결정 — 건강 카테고리 FODMAP 도구로 재작성되면 거기에 ['방귀','가스','복부팽만','포드맵','fodmap']
  '/tools/life/gift-money': ['축의금', '부의금', '조의금', '경조사', '결혼식', '장례식', '봉투'],
  '/tools/life/vin-decoder': ['차대번호', 'vin', '차량식별번호', '연식조회'],

  // 스포츠
  // 구 football-points(축구 승점 계산기) 통합(2026-09-26) — [시즌 승점] 탭(?tab=season)
  '/tools/sports/league-scenarios': ['경우의수', '순위경우의수', '승자승', '골득실', '조별리그', '16강', '승점', '리그순위', '축구승점',
                                  '시즌승점', 'k리그승점', 'epl승점', '우승가능성', '강등승점', '잔류승점', 'ppg', '라이벌추격',
                                  '순위', '월드컵', '월드컵경우의수', '챔스', '챔피언스리그', '타이브레이커', '목표승점'],
  '/tools/sports/swim-pace': ['수영', '수영페이스', 'swolf', '스울프', '자유형', '접영'],
  '/tools/sports/climbing-grade': ['클라이밍', '볼더링', '암벽', 'v등급', '난이도'],
  '/tools/sports/strength-level': ['3대', '3대500', '파워리프팅', '윌크스', 'wilks', 'dots'],
  '/tools/sports/grip-size': ['그립', '그립사이즈', '테니스그립', '배드민턴그립'],

  // 단위
  '/tools/unit/window-tint': ['썬팅', '선팅', '틴팅', 'vlt', '투과율', '열차단'],

  // 날짜
  '/tools/date/holiday-bridge': ['연휴', '연차 붙이기', '징검다리', '샌드위치휴일', '대체공휴일'],
  '/tools/date/history-era': ['연호', '단기', '불기', '간지', '조선왕조', '갑자'],
  '/tools/date/schengen': ['쉥겐', '솅겐', '유럽여행', '무비자', '90일', '체류기간'],

  // 예술·창작
  '/tools/art/golden-ratio': ['황금비', '황금비율', '1.618', '비율'],
  '/tools/art/paint-mix': ['물감', '색혼합', '물감섞기', '조색'],
  '/tools/art/knit-gauge': ['뜨개질', '게이지', '니트', '코바늘', '대바늘'],
  '/tools/art/print-resolution': ['dpi', 'ppi', '해상도', '인쇄', '메가픽셀'],
  '/tools/art/morse-code': ['모스부호', '모스', 'sos', 'nato', '음성기호'],

  // 교육
  '/tools/edu/planet-comparison': ['행성', '화성', '목성', '중력', '행성몸무게'],
  '/tools/edu/cosmic-calendar': ['우주달력', '빅뱅', '우주역사', '칼세이건'],
  '/tools/edu/circuit-simulator': ['옴의법칙', '회로', '전압', '전류', '저항', '직렬', '병렬'],
  '/tools/edu/sound-speed': ['음속', '천둥', '번개', '소리속도', '마하'],
  '/tools/edu/room-mode': ['룸모드', '룸어쿠스틱', '정재파', '슈로더', '베이스트랩'],
  '/tools/edu/review-interval': ['복습', '에빙하우스', '망각곡선', '암기', 'anki'],
  '/tools/edu/cognitive-test': ['반응속도', '스트룹', '집중력테스트', '인지테스트'],
  '/tools/edu/fermi-estimate': ['페르미', '페르미추정', '어림계산', '추정'],

  // 개발자 (dev/tech-stack 삭제 결정 — 별칭 제거)
  '/tools/dev/keyboard-layout': ['한영타', 'dkssud', '한영변환', '한타', '영타', '한영키'],
  '/tools/dev/jwt': ['jwt', '토큰', '디코딩', '토큰디코딩', 'accesstoken', 'payload', 'exp'],
  '/tools/dev/cron': ['크론', 'crontab', '크론탭', '스케줄러', '주기실행'],
}

// ── 카테고리 인덱스 ────────────────────────────────────────────
const HREF_TO_CATEGORY: Map<string, Category> = (() => {
  const map = new Map<string, Category>()
  for (const c of categories) for (const t of c.tools) map.set(t.href, c)
  return map
})()

export function categoryOf(href: string): Category | undefined {
  return HREF_TO_CATEGORY.get(href)
}

// ── 검색 결과 ─────────────────────────────────────────────────
export interface SearchHit {
  tool: Tool
  category?: Category
  score: number
  /** 다중 토큰 질의에서 AND 결과가 0건이라 일부 토큰만 맞은 추천 결과 ("혹시 이 도구?") */
  partial?: boolean
}

// ── 정규화 ───────────────────────────────────────────────────
/** 비교용 압축형 — 소문자 + 공백·하이픈·가운뎃점·밑줄 제거 */
function compact(s: string): string {
  return s.toLowerCase().replace(/[\s\-·_]+/g, '')
}

const WORD_SPLIT = /[\s·,/()[\]{}<>↔→←~!?:;"'“”‘’|&=*#@…+]+/
/** 이름·설명을 단어 단위로 (각 단어는 compact, 끝 마침표 제거) */
function toWords(s: string): string[] {
  return s.toLowerCase().split(WORD_SPLIT).map(w => compact(w.replace(/\.+$/, ''))).filter(Boolean)
}

// 질의 접미사 — 길이 내림차순으로 검사. 남는 부분이 비지 않을 때만 제거.
const QUERY_SUFFIXES = [
  '계산하기', '변환하기', '계산기', '계산법', '변환기', '생성기', '환산기', '측정기',
  '테스트', '구하기', '하는법', '사이트', '계산', '변환', '생성', '환산', '방법', '조회', '표',
]
// 1글자 어근을 남기면 오탐이 큰 접미사 — 남는 부분이 2자 이상일 때만 ('목표'→'목' 방지)
const NEEDS_LONG_STEM = new Set(['조회', '표', '방법', '생성'])
/** 토큰 자체가 불용어면 AND 조건에서 제외 ("퇴직금 계산" → 퇴직금) */
const STOP_TOKENS = new Set([...QUERY_SUFFIXES, '얼마', '추천', '공식', '온라인', '무료'])

// 별칭 뒤에 붙어도 같은 의도로 보는 꼬리 (조사·단위성 접미)
const ALIAS_TAILS = new Set(['은', '는', '이', '가', '을', '를', '의', '에', '도', '만', '로', '으로', '에서', '까지', '일', '값', '액', '료', '별', '얼마'])

// 복합어 별칭("연금저축" = 연금 + 저축)의 뒷말로 인정하는 일반 명사 — 어휘(별칭·이름 단어)에 더해 쓴다.
// 완결 단어 질의("연금")가 이 형태의 별칭을 가진 도구를 낮은 점수(50)로 잡게 한다.
const COMPOUND_TAIL_WORDS = ['수익', '한도', '관리', '분배', '비교', '가격', '공제', '예측', '플랜']
// 앞말이 수식어일 뿐이라 앞말만으로 찾으면 오탐인 복합어 별칭 (compact 형) — "퍼센트"↛URL 인코더
const EXACT_ONLY_ALIASES = new Set(['퍼센트인코딩'])

// 초성 질의 접미사 ("ㅇㅂㄱㅅㄱ" → ㅇㅂ) — 남는 부분이 2자 이상일 때만
const INITIAL_SUFFIXES = ['ㄱㅅㄱ', 'ㅂㅎㄱ', 'ㅅㅅㄱ', 'ㄱㅅ', 'ㅂㅎ']

/** 금액·수치 토큰 ("3000", "5000만원", "30%") — 매치되면 반영, 안 되면 AND 조건에서 제외 */
const NUMERIC_TOKEN = /^[\d.,]+(만원|천원|원|만|억|%|kg|g|cm|m|km|평|세|살|개월|년|시간|분)?$/

function stripSuffix(t: string): string {
  if (isAllInitials(t)) {
    for (const s of INITIAL_SUFFIXES) {
      if (t.length - s.length >= 2 && t.endsWith(s)) return t.slice(0, -s.length)
    }
    return t
  }
  for (const s of QUERY_SUFFIXES) {
    if (t.length > s.length && t.endsWith(s)) {
      const rest = t.slice(0, -s.length)
      if (NEEDS_LONG_STEM.has(s) && rest.length < 2) continue
      return rest
    }
  }
  return t
}

/** 받침 무시·초성 허용 접두 비교용 — 불용 토큰 전체(접미사 + 얼마·추천…) */
const STOP_CHARS = [...STOP_TOKENS].map(s => Array.from(s))
const MAX_STOP_LEN = Math.max(...STOP_CHARS.map(s => s.length))

/** 불용 토큰을 치다 만 상태인가 ("계", "계사", "계ㅅ", "계산ㄱ" ⊂ 계산기) */
function isPartialStop(tail: readonly string[]): boolean {
  return STOP_CHARS.some(s => s.length >= tail.length && patternPrefix(s.join(''), tail, true))
}

/**
 * 공백 없이 접미사를 치다 만 토큰 → 어근 ("연봉계"·"연봉계ㅅ" → 연봉, "퇴직금계사" → 퇴직금, "양도세ㄱ" → 양도세).
 * 어근은 2자 이상이고 어휘에 있는 완결 단어일 때만 ("세계"↛세, "인생"↛인). 없으면 ''.
 */
function stripPartialSuffix(t: string, words: ReadonlySet<string>): string {
  const ch = Array.from(t)
  for (let k = Math.min(ch.length - 2, MAX_STOP_LEN); k >= 1; k--) {
    const stem = ch.slice(0, ch.length - k).join('')
    if (words.has(stem) && isPartialStop(ch.slice(ch.length - k))) return stem
  }
  return ''
}

// 도구 이름의 "핵심어" 추출용 (나이 계산기 → 나이, 글자수 세기 → 글자수)
const NAME_SUFFIXES = [...QUERY_SUFFIXES, '세기', '테스트기', '검색기', '해석기', '추천기', '트래커', '시뮬레이터', '플래너', '진단']
function nameCoreOf(nameCompact: string): string {
  for (const s of NAME_SUFFIXES) {
    if (nameCompact.length > s.length && nameCompact.endsWith(s)) return nameCompact.slice(0, -s.length)
  }
  return nameCompact
}

// ── 인덱스 ───────────────────────────────────────────────────
interface IndexedTool {
  tool: Tool
  category?: Category
  name: string
  nameCore: string
  nameWords: string[]
  nameInit: string
  nameWordInits: string[]
  aliases: string[]
  aliasInits: string[]
  desc: string
  descWords: string[]
  slugWords: string[]
  catWords: string[]
}

function indexTool(tool: Tool, aliasList: readonly string[], category?: Category): IndexedTool {
  const name = compact(tool.name)
  const nameWords = toWords(tool.name)
  const aliases = Array.from(new Set(aliasList.map(compact).filter(Boolean)))
  const slug = tool.href.split('/').filter(Boolean)
  return {
    tool,
    category,
    name,
    nameCore: nameCoreOf(name),
    nameWords,
    nameInit: toInitials(name),
    nameWordInits: nameWords.map(toInitials),
    aliases,
    aliasInits: aliases.map(toInitials),
    desc: compact(tool.desc),
    descWords: toWords(tool.desc),
    slugWords: (slug[slug.length - 1] ?? '').split('-').filter(Boolean),
    catWords: category ? [...toWords(category.name), category.id.toLowerCase()] : [],
  }
}

// ── 필드별 채점 ───────────────────────────────────────────────
function scoreName(e: IndexedTool, t: string): number {
  if (t === e.name) return 100
  if (t === e.nameCore) return 98
  if (e.name.startsWith(t)) return 88
  if (e.nameWords.includes(t)) return 82
  if (e.nameWords.some(w => w.startsWith(t))) return 76
  if (t.length >= 2 && e.name.includes(t)) return 66
  return 0
}

/**
 * complete = 질의 토큰이 이미 어휘(별칭·이름 단어)에 있는 완결 단어 → 일반 접두·부분 확장 금지.
 * 단 별칭이 "질의 + 또 하나의 단어(tails)"인 복합어면 50 ("연금" → 연금저축, "이자" → 이자수익).
 */
function scoreAlias(e: IndexedTool, t: string, complete: boolean, tails: ReadonlySet<string>): number {
  let s = 0
  for (const a of e.aliases) {
    if (a === t) return 90
    if (!complete) {
      if (a.startsWith(t)) s = Math.max(s, 72)                       // 타이핑 중: 양도 → 양도세
      else if (t.length >= 3 && a.includes(t)) s = Math.max(s, 56)   // 소득세 → 종합소득세
    } else if (t.length >= 2 && a.length - t.length >= 2 && a.startsWith(t) && !EXACT_ONLY_ALIASES.has(a) && tails.has(a.slice(t.length))) {
      s = Math.max(s, 50)                                            // 복합어: 마라톤 → 마라톤페이스
    }
    // 질의가 별칭 + 조사·짧은 꼬리: "퇴직금얼마", "전역일" ⊃ 전역 (전기요금 ⊅ 전기, 나이프 ⊅ 나이)
    if (a.length >= 2 && t.length > a.length && t.startsWith(a) && ALIAS_TAILS.has(t.slice(a.length))) s = Math.max(s, 60)
  }
  return s
}

function scoreDesc(e: IndexedTool, t: string): number {
  if (e.descWords.includes(t)) return 42
  if (t.length >= 2 && e.descWords.some(w => w.startsWith(t))) return 38   // 조사 흡수: 양도세를
  if (t.length >= 3 && e.desc.includes(t)) return 30
  return 0
}

function scoreMeta(e: IndexedTool, t: string): number {
  if (/^[a-z0-9]{2,}$/.test(t) && e.slugWords.some(w => w.startsWith(t))) return 36
  if (e.catWords.some(w => w === t || (t.length >= 2 && w.startsWith(t)))) return 25
  return 0
}

function scoreText(e: IndexedTool, t: string, complete: boolean, tails: ReadonlySet<string>): number {
  const n = scoreName(e, t)
  const a = scoreAlias(e, t, complete, tails)
  const d = scoreDesc(e, t)
  const best = Math.max(n, a, d, scoreMeta(e, t))
  if (best === 0) return 0
  const fields = (n > 0 ? 1 : 0) + (a > 0 ? 1 : 0) + (d > 0 ? 1 : 0)
  return best + 3 * Math.max(0, fields - 1)   // 여러 필드에서 맞으면 소폭 가산
}

/** 초성 전용 질의 ("ㅇㅂ" → 연봉) */
function scoreInitials(e: IndexedTool, q: string): number {
  let base = 0
  if (e.nameInit.startsWith(q)) base = 90
  else if (q.length >= 2 && e.nameWordInits.some(w => w.startsWith(q))) base = 66
  else if (q.length >= 2 && e.nameInit.includes(q)) base = 50
  let alias = 0
  for (const ai of e.aliasInits) {
    if (ai === q) { alias = 84; break }
    if (q.length >= 2 && ai.startsWith(q)) alias = Math.max(alias, 60)
  }
  if (!base) return alias
  if (!alias) return base
  return base + (alias === 84 ? 6 : 4)
}

/** 초성·음절 혼합 접두 패턴 ("연ㅂ" ⊂ 연봉). lastOpen이면 받침 없는 마지막 음절은 받침을 붙여 봐도 됨("연보" ⊂ 연봉) */
function patternPrefix(target: string, p: readonly string[], lastOpen: boolean): boolean {
  const tc = Array.from(target)
  if (p.length > tc.length) return false
  for (let i = 0; i < p.length; i++) {
    const c = p[i]
    const x = tc[i]
    if (INITIAL_SET.has(c)) { if (charInitial(x) !== c) return false; continue }
    if (x === c) continue
    if (lastOpen && i === p.length - 1) {
      const cc = c.charCodeAt(0) - 0xAC00
      const xc = x.charCodeAt(0) - 0xAC00
      if (cc >= 0 && cc <= 11171 && cc % 28 === 0 && xc >= 0 && xc <= 11171 && Math.floor(cc / 28) === Math.floor(xc / 28)) continue
    }
    return false
  }
  return true
}

function scorePattern(e: IndexedTool, t: string, lastOpen: boolean): number {
  const p = Array.from(t)
  if (patternPrefix(e.name, p, lastOpen)) return 85
  if (e.nameWords.some(w => patternPrefix(w, p, lastOpen))) return 76
  if (e.aliases.some(a => patternPrefix(a, p, lastOpen))) return 72
  return 0
}

/** 받침 없는 음절로 끝나는가 (IME 조합 중일 수 있음: "연보" → 연봉) */
function endsWithOpenSyllable(t: string): boolean {
  const code = t.charCodeAt(t.length - 1) - 0xAC00
  return code >= 0 && code <= 11171 && code % 28 === 0
}

// ── 검색기 ───────────────────────────────────────────────────
export interface SearchOptions {
  /**
   * 다중 토큰 AND 결과가 0건일 때, 일부 토큰만 맞는 도구를 partial=true·낮은 점수로 돌려준다.
   * 기본 false — 0건 화면의 "혹시 이 도구?" 추천에서만 켤 것.
   */
  partial?: boolean
}

export type ToolSearchFn = (rawQuery: string, limit?: number, opts?: SearchOptions) => SearchHit[]

interface QueryTerm {
  /** 원형 + 접미사 제거형 — 채점은 둘 중 높은 쪽 */
  variants: string[]
  /** AND·평균에서 제외하고, 못 맞춘 도구만 ×0.92 (금액 숫자, 타이핑 중인 마지막 1글자·접미사 조각) */
  optional: boolean
}

/**
 * 도구 목록 + 별칭 맵으로 검색 함수를 만든다 (테스트에서 임의 데이터로 호출 가능).
 * 별칭 키가 목록에 없는 href여도 무시된다.
 */
export function createToolSearch(
  tools: readonly Tool[],
  aliases: Readonly<Record<string, readonly string[]>>,
  categoryLookup: (href: string) => Category | undefined = () => undefined,
): ToolSearchFn {
  const index = tools.map(t => {
    const list = Object.prototype.hasOwnProperty.call(aliases, t.href) ? aliases[t.href] : undefined
    return indexTool(t, Array.isArray(list) ? list : [], categoryLookup(t.href))
  })
  // 완결 단어 어휘: 별칭 전체 + 이름 단어 + 이름 핵심어
  const vocab = new Set<string>()
  for (const e of index) {
    for (const a of e.aliases) vocab.add(a)
    for (const w of e.nameWords) vocab.add(w)
    vocab.add(e.nameCore)
  }
  const compoundTails = new Set([...vocab, ...COMPOUND_TAIL_WORDS])

  /**
   * 어휘에 있는 단어('음주측정', '타이어계산기')는 그대로, 아니면 접미사 제거형도 함께. 수치는 단위 뗀 형도 ('3.3%' → 3.3).
   * typing(질의 끝 토큰)이면 치다 만 접미사를 뗀 어근도 ('연봉계' → 연봉).
   */
  // 어휘 단어의 앞부분인지 — 실제 단어를 치는 중('음주측' → 음주측정)이면 끝을 접미사 조각으로 자르지 않는다
  const vocabList = [...vocab]
  const isVocabPrefix = (t: string): boolean => vocabList.some(w => w.length > t.length && w.startsWith(t))

  const variantsOf = (t: string, typing = false): string[] => {
    if (vocab.has(t)) return [t]
    const num = NUMERIC_TOKEN.test(t) ? t.replace(/[^\d.,]+$/, '') : ''
    const out = [t]
    const stripped = num || stripSuffix(t)
    if (stripped && stripped !== t) out.push(stripped)
    if (typing && !num && !isVocabPrefix(t)) {
      const stem = stripPartialSuffix(t, vocab)
      if (stem && !out.includes(stem)) out.push(stem)
    }
    return out
  }

  const scoreToken = (e: IndexedTool, t: string): number => {
    if (isAllInitials(t)) return scoreInitials(e, t)
    if (hasInitial(t)) return scorePattern(e, t, false)
    const complete = vocab.has(t)
    const s = scoreText(e, t, complete, compoundTails)
    if (s > 0 || complete || !endsWithOpenSyllable(t)) return s
    return Math.round(scorePattern(e, t, true) * 0.85)   // IME 조합 중 폴백
  }

  const scoreVariants = (e: IndexedTool, variants: readonly string[]): number => {
    let best = 0
    for (const v of variants) best = Math.max(best, scoreToken(e, v))
    return best
  }

  return function search(rawQuery: string, limit: number = 8, opts: SearchOptions = {}): SearchHit[] {
    const rawTokens = rawQuery.trim().toLowerCase().split(/\s+/).map(compact).filter(Boolean)
    if (!rawTokens.length) return []

    // 불용 토큰("계산기", "계산") 제거 — 전부 불용어면 원문 그대로
    const meaningful = rawTokens.filter(t => !STOP_TOKENS.has(t))
    const base = Array.from(new Set(meaningful.length ? meaningful : rawTokens))
    const allNumeric = base.every(t => NUMERIC_TOKEN.test(t))
    const last = base.length - 1
    // 타이핑 중인 끝 토큰: 1글자이거나 불용 토큰을 치다 만 조각("퇴직금 계사")이면 선택.
    // 단 어휘 단어의 앞부분이면 실제 단어를 치는 중으로 보고 필수 유지("공시" → 공시가격, ≠ 공식)
    const typingTail = (t: string): boolean => {
      const ch = Array.from(t)
      if (ch.length === 1) return true
      if (vocab.has(t) || !isPartialStop(ch)) return false
      return !isVocabPrefix(t)
    }
    const terms: QueryTerm[] = base.map((t, i) => ({
      variants: variantsOf(t, i === last),
      optional: base.length > 1 && ((!allNumeric && NUMERIC_TOKEN.test(t)) || (i === last && typingTail(t))),
    }))
    if (terms.every(t => t.optional)) for (const t of terms) t.optional = false

    // 공백 없는 전체 구 — "양도 소득세" → 양도소득세, "음주 측정" → 음주측정. 구 전체 일치는 소폭 가산.
    const phrases: string[] = []
    if (rawTokens.length > 1) {
      const single = new Set(terms.flatMap(t => t.variants))
      for (const p of [rawTokens.join(''), base.join('')]) {
        for (const v of variantsOf(p, true)) if (!single.has(v) && !phrases.includes(v)) phrases.push(v)
      }
    }

    const hits: SearchHit[] = []
    const partials: SearchHit[] = []
    for (const e of index) {
      let requiredSum = 0
      let required = 0
      let matchedRequired = 0
      let missedOptional = 0
      for (const term of terms) {
        const s = scoreVariants(e, term.variants)
        if (term.optional) {
          if (s === 0) missedOptional++
        } else {
          required++
          if (s > 0) { requiredSum += s; matchedRequired++ }
        }
      }
      // 평균은 필수 토큰만 — 선택 토큰의 낮은 점수(5km가 desc에만 걸림)가 평균을 끌어내리지 않게.
      // 선택 토큰을 못 맞춘 도구는 맞춘 도구보다 약간 아래로 ("3.3% 세금" → 프리랜서 > 연봉)
      let score = required > 0 && matchedRequired === required
        ? (requiredSum / required) * Math.pow(0.92, missedOptional)
        : 0
      if (phrases.length) {
        const ps = scoreVariants(e, phrases)
        if (ps > 0) score = Math.max(score, ps + 4)
      }

      const badge = e.tool.badge === 'hot' ? 2 : e.tool.badge === 'new' ? 1 : 0
      if (score > 0) {
        hits.push({ tool: e.tool, category: e.category, score: score + badge })
      } else if (opts.partial && matchedRequired > 0) {
        partials.push({ tool: e.tool, category: e.category, score: (requiredSum / required) * 0.8 + badge, partial: true })
      }
    }

    const out = hits.length ? hits : partials
    out.sort((a, b) => b.score - a.score)
    return out.slice(0, limit)
  }
}

let defaultSearch: ToolSearchFn | null = null

/** 사이트 레지스트리(lib/tools.ts) 대상 검색. 인덱스는 첫 호출 때 한 번 만든다. */
export function searchTools(rawQuery: string, limit: number = 8, opts?: SearchOptions): SearchHit[] {
  if (!defaultSearch) defaultSearch = createToolSearch(allTools, TOOL_ALIASES, categoryOf)
  return defaultSearch(rawQuery, limit, opts)
}
