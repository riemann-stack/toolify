'use client'

import ConverterUI from '../ConverterUI'

const units = [
  { label: '평 (평방미터)',  symbol: '평',  toBase: (v: number) => v * 3.305785,  fromBase: (v: number) => v / 3.305785  },
  { label: '제곱미터',       symbol: '㎡',  toBase: (v: number) => v,             fromBase: (v: number) => v             },
  { label: '제곱센티미터',   symbol: '㎝²', toBase: (v: number) => v / 10000,     fromBase: (v: number) => v * 10000     },
  { label: '제곱킬로미터',   symbol: '㎞²', toBase: (v: number) => v * 1_000_000, fromBase: (v: number) => v / 1_000_000 },
  { label: '헥타르',         symbol: 'ha',  toBase: (v: number) => v * 10000,     fromBase: (v: number) => v / 10000     },
  { label: '에이커',         symbol: 'ac',  toBase: (v: number) => v * 4046.856,  fromBase: (v: number) => v / 4046.856  },
  { label: '제곱피트',       symbol: 'ft²', toBase: (v: number) => v * 0.092903,  fromBase: (v: number) => v / 0.092903  },
]

export default function AreaClient() {
  return <ConverterUI units={units} defaultFrom={0} defaultTo={1} />
}