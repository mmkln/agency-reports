import { useEffect, useState } from 'react'
import { Icon } from '../../../shared/icons'
import { getAppHref } from '../../../shared/routing'
import { BrandLogo } from '../../../shared/ui'

const navItems = ['Products', 'Solutions', 'Pricing', 'About us']

const features = [
  {
    description: 'Automated patient reminders in Viber, Telegram, email, and SMS.',
    iconColor: 'text-action',
    iconName: 'clock',
    title: 'Save time',
  },
  {
    description: 'Encrypted cloud storage designed for sensitive clinic operations.',
    iconColor: 'text-success',
    iconName: 'shieldCheck',
    title: 'Secure data',
  },
  {
    description: 'Role-based access for dentists, administrators, and clinic managers.',
    iconColor: 'text-premium-purple',
    iconName: 'users',
    title: 'Team workflows',
  },
]

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const landingHref = getAppHref('/')
  const loginHref = getAppHref('/login')

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-public-background font-sans text-text-secondary">
      <nav
        className={`fixed z-50 w-full transition-all duration-300 ${
          isScrolled ? 'border-b border-separator bg-surface/80 py-3 backdrop-blur-md' : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <BrandLogo />

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                className="text-sm font-semibold text-text-secondary no-underline transition-colors hover:text-action"
                href={landingHref}
                key={item}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <a
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-action no-underline transition-all hover:bg-action-muted"
              href={loginHref}
            >
              Log in
            </a>
            <a
              className="rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-action-foreground no-underline shadow-block transition-all hover:bg-brand-hover"
              href={loginHref}
            >
              Start free
            </a>
          </div>

          <button
            aria-label="Toggle navigation"
            className="text-text-primary md:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
            type="button"
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mx-6 mt-4 rounded-2xl border border-island-border bg-material-liquid p-4 shadow-premium backdrop-blur-2xl md:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <a
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-text-secondary no-underline hover:bg-control-hover hover:text-text-primary"
                  href={landingHref}
                  key={item}
                >
                  {item}
                </a>
              ))}
              <a
                className="mt-2 rounded-xl bg-brand px-3 py-2 text-center text-sm font-bold text-action-foreground no-underline"
                href={loginHref}
              >
                Start free
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      <header className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-1/2 rounded-full bg-gradient-to-bl from-action-muted to-transparent opacity-60 blur-3xl" />
        <div className="absolute -left-20 top-40 -z-10 h-64 w-64 rounded-full bg-premium-purple/10 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-action/20 bg-action-muted px-3 py-1 text-xs font-bold tracking-wider text-action uppercase">
              <Icon name="sparkles" size={14} />
              Next generation clinic management
            </div>

            <h1 className="m-0 text-5xl leading-[1.1] font-extrabold text-text-primary md:text-6xl">
              Put your clinic on <span className="text-brand">autopilot</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
              DentalFlow is a complete ecosystem for dental clinics, combining patient scheduling,
              inventory tracking, and CRM in one polished workspace.
            </p>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <a
                className="group flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-action-foreground no-underline transition-all hover:bg-brand-hover hover:shadow-premium"
                href={loginHref}
              >
                Book a demo
                <Icon className="transition-transform group-hover:translate-x-1" name="arrowRight" size={18} />
              </a>
              <div className="flex items-center gap-4 px-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface bg-control text-[10px] font-bold text-text-secondary"
                      key={item}
                    >
                      U{item}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-text-primary">500+ clinics</div>
                  <div className="text-text-muted">already onboard</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-3xl border border-separator bg-surface p-4 shadow-premium">
              <div className="rounded-2xl border border-separator bg-surface-chrome p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div className="h-6 w-32 animate-pulse rounded-lg bg-control-selected" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-action-muted" />
                    <div className="h-8 w-8 rounded-full bg-control-selected" />
                  </div>
                </div>
                <div className="mb-8 grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div className="h-20 rounded-xl border border-separator bg-surface p-3 shadow-block" key={item}>
                      <div className="mb-2 h-2 w-1/2 rounded bg-control" />
                      <div className="h-4 w-3/4 rounded bg-action-muted" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-separator bg-surface shadow-block">
                    <div className="flex flex-col items-center gap-2 text-text-quaternary">
                      <Icon name="calendar" size={32} />
                      <span className="text-xs font-medium">Appointment schedule</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 z-20 flex animate-bounce items-center gap-3 rounded-2xl border border-island-border bg-island p-4 shadow-premium max-[640px]:left-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-muted text-success">
                <Icon name="checkCircle2" size={20} />
              </div>
              <div>
                <div className="text-xs text-text-muted">Profit +24%</div>
                <div className="text-sm font-bold text-text-primary">Optimized</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-background-grouped-secondary py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-text-primary">Everything your clinic needs to grow</h2>
            <p className="text-text-secondary">
              We brought the strongest clinic automation practices into one simple, focused product.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                className="rounded-3xl border border-transparent bg-block p-8 transition-all duration-300 hover:border-block-border hover:bg-surface-elevated hover:shadow-block"
                key={feature.title}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated shadow-block">
                  <Icon className={feature.iconColor} name={feature.iconName} size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-primary">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-premium-shark py-16 text-text-on-dark">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-12 md:flex-row">
            <div className="space-y-6">
              <BrandLogo href="/" light />
              <p className="max-w-xs text-sm text-text-on-dark/70">
                We make dental operations simpler, so teams can focus on better patient care.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div className="space-y-4">
                <h4 className="font-bold">Product</h4>
                <ul className="m-0 grid list-none gap-2 p-0 text-sm text-text-on-dark/70">
                  {['Features', 'Integrations', 'Reviews'].map((item) => (
                    <li key={item}>
                      <a className="text-text-on-dark/70 no-underline transition-colors hover:text-text-on-dark" href={landingHref}>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold">Support</h4>
                <ul className="m-0 grid list-none gap-2 p-0 text-sm text-text-on-dark/70">
                  {['Documentation', 'Help center', 'Contact'].map((item) => (
                    <li key={item}>
                      <a className="text-text-on-dark/70 no-underline transition-colors hover:text-text-on-dark" href={landingHref}>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-16 flex justify-between border-t border-text-on-dark/20 pt-8 text-sm text-text-on-dark/60 max-[640px]:flex-col max-[640px]:gap-4">
            <span>Copyright 2024 DentalFlow Inc. All rights reserved.</span>
            <div className="flex gap-6">
              <a className="text-text-on-dark/60 no-underline hover:text-text-on-dark" href={landingHref}>Privacy</a>
              <a className="text-text-on-dark/60 no-underline hover:text-text-on-dark" href={landingHref}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
