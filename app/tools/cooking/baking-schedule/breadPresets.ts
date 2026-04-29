/* ──────────────────────────────────────────────────────
   baking-schedule/breadPresets.ts
   8가지 빵 표준 일정 + 온도 보정 + 발효 방식 옵션
   ────────────────────────────────────────────────────── */

export type StepDef = {
  id: string
  name: string
  minutes: number
  /** 1차/2차 발효 등 온도에 따라 시간이 크게 달라지는 단계 */
  tempSensitive?: boolean
  /** 사용자 판단(반죽 부피·기포 등)이 우선되는 단계 */
  observationKey?: 'bulk' | 'final-proof' | 'cold-proof'
  /** 단계별 가이드 (반죽 상태 기반) */
  guide?: string
  /** 선택적 단계 (오토리즈 등) */
  optional?: boolean
  /** 냉장 발효 등 가변 단계 */
  flexible?: boolean
  minRange?: number  // flexible 단계의 최소 분
  maxRange?: number  // flexible 단계의 최대 분
}

export type BreadDifficulty = '초급' | '초중급' | '중급' | '중상급' | '고급'

export type BreadPreset = {
  id: string
  name: string
  icon: string
  description: string
  difficulty: BreadDifficulty
  totalTimeHours: number
  steps: StepDef[]
  waterRatio?: number
  yeastRatio?: number
  levainRatio?: number
  notes: string
  /** 권장 반죽 최종 온도 (DDT) — 1차 발효 시작 시 반죽 자체의 온도 */
  ddtTargetC?: number
  /** 르방·프리퍼먼트 사용 여부 (DDT 공식에서 ×4 / ×3 결정) */
  hasLevain?: boolean
}

