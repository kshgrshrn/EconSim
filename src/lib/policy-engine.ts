import type { 
  GlobalInputs, 
  PolicyCategory, 
  PolicyImpactResult, 
  ImpactSection, 
  ImpactLevel,
  MarketType 
} from '@/types/simulation';

// ============= Elasticity Helpers =============

function isLowElasticity(ed?: number): boolean {
  return ed !== undefined && ed < 1;
}

function isHighElasticity(ed?: number): boolean {
  return ed !== undefined && ed >= 1;
}

function isEssentialGood(market: MarketType): boolean {
  return market === 'fuel' || market === 'food';
}

function isHighElasticityGood(market: MarketType): boolean {
  return market === 'electronics';
}

function getPolicyName(category: PolicyCategory): string {
  const names: Record<PolicyCategory, string> = {
    'tax_indirect': 'Indirect Tax (GST / Excise / Carbon Tax)',
    'tax_income': 'Income Tax',
    'tax_corporate': 'Corporate Tax',
    'tax_tariff': 'Import Duties / Tariffs',
    'subsidy_consumer': 'Consumer Subsidy',
    'subsidy_producer': 'Producer Subsidy',
    'price_ceiling': 'Price Ceiling',
    'price_floor': 'Price Floor / MSP',
    'price_minimum_wage': 'Minimum Wage',
    'trade_export_subsidy': 'Export Subsidy',
    'trade_export_restriction': 'Export Restrictions / Quotas',
  };
  return names[category];
}

// ============= Tax Policy Engines =============

function evaluateIndirectTax(inputs: GlobalInputs): PolicyImpactResult {
  const { marketType, Ed, Es, policyRate } = inputs;
  const isLowEd = isLowElasticity(Ed) || isEssentialGood(marketType);
  const isHighEd = isHighElasticity(Ed) || isHighElasticityGood(marketType);
  const isLowEs = isLowElasticity(Es);
  const isHighRate = policyRate > 15;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: isLowEd ? [
      { effect: 'Prices increase significantly', level: 'strong_negative' },
      { effect: 'Consumption decreases slightly', level: 'negative' },
      { effect: 'Welfare decreases significantly', level: 'strong_negative' },
    ] : [
      { effect: 'Consumption decreases significantly', level: 'strong_negative' },
      { effect: 'Substitution to alternatives increases', level: 'positive' },
      { effect: 'Price sensitivity leads to demand reduction', level: 'negative' },
    ],
    recommendation: isLowEd
      ? 'Essential goods are less elastic; prices rise. Budget-conscious consumers may need to adjust spending.'
      : 'High elasticity means consumers respond strongly; consider substitutes or delaying purchases.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: isLowEs ? [
      { effect: 'Profit margins decrease slightly', level: 'negative' },
      { effect: 'Output decreases slightly', level: 'negative' },
    ] : [
      { effect: 'Output decreases more significantly', level: 'strong_negative' },
      { effect: 'Production cuts likely', level: 'negative' },
    ],
    recommendation: isLowEs
      ? 'Low supply elasticity means producers absorb some tax burden; margins compressed.'
      : 'High supply elasticity leads to production adjustments; expect supply reductions.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment decreases', level: 'negative' },
      { effect: isHighEd || isHighRate ? 'Stronger job losses in affected sectors' : 'Moderate employment effects', level: isHighEd || isHighRate ? 'strong_negative' : 'negative' },
    ],
    recommendation: 'Workers in taxed sectors may face reduced hours or layoffs as producers adjust costs.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'Government revenue increases', level: 'positive' },
      { effect: 'Inflation increases', level: 'negative' },
      { effect: 'GDP decreases slightly', level: 'negative' },
      { effect: 'Employment decreases', level: 'negative' },
    ],
    recommendation: 'Tax revenue gains offset by reduced economic activity and higher price levels.',
  };

  return {
    policyCategory: 'tax_indirect',
    policyName: getPolicyName('tax_indirect'),
    consumer,
    producer,
    worker,
    macro,
  };
}

