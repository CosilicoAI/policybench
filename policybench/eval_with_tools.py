"""AI-with-tools evaluation using LiteLLM."""

import json

import pandas as pd
from litellm import completion
from policyengine_us import Simulation

from policybench.config import MODELS, PE_TOOL_DEFINITION, PROGRAMS, TAX_YEAR
from policybench.prompts import make_with_tools_prompt
from policybench.scenarios import Scenario


def handle_tool_call(tool_call, scenarios_by_id: dict[str, Scenario]) -> str:
    """Execute a PolicyEngine tool call and return the result."""
    args = json.loads(tool_call.function.arguments)
    household_json = args["household"]
    variable = args["variable"]
    year = args.get("year", TAX_YEAR)

    # Create a temporary scenario from the tool call's household
    sim = Simulation(situation=household_json)
    result = float(sim.calculate(variable, year).sum())
    return json.dumps({"result": result})


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
    response = completion(
        model=model_id,
        messages=messages,
        tools=[PE_TOOL_DEFINITION],
        tool_choice="auto",
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
        for tc in message.tool_calls:
            result = handle_tool_call(tc, {})
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": result,
                }
            )

        # Get next response
        response = completion(
            model=model_id,
            messages=messages,
            tools=[PE_TOOL_DEFINITION],
            tool_choice="auto",
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
) -> pd.DataFrame:
    """Run the AI-with-tools evaluation across all models.

    Returns DataFrame with columns:
        model, scenario_id, variable, prediction, used_tool, tool_calls
    """
    if models is None:
        models = MODELS
    if programs is None:
        programs = PROGRAMS

    all_rows = []

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

    return pd.DataFrame(all_rows)
