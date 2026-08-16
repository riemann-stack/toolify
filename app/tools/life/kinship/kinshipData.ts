// ─────────────────────────────────────────────
// 가족 호칭 계산기 — 데이터·계산 (순수 함수, 노드 검산 가능)
//  기준: 국립국어원 『표준 언어 예절』(2011) 호칭어·지칭어,
//        국립국어원 『우리, 뭐라고 부를까요?』(2020) 완화 안내,
//        민법 §770~§777 촌수·친족 범위.
//  원칙: 호칭어(부를 때)와 지칭어(남에게 말할 때)를 구분해 담는다.
// ─────────────────────────────────────────────

export type Gender = 'male' | 'female'
export type StepId = 'F' | 'M' | 'OB' | 'OS' | 'YB' | 'YS' | 'S' | 'D' | 'H' | 'W'

export const STEPS: { id: StepId; label: string; short: string }[] = [
  { id: 'F',  label: '아버지',   short: '부' },
  { id: 'M',  label: '어머니',   short: '모' },
  { id: 'OB', label: '형·오빠',  short: '형·오빠' },
  { id: 'OS', label: '누나·언니', short: '누나·언니' },
  { id: 'YB', label: '남동생',   short: '남동생' },
  { id: 'YS', label: '여동생',   short: '여동생' },
  { id: 'S',  label: '아들',     short: '아들' },
  { id: 'D',  label: '딸',       short: '딸' },
  { id: 'H',  label: '남편',     short: '남편' },
  { id: 'W',  label: '아내',     short: '아내' },
]

/** 친족 종류 — 민법 §777 판정용 */
export type KinKind = 'blood' | 'affinal' | 'spouse' | 'none'

export interface KinNode {
  id: string
  /** 경로 칩·가계도 노드용 짧은 관계명 */
  label: string
  /** 호칭어 — 부를 때. 화자 성별에 따라 다르면 객체 */
  call: string | { male: string; female: string }
  /** 지칭어 — 남에게 말할 때 (호칭어와 같으면 생략) */
  ref?: string
  hanja?: string
  /** 촌수 — 혈족은 혈연 촌수, 인척은 배우자·혈족 기준 촌수(민법 §771), 배우자·사돈은 null */
  chon: number | null
  kind: KinKind
  /** 세대 차 (+1 부모 세대) — 가계도 배치용 */
  generation: number
  group: '직계' | '친가' | '외가' | '형제·자매' | '자녀·손' | '시가' | '처가' | '사돈'
  /** 그 사람이 나를 부르는 말 */
  reverse: string | { male: string; female: string }
  /** 연상/연하에 따라 호칭이 갈리는 경우 */
  ageVariant?: { older: string; younger: string }
  note?: string
}

const N = (n: KinNode) => n

