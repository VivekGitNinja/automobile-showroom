const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function testCallbackOnly() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating to /contact...');
  await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });

  const callbackBtn = page.locator('button:has-text("Prefer a call? Request a callback")');
  console.log('Callback button count:', await callbackBtn.count());
  console.log('Callback button visible:', await callbackBtn.isVisible());

  await callbackBtn.scrollIntoViewIfNeeded();
  await callbackBtn.click();
  console.log('Clicked callback button. Waiting 1s...');
  await page.waitForTimeout(1000);

  const modalDialog = page.locator('div[role="dialog"]');
  console.log('Dialog count:', await modalDialog.count());
  console.log('Dialog visible:', await modalDialog.isVisible());

  const nameInput = page.locator('input[placeholder="e.g. Rashid Al Maktoum"]');
  console.log('Name input count:', await nameInput.count());
  console.log('Name input visible:', await nameInput.isVisible());

  if (await nameInput.isVisible()) {
    await nameInput.fill('Sheikh Verification Callback');
    await page.fill('input[placeholder="name@domain.ae"]', 'sheikh.verified@apex-test.ae');
    await page.fill('input[placeholder="+971 50 891 9441"]', '+971509990000');
    await page.fill('textarea[placeholder*="Inquire about export"]', 'Urgent callback needed.');

    console.log('Submitting Callback Modal...');
    await page.click('button[type="submit"]:has-text("Request Private Callback")');

    await page.waitForSelector('text=Callback Requested', { timeout: 10000 });
    console.log('Success screen displayed!');

    const row = execSync(
      'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -c "SELECT id, full_name, email, phone, lead_type, status FROM leads WHERE email=\'sheikh.verified@apex-test.ae\' ORDER BY created_at DESC LIMIT 1;"'
    ).toString().trim();
    console.log('DB Record:\n', row);
  }

  await browser.close();
}

testCallbackOnly().catch(console.error);
