import { HelpCircleIcon, Icon } from '../../../shared/icons'
import { developmentPhases } from '../../../shared/data/developmentPhases'
import { Panel, PanelBody, PanelHeader, PhaseCard, StatCard } from '../../../shared/ui'

const planStats = [
  { label: 'Total Duration', value: '12-16 weeks' },
  { label: 'Development Phases', value: '5 phases' },
  { label: 'Core Modules', value: '8+ modules' },
  { label: 'Integrations', value: '10+ APIs' },
]

const technicalStack = [
  {
    title: 'Backend',
    items: [
      { name: 'Go 1.21+', description: 'Primary programming language' },
      { name: 'Gin/Echo', description: 'Web framework for API development' },
      { name: 'GORM', description: 'ORM for database operations' },
      { name: 'JWT-Go', description: 'Authentication and authorization' },
      { name: 'Viper', description: 'Configuration management' },
    ],
  },
  {
    title: 'Database',
    items: [
      { name: 'PostgreSQL 15+', description: 'Primary relational database' },
      { name: 'Redis', description: 'Caching and session management' },
      { name: 'TimescaleDB', description: 'Time-series analytics data' },
    ],
  },
  {
    title: 'External Services',
    items: [
      { name: 'Twilio', description: 'SMS messaging' },
      { name: 'SendGrid/AWS SES', description: 'Email delivery' },
      { name: 'Stripe', description: 'Payment processing' },
      { name: 'Google Ads API', description: 'Campaign management' },
      { name: 'Facebook Marketing API', description: 'Social media advertising' },
    ],
  },
  {
    title: 'DevOps',
    items: [
      { name: 'Docker', description: 'Containerization' },
      { name: 'Kubernetes', description: 'Container orchestration' },
      { name: 'GitHub Actions', description: 'CI/CD pipeline' },
      { name: 'Prometheus + Grafana', description: 'Monitoring and alerting' },
      { name: 'ELK Stack', description: 'Logging and analysis' },
    ],
  },
]

const dataModels = [
  {
    title: 'Patient',
    fields: [
      ['id', 'string'],
      ['first_name', 'string'],
      ['last_name', 'string'],
      ['email', 'string'],
      ['phone', 'string'],
      ['date_of_birth', 'string'],
      ['address', 'string'],
      ['insurance_info', 'string'],
      ['medical_history', 'string'],
      ['created_at', 'string'],
      ['updated_at', 'string'],
    ],
  },
  {
    title: 'Lead',
    fields: [
      ['id', 'string'],
      ['source', 'string'],
      ['status', 'string'],
      ['score', 'string'],
      ['contact_info', 'string'],
      ['interests', 'string'],
      ['last_contacted', 'string'],
      ['assigned_to', 'string'],
      ['created_at', 'string'],
      ['updated_at', 'string'],
    ],
  },
  {
    title: 'Appointment',
    fields: [
      ['id', 'string'],
      ['patient_id', 'string'],
      ['dentist_id', 'string'],
      ['appointment_type', 'string'],
      ['scheduled_at', 'string'],
      ['duration', 'string'],
      ['status', 'string'],
      ['notes', 'string'],
      ['created_at', 'string'],
      ['updated_at', 'string'],
    ],
  },
  {
    title: 'Campaign',
    fields: [
      ['id', 'string'],
      ['name', 'string'],
      ['type', 'string'],
      ['channel', 'string'],
      ['status', 'string'],
      ['budget', 'string'],
      ['start_date', 'string'],
      ['end_date', 'string'],
      ['target_audience', 'string'],
      ['metrics', 'string'],
      ['created_at', 'string'],
      ['updated_at', 'string'],
    ],
  },
  {
    title: 'Communication',
    fields: [
      ['id', 'string'],
      ['patient_id', 'string'],
      ['type', 'string'],
      ['direction', 'string'],
      ['content', 'string'],
      ['status', 'string'],
      ['sent_at', 'string'],
      ['delivered_at', 'string'],
      ['read_at', 'string'],
      ['created_at', 'string'],
    ],
  },
]

