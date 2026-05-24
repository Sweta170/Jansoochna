import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Edit2 } from 'lucide-react';

const MOCK_ISSUES = [
  { id: '1024', title: 'Streetlight not working since 3 days', category: 'Electricity', district: 'Ludhiana', status: 'open', date: new Date(Date.now() - 1000 * 60 * 30) },
  { id: '1023', title: 'Garbage dump overflowing near park', category: 'Sanitation', district: 'Amritsar', status: 'in_progress', date: new Date(Date.now() - 1000 * 60 * 120) },
  { id: '1022', title: 'Water supply contaminated', category: 'Water', district: 'Jalandhar', status: 'urgent', date: new Date(Date.now() - 1000 * 60 * 60 * 5) },
  { id: '1021', title: 'Pothole causing accidents', category: 'Roads', district: 'Patiala', status: 'resolved', date: new Date(Date.now() - 1000 * 60 * 60 * 24) },
];

const statusStyles: Record<string, string> = {
  open: 'bg-blue-lt text-blue border-blue/20',
  in_progress: 'bg-saffron-lt text-saffron border-saffron/20',
  resolved: 'bg-jade-lt text-jade border-jade/20',
  urgent: 'bg-crimson-lt text-crimson border-crimson/20',
};

export default function RecentIssues() {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm h-[400px] flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-foreground">Recent Issues</h3>
        <Link to="/issues" className="text-sm font-semibold text-primary hover:underline">
          View all →
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
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
            {MOCK_ISSUES.map((issue) => (
              <tr key={issue.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-mono text-muted-foreground">#{issue.id}</td>
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
                    <button className="p-1 hover:text-primary transition-colors"><Eye size={16} /></button>
                    <button className="p-1 hover:text-primary transition-colors"><Edit2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
