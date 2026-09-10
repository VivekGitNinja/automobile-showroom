const { chromium } = require('playwright');
const path = require('path');

const ARTIFACT_DIR = '/Users/vivek/.gemini/antigravity-ide/brain/eb9643ab-9d5d-484c-955e-5ebbce09bf4c';
const SCREENSHOTS_DIR = path.join(ARTIFACT_DIR, 'screenshots');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  await page.goto('http://localhost:3000/inventory/lamborghini-aventador-svj-2022', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll directly to Cockpit & Interior Inspection
  const cockpitSection = page.locator('h2:has-text("Cockpit & Interior Inspection")');
  await cockpitSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);

  // Capture clean Cockpit Stage
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, '19_cockpit_stage_focused.png'),
    fullPage: false,
  });
  console.log('📸 Captured 19_cockpit_stage_focused.png');

  // Test Cyber Crimson ambient lighting
  const crimsonBtn = page.locator('button[title*="Cyber Crimson"]');
  if (await crimsonBtn.isVisible()) {
    await crimsonBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '20_cockpit_crimson_ambient.png'),
      fullPage: false,
    });
    console.log('📸 Captured 20_cockpit_crimson_ambient.png');
  }

  // Click on a cockpit pin to open Craftsmanship modal
  const pin = page.locator('button[title*="Alcantara"], button[title*="Wheel"], button[title*="Virtual"]').first();
  if (await pin.isVisible()) {
    await pin.click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '21_cockpit_craftsmanship_modal.png'),
      fullPage: false,
    });
    console.log('📸 Captured 21_cockpit_craftsmanship_modal.png');
  }

  await browser.close();
  console.log('✅ Cockpit capture complete');
})();
