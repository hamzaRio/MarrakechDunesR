import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'https://marrakechdunes.vercel.app';
const BACKEND_URL = 'https://marrakechdunesr.onrender.com';

test.describe('Production Smoke Tests', () => {
  test('frontend routes return 200 and expected content', async ({ page }) => {
    // Test homepage
    await page.goto(`${FRONTEND_URL}/`);
    await expect(page).toHaveTitle(/MarrakechDunes/);
    await expect(page.locator('body')).toContainText('Marrakech');

    // Test activities page
    await page.goto(`${FRONTEND_URL}/activities`);
    await expect(page).toHaveTitle(/MarrakechDunes/);
    await expect(page.locator('body')).toContainText('Activities');

    // Test booking page
    await page.goto(`${FRONTEND_URL}/booking`);
    await expect(page).toHaveTitle(/MarrakechDunes/);
    await expect(page.locator('body')).toContainText('Booking');

    // Test admin login page
    await page.goto(`${FRONTEND_URL}/admin/login`);
    await expect(page).toHaveTitle(/MarrakechDunes/);
    await expect(page.locator('body')).toContainText('Sign In');
  });

  test('backend health endpoint returns expected JSON', async ({ request }) => {
    const url = `${BACKEND_URL}/api/health`;
    let status = 0, data: any = null;
    for (let i = 0; i < 12; i++) { // up to ~60s
      const r = await request.get(url, { timeout: 10000 });
      status = r.status();
      if (status === 200) { data = await r.json(); break; }
      await new Promise(r => setTimeout(r, 5000));
    }
    expect(status).toBe(200);
    expect(data).toHaveProperty('ok');
  });
});
