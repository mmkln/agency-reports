import { cn } from '@/lib/utils'
import { Icon } from '@/shared/icons'

const toneClass = {
  accent: {
    icon: 'bg-premium-purple/10 text-premium-purple',
    value: 'text-text-primary',
  },
  info: {
    icon: 'bg-premium-blue/10 text-premium-blue',
    value: 'text-text-primary',
  },
  negative: {
    icon: 'bg-destructive/10 text-destructive',
    value: 'text-text-primary',
  },
  neutral: {
    icon: 'bg-fill-secondary text-text-muted',
    value: 'text-text-primary',
  },
  positive: {
    icon: 'bg-success-muted text-success',
    value: 'text-success',
  },
  warning: {
    icon: 'bg-warning-muted text-warning-foreground',
    value: 'text-text-primary',
  },
}

const helperToneClass = {
  muted: 'text-text-muted',
  negative: 'text-destructive',
  neutral: 'text-text-secondary',
  positive: 'text-success-foreground',
}

function getIconPresentation({ emphasis, hasLabel, variant }) {
  if (variant === 'featured' || emphasis === 'strong') {
    return { className: 'size-10', size: 19 }
  }

  if (variant === 'activity' && !hasLabel) {
    return { className: 'size-8', size: 15 }
  }

  return { className: 'size-9', size: 17 }
}

function MetricLabel({ action, children, subdued = false }) {
  if (!children) {
    return null
  }

  return (
    <div className="flex min-w-0 items-center gap-tag">
      <p className={cn(
        'truncate text-label',
        subdued
          ? 'font-medium leading-4 text-text-muted'
          : 'font-semibold text-text-primary',
      )}>
        {children}
      </p>
      {action}
    </div>
  )
}

function StandardMetricContent({ action, emphasis, helper, helperTitle, helperTone, label, tone, value }) {
  const isStrong = emphasis === 'strong'

  return (
    <div className="min-w-0 flex-1 text-left">
      <MetricLabel action={action} subdued={isStrong}>{label}</MetricLabel>
      <p className={cn(
        isStrong
          ? 'mt-tag text-[30px] font-semibold leading-[34px] tracking-normal'
          : 'mt-micro text-[26px] font-semibold leading-[30px]',
        'tabular-nums',
        tone.value,
      )}>
        {value}
      </p>
      {helper ? (
        <p
          className={cn('mt-tag truncate text-label font-medium', helperToneClass[helperTone] ?? helperToneClass.neutral)}
          title={helperTitle}
        >
          {helper}
        </p>
      ) : null}
    </div>
  )
}

function FeaturedMetricContent({ action, helper, label, tone, value }) {
  return (
    <div className="min-w-0 flex-1 text-left">
      <MetricLabel action={action} subdued>{label}</MetricLabel>
      <p className="mt-tag flex flex-wrap items-baseline gap-x-2">
        <span className={cn(
          'text-[40px] font-semibold leading-[42px] tracking-normal tabular-nums',
          tone.value,
        )}>
          {value}
        </span>
        {helper ? (
          <span className="text-ui font-normal leading-5 text-text-secondary">{helper}</span>
        ) : null}
      </p>
    </div>
  )
}

function ActivityMetricContent({ action, helper, helperTitle, label, tone, value }) {
  return (
    <div className="min-w-0 flex-1 text-left">
      <MetricLabel action={action}>{label}</MetricLabel>
      <p className={cn(
        label
          ? 'mt-micro text-[26px] font-semibold leading-[30px]'
          : 'text-[22px] font-semibold leading-[26px] tracking-normal',
        'tabular-nums',
        tone.value,
      )}>
        {value}
      </p>
      {helper ? (
        <div className="mt-tag flex min-w-0 items-center gap-tag">
          <p
            className={cn(
              'truncate',
              label
                ? 'text-label font-medium text-text-muted'
                : 'text-ui font-normal leading-5 text-text-secondary',
            )}
            title={helperTitle}
          >
            {helper}
          </p>
          {!label ? action : null}
        </div>
      ) : null}
    </div>
  )
}

export function MetricTileDashboard({
  action,
  className,
  emphasis,
  helper,
  helperTitle,
  helperTone,
  iconName,
  inspectorId,
  label,
  tone,
  value,
  valueTone,
  variant,
}) {
  const classes = toneClass[tone] ?? toneClass.neutral
  const contentClasses = {
    ...classes,
    value: (toneClass[valueTone] ?? classes).value,
  }
  const icon = getIconPresentation({ emphasis, hasLabel: Boolean(label), variant })
  const contentProps = {
    action,
    emphasis,
    helper,
    helperTitle,
    helperTone,
    label,
    tone: contentClasses,
    value,
  }

  return (
    <article
      className={cn(
        'flex min-h-[92px] min-w-0 items-center rounded-block bg-block px-4 py-3 text-text-primary shadow-block',
        variant === 'featured' || emphasis === 'strong' ? 'gap-3' : 'gap-control',
        className,
      )}
      id={inspectorId}
    >
      {iconName ? (
        <span className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-control',
          icon.className,
          classes.icon,
        )}>
          <Icon name={iconName} size={icon.size} />
        </span>
      ) : null}

      {variant === 'featured' ? <FeaturedMetricContent {...contentProps} /> : null}
      {variant === 'standard' ? <StandardMetricContent {...contentProps} /> : null}
      {variant === 'activity' ? <ActivityMetricContent {...contentProps} /> : null}
    </article>
  )
}
