const { chromium } = require('@playwright/test');

async function testAdminLoginAndTabs() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });

  console.log('=== REGRESSION ITEM 6: ADMIN LOGIN ===');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });

  // If login form is shown, log in
  const emailInput = page.locator('main form input[type="email"]');
  const passwordInput = page.locator('main form input[type="password"]');

  if (await emailInput.count() > 0) {
    console.log('Admin login form displayed. Entering credentials...');
    await emailInput.fill('admin@apex.ae');
    await passwordInput.fill('zojgWBXZdARzCorN8nwa');
    await page.click('main form button[type="submit"]');
    await page.waitForTimeout(3000);
  }

  // Verify authenticated state
  const heading = await page.locator('h1').textContent();
  console.log('Admin Dashboard Heading:', heading ? heading.trim() : 'NOT FOUND');
  const isAuth = heading && heading.includes('Command Center');
  console.log('ITEM 6 RESULT (Admin Login & Auth):', isAuth ? 'PASSED' : 'FAILED');

  if (!isAuth) {
    console.error('Failed to authenticate to admin dashboard.');
    await browser.close();
    process.exit(1);
  }

  console.log('\n=== REGRESSION ITEM 7: ADMIN TABS ACCESSIBLE ===');
  const tabsToTest = ['inventory', 'leads', 'acquisition', 'parts', 'journal', 'dam', 'sync', 'settings'];
  const tabResults = {};

  for (const tab of tabsToTest) {
    console.log(`Testing tab: ${tab}...`);
    const tabButton = page.locator(`button:has-text("${tab}")`).first();
    await tabButton.click();
    await page.waitForTimeout(1200);

    // Verify content rendered for the tab
    const tabActive = await tabButton.evaluate(el => el.classList.contains('bg-white'));
    console.log(`  Tab ${tab}: active=${tabActive}`);
    tabResults[tab] = tabActive;
  }

  console.log('\nTab Results Summary:', tabResults);
  const allTabsPassed = tabsToTest.every(t => tabResults[t]);
  console.log('ITEM 7 RESULT (All Admin Tabs Accessible):', allTabsPassed ? 'PASSED' : 'FAILED');

  await browser.close();
  process.exit((isAuth && allTabsPassed) ? 0 : 1);
}

testAdminLoginAndTabs().catch(err => {
  console.error('Fatal error in testAdminLoginAndTabs:', err);
  process.exit(1);
});
