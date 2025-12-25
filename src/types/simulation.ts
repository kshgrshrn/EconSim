// ============= Global Input Schema =============

export type MarketType = 'fuel' | 'food' | 'electronics' | 'agriculture';

export type PolicyCategory = 
  | 'tax_indirect'
  | 'tax_income'
  | 'tax_corporate'
  | 'tax_tariff'
  | 'subsidy_consumer'
  | 'subsidy_producer'
  | 'price_ceiling'
  | 'price_floor'
  | 'price_minimum_wage'
  | 'trade_export_subsidy'
  | 'trade_export_restriction';

export type PolicyType = 'tax' | 'trade' | 'subsidy' | 'price_control';

export interface GlobalInputs {
  marketType: MarketType;
  policyCategory: PolicyCategory;
  policyRate: number; // % or ₹
  Ed?: number; // elasticity of demand (optional)
  Es?: number; // elasticity of supply (optional)
  P0?: number; // initial price (optional)
  Q0?: number; // initial quantity (optional)
  laborDemandElasticity?: number; // for minimum wage only
  laborSupplyElasticity?: number; // for minimum wage only
  quotaAmount?: number; // for export restrictions
}

// ============= Impact Types =============

export type ImpactLevel = 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';

export interface ImpactItem {
  effect: string;
  level: ImpactLevel;
}

export interface ImpactSection {
  title: string;
  items: ImpactItem[];
  recommendation: string;
}

export interface PolicyImpactResult {
  policyCategory: PolicyCategory;
  policyName: string;
  consumer: ImpactSection;
  producer: ImpactSection;
  worker: ImpactSection;
  macro: ImpactSection;
}

// ============= Legacy Types (kept for chart compatibility) =============

export interface PolicyConfig {
  type: PolicyType;
  name: string;
  description: string;
  parameters: PolicyParameter[];
}

export interface PolicyParameter {
  id: string;
  name: string;
  type: 'number' | 'select' | 'range';
  value: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  unit?: string;
}

export interface SimulationResult {
  id: string;
  policyType: PolicyType;
  policyCategory: PolicyCategory;
  timestamp: Date;
  inputs: GlobalInputs;
  impacts: PolicyImpactResult;
  outputs: SimulationOutput;
}

export interface SimulationOutput {
  gdpChange: number;
  employmentChange: number;
  inflationChange: number;
  revenueChange: number;
  welfareChange: number;
  priceLevel: number[];
  demandCurve: DataPoint[];
  supplyCurve: DataPoint[];
  timeSeriesData: TimeSeriesPoint[];
}

export interface DataPoint {
  x: number;
  y: number;
}

export interface TimeSeriesPoint {
  period: number;
  gdp: number;
  employment: number;
  inflation: number;
  revenue: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