export const NODES: Record<string, KinNode> = {
  me: N({ id: 'me', label: '나', call: '—', chon: 0, kind: 'blood', generation: 0, group: '직계', reverse: '—' }),

  /* ── 직계 존속 ── */
  father: N({ id: 'father', label: '아버지', call: '아버지', ref: '아버지(부친)', hanja: '父', chon: 1, kind: 'blood', generation: 1, group: '직계', reverse: { male: '아들 (이름)', female: '딸 (이름)' } }),
  mother: N({ id: 'mother', label: '어머니', call: '어머니', ref: '어머니(모친)', hanja: '母', chon: 1, kind: 'blood', generation: 1, group: '직계', reverse: { male: '아들 (이름)', female: '딸 (이름)' } }),
  gfP: N({ id: 'gfP', label: '할아버지', call: '할아버지', ref: '할아버지(조부)', hanja: '祖父', chon: 2, kind: 'blood', generation: 2, group: '친가', reverse: '손주 (이름)' }),
  gmP: N({ id: 'gmP', label: '할머니', call: '할머니', ref: '할머니(조모)', hanja: '祖母', chon: 2, kind: 'blood', generation: 2, group: '친가', reverse: '손주 (이름)' }),
  gfM: N({ id: 'gfM', label: '외할아버지', call: '외할아버지', ref: '외할아버지(외조부)', hanja: '外祖父', chon: 2, kind: 'blood', generation: 2, group: '외가', reverse: '손주 (이름)', note: '「외-」를 빼고 그냥 할아버지로 불러도 표준입니다(표준 언어 예절 2011부터 허용).' }),
  gmM: N({ id: 'gmM', label: '외할머니', call: '외할머니', ref: '외할머니(외조모)', hanja: '外祖母', chon: 2, kind: 'blood', generation: 2, group: '외가', reverse: '손주 (이름)', note: '「외-」를 빼고 그냥 할머니로 불러도 표준입니다(표준 언어 예절 2011부터 허용).' }),
  ggfP: N({ id: 'ggfP', label: '증조할아버지', call: '증조할아버지', ref: '증조부', hanja: '曾祖父', chon: 3, kind: 'blood', generation: 3, group: '친가', reverse: '증손주 (이름)' }),
  ggmP: N({ id: 'ggmP', label: '증조할머니', call: '증조할머니', ref: '증조모', hanja: '曾祖母', chon: 3, kind: 'blood', generation: 3, group: '친가', reverse: '증손주 (이름)' }),
  ggfM: N({ id: 'ggfM', label: '외증조할아버지', call: '외증조할아버지', ref: '외증조부', chon: 3, kind: 'blood', generation: 3, group: '외가', reverse: '증손주 (이름)' }),
  ggmM: N({ id: 'ggmM', label: '외증조할머니', call: '외증조할머니', ref: '외증조모', chon: 3, kind: 'blood', generation: 3, group: '외가', reverse: '증손주 (이름)' }),
  gggfP: N({ id: 'gggfP', label: '고조할아버지', call: '고조할아버지', ref: '고조부', hanja: '高祖父', chon: 4, kind: 'blood', generation: 4, group: '친가', reverse: '현손 (이름)' }),

  /* ── 형제·자매 ── */
  obro: N({ id: 'obro', label: '형·오빠', call: { male: '형', female: '오빠' }, ref: '형/오빠', chon: 2, kind: 'blood', generation: 0, group: '형제·자매', reverse: '동생 (이름)' }),
  osis: N({ id: 'osis', label: '누나·언니', call: { male: '누나', female: '언니' }, ref: '누나/언니', chon: 2, kind: 'blood', generation: 0, group: '형제·자매', reverse: '동생 (이름)' }),
  ybro: N({ id: 'ybro', label: '남동생', call: '이름 (동생)', ref: '(남)동생', chon: 2, kind: 'blood', generation: 0, group: '형제·자매', reverse: { male: '형', female: '누나' } }),
  ysis: N({ id: 'ysis', label: '여동생', call: '이름 (동생)', ref: '(여)동생', chon: 2, kind: 'blood', generation: 0, group: '형제·자매', reverse: { male: '오빠', female: '언니' } }),
  obroW: N({ id: 'obroW', label: '형·오빠의 아내', call: { male: '형수님', female: '(새)언니' }, ref: '형수/올케', hanja: '兄嫂', chon: 2, kind: 'affinal', generation: 0, group: '형제·자매', reverse: { male: '도련님→이름', female: '아가씨→이름' }, note: '여성 화자의 지칭은 「올케(언니)」.' }),
  ybroW: N({ id: 'ybroW', label: '남동생의 아내', call: { male: '제수씨', female: '올케' }, ref: '제수/계수/올케', chon: 2, kind: 'affinal', generation: 0, group: '형제·자매', reverse: { male: '아주버님', female: '형님' } }),
  osisH: N({ id: 'osisH', label: '누나·언니의 남편', call: { male: '매형', female: '형부' }, ref: '매형(자형)/형부', chon: 2, kind: 'affinal', generation: 0, group: '형제·자매', reverse: '처남/처제 (이름)' }),
  ysisH: N({ id: 'ysisH', label: '여동생의 남편', call: { male: '매제', female: '제부' }, ref: '매제(매부)/제부', chon: 2, kind: 'affinal', generation: 0, group: '형제·자매', reverse: { male: '형님(연상)·처남', female: '처형' } }),

  /* ── 친가 3~6촌 ── */
  uncleO: N({ id: 'uncleO', label: '큰아버지', call: '큰아버지', ref: '큰아버지 — 맏형이면 백부(伯父)', chon: 3, kind: 'blood', generation: 1, group: '친가', reverse: '조카 (이름)', note: '「백부」는 아버지의 맏형만 이르는 지칭어로, 호칭으로는 쓰지 않습니다. 형이 여럿이면 첫째·둘째 큰아버지로 구분합니다.' }),
  uncleOW: N({ id: 'uncleOW', label: '큰어머니', call: '큰어머니', ref: '큰어머니 — 맏형의 아내면 백모(伯母)', chon: 3, kind: 'affinal', generation: 1, group: '친가', reverse: '조카 (이름)', note: '「백모」는 아버지 맏형의 아내만 이르는 지칭어로, 호칭으로는 쓰지 않습니다.' }),
  uncleY: N({ id: 'uncleY', label: '작은아버지', call: '작은아버지', ref: '숙부', hanja: '叔父', chon: 3, kind: 'blood', generation: 1, group: '친가', reverse: '조카 (이름)', note: '「삼촌」·「아저씨」도 기혼·미혼과 관계없이 표준 호칭입니다(표준 언어 예절 2011). 관용적으로는 미혼이면 삼촌이 우세합니다.' }),
  uncleYW: N({ id: 'uncleYW', label: '작은어머니', call: '작은어머니', ref: '숙모', hanja: '叔母', chon: 3, kind: 'affinal', generation: 1, group: '친가', reverse: '조카 (이름)' }),
  auntP: N({ id: 'auntP', label: '고모', call: '고모', ref: '고모', hanja: '姑母', chon: 3, kind: 'blood', generation: 1, group: '친가', reverse: '조카 (이름)' }),
  auntPH: N({ id: 'auntPH', label: '고모부', call: '고모부', ref: '고모부', hanja: '姑母夫', chon: 3, kind: 'affinal', generation: 1, group: '친가', reverse: '처조카 (이름)' }),
  cousinP: N({ id: 'cousinP', label: '사촌 (친가·남)', call: '사촌', ref: '사촌 형제(종형제)', hanja: '從兄弟', chon: 4, kind: 'blood', generation: 0, group: '친가', reverse: '사촌 (나이에 따라)', ageVariant: { older: '사촌 형/오빠', younger: '이름 (사촌 동생)' } }),
  cousinPf: N({ id: 'cousinPf', label: '사촌 (친가·여)', call: '사촌', ref: '사촌 자매(종자매)', chon: 4, kind: 'blood', generation: 0, group: '친가', reverse: '사촌 (나이에 따라)', ageVariant: { older: '사촌 누나/언니', younger: '이름 (사촌 동생)' } }),
  cousinPk: N({ id: 'cousinPk', label: '고종사촌 (남)', call: '고종사촌', ref: '고종사촌(내종형제)', chon: 4, kind: 'blood', generation: 0, group: '친가', reverse: '외사촌 (나이에 따라)', ageVariant: { older: '(고종사촌) 형/오빠', younger: '이름' }, note: '고모의 자녀. 상대에게 나는 외사촌입니다.' }),
  cousinPkf: N({ id: 'cousinPkf', label: '고종사촌 (여)', call: '고종사촌', ref: '고종사촌(내종자매)', chon: 4, kind: 'blood', generation: 0, group: '친가', reverse: '외사촌 (나이에 따라)', ageVariant: { older: '(고종사촌) 누나/언니', younger: '이름' } }),
  jongjoO: N({ id: 'jongjoO', label: '큰할아버지', call: '큰할아버지', ref: '종조부', hanja: '從祖父', chon: 4, kind: 'blood', generation: 2, group: '친가', reverse: '종손 (이름)', note: '할아버지의 형.' }),
  jongjoY: N({ id: 'jongjoY', label: '작은할아버지', call: '작은할아버지', ref: '종조부', hanja: '從祖父', chon: 4, kind: 'blood', generation: 2, group: '친가', reverse: '종손 (이름)', note: '할아버지의 남동생.' }),
  jongjoW: N({ id: 'jongjoW', label: '종조모', call: '큰할머니·작은할머니', ref: '종조모', chon: 4, kind: 'affinal', generation: 2, group: '친가', reverse: '종손 (이름)' }),
  daegomo: N({ id: 'daegomo', label: '대고모', call: '대고모', ref: '대고모(왕고모)', hanja: '大姑母', chon: 4, kind: 'blood', generation: 2, group: '친가', reverse: '종손 (이름)', note: '할아버지의 누나·여동생(아버지의 고모). 관행적으로 「고모할머니」라고도 부릅니다.' }),
  dangsuk: N({ id: 'dangsuk', label: '당숙', call: '당숙 (아저씨)', ref: '당숙(종숙)', hanja: '堂叔', chon: 5, kind: 'blood', generation: 1, group: '친가', reverse: '당질 (이름)', note: '아버지의 사촌 형제.' }),
  dangsukW: N({ id: 'dangsukW', label: '당숙모', call: '당숙모', ref: '당숙모(종숙모)', chon: 5, kind: 'affinal', generation: 1, group: '친가', reverse: '당질 (이름)' }),
  danggomo: N({ id: 'danggomo', label: '당고모', call: '당고모 (아주머니)', ref: '당고모(종고모)', chon: 5, kind: 'blood', generation: 1, group: '친가', reverse: '당질 (이름)', note: '아버지의 사촌 자매.' }),
  jaejong: N({ id: 'jaejong', label: '재종형제 (육촌·남)', call: '육촌 (재종)', ref: '재종형제', hanja: '再從兄弟', chon: 6, kind: 'blood', generation: 0, group: '친가', reverse: '재종형제 (나이에 따라)', ageVariant: { older: '(육촌) 형/오빠', younger: '이름' } }),
  jaejongF: N({ id: 'jaejongF', label: '재종자매 (육촌·여)', call: '육촌 (재종)', ref: '재종자매', chon: 6, kind: 'blood', generation: 0, group: '친가', reverse: '재종형제 (나이에 따라)', ageVariant: { older: '(육촌) 누나/언니', younger: '이름' } }),
  dangjil: N({ id: 'dangjil', label: '당질 (남)', call: '이름 (당질)', ref: '당질(종질)', hanja: '堂姪', chon: 5, kind: 'blood', generation: -1, group: '친가', reverse: '당숙/당고모', note: '사촌 형제(남자 사촌)의 아들.' }),
  dangjilD: N({ id: 'dangjilD', label: '당질녀', call: '이름 (당질녀)', ref: '당질녀', chon: 5, kind: 'blood', generation: -1, group: '친가', reverse: '당숙/당고모', note: '사촌 형제(남자 사촌)의 딸.' }),

  /* ── 외가 3~4촌 ── */
  uncleM: N({ id: 'uncleM', label: '외삼촌', call: '외삼촌', ref: '외숙(외삼촌)', hanja: '外叔', chon: 3, kind: 'blood', generation: 1, group: '외가', reverse: '조카 (이름)' }),
  uncleMW: N({ id: 'uncleMW', label: '외숙모', call: '외숙모', ref: '외숙모', chon: 3, kind: 'affinal', generation: 1, group: '외가', reverse: '조카 (이름)' }),
  auntM: N({ id: 'auntM', label: '이모', call: '이모', ref: '이모', hanja: '姨母', chon: 3, kind: 'blood', generation: 1, group: '외가', reverse: '조카 (이름)' }),
  auntMH: N({ id: 'auntMH', label: '이모부', call: '이모부', ref: '이모부', hanja: '姨母夫', chon: 3, kind: 'affinal', generation: 1, group: '외가', reverse: '처조카 (이름)' }),
  cousinM: N({ id: 'cousinM', label: '외사촌 (남)', call: '외사촌', ref: '외사촌(외종형제)', chon: 4, kind: 'blood', generation: 0, group: '외가', reverse: '고종사촌 (나이에 따라)', ageVariant: { older: '(외사촌) 형/오빠', younger: '이름' }, note: '외삼촌의 자녀. 상대에게 나는 고종사촌입니다.' }),
  cousinMf: N({ id: 'cousinMf', label: '외사촌 (여)', call: '외사촌', ref: '외사촌(외종자매)', chon: 4, kind: 'blood', generation: 0, group: '외가', reverse: '고종사촌 (나이에 따라)', ageVariant: { older: '(외사촌) 누나/언니', younger: '이름' } }),
  cousinMk: N({ id: 'cousinMk', label: '이종사촌 (남)', call: '이종사촌', ref: '이종사촌(이종형제)', chon: 4, kind: 'blood', generation: 0, group: '외가', reverse: '이종사촌 (나이에 따라)', ageVariant: { older: '(이종사촌) 형/오빠', younger: '이름' }, note: '이모의 자녀.' }),
  cousinMkf: N({ id: 'cousinMkf', label: '이종사촌 (여)', call: '이종사촌', ref: '이종사촌(이종자매)', chon: 4, kind: 'blood', generation: 0, group: '외가', reverse: '이종사촌 (나이에 따라)', ageVariant: { older: '(이종사촌) 누나/언니', younger: '이름' } }),

  /* ── 조카·자녀·손 ── */
  nephewB: N({ id: 'nephewB', label: '조카 (형제의 아들)', call: '이름 (조카)', ref: '조카(질)', hanja: '姪', chon: 3, kind: 'blood', generation: -1, group: '자녀·손', reverse: { male: '큰아버지/작은아버지/삼촌', female: '고모' } }),
  nieceB: N({ id: 'nieceB', label: '조카딸 (형제의 딸)', call: '이름 (조카)', ref: '조카딸(질녀)', chon: 3, kind: 'blood', generation: -1, group: '자녀·손', reverse: { male: '큰아버지/작은아버지/삼촌', female: '고모' } }),
  nephewS: N({ id: 'nephewS', label: '조카 (자매의 아들)', call: '이름 (조카)', ref: '조카 — 전통 지칭 생질(甥姪)', chon: 3, kind: 'blood', generation: -1, group: '자녀·손', reverse: { male: '외삼촌', female: '이모' } }),
  nieceS: N({ id: 'nieceS', label: '조카딸 (자매의 딸)', call: '이름 (조카)', ref: '조카딸 — 전통 지칭 생질녀', chon: 3, kind: 'blood', generation: -1, group: '자녀·손', reverse: { male: '외삼촌', female: '이모' } }),
  jongson: N({ id: 'jongson', label: '종손 (조카의 아들)', call: '이름 (종손)', ref: '종손(從孫)', chon: 4, kind: 'blood', generation: -2, group: '자녀·손', reverse: '큰할아버지·작은할아버지/대고모', note: '형제 쪽 조카의 아들. 종가 맏손자를 뜻하는 종손(宗孫)과는 다른 말입니다.' }),
  jongsonD: N({ id: 'jongsonD', label: '종손녀 (조카의 딸)', call: '이름 (종손녀)', ref: '종손녀(從孫女)', chon: 4, kind: 'blood', generation: -2, group: '자녀·손', reverse: '큰할아버지·작은할아버지/대고모', note: '형제 쪽 조카의 딸.' }),
  son: N({ id: 'son', label: '아들', call: '이름 (아들)', ref: '아들', hanja: '子', chon: 1, kind: 'blood', generation: -1, group: '자녀·손', reverse: { male: '아버지', female: '어머니' } }),
  daughter: N({ id: 'daughter', label: '딸', call: '이름 (딸)', ref: '딸', hanja: '女', chon: 1, kind: 'blood', generation: -1, group: '자녀·손', reverse: { male: '아버지', female: '어머니' } }),
  sonW: N({ id: 'sonW', label: '며느리', call: '아가·새아가 (이름)', ref: '며느리(자부)', hanja: '子婦', chon: 1, kind: 'affinal', generation: -1, group: '자녀·손', reverse: { male: '아버님', female: '어머님' } }),
  daughterH: N({ id: 'daughterH', label: '사위', call: '○ 서방 (이름)', ref: '사위', hanja: '壻', chon: 1, kind: 'affinal', generation: -1, group: '자녀·손', reverse: { male: '장인어른·아버님', female: '장모님·어머님' } }),
  grandson: N({ id: 'grandson', label: '손자', call: '이름 (손자)', ref: '손자(친손자)', hanja: '孫子', chon: 2, kind: 'blood', generation: -2, group: '자녀·손', reverse: { male: '할아버지', female: '할머니' } }),
  granddaughter: N({ id: 'granddaughter', label: '손녀', call: '이름 (손녀)', ref: '손녀(친손녀)', chon: 2, kind: 'blood', generation: -2, group: '자녀·손', reverse: { male: '할아버지', female: '할머니' } }),
  exGrandson: N({ id: 'exGrandson', label: '외손자', call: '이름 (외손자)', ref: '외손자', chon: 2, kind: 'blood', generation: -2, group: '자녀·손', reverse: { male: '외할아버지', female: '외할머니' } }),
  exGranddaughter: N({ id: 'exGranddaughter', label: '외손녀', call: '이름 (외손녀)', ref: '외손녀', chon: 2, kind: 'blood', generation: -2, group: '자녀·손', reverse: { male: '외할아버지', female: '외할머니' } }),
  greatGrandson: N({ id: 'greatGrandson', label: '증손자', call: '이름 (증손자)', ref: '증손자', chon: 3, kind: 'blood', generation: -3, group: '자녀·손', reverse: '증조할아버지·증조할머니' }),
  greatGranddaughter: N({ id: 'greatGranddaughter', label: '증손녀', call: '이름 (증손녀)', ref: '증손녀', chon: 3, kind: 'blood', generation: -3, group: '자녀·손', reverse: '증조할아버지·증조할머니' }),

  /* ── 배우자 ── */
  husband: N({ id: 'husband', label: '남편', call: '여보 (○○ 씨)', ref: '남편 — 시부모께는 「아비/아범」', chon: null, kind: 'spouse', generation: 0, group: '시가', reverse: '여보 (○○ 씨)', note: '부부는 촌수를 따지지 않습니다(흔히 「무촌」이라 합니다).' }),
  wife: N({ id: 'wife', label: '아내', call: '여보 (○○ 씨)', ref: '아내 — 처부모께는 「어미/어멈」', chon: null, kind: 'spouse', generation: 0, group: '처가', reverse: '여보 (○○ 씨)', note: '부부는 촌수를 따지지 않습니다(흔히 「무촌」이라 합니다).' }),

  /* ── 시가 (여성 화자) ── */
  sF: N({ id: 'sF', label: '시아버지', call: '아버님', ref: '시아버지', hanja: '媤父', chon: 1, kind: 'affinal', generation: 1, group: '시가', reverse: '어멈·새아가 (이름)' }),
  sM: N({ id: 'sM', label: '시어머니', call: '어머님 (어머니)', ref: '시어머니', hanja: '媤母', chon: 1, kind: 'affinal', generation: 1, group: '시가', reverse: '어멈·새아가 (이름)' }),
  sOB: N({ id: 'sOB', label: '남편의 형', call: '아주버님', ref: '시아주버니', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '제수씨' }),
  sYB: N({ id: 'sYB', label: '남편의 남동생', call: '도련님(미혼)·서방님(기혼)', ref: '시동생', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '형수님', note: '국립국어원 2020 안내: 「이름+씨」 등으로 불러도 된다는 응답이 다수.' }),
  sOS: N({ id: 'sOS', label: '남편의 누나', call: '형님', ref: '시누이', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '올케' }),
  sYS: N({ id: 'sYS', label: '남편의 여동생', call: '아가씨', ref: '시누이', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '올케·언니', note: '국립국어원 2020 안내: 「이름+씨」 등으로 불러도 된다는 응답이 다수.' }),
  sOBW: N({ id: 'sOBW', label: '남편 형의 아내', call: '형님', ref: '손위 동서', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '동서' }),
  sYBW: N({ id: 'sYBW', label: '남편 동생의 아내', call: '동서', ref: '손아래 동서', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '형님' }),
  sOSH: N({ id: 'sOSH', label: '남편 누나의 남편', call: '아주버님', ref: '시누이 남편', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '처남댁' }),
  sYSH: N({ id: 'sYSH', label: '남편 여동생의 남편', call: '서방님', ref: '시누이 남편', chon: 2, kind: 'affinal', generation: 0, group: '시가', reverse: '처남댁·아주머니' }),

  /* ── 처가 (남성 화자) ── */
  wF: N({ id: 'wF', label: '장인', call: '장인어른 (아버님)', ref: '장인', hanja: '丈人', chon: 1, kind: 'affinal', generation: 1, group: '처가', reverse: '○ 서방' }),
  wM: N({ id: 'wM', label: '장모', call: '장모님 (어머님)', ref: '장모', hanja: '丈母', chon: 1, kind: 'affinal', generation: 1, group: '처가', reverse: '○ 서방' }),
  wOB: N({ id: 'wOB', label: '아내의 오빠', call: '형님(연상)·처남(연하)', ref: '손위 처남', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '매제(매부)·○ 서방' }),
  wYB: N({ id: 'wYB', label: '아내의 남동생', call: '처남', ref: '처남', hanja: '妻男', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '매형·자형' }),
  wOS: N({ id: 'wOS', label: '아내의 언니', call: '처형', ref: '처형', hanja: '妻兄', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '제부·○ 서방' }),
  wYS: N({ id: 'wYS', label: '아내의 여동생', call: '처제', ref: '처제', hanja: '妻弟', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '형부' }),
  wOBW: N({ id: 'wOBW', label: '처남(손위)의 아내', call: '아주머니', ref: '처남댁', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '서방님' }),
  wYBW: N({ id: 'wYBW', label: '처남(손아래)의 아내', call: '처남댁', ref: '처남댁', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '아주버님' }),
  wOSH: N({ id: 'wOSH', label: '처형의 남편', call: '형님(연상)·동서', ref: '손위 동서', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '동서' }),
  wYSH: N({ id: 'wYSH', label: '처제의 남편', call: '동서 (○ 서방)', ref: '손아래 동서', chon: 2, kind: 'affinal', generation: 0, group: '처가', reverse: '형님(연상)·동서' }),

  /* ── 사돈 ── */
  sadonM: N({ id: 'sadonM', label: '바깥사돈', call: '사돈어른', ref: '바깥사돈', hanja: '査頓', chon: null, kind: 'none', generation: 0, group: '사돈', reverse: '사돈어른/사부인', note: '자녀 배우자의 아버지. 민법상 친족이 아닙니다.' }),
  sadonF: N({ id: 'sadonF', label: '안사돈', call: '사부인', ref: '안사돈', chon: null, kind: 'none', generation: 0, group: '사돈', reverse: '사돈어른/사부인', note: '자녀 배우자의 어머니. 민법상 친족이 아닙니다.' }),
}

