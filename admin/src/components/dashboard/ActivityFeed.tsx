import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, FileSignature, MessageSquare } from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'new_issue' | 'resolved' | 'petition' | 'new_post';
  message: string;
  timestamp: Date;
}

const MOCK_EVENTS: ActivityEvent[] = [
  { id: '1', type: 'new_issue', message: 'New issue reported in Pune — road pothole', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  { id: '2', type: 'resolved', message: 'Issue #234 resolved by Admin Sharma', timestamp: new Date(Date.now() - 1000 * 60 * 25) },
  { id: '3', type: 'petition', message: 'Issue #456 reached 50 votes — petition generated', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: '4', type: 'new_post', message: 'New post in Mohalla Board (Ludhiana)', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) },
];

const iconMap = {
  new_issue: <AlertCircle size={18} className="text-saffron" />,
  resolved: <CheckCircle2 size={18} className="text-jade" />,
  petition: <FileSignature size={18} className="text-blue" />,
  new_post: <MessageSquare size={18} className="text-muted-foreground" />
};

export default function ActivityFeed() {
  const [events] = useState<ActivityEvent[]>(MOCK_EVENTS);

  // In a real app, listen to socket events here and unshift to `events` array

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
        </AnimatePresence>
      </div>
    </div>
  );
}
