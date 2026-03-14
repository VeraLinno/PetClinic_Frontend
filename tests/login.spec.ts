import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('/')

  // Should redirect to login
  await expect(page).toHaveURL('/login')

  // Fill login form
  await page.fill('input[name="email"]', 'owner@example.com')
  await page.fill('input[name="password"]', 'password')

  // Submit form
  await page.click('button[type="submit"]')

  // Should redirect to owner dashboard (assuming successful login)
  await expect(page).toHaveURL('/owner')
})