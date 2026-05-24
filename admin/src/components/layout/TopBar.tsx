import { Bell, Moon, Sun, User, Search, Menu } from 'lucide-react';
import { useAdmin } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function TopBar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { admin, logout } = useAdmin();
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const [issuesRes, postsRes] = await Promise.all([
        api.get('/admin/issues').catch(() => ({ data: [] })),
        api.get('/admin/posts/reported').catch(() => ({ data: [] }))
      ]);
      
      const list: any[] = [];
      issuesRes.data.forEach((issue: any) => {
        if (issue.status === 'open') {
          list.push({
            id: `issue-${issue._id}`,
            title: 'New Civic Issue',
            body: `"${issue.title}" reported in Pincode ${issue.location?.pincode || ''}`,
            time: new Date(issue.createdAt),
          });
        }
      });
      
      postsRes.data.forEach((post: any) => {
        list.push({
          id: `post-${post._id}`,
          title: 'Flagged Community Post',
          body: `Post "${post.content?.slice(0, 25)}..." has active user reports.`,
          time: new Date(post.createdAt || Date.now()),
        });
      });

      // sort newest first
      const sorted = list
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 5);
        
      setNotifications(sorted);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const breadcrumbs = location.pathname.split('/').filter(Boolean);
  const pageTitle = breadcrumbs.length > 0 ? breadcrumbs[0].charAt(0).toUpperCase() + breadcrumbs[0].slice(1) : 'Dashboard';

  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-20 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden text-muted-foreground hover:text-foreground">
          <Menu size={24} />
        </button>
        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <span>Admin</span>
          <span>/</span>
          <span className="text-foreground">{pageTitle}</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search issues, citizens, or posts..." 
            className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        {/* Notification Bell Icon & Panel */}
        <button 
          onClick={() => {
            setShowNotifications(!showNotifications);
            setDropdownOpen(false);
          }}
          className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
        >
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-card animate-pulse"></span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg py-2 z-50 max-h-[360px] overflow-y-auto">
            <div className="px-4 py-2 border-b border-border flex justify-between items-center bg-secondary/30">
              <span className="text-sm font-bold text-foreground">Pending Action Items</span>
              {notifications.length > 0 && (
                <span className="bg-destructive/15 text-destructive text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {notifications.length} Alerts
                </span>
              )}
            </div>
            
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div key={n.id} className="p-3.5 hover:bg-secondary/40 transition-colors">
                  <p className="text-xs font-bold text-foreground mb-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-normal">{n.body}</p>
                  <span className="text-[10px] text-muted-foreground block mt-1 font-semibold">
                    {formatDistanceToNow(n.time, { addSuffix: true })}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground italic">
                  All caught up! No pending alerts.
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={toggleDarkMode} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button 
          onClick={() => {
            setDropdownOpen(!dropdownOpen);
            setShowNotifications(false);
          }}
          className="ml-2 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold hover:bg-primary/20 transition-colors"
        >
          {admin?.name?.[0] || 'A'}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{admin?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{admin?.role.replace('_', ' ')}</p>
            </div>
            <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2">
              <User size={16} /> Profile
            </button>
            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary font-medium">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
