import { useId } from 'react'

import { Icon } from '@/shared/icons'
import {
  Button,
  IconButton,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui'

import { useDashboardExplanationEditor } from './useDashboardExplanationEditor'

function ExplanationSection({ children, label }) {
  if (!children) {
    return null
  }

  return (
    <section className="grid gap-tag">
      <p className="text-label font-semibold text-text-primary">{label}</p>
      <p className="text-label leading-relaxed text-text-secondary">{children}</p>
    </section>
  )
}

function ExplanationField({ label, maxLength, onChange, value }) {
  const controlId = useId()

  return (
    <div className="grid gap-item">
      <Label htmlFor={controlId}>{label}</Label>
      <Textarea
        className="min-h-20 resize-none"
        id={controlId}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </div>
  )
}

export function DashboardExplanationPopover({
  apiClient,
  campaignId,
  canEdit = false,
  explanationKey,
  explanation,
  onSaved,
  triggerSize = 'sm',
  workspaceId,
}) {
  const editor = useDashboardExplanationEditor({
    apiClient,
    campaignId,
    explanationKey,
    explanation,
    onSaved,
    workspaceId,
  })
  const current = editor.currentExplanation ?? explanation
  const subject = current?.kind === 'metric'
    ? 'metric'
    : current?.kind === 'section'
      ? 'section'
      : 'chart'

  if (!current?.definition && !current?.calculationExplanation && !current?.source) {
    return null
  }

  return (
    <Popover onOpenChange={editor.setOpen} open={editor.isOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <IconButton
              aria-label={`About ${current.label || `this ${subject}`}`}
              className="text-text-quaternary hover:text-text-secondary"
              size={triggerSize}
            >
              <Icon name="infoCircle" size={triggerSize === 'xs' ? 13 : 15} />
            </IconButton>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{`About this ${subject}`}</TooltipContent>
      </Tooltip>

      <PopoverContent
        align="start"
        className="w-popover p-component"
        onEscapeKeyDown={(event) => {
          if (editor.mode === 'edit' && editor.isDirty) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (editor.mode === 'edit' && editor.isDirty) event.preventDefault()
        }}
      >
        {editor.mode === 'view' ? (
          <div className="grid gap-component">
            <div className="flex items-center justify-between gap-control">
              <div className="min-w-0">
                <p className="text-ui font-semibold text-text-primary">{`About this ${subject}`}</p>
                <p className="mt-tag truncate text-label text-text-muted">{current.label}</p>
              </div>
              {canEdit ? (
                <Button onClick={editor.edit} size="xs" type="button" variant="ghost">
                  Edit
                </Button>
              ) : null}
            </div>

            <ExplanationSection label="What it shows">{current.definition}</ExplanationSection>
            <ExplanationSection label="How it’s calculated">
              {current.calculationExplanation}
            </ExplanationSection>
            <ExplanationSection label="Additional note">{current.additionalNote}</ExplanationSection>
            {current.source ? (
              <>
                <Separator />
                <ExplanationSection label="Source">{current.source}</ExplanationSection>
              </>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-component">
            <div>
              <p className="text-ui font-semibold text-text-primary">Edit explanation</p>
              <p className="mt-tag truncate text-label text-text-muted">{current.label}</p>
            </div>

            <ExplanationField
              label={`What this ${subject} shows`}
              maxLength={500}
              onChange={(value) => editor.updateField('definition', value)}
              value={editor.draft.definition}
            />
            <ExplanationField
              label="How it’s calculated"
              maxLength={1000}
              onChange={(value) => editor.updateField('calculationExplanation', value)}
              value={editor.draft.calculationExplanation}
            />
            <ExplanationField
              label="Additional note"
              maxLength={500}
              onChange={(value) => editor.updateField('additionalNote', value)}
              value={editor.draft.additionalNote}
            />

            {current.source ? (
              <div className="grid gap-tag">
                <p className="text-label font-semibold text-text-primary">Source</p>
                <p className="text-label text-text-muted">{current.source} · Managed by system</p>
              </div>
            ) : null}

            {editor.error ? (
              <p className="text-label text-destructive" role="alert">{editor.error}</p>
            ) : null}

            <div className="flex items-center justify-between gap-control pt-tag">
              <Button
                disabled={editor.isSaving || !current.isCustomized}
                onClick={editor.reset}
                size="xs"
                type="button"
                variant="ghost"
              >
                Reset to Default
              </Button>
              <div className="flex items-center gap-tag">
                <Button
                  disabled={editor.isSaving}
                  onClick={editor.cancel}
                  size="xs"
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  disabled={editor.isSaving || !editor.isDirty}
                  onClick={editor.save}
                  size="xs"
                  type="button"
                >
                  {editor.isSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