/* ─────────────────────────────────────────────
   전이 표 — 표준 호칭이 특정되는 경로만 정의.
   미정의 = 해당 단계 버튼 비활성(정직하게 "지원 밖" 안내).
   ───────────────────────────────────────────── */
export const TRANSITIONS: Record<string, Partial<Record<StepId, string>>> = {
  me:      { F: 'father', M: 'mother', OB: 'obro', OS: 'osis', YB: 'ybro', YS: 'ysis', S: 'son', D: 'daughter', H: 'husband', W: 'wife' },
  father:  { F: 'gfP', M: 'gmP', OB: 'uncleO', YB: 'uncleY', OS: 'auntP', YS: 'auntP', W: 'mother' },
  mother:  { F: 'gfM', M: 'gmM', OB: 'uncleM', YB: 'uncleM', OS: 'auntM', YS: 'auntM', H: 'father' },
  gfP:     { F: 'ggfP', M: 'ggmP', OB: 'jongjoO', YB: 'jongjoY', OS: 'daegomo', YS: 'daegomo', W: 'gmP' },
  gmP:     { H: 'gfP' },
  gfM:     { F: 'ggfM', M: 'ggmM', W: 'gmM' },
  gmM:     { H: 'gfM' },
  ggfP:    { F: 'gggfP', W: 'ggmP' },
  jongjoO: { S: 'dangsuk', D: 'danggomo', W: 'jongjoW' },
  jongjoY: { S: 'dangsuk', D: 'danggomo', W: 'jongjoW' },
  uncleO:  { W: 'uncleOW', S: 'cousinP', D: 'cousinPf' },
  uncleY:  { W: 'uncleYW', S: 'cousinP', D: 'cousinPf' },
  auntP:   { H: 'auntPH', S: 'cousinPk', D: 'cousinPkf' },
  uncleM:  { W: 'uncleMW', S: 'cousinM', D: 'cousinMf' },
  auntM:   { H: 'auntMH', S: 'cousinMk', D: 'cousinMkf' },
  cousinP: { S: 'dangjil', D: 'dangjilD' },
  dangsuk: { S: 'jaejong', D: 'jaejongF', W: 'dangsukW' },
  obro:    { W: 'obroW', S: 'nephewB', D: 'nieceB' },
  ybro:    { W: 'ybroW', S: 'nephewB', D: 'nieceB' },
  osis:    { H: 'osisH', S: 'nephewS', D: 'nieceS' },
  ysis:    { H: 'ysisH', S: 'nephewS', D: 'nieceS' },
  nephewB: { S: 'jongson', D: 'jongsonD' },
  son:     { W: 'sonW', S: 'grandson', D: 'granddaughter' },
  daughter:{ H: 'daughterH', S: 'exGrandson', D: 'exGranddaughter' },
  grandson:{ S: 'greatGrandson', D: 'greatGranddaughter' },
  sonW:    { F: 'sadonM', M: 'sadonF' },
  daughterH:{ F: 'sadonM', M: 'sadonF' },
  husband: { F: 'sF', M: 'sM', OB: 'sOB', YB: 'sYB', OS: 'sOS', YS: 'sYS', S: 'son', D: 'daughter' },
  wife:    { F: 'wF', M: 'wM', OB: 'wOB', YB: 'wYB', OS: 'wOS', YS: 'wYS', S: 'son', D: 'daughter' },
  sOB:     { W: 'sOBW' },
  sYB:     { W: 'sYBW' },
  sOS:     { H: 'sOSH' },
  sYS:     { H: 'sYSH' },
  wOB:     { W: 'wOBW' },
  wYB:     { W: 'wYBW' },
  wOS:     { H: 'wOSH' },
  wYS:     { H: 'wYSH' },
}

