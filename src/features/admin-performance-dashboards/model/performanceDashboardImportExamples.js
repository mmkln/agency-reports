export const PERFORMANCE_DASHBOARD_IMPORT_EXAMPLE_TYPES = Object.freeze({
  CAMPAIGN_EXECUTION: 'campaign_execution',
  PERFORMANCE_SUMMARY: 'performance_summary',
})

function createPerformanceSummaryExampleJson(clientId) {
  return JSON.stringify({
    client_id: clientId || '00000000-0000-4000-8000-000000000000',
    title: 'June 2026 Marketing Performance',
    period_start: '2026-06-01',
    period_end: '2026-06-30',
    data_confidence: 'high',
    last_updated_at: '2026-07-01T09:00:00.000Z',
    attribution_note: 'Manual import from GA4, Google Ads, and CRM export.',
    source_summary: 'GA4, Google Ads, Meta Ads, CRM export',
    content: {
      executive_summary: {
        narrative: 'Marketing generated more qualified demand this period while cost per lead stayed within target.',
        main_win: 'Qualified leads increased from paid search.',
        main_issue: 'Meta lead quality still needs filtering.',
        next_focus: 'Shift budget toward higher-intent campaigns.',
      },
      hero_metric: {
        label: 'Qualified Leads',
        value: 81,
        unit: '',
        delta_pct: 18,
        goal_pct: 108,
        status: 'ahead',
        source: 'CRM export',
      },
      kpi_cards: [
        {
          id: 'qualified-leads',
          label: 'Qualified Leads',
          value: 81,
          delta_pct: 18,
          goal: 75,
          status: 'ahead',
          source: 'CRM export',
          definition: 'Sales-approved leads for this reporting period.',
        },
      ],
      goals: [
        {
          id: 'qualified-leads-goal',
          name: 'Qualified leads',
          target: 75,
          actual: 81,
          status: 'ahead',
          note: 'Ahead of monthly goal.',
        },
      ],
      channel_breakdown: [
        {
          id: 'google-ads',
          channel: 'google_ads',
          spend: 4200,
          qualified_leads: 45,
          cpl: 93.33,
          summary: 'Search campaigns produced the strongest lead quality.',
        },
      ],
      agency_work: {
        completed: [
          'Launched new search campaign structure.',
          'Reviewed CRM lead quality with the client team.',
        ],
        active: [
          'Monitoring Meta lead quality and filtering rules.',
        ],
        next: [
          'Prepare the next landing page test brief.',
        ],
      },
      insights: [
        {
          id: 'search-quality',
          title: 'Search lead quality improved',
          body: 'Higher-intent keywords produced more booked consultations than broad Meta targeting.',
          severity: 'positive',
        },
      ],
      next_steps: [
        {
          id: 'budget-shift',
          title: 'Shift budget toward high-intent search',
          description: 'Move 15% of Meta prospecting budget into the best-performing search campaigns.',
          owner: 'Team',
          due_date: '2026-07-08',
          priority: 'high',
        },
      ],
    },
  }, null, 2)
}