function evaluateIncomeTax(inputs: GlobalInputs): PolicyImpactResult {
  const { policyRate } = inputs;
  const isHighRate = policyRate > 25;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Disposable income decreases', level: isHighRate ? 'strong_negative' : 'negative' },
      { effect: 'Consumption spending decreases', level: 'negative' },
      { effect: 'Savings may decrease', level: 'negative' },
    ],
    recommendation: 'Reduced take-home pay limits consumer spending power; prioritize essential expenditures.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Sales decline as consumer spending falls', level: 'negative' },
      { effect: 'SMEs affected more significantly', level: 'strong_negative' },
      { effect: 'Demand-driven revenue reduction', level: 'negative' },
    ],
    recommendation: 'Lower consumer demand impacts sales; businesses may need to adjust pricing or inventory.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Hiring slows', level: 'negative' },
      { effect: 'Wage growth decelerates', level: 'negative' },
      { effect: 'Work incentives may decrease', level: 'negative' },
    ],
    recommendation: 'Higher income taxes can reduce labor supply incentives and slow wage negotiations.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'Government revenue increases', level: 'positive' },
      { effect: 'GDP decreases', level: 'negative' },
      { effect: 'Inflation neutral or decreases', level: 'neutral' },
    ],
    recommendation: 'Fiscal revenue improves but consumption-driven growth slows.',
  };

  return {
    policyCategory: 'tax_income',
    policyName: getPolicyName('tax_income'),
    consumer,
    producer,
    worker,
    macro,
  };
}

function evaluateCorporateTax(inputs: GlobalInputs): PolicyImpactResult {
  const { policyRate } = inputs;
  const isHighRate = policyRate > 25;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Prices increase slightly as costs pass through', level: 'negative' },
      { effect: 'Product availability may decrease', level: 'negative' },
    ],
    recommendation: 'Some corporate tax burden may be passed to consumers through higher prices.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Post-tax profits decrease', level: isHighRate ? 'strong_negative' : 'negative' },
      { effect: 'Investment decreases', level: 'negative' },
      { effect: 'R&D spending decreases', level: 'negative' },
      { effect: 'Expansion plans may be delayed', level: 'negative' },
    ],
    recommendation: 'Higher corporate taxes reduce retained earnings for reinvestment and growth.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Hiring slows', level: 'negative' },
      { effect: 'Job security decreases', level: 'negative' },
      { effect: 'Bonus and benefit cuts possible', level: 'negative' },
    ],
    recommendation: 'Reduced profitability may lead to workforce adjustments and slower hiring.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'Government revenue increases', level: 'positive' },
      { effect: 'GDP decreases', level: 'negative' },
      { effect: 'Inflation neutral or slightly increases', level: 'neutral' },
      { effect: 'Business investment declines', level: 'negative' },
    ],
    recommendation: 'Revenue gains balanced against reduced business investment and slower growth.',
  };

  return {
    policyCategory: 'tax_corporate',
    policyName: getPolicyName('tax_corporate'),
    consumer,
    producer,
    worker,
    macro,
  };
}

function evaluateTariff(inputs: GlobalInputs): PolicyImpactResult {
  const { policyRate } = inputs;
  const isHighRate = policyRate > 20;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Imported goods prices increase', level: isHighRate ? 'strong_negative' : 'negative' },
      { effect: 'Product choices decrease', level: 'negative' },
      { effect: 'Quality alternatives may be limited', level: 'negative' },
    ],
    recommendation: 'Higher import costs reduce purchasing power for foreign goods; consider domestic alternatives.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Domestic firms gain protection', level: 'positive' },
      { effect: 'Import-reliant firms face higher input costs', level: 'negative' },
      { effect: 'Competitive pressure decreases', level: 'positive' },
    ],
    recommendation: 'Domestic producers benefit from reduced foreign competition but may face higher input costs.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment increases in protected sectors', level: 'positive' },
      { effect: 'Jobs may shift from import-dependent to domestic industries', level: 'neutral' },
    ],
    recommendation: 'Protected industries may expand hiring as domestic production increases.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'Government revenue increases', level: 'positive' },
      { effect: 'Inflation increases', level: 'negative' },
      { effect: 'Trade deficit decreases', level: 'positive' },
      { effect: 'Potential for trade retaliation', level: 'negative' },
    ],
    recommendation: 'Tariff revenue and trade balance improve but at cost of higher domestic prices.',
  };

  return {
    policyCategory: 'tax_tariff',
    policyName: getPolicyName('tax_tariff'),
    consumer,
    producer,
    worker,
    macro,
  };
}

// ============= Subsidy Policy Engines =============