export const BREAD_PRESETS: BreadPreset[] = [
  {
    id: 'sourdough',
    name: '사워도우 (천연 발효)',
    icon: '🌾',
    description: '르방 사용 천연 발효빵, 냉장 발효 권장',
    difficulty: '중상급',
    totalTimeHours: 24,
    steps: [
      { id: 'autolyse', name: '오토리즈',         minutes: 30,  optional: true,
        guide: '밀가루+물만 섞어 휴지 — 글루텐 자동 형성, 본반죽 시간 단축' },
      { id: 'mix',      name: '소금·르방 투입',   minutes: 10,
        guide: '소금과 르방을 골고루 섞어 글루텐 형성을 시작합니다' },
      { id: 'fold1',    name: '1차 폴딩',         minutes: 30,
        guide: '반죽을 사방에서 접어 글루텐 강화 — 30분마다 반복' },
      { id: 'fold2',    name: '2차 폴딩',         minutes: 30,
        guide: '반죽이 점점 부드럽고 탄력 생김' },
      { id: 'fold3',    name: '3차 폴딩',         minutes: 30,
        guide: '윈도우 페인 테스트 — 얇은 막 형성되면 OK' },
      { id: 'fold4',    name: '4차 폴딩',         minutes: 30,
        guide: '반죽이 매끄럽고 표면 텐션 형성' },
      { id: 'bulk',     name: '1차 발효 (벌크)',   minutes: 180, tempSensitive: true, observationKey: 'bulk',
        guide: '⭐ 시간보다 부피 50~70% 증가·큰 기포 형성 우선' },
      { id: 'preshape', name: '예비 성형',        minutes: 20,
        guide: '반죽을 둥글려 표면 텐션을 만듭니다' },
      { id: 'bench',    name: '벤치 타임',        minutes: 20,
        guide: '15~20분 휴지 — 반죽 이완' },
      { id: 'shape',    name: '본 성형',          minutes: 15,
        guide: '바느질 성형이나 토르션 성형 — 표면 강한 텐션' },
      { id: 'cold-proof', name: '냉장 발효',      minutes: 720, observationKey: 'cold-proof',
        flexible: true, minRange: 480, maxRange: 1440,
        guide: '⭐ 8~24시간 가능, 길수록 풍미 깊음. 12시간 권장' },
      { id: 'preheat',  name: '오븐 예열 (250℃)', minutes: 45,
        guide: '오븐 + 더치 오븐(있다면) 함께 예열' },
      { id: 'bake',     name: '굽기 (스팀 250→230℃)', minutes: 40,
        guide: '첫 20분 강한 스팀, 이후 230℃로 낮춰 마저 굽기' },
      { id: 'cool',     name: '식히기',           minutes: 60,
        guide: '식기 전 자르면 속이 끈적해질 수 있음 — 1시간 이상 권장' },
    ],
    waterRatio: 75,
    levainRatio: 20,
    notes: '냉장 발효는 8~24시간 가능. 길수록 풍미 깊어짐.',
    ddtTargetC: 25, hasLevain: true,
  },
  {
    id: 'baguette',
    name: '바게트',
    icon: '🥖',
    description: '프랑스 전통 빵, 짧은 발효 + 강한 굽기',
    difficulty: '중급',
    totalTimeHours: 5,
    steps: [
      { id: 'autolyse', name: '오토리즈',          minutes: 30, optional: true, guide: '밀가루+물만 섞어 30분 휴지' },
      { id: 'mix',      name: '본반죽',            minutes: 10, guide: '이스트와 소금 투입 후 섞기' },
      { id: 'fold1',    name: '1차 폴딩',          minutes: 30, guide: '30분 후 폴딩' },
      { id: 'fold2',    name: '2차 폴딩',          minutes: 30, guide: '글루텐 발달 확인' },
      { id: 'bulk',     name: '1차 발효',          minutes: 90,  tempSensitive: true, observationKey: 'bulk',
        guide: '부피 50% 증가까지 — 22℃ 기준 90분' },
      { id: 'divide',   name: '분할',              minutes: 15, guide: '바게트 한 개당 약 250g' },
      { id: 'preshape', name: '예비 성형',         minutes: 15, guide: '둥글리지 않고 직사각형 모양' },
      { id: 'bench',    name: '벤치 타임',         minutes: 20, guide: '15~20분 휴지' },
      { id: 'shape',    name: '본 성형',           minutes: 20, guide: '길게 늘려 바게트 모양 — 표면 텐션 유지' },
      { id: 'final-proof', name: '2차 발효',       minutes: 60,  tempSensitive: true, observationKey: 'final-proof',
        guide: '⭐ 손가락 자국이 천천히 회복되면 OK' },
      { id: 'preheat',  name: '오븐 예열 (250℃)', minutes: 30, guide: '돌판 사용 권장' },
      { id: 'bake',     name: '굽기 (스팀 250℃)', minutes: 25, guide: '첫 5분 강한 스팀 — 광택과 크럼 형성' },
      { id: 'cool',     name: '식히기',           minutes: 30, guide: '식힘망 위에서 식히기' },
    ],
    waterRatio: 65,
    yeastRatio: 1.5,
    notes: '오븐 스팀 필수. 굽기 시작 5분 강한 스팀.',
    ddtTargetC: 24,
  },
  {
    id: 'ciabatta',
    name: '치아바타',
    icon: '🥪',
    description: '높은 수분율 이탈리아 빵, 큰 기포가 특징',
    difficulty: '중상급',
    totalTimeHours: 18,
    steps: [
      { id: 'biga',     name: '비가 만들기 (전날 저녁)', minutes: 720, observationKey: 'cold-proof',
        flexible: true, minRange: 480, maxRange: 960,
        guide: '밀가루·물·소량 이스트로 종 만들기 — 12시간 실온 발효' },
      { id: 'mix',      name: '본반죽',            minutes: 15, guide: '비가 + 본반죽 재료 합치기' },
      { id: 'fold1',    name: '1차 폴딩',          minutes: 30, guide: '높은 수분율 — 손에 물 적시고 작업' },
      { id: 'fold2',    name: '2차 폴딩',          minutes: 30, guide: '반죽 강해지며 점점 잡힘' },
      { id: 'fold3',    name: '3차 폴딩',          minutes: 30, guide: '큰 기포 형성 시작' },
      { id: 'bulk',     name: '1차 발효',          minutes: 120, tempSensitive: true, observationKey: 'bulk',
        guide: '⭐ 부피 약 70% 증가, 큰 기포 표면에 보임' },
      { id: 'divide',   name: '분할 (성형 X)',     minutes: 10, guide: '직사각형으로 잘라내기 — 둥글리지 않음' },
      { id: 'final-proof', name: '2차 발효',       minutes: 60,  tempSensitive: true, observationKey: 'final-proof',
        guide: '천 위에서 휴지 — 표면 약간 부드러워질 때까지' },
      { id: 'preheat',  name: '오븐 예열',         minutes: 30, guide: '240℃, 돌판 권장' },
      { id: 'bake',     name: '굽기 (240℃)',       minutes: 25, guide: '스팀 첫 5분 — 큰 기포 보존' },
      { id: 'cool',     name: '식히기',            minutes: 20, guide: '식힘망 위에서' },
    ],
    waterRatio: 80,
    notes: '높은 수분율로 다루기 어려움. 손 적시고 작업.',
    ddtTargetC: 24, hasLevain: true,
  },
  {
    id: 'whitebread',
    name: '식빵 (이스트)',
    icon: '🍞',
    description: '기본 식빵, 입문자 추천',
    difficulty: '초급',
    totalTimeHours: 4,
    steps: [
      { id: 'mix',      name: '반죽',     minutes: 15, guide: '모든 재료 합쳐 반죽' },
      { id: 'knead',    name: '치대기',   minutes: 15, guide: '윈도우 페인 테스트 통과까지' },
      { id: 'bulk',     name: '1차 발효', minutes: 60,  tempSensitive: true, observationKey: 'bulk',
        guide: '⭐ 부피 약 2배 — 손가락 자국 천천히 회복' },
      { id: 'divide',   name: '분할',     minutes: 10, guide: '식빵 틀 크기에 맞게' },
      { id: 'bench',    name: '벤치 타임', minutes: 15, guide: '둥글린 후 15분 휴지' },
      { id: 'shape',    name: '성형',     minutes: 10, guide: '말아서 식빵 틀에 넣기' },
      { id: 'final-proof', name: '2차 발효', minutes: 50,  tempSensitive: true, observationKey: 'final-proof',
        guide: '⭐ 틀 위로 살짝 올라올 때까지' },
      { id: 'preheat',  name: '오븐 예열 (180℃)', minutes: 15, guide: '180℃까지 예열' },
      { id: 'bake',     name: '굽기',     minutes: 30, guide: '180℃에서 30분, 진한 갈색까지' },
      { id: 'cool',     name: '식히기',   minutes: 30, guide: '틀에서 빼고 식힘망 위에서' },
    ],
    waterRatio: 65,
    yeastRatio: 2,
    notes: '입문자에게 추천. 반죽 가장 다루기 쉬움.',
    ddtTargetC: 27,
  },
  {
    id: 'focaccia',
    name: '포카치아',
    icon: '🫓',
    description: '높은 수분 + 올리브유 듬뿍, 입문자도 가능',
    difficulty: '중급',
    totalTimeHours: 5,
    steps: [
      { id: 'mix',      name: '반죽',     minutes: 15, guide: '모든 재료 합쳐 가볍게 섞기' },
      { id: 'fold1',    name: '1차 폴딩', minutes: 30, guide: '30분 후 폴딩' },
      { id: 'fold2',    name: '2차 폴딩', minutes: 30, guide: '높은 수분율 — 손에 올리브유' },
      { id: 'bulk',     name: '1차 발효', minutes: 120, tempSensitive: true, observationKey: 'bulk',
        guide: '⭐ 부피 약 2배 — 큰 기포 형성' },
      { id: 'pan',      name: '팬에 펴기', minutes: 15, guide: '올리브유 듬뿍, 팬 모서리까지 펴기' },
      { id: 'final-proof', name: '2차 발효', minutes: 45,  tempSensitive: true, observationKey: 'final-proof',
        guide: '부풀어 올라 폭신해질 때까지' },
      { id: 'topping',  name: '토핑·딤플', minutes: 10, guide: '올리브·로즈마리 등 + 손가락으로 딤플' },
      { id: 'preheat',  name: '오븐 예열 (220℃)', minutes: 20, guide: '220℃까지 예열' },
      { id: 'bake',     name: '굽기',     minutes: 25, guide: '진한 갈색에 윤기 날 때까지' },
      { id: 'cool',     name: '식히기',   minutes: 15, guide: '15분 식힌 후 잘라먹기' },
    ],
    waterRatio: 75,
    notes: '냉장 발효(8~24시간) 시 맛 더 깊어짐.',
    ddtTargetC: 25,
  },
  {
    id: 'bagel',
    name: '베이글',
    icon: '🥯',
    description: '쫄깃한 식감, 끓이기 후 굽기',
    difficulty: '중급',
    totalTimeHours: 4,
    steps: [
      { id: 'mix',      name: '반죽 (낮은 수분)', minutes: 15, guide: '낮은 수분율 — 단단한 반죽' },
      { id: 'knead',    name: '치대기',           minutes: 15, guide: '강하게 치대 글루텐 강화' },
      { id: 'bulk',     name: '1차 발효',         minutes: 60,  tempSensitive: true, observationKey: 'bulk',
        guide: '⭐ 약 1.5배 부피 증가까지' },
      { id: 'divide',   name: '분할',             minutes: 10, guide: '한 개당 약 100g' },
      { id: 'shape',    name: '성형 (도넛 모양)', minutes: 20, guide: '구멍 뚫기 또는 길게 말아 잇기' },
      { id: 'final-proof', name: '2차 발효',      minutes: 30,  tempSensitive: true, observationKey: 'final-proof',
        guide: '약간 부풀 정도 — 너무 많이 부풀면 끓일 때 무너짐' },
      { id: 'boil',     name: '끓이기 (꿀물 1분씩)', minutes: 15, guide: '꿀·맥아 추가하면 광택' },
      { id: 'topping',  name: '토핑',             minutes: 5, guide: '깨·양귀비 씨 등' },
      { id: 'preheat',  name: '오븐 예열 (220℃)', minutes: 15, guide: '220℃ 예열' },
      { id: 'bake',     name: '굽기',             minutes: 20, guide: '진한 갈색까지' },
      { id: 'cool',     name: '식히기',           minutes: 15, guide: '식힘망에서 식히기' },
    ],
    waterRatio: 55,
    notes: '낮은 수분율. 끓이는 물에 꿀·맥아 추가하면 광택.',
    ddtTargetC: 25,
  },
  {
    id: 'pizza',
    name: '피자 도우',
    icon: '🍕',
    description: '얇고 쫀쫀한 도우, 24~48시간 냉장 발효 권장',
    difficulty: '초중급',
    totalTimeHours: 26,
    steps: [
      { id: 'mix',         name: '반죽',          minutes: 10, guide: '모든 재료 가볍게 섞기' },
      { id: 'knead',       name: '치대기',        minutes: 10, guide: '글루텐 형성 — 부드러워질 때까지' },
      { id: 'bulk',        name: '1차 발효 (실온)', minutes: 60, tempSensitive: true, observationKey: 'bulk',
        guide: '⭐ 약 1.5배 부피 증가' },
      { id: 'cold-proof',  name: '냉장 발효',     minutes: 1440, observationKey: 'cold-proof',
        flexible: true, minRange: 720, maxRange: 2880,
        guide: '⭐ 24~48시간 — 길수록 풍미·소화율 향상' },
      { id: 'remove',      name: '냉장 → 실온 1시간', minutes: 60, guide: '굽기 1시간 전에 꺼내 실온 적응' },
      { id: 'divide',      name: '분할',          minutes: 10, guide: '한 판당 약 250g' },
      { id: 'shape',       name: '도우 펴기',     minutes: 10, guide: '손으로 늘리기 — 밀대 X' },
      { id: 'topping',     name: '토핑 올리기',   minutes: 5,  guide: '굽기 직전에 — 토마토·치즈·재료' },
      { id: 'preheat',     name: '오븐 예열 (최고온)', minutes: 30, guide: '돌판 사용 시 더 바삭' },
      { id: 'bake',        name: '굽기 (250℃+)',  minutes: 12, guide: '7~12분 — 치즈 녹고 가장자리 갈색' },
    ],
    waterRatio: 65,
    notes: '도우 스톤 사용 시 더 바삭. 토핑은 굽기 직전.',
    ddtTargetC: 24,
  },
  {
    id: 'croissant',
    name: '크루아상',
    icon: '🥐',
    description: '버터 접기 + 긴 발효, 고급 빵',
    difficulty: '고급',
    totalTimeHours: 16,
    steps: [
      { id: 'mix',         name: '반죽 (전날)',    minutes: 15, guide: '재료 합쳐 반죽' },
      { id: 'knead',       name: '치대기',         minutes: 10, guide: '글루텐 형성' },
      { id: 'rest',        name: '냉장 휴지 1시간', minutes: 60, guide: '반죽 차게 만들기' },
      { id: 'butter-block',name: '버터 블록 만들기', minutes: 15, guide: '버터를 사각형으로 두드려 펴기' },
      { id: 'lock-in',     name: '버터 봉입',      minutes: 15, guide: '반죽으로 버터 감싸기' },
      { id: 'fold1',       name: '1차 접기 (3절)', minutes: 15, guide: '3절 접기 후 90도 회전' },
      { id: 'rest1',       name: '냉장 휴지 30분', minutes: 30, guide: '버터 차게 유지' },
      { id: 'fold2',       name: '2차 접기',       minutes: 15, guide: '3절 접기 한 번 더' },
      { id: 'rest2',       name: '냉장 휴지 30분', minutes: 30, guide: '반죽 단단해질 때까지' },
      { id: 'fold3',       name: '3차 접기',       minutes: 15, guide: '마지막 3절 접기' },
      { id: 'overnight',   name: '냉장 12시간 휴지', minutes: 720, observationKey: 'cold-proof',
        flexible: true, minRange: 480, maxRange: 960,
        guide: '⭐ 8~16시간 — 글루텐 이완·풍미 발달' },
      { id: 'shape',       name: '재단·성형',      minutes: 30, guide: '삼각형 재단 후 말기' },
      { id: 'final-proof', name: '2차 발효 (실온)', minutes: 120, tempSensitive: true, observationKey: 'final-proof',
        guide: '⭐ 약 1.5~2배 부풀고, 흔들면 가볍게 흔들림' },
      { id: 'eggwash',     name: '계란물',         minutes: 5, guide: '계란 노른자 + 우유 살짝' },
      { id: 'preheat',     name: '오븐 예열 (200℃)', minutes: 20, guide: '200℃ 예열' },
      { id: 'bake',        name: '굽기',           minutes: 18, guide: '진한 갈색에 광택' },
      { id: 'cool',        name: '식히기',         minutes: 30, guide: '식힘망에서 30분' },
    ],
    waterRatio: 50,
    notes: '버터 온도 관리가 핵심. 18~22℃ 작업실 권장.',
    ddtTargetC: 22,
  },
]

