import {
  Button,
  CodeValue,
  ConfirmationDialog,
  Panel,
  PanelBody,
  PanelHeader,
  PropertyGrid,
  SectionNav,
  UnavailableState,
} from '@/shared/ui'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

import { CLIENT_MEMBERSHIP_ROLES } from '../../entities/client-membership'
import { leaveClientWorkspace } from '../../domain/services/clientMembershipService'
import { createBusinessDeletionRequest } from '../../domain/services/clientRequestsService'
import { ClientTeamManagement } from '../../features/client-team-management'
import { useToast } from '../../shared/notifications'

const settingsSections = [
  {
    id: 'company',
    iconName: 'settings',
    label: 'Company',
  },
  {
    id: 'team',
    iconName: 'users',
    label: 'Team',
  },
  {
    id: 'access',
    iconName: 'lock',
    label: 'Access',
  },
]

function getSelectedSection(sectionId) {
  return settingsSections.some((section) => section.id === sectionId) ? sectionId : 'company'
}

function createUuid() {
  return crypto.randomUUID()
}

function getSectionHref(sectionId, routeParams = {}, pathname = '/client/settings') {
  const nextParams = new URLSearchParams()

  Object.entries(routeParams).forEach(([key, value]) => {
    if (key !== 'section' && value != null && value !== '') {
      nextParams.set(key, value)
    }
  })

  if (sectionId !== 'company') {
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
        subtitle="The client workspace connected to this portal."
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

function WorkspaceAccessSection({ onAuthChange, page, runtime }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleteRequestConfirmOpen, setIsDeleteRequestConfirmOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [deleteRequestStatus, setDeleteRequestStatus] = useState('idle')
  const ownerCount = page.members.filter((member) => member.role === CLIENT_MEMBERSHIP_ROLES.OWNER).length
  const isLastOwner = page.currentMembership?.role === CLIENT_MEMBERSHIP_ROLES.OWNER && ownerCount <= 1
  const canLeave = Boolean(page.currentMembership && !isLastOwner && status !== 'leaving')
  const businessDeletionRequest = page.sections.access?.businessDeletionRequest ?? null
  const canRequestBusinessDeletion = Boolean(
    page.sections.access?.canRequestBusinessDeletion
    && !businessDeletionRequest
    && deleteRequestStatus !== 'submitting',
  )

  function leaveWorkspace() {
    if (!canLeave) {
      return
    }

    setStatus('leaving')
    void runtime.dataClient.write((repositories) => leaveClientWorkspace({
      clientId: page.client.id,
      repositories,
      viewer: runtime.viewer,
    })).then(() => {
      setIsConfirmOpen(false)
      toast.success('Workspace left', 'Your access to this client workspace was removed.')
      onAuthChange?.()
      navigate('/access-denied', { replace: true })
    }).catch((error) => {
      setStatus('idle')
      toast.error('Workspace was not left', error.message)
    })
  }

  function requestBusinessDeletion() {
    if (!canRequestBusinessDeletion) {
      return
    }

    setDeleteRequestStatus('submitting')
    void runtime.dataClient.write((repositories) => createBusinessDeletionRequest({
      activityIdGenerator: createUuid,
      idGenerator: createUuid,
      input: {
        clientId: page.client.id,
      },
      repositories,
      viewer: runtime.viewer,
    })).then((request) => {
      setIsDeleteRequestConfirmOpen(false)
      setDeleteRequestStatus('submitted')
      toast.success('Deletion request submitted', `${request.title} was sent to the agency team.`)
    }).catch((error) => {
      setDeleteRequestStatus('idle')
      toast.error('Deletion request was not submitted', error.message)
    })
  }

  return (
    <Panel>
      <PanelHeader
        action={page.currentMembership ? (
          <Button
            disabled={!canLeave}
            onClick={() => setIsConfirmOpen(true)}
            type="button"
            variant="destructive"
          >
            {status === 'leaving' ? 'Leaving...' : 'Leave workspace'}
          </Button>
        ) : null}
        divided
        subtitle="Your access level for this client workspace."
        title="Access"
      />
      <PanelBody className="grid gap-card">
        <PropertyGrid
          columns={2}
          items={[
            {
              label: 'Workspace role',
              value: page.currentMembership?.roleLabel ?? 'No membership',
            },
            {
              label: 'Access status',
              value: page.currentMembership ? 'Active' : 'Unavailable',
            },
          ]}
        />
        <UnavailableState
          className="bg-transparent p-0"
          description={isLastOwner
            ? 'Transfer ownership to another owner before leaving this workspace.'
            : 'Leaving the workspace removes your active access but keeps historical records intact.'}
          iconName="lock"
          title={isLastOwner ? 'Ownership transfer required' : 'Workspace access is controlled'}
        />
        <div className="rounded-control bg-block-subtle p-card">
          <div className="flex flex-col gap-control sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-ui font-semibold text-text-primary">Business deletion request</h3>
              <p className="mt-tag max-w-readable text-body text-text-muted">
                {businessDeletionRequest
                  ? 'A deletion request is already waiting for agency review.'
                  : 'Ask the agency team to review and process deletion of this client workspace.'}
              </p>
              {businessDeletionRequest ? (
                <p className="mt-item text-label text-text-secondary">
                  Request status: {businessDeletionRequest.status}
                </p>
              ) : null}
            </div>
            <Button
              disabled={!canRequestBusinessDeletion}
              onClick={() => setIsDeleteRequestConfirmOpen(true)}
              type="button"
              variant="destructive"
            >
              {deleteRequestStatus === 'submitting' ? 'Submitting...' : 'Request deletion'}
            </Button>
          </div>
        </div>
      </PanelBody>
      <ConfirmationDialog
        confirmLabel="Leave workspace"
        description={`You will lose access to ${page.client.name}. Historical records will stay in the workspace.`}
        isConfirming={status === 'leaving'}
        onConfirm={leaveWorkspace}
        onOpenChange={setIsConfirmOpen}
        open={isConfirmOpen}
        title="Leave this workspace?"
        tone="destructive"
      />
      <ConfirmationDialog
        confirmLabel="Submit request"
        description={`This will notify the agency team that ${page.client.name} wants this business workspace deleted. No records will be removed automatically.`}
        isConfirming={deleteRequestStatus === 'submitting'}
        onConfirm={requestBusinessDeletion}
        onOpenChange={setIsDeleteRequestConfirmOpen}
        open={isDeleteRequestConfirmOpen}
        title="Request business deletion?"
        tone="destructive"
      />
    </Panel>
  )
}

function SelectedSettingsSection({ onAuthChange, page, runtime, selectedSection }) {
  if (selectedSection === 'team') {
    return <ClientTeamManagement clientId={page.client.id} page={page} runtime={runtime} />
  }

  if (selectedSection === 'access') {
    return <WorkspaceAccessSection onAuthChange={onAuthChange} page={page} runtime={runtime} />
  }

  return <CompanySettingsSection client={page.client} />
}

export function ClientSettingsWorkspace({ onAuthChange, page, routeParams = {}, runtime }) {
  const selectedSection = getSelectedSection(routeParams.section)

  return (
    <div className="grid items-start gap-card lg:grid-cols-[240px_minmax(0,1fr)]">
      <ClientSettingsNavigation routeParams={routeParams} selectedSection={selectedSection} />
      <SelectedSettingsSection
        onAuthChange={onAuthChange}
        page={page}
        runtime={runtime}
        selectedSection={selectedSection}
      />
    </div>
  )
}
