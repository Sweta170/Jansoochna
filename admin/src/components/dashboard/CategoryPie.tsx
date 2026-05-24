import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Roads', value: 400, color: '#0F5C3A' }, // forest
  { name: 'Water', value: 300, color: '#2563EB' }, // blue
  { name: 'Electricity', value: 300, color: '#D97706' }, // amber
  { name: 'Sanitation', value: 200, color: '#1D9E75' }, // jade
  { name: 'Other', value: 150, color: '#64748B' }, // slate
];

export default function CategoryPie() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 h-[400px] flex flex-col">
      <div className="mb-2">
        <h3 className="font-bold text-foreground">Issues by Category</h3>
        <p className="text-sm text-muted-foreground">Distribution of active issues</p>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke="var(--bg-primary)"
                  strokeWidth={2}
                  style={{ 
                    filter: activeIndex === index ? `drop-shadow(0px 4px 8px ${entry.color}66)` : 'none',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-3xl font-extrabold text-foreground">{total.toLocaleString()}</span>
          <span className="text-xs font-semibold text-muted-foreground">TOTAL</span>
        </div>
      </div>
    </div>
  );
}
