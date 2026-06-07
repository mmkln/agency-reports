import { PageHeader } from '@/shared/ui'

export function DentalGrowthReviewPageHeader({ activeRoute }) {
  return (
    <PageHeader
      title={activeRoute.pageTitle ?? activeRoute.label}
      width={activeRoute.contentWidth}
    />
  )
}
