import { expect, test } from '@playwright/test'

import { PORTAL_STORAGE_KEY } from '../src/app/providers/repositories/createLocalStoragePortalRepository.js'
import { SEED_IDS } from '../src/app/providers/repositories/portalSeedData.js'
import { AUTH_SESSION_STORAGE_KEY, DEMO_AUTH_PASSWORD } from '../src/domain/services/authService.js'
import {
  CLINIC_NEEDED_ACTION_TYPES,
  NEEDED_ACTION_STATUSES,
} from '../src/entities/needed-from-client/index.js'

test.setTimeout(120_000)

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
  test.slow()

  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-setup?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Green Dental Clinic', { exact: true })).toBeVisible()

  for (const tabName of ['Home', 'Work', 'Performance', 'Portal', 'Access', 'Activity', 'Setup']) {
    await expect(clientWorkspaceTabs(page).getByRole('link', { name: tabName })).toBeVisible()
  }

  await clientWorkspaceTabs(page).getByRole('link', { name: 'Performance' }).click()
  await expect(page).toHaveURL(/\/admin\/client-reports-dashboards/)
  await expect(page.getByText('Clinic results').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'New Clinic Performance' })).toBeVisible()
  await page.goto(`/admin/clinic-setup?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

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
  await expect(page.getByRole('button', { name: 'Action exists' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create call script action' }).first()).toBeVisible()
  await expect(page.getByText('Ready to publish').first()).toBeVisible()

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

test('admin can manage clinic reporting periods and view operational dashboards', async ({ page }) => {
  test.slow()

  await signInAsAdmin(page)
  await expect(page.getByRole('list', { name: 'Primary navigation' }).getByRole('link', { name: 'Growth Review' })).toHaveAttribute(
    'href',
    '/dashboards/dental-growth-review',
  )

  await page.getByRole('list', { name: 'Primary navigation' }).getByRole('link', { name: 'Growth Review' }).click()
  await expect(page).toHaveURL('/dashboards/dental-growth-review')
  await expect(page.locator('h1').getByText('Weekly Dental Growth Operating Review', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Exact Funnel Numbers' })).toBeVisible()

  await page.goto(`/admin/clinic-reporting?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await expect(page.locator('h1').getByText('Green Dental Clinic', { exact: true })).toBeVisible()
  await expect(clientWorkspaceTabs(page).getByRole('link', { name: 'Performance' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Performance sections' }).getByRole('link', { name: 'Reporting' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Clinic Reporting Periods' })).toBeVisible()
  await expect(page.locator('main').getByRole('link', { name: 'Growth Review' })).toHaveAttribute(
    'href',
    `/dashboards/dental-growth-review?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('cell', { name: 'Daily Operations' }).first()).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Dental Growth Review' }).first()).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Executive Performance' }).first()).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Monthly Strategy' }).first()).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Weekly Operator' }).first()).toBeVisible()
  await expect(page.getByRole('cell', { name: /Current \|/ }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Import JSON' })).toBeVisible()
  await page.getByRole('button', { name: 'Import JSON' }).click()
  await expect(page.getByLabel('Reporting layer')).toContainText('Dental Growth Review')

  await page.goto(`/clinic/daily-ops?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Daily Operational Command Center', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Operational Triage' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Queue Workload' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Reply Queue' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Call Queue' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Booking Scorecard' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Data Hygiene' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Reactivation Tracks' })).toBeVisible()

  await page.goto(`/team/clinic-operator?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h1').getByText('Weekly Operator Dashboard', { exact: true })).toBeVisible()
  await expect(page.locator('main').getByRole('link', { name: 'Daily operations' })).toHaveAttribute(
    'href',
    `/clinic/daily-ops?clientId=${GREEN_DENTAL_CLIENT_ID}`,
  )
  await expect(page.getByRole('heading', { name: 'Funnel Leakage' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Operator Focus' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Source Diagnostics' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Deliverability And Workflow' })).toBeVisible()
})

test('admin clinic reporting import saves draft before explicit publish and archive', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-reporting?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  const importedTitle = 'E2E Executive Reporting Import'
  const importPayload = {
    content: {
      hero_metrics: [
        { id: 'e2e-new-patients', label: 'New patients', status: 'on_track', value: 9 },
      ],
      narrative: {
        narrative: 'E2E imported executive narrative.',
        next: ['Review source-level lead quality.'],
        wins: ['Reactivation remains efficient.'],
      },
    },
    period_end: '2026-05-31',
    period_label: 'E2E May 2026',
    period_start: '2026-05-01',
    source_trust: [
      {
        confidence: 'medium',
        data_mode: 'manual',
        last_updated_at: '2026-05-31T08:00:00.000Z',
        name: 'E2E import workbook',
        source_type: 'spreadsheet',
      },
    ],
    title: importedTitle,
  }

  await page.getByRole('button', { name: 'Import JSON' }).click()
  await page.getByRole('textbox', { name: 'Clinic reporting JSON' }).fill(JSON.stringify(importPayload, null, 2))
  await page.getByRole('button', { name: 'Preview import' }).click()
  const importDialog = page.getByRole('dialog', { name: 'Import clinic reporting JSON' })
  await expect(importDialog.getByRole('heading', { name: 'Import preview ready' })).toBeVisible()
  await expect(importDialog.getByText(importedTitle, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Apply to draft' }).click()
  await expect(page.getByText('Draft imported', { exact: true })).toBeVisible()

  const draftRecord = await page.evaluate(({ portalKey, title }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.clinic_executive_performance_periods.find((record) => record.title === title)
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    title: importedTitle,
  })

  expect(draftRecord.publish_state).toBe('draft')

  const importedRow = page.getByRole('row').filter({ hasText: importedTitle })
  await expect(importedRow).toContainText('draft')
  await importedRow.getByRole('button', { name: 'Publish' }).click()
  await expect(page.getByText('Published', { exact: true })).toBeVisible()

  const publishedRecord = await page.evaluate(({ portalKey, title }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.clinic_executive_performance_periods.find((record) => record.title === title)
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    title: importedTitle,
  })

  expect(publishedRecord.publish_state).toBe('published')

  await page.getByRole('row').filter({ hasText: importedTitle }).getByRole('button', { name: 'Archive' }).click()
  await expect(page.getByText('Archived', { exact: true })).toBeVisible()

  const archivedRecord = await page.evaluate(({ portalKey, title }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.clinic_executive_performance_periods.find((record) => record.title === title)
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    title: importedTitle,
  })

  expect(archivedRecord.publish_state).toBe('archived')
})

test('admin clinic reporting import blocks patient-level fields before saving', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-reporting?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Import JSON' }).click()
  await page.getByLabel('Reporting layer').selectOption('monthly_strategy')
  await page.getByRole('textbox', { name: 'Clinic reporting JSON' }).fill(JSON.stringify({
    content: {
      financials: [
        {
          label: 'Collections',
          patient_name: 'Jane Patient',
          value: 181000,
        },
      ],
    },
    period_end: '2026-05-31',
    period_label: 'E2E PHI blocked',
    period_start: '2026-05-01',
    title: 'E2E PHI blocked monthly import',
  }, null, 2))
  await page.getByRole('button', { name: 'Preview import' }).click()

  const importDialog = page.getByRole('dialog', { name: 'Import clinic reporting JSON' })
  await expect(importDialog.getByText('Remove patient-level field')).toBeVisible()
  await expect(importDialog.getByRole('button', { name: 'Apply to draft' })).toBeDisabled()

  const blockedRecordExists = await page.evaluate(({ portalKey }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    return portalData.clinic_monthly_strategy_periods.some((record) => record.title === 'E2E PHI blocked monthly import')
  }, {
    portalKey: PORTAL_STORAGE_KEY,
  })

  expect(blockedRecordExists).toBe(false)
})

test('admin can create clinic action-needed records from aggregate suggestions', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-metrics?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Create call script action' }).first().click()
  await expect(page.getByRole('button', { name: 'Action created' })).toBeVisible()

  await page.goto(`/admin/clinic-metrics?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: 'Action exists' }).first()).toBeVisible()

  await page.goto(`/admin/clinic-reputation?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Create review response action' }).click()
  await expect(page.getByRole('button', { name: 'Action created' })).toBeVisible()

  await page.goto(`/admin/clinic-reputation?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: 'Action exists' })).toBeVisible()

  await page.goto(`/admin/clinic-compliance?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Create compliance action' }).click()
  await expect(page.getByRole('button', { name: 'Action created' })).toBeVisible()

  await page.goto(`/admin/clinic-compliance?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: 'Action exists' }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Create approval action' }).click()
  await expect(page.getByRole('button', { name: 'Action created' })).toBeVisible()

  const createdActions = await page.evaluate(({ portalKey, seedIds }) => {
    const portalData = JSON.parse(window.localStorage.getItem(portalKey))
    const actions = portalData.needed_from_client

    return {
      callScript: actions.find((action) => (
        action.related_call_booking_metric_id === seedIds.CALL_BOOKING_IMPLANTS
        && action.clinic_action_type === 'approve_call_script'
      )),
      compliance: actions.find((action) => (
        action.related_compliance_review_id === seedIds.COMPLIANCE_REVIEW_AD_CLAIMS
        && action.clinic_action_type === 'approve_ad_copy'
      )),
      medicalApproval: actions.find((action) => (
        action.related_medical_approval_id === seedIds.MEDICAL_APPROVAL_WHITENING_OFFER
        && action.clinic_action_type === 'approve_ad_copy'
      )),
      reputation: actions.find((action) => (
        action.related_reputation_snapshot_id === seedIds.REPUTATION_GREEN_MAIN
        && action.clinic_action_type === 'respond_to_negative_review'
      )),
    }
  }, {
    portalKey: PORTAL_STORAGE_KEY,
    seedIds: SEED_IDS,
  })

  expect(createdActions.callScript).toMatchObject({
    client_id: GREEN_DENTAL_CLIENT_ID,
    clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_CALL_SCRIPT,
    status: NEEDED_ACTION_STATUSES.PENDING,
  })
  expect(createdActions.reputation).toMatchObject({
    client_id: GREEN_DENTAL_CLIENT_ID,
    clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.RESPOND_TO_NEGATIVE_REVIEW,
    status: NEEDED_ACTION_STATUSES.PENDING,
  })
  expect(createdActions.compliance).toMatchObject({
    client_id: GREEN_DENTAL_CLIENT_ID,
    clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY,
    status: NEEDED_ACTION_STATUSES.PENDING,
  })
  expect(createdActions.medicalApproval).toMatchObject({
    client_id: GREEN_DENTAL_CLIENT_ID,
    clinic_action_type: CLINIC_NEEDED_ACTION_TYPES.APPROVE_AD_COPY,
    status: NEEDED_ACTION_STATUSES.PENDING,
  })
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

