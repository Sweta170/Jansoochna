import { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { Check, X, Inbox } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../../context/AuthContext';
import { useAccessRequests } from '../../hooks/useAccessRequests';
import type { AccessRequest } from '../../hooks/useAccessRequests';
import ApproveModal from '../../components/admin/ApproveModal';
import toast from 'react-hot-toast';

export default function AccessRequests() {
  const { admin } = useAdmin();

  // Route protection - superadmin only
  if (!admin || admin.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

  // TanStack Query custom hook
  const { 
    requests, 
    isLoading, 
    approveRequest, 
    isApproving, 
    rejectRequest 
  } = useAccessRequests(selectedFilter);

  // Get total counts to display on tab pills
  // Fetching 'all' requests to calculate count metadata locally
  const { requests: allRequests } = useAccessRequests('all');

  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;
  const totalCount = allRequests.length;

  const handleOpenApprove = (request: AccessRequest) => {
    setSelectedRequest(request);
    setIsApproveOpen(true);
  };

  const handleConfirmApprove = async (role: 'state_admin' | 'district_admin') => {
    if (!selectedRequest) return;
    try {
      await approveRequest({ id: selectedRequest._id, role });
      toast.success('Access approved — credentials sent via email');
      setIsApproveOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve access request');
    }
  };

  const handleReject = async (request: AccessRequest) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // user cancelled prompt
    
    try {
      await rejectRequest({ id: request._id, reason: reason.trim() || undefined });
      toast.success('Access request rejected successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject access request');
    }
  };

  // Define table columns
  const columns = [
    {
      id: 'index',
      header: '#',
      cell: (info: any) => <span className="text-slate-500 font-medium">{info.row.index + 1}</span>,
    },
    {
      accessorKey: 'full_name',
      header: 'Officer',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1d9e75]/10 text-[#1D9E75] flex items-center justify-center font-bold text-xs">
              {row.full_name[0].toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-foreground leading-snug">{row.full_name}</div>
              <div className="text-muted-foreground text-xs font-mono">{row.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'designation',
      header: 'Designation',
      cell: (info: any) => <span className="text-foreground font-medium">{info.getValue()}</span>,
    },
    {
      accessorKey: 'state',
      header: 'State',
      cell: (info: any) => <span className="text-muted-foreground">{info.getValue()}</span>,
    },
    {
      accessorKey: 'district',
      header: 'District',
      cell: (info: any) => <span className="text-muted-foreground">{info.getValue() || 'N/A'}</span>,
    },
    {
      accessorKey: 'requested_at',
      header: 'Requested',
      cell: (info: any) => {
        const date = new Date(info.getValue());
        return (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatDistanceToNow(date, { addSuffix: true })}
          </span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => {
        const status = info.getValue() as 'pending' | 'approved' | 'rejected';
        
        const badgeStyles = {
          pending: 'bg-saffron-lt text-saffron border-saffron/20',
          approved: 'bg-jade-lt text-jade border-jade/20',
          rejected: 'bg-crimson-lt text-crimson border-crimson/20',
        };

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badgeStyles[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original as AccessRequest;
        if (row.status !== 'pending') return <span className="text-slate-500 text-xs italic">Processed</span>;

        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenApprove(row)}
              className="flex items-center gap-1 px-3 py-1 bg-[#1D9E75] hover:bg-[#1a8d68] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              title="Approve request"
            >
              <Check size={14} /> Approve
            </button>
            <button
              onClick={() => handleReject(row)}
              className="flex items-center gap-1 px-3 py-1 border border-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg transition-all"
              title="Reject request"
            >
              <X size={14} /> Reject
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Access Requests</h1>
        <p className="text-muted-foreground text-sm">Review and approve government officer access</p>
      </div>

      {/* Filter Bar Segmented Tabs */}
      <div className="flex gap-2 border-b border-border pb-4 mb-6 overflow-x-auto">
        {[
          { id: 'all', label: 'All Requests', count: totalCount },
          { id: 'pending', label: 'Pending', count: pendingCount },
          { id: 'approved', label: 'Approved', count: approvedCount },
          { id: 'rejected', label: 'Rejected', count: rejectedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 whitespace-nowrap ${
              selectedFilter === tab.id
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
              selectedFilter === tab.id 
                ? 'bg-primary text-white' 
                : 'bg-secondary text-muted-foreground'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 border-b border-border sticky top-0 z-10 backdrop-blur-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3.5 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                // --- LOADING SKELETON LAYER ---
                Array.from({ length: 4 }).map((_, rIdx) => (
                  <tr key={rIdx} className="border-b border-border/50 animate-pulse">
                    <td className="px-4 py-4 w-12"><div className="h-4 bg-secondary rounded w-6" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary" />
                        <div className="space-y-2">
                          <div className="h-4 bg-secondary rounded w-28" />
                          <div className="h-3 bg-secondary rounded w-40" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-4 bg-secondary rounded w-36" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-secondary rounded w-20" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-secondary rounded w-24" /></td>
                    <td className="px-4 py-4"><div className="h-4 bg-secondary rounded w-20" /></td>
                    <td className="px-4 py-4"><div className="h-5 bg-secondary rounded-full w-16" /></td>
                    <td className="px-4 py-4"><div className="h-8 bg-secondary rounded-lg w-32" /></td>
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                // --- EMPTY STATE ---
                <tr>
                  <td colSpan={columns.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                      <Inbox size={40} className="stroke-[1.5] text-slate-400" />
                      <div>
                        <div className="font-bold text-sm text-foreground">No Requests Found</div>
                        <div className="text-xs text-muted-foreground mt-0.5">There are no administrative requests under this filter.</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                // --- DATA LIST ---
                table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedRequest && isApproveOpen && (
        <ApproveModal
          isOpen={isApproveOpen}
          onClose={() => {
            setIsApproveOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onConfirm={handleConfirmApprove}
          isConfirming={isApproving}
        />
      )}
    </div>
  );
}
