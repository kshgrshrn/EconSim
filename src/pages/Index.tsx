import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PolicySidebar } from '@/components/layout/PolicySidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { MetricsGrid } from '@/components/simulation/MetricsGrid';
import { TimeSeriesChart } from '@/components/simulation/TimeSeriesChart';
import { SupplyDemandChart } from '@/components/simulation/SupplyDemandChart';
import { ResultsTable } from '@/components/simulation/ResultsTable';
import { PolicyImpactDisplay } from '@/components/simulation/PolicyImpactDisplay';
import { runSimulation } from '@/lib/simulation-data';
import type { PolicyType, SimulationResult } from '@/types/simulation';

const Index = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleRunSimulation = async (policyType: PolicyType, parameters: Record<string, number | string>) => {
    setIsLoading(true);
    
    // Small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const simulationResult = runSimulation(policyType, parameters);
    setResult(simulationResult);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onChatToggle={() => setIsChatOpen(!isChatOpen)} isChatOpen={isChatOpen} />
      
      <div className="flex flex-1 overflow-hidden">
        <PolicySidebar onRunSimulation={handleRunSimulation} isLoading={isLoading} simulationResult={result} />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Simulation Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Configure policies in the sidebar and run simulations to analyze economic impacts
            </p>
          </div>

          <PolicyImpactDisplay impacts={result?.impacts ?? null} />

          <MetricsGrid outputs={result?.outputs ?? null} />

          <div className="grid grid-cols-2 gap-6">
            <TimeSeriesChart data={result?.outputs.timeSeriesData ?? null} />
            <SupplyDemandChart 
              demandCurve={result?.outputs.demandCurve ?? null} 
              supplyCurve={result?.outputs.supplyCurve ?? null} 
            />
          </div>

          <ResultsTable data={result?.outputs.timeSeriesData ?? null} />

          {result && (
            <div className="bg-card border border-border p-4">
              <h3 className="font-semibold text-sm mb-2">Simulation Metadata</h3>
              <div className="grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Policy:</span>
                  <span className="ml-2 font-medium">{result.impacts.policyName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Simulation ID:</span>
                  <span className="ml-2 font-mono">{result.id.slice(0, 8)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="ml-2">{result.timestamp.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Periods:</span>
                  <span className="ml-2 font-mono">{result.outputs.timeSeriesData.length}</span>
                </div>
              </div>
            </div>
          )}
        </main>

        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} simulationResult={result} />
      </div>
    </div>
  );
};

export default Index;