function evaluateConsumerSubsidy(inputs: GlobalInputs): PolicyImpactResult {
  const { policyRate } = inputs;
  const isHighSubsidy = policyRate > 20;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Effective prices decrease', level: isHighSubsidy ? 'strong_positive' : 'positive' },
      { effect: 'Welfare increases', level: 'positive' },
      { effect: 'Purchasing power increases', level: 'positive' },
    ],
    recommendation: 'Subsidies directly reduce consumer costs; take advantage of lower effective prices.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Demand increases', level: 'positive' },
      { effect: 'Revenue increases', level: 'positive' },
      { effect: 'Production expands to meet demand', level: 'positive' },
    ],
    recommendation: 'Higher demand from subsidized consumers drives sales growth and expansion.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment increases', level: 'positive' },
      { effect: 'Job opportunities expand', level: 'positive' },
    ],
    recommendation: 'Growing production creates new employment opportunities.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'Government expenditure increases', level: 'negative' },
      { effect: 'GDP increases', level: 'positive' },
      { effect: 'Inflation may increase (demand-pull)', level: 'negative' },
    ],
    recommendation: 'Stimulus effect on growth offset by fiscal costs and potential inflationary pressure.',
  };

  return {
    policyCategory: 'subsidy_consumer',
    policyName: getPolicyName('subsidy_consumer'),
    consumer,
    producer,
    worker,
    macro,
  };
}

function evaluateProducerSubsidy(inputs: GlobalInputs): PolicyImpactResult {
  const { Es, policyRate } = inputs;
  const isHighEs = isHighElasticity(Es);
  const isHighSubsidy = policyRate > 20;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Prices decrease', level: isHighSubsidy ? 'strong_positive' : 'positive' },
      { effect: 'Product availability increases', level: 'positive' },
    ],
    recommendation: 'Lower production costs translate to reduced consumer prices.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Profits increase', level: 'positive' },
      { effect: 'Output increases', level: isHighEs ? 'strong_positive' : 'positive' },
      { effect: 'Investment capacity increases', level: 'positive' },
    ],
    recommendation: 'Subsidies improve margins and enable capacity expansion.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment increases', level: 'positive' },
      { effect: 'Job security improves', level: 'positive' },
    ],
    recommendation: 'Expanded production creates stable employment opportunities.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'GDP increases', level: 'positive' },
      { effect: 'Inflation neutral or decreases', level: 'positive' },
      { effect: 'Government expenditure increases', level: 'negative' },
    ],
    recommendation: 'Supply-side stimulus grows economy with minimal inflationary pressure.',
  };

  return {
    policyCategory: 'subsidy_producer',
    policyName: getPolicyName('subsidy_producer'),
    consumer,
    producer,
    worker,
    macro,
  };
}

// ============= Price Control Policy Engines =============

function evaluatePriceCeiling(inputs: GlobalInputs): PolicyImpactResult {
  const { Ed, Es } = inputs;
  const isHighEs = isHighElasticity(Es);

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Prices decrease (capped)', level: 'positive' },
      { effect: 'Shortages increase', level: 'strong_negative' },
      { effect: 'Black markets may emerge', level: 'negative' },
      { effect: 'Quality may decline', level: 'negative' },
    ],
    recommendation: 'Lower prices come with supply shortages; expect queues and rationing.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Output decreases', level: isHighEs ? 'strong_negative' : 'negative' },
      { effect: 'Profit margins squeezed', level: 'negative' },
      { effect: 'Investment in sector decreases', level: 'negative' },
    ],
    recommendation: 'Price caps reduce incentive to produce; supply constraints worsen over time.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment decreases', level: 'negative' },
      { effect: 'Sector layoffs possible', level: 'negative' },
    ],
    recommendation: 'Reduced production leads to workforce reductions in affected sectors.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'GDP decreases', level: 'negative' },
      { effect: 'Economic inefficiency increases', level: 'negative' },
      { effect: 'Resource misallocation increases', level: 'negative' },
    ],
    recommendation: 'Market distortions create deadweight losses and economic inefficiency.',
  };

  return {
    policyCategory: 'price_ceiling',
    policyName: getPolicyName('price_ceiling'),
    consumer,
    producer,
    worker,
    macro,
  };
}

