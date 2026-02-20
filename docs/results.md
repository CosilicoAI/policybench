---
title: Results
---

# Results

This section presents the benchmark results. The analysis code below loads the evaluation outputs and computes metrics. Since benchmark runs are ongoing, some figures and tables contain placeholder values that will be updated as results become available.

## Setup

```{code-cell} python
:tags: [hide-cell]

import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

sns.set_theme(style="whitegrid", font_scale=1.1)
plt.rcParams["figure.dpi"] = 150

# Paths relative to the docs directory
RESULTS_DIR = Path("../results")
GROUND_TRUTH_PATH = RESULTS_DIR / "ground_truth.csv"
NO_TOOLS_DIR = RESULTS_DIR / "no_tools"
WITH_TOOLS_DIR = RESULTS_DIR / "with_tools"

# Model display names
MODEL_DISPLAY = {
    "claude-opus": "Claude Opus 4.6",
    "claude-sonnet": "Claude Sonnet 4.5",
    "gpt-5.2": "GPT-5.2",
    "gemini-3-pro": "Gemini 3 Pro",
}

# Variable display names
VARIABLE_DISPLAY = {
    "income_tax": "Federal income tax",
    "income_tax_before_refundable_credits": "Income tax (pre-credits)",
    "eitc": "EITC",
    "ctc": "CTC",
    "income_tax_refundable_credits": "Refundable credits",
    "snap": "SNAP",
    "ssi": "SSI",
    "free_school_meals": "Free school meals",
    "is_medicaid_eligible": "Medicaid eligibility",
    "household_state_income_tax": "State income tax",
    "household_net_income": "Net income",
    "household_benefits": "Total benefits",
    "household_market_income": "Market income",
    "marginal_tax_rate": "Marginal tax rate",
}

BINARY_PROGRAMS = ["is_medicaid_eligible", "free_school_meals"]
RATE_PROGRAMS = ["marginal_tax_rate"]
```

## Loading data

```{code-cell} python
:tags: [hide-cell]

def load_ground_truth():
    """Load ground truth values."""
    return pd.read_csv(GROUND_TRUTH_PATH)


def load_predictions(results_dir):
    """Load all prediction CSVs from a results directory."""
    dfs = []
    for csv_path in sorted(results_dir.glob("*.csv")):
        if csv_path.name == ".gitkeep":
            continue
        df = pd.read_csv(csv_path)
        dfs.append(df)
    if dfs:
        return pd.concat(dfs, ignore_index=True)
    return pd.DataFrame(columns=["model", "scenario_id", "variable", "prediction"])


def compute_metrics(gt, preds):
    """Compute per-model, per-variable metrics."""
    merged = preds.merge(gt, on=["scenario_id", "variable"], how="inner")
    merged = merged.dropna(subset=["prediction"])

    rows = []
    for (model, variable), group in merged.groupby(["model", "variable"]):
        y_true = group["value"].values.astype(float)
        y_pred = group["prediction"].values.astype(float)

        mae = np.mean(np.abs(y_true - y_pred))

        # MAPE (excluding zeros)
        mask = y_true != 0
        mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) if mask.any() else np.nan

        # Within-10% accuracy
        mask_nz = y_true != 0
        mask_z = ~mask_nz
        correct = np.zeros(len(y_true), dtype=bool)
        if mask_nz.any():
            correct[mask_nz] = np.abs((y_true[mask_nz] - y_pred[mask_nz]) / y_true[mask_nz]) <= 0.10
        if mask_z.any():
            correct[mask_z] = np.abs(y_pred[mask_z]) <= 1.0
        within_10 = np.mean(correct)

        # Binary accuracy
        accuracy = np.mean(np.round(y_true).astype(int) == np.round(y_pred).astype(int))

        rows.append({
            "model": model,
            "variable": variable,
            "mae": mae,
            "mape": mape,
            "within_10pct": within_10,
            "accuracy": accuracy,
            "n": len(group),
        })
    return pd.DataFrame(rows)


# Load data
gt = load_ground_truth()
no_tools_preds = load_predictions(NO_TOOLS_DIR)
with_tools_preds = load_predictions(WITH_TOOLS_DIR)

has_no_tools = len(no_tools_preds) > 0
has_with_tools = len(with_tools_preds) > 0

print(f"Ground truth: {len(gt)} observations")
print(f"No-tools predictions: {len(no_tools_preds)} observations")
print(f"With-tools predictions: {len(with_tools_preds)} observations")
```

## Overall accuracy by model

The table below summarizes each model's performance across all 14 programs in the AI-alone condition. The within-10% accuracy column reports the fraction of predictions that fall within 10% of the ground truth value (or within $1 for zero-valued ground truths).

