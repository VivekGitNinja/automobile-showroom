const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function testContactSubmission() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== REGRESSION ITEM 9: CONTACT FORM SUBMISSION ===');

  const beforeCountStr = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM leads WHERE lead_type=\'enquiry\';"'
  ).toString().trim();
  const beforeCount = parseInt(beforeCountStr, 10);
  console.log('Initial DB enquiry leads count:', beforeCount);

  await page.goto('http://localhost:3000/contact', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder="Lord / Lady Name"]', { timeout: 10000 });

  // Fill in contact form fields
  await page.fill('input[placeholder="Lord / Lady Name"]', 'Regression Suite Contact');
  await page.fill('input[placeholder="name@domain.com"]', 'contact.verified@apex-test.ae');
  await page.fill('input[placeholder="+971 50..."]', '+971507654321');
  await page.fill('textarea[placeholder="How may our concierge assist you?"]', 'Inquiring about private viewings and bespoke delivery options.');

  // Submit form
  console.log('Submitting contact form...');
  await page.click('button[type="submit"]:has-text("Send Message")');

  // Wait for success screen
  await page.waitForSelector('text=Message Sent', { timeout: 10000 });
  const successText = await page.locator('text=Message Sent').textContent();
  console.log('UI Success Message:', successText ? successText.trim() : 'NOT FOUND');

  // Verify DB state
  const afterCountStr = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM leads WHERE lead_type=\'enquiry\';"'
  ).toString().trim();
  const afterCount = parseInt(afterCountStr, 10);
  console.log('Updated DB enquiry leads count:', afterCount);

  const newRow = execSync(
    'docker exec luxery-postgres-1 psql -U dev_user -d showroom_dev -c "SELECT id, full_name, email, phone, lead_type, status FROM leads WHERE email=\'contact.verified@apex-test.ae\' ORDER BY created_at DESC LIMIT 1;"'
  ).toString().trim();
  console.log('Persisted DB Record:\n', newRow);

  const passed = (afterCount === beforeCount + 1) && newRow.includes('Regression Suite Contact') && newRow.includes('enquiry');
  console.log('ITEM 9 RESULT:', passed ? 'PASSED' : 'FAILED');

  await browser.close();
  process.exit(passed ? 0 : 1);
}

testContactSubmission().catch(err => {
  console.error('Fatal error in testContactSubmission:', err);
  process.exit(1);
});
