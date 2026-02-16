"""Ground truth calculations using PolicyEngine-US."""

import pandas as pd
from policyengine_us import Simulation

from policybench.config import PROGRAMS, TAX_YEAR
from policybench.scenarios import Scenario


def calculate_single(
    scenario: Scenario,
    variable: str,
    year: int = TAX_YEAR,
) -> float:
    """Calculate a single variable for a scenario using PE-US."""
    household = scenario.to_pe_household()
    sim = Simulation(situation=household)
    result = sim.calculate(variable, year)
    # Most variables return arrays; take first element or sum as appropriate
    value = float(result.sum())
    return value


def calculate_ground_truth(
    scenarios: list[Scenario],
    programs: list[str] | None = None,
    year: int = TAX_YEAR,
) -> pd.DataFrame:
    """Calculate ground truth for all scenarios × programs.

    Returns a DataFrame with columns: scenario_id, variable, value
    """
    if programs is None:
        programs = PROGRAMS

    rows = []
    for scenario in scenarios:
        sim = Simulation(situation=scenario.to_pe_household())
        for variable in programs:
            value = float(sim.calculate(variable, year).sum())
            rows.append(
                {
                    "scenario_id": scenario.id,
                    "variable": variable,
                    "value": value,
                }
            )

    return pd.DataFrame(rows)
