/* 상황별 가이드 — 콘텐츠 크리에이터. BPM→프레임은 delayUtils(60000 ÷ BPM), 글자 대비는 colorUtils.contrastRatio(WCAG 식),
   인쇄 픽셀은 printData(PRINT_SIZES·MM_PER_INCH), 플랫폼 글자 수는 charcountUtils로 빌드 시 계산 */
import Link from 'next/link'
import Callout from '@/components/Callout'
import DataFigure from '@/components/DataFigure'
import { rawDelay } from '@/app/tools/art/tap-tempo/delayUtils'
import { contrastRatio } from '@/app/tools/art/color/colorUtils'
import { MM_PER_INCH, PRINT_SIZES } from '@/app/tools/art/print-resolution/printData'
import { PLATFORM_GROUPS, TWITTER_CONFIG } from '@/app/tools/art/charcount/charcountUtils'
import { GuideSources, num, type CollectionGuide } from './shared'

const BPMS = [90, 120, 128]
const FPS = [24, 30, 60]
const PRINTS: { id: string; dpi: number }[] = [
  { id: 'p4x6', dpi: 300 },
  { id: 'a4', dpi: 300 },
  { id: 'a2', dpi: 150 },
]
/** 썸네일 글자 대비 예시 — 선명한 노랑 배경(RGB 255·212·0) 위 흰 글자 vs 검은 글자 */
const YELLOW = { r: 255, g: 212, b: 0 }

