const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/Users/vivek/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  console.log('Navigating to admin login...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', 'admin@apex.ae');
  await page.fill('input[type="password"], input[name="password"]', 'zojgWBXZdARzCorN8nwa');
  await page.click('button:has-text("Enter Portal"), button[type="submit"]');

  await page.waitForURL('**/admin', { timeout: 15000 });
  console.log('Admin dashboard loaded.');

  // Click Create Listing button
  const createBtn = page.locator('button:has-text("Create Listing")');
  await createBtn.click();
  await page.waitForTimeout(1000);

  // Take screenshot of the Add Vehicle Modal showing 3D Archetype & Model 3D URL
  await page.screenshot({
    path: '/Users/vivek/.gemini/antigravity-ide/brain/eb9643ab-9d5d-484c-955e-5ebbce09bf4c/screenshots/30_admin_add_vehicle_3d_config.png',
    fullPage: false
  });
  console.log('Saved screenshot 30_admin_add_vehicle_3d_config.png');

  await browser.close();
})();
