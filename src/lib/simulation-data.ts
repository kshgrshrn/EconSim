import type { 
  PolicyConfig, 
  SimulationResult, 
  TimeSeriesPoint, 
  DataPoint, 
  GlobalInputs,
  PolicyCategory,
  PolicyType 
} from '@/types/simulation';
import { evaluatePolicy, generateDeterministicOutputs } from './policy-engine';

export const policyConfigs: PolicyConfig[] = [
  {
    type: 'tax',
    name: 'Tax Policy',
    description: 'Analyze effects of taxation on economic indicators',
    parameters: [
      { 
        id: 'taxType', 
        name: 'Tax Type', 
        type: 'select', 
        value: 'indirect', 
        options: [
          { value: 'indirect', label: 'Indirect Tax (GST/Excise)' },
          { value: 'income', label: 'Income Tax' },
          { value: 'corporate', label: 'Corporate Tax' },
          { value: 'tariff', label: 'Import Duties/Tariffs' },
        ]
      },
      { id: 'rate', name: 'Tax Rate', type: 'range', value: 15, min: 0, max: 50, step: 1, unit: '%' },
      { 
        id: 'market', 
        name: 'Market Type', 
        type: 'select', 
        value: 'fuel', 
        options: [
          { value: 'fuel', label: 'Fuel (Low Elasticity)' },
          { value: 'food', label: 'Food (Low Elasticity)' },
          { value: 'electronics', label: 'Electronics (High Elasticity)' },
          { value: 'agriculture', label: 'Agriculture' },
        ]
      },
      { id: 'Ed', name: 'Demand Elasticity (Ed)', type: 'range', value: 0.5, min: 0.1, max: 2, step: 0.1 },
      { id: 'Es', name: 'Supply Elasticity (Es)', type: 'range', value: 0.8, min: 0.1, max: 2, step: 0.1 },
    ],
  },
  {
    type: 'subsidy',
    name: 'Subsidy Policy',
    description: 'Model government subsidy programs',
    parameters: [
      { 
        id: 'subsidyType', 
        name: 'Subsidy Type', 
        type: 'select', 
        value: 'consumer', 
        options: [
          { value: 'consumer', label: 'Consumer Subsidy' },
          { value: 'producer', label: 'Producer Subsidy' },
        ]
      },
      { id: 'rate', name: 'Subsidy Rate', type: 'range', value: 20, min: 0, max: 50, step: 1, unit: '%' },
      { 
        id: 'market', 
        name: 'Market Type', 
        type: 'select', 
        value: 'food', 
        options: [
          { value: 'fuel', label: 'Fuel' },
          { value: 'food', label: 'Food' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'agriculture', label: 'Agriculture' },
        ]
      },
      { id: 'Es', name: 'Supply Elasticity (Es)', type: 'range', value: 1.2, min: 0.1, max: 2, step: 0.1 },
    ],
  },
  {
    type: 'price_control',
    name: 'Price Control',
    description: 'Evaluate price floors and ceilings',
    parameters: [
      { 
        id: 'controlType', 
        name: 'Control Type', 
        type: 'select', 
        value: 'ceiling', 
        options: [
          { value: 'ceiling', label: 'Price Ceiling' },
          { value: 'floor', label: 'Price Floor / MSP' },
          { value: 'minimum_wage', label: 'Minimum Wage' },
        ]
      },
      { id: 'rate', name: 'Rate/Amount', type: 'range', value: 20, min: 0, max: 50, step: 1, unit: '%' },
      { 
        id: 'market', 
        name: 'Market Type', 
        type: 'select', 
        value: 'food', 
        options: [
          { value: 'fuel', label: 'Fuel' },
          { value: 'food', label: 'Food' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'agriculture', label: 'Agriculture' },
        ]
      },
      { id: 'Ed', name: 'Demand Elasticity (Ed)', type: 'range', value: 0.6, min: 0.1, max: 2, step: 0.1 },
      { id: 'Es', name: 'Supply Elasticity (Es)', type: 'range', value: 1.0, min: 0.1, max: 2, step: 0.1 },
      { id: 'laborDemandElasticity', name: 'Labor Demand Elasticity', type: 'range', value: 0.7, min: 0.1, max: 2, step: 0.1 },
    ],
  },
  {
    type: 'trade',
    name: 'Trade Policy',
    description: 'Simulate export subsidies and restrictions',
    parameters: [
      { 
        id: 'tradeType', 
        name: 'Trade Type', 
        type: 'select', 
        value: 'export_subsidy', 
        options: [
          { value: 'export_subsidy', label: 'Export Subsidy' },
          { value: 'export_restriction', label: 'Export Restriction / Quota' },
        ]
      },
      { id: 'rate', name: 'Rate', type: 'range', value: 15, min: 0, max: 50, step: 1, unit: '%' },
      { id: 'quota', name: 'Quota Amount', type: 'number', value: 1000, min: 0, max: 10000, unit: 'units' },
      { 
        id: 'market', 
        name: 'Market Type', 
        type: 'select', 
        value: 'agriculture', 
        options: [
          { value: 'fuel', label: 'Fuel' },
          { value: 'food', label: 'Food' },
          { value: 'electronics', label: 'Electronics' },
          { value: 'agriculture', label: 'Agriculture' },
        ]
      },
    ],
  },
];

