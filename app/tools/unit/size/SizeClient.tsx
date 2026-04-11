'use client'

import { useState } from 'react'
import styles from './size.module.css'

type Tab = 'shoes' | 'top' | 'bottom'

const SHOE_DATA = [
  { us: '5',    uk: '4',    eu: '35-36', kr: '220', cm: '22.0' },
  { us: '5.5',  uk: '4.5',  eu: '36',    kr: '225', cm: '22.5' },
  { us: '6',    uk: '5',    eu: '36-37', kr: '230', cm: '23.0' },
  { us: '6.5',  uk: '5.5',  eu: '37',    kr: '235', cm: '23.5' },
  { us: '7',    uk: '6',    eu: '37-38', kr: '240', cm: '24.0' },
  { us: '7.5',  uk: '6.5',  eu: '38',    kr: '245', cm: '24.5' },
  { us: '8',    uk: '7',    eu: '38-39', kr: '250', cm: '25.0' },
  { us: '8.5',  uk: '7.5',  eu: '39',    kr: '255', cm: '25.5' },
  { us: '9',    uk: '8',    eu: '39-40', kr: '260', cm: '26.0' },
  { us: '9.5',  uk: '8.5',  eu: '40',    kr: '265', cm: '26.5' },
  { us: '10',   uk: '9',    eu: '40-41', kr: '270', cm: '27.0' },
  { us: '10.5', uk: '9.5',  eu: '41',    kr: '275', cm: '27.5' },
  { us: '11',   uk: '10',   eu: '41-42', kr: '280', cm: '28.0' },
  { us: '12',   uk: '11',   eu: '43',    kr: '290', cm: '29.0' },
]

const TOP_DATA = [
  { kr: 'XS',  us: 'XS',  eu: 'XS',  it: '38', de: '32', chest: '82-84',  waist: '63-65' },
  { kr: 'S',   us: 'S',   eu: 'S',   it: '40', de: '34', chest: '85-88',  waist: '66-69' },
  { kr: 'M',   us: 'M',   eu: 'M',   it: '42', de: '36', chest: '89-92',  waist: '70-73' },
  { kr: 'L',   us: 'L',   eu: 'L',   it: '44', de: '38', chest: '93-97',  waist: '74-78' },
  { kr: 'XL',  us: 'XL',  eu: 'XL',  it: '46', de: '40', chest: '98-102', waist: '79-84' },
  { kr: 'XXL', us: 'XXL', eu: 'XXL', it: '48', de: '42', chest: '103-108',waist: '85-91' },
]

const BOTTOM_DATA = [
  { kr: '26', us: '26', eu: '36', waist: '66-67', hip: '88-89'   },
  { kr: '27', us: '27', eu: '37', waist: '68-70', hip: '90-92'   },
  { kr: '28', us: '28', eu: '38', waist: '71-73', hip: '93-95'   },
  { kr: '29', us: '29', eu: '39', waist: '74-76', hip: '96-98'   },
  { kr: '30', us: '30', eu: '40', waist: '77-80', hip: '99-102'  },
  { kr: '31', us: '31', eu: '41', waist: '81-84', hip: '103-106' },
  { kr: '32', us: '32', eu: '42', waist: '85-88', hip: '107-110' },
  { kr: '34', us: '34', eu: '44', waist: '89-93', hip: '111-115' },
  { kr: '36', us: '36', eu: '46', waist: '94-98', hip: '116-120' },
]

export default function SizeClient() {
  const [tab,    setTab]    = useState<Tab>('shoes')
  const [search, setSearch] = useState('')

  const filteredShoes = SHOE_DATA.filter(r =>
    !search ||
    r.us.includes(search) || r.eu.includes(search) ||
    r.kr.includes(search) || r.cm.includes(search)
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {([['shoes', '👟 신발'], ['top', '👕 상의'], ['bottom', '👖 하의']] as [Tab, string][]).map(([t, label]) => (
          <button key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => { setTab(t); setSearch('') }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'shoes' && (
        <>
          <div className={styles.searchBox}>
            <input className={styles.searchInput}
              placeholder="US, EU, mm 또는 한국 사이즈 검색..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {['한국 (mm)', 'US', 'UK', 'EU'].map(h => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredShoes.map((r, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}mm</td>
                    <td className={styles.td}>{r.us}</td>
                    <td className={styles.td}>{r.uk}</td>
                    <td className={styles.td}>{r.eu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'top' && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['한국', 'US/UK', 'EU', '이탈리아', '독일', '가슴둘레(cm)', '허리둘레(cm)'].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_DATA.map((r, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                  <td className={styles.td}>{r.us}</td>
                  <td className={styles.td}>{r.eu}</td>
                  <td className={styles.td}>{r.it}</td>
                  <td className={styles.td}>{r.de}</td>
                  <td className={styles.td}>{r.chest}</td>
                  <td className={styles.td}>{r.waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'bottom' && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                {['한국', 'US 인치', 'EU', '허리둘레(cm)', '힙둘레(cm)'].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BOTTOM_DATA.map((r, i) => (
                <tr key={i} className={styles.tr}>
                  <td className={`${styles.td} ${styles.tdAccent}`}>{r.kr}</td>
                  <td className={styles.td}>{r.us}</td>
                  <td className={styles.td}>{r.eu}</td>
                  <td className={styles.td}>{r.waist}</td>
                  <td className={styles.td}>{r.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}