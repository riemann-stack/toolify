'use client'

import { useState } from 'react'
import s from './conversionTable.module.css'

interface Group {
  id: string
  icon: string
  name: string
  rows: [string, string][]
}

const GROUPS: Group[] = [
  {
    id: 'length', icon: '📏', name: '길이',
    rows: [
      ['1 인치', '2.54 cm'],
      ['1 피트', '30.48 cm'],
      ['1 야드', '0.914 m'],
      ['1 마일', '1.609 km'],
      ['1 푼 (分)', '약 3.03 mm'],
      ['1 치 (寸)', '약 3.03 cm'],
      ['1 자/척 (尺)', '약 30.3 cm'],
      ['1 리 (里, 한국)', '약 393 m'],
    ],
  },
  {
    id: 'area', icon: '🏠', name: '면적',
    rows: [
      ['1 평 (坪)', '3.306 ㎡'],
      ['84 ㎡', '약 25.4 평'],
      ['1 에이커', '4,047 ㎡ (약 1,224평)'],
      ['1 단보 (段步)', '약 991 ㎡ (300평)'],
      ['1 정보 (町步)', '약 9,917 ㎡ (3,000평)'],
      ['1 마지기', '약 661 ㎡ (200평·지역차)'],
    ],
  },
  {
    id: 'weight', icon: '⚖️', name: '무게',
    rows: [
      ['1 온스', '28.35 g'],
      ['1 파운드', '453.59 g'],
      ['1 돈 (錢)', '3.75 g'],
      ['1 냥 (兩)', '37.5 g'],
      ['1 근 (斤, 한국)', '600 g'],
      ['1 관 (貫)', '3.75 kg'],
    ],
  },
  {
    id: 'volume', icon: '🧴', name: '부피',
    rows: [
      ['1 큰술', '15 ml'],
      ['1 컵 (한국)', '200 ml'],
      ['1 갤런 (US)', '3,785 ml'],
      ['1 홉 (合)', '180 ml'],
      ['1 되 (升)', '1.8 L'],
      ['1 말 (斗)', '18 L'],
      ['1 섬 (石)', '180 L'],
    ],
  },
  {
    id: 'temperature', icon: '🌡️', name: '온도',
    rows: [
      ['0 ℃', '32 ℉ (어는점)'],
      ['37 ℃', '98.6 ℉ (체온)'],
      ['100 ℃', '212 ℉ (끓는점)'],
    ],
  },
  {
    id: 'etc', icon: '🔁', name: '속도·압력 외',
    rows: [
      ['60 mph (속도)', '96.56 km/h'],
      ['1 bar (압력)', '14.5 psi'],
      ['딸기 10 °Bx (당도)', '10 % (= 100 g/L)'],
      ['김치 7 염% (염도)', '70 g/L (= 70,000 ppm)'],
      ['100 ppm (농도)', '0.01 % (= 100 mg/L)'],
      ['5 % 경사 (기울기)', '약 2.86°'],
      ['4치 물매 (지붕)', '약 21.8° (= 40% 경사)'],
    ],
  },
]

export default function ConversionTableTabs() {
  const [active, setActive] = useState('length')
  const group = GROUPS.find(g => g.id === active)!

  return (
    <div>
      <div className={s.tabs}>
        {GROUPS.map(g => (
          <button
            key={g.id}
            type="button"
            className={`${s.tab} ${active === g.id ? s.tabActive : ''}`}
            onClick={() => setActive(g.id)}
          >
            <span aria-hidden style={{ marginRight: 4 }}>{g.icon}</span>{g.name}
          </button>
        ))}
      </div>
      <table className={s.table}>
        <tbody>
          {group.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? s.rowAlt : undefined}>
              <td className={s.inputCell}>{row[0]}</td>
              <td className={s.arrowCell}>→</td>
              <td className={s.resultCell}>{row[1]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
