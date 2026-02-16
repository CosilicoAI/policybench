"""Tests for AI-with-tools evaluation (mocked LiteLLM calls)."""

import json
from unittest.mock import MagicMock, patch

import pytest

from policybench.config import PE_TOOL_DEFINITION
from policybench.prompts import make_with_tools_prompt
from policybench.scenarios import Person, Scenario


@pytest.fixture
def mini_scenario():
    return Scenario(
        id="mini",
        state="CA",
        filing_status="single",
        adults=[Person(name="adult1", age=35, employment_income=50_000.0)],
        year=2025,
    )


def test_tool_definition_structure():
    """PE tool definition has required OpenAI format."""
    assert PE_TOOL_DEFINITION["type"] == "function"
    func = PE_TOOL_DEFINITION["function"]
    assert "name" in func
    assert "description" in func
    assert "parameters" in func
    assert func["name"] == "calculate_policy"

    params = func["parameters"]
    assert "household" in params["properties"]
    assert "variable" in params["properties"]
    assert "year" in params["properties"]
    assert "required" in params


def test_with_tools_prompt_mentions_tool(mini_scenario):
    """Prompt should instruct the model to use the tool."""
    prompt = make_with_tools_prompt(mini_scenario, "income_tax")
    assert "calculate_policy" in prompt
    assert "income_tax" in prompt


def test_with_tools_prompt_includes_household_info(mini_scenario):
    """Tool prompt should still describe the household."""
    prompt = make_with_tools_prompt(mini_scenario, "income_tax")
    assert "CA" in prompt
    assert "50,000" in prompt
    assert "single filer" in prompt


@patch("policybench.eval_with_tools.completion")
def test_run_single_with_tools_uses_tool(mock_completion, mini_scenario):
    """When model makes a tool call, we should process it."""
    from policybench.eval_with_tools import run_single_with_tools

    # First response: model makes a tool call
    tool_call = MagicMock()
    tool_call.id = "call_123"
    tool_call.function.name = "calculate_policy"
    tool_call.function.arguments = json.dumps(
        {
            "household": mini_scenario.to_pe_household(),
            "variable": "income_tax",
            "year": 2025,
        }
    )

    first_message = MagicMock()
    first_message.tool_calls = [tool_call]
    first_message.content = None
    first_message.model_dump.return_value = {
        "role": "assistant",
        "content": None,
        "tool_calls": [
            {
                "id": "call_123",
                "type": "function",
                "function": {
                    "name": "calculate_policy",
                    "arguments": tool_call.function.arguments,
                },
            }
        ],
    }

    first_response = MagicMock()
    first_response.choices = [MagicMock(message=first_message)]

    # Second response: model returns the result
    second_message = MagicMock()
    second_message.tool_calls = None
    second_message.content = "3500.50"

    second_response = MagicMock()
    second_response.choices = [MagicMock(message=second_message)]

    mock_completion.side_effect = [first_response, second_response]

    with patch("policybench.eval_with_tools.Simulation") as mock_sim:
        mock_calc = MagicMock()
        mock_calc.sum.return_value = 3500.50
        mock_sim.return_value.calculate.return_value = mock_calc

        result = run_single_with_tools(mini_scenario, "income_tax", "gpt-4o")

    assert result["used_tool"] is True
    assert result["prediction"] == 3500.50
    assert result["tool_calls"] == 1


@patch("policybench.eval_with_tools.completion")
def test_run_single_no_tool_call(mock_completion, mini_scenario):
    """When model doesn't use tools, we still get a prediction."""
    from policybench.eval_with_tools import run_single_with_tools

    message = MagicMock()
    message.tool_calls = None
    message.content = "5000"

    response = MagicMock()
    response.choices = [MagicMock(message=message)]

    mock_completion.return_value = response

    result = run_single_with_tools(mini_scenario, "income_tax", "gpt-4o")

    assert result["used_tool"] is False
    assert result["prediction"] == 5000.0
    assert result["tool_calls"] == 0
