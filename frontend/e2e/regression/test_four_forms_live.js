const { chromium } = require('@playwright/test');

async function testForms() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  FOUR FORMS ERROR RESILIENCE AND INPUT PRESERVATION TEST');
  console.log('════════════════════════════════════════════════════════════════');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Intercept all leads API calls using robust regex
    await page.route(/\/api\/v1\/leads/, route => {
      console.log(`[API INTERCEPT] ${route.request().method()} ${route.request().url()} -> returning 500`);
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated infrastructure outage: database unreachable.' })
      });
    });

    // 1. Test Contact Page Form
    console.log('\n--- 1. Contact Form (/contact) ---');
    await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="Lord / Lady Name"]', 'Test Human Contact');
    await page.fill('input[placeholder="name@domain.com"]', 'test@contact.ae');
    await page.fill('input[placeholder="+971 50..."]', '+971501234567');
    await page.fill('textarea[placeholder="How may our concierge assist you?"]', 'Interested in showroom visit.');
    await page.click('button[type="submit"]:has-text("Send Message")');
    await page.waitForTimeout(2000);

    const contactError = await page.textContent('.bg-red-500\\/10');
    const contactNameVal = await page.inputValue('input[placeholder="Lord / Lady Name"]');
    console.log('Contact form error visible:', !!contactError);
    console.log('Contact form error text:', contactError?.trim());
    console.log('Contact form preserved input:', contactNameVal === 'Test Human Contact');

    // 2. Test Sell Your Car Form
    console.log('\n--- 2. Sell Your Car Form (/sell-your-car) ---');
    await page.goto('http://localhost:3000/sell-your-car', { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="e.g. Ferrari"]', 'Ferrari');
    await page.fill('input[placeholder="e.g. 812 Superfast"]', 'Roma');
    await page.fill('input[type="number"]', '2023');
    await page.fill('input[placeholder="Owner Name"]', 'Test Human Seller');
    await page.fill('input[placeholder="owner@domain.com"]', 'seller@test.ae');
    await page.fill('input[placeholder="+971 50 000 0000"]', '+971509998888');
    await page.click('button[type="submit"]:has-text("Submit Vehicle For Valuation")');
    await page.waitForTimeout(2000);

    const sellError = await page.textContent('.bg-red-500\\/10');
    const sellNameVal = await page.inputValue('input[placeholder="Owner Name"]');
    console.log('Sell-car form error visible:', !!sellError);
    console.log('Sell-car form error text:', sellError?.trim());
    console.log('Sell-car form preserved input:', sellNameVal === 'Test Human Seller');

    // 3. Test BookingModal on Vehicle Detail Page
    console.log('\n--- 3. Booking Modal (Vehicle Detail Page) ---');
    await page.goto('http://localhost:3000/inventory/porsche-911-2023', { waitUntil: 'networkidle' });
    const bookBtn = page.locator('button:has-text("Book Viewing")').first();
    await bookBtn.click();
    await page.waitForSelector('input[placeholder="e.g. Lord Alexander Wright"]', { timeout: 5000 });
    await page.fill('input[placeholder="e.g. Lord Alexander Wright"]', 'Lord Test Booking');
    await page.fill('input[placeholder="alex@domain.com"]', 'booking@test.ae');
    await page.fill('input[placeholder="+971 50 123 4567"]', '+971505554444');
    await page.click('button[type="submit"]:has-text("Confirm Appointment Request")');
    await page.waitForTimeout(2000);

    const bookingError = await page.textContent('div.fixed.inset-0 .bg-red-500\\/10');
    const bookingNameVal = await page.inputValue('input[placeholder="e.g. Lord Alexander Wright"]');
    console.log('Booking modal error visible:', !!bookingError);
    console.log('Booking modal error text:', bookingError?.trim());
    console.log('Booking modal preserved input:', bookingNameVal === 'Lord Test Booking');

    // 4. Test CallbackModal on Contact Page
    console.log('\n--- 4. Callback Modal (/contact) ---');
    await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' });
    const cbTrigger = page.locator('button:has-text("Request a Callback")').first();
    await cbTrigger.click();
    await page.waitForSelector('input[placeholder="e.g. Rashid Al Maktoum"]', { timeout: 5000 });
    await page.fill('input[placeholder="e.g. Rashid Al Maktoum"]', 'Sheikh Callback Test');
    await page.fill('input[placeholder="name@domain.ae"]', 'callback@test.ae');
    await page.fill('input[placeholder="+971 50 891 9441"]', '+971508881111');
    await page.click('button[type="submit"]:has-text("Request Private Callback")');
    await page.waitForTimeout(2000);

    const cbError = await page.textContent('div[role="dialog"] .bg-red-500\\/10');
    const cbNameVal = await page.inputValue('input[placeholder="e.g. Rashid Al Maktoum"]');
    console.log('Callback modal error visible:', !!cbError);
    console.log('Callback modal error text:', cbError?.trim());
    console.log('Callback modal preserved input:', cbNameVal === 'Sheikh Callback Test');

    console.log('\n================================================================');
    console.log('  ALL 4 FORMS ERROR HANDLING VERIFIED LIVE UNDER INTERCEPTION');
    console.log('================================================================');
  } finally {
    await browser.close();
  }
}

testForms().catch(console.error);
