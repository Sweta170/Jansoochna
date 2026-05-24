import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import type { SortingState } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { Filter, Download, MoreHorizontal, ArrowUpDown } from 'lucide-react';
import IssueDetailPanel from '../components/issues/IssueDetailPanel';

type IssueStatus = 'open' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';

interface Issue {
  id: string;
  title: string;
  category: string;
  district: string;
  state: string;
  status: IssueStatus;
  priority: IssuePriority;
  votes: number;
  reportedAt: Date;
  assignee: string | null;
}

const mockData: Issue[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `20${i}4`,
  title: ['Streetlight dark', 'Pothole', 'Contaminated water', 'Garbage dump'][i % 4] + ` - Example ${i}`,
  category: ['Electricity', 'Roads', 'Water', 'Sanitation'][i % 4],
  district: 'Ludhiana',
  state: 'Punjab',
  status: ['open', 'under_review', 'in_progress', 'resolved'][i % 4] as IssueStatus,
  priority: ['low', 'medium', 'high', 'urgent'][i % 4] as IssuePriority,
  votes: Math.floor(Math.random() * 100),
  reportedAt: new Date(Date.now() - Math.random() * 1000000000),
  assignee: i % 3 === 0 ? 'Admin Sharma' : null,
}));

const statusStyles = {
  open: 'bg-blue-lt text-blue border-blue/20',
  under_review: 'bg-amber-lt text-amber border-amber/20',
  in_progress: 'bg-saffron-lt text-saffron border-saffron/20',
  resolved: 'bg-jade-lt text-jade border-jade/20',
  rejected: 'bg-crimson-lt text-crimson border-crimson/20',
};

const priorityStyles = {
  low: 'text-muted-foreground',
  medium: 'text-amber font-semibold',
  high: 'text-saffron font-bold',
  urgent: 'text-crimson font-extrabold relative',
};

export default function Issues() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: (info: any) => <span className="font-mono text-muted-foreground">#{info.getValue()}</span>
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: (info: any) => <span className="font-medium truncate max-w-[200px] inline-block" title={info.getValue()}>{info.getValue()}</span>
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'district',
      header: 'Location',
      cell: (info: any) => <span>{info.getValue()}, {info.row.original.state}</span>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue() as string;
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusStyles[status as keyof typeof statusStyles]}`}>
            {status.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: (info: any) => {
        const priority = info.getValue() as string;
        return (
          <span className={`capitalize ${priorityStyles[priority as keyof typeof priorityStyles]}`}>
            {priority === 'urgent' && <span className="absolute -left-3 top-1.5 w-2 h-2 bg-crimson rounded-full animate-ping" />}
            {priority}
          </span>
        );
      }
    },
    {
      accessorKey: 'votes',
      header: ({ column }: any) => {
        return (
          <button className="flex items-center gap-1 hover:text-foreground" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Votes <ArrowUpDown size={14} />
          </button>
        )
      },
      cell: (info: any) => {
        const v = info.getValue();
        return (
          <div className="flex items-center gap-2 w-24">
            <span className="font-medium min-w-[20px]">{v}</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (v / 100) * 100)}%` }} />
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'reportedAt',
      header: 'Reported',
      cell: (info: any) => <span className="whitespace-nowrap text-muted-foreground text-sm">{formatDistanceToNow(info.getValue(), { addSuffix: true })}</span>
    },
    {
      accessorKey: 'assignee',
      header: 'Assigned',
      cell: (info: any) => info.getValue() ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
            {info.getValue()[0]}
          </div>
          <span className="text-sm">{info.getValue()}</span>
        </div>
      ) : <span className="text-muted-foreground text-sm italic">Unassigned</span>
    },
    {
      id: 'actions',
      cell: () => (
        <button className="p-2 hover:bg-secondary rounded text-muted-foreground">
          <MoreHorizontal size={16} />
        </button>
      )
    }
  ];

  const table = useReactTable({
    data: mockData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Issue Management</h1>
          <p className="text-muted-foreground text-sm">Review, assign, and update civic issues</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground font-semibold rounded-lg border border-border hover:bg-border transition-colors">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  onClick={() => setSelectedIssueId(row.original.id)}
                  className="border-b border-border/50 hover:bg-secondary/60 cursor-pointer transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card text-sm text-muted-foreground">
          <span>Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => table.previousPage()} 
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-secondary border border-border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              onClick={() => table.nextPage()} 
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-secondary border border-border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel Overlay */}
      {selectedIssueId && (
        <>
          <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={() => setSelectedIssueId(null)} />
          <IssueDetailPanel issueId={selectedIssueId} onClose={() => setSelectedIssueId(null)} />
        </>
      )}
    </div>
  );
}
