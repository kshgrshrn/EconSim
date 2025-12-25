import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { DataPoint } from '@/types/simulation';

interface SupplyDemandChartProps {
  demandCurve: DataPoint[] | null;
  supplyCurve: DataPoint[] | null;
}

export function SupplyDemandChart({ demandCurve, supplyCurve }: SupplyDemandChartProps) {
  if (!demandCurve || !supplyCurve) {
    return (
      <div className="bg-card border border-border p-6 h-80 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Run a simulation to view market equilibrium</p>
      </div>
    );
  }

  // Combine data for chart
  const chartData = demandCurve.map((d, i) => ({
    quantity: d.x,
    demand: Math.round(d.y * 100) / 100,
    supply: Math.round(supplyCurve[i]?.y * 100) / 100,
  }));

  // Find equilibrium (where curves intersect)
  let equilibriumQ = 50;
  let equilibriumP = 60;
  for (let i = 0; i < chartData.length - 1; i++) {
    if (chartData[i].demand >= chartData[i].supply && chartData[i + 1].demand <= chartData[i + 1].supply) {
      equilibriumQ = chartData[i].quantity;
      equilibriumP = (chartData[i].demand + chartData[i].supply) / 2;
      break;
    }
  }

  return (
    <div className="bg-card border border-border p-4">
      <h3 className="font-semibold text-sm mb-4">Supply & Demand Equilibrium</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="quantity" 
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Quantity', position: 'insideBottom', offset: -5, fontSize: 11 }}
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'Price', angle: -90, position: 'insideLeft', fontSize: 11 }}
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
            <ReferenceLine x={equilibriumQ} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
            <ReferenceLine y={equilibriumP} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
            <Line 
              type="monotone" 
              dataKey="demand" 
              name="Demand" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="supply" 
              name="Supply" 
              stroke="hsl(var(--chart-5))" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Equilibrium: Q = {equilibriumQ}, P = ${equilibriumP.toFixed(2)}
      </div>
    </div>
  );
}