export const MAX_DEPTH = 5

/* 각 노드 인물의 성별 — 경로 문구 맥락화(아버지의 「형·오빠」→「형」)용 */
export const SEX: Record<string, 'm' | 'f' | null> = {
  me: null,
  father: 'm', mother: 'f', gfP: 'm', gmP: 'f', gfM: 'm', gmM: 'f',
  ggfP: 'm', ggmP: 'f', ggfM: 'm', ggmM: 'f', gggfP: 'm',
  obro: 'm', osis: 'f', ybro: 'm', ysis: 'f',
  obroW: 'f', ybroW: 'f', osisH: 'm', ysisH: 'm',
  uncleO: 'm', uncleOW: 'f', uncleY: 'm', uncleYW: 'f', auntP: 'f', auntPH: 'm',
  cousinP: 'm', cousinPf: 'f', cousinPk: 'm', cousinPkf: 'f',
  jongjoO: 'm', jongjoY: 'm', jongjoW: 'f', daegomo: 'f',
  dangsuk: 'm', dangsukW: 'f', danggomo: 'f', jaejong: 'm', jaejongF: 'f',
  dangjil: 'm', dangjilD: 'f',
  uncleM: 'm', uncleMW: 'f', auntM: 'f', auntMH: 'm',
  cousinM: 'm', cousinMf: 'f', cousinMk: 'm', cousinMkf: 'f',
  nephewB: 'm', nieceB: 'f', nephewS: 'm', nieceS: 'f', jongson: 'm', jongsonD: 'f',
  son: 'm', daughter: 'f', sonW: 'f', daughterH: 'm',
  grandson: 'm', granddaughter: 'f', exGrandson: 'm', exGranddaughter: 'f',
  greatGrandson: 'm', greatGranddaughter: 'f',
  husband: 'm', wife: 'f',
  sF: 'm', sM: 'f', sOB: 'm', sYB: 'm', sOS: 'f', sYS: 'f',
  sOBW: 'f', sYBW: 'f', sOSH: 'm', sYSH: 'm',
  wF: 'm', wM: 'f', wOB: 'm', wYB: 'm', wOS: 'f', wYS: 'f',
  wOBW: 'f', wYBW: 'f', wOSH: 'm', wYSH: 'm',
  sadonM: 'm', sadonF: 'f',
}

