"""AI-alone evaluation using LiteLLM (no tools provided)."""

import re
import time

import pandas as pd
from litellm import completion

from policybench.config import MODELS, PROGRAMS
from policybench.prompts import make_no_tools_prompt
from policybench.scenarios import Scenario

MAX_RETRIES = 5
RETRY_BASE_DELAY = 2


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

    for attempt in range(MAX_RETRIES):
        try:
            response = completion(model=model_id, messages=messages, caching=True)
            content = response.choices[0].message.content
            return {
                "prediction": extract_number(content),
                "raw_response": content,
            }
        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                raise
            delay = RETRY_BASE_DELAY * (2**attempt)
            print(f"  Retry {attempt + 1}: {e!r:.60s}... {delay}s")
            time.sleep(delay)
    return {"prediction": None, "raw_response": None}  # unreachable


def run_no_tools_eval(
    scenarios: list[Scenario],
    models: dict[str, str] | None = None,
    programs: list[str] | None = None,
    output_path: str | None = None,
) -> pd.DataFrame:
    """Run the AI-alone evaluation across all models.

    If output_path is provided, saves incrementally every 100 rows.

    Returns DataFrame with columns:
        model, scenario_id, variable, prediction, raw_response
    """
    if models is None:
        models = MODELS
    if programs is None:
        programs = PROGRAMS

    all_rows = []
    total = len(models) * len(scenarios) * len(programs)
    done = 0

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
                done += 1
                if done % 100 == 0:
                    print(f"  Progress: {done}/{total} ({done * 100 // total}%)")
                    if output_path:
                        pd.DataFrame(all_rows).to_csv(output_path, index=False)

    df = pd.DataFrame(all_rows)
    if output_path:
        df.to_csv(output_path, index=False)
    return df
