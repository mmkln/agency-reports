import { CLIENT_STATUSES } from '../../../entities/client'
import { CLIENT_INVITATION_STATUSES } from '../../../entities/client-invitation'
import { CLIENT_MEMBERSHIP_ROLES } from '../../../entities/client-membership'
import { DASHBOARD_LINK_STATUSES, DASHBOARD_PROVIDERS } from '../../../entities/dashboard-link'
import { NEEDED_ACTION_STATUSES } from '../../../entities/needed-from-client'
import {
  PERFORMANCE_CHANNELS,
  PERFORMANCE_DASHBOARD_STATUSES,
  PERFORMANCE_DATA_CONFIDENCE,
  PERFORMANCE_DATA_MODES,
  PERFORMANCE_GOAL_STATUSES,
  PERFORMANCE_INSIGHT_SEVERITIES,
  PERFORMANCE_METRIC_STATUSES,
  PERFORMANCE_NEXT_STEP_PRIORITIES,
  PERFORMANCE_SERVICE_TYPES,
  PERFORMANCE_TREND_GRANULARITIES,
} from '../../../entities/performance-dashboard'
import { USER_ROLES } from '../../../entities/profile'
import { REPORT_STATUSES } from '../../../entities/report'
import { TASK_STATUSES } from '../../../entities/task'
import { VISIBILITY } from '../../../entities/update'

export const SEED_IDS = Object.freeze({
  AGENCY_GROWTHLAB: '11111111-1111-4111-8111-111111111111',
  CLIENT_GREEN_DENTAL: '22222222-2222-4222-8222-222222222222',
  CLIENT_INVITATION_GREEN: '19191919-1919-4919-8919-191919191919',
  CLIENT_NORTHSTAR_DENTAL: '23232323-2323-4323-8323-232323232323',
  MEMBERSHIP_CLIENT_GREEN: '18181818-1818-4818-8818-181818181818',
  MEMBERSHIP_TEAM_GREEN: '17171717-1717-4717-8717-171717171717',
  DASHBOARD_GREEN_APRIL: '33333333-3333-4333-8333-333333333333',
  NEEDED_CREATIVE_APPROVAL: '55555555-5555-4555-8555-555555555555',
  NEEDED_OFFER_DETAILS: '44444444-4444-4444-8444-444444444444',
  PERFORMANCE_GREEN_APRIL: '20260401-aaaa-4aaa-8aaa-202604010001',
  PERFORMANCE_GREEN_ARCHIVED_MARCH: '20260301-aaaa-4aaa-8aaa-202603010001',
  PERFORMANCE_GREEN_DRAFT_MAY: '20260501-aaaa-4aaa-8aaa-202605010001',
  PERFORMANCE_NORTHSTAR_APRIL: '20260401-bbbb-4bbb-8bbb-202604010002',
  PROFILE_ADMIN_GROWTHLAB: '77777777-7777-4777-8777-777777777777',
  PROFILE_CLIENT_GREEN: '66666666-6666-4666-8666-666666666666',
  PROFILE_TEAM_MIA: 'abababab-abab-4bab-8bab-abababababab',
  PROJECT_CAMPAIGN_SETUP: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  PROJECT_LANDING_PAGE: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  PROJECT_REPORTING: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  REPORT_APRIL_2026: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  TASK_GA4_CONVERSION: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
  TASK_INTERNAL_DEBUGGING: '123e4567-e89b-42d3-a456-426614174001',
  TASK_MONTHLY_REPORT: '123e4567-e89b-42d3-a456-426614174000',
  TASK_REVIEW_CREATIVES: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  UPDATE_INTERNAL_TRACKING: '123e4567-e89b-42d3-a456-426614174003',
  UPDATE_WEEKLY_MAY_8: '123e4567-e89b-42d3-a456-426614174002',
  USER_ADMIN_GROWTHLAB: '99999999-9999-4999-8999-999999999999',
  USER_CLIENT_GREEN: '88888888-8888-4888-8888-888888888888',
  USER_TEAM_MIA: 'bcbcbcbc-bcbc-4cbc-8cbc-bcbcbcbcbcbc',
})

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setUTCDate(nextDate.getUTCDate() + days)
  return nextDate
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10)
}

function formatShortDate(date) {
  return date.toISOString().slice(5, 10)
}

