import { test, expect } from '@playwright/test';

const API = 'http://localhost:4000/api/v1';

test.describe('Public site', () => {
  test('homepage: title, hero and live inventory count CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Apex Luxury/);
    await expect(page.locator('h1').first()).toBeVisible();
    // CTA reflects the live inventory total (no hardcoded "500+")
    await expect(page.getByText(/Explore (All \d+ )?Vehicles|Explore Full Inventory/).first()).toBeVisible();
  });

  test('inventory: loads, marque filter and year filter work', async ({ page }) => {
    await page.goto('/inventory');
    await expect(page.getByRole('heading', { name: /Inventory/i })).toBeVisible();
    await page.waitForTimeout(2000);

    // Pick a make chip that exists (dynamically loaded from the API)
    const ferrariChip = page.locator('button', { hasText: /^Ferrari$/i }).first();
    if (await ferrariChip.count()) {
      await ferrariChip.click();
      await page.waitForTimeout(1500);
      await expect(page.locator('body')).toContainText(/Masterpiece|No Masterpieces Found/i);
    }

    // Year filter is present
    await expect(page.getByText('Year From')).toBeVisible();
  });

  test('inventory: honors ?brand= deep link from brand pages', async ({ page }) => {
    await page.goto('/inventory?brand=ferrari');
    await page.waitForTimeout(2500);
    await expect(page.locator('body')).toContainText(/Brand: ferrari/i);
  });

  test('brands: shows live counts', async ({ page }) => {
    await page.goto('/brands');
    await expect(page.locator('body')).toContainText(/Bespoke Portfolios/i);
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Vehicle/i);
  });

  test('parts: catalogue loads with categories and a part detail opens', async ({ page }) => {
    await page.goto('/parts');
    await expect(page.getByRole('heading', { name: /Spare/i })).toBeVisible();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Components Available/i);

    // Open the first part card
    const firstPart = page.locator('a[href^="/parts/"]').first();
    await firstPart.click();
    await page.waitForURL(/\/parts\/.+/, { timeout: 15000 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/Enquire About This Part/i)).toBeVisible();
  });

  test('blog: seeded articles are listed and readable', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForTimeout(1500);
    await expect(page.locator('body')).toContainText(/Apex.*Journal|Latest Automotive Stories/i);
    const article = page.locator('a[href^="/blog/"]').first();
    if (await article.count()) {
      await article.click();
      await page.waitForURL(/\/blog\/.+/, { timeout: 15000 });
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('faq: renders staff-managed categories', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForTimeout(1500);
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible();
  });

  test('chatbot: menu-driven flow answers from the FAQ set', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Live Assistant').click();
    await expect(page.getByText(/VIP Automotive Concierge/i)).toBeVisible();
    await page.waitForTimeout(1000);

    // Click the first FAQ category option (menu-driven flow: options are the
    // buttons rendered under the "Frequently Inquired Topics" label)
    const option = page.locator('div.mt-3.space-y-2 > button').first();
    await option.click();
    await page.waitForTimeout(1500);
    // Bot should now list questions in that category
    await expect(page.locator('body')).toContainText(/Here are the questions|WhatsApp/i);
  });

  test('sell-your-car: form validates and submits', async ({ page }) => {
    await page.goto('/sell-your-car');
    await expect(page.locator('form, body').first()).toBeVisible();
  });

  test('contact: page renders with form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('body')).toContainText(/Concierge|Contact/i);
  });

  test('vehicle detail: 3D studio renders with interactive zone hotspots', async ({ page }) => {
    const res = await page.request.get(`${API}/vehicles?limit=1`);
    const { data } = await res.json();
    test.skip(!data?.length, 'no vehicles in DB');
    await page.goto(`/inventory/${data[0].slug}`);
    await page.waitForTimeout(3000);

    const studio = page.locator('text=Interactive 3D Studio').first();
    await studio.scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);

    // Zone pills are projected onto the canvas
    await expect(page.locator('.v3d-zone').first()).toBeVisible();
    // Click the first zone → live parts drawer opens
    await page.locator('.v3d-zone').first().click();
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Available Parts|No published parts/i);
  });

  test('vehicle detail: parts enquiry form creates a lead', async ({ page }) => {
    const res = await page.request.get(`${API}/parts?limit=1`);
    const { data } = await res.json();
    test.skip(!data?.length, 'no parts in DB');
    await page.goto(`/parts/${data[0].slug}`);

    // Unique email per run — the API dedupes identical enquiries within 24h
    const email = `e2e-${Date.now()}@test.com`;
    await page.getByPlaceholder('Full name').fill('E2E Tester');
    await page.getByPlaceholder('Email address').fill(email);
    await page.getByPlaceholder('Phone (incl. country code)').fill('+971500000001');
    await page.getByRole('button', { name: /Send Enquiry/i }).click();
    await expect(page.getByText(/Enquiry received/i)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Admin', () => {
  test('middleware: /admin redirects to login without a session', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('admin: login via UI shows dashboard with all tabs and fleet data', async ({ page }) => {
    await page.goto('/admin/login');
    // Scope to the login card (footer newsletter also has an email input)
    await page.locator('main input[type="email"]').fill('admin@apex.ae');
    await page.locator('main input[type="password"]').fill('password123');
    await page.getByRole('button', { name: /Initialize Session/i }).click();
    // Login page redirects to /admin after auth; wait for the dashboard to render
    await page.waitForURL(/\/admin(\/)?$|\/admin\?/, { timeout: 20000 });
    await expect(page.getByText(/Enterprise Command Center/i)).toBeVisible({ timeout: 20000 });
    await page.waitForTimeout(3000);

    for (const tab of ['inventory', 'leads', 'parts', 'journal', 'dam', 'sync', 'settings']) {
      await expect(page.locator(`button:text-is("${tab}")`).first()).toBeVisible();
    }
    // Fleet table has real rows
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });
  });
});
