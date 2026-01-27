import type { SimulationResult, PolicyCategory } from '@/types/simulation';

interface QuickQuestion {
  label: string;
  prompt: string;
}

// Generate contextual questions based on policy type and results
export function generateQuickQuestions(result: SimulationResult): QuickQuestion[] {
  const { impacts, outputs, policyCategory } = result;
  const policyName = impacts.policyName.toLowerCase();

  // Pool of relevant questions for different policy types
  let questionPool: QuickQuestion[] = [];

  // Tax policies
  if (policyCategory.includes('tax')) {
    questionPool = [
      { label: 'Why this outcome?', prompt: 'Why did the results change in this direction?' },
      { label: 'Consumer impact?', prompt: 'How are consumers affected by this tax policy?' },
      { label: 'Producer burden?', prompt: 'Who bears more of the tax burden - consumers or producers?' },
      { label: 'Revenue gained?', prompt: 'Is the government revenue gain worth the economic cost?' },
      { label: 'If rate doubles?', prompt: 'What would happen if we doubled the tax rate?' },
      { label: 'Elasticity effect?', prompt: 'How does elasticity affect who bears the tax burden?' },
      { label: 'Employment impact?', prompt: 'Why does employment change with this tax?' },
      { label: 'Alternative policies?', prompt: 'What alternative policies could achieve similar revenue without as much economic impact?' },
    ];
  }

  // Subsidy policies
  else if (policyCategory.includes('subsidy')) {
    questionPool = [
      { label: 'Who benefits?', prompt: 'Who benefits most from this subsidy - consumers or producers?' },
      { label: 'Cost to govt?', prompt: 'What is the government cost of providing this subsidy?' },
      { label: 'Market distortion?', prompt: 'Does this subsidy cause market distortions?' },
      { label: 'Consumer savings?', prompt: 'How much do consumers save from this subsidy?' },
      { label: 'If subsidy ends?', prompt: 'What happens to prices and quantity if the subsidy is removed?' },
      { label: 'Employment gain?', prompt: 'Why does employment increase with producer subsidies?' },
      { label: 'Efficiency loss?', prompt: 'Is there economic efficiency loss from this subsidy?' },
      { label: 'Long-term effects?', prompt: 'What are the long-term effects of subsidizing this good?' },
    ];
  }

  // Price controls
  else if (policyCategory.includes('price')) {
    questionPool = [
      { label: 'Shortage/surplus?', prompt: 'Does this price control create shortages or surpluses?' },
      { label: 'Black market?', prompt: 'Could black markets emerge from this price control?' },
      { label: 'Quality impact?', prompt: 'How does price control affect product quality?' },
      { label: 'Producer response?', prompt: 'How do producers respond to controlled prices?' },
      { label: 'Binding control?', prompt: 'Is this price control binding on the market?' },
      { label: 'Consumer welfare?', prompt: 'Does this price control improve overall consumer welfare?' },
      { label: 'If control removed?', prompt: 'What would prices and quantities be without this control?' },
      { label: 'Wage dynamics?', prompt: 'How does minimum wage affect different skill levels?' },
    ];
  }

  // Trade policies
  else if (policyCategory.includes('trade')) {
    questionPool = [
      { label: 'Trade effect?', prompt: 'How does this policy affect international trade?' },
      { label: 'Domestic impact?', prompt: 'How are domestic producers and consumers affected differently?' },
      { label: 'Retaliation risk?', prompt: 'Could other countries retaliate against this trade policy?' },
      { label: 'Price impact?', prompt: 'Why do import/export prices change with this policy?' },
      { label: 'Consumer choice?', prompt: 'How does this affect consumer choice of goods?' },
      { label: 'Export market?', prompt: 'Does this policy help domestic exporters?' },
      { label: 'GDP effect?', prompt: 'Why does this trade policy affect overall GDP?' },
      { label: 'Comparative advantage?', prompt: 'Does this policy distort comparative advantage?' },
    ];
  }

  // Generic fallback
  if (questionPool.length === 0) {
    questionPool = [
      { label: 'Why this outcome?', prompt: 'Why did the results change in this direction?' },
      { label: 'Key insights?', prompt: 'What are the key economic insights from this simulation?' },
      { label: 'Policy trade-offs?', prompt: 'What are the main trade-offs of this policy?' },
      { label: 'Affected groups?', prompt: 'Which groups are most affected by this policy?' },
      { label: 'Better alternatives?', prompt: 'Are there better alternative policies?' },
      { label: 'Long-term effects?', prompt: 'What are the long-term effects of this policy?' },
    ];
  }

  // Shuffle and return top 4
  return shuffleArray(questionPool).slice(0, 4);
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
