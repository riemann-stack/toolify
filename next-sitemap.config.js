/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://toolify-delta.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/about'),
    await config.transform(config, '/privacy'),
    await config.transform(config, '/terms'),
    await config.transform(config, '/tools/finance'),
    await config.transform(config, '/tools/finance/salary'),
    await config.transform(config, '/tools/finance/loan'),
    await config.transform(config, '/tools/finance/compound'),
    await config.transform(config, '/tools/health'),
    await config.transform(config, '/tools/health/bmi'),
    await config.transform(config, '/tools/health/bmr'),
    await config.transform(config, '/tools/health/pace'),
    await config.transform(config, '/tools/life'),
    await config.transform(config, '/tools/life/lotto'),
    await config.transform(config, '/tools/life/random'),
    await config.transform(config, '/tools/life/ladder'),
    await config.transform(config, '/tools/unit'),
    await config.transform(config, '/tools/unit/area'),
    await config.transform(config, '/tools/unit/length'),
    await config.transform(config, '/tools/unit/weight'),
    await config.transform(config, '/tools/date'),
    await config.transform(config, '/tools/date/age'),
    await config.transform(config, '/tools/date/dday'),
    await config.transform(config, '/tools/date/diff'),
    await config.transform(config, '/tools/dev'),
    await config.transform(config, '/tools/dev/charcount'),
    await config.transform(config, '/tools/dev/base64'),
    await config.transform(config, '/tools/dev/json'),
  ],
  transform: async (config, path) => {
    // 홈페이지와 인기 툴은 우선순위 높게
    const highPriority = ['/', '/tools/finance/salary', '/tools/date/age', '/tools/life/lotto', '/tools/health/bmi']
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: highPriority.includes(path) ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    }
  },
}