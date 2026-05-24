import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, FileSignature, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';

interface ActivityEvent {
  id: string;
  type: 'new_issue' | 'resolved' | 'petition' | 'new_post';
  message: string;
  timestamp: Date;
}

const iconMap = {
  new_issue: <AlertCircle size={18} className="text-saffron" />,
  resolved: <CheckCircle2 size={18} className="text-jade" />,
  petition: <FileSignature size={18} className="text-blue" />,
  new_post: <MessageSquare size={18} className="text-muted-foreground" />
};

export default function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const [issuesRes, postsRes] = await Promise.all([
          api.get('/admin/issues'),
          api.get('/admin/posts/reported').catch(() => ({ data: [] }))
        ]);

        const computedEvents: ActivityEvent[] = [];

        // Add issue activities
        issuesRes.data.forEach((issue: any) => {
          const date = new Date(issue.createdAt);
          
          // 1. Issue creation
          computedEvents.push({
            id: `new-${issue._id}`,
            type: 'new_issue',
            message: `New issue reported: "${issue.title}" in Pincode ${issue.location?.pincode || ''}`,
            timestamp: date,
          });

          // 2. Issue resolved
          if (issue.status === 'resolved') {
            const resolveDate = issue.resolvedAt ? new Date(issue.resolvedAt) : date;
            computedEvents.push({
              id: `res-${issue._id}`,
              type: 'resolved',
              message: `Issue "${issue.title}" marked as RESOLVED`,
              timestamp: resolveDate,
            });
          }

          // 3. Petition generated
          if (issue.voteCount >= 50) {
            computedEvents.push({
              id: `pet-${issue._id}`,
              type: 'petition',
              message: `Issue "${issue.title}" reached 50 votes — petition ready`,
              timestamp: date,
            });
          }
        });

        // Add reported post activities
        postsRes.data.forEach((post: any) => {
          computedEvents.push({
            id: `post-${post._id}`,
            type: 'new_post',
            message: `Post reported: "${post.content?.slice(0, 30)}..." has ${post.reported || 1} report(s)`,
            timestamp: new Date(post.createdAt || Date.now()),
          });
        });

        // Sort all chronologically, newest first
        const sorted = computedEvents
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        setEvents(sorted);
      } catch (err) {
        console.error('Failed to load activity feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm h-[400px] flex flex-col">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className="font-bold text-foreground">Live Activity</h3>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          Listening
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse text-sm">Loading activity feed...</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3"
              >
                <div className="mt-0.5">{iconMap[event.type]}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground leading-tight">{event.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            ))}
            {events.length === 0 && (
              <div className="text-center text-muted-foreground italic py-8 text-sm">
                No activity recorded yet.
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
