/* ──────────────────────────────────────────────────────
   music/vocal-range/vocalData.ts
   음역대 분류 + 한국 인기 곡 음역 데이터
   ※ 본 데이터는 일반 참고용 (개체차·곡 버전·라이브 키 등 변동)
   ────────────────────────────────────────────────────── */

import { noteNameToMidi } from './noteUtils'

export interface VocalRange {
  id: string
  name: string
  shortName: string
  low: string
  high: string
  midiLow: number
  midiHigh: number
  desc: string
  examples: string
  color: string
  gender: 'male' | 'female' | 'any'
}

const mk = (id: string, name: string, shortName: string, low: string, high: string,
            desc: string, examples: string, color: string, gender: VocalRange['gender']): VocalRange => ({
  id, name, shortName, low, high,
  midiLow: noteNameToMidi(low), midiHigh: noteNameToMidi(high),
  desc, examples, color, gender,
})

export const VOCAL_RANGES: VocalRange[] = [
  mk('bass',         '베이스',     'Bass',   'E2', 'E4', '남성 가장 낮은 음역',   '이정·김광진',   '#0891B2', 'male'),
  mk('baritone',     '바리톤',     'Baritone', 'G2', 'G4', '남성 중간 음역',         '성시경·박효신', '#059669', 'male'),
  mk('tenor',        '테너',       'Tenor',   'C3', 'C5', '남성 높은 음역',          '이수·휘성',     '#A16207', 'male'),
  mk('countertenor', '카운터테너', 'Countertenor', 'E3', 'E5', '남성 매우 높은 음역', '폴 포츠',        '#EA580C', 'male'),
  mk('contralto',    '콘트랄토',   'Contralto', 'F3', 'F5', '여성 가장 낮은 음역',   '이은미',         '#9333EA', 'female'),
  mk('alto',         '알토',       'Alto',     'G3', 'G5', '여성 중간 음역',         '아이유 (저음)',   '#DB2777', 'female'),
  mk('mezzo',        '메조소프라노', 'Mezzo',   'A3', 'A5', '여성 중상 음역',         '백지영·태연',     '#DC2626', 'female'),
  mk('soprano',      '소프라노',   'Soprano', 'C4', 'C6', '여성 높은 음역',          '아이유·박정현',   '#FFB347', 'female'),
]

/* ─── 한국 인기 곡 음역 (참고 데이터) ─── */
export interface SongData {
  title: string
  artist: string
  lowest: string   // 노래 최저음
  highest: string  // 노래 최고음
  rangeText: string
  difficulty: '하' | '중' | '중상' | '상' | '최상'
  genre: string
}

