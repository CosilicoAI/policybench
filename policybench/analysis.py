"""Metrics and analysis for PolicyBench results."""

import numpy as np
import pandas as pd

from policybench.config import BINARY_PROGRAMS, RATE_PROGRAMS


def mean_absolute_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute mean absolute error."""
    return float(np.mean(np.abs(y_true - y_pred)))


def mean_absolute_percentage_error(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute MAPE, excluding zero ground truth values."""
    mask = y_true != 0
    if not mask.any():
        return float("nan")
    return float(np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])))


def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute accuracy for binary predictions."""
    # Round predictions to 0 or 1
    y_pred_binary = np.round(y_pred).astype(int)
    y_true_binary = np.round(y_true).astype(int)
    return float(np.mean(y_true_binary == y_pred_binary))


def within_tolerance(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    tolerance: float = 0.10,
) -> float:
    """Fraction of predictions within tolerance of ground truth.

    For values where ground truth is 0, checks if prediction is also 0.
    """
    mask_nonzero = y_true != 0
    mask_zero = ~mask_nonzero

    correct = np.zeros(len(y_true), dtype=bool)

    # For nonzero ground truth: within relative tolerance
    if mask_nonzero.any():
        rel_error = np.abs(
            (y_true[mask_nonzero] - y_pred[mask_nonzero]) / y_true[mask_nonzero]
        )
        correct[mask_nonzero] = rel_error <= tolerance

    # For zero ground truth: prediction must be within absolute tolerance
    if mask_zero.any():
        correct[mask_zero] = np.abs(y_pred[mask_zero]) <= 1.0  # $1 tolerance

    return float(np.mean(correct))


def compute_metrics(
    ground_truth: pd.DataFrame,
    predictions: pd.DataFrame,
) -> pd.DataFrame:
    """Compute metrics by model and variable.

    Args:
        ground_truth: DataFrame with columns [scenario_id, variable, value]
        predictions: DataFrame with columns [model, scenario_id, variable, prediction]

    Returns:
        DataFrame with columns [model, variable, mae, mape, accuracy_10pct, n]
    """
    merged = predictions.merge(
        ground_truth,
        on=["scenario_id", "variable"],
        how="inner",
    )

    # Drop rows where prediction is missing
    merged = merged.dropna(subset=["prediction"])

    rows = []
    for (model, variable), group in merged.groupby(["model", "variable"]):
        y_true = group["value"].values
        y_pred = group["prediction"].values

        row = {
            "model": model,
            "variable": variable,
            "n": len(group),
        }

        if variable in BINARY_PROGRAMS:
            row["mae"] = mean_absolute_error(y_true, y_pred)
            row["mape"] = float("nan")
            row["accuracy"] = accuracy(y_true, y_pred)
            row["within_10pct"] = float("nan")
        elif variable in RATE_PROGRAMS:
            row["mae"] = mean_absolute_error(y_true, y_pred)
            row["mape"] = float("nan")
            row["accuracy"] = float("nan")
            row["within_10pct"] = within_tolerance(y_true, y_pred, tolerance=0.10)
        else:
            row["mae"] = mean_absolute_error(y_true, y_pred)
            row["mape"] = mean_absolute_percentage_error(y_true, y_pred)
            row["accuracy"] = float("nan")
            row["within_10pct"] = within_tolerance(y_true, y_pred, tolerance=0.10)

        rows.append(row)

    return pd.DataFrame(rows)


def summary_by_model(metrics: pd.DataFrame) -> pd.DataFrame:
    """Aggregate metrics by model across all variables."""
    return (
        metrics.groupby("model")
        .agg(
            mean_mae=("mae", "mean"),
            mean_mape=("mape", "mean"),
            mean_within_10pct=("within_10pct", "mean"),
            total_n=("n", "sum"),
        )
        .reset_index()
    )


def summary_by_variable(metrics: pd.DataFrame) -> pd.DataFrame:
    """Aggregate metrics by variable across all models."""
    return (
        metrics.groupby("variable")
        .agg(
            mean_mae=("mae", "mean"),
            mean_mape=("mape", "mean"),
            mean_within_10pct=("within_10pct", "mean"),
            total_n=("n", "sum"),
        )
        .reset_index()
    )


def compare_conditions(
    no_tools_metrics: pd.DataFrame,
    with_tools_metrics: pd.DataFrame,
) -> pd.DataFrame:
    """Compare AI-alone vs AI-with-tools performance.

    Returns a DataFrame showing side-by-side metrics and improvement.
    """
    no_tools_summary = summary_by_model(no_tools_metrics).rename(
        columns={
            "mean_mae": "no_tools_mae",
            "mean_mape": "no_tools_mape",
            "mean_within_10pct": "no_tools_within_10pct",
        }
    )
    with_tools_summary = summary_by_model(with_tools_metrics).rename(
        columns={
            "mean_mae": "with_tools_mae",
            "mean_mape": "with_tools_mape",
            "mean_within_10pct": "with_tools_within_10pct",
        }
    )

    comparison = no_tools_summary.merge(
        with_tools_summary, on="model", suffixes=("_no", "_with")
    )

    comparison["mae_reduction"] = (
        1 - comparison["with_tools_mae"] / comparison["no_tools_mae"]
    )
    comparison["accuracy_improvement"] = (
        comparison["with_tools_within_10pct"] - comparison["no_tools_within_10pct"]
    )

    return comparison
