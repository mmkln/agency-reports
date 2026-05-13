import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react'
import { Toast as ToastPrimitive } from 'radix-ui'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ToastContext } from './toastContext'

const toneConfig = {
  error: {
    icon: XCircle,
    iconClassName: 'bg-destructive/10 text-rose-600',
    rootClassName: 'border-destructive/20',
  },
  info: {
    icon: Info,
    iconClassName: 'bg-action-muted text-action',
    rootClassName: 'border-action/20',
  },
  success: {
    icon: CheckCircle2,
    iconClassName: 'bg-success-muted text-success-foreground',
    rootClassName: 'border-success/20',
  },
  warning: {
    icon: TriangleAlert,
    iconClassName: 'bg-warning-muted text-warning-foreground',
    rootClassName: 'border-warning/20',
  },
}

function createToastId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function ToastItem({ toast, onDismiss }) {
  const config = toneConfig[toast.tone] ?? toneConfig.info
  const Icon = config.icon

  return (
    <ToastPrimitive.Root
      className={cn(
        'grid w-[calc(100vw-2rem)] max-w-sm grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-control border bg-block p-4 shadow-premium outline-none',
        'data-open:animate-in data-open:slide-in-from-right-4 data-open:fade-in-0 data-closed:animate-out data-closed:slide-out-to-right-4 data-closed:fade-out-0',
        config.rootClassName,
      )}
      duration={toast.duration}
      onOpenChange={(open) => {
        if (!open) {
          onDismiss(toast.id)
        }
      }}
      open
    >
      <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-control', config.iconClassName)}>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <ToastPrimitive.Title className="text-sm font-semibold leading-5 text-text-primary">
          {toast.title}
        </ToastPrimitive.Title>
        {toast.description ? (
          <ToastPrimitive.Description className="mt-1 text-sm leading-5 text-text-muted">
            {toast.description}
          </ToastPrimitive.Description>
        ) : null}
      </div>
      <ToastPrimitive.Close asChild>
        <Button
          aria-label="Dismiss notification"
          className="-mt-1 -mr-1 text-text-quaternary hover:text-text-secondary"
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((toastId) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId))
  }, [])

  const show = useCallback((toast) => {
    const toastId = createToastId()

    setToasts((currentToasts) => [
      ...currentToasts.slice(-2),
      {
        description: '',
        duration: 4200,
        tone: 'info',
        ...toast,
        id: toastId,
      },
    ])

    return toastId
  }, [])

  const value = useMemo(() => ({
    dismiss,
    error: (title, description, options = {}) => show({ ...options, description, title, tone: 'error' }),
    info: (title, description, options = {}) => show({ ...options, description, title, tone: 'info' }),
    show,
    success: (title, description, options = {}) => show({ ...options, description, title, tone: 'success' }),
    warning: (title, description, options = {}) => show({ ...options, description, title, tone: 'warning' }),
  }), [dismiss, show])

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((toast) => (
          <ToastItem key={toast.id} onDismiss={dismiss} toast={toast} />
        ))}
        <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-[100] grid max-h-[calc(100vh-2rem)] gap-3 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
