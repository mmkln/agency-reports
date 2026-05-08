import { Panel, PanelBody, PanelHeader } from './Panel'

const toneClass = {
  blue: 'bg-indigo-100 text-indigo-700',
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
}

export function TablePanel({ columns, rows, title }) {
  return (
    <Panel>
      <PanelHeader title={title} />
      <PanelBody>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-700">
                {columns.map((column) => (
                  <th className="px-3 py-3 font-semibold first:pl-3 last:text-right" key={column.key}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-b border-slate-200 last:border-b-0" key={row.id ?? row.channel ?? row.label}>
                  {columns.map((column) => (
                    <td className={`px-3 py-3.5 ${column.align === 'right' ? 'text-right' : ''}`} key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelBody>
    </Panel>
  )
}

export function TableBadge({ children, tone = 'blue' }) {
  return <span className={`inline-flex rounded px-2 py-1 font-semibold ${toneClass[tone]}`}>{children}</span>
}
