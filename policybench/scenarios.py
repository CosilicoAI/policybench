"""Household scenario generation for PolicyBench."""

import random
from dataclasses import dataclass, field

from policybench.config import (
    FILING_STATUSES,
    INCOME_LEVELS,
    NUM_CHILDREN_OPTIONS,
    NUM_SCENARIOS,
    SEED,
    STATES,
    TAX_YEAR,
)


@dataclass
class Person:
    """A person in a household."""

    name: str
    age: int
    employment_income: float


@dataclass
class Scenario:
    """A household scenario for benchmarking."""

    id: str
    state: str
    filing_status: str
    adults: list[Person]
    children: list[Person] = field(default_factory=list)
    year: int = TAX_YEAR

    @property
    def all_people(self) -> list[Person]:
        return self.adults + self.children

    @property
    def total_income(self) -> float:
        return sum(p.employment_income for p in self.all_people)

    @property
    def num_children(self) -> int:
        return len(self.children)

    def to_pe_household(self) -> dict:
        """Convert to PolicyEngine-US household JSON format."""
        people = {}
        adult_names = []
        child_names = []

        for person in self.adults:
            people[person.name] = {
                "age": {str(self.year): person.age},
                "employment_income": {str(self.year): person.employment_income},
            }
            adult_names.append(person.name)

        for child in self.children:
            people[child.name] = {
                "age": {str(self.year): child.age},
                "employment_income": {str(self.year): child.employment_income},
            }
            child_names.append(child.name)

        all_names = adult_names + child_names

        return {
            "people": people,
            "tax_units": {
                "tax_unit": {
                    "members": all_names,
                }
            },
            "spm_units": {"spm_unit": {"members": all_names}},
            "families": {"family": {"members": all_names}},
            "households": {
                "household": {
                    "members": all_names,
                    "state_code": {str(self.year): self.state},
                }
            },
        }


def generate_scenarios(n: int = NUM_SCENARIOS, seed: int = SEED) -> list[Scenario]:
    """Generate n household scenarios with deterministic randomness."""
    rng = random.Random(seed)
    scenarios = []

    for i in range(n):
        state = rng.choice(STATES)
        filing_status = rng.choice(FILING_STATUSES)
        income = rng.choice(INCOME_LEVELS)
        num_children = rng.choice(NUM_CHILDREN_OPTIONS)

        # Primary adult
        primary_age = rng.randint(25, 65)
        adults = [
            Person(
                name="adult1",
                age=primary_age,
                employment_income=float(income),
            )
        ]

        # Spouse for joint filers
        if filing_status == "joint":
            spouse_income = rng.choice(INCOME_LEVELS)
            spouse_age = rng.randint(25, 65)
            adults.append(
                Person(
                    name="adult2",
                    age=spouse_age,
                    employment_income=float(spouse_income),
                )
            )

        # Children
        children = []
        for c in range(num_children):
            child_age = rng.randint(0, 17)
            children.append(
                Person(
                    name=f"child{c + 1}",
                    age=child_age,
                    employment_income=0.0,
                )
            )

        scenarios.append(
            Scenario(
                id=f"scenario_{i:03d}",
                state=state,
                filing_status=filing_status,
                adults=adults,
                children=children,
            )
        )

    return scenarios
