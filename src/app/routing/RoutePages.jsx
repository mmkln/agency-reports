/* eslint-disable react-refresh/only-export-components */
import { Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../providers/auth/useAuth'
import { DentalGrowthReviewPage } from '../../pages/dashboards/dental-growth-review'
import { AccountSettingsPage } from '../../pages/account/settings/AccountSettingsPage'
import { AdminClientsPage } from '../../pages/admin/clients/AdminClientsPage'
import { AdminClientAccessPage } from '../../pages/admin/client-access/AdminClientAccessPage'
import { AdminClinicDataSourcesPage } from '../../pages/admin/clinic-data-sources/AdminClinicDataSourcesPage'
import { AdminClinicSetupPage } from '../../pages/admin/clinic-setup/AdminClinicSetupPage'
import { ClientSettingsPage } from '../../pages/client/settings/ClientSettingsPage'

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

export const AccountSettingsPageRoute = withPageProps(AccountSettingsPage, undefined)
export const AdminClientAccessPageRoute = withPageProps(AdminClientAccessPage, undefined)
export const AdminClientsPageRoute = withPageProps(AdminClientsPage, undefined)
export const AdminClinicDataSourcesPageRoute = withPageProps(AdminClinicDataSourcesPage, undefined)
export const AdminClinicSetupPageRoute = withPageProps(AdminClinicSetupPage, undefined)
export const ClientSettingsPageRoute = withPageProps(ClientSettingsPage, undefined)
export const DentalGrowthReviewPageRoute = withPageProps(DentalGrowthReviewPage, undefined)
