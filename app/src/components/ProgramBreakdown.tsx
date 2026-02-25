import { useState } from "react";
import { PROGRAM_STATS, MODELS, PROGRAM_LABELS } from "../data";

type Metric = "pct_within_10" | "mae";

function cellColor(value: number, metric: Metric, withTools: boolean): string {
  if (withTools) return "bg-green-100 text-green-800";
  if (metric === "pct_within_10") {
    if (value >= 80) return "bg-green-100 text-green-800";
    if (value >= 65) return "bg-yellow-100 text-yellow-800";
    if (value >= 50) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  }
  // MAE -- lower is better, but scale depends on program
  if (value === 0) return "bg-green-100 text-green-800";
  if (value < 1) return "bg-yellow-100 text-yellow-800"; // boolean/rate
  if (value < 2000) return "bg-yellow-100 text-yellow-800";
  if (value < 4000) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function formatValue(value: number, metric: Metric): string {
  if (metric === "pct_within_10") return `${value}%`;
  if (value === 0) return "$0";
  if (value < 1) return value.toFixed(2);
  return `$${Math.round(value).toLocaleString()}`;
}

const MODEL_DISPLAY: Record<string, string> = {
  "gpt-5.2": "GPT-5.2",
  "claude-sonnet": "Sonnet",
  "claude-opus": "Opus",
};

export default function ProgramBreakdown() {
  const [metric, setMetric] = useState<Metric>("pct_within_10");
  const [showWithTools, setShowWithTools] = useState(false);

  // Get unique programs in order
  const programs = [...new Set(PROGRAM_STATS.map((p) => p.program))];

  function getValue(program: string, model: string): number {
    const row = PROGRAM_STATS.find(
      (p) => p.program === program && p.model === model,
    );
    if (!row) return 0;
    if (metric === "pct_within_10") {
      return showWithTools
        ? row.pct_within_10_with_tools
        : row.pct_within_10_no_tools;
    }
    return showWithTools ? row.mae_with_tools : row.mae_no_tools;
  }

  return (
    <section className="py-12 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-pe-dark mb-2">
          Per-program breakdown
        </h2>
        <p className="text-gray-600 mb-4">
          Accuracy by program and model. Benefits programs (SNAP, SSI) are
          especially difficult for AI without tools.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Metric:</span>
            <button
              onClick={() => setMetric("pct_within_10")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                metric === "pct_within_10"
                  ? "bg-pe-blue text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              % within 10%
            </button>
            <button
              onClick={() => setMetric("mae")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                metric === "mae"
                  ? "bg-pe-blue text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              MAE
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              Condition:
            </span>
            <button
              onClick={() => setShowWithTools(false)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !showWithTools
                  ? "bg-pe-blue text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              Without tools
            </button>
            <button
              onClick={() => setShowWithTools(true)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                showWithTools
                  ? "bg-pe-blue text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              With tools
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left p-3 font-semibold text-gray-700">
                  Program
                </th>
                {MODELS.map((model) => (
                  <th
                    key={model}
                    className="p-3 font-semibold text-gray-700 text-center"
                  >
                    {MODEL_DISPLAY[model] ?? model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr
                  key={program}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {PROGRAM_LABELS[program] ?? program}
                  </td>
                  {MODELS.map((model) => {
                    const val = getValue(program, model);
                    return (
                      <td key={model} className="p-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs font-semibold min-w-[60px] ${cellColor(val, metric, showWithTools)}`}
                        >
                          {formatValue(val, metric)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
