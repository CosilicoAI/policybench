"""AI-alone evaluation using EDSL."""

import pandas as pd
from edsl import QuestionNumerical, Survey
from edsl.agents import Agent

from policybench.config import MODELS, PROGRAMS
from policybench.prompts import make_no_tools_prompt
from policybench.scenarios import Scenario


def build_survey(
    scenarios: list[Scenario],
    programs: list[str] | None = None,
) -> Survey:
    """Build an EDSL Survey for all scenario × program combinations."""
    if programs is None:
        programs = PROGRAMS

    questions = []
    for scenario in scenarios:
        for variable in programs:
            prompt = make_no_tools_prompt(scenario, variable)
            q = QuestionNumerical(
                question_name=f"{scenario.id}__{variable}",
                question_text=prompt,
            )
            questions.append(q)

    return Survey(questions=questions)


def run_no_tools_eval(
    scenarios: list[Scenario],
    models: dict[str, str] | None = None,
    programs: list[str] | None = None,
) -> pd.DataFrame:
    """Run the AI-alone evaluation across all models.

    Returns DataFrame with columns:
        model, scenario_id, variable, prediction
    """
    if models is None:
        models = MODELS
    if programs is None:
        programs = PROGRAMS

    survey = build_survey(scenarios, programs)
    all_rows = []

    for model_name, model_id in models.items():
        agent = Agent(name=f"policybench_{model_name}")
        results = survey.by(agent).run(model=model_id)

        for scenario in scenarios:
            for variable in programs:
                q_name = f"{scenario.id}__{variable}"
                answer = results.select(q_name).first()
                all_rows.append(
                    {
                        "model": model_name,
                        "scenario_id": scenario.id,
                        "variable": variable,
                        "prediction": float(answer) if answer is not None else None,
                    }
                )

    return pd.DataFrame(all_rows)
