import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Calendar, AlertTriangle, FileSignature } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function IssueDetailPanel({ issueId, onClose }: { issueId: string, onClose: () => void }) {
  // In a real app, use useQuery to fetch issue by ID
  const issue = {
    id: issueId,
    title: 'Deep pothole on main road causing accidents',
    category: 'Roads',
    status: 'under_review',
    priority: 'high',
    location: 'Model Town, Ludhiana, Punjab 141001',
    author: 'Ramesh Kumar (XXXXX5432)',
    reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    votes: 45,
    timeline: [
      { id: 1, status: 'open', date: new Date(Date.now() - 1000 * 60 * 60 * 48), note: 'Reported by citizen' },
      { id: 2, status: 'under_review', date: new Date(Date.now() - 1000 * 60 * 60 * 24), note: 'Admin Sharma is reviewing with municipal corp.' }
    ]
  };

  const handleStatusUpdate = () => {
    // Optimistic update via React Query here
    toast.success(`Issue #${issueId} status updated successfully`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: 480, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 480, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-[480px] bg-card border-l border-border shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-secondary/50">
          <h2 className="text-lg font-mono text-foreground">Issue #{issueId}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-border rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Photo Placeholder */}
          <div className="w-full h-48 bg-secondary rounded-xl flex items-center justify-center border border-border">
            <span className="text-4xl">📸</span>
          </div>

          {/* Core Info */}
          <div>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-0.5 bg-secondary text-foreground text-xs font-bold rounded uppercase border border-border">{issue.category}</span>
              <span className="px-2 py-0.5 bg-amber-lt text-amber text-xs font-bold rounded uppercase border border-amber/20">{issue.status.replace('_', ' ')}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">{issue.title}</h1>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin size={18} className="mt-0.5 text-foreground" />
                <span className="flex-1 leading-snug">{issue.location}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar size={18} className="text-foreground" />
                <span>Reported {formatDistanceToNow(issue.reportedAt, { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <AlertTriangle size={18} className="text-saffron" />
                <span className="font-semibold text-foreground capitalize">Priority: {issue.priority}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Timeline</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              {issue.timeline.map((item) => (
                <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-card bg-primary text-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] bg-secondary p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-foreground capitalize text-sm">{item.status.replace('_', ' ')}</span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(item.date, { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Petition Status */}
          {issue.votes >= 45 && (
            <div className="bg-blue-lt border border-blue/20 rounded-xl p-4 flex items-start gap-3">
              <FileSignature className="text-blue shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue mb-1">Petition Status</h4>
                <p className="text-sm text-blue/80 mb-3">Votes: {issue.votes}/50 required for automated petition generation.</p>
                {issue.votes >= 50 && (
                  <button className="bg-blue text-white px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
                    Download Petition PDF
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-border bg-secondary/30">
          <h3 className="font-bold text-foreground mb-3 text-sm">Update Action</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Status</label>
              <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Assignee</label>
              <select className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Unassigned</option>
                <option value="admin1">Admin Sharma</option>
                <option value="admin2">Admin Verma</option>
              </select>
            </div>
          </div>
          <textarea 
            placeholder="Add an internal note or public response..." 
            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary mb-3"
          />
          <button onClick={handleStatusUpdate} className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity">
            Save Changes
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
