import { getAppHref } from '../../../shared/routing'
import { Icon } from '../../../shared/icons'
import { BrandLogo, Button } from '../../../shared/ui'

const reviewMetrics = [
  { label: 'Booked appointments', value: '196' },
  { label: 'Booked expected value', value: '$142,800' },
  { label: 'Patient replies', value: '624' },
  { label: 'Reply to booking', value: '31.4%' },
]

const lifecycleRows = [
  { booked: '76', color: 'bg-premium-blue', replied: '238', sequence: '1,284', track: 'Track A', width: '100%' },
  { booked: '49', color: 'bg-success', replied: '172', sequence: '1,116', track: 'Track B', width: '87%' },
  { booked: '40', color: 'bg-premium-purple', replied: '142', sequence: '868', track: 'Track C', width: '68%' },
  { booked: '31', color: 'bg-warning', replied: '72', sequence: '692', track: 'Track D', width: '54%' },
]

const featureItems = [
  {
    description: 'Map the source, pipeline, outcomes, tracks, and signals for an existing campaign.',
    icon: 'settings',
    title: 'Configure the review',
  },
  {
    description: 'Follow the configured cohort from sequence activity to replies and booked appointments.',
    icon: 'trendingUp',
    title: 'Review the lifecycle',
  },
  {
    description: 'Give agency teams and authorized clients a clear report backed by the same workspace.',
    icon: 'users',
    title: 'Share the right view',
  },
]

function scrollToProduct() {
  document.getElementById('campaign-level-product')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function ProductPreview() {
  return (
    <section
      aria-label="Illustrative Campaign Level Growth Review workspace"
      className="overflow-hidden rounded-block bg-block shadow-premium"
    >
      <div className="flex flex-col gap-component border-b border-separator px-card py-component lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-heading text-text-primary">Inspo Dental</p>
          <p className="text-label text-text-muted">Illustrative workspace preview</p>
        </div>
        <div className="flex flex-wrap items-center gap-control text-ui text-text-secondary">
          {['Setup', 'Data', 'Access', 'Review', 'Lead Report', 'Executive'].map((item) => (
            <span
              className={item === 'Review' ? 'rounded-control bg-action-muted px-control py-item text-action' : 'px-control py-item'}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-card p-card lg:p-panel">
        <div className="flex flex-col gap-component lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-label text-text-muted">Patient Reactivation · Oct 1 – Oct 31</p>
            <h2 className="mt-item text-display text-text-primary">Growth Review</h2>
            <p className="mt-item text-ui text-text-secondary">
              4,812 patients in cohort · 3,960 started sequence
            </p>
          </div>
          <p className="text-label text-text-muted">Sample data · Updated 4 Nov 2026</p>
        </div>

        <div className="grid gap-component md:grid-cols-2 xl:grid-cols-4">
          {reviewMetrics.map((metric) => (
            <div className="rounded-block bg-block-subtle p-component" key={metric.label}>
              <p className="text-label text-text-secondary">{metric.label}</p>
              <p className="mt-item text-data tabular-nums text-text-primary">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-block bg-block-subtle p-component lg:p-card">
          <div className="flex flex-col gap-item sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-heading text-text-primary">Reactivation Lifecycle</h3>
            <p className="text-label text-text-muted">Sequence → Replied → Booked</p>
          </div>

          <div className="mt-card grid gap-component">
            {lifecycleRows.map((row) => (
              <div className="grid gap-item sm:grid-cols-[72px_minmax(0,1fr)_64px_64px] sm:items-center" key={row.track}>
                <p className="text-ui text-text-primary">{row.track}</p>
                <div className="h-control-mini overflow-hidden rounded-full bg-fill-secondary">
                  <div className={`h-full rounded-full ${row.color}`} style={{ width: row.width }} />
                </div>
                <p className="text-label tabular-nums text-text-secondary">{row.replied}</p>
                <p className="text-label tabular-nums text-text-primary">{row.booked}</p>
                <p className="sr-only">{row.sequence} sequence starts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function CampaignLevelLandingPage() {
  const loginHref = getAppHref('/login')

  return (
    <main className="min-h-screen bg-background-grouped text-text-primary">
      <header className="sticky top-0 z-20 border-b border-separator bg-material-chrome backdrop-blur-2xl">
        <div className="mx-auto flex max-w-content items-center justify-between px-app-gutter py-control">
          <BrandLogo href="/" size="sm" variant="static" />
          <Button asChild size="sm" variant="primary">
            <a href={loginHref}>Sign in</a>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-content gap-layout px-app-gutter py-spacious lg:grid-cols-2 lg:items-center">
        <div className="max-w-readable">
          <p className="text-label text-premium-purple">GHL reporting for agencies and clinics</p>
          <h1 className="mt-component text-display text-text-primary">
            See what happened after the campaign launched.
          </h1>
          <p className="mt-card max-w-readable text-body text-text-secondary">
            Configure the cohort, outcomes, tracks, and signals once—then review replies,
            bookings, and expected treatment value in a client-ready workspace.
          </p>
          <div className="mt-panel flex flex-wrap gap-control">
            <Button asChild size="lg" variant="primary">
              <a href={loginHref}>Sign in</a>
            </Button>
            <Button onClick={scrollToProduct} size="lg" variant="outline">
              See the product
            </Button>
          </div>
        </div>

        <div className="rounded-block bg-action-muted p-panel">
          <div className="grid gap-component">
            <span className="flex size-control-large items-center justify-center rounded-control bg-block text-premium-purple shadow-block">
              <Icon name="trendingUp" size={24} />
            </span>
            <p className="text-heading text-text-primary">Reporting, not campaign management</p>
            <p className="text-body text-text-secondary">
              Campaign Level turns configured campaign and lead activity into Growth Review,
              Lead Report, and Executive reporting surfaces for the people allowed to see them.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-app-gutter pb-spacious" id="campaign-level-product">
        <ProductPreview />
      </section>

      <section className="bg-background-grouped-secondary py-spacious">
        <div className="mx-auto max-w-content px-app-gutter">
          <div className="max-w-readable">
            <p className="text-label text-premium-purple">One connected reporting workspace</p>
            <h2 className="mt-component text-display text-text-primary">
              Built around the campaign you already run in GHL.
            </h2>
          </div>

          <div className="mt-layout grid gap-card md:grid-cols-3">
            {featureItems.map((item) => (
              <article className="rounded-block bg-block p-card shadow-block" key={item.title}>
                <span className="flex size-control-large items-center justify-center rounded-control bg-action-muted text-action">
                  <Icon name={item.icon} size={22} />
                </span>
                <h3 className="mt-card text-heading text-text-primary">{item.title}</h3>
                <p className="mt-component text-body text-text-secondary">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-content px-app-gutter py-spacious">
        <div className="flex flex-col gap-card rounded-block bg-premium-shark p-panel text-text-on-dark shadow-premium lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-display text-text-on-dark">Bring campaign reporting into focus.</h2>
            <p className="mt-item text-body text-text-on-dark/70">Continue to the secure Campaign Level workspace.</p>
          </div>
          <Button asChild size="lg" variant="secondary">
            <a href={loginHref}>Sign in</a>
          </Button>
        </div>
      </section>

      <footer className="border-t border-separator py-card">
        <div className="mx-auto flex max-w-content flex-col gap-item px-app-gutter text-label text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>Campaign Level</span>
          <span>Client-ready reporting for configured campaigns.</span>
        </div>
      </footer>
    </main>
  )
}
