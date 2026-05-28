/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'
import { DentalGrowthReviewPage } from '../../pages/dashboards/dental-growth-review'
import { BackendApiRequiredPage } from '../../pages/system/backend-api-required/BackendApiRequiredPage'

const LoadingFallback = () => <div className="p-6 text-ui text-text-muted">Loading...</div>

function withPageProps(PageComponent, HeaderComponent) {
  return function PageWithProps() {
    const { runtime, onAuthChange, onSignOut } = useAuth()
    const [searchParams] = useSearchParams()
    const routeParams = Object.fromEntries(searchParams.entries())

    return (
      <Suspense fallback={<LoadingFallback />}>
        <PageComponent
          header={HeaderComponent}
          onAuthChange={onAuthChange}
          onSignOut={onSignOut}
          routeParams={routeParams}
          runtime={runtime}
        />
      </Suspense>
    )
  }
}

function AccountSettingsPage() {
  return (
    <BackendApiRequiredPage
      description="Account profile, security, notification, and deactivation settings must use backend account endpoints. The old local profile settings workflow has been disabled."
      returnHref="/"
      returnLabel="Back to home"
      title="Account settings API required"
    />
  )
}

function AdminClientsPage() {
  return (
    <BackendApiRequiredPage
      description="Client/workspace creation and management must use backend workspace and agency relationship endpoints. The old local client setup workflow has been disabled."
      title="Workspace management API required"
    />
  )
}

function AdminClientAccessPage() {
  return (
    <BackendApiRequiredPage
      description="Workspace access management must use backend membership and invitation endpoints. The old local access workflow has been disabled."
      title="Access management API required"
    />
  )
}

function AdminClinicSetupPage() {
  return (
    <BackendApiRequiredPage
      description="Clinic setup must use backend workspace, clinic profile, location, and service line endpoints. The old local setup workflow has been disabled."
      title="Clinic setup API required"
    />
  )
}

function AdminClinicDataSourcesPage() {
  return (
    <BackendApiRequiredPage
      description="Clinic data source setup must use backend integration endpoints. The old local source-configuration workflow has been disabled."
      title="Data sources API required"
    />
  )
}

function ClientSettingsPage() {
  return (
    <BackendApiRequiredPage
      description="Workspace settings must use backend workspace profile, team, access, and deletion endpoints. The old local client settings workflow has been disabled."
      title="Workspace settings API required"
    />
  )
}

export const AccountSettingsPageRoute = withPageProps(AccountSettingsPage, undefined)
export const AdminClientAccessPageRoute = withPageProps(AdminClientAccessPage, undefined)
export const AdminClientsPageRoute = withPageProps(AdminClientsPage, undefined)
export const AdminClinicDataSourcesPageRoute = withPageProps(AdminClinicDataSourcesPage, undefined)
export const AdminClinicSetupPageRoute = withPageProps(AdminClinicSetupPage, undefined)
export const ClientSettingsPageRoute = withPageProps(ClientSettingsPage, undefined)
export const DentalGrowthReviewPageRoute = withPageProps(DentalGrowthReviewPage, undefined)
