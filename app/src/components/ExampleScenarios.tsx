import { EXAMPLE_SCENARIOS } from "../data";

const MODEL_DISPLAY: Record<string, string> = {
  "gpt-5.2": "GPT-5.2",
  "claude-sonnet": "Claude Sonnet",
  "claude-opus": "Claude Opus",
};

function formatDollars(value: number): string {
  return `$${value.toLocaleString()}`;
}

function errorPct(prediction: number, truth: number): string {
  if (truth === 0) return "N/A";
  const pct = Math.abs(((prediction - truth) / truth) * 100);
  return `${pct.toFixed(0)}% off`;
}

export default function ExampleScenarios() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-pe-dark mb-2">
          Example scenarios
        </h2>
        <p className="text-gray-600 mb-8">
          Specific households where AI alone produced dramatically wrong answers,
          but with PolicyEngine tools the answer was exact.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {EXAMPLE_SCENARIOS.map((scenario) => (
            <div
              key={scenario.scenario_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-gray-400">
                    {scenario.scenario_id}
                  </span>
                  <span className="text-xs bg-pe-light text-pe-blue px-2 py-0.5 rounded-full font-medium">
                    {MODEL_DISPLAY[scenario.model] ?? scenario.model}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  {scenario.description}
                </p>

                <div className="text-sm font-semibold text-gray-800 mb-3">
                  {scenario.variable_label}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Ground truth
                    </p>
                    <p className="text-lg font-bold text-pe-blue">
                      {formatDollars(scenario.ground_truth)}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      AI alone
                    </p>
                    <p className="text-lg font-bold text-accuracy-bad">
                      {formatDollars(scenario.no_tools_prediction)}
                    </p>
                    <p className="text-xs text-red-400 mt-0.5">
                      {errorPct(
                        scenario.no_tools_prediction,
                        scenario.ground_truth,
                      )}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      With PE tools
                    </p>
                    <p className="text-lg font-bold text-accuracy-good">
                      {formatDollars(scenario.with_tools_prediction)}
                    </p>
                    <p className="text-xs text-green-500 mt-0.5">Exact match</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
