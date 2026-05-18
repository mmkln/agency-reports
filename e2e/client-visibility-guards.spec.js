import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../src/entities/dashboard-link/index.js'
import { PERFORMANCE_DASHBOARD_STATUSES } from '../src/entities/performance-dashboard/index.js'
import { REPORT_STATUSES } from '../src/entities/report/index.js'
import { CLIENT_UPDATE_TYPES, VISIBILITY } from '../src/entities/update/index.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

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

async function signInAsClient(page) {
  await page.evaluate((authKey) => {
    window.localStorage.removeItem(authKey)
  }, AUTH_SESSION_STORAGE_KEY)
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(CLIENT_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/client\/overview/)
}

async function seedHiddenClientRecords(page) {
  await page.evaluate(({
    clientId,
    dashboardProvider,
    dashboardStatus,
    internalVisibility,
    performanceStatus,
    reportStatus,
    updateType,
  }) => {
    const portalData = JSON.parse(window.localStorage.getItem('agency-reports.portal.v2'))
    const timestamp = '2026-05-18T10:00:00.000Z'

    portalData.dashboard_links.push({
      client_id: clientId,
      created_at: timestamp,
      description: 'Draft dashboard that must not be visible to clients.',
      display_order: 1,
      embed_url: 'https://example.com/draft-dashboard-embed',
      fallback_message: 'Draft dashboard fallback.',
      id: 'e2e10000-0000-4000-8000-000000000001',
      last_checked_at: timestamp,
      name: 'E2E Draft Source Dashboard',
      provider: dashboardProvider,
      public_url: 'https://example.com/draft-dashboard',
      show_on_overview: true,
      status: dashboardStatus,
      updated_at: timestamp,
      visibility: 'client_visible',
    })

    portalData.performance_dashboard_periods.push({
      account_manager: 'Sarah Johnson',
      agency_contact: 'sarah@growthlab.example',
      attribution_note: '',
      client_id: clientId,
      content: {
        executive_summary: {
          main_issue: '',
          main_win: '',
          narrative: 'Draft performance narrative that must stay hidden.',
          next_focus: '',
        },
        hero_metric: {
          label: 'Draft metric',
          value: '999',
        },
        insights: [],
        kpi_cards: [],
        next_steps: [],
      },
      created_at: timestamp,
      created_by: 'e2e-admin',
      data_confidence: 'estimated',
      data_mode: 'manual',
      id: 'e2e20000-0000-4000-8000-000000000002',
      last_updated_at: timestamp,
      period_end: '2026-05-31',
      period_start: '2026-05-01',
      published_at: null,
      source_summary: '',
      status: performanceStatus,
      title: 'E2E Draft Performance Period',
      updated_at: timestamp,
      updated_by: 'e2e-admin',
    })

    portalData.reports.push({
      client_decisions_needed: '',
      client_id: clientId,
      created_at: timestamp,
      dashboard_url: '',
      id: 'e2e30000-0000-4000-8000-000000000003',
      next_actions: '',
      pdf_url: '',
      period_end: '2026-05-31',
      period_start: '2026-05-01',
      problems: '',
      published_at: null,
      status: reportStatus,
      summary: 'Draft report summary that must stay hidden.',
      title: 'E2E Draft Client Report',
      updated_at: timestamp,
      wins: '',
    })

    portalData.updates.push({
      body: 'Internal update body that must stay hidden.',
      client_action_needed: '',
      client_id: clientId,
      created_at: timestamp,
      created_by: 'e2e-admin',
      id: 'e2e40000-0000-4000-8000-000000000004',
      published_at: timestamp,
      project_id: null,
      related_file_link_id: null,
      related_report_id: null,
      title: 'E2E Internal Client Update',
      type: updateType,
      updated_at: timestamp,
      visibility: internalVisibility,
      what_changed: 'Internal change note.',
      what_next: 'Internal next step.',
    })

    window.localStorage.setItem('agency-reports.portal.v2', JSON.stringify(portalData))
  }, {
    clientId: SEED_IDS.CLIENT_GREEN_DENTAL,
    dashboardProvider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
    dashboardStatus: DASHBOARD_LINK_STATUSES.DRAFT,
    internalVisibility: VISIBILITY.INTERNAL,
    performanceStatus: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
    reportStatus: REPORT_STATUSES.DRAFT,
    updateType: CLIENT_UPDATE_TYPES.ISSUE_UPDATE,
  })
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('client mature routes hide internal and draft records from persisted data', async ({ page }) => {
  await signInAsClient(page)
  await seedHiddenClientRecords(page)

  await page.goto(`/client/files-links?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Files & Links')).toBeVisible()
  await expect(page.getByText('Brand assets folder')).toBeVisible()
  await expect(page.getByText('Initial campaign launch archive')).toHaveCount(0)
  await page.getByRole('button', { name: /Archived 1/ }).click()
  await expect(page.getByText('Initial campaign launch archive')).toBeVisible()
  await expect(page.getByText('Internal tracking debug notes')).toHaveCount(0)

  await page.goto(`/client/updates?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Updates')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Published updates' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'April report published' }).first()).toBeVisible()
  await expect(page.getByText('Internal tracking note')).toHaveCount(0)
  await expect(page.getByText('E2E Internal Client Update')).toHaveCount(0)

  await page.goto(`/client/reports-dashboards?clientId=${SEED_IDS.CLIENT_GREEN_DENTAL}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Patient acquisition analytics' })).toBeVisible()
  const trustContext = page.locator('#results-trust-context')

  await expect(trustContext.getByRole('heading', { name: 'Clinic Data Trust' })).toBeVisible()
  await expect(trustContext.getByText('Last updated')).toBeVisible()
  await expect(trustContext.getByText('Confidence', { exact: true })).toBeVisible()
  await expect(trustContext.getByText('Medium confidence')).toBeVisible()
  await expect(trustContext.getByText('Manual', { exact: true })).toBeVisible()
  await expect(trustContext.getByText('Attribution caveat')).toBeVisible()
  await expect(trustContext.getByText('Source note')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'April 2026 Monthly Summary' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Marketing Performance Dashboard' }).first()).toBeVisible()
  await expect(page.getByText('May 2026 Performance Draft')).toHaveCount(0)
  await expect(page.getByText('E2E Draft Performance Period')).toHaveCount(0)
  await expect(page.getByText('E2E Draft Source Dashboard')).toHaveCount(0)
  await expect(page.getByText('E2E Draft Client Report')).toHaveCount(0)
})
