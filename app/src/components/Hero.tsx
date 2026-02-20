import {
  getOverallNoToolsAccuracy,
  getOverallWithToolsAccuracy,
  getOverallNoToolsMAE,
} from "../data";

function StatCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string;
  sublabel?: string;
  accent: "red" | "green" | "blue";
}) {
  const borderColor = {
    red: "border-accuracy-bad",
    green: "border-accuracy-good",
    blue: "border-pe-blue",
  }[accent];

  const textColor = {
    red: "text-accuracy-bad",
    green: "text-accuracy-good",
    blue: "text-pe-blue",
  }[accent];

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${borderColor}`}
    >
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-3xl font-bold mt-1 ${textColor}`}>{value}</p>
      {sublabel && <p className="text-sm text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}

export default function Hero() {
  const noToolsAcc = getOverallNoToolsAccuracy();
  const withToolsAcc = getOverallWithToolsAccuracy();
  const noToolsMAE = getOverallNoToolsMAE();

  return (
    <section className="bg-pe-dark text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight">PolicyBench</h1>
        <p className="text-xl text-blue-200 mt-4 max-w-3xl">
          AI models cannot accurately calculate US tax and benefit outcomes on
          their own, but with PolicyEngine tools they achieve near-perfect
          accuracy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <StatCard
            label="Accuracy without tools"
            value={`${noToolsAcc}%`}
            sublabel="within 10% of correct answer"
            accent="red"
          />
          <StatCard
            label="Accuracy with tools"
            value={`${withToolsAcc}%`}
            sublabel="within 10% of correct answer"
            accent="green"
          />
          <StatCard
            label="Avg. MAE without tools"
            value={`$${noToolsMAE.toLocaleString()}`}
            sublabel="mean absolute error"
            accent="red"
          />
          <StatCard
            label="MAE with tools"
            value="$0"
            sublabel="exact match every time"
            accent="green"
          />
        </div>
      </div>
    </section>
  );
}
