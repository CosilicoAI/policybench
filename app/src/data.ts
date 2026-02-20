// Real benchmark results from PolicyBench v2.
// 3 models × 100 scenarios × 14 programs = 4,200 observations per condition.

export interface GroundTruth {
  scenario_id: string;
  variable: string;
  value: number;
}

export interface Prediction {
  model: string;
  scenario_id: string;
  variable: string;
  prediction: number;
  raw_response?: string;
  used_tool?: boolean;
  tool_calls?: number;
}

export interface ModelStats {
  model: string;
  mae_no_tools: number;
  mae_with_tools: number;
  pct_within_10_no_tools: number;
  pct_within_10_with_tools: number;
}

export interface ProgramStats {
  program: string;
  model: string;
  mae_no_tools: number;
  mae_with_tools: number;
  pct_within_10_no_tools: number;
  pct_within_10_with_tools: number;
}

export interface ExampleScenario {
  scenario_id: string;
  description: string;
  variable: string;
  variable_label: string;
  ground_truth: number;
  no_tools_prediction: number;
  with_tools_prediction: number;
  model: string;
}

export const MODELS = ["gpt-5.2", "claude-sonnet", "claude-opus"] as const;

export const PROGRAMS = [
  "income_tax",
  "eitc",
  "ctc",
  "snap",
  "ssi",
  "free_school_meals",
  "is_medicaid_eligible",
  "household_state_income_tax",
  "household_net_income",
  "household_benefits",
  "household_market_income",
  "marginal_tax_rate",
  "income_tax_before_refundable_credits",
  "income_tax_refundable_credits",
] as const;

export const PROGRAM_LABELS: Record<string, string> = {
  income_tax: "Federal income tax",
  eitc: "EITC",
  ctc: "Child tax credit",
  snap: "SNAP",
  ssi: "SSI",
  free_school_meals: "Free school meals",
  is_medicaid_eligible: "Medicaid eligibility",
  household_state_income_tax: "State income tax",
  household_net_income: "Net income",
  household_benefits: "Total benefits",
  household_market_income: "Market income",
  marginal_tax_rate: "Marginal tax rate",
  income_tax_before_refundable_credits: "Income tax (pre-refundable)",
  income_tax_refundable_credits: "Refundable credits",
};

// Aggregate stats per model from actual benchmark results
export const MODEL_STATS: ModelStats[] = [
  {
    model: "gpt-5.2",
    mae_no_tools: 2_578,
    mae_with_tools: 0,
    pct_within_10_no_tools: 62.1,
    pct_within_10_with_tools: 100,
  },
  {
    model: "claude-sonnet",
    mae_no_tools: 2_276,
    mae_with_tools: 0,
    pct_within_10_no_tools: 61.9,
    pct_within_10_with_tools: 100,
  },
  {
    model: "claude-opus",
    mae_no_tools: 1_257,
    mae_with_tools: 0,
    pct_within_10_no_tools: 70.8,
    pct_within_10_with_tools: 100,
  },
];

