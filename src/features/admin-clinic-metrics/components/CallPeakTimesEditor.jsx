import { Button } from '@/shared/ui'

import {
  NumberField,
  TextField,
} from './MetricFields'

function createBlankPeakCallTime() {
  return {
    booked_from_calls: '',
    call_count: '',
    label: '',
    missed_calls: '',
  }
}

export function CallPeakTimesEditor({ metric, metricIndex, onUpdate }) {
  function updatePeakCallTime(itemIndex, fieldName, value) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      callBookingMetrics: currentDraft.callBookingMetrics.map((currentMetric, currentMetricIndex) => (
        currentMetricIndex === metricIndex
          ? {
            ...currentMetric,
            peak_call_times: (currentMetric.peak_call_times ?? []).map((item, currentItemIndex) => (
              currentItemIndex === itemIndex ? { ...item, [fieldName]: value } : item
            )),
          }
          : currentMetric
      )),
    }))
  }

  function addPeakCallTime() {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      callBookingMetrics: currentDraft.callBookingMetrics.map((currentMetric, currentMetricIndex) => (
        currentMetricIndex === metricIndex
          ? {
            ...currentMetric,
            peak_call_times: [
              ...(currentMetric.peak_call_times ?? []),
              createBlankPeakCallTime(),
            ],
          }
          : currentMetric
      )),
    }))
  }

  function removePeakCallTime(itemIndex) {
    onUpdate((currentDraft) => ({
      ...currentDraft,
      callBookingMetrics: currentDraft.callBookingMetrics.map((currentMetric, currentMetricIndex) => (
        currentMetricIndex === metricIndex
          ? {
            ...currentMetric,
            peak_call_times: (currentMetric.peak_call_times ?? []).filter((_, currentItemIndex) => (
              currentItemIndex !== itemIndex
            )),
          }
          : currentMetric
      )),
    }))
  }

  return (
    <div className="grid gap-component">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-label font-semibold text-text-primary">Peak call times</p>
          <p className="text-label text-text-muted">Aggregate call windows only. Do not paste patient call records.</p>
        </div>
        <Button onClick={addPeakCallTime} size="sm" type="button" variant="outline">
          Add time window
        </Button>
      </div>
      {(metric.peak_call_times ?? []).map((item, itemIndex) => (
        <div className="grid gap-component rounded-control bg-block p-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]" key={`peak-call-time-${metricIndex}-${itemIndex}`}>
          <TextField
            label="Time window"
            onChange={(value) => updatePeakCallTime(itemIndex, 'label', value)}
            placeholder="Mon 9-11 AM"
            value={item.label}
          />
          <NumberField
            label="Calls"
            onChange={(value) => updatePeakCallTime(itemIndex, 'call_count', value)}
            value={item.call_count}
          />
          <NumberField
            label="Missed"
            onChange={(value) => updatePeakCallTime(itemIndex, 'missed_calls', value)}
            value={item.missed_calls}
          />
          <NumberField
            label="Booked"
            onChange={(value) => updatePeakCallTime(itemIndex, 'booked_from_calls', value)}
            value={item.booked_from_calls}
          />
          <div className="flex items-end">
            <Button onClick={() => removePeakCallTime(itemIndex)} size="sm" type="button" variant="ghost">
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
