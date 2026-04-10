import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    const payload = {
      sub: 'owner-1',
      email: 'owner@example.com',
      roles: ['Owner'],
      exp: Math.floor(Date.now() / 1000) + 3600
    }
    const token = `x.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.x`
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: token })
    })
  })

  await page.goto('/login')
  await expect(page).toHaveURL('/login')

  // Fill login form
  await page.locator('#email').fill('owner@example.com')
  await page.locator('#password').fill('password')

  // Submit form
  await page.click('button[type="submit"]')

  // Should redirect to owner dashboard (assuming successful login)
  await expect(page).toHaveURL('/owner')
})