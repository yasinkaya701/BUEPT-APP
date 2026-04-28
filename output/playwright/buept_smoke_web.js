const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const consoleMessages = [];
  page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => consoleMessages.push({ type: 'pageerror', text: err.message }));

  await page.goto('http://127.0.0.1:8090/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'output/playwright/home-after-load.png', fullPage: true });

  const tabs = [
    'tab-home',
    'tab-reading',
    'tab-grammar',
    'tab-writing',
    'tab-vocab',
    'tab-listening',
    'tab-speaking',
  ];

  const results = [];
  for (const testId of tabs) {
    const locator = page.getByTestId(testId);
    if (!(await locator.count())) {
      results.push({ testId, ok: false, reason: 'missing' });
      continue;
    }
    await locator.first().click();
    await page.waitForTimeout(900);
    results.push({ testId, ok: true, url: page.url() });
  }

  await page.screenshot({ path: 'output/playwright/after-tabs.png', fullPage: true });

  console.log(JSON.stringify({
    results,
    consoleMessages: consoleMessages.filter((entry) => ['error', 'warning', 'pageerror'].includes(entry.type)),
  }, null, 2));

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
