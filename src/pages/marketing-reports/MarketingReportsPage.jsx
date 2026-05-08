import { DonutChart } from '../../shared/charts'
import {
  Card,
  CardHeader,
  ChartLegend,
  ChartPanel,
  DashboardSectionGrid,
  GoalCard,
  Panel,
  PanelBody,
  PanelHeader,
  TableBadge,
  TablePanel,
} from '../../shared/ui'

const summaryMetrics = [
  { label: 'Total Marketing Spend', trend: '8% from March', value: '$9,100' },
  { label: 'Total Revenue Generated', trend: '15% from March', value: '$42,720' },
  { label: 'Average ROI', trend: '12% from March', value: '369%' },
  { label: 'New Patients', trend: '9% from March', value: '119' },
]

const channelRows = [
  { channel: 'Google Ads', color: '#3b82f6', cpl: '$22.44', leads: 156, revenue: '$15,400', roi: '340%', roiTone: 'blue', spend: '$3,500' },
  { channel: 'Facebook Ads', color: '#10b981', cpl: '$22.45', leads: 98, revenue: '$9,680', roi: '340%', roiTone: 'blue', spend: '$2,200' },
  { channel: 'Instagram Ads', color: '#f59e0b', cpl: '$23.08', leads: 78, revenue: '$6,840', roi: '280%', roiTone: 'yellow', spend: '$1,800' },
  { channel: 'Email Marketing', color: '#ef4444', cpl: '$8.89', leads: 45, revenue: '$2,400', roi: '500%', roiTone: 'green', spend: '$400' },
  { channel: 'SEO/Organic', color: '#8b5cf6', cpl: '$9.68', leads: 124, revenue: '$8,400', roi: '600%', roiTone: 'green', spend: '$1,200' },
]

const weeklyCampaigns = [
  { email: 420, facebook: 850, google: 1250, instagram: 650, label: 'Week 1' },
  { email: 460, facebook: 930, google: 1450, instagram: 720, label: 'Week 2' },
  { email: 560, facebook: 1050, google: 1700, instagram: 780, label: 'Week 3' },
  { email: 650, facebook: 1200, google: 1850, instagram: 940, label: 'Week 4' },
]

const acquisitionCost = [
  { cpa: 36, label: 'Jan', patients: 24 },
  { cpa: 34, label: 'Feb', patients: 28 },
  { cpa: 33, label: 'Mar', patients: 33 },
  { cpa: 31, label: 'Apr', patients: 36 },
]

