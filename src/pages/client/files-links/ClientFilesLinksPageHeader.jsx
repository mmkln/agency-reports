import { PageHeader } from '@/shared/ui'

export function ClientFilesLinksPageHeader({ activeRoute }) {
  return <PageHeader title="Files & Links" width={activeRoute?.contentWidth} />
}
