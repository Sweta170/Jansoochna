import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAdmin } from '../../context/AuthContext';
import { 
  LayoutDashboard, AlertTriangle, Map as MapIcon, Users, 
  MessageSquare, ShieldCheck, BarChart3, Settings, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { admin, can } = useAdmin();
  const [openIssuesCount, setOpenIssuesCount] = useState(0);

  useEffect(() => {
    const fetchOpenIssuesCount = async () => {
      try {
        const res = await api.get('/admin/stats/overview');
        setOpenIssuesCount(res.data.openIssues || 0);
      } catch (err) {
        console.error('Failed to fetch open issues count for sidebar:', err);
      }
    };
    
    fetchOpenIssuesCount();
    const interval = setInterval(fetchOpenIssuesCount, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Poll for pending access requests count every 30 seconds (superadmin only)
  const { data: pendingRequests } = useQuery({
    queryKey: ['pendingAccessRequestsCount'],
    queryFn: async () => {
      const res = await api.get('/admin/access-requests', { params: { status: 'pending' } });
      return res.data;
    },
    enabled: admin?.role === 'superadmin',
    refetchInterval: 30000,
  });

  const pendingRequestsCount = pendingRequests?.length || 0;

  const links = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'Issues', to: '/issues', icon: AlertTriangle, badge: openIssuesCount > 0 ? openIssuesCount : undefined },
    { name: 'Map View', to: '/map', icon: MapIcon },
    { name: 'Citizens', to: '/citizens', icon: Users, permission: 'citizens.view' },
    { name: 'Posts', to: '/posts', icon: MessageSquare, permission: 'posts.moderate' },
    { 
      name: 'Access Requests', 
      to: '/access-requests', 
      icon: Users, 
      role: 'superadmin', 
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined 
    },
    { name: 'Admins', to: '/admins', icon: ShieldCheck, permission: 'admins.view' },
    { name: 'Analytics', to: '/analytics', icon: BarChart3, permission: 'analytics.state' },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];


  return (
    <aside className={clsx(
      "h-screen bg-card border-r border-border transition-all duration-300 flex flex-col fixed lg:sticky top-0 z-30",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Area */}
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Shield className="text-primary w-8 h-8 flex-shrink-0" />
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-foreground tracking-tight">JanSoochna</h1>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-4">
          <div className="bg-secondary rounded-lg p-3 border border-border">
            <p className="text-xs font-semibold text-primary uppercase mb-1">
              {admin?.role.replace('_', ' ')}
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {admin?.state || 'All India'} {admin?.district && `• ${admin.district}`}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {links.map((link) => {
          if (link.permission && !can(link.permission)) return null;
          if (link.role && admin?.role !== link.role) return null;
          const Icon = link.icon;
          
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => clsx(
                "flex items-center px-3 py-2.5 rounded-lg transition-colors group relative",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={collapsed ? link.name : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
                  <Icon className={clsx("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "")} />
                  {!collapsed && (
                    <span className="ml-3 font-medium text-sm flex-1">{link.name}</span>
                  )}
                  {!collapsed && link.badge && (
                    <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-14 bg-card border border-border text-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none shadow-sm whitespace-nowrap z-50">
                      {link.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
            {admin?.name?.[0] || 'A'}
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate">{admin?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{admin?.email}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
