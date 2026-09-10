const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACT_DIR = '/Users/vivek/.gemini/antigravity-ide/brain/eb9643ab-9d5d-484c-955e-5ebbce09bf4c';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

async function testButtons() {
  console.log('Testing WhatsApp and Chatbot positioning & non-overlapping layout...');
  const browser = await chromium.launch({
    executablePath: '/Users/vivek/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    args: ['--headless=new', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Locate WhatsApp button
  const waButton = page.locator('a[aria-label="Contact VIP Concierge on WhatsApp"]').first();
  const isWaVisible = await waButton.isVisible();
  console.log('- WhatsApp button visible:', isWaVisible);

  // Locate Chatbot button
  const chatButton = page.locator('button[aria-label="Open VIP Concierge Live Assistant"]').first();
  const isChatVisible = await chatButton.isVisible();
  console.log('- VIP Live Assistant button visible:', isChatVisible);

  // Get bounding boxes
  const waBox = await waButton.boundingBox();
  const chatBox = await chatButton.boundingBox();

  console.log(`- WhatsApp Box: x=${waBox?.x?.toFixed(1)}, y=${waBox?.y?.toFixed(1)}, width=${waBox?.width?.toFixed(1)}, height=${waBox?.height?.toFixed(1)}`);
  console.log(`- Chatbot Box:  x=${chatBox?.x?.toFixed(1)}, y=${chatBox?.y?.toFixed(1)}, width=${chatBox?.width?.toFixed(1)}, height=${chatBox?.height?.toFixed(1)}`);

  // Verify non-overlapping
  const overlap = !(
    waBox.x + waBox.width < chatBox.x ||
    chatBox.x + chatBox.width < waBox.x ||
    waBox.y + waBox.height < chatBox.y ||
    chatBox.y + chatBox.height < waBox.y
  );
  console.log('- Elements overlap:', overlap ? 'FAIL (overlapping)' : 'PASS (no overlap, separate)');

  // Take screenshot of both visible at bottom of page
  const shot1 = path.join(SCREENSHOT_DIR, 'whatsapp_and_chatbot_both_visible.png');
  await page.screenshot({ path: shot1 });
  console.log('- Captured screenshot:', shot1);

  // Click on Chatbot to open chat window
  await chatButton.click();
  await page.waitForTimeout(1000);

  const isWaStillVisible = await waButton.isVisible();
  console.log('- WhatsApp button STILL visible when chat window is open:', isWaStillVisible);

  const shot2 = path.join(SCREENSHOT_DIR, 'whatsapp_with_chatbot_open.png');
  await page.screenshot({ path: shot2 });
  console.log('- Captured screenshot with chat window open:', shot2);

  await browser.close();
}

testButtons().catch(console.error);
