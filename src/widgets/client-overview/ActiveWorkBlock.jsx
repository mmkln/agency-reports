import { Link } from 'react-router-dom'

import {
  Button,
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

export function ActiveWorkBlock({ projectsHref = '/client/projects', workItems }) {
  return (
    <SectionCard
      action={(
        <Button asChild size="sm" variant="ghost">
          <Link to={projectsHref}>View projects</Link>
        </Button>
      )}
      iconName="checkCircle2"
      title="Active work"
    >
      {workItems.length > 0 ? (
        <Table className="min-w-[620px]">
          <TableHeader>
            <TableRow>
              <TableHead>Work</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Project</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="grid gap-1">
                    <span className="font-medium text-text-primary">{item.title}</span>
                    {item.summary ? <span className="text-label font-normal text-text-muted">{item.summary}</span> : null}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge meta={item.statusMeta} />
                </TableCell>
                <TableCell className="text-text-muted">{formatDate(item.targetDate)}</TableCell>
                <TableCell className="text-text-muted">{item.projectName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState>No active published work right now.</EmptyState>
      )}
    </SectionCard>
  )
}
