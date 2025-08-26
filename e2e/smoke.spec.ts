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
    const response = await request.get(`${BACKEND_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('ok');
    expect(typeof data.ok).toBe('boolean');
  });
});
