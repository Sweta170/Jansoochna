import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../../services/api';

const COLOR_MAP: Record<string, string> = {
  road: '#0F5C3A',
  water: '#2563EB',
  electricity: '#D97706',
  garbage: '#1D9E75',
  drainage: '#7C3AED',
  parks: '#10B981',
  streetlight: '#F59E0B',
  other: '#64748B',
};

const NAME_MAP: Record<string, string> = {
  road: 'Roads',
  water: 'Water',
  electricity: 'Electricity',
  garbage: 'Sanitation',
  drainage: 'Drainage',
  parks: 'Parks',
  streetlight: 'Streetlight',
  other: 'Other',
};

export default function CategoryPie() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const res = await api.get('/admin/stats/categories');
        const formatted = res.data.map((item: any) => {
          const cat = item._id || 'other';
          return {
            name: NAME_MAP[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1)),
            value: item.count,
            color: COLOR_MAP[cat] || '#64748B',
          };
        });
        setData(formatted);
      } catch (err) {
        console.error('Failed to load category statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryStats();
  }, []);

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
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse text-sm">Loading statistics...</span>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
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
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-extrabold text-foreground">{total.toLocaleString()}</span>
              <span className="text-xs font-semibold text-muted-foreground">TOTAL</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
