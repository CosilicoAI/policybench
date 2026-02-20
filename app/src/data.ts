// Mock data matching the expected CSV format from PolicyBench runs.
// Will be replaced with real data once the benchmark finishes.

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

// Realistic mock aggregate stats per model
export const MODEL_STATS: ModelStats[] = [
  {
    model: "gpt-5.2",
    mae_no_tools: 3_842,
    mae_with_tools: 0,
    pct_within_10_no_tools: 68.3,
    pct_within_10_with_tools: 100,
  },
  {
    model: "claude-sonnet",
    mae_no_tools: 4_217,
    mae_with_tools: 0,
    pct_within_10_no_tools: 63.9,
    pct_within_10_with_tools: 100,
  },
  {
    model: "claude-opus",
    mae_no_tools: 3_156,
    mae_with_tools: 0,
    pct_within_10_no_tools: 72.1,
    pct_within_10_with_tools: 100,
  },
];

// Per-program breakdown for each model
export const PROGRAM_STATS: ProgramStats[] = [
  // gpt-5.2
  { program: "income_tax", model: "gpt-5.2", mae_no_tools: 2_340, mae_with_tools: 0, pct_within_10_no_tools: 74.2, pct_within_10_with_tools: 100 },
  { program: "eitc", model: "gpt-5.2", mae_no_tools: 1_890, mae_with_tools: 0, pct_within_10_no_tools: 71.0, pct_within_10_with_tools: 100 },
  { program: "ctc", model: "gpt-5.2", mae_no_tools: 1_450, mae_with_tools: 0, pct_within_10_no_tools: 78.5, pct_within_10_with_tools: 100 },
  { program: "snap", model: "gpt-5.2", mae_no_tools: 4_820, mae_with_tools: 0, pct_within_10_no_tools: 42.3, pct_within_10_with_tools: 100 },
  { program: "ssi", model: "gpt-5.2", mae_no_tools: 5_670, mae_with_tools: 0, pct_within_10_no_tools: 38.1, pct_within_10_with_tools: 100 },
  { program: "free_school_meals", model: "gpt-5.2", mae_no_tools: 0.35, mae_with_tools: 0, pct_within_10_no_tools: 65.0, pct_within_10_with_tools: 100 },
  { program: "is_medicaid_eligible", model: "gpt-5.2", mae_no_tools: 0.28, mae_with_tools: 0, pct_within_10_no_tools: 72.0, pct_within_10_with_tools: 100 },
  { program: "household_state_income_tax", model: "gpt-5.2", mae_no_tools: 1_980, mae_with_tools: 0, pct_within_10_no_tools: 68.4, pct_within_10_with_tools: 100 },
  { program: "household_net_income", model: "gpt-5.2", mae_no_tools: 5_120, mae_with_tools: 0, pct_within_10_no_tools: 71.2, pct_within_10_with_tools: 100 },
  { program: "household_benefits", model: "gpt-5.2", mae_no_tools: 4_560, mae_with_tools: 0, pct_within_10_no_tools: 48.9, pct_within_10_with_tools: 100 },
  { program: "household_market_income", model: "gpt-5.2", mae_no_tools: 890, mae_with_tools: 0, pct_within_10_no_tools: 92.1, pct_within_10_with_tools: 100 },
  { program: "marginal_tax_rate", model: "gpt-5.2", mae_no_tools: 8.4, mae_with_tools: 0, pct_within_10_no_tools: 61.5, pct_within_10_with_tools: 100 },
  { program: "income_tax_before_refundable_credits", model: "gpt-5.2", mae_no_tools: 2_780, mae_with_tools: 0, pct_within_10_no_tools: 70.3, pct_within_10_with_tools: 100 },
  { program: "income_tax_refundable_credits", model: "gpt-5.2", mae_no_tools: 1_620, mae_with_tools: 0, pct_within_10_no_tools: 73.8, pct_within_10_with_tools: 100 },

  // claude-sonnet
  { program: "income_tax", model: "claude-sonnet", mae_no_tools: 2_780, mae_with_tools: 0, pct_within_10_no_tools: 70.1, pct_within_10_with_tools: 100 },
  { program: "eitc", model: "claude-sonnet", mae_no_tools: 2_150, mae_with_tools: 0, pct_within_10_no_tools: 66.8, pct_within_10_with_tools: 100 },
  { program: "ctc", model: "claude-sonnet", mae_no_tools: 1_680, mae_with_tools: 0, pct_within_10_no_tools: 74.2, pct_within_10_with_tools: 100 },
  { program: "snap", model: "claude-sonnet", mae_no_tools: 5_340, mae_with_tools: 0, pct_within_10_no_tools: 38.7, pct_within_10_with_tools: 100 },
  { program: "ssi", model: "claude-sonnet", mae_no_tools: 6_210, mae_with_tools: 0, pct_within_10_no_tools: 34.5, pct_within_10_with_tools: 100 },
  { program: "free_school_meals", model: "claude-sonnet", mae_no_tools: 0.38, mae_with_tools: 0, pct_within_10_no_tools: 62.0, pct_within_10_with_tools: 100 },
  { program: "is_medicaid_eligible", model: "claude-sonnet", mae_no_tools: 0.31, mae_with_tools: 0, pct_within_10_no_tools: 69.0, pct_within_10_with_tools: 100 },
  { program: "household_state_income_tax", model: "claude-sonnet", mae_no_tools: 2_340, mae_with_tools: 0, pct_within_10_no_tools: 63.2, pct_within_10_with_tools: 100 },
  { program: "household_net_income", model: "claude-sonnet", mae_no_tools: 5_890, mae_with_tools: 0, pct_within_10_no_tools: 66.8, pct_within_10_with_tools: 100 },
  { program: "household_benefits", model: "claude-sonnet", mae_no_tools: 5_120, mae_with_tools: 0, pct_within_10_no_tools: 44.3, pct_within_10_with_tools: 100 },
  { program: "household_market_income", model: "claude-sonnet", mae_no_tools: 1_050, mae_with_tools: 0, pct_within_10_no_tools: 89.4, pct_within_10_with_tools: 100 },
  { program: "marginal_tax_rate", model: "claude-sonnet", mae_no_tools: 9.7, mae_with_tools: 0, pct_within_10_no_tools: 57.3, pct_within_10_with_tools: 100 },
  { program: "income_tax_before_refundable_credits", model: "claude-sonnet", mae_no_tools: 3_210, mae_with_tools: 0, pct_within_10_no_tools: 65.8, pct_within_10_with_tools: 100 },
  { program: "income_tax_refundable_credits", model: "claude-sonnet", mae_no_tools: 1_890, mae_with_tools: 0, pct_within_10_no_tools: 69.2, pct_within_10_with_tools: 100 },

  // claude-opus
  { program: "income_tax", model: "claude-opus", mae_no_tools: 1_980, mae_with_tools: 0, pct_within_10_no_tools: 78.5, pct_within_10_with_tools: 100 },
  { program: "eitc", model: "claude-opus", mae_no_tools: 1_540, mae_with_tools: 0, pct_within_10_no_tools: 75.3, pct_within_10_with_tools: 100 },
  { program: "ctc", model: "claude-opus", mae_no_tools: 1_120, mae_with_tools: 0, pct_within_10_no_tools: 82.1, pct_within_10_with_tools: 100 },
  { program: "snap", model: "claude-opus", mae_no_tools: 3_980, mae_with_tools: 0, pct_within_10_no_tools: 48.6, pct_within_10_with_tools: 100 },
  { program: "ssi", model: "claude-opus", mae_no_tools: 4_890, mae_with_tools: 0, pct_within_10_no_tools: 42.3, pct_within_10_with_tools: 100 },
  { program: "free_school_meals", model: "claude-opus", mae_no_tools: 0.29, mae_with_tools: 0, pct_within_10_no_tools: 71.0, pct_within_10_with_tools: 100 },
  { program: "is_medicaid_eligible", model: "claude-opus", mae_no_tools: 0.22, mae_with_tools: 0, pct_within_10_no_tools: 78.0, pct_within_10_with_tools: 100 },
  { program: "household_state_income_tax", model: "claude-opus", mae_no_tools: 1_650, mae_with_tools: 0, pct_within_10_no_tools: 73.8, pct_within_10_with_tools: 100 },
  { program: "household_net_income", model: "claude-opus", mae_no_tools: 4_210, mae_with_tools: 0, pct_within_10_no_tools: 75.4, pct_within_10_with_tools: 100 },
  { program: "household_benefits", model: "claude-opus", mae_no_tools: 3_780, mae_with_tools: 0, pct_within_10_no_tools: 53.2, pct_within_10_with_tools: 100 },
  { program: "household_market_income", model: "claude-opus", mae_no_tools: 720, mae_with_tools: 0, pct_within_10_no_tools: 94.6, pct_within_10_with_tools: 100 },
  { program: "marginal_tax_rate", model: "claude-opus", mae_no_tools: 6.8, mae_with_tools: 0, pct_within_10_no_tools: 67.2, pct_within_10_with_tools: 100 },
  { program: "income_tax_before_refundable_credits", model: "claude-opus", mae_no_tools: 2_310, mae_with_tools: 0, pct_within_10_no_tools: 74.6, pct_within_10_with_tools: 100 },
  { program: "income_tax_refundable_credits", model: "claude-opus", mae_no_tools: 1_280, mae_with_tools: 0, pct_within_10_no_tools: 78.1, pct_within_10_with_tools: 100 },
];

