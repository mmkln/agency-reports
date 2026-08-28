import { Icon } from '@/shared/icons'
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui'

export function MappingDisclosure({
  children,
  error,
  isOpen,
  matchCount,
  onOpenChange,
  sourceLabel,
  sourceType,
  title,
}) {
  const metadata = [sourceType]
  if (matchCount !== undefined) {
    metadata.push(`${matchCount} matching contacts`)
  }

  return (
    <Collapsible onOpenChange={onOpenChange} open={isOpen}>
      <CollapsibleTrigger asChild>
        <Button
          aria-invalid={Boolean(error)}
          className="h-auto w-full justify-between whitespace-normal rounded-none px-component py-component text-left hover:bg-control-hover"
          type="button"
          variant="ghost"
        >
          <span className="grid min-w-0 flex-1 gap-tag">
            <span className="whitespace-normal break-words text-ui font-medium text-text-primary">
              {title}
            </span>
            <span className="whitespace-normal break-words text-ui font-normal text-text-secondary">
              {sourceLabel || 'Choose source'}
            </span>
            {metadata.filter(Boolean).length ? (
              <span className="whitespace-normal break-words text-label font-normal text-text-muted">
                {metadata.filter(Boolean).join(' · ')}
              </span>
            ) : null}
          </span>
          <Icon
            className={`shrink-0 text-text-quaternary transition-transform duration-motion-fast ${isOpen ? 'rotate-180' : ''}`}
            name="chevronDown"
            size={17}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-separator bg-block px-component py-component">
          {children}
        </div>
      </CollapsibleContent>

      {error && !isOpen ? (
        <p className="px-component pb-item text-label text-destructive">{error}</p>
      ) : null}
    </Collapsible>
  )
}
