import Link from 'next/link'
import CronClient from './CronClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/dev/cron',
  title: 'Cron 표현식 생성기·해석기 — 한국어 해석 + 다음 실행 시각',
  description: '크론 표현식을 한국어로 해석하고 다음 실행 시각을 KST로 계산. 빌더·프리셋·요일/월 별칭·일·요일 OR 규칙 지원.',
  keywords: ['크론 표현식', '크론 생성기', 'cron 해석기', '크론 다음 실행', '크론탭', '스케줄 표현식', '크론 평일'],
})

const FAQ_LD = [
  {
    q: '크론 표현식 읽는 법은?',
    a: '왼쪽부터 <strong>분 · 시 · 일 · 월 · 요일</strong> 5칸으로 읽습니다. 예를 들어 <code>30 14 * * 1</code>은 분=30, 시=14, 일=*(매일), 월=*(매월), 요일=1(월요일) → <strong>매주 월요일 14시 30분</strong>입니다. <code>*</code>는 "모든 값", <code>*/5</code>는 "5단위마다", <code>1-5</code>는 "1부터 5까지", <code>1,15</code>는 "1과 15"를 뜻합니다.',
  },
  {
    q: '매일 특정 시간에 실행하는 크론은?',
    a: '분과 시만 고정하고 나머지를 <code>*</code>로 둡니다. <strong>매일 오전 9시</strong>는 <code>0 9 * * *</code>, <strong>매일 자정</strong>은 <code>0 0 * * *</code>, <strong>매일 오후 6시 30분</strong>은 <code>30 18 * * *</code>입니다. 시는 0~23(24시간제)으로 적습니다. 오후 2시는 14, 밤 11시는 23입니다.',
  },
  {
    q: '평일에만 실행하려면 어떻게 하나요?',
    a: '요일 칸에 <code>1-5</code>(월~금)를 넣습니다. <strong>평일 오전 9시</strong>는 <code>0 9 * * 1-5</code>입니다. 요일은 0=일요일, 1=월요일 … 6=토요일이며, 주말만 실행하려면 <code>0,6</code>을 씁니다. 토요일·일요일 출근일 같은 예외는 cron 한 줄로 표현하기 어려워, 보통 스크립트 안에서 공휴일을 추가로 걸러냅니다.',
  },
  {
    q: '0 0 * * *는 무슨 뜻인가요?',
    a: '분=0, 시=0, 나머지 전부 <code>*</code> → <strong>매일 자정(00:00)에 1회</strong> 실행입니다. 흔히 일일 배치·백업·로그 정리에 씁니다. 비슷하게 <code>0 * * * *</code>는 매시 정각, <code>* * * * *</code>는 매분 실행입니다. <code>@daily</code> 별칭도 같은 의미입니다.',
  },
  {
    q: '요일에서 0과 7의 차이는?',
    a: '둘 다 <strong>일요일</strong>입니다. 표준 cron(Vixie)은 요일을 0~7로 받고, 0과 7을 모두 일요일로 취급합니다(0~6이 일~토, 7은 0의 별칭). 따라서 <code>0 0 * * 0</code>과 <code>0 0 * * 7</code>은 동일하게 매주 일요일 자정입니다. 이 도구는 입력의 7을 내부적으로 0으로 바꿔 처리합니다.',
  },
  {
    q: '일과 요일을 동시에 지정하면 어떻게 되나요?',
    a: '표준 cron은 <strong>OR(둘 중 하나라도 맞으면 실행)</strong>입니다. <code>0 0 13 * 5</code>는 "매월 13일" <em>또는</em> "매주 금요일"에 실행되어, 13일의 금요일뿐 아니라 모든 13일과 모든 금요일에 돌아갑니다. 한쪽만 제한하려면 다른 칸을 <code>*</code>로 두면 됩니다. AND를 원하면 cron 한 줄로는 불가능해 스크립트 쪽에서 날짜를 다시 확인해야 합니다.',
  },
]

const H2 = { fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' } as const
const CARD = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 } as const
const CODE = { background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)', color: 'var(--text)' } as const

