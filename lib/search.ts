// ─────────────────────────────────────────────────────────────
// 똑똑한 도구 검색 — 초성·별칭·이름·설명 통합 + 스코어링
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

// ── 별칭/태그 (href → 동의어·연관 키워드) ────────────────────
// 자주 검색되는 도구 위주로 큐레이션. 정의 안 된 도구도 name/desc/초성으로 검색됨.
export const TOOL_ALIASES: Record<string, string[]> = {
  // 금융
  '/tools/finance/salary':       ['월급', '실수령', '세후', '세전', '연봉', '근로소득', '월급계산', '실수령액'],
  '/tools/finance/loan':         ['주담대', '신용대출', '대출', '이자', '원리금', '갈아타기', '중도상환', '대환'],
  '/tools/finance/dsr':          ['DSR', 'LTV', '스트레스DSR', '스트레스 DSR', '대출한도', '총부채원리금상환비율', '담보인정비율', '주담대한도', 'DTI'],
  '/tools/finance/compound':     ['복리', '적금', '적립', '예금', '재테크', '이자수익', '투자수익'],
  '/tools/finance/stock':        ['물타기', '평단', '평균단가', '주식', '추가매수', '손절', '익절'],
  '/tools/finance/vat':          ['vat', '부가세', '매입세', '매출세', '세금계산서', '사업자', '간이과세'],
  '/tools/finance/dividend':     ['배당', '배당주', '월배당', 'isa', '연금', '인컴'],
  '/tools/finance/inheritance':  ['상속', '증여', '상속세', '증여세', '상속공제', '세대생략'],
  '/tools/finance/car-cost':     ['차값', '차유지비', '카', '자차', '유류비', '자동차유지', '주유비', '연료비'],
  '/tools/finance/car-tax':      ['취득세', '자동차세', '유류세', '공채', '환경부담금', '양도세', '자동차세금'],
  '/tools/finance/real-estate':  ['부동산', '갭투자', '월세', '전세', '임대수익', '레버리지', '임대'],
  '/tools/finance/housing-score':['청약', '가점', '특공', '특별공급', '청약통장', '무주택'],
  '/tools/finance/cost-rate':    ['원가', '마진', '음식점', '메뉴가격', '식당', '카페'],
  '/tools/finance/installment':  ['할부', '카드할부', '무이자', '할부이자'],
  '/tools/finance/4-insurance':  ['4대보험', '국민연금', '건강보험', '고용보험', '산재', '4대보험료'],
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
  '/tools/sports/pace':          ['페이스', '러닝페이스', '마라톤페이스'],
  '/tools/sports/buildup':       ['빌드업', '러닝', '인터벌', '러닝빌드업'],
  '/tools/sports/race-predictor':['vdot', '레이스예측', '마라톤', '풀코스', '하프'],
  '/tools/sports/interval-training': ['인터벌', '인터벌트레이닝', '스피드'],
  '/tools/sports/hyrox':         ['하이록스', 'HYROX', '하이룩스', '완주시간', '월볼', '썰매밀기', '스키에르그', '크로스핏레이스'],
  '/tools/sports/one-rm':        ['1rm', '원알엠', '근력', '벤치프레스', '데드리프트', '스쿼트'],
  '/tools/sports/formation':     ['포메이션', '축구', '442', '433'],
  '/tools/sports/football-points': ['승점', '리그순위', '축구승점'],
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
  '/tools/life/zodiac':          ['띠', '별자리', '12간지'],
  '/tools/life/unit-price':      ['단위가격', '용량비교', '가성비'],

  // 날짜
  '/tools/date/age':             ['나이', '만나이', '연나이'],
  '/tools/date/dday':            ['디데이', 'd-day', '날짜계산', '며칠'],
  '/tools/date/server-time':     ['서버시간', '네이비즘', '한국시간', 'ntp', '티켓팅'],
  '/tools/date/lunar':           ['음력', '양력', '음력변환'],
  '/tools/date/jet-lag':         ['시차', '제트래그', '해외여행'],
  '/tools/date/timezone':        ['시간대', '타임존', '시간변환', 'UTC', 'KST', 'EST', 'PST', 'BST', '서머타임', 'DST', '뉴욕시간', 'LA시간', '런던시간', '시드니시간', '인도시간', '회의시간'],
  '/tools/date/military':        ['군대', '군복무', '전역', '말년'],
  '/tools/date/life-time':       ['수명', '인생시간', '남은시간'],

  // 단위
  '/tools/unit/converter':       ['단위변환', '미터', '인치', '파운드', 'kg', 'lb'],
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
  '/tools/dev/json':             ['json', '포맷터', 'json포맷'],
  '/tools/dev/regex':            ['정규식', 'regex', 'regexp'],
  '/tools/dev/hash':             ['해시', 'md5', 'sha', 'sha256', 'hmac'],
  '/tools/dev/url-encode':       ['url인코딩', 'urlencode', '퍼센트인코딩'],
  '/tools/dev/yaml-json':        ['yaml', 'yml', 'json변환'],
  '/tools/dev/curl':             ['curl', 'fetch', 'axios', 'api호출'],
  '/tools/dev/http-status':      ['http', '상태코드', '404', '500', '403'],
  '/tools/dev/number-base':      ['진법', '2진법', '16진법', 'hex', 'binary'],
  '/tools/dev/css-converter':    ['css단위', 'px', 'rem', 'em', 'clamp'],
  '/tools/dev/network-test':     ['핑', 'ping', '인터넷속도', '회선', '티켓팅'],
  '/tools/dev/token-counter':    ['토큰', 'token', 'gpt', 'claude', 'gemini', 'ai비용', 'api비용', 'tokenizer', 'tiktoken', '프롬프트', '컨텍스트'],
  '/tools/dev/og-preview':       ['og', 'opengraph', '오픈그래프', '메타태그', '카카오톡', '카톡', '미리보기', '썸네일', 'twitter card', 'facebook', 'linkedin', 'slack', 'og:image'],

  // 교육
  '/tools/edu/gpa-converter':    ['학점', 'gpa', '학점환산', '4.5', '4.3', 'wes', '유학', '평점', 'a+', '평어', '백분위'],
  '/tools/edu/sci-units':        ['과학단위', '과학적표기', '공학적표기', 'SI접두어', '나노', '마이크로', '옹스트롬', 'angstrom', 'eV', '전자볼트', '광년', '천문단위', '파섹', '물리상수', '지수변환'],
  '/tools/edu/sig-figs':         ['유효숫자', '유효숫자계산', '반올림', '오차', '오차전파', '상대오차', '절대오차', '백분율오차', '불확도', '측정오차', '실험보고서', '일반물리실험', '일반화학실험', 'significant figures', 'error propagation'],

  // 인테리어
  '/tools/interior/wallpaper':   ['벽지', '도배', '도배지'],
  '/tools/interior/paint':       ['페인트', '도장'],
  '/tools/interior/wire':        ['전선', '굵기', 'sq', '전기'],
  '/tools/interior/screw':       ['나사', '피스', '앵커'],
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
  '/tools/interior/bolt-wrench': ['볼트', '렌치', '스패너'],

  // 요리
  '/tools/cooking/kimjang':      ['김장', '배추', '김치', '겉절이'],
  '/tools/cooking/holiday-table':['명절', '차례상', '제사상', '상차림'],
  '/tools/cooking/recipe':       ['레시피', '인분', '레시피변환'],
  '/tools/cooking/baking-recipe':['베이킹', '제빵', '베이커퍼센트'],
  '/tools/cooking/baker-percent':['베이커퍼센트', '제빵비율'],
  '/tools/cooking/egg-timer':    ['계란', '반숙', '완숙', '삶기'],
  '/tools/cooking/ramen':        ['라면', '라면물'],
  '/tools/cooking/brew':         ['커피', '드립', '브루잉', '원두'],
  '/tools/cooking/microwave':    ['전자레인지', '데우기', '와트'],
  '/tools/cooking/thawing':      ['해동', '냉동', '냉장해동'],

  // 음악/예술
  '/tools/art/bpm':              ['bpm', '템포', '비트', '메트로놈'],
  '/tools/art/tap-tempo':        ['탭템포', 'bpm측정'],
  '/tools/art/chord':            ['코드', '화성', '기타코드', '피아노코드'],
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
  '/tools/finance/severance':    ['퇴직금', '퇴직', '평균임금'],
  '/tools/finance/freelance-tax':['프리랜서', '3.3', '종합소득세', '사업소득'],
  '/tools/finance/auction':      ['경매', '부동산경매', '낙찰가'],
  '/tools/finance/rent-jeonse':  ['전월세', '전세월세', '전세전환', '월세전환'],
  '/tools/finance/stock-decision': ['주식매수', '주식매도', '팔까살까', '익절', '손절', '투자심리', '결정장애', '행동경제학'],
  '/tools/finance/gold-converter': ['금시세', '돈', '한돈', '금변환', '금값'],
  '/tools/finance/historical-money': ['화폐사', '화폐가치', '환', '구원', '옛날돈', '인플레이션', '구매력', '화폐개혁', '1953', '1962', 'cpi', '소비자물가지수'],
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
}

