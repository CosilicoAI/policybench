"""Tests for AI-alone evaluation (mocked EDSL calls)."""

import pytest

from policybench.eval_no_tools import build_survey
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


def test_build_survey_creates_questions(mini_scenario):
    """Survey should have one question per scenario × program."""
    programs = ["income_tax", "eitc"]
    survey = build_survey([mini_scenario], programs=programs)
    assert len(survey.questions) == 2


def test_build_survey_question_names(mini_scenario):
    """Question names encode scenario and variable."""
    programs = ["income_tax"]
    survey = build_survey([mini_scenario], programs=programs)
    q = survey.questions[0]
    assert q.question_name == "mini__income_tax"


def test_build_survey_multiple_scenarios(sample_scenarios):
    """Survey scales with number of scenarios × programs."""
    programs = ["income_tax", "eitc", "snap"]
    survey = build_survey(sample_scenarios, programs=programs)
    assert len(survey.questions) == len(sample_scenarios) * len(programs)


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