export const KOREAN_SONGS: SongData[] = [
  // 발라드
  { title: '벚꽃엔딩',           artist: '버스커버스커',  lowest: 'D3',  highest: 'A4',  rangeText: '19반음', difficulty: '하',   genre: '발라드' },
  { title: '너의 의미',          artist: '아이유',        lowest: 'A3',  highest: 'D5',  rangeText: '17반음', difficulty: '하',   genre: '발라드' },
  { title: '봄봄봄',             artist: '로이킴',        lowest: 'B2',  highest: 'F#4', rangeText: '19반음', difficulty: '하',   genre: '발라드' },
  { title: '소주 한 잔',          artist: '임창정',        lowest: 'A2',  highest: 'A4',  rangeText: '24반음', difficulty: '중',   genre: '발라드' },
  { title: '눈의 꽃',            artist: '박효신',        lowest: 'B2',  highest: 'A4',  rangeText: '22반음', difficulty: '중',   genre: '발라드' },
  { title: '밤편지',             artist: '아이유',        lowest: 'F#3', highest: 'F#5', rangeText: '24반음', difficulty: '중상', genre: '발라드' },
  { title: '좋은 날',            artist: '아이유',        lowest: 'A3',  highest: 'F5',  rangeText: '20반음', difficulty: '상',   genre: '발라드' },
  { title: 'Lilac',              artist: '아이유',        lowest: 'F#3', highest: 'D5',  rangeText: '19반음', difficulty: '중상', genre: '발라드' },
  { title: '야생화',             artist: '박효신',        lowest: 'B2',  highest: 'B4',  rangeText: '24반음', difficulty: '중상', genre: '발라드' },
  { title: '겨울잠',             artist: '아이유',        lowest: 'A3',  highest: 'C#5', rangeText: '16반음', difficulty: '중',   genre: '발라드' },
  { title: '서른 즈음에',        artist: '김광석',        lowest: 'A2',  highest: 'F#4', rangeText: '21반음', difficulty: '중',   genre: '발라드' },
  { title: '그땐 그랬지',         artist: '이문세',        lowest: 'B2',  highest: 'F#4', rangeText: '19반음', difficulty: '중',   genre: '발라드' },
  // 댄스/팝
  { title: '거짓말',             artist: '빅뱅',          lowest: 'A2',  highest: 'A4',  rangeText: '24반음', difficulty: '중',   genre: '댄스' },
  { title: 'Dynamite',           artist: '방탄소년단',    lowest: 'C3',  highest: 'C5',  rangeText: '24반음', difficulty: '중상', genre: '팝' },
  { title: 'Butter',             artist: '방탄소년단',    lowest: 'A2',  highest: 'A4',  rangeText: '24반음', difficulty: '중',   genre: '팝' },
  { title: 'Spring Day',         artist: '방탄소년단',    lowest: 'F#3', highest: 'A4',  rangeText: '15반음', difficulty: '중',   genre: '발라드' },
  { title: 'NEXT LEVEL',         artist: '에스파',        lowest: 'A3',  highest: 'E5',  rangeText: '19반음', difficulty: '중상', genre: '댄스' },
  { title: 'Blueming',           artist: '아이유',        lowest: 'F#3', highest: 'F#5', rangeText: '24반음', difficulty: '중상', genre: '팝' },
  // 락/올드팝
  { title: '말하는 대로',         artist: '유재석·이적',   lowest: 'A2',  highest: 'F#4', rangeText: '21반음', difficulty: '중',   genre: '발라드' },
  { title: '걱정말아요 그대',     artist: '이적',          lowest: 'A2',  highest: 'F4',  rangeText: '20반음', difficulty: '중',   genre: '발라드' },
  { title: '서울의 달',          artist: '김건모',        lowest: 'A2',  highest: 'E4',  rangeText: '19반음', difficulty: '중',   genre: '발라드' },
  // 고난도
  { title: 'Lay Back',           artist: '이수',          lowest: 'A2',  highest: 'C5',  rangeText: '27반음', difficulty: '상',   genre: '록발라드' },
  { title: 'Tears',              artist: '소찬휘',        lowest: 'B3',  highest: 'A5',  rangeText: '22반음', difficulty: '최상', genre: '록발라드' },
  { title: 'Lost',               artist: '박효신',        lowest: 'A2',  highest: 'A4',  rangeText: '24반음', difficulty: '중상', genre: '록발라드' },
  { title: '다시 사랑한다 말할까', artist: '김동률',        lowest: 'A2',  highest: 'F#4', rangeText: '21반음', difficulty: '중',   genre: '발라드' },
  // 트로트·그 외
  { title: '아무노래',           artist: '지코',          lowest: 'C3',  highest: 'A4',  rangeText: '21반음', difficulty: '중',   genre: '힙합' },
  { title: '강남스타일',          artist: '싸이',          lowest: 'B2',  highest: 'B4',  rangeText: '24반음', difficulty: '중',   genre: '댄스' },
  { title: '안녕',               artist: '폴킴',          lowest: 'B2',  highest: 'G#4', rangeText: '22반음', difficulty: '중',   genre: '발라드' },
  { title: '모든 날, 모든 순간',   artist: '폴킴',          lowest: 'C3',  highest: 'A4',  rangeText: '21반음', difficulty: '중',   genre: '발라드' },
  { title: '취중진담',            artist: '김동률',        lowest: 'A2',  highest: 'G4',  rangeText: '22반음', difficulty: '중상', genre: '발라드' },
  { title: '나는 나비',           artist: 'YB',            lowest: 'C3',  highest: 'A4',  rangeText: '21반음', difficulty: '중',   genre: '록' },
  { title: '잔소리',              artist: '아이유·임슬옹', lowest: 'A3',  highest: 'C5',  rangeText: '15반음', difficulty: '하',   genre: '발라드' },
  { title: '너에게',              artist: '서태지와아이들', lowest: 'B2', highest: 'F#4', rangeText: '19반음', difficulty: '중',   genre: '댄스' },
  { title: '예아',                artist: '윤하',          lowest: 'A3',  highest: 'D5',  rangeText: '17반음', difficulty: '중',   genre: '록' },
  { title: '사건의 지평선',        artist: '윤하',          lowest: 'F#3', highest: 'D5',  rangeText: '19반음', difficulty: '중상', genre: '록' },
  { title: '잘 가요 내 사랑',      artist: '거미',          lowest: 'A3',  highest: 'F5',  rangeText: '20반음', difficulty: '상',   genre: '발라드' },
]

/* ─── 노래 매칭 ─── */
export interface SongMatch extends SongData {
  songLowMidi: number
  songHighMidi: number
  fitsExact: boolean
  bestKeyShift: number  // -6 ~ +6
  matchScore: number    // 0~100 (높을수록 추천)
}

export function matchSongs(userLowMidi: number, userHighMidi: number, limit: number = 12): SongMatch[] {
  return KOREAN_SONGS
    .map(song => {
      const songLow = noteNameToMidi(song.lowest)
      const songHigh = noteNameToMidi(song.highest)
      const fitsExact = userLowMidi <= songLow && userHighMidi >= songHigh

      // 키 이동 ±6 시도
      let bestKeyShift = 0
      let bestFit = false
      for (let shift = 0; shift <= 6; shift++) {
        for (const sign of [-1, 1]) {
          if (shift === 0 && sign === 1) continue
          const s = shift * sign
          const adjLow = songLow + s
          const adjHigh = songHigh + s
          if (userLowMidi <= adjLow && userHighMidi >= adjHigh) {
            if (!bestFit || Math.abs(s) < Math.abs(bestKeyShift)) {
              bestKeyShift = s
              bestFit = true
            }
          }
        }
      }

      // 점수 — 키 이동 0이 최고, 멀어질수록 감점
      const matchScore = bestFit ? 100 - Math.abs(bestKeyShift) * 10 : 0

      return {
        ...song,
        songLowMidi: songLow,
        songHighMidi: songHigh,
        fitsExact,
        bestKeyShift,
        matchScore,
      }
    })
    .filter(s => s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}

/* ─── 음역대 자동 분류 ─── */
export function classifyVocalRange(lowMidi: number, highMidi: number): VocalRange | null {
  const midPoint = (lowMidi + highMidi) / 2
  let best: VocalRange | null = null
  let bestDist = Infinity
  for (const range of VOCAL_RANGES) {
    const rangeMid = (range.midiLow + range.midiHigh) / 2
    const dist = Math.abs(rangeMid - midPoint)
    if (dist < bestDist) {
      best = range
      bestDist = dist
    }
  }
  return best
}
