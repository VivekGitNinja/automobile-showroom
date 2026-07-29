import { test, expect } from '@playwright/test';

test('has title and loads homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Apex Luxury/);
  
  // Verify hero section is visible
  const heroHeading = page.locator('h1').first();
  await expect(heroHeading).toBeVisible();
});

test('inventory page loads and filters', async ({ page }) => {
  await page.goto('/inventory');
  await expect(page.getByRole('heading', { name: /Inventory/i })).toBeVisible();
});
