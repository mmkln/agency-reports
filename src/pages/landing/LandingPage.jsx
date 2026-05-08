import { useEffect, useState } from 'react'
import { Icon } from '../../shared/icons'
import { BrandLogo } from '../../shared/ui'

const navItems = ['Products', 'Solutions', 'Pricing', 'About us']

const features = [
  {
    description: 'Automated patient reminders in Viber, Telegram, email, and SMS.',
    iconColor: 'text-blue-500',
    iconName: 'clock',
    title: 'Save time',
  },
  {
    description: 'Encrypted cloud storage designed for sensitive clinic operations.',
    iconColor: 'text-green-500',
    iconName: 'shieldCheck',
    title: 'Secure data',
  },
  {
    description: 'Role-based access for dentists, administrators, and clinic managers.',
    iconColor: 'text-brand',
    iconName: 'users',
    title: 'Team workflows',
  },
]

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-public-background font-sans text-slate-700">
      <nav
        className={`fixed z-50 w-full transition-all duration-300 ${
          isScrolled ? 'bg-white/80 py-3 shadow-xs backdrop-blur-md' : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <BrandLogo />

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                className="text-sm font-semibold text-slate-700 no-underline transition-colors hover:text-brand"
                href="#landing"
                key={item}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <a
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-brand no-underline transition-all hover:bg-indigo-50"
              href="#login"
            >
              Log in
            </a>
            <a
              className="rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-white no-underline shadow-md shadow-indigo-100 transition-all hover:bg-brand-hover"
              href="#login"
            >
              Start free
            </a>
          </div>

          <button
            aria-label="Toggle navigation"
            className="text-heading md:hidden"
            onClick={() => setMobileMenuOpen((value) => !value)}
            type="button"
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="mx-6 mt-4 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm md:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <a
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 no-underline hover:bg-indigo-50 hover:text-brand"
                  href="#landing"
                  key={item}
                >
                  {item}
                </a>
              ))}
              <a
                className="mt-2 rounded-xl bg-brand px-3 py-2 text-center text-sm font-bold text-white no-underline"
                href="#login"
              >
                Start free
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      <header className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-1/2 rounded-full bg-gradient-to-bl from-indigo-100/50 to-transparent opacity-60 blur-3xl" />
        <div className="absolute -left-20 top-40 -z-10 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold tracking-wider text-brand uppercase">
              <Icon name="sparkles" size={14} />
              Next generation clinic management
            </div>

            <h1 className="m-0 text-5xl leading-[1.1] font-extrabold text-heading md:text-6xl">
              Put your clinic on <span className="text-brand">autopilot</span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-gray-600">
              DentalFlow is a complete ecosystem for dental clinics, combining patient scheduling,
              inventory tracking, and CRM in one polished workspace.
            </p>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <a
                className="group flex items-center justify-center gap-2 rounded-2xl bg-brand px-8 py-4 font-bold text-white no-underline transition-all hover:bg-brand-hover hover:shadow-xl hover:shadow-indigo-200"
                href="#login"
              >
                Book a demo
                <Icon className="transition-transform group-hover:translate-x-1" name="arrowRight" size={18} />
              </a>
              <div className="flex items-center gap-4 px-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] font-bold"
                      key={item}
                    >
                      U{item}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-heading">500+ clinics</div>
                  <div className="text-gray-500">already onboard</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100" />
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                  </div>
                </div>
                <div className="mb-8 grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div className="h-20 rounded-xl border border-gray-50 bg-white p-3 shadow-sm" key={item}>
                      <div className="mb-2 h-2 w-1/2 rounded bg-gray-100" />
                      <div className="h-4 w-3/4 rounded bg-indigo-50" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-50 bg-white shadow-sm">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <Icon name="calendar" size={32} />
                      <span className="text-xs font-medium">Appointment schedule</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 z-20 flex animate-bounce items-center gap-3 rounded-2xl border border-indigo-50 bg-white p-4 shadow-xl max-[640px]:left-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Icon name="checkCircle2" size={20} />
              </div>
              <div>
                <div className="text-xs text-gray-400">Profit +24%</div>
                <div className="text-sm font-bold">Optimized</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-heading">Everything your clinic needs to grow</h2>
            <p className="text-gray-500">
              We brought the strongest clinic automation practices into one simple, focused product.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                className="rounded-3xl border border-transparent bg-gray-50 p-8 transition-all duration-300 hover:border-indigo-100 hover:bg-white hover:shadow-xl"
                key={feature.title}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Icon className={feature.iconColor} name={feature.iconName} size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-heading py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-12 md:flex-row">
            <div className="space-y-6">
              <BrandLogo href="#landing" light />
              <p className="max-w-xs text-sm text-gray-400">
                We make dental operations simpler, so teams can focus on better patient care.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16">
              <div className="space-y-4">
                <h4 className="font-bold">Product</h4>
                <ul className="m-0 grid list-none gap-2 p-0 text-sm text-gray-400">
                  {['Features', 'Integrations', 'Reviews'].map((item) => (
                    <li key={item}>
                      <a className="text-gray-400 no-underline transition-colors hover:text-white" href="#landing">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold">Support</h4>
                <ul className="m-0 grid list-none gap-2 p-0 text-sm text-gray-400">
                  {['Documentation', 'Help center', 'Contact'].map((item) => (
                    <li key={item}>
                      <a className="text-gray-400 no-underline transition-colors hover:text-white" href="#landing">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-16 flex justify-between border-t border-gray-800 pt-8 text-sm text-gray-500 max-[640px]:flex-col max-[640px]:gap-4">
            <span>Copyright 2024 DentalFlow Inc. All rights reserved.</span>
            <div className="flex gap-6">
              <a className="text-gray-500 no-underline hover:text-white" href="#landing">Privacy</a>
              <a className="text-gray-500 no-underline hover:text-white" href="#landing">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
