import { Link } from 'react-router-dom'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'

function formatDate(date) {
  if (!date) {
    return 'Not published yet'
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatRelativeTime(date) {
  if (!date) {
    return 'not published'
  }

  const seconds = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 1000))

  if (seconds < 5) {
    return 'just now'
  }

  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.round(seconds / 60)

  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.round(minutes / 60)

  if (hours < 24) {
    return `${hours}h ago`
  }

  return formatDate(date)
}

function SaveStatusIndicator({ editor, isDirty, saveState }) {
  const isSaving = saveState.startsWith('Saving') || saveState.startsWith('Publishing')
  const hasPublished = Boolean(editor.client.overviewPublishedAt)
  const savedAt = editor.client.overviewDraftSavedAt || editor.client.overviewPublishedAt || editor.client.updatedAt

  let icon
  let label
  let tone = 'text-text-muted'

  if (isSaving) {
    icon = (
      <span
        aria-hidden="true"
        className="inline-block size-3 shrink-0 animate-spin rounded-full border-2 border-text-quaternary border-t-transparent"
      />
    )
    label = saveState
  } else if (isDirty) {
    icon = <Icon aria-hidden="true" className="text-warning" name="circle" size={10} />
    label = 'Unsaved changes'
    tone = 'text-text-secondary'
  } else if (saveState) {
    icon = <Icon aria-hidden="true" className="text-success" name="checkCircle2" size={13} />
    label = saveState
    tone = 'text-text-secondary'
  } else {
    icon = <Icon aria-hidden="true" className="text-success" name="checkCircle2" size={13} />
    label = `Saved - ${formatRelativeTime(savedAt)}`
    tone = 'text-text-secondary'
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex min-w-0 cursor-default items-center gap-tag text-label ${tone}`}>
          {icon}
          <span className="min-w-0 truncate">{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="grid gap-1">
        <span>Draft saved: {formatDate(editor.client.overviewDraftSavedAt)}</span>
        <span>Last published: {hasPublished ? formatDate(editor.client.overviewPublishedAt) : 'Not published yet'}</span>
      </TooltipContent>
    </Tooltip>
  )
}

export function EditorActionToolbar({
  editor,
  isDirty,
  onDiscardDraft,
  onPublish,
  onRestorePublished,
  saveState,
}) {
  const previewPublishedHref = `/admin/client-preview?clientId=${editor.client.id}&preview=published`
  const previewDraftHref = `/admin/client-preview?clientId=${editor.client.id}&preview=draft`
  const hasDraft = editor.client.hasDraft
  const hasPublished = Boolean(editor.client.overviewPublishedAt)
  const hasMultiplePreviewSources = hasPublished && hasDraft
  const singlePreviewHref = hasDraft ? previewDraftHref : previewPublishedHref
  const singlePreviewLabel = hasDraft ? 'Preview saved draft' : 'View client version'
  const isSinglePreviewDisabled = !hasDraft && !hasPublished

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center gap-control lg:justify-end">
      <SaveStatusIndicator editor={editor} isDirty={isDirty} saveState={saveState} />

      <div className="flex min-w-0 flex-wrap items-center gap-tag">
        {hasMultiplePreviewSources ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" type="button" variant="ghost">
                <Icon name="user" size={14} />
                Preview
                <Icon className="text-text-quaternary" name="chevronDown" size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64">
              <DropdownMenuItem asChild>
                <Link to={previewPublishedHref}>
                  <Icon name="user" size={15} />
                  <span className="grid gap-0.5">
                    <span>View client version</span>
                    <span className="text-label font-normal text-text-muted">The currently published page clients can see.</span>
                  </span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={previewDraftHref}>
                  <Icon name="fileText" size={15} />
                  <span className="grid gap-0.5">
                    <span>Preview saved draft</span>
                    <span className="text-label font-normal text-text-muted">Unpublished changes for admin review.</span>
                  </span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          isSinglePreviewDisabled ? (
            <Button disabled size="sm" type="button" variant="ghost">
              <Icon name="user" size={14} />
              Preview unavailable
            </Button>
          ) : (
            <Button asChild size="sm" type="button" variant="ghost">
              <Link to={singlePreviewHref}>
                <Icon name={hasDraft ? 'fileText' : 'user'} size={14} />
                {singlePreviewLabel}
              </Link>
            </Button>
          )
        )}

        <Button onClick={onPublish} size="sm" type="button">
          <Icon name="zap" size={14} />
          Publish
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="More actions" size="icon-sm" type="button" variant="ghost">
              <Icon name="ellipsis" size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-max min-w-56 max-w-[calc(100vw-2rem)]">
            <DropdownMenuItem
              className="whitespace-nowrap"
              disabled={!hasPublished}
              onClick={onRestorePublished}
            >
              <Icon className="-rotate-180" name="arrowRight" size={15} />
              <span>Restore from published</span>
            </DropdownMenuItem>
            {hasDraft ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDiscardDraft} variant="destructive">
                  <Icon name="close" size={15} />
                  <span>Discard draft</span>
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