// 한국어/영어 모두 소문자·공백 제거 정규화
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '')
}

export function searchTools(rawQuery: string, limit: number = 8): SearchHit[] {
  const q = normalize(rawQuery.trim())
  if (!q) return []

  const isInitialOnly = isAllInitials(rawQuery.trim())

  const hits: SearchHit[] = []
  for (const tool of allTools) {
    const name = normalize(tool.name)
    const desc = normalize(tool.desc)
    const href = tool.href.toLowerCase()
    const aliases = (TOOL_ALIASES[tool.href] ?? []).map(normalize)
    const nameInit = toInitials(tool.name)
    const cat = HREF_TO_CATEGORY.get(tool.href)
    const catName = cat ? normalize(cat.name) : ''

    let score = 0

    if (isInitialOnly) {
      // 초성 검색 — 이름 초성 매치만 적용
      if (nameInit.startsWith(rawQuery.trim())) score = Math.max(score, 90)
      else if (nameInit.includes(rawQuery.trim())) score = Math.max(score, 55)
    } else {
      if (name === q) score = Math.max(score, 100)
      else if (name.startsWith(q)) score = Math.max(score, 85)
      else if (name.includes(q)) score = Math.max(score, 70)

      for (const a of aliases) {
        if (a === q) { score = Math.max(score, 80); break }
        if (a.startsWith(q)) { score = Math.max(score, 72); continue }
        if (a.includes(q)) { score = Math.max(score, 60); continue }
      }

      if (desc.includes(q)) score = Math.max(score, 30)
      if (href.includes(q)) score = Math.max(score, 35)
      if (catName && catName.includes(q)) score = Math.max(score, 25)
    }

    // badge 가산
    if (score > 0) {
      if (tool.badge === 'hot') score += 2
      if (tool.badge === 'new') score += 1
    }

    if (score > 0) hits.push({ tool, category: cat, score })
  }

  hits.sort((a, b) => b.score - a.score)
  return hits.slice(0, limit)
}