function createCampaignExecutionExampleJson(clientId) {
  return JSON.stringify({
    client_id: clientId || '00000000-0000-4000-8000-000000000000',
    title: 'June 2026 Patient Reactivation Campaign',
    period_start: '2026-06-01',
    period_end: '2026-09-11',
    data_confidence: 'estimated',
    last_updated_at: '2026-05-16T09:00:00.000Z',
    attribution_note: 'Planning model based on patient list size, business-day touch limits, and estimated booking response rates.',
    source_summary: 'Manual campaign plan, CRM patient count, and estimated touch attrition assumptions.',
    content: {
      executive_summary: {
        narrative: 'This dashboard models a 15-week patient reactivation campaign. The plan stages outreach from low-friction SMS/email touches into manager follow-up calls, with cumulative bookings projected to reach 38-42 by the end of the win-back track.',
        main_win: 'The campaign gives the client clear visibility into expected outreach volume and booking lift before execution starts.',
        main_issue: 'Bookings are projections until campaign responses begin and the front desk validates scheduled appointments.',
        next_focus: 'Launch the pilot track, monitor early response quality, and adjust call volume before the core reactivation phase.',
      },
      hero_metric: {
        label: 'Projected Bookings',
        value: '38-42',
        unit: '',
        delta_pct: null,
        goal_pct: 100,
        status: 'on_track',
        source: 'Manual planning model',
        definition: 'Estimated cumulative bookings from the full reactivation sequence.',
      },
      kpi_cards: [
        {
          id: 'patients',
          label: 'Patients',
          value: 804,
          status: 'neutral',
          source: 'CRM list export',
          definition: 'Patients included in the eligible reactivation audience.',
        },
        {
          id: 'projected-bookings',
          label: 'Projected Bookings',
          value: '38-42',
          goal: 40,
          goal_pct: 100,
          status: 'on_track',
          source: 'Manual planning model',
          definition: 'Expected bookings after the complete campaign sequence.',
        },
      ],
      campaign_execution: {
        title: 'Patient Reactivation Campaign Plan',
        subtitle: 'Planned reactivation touches across SMS, email, and manager calls with cumulative booking projection.',
        left_axis_label: 'Touches per day',
        right_axis_label: 'Cumulative bookings',
        kpis: [
          { id: 'patients', label: 'Patients', value: 804, tone: 'neutral' },
          { id: 'sms-sent', label: 'SMS sent', value: '~1,660', tone: 'blue' },
          { id: 'emails-sent', label: 'Emails sent', value: '~1,580', tone: 'green' },
          { id: 'manager-calls', label: 'Manager calls', value: '~870', tone: 'orange' },
          { id: 'projected-bookings', label: 'Proj. bookings', value: '38-42', tone: 'amber' },
          { id: 'duration', label: 'Duration', value: '~15 wk', tone: 'neutral' },
        ],
        tracks: [
          { id: 'track-r', label: 'Track R - pilot (wk 1-2)', start_week: 1, end_week: 2, tone: 'orange' },
          { id: 'track-a', label: 'Track A - gentle reactivation (wk 2-7)', start_week: 2, end_week: 7, tone: 'green' },
          { id: 'track-b', label: 'Track B - core reactivation (wk 5-13)', start_week: 5, end_week: 13, tone: 'blue' },
          { id: 'track-c', label: 'Track C - win-back (wk 10-15)', start_week: 10, end_week: 15, tone: 'purple' },
        ],
        activity_series: [
          { date: '2026-06-01', label: '06-01', sms: 14, email: 0, manager_calls: 0, cumulative_bookings: 0 },
          { date: '2026-06-08', label: '06-08', sms: 27, email: 13, manager_calls: 0, cumulative_bookings: 1 },
          { date: '2026-06-15', label: '06-15', sms: 27, email: 13, manager_calls: 0, cumulative_bookings: 2 },
          { date: '2026-06-22', label: '06-22', sms: 27, email: 25, manager_calls: 12, cumulative_bookings: 5 },
          { date: '2026-06-29', label: '06-29', sms: 27, email: 25, manager_calls: 12, cumulative_bookings: 8 },
          { date: '2026-07-06', label: '07-06', sms: 38, email: 34, manager_calls: 13, cumulative_bookings: 11 },
          { date: '2026-07-13', label: '07-13', sms: 34, email: 35, manager_calls: 18, cumulative_bookings: 14 },
          { date: '2026-07-20', label: '07-20', sms: 29, email: 25, manager_calls: 15, cumulative_bookings: 17 },
          { date: '2026-07-27', label: '07-27', sms: 29, email: 27, manager_calls: 18, cumulative_bookings: 20 },
          { date: '2026-08-03', label: '08-03', sms: 29, email: 27, manager_calls: 18, cumulative_bookings: 24 },
          { date: '2026-08-10', label: '08-10', sms: 40, email: 38, manager_calls: 18, cumulative_bookings: 28 },
          { date: '2026-08-17', label: '08-17', sms: 29, email: 28, manager_calls: 16, cumulative_bookings: 33 },
          { date: '2026-08-24', label: '08-24', sms: 19, email: 19, manager_calls: 18, cumulative_bookings: 36 },
          { date: '2026-08-31', label: '08-31', sms: 6, email: 18, manager_calls: 3, cumulative_bookings: 39 },
          { date: '2026-09-07', label: '09-07', sms: 0, email: 9, manager_calls: 0, cumulative_bookings: 40 },
        ],
        assumptions: [
          'Business days only. Dates are illustrative and assume a Monday June 1, 2026 start.',
          'Volumes are realistic planning estimates after approximately 5% touch attrition.',
        ],
      },
      agency_work: {
        completed: [
          'Segmented eligible reactivation audience.',
          'Built staged SMS, email, and manager-call outreach plan.',
        ],
        active: [
          'Preparing pilot launch checklist and front desk call handling notes.',
        ],
        next: [
          'Launch pilot track and review first-week response quality.',
        ],
      },
      insights: [
        {
          id: 'campaign-structure',
          title: 'Reactivation sequence is staged by patient responsiveness',
          body: 'The campaign starts with lower-friction SMS/email touches and adds manager calls once warmer patient segments have been identified.',
          severity: 'positive',
        },
      ],
      next_steps: [
        {
          id: 'launch-pilot',
          title: 'Launch pilot track and monitor early response quality',
          description: 'Run the first two weeks with conservative volume, then adjust call capacity before scaling.',
          owner: 'Team',
          due_date: '2026-06-01',
          priority: 'high',
        },
      ],
    },
  }, null, 2)
}

export function createPerformanceDashboardExampleJson(exampleType, clientId) {
  if (exampleType === PERFORMANCE_DASHBOARD_IMPORT_EXAMPLE_TYPES.CAMPAIGN_EXECUTION) {
    return createCampaignExecutionExampleJson(clientId)
  }

  return createPerformanceSummaryExampleJson(clientId)
}