// Per-program breakdown for each model from actual benchmark results
export const PROGRAM_STATS: ProgramStats[] = [
  // gpt-5.2
  { program: "income_tax", model: "gpt-5.2", mae_no_tools: 4_868, mae_with_tools: 0, pct_within_10_no_tools: 37.0, pct_within_10_with_tools: 100 },
  { program: "eitc", model: "gpt-5.2", mae_no_tools: 791, mae_with_tools: 0, pct_within_10_no_tools: 77.0, pct_within_10_with_tools: 100 },
  { program: "ctc", model: "gpt-5.2", mae_no_tools: 999, mae_with_tools: 0, pct_within_10_no_tools: 78.0, pct_within_10_with_tools: 100 },
  { program: "snap", model: "gpt-5.2", mae_no_tools: 1_641, mae_with_tools: 0, pct_within_10_no_tools: 72.0, pct_within_10_with_tools: 100 },
  { program: "ssi", model: "gpt-5.2", mae_no_tools: 192, mae_with_tools: 0, pct_within_10_no_tools: 98.0, pct_within_10_with_tools: 100 },
  { program: "free_school_meals", model: "gpt-5.2", mae_no_tools: 558, mae_with_tools: 0, pct_within_10_no_tools: 0, pct_within_10_with_tools: 0 },
  { program: "is_medicaid_eligible", model: "gpt-5.2", mae_no_tools: 1, mae_with_tools: 0, pct_within_10_no_tools: 0, pct_within_10_with_tools: 0 },
  { program: "household_state_income_tax", model: "gpt-5.2", mae_no_tools: 1_110, mae_with_tools: 0, pct_within_10_no_tools: 59.0, pct_within_10_with_tools: 100 },
  { program: "household_net_income", model: "gpt-5.2", mae_no_tools: 14_168, mae_with_tools: 0, pct_within_10_no_tools: 56.0, pct_within_10_with_tools: 100 },
  { program: "household_benefits", model: "gpt-5.2", mae_no_tools: 6_374, mae_with_tools: 0, pct_within_10_no_tools: 52.0, pct_within_10_with_tools: 100 },
  { program: "household_market_income", model: "gpt-5.2", mae_no_tools: 0, mae_with_tools: 0, pct_within_10_no_tools: 100.0, pct_within_10_with_tools: 100 },
  { program: "marginal_tax_rate", model: "gpt-5.2", mae_no_tools: 3, mae_with_tools: 0, pct_within_10_no_tools: 11.0, pct_within_10_with_tools: 100 },
  { program: "income_tax_before_refundable_credits", model: "gpt-5.2", mae_no_tools: 3_962, mae_with_tools: 0, pct_within_10_no_tools: 53.0, pct_within_10_with_tools: 100 },
  { program: "income_tax_refundable_credits", model: "gpt-5.2", mae_no_tools: 1_433, mae_with_tools: 0, pct_within_10_no_tools: 52.0, pct_within_10_with_tools: 100 },

  // claude-sonnet
  { program: "income_tax", model: "claude-sonnet", mae_no_tools: 5_546, mae_with_tools: 0, pct_within_10_no_tools: 34.0, pct_within_10_with_tools: 100 },
  { program: "eitc", model: "claude-sonnet", mae_no_tools: 881, mae_with_tools: 0, pct_within_10_no_tools: 73.0, pct_within_10_with_tools: 100 },
  { program: "ctc", model: "claude-sonnet", mae_no_tools: 1_042, mae_with_tools: 0, pct_within_10_no_tools: 75.0, pct_within_10_with_tools: 100 },
  { program: "snap", model: "claude-sonnet", mae_no_tools: 518, mae_with_tools: 0, pct_within_10_no_tools: 81.0, pct_within_10_with_tools: 100 },
  { program: "ssi", model: "claude-sonnet", mae_no_tools: 628, mae_with_tools: 0, pct_within_10_no_tools: 94.0, pct_within_10_with_tools: 100 },
  { program: "free_school_meals", model: "claude-sonnet", mae_no_tools: 558, mae_with_tools: 0, pct_within_10_no_tools: 0, pct_within_10_with_tools: 0 },
  { program: "is_medicaid_eligible", model: "claude-sonnet", mae_no_tools: 1, mae_with_tools: 0, pct_within_10_no_tools: 0, pct_within_10_with_tools: 0 },
  { program: "household_state_income_tax", model: "claude-sonnet", mae_no_tools: 940, mae_with_tools: 0, pct_within_10_no_tools: 57.0, pct_within_10_with_tools: 100 },
  { program: "household_net_income", model: "claude-sonnet", mae_no_tools: 11_349, mae_with_tools: 0, pct_within_10_no_tools: 64.0, pct_within_10_with_tools: 100 },
  { program: "household_benefits", model: "claude-sonnet", mae_no_tools: 5_123, mae_with_tools: 0, pct_within_10_no_tools: 30.0, pct_within_10_with_tools: 100 },
  { program: "household_market_income", model: "claude-sonnet", mae_no_tools: 0, mae_with_tools: 0, pct_within_10_no_tools: 100.0, pct_within_10_with_tools: 100 },
  { program: "marginal_tax_rate", model: "claude-sonnet", mae_no_tools: 1_037, mae_with_tools: 0, pct_within_10_no_tools: 16.0, pct_within_10_with_tools: 100 },
  { program: "income_tax_before_refundable_credits", model: "claude-sonnet", mae_no_tools: 3_160, mae_with_tools: 0, pct_within_10_no_tools: 59.0, pct_within_10_with_tools: 100 },
  { program: "income_tax_refundable_credits", model: "claude-sonnet", mae_no_tools: 1_079, mae_with_tools: 0, pct_within_10_no_tools: 60.0, pct_within_10_with_tools: 100 },

  // claude-opus
  { program: "income_tax", model: "claude-opus", mae_no_tools: 2_289, mae_with_tools: 0, pct_within_10_no_tools: 52.0, pct_within_10_with_tools: 100 },
  { program: "eitc", model: "claude-opus", mae_no_tools: 508, mae_with_tools: 0, pct_within_10_no_tools: 76.0, pct_within_10_with_tools: 100 },
  { program: "ctc", model: "claude-opus", mae_no_tools: 1_044, mae_with_tools: 0, pct_within_10_no_tools: 70.0, pct_within_10_with_tools: 100 },
  { program: "snap", model: "claude-opus", mae_no_tools: 148, mae_with_tools: 0, pct_within_10_no_tools: 89.0, pct_within_10_with_tools: 100 },
  { program: "ssi", model: "claude-opus", mae_no_tools: 490, mae_with_tools: 0, pct_within_10_no_tools: 95.0, pct_within_10_with_tools: 100 },
  { program: "free_school_meals", model: "claude-opus", mae_no_tools: 558, mae_with_tools: 0, pct_within_10_no_tools: 0, pct_within_10_with_tools: 0 },
  { program: "is_medicaid_eligible", model: "claude-opus", mae_no_tools: 1, mae_with_tools: 0, pct_within_10_no_tools: 0, pct_within_10_with_tools: 0 },
  { program: "household_state_income_tax", model: "claude-opus", mae_no_tools: 766, mae_with_tools: 0, pct_within_10_no_tools: 63.0, pct_within_10_with_tools: 100 },
  { program: "household_net_income", model: "claude-opus", mae_no_tools: 6_242, mae_with_tools: 0, pct_within_10_no_tools: 78.0, pct_within_10_with_tools: 100 },
  { program: "household_benefits", model: "claude-opus", mae_no_tools: 4_187, mae_with_tools: 0, pct_within_10_no_tools: 49.0, pct_within_10_with_tools: 100 },
  { program: "household_market_income", model: "claude-opus", mae_no_tools: 0, mae_with_tools: 0, pct_within_10_no_tools: 100.0, pct_within_10_with_tools: 100 },
  { program: "marginal_tax_rate", model: "claude-opus", mae_no_tools: 3, mae_with_tools: 0, pct_within_10_no_tools: 27.0, pct_within_10_with_tools: 100 },
  { program: "income_tax_before_refundable_credits", model: "claude-opus", mae_no_tools: 929, mae_with_tools: 0, pct_within_10_no_tools: 76.0, pct_within_10_with_tools: 100 },
  { program: "income_tax_refundable_credits", model: "claude-opus", mae_no_tools: 430, mae_with_tools: 0, pct_within_10_no_tools: 75.0, pct_within_10_with_tools: 100 },
];

