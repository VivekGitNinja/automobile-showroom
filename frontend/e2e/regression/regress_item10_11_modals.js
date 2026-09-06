const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function testBothModals() {
  const browser = await chromium.launch({ headless: true });

  // === ITEM 10: BOOKING MODAL ===
  console.log('=== REGRESSION ITEM 10: BOOKING MODAL SUBMISSION ===');
  const bookingPage = await browser.newPage();

  const beforeBookingCount = parseInt(
    execSync('docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM leads WHERE lead_type=\'booking\';"').toString().trim(),
    10
  );
  console.log('Initial DB booking leads count:', beforeBookingCount);

  await bookingPage.goto('http://localhost:3000/inventory/porsche-911-2023', { waitUntil: 'domcontentloaded' });
  const bookBtn = bookingPage.locator('button:has-text("Book Viewing")').first();
  await bookBtn.waitFor({ state: 'visible', timeout: 10000 });
  await bookBtn.click();

  await bookingPage.waitForSelector('input[placeholder="e.g. Lord Alexander Wright"]', { timeout: 10000 });
  await bookingPage.fill('input[placeholder="e.g. Lord Alexander Wright"]', 'Lord Verification Final');
  await bookingPage.fill('input[placeholder="alex@domain.com"]', 'booking.final@apex-test.ae');
  await bookingPage.fill('input[placeholder="+971 50 123 4567"]', '+971501112233');
  await bookingPage.fill('textarea[placeholder="Specify viewing date or export requirements..."]', 'Requesting private track viewing this Saturday.');

  console.log('Submitting Booking Modal...');
  await bookingPage.click('button[type="submit"]:has-text("Confirm Appointment Request")');

  await bookingPage.waitForSelector('text=Request Received', { timeout: 10000 });
  const bookingSuccess = await bookingPage.locator('text=Request Received').textContent();
  console.log('UI Booking Success Message:', bookingSuccess ? bookingSuccess.trim() : 'NOT FOUND');

  const afterBookingCount = parseInt(
    execSync('docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM leads WHERE lead_type=\'booking\';"').toString().trim(),
    10
  );
  console.log('Updated DB booking leads count:', afterBookingCount);

  const bookingRow = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -c "SELECT id, full_name, email, phone, lead_type, status FROM leads WHERE email=\'booking.final@apex-test.ae\' ORDER BY created_at DESC LIMIT 1;"'
  ).toString().trim();
  console.log('Persisted Booking DB Record:\n', bookingRow);

  const bookingPassed = (afterBookingCount === beforeBookingCount + 1) && bookingRow.includes('Lord Verification Final');
  console.log('ITEM 10 RESULT:', bookingPassed ? 'PASSED' : 'FAILED');

  await bookingPage.close();

  // === ITEM 11: CALLBACK MODAL ===
  console.log('\n=== REGRESSION ITEM 11: CALLBACK MODAL SUBMISSION ===');
  const callbackPage = await browser.newPage();

  const beforeCallbackCount = parseInt(
    execSync('docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM leads WHERE lead_type=\'callback\';"').toString().trim(),
    10
  );
  console.log('Initial DB callback leads count:', beforeCallbackCount);

  await callbackPage.goto('http://localhost:3000/contact', { waitUntil: 'domcontentloaded' });
  const callbackBtn = callbackPage.locator('button:has-text("Prefer a call? Request a callback")');
  await callbackBtn.waitFor({ state: 'visible', timeout: 10000 });
  await callbackBtn.scrollIntoViewIfNeeded();
  await callbackBtn.click();

  await callbackPage.waitForSelector('input[placeholder="e.g. Rashid Al Maktoum"]', { timeout: 10000 });
  await callbackPage.fill('input[placeholder="e.g. Rashid Al Maktoum"]', 'Sheikh Verification Final');
  await callbackPage.fill('input[placeholder="name@domain.ae"]', 'callback.final@apex-test.ae');
  await callbackPage.fill('input[placeholder="+971 50 891 9441"]', '+971509998877');
  await callbackPage.fill('textarea[placeholder*="Inquire about export"]', 'Urgent callback needed.');

  console.log('Submitting Callback Modal...');
  await callbackPage.click('button[type="submit"]:has-text("Request Private Callback")');

  await callbackPage.waitForSelector('text=Callback Requested', { timeout: 10000 });
  const callbackSuccess = await callbackPage.locator('text=Callback Requested').textContent();
  console.log('UI Callback Success Message:', callbackSuccess ? callbackSuccess.trim() : 'NOT FOUND');

  const afterCallbackCount = parseInt(
    execSync('docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM leads WHERE lead_type=\'callback\';"').toString().trim(),
    10
  );
  console.log('Updated DB callback leads count:', afterCallbackCount);

  const callbackRow = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -c "SELECT id, full_name, email, phone, lead_type, status FROM leads WHERE email=\'callback.final@apex-test.ae\' ORDER BY created_at DESC LIMIT 1;"'
  ).toString().trim();
  console.log('Persisted Callback DB Record:\n', callbackRow);

  const callbackPassed = (afterCallbackCount === beforeCallbackCount + 1) && callbackRow.includes('Sheikh Verification Final');
  console.log('ITEM 11 RESULT:', callbackPassed ? 'PASSED' : 'FAILED');

  await callbackPage.close();
  await browser.close();

  const allPassed = bookingPassed && callbackPassed;
  process.exit(allPassed ? 0 : 1);
}

testBothModals().catch(err => {
  console.error('Fatal error in testBothModals:', err);
  process.exit(1);
});
