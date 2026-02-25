import { useState, useMemo } from "react";
import type { BenchData } from "../App";

const MODEL_LABELS: Record<string, string> = {
  "claude-opus": "Claude Opus 4.6",
  "claude-sonnet-4.5": "Claude Sonnet 4.5",
  "claude-sonnet-4.6": "Claude Sonnet 4.6",
  "gpt-5.2": "GPT-5.2",
};

const MODEL_COLORS: Record<string, string> = {
  "claude-opus": "#00d4ff",
  "claude-sonnet-4.5": "#ffaa00",
  "claude-sonnet-4.6": "#00ff88",
  "gpt-5.2": "#ff4466",
};

const VARIABLE_LABELS: Record<string, string> = {
  income_tax: "Income tax",
  income_tax_before_refundable_credits: "Tax (pre-refundable)",
  income_tax_refundable_credits: "Refundable credits",
  eitc: "EITC",
  ctc: "CTC",
  snap: "SNAP",
  ssi: "SSI",
  free_school_meals: "Free school meals",
  is_medicaid_eligible: "Medicaid eligible",
  household_state_income_tax: "State income tax",
  household_net_income: "Net income",
  household_benefits: "Total benefits",
  household_market_income: "Market income",
  marginal_tax_rate: "Marginal tax rate",
};

function fmt(v: number): string {
  if (v === 0) return "$0";
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}k`;
  return `$${v.toFixed(0)}`;
}

function errorColor(error: number, truth: number): string {
  if (truth === 0 && error === 0) return "#00ff88";
  const pctErr = truth !== 0 ? Math.abs(error / truth) : error !== 0 ? 1 : 0;
  if (pctErr <= 0.1) return "#00ff88";
  if (pctErr <= 0.25) return "#00d4ff";
  if (pctErr <= 0.5) return "#ffaa00";
  return "#ff4466";
}

export default function ScenarioExplorer({ data }: { data: BenchData }) {
  const scenarioIds = useMemo(
    () => Object.keys(data.scenarios).sort(),
    [data]
  );
  const [selectedScenario, setSelectedScenario] = useState(scenarioIds[0]);
  const [condition, setCondition] = useState<"no_tools" | "with_tools">("no_tools");

  const scenario = data.scenarios[selectedScenario as keyof typeof data.scenarios];

  const predictions = useMemo(() => {
    const rows = data.scatter.filter(
      (d) => d.scenario === selectedScenario && d.condition === condition
    );
    // Group by variable
    const byVar: Record<string, Record<string, { prediction: number; error: number; groundTruth: number }>> = {};
    for (const r of rows) {
      if (!byVar[r.variable]) byVar[r.variable] = {};
      byVar[r.variable][r.model] = {
        prediction: r.prediction,
        error: r.error,
        groundTruth: r.groundTruth,
      };
    }
    return byVar;
  }, [data, selectedScenario, condition]);

  const variables = useMemo(
    () => Object.keys(predictions).sort(),
    [predictions]
  );

  const models = useMemo(() => {
    const unique = new Set<string>();
    for (const varData of Object.values(predictions)) {
      for (const m of Object.keys(varData)) unique.add(m);
    }
    return Object.keys(MODEL_LABELS).filter((m) => unique.has(m));
  }, [predictions]);

  if (!scenario) return null;

  return (
    <div>
      <div className="eyebrow mb-3 animate-fade-up">Deep dive</div>
      <h2
        className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-text tracking-tight animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        Scenario explorer
      </h2>
      <p
        className="text-text-secondary mt-3 max-w-xl leading-relaxed animate-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        Select a household to see every model's prediction for each program,
        compared against PolicyEngine's ground truth.
      </p>

      {/* Controls row */}
      <div className="flex flex-wrap items-end gap-4 mt-8">
        {/* Scenario picker */}
        <div>
          <label className="block text-[10px] uppercase tracking-[0.14em] text-text-muted font-medium mb-1.5">
            Household
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="bg-surface border border-border text-text text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan/50 font-[family-name:var(--font-mono)]"
          >
            {scenarioIds.map((id) => {
              const s = data.scenarios[id as keyof typeof data.scenarios];
              return (
                <option key={id} value={id}>
                  {id.replace("scenario_", "#")} &mdash; {s.state},{" "}
                  {s.filingStatus}, ${Number(s.totalIncome).toLocaleString()}
                </option>
              );
            })}
          </select>
        </div>

        {/* Condition toggle */}
        <div className="flex bg-surface rounded-lg p-0.5 border border-border-subtle">
          {(
            [
              ["no_tools", "AI alone"],
              ["with_tools", "With tools"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCondition(val)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium tracking-wider uppercase transition-all ${
                condition === val
                  ? "bg-card text-text shadow-sm"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario summary card */}
      <div className="card px-5 py-4 mt-6 grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
        {[
          ["State", scenario.state],
          ["Filing status", scenario.filingStatus],
          ["Adults", String(scenario.numAdults)],
          ["Children", String(scenario.numChildren)],
          ["Income", fmt(scenario.totalIncome as number)],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] uppercase tracking-[0.14em] text-text-muted font-medium">
              {label}
            </div>
            <div className="text-text font-[family-name:var(--font-mono)] text-sm mt-0.5">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Results table */}
      <div className="mt-6 overflow-x-auto animate-fade-up" style={{ animationDelay: "320ms" }}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-[10px] uppercase tracking-[0.14em] text-text-muted font-medium pb-3 pr-4 w-44">
                Program
              </th>
              <th className="text-right text-[10px] uppercase tracking-[0.14em] text-text-muted font-medium pb-3 px-3 w-24">
                Truth
              </th>
              {models.map((m) => (
                <th
                  key={m}
                  className="text-right text-[10px] uppercase tracking-[0.14em] text-text-muted font-medium pb-3 px-3 w-28"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: MODEL_COLORS[m] }}
                    />
                    {MODEL_LABELS[m]?.split(" ").slice(-2).join(" ")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variables.map((v) => {
              const varData = predictions[v] || {};
              const truth = Object.values(varData)[0]?.groundTruth ?? 0;
              const isBinary = v === "is_medicaid_eligible" || v === "free_school_meals";
              const isRate = v === "marginal_tax_rate";

              return (
                <tr key={v} className="border-t border-border-subtle">
                  <td className="py-2.5 pr-4 text-sm text-text-secondary">
                    {VARIABLE_LABELS[v] || v.replace(/_/g, " ")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-[family-name:var(--font-mono)] text-sm text-text">
                    {isBinary
                      ? truth === 1
                        ? "Yes"
                        : "No"
                      : isRate
                        ? `${(truth * 100).toFixed(1)}%`
                        : fmt(truth)}
                  </td>
                  {models.map((m) => {
                    const pred = varData[m];
                    if (!pred)
                      return (
                        <td key={m} className="py-2.5 px-3 text-right text-text-muted text-sm">
                          --
                        </td>
                      );

                    const displayPred = isBinary
                      ? pred.prediction === 1
                        ? "Yes"
                        : "No"
                      : isRate
                        ? `${(pred.prediction * 100).toFixed(1)}%`
                        : fmt(pred.prediction);

                    const isCorrect = isBinary
                      ? pred.prediction === truth
                      : Math.abs(pred.error) <= Math.abs(truth) * 0.1 ||
                        (truth === 0 && pred.prediction === 0);

                    return (
                      <td
                        key={m}
                        className="py-2.5 px-3 text-right font-[family-name:var(--font-mono)] text-sm"
                        style={{
                          color: isCorrect
                            ? "#00ff88"
                            : errorColor(pred.error, truth),
                        }}
                      >
                        {displayPred}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
