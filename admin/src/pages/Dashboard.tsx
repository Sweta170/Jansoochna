import { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import IssueChart from '../components/dashboard/IssueChart';
import CategoryPie from '../components/dashboard/CategoryPie';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import RecentIssues from '../components/dashboard/RecentIssues';
import { api } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    openIssues: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/admin/stats/overview');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-10rem)] flex items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
          <span className="ml-2 font-medium">Loading dashboard metrics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Open Issues" 
          value={stats.openIssues} 
          trend={8} 
          trendLabel="vs last week" 
          sparklineData={[0, Math.floor(stats.openIssues/3), Math.floor(stats.openIssues/2), stats.openIssues]} 
        />
        <StatCard 
          title="Resolved Issues" 
          value={stats.resolvedIssues} 
          trend={15} 
          trendLabel="vs last week" 
          sparklineData={[0, Math.floor(stats.resolvedIssues/3), Math.floor(stats.resolvedIssues/2), stats.resolvedIssues]} 
        />
        <StatCard 
          title="Total Issues" 
          value={stats.totalIssues} 
          trend={10} 
          trendLabel="vs last week" 
          sparklineData={[0, Math.floor(stats.totalIssues/3), Math.floor(stats.totalIssues/2), stats.totalIssues]} 
        />
        <StatCard 
          title="Active Citizens" 
          value={stats.totalUsers} 
          trend={5} 
          trendLabel="vs last month" 
          sparklineData={[0, Math.floor(stats.totalUsers/3), Math.floor(stats.totalUsers/2), stats.totalUsers]} 
        />
      </div>

      {/* Middle row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
        <div className="lg:col-span-3">
          <IssueChart />
        </div>
        <div className="lg:col-span-2">
          <CategoryPie />
        </div>
      </div>

      {/* Bottom row Tables/Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-8">
        <div className="lg:col-span-2">
          <RecentIssues />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
