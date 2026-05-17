import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

const ADMIN_EMAIL = 'admin@growthlab.example'
const CLIENT_EMAIL = 'client@greendental.example'
const DEMO_ROLE_KEY = 'agency-reports.demo-role'

test.setTimeout(120_000)

async function resetLocalDemo(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ authKey, demoRoleKey, portalKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.removeItem(demoRoleKey)
    window.localStorage.removeItem(portalKey)
    window.sessionStorage.clear()
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
    portalKey: PORTAL_STORAGE_KEY,
  })
}

async function clearAuthSession(page) {
  await page.evaluate((authKey) => {
    window.localStorage.removeItem(authKey)
  }, AUTH_SESSION_STORAGE_KEY)
}

async function signIn(page, email) {
  await clearAuthSession(page)
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
}

async function signInAsAdmin(page) {
  await signIn(page, ADMIN_EMAIL)
  await expect(page).toHaveURL(/\/admin\/clients/)
}

async function signInAsClient(page) {
  await signIn(page, CLIENT_EMAIL)
  await expect(page).toHaveURL(/\/client\/overview/)
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('UC-005 request lifecycle stays client-safe from create to resolve', async ({ page }) => {
  const title = `Approve homepage claim ${Date.now()}`
  const internalNote = 'Internal: confirm budget before chasing again.'

  await signInAsAdmin(page)
  await page.goto(`/admin/client-requests?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: 'New Request' })).toBeVisible()
  await page.getByRole('button', { name: 'New Request' }).click()
  await expect(page.getByRole('dialog', { name: 'New client request' })).toBeVisible()
  await page.getByLabel('Title').fill(title)
  await page.getByLabel('Details').fill('Please approve the updated homepage claim.')
  await page.getByLabel('Due date').fill('2026-05-20')
  await page.getByLabel('Owner').fill('Sarah Johnson')
  await page.getByLabel('Internal notes').fill(internalNote)
  await page.getByRole('button', { name: 'Create request' }).click()
  const createdRequestCard = page.locator('[data-testid^="request-card-"]').filter({ hasText: title })
  await expect(createdRequestCard).toBeVisible()
  await expect(createdRequestCard.getByText(internalNote)).toBeVisible()

  await signInAsClient(page)
  await page.goto(`/client/action-needed?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await page.locator('aside[aria-label="Demo role switcher"]').evaluate((element) => element.remove())
  await expect(page.locator('h1').getByText('Action Needed')).toBeVisible()
  const clientRequestCard = page.locator('article').filter({ hasText: title })
  await expect(clientRequestCard).toBeVisible()
  await expect(page.getByText(internalNote)).toHaveCount(0)
  await clientRequestCard.getByRole('button', { name: 'View details' }).click()
  const actionDialog = page.getByRole('dialog', { name: title })
  await actionDialog.getByPlaceholder('Write a short response for the agency...').fill('Approved for launch.')
  await actionDialog.getByRole('button', { name: 'Send response' }).click()
  await page.getByRole('button', { name: 'Answered' }).click()
  await expect(page.getByText('Approved for launch.')).toBeVisible()

  await signInAsAdmin(page)
  await page.goto(`/admin/client-requests?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  const requestCard = page.locator('[data-testid^="request-card-"]').filter({ hasText: title })
  await expect(requestCard).toBeVisible()
  await expect(requestCard.getByText('Approved for launch.')).toBeVisible()
  await requestCard.getByRole('button', { name: 'Resolve' }).click()
  await page.getByRole('button', { name: 'Resolved' }).click()
  const resolvedRequestCard = page.locator('[data-testid^="request-card-"]').filter({ hasText: title })
  await expect(resolvedRequestCard.getByText('Resolved')).toBeVisible()
})
