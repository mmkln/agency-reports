import {
  Button,
  Input,
  Progress,
} from '@/shared/ui'

import { Icon } from '../../../shared/icons'
import { updateListItem } from '../model'
import { EditorCard } from './EditorCard'

export function ProgressSummaryPanel({ draft, onAddProject, onMoveProject, onRemoveProject, onUpdateProjects }) {
  return (
    <EditorCard
      action={<Button onClick={onAddProject} size="icon-sm" type="button" variant="ghost"><Icon name="plus" size={14} /></Button>}
      iconName="fileText"
      title="Progress Summary"
    >
      <div className="grid gap-5">
        {draft.projects.map((project, index) => (
          <div className="grid gap-2 rounded-control border border-separator bg-block-subtle p-3" key={project.id || `project-${index}`}>
            <div className="flex items-center justify-between gap-3">
              <Input
                className="h-8 min-w-0 flex-1 border-transparent bg-transparent px-1 font-semibold shadow-none focus-visible:border-control-border focus-visible:bg-block focus-visible:ring-0"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'name', event.target.value))}
                placeholder="Campaign Setup"
                value={project.name}
              />
              <Input
                className="h-8 w-16 px-2 text-right text-label text-action"
                max="100"
                min="0"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'progress_percent', event.target.value))}
                type="number"
                value={project.progress_percent}
              />
              <Button
                className="text-text-quaternary"
                disabled={index === 0}
                onClick={() => onMoveProject(index, -1)}
                size="icon-sm"
                title="Move project up"
                type="button"
                variant="ghost"
              >
                <Icon className="-rotate-90" name="arrowRight" size={14} />
              </Button>
              <Button
                className="text-text-quaternary"
                disabled={index === draft.projects.length - 1}
                onClick={() => onMoveProject(index, 1)}
                size="icon-sm"
                title="Move project down"
                type="button"
                variant="ghost"
              >
                <Icon className="rotate-90" name="arrowRight" size={14} />
              </Button>
              <Button
                className="text-text-quaternary hover:text-destructive"
                onClick={() => onRemoveProject(index)}
                size="icon-sm"
                title="Delete project"
                type="button"
                variant="ghost"
              >
                <Icon name="close" size={14} />
              </Button>
            </div>
            <Progress className="h-1.5" value={Number(project.progress_percent) || 0} />
            <Input
              className="h-8 border-transparent bg-transparent px-1 text-label font-normal text-text-muted shadow-none focus-visible:border-control-border focus-visible:bg-block focus-visible:ring-0"
              onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'description', event.target.value))}
              placeholder="Stage: Tracking and first launch completed"
              value={project.description}
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <Input
                className="h-8 px-2 text-label"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'status', event.target.value))}
                placeholder="in_progress"
                value={project.status}
              />
              <Input
                className="h-8 px-2 text-label"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'start_date', event.target.value))}
                type="date"
                value={project.start_date}
              />
              <Input
                className="h-8 px-2 text-label"
                onChange={(event) => onUpdateProjects(updateListItem(draft.projects, index, 'end_date', event.target.value))}
                type="date"
                value={project.end_date}
              />
            </div>
          </div>
        ))}
      </div>
    </EditorCard>
  )
}
