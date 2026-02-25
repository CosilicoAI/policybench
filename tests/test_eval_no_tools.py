"""Tests for AI-alone evaluation (mocked LiteLLM calls)."""

from unittest.mock import MagicMock, patch

import pytest

from policybench.eval_no_tools import extract_number, run_single_no_tools
from policybench.prompts import make_no_tools_prompt
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


class TestExtractNumber:
    def test_plain_number(self):
        assert extract_number("5000") == 5000.0

    def test_number_with_commas(self):
        assert extract_number("5,000") == 5000.0

    def test_number_with_dollar_sign(self):
        assert extract_number("$5,000") == 5000.0

    def test_decimal(self):
        assert extract_number("0.25") == 0.25

    def test_negative(self):
        assert extract_number("-1500") == -1500.0

    def test_number_in_text(self):
        assert extract_number("The income tax is approximately 3500.") == 3500.0

    def test_none_for_empty(self):
        assert extract_number("") is None

    def test_none_for_no_number(self):
        assert extract_number("I cannot determine this.") is None

    def test_takes_last_number(self):
        assert extract_number("Between 3000 and 5000, I estimate 4200.") == 4200.0


def test_no_tools_prompt_contains_household_info(mini_scenario):
    """Prompt should describe the household."""
    prompt = make_no_tools_prompt(mini_scenario, "income_tax")
    assert "single filer" in prompt
    assert "CA" in prompt
    assert "50,000" in prompt
    assert "35 years old" in prompt
    assert "2025" in prompt


def test_no_tools_prompt_asks_for_numeric(mini_scenario):
    """Prompt should request numeric-only response."""
    prompt = make_no_tools_prompt(mini_scenario, "income_tax")
    assert "numeric" in prompt.lower()


@patch("policybench.eval_no_tools.completion")
def test_run_single_no_tools(mock_completion, mini_scenario):
    """Should call LiteLLM and extract numeric prediction."""
    message = MagicMock()
    message.content = "3500"

    response = MagicMock()
    response.choices = [MagicMock(message=message)]
    mock_completion.return_value = response

    result = run_single_no_tools(mini_scenario, "income_tax", "gpt-5.2")

    assert result["prediction"] == 3500.0
    assert result["raw_response"] == "3500"
    mock_completion.assert_called_once()
