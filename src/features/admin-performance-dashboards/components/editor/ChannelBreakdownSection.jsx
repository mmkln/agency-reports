import {
  Button,
  Input,
  Textarea,
} from '@/shared/ui'

import {
  PERFORMANCE_CHANNEL_META,
  PERFORMANCE_CHANNELS,
} from '../../../../entities/performance-dashboard'
import {
  InlineEmptyState,
  WorkspaceCard,
} from '../../../admin-client-workspace/components/WorkspaceCard'
import {
  channelNumberFields,
  createChannelBreakdownItem,
  optionLabel,
  stringValue,
} from '../../model'
import {
  FormField,
  SelectField,
} from './AdminPerformanceDashboardEditorPrimitives'

export function ChannelBreakdownSection({
  form,
  removeArrayItem,
  updateArrayItem,
  updateContent,
}) {
  return (
    <WorkspaceCard
      action={(
        <Button
          onClick={() => updateContent('channel_breakdown', [
            ...form.content.channel_breakdown,
            createChannelBreakdownItem(),
          ])}
          size="sm"
          type="button"
          variant="outline"
        >
          Add Channel
        </Button>
      )}
      description="Compare channels by spend, results, efficiency, revenue, and a plain-language summary."
      iconName="barChart"
      title="Channel Breakdown"
    >
      <div className="grid gap-3">
        {form.content.channel_breakdown.length ? form.content.channel_breakdown.map((channel, index) => (
          <div className="rounded-control border border-control-border bg-surface-subtle p-3" key={channel.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-label text-text-muted">Channel {index + 1}</p>
              <Button onClick={() => removeArrayItem('channel_breakdown', channel.id)} size="sm" type="button" variant="ghost">Remove</Button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <SelectField label="Channel" onChange={(value) => updateArrayItem('channel_breakdown', channel.id, 'channel', value)} value={channel.channel ?? PERFORMANCE_CHANNELS.OTHER}>
                {Object.values(PERFORMANCE_CHANNELS).map((channelValue) => (
                  <option key={channelValue} value={channelValue}>
                    {PERFORMANCE_CHANNEL_META[channelValue]?.label ?? optionLabel(channelValue)}
                  </option>
                ))}
              </SelectField>
              {channelNumberFields.map(([fieldName, label]) => (
                <FormField key={fieldName} label={label}>
                  <Input
                    onChange={(event) => updateArrayItem('channel_breakdown', channel.id, fieldName, event.target.value)}
                    type="number"
                    value={stringValue(channel[fieldName])}
                  />
                </FormField>
              ))}
              <div className="md:col-span-2">
                <FormField label="What changed / channel summary">
                  <Textarea
                    onChange={(event) => updateArrayItem('channel_breakdown', channel.id, 'summary', event.target.value)}
                    placeholder="Explain the channel result in client-facing language."
                    rows={3}
                    value={channel.summary ?? ''}
                  />
                </FormField>
              </div>
            </div>
          </div>
        )) : (
          <InlineEmptyState iconName="barChart" title="No channels yet">
            Add channel rows for Google Ads, Meta Ads, SEO, Email/SMS, referrals, direct, or other meaningful sources.
          </InlineEmptyState>
        )}
      </div>
    </WorkspaceCard>
  )
}
