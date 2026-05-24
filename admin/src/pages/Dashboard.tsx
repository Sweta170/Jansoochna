import StatCard from '../components/dashboard/StatCard';
import IssueChart from '../components/dashboard/IssueChart';
import CategoryPie from '../components/dashboard/CategoryPie';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import RecentIssues from '../components/dashboard/RecentIssues';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Top row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Open Issues" 
          value={1247} 
          trend={12} 
          trendLabel="vs last week" 
          sparklineData={[1000, 1050, 1100, 1200, 1150, 1300, 1247]} 
        />
        <StatCard 
          title="Resolved (this week)" 
          value={89} 
          trend={-5} 
          trendLabel="vs last week" 
          sparklineData={[120, 110, 115, 100, 95, 90, 89]} 
        />
        <StatCard 
          title="Avg Resolve Time" 
          value={4.2} 
          format="time"
          trend={8} 
          trendLabel="faster than last week" 
          sparklineData={[5.1, 4.9, 4.8, 4.5, 4.4, 4.3, 4.2]} 
        />
        <StatCard 
          title="Active Citizens" 
          value={8420} 
          trend={24} 
          trendLabel="vs last month" 
          sparklineData={[6000, 6500, 6800, 7200, 7800, 8100, 8420]} 
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
