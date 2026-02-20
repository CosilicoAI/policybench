import Hero from "./components/Hero";
import ModelComparison from "./components/ModelComparison";
import ProgramBreakdown from "./components/ProgramBreakdown";
import ExampleScenarios from "./components/ExampleScenarios";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <ModelComparison />
      <ProgramBreakdown />
      <ExampleScenarios />

      <footer className="py-8 px-6 text-center text-sm text-gray-400 border-t border-gray-200">
        <p>
          PolicyBench is a benchmark by{" "}
          <a
            href="https://policyengine.org"
            className="text-pe-blue hover:underline"
          >
            PolicyEngine
          </a>
          . Results use mock data and will be updated with real benchmark runs.
        </p>
      </footer>
    </div>
  );
}
