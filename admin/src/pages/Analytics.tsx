import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Download, Calendar, ChevronDown } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

const volumeData = [
  { state: 'PB', issues: 1200 },
  { state: 'MH', issues: 3200 },
  { state: 'UP', issues: 4500 },
  { state: 'GJ', issues: 2100 },
  { state: 'RJ', issues: 1800 },
];

const categoryData = [
  { category: 'Roads', A: 120, fullMark: 150 },
  { category: 'Water', A: 98, fullMark: 150 },
  { category: 'Power', A: 86, fullMark: 150 },
  { category: 'Sanitation', A: 99, fullMark: 150 },
  { category: 'Parks', A: 85, fullMark: 150 },
  { category: 'Other', A: 65, fullMark: 150 },
];

const growthData = [
  { week: 'W1', users: 400 },
  { week: 'W2', users: 300 },
  { week: 'W3', users: 550 },
  { week: 'W4', users: 700 },
  { week: 'W5', users: 1200 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');

  const handleExportCSV = async () => {
    try {
      toast.loading('Generating report...', { id: 'csv-export' });
      const res = await api.get('/admin/issues');
      const issues = res.data;
      
      const headers = ['Issue ID', 'Title', 'Category', 'Status', 'Pincode', 'Votes', 'Date Reported'];
      const rows = issues.map((issue: any) => [
        issue._id,
        `"${(issue.title || '').replace(/"/g, '""')}"`,
        issue.category || 'other',
        issue.status || 'open',
        issue.location?.pincode || 'N/A',
        issue.voteCount || 0,
        new Date(issue.createdAt).toLocaleDateString()
      ]);
      
      const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `jansoochna_issues_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully!', { id: 'csv-export' });
    } catch (err) {
      toast.error('Failed to export CSV report', { id: 'csv-export' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground text-sm">Deep insights into civic engagement and resolution performance</p>
        </div>
        <div className="flex gap-3">
          {/* Custom Select Box styled to match exact dashboard aesthetic */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            <select 
              value={timeRange} 
              onChange={(e) => {
                setTimeRange(e.target.value);
                toast.success(`Timeframe changed to ${e.target.value === '7' ? '7 days' : e.target.value === '30' ? '30 days' : '90 days'}`);
              }}
              className="appearance-none pl-10 pr-9 py-2 bg-secondary text-foreground font-semibold rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary text-sm shadow-sm cursor-pointer"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          </div>

          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            <Download size={16} /> Export Report (CSV)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Issues by State */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px] flex flex-col">
          <h3 className="font-bold text-foreground mb-4">Issues by State</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="state" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--bg-secondary)' }} contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Bar dataKey="issues" fill="var(--jade)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Rate by Category */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px] flex flex-col">
          <h3 className="font-bold text-foreground mb-4">Resolution Rate by Category</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Resolved" dataKey="A" stroke="var(--blue)" fill="var(--blue)" fillOpacity={0.3} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px] flex flex-col lg:col-span-2">
          <h3 className="font-bold text-foreground mb-4">New Citizen Registrations (Weekly)</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--saffron)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--saffron)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                <Area type="monotone" dataKey="users" stroke="var(--saffron)" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