const architectureLayers = [
  {
    accent: 'blue',
    description:
      'RESTful API built with Gin/Echo framework, handling all business logic, authentication, and data validation. Supports JWT-based authentication with role-based access control.',
    title: 'API Layer (Go)',
  },
  {
    accent: 'green',
    description:
      'PostgreSQL for persistent storage of patient records, appointments, and campaign data. Redis for session management, caching frequent queries, and real-time data.',
    title: 'Data Layer (PostgreSQL + Redis)',
  },
  {
    accent: 'purple',
    description:
      'Event-driven workflow system using Go channels and goroutines for parallel processing. Integrates with Twilio (SMS), SendGrid (Email), and advertising platforms.',
    title: 'Marketing Automation Engine',
  },
  {
    accent: 'orange',
    description:
      'Real-time analytics using TimescaleDB for time-series data. Aggregates campaign performance, patient acquisition costs, and ROI metrics with scheduled report generation.',
    title: 'Analytics & Reporting',
  },
]

const featureGroups = [
  {
    title: 'Patient Management',
    items: [
      'Complete patient profiles with medical history',
      'Appointment scheduling and calendar integration',
      'Treatment plan tracking and progress notes',
      'Insurance information and billing management',
      'Patient portal for self-service access',
    ],
  },
  {
    title: 'Lead Management',
    items: [
      'Multi-channel lead capture (web, phone, social)',
      'Automated lead scoring and qualification',
      'Pipeline stage tracking and automation',
      'Lead source attribution and ROI tracking',
      'Duplicate detection and merge capabilities',
    ],
  },
  {
    title: 'Marketing Automation',
    items: [
      'Automated email/SMS campaigns and workflows',
      'Appointment reminder system (multi-channel)',
      'Patient retention and reactivation campaigns',
      'Birthday and anniversary messages',
      'Post-visit satisfaction surveys',
    ],
  },
  {
    title: 'Analytics & Reporting',
    items: [
      'Real-time dashboard with key metrics',
      'Campaign performance and ROI analysis',
      'Patient acquisition cost tracking',
      'Conversion funnel visualization',
      'Custom report builder and scheduling',
    ],
  },
]

const bestPractices = [
  {
    title: 'Code Organization',
    items: [
      'Follow standard Go project layout',
      'Use dependency injection for testability',
      'Implement repository pattern for data access',
      'Separate business logic from handlers',
    ],
  },
  {
    title: 'Performance & Scalability',
    items: [
      'Use goroutines for concurrent operations',
      'Implement connection pooling for database',
      'Add caching layer with Redis',
      'Use context for request cancellation',
    ],
  },
  {
    title: 'Security',
    items: [
      'Implement HIPAA-compliant data encryption',
      'Use prepared statements to prevent SQL injection',
      'Apply rate limiting on API endpoints',
      'Audit log all data access and modifications',
    ],
  },
  {
    title: 'Testing & Quality',
    items: [
      'Write unit tests for all business logic',
      'Implement integration tests for API endpoints',
      'Use mocks for external service dependencies',
      'Maintain 80%+ code coverage',
    ],
  },
]

const architectureAccent = {
  blue: 'border-l-indigo-600 bg-indigo-50/70 text-indigo-800',
  green: 'border-l-emerald-600 bg-emerald-50/70 text-emerald-800',
  orange: 'border-l-orange-600 bg-orange-50/70 text-orange-800',
  purple: 'border-l-purple-600 bg-purple-50/70 text-purple-800',
}