test('admin clinic import preview blocks wrong sections and PHI', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(`/admin/clinic-metrics?clientId=${GREEN_DENTAL_CLIENT_ID}`, { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Import JSON' }).click()
  const importDialog = page.getByRole('dialog', { name: 'Import clinic metrics JSON' })

  await expect(importDialog).toBeVisible()
  await page.getByLabel('Clinic metrics JSON *').fill(JSON.stringify({
    client_id: GREEN_DENTAL_CLIENT_ID,
    reputation: {
      reputation_snapshots: [
        {
          period_end: '2026-06-30',
          period_label: 'June 2026',
          period_start: '2026-06-01',
        },
      ],
    },
  }, null, 2))
  await page.getByRole('button', { name: 'Preview import' }).click()
  await expect(importDialog.getByText(/No clinic metric records were found/)).toBeVisible()
  await expect(importDialog.getByRole('button', { name: 'Apply to draft' })).toBeDisabled()

  await page.getByLabel('Clinic metrics JSON *').fill(JSON.stringify({
    client_id: GREEN_DENTAL_CLIENT_ID,
    metrics: {
      calls_bookings: [
        {
          patient_phone: '+1 555 0100',
          period_end: '2026-06-30',
          period_label: 'June 2026',
          period_start: '2026-06-01',
        },
      ],
    },
  }, null, 2))
  await page.getByRole('button', { name: 'Preview import' }).click()
  await expect(importDialog.getByText(/Remove patient-level field "patient_phone"/)).toBeVisible()
  await expect(importDialog.getByRole('button', { name: 'Apply to draft' })).toBeDisabled()
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
  await expect(page.getByText('Ready to publish').first()).toBeVisible()
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
