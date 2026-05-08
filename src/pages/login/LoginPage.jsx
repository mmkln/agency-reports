import { Icon } from '../../shared/icons'
import { BrandLogo } from '../../shared/ui'

function handleSubmit(event) {
  event.preventDefault()
  window.location.hash = 'crm-dashboard'
}

export function LoginPage() {
  return (
    <main className="min-h-screen bg-public-background px-4 py-8 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-indigo-100/80 bg-white shadow-[0_24px_70px_rgba(90,69,255,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden border-r border-indigo-100/80 bg-gradient-to-br from-white via-public-background to-indigo-50/70 p-10 text-heading lg:flex lg:flex-col lg:justify-between">
          <div>
            <BrandLogo href="#login" />

            <div className="mt-16 max-w-sm">
              <p className="mb-3 text-sm font-semibold tracking-wide text-brand uppercase">Clinic CRM</p>
              <h1 className="m-0 text-4xl leading-tight font-bold tracking-tight">
                Secure access for patient growth operations.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600">
                Review patients, campaigns, appointments, and revenue reports from one workspace.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-indigo-100 bg-white/80 p-5 shadow-xs backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Today appointments</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">+5%</span>
              </div>
              <strong className="mt-3 block text-3xl leading-9 text-heading">156</strong>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-indigo-100">
                <div className="h-full w-[72%] rounded-full bg-brand" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-xs backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Icon name="shieldCheck" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-heading">Protected workspace</p>
                <p className="text-sm text-slate-500">Role-based patient data access</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <BrandLogo href="#login" />
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-indigo-600">Welcome back</p>
              <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use your clinic email to continue to the CRM dashboard.
              </p>
            </div>

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Email address</span>
                <span className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Icon name="mail" size={18} />
                  </span>
                  <input
                    autoComplete="email"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pr-3 pl-10 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition-colors focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    defaultValue="admin@dentalflow.com"
                    name="email"
                    type="email"
                  />
                </span>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <span className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Icon name="lock" size={18} />
                  </span>
                  <input
                    autoComplete="current-password"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pr-3 pl-10 text-sm text-slate-900 placeholder-slate-400 shadow-xs transition-colors focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    defaultValue="password"
                    name="password"
                    type="password"
                  />
                </span>
              </label>

              <div className="flex items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                  <input
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    defaultChecked
                    type="checkbox"
                  />
                  Remember me
                </label>
                <a className="text-sm font-medium text-indigo-600 no-underline hover:text-indigo-700" href="#login">
                  Forgot password?
                </a>
              </div>

              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                type="submit"
              >
                Sign in
              </button>
            </form>

            <div className="mt-6 grid gap-3">
              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs ring-1 ring-slate-200 ring-inset transition-colors hover:bg-slate-50"
                type="button"
              >
                Continue with Google
              </button>
              <p className="text-center text-sm text-slate-500">
                Need access? <a className="font-medium text-indigo-600 no-underline hover:text-indigo-700" href="#login">Contact clinic admin</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
