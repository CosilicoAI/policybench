"""Tests for scenario generation."""

from policybench.config import (
    FILING_STATUSES,
    INCOME_LEVELS,
    NUM_CHILDREN_OPTIONS,
    STATES,
)
from policybench.scenarios import generate_scenarios


def test_generate_scenarios_count():
    """Generates the requested number of scenarios."""
    scenarios = generate_scenarios(n=10, seed=42)
    assert len(scenarios) == 10


def test_generate_scenarios_deterministic():
    """Same seed produces identical scenarios."""
    s1 = generate_scenarios(n=20, seed=123)
    s2 = generate_scenarios(n=20, seed=123)
    for a, b in zip(s1, s2):
        assert a.id == b.id
        assert a.state == b.state
        assert a.filing_status == b.filing_status
        assert a.total_income == b.total_income
        assert a.num_children == b.num_children


def test_generate_scenarios_different_seeds():
    """Different seeds produce different scenarios."""
    s1 = generate_scenarios(n=50, seed=1)
    s2 = generate_scenarios(n=50, seed=2)
    # Not all scenarios should be the same
    different = sum(
        1
        for a, b in zip(s1, s2)
        if a.state != b.state or a.total_income != b.total_income
    )
    assert different > 0


def test_scenario_structure():
    """Each scenario has required fields."""
    scenarios = generate_scenarios(n=5)
    for s in scenarios:
        assert s.id.startswith("scenario_")
        assert s.state in STATES
        assert s.filing_status in FILING_STATUSES
        assert len(s.adults) >= 1
        assert s.num_children in NUM_CHILDREN_OPTIONS
        assert s.year == 2025


def test_joint_filers_have_two_adults():
    """Joint filers must have exactly 2 adults."""
    scenarios = generate_scenarios(n=100)
    for s in scenarios:
        if s.filing_status == "joint":
            assert len(s.adults) == 2
        else:
            assert len(s.adults) == 1


def test_income_from_valid_levels():
    """Adult incomes are drawn from configured levels."""
    scenarios = generate_scenarios(n=50)
    for s in scenarios:
        for adult in s.adults:
            assert adult.employment_income in [float(x) for x in INCOME_LEVELS]


def test_children_have_zero_income():
    """All children should have zero employment income."""
    scenarios = generate_scenarios(n=50)
    for s in scenarios:
        for child in s.children:
            assert child.employment_income == 0.0


def test_children_ages_valid():
    """Children should be under 18."""
    scenarios = generate_scenarios(n=50)
    for s in scenarios:
        for child in s.children:
            assert 0 <= child.age <= 17


def test_adults_ages_valid():
    """Adults should be 25-65."""
    scenarios = generate_scenarios(n=50)
    for s in scenarios:
        for adult in s.adults:
            assert 25 <= adult.age <= 65


def test_pe_household_format(simple_single_scenario):
    """PE household JSON has required structure."""
    hh = simple_single_scenario.to_pe_household()

    assert "people" in hh
    assert "tax_units" in hh
    assert "spm_units" in hh
    assert "families" in hh
    assert "households" in hh

    # Check person details
    assert "adult1" in hh["people"]
    person = hh["people"]["adult1"]
    assert "age" in person
    assert "employment_income" in person

    # Check state code
    household = hh["households"]["household"]
    assert "state_code" in household


def test_pe_household_with_children(family_scenario):
    """PE household includes children in all groups."""
    hh = family_scenario.to_pe_household()

    all_members = hh["tax_units"]["tax_unit"]["members"]
    assert "adult1" in all_members
    assert "adult2" in all_members
    assert "child1" in all_members
    assert "child2" in all_members

    assert len(hh["people"]) == 4


def test_scenario_covers_variety():
    """100 scenarios should cover multiple states and filing statuses."""
    scenarios = generate_scenarios(n=100)
    states = {s.state for s in scenarios}
    statuses = {s.filing_status for s in scenarios}
    incomes = {s.adults[0].employment_income for s in scenarios}

    assert len(states) >= 5
    assert len(statuses) >= 2
    assert len(incomes) >= 5
