import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'

const ADMIN_EMAIL = 'admin@growthlab.example'
const DEMO_ROLE_KEY = 'agency-reports.demo-role'
const GREEN_DENTAL_CLIENT_ID = SEED_IDS.CLIENT_GREEN_DENTAL

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

async function signInAsAdmin(page) {
  await page.evaluate(({ authKey, demoRoleKey }) => {
    window.localStorage.removeItem(authKey)
    window.localStorage.setItem(demoRoleKey, 'admin')
  }, {
    authKey: AUTH_SESSION_STORAGE_KEY,
    demoRoleKey: DEMO_ROLE_KEY,
  })
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[name="password"]').fill(DEMO_AUTH_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin\/clients/)
}

function clientWorkspaceTabs(page) {
  return page.getByRole('navigation', { name: 'Client workspace sections' })
}

test.beforeEach(async ({ page }) => {
  await resetLocalDemo(page)
})

test('admin can manage clinic setup from the client workspace', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-setup?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Green Dental Clinic', { exact: true })).toBeVisible()

  for (const tabName of ['Clinic Setup', 'Clinic Metrics', 'Reputation', 'Compliance', 'Reports & Dashboards']) {
    await expect(clientWorkspaceTabs(page).getByRole('link', { name: tabName })).toBeVisible()
  }

  await expect(page.getByRole('heading', { name: 'Clinic Profile' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Locations' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Service Lines' })).toBeVisible()
  await expect(page.getByText('Do not enter patient-level identifiers here.')).toBeVisible()

  await page.getByLabel('Primary growth goal').fill('E2E increase booked implant and emergency appointments.')
  await page.getByRole('button', { name: 'Save clinic setup' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  const savedGoal = await page.evaluate(({ clientId, portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.clinic_profiles.find((profile) => profile.client_id === clientId)?.primary_goal
  }, {
    clientId: GREEN_DENTAL_CLIENT_ID,
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(savedGoal).toBe('E2E increase booked implant and emergency appointments.')
})

test('admin clinic metrics workspace manages aggregate records and client previews', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-metrics?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Green Dental Clinic', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Patient Acquisition Snapshots' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Calls & Bookings Snapshots' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Service Line Performance' })).toBeVisible()
  await expect(page.getByText('without storing PHI.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save metrics' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create missed-call action' }).first()).toBeVisible()

  await expect(page.getByRole('link', { name: 'Published acquisition' })).toHaveAttribute(
    'href',
    `/admin/client-patient-acquisition-preview?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('link', { name: 'Draft calls' })).toHaveAttribute(
    'href',
    `/admin/client-calls-bookings-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )
  await expect(page.getByRole('link', { name: 'Draft services' })).toHaveAttribute(
    'href',
    `/admin/client-service-lines-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )

  await page.getByRole('link', { name: 'Draft calls' }).click()
  await expect(page).toHaveURL(/\/admin\/client-calls-bookings-preview/)
  await expect(page.locator('h1').getByText('Calls & Bookings', { exact: true })).toBeVisible()
})

test('admin can preview and save aggregate clinic metrics imports', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-metrics?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  const importPayload = {
    client_id: GREEN_DENTAL_CLIENT_ID,
    metrics: {
      calls_bookings: [
        {
          answered_calls: 17,
          booked_from_calls: 11,
          campaign_name: 'E2E June emergency campaign',
          missed_calls: 3,
          period_end: '2026-06-30',
          period_label: 'June 2026',
          period_start: '2026-06-01',
          summary: 'E2E imported calls show emergency demand leakage.',
          total_calls: 20,
        },
      ],
      patient_acquisition: [
        {
          booked_appointments: 11,
          calls: 20,
          campaign_name: 'E2E June emergency campaign',
          channel: 'google_ads',
          forms: 5,
          period_end: '2026-06-30',
          period_label: 'June 2026',
          period_start: '2026-06-01',
          summary: 'E2E imported acquisition snapshot.',
        },
      ],
      service_lines: [
        {
          booked_appointments: 11,
          campaign_name: 'E2E June emergency campaign',
          compliance_status: 'approved',
          inquiries: 25,
          location_id: SEED_IDS.CLINIC_LOCATION_GREEN_MAIN,
          period_end: '2026-06-30',
          period_label: 'June 2026',
          period_start: '2026-06-01',
          service_line_id: SEED_IDS.CLINIC_SERVICE_EMERGENCY_DENTAL,
          spend: 1800,
          summary: 'E2E imported service line performance.',
        },
      ],
    },
  }

  await page.getByRole('button', { name: 'Import JSON' }).click()
  const importDialog = page.getByRole('dialog', { name: 'Import clinic metrics JSON' })

  await expect(importDialog).toBeVisible()
  await page.getByLabel('Clinic metrics JSON *').fill(JSON.stringify(importPayload, null, 2))
  await page.getByRole('button', { name: 'Preview import' }).click()

  await expect(importDialog.getByRole('heading', { name: 'Import preview ready' })).toBeVisible()
  await expect(importDialog.locator('p').filter({ hasText: 'Periods: June 2026' })).toBeVisible()
  await expect(importDialog.locator('p').filter({ hasText: 'Campaigns: E2E June emergency campaign' })).toBeVisible()

  await page.getByRole('button', { name: 'Apply to draft' }).click()
  await expect(importDialog).not.toBeVisible()
  await expect(page.locator('textarea').filter({ hasText: 'E2E imported acquisition snapshot.' })).toBeVisible()

  await page.getByRole('button', { name: 'Save metrics' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  const importedMetrics = await page.evaluate(({ portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return {
      callBooking: portalData.call_booking_metrics.some((record) => (
        record.summary === 'E2E imported calls show emergency demand leakage.'
      )),
      patientAcquisition: portalData.patient_acquisition_snapshots.some((record) => (
        record.summary === 'E2E imported acquisition snapshot.'
      )),
      serviceLine: portalData.service_line_performance.some((record) => (
        record.summary === 'E2E imported service line performance.'
      )),
    }
  }, {
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(importedMetrics).toEqual({
    callBooking: true,
    patientAcquisition: true,
    serviceLine: true,
  })
})

test('admin reputation and compliance workspaces expose published and draft clinic previews', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-reputation?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Reputation Snapshots' })).toBeVisible()
  await expect(page.getByText('without storing reviewer or patient identifiers.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save reputation' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Published reputation' })).toHaveAttribute(
    'href',
    `/admin/client-reputation-preview?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('link', { name: 'Draft reputation' })).toHaveAttribute(
    'href',
    `/admin/client-reputation-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )

  await page.getByRole('link', { name: 'Draft reputation' }).click()
  await expect(page.locator('h1').getByText('Reputation', { exact: true })).toBeVisible()

  await page.goto(`/admin/clinic-compliance?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.getByRole('heading', { name: 'Compliance Reviews' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Medical Approvals' })).toBeVisible()
  await expect(page.getByText('policy issues, medical claims, ad restrictions, and privacy/tracking status without PHI.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save compliance' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Request changes' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reject' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Published compliance' })).toHaveAttribute(
    'href',
    `/admin/client-compliance-approvals-preview?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('link', { name: 'Draft compliance' })).toHaveAttribute(
    'href',
    `/admin/client-compliance-approvals-preview?clientId=${GREEN_DENTAL_CLIENT_ID}&preview=draft`,
  )

  await page.getByRole('link', { name: 'Published compliance' }).click()
  await expect(page.locator('h1').getByText('Compliance & Approvals', { exact: true })).toBeVisible()
})

test('admin can import aggregate clinic reputation and compliance records', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-reputation?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  const reputationPayload = {
    client_id: GREEN_DENTAL_CLIENT_ID,
    reputation: {
      reputation_snapshots: [
        {
          google_rating: 4.9,
          location_id: SEED_IDS.CLINIC_LOCATION_GREEN_MAIN,
          period_end: '2026-06-30',
          period_label: 'June 2026',
          period_start: '2026-06-01',
          review_count: 361,
          reviews_gained: 19,
          summary: 'E2E imported reputation snapshot.',
        },
      ],
    },
  }

  await page.getByRole('button', { name: 'Import JSON' }).click()
  const reputationDialog = page.getByRole('dialog', { name: 'Import clinic reputation JSON' })

  await expect(reputationDialog).toBeVisible()
  await page.getByLabel('Clinic reputation JSON *').fill(JSON.stringify(reputationPayload, null, 2))
  await page.getByRole('button', { name: 'Preview import' }).click()
  await expect(reputationDialog.getByRole('heading', { name: 'Import preview ready' })).toBeVisible()
  await expect(reputationDialog.locator('p').filter({ hasText: 'Periods: June 2026' })).toBeVisible()
  await page.getByRole('button', { name: 'Apply to draft' }).click()
  await expect(reputationDialog).not.toBeVisible()
  await page.getByRole('button', { name: 'Save reputation' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  await page.goto(`/admin/clinic-compliance?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  const compliancePayload = {
    client_id: GREEN_DENTAL_CLIENT_ID,
    compliance: {
      compliance_reviews: [
        {
          limited_ads: 1,
          location_id: SEED_IDS.CLINIC_LOCATION_GREEN_MAIN,
          open_issues: 2,
          platform: 'Google Ads',
          service_line_id: SEED_IDS.CLINIC_SERVICE_EMERGENCY_DENTAL,
          status: 'risk_flagged',
          summary: 'E2E imported compliance review.',
          title: 'E2E emergency claims review',
        },
      ],
    },
  }

  await page.getByRole('button', { name: 'Import JSON' }).click()
  const complianceDialog = page.getByRole('dialog', { name: 'Import clinic compliance JSON' })

  await expect(complianceDialog).toBeVisible()
  await page.getByLabel('Clinic compliance JSON *').fill(JSON.stringify(compliancePayload, null, 2))
  await page.getByRole('button', { name: 'Preview import' }).click()
  await expect(complianceDialog.getByRole('heading', { name: 'Import preview ready' })).toBeVisible()
  await expect(complianceDialog.locator('p').filter({ hasText: 'Platforms: Google Ads' })).toBeVisible()
  await page.getByRole('button', { name: 'Apply to draft' }).click()
  await expect(complianceDialog).not.toBeVisible()
  await page.getByRole('button', { name: 'Save compliance' }).click()
  await expect(page.getByText('Saved', { exact: true })).toBeVisible()

  const importedRecords = await page.evaluate(({ portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))

    return {
      compliance: portalData.compliance_reviews.some((record) => (
        record.summary === 'E2E imported compliance review.'
      )),
      reputation: portalData.reputation_snapshots.some((record) => (
        record.summary === 'E2E imported reputation snapshot.'
      )),
    }
  }, {
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(importedRecords).toEqual({
    compliance: true,
    reputation: true,
  })
})