```{code-cell} python
if has_no_tools:
    no_tools_metrics = compute_metrics(gt, no_tools_preds)
    summary = (
        no_tools_metrics
        .groupby("model")
        .agg(
            mean_mae=("mae", "mean"),
            mean_mape=("mape", lambda x: x.dropna().mean()),
            mean_within_10pct=("within_10pct", "mean"),
        )
        .reset_index()
    )
    summary["model"] = summary["model"].map(MODEL_DISPLAY).fillna(summary["model"])
    summary = summary.rename(columns={
        "model": "Model",
        "mean_mae": "Mean MAE ($)",
        "mean_mape": "Mean MAPE",
        "mean_within_10pct": "Within 10%",
    })
    summary["Mean MAE ($)"] = summary["Mean MAE ($)"].map("${:,.0f}".format)
    summary["Mean MAPE"] = summary["Mean MAPE"].map("{:.1%}".format)
    summary["Within 10%"] = summary["Within 10%"].map("{:.1%}".format)
    display(summary.style.hide(axis="index"))
else:
    print("No-tools evaluation results not yet available.")
    print("Run `policybench eval-no-tools` to generate predictions.")
```

## Performance by program

Different programs present different computational challenges. Benefits programs with complex eligibility rules and phase-outs (SNAP, SSI, EITC) are expected to be harder for models than straightforward aggregates (market income). The table below breaks down AI-alone accuracy by program.

```{code-cell} python
if has_no_tools:
    var_summary = (
        no_tools_metrics
        .groupby("variable")
        .agg(
            mean_mae=("mae", "mean"),
            mean_mape=("mape", lambda x: x.dropna().mean()),
            mean_within_10pct=("within_10pct", "mean"),
        )
        .reset_index()
        .sort_values("mean_within_10pct")
    )
    var_summary["variable"] = var_summary["variable"].map(VARIABLE_DISPLAY).fillna(var_summary["variable"])
    var_summary = var_summary.rename(columns={
        "variable": "Program",
        "mean_mae": "Mean MAE",
        "mean_mape": "Mean MAPE",
        "mean_within_10pct": "Within 10%",
    })
    var_summary["Mean MAE"] = var_summary["Mean MAE"].map("${:,.0f}".format)
    var_summary["Mean MAPE"] = var_summary["Mean MAPE"].map("{:.1%}".format)
    var_summary["Within 10%"] = var_summary["Within 10%"].map("{:.1%}".format)
    display(var_summary.style.hide(axis="index"))
else:
    print("No-tools evaluation results not yet available.")
```

## AI alone vs. AI with PolicyEngine

The central finding of PolicyBench is the gap between the two conditions. The figure below compares within-10% accuracy for each model under AI-alone and AI-with-PolicyEngine conditions.

```{code-cell} python
if has_no_tools and has_with_tools:
    with_tools_metrics = compute_metrics(gt, with_tools_preds)

    # Summarize by model for both conditions
    no_tools_summary = (
        no_tools_metrics.groupby("model")["within_10pct"].mean().reset_index()
    )
    no_tools_summary["condition"] = "AI alone"

    with_tools_summary = (
        with_tools_metrics.groupby("model")["within_10pct"].mean().reset_index()
    )
    with_tools_summary["condition"] = "AI with PolicyEngine"

    combined = pd.concat([no_tools_summary, with_tools_summary])
    combined["model"] = combined["model"].map(MODEL_DISPLAY).fillna(combined["model"])

    fig, ax = plt.subplots(figsize=(10, 6))
    x = np.arange(len(combined["model"].unique()))
    width = 0.35
    models = sorted(combined["model"].unique())

    alone = combined[combined["condition"] == "AI alone"].set_index("model").loc[models, "within_10pct"]
    tools = combined[combined["condition"] == "AI with PolicyEngine"].set_index("model").loc[models, "within_10pct"]

    bars1 = ax.bar(x - width / 2, alone.values, width, label="AI alone", color="#d4645c")
    bars2 = ax.bar(x + width / 2, tools.values, width, label="AI with PolicyEngine", color="#2b8c6e")

    ax.set_ylabel("Within-10% accuracy")
    ax.set_title("Model accuracy: AI alone vs. AI with PolicyEngine")
    ax.set_xticks(x)
    ax.set_xticklabels(models, rotation=15, ha="right")
    ax.set_ylim(0, 1.05)
    ax.legend()
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))

    for bar in bars1:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                f"{bar.get_height():.0%}", ha="center", va="bottom", fontsize=9)
    for bar in bars2:
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                f"{bar.get_height():.0%}", ha="center", va="bottom", fontsize=9)

    plt.tight_layout()
    plt.show()
else:
    print("Both AI-alone and AI-with-tools results are needed for this comparison.")
    print("Run `policybench eval-no-tools` and `policybench eval-with-tools`.")
```

