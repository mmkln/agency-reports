import { Link } from 'react-router-dom'

import { Icon } from '../../shared/icons'
import {
  BrandLogo,
  Button,
  CardContent,
  Input,
  PrimitiveCard as Card,
} from '../../shared/ui'

export function PasswordResetLayout({ children, eyebrow, title, description }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background-grouped-tertiary px-app-gutter py-page text-text-primary">
      <div className="mx-auto w-full max-w-modal-lg">
        <Card className="w-full overflow-hidden border border-block-border bg-block p-0 py-0">
          <CardContent className="grid gap-panel p-panel lg:p-page">
            <div className="flex items-center justify-between gap-component">
              <BrandLogo href="/" size="sm" variant="static" />
              <Button asChild size="sm" variant="ghost">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
            <div className="mx-auto grid w-full max-w-form gap-card">
              <div>
                {eyebrow ? <p className="text-ui text-brand">{eyebrow}</p> : null}
                <h1 className="mt-item text-display text-text-primary">{title}</h1>
                {description ? (
                  <p className="mt-item text-body text-text-secondary">{description}</p>
                ) : null}
              </div>
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export function FieldError({ children }) {
  if (!children) {
    return null
  }

  return <p className="text-label text-destructive" role="alert">{children}</p>
}

export function PasswordResetInput({ error, label, ...props }) {
  return (
    <label className="grid gap-item">
      <span className="text-label text-text-secondary">{label}</span>
      <Input aria-invalid={Boolean(error)} {...props} />
      <FieldError>{error}</FieldError>
    </label>
  )
}

export function PasswordResetState({ action, children, iconName = 'circleAlert', title }) {
  return (
    <div className="grid gap-component rounded-block bg-block-subtle p-card text-center">
      <Icon className="mx-auto text-text-quaternary" name={iconName} size={34} />
      <h2 className="text-heading text-text-primary">{title}</h2>
      {children ? <p className="text-body text-text-secondary">{children}</p> : null}
      {action}
    </div>
  )
}

export function ResetTokenSummary({ reset }) {
  if (!reset) {
    return null
  }

  return (
    <div className="grid gap-item rounded-block bg-block-subtle p-card">
      <p className="text-label text-text-muted">Account</p>
      <p className="truncate text-ui text-text-primary">{reset.email}</p>
      {reset.expires_at ? (
        <p className="text-label text-text-secondary">
          Link expires {new Date(reset.expires_at).toLocaleString()}
        </p>
      ) : null}
    </div>
  )
}
