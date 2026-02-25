import { useMemo } from "react";
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

function Badge({ children, variant }: { children: React.ReactNode; variant: "cyan" | "coral" | "amber" | "green" }) {
  const styles = {
    cyan: "text-cyan bg-cyan-soft border-cyan/20",
    coral: "text-coral bg-coral-soft border-coral/20",
    amber: "text-amber bg-amber-soft border-amber/20",
    green: "text-green bg-green-soft border-green/20",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase border ${styles[variant]}`}>
      {children}
    </span>
  );
}

function accColor(pct: number): "green" | "cyan" | "amber" | "coral" {
  if (pct >= 80) return "green";
  if (pct >= 65) return "cyan";
  if (pct >= 50) return "amber";
  return "coral";
}

export default function ModelLeaderboard({ data }: { data: BenchData }) {
  const noTools = useMemo(
    () =>
      data.modelStats
        .filter((m) => m.condition === "no_tools")
        .sort((a, b) => b.within10pct - a.within10pct),
    [data]
  );

  const withTools = useMemo(
    () =>
      data.modelStats.filter((m) => m.condition === "with_tools"),
    [data]
  );

  const withToolsMap = useMemo(() => {
    const map: Record<string, (typeof withTools)[0]> = {};
    for (const m of withTools) map[m.model] = m;
    return map;
  }, [withTools]);

  return (
    <div>
      <div className="eyebrow mb-3 animate-fade-up">Leaderboard</div>
      <h2
        className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-text tracking-tight animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        Model rankings
      </h2>
      <p
        className="text-text-secondary mt-3 max-w-xl leading-relaxed animate-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        Models ranked by share of predictions within 10% of ground truth.
        The "with tools" column shows results when models can call PolicyEngine.
      </p>

      <div className="mt-10 space-y-3">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-4 text-[10px] uppercase tracking-[0.14em] text-text-muted font-medium">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Model</div>
          <div className="col-span-2 text-right">Accuracy (alone)</div>
          <div className="col-span-2 text-right">MAE (alone)</div>
          <div className="col-span-2 text-right">Accuracy (tools)</div>
          <div className="col-span-2 text-right">MAE (tools)</div>
        </div>

        {noTools.map((m, i) => {
          const wt = withToolsMap[m.model];
          return (
            <div
              key={m.model}
              className="card card-hover grid grid-cols-12 gap-3 items-center px-4 py-4 animate-fade-up"
              style={{ animationDelay: `${240 + i * 80}ms` }}
            >
              {/* Rank */}
              <div className="col-span-1">
                <span className="text-text-muted font-[family-name:var(--font-mono)] text-sm">
                  {i + 1}
                </span>
              </div>

              {/* Model name */}
              <div className="col-span-3 flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MODEL_COLORS[m.model] || "#6c6c84" }}
                />
                <span className="text-text font-medium text-sm">
                  {MODEL_LABELS[m.model] || m.model}
                </span>
              </div>

              {/* No-tools accuracy */}
              <div className="col-span-2 text-right">
                <Badge variant={accColor(m.within10pct)}>
                  {m.within10pct.toFixed(1)}%
                </Badge>
              </div>

              {/* No-tools MAE */}
              <div className="col-span-2 text-right font-[family-name:var(--font-mono)] text-sm text-coral">
                ${Math.round(m.mae).toLocaleString()}
              </div>

              {/* With-tools accuracy */}
              <div className="col-span-2 text-right">
                {wt ? (
                  <Badge variant="green">
                    {wt.within10pct.toFixed(1)}%
                  </Badge>
                ) : (
                  <span className="text-text-muted text-xs">--</span>
                )}
              </div>

              {/* With-tools MAE */}
              <div className="col-span-2 text-right font-[family-name:var(--font-mono)] text-sm text-green">
                {wt ? `$${Math.round(wt.mae).toLocaleString()}` : "--"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary callout */}
      <div className="mt-8 card px-5 py-4 border-cyan/20 bg-cyan-soft/30 animate-fade-up" style={{ animationDelay: "600ms" }}>
        <p className="text-text-secondary text-sm leading-relaxed">
          <span className="text-cyan font-medium">Key finding:</span> The best model without tools
          ({MODEL_LABELS[noTools[0]?.model] || noTools[0]?.model}) achieves{" "}
          <span className="text-text font-[family-name:var(--font-mono)]">
            {noTools[0]?.within10pct.toFixed(1)}%
          </span>{" "}
          accuracy with an average error of{" "}
          <span className="text-text font-[family-name:var(--font-mono)]">
            ${Math.round(noTools[0]?.mae || 0).toLocaleString()}
          </span>
          . With PolicyEngine tools, all models achieve{" "}
          <span className="text-green font-[family-name:var(--font-mono)]">100% accuracy</span> and{" "}
          <span className="text-green font-[family-name:var(--font-mono)]">$0 error</span>.
        </p>
      </div>
    </div>
  );
}
