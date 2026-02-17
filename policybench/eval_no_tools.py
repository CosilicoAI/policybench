"""AI-alone evaluation using LiteLLM (no tools provided)."""

import re

import pandas as pd
from litellm import completion

from policybench.config import MODELS, PROGRAMS
from policybench.prompts import make_no_tools_prompt
from policybench.scenarios import Scenario


def extract_number(text: str) -> float | None:
    """Extract a numeric value from model response text."""
    if not text:
        return None
    cleaned = text.strip().replace(",", "").replace("$", "")
    try:
        return float(cleaned)
    except ValueError:
        pass
    matches = re.findall(r"-?\d+\.?\d*", cleaned)
    if matches:
        return float(matches[-1])
    return None


def run_single_no_tools(
    scenario: Scenario,
    variable: str,
    model_id: str,
) -> dict:
    """Run a single scenario/variable without tools.

    Returns dict with: prediction, raw_response
    """
    prompt = make_no_tools_prompt(scenario, variable)
    messages = [{"role": "user", "content": prompt}]

    response = completion(model=model_id, messages=messages, caching=True)
    content = response.choices[0].message.content

    return {
        "prediction": extract_number(content),
        "raw_response": content,
    }


def run_no_tools_eval(
    scenarios: list[Scenario],
    models: dict[str, str] | None = None,
    programs: list[str] | None = None,
) -> pd.DataFrame:
    """Run the AI-alone evaluation across all models.

    Returns DataFrame with columns:
        model, scenario_id, variable, prediction, raw_response
    """
    if models is None:
        models = MODELS
    if programs is None:
        programs = PROGRAMS

    all_rows = []

    for model_name, model_id in models.items():
        for scenario in scenarios:
            for variable in programs:
                result = run_single_no_tools(scenario, variable, model_id)
                all_rows.append(
                    {
                        "model": model_name,
                        "scenario_id": scenario.id,
                        "variable": variable,
                        **result,
                    }
                )

    return pd.DataFrame(all_rows)
