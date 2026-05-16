import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

const ADMIN_EMAIL = 'admin@growthlab.example'
const CLIENT_EMAIL = 'client@greendental.example'
const DEMO_ROLE_KEY = 'agency-reports.demo-role'

async function resetLocalDemo(page) {
  await page.goto('/')
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
  await page.goto('/login')
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

test('agency admin creates a draft performance dashboard and enters structured detail data', async ({ page }) => {
  const suffix = Date.now()
  const title = `E2E Structured Dashboard ${suffix}`

  await signInAsAdmin(page)
  await page.goto('/admin/performance-dashboards')
  await expect(page.getByRole('heading', { name: 'Performance Dashboards' })).toBeVisible()

  await page.getByRole('link', { name: 'New Dashboard' }).click()
  await expect(page.getByRole('dialog', { name: 'Create performance dashboard' })).toBeVisible()
  await expect(page.getByLabel('Content JSON')).toHaveCount(0)

  await page.getByLabel('Dashboard title *').fill(title)
  await page.getByLabel('Period start *').fill('2026-05-01')
  await page.getByLabel('Period end *').fill('2026-05-31')
  await page.getByLabel('Source summary').fill('Manual e2e data entry')
  await page.getByLabel('Attribution note').fill('Manual test attribution note.')
  await page.getByRole('button', { name: 'Create dashboard' }).click()

  await expect(page).toHaveURL(/\/admin\/performance-dashboard-editor/)
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.getByRole('button', { name: 'Add Trend' }).click()
  await page.getByLabel('Trend metric key').fill('qualified_leads')
  await page.getByLabel('Trend goal value').fill('30')
  await page.getByRole('button', { name: 'Add Point' }).click()
  await page.getByLabel('Primary series date').fill('2026-05-01')
  await page.getByLabel('Primary series value').fill('24')
  await page.getByRole('button', { name: 'Add Comparison Point' }).click()
  await page.getByLabel('Comparison series date').fill('2026-04-01')
  await page.getByLabel('Comparison series value').fill('19')
  await page.getByRole('button', { name: 'Add Annotation' }).click()
  await page.getByLabel('Annotation date').fill('2026-05-15')
  await page.getByLabel('Annotation label').fill('Landing page update')

  await page.getByRole('button', { name: 'Add Service' }).click()
  await page.getByLabel('Service summary').fill('Paid ads produced more qualified leads this period.')
  await page.getByRole('button', { name: 'Add Metric' }).click()
  await page.getByLabel('Metric key', { exact: true }).fill('qualified_leads')
  await page.getByLabel('Metric value', { exact: true }).fill('24')
  await page.getByRole('button', { name: 'Add Insight' }).first().click()
  await page.getByLabel('Service insights').fill('Google Ads lead quality improved.')
  await page.getByRole('button', { name: 'Add Action' }).first().click()
  await page.getByLabel('Service next actions').fill('Scale exact-match campaigns gradually.')

  await page.getByRole('button', { name: 'Add Table' }).click()
  await page.getByLabel('Appendix table title').fill('Top Campaigns')
  await page.getByRole('button', { name: 'Add Column' }).click()
  await page.getByLabel('Column label').fill('Campaign')
  await page.getByRole('button', { name: 'Add Row' }).click()
  await page.getByLabel('Campaign cell').fill('Implants Search')

  await page.getByRole('button', { name: 'Save Draft' }).click()
  await expect(page.getByText('Performance dashboard saved', { exact: true }).first()).toBeVisible()

  const savedPeriod = await page.evaluate(({ portalKey, periodTitle }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return portalData.performance_dashboard_periods.find((period) => period.title === periodTitle)
  }, {
    periodTitle: title,
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(savedPeriod.content.trends[0].series).toEqual([{ date: '2026-05-01', value: 24 }])
  expect(savedPeriod.content.trends[0].comparison_series).toEqual([{ date: '2026-04-01', value: 19 }])
  expect(savedPeriod.content.trends[0].annotations).toEqual([{ date: '2026-05-15', label: 'Landing page update' }])
  expect(savedPeriod.content.service_sections[0].metrics).toEqual({ qualified_leads: 24 })
  expect(savedPeriod.content.service_sections[0].insights).toEqual(['Google Ads lead quality improved.'])
  expect(savedPeriod.content.service_sections[0].next_actions).toEqual(['Scale exact-match campaigns gradually.'])
  expect(savedPeriod.content.appendix_tables[0].columns).toEqual(['Campaign'])
  expect(savedPeriod.content.appendix_tables[0].rows).toEqual([['Implants Search']])
  expect(savedPeriod.status).toBe('draft')

  await page.getByRole('link', { name: 'Preview' }).click()
  await expect(page).toHaveURL(/\/admin\/client-performance-preview/)
  await expect(page.getByRole('heading', { name: title }).first()).toBeVisible()
})

test('client can view published performance dashboard but cannot view draft or another client dashboard', async ({ page }) => {
  await signInAsClient(page)
  await expect(page.getByText('Performance snapshot')).toBeVisible()
  await expect(page.getByText('Qualified Leads').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'View Performance Dashboard' })).toHaveAttribute(
    'href',
    new RegExp(`/client/performance\\?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_APRIL}`),
  )

  await page.goto(`/client/performance?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_APRIL}`)
  await expect(page.getByRole('heading', { name: 'April 2026 Performance Dashboard' }).first()).toBeVisible()
  await expect(page.getByText('Qualified Leads').first()).toBeVisible()
  await expect(page.getByText('Last updated').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'What Changed' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Next Actions' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Patient Reactivation Campaign Plan' })).toBeVisible()
  await expect(page.getByText('Projected bookings', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Campaign touchpoints and cumulative bookings' })).toBeVisible()
  await expect(page.getByLabel('Dashboard period')).toBeVisible()
  await page.getByLabel('Dashboard period').selectOption(SEED_IDS.PERFORMANCE_GREEN_ARCHIVED_MARCH)
  await expect(page).toHaveURL(new RegExp(`performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_ARCHIVED_MARCH}`))
  await expect(page.getByRole('heading', { name: 'March 2026 Performance Dashboard' }).first()).toBeVisible()

  await page.goto(`/client/performance?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_DRAFT_MAY}`)
  await expect(page.getByText('Performance dashboard is being prepared')).toBeVisible()
  await expect(page.getByText('May 2026 Draft Performance')).toHaveCount(0)

  await page.goto(`/client/performance?clientId=${SEED_IDS.CLIENT_NORTHSTAR_DENTAL}&performancePeriodId=${SEED_IDS.PERFORMANCE_GREEN_APRIL}`)
  await expect(page.getByRole('heading', { name: 'Access denied' }).nth(1)).toBeVisible()
  await expect(page.getByText('You do not have permission to view this client portal.')).toBeVisible()
})

test('invalid performance dashboard JSON stays in the import modal with validation errors', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto('/admin/performance-dashboards')
  await page.getByRole('link', { name: 'Import JSON' }).click()

  await expect(page.getByRole('dialog', { name: 'Import performance dashboard JSON' })).toBeVisible()
  await page.getByLabel('Dashboard JSON *').fill('{bad json')
  await page.getByRole('button', { name: 'Import as draft' }).click()

  await expect(page.getByText('Import blocked')).toBeVisible()
  await expect(page.locator('li').filter({ hasText: 'Dashboard JSON is not valid JSON' })).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Import performance dashboard JSON' })).toBeVisible()
})

