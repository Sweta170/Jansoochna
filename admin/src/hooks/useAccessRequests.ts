import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface AccessRequest {
  _id: string;
  full_name: string;
  email: string;
  designation: string;
  state: string;
  district: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useAccessRequests(status?: string) {
  const queryClient = useQueryClient();

  // Query to fetch all access requests with optional status filter
  const { data: requests = [], isLoading, error, refetch } = useQuery<AccessRequest[]>({
    queryKey: ['accessRequests', status],
    queryFn: async () => {
      const res = await api.get('/admin/access-requests', {
        params: status && status !== 'all' ? { status } : undefined,
      });
      return res.data;
    },
  });

  // Mutation to approve an access request
  const approveMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'state_admin' | 'district_admin' }) => {
      const res = await api.patch(`/admin/access-requests/${id}/approve`, { role });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate both filtered and unfiltered queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
    },
  });

  // Mutation to reject an access request
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await api.patch(`/admin/access-requests/${id}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
    },
  });

  return {
    requests,
    isLoading,
    error,
    refetch,
    approveRequest: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectRequest: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  };
}