/* 발효 방식 옵션 */
export type FermentationMode = 'sameday' | 'cold-bulk' | 'cold-final' | 'cold-bulk-final'

export const FERMENTATION_MODES: { id: FermentationMode; name: string; desc: string }[] = [
  { id: 'sameday',         name: '당일 발효',           desc: '실온에서 모든 발효 진행 (4~6시간)' },
  { id: 'cold-bulk',       name: '냉장 1차 발효',       desc: '1차 발효를 냉장고에서 (8~12시간)' },
  { id: 'cold-final',      name: '냉장 2차 발효',       desc: '성형 후 냉장 (8~24시간) — 가장 인기' },
  { id: 'cold-bulk-final', name: '냉장 1차 + 다음날 성형', desc: '전날 반죽 → 다음날 성형·굽기' },
]

/* 온도 보정 — 1차 발효 시간 배율 */
export type TempInfo = { temp: number; multiplier: number; warning: string; band: 'cold' | 'normal' | 'fast' | 'danger' }

export const TEMP_MULTIPLIERS: TempInfo[] = [
  { temp: 18, multiplier: 1.5,  warning: '발효 느림. 시간 충분히 확보', band: 'cold' },
  { temp: 20, multiplier: 1.3,  warning: '발효 다소 느림',                band: 'cold' },
  { temp: 22, multiplier: 1.0,  warning: '표준 발효 환경',                band: 'normal' },
  { temp: 24, multiplier: 0.9,  warning: '발효 약간 빠름',                band: 'normal' },
  { temp: 26, multiplier: 0.75, warning: '발효 빠름. 자주 확인',          band: 'fast' },
  { temp: 28, multiplier: 0.6,  warning: '⚠️ 발효 매우 빠름. 과발효 주의', band: 'fast' },
  { temp: 30, multiplier: 0.5,  warning: '⚠️ 과발효 위험 큼. 냉장 발효 권장', band: 'danger' },
]

