const { chromium } = require('@playwright/test');

async function testChatbotLive() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== REGRESSION G3 (a): CHATBOT LIVE VERIFICATION ===\n');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

  // Open chatbot
  const chatTrigger = page.locator('button[aria-label*="Concierge" i], button:has-text("Concierge")').first();
  await chatTrigger.waitFor({ state: 'visible', timeout: 10000 });
  await chatTrigger.click();
  console.log('Chatbot modal opened.');
  await page.waitForTimeout(1000);

  // 1. Test Category -> Question -> Scripted Answer
  console.log('--- Test 1: Category -> Question -> Scripted Answer ---');
  const catBtn = page.locator('button:has-text("Warranty & Inspection")').first();
  await catBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking category: Warranty & Inspection');
  await catBtn.click();
  await page.waitForTimeout(1500);

  const qBtn = page.locator('button:has-text("Do all vehicles come with a warranty?")').first();
  await qBtn.waitFor({ state: 'visible', timeout: 10000 });
  console.log('Clicking question: Do all vehicles come with a warranty?');
  await qBtn.click();
  await page.waitForTimeout(2000);

  const scriptedMsg = await page.locator('div.leading-relaxed.text-xs:has-text("warranty")').last().textContent();
  console.log('Bot scripted answer:\n ', scriptedMsg.trim());
  const test1Passed = scriptedMsg.includes('warranty') || scriptedMsg.includes('manufacturer');
  console.log('Test 1 Result:', test1Passed ? 'PASSED' : 'FAILED');

  // 2. Test Gibberish -> Human Fallback + WhatsApp
  console.log('\n--- Test 2: Gibberish -> Human Fallback + WhatsApp ---');
  const input = page.locator('input[placeholder="Ask VIP Concierge..."]');
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill('xyzzy blorp qzzzzzz 12345');
  await input.press('Enter');
  await page.waitForTimeout(2000);

  const fallbackMsg = await page.locator('div.leading-relaxed.text-xs:has-text("human")').last().textContent();
  console.log('Bot fallback response:\n ', fallbackMsg.trim());
  const hasHumanFallback = fallbackMsg.includes('human concierge') || fallbackMsg.includes('callback') || fallbackMsg.includes('WhatsApp');
  console.log('Test 2 Result:', hasHumanFallback ? 'PASSED' : 'FAILED');

  // 3. Test "how much is the ferrari sf90 price" -> Bot must NOT state a price (H11)
  console.log('\n--- Test 3: Vehicle Price Query -> Must NOT State a Price (H11) ---');
  await input.fill('how much is the ferrari sf90 price');
  await input.press('Enter');
  await page.waitForTimeout(2000);

  const priceResponse = await page.locator('div.leading-relaxed.text-xs:has-text("pricing")').last().textContent();
  console.log('Bot price response:\n ', priceResponse.trim());

  const statesNumericPrice = /AED\s*[\d,]+|\$[\d,]+|\b\d{6,}\b/.test(priceResponse);
  console.log('States numeric price:', statesNumericPrice);
  const directsToConcierge = priceResponse.includes('tailored') || priceResponse.includes('quotation') || priceResponse.includes('Concierge');
  console.log('Directs to concierge/callback:', directsToConcierge);

  const test3Passed = !statesNumericPrice && directsToConcierge;
  console.log('Test 3 Result (H11 Compliance):', test3Passed ? 'PASSED' : 'FAILED');

  await browser.close();
  const allPassed = test1Passed && hasHumanFallback && test3Passed;
  console.log('\n=== G3 (a) OVERALL RESULT ===:', allPassed ? 'PASSED' : 'FAILED');
  process.exit(allPassed ? 0 : 1);
}

testChatbotLive().catch(err => {
  console.error('Fatal in testChatbotLive:', err);
  process.exit(1);
});
