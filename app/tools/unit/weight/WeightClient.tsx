'use client'

import ConverterUI from '../ConverterUI'

const units = [
  { label: '밀리그램',  symbol: 'mg',  toBase: (v: number) => v / 1_000_000,  fromBase: (v: number) => v * 1_000_000  },
  { label: '그램',      symbol: 'g',   toBase: (v: number) => v / 1000,       fromBase: (v: number) => v * 1000       },
  { label: '킬로그램',  symbol: 'kg',  toBase: (v: number) => v,              fromBase: (v: number) => v              },
  { label: '톤',        symbol: 't',   toBase: (v: number) => v * 1000,       fromBase: (v: number) => v / 1000       },
  { label: '파운드',    symbol: 'lb',  toBase: (v: number) => v * 0.453592,   fromBase: (v: number) => v / 0.453592   },
  { label: '온스',      symbol: 'oz',  toBase: (v: number) => v * 0.0283495,  fromBase: (v: number) => v / 0.0283495  },
  { label: '근 (한국)', symbol: '근',  toBase: (v: number) => v * 0.6,        fromBase: (v: number) => v / 0.6        },
  { label: '돈 (한국)', symbol: '돈',  toBase: (v: number) => v * 0.00375,    fromBase: (v: number) => v / 0.00375    },
]

export default function WeightClient() {
  return <ConverterUI units={units} defaultFrom={2} defaultTo={4} />
}