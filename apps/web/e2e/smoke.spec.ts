import { test, expect } from '@playwright/test';

test('Slovenian storefront renders', async ({ page }) => {
  await page.goto('/sl');
  await expect(page.locator('h1')).toBeVisible();
});

test('Shop route resolves', async ({ page }) => {
  await page.goto('/sl/trgovina');
  await expect(page.locator('h1')).toContainText(/linij|line|linija/i);
});
