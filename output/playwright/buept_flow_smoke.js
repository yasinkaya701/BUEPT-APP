const { chromium } = require('playwright');

async function safeClick(page, locator, label) {
  const count = await locator.count();
  if (!count) throw new Error(`Missing locator: ${label}`);
  await locator.first().click();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const logs = [];
  page.on('console', (msg) => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => logs.push({ type: 'pageerror', text: err.message }));

  await page.goto('http://127.0.0.1:8090/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2500);

  const checks = [];

  // Reading
  await safeClick(page, page.getByTestId('tab-reading'), 'reading tab');
  await page.waitForTimeout(900);
  await safeClick(page, page.getByText('Open', { exact: true }), 'reading open');
  await page.waitForTimeout(1400);
  checks.push({ flow: 'reading-detail', ok: await page.getByText('Reading Desk').count() > 0 });
  await page.screenshot({ path: 'output/playwright/reading-detail.png', fullPage: true });

  // Grammar
  await safeClick(page, page.getByTestId('tab-grammar'), 'grammar tab');
  await page.waitForTimeout(900);
  await safeClick(page, page.getByText('Start Practice', { exact: true }), 'grammar start');
  await page.waitForTimeout(1200);
  checks.push({ flow: 'grammar-detail', ok: await page.getByText('Lesson Focus').count() > 0 || await page.getByText('Grammar Practice').count() > 0 });
  await page.screenshot({ path: 'output/playwright/grammar-detail.png', fullPage: true });

  // Writing
  await safeClick(page, page.getByTestId('tab-writing'), 'writing tab');
  await page.waitForTimeout(900);
  await safeClick(page, page.getByText('Start Writing', { exact: true }), 'writing start');
  await page.waitForTimeout(1200);
  checks.push({ flow: 'writing-editor', ok: await page.getByText('Writing Studio').count() > 0 || await page.getByText('One prompt, one draft, one clear feedback cycle.').count() > 0 });
  await page.screenshot({ path: 'output/playwright/writing-editor.png', fullPage: true });

  // Vocab
  await safeClick(page, page.getByTestId('tab-vocab'), 'vocab tab');
  await page.waitForTimeout(3000);
  checks.push({ flow: 'vocab-screen', ok: (await page.locator('text=Loading Vocabulary').count()) > 0 || (await page.locator('text=Vocabulary').count()) > 0 || (await page.locator('text=Vocab').count()) > 0 });
  await page.screenshot({ path: 'output/playwright/vocab-screen.png', fullPage: true });

  // Listening
  await safeClick(page, page.getByTestId('tab-listening'), 'listening tab');
  await page.waitForTimeout(1200);
  await safeClick(page, page.getByText('Open', { exact: true }), 'listening open');
  await page.waitForTimeout(1200);
  await safeClick(page, page.getByText('Play Audio', { exact: true }), 'play audio');
  await page.waitForTimeout(1800);
  checks.push({ flow: 'listening-detail', ok: await page.getByText('Transcript').count() > 0 });
  await page.screenshot({ path: 'output/playwright/listening-detail.png', fullPage: true });

  // Speaking
  await safeClick(page, page.getByTestId('tab-speaking'), 'speaking tab');
  await page.waitForTimeout(1200);
  checks.push({ flow: 'speaking-screen', ok: await page.locator('text=Speaking').count() > 0 || await page.locator('text=AI Speaking').count() > 0 });
  await page.screenshot({ path: 'output/playwright/speaking-screen.png', fullPage: true });

  console.log(JSON.stringify({
    checks,
    issues: logs.filter((entry) => ['error', 'pageerror'].includes(entry.type)),
    warnings: logs.filter((entry) => entry.type === 'warning').slice(0, 10),
  }, null, 2));

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
