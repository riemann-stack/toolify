import Link from 'next/link'
import ConverterClient from './ConverterClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/unit/converter',
  title: '단위 변환기 — 길이·무게·부피·온도·압력·토크·에너지·당도·농도·기울기 14종',
  description:
    '14개 카테고리 단위 변환기. 길이·면적·무게·부피·온도·시간·속도·압력(kgf/cm²)·토크(N·m·kgf·m·lbf·ft)·에너지(J·kcal·kWh·BTU)·데이터 + 당도·염도(Brix·g/L·ppm·염%)·농도(%·ppm·ppb·mg/L)·각도·기울기(도·%·라디안·1/n 구배·물매) + 한국 전통 단위(자·척·근·돈·평·홉·되) 한 번에 변환.',
  keywords: [
    '단위 변환기', '단위 변환', '길이 변환', '무게 변환', '온도 변환',
    '시간 변환', '면적 변환', 'cm to inch', 'kg to lb', '평 ㎡',
    '근 그램', '돈 그램', '자 cm', '한국 전통 단위',
    '섭씨 화씨', '갤런 리터', 'mph kmh',
    'Brix 변환', '당도 계산', '염도 변환', '소금물 농도', '김치 절임 염도',
    'ppm 변환', 'ppb mg/L', '농도 단위', '소독액 희석',
    '기울기 변환', '경사 도 %', '구배 1/n', '한국 물매', '경사로 각도',
  ],
})

