import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SimulationOutput } from '@/types/simulation';

interface MetricsGridProps {
  outputs: SimulationOutput | null;
}

interface MetricCardProps {
  label: string;
  value: number | null;
  unit: string;
  description: string;
  glossary: string;
}

function MetricCard({ label, value, unit, description, glossary }: MetricCardProps) {
  const isPositive = value !== null && value > 0;
  const isNegative = value !== null && value < 0;
  const baselineValue = 0; // Baseline is no change
  
  return (
    <div className="bg-card border border-border p-4 flex flex-col h-full min-w-0">
      <div className="flex items-start justify-between mb-2 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {label}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">{glossary}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {value !== null && (
          <span className={`flex items-center gap-1 text-xs font-medium flex-shrink-0 ${
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
      <div className="text-2xl font-semibold font-mono tabular-nums truncate">
        {value !== null ? (
          <>
            {isPositive ? '+' : ''}{value.toFixed(2)}
            <span className="text-sm text-muted-foreground ml-1">{unit}</span>
          </>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground min-w-0">
        <span className="flex-shrink-0">Baseline:</span>
        <span className="font-mono truncate">{baselineValue.toFixed(2)}{unit}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{description}</p>
    </div>
  );
}

export function MetricsGrid({ outputs }: MetricsGridProps) {
  const metrics = [
    { 
      label: 'GDP Change', 
      value: outputs?.gdpChange ?? null, 
      unit: '%', 
      description: 'Change in gross domestic product',
      glossary: 'The percentage change in total economic output. Positive = economic growth, negative = contraction.'
    },
    { 
      label: 'Employment', 
      value: outputs?.employmentChange ?? null, 
      unit: '%', 
      description: 'Change in employment rate',
      glossary: 'The percentage change in job availability. Positive = more jobs, negative = job losses.'
    },
    { 
      label: 'Inflation', 
      value: outputs?.inflationChange ?? null, 
      unit: '%', 
      description: 'Change in price levels',
      glossary: 'The percentage change in general price levels. Positive = higher prices, negative = lower prices.'
    },
    { 
      label: 'Revenue', 
      value: outputs?.revenueChange ?? null, 
      unit: 'B$', 
      description: 'Government revenue impact',
      glossary: 'The billions of dollars in government revenue generated or lost. Positive = more tax revenue collected.'
    },
    { 
      label: 'Welfare', 
      value: outputs?.welfareChange ?? null, 
      unit: '%', 
      description: 'Net welfare change',
      glossary: 'Overall impact on consumer well-being. Positive = consumers better off, negative = reduced purchasing power.'
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {metrics.map(metric => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
