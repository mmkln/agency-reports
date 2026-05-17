import { PageHeader } from '@/shared/ui'

export function ClientUpdatesPageHeader({ activeRoute }) {
  return <PageHeader title="Updates" width={activeRoute?.contentWidth} />
}
