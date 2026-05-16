import {
  Button,
  Input,
  Textarea,
} from '@/shared/ui'

import {
  PERFORMANCE_SERVICE_TYPE_META,
  PERFORMANCE_SERVICE_TYPES,
} from '../../../../entities/performance-dashboard'
import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  createServiceMetricEntry,
  createServiceSection,
  createServiceTextItem,
  optionLabel,
  stringValue,
} from '../../model'
import {
  FormField,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function ServiceSectionsSection({
  addNestedArrayItem,
  form,
  removeNestedArrayItem,
  removeArrayItem,
  updateArrayItem,
  updateContent,
  updateNestedArrayItem,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('service_sections', [...form.content.service_sections, createServiceSection()])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Service
        </Button>
      )}
      description="Service-specific client detail for paid ads, SEO, social, email/SMS, lead generation, CRO, or full-service work."
      iconName="grid"
      title="Service Detail Sections"
    >
      <div className="grid gap-3">
        {form.content.service_sections.length ? form.content.service_sections.map((section, index) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={section.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Service {index + 1}</p>
              <Button onClick={() => removeArrayItem('service_sections', section.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3">
              <SelectField label="Service type" onChange={(value) => updateArrayItem('service_sections', section.id, 'service_type', value)} value={section.service_type ?? PERFORMANCE_SERVICE_TYPES.FULL_SERVICE}>
                {Object.values(PERFORMANCE_SERVICE_TYPES).map((serviceType) => (
                  <option key={serviceType} value={serviceType}>
                    {PERFORMANCE_SERVICE_TYPE_META[serviceType]?.label ?? optionLabel(serviceType)}
                  </option>
                ))}
              </SelectField>
              <FormField label="Summary">
                <Textarea
                  aria-label="Service summary"
                  onChange={(event) => updateArrayItem('service_sections', section.id, 'summary', event.target.value)}
                  rows={3}
                  value={section.summary ?? ''}
                />
              </FormField>
              <ServiceMetricsEditor
                items={section.metrics_entries ?? []}
                onAdd={() => addNestedArrayItem('service_sections', section.id, 'metrics_entries', createServiceMetricEntry())}
                onRemove={(entryId) => removeNestedArrayItem('service_sections', section.id, 'metrics_entries', entryId)}
                onUpdate={(entryId, field, value) => updateNestedArrayItem('service_sections', section.id, 'metrics_entries', entryId, field, value)}
              />
              <TextListEditor
                addLabel="Add Insight"
                emptyText="Add at least one plain-language note explaining what changed for this service."
                emptyTitle="No service insights"
                items={section.insights ?? []}
                onAdd={() => addNestedArrayItem('service_sections', section.id, 'insights', createServiceTextItem())}
                onRemove={(itemId) => removeNestedArrayItem('service_sections', section.id, 'insights', itemId)}
                onUpdate={(itemId, value) => updateNestedArrayItem('service_sections', section.id, 'insights', itemId, 'text', value)}
                placeholder="Google Ads drove the most reliable appointment requests."
                title="Service insights"
              />
              <TextListEditor
                addLabel="Add Action"
                emptyText="Add the next optimization, test, or recommendation for this service."
                emptyTitle="No service next actions"
                items={section.next_actions ?? []}
                onAdd={() => addNestedArrayItem('service_sections', section.id, 'next_actions', createServiceTextItem())}
                onRemove={(itemId) => removeNestedArrayItem('service_sections', section.id, 'next_actions', itemId)}
                onUpdate={(itemId, value) => updateNestedArrayItem('service_sections', section.id, 'next_actions', itemId, 'text', value)}
                placeholder="Increase exact-match search budget gradually."
                title="Service next actions"
              />
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="grid" title="No service sections yet">
            Add service detail only when a channel needs more explanation than the executive view.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}

function ServiceMetricsEditor({
  items,
  onAdd,
  onRemove,
  onUpdate,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-secondary">Service metrics</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          Add Metric
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((entry) => (
          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" key={entry.id}>
            <Input
              aria-label="Metric key"
              onChange={(event) => onUpdate(entry.id, 'key', event.target.value)}
              placeholder="qualified_leads"
              value={entry.key ?? ''}
            />
            <Input
              aria-label="Metric value"
              onChange={(event) => onUpdate(entry.id, 'value', event.target.value)}
              placeholder="63"
              value={stringValue(entry.value)}
            />
            <Button onClick={() => onRemove(entry.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="barChart" title="No service metrics">
            Add a small set of service-specific metrics only when they help explain the channel.
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}

function TextListEditor({
  addLabel,
  emptyText,
  emptyTitle,
  items,
  onAdd,
  onRemove,
  onUpdate,
  placeholder,
  title,
}) {
  return (
    <div className="rounded-control border border-control-border bg-block p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-label text-text-secondary">{title}</p>
        <Button onClick={onAdd} size="sm" type="button" variant="outline">
          {addLabel}
        </Button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((item) => (
          <div className="grid gap-2 md:grid-cols-[1fr_auto]" key={item.id}>
            <Input
              aria-label={title}
              onChange={(event) => onUpdate(item.id, event.target.value)}
              placeholder={placeholder}
              value={item.text ?? ''}
            />
            <Button onClick={() => onRemove(item.id)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        )) : (
          <InlineEmptyState iconName="messageSquare" title={emptyTitle}>
            {emptyText}
          </InlineEmptyState>
        )}
      </div>
    </div>
  )
}
