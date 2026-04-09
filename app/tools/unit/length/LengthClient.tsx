'use client'

import ConverterUI from '../ConverterUI'

const units = [
  { label: '밀리미터', symbol: 'mm',   toBase: (v: number) => v / 1000,      fromBase: (v: number) => v * 1000      },
  { label: '센티미터', symbol: 'cm',   toBase: (v: number) => v / 100,       fromBase: (v: number) => v * 100       },
  { label: '미터',     symbol: 'm',    toBase: (v: number) => v,             fromBase: (v: number) => v             },
  { label: '킬로미터', symbol: 'km',   toBase: (v: number) => v * 1000,      fromBase: (v: number) => v / 1000      },
  { label: '인치',     symbol: 'inch', toBase: (v: number) => v * 0.0254,    fromBase: (v: number) => v / 0.0254    },
  { label: '피트',     symbol: 'ft',   toBase: (v: number) => v * 0.3048,    fromBase: (v: number) => v / 0.3048    },
  { label: '야드',     symbol: 'yd',   toBase: (v: number) => v * 0.9144,    fromBase: (v: number) => v / 0.9144    },
  { label: '마일',     symbol: 'mile', toBase: (v: number) => v * 1609.344,  fromBase: (v: number) => v / 1609.344  },
  { label: '해리',     symbol: 'nmi',  toBase: (v: number) => v * 1852,      fromBase: (v: number) => v / 1852      },
]

export default function LengthClient() {
  return <ConverterUI units={units} defaultFrom={2} defaultTo={4} />
}