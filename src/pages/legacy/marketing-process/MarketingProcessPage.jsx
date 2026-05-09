import { useMemo, useState } from 'react'
import { Icon } from '../../../shared/icons'
import { KpiCard, MetricGrid, Panel, PanelBody } from '../../../shared/ui'

const processes = [
  {
    description: 'Converting prospects into qualified leads',
    id: 'lead-generation',
    metrics: {
      averageTime: '2.6 days',
      completionRate: '72%',
      dropOffRate: '28%',
      roi: '310%',
    },
    steps: [
      {
        color: 'indigo',
        description: 'Capture inquiry',
        iconName: 'users',
        title: 'New Lead',
      },
      {
        color: 'emerald',
        description: 'Score and assign',
        iconName: 'checkCircle2',
        title: 'Lead Qualified',
      },
      {
        color: 'purple',
        description: 'Send clinic offer',
        iconName: 'mail',
        title: 'Offer Email',
      },
      {
        color: 'orange',
        description: 'Book consult',
        iconName: 'calendar',
        title: 'Consultation',
      },
    ],
    tips: [
      'Route high-intent implant and ortho leads to the front desk within 10 minutes',
      'Score every lead by source, treatment interest, and urgency',
      'Review unqualified leads weekly to improve campaign targeting',
    ],
    title: 'Lead Generation Process',
  },
  {
    description: 'Converting leads into scheduled appointments',
    id: 'patient-nurturing',
    metrics: {
      averageTime: '3.2 days',
      completionRate: '78%',
      dropOffRate: '22%',
      roi: '340%',
    },
    steps: [
      {
        color: 'indigo',
        description: 'Send within 5 minutes of signup',
        iconName: 'mail',
        title: 'Welcome Email',
      },
      {
        color: 'emerald',
        description: 'Contact within 24 hours',
        iconName: 'phone',
        title: 'Follow-up Call',
      },
      {
        color: 'purple',
        description: 'Send service information',
        iconName: 'messageSquare',
        title: 'Educational SMS',
      },
      {
        color: 'orange',
        description: 'Provide booking link',
        iconName: 'calendar',
        title: 'Appointment Offer',
      },
      {
        color: 'emerald',
        description: 'Book first visit',
        iconName: 'checkCircle2',
        title: 'Consultation Scheduled',
      },
    ],
    tips: [
      "Personalize emails based on the patient's specific dental interests",
      'Use SMS for time-sensitive communications and email for detailed information',
      'Track response rates for each channel and adjust timing accordingly',
    ],
    title: 'Patient Nurturing Workflow',
  },
  {
    description: 'Reducing no-shows and cancellations',
    id: 'appointment-reminder',
    metrics: {
      averageTime: '1.4 days',
      completionRate: '88%',
      dropOffRate: '12%',
      roi: '290%',
    },
    steps: [
      {
        color: 'indigo',
        description: 'Send 72 hours before visit',
        iconName: 'calendar',
        title: 'Reminder Email',
      },
      {
        color: 'purple',
        description: 'Confirm by text',
        iconName: 'messageSquare',
        title: 'SMS Confirm',
      },
      {
        color: 'emerald',
        description: 'Call unconfirmed patients',
        iconName: 'phone',
        title: 'Desk Call',
      },
      {
        color: 'emerald',
        description: 'Lock appointment status',
        iconName: 'checkCircle2',
        title: 'Confirmed',
      },
    ],
    tips: [
      'Use SMS first for quick confirmations and phone calls only for unresolved appointments',
      'Send reminders at different times for hygiene, consult, and procedure visits',
      'Measure no-show reduction by provider and appointment type',
    ],
    title: 'Appointment Reminder System',
  },
  {
    description: 'Maintaining long-term patient relationships',
    id: 'retention-reactivation',
    metrics: {
      averageTime: '5.8 days',
      completionRate: '64%',
      dropOffRate: '36%',
      roi: '410%',
    },
    steps: [
      {
        color: 'indigo',
        description: 'Segment dormant patients',
        iconName: 'users',
        title: 'Audience List',
      },
      {
        color: 'emerald',
        description: 'Send recall email',
        iconName: 'mail',
        title: 'Recall Email',
      },
      {
        color: 'purple',
        description: 'Follow up by SMS',
        iconName: 'messageSquare',
        title: 'Reactivation SMS',
      },
      {
        color: 'orange',
        description: 'Offer available slots',
        iconName: 'calendar',
        title: 'Schedule Offer',
      },
      {
        color: 'emerald',
        description: 'Return to active care',
        iconName: 'checkCircle2',
        title: 'Patient Retained',
      },
    ],
    tips: [
      'Segment patients by last visit date, treatment history, and hygiene status',
      'Use softer messaging for dormant patients before presenting offers',
      'Track reactivation ROI separately from new patient acquisition',
    ],
    title: 'Patient Retention & Reactivation',
  },
]

