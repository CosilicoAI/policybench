"""Configuration constants for PolicyBench."""

# Tax year for all evaluations
TAX_YEAR = 2025

# Random seed for reproducible scenario generation
SEED = 42

# Models to benchmark
MODELS = {
    "claude-opus": "claude-opus-4-6",
    "claude-sonnet": "claude-sonnet-4-5-20250929",
    "gpt-4o": "gpt-4o",
    "gpt-o3": "o3",
    "gemini-pro": "gemini-2.5-pro",
}

# PolicyEngine-US variables to evaluate
PROGRAMS = [
    # Federal tax
    "income_tax",
    "income_tax_before_refundable_credits",
    # Credits
    "eitc",
    "ctc",
    "income_tax_refundable_credits",
    # Benefits
    "snap",
    "ssi",
    "free_school_meals",
    "is_medicaid_eligible",
    # State tax
    "household_state_income_tax",
    # Aggregates
    "household_net_income",
    "household_benefits",
    "household_market_income",
    # Rates
    "marginal_tax_rate",
]

# Binary (eligibility) variables — evaluated with accuracy, not MAE
BINARY_PROGRAMS = ["is_medicaid_eligible", "free_school_meals"]

# Rate variables — evaluated with absolute error, not percentage
RATE_PROGRAMS = ["marginal_tax_rate"]

# States to include in scenarios
STATES = [
    "CA",
    "TX",
    "NY",
    "FL",
    "IL",
    "PA",
    "OH",
    "GA",
    "NC",
    "WA",
    "MA",
    "CO",
]

# Filing statuses
FILING_STATUSES = ["single", "joint", "head_of_household"]

# Income levels to sample from (annual employment income)
INCOME_LEVELS = [
    0,
    5_000,
    10_000,
    15_000,
    20_000,
    25_000,
    30_000,
    40_000,
    50_000,
    60_000,
    75_000,
    100_000,
    125_000,
    150_000,
    200_000,
    250_000,
    300_000,
    400_000,
    500_000,
]

# Number of children options
NUM_CHILDREN_OPTIONS = [0, 1, 2, 3, 4]

# Number of scenarios to generate
NUM_SCENARIOS = 100

# PolicyEngine tool definition for LiteLLM tool-calling
PE_TOOL_DEFINITION = {
    "type": "function",
    "function": {
        "name": "calculate_policy",
        "description": (
            "Calculate a US tax or benefit variable for a specific household "
            "using PolicyEngine-US microsimulation. Returns the exact computed "
            "value for the given household and variable."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "household": {
                    "type": "object",
                    "description": (
                        "Household definition with 'people', 'tax_units', "
                        "'spm_units', 'families', 'households' keys. "
                        "Each person needs age, employment_income. "
                        "Household needs state_code."
                    ),
                },
                "variable": {
                    "type": "string",
                    "description": (
                        "The PolicyEngine-US variable to calculate, e.g. "
                        "'income_tax', 'snap', 'eitc'."
                    ),
                },
                "year": {
                    "type": "integer",
                    "description": "Tax year for the calculation.",
                },
            },
            "required": ["household", "variable", "year"],
        },
    },
}