test('client performance page shows a clear fallback when no dashboard is published', async ({ page }) => {
  const clientId = '90909090-9090-4090-9090-909090909090'

  await signInAsAdmin(page)
  await page.evaluate(({ portalKey, seedIds, targetClientId }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    portalData.clients.push({
      agency_id: seedIds.AGENCY_GROWTHLAB,
      created_at: '2026-05-16T12:00:00.000Z',
      current_focus: [],
      id: targetClientId,
      logo_url: '',
      name: 'No Dashboard Client',
      portal_slug: 'no-dashboard-client',
      primary_contact_email: 'owner@example.com',
      primary_contact_name: 'Owner Example',
      status: 'on_track',
      updated_at: '2026-05-16T12:00:00.000Z',
    })
    window.localStorage.setItem(portalKey, JSON.stringify(portalData))
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    seedIds: SEED_IDS,
    targetClientId: clientId,
  })

  await page.goto(`/admin/client-performance-preview?clientId=${clientId}`)
  await expect(page.getByText('Performance dashboard is being prepared')).toBeVisible()
  await expect(page.getByText('Published analytics will appear here once reviewed.')).toBeVisible()
})

test('agency admin imports campaign execution JSON and publishes it for the client', async ({ page }) => {
  const campaignTitle = 'June 2026 Patient Reactivation Campaign'

  await signInAsAdmin(page)
  await page.goto('/admin/performance-dashboards')
  await page.getByRole('link', { name: 'Import JSON' }).click()

  await expect(page.getByRole('dialog', { name: 'Import performance dashboard JSON' })).toBeVisible()
  await page.getByLabel('Example payload').click()
  await page.getByRole('option', { name: 'Campaign execution' }).click()
  await page.getByRole('button', { name: 'Use example' }).click()
  await expect(page.getByLabel('Dashboard JSON *')).toContainText('campaign_execution')
  await Promise.all([
    page.waitForURL(/\/admin\/performance-dashboard-editor/),
    page.getByRole('button', { name: 'Import as draft' }).click(),
  ])
  await expect(page.getByRole('heading', { name: campaignTitle })).toBeVisible()
  await page.getByRole('button', { name: 'Publish' }).click()
  await expect(page.getByText('Performance dashboard published', { exact: true }).first()).toBeVisible()

  const importedPeriod = await page.evaluate(({ portalKey, title }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return portalData.performance_dashboard_periods.find((period) => period.title === title)
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    title: campaignTitle,
  })

  expect(importedPeriod.status).toBe('published')
  expect(importedPeriod.content.campaign_execution.activity_series.length).toBeGreaterThan(0)

  await signInAsClient(page)
  await page.goto(`/client/performance?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}&performancePeriodId=${importedPeriod.id}`)
  await expect(page.getByRole('heading', { name: 'Patient Reactivation Campaign Plan' })).toBeVisible()
  await expect(page.getByText('Estimated', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('SMS sent')).toBeVisible()
  await expect(page.getByText('Track B - core reactivation (wk 5-13)')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Campaign touchpoints and cumulative bookings' })).toBeVisible()
})
