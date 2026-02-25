"""Prompt templates for PolicyBench evaluations."""

from policybench.scenarios import Scenario

# Variable descriptions for natural language prompts
VARIABLE_DESCRIPTIONS = {
    "income_tax": "total federal income tax liability",
    "income_tax_before_refundable_credits": (
        "federal income tax before refundable credits"
    ),
    "eitc": "Earned Income Tax Credit amount",
    "ctc": "Child Tax Credit amount",
    "income_tax_refundable_credits": "total refundable tax credits",
    "snap": "annual SNAP (food stamps) benefit amount",
    "ssi": "annual Supplemental Security Income (SSI) amount",
    "free_school_meals": (
        "whether the household qualifies for free school meals "
        "(1 if eligible, 0 if not)"
    ),
    "is_medicaid_eligible": (
        "whether the household is eligible for Medicaid (1 if eligible, 0 if not)"
    ),
    "household_state_income_tax": "state income tax liability",
    "household_net_income": ("household net income (market income + benefits - taxes)"),
    "household_benefits": "total government benefits received",
    "household_market_income": "total market income (pre-tax, pre-transfer)",
    "marginal_tax_rate": (
        "effective marginal tax rate (as a decimal, e.g. 0.25 for 25%)"
    ),
}


def describe_household(scenario: Scenario) -> str:
    """Create a natural language description of a household."""
    parts = []

    # Filing status
    status_map = {
        "single": "a single filer",
        "joint": "a married couple filing jointly",
        "head_of_household": "a head of household filer",
    }
    parts.append(f"Consider {status_map[scenario.filing_status]}")
    parts.append(f"living in {scenario.state}")
    parts.append(f"for tax year {scenario.year}.")

    # Adults
    for adult in scenario.adults:
        parts.append(
            f"{adult.name.replace('adult', 'Adult ')} is {adult.age} years old"
            f" with ${adult.employment_income:,.0f} in annual employment income."
        )

    # Children
    if scenario.children:
        child_descs = []
        for child in scenario.children:
            child_descs.append(f"age {child.age}")
        parts.append(
            f"They have {scenario.num_children} "
            f"{'child' if scenario.num_children == 1 else 'children'} "
            f"({', '.join(child_descs)})."
        )
    else:
        parts.append("They have no children.")

    return " ".join(parts)


def make_no_tools_prompt(scenario: Scenario, variable: str) -> str:
    """Create a prompt for the AI-alone condition."""
    description = describe_household(scenario)
    var_desc = VARIABLE_DESCRIPTIONS.get(variable, variable)

    return (
        f"{description}\n\n"
        f"What is the {var_desc} for this household? "
        f"Provide ONLY a single numeric value as your answer. "
        f"Do not include dollar signs, commas, or any other text. "
        f"If the answer is a dollar amount, give the annual amount. "
        f"If the answer is a rate, give a decimal (e.g. 0.25 for 25%)."
    )


def make_with_tools_prompt(scenario: Scenario, variable: str) -> str:
    """Create a prompt for the AI-with-tools condition."""
    description = describe_household(scenario)
    var_desc = VARIABLE_DESCRIPTIONS.get(variable, variable)

    return (
        f"{description}\n\n"
        f"Calculate the {var_desc} for this household. "
        f"Use the calculate_policy tool with the appropriate household "
        f"definition, variable name '{variable}', and year {scenario.year}. "
        f"Return ONLY the numeric result from the tool."
    )
