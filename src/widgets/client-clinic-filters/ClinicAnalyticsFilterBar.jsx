import { useLocation, useNavigate } from 'react-router-dom'

import {
  Button,
  RadixSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

const ALL_VALUE = '__all__'

function updateQueryValue(search, key, value) {
  const params = new URLSearchParams(search)

  if (value && value !== ALL_VALUE) {
    params.set(key, value)
  } else {
    params.delete(key)
  }

  return params
}

function hasSelectedFilters(selected = {}, controls = []) {
  return controls.some((control) => Boolean(selected[control.key]))
}

function FilterSelect({ control, onChange, selectedValue }) {
  if (!control.options?.length) {
    return null
  }

  return (
    <div className="grid gap-tag">
      <label className="text-label text-text-muted" htmlFor={`clinic-filter-${control.key}`}>
        {control.label}
      </label>
      <RadixSelect
        onValueChange={(value) => onChange(control.key, value)}
        value={selectedValue || ALL_VALUE}
      >
        <SelectTrigger id={`clinic-filter-${control.key}`} size="sm">
          <SelectValue placeholder={control.allLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>{control.allLabel}</SelectItem>
          {control.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </RadixSelect>
    </div>
  )
}

export function ClinicAnalyticsFilterBar({ controls = [], filters }) {
  const location = useLocation()
  const navigate = useNavigate()
  const selected = filters?.selected ?? {}
  const visibleControls = controls.filter((control) => control.options?.length)

  if (!visibleControls.length) {
    return null
  }

  function handleChange(key, value) {
    const params = updateQueryValue(location.search, key, value)
    navigate(`${location.pathname}?${params.toString()}`)
  }

  function clearFilters() {
    const params = new URLSearchParams(location.search)

    visibleControls.forEach((control) => params.delete(control.key))
    navigate(`${location.pathname}?${params.toString()}`)
  }

  return (
    <section
      aria-label="Clinic analytics filters"
      className="rounded-block bg-block p-block shadow-block"
    >
      <div className="flex flex-col gap-component xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-component sm:grid-cols-2 xl:grid-cols-4">
          {visibleControls.map((control) => (
            <FilterSelect
              control={control}
              key={control.key}
              onChange={handleChange}
              selectedValue={selected[control.key]}
            />
          ))}
        </div>

        {hasSelectedFilters(selected, visibleControls) ? (
          <Button onClick={clearFilters} size="sm" type="button" variant="secondary">
            Clear filters
          </Button>
        ) : null}
      </div>
    </section>
  )
}