/** 경로 단계 라벨 — 직전 인물의 성별에 맞춰 형/오빠·누나/언니를 맥락화 */
export function stepLabelAt(prevNodeId: string, step: StepId, myGender: Gender): string {
  const ctx: 'm' | 'f' | null = prevNodeId === 'me' ? (myGender === 'male' ? 'm' : 'f') : SEX[prevNodeId] ?? null
  if (step === 'OB') return ctx === 'm' ? '형' : ctx === 'f' ? '오빠' : '형·오빠'
  if (step === 'OS') return ctx === 'm' ? '누나' : ctx === 'f' ? '언니' : '누나·언니'
  return STEPS.find((st) => st.id === step)!.label
}

/** 경로 전체를 「아버지의 형」 꼴 문장으로 */
export function pathText(steps: StepId[], myGender: Gender): string {
  const labels: string[] = []
  let cur = 'me'
  for (const step of steps) {
    labels.push(stepLabelAt(cur, step, myGender))
    cur = TRANSITIONS[cur]?.[step] ?? cur
  }
  return labels.join('의 ')
}

export interface ResolveResult {
  node: KinNode | null
  /** 경로 각 단계의 노드 id (가계도용, me 포함) */
  trail: string[]
  /** 진행 불가 지점 (전이 미정의) */
  blockedAt: number | null
}

