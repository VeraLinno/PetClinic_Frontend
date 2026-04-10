import { test, expect } from '@playwright/test'

function buildJwt(payload: Record<string, unknown>) {
  return `x.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.x`
}

test('idor guard: deleting another owners pet is rejected', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    const token = buildJwt({
      sub: 'owner-1',
      email: 'owner1@example.com',
      roles: ['Owner'],
      exp: Math.floor(Date.now() / 1000) + 3600
    })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: token })
    })
  })

  await page.route('**/owners/me/pets/*', async (route) => {
    if (route.request().method() === 'DELETE') {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Not found' })
      })
      return
    }

    await route.continue()
  })

  await page.goto('/login')
  await page.locator('#email').fill('owner1@example.com')
  await page.locator('#password').fill('password')
  await page.click('button[type="submit"]')

  const status = await page.evaluate(async () => {
    const res = await fetch('/api/v1/owners/me/pets/22222222-2222-2222-2222-222222222222', {
      method: 'DELETE'
    })
    return res.status
  })

  expect(status).toBe(404)
})
