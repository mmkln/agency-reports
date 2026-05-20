import {
  CodeValue,
  Panel,
  PanelBody,
  PanelHeader,
  PropertyGrid,
  SectionNav,
  UnavailableState,
} from '@/shared/ui'
import { useLocation } from 'react-router-dom'

import { ClientProfileSettings } from '../../features/client-profile-settings'
import { ClientTeamManagement } from '../../features/client-team-management'

const settingsSections = [
  {
    id: 'general',
    iconName: 'user',
    label: 'General',
  },
  {
    id: 'team',
    iconName: 'users',
    label: 'Team',
  },
  {
    id: 'notifications',
    iconName: 'bell',
    label: 'Notifications',
  },
  {
    id: 'security',
    iconName: 'lock',
    label: 'Security',
  },
]

function getSelectedSection(sectionId) {
  return settingsSections.some((section) => section.id === sectionId) ? sectionId : 'general'
}

function getSectionHref(sectionId, routeParams = {}, pathname = '/client/settings') {
  const nextParams = new URLSearchParams()

  Object.entries(routeParams).forEach(([key, value]) => {
    if (key !== 'section' && value != null && value !== '') {
      nextParams.set(key, value)
    }
  })

  if (sectionId !== 'general') {
    nextParams.set('section', sectionId)
  }

  const search = nextParams.toString()

  return `${pathname}${search ? `?${search}` : ''}`
}

function ClientSettingsNavigation({ routeParams, selectedSection }) {
  const location = useLocation()

  return (
    <SectionNav
      ariaLabel="Settings sections"
      className="lg:sticky lg:top-control-xl"
      items={settingsSections.map((section) => ({
        ...section,
        to: getSectionHref(section.id, routeParams, location.pathname),
      }))}
      selectedId={selectedSection}
    />
  )
}

export function CompanySettingsSection({ client }) {
  return (
    <Panel>
      <PanelHeader
        divided
        subtitle="The workspace connected to your account."
        title="Company"
      />
      <PanelBody>
        <PropertyGrid
          columns={2}
          items={[
            {
              label: 'Account',
              value: client.name,
            },
            {
              label: 'Portal slug',
              value: <CodeValue>{client.portalSlug}</CodeValue>,
            },
            {
              label: 'Primary contact',
              value: client.primaryContactName,
            },
            {
              label: 'Primary contact email',
              value: client.primaryContactEmail,
            },
          ]}
        />
      </PanelBody>
    </Panel>
  )
}

export function UnavailableSettingsSection({ iconName, section, title }) {
  return (
    <Panel className="min-h-[360px]">
      <PanelBody className="flex min-h-[360px] items-center justify-center">
        <UnavailableState
          className="bg-transparent p-0"
          description={section.message}
          iconName={iconName}
          title={title}
        />
      </PanelBody>
    </Panel>
  )
}

function GeneralSettingsSection({ page, runtime }) {
  return (
    <div className="grid gap-card">
      <ClientProfileSettings
        clientId={page.client.id}
        membership={page.currentMembership}
        profile={page.profile}
        runtime={runtime}
      />
      <CompanySettingsSection client={page.client} />
    </div>
  )
}

function SelectedSettingsSection({ page, runtime, selectedSection }) {
  if (selectedSection === 'team') {
    return <ClientTeamManagement clientId={page.client.id} page={page} runtime={runtime} />
  }

  if (selectedSection === 'notifications') {
    return (
      <UnavailableSettingsSection
        iconName="bell"
        section={page.sections.notifications}
        title="Notification Settings"
      />
    )
  }

  if (selectedSection === 'security') {
    return (
      <UnavailableSettingsSection
        iconName="lock"
        section={page.sections.security}
        title="Security and Authorization"
      />
    )
  }

  return <GeneralSettingsSection page={page} runtime={runtime} />
}

export function ClientSettingsWorkspace({ page, routeParams = {}, runtime }) {
  const selectedSection = getSelectedSection(routeParams.section)

  return (
    <div className="grid items-start gap-card lg:grid-cols-[240px_minmax(0,1fr)]">
      <ClientSettingsNavigation routeParams={routeParams} selectedSection={selectedSection} />
      <SelectedSettingsSection page={page} runtime={runtime} selectedSection={selectedSection} />
    </div>
  )
}
