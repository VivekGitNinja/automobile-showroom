const { chromium } = require('@playwright/test');

async function testVehicleDetail() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== REGRESSION ITEM 5: VEHICLE DETAIL PAGE ===');
  const targetUrl = 'http://localhost:3000/inventory/porsche-911-2023';
  console.log('Navigating to:', targetUrl);
  
  const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('HTTP Status:', response.status());

  // Check page title / heading
  const heading = await page.locator('h1').textContent();
  console.log('Vehicle Heading:', heading ? heading.trim() : 'NOT FOUND');

  // Check price display
  const priceEl = await page.locator('text=/AED|Price on Request/i').first();
  const priceText = await priceEl.textContent().catch(() => 'N/A');
  console.log('Price Display:', priceText.trim());

  // Check specifications section
  const specs = await page.locator('text=/Engine|Power|Transmission|Mileage|Year/i').allTextContents();
  console.log('Specs detected count:', specs.length);
  console.log('Specs sample:', specs.slice(0, 5).map(s => s.trim()));

  // Check gallery or 3D studio container
  const galleryImgs = await page.locator('img').count();
  console.log('Images rendered on vehicle page:', galleryImgs);

  // Check action buttons (e.g. Enquire / Book Viewing / Contact VIP Concierge)
  const buttons = await page.locator('button').allTextContents();
  const actionButtons = buttons.filter(b => /Book|Enquire|Test Drive|Reserve|Contact|Share/i.test(b)).map(b => b.trim());
  console.log('Action buttons:', actionButtons);

  // Check 3D viewer / canvas presence or studio tab
  const canvasCount = await page.locator('canvas').count();
  console.log('Canvas elements count (Three.js 3D viewer):', canvasCount);

  const passed = response.status() === 200 && heading && specs.length > 0;
  console.log('ITEM 5 RESULT:', passed ? 'PASSED' : 'FAILED');

  await browser.close();
  process.exit(passed ? 0 : 1);
}

testVehicleDetail().catch(err => {
  console.error('Fatal error in testVehicleDetail:', err);
  process.exit(1);
});
