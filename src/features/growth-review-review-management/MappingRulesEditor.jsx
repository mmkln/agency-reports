import { Fragment } from 'react'

import { Button, Separator } from '@/shared/ui'

import { MappingRuleFields } from './MappingRuleFields'
import { createEmptyMapping } from './mappingRuleModel'

export function MappingRulesEditor({
  customFields,
  errors = [],
  idPrefix,
  mappings,
  onChange,
  outcomeLabel,
  tags,
}) {
  function updateMapping(index, mapping) {
    onChange(mappings.map((item, itemIndex) => (itemIndex === index ? mapping : item)))
  }

  return (
    <div className="grid gap-card">
      {mappings.map((mapping, index) => {
        return (
          <Fragment key={mapping.id || index}>
            {index > 0 ? (
              <div className="flex items-center gap-item" aria-label="Alternative condition">
                <Separator className="flex-1" />
                <span className="text-label font-medium text-text-muted">OR</span>
                <Separator className="flex-1" />
              </div>
            ) : null}
            <div className="grid gap-component">
              <MappingRuleFields
                customFields={customFields}
                errors={errors[index]}
                idPrefix={`${idPrefix}-${index}`}
                mapping={mapping}
                onChange={(nextMapping) => updateMapping(index, nextMapping)}
                outcomeLabel={outcomeLabel}
                tags={tags}
              />
              {index > 0 ? (
                <div>
                  <Button
                    className="text-destructive hover:text-destructive"
                    onClick={() => onChange(mappings.filter((_item, itemIndex) => itemIndex !== index))}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Remove condition
                  </Button>
                </div>
              ) : null}
            </div>
          </Fragment>
        )
      })}

      <div>
        <Button
          onClick={() => onChange([
            ...mappings,
            createEmptyMapping({ priority: mappings.length * 100 }),
          ])}
          size="sm"
          type="button"
          variant="ghost"
        >
          Add alternative condition
        </Button>
      </div>
    </div>
  )
}