function getReactivationTouchPlan(dayIndex, weekIndex) {
  if (weekIndex <= 2) {
    return {
      email: dayIndex % 3 === 0 ? 13 : 0,
      manager_calls: 0,
      sms: dayIndex % 4 === 0 ? 13 : 14,
    }
  }

  if (weekIndex <= 7) {
    const peakBoost = weekIndex === 6 || weekIndex === 7 ? 8 : 0

    return {
      email: 25 + peakBoost,
      manager_calls: weekIndex >= 4 ? 12 + peakBoost : 0,
      sms: 27 + peakBoost,
    }
  }

  if (weekIndex <= 13) {
    const spike = weekIndex === 11 ? 12 : 0

    return {
      email: 27 + spike,
      manager_calls: 18 + spike,
      sms: 29 + (spike ? 0 : 0),
    }
  }

  return {
    email: Math.max(5, 24 - (weekIndex - 13) * 8),
    manager_calls: Math.max(0, 18 - (weekIndex - 13) * 7),
    sms: Math.max(0, 22 - (weekIndex - 13) * 8),
  }
}

function createGreenDentalReactivationCampaignExecution() {
  const startDate = new Date(Date.UTC(2026, 5, 1))
  const activitySeries = []
  let cumulativeBookings = 0
  let calendarOffset = 0

  while (activitySeries.length < 75) {
    const date = addDays(startDate, calendarOffset)
    calendarOffset += 1

    const dayOfWeek = date.getUTCDay()

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue
    }

    const dayIndex = activitySeries.length
    const weekIndex = Math.floor(dayIndex / 5) + 1
    const touches = getReactivationTouchPlan(dayIndex, weekIndex)
    const bookingLift = weekIndex <= 2
      ? 0.1
      : weekIndex <= 7
        ? 0.45
        : weekIndex <= 13
          ? 0.65
          : 0.35

    cumulativeBookings = Math.min(40, cumulativeBookings + bookingLift)
    activitySeries.push({
      ...touches,
      cumulative_bookings: Number(cumulativeBookings.toFixed(1)),
      date: formatIsoDate(date),
      label: formatShortDate(date),
    })
  }

  return {
    activity_series: activitySeries,
    assumptions: [
      'Business days only. Dates are illustrative and assume a Monday June 1, 2026 start.',
      'Volumes are realistic planning estimates after approximately 5% touch attrition.',
    ],
    kpis: [
      {
        display_order: 10,
        id: 'reactivation-kpi-patients',
        label: 'Patients',
        tone: 'neutral',
        value: 804,
      },
      {
        display_order: 20,
        id: 'reactivation-kpi-sms',
        label: 'SMS sent',
        tone: 'blue',
        value: '~1,660',
      },
      {
        display_order: 30,
        id: 'reactivation-kpi-emails',
        label: 'Emails sent',
        tone: 'green',
        value: '~1,580',
      },
      {
        display_order: 40,
        id: 'reactivation-kpi-calls',
        label: 'Manager calls',
        tone: 'orange',
        value: '~870',
      },
      {
        display_order: 50,
        id: 'reactivation-kpi-bookings',
        label: 'Projected bookings',
        tone: 'amber',
        value: '38-42',
      },
      {
        display_order: 60,
        id: 'reactivation-kpi-duration',
        label: 'Duration',
        tone: 'neutral',
        value: '~15 wk',
      },
    ],
    left_axis_label: 'Touches per day',
    right_axis_label: 'Cumulative bookings',
    subtitle: 'Planned reactivation touches across SMS, email, and manager calls with cumulative booking projection.',
    title: 'Patient Reactivation Campaign Plan',
    tracks: [
      {
        display_order: 10,
        end_week: 2,
        id: 'track-r-pilot',
        label: 'Track R - pilot (wk 1-2)',
        start_week: 1,
        tone: 'orange',
      },
      {
        display_order: 20,
        end_week: 7,
        id: 'track-a-gentle',
        label: 'Track A - gentle reactivation (wk 2-7)',
        start_week: 2,
        tone: 'green',
      },
      {
        display_order: 30,
        end_week: 13,
        id: 'track-b-core',
        label: 'Track B - core reactivation (wk 5-13)',
        start_week: 5,
        tone: 'blue',
      },
      {
        display_order: 40,
        end_week: 15,
        id: 'track-c-winback',
        label: 'Track C - win-back (wk 10-15)',
        start_week: 10,
        tone: 'purple',
      },
    ],
  }
}

