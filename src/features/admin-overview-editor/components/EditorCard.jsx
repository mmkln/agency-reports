import {
  CardContent,
  CardTitle,
  PrimitiveCard as Card,
  PrimitiveCardHeader as CardHeader,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

export function EditorCard({ action, children, description, iconName, title }) {
  return (
    <Card className="gap-0 bg-block py-0 shadow-none">
      <CardHeader className="border-b border-separator px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-ui text-text-primary">
              {iconName ? <Icon className="text-text-quaternary" name={iconName} size={15} /> : null}
              {title}
            </CardTitle>
            {description ? <p className="mt-1 text-label font-normal text-text-muted">{description}</p> : null}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}