const colorClass = {
  emerald: {
    card: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    icon: 'text-emerald-600',
  },
  indigo: {
    card: 'border-indigo-300 bg-indigo-50 text-indigo-700',
    icon: 'text-indigo-600',
  },
  orange: {
    card: 'border-orange-300 bg-orange-50 text-orange-700',
    icon: 'text-orange-600',
  },
  purple: {
    card: 'border-purple-300 bg-purple-50 text-purple-700',
    icon: 'text-purple-600',
  },
}

function ProcessCard({ active, description, onSelect, stepCount, title }) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-[106px] rounded-xl border bg-white p-4 text-left transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${
        active
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40'
      }`}
      onClick={onSelect}
      type="button"
    >
      <strong className="block text-base font-semibold text-slate-900">{title}</strong>
      <span className="mt-2 block text-sm text-slate-600">{description}</span>
      <span className="mt-3 block text-xs text-slate-500">{stepCount} steps</span>
    </button>
  )
}

function WorkflowStep({ color, description, iconName, index, title }) {
  const classes = colorClass[color]

  return (
    <div className="flex min-w-[160px] flex-1 flex-col items-center">
      <div className={`flex min-h-[160px] w-full flex-col items-center justify-center rounded-xl border-2 p-4 text-center ${classes.card}`}>
        <Icon className={classes.icon} name={iconName} size={38} />
        <h3 className="mt-5 mb-2 text-base font-semibold">{title}</h3>
        <p className="m-0 text-xs leading-5">{description}</p>
      </div>
      <span className="mt-3 text-sm font-semibold text-slate-600">Step {index + 1}</span>
    </div>
  )
}

function WorkflowPanel({ process }) {
  return (
    <Panel>
      <PanelBody>
        <h2 className="m-0 text-lg font-semibold text-slate-900">{process.title}</h2>
        <div className="mt-6 flex items-center gap-5 overflow-x-auto pb-1">
          {process.steps.map((step, index) => (
            <div className="flex min-w-[190px] flex-1 items-center gap-5" key={`${process.id}-${step.title}`}>
              <WorkflowStep index={index} {...step} />
              {index < process.steps.length - 1 ? (
                <Icon className="shrink-0 text-slate-400" name="arrowRight" size={28} />
              ) : null}
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

export function MarketingProcessPage() {
  const [selectedProcessId, setSelectedProcessId] = useState('patient-nurturing')
  const selectedProcess = processes.find((process) => process.id === selectedProcessId) ?? processes[1]
  const metrics = useMemo(
    () => [
      {
        bgColor: 'bg-emerald-50',
        color: 'text-emerald-600',
        helperText: '+5% from last month',
        iconName: 'checkCircle2',
        label: 'Completion Rate',
        value: selectedProcess.metrics.completionRate,
      },
      {
        bgColor: 'bg-indigo-50',
        color: 'text-indigo-600',
        helperText: '-0.5 days improvement',
        iconName: 'calendar',
        label: 'Avg. Time',
        value: selectedProcess.metrics.averageTime,
      },
      {
        bgColor: 'bg-rose-50',
        color: 'text-rose-600',
        helperText: '-3% from last month',
        iconName: 'close',
        label: 'Drop-off Rate',
        value: selectedProcess.metrics.dropOffRate,
      },
      {
        bgColor: 'bg-emerald-50',
        color: 'text-emerald-600',
        helperText: '+12% from last month',
        iconName: 'dollarSign',
        label: 'ROI',
        value: selectedProcess.metrics.roi,
      },
    ],
    [selectedProcess],
  )

  return (
    <>
      <Panel>
        <PanelBody>
          <h2 className="m-0 text-lg font-semibold text-slate-900">Marketing Processes</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {processes.map((process) => (
              <ProcessCard
                active={process.id === selectedProcess.id}
                description={process.description}
                key={process.id}
                onSelect={() => setSelectedProcessId(process.id)}
                stepCount={process.steps.length}
                title={process.title}
              />
            ))}
          </div>
        </PanelBody>
      </Panel>

      <WorkflowPanel process={selectedProcess} />

      <Panel>
        <PanelBody>
          <h2 className="m-0 text-lg font-semibold text-slate-900">Process Performance Metrics</h2>
          <MetricGrid className="mt-5">
            {metrics.map((metric) => (
              <KpiCard key={metric.label} {...metric} />
            ))}
          </MetricGrid>
        </PanelBody>
      </Panel>

      <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-indigo-900">
        <h2 className="m-0 text-base font-semibold">Optimization Tips for {selectedProcess.title}</h2>
        <ul className="m-0 mt-3 grid gap-1.5 pl-5 text-sm leading-6">
          {selectedProcess.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