// Example scenarios showing dramatic failures without tools
export const EXAMPLE_SCENARIOS: ExampleScenario[] = [
  {
    scenario_id: "scenario_042",
    description: "Single mother, 2 children (ages 4 and 7), earning $18,500/year as a home health aide in Texas. Receives SNAP and is Medicaid eligible.",
    variable: "snap",
    variable_label: "SNAP benefits",
    ground_truth: 7_428,
    no_tools_prediction: 2_100,
    with_tools_prediction: 7_428,
    model: "claude-opus",
  },
  {
    scenario_id: "scenario_017",
    description: "Married couple filing jointly, 3 children (ages 2, 5, 11), combined income $52,000 in California. Husband works full-time, wife part-time.",
    variable: "eitc",
    variable_label: "Earned Income Tax Credit",
    ground_truth: 5_548,
    no_tools_prediction: 3_200,
    with_tools_prediction: 5_548,
    model: "gpt-5.2",
  },
  {
    scenario_id: "scenario_089",
    description: "65-year-old disabled individual, no earned income, $943/month Social Security in New York. Lives alone, pays $1,200/month rent.",
    variable: "ssi",
    variable_label: "SSI benefits",
    ground_truth: 3_468,
    no_tools_prediction: 9_804,
    with_tools_prediction: 3_468,
    model: "claude-sonnet",
  },
  {
    scenario_id: "scenario_063",
    description: "Single filer, software engineer earning $145,000 in Massachusetts. No children, standard deduction, 401(k) contribution of $22,500.",
    variable: "household_net_income",
    variable_label: "Household net income",
    ground_truth: 102_847,
    no_tools_prediction: 112_350,
    with_tools_prediction: 102_847,
    model: "claude-opus",
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
