import { Link } from 'react-router-dom'

import {
  Button,
  Panel,
  PanelBody,
  PanelHeader,
} from '@/shared/ui'

export function BackendApiRequiredPage({
  description = 'This workflow no longer uses local demo data. Connect the backend API endpoint before enabling it again.',
  returnHref = '/account/settings',
  returnLabel = 'Back to account',
  title = 'Backend API required',
}) {
  return (
    <Panel className="mx-auto max-w-3xl">
      <PanelHeader
        divided
        title={title}
      />
      <PanelBody className="grid gap-card">
        <p className="max-w-readable text-body text-text-secondary">
          {description}
        </p>
        <div>
          <Button asChild variant="secondary">
            <Link to={returnHref}>{returnLabel}</Link>
          </Button>
        </div>
      </PanelBody>
    </Panel>
  )
}