// Map UI inputs to GlobalInputs and PolicyCategory
function mapToGlobalInputs(policyType: PolicyType, params: Record<string, number | string>): GlobalInputs {
  const marketType = (params.market as 'fuel' | 'food' | 'electronics' | 'agriculture') || 'fuel';
  const policyRate = (params.rate as number) || 15;
  
  let policyCategory: PolicyCategory;
  
  switch (policyType) {
    case 'tax':
      const taxType = params.taxType as string;
      if (taxType === 'income') policyCategory = 'tax_income';
      else if (taxType === 'corporate') policyCategory = 'tax_corporate';
      else if (taxType === 'tariff') policyCategory = 'tax_tariff';
      else policyCategory = 'tax_indirect';
      break;
    case 'subsidy':
      const subsidyType = params.subsidyType as string;
      policyCategory = subsidyType === 'producer' ? 'subsidy_producer' : 'subsidy_consumer';
      break;
    case 'price_control':
      const controlType = params.controlType as string;
      if (controlType === 'floor') policyCategory = 'price_floor';
      else if (controlType === 'minimum_wage') policyCategory = 'price_minimum_wage';
      else policyCategory = 'price_ceiling';
      break;
    case 'trade':
      const tradeType = params.tradeType as string;
      policyCategory = tradeType === 'export_restriction' ? 'trade_export_restriction' : 'trade_export_subsidy';
      break;
    default:
      policyCategory = 'tax_indirect';
  }
  
  return {
    marketType,
    policyCategory,
    policyRate,
    Ed: params.Ed as number | undefined,
    Es: params.Es as number | undefined,
    P0: params.P0 as number | undefined,
    Q0: params.Q0 as number | undefined,
    laborDemandElasticity: params.laborDemandElasticity as number | undefined,
    laborSupplyElasticity: params.laborSupplyElasticity as number | undefined,
    quotaAmount: params.quota as number | undefined,
  };
}

// Generate deterministic time series based on policy impacts
function generateDeterministicTimeSeries(
  macroOutputs: { gdpChange: number; employmentChange: number; inflationChange: number; revenueChange: number }
): TimeSeriesPoint[] {
  const periods = 12;
  const timeSeriesData: TimeSeriesPoint[] = [];
  
  const baseGDP = 100;
  const baseEmployment = 95;
  const baseInflation = 2;
  const baseRevenue = 50;
  
  for (let i = 0; i < periods; i++) {
    const progress = (i + 1) / periods;
    
    timeSeriesData.push({
      period: i + 1,
      gdp: Math.round((baseGDP + macroOutputs.gdpChange * progress) * 100) / 100,
      employment: Math.round((baseEmployment + macroOutputs.employmentChange * progress) * 100) / 100,
      inflation: Math.round((baseInflation + macroOutputs.inflationChange * progress) * 100) / 100,
      revenue: Math.round((baseRevenue + macroOutputs.revenueChange * progress) * 100) / 100,
    });
  }
  
  return timeSeriesData;
}

// Generate supply/demand curves based on policy type
function generateDeterministicCurves(inputs: GlobalInputs): { demandCurve: DataPoint[]; supplyCurve: DataPoint[] } {
  const demandCurve: DataPoint[] = [];
  const supplyCurve: DataPoint[] = [];
  
  const Ed = inputs.Ed || 0.5;
  const Es = inputs.Es || 0.8;
  
  // Adjust curves based on policy category
  let demandShift = 0;
  let supplyShift = 0;
  
  const category = inputs.policyCategory;
  if (category.includes('subsidy_consumer')) demandShift = 10;
  if (category.includes('subsidy_producer')) supplyShift = 15;
  if (category.includes('tax')) demandShift = -5;
  if (category.includes('ceiling')) supplyShift = -10;
  if (category.includes('floor')) demandShift = -8;
  
  for (let q = 10; q <= 100; q += 10) {
    demandCurve.push({ x: q, y: 150 - q * (1 + Ed * 0.2) + demandShift });
    supplyCurve.push({ x: q, y: 20 + q * (0.5 + Es * 0.3) + supplyShift });
  }
  
  return { demandCurve, supplyCurve };
}

export function runSimulation(policyType: PolicyType, params: Record<string, number | string>): SimulationResult {
  // Map UI inputs to global inputs schema
  const inputs = mapToGlobalInputs(policyType, params);
  
  // Run deterministic policy evaluation
  const impacts = evaluatePolicy(inputs);
  
  // Generate deterministic macro outputs based on impacts
  const macroOutputs = generateDeterministicOutputs(impacts, inputs);
  
  // Generate deterministic time series
  const timeSeriesData = generateDeterministicTimeSeries(macroOutputs);
  
  // Generate deterministic curves
  const { demandCurve, supplyCurve } = generateDeterministicCurves(inputs);
  
  return {
    id: crypto.randomUUID(),
    policyType,
    policyCategory: inputs.policyCategory,
    timestamp: new Date(),
    inputs,
    impacts,
    outputs: {
      ...macroOutputs,
      priceLevel: timeSeriesData.map((_, i) => 100 + macroOutputs.inflationChange * ((i + 1) / 12)),
      demandCurve,
      supplyCurve,
      timeSeriesData,
    },
  };
}

// Legacy function for backward compatibility - now uses deterministic engine
export function generateMockSimulation(policyType: string, inputs: Record<string, number | string>): SimulationResult {
  return runSimulation(policyType as PolicyType, inputs);
}