// Example scenarios showing dramatic AI failures without tools vs. perfect with tools
export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    scenario_id: "scenario_003",
    description: "Head of household filer in Florida, no employment income, 4 children (ages 7, 13, 14, 17). Eligible for maximum SNAP benefits.",
    variable: "snap",
    variable_label: "SNAP benefits",
    ground_truth: 13_971,
    no_tools_prediction: 0,
    with_tools_prediction: 13_971,
    model: "gpt-5.2",
  },
  {
    scenario_id: "scenario_019",
    description: "Married couple in New York, $25,000 income, 4 children (ages 0, 3, 10, 15). Large family near EITC maximum.",
    variable: "eitc",
    variable_label: "Earned Income Tax Credit",
    ground_truth: 8_046,
    no_tools_prediction: 0,
    with_tools_prediction: 8_046,
    model: "gpt-5.2",
  },
  {
    scenario_id: "scenario_025",
    description: "Head of household in Washington, $40,000 income, 4 young children (ages 0, 1, 2, 7). Complex benefit interactions.",
    variable: "household_net_income",
    variable_label: "Household net income",
    ground_truth: 128_631,
    no_tools_prediction: 51_223,
    with_tools_prediction: 128_631,
    model: "claude-opus",
  },
  {
    scenario_id: "scenario_065",
    description: "Head of household in Washington, $60,000 income, 3 children (ages 0, 9, 9). EITC phase-out range with multiple dependents.",
    variable: "eitc",
    variable_label: "Earned Income Tax Credit",
    ground_truth: 328,
    no_tools_prediction: 7_152,
    with_tools_prediction: 328,
    model: "claude-sonnet",
  },
];

// Compute the overall average accuracy without tools (across all models)
export function getOverallNoToolsAccuracy(): number {
  const total = MODEL_STATS.reduce((sum, m) => sum + m.pct_within_10_no_tools, 0);
  return Math.round((total / MODEL_STATS.length) * 10) / 10;
}

export function getOverallWithToolsAccuracy(): number {
  const total = MODEL_STATS.reduce((sum, m) => sum + m.pct_within_10_with_tools, 0);
  return Math.round((total / MODEL_STATS.length) * 10) / 10;
}

export function getOverallNoToolsMAE(): number {
  const total = MODEL_STATS.reduce((sum, m) => sum + m.mae_no_tools, 0);
  return Math.round(total / MODEL_STATS.length);
}
