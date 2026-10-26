import { useState } from 'react'

import { Icon } from '@/shared/icons'
import { TooltipIconButton } from '@/shared/ui'

import { ContactCollectionDialog } from './ContactCollectionDialog'

export function ContactCollectionAction({ descriptor, period, runtime }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TooltipIconButton
        label={descriptor.label}
        onClick={() => setOpen(true)}
        size="xs"
        variant="ghost"
      >
        <Icon name="chevronRight" size={14} />
      </TooltipIconButton>
      <ContactCollectionDialog
        descriptor={descriptor}
        onOpenChange={setOpen}
        open={open}
        period={period}
        runtime={runtime}
      />
    </>
  )
}
