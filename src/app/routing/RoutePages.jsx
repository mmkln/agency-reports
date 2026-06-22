/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'
import { DentalGrowthReviewPage } from '../../pages/dashboards/dental-growth-review'
import { AccountSettingsPage } from '../../pages/account/settings/AccountSettingsPage'
import { AgencyWorkspaceAccessPage } from '../../pages/agency/workspace-access/AgencyWorkspaceAccessPage'
import { AgencyWorkspaceDataPage } from '../../pages/agency/workspace-data/AgencyWorkspaceDataPage'
import { AgencyWorkspaceReviewPage } from '../../pages/agency/workspace-review/AgencyWorkspaceReviewPage'
import { AgencyWorkspaceReviewSetupPage } from '../../pages/agency/workspace-review-setup/AgencyWorkspaceReviewSetupPage'
import { AgencyWorkspaceSetupPage } from '../../pages/agency/workspace-setup/AgencyWorkspaceSetupPage'
import { AdminClientDetailPage } from '../../pages/admin/client-detail/AdminClientDetailPage'
import { AdminClientsPage } from '../../pages/admin/clients/AdminClientsPage'
import { AdminClientAccessPage } from '../../pages/admin/client-access/AdminClientAccessPage'
import { AdminWorkspacesPage } from '../../pages/admin/workspaces/AdminWorkspacesPage'
import { ClientSettingsPage } from '../../pages/client/settings/ClientSettingsPage'
import { PortalWorkspaceReviewPage } from '../../pages/portal/workspace-review/PortalWorkspaceReviewPage'

const LoadingFallback = () => <div className="p-6 text-ui text-text-muted">Loading...</div>

function withPageProps(PageComponent, HeaderComponent) {
  return function PageWithProps() {
    const { runtime, onAuthChange, onSignOut } = useAuth()
    const params = useParams()
    const [searchParams] = useSearchParams()
    const routeParams = {
      ...params,
      ...Object.fromEntries(searchParams.entries()),
    }

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

export const AccountSettingsPageRoute = withPageProps(AccountSettingsPage, undefined)
export const AgencyWorkspaceAccessPageRoute = withPageProps(AgencyWorkspaceAccessPage, undefined)
export const AgencyWorkspaceDataPageRoute = withPageProps(AgencyWorkspaceDataPage, undefined)
export const AgencyWorkspaceReviewPageRoute = withPageProps(AgencyWorkspaceReviewPage, undefined)
export const AgencyWorkspaceReviewSetupPageRoute = withPageProps(AgencyWorkspaceReviewSetupPage, undefined)
export const AgencyWorkspaceSetupPageRoute = withPageProps(AgencyWorkspaceSetupPage, undefined)
export const AdminClientAccessPageRoute = withPageProps(AdminClientAccessPage, undefined)
export const AdminClientDetailPageRoute = withPageProps(AdminClientDetailPage, undefined)
export const AdminClientsPageRoute = withPageProps(AdminClientsPage, undefined)
export const AdminWorkspacesPageRoute = withPageProps(AdminWorkspacesPage, undefined)
export const ClientSettingsPageRoute = withPageProps(ClientSettingsPage, undefined)
export const DentalGrowthReviewPageRoute = withPageProps(DentalGrowthReviewPage, undefined)
export const PortalWorkspaceReviewPageRoute = withPageProps(PortalWorkspaceReviewPage, undefined)