export const portalSeedData = Object.freeze({
  activity_events: [],
  client_invitations: [
    {
      accepted_at: null,
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      email: 'new.client@greendental.example',
      id: SEED_IDS.CLIENT_INVITATION_GREEN,
      invited_by: SEED_IDS.PROFILE_ADMIN_GROWTHLAB,
      name: 'New Green Dental Client',
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      status: CLIENT_INVITATION_STATUSES.PENDING,
      token: 'invite-green-dental-client',
      updated_at: '2026-05-01T09:00:00.000Z',
    },
  ],
  client_memberships: [
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      id: SEED_IDS.MEMBERSHIP_CLIENT_GREEN,
      role: CLIENT_MEMBERSHIP_ROLES.OWNER,
      updated_at: '2026-05-01T09:00:00.000Z',
      user_id: SEED_IDS.USER_CLIENT_GREEN,
    },
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      id: SEED_IDS.MEMBERSHIP_TEAM_GREEN,
      role: CLIENT_MEMBERSHIP_ROLES.VIEWER,
      updated_at: '2026-05-01T09:00:00.000Z',
      user_id: SEED_IDS.USER_TEAM_MIA,
    },
  ],
  clients: [
    {
      agency_id: SEED_IDS.AGENCY_GROWTHLAB,
      created_at: '2026-05-01T09:00:00.000Z',
      current_focus: [
        'Meta Ads campaign optimization',
        'Landing page conversion improvements',
        'Follow-up automation setup',
      ],
      id: SEED_IDS.CLIENT_GREEN_DENTAL,
      logo_url: '',
      name: 'Green Dental Clinic',
      portal_slug: 'green-dental-clinic',
      primary_contact_email: 'sarah@greendental.example',
      primary_contact_name: 'Sarah Johnson',
      status: CLIENT_STATUSES.ON_TRACK,
      updated_at: '2026-05-08T09:00:00.000Z',
    },
    {
      agency_id: SEED_IDS.AGENCY_GROWTHLAB,
      created_at: '2026-05-02T09:00:00.000Z',
      current_focus: [
        'Local SEO cleanup',
        'New patient offer validation',
      ],
      id: SEED_IDS.CLIENT_NORTHSTAR_DENTAL,
      logo_url: '',
      name: 'Northstar Dental Studio',
      portal_slug: 'northstar-dental-studio',
      primary_contact_email: 'ops@northstar.example',
      primary_contact_name: 'Olivia Chen',
      status: CLIENT_STATUSES.WAITING_CLIENT,
      updated_at: '2026-05-08T09:00:00.000Z',
    },
  ],
  dashboard_links: [
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Executive marketing performance dashboard covering spend, lead flow, CPL, and conversion trends.',
      display_order: 10,
      embed_url: 'https://lookerstudio.google.com/embed/reporting/demo-green-dental',
      fallback_message: 'Marketing dashboard is being prepared.',
      id: SEED_IDS.DASHBOARD_GREEN_APRIL,
      last_checked_at: '2026-05-08T09:00:00.000Z',
      name: 'Marketing Performance Dashboard',
      provider: DASHBOARD_PROVIDERS.LOOKER_STUDIO,
      public_url: 'https://lookerstudio.google.com/reporting/demo-green-dental',
      show_on_overview: true,
      status: DASHBOARD_LINK_STATUSES.ACTIVE,
      updated_at: '2026-05-08T09:00:00.000Z',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    },
  ],
  needed_from_client: [
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-06T10:00:00.000Z',
      description: 'Confirm the final discount and treatment package wording before campaign scaling.',
      due_date: '2026-05-10',
      id: SEED_IDS.NEEDED_OFFER_DETAILS,
      related_link: '',
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Confirm final offer details',
      updated_at: '2026-05-06T10:00:00.000Z',
    },
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-05T10:00:00.000Z',
      description: 'Approve or request edits on the second creative batch.',
      due_date: '2026-05-09',
      id: SEED_IDS.NEEDED_CREATIVE_APPROVAL,
      related_link: 'https://drive.google.com/example',
      status: NEEDED_ACTION_STATUSES.PENDING,
      title: 'Approve creative batch #2',
      updated_at: '2026-05-05T10:00:00.000Z',
    },
  ],
  performance_dashboard_periods: [
    {
      account_manager: 'Sarah Johnson',
      agency_contact: 'sarah@growthlab.example',
      attribution_note: 'Manual report compiled from CRM, ad platform exports, and Looker Studio. Revenue uses last-click attribution where available.',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      content: {
        appendix_tables: [
          {
            columns: ['Campaign', 'Spend', 'Qualified Leads', 'CPL', 'Status'],
            display_order: 10,
            id: 'table-green-april-campaigns',
            rows: [
              ['Dental Implants Search', '$3,200', '42', '$76.19', 'Scaling'],
              ['Emergency Dentist Meta', '$1,850', '21', '$88.10', 'Review quality'],
              ['Teeth Whitening Retargeting', '$900', '16', '$56.25', 'Stable'],
            ],
            title: 'Top Campaigns',
          },
        ],
        campaign_execution: createGreenDentalReactivationCampaignExecution(),
        channel_breakdown: [
          {
            channel: PERFORMANCE_CHANNELS.GOOGLE_ADS,
            conversion_rate: 0.118,
            cpl: 76.19,
            display_order: 10,
            id: 'channel-google-ads-april',
            leads: 68,
            qualified_leads: 42,
            revenue: 39200,
            roas: 5.4,
            spend: 3200,
            summary: 'Search campaigns produced the highest-quality appointment requests.',
          },
          {
            channel: PERFORMANCE_CHANNELS.META_ADS,
            conversion_rate: 0.074,
            cpl: 88.1,
            display_order: 20,
            id: 'channel-meta-ads-april',
            leads: 44,
            qualified_leads: 21,
            revenue: 18600,
            roas: 3.1,
            spend: 1850,
            summary: 'Meta volume improved, but qualification needs tightening before scaling.',
          },
          {
            channel: PERFORMANCE_CHANNELS.SEO,
            conversion_rate: 0.092,
            cpl: 0,
            display_order: 30,
            id: 'channel-seo-april',
            leads: 29,
            qualified_leads: 18,
            revenue: 15400,
            roas: null,
            spend: 0,
            summary: 'Organic appointment requests increased after local service page updates.',
          },
        ],
        executive_summary: {
          main_issue: 'Meta lead quality is improving but still below the standard needed for budget scaling.',
          main_win: 'Qualified leads increased while blended CPL decreased.',
          narrative: 'April performance was positive. Marketing generated more qualified appointment opportunities, search campaigns produced the most reliable lead quality, and organic traffic started contributing more booked consultations.',
          next_focus: 'Scale search cautiously, tighten Meta qualification rules, and improve landing page proof around implant consultations.',
        },
        funnel: {
          booked_calls: 48,
          clicks: 2140,
          impressions: 84200,
          leads: 141,
          qualified_leads: 81,
          revenue: 73200,
          sales: 19,
          spend: 5950,
          visitors: 1780,
        },
        goals: [
          {
            actual: 81,
            display_order: 10,
            id: 'goal-qualified-leads-april',
            metric: 'qualified_leads',
            name: 'Qualified Leads',
            note: 'Target exceeded mainly through search and organic lead quality.',
            status: PERFORMANCE_GOAL_STATUSES.AHEAD,
            target: 72,
            target_date: '2026-04-30',
          },
          {
            actual: 73_200,
            display_order: 20,
            id: 'goal-attributed-revenue-april',
            metric: 'revenue_attributed',
            name: 'Attributed Revenue',
            note: 'Revenue is directional because offline close tracking is manually reconciled.',
            status: PERFORMANCE_GOAL_STATUSES.ON_TRACK,
            target: 70_000,
            target_date: '2026-04-30',
          },
        ],
        hero_metric: {
          benchmark: 'Goal: 72',
          definition: 'Leads approved as real appointment opportunities after front desk review.',
          delta_abs: '+13',
          delta_pct: 19.1,
          goal: 72,
          goal_pct: 112.5,
          label: 'Qualified Leads',
          source: 'CRM export + manual review',
          status: PERFORMANCE_METRIC_STATUSES.AHEAD,
          unit: '',
          value: 81,
        },
        insights: [
          {
            body: 'Search lead quality improved after negative keyword cleanup and tighter appointment-intent ad copy.',
            chart_ref: 'trend-qualified-leads-april',
            display_order: 10,
            id: 'insight-search-quality-april',
            severity: PERFORMANCE_INSIGHT_SEVERITIES.POSITIVE,
            title: 'Search quality improved',
          },
          {
            body: 'Meta campaigns produced cheaper form submissions, but the front desk marked more of them as low-intent. We should tighten the offer and qualifying questions before scaling.',
            chart_ref: 'channel-meta-ads-april',
            display_order: 20,
            id: 'insight-meta-quality-april',
            severity: PERFORMANCE_INSIGHT_SEVERITIES.WARNING,
            title: 'Meta needs qualification work',
          },
        ],
        kpi_cards: [
          {
            benchmark: 'Goal: 72',
            definition: 'Leads approved as real appointment opportunities after review.',
            delta_abs: '+13',
            delta_pct: 19.1,
            display_order: 10,
            goal: 72,
            id: 'kpi-qualified-leads-april',
            name: 'Qualified Leads',
            prior_value: 68,
            source: 'CRM export',
            sparkline: [58, 61, 64, 68, 74, 81],
            status: PERFORMANCE_METRIC_STATUSES.AHEAD,
            unit: '',
            value: 81,
          },
          {
            benchmark: 'Target: <$80',
            definition: 'Total spend divided by qualified leads.',
            delta_abs: '-$8.40',
            delta_pct: -10.2,
            display_order: 20,
            goal: 80,
            id: 'kpi-blended-cpl-april',
            name: 'Blended CPL',
            prior_value: 81.86,
            source: 'Ad exports + CRM export',
            sparkline: [86, 84, 82, 80, 76, 73.46],
            status: PERFORMANCE_METRIC_STATUSES.AHEAD,
            unit: '$',
            value: 73.46,
          },
          {
            benchmark: 'Goal: $70,000',
            definition: 'Revenue connected to marketing leads where source tracking is available.',
            delta_abs: '+$9,800',
            delta_pct: 15.5,
            display_order: 30,
            goal: 70000,
            id: 'kpi-revenue-april',
            name: 'Attributed Revenue',
            prior_value: 63400,
            source: 'CRM manual reconciliation',
            sparkline: [52000, 56600, 59800, 63400, 68200, 73200],
            status: PERFORMANCE_METRIC_STATUSES.ON_TRACK,
            unit: '$',
            value: 73200,
          },
          {
            benchmark: 'Target: 9%',
            definition: 'Website visitors who became leads.',
            delta_abs: '+1.1pp',
            delta_pct: 15.1,
            display_order: 40,
            goal: 0.09,
            id: 'kpi-conversion-rate-april',
            name: 'Lead Conversion Rate',
            prior_value: 0.079,
            source: 'GA4 + form tracking',
            sparkline: [0.068, 0.071, 0.075, 0.079, 0.083, 0.09],
            status: PERFORMANCE_METRIC_STATUSES.ON_TRACK,
            unit: '%',
            value: 0.09,
          },
        ],
        next_steps: [
          {
            description: 'Move budget toward high-intent search terms while keeping CPL under target.',
            display_order: 10,
            due_date: '2026-05-10',
            id: 'next-step-search-scale-april',
            owner: 'GrowthLab',
            priority: PERFORMANCE_NEXT_STEP_PRIORITIES.HIGH,
            title: 'Scale winning search campaigns cautiously',
          },
          {
            description: 'Add stronger qualification questions before asking the client to increase Meta budget.',
            display_order: 20,
            due_date: '2026-05-12',
            id: 'next-step-meta-qualification-april',
            owner: 'GrowthLab',
            priority: PERFORMANCE_NEXT_STEP_PRIORITIES.MEDIUM,
            title: 'Improve Meta lead qualification',
          },
        ],
        service_sections: [
          {
            display_order: 10,
            id: 'service-paid-ads-april',
            insights: [
              'Google Ads drove the most reliable appointment requests.',
              'Meta should stay in test mode until quality improves.',
            ],
            metrics: {
              cpl: 79.84,
              qualified_leads: 63,
              roas: 4.45,
              spend: 5050,
            },
            next_actions: [
              'Increase exact-match search budget gradually.',
              'Refine Meta form questions.',
            ],
            service_type: PERFORMANCE_SERVICE_TYPES.PAID_ADS,
            summary: 'Paid acquisition produced the majority of qualified leads while CPL moved below target.',
          },
        ],
        trends: [
          {
            annotations: [
              {
                date: '2026-04-15',
                label: 'Negative keyword cleanup',
              },
              {
                date: '2026-04-22',
                label: 'Landing page proof update',
              },
            ],
            comparison_series: [
              { date: '2026-03-01', value: 54 },
              { date: '2026-03-08', value: 57 },
              { date: '2026-03-15', value: 60 },
              { date: '2026-03-22', value: 64 },
              { date: '2026-03-29', value: 68 },
            ],
            display_order: 10,
            goal_value: 72,
            granularity: PERFORMANCE_TREND_GRANULARITIES.WEEKLY,
            id: 'trend-qualified-leads-april',
            metric: 'qualified_leads',
            series: [
              { date: '2026-04-01', value: 61 },
              { date: '2026-04-08', value: 65 },
              { date: '2026-04-15', value: 71 },
              { date: '2026-04-22', value: 77 },
              { date: '2026-04-30', value: 81 },
            ],
          },
        ],
      },
      created_at: '2026-05-05T09:00:00.000Z',
      created_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
      data_confidence: PERFORMANCE_DATA_CONFIDENCE.MEDIUM,
      data_mode: PERFORMANCE_DATA_MODES.MANUAL,
      id: SEED_IDS.PERFORMANCE_GREEN_APRIL,
      last_updated_at: '2026-05-05T09:00:00.000Z',
      period_end: '2026-04-30',
      period_start: '2026-04-01',
      published_at: '2026-05-05T10:00:00.000Z',
      source_summary: 'Manual dashboard compiled from CRM, ad platform exports, GA4, and Looker Studio.',
      status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
      title: 'April 2026 Performance Dashboard',
      updated_at: '2026-05-05T10:00:00.000Z',
      updated_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
    },
    {
      account_manager: 'Sarah Johnson',
      agency_contact: 'sarah@growthlab.example',
      attribution_note: 'Archived March dashboard.',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      content: {
        executive_summary: {
          main_issue: 'Landing page conversion was below target.',
          main_win: 'Search campaigns established baseline lead flow.',
          narrative: 'March established the first reliable lead generation baseline.',
          next_focus: 'Improve conversion rate and lead qualification.',
        },
        hero_metric: {
          label: 'Qualified Leads',
          source: 'Manual',
          status: PERFORMANCE_METRIC_STATUSES.ON_TRACK,
          value: 68,
        },
        insights: [
          {
            body: 'Search produced consistent lead volume, but landing page conversion was still early.',
            id: 'insight-march-baseline',
            title: 'Baseline established',
          },
        ],
        kpi_cards: [
          {
            id: 'kpi-march-qualified-leads',
            name: 'Qualified Leads',
            source: 'CRM export',
            value: 68,
          },
        ],
        next_steps: [
          {
            id: 'next-step-march-lp',
            title: 'Improve landing page proof',
          },
        ],
      },
      created_at: '2026-04-04T09:00:00.000Z',
      created_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
      data_confidence: PERFORMANCE_DATA_CONFIDENCE.MEDIUM,
      data_mode: PERFORMANCE_DATA_MODES.MANUAL,
      id: SEED_IDS.PERFORMANCE_GREEN_ARCHIVED_MARCH,
      last_updated_at: '2026-04-04T09:00:00.000Z',
      period_end: '2026-03-31',
      period_start: '2026-03-01',
      published_at: '2026-04-04T10:00:00.000Z',
      source_summary: 'Manual dashboard compiled from campaign exports.',
      status: PERFORMANCE_DASHBOARD_STATUSES.ARCHIVED,
      title: 'March 2026 Performance Dashboard',
      updated_at: '2026-04-04T10:00:00.000Z',
      updated_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
    },
    {
      account_manager: 'Sarah Johnson',
      agency_contact: 'sarah@growthlab.example',
      attribution_note: '',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      content: {
        executive_summary: {
          main_issue: '',
          main_win: '',
          narrative: '',
          next_focus: '',
        },
        hero_metric: {
          label: '',
          value: '',
        },
        insights: [],
        kpi_cards: [],
        next_steps: [],
      },
      created_at: '2026-05-12T09:00:00.000Z',
      created_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
      data_confidence: PERFORMANCE_DATA_CONFIDENCE.ESTIMATED,
      data_mode: PERFORMANCE_DATA_MODES.JSON_IMPORT,
      id: SEED_IDS.PERFORMANCE_GREEN_DRAFT_MAY,
      last_updated_at: '',
      period_end: '2026-05-31',
      period_start: '2026-05-01',
      published_at: null,
      source_summary: '',
      status: PERFORMANCE_DASHBOARD_STATUSES.DRAFT,
      title: 'May 2026 Performance Draft',
      updated_at: '2026-05-12T09:00:00.000Z',
      updated_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
    },
    {
      account_manager: 'Sarah Johnson',
      agency_contact: 'sarah@growthlab.example',
      attribution_note: 'Northstar demo performance period.',
      client_id: SEED_IDS.CLIENT_NORTHSTAR_DENTAL,
      content: {
        executive_summary: {
          main_issue: 'Waiting on offer approval.',
          main_win: 'Local SEO cleanup completed.',
          narrative: 'Northstar has early setup data but is not ready for client-facing performance review.',
          next_focus: 'Approve offer and launch paid acquisition.',
        },
        hero_metric: {
          label: 'Booked Calls',
          source: 'Manual',
          value: 12,
        },
        insights: [
          {
            body: 'Local SEO cleanup is complete, but paid campaigns are waiting on approval.',
            id: 'insight-northstar-setup',
            title: 'Setup waiting on client',
          },
        ],
        kpi_cards: [
          {
            id: 'kpi-northstar-booked-calls',
            name: 'Booked Calls',
            value: 12,
          },
        ],
        next_steps: [
          {
            id: 'next-step-northstar-offer',
            title: 'Approve new patient offer',
          },
        ],
      },
      created_at: '2026-05-05T09:00:00.000Z',
      created_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
      data_confidence: PERFORMANCE_DATA_CONFIDENCE.LOW,
      data_mode: PERFORMANCE_DATA_MODES.MANUAL,
      id: SEED_IDS.PERFORMANCE_NORTHSTAR_APRIL,
      last_updated_at: '2026-05-05T09:00:00.000Z',
      period_end: '2026-04-30',
      period_start: '2026-04-01',
      published_at: '2026-05-05T10:00:00.000Z',
      source_summary: 'Manual setup period.',
      status: PERFORMANCE_DASHBOARD_STATUSES.PUBLISHED,
      title: 'April 2026 Northstar Performance Dashboard',
      updated_at: '2026-05-05T10:00:00.000Z',
      updated_by: SEED_IDS.USER_ADMIN_GROWTHLAB,
    },
  ],
  profiles: [
    {
      agency_id: SEED_IDS.AGENCY_GROWTHLAB,
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      email: 'client@greendental.example',
      id: SEED_IDS.PROFILE_CLIENT_GREEN,
      name: 'Green Dental Client',
      role: USER_ROLES.CLIENT_USER,
      updated_at: '2026-05-08T09:00:00.000Z',
      user_id: SEED_IDS.USER_CLIENT_GREEN,
    },
    {
      agency_id: SEED_IDS.AGENCY_GROWTHLAB,
      client_id: null,
      created_at: '2026-05-01T09:00:00.000Z',
      email: 'admin@growthlab.example',
      id: SEED_IDS.PROFILE_ADMIN_GROWTHLAB,
      name: 'GrowthLab Admin',
      role: USER_ROLES.AGENCY_ADMIN,
      updated_at: '2026-05-08T09:00:00.000Z',
      user_id: SEED_IDS.USER_ADMIN_GROWTHLAB,
    },
    {
      agency_id: SEED_IDS.AGENCY_GROWTHLAB,
      client_id: null,
      client_ids: [SEED_IDS.CLIENT_GREEN_DENTAL],
      created_at: '2026-05-01T09:00:00.000Z',
      email: 'mia@growthlab.example',
      id: SEED_IDS.PROFILE_TEAM_MIA,
      name: 'Mia Carter',
      role: USER_ROLES.AGENCY_TEAM,
      updated_at: '2026-05-08T09:00:00.000Z',
      user_id: SEED_IDS.USER_TEAM_MIA,
    },
  ],
  projects: [
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Initial campaign structure, tracking, landing page, and reporting setup.',
      end_date: '2026-05-31',
      id: SEED_IDS.PROJECT_CAMPAIGN_SETUP,
      name: 'Campaign Setup',
      progress_percent: 80,
      start_date: '2026-05-01',
      status: 'in_progress',
      updated_at: '2026-05-08T09:00:00.000Z',
    },
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Improve landing page conversion and follow-up clarity.',
      end_date: '2026-05-31',
      id: SEED_IDS.PROJECT_LANDING_PAGE,
      name: 'Landing Page Updates',
      progress_percent: 60,
      start_date: '2026-05-01',
      status: 'in_progress',
      updated_at: '2026-05-08T09:00:00.000Z',
    },
    {
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Dashboard embed and monthly reporting workflow.',
      end_date: '2026-05-31',
      id: SEED_IDS.PROJECT_REPORTING,
      name: 'Reporting Setup',
      progress_percent: 40,
      start_date: '2026-05-01',
      status: 'in_progress',
      updated_at: '2026-05-08T09:00:00.000Z',
    },
  ],
  reports: [
    {
      client_decisions_needed: 'Approve the next creative batch and confirm final offer wording.',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-01T09:00:00.000Z',
      dashboard_url: 'https://lookerstudio.google.com/reporting/demo-green-dental',
      id: SEED_IDS.REPORT_APRIL_2026,
      next_actions: 'Scale winning ad angle, improve landing page proof section, and monitor CPL stability.',
      pdf_url: '',
      period_end: '2026-04-30',
      period_start: '2026-04-01',
      problems: 'Conversion data is still early and needs another week before larger budget decisions.',
      published_at: '2026-05-04T09:00:00.000Z',
      status: REPORT_STATUSES.PUBLISHED,
      summary: 'April launched the first paid acquisition structure and produced stable early lead quality. The next priority is scaling only after more conversion data is available.',
      title: 'April 2026 Monthly Summary',
      updated_at: '2026-05-04T09:00:00.000Z',
      wins: 'First campaign structure launched, tracking baseline connected, and three ad angles entered testing.',
    },
  ],
  tasks: [
    {
      assignee_name: 'Mia Carter',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      client_visible: true,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Client approval is needed before the next paid campaign push.',
      due_date: '2026-05-09',
      id: SEED_IDS.TASK_REVIEW_CREATIVES,
      internal_note: 'Client should approve creative batch before the next paid push.',
      project_id: SEED_IDS.PROJECT_CAMPAIGN_SETUP,
      sort_order: 10,
      status: TASK_STATUSES.WAITING_CLIENT,
      title: 'Review new ad creatives',
      updated_at: '2026-05-08T09:00:00.000Z',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    },
    {
      assignee_name: 'Leo Brooks',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      client_visible: true,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Connect primary GA4 conversion event to campaign reporting.',
      due_date: '2026-05-11',
      id: SEED_IDS.TASK_GA4_CONVERSION,
      internal_note: '',
      project_id: SEED_IDS.PROJECT_REPORTING,
      sort_order: 20,
      status: TASK_STATUSES.IN_PROGRESS,
      title: 'Connect GA4 conversion event',
      updated_at: '2026-05-08T09:00:00.000Z',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    },
    {
      assignee_name: 'Nora Lane',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      client_visible: true,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Prepare concise client-facing summary for April performance.',
      due_date: '2026-05-12',
      id: SEED_IDS.TASK_MONTHLY_REPORT,
      internal_note: '',
      project_id: SEED_IDS.PROJECT_REPORTING,
      sort_order: 30,
      status: TASK_STATUSES.IN_PROGRESS,
      title: 'Prepare monthly report',
      updated_at: '2026-05-08T09:00:00.000Z',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    },
    {
      assignee_name: 'Internal Team',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      client_visible: false,
      created_at: '2026-05-01T09:00:00.000Z',
      description: 'Internal implementation note; must never render to client users.',
      due_date: '2026-05-09',
      id: SEED_IDS.TASK_INTERNAL_DEBUGGING,
      internal_note: 'Mismatch between form-submit event and CRM lead count. Keep this internal.',
      project_id: SEED_IDS.PROJECT_REPORTING,
      sort_order: 99,
      status: TASK_STATUSES.BLOCKED,
      title: 'Debug internal tracking mismatch',
      updated_at: '2026-05-08T09:00:00.000Z',
      visibility: VISIBILITY.INTERNAL,
    },
  ],
  updates: [
    {
      body: 'This week we launched the first campaign structure, connected basic tracking, and started testing 3 ad angles. Early traffic quality looks stable, but we still need more conversion data before larger budget decisions.',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-08T09:00:00.000Z',
      created_by: SEED_IDS.PROFILE_ADMIN_GROWTHLAB,
      id: SEED_IDS.UPDATE_WEEKLY_MAY_8,
      project_id: SEED_IDS.PROJECT_CAMPAIGN_SETUP,
      title: 'Weekly progress update',
      updated_at: '2026-05-08T09:00:00.000Z',
      visibility: VISIBILITY.CLIENT_VISIBLE,
    },
    {
      body: 'Internal tracking mismatch is under investigation.',
      client_id: SEED_IDS.CLIENT_GREEN_DENTAL,
      created_at: '2026-05-08T08:00:00.000Z',
      created_by: SEED_IDS.PROFILE_ADMIN_GROWTHLAB,
      id: SEED_IDS.UPDATE_INTERNAL_TRACKING,
      project_id: SEED_IDS.PROJECT_REPORTING,
      title: 'Internal tracking note',
      updated_at: '2026-05-08T08:00:00.000Z',
      visibility: VISIBILITY.INTERNAL,
    },
  ],
})
