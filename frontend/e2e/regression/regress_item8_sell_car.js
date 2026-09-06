const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function testSellCarSubmission() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== REGRESSION ITEM 8: SELL-YOUR-CAR SUBMISSION ===');

  const beforeCountStr = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM sell_car_submissions;"'
  ).toString().trim();
  const beforeCount = parseInt(beforeCountStr, 10);
  console.log('Initial DB sell_car_submissions count:', beforeCount);

  await page.goto('http://localhost:3000/sell-your-car', { waitUntil: 'networkidle' });

  // Fill in vehicle details
  await page.fill('input[placeholder="e.g. Ferrari"]', 'McLaren');
  await page.fill('input[placeholder="e.g. 812 Superfast"]', '720S Performance');
  await page.fill('input[type="number"]', '2022');
  
  // Fill owner details
  await page.fill('input[placeholder="Owner Name"]', 'Regression Suite Seller');
  await page.fill('input[placeholder="owner@domain.com"]', 'mclaren.verified@apex-test.ae');
  await page.fill('input[placeholder="+971 50 000 0000"]', '+971501234567');

  // Submit form
  console.log('Submitting sell-your-car form...');
  await page.click('button[type="submit"]:has-text("Submit Vehicle For Valuation")');

  // Wait for success screen
  await page.waitForSelector('text=Vehicle Valuation Submitted', { timeout: 10000 });
  const successText = await page.locator('text=Vehicle Valuation Submitted').textContent();
  console.log('UI Success Message:', successText ? successText.trim() : 'NOT FOUND');

  // Verify DB state
  const afterCountStr = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM sell_car_submissions;"'
  ).toString().trim();
  const afterCount = parseInt(afterCountStr, 10);
  console.log('Updated DB sell_car_submissions count:', afterCount);

  const newRow = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -c "SELECT id, car_make, car_model, full_name, email FROM sell_car_submissions WHERE email=\'mclaren.verified@apex-test.ae\' ORDER BY created_at DESC LIMIT 1;"'
  ).toString().trim();
  console.log('Persisted DB Record:\n', newRow);

  const passed = (afterCount === beforeCount + 1) && newRow.includes('McLaren') && newRow.includes('720S Performance');
  console.log('ITEM 8 RESULT:', passed ? 'PASSED' : 'FAILED');

  await browser.close();
  process.exit(passed ? 0 : 1);
}

testSellCarSubmission().catch(err => {
  console.error('Fatal error in testSellCarSubmission:', err);
  process.exit(1);
});