function evaluatePriceFloor(inputs: GlobalInputs): PolicyImpactResult {
  const { Ed, Es } = inputs;
  const isHighEs = isHighElasticity(Es);

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Prices increase (minimum set)', level: 'negative' },
      { effect: 'Demand decreases', level: 'negative' },
      { effect: 'Consumption falls', level: 'negative' },
    ],
    recommendation: 'Higher mandated prices reduce consumer purchasing; budget adjustments needed.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Revenue guaranteed at minimum level', level: 'positive' },
      { effect: 'Surplus increases', level: isHighEs ? 'strong_positive' : 'positive' },
      { effect: 'May overproduce expecting floor price', level: 'negative' },
    ],
    recommendation: 'Price floors provide revenue stability but may lead to overproduction.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment increases if procurement exists', level: 'positive' },
      { effect: 'Rural employment may benefit', level: 'positive' },
    ],
    recommendation: 'Government procurement programs support employment in supported sectors.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'Inflation increases', level: 'negative' },
      { effect: 'Fiscal burden increases (procurement costs)', level: 'negative' },
      { effect: 'Surplus management costs increase', level: 'negative' },
    ],
    recommendation: 'Price floors create fiscal obligations and inflationary pressure.',
  };

  return {
    policyCategory: 'price_floor',
    policyName: getPolicyName('price_floor'),
    consumer,
    producer,
    worker,
    macro,
  };
}

function evaluateMinimumWage(inputs: GlobalInputs): PolicyImpactResult {
  const { laborDemandElasticity, policyRate } = inputs;
  const isElasticDemand = isHighElasticity(laborDemandElasticity);
  const isHighRate = policyRate > 30;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Low-income consumption increases', level: 'positive' },
      { effect: 'Purchasing power of workers rises', level: 'positive' },
      { effect: 'Prices of labor-intensive goods may increase', level: 'negative' },
    ],
    recommendation: 'Higher wages boost spending power for low-income workers.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Labor costs increase', level: 'negative' },
      { effect: 'Hiring decreases', level: isElasticDemand ? 'strong_negative' : 'negative' },
      { effect: 'Automation incentives increase', level: 'neutral' },
    ],
    recommendation: isElasticDemand
      ? 'Elastic labor demand means significant hiring reductions; expect automation shifts.'
      : 'Labor costs rise but hiring impacts are moderate in inelastic markets.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Wages increase for employed workers', level: 'positive' },
      { effect: 'Unemployment may increase', level: isElasticDemand || isHighRate ? 'strong_negative' : 'negative' },
      { effect: 'Entry-level opportunities may decrease', level: 'negative' },
    ],
    recommendation: 'Higher wages benefit employed workers; some may face job losses or reduced hours.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'Income inequality decreases', level: 'positive' },
      { effect: 'Inflation increases slightly', level: 'negative' },
      { effect: 'Consumer spending increases', level: 'positive' },
    ],
    recommendation: 'Minimum wage reduces inequality but may cause moderate inflation.',
  };

  return {
    policyCategory: 'price_minimum_wage',
    policyName: getPolicyName('price_minimum_wage'),
    consumer,
    producer,
    worker,
    macro,
  };
}

// ============= Trade Policy Engines =============

function evaluateExportSubsidy(inputs: GlobalInputs): PolicyImpactResult {
  const { policyRate } = inputs;
  const isHighSubsidy = policyRate > 15;

  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Domestic prices may increase as goods exported', level: 'negative' },
      { effect: 'Domestic availability may decrease', level: 'negative' },
    ],
    recommendation: 'Export focus may reduce domestic supply; prices could rise locally.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Export profits increase', level: isHighSubsidy ? 'strong_positive' : 'positive' },
      { effect: 'Output increases', level: 'positive' },
      { effect: 'International competitiveness increases', level: 'positive' },
    ],
    recommendation: 'Subsidies make exports more competitive; producers gain market share abroad.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment in export sectors increases', level: 'positive' },
      { effect: 'Job creation in manufacturing', level: 'positive' },
    ],
    recommendation: 'Export growth creates employment in production and logistics.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'GDP increases', level: 'positive' },
      { effect: 'Fiscal burden increases', level: 'negative' },
      { effect: 'Trade surplus increases', level: 'positive' },
      { effect: 'Risk of trade disputes', level: 'negative' },
    ],
    recommendation: 'Export subsidies boost growth but create fiscal costs and trade tensions.',
  };

  return {
    policyCategory: 'trade_export_subsidy',
    policyName: getPolicyName('trade_export_subsidy'),
    consumer,
    producer,
    worker,
    macro,
  };
}

