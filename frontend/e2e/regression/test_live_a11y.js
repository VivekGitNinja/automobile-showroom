const { chromium } = require('@playwright/test');

async function testA11y() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  LIVE PLAYWRIGHT ACCESSIBILITY AUDIT (D9)');
  console.log('════════════════════════════════════════════════════════════════');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const routes = ['/', '/inventory', '/contact', '/sell-your-car'];
  for (const route of routes) {
    await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
    const unlabelledButtons = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns
        .filter(b => {
          const text = b.innerText?.trim() || b.textContent?.trim();
          const ariaLabel = b.getAttribute('aria-label');
          const title = b.getAttribute('title');
          return !text && !ariaLabel && !title;
        })
        .map(b => b.outerHTML.slice(0, 100));
    });

    console.log(`Route ${route}: unlabelled buttons count = ${unlabelledButtons.length}`);
    if (unlabelledButtons.length > 0) {
      console.log('  Sample unlabelled buttons:', unlabelledButtons.slice(0, 5));
    }
  }

  // Also test keyboard focus on Chatbot trigger -> Escape
  console.log('\n--- Keyboard Focus Navigation Test ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  const trigger = page.locator('button:has-text("VIP Concierge")').first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  const modalVisible = await page.isVisible('div[role="dialog"]');
  console.log('Chatbot dialog opened via Enter key:', modalVisible);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  const modalClosed = !(await page.isVisible('div[role="dialog"]'));
  console.log('Chatbot dialog closed via Escape key:', modalClosed);

  await browser.close();
  console.log('\n================================================================');
  console.log('  ACCESSIBILITY AUDIT COMPLETE');
  console.log('================================================================');
}

testA11y().catch(console.error);
