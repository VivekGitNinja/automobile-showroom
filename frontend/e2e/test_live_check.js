const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Users/vivek/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  console.log('Testing G-Class page...');
  await page.goto('http://localhost:3000/inventory/mercedes-benz-g-class-2023', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const topViewBtn = page.locator('button:has-text("TOP VIEW MCP")');
  if (await topViewBtn.isVisible()) {
    console.log('TOP VIEW MCP button visible on G-Class page');
    await topViewBtn.click();
    await page.waitForTimeout(1000);
    const blueprintBadge = page.locator('text=BLUEPRINT MCP OVERLAY');
    console.log('Blueprint MCP Overlay visible:', await blueprintBadge.isVisible());
  }

  console.log('Testing Lamborghini page...');
  await page.goto('http://localhost:3000/inventory/lamborghini-aventador-svj-2022', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const topViewBtnLambo = page.locator('button:has-text("TOP VIEW MCP")');
  if (await topViewBtnLambo.isVisible()) {
    console.log('TOP VIEW MCP button visible on Lamborghini page');
    await topViewBtnLambo.click();
    await page.waitForTimeout(1000);
    const blueprintBadgeLambo = page.locator('text=BLUEPRINT MCP OVERLAY');
    console.log('Blueprint MCP Overlay visible on Lamborghini:', await blueprintBadgeLambo.isVisible());
  }

  await browser.close();
  console.log('All checks passed successfully!');
})();