function evaluateExportRestriction(inputs: GlobalInputs): PolicyImpactResult {
  const consumer: ImpactSection = {
    title: 'Consumer Impact',
    items: [
      { effect: 'Domestic availability increases', level: 'positive' },
      { effect: 'Domestic prices decrease', level: 'positive' },
      { effect: 'Supply stability improves', level: 'positive' },
    ],
    recommendation: 'Export limits increase domestic supply; consumers benefit from lower prices.',
  };

  const producer: ImpactSection = {
    title: 'Producer Impact',
    items: [
      { effect: 'Export revenue decreases', level: 'negative' },
      { effect: 'International market access limited', level: 'negative' },
      { effect: 'Domestic prices may not cover costs', level: 'negative' },
    ],
    recommendation: 'Producers lose lucrative export markets; domestic focus reduces profitability.',
  };

  const worker: ImpactSection = {
    title: 'Worker Impact',
    items: [
      { effect: 'Employment in export sectors decreases', level: 'negative' },
      { effect: 'Job losses in trade-dependent industries', level: 'negative' },
    ],
    recommendation: 'Reduced exports lead to workforce reductions in affected sectors.',
  };

  const macro: ImpactSection = {
    title: 'Macro Indicators',
    items: [
      { effect: 'GDP neutral or decreases', level: 'neutral' },
      { effect: 'Trade surplus decreases', level: 'negative' },
      { effect: 'Domestic food/commodity security improves', level: 'positive' },
    ],
    recommendation: 'Domestic availability improves at cost of export earnings.',
  };

  return {
    policyCategory: 'trade_export_restriction',
    policyName: getPolicyName('trade_export_restriction'),
    consumer,
    producer,
    worker,
    macro,
  };
}

// ============= Main Policy Engine =============

export function evaluatePolicy(inputs: GlobalInputs): PolicyImpactResult {
  switch (inputs.policyCategory) {
    case 'tax_indirect':
      return evaluateIndirectTax(inputs);
    case 'tax_income':
      return evaluateIncomeTax(inputs);
    case 'tax_corporate':
      return evaluateCorporateTax(inputs);
    case 'tax_tariff':
      return evaluateTariff(inputs);
    case 'subsidy_consumer':
      return evaluateConsumerSubsidy(inputs);
    case 'subsidy_producer':
      return evaluateProducerSubsidy(inputs);
    case 'price_ceiling':
      return evaluatePriceCeiling(inputs);
    case 'price_floor':
      return evaluatePriceFloor(inputs);
    case 'price_minimum_wage':
      return evaluateMinimumWage(inputs);
    case 'trade_export_subsidy':
      return evaluateExportSubsidy(inputs);
    case 'trade_export_restriction':
      return evaluateExportRestriction(inputs);
    default:
      return evaluateIndirectTax(inputs);
  }
}

// ============= Generate Macro Numbers (deterministic based on impacts) =============

export function generateDeterministicOutputs(impacts: PolicyImpactResult, inputs: GlobalInputs): {
  gdpChange: number;
  employmentChange: number;
  inflationChange: number;
  revenueChange: number;
  welfareChange: number;
} {
  // Count positive and negative impacts from macro section
  let gdpScore = 0;
  let employmentScore = 0;
  let inflationScore = 0;
  let revenueScore = 0;
  let welfareScore = 0;

  const scoreMap: Record<string, number> = {
    'strong_positive': 2,
    'positive': 1,
    'neutral': 0,
    'negative': -1,
    'strong_negative': -2,
  };

  // Score based on macro impacts
  impacts.macro.items.forEach(item => {
    const effect = item.effect.toLowerCase();
    const score = scoreMap[item.level];
    
    if (effect.includes('gdp')) gdpScore += score;
    if (effect.includes('employment') || effect.includes('hiring')) employmentScore += score;
    if (effect.includes('inflation')) inflationScore -= score; // Higher inflation is negative
    if (effect.includes('revenue')) revenueScore += score;
  });

  // Score welfare from consumer impacts
  impacts.consumer.items.forEach(item => {
    const score = scoreMap[item.level];
    welfareScore += score * 0.5;
  });

  // Add worker impact to employment
  impacts.worker.items.forEach(item => {
    const effect = item.effect.toLowerCase();
    const score = scoreMap[item.level];
    if (effect.includes('employment') || effect.includes('hiring') || effect.includes('job')) {
      employmentScore += score;
    }
  });

  // Convert scores to percentage changes (deterministic formula)
  const rateMultiplier = Math.min(inputs.policyRate / 100, 1);
  
  return {
    gdpChange: Math.round(gdpScore * rateMultiplier * 1.5 * 100) / 100,
    employmentChange: Math.round(employmentScore * rateMultiplier * 0.8 * 100) / 100,
    inflationChange: Math.round(inflationScore * rateMultiplier * 0.5 * 100) / 100,
    revenueChange: Math.round(revenueScore * rateMultiplier * 3 * 100) / 100,
    welfareChange: Math.round(welfareScore * rateMultiplier * 2 * 100) / 100,
  };
}
