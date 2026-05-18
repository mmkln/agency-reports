import { PageHeader } from '@/shared/ui'

export function ClientSettingsPageHeader({ activeRoute }) {
  return <PageHeader title="Settings" width={activeRoute?.contentWidth} />
}
