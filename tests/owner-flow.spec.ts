import { test, expect } from '@playwright/test'

function buildJwt(payload: Record<string, unknown>) {
  return `x.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.x`
}

test('owner can open pets page and see owned pets', async ({ page }) => {
  await page.route('**/auth/login', async (route) => {
    const token = buildJwt({
      sub: 'owner-1',
      email: 'owner@example.com',
      roles: ['Owner'],
      exp: Math.floor(Date.now() / 1000) + 3600
    })

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: token })
    })
  })

  await page.route('**/owners/me/pets', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Milo',
          species: 'Cat',
          breed: 'Tabby',
          ownerId: 'owner-1'
        }
      ])
    })
  })

  await page.goto('/login')
  await page.locator('#email').fill('owner@example.com')
  await page.locator('#password').fill('password')
  await page.click('button[type="submit"]')

  await page.goto('/owner/pets')
  await expect(page.getByText('Milo')).toBeVisible()
})
