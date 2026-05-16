import {
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'

import { EmptyState, SectionCard } from './_shared'
import { formatDate } from './formatters'

export function ActiveTasksBlock({ tasks }) {
  return (
    <SectionCard iconName="checkCircle2" title="Current tasks">
      {tasks.length > 0 ? (
        <Table className="min-w-[620px]">
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Responsible</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium text-text-primary">{task.title}</TableCell>
                <TableCell>
                  <StatusBadge meta={task.statusMeta} />
                </TableCell>
                <TableCell className="text-text-muted">{formatDate(task.dueDate)}</TableCell>
                <TableCell className="text-text-muted">
                  <span className="inline-flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-control-selected text-label text-text-secondary">
                      {task.assigneeName.slice(0, 1)}
                    </span>
                    {task.assigneeName}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState>No active client-visible tasks right now.</EmptyState>
      )}
    </SectionCard>
  )
}
