import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TimeSeriesPoint } from '@/types/simulation';

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[] | null;
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border p-6 h-80 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Run a simulation to view time series data</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-4">
      <h3 className="font-semibold text-sm mb-4">Economic Indicators Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Period', position: 'insideBottom', offset: -5, fontSize: 10 }}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              width={40}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '0',
                fontSize: '12px'
              }} 
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Line 
              type="monotone" 
              dataKey="gdp" 
              name="GDP" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="employment" 
              name="Employment" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="inflation" 
              name="Inflation" 
              stroke="hsl(var(--chart-3))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke="hsl(var(--chart-4))" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
