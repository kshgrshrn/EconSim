import { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { policyConfigs } from '@/lib/simulation-data';
import type { PolicyType, PolicyParameter } from '@/types/simulation';

interface PolicySidebarProps {
  onRunSimulation: (policyType: PolicyType, parameters: Record<string, number | string>) => void;
  isLoading: boolean;
}

export function PolicySidebar({ onRunSimulation, isLoading }: PolicySidebarProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('tax');
  const [parameters, setParameters] = useState<Record<string, number | string>>(() => {
    const initial: Record<string, number | string> = {};
    policyConfigs.forEach(config => {
      config.parameters.forEach(param => {
        initial[`${config.type}_${param.id}`] = param.value;
      });
    });
    return initial;
  });

  const currentConfig = policyConfigs.find(c => c.type === selectedPolicy)!;

  const updateParameter = (paramId: string, value: number | string) => {
    setParameters(prev => ({
      ...prev,
      [`${selectedPolicy}_${paramId}`]: value,
    }));
  };

  const handleRun = () => {
    const policyParams: Record<string, number | string> = {};
    currentConfig.parameters.forEach(param => {
      policyParams[param.id] = parameters[`${selectedPolicy}_${param.id}`];
    });
    onRunSimulation(selectedPolicy, policyParams);
  };

  const handleReset = () => {
    const reset: Record<string, number | string> = {};
    currentConfig.parameters.forEach(param => {
      reset[`${selectedPolicy}_${param.id}`] = param.value;
    });
    setParameters(prev => ({ ...prev, ...reset }));
  };

  const renderParameter = (param: PolicyParameter) => {
    const value = parameters[`${selectedPolicy}_${param.id}`];
    
    if (param.type === 'range') {
      return (
        <div key={param.id} className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs font-medium">{param.name}</Label>
            <span className="text-xs text-muted-foreground font-mono">
              {value}{param.unit}
            </span>
          </div>
          <Slider
            value={[value as number]}
            min={param.min}
            max={param.max}
            step={param.step}
            onValueChange={([v]) => updateParameter(param.id, v)}
          />
        </div>
      );
    }

    if (param.type === 'select') {
      return (
        <div key={param.id} className="space-y-2">
          <Label className="text-xs font-medium">{param.name}</Label>
          <Select value={value as string} onValueChange={v => updateParameter(param.id, v)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return (
      <div key={param.id} className="space-y-2">
        <Label className="text-xs font-medium">{param.name}</Label>
        <div className="relative">
          <Input
            type="number"
            value={value as number}
            min={param.min}
            max={param.max}
            onChange={e => updateParameter(param.id, parseFloat(e.target.value) || 0)}
            className="h-9 text-sm pr-8"
          />
          {param.unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {param.unit}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm mb-1">Policy Configuration</h2>
        <p className="text-xs text-muted-foreground">Select and configure economic policies</p>
      </div>

      <Tabs value={selectedPolicy} onValueChange={v => setSelectedPolicy(v as PolicyType)} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 h-10 p-1 mx-4 mt-4" style={{ width: 'calc(100% - 2rem)' }}>
          {policyConfigs.map(config => (
            <TabsTrigger key={config.type} value={config.type} className="text-xs px-2">
              {config.type === 'price_control' ? 'Price' : config.type.charAt(0).toUpperCase() + config.type.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {policyConfigs.map(config => (
          <TabsContent key={config.type} value={config.type} className="flex-1 p-4 pt-2 space-y-4 overflow-auto">
            <div className="pb-3 border-b border-border">
              <h3 className="font-medium text-sm">{config.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
            </div>
            
            <div className="space-y-4">
              {config.parameters.map(renderParameter)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="p-4 border-t border-border space-y-2">
        <Button 
          onClick={handleRun} 
          disabled={isLoading}
          className="w-full gap-2"
        >
          <Play className="h-4 w-4" />
          {isLoading ? 'Running...' : 'Run Simulation'}
        </Button>
        <Button variant="outline" onClick={handleReset} className="w-full gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset Parameters
        </Button>
      </div>
    </aside>
  );
}
