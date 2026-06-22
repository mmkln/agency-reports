import { Panel, PanelBody, PanelHeader, PropertyGrid } from '@/shared/ui'

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : 'Not updated'
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

export function ClientClinicDataTrust({ dataTrust, sourceLinks = [] }) {
  if (!dataTrust) {
    return null
  }

  const visibleSourceLinks = sourceLinks.filter((sourceLink) => sourceLink.publicUrl || sourceLink.embedUrl)

  return (
    <Panel>
      <PanelHeader
        subtitle="Published client views use aggregate clinic records and exclude patient-level data."
        title="Data trust"
      />
      <PanelBody className="grid gap-component">
        <PropertyGrid
          columns={4}
          items={[
            {
              label: 'Last updated',
              value: formatDate(dataTrust.lastUpdatedAt),
            },
            {
              label: 'Visibility',
              value: dataTrust.visibilityLabel,
            },
            {
              label: 'Sources',
              value: dataTrust.dataSourceLabel,
            },
            {
              label: 'Records shown',
              value: formatNumber(dataTrust.recordCount),
            },
          ]}
        />
        <p className="text-body text-text-secondary">
          {dataTrust.privacyBoundaryLabel}
        </p>
        {visibleSourceLinks.length ? (
          <div className="grid gap-item">
            <p className="text-label font-semibold text-text-primary">Source dashboards</p>
            <div className="flex flex-wrap gap-tag">
              {visibleSourceLinks.map((sourceLink) => (
                <a
                  className="text-ui text-accent hover:underline"
                  href={sourceLink.publicUrl || sourceLink.embedUrl}
                  key={sourceLink.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  {sourceLink.name}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </PanelBody>
    </Panel>
  )
}
