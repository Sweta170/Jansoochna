import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

export default function IssueChart() {
  const [timeRange, setTimeRange] = useState('30d');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await api.get('/admin/issues');
        // Group by date
        const groups: Record<string, { date: string; timestamp: number; reported: number; resolved: number }> = {};
        
        res.data.forEach((issue: any) => {
          const d = new Date(issue.createdAt);
          const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
          const key = d.toDateString(); // unique per day
          
          if (!groups[key]) {
            groups[key] = {
              date: dateStr,
              timestamp: d.getTime(),
              reported: 0,
              resolved: 0,
            };
          }
          
          groups[key].reported += 1;
          if (issue.status === 'resolved') {
            groups[key].resolved += 1;
          }
        });

        const sorted = Object.values(groups)
          .sort((a, b) => a.timestamp - b.timestamp)
          .map(({ date, reported, resolved }) => ({ date, reported, resolved }));
          
        // Fallback mock dates if there are no real issues yet
        if (sorted.length === 0) {
          setData([
            { date: '01 May', reported: 0, resolved: 0 },
            { date: '10 May', reported: 0, resolved: 0 },
            { date: '20 May', reported: 0, resolved: 0 },
          ]);
        } else {
          setData(sorted);
        }
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, []);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-foreground">Issues Volume</h3>
          <p className="text-sm text-muted-foreground">Reported vs Resolved daily trend</p>
        </div>
        <div className="flex bg-secondary p-1 rounded-lg border border-border">
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${timeRange === range ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse text-sm">Loading trend data...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Line type="monotone" name="Reported" dataKey="reported" stroke="var(--saffron)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Resolved" dataKey="resolved" stroke="var(--jade)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
