"""CLI entry point for PolicyBench."""

import argparse
import sys


def main():
    parser = argparse.ArgumentParser(description="PolicyBench benchmark runner")
    subparsers = parser.add_subparsers(dest="command")

    # Ground truth
    gt_parser = subparsers.add_parser(
        "ground-truth", help="Generate ground truth from PolicyEngine-US"
    )
    gt_parser.add_argument("-o", "--output", default="results/ground_truth.csv")

    # Eval no tools
    nt_parser = subparsers.add_parser("eval-no-tools", help="Run AI-alone evaluation")
    nt_parser.add_argument("-o", "--output", default="results/no_tools/predictions.csv")

    # Eval with tools
    wt_parser = subparsers.add_parser(
        "eval-with-tools", help="Run AI-with-tools evaluation"
    )
    wt_parser.add_argument(
        "-o", "--output", default="results/with_tools/predictions.csv"
    )

    # Analyze
    subparsers.add_parser("analyze", help="Analyze results")

    args = parser.parse_args()

    # Enable disk cache for all LLM calls
    if args.command in ("eval-no-tools", "eval-with-tools"):
        from policybench.cache import enable_cache

        enable_cache()

    if args.command == "ground-truth":
        from policybench.ground_truth import calculate_ground_truth
        from policybench.scenarios import generate_scenarios

        scenarios = generate_scenarios()
        df = calculate_ground_truth(scenarios)
        df.to_csv(args.output, index=False)
        print(f"Ground truth saved to {args.output}")

    elif args.command == "eval-no-tools":
        from policybench.eval_no_tools import run_no_tools_eval
        from policybench.scenarios import generate_scenarios

        scenarios = generate_scenarios()
        df = run_no_tools_eval(scenarios)
        df.to_csv(args.output, index=False)
        print(f"No-tools predictions saved to {args.output}")

    elif args.command == "eval-with-tools":
        from policybench.eval_with_tools import run_with_tools_eval
        from policybench.scenarios import generate_scenarios

        scenarios = generate_scenarios()
        df = run_with_tools_eval(scenarios)
        df.to_csv(args.output, index=False)
        print(f"With-tools predictions saved to {args.output}")

    elif args.command == "analyze":
        import pandas as pd

        from policybench.analysis import (
            compare_conditions,
            compute_metrics,
        )

        gt = pd.read_csv("results/ground_truth.csv")
        no_tools = pd.read_csv("results/no_tools/predictions.csv")
        with_tools = pd.read_csv("results/with_tools/predictions.csv")

        nt_metrics = compute_metrics(gt, no_tools)
        wt_metrics = compute_metrics(gt, with_tools)
        comparison = compare_conditions(nt_metrics, wt_metrics)

        print("\n=== AI Alone Metrics ===")
        print(nt_metrics.to_string(index=False))
        print("\n=== AI With Tools Metrics ===")
        print(wt_metrics.to_string(index=False))
        print("\n=== Comparison ===")
        print(comparison.to_string(index=False))

    else:
        parser.print_help()
        sys.exit(1)