/** 경로 → 최종 관계. 성별 게이트: H는 여성 화자, W는 남성 화자 시작에서만. */
export function resolvePath(steps: StepId[], myGender: Gender): ResolveResult {
  let cur = 'me'
  const trail = ['me']
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    if (cur === 'me') {
      if (step === 'H' && myGender !== 'female') return { node: null, trail, blockedAt: i }
      if (step === 'W' && myGender !== 'male') return { node: null, trail, blockedAt: i }
    }
    const next = TRANSITIONS[cur]?.[step]
    if (!next) return { node: null, trail, blockedAt: i }
    cur = next
    trail.push(cur)
  }
  return { node: NODES[cur], trail, blockedAt: null }
}

/** 현재 위치에서 가능한 다음 단계 */
export function allowedSteps(steps: StepId[], myGender: Gender): StepId[] {
  if (steps.length >= MAX_DEPTH) return []
  const { node, blockedAt } = resolvePath(steps, myGender)
  if (blockedAt !== null || !node) return []
  const t = TRANSITIONS[node.id] ?? {}
  return (Object.keys(t) as StepId[]).filter((s) => {
    if (node.id === 'me') {
      if (s === 'H') return myGender === 'female'
      if (s === 'W') return myGender === 'male'
    }
    return true
  })
}