/* 단계 ID → 이모지 매핑 */
export const STEP_EMOJI: Record<string, string> = {
  autolyse: '🌾', mix: '🧂', knead: '👐',
  fold1: '🔄', fold2: '🔄', fold3: '🔄', fold4: '🔄',
  bulk: '⏳', divide: '✂️', preshape: '🔵', bench: '🛋️',
  shape: '🥖', 'final-proof': '⏳', 'cold-proof': '❄️',
  preheat: '🔥', bake: '🍞', boil: '💧', cool: '❄️',
  biga: '🌾', 'butter-block': '🧈', 'lock-in': '📦',
  rest: '😴', overnight: '🌙', topping: '🌿', eggwash: '🥚',
  remove: '🌡️', pan: '🍳', rest1: '😴', rest2: '😴',
}

export function emojiForStep(stepId: string): string {
  return STEP_EMOJI[stepId] ?? '⏰'
}

/* ─── DDT (반죽 최종 온도) — 반죽 방식별 마찰열 ─── */
export type MixingMethod = 'hand' | 'mixer' | 'highspeed'

export const MIXING_METHODS: { id: MixingMethod; name: string; friction: number; desc: string }[] = [
  { id: 'hand',      name: '손반죽',         friction: 6,  desc: '+5~8℃ 마찰열 — 평균 6℃ 가정' },
  { id: 'mixer',     name: '스탠드믹서',     friction: 13, desc: '+12~15℃ 마찰열 — 평균 13℃ 가정' },
  { id: 'highspeed', name: '고속 스파이럴',  friction: 22, desc: '+20~25℃ 마찰열 — 평균 22℃ 가정' },
]
