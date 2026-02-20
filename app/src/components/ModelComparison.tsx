import { MODEL_STATS } from "../data";

function accuracyColor(pct: number): string {
  if (pct >= 95) return "bg-green-100 text-green-800";
  if (pct >= 75) return "bg-yellow-100 text-yellow-800";
  if (pct >= 60) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

function maeColor(mae: number): string {
  if (mae === 0) return "bg-green-100 text-green-800";
  if (mae < 2000) return "bg-yellow-100 text-yellow-800";
  if (mae < 4000) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
}

const MODEL_DISPLAY: Record<string, string> = {
  "gpt-5.2": "GPT-5.2",
  "claude-sonnet": "Claude Sonnet",
  "claude-opus": "Claude Opus",
};

export default function ModelComparison() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-pe-dark mb-2">
          Model comparison
        </h2>
        <p className="text-gray-600 mb-6">
          Aggregate accuracy metrics across all programs and scenarios.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 font-semibold text-gray-700">
                  Model
                </th>
                <th className="p-3 font-semibold text-gray-700" colSpan={2}>
                  Mean absolute error ($)
                </th>
                <th className="p-3 font-semibold text-gray-700" colSpan={2}>
                  % within 10%
                </th>
              </tr>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th></th>
                <th className="p-2 text-xs font-medium text-gray-500">
                  No tools
                </th>
                <th className="p-2 text-xs font-medium text-gray-500">
                  With tools
                </th>
                <th className="p-2 text-xs font-medium text-gray-500">
                  No tools
                </th>
                <th className="p-2 text-xs font-medium text-gray-500">
                  With tools
                </th>
              </tr>
            </thead>
            <tbody>
              {MODEL_STATS.map((row) => (
                <tr
                  key={row.model}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="p-3 font-medium text-gray-900">
                    {MODEL_DISPLAY[row.model] ?? row.model}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${maeColor(row.mae_no_tools)}`}
                    >
                      ${row.mae_no_tools.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${maeColor(row.mae_with_tools)}`}
                    >
                      ${row.mae_with_tools.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${accuracyColor(row.pct_within_10_no_tools)}`}
                    >
                      {row.pct_within_10_no_tools}%
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${accuracyColor(row.pct_within_10_with_tools)}`}
                    >
                      {row.pct_within_10_with_tools}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
