// 신발 사이즈 기준표 — SizeClient(변환기)와 page.tsx(핵심 변환표)가 같이 쓰는 단일 소스.
// 남성: 나이키 코리아 남성 신발 사이즈표 기준 (https://www.nike.com/kr/size-fit/mens-footwear).
//   UK·EU는 브랜드마다 0.5 차이가 날 수 있음 (예: 아디다스는 250mm = US 7 = UK 6.5).
// 여성: 나이키 코리아 여성 신발 사이즈표 기준 (https://www.nike.com/kr/size-fit/womens-footwear).
//   여성 US = 남성 US + 1.5 규칙이라 EU는 남성표와 이어짐 (W US 7 = 남성 US 5.5 = EU 38, 240mm).
export interface ShoeRow { kr: number; us: string; uk: string; eu: string }

export const SHOE_M: ShoeRow[] = [
  { kr: 240, us: '6',    uk: '5.5', eu: '38.5' },
  { kr: 245, us: '6.5',  uk: '6',   eu: '39'   },
  { kr: 250, us: '7',    uk: '6',   eu: '40'   },
  { kr: 255, us: '7.5',  uk: '6.5', eu: '40.5' },
  { kr: 260, us: '8',    uk: '7',   eu: '41'   },
  { kr: 265, us: '8.5',  uk: '7.5', eu: '42'   },
  { kr: 270, us: '9',    uk: '8',   eu: '42.5' },
  { kr: 275, us: '9.5',  uk: '8.5', eu: '43'   },
  { kr: 280, us: '10',   uk: '9',   eu: '44'   },
  { kr: 285, us: '10.5', uk: '9.5', eu: '44.5' },
  { kr: 290, us: '11',   uk: '10',  eu: '45'   },
]

export const SHOE_F: ShoeRow[] = [
  { kr: 220, us: '5',    uk: '2.5', eu: '35.5' },
  { kr: 225, us: '5.5',  uk: '3',   eu: '36'   },
  { kr: 230, us: '6',    uk: '3.5', eu: '36.5' },
  { kr: 235, us: '6.5',  uk: '4',   eu: '37.5' },
  { kr: 240, us: '7',    uk: '4.5', eu: '38'   },
  { kr: 245, us: '7.5',  uk: '5',   eu: '38.5' },
  { kr: 250, us: '8',    uk: '5.5', eu: '39'   },
  { kr: 255, us: '8.5',  uk: '6',   eu: '40'   },
  { kr: 260, us: '9',    uk: '6.5', eu: '40.5' },
  { kr: 265, us: '9.5',  uk: '7',   eu: '41'   },
]
