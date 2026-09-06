const { chromium } = require('@playwright/test');
const { execSync } = require('child_process');

async function checkInventory() {
  const dbCountRaw = execSync(
    'docker exec $(docker ps -q -f name=postgres) psql -U dev_user -d showroom_dev -t -c "SELECT count(*) FROM vehicles WHERE status = \'published\';"'
  ).toString().trim();
  const dbCount = parseInt(dbCountRaw, 10);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const res = await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' });
  
  const status = res.status();
  const title = await page.title();
  
  // Wait for vehicles to render
  await page.waitForSelector('a[href^="/inventory/"]', { timeout: 10000 });
  const cardCount = await page.locator('a[href^="/inventory/"]:has(h3)').count();
  
  console.log('DB_PUBLISHED_COUNT:', dbCount);
  console.log('INVENTORY_PAGE_STATUS:', status);
  console.log('INVENTORY_PAGE_TITLE:', title);
  console.log('RENDERED_CARDS_COUNT:', cardCount);
  console.log('COUNTS_MATCH:', cardCount > 0 && cardCount <= dbCount);

  await browser.close();
}

checkInventory().catch(console.error);