export default function CronPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        개발자
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="dev" />Cron 표현식 생성기·해석기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        크론 표현식을 입력하면 <strong style={{ color: 'var(--text)' }}>한국어 한 줄 해석</strong>과 다음 실행 시각을 보여줍니다.
        반대로 빌더에서 분·시·일·월·요일을 골라 표현식을 만들 수도 있습니다.
      </p>

      <CronClient />

      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 5필드 구조 ── */}
        <div>
          <h2 style={H2}>cron 5필드 구조</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            표준 cron은 공백으로 구분된 5개 필드로 시각을 표현합니다. 왼쪽부터 분·시·일·월·요일 순서입니다.
          </p>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '16px 18px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text)', lineHeight: 2, overflowX: 'auto',
          }}>
            <div style={{ whiteSpace: 'pre' }}><span style={{ color: 'var(--accent)' }}>┌─</span> 분    (0-59)</div>
            <div style={{ whiteSpace: 'pre' }}><span style={{ color: 'var(--accent)' }}>│ ┌─</span> 시   (0-23)</div>
            <div style={{ whiteSpace: 'pre' }}><span style={{ color: 'var(--accent)' }}>│ │ ┌─</span> 일  (1-31)</div>
            <div style={{ whiteSpace: 'pre' }}><span style={{ color: 'var(--accent)' }}>│ │ │ ┌─</span> 월 (1-12)</div>
            <div style={{ whiteSpace: 'pre' }}><span style={{ color: 'var(--accent)' }}>│ │ │ │ ┌─</span> 요일 (0-7, 0·7=일)</div>
            <div style={{ whiteSpace: 'pre', color: '#EA580C' }}>* * * * *</div>
          </div>
          <div style={{ ...CARD, marginTop: 12 }}>
            예: <code style={CODE}>0 9 * * 1-5</code> = 분 0, 시 9, 일 매일, 월 매월, 요일 월~금 → <strong style={{ color: 'var(--text)' }}>평일 오전 9시</strong>.
            초(second) 필드는 표준 cron에 없습니다(6필드는 Quartz·일부 라이브러리 확장).
          </div>
        </div>

        {/* ── 2. 특수문자 ── */}
        <div>
          <h2 style={H2}>특수문자 (* / , -) 의미</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기호', '의미', '예시'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { o: '*', d: '해당 필드의 모든 값', e: '시 칸의 * = 매시' },
                  { o: '*/n', d: 'n 단위마다 (스텝)', e: '*/15 (분) = 0,15,30,45분' },
                  { o: 'a-b', d: 'a부터 b까지 범위', e: '1-5 (요일) = 월~금' },
                  { o: 'a,b,c', d: '여러 값 나열 (리스트)', e: '0,30 (분) = 정각·30분' },
                  { o: 'a-b/n', d: '범위 안에서 n 단위마다', e: '9-18/3 (시) = 9,12,15,18시' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.o}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ ...CARD, marginTop: 12 }}>
            <code style={CODE}>L</code>(말일)·<code style={CODE}>W</code>(가까운 평일)·<code style={CODE}>#</code>(N번째 요일)·<code style={CODE}>?</code>는
            표준 cron에는 없고 Quartz 등 일부 구현에만 있습니다. 이 도구는 표준 5필드(<code style={CODE}>* / , -</code>)만 처리합니다.
          </div>
        </div>

        {/* ── 3. 요일·월 별칭 ── */}
        <div>
          <h2 style={H2}>요일·월 별칭과 @-축약</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            자주 쓰는 주기는 <code style={CODE}>@</code> 별칭으로 줄여 쓸 수 있습니다. 이 도구는 입력 시 자동으로 5필드로 풀어 해석합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
            {[
              { a: '@hourly', e: '0 * * * *', d: '매시 정각' },
              { a: '@daily', e: '0 0 * * *', d: '매일 자정 (=@midnight)' },
              { a: '@weekly', e: '0 0 * * 0', d: '매주 일요일 0시' },
              { a: '@monthly', e: '0 0 1 * *', d: '매월 1일 0시' },
              { a: '@yearly', e: '0 0 1 1 *', d: '매년 1/1 0시 (=@annually)' },
              { a: '@reboot', e: '—', d: '부팅 시 1회 (시각 계산 불가)' },
            ].map((r, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>{r.a}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', margin: '2px 0 4px' }}>{r.e}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{r.d}</p>
              </div>
            ))}
          </div>
          <div style={{ ...CARD, marginTop: 12 }}>
            요일은 숫자만 표준입니다(0~7). <code style={CODE}>MON</code>·<code style={CODE}>SUN</code> 같은 영문 약어와
            <code style={CODE}>JAN</code>~<code style={CODE}>DEC</code> 월 약어는 일부 구현만 지원하므로, 호환을 위해 숫자 사용을 권장합니다.
          </div>
        </div>

        {/* ── 4. OR 규칙 ── */}
        <div>
          <h2 style={H2}>일과 요일 동시 지정 시 OR 규칙</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            일(3번째)과 요일(5번째)을 <strong style={{ color: 'var(--text)' }}>둘 다</strong> <code style={CODE}>*</code>가 아닌 값으로 지정하면,
            표준 cron은 두 조건을 <strong style={{ color: 'var(--text)' }}>OR</strong>로 묶습니다 — 둘 중 하나라도 맞으면 실행합니다.
          </p>
          <div style={{
            background: 'rgba(234,88,12,0.05)', border: '1px solid rgba(234,88,12,0.30)', borderRadius: 12,
            padding: '14px 18px', fontSize: 13, color: 'var(--text)', lineHeight: 1.9,
          }}>
            <code style={CODE}>0 0 13 * 5</code> → 매월 <strong>13일</strong> <em>또는</em> 매주 <strong>금요일</strong> 자정.
            <br />결과적으로 13일과 금요일이 모두 트리거되며, 13일의 금요일에만 도는 것이 아닙니다.
            <br /><span style={{ color: 'var(--muted)' }}>둘 중 하나만 쓰려면 다른 칸을 <code style={{ ...CODE, color: 'var(--muted)' }}>*</code>로 두세요.</span>
          </div>
          <div style={{ ...CARD, marginTop: 12 }}>
            "둘 다 만족(AND)"하는 조건, 예를 들어 "13일이면서 금요일"은 cron 한 줄로 표현할 수 없습니다.
            크론은 트리거만 담당하고, 실제 스크립트 첫 줄에서 <code style={CODE}>요일을 다시 확인</code>해 빠져나가는 방식이 일반적입니다.
          </div>
        </div>

        {/* ── 5. Quartz·클라우드 차이 ── */}
        <div>
          <h2 style={H2}>Quartz·클라우드와 다른 점</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['환경', '필드 수', '요일 범위', '특이점'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { e: '표준 cron (이 도구)', f: '5', d: '0-7 (0·7=일)', n: '일·요일 OR, 초 없음' },
                  { e: 'Quartz (Java)', f: '6~7', d: '1-7 (1=일)', n: '초 필수, L·W·# 지원, 일·요일에 ? 필요' },
                  { e: 'Spring @Scheduled', f: '6', d: '0-7', n: '맨 앞에 초 필드 추가' },
                  { e: 'AWS EventBridge', f: '6', d: '1-7 (1=일)', n: '연도 필드, 일·요일 중 하나는 ?' },
                  { e: 'Kubernetes CronJob', f: '5', d: '0-7', n: '표준과 동일, UTC 기본' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 600 }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{r.f}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ ...CARD, marginTop: 12 }}>
            가장 큰 차이는 <strong style={{ color: 'var(--text)' }}>초 필드 유무</strong>와 <strong style={{ color: 'var(--text)' }}>요일 번호 기준</strong>입니다.
            Quartz·EventBridge는 요일이 1=일요일이라 표준 cron의 숫자를 그대로 옮기면 하루씩 어긋납니다.
            또 클라우드 스케줄러는 보통 <code style={CODE}>UTC</code>가 기본이므로, KST 기준으로 9시간을 빼서 등록해야 합니다.
          </div>
        </div>

        {/* ── 6. crontab 실무 등록·디버깅 ── */}
        <div>
          <h2 style={H2}>crontab 등록과 디버깅 — cron에서만 안 될 때</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            리눅스에서는 <code style={CODE}>crontab -e</code>로 편집기를 열어 한 줄 추가하고 저장하면 즉시 등록됩니다.
            <code style={CODE}>crontab -l</code>로 목록을 확인하고, <code style={CODE}>crontab -r</code>은 확인 질문 없이
            전체 삭제되므로 주의하세요. "터미널에서 직접 실행하면 되는데 cron에서만 안 된다"면 대부분 환경변수 차이가 원인입니다 —
            cron은 로그인 셸이 아니라 <code style={CODE}>SHELL=/bin/sh</code>, <code style={CODE}>PATH=/usr/bin:/bin</code>의
            최소 환경으로 명령을 실행합니다(crontab(5) 기준).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['증상', '원인', '해결'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: 'command not found', c: 'PATH가 /usr/bin:/bin뿐이라 /usr/local/bin 등을 못 찾음', f: '명령을 절대경로로 쓰거나 crontab 상단에 PATH= 선언' },
                  { s: '수동 실행은 OK, cron만 실패', c: '비로그인 sh 실행이라 ~/.bashrc의 변수·alias 미적용', f: '필요한 환경변수를 crontab이나 스크립트 안에 직접 선언' },
                  { s: 'date +%d 뒤 명령이 잘림', c: '%는 crontab에서 개행으로 해석, 이후는 표준입력으로 전달', f: '\\%로 이스케이프하거나 스크립트 파일로 분리' },
                  { s: '실행됐는지 흔적이 없음', c: '출력이 파일이 아닌 메일로만 감', f: '명령 뒤에 >> /var/log/작업.log 2>&1 리다이렉트' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 600, fontSize: 12 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontSize: 12 }}>{r.c}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{r.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ ...CARD, marginTop: 12 }}>
            cron은 명령이 출력(stdout·stderr)을 내면 그 내용을 메일로 보내려 시도합니다. crontab 상단에
            <code style={CODE}>MAILTO=me@example.com</code>을 적으면 수신 주소를 지정하고, <code style={CODE}>MAILTO=""</code>는
            메일 발송을 끕니다. 실행 여부 자체는 <code style={CODE}>grep CRON /var/log/syslog</code>(데비안·우분투)나
            <code style={CODE}>journalctl -u cron</code>(RHEL 계열은 crond)으로 확인할 수 있습니다.
          </div>
        </div>

        {/* ── 7. 비자명 주기 레시피 ── */}
        <div>
          <h2 style={H2}>한 줄로 안 되는 주기 — 실무 레시피</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 12 }}>
            "매월 마지막 날"이나 "2주마다"는 표준 5필드 문법만으로 표현할 수 없습니다. 이럴 땐 트리거를
            조금 넓게 걸어 두고, 명령 앞에서 날짜 조건을 확인해 아니면 빠져나가는 패턴을 씁니다(GNU date 기준).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['원하는 주기', '표현식', '조건·비고'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '매월 마지막 날 0시', e: '0 0 28-31 * *', n: '[ "$(date -d tomorrow +\\%d)" = "01" ] && 명령 — 표준 cron엔 L(말일)이 없어 "내일이 1일인지"로 판별' },
                  { p: '2주마다 월요일 9시', e: '0 9 * * 1', n: '[ $(( $(date +\\%V) % 2 )) -eq 1 ] && 명령 — ISO 주차 홀짝 체크. 53주가 있는 해의 연말·연초엔 한 번 어긋날 수 있음' },
                  { p: '업무시간만 10분마다', e: '*/10 9-17 * * 1-5', n: '*/10 9-18로 쓰면 18:50까지 돌아감 — 18시 정각에 끝내려면 0 18 * * 1-5 한 줄 추가' },
                  { p: '격월(홀수 달) 1일', e: '0 0 1 1-11/2 *', n: '1·3·5·7·9·11월 — 범위+스텝 문법으로 한 줄 해결 가능' },
                  { p: '매월 첫째 월요일', e: '0 9 * * 1', n: '[ $(date +\\%d) -le 7 ] && 명령 — 0 9 1-7 * 1은 OR 규칙 탓에 1~7일 전부에도 실행되므로 금물' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 600, fontSize: 12 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12, whiteSpace: 'nowrap' }}>{r.e}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontSize: 12 }}>{r.n}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ ...CARD, marginTop: 12 }}>
            예시의 <code style={CODE}>\%</code>는 crontab 한 줄에 인라인으로 넣을 때의 이스케이프이며, 별도 스크립트 파일
            안에서는 그냥 <code style={CODE}>%</code>를 씁니다. macOS·BSD의 date는 <code style={CODE}>-d tomorrow</code> 대신
            <code style={CODE}>date -v+1d</code>를 사용합니다. 조건이 두 개 이상 겹치면 crontab 한 줄에 욱여넣지 말고
            스크립트로 빼는 편이 읽기도, 로그 남기기도 쉽습니다.
          </div>
        </div>

        <AdSlot position="between-tools" minHeight={250} />

        {/* ── FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 관련 도구 ── */}
        <div>
          <h2 style={H2}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/dev/json', icon: '📋', name: 'JSON 포맷터', desc: 'JSON 정렬·압축·트리·검증' },
              { href: '/tools/dev/regex', icon: '🔍', name: '정규식 테스터', desc: '패턴 매칭·그룹·치환 미리보기' },
              { href: '/tools/dev/base64', icon: '🔐', name: 'Base64 인코더/디코더', desc: '텍스트·파일·JWT Base64 변환' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
