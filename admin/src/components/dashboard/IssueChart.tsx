import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { date: '01 May', reported: 120, resolved: 90 },
  { date: '05 May', reported: 150, resolved: 110 },
  { date: '10 May', reported: 180, resolved: 160 },
  { date: '15 May', reported: 140, resolved: 150 },
  { date: '20 May', reported: 200, resolved: 180 },
];

export default function IssueChart() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-foreground">Issues Volume</h3>
          <p className="text-sm text-muted-foreground">Reported vs Resolved</p>
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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
      </div>
    </div>
  );
}
