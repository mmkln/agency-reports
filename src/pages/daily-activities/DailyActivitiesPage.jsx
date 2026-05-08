import { useMemo, useState } from 'react'
import { Icon } from '../../shared/icons'
import { KpiCard, MetricGrid, Panel, PanelBody, ProgressBar, TaskItem } from '../../shared/ui'

const roleWorkflows = [
  {
    id: 'front-desk',
    label: 'Front Desk',
    priorities: [
      '3 VIP patients scheduled today - ensure premium service',
      'Insurance verification needed for 2:00 PM appointment',
      'Follow up on 5 outstanding payment balances',
    ],
    tasks: [
      { completed: true, priority: 'LOW', time: '8:00 AM', title: 'Review overnight web inquiries' },
      { completed: true, priority: 'LOW', time: '8:30 AM', title: 'Send appointment confirmation SMS' },
      { priority: 'MEDIUM', time: '9:00 AM', title: 'Call no-show patients from yesterday' },
      { priority: 'MEDIUM', time: '10:00 AM', title: 'Update patient records with insurance info' },
      { priority: 'HIGH', time: '11:00 AM', title: "Schedule follow-up appointments for today's patients" },
      { priority: 'MEDIUM', time: '3:00 PM', title: 'Send post-visit satisfaction surveys' },
      { priority: 'HIGH', time: '4:00 PM', title: 'Process payment receipts and billing' },
      { priority: 'MEDIUM', time: '5:00 PM', title: "Prepare tomorrow's patient charts" },
    ],
    timeSaved: '2.3h',
    trend: '+7%',
  },
  {
    id: 'marketing-coordinator',
    label: 'Marketing Coordinator',
    priorities: [
      'Review Google Ads spend before noon',
      'Approve new recall campaign email copy',
      'Prepare weekly channel performance notes',
    ],
    tasks: [
      { completed: true, priority: 'LOW', time: '8:15 AM', title: 'Check overnight campaign leads' },
      { completed: true, priority: 'LOW', time: '9:00 AM', title: 'Update social media response queue' },
      { priority: 'HIGH', time: '10:30 AM', title: 'Review high-cost ad groups for budget waste' },
      { priority: 'MEDIUM', time: '11:30 AM', title: 'Send recall campaign draft for approval' },
      { priority: 'MEDIUM', time: '1:00 PM', title: 'Prepare new offer landing page notes' },
      { priority: 'HIGH', time: '2:30 PM', title: 'Call source tracking discrepancy review' },
      { priority: 'MEDIUM', time: '3:30 PM', title: 'Schedule next week campaign tests' },
      { priority: 'LOW', time: '4:15 PM', title: 'Archive completed creative assets' },
      { priority: 'MEDIUM', time: '5:00 PM', title: 'Send daily marketing summary' },
    ],
    timeSaved: '3.1h',
    trend: '+5%',
  },
  {
    id: 'patient-care-coordinator',
    label: 'Patient Care Coordinator',
    priorities: [
      'Contact 4 open treatment plan patients',
      'Confirm pre-op instructions for tomorrow',
      'Escalate unresolved patient questions before 4:00 PM',
    ],
    tasks: [
      { completed: true, priority: 'LOW', time: '8:30 AM', title: 'Review patient care inbox' },
      { completed: true, priority: 'LOW', time: '9:15 AM', title: 'Confirm tomorrow consultation notes' },
      { priority: 'HIGH', time: '10:00 AM', title: 'Call implant consult patients with missing forms' },
      { priority: 'MEDIUM', time: '11:00 AM', title: 'Update treatment plan follow-up list' },
      { priority: 'MEDIUM', time: '1:30 PM', title: 'Send post-op care instructions' },
      { priority: 'HIGH', time: '3:00 PM', title: 'Resolve patient financing questions' },
      { priority: 'MEDIUM', time: '4:00 PM', title: 'Prepare hygiene recall outreach' },
      { priority: 'LOW', time: '5:00 PM', title: 'Close completed patient care tickets' },
    ],
    timeSaved: '2.7h',
    trend: '+6%',
  },
  {
    id: 'practice-manager',
    label: 'Practice Manager',
    priorities: [
      'Review chair utilization and staffing gaps',
      'Approve outstanding billing exceptions',
      'Check weekly revenue pacing against target',
    ],
    tasks: [
      { completed: true, priority: 'LOW', time: '8:00 AM', title: 'Review daily operations dashboard' },
      { priority: 'HIGH', time: '9:30 AM', title: 'Resolve provider schedule conflicts' },
      { priority: 'MEDIUM', time: '10:30 AM', title: 'Approve supply purchase requests' },
      { priority: 'HIGH', time: '12:00 PM', title: 'Review outstanding insurance exceptions' },
      { priority: 'MEDIUM', time: '2:00 PM', title: 'Audit treatment coordinator follow-up list' },
      { priority: 'MEDIUM', time: '3:30 PM', title: 'Check revenue pacing for the week' },
      { priority: 'LOW', time: '4:30 PM', title: 'Update staffing notes for tomorrow' },
      { priority: 'MEDIUM', time: '5:15 PM', title: 'Send end-of-day manager summary' },
    ],
    timeSaved: '1.6h',
    trend: '+3%',
  },
]

