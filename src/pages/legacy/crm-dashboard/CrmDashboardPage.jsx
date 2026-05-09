import { DonutChart, GroupedBarChart, LineChart } from '../../../shared/charts'
import { developmentPhases } from '../../../shared/data/developmentPhases'
import {
  ActivityRow,
  ChartPanel,
  ChartLegend,
  DashboardSectionGrid,
  KpiCard,
  MetricGrid,
  Panel,
  PanelBody,
  PanelHeader,
  PhaseCard,
  ProgressRow,
} from '../../../shared/ui'

const metrics = [
  {
    bgColor: 'bg-indigo-50',
    color: 'text-indigo-600',
    iconName: 'users',
    label: 'Total Patients',
    trend: '+12%',
    value: '1,234',
  },
  {
    bgColor: 'bg-emerald-50',
    color: 'text-emerald-600',
    iconName: 'dollarSign',
    label: 'Monthly Revenue',
    trend: '+8%',
    value: '$61,000',
  },
  {
    bgColor: 'bg-purple-50',
    color: 'text-purple-600',
    iconName: 'calendar',
    label: 'Appointments',
    trend: '+5%',
    value: '156',
  },
  {
    bgColor: 'bg-amber-50',
    color: 'text-amber-600',
    iconName: 'trendingUp',
    label: 'Conversion Rate',
    trend: '+3%',
    value: '42%',
  },
]

const pipeline = [
  { color: 'bg-slate-300', count: 45, percentage: 25, revenue: '$67,500', stage: 'New Lead' },
  { color: 'bg-indigo-300', count: 32, percentage: 18, revenue: '$48,000', stage: 'Contacted' },
  { color: 'bg-indigo-400', count: 24, percentage: 14, revenue: '$36,000', stage: 'Consultation' },
  { color: 'bg-indigo-500', count: 18, percentage: 10, revenue: '$27,000', stage: 'Treatment Plan' },
  { color: 'bg-indigo-600', count: 156, percentage: 80, revenue: '$234,000', stage: 'Active Patient' },
]

const leadSources = [
  { color: '#4f46e5', count: 42, name: 'Google Ads', value: 35 },
  { color: '#0ea5e9', count: 34, name: 'Social Media', value: 28 },
  { color: '#f59e0b', count: 26, name: 'Referrals', value: 22 },
  { color: '#10b981', count: 12, name: 'Website', value: 10 },
  { color: '#8b5cf6', count: 6, name: 'Walk-in', value: 5 },
]

const revenueTrend = [
  { label: 'Jan', value: 45000 },
  { label: 'Feb', value: 52000 },
  { label: 'Mar', value: 58000 },
  { label: 'Apr', value: 61000 },
]

const monthlyPatients = [
  { appointments: 120, label: 'Jan', patients: 24 },
  { appointments: 138, label: 'Feb', patients: 29 },
  { appointments: 152, label: 'Mar', patients: 33 },
  { appointments: 160, label: 'Apr', patients: 37 },
]

const recentActivity = [
  {
    color: 'text-indigo-600',
    detail: 'Teeth whitening consultation scheduled for May 8',
    iconName: 'phone',
    time: '2 hours ago',
    title: 'Sarah Johnson - Follow-up Call',
  },
  {
    color: 'text-emerald-600',
    detail: 'Treatment plan and pricing information delivered',
    iconName: 'mail',
    time: '4 hours ago',
    title: 'Michael Chen - Email Sent',
  },
  {
    color: 'text-purple-600',
    detail: 'Appointment reminder for dental cleaning tomorrow',
    iconName: 'messageSquare',
    time: '5 hours ago',
    title: 'Emma Davis - SMS Reminder',
  },
  {
    color: 'text-amber-600',
    detail: 'Root canal procedure scheduled for May 15',
    iconName: 'calendar',
    time: '6 hours ago',
    title: 'Robert Wilson - Appointment Booked',
  },
]

function PatientPipelinePanel() {
  return (
    <Panel>
      <PanelHeader title="Patient Pipeline" />
      <PanelBody className="flex flex-1 flex-col justify-between gap-2">
        {pipeline.map((row) => (
          <ProgressRow
            color={row.color}
            count={`${row.count} patients`}
            key={row.stage}
            label={row.stage}
            progress={row.percentage}
            rightLabel={row.revenue}
          />
        ))}
      </PanelBody>
    </Panel>
  )
}

function DonutChartPanel() {
  return (
    <Panel>
      <PanelHeader title="Lead Source Distribution" />
      <PanelBody className="flex flex-1 flex-col items-center justify-center">
        <DonutChart centerLabel="Total Leads" centerValue="120" items={leadSources} />
        <ChartLegend items={leadSources} />
      </PanelBody>
    </Panel>
  )
}

function RevenueTrendCard() {
  return (
    <ChartPanel
      footer={(
        <div className="flex items-center justify-center gap-1.5 text-base leading-6 text-green-600">
          <span className="h-px w-3 bg-green-600" />
          <span className="h-1.5 w-1.5 rounded-full border-2 border-green-600 bg-white" />
          <span>Revenue ($)</span>
        </div>
      )}
      title="Monthly Revenue Trend"
    >
      <LineChart
        ariaLabel="Monthly revenue trend chart"
        data={revenueTrend}
        leftTicks={[0, 20000, 40000, 60000, 80000]}
        series={[{ color: '#10b981', key: 'value' }]}
        yMax={80000}
      />
    </ChartPanel>
  )
}

function PatientsAppointmentsCard() {
  return (
    <ChartPanel
      footer={(
        <div className="flex items-center justify-center gap-3 text-base leading-6 max-[560px]:flex-wrap">
          <span className="flex items-center gap-1.5 text-indigo-600"><span className="h-3 w-3 bg-indigo-600" />New Patients</span>
          <span className="flex items-center gap-1.5 text-purple-500"><span className="h-3 w-3 bg-purple-500" />Appointments</span>
        </div>
      )}
      title="New Patients & Appointments"
    >
      <GroupedBarChart
        ariaLabel="New patients and appointments chart"
        bars={[
          { color: '#4f46e5', key: 'patients' },
          { color: '#8b5cf6', key: 'appointments' },
        ]}
        data={monthlyPatients}
        leftTicks={[0, 40, 80, 120, 160]}
        yMax={160}
      />
    </ChartPanel>
  )
}

function RecentActivityCard() {
  return (
    <Panel>
      <PanelHeader title="Recent Patient Activity" />
      <PanelBody className="grid gap-3">
        {recentActivity.map((item) => (
          <ActivityRow key={item.title} {...item} />
        ))}
      </PanelBody>
    </Panel>
  )
}

function DevelopmentPhasesPanel() {
  return (
    <Panel>
      <PanelHeader
        subtitle="Track implementation progress across infrastructure, CRM modules, automation, reporting, and integrations."
        title="Development Phases"
      />
      <PanelBody className="grid gap-4">
        {developmentPhases.map((phase) => (
          <PhaseCard key={phase.phase} {...phase} />
        ))}
      </PanelBody>
    </Panel>
  )
}

export function CrmDashboardPage() {
  return (
    <>
      <MetricGrid>
        {metrics.map((metric) => (
          <KpiCard key={metric.label} {...metric} />
        ))}
      </MetricGrid>

      <DashboardSectionGrid>
        <PatientPipelinePanel />
        <DonutChartPanel />
      </DashboardSectionGrid>

      <DashboardSectionGrid>
        <RevenueTrendCard />
        <PatientsAppointmentsCard />
      </DashboardSectionGrid>

      <RecentActivityCard />

      <DevelopmentPhasesPanel />
    </>
  )
}
