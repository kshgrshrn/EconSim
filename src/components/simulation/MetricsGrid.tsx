import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SimulationOutput } from '@/types/simulation';

interface MetricsGridProps {
  outputs: SimulationOutput | null;
}

interface MetricCardProps {
  label: string;
  value: number | null;
  unit: string;
  description: string;
}

function MetricCard({ label, value, unit, description }: MetricCardProps) {
  const isPositive = value !== null && value > 0;
  const isNegative = value !== null && value < 0;
  
  return (
    <div className="bg-card border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        {value !== null && (
          <span className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 
            isNegative ? 'text-red-600 dark:text-red-400' : 
            'text-muted-foreground'
          }`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : 
             isNegative ? <TrendingDown className="h-3 w-3" /> : 
             <Minus className="h-3 w-3" />}
            {isPositive ? '+' : ''}{value?.toFixed(2)}{unit}
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold font-mono tabular-nums">
        {value !== null ? (
          <>
            {isPositive ? '+' : ''}{value.toFixed(2)}
            <span className="text-sm text-muted-foreground ml-1">{unit}</span>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export function MetricsGrid({ outputs }: MetricsGridProps) {
  const metrics = [
    { label: 'GDP Change', value: outputs?.gdpChange ?? null, unit: '%', description: 'Change in gross domestic product' },
    { label: 'Employment', value: outputs?.employmentChange ?? null, unit: '%', description: 'Change in employment rate' },
    { label: 'Inflation', value: outputs?.inflationChange ?? null, unit: '%', description: 'Change in price levels' },
    { label: 'Revenue', value: outputs?.revenueChange ?? null, unit: 'B$', description: 'Government revenue impact' },
    { label: 'Welfare', value: outputs?.welfareChange ?? null, unit: '%', description: 'Net welfare change' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {metrics.map(metric => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
