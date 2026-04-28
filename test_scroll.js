const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
  const pages = await browser.pages();
  const page = pages.find(p => p.url().includes('8090'));
  
  if (!page) {
    console.log("Page not found");
    process.exit(1);
  }

  // Inject a script to analyze the DOM
  const result = await page.evaluate(() => {
    let logs = [];
    // find all scrollable elements
    const scrollables = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.overflowY === 'auto' || style.overflowY === 'scroll';
    });
    
    logs.push("Scrollable elements count: " + scrollables.length);
    scrollables.forEach(el => {
      logs.push(`Element: ${el.tagName}.${el.className}, height: ${el.clientHeight}, scrollHeight: ${el.scrollHeight}`);
    });

    const root = document.getElementById('root');
    logs.push(`Root height: ${root.clientHeight}, scrollHeight: ${root.scrollHeight}`);
    logs.push(`Body height: ${document.body.clientHeight}, scrollHeight: ${document.body.scrollHeight}`);

    return logs.join('\n');
  });

  console.log(result);
  process.exit(0);
})();
