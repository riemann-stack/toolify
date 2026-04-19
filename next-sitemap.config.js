/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://youtil.kr',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/about'),
    await config.transform(config, '/privacy'),
    await config.transform(config, '/terms'),
    await config.transform(config, '/tools'),
    // 금융
    await config.transform(config, '/tools/finance'),
    await config.transform(config, '/tools/finance/salary'),
    await config.transform(config, '/tools/finance/loan'),
    await config.transform(config, '/tools/finance/compound'),
    await config.transform(config, '/tools/finance/stock'),
    await config.transform(config, '/tools/finance/vat'),
    // 건강
    await config.transform(config, '/tools/health'),
    await config.transform(config, '/tools/health/bmi'),
    await config.transform(config, '/tools/health/bmr'),
    await config.transform(config, '/tools/health/pace'),
    await config.transform(config, '/tools/health/weightloss'),
    await config.transform(config, '/tools/health/pregnancy'),
    // 생활
    await config.transform(config, '/tools/life'),
    await config.transform(config, '/tools/life/lotto'),
    await config.transform(config, '/tools/life/random'),
    await config.transform(config, '/tools/life/ladder'),
    await config.transform(config, '/tools/life/dutch'),
    await config.transform(config, '/tools/life/zodiac'),
    await config.transform(config, '/tools/life/pomodoro'),
    await config.transform(config, '/tools/life/recipe'),
    await config.transform(config, '/tools/life/alcohol'),
    // 단위
    await config.transform(config, '/tools/unit'),
    await config.transform(config, '/tools/unit/area'),
    await config.transform(config, '/tools/unit/length'),
    await config.transform(config, '/tools/unit/weight'),
    await config.transform(config, '/tools/unit/size'),
    await config.transform(config, '/tools/unit/temperature'),
    // 날짜
    await config.transform(config, '/tools/date'),
    await config.transform(config, '/tools/date/age'),
    await config.transform(config, '/tools/date/dday'),
    await config.transform(config, '/tools/date/diff'),
    await config.transform(config, '/tools/date/military'),
    // 음악
    await config.transform(config, '/tools/music'),
    await config.transform(config, '/tools/music/bpm'),
    // 개발자
    await config.transform(config, '/tools/dev'),
    await config.transform(config, '/tools/dev/charcount'),
    await config.transform(config, '/tools/dev/base64'),
    await config.transform(config, '/tools/dev/json'),
    await config.transform(config, '/tools/dev/lorem'),
    await config.transform(config, '/tools/dev/color'),
  ],
  transform: async (config, path) => {
    const highPriority = [
      '/',
      '/tools/finance/salary',
      '/tools/date/age',
      '/tools/life/lotto',
      '/tools/health/bmi',
      '/tools/finance/stock',
      '/tools/date/military',
      '/tools/life/dutch',
    ]
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: highPriority.includes(path) ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    }
  },
}