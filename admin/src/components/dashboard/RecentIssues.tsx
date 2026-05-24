import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Eye } from 'lucide-react';
import { api } from '../../services/api';

const statusStyles: Record<string, string> = {
  open: 'bg-blue-lt text-blue border-blue/20',
  in_progress: 'bg-saffron-lt text-saffron border-saffron/20',
  resolved: 'bg-jade-lt text-jade border-jade/20',
};

export default function RecentIssues() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentIssues = async () => {
      try {
        const res = await api.get('/admin/issues');
        const sorted = res.data
          .map((issue: any) => ({
            id: issue._id,
            title: issue.title,
            category: issue.category ? issue.category.charAt(0).toUpperCase() + issue.category.slice(1) : 'General',
            status: issue.status || 'open',
            date: new Date(issue.createdAt),
          }))
          .slice(0, 4);
        setIssues(sorted);
      } catch (err) {
        console.error('Failed to load recent issues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentIssues();
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm h-[400px] flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-foreground">Recent Issues</h3>
        <Link to="/issues" className="text-sm font-semibold text-primary hover:underline">
          View all →
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse text-sm">Loading recent issues...</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-xs uppercase text-muted-foreground font-semibold">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-muted-foreground">#{issue.id.slice(-4).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium text-foreground truncate max-w-[200px]">{issue.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{issue.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${statusStyles[issue.status] || 'bg-secondary text-muted-foreground'}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(issue.date, { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2 text-muted-foreground">
                      <Link to="/issues" className="p-1 hover:text-primary transition-colors">
                        <Eye size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                    No issues reported yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
