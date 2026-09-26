import Link from 'next/link'
import ConverterClient from './ConverterClient'
import ConversionTableTabs from './ConversionTableTabs'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import { CATEGORIES, convert, convertAngle, formatNumber, type CategoryId } from './converterUtils'

export const metadata = buildMetadata({
  path: '/tools/unit/converter',
  title: '단위 변환기 — 길이·무게·부피·온도·압력·토크·에너지·당도·농도·기울기 14종',
  description:
    '길이·면적·무게·부피·온도부터 압력·토크·에너지·당도·농도·기울기까지 14종을 한 곳에서. 척·치·푼·자·평·정보·근·돈·홉·되 등 한국 전통 도량형도 함께 변환합니다.',
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

const FAQ_LD = [
              {
                q: '1근은 정확히 몇 g인가요?',
                a: '품목에 따라 다릅니다. <strong>고기 1근은 600g</strong>(16냥)이고, <strong>채소·과일 1근은 1관(3.75kg)의 1/10인 375g</strong>이라 시장에서는 보통 400g으로 어림합니다. 중국 1근은 500g이고, 대만은 600g입니다. 그래서 변환기에도 &lsquo;근(고기)&rsquo;과 &lsquo;근(채소·과일)&rsquo;을 따로 두었습니다. 옛 문헌·약재 단위로 1근을 해석할 때는 별도 확인이 필요합니다.',
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
                a: '<strong>KB = 1,000바이트</strong>(SI 접두어), <strong>KiB = 1,024바이트</strong>(IEC 이진 접두어)입니다. 저장장치 제조사와 통신 속도는 1,000 단위를 쓰는데, <strong>Windows</strong>는 1,024 단위로 계산하면서 표시는 &lsquo;GB&rsquo;로 해서 차이가 생깁니다. 예: 1TB SSD(1조 바이트)는 Windows에서 약 931GB로 보입니다(10¹² ÷ 1,024³ ≈ 931.3). 반면 <strong>macOS(10.6 이후)·iOS는 1,000 단위</strong>로 표시해 같은 SSD가 약 1TB로 보입니다. 메모리(RAM) 용량은 관행적으로 1,024 단위입니다.',
              },
              {
                q: '온도 변환 공식이 왜 다른 변환과 다른가요?',
                a: '길이·무게는 <strong>0이 같은 비례 관계</strong>라 계수 하나를 곱하면 되지만, 온도는 <strong>단위마다 0점이 다릅니다</strong> — 섭씨 0℃는 화씨 32℉, 켈빈 273.15K. 그래서 ℉ = ℃ × 9/5 + <strong>32</strong>처럼 곱셈 뒤에 덧셈 항이 붙는 1차식이 필요합니다(곡선이 아닌 직선이지만 원점을 지나지 않는 변환). 이 변환기는 입력을 먼저 섭씨로 바꾼 뒤 목표 단위로 다시 바꿉니다. 주의할 점은 <strong>온도 차이</strong>입니다 — &quot;10℃ 올랐다&quot;는 18℉ 오른 것이지 50℉가 아니므로, 온도차에는 덧셈 항 없이 9/5만 곱합니다.',
              },
              {
                q: '소주잔 1잔, 종이컵 1잔은 정확히 몇 ml인가요?',
                a: '국내 표준에 가까운 어림값으로 — <strong>소주잔 ≈ 50ml</strong> (가득 채운 1잔 어림), <strong>종이컵 ≈ 180ml</strong> (정수기·자판기 표준), <strong>한국 종이컵 큰 사이즈 ≈ 240ml</strong>(테이크아웃). 정확한 값은 제조사·용도별로 차이가 있어 본 도구의 값은 일반적인 어림값입니다.',
              },
              {
                q: 'mph와 km/h, 어느 게 더 빠르나요?',
                a: '같은 숫자라면 <strong>mph가 더 빠릅니다</strong>. 1마일 = 1.609km이므로 60mph = 96.56km/h입니다. 미국·영국은 mph, 한국·유럽·일본은 km/h를 씁니다. 자동차 속도계가 mph로 표시되어 있다면 약 1.6배 곱하면 km/h가 됩니다.',
              },
              {
                q: '근무시간 변환은 어떻게 계산되나요?',
                a: '한국 근로기준법(제50·55조)·고용노동부 최저임금 월 환산 기준으로 <strong>주 40시간 = 월 209시간 = 연 2,508시간</strong>입니다 (주 40시간 + 주휴 8시간 = 주 48시간 × 4.345주 ≈ 209시간/월). 시간 탭의 <strong>근무주(40시간)·근무월(209시간)·근무년(2,508시간)</strong> 단위가 이 기준으로 환산하므로, 근무시간 209를 넣으면 근무월 1이 나옵니다. 월(30일)·년(365일)은 달력 기준이라 결과가 다릅니다. 시급·연봉 환산은 <a href="/tools/finance/salary" style="color: var(--accent); text-decoration: underline">연봉 실수령액 계산기</a>의 \'체감 시급 보기\' 옵션에서 야근·출퇴근 포함 체감 시급까지 계산할 수 있습니다.',
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
                a: '먼저 <strong>에너지(kWh)와 전력(kW)을 구분</strong>해야 합니다. 본 변환기는 <strong>에너지량(BTU)</strong>을 환산하므로 12,000 BTU = 약 12.7 MJ = <strong>3.52 kWh</strong>로 표시됩니다. 반면 에어컨·냉동톤에서 말하는 &quot;12,000 BTU&quot;는 사실 <strong>시간당 값(BTU/h)</strong>인 냉방능력(전력)이라 <strong>3.52 kW</strong>(= 3,517 W)입니다. kWh(에너지)와 kW(전력)는 숫자만 같고 물리량이 다른데, 둘 다 3,600(초)으로 나누기 때문에 값이 일치합니다. 참고로 &quot;1RT(냉동톤)&quot; ≈ 12,000 BTU/h ≈ 3.5 kW이며, 가정용 인버터 에어컨은 8,000~24,000 BTU/h(2.3~7 kW) 범위입니다. 자세한 평형 환산은 <a href="/tools/interior/ac-capacity" style="color: var(--accent); text-decoration: underline">에어컨 평형 계산기</a>를 활용하세요.',
              },
              {
                q: '식품 라벨의 “Cal”과 물리 cal는 같은가요?',
                a: '다릅니다. <strong>식품 영양 라벨의 &quot;Cal&quot; (대문자)는 사실 kcal</strong>입니다. 즉 &quot;라면 500Cal&quot;는 500kcal = 500,000cal = 약 2,092 kJ. 이는 19세기 영양학 관행으로 굳어진 표기로, 정식 SI 단위로는 <strong>kJ</strong>가 권장되지만 한국·미국·일본 모두 식품 라벨은 여전히 kcal(=Cal)를 사용합니다. 1kcal = 4.184 kJ.',
              },
              {
                q: 'Brix(°Bx)와 % 농도가 같은 건가요?',
                a: '<strong>수용액 가정에서는 거의 동일</strong>합니다. <strong>1°Bx = 100g 용액 중 1g 자당</strong>이므로 질량 분율 1% 와 같아요. 다만 °Bx는 <strong>굴절률</strong>로 측정하는 단위라 자당 외 다른 용질(과당·포도당)도 함께 측정되어 정확한 자당 농도와는 약간 차이가 있습니다. 잼·청·음료 레시피에서는 °Bx ≈ % 로 사용해도 무방합니다. 수치 환산: 1°Bx = 1% = 10 g/L = 10,000 ppm (밀도 1 가정).',
              },
              {
                q: '김치 절임에 적정 염도(소금 농도)는 얼마인가요?',
                a: '먼저 숫자의 뜻을 구분해야 합니다. <strong>① 소금물에 담그는 방식</strong>은 소금물 자체의 농도(염%)를, <strong>② 배추에 소금을 뿌리는 방식</strong>은 <strong>배추 무게 대비 소금량</strong>을 말합니다. 흔히 쓰는 &lsquo;배추 무게의 7~10% 소금&rsquo;은 ②에 해당해 배추 1kg에 소금 70~100g이고, 시간은 6~8시간(여름은 4~6시간)이 일반적입니다. 이 변환기의 염%·g/L 환산은 <strong>①처럼 용액의 농도에만</strong> 맞습니다(물·소금 배합 계산은 본문 &lsquo;당도·염도 활용 가이드&rsquo; 참고). 10%는 밀도 1 가정 시 100 g/L로 환산되지만, 실제 10% 소금물은 밀도가 약 1.07이라 약 107 g/L입니다. 더 짠 절임물(대략 10~20%)은 장아찌·오이지처럼 오래 두는 절임에 쓰입니다.',
              },
              {
                q: '잼·청을 만들 때 °Bx는 어떻게 정하나요?',
                a: '<strong>실온 보관용은 65°Bx 이상</strong>이 기준입니다. 당 농도가 이만큼 높아야 미생물 증식이 억제되기 때문입니다(시판 잼은 60~68°Bx). 설탕을 줄인 <strong>저당 수제 잼·청</strong>은 과일 맛은 살지만 발효·곰팡이 위험이 커서 냉장 보관하고 빨리 먹는 것이 기본입니다. 굴절계로 측정하면 정확하고, 굴절계가 없으면 과일 무게의 50~80%만큼 설탕을 넣고 졸이세요. 예: 딸기 1kg(자체 당도 약 8°Bx 가정) + 설탕 800g은 끓이기 전 약 49°Bx이므로, 실온 보관용은 65°Bx 이상이 될 때까지 더 졸입니다.',
              },
              {
                q: 'ppm·ppb·mg/L는 어떻게 다른가요?',
                a: '모두 미량 농도 단위지만 정의가 다릅니다.<br />• <strong>ppm</strong> = 백만분율 (10⁻⁶) — 1 mg / 1 kg 또는 1 mg / 1 L (수용액)<br />• <strong>ppb</strong> = 10억분율 (10⁻⁹) — ppm의 1/1,000<br />• <strong>mg/L</strong> = 부피 기준 — 수용액에서 ppm과 거의 같음 (밀도 1 g/mL)<br />환산: <strong>1% = 10,000 ppm = 10,000,000 ppb = 10 g/L = 10,000 mg/L</strong>. 수돗물 잔류염소(0.1~0.5 ppm), 환경 잔류농약(ppb 단위)에 자주 쓰입니다.',
              },
              {
                q: '락스 5%를 200ppm으로 희석하려면 어떻게?',
                a: '<strong>5% = 50,000 ppm</strong>이므로 <strong>50,000 / 200 = 250배 희석</strong>이 필요합니다. 즉 <strong>락스 1mL + 물 249mL</strong>(약 1:250). 식기 소독은 100~200 ppm, 표면 소독은 500~1,000 ppm, 코로나 방역은 1,000 ppm(0.1%)이 표준입니다. <strong>락스는 산성 세제·식초·구연산과 절대 섞지 마세요</strong> — 유독한 염소가스가 발생합니다. 환기·장갑·고글 착용 필수, 정확한 사용법은 제조사·식약처·질병청 가이드를 따르세요.',
              },
              {
                q: 'mol/L(몰농도)는 왜 변환기에 없나요?',
                a: '<strong>mol/L는 분자량(g/mol)이 필요</strong>해서 단순 변환기에 포함하지 않았습니다. 예: 1 mol/L NaCl = 58.44 g/L (NaCl 분자량 58.44), 1 mol/L 글루코스 = 180.16 g/L. 환산 공식은 <strong>g/L = mol/L × 분자량(g/mol)</strong>이며, 본 도구의 g/L 결과에 분자량을 나누면 mol/L가 됩니다. 예: 0.9% 생리식염수(NaCl) = 9 g/L = 9 / 58.44 ≈ 0.154 mol/L.',
              },
              {
                q: '5% 경사는 몇 도(°)인가요?',
                a: '<strong>약 2.86°</strong>입니다. 공식: <strong>각도 = atan(% / 100)</strong>. 즉 atan(0.05) × 180/π ≈ 2.86°. 일상적인 환산: <strong>1% ≈ 0.57°</strong>, <strong>5% ≈ 2.86°</strong>, <strong>10% ≈ 5.71°</strong>, <strong>15% ≈ 8.53°</strong>, <strong>30% ≈ 16.7°</strong>, <strong>45° = 100%</strong>(같음). 작은 각도에서는 tan θ ≈ θ라서 <strong>% ≈ 각도 × 1.75</strong>로 어림할 수 있지만(5% → 약 2.9°), 경사가 커질수록 어긋나 45°에서는 100%가 됩니다.',
              },
              {
                q: '1/100 구배가 뭔가요?',
                a: '<strong>수평 100m당 수직 1m 변화</strong>를 의미합니다 (1:100 비율). 즉 tan(각도) = 1/100 = 0.01 → 각도 ≈ 0.573°. <strong>%로는 1%</strong>와 같습니다. 한국 토목·하수도에서 자주 쓰는 표기법이에요. 예: 하수관 1/100 구배는 1m 흐를 때 1cm 떨어지는 완만한 경사로 자연 흐름(중력)을 만듭니다. 철도는 같은 기울기를 <strong>‰(퍼밀)</strong>로 적어 1/40 = 25‰ ≈ 1.43°처럼 표기하며, 노선별 최대 기울기는 설계속도·열차 종류에 따라 따로 정해집니다.',
              },
              {
                q: '한국 전통 물매(치/자)는 어떻게 계산하나요?',
                a: '<strong>물매 N치 = 1자(10치) 수평당 N치 수직</strong> 변화를 의미합니다. 한옥·기와 지붕에서 쓰는 표기로, tan(각도) = N/10. 예시: <strong>4치 물매</strong> = atan(4/10) ≈ <strong>21.8°</strong> (= 40% 경사) — 낮은 지붕. <strong>10치 물매</strong> = atan(10/10) = <strong>45°</strong> (= 100% 경사) — 가파른 지붕. 실제 물매는 지붕 재료·건물 규모·빗물 배수를 고려해 정하므로 시공은 도면 표기를 기준으로 하세요. 변환기에서 물매를 입력하면 각도·%·1/n으로 바로 바꿔 볼 수 있습니다.',
              },
              {
                q: '경사로(휠체어·접근성)는 어느 정도가 안전한가요?',
                a: '「장애인·노인·임산부 등의 편의증진 보장에 관한 법률」 시행규칙 [별표 1]에 따라 <strong>경사로 기울기는 1/12 (≈ 8.3% 경사 ≈ 4.76°) 이하</strong>가 의무 기준입니다. 1/8(12.5%)까지 완화되는 것은 <strong>신축이 아닌 기존시설</strong>이면서 <strong>높이 1m 이하</strong>로 1/12 설치가 곤란하고 <strong>상시 보조서비스</strong>를 제공하는 경우뿐이며, 세 요건을 모두 갖춰야 합니다. 또 바닥면에서 높이 0.75m 이내마다 1.5m×1.5m 이상의 수평 휴식참을 두어야 합니다. 기울기가 완만할수록 휠체어 자력 이동이 쉬우므로 가정용 이동식 경사로도 가능하면 1/12 이하가 되도록 길이를 확보하는 편이 안전합니다. 예: 높이 15cm 문턱이면 1/12 기준 수평 길이 1.8m(0.15 × 12)가 필요합니다.',
              },
            ]

/* ─── 가이드 예시·표 — 변환기와 같은 계수·함수(converterUtils)로 빌드 시 계산 ─── */
const unitOf = (cat: CategoryId, id: string) => {
  const u = CATEGORIES.find(c => c.id === cat)?.units.find(x => x.id === id)
  if (!u) throw new Error(`unit not found: ${cat}/${id}`)
  return u
}
const calc = (v: number, cat: CategoryId, from: string, to: string) => convert(v, unitOf(cat, from), unitOf(cat, to), cat)

const METHOD_ROWS: { input: string; result: string; how: string }[] = [
  { input: '100 cm → 인치', result: `${formatNumber(calc(100, 'length', 'cm', 'inch'))} in`, how: '100 × 0.01 m ÷ 0.0254 m' },
  { input: '84 ㎡ → 평', result: `${formatNumber(calc(84, 'area', 'sqm', 'pyeong'))} 평`, how: '84 ÷ 3.305785 (= 400/121)' },
  { input: '1 kgf/cm² → psi', result: `${formatNumber(calc(1, 'pressure', 'kgfcm2', 'psi'))} psi`, how: '98,066.5 Pa ÷ 6,894.76 Pa' },
  { input: '1 TB → GiB', result: `${formatNumber(calc(1, 'data', 'TB', 'GiB'))} GiB`, how: '10¹² B ÷ 1,024³ B' },
  { input: '98.6 ℉ → ℃', result: `${formatNumber(calc(98.6, 'temperature', 'F', 'C'))} ℃`, how: '(98.6 − 32) × 5/9 — 덧셈 항이 있는 1차식' },
  { input: '5 % 경사 → 도', result: `${formatNumber(calc(5, 'angle', 'percent_slope', 'deg'))}°`, how: 'atan(5 ÷ 100) × 180/π — tan 기반 비선형' },
]

/** 분야별 기울기 — 표기값을 도·%로 계산 (convertAngle) */
const SLOPE_ROWS: { f: string; label: string; from: string; v: number[] }[] = [
  { f: '도로 경사 (완만)',        label: '5%',          from: 'percent_slope', v: [5] },
  { f: '도로 경사 (가파름)',      label: '10%',         from: 'percent_slope', v: [10] },
  { f: '도로 경사 (매우 가파름)', label: '15%',         from: 'percent_slope', v: [15] },
  { f: '철도 급구배 예',          label: '25‰ (= 1/40)', from: 'permil_slope', v: [25] },
  { f: '하수관 자연 흐름 예',     label: '1/100 ~ 1/50', from: 'one_over_n',   v: [100, 50] },
  { f: '휠체어 경사로 (법정 상한)', label: '1/12',       from: 'one_over_n',   v: [12] },
  { f: '주택 계단 예',            label: '30° ~ 38°',   from: 'deg',           v: [30, 38] },
  { f: '한옥 지붕 물매 (낮음)',   label: '4~6치',       from: 'mulae',         v: [4, 6] },
  { f: '한옥 지붕 물매 (보통)',   label: '7~9치',       from: 'mulae',         v: [7, 9] },
  { f: '한옥 지붕 물매 (가파름)', label: '10치 = 1자',  from: 'mulae',         v: [10] },
]
const slopeCell = (vs: number[], from: string, to: string, digits: number) =>
  vs.map(v => convertAngle(v, from, to).toFixed(digits)).join(' ~ ')

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }
const tdL: React.CSSProperties = { padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }
const tdV: React.CSSProperties = { padding: '9px 12px', color: 'var(--cat-unit-ink)', fontFamily: 'var(--font-sans)', fontWeight: 800 }
const tdN: React.CSSProperties = { padding: '9px 12px', color: 'var(--muted)' }
const rowStyle = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

export default function ConverterPage() {
  return (
    <ToolPage width={760} slug="/tools/unit/converter">
      <h1 className="tp-h1">
        <ToolIconBadge catId="unit" />단위 변환기
      </h1>
      <p className="tp-lead">
        길이·면적·무게·부피·온도부터 압력·토크·당도·농도·기울기까지 <strong style={{ color: 'var(--text)' }}>14가지 분야</strong>를 한 곳에서.
        <strong style={{ color: 'var(--text)' }}> 척·치·푼·평·정보·근·돈·홉·되</strong> 같은 한국 전통 도량형도 함께 변환할 수 있어요.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="단위 환산 계수는 KS·ISO·국제단위계(SI) 기준. 근무시간·경사로·소독 농도 등 법정·안전 수치는 아래 공식 출처 기준으로 정기 검토합니다."
        sources={[
          { label: '국가법령정보센터', href: 'https://www.law.go.kr' },
          { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' },
          { label: '질병관리청', href: 'https://www.kdca.go.kr' },
          { label: 'NIST SP 811 — 단위 환산 계수', href: 'https://www.nist.gov/pml/special-publication-811' },
          { label: 'BIPM SI 브로슈어', href: 'https://www.bipm.org/en/publications/si-brochure' },
          { label: 'NIST — 이진 접두어(KiB·MiB)', href: 'https://physics.nist.gov/cuu/Units/binary.html' },
          { label: '계량에 관한 법률', href: 'https://www.law.go.kr/법령/계량에관한법률' },
        ]}
      />

      <ConverterClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 자주 쓰는 변환 표 — 분야별 서브탭 */}
        <section>
          <h2 className="g-h2">자주 쓰는 변환</h2>
          <ConversionTableTabs />
        </section>

        {/* 계산 방식 */}
        <section>
          <h2 className="g-h2">계산 방식과 정밀도</h2>
          <p className="g-p">
            대부분의 분야는 <strong>기준 단위를 거쳐 한 번 곱하고 한 번 나눕니다</strong>. 길이는 m, 무게는 g, 압력은 Pa처럼 분야마다 기준 단위를 하나 정하고, 각 단위가 기준 단위의 몇 배인지(환산 계수)를 저장해 둔 뒤 <strong>결과 = 입력 × 입력 단위 계수 ÷ 출력 단위 계수</strong>로 계산합니다. 예외는 두 가지입니다. 온도는 0점이 달라 섭씨를 거치는 1차식으로, 각도·기울기는 tan 함수를 거치는 비선형 식으로 따로 계산합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['입력', '변환기 결과', '계산 과정'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {METHOD_ROWS.map((r, i) => (
                  <tr key={r.input} style={rowStyle(i)}>
                    <td style={tdL}>{r.input}</td>
                    <td style={tdV}>{r.result}</td>
                    <td style={tdN}>{r.how}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            결과는 유효숫자 8자리로 정리해 부동소수 오차(0.30000000000000004 같은 꼬리)를 지우고, 크기에 따라 소수 2~6자리까지 표시합니다. 인치(0.0254 m)·피트·마일·kgf(9.80665 N)·bar처럼 <strong>국제 협약으로 정확히 정의된 계수</strong>는 그대로 쓰지만, psi(정의값 6,894.757…)·에이커(정의값 4,046.856 422 4)·BTU(정의값 1,055.055 852 62)처럼 자릿수가 긴 계수는 변환기에 6자리(6,894.76 · 4,046.86 · 1,055.06)로 줄여 넣어, 결과의 6~7번째 유효숫자에서 미세한 차이가 날 수 있습니다(예: 1 BTU는 1,055.06 J로 표시되지만 정의값은 1,055.0559 J). 일상·실무 환산에는 영향이 없지만 계량 교정이나 법정 거래 수치는 원 규격의 정의값을 확인하세요.
          </p>
        </section>

        {/* 한국 전통 단위 가이드 */}
        <section>
          <h2 className="g-h2">한국 전통·생활 단위 가이드</h2>
          <p className="g-p">
            본 도구는 한국에서 일상적으로 쓰이는 전통·생활 단위를 모두 지원합니다. 시대·지역·용도에 따라 차이가 있어 주의가 필요한 단위도 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { name: '길이', items: ['푼(分) ≈ 3.03mm', '치/촌(寸) ≈ 3.03cm', '자/척(尺) ≈ 30.3cm', '보(步)·간(間) ≈ 1.82m', '정(町) ≈ 109m', '리(里) ≈ 393m (한국)'] },
              { name: '면적', items: ['평(坪) = 400/121 ㎡ ≈ 3.306㎡', '단보(段步) ≈ 991㎡ (300평)', '정보(町步) ≈ 9,917㎡ (3,000평)', '마지기 ≈ 661㎡ (200평·지역차 큼)'] },
              { name: '무게', items: ['돈(錢) = 3.75g (귀금속)', '냥(兩) = 37.5g', '근(斤) = 고기 600g · 채소·과일 375g', '관(貫) = 3.75kg'] },
              { name: '부피', items: ['홉(合) = 180ml', '되(升) = 1.8L', '말(斗) = 18L', '컵 = 200ml (한국 표준)', '소주잔 ≈ 50ml · 종이컵 ≈ 180ml'] },
            ].map((c) => (
              <div key={c.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--cat-unit-ink)', marginBottom: '6px' }}>{c.name}</p>
                <ul style={{ paddingLeft: 0, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
                  {c.items.map((it) => <li key={it}>· {it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            전통 단위는 <strong>생활 속 어림 단위</strong>로만 남아 있습니다. 2007년 7월부터 상거래에서 평·돈 같은 비법정 단위 대신 ㎡·g 같은 법정 단위를 쓰도록 단속이 시작됐고, 지금은 「계량에 관한 법률」이 법정 단위 사용을 정하고 있습니다. 아파트 분양 공고가 &lsquo;84㎡&rsquo;로, 금 시세표가 &lsquo;3.75g&rsquo;으로 적히는 이유입니다. 계약서·등기 등 공식 문서의 면적은 반드시 ㎡ 값을 기준으로 확인하세요.
          </p>
          <Callout tone="note" title="1근 주의">
            정육점에서 쓰는 고기 1근은 600g이지만, 채소·과일 1근은 1관의 1/10인 375g이라 시장에서는 400g 정도로 어림합니다. 중국 1근은 500g이므로 중국 레시피를 볼 때도 구분해야 합니다.
          </Callout>
        </section>

        {/* 카테고리별 가이드 */}
        <section>
          <h2 className="g-h2">14개 카테고리 가이드</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '📏', name: '길이', desc: 'mm·cm·m·km / inch·ft·yard·mile / 푼·치·자(척)·보·간·정·리(한국)' },
              { icon: '🏠', name: '면적', desc: '㎡·a·ha·km² / ft²·yd²·acre / 평·단보·정보·마지기(한국)' },
              { icon: '⚖️', name: '무게', desc: 'mg·g·kg·ton / oz·lb / 돈·냥·근·관(한국)' },
              { icon: '🧴', name: '부피', desc: 'ml·L / fl oz·gallon(US) / 큰술·작은술·컵 / 홉·되·말·섬(전통) / 소주잔·종이컵·밥숟가락(생활)' },
              { icon: '🌡️', name: '온도', desc: '섭씨(℃)·화씨(℉)·켈빈(K)·랭킨(°R) — 0점이 달라 곱셈 대신 1차식(× 9/5 + 32 등)으로 별도 처리' },
              { icon: '⏱️', name: '시간', desc: 'ms·s·min·h·day·week·month·year + 근무주(40h)·근무월(209h)·근무년(2,508h)' },
              { icon: '🚗', name: '속도', desc: 'm/s·km/h·mph·knot·ft/s' },
              { icon: '💨', name: '압력', desc: 'Pa·kPa·MPa·bar·psi·atm·mmHg·kgf/cm²(한국 산업)·hPa(기상)·inHg·Torr — 타이어·혈압·기상·산업' },
              { icon: '🔧', name: '토크', desc: 'N·m·kN·m·N·cm / kgf·m(한국)·kgf·cm / lbf·ft(미국)·lbf·in·ozf·in / dyn·cm — 자동차·정비 매뉴얼 환산' },
              { icon: '⚡', name: '에너지', desc: 'J·kJ·MJ / cal·kcal(식품) / Wh·kWh·MWh(전기) / BTU(에어컨·보일러) / ft·lb·erg·eV / TNT 등가' },
              { icon: '💾', name: '데이터', desc: 'bit·byte·KB·MB·GB·TB (1000) + KiB·MiB·GiB(1024)' },
              { icon: '🍯', name: '당도·염도', desc: 'Brix(°Bx)·% 질량분율·g/100g·g/L·ppm·염도 %·소금물 g/L — 잼·청·김치 절임·장아찌·음료·시럽 레시피' },
              { icon: '🧪', name: '농도', desc: '%·‰·ppm·ppb·mg/L·µg/L·g/L — 소독액 희석·수질·비료·화학 실험·환경 분석. mol/L은 분자량 별도 필요' },
              { icon: '📐', name: '각도·기울기', desc: '도(°)·라디안·그라디안 / % 경사·‰ 구배·1/n 구배·N:1 비율 / 한국 물매(치/자) — tan 기반 비선형 변환. 도로·철도·하수관·지붕·비탈면' },
            ].map((c) => (
              <div key={c.name} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{c.icon} {c.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 당도·염도 활용 가이드 */}
        <section>
          <h2 className="g-h2">당도·염도 활용 가이드</h2>
          <p className="g-p">
            <strong>Brix(°Bx)</strong>는 100g 용액에 녹은 자당(설탕)의 그램 수로, 굴절계로 측정하는 표준 당도 단위입니다.
            염도(salinity)는 소금물 100g에 녹은 소금의 그램 수로, Brix와 같은 질량 % 단위지만 측정 대상이 다릅니다. 두 단위 모두 <strong>용액 전체 무게</strong>가 분모라서, 10% 소금물은 물 900g + 소금 100g이지 물 1kg + 소금 100g이 아닙니다.
          </p>
          <div className="tableScroll" style={{ marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['활용', '표준 농도', '비고'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['잼·청 (저당 수제)',            '65 °Bx 미만',        '당도가 낮을수록 발효·곰팡이 위험 ↑ · 냉장 보관, 빨리 소비'],
                  ['잼·청 (보존용)',               '65~68 °Bx',          '시판 잼은 60~68 °Bx · 개봉 후 냉장'],
                  ['김치 절임 (소금 뿌리기)',      '배추 무게의 7~10%',   '소금 ÷ 배추 무게 — 용액 농도가 아님 · 6~8시간'],
                  ['장아찌·오이지 절임물',         '약 10~20 염%',        '레시피별 차이 큼 · 짤수록 오래 둘 수 있음'],
                  ['시럽 (음료용)',                '50~67 °Bx',          '설탕:물 1:1 = 50 °Bx · 2:1 ≈ 67 °Bx'],
                  ['탄산음료',                     '8~12 °Bx',           '콜라 약 11°Bx · 스프라이트 약 10°Bx'],
                  ['해수',                         '약 35 ‰ (3.5%)',     '평균 해양 염분 농도'],
                ].map((row, i) => (
                  <tr key={row[0]} style={rowStyle(i)}>
                    <td style={tdL}>{row[0]}</td>
                    <td style={tdV}>{row[1]}</td>
                    <td style={tdN}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="측정 도구">
            굴절계(refractometer)로 °Bx를 직접 잴 수 있고, 염도계는 전기전도도로 염도(‰·%)를 표시합니다. 굴절계는 설탕 외의 녹은 성분도 함께 읽으므로 소금물·소스에 쓸 때는 &lsquo;자당 환산값&rsquo;이라는 점을 감안하세요.
          </Callout>
        </section>

        {/* 농도 활용 가이드 */}
        <section>
          <h2 className="g-h2">농도 활용 가이드 — 소독액·수질·비료</h2>
          <p className="g-p">
            농도 단위는 서로 정해진 배수 관계입니다. <strong>1% = 10,000 ppm = 10,000,000 ppb = 10 g/L = 10,000 mg/L</strong>(수용액 가정).
            mg/L와 ppm은 물처럼 밀도가 1에 가까운 묽은 용액에서 거의 같으며, ppb는 ppm의 1/1,000입니다. 희석 배수는 두 농도를 같은 단위(ppm 등)로 맞춘 뒤 <strong>원액 농도 ÷ 목표 농도</strong>로 구하며, N배 희석은 원액 1에 물 N−1을 더해 전체를 N으로 만든다는 뜻입니다(락스 예시는 아래 FAQ 참고).
          </p>
          <div className="tableScroll" style={{ marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['용도', '권장 농도', '희석 예시·비고'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ['수돗물 잔류염소',            '보통 0.1~0.5 ppm',     '급수전 최소 0.1 mg/L · 먹는물 기준 4 mg/L 이하'],
                  ['식기 소독 (락스)',           '100~200 ppm',          '5% 락스 1mL + 물 약 250~500mL'],
                  ['표면 소독 (락스)',           '500~1,000 ppm',        '5% 락스 1mL + 물 약 50~100mL'],
                  ['감염병 환경 소독 (락스)',    '1,000 ppm (0.1%)',     '5% 락스 1:50 희석 (1mL : 49mL)'],
                  ['양액(비료물) 전기전도도',    'EC 1.5~3.0 mS/cm',     '측정기 환산계수(0.5~0.7)에 따라 약 750~2,100 ppm · 작물별 차이'],
                  ['수족관 암모니아',            '0 ppm 목표',           '유지 농도가 아니라 제거 대상 — 검출되면 부분 환수'],
                  ['환경 잔류농약',              'ppb 단위 (µg/L)',      'ppm의 1/1,000 단위'],
                ].map((row, i) => (
                  <tr key={row[0]} style={rowStyle(i)}>
                    <td style={tdL}>{row[0]}</td>
                    <td style={tdV}>{row[1]}</td>
                    <td style={tdN}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            EC(전기전도도)를 ppm으로 바꾸는 계수는 측정기 제조사마다 0.5(NaCl 기준)·0.64·0.7 등으로 달라, 같은 물이라도 기기마다 ppm 표시가 다릅니다. 양액 관리는 EC 값 자체로 비교하는 편이 정확합니다.
          </p>
          <Callout tone="warn" title="약품·소독액 안전 안내">
            <ul>
              <li>락스(차아염소산나트륨)·과산화수소·산성 세제는 저농도라도 피부·호흡기·눈을 자극합니다. 사용 시 환기·장갑·고글 착용 필수.</li>
              <li><strong>산성 세제 + 염소계 표백제 절대 혼합 금지</strong> — 유독한 염소 가스(Cl₂)가 발생합니다. 락스 + 식초·구연산·변기세정제 혼합 사고가 자주 보고됩니다.</li>
              <li>정확한 사용 농도·반응 시간·헹굼 방법은 <strong>제조사 라벨</strong> 또는 <strong>식품의약품안전처·질병관리청</strong> 가이드를 따르세요.</li>
              <li>본 도구는 일반 환산만 제공하며, 의료·전문 화학 실험에는 보정된 기기와 표준 시약을 사용해야 합니다.</li>
            </ul>
          </Callout>
        </section>

        {/* 각도·기울기 활용 가이드 */}
        <section>
          <h2 className="g-h2">각도·기울기 활용 가이드</h2>
          <p className="g-p">
            기울기는 분야마다 표기가 다릅니다. 수학·물리는 <strong>도(°)</strong>·<strong>라디안</strong>, 도로는 <strong>%</strong>, 철도·하수는 <strong>1/n 구배</strong> 또는 <strong>‰</strong>, 한옥 지붕은 <strong>물매(치/자)</strong>를 씁니다.
            모두 <strong>tan(각도)</strong> 한 함수로 환산됩니다. 아래 각도·% 열은 변환기와 같은 함수로 계산한 값입니다.
          </p>
          <div className="tableScroll" style={{ marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['분야', '표기', '각도 (°)', '% 경사'].map(h => <th scope="col" key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {SLOPE_ROWS.map((r, i) => (
                  <tr key={r.f} style={rowStyle(i)}>
                    <td style={tdL}>{r.f}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{r.label}</td>
                    <td style={tdV}>{slopeCell(r.v, r.from, 'deg', 2)}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{slopeCell(r.v, r.from, 'percent_slope', 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="핵심 공식">
            % 경사 = tan(각도) × 100, 각도 = atan(% ÷ 100). 1/n 구배의 n = 1 ÷ tan(각도). 한국 물매 N치 = 10 × tan(각도). 작은 각도에서는 %와 각도가 거의 비례하지만 가팔라질수록 어긋나, 45°에서 100%(= 1/1 = 10치)가 되고 90°(수직)에서는 무한대가 됩니다.
          </Callout>
        </section>

        {/* FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/unit/area',          icon: '🏠', name: '평수 변환기',     desc: '아파트 평형·전용·공급면적' },
              { href: '/tools/unit/size',          icon: '🛍️', name: '사이즈 변환기', desc: '의류·신발 US·EU → 한국' },
              { href: '/tools/unit/battery',       icon: '🔋', name: '배터리 용량 변환기',     desc: 'mAh·Wh + 비행기 반입' },
              { href: '/tools/unit/fuel-economy',  icon: '⛽', name: '연비 변환기',       desc: 'km/L·L/100km·mpg' },
              { href: '/tools/unit/tire-pressure', icon: '🛞', name: '타이어 공기압 변환기',   desc: 'psi·kPa·bar + 차량별' },
              { href: '/tools/finance/salary',     icon: '💰', name: '연봉 실수령액 계산기',   desc: '시급·근무시간 환산' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '14px 16px', textDecoration: 'none',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