export default function ConverterPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📐 단위 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        길이·면적·무게·부피·온도·시간·속도·압력·토크·에너지·데이터 + <strong style={{ color: 'var(--text)' }}>당도·염도(Brix)</strong>·<strong style={{ color: 'var(--text)' }}>농도(ppm·mg/L)</strong>·<strong style={{ color: 'var(--text)' }}>각도·기울기(% 경사·1/n 구배·물매)</strong> 14개 카테고리를 한 곳에서.{' '}
        <strong style={{ color: 'var(--text)' }}>한국 전통·생활 단위(자·척·근·돈·평·홉·되·소주잔·종이컵·물매)</strong>까지 즉시 변환.
      </p>

      <ConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 자주 쓰는 변환 표 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 쓰는 변환</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>카테고리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>입력</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#C485E0', fontWeight: 700 }}>결과</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['📏 길이', '1 마일',     '1.609 km'],
                  ['📏 길이', '1 피트',     '30.48 cm'],
                  ['📏 길이', '1 야드',     '0.914 m'],
                  ['📏 길이', '1 인치',     '2.54 cm'],
                  ['🏠 면적', '1 평',       '3.306 ㎡'],
                  ['🏠 면적', '84 ㎡',      '25.4 평'],
                  ['🏠 면적', '1 에이커',   '4,047 ㎡ (약 1,224평)'],
                  ['⚖️ 무게', '1 근 (한국)', '600 g'],
                  ['⚖️ 무게', '1 돈',       '3.75 g'],
                  ['⚖️ 무게', '1 파운드',   '453.59 g'],
                  ['⚖️ 무게', '1 온스',     '28.35 g'],
                  ['🧴 부피', '1 컵 (한국)', '200 ml'],
                  ['🧴 부피', '1 갤런 (US)', '3,785 ml'],
                  ['🧴 부피', '1 큰술',     '15 ml'],
                  ['🧴 부피', '1 되',       '1.8 L'],
                  ['🌡️ 온도', '0 ℃',       '32 ℉'],
                  ['🌡️ 온도', '100 ℃',     '212 ℉'],
                  ['🌡️ 온도', '37 ℃',      '98.6 ℉ (체온)'],
                  ['🚗 속도', '60 mph',    '96.56 km/h'],
                  ['💨 압력', '1 bar',     '14.5 psi'],
                  ['🍯 당도', '딸기 10°Bx', '10% (= 100 g/L)'],
                  ['🍯 염도', '김치 7염%',  '70 g/L (= 70,000 ppm)'],
                  ['🍯 염도', '해수 35‰',   '3.5% (염도)'],
                  ['🧪 농도', '100 ppm',    '0.01% (= 100 mg/L)'],
                  ['🧪 농도', '1 ppm',      '1,000 ppb'],
                  ['📐 기울기', '5% 경사',  '약 2.86°'],
                  ['📐 기울기', '30°',       '57.7% 경사'],
                  ['📐 기울기', '1/100 구배', '약 0.57°'],
                  ['📐 기울기', '4치 물매',  '약 21.8° (= 40% 경사)'],
                  ['📐 기울기', '10치 물매', '45° (= 100% 경사)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#C485E0', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 한국 전통 단위 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>한국 전통·생활 단위 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            본 도구는 한국에서 일상적으로 쓰이는 전통·생활 단위를 모두 지원합니다. 시대·지역·용도에 따라 차이가 있어 주의가 필요한 단위도 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { name: '📏 길이', items: ['치(寸) ≈ 3.03cm', '자(尺) ≈ 30.3cm', '보(步) ≈ 1.82m', '리(里) ≈ 393m (한국)'] },
              { name: '🏠 면적', items: ['평(坪) = 400/121 ㎡ ≈ 3.306㎡', '단보(段) ≈ 991㎡ (300평)', '마지기 ≈ 661㎡ (200평·지역차 큼)'] },
              { name: '⚖️ 무게', items: ['돈(錢) = 3.75g (귀금속)', '냥(兩) = 37.5g', '근(斤) = 600g (한국 시장 관행)', '관(貫) = 3.75kg'] },
              { name: '🧴 부피', items: ['홉(合) = 180ml', '되(升) = 1.8L', '말(斗) = 18L', '컵 = 200ml (한국 표준)', '소주잔 ≈ 50ml · 종이컵 ≈ 180ml'] },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid rgba(176,62,255,0.30)', borderRadius: 12, padding: '14px 18px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#C485E0', marginBottom: '6px' }}>{c.name}</p>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
                  {c.items.map((it, j) => <li key={j}>· {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.7 }}>
            ⓘ <strong style={{ color: 'var(--text)' }}>1근 주의</strong> — 옛날 한국 1근 = 400g, 중국 1근 = 500g, 한국 시장 관행 1근 = 600g. 정육점·과일가게에서는 보통 600g 기준이며, 옛 문헌의 1근은 400g인 경우가 많습니다.
          </p>
        </section>

        {/* 카테고리별 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>14개 카테고리 가이드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📏', name: '길이', desc: 'mm·cm·m·km / inch·ft·yard·mile / 치·자·보·간·정·리(한국)' },
              { icon: '🏠', name: '면적', desc: '㎡·a·ha·km² / ft²·yd²·acre / 평·단보·마지기(한국)' },
              { icon: '⚖️', name: '무게', desc: 'mg·g·kg·ton / oz·lb / 돈·냥·근·관(한국)' },
              { icon: '🧴', name: '부피', desc: 'ml·L / fl oz·gallon(US) / 큰술·작은술·컵 / 홉·되·말·섬(전통) / 소주잔·종이컵·밥숟가락(생활)' },
              { icon: '🌡️', name: '온도', desc: '섭씨(℃)·화씨(℉)·켈빈(K)·랭킨(°R) — 비선형 변환 별도 처리' },
              { icon: '⏱️', name: '시간', desc: 'ms·s·min·h·day·week·month·year + 근무시간(주 40h·월 209h·연 2,508h)' },
              { icon: '🚗', name: '속도', desc: 'm/s·km/h·mph·knot·ft/s' },
              { icon: '💨', name: '압력', desc: 'Pa·kPa·MPa·bar·psi·atm·mmHg·kgf/cm²(한국 산업)·hPa(기상)·inHg·Torr — 타이어·혈압·기상·산업' },
              { icon: '🔧', name: '토크', desc: 'N·m·kN·m·N·cm / kgf·m(한국)·kgf·cm / lbf·ft(미국)·lbf·in·ozf·in / dyn·cm — 자동차·정비 매뉴얼 환산' },
              { icon: '⚡', name: '에너지', desc: 'J·kJ·MJ / cal·kcal(식품) / Wh·kWh·MWh(전기) / BTU(에어컨·보일러) / ft·lb·erg·eV / TNT 등가' },
              { icon: '💾', name: '데이터', desc: 'bit·byte·KB·MB·GB·TB (1000) + KiB·MiB·GiB(1024)' },
              { icon: '🍯', name: '당도·염도', desc: 'Brix(°Bx)·% 질량분율·g/100g·g/L·ppm·염도 %·소금물 g/L — 잼·청·김치 절임·장아찌·음료·시럽 레시피' },
              { icon: '🧪', name: '농도', desc: '%·‰·ppm·ppb·mg/L·µg/L·g/L — 소독액 희석·수질·비료·화학 실험·환경 분석. mol/L은 분자량 별도 필요' },
              { icon: '📐', name: '각도·기울기', desc: '도(°)·라디안·그라디안 / % 경사·‰ 구배·1/n 구배·N:1 비율 / 한국 물매(치/자) — 도로·철도·하수관·지붕·비탈면' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 14px' }}>
                <p style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{c.icon} {c.name}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 당도·염도 활용 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>🍯 당도·염도 활용 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            <strong style={{ color: 'var(--text)' }}>Brix(°Bx)</strong>는 100g 용액에 녹은 자당(설탕)의 그램 수로, 굴절계로 측정하는 표준 당도 단위입니다.
            염도(salinity)는 소금물에서 100g 용액에 녹은 소금의 그램 수로, Brix와 동일한 % 단위지만 측정 대상이 다릅니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>활용</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>표준 농도</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🍓 잼·청 (저당)',     '14~18 °Bx',   '발효 위험 ↑ · 냉장 보관 필수'],
                  ['🍓 잼·청 (일반)',     '22~28 °Bx',   '시판 잼 평균 · 1~2주 냉장'],
                  ['🍓 잼·청 (보존용)',   '50~65 °Bx',   '실온 보관 가능 · 풀당 시럽'],
                  ['🥒 김치 절임 (배추)', '7~10 염%',    '소금/배추 무게비 · 6~8시간 절임'],
                  ['🥒 장아찌 (절임용)',  '15~20 염%',    '실온 장기보관 가능'],
                  ['🥒 오이지',           '10~12 염%',    '여름 한 달 보관'],
                  ['🥃 시럽 (음료용)',    '50~67 °Bx',   '레모네이드·에이드 베이스'],
                  ['🥤 탄산음료',         '8~12 °Bx',    '콜라 약 11°Bx · 스프라이트 약 10°Bx'],
                  ['🌊 해수',             '약 35 ‰ (3.5%)', '평균 해양 염분 농도'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: '#C485E0', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: 12.5 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ⓘ <strong style={{ color: 'var(--text)' }}>측정 도구</strong> — 굴절계(refractometer)로 °Bx 직접 측정 가능 (3~5만원대). 염도계는 전도도 기반으로 염도(‰·%)를 표시합니다. 가정에서는 디지털 굴절계 1대로 잼·청·소금물·소스 모두 측정 가능합니다.
          </p>
        </section>

        {/* 농도 활용 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>🧪 농도 활용 가이드 — 소독액·수질·비료</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            농도 단위는 절대 환산 관계가 있습니다. <strong style={{ color: 'var(--text)' }}>1% = 10,000 ppm = 10,000,000 ppb = 10 g/L = 10,000 mg/L</strong>(수용액 가정).
            mg/L와 ppm은 수용액에서 거의 같으며, ppb는 ppm의 1/1,000입니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>용도</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>권장 농도</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>희석 예시</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🚰 수돗물 잔류염소',  '0.1~0.5 ppm (0.5 mg/L)', '환경부 기준 ≤ 4 ppm'],
                  ['🧴 식기 소독 (락스)', '100~200 ppm',     '5% 락스 1mL + 물 250~500mL'],
                  ['🚽 표면 소독 (락스)', '500~1,000 ppm',    '5% 락스 1mL + 물 50~100mL'],
                  ['🧪 코로나 방역 (락스)', '1,000 ppm (0.1%)', '5% 락스 1:50 희석 (1mL : 49mL)'],
                  ['🌱 일반 비료 EC',     '약 1,000~2,000 ppm', 'EC 1.5~3.0 mS/cm'],
                  ['🐟 수족관 어류',      '0.05~0.5 ppm 암모니아', '높으면 즉시 환수'],
                  ['🌍 환경 잔류농약',    'ppb 단위 (µg/L)',  'ppm의 1/1,000 단위'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: '#C485E0', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontSize: 12.5 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'rgba(255,138,62,0.06)', border: '1px solid rgba(255,138,62,0.40)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--text)', lineHeight: 1.8 }}>
            ⚠️ <strong style={{ color: '#FFA63E' }}>약품·소독액 안전 안내</strong><br />
            • 락스(차아염소산나트륨)·과산화수소·산성 세제는 저농도라도 피부·호흡기·눈을 자극합니다. 사용 시 환기·장갑·고글 착용 필수.<br />
            • <strong>산성 세제 + 염소계 표백제 절대 혼합 금지</strong> — 유독한 염소 가스(Cl₂)가 발생합니다. 락스 + 식초·구연산·변기세정제 혼합 사고가 자주 보고됩니다.<br />
            • 정확한 사용 농도·반응 시간·헹굼 방법은 <strong>제조사 라벨</strong> 또는 <strong>식품의약품안전처(KFDA)·질병관리청(KDCA)</strong> 가이드를 따르세요.<br />
            • 본 도구는 일반 환산만 제공하며, 의료·전문 화학 실험에는 보정된 기기와 표준 시약을 사용해야 합니다.
          </div>
        </section>

        {/* 각도·기울기 활용 가이드 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>📐 각도·기울기 활용 가이드</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            기울기는 분야마다 표기가 다릅니다. 수학·물리는 <strong style={{ color: 'var(--text)' }}>도(°)</strong>·<strong style={{ color: 'var(--text)' }}>라디안</strong>, 도로는 <strong style={{ color: 'var(--text)' }}>%</strong>, 철도·하수는 <strong style={{ color: 'var(--text)' }}>1/n 구배</strong> 또는 <strong style={{ color: 'var(--text)' }}>‰</strong>, 한옥 지붕은 <strong style={{ color: 'var(--text)' }}>물매(치/자)</strong>를 씁니다.
            모두 <strong>tan(각도)</strong> 한 함수로 환산됩니다.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>분야</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>대표 기울기</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#C485E0', fontWeight: 700 }}>각도 환산</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🛣️ 도로 표지 (완만)',    '5%',        '약 2.86°'],
                  ['🛣️ 도로 표지 (가파름)',  '10%',       '약 5.71°'],
                  ['🛣️ 도로 표지 (위험)',    '15%',       '약 8.53°'],
                  ['🚆 고속철도 구배',        '≤ 25‰ (= 1/40)', '약 1.43°'],
                  ['🚆 일반철도 구배',        '≤ 30‰ (= 1/33)', '약 1.72°'],
                  ['🌊 하수관 자연 흐름',     '1/100 ~ 1/50', '0.57° ~ 1.15°'],
                  ['🪜 가정 계단',            '약 30~38°',  '60~78% 경사'],
                  ['♿ 휠체어 경사로 (KS)',   '1/12 (≈ 8.3%)', '약 4.76°'],
                  ['🏛️ 한옥 지붕 물매 (낮음)', '4~6치',     '21.8° ~ 31.0°'],
                  ['🏛️ 한옥 지붕 물매 (보통)', '7~9치',     '35.0° ~ 42.0°'],
                  ['🏛️ 한옥 지붕 물매 (가파름)', '10치 = 1자',  '45° (= 100%)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: '#C485E0', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 800 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.7 }}>
            ⓘ <strong style={{ color: 'var(--text)' }}>핵심 공식</strong> — % 경사 = tan(각도) × 100, 각도 = atan(% / 100). 1/n 구배 = 1 / tan(각도). 한국 물매 N치 = 10 × tan(각도). 작은 각도에서는 % ≈ 1/n × 100 이 거의 같지만 큰 각도에서는 차이가 커집니다(예: 45° = 100% = 1/1).
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '1근은 정확히 몇 g인가요?',
                a: '용도·시대·지역에 따라 다릅니다. <strong>한국 시장 관행(정육점·과일가게)에서는 1근 = 600g</strong>이 표준이지만, 옛날 한국 1근은 400g이었고 중국·대만 1근은 500g입니다. 본 도구는 한국 시장 관행인 600g을 기본으로 적용하며, 옛 문헌·약재 단위로 1근을 해석할 때는 별도 확인이 필요합니다.',
              },
              {
                q: '평(坪)은 정확히 몇 제곱미터인가요?',
                a: '<strong>1평 = 400/121 ㎡ ≈ 3.305785㎡</strong>입니다 (1평 = 6자×6자 = 36 제곱자). 일반적으로 3.3㎡로 어림하지만 정확히는 3.3057㎡로 약간 큽니다. 한국 부동산에서 자주 쓰는 환산 — 84㎡ ≈ 25.4평, 59㎡ ≈ 17.85평. 더 자세한 아파트 평형 환산은 <a href="/tools/unit/area" style="color: var(--accent); text-decoration: underline">평수 변환기</a>를 활용하세요.',
              },
              {
                q: '한국 1리와 일본 1리가 다른가요?',
                a: '네, 매우 다릅니다. <strong>한국 1리 ≈ 393m</strong>, <strong>일본 1리 ≈ 3,927m</strong>로 약 10배 차이가 납니다. 한국·중국 1리는 동일하게 약 393m이지만 일본은 메이지 시대에 1리를 36정(약 3.9km)으로 재정의했습니다. 옛 문헌에서 거리를 해석할 때 출처(한국·중국·일본)를 확인해야 합니다.',
              },
              {
                q: 'KB와 KiB는 어떻게 다른가요?',
                a: '<strong>KB = 1,000바이트</strong> (SI 표준), <strong>KiB = 1,024바이트</strong> (이진 표준)입니다. 하드디스크·통신은 KB(1000)을 쓰고, OS(Windows·Mac)·메모리(RAM)는 KiB(1024)를 쓰는 경우가 많아 표시 차이가 발생합니다. 예: 1TB SSD를 사면 OS에서는 약 931GiB로 보입니다 (1,000⁴ ÷ 1,024⁴ ≈ 0.909).',
              },
              {
                q: '온도 변환 공식이 왜 다른 변환과 다른가요?',
                a: '온도는 <strong>비선형 변환</strong>이기 때문입니다. 길이·무게는 단순히 곱셈/나눗셈으로 변환되지만 온도는 <strong>0점이 다릅니다</strong> — 섭씨 0℃는 화씨 32℉, 켈빈 273.15K. 따라서 ℉ = ℃ × 9/5 + <strong>32</strong> 같은 덧셈 항이 필요합니다. 본 도구는 모든 온도 단위를 정확하게 처리합니다.',
              },
              {
                q: '소주잔 1잔, 종이컵 1잔은 정확히 몇 ml인가요?',
                a: '국내 표준에 가까운 어림값으로 — <strong>소주잔 ≈ 50ml</strong> (1샷, 보드카·위스키 샷잔과 동일), <strong>종이컵 ≈ 180ml</strong> (정수기·자판기 표준), <strong>한국 종이컵 큰 사이즈 ≈ 240ml</strong>(테이크아웃). 정확한 값은 제조사·용도별로 차이가 있어 본 도구의 값은 일반적인 어림값입니다.',
              },
              {
                q: 'mph와 km/h, 어느 게 더 빠르나요?',
                a: '같은 숫자라면 <strong>mph가 더 빠릅니다</strong>. 1마일 = 1.609km이므로 60mph = 96.56km/h입니다. 미국·영국은 mph, 한국·유럽·일본은 km/h를 씁니다. 자동차 속도계가 mph로 표시되어 있다면 약 1.6배 곱하면 km/h가 됩니다.',
              },
              {
                q: '근무시간 변환은 어떻게 계산되나요?',
                a: '한국 근로기준법 기준으로 <strong>주 40시간 = 월 209시간 = 연 2,508시간</strong>입니다 (주 40시간 + 주휴 8시간 = 주 48시간 × 4.345주 ≈ 209시간/월). 시급·연봉 환산은 <a href="/tools/finance/salary" style="color: var(--accent); text-decoration: underline">연봉 실수령액 계산기</a>의 [시급] 탭에서 야근·출퇴근 포함 체감 시급까지 계산할 수 있습니다.',
              },
              {
                q: 'kgf/cm²와 bar는 어떻게 다른가요?',
                a: '둘 다 압력 단위지만 정의가 다릅니다. <strong>1 kgf/cm² = 98,066.5 Pa ≈ 0.9807 bar ≈ 14.22 psi</strong>로 거의 같지만 약 2% 차이가 있어요. <strong>kgf/cm²</strong>는 한국·일본 산업·기계·공조 현장에서 가장 많이 쓰이고(예: 컴프레서·유압), <strong>bar</strong>는 유럽·자동차 타이어, <strong>psi</strong>는 미국 표준입니다. 정밀 계측·국제 도면에는 SI 표준인 <strong>Pa·MPa</strong>가 권장됩니다.',
              },
              {
                q: '토크 N·m와 kgf·m, lbf·ft 어떻게 변환하나요?',
                a: '<strong>1 kgf·m = 9.80665 N·m</strong>, <strong>1 lbf·ft = 1.35582 N·m</strong>입니다. 한국 정비 현장은 보통 <strong>kgf·m</strong>를, 미국 자동차 매뉴얼은 <strong>lbf·ft</strong>를 사용해요. 예: 휠너트 표준 토크 100 N·m = 약 10.2 kgf·m = 약 73.8 lbf·ft. 토크렌치 눈금 단위를 잘 확인하고 환산하세요. 정확한 체결 토크는 차량·기기 매뉴얼 우선입니다.',
              },
              {
                q: '에어컨 12,000 BTU는 몇 kW인가요?',
                a: 'BTU는 시간당 단위(BTU/h)로 표기되지만 본 도구는 에너지 변환이므로, <strong>12,000 BTU/h = 약 3.5 kW</strong> (= 3,517 W)로 환산됩니다. 한국에서 흔히 말하는 &quot;1RT(냉동톤)&quot;는 약 12,000 BTU/h ≈ 3.5 kW이며, 일반 가정 인버터 에어컨은 8,000~24,000 BTU/h(2.3~7 kW) 범위입니다. 자세한 평형 환산은 <a href="/tools/interior/ac-capacity" style="color: var(--accent); text-decoration: underline">에어컨 평형 계산기</a>를 활용하세요.',
              },
              {
                q: '식품 라벨의 &quot;Cal&quot;와 물리 cal는 같은가요?',
                a: '다릅니다. <strong>식품 영양 라벨의 &quot;Cal&quot; (대문자)는 사실 kcal</strong>입니다. 즉 &quot;라면 500Cal&quot;는 500kcal = 500,000cal = 약 2,092 kJ. 이는 19세기 영양학 관행으로 굳어진 표기로, 정식 SI 단위로는 <strong>kJ</strong>가 권장되지만 한국·미국·일본 모두 식품 라벨은 여전히 kcal(=Cal)를 사용합니다. 1kcal = 4.184 kJ.',
              },
              {
                q: 'Brix(°Bx)와 % 농도가 같은 건가요?',
                a: '<strong>수용액 가정에서는 거의 동일</strong>합니다. <strong>1°Bx = 100g 용액 중 1g 자당</strong>이므로 질량 분율 1% 와 같아요. 다만 °Bx는 <strong>굴절률</strong>로 측정하는 단위라 자당 외 다른 용질(과당·포도당)도 함께 측정되어 정확한 자당 농도와는 약간 차이가 있습니다. 잼·청·음료 레시피에서는 °Bx ≈ % 로 사용해도 무방합니다. 수치 환산: 1°Bx = 1% = 10 g/L = 10,000 ppm (밀도 1 가정).',
              },
              {
                q: '김치 절임에 적정 염도(소금 농도)는 얼마인가요?',
                a: '배추 절임은 일반적으로 <strong>7~10 염%</strong>(배추 무게의 7~10%만큼 소금)입니다. 예: 배추 1kg → 소금 70~100g. 시간은 6~8시간(여름은 4~6시간). 더 짠 농도(15~20%)는 <strong>장아찌·오이지</strong>처럼 장기 보관용입니다. 소금물 농도(g/L)로 환산하면 7염% ≈ 70 g/L (밀도 1 가정). 배추가 너무 안 절여지면 염도를 높이거나 시간을 늘리세요.',
              },
              {
                q: '잼·청을 만들 때 °Bx는 어떻게 정하나요?',
                a: '<strong>저당(14~18°Bx)</strong>은 과일 본래 맛을 살리지만 발효 위험 ↑ → <strong>냉장 1~2주</strong> 보관. <strong>일반(22~28°Bx)</strong>은 시판 잼 평균. <strong>보존용(50~65°Bx)</strong>은 풀당 시럽으로 실온 장기 보관 가능. 굴절계로 측정하면 정확하고, 굴절계 없으면 과일 무게의 50~80%만큼 설탕 첨가 후 농축하세요. 예: 딸기 1kg + 설탕 800g → 약 50°Bx 잼.',
              },
              {
                q: 'ppm·ppb·mg/L는 어떻게 다른가요?',
                a: '모두 미량 농도 단위지만 정의가 다릅니다.<br />• <strong>ppm</strong> = 백만분율 (10⁻⁶) — 1 mg / 1 kg 또는 1 mg / 1 L (수용액)<br />• <strong>ppb</strong> = 10억분율 (10⁻⁹) — ppm의 1/1,000<br />• <strong>mg/L</strong> = 부피 기준 — 수용액에서 ppm과 거의 같음 (밀도 1 g/mL)<br />환산: <strong>1% = 10,000 ppm = 10,000,000 ppb = 10 g/L = 10,000 mg/L</strong>. 수돗물 잔류염소(0.1~0.5 ppm), 환경 잔류농약(ppb 단위)에 자주 쓰입니다.',
              },
              {
                q: '락스 5%를 200ppm으로 희석하려면 어떻게?',
                a: '<strong>5% = 50,000 ppm</strong>이므로 <strong>50,000 / 200 = 250배 희석</strong>이 필요합니다. 즉 <strong>락스 1mL + 물 249mL</strong>(약 1:250). 식기 소독은 100~200 ppm, 표면 소독은 500~1,000 ppm, 코로나 방역은 1,000 ppm(0.1%)이 표준입니다. ⚠️ <strong>락스는 산성 세제·식초·구연산과 절대 섞지 마세요</strong> — 유독한 염소가스가 발생합니다. 환기·장갑·고글 착용 필수, 정확한 사용법은 제조사·식약처·질병청 가이드를 따르세요.',
              },
              {
                q: 'mol/L(몰농도)는 왜 변환기에 없나요?',
                a: '<strong>mol/L는 분자량(g/mol)이 필요</strong>해서 단순 변환기에 포함하지 않았습니다. 예: 1 mol/L NaCl = 58.44 g/L (NaCl 분자량 58.44), 1 mol/L 글루코스 = 180.16 g/L. 환산 공식은 <strong>g/L = mol/L × 분자량(g/mol)</strong>이며, 본 도구의 g/L 결과에 분자량을 나누면 mol/L가 됩니다. 예: 0.9% 생리식염수(NaCl) = 9 g/L = 9 / 58.44 ≈ 0.154 mol/L.',
              },
              {
                q: '5% 경사는 몇 도(°)인가요?',
                a: '<strong>약 2.86°</strong>입니다. 공식: <strong>각도 = atan(% / 100)</strong>. 즉 atan(0.05) × 180/π ≈ 2.86°. 일상적인 환산: <strong>1% ≈ 0.57°</strong>, <strong>5% ≈ 2.86°</strong>, <strong>10% ≈ 5.71°</strong>, <strong>15% ≈ 8.53°</strong>, <strong>30% ≈ 16.7°</strong>, <strong>45° = 100%</strong>(같음). 도로 표지판 5% 이상은 가속 주의, 10% 이상은 화물차 주의 표시가 자주 동반됩니다.',
              },
              {
                q: '1/100 구배가 뭔가요?',
                a: '<strong>수평 100m당 수직 1m 변화</strong>를 의미합니다 (1:100 비율). 즉 tan(각도) = 1/100 = 0.01 → 각도 ≈ 0.573°. <strong>%로는 1%</strong>와 같습니다. 한국 토목·하수도·철도에서 자주 쓰는 표기법이에요. 예: 하수관 1/100 구배는 1m 흐를 때 1cm 떨어지는 완만한 경사로 자연 흐름(중력)을 보장합니다. 철도 고속선은 1/40 (25‰), 일반선은 1/33 (30‰) 이하로 설계됩니다.',
              },
              {
                q: '한국 전통 물매(치/자)는 어떻게 계산하나요?',
                a: '<strong>물매 N치 = 1자(10치) 수평당 N치 수직</strong> 변화를 의미합니다. 한옥·기와 지붕에서 쓰는 표기로, tan(각도) = N/10. 예시: <strong>4치 물매</strong> = atan(4/10) ≈ <strong>21.8°</strong> (= 40% 경사) — 낮은 지붕. <strong>10치 물매</strong> = atan(10/10) = <strong>45°</strong> (= 100% 경사) — 가파른 지붕. 한옥은 보통 4~9치(약 22°~42°)가 일반적이며, 빗물 배수와 미관을 고려해 결정됩니다. 사찰 지붕은 더 가파르게(7~10치) 시공합니다.',
              },
              {
                q: '경사로(휠체어·접근성)는 어느 정도가 안전한가요?',
                a: '한국 KS 표준 및 「장애인·노인·임산부 등의 편의증진 보장에 관한 법률」 시행규칙에 따르면 <strong>경사로 1/12 (≈ 8.3% 경사 ≈ 4.76°) 이하</strong>가 권장됩니다. 짧은 구간(높이 0.75m 이하)은 1/8(12.5%)까지 허용. 휠체어 자력 이동을 위한 최선은 1/16(6.25%) 이하입니다. 가정용 임시 경사로는 1/8~1/12 범위에서 길이를 충분히 확보해야 안전합니다.',
              },
            ].map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 변환기',     desc: '아파트 평형·전용·공급면적' },
              { href: '/tools/unit/size',          icon: '🛍️', name: '사이즈 변환기', desc: '의류·신발 US·EU → 한국' },
              { href: '/tools/unit/battery',       icon: '🔋', name: '배터리 용량 변환기',     desc: 'mAh·Wh + 비행기 반입' },
              { href: '/tools/unit/fuel-economy',  icon: '⛽', name: '연비 변환기',       desc: 'km/L·L/100km·mpg' },
              { href: '/tools/unit/tire-pressure', icon: '🛞', name: '타이어 공기압 변환기',   desc: 'psi·kPa·bar + 차량별' },
              { href: '/tools/finance/salary',     icon: '💴', name: '연봉 실수령액 계산기',   desc: '시급·근무시간 환산' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
