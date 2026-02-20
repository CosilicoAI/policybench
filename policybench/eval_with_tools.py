"""AI-with-tools evaluation using LiteLLM."""

import json
import time

import pandas as pd
from litellm import completion
from policyengine_us import Simulation

from policybench.config import MODELS, PE_TOOL_DEFINITION, PROGRAMS, TAX_YEAR
from policybench.prompts import make_with_tools_prompt
from policybench.scenarios import Scenario

MAX_RETRIES = 5
RETRY_BASE_DELAY = 2


def handle_tool_call(tool_call, fallback_household: dict | None = None) -> str:
    """Execute a PolicyEngine tool call and return the result.

    If the model omits the household arg, uses fallback_household.
    """
    args = json.loads(tool_call.function.arguments)
    household_json = args.get("household", fallback_household)
    variable = args["variable"]
    year = args.get("year", TAX_YEAR)

    if household_json is None:
        return json.dumps({"error": "No household provided"})

    sim = Simulation(situation=household_json)
    result = float(sim.calculate(variable, year).sum())
    return json.dumps({"result": result})


def _completion_with_retry(**kwargs):
    """Call litellm.completion with exponential backoff retry."""
    for attempt in range(MAX_RETRIES):
        try:
            return completion(**kwargs)
        except Exception as e:
            if attempt == MAX_RETRIES - 1:
                raise
            delay = RETRY_BASE_DELAY * (2**attempt)
            print(f"  Retry {attempt + 1}/{MAX_RETRIES} after error: {e!r:.80s}... waiting {delay}s")
            time.sleep(delay)


def run_single_with_tools(
    scenario: Scenario,
    variable: str,
    model_id: str,
) -> dict:
    """Run a single scenario/variable with tool access.

    Returns dict with: prediction, used_tool, tool_calls, raw_response
    """
    prompt = make_with_tools_prompt(scenario, variable)

    messages = [{"role": "user", "content": prompt}]
    response = _completion_with_retry(
        model=model_id,
        messages=messages,
        tools=[PE_TOOL_DEFINITION],
        tool_choice="auto",
        caching=True,
    )

    message = response.choices[0].message
    used_tool = False
    prediction = None
    tool_call_count = 0

    # Handle tool calls (may need multiple rounds)
    max_rounds = 3
    for _ in range(max_rounds):
        if not message.tool_calls:
            break

        used_tool = True
        tool_call_count += len(message.tool_calls)

        # Add assistant message with tool calls
        messages.append(message.model_dump())

        # Process each tool call
        fallback_hh = scenario.to_pe_household()
        for tc in message.tool_calls:
            result = handle_tool_call(tc, fallback_household=fallback_hh)
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                }
            )

        # Get next response
        response = _completion_with_retry(
            model=model_id,
            messages=messages,
            tools=[PE_TOOL_DEFINITION],
            tool_choice="auto",
            caching=True,
        )
        message = response.choices[0].message

    # Extract numeric prediction from final response
    if message.content:
        try:
            prediction = float(
                message.content.strip().replace(",", "").replace("$", "")
            )
        except (ValueError, AttributeError):
            prediction = None

    return {
        "prediction": prediction,
        "used_tool": used_tool,
        "tool_calls": tool_call_count,
    }


def run_with_tools_eval(
    scenarios: list[Scenario],
    models: dict[str, str] | None = None,
    programs: list[str] | None = None,
    output_path: str | None = None,
) -> pd.DataFrame:
    """Run the AI-with-tools evaluation across all models.

    If output_path is provided, saves incrementally every 100 rows.

    Returns DataFrame with columns:
        model, scenario_id, variable, prediction, used_tool, tool_calls
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
                result = run_single_with_tools(scenario, variable, model_id)
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
                    print(f"  Progress: {done}/{total} ({done*100//total}%)")
                    if output_path:
                        pd.DataFrame(all_rows).to_csv(output_path, index=False)

    df = pd.DataFrame(all_rows)
    if output_path:
        df.to_csv(output_path, index=False)
    return df