const funnelStages = [
  { count: '8,500', fill: 'linear-gradient(90deg, #3b82f6, #3b82f6)', label: 'Website Visits', percent: '100%', width: 100 },
  { count: '680', fill: 'linear-gradient(90deg, #10b981, #f59e0b)', label: 'Form Submissions', percent: '8%', width: 80 },
  { count: '476', fill: 'linear-gradient(90deg, #f59e0b, #ef4444)', label: 'Qualified Leads', percent: '5.6%', width: 56 },
  { count: '238', fill: 'linear-gradient(90deg, #ef4444, #8b5cf6)', label: 'Consultations', percent: '2.8%', width: 28 },
  { count: '119', fill: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', label: 'New Patients', percent: '1.4%', width: 14 },
]

const conversionCards = [
  { bg: 'bg-blue-50', label: 'Website to Lead', note: 'Industry avg: 5-7%', text: 'text-blue-800', value: '8.0%' },
  { bg: 'bg-green-50', label: 'Lead to Consultation', note: 'Industry avg: 40-45%', text: 'text-green-800', value: '50.0%' },
  { bg: 'bg-purple-50', label: 'Consultation to Patient', note: 'Industry avg: 45-50%', text: 'text-purple-800', value: '50.0%' },
]

const engagementMetrics = [
  { label: 'Email Open Rate', progress: 92, target: 'Target: 35%', tone: 'green', value: '38%' },
  { label: 'Click-Through Rate', progress: 92, target: 'Target: 10%', tone: 'green', value: '12%' },
  { label: 'Social Engagement', progress: 92, target: 'Target: 3.5%', tone: 'green', value: '4.2%' },
  { label: 'Call Answer Rate', progress: 82, target: 'Target: 85%', tone: 'yellow', value: '82%' },
]

const leadDistribution = [
  { color: '#4f46e5', count: 156, name: 'Google Ads', value: 35 },
  { color: '#0ea5e9', count: 98, name: 'Facebook Ads', value: 22 },
  { color: '#f59e0b', count: 78, name: 'Instagram Ads', value: 18 },
  { color: '#10b981', count: 45, name: 'Email Marketing', value: 15 },
  { color: '#8b5cf6', count: 124, name: 'SEO/Organic', value: 10 },
]

const insightGroups = [
  {
    bg: 'bg-green-50',
    border: 'border-l-green-500',
    color: 'text-green-800',
    items: [
      'SEO/Organic delivering highest ROI (600%) with lowest CPL ($9.68)',
      'Email marketing extremely cost-effective - consider increasing volume',
      'Google Ads generating most leads (156) - stable performer',
    ],
    title: 'Top Performers',
  },
  {
    bg: 'bg-indigo-50',
    border: 'border-l-indigo-500',
    color: 'text-indigo-800',
    items: [
      'Increase SEO content investment to compound organic growth',
      'Scale email campaigns while maintaining quality engagement',
      "Test retargeting campaigns for the 92% who don't convert initially",
    ],
    title: 'Opportunities',
  },
  {
    bg: 'bg-orange-50',
    border: 'border-l-orange-500',
    color: 'text-orange-800',
    items: [
      'Call answer rate (82%) below target (85%) - review phone coverage',
      'Instagram CPL highest ($23.08) - optimize targeting or creative',
      'Facebook ad spend increased but ROI stable - monitor efficiency',
    ],
    title: 'Areas to Watch',
  },
  {
    bg: 'bg-purple-50',
    border: 'border-l-purple-500',
    color: 'text-purple-800',
    items: [
      'Reallocate 15% of Facebook budget to SEO and email marketing',
      'Implement chatbot for after-hours lead capture',
      'Create landing pages specific to each ad campaign for better tracking',
    ],
    title: 'Strategic Actions',
  },
]

const goals = [
  { barColor: 'bg-blue-500', color: 'text-blue-500', icon: 'users', label: 'New Patients', progress: 95, value: '119', suffix: '/ 125' },
  { barColor: 'bg-green-500', color: 'text-green-500', icon: 'dollarSign', label: 'Revenue Target', progress: 107, value: '$42.7K', suffix: '/ $40K' },
  { barColor: 'bg-purple-500', color: 'text-purple-500', icon: 'target', label: 'Lead Generation', progress: 112, value: '560', suffix: '/ 500' },
  { barColor: 'bg-orange-500', color: 'text-orange-500', icon: 'trendingUp', label: 'ROI Target', progress: 123, value: '369%', suffix: '/ 300%' },
]

function SectionTitle({ children }) {
  return <h2 className="m-0 text-lg leading-7 font-semibold text-slate-900">{children}</h2>
}

function SummaryBanner() {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-indigo-600 via-brand to-violet-500 px-6 py-7 text-white shadow-xs">
      <h2 className="m-0 text-2xl leading-8 font-bold">Marketing Performance Summary - April 2026</h2>
      <div className="mt-5 grid grid-cols-4 gap-8 max-[760px]:grid-cols-2 max-[480px]:grid-cols-1">
        {summaryMetrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-sm leading-5 text-white/90">{metric.label}</p>
            <strong className="mt-1 block text-[30px] leading-9 font-extrabold">{metric.value}</strong>
            <p className="mt-1 text-sm leading-5 text-white">Up {metric.trend}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ChannelTable() {
  const columns = [
    {
      key: 'channel',
      label: 'Channel',
      render: (row) => (
        <span className="inline-flex items-center gap-2 text-base text-slate-900">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: row.color }} />
          {row.channel}
        </span>
      ),
    },
    { key: 'spend', label: 'Spend' },
    {
      key: 'revenue',
      label: 'Revenue',
      render: (row) => <span className="font-semibold text-green-600">{row.revenue}</span>,
    },
    { key: 'leads', label: 'Leads' },
    { key: 'cpl', label: 'CPL' },
    {
      align: 'right',
      key: 'roi',
      label: 'ROI',
      render: (row) => <TableBadge tone={row.roiTone}>{row.roi}</TableBadge>,
    },
  ]

  return <TablePanel columns={columns} rows={channelRows} title="Channel Performance & ROI Analysis" />
}

function WeeklyCampaignChart() {
  const xPositions = [80, 240, 400, 560]
  const baseline = 235
  const scale = 200 / 6000
  const levels = [
    { key: 'google', color: '#3b82f6', opacity: 0.62 },
    { key: 'facebook', color: '#10b981', opacity: 0.58 },
    { key: 'instagram', color: '#f59e0b', opacity: 0.58 },
    { key: 'email', color: '#8b5cf6', opacity: 0.62 },
  ]

  let previousTotals = weeklyCampaigns.map(() => 0)
  const areas = levels.map((level) => {
    const top = weeklyCampaigns.map((week, index) => previousTotals[index] + week[level.key])
    const bottom = previousTotals
    previousTotals = top

    return {
      ...level,
      points: [
        ...top.map((value, index) => `${xPositions[index]},${baseline - value * scale}`),
        ...bottom.map((value, index) => `${xPositions[index]},${baseline - value * scale}`).reverse(),
      ].join(' '),
    }
  })

  return (
    <ChartPanel
      footer={(
        <div className="flex flex-wrap items-center justify-center gap-3 text-base leading-6">
          {[
            ['Google Ads', '#3b82f6'],
            ['Facebook', '#10b981'],
            ['Instagram', '#f59e0b'],
            ['Email', '#8b5cf6'],
          ].map(([label, color]) => (
            <span className="inline-flex items-center gap-1" key={label} style={{ color }}>
              <span className="h-1.5 w-1.5 rounded-full border-2 bg-white" style={{ borderColor: color }} />
              {label}
            </span>
          ))}
        </div>
      )}
      title="Weekly Campaign Performance"
    >
      <svg className="mt-4 h-[250px] w-full overflow-visible" viewBox="0 0 620 250" role="img" aria-label="Weekly campaign performance chart">
        {[0, 1500, 3000, 4500, 6000].map((value) => {
          const y = baseline - value * scale
          return (
            <g key={value}>
              <line x1="70" x2="560" y1={y} y2={y} stroke="#d1d5db" strokeDasharray="3 3" />
              <text x="62" y={y + 5} fill="#666" fontSize="15" textAnchor="end">{value}</text>
            </g>
          )
        })}
        {xPositions.map((x) => <line key={x} x1={x} x2={x} y1="35" y2={baseline} stroke="#d1d5db" strokeDasharray="3 3" />)}
        <line x1="70" x2="560" y1={baseline} y2={baseline} stroke="#888" />
        <line x1="70" x2="70" y1="35" y2={baseline} stroke="#888" />
        {areas.map((area) => <polygon fill={area.color} fillOpacity={area.opacity} key={area.key} points={area.points} stroke={area.color} strokeWidth="1" />)}
        {weeklyCampaigns.map((week, index) => <text fill="#666" fontSize="15" key={week.label} textAnchor="middle" x={xPositions[index]} y="250">{week.label}</text>)}
      </svg>
    </ChartPanel>
  )
}

function AcquisitionTrendChart() {
  const xPositions = [80, 220, 360, 500]
  const base = 235
  const top = 35
  const height = base - top
  const patientPoints = acquisitionCost.map((item, index) => ({
    label: item.label,
    x: xPositions[index],
    y: base - (item.patients / 40) * height,
  }))
  const cpaPoints = acquisitionCost.map((item, index) => ({
    label: item.label,
    x: xPositions[index],
    y: base - (item.cpa / 40) * height,
  }))

  return (
    <ChartPanel title="Patient Acquisition Cost Trend">
      <svg className="mt-4 h-[250px] w-full overflow-visible" viewBox="0 0 560 250" role="img" aria-label="Patient acquisition cost trend chart">
        {[0, 9, 18, 27, 36].map((value) => {
          const y = base - (value / 40) * height
          return (
            <g key={value}>
              <line x1="60" x2="500" y1={y} y2={y} stroke="#d1d5db" strokeDasharray="3 3" />
              <text x="52" y={y + 5} fill="#666" fontSize="15" textAnchor="end">{value}</text>
            </g>
          )
        })}
        {[0, 45, 90, 135, 180].map((value) => {
          const y = base - (value / 180) * height
          return <text fill="#666" fontSize="15" key={value} x="510" y={y + 5}>{value}</text>
        })}
        {xPositions.map((x) => <line key={x} x1={x} x2={x} y1={top} y2={base} stroke="#d1d5db" strokeDasharray="3 3" />)}
        <line x1="60" x2="500" y1={base} y2={base} stroke="#888" />
        <line x1="60" x2="60" y1={top} y2={base} stroke="#888" />
        <line x1="500" x2="500" y1={top} y2={base} stroke="#888" />
        <polyline fill="none" points={patientPoints.map((p) => `${p.x},${p.y}`).join(' ')} stroke="#10b981" strokeWidth="2" />
        <polyline fill="none" points={cpaPoints.map((p) => `${p.x},${p.y}`).join(' ')} stroke="#ef4444" strokeWidth="2" />
        {[...patientPoints, ...cpaPoints].map((point, index) => (
          <circle cx={point.x} cy={point.y} fill="white" key={`${point.label}-${index}`} r="3" stroke={index < 4 ? '#10b981' : '#ef4444'} strokeWidth="2" />
        ))}
        {patientPoints.map((point) => <text fill="#666" fontSize="15" key={point.label} textAnchor="middle" x={point.x} y="250">{point.label}</text>)}
      </svg>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-base leading-6">
        <span className="inline-flex items-center gap-1 text-green-600"><span className="h-1.5 w-1.5 rounded-full border-2 border-green-600 bg-white" />New Patients</span>
        <span className="inline-flex items-center gap-1 text-red-500"><span className="h-1.5 w-1.5 rounded-full border-2 border-red-500 bg-white" />Cost Per Acquisition ($)</span>
      </div>
      <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm leading-5 text-green-800">
        CPA decreased by $26 (15%) while new patients increased by 46% this quarter
      </div>
    </ChartPanel>
  )
}

function ConversionFunnel() {
  return (
    <Card>
      <CardHeader title="Marketing Conversion Funnel" />
      <div className="grid gap-5">
        {funnelStages.map((stage, index) => (
          <div key={stage.label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="text-sm font-medium leading-6 text-slate-700">{stage.label}</span>
              <span className="text-sm leading-5 text-slate-500"><strong className="font-semibold text-slate-900">{stage.count}</strong> ({stage.percent})</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ background: stage.fill, width: `${stage.width}%` }} />
            </div>
            {index < funnelStages.length - 1 ? <div className="mt-2 text-center text-sm font-semibold leading-5 text-slate-300">to</div> : null}
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
        {conversionCards.map((item) => (
          <div className={`rounded-xl px-4 py-4 ${item.bg} ${item.text}`} key={item.label}>
            <p className="text-sm font-medium leading-5">{item.label}</p>
            <strong className="mt-1 block text-2xl leading-8">{item.value}</strong>
            <p className="mt-1 text-xs leading-5">{item.note}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function EngagementMetrics() {
  return (
    <Panel>
      <PanelHeader title="Engagement Performance Metrics" />
      <PanelBody className="flex flex-1 flex-col justify-between gap-2">
        {engagementMetrics.map((metric) => (
          <div className="flex flex-col border-b border-slate-100 py-4 first:pt-0 last:border-0 last:pb-0" key={metric.label}>
            <div className="mb-2 flex items-end justify-between gap-4">
              <span className="block text-sm font-medium text-slate-700">{metric.label}</span>
              <div className="text-right">
                <span className={`inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${metric.tone === 'green' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  Up {metric.value}
                </span>
                <span className="mt-1 block text-sm text-slate-500">{metric.target}</span>
              </div>
            </div>
            <div className="mb-1 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={`h-2.5 rounded-full transition-all duration-500 ease-in-out ${metric.tone === 'green' ? 'bg-emerald-600' : 'bg-amber-500'}`} style={{ width: `${metric.progress}%` }} />
            </div>
          </div>
        ))}
      </PanelBody>
    </Panel>
  )
}

function DistributionPieCard() {
  return (
    <Panel>
      <PanelHeader title="Lead Source Distribution" />
      <PanelBody className="flex flex-1 flex-col items-center justify-center">
        <DonutChart centerLabel="Total Leads" centerValue="501" items={leadDistribution} />
        <ChartLegend items={leadDistribution} />
      </PanelBody>
    </Panel>
  )
}

function InsightsRecommendations() {
  return (
    <Card className="px-6 py-[26px]">
      <SectionTitle>Key Insights &amp; Recommendations</SectionTitle>
      <div className="mt-[18px] grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
        {insightGroups.map((group) => (
          <section className={`rounded border-l-4 px-4 py-4 ${group.bg} ${group.border}`} key={group.title}>
            <h3 className={`m-0 text-base leading-6 font-semibold ${group.color}`}>{group.title}</h3>
            <ul className={`m-0 mt-2 grid list-none gap-1.5 p-0 text-sm leading-5 ${group.color}`}>
              {group.items.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </Card>
  )
}

function GoalsProgress() {
  return (
    <Card className="px-6 py-[26px]">
      <SectionTitle>Monthly Goals Progress</SectionTitle>
      <div className="mt-[18px] grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
        {goals.map((goal) => (
          <GoalCard key={goal.label} {...goal} />
        ))}
      </div>
    </Card>
  )
}

export function MarketingReportsPage() {
  return (
    <>
      <SummaryBanner />
      <ChannelTable />
      <DashboardSectionGrid>
        <WeeklyCampaignChart />
        <AcquisitionTrendChart />
      </DashboardSectionGrid>
      <ConversionFunnel />
      <DashboardSectionGrid>
        <EngagementMetrics />
        <DistributionPieCard />
      </DashboardSectionGrid>
      <InsightsRecommendations />
      <GoalsProgress />
    </>
  )
}
