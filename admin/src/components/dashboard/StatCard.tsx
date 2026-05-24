import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';
import { useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  format?: 'number' | 'time' | 'percent';
  trend: number;
  trendLabel: string;
  sparklineData: number[];
}

export default function StatCard({ title, value, format = 'number', trend, trendLabel, sparklineData }: StatCardProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 20, stiffness: 100 });
  const displayValue = useTransform(springValue, (current) => {
    if (format === 'time') return `${current.toFixed(1)} days`;
    if (format === 'percent') return `${current.toFixed(1)}%`;
    return Math.round(current).toLocaleString();
  });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  const isPositiveTrend = trend > 0;
  const data = sparklineData.map((val, i) => ({ name: i, value: val }));

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between h-32"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <motion.h3 className="text-2xl font-bold text-foreground mt-1">{displayValue}</motion.h3>
        </div>
        <div className="w-16 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={isPositiveTrend ? 'var(--jade)' : 'var(--crimson)'} 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 text-xs font-medium">
        <div className={`flex items-center gap-1 ${isPositiveTrend ? 'text-primary' : 'text-destructive'}`}>
          {isPositiveTrend ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(trend)}%</span>
        </div>
        <span className="text-muted-foreground">{trendLabel}</span>
      </div>
    </motion.div>
  );
}