function Body() {
  const frames = BPMS.map((bpm) => ({ bpm, ms: rawDelay(bpm, 1), f: FPS.map((fps) => (fps * rawDelay(bpm, 1)) / 1000) }))
  const prints = PRINTS.map((p) => {
    const s = PRINT_SIZES.find((x) => x.id === p.id)
    return s ? { ...p, name: s.name, w: Math.round((s.w / MM_PER_INCH) * p.dpi), h: Math.round((s.h / MM_PER_INCH) * p.dpi) } : null
  }).filter((x): x is NonNullable<typeof x> => Boolean(x))
  const a4 = prints.find((p) => p.id === 'a4')
  const a2 = prints.find((p) => p.id === 'a2')
  const white = contrastRatio({ r: 255, g: 255, b: 255 }, YELLOW)
  const black = contrastRatio({ r: 0, g: 0, b: 0 }, YELLOW)
  const items = PLATFORM_GROUPS.flatMap((g) => g.items)
  const ytTitle = items.find((i) => i.name === '유튜브 제목')
  const ytDesc = items.find((i) => i.name === '유튜브 설명')
  const xWeightedKo = TWITTER_CONFIG.maxWeightedTweetLength / (TWITTER_CONFIG.defaultWeight / TWITTER_CONFIG.scale)

  return (
    <>
      <h2>왜 편집 → 썸네일 → 제목·배포 순서인가</h2>
      <p>
        썸네일은 완성된 영상에서 가장 좋은 장면을 골라 만드는 경우가 많고, 제목과 설명은 썸네일과 겹치지 않는 정보를 담아야 합니다. 그래서 편집이 먼저 끝나야 썸네일을, 썸네일이 정해져야 제목을 쓸 수 있습니다.
        마지막으로 <Link href="/tools/dev/og-preview">공유 카드 미리보기</Link>로 링크를 붙였을 때 보일 모습을 확인하면 배포 전 점검이 끝납니다.
      </p>
      <p>
        편집 단계에서 박자에 맞춰 컷을 넘기려면 BPM을 프레임 수로 바꿔 두면 편합니다. <Link href="/tools/art/tap-tempo">탭 템포</Link>로 음악의 BPM을 재면 한 박의 길이는 60,000 ÷ BPM(밀리초)이고,
        여기에 프레임레이트를 곱하면 한 박이 몇 프레임인지 나옵니다.
      </p>
      <DataFigure n={1} title="BPM별 한 박의 길이와 프레임 수" source={<>계산: 한 박(ms) = 60,000 ÷ BPM — 탭 템포 딜레이 계산과 같은 식, 프레임 = 한 박(초) × fps</>}>
        <table>
          <thead>
            <tr><th scope="col" className="r">BPM</th><th scope="col" className="r">한 박</th>{FPS.map((f) => <th key={f} scope="col" className="r">{f}fps</th>)}</tr>
          </thead>
          <tbody>
            {frames.map((r) => (
              <tr key={r.bpm}>
                <td className="r">{r.bpm}</td>
                <td className="r">{num(r.ms)}ms</td>
                {r.f.map((v, i) => <td key={FPS[i]} className="r">{num(v, 1)}프레임</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </DataFigure>
      <p>
        프레임 수가 정수로 떨어지지 않는 조합(예: {BPMS[2]}BPM·{FPS[0]}fps)은 컷을 박자에 정확히 맞출 수 없어 몇 박마다 한 프레임씩 밀립니다. 그럴 때는 몇 박 단위로 컷 위치를 다시 맞추면 어긋남이 쌓이지 않습니다.
      </p>

      <h2>썸네일과 출력물에서 확인할 숫자</h2>
      <p>
        썸네일 글자는 작은 화면에서 읽혀야 합니다. <Link href="/tools/art/color">색상 코드 변환기</Link>의 대비 계산으로 보면 선명한 노랑 배경에 흰 글자는 대비가 {num(white, 1)}:1에 그치지만 검은 글자는 {num(black, 1)}:1입니다.
        웹 접근성 기준(WCAG)이 본문 글자에 요구하는 최소 대비는 4.5:1이므로, 배경색을 먼저 정하고 글자색은 대비로 고르는 편이 안전합니다. 굿즈나 포스터로 출력할 계획이라면 <Link href="/tools/art/print-resolution">인쇄 해상도 계산기</Link>로 필요한 픽셀 수를 먼저 확인하세요.
      </p>
      <DataFigure n={2} title="출력 크기별 필요한 픽셀 수" source={<>계산: 픽셀 = 크기(mm) ÷ {MM_PER_INCH} × DPI — 인쇄 해상도 계산기와 같은 식</>}>
        <table>
          <thead>
            <tr><th scope="col">크기</th><th scope="col" className="r">DPI</th><th scope="col" className="r">필요 픽셀</th></tr>
          </thead>
          <tbody>
            {prints.map((p) => (
              <tr key={p.id}><td>{p.name}</td><td className="r">{p.dpi}</td><td className="r">{num(p.w)}×{num(p.h)}</td></tr>
            ))}
          </tbody>
        </table>
      </DataFigure>

      <h2>자주 하는 실수</h2>
      <ul>
        <li><strong>한글 글자 수를 영문 기준으로 세기.</strong> X는 가중치로 세서 한글 1자를 2로 계산하므로 한도 {TWITTER_CONFIG.maxWeightedTweetLength}은 한글로 약 {num(xWeightedKo)}자입니다. 링크는 길이와 관계없이 {TWITTER_CONFIG.transformedURLLength}자로 셉니다.</li>
        <li><strong>제목 한도를 끝까지 채우기.</strong> 유튜브 제목은 {ytTitle?.limit ?? 100}자, 설명은 {num(ytDesc?.limit ?? 5000)}자까지 쓸 수 있지만, 검색 결과·추천 화면에서는 앞부분만 보입니다. 핵심 단어를 앞에 두고 <Link href="/tools/art/charcount">글자 수 세기</Link>로 길이를 확인하세요.</li>
        <li><strong>웹용 이미지를 그대로 인쇄하기.</strong> 화면에서 선명한 이미지도 인쇄하면 흐릴 수 있습니다. {a4 ? `위 표처럼 A4를 ${a4.dpi}DPI로 뽑으려면 긴 변이 ${num(Math.max(a4.w, a4.h))}픽셀이어야 합니다.` : ''}
          {a4 && a2 && a4.w === a2.w && a4.h === a2.h ? ` 같은 이미지로 A2 포스터를 멀리서 볼 용도(${a2.dpi}DPI)로는 뽑을 수 있다는 뜻이기도 합니다.` : ''}</li>
        <li><strong>공유 카드를 확인하지 않고 링크 올리기.</strong> og:image가 없거나 비율이 맞지 않으면 메신저에 잘린 이미지가 뜹니다. 게시 전에 미리보기로 제목·설명·이미지를 확인하세요.</li>
      </ul>

      <Callout tone="note" title="저작권과 플랫폼 정책">
        배경음악·폰트·이미지는 사용 범위(상업적 이용, 수정 허용 등)를 먼저 확인하세요. 계산기는 길이·색·해상도만 다루며, 저작권이나 플랫폼 정책 위반 여부는 판단하지 않습니다. 플랫폼 글자 수 한도는 예고 없이 바뀔 수 있습니다.
      </Callout>

      <GuideSources
        items={[
          { label: 'W3C — WCAG 2.2 (명도 대비 1.4.3)', href: 'https://www.w3.org/TR/WCAG22/' },
          { label: 'twitter-text — 글자 수 가중치 설정(config v3)', href: 'https://github.com/twitter/twitter-text/blob/master/config/v3.json' },
          { label: 'YouTube 고객센터 — 맞춤 미리보기 이미지', href: 'https://support.google.com/youtube/answer/72431' },
          { label: 'Open Graph protocol', href: 'https://ogp.me' },
        ]}
      />
    </>
  )
}

const guide: CollectionGuide = { title: '콘텐츠 제작, 올리기 전에 재는 숫자', Body }
export default guide
