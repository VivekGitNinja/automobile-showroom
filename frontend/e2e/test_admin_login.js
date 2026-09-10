const { chromium } = require('@playwright/test');
const path = require('path');

const ARTIFACT_DIR = '/Users/vivek/.gemini/antigravity-ide/brain/eb9643ab-9d5d-484c-955e-5ebbce09bf4c';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

async function testAdmin() {
  console.log('Testing Admin Login and Navigation...');
  const browser = await chromium.launch({
    executablePath: '/Users/vivek/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    args: ['--headless=new', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[BROWSER CONSOLE ${msg.type()}]:`, msg.text()));
  page.on('pageerror', err => console.log(`[PAGE ERROR]:`, err.message));
  page.on('request', req => {
    if (req.url().includes('/admin/leads')) {
      console.log(`[REQUEST HEADERS for ${req.url()}]: Authorization =`, req.headers()['authorization']);
    }
  });
  page.on('response', res => {
    if (res.url().includes('/auth/') || res.url().includes('/admin')) {
      console.log(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
    }
  });

  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  console.log('Opened /admin/login');

  await page.fill('input[type="email"]', 'admin@apex.ae');
  await page.fill('input[type="password"]', 'zojgWBXZdARzCorN8nwa');

  console.log('Clicked Initialize Session button...');
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(e => console.log('Navigation wait:', e.message)),
    page.click('button[type="submit"]')
  ]);

  console.log('Current URL after submit:', page.url());
  await page.waitForTimeout(3000);
  console.log('Current URL after 3s:', page.url());

  const cookies = await context.cookies();
  console.log('Cookies in context:', cookies.map(c => `${c.name}=${c.value.substring(0, 15)}...`));

  const shot = path.join(SCREENSHOT_DIR, '08_admin_dashboard.png');
  await page.screenshot({ path: shot, fullPage: false });
  console.log('Saved screenshot:', shot);

  // Check tabs if on /admin
  if (page.url().includes('/admin') && !page.url().includes('/admin/login')) {
    console.log('Successfully inside Admin Dashboard!');
    // Test Leads tab
    const leadsTab = page.locator('button:has-text("Leads")').first();
    if (await leadsTab.isVisible()) {
      await leadsTab.click();
      await page.waitForTimeout(2000);
      const shotLeads = path.join(SCREENSHOT_DIR, '09_admin_leads.png');
      await page.screenshot({ path: shotLeads });
      console.log('Saved leads screenshot:', shotLeads);
    }
    
    // Test Acquisition tab
    const acqTab = page.locator('button:has-text("Acquisition")').first();
    if (await acqTab.isVisible()) {
      await acqTab.click();
      await page.waitForTimeout(2000);
      const shotAcq = path.join(SCREENSHOT_DIR, '10_admin_acquisitions.png');
      await page.screenshot({ path: shotAcq });
      console.log('Saved acquisitions screenshot:', shotAcq);
    }

    // Test Sync tab
    const syncTab = page.locator('button:has-text("Sync")').first();
    if (await syncTab.isVisible()) {
      await syncTab.click();
      await page.waitForTimeout(2000);
      const shotSync = path.join(SCREENSHOT_DIR, '11_admin_sync.png');
      await page.screenshot({ path: shotSync });
      console.log('Saved sync screenshot:', shotSync);
    }
  }

  await browser.close();
}

testAdmin().catch(console.error);
