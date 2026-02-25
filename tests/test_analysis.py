"""Tests for metrics and analysis."""

import numpy as np
import pandas as pd
import pytest

from policybench.analysis import (
    accuracy,
    compare_conditions,
    compute_metrics,
    mean_absolute_error,
    mean_absolute_percentage_error,
    summary_by_model,
    summary_by_variable,
    within_tolerance,
)


class TestBasicMetrics:
    def test_mae_perfect(self):
        y = np.array([100.0, 200.0, 300.0])
        assert mean_absolute_error(y, y) == 0.0

    def test_mae_known(self):
        y_true = np.array([100.0, 200.0, 300.0])
        y_pred = np.array([110.0, 190.0, 310.0])
        assert mean_absolute_error(y_true, y_pred) == 10.0

    def test_mape_perfect(self):
        y = np.array([100.0, 200.0, 300.0])
        assert mean_absolute_percentage_error(y, y) == 0.0

    def test_mape_known(self):
        y_true = np.array([100.0, 200.0])
        y_pred = np.array([110.0, 220.0])
        # Errors: 10% and 10%
        assert abs(mean_absolute_percentage_error(y_true, y_pred) - 0.10) < 1e-10

    def test_mape_skips_zeros(self):
        y_true = np.array([0.0, 100.0])
        y_pred = np.array([10.0, 110.0])
        # Only considers index 1: 10% error
        assert abs(mean_absolute_percentage_error(y_true, y_pred) - 0.10) < 1e-10

    def test_mape_all_zeros(self):
        y_true = np.array([0.0, 0.0])
        y_pred = np.array([10.0, 20.0])
        assert np.isnan(mean_absolute_percentage_error(y_true, y_pred))

    def test_accuracy_perfect(self):
        y = np.array([0.0, 1.0, 1.0, 0.0])
        assert accuracy(y, y) == 1.0

    def test_accuracy_half(self):
        y_true = np.array([0.0, 1.0, 1.0, 0.0])
        y_pred = np.array([1.0, 0.0, 1.0, 0.0])
        assert accuracy(y_true, y_pred) == 0.5

    def test_within_tolerance_perfect(self):
        y = np.array([100.0, 200.0, 300.0])
        assert within_tolerance(y, y) == 1.0

    def test_within_tolerance_known(self):
        y_true = np.array([100.0, 200.0, 1000.0])
        # 5% off, 5% off, 20% off
        y_pred = np.array([105.0, 210.0, 1200.0])
        # First two within 10%, third is not
        assert abs(within_tolerance(y_true, y_pred, tolerance=0.10) - 2 / 3) < 1e-10

    def test_within_tolerance_zero_ground_truth(self):
        y_true = np.array([0.0])
        y_pred = np.array([0.5])  # Within $1 tolerance
        assert within_tolerance(y_true, y_pred) == 1.0

        y_pred_far = np.array([5.0])  # Outside $1 tolerance
        assert within_tolerance(y_true, y_pred_far) == 0.0


class TestComputeMetrics:
    @pytest.fixture
    def ground_truth_df(self):
        return pd.DataFrame(
            {
                "scenario_id": ["s1", "s2", "s3", "s1", "s2", "s3"],
                "variable": [
                    "income_tax",
                    "income_tax",
                    "income_tax",
                    "eitc",
                    "eitc",
                    "eitc",
                ],
                "value": [5000.0, 10000.0, 0.0, 3000.0, 0.0, 6000.0],
            }
        )

    @pytest.fixture
    def predictions_df(self):
        return pd.DataFrame(
            {
                "model": ["model_a"] * 6,
                "scenario_id": ["s1", "s2", "s3", "s1", "s2", "s3"],
                "variable": [
                    "income_tax",
                    "income_tax",
                    "income_tax",
                    "eitc",
                    "eitc",
                    "eitc",
                ],
                "prediction": [5500.0, 9000.0, 100.0, 3300.0, 500.0, 5400.0],
            }
        )

    def test_compute_metrics_returns_dataframe(self, ground_truth_df, predictions_df):
        metrics = compute_metrics(ground_truth_df, predictions_df)
        assert isinstance(metrics, pd.DataFrame)
        assert "model" in metrics.columns
        assert "variable" in metrics.columns
        assert "mae" in metrics.columns

    def test_compute_metrics_correct_rows(self, ground_truth_df, predictions_df):
        metrics = compute_metrics(ground_truth_df, predictions_df)
        # 1 model × 2 variables = 2 rows
        assert len(metrics) == 2

    def test_compute_metrics_mae_values(self, ground_truth_df, predictions_df):
        metrics = compute_metrics(ground_truth_df, predictions_df)
        income_tax_row = metrics[metrics["variable"] == "income_tax"]
        # MAE for income_tax: |5500-5000|=500, |9000-10000|=1000, |100-0|=100
        # Mean: (500+1000+100)/3 = 533.33
        expected_mae = (500 + 1000 + 100) / 3
        assert abs(income_tax_row["mae"].iloc[0] - expected_mae) < 0.01


class TestSummaries:
    @pytest.fixture
    def metrics_df(self):
        return pd.DataFrame(
            {
                "model": ["a", "a", "b", "b"],
                "variable": ["income_tax", "eitc", "income_tax", "eitc"],
                "mae": [500.0, 300.0, 1000.0, 800.0],
                "mape": [0.10, 0.05, 0.20, 0.15],
                "accuracy": [float("nan")] * 4,
                "within_10pct": [0.8, 0.9, 0.5, 0.6],
                "n": [50, 50, 50, 50],
            }
        )

    def test_summary_by_model(self, metrics_df):
        summary = summary_by_model(metrics_df)
        assert len(summary) == 2
        model_a = summary[summary["model"] == "a"]
        assert abs(model_a["mean_mae"].iloc[0] - 400.0) < 1e-10

    def test_summary_by_variable(self, metrics_df):
        summary = summary_by_variable(metrics_df)
        assert len(summary) == 2
        it = summary[summary["variable"] == "income_tax"]
        assert abs(it["mean_mae"].iloc[0] - 750.0) < 1e-10

    def test_compare_conditions(self, metrics_df):
        # Use same df for both conditions with different values
        better_metrics = metrics_df.copy()
        better_metrics["mae"] = [50.0, 30.0, 100.0, 80.0]
        better_metrics["within_10pct"] = [0.95, 0.99, 0.85, 0.90]

        comparison = compare_conditions(metrics_df, better_metrics)
        assert "mae_reduction" in comparison.columns
        assert "accuracy_improvement" in comparison.columns
        # With-tools should show improvement
        assert (comparison["mae_reduction"] > 0).all()