/** 호칭어·역방향의 성별 분기 해소 */
export function pick(v: string | { male: string; female: string }, g: Gender): string {
  return typeof v === 'string' ? v : v[g]
}

/** 민법 §777 친족 여부 */
export function isLegalRelative(node: KinNode): { relative: boolean; basis: string } {
  if (node.kind === 'spouse') return { relative: true, basis: '배우자 (민법 §777 3호)' }
  if (node.kind === 'blood') {
    const ok = node.chon !== null && node.chon <= 8
    return { relative: ok, basis: ok ? `8촌 이내 혈족 (민법 §777 1호)` : '8촌 초과 혈족 — 민법상 친족 아님' }
  }
  if (node.kind === 'affinal') {
    const ok = node.chon !== null && node.chon <= 4
    return { relative: ok, basis: ok ? `4촌 이내 인척 (민법 §777 2호)` : '4촌 초과 인척 — 민법상 친족 아님' }
  }
  return { relative: false, basis: '민법상 친족 아님 (사돈은 인척 범위 밖)' }
}

/* 자주 찾는 관계 프리셋 */
export const PRESETS: { label: string; steps: StepId[]; gender?: Gender }[] = [
  { label: '아버지의 형', steps: ['F', 'OB'] },
  { label: '아버지의 사촌', steps: ['F', 'F', 'OB', 'S'] },
  { label: '사촌의 아들', steps: ['F', 'OB', 'S', 'S'] },
  { label: '어머니의 남동생의 아내', steps: ['M', 'YB', 'W'] },
  { label: '누나·언니의 남편', steps: ['OS', 'H'] },
  { label: '남편의 여동생', steps: ['H', 'YS'], gender: 'female' },
  { label: '아내의 오빠', steps: ['W', 'OB'], gender: 'male' },
  { label: '아들의 아내의 아버지', steps: ['S', 'W', 'F'] },
]