const quickActions = [
  { color: 'text-indigo-600', iconName: 'phone', label: 'Make Call', ring: 'ring-indigo-600' },
  { color: 'text-emerald-600', iconName: 'mail', label: 'Send Email', ring: 'ring-emerald-600' },
  { color: 'text-purple-600', iconName: 'messageSquare', label: 'Send SMS', ring: 'ring-purple-600' },
  { color: 'text-orange-600', iconName: 'calendar', label: 'Schedule', ring: 'ring-orange-600' },
]

function getCompletedCount(tasks) {
  return tasks.filter((task) => task.completed).length
}

function getCompletionRate(tasks) {
  return Math.round((getCompletedCount(tasks) / tasks.length) * 100)
}

function getEfficiencyScore(tasks) {
  const highOpenCount = tasks.filter((task) => task.priority === 'HIGH' && !task.completed).length
  return Math.max(72, Math.round(getCompletionRate(tasks) + 67 - highOpenCount * 3))
}

function StaffRoleCard({ active, completed, label, onSelect, tasks }) {
  return (
    <button
      aria-pressed={active}
      className={`flex min-h-[108px] cursor-pointer flex-col items-start justify-between rounded-xl border bg-white p-4 text-left transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${
        active
          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
          : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40'
      }`}
      onClick={onSelect}
      type="button"
    >
      <Icon name="users" size={22} />
      <span className="self-center text-sm font-semibold text-slate-900">{label}</span>
      <span className="self-center text-xs text-slate-500">
        {completed}/{tasks} tasks
      </span>
    </button>
  )
}

function QuickActionButton({ color, iconName, label, ring }) {
  return (
    <button
      className={`inline-flex min-h-[60px] items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-medium ${color} ring-2 ${ring} ring-inset transition-colors hover:bg-slate-50`}
      type="button"
    >
      <Icon name={iconName} size={18} />
      {label}
    </button>
  )
}

export function DailyActivitiesPage() {
  const [selectedRoleId, setSelectedRoleId] = useState(roleWorkflows[0].id)
  const selectedRole = roleWorkflows.find((role) => role.id === selectedRoleId) ?? roleWorkflows[0]
  const completedCount = getCompletedCount(selectedRole.tasks)
  const completionRate = getCompletionRate(selectedRole.tasks)
  const efficiencyScore = getEfficiencyScore(selectedRole.tasks)
  const metrics = useMemo(
    () => [
      {
        bgColor: 'bg-indigo-50',
        color: 'text-indigo-600',
        helperText: `${completedCount} completed`,
        iconName: 'calendar',
        label: 'Tasks Today',
        value: String(selectedRole.tasks.length),
      },
      {
        bgColor: 'bg-emerald-50',
        color: 'text-emerald-600',
        iconName: 'trendingUp',
        label: 'Completion Rate',
        trend: selectedRole.trend,
        trendLabel: 'vs yesterday',
        value: `${completionRate}%`,
      },
      {
        bgColor: 'bg-purple-50',
        color: 'text-purple-600',
        helperText: efficiencyScore >= 90 ? 'Above target' : 'Needs attention',
        iconName: 'checkCircle2',
        label: 'Efficiency Score',
        value: `${efficiencyScore}%`,
      },
      {
        bgColor: 'bg-amber-50',
        color: 'text-orange-600',
        helperText: 'Automation impact',
        iconName: 'clock',
        label: 'Time Saved',
        value: selectedRole.timeSaved,
      },
    ],
    [completedCount, completionRate, efficiencyScore, selectedRole],
  )

  return (
    <>
      <Panel>
        <PanelBody>
          <h2 className="m-0 text-lg font-semibold text-slate-900">Select Staff Role</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {roleWorkflows.map((role) => (
              <StaffRoleCard
                active={role.id === selectedRole.id}
                completed={getCompletedCount(role.tasks)}
                key={role.id}
                label={role.label}
                onSelect={() => setSelectedRoleId(role.id)}
                tasks={role.tasks.length}
              />
            ))}
          </div>
        </PanelBody>
      </Panel>

      <MetricGrid>
        {metrics.map((metric) => (
          <KpiCard key={metric.label} {...metric} />
        ))}
      </MetricGrid>

      <Panel>
        <PanelBody>
          <div className="flex items-center justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
            <h2 className="m-0 text-lg font-semibold text-slate-900">Daily Tasks - {selectedRole.label}</h2>
            <span className="text-sm text-slate-600">
              Progress: {completedCount}/{selectedRole.tasks.length} ({completionRate}%)
            </span>
          </div>
          <div className="mt-6">
            <ProgressBar label="Daily task completion" showLabel={false} value={completionRate} />
          </div>
          <div className="mt-8 grid gap-3">
            {selectedRole.tasks.map((task) => (
              <TaskItem key={`${selectedRole.id}-${task.time}-${task.title}`} meta={task.time} {...task} />
            ))}
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelBody>
          <h2 className="m-0 text-lg font-semibold text-slate-900">Quick Actions</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => (
              <QuickActionButton key={action.label} {...action} />
            ))}
          </div>
        </PanelBody>
      </Panel>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 text-amber-600" name="warning" size={22} />
          <div>
            <h2 className="m-0 text-base font-semibold">Today's Priorities for {selectedRole.label}</h2>
            <ul className="m-0 mt-3 grid gap-1.5 pl-5 text-sm leading-6">
              {selectedRole.priorities.map((priority) => (
                <li key={priority}>{priority}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}
