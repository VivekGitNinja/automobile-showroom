const { chromium } = require('@playwright/test');

async function checkHome() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const res = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  
  const status = res.status();
  const title = await page.title();
  const h1 = await page.locator('h1').first().textContent();
  const cta = await page.locator('a[href="/inventory"]').first().textContent();
  
  console.log('HOMEPAGE_STATUS:', status);
  console.log('HOMEPAGE_TITLE:', title);
  console.log('HOMEPAGE_H1:', h1.trim().replace(/\s+/g, ' '));
  console.log('HOMEPAGE_CTA:', cta.trim().replace(/\s+/g, ' '));
  
  await browser.close();
}

checkHome().catch(console.error);