function StackSection() {
  return (
    <Panel className="mt-5">
      <PanelBody>
        <h2 className="m-0 text-2xl font-bold text-slate-900">Technical Stack</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {technicalStack.map((group) => (
            <article className="rounded-lg border border-slate-200 p-4" key={group.title}>
              <h3 className="m-0 text-lg font-bold text-slate-900">{group.title}</h3>
              <ul className="mt-5 grid list-none gap-4 p-0">
                {group.items.map((item) => (
                  <li className="flex items-start gap-3" key={item.name}>
                    <Icon className="mt-0.5 text-indigo-600" name="code" size={16} />
                    <div>
                      <p className="m-0 text-base font-medium text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

function DataModelsSection() {
  return (
    <Panel className="mt-5">
      <PanelBody>
        <h2 className="m-0 text-2xl font-bold text-slate-900">Core Data Models</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {dataModels.map((model) => (
            <article className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={model.title}>
              <div className="flex items-center gap-2">
                <Icon className="text-purple-600" name="database" size={20} />
                <h3 className="m-0 text-lg font-bold text-slate-900">{model.title}</h3>
              </div>
              <div className="mt-4 rounded-md bg-white p-4 font-mono text-xs leading-6 text-slate-700">
                {model.fields.map(([field, type]) => (
                  <p className="m-0" key={field}>
                    <span className="text-purple-600">{field}</span>: {type}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

function ArchitectureSection() {
  return (
    <Panel className="mt-5">
      <PanelBody>
        <h2 className="m-0 text-2xl font-bold text-slate-900">System Architecture Overview</h2>
        <div className="mt-6 grid gap-4">
          {architectureLayers.map((layer) => (
            <article className={`rounded-r-md border-l-4 p-4 ${architectureAccent[layer.accent]}`} key={layer.title}>
              <h3 className="m-0 text-base font-bold">{layer.title}</h3>
              <p className="mt-3 text-sm leading-6">{layer.description}</p>
            </article>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

function FeatureCapabilitiesSection() {
  return (
    <Panel className="mt-5">
      <PanelBody>
        <h2 className="m-0 text-2xl font-bold text-slate-900">Key Features & Capabilities</h2>
        <div className="mt-6 grid gap-x-16 gap-y-8 lg:grid-cols-2">
          {featureGroups.map((group) => (
            <div key={group.title}>
              <h3 className="m-0 text-lg font-bold text-slate-900">{group.title}</h3>
              <ul className="mt-4 grid gap-2.5 pl-0 text-sm leading-6 text-slate-700">
                {group.items.map((item) => (
                  <li className="list-none before:mr-1.5 before:content-['•']" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PanelBody>
    </Panel>
  )
}

function BestPracticesSection() {
  return (
    <section className="mt-5 rounded-lg bg-[linear-gradient(110deg,#059669_0%,#0891b2_48%,#2563eb_100%)] p-6 text-white shadow-xs">
      <h2 className="m-0 text-2xl font-bold text-white">Go Development Best Practices</h2>
      <div className="mt-6 grid gap-x-16 gap-y-6 lg:grid-cols-2">
        {bestPractices.map((group) => (
          <div key={group.title}>
            <h3 className="m-0 text-base font-bold text-white">{group.title}</h3>
            <ul className="mt-3 grid gap-2 pl-0 text-sm leading-6 text-white">
              {group.items.map((item) => (
                <li className="list-none before:mr-1.5 before:content-['•']" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export function BuildBoardPage() {
  return (
    <>
      <section className="rounded-lg bg-[linear-gradient(100deg,#2563ff_0%,#7c3aed_55%,#c000ff_100%)] px-8 py-9 text-white shadow-[0_22px_50px_rgba(76,29,149,0.2)] max-[800px]:px-5 max-[800px]:py-6">
        <div>
          <h2 className="m-0 text-[30px] leading-9 font-extrabold tracking-[-0.02em] text-white max-[560px]:text-2xl">
            Go CRM System - Complete Buildout Plan
          </h2>
          <p className="mt-4 max-w-[980px] text-base leading-6 text-white/95">
            Comprehensive dental clinic CRM with marketing automation, patient management, and analytics
          </p>
        </div>
        <div className="mt-7 grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
          {planStats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
      </section>

      <Panel className="mt-5">
        <PanelHeader
          action={
            <button
              aria-label="Development phase details"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              type="button"
            >
              <HelpCircleIcon size={18} />
            </button>
          }
          eyebrow="Buildout roadmap"
          subtitle="Track implementation progress across the foundation, CRM, automation, and launch workstreams."
          title="Development Phases"
        />
        <PanelBody className="grid gap-4">
          {developmentPhases.map((phase) => (
            <PhaseCard key={phase.phase} {...phase} />
          ))}
        </PanelBody>
      </Panel>

      <StackSection />
      <DataModelsSection />
      <ArchitectureSection />
      <FeatureCapabilitiesSection />
      <BestPracticesSection />
    </>
  )
}