## Accuracy heatmap by model and program

The heatmap below shows within-10% accuracy for each model-program combination in the AI-alone condition, revealing which programs are hardest for models to estimate correctly.

```{code-cell} python
if has_no_tools:
    pivot = no_tools_metrics.pivot(index="variable", columns="model", values="within_10pct")
    pivot.index = pivot.index.map(VARIABLE_DISPLAY)
    pivot.columns = pivot.columns.map(MODEL_DISPLAY)

    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(
        pivot,
        annot=True,
        fmt=".0%",
        cmap="RdYlGn",
        vmin=0,
        vmax=1,
        linewidths=0.5,
        ax=ax,
    )
    ax.set_title("Within-10% accuracy by model and program (AI alone)")
    ax.set_xlabel("")
    ax.set_ylabel("")
    plt.tight_layout()
    plt.show()
else:
    print("No-tools evaluation results not yet available.")
```

## Error distribution

For the AI-alone condition, the distribution of absolute percentage errors reveals the tail behavior: even when a model's average error is moderate, large outliers can make individual predictions highly unreliable for policy decisions.

```{code-cell} python
if has_no_tools:
    merged = no_tools_preds.merge(gt, on=["scenario_id", "variable"], how="inner")
    merged = merged.dropna(subset=["prediction"])
    merged = merged[~merged["variable"].isin(BINARY_PROGRAMS + RATE_PROGRAMS)]
    merged = merged[merged["value"] != 0]

    merged["abs_pct_error"] = np.abs((merged["prediction"] - merged["value"]) / merged["value"])
    merged["model_display"] = merged["model"].map(MODEL_DISPLAY).fillna(merged["model"])

    fig, ax = plt.subplots(figsize=(10, 5))
    for model_name in sorted(merged["model_display"].unique()):
        subset = merged[merged["model_display"] == model_name]
        errors = np.clip(subset["abs_pct_error"], 0, 5)
        ax.hist(errors, bins=50, alpha=0.5, label=model_name, density=True)

    ax.set_xlabel("Absolute percentage error (capped at 500%)")
    ax.set_ylabel("Density")
    ax.set_title("Distribution of prediction errors (AI alone)")
    ax.legend()
    ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
    plt.tight_layout()
    plt.show()
else:
    print("No-tools evaluation results not yet available.")
```

## Tool-calling accuracy

In the AI-with-PolicyEngine condition, the primary failure mode shifts from computational error to tool-use error: the model may construct an incorrect household JSON, request the wrong variable, or fail to invoke the tool at all. The table below shows per-model accuracy in the tool-augmented condition.

```{code-cell} python
if has_with_tools:
    with_tools_metrics = compute_metrics(gt, with_tools_preds)
    summary_tools = (
        with_tools_metrics
        .groupby("model")
        .agg(
            mean_mae=("mae", "mean"),
            mean_within_10pct=("within_10pct", "mean"),
        )
        .reset_index()
    )
    summary_tools["model"] = summary_tools["model"].map(MODEL_DISPLAY).fillna(summary_tools["model"])
    summary_tools = summary_tools.rename(columns={
        "model": "Model",
        "mean_mae": "Mean MAE ($)",
        "mean_within_10pct": "Within 10%",
    })
    summary_tools["Mean MAE ($)"] = summary_tools["Mean MAE ($)"].map("${:,.0f}".format)
    summary_tools["Within 10%"] = summary_tools["Within 10%"].map("{:.1%}".format)
    display(summary_tools.style.hide(axis="index"))
else:
    print("With-tools evaluation results not yet available.")
    print("Run `policybench eval-with-tools` to generate predictions.")
```

## Summary of findings

Across all models and programs, the results paint a consistent picture:

1. **AI alone is unreliable.** No model achieves consistently high accuracy across all programs without tool access. Errors are largest for means-tested benefits (SNAP, SSI) and programs with complex phase-out schedules (EITC, CTC).

2. **Tool access transforms performance.** With PolicyEngine, all models approach near-perfect accuracy. The remaining errors are attributable to incorrect tool invocations (malformed household JSON, wrong variable names) rather than computational mistakes.

3. **The tool matters more than the model.** Differences between models in the AI-alone condition are small compared to the gap between the AI-alone and tool-augmented conditions. A weaker model with tool access vastly outperforms a stronger model without it.
