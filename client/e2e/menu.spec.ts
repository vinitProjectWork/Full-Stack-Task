import { test, expect } from '@playwright/test';

/**
 * End-to-end tests for the PerDiem Menu application.
 *
 * These tests verify the full user flow through a real browser:
 *   - Page loads correctly
 *   - Location selector is present and functional
 *   - Menu items render after location selection
 *   - Search filtering works
 *   - Dark mode toggle works
 *   - Error / empty states display properly
 *
 * Prerequisites: both server (port 4000) and client (port 3000) must be running.
 * Run with: npx playwright test
 */

test.describe('Menu Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the page with the PerDiem header', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('PerDiem')).toBeVisible();
  });

  test('shows location selector', async ({ page }) => {
    const selector = page.getByLabel('Select a location');
    await expect(selector).toBeVisible();
  });

  test('shows empty state before selecting a location', async ({ page }) => {
    await expect(
      page.getByText('Select a location to view the menu'),
    ).toBeVisible();
  });

  test('loads menu items after selecting a location', async ({ page }) => {
    const selector = page.getByLabel('Select a location');
    await expect(selector).toBeVisible();

    // Pick the first real location (not the placeholder)
    const options = await selector.locator('option:not([disabled])').all();
    if (options.length === 0) {
      test.skip(true, 'No locations available in sandbox');
      return;
    }

    const firstValue = await options[0].getAttribute('value');
    await selector.selectOption(firstValue!);

    // Wait for either menu items or an empty state
    await expect(
      page.getByRole('article').first().or(page.getByText(/no menu items/i)),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('search bar filters menu items', async ({ page }) => {
    const selector = page.getByLabel('Select a location');
    await expect(selector).toBeVisible();

    const options = await selector.locator('option:not([disabled])').all();
    if (options.length === 0) {
      test.skip(true, 'No locations available in sandbox');
      return;
    }

    const firstValue = await options[0].getAttribute('value');
    await selector.selectOption(firstValue!);

    // Wait for content to load
    await page.waitForTimeout(2000);

    const searchInput = page.getByPlaceholder('Search menu items...');
    if (await searchInput.isVisible()) {
      await searchInput.fill('zzznonexistent');
      await expect(page.getByText(/no items match/i)).toBeVisible({ timeout: 3000 });

      // Clear search
      await page.getByLabel('Clear search').click();
    }
  });

  test('dark mode toggle switches theme', async ({ page }) => {
    const toggle = page.getByLabel(/switch to .* mode/i);
    await expect(toggle).toBeVisible();

    // Get initial state
    const initialDark = await page.locator('html').evaluate(
      (el) => el.classList.contains('dark'),
    );

    // Click toggle
    await toggle.click();

    // Verify the class changed
    const afterDark = await page.locator('html').evaluate(
      (el) => el.classList.contains('dark'),
    );
    expect(afterDark).not.toBe(initialDark);
  });

  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.status).toBe('ok');
  });
});
