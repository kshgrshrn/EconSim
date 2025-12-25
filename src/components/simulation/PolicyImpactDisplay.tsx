import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, MinusCircle } from 'lucide-react';
import type { PolicyImpactResult, ImpactSection, ImpactLevel } from '@/types/simulation';

interface PolicyImpactDisplayProps {
  impacts: PolicyImpactResult | null;
}

function getImpactIcon(level: ImpactLevel) {
  switch (level) {
    case 'strong_positive':
      return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    case 'positive':
      return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    case 'neutral':
      return <MinusCircle className="h-4 w-4 text-muted-foreground" />;
    case 'negative':
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case 'strong_negative':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />;
  }
}

function getImpactColor(level: ImpactLevel): string {
  switch (level) {
    case 'strong_positive':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'positive':
      return 'text-emerald-500 dark:text-emerald-400';
    case 'neutral':
      return 'text-muted-foreground';
    case 'negative':
      return 'text-amber-600 dark:text-amber-400';
    case 'strong_negative':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-muted-foreground';
  }
}

function ImpactCard({ section }: { section: ImpactSection }) {
  return (
    <div className="bg-card border border-border p-4 flex flex-col h-full">
      <h3 className="font-semibold text-sm mb-3 text-foreground">{section.title}</h3>
      
      <ul className="space-y-2 flex-1 mb-4">
        {section.items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-0.5 flex-shrink-0">
              {getImpactIcon(item.level)}
            </span>
            <span className={`text-sm ${getImpactColor(item.level)}`}>
              {item.effect}
            </span>
          </li>
        ))}
      </ul>
      
      <div className="mt-auto pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground italic">
          {section.recommendation}
        </p>
      </div>
    </div>
  );
}

export function PolicyImpactDisplay({ impacts }: PolicyImpactDisplayProps) {
  if (!impacts) {
    return (
      <div className="bg-card border border-border p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Run a simulation to see policy impact analysis across consumers, producers, workers, and macro indicators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Policy Impact Analysis</h2>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
          {impacts.policyName}
        </span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ImpactCard section={impacts.consumer} />
        <ImpactCard section={impacts.producer} />
        <ImpactCard section={impacts.worker} />
        <ImpactCard section={impacts.macro} />
      </div>
    </div>
  );
}
